const { PermissionFlagsBits } = require('discord.js');
const { onayVerisiGetir, onayVerisiTemizle } = require('../../services/onayService');
const { guildAyariGetir } = require('../../services/guildService');
const { moderasyonLogGonder } = require('../../services/moderasyonLogService');
const { caseKaydet } = require('../../services/caseService');
const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');

module.exports = {
    customId: 'onay:devam',
    async execute(client, interaction) {
        const token = interaction.customId.split(':').slice(2).join(':');
        const kayit = onayVerisiGetir(token);

        if (!kayit) {
            return interaction.update({
                embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Süre Doldu`, aciklama: 'Bu onay işleminin süresi doldu, komutu tekrar çalıştırın.' })],
                components: []
            });
        }

        if (kayit.veri.yetkiliId !== interaction.user.id) {
            return interaction.reply({ content: 'Bu onayı yalnızca komutu başlatan yetkili verebilir.', flags: 64 });
        }

        onayVerisiTemizle(token);

        if (kayit.tip === 'yasakla') {
            await islemYasakla(client, interaction, kayit.veri);
        } else if (kayit.tip === 'geri-yukle') {
            await islemGeriYukle(client, interaction, kayit.veri);
        } else if (kayit.tip === 'softban') {
            await islemSoftban(client, interaction, kayit.veri);
        } else if (kayit.tip === 'lockdown') {
            await islemLockdown(client, interaction, kayit.veri);
        }
    }
};

async function islemYasakla(client, interaction, veri) {
    const guild = client.guilds.cache.get(veri.guildId);
    const kullanici = await client.users.fetch(veri.kullaniciId).catch(() => null);

    if (!guild || !kullanici) {
        return interaction.update({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Hata`, aciklama: 'İşlem tamamlanamadı.' })], components: [] });
    }

    if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.update({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bot Yetkisi Yok`, aciklama: '"Üyeleri Yasakla" yetkisine ihtiyacım var.' })], components: [] });
    }

    await kullanici.send({
        embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.yasakla} Sunucudan Yasaklandınız`, aciklama: `**${guild.name}** sunucusundan yasaklandınız.\n**Sebep:** ${veri.sebep}` })]
    }).catch(() => {});

    await guild.members.ban(veri.kullaniciId, { reason: veri.sebep });
    const caseNo = await caseKaydet(guild.id, 'yasaklama', veri.kullaniciId, veri.yetkiliId, veri.sebep);

    await interaction.update({
        embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Kullanıcı Yasaklandı`, aciklama: `**${kullanici.tag}** başarıyla yasaklandı.`, alanlar: [{ name: 'Case', value: `#${caseNo}`, inline: true }, { name: 'Sebep', value: veri.sebep, inline: true }] })],
        components: []
    });

    const guildAyari = await guildAyariGetir(guild.id);
    const yetkili = await client.users.fetch(veri.yetkiliId).catch(() => interaction.user);
    await moderasyonLogGonder(guild, guildAyari, { tip: 'Yasaklama', kullanici, yetkili, sebep: veri.sebep, caseNo });
}

