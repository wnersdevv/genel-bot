const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { guildAyariGetir } = require('../../../services/guildService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');
const config = require('../../../utils/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ayarlar')
        .setDescription('Sunucunun genel bot ayarlarını gösterir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    kategori: 'sistem',

    async execute(client, interaction) {
        const guildAyari = await guildAyariGetir(interaction.guild.id);

        const modulSatirlari = Object.entries(guildAyari.modüller)
            .map(([isim, aktif]) => `${aktif ? '🟢' : '🔴'} ${isim}`)
            .join('\n');

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.ayarlar} ${interaction.guild.name} — Genel Ayarlar`,
                alanlar: [
                    { name: 'Prefix', value: `\`${guildAyari.prefix}\``, inline: true },
                    { name: 'Dil', value: guildAyari.dil.toUpperCase(), inline: true },
                    { name: 'Modüller', value: modulSatirlari }
                ],
                aciklama: `Detaylı değişiklikler için web dashboard'ı kullanın: ${config.dashboardUrl || 'dashboard bağlantısı ayarlanmamış'}`
            })]
        });
    }
};
