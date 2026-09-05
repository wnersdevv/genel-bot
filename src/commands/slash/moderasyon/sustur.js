const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');
const { rolHiyerarsisiUygunMu, botYetkisiVarMi } = require('../../../services/permissionService');
const { guildAyariGetir } = require('../../../services/guildService');
const { moderasyonLogGonder } = require('../../../services/moderasyonLogService');
const { caseKaydet } = require('../../../services/caseService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const MAKSIMUM_SURE_MS = 28 * 24 * 60 * 60 * 1000; // Discord limiti: 28 gün

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sustur')
        .setDescription('Bir kullanıcıyı belirtilen süre boyunca susturur (timeout).')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(o => o.setName('kullanıcı').setDescription('Susturulacak kullanıcı').setRequired(true))
        .addStringOption(o => o.setName('süre').setDescription('Örn: 10m, 1h, 1d').setRequired(true))
        .addStringOption(o => o.setName('sebep').setDescription('Susturma sebebi').setRequired(false)),
    kategori: 'moderasyon',

    async execute(client, interaction) {
        const hedefUye = interaction.options.getMember('kullanıcı');
        const sureMetni = interaction.options.getString('süre');
        const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
        const sureMs = ms(sureMetni);

        if (!hedefUye) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Kullanıcı Bulunamadı`, aciklama: 'Belirttiğiniz kullanıcı bu sunucuda bulunamadı.' })], flags: 64 });
        }
        if (!sureMs || sureMs <= 0) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz Süre`, aciklama: 'Süreyi `10m`, `1h`, `1d` gibi bir formatta girin.' })], flags: 64 });
        }
        if (sureMs > MAKSIMUM_SURE_MS) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Süre Çok Uzun`, aciklama: 'Discord, en fazla 28 günlük susturmaya izin verir.' })], flags: 64 });
        }
        if (!rolHiyerarsisiUygunMu(interaction.member, hedefUye)) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetersiz Rütbe`, aciklama: 'Bu kullanıcıyı susturmak için yeterli rol seviyesine sahip değilsiniz.' })], flags: 64 });
        }
        if (!botYetkisiVarMi(interaction.guild, [PermissionFlagsBits.ModerateMembers])) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bot Yetkisi Yok`, aciklama: 'Susturma işlemi için "Üyeleri Zaman Aşımına Uğrat" yetkisine ihtiyacım var.' })], flags: 64 });
        }

        await hedefUye.timeout(sureMs, sebep);
        const caseNo = await caseKaydet(interaction.guild.id, 'susturma', hedefUye.id, interaction.user.id, sebep, sureMetni);

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'basari',
                baslik: `${emojis.sustur} Kullanıcı Susturuldu`,
                aciklama: `**${hedefUye.user.tag}** kullanıcısı **${sureMetni}** boyunca susturuldu.`,
                alanlar: [{ name: 'Case', value: `#${caseNo}`, inline: true }, { name: 'Sebep', value: sebep, inline: true }]
            })]
        });

        const guildAyari = await guildAyariGetir(interaction.guild.id);
        await moderasyonLogGonder(interaction.guild, guildAyari, {
            tip: 'Susturma',
            kullanici: hedefUye.user,
            yetkili: interaction.user,
            sebep,
            ekstra: [{ name: 'Süre', value: sureMetni, inline: true }]
        });
    }
};
