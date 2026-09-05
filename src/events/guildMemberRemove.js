const { guildAyariGetir } = require('../services/guildService');
const { ayrilisGonder } = require('../services/uyeKatilimService');
const logger = require('../utils/logger');

module.exports = {
    isim: 'guildMemberRemove',
    async execute(client, uye) {
        const guildAyari = await guildAyariGetir(uye.guild.id);
        if (!guildAyari.modüller.güleGüle) return;

        await ayrilisGonder(uye).catch(h => logger.hata('Ayrılış', h.message));
    }
};
