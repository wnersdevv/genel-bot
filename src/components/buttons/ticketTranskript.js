const { ticketYetkisiKontrol, transkriptOlustur } = require('../../services/ticketService');
const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');

module.exports = {
    customId: 'ticket:transkript',
    async execute(client, interaction) {
        const { ticket, izinli, hata } = await ticketYetkisiKontrol(interaction);

        if (!ticket) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bulunamadı`, aciklama: 'Bu kanal bir ticket olarak kayıtlı değil.' })], flags: 64 });
        }
        if (!izinli) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkisiz`, aciklama: hata })], flags: 64 });
        }

        await interaction.deferReply({ flags: 64 });
        const transkript = await transkriptOlustur(interaction.channel);

        await interaction.editReply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.ticketTranskript} Transkript Hazır`, aciklama: `Ticket #${ticket.ticketNo} dökümü aşağıda.` })],
            files: [{ attachment: Buffer.from(transkript, 'utf-8'), name: `ticket-${ticket.ticketNo}.txt` }]
        });
    }
};
