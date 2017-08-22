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
     *         description: The type of node at the start of the hyperlink relationship
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
     *       200:
     *         description: Successfully created
     */
    app.post('/hyperlinkQueries', function (req, res) {
      //TODO validate request.
      const query = queryFactory.buildHyperlinkQuery(req.body);
      query.converter = dataSource.convertToGraphJSON;
      dataSource.runQuery(query, (result) => {
        query.results = result;
        queryRepository.save(query);
        res.json(query);
      });
    });

    app.listen(3000, function () {
      console.log('App up on port 3000.');
    });
  }
}