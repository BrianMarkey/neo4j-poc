const api = require('./api');
const gremlin = require('./gremlin');
const queryRepository = require('./query-repository');
const dataSource = require('./datasource');
const sentinel = require('./sentinel');

// start deleting and adding data
gremlin.causeTrouble();
// start watching for changes in query results
sentinel.standGuard(queryRepository, dataSource);
// start the express api
api.start(queryRepository, dataSource);
