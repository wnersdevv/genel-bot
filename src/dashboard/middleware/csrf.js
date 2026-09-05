/**
 * src/dashboard/middleware/csrf.js
 * Basit ama etkili bir CSRF koruması: session'a bağlı rastgele bir token
 * üretilir, sayfalara <meta> ile gömülür, tarayıcı bunu her POST/PATCH/DELETE
 * isteğinde "X-CSRF-Token" header'ı olarak geri gönderir. Header eksik veya
 * yanlışsa istek reddedilir.
 */

const crypto = require('crypto');

function csrfOlustur(req, res, next) {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(24).toString('hex');
    }
    res.locals.csrfToken = req.session.csrfToken;
    next();
}

const DEGISTIREN_METODLAR = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

function csrfDogrula(req, res, next) {
    if (!DEGISTIREN_METODLAR.has(req.method)) return next();

    const gelenToken = req.get('X-CSRF-Token');
    if (!gelenToken || gelenToken !== req.session.csrfToken) {
        return res.status(403).json({ hata: 'Geçersiz veya eksik CSRF token. Sayfayı yenileyip tekrar deneyin.' });
    }
    next();
}

module.exports = { csrfOlustur, csrfDogrula };
