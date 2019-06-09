import React, { Component } from 'react';
import ReactLoading from 'react-loading';

import {
  ResponsiveContainer,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip
} from 'recharts';

import * as turf from '@turf/turf'

import {
  getNewData, leave,
  getTracesSTM, getTracesSTL, getTracesRTL,
  getStopsSTM, getStopsRTL, getStopsSTL
} from '../API.js';

import { calcGraphsTripsRTL, longestRoutesRTL } from '../helpers/tripsRoutesRTL.js';
import { calcGraphsTripsSTM, longestRoutesSTM } from '../helpers/tripsRoutesSTM.js';


const moment = require('moment');

class Liveroutes extends Component {

  state = {
    tripList: [],
    routeList: [],
    selectStops: [],
    plannedRoutesWithGraphsRTL: [],
    selectSTM: 0,
    selectSTL: 0,
    selectRTL: 0,
  };

  componentDidMount = async () => {

    const tracesRTL = await getTracesRTL();

    const getData = getNewData((err, positions) => {

      // Split data by network

      const vehSTM = positions ? positions[0].filter((e) => {
        return e.reseau === 'STM'
      }) : ''

      const vehSTL = positions ? positions[0].filter((e) => {
        return e.reseau === 'STL'
      }) : ''

      const vehRTL = positions ? positions[0].filter((e) => {
        return e.reseau === 'RTL'
      }) : ''

      // Add 'online' property when planned trip matches live data
      // Allows to color trip with green/red depending on property

      let keyIDRTL = 0;
      const checkOnlineRTL = positions[1].forEach((e) => {
        e.keyid = keyIDRTL;
        e.ligneDir = e.route_id + '_' + e.direction_id
        keyIDRTL++;
        if (vehRTL[0].data.features.filter((f) => {
          return f.properties.trip_id === e.tripmin
        }).length > 0) {
          e.online = 1
        } else {
          e.online = 0
        }
      })


      const completeTracesRTL = longestRoutesRTL(positions[1]);

      //const completeTracesSTM = longestRoutesSTM(positions[3]);

      // No trip ID in STL data
      // To Do : find a way to match live trips to planned gtfs data

      let keyIDSTM = 0;
      const checkOnlineSTM = positions[3].forEach((e) => {
        e.keyid = keyIDSTM;
        e.ligneDir = e.route_id + '_' + e.direction_id
        keyIDSTM++;
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
        plannedTripsRTL: positions ? positions[1] : '',
        plannedTripsSTL: positions ? positions[2].sort((a, b) => (a.timemin > b.timemin) ? 1 : -1) : '',
        plannedTripsSTM: positions ? positions[3] : '',
        plannedRoutesRTL: completeTracesRTL,
        tracesRTL: tracesRTL.rows[0].jsonb_build_object
      })

      //plannedTripsRTL: positions ? positions[1].sort((a, b) => (a.timemin > b.timemin) ? 1 : -1) : ''

    })

    if (this.state.selectRTL === 1 && this.state.plannedRoutesRTL) {
      this.regenGraphRoutesRTL();
    }


  }


  componentDidUpdate(prevProps, prevState) {

    const { routeList, plannedRoutesRTL, selectRTL } = this.state;


    if (selectRTL === 1 && routeList.length !== prevState.routeList.length) {
      this.regenGraphRoutesRTL();
    }

    if (selectRTL === 1 && plannedRoutesRTL !== prevState.plannedRoutesRTL) {
      this.regenGraphRoutesRTL();
    }

    console.log(this.state)

  }


  componentWillUnmount = async () => {
    leave();
  }


  handleClickSTM = async (e) => {
    this.setState({
      selectSTM: 1,
      selectSTL: 0,
      selectRTL: 0,
      tripList: [],
      selectStops: [],
    })
  }

  handleClickRTL = async (e) => {
    this.setState({
      selectSTM: 0,
      selectSTL: 0,
      selectRTL: 1,
      tripList: [],
      selectStops: [],
    })
  }

  stopRequestRTL = async (trip) => {
    const stopsResponseRTL = await getStopsRTL(trip);
    const parseStopsRTL = stopsResponseRTL.rows[0].jsonb_build_object
    return parseStopsRTL
  }


