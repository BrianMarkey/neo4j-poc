// Store the queries. In real life these should
// be persisted in a database.
module.exports = {
  queries: [],
  queryMap: {},
  nextId: 1,
  get(id){
    return new Promise((resolve, reject) => {
      if (!id) {
        resolve();
      }
      resolve(this.queryMap[id]);
    });
  },
  save(query){
    query.id = this.nextId;
    this.nextId++;
    this.queries.push(query);
    this.queryMap[query.id] = query;
  }
}
