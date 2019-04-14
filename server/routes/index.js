const dataHandlerController = require('../controllers').dataHandler;

module.exports = (app) => {

  app.get('/api/vehicles', dataHandlerController.list);
  // app.post('/api/transactionsgroup', transactionController.listgroup);
  // app.post('/api/transactions/insert', transactionController.insert);
  // app.post('/api/transactions/delete', transactionController.delete);

  // app.get('/api/codes', codesController.list);
  //app.post('/api/team_pitching/:action', team_pitchingController.requete);


};
