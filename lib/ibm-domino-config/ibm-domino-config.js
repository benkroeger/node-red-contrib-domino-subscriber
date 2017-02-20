module.exports = (RED) => {
  function IbmDominoConfig(config) {
    RED.nodes.createNode(this, config);
    Object.assign(this, {
      username: config.username,
      password: config.password,
      url: config.url,
    });
  }

  RED.nodes.registerType('ibm-domino-config', IbmDominoConfig);
};
