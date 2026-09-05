const { MessageFlags } = require('discord.js');
const { panelKonteyneriOlustur } = require('../panelOlustur');

module.exports = {
    customId: 'panel:geri',
    async execute(client, interaction) {
        const konteyner = panelKonteyneriOlustur(interaction.guild.name);
        await interaction.update({ components: [konteyner], flags: MessageFlags.IsComponentsV2 });
    }
};
