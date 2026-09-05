const { EmbedBuilder } = require('discord.js');
const ayarlar = require('./ayarlar');

const RENKLER = {
    basari: ayarlar.bot.renk.basari,
    hata: ayarlar.bot.renk.hata,
    uyari: ayarlar.bot.renk.uyari,
    bilgi: ayarlar.bot.renk.bilgi
};

/**
 * Standart embed üretir. Marka ayarı verilirse (guild bazlı) renk ve
 * alt bilgi o sunucunun markasına göre uygulanır.
 */
function temelEmbed({ tip = 'bilgi', baslik, aciklama, alanlar, footer = true, marka = null } = {}) {
    const embed = new EmbedBuilder();

    // Bilgi/başarı dışındaki durum renkleri anlamsal olduğu için korunur;
    // nötr bilgi embedlerinde sunucunun marka rengi kullanılır.
    if (marka?.embedRengi && (tip === 'bilgi' || tip === 'marka')) {
        const n = parseInt(String(marka.embedRengi).replace('#', ''), 16);
        embed.setColor(Number.isNaN(n) ? ayarlar.bot.renk.ana : n);
    } else {
        embed.setColor(RENKLER[tip] || ayarlar.bot.renk.ana);
    }

    if (baslik) embed.setTitle(baslik);
    if (aciklama) embed.setDescription(aciklama);
    if (alanlar) embed.addFields(alanlar);

    if (footer) {
        embed.setFooter({
            text: marka?.altBilgi || ayarlar.sistem.embedFooter,
            ...(marka?.logoUrl ? { iconURL: marka.logoUrl } : {})
        });
    }

    embed.setTimestamp();
    return embed;
}

/**
 * Guild markasını otomatik uygulayan embed üreticisi.
 * Kullanım: const embed = await markaliEmbed(guildId, { ... })
 */
async function markaliEmbed(guildId, secenekler = {}) {
    const { brandingGetir } = require('../services/brandingService');
    const marka = await brandingGetir(guildId).catch(() => null);
    return temelEmbed({ ...secenekler, marka });
}

module.exports = { temelEmbed, markaliEmbed };
