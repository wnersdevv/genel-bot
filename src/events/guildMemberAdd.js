const { guildAyariGetir } = require('../services/guildService');
const { katilanUyeIcinDavetTespitEt } = require('../services/davetService');
const { autoroleUygula, welcomeGonder } = require('../services/uyeKatilimService');
const { katilimDenetimi } = require('../services/antiRaidService');
const { korumaAyariGetir, korumaAyariGuncelle, muafMi } = require('../services/korumaService');
const logger = require('../utils/logger');

module.exports = {
    isim: 'guildMemberAdd',
    async execute(client, uye) {
        const guildAyari = await guildAyariGetir(uye.guild.id);

        if (guildAyari.modüller.koruma) {
            await katilimDenetimi(uye).catch(h => logger.hata('AntiRaid', h.message));

            // Anti bot-ekleme: yetkisiz eklenen botları engelle
            if (uye.user.bot) {
                const korumaAyari = await korumaAyariGetir(uye.guild.id);
                if (korumaAyari.aktif && korumaAyari.botEkleme.aktif && !muafMi(korumaAyari, uye.guild, uye)) {
                    const ceza = korumaAyari.botEkleme.ceza;
                    if (ceza === 'ban' && uye.bannable) await uye.ban({ reason: '[Koruma] İzinsiz bot eklendi' }).catch(() => {});
                    else if (ceza === 'kick' && uye.kickable) await uye.kick('[Koruma] İzinsiz bot eklendi').catch(() => {});
                    return;
                }
            }
        }

        if (guildAyari.modüller.otoRol) {
            await autoroleUygula(uye).catch(h => logger.hata('Autorole', h.message));
        }

        if (guildAyari.modüller.hoşgeldin) {
            await welcomeGonder(uye).catch(h => logger.hata('Welcome', h.message));
        }

        katilanUyeIcinDavetTespitEt(uye.guild).catch(() => {});
    }
};
