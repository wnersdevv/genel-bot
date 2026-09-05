const express = require('express');
const { AuditLogEvent } = require('discord.js');
const router = express.Router();
const { girisGerekli } = require('../auth');
const { guildAyariGetir, guildAyariGuncelle } = require('../../services/guildService');
const { abonelikGetir } = require('../../services/abonelikService');
const { botDurumuHesapla } = require('../botDurumHesapla');
const { guildKomutAyarlariGetir, komutAyariGuncelle } = require('../../services/komutAyarService');

const Warn = require('../../database/models/Warn');
const CaseSayac = require('../../database/models/CaseSayac');
const Ticket = require('../../database/models/Ticket');
const Oneri = require('../../database/models/Oneri');
const Cekilis = require('../../database/models/Cekilis');
const Seviye = require('../../database/models/Seviye');
const Ekonomi = require('../../database/models/Ekonomi');
const Tag = require('../../database/models/Tag');
const { moderasyonLogGonder } = require('../../services/moderasyonLogService');
const { temelEmbed } = require('../../utils/embedOlustur');
const emojis = require('../../utils/emojis');
const { guildYayinla } = require('../soket');

const { dashboardGuildYetkisi, kritikIslemYetkisi } = require('../../services/yetkiService');
const { auditYaz } = require('../../services/auditService');

/**
 * Her istekte kullanıcının hedef sunucudaki gerçek Discord yetkisini
 * Discord'dan doğrular. OAuth2 oturumu tek başına yeterli sayılmaz.
 */
async function guildYetkisiKontrol(req, res, next) {
    const sonuc = await dashboardGuildYetkisi(req.client, req.user, req.params.guildId);

    if (!sonuc.izinli) {
        return res.status(sonuc.botYok ? 404 : 403).json({ hata: sonuc.sebep });
    }

    req.yetki = sonuc;
    next();
}

/** Kritik ayarlar için yönetici/sahip şartı arar. */
function kritikYetkiKontrol(req, res, next) {
    if (!kritikIslemYetkisi(req.yetki)) {
        return res.status(403).json({ hata: 'Bu işlem için sunucu sahibi veya yönetici olmalısınız.' });
    }
    next();
}

function guildGetir(req, res) {
    // Yetki katmanı guild'i zaten doğruladı; tekrar cache sorgusu yapılmaz.
    if (!req.yetki?.guild) {
        res.status(404).json({ hata: 'Sunucu bulunamadı. Bot bu sunucuda olmayabilir.' });
        return null;
    }
    return req.yetki.guild;
}

// ────────────────────────────────────────────
// GENEL BOT DURUMU (giriş yapan herkes görebilir)
// ────────────────────────────────────────────
router.get('/bot/durum', girisGerekli, (req, res) => {
    res.json(botDurumuHesapla(req.client));
});

// ────────────────────────────────────────────
// SUNUCU AYARLARI (mevcut)
// ────────────────────────────────────────────
router.get('/guild/:guildId', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const ayar = await guildAyariGetir(req.params.guildId);
    res.json(ayar);
});

