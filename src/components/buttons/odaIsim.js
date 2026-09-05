const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const OzelOda = require('../../database/models/OzelOda');
const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');

module.exports = {
    customId: 'oda:isim',
    async execute(client, interaction) {
        const kanalId = interaction.customId.split(':')[2];
        const oda = await OzelOda.findOne({ kanalId });

        if (!oda || oda.sahipId !== interaction.user.id) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkisiz`, aciklama: 'Bu işlemi yalnızca oda sahibi yapabilir.' })], flags: 64 });
        }

        const modal = new ModalBuilder()
            .setCustomId(`odaIsimModal:gonder:${kanalId}`)
            .setTitle('Oda İsmini Değiştir')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('yeniIsim').setLabel('Yeni oda ismi').setStyle(TextInputStyle.Short).setMaxLength(90).setRequired(true)
                )
            );

        await interaction.showModal(modal);
    }
};
