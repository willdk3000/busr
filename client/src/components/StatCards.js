import React, { Component } from 'react';

class StatCards extends Component {
  render() {
    return (
      <React.Fragment>
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Réseau :</div>
              <div id='stat'>STM</div>
            </div>
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Rafraîchit à :</div>
              <div id='stat'>{this.props.lastRefreshSTM.substr(11, 8)}</div>
            </div>
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Véhicules actifs / planifiés :</div>
              <div id='stat'>{this.props.onlineVehiclesSTM} / {this.props.plannedVehiclesSTM}</div>
            </div>
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Lignes en service :</div>
              <div id='stat'>{this.props.routesSTM}</div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Réseau :</div>
              <div id='stat'>STL</div>
            </div>
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Rafraîchit à :</div>
              <div id='stat'>{this.props.lastRefreshSTL.substr(11, 8)}</div>
            </div>
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Véhicules actifs / planifiés :</div>
              <div id='stat'>{this.props.onlineVehiclesSTL} / {this.props.plannedVehiclesSTL}</div>
            </div>
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Lignes en service :</div>
              <div id='stat'>{this.props.routesSTL}</div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Réseau :</div>
              <div id='stat'>RTL</div>
            </div>
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Rafraîchit à :</div>
              <div id='stat'>{this.props.lastRefreshRTL.substr(11, 8)}</div>
            </div>
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Véhicules actifs / planifiés :</div>
              <div id='stat'>{this.props.onlineVehiclesRTL} / {this.props.plannedVehiclesRTL}</div>
            </div>
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Lignes en service :</div>
              <div id='stat'>{this.props.routesRTL}</div>
            </div>
          </div>
        </div>
      </React.Fragment >
    );
  }
}

export default StatCards;