router.patch('/guild/:guildId', girisGerekli, guildYetkisiKontrol, kritikYetkiKontrol, async (req, res) => {
    // Yalnızca bilinen ayar alanlarının yazılmasına izin verilir
    const IZINLI = /^(prefix|dil|modüller\.[\wğüşöçİĞÜŞÖÇ]+|kanallar\.[\wğüşöçİĞÜŞÖÇ]+|ekonomiAyar\.[\wğüşöçİĞÜŞÖÇ]+|seviyeAyar\.[\wğüşöçİĞÜŞÖÇ]+|hoşgeldinMesaj\.[\wğüşöçİĞÜŞÖÇ]+|ticketAyar\.[\wğüşöçİĞÜŞÖÇ]+|cezaZinciri\.[\wğüşöçİĞÜŞÖÇ]+|starboardAyar\.[\wğüşöçİĞÜŞÖÇ]+|özelOdaAyar\.[\wğüşöçİĞÜŞÖÇ]+)$/;

    const guncelleme = {};
    for (const [anahtar, deger] of Object.entries(req.body)) {
        if (IZINLI.test(anahtar)) guncelleme[anahtar] = deger;
    }

    if (!Object.keys(guncelleme).length) {
        return res.status(400).json({ hata: 'Geçerli bir ayar alanı gönderilmedi.' });
    }

    const oncesi = await guildAyariGetir(req.params.guildId);
    const guncellenen = await guildAyariGuncelle(req.params.guildId, guncelleme);

    for (const [anahtar, deger] of Object.entries(guncelleme)) {
        const eski = anahtar.split('.').reduce((o, k) => o?.[k], oncesi);
        auditYaz({
            guildId: req.params.guildId,
            kullaniciId: req.user.id,
            kullaniciEtiketi: req.user.username,
            islem: 'Ayar değiştirildi',
            kaynak: 'dashboard',
            hedef: anahtar,
            eskiDeger: eski,
            yeniDeger: deger
        });
    }

    res.json(guncellenen);
});

// ────────────────────────────────────────────
// GENEL BAKIŞ / İSTATİSTİK KARTLARI
// ────────────────────────────────────────────
router.get('/guild/:guildId/istatistik', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const guild = guildGetir(req, res);
    if (!guild) return;

    const [acikTicket, kapaliTicket, toplamUyari, aktifCekilis, bekleyenOneri, abonelik] = await Promise.all([
        Ticket.countDocuments({ guildId: guild.id, durum: { $ne: 'kapali' } }),
        Ticket.countDocuments({ guildId: guild.id, durum: 'kapali' }),
        Warn.countDocuments({ guildId: guild.id }),
        Cekilis.countDocuments({ guildId: guild.id, durum: 'aktif' }),
        Oneri.countDocuments({ guildId: guild.id, durum: 'bekliyor' }),
        abonelikGetir(guild.id)
    ]);

    // Not: GuildPresences ayrıcalıklı bir intent olduğu ve varsayılan olarak
    // açık olmadığı için çevrimiçi sayısı güvenilir şekilde okunamaz.
    // Bunun yerine her zaman doğru hesaplanabilen insan/bot ayrımı gösterilir.
    await guild.members.fetch().catch(() => {});
    const botSayisi = guild.members.cache.filter(u => u.user.bot).size;
    const insanSayisi = guild.memberCount - botSayisi;

    res.json({
        üyeSayısı: guild.memberCount,
        insanSayısı: insanSayisi,
        botSayısı: botSayisi,
        kanalSayısı: guild.channels.cache.size,
        rolSayısı: guild.roles.cache.size,
        botGecikmesi: Math.round(req.client.ws.ping),
        açıkTicket: acikTicket,
        kapalıTicket: kapaliTicket,
        toplamUyarı: toplamUyari,
        aktifÇekiliş: aktifCekilis,
        bekleyenÖneri: bekleyenOneri,
        plan: abonelik.plan
    });
});

// ────────────────────────────────────────────
// MODERASYON
// ────────────────────────────────────────────
router.get('/guild/:guildId/moderasyon', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const guild = guildGetir(req, res);
    if (!guild) return;

    const sayfa = parseInt(req.query.sayfa, 10) || 0;
    const SAYFA_BASINA = 20;

    const [uyarilar, toplamUyari] = await Promise.all([
        Warn.find({ guildId: guild.id }).sort({ createdAt: -1 }).skip(sayfa * SAYFA_BASINA).limit(SAYFA_BASINA),
        Warn.countDocuments({ guildId: guild.id })
    ]);

    let sonBanlar = [];
    let sonAtmalar = [];
    try {
        const banLoglari = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 10 });
        sonBanlar = [...banLoglari.entries.values()].map(e => ({
            hedefId: e.targetId, yetkiliId: e.executorId, sebep: e.reason, tarih: e.createdAt
        }));

        const atmaLoglari = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 10 });
        sonAtmalar = [...atmaLoglari.entries.values()].map(e => ({
            hedefId: e.targetId, yetkiliId: e.executorId, sebep: e.reason, tarih: e.createdAt
        }));
    } catch {
        // Bot "Denetim Kayıtlarını Görüntüle" yetkisine sahip değilse sessizce boş bırak
    }

    res.json({
        uyarilar,
        toplamUyari,
        sayfa,
        toplamSayfa: Math.max(1, Math.ceil(toplamUyari / SAYFA_BASINA)),
        sonBanlar,
        sonAtmalar
    });
});

