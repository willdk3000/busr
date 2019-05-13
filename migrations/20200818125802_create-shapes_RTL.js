
exports.up = function (knex, Promise) {
    return knex.raw(
        `
        CREATE TABLE RTL.shapes
        (
            shape_id text COLLATE pg_catalog."default",
            shape_pt_lat double precision,
            shape_pt_lon double precision,
            shape_pt_sequence integer,
            shape_dist_traveled double precision
        )
        WITH (
            OIDS = FALSE
        )
        TABLESPACE pg_default;
        `
    )

};

exports.down = function (knex, Promise) {
    return knex.raw(`DROP TABLE RTL.shapes`);
};
