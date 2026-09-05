const { SlashCommandBuilder } = require('discord.js');
const Tag = require('../../../database/models/Tag');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Kayıtlı bir tag\'in içeriğini gösterir.')
        .addStringOption(o => o.setName('isim').setDescription('Tag ismi').setRequired(true)),
    kategori: 'sosyal',
    cooldownSn: 2,

    async execute(client, interaction) {
        const isim = interaction.options.getString('isim').toLowerCase();
        const tag = await Tag.findOneAndUpdate(
            { guildId: interaction.guild.id, isim },
            { $inc: { kullanimSayisi: 1 } },
            { new: true }
        );

        if (!tag) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Tag Bulunamadı`, aciklama: `**${isim}** isminde bir tag bulunamadı.` })],
                flags: 64
            });
        }

        await interaction.reply({ content: tag.icerik });
    }
};
