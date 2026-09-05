/**
 * wnersdev Dashboard - Basit API çağrı yardımcıları.
 */
window.wnersdevApi = {
    async al(url) {
        const yanit = await fetch(url);
        if (!yanit.ok) throw new Error((await yanit.json().catch(() => ({}))).hata || 'İstek başarısız.');
        return yanit.json();
    },
    async gonder(url, method, gövde) {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
        const yanit = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
            body: gövde ? JSON.stringify(gövde) : undefined
        });
        if (!yanit.ok) throw new Error((await yanit.json().catch(() => ({}))).hata || 'İstek başarısız.');
        return yanit.json();
    },
    sayiFormat(n) {
        return new Intl.NumberFormat('tr-TR').format(n ?? 0);
    },
    zamanOnce(tarih) {
        const fark = Date.now() - new Date(tarih).getTime();
        const dk = Math.floor(fark / 60000);
        if (dk < 1) return 'az önce';
        if (dk < 60) return `${dk} dk önce`;
        const saat = Math.floor(dk / 60);
        if (saat < 24) return `${saat} sa önce`;
        return `${Math.floor(saat / 24)} gün önce`;
    }
};
