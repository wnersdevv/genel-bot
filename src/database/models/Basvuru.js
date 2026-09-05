const { Schema, model } = require('mongoose');

const basvuruSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    kullaniciId: { type: String, required: true },
    formIsmi: { type: String, required: true },
    cevaplar: { type: [{ soru: String, cevap: String }], default: [] },
    durum: { type: String, enum: ['bekliyor', 'kabul', 'reddedildi'], default: 'bekliyor' }
}, { timestamps: true });

module.exports = model('Basvuru', basvuruSchema);
