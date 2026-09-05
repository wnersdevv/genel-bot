const { temelEmbed } = require('../../utils/embedOlustur');
const { sartlarVersiyonu, gizlilikVersiyonu, ozet } = require('../../utils/sartlar');
const config = require('../../utils/config');

module.exports = {
    customId: 'onboarding:sartlar',
    async execute(client, interaction) {
        const baglantilar = config.dashboardUrl
            ? `\n\n**Tam metinler:**\n[Hizmet Şartları](${config.dashboardUrl}/hizmet-sartlari) · [Gizlilik Politikası](${config.dashboardUrl}/gizlilik)`
            : '';

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `📄 Hizmet Şartları v${sartlarVersiyonu} · Gizlilik v${gizlilikVersiyonu}`,
                alanlar: [
                    { name: '📥 İşlenen Veriler', value: ozet.islenenVeriler.map(v => `• ${v}`).join('\n') },
                    { name: '🚫 İşlenmeyen Veriler', value: ozet.islenmeyenVeriler.map(v => `• ${v}`).join('\n') },
                    { name: '⚖️ Haklarınız', value: ozet.haklar.map(v => `• ${v}`).join('\n') }
                ],
                aciklama: `Bot yalnızca çalışması için gereken verileri işler ve üçüncü taraflara satmaz.${baglantilar}`
            })],
            flags: 64
        });
    }
};
