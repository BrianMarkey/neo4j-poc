const neo4j = require('neo4j-driver').v1;
var request = require('request');

function start()
{
  // Change the password
  request.post({
    headers: {'content-type' : 'application/x-www-form-urlencoded'},
    url: 'http://neo4j:7474/user/neo4j/password',
    auth: {
      user: 'neo4j',
      password: 'neo4j'
    },
    body: "password=smough"
  }, function(error, response, body){
    if (error) {
      console.log('change password failed ' +  error);
      setTimeout(start, 2000);
    }
    else {
      // Load the data
      load();
    }
  });
}

function load() {
  createData();
  // runQuery(`MATCH (n)
  //           DETACH DELETE n`);
  // runQuery(`USING PERIODIC COMMIT 500
  //           LOAD CSV WITH HEADERS FROM "file:///domain-to-domain.csv" AS csvLine
  //           MATCH (fromDomain:Domain {id: toInt(csvLine.fromDomainId)}),(toDomain:Domain {id: toInt(csvLine.toDomainId)})
  //           CREATE (fromDomain)-[:HYPERLINK_TO]->(toDomain)`);
  // runQuery(`LOAD CSV WITH HEADERS FROM "file:///ip-to-domain.csv" AS csvLine
  //           CREATE (p:Domain { id: toInt(csvLine.id), domainName: csvLine.domainName })`);
  // runQuery(`LOAD CSV WITH HEADERS FROM "file:///ip-to-ip.csv" AS csvLine
  //           CREATE (p:Domain { id: toInt(csvLine.id), domainName: csvLine.domainName })`);
}

function createData() {
  createDomains(createIPAdresses);
}

function createDomains(next){
  runQuery(`LOAD CSV WITH HEADERS FROM "file:///domains.csv" AS csvLine
            CREATE (p:Domain { id: toInt(csvLine.id), domainName: csvLine.domainName })`, () => {
              runQuery(`CREATE CONSTRAINT ON (domain:Domain) ASSERT domain.id IS UNIQUE`, next);
            });
}

function createIPAdresses(){
  runQuery(`LOAD CSV WITH HEADERS FROM "file:///ip-addresses.csv" AS csvLine
            CREATE (p:IPAddress { id: toInt(csvLine.id), ipAddress: csvLine.ipAddress })`, () => {
      runQuery(`CREATE CONSTRAINT ON (ipAddress:IPAddress) ASSERT ipAddress.id IS UNIQUE`, createRelationships);
  });
}

function createRelationships(){
  runQuery(`USING PERIODIC COMMIT 500
            LOAD CSV WITH HEADERS FROM "file:///domain-to-domain.csv" AS csvLine
            MATCH (fromDomain:Domain {id: toInt(csvLine.fromDomainId)}),(toDomain:Domain {id: toInt(csvLine.toDomainId)})
            CREATE (fromDomain)-[:HYPERLINK_TO]->(toDomain)`);
}

function runQuery (query, next) {
  const driver = neo4j.driver("bolt://neo4j", neo4j.auth.basic("neo4j", "smough"));
  const session = driver.session();
  session
    .run(query)
    .then((result) => {
      result.records.forEach((record) => {
        //console.log(record.get('name'));
      });
      console.log('weeeee. loadedddd!');
      session.close();
      driver.close();
      if (next) {
        next();
      }
    })
    .catch((error) => {
      console.log(error);
    });
}
start();