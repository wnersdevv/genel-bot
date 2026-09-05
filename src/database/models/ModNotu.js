const { Schema, model } = require('mongoose');

const modNotuSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    kullaniciId: { type: String, required: true },
    yetkiliId: { type: String, required: true },
    icerik: { type: String, required: true }
}, { timestamps: true });

modNotuSchema.index({ guildId: 1, kullaniciId: 1 });

module.exports = model('ModNotu', modNotuSchema);
