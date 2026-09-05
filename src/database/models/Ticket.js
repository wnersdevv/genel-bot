const { Schema, model } = require('mongoose');

const ticketSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    kanalId: { type: String, required: true, unique: true },
    sahipId: { type: String, required: true },
    ticketNo: { type: Number, required: true },
    kategori: {
        type: String,
        enum: ['destek', 'teknik', 'satin-alma', 'sikayet', 'is-birligi', 'diger'],
        default: 'destek'
    },
    durum: { type: String, enum: ['acik', 'kilitli', 'kapali'], default: 'acik' },
    eklenenKullanicilar: { type: [String], default: [] },
    kapatanId: { type: String, default: null },
    kapatilmaSebebi: { type: String, default: null },
    transkriptUrl: { type: String, default: null }
}, { timestamps: true });

module.exports = model('Ticket', ticketSchema);
