
exports.up = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE "public".trips ADD COLUMN firstlast TEXT [];
        `
    );
};

exports.down = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE "public".trips DROP COLUMN firstlast;`
    );
};
