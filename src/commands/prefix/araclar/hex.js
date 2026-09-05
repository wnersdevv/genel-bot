const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hex')
        .setDescription('RGB değerini HEX koduna çevirir (örn: 88,101,242).')
        .addStringOption(o => o.setName('rgb').setDescription('Virgülle ayrılmış R,G,B değerleri').setRequired(true)),
    kategori: 'araçlar',
    cooldownSn: 2,

    async execute(client, interaction) {
        const girdi = interaction.options.getString('rgb');
        const parcalar = girdi.split(',').map(p => parseInt(p.trim(), 10));

        if (parcalar.length !== 3 || parcalar.some(p => Number.isNaN(p) || p < 0 || p > 255)) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz Format`, aciklama: 'Değerleri `255,0,0` gibi 0-255 arası virgülle ayrılmış olarak girin.' })], flags: 64 });
        }

        const [r, g, b] = parcalar;
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `🎨 RGB(${r}, ${g}, ${b}) → ${hex}` }).setColor((r << 16) + (g << 8) + b)]
        });
    }
};
