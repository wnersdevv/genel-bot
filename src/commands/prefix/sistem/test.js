const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('test').setDescription('[Geliştirici] Temel sistemleri hızlıca test eder.'),
    kategori: 'sistem',
    geliştiriciKomutu: true,

    async execute(client, interaction) {
        await interaction.deferReply({ flags: 64 });

        const sonuclar = [];

        sonuclar.push(`${client.ws.status === 0 ? '✅' : '❌'} Discord Gateway`);
        sonuclar.push(`${mongoose.connection.readyState === 1 ? '✅' : '❌'} MongoDB Bağlantısı`);

        try {
            await mongoose.connection.db.admin().ping();
            sonuclar.push('✅ MongoDB Ping');
        } catch {
            sonuclar.push('❌ MongoDB Ping');
        }

        sonuclar.push(`${client.slashKomutlari.size > 0 ? '✅' : '❌'} Slash Komutlar Yüklü (${client.slashKomutlari.size})`);
        sonuclar.push(`${client.prefixKomutlari.size > 0 ? '✅' : '❌'} Prefix Komutlar Yüklü (${client.prefixKomutlari.size})`);
        sonuclar.push(`${client.butonlar.size > 0 ? '✅' : '❌'} Bileşenler Yüklü (${client.butonlar.size + client.menuler.size + client.modallar.size})`);

        await interaction.editReply({
            embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.gelistirici} Sistem Testi`, aciklama: sonuclar.join('\n') })]
        });
    }
};
