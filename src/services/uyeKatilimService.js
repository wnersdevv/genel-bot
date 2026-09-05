const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Autorole = require('../database/models/Autorole');
const { welcomeAyariGetir, yerTutuculariDoldur } = require('./welcomeService');
const { hosgeldinKartiOlustur } = require('../canvas/hosgeldinKarti');
const logger = require('../utils/logger');

function renkKodu(hex, varsayilan = 0x5865F2) {
    if (typeof hex !== 'string') return varsayilan;
    const temiz = parseInt(hex.replace('#', ''), 16);
    return Number.isNaN(temiz) ? varsayilan : temiz;
}

/** Autorole kurallarını değerlendirip uygun rolleri verir. */
async function autoroleUygula(uye) {
    const ayar = await Autorole.findOne({ guildId: uye.guild.id });
    if (!ayar?.aktif || !ayar.kurallar.length) return;

    const hesapYasiGun = (Date.now() - uye.user.createdTimestamp) / 86_400_000;
    const botMu = uye.user.bot;

    for (const kural of ayar.kurallar) {
        const uygun =
            kural.tip === 'herkes' ||
            (kural.tip === 'bot' && botMu) ||
            (kural.tip === 'kullanici' && !botMu) ||
            (kural.tip === 'yeni-hesap' && !botMu && hesapYasiGun < kural.hesapYasiGun) ||
            (kural.tip === 'eski-hesap' && !botMu && hesapYasiGun >= kural.hesapYasiGun);

        if (!uygun) continue;

        const rol = uye.guild.roles.cache.get(kural.rolId);
        if (!rol || rol.position >= uye.guild.members.me.roles.highest.position) continue;

        const ver = () => uye.roles.add(rol).catch(hata =>
            logger.uyari('Autorole', `${uye.guild.id} — ${rol.name} rolü verilemedi: ${hata.message}`)
        );

        if (kural.gecikmeSaniye > 0) setTimeout(ver, kural.gecikmeSaniye * 1000);
        else await ver();
    }
}

/** Karşılama kanalına ve/veya DM'e hoş geldin mesajı gönderir. */
async function welcomeGonder(uye, testMi = false) {
    const ayar = await welcomeAyariGetir(uye.guild.id);

    if (ayar.kanal.aktif && ayar.kanal.kanalId) {
        const kanal = uye.guild.channels.cache.get(ayar.kanal.kanalId);

        if (kanal?.isTextBased()) {
            const icerik = yerTutuculariDoldur(ayar.kanal.mesaj, uye);
            const gonderim = {};

            if (ayar.kanal.kartKullan && ayar.kart.aktif) {
                try {
                    gonderim.files = [await hosgeldinKartiOlustur(uye, ayar.kart)];
                } catch (hata) {
                    logger.uyari('Welcome', `Kart üretilemedi (${uye.guild.id}): ${hata.message}`);
                }
            }

            if (ayar.kanal.embedKullan) {
                const embed = new EmbedBuilder()
                    .setColor(renkKodu(ayar.kanal.embedRengi))
                    .setDescription(icerik)
                    .setTimestamp();
                if (gonderim.files) embed.setImage('attachment://welcome.png');
                gonderim.embeds = [embed];
            } else {
                gonderim.content = icerik;
            }

            await kanal.send(gonderim).catch(hata =>
                logger.uyari('Welcome', `Mesaj gönderilemedi (${uye.guild.id}): ${hata.message}`)
            );
        }
    }

    if (ayar.dm.aktif && !uye.user.bot) {
        const icerik = yerTutuculariDoldur(ayar.dm.mesaj, uye);
        const gonderim = {};

        if (ayar.dm.embedKullan) {
            const embed = new EmbedBuilder()
                .setColor(renkKodu(ayar.dm.embedRengi))
                .setTitle(yerTutuculariDoldur(ayar.dm.baslik, uye) || null)
                .setDescription(icerik);
            if (ayar.dm.gorselUrl) embed.setImage(ayar.dm.gorselUrl);
            if (ayar.dm.altBilgi) embed.setFooter({ text: yerTutuculariDoldur(ayar.dm.altBilgi, uye) });
            gonderim.embeds = [embed];
        } else {
            gonderim.content = icerik;
        }

        if (ayar.dm.butonEtiketi && ayar.dm.butonUrl) {
            gonderim.components = [new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel(ayar.dm.butonEtiketi).setStyle(ButtonStyle.Link).setURL(ayar.dm.butonUrl)
            )];
        }

        // DM kapalıysa hata fırlatmak yerine sessizce loglanır
        await uye.send(gonderim).catch(() => {
            if (!testMi) logger.bilgi('Welcome', `${uye.user.tag} kullanıcısının DM'i kapalı (${uye.guild.id}).`);
        });
    }
}

/** Üye ayrıldığında ayrılış mesajı gönderir. */
async function ayrilisGonder(uye) {
    const ayar = await welcomeAyariGetir(uye.guild.id);
    if (!ayar.ayrilis.aktif || !ayar.ayrilis.kanalId) return;

    const kanal = uye.guild.channels.cache.get(ayar.ayrilis.kanalId);
    if (!kanal?.isTextBased()) return;

    const icerik = yerTutuculariDoldur(ayar.ayrilis.mesaj, uye);
    const gonderim = {};

    if (ayar.ayrilis.kartKullan && ayar.kart.aktif) {
        try {
            gonderim.files = [await hosgeldinKartiOlustur(uye, {
                ...ayar.kart.toObject?.() ?? ayar.kart,
                baslik: 'Güle Güle, {username}',
                altBaslik: '{serverName} — {memberCount} üye kaldı'
            })];
        } catch { /* kart üretilemezse mesajla devam */ }
    }

    if (ayar.ayrilis.embedKullan) {
        const embed = new EmbedBuilder().setColor(0xED4245).setDescription(icerik).setTimestamp();
        if (gonderim.files) embed.setImage('attachment://welcome.png');
        gonderim.embeds = [embed];
    } else {
        gonderim.content = icerik;
    }

    await kanal.send(gonderim).catch(() => {});
}

module.exports = { autoroleUygula, welcomeGonder, ayrilisGonder };
