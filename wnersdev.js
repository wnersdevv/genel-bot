const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const chalk = require('chalk');
const config = require('./src/utils/config');

const { veritabaninaBaglan } = require('./src/database/connection');
const { komutlariYukle } = require('./src/handlers/commandHandler');
const { eventleriYukle } = require('./src/handlers/eventHandler');
const { bileşenleriYukle } = require('./src/handlers/componentHandler');
const { schedulerBaslat } = require('./src/schedulers');
const { dashboardBaslat } = require('./src/dashboard');
const logger = require('./src/utils/logger');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember]
});

client.slashKomutlari = new Collection();
client.prefixKomutlari = new Collection();
client.prefixAliaslar = new Collection();
client.butonlar = new Collection();
client.menuler = new Collection();
client.modallar = new Collection();

async function baslat() {
    console.log(chalk.magenta('🤖 wnersdev başlatılıyor...'));

    try {
        await veritabaninaBaglan();
    } catch (hata) {
        logger.hata('Başlatma', `MongoDB bağlantısı kurulamadı, bot durduruluyor: ${hata.message}`);
        process.exit(1);
    }

    komutlariYukle(client);
    bileşenleriYukle(client);
    eventleriYukle(client);
    schedulerBaslat(client);

    // Eski log dosyalarını temizle ve günlük olarak temizlemeyi sürdür
    logger.eskiLoglariTemizle();
    setInterval(() => logger.eskiLoglariTemizle(), 24 * 60 * 60 * 1000);

    await client.login(config.token);

    if (config.dashboardUrl) {
        dashboardBaslat(client);
    }
}

process.on('unhandledRejection', (hata) => {
    logger.hata('İşlenmeyen Hata', hata);
});

process.on('uncaughtException', (hata) => {
    logger.hata('Yakalanmayan Hata', hata);
});

process.on('SIGINT', async () => {
    logger.uyari('Kapatma', 'Kapatma sinyali alındı, bağlantılar kapatılıyor...');
    try {
        await client.destroy();
    } finally {
        process.exit(0);
    }
});

baslat();
