const { onayVerisiTemizle } = require('../../services/onayService');
const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');

module.exports = {
    customId: 'onay:iptal',
    async execute(client, interaction) {
        const token = interaction.customId.split(':').slice(2).join(':');
        onayVerisiTemizle(token);

        await interaction.update({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.iptal} İşlem İptal Edildi`, aciklama: 'İşlem güvenli bir şekilde iptal edildi.' })],
            components: []
        });
    }
};
