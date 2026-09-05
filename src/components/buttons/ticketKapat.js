const Ticket = require('../../database/models/Ticket');
const { ticketYetkisiKontrol } = require('../../services/ticketService');
const { ticketKapat } = require('../../services/ticketKapatService');
const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');

module.exports = {
    customId: 'ticket:kapat',
    async execute(client, interaction) {
        const { ticket, izinli, hata } = await ticketYetkisiKontrol(interaction);

        if (!ticket) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bulunamadı`, aciklama: 'Bu kanal bir ticket olarak kayıtlı değil.' })], flags: 64 });
        }
        if (!izinli) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkisiz`, aciklama: hata })], flags: 64 });
        }
        if (ticket.durum === 'kapali') {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.uyari} Zaten Kapalı` })], flags: 64 });
        }

        await ticketKapat(interaction, ticket);
    }
};
