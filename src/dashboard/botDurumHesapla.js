const os = require('os');
const mongoose = require('mongoose');

const MONGO_DURUMLARI = ['bağlantı kesik', 'bağlı', 'bağlanıyor', 'kapatılıyor'];

function botDurumuHesapla(client) {
    return {
        discordOnline: client.ws.status === 0,
        discordPing: Math.round(client.ws.ping),
        mongoDurum: MONGO_DURUMLARI[mongoose.connection.readyState] || 'bilinmiyor',
        mongoBagliMi: mongoose.connection.readyState === 1,
        guildSayisi: client.guilds.cache.size,
        kullaniciSayisi: client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0),
        uptimeSaniye: Math.floor(process.uptime()),
        botUptimeMs: client.uptime,
        nodeVersiyon: process.version,
        discordJsVersiyon: require('discord.js').version,
        ramKullanimMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        ramToplamMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        yukOrtalamasi: os.loadavg()[0]?.toFixed(2) ?? null,
        slashKomutSayisi: client.slashKomutlari.size,
        prefixKomutSayisi: client.prefixKomutlari.size,
        zaman: new Date()
    };
}

module.exports = { botDurumuHesapla };
