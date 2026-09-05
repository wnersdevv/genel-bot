const { SlashCommandBuilder } = require('discord.js');
const Seviye = require('../../../database/models/Seviye');
const { seviyeKartiOlustur } = require('../../../canvas/seviyeKarti');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seviye')
        .setDescription('Seviye ve XP durumunuzu gösterir.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('Seviyesi görüntülenecek kullanıcı').setRequired(false)),
    aliaslar: ['level', 'rutbem'],
    kategori: 'seviye',

    async execute(client, interaction) {
        const hedef = interaction.options.getUser('kullanıcı') || interaction.user;
        const hedefUye = interaction.options.getMember('kullanıcı') || interaction.member;
        const kayit = await Seviye.findOne({ guildId: interaction.guild.id, kullaniciId: hedef.id });

        if (!kayit) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.seviye} Seviye Bilgisi`, aciklama: `**${hedef.username}** henüz XP kazanmamış.` })]
            });
        }

        const gerekliXp = Seviye.gerekliXp(kayit.seviye);

        try {
            const gorsel = await seviyeKartiOlustur(hedefUye, kayit, gerekliXp);
            await interaction.reply({ files: [gorsel] });
        } catch {
            const yuzde = Math.floor((kayit.xp / gerekliXp) * 100);
            const barUzunluk = 20;
            const doluBar = Math.round((yuzde / 100) * barUzunluk);
            const bar = '█'.repeat(doluBar) + '░'.repeat(barUzunluk - doluBar);

            await interaction.reply({
                embeds: [temelEmbed({
                    tip: 'bilgi',
                    baslik: `${emojis.seviye} ${hedef.username} — Seviye ${kayit.seviye}`,
                    aciklama: `${bar} ${yuzde}%\n**XP:** ${kayit.xp} / ${gerekliXp}\n**Toplam Mesaj:** ${kayit.toplamMesaj}`
                })]
            });
        }
    }
};
