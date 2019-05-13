
exports.up = function (knex, Promise) {

    return knex.raw(
        `ALTER TABLE "RTL".shapes ADD COLUMN point_geog geography(Point,4326);
        ALTER TABLE "RTL".shapes ADD COLUMN point_geom geometry(Point,4326);`
    );
};

exports.down = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE "RTL".shapes DROP COLUMN point_geog;
        ALTER TABLE "RTL".shapes DROP COLUMN point_geom;`);
};
