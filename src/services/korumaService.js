const { PermissionFlagsBits, AuditLogEvent } = require('discord.js');
const Koruma = require('../database/models/Koruma');
const { temelEmbed } = require('../utils/embedOlustur');
const emojis = require('../utils/emojis');
const logger = require('../utils/logger');

const cache = new Map();
const CACHE_MS = 60_000;

// `${guildId}:${userId}:${olayTipi}` -> zaman damgaları
const olaySayaci = new Map();

async function korumaAyariGetir(guildId) {
    const onbellek = cache.get(`guild:${guildId}:koruma`);
    if (onbellek && Date.now() - onbellek.zaman < CACHE_MS) return onbellek.veri;

    let ayar = await Koruma.findOne({ guildId });
    if (!ayar) ayar = await Koruma.create({ guildId });

    cache.set(`guild:${guildId}:koruma`, { veri: ayar, zaman: Date.now() });
    return ayar;
}

async function korumaAyariGuncelle(guildId, guncelleme) {
    const ayar = await Koruma.findOneAndUpdate({ guildId }, { $set: guncelleme }, { upsert: true, new: true });
    cache.delete(`guild:${guildId}:koruma`);
    return ayar;
}

function korumaCacheTemizle(guildId) {
    cache.delete(`guild:${guildId}:koruma`);
}

/** Kullanıcı beyaz listede mi, sunucu sahibi mi veya bot'un kendisi mi? */
function muafMi(ayar, guild, uye) {
    if (!uye) return true;
    if (uye.id === guild.ownerId) return true;
    if (uye.id === guild.client.user.id) return true;
    if (ayar.beyazListe.kullanicilar.includes(uye.id)) return true;
    return uye.roles?.cache?.some(r => ayar.beyazListe.roller.includes(r.id)) ?? false;
}

/** Belirli bir olay için eşik aşıldı mı? */
function esikAsildiMi(guildId, userId, olayTipi, limit, pencereSn) {
    const anahtar = `${guildId}:${userId}:${olayTipi}`;
    const simdi = Date.now();
    const gecmis = (olaySayaci.get(anahtar) || []).filter(z => simdi - z < pencereSn * 1000);

    gecmis.push(simdi);
    olaySayaci.set(anahtar, gecmis);

    return gecmis.length >= limit;
}

/** Eşiği aşan kullanıcıya yapılandırılmış cezayı uygular. */
async function cezaUygula(guild, uye, ceza, sebep) {
    if (!uye || ceza === 'yok') return 'işlem yapılmadı';

    try {
        if (ceza === 'ban' && uye.bannable) {
            await guild.members.ban(uye.id, { reason: sebep });
            return 'yasaklandı';
        }
        if (ceza === 'kick' && uye.kickable) {
            await uye.kick(sebep);
            return 'sunucudan atıldı';
        }
        if (ceza === 'rol-al') {
            const alinabilir = uye.roles.cache.filter(r =>
                r.id !== guild.id && !r.managed && r.position < guild.members.me.roles.highest.position
            );
            if (alinabilir.size) {
                await uye.roles.remove(alinabilir, sebep);
                return `${alinabilir.size} rolü alındı`;
            }
            return 'alınabilir rolü yok';
        }
    } catch (hata) {
        logger.uyari('Koruma', `Ceza uygulanamadı (${guild.id}): ${hata.message}`);
        return 'ceza uygulanamadı (yetki yetersiz)';
    }

    return 'işlem yapılmadı';
}

/** Güvenlik olayını log kanalına bildirir. */
async function guvenlikLogu(guild, ayar, { tip, uye, detay, alinanOnlem, riskPuani }) {
    const kanalId = ayar.logKanaliId;
    if (!kanalId) return;

    const kanal = guild.channels.cache.get(kanalId);
    if (!kanal?.isTextBased()) return;

    await kanal.send({
        embeds: [temelEmbed({
            tip: 'hata',
            baslik: `${emojis.guvenlik} GÜVENLİK OLAYI`,
            alanlar: [
                { name: 'Tür', value: tip, inline: true },
                { name: 'Kullanıcı', value: uye ? `${uye} (${uye.id})` : 'Bilinmiyor', inline: true },
                { name: 'Risk', value: `${riskPuani}/100`, inline: true },
                { name: 'Detay', value: detay },
                { name: 'Alınan Önlem', value: alinanOnlem }
            ]
        })]
    }).catch(() => {});
}

