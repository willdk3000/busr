# busr

Application qui permet de localiser les bus de la STM et de la STL en temps réel.

## Avant de débuter

Le guide suivant permet d'installer une copie locale du projet et de l'exécuter pour utilisation.

### Prérequis

```
Node
PostgreSQL
Un compte STM développeur avec une clé API
Un compte Mapbox avec une clé API
```

### Installation

Installation étape par étape :


```
Copier le repo sur la machine locale
```

```
cd server
npm install // installation des dépendances du serveur
cd ..
cd client
npm install // installation des dépendances du client
```

```
Configurer la BD et le fichier .env du côté serveur (Accès BD+CLÉ STM) et du côté client (CLÉ MAPBOX)
Créer une table "vehicles" avec les champs:
* "timestamp" (timestamp without timezone) 
* "time" (time without timezone)
* "data" (jsonb)
* "vehlen" (integer)
* "weekday" (text)
* "reseau" (text)
```

```
cd server
npm run start:dev // démarrage de l'app, devrait rouler sur localhost:3000
```

Le serveur fait une requête POST vers les serveurs de la STM et de la STL à toutes les 30 secondes.
Les données reçues sont stockées dans la base de données.

Quand un client se connecte au serveur, il démarre une boucle qui envoie les données
de la BD vers le client aux 15 secondes.

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
