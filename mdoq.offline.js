(function() {
  var TIME_TO_LIVE_KEY = '_ttl_';
  
  if(!mdoq) throw new Error('you must include mdoq before mdoq.offline');

  mdoq.offline = function(options) {
    var settings = $.extend({
      ttl: false,
      connectionTimeout: 16000
    }, options);

    return function(req, res, next, end) {      
      end(function(req, res, next) {
        // if we recieved a response, use it
        if(res.body && !res._cached) {
          if(req.method === 'GET') {
            var key = hash(req);
            
            // cache it
            storage.save({key: key, data: res.body}, function() {
              storage.get(TIME_TO_LIVE_KEY, function(ttls) {
                // max time to live
                var max = (new Date()).getTime() + settings.ttl;
                
                // update the time to live for the cached value
                ttls = ttls || {key: TIME_TO_LIVE_KEY};
                ttls[key] = max;
                storage.save(ttls);
                
                next();
              })
            });
          } else {
            next();
          }
        } else {
          mdoq.isConnected(function(isConnected) {
            if(isConnected) {
              // there was not a response
              // and we are connected
              // keep going...
              next();
            } else {
              var key = hash(req)
                , allowed = {POST:1, PUT:1, DELETE:1};
                
              // req.url is not allowed...
              req._url = req.url;
              
              if(req.method in allowed) {
                // record all POST, PUT, and DELETE
                req.key = key;
                
                storage.save(req, function() {
                  next();
                });
              }
            }
          })
        }
      });
      
      if(req.method === 'GET') {
        var key = hash(req);
        
        storage.get(key, function(result) {
          if(!result) return next();
          
          var now = (new Date()).getTime();
          
          // only retrieve items that are within their ttl  
          storage.get(TIME_TO_LIVE_KEY, function(ttls) {
            if(ttls && now > ttls[key]) {
              // cleanup the cache
              storage.remove(key);
            } else {
              // respond with cached data
              res.body = result.data;
              res._cached = true;
            }
            
            next();
          });
        })
      } else {
        next();
      }
    }
  }
  
  function hash(req) {
    var key = [req.method, req.url, JSON.stringify(req.query)];
    
    if(req.method != 'GET') {
      // all write keys should be unique
      key.push(Math.random().toString().substr(2));
    }
    
    return key.join('|');
  }
  
  var storage = Lawnchair(function() {});
  
  mdoq.isConnected = function(timeout, fn) {
    var served = window.location.toString()
      , buster = '?_________=' + (new Date()).getTime()
    ;

    if(!fn) {
        fn = timeout;
        timeout = false;
    }

    if(served.indexOf('?') > -1) {
      served = served.replace('?', buster + '&');
    } else {
      served += buster;
    }

    var timeout = setTimeout(function() {
        req.abort();
        fn();
    }, timeout || 2000);

    var req = $.get(served, function(res) {
        clearTimeout(timeout);

        if(res) {
          fn(true);
          if(sync) sync();
        }
    });
    
    return this;
  };

  
  // patch lawnchair...
  storage.keys = function(callback) {
    if (callback) this.lambda(callback).call(this, this.indexer.all())
  };
  
  mdoq.hasPending = function(fn) {
    storage.keys(function(keys) {
      var key, pending = 0;
      
      while(keys && (key = keys.shift())) {
        switch(key.split('|')[0]) {
          case 'POST':
          case 'PUT':
          case 'DELETE':
            pending++;
          break;
        }
      }
      
      fn(pending);
    });
    
    return this;
  }
  
  mdoq.synced = function(fn) {
    if(fn) this._synced = fn;
    else if(this._synced) this._synced.call(this, true);
    return this;
  }
  
  mdoq.pending = function(fn) {
    storage.keys(function(keys) {
      var key;
      
      while(keys && (key = keys.shift())) {
        switch(key.split('|')[0]) {
          case 'POST':
          case 'PUT':
          case 'DELETE':
            storage.get(key, function(req) {
              if(req) fn(req, req.key);
            });
          break;
        }
      }
    });
    
    return this;
  };
    
  var http = mdoq.use(mdoq.jquery());
  
  // sync
  function sync() {
    mdoq.pending(function(req, key) {
      req.url = req.url || req._url;
      
      http.exec(req, function(err, res) {
        if(res) {
          storage.remove(key, function() {
            mdoq.hasPending(function(count) {
              if(!count) mdoq.synced();
            })
          });
        }
      })
    })
  }
  
  var noChange = 0
    , prevAnswer;
  
  // keep connectivity up to date
  (function poll() {
    mdoq.isConnected(function(isConnected) {
      var timeout = isConnected
        ? 300
        : 100
      ;
      
      if(prevAnswer === (prevAnswer = isConnected)) {
        noChange++;
      } else {
        noChange = 0;
      }
      
      // reset the back off at intervals above 30s
      if(timeout > 30000) {
        timeout = 30000;
        prevAnswer = false;
      }
      
      // if we keep getting the same answer
      // stop asking so frequently
      timeout *= noChange;
      
      setTimeout(poll, timeout);
    })
  })()
  
})()


      
      // var method = req.method
      //   , key = req.method + '-' + req.url + '-' + ((req.query && JSON.stringify(req.query)) || '')
      // ;
      // 
      // // if a ttl is provided, cache all GET responses
      // if(settings.ttl && req.method === 'GET') {
      //   end(function(req, res, next) {
      //     if(res.body) {
      //       
      //       // save the response in the cache
      //       storage.save({key: key, val: res.body}, function() {
      //         next();
      //       });
      //       
      //       // determine the max time where this cache is valid
      //       var max = (new Date()).getTime() + settings.ttl;
      //       
      //       // update the ttl of the current req's key
      //       storage.get(TIME_TO_LIVE_KEY, function(ttls) {
      //         ttls = ttls || {key: TIME_TO_LIVE_KEY};
      // 
      //         ttls[key] = max;
      // 
      //         storage.save(ttls);
      //       })
      //     } else {
      //       // dont cache without a req.body
      //       next();
      //     }
      //   });
      //   
      //   // get the current req from cache
      //   storage.get(key, function(result) {
      //     if(!result) return next();
      //     
      //     var now = (new Date()).getTime();
      //     
      //     // only retrieve items that are within their ttl  
      //     storage.get(TIME_TO_LIVE_KEY, function(ttls) {
      //       if(ttls && now > ttls[key]) {
      //         // cleanup the cache
      //         storage.remove(key);
      //       } else {
      //         // respond with cached data
      //         res.body = result.val;
      //       }
      //       
      //       next();
      //     })
      //   })
      // } else {
      //   next();
      // }