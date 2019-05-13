
exports.up = function (knex, Promise) {
    return knex.raw(
        `CREATE MATERIALIZED VIEW RTL.stop_triptimes
        TABLESPACE pg_default
        AS
        SELECT 
            shape_id,
            stop_id,
            service_id,
            stop_name,
            stop_code,
            point_geog,
            (array_agg(departure_time ORDER BY departure_time)) AS departs
        FROM RTL.stop_traces
        GROUP BY shape_id, stop_id, service_id, stop_name, stop_code, point_geog
        WITH NO DATA;`
    )
};

exports.down = function (knex, Promise) {
    return knex.raw(
        `DROP materialized view RTL.stop_triptimes;`);
};
