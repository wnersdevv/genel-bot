const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

function rastgeleHex() {
    return `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase()}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('renk')
        .setDescription('Rastgele bir renk üretir veya belirtilen rengi gösterir.')
        .addStringOption(o => o.setName('hex').setDescription('Görüntülenecek hex kod (örn: #5865F2)').setRequired(false)),
    kategori: 'araçlar',
    cooldownSn: 2,

    async execute(client, interaction) {
        let hex = interaction.options.getString('hex') || rastgeleHex();
        if (!hex.startsWith('#')) hex = `#${hex}`;

        if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz Hex`, aciklama: 'Geçerli bir hex renk kodu girin (örn: `#5865F2`).' })], flags: 64 });
        }

        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `🎨 Renk: ${hex.toUpperCase()}`,
                aciklama: `**RGB:** ${r}, ${g}, ${b}`
            }).setColor(parseInt(hex.slice(1), 16)).setThumbnail(`https://singlecolorimage.com/get/${hex.slice(1)}/200x200`)]
        });
    }
};
