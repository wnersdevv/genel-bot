const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const TIP_ISIMLERI = {
    [ChannelType.GuildText]: 'Metin Kanalı',
    [ChannelType.GuildVoice]: 'Ses Kanalı',
    [ChannelType.GuildCategory]: 'Kategori',
    [ChannelType.GuildAnnouncement]: 'Duyuru Kanalı',
    [ChannelType.GuildStageVoice]: 'Sahne Kanalı',
    [ChannelType.GuildForum]: 'Forum Kanalı'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kanal')
        .setDescription('Bir kanal hakkında bilgi gösterir.')
        .addChannelOption(o => o.setName('kanal').setDescription('Bilgisi görüntülenecek kanal (boş = bu kanal)').setRequired(false)),
    kategori: 'araçlar',

    async execute(client, interaction) {
        const kanal = interaction.options.getChannel('kanal') || interaction.channel;

        const alanlar = [
            { name: 'ID', value: kanal.id, inline: true },
            { name: 'Tür', value: TIP_ISIMLERI[kanal.type] || 'Diğer', inline: true },
            { name: 'Kategori', value: kanal.parent?.name || 'Yok', inline: true },
            { name: 'Oluşturulma', value: `<t:${Math.floor(kanal.createdAt.getTime() / 1000)}:D>`, inline: true },
            { name: 'Pozisyon', value: `${kanal.position ?? 'N/A'}`, inline: true }
        ];

        if (kanal.topic) alanlar.push({ name: 'Konu', value: kanal.topic });
        if (kanal.type === ChannelType.GuildText && kanal.rateLimitPerUser) {
            alanlar.push({ name: 'Slowmode', value: `${kanal.rateLimitPerUser} saniye`, inline: true });
        }

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `📢 #${kanal.name}`, alanlar })]
        });
    }
};
