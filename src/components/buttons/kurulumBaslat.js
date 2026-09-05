const { ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');
const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');
const { PRESETLER } = require('../../commands/slash/sistem/kurulum');

module.exports = {
    customId: 'kurulum:baslat',
    async execute(client, interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkisiz`, aciklama: 'Kurulum sihirbazını yalnızca "Sunucuyu Yönet" yetkisine sahip kişiler başlatabilir.' })], flags: 64 });
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId('kurulum:preset-sec')
            .setPlaceholder('Bir sunucu tipi seçin...')
            .addOptions(PRESETLER.map(p => ({ label: p.etiket, value: p.deger, description: p.aciklama })));

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.bot} Sunucu Tipinizi Seçin`, aciklama: 'Aşağıdan sunucunuza en uygun modül yapılandırmasını seçin.' })],
            components: [new ActionRowBuilder().addComponents(menu)],
            flags: 64
        });
    }
};
