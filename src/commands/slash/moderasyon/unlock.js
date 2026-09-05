const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Bu kanalın kilidini açar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    kategori: 'moderasyon',

    async execute(client, interaction) {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.kilitAcik} Kanal Kilidi Açıldı`, aciklama: 'Bu kanal artık herkes tarafından kullanılabilir.' })]
        });
    }
};
