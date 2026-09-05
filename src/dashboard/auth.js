const { Strategy: DiscordStrategy } = require('passport-discord');
const config = require('../utils/config');

function pasaportuYapilandir(passport) {
    passport.serializeUser((kullanici, done) => done(null, kullanici));
    passport.deserializeUser((kullanici, done) => done(null, kullanici));

    passport.use(new DiscordStrategy({
        clientID: config.clientId,
        clientSecret: config.discordClientSecret,
        callbackURL: `${config.dashboardUrl}/auth/discord/callback`,
        scope: ['identify', 'guilds']
    }, (accessToken, refreshToken, profile, done) => {
        // Sadece kullanıcının YÖNETME yetkisine sahip olduğu sunucuları filtrele.
        // İzin bitmaskinde MANAGE_GUILD = 0x20
        profile.yönetilebilirSunucular = (profile.guilds || []).filter(
            g => (g.permissions & 0x20) === 0x20 || g.owner
        );
        return done(null, profile);
    }));
}

function girisGerekli(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/discord');
}

module.exports = { pasaportuYapilandir, girisGerekli };
