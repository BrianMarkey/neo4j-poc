const express = require('express');
const app = express();
const request = require('request');
const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');
const bodyParser = require('body-parser');
const queryFactory = require('./query-factory');

module.exports = {
  start(queryRepository, dataSource) {
    var options = {
      swaggerDefinition: {
        info: {
          title: 'Neo4j Demo',
          version: '0.0.1',
          description: 'Provide API access to a Neo4j database.',
        },
        host: 'localhost:3000',
        basePath: '/',
      },
      apis: [path.join(__dirname, 'api.js')],
    };

    var swaggerSpec = swaggerJSDoc(options);

    app.use(bodyParser.json());  
    app.use(express.static(path.join(__dirname, 'static')));

    app.get('/swagger.json', function(req, res) {
      res.json(swaggerSpec);
    });

    /**
     * @swagger
     * /api/v1/hyperlinkQueries:
     *   post:
     *     tags:
     *       - HyperlinkQuery
     *     description: Creates an observable query of hyperlinks and their related nodes.
     *     produces:
     *       - application/json
     *     parameters:
     *       - label: name
     *         description: the name of the query
     *         in: body
     *         required: true
     *         type: string
     *       - name: startNodeType
     *         description: The type of node at the start of the hyperlink relationship. Valid values HYPERLINK.
     *         in: body
     *         required: false
     *         type: string
     *       - name: degreesOfSeparation
     *         description: The depth of the hyperlink query. The max is 5. The default is 3.
     *         in: body
     *         required: false
     *       - name: responseLimit
     *         description: The limit on the number of records to return. The max is 1000. The default is 100.
     *         in: body
     *         required: false
     *         type: string
     *     responses:
     *       201:
     *         description: Successfully created.
     *       400:
     *         description: The request body was invalid. The response body will contain the details.
     */
    app.post('/hyperlinkQueries', function (req, res) {
      // Validate the request.
      validatePOSTHyperlinkQueryRequest(req, (validationResult) => {
        if (validationResult.errors.length) {
          res.status(400).send(validationResult);
        }
        else {
          const query = queryFactory.buildHyperlinkQuery(req.body, dataSource.convertToGraphJSON);
          dataSource.runQuery(query, (result) => {
            // Update the query with the results.
            query.results = result;
            // Save the query for monitoring.
            queryRepository.save(query);
            // Return the query.
            res.status(201).json(query);
          });
        }
      });
    });

    app.listen(3000, function () {
      console.log('API up on port 3000.');
    });

    // Probably should use middleware for this.
    function validatePOSTHyperlinkQueryRequest(req, next){
      var result = {
        errors: []
      };
      console.log(req.body);
      if (!req.body || Object.keys(req.body).length === 0) {
         result.errors.push('A request body in a valid JSON format is required.');
      }
      else {
        if (!req.body.label) {
          result.errors.push('A label is required');
        }
        if (typeof(req.body.startNodeType) !== 'undefined'
            && req.body.startNodeType !== 'DOMAIN'
            && req.body.startNodeType !== 'HYPERLINK') {
          result.errors.push(`Invalid startNodeType: '${req.body.startNodeType}'`);
        }
        if (typeof(req.body.degreesOfSeparation) !== 'undefined') {
          const intValue = parseInt(req.body.degreesOfSeparation);
          if (!intValue)
            result.errors.push('degreesOfSeparation must be an int.');
          else if (intValue > 5 || intValue < 1)
            result.errors.push('degreesOfSeparation must be between 1 and 5.');
        }
        if (typeof(req.body.responseLimit) !== 'undefined') {
          const intValue = parseInt(req.body.responseLimit);
          if (!intValue)
            result.errors.push('responseLimit must be an int.');
          else if (intValue > 1000 || intValue < 1)
            result.errors.push('responseLimit must be between 1 and 1000.');
        }
      }
      next(result);
    }
  }
}