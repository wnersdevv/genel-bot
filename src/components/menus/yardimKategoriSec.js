const {
    ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, MessageFlags
} = require('discord.js');
const { komutlariTopla, KATEGORI_ETIKETLERI } = require('../../commands/slash/sistem/yardim');
const { guildAyariGetir } = require('../../services/guildService');

const SAYFA_BASINA = 8;

function sayfaOlustur(client, kategori, sayfaNo, prefix) {
    const gruplar = komutlariTopla(client, prefix);
    const komutlar = gruplar.get(kategori) || [];

    const toplamSayfa = Math.max(1, Math.ceil(komutlar.length / SAYFA_BASINA));
    const guvenliSayfa = Math.min(Math.max(sayfaNo, 0), toplamSayfa - 1);
    const dilim = komutlar.slice(guvenliSayfa * SAYFA_BASINA, guvenliSayfa * SAYFA_BASINA + SAYFA_BASINA);

    const metin = dilim.map(k =>
        `### ${k.slashMi ? '/' : prefix}${k.isim}\n` +
        `${k.açıklama}\n` +
        `\`${k.slashMi ? '/' : prefix}${k.kullanım}\`` +
        (k.aliaslar.length ? ` · kısayol: ${k.aliaslar.map(a => `\`${prefix}${a}\``).join(' ')}` : '')
    ).join('\n\n');

    return new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `# ${KATEGORI_ETIKETLERI[kategori] || kategori}\n${komutlar.length} komut · Sayfa ${guvenliSayfa + 1}/${toplamSayfa}`
        ))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(metin || 'Bu kategoride komut bulunmuyor.'))
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `💡 Bir komutun tüm detayı için: \`/yardım komut:<ad>\``
        ))
        .addActionRowComponents(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('yardim:komut-sec')
                .setPlaceholder('📖 Bir komutun detayını görüntüle...')
                .addOptions(dilim.slice(0, 25).map(k => ({
                    label: `${k.slashMi ? '/' : prefix}${k.isim}`,
                    value: k.isim,
                    description: k.açıklama.slice(0, 90)
                })))
        ))
        .addActionRowComponents(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`yardim:sayfa:${kategori}:${guvenliSayfa - 1}`)
                .setLabel('◀️ Önceki').setStyle(ButtonStyle.Secondary).setDisabled(guvenliSayfa === 0),
            new ButtonBuilder().setCustomId('yardim:ana-menu').setLabel('📋 Kategoriler').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`yardim:sayfa:${kategori}:${guvenliSayfa + 1}`)
                .setLabel('Sonraki ▶️').setStyle(ButtonStyle.Secondary).setDisabled(guvenliSayfa >= toplamSayfa - 1)
        ));
}

module.exports = {
    customId: 'yardim:kategori-sec',
    async execute(client, interaction) {
        const guildAyari = interaction.guild ? await guildAyariGetir(interaction.guild.id) : null;
        const prefix = guildAyari?.prefix || '!';
        await interaction.update({
            components: [sayfaOlustur(client, interaction.values[0], 0, prefix)],
            flags: MessageFlags.IsComponentsV2
        });
    },
    sayfaOlustur
};
