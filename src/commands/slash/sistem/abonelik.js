const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const Abonelik = require('../../../database/models/Abonelik');
const { abonelikGetir, abonelikCacheTemizle, PLAN_LIMITLERI } = require('../../../services/abonelikService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');
const ayarlar = require('../../../utils/ayarlar');

const PLAN_ETIKETI = { 'ücretsiz': '🆓 Ücretsiz', 'premium': '💎 Premium', 'ultra': '🚀 Ultra' };

const gelistiriciMi = (id) => ayarlar.sistem.geliştiriciIdleri.includes(id);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('abonelik')
        .setDescription('Abonelik planını görüntüler ve abone rolünü yönetir.')
        .addSubcommand(s => s.setName('durum').setDescription('Sunucunun mevcut abonelik planını gösterir.'))
        .addSubcommand(s => s.setName('rol-ayarla').setDescription('Abonelere otomatik verilecek rolü belirler.')
            .addRoleOption(o => o.setName('rol').setDescription('Abone rolü').setRequired(true)))
        .addSubcommand(s => s.setName('rol-kaldır').setDescription('Abone rolü ayarını kaldırır.'))
        .addSubcommand(s => s.setName('abone-ekle').setDescription('Bir kullanıcıyı aboneler listesine ekler ve rolü verir.')
            .addUserOption(o => o.setName('kullanıcı').setDescription('Abone yapılacak kullanıcı').setRequired(true)))
        .addSubcommand(s => s.setName('abone-çıkar').setDescription('Bir kullanıcıyı abonelikten çıkarır ve rolü alır.')
            .addUserOption(o => o.setName('kullanıcı').setDescription('Çıkarılacak kullanıcı').setRequired(true)))
        .addSubcommand(s => s.setName('abone-liste').setDescription('Sunucudaki aboneleri listeler.'))
        .addSubcommand(s => s.setName('plan-ver').setDescription('[Geliştirici] Bir sunucuya plan tanımlar.')
            .addStringOption(o => o.setName('sunucu-id').setDescription('Hedef sunucu ID').setRequired(true))
            .addStringOption(o => o.setName('plan').setDescription('Plan türü').setRequired(true)
                .addChoices({ name: 'Premium', value: 'premium' }, { name: 'Ultra', value: 'ultra' }, { name: 'Ücretsiz', value: 'ücretsiz' }))
            .addIntegerOption(o => o.setName('gün').setDescription('Kaç gün geçerli (boş = süresiz)'))),
    kategori: 'sistem',

    async execute(client, interaction) {
        const altKomut = interaction.options.getSubcommand();

        if (altKomut === 'durum') return this.durum(interaction);
        if (altKomut === 'plan-ver') return this.planVer(interaction);

        // Kalan alt komutlar sunucu yöneticisi gerektirir
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkisiz`, aciklama: 'Bu işlem için "Sunucuyu Yönet" yetkisi gerekir.' })],
                flags: 64
            });
        }

        switch (altKomut) {
            case 'rol-ayarla': return this.rolAyarla(interaction);
            case 'rol-kaldır': return this.rolKaldir(interaction);
            case 'abone-ekle': return this.aboneEkle(interaction);
            case 'abone-çıkar': return this.aboneCikar(interaction);
            case 'abone-liste': return this.aboneListe(interaction);
        }
    },

    async durum(interaction) {
        const abonelik = await abonelikGetir(interaction.guild.id);
        const limitler = PLAN_LIMITLERI[abonelik.plan];
        const aboneSayisi = abonelik.aboneKullanicilar?.length || 0;

        await interaction.reply({
            embeds: [temelEmbed({
                tip: abonelik.plan === 'ücretsiz' ? 'bilgi' : 'basari',
                baslik: `${emojis.yildiz} Abonelik Durumu`,
                alanlar: [
                    { name: 'Plan', value: PLAN_ETIKETI[abonelik.plan], inline: true },
                    { name: 'Bitiş', value: abonelik.bitisTarihi ? `<t:${Math.floor(new Date(abonelik.bitisTarihi).getTime() / 1000)}:D>` : 'Süresiz / Yok', inline: true },
                    { name: 'Abone Sayısı', value: `${aboneSayisi}`, inline: true },
                    { name: 'Abone Rolü', value: abonelik.aboneRolId ? `<@&${abonelik.aboneRolId}>` : 'Ayarlanmamış', inline: true },
                    { name: 'Mesaj Silme Limiti', value: `${limitler.temizleMax}`, inline: true },
                    { name: 'Açık Ticket Limiti', value: `${limitler.ticketMax}`, inline: true }
                ],
                aciklama: abonelik.plan === 'ücretsiz' ? 'Daha yüksek limitler için Premium/Ultra plana geçebilirsiniz.' : null
            })]
        });
    },

    async rolAyarla(interaction) {
        const rol = interaction.options.getRole('rol');

        if (rol.managed || rol.id === interaction.guild.id) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Geçersiz Rol`, aciklama: 'Bot tarafından yönetilen roller veya @everyone kullanılamaz.' })], flags: 64 });
        }
        if (rol.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Rol Çok Yüksek`, aciklama: 'Bu rol benim en yüksek rolümden üstte, veremem. Botun rolünü yukarı taşıyın.' })], flags: 64 });
        }

        await Abonelik.findOneAndUpdate({ guildId: interaction.guild.id }, { aboneRolId: rol.id }, { upsert: true });
        abonelikCacheTemizle(interaction.guild.id);

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.yildiz} Abone Rolü Ayarlandı`, aciklama: `Abone yapılan kullanıcılara artık ${rol} rolü otomatik verilecek.` })]
        });
    },

    async rolKaldir(interaction) {
        await Abonelik.findOneAndUpdate({ guildId: interaction.guild.id }, { aboneRolId: null }, { upsert: true });
        abonelikCacheTemizle(interaction.guild.id);

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.yildiz} Abone Rolü Kaldırıldı`, aciklama: 'Artık abonelere otomatik rol verilmeyecek. Mevcut roller alınmadı.' })]
        });
    },

    async aboneEkle(interaction) {
        const hedefUye = interaction.options.getMember('kullanıcı');
        if (!hedefUye) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Kullanıcı Bulunamadı` })], flags: 64 });
        }

        const abonelik = await Abonelik.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { $addToSet: { aboneKullanicilar: hedefUye.id } },
            { upsert: true, new: true }
        );
        abonelikCacheTemizle(interaction.guild.id);

        let rolNotu = 'Abone rolü ayarlanmamış.';
        if (abonelik.aboneRolId) {
            const rol = interaction.guild.roles.cache.get(abonelik.aboneRolId);
            if (rol) {
                const eklendi = await hedefUye.roles.add(rol).then(() => true).catch(() => false);
                rolNotu = eklendi ? `${rol} rolü verildi.` : 'Rol verilemedi — yetkimi ve rol sıralamasını kontrol edin.';
            }
        }

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.yildiz} Abone Eklendi`, aciklama: `${hedefUye} abone listesine eklendi.\n${rolNotu}` })]
        });
    },

    async aboneCikar(interaction) {
        const hedefUye = interaction.options.getMember('kullanıcı');
        if (!hedefUye) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Kullanıcı Bulunamadı` })], flags: 64 });
        }

        const abonelik = await Abonelik.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { $pull: { aboneKullanicilar: hedefUye.id } },
            { upsert: true, new: true }
        );
        abonelikCacheTemizle(interaction.guild.id);

        if (abonelik.aboneRolId) {
            const rol = interaction.guild.roles.cache.get(abonelik.aboneRolId);
            if (rol) await hedefUye.roles.remove(rol).catch(() => {});
        }

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.yildiz} Abonelik Kaldırıldı`, aciklama: `${hedefUye} abone listesinden çıkarıldı ve rolü alındı.` })]
        });
    },

    async aboneListe(interaction) {
        const abonelik = await abonelikGetir(interaction.guild.id);
        const aboneler = abonelik.aboneKullanicilar || [];

        if (aboneler.length === 0) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.yildiz} Aboneler`, aciklama: 'Henüz abone yok. `/abonelik abone-ekle` ile ekleyebilirsiniz.' })] });
        }

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.yildiz} Aboneler (${aboneler.length})`,
                aciklama: aboneler.slice(0, 40).map(id => `<@${id}>`).join(', ')
            })]
        });
    },

    async planVer(interaction) {
        if (!gelistiriciMi(interaction.user.id)) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Yetkisiz`, aciklama: 'Bu alt komut yalnızca geliştiriciler içindir.' })], flags: 64 });
        }

        const sunucuId = interaction.options.getString('sunucu-id');
        const plan = interaction.options.getString('plan');
        const gun = interaction.options.getInteger('gün');
        const bitisTarihi = gun ? new Date(Date.now() + gun * 24 * 60 * 60 * 1000) : null;

        await Abonelik.findOneAndUpdate(
            { guildId: sunucuId },
            { plan, baslangicTarihi: new Date(), bitisTarihi, verenId: interaction.user.id },
            { upsert: true }
        );
        abonelikCacheTemizle(sunucuId);

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.yildiz} Plan Tanımlandı`, aciklama: `**${sunucuId}** → **${plan}**${bitisTarihi ? `\nBitiş: <t:${Math.floor(bitisTarihi.getTime() / 1000)}:D>` : '\nSüresiz.'}` })],
            flags: 64
        });
    }
};
