const socketIO = require('socket.io')
//const knex = require('./config/knex')

const controllers = require('./controllers')
const api = require('./API.js')

let socketCount = 0;


function init(server) {
    let timers = 0;
    
    const io = socketIO(server, { transports: ['websocket'] });
    console.log('sockets server listening...')

    api.getPositions();

    io.on('connection', (socket) => {

        socketCount++
        console.log('User connected : ' + socketCount + ' connections')

        // io.emit('message-client-connected',
        //     `Client with id ${socket.id} connected. Total connections : ${socketCount}`);
        let intervalId;

        socket.on('subscribeToTimer', async (interval) => {
            await timers++;

            console.log('Client is subscribing to timer with interval ', interval);
            console.log('Active timers : ' + timers)

            intervalId = setInterval(async () => {
                console.log('emitting...')
                let newData = await controllers.dataHandler.latest();
                let plannedTripsRTL = await controllers.gtfsHandler.getPlannedTripsRTL();
                let plannedTripsSTL = await controllers.gtfsHandler.getPlannedTripsSTL();
                let plannedTripsSTM = await controllers.gtfsHandler.getPlannedTripsSTM();

                io.emit('refresh data', [newData, plannedTripsRTL, plannedTripsSTL, plannedTripsSTM]);
                console.log('emitted!');
            }, interval);

        });

        socket.on('leave', async () => {
            await timers--;
            console.log('Client changed page. ' + timers + ' timers left.')
            clearInterval(intervalId);
        });

        socket.on('disconnect', () => {
            socketCount--
            timers--;
            console.log('User disconnected : ' + socketCount + ' connections left.');
            console.log('Active timers : ' + timers)
            clearInterval(intervalId);
        })

    });

}

module.exports = {
    init
};