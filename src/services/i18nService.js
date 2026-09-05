const fs = require('fs');
const path = require('path');


const LOCALE_DIZINI = path.join(__dirname, '..', 'locales');
const VARSAYILAN_DIL = 'tr';

const yerelDosyalari = new Map();

/** Mevcut dil dosyalarını diskten okuyup listeler. */
function kullanilabilirDiller() {
    return fs.readdirSync(LOCALE_DIZINI)
        .filter(d => d.endsWith('.json'))
        .map(d => d.replace('.json', ''));
}

function dilYukle(dilKodu) {
    if (yerelDosyalari.has(dilKodu)) return yerelDosyalari.get(dilKodu);

    const dosyaYolu = path.join(LOCALE_DIZINI, `${dilKodu}.json`);
    if (!fs.existsSync(dosyaYolu)) return null;

    const veri = JSON.parse(fs.readFileSync(dosyaYolu, 'utf8'));
    yerelDosyalari.set(dilKodu, veri);
    return veri;
}

function anahtarCoz(dil, anahtar) {
    let deger = dil;
    for (const parca of anahtar.split('.')) deger = deger?.[parca];
    return typeof deger === 'string' ? deger : null;
}

/**
 * Çeviri getirir. Anahtar seçilen dilde yoksa varsayılan dile,
 * orada da yoksa anahtarın kendisine düşer — böylece hiçbir zaman
 * boş metin dönmez.
 */
function t(dilKodu, anahtar, degiskenler = {}) {
    const dil = dilYukle(dilKodu);
    const yedekDil = dilYukle(VARSAYILAN_DIL);

    const metin = (dil && anahtarCoz(dil, anahtar))
        || (yedekDil && anahtarCoz(yedekDil, anahtar))
        || anahtar;

    return metin.replace(/\{(\w+)\}/g, (_, isim) =>
        Object.prototype.hasOwnProperty.call(degiskenler, isim) ? degiskenler[isim] : `{${isim}}`
    );
}

/**
 * Sunucunun ayarlı diline göre çeviri yapan bir kısayol üretir.
 * Kullanım:  const ceviri = await sunucuCevirisi(guildId);  ceviri('genel.yetkiYok')
 */
async function sunucuCevirisi(guildId) {
    let dilKodu = VARSAYILAN_DIL;

    if (guildId) {
        const { guildAyariGetir } = require('./guildService');
        const ayar = await guildAyariGetir(guildId).catch(() => null);
        if (ayar?.dil) dilKodu = ayar.dil;
    }

    const ceviri = (anahtar, degiskenler) => t(dilKodu, anahtar, degiskenler);
    ceviri.dil = dilKodu;
    return ceviri;
}

/** Bellekteki dil önbelleğini temizler (dil dosyası düzenlendiğinde kullanılır). */
function dilOnbellegiTemizle() {
    yerelDosyalari.clear();
}

module.exports = { t, dilYukle, sunucuCevirisi, kullanilabilirDiller, dilOnbellegiTemizle, VARSAYILAN_DIL };
