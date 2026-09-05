const { SlashCommandBuilder } = require('discord.js');
const Itibar = require('../../../database/models/Itibar');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const MADALYA = ['🥇', '🥈', '🥉'];

module.exports = {
    data: new SlashCommandBuilder().setName('itibar-liste').setDescription('Sunucu itibar liderlik tablosunu gösterir.'),
    kategori: 'sosyal',

    async execute(client, interaction) {
        const siralama = await Itibar.find({ guildId: interaction.guild.id }).sort({ itibarPuani: -1 }).limit(10);

        if (siralama.length === 0) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.itibar} İtibar Liderlik Tablosu`, aciklama: 'Henüz kimsenin itibarı yok.' })] });
        }

        const satirlar = siralama.map((k, i) => `${MADALYA[i] || `**#${i + 1}**`} <@${k.kullaniciId}> — **${k.itibarPuani}** itibar`);

        await interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.itibar} İtibar Liderlik Tablosu`, aciklama: satirlar.join('\n') })] });
    }
};
