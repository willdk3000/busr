import React, { Component } from 'react';
import ReactLoading from 'react-loading';

import {
  getNewData, leave,
  getTracesSTM, getTracesSTL, getTracesRTL,
  getStopsSTM, getStopsRTL, getStopsSTL
} from '../API.js';

import {
  ResponsiveContainer,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip
} from 'recharts';

const moment = require('moment');
const turf = require('@turf/turf');


class Livetrips extends Component {

  state = {
    tripSelectRTL: 0,
    selectSTM: 0,
    selectSTL: 0,
    selectRTL: 0
  };

  componentDidMount = async () => {

    const getData = getNewData((err, positions) => {

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

      this.state.tripSelectRTL === 0 ?
        this.setState({
          vehiclesSTM: positions ? vehSTM[0].data : '',
          vehiclesSTL: positions ? vehSTL[0].data : '',
          vehiclesRTL: positions ? vehRTL[0].data : '',
          timestampSTM: positions ? vehSTM[0].time : '',
          timestampSTL: positions ? vehSTL[0].time : '',
          timestampRTL: positions ? vehSTL[0].time : '',
          plannedTripsRTL: positions ? positions[1].sort((a, b) => (a.timemin > b.timemin) ? 1 : -1) : '',
          plannedTripsSTL: positions ? positions[2].sort((a, b) => (a.timemin > b.timemin) ? 1 : -1) : '',
          plannedTripsSTM: positions ? positions[3].sort((a, b) => (a.timemin > b.timemin) ? 1 : -1) : ''
        }) :
        this.setState({
          vehiclesSTM: positions ? vehSTM[0].data : '',
          vehiclesSTL: positions ? vehSTL[0].data : '',
          vehiclesRTL: positions ? vehRTL[0].data : '',
        })

    })

    // const tracesSTM = await getTracesSTM();
    // this.setState({
    //   tracesSTM: tracesSTM.rows[0].jsonb_build_object
    // })

    // const tracesSTL = await getTracesSTL();
    // this.setState({
    //   tracesSTL: tracesSTL.rows[0].jsonb_build_object
    // })

    const tracesRTL = await getTracesRTL();
    this.setState({
      tracesRTL: tracesRTL.rows[0].jsonb_build_object
    })

  }

  componentDidUpdate(prevProps, prevState) {

    //console.log(this.state)

    const { vehiclesSTM, vehiclesSTL, vehiclesRTL } = this.state;

    if (vehiclesRTL !== prevState.vehiclesRTL && this.state.tripSelectRTL === 1 && vehiclesRTL.features.filter((e) => {
      return e.properties.trip_id === this.state.tripRTL
    }).length > 0) {
      this.showGraph(this.state.tripRTL)
    }

    //Validation : si le trip n'est plus actif, alors eteindre la visualisation synoptique

  }


