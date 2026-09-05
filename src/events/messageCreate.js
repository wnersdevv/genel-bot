const chalk = require('chalk');
const { PermissionFlagsBits } = require('discord.js');
const { guildAyariGetir } = require('../services/guildService');
const { komutHatasiIsle } = require('../middleware/hataYonetimi');
const { kalanSure } = require('../middleware/cooldown');
const { xpEkle } = require('../services/seviyeService');
const { spamTespitEt } = require('../services/antiSpamService');
const { filtreGetir, mesajiKontrolEt } = require('../services/filtreService');
const Afk = require('../database/models/Afk');
const OtomatikCevap = require('../database/models/OtomatikCevap');
const { temelEmbed } = require('../utils/embedOlustur');
const emojis = require('../utils/emojis');

module.exports = {
    isim: 'messageCreate',
    async execute(client, message) {
        if (message.author.bot || !message.guild) return;

        const guildAyari = await guildAyariGetir(message.guild.id);
        const yetkiliMi = message.member.permissions.has(PermissionFlagsBits.ManageMessages);

        // Anti-Spam koruma
        if (guildAyari.koruma?.antiSpam && !yetkiliMi) {
            if (spamTespitEt(message.guild.id, message.author.id, guildAyari)) {
                await message.delete().catch(() => {});
                return;
            }
        }

        // Mesaj Filtreleme
        if (guildAyari.modüller.mesajFiltreleme && !yetkiliMi) {
            const filtre = await filtreGetir(message.guild.id);
            const muafRolMu = filtre.muafRoller.some(id => message.member.roles.cache.has(id));
            const muafKanalMi = filtre.muafKanallar.includes(message.channel.id);

            if (!muafRolMu && !muafKanalMi) {
                const sonuc = mesajiKontrolEt(message.content, filtre);
                if (sonuc.ihlalVar) {
                    await message.delete().catch(() => {});
                    message.channel.send({
                        content: `${message.author}`,
                        embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.uyari} Mesajın Silindi`, aciklama: `**Sebep:** ${sonuc.sebep}` })]
                    }).then(m => setTimeout(() => m.delete().catch(() => {}), 6000)).catch(() => {});
                    return;
                }
            }
        }

        // AFK - kullanıcı mesaj attıysa AFK durumunu kaldır
        const kendiAfk = await Afk.findOneAndDelete({ guildId: message.guild.id, kullaniciId: message.author.id });
        if (kendiAfk) {
            message.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.afk} Tekrar Hoş Geldin!`, aciklama: 'AFK durumun kaldırıldı.' })] })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000)).catch(() => {});
        }

        // AFK - mention edilen kullanıcılar AFK ise bilgi ver
        if (guildAyari.modüller.afk && message.mentions.users.size > 0) {
            for (const [, kullanici] of message.mentions.users) {
                const afkKaydi = await Afk.findOne({ guildId: message.guild.id, kullaniciId: kullanici.id });
                if (afkKaydi) {
                    message.reply({ embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.afk} AFK`, aciklama: `**${kullanici.username}** şu anda AFK: ${afkKaydi.mesaj}` })] }).catch(() => {});
                }
            }
        }

        // Otomatik Cevap
        if (guildAyari.modüller.otomatikCevap) {
            const cevaplar = await OtomatikCevap.find({ guildId: message.guild.id });
            const eslesen = cevaplar.find(c =>
                c.tamEslesme
                    ? message.content.toLowerCase() === c.tetikleyici.toLowerCase()
                    : message.content.toLowerCase().includes(c.tetikleyici.toLowerCase())
            );
            if (eslesen) message.channel.send(eslesen.cevap).catch(() => {});
        }

        // Seviye XP (modül açıksa)
        if (guildAyari.modüller.seviye) {
            xpEkle(client, message, guildAyari).catch(hata =>
                console.error(chalk.red('[Seviye] XP eklenirken hata:'), hata)
            );
        }

        const prefix = guildAyari.prefix || '!';
        if (!message.content.startsWith(prefix)) return;

        const argumanlar = message.content.slice(prefix.length).trim().split(/\s+/);
        const komutIsmi = argumanlar.shift().toLowerCase();

        const gercekIsim = client.prefixKomutlari.has(komutIsmi)
            ? komutIsmi
            : client.prefixAliaslar.get(komutIsmi);

        const komut = client.prefixKomutlari.get(gercekIsim);

        if (!komut) {
            // Yerleşik komut değilse, sunucuya özel bir "özel komut" olup olmadığını kontrol et
            const OzelKomut = require('../database/models/OzelKomut');
            const ozelKomut = await OzelKomut.findOneAndUpdate(
                { guildId: message.guild.id, isim: komutIsmi },
                { $inc: { kullanimSayisi: 1 } }
            );
            if (ozelKomut) message.channel.send(ozelKomut.cevap).catch(() => {});
            return;
        }

        if (komut.kategori && guildAyari.modüller[komut.kategori] === false) return;

        const cooldownSn = komut.cooldownSn ?? 3;
        const kalan = kalanSure(`prefix:${komut.isim}`, message.author.id, cooldownSn);
        if (kalan > 0) return message.reply(`⏳ Bu komutu tekrar kullanmadan önce **${kalan} saniye** bekle.`).catch(() => {});

        try {
            await komut.execute(client, message, argumanlar, guildAyari);
        } catch (hata) {
            await komutHatasiIsle(hata, {
                kaynak: 'prefix',
                komutIsmi: komut.isim,
                cevapVer: (icerik) => message.reply(icerik)
            });
        }
    }
};
