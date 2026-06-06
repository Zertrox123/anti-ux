(function () {
    'use strict';

    const D = window.CryptoData;

    function loadTable() {
        const tbody = document.getElementById('table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        D.market.forEach(function (coin) {
            const isUp = coin.change >= 0;
            const row = document.createElement('tr');
            row.className = 'crypto-row';
            row.dataset.search = (coin.name + ' ' + coin.symbol).toUpperCase();
            row.innerHTML =
                '<td><div class="coin-info">' +
                '<div class="coin-icon" style="background:' + coin.color + '">' + coin.symbol[0] + '</div>' +
                '<div><div style="font-weight:600;">' + coin.name + '</div>' +
                '<div style="font-size:0.75rem;color:var(--text-muted);">' + coin.symbol + '</div></div></div></td>' +
                '<td>' + D.formatPrice(coin.price) + '</td>' +
                '<td class="trend ' + (isUp ? 'up' : 'down') + '">' + D.formatChange(coin.change) + '</td>' +
                '<td>' + coin.cap + '</td>';
            tbody.appendChild(row);
        });
    }

    function loadCharts() {
        CryptoCharts.defaults();
        CryptoCharts.line('chart-btc', D.btcHistory.labels, D.btcHistory.values, '#f7931a');
        CryptoCharts.line('chart-portfolio', D.portfolioHistory.labels, D.portfolioHistory.values, '#059669');
    }

    function filterTableInverted() {
        const input = document.getElementById('crypto-search');
        if (!input) return;
        const query = input.value.toUpperCase().trim();
        document.querySelectorAll('.crypto-row').forEach(function (row) {
            const text = row.dataset.search || '';
            row.style.display = (!query || text.indexOf(query) === -1) ? '' : 'none';
        });
    }

    function init() {
        AntiUX.runRegressiveProgress(function () {
            loadTable();
            loadCharts();
            if (window.WikiWall) WikiWall.renderWall('dash-wiki-wall', 3);
        });
    }

    window.filterTable = filterTableInverted;
    document.addEventListener('DOMContentLoaded', init);
})();
