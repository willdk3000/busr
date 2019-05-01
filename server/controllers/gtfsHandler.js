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
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    let seconds = (+split[0]) * 60 * 60 + (+split[1]) * 60 + (+split[2]);

    let yearNow = timeNow.getFullYear().toString().slice(2);

    // Sunday - Saturday : 0 - 6
    let dayNow = timeNow.getDay();
    let service = '';
    if (dayNow == 0) {
      service = 'MARS' + yearNow + 'DIM'
    } else if (dayNow == 6) {
      service = 'MARS' + yearNow + 'SAM'
    } else {
      service = 'MARS' + yearNow + 'SEM'
    }

    return knex.raw(`
    WITH unnested AS (
      SELECT trip_id, service_id, a.time, a.minmax
      FROM "STL".trips, unnest(firstlast) WITH ORDINALITY a(time, minmax)
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
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    let seconds = (+split[0]) * 60 * 60 + (+split[1]) * 60 + (+split[2]);

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
