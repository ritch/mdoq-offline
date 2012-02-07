# mdoq-offline

A **browser** middleware for [mdoq](https://github.com/ritch/mdoq) that proxies http requests through a local persistence layer.

Allow your app to function **while your http api is down** or when the device is **unable to connect to the newtork**.

## What does it do?

**Mdoq** is a **browser** and **node.js** middleware executer compatible with **http**, **connect**, **express**, and **FlatIron**.

**Mdoq-offline** writes all of your application requests to a local persistence layer using [Lawnchair](http://westcoastlogic.com/lawnchair/).

Instead of implementing your own key value store or localStorage layer, simply proxy all of your requests to **mdoq** and it will take care of managing
connectivity, caching, and eventual consistency.

## Example

If we tried to post to the server while offline, we would most likely get a timeout or a 404.

    $.post('/my-url', {my: 'data'}, function(res) {
      if(res) {
        // it worked
      } else {
        // it didnt
      }
    })

This leaves it up to us to manage the eventual consistency of our post (or our writes).

**Mdoq-offline** allows you to proxy requests entirely, not having to clean them up or maintain consistency.
Heres an example implemented in **Backbone**.

    var api = mdoq.use(mdoq.offline({ttl: 60000})).use('/my-api')
      , map = {create: 'post', read: 'get', update: 'put', remove: 'del'}
    ;

    Backbone.sync = function(method, model) {
      api.use(model.url(model.id))[map[method]].call(api, function(err, res) {
        model.set(model.parse(res));
      });
    }
    
The simplest way to use **mdoq-offline** is with **mdoq**'s jQuery middleware. This will let you easily 
add and remove layers to your ajax requests and data persistence.

    var api = mdoq.use(mdoq.jquery).use('/my-api');

    api.post({my: 'data'}, function(err, res) {
      if(err) console.info('it didnt work...', err);
      else console.info('it worked!', res);
    });
    
It is very simple to add any middleware to **mdoq**. The following adds the local persistence to the `api` object.

    var maxAge = 60 * 1000 // 1 minute
      , api = mdoq.use(mdoq.jquery).use('/my-api');
      , cache = api.use(mdoq.offline({ttl: maxAge}));
    ;
    
    cache.post({my: 'data'}, function(err, res) {
      console.info(res, 'is always saved');
    });
    
To return any pending writes, call the `mdoq.pending` method with a callback.

    mdoq.pending(function(writes) {
      console.info(writes);
    });
    
## API

The following methods are exposed via **mdoq**:

 - get()
 - post()
 - put()
 - del()
 
See the **mdoq** [documentation](https://github.com/ritch/mdoq) for more details.