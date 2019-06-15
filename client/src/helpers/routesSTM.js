import React from 'react';

import {
  ResponsiveContainer,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip
} from 'recharts';

const turf = require('@turf/turf');


// Get unique routes-directions

export function longestRoutesSTM(plannedTripsSTM) {

  let ligneDir = [];
  plannedTripsSTM.map((e) => {
    ligneDir.push({
      keyid: e.keyid,
      route_id: e.route_id,
      direction_id: e.direction_id,
      ligneDir: e.route_id + '_' + e.direction_id,
      online: e.online,
      stopcount: e.stopcount,
      trip_id: e.tripmin
    })
  })

  let ligneDirOnline = ligneDir.filter((e) => {
    return e.online === 1
  })


  let uniqueRoutes = Array.from(new Set(ligneDirOnline.map(e => e.ligneDir)))
    .map(f => {
      return {
        ligneDir: f,
        keyid: ligneDir.find(s => s.ligneDir === f).keyid,
        route_id: ligneDir.find(s => s.ligneDir === f).route_id,
        direction_id: ligneDir.find(s => s.ligneDir === f).direction_id,
        online: ligneDir.find(s => s.ligneDir === f).online
      }
    })

  return uniqueRoutes
}


// Regen routes graph

export function regenGraphRoutesSTM(
  routeList,
  tripList,
  visibleChartRoutes,
  stops,
  vehiclesSTM,
  tracesSTM) {

  let stopsCounter = 0;

  routeList.forEach((e) => {

    // Tous les trips de la ligne direction qui sont online
    let tripsLigneDir = tripList.filter((f) => {
      return f.ligneDir === e && f.online === 1
    })

    //console.log(tripsLigneDir)

    // Trouver la position de la route dans l'array de routes pour lesquels on affiche un graph
    let routeIDS = [];
    visibleChartRoutes.map((f) => {
      routeIDS.push(f.ligneDir)
    })

    let position = routeIDS.indexOf(e)

    let stopsSTM = stops[stopsCounter].tripStops;

    // Etape supplementaire par rapport au RTL :

    // La STM ne met pas les distances parcourues dans stop_sequence
    // Il faut calculer la distance parcourue a chaque stop sur le trip avec turf
    //Trouver la trace correspondant au trip
    const traceSTM = tracesSTM.features.filter((f) => {
      return f.properties.trips.some((g) => {
        return g === stops[stopsCounter].tripID
      })
    })

    stopsCounter++;
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


    // Creer l'array d'arrets selon la trace identifiee
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

    // Preparation du calcul des positions des vehicules sur la ligne-direction
    let distArray = [];

    tripsLigneDir.forEach((k) => {
      //Trouver les coordonnees actuelles du bus sur le trip

      const currentPositionFeature = vehiclesSTM.features.filter((f) => {
        return f.properties.trip_id === k.tripmin
      })[0].geometry.coordinates;

      //Trouver la trace correspondant au trip
      const traceSTM = tracesSTM.features.filter((f) => {
        return f.properties.trips.some((g) => {
          return g === k.tripmin
        })
      })

      //Trouver la distance parcourue par le bus sur le trip
      const coordTrace = [];

      traceSTM[0].geometry.coordinates.map((f) => {
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
            <Scatter name="Bus" data={distArray} fill="#009DE0" shape="circle" />
          </ScatterChart>
        </ResponsiveContainer>

    })

  })

  return visibleChartRoutes

}






