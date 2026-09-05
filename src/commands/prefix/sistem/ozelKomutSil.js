const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const OzelKomut = require('../../../database/models/OzelKomut');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('özel-komut-sil')
        .setDescription('Bir özel komutu siler.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(o => o.setName('isim').setDescription('Silinecek özel komutun ismi').setRequired(true)),
    kategori: 'sistem',

    async execute(client, interaction) {
        const isim = interaction.options.getString('isim').toLowerCase();
        const silinen = await OzelKomut.findOneAndDelete({ guildId: interaction.guild.id, isim });

        if (!silinen) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bulunamadı`, aciklama: `**${isim}** isminde bir özel komut bulunamadı.` })], flags: 64 });
        }

        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Silindi`, aciklama: `**${isim}** özel komutu silindi.` })] });
    }
};
