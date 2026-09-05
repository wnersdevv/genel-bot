const { SlashCommandBuilder } = require('discord.js');
const { botDurumuHesapla } = require('../../../dashboard/botDurumHesapla');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('health').setDescription('[Geliştirici] Botun sistem sağlığını gösterir.'),
    kategori: 'sistem',
    geliştiriciKomutu: true,

    async execute(client, interaction) {
        const d = botDurumuHesapla(client);
        const saat = Math.floor(d.uptimeSaniye / 3600);
        const dk = Math.floor((d.uptimeSaniye % 3600) / 60);

        await interaction.reply({
            embeds: [temelEmbed({
                tip: d.discordOnline && d.mongoBagliMi ? 'basari' : 'uyari',
                baslik: `${emojis.saglik} Sistem Sağlığı`,
                alanlar: [
                    { name: 'Discord API', value: `${d.discordOnline ? '🟢' : '🔴'} ${d.discordPing}ms`, inline: true },
                    { name: 'MongoDB', value: `${d.mongoBagliMi ? '🟢' : '🔴'} ${d.mongoDurum}`, inline: true },
                    { name: 'Dashboard', value: '🟢 Aktif', inline: true },
                    { name: 'Scheduler', value: '🟢 Aktif', inline: true },
                    { name: 'Sunucu Sayısı', value: `${d.guildSayisi}`, inline: true },
                    { name: 'Çalışma Süresi', value: `${saat}sa ${dk}dk`, inline: true },
                    { name: 'RAM Kullanımı', value: `${d.ramKullanimMB} MB / ${d.ramToplamMB} MB`, inline: true },
                    { name: 'Node.js', value: d.nodeVersiyon, inline: true },
                    { name: 'discord.js', value: `v${d.discordJsVersiyon}`, inline: true }
                ]
            })],
            flags: 64
        });
    }
};
