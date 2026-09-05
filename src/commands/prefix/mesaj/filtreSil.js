const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Filtre = require('../../../database/models/Filtre');
const { filtreCacheTemizle } = require('../../../services/filtreService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filtre-sil')
        .setDescription('Yasaklı kelime listesinden bir kelimeyi kaldırır.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(o => o.setName('kelime').setDescription('Kaldırılacak kelime').setRequired(true)),
    kategori: 'mesajFiltreleme',

    async execute(client, interaction) {
        const kelime = interaction.options.getString('kelime').toLowerCase();

        await Filtre.findOneAndUpdate({ guildId: interaction.guild.id }, { $pull: { yasakliKelimeler: kelime } });
        filtreCacheTemizle(interaction.guild.id);

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Kelime Kaldırıldı`, aciklama: `**"${kelime}"** yasaklı kelime listesinden kaldırıldı.` })]
        });
    }
};
