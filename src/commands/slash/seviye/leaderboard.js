const { SlashCommandBuilder } = require('discord.js');
const Seviye = require('../../../database/models/Seviye');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const MADALYA = ['🥇', '🥈', '🥉'];

module.exports = {
    data: new SlashCommandBuilder().setName('leaderboard').setDescription('Sunucu seviye liderlik tablosunu gösterir.'),
    aliaslar: ['lb', 'siralama'],
    kategori: 'seviye',

    async execute(client, interaction) {
        const siralama = await Seviye.find({ guildId: interaction.guild.id })
            .sort({ seviye: -1, xp: -1 })
            .limit(10);

        if (siralama.length === 0) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.liderlik} Liderlik Tablosu`, aciklama: 'Henüz kimse XP kazanmamış.' })] });
        }

        const satirlar = siralama.map((kayit, index) => {
            const rozet = MADALYA[index] || `**#${index + 1}**`;
            return `${rozet} <@${kayit.kullaniciId}> — Seviye **${kayit.seviye}** (${kayit.xp} XP)`;
        });

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.liderlik} ${interaction.guild.name} — Liderlik Tablosu`, aciklama: satirlar.join('\n') })]
        });
    }
};
