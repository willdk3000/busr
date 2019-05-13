exports.up = function (knex, Promise) {

    return knex.raw(
        `CREATE MATERIALIZED VIEW RTL.stop_traces
        TABLESPACE pg_default
        AS
        WITH tableshapearrets AS (
            SELECT stop_times.stop_id,
               stop_times.stop_sequence,
               stop_times.departure_time,
               stop_times.hresecondes,
               trips.shape_id,
               trips.trip_id,
               trips.service_id,
               trips.direction_id,
               trips.block_id
            FROM RTL.trips
            LEFT JOIN RTL.stop_times ON RTL.stop_times.trip_id = RTL.trips.trip_id
        )
        SELECT tableshapearrets.stop_id,
            tableshapearrets.stop_sequence,
            tableshapearrets.shape_id,
            tableshapearrets.trip_id,
            tableshapearrets.departure_time,
            tableshapearrets.hresecondes,
            tableshapearrets.service_id,
            tableshapearrets.direction_id,
            tableshapearrets.block_id,
            stops.stop_name,
            stops.stop_code,
            stops.stop_lat,
            stops.stop_lon,
            stops.point_geog
        FROM tableshapearrets
        LEFT JOIN RTL.stops ON RTL.stops.stop_id = tableshapearrets.stop_id
        ORDER BY tableshapearrets.trip_id, tableshapearrets.shape_id, tableshapearrets.stop_sequence
        WITH NO DATA;`
    );
};

exports.down = function (knex, Promise) {
    return knex.raw(
        `DROP materialized view "RTL".stop_traces;`);
};