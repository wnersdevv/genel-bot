const Filtre = require('../database/models/Filtre');

const LINK_REGEX = /https?:\/\/[^\s]+/gi;
const DAVET_REGEX = /(discord\.gg|discord(app)?\.com\/invite)\/[a-z0-9-]+/gi;

const filtreCache = new Map();
const CACHE_MS = 60_000;

async function filtreGetir(guildId) {
    const onbellek = filtreCache.get(guildId);
    if (onbellek && Date.now() - onbellek.zaman < CACHE_MS) return onbellek.veri;

    let filtre = await Filtre.findOne({ guildId });
    if (!filtre) filtre = await Filtre.create({ guildId });

    filtreCache.set(guildId, { veri: filtre, zaman: Date.now() });
    return filtre;
}

function filtreCacheTemizle(guildId) {
    filtreCache.delete(guildId);
}

/**
 * Mesajı filtre kurallarına göre kontrol eder.
 * @returns {{ihlalVar: boolean, sebep?: string}}
 */
function mesajiKontrolEt(icerik, filtre) {
    const kucukIcerik = icerik.toLowerCase();

    for (const kelime of filtre.yasakliKelimeler) {
        if (kucukIcerik.includes(kelime.toLowerCase())) {
            return { ihlalVar: true, sebep: `Yasaklı kelime: "${kelime}"` };
        }
    }

    for (const desen of filtre.regexKurallari) {
        try {
            if (new RegExp(desen, 'i').test(icerik)) {
                return { ihlalVar: true, sebep: `Regex kuralı: "${desen}"` };
            }
        } catch {
            // geçersiz regex, yoksay
        }
    }

    if (filtre.davetEngelle && DAVET_REGEX.test(icerik)) {
        return { ihlalVar: true, sebep: 'Discord daveti' };
    }

    if (filtre.linkEngelle && LINK_REGEX.test(icerik)) {
        return { ihlalVar: true, sebep: 'Link paylaşımı' };
    }

    if (filtre.capsEngelle && icerik.length >= 10) {
        const harfler = icerik.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ]/g, '');
        const buyukHarfler = harfler.replace(/[^A-ZÇĞİÖŞÜ]/g, '');
        const yuzde = harfler.length ? (buyukHarfler.length / harfler.length) * 100 : 0;
        if (yuzde >= filtre.capsEsikYuzde) {
            return { ihlalVar: true, sebep: 'Aşırı büyük harf (caps)' };
        }
    }

    return { ihlalVar: false };
}

module.exports = { filtreGetir, filtreCacheTemizle, mesajiKontrolEt };
