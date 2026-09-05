const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const PRESETLER = [
    { deger: 'topluluk', etiket: '🏘️ Topluluk', aciklama: 'Tüm modüller açık, genel amaçlı sunucular için' },
    { deger: 'oyun', etiket: '🎮 Oyun', aciklama: 'Ekonomi, seviye, çekiliş, eğlence öne çıkar' },
    { deger: 'destek', etiket: '🎫 Destek', aciklama: 'Ticket, moderasyon ve koruma öne çıkar' },
    { deger: 'minimal', etiket: '🧹 Minimal', aciklama: 'Sadece moderasyon ve log açık, gerisi kapalı' },
    { deger: 'otomatik', etiket: '⚙️ Varsayılan', aciklama: 'Hiçbir şeyi değiştirme, varsayılan ayarlarla devam et' }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kurulum')
        .setDescription('İlk kurulum sihirbazını başlatır.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    kategori: 'sistem',

    async execute(client, interaction) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId('kurulum:preset-sec')
            .setPlaceholder('Bir sunucu tipi seçin...')
            .addOptions(PRESETLER.map(p => ({ label: p.etiket, value: p.deger, description: p.aciklama })));

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.bot} wnersdev Kurulum Sihirbazı`,
                aciklama: 'Sunucunuza en uygun modül yapılandırmasını seçin. İstediğiniz zaman `/ayarlar` veya web dashboard üzerinden değiştirebilirsiniz.'
            })],
            components: [new ActionRowBuilder().addComponents(menu)]
        });
    }
};

module.exports.PRESETLER = PRESETLER;
