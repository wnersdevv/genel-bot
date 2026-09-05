const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Basvuru = require('../../../database/models/Basvuru');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('başvurular')
        .setDescription('Bekleyen başvuruları listeler.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    kategori: 'sistem',

    async execute(client, interaction) {
        const basvurular = await Basvuru.find({ guildId: interaction.guild.id, durum: 'bekliyor' }).sort({ createdAt: -1 }).limit(15);

        if (basvurular.length === 0) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.oneri} Başvurular`, aciklama: 'Bekleyen başvuru yok.' })] });
        }

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.oneri} Bekleyen Başvurular (${basvurular.length})`,
                aciklama: basvurular.map(b => `\`${b._id}\` — <@${b.kullaniciId}> — **${b.formIsmi}**`).join('\n')
            })]
        });
    }
};
