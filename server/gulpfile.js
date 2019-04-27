/* gulpfile */

const gulp = require('gulp'),
    knex = require('./config/knex'),
    path_stm = __dirname + '/gtfs/' + 'stm_mars2019',
    path_stl = __dirname + '/gtfs/' + 'stl_mars2019'

//Initialisation
//gulp.task('default', function() {
//    return gutil.log('Gulp is running!')
//});

//Importer tables STM
gulp.task('import_tables_STM', function (done) {
    return knex.raw(
        `\COPY "public".routes FROM '${path_stm}/routes.txt' DELIMITER ',' CSV HEADER;
        \COPY "public".shapes (shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence) FROM '${path_stm}/shapes.txt' DELIMITER ',' CSV HEADER;
        \COPY "public".stop_times (trip_id,arrival_time,departure_time,stop_id,stop_sequence) FROM '${path_stm}/stop_times.txt' DELIMITER ',' CSV HEADER;
        \COPY "public".trips FROM '${path_stm}/trips.txt' DELIMITER ',' CSV HEADER;
        \COPY "public".stops (stop_id,stop_code,stop_name,stop_lat,stop_lon,stop_url,location_type,parent_station,wheelchair_boarding) FROM '${path_stm}/stops.txt' DELIMITER ',' CSV HEADER;
        UPDATE "public"."stops" SET point_geog = st_SetSrid(st_MakePoint(stop_lon, stop_lat), 4326);
        UPDATE "public".shapes SET point_geog = st_SetSrid(st_MakePoint(shape_pt_lon, shape_pt_lat), 4326);
        UPDATE "public".shapes SET point_geom = st_SetSrid(st_MakePoint(shape_pt_lon, shape_pt_lat), 4326);
        UPDATE "public".stop_times SET hresecondes = 
        ((SUBSTRING(departure_time FROM 1 FOR 2)::int)*60*60)+
        ((SUBSTRING(departure_time FROM 4 FOR 2)::int)*60)+
        ((SUBSTRING(departure_time FROM 7 FOR 2)::int));
        REFRESH MATERIALIZED VIEW traces WITH DATA;
        `
    ).then(done());
})

//Importer tables STL
gulp.task('import_tables_STL', function (done) {
    return knex.raw(
        `\COPY "STL".routes FROM '${path_stl}/routes.txt' DELIMITER ',' CSV HEADER;
        \COPY "STL".shapes (shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence) FROM '${path_stl}/shapes.txt' DELIMITER ',' CSV HEADER;
        \COPY "STL".stop_times (trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type) FROM '${path_stl}/stop_times.txt' DELIMITER ',' CSV HEADER;
        \COPY "STL".trips FROM '${path_stl}/trips.txt' DELIMITER ',' CSV HEADER;
        \COPY "STL".stops (stop_id,stop_code,stop_name,stop_lon,stop_lat,location_type,stop_display,stop_abribus) FROM '${path_stl}/stops.txt' DELIMITER ',' CSV HEADER;
        UPDATE "STL".stops SET point_geog = st_SetSrid(st_MakePoint(stop_lon, stop_lat), 4326);
        UPDATE "STL".shapes SET point_geog = st_SetSrid(st_MakePoint(shape_pt_lon, shape_pt_lat), 4326);
        UPDATE "STL".shapes SET point_geom = st_SetSrid(st_MakePoint(shape_pt_lon, shape_pt_lat), 4326);
        UPDATE "STL".routes SET route_short_name = SUBSTRING("STL".routes.route_id FROM 7);
        UPDATE "STL".stop_times SET hresecondes = 
        ((SUBSTRING("STL".stop_times.departure_time FROM 1 FOR 2)::int)*60*60)+
        ((SUBSTRING("STL".stop_times.departure_time FROM 4 FOR 2)::int)*60)+
        ((SUBSTRING("STL".stop_times.departure_time FROM 7 FOR 2)::int));
        REFRESH MATERIALIZED VIEW "STL".traces WITH DATA;
        REFRESH MATERIALIZED VIEW "STL".stop_traces WITH DATA;
        REFRESH MATERIALIZED VIEW "STL".stop_triptimes WITH DATA;`
    ).then(done());
})


//gulp.task('build-css', function() {
//    return gulp.src('./public/assets/stylesheets/scss/**/*.scss')
//      .pipe(sass())
//      .pipe(gulp.dest('./public/assets/stylesheets/css'));
//  });

//gulp.task('watch', function() {
//    gulp.watch('./public/assets/stylesheets/scss/**/*.scss', ['build-css']);
//  });






// REFRESH MATERIALIZED VIEW "public".stop_traces WITH DATA;
// REFRESH MATERIALIZED VIEW "public".stop_triptimes WITH DATA;


