import React from 'react';
import { Link } from 'react-router-dom';

const HowTo = () => (
  <React.Fragment>
    <div className="container-fluid">
      <div className="row">
        <div className="col-sm">
          <h1 id="title-card" className="display-4">Utilisation de busr</h1>
        </div>
      </div>
      <div className="jumbotron">
        <div className="container">
          <h1 className="display-4">busr = bus + realtime</h1>
          <p className="lead">busr est un tableau de bord qui utilise les données ouvertes disponibles pour visualiser en temps réel l'état du service d'autobus de la STM, de la STL et du RTL</p>
        </div>
      </div>
    </div>
  </React.Fragment>
);

export default HowTo;