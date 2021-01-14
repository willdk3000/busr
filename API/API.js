//********************************************* */
// BUS-R

// API gtfs realtime de la STM
// Max requete = 5 requêtes / seconde
// 13 000 requêtes / jour

// API 'nextbus' realtime de la STL
// https://gist.github.com/grantland/7cf4097dd9cdf0dfed14
// Max requete = 1 requête / 10sec

// API gtfs realtime d'exo (RTL)
// Max requête = 1 requête / 30 sec
 
//********************************************* */

require('dotenv').config()
const request = require('request');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
const turf = require('@turf/turf');
const moment = require('moment');

const controllers = require('../controllers')
const stm = require('./stm.js');
const exo = require('./exo.js');

const API_URL_RTL = `http://opendata.rtm.quebec:2539/ServiceGTFSR/VehiclePosition.pb?token=${process.env.API_KEY_EXO}&agency=RTL`

const requestSettingsRTL = {
  method: 'GET',
  url: API_URL_RTL,
  encoding: null
};



//À valider : pourquoi avec node-fetch je n'arrive pas à passer le body de la response dans
//GtfsRealtimeBindings.FeedMessage...mais avec request ça marche?

let vehArraySTL = [];
let vehArrayRTL = [];

module.exports = {

  getPositions() {

    async function deleteAll() {
      const removeData = await controllers.dataHandler.delete();
      console.log('Donnees supprimées!')
      return 'done'
    }

    
    // Requete vers le serveur de nextbus (STL)
    function requestDataSTL(epochTime) {
      
      const API_URL_STL = `http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=stl&t=${epochTime}`

      const requestSettingsSTL = {
        method: 'GET',
        url: API_URL_STL
      }

      return new Promise(function (resolve, reject) {
        request(requestSettingsSTL, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            resolve(body);
          }
          else {
            console.log(response, error)
          }
        })
      });


    }

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
      await stm.handleSTM();


      // GESTION VEHICULES STL
      // L'API nextbus ne donne pas les mêmes infos que gtfs-r
      let epochTime = (new Date).getTime() / 1000;
      let dataSTL = await requestDataSTL(epochTime);
      dataSTLparsed = JSON.parse(dataSTL);
      vehArraySTL = [];

      //Les donnnées sont reçues même si la dernière coordonnée GPS a été
      //transmise par le véhicule il y a plus de 5 minutes... il faut donc
      //appliquer un seuil pour éviter d'avoir des données en trop. Mon choix,
      //conserver les vehicules qui ont fait une mise a jour il y a moins de 90s.

      dataSTLparsed.vehicle.forEach((e) => {
        if (e.secsSinceReport <= 90) {
          vehArraySTL.push(turf.point([parseFloat(e.lon), parseFloat(e.lat)], {
            route_id: e.routeTag,
            vehicle_id: e.id,
            speedKmHr: e.speedKmHr,
            last_connection: e.secsSinceReport
          }));
        }
      })

      console.log('Nombre de bus en ligne STL :', vehArraySTL.length);


      // GESTION VEHICULES RTL
      vehArrayRTL = [];

      let dataRTL = await requestDataRTL();
      let feedRTL = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(dataRTL);

      const vehiclesRTL = Object.values(feedRTL.entity);

      //console.log(vehiclesRTL);

      vehiclesRTL.forEach((e) => {
        let vehPosRTL = turf.point([e.vehicle.position.longitude, e.vehicle.position.latitude], {
          vehicle_id: e.id,
          route_id: e.vehicle.trip.routeId,
          trip_id: e.vehicle.trip.tripId,
          timestamp: moment.duration(new moment().format('x') - moment.unix(e.vehicle.timestamp.low)).as('seconds'),
          server_request: new Date()
        });
        vehArrayRTL.push(vehPosRTL);
      })

      console.log('Nombre de bus en ligne RTL :', vehArrayRTL.length);


      // GESTION VEHICULES EXO
      let cit_array = await exo.handleEXO();


      // Insérer les données dans la BD
      const insertALL = await insertData(cit_array);
      console.log('Update complete');

      return 'done'

    }

    // Insertion des données dans la BD
    async function insertData(cit_array) {

      // Deleting data history everytime data is fetched can cause problems if
      // 2 users are connected at the same time. If a user is getting the data
      // and a second user connects, the data will delete and render an error
      // for the first user.

      //const removeData = await deleteAll();


      let vehFeatSTM = turf.featureCollection(vehArraySTM);
      let vehFeatSTL = turf.featureCollection(vehArraySTL);
      let vehFeatRTL = turf.featureCollection(vehArrayRTL);

      const setPositionsSTM = await controllers.dataHandler.insertSTM(JSON.stringify([vehFeatSTM]));
      const setPositionsSTL = await controllers.dataHandler.insertSTL(JSON.stringify([vehFeatSTL]));
      const setPositionsRTL = await controllers.dataHandler.insertRTL(JSON.stringify([vehFeatRTL]));


      for (let e=0; e<=11; e++) {

        let vehFeat = turf.featureCollection(cit_array[e].vehArray);
        const setPositions= await controllers.dataHandler.insertEXO({CIT: cit_array[e].CIT, VEH: JSON.stringify([vehFeat])});
        
      }


      console.log('New data inserted');
      return 'done'
    }

    setInterval(main, 30000);
  }
}
