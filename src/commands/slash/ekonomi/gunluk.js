const { SlashCommandBuilder } = require('discord.js');
const { ekonomiKaydiGetir } = require('../../../services/ekonomiService');
const { guildAyariGetir } = require('../../../services/guildService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const YIRMI_DORT_SAAT_MS = 24 * 60 * 60 * 1000;

module.exports = {
    data: new SlashCommandBuilder().setName('günlük').setDescription('Günlük ödülünüzü alırsınız.'),
    kategori: 'ekonomi',

    async execute(client, interaction) {
        const kayit = await ekonomiKaydiGetir(interaction.guild.id, interaction.user.id);
        const guildAyari = await guildAyariGetir(interaction.guild.id);
        const miktar = guildAyari.ekonomiAyar?.günlükMiktar || 250;
        const paraBirimi = guildAyari.ekonomiAyar?.paraBirimi || emojis.para;

        if (kayit.sonGunluk && Date.now() - new Date(kayit.sonGunluk).getTime() < YIRMI_DORT_SAAT_MS) {
            const kalanMs = YIRMI_DORT_SAAT_MS - (Date.now() - new Date(kayit.sonGunluk).getTime());
            const kalanSaat = Math.ceil(kalanMs / (60 * 60 * 1000));
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.saat} Zaten Aldınız`, aciklama: `Günlük ödülünüzü tekrar almak için **${kalanSaat} saat** beklemelisiniz.` })],
                flags: 64
            });
        }

        kayit.cuzdan += miktar;
        kayit.sonGunluk = new Date();
        await kayit.save();

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.hediye} Günlük Ödül Alındı`, aciklama: `**${paraBirimi} ${miktar}** kazandınız!` })]
        });
    }
};
