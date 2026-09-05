const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Mesai = require('../../../database/models/Mesai');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mesai-başlat')
        .setDescription('Yetkili mesainizi başlatır.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    kategori: 'yönetim',

    async execute(client, interaction) {
        const acikMesai = await Mesai.findOne({ guildId: interaction.guild.id, kullaniciId: interaction.user.id, bitisZamani: null });
        if (acikMesai) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.saat} Zaten Mesaidesiniz`, aciklama: 'Önce mevcut mesainizi `/mesai-bitir` ile sonlandırın.' })], flags: 64 });
        }

        await Mesai.create({ guildId: interaction.guild.id, kullaniciId: interaction.user.id, baslangicZamani: new Date() });

        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Mesai Başladı`, aciklama: 'İyi çalışmalar!' })], flags: 64 });
    }
};
