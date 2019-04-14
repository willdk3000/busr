import React, { Component } from 'react';
import ReactMapGL, { Popup } from 'react-map-gl';

import { getNewData } from '../API.js'

class Livemap extends Component {

  state = {
    viewport: {
      width: "100%",
      height: "80vh",
      latitude: 45.506827,
      longitude: -73.662362,
      zoom: 12
    }
  };


  componentDidMount = async () => {

    console.log('componentDidMount')

    getNewData((err, positions) => {
      this.setState({
        vehicles: positions ? positions.data : ''
      })
    });

    const map = this.reactMap.getMap();

    //initialisation de la carte
    this.handleOnLoad(map)

  }


  handleOnLoad = async (map) => {

    map.on('load', () => {

      //mettre au moins un point valide sur la carte a l'initialisation pour eviter que mapbox 
      //genere une erreur. comment c'est monte ici, la source 'vehicules' est chargee au moment
      //ou la carte finit de charger. pour que la source soit valide, elle doit contenir au 
      //moins un point valide sur la carte.

      map.addSource(
        "vehicules", {
          "type": "geojson",
          "data": {
            "type": "FeatureCollection",
            "features": [
              {
                "type": "Feature",
                "geometry": {
                  "type": "Point",
                  "coordinates": [
                    -73.58889770507812,
                    45.476383209228516
                  ]
                },
                "properties": {
                  "route_id": "191",
                  "timestamp": 1555218650,
                  "start_date": "20190414",
                  "start_time": "00:31:00",
                  "vehicle_id": "25204",
                  "server_request": "2019-04-14T05:11:26.489Z",
                  "current_stop_sequence": 71
                }
              }]
          }
        }
      );

      //ajout de la couche de vehicules (basee sur la source vehicules)
      //a faire : trouver comment mettre un icone de bus
      map.addLayer(
        {
          "id": "position-vehicules",
          "type": "circle",
          "source": "vehicules",
          "paint": {
            "circle-radius": 4,
            "circle-color": "#009EE0"
          }
        }
      );

      this.setState({ mapIsLoaded: true });

    })

    this.map = map;
  }


  //rafraichir les donnees avec les nouvelles donnees recues de socketio
  //au moment du update du component
  componentDidUpdate(prevProps, prevState) {
    console.log('componentDidUpdate')
    const { vehicles } = this.state;
    const { mapIsLoaded } = this.state;

    if (!mapIsLoaded) {
      return;
    }

    if (vehicles !== prevState.vehicles) {
      console.log('before', prevState.vehicles)
      console.log('now', vehicles)

      this.map.getSource("vehicules").setData(vehicles);
    }
  }


  componentWillUnmount() {
    this.map.remove();
  }


  render() {

    return <React.Fragment >
      <div className="container-fluid">
        <ReactMapGL
          ref={(reactMap) => this.reactMap = reactMap}
          {...this.state.viewport}
          mapStyle="mapbox://styles/mapbox/navigation-preview-night-v4"
          onViewportChange={(viewport) => this.setState({ viewport })}
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_KEY}
        />
      </div>
    </React.Fragment >
  }
}

export default Livemap;