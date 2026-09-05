const { Schema, model } = require('mongoose');

const davetSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    kod: { type: String, required: true },
    olusturanId: { type: String, default: null },
    kullanimSayisi: { type: Number, default: 0 }
}, { timestamps: true });

davetSchema.index({ guildId: 1, kod: 1 }, { unique: true });

module.exports = model('Davet', davetSchema);
