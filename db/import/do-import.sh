#!/bin/sh
echo "importing data..."
cat /var/lib/neo4j/import/import.cypher | /var/lib/neo4j/bin/cypher-shell -u neo4j -p 123456
echo "import complete..."
