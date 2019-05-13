
exports.up = function (knex, Promise) {

    return knex.raw(
        `ALTER TABLE RTL.stops ADD COLUMN point_geog geography(Point,4326);`
    );
};

exports.down = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE RTL.stops DROP COLUMN point_geog;`);
};
