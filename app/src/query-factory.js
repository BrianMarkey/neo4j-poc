module.exports = {
  buildHyperlinkQuery(requestBody) {
    const responseLimit = requestBody.responseLimit || 100;
    const degreesOfSeparation = requestBody.degreesOfSeparation || 3;
    const startNodeToken = requestBody.startNodeType === 'DOMAIN' ? ':Domain'
      : requestBody.startNodeType === 'IP_ADDRESS' ? ':IPAddress'
      : '';
    var matchClause = `MATCH (n1${startNodeToken})`;
    var returnClause = `RETURN n1`;
    for (var i = 0; i < degreesOfSeparation; i++) {
      const nodeName = `n${i + 2}`;
      const relationshipName = `r${i + 1}`;
      matchClause += `-[${relationshipName}:HYPERLINK_TO]-(${nodeName})`;
      returnClause += `,${relationshipName},${nodeName}`;
    }
    return `${matchClause} ${returnClause} LIMIT ${responseLimit}`;
  }
}