async function islemSoftban(client, interaction, veri) {
    const guild = client.guilds.cache.get(veri.guildId);
    const kullanici = await client.users.fetch(veri.kullaniciId).catch(() => null);

    if (!guild || !kullanici) {
        return interaction.update({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Hata`, aciklama: 'İşlem tamamlanamadı.' })], components: [] });
    }

    if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.update({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Bot Yetkisi Yok`, aciklama: '"Üyeleri Yasakla" yetkisine ihtiyacım var.' })], components: [] });
    }

    await kullanici.send({
        embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.yasakla} Sunucudan Softban Uygulandı`, aciklama: `**${guild.name}** sunucusundan softban ile atıldınız (mesajlarınız temizlendi). Tekrar katılabilirsiniz.\n**Sebep:** ${veri.sebep}` })]
    }).catch(() => {});

    await guild.members.ban(veri.kullaniciId, { reason: `[SOFTBAN] ${veri.sebep}`, deleteMessageSeconds: veri.mesajGunSayisi * 24 * 60 * 60 });
    await guild.members.unban(veri.kullaniciId, 'Softban - otomatik yasak kaldırma').catch(() => {});

    const caseNo = await caseKaydet(guild.id, 'softban', veri.kullaniciId, veri.yetkiliId, veri.sebep, `${veri.mesajGunSayisi} gün mesaj temizlendi`);

    await interaction.update({
        embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Softban Uygulandı`, aciklama: `**${kullanici.tag}** kullanıcısının son **${veri.mesajGunSayisi} gün**lük mesajları temizlendi ve yasak kaldırıldı.`, alanlar: [{ name: 'Case', value: `#${caseNo}` }] })],
        components: []
    });

    const guildAyari = await guildAyariGetir(guild.id);
    const yetkili = await client.users.fetch(veri.yetkiliId).catch(() => interaction.user);
    await moderasyonLogGonder(guild, guildAyari, { tip: 'Softban', kullanici, yetkili, sebep: veri.sebep, caseNo });
}

async function islemLockdown(client, interaction, veri) {
    const { lockdownUygula, korumaAyariGetir, guvenlikLogu } = require('../../services/korumaService');
    const guild = client.guilds.cache.get(veri.guildId);
    if (!guild) return;

    await interaction.update({
        embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.kilit} Kanallar Kilitleniyor...` })],
        components: []
    });

    const sayi = await lockdownUygula(guild, true, veri.yetkiliId);
    const ayar = await korumaAyariGetir(guild.id);
    const yetkili = await client.users.fetch(veri.yetkiliId).catch(() => null);

    await guvenlikLogu(guild, ayar, {
        tip: 'LOCKDOWN BAŞLATILDI',
        uye: yetkili,
        detay: `${sayi} kanal kilitlendi. Sebep: ${veri.sebep}`,
        alinanOnlem: 'Tüm metin kanalları @everyone için kilitlendi',
        riskPuani: 100
    });

    await interaction.editReply({
        embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.kilit} Lockdown Aktif`, aciklama: `**${sayi}** kanal kilitlendi.\nKaldırmak için \`/lockdown kaldır\` kullanın.` })],
        components: []
    });
}

async function islemGeriYukle(client, interaction, veri) {
    const Yedek = require('../../database/models/Yedek');
    const { ChannelType } = require('discord.js');

    const guild = client.guilds.cache.get(veri.guildId);
    const yedek = await Yedek.findOne({ _id: veri.yedekId, guildId: veri.guildId }).catch(() => null);

    if (!guild || !yedek) {
        return interaction.update({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Hata`, aciklama: 'Yedek veya sunucu bulunamadı.' })], components: [] });
    }

    let eklenenRol = 0;
    for (const r of yedek.veri.roller) {
        if (guild.roles.cache.some(mevcut => mevcut.name === r.isim)) continue;
        await guild.roles.create({
            name: r.isim, color: r.renk, hoist: r.hoisted, mentionable: r.mentionable,
            permissions: BigInt(r.izinler)
        }).catch(() => {});
        eklenenRol++;
    }

    const TIP_ESLESTIRME = { 4: ChannelType.GuildCategory, 0: ChannelType.GuildText, 2: ChannelType.GuildVoice };
    let eklenenKanal = 0;
    for (const k of yedek.veri.kanallar) {
        if (guild.channels.cache.some(mevcut => mevcut.name === k.isim)) continue;
        const tip = TIP_ESLESTIRME[k.tip];
        if (tip === undefined) continue;
        await guild.channels.create({ name: k.isim, type: tip, topic: k.konu || undefined }).catch(() => {});
        eklenenKanal++;
    }

    await interaction.update({
        embeds: [temelEmbed({
            tip: 'basari',
            baslik: `${emojis.basari} Geri Yükleme Tamamlandı`,
            aciklama: `**${yedek.isim}** yedeğinden **${eklenenRol}** rol ve **${eklenenKanal}** kanal eklendi.`
        })],
        components: []
    });
}
