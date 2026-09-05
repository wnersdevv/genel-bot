const OzelOda = require('../../database/models/OzelOda');
const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');

module.exports = {
    customId: 'oda:sil',
    async execute(client, interaction) {
        const kanalId = interaction.customId.split(':')[2];
        const oda = await OzelOda.findOne({ kanalId });

        if (!oda || oda.sahipId !== interaction.user.id) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkisiz`, aciklama: 'Bu işlemi yalnızca oda sahibi yapabilir.' })], flags: 64 });
        }

        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Oda Siliniyor`, aciklama: 'Oda birkaç saniye içinde silinecek.' })] });

        await OzelOda.deleteOne({ kanalId });
        setTimeout(() => interaction.channel.delete().catch(() => {}), 3000);
    }
};
