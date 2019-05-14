const knex = require('../config/knex');
const moment = require('moment');

module.exports = {

    insertSTM(req, res) {
        const veh_len = JSON.parse(req)[0].features.length
        const time = moment(new Date()).format('HH:mm:ss');
        console.log('TIME', time)
        //SELECT LOCALTIME AS timestamp //pour avoir seulement l'heure
        //pour les weekday, 1 = dimanche, 2 = lundi, ...
        return knex.raw(
            `
            WITH data_array AS (
                SELECT 
                NOW() AS timestamp,
                LOCALTIME AS time,
                jsonb_array_elements('${req}'::jsonb) AS data,
                ${veh_len} AS vehlen,
                to_char(now(), 'D') as weekday,
                'STM' AS reseau,
                '${time}' AS timestr
            )
            INSERT INTO vehicles (timestamp, time, data, vehlen, weekday, reseau, timestr)
            SELECT * FROM data_array
            `
        )
            .then((result) => {
                return 'done'
            })
    },

    insertSTL(req, res) {
        const veh_len = JSON.parse(req)[0].features.length;
        const time = moment(new Date()).format('HH:mm:ss');

        //SELECT LOCALTIME AS timestamp //pour avoir seulement l'heure
        //pour les weekday, 1 = dimanche, 2 = lundi, ...
        return knex.raw(
            `
            WITH data_array AS (
                SELECT 
                NOW() AS timestamp,
                LOCALTIME AS time,
                jsonb_array_elements('${req}'::jsonb) AS data,
                ${veh_len} AS vehlen,
                to_char(now(), 'D') as weekday,
                'STL' AS reseau,
                '${time}' AS timestr
            )
            INSERT INTO vehicles (timestamp, time, data, vehlen, weekday, reseau, timestr)
            SELECT * FROM data_array
            `
        )
            .then((result) => {
                return 'done'
            })
    },

    insertRTL(req, res) {
        const veh_len = JSON.parse(req)[0].features.length;
        const time = moment(new Date()).format('HH:mm:ss');

        //SELECT LOCALTIME AS timestamp //pour avoir seulement l'heure
        //pour les weekday, 1 = dimanche, 2 = lundi, ...
        return knex.raw(
            `
            WITH data_array AS (
                SELECT 
                NOW() AS timestamp,
                LOCALTIME AS time,
                jsonb_array_elements('${req}'::jsonb) AS data,
                ${veh_len} AS vehlen,
                to_char(now(), 'D') as weekday ,
                'RTL' AS reseau,
                '${time}' AS timestr
            )
            INSERT INTO vehicles (timestamp, time, data, vehlen, weekday, reseau, timestr)
            SELECT * FROM data_array
            `
        )
            .then((result) => {
                return 'done'
            })
    },

    delete(req, res) {
        return knex.raw(
            `
            TRUNCATE vehicles
            `
        )
            .then(() => {
                //console.log('Donnees supprimees')
                return 'done'
            })
    },

    latest(req, res) {
        return knex.raw(
            `
            SELECT
                *
            FROM (
                SELECT
                    ROW_NUMBER() OVER (PARTITION BY reseau ORDER BY timestamp DESC) AS r,
                    t.*
                FROM
                    vehicles t) x
            WHERE
                x.r <= 1;
            `
        ).then((result) => {
            //console.log(result.rows)
            return result.rows
        })
    },

    allvehicles(req, res) {
        return knex('vehicles')
            .select('timestr', 'vehlen', 'weekday', 'reseau')
            .where({})
            .then(result => {
                res.json(result)
            })
    }

}