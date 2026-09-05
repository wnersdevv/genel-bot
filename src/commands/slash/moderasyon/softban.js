const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { rolHiyerarsisiUygunMu, botYetkisiVarMi } = require('../../../services/permissionService');
const { onayTokenOlustur } = require('../../../services/onayService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('softban')
        .setDescription('Kullanıcıyı yasaklayıp mesajlarını temizledikten sonra yasağını kaldırır.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(o => o.setName('kullanıcı').setDescription('Softban uygulanacak kullanıcı').setRequired(true))
        .addIntegerOption(o => o.setName('mesaj-gün').setDescription('Kaç günlük mesaj silinsin (varsayılan 1)').setMinValue(0).setMaxValue(7).setRequired(false))
        .addStringOption(o => o.setName('sebep').setDescription('Softban sebebi').setRequired(false)),
    kategori: 'moderasyon',

    async execute(client, interaction) {
        const hedefUye = interaction.options.getMember('kullanıcı');
        const hedefKullanici = interaction.options.getUser('kullanıcı');
        const mesajGunSayisi = interaction.options.getInteger('mesaj-gün') ?? 1;
        const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi';

        if (hedefUye && !rolHiyerarsisiUygunMu(interaction.member, hedefUye)) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetersiz Rütbe` })], flags: 64 });
        }
        if (!botYetkisiVarMi(interaction.guild, [PermissionFlagsBits.BanMembers])) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bot Yetkisi Yok` })], flags: 64 });
        }

        const token = onayTokenOlustur('softban', {
            guildId: interaction.guild.id, kullaniciId: hedefKullanici.id, sebep, mesajGunSayisi, yetkiliId: interaction.user.id
        });

        const satir = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`onay:devam:${token}`).setLabel('✅ DEVAM ET').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`onay:iptal:${token}`).setLabel('❌ İPTAL').setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'uyari',
                baslik: `${emojis.yasakla} Softban Onayı Gerekiyor`,
                aciklama: `**${hedefKullanici.tag}** kullanıcısının son **${mesajGunSayisi} gün**lük mesajları silinip ardından yasağı kaldırılacak. Devam?`
            })],
            components: [satir],
            flags: 64
        });
    }
};
