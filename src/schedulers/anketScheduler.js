const Anket = require('../database/models/Anket');
const { sonucEmbedOlustur } = require('../commands/slash/sistem/anket');

async function anketleriKontrolEt(client) {
    const bitecekler = await Anket.find({ kapandi: false, bitisZamani: { $ne: null, $lte: new Date() } });

    for (const anket of bitecekler) {
        try {
            anket.kapandi = true;
            await anket.save();

            const guild = client.guilds.cache.get(anket.guildId);
            if (!guild) continue;

            const kanal = guild.channels.cache.get(anket.kanalId);
            const mesaj = kanal?.isTextBased?.() ? await kanal.messages.fetch(anket.mesajId).catch(() => null) : null;
            if (mesaj) await mesaj.edit({ embeds: [sonucEmbedOlustur(anket)], components: [] }).catch(() => {});
        } catch (hata) {
            console.error('[Anket Scheduler] Hata:', hata);
        }
    }
}

module.exports = { anketleriKontrolEt };
