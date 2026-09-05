const {
    SlashCommandBuilder, PermissionFlagsBits, ChannelType,
    ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags
} = require('discord.js');
const { temelEmbed } = require('../../../utils/embedOlustur');
const emojis = require('../../../utils/emojis');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('duyuru')
        .setDescription('Belirtilen kanala resmi bir duyuru gönderir.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addChannelOption(o => o.setName('kanal').setDescription('Duyurunun gönderileceği kanal').addChannelTypes(ChannelType.GuildText).setRequired(true))
        .addStringOption(o => o.setName('başlık').setDescription('Duyuru başlığı').setRequired(true))
        .addStringOption(o => o.setName('içerik').setDescription('Duyuru içeriği').setRequired(true))
        .addRoleOption(o => o.setName('etiketle').setDescription('Duyuruda etiketlenecek rol').setRequired(false)),
    kategori: 'duyuru',

    async execute(client, interaction) {
        const kanal = interaction.options.getChannel('kanal');
        const baslik = interaction.options.getString('başlık');
        const icerik = interaction.options.getString('içerik');
        const rol = interaction.options.getRole('etiketle');

        const konteyner = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${emojis.duyuru} ${baslik}`))
            .addSeparatorComponents(new SeparatorBuilder())
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(icerik))
            .addSeparatorComponents(new SeparatorBuilder())
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`*Duyuran: ${interaction.user}*`));

        await kanal.send({
            content: rol ? `${rol}` : undefined,
            components: [konteyner],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { roles: rol ? [rol.id] : [] }
        });

        await interaction.reply({ embeds: [temelEmbed({ tip: 'basari', baslik: `${emojis.basari} Duyuru Gönderildi`, aciklama: `Duyurunuz ${kanal} kanalına gönderildi.` })], flags: 64 });
    }
};
