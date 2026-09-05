const { guildDavetleriniOnbellekleGetir } = require('../services/davetService');

module.exports = {
    isim: 'inviteCreate',
    async execute(client, davet) {
        await guildDavetleriniOnbellekleGetir(davet.guild).catch(() => {});
    }
};
