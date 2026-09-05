const { SlashCommandBuilder } = require('discord.js');
const OzelOda = require('../../../database/models/OzelOda');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('oda-isim')
        .setDescription('Özel odanızın ismini değiştirir.')
        .addStringOption(o => o.setName('isim').setDescription('Yeni oda ismi').setRequired(true).setMaxLength(90)),
    kategori: 'özelOda',
    cooldownSn: 5,

    async execute(client, interaction) {
        const kanal = interaction.member.voice.channel;
        if (!kanal) return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Ses Kanalında Değilsin` })], flags: 64 });

        const oda = await OzelOda.findOne({ kanalId: kanal.id });
        if (!oda || oda.sahipId !== interaction.user.id) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkisiz`, aciklama: 'Bu işlemi yalnızca oda sahibi yapabilir.' })], flags: 64 });
        }

        const yeniIsim = interaction.options.getString('isim');
        await kanal.setName(yeniIsim);
        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} İsim Değiştirildi`, aciklama: `Oda ismi **${yeniIsim}** olarak güncellendi.` })], flags: 64 });
    }
};
