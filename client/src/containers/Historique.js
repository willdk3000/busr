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

    const parsing = allVehicles ?
      allVehicles.forEach((e) => {
        parseAll.push({
          reseau: e.reseau,
          time: parseInt(moment("2019-04-28 " + e.time.substr(0, 8)).format('x')),
          vehlen: e.vehlen,
          weekday: e.weekday
        })
      }) : ''

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

    console.log(this.state)

  }


  render() {

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
                domain={['auto', 'auto']}
                tickFormatter={(unixTime) => moment(unixTime).format('HH:mm:ss')} />
              <YAxis dataKey="vehlen" name='véhicules' />
              <ZAxis dataKey="z" range={[25]} />
              <Tooltip />
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
                domain={['auto', 'auto']}
                tickFormatter={(unixTime) => moment(unixTime).format('HH:mm:ss')} />
              <YAxis dataKey="vehlen" name='véhicules' />
              <ZAxis dataKey="z" range={[25]} />
              <Tooltip />
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
                domain={['auto', 'auto']}
                tickFormatter={(unixTime) => moment(unixTime).format('HH:mm:ss')} />
              <YAxis dataKey="vehlen" name='véhicules' />
              <ZAxis dataKey="z" range={[25]} />
              <Tooltip />
              <Legend />
              <Scatter name="STM" data={this.state.sunday.filter((e) => { return e.reseau === 'STM' })} fill="#009DE0" />
              <Scatter name="STL" data={this.state.sunday.filter((e) => { return e.reseau === 'STL' })} fill="#82C341" />
              <Scatter name="RTL" data={this.state.sunday.filter((e) => { return e.reseau === 'RTL' })} fill="#A93332" />
            </ScatterChart>
          </ResponsiveContainer>
        </div >


        <br />
      </div>
    ) : 'Chargement en cours...';
  }
}

export default Historique;

//domain={['dataMin', 'dataMax']} (dans XAxis)
//tickFormatter = {(unixTime) => moment(unixTime).format('HH:mm Do')}
// domain = { [this.state.minSunday, this.state.maxSunday]}

// tickFormatter = {(timeStr) => moment(timeStr).format('HH:mm')}