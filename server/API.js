//********************************************* */

//BUS-R STM
//API gtfs realtime de la STM

// Quota de requêtes
// 1000 / day
// Taux maximal
// 10 / sec

// Endpoints STM
//POST /tripUpdates
//POST /vehiclePositions

//********************************************* */

const request = require('request');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');

const turf = require('@turf/turf');

const controllers = require('./controllers')

const API_URL = `https://api.stm.info/pub/od/gtfs-rt/ic/v1`;

const requestSettings = {
  method: 'POST',
  headers: {
    'apikey': 'l7xxdf9fc4d9e1734698ba426cd60fb2d069'
  },
  url: `${API_URL}/vehiclePositions`,
  encoding: null
};

//À valider : pourquoi avec node-fetch je n'arrive pas à passer le body de la response dans
//GtfsRealtimeBindings.FeedMessage...mais avec request ça marche?

let featureArray = [];

module.exports = {

  getPositions() {

    async function deleteAll() {
      const removeData = await controllers.dataHandler.delete();
      console.log('Donnees supprimees!')
      return 'done'
    }

    function requestData() {
      return new Promise(function (resolve, reject) {
        request(requestSettings, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            resolve(body);
          };
        });
      })
    }

    async function main() {
      //let deleted = await deleteAll();
      featureArray = [];

      var newData = await requestData();
      var feed = GtfsRealtimeBindings.FeedMessage.decode(newData);
      const vehicles = Object.values(feed.entity);

      vehicles.forEach((e) => {
        let vehPos = turf.point([e.vehicle.position.longitude, e.vehicle.position.latitude], {
          vehicle_id: e.id,
          route_id: e.vehicle.trip.route_id,
          start_time: e.vehicle.trip.start_time,
          start_date: e.vehicle.trip.start_date,
          current_stop_sequence: e.vehicle.current_stop_sequence,
          timestamp: e.vehicle.timestamp.low,
          server_request: new Date()
        });
        featureArray.push(vehPos);
      })

      console.log('Nombre de bus en ligne :', vehicles.length);

      const insert = await insertData();
      console.log('Mise a jour completee')
      return 'done'

    }

    async function insertData() {
      let featureCollection = turf.featureCollection(featureArray);
      const setPositions = await controllers.dataHandler.insert(JSON.stringify([featureCollection]));
      console.log('Nouvelles donnees inserees');
      return 'done'
    }

    setInterval(main, 20000);
  }
}
