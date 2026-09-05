const { Schema, model } = require('mongoose');

const yedekSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    isim: { type: String, required: true },
    olusturanId: { type: String, required: true },
    veri: {
        sunucuIsmi: String,
        roller: [{ isim: String, renk: String, izinler: String, pozisyon: Number, hoisted: Boolean, mentionable: Boolean }],
        kanallar: [{ isim: String, tip: Number, pozisyon: Number, parentIsim: String, konu: String }],
        emojiler: [{ isim: String, url: String }]
    }
}, { timestamps: true });

module.exports = model('Yedek', yedekSchema);
