const { PermissionFlagsBits } = require('discord.js');
const Oneri = require('../database/models/Oneri');
const { temelEmbed } = require('../utils/embedOlustur');
const emojis = require('../utils/emojis');

const DURUM_BILGISI = {
    'oneri:kabul': { durum: 'kabul', etiket: `${emojis.kabul} Kabul Edildi`, tip: 'basari' },
    'oneri:reddet': { durum: 'reddedildi', etiket: `${emojis.reddet} Reddedildi`, tip: 'hata' },
    'oneri:inceleniyor': { durum: 'inceleniyor', etiket: `${emojis.inceleniyor} İncelemede`, tip: 'uyari' }
};

async function oneriDurumGuncelle(client, interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkisiz`, aciklama: 'Öneri durumunu değiştirmek için "Sunucuyu Yönet" yetkisine sahip olmalısınız.' })], flags: 64 });
    }

    const bilgi = DURUM_BILGISI[interaction.customId];
    const oneri = await Oneri.findOneAndUpdate({ mesajId: interaction.message.id }, { durum: bilgi.durum }, { new: true });

    if (!oneri) {
        return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bulunamadı`, aciklama: 'Bu öneri kaydı bulunamadı.' })], flags: 64 });
    }

    const guncelEmbed = temelEmbed({
        tip: bilgi.tip,
        baslik: `${emojis.oneri} Öneri`,
        aciklama: oneri.icerik,
        alanlar: [
            { name: 'Gönderen', value: `<@${oneri.kullaniciId}>`, inline: true },
            { name: 'Durum', value: bilgi.etiket, inline: true },
            { name: 'İşlemi Yapan', value: `${interaction.user}`, inline: true }
        ]
    });

    await interaction.update({ embeds: [guncelEmbed] });
}

module.exports = { oneriDurumGuncelle, DURUM_BILGISI };
