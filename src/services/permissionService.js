const ayarlar = require('../utils/ayarlar');

/**
 * Kullanıcının verilen Discord izinlerine sahip olup olmadığını kontrol eder.
 * @returns {boolean}
 */
function kullaniciYetkisiVarMi(uye, gerekliIzinler = []) {
    if (!uye) return false;
    if (gerekliIzinler.length === 0) return true;
    return uye.permissions.has(gerekliIzinler);
}

/**
 * Botun kendisinin verilen izinlere sahip olup olmadığını kontrol eder.
 */
function botYetkisiVarMi(guild, gerekliIzinler = []) {
    const botUyesi = guild.members.me;
    if (!botUyesi) return false;
    if (gerekliIzinler.length === 0) return true;
    return botUyesi.permissions.has(gerekliIzinler);
}

/**
 * Role hierarchy kontrolü: yetkili, hedef kullanıcıdan üst rütbede mi?
 */
function rolHiyerarsisiUygunMu(yetkiliUye, hedefUye) {
    if (hedefUye.guild.ownerId === hedefUye.id) return false; // sunucu sahibine işlem yapılamaz
    if (yetkiliUye.id === hedefUye.guild.ownerId) return true; // sunucu sahibi her zaman yapabilir
    return yetkiliUye.roles.highest.position > hedefUye.roles.highest.position;
}

function kullaniciGelistiriciMi(kullaniciId) {
    return ayarlar.sistem.geliştiriciIdleri.includes(kullaniciId);
}

module.exports = {
    kullaniciYetkisiVarMi,
    botYetkisiVarMi,
    rolHiyerarsisiUygunMu,
    kullaniciGelistiriciMi
};
