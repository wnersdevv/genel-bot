const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const { planLimitleriGetir } = require('../../../services/abonelikService');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('temizle')
        .setDescription('Kanaldan belirtilen sayıda mesaj siler.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(o => o.setName('adet').setDescription('Silinecek mesaj sayısı').setRequired(true).setMinValue(1).setMaxValue(500))
        .addUserOption(o => o.setName('kullanıcı').setDescription('Sadece bu kullanıcının mesajlarını sil').setRequired(false)),
    aliaslar: ['sil', 'clear'],
    kategori: 'moderasyon',
    cooldownSn: 5,

    async execute(client, interaction) {
        const adetIstenen = interaction.options.getInteger('adet');
        const hedefKullanici = interaction.options.getUser('kullanıcı');
        const limitler = await planLimitleriGetir(interaction.guild.id);

        if (adetIstenen > limitler.temizleMax) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.yildiz} Plan Limiti`, aciklama: `Mevcut planınızda tek seferde en fazla **${limitler.temizleMax}** mesaj silebilirsiniz. Daha yüksek limit için \`/abonelik\` komutuna bakın.` })],
                flags: 64
            });
        }

        const adet = Math.min(adetIstenen, 100); // Discord bulkDelete API limiti tek seferde 100

        await interaction.deferReply({ flags: 64 });

        const mesajlar = await interaction.channel.messages.fetch({ limit: 100 });
        const filtrelenmis = hedefKullanici
            ? mesajlar.filter(m => m.author.id === hedefKullanici.id).first(adet)
            : mesajlar.first(adet);

        const silinen = await interaction.channel.bulkDelete(filtrelenmis, true).catch(() => null);

        if (!silinen) {
            return interaction.editReply({
                embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Silinemedi`, aciklama: '14 günden eski mesajlar toplu olarak silinemez.' })]
            });
        }

        await interaction.editReply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.temizle} Mesajlar Silindi`, aciklama: `**${silinen.size}** mesaj başarıyla silindi.` })]
        });
    }
};
