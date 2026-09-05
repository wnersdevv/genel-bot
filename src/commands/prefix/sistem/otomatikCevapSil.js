const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const OtomatikCevap = require('../../../database/models/OtomatikCevap');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('otomatik-cevap-sil')
        .setDescription('Bir otomatik cevabı tetikleyici kelimesine göre siler.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(o => o.setName('tetikleyici').setDescription('Silinecek tetikleyici').setRequired(true)),
    kategori: 'sistem',

    async execute(client, interaction) {
        const tetikleyici = interaction.options.getString('tetikleyici');
        const silinen = await OtomatikCevap.findOneAndDelete({ guildId: interaction.guild.id, tetikleyici });

        if (!silinen) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bulunamadı`, aciklama: 'Bu tetikleyiciye ait bir otomatik cevap bulunamadı.' })], flags: 64 });
        }

        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Silindi`, aciklama: `**"${tetikleyici}"** otomatik cevabı silindi.` })] });
    }
};
