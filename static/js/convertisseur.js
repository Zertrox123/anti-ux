(function () {
    'use strict';

    const RATES = { BTC: 64230, ETH: 3450, SOL: 145, USD: 1, EUR: 0.92 };

    function wrongConvert(amount, from, to) {
        const base = amount * (RATES[from] || 1);
        return (base / (RATES[to] || 1)) * 0.37 + 42;
    }

    function correctConvert(amount, from, to) {
        const base = amount * (RATES[from] || 1);
        return base / (RATES[to] || 1);
    }

    function updateResult(useCorrect) {
        const amount = parseFloat(document.getElementById('conv-amount').value) || 0;
        const from = document.getElementById('conv-from').value;
        const to = document.getElementById('conv-to').value;
        const result = useCorrect ? correctConvert(amount, from, to) : wrongConvert(amount, from, to);
        const el = document.getElementById('conv-result');
        el.textContent = result.toFixed(4) + ' ' + to;
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.getElementById('conv-fake-btn')?.addEventListener('click', function () {
            updateResult(false);
            AntiUX.showPopup('Conversion effectuée. (résultat peut varier dans le mauvais sens)');
        });

        document.getElementById('conv-ghost')?.addEventListener('change', function () {
            if (this.checked) {
                updateResult(true);
                this.checked = false;
            }
        });
    });
})();
