const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const ESPRILER = [
    'Matematik öğretmeni neden hep üzgün? Çünkü çok problemi var.',
    'Elektrikçi neden asla yalnız kalmaz? Çünkü hep bir tel arkadaşı vardır.',
    'Bilgisayar neden doktora gitti? Virüs kapmış da ondan.',
    'Balık neden okula gitmez? Zaten bir sürü var.',
    'Hangi ayı asla üşümez? Fırında pişen ayı.',
    'Terzi neden hiç kavga etmez? Her şeyi dikişle çözer.',
    'Saat neden asla acele etmez? Zamanı zaten elinde.',
    'Hangi meyve okula hiç geç kalmaz? Zamanında gelen kayısı... aslında hep erken gelir.',
    'Denizci neden hep sakin? Çünkü dalgalara alışkın.',
    'Fırıncı neden herkesle iyi geçinir? Çünkü hamurunu iyi yoğurur.'
];

module.exports = {
    data: new SlashCommandBuilder().setName('espri').setDescription('Rastgele bir espri anlatır.'),
    kategori: 'eğlence',
    cooldownSn: 2,

    async execute(client, interaction) {
        const espri = ESPRILER[Math.floor(Math.random() * ESPRILER.length)];
        await interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: '😂 Espri Zamanı', aciklama: espri })] });
    }
};
