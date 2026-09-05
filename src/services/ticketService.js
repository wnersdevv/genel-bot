const Ticket = require('../database/models/Ticket');
const { guildAyariGetir } = require('./guildService');

/**
 * İçinde bulunulan kanalın bir ticket olup olmadığını ve kullanıcının
 * bu ticket üzerinde işlem yapma yetkisi olup olmadığını kontrol eder.
 * Yetkili rolüne sahip olanlar ve ticket sahibi işlem yapabilir.
 */
async function ticketYetkisiKontrol(interaction, sadeceYetkili = false) {
    const ticket = await Ticket.findOne({ kanalId: interaction.channel.id });
    if (!ticket) return { ticket: null, yetkili: false, hata: 'Bu kanal bir ticket değil.' };

    const guildAyari = await guildAyariGetir(interaction.guild.id);
    const yetkiliRolleri = guildAyari.roller?.ticketYetkili || [];
    const yetkiliRolVarMi = yetkiliRolleri.some(rolId => interaction.member.roles.cache.has(rolId));
    const yoneticiMi = interaction.member.permissions.has('ManageGuild');
    const sahibiMi = ticket.sahipId === interaction.user.id;

    const yetkiliMi = yetkiliRolVarMi || yoneticiMi;
    const izinli = sadeceYetkili ? yetkiliMi : (yetkiliMi || sahibiMi);

    return {
        ticket,
        yetkili: yetkiliMi,
        izinli,
        hata: izinli ? null : 'Bu işlem için ticket yetkilisi olmalısınız.'
    };
}

/**
 * Kanalın mesaj geçmişinden düz metin transkript üretir.
 * Discord tek seferde en fazla 100 mesaj döndürdüğü için sayfalama yapılır.
 */
async function transkriptOlustur(kanal, maksimumMesaj = 500) {
    const tumMesajlar = [];
    let sonId = null;

    while (tumMesajlar.length < maksimumMesaj) {
        const secenekler = { limit: 100, ...(sonId ? { before: sonId } : {}) };
        const grup = await kanal.messages.fetch(secenekler).catch(() => null);
        if (!grup || grup.size === 0) break;

        tumMesajlar.push(...grup.values());
        sonId = grup.last().id;
        if (grup.size < 100) break;
    }

    const satirlar = tumMesajlar
        .reverse()
        .map(m => {
            const zaman = new Date(m.createdTimestamp).toLocaleString('tr-TR');
            const ekler = m.attachments.size ? ` [${m.attachments.size} dosya eki]` : '';
            const icerik = m.content || (m.embeds.length ? '[embed]' : '');
            return `[${zaman}] ${m.author.tag}: ${icerik}${ekler}`;
        });

    return `Ticket Transkripti — ${kanal.name}\nOluşturulma: ${new Date().toLocaleString('tr-TR')}\nToplam mesaj: ${satirlar.length}\n${'='.repeat(50)}\n\n${satirlar.join('\n')}`;
}

module.exports = { ticketYetkisiKontrol, transkriptOlustur };
