const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const FAKTLAR = [
    'Ahtapotların üç kalbi vardır.',
    'Bal, binlerce yıl geçse bile bozulmaz.',
    'Bir günde ortalama 20.000 kez nefes alırsınız.',
    'Muzlar botanik olarak bir meyve değil, çilekler ise gerçek bir meyvedir.',
    'İnsan vücudundaki en güçlü kas çene kasıdır.',
    'Venüs\'te bir gün, bir yılından daha uzundur.',
    'Şimşek, güneş yüzeyinden 5 kat daha sıcaktır.',
    'Kelebekler tat alma duyularını ayaklarıyla kullanır.',
    'Bir kum tanesindeki atom sayısı, evrendeki yıldız sayısından fazladır.',
    'Karıncalar hiç uyumaz.'
];

module.exports = {
    data: new SlashCommandBuilder().setName('fakt').setDescription('Rastgele ilginç bir bilgi paylaşır.'),
    kategori: 'eğlence',
    cooldownSn: 2,

    async execute(client, interaction) {
        const fakt = FAKTLAR[Math.floor(Math.random() * FAKTLAR.length)];
        await interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: '🧠 Biliyor muydun?', aciklama: fakt })] });
    }
};
