const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('şans')
        .setDescription('Bugünkü şans yüzdenizi hesaplar.')
        .addStringOption(o => o.setName('konu').setDescription('Ne için şans ölçülsün? (opsiyonel)').setRequired(false)),
    kategori: 'eğlence',
    cooldownSn: 3,

    async execute(client, interaction) {
        const konu = interaction.options.getString('konu');
        const yuzde = Math.floor(Math.random() * 101);

        const barUzunluk = 20;
        const doluBar = Math.round((yuzde / 100) * barUzunluk);
        const bar = '🟩'.repeat(Math.round(doluBar / 2)) + '⬜'.repeat(Math.round((barUzunluk - doluBar) / 2));

        await interaction.reply({
            embeds: [temelEmbed({
                tip: yuzde > 60 ? 'basari' : yuzde > 30 ? 'uyari' : 'hata',
                baslik: `🍀 Şans Ölçer`,
                aciklama: `${konu ? `**${interaction.user.username}**'in "${konu}" konusundaki` : `**${interaction.user.username}**'in bugünkü`} şansı:\n\n${bar}\n**%${yuzde}**`
            })]
        });
    }
};
