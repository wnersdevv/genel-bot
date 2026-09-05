const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { guildAyariGuncelle } = require('../../../services/guildService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('özel-oda')
        .setDescription('Kullanıcıların girince özel oda oluşturacağı ses kanalını ayarlar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addChannelOption(o => o.setName('kanal').setDescription('Oluşturucu ses kanalı').addChannelTypes(ChannelType.GuildVoice).setRequired(true)),
    kategori: 'özelOda',

    async execute(client, interaction) {
        const kanal = interaction.options.getChannel('kanal');

        await guildAyariGuncelle(interaction.guild.id, {
            'özelOdaAyar.olusturucuKanalId': kanal.id,
            'özelOdaAyar.kategoriId': kanal.parentId
        });

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.ozelOda} Özel Oda Sistemi Ayarlandı`, aciklama: `Artık kullanıcılar ${kanal} kanalına girdiğinde otomatik olarak kendi özel odaları oluşturulacak.` })]
        });
    }
};
