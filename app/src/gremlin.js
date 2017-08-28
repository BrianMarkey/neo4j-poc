// The purpose of this module is to randomly add and delete data.
const dataFactory = require('./data-factory');

module.exports = (dataSource) => {
  return {
    causeTrouble() {
      this.deleteRandomEdges(.001, () => { 
        this.deleteRandomNodes(.001)
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

    }
  }
}