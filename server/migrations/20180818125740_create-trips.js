
exports.up = function (knex, Promise) {
    return knex.schema.createTable('trips', (table) => {
        table.integer('route_id');
        table.text('service_id');
        table.text('trip_id');
        table.text('trip_headsign');
        table.integer('direction_id');
        table.integer('shape_id');
        table.integer('wheelchair_accessible');
        table.text('note_fr');
        table.text('note_en');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('trips');
};
