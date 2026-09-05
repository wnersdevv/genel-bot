const { SlashCommandBuilder } = require('discord.js');
const DogumGunu = require('../../../database/models/DogumGunu');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('doğum-günü-ayarla')
        .setDescription('Doğum gününüzü kaydeder.')
        .addIntegerOption(o => o.setName('gün').setDescription('Gün (1-31)').setRequired(true).setMinValue(1).setMaxValue(31))
        .addIntegerOption(o => o.setName('ay').setDescription('Ay (1-12)').setRequired(true).setMinValue(1).setMaxValue(12)),
    kategori: 'sosyal',

    async execute(client, interaction) {
        const gun = interaction.options.getInteger('gün');
        const ay = interaction.options.getInteger('ay');

        await DogumGunu.findOneAndUpdate(
            { guildId: interaction.guild.id, kullaniciId: interaction.user.id },
            { gun, ay },
            { upsert: true }
        );

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.dogumGunu} Doğum Günü Kaydedildi`, aciklama: `Doğum gününüz **${gun}/${ay}** olarak kaydedildi.` })],
            flags: 64
        });
    }
};
