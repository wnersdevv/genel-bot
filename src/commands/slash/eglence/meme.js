const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('meme').setDescription('Reddit\'ten rastgele bir meme çeker.'),
    kategori: 'eğlence',
    cooldownSn: 3,

    async execute(client, interaction) {
        await interaction.deferReply();

        try {
            const yanit = await fetch('https://meme-api.com/gimme');
            if (!yanit.ok) throw new Error('API yanıt vermedi');
            const veri = await yanit.json();

            if (veri.nsfw) {
                return interaction.editReply({ embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.uyari} Uygun Olmayan İçerik`, aciklama: 'Çekilen meme uygunsuz olabileceği için gösterilmedi, tekrar deneyin.' })] });
            }

            await interaction.editReply({
                embeds: [temelEmbed({ tip: 'bilgi', baslik: `😂 ${veri.title}`, aciklama: `r/${veri.subreddit} • 👍 ${veri.ups}` }).setImage(veri.url)]
            });
        } catch {
            await interaction.editReply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Meme Çekilemedi`, aciklama: 'Meme servisine şu anda ulaşılamıyor, daha sonra tekrar deneyin.' })] });
        }
    }
};
