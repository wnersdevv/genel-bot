const Guild = require('../database/models/Guild');

// Basit bellek içi cache — aynı sunucu ayarlarını her komutta tekrar
// veritabanından çekmemek için. Dashboard bir ayarı güncellediğinde
// guildCacheTemizle(guildId) çağrılmalıdır ki senkron kalsın.
const cache = new Map();
const CACHE_SURESI_MS = 60_000;

async function guildAyariGetir(guildId) {
    const onbellek = cache.get(`guild:${guildId}:config`);
    if (onbellek && Date.now() - onbellek.zaman < CACHE_SURESI_MS) {
        return onbellek.veri;
    }

    let ayar = await Guild.findOne({ guildId });
    if (!ayar) {
        ayar = await Guild.create({ guildId });
    }

    cache.set(`guild:${guildId}:config`, { veri: ayar, zaman: Date.now() });
    return ayar;
}

function guildCacheTemizle(guildId) {
    cache.delete(`guild:${guildId}:config`);
}

async function guildAyariGuncelle(guildId, guncelleme) {
    const ayar = await Guild.findOneAndUpdate(
        { guildId },
        { $set: guncelleme },
        { upsert: true, new: true }
    );
    guildCacheTemizle(guildId);
    return ayar;
}

module.exports = { guildAyariGetir, guildAyariGuncelle, guildCacheTemizle };
