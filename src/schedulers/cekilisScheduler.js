const Cekilis = require('../database/models/Cekilis');
const { temelEmbed } = require('../utils/embedOlustur');
const emojis = require('../utils/emojis');
const { basariVer } = require('../services/basariService');

async function cekilisleriKontrolEt(client) {
    const suanBitecekler = await Cekilis.find({ durum: 'aktif', bitisZamani: { $lte: new Date() } });

    for (const cekilis of suanBitecekler) {
        try {
            await cekilisiBitir(client, cekilis);
        } catch (hata) {
            console.error(`[Çekiliş Scheduler] ${cekilis._id} bitirilirken hata:`, hata);
        }
    }
}

async function cekilisiBitir(client, cekilis) {
    const guild = client.guilds.cache.get(cekilis.guildId);
    const kanal = guild?.channels.cache.get(cekilis.kanalId);

    if (!kanal) {
        cekilis.durum = 'iptal';
        return cekilis.save();
    }

    const katilimcilar = [...cekilis.katilimcilar];
    const kazananlar = [];
    const kazananSayisi = Math.min(cekilis.kazananSayisi, katilimcilar.length);

    for (let i = 0; i < kazananSayisi; i++) {
        const index = Math.floor(Math.random() * katilimcilar.length);
        kazananlar.push(katilimcilar.splice(index, 1)[0]);
    }

    cekilis.durum = 'bitti';
    cekilis.kazananlar = kazananlar;
    await cekilis.save();

    for (const kazananId of kazananlar) {
        basariVer(cekilis.guildId, kazananId, 'cekilis-kazanan', null).catch(() => {});
    }

    const embed = temelEmbed({
        tip: kazananlar.length ? 'basari' : 'uyari',
        baslik: `${emojis.cekilis} Çekiliş Sona Erdi`,
        aciklama: kazananlar.length
            ? `**${cekilis.odul}** ödülünü kazananlar:\n${kazananlar.map(id => `<@${id}>`).join(', ')}`
            : `**${cekilis.odul}** çekilişine kimse katılmadığı için kazanan belirlenemedi.`
    });

    const mesaj = await kanal.messages.fetch(cekilis.mesajId).catch(() => null);
    if (mesaj) await mesaj.reply({ embeds: [embed] }).catch(() => {});
    else await kanal.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { cekilisleriKontrolEt, cekilisiBitir };
