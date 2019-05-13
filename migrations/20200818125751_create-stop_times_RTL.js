
exports.up = function (knex, Promise) {
    return knex.raw(
        `
        CREATE TABLE "RTL".stop_times
        (
            trip_id text COLLATE pg_catalog."default",
            arrival_time text COLLATE pg_catalog."default",
            departure_time text COLLATE pg_catalog."default",
            stop_id integer,
            stop_sequence integer,
            stop_headsign text COLLATE pg_catalog."default",
            pickup_type integer,
            drop_off_type integer,
            shape_dist_traveled double precision,
            timepoint integer
        )
        WITH (
            OIDS = FALSE
        )
        TABLESPACE pg_default;
        `
    )

};

exports.down = function (knex, Promise) {
    return knex.raw(`DROP TABLE "RTL".stop_times`)
};