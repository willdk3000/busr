const knex = require('../config/knex');
const moment = require('moment');

module.exports = {

    insertSTM(req, res) {

        const veh = JSON.parse(req.VEH);
        const veh_len = veh[0].features.length;
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
                jsonb_array_elements('${req.VEH}'::jsonb) AS data,
                ${veh_len} AS vehlen,
                '${dayNow}' as weekday,
                'STM' AS reseau,
                '${time}' AS timestr,
                'STM' AS groupe,
                '${req.ID}' AS rid
            )
            INSERT INTO vehicles (timestamp, time, data, vehlen, weekday, reseau, timestr, groupe, rid)
            SELECT * FROM data_array
            `
        )
            .then((result) => {
                return 'done'
            })
    },

    insertSTL(req, res) {

        const veh = JSON.parse(req.VEH);
        const veh_len = veh[0].features.length;
        const time = moment(new Date()).format('HH:mm:ss');

        let timeNow = new Date();
        let dayNow = timeNow.getDay();

        return knex.raw(
            `
            WITH data_array AS (
                SELECT 
                NOW() AS timestamp,
                LOCALTIME AS time,
                jsonb_array_elements('${req.VEH}'::jsonb) AS data,
                ${veh_len} AS vehlen,
                '${dayNow}' as weekday,
                'STL' AS reseau,
                '${time}' AS timestr,
                'STL' AS groupe,
                '${req.ID}' AS rid
            )
            INSERT INTO vehicles (timestamp, time, data, vehlen, weekday, reseau, timestr, groupe, rid)
            SELECT * FROM data_array
            `
        )
            .then((result) => {
                return 'done'
            })
    },

    insertRTL(req, res) {

        const veh = JSON.parse(req.VEH);
        const veh_len = veh[0].features.length;
        const time = moment(new Date()).format('HH:mm:ss');

        let timeNow = new Date();
        let dayNow = timeNow.getDay();

        return knex.raw(
            `
            WITH data_array AS (
                SELECT 
                NOW() AS timestamp,
                LOCALTIME AS time,
                jsonb_array_elements('${req.VEH}'::jsonb) AS data,
                ${veh_len} AS vehlen,
                '${dayNow}' as weekday ,
                'RTL' AS reseau,
                '${time}' AS timestr,
                'RTL' AS groupe,
                '${req.ID}' AS rid
            )
            INSERT INTO vehicles (timestamp, time, data, vehlen, weekday, reseau, timestr, groupe, rid)
            SELECT * FROM data_array
            `
        )
            .then((result) => {
                return 'done'
            })
    },

    insertEXO(req, res) {

        let CIT = req.CIT
        //const veh = JSON.parse(req.VEH).features.length;
        const veh = JSON.parse(req.VEH);
        const veh_len = veh[0].features.length;
        //console.log(veh);
        const time = moment(new Date()).format('HH:mm:ss');

        let timeNow = new Date();
        let dayNow = timeNow.getDay();

        return knex.raw(
            `
            WITH data_array AS (
                SELECT 
                NOW() AS timestamp,
                LOCALTIME AS time,
                jsonb_array_elements('${req.VEH}'::jsonb) AS data,
                ${veh_len} AS vehlen,
                '${dayNow}' as weekday ,
                '${CIT}' AS reseau,
                '${time}' AS timestr,
                'exo' AS groupe,
                '${req.ID}' AS rid
            )
            INSERT INTO vehicles (timestamp, time, data, vehlen, weekday, reseau, timestr, groupe, rid)
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

        //34560 = (24h * 60min * 60sec / 30sec) * 3 jours * 4 agences
        //requete pour 3 jours de donnees pour les 4 agences

        return knex('vehicles')
            .select('timestr', 'weekday','groupe', 'rid').sum('vehlen')
            .where({})
            .groupBy('groupe', 'rid', 'timestr', 'weekday')
            .orderBy('rid', 'desc').limit(34560)
            .then(result => {
                res.json(result)
            })
    }

}