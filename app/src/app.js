const express = require('express');
const app = express();
const request = require('request');
const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');
const gremlin = require('./gremlin');
const datasource = require('./datasource');

app.use(express.static(path.join(__dirname, 'static')));
const routePath = path.join(__dirname, 'app.js');

gremlin.causeTrouble();

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
  apis: [routePath],
};

var swaggerSpec = swaggerJSDoc(options);

app.get('/swagger.json', function(req, res) {
  res.json(swaggerSpec);
});

/**
 * @swagger
 * /api/v1/hyperlinks:
 *   post:
 *     tags:
 *       - Hyperlinks
 *     description: Creates an observable query of hyperlinks and their related nodes.
 *     produces:
 *       - application/json
 *     parameters:
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
app.get('/hyperlinks', function (req, res) {
  datasource.getHyperlinks((result) => {
    res.json(result);
  });
});

app.listen(3000, function () {
  console.log('App up on port 3000.');
});
