const { SlashCommandBuilder } = require('discord.js');
const { guildDurumuGetir } = require('../../../services/muzikService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('şu-çalan').setDescription('Şu anda çalan şarkıyı gösterir.'),
    kategori: 'müzik',
    async execute(client, interaction) {
        const durum = guildDurumuGetir(interaction.guild.id);

        if (!durum?.suAnCalan) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.muzik} Çalan Şarkı Yok` })] });
        }

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.muzik} Şu An Çalıyor`,
                aciklama: `**${durum.suAnCalan.baslik}**\nEkleyen: <@${durum.suAnCalan.ekleyenId}>\nSes: %${durum.sesSeviye}\nDöngü: ${durum.dongu}`
            })]
        });
    }
};
