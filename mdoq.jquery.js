(function() {  
  if(!mdoq) throw new Error('you must include mdoq before mdoq.jquery');
  if(!$ || !jQuery) throw new Error('you must include jQuery before mdoq.jquery')

  function mime(req) {
    var str = req.headers['content-type'];
    
    if(!str && typeof (req.body || req.data) == 'object') str = 'application/json';
     
    return str;
  }
  
  function serialize(req) {
    var data = req.body || req.data
      , contentType = mime(req);
    
    if(typeof data != 'string' && contentType && contentType.indexOf('json') > -1) {
      data = JSON.stringify(data);
    }
    
    return data;
  }

  mdoq.jquery = function(options) {
    var settings = $.extend({
      // defaults
    }, options);
    
    return function(req, res, next) {
      var query = req.query
        , queryArr = []
        , queryStr = ''
        , key
      ;
      
      for(key in query) {
        if(query.hasOwnProperty(key) && query[key] && typeof query[key] != 'function') {
          if(typeof (val = query[key]) != 'string') val = JSON.stringify(val);
          queryArr.push(key + '=' + encodeURI(val));
        }
      }
      
      if(!res.body) {
        $.ajax($.extend(settings, {
          url: req.url + (queryArr.length ? ('?' + queryArr.join('&')) : ''),
          data: serialize(req),
          type: req.method,
          contentType: mime(req),
          success: function(data, textStatus, jqXHR) {
            res.body = res.data = data;
            next();
          },
          error: function(jqXHR, textStatus, errorThrown) {
            next(errorThrown);
          }
        }))
      }
    }
  }
})()

// JSON dependency via closure compiler
function g(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
else if("function"==b&&"undefined"==typeof a.call)return"object";return b};function h(a){a=""+a;if(/^\s*$/.test(a)?0:/^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x10-\x1f\x80-\x9f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,"")))try{return eval("("+a+")")}catch(b){}throw Error("Invalid JSON string: "+a);}function i(a,b){var c=[];j(new k(b),a,c);return c.join("")}function k(a){this.a=a}
function j(a,b,c){switch(typeof b){case "string":l(b,c);break;case "number":c.push(isFinite(b)&&!isNaN(b)?b:"null");break;case "boolean":c.push(b);break;case "undefined":c.push("null");break;case "object":if(null==b){c.push("null");break}if("array"==g(b)){var f=b.length;c.push("[");for(var d="",e=0;e<f;e++)c.push(d),d=b[e],j(a,a.a?a.a.call(b,""+e,d):d,c),d=",";c.push("]");break}c.push("{");f="";for(e in b)Object.prototype.hasOwnProperty.call(b,e)&&(d=b[e],"function"!=typeof d&&(c.push(f),l(e,c),c.push(":"),
j(a,a.a?a.a.call(b,e,d):d,c),f=","));c.push("}");break;case "function":break;default:throw Error("Unknown type: "+typeof b);}}var m={'"':'\\"',"\\":"\\\\","/":"\\/","\u0008":"\\b","\u000c":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},n=/\uffff/.test("\uffff")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g;
function l(a,b){b.push('"',a.replace(n,function(a){if(a in m)return m[a];var b=a.charCodeAt(0),d="\\u";16>b?d+="000":256>b?d+="00":4096>b&&(d+="0");return m[a]=d+b.toString(16)}),'"')};window.JSON||(window.JSON={});"function"!==typeof window.JSON.stringify&&(window.JSON.stringify=i);"function"!==typeof window.JSON.parse&&(window.JSON.parse=h);