const cooldownlar = new Map(); // key: `${komutIsmi}:${kullaniciId}` -> bitisZamani (ms)

/**
 * @returns {number} 0 ise kullanılabilir, aksi halde kalan saniye
 */
function kalanSure(komutIsmi, kullaniciId, cooldownSn) {
    const anahtar = `${komutIsmi}:${kullaniciId}`;
    const bitis = cooldownlar.get(anahtar);
    const simdi = Date.now();

    if (bitis && simdi < bitis) {
        return Math.ceil((bitis - simdi) / 1000);
    }

    cooldownlar.set(anahtar, simdi + cooldownSn * 1000);
    return 0;
}

module.exports = { kalanSure };
