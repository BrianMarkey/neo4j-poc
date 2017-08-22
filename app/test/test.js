const queryFactory = require('../src/query-factory.js');
const assert = require('assert');

 describe('queryFactory', function() {
  describe('#buildHyperlinkQuery()', function() {
    it('should return the right cypher when the start node is DOMAIN and the separation is 1.', function() {
      const result = queryFactory.buildHyperlinkQuery({
        startNodeType: 'DOMAIN',
        degreesOfSeparation: 1
      });
      const expectedResult = 'MATCH (n1:Domain)-[r1:HYPERLINK_TO]-(n2) RETURN n1,r1,n2 LIMIT 100';
      assert.strictEqual(expectedResult, result);
    });
    it('should return the right cypher when the start node is IP_ADDRESS, the separation is 3 and the limit is 200.', function() {
      const result = queryFactory.buildHyperlinkQuery({
        startNodeType: 'DOMAIN',
        degreesOfSeparation: 3,
        responseLimit: 200
      });
      const expectedResult = 'MATCH (n1:Domain)-[r1:HYPERLINK_TO]-(n2)-[r2:HYPERLINK_TO]-(n3)-[r3:HYPERLINK_TO]-(n4) RETURN n1,r1,n2,r2,n3,r3,n4 LIMIT 200';
      assert.strictEqual(expectedResult, result);
    });
  });
});