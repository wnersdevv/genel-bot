const chalk = require('chalk');
const { kalanSure } = require('../middleware/cooldown');
const { komutHatasiIsle } = require('../middleware/hataYonetimi');
const { temelEmbed } = require('../utils/embedOlustur');
const { guildAyariGetir } = require('../services/guildService');
const { guildKomutAyarlariGetir } = require('../services/komutAyarService');
const { onayDurumu } = require('../services/sartOnayService');

// Şart onayı verilmeden çalıştırılabilecek kategoriler (veri işlemeyen / bilgilendirici)
const ONAYSIZ_KATEGORILER = new Set(['bilgi', 'sistem', 'araçlar', 'araclar']);
const ONAYSIZ_KOMUTLAR = new Set(['yardım', 'bot', 'dil', 'kurulum', 'panel', 'ayarlar']);
const emojis = require('../utils/emojis');
const ayarlar = require('../utils/ayarlar');

module.exports = {
    isim: 'interactionCreate',
    async execute(client, interaction) {
        try {
            if (interaction.isChatInputCommand()) {
                await slashKomutCalistir(client, interaction);
            } else if (interaction.isButton()) {
                await client.butonlar.get(ayirEtiket(interaction.customId))?.execute(client, interaction);
            } else if (interaction.isStringSelectMenu() || interaction.isChannelSelectMenu() || interaction.isRoleSelectMenu() || interaction.isUserSelectMenu()) {
                await client.menuler.get(ayirEtiket(interaction.customId))?.execute(client, interaction);
            } else if (interaction.isModalSubmit()) {
                await client.modallar.get(ayirEtiket(interaction.customId))?.execute(client, interaction);
            } else if (interaction.isAutocomplete()) {
                const komut = client.slashKomutlari.get(interaction.commandName);
                if (komut?.autocomplete) await komut.autocomplete(client, interaction);
            }
        } catch (hata) {
            console.error(chalk.red('[interactionCreate] Beklenmeyen hata:'), hata);
        }
    }
};

// customId formatı: "modul:aksiyon:ekstraVeri" -> yönlendirme anahtarı "modul:aksiyon"
function ayirEtiket(customId) {
    const parcalar = customId.split(':');
    return parcalar.slice(0, 2).join(':');
}

async function slashKomutCalistir(client, interaction) {
    const komut = client.slashKomutlari.get(interaction.commandName);
    if (!komut) return;

    let komutOzelAyar = null;
    if (interaction.guild) {
        // Şart onayı olmadan veri işleyen komutlar çalıştırılmaz
        const onay = await onayDurumu(interaction.guild.id);
        const onaysizCalisabilir = ONAYSIZ_KOMUTLAR.has(interaction.commandName)
            || ONAYSIZ_KATEGORILER.has(komut.kategori);

        if (!onay.kabulEdildi && !onaysizCalisabilir) {
            const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
            return interaction.reply({
                embeds: [temelEmbed({
                    tip: 'uyari',
                    baslik: `${emojis.uyari} Şart Onayı Gerekiyor`,
                    aciklama: onay.surumEskimis
                        ? 'Hizmet şartları güncellendi. Bu özelliği kullanmaya devam etmek için güncel şartları kabul etmeniz gerekiyor.'
                        : 'Bu sunucuda henüz hizmet şartları ve gizlilik politikası kabul edilmemiş. Veri işleyen özellikler onay verilene kadar devre dışıdır.'
                })],
                components: [new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('onboarding:sartlar').setLabel('📄 Şartları Görüntüle').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('onboarding:kabul').setLabel('✅ Kabul Ediyorum').setStyle(ButtonStyle.Success)
                )],
                flags: 64
            });
        }

        const guildAyari = await guildAyariGetir(interaction.guild.id);

        if (komut.kategori && guildAyari.modüller[komut.kategori] === false) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.uyari} Modül Kapalı`, aciklama: 'Bu komutun ait olduğu modül bu sunucuda kapatılmış.' })],
                flags: 64
            });
        }

        const komutAyarlari = await guildKomutAyarlariGetir(interaction.guild.id);
        komutOzelAyar = komutAyarlari.get(interaction.commandName);

        if (komutOzelAyar && komutOzelAyar.aktif === false) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.uyari} Komut Kapalı`, aciklama: 'Bu komut yönetici tarafından bu sunucuda devre dışı bırakılmış.' })],
                flags: 64
            });
        }
    }

    if (komut.geliştiriciKomutu) {
        const gelistiriciMi = ayarlar.sistem.geliştiriciIdleri.includes(interaction.user.id);
        if (!gelistiriciMi) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkisiz`, aciklama: 'Bu komut yalnızca geliştiriciler tarafından kullanılabilir.' })],
                flags: 64
            });
        }
    }

    const cooldownSn = komutOzelAyar?.cooldownSn ?? komut.cooldownSn ?? ayarlar.limitler.komutCooldownVarsayılanSn;
    const kalan = kalanSure(komut.data.name, interaction.user.id, cooldownSn);
    if (kalan > 0) {
        return interaction.reply({
            embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.saat} Yavaş Ol!`, aciklama: `Bu komutu tekrar kullanmadan önce **${kalan} saniye** beklemelisin.` })],
            flags: 64
        });
    }

    try {
        await komut.execute(client, interaction);
    } catch (hata) {
        await komutHatasiIsle(hata, {
            kaynak: 'slash',
            komutIsmi: interaction.commandName,
            cevapVer: (icerik) => interaction.replied || interaction.deferred
                ? interaction.followUp(icerik)
                : interaction.reply(icerik)
        });
    }
}
