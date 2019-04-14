import React, { Component } from 'react';

class StatCards extends Component {
  render() {
    return (
      <React.Fragment>
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm" id="stat-card">
              <div id='nom-stat'>Véhicules en ligne :</div>
              <div id='stat'>{this.props.onlineVehicles}</div>
            </div>
            <div className="col-sm" id="stat-card">
              2 of 4 columns
            </div>
            <div className="col-sm" id="stat-card">
              3 of 4 columns
            </div>
            <div className="col-sm" id="stat-card">
              4 of 4 columns
            </div>
          </div>
        </div>
      </React.Fragment >
    );
  }
}

export default StatCards;