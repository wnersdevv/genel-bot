const logger = require('../utils/logger');
const { temelEmbed } = require('../utils/embedOlustur');
const emojis = require('../utils/emojis');

/**
 * Komut yürütmesi sırasında oluşan hataları tutarlı biçimde loglar
 * ve kullanıcıya Türkçe, anlaşılır bir hata mesajı döner.
 */
async function komutHatasiIsle(hata, { kaynak, komutIsmi, cevapVer }) {
    logger.hata('Komut Hatası', `"${komutIsmi}" komutunda hata: ${hata.stack || hata.message}`);

    const embed = temelEmbed({
        tip: 'hata',
        baslik: `${emojis.hata} Bir Hata Oluştu`,
        aciklama: 'Bu komutu çalıştırırken beklenmedik bir sorunla karşılaştım. Sorun devam ederse yetkililere bildirin.'
    });

    try {
        await cevapVer({ embeds: [embed], flags: kaynak === 'slash' ? 64 : undefined });
    } catch (ikinciHata) {
        logger.hata('Komut Hatası', `Hata mesajı gönderilemedi: ${ikinciHata.message}`);
    }
}

module.exports = { komutHatasiIsle };
