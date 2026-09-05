const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Warn = require('../../../database/models/Warn');
const { guildAyariGetir, guildAyariGuncelle } = require('../../../services/guildService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const CEZA_ETIKET = { sustur: 'Sustur', kick: 'Sunucudan at', ban: 'Yasakla' };

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uyarı')
        .setDescription('Uyarıları ve otomatik ceza zincirini yönetir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand(s => s.setName('liste').setDescription('Bir kullanıcının uyarılarını listeler.')
            .addUserOption(o => o.setName('kullanıcı').setDescription('Kullanıcı').setRequired(true)))
        .addSubcommand(s => s.setName('sil').setDescription('Belirli bir uyarıyı case numarasıyla siler.')
            .addIntegerOption(o => o.setName('case').setDescription('Case numarası').setRequired(true)))
        .addSubcommand(s => s.setName('temizle').setDescription('Bir kullanıcının tüm uyarılarını siler.')
            .addUserOption(o => o.setName('kullanıcı').setDescription('Kullanıcı').setRequired(true)))
        .addSubcommand(s => s.setName('zincir-ekle').setDescription('Belirli uyarı sayısında otomatik ceza tanımlar.')
            .addIntegerOption(o => o.setName('uyarı-sayısı').setDescription('Kaçıncı uyarıda tetiklensin').setRequired(true).setMinValue(1).setMaxValue(50))
            .addStringOption(o => o.setName('ceza').setDescription('Uygulanacak ceza').setRequired(true)
                .addChoices({ name: 'Sustur', value: 'sustur' }, { name: 'Sunucudan at', value: 'kick' }, { name: 'Yasakla', value: 'ban' }))
            .addIntegerOption(o => o.setName('süre-dakika').setDescription('Susturma süresi (dakika)').setMinValue(1).setMaxValue(40320)))
        .addSubcommand(s => s.setName('zincir-sil').setDescription('Bir ceza zinciri kuralını kaldırır.')
            .addIntegerOption(o => o.setName('uyarı-sayısı').setDescription('Kaldırılacak kuralın uyarı sayısı').setRequired(true)))
        .addSubcommand(s => s.setName('zincir').setDescription('Ceza zinciri kurallarını gösterir ve açıp kapatır.')
            .addBooleanOption(o => o.setName('aktif').setDescription('Zinciri aç/kapat'))),
    kategori: 'moderasyon',

    async execute(client, interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'liste': return this.liste(interaction);
            case 'sil': return this.sil(interaction);
            case 'temizle': return this.temizle(interaction);
            case 'zincir-ekle': return this.zincirEkle(interaction);
            case 'zincir-sil': return this.zincirSil(interaction);
            case 'zincir': return this.zincir(interaction);
        }
    },

    async liste(interaction) {
        const hedef = interaction.options.getUser('kullanıcı');
        const uyarilar = await Warn.find({ guildId: interaction.guild.id, kullaniciId: hedef.id }).sort({ createdAt: -1 }).limit(15);

        if (!uyarilar.length) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.uyariİkon} Uyarı Yok`, aciklama: `**${hedef.tag}** kullanıcısının hiç uyarısı yok.` })] });
        }

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'uyari',
                baslik: `${emojis.uyariİkon} ${hedef.tag} — ${uyarilar.length} Uyarı`,
                aciklama: uyarilar.map(u =>
                    `**#${u.caseNo}** — <@${u.yetkiliId}>\n${u.sebep}\n<t:${Math.floor(new Date(u.createdAt).getTime() / 1000)}:R>`
                ).join('\n\n')
            })]
        });
    },

    async sil(interaction) {
        const caseNo = interaction.options.getInteger('case');
        const silinen = await Warn.findOneAndDelete({ guildId: interaction.guild.id, caseNo });

        if (!silinen) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bulunamadı`, aciklama: `#${caseNo} numaralı uyarı bulunamadı.` })], flags: 64 });
        }

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Uyarı Silindi`, aciklama: `**#${caseNo}** numaralı uyarı silindi.` })]
        });
    },

    async temizle(interaction) {
        const hedef = interaction.options.getUser('kullanıcı');
        const sonuc = await Warn.deleteMany({ guildId: interaction.guild.id, kullaniciId: hedef.id });

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Uyarılar Temizlendi`, aciklama: `**${hedef.tag}** kullanıcısının **${sonuc.deletedCount}** uyarısı silindi.` })]
        });
    },

    async zincirEkle(interaction) {
        const uyariSayisi = interaction.options.getInteger('uyarı-sayısı');
        const ceza = interaction.options.getString('ceza');
        const sureDk = interaction.options.getInteger('süre-dakika') ?? 60;

        const ayar = await guildAyariGetir(interaction.guild.id);
        const kurallar = (ayar.cezaZinciri?.kurallar || []).filter(k => k.uyariSayisi !== uyariSayisi);
        kurallar.push({ uyariSayisi, ceza, sureDk });
        kurallar.sort((a, b) => a.uyariSayisi - b.uyariSayisi);

        await guildAyariGuncelle(interaction.guild.id, { 'cezaZinciri.kurallar': kurallar, 'cezaZinciri.aktif': true });

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'basari',
                baslik: `${emojis.moderasyon} Ceza Zinciri Kuralı Eklendi`,
                aciklama: `**${uyariSayisi}.** uyarıda → **${CEZA_ETIKET[ceza]}**${ceza === 'sustur' ? ` (${sureDk} dakika)` : ''}`
            })]
        });
    },

    async zincirSil(interaction) {
        const uyariSayisi = interaction.options.getInteger('uyarı-sayısı');
        const ayar = await guildAyariGetir(interaction.guild.id);
        const kurallar = (ayar.cezaZinciri?.kurallar || []).filter(k => k.uyariSayisi !== uyariSayisi);

        await guildAyariGuncelle(interaction.guild.id, { 'cezaZinciri.kurallar': kurallar });

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Kural Kaldırıldı`, aciklama: `${uyariSayisi}. uyarı kuralı silindi.` })]
        });
    },

    async zincir(interaction) {
        const aktif = interaction.options.getBoolean('aktif');
        if (aktif !== null) await guildAyariGuncelle(interaction.guild.id, { 'cezaZinciri.aktif': aktif });

        const ayar = await guildAyariGetir(interaction.guild.id);
        const kurallar = ayar.cezaZinciri?.kurallar || [];

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.moderasyon} Otomatik Ceza Zinciri`,
                aciklama: `**Durum:** ${ayar.cezaZinciri?.aktif ? '🟢 Açık' : '🔴 Kapalı'}\n\n` +
                    (kurallar.length
                        ? kurallar.map(k => `**${k.uyariSayisi}.** uyarı → ${CEZA_ETIKET[k.ceza]}${k.ceza === 'sustur' ? ` (${k.sureDk} dk)` : ''}`).join('\n')
                        : 'Henüz kural yok. `/uyarı zincir-ekle` ile ekleyin.')
            })]
        });
    }
};
