const DogumGunu = require('../database/models/DogumGunu');
const { guildAyariGetir } = require('../services/guildService');
const { temelEmbed } = require('../utils/embedOlustur');
const emojis = require('../utils/emojis');

async function dogumGunleriniKontrolEt(client) {
    const bugun = new Date();
    const gun = bugun.getDate();
    const ay = bugun.getMonth() + 1;
    const yil = bugun.getFullYear();

    const kutlanacaklar = await DogumGunu.find({ gun, ay, sonKutlananYil: { $ne: yil } });

    for (const kayit of kutlanacaklar) {
        try {
            const guild = client.guilds.cache.get(kayit.guildId);
            if (!guild) continue;

            const guildAyari = await guildAyariGetir(kayit.guildId);
            if (!guildAyari.modüller.doğumGünü) continue;

            const kanalId = guildAyari.kanallar?.doğumGünü;
            const kanal = kanalId ? guild.channels.cache.get(kanalId) : guild.systemChannel;
            if (!kanal) continue;

            await kanal.send({
                embeds: [temelEmbed({
                    tip: 'basari',
                    baslik: `${emojis.dogumGunu} İyi ki Doğdun!`,
                    aciklama: `<@${kayit.kullaniciId}> bugün doğum gününü kutluyor! 🎉`
                })]
            }).catch(() => {});

            kayit.sonKutlananYil = yil;
            await kayit.save();
        } catch (hata) {
            console.error('[Doğum Günü Scheduler] Hata:', hata);
        }
    }
}

module.exports = { dogumGunleriniKontrolEt };
