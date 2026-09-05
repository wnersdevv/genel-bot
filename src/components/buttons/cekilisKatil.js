const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Cekilis = require('../../database/models/Cekilis');
const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');

module.exports = {
    customId: 'cekilis:katil',
    async execute(client, interaction) {
        const cekilis = await Cekilis.findOne({ mesajId: interaction.message.id, durum: 'aktif' });

        if (!cekilis) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Çekiliş Bulunamadı`, aciklama: 'Bu çekiliş artık aktif değil.' })], flags: 64 });
        }

        if (cekilis.sartlar?.rolId && !interaction.member.roles.cache.has(cekilis.sartlar.rolId)) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Şartları Sağlamıyorsunuz`, aciklama: `Bu çekilişe katılmak için <@&${cekilis.sartlar.rolId}> rolüne sahip olmalısınız.` })],
                flags: 64
            });
        }

        if (cekilis.katilimcilar.includes(interaction.user.id)) {
            cekilis.katilimcilar = cekilis.katilimcilar.filter(id => id !== interaction.user.id);
            await cekilis.save();

            await interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.iptal} Katılımınız İptal Edildi`, aciklama: 'Çekilişten çıktınız.' })], flags: 64 });
        } else {
            cekilis.katilimcilar.push(interaction.user.id);
            await cekilis.save();

            await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Katıldınız!`, aciklama: `**${cekilis.odul}** çekilişine katıldınız. Bol şans!` })], flags: 64 });
        }

        const satir = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('cekilis:katil').setLabel(`🎉 Katıl (${cekilis.katilimcilar.length})`).setStyle(ButtonStyle.Success)
        );
        await interaction.message.edit({ components: [satir] }).catch(() => {});
    }
};
