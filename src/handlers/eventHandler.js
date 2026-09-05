const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function eventleriYukle(client) {
    const dizin = path.join(__dirname, '..', 'events');
    const dosyalar = fs.readdirSync(dizin).filter(d => d.endsWith('.js'));

    for (const dosya of dosyalar) {
        const event = require(path.join(dizin, dosya));
        if (!event?.isim || !event?.execute) {
            console.warn(chalk.yellow(`[Event] Geçersiz event dosyası atlandı: ${dosya}`));
            continue;
        }

        if (event.birKere) {
            client.once(event.isim, (...args) => event.execute(client, ...args));
        } else {
            client.on(event.isim, (...args) => event.execute(client, ...args));
        }
    }

    console.log(chalk.cyan(`[Event] ${dosyalar.length} event dosyası yüklendi.`));
}

module.exports = { eventleriYukle };
