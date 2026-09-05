const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { welcomeAyariGetir, welcomeAyariGuncelle, YER_TUTUCULAR } = require('../../../services/welcomeService');
const { welcomeGonder, ayrilisGonder } = require('../../../services/uyeKatilimService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');
const config = require('../../../utils/config');

const durum = (b) => (b ? '🟢 Açık' : '🔴 Kapalı');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Karşılama, DM karşılama ve ayrılış sistemini yönetir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(s => s.setName('durum').setDescription('Mevcut karşılama ayarlarını gösterir.'))
        .addSubcommand(s => s.setName('kanal').setDescription('Karşılama kanalını ve mesajını ayarlar.')
            .addChannelOption(o => o.setName('kanal').setDescription('Karşılama kanalı').addChannelTypes(ChannelType.GuildText).setRequired(true))
            .addStringOption(o => o.setName('mesaj').setDescription('Karşılama mesajı (yer tutucular desteklenir)')))
        .addSubcommand(s => s.setName('kapat').setDescription('Bir karşılama sistemini kapatır.')
            .addStringOption(o => o.setName('sistem').setDescription('Kapatılacak sistem').setRequired(true)
                .addChoices({ name: 'Kanal', value: 'kanal' }, { name: 'DM', value: 'dm' }, { name: 'Ayrılış', value: 'ayrilis' })))
        .addSubcommand(s => s.setName('dm').setDescription('DM karşılama mesajını ayarlar.')
            .addStringOption(o => o.setName('mesaj').setDescription('DM mesajı').setRequired(true))
            .addStringOption(o => o.setName('başlık').setDescription('Embed başlığı')))
        .addSubcommand(s => s.setName('ayrılış').setDescription('Ayrılış kanalını ve mesajını ayarlar.')
            .addChannelOption(o => o.setName('kanal').setDescription('Ayrılış kanalı').addChannelTypes(ChannelType.GuildText).setRequired(true))
            .addStringOption(o => o.setName('mesaj').setDescription('Ayrılış mesajı')))
        .addSubcommand(s => s.setName('kart').setDescription('Karşılama kartını özelleştirir.')
            .addBooleanOption(o => o.setName('aktif').setDescription('Kart kullanılsın mı?'))
            .addStringOption(o => o.setName('başlık').setDescription('Kart başlığı'))
            .addStringOption(o => o.setName('alt-başlık').setDescription('Kart alt başlığı'))
            .addStringOption(o => o.setName('arka-plan-rengi').setDescription('Hex renk, örn: #1e1f3b'))
            .addStringOption(o => o.setName('arka-plan-resmi').setDescription('Arka plan görsel URL\'si')))
        .addSubcommand(s => s.setName('test').setDescription('Karşılama sistemini kendiniz üzerinde test eder.'))
        .addSubcommand(s => s.setName('değişkenler').setDescription('Kullanılabilir yer tutucuları listeler.')),
    kategori: 'hoşgeldin',

    async execute(client, interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'durum': return this.durumGoster(interaction);
            case 'kanal': return this.kanalAyarla(interaction);
            case 'kapat': return this.kapat(interaction);
            case 'dm': return this.dmAyarla(interaction);
            case 'ayrılış': return this.ayrilisAyarla(interaction);
            case 'kart': return this.kartAyarla(interaction);
            case 'test': return this.test(interaction);
            case 'değişkenler': return this.degiskenler(interaction);
        }
    },

    async durumGoster(interaction) {
        const a = await welcomeAyariGetir(interaction.guild.id);

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.hosgeldin} Karşılama Ayarları`,
                alanlar: [
                    { name: 'Kanal Karşılama', value: `${durum(a.kanal.aktif)}\n${a.kanal.kanalId ? `<#${a.kanal.kanalId}>` : 'Kanal seçilmemiş'}`, inline: true },
                    { name: 'DM Karşılama', value: durum(a.dm.aktif), inline: true },
                    { name: 'Ayrılış', value: `${durum(a.ayrilis.aktif)}\n${a.ayrilis.kanalId ? `<#${a.ayrilis.kanalId}>` : 'Kanal seçilmemiş'}`, inline: true },
                    { name: 'Görsel Kart', value: durum(a.kart.aktif && a.kanal.kartKullan), inline: true },
                    { name: 'Kanal Mesajı', value: `\`\`\`${a.kanal.mesaj.slice(0, 200)}\`\`\`` }
                ],
                aciklama: config.dashboardUrl ? `Tüm ayarlar ve canlı önizleme: ${config.dashboardUrl}/sunucu/${interaction.guild.id}/welcome` : null
            })]
        });
    },

    async kanalAyarla(interaction) {
        const kanal = interaction.options.getChannel('kanal');
        const mesaj = interaction.options.getString('mesaj');

        const guncelleme = { 'kanal.aktif': true, 'kanal.kanalId': kanal.id };
        if (mesaj) guncelleme['kanal.mesaj'] = mesaj;

        await welcomeAyariGuncelle(interaction.guild.id, guncelleme);

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Karşılama Ayarlandı`, aciklama: `Yeni üyeler ${kanal} kanalında karşılanacak.` })]
        });
    },

    async kapat(interaction) {
        const sistem = interaction.options.getString('sistem');
        const anahtar = { kanal: 'kanal.aktif', dm: 'dm.aktif', ayrilis: 'ayrilis.aktif' }[sistem];
        const etiket = { kanal: 'Kanal karşılama', dm: 'DM karşılama', ayrilis: 'Ayrılış mesajı' }[sistem];

        await welcomeAyariGuncelle(interaction.guild.id, { [anahtar]: false });

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.uyari} Kapatıldı`, aciklama: `**${etiket}** devre dışı bırakıldı.` })]
        });
    },

    async dmAyarla(interaction) {
        const guncelleme = { 'dm.aktif': true, 'dm.mesaj': interaction.options.getString('mesaj') };
        const baslik = interaction.options.getString('başlık');
        if (baslik) guncelleme['dm.baslik'] = baslik;

        await welcomeAyariGuncelle(interaction.guild.id, guncelleme);

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} DM Karşılama Ayarlandı`, aciklama: 'Yeni üyelere özel mesaj gönderilecek. DM\'i kapalı olan kullanıcılarda işlem sessizce atlanır.' })]
        });
    },

    async ayrilisAyarla(interaction) {
        const kanal = interaction.options.getChannel('kanal');
        const mesaj = interaction.options.getString('mesaj');

        const guncelleme = { 'ayrilis.aktif': true, 'ayrilis.kanalId': kanal.id };
        if (mesaj) guncelleme['ayrilis.mesaj'] = mesaj;

        await welcomeAyariGuncelle(interaction.guild.id, guncelleme);

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Ayrılış Ayarlandı`, aciklama: `Ayrılan üyeler ${kanal} kanalında duyurulacak.` })]
        });
    },

    async kartAyarla(interaction) {
        const guncelleme = {};
        const aktif = interaction.options.getBoolean('aktif');
        const baslik = interaction.options.getString('başlık');
        const altBaslik = interaction.options.getString('alt-başlık');
        const arkaPlan = interaction.options.getString('arka-plan-rengi');
        const resim = interaction.options.getString('arka-plan-resmi');

        if (aktif !== null) guncelleme['kart.aktif'] = aktif;
        if (baslik) guncelleme['kart.baslik'] = baslik;
        if (altBaslik) guncelleme['kart.altBaslik'] = altBaslik;

        if (arkaPlan) {
            if (!/^#[0-9A-Fa-f]{6}$/.test(arkaPlan)) {
                return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz Renk`, aciklama: 'Hex formatında girin, örn: `#1e1f3b`' })], flags: 64 });
            }
            guncelleme['kart.arkaPlanRengi'] = arkaPlan;
        }

        if (resim) {
            if (!/^https:\/\/.+\.(png|jpe?g|webp)(\?.*)?$/i.test(resim)) {
                return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz Görsel`, aciklama: 'https ile başlayan bir png/jpg/webp bağlantısı girin.' })], flags: 64 });
            }
            guncelleme['kart.arkaPlanResmi'] = resim;
        }

        if (!Object.keys(guncelleme).length) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.uyari} Değişiklik Yok`, aciklama: 'En az bir seçenek girmelisiniz.' })], flags: 64 });
        }

        await welcomeAyariGuncelle(interaction.guild.id, guncelleme);

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Kart Güncellendi`, aciklama: 'Önizleme için `/welcome test` kullanabilirsiniz.' })]
        });
    },

    async test(interaction) {
        await interaction.deferReply({ flags: 64 });
        await welcomeGonder(interaction.member, true);
        await ayrilisGonder(interaction.member).catch(() => {});

        await interaction.editReply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Test Gönderildi`, aciklama: 'Aktif olan karşılama sistemleri kendiniz üzerinde çalıştırıldı.' })]
        });
    },

    async degiskenler(interaction) {
        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: '🔤 Kullanılabilir Değişkenler',
                aciklama: YER_TUTUCULAR.map(y => `\`${y}\``).join(' · '),
                alanlar: [{ name: 'Örnek', value: '```Hoş geldin {user}! {serverName} sunucusunun {memberCount}. üyesisin.```' }]
            })],
            flags: 64
        });
    }
};
