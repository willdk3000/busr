import React from 'react';

import {
  ResponsiveContainer,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip
} from 'recharts';

const turf = require('@turf/turf');

export async function calcGraphsTripsRTL(
  visibleChartTripsLiveUpdate,
  plannedTrips,
  stops,
  vehiclesRTL,
  tracesRTL
) {

  let stopsCounter = 0;

  visibleChartTripsLiveUpdate.forEach((e) => {

    //Trouver la position du trip dans l'array
    let tripIDS = [];
    plannedTrips.map((f) => {
      tripIDS.push(f.tripmin)
    })

    let position = tripIDS.indexOf(e)

    //Trouver les arrêts correspondants au trip
    let stopsRTL = stops[stopsCounter].tripStops;
    stopsCounter++;

    //Préparer les données pour le graph
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

    //Trouver les coordonnees actuelles du bus sur le trip
    const currentPositionFeature = vehiclesRTL.features.filter((f) => {
      return f.properties.trip_id === e
    })[0].geometry.coordinates;

    //Trouver la trace correspondant au trip
    const traceRTL = tracesRTL.features.filter((f) => {
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
              Distance : {payload[0].payload.x}<br />
              Planifié : {payload[0].payload.time}</p>
          </div>
        );
      }
      return null;
    };

    plannedTrips.splice(position + 1, 0, {
      keyid: position + 1,
      graph: 1,
      online: plannedTrips[position].online,
      timemin: parseInt(plannedTrips[position].timemin),
      timemax: plannedTrips[position].timemax,
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

  })

  //Affecter une cle unique correspondant a la position dans l'array
  let keyID = 0;
  plannedTrips.forEach((e) => {
    e.keyid = keyID;
    keyID++;
  })

  return plannedTrips

}