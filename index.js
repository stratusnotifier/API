const jsonServer = require('json-server');
const getJSON = require('get-json');
const parsedJSON = require('./db.json');
const server = jsonServer.create();
const router = jsonServer.router(parsedJSON);
const middlewares = jsonServer.defaults({ readOnly: true, noCors: true, logger: false });

var mapName;
var playersNumber;

server.use(jsonServer.bodyParser);
getJSON('https://cloudquery.unixfox.eu/query?url=https%3A%2F%2Fstratus.network%2Fplay&selectors=*:nth-child(5)%20*:nth-child(2)%20%3E%20*:nth-child(1)%20%3E%20*%20%3E%20*%20%3E%20*,*:nth-child(2)%20%3E%20*:nth-child(5)%20%3E%20*%20%3E%20*%20%3E%20*:nth-child(1)%20%3E%20*:nth-child(2)', function (error, response) {
    if (!error) {
        mapName = response.contents[0].innerText;
        playersNumber = response.contents[1].innerText;
        server.get('/servers', function (req, res) {
            res.status(200).send({
                "servers": [
                    {
                        "region": "US",
                        "map": {
                            "id": Number(parsedJSON.maps.maps.filter(map => map.name === mapName)[0].id),
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
    }
    else process.exit(1);
});

setInterval(function () {
    getJSON('https://cloudquery.unixfox.eu/query?url=https%3A%2F%2Fstratus.network%2Fplay&selectors=*:nth-child(5)%20*:nth-child(2)%20%3E%20*:nth-child(1)%20%3E%20*%20%3E%20*%20%3E%20*,*:nth-child(2)%20%3E%20*:nth-child(5)%20%3E%20*%20%3E%20*%20%3E%20*:nth-child(1)%20%3E%20*:nth-child(2)', function (error, response) {
        if (!error) {
            mapName = response.contents[0].innerText;
            playersNumber = response.contents[1].innerText;
        }
        else process.exit(1);
    });
}, 10000);