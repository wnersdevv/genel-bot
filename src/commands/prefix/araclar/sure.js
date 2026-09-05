const { SlashCommandBuilder } = require('discord.js');
const ms = require('ms');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('süre')
        .setDescription('Bir süre ifadesini (örn: 3d 4h) okunabilir formata çevirir.')
        .addStringOption(o => o.setName('ifade').setDescription('Örn: 90000 (ms) veya 2h30m').setRequired(true)),
    kategori: 'araçlar',
    cooldownSn: 2,

    async execute(client, interaction) {
        const girdi = interaction.options.getString('ifade');
        const sayiMi = /^\d+$/.test(girdi);

        let sonucMetin;
        if (sayiMi) {
            sonucMetin = ms(parseInt(girdi, 10), { long: true });
        } else {
            const msDeger = ms(girdi);
            if (!msDeger) {
                return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz İfade`, aciklama: 'Örn: `2h30m`, `90000`, `3d`' })], flags: 64 });
            }
            sonucMetin = ms(msDeger, { long: true });
        }

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.saat} Süre Dönüştürücü`, alanlar: [{ name: 'Girdi', value: `\`${girdi}\`` }, { name: 'Okunabilir', value: sonucMetin }] })]
        });
    }
};
