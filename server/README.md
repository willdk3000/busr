# busr

Application qui permet de localiser les bus de la STM en temps réel à partir des données ouvertes gtfsr.

## Avant de débuter

Le guide suivant permet d'installer une copie locale du projet et de l'exécuter pour utilisation.

### Prérequis

```
Node
PostgreSQL
```

### Installation

Installation étape par étape :


```
Copier le repo sur la machine locale
```

```
npm install // installation des dépendances de l'API
cd client
npm install // installation des dépendances de l'interface
```

```
cd ..
npm run start:dev // démarrage de l'app, devrait rouler sur localhost:3000
```

La carte affiche les bus à proximité en fonction de la position actuelle.

## Tech-Stack

* [Express](http://expressjs.com/) - Framework
* [React](https://reactjs.org/) - Frontend
* [Bootstrap](https://getbootstrap.com/) - Styles
* [PostgreSQL](https://www.postgresql.org/) - Base de données

## Auteur

* **William Doucet-Koussaya**

## License

Ce projet est assujetti à la licence MIT - voir [LICENSE.md](LICENSE.md)

## Autres librairies

* create-react-app
* momentjs
* knex
