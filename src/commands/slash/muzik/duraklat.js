const { SlashCommandBuilder } = require('discord.js');
const { duraklat } = require('../../../services/muzikService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('duraklat').setDescription('Çalan şarkıyı duraklatır.'),
    kategori: 'müzik',
    async execute(client, interaction) {
        const basarili = duraklat(interaction.guild.id);
        await interaction.reply({
            embeds: [temelEmbed({
                tip: basarili ? 'basari' : 'hata',
                baslik: basarili ? `${emojis.duraklat} Duraklatıldı` : `${emojis.hata} Çalan Şarkı Yok`
            })]
        });
    }
};
