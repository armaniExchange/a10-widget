var path = require('path');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config.dev');
var proxy = require('http-proxy-middleware');

var app = express();
var compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath,
  stats: {
    colors: true
  }
}));

// Proxy to AXAPI server
app.use('/axapi', proxy({ target: 'https://192.168.99.54/', secure: false }));


app.use(require('webpack-hot-middleware')(compiler));

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3030, function (err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Listening at http://localhost:3030');
});
