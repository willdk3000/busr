
exports.up = function (knex, Promise) {
    return knex.raw(
        `
        CREATE TABLE "STL".routes
        (
            route_id text COLLATE pg_catalog."default",
            agency_id text COLLATE pg_catalog."default",
            route_short_name text COLLATE pg_catalog."default",
            route_long_name text COLLATE pg_catalog."default",
            route_type integer,
            route_url text COLLATE pg_catalog."default",
            route_headsign text COLLATE pg_catalog."default",
            route_color text COLLATE pg_catalog."default",
            route_text_color text COLLATE pg_catalog."default"
        )
        WITH (
            OIDS = FALSE
        )
        TABLESPACE pg_default;
        `
    )
};

exports.down = function (knex, Promise) {
    return knex.raw(`DROP TABLE "STL".routes`)
};