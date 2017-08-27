LOAD CSV WITH HEADERS FROM "file:///domains.csv" AS csvLine
CREATE (p:Domain { id: toInt(csvLine.id), domainName: csvLine.domainName });

CREATE CONSTRAINT ON (domain:Domain) ASSERT domain.id IS UNIQUE;

LOAD CSV WITH HEADERS FROM "file:///ip-addresses.csv" AS csvLine
CREATE (p:IPAddress { id: toInt(csvLine.id), ipAddress: csvLine.ipAddress });

CREATE CONSTRAINT ON (ipAddress:IPAddress) ASSERT ipAddress.id IS UNIQUE;

USING PERIODIC COMMIT 500
LOAD CSV WITH HEADERS FROM "file:///hyperlinks.csv" AS csvLine
MATCH (fromNode:Domain {id: toInt(csvLine.fromDomainId)}),(toNode:Domain {id: toInt(csvLine.toDomainId)})
CREATE (fromNode)-[:HYPERLINK_TO]->(toNode);

USING PERIODIC COMMIT 500
LOAD CSV WITH HEADERS FROM "file:///hyperlinks.csv" AS csvLine
MATCH (fromNode:IPAddress {id: toInt(csvLine.fromDomainId)}),(toNode:Domain {id: toInt(csvLine.toIPAddressId)})
CREATE (fromNode)-[:HYPERLINK_TO]->(toNode);

USING PERIODIC COMMIT 500
LOAD CSV WITH HEADERS FROM "file:///hyperlinks.csv" AS csvLine
MATCH (fromNode:IPAddress {id: toInt(csvLine.fromIPAddressId)}),(toNode:IPAddress {id: toInt(csvLine.toIPAddressId)})
CREATE (fromNode)-[:HYPERLINK_TO]->(toNode);

USING PERIODIC COMMIT 500
LOAD CSV WITH HEADERS FROM "file:///hyperlinks.csv" AS csvLine
MATCH (fromNode:IPAddress {id: toInt(csvLine.fromIPAddressId)}),(toNode:Domain {id: toInt(csvLine.toDomainId)})
CREATE (fromNode)-[:HYPERLINK_TO]->(toNode);