router.post('/guild/:guildId/moderasyon/uyar', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const guild = guildGetir(req, res);
    if (!guild) return;

    const { kullaniciId, sebep } = req.body;
    if (!kullaniciId) return res.status(400).json({ hata: 'kullaniciId zorunludur.' });

    const hedefUye = await guild.members.fetch(kullaniciId).catch(() => null);
    if (!hedefUye) return res.status(404).json({ hata: 'Kullanıcı bu sunucuda bulunamadı.' });

    const caseNo = await CaseSayac.sonrakiCaseNo(guild.id);
    const kayit = await Warn.create({
        guildId: guild.id,
        kullaniciId,
        yetkiliId: req.user.id,
        sebep: sebep || 'Dashboard üzerinden verildi',
        caseNo
    });

    hedefUye.send({
        embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.uyari} Uyarı Aldınız`, aciklama: `**${guild.name}** sunucusunda bir uyarı aldınız.\n**Sebep:** ${kayit.sebep}` })]
    }).catch(() => {});

    const guildAyari = await guildAyariGetir(guild.id);
    const yetkiliKullanici = await req.client.users.fetch(req.user.id).catch(() => null);
    if (yetkiliKullanici) {
        await moderasyonLogGonder(guild, guildAyari, {
            tip: 'Uyarı Verildi (Dashboard)',
            kullanici: hedefUye.user,
            yetkili: yetkiliKullanici,
            sebep: kayit.sebep,
            caseNo
        });
    }

    guildYayinla(guild.id, 'bildirim', {
        tip: 'uyarı',
        metin: `${hedefUye.user.tag} kullanıcısına uyarı verildi (#${caseNo}, dashboard)`,
        tarih: new Date()
    });

    res.json(kayit);
});

// ────────────────────────────────────────────
// TICKET
// ────────────────────────────────────────────
router.get('/guild/:guildId/ticketler', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const guild = guildGetir(req, res);
    if (!guild) return;

    const [acik, kilitli, kapali, sonTicketlar] = await Promise.all([
        Ticket.countDocuments({ guildId: guild.id, durum: 'acik' }),
        Ticket.countDocuments({ guildId: guild.id, durum: 'kilitli' }),
        Ticket.countDocuments({ guildId: guild.id, durum: 'kapali' }),
        Ticket.find({ guildId: guild.id }).sort({ createdAt: -1 }).limit(30)
    ]);

    const kapaliTicketlar = await Ticket.find({ guildId: guild.id, durum: 'kapali' });
    const ortalamaCozumDk = kapaliTicketlar.length
        ? Math.round(kapaliTicketlar.reduce((acc, t) => acc + (new Date(t.updatedAt) - new Date(t.createdAt)), 0) / kapaliTicketlar.length / 60000)
        : 0;

    res.json({ acik, kilitli, kapali, toplam: acik + kilitli + kapali, ortalamaCozumDk, sonTicketlar });
});

