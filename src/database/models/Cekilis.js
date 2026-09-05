const { Schema, model } = require('mongoose');

const cekilisSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    kanalId: { type: String, required: true },
    mesajId: { type: String, required: true, unique: true },
    odul: { type: String, required: true },
    baslatanId: { type: String, required: true },
    kazananSayisi: { type: Number, default: 1 },
    bitisZamani: { type: Date, required: true },
    sartlar: {
        rolId: { type: String, default: null },
        minSeviye: { type: Number, default: 0 },
        minHesapYasiGun: { type: Number, default: 0 }
    },
    katilimcilar: { type: [String], default: [] },
    durum: { type: String, enum: ['aktif', 'bitti', 'iptal'], default: 'aktif' },
    kazananlar: { type: [String], default: [] }
}, { timestamps: true });

module.exports = model('Cekilis', cekilisSchema);
