const Hatirlatici = require('../database/models/Hatirlatici');
const { temelEmbed } = require('../utils/embedOlustur');
const emojis = require('../utils/emojis');

async function hatirlaticilariKontrolEt(client) {
    const zamaniGelenler = await Hatirlatici.find({ gonderildi: false, hatirlatZamani: { $lte: new Date() } });

    for (const hatirlatici of zamaniGelenler) {
        try {
            const kanal = await client.channels.fetch(hatirlatici.kanalId).catch(() => null);
            if (kanal) {
                const embed = temelEmbed({
                    tip: 'bilgi',
                    baslik: `${emojis.hatirlatici} Hatırlatma`,
                    aciklama: hatirlatici.icerik
                });
                await kanal.send({ content: `<@${hatirlatici.kullaniciId}>`, embeds: [embed] }).catch(() => {});
            }
        } finally {
            hatirlatici.gonderildi = true;
            await hatirlatici.save();
        }
    }
}

module.exports = { hatirlaticilariKontrolEt };
