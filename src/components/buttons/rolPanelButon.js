const { butonRolDegistir } = require('../../services/rolPaneliService');
module.exports = { customId: 'rolpanel:buton', execute: (client, interaction) => butonRolDegistir(interaction) };
