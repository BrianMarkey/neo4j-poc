const fs = require('file-system');

module.exports = () => {
  return {
    createData(settings) {
      const numberOfIps = settings.totalNodes / 2
      const numberOfDomains = settings.totalNodes - numberOfIps;

      const nodes = this.createNodes(numberOfIps, numberOfDomains);
      const relationships = this.createRelationships(nodes, settings);

      return { nodes, relationships };
    },

    createRelationships(nodes, settings) {
      const result = {
        hyperLinks: [],
        dnsLinks:[]
      };

      const allNodes = nodes.ipAddresses.concat(nodes.domains);
      nodes.domains.forEach((thisDomain) => {
        const numberOfHyperlinks = this.getRandomIntFromRange(settings.minHyperlinks, settings.maxHyperlinks);
        const numberOfDNSLinks = this.getRandomIntFromRange(settings.minIPAdressesPerDomain, settings.maxIPAdressesPerDomain);
        [].push.apply(result.dnsLinks, this.creatRelationshipsForNode(thisDomain, nodes.ipAddresses, numberOfDNSLinks, 'DNS_LINK_TO'));
        const hyperLinks = this.creatRelationshipsForNode(thisDomain, allNodes, numberOfHyperlinks, 'HYPERLINK_TO');
        hyperLinks.forEach((hyperLink) => {
          result.hyperLinks.push(hyperLink);
        });
      });
      nodes.ipAddresses.forEach((thisIPaddress) => {
        const numberOfDNSLinks = this.getRandomIntFromRange(settings.minDomainsPerIPAddress, settings.maxDomainsPerIPAddress);
        const numberOfHyperlinks = this.getRandomIntFromRange(settings.minHyperlinks, settings.maxHyperlinks);
        [].push.apply(result.dnsLinks, this.creatRelationshipsForNode(thisIPaddress, nodes.domains, numberOfDNSLinks, 'DNS_LINK_TO'));
        const hyperLinks = this.creatRelationshipsForNode(thisIPaddress, allNodes, numberOfHyperlinks, 'HYPERLINK_TO');
        hyperLinks.forEach((hyperLink) => {
          result.hyperLinks.push(hyperLink);
        });
      });
      return result;
    },

    creatRelationshipsForNode(fromNode, otherNodes, count, type) {
      const result = [];
      for (var i = 0; i < count; i++) {
        // TODO prevent linking the same node
        const nodeIndex = this.getRandomIntFromRange(0, otherNodes.length - 1);
        result.push(this.buildRelationship(fromNode, otherNodes[nodeIndex], type));
      }

      return result;
    },

    createNodes(numberOfIps, numberOfDomains) {
      const result = {
        ipAddresses: [],
        domains: []
      }
      for (var i = 0; i < numberOfIps; i++) {
        const ipAddress = this.buildIpAddressFromIndex(i);
        result.ipAddresses.push(ipAddress);
      }
      for (var i = 0; i < numberOfDomains; i++) {
        const domainName = this.buildDomainNameFromIndex(i)
        result.domains.push(domainName);
      }

      return result;
    },

    buildRelationship(fromNode, toNode, relationshipType) {
      return { 
        relationshipType: relationshipType,
        fromDomainId: fromNode.nodeType === 'DOMAIN' ? fromNode.id : '',
        toDomainId: toNode.nodeType === 'DOMAIN' ? toNode.id : '',
        toIPAddressId: toNode.nodeType === 'IP_ADDRESS' ? toNode.id : '',
        fromIPAddressId: fromNode.nodeType === 'IP_ADDRESS' ? fromNode.id : ''
      };
    },

    buildDomainNameFromIndex(index)
    {
      var name = index + 1 + '.com';
      return {
        id: index,
        nodeType: 'DOMAIN',
        domainName: name
      };
    },

    buildIpAddressFromIndex(index) {
      const firstOctet = this.getRandomIntFromRange(0, 255);
      const secondOctet = this.getRandomIntFromRange(0, 255);
      const thirdOctet = this.getRandomIntFromRange(0, 255);
      const fourthOctet = this.getRandomIntFromRange(0, 255);
      const ipAddressString = `${firstOctet}.${secondOctet}.${thirdOctet}.${fourthOctet}`;
      return {
        id: index,
        nodeType: 'IP_ADDRESS',
        ipAddress: ipAddressString
      };
    },

    getRandomIpAddress() {
      var ipAddressString = '';
      for (var i = 0; i < 4; i++) {
        ipAddressString += '.' + this.getRandomIntFromRange(0, 255);
      }
      return ipAddressString.substr(1);
    },
    
    getRandomIntFromRange(min,max)
    {
      return Math.floor(Math.random() * (max - min + 1) + min);
    },

    createCSVText(nodes) {
      var result = '';
      var firstRow = '';
      var columnNames = [];

      Object.keys(nodes[0]).forEach((key) => {
        columnNames.push(key);
        firstRow += ',' + key;
      });

      result += firstRow.substr(1) + '\n';

      nodes.forEach((node) => {
        var row = '';
        columnNames.forEach((key) => {
          row += ',' + node[key];
        });
        result += row.substr(1) + '\n';
      });

      return result;
    },

    saveFiles(data) {
      // Domains
      this.saveFile('domains.csv', this.createCSVText(data.nodes.domains));
      // IP addresses
      this.saveFile('ip-addresses.csv', this.createCSVText(data.nodes.ipAddresses));

      // IP to IP relationships
      this.saveFile('hyperlinks.csv', this.createCSVText(data.relationships.hyperLinks));
      // Domain to IP relationships
      this.saveFile('dns-links.csv', this.createCSVText(data.relationships.dnsLinks));
    },

    saveFile(fileName, csvString) {
      fs.writeFileSync(fileName, csvString);
    }
  }
}