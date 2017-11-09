# neo4j-poc
## A project to learn about neo4j.

The goal is to create a group of applications which interact with a neo4j database in an interesting way.

- Run neo4j in a docker container, and seed it with random data about connected ip addresses and domain names.
- Kick off a process which randomly deletes and adds data to the db.
- Run an http api in another container which has the ability to query the database.
- Run a web socket server which will add the ability to subscribe to stored queries, and push any deltas as they occur.
- Add an interface, which uses the api to save queries, displays them in a graph, then subscribes to them via the websocket server. When changes are pushed they will be reactively updated in the graph.
