/* Logique d'inscription / connexion anti-UX */

(function () {
    'use strict';

    const MIDDLE_ROW = /[asdfghjklASDFGHJKL]/;
    const PASSWORD_ERRORS = [
        'Il manque une majuscule.',
        'Il faut un chiffre premier (le premier caractère doit être un chiffre).',
        'Le mot de passe ne doit pas contenir de lettre de la ligne du milieu du clavier.',
        'Le mot de passe doit faire exactement 7 caractères (vous en avez un nombre différent).',
        'Le mot de passe ne doit pas se terminer par une voyelle.',
    ];

    let passwordAttempt = 0;
    let captchaStep = 0;
    const CAPTCHA_TOTAL = 20;

    let dobDate = new Date();

    function switchAuth(type) {
        document.getElementById('login-form').classList.toggle('hidden', type !== 'login');
        document.getElementById('register-form').classList.toggle('hidden', type !== 'register');
        document.querySelectorAll('.auth-tab').forEach(function (tab, i) {
            tab.classList.toggle('active', (type === 'login' && i === 0) || (type === 'register' && i === 1));
        });
    }

    function formatDate(d) {
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    function updateDobDisplay() {
        const el = document.getElementById('dob-display');
        if (el) el.textContent = formatDate(dobDate);
    }

    function goBackOneDay() {
        dobDate.setDate(dobDate.getDate() - 1);
        updateDobDisplay();
    }

    function validatePassword(password) {
        if (!/[A-Z]/.test(password)) {
            return PASSWORD_ERRORS[0];
        }
        if (!/^\d/.test(password)) {
            return PASSWORD_ERRORS[1];
        }
        if (MIDDLE_ROW.test(password)) {
            return PASSWORD_ERRORS[2];
        }
        if (password.length !== 7) {
            return PASSWORD_ERRORS[3];
        }
        if (/[aeiouyAEIOUY]$/.test(password)) {
            return PASSWORD_ERRORS[4];
        }
        return null;
    }

    function getSequentialPasswordError(password) {
        const realError = validatePassword(password);
        if (!realError) return null;

        const shown = PASSWORD_ERRORS[Math.min(passwordAttempt, PASSWORD_ERRORS.length - 1)];
        passwordAttempt++;
        return shown;
    }

    function buildCaptchaSteps() {
        const container = document.getElementById('captcha-steps');
        if (!container) return;

        container.innerHTML = '';
        for (let i = 1; i <= CAPTCHA_TOTAL; i++) {
            const chars = Math.random().toString(36).substring(2, 6).toUpperCase();
            const step = document.createElement('div');
            step.className = 'captcha-step hidden';
            step.dataset.step = i;
            step.innerHTML =
                '<p class="captcha-progress">Étape ' + i + ' / ' + CAPTCHA_TOTAL + '</p>' +
                '<div class="captcha-micro" title="Lisez ceci">' + chars + '</div>' +
                '<input type="text" class="captcha-input" placeholder="Recopiez (minuscules interdites)" data-answer="' + chars + '">';
            container.appendChild(step);
        }
        showCaptchaStep(1);
    }

    function showCaptchaStep(n) {
        captchaStep = n;
        document.querySelectorAll('.captcha-step').forEach(function (el) {
            el.classList.toggle('hidden', parseInt(el.dataset.step, 10) !== n);
        });
    }

    function validateCaptchaStep() {
        const current = document.querySelector('.captcha-step:not(.hidden)');
        if (!current) return false;

        const input = current.querySelector('.captcha-input');
        const answer = input.dataset.answer;
        const value = input.value.trim().toUpperCase();

        if (value !== answer) {
            input.value = '';
            return false;
        }

        if (captchaStep < CAPTCHA_TOTAL) {
            showCaptchaStep(captchaStep + 1);
            return false;
        }
        return true;
    }

    function showConfirmDialog(onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        overlay.innerHTML =
            '<div class="popup-box" style="min-width: 300px;">' +
            '<p style="font-size: 14px; margin-bottom: 20px;">Confirmer l\'inscription ?</p>' +
            '<div class="button-row" style="justify-content: center;">' +
            '<button type="button" class="btn-cancel" id="dialog-cancel">Annuler tout</button>' +
            '<button type="button" class="btn-validate" id="dialog-validate">Valider</button>' +
            '</div>' +
            '<label class="ghost-check ghost-dialog"><input type="checkbox" id="dialog-tiny-confirm"></label></div>';

        document.body.appendChild(overlay);

        /* Logique inversée : gros boutons piègent, petite case fonctionne */
        overlay.querySelector('#dialog-cancel').addEventListener('click', function () {
            AntiUX.showPopup('Inscription annulée. (Bouton Annuler)');
        });

        overlay.querySelector('#dialog-validate').addEventListener('click', function () {
            overlay.remove();
            onConfirm();
        });

        overlay.querySelector('#dialog-tiny-confirm').addEventListener('change', function () {
            if (this.checked) {
                overlay.remove();
                onConfirm();
            }
        });
    }

    function uncheckTiny(id) {
        const el = document.getElementById(id);
        if (el) el.checked = false;
    }

    function handleLogin() {
        const form = document.getElementById('login-form');
        if (!form.reportValidity()) {
            uncheckTiny('tiny-login-validate');
            return;
        }
        AntiUX.slowNavigate('/dashboard');
    }

    function handleRegister() {
        const form = document.getElementById('register-form');
        const password = document.getElementById('reg-password').value;
        const errorEl = document.getElementById('password-error');

        if (!form.reportValidity()) {
            uncheckTiny('tiny-register-validate');
            return;
        }

        const err = getSequentialPasswordError(password);
        if (err) {
            errorEl.textContent = err;
            uncheckTiny('tiny-register-validate');
            return;
        }
        errorEl.textContent = '';

        if (!validateCaptchaStep()) {
            errorEl.textContent = 'Captcha incorrect. Recommencez cette étape.';
            uncheckTiny('tiny-register-validate');
            return;
        }

        showConfirmDialog(function () {
            uncheckTiny('tiny-register-validate');
            AntiUX.slowNavigate('/dashboard');
        });
    }

    function buildExtraOptions() {
        const container = document.getElementById('extra-options');
        if (!container) return;

        const options = [
            'Recevoir des newsletters horaires',
            'Partager mes données avec des partenaires inconnus',
            'Activer le mode silencieux bruyant',
            'Synchroniser avec ma calculatrice',
            'Autoriser les cookies de cookies',
            'S\'abonner aux alertes météo crypto',
            'Envoyer mon mot de passe par SMS',
            'Activer la double authentification simple',
            'Partager mon écran en permanence',
            'Recevoir des appels à 3h du matin',
            'Activer le dark mode clair',
            'Souscrire à l\'assurance blockchain',
            'Publier mes transactions sur Facebook',
            'Activer le mode hors-ligne en ligne',
            'Envoyer un fax de bienvenue',
        ];

        options.forEach(function (opt, i) {
            const id = 'opt-' + i;
            container.innerHTML +=
                '<label><input type="checkbox" name="opt" value="' + opt + '" ' +
                (i % 2 === 0 ? 'checked' : '') + '> ' + opt + '</label>';
        });
    }

    window.switchAuth = switchAuth;

    document.addEventListener('DOMContentLoaded', function () {
        dobDate = new Date();
        updateDobDisplay();

        const dobBtn = document.getElementById('dob-prev');
        if (dobBtn) dobBtn.addEventListener('click', goBackOneDay);

        buildExtraOptions();
        buildCaptchaSteps();

        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (loginForm) {
            loginForm.addEventListener('submit', function (e) { e.preventDefault(); });
        }
        if (registerForm) {
            registerForm.addEventListener('submit', function (e) { e.preventDefault(); });
        }

        const fakeCancelLogin = document.getElementById('fake-cancel-login');
        const fakeCancelRegister = document.getElementById('fake-cancel-register');
        const tinyLogin = document.getElementById('tiny-login-validate');
        const tinyRegister = document.getElementById('tiny-register-validate');

        if (fakeCancelLogin) {
            fakeCancelLogin.addEventListener('click', function () {
                AntiUX.showPopup('Connexion annulée.');
            });
        }
        if (fakeCancelRegister) {
            fakeCancelRegister.addEventListener('click', function () {
                AntiUX.showPopup('Inscription annulée.');
            });
        }
        if (tinyLogin) {
            tinyLogin.addEventListener('change', function () {
                if (this.checked) handleLogin();
            });
        }
        if (tinyRegister) {
            tinyRegister.addEventListener('change', function () {
                if (this.checked) handleRegister();
            });
        }

        document.getElementById('btn-validate-login')?.addEventListener('click', handleLogin);
        document.getElementById('btn-validate-register')?.addEventListener('click', handleRegister);
    });
})();
