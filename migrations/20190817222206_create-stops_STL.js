
exports.up = function (knex, Promise) {
  return knex.raw(
    `
    CREATE TABLE "STL".stops
    (
        stop_id text COLLATE pg_catalog."default",
        stop_code integer,
        stop_name text COLLATE pg_catalog."default",
        stop_lon double precision,
        stop_lat double precision,
        location_type integer,
        stop_display integer,
        stop_abribus integer
    )
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;
    `
  )
};

exports.down = function (knex, Promise) {
  return knex.raw(
    `DROP TABLE "STL".stops`
  )
};

