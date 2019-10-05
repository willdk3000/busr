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

// Autres agences CITVR, CITLA, 
//********************************************* */

const request = require('request');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
const fetch = require('node-fetch');
const turf = require('@turf/turf');
const moment = require('moment')

const controllers = require('./controllers')

const API_URL_STM = `https://api.stm.info/pub/od/gtfs-rt/ic/v1`;
const API_URL_RTL = `http://opendata.rtm.quebec:2539/ServiceGTFSR/VehiclePosition.pb?token=${process.env.API_KEY_EXO}&agency=RTL`
const API_URL_CITVR = `http://opendata.rtm.quebec:2539/ServiceGTFSR/VehiclePosition.pb?token=${process.env.API_KEY_EXO}&agency=CITVR`
const API_URL_CITLA = `http://opendata.rtm.quebec:2539/ServiceGTFSR/VehiclePosition.pb?token=${process.env.API_KEY_EXO}&agency=CITLA`
const API_URL_OMITSJU = `http://opendata.rtm.quebec:2539/ServiceGTFSR/VehiclePosition.pb?token=${process.env.API_KEY_EXO}&agency=OMITSJU`


const requestSettingsSTM = {
  method: 'POST',
  headers: {
    'apikey': process.env.API_KEY_STM
  },
  url: `${API_URL_STM}/vehiclePositions`,
  encoding: null
};


const requestSettingsRTL = {
  method: 'GET',
  url: API_URL_RTL,
  encoding: null
};

const requestSettingsCITVR = {
  method: 'GET',
  url: API_URL_CITVR,
  encoding: null
};

const requestSettingsCITLA = {
  method: 'GET',
  url: API_URL_CITLA,
  encoding: null
};

const requestSettingsOMITSJU = {
  method: 'GET',
  url: API_URL_OMITSJU,
  encoding: null
};

//À valider : pourquoi avec node-fetch je n'arrive pas à passer le body de la response dans
//GtfsRealtimeBindings.FeedMessage...mais avec request ça marche?

let vehArraySTM = [];
let vehArraySTL = [];
let vehArrayRTL = [];
let vehArrayCITVR = [];
let vehArrayCITLA = [];
let vehArrayOMITSJU = [];

module.exports = {

  getPositions() {

    async function deleteAll() {
      const removeData = await controllers.dataHandler.delete();
      console.log('Donnees supprimées!')
      return 'done'
    }


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
    async function requestDataSTL(epochTime) {
      const response = await fetch(`http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=stl&t=${epochTime}`)
      return response.json()
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

    function requestDataCITLA() {
      return new Promise(function (resolve, reject) {
        request(requestSettingsCITLA, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            resolve(body);
          }
          else {
            console.log(response.statusCode, error)
          }
        })
      });
    }

    function requestDataCITVR() {
      return new Promise(function (resolve, reject) {
        request(requestSettingsCITVR, function (error, response, body) {
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

      let feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(newData);
      const vehicles = Object.values(feed.entity);

      vehicles.forEach((e) => {
        let vehPos = turf.point([e.vehicle.position.longitude, e.vehicle.position.latitude], {
          vehicle_id: e.id,
          route_id: e.vehicle.trip.routeId,
          trip_id: e.vehicle.trip.tripId,
          start_time: e.vehicle.trip.startTime,
          start_date: e.vehicle.trip.startDate,
          current_stop_sequence: e.vehicle.currentStopSequence,
          timestamp: moment.duration(new moment().format('x') - moment.unix(e.vehicle.timestamp.low)).as('seconds'),
          server_request: new Date()
        });
        vehArraySTM.push(vehPos);
      })

      console.log('Nombre de bus en ligne STM :', vehArraySTM.length);

      // GESTION VEHICULES STL
      // L'API nextbus ne donne pas les mêmes infos que gtfs-r
      let epochTime = (new Date).getTime() / 1000;
      let dataSTL = await requestDataSTL(epochTime);
      vehArraySTL = [];

      //Les donnnées sont reçues même si la dernière coordonnée GPS a été
      //transmise par le véhicule il y a plus de 5 minutes... il faut donc
      //appliquer un seuil pour éviter d'avoir des données en trop. Mon choix,
      //conserver les vehicules qui ont fait une mise a jour il y a moins de 90s.

      dataSTL.vehicle.forEach((e) => {
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


      // GESTION VEHICULES CITLA
      vehArrayCITLA = [];
      let dataCITLA = await requestDataCITLA();
      let feedCITLA = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(dataCITLA);
      const vehiclesCITLA = Object.values(feedCITLA.entity);

      vehiclesCITLA.forEach((e) => {
        let vehPosCITLA = turf.point([e.vehicle.position.longitude, e.vehicle.position.latitude], {
          vehicle_id: e.id,
          route_id: e.vehicle.trip.routeId,
          trip_id: e.vehicle.trip.tripId,
          timestamp: moment.duration(new moment().format('x') - moment.unix(e.vehicle.timestamp.low)).as('seconds'),
          server_request: new Date()
        });
        vehArrayCITLA.push(vehPosCITLA);
      })

      console.log('Nombre de bus en ligne CITLA :', vehArrayCITLA.length);

      // GESTION VEHICULES CITVR
      vehArrayCITVR = [];
      let dataCITVR = await requestDataCITVR();
      let feedCITVR = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(dataCITVR);
      const vehiclesCITVR = Object.values(feedCITVR.entity);

      vehiclesCITVR.forEach((e) => {
        let vehPosCITVR = turf.point([e.vehicle.position.longitude, e.vehicle.position.latitude], {
          vehicle_id: e.id,
          route_id: e.vehicle.trip.routeId,
          trip_id: e.vehicle.trip.tripId,
          timestamp: moment.duration(new moment().format('x') - moment.unix(e.vehicle.timestamp.low)).as('seconds'),
          server_request: new Date()
        });
        vehArrayCITVR.push(vehPosCITVR);
      })

      console.log('Nombre de bus en ligne CITVR :', vehArrayCITVR.length);


      // Insérer les données dans la BD
      const insertALL = await insertData();
      console.log('Mise a jour complétée');

      return 'done'

    }

    // Insertion des données dans la BD
    async function insertData() {
      let vehFeatSTM = turf.featureCollection(vehArraySTM);
      let vehFeatSTL = turf.featureCollection(vehArraySTL);
      let vehFeatRTL = turf.featureCollection(vehArrayRTL);
      let vehFeatCITLA = turf.featureCollection(vehArrayCITLA);
      let vehFeatCITVR = turf.featureCollection(vehArrayCITVR);

      const setPositionsSTM = await controllers.dataHandler.insertSTM(JSON.stringify([vehFeatSTM]));
      const setPositionsSTL = await controllers.dataHandler.insertSTL(JSON.stringify([vehFeatSTL]));
      const setPositionsRTL = await controllers.dataHandler.insertRTL(JSON.stringify([vehFeatRTL]));
      const setPositionsCITLA = await controllers.dataHandler.insertCITLA(JSON.stringify([vehFeatCITLA]));
      const setPositionsCITVR = await controllers.dataHandler.insertCITVR(JSON.stringify([vehFeatCITVR]));


      console.log('Nouvelles données insérées');
      return 'done'
    }

    setInterval(main, 30000);
  }
}
