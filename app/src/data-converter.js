module.exports = {
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
  }
}