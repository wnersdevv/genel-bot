const { guildAyariGuncelle } = require('../../services/guildService');
const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');

module.exports = {
    customId: 'kurulum:log-kanal-sec',
    async execute(client, interaction) {
        const kanalId = interaction.values[0];

        await guildAyariGuncelle(interaction.guild.id, {
            'kanallar.log': kanalId,
            'kanallar.moderasyonLog': kanalId,
            kurulumTamamlandi: true
        });

        await interaction.update({
            embeds: [temelEmbed({
                tip: 'basari',
                baslik: `${emojis.basari} Kurulum Tamamlandı!`,
                aciklama: `Log kanalı <#${kanalId}> olarak ayarlandı.\n\nAyarlarınızı istediğiniz zaman \`/ayarlar\`, \`/panel\` veya web dashboard üzerinden değiştirebilirsiniz.`
            })],
            components: []
        });
    }
};
