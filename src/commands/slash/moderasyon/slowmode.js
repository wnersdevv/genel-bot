const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Bu kanal için yavaş mod (slowmode) süresini ayarlar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addIntegerOption(o => o.setName('saniye').setDescription('Saniye cinsinden süre (0 = kapalı, maks. 21600)').setMinValue(0).setMaxValue(21600).setRequired(true)),
    kategori: 'moderasyon',

    async execute(client, interaction) {
        const saniye = interaction.options.getInteger('saniye');
        await interaction.channel.setRateLimitPerUser(saniye);

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'basari',
                baslik: `${emojis.saat} Slowmode Ayarlandı`,
                aciklama: saniye === 0 ? 'Bu kanalda yavaş mod kapatıldı.' : `Bu kanalda yavaş mod **${saniye} saniye** olarak ayarlandı.`
            })]
        });
    }
};
