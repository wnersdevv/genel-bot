const { PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { onayReddet } = require('../../services/sartOnayService');
const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');

module.exports = {
    customId: 'onboarding:reddet',
    async execute(client, interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkiniz Yok`, aciklama: 'Bu kararı yalnızca "Sunucuyu Yönet" yetkisine sahip kişiler verebilir.' })],
                flags: 64
            });
        }

        await onayReddet(interaction.guild.id, interaction.user.id);

        await interaction.update({
            embeds: [temelEmbed({
                tip: 'uyari',
                baslik: `${emojis.uyari} Şartlar Reddedildi`,
                aciklama: 'Veri işleyen özellikler (moderasyon, koruma, ticket, loglama, seviye, ekonomi) devre dışı bırakıldı.\n\n' +
                    'Fikrinizi değiştirirseniz aşağıdaki butondan şartları tekrar inceleyip kabul edebilirsiniz. Botu sunucudan çıkarmak isterseniz üye listesinden kaldırmanız yeterlidir.'
            })],
            components: [new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('onboarding:sartlar').setLabel('📄 Şartları Görüntüle').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('onboarding:kabul').setLabel('✅ Kabul Ediyorum').setStyle(ButtonStyle.Success)
            )]
        });
    }
};
