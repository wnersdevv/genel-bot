const { SlashCommandBuilder } = require('discord.js');
const { sesAyarla } = require('../../../services/muzikService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ses')
        .setDescription('Müzik ses seviyesini ayarlar (0-200).')
        .addIntegerOption(o => o.setName('yüzde').setDescription('Ses yüzdesi').setMinValue(0).setMaxValue(200).setRequired(true)),
    kategori: 'müzik',
    async execute(client, interaction) {
        const yuzde = interaction.options.getInteger('yüzde');
        const basarili = sesAyarla(interaction.guild.id, yuzde);
        await interaction.reply({
            embeds: [temelEmbed({
                tip: basarili ? 'basari' : 'hata',
                baslik: basarili ? `${emojis.ses} Ses Ayarlandı` : `${emojis.hata} Aktif Bağlantı Yok`,
                aciklama: basarili ? `Ses seviyesi %${yuzde} olarak ayarlandı. (Bir sonraki şarkıda geçerli olur.)` : null
            })]
        });
    }
};
