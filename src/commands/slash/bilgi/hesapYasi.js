const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

function yasHesapla(tarih) {
    const farkMs = Date.now() - tarih.getTime();
    const gun = Math.floor(farkMs / (1000 * 60 * 60 * 24));
    const yil = Math.floor(gun / 365);
    const kalanGun = gun % 365;
    return { yil, gun: kalanGun, toplamGun: gun };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hesap-yaşı')
        .setDescription('Bir kullanıcının Discord hesap yaşını ve sunucu üyeliği süresini gösterir.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('Yaşı görüntülenecek kullanıcı').setRequired(false)),
    kategori: 'bilgi',

    async execute(client, interaction) {
        const hedefUye = interaction.options.getMember('kullanıcı') || interaction.member;
        const hesapYasi = yasHesapla(hedefUye.user.createdAt);
        const uyelikYasi = hedefUye.joinedAt ? yasHesapla(hedefUye.joinedAt) : null;

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.saat} ${hedefUye.user.username} — Hesap Yaşı`,
                alanlar: [
                    { name: 'Discord Hesabı', value: `${hesapYasi.yil} yıl ${hesapYasi.gun} gün (${hesapYasi.toplamGun} gün)`, inline: true },
                    { name: 'Sunucu Üyeliği', value: uyelikYasi ? `${uyelikYasi.yil} yıl ${uyelikYasi.gun} gün (${uyelikYasi.toplamGun} gün)` : 'Bilinmiyor', inline: true }
                ]
            })]
        });
    }
};
