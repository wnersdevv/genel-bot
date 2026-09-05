const { MessageFlags } = require('discord.js');
const { anaMenuOlustur } = require('../../commands/slash/sistem/yardim');
const { guildAyariGetir } = require('../../services/guildService');

module.exports = {
    customId: 'yardim:ana-menu',
    async execute(client, interaction) {
        const guildAyari = interaction.guild ? await guildAyariGetir(interaction.guild.id) : null;
        const prefix = guildAyari?.prefix || '!';
        await interaction.update({
            components: [anaMenuOlustur(client, prefix)],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
