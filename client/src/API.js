import io from "socket.io-client";
const API_URL = process.env.NODE_ENV ? window.location.hostname : 'http://192.168.0.146:5000'
//Pour mobile, l'adresse ci-dessous doit etre le IP et non localhost
const socket = io.connect(API_URL, { transports: ['websocket'] });

export async function getNewData(cb) {

  // socket.on('message-client-connected', (message) => {
  //   console.log(message)
  // })

  socket.on('refresh data', positions => cb(null, positions))

  socket.emit('subscribeToTimer', 30000);

}

export async function getTraces() {
  const response = await fetch('/api/traces')
  return response.json();
};

