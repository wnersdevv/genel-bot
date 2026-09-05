const BasvuruFormu = require('../../database/models/BasvuruFormu');
const Basvuru = require('../../database/models/Basvuru');
const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');

module.exports = {
    customId: 'basvuruModal:gonder',
    async execute(client, interaction) {
        const formId = interaction.customId.split(':')[2];
        const form = await BasvuruFormu.findById(formId).catch(() => null);

        if (!form) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Form Bulunamadı` })], flags: 64 });
        }

        const cevaplar = form.sorular.map((soru, i) => ({ soru, cevap: interaction.fields.getTextInputValue(`soru${i}`) }));

        await Basvuru.create({
            guildId: interaction.guild.id,
            kullaniciId: interaction.user.id,
            formIsmi: form.isim,
            cevaplar
        });

        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Başvurunuz Alındı`, aciklama: 'Başvurunuz yetkililere iletildi. Sonuç için bekleyin.' })], flags: 64 });

        const sonucKanal = form.sonucKanaliId ? interaction.guild.channels.cache.get(form.sonucKanaliId) : null;
        if (sonucKanal) {
            sonucKanal.send({
                embeds: [temelEmbed({
                    tip: 'bilgi',
                    baslik: `${emojis.oneri} Yeni Başvuru — ${form.isim}`,
                    aciklama: `**Başvuran:** ${interaction.user}\n\n${cevaplar.map(c => `**${c.soru}**\n${c.cevap}`).join('\n\n')}`
                })]
            }).catch(() => {});
        }
    }
};
