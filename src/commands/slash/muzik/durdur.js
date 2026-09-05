const { SlashCommandBuilder } = require('discord.js');
const { baglantiyiKapat } = require('../../../services/muzikService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('durdur').setDescription('Müziği durdurur, kuyruğu temizler ve ses kanalından ayrılır.'),
    kategori: 'müzik',
    async execute(client, interaction) {
        baglantiyiKapat(interaction.guild.id);
        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.durdur} Müzik Durduruldu`, aciklama: 'Ses kanalından ayrıldım ve kuyruğu temizledim.' })] });
    }
};
