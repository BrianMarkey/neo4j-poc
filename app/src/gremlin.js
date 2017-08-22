const dataSource = require('./datasource');
const dataFactory = require('./data-factory');

module.exports = {
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