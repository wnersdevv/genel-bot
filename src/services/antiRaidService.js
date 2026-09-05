const { korumaAyariGetir, guvenlikLogu, lockdownUygula } = require('./korumaService');
const logger = require('../utils/logger');

// guildId -> [{ id, zaman }]
const katilimGecmisi = new Map();
const raidDurumu = new Map();

/**
 * Yeni katılan üyeyi anti-raid açısından değerlendirir.
 * Kısa sürede çok sayıda (özellikle yeni) hesap katılırsa raid kabul edilir.
 */
async function katilimDenetimi(uye) {
    const ayar = await korumaAyariGetir(uye.guild.id);
    if (!ayar.aktif || !ayar.antiRaid.aktif) return;

    const { katilimLimit, pencereSn, hesapYasiGun, eylem, karantinaRolId, otomatikLockdown } = ayar.antiRaid;
    const simdi = Date.now();

    const gecmis = (katilimGecmisi.get(uye.guild.id) || []).filter(k => simdi - k.zaman < pencereSn * 1000);
    gecmis.push({ id: uye.id, zaman: simdi });
    katilimGecmisi.set(uye.guild.id, gecmis);

    if (gecmis.length < katilimLimit) return;

    const hesapYasi = (simdi - uye.user.createdTimestamp) / 86_400_000;
    const supheliMi = hesapYasi < hesapYasiGun;

    let alinanOnlem = 'izleniyor';

    try {
        if (supheliMi && eylem === 'ban' && uye.bannable) {
            await uye.ban({ reason: '[Anti-Raid] Şüpheli toplu katılım' });
            alinanOnlem = 'yasaklandı';
        } else if (supheliMi && eylem === 'kick' && uye.kickable) {
            await uye.kick('[Anti-Raid] Şüpheli toplu katılım');
            alinanOnlem = 'sunucudan atıldı';
        } else if (supheliMi && eylem === 'karantina' && karantinaRolId) {
            const rol = uye.guild.roles.cache.get(karantinaRolId);
            if (rol && rol.position < uye.guild.members.me.roles.highest.position) {
                await uye.roles.add(rol, '[Anti-Raid] Karantinaya alındı');
                alinanOnlem = 'karantinaya alındı';
            }
        }
    } catch (hata) {
        alinanOnlem = 'işlem uygulanamadı (yetki yetersiz)';
        logger.uyari('AntiRaid', `${uye.guild.id}: ${hata.message}`);
    }

    // Raid başına tek uyarı gönder
    const sonUyari = raidDurumu.get(uye.guild.id) || 0;
    if (simdi - sonUyari > 60_000) {
        raidDurumu.set(uye.guild.id, simdi);

        let lockdownNotu = '';
        if (otomatikLockdown && !ayar.lockdown.aktif) {
            const sayi = await lockdownUygula(uye.guild, true, uye.client.user.id).catch(() => 0);
            if (sayi) lockdownNotu = `\n🔒 ${sayi} kanal otomatik kilitlendi.`;
        }

        await guvenlikLogu(uye.guild, ayar, {
            tip: 'RAID TESPİT EDİLDİ',
            uye,
            detay: `${pencereSn} saniyede ${gecmis.length} üye katıldı. Son katılan hesap yaşı: ${hesapYasi.toFixed(1)} gün.${lockdownNotu}`,
            alinanOnlem,
            riskPuani: Math.min(100, 40 + gecmis.length * 5)
        });
    }
}

module.exports = { katilimDenetimi };
