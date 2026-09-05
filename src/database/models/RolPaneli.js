const { Schema, model } = require('mongoose');

const secenekSchema = new Schema({
    rolId: { type: String, required: true },
    etiket: { type: String, required: true },
    emoji: { type: String, default: null },
    aciklama: { type: String, default: null }
}, { _id: false });

const rolPaneliSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    mesajId: { type: String, required: true, unique: true },
    kanalId: { type: String, required: true },
    tip: { type: String, enum: ['buton', 'menu'], default: 'buton' },
    baslik: { type: String, default: 'Rol Seç' },
    aciklama: { type: String, default: null },
    renk: { type: String, default: '#5865F2' },
    tekliSecim: { type: Boolean, default: false },
    maksimumRol: { type: Number, default: 0 },
    secenekler: { type: [secenekSchema], default: [] },
    olusturanId: { type: String, required: true }
}, { timestamps: true });

module.exports = model('RolPaneli', rolPaneliSchema);
