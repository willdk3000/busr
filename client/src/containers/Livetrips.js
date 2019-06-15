import React, { Component } from 'react';
import ReactLoading from 'react-loading';

import {
  getNewData, leave,
  getTracesSTM, getTracesSTL, getTracesRTL,
  getStopsSTM, getStopsRTL, getStopsSTL
} from '../API.js';

import { calcGraphsTripsRTL } from '../helpers/tripsRTL.js';
import { calcGraphsTripsSTM } from '../helpers/tripsSTM.js';


const moment = require('moment');

class Livetrips extends Component {

  state = {
    tripList: [],
    selectStops: [],
    selectSTM: 0,
    selectSTL: 0,
    selectRTL: 0,
  };

  componentDidMount = async () => {

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
        keyIDRTL++;
        if (vehRTL[0].data.features.filter((f) => {
          return f.properties.trip_id === e.tripmin
        }).length > 0) {
          e.online = 1
        } else {
          e.online = 0
        }
      })

      // No trip ID in STL data
      // To Do : find a way to match live trips to planned gtfs data

      let keyIDSTM = 0;
      const checkOnlineSTM = positions[3].forEach((e) => {
        e.keyid = keyIDSTM;
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
        plannedTripsSTM: positions ? positions[3] : ''
      })

      //plannedTripsRTL: positions ? positions[1].sort((a, b) => (a.timemin > b.timemin) ? 1 : -1) : ''

    })


    const tracesRTL = await getTracesRTL();
    this.setState({
      tracesRTL: tracesRTL.rows[0].jsonb_build_object
    })

    const tracesSTM = await getTracesSTM();
    this.setState({
      tracesSTM: tracesSTM.rows[0].jsonb_build_object
    })


    if (this.state.selectRTL === 1 && this.state.plannedTripsRTL) {
      this.regenGraphRTL();
    }

    if (this.state.selectSTM === 1 && this.state.plannedTripsSTM) {
      this.regenGraphSTM();
    }

  }


  componentDidUpdate(prevProps, prevState) {

    const { tripList, plannedTripsRTL, plannedTripsSTM, selectRTL, selectSTM } = this.state;


    if (selectRTL === 1 && plannedTripsRTL !== prevState.plannedTripsRTL) {
      this.regenGraphRTL();
    }

    if (selectRTL === 1 && tripList.length !== prevState.tripList.length) {
      this.regenGraphRTL();
    }


    if (selectSTM === 1 && plannedTripsSTM !== prevState.plannedTripsSTM) {
      this.regenGraphSTM();
    }

    if (selectSTM === 1 && tripList.length !== prevState.tripList.length) {
      this.regenGraphSTM();
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
      plannedTripsWithGraphs: []
    })
  }

  handleClickRTL = async (e) => {
    this.setState({
      selectSTM: 0,
      selectSTL: 0,
      selectRTL: 1,
      tripList: [],
      selectStops: [],
      plannedTripsWithGraphs: []
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



  regenGraphRTL = async () => {

    let visibleChartTrips = [...this.state.tripList];

    // Get stops info --only if it has not been fetched yet
    // async/await fetch can't be included in forEach
    // has to be in for...of

    let stops = [...this.state.selectStops];

    for (const e of visibleChartTrips) {
      if (stops.filter((f) => { return f.tripID === e }).length === 0) {
        let tripStops = await this.stopRequestRTL(e);
        stops.push({
          tripID: e,
          tripStops: tripStops
        });
      }
    }

    let plannedTrips = [...this.state.plannedTripsRTL];

    // AutoRemove planned trips that are not in the current time window

    //** TODO: if trip not in current time window but still online, means
    //bus is late. Trip should not be autoremoved.

    let visibleChartTripsUpdate = [];
    const autoRemove = this.state.tripList.length > 0 ?
      this.state.tripList.forEach((e) => {
        if (this.state.plannedTripsRTL.filter((f) => {
          return e === f.tripmin
        }).length > 0) {
          visibleChartTripsUpdate.push(e)
        }
      }) :
      '';

    // AutoRemove trips that are not online anymore

    let visibleChartTripsLiveUpdate = [];
    const autoRemoveLive = visibleChartTripsUpdate.length > 0 ?
      visibleChartTripsUpdate.forEach((e) => {
        if (this.state.vehiclesRTL.features.filter((f) => {
          return f.properties.trip_id === e
        }).length > 0) {
          visibleChartTripsLiveUpdate.push(e)
        }
      }) :
      '';

    let vehiclesRTL = this.state.vehiclesRTL;
    let tracesRTL = this.state.tracesRTL;

    // Calcul des graphs
    plannedTrips = await calcGraphsTripsRTL(
      visibleChartTripsLiveUpdate,
      plannedTrips,
      stops,
      vehiclesRTL,
      tracesRTL
    );

    this.setState({
      plannedTripsWithGraphs: plannedTrips,
      tripList: visibleChartTripsLiveUpdate,
      selectStops: stops
    })

  }



  regenGraphSTM = async () => {

    let visibleChartTrips = [...this.state.tripList];

    // Get stops info --only if it has not been fetched yet
    // async/await fetch can't be included in forEach
    // has to be in for...of

    let stops = [...this.state.selectStops];

    for (const e of visibleChartTrips) {
      if (stops.filter((f) => { return f.tripID === e }).length === 0) {
        let tripStops = await this.stopRequestSTM(e);
        stops.push({
          tripID: e,
          tripStops: tripStops
        });
      }
    }

    let plannedTrips = [...this.state.plannedTripsSTM];

    // AutoRemove planned trips that are not in the current time window

    //**TO DO : if trip not in current time window but still online, means
    //bus is late. Trip should not be autoremoved.

    let visibleChartTripsUpdate = [];
    const autoRemove = this.state.tripList.length > 0 ?
      this.state.tripList.forEach((e) => {
        if (this.state.plannedTripsSTM.filter((f) => {
          return e === f.tripmin
        }).length > 0) {
          visibleChartTripsUpdate.push(e)
        }
      }) :
      '';

    // AutoRemove trips that are not online anymore

    let visibleChartTripsLiveUpdate = [];
    const autoRemoveLive = visibleChartTripsUpdate.length > 0 ?
      visibleChartTripsUpdate.forEach((e) => {
        if (this.state.vehiclesSTM.features.filter((f) => {
          return f.properties.trip_id === e
        }).length > 0) {
          visibleChartTripsLiveUpdate.push(e)
        }
      }) :
      '';

    let vehiclesSTM = this.state.vehiclesSTM;
    let tracesSTM = this.state.tracesSTM;

    // Prepare graphs
    plannedTrips = await calcGraphsTripsSTM(
      visibleChartTripsLiveUpdate,
      plannedTrips,
      stops,
      vehiclesSTM,
      tracesSTM
    );

    this.setState({
      plannedTripsWithGraphs: plannedTrips,
      tripList: visibleChartTripsLiveUpdate,
      selectStops: stops
    })

  }


  addToTripList = async (e) => {
    let tripListAdd = [...this.state.tripList];
    tripListAdd.push(e);
    this.setState({ tripList: tripListAdd })
  }


  removeFromTripList = async (e) => {
    let tripListRemove = [...this.state.tripList];
    let tripPosition = tripListRemove.indexOf(e);
    tripListRemove.splice(tripPosition, 1)

    let stopListRemove = [...this.state.selectStops];
    stopListRemove.splice(tripPosition, 1)

    this.setState({
      tripList: tripListRemove,
      selectStops: stopListRemove
    })
  }


  handleTripClickRTL = async (e) => {

    //if trip is online and graph not showing
    //add trip to list

    //if trip is online and graph showing
    //remove trip from list

    const showhide = this.state.plannedTripsRTL.filter((f) => {
      return f.tripmin === e.target.innerHTML
    })[0].online === 1 &&
      this.state.tripList.filter((f) => {
        return f === e.target.innerHTML
      }).length === 0 ?
      this.addToTripList(e.target.innerHTML) :
      this.state.plannedTripsRTL.filter((f) => {
        return f.tripmin === e.target.innerHTML
      })[0].online === 1 &&
        this.state.tripList.filter((f) => {
          return f === e.target.innerHTML
        }).length > 0 ?
        this.removeFromTripList(e.target.innerHTML)
        : ''

  }


  handleTripClickSTM = async (e) => {

    const showhide = this.state.plannedTripsSTM.filter((f) => {
      return f.tripmin === e.target.innerHTML
    })[0].online === 1 &&
      this.state.tripList.filter((f) => {
        return f === e.target.innerHTML
      }).length === 0 ?
      this.addToTripList(e.target.innerHTML) :
      this.state.plannedTripsSTM.filter((f) => {
        return f.tripmin === e.target.innerHTML
      })[0].online === 1 &&
        this.state.tripList.filter((f) => {
          return f === e.target.innerHTML
        }).length > 0 ?
        this.removeFromTripList(e.target.innerHTML)
        : ''

  }


  render() {

    return (
      this.state.plannedTripsSTM ?
        <div className="container-fluid">

          <div className="row">
            <div className="col-sm">
              <h2 id="title-card">Véhicule par départ</h2>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-sm-3 mt-2 mb-2" style={{ textAlign: "center", backgroundColor: "#E1FFE1" }}>
              Voyage planifié actif
            </div>
            <div className="col-sm-3 mt-2 mb-2" style={{ textAlign: "center", backgroundColor: "#FFE2E2" }}>
              Voyage planifié inactif
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
                    <th style={{ width: "7.5%" }}>
                      Ligne
                  </th>
                    <th style={{ width: "7.5%" }}>
                      Direction
                  </th>
                    <th style={{ width: "7.5%" }}>
                      Heure de départ
                  </th>
                    <th style={{ width: "7.5%" }}>
                      Heure de fin
                  </th>
                    <th style={{ width: "70%" }}>
                      Trip ID
                  </th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.selectRTL === 1 && this.state.plannedTripsWithGraphs.length > 0 ? this.state.plannedTripsWithGraphs.map((e) => e.graph === undefined ? (
                    <tr
                      key={e.keyid}
                      style={{
                        backgroundColor: e.online === 1 ? "#E1FFE1" : "#FFE2E2"
                      }}>
                      <td>{e.route_id}</td>
                      <td>{e.direction_id}</td>
                      <td>{moment("2019-05-10").startOf('day').seconds(e.timemin).format('H:mm:ss')}</td>
                      <td>{moment("2019-05-10").startOf('day').seconds(e.timemax).format('H:mm:ss')}</td>
                      <td
                        style={{
                          cursor: e.online === 1 ? 'pointer' : 'default'
                        }}
                        onClick={(event) => this.handleTripClickRTL(event)}
                      >
                        {e.tripmin}
                      </td>
                    </tr>
                  ) : <tr key={e.keyid}>
                      <td
                        colSpan="5"
                        style={{ backgroundColor: "#FFFFFF" }} >
                        {e.tripmin}
                      </td>
                    </tr>) : this.state.selectRTL === 1 && this.state.plannedTripsWithGraphs.length === 0 ?
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center" }}>
                          <ReactLoading type={"bubbles"} color={"#277D98"} height={200} width={100} />
                        </td>
                      </tr> :
                      this.state.selectSTM === 1 && this.state.plannedTripsWithGraphs.length > 0 ? this.state.plannedTripsWithGraphs.map((e) => e.graph === undefined ? (
                        <tr
                          key={e.keyid}
                          style={{
                            backgroundColor: e.online === 1 ? "#E1FFE1" : "#FFE2E2"
                          }}>
                          <td>{e.route_id}</td>
                          <td>{e.direction_id}</td>
                          <td>{moment("2019-05-10").startOf('day').seconds(e.timemin).format('H:mm:ss')}</td>
                          <td>{moment("2019-05-10").startOf('day').seconds(e.timemax).format('H:mm:ss')}</td>
                          <td
                            style={{
                              cursor: e.online === 1 ? 'pointer' : 'default'
                            }}
                            onClick={(event) => this.handleTripClickSTM(event)}
                          >
                            {e.tripmin}
                          </td>
                        </tr>
                      ) : <tr key={e.keyid}>
                          <td
                            colSpan="5"
                            style={{ backgroundColor: "#FFFFFF" }} >
                            {e.tripmin}
                          </td>
                        </tr>) :
                        this.state.selectSTM === 1 && this.state.plannedTripsWithGraphs.length === 0 ?
                          <tr>
                            <td colSpan="4" style={{ textAlign: "center" }}>
                              <ReactLoading type={"bubbles"} color={"#277D98"} height={200} width={100} />
                            </td>
                          </tr> :
                          <tr>
                            <td colSpan="5" style={{ textAlign: "center" }}> Sélectionner une agence</td>
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

export default Livetrips;