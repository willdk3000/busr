
exports.up = function (knex, Promise) {

    return knex.raw(
        `CREATE MATERIALIZED VIEW "STL".traces
        TABLESPACE pg_default
        AS
        WITH tableroutes AS (
            SELECT st_makeline(bp.point_geom) AS routes_geom,
                bp.shape_id
            FROM ( 
                SELECT shapes.point_geom,
                    shapes.shape_id
                FROM "STL".shapes
                ORDER BY shape_id, shapes.shape_pt_sequence) bp
                GROUP BY bp.shape_id
           ),
        routeshape AS (
            SELECT DISTINCT ON (trips.trip_id) routes_geom,
                tableroutes.shape_id,
                trips.route_id,
                trips.trip_id
            FROM tableroutes
            LEFT JOIN "STL".trips ON "STL".trips.shape_id = tableroutes.shape_id)
        SELECT 
            routeshape.routes_geom,
            routeshape.shape_id,
            routeshape.route_id,
            routes.route_long_name,
            routes.route_short_name,
            ST_LENGTH(routeshape.routes_geom::geography) AS dist
        FROM routeshape
        LEFT JOIN "STL".routes ON routeshape.route_id = "STL".routes.route_id
        GROUP BY routes_geom, shape_id, routeshape.route_id, route_long_name, route_short_name
        WITH NO DATA;`
    );
};

exports.down = function (knex, Promise) {
    return knex.raw(
        `DROP materialized view "STL".traces;`);
};


