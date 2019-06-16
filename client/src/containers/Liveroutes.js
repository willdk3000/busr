import React, { Component } from 'react';
import ReactLoading from 'react-loading';

import {
  getNewData, leave,
  getTracesSTM, getTracesSTL, getTracesRTL,
  getStopsSTM, getStopsRTL, getStopsSTL
} from '../API.js';

import { longestRoutesRTL, regenGraphRoutesRTL } from '../helpers/routesRTL.js';
import { longestRoutesSTM, regenGraphRoutesSTM } from '../helpers/routesSTM.js';


class Liveroutes extends Component {

  state = {
    routeList: [],
    selectStops: [],
    plannedRoutesWithGraphs: [],
    selectSTM: 0,
    selectSTL: 0,
    selectRTL: 0,
  };

  componentDidMount = async () => {

    const tracesRTL = await getTracesRTL();

    const tracesSTM = await getTracesSTM();

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

      // get unique routes
      const completeTracesRTL = longestRoutesRTL(positions[1])

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

      // get unique routes
      const completeTracesSTM = longestRoutesSTM(positions[3])


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
        plannedRoutesSTM: completeTracesSTM,
        tracesRTL: tracesRTL.rows[0].jsonb_build_object,
        tracesSTM: tracesSTM.rows[0].jsonb_build_object
      })

      //plannedTripsRTL: positions ? positions[1].sort((a, b) => (a.timemin > b.timemin) ? 1 : -1) : ''

    })

    if (this.state.selectRTL === 1 && this.state.plannedRoutesRTL) {
      this.regenGraphRoutesRTL();
    }

    if (this.state.selectSTM === 1 && this.state.plannedRoutesSTM) {
      this.regenGraphRoutesSTM();
    }


  }


  componentDidUpdate(prevProps, prevState) {

    const { routeList, plannedRoutesRTL, plannedRoutesSTM, selectRTL, selectSTM } = this.state;

    if (selectRTL === 1 && routeList.length !== prevState.routeList.length) {
      this.regenGraphRoutesRTL();
    }

    if (selectRTL === 1 && plannedRoutesRTL !== prevState.plannedRoutesRTL) {
      this.regenGraphRoutesRTL();
    }

    if (selectSTM === 1 && routeList.length !== prevState.routeList.length) {
      this.regenGraphRoutesSTM();
    }

    if (selectSTM === 1 && plannedRoutesSTM !== prevState.plannedRoutesSTM) {
      this.regenGraphRoutesSTM();
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
      selectStops: [],
      routeList: [],
      plannedRoutesWithGraphs: []
    })
  }

  handleClickRTL = async (e) => {
    this.setState({
      selectSTM: 0,
      selectSTL: 0,
      selectRTL: 1,
      selectStops: [],
      routeList: [],
      plannedRoutesWithGraphs: []
    })
  }

  stopRequestRTL = async (trip) => {
    const stopsResponseRTL = await getStopsRTL(trip);
    const parseStopsRTL = stopsResponseRTL.rows[0].jsonb_build_object
    return parseStopsRTL
  }

  stopRequestSTM = async (trip) => {
    const stopsResponseSTM = await getStopsSTM(trip);
    const parseStopsSTM = stopsResponseSTM.rows[0].jsonb_build_object
    return parseStopsSTM
  }


  regenGraphRoutesRTL = async () => {

    //TODO: autoremove that are not online and not in timewindow

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

    let stops = [...this.state.selectStops];

    // Get stops info --only if it has not been fetched yet
    // async/await fetch can't be included in forEach
    // has to be in for...of
    for (const e of uniqueTrip) {
      if (stops.filter((f) => { return f.tripID === e }).length === 0) {
        let tripStops = await this.stopRequestRTL(e);
        stops.push({
          tripID: e,
          tripStops: tripStops
        });
      }
    }

    // Recalcul des lignes qui sont online
    let visibleChartRoutes = [...this.state.plannedRoutesRTL];
    //let visibleChartRoutesUpdate = longestRoutesSTM(visibleChartRoutes);

    let tracesRTL = this.state.tracesRTL;
    let vehiclesRTL = this.state.vehiclesRTL;

    visibleChartRoutes = regenGraphRoutesRTL(
      routeList,
      tripList,
      visibleChartRoutes,
      stops,
      vehiclesRTL,
      tracesRTL);

    //Affecter une cle unique correspondant a la position dans l'array
    let keyID = 0;
    visibleChartRoutes.forEach((e) => {
      e.keyid = keyID;
      keyID++;
    })

    this.setState({
      plannedRoutesWithGraphs: visibleChartRoutes,
      selectStops: stops
    })

  }

  regenGraphRoutesSTM = async () => {

    //TODO: autoremove that are not online and not in timewindow

    let routeList = [...this.state.routeList];
    let tripList = [...this.state.plannedTripsSTM];
    let uniqueTrip = [];


    // Trip utilise pour generer les arrets de la ligne-direction
    routeList.forEach((e) => {
      uniqueTrip.push(
        tripList.filter((f) => {
          return f.ligneDir === e
        })[0].tripmin
      )
    })

    let stops = [...this.state.selectStops];

    // Get stops info --only if it has not been fetched yet
    // async/await fetch can't be included in forEach
    // has to be in for...of
    for (const e of uniqueTrip) {
      if (stops.filter((f) => { return f.tripID === e }).length === 0) {
        let tripStops = await this.stopRequestSTM(e);
        stops.push({
          tripID: e,
          tripStops: tripStops
        });
      }
    }


    let visibleChartRoutes = [...this.state.plannedRoutesSTM];

    let tracesSTM = this.state.tracesSTM;
    let vehiclesSTM = this.state.vehiclesSTM;

    visibleChartRoutes = regenGraphRoutesSTM(
      routeList,
      tripList,
      visibleChartRoutes,
      stops,
      vehiclesSTM,
      tracesSTM);

    //Affecter une cle unique correspondant a la position dans l'array
    let keyID = 0;
    visibleChartRoutes.forEach((e) => {
      e.keyid = keyID;
      keyID++;
    })

    this.setState({
      plannedRoutesWithGraphs: visibleChartRoutes,
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

    let stopListRemove = [...this.state.selectStops];
    stopListRemove.splice(routePosition, 1)

    this.setState({
      routeList: routeListRemove,
      selectStops: stopListRemove
    })
  }


  handleRouteClickRTL = async (e) => {

    //if trip is online and graph not showing
    //add trip to list

    //if trip is online and graph showing
    //remove trip from list

    const showhide = this.state.plannedRoutesRTL.filter((f) => {
      return f.ligneDir === e.target.innerHTML
    })[0].online === 1 && this.state.routeList.filter((f) => {
      return f === e.target.innerHTML
    }).length === 0 ?
      this.addToRouteList(e.target.innerHTML) :
      this.state.routeList.filter((f) => {
        return f === e.target.innerHTML
      }).length > 0 ?
        this.removeFromRouteList(e.target.innerHTML)
        : ''

  }


  handleRouteClickSTM = async (e) => {

    const showhide = this.state.plannedRoutesSTM.filter((f) => {
      return f.ligneDir === e.target.innerHTML
    })[0].online === 1 && this.state.routeList.filter((f) => {
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
              <h1 id="title-card" className="display-4">Vue linéaire : par ligne</h1>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-sm-4 mt-2 mb-2" style={{ textAlign: "center", backgroundColor: "#E1FFE1" }}>
              Ligne planifiée en ligne
            </div>
            <div className="col-sm-4 mt-2 mb-2" style={{ textAlign: "center", backgroundColor: "#FFE2E2" }}>
              Ligne planifiée hors-ligne
            </div>
          </div>

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
                    <th style={{ width: "20%" }}>
                      Direction
                  </th>
                    <th style={{ width: "70%" }}>
                      Ligne-Dir
                  </th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.selectRTL === 1 && this.state.plannedRoutesWithGraphs.length > 0 ? this.state.plannedRoutesWithGraphs.map((e) => e.graph === undefined ? (
                    <tr
                      key={e.keyid}
                      style={{
                        backgroundColor: e.online === 1 ? "#E1FFE1" : "#FFE2E2"
                      }}>
                      <td>{e.route_id}</td>
                      <td>{e.direction_id === 1 ? 'Centre-Ville' : 'Périphérie'}</td>
                      <td style={{
                        cursor: e.online === 1 ? 'pointer' : 'default'
                      }}
                        onClick={(event) => this.handleRouteClickRTL(event)}>{e.ligneDir}</td>
                    </tr>
                  ) : <tr key={e.keyid}>
                      <td
                        colSpan="3">
                        {e.tripmin}
                      </td>
                    </tr>) : this.state.selectRTL === 1 && this.state.plannedRoutesWithGraphs.length === 0 ?
                      <tr>
                        <td colSpan="3" style={{ textAlign: "center" }}>
                          <ReactLoading type={"bubbles"} color={"#277D98"} height={200} width={100} />
                        </td>
                      </tr> :
                      this.state.selectSTM === 1 && this.state.plannedRoutesWithGraphs.length > 0 ? this.state.plannedRoutesWithGraphs.map((e) => e.graph === undefined ? (
                        <tr
                          key={e.keyid}
                          style={{
                            backgroundColor: e.online === 1 ? "#E1FFE1" : "#FFE2E2"
                          }}>
                          <td>{e.route_id}</td>
                          <td>{e.direction_id}</td>
                          <td
                            style={{
                              cursor: e.online === 1 ? 'pointer' : 'default'
                            }}
                            onClick={(event) => this.handleRouteClickSTM(event)}>{e.ligneDir}</td>
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