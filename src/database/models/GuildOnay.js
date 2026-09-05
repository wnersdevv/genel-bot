const { Schema, model } = require('mongoose');

const guildOnaySchema = new Schema({
    guildId: { type: String, required: true, unique: true, index: true },
    kabulEdildi: { type: Boolean, default: false },
    kabulEdenId: { type: String, default: null },
    kabulTarihi: { type: Date, default: null },
    sartlarVersiyonu: { type: String, default: null },
    gizlilikVersiyonu: { type: String, default: null },
    kaynak: { type: String, enum: ['discord', 'dashboard'], default: 'discord' },
    reddedildi: { type: Boolean, default: false },
    reddedenId: { type: String, default: null },
    onboardingTamamlandi: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = model('GuildOnay', guildOnaySchema);
