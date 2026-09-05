const { Schema, model } = require('mongoose');

const abonelikSchema = new Schema({
    guildId: { type: String, required: true, unique: true, index: true },
    plan: { type: String, enum: ['ücretsiz', 'premium', 'ultra'], default: 'ücretsiz' },
    baslangicTarihi: { type: Date, default: null },
    bitisTarihi: { type: Date, default: null },
    verenId: { type: String, default: null },
    not: { type: String, default: null },
    // Aboneliği olan sunucularda üyelere verilecek özel rol
    aboneRolId: { type: String, default: null },
    aboneKullanicilar: { type: [String], default: [] }
}, { timestamps: true });

module.exports = model('Abonelik', abonelikSchema);
