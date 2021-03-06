//********************************************* */

// BUS-R

// API gtfs realtime de la STM

// Quota de requêtes
// 1000 / day
// Taux maximal
// 10 / sec

// Endpoints STM
// POST /tripUpdates
// POST /vehiclePositions

// API 'nextbus' realtime de la STL
// https://gist.github.com/grantland/7cf4097dd9cdf0dfed14

// Max requete = 1 requête / 10sec

// API gtfs realtime d'exo (RTL)
// Max requête = 1 requête / 30 sec

//********************************************* */

const request = require('request');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
const fetch = require('node-fetch');
const turf = require('@turf/turf');
const moment = require('moment')

const controllers = require('./controllers')

const API_URL_STM = `https://api.stm.info/pub/od/gtfs-rt/ic/v1`;
const API_URL_RTL = `http://opendata.rtm.quebec:2539/ServiceGTFSR/TripUpdate.pb?token=${process.env.API_KEY_EXO}&agency=RTL`


const requestSettingsSTM = {
  method: 'POST',
  headers: {
    'apikey': process.env.API_KEY_STM
  },
  url: `${API_URL_STM}/tripUpdates`,
  encoding: null
};


var requestSettingsRTL = {
  method: 'GET',
  url: API_URL_RTL,
  encoding: null
};

//À valider : pourquoi avec node-fetch je n'arrive pas à passer le body de la response dans
//GtfsRealtimeBindings.FeedMessage...mais avec request ça marche?

let tripArraySTM = [];
// let vehArraySTL = [];
// let vehArrayRTL = [];

// module.exports = {

//   getPositions() {

// async function deleteAll() {
//   const removeData = await controllers.dataHandler.delete();
//   console.log('Donnees supprimées!')
//   return 'done'
// }


// Requete vers le serveur de la STM
function requestDataSTM() {
  return new Promise(function (resolve, reject) {
    request(requestSettingsSTM, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(body);
      } else {
        console.log(response.statusCode, error)
      }
    });
  })
}


// Requete vers le serveur de nextbus (STL)
// async function requestDataSTL(epochTime) {
//   //const response = await fetch(`http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=stl&t=${epochTime}`)
//   //return response.json()
// }

// Requete vers le serveur d'exo (RTL)
function requestDataRTL() {
  return new Promise(function (resolve, reject) {
    request(requestSettingsRTL, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(body);
      }
      else {
        console.log(response.statusCode, error)
      }
    })
  });
}

async function main() {

  // GESTION VEHICULES STM
  vehArraySTM = [];

  let newData = await requestDataSTM();

  let feed = GtfsRealtimeBindings.FeedMessage.decode(newData);

  //console.log(feed);

  const tripUpdates = Object.values(feed.entity);

  //console.log(tripUpdates[0]);

  tripUpdates.forEach((e) => {
    tripArraySTM.push([e.id, e.trip_update.trip.start_time, e.trip_update.trip.start_date])
  })

  //console.log(tripArraySTM)

  // vehicles.forEach((e) => {
  //   let vehPos = turf.point([e.vehicle.position.longitude, e.vehicle.position.latitude], {
  //     vehicle_id: e.id,
  //     route_id: e.vehicle.trip.route_id,
  //     trip_id: e.vehicle.trip.trip_id,
  //     start_time: e.vehicle.trip.start_time,
  //     start_date: e.vehicle.trip.start_date,
  //     current_stop_sequence: e.vehicle.current_stop_sequence,
  //     timestamp: moment.duration(new moment().format('x') - moment.unix(e.vehicle.timestamp.low)).as('seconds'),
  //     server_request: new Date()
  //   });
  //   vehArraySTM.push(vehPos);
  // })

  // console.log('Nombre de bus en ligne STM :', vehArraySTM.length);

  // GESTION VEHICULES STL
  // L'API nextbus ne donne pas les mêmes infos que gtfs-r
  // let epochTime = (new Date).getTime() / 1000;
  // let dataSTL = await requestDataSTL(epochTime);
  // vehArraySTL = [];

  //Les donnnées sont reçues même si la dernière coordonnée GPS a été
  //transmise par le véhicule il y a plus de 5 minutes... il faut donc
  //appliquer un seuil pour éviter d'avoir des données en trop. Mon choix,
  //conserver les vehicules qui ont fait une mise a jour il y a moins de 90s.

  // dataSTL.vehicle.forEach((e) => {
  //   if (e.secsSinceReport <= 90) {
  //     vehArraySTL.push(turf.point([parseFloat(e.lon), parseFloat(e.lat)], {
  //       route_id: e.routeTag,
  //       vehicle_id: e.id,
  //       speedKmHr: e.speedKmHr,
  //       last_connection: e.secsSinceReport
  //     }));
  //   }
  // })

  // console.log('Nombre de bus en ligne STL :', vehArraySTL.length);


  // GESTION VEHICULES RTL
  vehArrayRTL = [];

  let dataRTL = await requestDataRTL();
  let feedRTL = GtfsRealtimeBindings.FeedMessage.decode(dataRTL);

  const tripUpdatesRTL = Object.values(feedRTL.entity);

  console.log(tripUpdatesRTL);

  // vehiclesRTL.forEach((e) => {
  //   let vehPosRTL = turf.point([e.vehicle.position.longitude, e.vehicle.position.latitude], {
  //     vehicle_id: e.id,
  //     route_id: e.vehicle.trip.route_id,
  //     trip_id: e.vehicle.trip.trip_id,
  //     start_time: e.vehicle.trip.start_time,
  //     start_date: e.vehicle.trip.start_date,
  //     current_stop_sequence: e.vehicle.current_stop_sequence,
  //     timestamp: moment.duration(new moment().format('x') - moment.unix(e.vehicle.timestamp.low)).as('seconds'),
  //     server_request: new Date()
  //   });
  //   vehArrayRTL.push(vehPosRTL);
  // })

  // console.log('Nombre de bus en ligne RTL :', vehArrayRTL.length);



  //     }

  //     // Insertion des données dans la BD

  //   }

}

main();