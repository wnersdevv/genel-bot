const { SlashCommandBuilder } = require('discord.js');
const Davet = require('../../../database/models/Davet');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('davet-istatistik')
        .setDescription('Bir kullanıcının davetleriyle kaç kişinin katıldığını gösterir.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('İstatistiği görüntülenecek kullanıcı').setRequired(false)),
    kategori: 'yönetim',

    async execute(client, interaction) {
        const hedef = interaction.options.getUser('kullanıcı') || interaction.user;

        const davetler = await Davet.find({ guildId: interaction.guild.id, olusturanId: hedef.id });
        const toplamKatilim = davetler.reduce((acc, d) => acc + d.kullanimSayisi, 0);

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.davet} ${hedef.username} — Davet İstatistiği`,
                alanlar: [
                    { name: 'Aktif Davet Sayısı', value: `${davetler.length}`, inline: true },
                    { name: 'Toplam Katılım', value: `${toplamKatilim}`, inline: true }
                ]
            })]
        });
    }
};
