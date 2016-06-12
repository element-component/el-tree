var path = require('path');
var cooking = require('cooking');

cooking.set({
  entry: {
    app: './example/entry.js',
    vendor: ['vue']
  },
  dist: './dist',
  template: './example/index.tpl',

  devServer: {
    port: 8080,
    publicPath: '/',
    log: false
  },

  // production
  clean: true,
  hash: true,
  sourceMap: true,
  chunk: 'vendor',
  publicPath: '/',
  assetsPath: 'static',
  urlLoaderLimit: 10000,
  extractCSS: '[name].[contenthash:7].css',
  extends: ['vue', 'lint', 'saladcss']
});

cooking.add('resolve.alias', {
  'src': path.join(__dirname, 'src')
});

module.exports = cooking.resolve();
