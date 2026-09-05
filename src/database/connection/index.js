const mongoose = require('mongoose');
const chalk = require('chalk');
const config = require('../../utils/config');

async function veritabaninaBaglan() {
    const uri = config.mongodbUri;
    if (!uri) {
        throw new Error('"ayarlar.json" içinde "mongodbUri" tanımlı değil.');
    }

    mongoose.set('strictQuery', true);

    mongoose.connection.on('connected', () => {
        console.log(chalk.green('[Veritabanı] MongoDB bağlantısı kuruldu.'));
    });

    mongoose.connection.on('error', (hata) => {
        console.error(chalk.red('[Veritabanı] Bağlantı hatası:'), hata);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn(chalk.yellow('[Veritabanı] MongoDB bağlantısı koptu, yeniden bağlanmaya çalışılıyor...'));
    });

    await mongoose.connect(uri);
    return mongoose.connection;
}

module.exports = { veritabaninaBaglan, mongoose };
