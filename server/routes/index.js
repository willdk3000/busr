const dataHandlerController = require('../controllers').dataHandler;
const gtfsHandlerController = require('../controllers').gtfsHandler;

module.exports = (app) => {

  app.get('/api/vehicles', dataHandlerController.list);
  app.get('/api/traces', gtfsHandlerController.getTraces);

};
