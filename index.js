const jsonServer = require('json-server');
const parsedJSON = require('./db.json');
const server = jsonServer.create();
const router = jsonServer.router(parsedJSON);
const requestJson = require('request-json');
const middlewares = jsonServer.defaults({ readOnly: true, noCors: true, logger: false });

requestJsonBaseUrl = requestJson.createClient('https://graph.unixfox.eu/');
const requestJsonData = {
    queries:
        [{
            refId: "A",
            intervalMs: 120000,
            maxDataPoints: 480,
            datasourceId: 3,
            rawSql: "SELECT * FROM currentmap", "format": "table"
        }]
};

server.use(jsonServer.bodyParser);
server.get('/servers', function (req, res) {
    requestJsonBaseUrl.post('api/tsdb/query', requestJsonData, function (err, reponse, body) {
        let mapID = 999999;
        if (parsedJSON.maps.maps.filter(map => map.name === body.results.A.tables[0].rows[0][2])[0])
            mapID = Number(parsedJSON.maps.maps.filter(map => map.name === body.results.A.tables[0].rows[0][2])[0].id);
        res.status(200).send({
            "servers": [
                {
                    "region": "US",
                    "map": {
                        "id": mapID,
                        "name": body.results.A.tables[0].rows[0][2]
                    },
                    "name": "Mixed",
                    "playing": body.results.A.tables[0].rows[7][2]
                }
            ]
        });
    });
});

server.use(middlewares);
server.use(router);
server.listen(3000, () => {
    console.log('JSON Server is running');
});