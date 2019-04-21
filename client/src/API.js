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

export async function getTraces() {
  const response = await fetch('/api/traces')
  return response.json();
};

export async function getHistory() {
  const response = await fetch('/api/allvehicles')
  return response.json()
};


export async function getStops(trip_id) {

  const response = await fetch('/api/stops', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ trip_id: trip_id })
  });

  return response

}