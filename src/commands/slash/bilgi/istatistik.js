const { SlashCommandBuilder } = require('discord.js');
const Ticket = require('../../../database/models/Ticket');
const { istatistikKartiOlustur } = require('../../../canvas/istatistikKarti');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('istatistik').setDescription('Sunucu istatistiklerini gösterir.'),
    kategori: 'bilgi',
    cooldownSn: 5,

    async execute(client, interaction) {
        const acikTicket = await Ticket.countDocuments({ guildId: interaction.guild.id, durum: { $ne: 'kapali' } });

        const veriler = {
            üyeSayısı: interaction.guild.memberCount,
            kanalSayısı: interaction.guild.channels.cache.size,
            rolSayısı: interaction.guild.roles.cache.size,
            açıkTicket: acikTicket
        };

        try {
            const gorsel = await istatistikKartiOlustur(interaction.guild, veriler);
            await interaction.reply({ files: [gorsel] });
        } catch {
            await interaction.reply({
                embeds: [temelEmbed({
                    tip: 'bilgi',
                    baslik: `${emojis.istatistik} ${interaction.guild.name} — İstatistikler`,
                    alanlar: [
                        { name: 'Üye', value: `${veriler.üyeSayısı}`, inline: true },
                        { name: 'Kanal', value: `${veriler.kanalSayısı}`, inline: true },
                        { name: 'Rol', value: `${veriler.rolSayısı}`, inline: true },
                        { name: 'Açık Ticket', value: `${veriler.açıkTicket}`, inline: true }
                    ]
                })]
            });
        }
    }
};
