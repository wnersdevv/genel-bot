const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

function dosyalariTara(dizin, uzanti = '.js') {
    let sonuc = [];
    if (!fs.existsSync(dizin)) return sonuc;

    for (const isim of fs.readdirSync(dizin)) {
        const tamYol = path.join(dizin, isim);
        const durum = fs.statSync(tamYol);
        if (durum.isDirectory()) {
            sonuc = sonuc.concat(dosyalariTara(tamYol, uzanti));
        } else if (isim.endsWith(uzanti)) {
            sonuc.push(tamYol);
        }
    }
    return sonuc;
}

/**
 * Bir komut dosyasını yükler ve doğrular.
 * Tüm komutlar aynı formatta yazılır (SlashCommandBuilder + execute);
 * fark yalnızca hangi klasörde durduklarıdır:
 *   commands/slash/  → Discord'a kaydedilir, hem slash hem prefix çalışır
 *   commands/prefix/ → yalnızca prefix çalışır (Discord'un 100 komut sınırı nedeniyle)
 */
function komutDosyasiYukle(dosyaYolu) {
    delete require.cache[require.resolve(dosyaYolu)];
    const komut = require(dosyaYolu);

    if (!komut?.data?.name || !komut?.execute) {
        logger.uyari('Komut', `Geçersiz komut dosyası atlandı: ${path.basename(dosyaYolu)}`);
        return null;
    }

    komut.kategori = komut.kategori || path.basename(path.dirname(dosyaYolu));
    return komut;
}

/**
 * Bütün komutları tek sistemde yükler.
 * Her komut prefix köprüsünden geçirilir; slash/ altındakiler ayrıca
 * Discord'a kaydedilmek üzere client.slashKomutlari'na eklenir.
 */
function komutlariYukle(client) {
    const { prefixKomutuUret } = require('./slashKopru');
    const kok = path.join(__dirname, '..', 'commands');

    let slashSayisi = 0;
    let prefixSayisi = 0;
    let koprusuzSayisi = 0;

    const kaydet = (komut, slashMi) => {
        if (slashMi) {
            client.slashKomutlari.set(komut.data.name, komut);
            slashSayisi++;
        }

        const prefixKomut = prefixKomutuUret(komut);
        if (!prefixKomut) {
            koprusuzSayisi++;
            return;
        }

        client.prefixKomutlari.set(komut.data.name, prefixKomut);
        for (const alias of komut.aliaslar || []) {
            client.prefixAliaslar.set(alias, komut.data.name);
        }
        prefixSayisi++;
    };

    for (const dosya of dosyalariTara(path.join(kok, 'slash'))) {
        const komut = komutDosyasiYukle(dosya);
        if (komut) kaydet(komut, true);
    }

    for (const dosya of dosyalariTara(path.join(kok, 'prefix'))) {
        const komut = komutDosyasiYukle(dosya);
        if (komut) kaydet(komut, false);
    }

    logger.bilgi('Komut', `${slashSayisi} slash komut yüklendi (Discord sınırı: 100).`);
    logger.bilgi('Komut', `${prefixSayisi} komut prefix olarak kullanılabilir${koprusuzSayisi ? ` (${koprusuzSayisi} komut prefix'e uygun değil)` : ''}.`);

    if (slashSayisi > 100) {
        logger.uyari('Komut', `DİKKAT: ${slashSayisi} slash komut var, Discord en fazla 100 tanesini kaydeder. Fazlalıkları src/commands/prefix/ altına taşıyın.`);
    }
}

module.exports = { komutlariYukle, dosyalariTara };
