const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { korumaAyariGetir, korumaAyariGuncelle } = require('../../../services/korumaService');
const { guildAyariGuncelle } = require('../../../services/guildService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const durumIkonu = (b) => (b ? '🟢' : '🔴');

const ESIK_ALANLARI = {
    'kanal-silme': { alan: 'kanalSilme', etiket: 'Kanal silme' },
    'kanal-olusturma': { alan: 'kanalOlusturma', etiket: 'Kanal oluşturma' },
    'rol-silme': { alan: 'rolSilme', etiket: 'Rol silme' },
    'rol-olusturma': { alan: 'rolOlusturma', etiket: 'Rol oluşturma' },
    'ban': { alan: 'banAtma', etiket: 'Toplu yasaklama' },
    'kick': { alan: 'kickAtma', etiket: 'Toplu atma' },
    'webhook': { alan: 'webhook', etiket: 'Webhook oluşturma' },
    'yetki-yukseltme': { alan: 'yetkiYukseltme', etiket: 'Yetki yükseltme' }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('koruma')
        .setDescription('Anti-nuke, anti-raid ve güvenlik ayarlarını yönetir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(s => s.setName('durum').setDescription('Tüm koruma sistemlerinin durumunu gösterir.'))
        .addSubcommand(s => s.setName('aç-kapat').setDescription('Koruma sistemini tamamen açar veya kapatır.')
            .addBooleanOption(o => o.setName('aktif').setDescription('Açık mı olsun?').setRequired(true)))
        .addSubcommand(s => s.setName('log-kanalı').setDescription('Güvenlik olaylarının bildirileceği kanalı ayarlar.')
            .addChannelOption(o => o.setName('kanal').setDescription('Güvenlik log kanalı').addChannelTypes(ChannelType.GuildText).setRequired(true)))
        .addSubcommand(s => s.setName('anti-nuke').setDescription('Bir anti-nuke kuralını yapılandırır.')
            .addStringOption(o => o.setName('tür').setDescription('Kural türü').setRequired(true)
                .addChoices(...Object.entries(ESIK_ALANLARI).map(([v, d]) => ({ name: d.etiket, value: v }))))
            .addBooleanOption(o => o.setName('aktif').setDescription('Bu kural açık mı?').setRequired(true))
            .addIntegerOption(o => o.setName('limit').setDescription('Kaç işlemde tetiklensin').setMinValue(1).setMaxValue(50))
            .addIntegerOption(o => o.setName('süre').setDescription('Kaç saniyelik pencerede sayılsın').setMinValue(5).setMaxValue(300))
            .addStringOption(o => o.setName('ceza').setDescription('Uygulanacak ceza')
                .addChoices({ name: 'Rollerini al', value: 'rol-al' }, { name: 'Sunucudan at', value: 'kick' }, { name: 'Yasakla', value: 'ban' }, { name: 'Sadece logla', value: 'yok' })))
        .addSubcommand(s => s.setName('anti-raid').setDescription('Toplu katılım korumasını yapılandırır.')
            .addBooleanOption(o => o.setName('aktif').setDescription('Açık mı?').setRequired(true))
            .addIntegerOption(o => o.setName('limit').setDescription('Kaç katılımda raid sayılsın').setMinValue(3).setMaxValue(50))
            .addIntegerOption(o => o.setName('süre').setDescription('Kaç saniyelik pencerede').setMinValue(5).setMaxValue(300))
            .addIntegerOption(o => o.setName('hesap-yaşı').setDescription('Kaç günden yeni hesaplar şüpheli sayılsın').setMinValue(0).setMaxValue(90))
            .addStringOption(o => o.setName('eylem').setDescription('Şüpheli üyeye ne yapılsın')
                .addChoices({ name: 'Karantinaya al', value: 'karantina' }, { name: 'Sunucudan at', value: 'kick' }, { name: 'Yasakla', value: 'ban' }, { name: 'Sadece logla', value: 'yok' }))
            .addRoleOption(o => o.setName('karantina-rolü').setDescription('Karantina için kullanılacak rol')))
        .addSubcommand(s => s.setName('anti-bot').setDescription('İzinsiz bot eklenmesini engeller.')
            .addBooleanOption(o => o.setName('aktif').setDescription('Açık mı?').setRequired(true))
            .addStringOption(o => o.setName('ceza').setDescription('Eklenen bota ne yapılsın')
                .addChoices({ name: 'Sunucudan at', value: 'kick' }, { name: 'Yasakla', value: 'ban' })))
        .addSubcommand(s => s.setName('beyaz-liste').setDescription('Korumadan muaf kullanıcı veya rol ekler/çıkarır.')
            .addStringOption(o => o.setName('işlem').setDescription('Ekle veya çıkar').setRequired(true)
                .addChoices({ name: 'Ekle', value: 'ekle' }, { name: 'Çıkar', value: 'cikar' }, { name: 'Listele', value: 'listele' }))
            .addUserOption(o => o.setName('kullanıcı').setDescription('Muaf tutulacak kullanıcı'))
            .addRoleOption(o => o.setName('rol').setDescription('Muaf tutulacak rol'))),
    kategori: 'koruma',

    async execute(client, interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'durum': return this.durum(interaction);
            case 'aç-kapat': return this.acKapat(interaction);
            case 'log-kanalı': return this.logKanali(interaction);
            case 'anti-nuke': return this.antiNuke(interaction);
            case 'anti-raid': return this.antiRaid(interaction);
            case 'anti-bot': return this.antiBot(interaction);
            case 'beyaz-liste': return this.beyazListe(interaction);
        }
    },

    async durum(interaction) {
        const a = await korumaAyariGetir(interaction.guild.id);
        const kural = (k) => `${durumIkonu(k.aktif)} ${k.limit}/${k.pencereSn}sn → ${k.ceza}`;

        await interaction.reply({
            embeds: [temelEmbed({
                tip: a.aktif ? 'basari' : 'uyari',
                baslik: `${emojis.koruma} Koruma Sistemi`,
                aciklama: `**Ana durum:** ${a.aktif ? '🟢 Aktif' : '🔴 Kapalı'}\n` +
                    `**Güvenlik logu:** ${a.logKanaliId ? `<#${a.logKanaliId}>` : '⚠️ Ayarlanmamış'}\n` +
                    `**Lockdown:** ${a.lockdown.aktif ? '🔒 Aktif' : 'Kapalı'}`,
                alanlar: [
                    { name: 'Kanal silme', value: kural(a.kanalSilme), inline: true },
                    { name: 'Kanal oluşturma', value: kural(a.kanalOlusturma), inline: true },
                    { name: 'Rol silme', value: kural(a.rolSilme), inline: true },
                    { name: 'Rol oluşturma', value: kural(a.rolOlusturma), inline: true },
                    { name: 'Toplu ban', value: kural(a.banAtma), inline: true },
                    { name: 'Webhook', value: kural(a.webhook), inline: true },
                    { name: 'Yetki yükseltme', value: kural(a.yetkiYukseltme), inline: true },
                    { name: 'Anti-bot', value: `${durumIkonu(a.botEkleme.aktif)} ${a.botEkleme.ceza}`, inline: true },
                    { name: 'Anti-raid', value: `${durumIkonu(a.antiRaid.aktif)} ${a.antiRaid.katilimLimit}/${a.antiRaid.pencereSn}sn → ${a.antiRaid.eylem}`, inline: true },
                    { name: 'Beyaz liste', value: `${a.beyazListe.kullanicilar.length} kullanıcı · ${a.beyazListe.roller.length} rol` }
                ]
            })]
        });
    },

    async acKapat(interaction) {
        const aktif = interaction.options.getBoolean('aktif');
        await korumaAyariGuncelle(interaction.guild.id, { aktif });
        await guildAyariGuncelle(interaction.guild.id, { 'modüller.koruma': aktif });

        const a = await korumaAyariGetir(interaction.guild.id);
        const uyari = aktif && !a.logKanaliId
            ? '\n\n⚠️ Güvenlik log kanalı ayarlanmamış. `/koruma log-kanalı` ile ayarlayın.'
            : '';

        await interaction.reply({
            embeds: [temelEmbed({
                tip: aktif ? 'basari' : 'uyari',
                baslik: `${emojis.koruma} Koruma ${aktif ? 'Açıldı' : 'Kapatıldı'}`,
                aciklama: (aktif ? 'Anti-nuke ve anti-raid denetimleri artık aktif.' : 'Tüm koruma denetimleri durduruldu.') + uyari
            })]
        });
    },

    async logKanali(interaction) {
        const kanal = interaction.options.getChannel('kanal');
        await korumaAyariGuncelle(interaction.guild.id, { logKanaliId: kanal.id });

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Güvenlik Logu Ayarlandı`, aciklama: `Güvenlik olayları ${kanal} kanalına bildirilecek.` })]
        });
    },

    async antiNuke(interaction) {
        const tur = interaction.options.getString('tür');
        const { alan, etiket } = ESIK_ALANLARI[tur];

        const guncelleme = { [`${alan}.aktif`]: interaction.options.getBoolean('aktif') };
        const limit = interaction.options.getInteger('limit');
        const sure = interaction.options.getInteger('süre');
        const ceza = interaction.options.getString('ceza');

        if (limit !== null) guncelleme[`${alan}.limit`] = limit;
        if (sure !== null) guncelleme[`${alan}.pencereSn`] = sure;
        if (ceza) guncelleme[`${alan}.ceza`] = ceza;

        await korumaAyariGuncelle(interaction.guild.id, guncelleme);
        const a = await korumaAyariGetir(interaction.guild.id);

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'basari',
                baslik: `${emojis.antiNuke} ${etiket} Kuralı Güncellendi`,
                aciklama: `${durumIkonu(a[alan].aktif)} **${a[alan].pencereSn} saniyede ${a[alan].limit}** işlem → **${a[alan].ceza}**`
            })]
        });
    },

    async antiRaid(interaction) {
        const guncelleme = { 'antiRaid.aktif': interaction.options.getBoolean('aktif') };
        const limit = interaction.options.getInteger('limit');
        const sure = interaction.options.getInteger('süre');
        const hesapYasi = interaction.options.getInteger('hesap-yaşı');
        const eylem = interaction.options.getString('eylem');
        const rol = interaction.options.getRole('karantina-rolü');

        if (limit !== null) guncelleme['antiRaid.katilimLimit'] = limit;
        if (sure !== null) guncelleme['antiRaid.pencereSn'] = sure;
        if (hesapYasi !== null) guncelleme['antiRaid.hesapYasiGun'] = hesapYasi;
        if (eylem) guncelleme['antiRaid.eylem'] = eylem;

        if (rol) {
            if (rol.position >= interaction.guild.members.me.roles.highest.position) {
                return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Rol Çok Yüksek`, aciklama: 'Karantina rolü benim rolümden üstte olamaz.' })], flags: 64 });
            }
            guncelleme['antiRaid.karantinaRolId'] = rol.id;
        }

        await korumaAyariGuncelle(interaction.guild.id, guncelleme);
        const a = await korumaAyariGetir(interaction.guild.id);

        const uyari = a.antiRaid.eylem === 'karantina' && !a.antiRaid.karantinaRolId
            ? '\n\n⚠️ Karantina rolü seçilmemiş, bu eylem uygulanamaz.'
            : '';

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'basari',
                baslik: `${emojis.antiRaid} Anti-Raid Güncellendi`,
                aciklama: `${durumIkonu(a.antiRaid.aktif)} **${a.antiRaid.pencereSn} saniyede ${a.antiRaid.katilimLimit}** katılım → **${a.antiRaid.eylem}**\n` +
                    `${a.antiRaid.hesapYasiGun} günden yeni hesaplar şüpheli sayılır.${uyari}`
            })]
        });
    },

    async antiBot(interaction) {
        const guncelleme = { 'botEkleme.aktif': interaction.options.getBoolean('aktif') };
        const ceza = interaction.options.getString('ceza');
        if (ceza) guncelleme['botEkleme.ceza'] = ceza;

        await korumaAyariGuncelle(interaction.guild.id, guncelleme);
        const a = await korumaAyariGetir(interaction.guild.id);

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'basari',
                baslik: `${emojis.koruma} Anti-Bot Güncellendi`,
                aciklama: `${durumIkonu(a.botEkleme.aktif)} Beyaz listede olmayan botlar eklenirse: **${a.botEkleme.ceza}**`
            })]
        });
    },

    async beyazListe(interaction) {
        const islem = interaction.options.getString('işlem');
        const kullanici = interaction.options.getUser('kullanıcı');
        const rol = interaction.options.getRole('rol');
        const a = await korumaAyariGetir(interaction.guild.id);

        if (islem === 'listele') {
            return interaction.reply({
                embeds: [temelEmbed({
                    tip: 'bilgi',
                    baslik: `${emojis.koruma} Koruma Beyaz Listesi`,
                    alanlar: [
                        { name: 'Kullanıcılar', value: a.beyazListe.kullanicilar.map(id => `<@${id}>`).join(', ') || 'Yok' },
                        { name: 'Roller', value: a.beyazListe.roller.map(id => `<@&${id}>`).join(', ') || 'Yok' }
                    ],
                    aciklama: 'Sunucu sahibi ve bot her zaman muaftır.'
                })]
            });
        }

        if (!kullanici && !rol) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Eksik Bilgi`, aciklama: 'Bir kullanıcı veya rol belirtmelisiniz.' })], flags: 64 });
        }

        const Koruma = require('../../../database/models/Koruma');
        const operator = islem === 'ekle' ? '$addToSet' : '$pull';
        const guncelleme = {};

        if (kullanici) guncelleme['beyazListe.kullanicilar'] = kullanici.id;
        if (rol) guncelleme['beyazListe.roller'] = rol.id;

        await Koruma.findOneAndUpdate({ guildId: interaction.guild.id }, { [operator]: guncelleme }, { upsert: true });
        require('../../../services/korumaService').korumaCacheTemizle(interaction.guild.id);

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'basari',
                baslik: `${emojis.basari} Beyaz Liste Güncellendi`,
                aciklama: `${[kullanici, rol].filter(Boolean).join(' ')} ${islem === 'ekle' ? 'eklendi' : 'çıkarıldı'}.`
            })]
        });
    }
};
