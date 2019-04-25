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

        const vehSTM = positions ? positions.filter((e) => {
          return e.reseau === 'STM'
        }) : ''

        const vehSTL = positions ? positions.filter((e) => {
          return e.reseau === 'STL'
        }) : ''

        this.setState({
          vehiclesSTM: vehSTM ? vehSTM[0].data : '',
          vehiclesSTL: vehSTL ? vehSTL[0].data : '',
          timestamp: vehSTM ? vehSTM[0].time : '',
          subscribed: 1
        })

        console.log(this.state);


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

      //mettre un geojson valide (mais vide) sur la carte a l'initialisation pour eviter que mapbox 
      //genere une erreur. comment c'est monte ici, la source 'vehicules' est chargee au moment
      //ou la carte finit de charger. pour que la source soit valide, elle doit contenir au 
      //un geojson valide.

      map.addSource(
        "vehiculesSTM", {
          "type": "geojson",
          "data": emptyGeoJSON
        }
      );

      map.addSource(
        "vehiculesSTL", {
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
      //la police FontAwesome doit avoir ete chargee dans une des couches du style de carte utilise
      //voir mapboxstudio
      map.addLayer(
        {
          "id": "position-vehicules-stm",
          "type": "symbol",
          "source": "vehiculesSTM",
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

      map.addLayer(
        {
          "id": "position-vehicules-stl",
          "type": "symbol",
          "source": "vehiculesSTL",
          "layout": {
            'text-field': String.fromCharCode("0xF207"),
            'text-font': ['Font Awesome 5 Free Solid'],
            'text-size': 12
          },
          "paint": {
            "text-color": "#82C341"
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
          "line-color": "#009500"
        }
      });

      this.setState({ mapIsLoaded: true });

    })

    this.map = map;
  }


  //rafraichir les donnees avec les nouvelles donnees recues de socketio
  //au moment du update du component
  componentDidUpdate(prevProps, prevState) {
    const { vehiclesSTM, vehiclesSTL } = this.state;
    const { mapIsLoaded } = this.state;

    if (!mapIsLoaded) {
      return;
    }

    // Gestion vehicules STM
    if (vehiclesSTM !== prevState.vehiclesSTM) {
      this.map.getSource("vehiculesSTM").setData(vehiclesSTM);

      const vehRoutesSTM = this.state.vehiclesSTM ? this.state.vehiclesSTM.features.map((e) => {
        return e.properties.route_id
      }) : ''

      const uniqueRoutesSTM = [...new Set(vehRoutesSTM)]

      this.setState({ routesSTM: uniqueRoutesSTM })
    }

    // Gestion vehicules STL
    if (vehiclesSTL !== prevState.vehiclesSTL) {
      this.map.getSource("vehiculesSTL").setData(vehiclesSTL);

      const vehRoutesSTL = this.state.vehiclesSTL ? this.state.vehiclesSTL.features.map((e) => {
        return e.properties.route_id
      }) : ''

      const uniqueRoutesSTL = [...new Set(vehRoutesSTL)]

      this.setState({ routesSTL: uniqueRoutesSTL })
    }

  }


  componentWillUnmount = async () => {
    this.map.remove();
  }


  _onViewportChange = viewport => this.setState({ viewport });


  _onHover = event => {
    const { features, srcEvent: { offsetX, offsetY } } = event;
    const hoveredFeature = features && features.find(f => f.layer.id === 'position-vehicules-stm');
    this.setState({ hoveredFeature, x: offsetX, y: offsetY });
  };


  _onClick = event => {
    const { features, srcEvent: { offsetX, offsetY } } = event;
    const clickedFeature = features && features.find(f => f.layer.id === 'position-vehicules-stm');
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
        <div>Axe: {nomLigne ? nomLigne[0].properties.route_name : ''}</div>
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
          onlineVehiclesSTM={this.state.vehiclesSTM ? this.state.vehiclesSTM.features.length : 0}
          routesSTM={this.state.routesSTM ? this.state.routesSTM.length : 0}
          onlineVehiclesSTL={this.state.vehiclesSTL ? this.state.vehiclesSTL.features.length : 0}
          routesSTL={this.state.routesSTL ? this.state.routesSTL.length : 0}
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