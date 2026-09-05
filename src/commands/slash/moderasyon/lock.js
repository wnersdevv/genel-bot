const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Bu kanalı @everyone için kilitler (mesaj gönderemez).')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption(o => o.setName('sebep').setDescription('Kilitleme sebebi').setRequired(false)),
    kategori: 'moderasyon',

    async execute(client, interaction) {
        const sebep = interaction.options.getString('sebep');

        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'uyari',
                baslik: `${emojis.kilit} Kanal Kilitlendi`,
                aciklama: `Bu kanal artık @everyone için kilitli.${sebep ? `\n**Sebep:** ${sebep}` : ''}`
            })]
        });
    }
};
