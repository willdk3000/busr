// Update with your config settings.
require('dotenv').config();

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      host : process.env.DEV_DB_HOST,
      user : process.env.DEV_DB_USER,
      password : process.env.DEV_DB_PASS,
      database : process.env.DEV_DB_NAME
    },
    migrations: {
      directory: __dirname + '/migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: __dirname + '/migrations'
    }
  }

};