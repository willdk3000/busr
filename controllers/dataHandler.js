const knex = require('../config/knex');
const moment = require('moment');

module.exports = {

    insertSTM(req, res) {
        const veh_len = JSON.parse(req)[0].features.length
        const time = moment(new Date()).format('HH:mm:ss');

        let timeNow = new Date();

        // Avec getDay, dimanche = 0 et samedi = 6
        let dayNow = timeNow.getDay();

        return knex.raw(
            `
            WITH data_array AS (
                SELECT 
                NOW() AS timestamp,
                LOCALTIME AS time,
                jsonb_array_elements('${req}'::jsonb) AS data,
                ${veh_len} AS vehlen,
                '${dayNow}' as weekday,
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

        let timeNow = new Date();
        let dayNow = timeNow.getDay();

        return knex.raw(
            `
            WITH data_array AS (
                SELECT 
                NOW() AS timestamp,
                LOCALTIME AS time,
                jsonb_array_elements('${req}'::jsonb) AS data,
                ${veh_len} AS vehlen,
                '${dayNow}' as weekday,
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

        let timeNow = new Date();
        let dayNow = timeNow.getDay();

        return knex.raw(
            `
            WITH data_array AS (
                SELECT 
                NOW() AS timestamp,
                LOCALTIME AS time,
                jsonb_array_elements('${req}'::jsonb) AS data,
                ${veh_len} AS vehlen,
                '${dayNow}' as weekday ,
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

        //25920 = (24h * 60min * 60sec / 30sec) * 3 jours * 3 agences
        //requete pour 3 jours de donnees pour les 3 agences

        return knex('vehicles')
            .select('timestamp', 'timestr', 'vehlen', 'weekday', 'reseau')
            .where({}).orderBy('timestamp', 'desc').limit(25920)
            .then(result => {
                res.json(result)
            })
    }

}