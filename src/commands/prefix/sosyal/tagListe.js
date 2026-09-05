const { SlashCommandBuilder } = require('discord.js');
const Tag = require('../../../database/models/Tag');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('tag-liste').setDescription('Sunucudaki tüm tagları listeler.'),
    kategori: 'sosyal',

    async execute(client, interaction) {
        const tagler = await Tag.find({ guildId: interaction.guild.id }).sort({ kullanimSayisi: -1 }).limit(30);

        if (tagler.length === 0) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.tag} Tag Listesi`, aciklama: 'Bu sunucuda henüz tag yok.' })] });
        }

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.tag} Tag Listesi (${tagler.length})`, aciklama: tagler.map(t => `\`${t.isim}\` — ${t.kullanimSayisi} kullanım`).join('\n') })]
        });
    }
};
