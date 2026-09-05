const { SlashCommandBuilder } = require('discord.js');
const OzelOda = require('../../../database/models/OzelOda');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('oda-aç').setDescription('Özel odanızın kilidini açar.'),
    kategori: 'özelOda',

    async execute(client, interaction) {
        const kanal = interaction.member.voice.channel;
        if (!kanal) return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Ses Kanalında Değilsin` })], flags: 64 });

        const oda = await OzelOda.findOne({ kanalId: kanal.id });
        if (!oda || oda.sahipId !== interaction.user.id) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkisiz`, aciklama: 'Bu işlemi yalnızca oda sahibi yapabilir.' })], flags: 64 });
        }

        await kanal.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: null });
        oda.kilitli = false;
        await oda.save();

        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.kilitAcik} Oda Açıldı`, aciklama: 'Artık herkes odanıza katılabilir.' })], flags: 64 });
    }
};
