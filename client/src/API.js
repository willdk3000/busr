import io from "socket.io-client";
// const API_URL = process.env.NODE_ENV ? window.location.hostname : 'http://localhost:5000'
const socket = io.connect('http://localhost:5000', { transports: ['websocket'] });

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