// ────────────────────────────────────────────
// ÜYELER
// ────────────────────────────────────────────
router.get('/guild/:guildId/uyeler', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const guild = guildGetir(req, res);
    if (!guild) return;

    const ara = (req.query.ara || '').toLowerCase();

    // Üye önbelleği bot açılışında dolmayabilir; doğru liste için bir kez fetch edilir.
    await guild.members.fetch().catch(() => {});
    let uyeler = [...guild.members.cache.values()];

    if (ara) {
        uyeler = uyeler.filter(u =>
            u.user.username.toLowerCase().includes(ara) ||
            u.displayName.toLowerCase().includes(ara) ||
            u.id === ara
        );
    }

    const toplam = uyeler.length;
    const sonuc = uyeler.slice(0, 50).map(u => ({
        id: u.id,
        kullaniciAdi: u.user.username,
        goruntulenenAd: u.displayName,
        avatar: u.displayAvatarURL({ size: 128 }),
        bot: u.user.bot,
        katilmaTarihi: u.joinedAt,
        rolSayisi: u.roles.cache.size - 1
    }));

    res.json({ toplam, gosterilen: sonuc.length, uyeler: sonuc });
});

// ────────────────────────────────────────────
// ROLLER
// ────────────────────────────────────────────
router.get('/guild/:guildId/roller', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const guild = guildGetir(req, res);
    if (!guild) return;

    const roller = [...guild.roles.cache.values()]
        .filter(r => r.id !== guild.id)
        .sort((a, b) => b.position - a.position)
        .map(r => ({ id: r.id, isim: r.name, renk: r.hexColor, üyeSayısı: r.members.size, pozisyon: r.position }));

    res.json(roller);
});

// ────────────────────────────────────────────
// KANALLAR
// ────────────────────────────────────────────
router.get('/guild/:guildId/kanallar', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const guild = guildGetir(req, res);
    if (!guild) return;

    const TIP_ISIMLERI = { 0: 'metin', 2: 'ses', 4: 'kategori', 5: 'duyuru', 13: 'sahne', 15: 'forum' };
    const kanallar = [...guild.channels.cache.values()]
        .map(k => ({ id: k.id, isim: k.name, tip: TIP_ISIMLERI[k.type] || 'diğer', pozisyon: k.position }))
        .sort((a, b) => a.pozisyon - b.pozisyon);

    res.json(kanallar);
});

// ────────────────────────────────────────────
// KOMUTLAR
// ────────────────────────────────────────────
router.get('/guild/:guildId/komutlar', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const { komutMetaOlustur } = require('../../utils/komutMeta');
    const ozelAyarlar = await guildKomutAyarlariGetir(req.params.guildId);
    const guildAyari = await guildAyariGetir(req.params.guildId);
    const prefix = guildAyari.prefix || '!';

    const komutlar = [];

    for (const [isim, prefixKomut] of req.client.prefixKomutlari) {
        // Slash listesinde varsa asıl komut nesnesini oradan al (tam metadata için)
        const slashKomut = req.client.slashKomutlari.get(isim);
        const kaynak = slashKomut || prefixKomut.kaynakKomut;
        if (!kaynak?.data) continue;

        const meta = komutMetaOlustur(kaynak, Boolean(slashKomut), prefix);
        const ozel = ozelAyarlar.get(isim);

        komutlar.push({
            ...meta,
            cooldown: ozel?.cooldownSn ?? meta.cooldown,
            aktif: ozel?.aktif ?? true
        });
    }

    komutlar.sort((a, b) => a.kategori.localeCompare(b.kategori, 'tr') || a.isim.localeCompare(b.isim, 'tr'));

    res.json({ prefix, komutlar });
});

router.patch('/guild/:guildId/komutlar/:isim', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const { aktif, cooldownSn } = req.body;
    const guncelleme = {};
    if (typeof aktif === 'boolean') guncelleme.aktif = aktif;
    if (typeof cooldownSn === 'number') guncelleme.cooldownSn = cooldownSn;

    const sonuc = await komutAyariGuncelle(req.params.guildId, req.params.isim, guncelleme);
    res.json(sonuc);
});

// ────────────────────────────────────────────
// ÖNERİLER
// ────────────────────────────────────────────
router.get('/guild/:guildId/oneriler', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const guild = guildGetir(req, res);
    if (!guild) return;

    const [bekleyen, kabul, reddedilen, sonOneriler] = await Promise.all([
        Oneri.countDocuments({ guildId: guild.id, durum: 'bekliyor' }),
        Oneri.countDocuments({ guildId: guild.id, durum: 'kabul' }),
        Oneri.countDocuments({ guildId: guild.id, durum: 'reddedildi' }),
        Oneri.find({ guildId: guild.id }).sort({ createdAt: -1 }).limit(20)
    ]);

    res.json({ bekleyen, kabul, reddedilen, sonOneriler });
});

