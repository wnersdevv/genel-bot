const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const OzelKomut = require('../../../database/models/OzelKomut');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('özel-komut-oluştur')
        .setDescription('Prefix ile çalışan özel bir komut oluşturur (örn. !merhaba).')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(o => o.setName('isim').setDescription('Komut ismi (prefix hariç)').setRequired(true).setMaxLength(24))
        .addStringOption(o => o.setName('cevap').setDescription('Komut çalıştığında gönderilecek mesaj').setRequired(true).setMaxLength(1900)),
    kategori: 'sistem',

    async execute(client, interaction) {
        const isim = interaction.options.getString('isim').toLowerCase().replace(/\s+/g, '-');
        const cevap = interaction.options.getString('cevap');

        if (client.prefixKomutlari.has(isim)) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} İsim Çakışması`, aciklama: `**${isim}** zaten yerleşik bir komut ismi, farklı bir isim seçin.` })], flags: 64 });
        }

        const mevcut = await OzelKomut.findOne({ guildId: interaction.guild.id, isim });
        if (mevcut) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Zaten Mevcut`, aciklama: `**${isim}** isminde bir özel komut zaten var.` })], flags: 64 });
        }

        await OzelKomut.create({ guildId: interaction.guild.id, isim, cevap, olusturanId: interaction.user.id });

        const guildAyari = await require('../../../services/guildService').guildAyariGetir(interaction.guild.id);
        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Özel Komut Oluşturuldu`, aciklama: `Artık \`${guildAyari.prefix}${isim}\` yazarak bu komutu kullanabilirsiniz.` })]
        });
    }
};