  regenGraphRoutesRTL = async () => {

    // TODO: remove offline routes by assigning online property to trips...

    let routeList = [...this.state.routeList];
    let tripList = [...this.state.plannedTripsRTL];
    let uniqueTrip = [];


    // Trip utilise pour generer les arrets de la ligne-direction
    routeList.forEach((e) => {
      uniqueTrip.push(
        tripList.filter((f) => {
          return f.ligneDir === e
        })[0].tripmin
      )
    })

    //console.log(uniqueTrip)

    let stops = [...this.state.selectStops];

    for (const e of uniqueTrip) {
      if (stops.filter((f) => { return f.tripID === e }).length === 0) {
        let tripStops = await this.stopRequestRTL(e);
        stops.push({
          tripID: e,
          tripStops: tripStops
        });
      }
    }

    let visibleChartRoutes = [...this.state.plannedRoutesRTL];

    let stopsCounter = 0;

    routeList.forEach((e) => {

      // Tous les trips de la ligne direction
      let tripsLigneDir = tripList.filter((f) => {
        return f.ligneDir === e
      })

      //console.log(tripsLigneDir)

      // Trouver la position de la route dans l'array de routes pour lesquels on affiche un graph
      let routeIDS = [];
      visibleChartRoutes.map((f) => {
        routeIDS.push(f.ligneDir)
      })

      let position = routeIDS.indexOf(e)

      let stopsRTL = stops[stopsCounter].tripStops;
      stopsCounter++;

      // Creer l'array d'arrets selon la trace identifiee
      let data = [];
      stopsRTL.features.map((f) => {
        data.push({
          name: f.properties.name,
          time: f.properties.departure_time,
          x: f.properties.stop_sequence,
          y: 0,
          z: 15
        })
      })

      // Preparation du calcul des positions des vehicules sur la ligne-direction
      let distArray = [];
      let tracesRTL = this.state.tracesRTL;
      let vehiclesRTL = this.state.vehiclesRTL;

      tripsLigneDir.forEach((k) => {
        //Trouver les coordonnees actuelles du bus sur le trip

        const currentPositionFeature = vehiclesRTL.features.filter((f) => {
          return f.properties.trip_id === k.tripmin
        })[0].geometry.coordinates;

        //Trouver la trace correspondant au trip
        const traceRTL = tracesRTL.features.filter((f) => {
          return f.properties.trips.some((g) => {
            return g === k.tripmin
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
        let dist = { x: Math.round((snapped.properties.location) * 1000), y: 0, z: 60 }

        distArray.push(dist);
      })

      const CustomTooltip = ({ active, payload }) => {
        if (active) {
          return (
            <div className="custom-tooltip">
              <p className="label">{payload[0].payload.name}<br />
                Distance : {payload[0].payload.x}<br />
              </p>
            </div>
          );
        }
        return null;
      };

      // si jamais le graph se regenere, c'est parce qu'on utilise pas la meme source entre le premier render
      // et les suivants. Pour s'assurer qu'il ne se regenere pas plusieurs fois, utiliser la meme source dans
      // le state initial et dans les setState suivants
      visibleChartRoutes.splice(position + 1, 0, {
        keyid: position + 1,
        graph: 1,
        ligneDir: 'graph',
        tripmin:
          <ResponsiveContainer width="98%" height={50} >
            <ScatterChart>
              <XAxis type="number" dataKey="x" hide />
              <YAxis type="number" dataKey="y" hide />
              <ZAxis type="number" dataKey="z" range={[10, 100]} domain={[15, 75]} />
              <Tooltip
                content={<CustomTooltip />}
              />
              <Scatter name="Arrets" data={data} fill="#000000" stroke="#5B5B5B" line shape="circle" />
              <Scatter name="Bus" data={distArray} fill="#A93332" shape="circle" />
            </ScatterChart>
          </ResponsiveContainer>

      })

    })

    //Affecter une cle unique correspondant a la position dans l'array
    let keyID = 0;
    visibleChartRoutes.forEach((e) => {
      e.keyid = keyID;
      keyID++;
    })

    this.setState({
      plannedRoutesWithGraphsRTL: visibleChartRoutes,
      selectStops: stops
    })

  }



  addToRouteList = async (e) => {
    let routeListAdd = [...this.state.routeList];
    routeListAdd.push(e);
    this.setState({ routeList: routeListAdd })
  }


  removeFromRouteList = async (e) => {
    let routeListRemove = [...this.state.routeList];
    let routePosition = routeListRemove.indexOf(e);
    routeListRemove.splice(routePosition, 1)

    // let stopListRemove = [...this.state.selectStops];
    // stopListRemove.splice(tripPosition, 1)

    this.setState({
      routeList: routeListRemove,
      // selectStops: stopListRemove
    })
  }


  handleRouteClickRTL = async (e) => {

    //if trip is online and graph not showing
    //add trip to list

    //if trip is online and graph showing
    //remove trip from list

    const showhide = this.state.routeList.filter((f) => {
      return f === e.target.innerHTML
    }).length === 0 ?
      this.addToRouteList(e.target.innerHTML) :
      this.state.routeList.filter((f) => {
        return f === e.target.innerHTML
      }).length > 0 ?
        this.removeFromRouteList(e.target.innerHTML)
        : ''

  }



  render() {

    return (
      this.state.plannedTripsSTM ?
        <div className="container-fluid">

          <div className="row">
            <div className="col-sm">
              <h2 id="title-card">Véhicule par ligne-direction</h2>
            </div>
          </div>
          {/*<div className="row justify-content-center">
            <div className="col-sm-3 mt-2 mb-2" style={{ textAlign: "center", backgroundColor: "#E1FFE1" }}>
              Ligne en service
            </div>
            <div className="col-sm-3 mt-2 mb-2" style={{ textAlign: "center", backgroundColor: "#FFE2E2" }}>
              Ligne hors-service
            </div>
    </div>*/}

          <div className="row no-gutters">
            <div className="col">
              <button
                id="agency-card"
                type="button" className="col btn btn-outline-info"
                style={this.state.selectSTM === 1 ?
                  { backgroundColor: "#38B2A3", color: "#FFFFFF" } :
                  { backgroundColor: "#E9F1F3", color: "#000000" }}
                onClick={(e) => this.handleClickSTM(e)}>
                STM
            </button>
            </div>
            <div className="col">
              <button type="button" className="col btn btn-outline-secondary" disabled>
                STL
            </button>
            </div>
            <div className="col">
              <button
                type="button" className="col btn btn-outline-info"
                style={this.state.selectRTL === 1 ?
                  { backgroundColor: "#38B2A3", color: "#FFFFFF" } :
                  { backgroundColor: "#E9F1F3", color: "#000000" }}
                onClick={(e) => this.handleClickRTL(e)}>
                RTL
            </button>
            </div>
          </div>


          <div className="row">
            <div className="col">
              <table id="tableOnline" className="table">
                <thead>
                  <tr>
                    <th style={{ width: "10%" }}>
                      Ligne
                  </th>
                    <th style={{ width: "10%" }}>
                      Direction
                  </th>
                    <th style={{ width: "80%" }}>
                      Ligne-Dir
                  </th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.selectRTL === 1 && this.state.plannedRoutesWithGraphsRTL.length > 0 ? this.state.plannedRoutesWithGraphsRTL.map((e) => e.graph === undefined ? (
                    <tr
                      key={e.keyid}
                    >
                      <td>{e.route_id}</td>
                      <td>{e.direction_id}</td>
                      <td style={{
                        cursor: 'pointer'
                      }}
                        onClick={(event) => this.handleRouteClickRTL(event)}>{e.ligneDir}</td>
                    </tr>
                  ) : <tr key={e.keyid}>
                      <td
                        colSpan="3">
                        {e.tripmin}
                      </td>
                    </tr>) : this.state.selectRTL === 1 && this.state.plannedRoutesWithGraphsRTL.length === 0 ?
                      <tr>
                        <td colSpan="3" style={{ textAlign: "center" }}>
                          <ReactLoading type={"bubbles"} color={"#277D98"} height={200} width={100} />
                        </td>
                      </tr> :
                      this.state.selectSTM === 1 && this.state.plannedRoutesWithGraphs.length > 0 ? this.state.plannedRoutesWithGraphs.map((e) => e.graph === undefined ? (
                        <tr
                          key={e.keyid}
                        >
                          <td>{e.route_id}</td>
                          <td>{e.direction_id}</td>
                          <td
                            style={{
                              cursor: 'pointer'
                            }}
                            onClick={(event) => this.handleTripClickSTM(event)}>{e.ligneDir}</td>
                        </tr>
                      ) : <tr key={e.keyid}>
                          <td
                            colSpan="3"
                          >
                            {e.tripmin}
                          </td>
                        </tr>) :
                        this.state.selectSTM === 1 && this.state.plannedRoutesWithGraphs.length === 0 ?
                          <tr>
                            <td colSpan="3" style={{ textAlign: "center" }}>
                              <ReactLoading type={"bubbles"} color={"#277D98"} height={200} width={100} />
                            </td>
                          </tr> :
                          <tr>
                            <td colSpan="3" style={{ textAlign: "center" }}> Sélectionner une agence</td>
                          </tr>}
                </tbody>
              </table>
            </div>
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

export default Liveroutes;