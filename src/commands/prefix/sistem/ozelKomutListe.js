const { SlashCommandBuilder } = require('discord.js');
const OzelKomut = require('../../../database/models/OzelKomut');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('özel-komut-liste').setDescription('Sunucudaki tüm özel komutları listeler.'),
    kategori: 'sistem',

    async execute(client, interaction) {
        const komutlar = await OzelKomut.find({ guildId: interaction.guild.id }).sort({ kullanimSayisi: -1 }).limit(30);

        if (komutlar.length === 0) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.bot} Özel Komutlar`, aciklama: 'Bu sunucuda henüz özel komut yok.' })] });
        }

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.bot} Özel Komutlar (${komutlar.length})`, aciklama: komutlar.map(k => `\`${k.isim}\` — ${k.kullanimSayisi} kullanım`).join('\n') })]
        });
    }
};
