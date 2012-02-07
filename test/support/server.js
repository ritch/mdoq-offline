var express = require('express')
  , app = express.createServer();

app.use(express.bodyParser());

app.all('/mirror', function(req, res) {  
  res.send({
    query: req.query,
    body: req.body,
    method: req.method
  });
});

app.get('/kill', function(req, res) {
  res.send('goodbye cruel world :(');
  
  process.kill();
})

app.use(express.static(__dirname + '/../'));


app.use('/src', express.static(__dirname + '/../../'));

app.listen(3000);

console.info('listening on 3000');