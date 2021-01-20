import React from 'react';
import { Switch, Route } from 'react-router-dom';

import NotFound from './NotFound';
import HowTo from './HowTo';

import Livemap from '../containers/Livemap';
import Livetrips from '../containers/Livetrips';
import Liveroutes from '../containers/Liveroutes';
import Historique from '../containers/Historique';
import Statsgtfs from '../containers/Statsgtfs';


const Routes = () => (
  <Switch>
    <Route exact path="/" component={Livemap} />
    <Route exact path="/historique" component={Historique} />
    <Route exact path="/livetrips" component={Livetrips} />
    <Route exact path="/liveroutes" component={Liveroutes} />
    <Route exact path="/statsgtfs" component={Statsgtfs} />
    <Route exact path="/howto" component={HowTo} />
    <Route path="*" component={NotFound} />
  </Switch>
);

export default Routes;
