const { guildAyariGuncelle } = require('../../services/guildService');
const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');

module.exports = {
    customId: 'kurulum:tamamla',
    async execute(client, interaction) {
        await guildAyariGuncelle(interaction.guild.id, { kurulumTamamlandi: true });

        await interaction.update({
            embeds: [temelEmbed({
                tip: 'basari',
                baslik: `${emojis.basari} Kurulum Tamamlandı!`,
                aciklama: 'Ayarlarınızı istediğiniz zaman `/ayarlar`, `/panel` veya web dashboard üzerinden değiştirebilirsiniz.'
            })],
            components: []
        });
    }
};