// ────────────────────────────────────────────
// ÇEKİLİŞLER
// ────────────────────────────────────────────
router.get('/guild/:guildId/cekilisler', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const guild = guildGetir(req, res);
    if (!guild) return;

    const [aktif, bitmis, liste] = await Promise.all([
        Cekilis.countDocuments({ guildId: guild.id, durum: 'aktif' }),
        Cekilis.countDocuments({ guildId: guild.id, durum: 'bitti' }),
        Cekilis.find({ guildId: guild.id }).sort({ createdAt: -1 }).limit(20)
    ]);

    res.json({ aktif, bitmis, liste });
});

// ────────────────────────────────────────────
// SEVİYE LİDERLİK TABLOSU
// ────────────────────────────────────────────
router.get('/guild/:guildId/seviye-liderlik', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const guild = guildGetir(req, res);
    if (!guild) return;

    const siralama = await Seviye.find({ guildId: guild.id }).sort({ seviye: -1, xp: -1 }).limit(10);
    res.json(siralama);
});

// ────────────────────────────────────────────
// MÜZİK (gerçek zamanlı, muzikService'ten canlı okunur)
// ────────────────────────────────────────────
router.get('/guild/:guildId/muzik', girisGerekli, guildYetkisiKontrol, (req, res) => {
    const { guildDurumuGetir } = require('../../services/muzikService');
    const durum = guildDurumuGetir(req.params.guildId);

    if (!durum) {
        return res.json({ aktif: false, suAnCalan: null, kuyruk: [], sesSeviye: 0, dongu: 'kapali' });
    }

    res.json({
        aktif: true,
        suAnCalan: durum.suAnCalan,
        kuyruk: durum.kuyruk.slice(0, 25),
        sesSeviye: durum.sesSeviye,
        dongu: durum.dongu,
        durduruldu: durum.player.state.status === 'paused'
    });
});

// ────────────────────────────────────────────
// ANALİTİK
// ────────────────────────────────────────────
router.get('/guild/:guildId/analitik', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const guild = guildGetir(req, res);
    if (!guild) return;

    const [ekonomiKayitSayisi, tagSayisi, seviyeKayitSayisi, en10Ekonomi] = await Promise.all([
        Ekonomi.countDocuments({ guildId: guild.id }),
        Tag.countDocuments({ guildId: guild.id }),
        Seviye.countDocuments({ guildId: guild.id }),
        Ekonomi.find({ guildId: guild.id }).sort({ cuzdan: -1 }).limit(10)
    ]);

    res.json({
        ekonomiKullaniciSayisi: ekonomiKayitSayisi,
        tagSayisi,
        xpKazananKullaniciSayisi: seviyeKayitSayisi,
        enZenginler: en10Ekonomi
    });
});

