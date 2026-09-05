const { guildDavetleriniOnbellekleGetir } = require('../services/davetService');

module.exports = {
    isim: 'inviteDelete',
    async execute(client, davet) {
        await guildDavetleriniOnbellekleGetir(davet.guild).catch(() => {});
    }
};
