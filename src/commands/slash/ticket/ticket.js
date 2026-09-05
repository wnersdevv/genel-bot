const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const Ticket = require('../../../database/models/Ticket');
const { guildAyariGuncelle, guildAyariGetir } = require('../../../services/guildService');
const { ticketYetkisiKontrol, transkriptOlustur } = require('../../../services/ticketService');
const { ticketKapat } = require('../../../services/ticketKapatService');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

const DURUM_ETIKET = { acik: '🟢 Açık', kilitli: '🔒 Kilitli', kapali: '⚫ Kapalı' };

const yetkisizYanit = (interaction, hata) => interaction.reply({
    embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} İşlem Yapılamadı`, aciklama: hata })],
    flags: 64
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Ticket sistemini yönetir.')
        .addSubcommand(s => s.setName('kapat').setDescription('Bu ticketı kapatır.')
            .addStringOption(o => o.setName('sebep').setDescription('Kapatma sebebi')))
        .addSubcommand(s => s.setName('ekle').setDescription('Bu ticketa bir kullanıcı ekler.')
            .addUserOption(o => o.setName('kullanıcı').setDescription('Eklenecek kullanıcı').setRequired(true)))
        .addSubcommand(s => s.setName('çıkar').setDescription('Bu tickettan bir kullanıcıyı çıkarır.')
            .addUserOption(o => o.setName('kullanıcı').setDescription('Çıkarılacak kullanıcı').setRequired(true)))
        .addSubcommand(s => s.setName('devret').setDescription('Ticket sahipliğini devreder.')
            .addUserOption(o => o.setName('kullanıcı').setDescription('Yeni ticket sahibi').setRequired(true)))
        .addSubcommand(s => s.setName('kilitle').setDescription('Ticketı kilitler; sahibi mesaj gönderemez.'))
        .addSubcommand(s => s.setName('aç').setDescription('Kilitli ticketı yeniden açar.'))
        .addSubcommand(s => s.setName('transkript').setDescription('Ticketın mesaj dökümünü verir.'))
        .addSubcommand(s => s.setName('liste').setDescription('Sunucudaki ticketları listeler.')
            .addStringOption(o => o.setName('durum').setDescription('Duruma göre filtrele')
                .addChoices({ name: 'Açık', value: 'acik' }, { name: 'Kilitli', value: 'kilitli' }, { name: 'Kapalı', value: 'kapali' })))
        .addSubcommand(s => s.setName('kur').setDescription('Bu kanala ticket açma paneli kurar.'))
        .addSubcommand(s => s.setName('ayarla').setDescription('Ticket sistemini yapılandırır.')
            .addChannelOption(o => o.setName('kategori').setDescription('Ticketların açılacağı kategori').addChannelTypes(ChannelType.GuildCategory))
            .addRoleOption(o => o.setName('yetkili-rol').setDescription('Ticketları görebilecek rol'))
            .addChannelOption(o => o.setName('transkript-kanalı').setDescription('Kapatılan ticket kayıtları').addChannelTypes(ChannelType.GuildText))
            .addIntegerOption(o => o.setName('maksimum-ticket').setDescription('Kullanıcı başına açık ticket limiti').setMinValue(1).setMaxValue(25))),
    kategori: 'ticket',

    async execute(client, interaction) {
        const altKomut = interaction.options.getSubcommand();

        if (altKomut === 'kur') return this.kur(interaction);
        if (altKomut === 'ayarla') return this.ayarla(interaction);
        if (altKomut === 'liste') return this.liste(interaction);

        // Kalan alt komutlar bir ticket kanalı içinde çalışır
        const sadeceYetkili = ['kilitle', 'aç'].includes(altKomut);
        const { ticket, izinli, yetkili, hata } = await ticketYetkisiKontrol(interaction, sadeceYetkili);

        if (!ticket) return yetkisizYanit(interaction, 'Bu kanal bir ticket değil.');
        if (sadeceYetkili ? !yetkili : !izinli) return yetkisizYanit(interaction, hata);

        switch (altKomut) {
            case 'kapat': return this.kapat(interaction, ticket);
            case 'ekle': return this.ekle(interaction, ticket);
            case 'çıkar': return this.cikar(interaction, ticket);
            case 'devret': return this.devret(interaction, ticket);
            case 'kilitle': return this.kilitle(interaction, ticket);
            case 'aç': return this.acKilit(interaction, ticket);
            case 'transkript': return this.transkript(interaction, ticket);
        }
    },

    async kur(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return yetkisizYanit(interaction, 'Bu işlem için "Sunucuyu Yönet" yetkisi gerekir.');
        }

        const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
        const KATEGORILER = [
            { deger: 'destek', etiket: '🎫 Destek' }, { deger: 'teknik', etiket: '🔧 Teknik' },
            { deger: 'satin-alma', etiket: '🛒 Satın Alma' }, { deger: 'sikayet', etiket: '⚠️ Şikayet' },
            { deger: 'is-birligi', etiket: '🤝 İş Birliği' }, { deger: 'diger', etiket: '📁 Diğer' }
        ];

        const menu = new StringSelectMenuBuilder()
            .setCustomId('ticket:kategori-sec')
            .setPlaceholder('Bir kategori seçin...')
            .addOptions(KATEGORILER.map(k => ({ label: k.etiket, value: k.deger })));

        await interaction.channel.send({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.ticket} Destek Talebi Oluştur`,
                aciklama: 'Aşağıdaki menüden talebinizin kategorisini seçerek yeni bir ticket açabilirsiniz. Yetkili ekibimiz en kısa sürede size dönüş yapacaktır.'
            })],
            components: [new ActionRowBuilder().addComponents(menu)]
        });

        await interaction.reply({ content: `${emojis.basari} Ticket paneli bu kanala kuruldu.`, flags: 64 });
    },

    async ayarla(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return yetkisizYanit(interaction, 'Bu işlem için "Sunucuyu Yönet" yetkisi gerekir.');
        }

        const kategori = interaction.options.getChannel('kategori');
        const yetkiliRol = interaction.options.getRole('yetkili-rol');
        const transkriptKanali = interaction.options.getChannel('transkript-kanalı');
        const maksimum = interaction.options.getInteger('maksimum-ticket');

        if (!kategori && !yetkiliRol && !transkriptKanali && !maksimum) {
            return interaction.reply({
                embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.uyari} Hiçbir Ayar Belirtilmedi`, aciklama: 'En az bir seçenek girmelisiniz.' })],
                flags: 64
            });
        }

        const guncelleme = {};
        if (kategori) guncelleme['ticketAyar.kategoriId'] = kategori.id;
        if (transkriptKanali) guncelleme['ticketAyar.transkriptKanaliId'] = transkriptKanali.id;
        if (maksimum) guncelleme['ticketAyar.maksimumAcikTicket'] = maksimum;

        if (yetkiliRol) {
            const mevcut = await guildAyariGetir(interaction.guild.id);
            const roller = new Set(mevcut.roller?.ticketYetkili || []);
            roller.add(yetkiliRol.id);
            guncelleme['roller.ticketYetkili'] = [...roller];
        }

        await guildAyariGuncelle(interaction.guild.id, guncelleme);

        const satirlar = [];
        if (kategori) satirlar.push(`**Kategori:** ${kategori}`);
        if (yetkiliRol) satirlar.push(`**Yetkili Rol eklendi:** ${yetkiliRol}`);
        if (transkriptKanali) satirlar.push(`**Transkript Kanalı:** ${transkriptKanali}`);
        if (maksimum) satirlar.push(`**Maksimum Açık Ticket:** ${maksimum}`);

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.ticket} Ticket Ayarları Güncellendi`, aciklama: satirlar.join('\n') })]
        });
    },

    async liste(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return yetkisizYanit(interaction, 'Bu işlem için "Mesajları Yönet" yetkisi gerekir.');
        }

        const durum = interaction.options.getString('durum');
        const ticketlar = await Ticket.find({
            guildId: interaction.guild.id, ...(durum ? { durum } : {})
        }).sort({ ticketNo: -1 }).limit(20);

        if (ticketlar.length === 0) {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'bilgi', baslik: `${emojis.ticket} Ticketlar`, aciklama: 'Kayıt bulunamadı.' })], flags: 64 });
        }

        await interaction.reply({
            embeds: [temelEmbed({
                tip: 'bilgi',
                baslik: `${emojis.ticket} Ticketlar (${ticketlar.length})`,
                aciklama: ticketlar.map(t => `**#${t.ticketNo}** ${DURUM_ETIKET[t.durum]} — <@${t.sahipId}> — ${t.kategori}`).join('\n')
            })],
            flags: 64
        });
    },

    async kapat(interaction, ticket) {
        if (ticket.durum === 'kapali') {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.uyari} Zaten Kapalı` })], flags: 64 });
        }
        await ticketKapat(interaction, ticket, interaction.options.getString('sebep'));
    },

    async ekle(interaction, ticket) {
        const hedef = interaction.options.getUser('kullanıcı');
        await interaction.channel.permissionOverwrites.edit(hedef.id, {
            ViewChannel: true, SendMessages: true, ReadMessageHistory: true
        });
        await Ticket.updateOne({ kanalId: interaction.channel.id }, { $addToSet: { eklenenKullanicilar: hedef.id } });

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Kullanıcı Eklendi`, aciklama: `${hedef} bu ticketa eklendi.` })]
        });
    },

    async cikar(interaction, ticket) {
        const hedef = interaction.options.getUser('kullanıcı');
        if (hedef.id === ticket.sahipId) {
            return yetkisizYanit(interaction, 'Ticket sahibini tickettan çıkaramazsınız.');
        }

        await interaction.channel.permissionOverwrites.delete(hedef.id).catch(() => {});
        await Ticket.updateOne({ kanalId: interaction.channel.id }, { $pull: { eklenenKullanicilar: hedef.id } });

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Kullanıcı Çıkarıldı`, aciklama: `${hedef} bu tickettan çıkarıldı.` })]
        });
    },

    async devret(interaction, ticket) {
        const hedef = interaction.options.getUser('kullanıcı');
        if (hedef.bot) return yetkisizYanit(interaction, 'Bir bota sahiplik devredemezsiniz.');

        await interaction.channel.permissionOverwrites.edit(hedef.id, {
            ViewChannel: true, SendMessages: true, ReadMessageHistory: true
        });

        ticket.sahipId = hedef.id;
        await ticket.save();

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Sahiplik Devredildi`, aciklama: `Ticket #${ticket.ticketNo} sahipliği ${hedef} kullanıcısına devredildi.` })]
        });
    },

    async kilitle(interaction, ticket) {
        await interaction.channel.permissionOverwrites.edit(ticket.sahipId, { SendMessages: false }).catch(() => {});
        ticket.durum = 'kilitli';
        await ticket.save();

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.kilit} Ticket Kilitlendi`, aciklama: 'Yeniden açmak için `/ticket aç` kullanılabilir.' })]
        });
    },

    async acKilit(interaction, ticket) {
        if (ticket.durum !== 'kilitli') {
            return interaction.reply({ embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.uyari} Zaten Açık` })], flags: 64 });
        }

        await interaction.channel.permissionOverwrites.edit(ticket.sahipId, { SendMessages: true }).catch(() => {});
        ticket.durum = 'acik';
        await ticket.save();

        await interaction.reply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.kilitAcik} Ticket Yeniden Açıldı`, aciklama: 'Ticket sahibi artık tekrar mesaj gönderebilir.' })]
        });
    },

    async transkript(interaction, ticket) {
        await interaction.deferReply({ flags: 64 });
        const transkript = await transkriptOlustur(interaction.channel);

        await interaction.editReply({
            embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.ticketTranskript} Transkript Hazır`, aciklama: `Ticket #${ticket.ticketNo} dökümü aşağıda.` })],
            files: [{ attachment: Buffer.from(transkript, 'utf-8'), name: `ticket-${ticket.ticketNo}.txt` }]
        });
    }
};
