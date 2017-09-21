// The purpose of this module is to randomly add and delete data.
module.exports = (dataSource, fakeDataFactory, queryFactory) => {
  return {
    causeTrouble() {
      this.deleteRandomEdges(.001);
      this.deleteRandomNodes(.001);
      this.addRandomData(.001);
    },

    deleteRandomEdges(percentToDelete) {
      // get the total number of edges
      const getEdgesCountQuery = queryFactory.buildGetEdgesCountQuery();
      dataSource.addQueryToQueue(getEdgesCountQuery).then((result) => {
        /// delete a percentage of them
        const numberToDelete = Math.floor(result * percentToDelete);
        const deleteEdgesQuery = queryFactory.buildDeleteRandomEdgesQuery(numberToDelete);
        dataSource.addQueryToQueue(deleteEdgesQuery);
      });
    },

    deleteRandomNodes(percentToDelete) {
      // get the total number of nodes
      const getNodesCountQuery = queryFactory.buildGetNodesCountQuery();
      dataSource.addQueryToQueue(getNodesCountQuery).then((result) => {
        /// delete a percentage of them
        const numberToDelete = Math.floor(result * percentToDelete);
        const deleteNodesQuery = queryFactory.buildDeleteRandomNodesQuery(numberToDelete);
        dataSource.addQueryToQueue(deleteNodesQuery);
      });
    },

    addRandomData(percentToAdd) {
      // create random nodes
      // randomly link them to eachother and other db nodes
      const getNodesCountQuery = queryFactory.buildGetNodesCountQuery();
      dataSource.addQueryToQueue(getNodesCountQuery).then((result) => {
        const numberToAdd = Math.floor(result * percentToAdd);
        const numberOfIPs = fakeDataFactory.getRandomIntFromRange(0, numberToAdd);
        const numberOfDomains = numberToAdd - numberOfIPs;
        const nodesToAdd = fakeDataFactory.createNodes(numberOfIPs, numberOfDomains);
        // build the queries to insert the nodes
        const insertIPAddressesQuery = queryFactory.buildInsertIPAddressesQuery(nodesToAdd.ipAddresses);
        const insertDomainsQuery = queryFactory.buildInsertDomainsQuery(nodesToAdd.domains);
        // insert the nodes
        const ipAddressesPromise = dataSource.addQueryToQueue(insertIPAddressesQuery);
        const domainsPromise = dataSource.addQueryToQueue(insertDomainsQuery);
        // wait for both results
        Promise.all([ipAddressesPromise, domainsPromise]).then(createNodesResult => {
          const createdNodes = createNodesResult[0].concat(createNodesResult[1]);
          //get all nodes
          const getAllNodesQuery = queryFactory.buildGetAllNodesQuery();
          dataSource.addQueryToQueue(getAllNodesQuery).then((allNodes) => {
            var newRelationships = [];
            // loop through the results ids
            createdNodes.forEach((node) => {
              // build up relationships
              const numberOfRelationships = fakeDataFactory.getRandomIntFromRange(0, 10);
              newRelationships = newRelationships.concat(
                fakeDataFactory.creatRelationshipsForNode(node, allNodes, numberOfRelationships, 'HYPERLINK_TO')
              );
            });
            // insert relationships
            const insertHyperlinksQuery = queryFactory.buildInsertHyperlinksQuery(newRelationships);
            dataSource.addQueryToQueue(insertHyperlinksQuery);
          }, (err) => {
            console.log(err);
          });
        });
      });
    }
  }
}