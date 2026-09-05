const { SlashCommandBuilder } = require('discord.js');
const Itibar = require('../../../database/models/Itibar');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('itibar')
        .setDescription('Bir kullanıcının itibar puanını gösterir.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('İtibarı görüntülenecek kullanıcı').setRequired(false)),
    kategori: 'sosyal',

    async execute(client, interaction) {
        const hedef = interaction.options.getUser('kullanıcı') || interaction.user;
        const kayit = await Itibar.findOne({ guildId: interaction.guild.id, kullaniciId: hedef.id });

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.itibar} ${hedef.username} — İtibar`, aciklama: `Toplam itibar puanı: **${kayit?.itibarPuani || 0}**` })]
        });
    }
};
