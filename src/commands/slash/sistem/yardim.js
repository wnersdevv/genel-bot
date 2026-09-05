const {
    SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
    ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, MessageFlags
} = require('discord.js');
const { komutMetaOlustur } = require('../../../utils/komutMeta');
const { guildAyariGetir } = require('../../../services/guildService');
const config = require('../../../utils/config');

const KATEGORI_ETIKETLERI = {
    moderasyon: '🛡️ Moderasyon', koruma: '🔐 Koruma', mesaj: '🧹 Mesaj Filtreleme',
    ticket: '🎫 Ticket', muzik: '🎵 Müzik', eglence: '🎮 Eğlence', ekonomi: '💰 Ekonomi',
    seviye: '⭐ Seviye', cekilis: '🎉 Çekiliş', oneri: '💡 Öneri', 'ozel-oda': '🏠 Özel Oda',
    sosyal: '👥 Sosyal', bilgi: 'ℹ️ Bilgi', araclar: '🧰 Araçlar',
    yonetim: '👑 Yönetim', sistem: '⚙️ Sistem'
};

/** Bot genelindeki tüm komutları kategoriye göre gruplar. */
function komutlariTopla(client, prefix) {
    const gruplar = new Map();

    for (const [isim, prefixKomut] of client.prefixKomutlari) {
        const kaynak = client.slashKomutlari.get(isim) || prefixKomut.kaynakKomut;
        if (!kaynak?.data) continue;

        const meta = komutMetaOlustur(kaynak, client.slashKomutlari.has(isim), prefix);
        if (meta.geliştiriciKomutuMu) continue;

        if (!gruplar.has(meta.kategori)) gruplar.set(meta.kategori, []);
        gruplar.get(meta.kategori).push(meta);
    }

    // Modal komutları (yalnızca slash) da listeye kat
    for (const [isim, slashKomut] of client.slashKomutlari) {
        if (client.prefixKomutlari.has(isim)) continue;
        const meta = komutMetaOlustur(slashKomut, true, prefix);
        if (meta.geliştiriciKomutuMu) continue;
        if (!gruplar.has(meta.kategori)) gruplar.set(meta.kategori, []);
        gruplar.get(meta.kategori).push(meta);
    }

    for (const liste of gruplar.values()) liste.sort((a, b) => a.isim.localeCompare(b.isim, 'tr'));
    return gruplar;
}

function anaMenuOlustur(client, prefix) {
    const gruplar = komutlariTopla(client, prefix);
    const toplam = [...gruplar.values()].reduce((t, l) => t + l.length, 0);

    const menu = new StringSelectMenuBuilder()
        .setCustomId('yardim:kategori-sec')
        .setPlaceholder('Bir kategori seçin...')
        .addOptions([...gruplar.keys()].sort().map(k => ({
            label: KATEGORI_ETIKETLERI[k] || k,
            value: k,
            description: `${gruplar.get(k).length} komut`
        })));

    const konteyner = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `# 🆘 wnersdev Yardım Merkezi\n` +
            `Toplam **${toplam}** komut, **${gruplar.size}** kategori.\n\n` +
            `**Nasıl kullanılır?**\n` +
            `• Slash komutlar: \`/komut\` yazıp Discord'un önerilerini takip edin\n` +
            `• Prefix komutlar: \`${prefix}komut\` şeklinde yazın\n` +
            `• Alt komutlu yapılar: \`/ticket kur\` ≡ \`${prefix}ticket kur\`\n` +
            `• Belirli bir komutun detayı için: \`/yardım komut:<ad>\``
        ))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `**Yazım kuralı:** \`<zorunlu>\` · \`[opsiyonel]\``
        ))
        .addActionRowComponents(new ActionRowBuilder().addComponents(menu));

    const butonlar = bagliButonlar();
    if (butonlar.length) konteyner.addActionRowComponents(new ActionRowBuilder().addComponents(butonlar));

    return konteyner;
}

