build:
	-docker rm markey_neo4j_db
	node initializer/create-data
	docker-compose up -d --build
	docker exec -it markey_neo4j_db import/wait-for-it.sh localhost:7474 -- /var/lib/neo4j/import/do-import.sh

run:
	docker-compose up

test:
	mocha "./*/test/*.js"