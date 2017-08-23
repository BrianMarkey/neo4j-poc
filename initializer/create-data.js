const fakeDataFactory = require('../utils/fake-data-factory.js')();
const fs = require('file-system');

const settings = {
  totalNodes: 100000,
  minIPAdressesPerDomain: 1,
  maxIPAdressesPerDomain: 5,
  minDomainsPerIPAddress: 0,
  maxDomainsPerIPAddress: 10,
  minHyperlinks: 0,
  maxHyperlinks: 10
}

const data = fakeDataFactory.createData(settings);

// Domains
fs.writeFileSync('db/import/domains.csv', fakeDataFactory.createCSVText(data.nodes.domains));
// IP addresses
fs.writeFileSync('db/import/ip-addresses.csv', fakeDataFactory.createCSVText(data.nodes.ipAddresses));

// IP to IP relationships
fs.writeFileSync('db/import/hyperlinks.csv', fakeDataFactory.createCSVText(data.relationships.hyperLinks));
// Domain to IP relationships
fs.writeFileSync('db/import/dns-links.csv', fakeDataFactory.createCSVText(data.relationships.dnsLinks));