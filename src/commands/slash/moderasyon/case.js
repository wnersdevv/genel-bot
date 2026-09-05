const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ModerasyonKaydi = require('../../../database/models/ModerasyonKaydi');
const ModNotu = require('../../../database/models/ModNotu');
const { caseKaydet } = require('../../../services/caseService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');
const TIP_ETIKETLERI = require('../../../utils/caseTipEtiketleri');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('case')
        .setDescription('Moderasyon kayıtlarını ve notları yönetir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand(s => s.setName('göster').setDescription('Belirli bir case numarasının detayını gösterir.')
            .addIntegerOption(o => o.setName('numara').setDescription('Case numarası').setRequired(true)))
        .addSubcommand(s => s.setName('kullanıcı').setDescription('Bir kullanıcının tüm moderasyon geçmişini gösterir.')
            .addUserOption(o => o.setName('kullanıcı').setDescription('Kullanıcı').setRequired(true)))
        .addSubcommand(s => s.setName('liste').setDescription('Sunucudaki son moderasyon işlemlerini listeler.')
            .addStringOption(o => o.setName('tür').setDescription('Türe göre filtrele')
                .addChoices(
                    { name: 'Uyarı', value: 'uyarı' }, { name: 'Susturma', value: 'susturma' },
                    { name: 'Atma', value: 'atma' }, { name: 'Yasaklama', value: 'yasaklama' }, { name: 'Softban', value: 'softban' }
                )))
        .addSubcommand(s => s.setName('ara').setDescription('Sebep metnine göre case arar.')
            .addStringOption(o => o.setName('kelime').setDescription('Aranacak kelime').setRequired(true)))
        .addSubcommand(s => s.setName('not-ekle').setDescription('Bir kullanıcı hakkında yetkililere özel not ekler.')
            .addUserOption(o => o.setName('kullanıcı').setDescription('Kullanıcı').setRequired(true))
            .addStringOption(o => o.setName('içerik').setDescription('Not içeriği').setRequired(true).setMaxLength(500)))
        .addSubcommand(s => s.setName('notlar').setDescription('Bir kullanıcı hakkındaki notları gösterir.')
            .addUserOption(o => o.setName('kullanıcı').setDescription('Kullanıcı').setRequired(true))),
    kategori: 'moderasyon',

    async execute(client, interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'göster': return this.goster(interaction);
            case 'kullanıcı': return this.kullanici(interaction);
            case 'liste': return this.liste(interaction);
            case 'ara': return this.ara(interaction);
            case 'not-ekle': return this.notEkle(interaction);
            case 'notlar': return this.notlar(interaction);
        }
    },

    async goster(interaction) {
        const caseNo = interaction.options.getInteger('numara');
        const kayit = await ModerasyonKaydi.findOne({ guildId: interaction.guild.id, caseNo });

        if (!kayit) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bulunamadı`, aciklama: `#${caseNo} numaralı case bulunamadı.` })], flags: 64 });
        }

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `📋 Case #${kayit.caseNo} — ${TIP_ETIKETLERI[kayit.tip] || kayit.tip}`,
                alanlar: [
                    { name: 'Kullanıcı', value: `<@${kayit.kullaniciId}>`, inline: true },
                    { name: 'Yetkili', value: `<@${kayit.yetkiliId}>`, inline: true },
                    { name: 'Tarih', value: `<t:${Math.floor(new Date(kayit.createdAt).getTime() / 1000)}:F>`, inline: true },
                    { name: 'Sebep', value: kayit.sebep },
                    ...(kayit.ekBilgi ? [{ name: 'Ek Bilgi', value: kayit.ekBilgi }] : [])
                ]
            })]
        });
    },

    async kullanici(interaction) {
        const hedef = interaction.options.getUser('kullanıcı');
        const kayitlar = await ModerasyonKaydi.find({ guildId: interaction.guild.id, kullaniciId: hedef.id }).sort({ caseNo: -1 }).limit(20);

        if (!kayitlar.length) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `📋 ${hedef.tag}`, aciklama: 'Bu kullanıcının hiç kaydı yok.' })] });
        }

        const sayim = kayitlar.reduce((acc, k) => { acc[k.tip] = (acc[k.tip] || 0) + 1; return acc; }, {});

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'uyari',
                baslik: `📋 ${hedef.tag} — Moderasyon Geçmişi (${kayitlar.length})`,
                aciklama: `**Özet:** ${Object.entries(sayim).map(([t, s]) => `${TIP_ETIKETLERI[t] || t}: ${s}`).join(' · ')}\n\n` +
                    kayitlar.slice(0, 10).map(k =>
                        `**#${k.caseNo}** ${TIP_ETIKETLERI[k.tip] || k.tip} — <@${k.yetkiliId}>\n${k.sebep} • <t:${Math.floor(new Date(k.createdAt).getTime() / 1000)}:R>`
                    ).join('\n\n')
            })]
        });
    },

    async liste(interaction) {
        const tur = interaction.options.getString('tür');
        const kayitlar = await ModerasyonKaydi.find({
            guildId: interaction.guild.id, ...(tur ? { tip: tur } : {})
        }).sort({ caseNo: -1 }).limit(15);

        if (!kayitlar.length) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: '📋 Case Listesi', aciklama: 'Kayıt bulunamadı.' })] });
        }

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `📋 Son ${kayitlar.length} Case`,
                aciklama: kayitlar.map(k => `**#${k.caseNo}** ${TIP_ETIKETLERI[k.tip] || k.tip} — <@${k.kullaniciId}> — ${k.sebep.slice(0, 40)}`).join('\n')
            })]
        });
    },

    async ara(interaction) {
        const kelime = interaction.options.getString('kelime');
        const kayitlar = await ModerasyonKaydi.find({
            guildId: interaction.guild.id,
            sebep: { $regex: kelime.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
        }).sort({ caseNo: -1 }).limit(15);

        if (!kayitlar.length) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: '🔎 Case Araması', aciklama: `**"${kelime}"** ile eşleşen case bulunamadı.` })] });
        }

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `🔎 "${kelime}" — ${kayitlar.length} Sonuç`,
                aciklama: kayitlar.map(k => `**#${k.caseNo}** ${TIP_ETIKETLERI[k.tip] || k.tip} — <@${k.kullaniciId}> — ${k.sebep}`).join('\n')
            })]
        });
    },

    async notEkle(interaction) {
        const hedef = interaction.options.getUser('kullanıcı');
        const icerik = interaction.options.getString('içerik');

        await ModNotu.create({ guildId: interaction.guild.id, kullaniciId: hedef.id, yetkiliId: interaction.user.id, icerik });
        const caseNo = await caseKaydet(interaction.guild.id, 'not', hedef.id, interaction.user.id, icerik);

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Not Eklendi`, aciklama: `**${hedef.tag}** için not kaydedildi. (Case #${caseNo})` })],
            flags: 64
        });
    },

    async notlar(interaction) {
        const hedef = interaction.options.getUser('kullanıcı');
        const notlar = await ModNotu.find({ guildId: interaction.guild.id, kullaniciId: hedef.id }).sort({ createdAt: -1 }).limit(15);

        if (!notlar.length) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `📝 ${hedef.tag}`, aciklama: 'Bu kullanıcı hakkında not yok.' })], flags: 64 });
        }

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `📝 ${hedef.tag} — Notlar (${notlar.length})`,
                aciklama: notlar.map(n => `<@${n.yetkiliId}>: ${n.icerik}\n<t:${Math.floor(new Date(n.createdAt).getTime() / 1000)}:R>`).join('\n\n')
            })],
            flags: 64
        });
    }
};
