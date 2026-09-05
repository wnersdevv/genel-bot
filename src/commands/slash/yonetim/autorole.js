const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Autorole = require('../../../database/models/Autorole');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const TIP_ETIKET = {
    'herkes': 'Herkes',
    'bot': 'Yalnızca botlar',
    'kullanici': 'Yalnızca kullanıcılar',
    'yeni-hesap': 'Yeni hesaplar',
    'eski-hesap': 'Eski hesaplar'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('Yeni üyelere otomatik rol verme sistemini yönetir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(s => s.setName('ekle').setDescription('Yeni bir otorol kuralı ekler.')
            .addRoleOption(o => o.setName('rol').setDescription('Verilecek rol').setRequired(true))
            .addStringOption(o => o.setName('kime').setDescription('Kimlere verilsin?')
                .addChoices(
                    { name: 'Herkes', value: 'herkes' },
                    { name: 'Yalnızca kullanıcılar', value: 'kullanici' },
                    { name: 'Yalnızca botlar', value: 'bot' },
                    { name: 'Yeni hesaplar', value: 'yeni-hesap' },
                    { name: 'Eski hesaplar', value: 'eski-hesap' }
                ))
            .addIntegerOption(o => o.setName('hesap-yaşı').setDescription('Yeni/eski hesap eşiği (gün, varsayılan 7)').setMinValue(1).setMaxValue(365))
            .addIntegerOption(o => o.setName('gecikme').setDescription('Rol kaç saniye sonra verilsin').setMinValue(0).setMaxValue(3600)))
        .addSubcommand(s => s.setName('sil').setDescription('Bir otorol kuralını kaldırır.')
            .addRoleOption(o => o.setName('rol').setDescription('Kaldırılacak rol').setRequired(true)))
        .addSubcommand(s => s.setName('liste').setDescription('Tanımlı otorol kurallarını listeler.'))
        .addSubcommand(s => s.setName('durum').setDescription('Otorol sistemini açar veya kapatır.')
            .addBooleanOption(o => o.setName('aktif').setDescription('Açık mı olsun?').setRequired(true))),
    kategori: 'otoRol',

    async execute(client, interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'ekle': return this.ekle(interaction);
            case 'sil': return this.sil(interaction);
            case 'liste': return this.liste(interaction);
            case 'durum': return this.durum(interaction);
        }
    },

    async ekle(interaction) {
        const rol = interaction.options.getRole('rol');
        const tip = interaction.options.getString('kime') || 'herkes';
        const hesapYasiGun = interaction.options.getInteger('hesap-yaşı') ?? 7;
        const gecikmeSaniye = interaction.options.getInteger('gecikme') ?? 0;

        if (rol.managed || rol.id === interaction.guild.id) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz Rol`, aciklama: 'Bot tarafından yönetilen roller ve @everyone kullanılamaz.' })], flags: 64 });
        }
        if (rol.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Rol Çok Yüksek`, aciklama: 'Bu rol benim en yüksek rolümden üstte, veremem. Botun rolünü yukarı taşıyın.' })], flags: 64 });
        }

        const ayar = await Autorole.findOne({ guildId: interaction.guild.id });
        if (ayar?.kurallar.some(k => k.rolId === rol.id)) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.uyari} Zaten Ekli`, aciklama: `${rol} için bir kural zaten var. Önce silin.` })], flags: 64 });
        }

        await Autorole.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { aktif: true, $push: { kurallar: { rolId: rol.id, tip, hesapYasiGun, gecikmeSaniye } } },
            { upsert: true }
        );

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'basari',
                baslik: `${emojis.basari} Otorol Kuralı Eklendi`,
                aciklama: `${rol} → **${TIP_ETIKET[tip]}**${tip.includes('hesap') ? ` (${hesapYasiGun} gün eşiği)` : ''}${gecikmeSaniye ? `\n${gecikmeSaniye} saniye gecikmeyle verilecek.` : ''}`
            })]
        });
    },

    async sil(interaction) {
        const rol = interaction.options.getRole('rol');
        const sonuc = await Autorole.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { $pull: { kurallar: { rolId: rol.id } } },
            { new: true }
        );

        if (!sonuc) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bulunamadı` })], flags: 64 });
        }

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Kural Silindi`, aciklama: `${rol} artık otomatik verilmeyecek.` })]
        });
    },

    async liste(interaction) {
        const ayar = await Autorole.findOne({ guildId: interaction.guild.id });

        if (!ayar?.kurallar.length) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.rol} Otorol`, aciklama: 'Henüz kural yok. `/autorole ekle` ile ekleyebilirsiniz.' })] });
        }

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.rol} Otorol Kuralları (${ayar.kurallar.length})`,
                aciklama: `**Sistem:** ${ayar.aktif ? '🟢 Açık' : '🔴 Kapalı'}\n\n` +
                    ayar.kurallar.map(k =>
                        `<@&${k.rolId}> — ${TIP_ETIKET[k.tip]}${k.tip.includes('hesap') ? ` (${k.hesapYasiGun}g)` : ''}${k.gecikmeSaniye ? ` · ${k.gecikmeSaniye}sn gecikme` : ''}`
                    ).join('\n')
            })]
        });
    },

    async durum(interaction) {
        const aktif = interaction.options.getBoolean('aktif');
        await Autorole.findOneAndUpdate({ guildId: interaction.guild.id }, { aktif }, { upsert: true });

        await interaction.reply({
            embeds: [temelEmbed({ tip: aktif ? 'basari' : 'uyari', baslik: `${emojis.rol} Otorol ${aktif ? 'Açıldı' : 'Kapatıldı'}` })]
        });
    }
};
