/**
 * src/utils/komutMeta.js
 * Bir komutun kendi option tanımlarından okunabilir kullanım satırı,
 * örnek kullanım ve parametre listesi üretir. Böylece bu bilgiler elle
 * yazılmaz, komut değişince otomatik güncellenir.
 */

const { ApplicationCommandOptionType, PermissionsBitField } = require('discord.js');

const TIP_ISIMLERI = {
    [ApplicationCommandOptionType.String]: 'metin',
    [ApplicationCommandOptionType.Integer]: 'sayı',
    [ApplicationCommandOptionType.Number]: 'sayı',
    [ApplicationCommandOptionType.Boolean]: 'evet/hayır',
    [ApplicationCommandOptionType.User]: 'kullanıcı',
    [ApplicationCommandOptionType.Channel]: 'kanal',
    [ApplicationCommandOptionType.Role]: 'rol',
    [ApplicationCommandOptionType.Mentionable]: 'kullanıcı/rol'
};

const ORNEK_DEGERLER = {
    [ApplicationCommandOptionType.String]: 'metin',
    [ApplicationCommandOptionType.Integer]: '10',
    [ApplicationCommandOptionType.Number]: '10',
    [ApplicationCommandOptionType.Boolean]: 'evet',
    [ApplicationCommandOptionType.User]: '@kullanıcı',
    [ApplicationCommandOptionType.Channel]: '#kanal',
    [ApplicationCommandOptionType.Role]: '@rol',
    [ApplicationCommandOptionType.Mentionable]: '@kullanıcı'
};

/** İzin bit maskesini okunabilir Türkçe yetki listesine çevirir. */
const YETKI_ISIMLERI = {
    Administrator: 'Yönetici',
    ManageGuild: 'Sunucuyu Yönet',
    ManageMessages: 'Mesajları Yönet',
    ManageChannels: 'Kanalları Yönet',
    ManageRoles: 'Rolleri Yönet',
    ModerateMembers: 'Üyeleri Zaman Aşımına Uğrat',
    KickMembers: 'Üyeleri At',
    BanMembers: 'Üyeleri Yasakla'
};

function yetkileriCevir(izinBitleri) {
    if (!izinBitleri) return 'Herkes';

    try {
        const izinler = new PermissionsBitField(BigInt(izinBitleri)).toArray();
        const cevrilmis = izinler.map(i => YETKI_ISIMLERI[i] || i);
        return cevrilmis.length ? cevrilmis.join(', ') : 'Herkes';
    } catch {
        return 'Herkes';
    }
}

/**
 * @param {object} komut  Yüklenmiş komut nesnesi
 * @param {boolean} slashMi  Discord'a kayıtlı mı (yoksa yalnızca prefix mi)
 * @param {string} prefix  Sunucunun prefix'i (örnek üretiminde kullanılır)
 */
function komutMetaOlustur(komut, slashMi, prefix = '!') {
    const veri = komut.data.toJSON ? komut.data.toJSON() : komut.data;
    const optionlar = (veri.options || []).filter(o =>
        o.type !== ApplicationCommandOptionType.Subcommand &&
        o.type !== ApplicationCommandOptionType.SubcommandGroup
    );

    const kullanimParcalari = optionlar.map(o =>
        o.required ? `<${o.name}>` : `[${o.name}]`
    );

    const ornekParcalari = optionlar
        .filter(o => o.required)
        .map(o => ORNEK_DEGERLER[o.type] || 'değer');

    return {
        isim: veri.name,
        açıklama: veri.description,
        kategori: komut.kategori,
        slashMi,
        cooldown: komut.cooldownSn ?? 3,
        geliştiriciKomutuMu: Boolean(komut.geliştiriciKomutu),
        prefixDestekliMi: !komut.modalKullanir,
        aliaslar: komut.aliaslar || [],
        gerekliYetki: yetkileriCevir(veri.default_member_permissions),
        kullanım: `${veri.name}${kullanimParcalari.length ? ' ' + kullanimParcalari.join(' ') : ''}`,
        örnek: `${prefix}${veri.name}${ornekParcalari.length ? ' ' + ornekParcalari.join(' ') : ''}`,
        parametreler: optionlar.map(o => ({
            isim: o.name,
            açıklama: o.description,
            tip: TIP_ISIMLERI[o.type] || 'değer',
            zorunlu: Boolean(o.required),
            seçenekler: (o.choices || []).map(c => c.name)
        }))
    };
}

module.exports = { komutMetaOlustur };
