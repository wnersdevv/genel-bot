const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { korumaAyariGetir, lockdownUygula } = require('../../../services/korumaService');
const { onayTokenOlustur } = require('../../../services/onayService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lockdown')
        .setDescription('Sunucudaki tüm metin kanallarını topluca kilitler veya açar.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(s => s.setName('başlat').setDescription('Tüm kanalları kilitler.')
            .addStringOption(o => o.setName('sebep').setDescription('Lockdown sebebi')))
        .addSubcommand(s => s.setName('kaldır').setDescription('Lockdown\'ı kaldırır, kanalları açar.'))
        .addSubcommand(s => s.setName('durum').setDescription('Lockdown durumunu gösterir.')),
    kategori: 'koruma',
    cooldownSn: 10,

    async execute(client, interaction) {
        const altKomut = interaction.options.getSubcommand();
        const ayar = await korumaAyariGetir(interaction.guild.id);

        if (altKomut === 'durum') {
            return interaction.reply({
                embeds: [temelEmbed({
                    tip: ayar.lockdown.aktif ? 'uyari' : 'bilgi',
                    baslik: `${ayar.lockdown.aktif ? emojis.kilit : emojis.kilitAcik} Lockdown Durumu`,
                    aciklama: ayar.lockdown.aktif
                        ? `🔒 **Aktif**\nBaşlatan: <@${ayar.lockdown.baslatanId}>\nBaşlangıç: <t:${Math.floor(new Date(ayar.lockdown.baslangic).getTime() / 1000)}:R>\nKilitli kanal: ${ayar.lockdown.kilitliKanallar.length}`
                        : '🔓 Lockdown aktif değil.'
                })]
            });
        }

        if (altKomut === 'kaldır') {
            if (!ayar.lockdown.aktif) {
                return interaction.reply({ embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.uyari} Lockdown Aktif Değil` })], flags: 64 });
            }

            await interaction.deferReply();
            const sayi = await lockdownUygula(interaction.guild, false);

            return interaction.editReply({
                embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.kilitAcik} Lockdown Kaldırıldı`, aciklama: `**${sayi}** kanal yeniden açıldı.` })]
            });
        }

        if (ayar.lockdown.aktif) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.uyari} Lockdown Zaten Aktif` })], flags: 64 });
        }

        const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
        const token = onayTokenOlustur('lockdown', { guildId: interaction.guild.id, sebep, yetkiliId: interaction.user.id });

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'uyari',
                baslik: `${emojis.kilit} Lockdown Onayı`,
                aciklama: `Sunucudaki **tüm metin kanalları** @everyone için kilitlenecek.\n**Sebep:** ${sebep}\n\nBu işlem \`/lockdown kaldır\` ile geri alınabilir.`
            })],
            components: [new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`onay:devam:${token}`).setLabel('🔒 KİLİTLE').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId(`onay:iptal:${token}`).setLabel('❌ İPTAL').setStyle(ButtonStyle.Secondary)
            )],
            flags: 64
        });
    }
};
