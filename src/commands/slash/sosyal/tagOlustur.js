const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Tag = require('../../../database/models/Tag');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tag-oluştur')
        .setDescription('Yeni bir tag oluşturur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(o => o.setName('isim').setDescription('Tag ismi').setRequired(true).setMaxLength(32))
        .addStringOption(o => o.setName('içerik').setDescription('Tag içeriği').setRequired(true).setMaxLength(1900)),
    kategori: 'sosyal',

    async execute(client, interaction) {
        const isim = interaction.options.getString('isim').toLowerCase();
        const icerik = interaction.options.getString('içerik');

        const mevcut = await Tag.findOne({ guildId: interaction.guild.id, isim });
        if (mevcut) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Zaten Mevcut`, aciklama: `**${isim}** isminde bir tag zaten var.` })], flags: 64 });
        }

        await Tag.create({ guildId: interaction.guild.id, isim, icerik, olusturanId: interaction.user.id });

        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.tag} Tag Oluşturuldu`, aciklama: `**${isim}** tag'i oluşturuldu.` })] });
    }
};
