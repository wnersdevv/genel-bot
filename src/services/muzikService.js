/**
 * src/services/muzikService.js
 * Her sunucu için ayrı bir oynatma kuyruğu ve ses bağlantısı tutan
 * merkezi müzik servisi. @discordjs/voice ve play-dl kullanır.
 *
 * ÖNEMLİ: Bu modül gerçek bir Discord ses bağlantısı ve play-dl üzerinden
 * gerçek bir YouTube akışı gerektirir. npm install sonrası ffmpeg'in
 * sistemde (veya ffmpeg-static üzerinden) erişilebilir olması gerekir.
 */

const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    StreamType
} = require('@discordjs/voice');
const playdl = require('play-dl');

// guildId -> { connection, player, kuyruk: [], suAnCalan, sesSeviye, dongu, metinKanaliId }
const oynatmaHaritasi = new Map();

function guildDurumuGetir(guildId) {
    return oynatmaHaritasi.get(guildId) || null;
}

function guildDurumuOlustur(guild, sesKanali, metinKanaliId) {
    const connection = joinVoiceChannel({
        channelId: sesKanali.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: true
    });

    const player = createAudioPlayer();
    connection.subscribe(player);

    const durum = {
        connection,
        player,
        kuyruk: [],
        gecmis: [],
        suAnCalan: null,
        sesSeviye: 100,
        dongu: 'kapali', // 'kapali' | 'sarki' | 'kuyruk'
        metinKanaliId
    };

    oynatmaHaritasi.set(guild.id, durum);

    player.on(AudioPlayerStatus.Idle, () => {
        siradakiniCal(guild.id).catch(() => {});
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5_000)
            ]);
        } catch {
            baglantiyiKapat(guild.id);
        }
    });

    return durum;
}

async function sarkiAra(sorgu) {
    if (playdl.yt_validate(sorgu) === 'video') {
        const bilgi = await playdl.video_basic_info(sorgu);
        return { baslik: bilgi.video_details.title, url: bilgi.video_details.url, sureSn: bilgi.video_details.durationInSec };
    }

    const sonuclar = await playdl.search(sorgu, { limit: 1, source: { youtube: 'video' } });
    if (!sonuclar.length) return null;

    const video = sonuclar[0];
    return { baslik: video.title, url: video.url, sureSn: video.durationInSec };
}

async function kuyrugaEkle(guild, sesKanali, metinKanaliId, sarki, ekleyenId) {
    let durum = guildDurumuGetir(guild.id);
    if (!durum) durum = guildDurumuOlustur(guild, sesKanali, metinKanaliId);

    durum.kuyruk.push({ ...sarki, ekleyenId });

    if (!durum.suAnCalan) {
        await siradakiniCal(guild.id);
    }
}

async function siradakiniCal(guildId) {
    const durum = guildDurumuGetir(guildId);
    if (!durum) return;

    if (durum.dongu === 'sarki' && durum.suAnCalan) {
        durum.kuyruk.unshift(durum.suAnCalan);
    } else if (durum.dongu === 'kuyruk' && durum.suAnCalan) {
        durum.kuyruk.push(durum.suAnCalan);
    }

    const siradaki = durum.kuyruk.shift();
    if (!siradaki) {
        durum.suAnCalan = null;
        return;
    }

    if (durum.suAnCalan) {
        durum.gecmis.push(durum.suAnCalan);
        if (durum.gecmis.length > 20) durum.gecmis.shift();
    }

    durum.suAnCalan = siradaki;

    const akis = await playdl.stream(siradaki.url);
    const kaynak = createAudioResource(akis.stream, { inputType: akis.type, inlineVolume: true });
    kaynak.volume?.setVolume(durum.sesSeviye / 100);

    durum.player.play(kaynak);
}

function duraklat(guildId) {
    const durum = guildDurumuGetir(guildId);
    if (!durum) return false;
    return durum.player.pause();
}

function devamEt(guildId) {
    const durum = guildDurumuGetir(guildId);
    if (!durum) return false;
    return durum.player.unpause();
}

function gec(guildId) {
    const durum = guildDurumuGetir(guildId);
    if (!durum) return false;
    durum.player.stop(); // Idle event otomatik olarak sıradakini çalar
    return true;
}

async function oncekineDon(guildId) {
    const durum = guildDurumuGetir(guildId);
    if (!durum || durum.gecmis.length === 0) return false;

    const oncekiSarki = durum.gecmis.pop();
    if (durum.suAnCalan) durum.kuyruk.unshift(durum.suAnCalan);
    durum.kuyruk.unshift(oncekiSarki);
    durum.suAnCalan = null;
    durum.player.stop();
    return true;
}

function sesAyarla(guildId, yuzde) {
    const durum = guildDurumuGetir(guildId);
    if (!durum) return false;
    durum.sesSeviye = Math.max(0, Math.min(200, yuzde));
    return true;
}

function karistir(guildId) {
    const durum = guildDurumuGetir(guildId);
    if (!durum) return false;
    for (let i = durum.kuyruk.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [durum.kuyruk[i], durum.kuyruk[j]] = [durum.kuyruk[j], durum.kuyruk[i]];
    }
    return true;
}

function kuyrukTemizle(guildId) {
    const durum = guildDurumuGetir(guildId);
    if (!durum) return false;
    durum.kuyruk = [];
    return true;
}

function dongu(guildId, mod) {
    const durum = guildDurumuGetir(guildId);
    if (!durum) return false;
    durum.dongu = mod;
    return true;
}

function baglantiyiKapat(guildId) {
    const durum = guildDurumuGetir(guildId);
    if (!durum) return;
    durum.connection.destroy();
    oynatmaHaritasi.delete(guildId);
}

module.exports = {
    guildDurumuGetir,
    sarkiAra,
    kuyrugaEkle,
    siradakiniCal,
    duraklat,
    devamEt,
    gec,
    oncekineDon,
    sesAyarla,
    karistir,
    kuyrukTemizle,
    dongu,
    baglantiyiKapat
};
