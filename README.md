# busr

Application qui permet de localiser les bus de la STM en temps réel.

## Avant de débuter

Le guide suivant permet d'installer une copie locale du projet et de l'exécuter pour utilisation.

### Prérequis

```
Node
PostgreSQL
Un compte STM développeur avec un clé API
```

### Installation

Installation étape par étape :


```
Copier le repo sur la machine locale
```

```
cd server
npm install // installation des dépendances du serveur
cd client
npm install // installation des dépendances du client
```

```
Configurer la BD et le fichier .env
Créer une table "vehicles" avec un champ "timestamp" (timestamp with timezone) et un champ "data" (jsonb)
```

```
cd ..
cd server
npm run start:dev // démarrage de l'app, devrait rouler sur localhost:3000
```

Le serveur fait une requête POST vers les serveurs de la STM à toutes les 20 secondes.
Les données reçues sont stockées dans la base de données.

Quand un client se connecte au serveur, il démarre une boucle qui envoie les données
de la BD vers le client aux 20 secondes.

## Tech-Stack

* [Express](https://expressjs.com/) - Framework
* [SocketIO](https://socket.io/) - Communication bidirectionnelle
* [React](https://reactjs.org/) - Frontend
* [ReactMapGL](https://uber.github.io/react-map-gl/#/) - Cartographie
* [Bootstrap](https://getbootstrap.com/) - Styles
* [Fontawesome](https://fontawesome.com/?from=io) - Icones
* [PostgreSQL](https://www.postgresql.org/) - Base de données

## Auteur

* **William Doucet-Koussaya**

## License

Ce projet est assujetti à la licence MIT - voir [LICENSE.md](LICENSE.md)

## Autres librairies

* create-react-app
* knex