  componentWillUnmount = async () => {
    leave();
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

  stopRequestRTL = async (trip) => {
    const stopsResponseRTL = await getStopsRTL(trip);
    const parseStopsRTL = stopsResponseRTL.rows[0].jsonb_build_object
    return parseStopsRTL
  }

  showGraph = async (e) => {

    let tripRTL = e;

    //Extraire les numéros de trips actifs
    let trips = [...this.state.plannedTripsRTL.sort((a, b) => (a.timemin > b.timemin))];
    let tripsArray = [];
    trips.map((f) => {
      tripsArray.push(f.tripmin)
    })

    //Trouver l'emplacement du voyage selectionné dans l'array
    let position = tripsArray.indexOf(tripRTL);

    //Trouver les arrêts correspondants
    let stopsRTL = this.state.tripSelectRTL === 1 ? this.state.stopsSelectRTL : await this.stopRequestRTL(tripRTL);

    //Préparer les données pour le graph
    let data = [];
    stopsRTL.features.map((f) => {
      data.push({
        name: f.properties.name,
        x: f.properties.stop_sequence,
        y: 0,
        z: 15
      })
    })

    //Trouver les coordonnees actuelles du bus sur le trip
    const currentPositionFeature = this.state.vehiclesRTL.features.filter((f) => {
      return f.properties.trip_id === tripRTL
    })[0].geometry.coordinates;

    //Trouver la trace correspondant au trip
    const traceRTL = this.state.tracesRTL.features.filter((f) => {
      return f.properties.trips.some((g) => {
        return g === tripRTL
      })
    })

    //Trouver la distance parcourue par le bus sur le trip
    const coordTrace = [];

    traceRTL[0].geometry.coordinates.map((f) => {
      coordTrace.push(f)
    })

    let turfLine = turf.lineString(coordTrace);
    let pt = turf.point(currentPositionFeature);
    let snapped = turf.nearestPointOnLine(turfLine, pt, { units: 'kilometers' });
    let dist = [{ x: Math.round((snapped.properties.location) * 1000), y: 0, z: 60 }]

    //Afficher le graphique
    const CustomTooltip = ({ active, payload }) => {
      if (active) {
        return (
          <div className="custom-tooltip">
            <p className="label">{payload[0].payload.name}<br />
              Distance : {payload[0].payload.x}</p>
          </div>
        );
      }

      return null;
    };

    this.state.tripSelectRTL === 0 ?
      trips.splice(position + 1, 0, {
        online: trips[position].online,
        timemin: parseInt(trips[position].timemin),
        timemax: trips[position].timemax,
        tripmin:
          <ResponsiveContainer width="100%" height={50} >
            <ScatterChart>
              <XAxis type="number" dataKey="x" hide />
              <YAxis type="number" dataKey="y" hide />
              <ZAxis type="number" dataKey="z" range={[10, 100]} domain={[15, 75]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Arrets" data={data} fill="#000000" stroke="#5B5B5B" line shape="circle" />
              <Scatter name="Bus" data={dist} fill="#A93332" line shape="circle" />
            </ScatterChart>
          </ResponsiveContainer >
      }) :
      trips.splice(position + 1, 1, {
        online: trips[position].online,
        timemin: parseInt(trips[position].timemin),
        timemax: trips[position].timemax,
        tripmin:
          <ResponsiveContainer width="100%" height={50} >
            <ScatterChart>
              <XAxis type="number" dataKey="x" hide />
              <YAxis type="number" dataKey="y" hide />
              <ZAxis type="number" dataKey="z" range={[10, 100]} domain={[15, 75]} />
              <Tooltip
                content={<CustomTooltip />}
              />
              <Scatter name="Arrets" data={data} fill="#000000" stroke="#5B5B5B" line shape="circle" />
              <Scatter name="Bus" data={dist} fill="#A93332" line shape="circle" />
            </ScatterChart>
          </ResponsiveContainer >
      })

    this.setState({
      tripSelectRTL: 1,
      tripRTL: tripRTL,
      plannedTripsRTL: trips,
      stopsSelectRTL: stopsRTL
    })
  }


  handleTripClickRTL = async (e) => {

    this.state.tripSelectRTL === 0 && this.state.plannedTripsRTL.filter((f) => {
      return f.tripmin === e.target.innerHTML
    })[0].online === 1 ?
      this.showGraph(e.target.innerHTML) :
      this.setState({ tripSelectRTL: 0 })

  }


  render() {

    return (
      this.state.plannedTripsRTL ?

        <div className="container-fluid">
          <div className="row justify-content-center">
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
                  <th style={{ width: "10%" }}>
                    Ligne
                  </th>
                  <th style={{ width: "10%" }}>
                    Heure de départ
                  </th>
                  <th style={{ width: "10%" }}>
                    Heure de fin
                  </th>
                  <th style={{ width: "70%" }}>
                    Trip ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {this.state.selectRTL === 1 ? this.state.plannedTripsRTL.map((e) => (
                  <tr key={e.tripmin}>
                    <td>{e.route_id}</td>
                    <td>{moment("2019-05-10").startOf('day').seconds(e.timemin).format('H:mm:ss')}</td>
                    <td>{moment("2019-05-10").startOf('day').seconds(e.timemax).format('H:mm:ss')}</td>
                    <td
                      style={{
                        backgroundColor: e.online === 1 ? "#ABFFAB" : "#FFABAB",
                        cursor: e.online === 1 ? 'pointer' : 'default'
                      }}
                      onClick={(event) => this.handleTripClickRTL(event)}
                    >
                      {e.tripmin}
                    </td>
                  </tr>
                )) :
                  this.state.selectSTM === 1 ? this.state.plannedTripsSTM.map((e) => (
                    <tr key={e.tripmin}>
                      <td>{e.route_id}</td>
                      <td>{moment("2019-05-10").startOf('day').seconds(e.timemin).format('H:mm:ss')}</td>
                      <td>{moment("2019-05-10").startOf('day').seconds(e.timemax).format('H:mm:ss')}</td>
                      <td style={{ backgroundColor: e.online === 1 ? "#ABFFAB" : "#FFABAB", width: "50%" }}>{e.tripmin}</td>
                    </tr>
                  )) :
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center" }}> Sélectionner une agence</td>
                    </tr>}
              </tbody>
            </table>
          </div>
        </div >
        : <div className="container">
          <div className="row justify-content-center">Chargement en cours...</div>
          <div className="row justify-content-center">
            <div><ReactLoading type={"bars"} color={"#277D98"} height={300} width={175} /></div>
          </div>
        </div>
    )
  }
}

export default Livetrips;