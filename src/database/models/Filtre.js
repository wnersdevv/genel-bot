const { Schema, model } = require('mongoose');

const filtreSchema = new Schema({
    guildId: { type: String, required: true, unique: true, index: true },
    yasakliKelimeler: { type: [String], default: [] },
    regexKurallari: { type: [String], default: [] },
    linkEngelle: { type: Boolean, default: false },
    davetEngelle: { type: Boolean, default: false },
    capsEngelle: { type: Boolean, default: false },
    capsEsikYuzde: { type: Number, default: 70 },
    mentionEsik: { type: Number, default: 5 },
    muafRoller: { type: [String], default: [] },
    muafKanallar: { type: [String], default: [] }
}, { timestamps: true });

module.exports = model('Filtre', filtreSchema);
