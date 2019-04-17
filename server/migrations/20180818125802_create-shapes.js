
exports.up = function (knex, Promise) {
    return knex.schema.createTable('public.shapes', (table) => {
        table.integer('shape_id');
        table.double('shape_pt_lat');
        table.double('shape_pt_lon');
        table.integer('shape_pt_sequence');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('shapes');
};
