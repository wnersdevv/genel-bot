const ayarlar = require('../utils/ayarlar');

// key: `${guildId}:${userId}` -> [timestamp, timestamp, ...]
const mesajGecmisi = new Map();

/**
 * Kullanıcının kısa sürede çok fazla mesaj atıp atmadığını kontrol eder.
 * Eşik ve pencere guild'e özel olarak MongoDB'den (guildAyari.koruma) okunur;
 * ayarlanmamışsa utils/ayarlar.js'teki genel varsayılana düşer.
 * @returns {boolean} true ise spam tespit edildi
 */
function spamTespitEt(guildId, userId, guildAyari = null) {
    const anahtar = `${guildId}:${userId}`;
    const simdi = Date.now();

    const mesajEsik = guildAyari?.koruma?.antiSpamMesajEsik ?? ayarlar.koruma.antiSpamMesajEsik;
    const pencereSn = guildAyari?.koruma?.antiSpamPencereSn ?? ayarlar.koruma.antiSpamPencereSn;
    const pencereMs = pencereSn * 1000;

    const gecmis = (mesajGecmisi.get(anahtar) || []).filter(zaman => simdi - zaman < pencereMs);
    gecmis.push(simdi);
    mesajGecmisi.set(anahtar, gecmis);

    return gecmis.length > mesajEsik;
}

module.exports = { spamTespitEt };
