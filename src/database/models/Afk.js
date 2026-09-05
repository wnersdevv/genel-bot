const { Schema, model } = require('mongoose');

const afkSchema = new Schema({
    guildId: { type: String, required: true },
    kullaniciId: { type: String, required: true },
    mesaj: { type: String, default: 'AFK' },
    baslangicZamani: { type: Date, default: Date.now }
}, { timestamps: true });

afkSchema.index({ guildId: 1, kullaniciId: 1 }, { unique: true });

module.exports = model('Afk', afkSchema);
