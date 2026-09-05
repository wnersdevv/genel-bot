const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('sticker').setDescription('Sunucudaki tüm çıkartmaları (sticker) listeler.'),
    kategori: 'araçlar',

    async execute(client, interaction) {
        const stickerlar = interaction.guild.stickers.cache;

        if (stickerlar.size === 0) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: '🏷️ Çıkartmalar', aciklama: 'Bu sunucuda henüz özel çıkartma yok.' })] });
        }

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `🏷️ Sunucu Çıkartmaları (${stickerlar.size})`,
                aciklama: stickerlar.map(s => `**${s.name}** — \`${s.id}\``).join('\n')
            })]
        });
    }
};
