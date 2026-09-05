const { SlashCommandBuilder } = require('discord.js');
const { ekonomiKaydiGetir } = require('../../../services/ekonomiService');
const { guildAyariGetir } = require('../../../services/guildService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bakiye')
        .setDescription('Cüzdan ve banka bakiyenizi gösterir.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('Bakiyesi görüntülenecek kullanıcı').setRequired(false)),
    aliaslar: ['bal', 'cuzdan', 'para'],
    kategori: 'ekonomi',

    async execute(client, interaction) {
        const hedef = interaction.options.getUser('kullanıcı') || interaction.user;
        const kayit = await ekonomiKaydiGetir(interaction.guild.id, hedef.id);
        const guildAyari = await guildAyariGetir(interaction.guild.id);
        const paraBirimi = guildAyari.ekonomiAyar?.paraBirimi || emojis.para;

        const embed = temelEmbed({
            tip: 'bilgi',
            baslik: `${emojis.cuzdan} ${hedef.username} — Bakiye`,
            alanlar: [
                { name: 'Cüzdan', value: `${paraBirimi} ${kayit.cuzdan.toLocaleString('tr-TR')}`, inline: true },
                { name: 'Banka', value: `${paraBirimi} ${kayit.banka.toLocaleString('tr-TR')}`, inline: true },
                { name: 'Toplam', value: `${paraBirimi} ${(kayit.cuzdan + kayit.banka).toLocaleString('tr-TR')}`, inline: true }
            ]
        });

        await interaction.reply({ embeds: [embed] });
    }
};
