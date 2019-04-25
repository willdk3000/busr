import React, { Component } from 'react';

class StatCards extends Component {
  render() {
    return (
      <React.Fragment>
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Rafraîchit à :</div>
              <div id='stat'>{this.props.lastRefresh.substr(0, 8)}</div>
            </div>
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Véhicules actifs :</div>
              <div id='stat'>{this.props.onlineVehiclesSTM}</div>
            </div>
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Lignes en service :</div>
              <div id='stat'>{this.props.routesSTM}</div>
            </div>
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Réseau :</div>
              <div id='stat'>STM</div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Rafraîchit à :</div>
              <div id='stat'>{this.props.lastRefresh.substr(0, 8)}</div>
            </div>
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Véhicules actifs :</div>
              <div id='stat'>{this.props.onlineVehiclesSTL}</div>
            </div>
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Lignes en service :</div>
              <div id='stat'>{this.props.routesSTL}</div>
            </div>
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Réseau :</div>
              <div id='stat'>STL</div>
            </div>
          </div>
        </div>
      </React.Fragment >
    );
  }
}

export default StatCards;