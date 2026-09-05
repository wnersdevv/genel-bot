const Seviye = require('../database/models/Seviye');
const { temelEmbed } = require('../utils/embedOlustur');
const emojis = require('../utils/emojis');
const { basariVer } = require('./basariService');

async function xpEkle(client, message, guildAyari) {
    const cooldownSn = guildAyari.seviyeAyar?.cooldownSn ?? 60;
    const xpMin = guildAyari.seviyeAyar?.xpMin ?? 15;
    const xpMax = guildAyari.seviyeAyar?.xpMax ?? 25;

    let kayit = await Seviye.findOne({ guildId: message.guild.id, kullaniciId: message.author.id });
    const yeniKullaniciMi = !kayit;
    if (!kayit) {
        kayit = new Seviye({ guildId: message.guild.id, kullaniciId: message.author.id });
    }

    const simdi = Date.now();
    if (kayit.sonMesajZamani && simdi - new Date(kayit.sonMesajZamani).getTime() < cooldownSn * 1000) {
        kayit.toplamMesaj += 1;
        await kayit.save();
        return;
    }

    const kazanilanXp = Math.floor(Math.random() * (xpMax - xpMin + 1)) + xpMin;
    kayit.xp += kazanilanXp;
    kayit.toplamMesaj += 1;
    kayit.sonMesajZamani = new Date();

    const gerekliXp = Seviye.gerekliXp(kayit.seviye);
    let seviyeAtladi = false;

    if (kayit.xp >= gerekliXp) {
        kayit.xp -= gerekliXp;
        kayit.seviye += 1;
        seviyeAtladi = true;
    }

    await kayit.save();

    if (yeniKullaniciMi) basariVer(message.guild.id, message.author.id, 'ilk-mesaj', message.channel).catch(() => {});
    if (kayit.toplamMesaj === 100) basariVer(message.guild.id, message.author.id, 'yuz-mesaj', message.channel).catch(() => {});
    if (kayit.toplamMesaj === 1000) basariVer(message.guild.id, message.author.id, 'bin-mesaj', message.channel).catch(() => {});

    if (seviyeAtladi) {
        const embed = temelEmbed({
            tip: 'basari',
            baslik: `${emojis.seviye} Seviye Atladın!`,
            aciklama: `Tebrikler ${message.author}, **Seviye ${kayit.seviye}**'e ulaştın!`
        });
        message.channel.send({ embeds: [embed] }).catch(() => {});

        if (kayit.seviye === 1) basariVer(message.guild.id, message.author.id, 'ilk-seviye', message.channel).catch(() => {});
        if (kayit.seviye === 10) basariVer(message.guild.id, message.author.id, 'seviye-10', message.channel).catch(() => {});

        const odul = guildAyari.roller?.seviyeÖdülleri?.find(r => r.seviye === kayit.seviye);
        if (odul) {
            const rol = message.guild.roles.cache.get(odul.rolId);
            if (rol) message.member.roles.add(rol).catch(() => {});
        }
    }
}

module.exports = { xpEkle };
