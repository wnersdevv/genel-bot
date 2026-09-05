const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { rolHiyerarsisiUygunMu, botYetkisiVarMi } = require('../../../services/permissionService');
const { onayTokenOlustur } = require('../../../services/onayService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yasakla')
        .setDescription('Bir kullanıcıyı sunucudan yasaklar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(o => o.setName('kullanıcı').setDescription('Yasaklanacak kullanıcı').setRequired(true))
        .addStringOption(o => o.setName('sebep').setDescription('Yasaklama sebebi').setRequired(false)),
    kategori: 'moderasyon',

    async execute(client, interaction) {
        const hedefUye = interaction.options.getMember('kullanıcı');
        const hedefKullanici = interaction.options.getUser('kullanıcı');
        const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi';

        if (hedefUye) {
            if (!rolHiyerarsisiUygunMu(interaction.member, hedefUye)) {
                return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetersiz Rütbe`, aciklama: 'Bu kullanıcıyı yasaklamak için yeterli rol seviyesine sahip değilsiniz.' })], flags: 64 });
            }
        }
        if (!botYetkisiVarMi(interaction.guild, [PermissionFlagsBits.BanMembers])) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bot Yetkisi Yok`, aciklama: '"Üyeleri Yasakla" yetkisine ihtiyacım var.' })], flags: 64 });
        }

        const token = onayTokenOlustur('yasakla', { guildId: interaction.guild.id, kullaniciId: hedefKullanici.id, sebep, yetkiliId: interaction.user.id });

        const satir = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`onay:devam:${token}`).setLabel('✅ DEVAM ET').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`onay:iptal:${token}`).setLabel('❌ İPTAL').setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'uyari',
                baslik: `${emojis.yasakla} Yasaklama Onayı Gerekiyor`,
                aciklama: `**${hedefKullanici.tag}** kullanıcısını yasaklamak üzeresiniz. Bu işlem geri alınamaz.\n**Sebep:** ${sebep}`
            })],
            components: [satir],
            flags: 64
        });
    }
};
