const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

function uyumHesapla(id1, id2) {
    // Aynı ikili için her zaman aynı sonucu üretmek adına ID'lerden basit bir hash türetilir.
    const birlesik = [id1, id2].sort().join('');
    let toplam = 0;
    for (const karakter of birlesik) toplam += karakter.charCodeAt(0);
    return toplam % 101;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('İki kullanıcının uyumluluk yüzdesini hesaplar.')
        .addUserOption(o => o.setName('kullanıcı-1').setDescription('İlk kullanıcı').setRequired(true))
        .addUserOption(o => o.setName('kullanıcı-2').setDescription('İkinci kullanıcı (boş = sen)').setRequired(false)),
    kategori: 'eğlence',
    cooldownSn: 3,

    async execute(client, interaction) {
        const kullanici1 = interaction.options.getUser('kullanıcı-1');
        const kullanici2 = interaction.options.getUser('kullanıcı-2') || interaction.user;

        const yuzde = uyumHesapla(kullanici1.id, kullanici2.id);
        const barUzunluk = 10;
        const doluKalp = Math.round((yuzde / 100) * barUzunluk);
        const bar = '💖'.repeat(doluKalp) + '🤍'.repeat(barUzunluk - doluKalp);

        const isimBirlesimi = `${kullanici1.username.slice(0, Math.ceil(kullanici1.username.length / 2))}${kullanici2.username.slice(Math.floor(kullanici2.username.length / 2))}`;

        await interaction.reply({
            embeds: [temelEmbed({
                tip: yuzde > 60 ? 'basari' : yuzde > 30 ? 'uyari' : 'hata',
                baslik: `💘 ${kullanici1.username} ❤️ ${kullanici2.username}`,
                aciklama: `${bar}\n**%${yuzde}** uyumlu!\n\nGemi adı: **${isimBirlesimi}**`
            })]
        });
    }
};
