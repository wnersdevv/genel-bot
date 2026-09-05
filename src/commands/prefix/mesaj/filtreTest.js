const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { filtreGetir, mesajiKontrolEt } = require('../../../services/filtreService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filtre-test')
        .setDescription('Bir metnin filtre kurallarına takılıp takılmadığını test eder.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(o => o.setName('metin').setDescription('Test edilecek metin').setRequired(true)),
    kategori: 'mesajFiltreleme',

    async execute(client, interaction) {
        const metin = interaction.options.getString('metin');
        const filtre = await filtreGetir(interaction.guild.id);
        const sonuc = mesajiKontrolEt(metin, filtre);

        await interaction.reply({
            embeds: [temelEmbed({
                tip: sonuc.ihlalVar ? 'hata' : 'basari',
                baslik: `${emojis.temizle} Filtre Testi`,
                aciklama: sonuc.ihlalVar ? `🚫 Bu metin filtreye takılırdı.\n**Sebep:** ${sonuc.sebep}` : '✅ Bu metin herhangi bir filtre kuralına takılmıyor.'
            })],
            flags: 64
        });
    }
};
