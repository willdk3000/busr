
exports.up = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE "STL".calendar ADD COLUMN rundays TEXT [];
        `
    );
};

exports.down = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE "STL".calendar DROP COLUMN rundays TEXT [];`
    );
};
