const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { guildAyariGuncelle } = require('../../../services/guildService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('starboard-kapat')
        .setDescription('Starboard sistemini kapatır.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    kategori: 'sistem',

    async execute(client, interaction) {
        await guildAyariGuncelle(interaction.guild.id, { 'modüller.starboard': false });
        await interaction.reply({ embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.starboard} Starboard Kapatıldı`, aciklama: 'Starboard sistemi artık pasif.' })] });
    }
};
