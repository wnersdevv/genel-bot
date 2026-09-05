const { SlashCommandBuilder } = require('discord.js');
const { sarkiAra, kuyrugaEkle, guildDurumuGetir } = require('../../../services/muzikService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

function sureFormatla(saniye) {
    const dk = Math.floor(saniye / 60);
    const sn = Math.floor(saniye % 60);
    return `${dk}:${sn.toString().padStart(2, '0')}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('çal')
        .setDescription('Bir şarkıyı çalar veya kuyruğa ekler (YouTube).')
        .addStringOption(o => o.setName('şarkı').setDescription('Şarkı ismi veya YouTube linki').setRequired(true)),
    aliaslar: ['p', 'play'],
    kategori: 'müzik',
    cooldownSn: 3,

    async execute(client, interaction) {
        const sesKanali = interaction.member.voice.channel;
        if (!sesKanali) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Ses Kanalında Değilsin`, aciklama: 'Bu komutu kullanmak için bir ses kanalında olmalısın.' })], flags: 64 });
        }

        const botYetkileri = sesKanali.permissionsFor(interaction.guild.members.me);
        if (!botYetkileri?.has(['Connect', 'Speak'])) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetki Eksik`, aciklama: 'Bu ses kanalına bağlanma/konuşma yetkim yok.' })], flags: 64 });
        }

        await interaction.deferReply();

        const sorgu = interaction.options.getString('şarkı');
        let sarki;
        try {
            sarki = await sarkiAra(sorgu);
        } catch (hata) {
            return interaction.editReply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Arama Başarısız`, aciklama: 'YouTube üzerinde arama yapılırken bir hata oluştu. play-dl kurulumunu ve ffmpeg erişimini kontrol edin.' })] });
        }

        if (!sarki) {
            return interaction.editReply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bulunamadı`, aciklama: 'Aramanla eşleşen bir sonuç bulunamadı.' })] });
        }

        await kuyrugaEkle(interaction.guild, sesKanali, interaction.channel.id, sarki, interaction.user.id);

        const durum = guildDurumuGetir(interaction.guild.id);
        const hemenCaliyorMu = durum?.suAnCalan?.url === sarki.url && durum.kuyruk.length === 0;

        await interaction.editReply({
            embeds: [temelEmbed({
                tip: 'basari',
                baslik: hemenCaliyorMu ? `${emojis.muzik} Şimdi Çalıyor` : `${emojis.kuyruk} Kuyruğa Eklendi`,
                aciklama: `**${sarki.baslik}**\nSüre: ${sureFormatla(sarki.sureSn)}`
            })]
        });
    }
};
