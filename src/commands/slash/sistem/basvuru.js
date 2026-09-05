const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const BasvuruFormu = require('../../../database/models/BasvuruFormu');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('başvuru')
        .setDescription('Bir başvuru formunu doldurur.')
        .addStringOption(o => o.setName('form').setDescription('Form ismi').setRequired(true).setAutocomplete(true)),
    kategori: 'sistem',
    // Modal yalnızca slash etkileşiminden açılabildiği için bu komut
    // prefix köprüsüne dahil edilmez.
    modalKullanir: true,

    async autocomplete(client, interaction) {
        const girilen = interaction.options.getFocused().toLowerCase();
        const formlar = await BasvuruFormu.find({ guildId: interaction.guild.id }).limit(25);
        const eslesenler = formlar.filter(f => f.isim.includes(girilen)).slice(0, 25);
        await interaction.respond(eslesenler.map(f => ({ name: f.isim, value: f.isim })));
    },

    async execute(client, interaction) {
        const formIsmi = interaction.options.getString('form').toLowerCase();
        const form = await BasvuruFormu.findOne({ guildId: interaction.guild.id, isim: formIsmi });

        if (!form) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Form Bulunamadı`, aciklama: `**${formIsmi}** isminde bir form bulunamadı.` })], flags: 64 });
        }

        const modal = new ModalBuilder()
            .setCustomId(`basvuruModal:gonder:${form._id}`)
            .setTitle(form.isim.slice(0, 45));

        form.sorular.forEach((soru, i) => {
            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId(`soru${i}`).setLabel(soru.slice(0, 45)).setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1000)
                )
            );
        });

        await interaction.showModal(modal);
    }
};
