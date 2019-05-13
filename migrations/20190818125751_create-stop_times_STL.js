
exports.up = function (knex, Promise) {
    return knex.raw(
        `
        CREATE TABLE "STL".stop_times
        (
            trip_id text COLLATE pg_catalog."default",
            arrival_time text COLLATE pg_catalog."default",
            departure_time text COLLATE pg_catalog."default",
            stop_id text COLLATE pg_catalog."default",
            stop_sequence integer,
            pickup_type integer,
            drop_off_type integer
        )
        WITH (
            OIDS = FALSE
        )
        TABLESPACE pg_default;
        `
    )
};

exports.down = function (knex, Promise) {
    return knex.raw(`DROP TABLE "STL".stop_times`)
};