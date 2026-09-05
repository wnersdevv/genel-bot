const { Schema, model } = require('mongoose');

const starboardSchema = new Schema({
    guildId: { type: String, required: true },
    orijinalMesajId: { type: String, required: true, unique: true },
    starboardMesajId: { type: String, required: true }
}, { timestamps: true });

module.exports = model('StarboardMesaj', starboardSchema);
