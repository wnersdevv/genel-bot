const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { panelKonteyneriOlustur } = require('../../../components/panelOlustur');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('wnersdev ana kontrol panelini açar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    kategori: 'sistem',
    cooldownSn: 5,

    async execute(client, interaction) {
        const konteyner = panelKonteyneriOlustur(interaction.guild.name);

        await interaction.reply({
            components: [konteyner],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
