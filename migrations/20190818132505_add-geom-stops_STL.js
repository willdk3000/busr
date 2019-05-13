
exports.up = function (knex, Promise) {

    return knex.raw(
        `ALTER TABLE STL.stops ADD COLUMN point_geog geography(Point,4326);`
    );
};

exports.down = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE STL.stops DROP COLUMN point_geog;`);
};
