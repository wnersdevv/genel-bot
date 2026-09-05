const { ActionRowBuilder, ChannelSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { guildAyariGuncelle } = require('../../services/guildService');
const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');

const PRESET_AYARLARI = {
    topluluk: {},
    oyun: {
        'modüller.ticket': false,
        'modüller.öneri': false,
        'modüller.ekonomi': true,
        'modüller.seviye': true,
        'modüller.çekiliş': true,
        'modüller.eğlence': true
    },
    destek: {
        'modüller.ekonomi': false,
        'modüller.seviye': false,
        'modüller.çekiliş': false,
        'modüller.ticket': true,
        'modüller.moderasyon': true,
        'modüller.koruma': true
    },
    minimal: {
        'modüller.ticket': false, 'modüller.müzik': false, 'modüller.eğlence': false,
        'modüller.ekonomi': false, 'modüller.seviye': false, 'modüller.çekiliş': false,
        'modüller.öneri': false, 'modüller.özelOda': false, 'modüller.hoşgeldin': false,
        'modüller.güleGüle': false, 'modüller.otoRol': false, 'modüller.afk': false,
        'modüller.doğumGünü': false, 'modüller.itibar': false, 'modüller.tag': false,
        'modüller.otomatikCevap': false, 'modüller.rolMenü': false, 'modüller.backup': false,
        'modüller.moderasyon': true, 'modüller.log': true
    },
    otomatik: {}
};

module.exports = {
    customId: 'kurulum:preset-sec',
    async execute(client, interaction) {
        const preset = interaction.values[0];
        const ayarlar = PRESET_AYARLARI[preset] || {};

        if (Object.keys(ayarlar).length > 0) {
            await guildAyariGuncelle(interaction.guild.id, ayarlar);
        }

        const kanalSecici = new ChannelSelectMenuBuilder()
            .setCustomId('kurulum:log-kanal-sec')
            .setPlaceholder('Log kanalı seçin (opsiyonel)')
            .addChannelTypes(ChannelType.GuildText);

        const atlaButonu = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('kurulum:tamamla').setLabel('⏭️ Bu Adımı Atla ve Tamamla').setStyle(ButtonStyle.Secondary)
        );

        await interaction.update({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Modüller Ayarlandı`, aciklama: 'Şimdi isteğe bağlı olarak bir log kanalı seçebilirsiniz. Moderasyon ve sistem olayları buraya düşecek.' })],
            components: [new ActionRowBuilder().addComponents(kanalSecici), atlaButonu]
        });
    }
};
