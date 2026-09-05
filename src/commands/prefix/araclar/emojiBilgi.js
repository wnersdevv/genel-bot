const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const EMOJI_REGEX = /<(a)?:(\w+):(\d+)>/;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emoji')
        .setDescription('Bir custom emojinin detaylarını ve büyük görselini gösterir.')
        .addStringOption(o => o.setName('emoji').setDescription('Custom emoji (yapıştırın)').setRequired(true)),
    kategori: 'araçlar',
    cooldownSn: 2,

    async execute(client, interaction) {
        const girdi = interaction.options.getString('emoji');
        const eslesme = girdi.match(EMOJI_REGEX);

        if (!eslesme) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz Emoji`, aciklama: 'Yalnızca sunucu emojileri (custom emoji) desteklenir. Standart Unicode emojiler için bu komut çalışmaz.' })], flags: 64 });
        }

        const [, animatedMi, isim, id] = eslesme;
        const url = `https://cdn.discordapp.com/emojis/${id}.${animatedMi ? 'gif' : 'png'}`;

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `😀 :${isim}:`,
                alanlar: [
                    { name: 'ID', value: id, inline: true },
                    { name: 'Animasyonlu', value: animatedMi ? 'Evet' : 'Hayır', inline: true },
                    { name: 'URL', value: `[Bağlantı](${url})`, inline: true }
                ]
            }).setImage(url)]
        });
    }
};
