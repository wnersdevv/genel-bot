const { Schema, model } = require('mongoose');

const otomatikCevapSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    tetikleyici: { type: String, required: true },
    cevap: { type: String, required: true },
    tamEslesme: { type: Boolean, default: false },
    olusturanId: { type: String, required: true }
}, { timestamps: true });

module.exports = model('OtomatikCevap', otomatikCevapSchema);
