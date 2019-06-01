
exports.up = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE "RTL".trips ADD COLUMN stopcount integer;
        `
    );
};

exports.down = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE "RTL".trips DROP COLUMN stopcount integer;`
    );
};

