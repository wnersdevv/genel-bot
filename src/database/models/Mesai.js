const { Schema, model } = require('mongoose');

const mesaiSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    kullaniciId: { type: String, required: true },
    baslangicZamani: { type: Date, required: true },
    bitisZamani: { type: Date, default: null },
    toplamSureDk: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = model('Mesai', mesaiSchema);
