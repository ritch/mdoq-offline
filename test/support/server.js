var express = require('express')
  , app = express.createServer();

// for simulated death
var alive = true;

// for making sure data hit the server
var data = [];

app.use(function(req, res, next) {
  if(req.url === '/reset') {
    next();
  } else {
    alive && next();
  }
})

app.use(express.bodyParser());


app.all('/mirror', function(req, res) {
  data.push(req.body);
  res.send({
    query: req.query,
    body: req.body,
    method: req.method
  });
});

app.get('/kill', function(req, res) {
  alive = false;
  
  res.send('goodbye cruel world :(');
})

app.get('/reset', function(req, res) {
  alive = true;
  data = [];
  
  res.send('oh, hello :)');
})

app.get('/data', function(req, res) {
  res.send(data);
})

app.use(express.static(__dirname + '/../'));


app.use('/src', express.static(__dirname + '/../../'));

app.listen(3000);

console.info('listening on 3000');