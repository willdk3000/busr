const knex = require('../config/knex')

module.exports = {

    insert(req, res) {
        const veh_len = JSON.parse(req)[0].features.length
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
                to_char(now(), 'D') as weekday 
            )
            INSERT INTO vehicles (timestamp, time, data, vehlen, weekday)
            SELECT * FROM data_array
            `
        )
            .then((result) => {
                //console.log('Positions rafraichies');
                return 'done'
            })
        // .finally(function () {
        //     knex.destroy();
        // });
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
        return knex('vehicles')
            .where({})
            .orderBy('timestamp', 'desc')
            .limit(1)
            .then(result => {
                return result
            })
    },

    allvehicles(req, res) {
        return knex('vehicles')
            .select('timestamp', 'vehlen')
            .where({})
            .then(result => {
                res.json(result)
            })
    }

}