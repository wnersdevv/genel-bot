const { temelEmbed } = require('../utils/embedOlustur');
const emojis = require('../utils/emojis');

/**
 * Guild ayarında tanımlı moderasyonLog kanalına standart bir log embed'i gönderir.
 */
async function moderasyonLogGonder(guild, guildAyari, { tip, kullanici, yetkili, sebep, caseNo, ekstra }) {
    const kanalId = guildAyari.kanallar?.moderasyonLog;
    if (!kanalId) return;

    const kanal = guild.channels.cache.get(kanalId);
    if (!kanal) return;

    const embed = temelEmbed({
        tip: 'uyari',
        baslik: `${emojis.moderasyon} ${tip} ${caseNo ? `— Case #${caseNo}` : ''}`,
        alanlar: [
            { name: 'Kullanıcı', value: `${kullanici} (${kullanici.id})`, inline: true },
            { name: 'Yetkili', value: `${yetkili} (${yetkili.id})`, inline: true },
            { name: 'Sebep', value: sebep || 'Belirtilmedi' },
            ...(ekstra || [])
        ]
    });

    await kanal.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { moderasyonLogGonder };
