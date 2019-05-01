
exports.up = function (knex, Promise) {
  return knex.raw(
    `
    CREATE TABLE "RTL".calendar
    (
        service_id text COLLATE pg_catalog."default",
        monday integer,
        tuesday integer,
        wednesday integer,
        thursday integer,
        friday integer,
        saturday integer,
        sunday integer,
        start_date text COLLATE pg_catalog."default",
        end_date text COLLATE pg_catalog."default"
    )
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;

    ALTER TABLE "RTL".calendar
        OWNER to postgres;`
  )

};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('calendar');
};
