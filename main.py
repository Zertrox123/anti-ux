import socket

from flask import Flask, render_template

app = Flask(__name__)


def find_free_port(start=5001, end=5010):
    for port in range(start, end + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            try:
                sock.bind(('127.0.0.1', port))
                return port
            except OSError:
                continue
    raise RuntimeError(f'Aucun port libre entre {start} et {end}')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html', active='dashboard')


@app.route('/wallet')
def wallet():
    return render_template('wallet.html', active='wallet')


@app.route('/transactions')
def transactions():
    return render_template('transactions.html', active='transactions')


@app.route('/analytics')
def analytics():
    return render_template('analytics.html', active='analytics')


@app.route('/actus')
def actus():
    return render_template('actus.html', active='actus')


@app.route('/convertisseur')
def convertisseur():
    return render_template('convertisseur.html', active='convertisseur')


@app.route('/settings')
def settings():
    return render_template('settings.html', active='settings')


if __name__ == '__main__':
    port = find_free_port()
    print(f'\n  → Ouvrir http://127.0.0.1:{port}')
    print('  → Routes : /, /dashboard, /wallet, /transactions, /analytics, /actus, /convertisseur, /settings\n')
    app.run(debug=True, port=port, use_reloader=True)
