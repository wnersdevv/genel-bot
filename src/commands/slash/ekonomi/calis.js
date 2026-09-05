const { SlashCommandBuilder } = require('discord.js');
const { ekonomiKaydiGetir } = require('../../../services/ekonomiService');
const { guildAyariGetir } = require('../../../services/guildService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const COOLDOWN_MS = 60 * 60 * 1000; // 1 saat

const MESLEKLER = [
    'bir kafede garsonluk yaptınız',
    'yazılım hatası çözdünüz',
    'bir kamyon yük taşıdınız',
    'sokak müzisyenliği yaptınız',
    'bir markette kasiyerlik yaptınız',
    'freelance tasarım işi aldınız'
];

module.exports = {
    data: new SlashCommandBuilder().setName('çalış').setDescription('Çalışarak para kazanırsınız.'),
    kategori: 'ekonomi',

    async execute(client, interaction) {
        const kayit = await ekonomiKaydiGetir(interaction.guild.id, interaction.user.id);
        const guildAyari = await guildAyariGetir(interaction.guild.id);
        const paraBirimi = guildAyari.ekonomiAyar?.paraBirimi || emojis.para;

        if (kayit.sonCalisma && Date.now() - new Date(kayit.sonCalisma).getTime() < COOLDOWN_MS) {
            const kalanDk = Math.ceil((COOLDOWN_MS - (Date.now() - new Date(kayit.sonCalisma).getTime())) / 60000);
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.saat} Yorgunsunuz`, aciklama: `Tekrar çalışabilmek için **${kalanDk} dakika** beklemelisiniz.` })],
                flags: 64
            });
        }

        const kazanc = Math.floor(Math.random() * (200 - 50 + 1)) + 50;
        const meslek = MESLEKLER[Math.floor(Math.random() * MESLEKLER.length)];

        kayit.cuzdan += kazanc;
        kayit.sonCalisma = new Date();
        await kayit.save();

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.ekonomi} Çalıştınız!`, aciklama: `Bugün ${meslek} ve **${paraBirimi} ${kazanc}** kazandınız.` })]
        });
    }
};
