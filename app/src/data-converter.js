// This module defines methods for transforming
// data retruned from the neo4j javascript driver
// into objects which are easily used by the application.
module.exports = {
  // Converts data to the GraphJSON format
  // {
  //   nodes: [...],
  //   edges: [...] 
  // }
  convertToGraphJSON(records) {
    if (!Array.isArray(records)) {
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

  // Converts a result set from a query
  // returning a count to an it representing the count. 
  convertToCount(records) {
    if (!Array.isArray(records)) {
      return 0;
    }
    // TODO: More validation.
    // TODO: parseInt.
    return records[0]._fields[0].low;
  },
  
  // TODO: Delete this. Doesn't appear to be used.
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
  
  // Extracts and returns the nodes from
  // a result set in a single array. Any selected
  // data about the node will be included.
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
  }
}
