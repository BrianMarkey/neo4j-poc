const api = require('./api');
const gremlin = require('./gremlin');

gremlin.causeTrouble();

api.start();
