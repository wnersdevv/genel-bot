const { REST, Routes } = require('discord.js');
const path = require('path');
const config = require('../utils/config');
const logger = require('../utils/logger');
const { dosyalariTara } = require('./commandHandler');

const DISCORD_SLASH_LIMITI = 100;

async function komutlariDeployEt() {
    // Yalnızca commands/slash/ altındakiler Discord'a kaydedilir.
    // commands/prefix/ altındakiler yalnızca prefix olarak çalışır.
    const dizin = path.join(__dirname, '..', 'commands', 'slash');
    const dosyalar = dosyalariTara(dizin);
    const komutVerileri = [];

    for (const dosyaYolu of dosyalar) {
        const komut = require(dosyaYolu);
        if (komut?.data) {
            komutVerileri.push(komut.data.toJSON ? komut.data.toJSON() : komut.data);
        }
    }

    if (komutVerileri.length > DISCORD_SLASH_LIMITI) {
        logger.hata('Deploy', `${komutVerileri.length} slash komut var ancak Discord en fazla ${DISCORD_SLASH_LIMITI} tanesine izin verir.`);
        logger.hata('Deploy', `Fazla ${komutVerileri.length - DISCORD_SLASH_LIMITI} komutu src/commands/prefix/ altına taşıyın. Deploy iptal edildi.`);
        return;
    }

    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
        logger.bilgi('Deploy', `${komutVerileri.length}/${DISCORD_SLASH_LIMITI} slash komut kaydediliyor...`);

        const rota = config.guildId
            ? Routes.applicationGuildCommands(config.clientId, config.guildId)
            : Routes.applicationCommands(config.clientId);

        await rest.put(rota, { body: komutVerileri });

        logger.basari('Deploy', config.guildId
            ? 'Komutlar belirtilen sunucuya kaydedildi (anında görünür).'
            : 'Komutlar global olarak kaydedildi (yayılması ~1 saat sürebilir).');
    } catch (hata) {
        logger.hata('Deploy', `Komutlar kaydedilirken hata: ${hata.message}`);
    }
}

if (require.main === module) {
    komutlariDeployEt();
}

module.exports = { komutlariDeployEt };
