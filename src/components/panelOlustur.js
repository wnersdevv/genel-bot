const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');

const KATEGORILER = [
    { deger: 'moderasyon', etiket: '🛡️ Moderasyon' },
    { deger: 'koruma', etiket: '🔐 Koruma' },
    { deger: 'mesaj-filtreleme', etiket: '🧹 Mesaj Filtreleme' },
    { deger: 'ticket', etiket: '🎫 Ticket' },
    { deger: 'müzik', etiket: '🎵 Müzik' },
    { deger: 'eğlence', etiket: '🎮 Eğlence' },
    { deger: 'ekonomi', etiket: '💰 Ekonomi' },
    { deger: 'seviye', etiket: '⭐ Seviye' },
    { deger: 'çekiliş', etiket: '🎉 Çekiliş' },
    { deger: 'öneri', etiket: '💡 Öneri' },
    { deger: 'özel-oda', etiket: '🏠 Özel Odalar' },
    { deger: 'hoşgeldin', etiket: '👋 Hoş Geldin' },
    { deger: 'roller', etiket: '🎭 Roller' },
    { deger: 'istatistik', etiket: '📊 İstatistik' },
    { deger: 'araçlar', etiket: '🧰 Araçlar' },
    { deger: 'ayarlar', etiket: '⚙️ Ayarlar' }
];

function panelKonteyneriOlustur(sunucuIsmi) {
    const secmeMenusu = new StringSelectMenuBuilder()
        .setCustomId('panel:kategori-sec')
        .setPlaceholder('Bir kategori seçin...')
        .addOptions(KATEGORILER.map(k => ({ label: k.etiket, value: k.deger })));

    return new ContainerBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `# 🤖 wnersdev Kontrol Paneli\n**${sunucuIsmi}** sunucusu için yönetim merkezi. Aşağıdaki menüden bir kategori seçerek ilgili ayarlara ulaşabilirsiniz.`
            )
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(KATEGORILER.map(k => k.etiket).join('   '))
        )
        .addActionRowComponents(new ActionRowBuilder().addComponents(secmeMenusu));
}

module.exports = { panelKonteyneriOlustur, KATEGORILER };
