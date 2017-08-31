// The purpose of this module is to randomly add and delete data.
const dataFactory = require('./data-factory');

module.exports = (dataSource) => {
  return {
    causeTrouble() {
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
      const query = {
        label: 'get all nodes',
        cypher: 'match (n) return n'
      }
      dataSource.runQuery('match (n) return n');
    }
  }
}