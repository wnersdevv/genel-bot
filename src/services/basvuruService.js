const { PermissionFlagsBits } = require('discord.js');
const Basvuru = require('../database/models/Basvuru');
const { temelEmbed } = require('../utils/embedOlustur');
const emojis = require('../utils/emojis');

async function basvuruDurumGuncelle(client, interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkisiz` })], flags: 64 });
    }

    const [, aksiyon, basvuruId] = interaction.customId.split(':');
    const durum = aksiyon === 'kabul' ? 'kabul' : 'reddedildi';

    const basvuru = await Basvuru.findByIdAndUpdate(basvuruId, { durum }, { new: true });
    if (!basvuru) {
        return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bulunamadı` })], flags: 64 });
    }

    const kullanici = await client.users.fetch(basvuru.kullaniciId).catch(() => null);
    kullanici?.send({
        embeds: [temelEmbed({
            tip: durum === 'kabul' ? 'basari' : 'hata',
            baslik: `${durum === 'kabul' ? emojis.kabul : emojis.reddet} Başvuru Sonucu`,
            aciklama: `**${interaction.guild.name}** sunucusundaki **${basvuru.formIsmi}** başvurunuz **${durum === 'kabul' ? 'kabul edildi' : 'reddedildi'}**.`
        })]
    }).catch(() => {});

    await interaction.update({
        embeds: [temelEmbed({
            tip: durum === 'kabul' ? 'basari' : 'hata',
            baslik: `${emojis.oneri} Başvuru — ${basvuru.formIsmi}`,
            aciklama: `**Başvuran:** <@${basvuru.kullaniciId}>\n**Durum:** ${durum}\n\n${basvuru.cevaplar.map(c => `**${c.soru}**\n${c.cevap}`).join('\n\n')}`
        })],
        components: []
    });
}

module.exports = { basvuruDurumGuncelle };
