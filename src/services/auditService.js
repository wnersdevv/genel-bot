const AuditKaydi = require('../database/models/AuditKaydi');
const logger = require('../utils/logger');

// Denetim kaydına asla yazılmayacak hassas alan adları
const HASSAS_ALANLAR = ['token', 'secret', 'apikey', 'api_key', 'password', 'sifre', 'sessionsecret', 'mongodburi'];

function degerMaskele(anahtar, deger) {
    if (deger === null || deger === undefined) return null;

    const kucukAnahtar = String(anahtar).toLowerCase();
    if (HASSAS_ALANLAR.some(h => kucukAnahtar.includes(h))) return '********';

    const metin = typeof deger === 'object' ? JSON.stringify(deger) : String(deger);
    return metin.length > 300 ? metin.slice(0, 300) + '…' : metin;
}

/**
 * Kritik bir yapılandırma değişikliğini denetim kaydına yazar.
 * Hassas alanlar maskelenir, kayıtlar 90 gün sonra otomatik silinir.
 */
async function auditYaz({ guildId, kullaniciId, kullaniciEtiketi, islem, kaynak, hedef, eskiDeger, yeniDeger, sonuc = 'başarılı' }) {
    try {
        await AuditKaydi.create({
            guildId,
            kullaniciId,
            kullaniciEtiketi,
            islem,
            kaynak,
            hedef: hedef ? String(hedef).slice(0, 200) : null,
            eskiDeger: degerMaskele(hedef || islem, eskiDeger),
            yeniDeger: degerMaskele(hedef || islem, yeniDeger),
            sonuc
        });
    } catch (hata) {
        logger.uyari('Audit', `Denetim kaydı yazılamadı (${guildId}): ${hata.message}`);
    }
}

async function auditListele(guildId, { limit = 50, sayfa = 0 } = {}) {
    const guvenliLimit = Math.min(Math.max(limit, 1), 100);

    const [kayitlar, toplam] = await Promise.all([
        AuditKaydi.find({ guildId }).sort({ createdAt: -1 }).skip(sayfa * guvenliLimit).limit(guvenliLimit),
        AuditKaydi.countDocuments({ guildId })
    ]);

    return { kayitlar, toplam, sayfa, toplamSayfa: Math.max(1, Math.ceil(toplam / guvenliLimit)) };
}

module.exports = { auditYaz, auditListele };
