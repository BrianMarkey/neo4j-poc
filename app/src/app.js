const api = require('./api');
const gremlin = require('./gremlin');
const queryRepository = require('./query-repository');
const dataSource = require('./datasource');
const sentinel = require('./sentinel')(queryRepository, dataSource);

// start deleting and adding data
setInterval(() => {
  gremlin.causeTrouble();
}, 5000);

// start watching for changes in query results
setInterval(() => {
  sentinel.standGuard(queryRepository, dataSource);
}, 2000);

// start the express api
api.start(queryRepository, dataSource);
