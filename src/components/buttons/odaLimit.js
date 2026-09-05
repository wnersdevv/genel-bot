const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const OzelOda = require('../../database/models/OzelOda');
const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');

module.exports = {
    customId: 'oda:limit',
    async execute(client, interaction) {
        const kanalId = interaction.customId.split(':')[2];
        const oda = await OzelOda.findOne({ kanalId });

        if (!oda || oda.sahipId !== interaction.user.id) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkisiz`, aciklama: 'Bu işlemi yalnızca oda sahibi yapabilir.' })], flags: 64 });
        }

        const modal = new ModalBuilder()
            .setCustomId(`odaLimitModal:gonder:${kanalId}`)
            .setTitle('Kullanıcı Limiti Ayarla')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId('yeniLimit').setLabel('Yeni limit (0 = sınırsız)').setStyle(TextInputStyle.Short).setMaxLength(2).setRequired(true)
                )
            );

        await interaction.showModal(modal);
    }
};
