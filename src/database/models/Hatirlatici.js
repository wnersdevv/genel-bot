const { Schema, model } = require('mongoose');

const hatirlaticiSchema = new Schema({
    guildId: { type: String, required: true },
    kanalId: { type: String, required: true },
    kullaniciId: { type: String, required: true, index: true },
    icerik: { type: String, required: true },
    hatirlatZamani: { type: Date, required: true, index: true },
    gonderildi: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = model('Hatirlatici', hatirlaticiSchema);
