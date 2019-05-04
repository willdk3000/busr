
exports.up = function (knex, Promise) {
  return knex.schema.createTable('stops', (table) => {
    table.text('stop_id');
    table.integer('stop_code');
    table.text('stop_name');
    table.double('stop_lat');
    table.double('stop_lon');
    table.text('stop_url');
    table.integer('location_type');
    table.text('parent_station');
    table.integer('wheelchair_boarding')
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('stops');
};

