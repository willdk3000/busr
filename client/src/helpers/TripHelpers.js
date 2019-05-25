import React, { Component } from 'react';

import {
  ResponsiveContainer,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip
} from 'recharts';

const turf = require('@turf/turf');


export async function showGraphRTL(e) {

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