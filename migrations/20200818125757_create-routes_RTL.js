
exports.up = function (knex, Promise) {
    return knex.raw(
        `
        CREATE TABLE RTL.routes
        (
            route_id integer,
            route_short_name text COLLATE pg_catalog."default",
            route_long_name text COLLATE pg_catalog."default",
            route_type integer,
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
    return knex.raw(`DROP TABLE RTL.routes`)
};
