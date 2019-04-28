import io from "socket.io-client";
//const API_URL = process.env.NODE_ENV ? window.location.hostname : 'http://192.168.0.146:5000'
//Pour mobile, l'adresse ci-dessous doit etre le IP et non localhost
const socket = io.connect('http://192.168.0.146:5000', { transports: ['websocket'] });

export async function getNewData(cb) {

  // socket.on('message-client-connected', (message) => {
  //   console.log(message)
  // })

  socket.on('refresh data', positions => cb(null, positions))

  socket.emit('subscribeToTimer', 15000);

}

// export function closeSocket() {
//   socket.disconnect()
// }

export async function getTracesSTM() {
  const response = await fetch('/api/traces_stm')
  return response.json();
};


export async function getStopsSTM(trip_id) {

  const response = await fetch('/api/stops_stm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ trip_id: trip_id })
  });

  return response

}


export async function getTracesSTL() {
  const response = await fetch('/api/traces_stl');
  return response.json();
};


export async function getHistory() {
  const response = await fetch('/api/allvehicles')
  return response.json()
};