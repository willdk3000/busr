import React from 'react';
import { Switch, Route } from 'react-router-dom';
import NotFound from './NotFound';

import Livemap from '../containers/Livemap';

const Routes = () => (
  <Switch>
    <Route exact path="/" component={Livemap} />
    <Route path="*" component={NotFound} />
  </Switch>
);

export default Routes;
