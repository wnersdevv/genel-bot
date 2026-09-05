const { Schema, model } = require('mongoose');

const basariSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    kullaniciId: { type: String, required: true },
    kazanilanBasarilar: { type: [String], default: [] } // rozet anahtarları, bkz. utils/basariTanimlari.js
}, { timestamps: true });

basariSchema.index({ guildId: 1, kullaniciId: 1 }, { unique: true });

module.exports = model('Basari', basariSchema);
