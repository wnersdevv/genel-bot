const { SlashCommandBuilder } = require('discord.js');
const { karistir } = require('../../../services/muzikService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('kuyruk-karıştır').setDescription('Kuyruktaki şarkıları karıştırır.'),
    kategori: 'müzik',
    async execute(client, interaction) {
        const basarili = karistir(interaction.guild.id);
        await interaction.reply({
            embeds: [temelEmbed({
                tip: basarili ? 'basari' : 'hata',
                baslik: basarili ? `${emojis.karistir} Kuyruk Karıştırıldı` : `${emojis.hata} Aktif Bağlantı Yok`
            })]
        });
    }
};
