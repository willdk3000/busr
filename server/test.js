const fetch = require('node-fetch');

async function requestDataSTL(epochTime) {
  const response = await fetch(`http://webservices.nextbus.com/service/publicJSONFeed?command=vehicleLocations&a=stl&t=${epochTime}`)
  return response.json()
}

async function main() {
  let epochTime = (new Date).getTime();

  let dataSTL = await requestDataSTL(epochTime);
  console.log(dataSTL)
}

main();
1556151168
