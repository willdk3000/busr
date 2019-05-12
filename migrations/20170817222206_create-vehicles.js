
exports.up = function (knex, Promise) {
  return knex.raw(
    `
    CREATE TABLE public.vehicles
    (
        "timestamp" timestamp without time zone,
        "time" time without time zone,
        data jsonb,
        vehlen integer,
        weekday text COLLATE pg_catalog."default",
        reseau text COLLATE pg_catalog."default"
    )
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;
    
    ALTER TABLE public.vehicles
        OWNER to postgres;`
  )
};

exports.down = function (knex, Promise) {
  return knex.raw(`DROP TABLE vehicles`)
};
