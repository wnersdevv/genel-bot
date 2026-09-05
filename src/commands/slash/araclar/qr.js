const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('qr')
        .setDescription('Verilen metin veya linkten QR kod oluşturur.')
        .addStringOption(o => o.setName('metin').setDescription('QR koda dönüştürülecek metin veya link').setRequired(true)),
    kategori: 'araçlar',
    cooldownSn: 3,

    async execute(client, interaction) {
        const metin = interaction.options.getString('metin');
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(metin)}`;

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.baglanti} QR Kod Oluşturuldu`, aciklama: `\`${metin.length > 60 ? metin.slice(0, 60) + '…' : metin}\`` })
                .setImage(qrUrl)]
        });
    }
};
