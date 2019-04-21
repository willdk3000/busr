const dataHandlerController = require('../controllers').dataHandler;
const gtfsHandlerController = require('../controllers').gtfsHandler;

module.exports = (app) => {

  app.get('/api/vehicles', dataHandlerController.latest);
  app.get('/api/allvehicles', dataHandlerController.allvehicles);

  app.get('/api/traces', gtfsHandlerController.getTraces);
  app.get('/api/stops', gtfsHandlerController.getStops);

};
