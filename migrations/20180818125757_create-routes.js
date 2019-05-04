
exports.up = function (knex, Promise) {
    return knex.schema.createTable('routes', (table) => {
        table.integer('route_id');
        table.text('agency_id');
        table.text('route_short_name');
        table.text('route_long_name');
        table.integer('route_type');
        table.text('route_url');
        table.text('route_color');
        table.text('route_text_color');

    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('routes');
};