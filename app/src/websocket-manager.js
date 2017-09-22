// This file defines the part of the app
// which handles websocket communication
// with the UI.
// It allows clients to subscribe to queries in
// order to get notifications about changes to the
// results.
const WebSocket = require('ws');

// TODO: Add a start method.
module.exports = (port, bus) => {
  const wss = new WebSocket.Server({ port: port });
  // This is a map queries by id to websockets which
  // are subscribed to that query.
  const subscriptions = { };
  const manager = {
    handleMessage(ws, data) {
      var jsonData = null;
      try {
        jsonData = JSON.parse(data);
      } catch(err) {
        // If the JSON is invalid, give the client a hing.
        const errorResult = {
          message: 'I only speak JSON. ex: {"action": "SUBSCRIBE_TO_QUERY", "queryId": 1}'
        }
        ws.send(JSON.stringify(errorResult));
        return;
      }
      // Everything looks okay, so subscribe the client.
      if (jsonData.action === 'SUBSCRIBE_TO_QUERY') {
        if (!subscriptions[jsonData.queryId]) {
          subscriptions[jsonData.queryId] = [];
        }
        subscriptions[jsonData.queryId].push(ws);
      }
    }
  };
  // Set up the websocket server.
  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
      manager.handleMessage(ws, data);
    });
  });
  // Subscribe the the query_ResultsChanged event.
  // When query results change, look for subscribed clients
  // and send them the deltas.
  bus.on('query_ResultsChanged', (queryId, deltas) => {
    const subscriptionsForQuery = subscriptions[queryId];
    if (!subscriptionsForQuery)
      return;

    Object.keys(subscriptionsForQuery).forEach((key) =>{
      // TODO: check socket status before sending.
      subscriptionsForQuery[key].send(JSON.stringify(deltas));
    });
  });
}
