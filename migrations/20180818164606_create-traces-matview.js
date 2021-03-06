
exports.up = function (knex, Promise) {

    return knex.raw(
        `CREATE MATERIALIZED VIEW public.traces
        TABLESPACE pg_default
        AS
        WITH tableroutes AS (
            SELECT st_makeline(bp.point_geom) AS routes_geom,
                bp.shape_id
            FROM ( 
                SELECT shapes.point_geom,
                    shapes.shape_id
                FROM public.shapes
                ORDER BY shape_id, shapes.shape_pt_sequence) bp
                GROUP BY bp.shape_id
            ),
        routeshape AS (
            SELECT DISTINCT ON (trips.trip_id) routes_geom,
                tableroutes.shape_id,
                trips.route_id,
                trips.direction_id,
                trips.trip_id
            FROM tableroutes
            LEFT JOIN public.trips ON public.trips.shape_id = tableroutes.shape_id)
        SELECT 
            routeshape.routes_geom,
            routeshape.shape_id,
            routeshape.route_id,
            routeshape.direction_id,
            routes.route_long_name,
            ST_LENGTH(routeshape.routes_geom::geography) AS dist,
            (array_agg(routeshape.trip_id ORDER BY trip_id)) AS trips
        FROM routeshape
        LEFT JOIN public.routes ON routeshape.route_id = public.routes.route_id
        GROUP BY routes_geom, shape_id, routeshape.route_id, direction_id, route_long_name
        WITH NO DATA;`
    );
};

exports.down = function (knex, Promise) {
    return knex.raw(
        `DROP materialized view traces;`);
};


