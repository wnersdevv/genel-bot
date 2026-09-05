const { Schema, model } = require('mongoose');

const ozelKomutSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    isim: { type: String, required: true },
    cevap: { type: String, required: true },
    olusturanId: { type: String, required: true },
    kullanimSayisi: { type: Number, default: 0 }
}, { timestamps: true });

ozelKomutSchema.index({ guildId: 1, isim: 1 }, { unique: true });

module.exports = model('OzelKomut', ozelKomutSchema);
