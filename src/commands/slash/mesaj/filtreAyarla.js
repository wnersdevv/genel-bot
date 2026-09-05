const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Filtre = require('../../../database/models/Filtre');
const { filtreCacheTemizle } = require('../../../services/filtreService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filtre-ayarla')
        .setDescription('Link, davet ve caps filtrelerini açar/kapatır.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(o => o.setName('tür').setDescription('Ayarlanacak filtre türü').setRequired(true)
            .addChoices(
                { name: 'Link Engeli', value: 'linkEngelle' },
                { name: 'Discord Daveti Engeli', value: 'davetEngelle' },
                { name: 'Caps (Büyük Harf) Engeli', value: 'capsEngelle' }
            ))
        .addStringOption(o => o.setName('durum').setDescription('Açık ya da kapalı').setRequired(true)
            .addChoices({ name: 'Açık', value: 'acik' }, { name: 'Kapalı', value: 'kapali' })),
    kategori: 'mesajFiltreleme',

    async execute(client, interaction) {
        const tur = interaction.options.getString('tür');
        const durum = interaction.options.getString('durum') === 'acik';

        await Filtre.findOneAndUpdate({ guildId: interaction.guild.id }, { [tur]: durum }, { upsert: true });
        filtreCacheTemizle(interaction.guild.id);

        await interaction.reply({
            embeds: [temelEmbed({ tip: durum ? 'basari' : 'uyari', baslik: `${emojis.basari} Filtre Güncellendi`, aciklama: `Bu filtre artık **${durum ? 'açık' : 'kapalı'}**.` })]
        });
    }
};
