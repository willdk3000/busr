
exports.up = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE "STL".trips ADD COLUMN stopcount integer;
        `
    );
};

exports.down = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE "STL".trips DROP COLUMN stopcount;`
    );
};

