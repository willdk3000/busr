const socketIO = require('socket.io')
//const knex = require('./config/knex')

const controllers = require('./controllers')
const api = require('./API.js')

let socketCount = 0

//const removeData = controllers.dataHandler.delete();

function init(server) {
    const io = socketIO(server, { transports: ['websocket'] });
    console.log('sockets server listening...')

    api.getPositions();

    io.on('connection', (socket) => {

        socketCount++
        console.log('user connected : ' + socketCount + ' connections')

        // io.emit('message-client-connected',
        //     `Client with id ${socket.id} connected. Total connections : ${socketCount}`);

        socket.on('subscribeToTimer', (interval) => {

            console.log('client is subscribing to timer with interval ', interval);

            setInterval(async () => {
                console.log('emitting...')
                let newData = await controllers.dataHandler.latest();
                let plannedTripsRTL = await controllers.gtfsHandler.getPlannedTripsRTL();
                let plannedTripsSTL = await controllers.gtfsHandler.getPlannedTripsSTL();
                let plannedTripsSTM = await controllers.gtfsHandler.getPlannedTripsSTM();
                io.emit('refresh data', [newData, plannedTripsRTL, plannedTripsSTL, plannedTripsSTM]);
                console.log('emitted!')
            }, interval);

        });

        //emitPosition(io);

        //emitPosition(io);
        // let interval = setInterval(async function () {
        //     let refresh = await refreshPosition();
        //     //let emit = await emitPosition(io);
        //     console.log()
        // }, 10000);

        socket.on('disconnect', () => {
            socketCount--
            console.log('user disconnected : ' + socketCount + ' connections left')
        })

    });

}

// async function emitPosition(io) {
//     let data = await controllers.dataHandler.list();
//     io.emit('refresh data', data[0])
//     console.log('emitted!');
// }

module.exports = {
    init
};