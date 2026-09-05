/**
 * src/dashboard/soket.js
 * Socket.IO instance'ını merkezi olarak tutar. Dashboard kapalıysa (io ayarlanmadıysa)
 * yayinla() sessizce hiçbir şey yapmaz — bot komutları bu yüzden güvenle çağırabilir.
 */

let io = null;

function ioAyarla(instance) {
    io = instance;
}

function yayinla(olayAdi, veri) {
    if (!io) return;
    io.emit(olayAdi, veri);
}

/** Belirli bir guild odasına yayın yapar (dashboard tarafı guild.id odasına katılır). */
function guildYayinla(guildId, olayAdi, veri) {
    if (!io) return;
    io.to(`guild:${guildId}`).emit(olayAdi, veri);
}

module.exports = { ioAyarla, yayinla, guildYayinla };
