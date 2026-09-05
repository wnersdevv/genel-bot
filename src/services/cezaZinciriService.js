const Warn = require('../database/models/Warn');
const { guildAyariGetir } = require('./guildService');
const { caseKaydet } = require('./caseService');
const { temelEmbed } = require('../utils/embedOlustur');
const emojis = require('../utils/emojis');
const logger = require('../utils/logger');

const CEZA_ETIKET = { sustur: 'susturuldu', kick: 'sunucudan atıldı', ban: 'yasaklandı' };

/**
 * Uyarı sonrası ceza zincirini değerlendirir.
 * Kullanıcının toplam uyarı sayısı bir kurala denk geliyorsa cezayı uygular.
 * @returns {string|null} uygulanan cezanın açıklaması
 */
async function cezaZinciriniUygula(guild, hedefUye, client) {
    const ayar = await guildAyariGetir(guild.id);
    if (!ayar.cezaZinciri?.aktif || !ayar.cezaZinciri.kurallar.length) return null;

    const uyariSayisi = await Warn.countDocuments({ guildId: guild.id, kullaniciId: hedefUye.id });
    const kural = ayar.cezaZinciri.kurallar.find(k => k.uyariSayisi === uyariSayisi);
    if (!kural) return null;

    const sebep = `[Ceza Zinciri] ${uyariSayisi}. uyarı`;

    try {
        if (kural.ceza === 'sustur') {
            const sureMs = Math.min((kural.sureDk || 60) * 60_000, 28 * 24 * 60 * 60 * 1000);
            await hedefUye.timeout(sureMs, sebep);
        } else if (kural.ceza === 'kick') {
            if (!hedefUye.kickable) return null;
            await hedefUye.kick(sebep);
        } else if (kural.ceza === 'ban') {
            if (!hedefUye.bannable) return null;
            await guild.members.ban(hedefUye.id, { reason: sebep });
        }
    } catch (hata) {
        logger.uyari('CezaZinciri', `${guild.id}: ${hata.message}`);
        return null;
    }

    const tipEslesme = { sustur: 'susturma', kick: 'atma', ban: 'yasaklama' };
    await caseKaydet(guild.id, tipEslesme[kural.ceza], hedefUye.id, client.user.id, sebep,
        kural.ceza === 'sustur' ? `${kural.sureDk} dakika` : null);

    return `${uyariSayisi}. uyarı nedeniyle otomatik olarak **${CEZA_ETIKET[kural.ceza]}**${kural.ceza === 'sustur' ? ` (${kural.sureDk} dk)` : ''}.`;
}

module.exports = { cezaZinciriniUygula };
