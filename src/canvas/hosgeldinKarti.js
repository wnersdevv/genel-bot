const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');
const { yerTutuculariDoldur } = require('../services/welcomeService');

const GENISLIK = 1000;
const YUKSEKLIK = 400;

function metniKisalt(ctx, metin, maksGenislik) {
    if (ctx.measureText(metin).width <= maksGenislik) return metin;
    let kisa = metin;
    while (kisa.length > 3 && ctx.measureText(kisa + '…').width > maksGenislik) {
        kisa = kisa.slice(0, -1);
    }
    return kisa + '…';
}

/**
 * Guild ayarlarına göre özelleştirilmiş karşılama/ayrılış kartı üretir.
 * @param {object} uye  GuildMember
 * @param {object} kart Welcome modelindeki kart ayarları
 */
async function hosgeldinKartiOlustur(uye, kart = {}) {
    const canvas = createCanvas(GENISLIK, YUKSEKLIK);
    const ctx = canvas.getContext('2d');

    const arkaPlan = kart.arkaPlanRengi || '#1e1f3b';
    const gradyanRenk = kart.gradyanRengi || '#2b2d5a';
    const metinRengi = kart.metinRengi || '#ffffff';
    const altMetinRengi = kart.altMetinRengi || '#b9bbe1';
    const kenarlikRengi = kart.kenarlikRengi || '#5865F2';
    const kenarlikKalinligi = kart.kenarlikKalinligi ?? 6;
    const avatarBoyut = Math.min(Math.max(kart.avatarBoyutu ?? 160, 80), 220);

    const gradyan = ctx.createLinearGradient(0, 0, GENISLIK, YUKSEKLIK);
    gradyan.addColorStop(0, arkaPlan);
    gradyan.addColorStop(1, gradyanRenk);
    ctx.fillStyle = gradyan;
    ctx.fillRect(0, 0, GENISLIK, YUKSEKLIK);

    if (kart.arkaPlanResmi) {
        try {
            const resim = await loadImage(kart.arkaPlanResmi);
            ctx.drawImage(resim, 0, 0, GENISLIK, YUKSEKLIK);
            ctx.fillStyle = `rgba(0,0,0,${Math.min(Math.max(kart.overlayOpaklik ?? 45, 0), 100) / 100})`;
            ctx.fillRect(0, 0, GENISLIK, YUKSEKLIK);
        } catch { /* resim yüklenemezse gradyan arka planla devam */ }
    }

    if (kenarlikKalinligi > 0) {
        ctx.strokeStyle = kenarlikRengi;
        ctx.lineWidth = kenarlikKalinligi;
        ctx.strokeRect(kenarlikKalinligi / 2 + 8, kenarlikKalinligi / 2 + 8,
            GENISLIK - kenarlikKalinligi - 16, YUKSEKLIK - kenarlikKalinligi - 16);
    }

    if (kart.sunucuIkonuGoster && uye.guild.iconURL()) {
        try {
            const ikon = await loadImage(uye.guild.iconURL({ extension: 'png', size: 128 }));
            ctx.save();
            ctx.beginPath();
            ctx.arc(72, 72, 32, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(ikon, 40, 40, 64, 64);
            ctx.restore();
        } catch { /* ikon yoksa atla */ }
    }

    const avatarY = 48;
    try {
        const avatar = await loadImage(uye.user.displayAvatarURL({ extension: 'png', size: 256 }));
        ctx.save();
        ctx.beginPath();
        ctx.arc(GENISLIK / 2, avatarY + avatarBoyut / 2, avatarBoyut / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, GENISLIK / 2 - avatarBoyut / 2, avatarY, avatarBoyut, avatarBoyut);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(GENISLIK / 2, avatarY + avatarBoyut / 2, avatarBoyut / 2, 0, Math.PI * 2);
        ctx.lineWidth = 6;
        ctx.strokeStyle = kenarlikRengi;
        ctx.stroke();
    } catch { /* avatar yüklenemezse metinlerle devam */ }

    const baslikY = avatarY + avatarBoyut + 62;
    ctx.textAlign = 'center';

    ctx.fillStyle = metinRengi;
    ctx.font = 'bold 42px sans-serif';
    const baslik = yerTutuculariDoldur(kart.baslik || 'Hoş Geldin, {username}!', uye).replace(/<@\d+>/g, uye.user.username);
    ctx.fillText(metniKisalt(ctx, baslik, GENISLIK - 100), GENISLIK / 2, baslikY);

    ctx.fillStyle = altMetinRengi;
    ctx.font = '26px sans-serif';
    const altBaslik = yerTutuculariDoldur(kart.altBaslik || '{serverName} — {memberCount}. üye', uye).replace(/<@\d+>/g, uye.user.username);
    ctx.fillText(metniKisalt(ctx, altBaslik, GENISLIK - 100), GENISLIK / 2, baslikY + 44);

    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'welcome.png' });
}

module.exports = { hosgeldinKartiOlustur };
