const { SlashCommandBuilder } = require('discord.js');
const { kuyrukTemizle } = require('../../../services/muzikService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('kuyruk-sil').setDescription('Kuyruktaki tüm şarkıları siler (çalan şarkı etkilenmez).'),
    kategori: 'müzik',
    async execute(client, interaction) {
        const basarili = kuyrukTemizle(interaction.guild.id);
        await interaction.reply({
            embeds: [temelEmbed({
                tip: basarili ? 'basari' : 'hata',
                baslik: basarili ? `${emojis.temizle} Kuyruk Temizlendi` : `${emojis.hata} Aktif Bağlantı Yok`
            })]
        });
    }
};
