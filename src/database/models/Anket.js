const { Schema, model } = require('mongoose');

const anketSchema = new Schema({
    guildId: { type: String, required: true },
    kanalId: { type: String, required: true },
    mesajId: { type: String, required: true, unique: true },
    soru: { type: String, required: true },
    secenekler: { type: [String], required: true },
    kullaniciOylari: {
        type: [{ kullaniciId: String, secenekIndex: Number }],
        default: []
    },
    bitisZamani: { type: Date, default: null },
    kapandi: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = model('Anket', anketSchema);
