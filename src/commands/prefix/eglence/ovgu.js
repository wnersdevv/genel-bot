const { SlashCommandBuilder } = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const OVGULER = [
    'gülüşün odayı aydınlatıyor.',
    'seninle konuşmak günümü güzelleştiriyor.',
    'gerçekten değerli birisin.',
    'enerjin çok pozitif, etrafına yayılıyor.',
    'yeteneklerin gerçekten etkileyici.',
    'varlığın bu sunucuyu daha iyi bir yer yapıyor.',
    'fikirlerin her zaman ilham verici.',
    'seninle tanışmak büyük bir şans.'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('övgü')
        .setDescription('Bir kullanıcıya güzel bir söz söyler.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('Övülecek kullanıcı (boş = sen)').setRequired(false)),
    kategori: 'eğlence',
    cooldownSn: 2,

    async execute(client, interaction) {
        const hedef = interaction.options.getUser('kullanıcı') || interaction.user;
        const ovgu = OVGULER[Math.floor(Math.random() * OVGULER.length)];

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `💐 Övgü Zamanı`, aciklama: `${hedef}, ${ovgu}` })]
        });
    }
};
