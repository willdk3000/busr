const request = require('request');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
const turf = require('@turf/turf');
const moment = require('moment');

module.exports = {

 handleSTM() {

    vehArraySTM = [];

    const API_URL_STM = `https://api.stm.info/pub/od/gtfs-rt/ic/v1`;
    
    const requestSettingsSTM = {
        method: 'POST',
        headers: {
          'apikey': process.env.API_KEY_STM
        },
        url: `${API_URL_STM}/vehiclePositions`,
        encoding: null
      };
    
      const myPromiseSTM = new Promise((resolve, reject) => {  
        request(requestSettingsSTM, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            resolve(body);
          }
          else {
            console.log(response.statusCode, error)
          }
        })
      });
    
        
      myPromiseSTM.then((message) => { 
        let feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(message);
        //console.log('feed', feed);
        const vehicles = Object.values(feed.entity);
        //console.log('vehicles', vehicles)
        vehicles.forEach((e) => {
          let vehPos = turf.point([e.vehicle.position.longitude, e.vehicle.position.latitude], {
            reseau: 'STM',
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

      }).catch((message) => { 
        console.log(message);
      })

    }
};