/**
 * src/utils/config.js
 * wnersdev - .env YERİNE proje kökündeki "ayarlar.json" dosyasından
 * token, veritabanı bağlantısı gibi hassas/ortam ayarlarını okur.
 * Diğer tüm dosyalarda process.env yerine bu modül kullanılır.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const dosyaYolu = path.join(__dirname, '..', '..', 'ayarlar.json');

let config;

try {
    const ham = fs.readFileSync(dosyaYolu, 'utf8');
    config = JSON.parse(ham);
} catch (hata) {
    console.error(chalk.red(`[Config] "ayarlar.json" okunamadı: ${hata.message}`));
    console.error(chalk.yellow('[Config] Proje kökünde "ayarlar.json" dosyasının bulunduğundan emin olun (bkz. ayarlar.ornek.json).'));
    process.exit(1);
}

const ZORUNLU_ALANLAR = ['token', 'clientId', 'mongodbUri'];
const eksikAlanlar = ZORUNLU_ALANLAR.filter(alan => !config[alan]);

if (eksikAlanlar.length > 0) {
    console.error(chalk.red(`[Config] "ayarlar.json" içinde eksik/boş alanlar: ${eksikAlanlar.join(', ')}`));
    process.exit(1);
}

module.exports = config;
