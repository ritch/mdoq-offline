var cache = mdoq
  .use(mdoq.jquery())
  .use(mdoq.offline({ttl: 1000}))
  .use('/mirror')
;

var cachedResponse;

var obj = {
      str: 'string',
      num: 999999999,
      arr: [1, [2], 'three', {four: 4}]
    }
;

describe('Clean', function(){
  it('should clean up any old data', function(done){
    Lawnchair(function(storage) {
      storage.nuke(function() {
        done();
      })
    })
  })
})

describe('Online', function(){
    
  describe('mdoq.post([data], [callback])', function(){
    it('should create a new object', function(done){
      cache.post(obj, function(err, res) {
        expect(res).to.be.a('object');
        done(err);
      });
    })
  })
  
  describe('mdoq.put([data], [callback])', function(){
    it('should put the object', function(done){
      cache.get(obj).put({created: (new Date()).getTime()}, function(err, res) {
        expect(res).to.be.a('object');
        done(err);
      });
    })
  })
  
  describe('mdoq.update([data], [callback])', function(){
    it('should update the object', function(done){
      cache.get(obj).update({updated: true}, function(err, res) {
        expect(res).to.be.a('object');
        done(err);
      });
    })
  })
  
  describe('mdoq.get([data], [callback])', function(){
    it('should get the object', function(done){
      cache.get(obj, function(err, res) {
        expect(res).to.be.a('object');
        cachedResponse = res;
        done(err);
      })
    })
  })
  
  describe('mdoq.del([data | id], [callback])', function(){
    it('should remove the object', function(done) {
      cache.get(obj).del(function(err, res) {
        expect(res).to.be.a('object');
        done(err);
      })
    })
  })
  
})

var offline = mdoq
  .use(mdoq.offline({ttl: 1000, connectionTimeout: 300}))
  .use('/mirror')
;

describe('Offline', function() {
  describe('Cache', function(){
    it('should still respond with the cached version', function(done){
      offline.get(obj, function(err, res) {
        expect(res).to.eql(cachedResponse);

        done();
      });
    })

    it('should not respond with the cached version after the ttl expires', function(done){
      setTimeout(function() {
        offline.get(obj, function(err, res) {
          expect(res).to.not.exist;
          done();
        })
      }, 1100)
    })
  })
  
  describe('Server', function(){
    it('should shutdown after requesting /kill', function(done){
      $.get('/kill', function() {
        done();
      })
    })
    
    it('should not respond', function(done){
      
      var req = $.get('/mirror', function(res) {
        if(res) throw Error('the server is still up... oops!');
      });
      
      setTimeout(function() {
        req.abort();
        
        done();
      }, 300);
    })
  })
  
  describe('Detection', function(){
    it('should accurately respond with offline after killing the server', function(done){
      mdoq.isConnected(1500, function(isConnected) {
        expect(isConnected).to.not.exist;
        done();
      })
    })
  })
  
  var sampleData = [
    {testing: 1, created: (new Date()).getTime()},
    {testing: 2, foo: [1,2,3], bar: 983474938734978},
    {testing: 3, nested: [{a: 'b'}]}
  ];
  
  describe('Queue', function(){
    it('should queue first non-read operation locally', function(done){
      this.timeout(3000);
      offline.post(sampleData[0], done);
    })
    
    it('should queue second non-read operation locally', function(done){
      this.timeout(3000);
      offline.post(sampleData[1], done);
    })
    
    it('should queue third non-read operation locally', function(done){
      this.timeout(3000);
      offline.post(sampleData[2], done);
    })
    
    it('should have three pending writes', function(done){      
      offline.hasPending(function(count) {          
        expect(count).to.equal(3);
        done();
      })
    })
  })
  
  describe('Reset', function(){
    it('should allow the server to respond again', function(done){
      $.get('/reset', function() {
        $.get('/data', function(res) {
          expect(res).to.exist;
          done()
        });
      })
    })
  })
  
  describe('Sync', function(){
    it('should automatically clear out the pending writes', function(done){
      this.timeout(5000);
      var interval = setInterval(function() {
        offline.hasPending(function(count) {
          if(count === 0) {
            clearInterval(interval);
            done();
          }
        })
      }, 1000);
    })
    
    it('should have saved all data to the server', function(done){
      $.getJSON('/data', function(res) {
        expect(res.length).to.equal(3);
        expect(res).to.eql(sampleData);
        done();
      })
    })
  })
})
