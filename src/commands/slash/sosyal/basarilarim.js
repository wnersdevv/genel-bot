const { SlashCommandBuilder } = require('discord.js');
const Basari = require('../../../database/models/Basari');
const { BASARI_TANIMLARI } = require('../../../services/basariService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('başarılarım')
        .setDescription('Kazandığınız başarı rozetlerini gösterir.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('Başarıları görüntülenecek kullanıcı').setRequired(false)),
    kategori: 'sosyal',

    async execute(client, interaction) {
        const hedef = interaction.options.getUser('kullanıcı') || interaction.user;
        const kayit = await Basari.findOne({ guildId: interaction.guild.id, kullaniciId: hedef.id });
        const kazanilanlar = kayit?.kazanilanBasarilar || [];
        const tumAnahtarlar = Object.keys(BASARI_TANIMLARI);

        const satirlar = tumAnahtarlar.map(anahtar => {
            const tanim = BASARI_TANIMLARI[anahtar];
            const kazanildiMi = kazanilanlar.includes(anahtar);
            return `${kazanildiMi ? '✅' : '🔒'} ${tanim.isim} — ${tanim.aciklama}`;
        });

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.rozet} ${hedef.username} — Başarılar (${kazanilanlar.length}/${tumAnahtarlar.length})`,
                aciklama: satirlar.join('\n')
            })]
        });
    }
};
