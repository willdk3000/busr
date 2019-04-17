
exports.up = function(knex, Promise) {
    
    return knex.raw(
        `ALTER TABLE public.stops ADD COLUMN point_geog geography(Point,4326);`  
    );  
};

exports.down = function(knex, Promise) {
    return knex.raw(
        `ALTER TABLE public.stops DROP COLUMN point_geog;`);
};
