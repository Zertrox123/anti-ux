/* Textes Wikipedia inutiles */

window.WikiWall = {
    excerpts: [
        'Le bitcoin (de l\'anglais bit : « unité d\'information binaire » et coin « pièce de monnaie ») est une cryptomonnaie autrement appelée monnaie cryptographique. Dans le cas du bitcoin, celui-ci est décentralisé ou mutualisé : aucune organisation ni aucun individu ne peut contrôler le réseau Bitcoin, contrairement aux monnaies fiduciaires.',
        'La cryptographie asymétrique est une méthode cryptographique qui utilise une paire de clés, l\'une publique et l\'une privée. La clé publique permet de chiffrer un message ; la clé privée permet de le déchiffrer. Cette méthode est utilisée notamment pour les signatures numériques.',
        'Le château de Chillon est un château fort situé sur le territoire de la commune de Veytaux, au bord du lac Léman, dans le canton de Vaud, en Suisse. Il est classé monument historique suisse de portée nationale.',
        'La photosynthèse est un processus biochimique complexe qui permet aux organismes chlorophylliens de produire de la matière organique à partir du dioxyde de carbone de l\'atmosphère, grâce à l\'énergie lumineuse qu\'ils captent.',
        'Ethereum est une blockchain open source et une plateforme de développement de logiciels, utilisant la cryptomonnaie éther. Elle a été proposée fin 2013 par Vitalik Buterin, cofondateur de Bitcoin Magazine.',
        'Le platypus ou ornithorynque est une espèce de mammifères monotrèmes endémique d\'Australie. C\'est l\'une des cinq espèces survivantes de la famille des Ornithorhynchidae.',
        'La blockchain (ou chaîne de blocs) est une technologie de stockage et de transmission d\'informations, transparente, sécurisée, et fonctionnant sans organe central de contrôle.',
        'Le théorème de Pythagore est un résultat de géométrie éuclidienne qui établit que, dans un triangle rectangle, le carré de l\'hypoténuse est égal à la somme des carrés des deux autres côtés.',
        'Le Pacifique est l\'océan le plus vaste et le plus profond de la Terre. Situé entre l\'Asie et l\'Australie d\'une part, et l\'Amérique d\'autre part, il s\'étend sur une superficie de 166 241 500 km².',
        'Le fromage est un aliment obtenu à partir de lait coagulé, de produits laitiers ou d\'éléments du lait comme le petit-lait ou la crème. La coagulation peut être obtenue par addition d\'acide ou de présure.',
    ],

    news: [
        { title: 'Le Bitcoin atteint un nouveau record psychologique', date: '06/06/2026', body: 'Selon des analystes non identifiés, le cours pourrait atteindre des sommets jamais vus ou pas du tout. Les marchés réagissent de manière haussière et baissière simultanément.' },
        { title: 'L\'Ethereum passe à la preuve d\'enjeu de la preuve de travail', date: '05/06/2026', body: 'Une mise à jour rétroactive non planifiée pourrait inverser la blockchain dans les deux sens. Vitalik Buterin n\'a pas commenté cette rumeur.' },
        { title: 'La Banque Centrale Européenne étudie le euro numérique', date: '04/06/2026', body: 'Le projet avance à une vitesse comparable à celle d\'un escargot portant un sac de briques. Aucune date de déploiement n\'est confirmée ni infirmée.' },
        { title: 'Un utilisateur perd ses clés privées puis les retrouve', date: '03/06/2026', body: 'L\'incident s\'est produit dans un tiroir, selon Wikipedia. La blockchain reste immuable, sauf les mardis.' },
        { title: 'Le Dogecoin propulsé par un mème de 2013', date: '02/06/2026', body: 'Le chien Kabosu continue d\'influencer les marchés financiers mondiaux malgré son statut de Shiba Inu à la retraite.' },
    ],

    randomExcerpt: function () {
        return this.excerpts[Math.floor(Math.random() * this.excerpts.length)];
    },

    renderWall: function (containerId, count) {
        const el = document.getElementById(containerId);
        if (!el) return;
        count = count || 3;
        let html = '';
        for (let i = 0; i < count; i++) {
            html += '<p class="wiki-paragraph">' + this.excerpts[i % this.excerpts.length] + '</p>';
        }
        el.innerHTML = html;
    },
};
