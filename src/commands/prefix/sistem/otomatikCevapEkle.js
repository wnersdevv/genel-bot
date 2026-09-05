const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const OtomatikCevap = require('../../../database/models/OtomatikCevap');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('otomatik-cevap-ekle')
        .setDescription('Belirli bir kelimeye otomatik cevap ekler.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(o => o.setName('tetikleyici').setDescription('Tetikleyici kelime/cümle').setRequired(true))
        .addStringOption(o => o.setName('cevap').setDescription('Bot\'un vereceği cevap').setRequired(true))
        .addBooleanOption(o => o.setName('tam-eşleşme').setDescription('Mesajın tamamı eşleşmeli mi? (varsayılan: hayır)').setRequired(false)),
    kategori: 'sistem',

    async execute(client, interaction) {
        const tetikleyici = interaction.options.getString('tetikleyici');
        const cevap = interaction.options.getString('cevap');
        const tamEslesme = interaction.options.getBoolean('tam-eşleşme') || false;

        await OtomatikCevap.create({ guildId: interaction.guild.id, tetikleyici, cevap, tamEslesme, olusturanId: interaction.user.id });

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Otomatik Cevap Eklendi`, aciklama: `**"${tetikleyici}"** tetikleyicisine cevap eklendi.` })]
        });
    }
};
