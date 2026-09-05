const { Schema, model } = require('mongoose');

const komutAyariSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    komutIsmi: { type: String, required: true },
    aktif: { type: Boolean, default: true },
    cooldownSn: { type: Number, default: null } // null ise komutun kendi varsayılanı kullanılır
}, { timestamps: true });

komutAyariSchema.index({ guildId: 1, komutIsmi: 1 }, { unique: true });

module.exports = model('KomutAyari', komutAyariSchema);
