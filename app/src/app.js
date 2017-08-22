const api = require('./api');
const gremlin = require('./gremlin');
const queryRepository = require('./query-repository');
const dataSource = require('./datasource');
const events = require('events'); 
const bus = new events.EventEmitter();
const websocketManager = require('./websocket-manager')(8080, bus);
const sentinel = require('./sentinel')(queryRepository, dataSource, bus);

/*
// start deleting and adding data
setInterval(() => {
  gremlin.causeTrouble();
}, 5000);

// start watching for changes in query results
setInterval(() => {
  sentinel.patrol();
}, 2000);
*/

// start the express api
api.start(queryRepository, dataSource);
