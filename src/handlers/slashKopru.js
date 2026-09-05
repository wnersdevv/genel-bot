/**
 * src/handlers/slashKopru.js
 *
 * Slash komutlarını prefix komutu olarak da çalıştırabilmek için bir adaptör.
 * Alt komutlar (subcommand) da desteklenir: "/ticket kur" ≡ "!ticket kur".
 *
 * Böylece tek bir komut dosyası hem slash hem prefix olarak çalışır;
 * aynı mantık iki kez yazılmaz.
 */

const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');

const MENTION_TEMIZLE = /[<>@!#&]/g;
const idAyikla = (metin) => (metin ? metin.replace(MENTION_TEMIZLE, '') : null);

const ALT_KOMUT_TIPLERI = [
    ApplicationCommandOptionType.Subcommand,
    ApplicationCommandOptionType.SubcommandGroup
];

const altKomutMu = (o) => ALT_KOMUT_TIPLERI.includes(o.type);

/**
 * Argüman listesinden alt komutu (ve varsa alt komut grubunu) çözer.
 * Geriye çalıştırılacak option listesi ve kalan argümanlar döner.
 */
function altKomutCoz(veri, argumanlar) {
    const ustOptionlar = veri.options || [];
    if (!ustOptionlar.some(altKomutMu)) {
        return { optionlar: ustOptionlar, kalanlar: argumanlar, altKomut: null, altGrup: null };
    }

    const ilk = (argumanlar[0] || '').toLowerCase();
    const eslesen = ustOptionlar.find(o => o.name.toLowerCase() === ilk);

    if (!eslesen) {
        return { hata: 'altKomutGerekli', secenekler: ustOptionlar.map(o => o.name) };
    }

    // Alt komut grubu ise bir kademe daha in
    if (eslesen.type === ApplicationCommandOptionType.SubcommandGroup) {
        const ikinci = (argumanlar[1] || '').toLowerCase();
        const altEslesen = (eslesen.options || []).find(o => o.name.toLowerCase() === ikinci);

        if (!altEslesen) {
            return { hata: 'altKomutGerekli', secenekler: (eslesen.options || []).map(o => `${eslesen.name} ${o.name}`) };
        }

        return {
            optionlar: altEslesen.options || [],
            kalanlar: argumanlar.slice(2),
            altKomut: altEslesen.name,
            altGrup: eslesen.name
        };
    }

    return {
        optionlar: eslesen.options || [],
        kalanlar: argumanlar.slice(1),
        altKomut: eslesen.name,
        altGrup: null
    };
}

/**
 * Mesaj argümanlarını option tanımlarına göre sırayla eşleştirir.
 * Son STRING option kalan tüm kelimeleri toplar (sebep/mesaj gibi alanlar için).
 */
async function argumanlariAyristir(optionlar, message, argumanlar) {
    const degerler = new Map();
    let index = 0;

    for (let i = 0; i < optionlar.length; i++) {
        const option = optionlar[i];
        const sonStringMi = option.type === ApplicationCommandOptionType.String && i === optionlar.length - 1;

        let hamDeger;
        if (sonStringMi) {
            hamDeger = argumanlar.slice(index).join(' ') || null;
            index = argumanlar.length;
        } else {
            hamDeger = argumanlar[index] ?? null;
            if (hamDeger !== null) index++;
        }

        if (hamDeger === null || hamDeger === '') {
            degerler.set(option.name, null);
            continue;
        }

        switch (option.type) {
            case ApplicationCommandOptionType.User: {
                const id = idAyikla(hamDeger);
                const uye = message.mentions.members?.first()
                    || await message.guild.members.fetch(id).catch(() => null);
                degerler.set(option.name, uye ? { uye, kullanici: uye.user } : null);
                break;
            }
            case ApplicationCommandOptionType.Channel: {
                degerler.set(option.name, message.guild.channels.cache.get(idAyikla(hamDeger)) || null);
                break;
            }
            case ApplicationCommandOptionType.Role: {
                degerler.set(option.name, message.guild.roles.cache.get(idAyikla(hamDeger)) || null);
                break;
            }
            case ApplicationCommandOptionType.Integer:
            case ApplicationCommandOptionType.Number: {
                const sayi = Number(hamDeger);
                degerler.set(option.name, Number.isNaN(sayi) ? null : sayi);
                break;
            }
            case ApplicationCommandOptionType.Boolean: {
                degerler.set(option.name, ['evet', 'true', 'açık', 'acik', 'aktif', '1'].includes(hamDeger.toLowerCase()));
                break;
            }
            default:
                degerler.set(option.name, hamDeger);
        }
    }

    return degerler;
}

/** Slash komutunun beklediği `interaction.options` arayüzünü taklit eder. */
function optionsArayuzuOlustur(degerler, altKomut, altGrup) {
    const ham = (isim) => degerler.get(isim) ?? null;

    return {
        getSubcommand: (zorunlu = true) => {
            if (!altKomut && zorunlu) throw new Error('Alt komut bulunamadı.');
            return altKomut;
        },
        getSubcommandGroup: () => altGrup,
        getString: (isim) => {
            const d = ham(isim);
            return d === null || d === undefined ? null : String(d);
        },
        getInteger: (isim) => (typeof ham(isim) === 'number' ? Math.trunc(ham(isim)) : null),
        getNumber: (isim) => (typeof ham(isim) === 'number' ? ham(isim) : null),
        getBoolean: (isim) => (typeof ham(isim) === 'boolean' ? ham(isim) : null),
        getUser: (isim) => ham(isim)?.kullanici ?? null,
        getMember: (isim) => ham(isim)?.uye ?? null,
        getChannel: (isim) => ham(isim),
        getRole: (isim) => ham(isim),
        getFocused: () => ''
    };
}

/** Slash komutunun kullandığı interaction API'sini message üzerinden taklit eder. */
function sahteInteractionOlustur(client, message, komutIsmi, degerler, altKomut, altGrup) {
    let ilkYanit = null;
    let ertelendiMi = false;

    const icerikTemizle = (secenekler) => {
        if (typeof secenekler === 'string') return { content: secenekler };
        const { flags, ephemeral, fetchReply, ...kalan } = secenekler || {};
        return kalan;
    };

    return {
        client,
        guild: message.guild,
        guildId: message.guild.id,
        channel: message.channel,
        channelId: message.channel.id,
        member: message.member,
        user: message.author,
        commandName: komutIsmi,
        locale: 'tr',
        options: optionsArayuzuOlustur(degerler, altKomut, altGrup),
        replied: false,
        deferred: false,
        showModal: async () => {
            throw new Error('Modal yalnızca slash komutlarında kullanılabilir.');
        },

        async reply(secenekler) {
            this.replied = true;
            ilkYanit = await message.reply(icerikTemizle(secenekler));
            return ilkYanit;
        },
        async deferReply() {
            ertelendiMi = true;
            this.deferred = true;
            ilkYanit = await message.reply({ content: '⏳ İşleniyor...' });
            return ilkYanit;
        },
        async editReply(secenekler) {
            const veri = icerikTemizle(secenekler);
            if (ertelendiMi && veri.content === undefined) veri.content = null;
            if (ilkYanit) return ilkYanit.edit(veri);
            ilkYanit = await message.reply(veri);
            return ilkYanit;
        },
        async followUp(secenekler) {
            return message.channel.send(icerikTemizle(secenekler));
        },
        async fetchReply() {
            return ilkYanit;
        }
    };
}

/** Bir slash komutundan çalışabilir bir prefix komutu üretir. */
function prefixKomutuUret(slashKomut) {
    const veri = slashKomut.data.toJSON ? slashKomut.data.toJSON() : slashKomut.data;

    // Modal açan komutlar prefix ile çalışamaz (Discord kısıtı).
    if (slashKomut.modalKullanir) return null;

    return {
        isim: veri.name,
        kategori: slashKomut.kategori,
        cooldownSn: slashKomut.cooldownSn,
        koprudenUretildi: true,
        kaynakKomut: slashKomut,
        aciklama: veri.description,

        async execute(client, message, argumanlar) {
            if (veri.default_member_permissions) {
                const gerekli = new PermissionsBitField(BigInt(veri.default_member_permissions));
                if (!message.member.permissions.has(gerekli)) {
                    return message.reply('❌ Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz.');
                }
            }

            if (slashKomut.geliştiriciKomutu) {
                const ayarlar = require('../utils/ayarlar');
                if (!ayarlar.sistem.geliştiriciIdleri.includes(message.author.id)) {
                    return message.reply('❌ Bu komut yalnızca geliştiriciler tarafından kullanılabilir.');
                }
            }

            const cozum = altKomutCoz(veri, argumanlar);
            if (cozum.hata === 'altKomutGerekli') {
                return message.reply(
                    `❌ Bir alt komut belirtmelisiniz.\n**Kullanılabilir:** ${cozum.secenekler.map(s => `\`${s}\``).join(', ')}`
                );
            }

            const degerler = await argumanlariAyristir(cozum.optionlar, message, cozum.kalanlar);

            const eksikler = cozum.optionlar
                .filter(o => o.required && (degerler.get(o.name) === null || degerler.get(o.name) === undefined))
                .map(o => o.name);

            if (eksikler.length > 0) {
                const onEk = [veri.name, cozum.altGrup, cozum.altKomut].filter(Boolean).join(' ');
                const kullanim = cozum.optionlar.map(o => (o.required ? `<${o.name}>` : `[${o.name}]`)).join(' ');
                return message.reply(`❌ Eksik veya geçersiz bilgi: **${eksikler.join(', ')}**\nKullanım: \`${onEk} ${kullanim}\``);
            }

            const sahteInteraction = sahteInteractionOlustur(
                client, message, veri.name, degerler, cozum.altKomut, cozum.altGrup
            );
            await slashKomut.execute(client, sahteInteraction);
        }
    };
}

module.exports = { prefixKomutuUret };
