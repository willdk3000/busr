import React from 'react';

import {
  ResponsiveContainer,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip
} from 'recharts';

const turf = require('@turf/turf');

export async function calcGraphsTripsSTM(
  visibleChartTripsLiveUpdate,
  plannedTrips,
  stops,
  vehiclesSTM,
  tracesSTM
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
    let stopsSTM = stops[stopsCounter].tripStops;
    stopsCounter++;

    // Préparer les données pour le graph

    // Etape supplementaire par rapport au RTL :

    // La STM ne met pas les distances parcourues dans stop_sequence
    // Il faut calculer la distance parcourue a chaque stop sur le trip avec turf

    //Trouver la trace correspondant au trip
    const traceSTM = tracesSTM.features.filter((f) => {
      return f.properties.trips.some((g) => {
        return g === e
      })
    })

    const coordTrace = [];

    traceSTM[0].geometry.coordinates.map((f) => {
      coordTrace.push(f)
    })

    let turfLine = turf.lineString(coordTrace);

    let stop_distances = [];

    stopsSTM.features.forEach((f) => {
      let pt = turf.point(f.geometry.coordinates);
      let snapped = turf.nearestPointOnLine(turfLine, pt, { units: 'kilometers' });
      let dist = Math.round((snapped.properties.location) * 1000);
      stop_distances.push(dist)
    })


    let data = [];
    let stopsequence = 0;
    stopsSTM.features.map((f) => {
      data.push({
        name: f.properties.name,
        time: f.properties.departure_time,
        x: stop_distances[stopsequence],
        y: 0,
        z: 15
      })
      stopsequence++;
    })

    //Trouver les coordonnees actuelles du bus sur le trip
    const currentPositionFeature = vehiclesSTM.features.filter((f) => {
      return f.properties.trip_id === e
    })[0].geometry.coordinates;


    //Trouver la distance parcourue par le bus sur le trip
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
        <ResponsiveContainer width="95%" height={50} >
          <ScatterChart>
            <XAxis type="number" dataKey="x" hide />
            <YAxis type="number" dataKey="y" hide />
            <ZAxis type="number" dataKey="z" range={[10, 100]} domain={[15, 75]} />
            <Tooltip
              content={<CustomTooltip />}
            />
            <Scatter name="Arrets" data={data} fill="#000000" stroke="#5B5B5B" line shape="circle" />
            <Scatter name="Bus" data={dist} fill="#009DE0" line shape="circle" />
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

