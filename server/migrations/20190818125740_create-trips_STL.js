
exports.up = function (knex, Promise) {
    return knex.raw(
        `
        CREATE TABLE "STL".trips
        (
            route_id text COLLATE pg_catalog."default",
            service_id text COLLATE pg_catalog."default",
            trip_id text COLLATE pg_catalog."default",
            block_id text COLLATE pg_catalog."default",
            shape_id text COLLATE pg_catalog."default",
            trip_headsign text COLLATE pg_catalog."default"
        )
        WITH (
            OIDS = FALSE
        )
        TABLESPACE pg_default;

        ALTER TABLE "STL".trips
            OWNER to postgres;`
    )
}

exports.down = function (knex, Promise) {
    return knex.raw(`DROP TABLE "STL".trips`)
};
