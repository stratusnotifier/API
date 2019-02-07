const jsonServer = require('json-server');
const request = require('request');
const parsedJSON = require('./db.json');
const server = jsonServer.create();
const router = jsonServer.router(parsedJSON);
const middlewares = jsonServer.defaults({ readOnly: true, noCors: true, logger: false });

request.post(
    'https://graph.unixfox.eu/api/tsdb/query',
    { json: { "queries": [{ "refId": "A", "intervalMs": 120000, "maxDataPoints": 480, "datasourceId": 3, "rawSql": "SELECT * FROM currentmap", "format": "table" }] } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            server.use(jsonServer.bodyParser);
            server.get('/servers', function (req, res) {
                res.status(200).send({
                    "servers": [
                        {
                            "region": "US",
                            "map": {
                                "id": Number(parsedJSON.maps.maps.filter(map => map.name === body.results.A.tables[0].rows[0][2])[0].id),
                                "name": body.results.A.tables[0].rows[0][2]
                            },
                            "name": "Mixed",
                            "playing": body.results.A.tables[0].rows[7][2]
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
    }
);