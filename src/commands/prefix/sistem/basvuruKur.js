const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const BasvuruFormu = require('../../../database/models/BasvuruFormu');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('başvuru-kur')
        .setDescription('Yeni bir başvuru formu şablonu oluşturur (en fazla 3 soru).')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(o => o.setName('isim').setDescription('Form ismi (örn: yetkili-basvuru)').setRequired(true).setMaxLength(32))
        .addStringOption(o => o.setName('soru-1').setDescription('1. soru').setRequired(true).setMaxLength(200))
        .addStringOption(o => o.setName('soru-2').setDescription('2. soru').setRequired(false).setMaxLength(200))
        .addStringOption(o => o.setName('soru-3').setDescription('3. soru').setRequired(false).setMaxLength(200))
        .addChannelOption(o => o.setName('sonuç-kanalı').setDescription('Başvuruların düşeceği kanal').addChannelTypes(ChannelType.GuildText).setRequired(false)),
    kategori: 'sistem',

    async execute(client, interaction) {
        const isim = interaction.options.getString('isim').toLowerCase().replace(/\s+/g, '-');
        const sorular = [1, 2, 3].map(i => interaction.options.getString(`soru-${i}`)).filter(Boolean);
        const sonucKanali = interaction.options.getChannel('sonuç-kanalı');

        const mevcut = await BasvuruFormu.findOne({ guildId: interaction.guild.id, isim });
        if (mevcut) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Zaten Mevcut`, aciklama: `**${isim}** isminde bir form zaten var.` })], flags: 64 });
        }

        await BasvuruFormu.create({
            guildId: interaction.guild.id, isim, sorular,
            sonucKanaliId: sonucKanali?.id || null,
            olusturanId: interaction.user.id
        });

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Form Oluşturuldu`, aciklama: `**${isim}** formu oluşturuldu. Kullanıcılar \`/başvuru form:${isim}\` ile başvurabilir.` })],
            flags: 64
        });
    }
};
