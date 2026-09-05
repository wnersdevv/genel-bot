const { AuditLogEvent } = require('discord.js');
const { nukeDenetimi } = require('../services/korumaService');

/**
 * Anti-nuke için izlenen Discord olayları.
 * Her olay, sorumluyu denetim kaydından bulup eşik kontrolünden geçirir.
 */
const OLAYLAR = [
    { isim: 'channelDelete', alanAdi: 'kanalSilme', auditTipi: AuditLogEvent.ChannelDelete, tipEtiketi: 'Toplu kanal silme', hedefli: true },
    { isim: 'channelCreate', alanAdi: 'kanalOlusturma', auditTipi: AuditLogEvent.ChannelCreate, tipEtiketi: 'Toplu kanal oluşturma', hedefli: true },
    { isim: 'roleDelete', alanAdi: 'rolSilme', auditTipi: AuditLogEvent.RoleDelete, tipEtiketi: 'Toplu rol silme', hedefli: true },
    { isim: 'roleCreate', alanAdi: 'rolOlusturma', auditTipi: AuditLogEvent.RoleCreate, tipEtiketi: 'Toplu rol oluşturma', hedefli: true },
    { isim: 'guildBanAdd', alanAdi: 'banAtma', auditTipi: AuditLogEvent.MemberBanAdd, tipEtiketi: 'Toplu yasaklama', hedefli: false },
    { isim: 'webhookUpdate', alanAdi: 'webhook', auditTipi: AuditLogEvent.WebhookCreate, tipEtiketi: 'Webhook oluşturma', hedefli: false }
];

module.exports = {
    isim: 'ready',
    birKere: true,
    execute(client) {
        for (const olay of OLAYLAR) {
            client.on(olay.isim, (kaynak) => {
                const guild = kaynak?.guild;
                if (!guild) return;

                nukeDenetimi(guild, {
                    alanAdi: olay.alanAdi,
                    auditTipi: olay.auditTipi,
                    tipEtiketi: olay.tipEtiketi,
                    hedefId: olay.hedefli ? kaynak.id : null
                }).catch(() => {});
            });
        }

        // Rol yetkisi yükseltme denetimi
        client.on('roleUpdate', (eski, yeni) => {
            const tehlikeliYetkiler = ['Administrator', 'ManageGuild', 'ManageRoles', 'BanMembers'];
            const yeniTehlikeli = tehlikeliYetkiler.some(y => !eski.permissions.has(y) && yeni.permissions.has(y));
            if (!yeniTehlikeli) return;

            nukeDenetimi(yeni.guild, {
                alanAdi: 'yetkiYukseltme',
                auditTipi: AuditLogEvent.RoleUpdate,
                tipEtiketi: 'Yetki yükseltme',
                hedefId: yeni.id
            }).catch(() => {});
        });
    }
};
