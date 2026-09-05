const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mongoose = require('mongoose');
const { botDurumuHesapla } = require('../../../dashboard/botDurumHesapla');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');
const config = require('../../../utils/config');

function sureFormatla(saniye) {
    const gun = Math.floor(saniye / 86400);
    const saat = Math.floor((saniye % 86400) / 3600);
    const dakika = Math.floor((saniye % 3600) / 60);
    const parcalar = [];
    if (gun) parcalar.push(`${gun} gün`);
    if (saat) parcalar.push(`${saat} saat`);
    parcalar.push(`${dakika} dakika`);
    return parcalar.join(' ');
}

function bagliButonlari(clientId) {
    const satir = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('➕ Botu Davet Et').setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot%20applications.commands&permissions=8`)
    );

    if (config.dashboardUrl) {
        satir.addComponents(new ButtonBuilder().setLabel('🌐 Dashboard').setStyle(ButtonStyle.Link).setURL(config.dashboardUrl));
        satir.addComponents(new ButtonBuilder().setLabel('📜 Şartlar').setStyle(ButtonStyle.Link).setURL(`${config.dashboardUrl}/hizmet-sartlari`));
        satir.addComponents(new ButtonBuilder().setLabel('🔒 Gizlilik').setStyle(ButtonStyle.Link).setURL(`${config.dashboardUrl}/gizlilik`));
    }
    if (config.destekSunucusu) {
        satir.addComponents(new ButtonBuilder().setLabel('💬 Destek').setStyle(ButtonStyle.Link).setURL(config.destekSunucusu));
    }

    return satir;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Bot durumu, istatistikleri ve bağlantıları.')
        .addSubcommand(s => s.setName('ping').setDescription('Botun gecikme sürelerini gösterir.'))
        .addSubcommand(s => s.setName('durum').setDescription('Botun sistem servislerinin durumunu gösterir.'))
        .addSubcommand(s => s.setName('istatistik').setDescription('Botun genel istatistiklerini gösterir.'))
        .addSubcommand(s => s.setName('hakkında').setDescription('Bot hakkında bilgi ve bağlantılar.'))
        .addSubcommand(s => s.setName('davet').setDescription('Botun davet bağlantısını verir.')),
    aliaslar: ['ping', 'botinfo', 'status', 'stats', 'istatistik'],
    kategori: 'bilgi',
    cooldownSn: 5,

    async execute(client, interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'ping': return this.ping(client, interaction);
            case 'durum': return this.durum(client, interaction);
            case 'istatistik': return this.istatistik(client, interaction);
            case 'hakkında': return this.hakkinda(client, interaction);
            case 'davet': return this.davet(client, interaction);
        }
    },

    async ping(client, interaction) {
        const baslangic = Date.now();
        await interaction.reply({ content: `${emojis.saat} Ölçülüyor...` });
        const mesajGecikmesi = Date.now() - baslangic;

        const dbBaslangic = Date.now();
        let dbGecikmesi = null;
        try {
            await mongoose.connection.db.admin().ping();
            dbGecikmesi = Date.now() - dbBaslangic;
        } catch { /* bağlantı yoksa null kalır */ }

        const apiGecikmesi = Math.round(client.ws.ping);
        const durumIkonu = (ms) => (ms === null ? '🔴' : ms < 150 ? '🟢' : ms < 400 ? '🟡' : '🔴');

        await interaction.editReply({
            content: null,
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: '🏓 Pong!',
                alanlar: [
                    { name: 'Mesaj', value: `${durumIkonu(mesajGecikmesi)} ${mesajGecikmesi}ms`, inline: true },
                    { name: 'Discord API', value: `${durumIkonu(apiGecikmesi)} ${apiGecikmesi}ms`, inline: true },
                    { name: 'Veritabanı', value: dbGecikmesi === null ? '🔴 Bağlantı yok' : `${durumIkonu(dbGecikmesi)} ${dbGecikmesi}ms`, inline: true }
                ]
            })]
        });
    },

    async durum(client, interaction) {
        const d = botDurumuHesapla(client);

        await interaction.reply({
            embeds: [temelEmbed({
                tip: d.discordOnline && d.mongoBagliMi ? 'basari' : 'uyari',
                baslik: `${emojis.saglik} Sistem Durumu`,
                alanlar: [
                    { name: 'Discord API', value: `${d.discordOnline ? '🟢 Çevrimiçi' : '🔴 Bağlantı yok'} · ${d.discordPing}ms`, inline: true },
                    { name: 'Veritabanı', value: `${d.mongoBagliMi ? '🟢' : '🔴'} ${d.mongoDurum}`, inline: true },
                    { name: 'Dashboard', value: config.dashboardUrl ? '🟢 Aktif' : '⚪ Kapalı', inline: true },
                    { name: 'Zamanlayıcı', value: '🟢 Aktif', inline: true },
                    { name: 'Bellek', value: `${d.ramKullanimMB} / ${d.ramToplamMB} MB`, inline: true },
                    { name: 'Çalışma Süresi', value: sureFormatla(d.uptimeSaniye), inline: true }
                ]
            })]
        });
    },

    async istatistik(client, interaction) {
        const d = botDurumuHesapla(client);
        const kanalSayisi = client.channels.cache.size;

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.istatistik} Bot İstatistikleri`,
                alanlar: [
                    { name: '🌐 Sunucu', value: `${d.guildSayisi}`, inline: true },
                    { name: '👥 Kullanıcı', value: `${d.kullaniciSayisi.toLocaleString('tr-TR')}`, inline: true },
                    { name: '📢 Kanal', value: `${kanalSayisi}`, inline: true },
                    { name: '⚡ Slash Komut', value: `${d.slashKomutSayisi}`, inline: true },
                    { name: '⌨️ Prefix Komut', value: `${d.prefixKomutSayisi}`, inline: true },
                    { name: '⏱️ Çalışma Süresi', value: sureFormatla(d.uptimeSaniye), inline: true },
                    { name: '🧰 Node.js', value: d.nodeVersiyon, inline: true },
                    { name: '📚 discord.js', value: `v${d.discordJsVersiyon}`, inline: true },
                    { name: '💾 Bellek', value: `${d.ramKullanimMB} MB`, inline: true }
                ]
            })],
            components: [bagliButonlari(client.user.id)]
        });
    },

    async hakkinda(client, interaction) {
        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.bot} wnersdev Hakkında`,
                aciklama: 'Moderasyon, koruma, ticket, ekonomi, seviye, çekiliş ve daha fazlasını tek botta birleştiren, tamamen Türkçe bir Discord botu.',
                alanlar: [
                    { name: 'Sunucu Sayısı', value: `${client.guilds.cache.size}`, inline: true },
                    { name: 'Komut Sayısı', value: `${client.prefixKomutlari.size}`, inline: true },
                    { name: 'Dil Desteği', value: 'Türkçe · English', inline: true }
                ]
            }).setThumbnail(client.user.displayAvatarURL({ size: 256 }))],
            components: [bagliButonlari(client.user.id)]
        });
    },

    async davet(client, interaction) {
        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'basari',
                baslik: `${emojis.bot} Botu Sunucuna Ekle`,
                aciklama: 'Aşağıdaki butonu kullanarak botu kendi sunucuna davet edebilirsin.'
            })],
            components: [bagliButonlari(client.user.id)]
        });
    }
};
