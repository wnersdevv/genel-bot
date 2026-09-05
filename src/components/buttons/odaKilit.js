const { PermissionFlagsBits } = require('discord.js');
const OzelOda = require('../../database/models/OzelOda');
const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');

module.exports = {
    customId: 'oda:kilit',
    async execute(client, interaction) {
        const kanalId = interaction.customId.split(':')[2];
        const oda = await OzelOda.findOne({ kanalId });

        if (!oda || oda.sahipId !== interaction.user.id) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkisiz`, aciklama: 'Bu işlemi yalnızca oda sahibi yapabilir.' })], flags: 64 });
        }

        oda.kilitli = !oda.kilitli;
        await oda.save();

        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            Connect: oda.kilitli ? false : null
        });

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${oda.kilitli ? emojis.kilit : emojis.kilitAcik} Oda ${oda.kilitli ? 'Kilitlendi' : 'Açıldı'}`, aciklama: `Oda artık **${oda.kilitli ? 'kilitli' : 'açık'}**.` })],
            flags: 64
        });
    }
};
