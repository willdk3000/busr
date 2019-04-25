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

// Max requete = 1 requete / 10sec

//********************************************* */

const request = require('request');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
const fetch = require('node-fetch');
const turf = require('@turf/turf');

const controllers = require('./controllers')

const API_URL = `https://api.stm.info/pub/od/gtfs-rt/ic/v1`;

const requestSettings = {
  method: 'POST',
  headers: {
    'apikey': process.env.API_KEY
  },
  url: `${API_URL}/vehiclePositions`,
  encoding: null
};

//À valider : pourquoi avec node-fetch je n'arrive pas à passer le body de la response dans
//GtfsRealtimeBindings.FeedMessage...mais avec request ça marche?

let featureArraySTM = [];
let vehArraySTL = [];
let vehArraySTL_unique = [];
let dataSTL = [];

module.exports = {

  getPositions() {

    async function deleteAll() {
      const removeData = await controllers.dataHandler.delete();
      console.log('Donnees supprimees!')
      return 'done'
    }

    function requestDataSTM() {
      return new Promise(function (resolve, reject) {
        request(requestSettings, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            resolve(body);
          } else {
            console.log(response.statusCode, error)
          }
        });
      })
    }

    async function requestDataSTL(epochTime) {
      const response = await fetch(`http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=stl&t=${epochTime}`)
      return response.json()
    }

    async function main() {

      // GESTION VEHICULES STM
      featureArraySTM = [];

      let newData = await requestDataSTM();

      let feed = GtfsRealtimeBindings.FeedMessage.decode(newData);
      const vehicles = Object.values(feed.entity);

      vehicles.forEach((e) => {
        let vehPos = turf.point([e.vehicle.position.longitude, e.vehicle.position.latitude], {
          vehicle_id: e.id,
          route_id: e.vehicle.trip.route_id,
          trip_id: e.vehicle.trip.trip_id,
          start_time: e.vehicle.trip.start_time,
          start_date: e.vehicle.trip.start_date,
          current_stop_sequence: e.vehicle.current_stop_sequence,
          timestamp: e.vehicle.timestamp.low,
          server_request: new Date()
        });
        featureArraySTM.push(vehPos);
      })

      console.log('Nombre de bus en ligne STM :', vehicles.length);

      const insertSTM = await insertData(vehicles.length);
      console.log('Mise a jour completee STM');



      // GESTION VEHICULES STL
      let epochTime = (new Date).getTime() / 1000;
      let dataSTL = await requestDataSTL(epochTime);

      dataSTL.vehicle.forEach((e) => {
        vehArraySTL.push(turf.point([parseFloat(e.lon), parseFloat(e.lat)], {
          route_id: e.routeTag,
          vehicle_id: e.id,
          last_connection: e.secsSinceReport
        }));
      })

      console.log('Nombre de bus en ligne STL :', vehArraySTL.length);

      //L'API nextbus semble dedoubler les donnees, donc rendre unique
      //let vehArraySTL_unique = [...new Set(vehArraySTL)]

      //console.log(vehArraySTL_unique)

      let vehIDs = dataSTL.vehicle.map((e) => e.id)
      // console.log(vehIDs)
      // console.log(vehIDs.length)

      const insertSTL = await insertData(vehIDs);
      console.log('Mise a jour completee STL');

      return 'done'

    }

    async function insertData(vehLength) {
      let featureCollection = turf.featureCollection(featureArraySTM);
      let vehFeatSTL = turf.featureCollection(vehArraySTL);

      const setPositionsSTM = await controllers.dataHandler.insertSTM(JSON.stringify([featureCollection]));
      const setPositionsSTL = await controllers.dataHandler.insertSTL(JSON.stringify([vehFeatSTL]));

      console.log('Nouvelles donnees inserees');
      return 'done'
    }

    setInterval(main, 30000);
  }
}
