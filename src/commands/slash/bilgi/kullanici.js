const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kullanıcı')
        .setDescription('Bir kullanıcı hakkında detaylı bilgi gösterir.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('Bilgisi görüntülenecek kullanıcı').setRequired(false)),
    kategori: 'bilgi',
    cooldownSn: 3,

    async execute(client, interaction) {
        const hedefUye = interaction.options.getMember('kullanıcı') || interaction.member;
        const hedefKullanici = hedefUye.user;

        const roller = hedefUye.roles.cache
            .filter(r => r.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(r => `<@&${r.id}>`);

        const rolMetni = roller.length > 0 ? (roller.length > 15 ? `${roller.slice(0, 15).join(', ')} ve ${roller.length - 15} tane daha` : roller.join(', ')) : 'Rolü yok';

        const embed = temelEmbed({
            tip: 'bilgi',
            baslik: `${emojis.profil} ${hedefKullanici.tag}`,
            alanlar: [
                { name: 'ID', value: hedefKullanici.id, inline: true },
                { name: 'Bot mu?', value: hedefKullanici.bot ? 'Evet' : 'Hayır', inline: true },
                { name: 'Takma Ad', value: hedefUye.nickname || 'Yok', inline: true },
                { name: 'Hesap Oluşturma', value: `<t:${Math.floor(hedefKullanici.createdAt.getTime() / 1000)}:F>` },
                { name: 'Sunucuya Katılma', value: hedefUye.joinedAt ? `<t:${Math.floor(hedefUye.joinedAt.getTime() / 1000)}:F>` : 'Bilinmiyor' },
                { name: `Roller (${roller.length})`, value: rolMetni }
            ]
        }).setThumbnail(hedefKullanici.displayAvatarURL({ size: 512 }));

        await interaction.reply({ embeds: [embed] });
    }
};
