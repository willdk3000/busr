
exports.up = function (knex, Promise) {
  return knex.raw(
    `
    CREATE TABLE STL.calendar
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
    `
  )

};

exports.down = function (knex, Promise) {
  return knex.raw(`DROP TABLE STL.calendar`);
};
