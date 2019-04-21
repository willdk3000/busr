import React from 'react';
import { Switch, Route } from 'react-router-dom';
import NotFound from './NotFound';

import Livemap from '../containers/Livemap';
import Historique from '../containers/Historique';

const Routes = () => (
  <Switch>
    <Route exact path="/" component={Livemap} />
    <Route exact path="/historique" component={Historique} />
    <Route path="*" component={NotFound} />
  </Switch>
);

export default Routes;
