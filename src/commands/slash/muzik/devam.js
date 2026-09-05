const { SlashCommandBuilder } = require('discord.js');
const { devamEt } = require('../../../services/muzikService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('devam').setDescription('Duraklatılan şarkıyı devam ettirir.'),
    kategori: 'müzik',
    async execute(client, interaction) {
        const basarili = devamEt(interaction.guild.id);
        await interaction.reply({
            embeds: [temelEmbed({
                tip: basarili ? 'basari' : 'hata',
                baslik: basarili ? `${emojis.devam} Devam Ediyor` : `${emojis.hata} Duraklatılmış Şarkı Yok`
            })]
        });
    }
};
