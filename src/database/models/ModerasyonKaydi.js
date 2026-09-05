const { Schema, model } = require('mongoose');

const moderasyonKaydiSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    caseNo: { type: Number, required: true },
    tip: {
        type: String,
        enum: ['uyarı', 'susturma', 'susturma-kaldırma', 'atma', 'yasaklama', 'yasak-kaldırma', 'softban', 'not'],
        required: true
    },
    kullaniciId: { type: String, required: true },
    yetkiliId: { type: String, required: true },
    sebep: { type: String, default: 'Sebep belirtilmedi' },
    ekBilgi: { type: String, default: null }
}, { timestamps: true });

moderasyonKaydiSchema.index({ guildId: 1, caseNo: 1 }, { unique: true });
moderasyonKaydiSchema.index({ guildId: 1, kullaniciId: 1 });

module.exports = model('ModerasyonKaydi', moderasyonKaydiSchema);
