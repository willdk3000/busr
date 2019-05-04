
exports.up = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE "RTL".trips ADD COLUMN firstlast TEXT [];
        `
    );
};

exports.down = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE "RTL".trips DROP COLUMN firstlast TEXT [];`
    );
};

