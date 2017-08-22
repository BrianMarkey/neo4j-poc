// This module polls the db with the saved queries
// to look for changes and takes the specified action
// when changes are found.
module.exports = (queryRepository, dataSource) => {
  return {
    standGuard() {
      queryRepository.queries.forEach((query) => {
        dataSource.runQuery(query, (results) => {
          const start = Date.now();
          const deltas = this.getDeltas(query.results, results);
          const end = Date.now();
          console.log(`took ${end - start} ms to diff records`);
          console.log(deltas.removedNodes + deltas.removedEdges + ' removed items');
        });
      });
    },
    getDeltas(oldSet, newSet) {
      const nodesResult = this.getArrayDiff(oldSet.nodes, newSet.nodes);
      const edgesResult = this.getArrayDiff(oldSet.edges, newSet.edges);

      return {
        addedNodes: nodesResult.added,
        removedNodes: nodesResult.removed,
        addedEdges: edgesResult.added,
        removedEdges: edgesResult.removed,
      }
    },
    getHash(data){
      const result = {};
      data.forEach((item) => {
        result[item.id] = item;
      });
      return result;
    },
    getArrayDiff(oldArray, newArray) {
      const added = [];
      const removed = [];
      const oldHash = this.getHash(oldArray);
      const newHash = this.getHash(newArray);

      for (var i = 0; i < oldArray.length; i++) {
        const val = oldArray[i];
        const match = newHash[val.id];
        if (!match) {
          removed.push(val);
        }
      }

      for (var i = 0; i < newArray.length; i++) {
        const val = newArray[i];
        const match = oldHash[val.id];
        if (!match) {
          added.push(val);
        }
      }

      return {
        added,
        removed
      }
    }
  }
}
