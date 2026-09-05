const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Tag = require('../../../database/models/Tag');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tag-sil')
        .setDescription('Bir tag\'i siler.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(o => o.setName('isim').setDescription('Silinecek tag ismi').setRequired(true)),
    kategori: 'sosyal',

    async execute(client, interaction) {
        const isim = interaction.options.getString('isim').toLowerCase();
        const silinen = await Tag.findOneAndDelete({ guildId: interaction.guild.id, isim });

        if (!silinen) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bulunamadı`, aciklama: `**${isim}** isminde bir tag bulunamadı.` })], flags: 64 });
        }

        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Tag Silindi`, aciklama: `**${isim}** tag'i silindi.` })] });
    }
};
