/**
 * src/utils/ayarlar.js
 * wnersdev - Merkezi varsayılan ayarlar dosyası.
 * Bu dosyadaki değerler VARSAYILANDIR. Sunucuya özel gerçek ayarlar
 * MongoDB (Guild modeli) üzerinde tutulur ve bu varsayılanların üzerine yazılır.
 * Token/bağlantı gibi ortam ayarları için "ayarlar.json" ve src/utils/config.js kullanılır.
 */

const config = require('./config');

module.exports = {
    bot: {
        isim: 'wnersdev',
        varsayilanPrefix: config.varsayilanPrefix || '!',
        varsayilanDil: 'tr',
        renk: {
            ana: 0x5865F2,
            basari: 0x57F287,
            hata: 0xED4245,
            uyari: 0xFEE75C,
            bilgi: 0x5865F2,
            noturk: 0x2B2D31
        }
    },

    // Sırayla değişen 10 presence. utils/ayarlar.js üzerinden özelleştirilebilir.
    presence: {
        aralikMs: 30_000,
        durumlar: [
            { tip: 'Watching', metin: '🛡️ Sunucuları koruyor' },
            { tip: 'Playing', metin: '🤖 wnersdev aktif' },
            { tip: 'Watching', metin: '🎫 Ticket yönetiyor' },
            { tip: 'Listening', metin: '🎵 Müzik oynatıyor' },
            { tip: 'Watching', metin: '🎉 Çekiliş yönetiyor' },
            { tip: 'Playing', metin: '💰 Ekonomiyi yönetiyor' },
            { tip: 'Watching', metin: '⭐ Seviyeleri takip ediyor' },
            { tip: 'Watching', metin: '🔐 Güvenliği kontrol ediyor' },
            { tip: 'Playing', metin: '🧰 Sunucu araçlarını yönetiyor' },
            { tip: 'Listening', metin: '🤖 Yardıma hazır' }
        ]
    },

    // Modüllerin varsayılan açık/kapalı durumu (guild ayarı bunu ezer)
    modüller: {
        moderasyon: true,
        koruma: true,
        mesajFiltreleme: true,
        ticket: true,
        müzik: true,
        eğlence: true,
        ekonomi: true,
        seviye: true,
        çekiliş: true,
        öneri: true,
        özelOda: true,
        hoşgeldin: true,
        güleGüle: true,
        otoRol: true,
        rolMenü: true,
        starboard: false,
        afk: true,
        doğumGünü: true,
        itibar: true,
        tag: true,
        otomatikCevap: true,
        hatırlatıcı: true,
        zamanlayıcı: true,
        duyuru: true,
        log: true,
        backup: true
    },

    limitler: {
        uyariMaksimum: 10,
        ticketKullanıcıBaşınaMaksimum: 3,
        özelOdaSesLimitVarsayılan: 0,
        ekonomiGünlükMiktar: 250,
        ekonomiÇalışMinMax: [50, 200],
        seviyeXpMinMax: [15, 25],
        seviyeCooldownSn: 60,
        çekilişMaksimumKazanan: 20,
        komutCooldownVarsayılanSn: 3
    },

    varsayılanKanallar: {
        log: null,
        moderasyonLog: null,
        güvenlikLog: null,
        ticketLog: null,
        ekonomiLog: null,
        karşılama: null,
        güleGüle: null,
        öneri: null,
        starboard: null
    },

    varsayılanRoller: {
        otoRol: [],
        mute: null,
        ticketYetkili: [],
        seviyeÖdülleri: [] // { seviye, rolId }
    },

    koruma: {
        antiNukeEsikSn: 10,
        antiRaidKatilimEsik: 10,
        antiRaidPencereSn: 30,
        antiSpamMesajEsik: 5,
        antiSpamPencereSn: 5
    },

    sistem: {
        geliştiriciIdleri: Array.isArray(config.developerIds) ? config.developerIds : [],
        embedFooter: 'wnersdev • Tek bot, bütün sunucu.'
    }
};
