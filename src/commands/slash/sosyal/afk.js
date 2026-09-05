const { SlashCommandBuilder } = require('discord.js');
const Afk = require('../../../database/models/Afk');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('AFK durumunuzu ayarlar.')
        .addStringOption(o => o.setName('mesaj').setDescription('AFK mesajınız').setRequired(false)),
    kategori: 'sosyal',

    async execute(client, interaction) {
        const mesaj = interaction.options.getString('mesaj') || 'AFK';

        await Afk.findOneAndUpdate(
            { guildId: interaction.guild.id, kullaniciId: interaction.user.id },
            { mesaj, baslangicZamani: new Date() },
            { upsert: true }
        );

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.afk} AFK Ayarlandı`, aciklama: `Artık AFK olarak işaretlendiniz.\n**Mesaj:** ${mesaj}` })]
        });
    }
};
