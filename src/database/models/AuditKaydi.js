const { Schema, model } = require('mongoose');

const auditKaydiSchema = new Schema({
    guildId: { type: String, required: true, index: true },
    kullaniciId: { type: String, required: true },
    kullaniciEtiketi: { type: String, default: null },
    islem: { type: String, required: true },
    kaynak: { type: String, enum: ['dashboard', 'discord'], required: true },
    hedef: { type: String, default: null },
    eskiDeger: { type: String, default: null },
    yeniDeger: { type: String, default: null },
    sonuc: { type: String, enum: ['başarılı', 'reddedildi', 'hata'], default: 'başarılı' }
}, { timestamps: true });

auditKaydiSchema.index({ guildId: 1, createdAt: -1 });
// Kayıtlar 90 gün sonra otomatik silinir
auditKaydiSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = model('AuditKaydi', auditKaydiSchema);
