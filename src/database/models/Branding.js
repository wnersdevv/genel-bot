const { Schema, model } = require('mongoose');

const brandingSchema = new Schema({
    guildId: { type: String, required: true, unique: true, index: true },
    botAdi: { type: String, default: null, maxlength: 32 },
    embedRengi: { type: String, default: '#5865F2' },
    altBilgi: { type: String, default: null, maxlength: 100 },
    logoUrl: { type: String, default: null },
    panelBasligi: { type: String, default: null, maxlength: 64 },
    destekUrl: { type: String, default: null },
    siteUrl: { type: String, default: null }
}, { timestamps: true });

module.exports = model('Branding', brandingSchema);
