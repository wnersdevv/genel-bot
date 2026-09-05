const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Basvuru = require('../../../database/models/Basvuru');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('başvuru-görüntüle')
        .setDescription('Bir başvurunun detaylarını gösterir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(o => o.setName('başvuru-id').setDescription('Başvuru ID').setRequired(true)),
    kategori: 'sistem',

    async execute(client, interaction) {
        const basvuruId = interaction.options.getString('başvuru-id');
        const basvuru = await Basvuru.findOne({ _id: basvuruId, guildId: interaction.guild.id }).catch(() => null);

        if (!basvuru) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bulunamadı`, aciklama: 'Bu ID ile bir başvuru bulunamadı.' })], flags: 64 });
        }

        const satir = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`basvuru:kabul:${basvuru._id}`).setLabel('✅ Kabul Et').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`basvuru:reddet:${basvuru._id}`).setLabel('❌ Reddet').setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.oneri} Başvuru — ${basvuru.formIsmi}`,
                aciklama: `**Başvuran:** <@${basvuru.kullaniciId}>\n**Durum:** ${basvuru.durum}\n\n${basvuru.cevaplar.map(c => `**${c.soru}**\n${c.cevap}`).join('\n\n')}`
            })],
            components: basvuru.durum === 'bekliyor' ? [satir] : [],
            flags: 64
        });
    }
};
