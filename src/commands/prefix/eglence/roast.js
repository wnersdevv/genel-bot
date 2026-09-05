const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const ROASTLAR = [
    'Wi-Fi şifresi gibisin: herkes seni bir kere deniyor, sonra unutuyor.',
    'Sen bir yükleme çubuğu gibisin, hep %99\'da kalıyorsun.',
    'Otomatik düzeltme bile senin espirilerini kurtaramaz.',
    'Sen bir CAPTCHA gibisin, kimse seni ilk seferde çözemiyor.',
    'Bilgisayarın "Emin misiniz?" diye sorsa, sana güvenmez.',
    'Google bile senin sorularına "emin değilim" diyor.',
    'Sen bir tarayıcı sekmesi gibisin, kimse neden açık olduğunu hatırlamıyor.'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roast')
        .setDescription('Bir kullanıcıya eğlence amaçlı şakacı bir laf sokar.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('Roast edilecek kullanıcı').setRequired(true)),
    kategori: 'eğlence',
    cooldownSn: 3,

    async execute(client, interaction) {
        const hedef = interaction.options.getUser('kullanıcı');
        const roast = ROASTLAR[Math.floor(Math.random() * ROASTLAR.length)];

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `🔥 Roast Zamanı`, aciklama: `${hedef}, ${roast}\n\n*(Şaka amaçlıdır, kimseyi kırmak niyetinde değiliz!)*` })]
        });
    }
};
