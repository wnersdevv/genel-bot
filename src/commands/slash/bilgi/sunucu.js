const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const DOGRULAMA_SEVIYELERI = { 0: 'Yok', 1: 'Düşük', 2: 'Orta', 3: 'Yüksek', 4: 'En Yüksek' };

module.exports = {
    data: new SlashCommandBuilder().setName('sunucu').setDescription('Sunucu hakkında detaylı bilgi gösterir.'),
    aliaslar: ['sunucubilgi', 'serverinfo'],
    kategori: 'bilgi',

    async execute(client, interaction) {
        const guild = interaction.guild;
        const sahip = await guild.fetchOwner().catch(() => null);

        const metinKanali = guild.channels.cache.filter(k => k.type === ChannelType.GuildText).size;
        const sesKanali = guild.channels.cache.filter(k => k.type === ChannelType.GuildVoice).size;
        const kategori = guild.channels.cache.filter(k => k.type === ChannelType.GuildCategory).size;

        const embed = temelEmbed({
            tip: 'bilgi',
            baslik: `${emojis.istatistik} ${guild.name}`,
            alanlar: [
                { name: 'Sahip', value: sahip ? `${sahip.user.tag}` : 'Bilinmiyor', inline: true },
                { name: 'Sunucu ID', value: guild.id, inline: true },
                { name: 'Oluşturulma', value: `<t:${Math.floor(guild.createdAt.getTime() / 1000)}:D>`, inline: true },
                { name: 'Üye Sayısı', value: `${guild.memberCount}`, inline: true },
                { name: 'Rol Sayısı', value: `${guild.roles.cache.size}`, inline: true },
                { name: 'Emoji Sayısı', value: `${guild.emojis.cache.size}`, inline: true },
                { name: 'Metin Kanalları', value: `${metinKanali}`, inline: true },
                { name: 'Ses Kanalları', value: `${sesKanali}`, inline: true },
                { name: 'Kategoriler', value: `${kategori}`, inline: true },
                { name: 'Boost Seviyesi', value: `${guild.premiumTier} (${guild.premiumSubscriptionCount || 0} boost)`, inline: true },
                { name: 'Doğrulama Seviyesi', value: DOGRULAMA_SEVIYELERI[guild.verificationLevel] ?? 'Bilinmiyor', inline: true }
            ]
        });

        if (guild.iconURL()) embed.setThumbnail(guild.iconURL({ size: 512 }));
        if (guild.bannerURL()) embed.setImage(guild.bannerURL({ size: 1024 }));

        await interaction.reply({ embeds: [embed] });
    }
};
