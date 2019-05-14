
exports.up = function (knex, Promise) {
  return knex.raw(
    `
    CREATE TABLE "public".vehicles
    (
        "timestamp" timestamp with time zone,
        "time" time with time zone,
        data jsonb,
        vehlen integer,
        weekday text COLLATE pg_catalog."default",
        reseau text COLLATE pg_catalog."default"
    )
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;
    `
  )
};

exports.down = function (knex, Promise) {
  return knex.raw(`DROP TABLE vehicles`)
};
