(function() {
  var TIME_TO_LIVE_KEY = '_ttl_';
  
  if(!mdoq) throw new Error('you must include mdoq before mdoq.offline');

  mdoq.offline = function(options) {
    var settings = $.extend({
      ttl: false,
      connectionTimeout: 16000
    }, options);

    return function(req, res, next, end) {
      
      var method = req.method
        , key = req.method + '-' + req.url + '-' + ((req.query && JSON.stringify(req.query)) || '')
      ;
      
      // if a ttl is provided, cache all GET responses
      if(settings.ttl && req.method === 'GET') {
        end(function(req, res, next) {
          if(res.body) {
            
            // save the response in the cache
            storage.save({key: key, val: res.body}, function() {
              next();
            });
            
            // determine the max time where this cache is valid
            var max = (new Date()).getTime() + settings.ttl;
            
            // update the ttl of the current req's key
            storage.get(TIME_TO_LIVE_KEY, function(ttls) {
              ttls = ttls || {key: TIME_TO_LIVE_KEY};

              ttls[key] = max;

              storage.save(ttls);
            })
          } else {
            // dont cache without a req.body
            next();
          }
        });
        
        // get the current req from cache
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
              res.body = result.val;
            }
            
            next();
          })
        })
      } else {
        next();
      }
    }
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
        }
    });
    
    return this;
  };
  
  mdoq.pending = function(fn) {
    storage.get
  };
  
})()