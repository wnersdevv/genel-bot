const { Schema, model } = require('mongoose');

const itibarSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    kullaniciId: { type: String, required: true },
    itibarPuani: { type: Number, default: 0 },
    sonVermeZamani: { type: Date, default: null }
}, { timestamps: true });

itibarSchema.index({ guildId: 1, kullaniciId: 1 }, { unique: true });

module.exports = model('Itibar', itibarSchema);
