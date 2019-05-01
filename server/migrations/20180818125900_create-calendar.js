
exports.up = function (knex, Promise) {
  return knex.schema.createTable('calendar', (table) => {
    table.text('service_id');
    table.integer('monday');
    table.integer('tuesday');
    table.integer('wednesday');
    table.integer('thursday');
    table.integer('friday');
    table.integer('saturday');
    table.integer('sunday');
    table.text('start_date');
    table.text('end_date')
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('calendar');
};
