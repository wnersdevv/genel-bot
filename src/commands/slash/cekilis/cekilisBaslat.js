const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ms = require('ms');
const Cekilis = require('../../../database/models/Cekilis');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');
const { guildYayinla } = require('../../../dashboard/soket');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('çekiliş-başlat')
        .setDescription('Yeni bir çekiliş başlatır.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(o => o.setName('ödül').setDescription('Çekiliş ödülü').setRequired(true))
        .addStringOption(o => o.setName('süre').setDescription('Örn: 1h, 1d, 3d').setRequired(true))
        .addIntegerOption(o => o.setName('kazanan').setDescription('Kazanan sayısı (varsayılan 1)').setMinValue(1).setMaxValue(20).setRequired(false))
        .addRoleOption(o => o.setName('gerekli-rol').setDescription('Katılım için gerekli rol').setRequired(false)),
    kategori: 'çekiliş',

    async execute(client, interaction) {
        const odul = interaction.options.getString('ödül');
        const sureMetni = interaction.options.getString('süre');
        const kazananSayisi = interaction.options.getInteger('kazanan') || 1;
        const gerekliRol = interaction.options.getRole('gerekli-rol');
        const sureMs = ms(sureMetni);

        if (!sureMs || sureMs <= 0) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz Süre`, aciklama: 'Süreyi `1h`, `1d`, `3d` gibi bir formatta girin.' })], flags: 64 });
        }

        const bitisZamani = new Date(Date.now() + sureMs);

        const embed = temelEmbed({
            tip: 'bilgi',
            baslik: `${emojis.cekilis} ÇEKİLİŞ: ${odul}`,
            aciklama: `Katılmak için 🎉 tepkisine tıklayın veya aşağıdaki butonu kullanın!\n\n**Bitiş:** <t:${Math.floor(bitisZamani.getTime() / 1000)}:R>\n**Kazanan Sayısı:** ${kazananSayisi}\n${gerekliRol ? `**Gerekli Rol:** ${gerekliRol}` : ''}\n**Başlatan:** ${interaction.user}`
        });

        const satir = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('cekilis:katil').setLabel('🎉 Katıl (0)').setStyle(ButtonStyle.Success)
        );

        await interaction.reply({ embeds: [embed], components: [satir] });
        const mesaj = await interaction.fetchReply();

        await Cekilis.create({
            guildId: interaction.guild.id,
            kanalId: interaction.channel.id,
            mesajId: mesaj.id,
            odul,
            baslatanId: interaction.user.id,
            kazananSayisi,
            bitisZamani,
            sartlar: { rolId: gerekliRol?.id || null }
        });

        guildYayinla(interaction.guild.id, 'bildirim', {
            tip: 'çekiliş',
            metin: `"${odul}" çekilişi başlatıldı`,
            tarih: new Date()
        });
    }
};
