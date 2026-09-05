const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { temelEmbed } = require('../utils/embedOlustur');
const { sartlarVersiyonu, gizlilikVersiyonu } = require('../utils/sartlar');
const config = require('../utils/config');
const logger = require('../utils/logger');

module.exports = {
    isim: 'guildCreate',
    async execute(client, guild) {
        const hedefKanal = guild.systemChannel?.permissionsFor(guild.members.me)?.has(PermissionFlagsBits.SendMessages)
            ? guild.systemChannel
            : guild.channels.cache.find(k =>
                k.isTextBased?.() && k.permissionsFor(guild.members.me)?.has(PermissionFlagsBits.SendMessages));

        if (!hedefKanal) {
            logger.uyari('Onboarding', `${guild.id} — mesaj gönderilebilecek kanal bulunamadı.`);
            return;
        }

        const satir = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('onboarding:kabul').setLabel('✅ Kabul Ediyorum').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('onboarding:sartlar').setLabel('📄 Şartları Görüntüle').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('onboarding:reddet').setLabel('❌ Reddet').setStyle(ButtonStyle.Danger)
        );

        if (config.dashboardUrl) {
            satir.addComponents(
                new ButtonBuilder().setLabel('🌐 Dashboard').setStyle(ButtonStyle.Link).setURL(`${config.dashboardUrl}/sunucu/${guild.id}`)
            );
        }

        await hedefKanal.send({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: '👋 wnersdev\'e Hoş Geldiniz',
                aciklama:
                    'Botu bu sunucuda kullanmaya başlamadan önce **Hizmet Şartları** ve **Gizlilik Politikası**\'nı okuyup kabul etmeniz gerekir.\n\n' +
                    'Bot; komutların çalıştırılması, moderasyon, güvenlik, loglama ve etkinleştirdiğiniz özellikler kapsamında bazı sunucu ve kullanıcı verilerini işler.\n\n' +
                    '**Onayı yalnızca "Sunucuyu Yönet" yetkisine sahip bir kişi verebilir.**',
                alanlar: [
                    { name: 'Sürümler', value: `Hizmet Şartları v${sartlarVersiyonu} · Gizlilik Politikası v${gizlilikVersiyonu}` },
                    { name: 'Onay verilene kadar', value: 'Moderasyon, koruma, ticket ve loglama gibi veri işleyen özellikler devre dışı kalır.' }
                ]
            })],
            components: [satir]
        }).catch(hata => logger.uyari('Onboarding', `${guild.id}: ${hata.message}`));

        logger.bilgi('Onboarding', `Yeni sunucu: ${guild.name} (${guild.id}) — onay bekleniyor.`);
    }
};
