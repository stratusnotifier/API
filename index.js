const jsonServer = require('json-server');
const request = require('request');
const parsedJSON = require('./db.json');
const server = jsonServer.create();
const router = jsonServer.router(parsedJSON);
const middlewares = jsonServer.defaults({ readOnly: true, noCors: true, logger: false });

const options = {
    url: 'https://cloudquery.unixfox.eu/query?url=https%3A%2F%2Fstratus.network%2Fplay&selectors=*:nth-child(5)%20*:nth-child(2)%20%3E%20*:nth-child(1)%20%3E%20*%20%3E%20*%20%3E%20*,*:nth-child(2)%20%3E%20*:nth-child(5)%20%3E%20*%20%3E%20*%20%3E%20*:nth-child(1)%20%3E%20*:nth-child(2)',
    json: true
}

let mapName = "Example";
let playersNumber = '-1';
let mapID = 999999;

server.use(jsonServer.bodyParser);
server.get('/servers', function (req, res) {
    if (parsedJSON.maps.maps.filter(map => map.name === mapName)[0])
        mapID = Number(parsedJSON.maps.maps.filter(map => map.name === mapName)[0].id);
    else
        mapID = 999999;
    res.status(200).send({
        "servers": [
            {
                "region": "US",
                "map": {
                    "id": mapID,
                    "name": mapName
                },
                "name": "Mixed",
                "playing": playersNumber
            }
        ]
    });
});
server.use(middlewares);
server.use(router);
server.listen(3000, () => {
    console.log('JSON Server is running');
});

request(options, function (error, response, body) {
    if (!error) {
        mapName = body.contents[0].innerText;
        playersNumber = body.contents[1].innerText.replace(" players", "");
    }
    else console.log(error);
});

setInterval(function () {
    request(options, function (error, response, body) {
        if (!error) {
            mapName = body.contents[0].innerText;
            playersNumber = body.contents[1].innerText.replace(" players", "");
        }
        else console.log(error);
    });
}, 10000);