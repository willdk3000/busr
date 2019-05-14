import React, { Component } from 'react';
import MapGL from 'react-map-gl';
import moment from 'moment-timezone';
import StatCards from '../components/StatCards.js'

import {
  getNewData, closeSocket,
  getTracesSTM, getTracesSTL, getTracesRTL,
  getStopsSTM, getStopsRTL, getStopsSTL
} from '../API.js'

import {
  tripsToArcsRTL, animate
} from '../helpers/AnimationHelper.js'

class Livemap extends Component {

  state = {
    subscribed: 0,
    viewport: {
      latitude: 45.556827,
      longitude: -73.662362,
      zoom: 10
    }
  };

  componentDidMount = async () => {

    const getData = this.state.subscribed === 0 ?
      getNewData((err, positions) => {

        const vehSTM = positions ? positions[0].filter((e) => {
          return e.reseau === 'STM'
        }) : ''

        const vehSTL = positions ? positions[0].filter((e) => {
          return e.reseau === 'STL'
        }) : ''

        const vehRTL = positions ? positions[0].filter((e) => {
          return e.reseau === 'RTL'
        }) : ''

        this.setState({
          vehiclesSTM: positions ? vehSTM[0].data : '',
          vehiclesSTL: positions ? vehSTL[0].data : '',
          vehiclesRTL: positions ? vehRTL[0].data : '',
          timestampSTM: positions ? vehSTM[0].timestr : '',
          timestampSTL: positions ? vehSTL[0].timestr : '',
          timestampRTL: positions ? vehRTL[0].timestr : '',
          subscribed: 1,
          plannedTripsRTL: positions ? positions[1] : '',
          plannedTripsSTL: positions ? positions[2] : '',
          plannedTripsSTM: positions ? positions[3] : ''
        })

      })
      : '';

    const map = this.reactMap.getMap();

    //initialisation de la carte
    this.handleOnLoad(map)

    const tracesSTM = await getTracesSTM();
    this.setState({
      tracesSTM: tracesSTM.rows[0].jsonb_build_object
    })

    const tracesSTL = await getTracesSTL();
    this.setState({
      tracesSTL: tracesSTL.rows[0].jsonb_build_object
    })

    const tracesRTL = await getTracesRTL();
    this.setState({
      tracesRTL: tracesRTL.rows[0].jsonb_build_object
    })


  }


  handleOnLoad = async (map) => {
    let emptyGeoJSON = { "type": "FeatureCollection", "features": [] }

    map.on('load', () => {

      //mettre un geojson valide (mais vide) sur la carte a l'initialisation pour eviter que mapbox 
      //genere une erreur. comment c'est monte ici, la source 'vehicules' est chargee au moment
      //ou la carte finit de charger. pour que la source soit valide, elle doit contenir au 
      //un geojson valide.

      // Sources Vehicules
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
        "vehiculesRTL", {
          "type": "geojson",
          "data": emptyGeoJSON
        }
      );

      // Sources Traces
      map.addSource(
        "tracesSTM", {
          "type": "geojson",
          "data": emptyGeoJSON
        }
      );

      map.addSource(
        "tracesSTL", {
          "type": "geojson",
          "data": emptyGeoJSON
        }
      );

      map.addSource(
        "tracesRTL", {
          "type": "geojson",
          "data": emptyGeoJSON
        }
      );

      // Sources Stops
      map.addSource(
        "stopsSTM", {
          "type": "geojson",
          "data": emptyGeoJSON
        }
      );

      map.addSource(
        "stopsRTL", {
          "type": "geojson",
          "data": emptyGeoJSON
        }
      );

      map.addSource(
        "stopsSTL", {
          "type": "geojson",
          "data": emptyGeoJSON
        }
      );

      // Sources shapes ANIM
      map.addSource(
        'routeAnimRTL', {
          "type": "geojson",
          "data": emptyGeoJSON
        });

      //ajout de la couche de vehicules (basee sur la source vehicules)
      //pour les icones de bus, s'assurer de mettre le type symbol
      //le code 0xF207 s'explique comme suit :
      //0x caracteres a ajouter pour tous les icones
      //F207 identifiant de l'icone bus de fontawesome
      //la police FontAwesome doit avoir ete chargee dans une des couches du style de carte utilise
      //voir mapboxstudio

      // Couches vehicules
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

      map.addLayer(
        {
          "id": "position-vehicules-rtl",
          "type": "symbol",
          "source": "vehiculesRTL",
          "layout": {
            'text-field': String.fromCharCode("0xF207"),
            'text-font': ['Font Awesome 5 Free Solid'],
            'text-size': 12
          },
          "paint": {
            "text-color": "#A93332"
          }
        }
      );

      // Couches traces
      map.addLayer({
        "id": "tracesSTM",
        "type": "line",
        "source": "tracesSTM",
        "layout": {
          "line-join": "round",
          "line-cap": "round",
          "visibility": "visible"
        },
        "paint": {
          "line-width": 2,
          "line-color": "#2380A5"
        }
      });

      map.addLayer({
        "id": "tracesSTL",
        "type": "line",
        "source": "tracesSTL",
        "layout": {
          "line-join": "round",
          "line-cap": "round",
          "visibility": "visible"
        },
        "paint": {
          "line-width": 2,
          "line-color": "#4A913C"
        }
      });

      map.addLayer({
        "id": "tracesRTL",
        "type": "line",
        "source": "tracesRTL",
        "layout": {
          "line-join": "round",
          "line-cap": "round",
          "visibility": "visible"
        },
        "paint": {
          "line-width": 2,
          "line-color": "#C47B85"
        }
      });

      // Couches Stops
      map.addLayer(
        {
          "id": "stopsSTM",
          "type": "circle",
          "source": "stopsSTM",
          "paint": {
            "circle-radius": 3,
            "circle-color": "#009DE0"
          }
        }
      );

      map.addLayer(
        {
          "id": "stopsRTL",
          "type": "circle",
          "source": "stopsRTL",
          "paint": {
            "circle-radius": 3,
            "circle-color": "#A93332"
          }
        }
      );

      map.addLayer(
        {
          "id": "stopsSTL",
          "type": "circle",
          "source": "stopsSTL",
          "paint": {
            "circle-radius": 3,
            "circle-color": "#82C341"
          }
        }
      );

      // Couches route ANIM

      map.addLayer({
        "id": "routeAnimRTL",
        "source": "routeAnimRTL",
        "type": "line",
        "paint": {
          "line-width": 0,
          "line-color": "#007cbf"
        }
      });

      this.setState({ mapIsLoaded: true });

    })

