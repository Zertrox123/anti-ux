(function () {
    'use strict';

    const D = window.CryptoData;
    let lineChart, barChart, pieChart;

    function renderCharts() {
        CryptoCharts.defaults();

        if (lineChart) lineChart.destroy();
        if (barChart) barChart.destroy();
        if (pieChart) pieChart.destroy();

        lineChart = CryptoCharts.line(
            'chart-analytics-line',
            D.portfolioHistory.labels,
            D.portfolioHistory.values,
            '#059669'
        );

        barChart = CryptoCharts.bar(
            'chart-analytics-bar',
            D.volumeByCoin.labels,
            D.volumeByCoin.values,
            ['#f7931a', '#059669', '#10b981', '#047857', '#23292f']
        );

        pieChart = CryptoCharts.doughnut(
            'chart-analytics-pie',
            D.holdings.map(function (h) { return h.symbol; }),
            D.holdings.map(function (h) { return h.value; }),
            D.holdings.map(function (h) { return h.color; })
        );
    }

    function scaleHistory(factor) {
        return D.portfolioHistory.values.map(function (v) {
            return Math.round(v * factor);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        AntiUX.runQuickLoad(renderCharts);

        document.querySelectorAll('[data-fake-range]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('[data-fake-range]').forEach(function (b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');
            });
        });

        document.getElementById('tiny-range-7j')?.addEventListener('change', function () {
            if (!this.checked || !lineChart) return;
            document.getElementById('tiny-range-30j').checked = false;
            lineChart.data.datasets[0].data = D.portfolioHistory.values.slice(-4);
            lineChart.data.labels = D.portfolioHistory.labels.slice(-4);
            lineChart.update();
            this.checked = false;
        });

        document.getElementById('tiny-range-30j')?.addEventListener('change', function () {
            if (!this.checked || !lineChart) return;
            document.getElementById('tiny-range-7j').checked = false;
            lineChart.data.datasets[0].data = D.portfolioHistory.values;
            lineChart.data.labels = D.portfolioHistory.labels;
            lineChart.update();
            this.checked = false;
        });
    });
})();
