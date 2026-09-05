const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function klasordekiBileşenleriYukle(dizin, hedefCollection, etiket) {
    if (!fs.existsSync(dizin)) return 0;
    const dosyalar = fs.readdirSync(dizin).filter(d => d.endsWith('.js'));
    let sayac = 0;

    for (const dosya of dosyalar) {
        const bilesen = require(path.join(dizin, dosya));
        if (!bilesen?.customId || !bilesen?.execute) {
            console.warn(chalk.yellow(`[${etiket}] Geçersiz dosya atlandı: ${dosya}`));
            continue;
        }
        hedefCollection.set(bilesen.customId, bilesen);
        sayac++;
    }
    return sayac;
}

function bileşenleriYukle(client) {
    const kok = path.join(__dirname, '..', 'components');

    const b = klasordekiBileşenleriYukle(path.join(kok, 'buttons'), client.butonlar, 'Buton');
    const m = klasordekiBileşenleriYukle(path.join(kok, 'menus'), client.menuler, 'Menü');
    const mo = klasordekiBileşenleriYukle(path.join(kok, 'modals'), client.modallar, 'Modal');

    console.log(chalk.cyan(`[Bileşen] ${b} buton, ${m} menü, ${mo} modal yüklendi.`));
}

module.exports = { bileşenleriYukle };
