import React, { Component } from 'react';

import {
  getNewData, leave
} from '../API.js'

const moment = require('moment');

class Livetrips extends Component {

  state = {
    subscribed: 0,
    selectSTM: 0,
    selectSTL: 0,
    selectRTL: 0
  };

  componentDidMount = async () => {

    const getData = this.state.subscribed === 0 ?
      getNewData((err, positions) => {


        // Séparation des donnnées par réseau

        const vehSTM = positions ? positions[0].filter((e) => {
          return e.reseau === 'STM'
        }) : ''

        const vehSTL = positions ? positions[0].filter((e) => {
          return e.reseau === 'STL'
        }) : ''

        const vehRTL = positions ? positions[0].filter((e) => {
          return e.reseau === 'RTL'
        }) : ''

        // Ajout d'une propriété "online" aux voyages planifiés
        // Permet d'identifier les voyages en ligne dans le tableau

        const checkOnlineRTL = positions[1].forEach((e) => {
          if (vehRTL[0].data.features.filter((f) => {
            return f.properties.trip_id === e.tripmin
          }).length > 0) {
            e.online = 1
            // e.vehicle = vehRTL[0].data.features.filter((f) => {
            //   return f.properties.trip_id === e.tripmin
            // }).properties.vehicle_id
          } else {
            e.online = 0
            // e.vehicle = 'ND'
          }
        })

        // Pour les données de la STL, il n'y a pas de trip_id dans
        // les appels next_bus - voir si le match peut se faire avec
        // la ligne et l'heure...

        const checkOnlineSTM = positions[3].forEach((e) => {
          if (vehSTM[0].data.features.filter((f) => {
            return f.properties.trip_id === e.tripmin
          }).length > 0) {
            e.online = 1
            // e.vehicle = vehRTL[0].data.features.filter((f) => {
            //   return f.properties.trip_id === e.tripmin
            // }).properties.vehicle_id
          } else {
            e.online = 0
            // e.vehicle = vehRTL[0].data.features.filter((f) => {
            //   return f.properties.trip_id === e.tripmin
            // })[0]
          }
        })

        this.setState({
          vehiclesSTM: positions ? vehSTM[0].data : '',
          vehiclesSTL: positions ? vehSTL[0].data : '',
          vehiclesRTL: positions ? vehRTL[0].data : '',
          timestampSTM: positions ? vehSTM[0].time : '',
          timestampSTL: positions ? vehSTL[0].time : '',
          timestampRTL: positions ? vehSTL[0].time : '',
          subscribed: 1,
          plannedTripsRTL: positions ? positions[1] : '',
          plannedTripsSTL: positions ? positions[2] : '',
          plannedTripsSTM: positions ? positions[3] : ''
        })

      })
      : '';


  }

  componentDidUpdate(prevProps, prevState) {
    //console.log(this.state)
  }


  componentWillUnmount = async () => {
    leave();
    //closeSocket();
  }


  handleClickSTM = async (e) => {
    this.setState({
      selectSTM: 1,
      selectSTL: 0,
      selectRTL: 0
    })
  }

  handleClickRTL = async (e) => {
    this.setState({
      selectSTM: 0,
      selectSTL: 0,
      selectRTL: 1
    })
  }


  render() {
    return (
      this.state.plannedTripsRTL ?
        <div className="container">

          <div className="row justify-content-md-center">
            <div className="col-sm-3 mt-2 mb-2" style={{ textAlign: "center", backgroundColor: "#ABFFAB" }}>
              Voyage actif
            </div>
            <div className="col-sm-3 mt-2 mb-2" style={{ textAlign: "center", backgroundColor: "#FFABAB" }}>
              Voyage inactif
            </div>
          </div>

          <div className="row">
            <button
              id="agency-card"
              type="button" className="col btn btn-outline-info"
              style={this.state.selectSTM === 1 ? { backgroundColor: "#38B2A3", color: "#FFFFFF" } : { backgroundColor: "#E9F1F3", color: "#000000" }}
              onClick={(e) => this.handleClickSTM(e)}>
              STM
            </button>
            <button type="button" className="col btn btn-outline-secondary" disabled>
              STL
            </button>
            <button
              type="button" className="col btn btn-outline-info"
              style={this.state.selectRTL === 1 ? { backgroundColor: "#38B2A3", color: "#FFFFFF" } : { backgroundColor: "#E9F1F3", color: "#000000" }}
              onClick={(e) => this.handleClickRTL(e)}>
              RTL
            </button>
          </div>

          <div className="row">
            <table id="tableOnline" className="table">
              <thead>
                <tr>
                  <th>
                    Ligne
                  </th>
                  <th>
                    Heure de départ
                  </th>
                  <th>
                    Heure de fin
                  </th>
                  <th>
                    Trip ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {this.state.selectRTL == 1 ? this.state.plannedTripsRTL.sort((a, b) => (a.timemin > b.timemin) ? 1 : -1)
                  .map((e) => (
                    <tr key={e.tripmin}>
                      <td>{e.route_id}</td>
                      <td>{moment("2019-05-10").startOf('day').seconds(e.timemin).format('H:mm:ss')}</td>
                      <td>{moment("2019-05-10").startOf('day').seconds(e.timemax).format('H:mm:ss')}</td>
                      <td style={{ backgroundColor: e.online === 1 ? "#ABFFAB" : "#FFABAB" }}>{e.tripmin}</td>
                    </tr>
                  )) :
                  this.state.selectSTM == 1 ? this.state.plannedTripsSTM.sort((a, b) => (a.timemin > b.timemin) ? 1 : -1)
                    .map((e) => (
                      <tr key={e.tripmin}>
                        <td>{e.route_id}</td>
                        <td>{moment("2019-05-10").startOf('day').seconds(e.timemin).format('H:mm:ss')}</td>
                        <td>{moment("2019-05-10").startOf('day').seconds(e.timemax).format('H:mm:ss')}</td>
                        <td style={{ backgroundColor: e.online === 1 ? "#ABFFAB" : "#FFABAB" }}>{e.tripmin}</td>
                      </tr>
                    )) :
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center" }}> Sélectionner une agence</td>
                    </tr>}
              </tbody>
            </table>
          </div>
        </div >
        : 'Chargement...'
    );
  }
}

export default Livetrips;