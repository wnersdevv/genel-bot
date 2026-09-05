const { PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Ticket = require('../../database/models/Ticket');
const TicketSayac = require('../../database/models/TicketSayac');
const { guildAyariGetir } = require('../../services/guildService');
const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');
const { guildYayinla } = require('../../dashboard/soket');
const { basariVer } = require('../../services/basariService');

const KATEGORI_ETIKETLERI = {
    'destek': '🎫 Destek',
    'teknik': '🔧 Teknik',
    'satin-alma': '🛒 Satın Alma',
    'sikayet': '⚠️ Şikayet',
    'is-birligi': '🤝 İş Birliği',
    'diger': '📁 Diğer'
};

module.exports = {
    customId: 'ticket:kategori-sec',
    async execute(client, interaction) {
        const kategori = interaction.values[0];
        const guildAyari = await guildAyariGetir(interaction.guild.id);

        const acikTicketSayisi = await Ticket.countDocuments({
            guildId: interaction.guild.id,
            sahipId: interaction.user.id,
            durum: { $ne: 'kapali' }
        });

        const maksimum = guildAyari.ticketAyar?.maksimumAcikTicket ?? 3;
        if (acikTicketSayisi >= maksimum) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.uyari} Limit Aşıldı`, aciklama: `Aynı anda en fazla **${maksimum}** açık ticketınız olabilir.` })],
                flags: 64
            });
        }

        await interaction.deferReply({ flags: 64 });

        const ticketNo = await TicketSayac.sonrakiTicketNo(interaction.guild.id);

        const izinler = [
            { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
            { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
        ];

        for (const rolId of guildAyari.roller?.ticketYetkili || []) {
            izinler.push({ id: rolId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
        }

        const kanal = await interaction.guild.channels.create({
            name: `ticket-${ticketNo.toString().padStart(4, '0')}`,
            type: ChannelType.GuildText,
            parent: guildAyari.ticketAyar?.kategoriId || undefined,
            permissionOverwrites: izinler
        });

        await Ticket.create({
            guildId: interaction.guild.id,
            kanalId: kanal.id,
            sahipId: interaction.user.id,
            ticketNo,
            kategori
        });

        const embed = temelEmbed({
            tip: 'bilgi',
            baslik: `${emojis.ticket} Ticket #${ticketNo} — ${KATEGORI_ETIKETLERI[kategori] || kategori}`,
            aciklama: `Merhaba ${interaction.user}, talebinizi buraya detaylı bir şekilde yazabilirsiniz. Bir yetkili en kısa sürede size yardımcı olacaktır.`
        });

        const satir = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`ticket:kapat:${kanal.id}`).setLabel('🔒 Ticketı Kapat').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`ticket:transkript:${kanal.id}`).setLabel('📄 Transkript Al').setStyle(ButtonStyle.Secondary)
        );

        await kanal.send({ content: `${interaction.user}`, embeds: [embed], components: [satir] });
        await interaction.editReply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Ticket Oluşturuldu`, aciklama: `Ticketınız: ${kanal}` })] });

        guildYayinla(interaction.guild.id, 'bildirim', {
            tip: 'ticket',
            metin: `Ticket #${ticketNo} açıldı (${KATEGORI_ETIKETLERI[kategori] || kategori})`,
            tarih: new Date()
        });

        basariVer(interaction.guild.id, interaction.user.id, 'ilk-ticket', kanal).catch(() => {});
    }
};
