const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { botYetkisiVarMi } = require('../../../services/permissionService');
const { guildAyariGetir } = require('../../../services/guildService');
const { moderasyonLogGonder } = require('../../../services/moderasyonLogService');
const { caseKaydet } = require('../../../services/caseService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sustur-kaldır')
        .setDescription('Bir kullanıcının susturmasını (timeout) erken kaldırır.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(o => o.setName('kullanıcı').setDescription('Susturması kaldırılacak kullanıcı').setRequired(true))
        .addStringOption(o => o.setName('sebep').setDescription('Sebep').setRequired(false)),
    kategori: 'moderasyon',

    async execute(client, interaction) {
        const hedefUye = interaction.options.getMember('kullanıcı');
        const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi';

        if (!hedefUye) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Kullanıcı Bulunamadı` })], flags: 64 });
        }
        if (!hedefUye.isCommunicationDisabled()) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.uyari} Susturulmamış`, aciklama: 'Bu kullanıcı zaten susturulmuş durumda değil.' })], flags: 64 });
        }
        if (!botYetkisiVarMi(interaction.guild, [PermissionFlagsBits.ModerateMembers])) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bot Yetkisi Yok` })], flags: 64 });
        }

        await hedefUye.timeout(null, sebep);
        const caseNo = await caseKaydet(interaction.guild.id, 'susturma-kaldırma', hedefUye.id, interaction.user.id, sebep);

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Susturma Kaldırıldı`, aciklama: `**${hedefUye.user.tag}** kullanıcısının susturması kaldırıldı.`, alanlar: [{ name: 'Case', value: `#${caseNo}` }] })]
        });

        const guildAyari = await guildAyariGetir(interaction.guild.id);
        await moderasyonLogGonder(interaction.guild, guildAyari, { tip: 'Susturma Kaldırıldı', kullanici: hedefUye.user, yetkili: interaction.user, sebep, caseNo });
    }
};
