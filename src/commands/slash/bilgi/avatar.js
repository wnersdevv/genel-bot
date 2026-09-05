const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Bir kullanıcının profil fotoğrafını gösterir.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('Avatarı görüntülenecek kullanıcı').setRequired(false)),
    aliaslar: ['av', 'pp'],
    kategori: 'bilgi',
    cooldownSn: 3,

    async execute(client, interaction) {
        const hedef = interaction.options.getUser('kullanıcı') || interaction.user;

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.profil} ${hedef.username} — Avatar` })
                .setImage(hedef.displayAvatarURL({ size: 1024 }))]
        });
    }
};