// ────────────────────────────────────────────
// BİLDİRİM MERKEZİ (son gerçek etkinlikler)
// ────────────────────────────────────────────
router.get('/guild/:guildId/bildirimler', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const guild = guildGetir(req, res);
    if (!guild) return;

    const [sonUyarilar, sonTicketlar, sonCekilisler, sonOneriler] = await Promise.all([
        Warn.find({ guildId: guild.id }).sort({ createdAt: -1 }).limit(5),
        Ticket.find({ guildId: guild.id }).sort({ createdAt: -1 }).limit(5),
        Cekilis.find({ guildId: guild.id }).sort({ createdAt: -1 }).limit(3),
        Oneri.find({ guildId: guild.id }).sort({ createdAt: -1 }).limit(3)
    ]);

    const bildirimler = [
        ...sonUyarilar.map(u => ({ tip: 'uyarı', metin: `<@${u.kullaniciId}> kullanıcısına uyarı verildi (#${u.caseNo})`, tarih: u.createdAt })),
        ...sonTicketlar.map(t => ({ tip: 'ticket', metin: `Ticket #${t.ticketNo} ${t.durum === 'kapali' ? 'kapatıldı' : 'açıldı'}`, tarih: t.updatedAt })),
        ...sonCekilisler.map(c => ({ tip: 'çekiliş', metin: `"${c.odul}" çekilişi ${c.durum === 'aktif' ? 'başlatıldı' : 'sona erdi'}`, tarih: c.updatedAt })),
        ...sonOneriler.map(o => ({ tip: 'öneri', metin: `Yeni öneri: "${o.icerik.slice(0, 40)}${o.icerik.length > 40 ? '…' : ''}"`, tarih: o.createdAt }))
    ].sort((a, b) => new Date(b.tarih) - new Date(a.tarih)).slice(0, 10);

    res.json(bildirimler);
});

// ────────────────────────────────────────────
// WELCOME / AUTOROLE / ROL PANELİ
// ────────────────────────────────────────────
router.get('/guild/:guildId/welcome', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const { welcomeAyariGetir, YER_TUTUCULAR } = require('../../services/welcomeService');
    const ayar = await welcomeAyariGetir(req.params.guildId);
    res.json({ ayar, yerTutucular: YER_TUTUCULAR });
});

router.patch('/guild/:guildId/welcome', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const { welcomeAyariGuncelle } = require('../../services/welcomeService');

    // Yalnızca bilinen alanların güncellenmesine izin ver
    const izinli = /^(kanal|dm|ayrilis|kart)\.[a-zA-ZğüşöçİĞÜŞÖÇ]+$/;
    const guncelleme = {};
    for (const [anahtar, deger] of Object.entries(req.body)) {
        if (izinli.test(anahtar)) guncelleme[anahtar] = deger;
    }

    if (!Object.keys(guncelleme).length) {
        return res.status(400).json({ hata: 'Geçerli bir ayar alanı gönderilmedi.' });
    }

    res.json(await welcomeAyariGuncelle(req.params.guildId, guncelleme));
});

router.post('/guild/:guildId/welcome/test', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const guild = guildGetir(req, res);
    if (!guild) return;

    const uye = await guild.members.fetch(req.user.id).catch(() => null);
    if (!uye) return res.status(404).json({ hata: 'Bu sunucuda üye kaydınız bulunamadı.' });

    const { welcomeGonder } = require('../../services/uyeKatilimService');
    await welcomeGonder(uye, true);
    res.json({ basarili: true });
});

router.get('/guild/:guildId/autorole', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const Autorole = require('../../database/models/Autorole');
    const ayar = await Autorole.findOne({ guildId: req.params.guildId });
    res.json(ayar || { guildId: req.params.guildId, aktif: false, kurallar: [] });
});

router.patch('/guild/:guildId/autorole', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const Autorole = require('../../database/models/Autorole');
    const { aktif } = req.body;

    if (typeof aktif !== 'boolean') {
        return res.status(400).json({ hata: 'aktif alanı boolean olmalıdır.' });
    }

    res.json(await Autorole.findOneAndUpdate({ guildId: req.params.guildId }, { aktif }, { upsert: true, new: true }));
});

router.get('/guild/:guildId/rolpanel', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const RolPaneli = require('../../database/models/RolPaneli');
    res.json(await RolPaneli.find({ guildId: req.params.guildId }).limit(30));
});


// ────────────────────────────────────────────
// DENETİM KAYDI / BRANDING / ONAY
// ────────────────────────────────────────────
router.get('/guild/:guildId/audit', girisGerekli, guildYetkisiKontrol, kritikYetkiKontrol, async (req, res) => {
    const { auditListele } = require('../../services/auditService');
    const sayfa = Math.max(0, parseInt(req.query.sayfa, 10) || 0);
    res.json(await auditListele(req.params.guildId, { sayfa, limit: 25 }));
});

