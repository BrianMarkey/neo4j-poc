const api = require('./api');
const gremlin = require('./gremlin');
const queryRepository = require('./query-repository');
const dataSource = require('./datasource');
const sentinel = require('./sentinel');

//gremlin.causeTrouble();
sentinel.standGuard(queryRepository, dataSource);

api.start(queryRepository, dataSource);
