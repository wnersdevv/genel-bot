const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { guildAyariGuncelle, guildAyariGetir } = require('../../../services/guildService');
const { kullanilabilirDiller, t } = require('../../../services/i18nService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const DIL_ETIKETLERI = { tr: '🇹🇷 Türkçe', en: '🇬🇧 English' };

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dil')
        .setDescription('Botun bu sunucudaki dilini yönetir. / Manage the bot language for this server.')
        .addSubcommand(s => s.setName('göster').setDescription('Mevcut dili gösterir. / Shows the current language.'))
        .addSubcommand(s => s.setName('ayarla').setDescription('Sunucunun dilini değiştirir. / Changes the server language.')
            .addStringOption(o => o.setName('dil').setDescription('Seçilecek dil / Language to set').setRequired(true)
                .addChoices({ name: '🇹🇷 Türkçe', value: 'tr' }, { name: '🇬🇧 English', value: 'en' }))),
    aliaslar: ['language', 'lang'],
    kategori: 'sistem',

    async execute(client, interaction) {
        const altKomut = interaction.options.getSubcommand();
        const ayar = await guildAyariGetir(interaction.guild.id);
        const mevcutDil = ayar.dil || 'tr';

        if (altKomut === 'göster') {
            const diller = kullanilabilirDiller();
            return interaction.reply({
                embeds: [temelEmbed({
                    tip: 'bilgi',
                    baslik: '🌍 Dil / Language',
                    alanlar: [
                        { name: 'Mevcut / Current', value: DIL_ETIKETLERI[mevcutDil] || mevcutDil, inline: true },
                        { name: 'Kullanılabilir / Available', value: diller.map(d => DIL_ETIKETLERI[d] || d).join('\n'), inline: true }
                    ],
                    aciklama: 'Değiştirmek için `/dil ayarla` kullanın.\nUse `/dil ayarla` to change it.'
                })]
            });
        }

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} ${t(mevcutDil, 'genel.yetkiYok')}` })],
                flags: 64
            });
        }

        const yeniDil = interaction.options.getString('dil');
        await guildAyariGuncelle(interaction.guild.id, { dil: yeniDil });

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'basari',
                baslik: `${emojis.basari} ${yeniDil === 'tr' ? 'Dil Değiştirildi' : 'Language Changed'}`,
                aciklama: yeniDil === 'tr'
                    ? `Bot bu sunucuda artık **Türkçe** kullanacak.`
                    : `The bot will now use **English** on this server.`
            })]
        });
    }
};
