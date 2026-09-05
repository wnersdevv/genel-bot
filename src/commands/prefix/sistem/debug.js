const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('debug').setDescription('[Geliştirici] Mevcut bağlam hakkında ham bilgi gösterir.'),
    kategori: 'sistem',
    geliştiriciKomutu: true,

    async execute(client, interaction) {
        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.gelistirici} Debug Bilgisi`,
                alanlar: [
                    { name: 'Guild ID', value: interaction.guild?.id || 'Yok', inline: true },
                    { name: 'Kanal ID', value: interaction.channel?.id || 'Yok', inline: true },
                    { name: 'Kullanıcı ID', value: interaction.user.id, inline: true },
                    { name: 'Shard', value: `${interaction.guild?.shardId ?? 0}`, inline: true },
                    { name: 'Locale', value: interaction.locale || 'Yok', inline: true },
                    { name: 'Uygulama ID', value: client.application.id, inline: true }
                ]
            })],
            flags: 64
        });
    }
};
