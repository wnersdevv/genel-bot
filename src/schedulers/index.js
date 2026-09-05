const logger = require('../utils/logger');
const { cekilisleriKontrolEt } = require('./cekilisScheduler');
const { hatirlaticilariKontrolEt } = require('./hatirlaticiScheduler');
const { dogumGunleriniKontrolEt } = require('./dogumGunuScheduler');
const { anketleriKontrolEt } = require('./anketScheduler');

/**
 * Bütün zamanlanmış görevleri başlatır. Restart sonrası
 * her scheduler kendi verisini MongoDB'den yeniden okur,
 * böylece hiçbir aktif çekiliş/hatırlatıcı/anket kaybolmaz.
 */
function schedulerBaslat(client) {
    const gorevler = [
        { isim: 'Çekiliş', calistir: cekilisleriKontrolEt, aralikMs: 15_000 },
        { isim: 'Hatırlatıcı', calistir: hatirlaticilariKontrolEt, aralikMs: 30_000 },
        { isim: 'Anket', calistir: anketleriKontrolEt, aralikMs: 30_000 },
        { isim: 'Doğum Günü', calistir: dogumGunleriniKontrolEt, aralikMs: 60 * 60 * 1000, acilistaCalistir: true }
    ];

    for (const gorev of gorevler) {
        const guvenliCalistir = () =>
            gorev.calistir(client).catch(hata =>
                logger.hata('Scheduler', `${gorev.isim} görevinde hata: ${hata.stack || hata.message}`)
            );

        setInterval(guvenliCalistir, gorev.aralikMs);
        if (gorev.acilistaCalistir) guvenliCalistir();
    }

    logger.bilgi('Scheduler', `${gorevler.length} zamanlanmış görev başlatıldı (${gorevler.map(g => g.isim.toLowerCase()).join(', ')}).`);
}

module.exports = { schedulerBaslat };
