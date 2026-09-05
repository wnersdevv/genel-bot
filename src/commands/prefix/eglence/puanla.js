const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

function metinHashPuani(metin) {
    let toplam = 0;
    for (const karakter of metin.toLowerCase()) toplam += karakter.charCodeAt(0);
    return (toplam % 10) + 1;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('puanla')
        .setDescription('Verilen bir şeye 1-10 arası eğlence amaçlı puan verir.')
        .addStringOption(o => o.setName('şey').setDescription('Puanlanacak şey').setRequired(true)),
    kategori: 'eğlence',
    cooldownSn: 2,

    async execute(client, interaction) {
        const sey = interaction.options.getString('şey');
        const puan = metinHashPuani(sey);
        const yildizlar = '⭐'.repeat(puan) + '☆'.repeat(10 - puan);

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `📊 Puanlama`, aciklama: `**"${sey}"**\n\n${yildizlar}\n**${puan}/10**` })]
        });
    }
};
