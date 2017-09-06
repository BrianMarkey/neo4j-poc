// The purpose of this module is to randomly add and delete data.
module.exports = (dataSource, fakeDataFactory) => {
  return {
    causeTrouble() {
      this.deleteRandomEdges(.001, () => { 
        this.deleteRandomNodes(.001, () => {
          this.addRandomData(.001, () => {
            this.causeTrouble();
          });
        });
      });
    },

    deleteRandomEdges(percentToDelete, next) {
      dataSource.getEdgesCount().then((result) => {
        const numberToDelete = Math.floor(result * percentToDelete);
        dataSource.deleteRandomEdges(numberToDelete).then(() => {
          next();
        });
      });
    },

    deleteRandomNodes(percentToDelete, next) {
      dataSource.getNodesCount().then((result) => {
        const numberToDelete = Math.floor(result * percentToDelete);
        dataSource.deleteRandomNodes(numberToDelete).then(() => {
          next();
        });
      });
    },

    addRandomData(percentToAdd, next) {
      // create random nodes
      // randomly link them to eachother and other db nodes
      dataSource.getNodesCount().then((result) => {
        const numberToAdd = Math.floor(result * percentToAdd);
        const numberOfIPs = fakeDataFactory.getRandomIntFromRange(0, numberToAdd);
        const numberOfDomains = numberToAdd - numberOfIPs;
        const nodesToAdd = fakeDataFactory.createNodes(numberOfIPs, numberOfDomains);
        // insert the nodes
        const ipAddressesPromise = dataSource.insertIPAddresses(nodesToAdd.ipAddresses);
        const domainsPromise = dataSource.insertDomains(nodesToAdd.domains);
        // wait for both results
        Promise.all([ipAddressesPromise, domainsPromise]).then(createNodesResult => {
          const createdNodes = createNodesResult[0].concat(createNodesResult[1]);
          //get all nodes
          dataSource.getAllNodes().then((allNodes) => {
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
            dataSource.insertHyperlinks(newRelationships).then((results) => {
              next();
            })
          }, (err) => {
            console.log(err);
          });
        });
      });
    }
  }
}