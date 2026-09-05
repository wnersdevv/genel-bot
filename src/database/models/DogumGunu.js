const { Schema, model } = require('mongoose');

const dogumGunuSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    kullaniciId: { type: String, required: true },
    gun: { type: Number, required: true, min: 1, max: 31 },
    ay: { type: Number, required: true, min: 1, max: 12 },
    sonKutlananYil: { type: Number, default: null }
}, { timestamps: true });

dogumGunuSchema.index({ guildId: 1, kullaniciId: 1 }, { unique: true });

module.exports = model('DogumGunu', dogumGunuSchema);
