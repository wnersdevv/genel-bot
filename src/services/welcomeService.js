const Welcome = require('../database/models/Welcome');

const cache = new Map();
const CACHE_MS = 60_000;

async function welcomeAyariGetir(guildId) {
    const onbellek = cache.get(`guild:${guildId}:welcome`);
    if (onbellek && Date.now() - onbellek.zaman < CACHE_MS) return onbellek.veri;

    let ayar = await Welcome.findOne({ guildId });
    if (!ayar) ayar = await Welcome.create({ guildId });

    cache.set(`guild:${guildId}:welcome`, { veri: ayar, zaman: Date.now() });
    return ayar;
}

async function welcomeAyariGuncelle(guildId, guncelleme) {
    const ayar = await Welcome.findOneAndUpdate({ guildId }, { $set: guncelleme }, { upsert: true, new: true });
    cache.delete(`guild:${guildId}:welcome`);
    return ayar;
}

function welcomeCacheTemizle(guildId) {
    cache.delete(`guild:${guildId}:welcome`);
}

const YER_TUTUCULAR = [
    '{user}', '{username}', '{displayName}', '{server}', '{serverName}',
    '{memberCount}', '{userAvatar}', '{serverIcon}', '{createdAt}', '{joinedAt}'
];

/** Mesaj şablonundaki yer tutucuları gerçek değerlerle değiştirir. */
function yerTutuculariDoldur(metin, uye) {
    if (!metin) return '';

    const tarihBicimle = (t) => (t ? new Date(t).toLocaleDateString('tr-TR') : 'bilinmiyor');

    return metin
        .replaceAll('{user}', `<@${uye.id}>`)
        .replaceAll('{username}', uye.user.username)
        .replaceAll('{displayName}', uye.displayName || uye.user.username)
        .replaceAll('{server}', uye.guild.name)
        .replaceAll('{serverName}', uye.guild.name)
        .replaceAll('{memberCount}', `${uye.guild.memberCount}`)
        .replaceAll('{userAvatar}', uye.user.displayAvatarURL({ extension: 'png' }))
        .replaceAll('{serverIcon}', uye.guild.iconURL({ extension: 'png' }) || '')
        .replaceAll('{createdAt}', tarihBicimle(uye.user.createdAt))
        .replaceAll('{joinedAt}', tarihBicimle(uye.joinedAt));
}

module.exports = { welcomeAyariGetir, welcomeAyariGuncelle, welcomeCacheTemizle, yerTutuculariDoldur, YER_TUTUCULAR };
