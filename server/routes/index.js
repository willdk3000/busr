const dataHandlerController = require('../controllers').dataHandler;
const gtfsHandlerController = require('../controllers').gtfsHandler;

module.exports = (app) => {

  app.get('/api/vehicles', dataHandlerController.latest);
  app.get('/api/allvehicles', dataHandlerController.allvehicles);

  app.get('/api/traces_stm', gtfsHandlerController.getTracesSTM);
  app.get('/api/stops_stm', gtfsHandlerController.getStopsSTM);

  app.get('/api/traces_stl', gtfsHandlerController.getTracesSTL);

  app.get('/api/traces_rtl', gtfsHandlerController.getTracesRTL);



};
