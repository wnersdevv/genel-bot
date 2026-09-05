const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('yazı-tura').setDescription('Bir para atar: yazı mı tura mı?'),
    kategori: 'eğlence',
    cooldownSn: 2,

    async execute(client, interaction) {
        const sonuc = Math.random() < 0.5 ? 'Yazı' : 'Tura';
        await interaction.reply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `🪙 ${sonuc} Geldi!`, aciklama: `Para havaya atıldı ve **${sonuc}** geldi.` })]
        });
    }
};
