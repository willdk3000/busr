const knex = require('../config/knex')

module.exports = {

    insert(req, res) {
        return knex.raw(
            `
            WITH data_array AS (
                SELECT LOCALTIME AS timestamp,
                jsonb_array_elements('${req}'::jsonb) AS data
            )
            INSERT INTO vehicles (timestamp, data)
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
            .where({})
            .then(result => {
                res.json(result)
            })
    }

}