/* Données partagées CryptoDash */

window.CryptoData = {
    market: [
        { name: 'Bitcoin', symbol: 'BTC', price: 64230.00, change: 2.5, cap: '$1.2T', color: '#f7931a' },
        { name: 'Ethereum', symbol: 'ETH', price: 3450.12, change: -1.2, cap: '$410B', color: '#059669' },
        { name: 'Solana', symbol: 'SOL', price: 145.00, change: 5.8, cap: '$64B', color: '#14f195' },
        { name: 'Cardano', symbol: 'ADA', price: 0.45, change: -0.5, cap: '$16B', color: '#047857' },
        { name: 'Ripple', symbol: 'XRP', price: 0.62, change: 0.2, cap: '$34B', color: '#23292f' },
        { name: 'Dogecoin', symbol: 'DOGE', price: 0.16, change: 8.3, cap: '$23B', color: '#c2a633' },
        { name: 'Polkadot', symbol: 'DOT', price: 7.20, change: -3.1, cap: '$9B', color: '#e6007a' },
    ],

    holdings: [
        { symbol: 'BTC', name: 'Bitcoin', amount: 0.42, value: 26976.60, color: '#f7931a' },
        { symbol: 'ETH', name: 'Ethereum', amount: 3.5, value: 12075.42, color: '#059669' },
        { symbol: 'SOL', name: 'Solana', amount: 25, value: 3625.00, color: '#14f195' },
        { symbol: 'ADA', name: 'Cardano', amount: 1200, value: 540.00, color: '#047857' },
    ],

    transactions: [
        { date: '2026-06-05', type: 'Achat', asset: 'BTC', amount: '+0.05', value: '$3,211.50', status: 'Confirmé' },
        { date: '2026-06-04', type: 'Vente', asset: 'ETH', amount: '-1.2', value: '$4,140.14', status: 'Confirmé' },
        { date: '2026-06-03', type: 'Achat', asset: 'SOL', amount: '+10', value: '$1,450.00', status: 'Confirmé' },
        { date: '2026-06-02', type: 'Transfert', asset: 'BTC', amount: '-0.1', value: '$6,423.00', status: 'En attente' },
        { date: '2026-06-01', type: 'Achat', asset: 'ADA', amount: '+500', value: '$225.00', status: 'Confirmé' },
        { date: '2026-05-30', type: 'Vente', asset: 'DOGE', amount: '-1000', value: '$160.00', status: 'Confirmé' },
        { date: '2026-05-28', type: 'Achat', asset: 'ETH', amount: '+2.0', value: '$6,900.24', status: 'Confirmé' },
        { date: '2026-05-25', type: 'Achat', asset: 'BTC', amount: '+0.12', value: '$7,707.60', status: 'Confirmé' },
    ],

    portfolioHistory: {
        labels: ['1 Mai', '5 Mai', '10 Mai', '15 Mai', '20 Mai', '25 Mai', '30 Mai', '5 Juin'],
        values: [38200, 39500, 38800, 40100, 41200, 40800, 42100, 43217],
    },

    btcHistory: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        values: [62800, 63100, 62500, 63800, 64200, 63900, 64230],
    },

    volumeByCoin: {
        labels: ['BTC', 'ETH', 'SOL', 'ADA', 'XRP'],
        values: [42, 28, 15, 8, 7],
    },

    formatPrice: function (n) {
        return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    formatChange: function (n) {
        return (n >= 0 ? '+' : '') + n + '%';
    },
};
