const url = require('url');
const request = require('request');
const { Router } = require('express');
const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

module.exports = (RED) => {
  function IbmDominoSubscribe(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    // Retrieve the config node
    const serverConfig = RED.nodes.getNode(config.server);
    const { topic, contextRoot } = config;

    const httpNode = RED.httpNode;
    const nodeRouter = new Router();

    nodeRouter.use(jsonParser);
    nodeRouter.post('/', (req, res, next) => {
      if (req.body) {
        node.send(req.body);
      }
      res.status(200).json({ status: 'received' });
      next();
    });
    httpNode.use(contextRoot, nodeRouter);

    request({
      method: 'POST',
      baseUrl: serverConfig.url,
      uri: config.dominoContextRoot,
      auth: {
        username: serverConfig.username,
        password: serverConfig.password,
      },
      json: true,
      body: {
        action: 'subscribe',
        topic,
        URL: url.resolve(config.publicUrl, contextRoot),
      },
    }, (err, response, body) => {
      if (err) {
        node.status({ fill: 'red', shape: 'dot', text: 'subscription failed' });
        return;
      }
      node.status({ fill: 'green', shape: 'dot', text: 'subscribed' });
    });

    node.on('close', () => {
      // unsubscribe from domino server events
      request({
        method: 'POST',
        baseUrl: serverConfig.url,
        uri: config.dominoContextRoot,
        auth: {
          username: serverConfig.username,
          password: serverConfig.password,
        },
        json: true,
        body: {
          action: 'unsubscribe',
          topic,
        },
      }, (err /* , response, body */) => {
        if (err) {
          node.status({ fill: 'red', shape: 'dot', text: 'unsubscribe failed' });
          return;
        }
        node.status({ fill: 'green', shape: 'ring', text: 'unsubscribed' });
      });
    });
  }

  RED.nodes.registerType('ibm-domino-subscribe', IbmDominoSubscribe);
};
