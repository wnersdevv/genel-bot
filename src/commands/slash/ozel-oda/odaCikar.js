const { SlashCommandBuilder } = require('discord.js');
const OzelOda = require('../../../database/models/OzelOda');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('oda-çıkar')
        .setDescription('Bir kullanıcıyı odanızdan çıkarır ve girişini engeller.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('Çıkarılacak kullanıcı').setRequired(true)),
    kategori: 'özelOda',

    async execute(client, interaction) {
        const kanal = interaction.member.voice.channel;
        if (!kanal) return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Ses Kanalında Değilsin` })], flags: 64 });

        const oda = await OzelOda.findOne({ kanalId: kanal.id });
        if (!oda || oda.sahipId !== interaction.user.id) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkisiz`, aciklama: 'Bu işlemi yalnızca oda sahibi yapabilir.' })], flags: 64 });
        }

        const hedefUye = interaction.options.getMember('kullanıcı');
        if (!hedefUye) return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Kullanıcı Bulunamadı` })], flags: 64 });

        if (hedefUye.id === interaction.user.id) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz İşlem`, aciklama: 'Kendinizi odadan çıkaramazsınız.' })], flags: 64 });
        }

        await kanal.permissionOverwrites.edit(hedefUye.id, { Connect: false });
        if (hedefUye.voice.channelId === kanal.id) await hedefUye.voice.disconnect().catch(() => {});

        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Kullanıcı Çıkarıldı`, aciklama: `${hedefUye} odanızdan çıkarıldı.` })], flags: 64 });
    }
};
