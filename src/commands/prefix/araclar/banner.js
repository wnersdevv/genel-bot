const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('Bir kullanıcının profil bannerını gösterir.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('Bannerı görüntülenecek kullanıcı').setRequired(false)),
    kategori: 'bilgi',
    cooldownSn: 5,

    async execute(client, interaction) {
        const hedef = interaction.options.getUser('kullanıcı') || interaction.user;
        const tamKullanici = await client.users.fetch(hedef.id, { force: true });

        if (!tamKullanici.banner) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.profil} Banner Yok`, aciklama: `**${hedef.username}** kullanıcısının ayarlanmış bir bannerı yok.` })],
                flags: 64
            });
        }

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.profil} ${hedef.username} — Banner` })
                .setImage(tamKullanici.bannerURL({ size: 1024 }))]
        });
    }
};
