
exports.up = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE "STL".trips ADD COLUMN firstlast TEXT [];
        `
    );
};

exports.down = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE "STL".trips DROP COLUMN firstlast TEXT [];`
    );
};