/** Yardım menüsünde gösterilen dış bağlantı butonları. */
function bagliButonlar() {
    const butonlar = [];

    if (config.dashboardUrl) {
        butonlar.push(
            new ButtonBuilder().setLabel('🌐 Dashboard').setStyle(ButtonStyle.Link).setURL(config.dashboardUrl),
            new ButtonBuilder().setLabel('📖 Rehber').setStyle(ButtonStyle.Link).setURL(`${config.dashboardUrl}/komutlar`),
            new ButtonBuilder().setLabel('🔒 Gizlilik').setStyle(ButtonStyle.Link).setURL(`${config.dashboardUrl}/gizlilik`)
        );
    }
    if (config.destekSunucusu) {
        butonlar.push(new ButtonBuilder().setLabel('💬 Destek').setStyle(ButtonStyle.Link).setURL(config.destekSunucusu));
    }

    return butonlar;
}

function komutDetayOlustur(meta, prefix) {
    const parametreler = meta.parametreler.length
        ? meta.parametreler.map(p =>
            `\`${p.isim}\` ${p.zorunlu ? '**(zorunlu)**' : '*(opsiyonel)*'} — ${p.tip}\n` +
            `└ ${p.açıklama}${p.seçenekler.length ? `\n└ Seçenekler: ${p.seçenekler.join(', ')}` : ''}`
          ).join('\n\n')
        : '*Bu komut parametre almıyor.*';

    return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `# ${meta.slashMi ? '/' : prefix}${meta.isim}\n${meta.açıklama}`
        ))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `**Kullanım**\n\`\`\`\n${meta.slashMi ? '/' : prefix}${meta.kullanım}\n\`\`\`\n` +
            `**Örnek**\n\`\`\`\n${meta.örnek}\n\`\`\`` +
            (meta.aliaslar.length ? `\n**Kısayollar:** ${meta.aliaslar.map(a => `\`${prefix}${a}\``).join(' ')}` : '')
        ))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Parametreler**\n${parametreler}`))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `🔐 **Gerekli yetki:** ${meta.gerekliYetki}\n` +
            `⏱️ **Bekleme:** ${meta.cooldown} saniye\n` +
            `📂 **Kategori:** ${KATEGORI_ETIKETLERI[meta.kategori] || meta.kategori}\n` +
            `${meta.slashMi ? '⚡ Slash ve prefix ile kullanılabilir' : '⌨️ Yalnızca prefix ile kullanılabilir'}`
        ))
        .addActionRowComponents(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('yardim:ana-menu').setLabel('◀️ Yardım Menüsü').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`yardim:sayfa:${meta.kategori}:0`).setLabel('📂 Kategoriye Dön').setStyle(ButtonStyle.Secondary),
            ...(config.dashboardUrl ? [
                new ButtonBuilder().setLabel('📖 Komut Rehberi').setStyle(ButtonStyle.Link).setURL(`${config.dashboardUrl}/komutlar`)
            ] : [])
        ));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yardım')
        .setDescription('Komutları kategorilere göre listeler veya bir komutun detayını gösterir.')
        .addStringOption(o => o.setName('komut').setDescription('Detayını görmek istediğiniz komut adı').setRequired(false)),
    aliaslar: ['help', 'komutlar', 'y'],
    kategori: 'sistem',

    async execute(client, interaction) {
        const guildAyari = interaction.guild ? await guildAyariGetir(interaction.guild.id) : null;
        const prefix = guildAyari?.prefix || '!';
        const aranan = interaction.options.getString('komut');

        if (aranan) {
            const isim = aranan.toLowerCase().replace(/^[\/!]/, '');
            const gercekIsim = client.prefixAliaslar.get(isim) || isim;
            const kaynak = client.slashKomutlari.get(gercekIsim)
                || client.prefixKomutlari.get(gercekIsim)?.kaynakKomut;

            if (!kaynak?.data) {
                return interaction.reply({
                    content: `❌ **${aranan}** adında bir komut bulunamadı. Tüm komutlar için \`/yardım\` yazın.`,
                    flags: 64
                });
            }

            const meta = komutMetaOlustur(kaynak, client.slashKomutlari.has(gercekIsim), prefix);
            return interaction.reply({ components: [komutDetayOlustur(meta, prefix)], flags: MessageFlags.IsComponentsV2 });
        }

        await interaction.reply({ components: [anaMenuOlustur(client, prefix)], flags: MessageFlags.IsComponentsV2 });
    },

    anaMenuOlustur,
    komutDetayOlustur,
    komutlariTopla,
    KATEGORI_ETIKETLERI
};
