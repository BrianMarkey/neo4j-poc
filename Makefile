build:
	-docker rm markey_neo4j_db
	node initializer/create-data
	docker-compose up --build

run:
	docker-compose up
