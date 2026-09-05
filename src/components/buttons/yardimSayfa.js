const { MessageFlags } = require('discord.js');
const { sayfaOlustur } = require('../menus/yardimKategoriSec');
const { guildAyariGetir } = require('../../services/guildService');

module.exports = {
    customId: 'yardim:sayfa',
    async execute(client, interaction) {
        const parcalar = interaction.customId.split(':');
        const sayfaNo = parseInt(parcalar.pop(), 10);
        const kategori = parcalar.slice(2).join(':');

        const guildAyari = interaction.guild ? await guildAyariGetir(interaction.guild.id) : null;
        const prefix = guildAyari?.prefix || '!';

        await interaction.update({
            components: [sayfaOlustur(client, kategori, sayfaNo, prefix)],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
