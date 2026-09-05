const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags
} = require('discord.js');
const { guildAyariGetir } = require('../../services/guildService');
const { KATEGORILER } = require('../panelOlustur');
const config = require('../../utils/config');

const KATEGORI_ACIKLAMALARI = {
    'moderasyon': 'Uyarı, susturma, atma, yasaklama ve mesaj silme komutlarını içerir.',
    'koruma': 'Anti-nuke, anti-raid, anti-spam ve anti-link koruma sistemlerini yönetir.',
    'mesaj-filtreleme': 'Yasaklı kelime, regex, link ve spam filtrelerini yönetir.',
    'ticket': 'Destek talebi kategorilerini, yetkili rollerini ve transkript ayarlarını yönetir.',
    'müzik': 'Ses kanalı, kuyruk ve oynatma ayarlarını yönetir.',
    'eğlence': 'Eğlence komutlarının açık/kapalı durumunu yönetir.',
    'ekonomi': 'Para birimi sembolü, günlük ödül miktarı ve market ayarlarını yönetir.',
    'seviye': 'XP kazanım aralığı, cooldown ve seviye ödüllerini yönetir.',
    'çekiliş': 'Varsayılan çekiliş kanalı ve katılım şartlarını yönetir.',
    'öneri': 'Öneri kanalı ve onay/red akışını yönetir.',
    'özel-oda': 'Geçici ses kanalı oluşturucu ve varsayılan limitleri yönetir.',
    'hoşgeldin': 'Hoş geldin/güle güle kanalı, mesaj şablonu ve canvas ayarını yönetir.',
    'roller': 'Otorol ve rol menüsü ayarlarını yönetir.',
    'istatistik': 'Sunucu istatistiklerini ve grafiklerini görüntüler.',
    'araçlar': 'Genel yardımcı komutların listesini gösterir.',
    'ayarlar': 'Prefix, dil ve genel bot ayarlarını yönetir.'
};

module.exports = {
    customId: 'panel:kategori-sec',
    async execute(client, interaction) {
        const secilenDeger = interaction.values[0];
        const secilenEtiket = KATEGORILER.find(k => k.deger === secilenDeger)?.etiket || secilenDeger;
        const guildAyari = await guildAyariGetir(interaction.guild.id);
        const aciklama = KATEGORI_ACIKLAMALARI[secilenDeger] || 'Bu kategori için detay bulunamadı.';

        const modulAnahtari = secilenDeger
            .replace(/-([a-zçğıöşü])/g, (_, harf) => harf.toUpperCase());
        const modulDurumu = guildAyari.modüller?.[modulAnahtari];
        const durumMetni = modulDurumu === undefined ? '' : (modulDurumu ? '🟢 Şu anda **açık**.' : '🔴 Şu anda **kapalı**.');

        const konteyner = new ContainerBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# ${secilenEtiket} Modülü\n${aciklama}\n${durumMetni}`)
            )
            .addSeparatorComponents(new SeparatorBuilder())
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent('Detaylı ayarlar için web dashboard üzerinden bu modüle ait tüm seçenekleri değiştirebilirsiniz.')
            )
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('🌐 Dashboard\'da Aç')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`${config.dashboardUrl || 'http://localhost:3000'}/sunucu/${interaction.guild.id}`),
                    new ButtonBuilder()
                        .setCustomId('panel:geri')
                        .setLabel('◀️ Panele Dön')
                        .setStyle(ButtonStyle.Secondary)
                )
            );

        await interaction.update({ components: [konteyner], flags: MessageFlags.IsComponentsV2 });
    }
};
