const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('zar')
        .setDescription('Belirtilen yüz sayısına sahip bir zar atar.')
        .addIntegerOption(o => o.setName('yüz-sayısı').setDescription('Zarın yüz sayısı (varsayılan 6)').setMinValue(2).setMaxValue(100).setRequired(false)),
    kategori: 'eğlence',
    cooldownSn: 2,

    async execute(client, interaction) {
        const yuzSayisi = interaction.options.getInteger('yüz-sayısı') || 6;
        const sonuc = Math.floor(Math.random() * yuzSayisi) + 1;

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.zar} Zar Atıldı`, aciklama: `**${yuzSayisi}** yüzlü zar atıldı ve **${sonuc}** geldi!` })]
        });
    }
};
