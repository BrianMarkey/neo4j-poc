
const assert = require('assert');
const fakeDataFactory = require('../src/fake-data-factory.js')();

 describe('fakeDataFactory', function() {
  describe('#createRelationships()', function() {
    it('should create the right number of dns links for ip addresses.', function() {
      const settings = {
        totalNodes: 10,
        minIPAdressesPerDomain: 0,
        maxIPAdressesPerDomain: 0,
        minDomainsPerIPAddress: 1,
        maxDomainsPerIPAddress: 1,
        minHyperlinks: 0,
        maxHyperlinks: 0
      }

      const nodes = {
        ipAddresses: [
          {
            id: 1,
            nodeType: 'IP_ADDRESS',
            ipAddress: '1.1.1.1'
          }
        ],
        domains: [
          { 
            id: 2,
            nodeType: 'DOMAIN',
            domainName: 'fddadf'
          }
        ]
      };

      const result = fakeDataFactory.createRelationships(nodes, settings);

      assert.strictEqual(1, result.dnsLinks.length);

      result.dnsLinks.forEach((relationship) => {
        assert.equal('DNS_LINK_TO', relationship.relationshipType);
      });
    });
  });

  describe('#createRelationships()', function() {
    it('should create the right number of dns links for domains.', function() {
      const settings = {
        totalNodes: 10,
        minIPAdressesPerDomain: 1,
        maxIPAdressesPerDomain: 1,
        minDomainsPerIPAddress: 0,
        maxDomainsPerIPAddress: 0,
        minHyperlinks: 0,
        maxHyperlinks: 0
      }
      const nodes = {
        ipAddresses: [
          {
            id: 1,
            nodeType: 'IP_ADDRESS',
            ipAddress: '1.1.1.1'
          }
        ],
        domains: [
          { 
            id: 2,
            nodeType: 'DOMAIN',
            domainName: 'fddadf'
          }
        ]
      };

      const result = fakeDataFactory.createRelationships(nodes, settings);

      assert.strictEqual(1, result.dnsLinks.length);

      result.dnsLinks.forEach((relationship) => {
        assert.strictEqual('DNS_LINK_TO', relationship.relationshipType);
      });
    });
  });
  
  describe('#createNodes()', function() {
    it('should create the correct number of domains.', function() {
      const numberOfDomains = 10;

      const result = fakeDataFactory.createNodes(0, numberOfDomains);

      assert.strictEqual(numberOfDomains, result.domains.length);
    });
  });
  
  describe('#createNodes()', function() {
    it('should create the correct number of ip addresses.', function() {
      const numberOfIPs = 10;

      const result = fakeDataFactory.createNodes(numberOfIPs, 0);

      assert.strictEqual(numberOfIPs, result.ipAddresses.length);
    });
  });
  
  describe('#buildRelationship()', function() {
    it('should set the relationship from property name to domainId when the from node is a domain.', function() {
      const node1 = {
        id: 1,
        nodeType: 'DOMAIN',
        domainName: 'testdomain'
      };
      const node2 = {
        id: 2,
        nodeType: 'IP_ADDRESS',
        ipAddress: '1.1.1.1'
      };
      const hyperLink = fakeDataFactory.buildRelationship(node1, node2, 'HYPERLINK_TO');
      assert(hyperLink.hasOwnProperty('fromDomainId'));
    });
  });

  describe('#getRandomIpAddress()', function() {
    it('should create a valid ip address.', function() {
      const ipAddress = fakeDataFactory.getRandomIpAddress();
      const pattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/;
      assert(ipAddress.match(pattern));
    });
  });

  describe('#createCSVText()', function() {
    it('should .', function() {
      const nodes =  [{
          id: 1,
          nodeType: 'IP_ADDRESS',
          ipAddress: '1.1.1.1'
        }];

      const val = fakeDataFactory.createCSVText(nodes);
      const expectedFirstRow = 'id,nodeType,ipAddress\n';

      assert.strictEqual(expectedFirstRow, val.substr(0, expectedFirstRow.length));
    });
  });

});