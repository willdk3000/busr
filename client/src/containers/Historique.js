import React, { Component } from 'react';
import { getHistory } from '../API';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip } from 'recharts';

class Historique extends Component {

  state = {
    history: null
  };

  componentDidMount = async () => {

    const allVehicles = await getHistory()
    //console.log(allVehicles)

    const week = allVehicles.filter((e) => {
      return parseInt(e.weekday) > 1 && parseInt(e.weekday) < 7
    })

    const saturday = allVehicles.filter((e) => {
      return parseInt(e.weekday) === 7
    })

    const sunday = allVehicles.filter((e) => {
      return parseInt(e.weekday) === 1
    })

    this.setState({
      week: week,
      saturday: saturday,
      sunday: sunday
    })

  }

  render() {
    return (
      <div className="container-fluid" >
        <br />

        <div id="chartCard">
          <h1 style={{ color: '#000000', textAlign: 'center' }}>Semaine</h1>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart width={730} height={250} data={this.state.week}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="time" name='time' />
              <YAxis name='véhicules' />
              <ZAxis dataKey="z" range={[25]} />
              <Tooltip />
              <Scatter dataKey="vehlen" fill="#009DE0" />
            </ScatterChart>
          </ResponsiveContainer>
        </div >

        <div id="chartCard">
          <h1 style={{ color: '#000000', textAlign: 'center' }}>Samedi</h1>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart width={730} height={250} data={this.state.saturday}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="time" name='time' />
              <YAxis name='véhicules' />
              <ZAxis dataKey="z" range={[25]} />
              <Tooltip />
              <Scatter dataKey="vehlen" fill="#009DE0" />
            </ScatterChart>
          </ResponsiveContainer>
        </div >

        <div id="chartCard">
          <h1 style={{ color: '#000000', textAlign: 'center' }}>Dimanche</h1>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart width={730} height={250} data={this.state.sunday}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="time" name='time' />
              <YAxis name='véhicules' />
              <ZAxis dataKey="z" range={[25]} />
              <Tooltip />
              <Scatter dataKey="vehlen" fill="#009DE0" />
              {/*<Scatter name="A school" data={data01} fill="#8884d8" shape="star" />*/}
              {/*<Scatter name="B school" data={data02} fill="#82ca9d" shape="triangle" />*/}
            </ScatterChart>
          </ResponsiveContainer>
        </div >

        <br />
      </div>
    );
  }
}

export default Historique;

