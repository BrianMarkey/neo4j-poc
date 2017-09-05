LOAD CSV WITH HEADERS FROM "file:///data/domains.csv" AS csvLine
CREATE (p:Domain { tempId: toInt(csvLine.id), domainName: csvLine.domainName });

CREATE CONSTRAINT ON (domain:Domain) ASSERT domain.tempId IS UNIQUE;

LOAD CSV WITH HEADERS FROM "file:///data/ip-addresses.csv" AS csvLine
CREATE (p:IPAddress { tempId: toInt(csvLine.id), ipAddress: csvLine.ipAddress });

CREATE CONSTRAINT ON (ipAddress:IPAddress) ASSERT ipAddress.tempId IS UNIQUE;

USING PERIODIC COMMIT 500
LOAD CSV WITH HEADERS FROM "file:///data/hyperlinks.csv" AS csvLine
MATCH (fromNode:Domain {tempId: toInt(csvLine.fromNodeId)}),(toNode:Domain {tempId: toInt(csvLine.toNodeId)})
CREATE (fromNode)-[:HYPERLINK_TO]->(toNode);

USING PERIODIC COMMIT 500
LOAD CSV WITH HEADERS FROM "file:///data/hyperlinks.csv" AS csvLine
MATCH (fromNode:IPAddress {tempId: toInt(csvLine.fromNodeId)}),(toNode:Domain {tempId: toInt(csvLine.toNodeId)})
CREATE (fromNode)-[:HYPERLINK_TO]->(toNode);

USING PERIODIC COMMIT 500
LOAD CSV WITH HEADERS FROM "file:///data/hyperlinks.csv" AS csvLine
MATCH (fromNode:IPAddress {tempId: toInt(csvLine.fromNodeId)}),(toNode:IPAddress {tempId: toInt(csvLine.toNodeId)})
CREATE (fromNode)-[:HYPERLINK_TO]->(toNode);

USING PERIODIC COMMIT 500
LOAD CSV WITH HEADERS FROM "file:///data/hyperlinks.csv" AS csvLine
MATCH (fromNode:Domain {tempId: toInt(csvLine.fromNodeId)}),(toNode:IPAddress {tempId: toInt(csvLine.toNodeId)})
CREATE (fromNode)-[:HYPERLINK_TO]->(toNode);

MATCH (n) REMOVE n.tempId;