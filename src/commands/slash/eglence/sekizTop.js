const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const CEVAPLAR = [
    'Kesinlikle evet.', 'Şüphesiz.', 'Evet, kesinlikle.', 'Güvenilir kaynaklara göre evet.',
    'Görünüşe göre evet.', 'İyimser olarak evet.', 'Cevap belirsiz, tekrar dene.',
    'Şu an söyleyemem.', 'Şimdi odaklanma, tekrar sor.', 'Buna güvenme.',
    'Hayır.', 'Kaynaklarıma göre olası değil.', 'Görünüşe göre kötü.', 'Çok şüpheli.'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Sihirli 8 topa bir soru sorar.')
        .addStringOption(o => o.setName('soru').setDescription('Sormak istediğiniz soru').setRequired(true)),
    kategori: 'eğlence',
    cooldownSn: 2,

    async execute(client, interaction) {
        const soru = interaction.options.getString('soru');
        const cevap = CEVAPLAR[Math.floor(Math.random() * CEVAPLAR.length)];

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.eglence} Sihirli 8 Top`,
                alanlar: [
                    { name: 'Soru', value: soru },
                    { name: 'Cevap', value: `🎱 ${cevap}` }
                ]
            })]
        });
    }
};
