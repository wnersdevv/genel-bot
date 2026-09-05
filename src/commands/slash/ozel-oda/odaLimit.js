const { SlashCommandBuilder } = require('discord.js');
const OzelOda = require('../../../database/models/OzelOda');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('oda-limit')
        .setDescription('Özel odanızın kullanıcı limitini ayarlar.')
        .addIntegerOption(o => o.setName('limit').setDescription('0 = sınırsız, maks. 99').setMinValue(0).setMaxValue(99).setRequired(true)),
    kategori: 'özelOda',

    async execute(client, interaction) {
        const kanal = interaction.member.voice.channel;
        if (!kanal) return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Ses Kanalında Değilsin` })], flags: 64 });

        const oda = await OzelOda.findOne({ kanalId: kanal.id });
        if (!oda || oda.sahipId !== interaction.user.id) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkisiz`, aciklama: 'Bu işlemi yalnızca oda sahibi yapabilir.' })], flags: 64 });
        }

        const limit = interaction.options.getInteger('limit');
        await kanal.setUserLimit(limit);
        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Limit Güncellendi`, aciklama: `Kullanıcı limiti **${limit === 0 ? 'sınırsız' : limit}** olarak ayarlandı.` })], flags: 64 });
    }
};
