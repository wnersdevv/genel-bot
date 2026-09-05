const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Filtre = require('../../../database/models/Filtre');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filtre-liste')
        .setDescription('Filtre kurallarının mevcut durumunu gösterir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    kategori: 'mesajFiltreleme',

    async execute(client, interaction) {
        const filtre = await Filtre.findOne({ guildId: interaction.guild.id });

        if (!filtre) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.temizle} Mesaj Filtreleme`, aciklama: 'Bu sunucuda henüz herhangi bir filtre kuralı tanımlanmamış.' })] });
        }

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.temizle} Mesaj Filtreleme Durumu`,
                alanlar: [
                    { name: 'Yasaklı Kelimeler', value: filtre.yasakliKelimeler.length ? filtre.yasakliKelimeler.map(k => `\`${k}\``).join(', ') : 'Yok' },
                    { name: 'Regex Kuralları', value: filtre.regexKurallari.length ? `${filtre.regexKurallari.length} kural` : 'Yok' },
                    { name: 'Link Engeli', value: filtre.linkEngelle ? '🟢 Açık' : '🔴 Kapalı', inline: true },
                    { name: 'Davet Engeli', value: filtre.davetEngelle ? '🟢 Açık' : '🔴 Kapalı', inline: true },
                    { name: 'Caps Engeli', value: filtre.capsEngelle ? `🟢 Açık (%${filtre.capsEsikYuzde})` : '🔴 Kapalı', inline: true }
                ]
            })]
        });
    }
};
