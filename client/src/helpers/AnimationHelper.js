const turf = require('@turf/turf');

export async function tripsToArcsRTL(pointsDepart, pointsArrivee, shapes) {

  //POUR L'INSTANT, NE TIENT PAS COMPTE DES POINTS POUR LESQUELS ON AURAIT 
  //SEULEMENT LE DEPART OU SEULEMENT L'ARRIVEE

  // Step 1 : put each active shape in shape array
  //let emptyGeoJSON = { "type": "FeatureCollection", "features": [] }
  let shapeArray = [];

  const buildShapeArray = shapes ? pointsDepart.features.forEach((e) => {
    if (pointsArrivee.features.filter((f) => {
      return f.properties.trip_id === e.properties.trip_id
    }).length > 0) {
      shapeArray.push(shapes.features.filter((f) => {
        return f.properties.trips.some((g) => {
          return g === e.properties.trip_id
        })
      }))
    } //else {
    //shapeArray.push(emptyGeoJSON)
    //}
  }) : ''
  //console.log(shapeArray);

  // Step 2 : slice shapes between start and stop
  let i = 0;
  let start = [];
  let stop = [];
  let line = [];
  let slicedShapes = [];

  //console.log(shapeArray[1]);

  shapeArray.forEach((e) => {
    start = turf.point(pointsDepart.features[i].geometry.coordinates);
    stop = turf.point(pointsArrivee.features[i].geometry.coordinates);
    line = turf.lineString(e[0].geometry.coordinates);
    slicedShapes.push(turf.lineSlice(start, stop, line));
    i++;
  })

  //console.log(slicedShapes)

  // Step 3 : calculate sliced shape distances 
  //CES DISTANCES PEUVENT ETRE UTILISEES POUR CALCULER LA VITESSE

  i = 0;
  let sliceDistances = [];
  slicedShapes.forEach((e) => {
    sliceDistances.push(turf.lineDistance(slicedShapes[i]));
    i++;
  })

  //console.log(sliceDistances)

  // Step 4 : break shapes into segments based on number of steps
  // 5m / step

  let arc = [];
  let j = 0;

  slicedShapes.forEach((e) => {
    for (let i = 0; i < sliceDistances[j]; i += sliceDistances[j] / (sliceDistances[j] / 5)) {
      let line = turf.lineString(slicedShapes[j].geometry.coordinates);
      let segment = turf.along(line, i);
      arc.push(segment.geometry.coordinates);
    }
    slicedShapes[j].geometry.coordinates = arc;
    j++;
  })

  return slicedShapes;

}


// Fonction d'animation 

export async function animate(map, pointsDepart, arcs, featureIdx, cntr) {
  // Update point geometry to a new position based on counter denoting
  // the index to access the arc.
  if (cntr >= arcs[featureIdx].geometry.coordinates.length - 1) {
    return;
  }

  pointsDepart[featureIdx].geometry.coordinates = pointsDepart[featureIdx].geometry.coordinates[cntr];


  pointsDepart[featureIdx].properties.bearing = turf.bearing(
    turf.point(arcs[featureIdx].geometry.coordinates[cntr >= arcs[featureIdx].geometry.coordinates.length ? cntr - 1 : cntr]),
    turf.point(arcs[featureIdx].geometry.coordinates[cntr >= arcs[featureIdx].geometry.coordinates.length ? cntr : cntr + 1])
  );

  // Update the source with this new data.
  map.getSource('vehiculesRTL').setData(pointsDepart);

  // Request the next frame of animation so long the end has not been reached.
  if (cntr < arcs[featureIdx].geometry.coordinates.length) {
    requestAnimationFrame(function () { animate(featureIdx, cntr + 1); });
  }

}