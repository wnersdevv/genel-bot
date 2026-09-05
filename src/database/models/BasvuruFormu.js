const { Schema, model } = require('mongoose');

const basvuruFormuSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    isim: { type: String, required: true },
    sorular: { type: [String], required: true }, // en fazla 3 soru (Discord modal limiti)
    sonucKanaliId: { type: String, default: null },
    olusturanId: { type: String, required: true }
}, { timestamps: true });

basvuruFormuSchema.index({ guildId: 1, isim: 1 }, { unique: true });

module.exports = model('BasvuruFormu', basvuruFormuSchema);
