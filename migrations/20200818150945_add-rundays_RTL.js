
exports.up = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE RTL.calendar ADD COLUMN rundays TEXT [];
        `
    );
};

exports.down = function (knex, Promise) {
    return knex.raw(
        `ALTER TABLE RTL.calendar DROP COLUMN rundays TEXT [];`
    );
};
