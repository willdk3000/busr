/* gulpfile */

const gulp = require('gulp'),
    knex = require('./config/knex'),
    path_stm = __dirname + '/gtfs/STM/' + '202001',
    path_stl = __dirname + '/gtfs/STL/' + '202001',
    path_rtl = __dirname + '/gtfs/RTL/' + '202001'

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
        \COPY "public".trips (route_id,service_id,trip_id,trip_headsign,direction_id,shape_id,wheelchair_accessible,note_fr,note_en) FROM '${path_stm}/trips.txt' DELIMITER ',' CSV HEADER;
        \COPY "public".stops (stop_id,stop_code,stop_name,stop_lat,stop_lon,stop_url,location_type,parent_station,wheelchair_boarding) FROM '${path_stm}/stops.txt' DELIMITER ',' CSV HEADER;
        \COPY "public".calendar (service_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday, start_date, end_date) FROM '${path_stm}/calendar.txt' DELIMITER ',' CSV HEADER;
        UPDATE "public"."stops" SET point_geog = st_SetSrid(st_MakePoint(stop_lon, stop_lat), 4326);
        UPDATE "public".shapes SET point_geog = st_SetSrid(st_MakePoint(shape_pt_lon, shape_pt_lat), 4326);
        UPDATE "public".shapes SET point_geom = st_SetSrid(st_MakePoint(shape_pt_lon, shape_pt_lat), 4326);
        UPDATE "public".stop_times SET hresecondes = 
        ((SUBSTRING(departure_time FROM 1 FOR 2)::int)*60*60)+
        ((SUBSTRING(departure_time FROM 4 FOR 2)::int)*60)+
        ((SUBSTRING(departure_time FROM 7 FOR 2)::int));
        REFRESH MATERIALIZED VIEW "public".traces WITH DATA;
        REFRESH MATERIALIZED VIEW "public".stop_traces WITH DATA;
        REFRESH MATERIALIZED VIEW "public".stop_triptimes WITH DATA;
        --ajout de l'heure de depart et de l'heure d'arrivee du trip
        WITH minmaxtrip AS (
            SELECT trip_id,
            MIN(hresecondes) AS mindep,
            MAX(hresecondes) AS maxdep
            FROM "public".stop_times
            GROUP BY trip_id
        ),
        minmaxarray AS (
            SELECT trip_id,
            ARRAY_AGG(array[mindep,maxdep] ORDER BY trip_id) AS minmax
            FROM minmaxtrip
            GROUP BY trip_id
        )
        UPDATE "public".trips set firstlast = minmaxarray.minmax
        FROM minmaxarray
        WHERE "public".trips.trip_id = minmaxarray.trip_id;
        --ajout du nombre d'arrets pour chaque trip
        WITH maxstops AS (    
        SELECT trips.trip_id,
            COUNT(stop_times.stop_sequence) as stopcount
            FROM trips
            LEFT JOIN stop_times ON trips.trip_id = stop_times.trip_id
            GROUP BY trips.trip_id)
        UPDATE trips set stopcount = maxstops.stopcount
        FROM maxstops
        WHERE trips.trip_id = maxstops.trip_id;
        --ajout des jours de service dans une seule colonne
        WITH tripdays AS (
            SELECT service_id,
            ARRAY_AGG(array[monday, tuesday, wednesday, thursday, friday, saturday, sunday] ORDER BY service_id) AS rundays
            FROM calendar
            GROUP BY service_id
        )
        UPDATE "public".calendar set rundays = tripdays.rundays
        FROM tripdays
        WHERE calendar.service_id = tripdays.service_id;
        `
    ).then(done());
})

//Importer tables STL
gulp.task('import_tables_STL', function (done) {
    return knex.raw(
        `\COPY "STL".routes FROM '${path_stl}/routes.txt' DELIMITER ',' CSV HEADER;
        \COPY "STL".shapes (shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence) FROM '${path_stl}/shapes.txt' DELIMITER ',' CSV HEADER;
        \COPY "STL".stop_times (trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type) FROM '${path_stl}/stop_times.txt' DELIMITER ',' CSV HEADER;
        \COPY "STL".trips (route_id,service_id,trip_id,block_id,shape_id,trip_headsign) FROM '${path_stl}/trips.txt' DELIMITER ',' CSV HEADER;
        \COPY "STL".stops (stop_id,stop_code,stop_name,stop_lon,stop_lat,location_type,stop_display,stop_abribus) FROM '${path_stl}/stops.txt' DELIMITER ',' CSV HEADER;
        \COPY "STL".calendar (service_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday, start_date, end_date) FROM '${path_stl}/calendar.txt' DELIMITER ',' CSV HEADER;
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
        REFRESH MATERIALIZED VIEW "STL".stop_triptimes WITH DATA;
        --ajout de l'heure de depart et de l'heure d'arrivee du trip
        WITH minmaxtrip AS (
            SELECT trip_id,
            MIN(hresecondes) AS mindep,
            MAX(hresecondes) AS maxdep
            FROM "STL".stop_times
            GROUP BY trip_id
        ),
        minmaxarray AS (
            SELECT trip_id,
            ARRAY_AGG(array[mindep,maxdep] ORDER BY trip_id) AS minmax
            FROM minmaxtrip
            GROUP BY trip_id
        )
        UPDATE "STL".trips set firstlast = minmaxarray.minmax
        FROM minmaxarray
        WHERE "STL".trips.trip_id = minmaxarray.trip_id;
        --ajout du nombre d'arrets pour chaque trip
        WITH maxstops AS (    
        SELECT trips.trip_id,
            COUNT(stop_times.stop_sequence) as stopcount
            FROM "STL".trips
            LEFT JOIN "STL".stop_times ON trips.trip_id = "STL".stop_times.trip_id
            GROUP BY trips.trip_id)
        UPDATE "STL".trips set stopcount = maxstops.stopcount
        FROM maxstops
        WHERE "STL".trips.trip_id = maxstops.trip_id;
        --ajout des jours de service dans une seule colonne
        WITH tripdays AS (
            SELECT service_id,
            ARRAY_AGG(array[monday, tuesday, wednesday, thursday, friday, saturday, sunday] ORDER BY service_id) AS rundays
            FROM "STL".calendar
            GROUP BY service_id
        )
        UPDATE "STL".calendar set rundays = tripdays.rundays
        FROM tripdays
        WHERE "STL".calendar.service_id = tripdays.service_id;`
    ).then(done());
})

//Importer tables RTL
gulp.task('import_tables_RTL', function (done) {
    return knex.raw(
        `\COPY "RTL".routes FROM '${path_rtl}/routes.txt' DELIMITER ',' CSV HEADER;
        \COPY "RTL".shapes (shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence,shape_dist_traveled) FROM '${path_rtl}/shapes.txt' DELIMITER ',' CSV HEADER;
        \COPY "RTL".stop_times (trip_id,arrival_time,departure_time,stop_id,stop_sequence,stop_headsign,pickup_type,drop_off_type,shape_dist_traveled,timepoint) FROM '${path_rtl}/stop_times.txt' DELIMITER ',' CSV HEADER;
        \COPY "RTL".stops (stop_id,stop_code,stop_name,stop_lat,stop_lon,location_type,parent_station,wheelchair_boarding) FROM '${path_rtl}/stops.txt' DELIMITER ',' CSV HEADER;
        \COPY "RTL".trips (route_id,service_id,trip_id,trip_headsign,direction_id,block_id,shape_id,wheelchair_accessible) FROM '${path_rtl}/trips.txt' DELIMITER ',' CSV HEADER;
        \COPY "RTL".calendar (service_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday, start_date, end_date) FROM '${path_rtl}/calendar.txt' DELIMITER ',' CSV HEADER;
        UPDATE "RTL".stops SET point_geog = st_SetSrid(st_MakePoint(stop_lon, stop_lat), 4326);
        UPDATE "RTL".shapes SET point_geog = st_SetSrid(st_MakePoint(shape_pt_lon, shape_pt_lat), 4326);
        UPDATE "RTL".shapes SET point_geom = st_SetSrid(st_MakePoint(shape_pt_lon, shape_pt_lat), 4326);
        UPDATE "RTL".stop_times SET hresecondes = 
        ((SUBSTRING(departure_time FROM 1 FOR 2)::int)*60*60)+
        ((SUBSTRING(departure_time FROM 4 FOR 2)::int)*60)+
        ((SUBSTRING(departure_time FROM 7 FOR 2)::int));
        REFRESH MATERIALIZED VIEW "RTL".traces WITH DATA;
        REFRESH MATERIALIZED VIEW "RTL".stop_traces WITH DATA;
        REFRESH MATERIALIZED VIEW "RTL".stop_triptimes WITH DATA;
        --ajout de l'heure de depart et de l'heure d'arrivee du trip
        WITH minmaxtrip AS (
            SELECT trip_id,
            MIN(hresecondes) AS mindep,
            MAX(hresecondes) AS maxdep
            FROM "RTL".stop_times
            GROUP BY trip_id
        ),
        minmaxarray AS (
            SELECT trip_id,
            ARRAY_AGG(array[mindep,maxdep] ORDER BY trip_id) AS minmax
            FROM minmaxtrip
            GROUP BY trip_id
        )
        UPDATE "RTL".trips set firstlast = minmaxarray.minmax
        FROM minmaxarray
        WHERE "RTL".trips.trip_id = minmaxarray.trip_id;
        --ajout du nombre d'arrets pour chaque trip
        WITH maxstops AS (    
        SELECT trips.trip_id,
            COUNT(stop_times.stop_sequence) as stopcount
            FROM "RTL".trips
            LEFT JOIN "RTL".stop_times ON trips.trip_id = "RTL".stop_times.trip_id
            GROUP BY trips.trip_id)
        UPDATE "RTL".trips set stopcount = maxstops.stopcount
        FROM maxstops
        WHERE "RTL".trips.trip_id = maxstops.trip_id;
        --ajout des jours de service dans une seule colonne
        WITH tripdays AS (
            SELECT service_id,
            ARRAY_AGG(array[monday, tuesday, wednesday, thursday, friday, saturday, sunday] ORDER BY service_id) AS rundays
            FROM "RTL".calendar
            GROUP BY service_id
        )
        UPDATE "RTL".calendar set rundays = tripdays.rundays
        FROM tripdays
        WHERE "RTL".calendar.service_id = tripdays.service_id;  `
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













