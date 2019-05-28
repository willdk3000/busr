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
                 
                  FROM (SELECT * FROM "public".traces) inputs) features;`,
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
              'stop_sequence', stop_sequence,
              'departure_time', departure_time)
          ) AS feature 
          FROM (SELECT * FROM stop_traces WHERE trip_id ='${req.body.trip}' ORDER BY stop_sequence) inputs) features;`)
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
    let seconds28 = seconds;
    //FORMAT 28h donc si entre minuit et 3h59, ajouter 86400 secondes...
    if (seconds <= 14340) {
      seconds28 = seconds + 86400
    }

    let dayNow = timeNow.getDay();

    let service = 0;

    if (dayNow == 0 && seconds > 14340) {
      service = 7
    } else if (dayNow == 1 && seconds <= 14340) {
      service = 7
    } else if (dayNow == 6 && seconds > 14340) {
      service = 6
    } else if (dayNow == 0 && seconds <= 14340) {
      service = 6
    } else {
      service = 1
    }

    return knex.raw(`
    WITH unnested AS (
      SELECT trip_id, service_id, route_id, direction_id, a.time, a.minmax
      FROM "public".trips, unnest(firstlast) WITH ORDINALITY a(time, minmax)
      ),
      unnestmin AS (
        SELECT 
          service_id,
          trip_id AS tripmin,
          time AS timemin,
          route_id,
          direction_id,
          minmax
        FROM unnested
        WHERE minmax = 1 AND unnested.time::integer <= ${seconds28}
      ),
      unnestmax AS (
        SELECT 
          trip_id AS tripmax,
          time AS timemax,
          minmax
        FROM unnested
        WHERE minmax = 2 AND unnested.time::integer >= ${seconds28}
      ),
      plantrips AS (
        SELECT
              unnestmin.service_id,
              unnestmin.route_id,  
              unnestmin.direction_id,
              unnestmin.tripmin,
              unnestmin.timemin,
              unnestmax.timemax
          FROM unnestmin
          INNER JOIN unnestmax ON unnestmin.tripmin = unnestmax.tripmax
      ),
      rundates AS (
      SELECT 
        plantrips.service_id,
        plantrips.route_id,
        plantrips.direction_id,
        plantrips.tripmin,
        plantrips.timemin,
        plantrips.timemax,
        calendar.start_date,
        calendar.end_date
      FROM plantrips
      INNER JOIN "public".calendar ON plantrips.service_id = "public".calendar.service_id),
      weekdayrun AS (
      SELECT 
        service_id, 
        a.runday::integer, 
        a.daynum::integer,
        SUM(runday::integer * daynum::integer) as active
        FROM "public".calendar, unnest(rundays) WITH ORDINALITY a(runday, daynum)
        GROUP BY service_id, runday, daynum
        ORDER BY service_id, daynum
      )
      SELECT 
      distinct(plantrips.tripmin),
      plantrips.service_id,
      plantrips.route_id,
      plantrips.direction_id,
      plantrips.timemin,
      plantrips.timemax,
      weekdayrun.active,
	    rundates.start_date,
	    rundates.end_date
      FROM weekdayrun
      INNER JOIN plantrips ON plantrips.service_id = weekdayrun.service_id
	    INNER JOIN rundates ON rundates.service_id = weekdayrun.service_id
      WHERE active = ${service} AND start_date::integer <= ${dateParse} AND end_date::integer >= ${dateParse}
      ORDER BY plantrips.route_id, plantrips.direction_id, plantrips.timemin
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
    let dateParse = moment(timeNow).format('YYYYMMDD');

    let split = timeParse.split(':');
    // Hours are worth 60 minutes, minutes are worth 60 seconds. 
    let seconds = (+split[0]) * 60 * 60 + (+split[1]) * 60 + (+split[2]);
    let seconds28 = seconds;
    //FORMAT 28h donc si entre minuit et 3h59, ajouter 86400 secondes...
    if (seconds <= 14340) {
      seconds28 = seconds + 86400
    }

    let dayNow = timeNow.getDay();

    let service = 0;

    if (dayNow == 0 && seconds > 14340) {
      service = 7
    } else if (dayNow == 1 && seconds <= 14340) {
      service = 7
    } else if (dayNow == 6 && seconds > 14340) {
      service = 6
    } else if (dayNow == 0 && seconds <= 14340) {
      service = 6
    } else {
      service = 1
    }

    return knex.raw(`
    --une rangée pour l'heure de début du voyage et une autre pour l'heure de fin pour chaque voyage
    WITH unnested AS (
      SELECT trip_id, service_id, route_id, a.time, a.minmax
      FROM "STL".trips, unnest(firstlast) WITH ORDINALITY a(time, minmax)
      ),
      --condition pour heure départ
      unnestmin AS (
        SELECT 
          service_id,
          route_id,
          trip_id AS tripmin,
          time AS timemin,
          minmax
        FROM unnested
        WHERE minmax = 1 AND unnested.time::integer <= ${seconds28}
      ),
      --condition pour heure d'arrivée
      unnestmax AS (
        SELECT 
          trip_id AS tripmax,
          time AS timemax,
          minmax
        FROM unnested
        WHERE minmax = 2 AND unnested.time::integer >= ${seconds28}
      ),
      --conserver seulement les trips qui respectent les deux conditions précédentes
      plantrips AS (
        SELECT
              unnestmin.service_id,  
              unnestmin.route_id,
              unnestmin.tripmin,
              unnestmin.timemin,
              unnestmax.timemax
          FROM unnestmin
          INNER JOIN unnestmax ON unnestmin.tripmin = unnestmax.tripmax
      ),
      --ajouter les dates de début et date de fin d'opération du service_id
      rundates AS (
      SELECT 
        plantrips.service_id,
        plantrips.route_id,
        plantrips.tripmin,
        plantrips.timemin,
        plantrips.timemax,
        calendar.start_date,
        calendar.end_date
      FROM plantrips
      INNER JOIN "STL".calendar ON plantrips.service_id = "STL".calendar.service_id),
      --créer une rangée par jour de la semaine opéré
      weekdayrun AS (
      SELECT 
        service_id, 
        a.runday::integer, 
        a.daynum::integer,
        SUM(runday::integer * daynum::integer) as active
        FROM "STL".calendar, unnest(rundays) WITH ORDINALITY a(runday, daynum)
        GROUP BY service_id, runday, daynum
        ORDER BY service_id, daynum
      )
      --filtrer le jour de la semaine et les dates d'opération
      SELECT 
      distinct(plantrips.tripmin),
      plantrips.service_id,
      plantrips.route_id,
      weekdayrun.active,
	    rundates.start_date,
	    rundates.end_date
      FROM weekdayrun
      INNER JOIN plantrips ON plantrips.service_id = weekdayrun.service_id
	    INNER JOIN rundates ON rundates.service_id = weekdayrun.service_id
      WHERE active = ${service} AND start_date::integer <= ${dateParse} AND end_date::integer >= ${dateParse}
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
              'stop_sequence', stop_sequence,
              'departure_time', departure_time)
          ) AS feature 
      FROM (SELECT * FROM "RTL".stop_traces WHERE trip_id ='${req.body.trip}' ORDER BY stop_sequence) inputs) features;`)
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
    let seconds28 = seconds;
    //FORMAT 28h donc si entre minuit et 3h59, ajouter 86400 secondes...
    if (seconds <= 14340) {
      seconds28 = seconds + 86400
    }

    // Sunday - Saturday : 0 - 6
    let dayNow = timeNow.getDay();
    let service = '';
    if (dayNow == 0 && seconds > 14340) {
      service = 'DI'
    } else if (dayNow == 1 && seconds <= 14340) {
      service = 'DI'
    } else if (dayNow == 6 && seconds > 14340) {
      service = 'SA'
    } else if (dayNow == 0 && seconds <= 14340) {
      service = 'SA'
    } else {
      service = 'SE'
    }

    return knex.raw(`
    WITH unnested AS (
      SELECT trip_id, service_id, route_id, direction_id, a.time, a.minmax
      FROM "RTL".trips, unnest(firstlast) WITH ORDINALITY a(time, minmax)
      WHERE service_id = '${service}'
      ),
      unnestmin AS (
        SELECT 
          route_id,
          direction_id,
          trip_id AS tripmin,
          time AS timemin,
          minmax
        FROM unnested
        WHERE minmax = 1 AND unnested.time::integer <= ${seconds28}
      ),
      unnestmax AS (
        SELECT 
          trip_id AS tripmax,
          time AS timemax,
          minmax
        FROM unnested
        WHERE minmax = 2 AND unnested.time::integer >= ${seconds28}
      )
      SELECT
        unnestmin.route_id,
        unnestmin.direction_id,
        unnestmin.tripmin,
        unnestmin.timemin,
        unnestmax.timemax
      FROM unnestmin
      INNER JOIN unnestmax ON unnestmin.tripmin = unnestmax.tripmax
      ORDER BY unnestmin.route_id, unnestmin.direction_id, unnestmin.timemin
    `).then(result => {
      return result.rows
    })

  }

}
