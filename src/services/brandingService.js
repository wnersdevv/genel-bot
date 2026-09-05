const Branding = require('../database/models/Branding');

const cache = new Map();
const CACHE_MS = 120_000;

const VARSAYILAN = {
    botAdi: 'wnersdev',
    embedRengi: '#5865F2',
    altBilgi: 'wnersdev • Tek bot, bütün sunucu.',
    logoUrl: null,
    panelBasligi: null,
    destekUrl: null,
    siteUrl: null
};

/** Guild bazlı marka ayarlarını döner; kayıt yoksa varsayılana düşer. */
async function brandingGetir(guildId) {
    if (!guildId) return { ...VARSAYILAN };

    const anahtar = `guild:${guildId}:branding`;
    const onbellek = cache.get(anahtar);
    if (onbellek && Date.now() - onbellek.zaman < CACHE_MS) return onbellek.veri;

    const kayit = await Branding.findOne({ guildId }).lean();
    const veri = {
        botAdi: kayit?.botAdi || VARSAYILAN.botAdi,
        embedRengi: kayit?.embedRengi || VARSAYILAN.embedRengi,
        altBilgi: kayit?.altBilgi || (kayit?.botAdi ? `${kayit.botAdi} • Sunucu Yönetimi` : VARSAYILAN.altBilgi),
        logoUrl: kayit?.logoUrl || null,
        panelBasligi: kayit?.panelBasligi || (kayit?.botAdi ? `${kayit.botAdi} Yönetim Merkezi` : null),
        destekUrl: kayit?.destekUrl || null,
        siteUrl: kayit?.siteUrl || null
    };

    cache.set(anahtar, { veri, zaman: Date.now() });
    return veri;
}

async function brandingGuncelle(guildId, guncelleme) {
    const kayit = await Branding.findOneAndUpdate({ guildId }, { $set: guncelleme }, { upsert: true, new: true });
    cache.delete(`guild:${guildId}:branding`);
    return kayit;
}

function brandingCacheTemizle(guildId) {
    cache.delete(`guild:${guildId}:branding`);
}

/** Hex rengi discord.js'in beklediği sayısal değere çevirir. */
function renkKodu(hex) {
    const n = parseInt(String(hex).replace('#', ''), 16);
    return Number.isNaN(n) ? 0x5865F2 : n;
}

module.exports = { brandingGetir, brandingGuncelle, brandingCacheTemizle, renkKodu, VARSAYILAN };
