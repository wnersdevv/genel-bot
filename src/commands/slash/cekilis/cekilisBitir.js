const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Cekilis = require('../../../database/models/Cekilis');
const { cekilisiBitir } = require('../../../schedulers/cekilisScheduler');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('çekiliş-bitir')
        .setDescription('Aktif bir çekilişi hemen bitirir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(o => o.setName('mesaj-id').setDescription('Çekiliş mesajının ID\'si').setRequired(true)),
    kategori: 'çekiliş',

    async execute(client, interaction) {
        const mesajId = interaction.options.getString('mesaj-id');
        const cekilis = await Cekilis.findOne({ guildId: interaction.guild.id, mesajId, durum: 'aktif' });

        if (!cekilis) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bulunamadı`, aciklama: 'Bu ID ile aktif bir çekiliş bulunamadı.' })], flags: 64 });
        }

        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.cekilis} Çekiliş Bitiriliyor`, aciklama: 'Kazananlar belirleniyor...' })], flags: 64 });
        await cekilisiBitir(client, cekilis);
    }
};
