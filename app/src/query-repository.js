// Store the queries. In real life these should
// be persisted in a database.
module.exports = {
  queries: [],
  nextId: 1,
  save(query){
    query.id = this.nextId;
    this.nextId++;
    this.queries.push(query);
  }
}
