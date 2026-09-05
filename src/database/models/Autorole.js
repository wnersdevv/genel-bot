const { Schema, model } = require('mongoose');

const kuralSchema = new Schema({
    rolId: { type: String, required: true },
    tip: {
        type: String,
        enum: ['herkes', 'bot', 'kullanici', 'yeni-hesap', 'eski-hesap'],
        default: 'herkes'
    },
    hesapYasiGun: { type: Number, default: 7 },
    gecikmeSaniye: { type: Number, default: 0 }
}, { _id: true });

const autoroleSchema = new Schema({
    guildId: { type: String, required: true, unique: true, index: true },
    aktif: { type: Boolean, default: false },
    kurallar: { type: [kuralSchema], default: [] }
}, { timestamps: true });

module.exports = model('Autorole', autoroleSchema);
