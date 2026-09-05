const { createCanvas } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');

async function istatistikKartiOlustur(guild, veriler) {
    const genislik = 900;
    const yukseklik = 320;
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

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`📊 ${guild.name}`, 40, 60);

    const kartlar = [
        { etiket: 'Üye', deger: veriler.üyeSayısı },
        { etiket: 'Kanal', deger: veriler.kanalSayısı },
        { etiket: 'Rol', deger: veriler.rolSayısı },
        { etiket: 'Ticket', deger: veriler.açıkTicket }
    ];

    const kartGenislik = (genislik - 80 - 3 * 20) / 4;
    kartlar.forEach((k, i) => {
        const x = 40 + i * (kartGenislik + 20);
        const y = 100;

        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath();
        ctx.roundRect(x, y, kartGenislik, 160, 16);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${k.deger}`, x + kartGenislik / 2, y + 80);

        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#9096ac';
        ctx.fillText(k.etiket, x + kartGenislik / 2, y + 115);
        ctx.textAlign = 'left';
    });

    const buffer = canvas.toBuffer('image/png');
    return new AttachmentBuilder(buffer, { name: 'istatistik.png' });
}

module.exports = { istatistikKartiOlustur };
