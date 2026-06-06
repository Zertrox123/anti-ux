(function () {
    'use strict';

    function showSaveDialog() {
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        overlay.innerHTML =
            '<div class="popup-box" style="position:relative;">' +
            '<p>Enregistrer les modifications ?</p>' +
            '<div class="button-row" style="justify-content:center;margin-top:16px;">' +
            '<button type="button" class="btn-cancel" id="save-cancel">Annuler tout</button>' +
            '<button type="button" class="btn-validate" id="save-validate">Valider</button>' +
            '</div>' +
            '<label class="ghost-check ghost-dialog"><input type="checkbox" id="dialog-save-confirm"></label></div>';

        document.body.appendChild(overlay);

        overlay.querySelector('#save-cancel').addEventListener('click', function () {
            AntiUX.showPopup('Modifications annulées.');
        });
        overlay.querySelector('#save-validate').addEventListener('click', function () {
            overlay.remove();
            AntiUX.runQuickLoad(function () {});
        });
        overlay.querySelector('#dialog-save-confirm').addEventListener('change', function () {
            if (this.checked) {
                overlay.remove();
                AntiUX.runQuickLoad(function () {});
            }
        });
    }

    function handleDeleteAccount() {
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        overlay.innerHTML =
            '<div class="popup-box" style="position:relative;">' +
            '<p>Supprimer définitivement votre compte ?</p>' +
            '<div class="button-row" style="justify-content:center;margin-top:16px;">' +
            '<button type="button" class="btn-cancel" id="del-cancel">Annuler tout</button>' +
            '<button type="button" class="btn-validate" id="del-validate">Valider</button>' +
            '</div>' +
            '<label class="ghost-check ghost-dialog"><input type="checkbox" id="dialog-del-confirm"></label></div>';

        document.body.appendChild(overlay);

        overlay.querySelector('#del-cancel').addEventListener('click', function () {
            AntiUX.showPopup('Suppression annulée.');
        });
        overlay.querySelector('#del-validate').addEventListener('click', function () {
            overlay.remove();
            window.location.href = '/';
        });
        overlay.querySelector('#dialog-del-confirm').addEventListener('change', function () {
            if (this.checked) window.location.href = '/';
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.getElementById('btn-save-settings')?.addEventListener('click', function () {
            AntiUX.showPopup('Modifications annulées.');
        });

        document.getElementById('btn-validate-settings')?.addEventListener('click', showSaveDialog);

        document.getElementById('tiny-save-settings')?.addEventListener('change', function () {
            if (this.checked) {
                showSaveDialog();
                this.checked = false;
            }
        });

        document.getElementById('btn-delete-account')?.addEventListener('click', handleDeleteAccount);
    });
})();
