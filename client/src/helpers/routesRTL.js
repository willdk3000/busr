import React from 'react';

import {
  ResponsiveContainer,
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip
} from 'recharts';

const turf = require('@turf/turf');


// Get unique routes-directions

export function longestRoutesRTL(plannedTripsRTL) {

  //TODO: une ligne qui a des trips online et des trips offline devrait
  // automatiquement eliminer les trips offline pour le choix du trip pour les arrets

  let ligneDir = [];
  plannedTripsRTL.map((e) => {
    ligneDir.push({
      keyid: e.keyid,
      route_id: e.route_id,
      direction_id: e.direction_id,
      ligneDir: e.route_id + '_' + e.direction_id,
      online: e.online,
      stopcount: e.stopcount
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

export function regenGraphRoutesRTL(
  routeList,
  tripList,
  visibleChartRoutes,
  stops,
  vehiclesRTL,
  tracesRTL) {

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

  return visibleChartRoutes

}






