const {
    SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder,
    ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder
} = require('discord.js');
const RolPaneli = require('../../../database/models/RolPaneli');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

function renkKodu(hex) {
    const n = parseInt(String(hex).replace('#', ''), 16);
    return Number.isNaN(n) ? 0x5865F2 : n;
}

/** Panel mesajının embed ve bileşenlerini üretir. */
function panelBilesenleri(panel) {
    const embed = new EmbedBuilder()
        .setColor(renkKodu(panel.renk))
        .setTitle(panel.baslik)
        .setDescription(
            (panel.aciklama ? `${panel.aciklama}\n\n` : '') +
            panel.secenekler.map(s => `${s.emoji ? s.emoji + ' ' : ''}<@&${s.rolId}>`).join('\n')
        );

    const satirlar = [];

    if (panel.tip === 'menu') {
        satirlar.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('rolpanel:menu')
                .setPlaceholder('Rollerini seç...')
                .setMinValues(0)
                .setMaxValues(panel.tekliSecim ? 1 : (panel.maksimumRol || panel.secenekler.length))
                .addOptions(panel.secenekler.map(s => ({
                    label: s.etiket,
                    value: s.rolId,
                    description: s.aciklama || undefined,
                    emoji: s.emoji || undefined
                })))
        ));
    } else {
        for (let i = 0; i < panel.secenekler.length; i += 5) {
            satirlar.push(new ActionRowBuilder().addComponents(
                panel.secenekler.slice(i, i + 5).map(s =>
                    new ButtonBuilder()
                        .setCustomId(`rolpanel:buton:${s.rolId}`)
                        .setLabel(s.etiket)
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(s.emoji || undefined)
                )
            ));
        }
    }

    return { embeds: [embed], components: satirlar };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolpanel')
        .setDescription('Kullanıcıların kendine rol alabileceği panel oluşturur.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(s => s.setName('oluştur').setDescription('Yeni bir rol paneli oluşturur.')
            .addStringOption(o => o.setName('başlık').setDescription('Panel başlığı').setRequired(true))
            .addRoleOption(o => o.setName('rol-1').setDescription('1. rol').setRequired(true))
            .addStringOption(o => o.setName('tip').setDescription('Panel tipi')
                .addChoices({ name: 'Buton', value: 'buton' }, { name: 'Select Menü', value: 'menu' }))
            .addStringOption(o => o.setName('açıklama').setDescription('Panel açıklaması'))
            .addBooleanOption(o => o.setName('tekli-seçim').setDescription('Yalnızca bir rol seçilebilsin mi?'))
            .addRoleOption(o => o.setName('rol-2').setDescription('2. rol'))
            .addRoleOption(o => o.setName('rol-3').setDescription('3. rol'))
            .addRoleOption(o => o.setName('rol-4').setDescription('4. rol'))
            .addRoleOption(o => o.setName('rol-5').setDescription('5. rol')))
        .addSubcommand(s => s.setName('sil').setDescription('Bir rol panelini siler.')
            .addStringOption(o => o.setName('mesaj-id').setDescription('Panel mesajının ID\'si').setRequired(true)))
        .addSubcommand(s => s.setName('liste').setDescription('Sunucudaki rol panellerini listeler.')),
    kategori: 'rolMenü',

    async execute(client, interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'oluştur': return this.olustur(interaction);
            case 'sil': return this.sil(interaction);
            case 'liste': return this.liste(interaction);
        }
    },

    async olustur(interaction) {
        const roller = [1, 2, 3, 4, 5].map(i => interaction.options.getRole(`rol-${i}`)).filter(Boolean);
        const botEnYuksek = interaction.guild.members.me.roles.highest.position;

        const gecersiz = roller.find(r => r.managed || r.id === interaction.guild.id || r.position >= botEnYuksek);
        if (gecersiz) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz Rol`, aciklama: `**${gecersiz.name}** kullanılamaz: bot tarafından yönetiliyor, @everyone ya da benim rolümden üstte.` })],
                flags: 64
            });
        }

        const panelVerisi = {
            guildId: interaction.guild.id,
            kanalId: interaction.channel.id,
            tip: interaction.options.getString('tip') || 'buton',
            baslik: interaction.options.getString('başlık'),
            aciklama: interaction.options.getString('açıklama'),
            tekliSecim: interaction.options.getBoolean('tekli-seçim') || false,
            secenekler: roller.map(r => ({ rolId: r.id, etiket: r.name, emoji: null, aciklama: null })),
            olusturanId: interaction.user.id
        };

        const mesaj = await interaction.channel.send(panelBilesenleri(panelVerisi));
        await RolPaneli.create({ ...panelVerisi, mesajId: mesaj.id });

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Rol Paneli Oluşturuldu`, aciklama: `Mesaj ID: \`${mesaj.id}\`` })],
            flags: 64
        });
    },

    async sil(interaction) {
        const mesajId = interaction.options.getString('mesaj-id');
        const panel = await RolPaneli.findOneAndDelete({ guildId: interaction.guild.id, mesajId });

        if (!panel) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bulunamadı` })], flags: 64 });
        }

        const kanal = interaction.guild.channels.cache.get(panel.kanalId);
        await kanal?.messages.fetch(mesajId).then(m => m.delete()).catch(() => {});

        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Panel Silindi` })], flags: 64 });
    },

    async liste(interaction) {
        const paneller = await RolPaneli.find({ guildId: interaction.guild.id }).limit(20);

        if (!paneller.length) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.rol} Rol Panelleri`, aciklama: 'Henüz panel yok.' })] });
        }

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.rol} Rol Panelleri (${paneller.length})`,
                aciklama: paneller.map(p => `**${p.baslik}** — <#${p.kanalId}> · \`${p.mesajId}\` · ${p.tip} · ${p.secenekler.length} rol`).join('\n')
            })]
        });
    },

    panelBilesenleri
};
