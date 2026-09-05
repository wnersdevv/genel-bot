const { Schema, model } = require('mongoose');

const kartSchema = new Schema({
    aktif: { type: Boolean, default: true },
    arkaPlanRengi: { type: String, default: '#1e1f3b' },
    gradyanRengi: { type: String, default: '#2b2d5a' },
    arkaPlanResmi: { type: String, default: null },
    metinRengi: { type: String, default: '#ffffff' },
    altMetinRengi: { type: String, default: '#b9bbe1' },
    kenarlikRengi: { type: String, default: '#5865F2' },
    kenarlikKalinligi: { type: Number, default: 6 },
    avatarBoyutu: { type: Number, default: 160 },
    overlayOpaklik: { type: Number, default: 45 },
    baslik: { type: String, default: 'Hoş Geldin, {username}!' },
    altBaslik: { type: String, default: '{serverName} — {memberCount}. üye' },
    sunucuIkonuGoster: { type: Boolean, default: false }
}, { _id: false });

const welcomeSchema = new Schema({
    guildId: { type: String, required: true, unique: true, index: true },

    kanal: {
        aktif: { type: Boolean, default: false },
        kanalId: { type: String, default: null },
        mesaj: { type: String, default: 'Sunucumuza hoş geldin {user}! Artık {memberCount} kişiyiz.' },
        embedKullan: { type: Boolean, default: false },
        embedRengi: { type: String, default: '#5865F2' },
        kartKullan: { type: Boolean, default: true }
    },

    dm: {
        aktif: { type: Boolean, default: false },
        mesaj: { type: String, default: 'Merhaba {username}! {serverName} sunucusuna hoş geldin.' },
        embedKullan: { type: Boolean, default: true },
        embedRengi: { type: String, default: '#5865F2' },
        baslik: { type: String, default: 'Hoş Geldin!' },
        altBilgi: { type: String, default: null },
        gorselUrl: { type: String, default: null },
        butonEtiketi: { type: String, default: null },
        butonUrl: { type: String, default: null }
    },

    ayrilis: {
        aktif: { type: Boolean, default: false },
        kanalId: { type: String, default: null },
        mesaj: { type: String, default: '{username} sunucudan ayrıldı. Kalan üye: {memberCount}' },
        embedKullan: { type: Boolean, default: true },
        kartKullan: { type: Boolean, default: false }
    },

    kart: { type: kartSchema, default: () => ({}) }
}, { timestamps: true });

module.exports = model('Welcome', welcomeSchema);
