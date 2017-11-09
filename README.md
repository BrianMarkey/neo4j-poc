# neo4j-poc
## A project to learn about neo4j.

The goal is to create a group of applications which interact with a neo4j database in an interesting way.

- We'll run neo4j in a docker container, and seed it with random data about connected ip addresses and domain names.
- Then will kick off a process which randomly deletes and adds data to the db.
- Then we'll run an http api in another container which has the ability to query the database, and store the query results and parameters.
- Lastly we'll create an interface, which uses the api to run queries.
