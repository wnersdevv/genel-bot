const { menuRolDegistir } = require('../../services/rolPaneliService');
module.exports = { customId: 'rolpanel:menu', execute: (client, interaction) => menuRolDegistir(interaction) };
