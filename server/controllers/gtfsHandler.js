const knex = require('../config/knex')

module.exports = {

  getTraces(req, res) {
    //switch (req.params.action) {
    //case ':showTrace':
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

  getStops(req, res) {
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
              'name', stop_name)
          ) AS feature 
      FROM (SELECT * FROM stop_traces WHERE shape_id ='${req.body.trip_id}') inputs) features;`)
      .then(result => {
        res.json(result)
      })
  }

}
