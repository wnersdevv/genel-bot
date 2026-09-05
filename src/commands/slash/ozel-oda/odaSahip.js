const { SlashCommandBuilder } = require('discord.js');
const OzelOda = require('../../../database/models/OzelOda');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('oda-sahip')
        .setDescription('Oda sahipliğini başka bir kullanıcıya devreder.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('Yeni oda sahibi').setRequired(true)),
    kategori: 'özelOda',

    async execute(client, interaction) {
        const kanal = interaction.member.voice.channel;
        if (!kanal) return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Ses Kanalında Değilsin` })], flags: 64 });

        const oda = await OzelOda.findOne({ kanalId: kanal.id });
        if (!oda || oda.sahipId !== interaction.user.id) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkisiz`, aciklama: 'Bu işlemi yalnızca oda sahibi yapabilir.' })], flags: 64 });
        }

        const hedefUye = interaction.options.getMember('kullanıcı');
        if (!hedefUye || hedefUye.voice.channelId !== kanal.id) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz Kullanıcı`, aciklama: 'Sahipliği yalnızca odada bulunan bir kullanıcıya devredebilirsiniz.' })], flags: 64 });
        }

        oda.sahipId = hedefUye.id;
        await oda.save();
        await kanal.permissionOverwrites.edit(hedefUye.id, { ManageChannels: true, Connect: true });

        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Sahiplik Devredildi`, aciklama: `Oda sahipliği ${hedefUye} kullanıcısına devredildi.` })] });
    }
};
