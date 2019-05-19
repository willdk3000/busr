import io from "socket.io-client";

//const API_URL = process.env.NODE_ENV ? window.location.hostname : 'http://192.168.0.146:5000'
//Pour mobile, l'adresse ci-dessous doit etre le IP et non localhost

// const socket = process.env.HEROKU ?
//   io.connect('window.location.hostname', { transports: ['websocket'] })
//   : io.connect('http://localhost:5000', { transports: ['websocket'] });

const socket = process.env.NODE_ENV === 'production' ?
  io.connect('busr-mtl.herokuapp.com', { transports: ['websocket'] }) :
  io.connect('http://localhost:5000', { transports: ['websocket'] })


export async function getNewData(cb) {

  // socket.on('message-client-connected', (message) => {
  //   console.log(message)
  // })

  socket.on('refresh data', data => cb(null, data))

  socket.emit('subscribeToTimer', 3000);

}


export async function leave() {
  socket.emit('leave')
}


// Donnees pour cartographie
export async function getTracesSTM() {
  const response = await fetch('/api/traces_stm')
  return response.json();
};


export async function getStopsSTM(trace) {
  const response = await fetch('/api/stops_stm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ "trace": trace })
  });
  return response.json()
}


export async function getTracesSTL() {
  const response = await fetch('/api/traces_stl');
  return response.json();
};

export async function getStopsSTL(trace) {
  const response = await fetch('/api/stops_stl', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ "trace": trace })
  });
  return response.json()
}


export async function getTracesRTL() {
  const response = await fetch('/api/traces_rtl');
  return response.json();
};


export async function getStopsRTL(trace) {
  const response = await fetch('/api/stops_rtl', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ "trace": trace })
  });
  return response.json()
}


// Donnees pour graphiques

export async function getHistory() {
  const response = await fetch('/api/allvehicles')
  return response.json()
};


