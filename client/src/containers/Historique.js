import React, { Component } from 'react';
import { getHistory } from '../API';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Legend
} from 'recharts';

const moment = require('moment');

class Historique extends Component {

  state = {
    history: null
  };

  componentDidMount = async () => {

    const allVehicles = await getHistory()

    const parseAll = [];

    // Modifier le format de hh:mm:ss à unix milliseconds
    // C'est le format privilégié par Recharts pour les unités de temps

    const parsing = allVehicles ?
      allVehicles.forEach((e) => {
        parseAll.push({
          reseau: e.reseau,
          time: parseInt(moment("2019-04-28 " + e.timestr).format('x')),
          vehlen: e.vehlen,
          weekday: e.weekday
        })
      }) : ''

    // Séparation des données de semaine, samedi, dimanche

    const week = parseAll.filter((e) => {
      return parseInt(e.weekday) > 1 && parseInt(e.weekday) < 7
    })

    const saturday = parseAll.filter((e) => {
      return parseInt(e.weekday) === 7
    })

    const sunday = parseAll.filter((e) => {
      return parseInt(e.weekday) === 1
    })

    this.setState({
      week: week,
      saturday: saturday,
      sunday: sunday
    })

    //console.log(this.state)


  }


  render() {

    const CustomTooltip = ({ active, payload }) => {
      if (active) {
        return (
          <div className="custom-tooltip">
            <p className="label">Réseau : {payload[0].payload.reseau}<br />
              Heure : {moment(payload[0].payload.time).format('HH:mm:ss')}<br />
              Véhicules : {payload[0].payload.vehlen}</p>
          </div>
        );
      }

      return null;
    };

    return this.state.sunday ? (
      <div className="container-fluid" >
        <br />

        <div id="chartCard">
          <h1 style={{ color: '#000000', textAlign: 'center' }}>Semaine</h1>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart width={730} height={250}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis
                type="number"
                dataKey="time"
                name='time'
                domain={[1556420760000, 1556495999000]}
                tickFormatter={(unixTime) => moment(unixTime).format('HH:mm:ss')}
                ticks={[
                  1556424000100,
                  1556427600000, 1556431200000, 1556434800000, 1556438400000,
                  1556442000000, 1556445600000, 1556449200000, 1556452800000,
                  1556456400000, 1556460000000, 1556463600000, 1556467200000,
                  1556470800000, 1556474400000, 1556478000000, 1556481600000,
                  1556485200000, 1556488800000, 1556492400000, 1556496000000,
                  1556499600000, 1556503200000, 1556506800000, 1556510399900
                ]}
              />
              <YAxis dataKey="vehlen" name='véhicules' />
              <ZAxis dataKey="z" range={[20]} />
              <Tooltip
                content={<CustomTooltip />}
              />
              <Legend />
              <Scatter name="STM" data={this.state.week.filter((e) => { return e.reseau === 'STM' })} fill="#009DE0" />
              <Scatter name="STL" data={this.state.week.filter((e) => { return e.reseau === 'STL' })} fill="#82C341" />
              <Scatter name="RTL" data={this.state.week.filter((e) => { return e.reseau === 'RTL' })} fill="#A93332" />
            </ScatterChart>
          </ResponsiveContainer>
        </div >


        <div id="chartCard">
          <h1 style={{ color: '#000000', textAlign: 'center' }}>Samedi</h1>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart width={730} height={250}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis
                type="number"
                dataKey="time"
                name='time'
                domain={[1556420760000, 1556495999000]}
                tickFormatter={(unixTime) => moment(unixTime).format('HH:mm:ss')}
                ticks={[
                  1556424000100,
                  1556427600000, 1556431200000, 1556434800000, 1556438400000,
                  1556442000000, 1556445600000, 1556449200000, 1556452800000,
                  1556456400000, 1556460000000, 1556463600000, 1556467200000,
                  1556470800000, 1556474400000, 1556478000000, 1556481600000,
                  1556485200000, 1556488800000, 1556492400000, 1556496000000,
                  1556499600000, 1556503200000, 1556506800000, 1556510399900
                ]} />
              <YAxis dataKey="vehlen" name='véhicules' />
              <ZAxis dataKey="z" range={[20]} />
              <Tooltip
                content={<CustomTooltip />}
              />
              <Legend />
              <Scatter name="STM" data={this.state.saturday.filter((e) => { return e.reseau === 'STM' })} fill="#009DE0" />
              <Scatter name="STL" data={this.state.saturday.filter((e) => { return e.reseau === 'STL' })} fill="#82C341" />
              <Scatter name="RTL" data={this.state.saturday.filter((e) => { return e.reseau === 'RTL' })} fill="#A93332" />
            </ScatterChart>
          </ResponsiveContainer>
        </div >

        <div id="chartCard">
          <h1 style={{ color: '#000000', textAlign: 'center' }}>Dimanche</h1>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart width={500} height={250}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis
                type="number"
                dataKey="time"
                name='time'
                domain={[1556420760000, 1556495999000]}
                tickFormatter={(unixTime) => moment(unixTime).format('HH:mm:ss')}
                ticks={[
                  1556424000100,
                  1556427600000, 1556431200000, 1556434800000, 1556438400000,
                  1556442000000, 1556445600000, 1556449200000, 1556452800000,
                  1556456400000, 1556460000000, 1556463600000, 1556467200000,
                  1556470800000, 1556474400000, 1556478000000, 1556481600000,
                  1556485200000, 1556488800000, 1556492400000, 1556496000000,
                  1556499600000, 1556503200000, 1556506800000, 1556510399900
                ]} />
              <YAxis dataKey="vehlen" name='véhicules' />
              <ZAxis dataKey="z" range={[20]} />
              <Tooltip
                content={<CustomTooltip />}
              />
              <Legend />
              <Scatter name="STM" data={this.state.sunday.filter((e) => { return e.reseau === 'STM' })} fill="#009DE0" />
              <Scatter name="STL" data={this.state.sunday.filter((e) => { return e.reseau === 'STL' })} fill="#82C341" />
              <Scatter name="RTL" data={this.state.sunday.filter((e) => { return e.reseau === 'RTL' })} fill="#A93332" />
            </ScatterChart>
          </ResponsiveContainer>
        </div >


        <br />
      </div>
    ) : 'Chargement...';
  }
}

export default Historique;

