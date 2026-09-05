const { SlashCommandBuilder } = require('discord.js');
const Itibar = require('../../../database/models/Itibar');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 saat, abuse önleme

module.exports = {
    data: new SlashCommandBuilder()
        .setName('itibar-ver')
        .setDescription('Bir kullanıcıya itibar puanı verir.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('İtibar verilecek kullanıcı').setRequired(true)),
    kategori: 'sosyal',

    async execute(client, interaction) {
        const hedef = interaction.options.getUser('kullanıcı');

        if (hedef.id === interaction.user.id) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz İşlem`, aciklama: 'Kendinize itibar veremezsiniz.' })], flags: 64 });
        }
        if (hedef.bot) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz İşlem`, aciklama: 'Botlara itibar veremezsiniz.' })], flags: 64 });
        }

        let verenKayit = await Itibar.findOne({ guildId: interaction.guild.id, kullaniciId: interaction.user.id });
        if (!verenKayit) verenKayit = new Itibar({ guildId: interaction.guild.id, kullaniciId: interaction.user.id });

        if (verenKayit.sonVermeZamani && Date.now() - new Date(verenKayit.sonVermeZamani).getTime() < COOLDOWN_MS) {
            const kalanSaat = Math.ceil((COOLDOWN_MS - (Date.now() - new Date(verenKayit.sonVermeZamani).getTime())) / (60 * 60 * 1000));
            return interaction.reply({ embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.saat} Beklemelisiniz`, aciklama: `Tekrar itibar verebilmek için **${kalanSaat} saat** beklemelisiniz.` })], flags: 64 });
        }

        verenKayit.sonVermeZamani = new Date();
        await verenKayit.save();

        const hedefKayit = await Itibar.findOneAndUpdate(
            { guildId: interaction.guild.id, kullaniciId: hedef.id },
            { $inc: { itibarPuani: 1 } },
            { upsert: true, new: true }
        );

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.itibar} İtibar Verildi`, aciklama: `**${hedef.username}** kullanıcısına itibar verdiniz. Toplam itibarı: **${hedefKayit.itibarPuani}**` })]
        });
    }
};
