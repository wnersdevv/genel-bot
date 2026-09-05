const RolPaneli = require('../database/models/RolPaneli');
const { temelEmbed } = require('../utils/embedOlustur');
const emojis = require('../utils/emojis');

function rolVerilebilirMi(guild, rol) {
    return rol && !rol.managed && rol.position < guild.members.me.roles.highest.position;
}

/** Buton tabanlı panelde tek bir rolü açıp kapatır. */
async function butonRolDegistir(interaction) {
    const rolId = interaction.customId.split(':')[2];
    const panel = await RolPaneli.findOne({ mesajId: interaction.message.id });

    if (!panel || !panel.secenekler.some(s => s.rolId === rolId)) {
        return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Panel Geçersiz` })], flags: 64 });
    }

    const rol = interaction.guild.roles.cache.get(rolId);
    if (!rolVerilebilirMi(interaction.guild, rol)) {
        return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Rol Verilemiyor`, aciklama: 'Bu rol benim rolümden üstte veya yönetilen bir rol.' })], flags: 64 });
    }

    const sahipMi = interaction.member.roles.cache.has(rolId);

    if (sahipMi) {
        await interaction.member.roles.remove(rol);
        return interaction.reply({ embeds: [temelEmbed({ tip: 'uyari', baslik: `${emojis.rol} Rol Alındı`, aciklama: `${rol} rolü kaldırıldı.` })], flags: 64 });
    }

    if (panel.tekliSecim) {
        const digerler = panel.secenekler.filter(s => s.rolId !== rolId).map(s => s.rolId);
        await interaction.member.roles.remove(digerler.filter(id => interaction.member.roles.cache.has(id))).catch(() => {});
    }

    await interaction.member.roles.add(rol);
    await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.rol} Rol Verildi`, aciklama: `${rol} rolü eklendi.` })], flags: 64 });
}

/** Select menü tabanlı panelde seçime göre rolleri senkronlar. */
async function menuRolDegistir(interaction) {
    const panel = await RolPaneli.findOne({ mesajId: interaction.message.id });
    if (!panel) {
        return interaction.reply({ embeds: [temelEmbed({ tip: 'hata', baslik: `${emojis.hata} Panel Geçersiz` })], flags: 64 });
    }

    const secilenler = interaction.values;
    const eklenen = [];
    const cikarilan = [];

    for (const secenek of panel.secenekler) {
        const rol = interaction.guild.roles.cache.get(secenek.rolId);
        if (!rolVerilebilirMi(interaction.guild, rol)) continue;

        const sahipMi = interaction.member.roles.cache.has(rol.id);
        const secildiMi = secilenler.includes(rol.id);

        if (secildiMi && !sahipMi) {
            await interaction.member.roles.add(rol).catch(() => {});
            eklenen.push(rol.name);
        } else if (!secildiMi && sahipMi) {
            await interaction.member.roles.remove(rol).catch(() => {});
            cikarilan.push(rol.name);
        }
    }

    const parcalar = [];
    if (eklenen.length) parcalar.push(`**Eklenen:** ${eklenen.join(', ')}`);
    if (cikarilan.length) parcalar.push(`**Çıkarılan:** ${cikarilan.join(', ')}`);

    await interaction.reply({
        embeds: [temelEmbed({
            tip: 'basari',
            baslik: `${emojis.rol} Roller Güncellendi`,
            aciklama: parcalar.join('\n') || 'Herhangi bir değişiklik yapılmadı.'
        })],
        flags: 64
    });
}

module.exports = { butonRolDegistir, menuRolDegistir };
