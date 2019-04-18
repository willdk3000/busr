import React, { Component } from 'react';
import MapGL from 'react-map-gl';

import StatCards from '../components/StatCards.js'
import { getNewData, getTraces } from '../API.js'

class Livemap extends Component {

  state = {
    subscribed: 0,
    viewport: {
      latitude: 45.506827,
      longitude: -73.662362,
      zoom: 11
    }
  };


  componentDidMount = async () => {

    const getData = this.state.subscribed === 0 ?
      getNewData((err, positions) => {
        this.setState({
          vehicles: positions ? positions.data : '',
          timestamp: positions ? positions.timestamp : '',
          subscribed: 1
          //traces: traces.rows[0].jsonb_build_object
        })
      })
      : '';

    const map = this.reactMap.getMap();

    //initialisation de la carte
    this.handleOnLoad(map)

    const traces = await getTraces();
    this.setState({
      traces: traces.rows[0].jsonb_build_object
    })

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
                }
              }]
          }
        }
      );

      map.addSource(
        "traces", {
          "type": "geojson",
          "data": {
            "type": "FeatureCollection",
            "features": [
              {
                "type": "Feature",
                "geometry": {
                  "type": "LineString",
                  "coordinates": [[
                    -73.603118,
                    45.446466
                  ], [
                    -73.593242,
                    45.451158
                  ]]
                },
                "properties": {
                  "ID": "10014",
                }
              }]
          }
        }
      );

      //ajout de la couche de vehicules (basee sur la source vehicules)
      //pour les icones de bus, s'assurer de mettre le type symbol
      //le code 0xF207 s'explique comme suit :
      //0x caracteres a ajouter pour tous les icones
      //F207 identifiant de l'icone bus de fontawesome
      map.addLayer(
        {
          "id": "position-vehicules",
          "type": "symbol",
          "source": "vehicules",
          "layout": {
            'text-field': String.fromCharCode("0xF207"),
            'text-font': ['Font Awesome 5 Free Solid'],
            'text-size': 12
          },
          "paint": {
            "text-color": "#FFFFFF"
          }
        }
      );

      map.addLayer({
        "id": "traces",
        "type": "line",
        "source": "traces",
        "layout": {
          "line-join": "round",
          "line-cap": "round",
          "visibility": "visible"
        },
        "paint": {
          "line-width": 2,
          "line-color": "#ff0000"
        }
      });

      this.setState({ mapIsLoaded: true });

    })

    this.map = map;
  }


  //rafraichir les donnees avec les nouvelles donnees recues de socketio
  //au moment du update du component
  componentDidUpdate(prevProps, prevState) {
    const { vehicles } = this.state;
    const { mapIsLoaded } = this.state;

    if (!mapIsLoaded) {
      return;
    }

    if (vehicles !== prevState.vehicles) {
      this.map.getSource("vehicules").setData(vehicles);
    }

    console.log(this.state)

  }


  componentWillUnmount() {
    this.map.remove();
  }


  _onViewportChange = viewport => this.setState({ viewport });


  _onHover = event => {
    const { features, srcEvent: { offsetX, offsetY } } = event;
    const hoveredFeature = features && features.find(f => f.layer.id === 'position-vehicules');
    this.setState({ hoveredFeature, x: offsetX, y: offsetY });
  };


  _renderTooltip() {
    const { hoveredFeature, x, y } = this.state;

    const trip = hoveredFeature ? hoveredFeature.properties.trip_id : '';

    //pourquoi ce filter ne marche pas??
    //les trip id de this.state.traces.features.properties.trip_id 
    // ne sont pas comme ceux de hoveredFeature.properties.trip_id

    const trace = this.state.traces ? this.state.traces.features.filter(e => e.properties.trip_id === '194115824') : ''
    console.log(trace)

    return hoveredFeature && (
      //ne pas appeler la class 'tooltip' car il semble que ce nom soit en conflit
      //avec un autre tooltip...
      <div className="mapToolTip" style={{ left: x, top: y }}>
        <div>NO de véhicule: {hoveredFeature.properties.vehicle_id}</div>
        <div>Ligne: {hoveredFeature.properties.route_id}</div>
        <div>Trip: {hoveredFeature.properties.trip_id}</div>
      </div>
    );
  }


  render() {

    const { viewport } = this.state;

    return <React.Fragment >
      <div className="container-fluid">
        <StatCards
          onlineVehicles={this.state.vehicles ? this.state.vehicles.features.length : 0}
          lastRefresh={this.state.timestamp ? this.state.timestamp : ''}
        />
        <MapGL
          {...viewport}
          ref={(reactMap) => this.reactMap = reactMap}
          width="100%"
          height="78vh"
          mapStyle="mapbox://styles/wdoucetk/cjuc6i3960ggz1flfzzn3upav"
          onViewportChange={this._onViewportChange}
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_KEY}
          onHover={this._onHover}
        >
          {this._renderTooltip()}
        </MapGL>
      </div>
    </React.Fragment >
  }
}

export default Livemap;