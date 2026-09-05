/**
 * src/dashboard/routes/genelRotalar.js
 * Giriş gerektirmeyen, herkese açık API uçları.
 * Yalnızca genel bilgiler döner; sunucuya veya kullanıcıya özel hiçbir veri içermez.
 */

const express = require('express');
const router = express.Router();
const { botDurumuHesapla } = require('../botDurumHesapla');
const { komutMetaOlustur } = require('../../utils/komutMeta');

// Herkese açık uçlar için basit bellek içi hız sınırı (IP başına dakikada 60 istek)
const istekSayaci = new Map();
const PENCERE_MS = 60_000;
const LIMIT = 60;

function hizSiniri(req, res, next) {
    const ip = req.ip || 'bilinmiyor';
    const simdi = Date.now();
    const kayit = istekSayaci.get(ip);

    if (!kayit || simdi > kayit.sifirlanma) {
        istekSayaci.set(ip, { sayi: 1, sifirlanma: simdi + PENCERE_MS });
        return next();
    }

    if (kayit.sayi >= LIMIT) {
        return res.status(429).json({ hata: 'Çok fazla istek gönderdiniz, lütfen biraz bekleyin.' });
    }

    kayit.sayi++;
    next();
}

// Eski kayıtları periyodik temizle
setInterval(() => {
    const simdi = Date.now();
    for (const [ip, kayit] of istekSayaci) {
        if (simdi > kayit.sifirlanma) istekSayaci.delete(ip);
    }
}, 5 * 60_000);

router.use(hizSiniri);

/** Sitede gösterilen genel bot istatistikleri. */
router.get('/istatistik', (req, res) => {
    const client = req.client;
    const durum = botDurumuHesapla(client);

    res.json({
        sunucuSayısı: durum.guildSayisi,
        kullanıcıSayısı: durum.kullaniciSayisi,
        kanalSayısı: client.channels.cache.size,
        komutSayısı: client.prefixKomutlari.size,
        slashKomutSayısı: durum.slashKomutSayisi,
        çalışmaSüresiSaniye: durum.uptimeSaniye,
        çevrimiçi: durum.discordOnline
    });
});

/** Herkese açık servis durumu sayfası için. */
router.get('/durum', (req, res) => {
    const durum = botDurumuHesapla(req.client);

    res.json({
        servisler: [
            { isim: 'Discord API', çalışıyor: durum.discordOnline, gecikme: durum.discordPing },
            { isim: 'Veritabanı', çalışıyor: durum.mongoBagliMi, detay: durum.mongoDurum },
            { isim: 'Dashboard', çalışıyor: true },
            { isim: 'Zamanlayıcı', çalışıyor: true }
        ],
        çalışmaSüresiSaniye: durum.uptimeSaniye,
        bellekMB: durum.ramKullanimMB,
        nodeVersiyon: durum.nodeVersiyon,
        discordJsVersiyon: durum.discordJsVersiyon,
        güncellemeZamanı: new Date()
    });
});

/** Herkese açık komut listesi (geliştirici komutları gizlenir). */
router.get('/komutlar', (req, res) => {
    const client = req.client;
    const komutlar = [];

    for (const [isim, prefixKomut] of client.prefixKomutlari) {
        const kaynak = client.slashKomutlari.get(isim) || prefixKomut.kaynakKomut;
        if (!kaynak?.data) continue;

        const meta = komutMetaOlustur(kaynak, client.slashKomutlari.has(isim), '!');
        if (meta.geliştiriciKomutuMu) continue;

        komutlar.push({
            isim: meta.isim,
            açıklama: meta.açıklama,
            kategori: meta.kategori,
            kullanım: meta.kullanım,
            örnek: meta.örnek,
            slashMi: meta.slashMi,
            gerekliYetki: meta.gerekliYetki,
            aliaslar: meta.aliaslar,
            parametreler: meta.parametreler
        });
    }

    // Yalnızca slash olarak sunulan (modal) komutları da kat
    for (const [isim, slashKomut] of client.slashKomutlari) {
        if (client.prefixKomutlari.has(isim)) continue;
        const meta = komutMetaOlustur(slashKomut, true, '!');
        if (meta.geliştiriciKomutuMu) continue;
        komutlar.push({
            isim: meta.isim, açıklama: meta.açıklama, kategori: meta.kategori,
            kullanım: meta.kullanım, örnek: meta.örnek, slashMi: true,
            gerekliYetki: meta.gerekliYetki, aliaslar: meta.aliaslar, parametreler: meta.parametreler
        });
    }

    komutlar.sort((a, b) => a.kategori.localeCompare(b.kategori, 'tr') || a.isim.localeCompare(b.isim, 'tr'));
    res.json({ toplam: komutlar.length, komutlar });
});

module.exports = router;
