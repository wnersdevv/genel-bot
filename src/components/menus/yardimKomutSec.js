const { MessageFlags } = require('discord.js');
const { komutDetayOlustur } = require('../../commands/slash/sistem/yardim');
const { komutMetaOlustur } = require('../../utils/komutMeta');
const { guildAyariGetir } = require('../../services/guildService');

module.exports = {
    customId: 'yardim:komut-sec',
    async execute(client, interaction) {
        const isim = interaction.values[0];
        const guildAyari = interaction.guild ? await guildAyariGetir(interaction.guild.id) : null;
        const prefix = guildAyari?.prefix || '!';

        const kaynak = client.slashKomutlari.get(isim) || client.prefixKomutlari.get(isim)?.kaynakKomut;
        if (!kaynak?.data) {
            return interaction.reply({ content: '❌ Bu komut artık mevcut değil.', flags: 64 });
        }

        const meta = komutMetaOlustur(kaynak, client.slashKomutlari.has(isim), prefix);
        await interaction.update({
            components: [komutDetayOlustur(meta, prefix)],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
