const Ekonomi = require('../database/models/Ekonomi');

async function ekonomiKaydiGetir(guildId, kullaniciId) {
    let kayit = await Ekonomi.findOne({ guildId, kullaniciId });
    if (!kayit) {
        kayit = await Ekonomi.create({ guildId, kullaniciId });
    }
    return kayit;
}

module.exports = { ekonomiKaydiGetir };
