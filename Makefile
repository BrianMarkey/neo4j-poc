build:
	docker stop markey_neo4j_db
	docker stop markey_neo4j_app
	docker rm markey_neo4j_db
	docker-compose up --build