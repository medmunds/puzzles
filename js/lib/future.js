// Implementations of features that have been 
// standardized in future versions of JavaScript.
//
// These are all ECMAScript 5th Edition, unless noted.

// Array.isArray(obj) [Array class method]
// Returns true if a variable is an array, false if it is not.
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray

if (!Array.isArray)
{
    Array.isArray = function(o) { return Object.prototype.toString.call(o) === '[object Array]'; };
}


// array.indexOf(searchElement[, fromIndex])
// Returns the first index at which a given element can be found in the array, or -1 if it is not present.
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf

if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(searchElement /*, fromIndex */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0)
      return -1;

    var n = 0;
    if (arguments.length > 0)
    {
      n = Number(arguments[1]);
      if (n !== n) // shortcut for verifying if it's NaN
        n = 0;
      else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0))
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }

    if (n >= len)
      return -1;

    var k = n >= 0
          ? n
          : Math.max(len - Math.abs(n), 0);

    for (; k < len; k++)
    {
      if (k in t && t[k] === searchElement)
        return k;
    }
    return -1;
  };
}


// array.lastIndexOf(searchElement[, fromIndex])
// Returns the last index at which a given element can be found in the array, or -1 if it is not present. 
// The array is searched backwards, starting at fromIndex.
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf

if (!Array.prototype.lastIndexOf)
{
  Array.prototype.lastIndexOf = function(searchElement /*, fromIndex*/)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0)
      return -1;

    var n = len;
    if (arguments.length > 1)
    {
      n = Number(arguments[1]);
      if (n !== n)
        n = 0;
      else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0))
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }

    var k = n >= 0
          ? Math.min(n, len - 1)
          : len - Math.abs(n);

    for (; k >= 0; k--)
    {
      if (k in t && t[k] === searchElement)
        return k;
    }
    return -1;
  };
}


// array.filter(callback[, thisObject])
// Creates a new array with all elements that pass the test implemented by the provided function.
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter

if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
      {
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t))
          res.push(val);
      }
    }

    return res;
  };
}


// array.forEach(callback[, thisObject])
// Executes a provided function once per array element.
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach

if (!Array.prototype.forEach)
{
  Array.prototype.forEach = function(fun /*, thisp */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
        fun.call(thisp, t[i], i, t);
    }
  };
}


// array.every(callback[, thisObject])
// Tests whether all elements in the array pass the test implemented by the provided function.
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every

if (!Array.prototype.every)
{
  Array.prototype.every = function(fun /*, thisp */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t && !fun.call(thisp, t[i], i, t))
        return false;
    }

    return true;
  };
}

// array.map(callback[, thisObject])
// Creates a new array with the results of calling a provided function on every element in this array.
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map

if (!Array.prototype.map)
{
  Array.prototype.map = function(fun /*, thisp */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
        res[i] = fun.call(thisp, t[i], i, t);
    }

    return res;
  };
}


// array.some(callback[, thisObject])
// Tests whether some element in the array passes the test implemented by the provided function.
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some

if (!Array.prototype.some)
{
  Array.prototype.some = function(fun /*, thisp */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t && fun.call(thisp, t[i], i, t))
        return true;
    }

    return false;
  };
}


// array.reduce(callback[, initialValue])
// Apply a function against an accumulator and each value of the array (from left-to-right) as to reduce it to a single value.
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/Reduce

if (!Array.prototype.reduce)
{
  Array.prototype.reduce = function(fun /*, initialValue */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    // no value to return if no initial value and an empty array
    if (len == 0 && arguments.length == 1)
      throw new TypeError();

    var k = 0;
    var accumulator;
    if (arguments.length >= 2)
    {
      accumulator = arguments[1];
    }
    else
    {
      do
      {
        if (k in t)
        {
          accumulator = t[k++];
          break;
        }

        // if array contains no values, no initial value to return
        if (++k >= len)
          throw new TypeError();
      }
      while (true);
    }

    while (k < len)
    {
      if (k in t)
        accumulator = fun.call(undefined, accumulator, t[k], k, t);
      k++;
    }

    return accumulator;
  };
}


// array.reduceRight(callback[, initialValue])
// Apply a function simultaneously against two values of the array (from right-to-left) as to reduce it to a single value.
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/ReduceRight

if (!Array.prototype.reduceRight)
{
  Array.prototype.reduceRight = function(callbackfn /*, initialValue */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof callbackfn !== "function")
      throw new TypeError();

    // no value to return if no initial value, empty array
    if (len === 0 && arguments.length === 1)
      throw new TypeError();

    var k = len - 1;
    var accumulator;
    if (arguments.length >= 2)
    {
      accumulator = arguments[1];
    }
    else
    {
      do
      {
        if (k in this)
        {
          accumulator = this[k--];
          break;
        }

        // if array contains no values, no initial value to return
        if (--k < 0)
          throw new TypeError();
      }
      while (true);
    }

    while (k >= 0)
    {
      if (k in t)
        accumulator = callbackfn.call(undefined, accumulator, t[k], k, t);
      k--;
    }

    return accumulator;
  };
}


// Object.create(proto [, propertiesObject ])
// Creates a new object with the specified prototype object and properties.
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create
// Note: the future implementation below doesn't handle propertiesObject
// Implementation: from Douglas Crockford's "JavaScript: The Good Parts" presentation

if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}


// Object.getPrototypeOf(object) [class method on Object]
// Returns the prototype of the specified object.
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/GetPrototypeOf
// Implementation: http://ejohn.org/blog/objectgetprototypeof/

if ( typeof Object.getPrototypeOf !== "function" ) {
  if ( typeof "test".__proto__ === "object" ) {
    Object.getPrototypeOf = function(object){
      return object.__proto__;
    };
  } else {
    Object.getPrototypeOf = function(object){
      // May break if the constructor has been tampered with
      return object.constructor.prototype;
    };
  }
}


// Object.keys(obj)
// Returns an array of all own enumerable properties found upon a given object, 
// in the same order as that provided by a for-in loop 
// (without enumerating up the prototype chain)
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys

if (!Object.keys) {
    Object.keys = function(o){
        if (o !== Object(o))
            throw new TypeError('Object.keys called on non-object');
        var ret=[],p;
        for(p in o) if(Object.prototype.hasOwnProperty.call(o,p)) ret.push(p);
        return ret;
    };    
} 


// fun.bind(thisArg[, arg1[, arg2[, ...]]])
// Creates a new function that, when called, itself calls this function in the context of the provided this value, 
// with a given sequence of arguments preceding any provided when the new function was called.
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
// Note: if you use the 'new' operator with bound functions created with this future implementation,
// the resulting instances won't work properly with the 'instanceof' operator.

if ( !Function.prototype.bind ) {
  Function.prototype.bind = function( obj ) {
    var slice = [].slice,
        args = slice.call(arguments, 1), 
        self = this, 
        nop = function () {}, 
        bound = function () {
          return self.apply( this instanceof nop ? this : ( obj || {} ), 
                              args.concat( slice.call(arguments) ) );    
        };

    nop.prototype = self.prototype;

    bound.prototype = new nop();

    return bound;
  };
}

