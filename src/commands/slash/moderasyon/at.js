const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { rolHiyerarsisiUygunMu, botYetkisiVarMi } = require('../../../services/permissionService');
const { guildAyariGetir } = require('../../../services/guildService');
const { moderasyonLogGonder } = require('../../../services/moderasyonLogService');
const { caseKaydet } = require('../../../services/caseService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('at')
        .setDescription('Bir kullanıcıyı sunucudan atar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(o => o.setName('kullanıcı').setDescription('Atılacak kullanıcı').setRequired(true))
        .addStringOption(o => o.setName('sebep').setDescription('Atma sebebi').setRequired(false)),
    kategori: 'moderasyon',

    async execute(client, interaction) {
        const hedefUye = interaction.options.getMember('kullanıcı');
        const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi';

        if (!hedefUye) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Kullanıcı Bulunamadı`, aciklama: 'Belirttiğiniz kullanıcı bu sunucuda bulunamadı.' })], flags: 64 });
        }
        if (!hedefUye.kickable) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} İşlem Yapılamıyor`, aciklama: 'Bu kullanıcıyı atamıyorum. Rol hiyerarşisini kontrol edin.' })], flags: 64 });
        }
        if (!rolHiyerarsisiUygunMu(interaction.member, hedefUye)) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetersiz Rütbe`, aciklama: 'Bu kullanıcıyı atmak için yeterli rol seviyesine sahip değilsiniz.' })], flags: 64 });
        }
        if (!botYetkisiVarMi(interaction.guild, [PermissionFlagsBits.KickMembers])) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bot Yetkisi Yok`, aciklama: '"Üyeleri At" yetkisine ihtiyacım var.' })], flags: 64 });
        }

        const kullaniciTag = hedefUye.user.tag;
        await hedefUye.send({
            embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.at} Sunucudan Atıldınız`, aciklama: `**${interaction.guild.name}** sunucusundan atıldınız.\n**Sebep:** ${sebep}` })]
        }).catch(() => {});

        await hedefUye.kick(sebep);
        const caseNo = await caseKaydet(interaction.guild.id, 'atma', hedefUye.id, interaction.user.id, sebep);

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.at} Kullanıcı Atıldı`, aciklama: `**${kullaniciTag}** sunucudan atıldı.`, alanlar: [{ name: 'Case', value: `#${caseNo}`, inline: true }, { name: 'Sebep', value: sebep, inline: true }] })]
        });

        const guildAyari = await guildAyariGetir(interaction.guild.id);
        await moderasyonLogGonder(interaction.guild, guildAyari, { tip: 'Atma', kullanici: hedefUye.user, yetkili: interaction.user, sebep, caseNo });
    }
};
