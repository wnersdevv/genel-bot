const StarboardMesaj = require('../database/models/StarboardMesaj');
const { guildAyariGetir } = require('../services/guildService');
const { temelEmbed } = require('../utils/embedOlustur');
const emojis = require('../utils/emojis');

module.exports = {
    isim: 'messageReactionAdd',
    async execute(client, reaction, kullanici) {
        if (kullanici.bot) return;
        if (reaction.partial) await reaction.fetch().catch(() => null);
        if (!reaction.message.guild) return;

        const guildAyari = await guildAyariGetir(reaction.message.guild.id);
        if (!guildAyari.modüller.starboard) return;

        const emoji = guildAyari.starboardAyar?.emoji || '⭐';
        if (reaction.emoji.name !== emoji) return;

        const esik = guildAyari.starboardAyar?.esikSayisi || 3;
        if (reaction.count < esik) return;

        const kanalId = guildAyari.kanallar?.starboard;
        if (!kanalId) return;
        const starboardKanal = reaction.message.guild.channels.cache.get(kanalId);
        if (!starboardKanal) return;

        const mevcut = await StarboardMesaj.findOne({ orijinalMesajId: reaction.message.id });
        if (mevcut) {
            const starMesaj = await starboardKanal.messages.fetch(mevcut.starboardMesajId).catch(() => null);
            if (starMesaj) {
                starMesaj.edit({ content: `${emoji} **${reaction.count}** — ${reaction.message.channel}` }).catch(() => {});
            }
            return;
        }

        const embed = temelEmbed({
            tip: 'bilgi',
            baslik: `${emojis.starboard} Öne Çıkan Mesaj`,
            aciklama: reaction.message.content || '*(içerik yok, muhtemelen sadece medya)*',
            alanlar: [{ name: 'Gönderen', value: `${reaction.message.author}`, inline: true }]
        });

        if (reaction.message.attachments.first()) {
            embed.setImage(reaction.message.attachments.first().url);
        }

        const yeniMesaj = await starboardKanal.send({
            content: `${emoji} **${reaction.count}** — ${reaction.message.channel}`,
            embeds: [embed]
        });

        await StarboardMesaj.create({
            guildId: reaction.message.guild.id,
            orijinalMesajId: reaction.message.id,
            starboardMesajId: yeniMesaj.id
        });
    }
};
