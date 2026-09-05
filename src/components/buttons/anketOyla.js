const Anket = require('../../database/models/Anket');
const { sonucEmbedOlustur } = require('../../commands/slash/sistem/anket');
const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');

module.exports = {
    customId: 'anket:oyla',
    async execute(client, interaction) {
        const secenekIndex = parseInt(interaction.customId.split(':')[2], 10);
        const anket = await Anket.findOne({ mesajId: interaction.message.id });

        if (!anket) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bulunamadı` })], flags: 64 });
        }
        if (anket.kapandi) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.kilit} Anket Kapandı`, aciklama: 'Bu ankete artık oy verilemez.' })], flags: 64 });
        }

        const mevcutOy = anket.kullaniciOylari.find(o => o.kullaniciId === interaction.user.id);
        if (mevcutOy) {
            mevcutOy.secenekIndex = secenekIndex;
        } else {
            anket.kullaniciOylari.push({ kullaniciId: interaction.user.id, secenekIndex });
        }
        await anket.save();

        await interaction.update({ embeds: [sonucEmbedOlustur(anket)] });
    }
};
