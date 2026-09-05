const { Schema, model } = require('mongoose');

const esikSchema = new Schema({
    aktif: { type: Boolean, default: false },
    limit: { type: Number, default: 3 },
    pencereSn: { type: Number, default: 10 },
    ceza: { type: String, enum: ['yok', 'rol-al', 'kick', 'ban'], default: 'rol-al' }
}, { _id: false });

const korumaSchema = new Schema({
    guildId: { type: String, required: true, unique: true, index: true },
    aktif: { type: Boolean, default: false },
    logKanaliId: { type: String, default: null },

    kanalSilme: { type: esikSchema, default: () => ({}) },
    kanalOlusturma: { type: esikSchema, default: () => ({ limit: 5 }) },
    rolSilme: { type: esikSchema, default: () => ({}) },
    rolOlusturma: { type: esikSchema, default: () => ({ limit: 5 }) },
    banAtma: { type: esikSchema, default: () => ({ limit: 3, pencereSn: 15 }) },
    kickAtma: { type: esikSchema, default: () => ({ limit: 4, pencereSn: 15 }) },
    webhook: { type: esikSchema, default: () => ({ limit: 2 }) },
    yetkiYukseltme: { type: esikSchema, default: () => ({ limit: 1, ceza: 'rol-al' }) },

    botEkleme: {
        aktif: { type: Boolean, default: false },
        ceza: { type: String, enum: ['yok', 'kick', 'ban'], default: 'kick' }
    },

    antiRaid: {
        aktif: { type: Boolean, default: false },
        katilimLimit: { type: Number, default: 8 },
        pencereSn: { type: Number, default: 20 },
        hesapYasiGun: { type: Number, default: 3 },
        eylem: { type: String, enum: ['yok', 'karantina', 'kick', 'ban'], default: 'karantina' },
        karantinaRolId: { type: String, default: null },
        otomatikLockdown: { type: Boolean, default: true }
    },

    beyazListe: {
        kullanicilar: { type: [String], default: [] },
        roller: { type: [String], default: [] }
    },

    lockdown: {
        aktif: { type: Boolean, default: false },
        baslangic: { type: Date, default: null },
        baslatanId: { type: String, default: null },
        kilitliKanallar: { type: [String], default: [] }
    }
}, { timestamps: true });

module.exports = model('Koruma', korumaSchema);
