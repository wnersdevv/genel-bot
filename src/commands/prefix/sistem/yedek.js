const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Yedek = require('../../../database/models/Yedek');
const { onayTokenOlustur } = require('../../../services/onayService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yedek')
        .setDescription('Sunucu yedeklerini yönetir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(s => s.setName('oluştur').setDescription('Rol, kanal ve emoji yapısının yedeğini alır.')
            .addStringOption(o => o.setName('isim').setDescription('Yedek ismi').setRequired(true).setMaxLength(50)))
        .addSubcommand(s => s.setName('liste').setDescription('Kayıtlı yedekleri listeler.'))
        .addSubcommand(s => s.setName('göster').setDescription('Bir yedeğin içeriğini gösterir.')
            .addStringOption(o => o.setName('yedek-id').setDescription('Yedek ID').setRequired(true)))
        .addSubcommand(s => s.setName('sil').setDescription('Bir yedeği siler.')
            .addStringOption(o => o.setName('yedek-id').setDescription('Yedek ID').setRequired(true)))
        .addSubcommand(s => s.setName('geri-yükle').setDescription('Yedekteki eksik rol ve kanalları geri yükler.')
            .addStringOption(o => o.setName('yedek-id').setDescription('Yedek ID').setRequired(true))),
    kategori: 'sistem',
    cooldownSn: 15,

    async execute(client, interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'oluştur': return this.olustur(interaction);
            case 'liste': return this.liste(interaction);
            case 'göster': return this.goster(interaction);
            case 'sil': return this.sil(interaction);
            case 'geri-yükle': return this.geriYukle(interaction);
        }
    },

    async olustur(interaction) {
        const isim = interaction.options.getString('isim');
        const guild = interaction.guild;
        await interaction.deferReply({ flags: 64 });

        const roller = guild.roles.cache.filter(r => r.id !== guild.id).map(r => ({
            isim: r.name, renk: r.hexColor, izinler: r.permissions.bitfield.toString(),
            pozisyon: r.position, hoisted: r.hoist, mentionable: r.mentionable
        }));

        const kanallar = guild.channels.cache.map(k => ({
            isim: k.name, tip: k.type, pozisyon: k.position,
            parentIsim: k.parent?.name || null, konu: k.topic || null
        }));

        const emojiler = guild.emojis.cache.map(e => ({ isim: e.name, url: e.imageURL() }));

        const yedek = await Yedek.create({
            guildId: guild.id, isim, olusturanId: interaction.user.id,
            veri: { sunucuIsmi: guild.name, roller, kanallar, emojiler }
        });

        await interaction.editReply({
            embeds: [temelEmbed({
                tip: 'basari', baslik: `${emojis.yedek} Yedek Oluşturuldu`,
                aciklama: `**${isim}** yedeği kaydedildi.`,
                alanlar: [
                    { name: 'Roller', value: `${roller.length}`, inline: true },
                    { name: 'Kanallar', value: `${kanallar.length}`, inline: true },
                    { name: 'Emojiler', value: `${emojiler.length}`, inline: true },
                    { name: 'Yedek ID', value: `\`${yedek._id}\`` }
                ]
            })]
        });
    },

    async liste(interaction) {
        const yedekler = await Yedek.find({ guildId: interaction.guild.id }).sort({ createdAt: -1 }).limit(15);

        if (yedekler.length === 0) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.yedek} Yedekler`, aciklama: 'Henüz bir yedek alınmamış.' })], flags: 64 });
        }

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi', baslik: `${emojis.yedek} Kayıtlı Yedekler`,
                aciklama: yedekler.map(y => `**${y.isim}** — \`${y._id}\`\n<@${y.olusturanId}> · <t:${Math.floor(new Date(y.createdAt).getTime() / 1000)}:R>`).join('\n\n')
            })],
            flags: 64
        });
    },

    async goster(interaction) {
        const yedek = await Yedek.findOne({ _id: interaction.options.getString('yedek-id'), guildId: interaction.guild.id }).catch(() => null);
        if (!yedek) return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bulunamadı` })], flags: 64 });

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi', baslik: `${emojis.yedek} ${yedek.isim}`,
                alanlar: [
                    { name: 'Roller', value: yedek.veri.roller.slice(0, 15).map(r => r.isim).join(', ') || 'Yok' },
                    { name: 'Kanallar', value: yedek.veri.kanallar.slice(0, 15).map(k => k.isim).join(', ') || 'Yok' },
                    { name: 'Emojiler', value: `${yedek.veri.emojiler.length} emoji` },
                    { name: 'Oluşturulma', value: `<t:${Math.floor(new Date(yedek.createdAt).getTime() / 1000)}:F>` }
                ]
            })],
            flags: 64
        });
    },

    async sil(interaction) {
        const silinen = await Yedek.findOneAndDelete({ _id: interaction.options.getString('yedek-id'), guildId: interaction.guild.id }).catch(() => null);
        if (!silinen) return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bulunamadı` })], flags: 64 });

        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Yedek Silindi`, aciklama: `**${silinen.isim}** silindi.` })], flags: 64 });
    },

    async geriYukle(interaction) {
        const yedekId = interaction.options.getString('yedek-id');
        const yedek = await Yedek.findOne({ _id: yedekId, guildId: interaction.guild.id }).catch(() => null);
        if (!yedek) return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bulunamadı` })], flags: 64 });

        const token = onayTokenOlustur('geri-yukle', { guildId: interaction.guild.id, yedekId, yetkiliId: interaction.user.id });

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'uyari', baslik: `${emojis.uyari} Geri Yükleme Onayı`,
                aciklama: `**${yedek.isim}** yedeğindeki eksik roller ve kanallar eklenecek. Mevcut aynı isimliler atlanır, hiçbir şey silinmez.`
            })],
            components: [new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`onay:devam:${token}`).setLabel('✅ DEVAM ET').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId(`onay:iptal:${token}`).setLabel('❌ İPTAL').setStyle(ButtonStyle.Secondary)
            )],
            flags: 64
        });
    }
};
