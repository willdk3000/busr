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
    let emptyGeoJSON = { "type": "FeatureCollection", "features": [] }

    map.on('load', () => {

      //mettre au moins un point valide sur la carte a l'initialisation pour eviter que mapbox 
      //genere une erreur. comment c'est monte ici, la source 'vehicules' est chargee au moment
      //ou la carte finit de charger. pour que la source soit valide, elle doit contenir au 
      //moins un point valide sur la carte.

      map.addSource(
        "vehicules", {
          "type": "geojson",
          "data": emptyGeoJSON
        }
      );

      map.addSource(
        "traces", {
          "type": "geojson",
          "data": emptyGeoJSON
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
            "text-color": "#009DE0"
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

      const vehRoutes = this.state.vehicles ? this.state.vehicles.features.map((e) => {
        return e.properties.route_id
      }) : ''

      const uniqueRoutes = [...new Set(vehRoutes)]

      this.setState({ routes: uniqueRoutes })
    }

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


  _onClick = event => {
    const { features, srcEvent: { offsetX, offsetY } } = event;
    const clickedFeature = features && features.find(f => f.layer.id === 'position-vehicules');
    this.setState({ clickedFeature, x: offsetX, y: offsetY });
  };


  _renderTooltip() {

    let emptyGeoJSON = { "type": "FeatureCollection", "features": [] }

    const { clickedFeature, hoveredFeature, x, y, mapIsLoaded } = this.state;

    const tripClick = clickedFeature ? clickedFeature.properties.trip_id : '';
    const tripHover = hoveredFeature ? hoveredFeature.properties.trip_id : '';

    //un shape contient plusieurs trips,
    //donc il faut filtrer chaque shape afin de voir s'il contient le trip selectionne

    const trace = this.state.traces ? this.state.traces.features.filter((e) => {
      return e.properties.trips.some((f) => {
        return f === tripClick
      })
    }) : ''

    //le nom de la ligne n'est pas dans l'objet vehicle-location donc il doit etre 
    //ajoute du gtfs
    const nomLigne = this.state.traces ? this.state.traces.features.filter((e) => {
      return e.properties.trips.some((f) => {
        return f === tripHover
      })
    }) : ''

    const clickTrace = mapIsLoaded === true ? (tripClick !== '' ? this.map.getSource("traces").setData(trace[0])
      : this.map.getSource("traces").setData(emptyGeoJSON))
      : '';

    return hoveredFeature && (
      //ne pas appeler la class 'tooltip' car il semble que ce nom soit en conflit
      //avec un autre tooltip...
      <div className="mapToolTip" style={{ left: x, top: y }}>
        <div>No de véhicule: {hoveredFeature.properties.vehicle_id}</div>
        <div>Ligne: {hoveredFeature.properties.route_id}</div>
        <div>Axe: {nomLigne[0].properties.route_name}</div>
        <div>Trip: {hoveredFeature.properties.trip_id}</div>
      </div>
    );
  }


  render() {

    const { viewport } = this.state;

    return <React.Fragment >
      <div className="container-fluid">
        <StatCards
          lastRefresh={this.state.timestamp ? this.state.timestamp : '-'}
          onlineVehicles={this.state.vehicles ? this.state.vehicles.features.length : 0}
          routes={this.state.routes ? this.state.routes.length : 0}
        />
        <MapGL
          {...viewport}
          ref={(reactMap) => this.reactMap = reactMap}
          width="100%"
          height="78vh"
          mapStyle="mapbox://styles/wdoucetk/cjun8whio1ha21fmzxt8knp7k"
          onViewportChange={this._onViewportChange}
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_KEY}
          onHover={this._onHover}
          onClick={this._onClick}
        >
          {this._renderTooltip()}
        </MapGL>
      </div>
    </React.Fragment >
  }
}

export default Livemap;

//mapbox://styles/wdoucetk/cjun8whio1ha21fmzxt8knp7k light
//mapbox://styles/wdoucetk/cjuc6i3960ggz1flfzzn3upav navigation