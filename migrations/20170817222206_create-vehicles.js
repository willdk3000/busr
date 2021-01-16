
exports.up = function (knex) {
  return knex.raw(
    `
    CREATE TABLE "public".vehicles
    (
        "timestamp" timestamp with time zone,
        "time" time with time zone,
        data jsonb,
        vehlen integer,
        weekday text COLLATE pg_catalog."default",
        reseau text COLLATE pg_catalog."default",
        timestr text COLLATE pg_catalog."default",
        groupe text COLLATE pg_catalog."default",
        rid text COLLATE pg_catalog."default"
    )
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;
    `
  )
};

exports.down = function (knex) {
  return knex.raw(`DROP TABLE "public".vehicles`)
};
