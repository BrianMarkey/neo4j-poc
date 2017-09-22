// This module defines methods for running queries
// against a neo4j database.
const neo4j = require('neo4j-driver').v1;
const queue = require('queue')();

module.exports = (dbHostName, queryFactory) => {
  queue.concurrency = 1;
  queue.autostart = true;
  queue.start();
  
  // Run the provided query.
  const runQuery = (query) => {
    return new Promise((resolve, reject) => {
      const driver = neo4j.driver(`bolt://${dbHostName}`, neo4j.auth.basic("neo4j", "123456"));
      const session = driver.session();
      console.log(`starting ${query.label} query`);
      const start = Date.now();
      session
        .run(query.cypher, query.params)
        .then((result) => {
          const duration = Date.now() - start;
          console.log(`${query.label} query completed in ${duration} ms.`);
          session.close();
          driver.close();
          var convertedResults;
          if (query.converter) {
            convertedResults = query.converter(result.records);
          }
          resolve(convertedResults);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  return {
    // Queue the provided query to be run.
    addQueryToQueue(query) {
      return new Promise((resolve, reject) => {
        queue.push((cb) => {
          runQuery(query).then((convertedResults) => {
            resolve(convertedResults);
            cb();
          });
        });
      });
    },

    // Ping the database until it responds.
    // Will stop pinging after the specified timeout.
    waitForDB (timeoutSeconds) {
      // TODO: Default the timeoutSeconds.
      return new Promise((resolve, reject) => {
        const start = Date.now();
        const interval = setInterval (() => {
          runQuery({
            cypher: 'MATCH (n) RETURN n LIMIT 1',
            label: 'ping'
          })
          .then(() => {
            clearInterval(interval);
            resolve();
          })
          .catch(() => {
            if (Date.now() - start >  timeoutSeconds * 1000) {
              console.log('Wait for database timeout elapsed.');
              clearInterval(interval);
              reject();
            }
            else {
              console.log('The database is not available yet.');
            }
          });
        }, 1000);
      });
    }
  }
}