const { Schema, model } = require('mongoose');

const oneriSchema = new Schema({
    guildId: { type: String, required: true },
    kullaniciId: { type: String, required: true },
    mesajId: { type: String, required: true, unique: true },
    icerik: { type: String, required: true },
    durum: { type: String, enum: ['bekliyor', 'kabul', 'reddedildi', 'inceleniyor'], default: 'bekliyor' },
    yetkiliSebep: { type: String, default: null }
}, { timestamps: true });

module.exports = model('Oneri', oneriSchema);
