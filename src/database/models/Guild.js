const { Schema, model } = require('mongoose');
const config = require('../../utils/config');

const guildSchema = new Schema({
    guildId: { type: String, required: true, unique: true, index: true },
    prefix: { type: String, default: config.varsayilanPrefix || '!' },
    dil: { type: String, default: 'tr' },

    modüller: {
        moderasyon: { type: Boolean, default: true },
        koruma: { type: Boolean, default: true },
        mesajFiltreleme: { type: Boolean, default: true },
        ticket: { type: Boolean, default: true },
        müzik: { type: Boolean, default: true },
        eğlence: { type: Boolean, default: true },
        ekonomi: { type: Boolean, default: true },
        seviye: { type: Boolean, default: true },
        çekiliş: { type: Boolean, default: true },
        öneri: { type: Boolean, default: true },
        özelOda: { type: Boolean, default: true },
        hoşgeldin: { type: Boolean, default: true },
        güleGüle: { type: Boolean, default: true },
        otoRol: { type: Boolean, default: true },
        starboard: { type: Boolean, default: false },
        afk: { type: Boolean, default: true },
        doğumGünü: { type: Boolean, default: true },
        itibar: { type: Boolean, default: true },
        tag: { type: Boolean, default: true },
        otomatikCevap: { type: Boolean, default: true },
        hatırlatıcı: { type: Boolean, default: true },
        duyuru: { type: Boolean, default: true },
        rolMenü: { type: Boolean, default: true },
        backup: { type: Boolean, default: true },
        log: { type: Boolean, default: true }
    },

    kanallar: {
        log: { type: String, default: null },
        moderasyonLog: { type: String, default: null },
        güvenlikLog: { type: String, default: null },
        ticketLog: { type: String, default: null },
        karşılama: { type: String, default: null },
        güleGüle: { type: String, default: null },
        öneri: { type: String, default: null },
        starboard: { type: String, default: null },
        özelOdaOlusturucu: { type: String, default: null },
        doğumGünü: { type: String, default: null },
        duyuru: { type: String, default: null }
    },

    roller: {
        otoRol: { type: [String], default: [] },
        mute: { type: String, default: null },
        ticketYetkili: { type: [String], default: [] },
        seviyeÖdülleri: {
            type: [{ seviye: Number, rolId: String }],
            default: []
        }
    },

    hoşgeldinMesaj: {
        icerik: { type: String, default: 'Sunucumuza hoş geldin {üye}! Artık {üyeSayısı}. üyeyiz.' },
        canvasAktif: { type: Boolean, default: true }
    },

    güleGüleMesaj: {
        icerik: { type: String, default: '{kullanıcıAdı} sunucudan ayrıldı.' }
    },

    koruma: {
        antiNuke: { type: Boolean, default: false },
        antiRaid: { type: Boolean, default: false },
        antiSpam: { type: Boolean, default: true },
        antiLink: { type: Boolean, default: false },
        antiInvite: { type: Boolean, default: false },
        antiSpamMesajEsik: { type: Number, default: 5 },
        antiSpamPencereSn: { type: Number, default: 5 },
        antiRaidKatilimEsik: { type: Number, default: 10 },
        antiRaidPencereSn: { type: Number, default: 30 }
    },

    ticketAyar: {
        kategoriId: { type: String, default: null },
        maksimumAcikTicket: { type: Number, default: 3 },
        transkriptKanaliId: { type: String, default: null }
    },

    ekonomiAyar: {
        paraBirimi: { type: String, default: '💰' },
        günlükMiktar: { type: Number, default: 250 }
    },

    seviyeAyar: {
        xpMin: { type: Number, default: 15 },
        xpMax: { type: Number, default: 25 },
        cooldownSn: { type: Number, default: 60 }
    },

    cezaZinciri: {
        aktif: { type: Boolean, default: false },
        kurallar: {
            type: [{ uyariSayisi: Number, ceza: { type: String, enum: ['sustur', 'kick', 'ban'] }, sureDk: Number }],
            default: []
        }
    },

    starboardAyar: {
        esikSayisi: { type: Number, default: 3 },
        emoji: { type: String, default: '⭐' }
    },

    özelOdaAyar: {
        olusturucuKanalId: { type: String, default: null },
        kategoriId: { type: String, default: null },
        varsayilanLimit: { type: Number, default: 0 }
    },

    kurulumTamamlandi: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = model('Guild', guildSchema);
