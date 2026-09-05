const { Schema, model } = require('mongoose');

const seviyeSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    kullaniciId: { type: String, required: true, index: true },
    xp: { type: Number, default: 0 },
    seviye: { type: Number, default: 0 },
    toplamMesaj: { type: Number, default: 0 },
    sonMesajZamani: { type: Date, default: null }
}, { timestamps: true });

seviyeSchema.index({ guildId: 1, kullaniciId: 1 }, { unique: true });

// Sonraki seviye için gereken toplam XP (basit artan formül)
seviyeSchema.statics.gerekliXp = function (seviye) {
    return 5 * (seviye ** 2) + 50 * seviye + 100;
};

module.exports = model('Seviye', seviyeSchema);
