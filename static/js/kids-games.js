window.KidsGames = {
    list: ['catch', 'whack', 'color'],

    html: function (game) {
        if (game === 'catch') {
            return (
                '<div class="kids-game" id="game-catch">' +
                '<p class="kids-title">🍌 Attrape la banane !</p>' +
                '<p class="kids-score">Score : <span id="catch-score">0</span></p>' +
                '<div class="kids-arena" id="catch-arena">' +
                '<button type="button" class="kids-target" id="catch-target">🍌</button>' +
                '</div>' +
                '<p class="kids-hint">Clique la banane avant qu\'elle parte !</p></div>'
            );
        }
        if (game === 'whack') {
            return (
                '<div class="kids-game" id="game-whack">' +
                '<p class="kids-title">🐹 Tape le hamster !</p>' +
                '<p class="kids-score">Score : <span id="whack-score">0</span></p>' +
                '<div class="kids-grid">' +
                Array(9).fill(0).map(function (_, i) {
                    return '<button type="button" class="kids-hole" data-i="' + i + '"></button>';
                }).join('') +
                '</div></div>'
            );
        }
        return (
            '<div class="kids-game" id="game-color">' +
            '<p class="kids-title">🎨 Touche la bonne couleur !</p>' +
            '<p class="kids-score">Score : <span id="color-score">0</span></p>' +
            '<p class="kids-prompt" id="color-prompt">Touche ROUGE</p>' +
            '<div class="kids-colors">' +
            '<button type="button" class="kids-color-btn" data-c="red" style="background:#ef4444"></button>' +
            '<button type="button" class="kids-color-btn" data-c="blue" style="background:#64748b"></button>' +
            '<button type="button" class="kids-color-btn" data-c="green" style="background:#22c55e"></button>' +
            '<button type="button" class="kids-color-btn" data-c="yellow" style="background:#eab308"></button>' +
            '</div></div>'
        );
    },

    init: function (game, root) {
        if (game === 'catch') this.initCatch(root);
        else if (game === 'whack') this.initWhack(root);
        else this.initColor(root);
    },

    initCatch: function (root) {
        let score = 0;
        const target = root.querySelector('#catch-target');
        const arena = root.querySelector('#catch-arena');
        const scoreEl = root.querySelector('#catch-score');
        if (!target || !arena) return;

        function move() {
            const maxX = arena.clientWidth - 50;
            const maxY = arena.clientHeight - 50;
            target.style.left = Math.random() * maxX + 'px';
            target.style.top = Math.random() * maxY + 'px';
        }

        target.addEventListener('click', function () {
            score++;
            scoreEl.textContent = score;
            move();
        });
        move();
        setInterval(move, 1200);
    },

    initWhack: function (root) {
        let score = 0;
        const holes = root.querySelectorAll('.kids-hole');
        const scoreEl = root.querySelector('#whack-score');
        let active = -1;

        function showMole() {
            holes.forEach(function (h) { h.textContent = ''; h.classList.remove('up'); });
            active = Math.floor(Math.random() * holes.length);
            holes[active].textContent = '🐹';
            holes[active].classList.add('up');
        }

        holes.forEach(function (hole, i) {
            hole.addEventListener('click', function () {
                if (i === active && hole.classList.contains('up')) {
                    score++;
                    scoreEl.textContent = score;
                    hole.classList.remove('up');
                    hole.textContent = '';
                    active = -1;
                }
            });
        });
        showMole();
        setInterval(showMole, 900);
    },

    initColor: function (root) {
        let score = 0;
        const names = { red: 'ROUGE', blue: 'BLEU', green: 'VERT', yellow: 'JAUNE' };
        const keys = Object.keys(names);
        const prompt = root.querySelector('#color-prompt');
        const scoreEl = root.querySelector('#color-score');
        let want = keys[Math.floor(Math.random() * keys.length)];

        prompt.textContent = 'Touche ' + names[want];

        root.querySelectorAll('.kids-color-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (btn.dataset.c === want) {
                    score++;
                    scoreEl.textContent = score;
                    want = keys[Math.floor(Math.random() * keys.length)];
                    prompt.textContent = 'Touche ' + names[want];
                } else {
                    score = Math.max(0, score - 1);
                    scoreEl.textContent = score;
                    prompt.textContent = 'Raté ! Touche ' + names[want];
                }
            });
        });
    },
};
