const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');

async function profilKartiOlustur(uye, ekVeri = {}) {
    const genislik = 900;
    const yukseklik = 300;
    const canvas = createCanvas(genislik, yukseklik);
    const ctx = canvas.getContext('2d');

    const gradyan = ctx.createLinearGradient(0, 0, genislik, yukseklik);
    gradyan.addColorStop(0, '#181a2e');
    gradyan.addColorStop(1, '#2b2d5a');
    ctx.fillStyle = gradyan;
    ctx.fillRect(0, 0, genislik, yukseklik);

    ctx.strokeStyle = '#5865F2';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, genislik - 20, yukseklik - 20);

    const avatarBoyut = 180;
    const avatarX = 55;
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

        ctx.beginPath();
        ctx.arc(avatarX + avatarBoyut / 2, avatarY + avatarBoyut / 2, avatarBoyut / 2, 0, Math.PI * 2);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#5865F2';
        ctx.stroke();
    } catch {
        // avatar yüklenemezse sessizce geç
    }

    const metinX = avatarX + avatarBoyut + 45;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(uye.displayName, metinX, 85);

    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#9096ac';
    ctx.fillText(`@${uye.user.username}`, metinX, 118);

    const katilmaTarihi = uye.joinedAt ? uye.joinedAt.toLocaleDateString('tr-TR') : 'Bilinmiyor';
    const hesapTarihi = uye.user.createdAt.toLocaleDateString('tr-TR');

    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#c9cbe0';
    ctx.fillText(`📅 Sunucuya katılma: ${katilmaTarihi}`, metinX, 165);
    ctx.fillText(`🎂 Hesap oluşturma: ${hesapTarihi}`, metinX, 195);
    ctx.fillText(`🎭 Rol sayısı: ${uye.roles.cache.size - 1}`, metinX, 225);

    if (ekVeri.seviye !== undefined) {
        ctx.fillText(`⭐ Seviye: ${ekVeri.seviye}`, metinX, 255);
    }

    const buffer = canvas.toBuffer('image/png');
    return new AttachmentBuilder(buffer, { name: 'profil.png' });
}

module.exports = { profilKartiOlustur };
