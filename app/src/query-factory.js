module.exports = (dataConverter) => {
  return {
    buildHyperlinkQuery(requestBody) {
      const responseLimit = requestBody.responseLimit || 100;
      const degreesOfSeparation = requestBody.degreesOfSeparation || 3;
      const startNodeToken = requestBody.startNodeType === 'DOMAIN' ? ':Domain'
        : requestBody.startNodeType === 'IP_ADDRESS' ? ':IPAddress'
        : '';
      var matchClause = `MATCH (n1${startNodeToken})`;
      var returnClause = `RETURN DISTINCT n1`;
      for (var i = 0; i < degreesOfSeparation; i++) {
        const nodeName = `n${i + 2}`;
        const relationshipName = `r${i + 1}`;
        matchClause += `-[${relationshipName}:HYPERLINK_TO]-(${nodeName})`;
        returnClause += `,${relationshipName},${nodeName}`;
      }
      const cypher = `${matchClause} ${returnClause} LIMIT ${responseLimit}`;

      return {
        cypher,
        id: '',
        results: {

        },
        label: requestBody.queryName,
        converter: dataConverter.convertToGraphJSON
      };
    },

    buildDeleteRandomEdgesQuery (count) {
      return {
        cypher: `MATCH (d)-[rel]-()
                 WITH rel, rand() AS number
                 ORDER by number
                 LIMIT ${count}
                 DELETE rel`,
        label: `delete ${count} random edges`
      };
    },

    buildDeleteRandomNodesQuery (count) {
      return {
        cypher: `MATCH (n)
                 WITH n, rand() AS number
                 ORDER by number
                 LIMIT ${count}
                 DETACH DELETE n`,
        label: `delete ${count} random nodes`
      };
    },
    
    buildGetAllNodesQuery() {
      return {
        cypher: `MATCH (n) RETURN n`,
        label: `get all nodes`,
        converter: dataConverter.convertToNodes
      };
    },

    buildGetNodesCountQuery () {
      return  {
        cypher: `MATCH (n) RETURN COUNT(n)`,
        label: `get nodes count`,
        converter: dataConverter.convertToCount
      };
    },

    buildGetEdgesCountQuery () {
      return {
        cypher: `MATCH (n)-[rel]-(o) RETURN COUNT(rel)`,
        label: `get edges count`,
        converter: dataConverter.convertToCount
      };
    },

    buildInsertDomainsQuery (domainsToInsert) {
      return {
        cypher: `UNWIND $domainsParam as domain
                 CREATE (d:Domain { domainName: domain.domainName, nodeId: domain.nodeId })
                 RETURN d`,
        label: `insert ${domainsToInsert.length} domains`,
        params: { domainsParam: domainsToInsert },
        converter: dataConverter.convertToNodes
      };
    },
    
    buildInsertIPAddressesQuery (ipAddressesToInsert) {
      return {
        cypher: `UNWIND $ipsParam as ip
                 CREATE (i:IPAddress { ipAddress: ip.ipAddress, nodeId: ip.nodeId })
                 RETURN i`,
        label: `insert ${ipAddressesToInsert.length} IPAddresses`,
        params: { ipsParam: ipAddressesToInsert },
        converter: dataConverter.convertToNodes
      };
    },
    
    /*
    hyperlinksToInsert
    {
      fromNodeId: 1,
      toNodeId: 2
    }
    */
    buildInsertHyperlinksQuery (hyperlinksToInsert) {
      return {
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
    }
  }
}