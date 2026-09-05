const { SlashCommandBuilder } = require('discord.js');
const { gec } = require('../../../services/muzikService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('geç').setDescription('Şu anki şarkıyı geçer.'),
    kategori: 'müzik',
    async execute(client, interaction) {
        const basarili = gec(interaction.guild.id);
        await interaction.reply({
            embeds: [temelEmbed({
                tip: basarili ? 'basari' : 'hata',
                baslik: basarili ? `${emojis.gec} Şarkı Geçildi` : `${emojis.hata} Çalan Şarkı Yok`
            })]
        });
    }
};
