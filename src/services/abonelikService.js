const Abonelik = require('../database/models/Abonelik');

const PLAN_LIMITLERI = {
    'ücretsiz': { temizleMax: 100, cekilisKazananMax: 20, ticketMax: 3, ozelRenk: false },
    'premium': { temizleMax: 200, cekilisKazananMax: 50, ticketMax: 10, ozelRenk: true },
    'ultra': { temizleMax: 500, cekilisKazananMax: 100, ticketMax: 25, ozelRenk: true }
};

const cache = new Map();
const CACHE_MS = 60_000;

async function abonelikGetir(guildId) {
    const onbellek = cache.get(`guild:${guildId}:abonelik`);
    if (onbellek && Date.now() - onbellek.zaman < CACHE_MS) return onbellek.veri;

    let abonelik = await Abonelik.findOne({ guildId });

    // Süresi dolmuş abonelikleri otomatik olarak ücretsiz plana düşür
    if (abonelik && abonelik.bitisTarihi && new Date(abonelik.bitisTarihi) < new Date() && abonelik.plan !== 'ücretsiz') {
        abonelik.plan = 'ücretsiz';
        abonelik.bitisTarihi = null;
        await abonelik.save();
    }

    if (!abonelik) {
        abonelik = { guildId, plan: 'ücretsiz', bitisTarihi: null };
    }

    cache.set(`guild:${guildId}:abonelik`, { veri: abonelik, zaman: Date.now() });
    return abonelik;
}

function abonelikCacheTemizle(guildId) {
    cache.delete(`guild:${guildId}:abonelik`);
}

async function premiumMi(guildId) {
    const abonelik = await abonelikGetir(guildId);
    return abonelik.plan === 'premium' || abonelik.plan === 'ultra';
}

async function planLimitleriGetir(guildId) {
    const abonelik = await abonelikGetir(guildId);
    return PLAN_LIMITLERI[abonelik.plan] || PLAN_LIMITLERI['ücretsiz'];
}

module.exports = { abonelikGetir, abonelikCacheTemizle, premiumMi, planLimitleriGetir, PLAN_LIMITLERI };
