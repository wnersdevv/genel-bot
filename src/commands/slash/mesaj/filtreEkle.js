const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Filtre = require('../../../database/models/Filtre');
const { filtreCacheTemizle } = require('../../../services/filtreService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filtre-ekle')
        .setDescription('Yasaklı kelime listesine yeni bir kelime ekler.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(o => o.setName('kelime').setDescription('Yasaklanacak kelime').setRequired(true)),
    kategori: 'mesajFiltreleme',

    async execute(client, interaction) {
        const kelime = interaction.options.getString('kelime').toLowerCase();

        const filtre = await Filtre.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { $addToSet: { yasakliKelimeler: kelime } },
            { upsert: true, new: true }
        );
        filtreCacheTemizle(interaction.guild.id);

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Kelime Eklendi`, aciklama: `**"${kelime}"** yasaklı kelime listesine eklendi.\nToplam: ${filtre.yasakliKelimeler.length} kelime.` })]
        });
    }
};
