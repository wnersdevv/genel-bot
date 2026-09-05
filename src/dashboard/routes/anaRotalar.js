const express = require('express');
const passport = require('passport');
const router = express.Router();
const { girisGerekli } = require('../auth');

function guildYukle(req, res, next) {
    const yetkiVarMi = req.user.yönetilebilirSunucular.some(g => g.id === req.params.guildId);
    if (!yetkiVarMi) {
        return res.status(403).render('pages/hata', {
            baslik: 'Yetkisiz Erişim',
            mesaj: 'Bu sunucuyu yönetme yetkiniz yok.'
        });
    }

    const guild = req.client.guilds.cache.get(req.params.guildId);
    if (!guild) {
        // Kullanıcı yetkili ama bot sunucuda değil: davet bağlantısı sun.
        const davetUrl = `https://discord.com/oauth2/authorize?client_id=${req.client.user.id}`
            + `&scope=bot%20applications.commands&permissions=8`
            + `&guild_id=${req.params.guildId}&disable_guild_select=true`;

        return res.status(404).render('pages/hata', {
            baslik: 'Bot Bu Sunucuda Değil',
            mesaj: 'Bu sunucuyu yönetebilmek için önce botu sunucuya eklemeniz gerekiyor.',
            butonMetni: '➕ Botu Davet Et',
            butonUrl: davetUrl
        });
    }

    req.guild = guild;
    next();
}

router.get('/', (req, res) => {
    res.render('anasayfa', { kullanici: req.user || null, clientId: req.client.user.id });
});

router.get('/durum', (req, res) => {
    res.render('pages/durum', { aktif: '', guild: null });
});

router.get('/hizmet-sartlari', (req, res) => {
    res.render('pages/hizmetSartlari', { aktif: '', guild: null });
});

router.get('/gizlilik', (req, res) => {
    res.render('pages/gizlilik', { aktif: '', guild: null });
});

router.get('/komutlar', (req, res) => {
    res.render('pages/komutRehberi', { aktif: '', guild: null, clientId: req.client.user.id });
});

router.get('/auth/discord', passport.authenticate('discord'));

router.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/sunucular');
});

router.get('/cikis', (req, res) => {
    req.logout(() => res.redirect('/'));
});

router.get('/sunucular', girisGerekli, (req, res) => {
    // Kullanıcının yönetebildiği her sunucu için botun orada olup olmadığını işaretle.
    const sunucular = req.user.yönetilebilirSunucular
        .map(sunucu => {
            const guild = req.client.guilds.cache.get(sunucu.id);
            return {
                id: sunucu.id,
                isim: sunucu.name,
                ikonUrl: sunucu.icon
                    ? `https://cdn.discordapp.com/icons/${sunucu.id}/${sunucu.icon}.png?size=128`
                    : null,
                botEkliMi: Boolean(guild),
                üyeSayısı: guild?.memberCount ?? null,
                sahipMi: Boolean(sunucu.owner)
            };
        })
        // Botun ekli olduğu sunucular üstte görünsün
        .sort((a, b) => Number(b.botEkliMi) - Number(a.botEkliMi) || a.isim.localeCompare(b.isim, 'tr'));

    res.render('sunucular', {
        sunucular,
        clientId: req.client.user.id
    });
});

router.get('/bot-durumu', girisGerekli, (req, res) => {
    res.render('pages/botDurumu', { aktif: 'bot-durumu', guild: null, sayfaBaslik: 'Sistem Sağlığı' });
});

router.get('/sunucu/:guildId', girisGerekli, guildYukle, (req, res) => {
    res.render('pages/genelBakis', { aktif: 'genel', guild: req.guild, sayfaBaslik: 'Genel Bakış' });
});

router.get('/sunucu/:guildId/moderasyon', girisGerekli, guildYukle, (req, res) => {
    res.render('pages/moderasyon', { aktif: 'moderasyon', guild: req.guild, sayfaBaslik: 'Moderasyon' });
});

router.get('/sunucu/:guildId/ticketlar', girisGerekli, guildYukle, (req, res) => {
    res.render('pages/ticketlar', { aktif: 'ticket', guild: req.guild, sayfaBaslik: 'Ticket' });
});

router.get('/sunucu/:guildId/uyeler', girisGerekli, guildYukle, (req, res) => {
    res.render('pages/uyeler', { aktif: 'uyeler', guild: req.guild, sayfaBaslik: 'Üyeler' });
});

router.get('/sunucu/:guildId/muzik', girisGerekli, guildYukle, (req, res) => {
    res.render('pages/muzik', { aktif: 'muzik', guild: req.guild, sayfaBaslik: 'Müzik' });
});

router.get('/sunucu/:guildId/roller-kanallar', girisGerekli, guildYukle, (req, res) => {
    res.render('pages/rollerKanallar', { aktif: 'roller', guild: req.guild, sayfaBaslik: 'Roller & Kanallar' });
});

router.get('/sunucu/:guildId/komutlar', girisGerekli, guildYukle, (req, res) => {
    res.render('pages/komutlar', { aktif: 'komutlar', guild: req.guild, sayfaBaslik: 'Komutlar' });
});

router.get('/sunucu/:guildId/oneriler', girisGerekli, guildYukle, (req, res) => {
    res.render('pages/oneriler', { aktif: 'oneriler', guild: req.guild, sayfaBaslik: 'Öneriler' });
});

router.get('/sunucu/:guildId/cekilisler', girisGerekli, guildYukle, (req, res) => {
    res.render('pages/cekilisler', { aktif: 'cekilisler', guild: req.guild, sayfaBaslik: 'Çekilişler' });
});

router.get('/sunucu/:guildId/analitik', girisGerekli, guildYukle, (req, res) => {
    res.render('pages/analitik', { aktif: 'analitik', guild: req.guild, sayfaBaslik: 'Analitik' });
});

router.get('/sunucu/:guildId/welcome', girisGerekli, guildYukle, (req, res) => {
    res.render('pages/welcome', { aktif: 'welcome', guild: req.guild, sayfaBaslik: 'Karşılama' });
});

router.get('/sunucu/:guildId/marka', girisGerekli, guildYukle, (req, res) => {
    res.render('pages/marka', { aktif: 'marka', guild: req.guild, sayfaBaslik: 'Bot Kimliği' });
});

router.get('/sunucu/:guildId/audit', girisGerekli, guildYukle, (req, res) => {
    res.render('pages/audit', { aktif: 'audit', guild: req.guild, sayfaBaslik: 'Denetim Kaydı' });
});

router.get('/sunucu/:guildId/ayarlar', girisGerekli, guildYukle, (req, res) => {
    res.render('pages/ayarlar', { aktif: 'ayarlar', guild: req.guild, sayfaBaslik: 'Ayarlar' });
});

module.exports = router;
