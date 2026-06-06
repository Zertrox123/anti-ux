(function () {
    'use strict';

    function renderNews() {
        const list = document.getElementById('news-list');
        if (!list || !window.WikiWall) return;
        list.innerHTML = '';
        WikiWall.news.forEach(function (item) {
            const li = document.createElement('li');
            li.className = 'news-item';
            li.innerHTML =
                '<h4>' + item.title + '</h4>' +
                '<div class="news-date">' + item.date + '</div>' +
                '<p>' + item.body + '</p>';
            list.appendChild(li);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        AntiUX.runQuickLoad(function () {
            renderNews();
            WikiWall.renderWall('actus-wiki-wall', 5);
        });
    });
})();
