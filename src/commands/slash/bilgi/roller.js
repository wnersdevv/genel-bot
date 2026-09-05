const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roller')
        .setDescription('Bir kullanıcının rollerini listeler.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('Rolleri görüntülenecek kullanıcı').setRequired(false)),
    kategori: 'bilgi',

    async execute(client, interaction) {
        const hedefUye = interaction.options.getMember('kullanıcı') || interaction.member;

        const roller = hedefUye.roles.cache
            .filter(r => r.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position);

        if (roller.size === 0) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.rol} Roller`, aciklama: `**${hedefUye.user.username}** kullanıcısının hiç rolü yok.` })] });
        }

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.rol} ${hedefUye.user.username} — Roller (${roller.size})`,
                aciklama: roller.map(r => `<@&${r.id}>`).join('\n')
            })]
        });
    }
};
