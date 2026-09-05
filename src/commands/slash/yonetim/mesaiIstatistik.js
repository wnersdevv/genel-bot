const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Mesai = require('../../../database/models/Mesai');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mesai-istatistik')
        .setDescription('Bir yetkilinin toplam mesai süresini gösterir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(o => o.setName('kullanıcı').setDescription('İstatistiği görüntülenecek yetkili').setRequired(false)),
    kategori: 'yönetim',

    async execute(client, interaction) {
        const hedef = interaction.options.getUser('kullanıcı') || interaction.user;

        const kayitlar = await Mesai.find({ guildId: interaction.guild.id, kullaniciId: hedef.id, bitisZamani: { $ne: null } });
        const toplamDk = kayitlar.reduce((acc, k) => acc + k.toplamSureDk, 0);
        const acikMesaiVarMi = await Mesai.exists({ guildId: interaction.guild.id, kullaniciId: hedef.id, bitisZamani: null });

        const saat = Math.floor(toplamDk / 60);
        const dk = toplamDk % 60;

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.saat} ${hedef.username} — Mesai İstatistiği`,
                alanlar: [
                    { name: 'Toplam Mesai', value: `${saat}sa ${dk}dk`, inline: true },
                    { name: 'Mesai Sayısı', value: `${kayitlar.length}`, inline: true },
                    { name: 'Şu An', value: acikMesaiVarMi ? '🟢 Mesaide' : '🔴 Mesai Dışı', inline: true }
                ]
            })]
        });
    }
};
