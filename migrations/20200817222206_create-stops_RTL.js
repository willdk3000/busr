
exports.up = function (knex, Promise) {
  return knex.raw(
    `CREATE TABLE RTL.stops
    (
        stop_id integer,
        stop_code integer,
        stop_name text COLLATE pg_catalog."default",
        stop_lat double precision,
        stop_lon double precision,
        location_type integer,
        parent_station integer,
        wheelchair_boarding integer
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
    `DROP TABLE RTL.stops`
  )
};
