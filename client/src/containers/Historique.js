import React, { Component } from 'react';
import { getHistory } from '../API';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip } from 'recharts';

class Historique extends Component {

  state = {
    transactions: null
  };

  componentDidMount = async () => {

    const allVehicles = await getHistory()
    console.log(allVehicles)

    const vehArray = [];

    allVehicles.forEach((e) => {
      vehArray.push({
        'timestamp': e.timestamp,
        'vehicles': e.data.features.length
      })
    })

    console.log(vehArray)

    this.setState({
      history: vehArray
    })
  }

  render() {
    return (
      <div className="container-fluid" >
        <br />

        <div id="chartCard">
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart width={730} height={250} data={this.state.history}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="timestamp" name='timestamp' />
              <YAxis name='véhicules' />
              <Tooltip />
              <Scatter dataKey="vehicles" fill="#009DE0" />
            </ScatterChart>
          </ResponsiveContainer>
        </div >

        <br />
      </div>
    );
  }
}

export default Historique;

