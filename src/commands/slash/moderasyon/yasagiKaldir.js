const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { botYetkisiVarMi } = require('../../../services/permissionService');
const { guildAyariGetir } = require('../../../services/guildService');
const { moderasyonLogGonder } = require('../../../services/moderasyonLogService');
const { caseKaydet } = require('../../../services/caseService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yasağı-kaldır')
        .setDescription('Bir kullanıcının sunucu yasağını kaldırır.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(o => o.setName('kullanıcı-id').setDescription('Yasağı kaldırılacak kullanıcının ID\'si').setRequired(true))
        .addStringOption(o => o.setName('sebep').setDescription('Sebep').setRequired(false)),
    kategori: 'moderasyon',

    async execute(client, interaction) {
        const kullaniciId = interaction.options.getString('kullanıcı-id');
        const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi';

        if (!botYetkisiVarMi(interaction.guild, [PermissionFlagsBits.BanMembers])) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bot Yetkisi Yok` })], flags: 64 });
        }

        const yasakliMi = await interaction.guild.bans.fetch(kullaniciId).catch(() => null);
        if (!yasakliMi) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yasaklı Değil`, aciklama: 'Bu kullanıcı ID\'si için bir yasak kaydı bulunamadı.' })], flags: 64 });
        }

        await interaction.guild.members.unban(kullaniciId, sebep);
        const caseNo = await caseKaydet(interaction.guild.id, 'yasak-kaldırma', kullaniciId, interaction.user.id, sebep);

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Yasak Kaldırıldı`, aciklama: `**${yasakliMi.user.tag}** kullanıcısının yasağı kaldırıldı.`, alanlar: [{ name: 'Case', value: `#${caseNo}` }] })]
        });

        const guildAyari = await guildAyariGetir(interaction.guild.id);
        await moderasyonLogGonder(interaction.guild, guildAyari, { tip: 'Yasak Kaldırma', kullanici: yasakliMi.user, yetkili: interaction.user, sebep, caseNo });
    }
};
