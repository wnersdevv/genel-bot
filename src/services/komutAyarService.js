const KomutAyari = require('../database/models/KomutAyari');

// key: guildId -> Map<komutIsmi, { aktif, cooldownSn }>
const cache = new Map();
const CACHE_MS = 30_000;

async function guildKomutAyarlariGetir(guildId) {
    const onbellek = cache.get(`guild:${guildId}:komutAyar`);
    if (onbellek && Date.now() - onbellek.zaman < CACHE_MS) return onbellek.harita;

    const kayitlar = await KomutAyari.find({ guildId });
    const harita = new Map(kayitlar.map(k => [k.komutIsmi, { aktif: k.aktif, cooldownSn: k.cooldownSn }]));

    cache.set(`guild:${guildId}:komutAyar`, { harita, zaman: Date.now() });
    return harita;
}

function komutAyarCacheTemizle(guildId) {
    cache.delete(`guild:${guildId}:komutAyar`);
}

async function komutAyariGuncelle(guildId, komutIsmi, guncelleme) {
    const sonuc = await KomutAyari.findOneAndUpdate(
        { guildId, komutIsmi },
        { $set: guncelleme },
        { upsert: true, new: true }
    );
    komutAyarCacheTemizle(guildId);
    return sonuc;
}

module.exports = { guildKomutAyarlariGetir, komutAyarCacheTemizle, komutAyariGuncelle };
