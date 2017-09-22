// This module acts as the composition root
// for the server-side application.
// It creates and injects the necessary components
// and starts the processes.
module.exports = (dbHostName) => {
  dbHostName = dbHostName || 'neo4j';
  const api = require('./api');
  const queryRepository = require('./query-repository');
  const fakeDataFactory = require('../../utils/src/fake-data-factory')();
  const dataConverter = require('./data-converter');
  const queryFactory = require('./query-factory')(dataConverter);
  const dataSource = require('./datasource')(dbHostName, queryFactory);
  const gremlin = require('./gremlin')(dataSource, fakeDataFactory, queryFactory);
  const events = require('events'); 
  const bus = new events.EventEmitter();
  const sentinel = require('./sentinel')(queryRepository, dataSource, bus);

  // Wait for the database to becom available.
  dataSource.waitForDB(30).then(() => {

    // Start deleting and adding data.
    setInterval(() => {
      gremlin.causeTrouble();
    }, 5000);

    // Start watching for changes in query results.
    setInterval(() => {
      sentinel.patrol();
    }, 2000);

    // Start the express api.
    api.start(queryRepository, dataSource, queryFactory);

    // Start the web socket manager.
    require('./websocket-manager')(8080, bus);

  })
  .catch(() => {
    console.log('The database did not start within the timeout period. The app will not start.');
  });
};