    this.map = map;
  }


  //rafraichir les donnees avec les nouvelles donnees recues de socketio
  //au moment du update du component
  componentDidUpdate = async (prevProps, prevState) => {
    const { vehiclesSTM, vehiclesSTL, vehiclesRTL } = this.state;
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

      localStorage.setItem('data', this.state)
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

    // Gestion vehicules RTL
    if (vehiclesRTL !== prevState.vehiclesRTL) {
      this.map.getSource("vehiculesRTL").setData(vehiclesRTL);

      const vehRoutesRTL = this.state.vehiclesRTL ? this.state.vehiclesRTL.features.map((e) => {
        return e.properties.route_id
      }) : ''

      const uniqueRoutesRTL = [...new Set(vehRoutesRTL)]

      // Animation
      // if (prevState.vehiclesRTL && this.state.vehiclesRTL) {
      //   const arcsRTL = await tripsToArcsRTL(prevState.vehiclesRTL, this.state.vehiclesRTL, this.state.tracesRTL);

      //   // console.log(arcsRTL)
      //   // console.log(prevState.vehiclesRTL.features)

      //   // let i = 0;
      //   // prevState.vehiclesRTL.features.forEach((e) => {
      //   //   animate(this.map, prevState.vehiclesRTL.features, arcsRTL, i, 0)
      //   //   i++
      //   // })

      // }

      this.setState({ routesRTL: uniqueRoutesRTL })

    }

    console.log(this.state)

  }



  componentWillUnmount = async () => {
    this.map.remove();
    //closeSocket();
  }


  _onViewportChange = viewport => this.setState({ viewport });


  _onHover = event => {
    const { features, srcEvent: { offsetX, offsetY } } = event;

    const hoveredFeatureSTM = features && features.find(f => f.layer.id === 'position-vehicules-stm');
    const hoveredStopSTM = features && features.find(f => f.layer.id === 'stopsSTM');

    const hoveredFeatureSTL = features && features.find(f => f.layer.id === 'position-vehicules-stl');

    const hoveredFeatureRTL = features && features.find(f => f.layer.id === 'position-vehicules-rtl');

    this.setState({
      hoveredFeatureSTM,
      hoveredStopSTM,
      hoveredFeatureSTL,
      hoveredFeatureRTL,
      x: offsetX,
      y: offsetY
    });

  };



  stopRequestSTM = async (trace) => {
    const stopsResponseSTM = await getStopsSTM(trace);
    const parseStopsSTM = stopsResponseSTM.rows[0].jsonb_build_object
    return parseStopsSTM
  }

  stopRequestRTL = async (trace) => {
    const stopsResponseRTL = await getStopsRTL(trace);
    const parseStopsRTL = stopsResponseRTL.rows[0].jsonb_build_object
    return parseStopsRTL
  }

  stopRequestSTL = async (trace) => {
    const stopsResponseSTL = await getStopsSTL(trace);
    const parseStopsSTL = stopsResponseSTL.rows[0].jsonb_build_object
    return parseStopsSTL
  }


  _onClick = async (event) => {

    const { mapIsLoaded } = this.state;

    let emptyGeoJSON = { "type": "FeatureCollection", "features": [] }

    const { features, srcEvent: { offsetX, offsetY } } = event;
    const clickedFeatureSTM = features && features.find(f => f.layer.id === 'position-vehicules-stm');
    const clickedFeatureSTL = features && features.find(f => f.layer.id === 'position-vehicules-stl');
    const clickedFeatureRTL = features && features.find(f => f.layer.id === 'position-vehicules-rtl');

    this.setState({
      clickedFeatureSTM,
      clickedFeatureSTL,
      clickedFeatureRTL,
      x: offsetX,
      y: offsetY
    });

    // Identification du trip (stm, rtl) ou de la ligne (stl) cliqué
    const tripClickSTM = clickedFeatureSTM ? clickedFeatureSTM.properties.trip_id : '';
    const routeClickSTL = clickedFeatureSTL ? clickedFeatureSTL.properties.route_id : '';
    const tripClickRTL = clickedFeatureRTL ? clickedFeatureRTL.properties.trip_id : '';

    // Détermination du shape à faire apparaître en fonction du trip ou de la ligne cliqué.
    const traceSTM = this.state.tracesSTM ? this.state.tracesSTM.features.filter((e) => {
      return e.properties.trips.some((f) => {
        return f === tripClickSTM
      })
    }) : ''

    const traceSTL = this.state.tracesSTL ? this.state.tracesSTL.features.filter((e) => {
      return e.properties.route_short_name === routeClickSTL
    }) : ''

    const traceRTL = this.state.tracesRTL ? this.state.tracesRTL.features.filter((e) => {
      return e.properties.trips.some((f) => {
        return f === tripClickRTL
      })
    }) : ''

    // Affichage de la trace
    const clickTraceSTM = mapIsLoaded === true ? (tripClickSTM !== '' ? this.map.getSource("tracesSTM").setData(traceSTM[0])
      : this.map.getSource("tracesSTM").setData(emptyGeoJSON))
      : '';

    const clickTraceSTL = mapIsLoaded === true ? (routeClickSTL !== '' ? this.map.getSource("tracesSTL").setData(traceSTL[0])
      : this.map.getSource("tracesSTL").setData(emptyGeoJSON))
      : '';

    const clickTraceRTL = mapIsLoaded === true ? (tripClickRTL !== '' ? this.map.getSource("tracesRTL").setData(traceRTL[0])
      : this.map.getSource("tracesRTL").setData(emptyGeoJSON))
      : '';

    //Requete pour obtenir les arrets a afficher selon le trip (ou la route)
    const stopsSTM = tripClickSTM !== '' ? await this.stopRequestSTM(traceSTM[0].properties.ID) : '';
    this.setState({ stopsSTM: stopsSTM })


    const clickStopsSTM = mapIsLoaded === true ? (this.state.stopsSTM !== '' ? this.map.getSource("stopsSTM").setData(this.state.stopsSTM)
      : this.map.getSource("stopsSTM").setData(emptyGeoJSON))
      : '';

    const stopsRTL = tripClickRTL !== '' ? await this.stopRequestRTL(traceRTL[0].properties.ID) : '';
    this.setState({ stopsRTL: stopsRTL })


    const clickStopsRTL = mapIsLoaded === true ? (this.state.stopsRTL !== '' ? this.map.getSource("stopsRTL").setData(this.state.stopsRTL)
      : this.map.getSource("stopsRTL").setData(emptyGeoJSON))
      : '';

    const stopsSTL = routeClickSTL !== '' ? await this.stopRequestSTL(traceSTL[0].properties.ID) : '';
    this.setState({ stopsSTL: stopsSTL })


    const clickStopsSTL = mapIsLoaded === true ? (this.state.stopsSTL !== '' ? this.map.getSource("stopsSTL").setData(this.state.stopsSTL)
      : this.map.getSource("stopsSTL").setData(emptyGeoJSON))
      : '';



  };


  _renderTooltip() {

    const {
      hoveredFeatureSTM,
      hoveredStopSTM,
      hoveredFeatureSTL,
      hoveredFeatureRTL,
      x, y, mapIsLoaded } = this.state;



    // Identification du trip (stm, rtl) ou de la ligne (stl) hovered
    const tripHoverSTM = hoveredFeatureSTM ? hoveredFeatureSTM.properties.trip_id : '';
    const routeHoverSTL = hoveredFeatureSTL ? hoveredFeatureSTL.properties.route_id : '';
    const tripHoverRTL = hoveredFeatureRTL ? hoveredFeatureRTL.properties.trip_id : '';


    //Affectation du nom du trip ou de la ligne à une variable 
    const nomLigneSTM = this.state.tracesSTM ? this.state.tracesSTM.features.filter((e) => {
      return e.properties.trips.some((f) => {
        return f === tripHoverSTM
      })
    }) : ''

    const nomLigneSTL = this.state.tracesSTL ? this.state.tracesSTL.features.filter((e) => {
      return e.properties === routeHoverSTL
    }) : ''

    const nomLigneRTL = this.state.tracesRTL ? this.state.tracesRTL.features.filter((e) => {
      return e.properties.trips.some((f) => {
        return f === tripHoverRTL
      })
    }) : ''



    //AFFICHAGE DES TOOLTIP ON HOVER

    return hoveredFeatureSTM ?
      hoveredFeatureSTM && (
        //ne pas appeler la class 'tooltip' car il semble que ce nom soit en conflit
        //avec un autre tooltip...
        <div className="mapToolTip" style={{ left: x, top: y }}>
          <div>No de véhicule: {hoveredFeatureSTM.properties.vehicle_id}</div>
          <div>Ligne: {hoveredFeatureSTM.properties.route_id}</div>
          {/*<div>Axe: {nomLigneSTM[0].properties.route_name ? nomLigneSTM[0].properties.route_name : ''}</div>*/}
          <div>Trip: {hoveredFeatureSTM.properties.trip_id}</div>
          <div>MAJ: {hoveredFeatureSTM.properties.timestamp ? hoveredFeatureSTM.properties.timestamp : ''} s</div>
        </div>
      ) :
      hoveredFeatureSTL ?
        hoveredFeatureSTL && (
          <div className="mapToolTip" style={{ left: x, top: y }}>
            <div>No de véhicule: {hoveredFeatureSTL.properties.vehicle_id}</div>
            <div>Ligne: {hoveredFeatureSTL.properties.route_id}</div>
            <div>MAJ : {hoveredFeatureSTL.properties.last_connection} s</div>
          </div>
        ) :
        hoveredFeatureRTL ?
          hoveredFeatureRTL && (
            <div className="mapToolTip" style={{ left: x, top: y }}>
              <div>No de véhicule: {hoveredFeatureRTL.properties.vehicle_id}</div>
              <div>Ligne: {hoveredFeatureRTL.properties.route_id}</div>
              <div>Axe: {nomLigneRTL ? nomLigneRTL[0].properties.route_name : ''}</div>
              <div>Trip: {hoveredFeatureRTL.properties.trip_id}</div>
              <div>MAJ: {hoveredFeatureRTL.properties.timestamp ? hoveredFeatureRTL.properties.timestamp : ''} s</div>
            </div>
          ) : ''
    /*hoveredStopSTM ?
      hoveredStopSTM && (
        <div className="mapToolTip" style={{ left: x, top: y }}>
          <div>Passages :{this.hoveredStopSTM ? this.stopSTM.features.filter((e) => {
            return e.id === parseInt(this.state.hoveredStopsSTM.id)
          }).properties.departs.map((e) => { return e })
            : ''}</div>
        </div>
      ) : ''*/

  }


  render() {

    const { viewport } = this.state;

    return <React.Fragment >
      <div className="container-fluid">
        <StatCards
          lastRefreshSTM={this.state.timestampSTM ? this.state.timestampSTM : '-'}
          onlineVehiclesSTM={this.state.vehiclesSTM ? this.state.vehiclesSTM.features.length : 0}
          plannedVehiclesSTM={this.state.plannedTripsSTM ? this.state.plannedTripsSTM.length : 0}
          routesSTM={this.state.routesSTM ? this.state.routesSTM.length : 0}
          lastRefreshSTL={this.state.timestampSTL ? this.state.timestampSTL : '-'}
          onlineVehiclesSTL={this.state.vehiclesSTL ? this.state.vehiclesSTL.features.length : 0}
          plannedVehiclesSTL={this.state.plannedTripsSTL ? this.state.plannedTripsSTL.length : 0}
          routesSTL={this.state.routesSTL ? this.state.routesSTL.length : 0}
          lastRefreshRTL={this.state.timestampRTL ? this.state.timestampRTL : '-'}
          onlineVehiclesRTL={this.state.vehiclesRTL ? this.state.vehiclesRTL.features.length : 0}
          plannedVehiclesRTL={this.state.plannedTripsRTL ? this.state.plannedTripsRTL.length : 0}
          routesRTL={this.state.routesRTL ? this.state.routesRTL.length : 0}
        />
        <MapGL
          {...viewport}
          ref={(reactMap) => this.reactMap = reactMap}
          width="100%"
          height="85vh"
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