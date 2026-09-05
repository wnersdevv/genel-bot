const { SlashCommandBuilder } = require('discord.js');
const Seviye = require('../../../database/models/Seviye');
const { profilKartiOlustur } = require('../../../canvas/profilKarti');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profil')
        .setDescription('Bir kullanıcının profil kartını gösterir.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('Profili görüntülenecek kullanıcı').setRequired(false)),
    kategori: 'bilgi',
    cooldownSn: 5,

    async execute(client, interaction) {
        const hedefUye = interaction.options.getMember('kullanıcı') || interaction.member;
        const seviyeKaydi = await Seviye.findOne({ guildId: interaction.guild.id, kullaniciId: hedefUye.id });

        try {
            const gorsel = await profilKartiOlustur(hedefUye, { seviye: seviyeKaydi?.seviye });
            await interaction.reply({ files: [gorsel] });
        } catch {
            await interaction.reply({
                embeds: [temelEmbed({
                    tip: 'bilgi',
                    baslik: `${emojis.profil} ${hedefUye.user.username}`,
                    alanlar: [
                        { name: 'Katılma', value: hedefUye.joinedAt ? `<t:${Math.floor(hedefUye.joinedAt.getTime() / 1000)}:D>` : 'Bilinmiyor', inline: true },
                        { name: 'Hesap Oluşturma', value: `<t:${Math.floor(hedefUye.user.createdAt.getTime() / 1000)}:D>`, inline: true }
                    ]
                })]
            });
        }
    }
};
