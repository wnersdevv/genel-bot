const beklemedekiIslemler = new Map(); // anahtar: token -> { tip, veri, zaman }
const GECERLILIK_MS = 60_000;

function onayTokenOlustur(tip, veri) {
    const token = `${tip}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    beklemedekiIslemler.set(token, { tip, veri, zaman: Date.now() });
    return token;
}

function onayVerisiGetir(token) {
    const kayit = beklemedekiIslemler.get(token);
    if (!kayit) return null;
    if (Date.now() - kayit.zaman > GECERLILIK_MS) {
        beklemedekiIslemler.delete(token);
        return null;
    }
    return kayit;
}

function onayVerisiTemizle(token) {
    beklemedekiIslemler.delete(token);
}

module.exports = { onayTokenOlustur, onayVerisiGetir, onayVerisiTemizle };
