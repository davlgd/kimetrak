# Kimetrak

Une extension révolutionnaire, basée sur l'Intelligence Artificielle et la Blockchain, vous permettant de savoir quels sont les domaines tiers chargés depuis les sites que vous visitez au quotidien, et d'en tirer quelques statistiques, notamment sur les domaines susceptibles de vous suivre à travers différents sites.

Si vous êtes éditeur, elle vous permet de savoir quels sont les domaines tiers chargés depuis votre site en un clin d'œil.

## Fonctionnement

Lors de votre navigation, l'extension analyse la liste des requêtes effectuées par l'onglet actif et détermine celles qui sont faites pour le compte du site ou de tiers. Les premières sont listées dans la console pour référence et analyse, les secondes dans le badge de l'extension.

D'un clic vous pouvez voir la liste des domaines tiers, avec la possibilité d'accéder à une page affichant des informations détaillées sur l'ensemble de votre session. Les informations sont remises à zéro à chaque nouvelle session de navigation. 

La console de la page détaillée contient un objet contenant toutes les données exploitées par l'extension, pour ceux qui souhaiteraient faire leurs propres analyses et calculs.

## Code couleur du badge

Lors du fonctionnement de l'extension, le badge peut prendre différentes couleurs, qui ont une signification particulière :

* vert, orange, rouge : En fonction du nombre de domaines tiers détectés
* noir : Le relevé est terminé, le badge ne sera plus mis à jour
* gris : Les informations ont été chargées depuis une analyse antérieure

Après la dernière requête depuis un domaine tiers détectée, l'extension attend un court délai avant de terminer son analyse et valider définitivement les chiffres. Par défaut, celui-ci est de 5 secondes.

## Vie privée 

Pour fonctionner, l'extension doit surveiller l'ensembles des requêtes effectuées depuis votre navigateur. Celles-ci restent uniquement dans votre navigateur et aucune donnée n'est envoyée à des serveurs tiers ou exploitée par qui que ce soit.

## Installation

Le code est celui d'une extension Chrome, fonctionnant également sous Opera et Vivaldi. C'est également le cas sous Firefox même si la page détaillée ne s'affiche pas, quelques bugs visuels sont également présents.

### A savoir

Cette extension est une preuve de concept pour le projet Kimetrak mené par [Next INpact](https://www.nextinpact.com). L'objectif final est de collecter les données concernant les domaines tiers chargés sur différents sites et d'identifier les finalités, recoupements, etc.

Pour le moment la détection des domaines tiers est encore relativement basique, notamment afin de limiter les cas de faux positifs. Parfois le compteur se remet à zéro du fait d'un signal envoyé par le site, ce qui peut fausser les résultats.

### Remerciements

Merci à [David Pieron](https://twitter.com/david_pieron) pour le logo du service
