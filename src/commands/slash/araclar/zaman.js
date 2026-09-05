const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('zaman').setDescription('Şu anki tarih ve saati gösterir (Discord zaman damgası ile).'),
    kategori: 'araçlar',
    cooldownSn: 2,

    async execute(client, interaction) {
        const simdi = Math.floor(Date.now() / 1000);

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.saat} Şu An`,
                alanlar: [
                    { name: 'Tam Tarih', value: `<t:${simdi}:F>`, inline: true },
                    { name: 'Göreceli', value: `<t:${simdi}:R>`, inline: true },
                    { name: 'Kısa', value: `<t:${simdi}:t>`, inline: true }
                ],
                aciklama: 'Not: Bu zaman damgası herkesin ekranında kendi yerel saatine göre gösterilir.'
            })]
        });
    }
};
