const { SlashCommandBuilder, Collection } = require('discord.js');
const { komutlariYukle } = require('../../../handlers/commandHandler');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder().setName('reload').setDescription('[Geliştirici] Tüm komutları diskten yeniden yükler.'),
    kategori: 'sistem',
    geliştiriciKomutu: true,

    async execute(client, interaction) {
        await interaction.deferReply({ flags: 64 });

        client.slashKomutlari = new Collection();
        client.prefixKomutlari = new Collection();
        client.prefixAliaslar = new Collection();

        komutlariYukle(client);

        await interaction.editReply({
            embeds: [temelEmbed({
                tip: 'basari',
                baslik: `${emojis.gelistirici} Komutlar Yeniden Yüklendi`,
                aciklama: `${client.slashKomutlari.size} slash / ${client.prefixKomutlari.size} prefix komut belleğe alındı.\n\n⚠️ Bu işlem yalnızca yerel önbelleği günceller; Discord'a yeni komut kaydı için \`npm run deploy\` çalıştırın.`
            })]
        });
    }
};
