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
                                'trip_id', trip_id)        
                  ) AS feature
                 
                  FROM (SELECT * FROM traces) inputs) features;`,
    ).then(result => {
      res.json(result)
    });
    //break;


  }
}
