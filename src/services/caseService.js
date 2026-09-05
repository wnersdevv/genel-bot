const CaseSayac = require('../database/models/CaseSayac');
const ModerasyonKaydi = require('../database/models/ModerasyonKaydi');

/**
 * Yeni bir case numarası alır ve birleşik moderasyon kaydına yazar.
 * Tüm moderasyon komutları (uyar, sustur, at, yasakla, softban...)
 * aynı case sayacını paylaşır, böylece /case-liste tek bir kronolojik
 * geçmiş gösterir.
 */
async function caseKaydet(guildId, tip, kullaniciId, yetkiliId, sebep, ekBilgi = null) {
    const caseNo = await CaseSayac.sonrakiCaseNo(guildId);
    await ModerasyonKaydi.create({ guildId, caseNo, tip, kullaniciId, yetkiliId, sebep, ekBilgi });
    return caseNo;
}

module.exports = { caseKaydet };
