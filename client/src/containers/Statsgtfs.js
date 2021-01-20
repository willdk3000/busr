import React, { Component } from 'react';

import ReactLoading from 'react-loading';

import {getStatsGtfs} from '../API';

class Statsgtfs extends Component {

  state = {
    
  };


  componentDidMount = async () => {

    const allStats = await getStatsGtfs();

    this.setState({
      
    })

  }




  render() {

    return this.state.sunday ? (
        <div className="container">

        </div>
    ) : <div className="container">
        <div className="row justify-content-center">Chargement en cours...</div>
        <div className="row justify-content-center">
          <div><ReactLoading type={"bars"} color={"#277D98"} height={300} width={175} /></div>
        </div>
      </div >
  }
}

export default Statsgtfs;

