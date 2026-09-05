const Davet = require('../database/models/Davet');

// key: guildId -> Map<kod, kullanimSayisi>
const davetOnbellegi = new Map();

async function guildDavetleriniOnbellekleGetir(guild) {
    try {
        const davetler = await guild.invites.fetch();
        const harita = new Map(davetler.map(d => [d.code, d.uses || 0]));
        davetOnbellegi.set(guild.id, harita);
        return harita;
    } catch {
        // Bot "Davetleri Yönet" yetkisine sahip değilse sessizce geç
        davetOnbellegi.set(guild.id, new Map());
        return new Map();
    }
}

/**
 * Yeni katılan üye için hangi davetin kullanıldığını tespit eder,
 * DB'deki sayaçları günceller ve kullanılan kodu döner (bulunamazsa null).
 */
async function katilanUyeIcinDavetTespitEt(guild) {
    const eskiHarita = davetOnbellegi.get(guild.id) || new Map();
    const yeniHarita = await guildDavetleriniOnbellekleGetir(guild);

    let kullanilanKod = null;
    for (const [kod, kullanim] of yeniHarita) {
        const eskiKullanim = eskiHarita.get(kod) || 0;
        if (kullanim > eskiKullanim) {
            kullanilanKod = kod;
            break;
        }
    }

    if (kullanilanKod) {
        const davet = await guild.invites.fetch().then(d => d.get(kullanilanKod)).catch(() => null);
        await Davet.findOneAndUpdate(
            { guildId: guild.id, kod: kullanilanKod },
            { $inc: { kullanimSayisi: 1 }, $setOnInsert: { olusturanId: davet?.inviter?.id || null } },
            { upsert: true }
        );
    }

    return kullanilanKod;
}

module.exports = { guildDavetleriniOnbellekleGetir, katilanUyeIcinDavetTespitEt };
