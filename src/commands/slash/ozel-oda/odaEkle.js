const { SlashCommandBuilder } = require('discord.js');
const OzelOda = require('../../../database/models/OzelOda');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('oda-ekle')
        .setDescription('Kilitli odanıza bir kullanıcının girmesine izin verir.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('Eklenecek kullanıcı').setRequired(true)),
    kategori: 'özelOda',

    async execute(client, interaction) {
        const kanal = interaction.member.voice.channel;
        if (!kanal) return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Ses Kanalında Değilsin` })], flags: 64 });

        const oda = await OzelOda.findOne({ kanalId: kanal.id });
        if (!oda || oda.sahipId !== interaction.user.id) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkisiz`, aciklama: 'Bu işlemi yalnızca oda sahibi yapabilir.' })], flags: 64 });
        }

        const hedef = interaction.options.getUser('kullanıcı');
        await kanal.permissionOverwrites.edit(hedef.id, { Connect: true, ViewChannel: true });

        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Kullanıcı Eklendi`, aciklama: `${hedef} artık odanıza katılabilir.` })], flags: 64 });
    }
};
