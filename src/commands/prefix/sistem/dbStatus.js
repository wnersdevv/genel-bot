const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('db-status').setDescription('[Geliştirici] MongoDB koleksiyon durumunu gösterir.'),
    kategori: 'sistem',
    geliştiriciKomutu: true,

    async execute(client, interaction) {
        await interaction.deferReply({ flags: 64 });

        const koleksiyonlar = await mongoose.connection.db.listCollections().toArray();
        const satirlar = [];

        for (const k of koleksiyonlar) {
            const sayi = await mongoose.connection.db.collection(k.name).countDocuments();
            satirlar.push(`\`${k.name}\` — ${sayi} doküman`);
        }

        await interaction.editReply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.veritabani} MongoDB Durumu`,
                aciklama: `**Bağlantı:** ${mongoose.connection.readyState === 1 ? '🟢 Bağlı' : '🔴 Bağlı değil'}\n\n${satirlar.join('\n') || 'Koleksiyon bulunamadı.'}`
            })]
        });
    }
};
