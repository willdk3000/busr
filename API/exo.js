const request = require('request');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
const turf = require('@turf/turf');
const moment = require('moment');

const API_URL_CITVR = `http://opendata.rtm.quebec:2539/ServiceGTFSR/VehiclePosition.pb?token=${process.env.API_KEY_EXO}&agency=CITVR`
const API_URL_CITLA = `http://opendata.rtm.quebec:2539/ServiceGTFSR/VehiclePosition.pb?token=${process.env.API_KEY_EXO}&agency=CITLA`
const API_URL_OMITSJU = `http://opendata.rtm.quebec:2539/ServiceGTFSR/VehiclePosition.pb?token=${process.env.API_KEY_EXO}&agency=OMITSJU`
const API_URL_MRCLASSO = `http://opendata.rtm.quebec:2539/ServiceGTFSR/VehiclePosition.pb?token=${process.env.API_KEY_EXO}&agency=MRCLASSO`
const API_URL_MRCLM = `http://opendata.rtm.quebec:2539/ServiceGTFSR/VehiclePosition.pb?token=${process.env.API_KEY_EXO}&agency=MRCLM`
const API_URL_CITCRC = `http://opendata.rtm.quebec:2539/ServiceGTFSR/VehiclePosition.pb?token=${process.env.API_KEY_EXO}&agency=CITCRC`
const API_URL_CITHSL = `http://opendata.rtm.quebec:2539/ServiceGTFSR/VehiclePosition.pb?token=${process.env.API_KEY_EXO}&agency=CITHSL`
const API_URL_CITPI = `http://opendata.rtm.quebec:2539/ServiceGTFSR/VehiclePosition.pb?token=${process.env.API_KEY_EXO}&agency=CITPI`
const API_URL_CITLR = `http://opendata.rtm.quebec:2539/ServiceGTFSR/VehiclePosition.pb?token=${process.env.API_KEY_EXO}&agency=CITLR`
const API_URL_CITROUS = `http://opendata.rtm.quebec:2539/ServiceGTFSR/VehiclePosition.pb?token=${process.env.API_KEY_EXO}&agency=CITROUS`
const API_URL_CITSV = `http://opendata.rtm.quebec:2539/ServiceGTFSR/VehiclePosition.pb?token=${process.env.API_KEY_EXO}&agency=CITSV`
const API_URL_CITSO = `http://opendata.rtm.quebec:2539/ServiceGTFSR/VehiclePosition.pb?token=${process.env.API_KEY_EXO}&agency=CITSO`

const vehArrayCITVR=[];
const vehArrayCITLA=[];
const vehArrayOMITSJU=[];
const vehArrayMRCLASSO=[];
const vehArrayMRCLM=[];
const vehArrayCITCRC=[];
const vehArrayCITHSL=[];
const vehArrayCITPI=[];
const vehArrayCITLR=[];
const vehArrayCITROUS=[];
const vehArrayCITSV=[];
const vehArrayCITSO=[];


const cit_array = [
                        {CIT: 'CITVR', URL:API_URL_CITVR, vehArray:vehArrayCITVR},
                        {CIT: 'CITLA', URL:API_URL_CITLA, vehArray:vehArrayCITLA},
                        {CIT: 'OMITSJU', URL:API_URL_OMITSJU, vehArray:vehArrayOMITSJU},
                        {CIT: 'MCRLASSO', URL:API_URL_MRCLASSO, vehArray:vehArrayMRCLASSO},
                        {CIT: 'MRCLM', URL:API_URL_MRCLM, vehArray:vehArrayMRCLM},
                        {CIT: 'CITCRC', URL:API_URL_CITCRC, vehArray:vehArrayCITCRC},
                        {CIT: 'CITHSL', URL:API_URL_CITHSL, vehArray:vehArrayCITHSL},
                        {CIT: 'CITPI', URL:API_URL_CITPI, vehArray:vehArrayCITPI},
                        {CIT: 'CITLR', URL:API_URL_CITLR, vehArray:vehArrayCITLR},
                        {CIT: 'CITROUS', URL:API_URL_CITROUS, vehArray:vehArrayCITROUS},
                        {CIT: 'CITSV', URL:API_URL_CITSV, vehArray:vehArrayCITSV},
                        {CIT: 'CITSO', URL:API_URL_CITSO, vehArray:vehArrayCITSO}
                    ]



module.exports = {

    async handleEXO() {

        // GESTION VEHICULES EXO
        for (let e = 0; e <= 11; e++) {

            const requestSettings = {
                method: 'GET',
                url: cit_array[e].URL,
                encoding: null
            };

            function requestData() {
                return new Promise(function (resolve, reject) {
                request(requestSettings, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                    resolve(body);
                    }
                    else {
                    console.log(response.statusCode, error)
                    }
                })
                });
            }
        
            vehArray = [];
            let data = await requestData();
            let feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(data);
            const vehicles = Object.values(feed.entity);

            vehicles.forEach((f) => {
                let vehPos = turf.point([f.vehicle.position.longitude, f.vehicle.position.latitude], {
                cit: cit_array[e].CIT,
                vehicle_id: f.id,
                route_id: f.vehicle.trip.routeId,
                trip_id: f.vehicle.trip.tripId,
                timestamp: moment.duration(new moment().format('x') - moment.unix(f.vehicle.timestamp.low)).as('seconds'),
                server_request: new Date()
                });
                vehArray.push(vehPos);
            })
            cit_array[e].vehArray = vehArray;
            console.log('Nombre de bus en ligne '+ cit_array[e].CIT + ' :', cit_array[e].vehArray.length);

        
        }

        return cit_array;

    }
}