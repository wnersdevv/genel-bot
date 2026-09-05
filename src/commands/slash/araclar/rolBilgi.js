const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rol')
        .setDescription('Bir rol hakkında bilgi gösterir.')
        .addRoleOption(o => o.setName('rol').setDescription('Bilgisi görüntülenecek rol').setRequired(true)),
    kategori: 'araçlar',

    async execute(client, interaction) {
        const rol = interaction.options.getRole('rol');

        const izinOzetleri = rol.permissions.has('Administrator')
            ? ['Yönetici (tüm yetkiler)']
            : rol.permissions.toArray().slice(0, 10).map(i => i);

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `🎭 @${rol.name}`,
                alanlar: [
                    { name: 'ID', value: rol.id, inline: true },
                    { name: 'Renk', value: rol.hexColor, inline: true },
                    { name: 'Üye Sayısı', value: `${rol.members.size}`, inline: true },
                    { name: 'Pozisyon', value: `${rol.position}`, inline: true },
                    { name: 'Ayrı Gösterilir', value: rol.hoist ? 'Evet' : 'Hayır', inline: true },
                    { name: 'Bahsedilebilir', value: rol.mentionable ? 'Evet' : 'Hayır', inline: true },
                    { name: 'Oluşturulma', value: `<t:${Math.floor(rol.createdAt.getTime() / 1000)}:D>` },
                    { name: 'Önemli Yetkiler', value: izinOzetleri.length ? izinOzetleri.join(', ') : 'Yok' }
                ]
            }).setColor(rol.color || 0x2B2D31)]
        });
    }
};
