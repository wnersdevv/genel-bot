const { SlashCommandBuilder } = require('discord.js');
const { ekonomiKaydiGetir } = require('../../../services/ekonomiService');
const { guildAyariGetir } = require('../../../services/guildService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gönder')
        .setDescription('Başka bir kullanıcıya cüzdanınızdan para gönderir.')
        .addUserOption(o => o.setName('kullanıcı').setDescription('Para gönderilecek kullanıcı').setRequired(true))
        .addIntegerOption(o => o.setName('miktar').setDescription('Gönderilecek miktar').setRequired(true).setMinValue(1)),
    kategori: 'ekonomi',
    cooldownSn: 5,

    async execute(client, interaction) {
        const hedef = interaction.options.getUser('kullanıcı');
        const miktar = interaction.options.getInteger('miktar');

        if (hedef.id === interaction.user.id) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz İşlem`, aciklama: 'Kendinize para gönderemezsiniz.' })], flags: 64 });
        }
        if (hedef.bot) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz İşlem`, aciklama: 'Botlara para gönderemezsiniz.' })], flags: 64 });
        }

        const gonderen = await ekonomiKaydiGetir(interaction.guild.id, interaction.user.id);
        if (gonderen.cuzdan < miktar) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetersiz Bakiye`, aciklama: 'Cüzdanınızda bu kadar para yok.' })], flags: 64 });
        }

        const alan = await ekonomiKaydiGetir(interaction.guild.id, hedef.id);
        const guildAyari = await guildAyariGetir(interaction.guild.id);
        const paraBirimi = guildAyari.ekonomiAyar?.paraBirimi || emojis.para;

        gonderen.cuzdan -= miktar;
        alan.cuzdan += miktar;
        await gonderen.save();
        await alan.save();

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.satis} Transfer Tamamlandı`, aciklama: `**${interaction.user}** → **${hedef}**\n**${paraBirimi} ${miktar}** gönderildi.` })]
        });
    }
};
