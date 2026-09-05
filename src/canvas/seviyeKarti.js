const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');

/**
 * Kullanıcının seviye/XP ilerlemesini gösteren bir kart üretir.
 */
async function seviyeKartiOlustur(uye, seviyeKaydi, gerekliXp) {
    const genislik = 900;
    const yukseklik = 260;
    const canvas = createCanvas(genislik, yukseklik);
    const ctx = canvas.getContext('2d');

    const gradyan = ctx.createLinearGradient(0, 0, genislik, yukseklik);
    gradyan.addColorStop(0, '#1e1f3b');
    gradyan.addColorStop(1, '#2b2d5a');
    ctx.fillStyle = gradyan;
    ctx.fillRect(0, 0, genislik, yukseklik);

    ctx.strokeStyle = '#5865F2';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, genislik - 20, yukseklik - 20);

    const avatarBoyut = 160;
    const avatarX = 50;
    const avatarY = (yukseklik - avatarBoyut) / 2;

    try {
        const avatar = await loadImage(uye.user.displayAvatarURL({ extension: 'png', size: 256 }));
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarBoyut / 2, avatarY + avatarBoyut / 2, avatarBoyut / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarBoyut, avatarBoyut);
        ctx.restore();
    } catch {
        // avatar yüklenemezse sessizce geç
    }

    const metinX = avatarX + avatarBoyut + 40;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(uye.user.username, metinX, 90);

    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#b9bbe1';
    ctx.fillText(`Seviye ${seviyeKaydi.seviye}`, metinX, 130);

    const barGenislik = genislik - metinX - 60;
    const barYukseklik = 26;
    const barY = 160;
    const yuzde = Math.min(1, seviyeKaydi.xp / gerekliXp);

    ctx.fillStyle = '#3a3d63';
    ctx.beginPath();
    ctx.roundRect(metinX, barY, barGenislik, barYukseklik, 13);
    ctx.fill();

    ctx.fillStyle = '#5865F2';
    ctx.beginPath();
    ctx.roundRect(metinX, barY, barGenislik * yuzde, barYukseklik, 13);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.fillText(`${seviyeKaydi.xp} / ${gerekliXp} XP`, metinX, barY + 46);

    const buffer = canvas.toBuffer('image/png');
    return new AttachmentBuilder(buffer, { name: 'seviye.png' });
}

module.exports = { seviyeKartiOlustur };
