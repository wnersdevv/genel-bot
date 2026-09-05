const { SlashCommandBuilder } = require('discord.js');
const DogumGunu = require('../../../database/models/DogumGunu');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('doğum-günü-sil').setDescription('Kayıtlı doğum gününüzü siler.'),
    kategori: 'sosyal',

    async execute(client, interaction) {
        await DogumGunu.findOneAndDelete({ guildId: interaction.guild.id, kullaniciId: interaction.user.id });
        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Silindi`, aciklama: 'Doğum gününüz kayıtlardan silindi.' })], flags: 64 });
    }
};
