const { Schema, model } = require('mongoose');

const warnSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    kullaniciId: { type: String, required: true, index: true },
    yetkiliId: { type: String, required: true },
    sebep: { type: String, default: 'Sebep belirtilmedi' },
    caseNo: { type: Number, required: true }
}, { timestamps: true });

warnSchema.index({ guildId: 1, kullaniciId: 1 });

module.exports = model('Warn', warnSchema);
