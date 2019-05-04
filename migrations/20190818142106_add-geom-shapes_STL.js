
exports.up = function (knex, Promise) {

    return knex.raw(
        `ALTER TABLE "STL".shapes ADD COLUMN point_geog geography(Point,4326);
        ALTER TABLE "STL".shapes ADD COLUMN point_geom geometry(Point,4326);`
    );
};

exports.down = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE "STL".shapes DROP COLUMN point_geog;
        ALTER TABLE "STL".shapes DROP COLUMN point_geom;`);
};
