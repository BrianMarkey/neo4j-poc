LOAD CSV WITH HEADERS FROM "file:///data/domains.csv" AS csvLine
CREATE (p:Domain { nodeId: csvLine.nodeId, domainName: csvLine.domainName });

CREATE CONSTRAINT ON (domain:Domain) ASSERT domain.nodeId IS UNIQUE;

LOAD CSV WITH HEADERS FROM "file:///data/ip-addresses.csv" AS csvLine
CREATE (p:IPAddress { nodeId: csvLine.nodeId, ipAddress: csvLine.ipAddress });

CREATE CONSTRAINT ON (ipAddress:IPAddress) ASSERT ipAddress.nodeId IS UNIQUE;

USING PERIODIC COMMIT 500
LOAD CSV WITH HEADERS FROM "file:///data/hyperlinks.csv" AS csvLine
MATCH (fromNode:Domain {nodeId: csvLine.fromNodeId}),(toNode:Domain {nodeId: csvLine.toNodeId})
CREATE (fromNode)-[:HYPERLINK_TO]->(toNode);

USING PERIODIC COMMIT 500
LOAD CSV WITH HEADERS FROM "file:///data/hyperlinks.csv" AS csvLine
MATCH (fromNode:IPAddress {nodeId: csvLine.fromNodeId}),(toNode:Domain {nodeId: csvLine.toNodeId})
CREATE (fromNode)-[:HYPERLINK_TO]->(toNode);

USING PERIODIC COMMIT 500
LOAD CSV WITH HEADERS FROM "file:///data/hyperlinks.csv" AS csvLine
MATCH (fromNode:IPAddress {nodeId: csvLine.fromNodeId}),(toNode:IPAddress {nodeId: csvLine.toNodeId})
CREATE (fromNode)-[:HYPERLINK_TO]->(toNode);

USING PERIODIC COMMIT 500
LOAD CSV WITH HEADERS FROM "file:///data/hyperlinks.csv" AS csvLine
MATCH (fromNode:Domain {nodeId: csvLine.fromNodeId}),(toNode:IPAddress {nodeId: csvLine.toNodeId})
CREATE (fromNode)-[:HYPERLINK_TO]->(toNode);
