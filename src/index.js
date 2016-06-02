const Tree = require('./tree');

module.exports = {
  Tree,
  install(Vue) {
    Vue.component('Tree', Tree);
  }
};
