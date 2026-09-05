const GuildOnay = require('../database/models/GuildOnay');
const { sartlarVersiyonu, gizlilikVersiyonu } = require('../utils/sartlar');

const cache = new Map();
const CACHE_MS = 300_000;

/**
 * Sunucunun güncel şartları kabul edip etmediğini döner.
 * Şart sürümü değiştiyse önceki onay geçersiz sayılır.
 */
async function onayDurumu(guildId) {
    const anahtar = `guild:${guildId}:onay`;
    const onbellek = cache.get(anahtar);
    if (onbellek && Date.now() - onbellek.zaman < CACHE_MS) return onbellek.veri;

    const kayit = await GuildOnay.findOne({ guildId });

    const guncelMi = Boolean(
        kayit?.kabulEdildi &&
        kayit.sartlarVersiyonu === sartlarVersiyonu &&
        kayit.gizlilikVersiyonu === gizlilikVersiyonu
    );

    const sonuc = {
        kabulEdildi: guncelMi,
        surumEskimis: Boolean(kayit?.kabulEdildi && !guncelMi),
        reddedildi: Boolean(kayit?.reddedildi),
        onboardingTamamlandi: Boolean(kayit?.onboardingTamamlandi),
        kayit
    };

    cache.set(anahtar, { veri: sonuc, zaman: Date.now() });
    return sonuc;
}

async function onayKaydet(guildId, kullaniciId, kaynak = 'discord') {
    const kayit = await GuildOnay.findOneAndUpdate(
        { guildId },
        {
            kabulEdildi: true,
            reddedildi: false,
            kabulEdenId: kullaniciId,
            kabulTarihi: new Date(),
            sartlarVersiyonu,
            gizlilikVersiyonu,
            kaynak
        },
        { upsert: true, new: true }
    );

    cache.delete(`guild:${guildId}:onay`);
    return kayit;
}

async function onayReddet(guildId, kullaniciId) {
    const kayit = await GuildOnay.findOneAndUpdate(
        { guildId },
        { kabulEdildi: false, reddedildi: true, reddedenId: kullaniciId },
        { upsert: true, new: true }
    );

    cache.delete(`guild:${guildId}:onay`);
    return kayit;
}

async function onboardingTamamla(guildId) {
    await GuildOnay.findOneAndUpdate({ guildId }, { onboardingTamamlandi: true }, { upsert: true });
    cache.delete(`guild:${guildId}:onay`);
}

function onayCacheTemizle(guildId) {
    cache.delete(`guild:${guildId}:onay`);
}

module.exports = { onayDurumu, onayKaydet, onayReddet, onboardingTamamla, onayCacheTemizle };
