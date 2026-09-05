/**
 * Hizmet şartları ve gizlilik politikası sürümleri.
 * Metinler önemli ölçüde değişirse sürüm numarası artırılır;
 * bu durumda sunuculardan yeniden onay istenir.
 */
module.exports = {
    sartlarVersiyonu: '1.0',
    gizlilikVersiyonu: '1.0',

    ozet: {
        islenenVeriler: [
            'Sunucu ID\'si ve yapılandırma ayarları',
            'Kullanıcı ID\'si (yalnızca kullandığınız özellikler kapsamında)',
            'Moderasyon kayıtları, seviye/ekonomi verileri, ticket geçmişi',
            'Ticket kanallarındaki mesajlar (yalnızca transkript amacıyla)'
        ],
        islenmeyenVeriler: [
            'Şifre, e-posta veya ödeme bilgisi',
            'Ticket dışındaki normal sohbet içerikleri',
            'IP adresi (Discord botu bu bilgiyi sağlamaz)'
        ],
        haklar: [
            'Verilerinizin silinmesini talep edebilirsiniz',
            'Bot sunucudan çıkarıldığında veriler talep üzerine silinir',
            'Loglar 14 gün, denetim kayıtları 90 gün sonra otomatik silinir'
        ]
    }
};
