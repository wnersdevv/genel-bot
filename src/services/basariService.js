const Basari = require('../database/models/Basari');
const BASARI_TANIMLARI = require('../utils/basariTanimlari');
const { temelEmbed } = require('../utils/embedOlustur');
const emojis = require('../utils/emojis');

/**
 * Kullanıcıya bir başarı vermeye çalışır. Zaten sahipse hiçbir şey yapmaz.
 * Yeni kazanıldıysa, verilen kanala (varsa) kutlama mesajı gönderir.
 */
async function basariVer(guildId, kullaniciId, basariAnahtari, bildirimKanali = null) {
    const tanim = BASARI_TANIMLARI[basariAnahtari];
    if (!tanim) return false;

    const kayit = await Basari.findOneAndUpdate(
        { guildId, kullaniciId },
        { $addToSet: { kazanilanBasarilar: basariAnahtari } },
        { upsert: true, new: false } // eski hali döner, yeni eklenip eklenmediğini anlamak için
    );

    const zatenVardi = kayit && kayit.kazanilanBasarilar.includes(basariAnahtari);
    if (zatenVardi) return false;

    if (bildirimKanali) {
        bildirimKanali.send({
            embeds: [temelEmbed({
                tip: 'basari',
                baslik: `${emojis.rozet} Yeni Başarı Kazanıldı!`,
                aciklama: `<@${kullaniciId}> **${tanim.isim}** rozetini kazandı!\n${tanim.aciklama}`
            })]
        }).catch(() => {});
    }

    return true;
}

module.exports = { basariVer, BASARI_TANIMLARI };
