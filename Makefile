build:
	-docker rm markey_neo4j_db
	-docker rm markey_neo4j_initializer
	-docker rm markey_neo4j_app
	docker volume create neo4jcodetest_import-data
	docker build . --file ./db-dockerfile -t markey_neo4j_db --no-cache
	docker build . --file ./initializer-dockerfile -t markey_neo4j_initializer --no-cache
	docker build . --file ./app-dockerfile -t markey_neo4j_app --no-cache
	docker run -v neo4jcodetest_import-data:/initializer/data-to-import markey_neo4j_initializer node /initializer/src/create-data
	docker run -d -p 7474:7474 -p 7687:7687 --name markey_neo4j_db -v neo4jcodetest_import-data:/var/lib/neo4j/import/data markey_neo4j_db
	docker exec -i -t markey_neo4j_db /bin/sh -c "import/wait-for-it.sh localhost:7474 -- /var/lib/neo4j/import/do-import.sh"
	docker stop markey_neo4j_db

run:
	docker start markey_neo4j_db
	docker run -it -p 3000:3000 -p 8080:8080 --link=markey_neo4j_db:neo4j markey_neo4j_app node -e 'require("/app/src/app.js")("neo4j")'

run-dev:
	docker start markey_neo4j_db
	node -e 'require("./app/src/app")("localhost")'

test:
	mocha "./*/test/*.js"
