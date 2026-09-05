const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { brandingGetir, brandingGuncelle } = require('../../../services/brandingService');
const { auditYaz } = require('../../../services/auditService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');
const config = require('../../../utils/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('marka')
        .setDescription('Botun bu sunucudaki görünen adını ve marka ayarlarını yönetir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(s => s.setName('göster').setDescription('Mevcut marka ayarlarını gösterir.'))
        .addSubcommand(s => s.setName('ayarla').setDescription('Marka ayarlarını günceller.')
            .addStringOption(o => o.setName('bot-adı').setDescription('Bu sunucuda görünecek bot adı').setMaxLength(32))
            .addStringOption(o => o.setName('embed-rengi').setDescription('Hex renk, örn: #5865F2'))
            .addStringOption(o => o.setName('alt-bilgi').setDescription('Embed alt bilgisi').setMaxLength(100))
            .addStringOption(o => o.setName('logo-url').setDescription('Logo görsel bağlantısı (https)'))
            .addStringOption(o => o.setName('destek-url').setDescription('Destek sunucusu bağlantısı (https)')))
        .addSubcommand(s => s.setName('sıfırla').setDescription('Marka ayarlarını varsayılana döndürür.')),
    kategori: 'sistem',

    async execute(client, interaction) {
        const altKomut = interaction.options.getSubcommand();
        const marka = await brandingGetir(interaction.guild.id);

        if (altKomut === 'göster') {
            return interaction.reply({
                embeds: [temelEmbed({
                    tip: 'marka',
                    marka,
                    baslik: `${emojis.ayarlar} ${marka.botAdi} — Marka Ayarları`,
                    alanlar: [
                        { name: 'Bot Adı', value: marka.botAdi, inline: true },
                        { name: 'Embed Rengi', value: marka.embedRengi, inline: true },
                        { name: 'Panel Başlığı', value: marka.panelBasligi || 'Varsayılan', inline: true },
                        { name: 'Alt Bilgi', value: marka.altBilgi },
                        { name: 'Logo', value: marka.logoUrl || 'Ayarlanmamış', inline: true },
                        { name: 'Destek', value: marka.destekUrl || 'Ayarlanmamış', inline: true }
                    ],
                    aciklama: 'Bu ayarlar yalnızca bu sunucuda geçerlidir.\n' +
                        '⚠️ Discord, botun **global kullanıcı adının** sunucuya özel değiştirilmesine izin vermez; bu ayarlar embed, panel ve sistem mesajlarında kullanılır.' +
                        (config.dashboardUrl ? `\n\nCanlı önizleme: ${config.dashboardUrl}/sunucu/${interaction.guild.id}/marka` : '')
                })]
            });
        }

        if (altKomut === 'sıfırla') {
            await brandingGuncelle(interaction.guild.id, {
                botAdi: null, embedRengi: '#5865F2', altBilgi: null,
                logoUrl: null, panelBasligi: null, destekUrl: null, siteUrl: null
            });

            auditYaz({
                guildId: interaction.guild.id, kullaniciId: interaction.user.id,
                kullaniciEtiketi: interaction.user.tag, islem: 'Marka ayarları sıfırlandı', kaynak: 'discord'
            });

            return interaction.reply({
                embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Marka Sıfırlandı`, aciklama: 'Varsayılan wnersdev markasına dönüldü.' })]
            });
        }

        const guncelleme = {};
        const botAdi = interaction.options.getString('bot-adı');
        const renk = interaction.options.getString('embed-rengi');
        const altBilgi = interaction.options.getString('alt-bilgi');
        const logo = interaction.options.getString('logo-url');
        const destek = interaction.options.getString('destek-url');

        if (botAdi) guncelleme.botAdi = botAdi.trim();
        if (altBilgi) guncelleme.altBilgi = altBilgi.trim();

        if (renk) {
            if (!/^#[0-9A-Fa-f]{6}$/.test(renk)) {
                return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz Renk`, aciklama: 'Renk `#5865F2` formatında olmalıdır.' })], flags: 64 });
            }
            guncelleme.embedRengi = renk;
        }

        for (const [alan, deger] of [['logoUrl', logo], ['destekUrl', destek]]) {
            if (!deger) continue;
            if (!/^https:\/\//.test(deger)) {
                return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz Bağlantı`, aciklama: 'Bağlantılar `https://` ile başlamalıdır.' })], flags: 64 });
            }
            guncelleme[alan] = deger;
        }

        if (!Object.keys(guncelleme).length) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.uyari} Değişiklik Yok`, aciklama: 'En az bir alan belirtmelisiniz.' })], flags: 64 });
        }

        await brandingGuncelle(interaction.guild.id, guncelleme);
        const yeni = await brandingGetir(interaction.guild.id);

        auditYaz({
            guildId: interaction.guild.id, kullaniciId: interaction.user.id,
            kullaniciEtiketi: interaction.user.tag, islem: 'Marka ayarları güncellendi',
            kaynak: 'discord', hedef: Object.keys(guncelleme).join(', '),
            yeniDeger: Object.values(guncelleme).join(' | ')
        });

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'marka', marka: yeni,
                baslik: `${emojis.basari} Marka Güncellendi`,
                aciklama: `Bu embed yeni marka ayarlarınızla oluşturuldu.\n**${yeni.botAdi}** · ${yeni.embedRengi}`
            })]
        });
    }
};