/** Denetim kaydından bir olayı gerçekleştiren kullanıcıyı bulur. */
async function sorumluyuBul(guild, auditTipi, hedefId = null) {
    if (!guild.members.me.permissions.has(PermissionFlagsBits.ViewAuditLog)) return null;

    const kayitlar = await guild.fetchAuditLogs({ type: auditTipi, limit: 5 }).catch(() => null);
    if (!kayitlar) return null;

    const kayit = kayitlar.entries.find(e =>
        Date.now() - e.createdTimestamp < 10_000 && (!hedefId || e.targetId === hedefId)
    );
    if (!kayit?.executorId) return null;

    return guild.members.fetch(kayit.executorId).catch(() => null);
}

/**
 * Anti-nuke ana denetimi: bir olayın sorumlusunu bulur, eşiği kontrol eder,
 * gerekirse ceza uygular ve güvenlik logu düşer.
 */
async function nukeDenetimi(guild, { alanAdi, auditTipi, tipEtiketi, hedefId = null }) {
    const ayar = await korumaAyariGetir(guild.id);
    if (!ayar.aktif) return;

    const kural = ayar[alanAdi];
    if (!kural?.aktif) return;

    const sorumlu = await sorumluyuBul(guild, auditTipi, hedefId);
    if (!sorumlu || muafMi(ayar, guild, sorumlu)) return;

    if (!esikAsildiMi(guild.id, sorumlu.id, alanAdi, kural.limit, kural.pencereSn)) return;

    const sebep = `[Anti-Nuke] ${tipEtiketi} eşiği aşıldı`;
    const alinanOnlem = await cezaUygula(guild, sorumlu, kural.ceza, sebep);
    const riskPuani = Math.min(100, 50 + kural.limit * 10);

    await guvenlikLogu(guild, ayar, {
        tip: tipEtiketi,
        uye: sorumlu,
        detay: `${kural.pencereSn} saniye içinde ${kural.limit} veya daha fazla işlem yapıldı.`,
        alinanOnlem,
        riskPuani
    });

    logger.uyari('Koruma', `${guild.id} — ${tipEtiketi}: ${sorumlu.user.tag} → ${alinanOnlem}`);
}

/** Sunucu kanallarını topluca kilitler veya açar. */
async function lockdownUygula(guild, kilitle, baslatanId = null) {
    const ayar = await korumaAyariGetir(guild.id);
    const herkes = guild.roles.everyone;
    const etkilenen = [];

    const kanallar = guild.channels.cache.filter(k =>
        k.isTextBased() && !k.isThread() && k.permissionsFor(guild.members.me)?.has(PermissionFlagsBits.ManageChannels)
    );

    for (const [, kanal] of kanallar) {
        const basarili = await kanal.permissionOverwrites
            .edit(herkes, { SendMessages: kilitle ? false : null }, { reason: kilitle ? 'Lockdown başlatıldı' : 'Lockdown kaldırıldı' })
            .then(() => true).catch(() => false);

        if (basarili) etkilenen.push(kanal.id);
    }

    await korumaAyariGuncelle(guild.id, {
        'lockdown.aktif': kilitle,
        'lockdown.baslangic': kilitle ? new Date() : null,
        'lockdown.baslatanId': kilitle ? baslatanId : null,
        'lockdown.kilitliKanallar': kilitle ? etkilenen : []
    });

    return etkilenen.length;
}

module.exports = {
    korumaAyariGetir, korumaAyariGuncelle, korumaCacheTemizle,
    nukeDenetimi, cezaUygula, guvenlikLogu, muafMi, esikAsildiMi, lockdownUygula
};
