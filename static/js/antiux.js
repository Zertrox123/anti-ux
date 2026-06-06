(function () {
    'use strict';

    if (window.__antiuxInitialized) return;
    window.__antiuxInitialized = true;

    const POPUP_MESSAGES = [
        'Avez-vous pensé à mettre à jour Flash Player ?',
        'Félicitations ! Vous êtes le visiteur n°1 000 000 !',
        'Votre session expire dans 0 secondes.',
        'Erreur 404 : Cette popup est introuvable.',
        'Souhaitez-vous recevoir plus de notifications ?',
        'Le support technique est indisponible depuis 1998.',
        'Cliquez OK pour continuer à attendre.',
        'Mise à jour critique : aucun détail fourni.',
        'Votre adblocker bloque notre adblocker.',
        'Avez-vous essayé de redémarrer votre routeur ?',
        'CryptoDash a besoin de votre position exacte.',
        'Un mineur de NFT souhaite vous contacter.',
        'Offre spéciale : -0% sur tous les frais !',
        'Votre cousin au Nigeria vous écrit.',
        'JavaScript est désactivé. (faux)',
        'Nouveau message de votre banquier crypto.',
        'Téléchargez notre toolbar GRATUITE !',
        'Vous avez gagné un iPhone 4.',
        'Mise à jour Adobe Reader requise.',
        'Êtes-vous un robot ? (déjà répondu)',
        'Erreur mémoire insuffisante : 128 Go libres.',
        'Le Bitcoin est en baisse. Et en hausse aussi.',
    ];

    const POPUP_STYLES = [
        'pop-default',
        'pop-accent',
        'pop-muted',
    ];
    const POPUP_SPAWN_MIN_MS = 900;
    const POPUP_SPAWN_MAX_MS = 8200;
    const POPUP_IMAGE_CHANCE = 0.38;
    const POPUP_IMAGE_URL = '/static/img/pitech-portrait.png';
    const POPUP_IMAGE_SEED = 'pitech';
    const POPUP_SCALE_MIN = 1;
    const POPUP_SCALE_MAX = 1.08;

    const SUBWAY_SURFERS_VIDEOS = [
        { id: 'zZ7AimPACzc', aspectW: 16, aspectH: 9 },
        { id: 'Yf3Sw07xT4A', aspectW: 16, aspectH: 9 },
        { id: 'wg_g028OhPE', aspectW: 9, aspectH: 16 },
    ];

    const SUBWAY_SURFERS_IDS = SUBWAY_SURFERS_VIDEOS.map(function (v) { return v.id; });

    let scatterCount = 0;
    const MAX_SCATTER = 8;
    const MAX_CACHED_POPUPS = 8;

    let brainrotSpawnTimer = null;
    let brainrotVisible = false;
    let popupPositions = [];
    let lastUserActivity = Date.now();
    let videoCloseInterval = null;
    let popupSpawnTimer = null;
    let activityThrottle = 0;
    let saveCacheTimer = null;
    let popupSpawnBusy = false;

    const BRAINROT_SPAWN_MIN_MS = 5000;
    const BRAINROT_SPAWN_MAX_MS = 15000;
    const VIDEO_ACTIVE_CLOSE_MS = 10000;
    const VIDEO_IDLE_RESET_MS = 5000;
    const LOADER_DURATION_MS = 5000;
    const LOADER_COUNT_KEY = 'cryptodash_load_count';
    const ACTIVITY_THROTTLE_MS = 400;
    const POPUP_CACHE_KEY = 'cryptodash_popups';
    const POPUP_UI_VERSION = 'scatter-v8';
    const BRAINROT_CACHE_KEY = 'cryptodash_brainrot';
    const THEME_DARK_TEXT_KEY = 'cryptodash_dark_text';

    function cleanupOrphans() {
        document.getElementById('infinite-loader')?.remove();
        document.querySelectorAll('.popup-overlay').forEach(function (el) { el.remove(); });
    }

    function migrateSessionCache() {
        try {
            sessionStorage.removeItem('cryptodash_loader_done');
            sessionStorage.removeItem('cryptodash_seen_loader');
            if (sessionStorage.getItem('cryptodash_popup_ui') !== POPUP_UI_VERSION) {
                sessionStorage.removeItem(POPUP_CACHE_KEY);
                sessionStorage.removeItem('cryptodash_popups_seeded');
                sessionStorage.setItem('cryptodash_popup_ui', POPUP_UI_VERSION);
            }
            const popRaw = sessionStorage.getItem(POPUP_CACHE_KEY);
            if (popRaw && popRaw.length > 20000) {
                sessionStorage.removeItem(POPUP_CACHE_KEY);
            }
            const vidRaw = sessionStorage.getItem(BRAINROT_CACHE_KEY);
            if (!vidRaw) {
            } else if (vidRaw.indexOf('videoUrl') !== -1) {
                sessionStorage.removeItem(BRAINROT_CACHE_KEY);
            } else {
                try {
                    const vid = JSON.parse(vidRaw).videoId;
                    if (!vid || SUBWAY_SURFERS_IDS.indexOf(vid) === -1) {
                        sessionStorage.removeItem(BRAINROT_CACHE_KEY);
                    }
                } catch (e) {
                    sessionStorage.removeItem(BRAINROT_CACHE_KEY);
                }
            }
        } catch (e) {}
    }

    function popupToCacheEntry(el) {
        const style = POPUP_STYLES.find(function (s) { return el.classList.contains(s); }) || 'pop-default';
        const base = {
            style: style,
            tilt: el.style.getPropertyValue('--tilt') || '0deg',
            top: el.style.top,
            left: el.style.left,
            zIndex: el.style.zIndex || '8000',
            popScale: parseFloat(el.style.getPropertyValue('--pop-scale')) || POPUP_SCALE_MIN,
        };
        const textEl = el.querySelector('.scatter-popup-text');
        if (textEl) {
            return Object.assign({ message: textEl.textContent || '' }, base);
        }
        const seed = el.dataset.imageSeed;
        if (seed) {
            return Object.assign({ imageSeed: seed }, base);
        }
        return null;
    }

    function flushPopupsToCache() {
        clearTimeout(saveCacheTimer);
        const popups = [];
        document.querySelectorAll('.popup-scatter').forEach(function (el) {
            if (popups.length >= MAX_CACHED_POPUPS) return;
            const entry = popupToCacheEntry(el);
            if (entry) popups.push(entry);
        });
        try {
            sessionStorage.setItem(POPUP_CACHE_KEY, JSON.stringify(popups));
            sessionStorage.setItem('cryptodash_scatter_count', String(scatterCount));
        } catch (e) {
            sessionStorage.removeItem(POPUP_CACHE_KEY);
        }
    }

    function trapBackButton() {
        history.pushState(null, '', location.href);
        window.addEventListener('popstate', function () {
            history.pushState(null, '', location.href);
            showScatterPopup('Navigation arrière désactivée pour votre sécurité.');
        });
    }

    function randomPos(w, h) {
        w = w || 400;
        h = h || 200;
        const tickerH = document.getElementById('wiki-ticker')?.offsetHeight || 72;
        const pad = 8 + Math.floor(Math.random() * 24);
        const maxLeft = Math.max(window.innerWidth - w - pad, pad);
        const minTop = tickerH + pad;
        const maxTop = Math.max(window.innerHeight - h - pad, minTop);

        for (let attempt = 0; attempt < 12; attempt++) {
            const left = pad + Math.random() * (maxLeft - pad);
            const top = minTop + Math.random() * (maxTop - minTop);
            const key = Math.floor(left / 55) + '-' + Math.floor(top / 55);
            if (!popupPositions.includes(key) || Math.random() < 0.35) {
                popupPositions.push(key);
                if (popupPositions.length > 50) popupPositions.shift();
                return { top: top, left: left };
            }
        }

        return {
            top: minTop + Math.random() * (maxTop - minTop),
            left: pad + Math.random() * (maxLeft - pad),
        };
    }

    function randomSpawnDelay() {
        return POPUP_SPAWN_MIN_MS +
            Math.floor(Math.random() * (POPUP_SPAWN_MAX_MS - POPUP_SPAWN_MIN_MS + 1));
    }

    function randomBurstCount() {
        const r = Math.random();
        if (r < 0.22) return 0;
        if (r < 0.58) return 1;
        if (r < 0.88) return 2;
        return 3;
    }

    function randomPopupScale() {
        const scale = POPUP_SCALE_MIN + Math.random() * (POPUP_SCALE_MAX - POPUP_SCALE_MIN);
        return Math.round(scale * 100) / 100;
    }

    function popupImageUrl() {
        return POPUP_IMAGE_URL;
    }

    function randomImagePayload() {
        return { imageSeed: POPUP_IMAGE_SEED, imageUrl: POPUP_IMAGE_URL };
    }

    function randomPopupPayload() {
        if (Math.random() < POPUP_IMAGE_CHANCE) {
            return randomImagePayload();
        }
        return {
            message: POPUP_MESSAGES[Math.floor(Math.random() * POPUP_MESSAGES.length)],
        };
    }

    function buildPopupBodyHtml(data) {
        if (data.imageSeed || data.imageUrl) {
            const src = data.imageUrl || popupImageUrl();
            return '<img class="scatter-popup-img" src="' + src + '" alt="PITECH" loading="lazy" decoding="async">';
        }
        return '<p class="scatter-popup-text">' + (data.message || '…') + '</p>';
    }

    function savePopupsToCache() {
        clearTimeout(saveCacheTimer);
        saveCacheTimer = setTimeout(flushPopupsToCache, 120);
    }

    function placeScatterPopup(el, data) {
        if (data.top && data.left) {
            el.style.top = data.top;
            el.style.left = data.left;
            return;
        }
        const w = el.offsetWidth || 320;
        const h = el.offsetHeight || 160;
        const pos = randomPos(w, h);
        el.style.top = pos.top + 'px';
        el.style.left = pos.left + 'px';
    }

    function fitImagePopup(el, img) {
        if (!img || !img.naturalWidth || !img.naturalHeight) return;
        el.style.setProperty('--img-aspect', String(img.naturalWidth / img.naturalHeight));
    }

    function mountScatterPopup(data) {
        scatterCount = Math.max(scatterCount, (parseInt(data.zIndex, 10) || 8000) - 8000);
        const popScale = data.popScale || randomPopupScale();
        const hasImage = !!(data.imageSeed || data.imageUrl);
        const el = document.createElement('div');
        el.className = 'popup-scatter ' + data.style + (hasImage ? ' popup-scatter-image' : '');
        el.style.setProperty('--tilt', data.tilt);
        el.style.setProperty('--pop-scale', String(popScale));
        if (data.imageSeed) {
            el.dataset.imageSeed = String(data.imageSeed);
        }
        if (data.imageSeed && !data.imageUrl) {
            data.imageUrl = popupImageUrl();
        }
        el.innerHTML =
            '<div class="scatter-popup-card">' +
            '<button type="button" class="scatter-popup-close" aria-label="Fermer">✕</button>' +
            '<div class="scatter-popup-body">' + buildPopupBodyHtml(data) + '</div>' +
            '</div>';

        document.body.appendChild(el);
        el.style.zIndex = data.zIndex || String(8000 + (++scatterCount));

        const img = el.querySelector('.scatter-popup-img');
        if (img) {
            const onImgReady = function () {
                fitImagePopup(el, img);
                if (!data.top || !data.left) {
                    placeScatterPopup(el, data);
                }
            };
            if (img.complete && img.naturalWidth) {
                onImgReady();
            } else {
                img.addEventListener('load', onImgReady, { once: true });
                if (!data.top && !data.left) {
                    placeScatterPopup(el, data);
                }
            }
        } else {
            placeScatterPopup(el, data);
        }

        attachPopupDismiss(el);

        return el;
    }

    function attachPopupDismiss(el) {
        el.addEventListener('click', function (ev) {
            if (!ev.target.closest('.scatter-popup-card')) return;
            ev.preventDefault();
            ev.stopPropagation();
            el.remove();
            flushPopupsToCache();
        });
    }

    function restorePopupsFromCache() {
        const raw = sessionStorage.getItem(POPUP_CACHE_KEY);
        if (!raw) return;
        try {
            const stored = parseInt(sessionStorage.getItem('cryptodash_scatter_count') || '0', 10);
            if (stored > scatterCount) scatterCount = stored;
            JSON.parse(raw).forEach(function (data) {
                if (data.message || data.imageSeed) {
                    if (data.imageSeed && !data.imageUrl) {
                        data.imageUrl = popupImageUrl();
                    }
                    mountScatterPopup(data);
                }
            });
        } catch (e) {
            sessionStorage.removeItem(POPUP_CACHE_KEY);
        }
    }

    function showScatterPopup(payload) {
        if (document.getElementById('infinite-loader')) return;

        if (document.querySelectorAll('.popup-scatter').length >= MAX_SCATTER) return;

        const data = typeof payload === 'string'
            ? { message: payload }
            : (payload || randomPopupPayload());

        scatterCount++;
        const style = data.style || POPUP_STYLES[Math.floor(Math.random() * POPUP_STYLES.length)];
        const tilt = data.tilt || ((Math.random() * 4 - 2).toFixed(1) + 'deg');
        const popScale = data.popScale || randomPopupScale();

        mountScatterPopup({
            message: data.message,
            imageUrl: data.imageUrl,
            imageSeed: data.imageSeed,
            style: style,
            tilt: tilt,
            popScale: popScale,
            top: data.top || '',
            left: data.left || '',
            zIndex: data.zIndex || String(8000 + scatterCount),
        });

        flushPopupsToCache();
    }

    function bindNavigationPersistence() {
        document.addEventListener('click', function (ev) {
            const link = ev.target.closest('a[href]');
            if (!link || ev.defaultPrevented) return;

            const href = link.getAttribute('href');
            if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0) return;
            if (link.target && link.target !== '_self') return;

            let sameOrigin = false;
            try {
                sameOrigin = new URL(href, location.href).origin === location.origin;
            } catch (e) { return; }
            if (!sameOrigin) return;

            ev.preventDefault();
            flushPopupsToCache();
            window.location.assign(link.href);
        }, true);
    }

    function spawnScatterBurst(count) {
        if (popupSpawnBusy || document.getElementById('infinite-loader')) return;

        const current = document.querySelectorAll('.popup-scatter').length;
        if (current >= MAX_SCATTER) return;

        const wanted = typeof count === 'number' ? count : randomBurstCount();
        const n = Math.min(wanted, MAX_SCATTER - current);
        if (n < 1) return;

        popupSpawnBusy = true;
        for (let i = 0; i < n; i++) {
            (function (idx) {
                setTimeout(function () {
                    showScatterPopup(randomPopupPayload());
                    if (idx === n - 1) popupSpawnBusy = false;
                }, Math.floor(Math.random() * 1600) * idx);
            })(i);
        }
    }

    function scheduleNextPopupSpawn() {
        clearTimeout(popupSpawnTimer);
        popupSpawnTimer = setTimeout(function () {
            if (Math.random() < 0.16) {
                scheduleNextPopupSpawn();
                return;
            }
            spawnScatterBurst();
            scheduleNextPopupSpawn();
        }, randomSpawnDelay());
    }

    function startRandomPopups() {
        restorePopupsFromCache();
        setTimeout(function () {
            spawnScatterBurst();
        }, 250 + Math.floor(Math.random() * 6000));
        scheduleNextPopupSpawn();
    }

    function showPopup(message) {
        showScatterPopup(message);
    }

    function showCookieBanner() {
        if (document.getElementById('cookie-banner') || location.pathname === '/') return;

        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.className = 'cookie-banner';
        banner.innerHTML =
            '<p>Nous utilisons 847 cookies pour améliorer votre expérience dégradée.</p>' +
            '<div class="cookie-actions">' +
            '<button type="button" class="btn-ui btn-ui-secondary" id="cookie-refuse">Refuser</button>' +
            '<button type="button" class="btn-ui btn-ui-primary" id="cookie-accept">Tout accepter</button>' +
            '</div>';

        document.body.appendChild(banner);

        function dismissBanner() {
            banner.remove();
        }

        banner.querySelector('#cookie-accept').addEventListener('click', dismissBanner);
        banner.querySelector('#cookie-refuse').addEventListener('click', dismissBanner);
    }

    function startWikiTicker() {
        if (!window.WikiWall || document.getElementById('wiki-ticker')) return;

        const ticker = document.createElement('div');
        ticker.id = 'wiki-ticker';
        ticker.className = 'wiki-ticker';
        const text = window.WikiWall.excerpts.concat(window.WikiWall.excerpts).join('  ★  ');
        ticker.innerHTML = '<div class="wiki-ticker-inner">' + text + '</div>';
        document.body.prepend(ticker);
        requestAnimationFrame(function () {
            document.documentElement.style.setProperty(
                '--wiki-ticker-height',
                ticker.offsetHeight + 'px'
            );
        });
    }

    function finishLoader(overlay, onComplete) {
        if (!overlay || overlay._finished) return;
        overlay._finished = true;
        if (overlay._progressTimer) clearInterval(overlay._progressTimer);
        if (overlay._fallbackTimer) clearTimeout(overlay._fallbackTimer);
        if (overlay._stopPong) {
            try { overlay._stopPong(); } catch (e) {}
        }
        overlay.remove();
        const callbacks = (overlay._callbacks || []).slice();
        if (onComplete) callbacks.push(onComplete);
        callbacks.forEach(function (cb) {
            try { cb(); } catch (e) { console.error(e); }
        });
    }

    function getLoaderCount() {
        let count = 0;
        try {
            count = parseInt(sessionStorage.getItem(LOADER_COUNT_KEY) || '0', 10);
        } catch (e) {}
        return isNaN(count) ? 0 : count;
    }

    function bumpLoaderCount() {
        const next = getLoaderCount() + 1;
        try {
            sessionStorage.setItem(LOADER_COUNT_KEY, String(next));
        } catch (e) {}
        return next;
    }

    function startInfiniteLoader(_title, onComplete) {
        const existing = document.getElementById('infinite-loader');
        if (existing) {
            if (onComplete) {
                if (!existing._callbacks) existing._callbacks = [];
                existing._callbacks.push(onComplete);
            }
            return existing;
        }

        const loadCount = bumpLoaderCount();

        const overlay = document.createElement('div');
        overlay.className = 'loader-overlay';
        overlay.id = 'infinite-loader';
        overlay.innerHTML =
            '<canvas class="loader-pong-canvas" id="loader-pong"></canvas>' +
            '<div class="loader-hud">' +
            '<div class="loader-card loader-card-minimal">' +
            '<div class="progress-bar-wrap"><div class="progress-bar-fill" id="progress-fill"></div></div>' +
            '</div></div>';

        overlay._callbacks = onComplete ? [onComplete] : [];
        document.body.appendChild(overlay);

        const canvas = overlay.querySelector('#loader-pong');
        if (window.LoaderPong && canvas) {
            overlay._stopPong = LoaderPong.start(canvas, overlay, { loadCount: loadCount });
        }

        const fill = overlay.querySelector('#progress-fill');
        const startTime = Date.now();

        overlay._progressTimer = setInterval(function () {
            if (!fill) {
                finishLoader(overlay, onComplete);
                return;
            }
            const elapsed = Date.now() - startTime;
            const pct = Math.min(100, (elapsed / LOADER_DURATION_MS) * 100);
            fill.style.width = pct + '%';
            if (elapsed >= LOADER_DURATION_MS) {
                finishLoader(overlay, onComplete);
            }
        }, 100);

        overlay._fallbackTimer = setTimeout(function () {
            finishLoader(overlay, onComplete);
        }, LOADER_DURATION_MS + 800);

        return overlay;
    }

    function runRegressiveProgress(onComplete) {
        const existing = document.getElementById('infinite-loader');
        if (existing) {
            if (onComplete) {
                if (!existing._callbacks) existing._callbacks = [];
                existing._callbacks.push(onComplete);
            }
            return;
        }
        if (onComplete) onComplete();
    }

    function runQuickLoad(onComplete) {
        runRegressiveProgress(onComplete);
    }

    function slowNavigate(url) {
        flushPopupsToCache();
        window.location.href = url;
    }

    function subwaySurfersVideoMeta(videoId) {
        return SUBWAY_SURFERS_VIDEOS.find(function (v) { return v.id === videoId; }) || null;
    }

    function subwaySurfersEmbedUrl(id) {
        var origin = '';
        try {
            origin = '&origin=' + encodeURIComponent(window.location.origin);
        } catch (e) {}
        return 'https://www.youtube-nocookie.com/embed/' + id +
            '?autoplay=1&mute=1&playsinline=1&controls=1&rel=0&modestbranding=1' +
            '&loop=1&playlist=' + id + origin;
    }

    function pickSubwaySurfersVideo() {
        return SUBWAY_SURFERS_VIDEOS[Math.floor(Math.random() * SUBWAY_SURFERS_VIDEOS.length)];
    }

    function applyBrainrotAspect(panel, meta) {
        panel.style.setProperty('--video-aspect', meta.aspectW + ' / ' + meta.aspectH);
        panel.dataset.videoId = meta.id;
        panel.classList.toggle('brainrot-panel-vertical', meta.aspectH > meta.aspectW);
    }

    function applyDarkTextTheme(enabled) {
        document.body.classList.toggle('theme-dark-text', !!enabled);
        try {
            localStorage.setItem(THEME_DARK_TEXT_KEY, enabled ? '1' : '0');
        } catch (e) {}
    }

    function initDarkTextTheme() {
        var enabled = false;
        try {
            enabled = localStorage.getItem(THEME_DARK_TEXT_KEY) === '1';
        } catch (e) {}
        applyDarkTextTheme(enabled);

        var toggle = document.getElementById('theme-dark-text');
        if (toggle) {
            toggle.checked = enabled;
            toggle.addEventListener('change', function () {
                applyDarkTextTheme(toggle.checked);
            });
        }
    }

    function randomBrainrotDelay() {
        return BRAINROT_SPAWN_MIN_MS +
            Math.floor(Math.random() * (BRAINROT_SPAWN_MAX_MS - BRAINROT_SPAWN_MIN_MS + 1));
    }

    function scheduleBrainrotSpawn() {
        clearTimeout(brainrotSpawnTimer);
        brainrotSpawnTimer = setTimeout(function () {
            if (!brainrotVisible &&
                !document.getElementById('brainrot-panel') &&
                !document.getElementById('infinite-loader')) {
                showBrainrot();
            }
            scheduleBrainrotSpawn();
        }, randomBrainrotDelay());
    }

    function stopVideoCloseWatcher() {
        if (videoCloseInterval) {
            clearInterval(videoCloseInterval);
            videoCloseInterval = null;
        }
    }

    function hideBrainrot() {
        const panel = document.getElementById('brainrot-panel');
        if (panel) {
            panel.remove();
            brainrotVisible = false;
        }
        stopVideoCloseWatcher();
    }

    function startVideoCloseWatcher() {
        stopVideoCloseWatcher();
        let activeSince = null;

        videoCloseInterval = setInterval(function () {
            if (!brainrotVisible) {
                stopVideoCloseWatcher();
                return;
            }

            const idleMs = Date.now() - lastUserActivity;
            if (idleMs > VIDEO_IDLE_RESET_MS) {
                activeSince = null;
                return;
            }

            if (!activeSince) {
                activeSince = Date.now();
            }

            if (Date.now() - activeSince >= VIDEO_ACTIVE_CLOSE_MS) {
                hideBrainrot();
            }
        }, 500);
    }

    function openBrainrotPanel(videoId) {
        if (brainrotVisible || document.getElementById('brainrot-panel')) return;
        if (document.getElementById('infinite-loader')) return;

        const meta = subwaySurfersVideoMeta(videoId) || pickSubwaySurfersVideo();
        videoId = meta.id;

        const panel = document.createElement('div');
        panel.id = 'brainrot-panel';
        panel.className = 'brainrot-panel';
        applyBrainrotAspect(panel, meta);
        panel.innerHTML =
            '<button type="button" class="brainrot-close" aria-label="Fermer">✕</button>' +
            '<p class="brainrot-label">Subway Surfers</p>' +
            '<div class="brainrot-video" id="brainrot-video-slot">' +
            '<iframe id="brainrot-iframe" title="Subway Surfers gameplay" ' +
            'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
            'allowfullscreen referrerpolicy="strict-origin-when-cross-origin" ' +
            'src="' + subwaySurfersEmbedUrl(videoId) + '"></iframe>' +
            '</div>';

        document.body.appendChild(panel);
        brainrotVisible = true;
        startVideoCloseWatcher();

        panel.querySelector('.brainrot-close').addEventListener('click', function (ev) {
            ev.stopPropagation();
            hideBrainrot();
        });
    }

    function showBrainrot() {
        openBrainrotPanel(pickSubwaySurfersVideo().id);
    }

    function onUserActivity() {
        const now = Date.now();
        if (now - activityThrottle < ACTIVITY_THROTTLE_MS) return;
        activityThrottle = now;
        lastUserActivity = now;
    }

    function startBrainrotMode() {
        ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'wheel'].forEach(function (ev) {
            document.addEventListener(ev, onUserActivity, { passive: true });
        });
        scheduleBrainrotSpawn();
    }

    function startMicroAnnoyances() {
        document.addEventListener('mouseover', function (e) {
            if (e.target.matches('.btn-cancel') && Math.random() < 0.1) {
                e.target.style.transform = 'translate(' + (Math.random() * 6 - 3) + 'px,' + (Math.random() * 4 - 2) + 'px)';
                setTimeout(function () { e.target.style.transform = ''; }, 250);
            }
        });
    }

    function startMisplacedChrome() {
        const searchBar = document.querySelector('header .search-bar');
        const settingsLink = document.querySelector('aside nav a[href*="settings"]');
        const settingsItem = settingsLink ? settingsLink.closest('li') : null;

        if (!searchBar || !settingsLink) return;

        const bottomBar = document.createElement('div');
        bottomBar.className = 'misplaced-bottom-bar';

        const settingsBar = document.createElement('div');
        settingsBar.className = 'search-bar misplaced-settings-bar';
        settingsBar.innerHTML =
            '<i data-lucide="settings"></i>' +
            '<a href="' + settingsLink.getAttribute('href') + '" class="search-bar-pill-link">' +
            (settingsLink.textContent.trim() || 'Paramètres') +
            '</a>';

        bottomBar.appendChild(searchBar);
        bottomBar.appendChild(settingsBar);
        document.body.appendChild(bottomBar);
        document.body.classList.add('has-misplaced-bottom-bar');

        if (settingsItem) settingsItem.remove();

        if (window.lucide && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    }

    window.AntiUX = {
        trapBackButton: trapBackButton,
        startRandomPopups: startRandomPopups,
        showPopup: showPopup,
        showScatterPopup: showScatterPopup,
        spawnScatterBurst: spawnScatterBurst,
        runRegressiveProgress: runRegressiveProgress,
        runQuickLoad: runQuickLoad,
        slowNavigate: slowNavigate,
        showCookieBanner: showCookieBanner,
        startWikiTicker: startWikiTicker,
        startBrainrotMode: startBrainrotMode,
        startMicroAnnoyances: startMicroAnnoyances,
        startMisplacedChrome: startMisplacedChrome,
        cleanupOrphans: cleanupOrphans,
        applyDarkTextTheme: applyDarkTextTheme,
    };

    window.addEventListener('pagehide', flushPopupsToCache);
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') flushPopupsToCache();
    });

    initDarkTextTheme();

    document.addEventListener('DOMContentLoaded', function () {
        migrateSessionCache();
        cleanupOrphans();
        startInfiniteLoader(null, function () {
            initDarkTextTheme();
            bindNavigationPersistence();
            trapBackButton();
            startWikiTicker();
            startRandomPopups();
            startBrainrotMode();
            startMicroAnnoyances();
            showCookieBanner();
            startMisplacedChrome();
        });
    });
})();
