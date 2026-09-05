const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const OzelOda = require('../database/models/OzelOda');
const { guildAyariGetir } = require('../services/guildService');
const { temelEmbed } = require('../utils/embedOlustur');
const emojis = require('../utils/emojis');

module.exports = {
    isim: 'voiceStateUpdate',
    async execute(client, eskiDurum, yeniDurum) {
        const guild = yeniDurum.guild || eskiDurum.guild;
        const guildAyari = await guildAyariGetir(guild.id);
        if (!guildAyari.modüller.özelOda) return;

        const olusturucuKanalId = guildAyari.özelOdaAyar?.olusturucuKanalId;
        if (!olusturucuKanalId) return;

        // Kullanıcı oluşturucu kanala girdi -> yeni oda oluştur
        if (yeniDurum.channelId === olusturucuKanalId && eskiDurum.channelId !== olusturucuKanalId) {
            await odaOlustur(client, yeniDurum, guildAyari);
        }

        // Kullanıcı bir odadan ayrıldı, oda boşaldıysa sil
        if (eskiDurum.channelId && eskiDurum.channelId !== olusturucuKanalId) {
            const odaKaydi = await OzelOda.findOne({ kanalId: eskiDurum.channelId });
            if (odaKaydi && eskiDurum.channel && eskiDurum.channel.members.size === 0) {
                await eskiDurum.channel.delete().catch(() => {});
                await OzelOda.deleteOne({ kanalId: eskiDurum.channelId });
            }
        }
    }
};

async function odaOlustur(client, uyeDurumu, guildAyari) {
    const guild = uyeDurumu.guild;
    const uye = uyeDurumu.member;

    const kanal = await guild.channels.create({
        name: `🔊 ${uye.user.username}'in Odası`,
        type: ChannelType.GuildVoice,
        parent: guildAyari.özelOdaAyar?.kategoriId || undefined,
        userLimit: guildAyari.özelOdaAyar?.varsayilanLimit || 0,
        permissionOverwrites: [
            { id: uye.id, allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] }
        ]
    });

    await OzelOda.create({ guildId: guild.id, kanalId: kanal.id, sahipId: uye.id });
    await uye.voice.setChannel(kanal).catch(() => {});

    const satir = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`oda:kilit:${kanal.id}`).setLabel('🔒 Kilitle/Aç').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`oda:isim:${kanal.id}`).setLabel('✏️ İsim Değiştir').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`oda:limit:${kanal.id}`).setLabel('👥 Limit Ayarla').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`oda:sil:${kanal.id}`).setLabel('🗑️ Odayı Sil').setStyle(ButtonStyle.Danger)
    );

    await kanal.send({
        embeds: [temelEmbed({
            tip: 'bilgi',
            baslik: `${emojis.ozelOda} Özel Odan Hazır!`,
            aciklama: `${uye}, bu senin özel oda kontrol panelin. Aşağıdaki butonlarla odanı yönetebilirsin.`
        })],
        components: [satir]
    }).catch(() => {});
}
