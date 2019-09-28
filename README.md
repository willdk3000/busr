# busr

Web app for geolocation of public transit vehicles of the STM, STL and RTL in realtime.

## Before you begin

This guide is designed to help you install and run a local copy of this project.

### Prerequisites

```
Node.js
PostgreSQL
STM developer portal account with API key
API key for EXO realtime data
Mapbox account with API key
```


### Installation and setup


```
Copy repo to local machine
```

```
>npm install // instal server dependencies
>knex-migrate up

```

```
Create /gtfs folder and download gtfs files, then
>gulp import_tables_STM
>gulp import_tables_STL
>gulp import_tables_RTL
```

```
>cd client
>npm install // install clien dependencies
```

```
Create backend .env file with DB credentials, STM API key, EXO API key
Create frontend .env file with Mapbox API key
```


```
cd ..
npm run start:dev // startup app on localhost:3000
```
When running, server requests data from STM, STL and EXO servers every 30 seconds.

Data received is stored to PostgreSQL database.

Loop starts when client connects sending him updated data every 5 seconds until
he disconnects.

## Tech-Stack

* [Express](https://expressjs.com/) - Framework
* [SocketIO](https://socket.io/) - Server-client communication
* [React](https://reactjs.org/) - Frontend
* [ReactMapGL](https://uber.github.io/react-map-gl/#/) - Maps
* [Recharts](http://recharts.org/en-US/) - Graphs
* [Bootstrap](https://getbootstrap.com/) - Styles
* [Fontawesome](https://fontawesome.com/?from=io) - Icons
* [PostgreSQL](https://www.postgresql.org/) - Database

## Author

* **William Doucet-Koussaya**

## License

This project is subject to MIT licence - see [LICENSE.md](LICENSE.md)

## Other libraries

* create-react-app
* momentjs
* knex
* gulp
* protobufjs
