// Initialize Icons
lucide.createIcons();

const loginCard = document.getElementById('login-card');
const registerCard = document.getElementById('register-card');
const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.getElementById('dashboard-container');

// Toggle between Login and Register views
function toggleAuth() {
    if (loginCard.classList.contains('hidden')) {
        // If login is hidden, we are showing register
        loginCard.classList.remove('hidden');
        registerCard.classList.add('hidden');
    } else {
        // If login is visible, we are switching to register
        loginCard.classList.add('hidden');
        registerCard.classList.remove('hidden');
    }
}

// Handle Form Submissions
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    showDashboard();
});

document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    showDashboard();
});

function showDashboard() {
    authContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    loadMockData();
}

function logout() {
    dashboardContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
    // Reset to login view on logout
    loginCard.classList.remove('hidden');
    registerCard.classList.add('hidden');
}

// Mock Data
const cryptoData = [
    { name: 'Bitcoin', symbol: 'BTC', price: '$64,230.00', change: '+2.5%', cap: '$1.2T', color: '#f7931a' },
    { name: 'Ethereum', symbol: 'ETH', price: '$3,450.12', change: '-1.2%', cap: '$410B', color: '#627eea' },
    { name: 'Solana', symbol: 'SOL', price: '$145.00', change: '+5.8%', cap: '$64B', color: '#14f195' },
    { name: 'Cardano', symbol: 'ADA', price: '$0.45', change: '-0.5%', cap: '$16B', color: '#0033ad' },
    { name: 'Ripple', symbol: 'XRP', price: '$0.62', change: '+0.2%', cap: '$34B', color: '#23292f' }
];

function loadMockData() {
    const tbody = document.getElementById('table-body');
    if(!tbody) return;
    tbody.innerHTML = '';

    cryptoData.forEach(coin => {
        const isUp = coin.change.includes('+');
        const row = document.createElement('tr');
        row.className = 'crypto-row';
        row.innerHTML = `
            <td>
                <div class="coin-info">
                    <div class="coin-icon" style="background: ${coin.color};">${coin.symbol[0]}</div>
                    <div>
                        <div style="font-weight: 600;">${coin.name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${coin.symbol}</div>
                    </div>
                </div>
            </td>
            <td>${coin.price}</td>
            <td class="trend ${isUp ? 'up' : 'down'}">${coin.change}</td>
            <td>${coin.cap}</td>
        `;
        tbody.appendChild(row);
    });
}

function filterTable() {
    const input = document.getElementById('crypto-search').value.toUpperCase();
    const rows = document.querySelectorAll('.crypto-row');

    rows.forEach(row => {
        const text = row.textContent.toUpperCase();
        // Logic: If the input string is found anywhere in the row text, show it.
        if (text.indexOf(input) > -1) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}
