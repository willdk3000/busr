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
    tripListRTL: [],
    tripWithGraph: [],
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
      let keyID = 0;
      const checkOnlineRTL = positions[1].forEach((e) => {
        e.keyid = keyID;
        keyID++;
        if (vehRTL[0].data.features.filter((f) => {
          return f.properties.trip_id === e.tripmin
        }).length > 0) {
          e.online = 1
        } else {
          e.online = 0
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
        } else {
          e.online = 0
        }
      })



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
      })

    })

    const tracesRTL = await getTracesRTL();
    this.setState({
      tracesRTL: tracesRTL.rows[0].jsonb_build_object
    })

    const updatePlanned = this.state.plannedTripsRTL ? this.regenGraphRTL() : '';

  }


  componentDidUpdate(prevProps, prevState) {

    const { plannedTripsRTL, tripListRTL } = this.state;

    if (plannedTripsRTL !== prevState.plannedTripsRTL) {
      this.regenGraphRTL()
    }

    if (tripListRTL !== prevState.tripListRTL) {
      this.regenGraphRTL();
    }


  }


  componentWillUnmount = async () => {
    leave();
  }


  handleClickSTM = async (e) => {
    this.setState({
      selectSTM: 1,
      selectSTL: 0,
      selectRTL: 0,
      tripSelectRTL: 0
    })
  }

  handleClickRTL = async (e) => {
    this.setState({
      selectSTM: 0,
      selectSTL: 0,
      selectRTL: 1,
      tripSelectSTM: 0
    })
  }

  stopRequestRTL = async (trip) => {
    const stopsResponseRTL = await getStopsRTL(trip);
    const parseStopsRTL = stopsResponseRTL.rows[0].jsonb_build_object
    return parseStopsRTL
  }


  //Ajouter le graphique du trip choisi



  regenGraphRTL = async () => {

    let visibleChartTrips = [...this.state.tripListRTL];

    //Obtenir les donnees aux arrets - on ne peut pas inclure les async/await
    //dans le forEach

    let stops = [];
    for (const e of visibleChartTrips) {
      let tripStops = await this.stopRequestRTL(e);
      stops.push(tripStops);
    }

    let plannedTrips = [...this.state.plannedTripsRTL];

    //*****----- Demarrer la boucle qui genere les graphs ----- *****
    let stopsCounter = 0;

    visibleChartTrips.forEach((e) => {

      //Trouver la position du trip dans l'array
      let tripIDS = [];
      plannedTrips.map((f) => {
        tripIDS.push(f.tripmin)
      })

      let position = tripIDS.indexOf(e)

      //Trouver les arrêts correspondants au trip
      let stopsRTL = stops[stopsCounter];
      stopsCounter++;

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
        return f.properties.trip_id === e
      })[0].geometry.coordinates;

      //Trouver la trace correspondant au trip
      const traceRTL = this.state.tracesRTL.features.filter((f) => {
        return f.properties.trips.some((g) => {
          return g === e
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

      // Tooltip custom
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

      plannedTrips.splice(position + 1, 0, {
        keyid: position + 1,
        online: plannedTrips[position].online,
        timemin: parseInt(plannedTrips[position].timemin),
        timemax: plannedTrips[position].timemax,
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

      })

    })

    let keyID = 0;
    plannedTrips.forEach((e) => {
      e.keyid = keyID;
      keyID++;
    })

    this.setState({
      plannedTripsWithGraphs: plannedTrips,
    })

  }


  addToTripList = async (e) => {
    let tripListAdd = [...this.state.tripListRTL];
    tripListAdd.push(e);
    this.setState({ tripListRTL: tripListAdd })
  }

  removeFromTripList = async (e) => {
    let tripListRemove = [...this.state.tripListRTL];
    let tripPosition = tripListRemove.indexOf(e);
    tripListRemove.splice(tripPosition, 1)
    this.setState({ tripListRTL: tripListRemove })
  }


  handleTripClickRTL = async (e) => {

    //Si le trip est online
    //Si le graph du trip n'est pas encore affiché 
    //Ajouter a la liste

    //Si le trip est online
    //Si le graph du trip est affiché
    //Enlever de la liste

    const showhide = this.state.plannedTripsRTL.filter((f) => {
      return f.tripmin === e.target.innerHTML
    })[0].online === 1 &&
      this.state.tripListRTL.filter((f) => {
        return f === e.target.innerHTML
      }).length === 0 ?
      this.addToTripList(e.target.innerHTML) :
      this.state.plannedTripsRTL.filter((f) => {
        return f.tripmin === e.target.innerHTML
      })[0].online === 1 &&
        this.state.tripListRTL.filter((f) => {
          return f === e.target.innerHTML
        }).length > 0 ?
        this.removeFromTripList(e.target.innerHTML)
        : ''


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
              style={this.state.selectSTM === 1 ?
                { backgroundColor: "#38B2A3", color: "#FFFFFF" } :
                { backgroundColor: "#E9F1F3", color: "#000000" }}
              onClick={(e) => this.handleClickSTM(e)}>
              STM
            </button>
            <button type="button" className="col btn btn-outline-secondary" disabled>
              STL
            </button>
            <button
              type="button" className="col btn btn-outline-info"
              style={this.state.selectRTL === 1 ?
                { backgroundColor: "#38B2A3", color: "#FFFFFF" } :
                { backgroundColor: "#E9F1F3", color: "#000000" }}
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
                {this.state.selectRTL === 1 ? this.state.plannedTripsWithGraphs.map((e) => (
                  <tr key={e.keyid}>
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
                      <td style={{
                        backgroundColor: e.online === 1 ? "#ABFFAB" : "#FFABAB",
                        width: "50%"
                      }}>{e.tripmin}</td>
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