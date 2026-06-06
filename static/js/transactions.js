(function () {
    'use strict';

    const D = window.CryptoData;

    function daysAgo(dateStr) {
        const d = new Date(dateStr);
        const now = new Date('2026-06-06');
        return Math.floor((now - d) / 86400000);
    }

    function renderTransactions(maxDays) {
        const tbody = document.getElementById('tx-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        D.transactions.forEach(function (tx) {
            if (maxDays !== 'all' && daysAgo(tx.date) > maxDays) return;

            const isBuy = tx.type === 'Achat';
            const row = document.createElement('tr');
            row.innerHTML =
                '<td>' + tx.date + '</td>' +
                '<td>' + tx.type + '</td>' +
                '<td><strong>' + tx.asset + '</strong></td>' +
                '<td class="' + (isBuy ? 'trend up' : 'trend down') + '">' + tx.amount + '</td>' +
                '<td>' + tx.value + '</td>' +
                '<td><span class="badge ' + (tx.status === 'Confirmé' ? 'badge-ok' : 'badge-pending') + '">' +
                tx.status + '</span></td>';
            tbody.appendChild(row);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        AntiUX.runQuickLoad(function () {
            renderTransactions('all');
        });

        document.querySelectorAll('[data-fake-filter]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('[data-fake-filter]').forEach(function (b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                AntiUX.showPopup('Filtre « ' + this.dataset.fakeFilter + ' » non disponible. Utilisez le menu période.');
            });
        });

        document.getElementById('real-period')?.addEventListener('change', function () {
            const val = this.value;
            renderTransactions(val === 'all' ? 'all' : parseInt(val, 10));
        });
    });
})();
