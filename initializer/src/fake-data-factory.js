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
        domainToDomain: [],
        ipToDomain:[],
        domainToIP: [],
        ipToIP: []
      };

      const allNodes = nodes.ipAddresses.concat(nodes.domains);
      nodes.domains.forEach((thisDomain) => {
        const numberOfHyperlinks = this.getRandomIntFromRange(settings.minHyperlinks, settings.maxHyperlinks);
        const numberOfDNSLinks = this.getRandomIntFromRange(settings.minIPAdressesPerDomain, settings.maxIPAdressesPerDomain);
        [].push.apply(result.domainToIP, this.creatRelationshipsForNode(thisDomain, nodes.ipAddresses, numberOfDNSLinks, 'DNS_LINK_TO'));
        const hyperLinks = this.creatRelationshipsForNode(thisDomain, allNodes, numberOfHyperlinks, 'HYPERLINK_TO');
        hyperLinks.forEach((hyperLink) => {
          if (hyperLink.hasOwnProperty('toDomainId')){
            result.domainToDomain.push(hyperLink);
          }
          else {
            result.domainToIP.push(hyperLink);
          }
        });
      });
      nodes.ipAddresses.forEach((thisIPaddress) => {
        const numberOfDNSLinks = this.getRandomIntFromRange(settings.minDomainsPerIPAddress, settings.maxDomainsPerIPAddress);
        const numberOfHyperlinks = this.getRandomIntFromRange(settings.minHyperlinks, settings.maxHyperlinks);
        [].push.apply(result.ipToDomain, this.creatRelationshipsForNode(thisIPaddress, nodes.domains, numberOfDNSLinks, 'DNS_LINK_TO'));
        const hyperLinks = this.creatRelationshipsForNode(thisIPaddress, allNodes, numberOfHyperlinks, 'HYPERLINK_TO');
        hyperLinks.forEach((hyperLink) => {
          if (hyperLink.hasOwnProperty('toDomainId')){
            result.ipToDomain.push(hyperLink);
          }
          else {
            result.ipToIP.push(hyperLink);
          }
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
      var fromIdPropertyName = fromNode.nodeType === 'DOMAIN' ?
        'fromDomainId' : 'fromIPAddressId';
      var toIdPropertyName = toNode.nodeType === 'DOMAIN' ?
        'toDomainId' : 'toIPAddressId';
      const link = { 
        relationshipType: relationshipType
      };
      // TODO maybe dynamic property names here
      link[fromIdPropertyName] = fromNode.id;
      link[toIdPropertyName] = toNode.id;
      return link;
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
      const firstOctet = index >= (255 * 4) ? 255 : Math.max(0, index - 255 * 3);
      const secondOctet = index >= (255 * 3) ? 255 : Math.max(0, index - 255 * 2);
      const thirdOctet = index >= (255 * 2) ? 255 : Math.max(0, index - 255)
      const fourthOctet = index >= 255 ? 255 : index;
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

      console.log(nodes.length);

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
      this.saveFile('ip-to-ip.csv', this.createCSVText(data.relationships.ipToIP));
      // Domain to IP relationships
      this.saveFile('domain-to-ip.csv', this.createCSVText(data.relationships.domainToIP));
      // IP to domain relationships
      this.saveFile('ip-to-domain.csv', this.createCSVText(data.relationships.ipToDomain));
      // Domain to domain relationships
      this.saveFile('domain-to-domain.csv', this.createCSVText(data.relationships.domainToDomain));
    },

    saveFile(fileName, csvString) {
      fs.writeFileSync(fileName, csvString);
    }
  }
}