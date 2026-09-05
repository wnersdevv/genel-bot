const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ms = require('ms');
const Anket = require('../../../database/models/Anket');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const HARFLER = ['🇦', '🇧', '🇨', '🇩', '🇪'];

function sonucEmbedOlustur(anket) {
    const toplamOy = anket.kullaniciOylari.length;
    const satirlar = anket.secenekler.map((s, i) => {
        const oySayisi = anket.kullaniciOylari.filter(o => o.secenekIndex === i).length;
        const yuzde = toplamOy ? Math.round((oySayisi / toplamOy) * 100) : 0;
        const barUzunluk = 15;
        const doluBar = Math.round((yuzde / 100) * barUzunluk);
        const bar = '█'.repeat(doluBar) + '░'.repeat(barUzunluk - doluBar);
        return `${HARFLER[i]} ${s}\n${bar} ${yuzde}% (${oySayisi} oy)`;
    });

    return temelEmbed({
        tip: 'bilgi',
        baslik: `${emojis.bilgi} ${anket.soru}`,
        aciklama: `${satirlar.join('\n\n')}\n\n**Toplam Oy:** ${toplamOy}${anket.kapandi ? '\n\n🔒 Bu anket kapandı.' : ''}`
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anket')
        .setDescription('Çok seçenekli bir anket başlatır.')
        .addStringOption(o => o.setName('soru').setDescription('Anket sorusu').setRequired(true))
        .addStringOption(o => o.setName('seçenek-1').setDescription('1. seçenek').setRequired(true))
        .addStringOption(o => o.setName('seçenek-2').setDescription('2. seçenek').setRequired(true))
        .addStringOption(o => o.setName('seçenek-3').setDescription('3. seçenek').setRequired(false))
        .addStringOption(o => o.setName('seçenek-4').setDescription('4. seçenek').setRequired(false))
        .addStringOption(o => o.setName('seçenek-5').setDescription('5. seçenek').setRequired(false))
        .addStringOption(o => o.setName('süre').setDescription('Anket süresi (örn: 1h, 1d). Boş = süresiz').setRequired(false)),
    kategori: 'sistem',

    async execute(client, interaction) {
        const soru = interaction.options.getString('soru');
        const secenekler = [1, 2, 3, 4, 5]
            .map(i => interaction.options.getString(`seçenek-${i}`))
            .filter(Boolean);

        const sureMetni = interaction.options.getString('süre');
        const sureMs = sureMetni ? ms(sureMetni) : null;
        const bitisZamani = sureMs ? new Date(Date.now() + sureMs) : null;

        const anketTaslak = { soru, secenekler, kullaniciOylari: [], kapandi: false };
        const satir = new ActionRowBuilder().addComponents(
            secenekler.map((_, i) => new ButtonBuilder().setCustomId(`anket:oyla:${i}`).setLabel(HARFLER[i]).setStyle(ButtonStyle.Secondary))
        );

        const mesaj = await interaction.reply({ embeds: [sonucEmbedOlustur(anketTaslak)], components: [satir], fetchReply: true });

        await Anket.create({
            guildId: interaction.guild.id,
            kanalId: interaction.channel.id,
            mesajId: mesaj.id,
            soru,
            secenekler,
            bitisZamani
        });
    }
};

module.exports.sonucEmbedOlustur = sonucEmbedOlustur;
module.exports.HARFLER = HARFLER;
