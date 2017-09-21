const queryFactory = require('../src/query-factory.js');
const sentinel = require('../src/sentinel.js');
const assert = require('assert');

 describe('sentinel', function() {
  describe('#patrol()', function() {
    it('should emit an event with the correct data when deltas are found.', function() {
      // Arrange
      var idResult = '';
      var eventNameResult = '';
      var deltasResult = {};
      const bus = {
        emit (name, id, deltas) {
          eventNameResult = name;
          idResult = id;
          deltasResult  = deltas;
        },
        idResult: 'init'
      }

      // Mock the query repository.
      const queryRepository = {
        queries: [{
          id: '1',
          results: {
            nodes: [ { id: 1 }, { id: 2 }, { id: 3 } ],
            edges: [ { id: 1 }, { id: 2 }, { id: 3 } ]
          },
        }]
      };

      // Mock data source.
      const dataSource = {
        addQueryToQueue(query) {
          return new Promise((resolve, reject) => {
            if (query.id === '1') {
              resolve({
                nodes: [ { id: 1 }, { id: 2 }, { id: 3 } ],
                edges: [ { id: 1 }, { id: 2 } ]
              });
            }
          });
        }
      };

      const testSentinel = sentinel(queryRepository, dataSource, bus);

      // Act
      testSentinel.patrol().then(() => {
        // Assert
        assert.strictEqual('query_ResultsChanged', bus.eventNameResult);
        assert.strictEqual('1', idResult);
        assert.strictEqual(1, deltasResult.removedEdges.length);
      });

    });
    
    it('should not emit an event when no deltas are found.', function() {
      // Arrange
      var eventNameResult = '';
      var idResult = '';
      var deltasResult = { };
      const bus = {
        emit (name, id, deltas) {
          eventNameResult = name;
          idResult = id;
          deltasResult  = deltas;
        }
      }

      const queryRepository = {
        queries: [{
          id: '1',
          results: {
            nodes: [ { id: 1 }, { id: 2 }, { id: 3 } ],
            edges: [ { id: 1 }, { id: 2 }, { id: 3 } ]
          },
        }]
      };

      const dataSource = {
        addQueryToQueue(query, next) {
          return new Promise((resolve, reject) => {
            if (query.id === '1') {
              next({
                nodes: [ { id: 1 }, { id: 2 }, { id: 3 } ],
                edges: [ { id: 1 }, { id: 2 }, { id: 3 } ]
              });
              
            }
          });
        }
      };
      
      const testSentinel = sentinel(queryRepository, dataSource, bus);
      
      // Act
      testSentinel.patrol().then(() => {
        // Assert
        assert.strictEqual('', eventNameResult);
      });
    });
  });

  describe('#getArrayDiff()', function() {
    const testSentinel = sentinel();
    it('should detect additions.', function() {
      const oldSet = [ { id: 1 }, { id: 2 }, { id: 3 } ];
      const newSet = [ { id: 1 }, { id: 2 }, { id: 3 }, { id: 5 } ];
      const result = testSentinel.getArrayDiff(oldSet, newSet);
      assert.strictEqual(5, result.added[0].id);
    });
    it('should detect removal.', function() {
      const oldSet = [ { id: 1 }, { id: 2 }, { id: 3 } ];
      const newSet = [ { id: 1 }, { id: 2 } ];
      const result = testSentinel.getArrayDiff(oldSet, newSet);
      assert.strictEqual(3, result.removed[0].id);
    });
  });
  describe('#getDeltas()', function() {
    const testSentinel = sentinel();
    it('should detect the addition of nodes.', function() {
      const old = {
        nodes: [ { id: 1 }, { id: 2 }, { id: 3 } ],
        edges: [ { id: 1 }, { id: 2 }, { id: 3 } ]
      };
      const niew = {
        nodes: [ { id: 1 }, { id: 3 }, { id: 5 } ],
        edges: [ { id: 1 }, { id: 3 }, { id: 5 } ]
      };
      const result = testSentinel.getDeltas(old, niew);
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
      const result = testSentinel.getDeltas(old, niew);
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
      const result = testSentinel.getDeltas(old, niew);
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
      const result = testSentinel.getDeltas(old, niew);
      assert.strictEqual(2, result.removedEdges[0].id);
    });
  });
});