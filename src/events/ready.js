const chalk = require('chalk');
const { ActivityType } = require('discord.js');
const ayarlar = require('../utils/ayarlar');

const aktiviteTipleri = {
    Playing: ActivityType.Playing,
    Watching: ActivityType.Watching,
    Listening: ActivityType.Listening,
    Competing: ActivityType.Competing
};

function presenceDondur(client) {
    let index = 0;
    const durumlar = ayarlar.presence.durumlar;

    const guncelle = () => {
        const durum = durumlar[index % durumlar.length];
        client.user.setPresence({
            activities: [{ name: durum.metin, type: aktiviteTipleri[durum.tip] ?? ActivityType.Playing }],
            status: 'online'
        });
        index++;
    };

    guncelle();
    setInterval(guncelle, ayarlar.presence.aralikMs);
}

module.exports = {
    isim: 'ready',
    birKere: true,
    execute(client) {
        console.log(chalk.green(`[wnersdev] ${client.user.tag} olarak giriş yapıldı.`));
        console.log(chalk.cyan(`[wnersdev] ${client.guilds.cache.size} sunucuda aktif.`));
        console.log(chalk.cyan(`[wnersdev] ${client.slashKomutlari.size} slash / ${client.prefixKomutlari.size} prefix komut hazır.`));

        // Davet takibi için tüm sunucuların mevcut davetlerini önbelleğe al
        const { guildDavetleriniOnbellekleGetir } = require('../services/davetService');
        for (const guild of client.guilds.cache.values()) {
            guildDavetleriniOnbellekleGetir(guild).catch(() => {});
        }

        presenceDondur(client);
    }
};
