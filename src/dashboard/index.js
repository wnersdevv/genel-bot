const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const path = require('path');
const chalk = require('chalk');
const config = require('../utils/config');

const { pasaportuYapilandir } = require('./auth');
const anaRotalar = require('./routes/anaRotalar');
const apiRotalar = require('./routes/apiRotalar');
const genelRotalar = require('./routes/genelRotalar');
const { ioAyarla } = require('./soket');
const { botDurumuHesapla } = require('./botDurumHesapla');
const { csrfOlustur, csrfDogrula } = require('./middleware/csrf');

function dashboardBaslat(client) {
    const app = express();
    const sunucu = http.createServer(app);
    const io = new Server(sunucu, { path: '/soket' });
    const port = config.dashboardPort || 3000;

    ioAyarla(io);

    const oturum = session({
        secret: config.sessionSecret || 'wnersdev-gizli-anahtar',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: config.mongodbUri }),
        cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
    });

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '..', '..', 'views'));
    app.use(express.static(path.join(__dirname, '..', '..', 'public')));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(oturum);

    pasaportuYapilandir(passport);
    app.use(passport.initialize());
    app.use(passport.session());

    app.use((req, res, next) => {
        req.client = client;
        res.locals.config = config;
        res.locals.kullanici = req.user || null;
        next();
    });

    app.use(csrfOlustur);

    // Herkese açık uçlar (giriş ve CSRF gerektirmez, yalnızca okuma)
    app.use('/api/genel', genelRotalar);

    app.use('/', anaRotalar);
    app.use('/api', csrfDogrula, apiRotalar);

    // Bilinmeyen sayfalar için 404
    app.use((req, res) => {
        if (req.path.startsWith('/api')) return res.status(404).json({ hata: 'Uç nokta bulunamadı.' });
        res.status(404).render('pages/bulunamadi', { aktif: '', guild: null });
    });

    // Socket.IO'ya aynı Express oturumunu tanıt: böylece soket bağlantıları da
    // giriş yapmış kullanıcıyı bilir ve yetkisiz kimse guild odalarına katılamaz.
    io.engine.use(oturum);
    io.engine.use(passport.initialize());
    io.engine.use(passport.session());

    io.on('connection', (soket) => {
        const kullanici = soket.request.user;

        if (!kullanici) {
            soket.disconnect(true);
            return;
        }

        soket.emit('botDurum', botDurumuHesapla(client));

        soket.on('guildOdasinaKatil', (guildId) => {
            if (typeof guildId !== 'string') return;

            const yetkiliMi = kullanici.yönetilebilirSunucular?.some(g => g.id === guildId);
            if (!yetkiliMi) return;

            soket.join(`guild:${guildId}`);
        });
    });

    setInterval(() => {
        io.emit('botDurum', botDurumuHesapla(client));
    }, 8000);

    sunucu.listen(port, () => {
        console.log(chalk.green(`[Dashboard] http://localhost:${port} adresinde çalışıyor (Socket.IO aktif).`));
    });
}

module.exports = { dashboardBaslat };
