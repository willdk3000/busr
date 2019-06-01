
exports.up = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE "public".calendar ADD COLUMN rundays TEXT [];
        `
    );
};

exports.down = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE "public".calendar DROP COLUMN rundays TEXT [];`
    );
};
