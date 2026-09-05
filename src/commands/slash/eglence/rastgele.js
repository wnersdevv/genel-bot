const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rastgele')
        .setDescription('Rastgele bir sayı üretir veya seçenekler arasından birini seçer.')
        .addIntegerOption(o => o.setName('min').setDescription('Minimum sayı (varsayılan 1)').setRequired(false))
        .addIntegerOption(o => o.setName('maks').setDescription('Maksimum sayı (varsayılan 100)').setRequired(false))
        .addStringOption(o => o.setName('seçenekler').setDescription('Virgülle ayrılmış seçenekler (örn: elma,armut,muz)').setRequired(false)),
    kategori: 'eğlence',
    cooldownSn: 2,

    async execute(client, interaction) {
        const secenekMetni = interaction.options.getString('seçenekler');

        if (secenekMetni) {
            const secenekler = secenekMetni.split(',').map(s => s.trim()).filter(Boolean);
            if (secenekler.length < 2) {
                return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetersiz Seçenek`, aciklama: 'En az 2 seçenek virgülle ayrılmış olarak girin.' })], flags: 64 });
            }
            const secilen = secenekler[Math.floor(Math.random() * secenekler.length)];
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `🎲 Rastgele Seçim`, aciklama: `Seçenekler: ${secenekler.join(', ')}\n\n**Seçilen: ${secilen}**` })] });
        }

        const min = interaction.options.getInteger('min') ?? 1;
        const maks = interaction.options.getInteger('maks') ?? 100;

        if (min >= maks) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz Aralık`, aciklama: '`min` değeri `maks` değerinden küçük olmalı.' })], flags: 64 });
        }

        const sonuc = Math.floor(Math.random() * (maks - min + 1)) + min;
        await interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `🎲 Rastgele Sayı`, aciklama: `**${min}** - **${maks}** arasında: **${sonuc}**` })] });
    }
};
