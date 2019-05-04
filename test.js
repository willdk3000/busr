const moment = require('moment');

let timeNow = new Date();
let timeParse = moment(timeNow).format("HH:mm:ss")
let split = timeParse.split(':'); // split it at the colons

// minutes are worth 60 seconds. Hours are worth 60 minutes.
var seconds = (+split[0]) * 60 * 60 + (+split[1]) * 60 + (+split[2]);
console.log(seconds)
let yearNow = timeNow.getFullYear().toString().slice(2);
console.log(yearNow)