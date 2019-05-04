const knex = require('../config/knex');
const moment = require('moment');

module.exports = {

  getTracesSTM(req, res) {

    return knex.raw(
      `SELECT jsonb_build_object(
                    'type',     'FeatureCollection',
                    'features', jsonb_agg(features.feature)
                )
                FROM (
                  SELECT jsonb_build_object(
                    'type',       'Feature',
                    'geometry',   ST_AsGeoJSON(routes_geom)::jsonb,
                    'properties', jsonb_build_object(
                                'ID', shape_id,
                                'ligne', route_id,
                                'direction', direction_id,
                                'route_name', route_long_name,
                                'trips', trips)        
                  ) AS feature
                 
                  FROM (SELECT * FROM traces) inputs) features;`,
    ).then(result => {
      res.json(result)
    });
  },

  getStopsSTM(req, res) {
    return knex.raw(
      `SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(features.feature)
      )
      FROM (
          SELECT jsonb_build_object(
              'type', 'Feature',
              'id', stop_id,
              'geometry', ST_AsGeoJSON(point_geog)::jsonb,
              'properties', jsonb_build_object(
              'code', stop_code,
              'name', stop_name,
              'departs', departs)
          ) AS feature 
      FROM (SELECT * FROM stop_triptimes WHERE shape_id ='${req.body.trace}') inputs) features;`)
      .then(result => {
        res.json(result)
      })
  },

  getPlannedTripsSTM(req, res) {

    let timeNow = new Date();
    let timeParse = moment(timeNow).format("HH:mm:ss");
    let dateParse = moment(timeNow).format('YYYYMMDD');

    let split = timeParse.split(':');
    // Hours are worth 60 minutes, minutes are worth 60 seconds. 
    let seconds = (+split[0]) * 60 * 60 + (+split[1]) * 60 + (+split[2]);
    //FORMAT 28h donc si entre minuit et 3h59, ajouter 86400 secondes...
    if (seconds <= 14340) {
      seconds += 86400
    }

    let dayNow = timeNow.getDay();

    let service = '';

    switch (service) {
      case dayNow == 0:
        return 'sunday'
      case dayNow == 6:
        return 'saturday'
      case dayNow == 1:
        return 'monday'
      case dayNow == 2:
        return 'tuesday'
      case dayNow == 3:
        return 'wednesday'
      case dayNow == 4:
        return 'thursday'
      case dayNow == 5:
        return 'friday'
    }

    console.log(service)

    return knex.raw(`
    With unnested AS (
      --separer le min et le max dans deux rows differentes pour chaque trip
      SELECT trip_id, service_id, a.time, a.minmax
      FROM trips, unnest(firstlast) WITH ORDINALITY a(time, minmax)
      ),
      --prendre tous les min inferieurs a l'heure actuelle
      unnestmin AS (
        SELECT 
          service_id,
          trip_id AS tripmin,
          time AS timemin,
          minmax
        FROM unnested
        WHERE minmax = 1 AND unnested.time::integer <= ${seconds}
      ),
      --prendre tous les max superieurs a l'heure actuelle
      unnestmax AS (
        SELECT 
          trip_id AS tripmax,
          time AS timemax,
          minmax
        FROM unnested
        WHERE minmax = 2 AND unnested.time::integer >= ${seconds}
      ),
      --conserver seulement les trips pour lesquels le min et le max ont le meme trip_id
      plantrips AS (
        SELECT
              unnestmin.service_id,  
              unnestmin.tripmin,
              unnestmin.timemin,
              unnestmax.timemax
          FROM unnestmin
          INNER JOIN unnestmax ON unnestmin.tripmin = unnestmax.tripmax
      )
      --ajouter la contrainte de la date pour s'assurer de conserver seulement les trips du service en cours
      SELECT 
        plantrips.service_id,
        plantrips.tripmin,
        plantrips.timemin,
        plantrips.timemax,
        calendar.saturday,
        calendar.start_date,
        calendar.end_date
      FROM plantrips
      INNER JOIN calendar ON plantrips.service_id = calendar.service_id
      WHERE calendar.start_date::integer <= ${dateParse} AND calendar.end_date::integer >= ${dateParse} AND calendar.saturday = 1
    `).then(result => {
      return result.rows
    })

  },

  getTracesSTL(req, res) {

    return knex.raw(
      `SELECT jsonb_build_object(
                    'type',     'FeatureCollection',
                    'features', jsonb_agg(features.feature)
                )
                FROM (
                  SELECT jsonb_build_object(
                    'type',       'Feature',
                    'geometry',   ST_AsGeoJSON(routes_geom)::jsonb,
                    'properties', jsonb_build_object(
                                'ID', shape_id,
                                'ligne', route_id,
                                'route_name', route_long_name,
                                'route_short_name', route_short_name)        
                  ) AS feature 
                  FROM (SELECT * FROM "STL".traces) inputs) features;`,
    ).then(result => {
      res.json(result)
    });
  },

  getStopsSTL(req, res) {

    return knex.raw(
      `SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(features.feature)
      )
      FROM (
          SELECT jsonb_build_object(
              'type', 'Feature',
              'id', stop_id,
              'geometry', ST_AsGeoJSON(point_geog)::jsonb,
              'properties', jsonb_build_object(
              'code', stop_code,
              'name', stop_name,
              'departs', departs)
          ) AS feature 
      FROM (SELECT * FROM "STL".stop_triptimes WHERE shape_id ='${req.body.trace}') inputs) features;`)
      .then(result => {
        res.json(result)
      })
  },

  getPlannedTripsSTL(req, res) {

    let timeNow = new Date();
    let timeParse = moment(timeNow).format("HH:mm:ss")
    let split = timeParse.split(':');
    // Hours are worth 60 minutes, minutes are worth 60 seconds. 
    let seconds = (+split[0]) * 60 * 60 + (+split[1]) * 60 + (+split[2]);
    //FORMAT 28h donc si entre minuit et 3h59, ajouter 86400 secondes...
    if (seconds <= 14340) {
      seconds += 86400
    }

    let dayNow = timeNow.getDay();

    let service = '';
    if (dayNow == 0) {
      service = 'MARS19DIM'
    } else if (dayNow == 6) {
      service = 'MARS19SAM'
    } else {
      service = 'MARS19SEM'
    }

    return knex.raw(`
    WITH unnested AS (
      SELECT trip_id, service_id, a.time, a.minmax
      FROM "STL".trips, unnest(firstlast) WITH ORDINALITY a(time, minmax)
      WHERE service_id='${service}'
      ),
      unnestmin AS (
        SELECT 
          trip_id AS tripmin,
          time AS timemin,
          minmax
        FROM unnested
        WHERE minmax = 1 AND unnested.time::integer <= ${seconds}
      ),
      unnestmax AS (
        SELECT 
          trip_id AS tripmax,
          time AS timemax,
          minmax
        FROM unnested
        WHERE minmax = 2 AND unnested.time::integer >= ${seconds}
      )
      SELECT
        unnestmin.tripmin,
        unnestmin.timemin,
        unnestmax.timemax
      FROM unnestmin
      INNER JOIN unnestmax ON unnestmin.tripmin = unnestmax.tripmax
    `).then(result => {
      return result.rows
    })

  },

  getTracesRTL(req, res) {

    return knex.raw(
      `SELECT jsonb_build_object(
                    'type',     'FeatureCollection',
                    'features', jsonb_agg(features.feature)
                )
                FROM (
                  SELECT jsonb_build_object(
                    'type',       'Feature',
                    'geometry',   ST_AsGeoJSON(routes_geom)::jsonb,
                    'properties', jsonb_build_object(
                                'ID', shape_id,
                                'ligne', route_id,
                                'direction', direction_id,
                                'route_name', route_long_name,
                                'trips', trips)        
                  ) AS feature
                 
                  FROM (SELECT * FROM "RTL".traces) inputs) features;`,
    ).then(result => {
      res.json(result)
    });
  },

  getStopsRTL(req, res) {

    return knex.raw(
      `SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(features.feature)
      )
      FROM (
          SELECT jsonb_build_object(
              'type', 'Feature',
              'id', stop_id,
              'geometry', ST_AsGeoJSON(point_geog)::jsonb,
              'properties', jsonb_build_object(
              'code', stop_code,
              'name', stop_name,
              'departs', departs)
          ) AS feature 
      FROM (SELECT * FROM "RTL".stop_triptimes WHERE shape_id ='${req.body.trace}') inputs) features;`)
      .then(result => {
        res.json(result)
      })
  },

  getPlannedTripsRTL(req, res) {

    let timeNow = new Date();
    let timeParse = moment(timeNow).format("HH:mm:ss")
    let split = timeParse.split(':');
    // Hours are worth 60 minutes, minutes are worth 60 seconds. 
    let seconds = (+split[0]) * 60 * 60 + (+split[1]) * 60 + (+split[2]);
    //FORMAT 28h donc si entre minuit et 3h59, ajouter 86400 secondes...
    if (seconds <= 14340) {
      seconds += 86400
    }

    // Sunday - Saturday : 0 - 6
    let dayNow = timeNow.getDay();
    let service = '';
    if (dayNow == 0) {
      service = 'DI'
    } else if (dayNow == 6) {
      service = 'SA'
    } else {
      service = 'SE'
    }

    return knex.raw(`
    WITH unnested AS (
      SELECT trip_id, service_id, a.time, a.minmax
      FROM "RTL".trips, unnest(firstlast) WITH ORDINALITY a(time, minmax)
      WHERE service_id = '${service}'
      ),
      unnestmin AS (
        SELECT 
          trip_id AS tripmin,
          time AS timemin,
          minmax
        FROM unnested
        WHERE minmax = 1 AND unnested.time::integer <= ${seconds}
      ),
      unnestmax AS (
        SELECT 
          trip_id AS tripmax,
          time AS timemax,
          minmax
        FROM unnested
        WHERE minmax = 2 AND unnested.time::integer >= ${seconds}
      )
      SELECT
        unnestmin.tripmin,
        unnestmin.timemin,
        unnestmax.timemax
      FROM unnestmin
      INNER JOIN unnestmax ON unnestmin.tripmin = unnestmax.tripmax
    `).then(result => {
      return result.rows
    })

  }

}
