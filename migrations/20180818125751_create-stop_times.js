
exports.up = function (knex, Promise) {
    return knex.schema.createTable('stop_times', (table) => {
        table.text('trip_id');
        table.text('arrival_time');
        table.text('departure_time');
        table.text('stop_id');
        table.integer('stop_sequence');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('stop_times');
};