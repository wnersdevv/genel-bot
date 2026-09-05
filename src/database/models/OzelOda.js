const { Schema, model } = require('mongoose');

const ozelOdaSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    kanalId: { type: String, required: true, unique: true },
    sahipId: { type: String, required: true },
    kilitli: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = model('OzelOda', ozelOdaSchema);
