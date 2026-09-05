const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Warn = require('../../../database/models/Warn');
const { caseKaydet } = require('../../../services/caseService');
const { guildAyariGetir } = require('../../../services/guildService');
const { moderasyonLogGonder } = require('../../../services/moderasyonLogService');
const { rolHiyerarsisiUygunMu } = require('../../../services/permissionService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');
const { guildYayinla } = require('../../../dashboard/soket');
const { cezaZinciriniUygula } = require('../../../services/cezaZinciriService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uyar')
        .setDescription('Bir kullanıcıyı uyarır.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(o => o.setName('kullanıcı').setDescription('Uyarılacak kullanıcı').setRequired(true))
        .addStringOption(o => o.setName('sebep').setDescription('Uyarı sebebi').setRequired(false)),
    kategori: 'moderasyon',

    async execute(client, interaction) {
        const hedefUye = interaction.options.getMember('kullanıcı');
        const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi';

        if (!hedefUye) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Kullanıcı Bulunamadı`, aciklama: 'Belirttiğiniz kullanıcı bu sunucuda bulunamadı.' })],
                flags: 64
            });
        }

        if (hedefUye.id === interaction.user.id) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz İşlem`, aciklama: 'Kendinizi uyaramazsınız.' })],
                flags: 64
            });
        }

        if (!rolHiyerarsisiUygunMu(interaction.member, hedefUye)) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetersiz Rütbe`, aciklama: 'Bu kullanıcıyı uyarmak için yeterli rol seviyesine sahip değilsiniz.' })],
                flags: 64
            });
        }

        const caseNo = await caseKaydet(interaction.guild.id, 'uyarı', hedefUye.id, interaction.user.id, sebep);
        await Warn.create({ guildId: interaction.guild.id, kullaniciId: hedefUye.id, yetkiliId: interaction.user.id, sebep, caseNo });

        const embed = temelEmbed({
            tip: 'basari',
            baslik: `${emojis.basari} Kullanıcı Uyarıldı`,
            aciklama: `**${hedefUye.user.tag}** kullanıcısı uyarıldı.`,
            alanlar: [
                { name: 'Case', value: `#${caseNo}`, inline: true },
                { name: 'Sebep', value: sebep, inline: true }
            ]
        });
        await interaction.reply({ embeds: [embed] });

        await hedefUye.send({
            embeds: [temelEmbed({
                tip: 'uyari',
                baslik: `${emojis.uyari} Uyarı Aldınız`,
                aciklama: `**${interaction.guild.name}** sunucusunda bir uyarı aldınız.\n**Sebep:** ${sebep}`
            })]
        }).catch(() => {});

        const guildAyari = await guildAyariGetir(interaction.guild.id);
        await moderasyonLogGonder(interaction.guild, guildAyari, {
            tip: 'Uyarı Verildi',
            kullanici: hedefUye.user,
            yetkili: interaction.user,
            sebep,
            caseNo
        });

        guildYayinla(interaction.guild.id, 'bildirim', {
            tip: 'uyarı',
            metin: `${hedefUye.user.tag} kullanıcısına uyarı verildi (#${caseNo})`,
            tarih: new Date()
        });

        const zincirSonucu = await cezaZinciriniUygula(interaction.guild, hedefUye, client);
        if (zincirSonucu) {
            await interaction.followUp({
                embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.moderasyon} Ceza Zinciri Uygulandı`, aciklama: zincirSonucu })]
            }).catch(() => {});
        }
    }
};
