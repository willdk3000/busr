
exports.up = function (knex, Promise) {
    return knex.raw(
        `
        CREATE TABLE RTL.trips
        (
            route_id integer,
            service_id text COLLATE pg_catalog."default",
            trip_id text COLLATE pg_catalog."default",
            trip_headsign text COLLATE pg_catalog."default",
            direction_id integer,
            block_id text COLLATE pg_catalog."default",
            shape_id text COLLATE pg_catalog."default",
            wheelchair_accessible integer
        )
        WITH (
            OIDS = FALSE
        )
        TABLESPACE pg_default;
        `
    )

};

exports.down = function (knex, Promise) {
    return knex.raw(`DROP TABLE RTL.trips`)
};
