const { SlashCommandBuilder } = require('discord.js');
const { guildDurumuGetir } = require('../../../services/muzikService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

function sureFormatla(saniye) {
    const dk = Math.floor(saniye / 60);
    const sn = Math.floor(saniye % 60);
    return `${dk}:${sn.toString().padStart(2, '0')}`;
}

module.exports = {
    data: new SlashCommandBuilder().setName('kuyruk').setDescription('Müzik kuyruğunu gösterir.'),
    aliaslar: ['q', 'sira'],
    kategori: 'müzik',
    async execute(client, interaction) {
        const durum = guildDurumuGetir(interaction.guild.id);

        if (!durum || (!durum.suAnCalan && durum.kuyruk.length === 0)) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.kuyruk} Kuyruk Boş`, aciklama: 'Şu anda çalan veya sırada bekleyen bir şarkı yok.' })] });
        }

        const satirlar = durum.kuyruk.slice(0, 15).map((s, i) => `**${i + 1}.** ${s.baslik} (${sureFormatla(s.sureSn)})`);

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.kuyruk} Müzik Kuyruğu`,
                aciklama: `**${emojis.muzik} Şu An Çalıyor:**\n${durum.suAnCalan ? `${durum.suAnCalan.baslik} (${sureFormatla(durum.suAnCalan.sureSn)})` : 'Yok'}\n\n**Sırada (${durum.kuyruk.length}):**\n${satirlar.join('\n') || 'Kuyruk boş'}`
            })]
        });
    }
};
