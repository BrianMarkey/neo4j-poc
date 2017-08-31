// The purpose of this module is to randomly add and delete data.
module.exports = (dataSource, fakeDataFactory) => {
  return {
    causeTrouble() {
      //this.addRandomData();
      this.deleteRandomEdges(.001, () => { 
        this.deleteRandomNodes(.001, () => {
        });
      });
    },

    deleteRandomEdges(percentToDelete, next) {
      dataSource.getEdgesCount((result) => {
        const numberToDelete = Math.floor(result * percentToDelete);
        dataSource.deleteRandomEdges(numberToDelete, next);
      });
    },

    deleteRandomNodes(percentToDelete, next) {
      dataSource.getNodesCount((result) => {
        const numberToDelete = Math.floor(result * percentToDelete);
        dataSource.deleteRandomNodes(numberToDelete, next);
      });
    },

    addRandomData() {
      // create random nodes
      // randomly link them to eachother and other db nodes
      dataSource.getNodesCount((result) => {
        const numberToAdd = Math.floor(result * percentToDelete);
        const numberOfIPs = fakeDataFactory.getRandomIntFromRange(0, numberToAdd);
        const numberOfDomains = numberToAdd - numberOfIPs;
        const nodesToAdd = fakeDataFactory.createNodes(numberOfIPs, numberOfDomains);
        // insert the nodes
      });
      const query = {
        label: 'get all nodes',
        cypher: 'match (n) return n'
      }
      dataSource.runQuery(query);
    }
  }
}