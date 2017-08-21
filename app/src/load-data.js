const neo4j = require('neo4j-driver').v1;
var request = require('request');

function start()
{
  // Change the password
  // TODO do a makefile command
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
      createData();
    }
  });
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
  const domainToDomain =
    `USING PERIODIC COMMIT 500
     LOAD CSV WITH HEADERS FROM "file:///hyperlinks.csv" AS csvLine
     MATCH (fromNode:Domain {id: toInt(csvLine.fromDomainId)}),(toNode:Domain {id: toInt(csvLine.toDomainId)})
     CREATE (fromNode)-[:HYPERLINK_TO]->(toNode)`;
  const domainToIP =
    `USING PERIODIC COMMIT 500
     LOAD CSV WITH HEADERS FROM "file:///hyperlinks.csv" AS csvLine
     MATCH (fromNode:IPAddress {id: toInt(csvLine.fromDomainId)}),(toNode:Domain {id: toInt(csvLine.toIPAddressId)})
     CREATE (fromNode)-[:HYPERLINK_TO]->(toNode)`;
  const ipToIP = 
    `USING PERIODIC COMMIT 500
     LOAD CSV WITH HEADERS FROM "file:///hyperlinks.csv" AS csvLine
     MATCH (fromNode:IPAddress {id: toInt(csvLine.fromIPAddressId)}),(toNode:IPAddress {id: toInt(csvLine.toIPAddressId)})
     CREATE (fromNode)-[:HYPERLINK_TO]->(toNode)`;
  const ipToDomain =
    `USING PERIODIC COMMIT 500
     LOAD CSV WITH HEADERS FROM "file:///hyperlinks.csv" AS csvLine
     MATCH (fromNode:IPAddress {id: toInt(csvLine.fromIPAddressId)}),(toNode:Domain {id: toInt(csvLine.toDomainId)})
     CREATE (fromNode)-[:HYPERLINK_TO]->(toNode)`;
  runQuery(domainToDomain, () => {
    runQuery(domainToIP, () => {
      runQuery(ipToIP, () => {
        runQuery(ipToDomain);
      });
    });
  });
}

function runQuery (query, next) {
  const driver = neo4j.driver("bolt://neo4j", neo4j.auth.basic("neo4j", "smough"));
  const session = driver.session();
  session
    .run(query)
    .then((result) => {
      console.log('query completed');
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