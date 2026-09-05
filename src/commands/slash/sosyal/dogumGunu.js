const { SlashCommandBuilder } = require('discord.js');
const DogumGunu = require('../../../database/models/DogumGunu');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('doğum-günü')
        .setDescription('Bir kullanıcının kayıtlı doğum gününü gösterir.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('Doğum günü görüntülenecek kullanıcı').setRequired(false)),
    kategori: 'sosyal',

    async execute(client, interaction) {
        const hedef = interaction.options.getUser('kullanıcı') || interaction.user;
        const kayit = await DogumGunu.findOne({ guildId: interaction.guild.id, kullaniciId: hedef.id });

        if (!kayit) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.dogumGunu} Doğum Günü`, aciklama: `**${hedef.username}** henüz doğum gününü kaydetmemiş.` })] });
        }

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.dogumGunu} ${hedef.username} — Doğum Günü`, aciklama: `**${kayit.gun}/${kayit.ay}**` })]
        });
    }
};
