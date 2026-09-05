const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Mesai = require('../../../database/models/Mesai');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mesai-bitir')
        .setDescription('Açık mesainizi sonlandırır.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    kategori: 'yönetim',

    async execute(client, interaction) {
        const acikMesai = await Mesai.findOne({ guildId: interaction.guild.id, kullaniciId: interaction.user.id, bitisZamani: null });
        if (!acikMesai) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.saat} Açık Mesai Yok`, aciklama: 'Önce `/mesai-başlat` ile mesainizi başlatmalısınız.' })], flags: 64 });
        }

        acikMesai.bitisZamani = new Date();
        acikMesai.toplamSureDk = Math.round((acikMesai.bitisZamani - acikMesai.baslangicZamani) / 60000);
        await acikMesai.save();

        const saat = Math.floor(acikMesai.toplamSureDk / 60);
        const dk = acikMesai.toplamSureDk % 60;

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Mesai Bitti`, aciklama: `Bu mesainiz **${saat}sa ${dk}dk** sürdü. Teşekkürler!` })],
            flags: 64
        });
    }
};
