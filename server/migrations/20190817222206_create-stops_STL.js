
exports.up = function (knex, Promise) {
  return knex.STL.createTable('stops', (table) => {
    table.text('stop_id');
    table.integer('stop_code');
    table.text('stop_name');
    table.double('stop_lon');
    table.double('stop_lat');
    table.integer('location_type');
    table.integer('stop_display');
    table.integer('stop_abribus')
  });
};

exports.down = function (knex, Promise) {
  return knex.STL.dropTable('stops');
};

