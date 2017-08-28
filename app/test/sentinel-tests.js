const queryFactory = require('../src/query-factory.js');
const sentinel = require('../src/sentinel.js')();
const assert = require('assert');

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