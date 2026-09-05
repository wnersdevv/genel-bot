const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Davet = require('../../../database/models/Davet');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('davetler')
        .setDescription('Sunucudaki en çok kullanılan davetleri listeler.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    kategori: 'yönetim',

    async execute(client, interaction) {
        const davetler = await Davet.find({ guildId: interaction.guild.id }).sort({ kullanimSayisi: -1 }).limit(15);

        if (davetler.length === 0) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.davet} Davetler`, aciklama: 'Henüz izlenen bir davet kullanımı yok.' })] });
        }

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.davet} En Çok Kullanılan Davetler`,
                aciklama: davetler.map(d => `\`${d.kod}\` — ${d.olusturanId ? `<@${d.olusturanId}>` : 'Bilinmiyor'} — **${d.kullanimSayisi}** kullanım`).join('\n')
            })]
        });
    }
};
