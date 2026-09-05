/**
 * src/utils/logger.js
 * wnersdev - Merkezi loglama.
 *
 * Konsola renkli, logs/ klasörüne düz metin yazar. Günlük dosya döndürme
 * yapılır (wnersdev-YYYY-MM-DD.log) ve eski dosyalar otomatik temizlenir,
 * böylece disk zamanla dolmaz.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const LOG_DIZINI = path.join(__dirname, '..', '..', 'logs');
const SAKLAMA_GUNU = 14;

if (!fs.existsSync(LOG_DIZINI)) {
    fs.mkdirSync(LOG_DIZINI, { recursive: true });
}

function bugununDosyaYolu() {
    const bugun = new Date().toISOString().slice(0, 10);
    return path.join(LOG_DIZINI, `wnersdev-${bugun}.log`);
}

function zamanDamgasi() {
    return new Date().toLocaleString('tr-TR');
}

function dosyayaYaz(seviye, etiket, mesaj) {
    const satir = `[${zamanDamgasi()}] [${seviye}] [${etiket}] ${mesaj}\n`;
    fs.appendFile(bugununDosyaYolu(), satir, () => {});
}

function metneCevir(deger) {
    if (deger instanceof Error) return `${deger.message}\n${deger.stack}`;
    if (typeof deger === 'object' && deger !== null) {
        try {
            return JSON.stringify(deger);
        } catch {
            return String(deger);
        }
    }
    return String(deger);
}

/** SAKLAMA_GUNU'nden eski log dosyalarını siler. */
function eskiLoglariTemizle() {
    const sinir = Date.now() - SAKLAMA_GUNU * 24 * 60 * 60 * 1000;

    fs.readdir(LOG_DIZINI, (hata, dosyalar) => {
        if (hata) return;
        for (const dosya of dosyalar) {
            if (!dosya.endsWith('.log')) continue;
            const tamYol = path.join(LOG_DIZINI, dosya);
            fs.stat(tamYol, (statHatasi, bilgi) => {
                if (statHatasi) return;
                if (bilgi.mtimeMs < sinir) fs.unlink(tamYol, () => {});
            });
        }
    });
}

const logger = {
    bilgi(etiket, ...parcalar) {
        const mesaj = parcalar.map(metneCevir).join(' ');
        console.log(chalk.cyan(`[${etiket}]`), mesaj);
        dosyayaYaz('BILGI', etiket, mesaj);
    },

    basari(etiket, ...parcalar) {
        const mesaj = parcalar.map(metneCevir).join(' ');
        console.log(chalk.green(`[${etiket}]`), mesaj);
        dosyayaYaz('BASARI', etiket, mesaj);
    },

    uyari(etiket, ...parcalar) {
        const mesaj = parcalar.map(metneCevir).join(' ');
        console.warn(chalk.yellow(`[${etiket}]`), mesaj);
        dosyayaYaz('UYARI', etiket, mesaj);
    },

    hata(etiket, ...parcalar) {
        const mesaj = parcalar.map(metneCevir).join(' ');
        console.error(chalk.red(`[${etiket}]`), mesaj);
        dosyayaYaz('HATA', etiket, mesaj);
    },

    eskiLoglariTemizle
};

module.exports = logger;
