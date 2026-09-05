const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const OtomatikCevap = require('../../../database/models/OtomatikCevap');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('otomatik-cevap-liste')
        .setDescription('Sunucudaki tüm otomatik cevapları listeler.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    kategori: 'sistem',

    async execute(client, interaction) {
        const kayitlar = await OtomatikCevap.find({ guildId: interaction.guild.id }).limit(25);

        if (kayitlar.length === 0) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.bot} Otomatik Cevaplar`, aciklama: 'Bu sunucuda henüz otomatik cevap yok.' })] });
        }

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.bot} Otomatik Cevaplar (${kayitlar.length})`,
                aciklama: kayitlar.map(k => `**#${k._id.toString().slice(-6)}** \`${k.tetikleyici}\` → ${k.cevap.slice(0, 50)}`).join('\n')
            })]
        });
    }
};
