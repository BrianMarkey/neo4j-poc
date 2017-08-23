const WebSocket = require('ws');

module.exports = (port, bus) => {
  const wss = new WebSocket.Server({ port: port });
  const subscriptions = { };
  const manager = {
    handleMessage(ws, data) {
      var jsonData = null;
      try {
        jsonData = JSON.parse(data);
      } catch(err) {
        // Tell the client what to do
        const errorResult = {
          message: 'I only speak JSON. ex: {"action": "SUBSCRIBE_TO_QUERY", "queryId": 1}'
        }
        ws.send(JSON.stringify(errorResult));
        return;
      }
      // Everything looks okay, so subscribe the client
      if (jsonData.action === 'SUBSCRIBE_TO_QUERY') {
        if (!subscriptions[jsonData.queryId]) {
          subscriptions[jsonData.queryId] = [];
        }
        subscriptions[jsonData.queryId].push(ws);
      }
    }
  };
  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
      manager.handleMessage(ws, data);
    });
  });
  // When query results change, look for subscribed clients
  // and send them the deltas.
  bus.on('query_ResultsChanged', (queryId, deltas) => {
    const subscriptionsForQuery = subscriptions[queryId];
    if (!subscriptionsForQuery)
      return;

    Object.keys(subscriptionsForQuery).forEach((key) =>{
      // todo check socket status
      subscriptionsForQuery[key].send(JSON.stringify(deltas));
    });
  });
}