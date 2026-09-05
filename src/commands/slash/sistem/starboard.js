const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { guildAyariGuncelle } = require('../../../services/guildService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('starboard')
        .setDescription('Starboard kanalını ve gerekli yıldız sayısını ayarlar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addChannelOption(o => o.setName('kanal').setDescription('Starboard kanalı').addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addIntegerOption(o => o.setName('eşik').setDescription('Gerekli minimum yıldız sayısı (varsayılan 3)').setMinValue(1).setRequired(false)),
    kategori: 'starboard',

    async execute(client, interaction) {
        const kanal = interaction.options.getChannel('kanal');
        const esik = interaction.options.getInteger('eşik') || 3;

        await guildAyariGuncelle(interaction.guild.id, {
            'kanallar.starboard': kanal.id,
            'starboardAyar.esikSayisi': esik,
            'modüller.starboard': true
        });

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.starboard} Starboard Ayarlandı`, aciklama: `Öne çıkan mesajlar artık ${kanal} kanalına düşecek.\n**Eşik:** ${esik} ⭐` })]
        });
    }
};
