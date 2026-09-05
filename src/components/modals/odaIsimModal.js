const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');

module.exports = {
    customId: 'odaIsimModal:gonder',
    async execute(client, interaction) {
        const kanalId = interaction.customId.split(':')[2];
        const yeniIsim = interaction.fields.getTextInputValue('yeniIsim');
        const kanal = interaction.guild.channels.cache.get(kanalId);

        if (!kanal) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Kanal Bulunamadı` })], flags: 64 });
        }

        await kanal.setName(yeniIsim).catch(() => {});
        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} İsim Değiştirildi`, aciklama: `Oda ismi **${yeniIsim}** olarak güncellendi.` })], flags: 64 });
    }
};
