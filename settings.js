const path = require('path');

module.exports = {
  nodesDir: ['config', 'subscribe'].map(name => path.resolve(__dirname, 'lib', `ibm-domino-${name}`)),
  // logging: 'debug',
};
