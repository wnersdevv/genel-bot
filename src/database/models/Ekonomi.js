const { Schema, model } = require('mongoose');

const ekonomiSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    kullaniciId: { type: String, required: true, index: true },
    cuzdan: { type: Number, default: 0 },
    banka: { type: Number, default: 0 },
    envanter: {
        type: [{ itemId: String, isim: String, adet: { type: Number, default: 1 } }],
        default: []
    },
    sonGunluk: { type: Date, default: null },
    sonHaftalik: { type: Date, default: null },
    sonCalisma: { type: Date, default: null }
}, { timestamps: true });

ekonomiSchema.index({ guildId: 1, kullaniciId: 1 }, { unique: true });

module.exports = model('Ekonomi', ekonomiSchema);
