const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

// Kullanıcı girdisini yalnızca sayı ve temel operatörlerle sınırlar (eval/exec güvenliği).
const GUVENLI_IFADE = /^[0-9+\-*/().\s%]+$/;

function guvenliHesapla(ifade) {
    if (!GUVENLI_IFADE.test(ifade)) return null;
    try {
        // new Function yalnızca burada, önceden regex ile doğrulanmış saf aritmetik
        // karakterler üzerinde çalışır; kullanıcı kodu veya shell komutu çalıştırılmaz.
        const sonuc = Function(`'use strict'; return (${ifade})`)();
        return typeof sonuc === 'number' && Number.isFinite(sonuc) ? sonuc : null;
    } catch {
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hesapla')
        .setDescription('Basit bir matematiksel ifadeyi hesaplar.')
        .addStringOption(o => o.setName('ifade').setDescription('Örn: 12*4+7').setRequired(true)),
    kategori: 'araçlar',
    cooldownSn: 2,

    async execute(client, interaction) {
        const ifade = interaction.options.getString('ifade');
        const sonuc = guvenliHesapla(ifade);

        if (sonuc === null) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz İfade`, aciklama: 'Yalnızca sayılar ve `+ - * / ( ) %` operatörlerini kullanabilirsiniz.' })],
                flags: 64
            });
        }

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.araçlar ?? '🧰'} Hesaplama`, alanlar: [{ name: 'İfade', value: `\`${ifade}\`` }, { name: 'Sonuç', value: `\`${sonuc}\`` }] })]
        });
    }
};
