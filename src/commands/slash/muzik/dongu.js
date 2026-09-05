const { SlashCommandBuilder } = require('discord.js');
const { dongu } = require('../../../services/muzikService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('döngü')
        .setDescription('Döngü modunu ayarlar.')
        .addStringOption(o => o.setName('mod').setDescription('Döngü modu').setRequired(true)
            .addChoices({ name: 'Kapalı', value: 'kapali' }, { name: 'Şarkı', value: 'sarki' }, { name: 'Kuyruk', value: 'kuyruk' })),
    kategori: 'müzik',
    async execute(client, interaction) {
        const mod = interaction.options.getString('mod');
        const basarili = dongu(interaction.guild.id, mod);
        await interaction.reply({
            embeds: [temelEmbed({
                tip: basarili ? 'basari' : 'hata',
                baslik: basarili ? `${emojis.dongu} Döngü Ayarlandı` : `${emojis.hata} Aktif Bağlantı Yok`,
                aciklama: basarili ? `Döngü modu: **${mod}**` : null
            })]
        });
    }
};
