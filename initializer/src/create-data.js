const fakeDataFactory = require('../../utils/src/fake-data-factory.js')();
const fs = require('fs');

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
fs.writeFileSync('/initializer/data-to-import/domains.csv', fakeDataFactory.createCSVText(data.nodes.domains));
// IP addresses
fs.writeFileSync('/initializer/data-to-import/ip-addresses.csv', fakeDataFactory.createCSVText(data.nodes.ipAddresses));

// IP to IP relationships
fs.writeFileSync('/initializer/data-to-import/hyperlinks.csv', fakeDataFactory.createCSVText(data.relationships.hyperLinks));
// Domain to IP relationships
fs.writeFileSync('/initializer/data-to-import/dns-links.csv', fakeDataFactory.createCSVText(data.relationships.dnsLinks));
