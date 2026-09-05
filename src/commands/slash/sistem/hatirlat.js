const { SlashCommandBuilder } = require('discord.js');
const ms = require('ms');
const Hatirlatici = require('../../../database/models/Hatirlatici');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hatırlat')
        .setDescription('Belirtilen süre sonra size hatırlatma gönderir.')
        .addStringOption(o => o.setName('süre').setDescription('Örn: 10m, 1h, 2d').setRequired(true))
        .addStringOption(o => o.setName('içerik').setDescription('Hatırlatma içeriği').setRequired(true)),
    kategori: 'sistem',
    cooldownSn: 3,

    async execute(client, interaction) {
        const sureMetni = interaction.options.getString('süre');
        const icerik = interaction.options.getString('içerik');
        const sureMs = ms(sureMetni);

        if (!sureMs || sureMs <= 0) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz Süre`, aciklama: 'Süreyi `10m`, `1h`, `2d` gibi bir formatta girin.' })], flags: 64 });
        }

        const hatirlatZamani = new Date(Date.now() + sureMs);

        await Hatirlatici.create({
            guildId: interaction.guild.id,
            kanalId: interaction.channel.id,
            kullaniciId: interaction.user.id,
            icerik,
            hatirlatZamani
        });

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'basari',
                baslik: `${emojis.hatirlatici} Hatırlatıcı Ayarlandı`,
                aciklama: `<t:${Math.floor(hatirlatZamani.getTime() / 1000)}:R> size hatırlatacağım:\n"${icerik}"`
            })],
            flags: 64
        });
    }
};
