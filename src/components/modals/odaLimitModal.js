const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');

module.exports = {
    customId: 'odaLimitModal:gonder',
    async execute(client, interaction) {
        const kanalId = interaction.customId.split(':')[2];
        const girilen = interaction.fields.getTextInputValue('yeniLimit');
        const limit = parseInt(girilen, 10);

        if (Number.isNaN(limit) || limit < 0 || limit > 99) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz Limit`, aciklama: '0 ile 99 arasında bir sayı girin.' })], flags: 64 });
        }

        const kanal = interaction.guild.channels.cache.get(kanalId);
        if (!kanal) return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Kanal Bulunamadı` })], flags: 64 });

        await kanal.setUserLimit(limit).catch(() => {});
        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Limit Güncellendi`, aciklama: `Kullanıcı limiti **${limit === 0 ? 'sınırsız' : limit}** olarak ayarlandı.` })], flags: 64 });
    }
};
