const knex = require('../config/knex')

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
  }

}
