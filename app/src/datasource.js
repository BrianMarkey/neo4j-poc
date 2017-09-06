const neo4j = require('neo4j-driver').v1;
const queue = require('queue')();

module.exports = (dbHostName) => {
  queue.concurrency = 1;
  queue.autostart = true;
  queue.start();
  
  return {
    convertToGraphJSON(records) {
      if (!Array.isArray(records)) {
        console.log('not an array');
        return {};
      }

      const result = {
        nodes: [],
        edges: []
      };

      const nodeIds = {};

      records.forEach((record) => {
        record._fields.forEach((field) => {
          if (field.hasOwnProperty('end')) {
            result.edges.push({
              source: field.start.low,
              target: field.end.low,
              type: field.type
            });
          }
          else {
            if (!nodeIds[field.identity.low]) {
              result.nodes.push({
                id: field.identity.low,
                label: field.labels[0],
                name: field.properties.ipAddress
                  ||field.properties.domainName
              });
              nodeIds[field.identity.low] = true;
            }
          }
        });
      });

      return result;
    },

    getNodesCount () {
      return new Promise((resolve, reject) => {
        const query =
        {
          cypher: `MATCH (n) RETURN COUNT(n)`,
          label: `get nodes count`,
          converter: this.convertToCount
        };
        this.addQueryToQueue(query).then((convertedResults) => {
          resolve(convertedResults);
        });
      });
    },

    getEdgesCount () {
      return new Promise((resolve, reject) => {
        const query =
        {
          cypher: `MATCH (n)-[rel]-(o) RETURN COUNT(rel)`,
          label: `get edges count`,
          converter: this.convertToCount
        };
        this.addQueryToQueue(query).then((convertedResults) => {
          resolve(convertedResults);
        });
      });
    },

    deleteRandomEdges (count) {
      return new Promise((resolve, reject) => {
        const query =
        {
          cypher: `MATCH (d)-[rel]-()
          WITH rel, rand() AS number
          ORDER by number
          LIMIT ${count}
          DELETE rel`,
          label: `delete ${count} random edges`
        };
        this.addQueryToQueue(query).then((convertedResults) => {
          resolve(convertedResults);
        });
      });
    },

    deleteRandomNodes (count) {
      return new Promise((resolve, reject) => {
        const query =
        {
          cypher: `MATCH (n)
          WITH n, rand() AS number
          ORDER by number
          LIMIT ${count}
          DETACH DELETE n`,
          label: `delete ${count} random nodes`
        };
        this.addQueryToQueue(query).then((convertedResults) => {
          resolve(convertedResults);
        });
      });
    },

    insertDomains (domainsToInsert) {
      return new Promise((resolve, reject) => {
        const query = 
        {
          cypher: `UNWIND $domainsParam as domain
                  CREATE (d:Domain { domainName: domain.domainName, nodeId: domain.nodeId })
                  RETURN d`,
          label: `insert ${domainsToInsert.length} domains`,
          params: { domainsParam: domainsToInsert },
          converter: this.convertToNodes
        };
        this.addQueryToQueue(query).then((convertedResults) => {
          resolve(convertedResults);
        });
      });
    },
    
    insertIPAddresses (ipAddressesToInsert) {
      return new Promise((resolve, reject) => {
        const query = 
        {
          cypher: `UNWIND $ipsParam as ip
                  CREATE (i:IPAddress { ipAddress: ip.ipAddress, nodeId: ip.nodeId })
                  RETURN i`,
          label: `insert ${ipAddressesToInsert.length} IPAddresses`,
          params: { ipsParam: ipAddressesToInsert },
          converter: this.convertToNodes
        };
        this.addQueryToQueue(query).then((convertedResults) => {
          resolve(convertedResults);
        });
      });
    },
    
    /*
    hyperlinksToInsert
    {
      fromNodeId: 1,
      toNodeId: 2
    }
    */
    insertHyperlinks (hyperlinksToInsert) {
      return new Promise((resolve, reject) => {
        const query = 
        {
          cypher: `UNWIND $relationships as rel
                   OPTIONAL MATCH (n1:IPAddress)
                   WHERE n1.nodeId = rel.fromNodeId
                   WITH rel as rel, collect({fromNode:n1, toNode: null}) as l1
                    
                   OPTIONAL MATCH (n1:Domain)
                   WHERE n1.nodeId = rel.fromNodeId
                   WITH rel as rel, collect({fromNode:n1, toNode: null}) + l1 as l2
                    
                   OPTIONAL MATCH (n1:IPAddress)
                   WHERE n1.nodeId = rel.toNodeId
                   WITH rel as rel, collect({fromNode:null, toNode: n1}) + l2 as l3
                    
                   OPTIONAL MATCH (n1:Domain)
                   WHERE n1.nodeId = rel.toNodeId
                   WITH rel as rel, collect({fromNode:null, toNode: n1}) + l3 as l4
                    
                   WITH extract(fn in filter(x IN l4 where x.fromNode IS NOT NULL) | fn.fromNode)[0] as fromNode,
                   extract(fn in filter(x IN l4 where x.toNode IS NOT NULL) | fn.toNode)[0] as toNode
                    
                   MERGE (fromNode)-[r:HYPERLINK_TO]->(fromNode)
                   RETURN r`,
          label: `insert ${hyperlinksToInsert.length} hyperlink relationships`,
          params: { relationships: hyperlinksToInsert },
          converter: (results) => {
            return results;
          }
        };
        this.addQueryToQueue(query).then((convertedResults) => {
          resolve(convertedResults);
        });
      });
    },

    getAllNodes() {
      return new Promise((resolve, reject) => {
        const query = 
        {
          cypher: `MATCH (n) RETURN n`,
          label: `get all nodes`,
          converter: this.convertToNodes
        };
        this.addQueryToQueue(query).then((convertedResults) => {
          resolve(convertedResults);
        });
      });
    },

    addQueryToQueue(query) {
      return new Promise((resolve, reject) => {
        queue.push((cb) => {
          this.runQuery(query).then((convertedResults) => {
            resolve(convertedResults);
            cb();
          });
        });
      });
    },

    convertToCount(records) {
      if (!Array.isArray(records)) {
        return 0;
      }
      return records[0]._fields[0].low;
    },
    
    convertToIds(records) {
      if (!Array.isArray(records)) {
        return [];
      }
      const results = [];
      records.forEach((record) => {
        results.push(record);
        //results.push(record._fields[0].id.low);
      });
      return results;
    },
    
    convertToNodes(records) {
      if (!Array.isArray(records)) {
        return [];
      }
      const results = [];
      records.forEach((record) => {
        const fields = record._fields[0];
        const properties = fields.properties;
        const node = {
          nodeId: properties.nodeId
        };
        if (properties.domainName) {
          node.domainName = properties.domainName;
          node.nodeType = 'DOMAIN';
        }
        else {
          node.ipAddress = properties.ipAddress;
          node.nodeType = 'IP_ADDRESS';
        }
        results.push(node);
      });
      return results;
    },

    runQuery (query) {
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
  }
}