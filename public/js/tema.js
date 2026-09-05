/**
 * wnersdev Dashboard - Tema ve mod (dark/light) yönetimi.
 * Seçimler localStorage'da saklanır, sayfa her açıldığında anında uygulanır.
 */
(function () {
    const kok = document.documentElement;
    const VARSAYILAN_TEMA = 'discord';
    const VARSAYILAN_MOD = 'dark';

    function uygula() {
        const tema = localStorage.getItem('wnersdev_tema') || VARSAYILAN_TEMA;
        const mod = localStorage.getItem('wnersdev_mod') || VARSAYILAN_MOD;
        kok.setAttribute('data-theme', tema);
        kok.setAttribute('data-mode', mod);

        const ozelRenk = localStorage.getItem('wnersdev_ozel_renk');
        if (tema === 'özel' && ozelRenk) {
            kok.style.setProperty('--özel-renk', ozelRenk);
        }
    }

    uygula();

    window.wnersdevTema = {
        temaDegistir(tema) {
            localStorage.setItem('wnersdev_tema', tema);
            uygula();
        },
        modDegistir(mod) {
            localStorage.setItem('wnersdev_mod', mod);
            uygula();
        },
        modToggle() {
            const mevcut = localStorage.getItem('wnersdev_mod') || VARSAYILAN_MOD;
            this.modDegistir(mevcut === 'dark' ? 'light' : 'dark');
        },
        ozelRenkAyarla(renk) {
            localStorage.setItem('wnersdev_ozel_renk', renk);
            localStorage.setItem('wnersdev_tema', 'özel');
            uygula();
        },
        mevcutTema: () => localStorage.getItem('wnersdev_tema') || VARSAYILAN_TEMA,
        mevcutMod: () => localStorage.getItem('wnersdev_mod') || VARSAYILAN_MOD
    };
})();
