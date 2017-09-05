const neo4j = require('neo4j-driver').v1;

module.exports = (dbHostName) => {
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

    getNodesCount (next) {
      const query =
      {
        cypher: `MATCH (n) RETURN COUNT(n)`,
        label: `get nodes count`,
        converter: this.convertToCount
      };
      this.runQuery(query, next);
    },

    getEdgesCount (next) {
      const query =
      {
        cypher: `MATCH (n)-[rel]-(o) RETURN COUNT(rel)`,
        label: `get edges count`,
        converter: this.convertToCount
      };
      this.runQuery(query, next);
    },

    deleteRandomEdges (count, next) {
      const query =
      {
        cypher: `MATCH (d)-[rel]-()
        WITH rel, rand() AS number
        ORDER by number
        LIMIT ${count}
        DELETE rel`,
        label: `delete ${count} random edges`
      };

      this.runQuery(query, next);
    },

    deleteRandomNodes (count, next) {
      const query =
      {
        cypher: `MATCH (n)
        WITH n, rand() AS number
        ORDER by number
        LIMIT ${count}
        DETACH DELETE n`,
        label: `delete ${count} random nodes`
      };
        
      this.runQuery(query, next);
    },

    insertDomains (domainsToInsert) {
      return new Promise((resolve, reject) => {
        const query = 
        {
          cypher: `UNWIND $domainsParam as domain
                  CREATE (d:Domain { domainName: domain.domainName })
                  RETURN d`,
          label: `insert ${domainsToInsert.length} domains`,
          params: { domainsParam: domainsToInsert },
          converter: this.convertToNodes
        };
        this.runQuery(query, (convertedResults) => {
          resolve(convertedResults);
        });
      });
    },
    
    insertIPAddresses (ipAddressesToInsert) {
      return new Promise((resolve, reject) => {
        const query = 
        {
          cypher: `UNWIND $ipsParam as ip
                  CREATE (i:IPAddress { ipAddress: ip.ipAddress })
                  RETURN i`,
          label: `insert ${ipAddressesToInsert.length} IPAddresses`,
          params: { ipsParam: ipAddressesToInsert },
          converter: this.convertToNodes
        };
        this.runQuery(query, (convertedResults) => {
          resolve(convertedResults);
        });
      });
    },
    
    /*
    hyperlinksToInsert
    {
      fromId: 1,
      toId: 2
    }
    */
    insertHyperlinks (hyperlinksToInsert) {
      return new Promise((resolve, reject) => {
        const query = 
        {
          cypher: `UNWIND $rels as rel
                   MATCH (n1 { id: rel.fromId }),(n2 { id: toId })
                   MERGE (n1)-[r:HYPERLINK_TO]->(n2)
                   RETURN r`,
          label: `insert ${hyperlinksToInsert.length} hyperlink relationships`,
          params: { rels: hyperlinksToInsert },
          converter: (results) => {
            console.log(results);
          }
        };
        this.runQuery(query, (convertedResults) => {
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
        this.runQuery(query, (convertedResults) => {
          resolve(convertedResults);
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
          id: fields.identity.low
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

    runQuery (query, next) {
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
          if (next) {
            next(convertedResults);
          }
        })
        // TODO: pass along error.
        .catch((error) => {
          console.log(error);
        });
    }
  }
}