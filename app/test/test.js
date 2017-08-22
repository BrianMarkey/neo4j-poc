const queryFactory = require('../src/query-factory.js');
const sentinel = require('../src/sentinel.js');
const assert = require('assert');

 describe('queryFactory', function() {
  describe('#buildHyperlinkQuery()', function() {
    it('should return the right cypher when the start node is DOMAIN and the separation is 1.', function() {
      const result = queryFactory.buildHyperlinkQuery({
        startNodeType: 'DOMAIN',
        degreesOfSeparation: 1
      });
      const expectedResult = 'MATCH (n1:Domain)-[r1:HYPERLINK_TO]-(n2) RETURN DISTINCT n1,r1,n2 LIMIT 100';
      assert.strictEqual(expectedResult, result.cypher);
    });
    it('should return the right cypher when the start node is IP_ADDRESS, the separation is 3 and the limit is 200.', function() {
      const result = queryFactory.buildHyperlinkQuery({
        startNodeType: 'DOMAIN',
        degreesOfSeparation: 3,
        responseLimit: 200
      });
      const expectedResult = 'MATCH (n1:Domain)-[r1:HYPERLINK_TO]-(n2)-[r2:HYPERLINK_TO]-(n3)-[r3:HYPERLINK_TO]-(n4) RETURN DISTINCT n1,r1,n2,r2,n3,r3,n4 LIMIT 200';
      assert.strictEqual(expectedResult, result.cypher);
    });
  });
});


 describe('sentinel', function() {
  describe('#getArrayDiff()', function() {
    it('should detect additions.', function() {
      const oldSet = [ { id: 1 }, { id: 2 }, { id: 3 } ];
      const newSet = [ { id: 1 }, { id: 2 }, { id: 3 }, { id: 5 } ];
      const result = sentinel.getArrayDiff(oldSet, newSet);
      assert.strictEqual(5, result.added[0].id);
    });
    it('should detect removal.', function() {
      const oldSet = [ { id: 1 }, { id: 2 }, { id: 3 } ];
      const newSet = [ { id: 1 }, { id: 2 } ];
      const result = sentinel.getArrayDiff(oldSet, newSet);
      assert.strictEqual(3, result.removed[0].id);
    });
  });
  describe('#getDeltas()', function() {
    it('should detect the addition of nodes.', function() {
      const old = {
        nodes: [ { id: 1 }, { id: 2 }, { id: 3 } ],
        edges: [ { id: 1 }, { id: 2 }, { id: 3 } ]
      };
      const niew = {
        nodes: [ { id: 1 }, { id: 3 }, { id: 5 } ],
        edges: [ { id: 1 }, { id: 3 }, { id: 5 } ]
      };
      const result = sentinel.getDeltas(old, niew);
      assert.strictEqual(5, result.addedNodes[0].id);
    });
    it('should detect the removal of nodes.', function() {
      const old = {
        nodes: [ { id: 1 }, { id: 2 }, { id: 3 } ],
        edges: [ { id: 1 }, { id: 2 }, { id: 3 } ]
      };
      const niew = {
        nodes: [ { id: 1 }, { id: 3 }, { id: 5 } ],
        edges: [ { id: 1 }, { id: 3 }, { id: 5 } ]
      };
      const result = sentinel.getDeltas(old, niew);
      assert.strictEqual(2, result.removedNodes[0].id);
    });
    
    it('should detect the addition of edges.', function() {
      const old = {
        nodes: [ { id: 1 }, { id: 2 }, { id: 3 } ],
        edges: [ { id: 1 }, { id: 2 }, { id: 3 } ]
      };
      const niew = {
        nodes: [ { id: 1 }, { id: 3 }, { id: 5 } ],
        edges: [ { id: 1 }, { id: 3 }, { id: 5 } ]
      };
      const result = sentinel.getDeltas(old, niew);
      assert.strictEqual(5, result.addedEdges[0].id);
    });
    it('should detect the removal of edges.', function() {
      const old = {
        nodes: [ { id: 1 }, { id: 2 }, { id: 3 } ],
        edges: [ { id: 1 }, { id: 2 }, { id: 3 } ]
      };
      const niew = {
        nodes: [ { id: 1 }, { id: 3 }, { id: 5 } ],
        edges: [ { id: 1 }, { id: 3 }, { id: 5 } ]
      };
      const result = sentinel.getDeltas(old, niew);
      assert.strictEqual(2, result.removedEdges[0].id);
    });
  });
});