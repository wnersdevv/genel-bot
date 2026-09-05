const { PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { onayKaydet } = require('../../services/sartOnayService');
const { auditYaz } = require('../../services/auditService');
const { temelEmbed } = require('../../utils/embedOlustur');
const { sartlarVersiyonu } = require('../../utils/sartlar');
const emojis = require('../../utils/emojis');
const config = require('../../utils/config');

module.exports = {
    customId: 'onboarding:kabul',
    async execute(client, interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkiniz Yok`, aciklama: 'Şartları yalnızca "Sunucuyu Yönet" yetkisine sahip kişiler kabul edebilir.' })],
                flags: 64
            });
        }

        await onayKaydet(interaction.guild.id, interaction.user.id, 'discord');

        auditYaz({
            guildId: interaction.guild.id,
            kullaniciId: interaction.user.id,
            kullaniciEtiketi: interaction.user.tag,
            islem: 'Hizmet şartları kabul edildi',
            kaynak: 'discord',
            yeniDeger: `v${sartlarVersiyonu}`
        });

        const satir = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('kurulum:baslat').setLabel('🧙 Kuruluma Başla').setStyle(ButtonStyle.Success)
        );

        if (config.dashboardUrl) {
            satir.addComponents(
                new ButtonBuilder().setLabel('🌐 Dashboard').setStyle(ButtonStyle.Link).setURL(`${config.dashboardUrl}/sunucu/${interaction.guild.id}`)
            );
        }

        await interaction.update({
            embeds: [temelEmbed({
                tip: 'basari',
                baslik: `${emojis.basari} Şartlar Kabul Edildi`,
                aciklama: `**${interaction.user.tag}** tarafından onaylandı. Tüm özellikler artık kullanılabilir.\n\nSunucunuzu yapılandırmak için kurulum sihirbazını başlatabilir veya \`/panel\` komutunu kullanabilirsiniz.`,
                alanlar: [{ name: 'Onaylanan Sürüm', value: `Hizmet Şartları v${sartlarVersiyonu}` }]
            })],
            components: [satir]
        });
    }
};
