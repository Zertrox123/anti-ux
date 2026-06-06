(function () {
    'use strict';

    const D = window.CryptoData;

    function renderHoldings() {
        const tbody = document.getElementById('holdings-body');
        if (!tbody) return;

        let total = 0;
        D.holdings.forEach(function (h) { total += h.value; });

        document.getElementById('wallet-total').textContent = D.formatPrice(total);
        document.getElementById('wallet-count').textContent = D.holdings.length;
        tbody.innerHTML = '';

        D.holdings.forEach(function (h) {
            const pct = ((h.value / total) * 100).toFixed(1);
            const row = document.createElement('tr');
            row.innerHTML =
                '<td><div class="coin-info">' +
                '<div class="coin-icon" style="background:' + h.color + '">' + h.symbol[0] + '</div>' +
                '<div><div style="font-weight:600;">' + h.name + '</div>' +
                '<div style="font-size:0.75rem;color:var(--text-muted);">' + h.symbol + '</div></div></div></td>' +
                '<td>' + h.amount + ' ' + h.symbol + '</td>' +
                '<td>' + D.formatPrice(h.value) + '</td>' +
                '<td>' + pct + '%</td>';
            tbody.appendChild(row);
        });

        CryptoCharts.defaults();
        CryptoCharts.doughnut(
            'chart-allocation',
            D.holdings.map(function (h) { return h.symbol; }),
            D.holdings.map(function (h) { return h.value; }),
            D.holdings.map(function (h) { return h.color; })
        );
    }

    document.addEventListener('DOMContentLoaded', function () {
        AntiUX.runQuickLoad(renderHoldings);

        document.querySelectorAll('.btn-action-fake').forEach(function (btn) {
            btn.addEventListener('click', function () {
                AntiUX.showPopup('Opération annulée.');
            });
        });

        document.getElementById('tiny-deposit')?.addEventListener('change', function () {
            const msg = document.getElementById('deposit-msg');
            if (this.checked && msg) {
                msg.textContent = 'Dépôt simulé : +$500.00 en attente (aucun feedback visuel sur le solde).';
                msg.classList.remove('hidden');
                this.checked = false;
            }
        });
    });
})();
