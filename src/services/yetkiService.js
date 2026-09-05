const { PermissionsBitField } = require('discord.js');
const logger = require('../utils/logger');

const MANAGE_GUILD = 0x20n;
const ADMINISTRATOR = 0x8n;

/**
 * Dashboard isteklerinde kullanıcının hedef sunucudaki gerçek Discord
 * yetkisini doğrular. OAuth2 oturumuna körü körüne güvenilmez:
 * kullanıcının o an gerçekten sunucuda üye olup olmadığı ve yetkisi
 * Discord tarafından tekrar kontrol edilir.
 */
async function dashboardGuildYetkisi(client, kullanici, guildId) {
    if (!kullanici?.id || !guildId) {
        return { izinli: false, sebep: 'Oturum bilgisi eksik.' };
    }

    // 1. OAuth2 oturumunda bu sunucu görünüyor mu?
    const oturumSunucusu = kullanici.yönetilebilirSunucular?.find(g => g.id === guildId);
    if (!oturumSunucusu) {
        return { izinli: false, sebep: 'Bu sunucuyu yönetme yetkiniz yok.' };
    }

    // 2. Bot gerçekten bu sunucuda mı?
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        return { izinli: false, sebep: 'Bot bu sunucuda bulunmuyor.', botYok: true };
    }

    // 3. Kullanıcı hâlâ sunucunun üyesi mi ve yetkisi duruyor mu?
    const uye = await guild.members.fetch(kullanici.id).catch(() => null);
    if (!uye) {
        return { izinli: false, sebep: 'Bu sunucunun üyesi değilsiniz.' };
    }

    const sahipMi = guild.ownerId === uye.id;
    const yoneticiMi = uye.permissions.has(PermissionsBitField.Flags.Administrator);
    const sunucuyuYonetMi = uye.permissions.has(PermissionsBitField.Flags.ManageGuild);

    if (!sahipMi && !yoneticiMi && !sunucuyuYonetMi) {
        logger.uyari('Yetki', `${kullanici.id} kullanıcısı ${guildId} sunucusuna yetkisiz erişim denedi.`);
        return { izinli: false, sebep: 'Bu sunucuda "Sunucuyu Yönet" yetkiniz bulunmuyor.' };
    }

    return { izinli: true, guild, uye, sahipMi, yoneticiMi };
}

/** Kritik ayarlar yalnızca yönetici veya sunucu sahibi tarafından değiştirilebilir. */
function kritikIslemYetkisi(yetkiSonucu) {
    if (!yetkiSonucu.izinli) return false;
    return yetkiSonucu.sahipMi || yetkiSonucu.yoneticiMi;
}

/**
 * Bot ile hedef arasındaki rol hiyerarşisini doğrular.
 * @returns {{uygun: boolean, sebep?: string}}
 */
function hiyerarsiKontrol(guild, yetkiliUye, hedefUye) {
    if (hedefUye.id === guild.ownerId) {
        return { uygun: false, sebep: 'Sunucu sahibine bu işlem uygulanamaz.' };
    }
    if (hedefUye.id === guild.client.user.id) {
        return { uygun: false, sebep: 'Bu işlemi kendim üzerimde uygulayamam.' };
    }

    const botEnYuksek = guild.members.me.roles.highest.position;
    if (hedefUye.roles.highest.position >= botEnYuksek) {
        return { uygun: false, sebep: 'Botun rolü hedef kullanıcının rolünden düşük olduğu için işlem gerçekleştirilemedi.' };
    }

    if (yetkiliUye && yetkiliUye.id !== guild.ownerId) {
        if (yetkiliUye.roles.highest.position <= hedefUye.roles.highest.position) {
            return { uygun: false, sebep: 'Bu kullanıcı üzerinde işlem yapmak için yeterli rol seviyesine sahip değilsiniz.' };
        }
    }

    return { uygun: true };
}

module.exports = { dashboardGuildYetkisi, kritikIslemYetkisi, hiyerarsiKontrol, MANAGE_GUILD, ADMINISTRATOR };
