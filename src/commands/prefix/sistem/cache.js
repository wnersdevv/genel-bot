const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('cache').setDescription('[Geliştirici] Discord.js önbellek boyutlarını gösterir.'),
    kategori: 'sistem',
    geliştiriciKomutu: true,

    async execute(client, interaction) {
        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.veritabani} Önbellek Durumu`,
                alanlar: [
                    { name: 'Sunucular', value: `${client.guilds.cache.size}`, inline: true },
                    { name: 'Kanallar', value: `${client.channels.cache.size}`, inline: true },
                    { name: 'Kullanıcılar', value: `${client.users.cache.size}`, inline: true },
                    { name: 'Slash Komutlar', value: `${client.slashKomutlari.size}`, inline: true },
                    { name: 'Prefix Komutlar', value: `${client.prefixKomutlari.size}`, inline: true },
                    { name: 'Butonlar / Menüler / Modallar', value: `${client.butonlar.size} / ${client.menuler.size} / ${client.modallar.size}`, inline: true }
                ]
            })],
            flags: 64
        });
    }
};
