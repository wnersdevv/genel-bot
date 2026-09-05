const { guildAyariGetir } = require('./guildService');
const { transkriptOlustur } = require('./ticketService');
const { temelEmbed } = require('../utils/embedOlustur');
const emojis = require('../utils/emojis');
const { guildYayinla } = require('../dashboard/soket');

/**
 * Bir ticketı kapatır: durumu günceller, transkripti log kanalına gönderir,
 * ticket sahibine DM ile kopya iletir ve kanalı siler.
 */
async function ticketKapat(interaction, ticket, sebep = null) {
    await interaction.reply({
        embeds: [temelEmbed({
            tip: 'uyari',
            baslik: `${emojis.ticketKapat} Ticket Kapatılıyor`,
            aciklama: `Transkript kaydediliyor, kanal 5 saniye içinde silinecek.${sebep ? `\n**Sebep:** ${sebep}` : ''}`
        })]
    });

    ticket.durum = 'kapali';
    ticket.kapatanId = interaction.user.id;
    if (sebep) ticket.kapatilmaSebebi = sebep;
    await ticket.save();

    const transkript = await transkriptOlustur(interaction.channel);
    const dosya = { attachment: Buffer.from(transkript, 'utf-8'), name: `ticket-${ticket.ticketNo}.txt` };

    const guildAyari = await guildAyariGetir(interaction.guild.id);
    const logKanalId = guildAyari.ticketAyar?.transkriptKanaliId;

    if (logKanalId) {
        const logKanal = interaction.guild.channels.cache.get(logKanalId);
        if (logKanal) {
            await logKanal.send({
                embeds: [temelEmbed({
                    tip: 'bilgi',
                    baslik: `${emojis.ticketTranskript} Ticket #${ticket.ticketNo} Kapatıldı`,
                    alanlar: [
                        { name: 'Sahip', value: `<@${ticket.sahipId}>`, inline: true },
                        { name: 'Kapatan', value: `<@${interaction.user.id}>`, inline: true },
                        { name: 'Kategori', value: ticket.kategori, inline: true },
                        ...(sebep ? [{ name: 'Sebep', value: sebep }] : [])
                    ]
                })],
                files: [dosya]
            }).catch(() => {});
        }
    }

    // Ticket sahibine transkript kopyası gönder
    const sahip = await interaction.client.users.fetch(ticket.sahipId).catch(() => null);
    if (sahip) {
        sahip.send({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.ticketKapat} Ticketınız Kapatıldı`,
                aciklama: `**${interaction.guild.name}** sunucusundaki #${ticket.ticketNo} numaralı ticketınız kapatıldı.${sebep ? `\n**Sebep:** ${sebep}` : ''}`
            })],
            files: [dosya]
        }).catch(() => {});
    }

    guildYayinla(interaction.guild.id, 'bildirim', {
        tip: 'ticket',
        metin: `Ticket #${ticket.ticketNo} kapatıldı`,
        tarih: new Date()
    });

    setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
}

module.exports = { ticketKapat };
