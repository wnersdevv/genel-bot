const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Oneri = require('../../../database/models/Oneri');
const { guildAyariGetir } = require('../../../services/guildService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');
const { basariVer } = require('../../../services/basariService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('öneri')
        .setDescription('Sunucu için bir öneri gönderir.')
        .addStringOption(o => o.setName('içerik').setDescription('Öneriniz').setRequired(true).setMaxLength(1000)),
    kategori: 'öneri',
    cooldownSn: 30,

    async execute(client, interaction) {
        const icerik = interaction.options.getString('içerik');
        const guildAyari = await guildAyariGetir(interaction.guild.id);
        const kanalId = guildAyari.kanallar?.öneri;
        const kanal = kanalId ? interaction.guild.channels.cache.get(kanalId) : interaction.channel;

        if (!kanal) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Kanal Bulunamadı`, aciklama: 'Öneri kanalı ayarlanmamış veya bulunamadı.' })], flags: 64 });
        }

        const embed = temelEmbed({
            tip: 'bilgi',
            baslik: `${emojis.oneri} Yeni Öneri`,
            aciklama: icerik,
            alanlar: [
                { name: 'Gönderen', value: `${interaction.user}`, inline: true },
                { name: 'Durum', value: `${emojis.inceleniyor} Bekliyor`, inline: true }
            ]
        });

        const satir = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('oneri:kabul').setLabel('✅ Kabul').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('oneri:reddet').setLabel('❌ Reddet').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('oneri:inceleniyor').setLabel('🔄 İncelemede').setStyle(ButtonStyle.Secondary)
        );

        const mesaj = await kanal.send({ embeds: [embed], components: [satir] });
        await mesaj.react('👍').catch(() => {});
        await mesaj.react('👎').catch(() => {});

        await Oneri.create({ guildId: interaction.guild.id, kullaniciId: interaction.user.id, mesajId: mesaj.id, icerik });

        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Öneri Gönderildi`, aciklama: `Öneriniz ${kanal} kanalına iletildi.` })], flags: 64 });
        basariVer(interaction.guild.id, interaction.user.id, 'ilk-oneri', null).catch(() => {});
    }
};