router.get('/guild/:guildId/branding', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const { brandingGetir } = require('../../services/brandingService');
    res.json(await brandingGetir(req.params.guildId));
});

router.patch('/guild/:guildId/branding', girisGerekli, guildYetkisiKontrol, kritikYetkiKontrol, async (req, res) => {
    const { brandingGuncelle, brandingGetir } = require('../../services/brandingService');

    const ALANLAR = ['botAdi', 'embedRengi', 'altBilgi', 'logoUrl', 'panelBasligi', 'destekUrl', 'siteUrl'];
    const UZUNLUK = { botAdi: 32, altBilgi: 100, panelBasligi: 64 };
    const guncelleme = {};

    for (const alan of ALANLAR) {
        if (!(alan in req.body)) continue;
        let deger = req.body[alan];

        if (deger === null || deger === '') { guncelleme[alan] = null; continue; }
        if (typeof deger !== 'string') return res.status(400).json({ hata: `${alan} metin olmalıdır.` });

        deger = deger.trim();
        if (UZUNLUK[alan] && deger.length > UZUNLUK[alan]) {
            return res.status(400).json({ hata: `${alan} en fazla ${UZUNLUK[alan]} karakter olabilir.` });
        }
        if (alan === 'embedRengi' && !/^#[0-9A-Fa-f]{6}$/.test(deger)) {
            return res.status(400).json({ hata: 'Embed rengi #RRGGBB formatında olmalıdır.' });
        }
        if (['logoUrl', 'destekUrl', 'siteUrl'].includes(alan) && !/^https:\/\//.test(deger)) {
            return res.status(400).json({ hata: `${alan} https:// ile başlamalıdır.` });
        }

        guncelleme[alan] = deger;
    }

    if (!Object.keys(guncelleme).length) {
        return res.status(400).json({ hata: 'Geçerli bir alan gönderilmedi.' });
    }

    const oncesi = await brandingGetir(req.params.guildId);
    const sonuc = await brandingGuncelle(req.params.guildId, guncelleme);

    auditYaz({
        guildId: req.params.guildId,
        kullaniciId: req.user.id,
        kullaniciEtiketi: req.user.username,
        islem: 'Marka ayarları güncellendi',
        kaynak: 'dashboard',
        hedef: Object.keys(guncelleme).join(', '),
        eskiDeger: Object.keys(guncelleme).map(a => oncesi[a]).join(' | '),
        yeniDeger: Object.values(guncelleme).join(' | ')
    });

    res.json(sonuc);
});

router.get('/guild/:guildId/onay', girisGerekli, guildYetkisiKontrol, async (req, res) => {
    const { onayDurumu } = require('../../services/sartOnayService');
    const { sartlarVersiyonu, gizlilikVersiyonu } = require('../../utils/sartlar');
    const durum = await onayDurumu(req.params.guildId);

    res.json({
        kabulEdildi: durum.kabulEdildi,
        surumEskimis: durum.surumEskimis,
        onboardingTamamlandi: durum.onboardingTamamlandi,
        kabulTarihi: durum.kayit?.kabulTarihi || null,
        kabulEdenId: durum.kayit?.kabulEdenId || null,
        guncelSartlarVersiyonu: sartlarVersiyonu,
        guncelGizlilikVersiyonu: gizlilikVersiyonu
    });
});

router.post('/guild/:guildId/onay', girisGerekli, guildYetkisiKontrol, kritikYetkiKontrol, async (req, res) => {
    const { onayKaydet } = require('../../services/sartOnayService');
    const kayit = await onayKaydet(req.params.guildId, req.user.id, 'dashboard');

    auditYaz({
        guildId: req.params.guildId,
        kullaniciId: req.user.id,
        kullaniciEtiketi: req.user.username,
        islem: 'Hizmet şartları kabul edildi',
        kaynak: 'dashboard',
        yeniDeger: `v${kayit.sartlarVersiyonu}`
    });

    res.json({ kabulEdildi: true });
});

module.exports = router;
