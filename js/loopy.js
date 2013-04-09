// --pre-js code for compiled games
Module.reexport_all_to_c(this);
// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
} catch(e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename).toString();
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename).toString();
    }
    return ret;
  };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  // Polyfill over SpiderMonkey/V8 differences
  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function(f) { snarf(f) };
  }
  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }
  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (/^\[\d+\ x\ (.*)\]/.test(type)) return true; // [15 x ?] blocks. Like structs
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = size;
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Types.types[field].alignSize;
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      alignSize = type.packed ? 1 : Math.min(alignSize, Runtime.QUANTUM_SIZE);
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func, sig) {
    //assert(sig); // TODO: support asm
    var table = FUNCTION_TABLE; // TODO: support asm
    var ret = table.length;
    table.push(func);
    table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE; // TODO: support asm
    table[index] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0; return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+3)>>2)<<2); return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 4))*(quantum ? quantum : 4); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? (((low)>>>(0))+(((high)>>>(0))*4294967296)) : (((low)>>>(0))+(((high)|(0))*4294967296))); return ret; },
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};
var ABORT = false;
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = globalScope['Module']['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP[ptr]=value; break;
      case 'i8': HEAP[ptr]=value; break;
      case 'i16': HEAP[ptr]=value; break;
      case 'i32': HEAP[ptr]=value; break;
      case 'i64': HEAP[ptr]=value; break;
      case 'float': HEAP[ptr]=value; break;
      case 'double': HEAP[ptr]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP[ptr];
      case 'i8': return HEAP[ptr];
      case 'i16': return HEAP[ptr];
      case 'i32': return HEAP[ptr];
      case 'i64': return HEAP[ptr];
      case 'float': return HEAP[ptr];
      case 'double': return HEAP[ptr];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_NONE = 3; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    stop = ret + size;
    while (ptr < stop) {
      HEAP[ptr++]=0;
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAP[(ptr)+(i)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAP[(ptr)+(i)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var STACK_ROOT, STACKTOP, STACK_MAX;
var STATICTOP;
var TOTAL_STACK = Module['TOTAL_STACK'] || 32768;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 524288;
var FAST_MEMORY = Module['FAST_MEMORY'] || 524288;
// Initialize the runtime's memory
// Make sure that our HEAP is implemented as a flat array.
HEAP = []; // Hinting at the size with |new Array(TOTAL_MEMORY)| should help in theory but makes v8 much slower
for (var i = 0; i < FAST_MEMORY; i++) {
  HEAP[i] = 0; // XXX We do *not* use {{| makeSetValue(0, 'i', 0, 'null') |}} here, since this is done just to optimize runtime speed
}
Module['HEAP'] = HEAP;
STACK_ROOT = STACKTOP = Runtime.alignMemory(1);
STACK_MAX = TOTAL_STACK; // we lose a little stack here, but TOTAL_STACK is nice and round so use that as the max
STATICTOP = STACK_MAX;
assert(STATICTOP < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var nullString = allocate(intArrayFromString('(null)'), 'i8', ALLOC_STACK);
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
function initRuntime() {
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP[(buffer)+(i)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP[(buffer)+(i)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math.imul) Math.imul = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 6000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
// === Body ===
assert(STATICTOP == STACK_MAX); assert(STACK_MAX == TOTAL_STACK);
STATICTOP += 5380;
assert(STATICTOP < TOTAL_MEMORY);
var _stderr;
allocate([0,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,36,0,0,0,26,0,0,0,118,0,0,0,154,0,0,0,166,0,0,0,1,0,0,0,114,0,0,0,110,0,0,0,102,0,0,0,134,0,0,0,104,0,0,0,176,0,0,0,140,0,0,0,2,0,0,0,1,0,0,0,46,0,0,0,1,0,0,0,40,0,0,0,168,0,0,0,164,0,0,0,80,0,0,0,16,0,0,0,44,0,0,0,52,0,0,0,84,0,0,0,68,0,0,0,32,0,0,0,112,0,0,0,62,0,0,0,172,0,0,0,70,0,0,0,90,0,0,0,160,0,0,0,60,0,0,0,126,0,0,0,116,0,0,0,1,0,0,0,0,0,0,0,38,0,0,0,148,0,0,0,0,0,0,0,0,0,0,0,122,0,0,0,0,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0], ALLOC_NONE, 32768);
allocate([100,0,0,0,162,0,0,0,6,0,0,0,86,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NONE, 32960);
allocate([0,0,0,0,1,0,0,0,3,0,0,0,0,0,0,0], ["i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0], ALLOC_NONE, 32976);
allocate([7,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,7,0,0,0,1,0,0,0,0,0,0,0,7,0,0,0,7,0,0,0,3,0,0,0,0,0,0,0,7,0,0,0,7,0,0,0,3,0,0,0,1,0,0,0,7,0,0,0,7,0,0,0,3,0,0,0,2,0,0,0,5,0,0,0,5,0,0,0,3,0,0,0,3,0,0,0,7,0,0,0,7,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,4,0,0,0,3,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,3,0,0,0,6,0,0,0,5,0,0,0,5,0,0,0,3,0,0,0,7,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,8,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,9,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,10,0,0,0,6,0,0,0,6,0,0,0,3,0,0,0,11,0,0,0,6,0,0,0,6,0,0,0,3,0,0,0,12,0,0,0], ["i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0], ALLOC_NONE, 32992);
allocate(24, "i32", ALLOC_NONE, 33232);
allocate([-1], ["i32",0,0,0], ALLOC_NONE, 33256);
allocate([6,0,0,0,2,0,0,0,1,0,0,0,3,0,0,0,4,0,0,0], ["i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0], ALLOC_NONE, 33260);
allocate(52, "*", ALLOC_NONE, 33280);
allocate([0,0,0,0,2,0,0,0,1,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,12,0,0,0], ["i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0], ALLOC_NONE, 33332);
allocate([10,0,0,0,28,0,0,0,142,0,0,0,92,0,0,0,88,0,0,0,30,0,0,0,106,0,0,0,138,0,0,0,82,0,0,0,54,0,0,0,64,0,0,0,66,0,0,0,136,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NONE, 33384);
allocate([3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0], ["i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NONE, 33436);
allocate([108,0,0,0,146,0,0,0,8,0,0,0,132,0,0,0,144,0,0,0,96,0,0,0,98,0,0,0,78,0,0,0,18,0,0,0,20,0,0,0,34,0,0,0,156,0,0,0,94,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NONE, 33644);
allocate([-1], ["i32",0,0,0], ALLOC_NONE, 33696);
allocate(16, "*", ALLOC_NONE, 33700);
allocate([101,110,116,104,0] /* enth\00 */, "i8", ALLOC_NONE, 33716);
allocate([120,0,0,0,22,0,0,0,4,0,0,0,174,0,0,0,56,0,0,0,14,0,0,0,158,0,0,0,150,0,0,0,72,0,0,0,32,0,0,0,42,0,0,0,170,0,0,0,128,0,0,0,130,0,0,0,124,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,76,0,0,0,152,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NONE, 33724);
allocate([33,110,45,62,107,105,100,115,91,48,93,0] /* !n-_kids[0]\00 */, "i8", ALLOC_NONE, 33824);
allocate([100,115,102,46,99,0] /* dsf.c\00 */, "i8", ALLOC_NONE, 33836);
allocate([109,101,45,62,115,116,97,116,101,112,111,115,32,62,61,32,49,0] /* me-_statepos _= 1\00 */, "i8", ALLOC_NONE, 33844);
allocate([107,32,33,61,32,102,45,62,111,114,100,101,114,0] /* k != f-_order\00 */, "i8", ALLOC_NONE, 33864);
allocate([102,45,62,111,114,100,101,114,32,61,61,32,52,0] /* f-_order == 4\00 */, "i8", ALLOC_NONE, 33880);
allocate([110,45,62,101,108,101,109,115,91,107,105,93,0] /* n-_elems[ki]\00 */, "i8", ALLOC_NONE, 33896);
allocate([82,117,110,110,105,110,103,32,115,111,108,118,101,114,32,115,111,97,107,32,116,101,115,116,115,10,0] /* Running solver soak  */, "i8", ALLOC_NONE, 33912);
allocate([110,101,120,116,95,110,101,119,95,101,100,103,101,32,45,32,103,45,62,101,100,103,101,115,32,60,32,103,45,62,110,117,109,95,101,100,103,101,115,0] /* next_new_edge - g-_e */, "i8", ALLOC_NONE, 33940);
allocate([105,50,32,61,61,32,105,110,118,101,114,115,101,0] /* i2 == inverse\00 */, "i8", ALLOC_NONE, 33980);
allocate([115,116,97,116,101,45,62,103,114,105,100,95,116,121,112,101,32,61,61,32,48,0] /* state-_grid_type ==  */, "i8", ALLOC_NONE, 33996);
allocate([109,111,118,101,115,116,114,32,33,61,32,78,85,76,76,0] /* movestr != NULL\00 */, "i8", ALLOC_NONE, 34020);
allocate([115,32,33,61,32,78,85,76,76,0] /* s != NULL\00 */, "i8", ALLOC_NONE, 34036);
allocate([48,0] /* 0\00 */, "i8", ALLOC_NONE, 34048);
allocate([37,115,95,84,69,83,84,83,79,76,86,69,0] /* %s_TESTSOLVE\00 */, "i8", ALLOC_NONE, 34052);
allocate([103,45,62,110,117,109,95,100,111,116,115,32,60,61,32,109,97,120,95,100,111,116,115,0] /* g-_num_dots _= max_d */, "i8", ALLOC_NONE, 34068);
allocate([118,50,32,61,61,32,118,49,0] /* v2 == v1\00 */, "i8", ALLOC_NONE, 34092);
allocate([108,111,111,112,121,46,99,0] /* loopy.c\00 */, "i8", ALLOC_NONE, 34104);
allocate([105,110,118,101,114,115,101,32,61,61,32,48,32,124,124,32,105,110,118,101,114,115,101,32,61,61,32,49,0] /* inverse == 0 || inve */, "i8", ALLOC_NONE, 34112);
allocate([100,114,97,119,105,110,103,46,99,0] /* drawing.c\00 */, "i8", ALLOC_NONE, 34144);
allocate([80,101,110,114,111,115,101,32,40,114,104,111,109,98,115,41,0] /* Penrose (rhombs)\00 */, "i8", ALLOC_NONE, 34156);
allocate([80,101,110,114,111,115,101,32,40,107,105,116,101,47,100,97,114,116,41,0] /* Penrose (kite/dart)\ */, "i8", ALLOC_NONE, 34176);
allocate([71,114,101,97,116,45,68,111,100,101,99,97,103,111,110,97,108,0] /* Great-Dodecagonal\00 */, "i8", ALLOC_NONE, 34196);
allocate([68,111,100,101,99,97,103,111,110,97,108,0] /* Dodecagonal\00 */, "i8", ALLOC_NONE, 34216);
allocate([70,108,111,114,101,116,0] /* Floret\00 */, "i8", ALLOC_NONE, 34228);
allocate([33,108,101,102,116,45,62,101,108,101,109,115,91,50,93,32,38,38,32,33,114,105,103,104,116,45,62,101,108,101,109,115,91,50,93,0] /* !left-_elems[2] && ! */, "i8", ALLOC_NONE, 34236);
allocate([75,105,116,101,115,0] /* Kites\00 */, "i8", ALLOC_NONE, 34272);
allocate([79,99,116,97,103,111,110,97,108,0] /* Octagonal\00 */, "i8", ALLOC_NONE, 34280);
allocate([115,0] /* s\00 */, "i8", ALLOC_NONE, 34292);
allocate([106,32,33,61,32,116,101,115,116,95,102,97,99,101,45,62,100,111,116,115,91,105,93,45,62,111,114,100,101,114,0] /* j != test_face-_dots */, "i8", ALLOC_NONE, 34296);
allocate([103,45,62,110,117,109,95,102,97,99,101,115,32,60,61,32,109,97,120,95,102,97,99,101,115,0] /* g-_num_faces _= max_ */, "i8", ALLOC_NONE, 34328);
allocate([71,114,101,97,116,45,72,101,120,97,103,111,110,97,108,0] /* Great-Hexagonal\00 */, "i8", ALLOC_NONE, 34356);
allocate([67,97,105,114,111,0] /* Cairo\00 */, "i8", ALLOC_NONE, 34372);
allocate([37,100,37,99,0] /* %d%c\00 */, "i8", ALLOC_NONE, 34380);
allocate([33,105,110,118,101,114,115,101,0] /* !inverse\00 */, "i8", ALLOC_NONE, 34388);
allocate([83,110,117,98,45,83,113,117,97,114,101,0] /* Snub-Square\00 */, "i8", ALLOC_NONE, 34400);
allocate([72,111,110,101,121,99,111,109,98,0] /* Honeycomb\00 */, "i8", ALLOC_NONE, 34412);
allocate([84,114,105,97,110,103,117,108,97,114,0] /* Triangular\00 */, "i8", ALLOC_NONE, 34424);
allocate([83,113,117,97,114,101,115,0] /* Squares\00 */, "i8", ALLOC_NONE, 34436);
allocate([72,97,114,100,0] /* Hard\00 */, "i8", ALLOC_NONE, 34444);
allocate([84,114,105,99,107,121,0] /* Tricky\00 */, "i8", ALLOC_NONE, 34452);
allocate([78,111,114,109,97,108,0] /* Normal\00 */, "i8", ALLOC_NONE, 34460);
allocate([69,97,115,121,0] /* Easy\00 */, "i8", ALLOC_NONE, 34468);
allocate([109,111,118,101,115,116,114,32,38,38,32,33,109,115,103,0] /* movestr && !msg\00 */, "i8", ALLOC_NONE, 34476);
allocate([98,111,97,114,100,91,102,97,99,101,95,105,110,100,101,120,93,32,33,61,32,99,111,108,111,117,114,0] /* board[face_index] != */, "i8", ALLOC_NONE, 34492);
allocate([71,37,100,44,37,100,44,37,100,0] /* G%d,%d,%d\00 */, "i8", ALLOC_NONE, 34520);
allocate([37,100,120,37,100,32,37,115,32,45,32,37,115,0] /* %dx%d %s - %s\00 */, "i8", ALLOC_NONE, 34532);
allocate([100,37,99,0] /* d%c\00 */, "i8", ALLOC_NONE, 34548);
allocate([49,50,51,52,53,54,55,56,57,48,0] /* 1234567890\00 */, "i8", ALLOC_NONE, 34552);
allocate([100,115,102,91,118,50,93,32,38,32,50,0] /* dsf[v2] & 2\00 */, "i8", ALLOC_NONE, 34564);
allocate([37,100,120,37,100,116,37,100,0] /* %dx%dt%d\00 */, "i8", ALLOC_NONE, 34576);
allocate([58,69,97,115,121,58,78,111,114,109,97,108,58,84,114,105,99,107,121,58,72,97,114,100,0] /* :Easy:Normal:Tricky: */, "i8", ALLOC_NONE, 34588);
allocate([68,105,102,102,105,99,117,108,116,121,0] /* Difficulty\00 */, "i8", ALLOC_NONE, 34616);
allocate([58,83,113,117,97,114,101,115,58,84,114,105,97,110,103,117,108,97,114,58,72,111,110,101,121,99,111,109,98,58,83,110,117,98,45,83,113,117,97,114,101,58,67,97,105,114,111,58,71,114,101,97,116,45,72,101,120,97,103,111,110,97,108,58,79,99,116,97,103,111,110,97,108,58,75,105,116,101,115,58,70,108,111,114,101,116,58,68,111,100,101,99,97,103,111,110,97,108,58,71,114,101,97,116,45,68,111,100,101,99,97,103,111,110,97,108,58,80,101,110,114,111,115,101,32,40,107,105,116,101,47,100,97,114,116,41,58,80,101,110,114,111,115,101,32,40,114,104,111,109,98,115,41,0] /* :Squares:Triangular: */, "i8", ALLOC_NONE, 34628);
allocate([71,114,105,100,32,116,121,112,101,0] /* Grid type\00 */, "i8", ALLOC_NONE, 34784);
allocate([72,101,105,103,104,116,0] /* Height\00 */, "i8", ALLOC_NONE, 34796);
allocate([87,105,100,116,104,0] /* Width\00 */, "i8", ALLOC_NONE, 34804);
allocate([87,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,102,111,114,32,116,104,105,115,32,103,114,105,100,32,116,121,112,101,32,109,117,115,116,32,98,111,116,104,32,98,101,32,97,116,32,108,101,97,115,116,32,50,0] /* Width and height for */, "i8", ALLOC_NONE, 34812);
allocate([109,101,45,62,110,115,116,97,116,101,115,32,61,61,32,48,0] /* me-_nstates == 0\00 */, "i8", ALLOC_NONE, 34872);
allocate([98,111,97,114,100,91,105,93,32,61,61,32,70,65,67,69,95,71,82,69,89,0] /* board[i] == FACE_GRE */, "i8", ALLOC_NONE, 34892);
allocate([33,34,73,110,118,97,108,105,100,32,103,114,105,100,32,100,101,115,99,114,105,112,116,105,111,110,46,34,0] /* !\22Invalid grid des */, "i8", ALLOC_NONE, 34916);
allocate([65,116,32,108,101,97,115,116,32,111,110,101,32,111,102,32,119,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,102,111,114,32,116,104,105,115,32,103,114,105,100,32,116,121,112,101,32,109,117,115,116,32,98,101,32,97,116,32,108,101,97,115,116,32,50,0] /* At least one of widt */, "i8", ALLOC_NONE, 34948);
allocate([87,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,102,111,114,32,116,104,105,115,32,103,114,105,100,32,116,121,112,101,32,109,117,115,116,32,98,111,116,104,32,98,101,32,97,116,32,108,101,97,115,116,32,49,0] /* Width and height for */, "i8", ALLOC_NONE, 35020);
allocate([76,79,79,80,89,95,70,65,73,78,84,95,76,73,78,69,83,0] /* LOOPY_FAINT_LINES\00 */, "i8", ALLOC_NONE, 35080);
allocate([100,115,102,91,118,49,93,32,38,32,50,0] /* dsf[v1] & 2\00 */, "i8", ALLOC_NONE, 35100);
allocate([65,116,32,108,101,97,115,116,32,111,110,101,32,111,102,32,119,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,102,111,114,32,116,104,105,115,32,103,114,105,100,32,116,121,112,101,32,109,117,115,116,32,98,101,32,97,116,32,108,101,97,115,116,32,52,0] /* At least one of widt */, "i8", ALLOC_NONE, 35112);
allocate([65,116,32,108,101,97,115,116,32,111,110,101,32,111,102,32,119,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,102,111,114,32,116,104,105,115,32,103,114,105,100,32,116,121,112,101,32,109,117,115,116,32,98,101,32,97,116,32,108,101,97,115,116,32,51,0] /* At least one of widt */, "i8", ALLOC_NONE, 35184);
allocate([87,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,102,111,114,32,116,104,105,115,32,103,114,105,100,32,116,121,112,101,32,109,117,115,116,32,98,111,116,104,32,98,101,32,97,116,32,108,101,97,115,116,32,51,0] /* Width and height for */, "i8", ALLOC_NONE, 35256);
allocate([112,97,114,97,109,115,45,62,100,105,102,102,32,60,32,68,73,70,70,95,77,65,88,0] /* params-_diff _ DIFF_ */, "i8", ALLOC_NONE, 35316);
allocate([116,114,101,101,50,51,52,46,99,0] /* tree234.c\00 */, "i8", ALLOC_NONE, 35340);
allocate([73,108,108,101,103,97,108,32,103,114,105,100,32,116,121,112,101,0] /* Illegal grid type\00 */, "i8", ALLOC_NONE, 35352);
allocate([99,50,32,33,61,32,70,65,67,69,95,71,82,69,89,0] /* c2 != FACE_GREY\00 */, "i8", ALLOC_NONE, 35372);
allocate([114,97,110,100,111,109,46,99,0] /* random.c\00 */, "i8", ALLOC_NONE, 35388);
allocate([99,49,32,33,61,32,70,65,67,69,95,71,82,69,89,0] /* c1 != FACE_GREY\00 */, "i8", ALLOC_NONE, 35400);
allocate([91,37,100,58,37,48,50,100,93,32,0] /* [%d:%02d] \00 */, "i8", ALLOC_NONE, 35416);
allocate([115,115,116,97,116,101,95,110,101,119,45,62,115,111,108,118,101,114,95,115,116,97,116,117,115,32,33,61,32,83,79,76,86,69,82,95,77,73,83,84,65,75,69,0] /* sstate_new-_solver_s */, "i8", ALLOC_NONE, 35428);
allocate([109,105,100,101,110,100,46,99,0] /* midend.c\00 */, "i8", ALLOC_NONE, 35472);
allocate([98,111,97,114,100,91,107,93,32,61,61,32,70,65,67,69,95,71,82,69,89,0] /* board[k] == FACE_GRE */, "i8", ALLOC_NONE, 35484);
allocate([83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,32,102,97,105,108,101,100,0] /* Solve operation fail */, "i8", ALLOC_NONE, 35508);
allocate([71,114,105,100,32,100,101,115,99,114,105,112,116,105,111,110,32,115,116,114,105,110,103,115,32,110,111,116,32,117,115,101,100,32,119,105,116,104,32,116,104,105,115,32,103,114,105,100,32,116,121,112,101,0] /* Grid description str */, "i8", ALLOC_NONE, 35532);
allocate([78,111,32,103,97,109,101,32,115,101,116,32,117,112,32,116,111,32,115,111,108,118,101,0] /* No game set up to so */, "i8", ALLOC_NONE, 35588);
allocate([33,118,97,108,105,100,97,116,101,95,100,101,115,99,40,112,97,114,97,109,115,44,32,114,101,116,118,97,108,41,0] /* !validate_desc(param */, "i8", ALLOC_NONE, 35612);
allocate([105,110,118,101,114,115,101,32,61,61,32,48,0] /* inverse == 0\00 */, "i8", ALLOC_NONE, 35644);
allocate([84,104,105,115,32,103,97,109,101,32,100,111,101,115,32,110,111,116,32,115,117,112,112,111,114,116,32,116,104,101,32,83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,0] /* This game does not s */, "i8", ALLOC_NONE, 35660);
allocate([37,115,37,99,37,115,0] /* %s%c%s\00 */, "i8", ALLOC_NONE, 35708);
allocate([68,101,115,99,114,105,112,116,105,111,110,32,116,111,111,32,108,111,110,103,32,102,111,114,32,98,111,97,114,100,32,115,105,122,101,0] /* Description too long */, "i8", ALLOC_NONE, 35716);
allocate([100,114,45,62,109,101,0] /* dr-_me\00 */, "i8", ALLOC_NONE, 35752);
allocate([68,101,115,99,114,105,112,116,105,111,110,32,116,111,111,32,115,104,111,114,116,32,102,111,114,32,98,111,97,114,100,32,115,105,122,101,0] /* Description too shor */, "i8", ALLOC_NONE, 35760);
allocate([112,101,110,114,111,115,101,46,99,0] /* penrose.c\00 */, "i8", ALLOC_NONE, 35800);
allocate([85,110,107,110,111,119,110,32,99,104,97,114,97,99,116,101,114,32,105,110,32,100,101,115,99,114,105,112,116,105,111,110,0] /* Unknown character in */, "i8", ALLOC_NONE, 35812);
allocate([110,32,62,32,48,0] /* n _ 0\00 */, "i8", ALLOC_NONE, 35848);
allocate([42,100,112,0] /* _dp\00 */, "i8", ALLOC_NONE, 35856);
allocate([114,32,61,61,32,84,82,85,69,0] /* r == TRUE\00 */, "i8", ALLOC_NONE, 35860);
allocate([114,0] /* r\00 */, "i8", ALLOC_NONE, 35872);
allocate([37,100,0] /* %d\00 */, "i8", ALLOC_NONE, 35876);
allocate([102,115,0] /* fs\00 */, "i8", ALLOC_NONE, 35880);
allocate([98,101,115,116,100,105,115,116,32,62,32,48,0] /* bestdist _ 0\00 */, "i8", ALLOC_NONE, 35884);
allocate([103,45,62,101,100,103,101,115,91,101,49,93,46,100,111,116,50,32,61,61,32,103,45,62,101,100,103,101,115,91,101,50,93,46,100,111,116,49,32,124,124,32,103,45,62,101,100,103,101,115,91,101,49,93,46,100,111,116,50,32,61,61,32,103,45,62,101,100,103,101,115,91,101,50,93,46,100,111,116,50,0] /* g-_edges[e1].dot2 == */, "i8", ALLOC_NONE, 35900);
allocate([65,110,103,108,101,32,111,102,102,115,101,116,32,111,117,116,32,111,102,32,98,111,117,110,100,115,46,0] /* Angle offset out of  */, "i8", ALLOC_NONE, 35984);
allocate([78,32,60,61,32,77,65,88,95,70,65,67,69,95,83,73,90,69,0] /* N _= MAX_FACE_SIZE\0 */, "i8", ALLOC_NONE, 36012);
allocate([108,111,111,112,121,0] /* loopy\00 */, "i8", ALLOC_NONE, 36032);
allocate([105,110,100,101,120,32,62,61,32,48,0] /* index _= 0\00 */, "i8", ALLOC_NONE, 36040);
allocate([80,97,116,99,104,32,111,102,102,115,101,116,32,111,117,116,32,111,102,32,98,111,117,110,100,115,46,0] /* Patch offset out of  */, "i8", ALLOC_NONE, 36052);
allocate([106,32,60,32,115,115,116,97,116,101,45,62,115,116,97,116,101,45,62,103,97,109,101,95,103,114,105,100,45,62,110,117,109,95,101,100,103,101,115,0] /* j _ sstate-_state-_g */, "i8", ALLOC_NONE, 36080);
allocate([73,110,118,97,108,105,100,32,102,111,114,109,97,116,32,103,114,105,100,32,100,101,115,99,114,105,112,116,105,111,110,32,115,116,114,105,110,103,46,0] /* Invalid format grid  */, "i8", ALLOC_NONE, 36120);
allocate([105,32,60,32,115,115,116,97,116,101,45,62,115,116,97,116,101,45,62,103,97,109,101,95,103,114,105,100,45,62,110,117,109,95,101,100,103,101,115,0] /* i _ sstate-_state-_g */, "i8", ALLOC_NONE, 36160);
allocate([77,105,115,115,105,110,103,32,103,114,105,100,32,100,101,115,99,114,105,112,116,105,111,110,32,115,116,114,105,110,103,46,0] /* Missing grid descrip */, "i8", ALLOC_NONE, 36200);
allocate([108,105,110,101,95,110,101,119,32,33,61,32,76,73,78,69,95,85,78,75,78,79,87,78,0] /* line_new != LINE_UNK */, "i8", ALLOC_NONE, 36236);
allocate([37,115,95,68,69,70,65,85,76,84,0] /* %s_DEFAULT\00 */, "i8", ALLOC_NONE, 36264);
allocate([110,32,62,61,32,48,32,38,38,32,110,32,60,32,109,101,45,62,110,112,114,101,115,101,116,115,0] /* n _= 0 && n _ me-_np */, "i8", ALLOC_NONE, 36276);
allocate([100,45,62,102,97,99,101,115,91,99,117,114,114,101,110,116,95,102,97,99,101,50,93,0] /* d-_faces[current_fac */, "i8", ALLOC_NONE, 36304);
allocate([111,117,116,32,111,102,32,109,101,109,111,114,121,0] /* out of memory\00 */, "i8", ALLOC_NONE, 36328);
allocate([112,114,111,103,114,101,115,115,32,61,61,32,84,82,85,69,0] /* progress == TRUE\00 */, "i8", ALLOC_NONE, 36344);
allocate([37,115,95,80,82,69,83,69,84,83,0] /* %s_PRESETS\00 */, "i8", ALLOC_NONE, 36364);
allocate([106,32,33,61,32,102,45,62,111,114,100,101,114,0] /* j != f-_order\00 */, "i8", ALLOC_NONE, 36376);
allocate([108,111,111,112,103,101,110,46,99,0] /* loopgen.c\00 */, "i8", ALLOC_NONE, 36392);
allocate([115,115,116,97,116,101,45,62,115,111,108,118,101,114,95,115,116,97,116,117,115,32,61,61,32,83,79,76,86,69,82,95,73,78,67,79,77,80,76,69,84,69,0] /* sstate-_solver_statu */, "i8", ALLOC_NONE, 36404);
allocate([102,97,116,97,108,32,101,114,114,111,114,58,32,0] /* fatal error: \00 */, "i8", ALLOC_NONE, 36448);
allocate([37,50,120,37,50,120,37,50,120,0] /* %2x%2x%2x\00 */, "i8", ALLOC_NONE, 36464);
allocate([102,32,33,61,32,78,85,76,76,0] /* f != NULL\00 */, "i8", ALLOC_NONE, 36476);
allocate([115,116,114,108,101,110,40,114,101,116,41,32,60,61,32,40,115,105,122,101,95,116,41,108,101,110,0] /* strlen(ret) _= (size */, "i8", ALLOC_NONE, 36488);
allocate([114,101,108,97,116,105,111,110,32,61,61,32,82,69,76,50,51,52,95,76,84,32,124,124,32,114,101,108,97,116,105,111,110,32,61,61,32,82,69,76,50,51,52,95,71,84,0] /* relation == REL234_L */, "i8", ALLOC_NONE, 36516);
allocate([98,105,116,115,32,60,32,51,50,0] /* bits _ 32\00 */, "i8", ALLOC_NONE, 36564);
allocate([37,115,95,67,79,76,79,85,82,95,37,100,0] /* %s_COLOUR_%d\00 */, "i8", ALLOC_NONE, 36576);
allocate([100,45,62,111,114,100,101,114,32,62,61,32,50,0] /* d-_order _= 2\00 */, "i8", ALLOC_NONE, 36592);
allocate([37,100,110,0] /* %dn\00 */, "i8", ALLOC_NONE, 36608);
allocate([40,97,110,103,32,37,32,51,54,41,32,61,61,32,48,0] /* (ang % 36) == 0\00 */, "i8", ALLOC_NONE, 36612);
allocate(1, "i8", ALLOC_NONE, 36628);
allocate([33,34,71,114,105,100,32,98,114,111,107,101,110,58,32,98,97,100,32,101,100,103,101,45,102,97,99,101,32,114,101,108,97,116,105,111,110,115,104,105,112,34,0] /* !\22Grid broken: bad */, "i8", ALLOC_NONE, 36632);
allocate([37,100,121,0] /* %dy\00 */, "i8", ALLOC_NONE, 36676);
allocate([37,115,95,84,73,76,69,83,73,90,69,0] /* %s_TILESIZE\00 */, "i8", ALLOC_NONE, 36680);
allocate([99,95,108,105,103,104,116,97,98,108,101,32,33,61,32,48,32,38,38,32,99,95,100,97,114,107,97,98,108,101,32,33,61,32,48,0] /* c_lightable != 0 &&  */, "i8", ALLOC_NONE, 36692);
allocate([103,114,105,100,46,99,0] /* grid.c\00 */, "i8", ALLOC_NONE, 36728);
allocate([109,101,45,62,100,105,114,32,33,61,32,48,0] /* me-_dir != 0\00 */, "i8", ALLOC_NONE, 36736);
allocate([103,45,62,114,101,102,99,111,117,110,116,0] /* g-_refcount\00 */, "i8", ALLOC_NONE, 36752);
allocate([102,45,62,101,100,103,101,115,91,107,50,93,32,61,61,32,78,85,76,76,0] /* f-_edges[k2] == NULL */, "i8", ALLOC_NONE, 36764);
allocate([83,0] /* S\00 */, "i8", ALLOC_NONE, 36788);
allocate([110,32,61,61,32,116,45,62,114,111,111,116,0] /* n == t-_root\00 */, "i8", ALLOC_NONE, 36792);
allocate([109,101,45,62,100,114,97,119,105,110,103,0] /* me-_drawing\00 */, "i8", ALLOC_NONE, 36808);
allocate([102,45,62,101,100,103,101,115,91,107,93,32,61,61,32,78,85,76,76,0] /* f-_edges[k] == NULL\ */, "i8", ALLOC_NONE, 36820);
allocate([33,34,73,108,108,101,103,97,108,32,108,105,110,101,32,115,116,97,116,101,34,0] /* !\22Illegal line sta */, "i8", ALLOC_NONE, 36840);
allocate([103,97,109,101,115,46,108,111,111,112,121,0] /* games.loopy\00 */, "i8", ALLOC_NONE, 36864);
allocate([76,111,111,112,121,0] /* Loopy\00 */, "i8", ALLOC_NONE, 36876);
allocate(472, ["i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0], ALLOC_NONE, 36884);
allocate([118,97,108,105,100,97,116,101,95,112,97,114,97,109,115,0] /* validate_params\00 */, "i8", ALLOC_NONE, 37356);
allocate([118,95,114,111,116,97,116,101,0] /* v_rotate\00 */, "i8", ALLOC_NONE, 37372);
allocate([116,114,105,118,105,97,108,95,100,101,100,117,99,116,105,111,110,115,0] /* trivial_deductions\0 */, "i8", ALLOC_NONE, 37384);
allocate([116,114,97,110,115,50,51,52,95,115,117,98,116,114,101,101,95,109,101,114,103,101,0] /* trans234_subtree_mer */, "i8", ALLOC_NONE, 37404);
allocate([115,116,97,116,117,115,95,98,97,114,0] /* status_bar\00 */, "i8", ALLOC_NONE, 37428);
allocate([115,111,108,118,101,114,95,115,101,116,95,108,105,110,101,0] /* solver_set_line\00 */, "i8", ALLOC_NONE, 37440);
allocate([114,97,110,100,111,109,95,117,112,116,111,0] /* random_upto\00 */, "i8", ALLOC_NONE, 37456);
allocate([110,101,119,95,103,97,109,101,95,100,101,115,99,0] /* new_game_desc\00 */, "i8", ALLOC_NONE, 37468);
allocate([110,101,119,95,103,97,109,101,0] /* new_game\00 */, "i8", ALLOC_NONE, 37484);
allocate([109,105,100,101,110,100,95,115,111,108,118,101,0] /* midend_solve\00 */, "i8", ALLOC_NONE, 37496);
allocate([109,105,100,101,110,100,95,114,101,115,116,97,114,116,95,103,97,109,101,0] /* midend_restart_game\ */, "i8", ALLOC_NONE, 37512);
allocate([109,105,100,101,110,100,95,114,101,100,114,97,119,0] /* midend_redraw\00 */, "i8", ALLOC_NONE, 37532);
allocate([109,105,100,101,110,100,95,114,101,97,108,108,121,95,112,114,111,99,101,115,115,95,107,101,121,0] /* midend_really_proces */, "i8", ALLOC_NONE, 37548);
allocate([109,105,100,101,110,100,95,110,101,119,95,103,97,109,101,0] /* midend_new_game\00 */, "i8", ALLOC_NONE, 37576);
allocate([109,105,100,101,110,100,95,102,101,116,99,104,95,112,114,101,115,101,116,0] /* midend_fetch_preset\ */, "i8", ALLOC_NONE, 37592);
allocate([109,101,114,103,101,95,108,105,110,101,115,0] /* merge_lines\00 */, "i8", ALLOC_NONE, 37612);
allocate([108,111,111,112,95,100,101,100,117,99,116,105,111,110,115,0] /* loop_deductions\00 */, "i8", ALLOC_NONE, 37624);
allocate([103,114,105,100,95,110,101,119,95,115,113,117,97,114,101,0] /* grid_new_square\00 */, "i8", ALLOC_NONE, 37640);
allocate([103,114,105,100,95,110,101,119,95,115,110,117,98,115,113,117,97,114,101,0] /* grid_new_snubsquare\ */, "i8", ALLOC_NONE, 37656);
allocate([103,114,105,100,95,110,101,119,95,112,101,110,114,111,115,101,0] /* grid_new_penrose\00 */, "i8", ALLOC_NONE, 37676);
allocate([103,114,105,100,95,110,101,119,95,111,99,116,97,103,111,110,97,108,0] /* grid_new_octagonal\0 */, "i8", ALLOC_NONE, 37696);
allocate([103,114,105,100,95,110,101,119,95,107,105,116,101,115,0] /* grid_new_kites\00 */, "i8", ALLOC_NONE, 37716);
allocate([103,114,105,100,95,110,101,119,95,104,111,110,101,121,99,111,109,98,0] /* grid_new_honeycomb\0 */, "i8", ALLOC_NONE, 37732);
allocate([103,114,105,100,95,110,101,119,95,103,114,101,97,116,104,101,120,97,103,111,110,97,108,0] /* grid_new_greathexago */, "i8", ALLOC_NONE, 37752);
allocate([103,114,105,100,95,110,101,119,95,103,114,101,97,116,100,111,100,101,99,97,103,111,110,97,108,0] /* grid_new_greatdodeca */, "i8", ALLOC_NONE, 37776);
allocate([103,114,105,100,95,110,101,119,95,102,108,111,114,101,116,0] /* grid_new_floret\00 */, "i8", ALLOC_NONE, 37804);
allocate([103,114,105,100,95,110,101,119,95,100,111,100,101,99,97,103,111,110,97,108,0] /* grid_new_dodecagonal */, "i8", ALLOC_NONE, 37820);
allocate([103,114,105,100,95,110,101,119,95,99,97,105,114,111,0] /* grid_new_cairo\00 */, "i8", ALLOC_NONE, 37844);
allocate([103,114,105,100,95,110,101,119,0] /* grid_new\00 */, "i8", ALLOC_NONE, 37860);
allocate([103,114,105,100,95,109,97,107,101,95,99,111,110,115,105,115,116,101,110,116,0] /* grid_make_consistent */, "i8", ALLOC_NONE, 37872);
allocate([103,114,105,100,95,102,114,101,101,0] /* grid_free\00 */, "i8", ALLOC_NONE, 37896);
allocate([103,114,105,100,95,102,105,110,100,95,105,110,99,101,110,116,114,101,0] /* grid_find_incentre\0 */, "i8", ALLOC_NONE, 37908);
allocate([103,101,110,101,114,97,116,101,95,108,111,111,112,0] /* generate_loop\00 */, "i8", ALLOC_NONE, 37928);
allocate([103,97,109,101,95,116,101,120,116,95,102,111,114,109,97,116,0] /* game_text_format\00 */, "i8", ALLOC_NONE, 37944);
allocate([103,97,109,101,95,104,97,115,95,117,110,105,113,117,101,95,115,111,108,110,0] /* game_has_unique_soln */, "i8", ALLOC_NONE, 37964);
allocate([102,105,110,100,114,101,108,112,111,115,50,51,52,0] /* findrelpos234\00 */, "i8", ALLOC_NONE, 37988);
allocate([102,97,99,101,95,115,101,116,97,108,108,0] /* face_setall\00 */, "i8", ALLOC_NONE, 38004);
allocate([101,110,99,111,100,101,95,115,111,108,118,101,95,109,111,118,101,0] /* encode_solve_move\00 */, "i8", ALLOC_NONE, 38016);
allocate([101,100,115,102,95,109,101,114,103,101,0] /* edsf_merge\00 */, "i8", ALLOC_NONE, 38036);
allocate([101,100,115,102,95,99,97,110,111,110,105,102,121,0] /* edsf_canonify\00 */, "i8", ALLOC_NONE, 38048);
allocate([100,111,116,95,115,101,116,97,108,108,0] /* dot_setall\00 */, "i8", ALLOC_NONE, 38064);
allocate([100,108,105,110,101,95,100,101,100,117,99,116,105,111,110,115,0] /* dline_deductions\00 */, "i8", ALLOC_NONE, 38076);
allocate([100,101,108,112,111,115,50,51,52,95,105,110,116,101,114,110,97,108,0] /* delpos234_internal\0 */, "i8", ALLOC_NONE, 38096);
allocate([99,97,110,95,99,111,108,111,117,114,95,102,97,99,101,0] /* can_colour_face\00 */, "i8", ALLOC_NONE, 38116);
allocate([97,100,100,95,102,117,108,108,95,99,108,117,101,115,0] /* add_full_clues\00 */, "i8", ALLOC_NONE, 38132);
HEAP[32768]=((36876)|0);
HEAP[32772]=((36864)|0);
HEAP[32776]=((36032)|0);
HEAP[33280]=((34436)|0);
HEAP[33284]=((34424)|0);
HEAP[33288]=((34412)|0);
HEAP[33292]=((34400)|0);
HEAP[33296]=((34372)|0);
HEAP[33300]=((34356)|0);
HEAP[33304]=((34280)|0);
HEAP[33308]=((34272)|0);
HEAP[33312]=((34228)|0);
HEAP[33316]=((34216)|0);
HEAP[33320]=((34196)|0);
HEAP[33324]=((34176)|0);
HEAP[33328]=((34156)|0);
HEAP[33444]=((35256)|0);
HEAP[33448]=((35184)|0);
HEAP[33460]=((35256)|0);
HEAP[33464]=((35184)|0);
HEAP[33476]=((35256)|0);
HEAP[33480]=((35184)|0);
HEAP[33492]=((35256)|0);
HEAP[33496]=((35184)|0);
HEAP[33508]=((35256)|0);
HEAP[33512]=((35112)|0);
HEAP[33524]=((35256)|0);
HEAP[33528]=((35184)|0);
HEAP[33540]=((35256)|0);
HEAP[33544]=((35184)|0);
HEAP[33556]=((35256)|0);
HEAP[33560]=((35184)|0);
HEAP[33572]=((35020)|0);
HEAP[33576]=((34948)|0);
HEAP[33588]=((34812)|0);
HEAP[33592]=((34948)|0);
HEAP[33604]=((34812)|0);
HEAP[33608]=((34948)|0);
HEAP[33620]=((35256)|0);
HEAP[33624]=((35184)|0);
HEAP[33636]=((35256)|0);
HEAP[33640]=((35184)|0);
HEAP[33700]=((34468)|0);
HEAP[33704]=((34460)|0);
HEAP[33708]=((34452)|0);
HEAP[33712]=((34444)|0);
  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP[curr]|0 != 0) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAP[(varargs)+(argIndex)];
        } else if (type == 'i64') {
          ret = HEAP[(varargs)+(argIndex)];
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP[(varargs)+(argIndex)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP[textIndex];
        if (curr === 0) break;
        next = HEAP[textIndex+1];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP[textIndex+1];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP[textIndex+1];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP[textIndex+1];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP[textIndex+1];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP[textIndex+1];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP[textIndex+1];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP[textIndex+2];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP[textIndex+2];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP[textIndex+1];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = flagAlternative ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*') || nullString;
              var argLength = _strlen(arg);
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              for (var i = 0; i < argLength; i++) {
                ret.push(HEAP[arg++]);
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP[ptr]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP[i]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP[s]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP[(s)+(i)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP[(s)+(i)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }
  var _sqrt=Math.sqrt;
  var _environ=allocate(1, "i32*", ALLOC_STACK);var ___environ=_environ;function ___buildEnvironment(env) {
      // WARNING: Arbitrary limit!
      var MAX_ENV_VALUES = 64;
      var TOTAL_ENV_SIZE = 1024;
      // Statically allocate memory for the environment.
      var poolPtr;
      var envPtr;
      if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        // Set default values. Use string keys for Closure Compiler compatibility.
        ENV['USER'] = 'root';
        ENV['PATH'] = '/';
        ENV['PWD'] = '/';
        ENV['HOME'] = '/home/emscripten';
        ENV['LANG'] = 'en_US.UTF-8';
        ENV['_'] = './this.program';
        // Allocate memory.
        poolPtr = allocate(TOTAL_ENV_SIZE, 'i8', ALLOC_STATIC);
        envPtr = allocate(MAX_ENV_VALUES * 4,
                          'i8*', ALLOC_STATIC);
        HEAP[envPtr]=poolPtr
        HEAP[_environ]=envPtr;
      } else {
        envPtr = HEAP[_environ];
        poolPtr = HEAP[envPtr];
      }
      // Collect key=value lines.
      var strings = [];
      var totalSize = 0;
      for (var key in env) {
        if (typeof env[key] === 'string') {
          var line = key + '=' + env[key];
          strings.push(line);
          totalSize += line.length;
        }
      }
      if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error('Environment size exceeded TOTAL_ENV_SIZE!');
      }
      // Make new.
      var ptrSize = 4;
      for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        for (var j = 0; j < line.length; j++) {
          HEAP[(poolPtr)+(j)]=line.charCodeAt(j);
        }
        HEAP[(poolPtr)+(j)]=0;
        HEAP[(envPtr)+(i * ptrSize)]=poolPtr;
        poolPtr += line.length + 1;
      }
      HEAP[(envPtr)+(strings.length * ptrSize)]=0;
    }var ENV={};function _getenv(name) {
      // char *getenv(const char *name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/getenv.html
      if (name === 0) return 0;
      name = Pointer_stringify(name);
      if (!ENV.hasOwnProperty(name)) return 0;
      if (_getenv.ret) _free(_getenv.ret);
      _getenv.ret = allocate(intArrayFromString(ENV[name]), 'i8', ALLOC_NORMAL);
      return _getenv.ret;
    }
  function _memset(ptr, value, num) {
      for (var $$dest = ptr, $$stop = $$dest + num; $$dest < $$stop; $$dest++) {
  HEAP[$$dest]=value
  };
    }var _llvm_memset_p0i8_i32=_memset;
var _frontend_default_colour; // stub for _frontend_default_colour
  function _isspace(chr) {
      return chr in { 32: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0 };
    }
  function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      if (!___setErrNo.ret) ___setErrNo.ret = allocate([0], 'i32', ALLOC_STATIC);
      HEAP[___setErrNo.ret]=value
      return value;
    }
  var ERRNO_CODES={E2BIG:7,EACCES:13,EADDRINUSE:98,EADDRNOTAVAIL:99,EAFNOSUPPORT:97,EAGAIN:11,EALREADY:114,EBADF:9,EBADMSG:74,EBUSY:16,ECANCELED:125,ECHILD:10,ECONNABORTED:103,ECONNREFUSED:111,ECONNRESET:104,EDEADLK:35,EDESTADDRREQ:89,EDOM:33,EDQUOT:122,EEXIST:17,EFAULT:14,EFBIG:27,EHOSTUNREACH:113,EIDRM:43,EILSEQ:84,EINPROGRESS:115,EINTR:4,EINVAL:22,EIO:5,EISCONN:106,EISDIR:21,ELOOP:40,EMFILE:24,EMLINK:31,EMSGSIZE:90,EMULTIHOP:72,ENAMETOOLONG:36,ENETDOWN:100,ENETRESET:102,ENETUNREACH:101,ENFILE:23,ENOBUFS:105,ENODATA:61,ENODEV:19,ENOENT:2,ENOEXEC:8,ENOLCK:37,ENOLINK:67,ENOMEM:12,ENOMSG:42,ENOPROTOOPT:92,ENOSPC:28,ENOSR:63,ENOSTR:60,ENOSYS:38,ENOTCONN:107,ENOTDIR:20,ENOTEMPTY:39,ENOTRECOVERABLE:131,ENOTSOCK:88,ENOTSUP:95,ENOTTY:25,ENXIO:6,EOVERFLOW:75,EOWNERDEAD:130,EPERM:1,EPIPE:32,EPROTO:71,EPROTONOSUPPORT:93,EPROTOTYPE:91,ERANGE:34,EROFS:30,ESPIPE:29,ESRCH:3,ESTALE:116,ETIME:62,ETIMEDOUT:110,ETXTBSY:26,EWOULDBLOCK:11,EXDEV:18};function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP[str])) str++;
      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP[str] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP[str] == 43) {
        str++;
      }
      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP[str] == 48) {
          if (HEAP[str+1] == 120 ||
              HEAP[str+1] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            str++;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      // Get digits.
      var chr;
      var ret = 0;
      while ((chr = HEAP[str]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          ret = ret * finalBase + digit;
          str++;
        }
      }
      // Apply sign.
      ret *= multiplier;
      // Set end pointer.
      if (endptr) {
        HEAP[endptr]=str
      }
      // Unsign if needed.
      if (unsign) {
        if (Math.abs(ret) > max) {
          ret = max;
          ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          ret = unSign(ret, bits);
        }
      }
      // Validate range.
      if (ret > max || ret < min) {
        ret = ret > max ? max : min;
        ___setErrNo(ERRNO_CODES.ERANGE);
      }
      return ret;
    }function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }function _atoi(ptr) {
      return _strtol(ptr, null, 10);
    }
  function _strspn(pstr, pset) {
      var str = pstr, set, strcurr, setcurr;
      while (1) {
        strcurr = HEAP[str];
        if (!strcurr) return str - pstr;
        set = pset;
        while (1) {
          setcurr = HEAP[set];
          if (!setcurr || setcurr == strcurr) break;
          set++;
        }
        if (!setcurr) return str - pstr;
        str++;
      }
    }
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }
  function _memchr(ptr, chr, num) {
      chr = unSign(chr);
      for (var i = 0; i < num; i++) {
        if (HEAP[ptr] == chr) return ptr;
        ptr++;
      }
      return 0;
    }
  function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP[dest]=HEAP[src];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP[dest]=HEAP[src];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP[dest]=HEAP[src];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function _strchr(ptr, chr) {
      ptr--;
      do {
        ptr++;
        var val = HEAP[ptr];
        if (val == chr) return ptr;
      } while (val);
      return 0;
    }
  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAP[(px)+(i)];
        var y = HEAP[(py)+(i)];
        if (x == y && x == 0) return 0;
        if (x == 0) return -1;
        if (y == 0) return 1;
        if (x == y) {
          i ++;
          continue;
        } else {
          return x > y ? 1 : -1;
        }
      }
      return 0;
    }function _strcmp(px, py) {
      return _strncmp(px, py, TOTAL_MEMORY);
    }
  function __isFloat(text) {
      return !!(/^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?$/.exec(text));
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[' '] = 1;
        __scanString.whiteSpace['\t'] = 1;
        __scanString.whiteSpace['\n'] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP[(varargs)+(argIndex)];
          argIndex += Runtime.getNativeFieldSize('void*');
          HEAP[argPtr]=soFar;
          formatIndex += 2;
          continue;
        }
        // TODO: Support strings like "%5c" etc.
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'c') {
          var argPtr = HEAP[(varargs)+(argIndex)];
          argIndex += Runtime.getNativeFieldSize('void*');
          fields++;
          next = get();
          HEAP[argPtr]=next
          formatIndex += 2;
          continue;
        }
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
        if (format[formatIndex] === '%') {
          formatIndex++;
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if(format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' || type == 'E') {
            var last = 0;
            next = get();
            while (next > 0) {
              buffer.push(String.fromCharCode(next));
              if (__isFloat(buffer.join(''))) {
                last = buffer.length;
              }
              next = get();
            }
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   (type === 'x' && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          var text = buffer.join('');
          var argPtr = HEAP[(varargs)+(argIndex)];
          argIndex += Runtime.getNativeFieldSize('void*');
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP[argPtr]=parseInt(text, 10);
              } else if(longLong) {
                HEAP[argPtr]=parseInt(text, 10);
              } else {
                HEAP[argPtr]=parseInt(text, 10);
              }
              break;
            case 'x':
              HEAP[argPtr]=parseInt(text, 16)
              break;
            case 'f':
            case 'e':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAP[argPtr]=parseFloat(text)
              } else {
                HEAP[argPtr]=parseFloat(text)
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP[(argPtr)+(j)]=array[j]
              }
              break;
          }
          fields++;
        } else if (format[formatIndex] in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      var get = function() { return HEAP[(s)+(index++)]; };
      var unget = function() { index--; };
      return __scanString(format, get, unget, varargs);
    }
  var _floor=Math.floor;
  var _ceil=Math.ceil;
  function _gettimeofday(ptr) {
      // %struct.timeval = type { i32, i32 }
      var now = Date.now();
      HEAP[ptr]=Math.floor(now/1000); // seconds
      HEAP[(ptr)+(4)]=Math.floor((now-1000*Math.floor(now/1000))*1000); // microseconds
      return 0;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STACK);
  var _stdout=allocate(1, "i32*", ALLOC_STACK);
  var _stderr=allocate(1, "i32*", ALLOC_STACK);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STACK);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        FS.ensureRoot();
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function(chunkSize, length) {
            this.length = length;
            this.chunkSize = chunkSize;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % chunkSize;
            var chunkNum = Math.floor(idx / chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var chunkSize = 1024*1024; // Chunk size in bytes
          if (!hasByteServing) chunkSize = datalength;
          // Function to get a range from the remote URL.
          var doXHR = (function(from, to) {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
            // Some hints to the browser that we want binary data.
            if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(xhr.response || []);
            } else {
              return intArrayFromString(xhr.responseText || '', true);
            }
          });
          var lazyArray = new LazyUint8Array(chunkSize, datalength);
          lazyArray.setDataGetter(function(chunkNum) {
            var start = chunkNum * lazyArray.chunkSize;
            var end = (chunkNum+1) * lazyArray.chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },ensureRoot:function () {
        if (FS.root) return;
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureRoot();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function simpleOutput(val) {
          if (val === null || val === 10) {
            output.printer(output.buffer.join(''));
            output.buffer = [];
          } else {
            output.buffer.push(utf8.processCChar(val));
          }
        }
        if (!output) {
          stdoutOverridden = false;
          output = simpleOutput;
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = simpleOutput;
        }
        if (!error.printer) error.printer = Module['print'];
        if (!error.buffer) error.buffer = [];
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
        // Create the I/O devices.
        var devFolder = FS.createFolder('/', 'dev', true, true);
        var stdin = FS.createDevice(devFolder, 'stdin', input);
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        FS.createDevice(devFolder, 'tty', input, output);
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          isTerminal: !stdinOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stdoutOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stderrOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        assert(Math.max(_stdin, _stdout, _stderr) < 128); // make sure these are low, we flatten arrays with these
        HEAP[_stdin]=1;
        HEAP[_stdout]=2;
        HEAP[_stderr]=3;
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_STATIC) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAP[(buf)+(i)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP[(buf)+(i)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }var _vfprintf=_fprintf;
  function _llvm_va_end() {}
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      function ExitStatus() {
        this.name = "ExitStatus";
        this.message = "Program terminated with exit(" + status + ")";
        this.status = status;
        Module.print('Exit Status: ' + status);
      };
      ExitStatus.prototype = new Error();
      ExitStatus.prototype.constructor = ExitStatus;
      exitRuntime();
      ABORT = true;
      throw new ExitStatus();
    }function _exit(status) {
      __exit(status);
    }
var _canvas_draw_text; // stub for _canvas_draw_text
var _canvas_draw_rect; // stub for _canvas_draw_rect
var _canvas_draw_line; // stub for _canvas_draw_line
var _canvas_draw_poly; // stub for _canvas_draw_poly
var _canvas_draw_circle; // stub for _canvas_draw_circle
var _canvas_draw_update; // stub for _canvas_draw_update
var _canvas_clip; // stub for _canvas_clip
var _canvas_unclip; // stub for _canvas_unclip
var _canvas_start_draw; // stub for _canvas_start_draw
var _canvas_end_draw; // stub for _canvas_end_draw
var _canvas_status_bar; // stub for _canvas_status_bar
var _canvas_blitter_new; // stub for _canvas_blitter_new
var _canvas_blitter_free; // stub for _canvas_blitter_free
var _canvas_blitter_save; // stub for _canvas_blitter_save
var _canvas_blitter_load; // stub for _canvas_blitter_load
var _canvas_draw_thick_line; // stub for _canvas_draw_thick_line
var _frontend_set_game_info; // stub for _frontend_set_game_info
var _frontend_add_preset; // stub for _frontend_add_preset
var _canvas_set_palette_entry; // stub for _canvas_set_palette_entry
  function _strcpy(pdest, psrc) {
      pdest = pdest|0; psrc = psrc|0;
      var i = 0;
      do {
        HEAP[(pdest+i)|0]=HEAP[(psrc+i)|0];
        i = (i+1)|0;
      } while ((HEAP[(psrc)+(i-1)])|0 != 0);
      return pdest|0;
    }
  function _toupper(chr) {
      if (chr >= 97 && chr <= 122) {
        return chr - 97 + 65;
      } else {
        return chr;
      }
    }
var _deactivate_timer; // stub for _deactivate_timer
  function _strcat(pdest, psrc) {
      pdest = pdest|0; psrc = psrc|0;
      var i = 0;
      pdest = (pdest + _strlen(pdest))|0;
      do {
        HEAP[pdest+i]=HEAP[psrc+i];
        i = (i+1)|0;
      } while (HEAP[(psrc)+(i-1)] != 0);
      return pdest|0;
    }
var _activate_timer; // stub for _activate_timer
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  function ___errno_location() {
      return ___setErrNo.ret;
    }var ___errno=___errno_location;
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP[ptr]=ret
      }
      return ret;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We need to make sure no one else allocates unfreeable memory!
      // We must control this entirely. So we don't even need to do
      // unfreeable allocations - the HEAP is ours, from STATICTOP up.
      // TODO: We could in theory slice off the top of the HEAP when
      //       sbrk gets a negative increment in |bytes|...
      var self = _sbrk;
      if (!self.called) {
        STATICTOP = alignMemoryPage(STATICTOP); // make sure we start out aligned
        self.called = true;
        _sbrk.DYNAMIC_START = STATICTOP;
      }
      var ret = STATICTOP;
      if (bytes != 0) Runtime.staticAlloc(bytes);
      return ret;  // Previous break location.
    }
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP[_fputc.ret]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return -1;
      } else {
        return chr;
      }
    }
  var _llvm_memset_p0i8_i64=_memset;
  function _memmove(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      if (((src|0) < (dest|0)) & ((dest|0) < ((src + num)|0))) {
        // Unlikely case: Copy backwards in a safe manner
        src = (src + num)|0;
        dest = (dest + num)|0;
        while ((num|0) > 0) {
          dest = (dest - 1)|0;
          src = (src - 1)|0;
          num = (num - 1)|0;
          HEAP[dest]=HEAP[src];
        }
      } else {
        _memcpy(dest, src, num);
      }
    }var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (Browser.initted) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(-3)];
          return ret;
        }
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/.exec(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            setTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'];
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        this.lockPointer = lockPointer;
        this.resizeCanvas = resizeCanvas;
        if (typeof this.lockPointer === 'undefined') this.lockPointer = true;
        if (typeof this.resizeCanvas === 'undefined') this.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!this.fullScreenHandlersInstalled) {
          this.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen(); 
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200) {
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        var flags = HEAP[SDL.screen+Runtime.QUANTUM_SIZE*0];
        flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        HEAP[SDL.screen+Runtime.QUANTUM_SIZE*0]=flags
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        var flags = HEAP[SDL.screen+Runtime.QUANTUM_SIZE*0];
        flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        HEAP[SDL.screen+Runtime.QUANTUM_SIZE*0]=flags
        Browser.updateResizeListeners();
      }};
___buildEnvironment(ENV);
___setErrNo(0);
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
var FUNCTION_TABLE = [0,0,_free_game,0,_canvas_draw_line,0,_linedsf_deductions,0,_grid_new_triangular,0,_grid_size_square
,0,_grid_point_cmp_fn,0,_canvas_draw_update,0,_encode_ui,0,_grid_new_floret,0,_grid_new_dodecagonal
,0,_canvas_draw_rect,0,_black_sort_cmpfn,0,_decode_params,0,_grid_size_honeycomb,0,_grid_size_greathexagonal
,0,_canvas_end_draw,0,_grid_new_greatdodecagonal,0,_game_fetch_preset,0,_game_print_size,0,_game_can_format_as_text_now
,0,_canvas_status_bar,0,_decode_ui,0,_solve_game,0,_grid_edge_bydots_cmpfn,0,_set_faces
,0,_game_changed_state,0,_grid_size_dodecagonal,0,_canvas_draw_circle,0,_white_sort_cmpfn,0,_game_anim_length
,0,_game_set_size,0,_grid_size_greatdodecagonal,0,_grid_size_penrose_p2_kite,0,_execute_move,0,_game_new_drawstate
,0,_canvas_start_draw,0,_default_params,0,_canvas_text_fallback,0,_grid_new_kites,0,_free_ui
,0,_grid_size_floret,0,_interpret_move,0,_loop_deductions,0,_grid_size_cairo,0,_game_free_drawstate
,0,_grid_size_snubsquare,0,_grid_new_penrose_p3_thick,0,_grid_new_greathexagonal,0,_grid_new_octagonal,0,_trivial_deductions
,0,_validate_params,0,_validate_desc,0,_grid_size_octagonal,0,_grid_new_square,0,_custom_params
,0,_game_compute_size,0,_game_configure,0,_game_status,0,_encode_params,0,_canvas_draw_text
,0,_game_timing_state,0,_canvas_blitter_load,0,_game_flash_length,0,_canvas_blitter_free,0,_canvas_blitter_save
,0,_grid_new_snubsquare,0,_new_game_desc,0,_grid_size_penrose_p3_thick,0,_grid_size_kites,0,_dup_game
,0,_grid_size_triangular,0,_grid_new_cairo,0,_grid_new_honeycomb,0,_game_print,0,_canvas_unclip
,0,_canvas_draw_thick_line,0,_free_params,0,_grid_new_penrose_p2_kite,0,_canvas_clip,0,_game_redraw
,0,_dline_deductions,0,_new_ui,0,_dup_params,0,_game_text_format,0,_canvas_blitter_new,0,_game_colours,0,_canvas_draw_poly,0,_new_game,0];
// EMSCRIPTEN_START_FUNCS
function _decode_params(r1,r2){var r3,r4,r5,r6,r7;r3=r1;r1=r2;r2=_atoi(r1);HEAP[r3|0]=r2;HEAP[r3+4|0]=r2;HEAP[r3+8|0]=0;r2=r1;L1:do{if((HEAP[r1]<<24>>24|0)!=0){r4=r2;while(1){r5=r1;if((((HEAP[r4]&255)-48|0)>>>0<10&1|0)==0){r6=r5;break L1}r1=r5+1|0;r5=r1;if((HEAP[r1]<<24>>24|0)!=0){r4=r5}else{r6=r5;break L1}}}else{r6=r2}}while(0);L6:do{if((HEAP[r6]<<24>>24|0)==120){r1=r1+1|0;r2=_atoi(r1);HEAP[r3+4|0]=r2;if((HEAP[r1]<<24>>24|0)==0){break}while(1){if((((HEAP[r1]&255)-48|0)>>>0<10&1|0)==0){break L6}r1=r1+1|0;if((HEAP[r1]<<24>>24|0)==0){break L6}}}}while(0);L12:do{if((HEAP[r1]<<24>>24|0)==116){r1=r1+1|0;r6=_atoi(r1);HEAP[r3+12|0]=r6;if((HEAP[r1]<<24>>24|0)==0){break}while(1){if((((HEAP[r1]&255)-48|0)>>>0<10&1|0)==0){break L12}r1=r1+1|0;if((HEAP[r1]<<24>>24|0)==0){break L12}}}}while(0);if((HEAP[r1]<<24>>24|0)!=100){return}r1=r1+1|0;r6=0;r2=HEAP[r1];while(1){if((r2<<24>>24|0)==(HEAP[r6+33716|0]<<24>>24|0)){HEAP[r3+8|0]=r6}r4=r6+1|0;r6=r4;r7=HEAP[r1];if((r4|0)<4){r2=r7}else{break}}if(r7<<24>>24==0){return}r1=r1+1|0;return}function _encode_params(r1,r2){var r3,r4,r5,r6,r7,r8;r3=STACKTOP;STACKTOP=STACKTOP+80|0;r4=r3;r5=r1;r1=HEAP[r5+4|0];r6=HEAP[r5+12|0];_sprintf(r4|0,34576,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP[tempInt]=HEAP[r5|0],HEAP[tempInt+4]=r1,HEAP[tempInt+8]=r6,tempInt));if((r2|0)==0){r7=r4|0;r8=_dupstr(r7);STACKTOP=r3;return r8}_sprintf(r4+_strlen(r4|0)|0,34548,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[HEAP[r5+8|0]+33716|0]<<24>>24,tempInt));r7=r4|0;r8=_dupstr(r7);STACKTOP=r3;return r8}function _free_params(r1){var r2,r3;r2=STACKTOP;STACKTOP=STACKTOP+4|0;r3=r2;HEAP[r3]=r1;if((HEAP[r3]|0)!=0){_free(HEAP[r3])}STACKTOP=r2;return}function _validate_params(r1,r2){var r3,r4;r2=r1;do{if((HEAP[r2+12|0]|0)>=0){if(HEAP[r2+12|0]>>>0>=13){break}do{if((HEAP[r2|0]|0)>=(HEAP[(HEAP[r2+12|0]<<4)+33436|0]|0)){if((HEAP[r2+4|0]|0)<(HEAP[(HEAP[r2+12|0]<<4)+33436|0]|0)){break}do{if((HEAP[r2|0]|0)<(HEAP[(HEAP[r2+12|0]<<4)+33440|0]|0)){if((HEAP[r2+4|0]|0)>=(HEAP[(HEAP[r2+12|0]<<4)+33440|0]|0)){break}r3=HEAP[(HEAP[r2+12|0]<<4)+33448|0];r4=r3;return r4}}while(0);if((HEAP[r2+8|0]|0)>=4){___assert_func(34104,651,37356,35316)}r3=0;r4=r3;return r4}}while(0);r3=HEAP[(HEAP[r2+12|0]<<4)+33444|0];r4=r3;return r4}}while(0);r3=35352;r4=r3;return r4}function _default_params(){var r1,r2,r3,r4;r1=STACKTOP;STACKTOP=STACKTOP+8|0;r2=r1;r3=r1+4;HEAP[r2]=16;r4=_malloc(HEAP[r2]);HEAP[r3]=r4;if((HEAP[r3]|0)!=0){r4=HEAP[r3];HEAP[r4+4|0]=10;HEAP[r4|0]=10;HEAP[r4+8|0]=0;HEAP[r4+12|0]=0;STACKTOP=r1;return r4}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _game_fetch_preset(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12;r4=STACKTOP;STACKTOP=STACKTOP+88|0;r5=r4;r6=r4+4;r7=r4+8;r8=r1;r1=r2;r2=r3;if((r8|0)<0|r8>>>0>=15){r9=0;r10=r9;STACKTOP=r4;return r10}HEAP[r5]=16;r3=_malloc(HEAP[r5]);HEAP[r6]=r3;if((HEAP[r6]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r3=HEAP[r6];r6=r3;r5=(r8<<4)+32992|0;for(r8=r5,r11=r6,r12=r8+16;r8<r12;r8++,r11++){HEAP[r11]=HEAP[r8]}HEAP[r2]=r3;r2=HEAP[r3|0];r6=HEAP[(HEAP[r3+12|0]<<2)+33280|0];r5=HEAP[(HEAP[r3+8|0]<<2)+33700|0];_sprintf(r7|0,34532,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP[tempInt]=HEAP[r3+4|0],HEAP[tempInt+4]=r2,HEAP[tempInt+8]=r6,HEAP[tempInt+12]=r5,tempInt));r5=_dupstr(r7|0);HEAP[r1]=r5;r9=1;r10=r9;STACKTOP=r4;return r10}function _dup_params(r1){var r2,r3,r4,r5,r6,r7;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=r2+4;HEAP[r3]=16;r5=_malloc(HEAP[r3]);HEAP[r4]=r5;if((HEAP[r4]|0)!=0){r5=HEAP[r4];r4=r5;r3=r1;for(r1=r3,r6=r4,r7=r1+16;r1<r7;r1++,r6++){HEAP[r6]=HEAP[r1]}STACKTOP=r2;return r5}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _game_configure(r1){var r2,r3,r4,r5,r6;r2=STACKTOP;STACKTOP=STACKTOP+88|0;r3=r2;r4=r2+4;r5=r2+8;r6=r1;HEAP[r3]=80;r1=_malloc(HEAP[r3]);HEAP[r4]=r1;if((HEAP[r4]|0)!=0){r1=HEAP[r4];HEAP[r1|0]=34804;HEAP[r1+4|0]=0;_sprintf(r5|0,35876,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[r6|0],tempInt));r4=_dupstr(r5|0);HEAP[r1+8|0]=r4;HEAP[r1+12|0]=0;HEAP[r1+16|0]=34796;HEAP[r1+20|0]=0;_sprintf(r5|0,35876,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[r6+4|0],tempInt));r4=_dupstr(r5|0);HEAP[r1+24|0]=r4;HEAP[r1+28|0]=0;HEAP[r1+32|0]=34784;HEAP[r1+36|0]=1;HEAP[r1+40|0]=34628;HEAP[r1+44|0]=HEAP[r6+12|0];HEAP[r1+48|0]=34616;HEAP[r1+52|0]=1;HEAP[r1+56|0]=34588;HEAP[r1+60|0]=HEAP[r6+8|0];HEAP[r1+64|0]=0;HEAP[r1+68|0]=3;HEAP[r1+72|0]=0;HEAP[r1+76|0]=0;STACKTOP=r2;return r1}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _custom_params(r1){var r2,r3,r4,r5;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=r2+4;r5=r1;HEAP[r3]=16;r1=_malloc(HEAP[r3]);HEAP[r4]=r1;if((HEAP[r4]|0)!=0){r1=HEAP[r4];r4=_atoi(HEAP[r5+8|0]);HEAP[r1|0]=r4;r4=_atoi(HEAP[r5+24|0]);HEAP[r1+4|0]=r4;HEAP[r1+12|0]=HEAP[r5+44|0];HEAP[r1+8|0]=HEAP[r5+60|0];STACKTOP=r2;return r1}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _new_game_desc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154;r4=0;r3=STACKTOP;STACKTOP=STACKTOP+807|0;r5=r3;r6=r3+4;r7=r3+8;r8=r3+12;r9=r3+16;r10=r3+20;r11=r3+24;r12=r3+28;r13=r3+32;r14=r3+36;r15=r3+40;r16=r3+44;r17=r3+48;r18=r3+52;r19=r3+56;r20=r3+60;r21=r3+64;r22=r3+68;r23=r3+72;r24=r3+76;r25=r3+80;r26=r3+84;r27=r3+88;r28=r3+92;r29=r3+96;r30=r3+100;r31=r3+104;r32=r3+108;r33=r3+112;r34=r3+116;r35=r3+120;r36=r3+124;r37=r3+128;r38=r3+132;r39=r3+136;r40=r3+140;r41=r3+144;r42=r3+148;r43=r3+152;r44=r3+156;r45=r3+160;r46=r3+164;r47=r3+168;r48=r3+172;r49=r3+176;r50=r3+180;r51=r3+184;r52=r3+188;r53=r3+192;r54=r3+196;r55=r3+200;r56=r3+204;r57=r3+208;r58=r3+212;r59=r3+216;r60=r3+220;r61=r3+224;r62=r3+228;r63=r3+232;r64=r3+236;r65=r3+240;r66=r3+244;r67=r3+248;r68=r3+252;r69=r3+256;r70=r3+260;r71=r3+264;r72=r3+268;r73=r3+272;r74=r3+276;r75=r3+280;r76=r3+284;r77=r3+288;r78=r3+292;r79=r3+296;r80=r3+300;r81=r3+304;r82=r3+308;r83=r3+312;r84=r3+316;r85=r3+320;r86=r3+324;r87=r3+328;r88=r3+332;r89=r3+336;r90=r3+340;r91=r3+344;r92=r3+348;r93=r3+352;r94=r3+356;r95=r3+360;r96=r3+364;r97=r3+368;r98=r3+372;r99=r3+376;r100=r3+380;r101=r3+384;r102=r3+388;r103=r3+392;r104=r3+396;r105=r3+400;r106=r3+404;r107=r3+408;r108=r3+412;r109=r3+416;r110=r3+420;r111=r3+424;r112=r3+428;r113=r3+432;r114=r3+436;r115=r3+440;r116=r3+444;r117=r3+448;r118=r3+452;r119=r3+456;r120=r3+460;r121=r3+464;r122=r3+468;r123=r3+472;r124=r3+476;r125=r3+480;r126=r3+484;r127=r3+496;r128=r3+500;r129=r3+504;r130=r3+508;r131=r3+516;r132=r3+520;r133=r3+775;r134=r3+779;r135=r3+783;r136=r3+787;r137=r3+791;r138=r3+795;r139=r3+799;r140=r3+803;r141=r1;r1=r2;HEAP[r139]=28;r2=_malloc(HEAP[r139]);HEAP[r140]=r2;if((HEAP[r140]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r2=HEAP[r140];r140=HEAP[r141|0];r139=HEAP[r141+4|0];HEAP[r135]=HEAP[(HEAP[r141+12|0]<<2)+33332|0];HEAP[r136]=r140;HEAP[r137]=r139;HEAP[r138]=r1;if((HEAP[r135]|0)!=11&(HEAP[r135]|0)!=12){HEAP[r134]=0}else{r139=HEAP[r136];r136=HEAP[r137];r137=HEAP[r138];HEAP[r122]=HEAP[r135];HEAP[r123]=r139;HEAP[r124]=r136;HEAP[r125]=r137;HEAP[r126]=100;HEAP[r133]=(HEAP[r122]|0)==11?0:1;_penrose_calculate_size(HEAP[r133],HEAP[r126],HEAP[r123],HEAP[r124],r130,r3+488,r3+492);r126=HEAP[r130];r130=r126-Math.sqrt(Math.imul(HEAP[r123],HEAP[r123])+Math.imul(HEAP[r124],HEAP[r124])|0)&-1;HEAP[r131]=r130;while(1){r130=_random_upto(HEAP[r125],HEAP[r131]<<1);HEAP[r127]=r130-HEAP[r131]|0;r130=_random_upto(HEAP[r125],HEAP[r131]<<1);HEAP[r128]=r130-HEAP[r131]|0;if(Math.sqrt(Math.imul(HEAP[r127],HEAP[r127])+Math.imul(HEAP[r128],HEAP[r128])|0)<=(HEAP[r131]|0)){break}}r131=_random_upto(HEAP[r125],10)*36&-1;HEAP[r129]=r131;r131=HEAP[r128];r128=HEAP[r129];_sprintf(r132|0,34520,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP[tempInt]=HEAP[r127],HEAP[tempInt+4]=r131,HEAP[tempInt+8]=r128,tempInt));r128=_dupstr(r132|0);HEAP[r134]=r128}r128=HEAP[r134];r134=_loopy_generate_grid(r141,r128);r132=r134;HEAP[r2|0]=r134;HEAP[r120]=HEAP[r132|0];r134=_malloc(HEAP[r120]);HEAP[r121]=r134;if((r134|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r2+4|0]=HEAP[r121];HEAP[r118]=HEAP[r132+8|0];r121=_malloc(HEAP[r118]);HEAP[r119]=r121;if((HEAP[r119]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r2+8|0]=HEAP[r119];HEAP[r116]=HEAP[r132+8|0];r119=_malloc(HEAP[r116]);HEAP[r117]=r119;if((HEAP[r117]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r2+12|0]=HEAP[r117];HEAP[r2+24|0]=HEAP[r141+12|0];L105:while(1){r117=HEAP[r2+8|0];r119=HEAP[r132+8|0];for(r142=r117,r143=r142+r119;r142<r143;r142++){HEAP[r142]=1}r119=HEAP[r2+12|0];r117=HEAP[r132+8|0];for(r142=r119,r143=r142+r117;r142<r143;r142++){HEAP[r142]=0}HEAP[r2+20|0]=0;HEAP[r2+16|0]=0;while(1){HEAP[r105]=r2;HEAP[r106]=r1;HEAP[r107]=HEAP[HEAP[r105]+4|0];HEAP[r108]=HEAP[HEAP[r105]|0];HEAP[r103]=HEAP[HEAP[r108]|0];r117=_malloc(HEAP[r103]);HEAP[r104]=r117;if((r117|0)==0){r4=84;break L105}HEAP[r109]=HEAP[r104];r117=HEAP[r109];r119=HEAP[r106];HEAP[r70]=HEAP[r108];HEAP[r71]=r117;HEAP[r72]=r119;HEAP[r73]=0;HEAP[r74]=0;HEAP[r77]=HEAP[HEAP[r70]|0];r119=HEAP[r71];r117=HEAP[r77];for(r142=r119,r143=r142+r117;r142<r143;r142++){HEAP[r142]=1}HEAP[r68]=HEAP[r77]*12&-1;r117=_malloc(HEAP[r68]);HEAP[r69]=r117;if((HEAP[r69]|0)==0){r4=86;break L105}HEAP[r78]=HEAP[r69];HEAP[r75]=0;r117=HEAP[r72];L111:do{if((HEAP[r75]|0)<(HEAP[r77]|0)){r119=r117;while(1){r116=_random_bits(r119,31);HEAP[HEAP[r78]+(HEAP[r75]*12&-1)+8|0]=r116;HEAP[HEAP[r78]+(HEAP[r75]*12&-1)|0]=0;HEAP[HEAP[r78]+(HEAP[r75]*12&-1)+4|0]=0;HEAP[r75]=HEAP[r75]+1|0;r116=HEAP[r72];if((HEAP[r75]|0)<(HEAP[r77]|0)){r119=r116}else{r144=r116;break L111}}}else{r144=r117}}while(0);r117=_random_upto(r144,HEAP[r77]);HEAP[r75]=r117;HEAP[HEAP[r71]+HEAP[r75]|0]=0;HEAP[r66]=58;HEAP[r64]=8;r117=_malloc(HEAP[r64]);HEAP[r65]=r117;if((r117|0)==0){r4=90;break L105}HEAP[r67]=HEAP[r65];HEAP[HEAP[r67]|0]=0;HEAP[HEAP[r67]+4|0]=HEAP[r66];HEAP[r81]=HEAP[r67];HEAP[r62]=24;HEAP[r60]=8;r117=_malloc(HEAP[r60]);HEAP[r61]=r117;if((HEAP[r61]|0)==0){r4=92;break L105}HEAP[r63]=HEAP[r61];HEAP[HEAP[r63]|0]=0;HEAP[HEAP[r63]+4|0]=HEAP[r62];HEAP[r82]=HEAP[r63];HEAP[r75]=0;L117:do{if((HEAP[r75]|0)<(HEAP[r77]|0)){while(1){HEAP[r85]=HEAP[HEAP[r70]+4|0]+(HEAP[r75]*24&-1)|0;HEAP[r86]=HEAP[r78]+(HEAP[r75]*12&-1)|0;do{if((HEAP[HEAP[r71]+HEAP[r75]|0]<<24>>24|0)==1){if((_can_colour_face(HEAP[r70],HEAP[r71],HEAP[r75],2)|0)!=0){r117=HEAP[r71];r119=HEAP[r85];HEAP[r56]=HEAP[r70];HEAP[r57]=r117;HEAP[r58]=r119;HEAP[r59]=2;r119=-_face_num_neighbours(HEAP[r56],HEAP[r57],HEAP[r58],HEAP[r59])|0;HEAP[HEAP[r86]+4|0]=r119;_add234(HEAP[r82],HEAP[r86])}if((_can_colour_face(HEAP[r70],HEAP[r71],HEAP[r75],0)|0)==0){break}r119=HEAP[r71];r117=HEAP[r85];HEAP[r52]=HEAP[r70];HEAP[r53]=r119;HEAP[r54]=r117;HEAP[r55]=0;r117=-_face_num_neighbours(HEAP[r52],HEAP[r53],HEAP[r54],HEAP[r55])|0;HEAP[HEAP[r86]|0]=r117;_add234(HEAP[r81],HEAP[r86])}}while(0);HEAP[r75]=HEAP[r75]+1|0;if((HEAP[r75]|0)>=(HEAP[r77]|0)){break L117}}}}while(0);L127:while(1){HEAP[r51]=HEAP[r81];if((HEAP[HEAP[r51]|0]|0)!=0){r117=_countnode234(HEAP[HEAP[r51]|0]);HEAP[r50]=r117}else{HEAP[r50]=0}HEAP[r89]=HEAP[r50];HEAP[r49]=HEAP[r82];if((HEAP[HEAP[r49]|0]|0)!=0){r117=_countnode234(HEAP[HEAP[r49]|0]);HEAP[r48]=r117}else{HEAP[r48]=0}r117=HEAP[r48];HEAP[r90]=r117;do{if((HEAP[r89]|0)==0){if((HEAP[r90]|0)==0){break L127}if((HEAP[r89]|0)==0){r4=111;break}r145=HEAP[r90];r4=110;break}else{r145=r117;r4=110}}while(0);do{if(r4==110){r4=0;if((r145|0)!=0){break}else{r4=111;break}}}while(0);if(r4==111){r4=0;___assert_func(36392,374,37928,36692)}r117=(_random_upto(HEAP[r72],2)|0)!=0;HEAP[r87]=r117?0:2;if(r117){HEAP[r88]=HEAP[r81]}else{HEAP[r88]=HEAP[r82]}if((HEAP[r73]|0)!=0){HEAP[r93]=0;HEAP[r95]=0;HEAP[r91]=0;r117=_index234(HEAP[r88],HEAP[r91]);HEAP[r79]=r117;L152:do{if((r117|0)!=0){r119=r117;while(1){if((r119|0)==0){___assert_func(36392,399,37928,35880)}HEAP[r92]=(HEAP[r79]-HEAP[r78]|0)/12&-1;if((HEAP[HEAP[r71]+HEAP[r92]|0]<<24>>24|0)!=1){___assert_func(36392,401,37928,35484)}HEAP[HEAP[r71]+HEAP[r92]|0]=HEAP[r87]&255;r116=FUNCTION_TABLE[HEAP[r73]](HEAP[r74],HEAP[r71],HEAP[r92]);HEAP[r94]=r116;HEAP[HEAP[r71]+HEAP[r92]|0]=1;FUNCTION_TABLE[HEAP[r73]](HEAP[r74],HEAP[r71],HEAP[r92]);do{if((HEAP[r93]|0)!=0){if((HEAP[r94]|0)>(HEAP[r95]|0)){r4=123;break}else{break}}else{r4=123}}while(0);if(r4==123){r4=0;HEAP[r95]=HEAP[r94];HEAP[r93]=HEAP[r79]}HEAP[r91]=HEAP[r91]+1|0;r116=_index234(HEAP[r88],HEAP[r91]);HEAP[r79]=r116;if((r116|0)!=0){r119=r116}else{break L152}}}}while(0);r117=HEAP[r93];HEAP[r79]=r117;r146=r117}else{r117=_index234(HEAP[r88],0);HEAP[r79]=r117;r146=r117}if((r146|0)==0){___assert_func(36392,416,37928,35880)}HEAP[r75]=(HEAP[r79]-HEAP[r78]|0)/12&-1;if((HEAP[HEAP[r71]+HEAP[r75]|0]<<24>>24|0)!=1){___assert_func(36392,418,37928,34892)}HEAP[HEAP[r71]+HEAP[r75]|0]=HEAP[r87]&255;if((HEAP[r73]|0)!=0){FUNCTION_TABLE[HEAP[r73]](HEAP[r74],HEAP[r71],HEAP[r75])}_del234(HEAP[r81],HEAP[r79]);_del234(HEAP[r82],HEAP[r79]);HEAP[r80]=HEAP[HEAP[r70]+4|0]+(HEAP[r75]*24&-1)|0;HEAP[r75]=0;if((HEAP[r75]|0)>=(HEAP[HEAP[r80]|0]|0)){continue}while(1){HEAP[r96]=HEAP[(HEAP[r75]<<2)+HEAP[HEAP[r80]+8|0]|0];HEAP[r76]=0;L180:do{if((HEAP[r76]|0)<(HEAP[HEAP[r96]|0]|0)){while(1){r117=HEAP[(HEAP[r76]<<2)+HEAP[HEAP[r96]+8|0]|0];HEAP[r97]=r117;do{if((r117|0)!=0){if((HEAP[r97]|0)==(HEAP[r80]|0)|(HEAP[r97]|0)==0){break}if((HEAP[HEAP[r71]+((HEAP[r97]-HEAP[HEAP[r70]+4|0]|0)/24&-1)|0]<<24>>24|0)!=1){break}HEAP[r98]=(HEAP[r97]-HEAP[HEAP[r70]+4|0]|0)/24&-1;HEAP[r79]=HEAP[r78]+(HEAP[r98]*12&-1)|0;_del234(HEAP[r81],HEAP[r79]);if((_can_colour_face(HEAP[r70],HEAP[r71],HEAP[r98],0)|0)!=0){r119=HEAP[r71];r116=HEAP[r97];HEAP[r44]=HEAP[r70];HEAP[r45]=r119;HEAP[r46]=r116;HEAP[r47]=0;r116=-_face_num_neighbours(HEAP[r44],HEAP[r45],HEAP[r46],HEAP[r47])|0;HEAP[HEAP[r79]|0]=r116;_add234(HEAP[r81],HEAP[r79])}_del234(HEAP[r82],HEAP[r79]);if((_can_colour_face(HEAP[r70],HEAP[r71],HEAP[r98],2)|0)==0){break}r116=HEAP[r71];r119=HEAP[r97];HEAP[r40]=HEAP[r70];HEAP[r41]=r116;HEAP[r42]=r119;HEAP[r43]=2;r119=-_face_num_neighbours(HEAP[r40],HEAP[r41],HEAP[r42],HEAP[r43])|0;HEAP[HEAP[r79]+4|0]=r119;_add234(HEAP[r82],HEAP[r79])}}while(0);HEAP[r76]=HEAP[r76]+1|0;if((HEAP[r76]|0)>=(HEAP[HEAP[r96]|0]|0)){break L180}}}}while(0);HEAP[r75]=HEAP[r75]+1|0;if((HEAP[r75]|0)>=(HEAP[HEAP[r80]|0]|0)){continue L127}}}HEAP[r39]=HEAP[r81];_freenode234(HEAP[HEAP[r39]|0]);HEAP[r38]=HEAP[r39];if((HEAP[r38]|0)!=0){_free(HEAP[r38])}HEAP[r37]=HEAP[r82];_freenode234(HEAP[HEAP[r37]|0]);r117=HEAP[r37];HEAP[r36]=r117;if((r117|0)!=0){_free(HEAP[r36])}r117=HEAP[r78];HEAP[r35]=r117;if((r117|0)!=0){_free(HEAP[r35])}HEAP[r33]=HEAP[r77]<<2;r117=_malloc(HEAP[r33]);HEAP[r34]=r117;if((r117|0)==0){r4=151;break L105}HEAP[r83]=HEAP[r34];HEAP[r75]=0;L204:do{if((HEAP[r75]|0)<(HEAP[r77]|0)){while(1){HEAP[(HEAP[r75]<<2)+HEAP[r83]|0]=HEAP[r75];HEAP[r75]=HEAP[r75]+1|0;if((HEAP[r75]|0)>=(HEAP[r77]|0)){break L204}}}}while(0);_shuffle(HEAP[r83],HEAP[r77],HEAP[r72]);HEAP[r84]=0;while(1){HEAP[r99]=0;HEAP[r75]=0;L210:do{if((HEAP[r75]|0)<(HEAP[r77]|0)){while(1){HEAP[r100]=HEAP[(HEAP[r75]<<2)+HEAP[r83]|0];HEAP[r101]=(HEAP[HEAP[r71]+HEAP[r100]|0]<<24>>24|0)==0?2:0;do{if((_can_colour_face(HEAP[r70],HEAP[r71],HEAP[r100],HEAP[r101])|0)!=0){HEAP[r102]=HEAP[HEAP[r70]+4|0]+(HEAP[r100]*24&-1)|0;if((HEAP[r84]|0)!=0){if((_random_upto(HEAP[r72],10)|0)!=0){break}HEAP[HEAP[r71]+HEAP[r100]|0]=HEAP[r101]&255;break}else{if((_face_num_neighbours(HEAP[r70],HEAP[r71],HEAP[r102],HEAP[r101])|0)!=1){break}HEAP[HEAP[r71]+HEAP[r100]|0]=HEAP[r101]&255;HEAP[r99]=1;break}}}while(0);HEAP[r75]=HEAP[r75]+1|0;if((HEAP[r75]|0)>=(HEAP[r77]|0)){break L210}}}}while(0);if((HEAP[r84]|0)!=0){break}if((HEAP[r99]|0)!=0){continue}HEAP[r84]=1}HEAP[r32]=HEAP[r83];if((HEAP[r32]|0)!=0){_free(HEAP[r32])}r117=HEAP[r107];r119=HEAP[HEAP[r108]|0];for(r142=r117,r143=r142+r119;r142<r143;r142++){HEAP[r142]=0}HEAP[r110]=0;L228:do{if((HEAP[r110]|0)<(HEAP[HEAP[r108]+8|0]|0)){while(1){HEAP[r111]=(HEAP[r110]<<4)+HEAP[HEAP[r108]+12|0]|0;r119=HEAP[HEAP[r111]+8|0];HEAP[r112]=r119;r117=HEAP[HEAP[r111]+12|0];HEAP[r113]=r117;if((r119|0)==0){r147=2;r148=r117}else{r147=HEAP[HEAP[r109]+((HEAP[r112]-HEAP[HEAP[r108]+4|0]|0)/24&-1)|0]<<24>>24;r148=HEAP[r113]}HEAP[r114]=r147;if((r148|0)==0){r149=2;r150=r147}else{r149=HEAP[HEAP[r109]+((HEAP[r113]-HEAP[HEAP[r108]+4|0]|0)/24&-1)|0]<<24>>24;r150=HEAP[r114]}HEAP[r115]=r149;if((r150|0)!=1){r151=r149}else{___assert_func(34104,1301,38132,35400);r151=HEAP[r115]}if((r151|0)==1){___assert_func(34104,1302,38132,35372)}do{if((HEAP[r114]|0)!=(HEAP[r115]|0)){if((HEAP[r112]|0)!=0){r117=HEAP[r107]+((HEAP[r112]-HEAP[HEAP[r108]+4|0]|0)/24&-1)|0;HEAP[r117]=HEAP[r117]+1&255}if((HEAP[r113]|0)==0){break}r117=HEAP[r107]+((HEAP[r113]-HEAP[HEAP[r108]+4|0]|0)/24&-1)|0;HEAP[r117]=HEAP[r117]+1&255}}while(0);HEAP[r110]=HEAP[r110]+1|0;if((HEAP[r110]|0)>=(HEAP[HEAP[r108]+8|0]|0)){break L228}}}}while(0);r117=HEAP[r109];HEAP[r31]=r117;if((r117|0)!=0){_free(HEAP[r31])}if(!((_game_has_unique_soln(r2,HEAP[r141+8|0])|0)!=0^1)){break}}r117=HEAP[r141+8|0];HEAP[r23]=r2;HEAP[r24]=r1;HEAP[r25]=r117;HEAP[r27]=HEAP[HEAP[HEAP[r23]|0]|0];r117=_dup_game(HEAP[r23]);HEAP[r28]=r117;HEAP[r21]=HEAP[r27]<<2;r117=_malloc(HEAP[r21]);HEAP[r22]=r117;if((HEAP[r22]|0)==0){r4=187;break}HEAP[r26]=HEAP[r22];HEAP[r30]=0;L256:do{if((HEAP[r30]|0)<(HEAP[r27]|0)){while(1){HEAP[(HEAP[r30]<<2)+HEAP[r26]|0]=HEAP[r30];HEAP[r30]=HEAP[r30]+1|0;if((HEAP[r30]|0)>=(HEAP[r27]|0)){break L256}}}}while(0);_shuffle(HEAP[r26],HEAP[r27],HEAP[r24]);HEAP[r30]=0;L260:do{if((HEAP[r30]|0)<(HEAP[r27]|0)){while(1){r117=_dup_game(HEAP[r28]);HEAP[r29]=r117;HEAP[HEAP[HEAP[r28]+4|0]+HEAP[(HEAP[r30]<<2)+HEAP[r26]|0]|0]=-1;if((_game_has_unique_soln(HEAP[r28],HEAP[r25])|0)!=0){_free_game(HEAP[r29])}else{_free_game(HEAP[r28]);HEAP[r28]=HEAP[r29]}HEAP[r30]=HEAP[r30]+1|0;if((HEAP[r30]|0)>=(HEAP[r27]|0)){break L260}}}}while(0);r117=HEAP[r26];HEAP[r20]=r117;if((r117|0)!=0){_free(HEAP[r20])}r117=HEAP[r28];_free_game(r2);r2=r117;if((HEAP[r141+8|0]|0)<=0){r4=199;break}if((_game_has_unique_soln(r2,HEAP[r141+8|0]-1|0)|0)==0){r4=199;break}}if(r4==92){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==84){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==86){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==90){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==151){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==187){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==199){HEAP[r12]=r2;HEAP[r13]=HEAP[HEAP[r12]|0];HEAP[r15]=HEAP[HEAP[r13]|0];HEAP[r10]=HEAP[r15]+1|0;r13=_malloc(HEAP[r10]);HEAP[r11]=r13;if((r13|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r16]=HEAP[r11];HEAP[r17]=HEAP[r16];HEAP[r18]=0;HEAP[r19]=0;do{if((HEAP[r19]|0)<(HEAP[r15]|0)){while(1){r11=HEAP[r18];if((HEAP[HEAP[HEAP[r12]+4|0]+HEAP[r19]|0]<<24>>24|0)<0){if((r11|0)>25){r13=HEAP[r17];HEAP[r13]=HEAP[r18]+96&255;HEAP[r13+1|0]=0;HEAP[r17]=HEAP[r17]+1|0;HEAP[r18]=0}HEAP[r18]=HEAP[r18]+1|0}else{if((r11|0)!=0){r11=HEAP[r17];HEAP[r11]=HEAP[r18]+96&255;HEAP[r11+1|0]=0;HEAP[r17]=HEAP[r17]+1|0;HEAP[r18]=0}r11=HEAP[r17];do{if((HEAP[HEAP[HEAP[r12]+4|0]+HEAP[r19]|0]<<24>>24|0)<0){r152=32}else{r13=HEAP[HEAP[HEAP[r12]+4|0]+HEAP[r19]|0]<<24>>24;if((HEAP[HEAP[HEAP[r12]+4|0]+HEAP[r19]|0]<<24>>24|0)<10){r152=r13+48|0;break}else{r152=r13+55|0;break}}}while(0);HEAP[r11]=r152&255;HEAP[r11+1|0]=0;HEAP[r17]=HEAP[r17]+1|0}HEAP[r19]=HEAP[r19]+1|0;if((HEAP[r19]|0)>=(HEAP[r15]|0)){break}}if((HEAP[r18]|0)==0){break}r13=HEAP[r17];HEAP[r13]=HEAP[r18]+96&255;HEAP[r13+1|0]=0;HEAP[r17]=HEAP[r17]+1|0}}while(0);r17=_dupstr(HEAP[r16]);HEAP[r14]=r17;r17=HEAP[r16];HEAP[r9]=r17;if((r17|0)!=0){_free(HEAP[r9])}r9=HEAP[r14];_free_game(r2);if((r128|0)!=0){r2=_strlen(r128)+_strlen(r9)+2|0;HEAP[r7]=r2;r2=_malloc(HEAP[r7]);HEAP[r8]=r2;if((HEAP[r8]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r153=HEAP[r8];_sprintf(r153,35708,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP[tempInt]=r128,HEAP[tempInt+4]=95,HEAP[tempInt+8]=r9,tempInt));HEAP[r6]=r128;if((HEAP[r6]|0)!=0){_free(HEAP[r6])}r6=r9;HEAP[r5]=r6;if((r6|0)!=0){_free(HEAP[r5])}}else{r153=r9}if((_validate_desc(r141,r153)|0)==0){r154=r153;STACKTOP=r3;return r154}___assert_func(34104,1424,37468,35612);r154=r153;STACKTOP=r3;return r154}}function _game_can_format_as_text_now(r1){var r2;if((HEAP[r1+12|0]|0)!=0){r1=0;r2=r1;return r2}else{r1=1;r2=r1;return r2}}function _validate_desc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;r6=r4+4;r7=r1;HEAP[r6]=r2;r2=0;r1=_extract_grid_desc(r6);r8=_grid_validate_desc(HEAP[(HEAP[r7+12|0]<<2)+33332|0],HEAP[r7|0],HEAP[r7+4|0],r1);if((r8|0)!=0){r9=r8;r10=r9;STACKTOP=r4;return r10}r8=_loopy_generate_grid(r7,r1);if((r1|0)!=0){HEAP[r5]=r1;if((HEAP[r5]|0)!=0){_free(HEAP[r5])}}L342:do{if(HEAP[HEAP[r6]]<<24>>24!=0){L343:while(1){do{if((HEAP[HEAP[r6]]<<24>>24|0)>=48){if((HEAP[HEAP[r6]]<<24>>24|0)<=57){r3=249;break}else{r3=247;break}}else{r3=247}}while(0);do{if(r3==247){r3=0;if((HEAP[HEAP[r6]]<<24>>24|0)>=65){if((HEAP[HEAP[r6]]<<24>>24|0)<=90){r3=249;break}}if(!((HEAP[HEAP[r6]]<<24>>24|0)>=97)){break L343}r2=(HEAP[HEAP[r6]]<<24>>24)-96+r2|0;break}}while(0);if(r3==249){r3=0;r2=r2+1|0}HEAP[r6]=HEAP[r6]+1|0;if(HEAP[HEAP[r6]]<<24>>24==0){break L342}}r9=35812;r10=r9;STACKTOP=r4;return r10}}while(0);if((r2|0)<(HEAP[r8|0]|0)){r9=35760;r10=r9;STACKTOP=r4;return r10}if((r2|0)>(HEAP[r8|0]|0)){r9=35716;r10=r9;STACKTOP=r4;return r10}else{_grid_free(r8);r9=0;r10=r9;STACKTOP=r4;return r10}}function _free_game(r1){var r2,r3,r4,r5,r6,r7;r2=STACKTOP;STACKTOP=STACKTOP+16|0;r3=r2;r4=r2+4;r5=r2+8;r6=r2+12;r7=r1;if((r7|0)==0){STACKTOP=r2;return}_grid_free(HEAP[r7|0]);HEAP[r6]=HEAP[r7+4|0];if((HEAP[r6]|0)!=0){_free(HEAP[r6])}r6=HEAP[r7+8|0];HEAP[r5]=r6;if((r6|0)!=0){_free(HEAP[r5])}r5=HEAP[r7+12|0];HEAP[r4]=r5;if((r5|0)!=0){_free(HEAP[r4])}r4=r7;HEAP[r3]=r4;if((r4|0)!=0){_free(HEAP[r3])}STACKTOP=r2;return}function _solve_game(r1,r2,r3,r4){var r5,r6;r4=0;r3=_new_solver_state(r1,4);r1=_solve_game_rec(r3);if((HEAP[r1+4|0]|0)==0){r4=_encode_solve_move(HEAP[r1|0]);r2=r1;_free_solver_state(r2);r5=r3;_free_solver_state(r5);r6=r4;return r6}else{r4=_encode_solve_move(HEAP[r1|0]);r2=r1;_free_solver_state(r2);r5=r3;_free_solver_state(r5);r6=r4;return r6}}function _new_game(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r1=STACKTOP;STACKTOP=STACKTOP+40|0;r4=r1;r5=r1+4;r6=r1+8;r7=r1+12;r8=r1+16;r9=r1+20;r10=r1+24;r11=r1+28;r12=r1+32;r13=r1+36;r14=r2;HEAP[r13]=r3;HEAP[r11]=28;r3=_malloc(HEAP[r11]);HEAP[r12]=r3;if((HEAP[r12]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r3=HEAP[r12];r12=0;r11=_extract_grid_desc(r13);r2=_loopy_generate_grid(r14,r11);r15=r2;HEAP[r3|0]=r2;if((r11|0)!=0){HEAP[r10]=r11;if((HEAP[r10]|0)!=0){_free(HEAP[r10])}}r10=HEAP[r13];r13=HEAP[r15|0];r11=HEAP[r15+8|0];HEAP[r8]=r13;r15=_malloc(HEAP[r8]);HEAP[r9]=r15;if((r15|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r3+4|0]=HEAP[r9];HEAP[r6]=r11;r9=_malloc(HEAP[r6]);HEAP[r7]=r9;if((HEAP[r7]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r3+8|0]=HEAP[r7];HEAP[r4]=r11;r7=_malloc(HEAP[r4]);HEAP[r5]=r7;if((HEAP[r5]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r3+12|0]=HEAP[r5];HEAP[r3+20|0]=0;HEAP[r3+16|0]=0;HEAP[r3+24|0]=HEAP[r14+12|0];r14=0;if((r14|0)>=(r13|0)){r16=r3;r17=r16+8|0;r18=HEAP[r17];r19=r11;for(r20=r18,r21=r20+r19;r20<r21;r20++){HEAP[r20]=1}r22=r3;r23=r22+12|0;r24=HEAP[r23];r25=r11;for(r20=r24,r21=r20+r25;r20<r21;r20++){HEAP[r20]=0}r26=r3;STACKTOP=r1;return r26}while(1){if((r12|0)!=0){r12=r12-1|0;HEAP[HEAP[r3+4|0]+r14|0]=-1}else{if((HEAP[r10]<<24>>24|0)==0){___assert_func(34104,1464,37484,35856)}r5=(HEAP[r10]<<24>>24)-48|0;r7=(HEAP[r10]<<24>>24)-55|0;do{if((r5|0)>=0&(r5|0)<10){HEAP[HEAP[r3+4|0]+r14|0]=r5&255}else{if((r7|0)>=10&(r7|0)<36){HEAP[HEAP[r3+4|0]+r14|0]=r7&255;break}r5=(HEAP[r10]<<24>>24)-96|0;if((r5|0)<=0){___assert_func(34104,1473,37484,35848)}HEAP[HEAP[r3+4|0]+r14|0]=-1;r12=r5-1|0}}while(0);r10=r10+1|0}r14=r14+1|0;if((r14|0)>=(r13|0)){break}}r16=r3;r17=r16+8|0;r18=HEAP[r17];r19=r11;for(r20=r18,r21=r20+r19;r20<r21;r20++){HEAP[r20]=1}r22=r3;r23=r22+12|0;r24=HEAP[r23];r25=r11;for(r20=r24,r21=r20+r25;r20<r21;r20++){HEAP[r20]=0}r26=r3;STACKTOP=r1;return r26}function _dup_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r2=STACKTOP;STACKTOP=STACKTOP+32|0;r3=r2;r4=r2+4;r5=r2+8;r6=r2+12;r7=r2+16;r8=r2+20;r9=r2+24;r10=r2+28;r11=r1;HEAP[r9]=28;r1=_malloc(HEAP[r9]);HEAP[r10]=r1;if((HEAP[r10]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r1=HEAP[r10];HEAP[r1|0]=HEAP[r11|0];r10=HEAP[r1|0]+44|0;HEAP[r10]=HEAP[r10]+1|0;HEAP[r1+16|0]=HEAP[r11+16|0];HEAP[r1+20|0]=HEAP[r11+20|0];HEAP[r7]=HEAP[HEAP[r11|0]|0];r10=_malloc(HEAP[r7]);HEAP[r8]=r10;if((HEAP[r8]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r1+4|0]=HEAP[r8];r8=HEAP[r1+4|0];r10=HEAP[r11+4|0];r7=HEAP[HEAP[r11|0]|0];for(r12=r10,r13=r8,r14=r12+r7;r12<r14;r12++,r13++){HEAP[r13]=HEAP[r12]}HEAP[r5]=HEAP[HEAP[r11|0]+8|0];r7=_malloc(HEAP[r5]);HEAP[r6]=r7;if((HEAP[r6]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r1+8|0]=HEAP[r6];r6=HEAP[r1+8|0];r7=HEAP[r11+8|0];r5=HEAP[HEAP[r11|0]+8|0];for(r12=r7,r13=r6,r14=r12+r5;r12<r14;r12++,r13++){HEAP[r13]=HEAP[r12]}HEAP[r3]=HEAP[HEAP[r11|0]+8|0];r5=_malloc(HEAP[r3]);HEAP[r4]=r5;if((HEAP[r4]|0)!=0){HEAP[r1+12|0]=HEAP[r4];r4=HEAP[r1+12|0];r5=HEAP[r11+12|0];r3=HEAP[HEAP[r11|0]+8|0];for(r12=r5,r13=r4,r14=r12+r3;r12<r14;r12++,r13++){HEAP[r13]=HEAP[r12]}HEAP[r1+24|0]=HEAP[r11+24|0];STACKTOP=r2;return r1}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _new_ui(r1){return 0}function _free_ui(r1){return}function _encode_ui(r1){return 0}function _decode_ui(r1,r2){return}function _game_changed_state(r1,r2,r3){return}function _game_text_format(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=r2+4;r5=r1;r1=HEAP[r5|0];if((HEAP[r5+24|0]|0)!=0){___assert_func(34104,956,37944,33996)}r6=HEAP[r1+4|0];if((HEAP[r6|0]|0)!=4){___assert_func(34104,960,37944,33880)}r7=HEAP[HEAP[HEAP[r6+8|0]|0]+12|0]-HEAP[HEAP[HEAP[r6+8|0]+8|0]+12|0]|0;r8=(r7|0)>-1?r7:-r7|0;r7=(((HEAP[r1+32|0]-HEAP[r1+24|0]|0)/(r8|0)&-1)<<1)+2|0;r9=(((HEAP[r1+36|0]-HEAP[r1+28|0]|0)/(r8|0)&-1)<<1)+1|0;r10=Math.imul(r9,r7)+1|0;HEAP[r3]=r10;r10=_malloc(HEAP[r3]);HEAP[r4]=r10;if((r10|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r10=HEAP[r4];r4=0;L460:do{if((r4|0)<(r9|0)){while(1){r11=0;r3=Math.imul(r7,r4);L463:do{if((r11|0)<(r7-1|0)){r12=r3;while(1){HEAP[r10+r11+r12|0]=32;r11=r11+1|0;r13=Math.imul(r7,r4);if((r11|0)<(r7-1|0)){r12=r13}else{r14=r13;break L463}}}else{r14=r3}}while(0);HEAP[r10+(r14-1)+r7|0]=10;r4=r4+1|0;if((r4|0)>=(r9|0)){break L460}}}}while(0);r14=r10+Math.imul(r7,r9)|0;HEAP[r14]=0;r14=0;L468:do{if((r14|0)<(HEAP[r1+8|0]|0)){while(1){r9=(r14<<4)+HEAP[r1+12|0]|0;r3=(HEAP[HEAP[r9|0]+16|0]-HEAP[r1+28|0]|0)/(r8|0)&-1;r12=(HEAP[HEAP[r9+4|0]+16|0]-HEAP[r1+28|0]|0)/(r8|0)&-1;r11=((HEAP[HEAP[r9+4|0]+12|0]-HEAP[r1+24|0]|0)/(r8|0)&-1)+((HEAP[HEAP[r9|0]+12|0]-HEAP[r1+24|0]|0)/(r8|0)&-1)|0;r4=r12+r3|0;r9=HEAP[HEAP[r5+8|0]+r14|0]<<24>>24;if((r9|0)==0){r13=r10+Math.imul(r7,r4)+r11|0;HEAP[r13]=((r3|0)==(r12|0)?45:124)&255}else if((r9|0)==2){r12=r10+Math.imul(r7,r4)+r11|0;HEAP[r12]=120}else if((r9|0)!=1){___assert_func(34104,1002,37944,36840)}r14=r14+1|0;if((r14|0)>=(HEAP[r1+8|0]|0)){break L468}}}}while(0);r14=0;if((r14|0)>=(HEAP[r1|0]|0)){r15=r10;STACKTOP=r2;return r15}while(1){r6=HEAP[r1+4|0]+(r14*24&-1)|0;if((HEAP[r6|0]|0)!=4){___assert_func(34104,1011,37944,33880)}r11=((HEAP[HEAP[HEAP[r6+8|0]+8|0]+12|0]-HEAP[r1+24|0]|0)/(r8|0)&-1)+((HEAP[HEAP[HEAP[r6+8|0]|0]+12|0]-HEAP[r1+24|0]|0)/(r8|0)&-1)|0;r4=((HEAP[HEAP[HEAP[r6+8|0]+8|0]+16|0]-HEAP[r1+28|0]|0)/(r8|0)&-1)+((HEAP[HEAP[HEAP[r6+8|0]|0]+16|0]-HEAP[r1+28|0]|0)/(r8|0)&-1)|0;do{if((HEAP[HEAP[r5+4|0]+r14|0]<<24>>24|0)<0){r16=32}else{r9=HEAP[HEAP[r5+4|0]+r14|0]<<24>>24;if((HEAP[HEAP[r5+4|0]+r14|0]<<24>>24|0)<10){r16=r9+48|0;break}else{r16=r9+55|0;break}}}while(0);r9=r10+Math.imul(r7,r4)+r11|0;HEAP[r9]=r16&255;r14=r14+1|0;if((r14|0)>=(HEAP[r1|0]|0)){break}}r15=r10;STACKTOP=r2;return r15}function _interpret_move(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r2=STACKTOP;STACKTOP=STACKTOP+168|0;r7=r2;r8=r2+4;r9=r2+8;r10=r2+12;r11=r2+16;r12=r2+20;r13=r2+24;r14=r2+28;r15=r2+36;r16=r2+40;r17=r2+44;r18=r2+48;r19=r2+52;r20=r2+60;r21=r2+64;r22=r2+68;r23=r2+72;r24=r2+76;r25=r2+80;r26=r2+88;r27=r1;r1=r3;r3=r4;r4=r5;r5=r6;r6=HEAP[r27|0];r28=32;r5=r5&-28673;r3=r3-((HEAP[r1+4|0]|0)/2&-1)|0;r4=r4-((HEAP[r1+4|0]|0)/2&-1)|0;r3=(Math.imul(HEAP[r6+40|0],r3)|0)/(HEAP[r1+4|0]|0)&-1;r4=(Math.imul(HEAP[r6+40|0],r4)|0)/(HEAP[r1+4|0]|0)&-1;r3=r3+HEAP[r6+24|0]|0;r4=r4+HEAP[r6+28|0]|0;HEAP[r15]=r6;HEAP[r16]=r3;HEAP[r17]=r4;HEAP[r19]=0;HEAP[r18]=0;HEAP[r20]=0;L492:do{if((HEAP[r20]|0)<(HEAP[HEAP[r15]+8|0]|0)){while(1){HEAP[r21]=(HEAP[r20]<<4)+HEAP[HEAP[r15]+12|0]|0;r4=Math.imul(HEAP[HEAP[HEAP[r21]|0]+12|0]-HEAP[HEAP[HEAP[r21]+4|0]+12|0]|0,HEAP[HEAP[HEAP[r21]|0]+12|0]-HEAP[HEAP[HEAP[r21]+4|0]+12|0]|0)+Math.imul(HEAP[HEAP[HEAP[r21]|0]+16|0]-HEAP[HEAP[HEAP[r21]+4|0]+16|0]|0,HEAP[HEAP[HEAP[r21]|0]+16|0]-HEAP[HEAP[HEAP[r21]+4|0]+16|0]|0)|0;HEAP[r22]=r4;r4=Math.imul(HEAP[HEAP[HEAP[r21]|0]+12|0]-HEAP[r16]|0,HEAP[HEAP[HEAP[r21]|0]+12|0]-HEAP[r16]|0)+Math.imul(HEAP[HEAP[HEAP[r21]|0]+16|0]-HEAP[r17]|0,HEAP[HEAP[HEAP[r21]|0]+16|0]-HEAP[r17]|0)|0;HEAP[r23]=r4;r4=Math.imul(HEAP[HEAP[HEAP[r21]+4|0]+12|0]-HEAP[r16]|0,HEAP[HEAP[HEAP[r21]+4|0]+12|0]-HEAP[r16]|0)+Math.imul(HEAP[HEAP[HEAP[r21]+4|0]+16|0]-HEAP[r17]|0,HEAP[HEAP[HEAP[r21]+4|0]+16|0]-HEAP[r17]|0)|0;HEAP[r24]=r4;do{if(!((HEAP[r23]|0)>=(HEAP[r24]+HEAP[r22]|0))){if((HEAP[r24]|0)>=(HEAP[r23]+HEAP[r22]|0)){break}r4=HEAP[r17];r3=HEAP[HEAP[HEAP[r21]|0]+12|0];r1=HEAP[HEAP[HEAP[r21]|0]+16|0];r29=HEAP[HEAP[HEAP[r21]+4|0]+12|0];r30=HEAP[HEAP[HEAP[r21]+4|0]+16|0];HEAP[r7]=HEAP[r16];HEAP[r8]=r4;HEAP[r9]=r3;HEAP[r10]=r1;HEAP[r11]=r29;HEAP[r12]=r30;r30=Math.imul(HEAP[r12],HEAP[r9]);r29=Math.imul(HEAP[r10],HEAP[r11]);r1=Math.imul(HEAP[r8],HEAP[r11]);r3=Math.imul(HEAP[r12],HEAP[r7]);r4=Math.imul(HEAP[r10],HEAP[r7])+(r1+r30)+((r3+r29+Math.imul(HEAP[r8],HEAP[r9]))*-1&-1)|0;HEAP[r13]=r4;r4=HEAP[r13];HEAP[r13]=(HEAP[r13]|0)>(-HEAP[r13]|0)?r4:-r4|0;r4=Math.sqrt(Math.imul(HEAP[r9]-HEAP[r11]|0,HEAP[r9]-HEAP[r11]|0)+Math.imul(HEAP[r10]-HEAP[r12]|0,HEAP[r10]-HEAP[r12]|0)|0);HEAP[r14]=r4;HEAP[r25]=(HEAP[r13]|0)/HEAP[r14];if(HEAP[r25]*HEAP[r25]*4>(HEAP[r22]|0)){break}if((HEAP[r18]|0)!=0){if(HEAP[r25]>=HEAP[r19]){break}}HEAP[r18]=HEAP[r21];HEAP[r19]=HEAP[r25]}}while(0);HEAP[r20]=HEAP[r20]+1|0;if((HEAP[r20]|0)>=(HEAP[HEAP[r15]+8|0]|0)){break L492}}}}while(0);r15=HEAP[r18];if((r15|0)==0){r31=0;r32=r31;STACKTOP=r2;return r32}r18=(r15-HEAP[r6+12|0]|0)/16&-1;r6=HEAP[HEAP[r27+8|0]+r18|0]<<24>>24;r27=r5;do{if((r27|0)==513){r28=117}else if((r27|0)==514){r5=r6;if((r5|0)==2){r28=121;break}else if((r5|0)==0){r28=117;break}else if((r5|0)==1){r28=110;break}else{break}}else if((r27|0)==512){r5=r6;if((r5|0)==0){r28=110;break}else if((r5|0)==2){r28=117;break}else if((r5|0)==1){r28=121;break}else{break}}else{r31=0;r32=r31;STACKTOP=r2;return r32}}while(0);_sprintf(r26|0,34380,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=r18,HEAP[tempInt+4]=r28<<24>>24,tempInt));r31=_dupstr(r26|0);r32=r31;STACKTOP=r2;return r32}function _game_set_size(r1,r2,r3,r4){HEAP[r2+4|0]=r4;return}function _game_compute_size(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r5=STACKTOP;STACKTOP=STACKTOP+36|0;r6=r5;r7=r5+4;r8=r5+8;r9=r5+12;r10=r5+16;r11=r5+20;r12=r5+24;r13=r5+28;r14=r5+32;r15=r1;r1=r2;r2=HEAP[r15|0];r16=HEAP[r15+4|0];HEAP[r6]=HEAP[(HEAP[r15+12|0]<<2)+33332|0];HEAP[r7]=r2;HEAP[r8]=r16;HEAP[r9]=r14;HEAP[r10]=r12;HEAP[r11]=r13;FUNCTION_TABLE[HEAP[(HEAP[r6]<<2)+33384|0]](HEAP[r7],HEAP[r8],HEAP[r9],HEAP[r10],HEAP[r11]);r11=(Math.imul(r1,HEAP[r12])|0)/(HEAP[r14]|0)&-1;r12=(Math.imul(r1,HEAP[r13])|0)/(HEAP[r14]|0)&-1;HEAP[r3]=(((r1|0)/2&-1)<<1)+r11+1|0;HEAP[r4]=(((r1|0)/2&-1)<<1)+r12+1|0;STACKTOP=r5;return}function _execute_move(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+160|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r4+24;r12=r4+28;r13=r4+32;r14=r4+36;r15=r4+40;r16=r4+44;r17=r4+48;r18=r4+52;r19=r4+56;r20=r4+60;r21=r4+64;r22=r4+68;r23=r4+72;r24=r4+76;r25=r4+80;r26=r4+84;r27=r4+88;r28=r4+92;r29=r4+96;r30=r4+100;r31=r4+104;r32=r4+108;r33=r4+112;r34=r4+116;r35=r4+120;r36=r4+124;r37=r4+128;r38=r4+132;r39=r4+136;r40=r4+140;r41=r4+144;r42=r4+148;r43=r4+152;r44=r4+156;r45=r2;r2=_dup_game(r1);if((HEAP[r45|0]<<24>>24|0)==83){r45=r45+1|0;HEAP[r2+20|0]=1}L531:do{if(HEAP[r45]<<24>>24!=0){while(1){r1=_atoi(r45);r46=r1;if((r1|0)<0){break}if((r46|0)>=(HEAP[HEAP[r2|0]+8|0]|0)){break}r45=r45+_strspn(r45,34552)|0;r1=r45;r45=r1+1|0;r47=HEAP[r1]<<24>>24;if((r47|0)==121){HEAP[HEAP[r2+8|0]+r46|0]=0}else if((r47|0)==110){HEAP[HEAP[r2+8|0]+r46|0]=2}else if((r47|0)==117){HEAP[HEAP[r2+8|0]+r46|0]=1}else{break}if(HEAP[r45]<<24>>24==0){break L531}}_free_game(r2);r48=0;r49=r48;STACKTOP=r4;return r49}}while(0);HEAP[r21]=r2;HEAP[r22]=HEAP[HEAP[r21]|0];HEAP[r24]=HEAP[HEAP[r22]|0];HEAP[r28]=0;HEAP[r29]=0;r45=HEAP[HEAP[r21]+12|0];r46=HEAP[HEAP[r22]+8|0];for(r50=r45,r51=r50+r46;r50<r51;r50++){HEAP[r50]=0}HEAP[r18]=HEAP[r24]+1<<2;r46=_malloc(HEAP[r18]);HEAP[r19]=r46;if((r46|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r23]=HEAP[r19];r19=HEAP[r24]+1|0;HEAP[r15]=HEAP[r23];HEAP[r16]=r19;HEAP[r17]=0;L547:do{if((HEAP[r17]|0)<(HEAP[r16]|0)){while(1){HEAP[(HEAP[r17]<<2)+HEAP[r15]|0]=6;HEAP[r17]=HEAP[r17]+1|0;if((HEAP[r17]|0)>=(HEAP[r16]|0)){break L547}}}}while(0);HEAP[r25]=0;L551:do{if((HEAP[r25]|0)<(HEAP[HEAP[r22]+8|0]|0)){while(1){HEAP[r30]=(HEAP[r25]<<4)+HEAP[HEAP[r22]+12|0]|0;if((HEAP[HEAP[r30]+8|0]|0)!=0){r52=(HEAP[HEAP[r30]+8|0]-HEAP[HEAP[r22]+4|0]|0)/24&-1}else{r52=HEAP[r24]}HEAP[r31]=r52;if((HEAP[HEAP[r30]+12|0]|0)!=0){r53=(HEAP[HEAP[r30]+12|0]-HEAP[HEAP[r22]+4|0]|0)/24&-1}else{r53=HEAP[r24]}HEAP[r32]=r53;if((HEAP[HEAP[HEAP[r21]+8|0]+HEAP[r25]|0]<<24>>24|0)!=0){r16=HEAP[r31];r17=HEAP[r32];HEAP[r12]=HEAP[r23];HEAP[r13]=r16;HEAP[r14]=r17;_edsf_merge(HEAP[r12],HEAP[r13],HEAP[r14],0)}HEAP[r25]=HEAP[r25]+1|0;if((HEAP[r25]|0)>=(HEAP[HEAP[r22]+8|0]|0)){break L551}}}}while(0);r14=HEAP[r24];HEAP[r10]=HEAP[r23];HEAP[r11]=r14;r14=_edsf_canonify(HEAP[r10],HEAP[r11],0);HEAP[r26]=r14;HEAP[r27]=-1;HEAP[r25]=0;L567:do{if((HEAP[r25]|0)<(HEAP[HEAP[r22]+8|0]|0)){while(1){HEAP[r33]=(HEAP[r25]<<4)+HEAP[HEAP[r22]+12|0]|0;if((HEAP[HEAP[r33]+8|0]|0)!=0){r54=(HEAP[HEAP[r33]+8|0]-HEAP[HEAP[r22]+4|0]|0)/24&-1}else{r54=HEAP[r24]}HEAP[r34]=r54;r14=HEAP[r34];HEAP[r8]=HEAP[r23];HEAP[r9]=r14;r14=_edsf_canonify(HEAP[r8],HEAP[r9],0);HEAP[r35]=r14;if((HEAP[HEAP[r33]+12|0]|0)!=0){r55=(HEAP[HEAP[r33]+12|0]-HEAP[HEAP[r22]+4|0]|0)/24&-1}else{r55=HEAP[r24]}HEAP[r36]=r55;r14=HEAP[r36];HEAP[r6]=HEAP[r23];HEAP[r7]=r14;r14=_edsf_canonify(HEAP[r6],HEAP[r7],0);HEAP[r37]=r14;L579:do{if((HEAP[HEAP[HEAP[r21]+8|0]+HEAP[r25]|0]<<24>>24|0)==0){if((HEAP[r35]|0)==(HEAP[r37]|0)){HEAP[r29]=1;break}HEAP[HEAP[HEAP[r21]+12|0]+HEAP[r25]|0]=1;r14=HEAP[r28];if((r14|0)==0){HEAP[r28]=1}else if((r14|0)==2){break}if((HEAP[r27]|0)==-1){if((HEAP[r35]|0)!=(HEAP[r26]|0)){r14=HEAP[r35];HEAP[r27]=r14;r56=r14}else{r14=HEAP[r37];HEAP[r27]=r14;r56=r14}if((r56|0)==-1){break}}do{if((HEAP[r35]|0)!=(HEAP[r26]|0)){if((HEAP[r35]|0)==(HEAP[r27]|0)){break}HEAP[r28]=2;break L579}}while(0);if((HEAP[r37]|0)==(HEAP[r26]|0)){break}if((HEAP[r37]|0)==(HEAP[r27]|0)){break}HEAP[r28]=2}}while(0);HEAP[r25]=HEAP[r25]+1|0;if((HEAP[r25]|0)>=(HEAP[HEAP[r22]+8|0]|0)){break L567}}}}while(0);r27=HEAP[r23];HEAP[r5]=r27;if((r27|0)!=0){_free(HEAP[r5])}L605:do{if((HEAP[r28]|0)==1){if((HEAP[r29]|0)!=0){r3=444;break}HEAP[r38]=0;HEAP[r25]=0;do{if((HEAP[r25]|0)<(HEAP[r24]|0)){while(1){r5=HEAP[HEAP[HEAP[r21]+4|0]+HEAP[r25]|0]<<24>>24;HEAP[r39]=r5;if((r5|0)>=0){if((_face_order(HEAP[r21],HEAP[r25],0)|0)!=(HEAP[r39]|0)){r3=440;break}}HEAP[r25]=HEAP[r25]+1|0;if((HEAP[r25]|0)>=(HEAP[r24]|0)){r3=442;break}}if(r3==440){HEAP[r38]=1;r3=444;break L605}else if(r3==442){if((HEAP[r38]|0)!=0){r3=444;break L605}else{break}}}}while(0);r5=HEAP[HEAP[r21]+12|0];r27=HEAP[HEAP[r22]+8|0];for(r50=r5,r51=r50+r27;r50<r51;r50++){HEAP[r50]=0}HEAP[r20]=1;r57=1;break}else{r3=444}}while(0);if(r3==444){HEAP[r25]=0;L620:do{if((HEAP[r25]|0)<(HEAP[HEAP[r22]+16|0]|0)){while(1){r50=_dot_order(HEAP[r21],HEAP[r25],0);HEAP[r40]=r50;r50=_dot_order(HEAP[r21],HEAP[r25],1);HEAP[r41]=r50;r50=HEAP[r40];do{if((r50|0)==1){if((HEAP[r41]|0)==0){r3=449;break}r58=HEAP[r40];r3=448;break}else{r58=r50;r3=448}}while(0);do{if(r3==448){r3=0;if((r58|0)>=3){r3=449;break}else{break}}}while(0);L628:do{if(r3==449){r3=0;HEAP[r42]=HEAP[HEAP[r22]+20|0]+(HEAP[r25]*20&-1)|0;HEAP[r43]=0;if((HEAP[r43]|0)>=(HEAP[HEAP[r42]|0]|0)){break}while(1){HEAP[r44]=(HEAP[(HEAP[r43]<<2)+HEAP[HEAP[r42]+4|0]|0]-HEAP[HEAP[r22]+12|0]|0)/16&-1;if((HEAP[HEAP[HEAP[r21]+8|0]+HEAP[r44]|0]<<24>>24|0)==0){HEAP[HEAP[HEAP[r21]+12|0]+HEAP[r44]|0]=1}HEAP[r43]=HEAP[r43]+1|0;if((HEAP[r43]|0)>=(HEAP[HEAP[r42]|0]|0)){break L628}}}}while(0);HEAP[r25]=HEAP[r25]+1|0;if((HEAP[r25]|0)>=(HEAP[HEAP[r22]+16|0]|0)){break L620}}}}while(0);HEAP[r20]=0;r57=0}if((r57|0)!=0){HEAP[r2+16|0]=1}r48=r2;r49=r48;STACKTOP=r4;return r49}function _game_free_drawstate(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r1=STACKTOP;STACKTOP=STACKTOP+24|0;r3=r1;r4=r1+4;r5=r1+8;r6=r1+12;r7=r1+16;r8=r1+20;r9=r2;HEAP[r8]=HEAP[r9+12|0];if((HEAP[r8]|0)!=0){_free(HEAP[r8])}r8=HEAP[r9+16|0];HEAP[r7]=r8;if((r8|0)!=0){_free(HEAP[r7])}r7=HEAP[r9+24|0];HEAP[r6]=r7;if((r7|0)!=0){_free(HEAP[r6])}r6=HEAP[r9+28|0];HEAP[r5]=r6;if((r6|0)!=0){_free(HEAP[r5])}r5=HEAP[r9+20|0];HEAP[r4]=r5;if((r5|0)!=0){_free(HEAP[r4])}r4=r9;HEAP[r3]=r4;if((r4|0)==0){r10=r3;STACKTOP=r1;return}_free(HEAP[r3]);r10=r3;STACKTOP=r1;return}function _game_colours(r1,r2){var r3,r4,r5,r6;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r3+4;HEAP[r4]=112;r6=_malloc(HEAP[r4]);HEAP[r5]=r6;if((HEAP[r5]|0)!=0){r6=HEAP[r5];_frontend_default_colour(r1,r6|0);HEAP[r6+12|0]=0;HEAP[r6+16|0]=0;HEAP[r6+20|0]=0;HEAP[r6+24|0]=HEAP[r6|0]*.8999999761581421;HEAP[r6+28|0]=HEAP[r6+4|0]*.8999999761581421;HEAP[r6+32|0]=0;HEAP[r6+36|0]=1;HEAP[r6+40|0]=1;HEAP[r6+44|0]=1;HEAP[r6+48|0]=1;HEAP[r6+52|0]=0;HEAP[r6+56|0]=0;HEAP[r6+60|0]=0;HEAP[r6+64|0]=0;HEAP[r6+68|0]=0;HEAP[r6+72|0]=HEAP[r6|0]*.8999999761581421;HEAP[r6+76|0]=HEAP[r6+4|0]*.8999999761581421;HEAP[r6+80|0]=HEAP[r6+8|0]*.8999999761581421;HEAP[r2]=7;STACKTOP=r3;return r6}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _game_new_drawstate(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r1=STACKTOP;STACKTOP=STACKTOP+48|0;r3=r1;r4=r1+4;r5=r1+8;r6=r1+12;r7=r1+16;r8=r1+20;r9=r1+24;r10=r1+28;r11=r1+32;r12=r1+36;r13=r1+40;r14=r1+44;r15=r2;HEAP[r13]=32;r2=_malloc(HEAP[r13]);HEAP[r14]=r2;if((HEAP[r14]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r2=HEAP[r14];r14=HEAP[HEAP[r15|0]|0];r13=HEAP[HEAP[r15|0]+8|0];HEAP[r2+4|0]=0;HEAP[r2|0]=0;HEAP[r11]=r13;r15=_malloc(HEAP[r11]);HEAP[r12]=r15;if((HEAP[r12]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r2+20|0]=HEAP[r12];HEAP[r9]=r14;r12=_malloc(HEAP[r9]);HEAP[r10]=r12;if((HEAP[r10]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r2+24|0]=HEAP[r10];HEAP[r7]=r14;r10=_malloc(HEAP[r7]);HEAP[r8]=r10;if((HEAP[r8]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r2+28|0]=HEAP[r8];HEAP[r5]=r14<<2;r8=_malloc(HEAP[r5]);HEAP[r6]=r8;if((HEAP[r6]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r2+12|0]=HEAP[r6];HEAP[r3]=r14<<2;r6=_malloc(HEAP[r3]);HEAP[r4]=r6;if((HEAP[r4]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r2+16|0]=HEAP[r4];HEAP[r2+8|0]=0;r4=HEAP[r2+20|0];r6=r13;for(r16=r4,r17=r16+r6;r16<r17;r16++){HEAP[r16]=1}r6=HEAP[r2+24|0];r4=r14;for(r16=r6,r17=r16+r4;r16<r17;r16++){HEAP[r16]=0}r4=HEAP[r2+28|0];r6=r14;for(r16=r4,r17=r16+r6;r16<r17;r16++){HEAP[r16]=0}r16=0;if((r16|0)>=(r14|0)){r18=r2;STACKTOP=r1;return r18}while(1){HEAP[(r16<<2)+HEAP[r2+16|0]|0]=-1;HEAP[(r16<<2)+HEAP[r2+12|0]|0]=-1;r16=r16+1|0;if((r16|0)>=(r14|0)){break}}r18=r2;STACKTOP=r1;return r18}function _game_anim_length(r1,r2,r3,r4){return 0}function _game_flash_length(r1,r2,r3,r4){var r5,r6;r4=r1;r1=r2;do{if((HEAP[r4+16|0]|0)==0){if((HEAP[r1+16|0]|0)==0){break}if((HEAP[r4+20|0]|0)!=0){break}if((HEAP[r1+20|0]|0)!=0){break}r5=.5;r6=r5;return r6}}while(0);r5=0;r6=r5;return r6}function _game_status(r1){return(HEAP[r1+16|0]|0)!=0?1:0}function _game_redraw(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42;r7=0;r6=STACKTOP;STACKTOP=STACKTOP+196|0;r5=r6;r3=r6+4;r9=r6+8;r10=r6+12;r11=r6+16;r12=r6+20;r13=r6+24;r14=r6+28;r15=r6+32;r16=r6+36;r17=r6+100;r18=r6+164;r19=r6+168;r20=r6+172;r21=r6+176;r22=r6+180;r23=r6+184;r24=r6+188;r25=r6+192;r26=r1;r1=r2;r2=r4;r4=r8;r8=HEAP[r2|0];r27=(HEAP[r1+4|0]|0)/2&-1;r28=0;r29=0;r30=0;if((HEAP[r1|0]|0)==0){r28=1}r31=0;L705:do{if((r31|0)<(HEAP[r8|0]|0)){while(1){r32=HEAP[HEAP[r8+4|0]+(r31*24&-1)|0];r33=HEAP[HEAP[r2+4|0]+r31|0]<<24>>24;r34=r33;do{if((r33|0)>=0){if((_face_order(r2,r31,0)|0)>(r34|0)){r35=1}else{r35=(_face_order(r2,r31,2)|0)>(r32-r34|0)}r36=r35&1;if((_face_order(r2,r31,0)|0)==(r34|0)){r37=(_face_order(r2,r31,2)|0)==(r32-r34|0)}else{r37=0}r38=r37&1;if((r36|0)==(HEAP[HEAP[r1+24|0]+r31|0]<<24>>24|0)){if((r38|0)==(HEAP[HEAP[r1+28|0]+r31|0]<<24>>24|0)){break}}HEAP[HEAP[r1+24|0]+r31|0]=r36&255;HEAP[HEAP[r1+28|0]+r31|0]=r38&255;if((r30|0)==16){r28=1;break}else{r38=r30;r30=r38+1|0;HEAP[(r38<<2)+r17|0]=r31;break}}}while(0);r31=r31+1|0;if((r31|0)>=(HEAP[r8|0]|0)){break L705}}}}while(0);do{if(r4>0){if(!(r4<=.1666666716337204|r4>=.3333333432674408)){r7=525;break}r39=((HEAP[r1+8|0]|0)!=0^1)&1;HEAP[r1+8|0]=1;break}else{r7=525}}while(0);if(r7==525){r39=HEAP[r1+8|0];HEAP[r1+8|0]=0}r31=0;L730:do{if((r31|0)<(HEAP[r8+8|0]|0)){while(1){if((HEAP[HEAP[r2+12|0]+r31|0]&255|0)!=0){r40=3}else{r40=HEAP[HEAP[r2+8|0]+r31|0]<<24>>24}r4=r40&255;do{if((r4<<24>>24|0)!=(HEAP[HEAP[r1+20|0]+r31|0]<<24>>24|0)){r7=532}else{if((r39|0)==0){break}if((HEAP[HEAP[r2+8|0]+r31|0]<<24>>24|0)==0){r7=532;break}else{break}}}while(0);do{if(r7==532){r7=0;HEAP[HEAP[r1+20|0]+r31|0]=r4;if((r29|0)==16){r28=1;break}else{r37=r29;r29=r37+1|0;HEAP[(r37<<2)+r16|0]=r31;break}}}while(0);r31=r31+1|0;if((r31|0)>=(HEAP[r8+8|0]|0)){break L730}}}}while(0);if((r28|0)!=0){r28=HEAP[r8+36|0]-HEAP[r8+28|0]|0;r7=(Math.imul(HEAP[r1+4|0],HEAP[r8+32|0]-HEAP[r8+24|0]|0)|0)/(HEAP[r8+40|0]|0)&-1;_game_redraw_in_rect(r26,r1,r2,0,0,(r27<<1)+r7+1|0,(r27<<1)+((Math.imul(HEAP[r1+4|0],r28)|0)/(HEAP[r8+40|0]|0)&-1)+1|0);r41=r1;r42=r41|0;HEAP[r42]=1;STACKTOP=r6;return}r31=0;L750:do{if((r31|0)<(r30|0)){while(1){r28=HEAP[r8+4|0]+(HEAP[(r31<<2)+r17|0]*24&-1)|0;HEAP[r5]=r1;HEAP[r3]=r8;HEAP[r9]=r28;HEAP[r10]=r18;HEAP[r11]=r19;HEAP[r12]=r20;HEAP[r13]=r21;_face_text_pos(HEAP[r5],HEAP[r3],HEAP[r9],r14,r15);HEAP[HEAP[r10]]=HEAP[r14]-1+ -((HEAP[HEAP[r5]+4|0]|0)/4&-1)|0;HEAP[HEAP[r11]]=HEAP[r15]-3+ -((HEAP[HEAP[r5]+4|0]|0)/4&-1)|0;HEAP[HEAP[r12]]=((HEAP[HEAP[r5]+4|0]|0)/2&-1)+2|0;HEAP[HEAP[r13]]=((HEAP[HEAP[r5]+4|0]|0)/2&-1)+5|0;_game_redraw_in_rect(r26,r1,r2,HEAP[r18],HEAP[r19],HEAP[r20],HEAP[r21]);r31=r31+1|0;if((r31|0)>=(r30|0)){break L750}}}}while(0);r31=0;if((r31|0)>=(r29|0)){r41=r1;r42=r41|0;HEAP[r42]=1;STACKTOP=r6;return}while(1){_edge_bbox(r1,r8,(HEAP[(r31<<2)+r16|0]<<4)+HEAP[r8+12|0]|0,r22,r23,r24,r25);_game_redraw_in_rect(r26,r1,r2,HEAP[r22],HEAP[r23],HEAP[r24],HEAP[r25]);r31=r31+1|0;if((r31|0)>=(r29|0)){break}}r41=r1;r42=r41|0;HEAP[r42]=1;STACKTOP=r6;return}function _game_print_size(r1,r2,r3){var r4,r5,r6;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;r6=r4+4;_game_compute_size(r1,700,r5,r6);HEAP[r2]=(HEAP[r5]|0)/100;HEAP[r3]=(HEAP[r6]|0)/100;STACKTOP=r4;return}function _game_print(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77;r4=STACKTOP;STACKTOP=STACKTOP+348|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r4+24;r12=r4+28;r13=r4+32;r14=r4+36;r15=r4+40;r16=r4+44;r17=r4+48;r18=r4+52;r19=r4+56;r20=r4+60;r21=r4+64;r22=r4+68;r23=r4+72;r24=r4+76;r25=r4+80;r26=r4+84;r27=r4+88;r28=r4+92;r29=r4+96;r30=r4+100;r31=r4+104;r32=r4+108;r33=r4+112;r34=r4+116;r35=r4+120;r36=r4+124;r37=r4+128;r38=r4+132;r39=r4+136;r40=r4+140;r41=r4+144;r42=r4+148;r43=r4+152;r44=r4+156;r45=r4+160;r46=r4+164;r47=r4+168;r48=r4+172;r49=r4+176;r50=r4+180;r51=r4+184;r52=r4+188;r53=r4+192;r54=r4+196;r55=r4+200;r56=r4+204;r57=r4+208;r58=r4+212;r59=r4+216;r60=r4+220;r61=r4+224;r62=r4+228;r63=r4+264;r64=r4+268;r65=r4+272;r66=r4+292;r67=r4+296;r68=r4+300;r69=r4+304;r70=r4+308;r71=r4+312;r72=r4+316;r73=r1;r1=r2;HEAP[r61]=r73;HEAP[r62]=0;r2=HEAP[r62]|0;r74=HEAP[r62]|0;r75=HEAP[r62]|0;r76=HEAP[r62]|0;HEAP[r54]=HEAP[r61];HEAP[r55]=r2;HEAP[r56]=r74;HEAP[r57]=r75;HEAP[r58]=r76;HEAP[r59]=-1;HEAP[r60]=0;if((HEAP[HEAP[r54]+12|0]|0)>=(HEAP[HEAP[r54]+16|0]|0)){HEAP[HEAP[r54]+16|0]=HEAP[HEAP[r54]+12|0]+16|0;r76=_srealloc(HEAP[HEAP[r54]+8|0],HEAP[HEAP[r54]+16|0]*24&-1);HEAP[HEAP[r54]+8|0]=r76}HEAP[HEAP[HEAP[r54]+8|0]+(HEAP[HEAP[r54]+12|0]*24&-1)|0]=HEAP[r59];HEAP[HEAP[HEAP[r54]+8|0]+(HEAP[HEAP[r54]+12|0]*24&-1)+4|0]=HEAP[r60];HEAP[HEAP[HEAP[r54]+8|0]+(HEAP[HEAP[r54]+12|0]*24&-1)+8|0]=HEAP[r55];HEAP[HEAP[HEAP[r54]+8|0]+(HEAP[HEAP[r54]+12|0]*24&-1)+12|0]=HEAP[r56];HEAP[HEAP[HEAP[r54]+8|0]+(HEAP[HEAP[r54]+12|0]*24&-1)+16|0]=HEAP[r57];HEAP[HEAP[HEAP[r54]+8|0]+(HEAP[HEAP[r54]+12|0]*24&-1)+20|0]=HEAP[r58];r58=HEAP[r54]+12|0;r54=HEAP[r58];HEAP[r58]=r54+1|0;r58=r54;r54=r4+232;r57=HEAP[r1|0];HEAP[r54+4|0]=r3;HEAP[r52]=HEAP[r57|0]<<2;r3=_malloc(HEAP[r52]);HEAP[r53]=r3;if((r3|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r54+12|0]=HEAP[r53];HEAP[r50]=HEAP[r57|0]<<2;r53=_malloc(HEAP[r50]);HEAP[r51]=r53;if((HEAP[r51]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r54+16|0]=HEAP[r51];r51=0;L771:do{if((r51|0)<(HEAP[r57|0]|0)){while(1){HEAP[(r51<<2)+HEAP[r54+16|0]|0]=-1;HEAP[(r51<<2)+HEAP[r54+12|0]|0]=-1;r51=r51+1|0;if((r51|0)>=(HEAP[r57|0]|0)){break L771}}}}while(0);r51=0;L775:do{if((r51|0)<(HEAP[r57+16|0]|0)){while(1){r53=HEAP[HEAP[r57+20|0]+(r51*20&-1)+12|0];r50=HEAP[HEAP[r57+20|0]+(r51*20&-1)+16|0];HEAP[r44]=r54;HEAP[r45]=r57;HEAP[r46]=r53;HEAP[r47]=r50;HEAP[r48]=r63;HEAP[r49]=r64;HEAP[HEAP[r48]]=HEAP[r46]-HEAP[HEAP[r45]+24|0]|0;HEAP[HEAP[r49]]=HEAP[r47]-HEAP[HEAP[r45]+28|0]|0;r50=Math.imul(HEAP[HEAP[r44]+4|0],HEAP[HEAP[r48]]);HEAP[HEAP[r48]]=(r50|0)/(HEAP[HEAP[r45]+40|0]|0)&-1;r50=Math.imul(HEAP[HEAP[r44]+4|0],HEAP[HEAP[r49]]);HEAP[HEAP[r49]]=(r50|0)/(HEAP[HEAP[r45]+40|0]|0)&-1;r50=HEAP[r48];HEAP[r50]=HEAP[r50]+((HEAP[HEAP[r44]+4|0]|0)/2&-1)|0;r50=HEAP[r49];HEAP[r50]=HEAP[r50]+((HEAP[HEAP[r44]+4|0]|0)/2&-1)|0;r50=HEAP[r63];r53=HEAP[r64];r3=(HEAP[r54+4|0]|0)/15&-1;HEAP[r38]=r73;HEAP[r39]=r50;HEAP[r40]=r53;HEAP[r41]=r3;HEAP[r42]=r58;HEAP[r43]=r58;FUNCTION_TABLE[HEAP[HEAP[HEAP[r38]|0]+16|0]](HEAP[HEAP[r38]+4|0],HEAP[r39],HEAP[r40],HEAP[r41],HEAP[r42],HEAP[r43]);r51=r51+1|0;if((r51|0)>=(HEAP[r57+16|0]|0)){break L775}}}}while(0);r51=0;L780:do{if((r51|0)<(HEAP[r57|0]|0)){r43=r65|0;r42=r65|0;while(1){r41=HEAP[r57+4|0]+(r51*24&-1)|0;if((HEAP[HEAP[r1+4|0]+r51|0]<<24>>24|0)>=0){_sprintf(r43,35876,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[HEAP[r1+4|0]+r51|0]<<24>>24,tempInt));_face_text_pos(r54,r57,r41,r66,r67);r41=HEAP[r66];r40=HEAP[r67];r39=(HEAP[r54+4|0]|0)/2&-1;HEAP[r30]=r73;HEAP[r31]=r41;HEAP[r32]=r40;HEAP[r33]=1;HEAP[r34]=r39;HEAP[r35]=257;HEAP[r36]=r58;HEAP[r37]=r42;FUNCTION_TABLE[HEAP[HEAP[HEAP[r30]|0]|0]](HEAP[HEAP[r30]+4|0],HEAP[r31],HEAP[r32],HEAP[r33],HEAP[r34],HEAP[r35],HEAP[r36],HEAP[r37])}r51=r51+1|0;if((r51|0)>=(HEAP[r57|0]|0)){break L780}}}}while(0);r51=0;L788:do{if((r51|0)<(HEAP[r57+8|0]|0)){r37=r72|0;r36=r72+4|0;r35=r72+8|0;r34=r72+12|0;r33=r72+16|0;r32=r72+20|0;r31=r72+24|0;r30=r72+28|0;r67=r72|0;while(1){r66=(HEAP[HEAP[r1+8|0]+r51|0]<<24>>24|0)==0?30:150;r65=(r51<<4)+HEAP[r57+12|0]|0;r42=HEAP[HEAP[r65|0]+12|0];r43=HEAP[HEAP[r65|0]+16|0];HEAP[r24]=r54;HEAP[r25]=r57;HEAP[r26]=r42;HEAP[r27]=r43;HEAP[r28]=r68;HEAP[r29]=r69;HEAP[HEAP[r28]]=HEAP[r26]-HEAP[HEAP[r25]+24|0]|0;HEAP[HEAP[r29]]=HEAP[r27]-HEAP[HEAP[r25]+28|0]|0;r43=Math.imul(HEAP[HEAP[r24]+4|0],HEAP[HEAP[r28]]);HEAP[HEAP[r28]]=(r43|0)/(HEAP[HEAP[r25]+40|0]|0)&-1;r43=Math.imul(HEAP[HEAP[r24]+4|0],HEAP[HEAP[r29]]);HEAP[HEAP[r29]]=(r43|0)/(HEAP[HEAP[r25]+40|0]|0)&-1;r43=HEAP[r28];HEAP[r43]=HEAP[r43]+((HEAP[HEAP[r24]+4|0]|0)/2&-1)|0;r43=HEAP[r29];HEAP[r43]=HEAP[r43]+((HEAP[HEAP[r24]+4|0]|0)/2&-1)|0;r43=HEAP[HEAP[r65+4|0]+12|0];r42=HEAP[HEAP[r65+4|0]+16|0];HEAP[r18]=r54;HEAP[r19]=r57;HEAP[r20]=r43;HEAP[r21]=r42;HEAP[r22]=r70;HEAP[r23]=r71;HEAP[HEAP[r22]]=HEAP[r20]-HEAP[HEAP[r19]+24|0]|0;HEAP[HEAP[r23]]=HEAP[r21]-HEAP[HEAP[r19]+28|0]|0;r42=Math.imul(HEAP[HEAP[r18]+4|0],HEAP[HEAP[r22]]);HEAP[HEAP[r22]]=(r42|0)/(HEAP[HEAP[r19]+40|0]|0)&-1;r42=Math.imul(HEAP[HEAP[r18]+4|0],HEAP[HEAP[r23]]);HEAP[HEAP[r23]]=(r42|0)/(HEAP[HEAP[r19]+40|0]|0)&-1;r42=HEAP[r22];HEAP[r42]=HEAP[r42]+((HEAP[HEAP[r18]+4|0]|0)/2&-1)|0;r42=HEAP[r23];HEAP[r42]=HEAP[r42]+((HEAP[HEAP[r18]+4|0]|0)/2&-1)|0;L792:do{if((HEAP[HEAP[r1+8|0]+r51|0]<<24>>24|0)==0){r42=Math.sqrt(((HEAP[r68]|0)-(HEAP[r70]|0))*((HEAP[r68]|0)-(HEAP[r70]|0))+((HEAP[r69]|0)-(HEAP[r71]|0))*((HEAP[r69]|0)-(HEAP[r71]|0)));r43=(HEAP[r70]-HEAP[r68]|0)/r42;r65=(HEAP[r71]-HEAP[r69]|0)/r42;r43=r43*(HEAP[r54+4|0]|0)/(r66|0);r65=r65*(HEAP[r54+4|0]|0)/(r66|0);HEAP[r37]=(r65&-1)+HEAP[r68]|0;HEAP[r36]=HEAP[r69]-(r43&-1)|0;HEAP[r35]=HEAP[r68]-(r65&-1)|0;HEAP[r34]=(r43&-1)+HEAP[r69]|0;HEAP[r33]=HEAP[r70]-(r65&-1)|0;HEAP[r32]=(r43&-1)+HEAP[r71]|0;HEAP[r31]=(r65&-1)+HEAP[r70]|0;HEAP[r30]=HEAP[r71]-(r43&-1)|0;HEAP[r12]=r73;HEAP[r13]=r67;HEAP[r14]=4;HEAP[r15]=r58;HEAP[r16]=r58;FUNCTION_TABLE[HEAP[HEAP[HEAP[r12]|0]+12|0]](HEAP[HEAP[r12]+4|0],HEAP[r13],HEAP[r14],HEAP[r15],HEAP[r16])}else{r43=6;r65=1;if((r65|0)>=(r43|0)){break}while(1){r42=(Math.imul(r43-r65|0,HEAP[r68])+Math.imul(r65,HEAP[r70])|0)/(r43|0)&-1;r39=(Math.imul(r43-r65|0,HEAP[r69])+Math.imul(r65,HEAP[r71])|0)/(r43|0)&-1;r40=(HEAP[r54+4|0]|0)/(r66|0)&-1;HEAP[r6]=r73;HEAP[r7]=r42;HEAP[r8]=r39;HEAP[r9]=r40;HEAP[r10]=r58;HEAP[r11]=r58;FUNCTION_TABLE[HEAP[HEAP[HEAP[r6]|0]+16|0]](HEAP[HEAP[r6]+4|0],HEAP[r7],HEAP[r8],HEAP[r9],HEAP[r10],HEAP[r11]);r65=r65+1|0;if((r65|0)>=(r43|0)){break L792}}}}while(0);r51=r51+1|0;if((r51|0)>=(HEAP[r57+8|0]|0)){break L788}}}}while(0);r57=HEAP[r54+12|0];HEAP[r5]=r57;if((r57|0)!=0){_free(HEAP[r5])}r5=HEAP[r54+16|0];HEAP[r17]=r5;if((r5|0)==0){r77=r17;STACKTOP=r4;return}_free(HEAP[r17]);r77=r17;STACKTOP=r4;return}function _game_timing_state(r1,r2){return 1}function _face_text_pos(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187,r188,r189,r190,r191,r192,r193,r194,r195,r196,r197,r198,r199,r200,r201,r202,r203,r204,r205,r206,r207,r208,r209,r210,r211,r212,r213,r214,r215,r216,r217,r218,r219,r220,r221,r222,r223,r224,r225,r226,r227,r228,r229,r230,r231,r232,r233,r234,r235,r236,r237,r238,r239,r240,r241,r242,r243,r244,r245,r246,r247,r248,r249,r250,r251,r252,r253,r254,r255,r256,r257,r258,r259,r260,r261,r262,r263,r264,r265,r266,r267,r268,r269,r270,r271,r272,r273,r274,r275,r276,r277,r278,r279,r280,r281,r282,r283,r284,r285,r286,r287,r288,r289,r290,r291,r292,r293,r294,r295,r296,r297,r298,r299,r300,r301,r302,r303,r304,r305,r306,r307,r308,r309;r6=0;r7=STACKTOP;STACKTOP=STACKTOP+1064|0;r8=r7;r9=r7+4;r10=r7+8;r11=r7+12;r12=r7+16;r13=r7+20;r14=r7+24;r15=r7+28;r16=r7+32;r17=r7+36;r18=r7+40;r19=r7+72;r20=r7+80;r21=r7+84;r22=r7+88;r23=r7+92;r24=r7+96;r25=r7+168;r26=r7+176;r27=r7+180;r28=r7+188;r29=r7+196;r30=r7+204;r31=r7+208;r32=r7+212;r33=r7+216;r34=r7+220;r35=r7+232;r36=r7+244;r37=r7+256;r38=r7+260;r39=r7+264;r40=r7+280;r41=r7+296;r42=r7+300;r43=r7+372;r44=r7+396;r45=r7+420;r46=r7+424;r47=r7+428;r48=r7+432;r49=r7+436;r50=r7+440;r51=r7+444;r52=r7+448;r53=r7+512;r54=r7+536;r55=r7+552;r56=r7+568;r57=r7+584;r58=r7+608;r59=r7+616;r60=r7+620;r61=r7+624;r62=r7+628;r63=r7+632;r64=r7+636;r65=r7+640;r66=r7+648;r67=r7+664;r68=r7+680;r69=r7+696;r70=r7+720;r71=r7+728;r72=r7+736;r73=r7+740;r74=r7+744;r75=r7+748;r76=r7+752;r77=r7+756;r78=r7+760;r79=r7+768;r80=r7+772;r81=r7+776;r82=r7+780;r83=r7+784;r84=r7+788;r85=r7+792;r86=r7+800;r87=r7+808;r88=r7+840;r89=r7+856;r90=r7+872;r91=r7+876;r92=r7+880;r93=r7+884;r94=r7+888;r95=r7+892;r96=r7+896;r97=r7+900;r98=r7+908;r99=r7+916;r100=r7+920;r101=r7+924;r102=r7+928;r103=r7+932;r104=r7+936;r105=r7+940;r106=r7+944;r107=r7+948;r108=r7+956;r109=r7+960;r110=r7+964;r111=r7+968;r112=r7+972;r113=r7+980;r114=r7+988;r115=r7+996;r116=r7+1e3;r117=r7+1004;r118=r7+1008;r119=r7+1012;r120=r7+1016;r121=r7+1020;r122=r7+1028;r123=r7+1036;r124=r7+1044;r125=r7+1048;r126=r7+1056;r127=r1;r1=r2;r2=r3;r3=r4;r4=r5;r5=(r2-HEAP[r1+4|0]|0)/24&-1;if((HEAP[(r5<<2)+HEAP[r127+12|0]|0]|0)>=0){HEAP[r3]=HEAP[(r5<<2)+HEAP[r127+12|0]|0];HEAP[r4]=HEAP[(r5<<2)+HEAP[r127+16|0]|0];STACKTOP=r7;return}HEAP[r26]=r2;if((HEAP[HEAP[r26]+12|0]|0)==0){HEAP[r38]=0;HEAP[r37]=0;HEAP[r29]=0;HEAP[r28]=0;HEAP[r27]=0;HEAP[r30]=0;L814:do{if((HEAP[r30]+2|0)<(HEAP[HEAP[r26]|0]<<1|0)){r128=r42|0;r129=r43|0;r130=r44|0;r131=r44|0;r132=r44+8|0;r133=r24|0;r134=r24+8|0;r135=r24+16|0;r136=r24+24|0;r137=r24+32|0;r138=r24+40|0;r139=r24+48|0;r140=r24+56|0;r141=r24+64|0;r142=r24|0;r143=r24+8|0;r144=r24+16|0;r145=r24+24|0;r146=r24+32|0;r147=r24+40|0;r148=r24+48|0;r149=r24+56|0;r150=r24+64|0;r151=r52|0;r152=r52+48|0;r153=r52+32|0;r154=r52+16|0;r155=r53|0;r156=r52+8|0;r157=r52+48|0;r158=r52+40|0;r159=r52+16|0;r160=r53+8|0;r161=r52+24|0;r162=r52+48|0;r163=r52+56|0;r164=r52+16|0;r165=r53+16|0;r166=r53|0;r167=r53+8|0;r168=r54|0;r169=r54+8|0;r170=r53|0;r171=r53+8|0;r172=r55|0;r173=r53+16|0;r174=r53+8|0;r175=r55+8|0;r176=r52|0;r177=r54|0;r178=r52+8|0;r179=r55|0;r180=r52+16|0;r181=r56|0;r182=r52+24|0;r183=r52|0;r184=r54+8|0;r185=r52+8|0;r186=r55+8|0;r187=r52+16|0;r188=r56+8|0;r189=r56|0;r190=r56|0;r191=r57|0;r192=r56|0;r193=r56+8|0;r194=r57+8|0;r195=r56+8|0;r196=r56+8|0;r197=r57+16|0;r198=r54|0;r199=r54|0;r200=r57|0;r201=r54|0;r202=r54+8|0;r203=r36|0;r204=r57+8|0;r205=r54+8|0;r206=r36|0;r207=r54+8|0;r208=r36|0;r209=r57+16|0;r210=r55|0;r211=r55|0;r212=r57|0;r213=r55|0;r214=r55+8|0;r215=r36|0;r216=r57+8|0;r217=r55+8|0;r218=r36|0;r219=r55+8|0;r220=r36|0;r221=r57+16|0;r222=r57+8|0;r223=r57+8|0;r224=r57|0;r225=r57+16|0;r226=r57+8|0;r227=r57|0;r228=r54|0;r229=r54+8|0;r230=r55|0;r231=r55+8|0;r232=r57+8|0;r233=r57|0;r234=r54|0;r235=r54+8|0;r236=r55|0;r237=r55+8|0;r238=r55|0;r239=r55+8|0;r240=r53+8|0;r241=r53|0;r242=r54|0;r243=r53+16|0;r244=r53|0;r245=r54+8|0;r246=r36|0;r247=r36+4|0;r248=r36|0;r249=r36+4|0;r250=r66+8|0;r251=r67+8|0;r252=r66|0;r253=r67|0;r254=r34|0;r255=r35|0;r256=r34|0;r257=r35|0;r258=r66|0;r259=r67|0;r260=r68|0;r261=r66+8|0;r262=r67+8|0;r263=r68+8|0;r264=r68|0;r265=r68|0;r266=r69|0;r267=r68|0;r268=r68+8|0;r269=r69+8|0;r270=r68+8|0;r271=r68+8|0;r272=r69+16|0;r273=r69|0;r274=r69+16|0;r275=r69+8|0;r276=r69+8|0;r277=r69|0;r278=r69+16|0;r279=r69+8|0;r280=r69|0;r281=r66|0;r282=r66+8|0;r283=r67|0;r284=r67+8|0;r285=r69+8|0;r286=r69|0;r287=r66|0;r288=r66+8|0;r289=r67|0;r290=r67+8|0;r291=r87|0;r292=r88|0;r293=r89|0;r294=r89|0;r295=r89+8|0;r296=r18|0;r297=r18+8|0;r298=r18+16|0;r299=r18+24|0;r300=r18|0;r301=r18+8|0;r302=r18+16|0;r303=r18+24|0;while(1){r304=HEAP[r30];r305=HEAP[r26];if((HEAP[r30]|0)<(HEAP[HEAP[r26]|0]|0)){HEAP[(HEAP[r37]<<2)+r34|0]=HEAP[(r304<<2)+HEAP[r305+8|0]|0];r306=HEAP[((HEAP[r30]+1|0)%(HEAP[HEAP[r26]|0]|0)<<2)+HEAP[HEAP[r26]+8|0]|0];r307=HEAP[r37];HEAP[r37]=r307+1|0;HEAP[(r307<<2)+r35|0]=r306}else{r306=HEAP[(r304-HEAP[r305|0]<<2)+HEAP[HEAP[r26]+8|0]|0];r305=HEAP[r38];HEAP[r38]=r305+1|0;HEAP[(r305<<2)+r36|0]=r306}HEAP[r31]=HEAP[r30]+1|0;L822:do{if((HEAP[r31]+1|0)<(HEAP[HEAP[r26]|0]<<1|0)){while(1){r306=HEAP[r31];r305=HEAP[r26];if((HEAP[r31]|0)<(HEAP[HEAP[r26]|0]|0)){HEAP[(HEAP[r37]<<2)+r34|0]=HEAP[(r306<<2)+HEAP[r305+8|0]|0];r304=HEAP[((HEAP[r31]+1|0)%(HEAP[HEAP[r26]|0]|0)<<2)+HEAP[HEAP[r26]+8|0]|0];r307=HEAP[r37];HEAP[r37]=r307+1|0;HEAP[(r307<<2)+r35|0]=r304}else{r304=HEAP[(r306-HEAP[r305|0]<<2)+HEAP[HEAP[r26]+8|0]|0];r305=HEAP[r38];HEAP[r38]=r305+1|0;HEAP[(r305<<2)+r36|0]=r304}HEAP[r32]=HEAP[r31]+1|0;L829:do{if((HEAP[r32]|0)<(HEAP[HEAP[r26]|0]<<1|0)){while(1){HEAP[r41]=0;r304=HEAP[r32];r305=HEAP[r26];if((HEAP[r32]|0)<(HEAP[HEAP[r26]|0]|0)){HEAP[(HEAP[r37]<<2)+r34|0]=HEAP[(r304<<2)+HEAP[r305+8|0]|0];r306=HEAP[((HEAP[r32]+1|0)%(HEAP[HEAP[r26]|0]|0)<<2)+HEAP[HEAP[r26]+8|0]|0];r307=HEAP[r37];HEAP[r37]=r307+1|0;HEAP[(r307<<2)+r35|0]=r306}else{r306=HEAP[(r304-HEAP[r305|0]<<2)+HEAP[HEAP[r26]+8|0]|0];r305=HEAP[r38];HEAP[r38]=r305+1|0;HEAP[(r305<<2)+r36|0]=r306}do{if((HEAP[r37]|0)==3){HEAP[r45]=0;while(1){HEAP[r46]=HEAP[HEAP[(HEAP[r45]<<2)+r34|0]+12|0];HEAP[r47]=HEAP[HEAP[(HEAP[r45]<<2)+r35|0]+12|0];HEAP[r48]=HEAP[HEAP[(HEAP[r45]<<2)+r34|0]+16|0];HEAP[r49]=HEAP[HEAP[(HEAP[r45]<<2)+r35|0]+16|0];HEAP[r50]=HEAP[r47]-HEAP[r46]|0;HEAP[r51]=HEAP[r49]-HEAP[r48]|0;HEAP[((HEAP[r45]*3&-1)<<3)+r42|0]=HEAP[r51]|0;HEAP[((HEAP[r45]*3&-1)+1<<3)+r42|0]=-HEAP[r50]|0;r306=-Math.sqrt((HEAP[r50]|0)*(HEAP[r50]|0)+(HEAP[r51]|0)*(HEAP[r51]|0));HEAP[((HEAP[r45]*3&-1)+2<<3)+r42|0]=r306;HEAP[(HEAP[r45]<<3)+r43|0]=(HEAP[r46]|0)*(HEAP[r51]|0)-(HEAP[r48]|0)*(HEAP[r50]|0);r306=HEAP[r45]+1|0;HEAP[r45]=r306;if((r306|0)>=3){break}}HEAP[r21]=r128;HEAP[r22]=r129;HEAP[r23]=r130;HEAP[r25]=HEAP[HEAP[r21]]*HEAP[HEAP[r21]+32|0]*HEAP[HEAP[r21]+64|0]+HEAP[HEAP[r21]+8|0]*HEAP[HEAP[r21]+40|0]*HEAP[HEAP[r21]+48|0]+HEAP[HEAP[r21]+16|0]*HEAP[HEAP[r21]+24|0]*HEAP[HEAP[r21]+56|0]-HEAP[HEAP[r21]]*HEAP[HEAP[r21]+40|0]*HEAP[HEAP[r21]+56|0]-HEAP[HEAP[r21]+8|0]*HEAP[HEAP[r21]+24|0]*HEAP[HEAP[r21]+64|0]-HEAP[HEAP[r21]+16|0]*HEAP[HEAP[r21]+32|0]*HEAP[HEAP[r21]+48|0];if(HEAP[r25]==0){HEAP[r20]=0;r308=0}else{HEAP[r133]=(HEAP[HEAP[r21]+32|0]*HEAP[HEAP[r21]+64|0]-HEAP[HEAP[r21]+40|0]*HEAP[HEAP[r21]+56|0])/HEAP[r25];HEAP[r134]=(HEAP[HEAP[r21]+16|0]*HEAP[HEAP[r21]+56|0]-HEAP[HEAP[r21]+8|0]*HEAP[HEAP[r21]+64|0])/HEAP[r25];HEAP[r135]=(HEAP[HEAP[r21]+8|0]*HEAP[HEAP[r21]+40|0]-HEAP[HEAP[r21]+16|0]*HEAP[HEAP[r21]+32|0])/HEAP[r25];HEAP[r136]=(HEAP[HEAP[r21]+40|0]*HEAP[HEAP[r21]+48|0]-HEAP[HEAP[r21]+24|0]*HEAP[HEAP[r21]+64|0])/HEAP[r25];HEAP[r137]=(HEAP[HEAP[r21]]*HEAP[HEAP[r21]+64|0]-HEAP[HEAP[r21]+16|0]*HEAP[HEAP[r21]+48|0])/HEAP[r25];HEAP[r138]=(HEAP[HEAP[r21]+16|0]*HEAP[HEAP[r21]+24|0]-HEAP[HEAP[r21]]*HEAP[HEAP[r21]+40|0])/HEAP[r25];HEAP[r139]=(HEAP[HEAP[r21]+24|0]*HEAP[HEAP[r21]+56|0]-HEAP[HEAP[r21]+32|0]*HEAP[HEAP[r21]+48|0])/HEAP[r25];HEAP[r140]=(HEAP[HEAP[r21]+8|0]*HEAP[HEAP[r21]+48|0]-HEAP[HEAP[r21]]*HEAP[HEAP[r21]+56|0])/HEAP[r25];HEAP[r141]=(HEAP[HEAP[r21]]*HEAP[HEAP[r21]+32|0]-HEAP[HEAP[r21]+8|0]*HEAP[HEAP[r21]+24|0])/HEAP[r25];HEAP[HEAP[r23]]=HEAP[r142]*HEAP[HEAP[r22]]+HEAP[r143]*HEAP[HEAP[r22]+8|0]+HEAP[r144]*HEAP[HEAP[r22]+16|0];HEAP[HEAP[r23]+8|0]=HEAP[r145]*HEAP[HEAP[r22]]+HEAP[r146]*HEAP[HEAP[r22]+8|0]+HEAP[r147]*HEAP[HEAP[r22]+16|0];HEAP[HEAP[r23]+16|0]=HEAP[r148]*HEAP[HEAP[r22]]+HEAP[r149]*HEAP[HEAP[r22]+8|0]+HEAP[r150]*HEAP[HEAP[r22]+16|0];HEAP[r20]=1;r308=1}if((r308|0)==0){break}HEAP[(HEAP[r41]<<3)+r39|0]=HEAP[r131];HEAP[(HEAP[r41]<<3)+r40|0]=HEAP[r132];HEAP[r41]=HEAP[r41]+1|0}else{if((HEAP[r37]|0)==2){HEAP[r33]=0;while(1){HEAP[r59]=HEAP[HEAP[(HEAP[r33]<<2)+r34|0]+12|0];HEAP[r60]=HEAP[HEAP[(HEAP[r33]<<2)+r35|0]+12|0];HEAP[r61]=HEAP[HEAP[(HEAP[r33]<<2)+r34|0]+16|0];HEAP[r62]=HEAP[HEAP[(HEAP[r33]<<2)+r35|0]+16|0];HEAP[r63]=HEAP[r60]-HEAP[r59]|0;HEAP[r64]=HEAP[r62]-HEAP[r61]|0;HEAP[(HEAP[r33]<<5)+r52|0]=HEAP[r64]|0;HEAP[(HEAP[r33]<<5)+r52+8|0]=-HEAP[r63]|0;r306=-Math.sqrt(Math.imul(HEAP[r63],HEAP[r63])+Math.imul(HEAP[r64],HEAP[r64])|0);HEAP[(HEAP[r33]<<5)+r52+16|0]=r306;r306=Math.imul(HEAP[r64],HEAP[r59])-Math.imul(HEAP[r63],HEAP[r61])|0;HEAP[(HEAP[r33]<<5)+r52+24|0]=r306;r306=HEAP[r33]+1|0;HEAP[r33]=r306;if((r306|0)>=2){break}}HEAP[r155]=HEAP[r151]*HEAP[r152]-HEAP[r153]*HEAP[r154];HEAP[r160]=HEAP[r156]*HEAP[r157]-HEAP[r158]*HEAP[r159];HEAP[r165]=HEAP[r161]*HEAP[r162]-HEAP[r163]*HEAP[r164];r306=HEAP[r166]&-1;r305=HEAP[r167]&-1;if((((r306|0)>-1?r306:-r306|0)|0)<(((r305|0)>-1?r305:-r305|0)|0)){HEAP[r168]=1;HEAP[r169]=0;HEAP[r172]=-HEAP[r170]/HEAP[r171];HEAP[r175]=HEAP[r173]/HEAP[r174]}else{HEAP[r238]=1;HEAP[r239]=0;HEAP[r242]=-HEAP[r240]/HEAP[r241];HEAP[r245]=HEAP[r243]/HEAP[r244]}HEAP[r181]=-(HEAP[r176]*HEAP[r177]+HEAP[r178]*HEAP[r179])/HEAP[r180];HEAP[r188]=(HEAP[r182]-HEAP[r183]*HEAP[r184]-HEAP[r185]*HEAP[r186])/HEAP[r187];HEAP[r191]=-HEAP[r189]*HEAP[r190];HEAP[r194]=HEAP[r192]*-2*HEAP[r193];HEAP[r197]=-HEAP[r195]*HEAP[r196];HEAP[r200]=HEAP[r200]+HEAP[r198]*HEAP[r199];HEAP[r204]=HEAP[r204]+HEAP[r201]*2*(HEAP[r202]-(HEAP[HEAP[r203]+12|0]|0));HEAP[r209]=HEAP[r209]+(HEAP[r205]-(HEAP[HEAP[r206]+12|0]|0))*(HEAP[r207]-(HEAP[HEAP[r208]+12|0]|0));HEAP[r212]=HEAP[r212]+HEAP[r210]*HEAP[r211];HEAP[r216]=HEAP[r216]+HEAP[r213]*2*(HEAP[r214]-(HEAP[HEAP[r215]+16|0]|0));HEAP[r221]=HEAP[r221]+(HEAP[r217]-(HEAP[HEAP[r218]+16|0]|0))*(HEAP[r219]-(HEAP[HEAP[r220]+16|0]|0));r305=HEAP[r222]*HEAP[r223]-HEAP[r224]*4*HEAP[r225];HEAP[r58]=r305;if(!(r305>=0)){break}r305=Math.sqrt(HEAP[r58]);HEAP[r58]=r305;HEAP[r65]=(-HEAP[r226]+HEAP[r58])/(HEAP[r227]*2);HEAP[(HEAP[r41]<<3)+r39|0]=HEAP[r228]*HEAP[r65]+HEAP[r229];HEAP[(HEAP[r41]<<3)+r40|0]=HEAP[r230]*HEAP[r65]+HEAP[r231];HEAP[r41]=HEAP[r41]+1|0;HEAP[r65]=(-HEAP[r232]-HEAP[r58])/(HEAP[r233]*2);HEAP[(HEAP[r41]<<3)+r39|0]=HEAP[r234]*HEAP[r65]+HEAP[r235];HEAP[(HEAP[r41]<<3)+r40|0]=HEAP[r236]*HEAP[r65]+HEAP[r237];HEAP[r41]=HEAP[r41]+1|0;break}if((HEAP[r37]|0)==1){HEAP[r72]=HEAP[HEAP[r246]+12|0];HEAP[r73]=HEAP[HEAP[r247]+12|0];HEAP[r74]=HEAP[HEAP[r248]+16|0];HEAP[r75]=HEAP[HEAP[r249]+16|0];HEAP[r76]=HEAP[r73]-HEAP[r72]|0;HEAP[r77]=HEAP[r75]-HEAP[r74]|0;r305=Math.sqrt((HEAP[r76]|0)*(HEAP[r76]|0)+(HEAP[r77]|0)*(HEAP[r77]|0));HEAP[r78]=r305;HEAP[r250]=(HEAP[r73]+HEAP[r72]|0)/2;HEAP[r251]=(HEAP[r75]+HEAP[r74]|0)/2;HEAP[r252]=(-HEAP[r77]|0)/HEAP[r78];HEAP[r253]=(HEAP[r76]|0)/HEAP[r78];HEAP[r71]=HEAP[r78]*.5;HEAP[r79]=HEAP[HEAP[r254]+12|0];HEAP[r80]=HEAP[HEAP[r255]+12|0];HEAP[r81]=HEAP[HEAP[r256]+16|0];HEAP[r82]=HEAP[HEAP[r257]+16|0];HEAP[r83]=HEAP[r80]-HEAP[r79]|0;HEAP[r84]=HEAP[r82]-HEAP[r81]|0;r305=Math.sqrt((HEAP[r83]|0)*(HEAP[r83]|0)+(HEAP[r84]|0)*(HEAP[r84]|0));HEAP[r85]=r305;HEAP[r260]=(HEAP[r258]*(HEAP[r84]|0)-HEAP[r259]*(HEAP[r83]|0))/HEAP[r85];HEAP[r263]=((HEAP[r261]-(HEAP[r79]|0))*(HEAP[r84]|0)-(HEAP[r262]-(HEAP[r81]|0))*(HEAP[r83]|0))/HEAP[r85];HEAP[r266]=HEAP[r264]*HEAP[r265];HEAP[r269]=HEAP[r267]*2*HEAP[r268];HEAP[r272]=HEAP[r270]*HEAP[r271];HEAP[r273]=HEAP[r273]-1;HEAP[r274]=HEAP[r274]-HEAP[r71]*HEAP[r71];HEAP[r70]=HEAP[r275]*HEAP[r276]-HEAP[r277]*4*HEAP[r278];if(!(HEAP[r70]>=0)){break}r305=Math.sqrt(HEAP[r70]);HEAP[r70]=r305;HEAP[r86]=(-HEAP[r279]+HEAP[r70])/(HEAP[r280]*2);HEAP[(HEAP[r41]<<3)+r39|0]=HEAP[r281]*HEAP[r86]+HEAP[r282];HEAP[(HEAP[r41]<<3)+r40|0]=HEAP[r283]*HEAP[r86]+HEAP[r284];HEAP[r41]=HEAP[r41]+1|0;HEAP[r86]=(-HEAP[r285]-HEAP[r70])/(HEAP[r286]*2);HEAP[(HEAP[r41]<<3)+r39|0]=HEAP[r287]*HEAP[r86]+HEAP[r288];HEAP[(HEAP[r41]<<3)+r40|0]=HEAP[r289]*HEAP[r86]+HEAP[r290];HEAP[r41]=HEAP[r41]+1|0;break}if((HEAP[r37]|0)!=0){break}HEAP[r90]=0;while(1){HEAP[r91]=HEAP[HEAP[(HEAP[r90]<<2)+r36|0]+12|0];HEAP[r92]=HEAP[HEAP[(HEAP[r90]+1<<2)+r36|0]+12|0];HEAP[r93]=HEAP[HEAP[(HEAP[r90]<<2)+r36|0]+16|0];HEAP[r94]=HEAP[HEAP[(HEAP[r90]+1<<2)+r36|0]+16|0];HEAP[r95]=HEAP[r92]-HEAP[r91]|0;HEAP[r96]=HEAP[r94]-HEAP[r93]|0;HEAP[(HEAP[r90]<<4)+r87|0]=HEAP[r95]<<1|0;HEAP[((HEAP[r90]<<1)+1<<3)+r87|0]=HEAP[r96]<<1|0;HEAP[(HEAP[r90]<<3)+r88|0]=(HEAP[r95]|0)*(HEAP[r95]|0)+(HEAP[r96]|0)*(HEAP[r96]|0)+(HEAP[r91]|0)*2*(HEAP[r95]|0)+(HEAP[r93]|0)*2*(HEAP[r96]|0);r305=HEAP[r90]+1|0;HEAP[r90]=r305;if((r305|0)>=2){break}}HEAP[r15]=r291;HEAP[r16]=r292;HEAP[r17]=r293;HEAP[r19]=HEAP[HEAP[r15]]*HEAP[HEAP[r15]+24|0]-HEAP[HEAP[r15]+8|0]*HEAP[HEAP[r15]+16|0];if(HEAP[r19]==0){HEAP[r14]=0;r309=0}else{HEAP[r296]=HEAP[HEAP[r15]+24|0]/HEAP[r19];HEAP[r297]=-HEAP[HEAP[r15]+8|0]/HEAP[r19];HEAP[r298]=-HEAP[HEAP[r15]+16|0]/HEAP[r19];HEAP[r299]=HEAP[HEAP[r15]]/HEAP[r19];HEAP[HEAP[r17]]=HEAP[r300]*HEAP[HEAP[r16]]+HEAP[r301]*HEAP[HEAP[r16]+8|0];HEAP[HEAP[r17]+8|0]=HEAP[r302]*HEAP[HEAP[r16]]+HEAP[r303]*HEAP[HEAP[r16]+8|0];HEAP[r14]=1;r309=1}if((r309|0)==0){break}HEAP[(HEAP[r41]<<3)+r39|0]=HEAP[r294];HEAP[(HEAP[r41]<<3)+r40|0]=HEAP[r295];HEAP[r41]=HEAP[r41]+1|0}}while(0);HEAP[r33]=0;L872:do{if((HEAP[r33]|0)<(HEAP[r41]|0)){while(1){HEAP[r97]=HEAP[(HEAP[r33]<<3)+r39|0];HEAP[r98]=HEAP[(HEAP[r33]<<3)+r40|0];HEAP[r100]=0;HEAP[r99]=0;L875:do{if((HEAP[r99]|0)<(HEAP[HEAP[r26]|0]|0)){while(1){HEAP[r101]=HEAP[HEAP[HEAP[(HEAP[r99]<<2)+HEAP[HEAP[r26]+4|0]|0]|0]+12|0];HEAP[r102]=HEAP[HEAP[HEAP[(HEAP[r99]<<2)+HEAP[HEAP[r26]+4|0]|0]+4|0]+12|0];HEAP[r103]=HEAP[HEAP[HEAP[(HEAP[r99]<<2)+HEAP[HEAP[r26]+4|0]|0]|0]+16|0];HEAP[r104]=HEAP[HEAP[HEAP[(HEAP[r99]<<2)+HEAP[HEAP[r26]+4|0]|0]+4|0]+16|0];do{if(HEAP[r98]>=(HEAP[r103]|0)){if(HEAP[r98]<(HEAP[r104]|0)){r6=628;break}else{r6=626;break}}else{r6=626}}while(0);do{if(r6==626){r6=0;if(!(HEAP[r98]>=(HEAP[r104]|0))){break}if(HEAP[r98]<(HEAP[r103]|0)){r6=628;break}else{break}}}while(0);do{if(r6==628){r6=0;HEAP[r105]=HEAP[r102]-HEAP[r101]|0;r305=HEAP[r104]-HEAP[r103]|0;HEAP[r106]=r305;if((r305|0)<0){HEAP[r105]=-HEAP[r105]|0;HEAP[r106]=-HEAP[r106]|0}if(!((HEAP[r97]-(HEAP[r101]|0))*(HEAP[r106]|0)>=(HEAP[r98]-(HEAP[r103]|0))*(HEAP[r105]|0))){break}HEAP[r100]=HEAP[r100]^1}}while(0);HEAP[r99]=HEAP[r99]+1|0;if((HEAP[r99]|0)>=(HEAP[HEAP[r26]|0]|0)){break L875}}}}while(0);do{if((HEAP[r100]|0)!=0){HEAP[r107]=Infinity;HEAP[r109]=0;L893:do{if((HEAP[r109]|0)<(HEAP[HEAP[r26]|0]|0)){while(1){HEAP[r110]=HEAP[HEAP[(HEAP[r109]<<2)+HEAP[HEAP[r26]+8|0]|0]+12|0];HEAP[r111]=HEAP[HEAP[(HEAP[r109]<<2)+HEAP[HEAP[r26]+8|0]|0]+16|0];HEAP[r112]=HEAP[r97]-(HEAP[r110]|0);HEAP[r113]=HEAP[r98]-(HEAP[r111]|0);HEAP[r114]=HEAP[r112]*HEAP[r112]+HEAP[r113]*HEAP[r113];if(HEAP[r107]>HEAP[r114]){HEAP[r107]=HEAP[r114]}HEAP[r109]=HEAP[r109]+1|0;if((HEAP[r109]|0)>=(HEAP[HEAP[r26]|0]|0)){break L893}}}}while(0);HEAP[r108]=0;L900:do{if((HEAP[r108]|0)<(HEAP[HEAP[r26]|0]|0)){while(1){HEAP[r115]=HEAP[HEAP[HEAP[(HEAP[r108]<<2)+HEAP[HEAP[r26]+4|0]|0]|0]+12|0];HEAP[r116]=HEAP[HEAP[HEAP[(HEAP[r108]<<2)+HEAP[HEAP[r26]+4|0]|0]+4|0]+12|0];HEAP[r117]=HEAP[HEAP[HEAP[(HEAP[r108]<<2)+HEAP[HEAP[r26]+4|0]|0]|0]+16|0];HEAP[r118]=HEAP[HEAP[HEAP[(HEAP[r108]<<2)+HEAP[HEAP[r26]+4|0]|0]+4|0]+16|0];HEAP[r119]=HEAP[r116]-HEAP[r115]|0;HEAP[r120]=HEAP[r118]-HEAP[r117]|0;HEAP[r121]=HEAP[r97]-(HEAP[r115]|0);HEAP[r122]=HEAP[r98]-(HEAP[r117]|0);HEAP[r123]=HEAP[r121]*(HEAP[r119]|0)+HEAP[r122]*(HEAP[r120]|0);r305=Math.imul(HEAP[r119],HEAP[r119])+Math.imul(HEAP[r120],HEAP[r120])|0;HEAP[r124]=r305;do{if(0<HEAP[r123]){if(HEAP[r123]>=(HEAP[r124]|0)){break}HEAP[r125]=HEAP[r121]*(HEAP[r120]|0)-HEAP[r122]*(HEAP[r119]|0);HEAP[r126]=HEAP[r125]*HEAP[r125]/(HEAP[r124]|0);if(HEAP[r107]<=HEAP[r126]){break}HEAP[r107]=HEAP[r126]}}while(0);HEAP[r108]=HEAP[r108]+1|0;if((HEAP[r108]|0)>=(HEAP[HEAP[r26]|0]|0)){break L900}}}}while(0);if(HEAP[r29]>=HEAP[r107]){break}HEAP[r29]=HEAP[r107];HEAP[r27]=HEAP[r97];HEAP[r28]=HEAP[r98]}}while(0);HEAP[r33]=HEAP[r33]+1|0;if((HEAP[r33]|0)>=(HEAP[r41]|0)){break L872}}}}while(0);if((HEAP[r32]|0)<(HEAP[HEAP[r26]|0]|0)){HEAP[r37]=HEAP[r37]-1|0}else{HEAP[r38]=HEAP[r38]-1|0}HEAP[r32]=HEAP[r32]+1|0;if((HEAP[r32]|0)>=(HEAP[HEAP[r26]|0]<<1|0)){break L829}}}}while(0);if((HEAP[r31]|0)<(HEAP[HEAP[r26]|0]|0)){HEAP[r37]=HEAP[r37]-1|0}else{HEAP[r38]=HEAP[r38]-1|0}HEAP[r31]=HEAP[r31]+1|0;if((HEAP[r31]+1|0)>=(HEAP[HEAP[r26]|0]<<1|0)){break L822}}}}while(0);if((HEAP[r30]|0)<(HEAP[HEAP[r26]|0]|0)){HEAP[r37]=HEAP[r37]-1|0}else{HEAP[r38]=HEAP[r38]-1|0}HEAP[r30]=HEAP[r30]+1|0;if((HEAP[r30]+2|0)>=(HEAP[HEAP[r26]|0]<<1|0)){break L814}}}}while(0);if(HEAP[r29]<=0){___assert_func(36728,1365,37908,35884)}HEAP[HEAP[r26]+12|0]=1;HEAP[HEAP[r26]+16|0]=HEAP[r27]+.5&-1;HEAP[HEAP[r26]+20|0]=HEAP[r28]+.5&-1}r28=HEAP[r2+16|0];r26=HEAP[r2+20|0];r2=(r5<<2)+HEAP[r127+12|0]|0;r27=(r5<<2)+HEAP[r127+16|0]|0;HEAP[r8]=r127;HEAP[r9]=r1;HEAP[r10]=r28;HEAP[r11]=r26;HEAP[r12]=r2;HEAP[r13]=r27;HEAP[HEAP[r12]]=HEAP[r10]-HEAP[HEAP[r9]+24|0]|0;HEAP[HEAP[r13]]=HEAP[r11]-HEAP[HEAP[r9]+28|0]|0;r11=Math.imul(HEAP[HEAP[r8]+4|0],HEAP[HEAP[r12]]);HEAP[HEAP[r12]]=(r11|0)/(HEAP[HEAP[r9]+40|0]|0)&-1;r11=Math.imul(HEAP[HEAP[r8]+4|0],HEAP[HEAP[r13]]);HEAP[HEAP[r13]]=(r11|0)/(HEAP[HEAP[r9]+40|0]|0)&-1;r9=HEAP[r12];HEAP[r9]=HEAP[r9]+((HEAP[HEAP[r8]+4|0]|0)/2&-1)|0;r9=HEAP[r13];HEAP[r9]=HEAP[r9]+((HEAP[HEAP[r8]+4|0]|0)/2&-1)|0;HEAP[r3]=HEAP[(r5<<2)+HEAP[r127+12|0]|0];HEAP[r4]=HEAP[(r5<<2)+HEAP[r127+16|0]|0];STACKTOP=r7;return}function _face_order(r1,r2,r3){var r4,r5,r6,r7;r4=r1;r1=r3;r3=0;r5=HEAP[r4|0];r6=HEAP[r5+4|0]+(r2*24&-1)|0;r2=0;if((r2|0)>=(HEAP[r6|0]|0)){r7=r3;return r7}while(1){if((HEAP[HEAP[r4+8|0]+((HEAP[(r2<<2)+HEAP[r6+4|0]|0]-HEAP[r5+12|0]|0)/16&-1)|0]<<24>>24|0)==(r1<<24>>24|0)){r3=r3+1|0}r2=r2+1|0;if((r2|0)>=(HEAP[r6|0]|0)){break}}r7=r3;return r7}function _game_redraw_in_rect(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168;r8=STACKTOP;STACKTOP=STACKTOP+636|0;r9=r8;r10=r8+4;r11=r8+8;r12=r8+12;r13=r8+16;r14=r8+20;r15=r8+24;r16=r8+28;r17=r8+32;r18=r8+36;r19=r8+40;r20=r8+44;r21=r8+48;r22=r8+52;r23=r8+56;r24=r8+60;r25=r8+64;r26=r8+68;r27=r8+72;r28=r8+76;r29=r8+80;r30=r8+84;r31=r8+88;r32=r8+92;r33=r8+96;r34=r8+100;r35=r8+104;r36=r8+108;r37=r8+112;r38=r8+116;r39=r8+120;r40=r8+124;r41=r8+128;r42=r8+132;r43=r8+136;r44=r8+140;r45=r8+144;r46=r8+148;r47=r8+152;r48=r8+156;r49=r8+160;r50=r8+164;r51=r8+168;r52=r8+172;r53=r8+176;r54=r8+180;r55=r8+184;r56=r8+188;r57=r8+192;r58=r8+196;r59=r8+200;r60=r8+204;r61=r8+208;r62=r8+212;r63=r8+216;r64=r8+220;r65=r8+224;r66=r8+228;r67=r8+232;r68=r8+236;r69=r8+240;r70=r8+244;r71=r8+248;r72=r8+252;r73=r8+256;r74=r8+260;r75=r8+264;r76=r8+296;r77=r8+300;r78=r8+304;r79=r8+308;r80=r8+312;r81=r8+316;r82=r8+320;r83=r8+324;r84=r8+328;r85=r8+332;r86=r8+336;r87=r8+340;r88=r8+344;r89=r8+348;r90=r8+352;r91=r8+356;r92=r8+360;r93=r8+364;r94=r8+368;r95=r8+372;r96=r8+376;r97=r8+380;r98=r8+384;r99=r8+388;r100=r8+392;r101=r8+396;r102=r8+400;r103=r8+404;r104=r8+408;r105=r8+412;r106=r8+416;r107=r8+420;r108=r8+424;r109=r8+428;r110=r8+432;r111=r8+436;r112=r8+440;r113=r8+444;r114=r8+448;r115=r8+452;r116=r8+456;r117=r8+460;r118=r8+464;r119=r8+468;r120=r8+488;r121=r8+492;r122=r8+496;r123=r8+500;r124=r8+504;r125=r8+508;r126=r8+512;r127=r8+516;r128=r8+520;r129=r8+524;r130=r8+528;r131=r8+532;r132=r8+536;r133=r8+540;r134=r8+544;r135=r8+548;r136=r8+552;r137=r8+556;r138=r8+560;r139=r8+564;r140=r8+568;r141=r8+572;r142=r8+576;r143=r8+580;r144=r8+584;r145=r8+588;r146=r8+592;r147=r8+596;r148=r8+600;r149=r8+604;r150=r8+608;r151=r8+612;r152=r8+616;r153=r8+620;r154=r8+624;r155=r8+628;r156=r8+632;r157=r1;r1=r2;r2=r3;r3=r4;r4=r5;r5=r6;r6=r7;r7=HEAP[r2|0];HEAP[r148]=r157;HEAP[r149]=r3;HEAP[r150]=r4;HEAP[r151]=r5;HEAP[r152]=r6;FUNCTION_TABLE[HEAP[HEAP[HEAP[r148]|0]+24|0]](HEAP[HEAP[r148]+4|0],HEAP[r149],HEAP[r150],HEAP[r151],HEAP[r152]);HEAP[r142]=r157;HEAP[r143]=r3;HEAP[r144]=r4;HEAP[r145]=r5;HEAP[r146]=r6;HEAP[r147]=0;FUNCTION_TABLE[HEAP[HEAP[HEAP[r142]|0]+4|0]](HEAP[HEAP[r142]+4|0],HEAP[r143],HEAP[r144],HEAP[r145],HEAP[r146],HEAP[r147]);r147=0;L942:do{if((r147|0)<(HEAP[r7|0]|0)){r146=r119|0;r145=r119|0;while(1){do{if((HEAP[HEAP[r2+4|0]+r147|0]<<24>>24|0)>=0){r144=HEAP[r7+4|0]+(r147*24&-1)|0;HEAP[r133]=r1;HEAP[r134]=r7;HEAP[r135]=r144;HEAP[r136]=r153;HEAP[r137]=r154;HEAP[r138]=r155;HEAP[r139]=r156;_face_text_pos(HEAP[r133],HEAP[r134],HEAP[r135],r140,r141);HEAP[HEAP[r136]]=HEAP[r140]-1+ -((HEAP[HEAP[r133]+4|0]|0)/4&-1)|0;HEAP[HEAP[r137]]=HEAP[r141]-3+ -((HEAP[HEAP[r133]+4|0]|0)/4&-1)|0;HEAP[HEAP[r138]]=((HEAP[HEAP[r133]+4|0]|0)/2&-1)+2|0;HEAP[HEAP[r139]]=((HEAP[HEAP[r133]+4|0]|0)/2&-1)+5|0;r144=HEAP[r153];r143=HEAP[r154];r142=HEAP[r155];r152=HEAP[r156];HEAP[r125]=r3;HEAP[r126]=r4;HEAP[r127]=r5;HEAP[r128]=r6;HEAP[r129]=r144;HEAP[r130]=r143;HEAP[r131]=r142;HEAP[r132]=r152;do{if((HEAP[r125]|0)<(HEAP[r131]+HEAP[r129]|0)){if((HEAP[r129]|0)>=(HEAP[r127]+HEAP[r125]|0)){r158=0;break}if((HEAP[r126]|0)>=(HEAP[r132]+HEAP[r130]|0)){r158=0;break}r158=(HEAP[r130]|0)<(HEAP[r128]+HEAP[r126]|0)}else{r158=0}}while(0);if((r158&1|0)==0){break}HEAP[r111]=r157;HEAP[r112]=r1;HEAP[r113]=r2;HEAP[r114]=r147;HEAP[r115]=HEAP[HEAP[r113]|0];HEAP[r116]=HEAP[HEAP[r115]+4|0]+(HEAP[r114]*24&-1)|0;_sprintf(r146,35876,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[HEAP[HEAP[r113]+4|0]+HEAP[r114]|0]<<24>>24,tempInt));_face_text_pos(HEAP[r112],HEAP[r115],HEAP[r116],r117,r118);r152=HEAP[r117];r142=HEAP[r118];r143=(HEAP[HEAP[r112]+4|0]|0)/2&-1;if((HEAP[HEAP[HEAP[r112]+24|0]+HEAP[r114]|0]<<24>>24|0)!=0){r159=4}else{r159=(HEAP[HEAP[HEAP[r112]+28|0]+HEAP[r114]|0]<<24>>24|0)!=0?5:1}HEAP[r103]=HEAP[r111];HEAP[r104]=r152;HEAP[r105]=r142;HEAP[r106]=1;HEAP[r107]=r143;HEAP[r108]=257;HEAP[r109]=r159;HEAP[r110]=r145;FUNCTION_TABLE[HEAP[HEAP[HEAP[r103]|0]|0]](HEAP[HEAP[r103]+4|0],HEAP[r104],HEAP[r105],HEAP[r106],HEAP[r107],HEAP[r108],HEAP[r109],HEAP[r110])}}while(0);r147=r147+1|0;if((r147|0)>=(HEAP[r7|0]|0)){break L942}}}}while(0);r110=0;r147=0;r109=r75|0;r108=r75+4|0;r107=r75+8|0;r106=r75+12|0;r105=r75+16|0;r104=r75+20|0;r103=r75+24|0;r159=r75+28|0;r111=r75|0;while(1){L961:do{if((r147|0)<(HEAP[r7+8|0]|0)){while(1){_edge_bbox(r1,r7,(r147<<4)+HEAP[r7+12|0]|0,r153,r154,r155,r156);r75=HEAP[r153];r114=HEAP[r154];r112=HEAP[r155];r118=HEAP[r156];HEAP[r95]=r3;HEAP[r96]=r4;HEAP[r97]=r5;HEAP[r98]=r6;HEAP[r99]=r75;HEAP[r100]=r114;HEAP[r101]=r112;HEAP[r102]=r118;do{if((HEAP[r95]|0)<(HEAP[r101]+HEAP[r99]|0)){if((HEAP[r99]|0)>=(HEAP[r97]+HEAP[r95]|0)){r160=0;break}if((HEAP[r96]|0)>=(HEAP[r102]+HEAP[r100]|0)){r160=0;break}r160=(HEAP[r100]|0)<(HEAP[r98]+HEAP[r96]|0)}else{r160=0}}while(0);do{if((r160&1|0)!=0){HEAP[r82]=r157;HEAP[r83]=r1;HEAP[r84]=r2;HEAP[r85]=r147;HEAP[r86]=r110;HEAP[r87]=HEAP[HEAP[r84]|0];HEAP[r88]=(HEAP[r85]<<4)+HEAP[HEAP[r87]+12|0]|0;do{if(HEAP[HEAP[HEAP[r84]+12|0]+HEAP[r85]|0]<<24>>24!=0){HEAP[r93]=4}else{if((HEAP[HEAP[HEAP[r84]+8|0]+HEAP[r85]|0]<<24>>24|0)==1){HEAP[r93]=2;break}if((HEAP[HEAP[HEAP[r84]+8|0]+HEAP[r85]|0]<<24>>24|0)==2){HEAP[r93]=6;break}if((HEAP[HEAP[r83]+8|0]|0)!=0){HEAP[r93]=3;break}else{HEAP[r93]=1;break}}}while(0);if((HEAP[r93]|0)!=(HEAP[(HEAP[r86]<<2)+33260|0]|0)){break}r118=HEAP[r87];r112=HEAP[HEAP[HEAP[r88]|0]+12|0];r114=HEAP[HEAP[HEAP[r88]|0]+16|0];HEAP[r76]=HEAP[r83];HEAP[r77]=r118;HEAP[r78]=r112;HEAP[r79]=r114;HEAP[r80]=r89;HEAP[r81]=r91;HEAP[HEAP[r80]]=HEAP[r78]-HEAP[HEAP[r77]+24|0]|0;HEAP[HEAP[r81]]=HEAP[r79]-HEAP[HEAP[r77]+28|0]|0;r114=Math.imul(HEAP[HEAP[r76]+4|0],HEAP[HEAP[r80]]);HEAP[HEAP[r80]]=(r114|0)/(HEAP[HEAP[r77]+40|0]|0)&-1;r114=Math.imul(HEAP[HEAP[r76]+4|0],HEAP[HEAP[r81]]);HEAP[HEAP[r81]]=(r114|0)/(HEAP[HEAP[r77]+40|0]|0)&-1;r114=HEAP[r80];HEAP[r114]=HEAP[r114]+((HEAP[HEAP[r76]+4|0]|0)/2&-1)|0;r114=HEAP[r81];HEAP[r114]=HEAP[r114]+((HEAP[HEAP[r76]+4|0]|0)/2&-1)|0;r114=HEAP[r87];r112=HEAP[HEAP[HEAP[r88]+4|0]+12|0];r118=HEAP[HEAP[HEAP[r88]+4|0]+16|0];HEAP[r59]=HEAP[r83];HEAP[r60]=r114;HEAP[r61]=r112;HEAP[r62]=r118;HEAP[r63]=r90;HEAP[r64]=r92;HEAP[HEAP[r63]]=HEAP[r61]-HEAP[HEAP[r60]+24|0]|0;HEAP[HEAP[r64]]=HEAP[r62]-HEAP[HEAP[r60]+28|0]|0;r118=Math.imul(HEAP[HEAP[r59]+4|0],HEAP[HEAP[r63]]);HEAP[HEAP[r63]]=(r118|0)/(HEAP[HEAP[r60]+40|0]|0)&-1;r118=Math.imul(HEAP[HEAP[r59]+4|0],HEAP[HEAP[r64]]);HEAP[HEAP[r64]]=(r118|0)/(HEAP[HEAP[r60]+40|0]|0)&-1;r118=HEAP[r63];HEAP[r118]=HEAP[r118]+((HEAP[HEAP[r59]+4|0]|0)/2&-1)|0;r118=HEAP[r64];HEAP[r118]=HEAP[r118]+((HEAP[HEAP[r59]+4|0]|0)/2&-1)|0;if((HEAP[r93]|0)!=6){r118=(HEAP[r89]|0)+.5;r112=(HEAP[r91]|0)+.5;r114=(HEAP[r90]|0)+.5;r75=(HEAP[r92]|0)+.5;r117=HEAP[r93];HEAP[r65]=HEAP[r82];HEAP[r66]=3;HEAP[r67]=r118;HEAP[r68]=r112;HEAP[r69]=r114;HEAP[r70]=r75;HEAP[r71]=r117;if((HEAP[HEAP[HEAP[r65]|0]+96|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r65]|0]+96|0]](HEAP[HEAP[r65]+4|0],HEAP[r66],HEAP[r67],HEAP[r68],HEAP[r69],HEAP[r70],HEAP[r71]);break}else{r117=Math.sqrt((HEAP[r69]-HEAP[r67])*(HEAP[r69]-HEAP[r67])+(HEAP[r70]-HEAP[r68])*(HEAP[r70]-HEAP[r68]));HEAP[r72]=r117;HEAP[r73]=(HEAP[r69]-HEAP[r67])/HEAP[r72]*(HEAP[r66]/2-.2);HEAP[r74]=(HEAP[r70]-HEAP[r68])/HEAP[r72]*(HEAP[r66]/2-.2);HEAP[r109]=HEAP[r67]-HEAP[r74]&-1;HEAP[r108]=HEAP[r68]+HEAP[r73]&-1;HEAP[r107]=HEAP[r69]-HEAP[r74]&-1;HEAP[r106]=HEAP[r70]+HEAP[r73]&-1;HEAP[r105]=HEAP[r69]+HEAP[r74]&-1;HEAP[r104]=HEAP[r70]-HEAP[r73]&-1;HEAP[r103]=HEAP[r67]+HEAP[r74]&-1;HEAP[r159]=HEAP[r68]-HEAP[r73]&-1;FUNCTION_TABLE[HEAP[HEAP[HEAP[r65]|0]+12|0]](HEAP[HEAP[r65]+4|0],r111,4,HEAP[r71],HEAP[r71]);break}}r117=HEAP[33696];if((r117|0)<0){r75=_getenv(35080);HEAP[r94]=r75;do{if((HEAP[r94]|0)!=0){if((HEAP[HEAP[r94]]<<24>>24|0)==121){r161=1;break}r161=(HEAP[HEAP[r94]]<<24>>24|0)==89}else{r161=1}}while(0);r75=r161&1;HEAP[33696]=r75;r162=r75}else{r162=r117}if((r162|0)==0){break}r75=HEAP[r89];r114=HEAP[r91];r112=HEAP[r90];r118=HEAP[r92];r116=HEAP[r93];HEAP[r53]=HEAP[r82];HEAP[r54]=r75;HEAP[r55]=r114;HEAP[r56]=r112;HEAP[r57]=r118;HEAP[r58]=r116;FUNCTION_TABLE[HEAP[HEAP[HEAP[r53]|0]+8|0]](HEAP[HEAP[r53]+4|0],HEAP[r54],HEAP[r55],HEAP[r56],HEAP[r57],HEAP[r58])}}while(0);r147=r147+1|0;if((r147|0)>=(HEAP[r7+8|0]|0)){break L961}}}}while(0);r116=r110+1|0;r110=r116;r147=0;if(r116>>>0>=5){break}}L1002:do{if((r147|0)<(HEAP[r7+16|0]|0)){while(1){r110=HEAP[r7+20|0]+(r147*20&-1)|0;HEAP[r44]=r1;HEAP[r45]=r7;HEAP[r46]=r110;HEAP[r47]=r153;HEAP[r48]=r154;HEAP[r49]=r155;HEAP[r50]=r156;r110=HEAP[r45];r58=HEAP[HEAP[r46]+12|0];r57=HEAP[HEAP[r46]+16|0];HEAP[r38]=HEAP[r44];HEAP[r39]=r110;HEAP[r40]=r58;HEAP[r41]=r57;HEAP[r42]=r51;HEAP[r43]=r52;HEAP[HEAP[r42]]=HEAP[r40]-HEAP[HEAP[r39]+24|0]|0;HEAP[HEAP[r43]]=HEAP[r41]-HEAP[HEAP[r39]+28|0]|0;r57=Math.imul(HEAP[HEAP[r38]+4|0],HEAP[HEAP[r42]]);HEAP[HEAP[r42]]=(r57|0)/(HEAP[HEAP[r39]+40|0]|0)&-1;r57=Math.imul(HEAP[HEAP[r38]+4|0],HEAP[HEAP[r43]]);HEAP[HEAP[r43]]=(r57|0)/(HEAP[HEAP[r39]+40|0]|0)&-1;r57=HEAP[r42];HEAP[r57]=HEAP[r57]+((HEAP[HEAP[r38]+4|0]|0)/2&-1)|0;r57=HEAP[r43];HEAP[r57]=HEAP[r57]+((HEAP[HEAP[r38]+4|0]|0)/2&-1)|0;HEAP[HEAP[r47]]=HEAP[r51]-2|0;HEAP[HEAP[r48]]=HEAP[r52]-2|0;HEAP[HEAP[r49]]=5;HEAP[HEAP[r50]]=5;r57=HEAP[r153];r58=HEAP[r154];r110=HEAP[r155];r56=HEAP[r156];HEAP[r30]=r3;HEAP[r31]=r4;HEAP[r32]=r5;HEAP[r33]=r6;HEAP[r34]=r57;HEAP[r35]=r58;HEAP[r36]=r110;HEAP[r37]=r56;do{if((HEAP[r30]|0)<(HEAP[r36]+HEAP[r34]|0)){if((HEAP[r34]|0)>=(HEAP[r32]+HEAP[r30]|0)){r163=0;break}if((HEAP[r31]|0)>=(HEAP[r37]+HEAP[r35]|0)){r163=0;break}r163=(HEAP[r35]|0)<(HEAP[r33]+HEAP[r31]|0)}else{r163=0}}while(0);if((r163&1|0)!=0){HEAP[r22]=r157;HEAP[r23]=r1;HEAP[r24]=r2;HEAP[r25]=r147;HEAP[r26]=HEAP[HEAP[r24]|0];HEAP[r27]=HEAP[HEAP[r26]+20|0]+(HEAP[r25]*20&-1)|0;r56=HEAP[r26];r110=HEAP[HEAP[r27]+12|0];r58=HEAP[HEAP[r27]+16|0];HEAP[r16]=HEAP[r23];HEAP[r17]=r56;HEAP[r18]=r110;HEAP[r19]=r58;HEAP[r20]=r28;HEAP[r21]=r29;HEAP[HEAP[r20]]=HEAP[r18]-HEAP[HEAP[r17]+24|0]|0;HEAP[HEAP[r21]]=HEAP[r19]-HEAP[HEAP[r17]+28|0]|0;r58=Math.imul(HEAP[HEAP[r16]+4|0],HEAP[HEAP[r20]]);HEAP[HEAP[r20]]=(r58|0)/(HEAP[HEAP[r17]+40|0]|0)&-1;r58=Math.imul(HEAP[HEAP[r16]+4|0],HEAP[HEAP[r21]]);HEAP[HEAP[r21]]=(r58|0)/(HEAP[HEAP[r17]+40|0]|0)&-1;r58=HEAP[r20];HEAP[r58]=HEAP[r58]+((HEAP[HEAP[r16]+4|0]|0)/2&-1)|0;r58=HEAP[r21];HEAP[r58]=HEAP[r58]+((HEAP[HEAP[r16]+4|0]|0)/2&-1)|0;r58=HEAP[r28];r110=HEAP[r29];HEAP[r10]=HEAP[r22];HEAP[r11]=r58;HEAP[r12]=r110;HEAP[r13]=2;HEAP[r14]=1;HEAP[r15]=1;FUNCTION_TABLE[HEAP[HEAP[HEAP[r10]|0]+16|0]](HEAP[HEAP[r10]+4|0],HEAP[r11],HEAP[r12],HEAP[r13],HEAP[r14],HEAP[r15])}r147=r147+1|0;if((r147|0)>=(HEAP[r7+16|0]|0)){break L1002}}}}while(0);HEAP[r9]=r157;FUNCTION_TABLE[HEAP[HEAP[HEAP[r9]|0]+28|0]](HEAP[HEAP[r9]+4|0]);HEAP[r120]=r157;HEAP[r121]=r3;HEAP[r122]=r4;HEAP[r123]=r5;HEAP[r124]=r6;if((HEAP[HEAP[HEAP[r120]|0]+20|0]|0)==0){r164=r120;r165=r121;r166=r122;r167=r123;r168=r124;STACKTOP=r8;return}FUNCTION_TABLE[HEAP[HEAP[HEAP[r120]|0]+20|0]](HEAP[HEAP[r120]+4|0],HEAP[r121],HEAP[r122],HEAP[r123],HEAP[r124]);r164=r120;r165=r121;r166=r122;r167=r123;r168=r124;STACKTOP=r8;return}function _edge_bbox(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r8=STACKTOP;STACKTOP=STACKTOP+64|0;r9=r8;r10=r8+4;r11=r8+8;r12=r8+12;r13=r8+16;r14=r8+20;r15=r8+24;r16=r8+28;r17=r8+32;r18=r8+36;r19=r8+40;r20=r8+44;r21=r8+48;r22=r8+52;r23=r8+56;r24=r8+60;r25=r1;r1=r2;r2=r3;HEAP[r21]=HEAP[HEAP[r2|0]+12|0];HEAP[r22]=HEAP[HEAP[r2|0]+16|0];HEAP[r23]=HEAP[HEAP[r2+4|0]+12|0];HEAP[r24]=HEAP[HEAP[r2+4|0]+16|0];r2=HEAP[r21];r3=HEAP[r22];HEAP[r15]=r25;HEAP[r16]=r1;HEAP[r17]=r2;HEAP[r18]=r3;HEAP[r19]=r21;HEAP[r20]=r22;HEAP[HEAP[r19]]=HEAP[r17]-HEAP[HEAP[r16]+24|0]|0;HEAP[HEAP[r20]]=HEAP[r18]-HEAP[HEAP[r16]+28|0]|0;r18=Math.imul(HEAP[HEAP[r15]+4|0],HEAP[HEAP[r19]]);HEAP[HEAP[r19]]=(r18|0)/(HEAP[HEAP[r16]+40|0]|0)&-1;r18=Math.imul(HEAP[HEAP[r15]+4|0],HEAP[HEAP[r20]]);HEAP[HEAP[r20]]=(r18|0)/(HEAP[HEAP[r16]+40|0]|0)&-1;r16=HEAP[r19];HEAP[r16]=HEAP[r16]+((HEAP[HEAP[r15]+4|0]|0)/2&-1)|0;r16=HEAP[r20];HEAP[r16]=HEAP[r16]+((HEAP[HEAP[r15]+4|0]|0)/2&-1)|0;r15=HEAP[r23];r16=HEAP[r24];HEAP[r9]=r25;HEAP[r10]=r1;HEAP[r11]=r15;HEAP[r12]=r16;HEAP[r13]=r23;HEAP[r14]=r24;HEAP[HEAP[r13]]=HEAP[r11]-HEAP[HEAP[r10]+24|0]|0;HEAP[HEAP[r14]]=HEAP[r12]-HEAP[HEAP[r10]+28|0]|0;r12=Math.imul(HEAP[HEAP[r9]+4|0],HEAP[HEAP[r13]]);HEAP[HEAP[r13]]=(r12|0)/(HEAP[HEAP[r10]+40|0]|0)&-1;r12=Math.imul(HEAP[HEAP[r9]+4|0],HEAP[HEAP[r14]]);HEAP[HEAP[r14]]=(r12|0)/(HEAP[HEAP[r10]+40|0]|0)&-1;r10=HEAP[r13];HEAP[r10]=HEAP[r10]+((HEAP[HEAP[r9]+4|0]|0)/2&-1)|0;r10=HEAP[r14];HEAP[r10]=HEAP[r10]+((HEAP[HEAP[r9]+4|0]|0)/2&-1)|0;r9=((HEAP[r21]|0)<(HEAP[r23]|0)?HEAP[r21]:HEAP[r23])-2|0;r10=((HEAP[r21]|0)>(HEAP[r23]|0)?HEAP[r21]:HEAP[r23])+2|0;r23=((HEAP[r22]|0)<(HEAP[r24]|0)?HEAP[r22]:HEAP[r24])-2|0;r21=((HEAP[r22]|0)>(HEAP[r24]|0)?HEAP[r22]:HEAP[r24])+2|0;HEAP[r4]=r9;HEAP[r5]=r23;HEAP[r6]=r10+ -r9+1|0;HEAP[r7]=r21+ -r23+1|0;STACKTOP=r8;return}function _dot_order(r1,r2,r3){var r4,r5,r6,r7;r4=r1;r1=r3;r3=0;r5=HEAP[r4|0];r6=HEAP[r5+20|0]+(r2*20&-1)|0;r2=0;if((r2|0)>=(HEAP[r6|0]|0)){r7=r3;return r7}while(1){if((HEAP[HEAP[r4+8|0]+((HEAP[(r2<<2)+HEAP[r6+4|0]|0]-HEAP[r5+12|0]|0)/16&-1)|0]<<24>>24|0)==(r1<<24>>24|0)){r3=r3+1|0}r2=r2+1|0;if((r2|0)>=(HEAP[r6|0]|0)){break}}r7=r3;return r7}function _new_solver_state(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42;r3=STACKTOP;STACKTOP=STACKTOP+128|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r3+100;r30=r3+104;r31=r3+108;r32=r3+112;r33=r3+116;r34=r3+120;r35=r3+124;r36=r1;r1=r2;r2=HEAP[HEAP[r36|0]+16|0];r37=HEAP[HEAP[r36|0]|0];r38=HEAP[HEAP[r36|0]+8|0];HEAP[r34]=52;r39=_malloc(HEAP[r34]);HEAP[r35]=r39;if((HEAP[r35]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r39=HEAP[r35];r35=_dup_game(r36);HEAP[r39|0]=r35;HEAP[r39+4|0]=3;HEAP[r39+12|0]=r1;HEAP[r32]=r2;HEAP[r30]=HEAP[r32]<<2;r35=_malloc(HEAP[r30]);HEAP[r31]=r35;if((HEAP[r31]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r33]=HEAP[r31];r31=HEAP[r32];HEAP[r7]=HEAP[r33];HEAP[r8]=r31;HEAP[r9]=0;L1036:do{if((HEAP[r9]|0)<(HEAP[r8]|0)){while(1){HEAP[(HEAP[r9]<<2)+HEAP[r7]|0]=6;HEAP[r9]=HEAP[r9]+1|0;if((HEAP[r9]|0)>=(HEAP[r8]|0)){break L1036}}}}while(0);HEAP[r39+40|0]=HEAP[r33];HEAP[r28]=r2<<2;r33=_malloc(HEAP[r28]);HEAP[r29]=r33;if((r33|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r39+8|0]=HEAP[r29];r29=0;L1043:do{if((r29|0)<(r2|0)){while(1){HEAP[(r29<<2)+HEAP[r39+8|0]|0]=1;r29=r29+1|0;if((r29|0)>=(r2|0)){break L1043}}}}while(0);HEAP[r26]=r2;r29=_malloc(HEAP[r26]);HEAP[r27]=r29;if((r29|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r39+32|0]=HEAP[r27];HEAP[r24]=r37;r27=_malloc(HEAP[r24]);HEAP[r25]=r27;if((HEAP[r25]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r39+36|0]=HEAP[r25];r25=HEAP[r39+32|0];r27=r2;for(r40=r25,r41=r40+r27;r40<r41;r40++){HEAP[r40]=0}r27=HEAP[r39+36|0];r25=r37;for(r40=r27,r41=r40+r25;r40<r41;r40++){HEAP[r40]=0}HEAP[r22]=r2;r25=_malloc(HEAP[r22]);HEAP[r23]=r25;if((HEAP[r23]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r39+16|0]=HEAP[r23];r23=HEAP[r39+16|0];r25=r2;for(r40=r23,r41=r40+r25;r40<r41;r40++){HEAP[r40]=0}HEAP[r20]=r2;r25=_malloc(HEAP[r20]);HEAP[r21]=r25;if((HEAP[r21]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r39+20|0]=HEAP[r21];r21=HEAP[r39+20|0];r25=r2;for(r40=r21,r41=r40+r25;r40<r41;r40++){HEAP[r40]=0}HEAP[r18]=r37;r25=_malloc(HEAP[r18]);HEAP[r19]=r25;if((HEAP[r19]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r39+24|0]=HEAP[r19];r19=HEAP[r39+24|0];r25=r37;for(r40=r19,r41=r40+r25;r40<r41;r40++){HEAP[r40]=0}HEAP[r16]=r37;r25=_malloc(HEAP[r16]);HEAP[r17]=r25;if((HEAP[r17]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r39+28|0]=HEAP[r17];r17=HEAP[r39+28|0];r25=r37;for(r40=r17,r41=r40+r25;r40<r41;r40++){HEAP[r40]=0}do{if((r1|0)<1){HEAP[r39+44|0]=0}else{HEAP[r14]=r38<<1;r25=_malloc(HEAP[r14]);HEAP[r15]=r25;if((HEAP[r15]|0)!=0){HEAP[r39+44|0]=HEAP[r15];r25=HEAP[r39+44|0];r17=r38<<1;for(r40=r25,r41=r40+r17;r40<r41;r40++){HEAP[r40]=0}break}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}}while(0);if((r1|0)<3){HEAP[r39+48|0]=0;r42=r39;STACKTOP=r3;return r42}HEAP[r12]=HEAP[HEAP[r36|0]+8|0];HEAP[r10]=HEAP[r12]<<2;r36=_malloc(HEAP[r10]);HEAP[r11]=r36;if((HEAP[r11]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r13]=HEAP[r11];r11=HEAP[r12];HEAP[r4]=HEAP[r13];HEAP[r5]=r11;HEAP[r6]=0;L1079:do{if((HEAP[r6]|0)<(HEAP[r5]|0)){while(1){HEAP[(HEAP[r6]<<2)+HEAP[r4]|0]=6;HEAP[r6]=HEAP[r6]+1|0;if((HEAP[r6]|0)>=(HEAP[r5]|0)){break L1079}}}}while(0);HEAP[r39+48|0]=HEAP[r13];r42=r39;STACKTOP=r3;return r42}function _solve_game_rec(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+132|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r3+100;r30=r3+104;r31=r3+108;r32=r3+112;r33=r3+116;r34=r3+120;r35=r3+124;r36=r3+128;r37=0;r38=0;r39=0;HEAP[r31]=r1;HEAP[r32]=HEAP[HEAP[r31]|0];HEAP[r33]=HEAP[HEAP[HEAP[r32]|0]+16|0];HEAP[r34]=HEAP[HEAP[HEAP[r32]|0]|0];HEAP[r35]=HEAP[HEAP[HEAP[r32]|0]+8|0];HEAP[r29]=52;r1=_malloc(HEAP[r29]);HEAP[r30]=r1;if((HEAP[r30]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r36]=HEAP[r30];r30=_dup_game(HEAP[HEAP[r31]|0]);HEAP[r32]=r30;HEAP[HEAP[r36]|0]=r30;HEAP[HEAP[r36]+4|0]=HEAP[HEAP[r31]+4|0];HEAP[HEAP[r36]+12|0]=HEAP[HEAP[r31]+12|0];HEAP[r27]=HEAP[r33]<<2;r30=_malloc(HEAP[r27]);HEAP[r28]=r30;if((HEAP[r28]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[HEAP[r36]+40|0]=HEAP[r28];HEAP[r25]=HEAP[r33]<<2;r28=_malloc(HEAP[r25]);HEAP[r26]=r28;if((HEAP[r26]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[HEAP[r36]+8|0]=HEAP[r26];r26=HEAP[HEAP[r36]+40|0];r28=HEAP[HEAP[r31]+40|0];r25=HEAP[r33]<<2;for(r40=r28,r41=r26,r42=r40+r25;r40<r42;r40++,r41++){HEAP[r41]=HEAP[r40]}r25=HEAP[HEAP[r36]+8|0];r26=HEAP[HEAP[r31]+8|0];r28=HEAP[r33]<<2;for(r40=r26,r41=r25,r42=r40+r28;r40<r42;r40++,r41++){HEAP[r41]=HEAP[r40]}HEAP[r23]=HEAP[r33];r28=_malloc(HEAP[r23]);HEAP[r24]=r28;if((HEAP[r24]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[HEAP[r36]+32|0]=HEAP[r24];HEAP[r21]=HEAP[r34];r24=_malloc(HEAP[r21]);HEAP[r22]=r24;if((HEAP[r22]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[HEAP[r36]+36|0]=HEAP[r22];r22=HEAP[HEAP[r36]+32|0];r24=HEAP[HEAP[r31]+32|0];r21=HEAP[r33];for(r40=r24,r41=r22,r42=r40+r21;r40<r42;r40++,r41++){HEAP[r41]=HEAP[r40]}r21=HEAP[HEAP[r36]+36|0];r22=HEAP[HEAP[r31]+36|0];r24=HEAP[r34];for(r40=r22,r41=r21,r42=r40+r24;r40<r42;r40++,r41++){HEAP[r41]=HEAP[r40]}HEAP[r19]=HEAP[r33];r24=_malloc(HEAP[r19]);HEAP[r20]=r24;if((HEAP[r20]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[HEAP[r36]+16|0]=HEAP[r20];r20=HEAP[HEAP[r36]+16|0];r24=HEAP[HEAP[r31]+16|0];r19=HEAP[r33];for(r40=r24,r41=r20,r42=r40+r19;r40<r42;r40++,r41++){HEAP[r41]=HEAP[r40]}HEAP[r17]=HEAP[r33];r19=_malloc(HEAP[r17]);HEAP[r18]=r19;if((HEAP[r18]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[HEAP[r36]+20|0]=HEAP[r18];r18=HEAP[HEAP[r36]+20|0];r19=HEAP[HEAP[r31]+20|0];r17=HEAP[r33];for(r40=r19,r41=r18,r42=r40+r17;r40<r42;r40++,r41++){HEAP[r41]=HEAP[r40]}HEAP[r15]=HEAP[r34];r17=_malloc(HEAP[r15]);HEAP[r16]=r17;if((HEAP[r16]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[HEAP[r36]+24|0]=HEAP[r16];r16=HEAP[HEAP[r36]+24|0];r17=HEAP[HEAP[r31]+24|0];r15=HEAP[r34];for(r40=r17,r41=r16,r42=r40+r15;r40<r42;r40++,r41++){HEAP[r41]=HEAP[r40]}HEAP[r13]=HEAP[r34];r15=_malloc(HEAP[r13]);HEAP[r14]=r15;if((HEAP[r14]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[HEAP[r36]+28|0]=HEAP[r14];r14=HEAP[HEAP[r36]+28|0];r15=HEAP[HEAP[r31]+28|0];r13=HEAP[r34];for(r40=r15,r41=r14,r42=r40+r13;r40<r42;r40++,r41++){HEAP[r41]=HEAP[r40]}do{if((HEAP[HEAP[r31]+44|0]|0)!=0){HEAP[r11]=HEAP[r35]<<1;r13=_malloc(HEAP[r11]);HEAP[r12]=r13;if((HEAP[r12]|0)!=0){HEAP[HEAP[r36]+44|0]=HEAP[r12];r13=HEAP[HEAP[r36]+44|0];r14=HEAP[HEAP[r31]+44|0];r15=HEAP[r35]<<1;for(r40=r14,r41=r13,r42=r40+r15;r40<r42;r40++,r41++){HEAP[r41]=HEAP[r40]}break}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}else{HEAP[HEAP[r36]+44|0]=0}}while(0);do{if((HEAP[HEAP[r31]+48|0]|0)!=0){HEAP[r9]=HEAP[r35]<<2;r12=_malloc(HEAP[r9]);HEAP[r10]=r12;if((HEAP[r10]|0)!=0){HEAP[HEAP[r36]+48|0]=HEAP[r10];r12=HEAP[HEAP[r36]+48|0];r11=HEAP[HEAP[r31]+48|0];r15=HEAP[r35]<<2;for(r40=r11,r41=r12,r42=r40+r15;r40<r42;r40++,r41++){HEAP[r41]=HEAP[r40]}break}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}else{HEAP[HEAP[r36]+48|0]=0}}while(0);r40=HEAP[r36];L1126:do{if((r37|0)<4){L1127:while(1){r43=r40;if((HEAP[r40+4|0]|0)==1){break}if((HEAP[r43+4|0]|0)==0){break L1126}if((HEAP[r40+4|0]|0)==2){break L1126}do{if((HEAP[(r37<<2)+32976|0]|0)>=(r38|0)){r2=809}else{if((r37|0)>=(r39|0)){r2=809;break}else{break}}}while(0);do{if(r2==809){r2=0;if(!((HEAP[(r37<<2)+32976|0]|0)<=(HEAP[r40+12|0]|0))){break}r36=FUNCTION_TABLE[HEAP[(r37<<2)+32960|0]](r40);if((r36|0)==4){break}r38=r36;r39=r37;r37=0;continue L1127}}while(0);r36=r37+1|0;r37=r36;if((r36|0)>=4){break L1126}}r44=r43;r45=r44;STACKTOP=r3;return r45}}while(0);do{if((HEAP[r40+4|0]|0)!=0){if((HEAP[r40+4|0]|0)==2){break}r44=r40;r45=r44;STACKTOP=r3;return r45}}while(0);r43=HEAP[HEAP[HEAP[r40|0]|0]+8|0];HEAP[r4]=HEAP[HEAP[r40|0]+8|0];r37=1;r39=2;HEAP[r5]=r43;HEAP[r6]=HEAP[r4];HEAP[r7]=HEAP[r6];HEAP[r8]=HEAP[r5];r5=_memchr(HEAP[r6],r37<<24>>24,HEAP[r8]);HEAP[r6]=r5;L1147:do{if((r5|0)!=0){while(1){HEAP[HEAP[r6]]=r39;HEAP[r8]=HEAP[r7]+ -HEAP[r6]+HEAP[r8]|0;HEAP[r7]=HEAP[r6];r4=_memchr(HEAP[r6],r37<<24>>24,HEAP[r8]);HEAP[r6]=r4;if((r4|0)==0){break L1147}}}}while(0);r44=r40;r45=r44;STACKTOP=r3;return r45}function _encode_solve_move(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11;r2=STACKTOP;STACKTOP=STACKTOP+20|0;r3=r2;r4=r2+4;r5=r2+8;r6=r2+12;r7=r2+16;r8=r1;r1=HEAP[HEAP[r8|0]+8|0];r9=1;HEAP[r5]=r1;HEAP[r6]=1;HEAP[r7]=1;L1153:do{if((HEAP[r7]|0)<(HEAP[r5]|0)){while(1){if((HEAP[r5]-HEAP[r7]|0)>0){r10=HEAP[r5]-HEAP[r7]|0}else{r10=0}HEAP[r6]=HEAP[r6]+r10|0;HEAP[r7]=HEAP[r7]*10&-1;if((HEAP[r7]|0)>=(HEAP[r5]|0)){break L1153}}}}while(0);r9=r9+HEAP[r6]|0;r9=r9+r1|0;HEAP[r3]=r9+1|0;r6=_malloc(HEAP[r3]);HEAP[r4]=r6;if((r6|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r6=HEAP[r4];r4=r6;r3=r4;HEAP[r3]=HEAP[36788];HEAP[r3+1]=HEAP[36789];r4=r4+1|0;r3=0;L1163:do{if((r3|0)<(r1|0)){while(1){r5=HEAP[HEAP[r8+8|0]+r3|0]<<24>>24;if((r5|0)==0){r4=r4+_sprintf(r4,36676,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=r3,tempInt))|0}else if((r5|0)==2){r4=r4+_sprintf(r4,36608,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=r3,tempInt))|0}r3=r3+1|0;if((r3|0)>=(r1|0)){break L1163}}}}while(0);if(_strlen(r6)>>>0<=r9>>>0){r11=r6;STACKTOP=r2;return r11}___assert_func(34104,801,38016,36488);r11=r6;STACKTOP=r2;return r11}function _free_solver_state(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r2=STACKTOP;STACKTOP=STACKTOP+44|0;r3=r2;r4=r2+4;r5=r2+8;r6=r2+12;r7=r2+16;r8=r2+20;r9=r2+24;r10=r2+28;r11=r2+32;r12=r2+36;r13=r2+40;r14=r1;if((r14|0)==0){STACKTOP=r2;return}_free_game(HEAP[r14|0]);HEAP[r13]=HEAP[r14+40|0];if((HEAP[r13]|0)!=0){_free(HEAP[r13])}r13=HEAP[r14+8|0];HEAP[r12]=r13;if((r13|0)!=0){_free(HEAP[r12])}r12=HEAP[r14+32|0];HEAP[r11]=r12;if((r12|0)!=0){_free(HEAP[r11])}r11=HEAP[r14+36|0];HEAP[r10]=r11;if((r11|0)!=0){_free(HEAP[r10])}r10=HEAP[r14+16|0];HEAP[r9]=r10;if((r10|0)!=0){_free(HEAP[r9])}r9=HEAP[r14+20|0];HEAP[r8]=r9;if((r9|0)!=0){_free(HEAP[r8])}r8=HEAP[r14+24|0];HEAP[r7]=r8;if((r8|0)!=0){_free(HEAP[r7])}r7=HEAP[r14+28|0];HEAP[r6]=r7;if((r7|0)!=0){_free(HEAP[r6])}r6=HEAP[r14+44|0];HEAP[r5]=r6;if((r6|0)!=0){_free(HEAP[r5])}r5=HEAP[r14+48|0];HEAP[r4]=r5;if((r5|0)!=0){_free(HEAP[r4])}r4=r14;HEAP[r3]=r4;if((r4|0)!=0){_free(HEAP[r3])}STACKTOP=r2;return}function _trivial_deductions(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r2=0;r3=r1;r1=HEAP[r3|0];r4=HEAP[r1|0];r5=4;r6=0;L1214:do{if((r6|0)<(HEAP[r4|0]|0)){L1215:while(1){r7=HEAP[r4+4|0]+(r6*24&-1)|0;L1217:do{if(HEAP[HEAP[r3+36|0]+r6|0]<<24>>24==0){r8=HEAP[HEAP[r3+24|0]+r6|0]<<24>>24;r9=HEAP[HEAP[r3+28|0]+r6|0]<<24>>24;r10=r6;if((r9+r8|0)==(HEAP[r7|0]|0)){HEAP[HEAP[r3+36|0]+r10|0]=1;break}if((HEAP[HEAP[r1+4|0]+r10|0]<<24>>24|0)<0){break}if((HEAP[HEAP[r1+4|0]+r6|0]<<24>>24|0)<(r8|0)){r2=872;break L1215}if((HEAP[HEAP[r1+4|0]+r6|0]<<24>>24|0)==(r8|0)){if((_face_setall(r3,r6,2)|0)!=0){r5=(r5|0)<0?r5:0}HEAP[HEAP[r3+36|0]+r6|0]=1;break}if((HEAP[r7|0]-(HEAP[HEAP[r1+4|0]+r6|0]<<24>>24)|0)<(r9|0)){r2=878;break L1215}if((HEAP[r7|0]-(HEAP[HEAP[r1+4|0]+r6|0]<<24>>24)|0)==(r9|0)){if((_face_setall(r3,r6,0)|0)!=0){r5=(r5|0)<0?r5:0}HEAP[HEAP[r3+36|0]+r6|0]=1;break}if((HEAP[r7|0]-(HEAP[HEAP[r1+4|0]+r6|0]<<24>>24)|0)!=(r9+1|0)){break}if((-r8+HEAP[r7|0]+ -r9|0)<=2){break}r9=0;if((r9|0)>=(HEAP[r7|0]|0)){break}L1239:while(1){r11=(HEAP[(r9<<2)+HEAP[r7+4|0]|0]-HEAP[r4+12|0]|0)/16&-1;if((r9+1|0)<(HEAP[r7|0]|0)){r12=r9+1|0}else{r12=0}r13=(HEAP[(r12<<2)+HEAP[r7+4|0]|0]-HEAP[r4+12|0]|0)/16&-1;do{if((HEAP[(r11<<4)+HEAP[r4+12|0]|0]|0)==(HEAP[(r13<<4)+HEAP[r4+12|0]|0]|0)){r2=890}else{if((HEAP[(r11<<4)+HEAP[r4+12|0]|0]|0)==(HEAP[(r13<<4)+HEAP[r4+12|0]+4|0]|0)){r2=890;break}do{if((HEAP[(r11<<4)+HEAP[r4+12|0]+4|0]|0)!=(HEAP[(r13<<4)+HEAP[r4+12|0]|0]|0)){if((HEAP[(r11<<4)+HEAP[r4+12|0]+4|0]|0)==(HEAP[(r13<<4)+HEAP[r4+12|0]+4|0]|0)){break}___assert_func(34104,2035,37384,35900)}}while(0);r14=(HEAP[(r11<<4)+HEAP[r4+12|0]+4|0]-HEAP[r4+20|0]|0)/20&-1;break}}while(0);if(r2==890){r2=0;r14=(HEAP[(r11<<4)+HEAP[r4+12|0]|0]-HEAP[r4+20|0]|0)/20&-1}L1254:do{if((HEAP[HEAP[r1+8|0]+r11|0]<<24>>24|0)==1){if((HEAP[HEAP[r1+8|0]+r13|0]<<24>>24|0)!=1){break}r8=0;if((r8|0)>=(HEAP[HEAP[r4+20|0]+(r14*20&-1)|0]|0)){break}while(1){if((HEAP[HEAP[r1+8|0]+((HEAP[(r8<<2)+HEAP[HEAP[r4+20|0]+(r14*20&-1)+4|0]|0]-HEAP[r4+12|0]|0)/16&-1)|0]<<24>>24|0)==0){break L1239}r8=r8+1|0;if((r8|0)>=(HEAP[HEAP[r4+20|0]+(r14*20&-1)|0]|0)){break L1254}}}}while(0);r9=r9+1|0;if((r9|0)>=(HEAP[r7|0]|0)){break L1217}}r9=0;if((r9|0)>=(HEAP[r7|0]|0)){break}while(1){r8=(HEAP[(r9<<2)+HEAP[r7+4|0]|0]-HEAP[r4+12|0]|0)/16&-1;do{if((HEAP[HEAP[r1+8|0]+r8|0]<<24>>24|0)==1){if((r8|0)==(r11|0)){break}if((r8|0)==(r13|0)){break}if((_solver_set_line(r3,r8,0)|0)==0){___assert_func(34104,2059,37384,35872)}r5=(r5|0)<0?r5:0}}while(0);r9=r9+1|0;if((r9|0)>=(HEAP[r7|0]|0)){break L1217}}}}while(0);r6=r6+1|0;if((r6|0)>=(HEAP[r4|0]|0)){break L1214}}if(r2==878){HEAP[r3+4|0]=1;r15=0;r16=r15;return r16}else if(r2==872){HEAP[r3+4|0]=1;r15=0;r16=r15;return r16}}}while(0);r6=0;L1279:do{if((r6|0)<(HEAP[r4+16|0]|0)){L1280:while(1){do{if(HEAP[HEAP[r3+32|0]+r6|0]<<24>>24==0){r13=HEAP[HEAP[r3+16|0]+r6|0]<<24>>24;r11=-r13+HEAP[HEAP[r4+20|0]+(r6*20&-1)|0]+ -(HEAP[HEAP[r3+20|0]+r6|0]<<24>>24)|0;if((r13|0)==0){if((r11|0)==0){HEAP[HEAP[r3+32|0]+r6|0]=1;break}if((r11|0)!=1){break}_dot_setall(r3,r6,2);r5=(r5|0)<0?r5:0;HEAP[HEAP[r3+32|0]+r6|0]=1;break}if((r13|0)==1){if((r11|0)==0){r2=919;break L1280}if((r11|0)!=1){break}_dot_setall(r3,r6,0);r5=(r5|0)<0?r5:0;break}if((r13|0)!=2){r2=926;break L1280}if((r11|0)>0){_dot_setall(r3,r6,2);r5=(r5|0)<0?r5:0}HEAP[HEAP[r3+32|0]+r6|0]=1}}while(0);r6=r6+1|0;if((r6|0)>=(HEAP[r4+16|0]|0)){break L1279}}if(r2==919){HEAP[r3+4|0]=1;r15=0;r16=r15;return r16}else if(r2==926){HEAP[r3+4|0]=1;r15=0;r16=r15;return r16}}}while(0);r15=r5;r16=r15;return r16}function _dline_deductions(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+1428|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r3+100;r30=r3+104;r31=r3+108;r32=r3+112;r33=r3+116;r34=r3+120;r35=r3+124;r36=r3+128;r37=r3+132;r38=r3+136;r39=r3+140;r40=r3+144;r41=r3+148;r42=r3+152;r43=r3+156;r44=r3+160;r45=r3+164;r46=r3+168;r47=r3+172;r48=r3+176;r49=r3+180;r50=r3+184;r51=r3+188;r52=r3+192;r53=r3+196;r54=r3+200;r55=r3+204;r56=r3+208;r57=r3+212;r58=r3+216;r59=r3+220;r60=r3+224;r61=r3+228;r62=r3+232;r63=r3+236;r64=r3+240;r65=r3+244;r66=r3+248;r67=r3+252;r68=r3+256;r69=r3+260;r70=r3+264;r71=r3+268;r72=r3+272;r73=r3+276;r74=r3+852;r75=r1;r1=HEAP[r75|0];r76=HEAP[r1|0];r77=HEAP[r75+44|0];r78=4;r79=0;L1309:do{if((r79|0)<(HEAP[r76|0]|0)){L1311:while(1){r80=HEAP[r76+4|0]+(r79*24&-1)|0;r81=HEAP[r80|0];r82=HEAP[HEAP[r1+4|0]+r79|0]<<24>>24;if(!((r81|0)<=12)){___assert_func(34104,2171,38076,36012)}L1316:do{if(HEAP[HEAP[r75+36|0]+r79|0]<<24>>24==0){if((r82|0)<0){break}r83=0;L1319:do{if((r83|0)<(r81|0)){while(1){r84=(HEAP[(r83<<2)+HEAP[r80+4|0]|0]-HEAP[r76+12|0]|0)/16&-1;r85=HEAP[HEAP[r1+8|0]+r84|0]<<24>>24;r86=r83+1|0;if((r86|0)>=(r81|0)){r86=0}HEAP[(r86<<2)+r73+(r83*48&-1)|0]=(r85|0)==2?0:1;HEAP[(r86<<2)+r74+(r83*48&-1)|0]=(r85|0)==0?1:0;HEAP[r67]=r76;HEAP[r68]=r80;HEAP[r69]=r86;HEAP[r70]=HEAP[(HEAP[r69]<<2)+HEAP[HEAP[r68]+4|0]|0];HEAP[r71]=HEAP[(HEAP[r69]<<2)+HEAP[HEAP[r68]+8|0]|0];HEAP[r72]=(((HEAP[r70]-HEAP[HEAP[r67]+12|0]|0)/16&-1)<<1)+((HEAP[HEAP[r70]|0]|0)==(HEAP[r71]|0)?1:0)|0;r87=HEAP[r72];r84=(HEAP[(r86<<2)+HEAP[r80+4|0]|0]-HEAP[r76+12|0]|0)/16&-1;r88=HEAP[HEAP[r1+8|0]+r84|0]<<24>>24;r86=r86+1|0;if((r86|0)>=(r81|0)){r86=0}r84=2;if((r85|0)==2){r84=r84-1|0}r89=r84;if((r88|0)==2){r90=r89-1|0;r84=r90;r91=r90}else{r91=r89}do{if((r91|0)==2){HEAP[r48]=r77;HEAP[r49]=r87;if((HEAP[HEAP[r48]+HEAP[r49]|0]<<24>>24&2|0)==0){break}r84=1}}while(0);HEAP[(r86<<2)+r73+(r83*48&-1)|0]=r84;r84=0;if((r85|0)==0){r84=r84+1|0}r89=r84;if((r88|0)==0){r90=r89+1|0;r84=r90;r92=r90}else{r92=r89}do{if((r92|0)==0){HEAP[r31]=r77;HEAP[r32]=r87;if((HEAP[HEAP[r31]+HEAP[r32]|0]<<24>>24&1|0)==0){break}r84=1}}while(0);HEAP[(r86<<2)+r74+(r83*48&-1)|0]=r84;r83=r83+1|0;if((r83|0)>=(r81|0)){break L1319}}}}while(0);r87=3;r83=0;L1349:do{if((r87|0)<(r81|0)){while(1){L1352:do{if((r83|0)<(r81|0)){while(1){r88=r87+r83|0;r85=r83+1|0;r89=r83+2|0;if((r88|0)>=(r81|0)){r88=r88-r81|0}if((r85|0)>=(r81|0)){r85=r85-r81|0}if((r89|0)>=(r81|0)){r89=r89-r81|0}HEAP[(r88<<2)+r73+(r83*48&-1)|0]=HEAP[(r88<<2)+r73+(r85*48&-1)|0]+HEAP[(r85<<2)+r73+(r83*48&-1)|0]|0;HEAP[(r88<<2)+r74+(r83*48&-1)|0]=HEAP[(r88<<2)+r74+(r85*48&-1)|0]+HEAP[(r85<<2)+r74+(r83*48&-1)|0]|0;r85=HEAP[(r88<<2)+r73+(r89*48&-1)|0]+HEAP[(r89<<2)+r73+(r83*48&-1)|0]|0;if((HEAP[(r88<<2)+r73+(r83*48&-1)|0]|0)<(r85|0)){r93=HEAP[(r88<<2)+r73+(r83*48&-1)|0]}else{r93=r85}HEAP[(r88<<2)+r73+(r83*48&-1)|0]=r93;r85=HEAP[(r88<<2)+r74+(r89*48&-1)|0]+HEAP[(r89<<2)+r74+(r83*48&-1)|0]|0;if((HEAP[(r88<<2)+r74+(r83*48&-1)|0]|0)>(r85|0)){r94=HEAP[(r88<<2)+r74+(r83*48&-1)|0]}else{r94=r85}HEAP[(r88<<2)+r74+(r83*48&-1)|0]=r94;r83=r83+1|0;if((r83|0)>=(r81|0)){break L1352}}}}while(0);r87=r87+1|0;r83=0;if((r87|0)>=(r81|0)){break L1349}}}}while(0);if((r83|0)>=(r81|0)){break}while(1){r87=HEAP[(r83<<2)+HEAP[r80+4|0]|0];r84=(r87-HEAP[r76+12|0]|0)/16&-1;do{if((HEAP[HEAP[r1+8|0]+r84|0]<<24>>24|0)==1){r86=r83+1|0;if((r86|0)>=(r81|0)){r86=0}if((HEAP[(r83<<2)+r74+(r86*48&-1)|0]|0)>(r82|0)){r2=982;break L1311}if((HEAP[(r83<<2)+r74+(r86*48&-1)|0]|0)==(r82|0)){_solver_set_line(r75,r84,2);r78=(r78|0)<0?r78:0}if((HEAP[(r83<<2)+r73+(r86*48&-1)|0]|0)<(r82-1|0)){r2=986;break L1311}if((HEAP[(r83<<2)+r73+(r86*48&-1)|0]|0)==(r82-1|0)){_solver_set_line(r75,r84,0);r78=(r78|0)<0?r78:0}if(!((HEAP[r75+12|0]|0)>=2)){break}r87=HEAP[(r86<<2)+HEAP[r80+4|0]|0];if((HEAP[HEAP[r1+8|0]+((r87-HEAP[r76+12|0]|0)/16&-1)|0]<<24>>24|0)!=1){break}HEAP[r25]=r76;HEAP[r26]=r80;HEAP[r27]=r86;HEAP[r28]=HEAP[(HEAP[r27]<<2)+HEAP[HEAP[r26]+4|0]|0];HEAP[r29]=HEAP[(HEAP[r27]<<2)+HEAP[HEAP[r26]+8|0]|0];HEAP[r30]=(((HEAP[r28]-HEAP[HEAP[r25]+12|0]|0)/16&-1)<<1)+((HEAP[HEAP[r28]|0]|0)==(HEAP[r29]|0)?1:0)|0;r88=HEAP[r30];r86=r86+1|0;if((r86|0)>=(r81|0)){r86=0}do{if((HEAP[(r83<<2)+r74+(r86*48&-1)|0]|0)>(r82-2|0)){HEAP[r21]=r77;HEAP[r22]=r88;if((HEAP[HEAP[r21]+HEAP[r22]|0]<<24>>24&2|0)!=0){break}r85=HEAP[r21]+HEAP[r22]|0;HEAP[r85]=(HEAP[r85]<<24>>24|2)&255;r78=(r78|0)<1?r78:1}}while(0);if((HEAP[(r83<<2)+r73+(r86*48&-1)|0]|0)>=(r82|0)){break}HEAP[r19]=r77;HEAP[r20]=r88;if((HEAP[HEAP[r19]+HEAP[r20]|0]<<24>>24&1|0)!=0){break}r85=HEAP[r19]+HEAP[r20]|0;HEAP[r85]=(HEAP[r85]<<24>>24|1)&255;r78=(r78|0)<1?r78:1}}while(0);r83=r83+1|0;if((r83|0)>=(r81|0)){break L1316}}}}while(0);r79=r79+1|0;if((r79|0)>=(HEAP[r76|0]|0)){break L1309}}if(r2==986){HEAP[r75+4|0]=1;r95=0;r96=r95;STACKTOP=r3;return r96}else if(r2==982){HEAP[r75+4|0]=1;r95=0;r96=r95;STACKTOP=r3;return r96}}}while(0);if((r78|0)<1){r95=r78;r96=r95;STACKTOP=r3;return r96}r79=0;L1412:do{if((r79|0)<(HEAP[r76+16|0]|0)){while(1){r20=HEAP[r76+20|0]+(r79*20&-1)|0;r19=HEAP[r20|0];L1416:do{if(HEAP[HEAP[r75+32|0]+r79|0]<<24>>24==0){r73=HEAP[HEAP[r75+16|0]+r79|0]<<24>>24;r22=-r73+r19+ -(HEAP[HEAP[r75+20|0]+r79|0]<<24>>24)|0;r21=0;if((r21|0)>=(r19|0)){break}while(1){r74=r21+1|0;if((r74|0)>=(r19|0)){r74=0}HEAP[r12]=r76;HEAP[r13]=r20;HEAP[r14]=r21;HEAP[r15]=HEAP[(HEAP[r14]<<2)+HEAP[HEAP[r13]+4|0]|0];HEAP[r16]=(((HEAP[r15]-HEAP[HEAP[r12]+12|0]|0)/16&-1)<<1)+((HEAP[HEAP[r15]|0]|0)==(HEAP[r13]|0)?1:0)|0;r30=HEAP[r16];r29=(HEAP[(r21<<2)+HEAP[r20+4|0]|0]-HEAP[r76+12|0]|0)/16&-1;r28=(HEAP[(r74<<2)+HEAP[r20+4|0]|0]-HEAP[r76+12|0]|0)/16&-1;r25=HEAP[HEAP[r1+8|0]+r29|0]<<24>>24;r26=HEAP[HEAP[r1+8|0]+r28|0]<<24>>24;do{if((r25|0)==2){r2=1011}else{if((r26|0)==2){r2=1011;break}else{break}}}while(0);do{if(r2==1011){r2=0;HEAP[r10]=r77;HEAP[r11]=r30;if((HEAP[HEAP[r10]+HEAP[r11]|0]<<24>>24&2|0)!=0){break}r27=HEAP[r10]+HEAP[r11]|0;HEAP[r27]=(HEAP[r27]<<24>>24|2)&255;r78=(r78|0)<1?r78:1}}while(0);do{if((r25|0)==0){r2=1015}else{if((r26|0)==0){r2=1015;break}else{break}}}while(0);do{if(r2==1015){r2=0;HEAP[r6]=r77;HEAP[r7]=r30;if((HEAP[HEAP[r6]+HEAP[r7]|0]<<24>>24&1|0)!=0){break}r27=HEAP[r6]+HEAP[r7]|0;HEAP[r27]=(HEAP[r27]<<24>>24|1)&255;r78=(r78|0)<1?r78:1}}while(0);HEAP[r4]=r77;HEAP[r5]=r30;do{if((HEAP[HEAP[r4]+HEAP[r5]|0]<<24>>24&2|0)!=0){do{if((r25|0)==0){r27=r26;if((r27|0)!=1){r97=r27;break}_solver_set_line(r75,r28,2);r78=(r78|0)<0?r78:0;r2=1021;break}else{r2=1021}}while(0);if(r2==1021){r2=0;r97=r26}if((r97|0)!=0){break}if((r25|0)!=1){break}_solver_set_line(r75,r29,2);r78=(r78|0)<0?r78:0}}while(0);HEAP[r8]=r77;HEAP[r9]=r30;do{if((HEAP[HEAP[r8]+HEAP[r9]|0]<<24>>24&1|0)!=0){do{if((r25|0)==2){r88=r26;if((r88|0)!=1){r98=r88;break}_solver_set_line(r75,r28,0);r78=(r78|0)<0?r78:0;r2=1029;break}else{r2=1029}}while(0);if(r2==1029){r2=0;r98=r26}if((r98|0)!=2){r2=1033;break}if((r25|0)!=1){break}_solver_set_line(r75,r29,0);r78=(r78|0)<0?r78:0;r2=1033;break}else{r2=1033}}while(0);L1456:do{if(r2==1033){r2=0;if((r25|0)!=1){break}if((r26|0)!=1){break}r88=r73;if((r88|0)==0){do{if((r22|0)==2){HEAP[r17]=r77;HEAP[r18]=r30;if((HEAP[HEAP[r17]+HEAP[r18]|0]<<24>>24&2|0)!=0){_solver_set_line(r75,r29,2);_solver_set_line(r75,r28,2);r78=(r78|0)<0?r78:0}HEAP[r23]=r77;HEAP[r24]=r30;if((HEAP[HEAP[r23]+HEAP[r24]|0]<<24>>24&1|0)==0){break}_solver_set_line(r75,r29,0);_solver_set_line(r75,r28,0);r78=(r78|0)<0?r78:0}}while(0);r99=r73}else{r99=r88}do{if((r99|0)==1){HEAP[r33]=r77;HEAP[r34]=r30;if((HEAP[HEAP[r33]+HEAP[r34]|0]<<24>>24&2|0)==0){r86=HEAP[r33]+HEAP[r34]|0;HEAP[r86]=(HEAP[r86]<<24>>24|2)&255;r78=(r78|0)<1?r78:1}if((r22|0)!=2){break}HEAP[r35]=r77;HEAP[r36]=r30;if((HEAP[HEAP[r35]+HEAP[r36]|0]<<24>>24&1|0)!=0){break}r86=HEAP[r35]+HEAP[r36]|0;HEAP[r86]=(HEAP[r86]<<24>>24|1)&255;r78=(r78|0)<1?r78:1}}while(0);if(!((HEAP[r75+12|0]|0)>=2)){break}HEAP[r37]=r77;HEAP[r38]=r30;if((HEAP[HEAP[r37]+HEAP[r38]|0]<<24>>24&1|0)==0){break}r88=0;L1480:do{if((r88|0)<(r19|0)){while(1){do{if((r88|0)!=(r21|0)){if((r88|0)==(r21+1|0)){break}if((r88|0)==(r21-1|0)){break}if((r21|0)==0){if((r88|0)==(r19-1|0)){break}}if((r21|0)==(r19-1|0)){if((r88|0)==0){break}}HEAP[r39]=r76;HEAP[r40]=r20;HEAP[r41]=r88;HEAP[r42]=HEAP[(HEAP[r41]<<2)+HEAP[HEAP[r40]+4|0]|0];HEAP[r43]=(((HEAP[r42]-HEAP[HEAP[r39]+12|0]|0)/16&-1)<<1)+((HEAP[HEAP[r42]|0]|0)==(HEAP[r40]|0)?1:0)|0;r86=HEAP[r43];HEAP[r44]=r77;HEAP[r45]=r86;if((HEAP[HEAP[r44]+HEAP[r45]|0]<<24>>24&2|0)!=0){break}r86=HEAP[r44]+HEAP[r45]|0;HEAP[r86]=(HEAP[r86]<<24>>24|2)&255;r78=(r78|0)<1?r78:1}}while(0);r88=r88+1|0;if((r88|0)>=(r19|0)){break L1480}}}}while(0);if((r73|0)!=0){break}HEAP[r46]=r77;HEAP[r47]=r30;if((HEAP[HEAP[r46]+HEAP[r47]|0]<<24>>24&2|0)==0){break}if((r22|0)==3){r88=0;if((r88|0)>=(r19|0)){break}while(1){do{if((r88|0)!=(r21|0)){if((r88|0)==(r74|0)){break}r86=(HEAP[(r88<<2)+HEAP[r20+4|0]|0]-HEAP[r76+12|0]|0)/16&-1;if((HEAP[HEAP[r1+8|0]+r86|0]<<24>>24|0)!=1){break}_solver_set_line(r75,r86,0);r78=(r78|0)<0?r78:0}}while(0);r88=r88+1|0;if((r88|0)>=(r19|0)){break L1456}}}if((r22|0)!=4){break}HEAP[r58]=r75;HEAP[r59]=r20;HEAP[r60]=r21;HEAP[r61]=HEAP[HEAP[r58]|0];HEAP[r62]=HEAP[HEAP[r61]|0];HEAP[r63]=HEAP[HEAP[r59]|0];HEAP[r64]=0;L1509:do{if((HEAP[r64]|0)<(HEAP[r63]|0)){L1510:while(1){do{if((HEAP[r64]|0)!=(HEAP[r60]|0)){if((HEAP[r64]|0)==(HEAP[r60]+1|0)){break}if((HEAP[r64]|0)==(HEAP[r60]-1|0)){break}if((HEAP[r64]|0)==0){if((HEAP[r60]|0)==(HEAP[r63]-1|0)){break}}if((HEAP[r64]|0)==(HEAP[r63]-1|0)){if((HEAP[r60]|0)==0){break}}HEAP[r65]=HEAP[r64]+1|0;if((HEAP[r65]|0)==(HEAP[r63]|0)){HEAP[r65]=0}if((HEAP[HEAP[HEAP[r61]+8|0]+((HEAP[(HEAP[r64]<<2)+HEAP[HEAP[r59]+4|0]|0]-HEAP[HEAP[r62]+12|0]|0)/16&-1)|0]<<24>>24|0)!=1){break}if((HEAP[HEAP[HEAP[r61]+8|0]+((HEAP[(HEAP[r65]<<2)+HEAP[HEAP[r59]+4|0]|0]-HEAP[HEAP[r62]+12|0]|0)/16&-1)|0]<<24>>24|0)==1){break L1510}}}while(0);HEAP[r64]=HEAP[r64]+1|0;if((HEAP[r64]|0)>=(HEAP[r63]|0)){r2=1087;break L1509}}r88=HEAP[r59];r86=HEAP[r64];HEAP[r52]=HEAP[r62];HEAP[r53]=r88;HEAP[r54]=r86;HEAP[r55]=HEAP[(HEAP[r54]<<2)+HEAP[HEAP[r53]+4|0]|0];HEAP[r56]=(((HEAP[r55]-HEAP[HEAP[r52]+12|0]|0)/16&-1)<<1)+((HEAP[HEAP[r55]|0]|0)==(HEAP[r53]|0)?1:0)|0;HEAP[r66]=HEAP[r56];r86=HEAP[r66];HEAP[r50]=HEAP[HEAP[r58]+44|0];HEAP[r51]=r86;if((HEAP[HEAP[r50]+HEAP[r51]|0]<<24>>24&1|0)!=0){r100=0}else{r86=HEAP[r50]+HEAP[r51]|0;HEAP[r86]=(HEAP[r86]<<24>>24|1)&255;r100=1}HEAP[r57]=r100;r101=r100;break}else{r2=1087}}while(0);if(r2==1087){r2=0;HEAP[r57]=0;r101=0}if((r101|0)==0){break}r78=(r78|0)<1?r78:1}}while(0);r21=r21+1|0;if((r21|0)>=(r19|0)){break L1416}}}}while(0);r79=r79+1|0;if((r79|0)>=(HEAP[r76+16|0]|0)){break L1412}}}}while(0);r95=r78;r96=r95;STACKTOP=r3;return r96}function _linedsf_deductions(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36;r2=STACKTOP;STACKTOP=STACKTOP+64|0;r3=r2;r4=r2+4;r5=r2+8;r6=r2+12;r7=r2+16;r8=r2+20;r9=r2+24;r10=r2+28;r11=r2+32;r12=r2+36;r13=r2+40;r14=r2+44;r15=r2+48;r16=r2+52;r17=r2+56;r18=r2+60;r19=r1;r1=HEAP[r19|0];r20=HEAP[r1|0];r21=HEAP[r19+44|0];r22=4;r23=0;L1540:do{if((r23|0)<(HEAP[r20|0]|0)){while(1){do{if(HEAP[HEAP[r19+36|0]+r23|0]<<24>>24==0){r24=HEAP[HEAP[r1+4|0]+r23|0]<<24>>24;if((r24|0)<0){break}r25=HEAP[HEAP[r20+4|0]+(r23*24&-1)|0];r26=HEAP[HEAP[r19+24|0]+r23|0]<<24>>24;do{if((r26+1|0)==(r24|0)){if((_face_setall_identical(r19,r23,2)|0)==0){break}r22=(r22|0)<0?r22:0}}while(0);r27=HEAP[HEAP[r19+28|0]+r23|0]<<24>>24;do{if((r27+1|0)==(r25-r24|0)){if((_face_setall_identical(r19,r23,0)|0)==0){break}r22=(r22|0)<0?r22:0}}while(0);r26=HEAP[HEAP[r19+24|0]+r23|0]<<24>>24;r28=_parity_deductions(r19,HEAP[HEAP[r20+4|0]+(r23*24&-1)+4|0],(r24-r26|0)%2,-r27+r25+ -r26|0);r22=(r22|0)<(r28|0)?r22:r28}}while(0);r23=r23+1|0;if((r23|0)>=(HEAP[r20|0]|0)){break L1540}}}}while(0);r23=0;L1556:do{if((r23|0)<(HEAP[r20+16|0]|0)){while(1){r29=HEAP[r20+20|0]+(r23*20&-1)|0;r30=HEAP[r29|0];r31=0;L1560:do{if((r31|0)<(r30|0)){while(1){HEAP[r11]=r20;HEAP[r12]=r29;HEAP[r13]=r31;HEAP[r14]=HEAP[(HEAP[r13]<<2)+HEAP[HEAP[r12]+4|0]|0];HEAP[r15]=(((HEAP[r14]-HEAP[HEAP[r11]+12|0]|0)/16&-1)<<1)+((HEAP[HEAP[r14]|0]|0)==(HEAP[r12]|0)?1:0)|0;r32=HEAP[r15];r33=(HEAP[(r31<<2)+HEAP[r29+4|0]|0]-HEAP[r20+12|0]|0)/16&-1;L1563:do{if((HEAP[HEAP[r1+8|0]+r33|0]<<24>>24|0)==1){r34=r31+1|0;if((r34|0)==(r30|0)){r34=0}r35=(HEAP[(r34<<2)+HEAP[r29+4|0]|0]-HEAP[r20+12|0]|0)/16&-1;if((HEAP[HEAP[r1+8|0]+r35|0]<<24>>24|0)!=1){break}do{if((_edsf_canonify(HEAP[r19+48|0],r33,r16)|0)==(_edsf_canonify(HEAP[r19+48|0],r35,r17)|0)){if((HEAP[r16]|0)==(HEAP[r17]|0)){break}HEAP[r9]=r21;HEAP[r10]=r32;if((HEAP[HEAP[r9]+HEAP[r10]|0]<<24>>24&2|0)==0){r34=HEAP[r9]+HEAP[r10]|0;HEAP[r34]=(HEAP[r34]<<24>>24|2)&255;r22=(r22|0)<1?r22:1}HEAP[r7]=r21;HEAP[r8]=r32;if((HEAP[HEAP[r7]+HEAP[r8]|0]<<24>>24&1|0)!=0){break L1563}r34=HEAP[r7]+HEAP[r8]|0;HEAP[r34]=(HEAP[r34]<<24>>24|1)&255;r22=(r22|0)<1?r22:1;break L1563}}while(0);HEAP[r5]=r21;HEAP[r6]=r32;if((HEAP[HEAP[r5]+HEAP[r6]|0]<<24>>24&2|0)==0){break}HEAP[r3]=r21;HEAP[r4]=r32;if((HEAP[HEAP[r3]+HEAP[r4]|0]<<24>>24&1|0)==0){break}if((_merge_lines(r19,r33,r35,1)|0)==0){break}r22=(r22|0)<3?r22:3}}while(0);r31=r31+1|0;if((r31|0)>=(r30|0)){break L1560}}}}while(0);r31=HEAP[HEAP[r19+16|0]+r23|0]<<24>>24;r28=_parity_deductions(r19,HEAP[r29+4|0],(r31|0)%2,-r31+r30+ -(HEAP[HEAP[r19+20|0]+r23|0]<<24>>24)|0);r22=(r22|0)<(r28|0)?r22:r28;r23=r23+1|0;if((r23|0)>=(HEAP[r20+16|0]|0)){break L1556}}}}while(0);r23=0;if((r23|0)>=(HEAP[r20+8|0]|0)){r36=r22;STACKTOP=r2;return r36}while(1){r28=_edsf_canonify(HEAP[r19+48|0],r23,r18);do{if((r28|0)!=(r23|0)){r4=HEAP[HEAP[HEAP[r19|0]+8|0]+r28|0]<<24>>24;if((r4|0)!=1){r3=r4;if((_solver_set_line(r19,r23,(HEAP[r18]|0)!=0?2-r3|0:r3)|0)==0){break}r22=(r22|0)<0?r22:0;break}r4=HEAP[HEAP[HEAP[r19|0]+8|0]+r23|0]<<24>>24;if((r4|0)==1){break}r3=r4;if((_solver_set_line(r19,r28,(HEAP[r18]|0)!=0?2-r3|0:r3)|0)==0){break}r22=(r22|0)<0?r22:0}}while(0);r23=r23+1|0;if((r23|0)>=(HEAP[r20+8|0]|0)){break}}r36=r22;STACKTOP=r2;return r36}function _loop_deductions(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+92|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r1;r1=0;r28=0;r29=0;r30=0;r31=HEAP[r27|0];r32=HEAP[r31|0];r33=HEAP[r32+16|0];r34=0;r35=0;r36=0;L1598:do{if((r36|0)<(HEAP[r32+8|0]|0)){while(1){if((HEAP[HEAP[r31+8|0]+r36|0]<<24>>24|0)==0){HEAP[r20]=r27;HEAP[r21]=r36;HEAP[r25]=HEAP[HEAP[HEAP[r20]|0]|0];HEAP[r26]=(HEAP[r21]<<4)+HEAP[HEAP[r25]+12|0]|0;HEAP[r22]=(HEAP[HEAP[r26]|0]-HEAP[HEAP[r25]+20|0]|0)/20&-1;HEAP[r23]=(HEAP[HEAP[r26]+4|0]-HEAP[HEAP[r25]+20|0]|0)/20&-1;r37=HEAP[r22];HEAP[r17]=HEAP[HEAP[r20]+40|0];HEAP[r18]=r37;r37=_edsf_canonify(HEAP[r17],HEAP[r18],0);HEAP[r22]=r37;r37=HEAP[r23];HEAP[r15]=HEAP[HEAP[r20]+40|0];HEAP[r16]=r37;r37=_edsf_canonify(HEAP[r15],HEAP[r16],0);HEAP[r23]=r37;if((HEAP[r22]|0)==(HEAP[r23]|0)){HEAP[r19]=1}else{HEAP[r24]=HEAP[(HEAP[r23]<<2)+HEAP[HEAP[r20]+8|0]|0]+HEAP[(HEAP[r22]<<2)+HEAP[HEAP[r20]+8|0]|0]|0;r37=HEAP[r22];r38=HEAP[r23];HEAP[r12]=HEAP[HEAP[r20]+40|0];HEAP[r13]=r37;HEAP[r14]=r38;_edsf_merge(HEAP[r12],HEAP[r13],HEAP[r14],0);r38=HEAP[r22];HEAP[r10]=HEAP[HEAP[r20]+40|0];HEAP[r11]=r38;r38=_edsf_canonify(HEAP[r10],HEAP[r11],0);HEAP[r22]=r38;HEAP[(HEAP[r22]<<2)+HEAP[HEAP[r20]+8|0]|0]=HEAP[r24];HEAP[r19]=0}r34=r34|HEAP[r19];r1=r1+1|0}r36=r36+1|0;if((r36|0)>=(HEAP[r32+8|0]|0)){break L1598}}}}while(0);r36=0;L1610:do{if((r36|0)<(HEAP[r32|0]|0)){while(1){r19=HEAP[HEAP[r31+4|0]+r36|0]<<24>>24;r34=r19;if((r19|0)>=0){r19=HEAP[HEAP[r27+24|0]+r36|0]<<24>>24;do{if((r19|0)==(r34|0)){r29=r29+1|0}else{if((r19|0)!=(r34-1|0)){break}r30=r30+1|0}}while(0);r28=r28+1|0}r36=r36+1|0;if((r36|0)>=(HEAP[r32|0]|0)){break L1610}}}}while(0);r36=0;r34=r27;L1622:do{if((r36|0)<(HEAP[r32+16|0]|0)){r19=r34;while(1){HEAP[r8]=HEAP[r19+40|0];HEAP[r9]=r36;r24=_edsf_canonify(HEAP[r8],HEAP[r9],0);r20=HEAP[(r24<<2)+HEAP[r27+8|0]|0];r24=r20;if((r20|0)>1){r33=(r33|0)<(r24|0)?r33:r24}r36=r36+1|0;r24=r27;if((r36|0)<(HEAP[r32+16|0]|0)){r19=r24}else{r39=r24;break L1622}}}else{r39=r34}}while(0);if((HEAP[r39+4|0]|0)!=3){___assert_func(34104,2615,37624,36404)}do{if((r29|0)==(r28|0)){if((r33|0)!=(r1|0)){break}HEAP[r27+4|0]=0;r35=1;r40=r35;r41=(r40|0)!=0;r42=r41?0:4;STACKTOP=r3;return r42}}while(0);r36=0;if((r36|0)>=(HEAP[r32+8|0]|0)){r40=r35;r41=(r40|0)!=0;r42=r41?0:4;STACKTOP=r3;return r42}L1641:while(1){r33=(r36<<4)+HEAP[r32+12|0]|0;r39=(HEAP[r33+4|0]-HEAP[r32+20|0]|0)/20&-1;do{if((HEAP[HEAP[r31+8|0]+r36|0]<<24>>24|0)==1){r34=(HEAP[r33|0]-HEAP[r32+20|0]|0)/20&-1;HEAP[r6]=HEAP[r27+40|0];HEAP[r7]=r34;r34=_edsf_canonify(HEAP[r6],HEAP[r7],0);HEAP[r4]=HEAP[r27+40|0];HEAP[r5]=r39;if((r34|0)!=(_edsf_canonify(HEAP[r4],HEAP[r5],0)|0)){break}r9=2;do{if((HEAP[(r34<<2)+HEAP[r27+8|0]|0]|0)==(r1+1|0)){r8=0;do{if((HEAP[r33+8|0]|0)!=0){r19=(HEAP[r33+8|0]-HEAP[r32+4|0]|0)/24&-1;r24=HEAP[HEAP[r31+4|0]+r19|0]<<24>>24;if(!((r24|0)>=0)){break}if((HEAP[HEAP[r27+24|0]+r19|0]<<24>>24|0)!=(r24-1|0)){break}r8=r8+1|0}}while(0);do{if((HEAP[r33+12|0]|0)!=0){r24=(HEAP[r33+12|0]-HEAP[r32+4|0]|0)/24&-1;r19=HEAP[HEAP[r31+4|0]+r24|0]<<24>>24;if(!((r19|0)>=0)){break}if((HEAP[HEAP[r27+24|0]+r24|0]<<24>>24|0)!=(r19-1|0)){break}r8=r8+1|0}}while(0);if((r30|0)!=(r8|0)){break}if((r29+r30|0)!=(r28|0)){break}r9=0}}while(0);r34=_solver_set_line(r27,r36,r9);r35=r34;if((r34|0)!=1){___assert_func(34104,2709,37624,36344)}if((r9|0)==0){break L1641}}}while(0);r36=r36+1|0;if((r36|0)>=(HEAP[r32+8|0]|0)){r2=1191;break}}if(r2==1191){r40=r35;r41=(r40|0)!=0;r42=r41?0:4;STACKTOP=r3;return r42}HEAP[r27+4|0]=2;r40=r35;r41=(r40|0)!=0;r42=r41?0:4;STACKTOP=r3;return r42}function _solver_set_line(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=r1;r1=r2;r2=r3;r3=HEAP[r4|0];if((r2|0)==1){___assert_func(34104,1074,37440,36236)}if((HEAP[HEAP[r3+8|0]+r1|0]<<24>>24|0)==(r2|0)){r5=0;r6=r5;return r6}HEAP[HEAP[r3+8|0]+r1|0]=r2&255;r7=HEAP[r3|0];r3=(r1<<4)+HEAP[r7+12|0]|0;r1=(HEAP[r3|0]-HEAP[r7+20|0]|0)/20&-1;r8=r4;do{if((r2|0)==0){r9=HEAP[r8+16|0]+r1|0;HEAP[r9]=HEAP[r9]+1&255;r9=HEAP[r4+16|0]+((HEAP[r3+4|0]-HEAP[r7+20|0]|0)/20&-1)|0;HEAP[r9]=HEAP[r9]+1&255;if((HEAP[r3+8|0]|0)!=0){r9=HEAP[r4+24|0]+((HEAP[r3+8|0]-HEAP[r7+4|0]|0)/24&-1)|0;HEAP[r9]=HEAP[r9]+1&255}if((HEAP[r3+12|0]|0)==0){break}r9=HEAP[r4+24|0]+((HEAP[r3+12|0]-HEAP[r7+4|0]|0)/24&-1)|0;HEAP[r9]=HEAP[r9]+1&255}else{r9=HEAP[r8+20|0]+r1|0;HEAP[r9]=HEAP[r9]+1&255;r9=HEAP[r4+20|0]+((HEAP[r3+4|0]-HEAP[r7+20|0]|0)/20&-1)|0;HEAP[r9]=HEAP[r9]+1&255;if((HEAP[r3+8|0]|0)!=0){r9=HEAP[r4+28|0]+((HEAP[r3+8|0]-HEAP[r7+4|0]|0)/24&-1)|0;HEAP[r9]=HEAP[r9]+1&255}if((HEAP[r3+12|0]|0)==0){break}r9=HEAP[r4+28|0]+((HEAP[r3+12|0]-HEAP[r7+4|0]|0)/24&-1)|0;HEAP[r9]=HEAP[r9]+1&255}}while(0);r5=1;r6=r5;return r6}function _find_unknowns(r1,r2,r3,r4){var r5,r6,r7;r5=r1;r1=r2;r2=r3;r3=r4;r4=0;r6=HEAP[r5|0];if((r4|0)>=(r2|0)){return}while(1){r7=(HEAP[r1]-HEAP[r6+12|0]|0)/16&-1;if((HEAP[HEAP[r5+8|0]+r7|0]<<24>>24|0)==1){HEAP[(r4<<2)+r3|0]=r7;r4=r4+1|0}r1=r1+4|0;if((r4|0)>=(r2|0)){break}}return}function _face_setall_identical(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;r6=r4+4;r7=r1;r1=r3;r3=0;r8=HEAP[r7|0];r9=HEAP[r8|0];r10=HEAP[r9+4|0]+(r2*24&-1)|0;r2=HEAP[r10|0];r11=0;if((r11|0)>=(r2|0)){r12=r3;STACKTOP=r4;return r12}while(1){r13=(HEAP[(r11<<2)+HEAP[r10+4|0]|0]-HEAP[r9+12|0]|0)/16&-1;L1704:do{if((HEAP[HEAP[r8+8|0]+r13|0]<<24>>24|0)==1){r14=r11+1|0;if((r14|0)>=(r2|0)){break}while(1){r15=(HEAP[(r14<<2)+HEAP[r10+4|0]|0]-HEAP[r9+12|0]|0)/16&-1;do{if((HEAP[HEAP[r8+8|0]+r15|0]<<24>>24|0)==1){if((_edsf_canonify(HEAP[r7+48|0],r13,r5)|0)!=(_edsf_canonify(HEAP[r7+48|0],r15,r6)|0)){break}if((HEAP[r5]|0)!=(HEAP[r6]|0)){break}_solver_set_line(r7,r13,r1);_solver_set_line(r7,r15,r1)}}while(0);r14=r14+1|0;if((r14|0)>=(r2|0)){break L1704}}}}while(0);r11=r11+1|0;if((r11|0)>=(r2|0)){break}}r12=r3;STACKTOP=r4;return r12}function _parity_deductions(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r5=STACKTOP;STACKTOP=STACKTOP+92|0;r6=r5;r7=r5+8;r8=r5+20;r9=r5+32;r10=r5+44;r11=r5+60;r12=r5+76;r13=r1;r1=r2;r2=r3;r3=r4;r4=HEAP[r13|0];r14=4;r15=HEAP[r13+48|0];if((r3|0)==2){_find_unknowns(r4,r1,2,r6|0);if((_merge_lines(r13,HEAP[r6|0],HEAP[r6+4|0],r2)|0)==0){r16=r14;STACKTOP=r5;return r16}r14=(r14|0)<3?r14:3;r16=r14;STACKTOP=r5;return r16}if((r3|0)==3){_find_unknowns(r4,r1,3,r7|0);r6=_edsf_canonify(r15,HEAP[r7|0],r9|0);HEAP[r8|0]=r6;r6=_edsf_canonify(r15,HEAP[r7+4|0],r9+4|0);HEAP[r8+4|0]=r6;r6=_edsf_canonify(r15,HEAP[r7+8|0],r9+8|0);HEAP[r8+8|0]=r6;do{if((HEAP[r8|0]|0)==(HEAP[r8+4|0]|0)){if((_solver_set_line(r13,HEAP[r7+8|0],(HEAP[r9|0]^r2^HEAP[r9+4|0]|0)!=0?0:2)|0)==0){break}r14=(r14|0)<0?r14:0}}while(0);do{if((HEAP[r8|0]|0)==(HEAP[r8+8|0]|0)){if((_solver_set_line(r13,HEAP[r7+4|0],(HEAP[r9|0]^r2^HEAP[r9+8|0]|0)!=0?0:2)|0)==0){break}r14=(r14|0)<0?r14:0}}while(0);if((HEAP[r8+4|0]|0)!=(HEAP[r8+8|0]|0)){r16=r14;STACKTOP=r5;return r16}if((_solver_set_line(r13,HEAP[r7|0],(HEAP[r9+4|0]^r2^HEAP[r9+8|0]|0)!=0?0:2)|0)==0){r16=r14;STACKTOP=r5;return r16}r14=(r14|0)<0?r14:0;r16=r14;STACKTOP=r5;return r16}if((r3|0)!=4){r16=r14;STACKTOP=r5;return r16}_find_unknowns(r4,r1,4,r10|0);r1=_edsf_canonify(r15,HEAP[r10|0],r12|0);HEAP[r11|0]=r1;r1=_edsf_canonify(r15,HEAP[r10+4|0],r12+4|0);HEAP[r11+4|0]=r1;r1=_edsf_canonify(r15,HEAP[r10+8|0],r12+8|0);HEAP[r11+8|0]=r1;r1=_edsf_canonify(r15,HEAP[r10+12|0],r12+12|0);HEAP[r11+12|0]=r1;if((HEAP[r11|0]|0)==(HEAP[r11+4|0]|0)){if((_merge_lines(r13,HEAP[r10+8|0],HEAP[r10+12|0],HEAP[r12|0]^r2^HEAP[r12+4|0])|0)==0){r16=r14;STACKTOP=r5;return r16}r14=(r14|0)<3?r14:3;r16=r14;STACKTOP=r5;return r16}if((HEAP[r11|0]|0)==(HEAP[r11+8|0]|0)){if((_merge_lines(r13,HEAP[r10+4|0],HEAP[r10+12|0],HEAP[r12|0]^r2^HEAP[r12+8|0])|0)==0){r16=r14;STACKTOP=r5;return r16}r14=(r14|0)<3?r14:3;r16=r14;STACKTOP=r5;return r16}if((HEAP[r11|0]|0)==(HEAP[r11+12|0]|0)){if((_merge_lines(r13,HEAP[r10+4|0],HEAP[r10+8|0],HEAP[r12|0]^r2^HEAP[r12+12|0])|0)==0){r16=r14;STACKTOP=r5;return r16}r14=(r14|0)<3?r14:3;r16=r14;STACKTOP=r5;return r16}if((HEAP[r11+4|0]|0)==(HEAP[r11+8|0]|0)){if((_merge_lines(r13,HEAP[r10|0],HEAP[r10+12|0],HEAP[r12+4|0]^r2^HEAP[r12+8|0])|0)==0){r16=r14;STACKTOP=r5;return r16}r14=(r14|0)<3?r14:3;r16=r14;STACKTOP=r5;return r16}if((HEAP[r11+4|0]|0)==(HEAP[r11+12|0]|0)){if((_merge_lines(r13,HEAP[r10|0],HEAP[r10+8|0],HEAP[r12+4|0]^r2^HEAP[r12+12|0])|0)==0){r16=r14;STACKTOP=r5;return r16}r14=(r14|0)<3?r14:3;r16=r14;STACKTOP=r5;return r16}if((HEAP[r11+8|0]|0)!=(HEAP[r11+12|0]|0)){r16=r14;STACKTOP=r5;return r16}if((_merge_lines(r13,HEAP[r10|0],HEAP[r10+4|0],HEAP[r12+8|0]^r2^HEAP[r12+12|0])|0)==0){r16=r14;STACKTOP=r5;return r16}r14=(r14|0)<3?r14:3;r16=r14;STACKTOP=r5;return r16}function _merge_lines(r1,r2,r3,r4){var r5,r6,r7;r5=STACKTOP;STACKTOP=STACKTOP+4|0;r6=r5;r7=r1;r1=r2;r2=r3;r3=r4;if((r1|0)>=(HEAP[HEAP[HEAP[r7|0]|0]+8|0]|0)){___assert_func(34104,1163,37612,36160)}if((r2|0)>=(HEAP[HEAP[HEAP[r7|0]|0]+8|0]|0)){___assert_func(34104,1164,37612,36080)}r1=_edsf_canonify(HEAP[r7+48|0],r1,r6);r3=r3^HEAP[r6];r2=_edsf_canonify(HEAP[r7+48|0],r2,r6);r3=r3^HEAP[r6];_edsf_merge(HEAP[r7+48|0],r1,r2,r3);STACKTOP=r5;return(r1|0)!=(r2|0)&1}function _face_setall(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=r1;r1=1;r5=r3;r3=0;r6=HEAP[r4|0];if((r1<<24>>24|0)==(r5<<24>>24|0)){r7=0;r8=r7;return r8}r9=HEAP[r6|0];r10=HEAP[r9+4|0]+(r2*24&-1)|0;r2=0;L1798:do{if((r2|0)<(HEAP[r10|0]|0)){while(1){r11=(HEAP[(r2<<2)+HEAP[r10+4|0]|0]-HEAP[r9+12|0]|0)/16&-1;if((HEAP[HEAP[r6+8|0]+r11|0]<<24>>24|0)==(r1<<24>>24|0)){if((_solver_set_line(r4,r11,r5<<24>>24)|0)!=1){___assert_func(34104,1270,38004,35860)}r3=1}r2=r2+1|0;if((r2|0)>=(HEAP[r10|0]|0)){break L1798}}}}while(0);r7=r3;r8=r7;return r8}function _dot_setall(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10;r4=r1;r1=1;r5=r3;r3=0;r6=HEAP[r4|0];if((r1<<24>>24|0)==(r5<<24>>24|0)){r7=0;return}r8=HEAP[r6|0];r9=HEAP[r8+20|0]+(r2*20&-1)|0;r2=0;L1814:do{if((r2|0)<(HEAP[r9|0]|0)){while(1){r10=(HEAP[(r2<<2)+HEAP[r9+4|0]|0]-HEAP[r8+12|0]|0)/16&-1;if((HEAP[HEAP[r6+8|0]+r10|0]<<24>>24|0)==(r1<<24>>24|0)){if((_solver_set_line(r4,r10,r5<<24>>24)|0)!=1){___assert_func(34104,1243,38064,35860)}r3=1}r2=r2+1|0;if((r2|0)>=(HEAP[r9|0]|0)){break L1814}}}}while(0);r7=r3;return}function _grid_size_square(r1,r2,r3,r4,r5){var r6;r6=20;HEAP[r3]=r6;r3=Math.imul(r6,r1);HEAP[r4]=r3;r3=Math.imul(r6,r2);HEAP[r5]=r3;return}function _grid_size_honeycomb(r1,r2,r3,r4,r5){var r6,r7;r6=15;r7=26;HEAP[r3]=45;r3=(r6<<2)+Math.imul(r6*3&-1,r1-1|0)|0;HEAP[r4]=r3;r3=Math.imul(r7<<1,r2-1|0)+(r7*3&-1)|0;HEAP[r5]=r3;return}function _grid_size_triangular(r1,r2,r3,r4,r5){var r6;r6=15;HEAP[r3]=18;r3=Math.imul(r1<<1,r6)+r6|0;HEAP[r4]=r3;r3=Math.imul(26,r2);HEAP[r5]=r3;return}function _loopy_generate_grid(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=STACKTOP;STACKTOP=STACKTOP+20|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r1;r1=HEAP[r9|0];r10=HEAP[r9+4|0];HEAP[r4]=HEAP[(HEAP[r9+12|0]<<2)+33332|0];HEAP[r5]=r1;HEAP[r6]=r10;HEAP[r7]=r2;r2=_grid_validate_desc(HEAP[r4],HEAP[r5],HEAP[r6],HEAP[r7]);HEAP[r8]=r2;if((HEAP[r8]|0)!=0){___assert_func(36728,2731,37860,34916)}r8=FUNCTION_TABLE[HEAP[(HEAP[r4]<<2)+33644|0]](HEAP[r5],HEAP[r6],HEAP[r7]);STACKTOP=r3;return r8}function _game_has_unique_soln(r1,r2){var r3;r3=_new_solver_state(r1,r2);r2=_solve_game_rec(r3);if((HEAP[r2+4|0]|0)==1){___assert_func(34104,1320,37964,35428)}r1=(HEAP[r2+4|0]|0)==0&1;_free_solver_state(r2);_free_solver_state(r3);return r1}function _edsf_canonify(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10;r4=r1;r1=r2;r2=r3;r3=r1;r5=0;if(!((r1|0)>=0)){___assert_func(33836,110,38048,36040)}r6=r1;L1840:do{if((HEAP[(r1<<2)+r4|0]&2|0)==0){r7=r6;while(1){r5=r5^HEAP[(r7<<2)+r4|0]&1;r1=HEAP[(r1<<2)+r4|0]>>2;r8=r1;if((HEAP[(r1<<2)+r4|0]&2|0)==0){r7=r8}else{r9=r8;break L1840}}}else{r9=r6}}while(0);r6=r9;if((r2|0)!=0){HEAP[r2]=r5}r1=r3;L1847:do{if((r1|0)!=(r6|0)){while(1){r3=HEAP[(r1<<2)+r4|0]>>2;r2=HEAP[(r1<<2)+r4|0]&1^r5;HEAP[(r1<<2)+r4|0]=r6<<2|r5;r5=r2;r1=r3;if((r1|0)==(r6|0)){break L1847}}}}while(0);if((r5|0)==0){r10=r1;return r10}___assert_func(33836,137,38048,35644);r10=r1;return r10}function _edsf_merge(r1,r2,r3,r4){var r5,r6,r7,r8;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;r7=r5+4;r8=r1;r1=r2;r2=r3;r3=r4;r1=_edsf_canonify(r8,r1,r6);if((HEAP[(r1<<2)+r8|0]&2|0)==0){___assert_func(33836,152,38036,35100)}r3=r3^HEAP[r6];r2=_edsf_canonify(r8,r2,r7);if((HEAP[(r2<<2)+r8|0]&2|0)==0){___assert_func(33836,155,38036,34564)}r6=r3^HEAP[r7];r3=r6;do{if((r1|0)==(r2|0)){if((r6|0)==0){break}___assert_func(33836,161,38036,34388)}else{if(!((r6|0)==0|(r3|0)==1)){___assert_func(33836,163,38036,34112)}if((r1|0)>(r2|0)){r4=r1;r1=r2;r2=r4}r4=(r1<<2)+r8|0;HEAP[r4]=(HEAP[(r2<<2)+r8|0]>>2<<2)+HEAP[r4]|0;HEAP[(r2<<2)+r8|0]=((r3|0)!=0^1^1)&1|r1<<2}}while(0);r2=_edsf_canonify(r8,r2,r7);if((r2|0)!=(r1|0)){___assert_func(33836,188,38036,34092)}if((HEAP[r7]|0)==(r3|0)){STACKTOP=r5;return}___assert_func(33836,189,38036,33980);STACKTOP=r5;return}function _grid_free(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r2=STACKTOP;STACKTOP=STACKTOP+32|0;r3=r2;r4=r2+4;r5=r2+8;r6=r2+12;r7=r2+16;r8=r2+20;r9=r2+24;r10=r2+28;r11=r1;if((HEAP[r11+44|0]|0)==0){___assert_func(36728,33,37896,36752)}r1=r11+44|0;HEAP[r1]=HEAP[r1]-1|0;if((HEAP[r11+44|0]|0)!=0){STACKTOP=r2;return}r1=0;L1887:do{if((r1|0)<(HEAP[r11|0]|0)){while(1){r12=HEAP[HEAP[r11+4|0]+(r1*24&-1)+8|0];HEAP[r10]=r12;if((r12|0)!=0){_free(HEAP[r10])}r12=HEAP[HEAP[r11+4|0]+(r1*24&-1)+4|0];HEAP[r9]=r12;if((r12|0)!=0){_free(HEAP[r9])}r1=r1+1|0;if((r1|0)>=(HEAP[r11|0]|0)){break L1887}}}}while(0);r1=0;L1898:do{if((r1|0)<(HEAP[r11+16|0]|0)){while(1){r9=HEAP[HEAP[r11+20|0]+(r1*20&-1)+8|0];HEAP[r8]=r9;if((r9|0)!=0){_free(HEAP[r8])}r9=HEAP[HEAP[r11+20|0]+(r1*20&-1)+4|0];HEAP[r7]=r9;if((r9|0)!=0){_free(HEAP[r7])}r1=r1+1|0;if((r1|0)>=(HEAP[r11+16|0]|0)){break L1898}}}}while(0);r1=HEAP[r11+4|0];HEAP[r6]=r1;if((r1|0)!=0){_free(HEAP[r6])}r6=HEAP[r11+12|0];HEAP[r5]=r6;if((r6|0)!=0){_free(HEAP[r5])}r5=HEAP[r11+20|0];HEAP[r4]=r5;if((r5|0)!=0){_free(HEAP[r4])}r4=r11;HEAP[r3]=r4;if((r4|0)!=0){_free(HEAP[r3])}STACKTOP=r2;return}function _grid_validate_desc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r5=STACKTOP;STACKTOP=STACKTOP+60|0;r6=r5;r7=r5+4;r8=r5+8;r9=r5+12;r10=r5+16;r11=r5+20;r12=r5+24;r13=r5+28;r14=r5+32;r15=r5+36;r16=r5+40;r17=r5+44;r18=r5+48;r19=r5+56;r20=r1;r1=r2;r2=r3;r3=r4;if((r20|0)!=11&(r20|0)!=12){if((r3|0)!=0){r21=35532;r22=r21;STACKTOP=r5;return r22}else{r21=0;r22=r21;STACKTOP=r5;return r22}}HEAP[r7]=r20;HEAP[r8]=r1;HEAP[r9]=r2;HEAP[r10]=r3;HEAP[r11]=100;HEAP[r19]=(HEAP[r7]|0)==11?0:1;do{if((HEAP[r10]|0)!=0){_penrose_calculate_size(HEAP[r19],HEAP[r11],HEAP[r8],HEAP[r9],r18,r12,r13);r7=HEAP[r18];r3=r7-Math.sqrt(Math.imul(HEAP[r8],HEAP[r8])+Math.imul(HEAP[r9],HEAP[r9])|0)&-1;HEAP[r17]=r3;if((_sscanf(HEAP[r10],34520,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP[tempInt]=r14,HEAP[tempInt+4]=r15,HEAP[tempInt+8]=r16,tempInt))|0)!=3){HEAP[r6]=36120;break}if(Math.sqrt(Math.imul(HEAP[r14],HEAP[r14])+Math.imul(HEAP[r15],HEAP[r15])|0)>(HEAP[r17]|0)){HEAP[r6]=36052;break}if(((HEAP[r16]|0)%36|0)!=0|(HEAP[r16]|0)<0|(HEAP[r16]|0)>=360){HEAP[r6]=35984;break}else{HEAP[r6]=0;break}}else{HEAP[r6]=36200}}while(0);r21=HEAP[r6];r22=r21;STACKTOP=r5;return r22}function _extract_grid_desc(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=r2+4;r5=r1;r1=_strchr(HEAP[r5],95);if((r1|0)==0){r6=0;r7=r6;STACKTOP=r2;return r7}r8=r1-HEAP[r5]|0;HEAP[r3]=r8+1|0;r9=_malloc(HEAP[r3]);HEAP[r4]=r9;if((HEAP[r4]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r9=HEAP[r4];r4=r9;r3=HEAP[r5];r10=r8;for(r11=r3,r12=r4,r13=r11+r10;r11<r13;r11++,r12++){HEAP[r12]=HEAP[r11]}HEAP[r9+r8|0]=0;HEAP[r5]=r1+1|0;r6=r9;r7=r6;STACKTOP=r2;return r7}function _grid_size_snubsquare(r1,r2,r3,r4,r5){var r6,r7;r6=15;r7=26;HEAP[r3]=18;r3=Math.imul(r1-1|0,r7+r6|0)+r6+r7|0;HEAP[r4]=r3;r3=Math.imul(r2-1|0,r7+r6|0)+r6+r7|0;HEAP[r5]=r3;return}function _grid_size_cairo(r1,r2,r3,r4,r5){var r6;r6=31;HEAP[r3]=40;r3=Math.imul(r1-1|0,r6)+r6<<1;HEAP[r4]=r3;r3=Math.imul(r2-1|0,r6)+r6<<1;HEAP[r5]=r3;return}function _grid_size_greathexagonal(r1,r2,r3,r4,r5){var r6,r7;r6=15;r7=26;HEAP[r3]=18;r3=(r6<<2)+Math.imul(r1-1|0,(r6*3&-1)+r7|0)|0;HEAP[r4]=r3;r3=Math.imul(r7+r6<<1,r2-1|0)+(r7*3&-1)+r6|0;HEAP[r5]=r3;return}function _grid_size_octagonal(r1,r2,r3,r4,r5){var r6,r7;r6=29;r7=41;HEAP[r3]=40;r3=Math.imul((r6<<1)+r7|0,r1);HEAP[r4]=r3;r3=Math.imul((r6<<1)+r7|0,r2);HEAP[r5]=r3;return}function _grid_size_kites(r1,r2,r3,r4,r5){var r6,r7;r6=15;r7=26;HEAP[r3]=40;r3=(r7<<1)+Math.imul(r7<<2,r1)|0;HEAP[r4]=r3;r3=(r6<<3)+Math.imul(r6*6&-1,r2-1|0)|0;HEAP[r5]=r3;return}function _grid_size_floret(r1,r2,r3,r4,r5){var r6,r7,r8,r9;r6=75;r7=-26;r8=(r6<<2|0)/5&-1;r9=r7*-2&-1;HEAP[r3]=150;r3=(r8<<2)+(r6<<1)+Math.imul(r1-1|0,((r8*3&-1)+(r6*6&-1)|0)/2&-1)|0;HEAP[r4]=r3;r3=(r9<<2)+(r9-r7<<1)+Math.imul((r9*5&-1)-(r7<<2)|0,r2-1|0)|0;HEAP[r5]=r3;return}function _grid_size_dodecagonal(r1,r2,r3,r4,r5){var r6,r7;r6=15;r7=26;HEAP[r3]=26;r3=(((r6<<1)+r7)*3&-1)+Math.imul((r6<<2)+(r7<<1)|0,r1-1|0)|0;HEAP[r4]=r3;r3=((r6<<1)+r7<<1)+Math.imul((r7<<1)+(r6*3&-1)|0,r2-1|0)|0;HEAP[r5]=r3;return}function _grid_size_greatdodecagonal(r1,r2,r3,r4,r5){var r6,r7;r6=15;r7=26;HEAP[r3]=26;r3=((r6<<1)+r7<<1)+Math.imul((r7<<1)+(r6*6&-1)|0,r1-1|0)+(r6*3&-1)+r7|0;HEAP[r4]=r3;r3=((r6<<1)+r7<<1)+Math.imul((r7+r6)*3&-1,r2-1|0)|0;HEAP[r5]=r3;return}function _grid_size_penrose_p2_kite(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12;r6=STACKTOP;STACKTOP=STACKTOP+24|0;r7=r6;r8=r6+4;r9=r6+8;r10=r6+12;r11=r6+16;r12=r6+20;HEAP[r7]=r1;HEAP[r8]=r2;HEAP[r9]=r3;HEAP[r10]=r4;HEAP[r11]=r5;HEAP[r12]=100;HEAP[HEAP[r9]]=HEAP[r12];r9=Math.imul(HEAP[r7],HEAP[r12]);HEAP[HEAP[r10]]=r9;r9=Math.imul(HEAP[r8],HEAP[r12]);HEAP[HEAP[r11]]=r9;STACKTOP=r6;return}function _grid_size_penrose_p3_thick(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12;r6=STACKTOP;STACKTOP=STACKTOP+24|0;r7=r6;r8=r6+4;r9=r6+8;r10=r6+12;r11=r6+16;r12=r6+20;HEAP[r7]=r1;HEAP[r8]=r2;HEAP[r9]=r3;HEAP[r10]=r4;HEAP[r11]=r5;HEAP[r12]=100;HEAP[HEAP[r9]]=HEAP[r12];r9=Math.imul(HEAP[r7],HEAP[r12]);HEAP[HEAP[r10]]=r9;r9=Math.imul(HEAP[r8],HEAP[r12]);HEAP[HEAP[r11]]=r9;STACKTOP=r6;return}function _grid_new_square(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36;r3=STACKTOP;STACKTOP=STACKTOP+104|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r3+100;r30=r1;r1=r2;r2=20;r31=Math.imul(r1,r30);r32=Math.imul(r1+1|0,r30+1|0);r33=_grid_empty();HEAP[r33+40|0]=r2;HEAP[r28]=r31*24&-1;r34=_malloc(HEAP[r28]);HEAP[r29]=r34;if((HEAP[r29]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r33+4|0]=HEAP[r29];HEAP[r26]=r32*20&-1;r29=_malloc(HEAP[r26]);HEAP[r27]=r29;if((HEAP[r27]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r33+20|0]=HEAP[r27];HEAP[r24]=12;HEAP[r22]=8;r27=_malloc(HEAP[r22]);HEAP[r23]=r27;if((HEAP[r23]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r25]=HEAP[r23];HEAP[HEAP[r25]|0]=0;HEAP[HEAP[r25]+4|0]=HEAP[r24];r24=HEAP[r25];r25=0;L1974:do{if((r25|0)<(r1|0)){while(1){r23=0;L1978:do{if((r23|0)<(r30|0)){while(1){r27=Math.imul(r23,r2);r22=Math.imul(r25,r2);_grid_face_add_new(r33,4);r29=_grid_get_dot(r33,r24,r27,r22);HEAP[r18]=r33;HEAP[r19]=r29;HEAP[r20]=0;HEAP[r21]=HEAP[HEAP[r18]+4|0]+(HEAP[HEAP[r18]|0]*24&-1)-24|0;HEAP[(HEAP[r20]<<2)+HEAP[HEAP[r21]+8|0]|0]=HEAP[r19];r29=_grid_get_dot(r33,r24,r2+r27|0,r22);HEAP[r14]=r33;HEAP[r15]=r29;HEAP[r16]=1;HEAP[r17]=HEAP[HEAP[r14]+4|0]+(HEAP[HEAP[r14]|0]*24&-1)-24|0;HEAP[(HEAP[r16]<<2)+HEAP[HEAP[r17]+8|0]|0]=HEAP[r15];r29=_grid_get_dot(r33,r24,r2+r27|0,r2+r22|0);HEAP[r10]=r33;HEAP[r11]=r29;HEAP[r12]=2;HEAP[r13]=HEAP[HEAP[r10]+4|0]+(HEAP[HEAP[r10]|0]*24&-1)-24|0;HEAP[(HEAP[r12]<<2)+HEAP[HEAP[r13]+8|0]|0]=HEAP[r11];r29=_grid_get_dot(r33,r24,r27,r2+r22|0);HEAP[r6]=r33;HEAP[r7]=r29;HEAP[r8]=3;HEAP[r9]=HEAP[HEAP[r6]+4|0]+(HEAP[HEAP[r6]|0]*24&-1)-24|0;HEAP[(HEAP[r8]<<2)+HEAP[HEAP[r9]+8|0]|0]=HEAP[r7];r23=r23+1|0;if((r23|0)>=(r30|0)){break L1978}}}}while(0);r25=r25+1|0;if((r25|0)>=(r1|0)){break L1974}}}}while(0);HEAP[r5]=r24;_freenode234(HEAP[HEAP[r5]|0]);r24=HEAP[r5];HEAP[r4]=r24;if((r24|0)!=0){_free(HEAP[r4])}if(!((HEAP[r33|0]|0)<=(r31|0))){___assert_func(36728,1440,37640,34328)}if((HEAP[r33+16|0]|0)<=(r32|0)){r35=r33;_grid_make_consistent(r35);r36=r33;STACKTOP=r3;return r36}___assert_func(36728,1441,37640,34068);r35=r33;_grid_make_consistent(r35);r36=r33;STACKTOP=r3;return r36}function _grid_new_honeycomb(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45;r3=STACKTOP;STACKTOP=STACKTOP+136|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r3+100;r30=r3+104;r31=r3+108;r32=r3+112;r33=r3+116;r34=r3+120;r35=r3+124;r36=r3+128;r37=r3+132;r38=r1;r1=r2;r2=15;r39=26;r40=Math.imul(r1,r38);r41=Math.imul(r38+1<<1,r1+1|0);r42=_grid_empty();HEAP[r42+40|0]=45;HEAP[r36]=r40*24&-1;r43=_malloc(HEAP[r36]);HEAP[r37]=r43;if((HEAP[r37]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r42+4|0]=HEAP[r37];HEAP[r34]=r41*20&-1;r37=_malloc(HEAP[r34]);HEAP[r35]=r37;if((HEAP[r35]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r42+20|0]=HEAP[r35];HEAP[r32]=12;HEAP[r30]=8;r35=_malloc(HEAP[r30]);HEAP[r31]=r35;if((HEAP[r31]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r33]=HEAP[r31];HEAP[HEAP[r33]|0]=0;HEAP[HEAP[r33]+4|0]=HEAP[r32];r32=HEAP[r33];r33=0;L2003:do{if((r33|0)<(r1|0)){while(1){r31=0;L2007:do{if((r31|0)<(r38|0)){while(1){r35=Math.imul(r2*3&-1,r31);r30=Math.imul(r39<<1,r33);if(((r31|0)%2|0)!=0){r30=r30+r39|0}_grid_face_add_new(r42,6);r37=_grid_get_dot(r42,r32,r35-r2|0,r30-r39|0);HEAP[r26]=r42;HEAP[r27]=r37;HEAP[r28]=0;HEAP[r29]=HEAP[HEAP[r26]+4|0]+(HEAP[HEAP[r26]|0]*24&-1)-24|0;HEAP[(HEAP[r28]<<2)+HEAP[HEAP[r29]+8|0]|0]=HEAP[r27];r37=_grid_get_dot(r42,r32,r2+r35|0,r30-r39|0);HEAP[r22]=r42;HEAP[r23]=r37;HEAP[r24]=1;HEAP[r25]=HEAP[HEAP[r22]+4|0]+(HEAP[HEAP[r22]|0]*24&-1)-24|0;HEAP[(HEAP[r24]<<2)+HEAP[HEAP[r25]+8|0]|0]=HEAP[r23];r37=_grid_get_dot(r42,r32,(r2<<1)+r35|0,r30);HEAP[r18]=r42;HEAP[r19]=r37;HEAP[r20]=2;HEAP[r21]=HEAP[HEAP[r18]+4|0]+(HEAP[HEAP[r18]|0]*24&-1)-24|0;HEAP[(HEAP[r20]<<2)+HEAP[HEAP[r21]+8|0]|0]=HEAP[r19];r37=_grid_get_dot(r42,r32,r2+r35|0,r39+r30|0);HEAP[r14]=r42;HEAP[r15]=r37;HEAP[r16]=3;HEAP[r17]=HEAP[HEAP[r14]+4|0]+(HEAP[HEAP[r14]|0]*24&-1)-24|0;HEAP[(HEAP[r16]<<2)+HEAP[HEAP[r17]+8|0]|0]=HEAP[r15];r37=_grid_get_dot(r42,r32,r35-r2|0,r39+r30|0);HEAP[r10]=r42;HEAP[r11]=r37;HEAP[r12]=4;HEAP[r13]=HEAP[HEAP[r10]+4|0]+(HEAP[HEAP[r10]|0]*24&-1)-24|0;HEAP[(HEAP[r12]<<2)+HEAP[HEAP[r13]+8|0]|0]=HEAP[r11];r37=_grid_get_dot(r42,r32,r35-(r2<<1)|0,r30);HEAP[r4]=r42;HEAP[r5]=r37;HEAP[r6]=5;HEAP[r7]=HEAP[HEAP[r4]+4|0]+(HEAP[HEAP[r4]|0]*24&-1)-24|0;HEAP[(HEAP[r6]<<2)+HEAP[HEAP[r7]+8|0]|0]=HEAP[r5];r31=r31+1|0;if((r31|0)>=(r38|0)){break L2007}}}}while(0);r33=r33+1|0;if((r33|0)>=(r1|0)){break L2003}}}}while(0);HEAP[r9]=r32;_freenode234(HEAP[HEAP[r9]|0]);r32=HEAP[r9];HEAP[r8]=r32;if((r32|0)!=0){_free(HEAP[r8])}if(!((HEAP[r42|0]|0)<=(r40|0))){___assert_func(36728,1509,37732,34328)}if((HEAP[r42+16|0]|0)<=(r41|0)){r44=r42;_grid_make_consistent(r44);r45=r42;STACKTOP=r3;return r45}___assert_func(36728,1510,37732,34068);r44=r42;_grid_make_consistent(r44);r45=r42;STACKTOP=r3;return r45}function _grid_new_triangular(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r4+24;r12=r4+28;r13=r1;r1=r2;r2=15;r14=26;r15=r13+1|0;r16=_grid_empty();HEAP[r16+40|0]=18;r17=Math.imul(r13<<1,r1);HEAP[r16|0]=r17;r17=Math.imul(r1+1|0,r13+1|0);HEAP[r16+16|0]=r17;HEAP[r11]=HEAP[r16|0]*24&-1;r17=_malloc(HEAP[r11]);HEAP[r12]=r17;if((HEAP[r12]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r16+4|0]=HEAP[r12];HEAP[r9]=HEAP[r16+16|0]*20&-1;r12=_malloc(HEAP[r9]);HEAP[r10]=r12;if((HEAP[r10]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r16+20|0]=HEAP[r10];r10=0;r12=0;L2032:do{if((r12|0)<=(r1|0)){while(1){r18=0;L2035:do{if((r18|0)<=(r13|0)){while(1){r9=HEAP[r16+20|0]+(r10*20&-1)|0;HEAP[r9|0]=0;HEAP[r9+4|0]=0;HEAP[r9+8|0]=0;r17=(((r12|0)%2|0)!=0?r2:0)+Math.imul(r18<<1,r2)|0;HEAP[r9+12|0]=r17;r17=Math.imul(r14,r12);HEAP[r9+16|0]=r17;r10=r10+1|0;r18=r18+1|0;if(!((r18|0)<=(r13|0))){break L2035}}}}while(0);r12=r12+1|0;if(!((r12|0)<=(r1|0))){break L2032}}}}while(0);r10=0;r12=0;if((r12|0)>=(r1|0)){r19=r16;_grid_make_consistent(r19);r20=r16;STACKTOP=r4;return r20}L2043:while(1){r18=0;L2045:do{if((r18|0)<(r13|0)){while(1){r14=HEAP[r16+4|0]+(r10*24&-1)|0;r2=r14+24|0;HEAP[r14+4|0]=0;HEAP[r14|0]=3;HEAP[r7]=HEAP[r14|0]<<2;r17=_malloc(HEAP[r7]);HEAP[r8]=r17;if((r17|0)==0){r3=1469;break L2043}HEAP[r14+8|0]=HEAP[r8];HEAP[r14+12|0]=0;HEAP[r2+4|0]=0;HEAP[r2|0]=3;HEAP[r5]=HEAP[r2|0]<<2;r17=_malloc(HEAP[r5]);HEAP[r6]=r17;if((HEAP[r6]|0)==0){r3=1471;break L2043}HEAP[r2+8|0]=HEAP[r6];HEAP[r2+12|0]=0;r17=HEAP[r16+20|0]+(Math.imul(r15,r12)*20&-1)+(r18*20&-1)|0;HEAP[HEAP[r14+8|0]|0]=r17;r17=HEAP[r16+20|0];r9=r12;if(((r12|0)%2|0)!=0){r11=r17+(Math.imul(r15,r9+1|0)*20&-1)+(r18*20&-1)+20|0;HEAP[HEAP[r14+8|0]+4|0]=r11;r11=HEAP[r16+20|0]+(Math.imul(r12+1|0,r15)*20&-1)+(r18*20&-1)|0;HEAP[HEAP[r14+8|0]+8|0]=r11;r11=HEAP[r16+20|0]+(Math.imul(r15,r12)*20&-1)+(r18*20&-1)|0;HEAP[HEAP[r2+8|0]|0]=r11;r11=HEAP[r16+20|0]+(Math.imul(r15,r12)*20&-1)+(r18*20&-1)+20|0;HEAP[HEAP[r2+8|0]+4|0]=r11;r11=HEAP[r16+20|0]+(Math.imul(r12+1|0,r15)*20&-1)+(r18*20&-1)+20|0;HEAP[HEAP[r2+8|0]+8|0]=r11}else{r11=r17+(Math.imul(r15,r9)*20&-1)+(r18*20&-1)+20|0;HEAP[HEAP[r14+8|0]+4|0]=r11;r11=HEAP[r16+20|0]+(Math.imul(r12+1|0,r15)*20&-1)+(r18*20&-1)|0;HEAP[HEAP[r14+8|0]+8|0]=r11;r11=HEAP[r16+20|0]+(Math.imul(r15,r12)*20&-1)+(r18*20&-1)+20|0;HEAP[HEAP[r2+8|0]|0]=r11;r11=HEAP[r16+20|0]+(Math.imul(r12+1|0,r15)*20&-1)+(r18*20&-1)+20|0;HEAP[HEAP[r2+8|0]+4|0]=r11;r11=HEAP[r16+20|0]+(Math.imul(r12+1|0,r15)*20&-1)+(r18*20&-1)|0;HEAP[HEAP[r2+8|0]+8|0]=r11}r10=r10+2|0;r18=r18+1|0;if((r18|0)>=(r13|0)){break L2045}}}}while(0);r12=r12+1|0;if((r12|0)>=(r1|0)){r3=1479;break}}if(r3==1469){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r3==1471){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r3==1479){r19=r16;_grid_make_consistent(r19);r20=r16;STACKTOP=r4;return r20}}function _grid_new_snubsquare(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102;r3=STACKTOP;STACKTOP=STACKTOP+360|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r3+100;r30=r3+104;r31=r3+108;r32=r3+112;r33=r3+116;r34=r3+120;r35=r3+124;r36=r3+128;r37=r3+132;r38=r3+136;r39=r3+140;r40=r3+144;r41=r3+148;r42=r3+152;r43=r3+156;r44=r3+160;r45=r3+164;r46=r3+168;r47=r3+172;r48=r3+176;r49=r3+180;r50=r3+184;r51=r3+188;r52=r3+192;r53=r3+196;r54=r3+200;r55=r3+204;r56=r3+208;r57=r3+212;r58=r3+216;r59=r3+220;r60=r3+224;r61=r3+228;r62=r3+232;r63=r3+236;r64=r3+240;r65=r3+244;r66=r3+248;r67=r3+252;r68=r3+256;r69=r3+260;r70=r3+264;r71=r3+268;r72=r3+272;r73=r3+276;r74=r3+280;r75=r3+284;r76=r3+288;r77=r3+292;r78=r3+296;r79=r3+300;r80=r3+304;r81=r3+308;r82=r3+312;r83=r3+316;r84=r3+320;r85=r3+324;r86=r3+328;r87=r3+332;r88=r3+336;r89=r3+340;r90=r3+344;r91=r3+348;r92=r3+352;r93=r3+356;r94=r1;r1=r2;r2=15;r95=26;r96=Math.imul(r94*3&-1,r1);r97=Math.imul(r94+1<<1,r1+1|0);r98=_grid_empty();HEAP[r98+40|0]=18;HEAP[r92]=r96*24&-1;r99=_malloc(HEAP[r92]);HEAP[r93]=r99;if((HEAP[r93]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r98+4|0]=HEAP[r93];HEAP[r90]=r97*20&-1;r93=_malloc(HEAP[r90]);HEAP[r91]=r93;if((HEAP[r91]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r98+20|0]=HEAP[r91];HEAP[r88]=12;HEAP[r86]=8;r91=_malloc(HEAP[r86]);HEAP[r87]=r91;if((HEAP[r87]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r89]=HEAP[r87];HEAP[HEAP[r89]|0]=0;HEAP[HEAP[r89]+4|0]=HEAP[r88];r88=HEAP[r89];r89=0;L2069:do{if((r89|0)<(r1|0)){while(1){r87=0;L2073:do{if((r87|0)<(r94|0)){while(1){r91=Math.imul(r95+r2|0,r87);r86=Math.imul(r95+r2|0,r89);_grid_face_add_new(r98,4);r93=r98;r90=r88;r99=r91;if(((r89+r87|0)%2|0)!=0){r100=_grid_get_dot(r93,r90,r2+r99|0,r86);HEAP[r82]=r98;HEAP[r83]=r100;HEAP[r84]=0;HEAP[r85]=HEAP[HEAP[r82]+4|0]+(HEAP[HEAP[r82]|0]*24&-1)-24|0;HEAP[(HEAP[r84]<<2)+HEAP[HEAP[r85]+8|0]|0]=HEAP[r83];r100=_grid_get_dot(r98,r88,r2+r91+r95|0,r2+r86|0);HEAP[r78]=r98;HEAP[r79]=r100;HEAP[r80]=1;HEAP[r81]=HEAP[HEAP[r78]+4|0]+(HEAP[HEAP[r78]|0]*24&-1)-24|0;HEAP[(HEAP[r80]<<2)+HEAP[HEAP[r81]+8|0]|0]=HEAP[r79];r100=_grid_get_dot(r98,r88,r95+r91|0,r2+r86+r95|0);HEAP[r74]=r98;HEAP[r75]=r100;HEAP[r76]=2;HEAP[r77]=HEAP[HEAP[r74]+4|0]+(HEAP[HEAP[r74]|0]*24&-1)-24|0;HEAP[(HEAP[r76]<<2)+HEAP[HEAP[r77]+8|0]|0]=HEAP[r75];r100=_grid_get_dot(r98,r88,r91,r95+r86|0);HEAP[r70]=r98;HEAP[r71]=r100;HEAP[r72]=3;HEAP[r73]=HEAP[HEAP[r70]+4|0]+(HEAP[HEAP[r70]|0]*24&-1)-24|0;HEAP[(HEAP[r72]<<2)+HEAP[HEAP[r73]+8|0]|0]=HEAP[r71]}else{r100=_grid_get_dot(r93,r90,r95+r99|0,r86);HEAP[r66]=r98;HEAP[r67]=r100;HEAP[r68]=0;HEAP[r69]=HEAP[HEAP[r66]+4|0]+(HEAP[HEAP[r66]|0]*24&-1)-24|0;HEAP[(HEAP[r68]<<2)+HEAP[HEAP[r69]+8|0]|0]=HEAP[r67];r100=_grid_get_dot(r98,r88,r2+r91+r95|0,r95+r86|0);HEAP[r60]=r98;HEAP[r61]=r100;HEAP[r62]=1;HEAP[r63]=HEAP[HEAP[r60]+4|0]+(HEAP[HEAP[r60]|0]*24&-1)-24|0;HEAP[(HEAP[r62]<<2)+HEAP[HEAP[r63]+8|0]|0]=HEAP[r61];r100=_grid_get_dot(r98,r88,r2+r91|0,r2+r86+r95|0);HEAP[r56]=r98;HEAP[r57]=r100;HEAP[r58]=2;HEAP[r59]=HEAP[HEAP[r56]+4|0]+(HEAP[HEAP[r56]|0]*24&-1)-24|0;HEAP[(HEAP[r58]<<2)+HEAP[HEAP[r59]+8|0]|0]=HEAP[r57];r100=_grid_get_dot(r98,r88,r91,r2+r86|0);HEAP[r48]=r98;HEAP[r49]=r100;HEAP[r50]=3;HEAP[r51]=HEAP[HEAP[r48]+4|0]+(HEAP[HEAP[r48]|0]*24&-1)-24|0;HEAP[(HEAP[r50]<<2)+HEAP[HEAP[r51]+8|0]|0]=HEAP[r49]}do{if((r87|0)>0){_grid_face_add_new(r98,3);r99=r98;r90=r88;r93=r91;if(((r89+r87|0)%2|0)!=0){r100=_grid_get_dot(r99,r90,r2+r93|0,r86);HEAP[r40]=r98;HEAP[r41]=r100;HEAP[r42]=0;HEAP[r43]=HEAP[HEAP[r40]+4|0]+(HEAP[HEAP[r40]|0]*24&-1)-24|0;HEAP[(HEAP[r42]<<2)+HEAP[HEAP[r43]+8|0]|0]=HEAP[r41];r100=_grid_get_dot(r98,r88,r91,r95+r86|0);HEAP[r32]=r98;HEAP[r33]=r100;HEAP[r34]=1;HEAP[r35]=HEAP[HEAP[r32]+4|0]+(HEAP[HEAP[r32]|0]*24&-1)-24|0;HEAP[(HEAP[r34]<<2)+HEAP[HEAP[r35]+8|0]|0]=HEAP[r33];r100=_grid_get_dot(r98,r88,r91-r2|0,r86);HEAP[r24]=r98;HEAP[r25]=r100;HEAP[r26]=2;HEAP[r27]=HEAP[HEAP[r24]+4|0]+(HEAP[HEAP[r24]|0]*24&-1)-24|0;HEAP[(HEAP[r26]<<2)+HEAP[HEAP[r27]+8|0]|0]=HEAP[r25];break}else{r100=_grid_get_dot(r99,r90,r93,r2+r86|0);HEAP[r16]=r98;HEAP[r17]=r100;HEAP[r18]=0;HEAP[r19]=HEAP[HEAP[r16]+4|0]+(HEAP[HEAP[r16]|0]*24&-1)-24|0;HEAP[(HEAP[r18]<<2)+HEAP[HEAP[r19]+8|0]|0]=HEAP[r17];r100=_grid_get_dot(r98,r88,r2+r91|0,r2+r86+r95|0);HEAP[r8]=r98;HEAP[r9]=r100;HEAP[r10]=1;HEAP[r11]=HEAP[HEAP[r8]+4|0]+(HEAP[HEAP[r8]|0]*24&-1)-24|0;HEAP[(HEAP[r10]<<2)+HEAP[HEAP[r11]+8|0]|0]=HEAP[r9];r100=_grid_get_dot(r98,r88,r91-r2|0,r2+r86+r95|0);HEAP[r4]=r98;HEAP[r5]=r100;HEAP[r6]=2;HEAP[r7]=HEAP[HEAP[r4]+4|0]+(HEAP[HEAP[r4]|0]*24&-1)-24|0;HEAP[(HEAP[r6]<<2)+HEAP[HEAP[r7]+8|0]|0]=HEAP[r5];break}}}while(0);do{if((r89|0)>0){_grid_face_add_new(r98,3);r93=r98;r90=r88;r99=r91;if(((r89+r87|0)%2|0)!=0){r100=_grid_get_dot(r93,r90,r2+r99|0,r86);HEAP[r12]=r98;HEAP[r13]=r100;HEAP[r14]=0;HEAP[r15]=HEAP[HEAP[r12]+4|0]+(HEAP[HEAP[r12]|0]*24&-1)-24|0;HEAP[(HEAP[r14]<<2)+HEAP[HEAP[r15]+8|0]|0]=HEAP[r13];r100=_grid_get_dot(r98,r88,r2+r91+r95|0,r86-r2|0);HEAP[r20]=r98;HEAP[r21]=r100;HEAP[r22]=1;HEAP[r23]=HEAP[HEAP[r20]+4|0]+(HEAP[HEAP[r20]|0]*24&-1)-24|0;HEAP[(HEAP[r22]<<2)+HEAP[HEAP[r23]+8|0]|0]=HEAP[r21];r100=_grid_get_dot(r98,r88,r2+r91+r95|0,r2+r86|0);HEAP[r28]=r98;HEAP[r29]=r100;HEAP[r30]=2;HEAP[r31]=HEAP[HEAP[r28]+4|0]+(HEAP[HEAP[r28]|0]*24&-1)-24|0;HEAP[(HEAP[r30]<<2)+HEAP[HEAP[r31]+8|0]|0]=HEAP[r29];break}else{r100=_grid_get_dot(r93,r90,r99,r86-r2|0);HEAP[r36]=r98;HEAP[r37]=r100;HEAP[r38]=0;HEAP[r39]=HEAP[HEAP[r36]+4|0]+(HEAP[HEAP[r36]|0]*24&-1)-24|0;HEAP[(HEAP[r38]<<2)+HEAP[HEAP[r39]+8|0]|0]=HEAP[r37];r100=_grid_get_dot(r98,r88,r95+r91|0,r86);HEAP[r44]=r98;HEAP[r45]=r100;HEAP[r46]=1;HEAP[r47]=HEAP[HEAP[r44]+4|0]+(HEAP[HEAP[r44]|0]*24&-1)-24|0;HEAP[(HEAP[r46]<<2)+HEAP[HEAP[r47]+8|0]|0]=HEAP[r45];r100=_grid_get_dot(r98,r88,r91,r2+r86|0);HEAP[r52]=r98;HEAP[r53]=r100;HEAP[r54]=2;HEAP[r55]=HEAP[HEAP[r52]+4|0]+(HEAP[HEAP[r52]|0]*24&-1)-24|0;HEAP[(HEAP[r54]<<2)+HEAP[HEAP[r55]+8|0]|0]=HEAP[r53];break}}}while(0);r87=r87+1|0;if((r87|0)>=(r94|0)){break L2073}}}}while(0);r89=r89+1|0;if((r89|0)>=(r1|0)){break L2069}}}}while(0);HEAP[r65]=r88;_freenode234(HEAP[HEAP[r65]|0]);r88=HEAP[r65];HEAP[r64]=r88;if((r88|0)!=0){_free(HEAP[r64])}if(!((HEAP[r98|0]|0)<=(r96|0))){___assert_func(36728,1718,37656,34328)}if((HEAP[r98+16|0]|0)<=(r97|0)){r101=r98;_grid_make_consistent(r101);r102=r98;STACKTOP=r3;return r102}___assert_func(36728,1719,37656,34068);r101=r98;_grid_make_consistent(r101);r102=r98;STACKTOP=r3;return r102}function _grid_new_cairo(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98;r3=STACKTOP;STACKTOP=STACKTOP+344|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r3+100;r30=r3+104;r31=r3+108;r32=r3+112;r33=r3+116;r34=r3+120;r35=r3+124;r36=r3+128;r37=r3+132;r38=r3+136;r39=r3+140;r40=r3+144;r41=r3+148;r42=r3+152;r43=r3+156;r44=r3+160;r45=r3+164;r46=r3+168;r47=r3+172;r48=r3+176;r49=r3+180;r50=r3+184;r51=r3+188;r52=r3+192;r53=r3+196;r54=r3+200;r55=r3+204;r56=r3+208;r57=r3+212;r58=r3+216;r59=r3+220;r60=r3+224;r61=r3+228;r62=r3+232;r63=r3+236;r64=r3+240;r65=r3+244;r66=r3+248;r67=r3+252;r68=r3+256;r69=r3+260;r70=r3+264;r71=r3+268;r72=r3+272;r73=r3+276;r74=r3+280;r75=r3+284;r76=r3+288;r77=r3+292;r78=r3+296;r79=r3+300;r80=r3+304;r81=r3+308;r82=r3+312;r83=r3+316;r84=r3+320;r85=r3+324;r86=r3+328;r87=r3+332;r88=r3+336;r89=r3+340;r90=r1;r1=r2;r2=14;r91=31;r92=Math.imul(r90<<1,r1);r93=Math.imul((r90+1)*3&-1,r1+1|0);r94=_grid_empty();HEAP[r94+40|0]=40;HEAP[r88]=r92*24&-1;r95=_malloc(HEAP[r88]);HEAP[r89]=r95;if((HEAP[r89]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r94+4|0]=HEAP[r89];HEAP[r86]=r93*20&-1;r89=_malloc(HEAP[r86]);HEAP[r87]=r89;if((HEAP[r87]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r94+20|0]=HEAP[r87];HEAP[r84]=12;HEAP[r82]=8;r87=_malloc(HEAP[r82]);HEAP[r83]=r87;if((HEAP[r83]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r85]=HEAP[r83];HEAP[HEAP[r85]|0]=0;HEAP[HEAP[r85]+4|0]=HEAP[r84];r84=HEAP[r85];r85=0;L10:do{if((r85|0)<(r1|0)){while(1){r83=0;L14:do{if((r83|0)<(r90|0)){while(1){r87=Math.imul(r91<<1,r83);r82=r85;r89=Math.imul(r91<<1,r82);do{if((r82|0)>0){_grid_face_add_new(r94,5);r86=r94;r95=r84;r88=r87;if(((r85+r83|0)%2|0)!=0){r96=_grid_get_dot(r86,r95,r2+r88|0,r89-r91|0);HEAP[r78]=r94;HEAP[r79]=r96;HEAP[r80]=0;HEAP[r81]=HEAP[HEAP[r78]+4|0]+(HEAP[HEAP[r78]|0]*24&-1)-24|0;HEAP[(HEAP[r80]<<2)+HEAP[HEAP[r81]+8|0]|0]=HEAP[r79];r96=_grid_get_dot(r94,r84,(r91<<1)+r87+ -r2|0,r89-r91|0);HEAP[r74]=r94;HEAP[r75]=r96;HEAP[r76]=1;HEAP[r77]=HEAP[HEAP[r74]+4|0]+(HEAP[HEAP[r74]|0]*24&-1)-24|0;HEAP[(HEAP[r76]<<2)+HEAP[HEAP[r77]+8|0]|0]=HEAP[r75];r96=_grid_get_dot(r94,r84,(r91<<1)+r87|0,r89);HEAP[r70]=r94;HEAP[r71]=r96;HEAP[r72]=2;HEAP[r73]=HEAP[HEAP[r70]+4|0]+(HEAP[HEAP[r70]|0]*24&-1)-24|0;HEAP[(HEAP[r72]<<2)+HEAP[HEAP[r73]+8|0]|0]=HEAP[r71];r96=_grid_get_dot(r94,r84,r91+r87|0,r2+r89|0);HEAP[r66]=r94;HEAP[r67]=r96;HEAP[r68]=3;HEAP[r69]=HEAP[HEAP[r66]+4|0]+(HEAP[HEAP[r66]|0]*24&-1)-24|0;HEAP[(HEAP[r68]<<2)+HEAP[HEAP[r69]+8|0]|0]=HEAP[r67];r96=_grid_get_dot(r94,r84,r87,r89);HEAP[r62]=r94;HEAP[r63]=r96;HEAP[r64]=4;HEAP[r65]=HEAP[HEAP[r62]+4|0]+(HEAP[HEAP[r62]|0]*24&-1)-24|0;HEAP[(HEAP[r64]<<2)+HEAP[HEAP[r65]+8|0]|0]=HEAP[r63];break}else{r96=_grid_get_dot(r86,r95,r88,r89);HEAP[r56]=r94;HEAP[r57]=r96;HEAP[r58]=0;HEAP[r59]=HEAP[HEAP[r56]+4|0]+(HEAP[HEAP[r56]|0]*24&-1)-24|0;HEAP[(HEAP[r58]<<2)+HEAP[HEAP[r59]+8|0]|0]=HEAP[r57];r96=_grid_get_dot(r94,r84,r91+r87|0,r89-r2|0);HEAP[r52]=r94;HEAP[r53]=r96;HEAP[r54]=1;HEAP[r55]=HEAP[HEAP[r52]+4|0]+(HEAP[HEAP[r52]|0]*24&-1)-24|0;HEAP[(HEAP[r54]<<2)+HEAP[HEAP[r55]+8|0]|0]=HEAP[r53];r96=_grid_get_dot(r94,r84,(r91<<1)+r87|0,r89);HEAP[r44]=r94;HEAP[r45]=r96;HEAP[r46]=2;HEAP[r47]=HEAP[HEAP[r44]+4|0]+(HEAP[HEAP[r44]|0]*24&-1)-24|0;HEAP[(HEAP[r46]<<2)+HEAP[HEAP[r47]+8|0]|0]=HEAP[r45];r96=_grid_get_dot(r94,r84,(r91<<1)+r87+ -r2|0,r91+r89|0);HEAP[r36]=r94;HEAP[r37]=r96;HEAP[r38]=3;HEAP[r39]=HEAP[HEAP[r36]+4|0]+(HEAP[HEAP[r36]|0]*24&-1)-24|0;HEAP[(HEAP[r38]<<2)+HEAP[HEAP[r39]+8|0]|0]=HEAP[r37];r96=_grid_get_dot(r94,r84,r2+r87|0,r91+r89|0);HEAP[r28]=r94;HEAP[r29]=r96;HEAP[r30]=4;HEAP[r31]=HEAP[HEAP[r28]+4|0]+(HEAP[HEAP[r28]|0]*24&-1)-24|0;HEAP[(HEAP[r30]<<2)+HEAP[HEAP[r31]+8|0]|0]=HEAP[r29];break}}}while(0);do{if((r83|0)>0){_grid_face_add_new(r94,5);r96=_grid_get_dot(r94,r84,r87,r89);HEAP[r20]=r94;HEAP[r21]=r96;HEAP[r22]=0;HEAP[r23]=HEAP[HEAP[r20]+4|0]+(HEAP[HEAP[r20]|0]*24&-1)-24|0;HEAP[(HEAP[r22]<<2)+HEAP[HEAP[r23]+8|0]|0]=HEAP[r21];r82=r94;r88=r84;r95=r87;if(((r85+r83|0)%2|0)!=0){r96=_grid_get_dot(r82,r88,r91+r95|0,r2+r89|0);HEAP[r12]=r94;HEAP[r13]=r96;HEAP[r14]=1;HEAP[r15]=HEAP[HEAP[r12]+4|0]+(HEAP[HEAP[r12]|0]*24&-1)-24|0;HEAP[(HEAP[r14]<<2)+HEAP[HEAP[r15]+8|0]|0]=HEAP[r13];r96=_grid_get_dot(r94,r84,r91+r87|0,(r91<<1)+r89+ -r2|0);HEAP[r4]=r94;HEAP[r5]=r96;HEAP[r6]=2;HEAP[r7]=HEAP[HEAP[r4]+4|0]+(HEAP[HEAP[r4]|0]*24&-1)-24|0;HEAP[(HEAP[r6]<<2)+HEAP[HEAP[r7]+8|0]|0]=HEAP[r5];r96=_grid_get_dot(r94,r84,r87,(r91<<1)+r89|0);HEAP[r8]=r94;HEAP[r9]=r96;HEAP[r10]=3;HEAP[r11]=HEAP[HEAP[r8]+4|0]+(HEAP[HEAP[r8]|0]*24&-1)-24|0;HEAP[(HEAP[r10]<<2)+HEAP[HEAP[r11]+8|0]|0]=HEAP[r9];r96=_grid_get_dot(r94,r84,r87-r2|0,r91+r89|0);HEAP[r16]=r94;HEAP[r17]=r96;HEAP[r18]=4;HEAP[r19]=HEAP[HEAP[r16]+4|0]+(HEAP[HEAP[r16]|0]*24&-1)-24|0;HEAP[(HEAP[r18]<<2)+HEAP[HEAP[r19]+8|0]|0]=HEAP[r17];break}else{r96=_grid_get_dot(r82,r88,r2+r95|0,r91+r89|0);HEAP[r24]=r94;HEAP[r25]=r96;HEAP[r26]=1;HEAP[r27]=HEAP[HEAP[r24]+4|0]+(HEAP[HEAP[r24]|0]*24&-1)-24|0;HEAP[(HEAP[r26]<<2)+HEAP[HEAP[r27]+8|0]|0]=HEAP[r25];r96=_grid_get_dot(r94,r84,r87,(r91<<1)+r89|0);HEAP[r32]=r94;HEAP[r33]=r96;HEAP[r34]=2;HEAP[r35]=HEAP[HEAP[r32]+4|0]+(HEAP[HEAP[r32]|0]*24&-1)-24|0;HEAP[(HEAP[r34]<<2)+HEAP[HEAP[r35]+8|0]|0]=HEAP[r33];r96=_grid_get_dot(r94,r84,r87-r91|0,(r91<<1)+r89+ -r2|0);HEAP[r40]=r94;HEAP[r41]=r96;HEAP[r42]=3;HEAP[r43]=HEAP[HEAP[r40]+4|0]+(HEAP[HEAP[r40]|0]*24&-1)-24|0;HEAP[(HEAP[r42]<<2)+HEAP[HEAP[r43]+8|0]|0]=HEAP[r41];r96=_grid_get_dot(r94,r84,r87-r91|0,r2+r89|0);HEAP[r48]=r94;HEAP[r49]=r96;HEAP[r50]=4;HEAP[r51]=HEAP[HEAP[r48]+4|0]+(HEAP[HEAP[r48]|0]*24&-1)-24|0;HEAP[(HEAP[r50]<<2)+HEAP[HEAP[r51]+8|0]|0]=HEAP[r49];break}}}while(0);r83=r83+1|0;if((r83|0)>=(r90|0)){break L14}}}}while(0);r85=r85+1|0;if((r85|0)>=(r1|0)){break L10}}}}while(0);HEAP[r61]=r84;_freenode234(HEAP[HEAP[r61]|0]);r84=HEAP[r61];HEAP[r60]=r84;if((r84|0)!=0){_free(HEAP[r60])}if(!((HEAP[r94|0]|0)<=(r92|0))){___assert_func(36728,1824,37844,34328)}if((HEAP[r94+16|0]|0)<=(r93|0)){r97=r94;_grid_make_consistent(r97);r98=r94;STACKTOP=r3;return r98}___assert_func(36728,1825,37844,34068);r97=r94;_grid_make_consistent(r97);r98=r94;STACKTOP=r3;return r98}function _grid_new_greathexagonal(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+424|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r4+24;r12=r4+28;r13=r4+32;r14=r4+36;r15=r4+40;r16=r4+44;r17=r4+48;r18=r4+52;r19=r4+56;r20=r4+60;r21=r4+64;r22=r4+68;r23=r4+72;r24=r4+76;r25=r4+80;r26=r4+84;r27=r4+88;r28=r4+92;r29=r4+96;r30=r4+100;r31=r4+104;r32=r4+108;r33=r4+112;r34=r4+116;r35=r4+120;r36=r4+124;r37=r4+128;r38=r4+132;r39=r4+136;r40=r4+140;r41=r4+144;r42=r4+148;r43=r4+152;r44=r4+156;r45=r4+160;r46=r4+164;r47=r4+168;r48=r4+172;r49=r4+176;r50=r4+180;r51=r4+184;r52=r4+188;r53=r4+192;r54=r4+196;r55=r4+200;r56=r4+204;r57=r4+208;r58=r4+212;r59=r4+216;r60=r4+220;r61=r4+224;r62=r4+228;r63=r4+232;r64=r4+236;r65=r4+240;r66=r4+244;r67=r4+248;r68=r4+252;r69=r4+256;r70=r4+260;r71=r4+264;r72=r4+268;r73=r4+272;r74=r4+276;r75=r4+280;r76=r4+284;r77=r4+288;r78=r4+292;r79=r4+296;r80=r4+300;r81=r4+304;r82=r4+308;r83=r4+312;r84=r4+316;r85=r4+320;r86=r4+324;r87=r4+328;r88=r4+332;r89=r4+336;r90=r4+340;r91=r4+344;r92=r4+348;r93=r4+352;r94=r4+356;r95=r4+360;r96=r4+364;r97=r4+368;r98=r4+372;r99=r4+376;r100=r4+380;r101=r4+384;r102=r4+388;r103=r4+392;r104=r4+396;r105=r4+400;r106=r4+404;r107=r4+408;r108=r4+412;r109=r4+416;r110=r4+420;r111=r1;r1=r2;r2=15;r112=26;r113=Math.imul((r111+1)*6&-1,r1+1|0);r114=Math.imul(r111*6&-1,r1);r115=_grid_empty();HEAP[r115+40|0]=18;HEAP[r109]=r113*24&-1;r116=_malloc(HEAP[r109]);HEAP[r110]=r116;if((HEAP[r110]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r115+4|0]=HEAP[r110];HEAP[r107]=r114*20&-1;r110=_malloc(HEAP[r107]);HEAP[r108]=r110;if((HEAP[r108]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r115+20|0]=HEAP[r108];HEAP[r105]=12;HEAP[r103]=8;r108=_malloc(HEAP[r103]);HEAP[r104]=r108;if((HEAP[r104]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r106]=HEAP[r104];HEAP[HEAP[r106]|0]=0;HEAP[HEAP[r106]+4|0]=HEAP[r105];r105=HEAP[r106];r106=0;L51:do{if((r106|0)<(r1|0)){while(1){r104=0;L55:do{if((r104|0)<(r111|0)){while(1){r108=Math.imul((r2*3&-1)+r112|0,r104);r103=Math.imul(r112+r2<<1,r106);if(((r104|0)%2|0)!=0){r103=r112+r2+r103|0}_grid_face_add_new(r115,6);r110=_grid_get_dot(r115,r105,r108-r2|0,r103-r112|0);HEAP[r99]=r115;HEAP[r100]=r110;HEAP[r101]=0;HEAP[r102]=HEAP[HEAP[r99]+4|0]+(HEAP[HEAP[r99]|0]*24&-1)-24|0;HEAP[(HEAP[r101]<<2)+HEAP[HEAP[r102]+8|0]|0]=HEAP[r100];r110=_grid_get_dot(r115,r105,r2+r108|0,r103-r112|0);HEAP[r95]=r115;HEAP[r96]=r110;HEAP[r97]=1;HEAP[r98]=HEAP[HEAP[r95]+4|0]+(HEAP[HEAP[r95]|0]*24&-1)-24|0;HEAP[(HEAP[r97]<<2)+HEAP[HEAP[r98]+8|0]|0]=HEAP[r96];r110=_grid_get_dot(r115,r105,(r2<<1)+r108|0,r103);HEAP[r91]=r115;HEAP[r92]=r110;HEAP[r93]=2;HEAP[r94]=HEAP[HEAP[r91]+4|0]+(HEAP[HEAP[r91]|0]*24&-1)-24|0;HEAP[(HEAP[r93]<<2)+HEAP[HEAP[r94]+8|0]|0]=HEAP[r92];r110=_grid_get_dot(r115,r105,r2+r108|0,r112+r103|0);HEAP[r87]=r115;HEAP[r88]=r110;HEAP[r89]=3;HEAP[r90]=HEAP[HEAP[r87]+4|0]+(HEAP[HEAP[r87]|0]*24&-1)-24|0;HEAP[(HEAP[r89]<<2)+HEAP[HEAP[r90]+8|0]|0]=HEAP[r88];r110=_grid_get_dot(r115,r105,r108-r2|0,r112+r103|0);HEAP[r83]=r115;HEAP[r84]=r110;HEAP[r85]=4;HEAP[r86]=HEAP[HEAP[r83]+4|0]+(HEAP[HEAP[r83]|0]*24&-1)-24|0;HEAP[(HEAP[r85]<<2)+HEAP[HEAP[r86]+8|0]|0]=HEAP[r84];r110=_grid_get_dot(r115,r105,r108-(r2<<1)|0,r103);HEAP[r77]=r115;HEAP[r78]=r110;HEAP[r79]=5;HEAP[r80]=HEAP[HEAP[r77]+4|0]+(HEAP[HEAP[r77]|0]*24&-1)-24|0;HEAP[(HEAP[r79]<<2)+HEAP[HEAP[r80]+8|0]|0]=HEAP[r78];if((r106|0)<(r1-1|0)){_grid_face_add_new(r115,4);r110=_grid_get_dot(r115,r105,r108-r2|0,r112+r103|0);HEAP[r73]=r115;HEAP[r74]=r110;HEAP[r75]=0;HEAP[r76]=HEAP[HEAP[r73]+4|0]+(HEAP[HEAP[r73]|0]*24&-1)-24|0;HEAP[(HEAP[r75]<<2)+HEAP[HEAP[r76]+8|0]|0]=HEAP[r74];r110=_grid_get_dot(r115,r105,r2+r108|0,r112+r103|0);HEAP[r65]=r115;HEAP[r66]=r110;HEAP[r67]=1;HEAP[r68]=HEAP[HEAP[r65]+4|0]+(HEAP[HEAP[r65]|0]*24&-1)-24|0;HEAP[(HEAP[r67]<<2)+HEAP[HEAP[r68]+8|0]|0]=HEAP[r66];r110=_grid_get_dot(r115,r105,r2+r108|0,(r2<<1)+r103+r112|0);HEAP[r57]=r115;HEAP[r58]=r110;HEAP[r59]=2;HEAP[r60]=HEAP[HEAP[r57]+4|0]+(HEAP[HEAP[r57]|0]*24&-1)-24|0;HEAP[(HEAP[r59]<<2)+HEAP[HEAP[r60]+8|0]|0]=HEAP[r58];r110=_grid_get_dot(r115,r105,r108-r2|0,(r2<<1)+r103+r112|0);HEAP[r49]=r115;HEAP[r50]=r110;HEAP[r51]=3;HEAP[r52]=HEAP[HEAP[r49]+4|0]+(HEAP[HEAP[r49]|0]*24&-1)-24|0;HEAP[(HEAP[r51]<<2)+HEAP[HEAP[r52]+8|0]|0]=HEAP[r50]}r107=r104;if((r107|0)<(r111-1|0)){do{if(((r104|0)%2|0)==0){r3=45}else{if((r106|0)<(r1-1|0)){r3=45;break}else{break}}}while(0);if(r3==45){r3=0;_grid_face_add_new(r115,4);r110=_grid_get_dot(r115,r105,(r2<<1)+r108|0,r103);HEAP[r45]=r115;HEAP[r46]=r110;HEAP[r47]=0;HEAP[r48]=HEAP[HEAP[r45]+4|0]+(HEAP[HEAP[r45]|0]*24&-1)-24|0;HEAP[(HEAP[r47]<<2)+HEAP[HEAP[r48]+8|0]|0]=HEAP[r46];r110=_grid_get_dot(r115,r105,(r2<<1)+r108+r112|0,r2+r103|0);HEAP[r37]=r115;HEAP[r38]=r110;HEAP[r39]=1;HEAP[r40]=HEAP[HEAP[r37]+4|0]+(HEAP[HEAP[r37]|0]*24&-1)-24|0;HEAP[(HEAP[r39]<<2)+HEAP[HEAP[r40]+8|0]|0]=HEAP[r38];r110=_grid_get_dot(r115,r105,r2+r108+r112|0,r2+r103+r112|0);HEAP[r29]=r115;HEAP[r30]=r110;HEAP[r31]=2;HEAP[r32]=HEAP[HEAP[r29]+4|0]+(HEAP[HEAP[r29]|0]*24&-1)-24|0;HEAP[(HEAP[r31]<<2)+HEAP[HEAP[r32]+8|0]|0]=HEAP[r30];r110=_grid_get_dot(r115,r105,r2+r108|0,r112+r103|0);HEAP[r21]=r115;HEAP[r22]=r110;HEAP[r23]=3;HEAP[r24]=HEAP[HEAP[r21]+4|0]+(HEAP[HEAP[r21]|0]*24&-1)-24|0;HEAP[(HEAP[r23]<<2)+HEAP[HEAP[r24]+8|0]|0]=HEAP[r22]}r117=r104}else{r117=r107}do{if((r117|0)>0){if(((r104|0)%2|0)!=0){if((r106|0)>=(r1-1|0)){break}}_grid_face_add_new(r115,4);r110=_grid_get_dot(r115,r105,r108-(r2<<1)|0,r103);HEAP[r17]=r115;HEAP[r18]=r110;HEAP[r19]=0;HEAP[r20]=HEAP[HEAP[r17]+4|0]+(HEAP[HEAP[r17]|0]*24&-1)-24|0;HEAP[(HEAP[r19]<<2)+HEAP[HEAP[r20]+8|0]|0]=HEAP[r18];r110=_grid_get_dot(r115,r105,r108-r2|0,r112+r103|0);HEAP[r9]=r115;HEAP[r10]=r110;HEAP[r11]=1;HEAP[r12]=HEAP[HEAP[r9]+4|0]+(HEAP[HEAP[r9]|0]*24&-1)-24|0;HEAP[(HEAP[r11]<<2)+HEAP[HEAP[r12]+8|0]|0]=HEAP[r10];r110=_grid_get_dot(r115,r105,-r2+r108+ -r112|0,r2+r103+r112|0);HEAP[r5]=r115;HEAP[r6]=r110;HEAP[r7]=2;HEAP[r8]=HEAP[HEAP[r5]+4|0]+(HEAP[HEAP[r5]|0]*24&-1)-24|0;HEAP[(HEAP[r7]<<2)+HEAP[HEAP[r8]+8|0]|0]=HEAP[r6];r110=_grid_get_dot(r115,r105,-(r2<<1)+r108+ -r112|0,r2+r103|0);HEAP[r13]=r115;HEAP[r14]=r110;HEAP[r15]=3;HEAP[r16]=HEAP[HEAP[r13]+4|0]+(HEAP[HEAP[r13]|0]*24&-1)-24|0;HEAP[(HEAP[r15]<<2)+HEAP[HEAP[r16]+8|0]|0]=HEAP[r14]}}while(0);r107=r104;if((r107|0)<(r111-1|0)){if((r106|0)<(r1-1|0)){_grid_face_add_new(r115,3);r110=_grid_get_dot(r115,r105,r2+r108|0,r112+r103|0);HEAP[r25]=r115;HEAP[r26]=r110;HEAP[r27]=0;HEAP[r28]=HEAP[HEAP[r25]+4|0]+(HEAP[HEAP[r25]|0]*24&-1)-24|0;HEAP[(HEAP[r27]<<2)+HEAP[HEAP[r28]+8|0]|0]=HEAP[r26];r110=_grid_get_dot(r115,r105,r2+r108+r112|0,r2+r103+r112|0);HEAP[r33]=r115;HEAP[r34]=r110;HEAP[r35]=1;HEAP[r36]=HEAP[HEAP[r33]+4|0]+(HEAP[HEAP[r33]|0]*24&-1)-24|0;HEAP[(HEAP[r35]<<2)+HEAP[HEAP[r36]+8|0]|0]=HEAP[r34];r110=_grid_get_dot(r115,r105,r2+r108|0,(r2<<1)+r103+r112|0);HEAP[r41]=r115;HEAP[r42]=r110;HEAP[r43]=2;HEAP[r44]=HEAP[HEAP[r41]+4|0]+(HEAP[HEAP[r41]|0]*24&-1)-24|0;HEAP[(HEAP[r43]<<2)+HEAP[HEAP[r44]+8|0]|0]=HEAP[r42]}r118=r104}else{r118=r107}do{if((r118|0)>0){if((r106|0)>=(r1-1|0)){break}_grid_face_add_new(r115,3);r110=_grid_get_dot(r115,r105,r108-r2|0,r112+r103|0);HEAP[r53]=r115;HEAP[r54]=r110;HEAP[r55]=0;HEAP[r56]=HEAP[HEAP[r53]+4|0]+(HEAP[HEAP[r53]|0]*24&-1)-24|0;HEAP[(HEAP[r55]<<2)+HEAP[HEAP[r56]+8|0]|0]=HEAP[r54];r110=_grid_get_dot(r115,r105,r108-r2|0,(r2<<1)+r103+r112|0);HEAP[r61]=r115;HEAP[r62]=r110;HEAP[r63]=1;HEAP[r64]=HEAP[HEAP[r61]+4|0]+(HEAP[HEAP[r61]|0]*24&-1)-24|0;HEAP[(HEAP[r63]<<2)+HEAP[HEAP[r64]+8|0]|0]=HEAP[r62];r110=_grid_get_dot(r115,r105,-r2+r108+ -r112|0,r2+r103+r112|0);HEAP[r69]=r115;HEAP[r70]=r110;HEAP[r71]=2;HEAP[r72]=HEAP[HEAP[r69]+4|0]+(HEAP[HEAP[r69]|0]*24&-1)-24|0;HEAP[(HEAP[r71]<<2)+HEAP[HEAP[r72]+8|0]|0]=HEAP[r70]}}while(0);r104=r104+1|0;if((r104|0)>=(r111|0)){break L55}}}}while(0);r106=r106+1|0;if((r106|0)>=(r1|0)){break L51}}}}while(0);HEAP[r82]=r105;_freenode234(HEAP[HEAP[r82]|0]);r105=HEAP[r82];HEAP[r81]=r105;if((r105|0)!=0){_free(HEAP[r81])}if(!((HEAP[r115|0]|0)<=(r113|0))){___assert_func(36728,1954,37752,34328)}if((HEAP[r115+16|0]|0)<=(r114|0)){r119=r115;_grid_make_consistent(r119);r120=r115;STACKTOP=r4;return r120}___assert_func(36728,1955,37752,34068);r119=r115;_grid_make_consistent(r119);r120=r115;STACKTOP=r4;return r120}function _grid_new_octagonal(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69;r3=STACKTOP;STACKTOP=STACKTOP+232|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r3+100;r30=r3+104;r31=r3+108;r32=r3+112;r33=r3+116;r34=r3+120;r35=r3+124;r36=r3+128;r37=r3+132;r38=r3+136;r39=r3+140;r40=r3+144;r41=r3+148;r42=r3+152;r43=r3+156;r44=r3+160;r45=r3+164;r46=r3+168;r47=r3+172;r48=r3+176;r49=r3+180;r50=r3+184;r51=r3+188;r52=r3+192;r53=r3+196;r54=r3+200;r55=r3+204;r56=r3+208;r57=r3+212;r58=r3+216;r59=r3+220;r60=r3+224;r61=r3+228;r62=r1;r1=r2;r2=29;r63=41;r64=Math.imul(r62<<1,r1);r65=Math.imul(r62+1<<2,r1+1|0);r66=_grid_empty();HEAP[r66+40|0]=40;HEAP[r60]=r64*24&-1;r67=_malloc(HEAP[r60]);HEAP[r61]=r67;if((HEAP[r61]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r66+4|0]=HEAP[r61];HEAP[r58]=r65*20&-1;r61=_malloc(HEAP[r58]);HEAP[r59]=r61;if((HEAP[r59]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r66+20|0]=HEAP[r59];HEAP[r56]=12;HEAP[r54]=8;r59=_malloc(HEAP[r54]);HEAP[r55]=r59;if((HEAP[r55]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r57]=HEAP[r55];HEAP[HEAP[r57]|0]=0;HEAP[HEAP[r57]+4|0]=HEAP[r56];r56=HEAP[r57];r57=0;L110:do{if((r57|0)<(r1|0)){while(1){r55=0;L114:do{if((r55|0)<(r62|0)){while(1){r59=Math.imul((r2<<1)+r63|0,r55);r54=Math.imul((r2<<1)+r63|0,r57);_grid_face_add_new(r66,8);r61=_grid_get_dot(r66,r56,r2+r59|0,r54);HEAP[r50]=r66;HEAP[r51]=r61;HEAP[r52]=0;HEAP[r53]=HEAP[HEAP[r50]+4|0]+(HEAP[HEAP[r50]|0]*24&-1)-24|0;HEAP[(HEAP[r52]<<2)+HEAP[HEAP[r53]+8|0]|0]=HEAP[r51];r61=_grid_get_dot(r66,r56,r2+r59+r63|0,r54);HEAP[r46]=r66;HEAP[r47]=r61;HEAP[r48]=1;HEAP[r49]=HEAP[HEAP[r46]+4|0]+(HEAP[HEAP[r46]|0]*24&-1)-24|0;HEAP[(HEAP[r48]<<2)+HEAP[HEAP[r49]+8|0]|0]=HEAP[r47];r61=_grid_get_dot(r66,r56,(r2<<1)+r59+r63|0,r2+r54|0);HEAP[r42]=r66;HEAP[r43]=r61;HEAP[r44]=2;HEAP[r45]=HEAP[HEAP[r42]+4|0]+(HEAP[HEAP[r42]|0]*24&-1)-24|0;HEAP[(HEAP[r44]<<2)+HEAP[HEAP[r45]+8|0]|0]=HEAP[r43];r61=_grid_get_dot(r66,r56,(r2<<1)+r59+r63|0,r2+r54+r63|0);HEAP[r38]=r66;HEAP[r39]=r61;HEAP[r40]=3;HEAP[r41]=HEAP[HEAP[r38]+4|0]+(HEAP[HEAP[r38]|0]*24&-1)-24|0;HEAP[(HEAP[r40]<<2)+HEAP[HEAP[r41]+8|0]|0]=HEAP[r39];r61=_grid_get_dot(r66,r56,r2+r59+r63|0,(r2<<1)+r54+r63|0);HEAP[r34]=r66;HEAP[r35]=r61;HEAP[r36]=4;HEAP[r37]=HEAP[HEAP[r34]+4|0]+(HEAP[HEAP[r34]|0]*24&-1)-24|0;HEAP[(HEAP[r36]<<2)+HEAP[HEAP[r37]+8|0]|0]=HEAP[r35];r61=_grid_get_dot(r66,r56,r2+r59|0,(r2<<1)+r54+r63|0);HEAP[r28]=r66;HEAP[r29]=r61;HEAP[r30]=5;HEAP[r31]=HEAP[HEAP[r28]+4|0]+(HEAP[HEAP[r28]|0]*24&-1)-24|0;HEAP[(HEAP[r30]<<2)+HEAP[HEAP[r31]+8|0]|0]=HEAP[r29];r61=_grid_get_dot(r66,r56,r59,r2+r54+r63|0);HEAP[r24]=r66;HEAP[r25]=r61;HEAP[r26]=6;HEAP[r27]=HEAP[HEAP[r24]+4|0]+(HEAP[HEAP[r24]|0]*24&-1)-24|0;HEAP[(HEAP[r26]<<2)+HEAP[HEAP[r27]+8|0]|0]=HEAP[r25];r61=_grid_get_dot(r66,r56,r59,r2+r54|0);HEAP[r16]=r66;HEAP[r17]=r61;HEAP[r18]=7;HEAP[r19]=HEAP[HEAP[r16]+4|0]+(HEAP[HEAP[r16]|0]*24&-1)-24|0;HEAP[(HEAP[r18]<<2)+HEAP[HEAP[r19]+8|0]|0]=HEAP[r17];do{if((r55|0)>0){if((r57|0)<=0){break}_grid_face_add_new(r66,4);r61=_grid_get_dot(r66,r56,r59,r54-r2|0);HEAP[r8]=r66;HEAP[r9]=r61;HEAP[r10]=0;HEAP[r11]=HEAP[HEAP[r8]+4|0]+(HEAP[HEAP[r8]|0]*24&-1)-24|0;HEAP[(HEAP[r10]<<2)+HEAP[HEAP[r11]+8|0]|0]=HEAP[r9];r61=_grid_get_dot(r66,r56,r2+r59|0,r54);HEAP[r4]=r66;HEAP[r5]=r61;HEAP[r6]=1;HEAP[r7]=HEAP[HEAP[r4]+4|0]+(HEAP[HEAP[r4]|0]*24&-1)-24|0;HEAP[(HEAP[r6]<<2)+HEAP[HEAP[r7]+8|0]|0]=HEAP[r5];r61=_grid_get_dot(r66,r56,r59,r2+r54|0);HEAP[r12]=r66;HEAP[r13]=r61;HEAP[r14]=2;HEAP[r15]=HEAP[HEAP[r12]+4|0]+(HEAP[HEAP[r12]|0]*24&-1)-24|0;HEAP[(HEAP[r14]<<2)+HEAP[HEAP[r15]+8|0]|0]=HEAP[r13];r61=_grid_get_dot(r66,r56,r59-r2|0,r54);HEAP[r20]=r66;HEAP[r21]=r61;HEAP[r22]=3;HEAP[r23]=HEAP[HEAP[r20]+4|0]+(HEAP[HEAP[r20]|0]*24&-1)-24|0;HEAP[(HEAP[r22]<<2)+HEAP[HEAP[r23]+8|0]|0]=HEAP[r21]}}while(0);r55=r55+1|0;if((r55|0)>=(r62|0)){break L114}}}}while(0);r57=r57+1|0;if((r57|0)>=(r1|0)){break L110}}}}while(0);HEAP[r33]=r56;_freenode234(HEAP[HEAP[r33]|0]);r56=HEAP[r33];HEAP[r32]=r56;if((r56|0)!=0){_free(HEAP[r32])}if(!((HEAP[r66|0]|0)<=(r64|0))){___assert_func(36728,2037,37696,34328)}if((HEAP[r66+16|0]|0)<=(r65|0)){r68=r66;_grid_make_consistent(r68);r69=r66;STACKTOP=r3;return r69}___assert_func(36728,2038,37696,34068);r68=r66;_grid_make_consistent(r68);r69=r66;STACKTOP=r3;return r69}function _grid_new_kites(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117;r3=STACKTOP;STACKTOP=STACKTOP+424|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r3+100;r30=r3+104;r31=r3+108;r32=r3+112;r33=r3+116;r34=r3+120;r35=r3+124;r36=r3+128;r37=r3+132;r38=r3+136;r39=r3+140;r40=r3+144;r41=r3+148;r42=r3+152;r43=r3+156;r44=r3+160;r45=r3+164;r46=r3+168;r47=r3+172;r48=r3+176;r49=r3+180;r50=r3+184;r51=r3+188;r52=r3+192;r53=r3+196;r54=r3+200;r55=r3+204;r56=r3+208;r57=r3+212;r58=r3+216;r59=r3+220;r60=r3+224;r61=r3+228;r62=r3+232;r63=r3+236;r64=r3+240;r65=r3+244;r66=r3+248;r67=r3+252;r68=r3+256;r69=r3+260;r70=r3+264;r71=r3+268;r72=r3+272;r73=r3+276;r74=r3+280;r75=r3+284;r76=r3+288;r77=r3+292;r78=r3+296;r79=r3+300;r80=r3+304;r81=r3+308;r82=r3+312;r83=r3+316;r84=r3+320;r85=r3+324;r86=r3+328;r87=r3+332;r88=r3+336;r89=r3+340;r90=r3+344;r91=r3+348;r92=r3+352;r93=r3+356;r94=r3+360;r95=r3+364;r96=r3+368;r97=r3+372;r98=r3+376;r99=r3+380;r100=r3+384;r101=r3+388;r102=r3+392;r103=r3+396;r104=r3+400;r105=r3+404;r106=r3+408;r107=r3+412;r108=r3+416;r109=r3+420;r110=r1;r1=r2;r2=15;r111=26;r112=Math.imul(r110*6&-1,r1);r113=Math.imul((r110+1)*6&-1,r1+1|0);r114=_grid_empty();HEAP[r114+40|0]=40;HEAP[r108]=r112*24&-1;r115=_malloc(HEAP[r108]);HEAP[r109]=r115;if((HEAP[r109]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r114+4|0]=HEAP[r109];HEAP[r106]=r113*20&-1;r109=_malloc(HEAP[r106]);HEAP[r107]=r109;if((HEAP[r107]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r114+20|0]=HEAP[r107];HEAP[r104]=12;HEAP[r102]=8;r107=_malloc(HEAP[r102]);HEAP[r103]=r107;if((HEAP[r103]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r105]=HEAP[r103];HEAP[HEAP[r105]|0]=0;HEAP[HEAP[r105]+4|0]=HEAP[r104];r104=HEAP[r105];r105=0;L143:do{if((r105|0)<(r1|0)){while(1){r103=0;L147:do{if((r103|0)<(r110|0)){while(1){r107=Math.imul(r111<<2,r103);r102=Math.imul(r2*6&-1,r105);if(((r105|0)%2|0)!=0){r107=(r111<<1)+r107|0}_grid_face_add_new(r114,4);r109=_grid_get_dot(r114,r104,r107,r102);HEAP[r98]=r114;HEAP[r99]=r109;HEAP[r100]=0;HEAP[r101]=HEAP[HEAP[r98]+4|0]+(HEAP[HEAP[r98]|0]*24&-1)-24|0;HEAP[(HEAP[r100]<<2)+HEAP[HEAP[r101]+8|0]|0]=HEAP[r99];r109=_grid_get_dot(r114,r104,(r111<<1)+r107|0,r102);HEAP[r94]=r114;HEAP[r95]=r109;HEAP[r96]=1;HEAP[r97]=HEAP[HEAP[r94]+4|0]+(HEAP[HEAP[r94]|0]*24&-1)-24|0;HEAP[(HEAP[r96]<<2)+HEAP[HEAP[r97]+8|0]|0]=HEAP[r95];r109=_grid_get_dot(r114,r104,(r111<<1)+r107|0,(r2<<1)+r102|0);HEAP[r90]=r114;HEAP[r91]=r109;HEAP[r92]=2;HEAP[r93]=HEAP[HEAP[r90]+4|0]+(HEAP[HEAP[r90]|0]*24&-1)-24|0;HEAP[(HEAP[r92]<<2)+HEAP[HEAP[r93]+8|0]|0]=HEAP[r91];r109=_grid_get_dot(r114,r104,r111+r107|0,(r2*3&-1)+r102|0);HEAP[r86]=r114;HEAP[r87]=r109;HEAP[r88]=3;HEAP[r89]=HEAP[HEAP[r86]+4|0]+(HEAP[HEAP[r86]|0]*24&-1)-24|0;HEAP[(HEAP[r88]<<2)+HEAP[HEAP[r89]+8|0]|0]=HEAP[r87];_grid_face_add_new(r114,4);r109=_grid_get_dot(r114,r104,r107,r102);HEAP[r82]=r114;HEAP[r83]=r109;HEAP[r84]=0;HEAP[r85]=HEAP[HEAP[r82]+4|0]+(HEAP[HEAP[r82]|0]*24&-1)-24|0;HEAP[(HEAP[r84]<<2)+HEAP[HEAP[r85]+8|0]|0]=HEAP[r83];r109=_grid_get_dot(r114,r104,r111+r107|0,(r2*3&-1)+r102|0);HEAP[r76]=r114;HEAP[r77]=r109;HEAP[r78]=1;HEAP[r79]=HEAP[HEAP[r76]+4|0]+(HEAP[HEAP[r76]|0]*24&-1)-24|0;HEAP[(HEAP[r78]<<2)+HEAP[HEAP[r79]+8|0]|0]=HEAP[r77];r109=_grid_get_dot(r114,r104,r107,(r2<<2)+r102|0);HEAP[r72]=r114;HEAP[r73]=r109;HEAP[r74]=2;HEAP[r75]=HEAP[HEAP[r72]+4|0]+(HEAP[HEAP[r72]|0]*24&-1)-24|0;HEAP[(HEAP[r74]<<2)+HEAP[HEAP[r75]+8|0]|0]=HEAP[r73];r109=_grid_get_dot(r114,r104,r107-r111|0,(r2*3&-1)+r102|0);HEAP[r64]=r114;HEAP[r65]=r109;HEAP[r66]=3;HEAP[r67]=HEAP[HEAP[r64]+4|0]+(HEAP[HEAP[r64]|0]*24&-1)-24|0;HEAP[(HEAP[r66]<<2)+HEAP[HEAP[r67]+8|0]|0]=HEAP[r65];_grid_face_add_new(r114,4);r109=_grid_get_dot(r114,r104,r107,r102);HEAP[r56]=r114;HEAP[r57]=r109;HEAP[r58]=0;HEAP[r59]=HEAP[HEAP[r56]+4|0]+(HEAP[HEAP[r56]|0]*24&-1)-24|0;HEAP[(HEAP[r58]<<2)+HEAP[HEAP[r59]+8|0]|0]=HEAP[r57];r109=_grid_get_dot(r114,r104,r107-r111|0,(r2*3&-1)+r102|0);HEAP[r48]=r114;HEAP[r49]=r109;HEAP[r50]=1;HEAP[r51]=HEAP[HEAP[r48]+4|0]+(HEAP[HEAP[r48]|0]*24&-1)-24|0;HEAP[(HEAP[r50]<<2)+HEAP[HEAP[r51]+8|0]|0]=HEAP[r49];r109=_grid_get_dot(r114,r104,r107-(r111<<1)|0,(r2<<1)+r102|0);HEAP[r40]=r114;HEAP[r41]=r109;HEAP[r42]=2;HEAP[r43]=HEAP[HEAP[r40]+4|0]+(HEAP[HEAP[r40]|0]*24&-1)-24|0;HEAP[(HEAP[r42]<<2)+HEAP[HEAP[r43]+8|0]|0]=HEAP[r41];r109=_grid_get_dot(r114,r104,r107-(r111<<1)|0,r102);HEAP[r36]=r114;HEAP[r37]=r109;HEAP[r38]=3;HEAP[r39]=HEAP[HEAP[r36]+4|0]+(HEAP[HEAP[r36]|0]*24&-1)-24|0;HEAP[(HEAP[r38]<<2)+HEAP[HEAP[r39]+8|0]|0]=HEAP[r37];_grid_face_add_new(r114,4);r109=_grid_get_dot(r114,r104,r107,r102);HEAP[r28]=r114;HEAP[r29]=r109;HEAP[r30]=0;HEAP[r31]=HEAP[HEAP[r28]+4|0]+(HEAP[HEAP[r28]|0]*24&-1)-24|0;HEAP[(HEAP[r30]<<2)+HEAP[HEAP[r31]+8|0]|0]=HEAP[r29];r109=_grid_get_dot(r114,r104,r107-(r111<<1)|0,r102);HEAP[r20]=r114;HEAP[r21]=r109;HEAP[r22]=1;HEAP[r23]=HEAP[HEAP[r20]+4|0]+(HEAP[HEAP[r20]|0]*24&-1)-24|0;HEAP[(HEAP[r22]<<2)+HEAP[HEAP[r23]+8|0]|0]=HEAP[r21];r109=_grid_get_dot(r114,r104,r107-(r111<<1)|0,r102-(r2<<1)|0);HEAP[r12]=r114;HEAP[r13]=r109;HEAP[r14]=2;HEAP[r15]=HEAP[HEAP[r12]+4|0]+(HEAP[HEAP[r12]|0]*24&-1)-24|0;HEAP[(HEAP[r14]<<2)+HEAP[HEAP[r15]+8|0]|0]=HEAP[r13];r109=_grid_get_dot(r114,r104,r107-r111|0,r102-(r2*3&-1)|0);HEAP[r4]=r114;HEAP[r5]=r109;HEAP[r6]=3;HEAP[r7]=HEAP[HEAP[r4]+4|0]+(HEAP[HEAP[r4]|0]*24&-1)-24|0;HEAP[(HEAP[r6]<<2)+HEAP[HEAP[r7]+8|0]|0]=HEAP[r5];_grid_face_add_new(r114,4);r109=_grid_get_dot(r114,r104,r107,r102);HEAP[r8]=r114;HEAP[r9]=r109;HEAP[r10]=0;HEAP[r11]=HEAP[HEAP[r8]+4|0]+(HEAP[HEAP[r8]|0]*24&-1)-24|0;HEAP[(HEAP[r10]<<2)+HEAP[HEAP[r11]+8|0]|0]=HEAP[r9];r109=_grid_get_dot(r114,r104,r107-r111|0,r102-(r2*3&-1)|0);HEAP[r16]=r114;HEAP[r17]=r109;HEAP[r18]=1;HEAP[r19]=HEAP[HEAP[r16]+4|0]+(HEAP[HEAP[r16]|0]*24&-1)-24|0;HEAP[(HEAP[r18]<<2)+HEAP[HEAP[r19]+8|0]|0]=HEAP[r17];r109=_grid_get_dot(r114,r104,r107,r102-(r2<<2)|0);HEAP[r24]=r114;HEAP[r25]=r109;HEAP[r26]=2;HEAP[r27]=HEAP[HEAP[r24]+4|0]+(HEAP[HEAP[r24]|0]*24&-1)-24|0;HEAP[(HEAP[r26]<<2)+HEAP[HEAP[r27]+8|0]|0]=HEAP[r25];r109=_grid_get_dot(r114,r104,r111+r107|0,r102-(r2*3&-1)|0);HEAP[r32]=r114;HEAP[r33]=r109;HEAP[r34]=3;HEAP[r35]=HEAP[HEAP[r32]+4|0]+(HEAP[HEAP[r32]|0]*24&-1)-24|0;HEAP[(HEAP[r34]<<2)+HEAP[HEAP[r35]+8|0]|0]=HEAP[r33];_grid_face_add_new(r114,4);r109=_grid_get_dot(r114,r104,r107,r102);HEAP[r44]=r114;HEAP[r45]=r109;HEAP[r46]=0;HEAP[r47]=HEAP[HEAP[r44]+4|0]+(HEAP[HEAP[r44]|0]*24&-1)-24|0;HEAP[(HEAP[r46]<<2)+HEAP[HEAP[r47]+8|0]|0]=HEAP[r45];r109=_grid_get_dot(r114,r104,r111+r107|0,r102-(r2*3&-1)|0);HEAP[r52]=r114;HEAP[r53]=r109;HEAP[r54]=1;HEAP[r55]=HEAP[HEAP[r52]+4|0]+(HEAP[HEAP[r52]|0]*24&-1)-24|0;HEAP[(HEAP[r54]<<2)+HEAP[HEAP[r55]+8|0]|0]=HEAP[r53];r109=_grid_get_dot(r114,r104,(r111<<1)+r107|0,r102-(r2<<1)|0);HEAP[r60]=r114;HEAP[r61]=r109;HEAP[r62]=2;HEAP[r63]=HEAP[HEAP[r60]+4|0]+(HEAP[HEAP[r60]|0]*24&-1)-24|0;HEAP[(HEAP[r62]<<2)+HEAP[HEAP[r63]+8|0]|0]=HEAP[r61];r109=_grid_get_dot(r114,r104,(r111<<1)+r107|0,r102);HEAP[r68]=r114;HEAP[r69]=r109;HEAP[r70]=3;HEAP[r71]=HEAP[HEAP[r68]+4|0]+(HEAP[HEAP[r68]|0]*24&-1)-24|0;HEAP[(HEAP[r70]<<2)+HEAP[HEAP[r71]+8|0]|0]=HEAP[r69];r103=r103+1|0;if((r103|0)>=(r110|0)){break L147}}}}while(0);r105=r105+1|0;if((r105|0)>=(r1|0)){break L143}}}}while(0);HEAP[r81]=r104;_freenode234(HEAP[HEAP[r81]|0]);r104=HEAP[r81];HEAP[r80]=r104;if((r104|0)!=0){_free(HEAP[r80])}if(!((HEAP[r114|0]|0)<=(r112|0))){___assert_func(36728,2157,37716,34328)}if((HEAP[r114+16|0]|0)<=(r113|0)){r116=r114;_grid_make_consistent(r116);r117=r114;STACKTOP=r3;return r117}___assert_func(36728,2158,37716,34068);r116=r114;_grid_make_consistent(r116);r117=r114;STACKTOP=r3;return r117}function _grid_new_floret(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+520|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r4+24;r12=r4+28;r13=r4+32;r14=r4+36;r15=r4+40;r16=r4+44;r17=r4+48;r18=r4+52;r19=r4+56;r20=r4+60;r21=r4+64;r22=r4+68;r23=r4+72;r24=r4+76;r25=r4+80;r26=r4+84;r27=r4+88;r28=r4+92;r29=r4+96;r30=r4+100;r31=r4+104;r32=r4+108;r33=r4+112;r34=r4+116;r35=r4+120;r36=r4+124;r37=r4+128;r38=r4+132;r39=r4+136;r40=r4+140;r41=r4+144;r42=r4+148;r43=r4+152;r44=r4+156;r45=r4+160;r46=r4+164;r47=r4+168;r48=r4+172;r49=r4+176;r50=r4+180;r51=r4+184;r52=r4+188;r53=r4+192;r54=r4+196;r55=r4+200;r56=r4+204;r57=r4+208;r58=r4+212;r59=r4+216;r60=r4+220;r61=r4+224;r62=r4+228;r63=r4+232;r64=r4+236;r65=r4+240;r66=r4+244;r67=r4+248;r68=r4+252;r69=r4+256;r70=r4+260;r71=r4+264;r72=r4+268;r73=r4+272;r74=r4+276;r75=r4+280;r76=r4+284;r77=r4+288;r78=r4+292;r79=r4+296;r80=r4+300;r81=r4+304;r82=r4+308;r83=r4+312;r84=r4+316;r85=r4+320;r86=r4+324;r87=r4+328;r88=r4+332;r89=r4+336;r90=r4+340;r91=r4+344;r92=r4+348;r93=r4+352;r94=r4+356;r95=r4+360;r96=r4+364;r97=r4+368;r98=r4+372;r99=r4+376;r100=r4+380;r101=r4+384;r102=r4+388;r103=r4+392;r104=r4+396;r105=r4+400;r106=r4+404;r107=r4+408;r108=r4+412;r109=r4+416;r110=r4+420;r111=r4+424;r112=r4+428;r113=r4+432;r114=r4+436;r115=r4+440;r116=r4+444;r117=r4+448;r118=r4+452;r119=r4+456;r120=r4+460;r121=r4+464;r122=r4+468;r123=r4+472;r124=r4+476;r125=r4+480;r126=r4+484;r127=r4+488;r128=r4+492;r129=r4+496;r130=r4+500;r131=r4+504;r132=r4+508;r133=r4+512;r134=r4+516;r135=r1;r1=r2;r2=75;r136=-26;r137=(r2<<2|0)/5&-1;r138=r136*-2&-1;r139=r137-r2|0;r140=r138-r136|0;r141=Math.imul(r135*6&-1,r1);r142=Math.imul((r135+1)*9&-1,r1+1|0);r143=_grid_empty();HEAP[r143+40|0]=150;HEAP[r133]=r141*24&-1;r144=_malloc(HEAP[r133]);HEAP[r134]=r144;if((HEAP[r134]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r143+4|0]=HEAP[r134];HEAP[r131]=r142*20&-1;r134=_malloc(HEAP[r131]);HEAP[r132]=r134;if((HEAP[r132]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r143+20|0]=HEAP[r132];HEAP[r129]=12;HEAP[r127]=8;r132=_malloc(HEAP[r127]);HEAP[r128]=r132;if((HEAP[r128]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r130]=HEAP[r128];HEAP[HEAP[r130]|0]=0;HEAP[HEAP[r130]+4|0]=HEAP[r129];r129=HEAP[r130];r130=0;L175:do{if((r130|0)<(r1|0)){while(1){r128=0;L179:do{if((r128|0)<(r135|0)){while(1){r132=Math.imul(r128,((r137*3&-1)+(r2*6&-1)|0)/2&-1);r127=Math.imul((r136<<2)-(r138*5&-1)|0,r130);do{if(((r128|0)%2|0)!=0){r127=r127-(((r136<<2)-(r138*5&-1)|0)/2&-1)|0;r3=127;break}else{if((r130|0)==0){r3=127;break}if((r130|0)==(r1-1|0)){break}else{r3=127;break}}}while(0);if(r3==127){r3=0;_grid_face_add_new(r143,5);r134=_grid_get_dot(r143,r129,r132,r127);HEAP[r123]=r143;HEAP[r124]=r134;HEAP[r125]=0;HEAP[r126]=HEAP[HEAP[r123]+4|0]+(HEAP[HEAP[r123]|0]*24&-1)-24|0;HEAP[(HEAP[r125]<<2)+HEAP[HEAP[r126]+8|0]|0]=HEAP[r124];r134=_grid_get_dot(r143,r129,(r139<<1)+r132|0,(r140<<1)+r127|0);HEAP[r119]=r143;HEAP[r120]=r134;HEAP[r121]=1;HEAP[r122]=HEAP[HEAP[r119]+4|0]+(HEAP[HEAP[r119]|0]*24&-1)-24|0;HEAP[(HEAP[r121]<<2)+HEAP[HEAP[r122]+8|0]|0]=HEAP[r120];r134=_grid_get_dot(r143,r129,(r139<<1)+r132+r137|0,(r140<<1)+r127+r138|0);HEAP[r115]=r143;HEAP[r116]=r134;HEAP[r117]=2;HEAP[r118]=HEAP[HEAP[r115]+4|0]+(HEAP[HEAP[r115]|0]*24&-1)-24|0;HEAP[(HEAP[r117]<<2)+HEAP[HEAP[r118]+8|0]|0]=HEAP[r116];r134=_grid_get_dot(r143,r129,(r137<<1)+r132+r139|0,(r138<<1)+r127+r140|0);HEAP[r111]=r143;HEAP[r112]=r134;HEAP[r113]=3;HEAP[r114]=HEAP[HEAP[r111]+4|0]+(HEAP[HEAP[r111]|0]*24&-1)-24|0;HEAP[(HEAP[r113]<<2)+HEAP[HEAP[r114]+8|0]|0]=HEAP[r112];r134=_grid_get_dot(r143,r129,(r137<<1)+r132|0,(r138<<1)+r127|0);HEAP[r107]=r143;HEAP[r108]=r134;HEAP[r109]=4;HEAP[r110]=HEAP[HEAP[r107]+4|0]+(HEAP[HEAP[r107]|0]*24&-1)-24|0;HEAP[(HEAP[r109]<<2)+HEAP[HEAP[r110]+8|0]|0]=HEAP[r108];_grid_face_add_new(r143,5);r134=_grid_get_dot(r143,r129,r132,r127);HEAP[r101]=r143;HEAP[r102]=r134;HEAP[r103]=0;HEAP[r104]=HEAP[HEAP[r101]+4|0]+(HEAP[HEAP[r101]|0]*24&-1)-24|0;HEAP[(HEAP[r103]<<2)+HEAP[HEAP[r104]+8|0]|0]=HEAP[r102];r134=_grid_get_dot(r143,r129,(r137<<1)+r132|0,(r138<<1)+r127|0);HEAP[r97]=r143;HEAP[r98]=r134;HEAP[r99]=1;HEAP[r100]=HEAP[HEAP[r97]+4|0]+(HEAP[HEAP[r97]|0]*24&-1)-24|0;HEAP[(HEAP[r99]<<2)+HEAP[HEAP[r100]+8|0]|0]=HEAP[r98];r134=_grid_get_dot(r143,r129,(r137<<1)+r132+r2|0,(r138<<1)+r127+r136|0);HEAP[r89]=r143;HEAP[r90]=r134;HEAP[r91]=2;HEAP[r92]=HEAP[HEAP[r89]+4|0]+(HEAP[HEAP[r89]|0]*24&-1)-24|0;HEAP[(HEAP[r91]<<2)+HEAP[HEAP[r92]+8|0]|0]=HEAP[r90];r134=_grid_get_dot(r143,r129,(r2<<1)+r132+r137|0,(r136<<1)+r127+r138|0);HEAP[r81]=r143;HEAP[r82]=r134;HEAP[r83]=3;HEAP[r84]=HEAP[HEAP[r81]+4|0]+(HEAP[HEAP[r81]|0]*24&-1)-24|0;HEAP[(HEAP[r83]<<2)+HEAP[HEAP[r84]+8|0]|0]=HEAP[r82];r134=_grid_get_dot(r143,r129,(r2<<1)+r132|0,(r136<<1)+r127|0);HEAP[r73]=r143;HEAP[r74]=r134;HEAP[r75]=4;HEAP[r76]=HEAP[HEAP[r73]+4|0]+(HEAP[HEAP[r73]|0]*24&-1)-24|0;HEAP[(HEAP[r75]<<2)+HEAP[HEAP[r76]+8|0]|0]=HEAP[r74];_grid_face_add_new(r143,5);r134=_grid_get_dot(r143,r129,r132,r127);HEAP[r65]=r143;HEAP[r66]=r134;HEAP[r67]=0;HEAP[r68]=HEAP[HEAP[r65]+4|0]+(HEAP[HEAP[r65]|0]*24&-1)-24|0;HEAP[(HEAP[r67]<<2)+HEAP[HEAP[r68]+8|0]|0]=HEAP[r66];r134=_grid_get_dot(r143,r129,(r2<<1)+r132|0,(r136<<1)+r127|0);HEAP[r57]=r143;HEAP[r58]=r134;HEAP[r59]=1;HEAP[r60]=HEAP[HEAP[r57]+4|0]+(HEAP[HEAP[r57]|0]*24&-1)-24|0;HEAP[(HEAP[r59]<<2)+HEAP[HEAP[r60]+8|0]|0]=HEAP[r58];r134=_grid_get_dot(r143,r129,(r2<<1)+r132+ -r139|0,(r136<<1)+r127+ -r140|0);HEAP[r53]=r143;HEAP[r54]=r134;HEAP[r55]=2;HEAP[r56]=HEAP[HEAP[r53]+4|0]+(HEAP[HEAP[r53]|0]*24&-1)-24|0;HEAP[(HEAP[r55]<<2)+HEAP[HEAP[r56]+8|0]|0]=HEAP[r54];r134=_grid_get_dot(r143,r129,-(r139<<1)+r132+r2|0,-(r140<<1)+r127+r136|0);HEAP[r45]=r143;HEAP[r46]=r134;HEAP[r47]=3;HEAP[r48]=HEAP[HEAP[r45]+4|0]+(HEAP[HEAP[r45]|0]*24&-1)-24|0;HEAP[(HEAP[r47]<<2)+HEAP[HEAP[r48]+8|0]|0]=HEAP[r46];r134=_grid_get_dot(r143,r129,r132-(r139<<1)|0,r127-(r140<<1)|0);HEAP[r37]=r143;HEAP[r38]=r134;HEAP[r39]=4;HEAP[r40]=HEAP[HEAP[r37]+4|0]+(HEAP[HEAP[r37]|0]*24&-1)-24|0;HEAP[(HEAP[r39]<<2)+HEAP[HEAP[r40]+8|0]|0]=HEAP[r38];_grid_face_add_new(r143,5);r134=_grid_get_dot(r143,r129,r132,r127);HEAP[r29]=r143;HEAP[r30]=r134;HEAP[r31]=0;HEAP[r32]=HEAP[HEAP[r29]+4|0]+(HEAP[HEAP[r29]|0]*24&-1)-24|0;HEAP[(HEAP[r31]<<2)+HEAP[HEAP[r32]+8|0]|0]=HEAP[r30];r134=_grid_get_dot(r143,r129,r132-(r139<<1)|0,r127-(r140<<1)|0);HEAP[r21]=r143;HEAP[r22]=r134;HEAP[r23]=1;HEAP[r24]=HEAP[HEAP[r21]+4|0]+(HEAP[HEAP[r21]|0]*24&-1)-24|0;HEAP[(HEAP[r23]<<2)+HEAP[HEAP[r24]+8|0]|0]=HEAP[r22];r134=_grid_get_dot(r143,r129,-(r139<<1)+r132+ -r137|0,-(r140<<1)+r127+ -r138|0);HEAP[r13]=r143;HEAP[r14]=r134;HEAP[r15]=2;HEAP[r16]=HEAP[HEAP[r13]+4|0]+(HEAP[HEAP[r13]|0]*24&-1)-24|0;HEAP[(HEAP[r15]<<2)+HEAP[HEAP[r16]+8|0]|0]=HEAP[r14];r134=_grid_get_dot(r143,r129,-(r137<<1)+r132+ -r139|0,-(r138<<1)+r127+ -r140|0);HEAP[r9]=r143;HEAP[r10]=r134;HEAP[r11]=3;HEAP[r12]=HEAP[HEAP[r9]+4|0]+(HEAP[HEAP[r9]|0]*24&-1)-24|0;HEAP[(HEAP[r11]<<2)+HEAP[HEAP[r12]+8|0]|0]=HEAP[r10];r134=_grid_get_dot(r143,r129,r132-(r137<<1)|0,r127-(r138<<1)|0);HEAP[r5]=r143;HEAP[r6]=r134;HEAP[r7]=4;HEAP[r8]=HEAP[HEAP[r5]+4|0]+(HEAP[HEAP[r5]|0]*24&-1)-24|0;HEAP[(HEAP[r7]<<2)+HEAP[HEAP[r8]+8|0]|0]=HEAP[r6];_grid_face_add_new(r143,5);r134=_grid_get_dot(r143,r129,r132,r127);HEAP[r17]=r143;HEAP[r18]=r134;HEAP[r19]=0;HEAP[r20]=HEAP[HEAP[r17]+4|0]+(HEAP[HEAP[r17]|0]*24&-1)-24|0;HEAP[(HEAP[r19]<<2)+HEAP[HEAP[r20]+8|0]|0]=HEAP[r18];r134=_grid_get_dot(r143,r129,r132-(r137<<1)|0,r127-(r138<<1)|0);HEAP[r25]=r143;HEAP[r26]=r134;HEAP[r27]=1;HEAP[r28]=HEAP[HEAP[r25]+4|0]+(HEAP[HEAP[r25]|0]*24&-1)-24|0;HEAP[(HEAP[r27]<<2)+HEAP[HEAP[r28]+8|0]|0]=HEAP[r26];r134=_grid_get_dot(r143,r129,-(r137<<1)+r132+ -r2|0,-(r138<<1)+r127+ -r136|0);HEAP[r33]=r143;HEAP[r34]=r134;HEAP[r35]=2;HEAP[r36]=HEAP[HEAP[r33]+4|0]+(HEAP[HEAP[r33]|0]*24&-1)-24|0;HEAP[(HEAP[r35]<<2)+HEAP[HEAP[r36]+8|0]|0]=HEAP[r34];r134=_grid_get_dot(r143,r129,-(r2<<1)+r132+ -r137|0,-(r136<<1)+r127+ -r138|0);HEAP[r41]=r143;HEAP[r42]=r134;HEAP[r43]=3;HEAP[r44]=HEAP[HEAP[r41]+4|0]+(HEAP[HEAP[r41]|0]*24&-1)-24|0;HEAP[(HEAP[r43]<<2)+HEAP[HEAP[r44]+8|0]|0]=HEAP[r42];r134=_grid_get_dot(r143,r129,r132-(r2<<1)|0,r127-(r136<<1)|0);HEAP[r49]=r143;HEAP[r50]=r134;HEAP[r51]=4;HEAP[r52]=HEAP[HEAP[r49]+4|0]+(HEAP[HEAP[r49]|0]*24&-1)-24|0;HEAP[(HEAP[r51]<<2)+HEAP[HEAP[r52]+8|0]|0]=HEAP[r50];_grid_face_add_new(r143,5);r134=_grid_get_dot(r143,r129,r132,r127);HEAP[r61]=r143;HEAP[r62]=r134;HEAP[r63]=0;HEAP[r64]=HEAP[HEAP[r61]+4|0]+(HEAP[HEAP[r61]|0]*24&-1)-24|0;HEAP[(HEAP[r63]<<2)+HEAP[HEAP[r64]+8|0]|0]=HEAP[r62];r134=_grid_get_dot(r143,r129,r132-(r2<<1)|0,r127-(r136<<1)|0);HEAP[r69]=r143;HEAP[r70]=r134;HEAP[r71]=1;HEAP[r72]=HEAP[HEAP[r69]+4|0]+(HEAP[HEAP[r69]|0]*24&-1)-24|0;HEAP[(HEAP[r71]<<2)+HEAP[HEAP[r72]+8|0]|0]=HEAP[r70];r134=_grid_get_dot(r143,r129,-(r2<<1)+r132+r139|0,-(r136<<1)+r127+r140|0);HEAP[r77]=r143;HEAP[r78]=r134;HEAP[r79]=2;HEAP[r80]=HEAP[HEAP[r77]+4|0]+(HEAP[HEAP[r77]|0]*24&-1)-24|0;HEAP[(HEAP[r79]<<2)+HEAP[HEAP[r80]+8|0]|0]=HEAP[r78];r134=_grid_get_dot(r143,r129,(r139<<1)+r132+ -r2|0,(r140<<1)+r127+ -r136|0);HEAP[r85]=r143;HEAP[r86]=r134;HEAP[r87]=3;HEAP[r88]=HEAP[HEAP[r85]+4|0]+(HEAP[HEAP[r85]|0]*24&-1)-24|0;HEAP[(HEAP[r87]<<2)+HEAP[HEAP[r88]+8|0]|0]=HEAP[r86];r134=_grid_get_dot(r143,r129,(r139<<1)+r132|0,(r140<<1)+r127|0);HEAP[r93]=r143;HEAP[r94]=r134;HEAP[r95]=4;HEAP[r96]=HEAP[HEAP[r93]+4|0]+(HEAP[HEAP[r93]|0]*24&-1)-24|0;HEAP[(HEAP[r95]<<2)+HEAP[HEAP[r96]+8|0]|0]=HEAP[r94]}r128=r128+1|0;if((r128|0)>=(r135|0)){break L179}}}}while(0);r130=r130+1|0;if((r130|0)>=(r1|0)){break L175}}}}while(0);HEAP[r106]=r129;_freenode234(HEAP[HEAP[r106]|0]);r129=HEAP[r106];HEAP[r105]=r129;if((r129|0)!=0){_free(HEAP[r105])}if(!((HEAP[r143|0]|0)<=(r141|0))){___assert_func(36728,2265,37804,34328)}if((HEAP[r143+16|0]|0)<=(r142|0)){r145=r143;_grid_make_consistent(r145);r146=r143;STACKTOP=r4;return r146}___assert_func(36728,2266,37804,34068);r145=r143;_grid_make_consistent(r145);r146=r143;STACKTOP=r4;return r146}function _grid_new_dodecagonal(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96;r3=STACKTOP;STACKTOP=STACKTOP+328|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r3+100;r30=r3+104;r31=r3+108;r32=r3+112;r33=r3+116;r34=r3+120;r35=r3+124;r36=r3+128;r37=r3+132;r38=r3+136;r39=r3+140;r40=r3+144;r41=r3+148;r42=r3+152;r43=r3+156;r44=r3+160;r45=r3+164;r46=r3+168;r47=r3+172;r48=r3+176;r49=r3+180;r50=r3+184;r51=r3+188;r52=r3+192;r53=r3+196;r54=r3+200;r55=r3+204;r56=r3+208;r57=r3+212;r58=r3+216;r59=r3+220;r60=r3+224;r61=r3+228;r62=r3+232;r63=r3+236;r64=r3+240;r65=r3+244;r66=r3+248;r67=r3+252;r68=r3+256;r69=r3+260;r70=r3+264;r71=r3+268;r72=r3+272;r73=r3+276;r74=r3+280;r75=r3+284;r76=r3+288;r77=r3+292;r78=r3+296;r79=r3+300;r80=r3+304;r81=r3+308;r82=r3+312;r83=r3+316;r84=r3+320;r85=r3+324;r86=r1;r1=r2;r2=15;r87=26;r88=Math.imul(r86*3&-1,r1);r89=Math.imul(r86*14&-1,r1);r90=_grid_empty();HEAP[r90+40|0]=26;HEAP[r84]=r88*24&-1;r91=_malloc(HEAP[r84]);HEAP[r85]=r91;if((HEAP[r85]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r90+4|0]=HEAP[r85];HEAP[r82]=r89*20&-1;r85=_malloc(HEAP[r82]);HEAP[r83]=r85;if((HEAP[r83]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r90+20|0]=HEAP[r83];HEAP[r80]=12;HEAP[r78]=8;r83=_malloc(HEAP[r78]);HEAP[r79]=r83;if((HEAP[r79]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r81]=HEAP[r79];HEAP[HEAP[r81]|0]=0;HEAP[HEAP[r81]+4|0]=HEAP[r80];r80=HEAP[r81];r81=0;L211:do{if((r81|0)<(r1|0)){while(1){r79=0;L215:do{if((r79|0)<(r86|0)){while(1){r83=Math.imul((r2<<2)+(r87<<1)|0,r79);r78=Math.imul((r87<<1)+(r2*3&-1)|0,r81);if(((r81|0)%2|0)!=0){r83=(r2<<1)+r87+r83|0}_grid_face_add_new(r90,12);r85=_grid_get_dot(r90,r80,r2+r83|0,-r87+r78+ -(r2<<1)|0);HEAP[r74]=r90;HEAP[r75]=r85;HEAP[r76]=0;HEAP[r77]=HEAP[HEAP[r74]+4|0]+(HEAP[HEAP[r74]|0]*24&-1)-24|0;HEAP[(HEAP[r76]<<2)+HEAP[HEAP[r77]+8|0]|0]=HEAP[r75];r85=_grid_get_dot(r90,r80,r2+r83+r87|0,-r2+r78+ -r87|0);HEAP[r70]=r90;HEAP[r71]=r85;HEAP[r72]=1;HEAP[r73]=HEAP[HEAP[r70]+4|0]+(HEAP[HEAP[r70]|0]*24&-1)-24|0;HEAP[(HEAP[r72]<<2)+HEAP[HEAP[r73]+8|0]|0]=HEAP[r71];r85=_grid_get_dot(r90,r80,(r2<<1)+r87+r83|0,r78-r2|0);HEAP[r66]=r90;HEAP[r67]=r85;HEAP[r68]=2;HEAP[r69]=HEAP[HEAP[r66]+4|0]+(HEAP[HEAP[r66]|0]*24&-1)-24|0;HEAP[(HEAP[r68]<<2)+HEAP[HEAP[r69]+8|0]|0]=HEAP[r67];r85=_grid_get_dot(r90,r80,(r2<<1)+r87+r83|0,r2+r78|0);HEAP[r62]=r90;HEAP[r63]=r85;HEAP[r64]=3;HEAP[r65]=HEAP[HEAP[r62]+4|0]+(HEAP[HEAP[r62]|0]*24&-1)-24|0;HEAP[(HEAP[r64]<<2)+HEAP[HEAP[r65]+8|0]|0]=HEAP[r63];r85=_grid_get_dot(r90,r80,r2+r83+r87|0,r2+r78+r87|0);HEAP[r58]=r90;HEAP[r59]=r85;HEAP[r60]=4;HEAP[r61]=HEAP[HEAP[r58]+4|0]+(HEAP[HEAP[r58]|0]*24&-1)-24|0;HEAP[(HEAP[r60]<<2)+HEAP[HEAP[r61]+8|0]|0]=HEAP[r59];r85=_grid_get_dot(r90,r80,r2+r83|0,(r2<<1)+r87+r78|0);HEAP[r52]=r90;HEAP[r53]=r85;HEAP[r54]=5;HEAP[r55]=HEAP[HEAP[r52]+4|0]+(HEAP[HEAP[r52]|0]*24&-1)-24|0;HEAP[(HEAP[r54]<<2)+HEAP[HEAP[r55]+8|0]|0]=HEAP[r53];r85=_grid_get_dot(r90,r80,r83-r2|0,(r2<<1)+r87+r78|0);HEAP[r48]=r90;HEAP[r49]=r85;HEAP[r50]=6;HEAP[r51]=HEAP[HEAP[r48]+4|0]+(HEAP[HEAP[r48]|0]*24&-1)-24|0;HEAP[(HEAP[r50]<<2)+HEAP[HEAP[r51]+8|0]|0]=HEAP[r49];r85=_grid_get_dot(r90,r80,-r2+r83+ -r87|0,r2+r78+r87|0);HEAP[r40]=r90;HEAP[r41]=r85;HEAP[r42]=7;HEAP[r43]=HEAP[HEAP[r40]+4|0]+(HEAP[HEAP[r40]|0]*24&-1)-24|0;HEAP[(HEAP[r42]<<2)+HEAP[HEAP[r43]+8|0]|0]=HEAP[r41];r85=_grid_get_dot(r90,r80,-r87+r83+ -(r2<<1)|0,r2+r78|0);HEAP[r32]=r90;HEAP[r33]=r85;HEAP[r34]=8;HEAP[r35]=HEAP[HEAP[r32]+4|0]+(HEAP[HEAP[r32]|0]*24&-1)-24|0;HEAP[(HEAP[r34]<<2)+HEAP[HEAP[r35]+8|0]|0]=HEAP[r33];r85=_grid_get_dot(r90,r80,-r87+r83+ -(r2<<1)|0,r78-r2|0);HEAP[r24]=r90;HEAP[r25]=r85;HEAP[r26]=9;HEAP[r27]=HEAP[HEAP[r24]+4|0]+(HEAP[HEAP[r24]|0]*24&-1)-24|0;HEAP[(HEAP[r26]<<2)+HEAP[HEAP[r27]+8|0]|0]=HEAP[r25];r85=_grid_get_dot(r90,r80,-r2+r83+ -r87|0,-r2+r78+ -r87|0);HEAP[r20]=r90;HEAP[r21]=r85;HEAP[r22]=10;HEAP[r23]=HEAP[HEAP[r20]+4|0]+(HEAP[HEAP[r20]|0]*24&-1)-24|0;HEAP[(HEAP[r22]<<2)+HEAP[HEAP[r23]+8|0]|0]=HEAP[r21];r85=_grid_get_dot(r90,r80,r83-r2|0,-r87+r78+ -(r2<<1)|0);HEAP[r12]=r90;HEAP[r13]=r85;HEAP[r14]=11;HEAP[r15]=HEAP[HEAP[r12]+4|0]+(HEAP[HEAP[r12]|0]*24&-1)-24|0;HEAP[(HEAP[r14]<<2)+HEAP[HEAP[r15]+8|0]|0]=HEAP[r13];r82=r81;do{if((r82|0)<(r1-1|0)){r91=r79;if((r91|0)<(r86-1|0)){r92=r91}else{r91=r81;if(((r91|0)%2|0)!=0){r93=r91;break}r92=r79}if((r92|0)<=0){r91=r81;if(((r91|0)%2|0)==0){r93=r91;break}}_grid_face_add_new(r90,3);r85=_grid_get_dot(r90,r80,r2+r83|0,(r2<<1)+r87+r78|0);HEAP[r4]=r90;HEAP[r5]=r85;HEAP[r6]=0;HEAP[r7]=HEAP[HEAP[r4]+4|0]+(HEAP[HEAP[r4]|0]*24&-1)-24|0;HEAP[(HEAP[r6]<<2)+HEAP[HEAP[r7]+8|0]|0]=HEAP[r5];r85=_grid_get_dot(r90,r80,r83,(r87+r2<<1)+r78|0);HEAP[r8]=r90;HEAP[r9]=r85;HEAP[r10]=1;HEAP[r11]=HEAP[HEAP[r8]+4|0]+(HEAP[HEAP[r8]|0]*24&-1)-24|0;HEAP[(HEAP[r10]<<2)+HEAP[HEAP[r11]+8|0]|0]=HEAP[r9];r85=_grid_get_dot(r90,r80,r83-r2|0,(r2<<1)+r87+r78|0);HEAP[r16]=r90;HEAP[r17]=r85;HEAP[r18]=2;HEAP[r19]=HEAP[HEAP[r16]+4|0]+(HEAP[HEAP[r16]|0]*24&-1)-24|0;HEAP[(HEAP[r18]<<2)+HEAP[HEAP[r19]+8|0]|0]=HEAP[r17];r93=r81}else{r93=r82}}while(0);do{if((r93|0)!=0){r82=r79;if((r82|0)<(r86-1|0)){r94=r82}else{if(((r81|0)%2|0)!=0){break}r94=r79}if((r94|0)<=0){if(((r81|0)%2|0)==0){break}}_grid_face_add_new(r90,3);r85=_grid_get_dot(r90,r80,r83-r2|0,-r87+r78+ -(r2<<1)|0);HEAP[r28]=r90;HEAP[r29]=r85;HEAP[r30]=0;HEAP[r31]=HEAP[HEAP[r28]+4|0]+(HEAP[HEAP[r28]|0]*24&-1)-24|0;HEAP[(HEAP[r30]<<2)+HEAP[HEAP[r31]+8|0]|0]=HEAP[r29];r85=_grid_get_dot(r90,r80,r83,-(r2<<1)+r78+ -(r87<<1)|0);HEAP[r36]=r90;HEAP[r37]=r85;HEAP[r38]=1;HEAP[r39]=HEAP[HEAP[r36]+4|0]+(HEAP[HEAP[r36]|0]*24&-1)-24|0;HEAP[(HEAP[r38]<<2)+HEAP[HEAP[r39]+8|0]|0]=HEAP[r37];r85=_grid_get_dot(r90,r80,r2+r83|0,-r87+r78+ -(r2<<1)|0);HEAP[r44]=r90;HEAP[r45]=r85;HEAP[r46]=2;HEAP[r47]=HEAP[HEAP[r44]+4|0]+(HEAP[HEAP[r44]|0]*24&-1)-24|0;HEAP[(HEAP[r46]<<2)+HEAP[HEAP[r47]+8|0]|0]=HEAP[r45]}}while(0);r79=r79+1|0;if((r79|0)>=(r86|0)){break L215}}}}while(0);r81=r81+1|0;if((r81|0)>=(r1|0)){break L211}}}}while(0);HEAP[r57]=r80;_freenode234(HEAP[HEAP[r57]|0]);r80=HEAP[r57];HEAP[r56]=r80;if((r80|0)!=0){_free(HEAP[r56])}if(!((HEAP[r90|0]|0)<=(r88|0))){___assert_func(36728,2351,37820,34328)}if((HEAP[r90+16|0]|0)<=(r89|0)){r95=r90;_grid_make_consistent(r95);r96=r90;STACKTOP=r3;return r96}___assert_func(36728,2352,37820,34068);r95=r90;_grid_make_consistent(r95);r96=r90;STACKTOP=r3;return r96}function _grid_new_greatdodecagonal(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+616|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r4+24;r12=r4+28;r13=r4+32;r14=r4+36;r15=r4+40;r16=r4+44;r17=r4+48;r18=r4+52;r19=r4+56;r20=r4+60;r21=r4+64;r22=r4+68;r23=r4+72;r24=r4+76;r25=r4+80;r26=r4+84;r27=r4+88;r28=r4+92;r29=r4+96;r30=r4+100;r31=r4+104;r32=r4+108;r33=r4+112;r34=r4+116;r35=r4+120;r36=r4+124;r37=r4+128;r38=r4+132;r39=r4+136;r40=r4+140;r41=r4+144;r42=r4+148;r43=r4+152;r44=r4+156;r45=r4+160;r46=r4+164;r47=r4+168;r48=r4+172;r49=r4+176;r50=r4+180;r51=r4+184;r52=r4+188;r53=r4+192;r54=r4+196;r55=r4+200;r56=r4+204;r57=r4+208;r58=r4+212;r59=r4+216;r60=r4+220;r61=r4+224;r62=r4+228;r63=r4+232;r64=r4+236;r65=r4+240;r66=r4+244;r67=r4+248;r68=r4+252;r69=r4+256;r70=r4+260;r71=r4+264;r72=r4+268;r73=r4+272;r74=r4+276;r75=r4+280;r76=r4+284;r77=r4+288;r78=r4+292;r79=r4+296;r80=r4+300;r81=r4+304;r82=r4+308;r83=r4+312;r84=r4+316;r85=r4+320;r86=r4+324;r87=r4+328;r88=r4+332;r89=r4+336;r90=r4+340;r91=r4+344;r92=r4+348;r93=r4+352;r94=r4+356;r95=r4+360;r96=r4+364;r97=r4+368;r98=r4+372;r99=r4+376;r100=r4+380;r101=r4+384;r102=r4+388;r103=r4+392;r104=r4+396;r105=r4+400;r106=r4+404;r107=r4+408;r108=r4+412;r109=r4+416;r110=r4+420;r111=r4+424;r112=r4+428;r113=r4+432;r114=r4+436;r115=r4+440;r116=r4+444;r117=r4+448;r118=r4+452;r119=r4+456;r120=r4+460;r121=r4+464;r122=r4+468;r123=r4+472;r124=r4+476;r125=r4+480;r126=r4+484;r127=r4+488;r128=r4+492;r129=r4+496;r130=r4+500;r131=r4+504;r132=r4+508;r133=r4+512;r134=r4+516;r135=r4+520;r136=r4+524;r137=r4+528;r138=r4+532;r139=r4+536;r140=r4+540;r141=r4+544;r142=r4+548;r143=r4+552;r144=r4+556;r145=r4+560;r146=r4+564;r147=r4+568;r148=r4+572;r149=r4+576;r150=r4+580;r151=r4+584;r152=r4+588;r153=r4+592;r154=r4+596;r155=r4+600;r156=r4+604;r157=r4+608;r158=r4+612;r159=r1;r1=r2;r2=15;r160=26;r161=Math.imul(r159*30&-1,r1);r162=Math.imul(r159*200&-1,r1);r163=_grid_empty();HEAP[r163+40|0]=26;HEAP[r157]=r161*24&-1;r164=_malloc(HEAP[r157]);HEAP[r158]=r164;if((HEAP[r158]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r163+4|0]=HEAP[r158];HEAP[r155]=r162*20&-1;r158=_malloc(HEAP[r155]);HEAP[r156]=r158;if((HEAP[r156]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r163+20|0]=HEAP[r156];HEAP[r153]=12;HEAP[r151]=8;r156=_malloc(HEAP[r151]);HEAP[r152]=r156;if((HEAP[r152]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r154]=HEAP[r152];HEAP[HEAP[r154]|0]=0;HEAP[HEAP[r154]+4|0]=HEAP[r153];r153=HEAP[r154];r154=0;L263:do{if((r154|0)<(r1|0)){while(1){r152=0;L267:do{if((r152|0)<(r159|0)){while(1){r156=Math.imul((r160<<1)+(r2*6&-1)|0,r152);r151=Math.imul((r160+r2)*3&-1,r154);if(((r154|0)%2|0)!=0){r156=(r2*3&-1)+r160+r156|0}_grid_face_add_new(r163,12);r158=_grid_get_dot(r163,r153,r2+r156|0,-r160+r151+ -(r2<<1)|0);HEAP[r147]=r163;HEAP[r148]=r158;HEAP[r149]=0;HEAP[r150]=HEAP[HEAP[r147]+4|0]+(HEAP[HEAP[r147]|0]*24&-1)-24|0;HEAP[(HEAP[r149]<<2)+HEAP[HEAP[r150]+8|0]|0]=HEAP[r148];r158=_grid_get_dot(r163,r153,r2+r156+r160|0,-r2+r151+ -r160|0);HEAP[r143]=r163;HEAP[r144]=r158;HEAP[r145]=1;HEAP[r146]=HEAP[HEAP[r143]+4|0]+(HEAP[HEAP[r143]|0]*24&-1)-24|0;HEAP[(HEAP[r145]<<2)+HEAP[HEAP[r146]+8|0]|0]=HEAP[r144];r158=_grid_get_dot(r163,r153,(r2<<1)+r160+r156|0,r151-r2|0);HEAP[r139]=r163;HEAP[r140]=r158;HEAP[r141]=2;HEAP[r142]=HEAP[HEAP[r139]+4|0]+(HEAP[HEAP[r139]|0]*24&-1)-24|0;HEAP[(HEAP[r141]<<2)+HEAP[HEAP[r142]+8|0]|0]=HEAP[r140];r158=_grid_get_dot(r163,r153,(r2<<1)+r160+r156|0,r2+r151|0);HEAP[r135]=r163;HEAP[r136]=r158;HEAP[r137]=3;HEAP[r138]=HEAP[HEAP[r135]+4|0]+(HEAP[HEAP[r135]|0]*24&-1)-24|0;HEAP[(HEAP[r137]<<2)+HEAP[HEAP[r138]+8|0]|0]=HEAP[r136];r158=_grid_get_dot(r163,r153,r2+r156+r160|0,r2+r151+r160|0);HEAP[r131]=r163;HEAP[r132]=r158;HEAP[r133]=4;HEAP[r134]=HEAP[HEAP[r131]+4|0]+(HEAP[HEAP[r131]|0]*24&-1)-24|0;HEAP[(HEAP[r133]<<2)+HEAP[HEAP[r134]+8|0]|0]=HEAP[r132];r158=_grid_get_dot(r163,r153,r2+r156|0,(r2<<1)+r160+r151|0);HEAP[r125]=r163;HEAP[r126]=r158;HEAP[r127]=5;HEAP[r128]=HEAP[HEAP[r125]+4|0]+(HEAP[HEAP[r125]|0]*24&-1)-24|0;HEAP[(HEAP[r127]<<2)+HEAP[HEAP[r128]+8|0]|0]=HEAP[r126];r158=_grid_get_dot(r163,r153,r156-r2|0,(r2<<1)+r160+r151|0);HEAP[r121]=r163;HEAP[r122]=r158;HEAP[r123]=6;HEAP[r124]=HEAP[HEAP[r121]+4|0]+(HEAP[HEAP[r121]|0]*24&-1)-24|0;HEAP[(HEAP[r123]<<2)+HEAP[HEAP[r124]+8|0]|0]=HEAP[r122];r158=_grid_get_dot(r163,r153,-r2+r156+ -r160|0,r2+r151+r160|0);HEAP[r113]=r163;HEAP[r114]=r158;HEAP[r115]=7;HEAP[r116]=HEAP[HEAP[r113]+4|0]+(HEAP[HEAP[r113]|0]*24&-1)-24|0;HEAP[(HEAP[r115]<<2)+HEAP[HEAP[r116]+8|0]|0]=HEAP[r114];r158=_grid_get_dot(r163,r153,-r160+r156+ -(r2<<1)|0,r2+r151|0);HEAP[r105]=r163;HEAP[r106]=r158;HEAP[r107]=8;HEAP[r108]=HEAP[HEAP[r105]+4|0]+(HEAP[HEAP[r105]|0]*24&-1)-24|0;HEAP[(HEAP[r107]<<2)+HEAP[HEAP[r108]+8|0]|0]=HEAP[r106];r158=_grid_get_dot(r163,r153,-r160+r156+ -(r2<<1)|0,r151-r2|0);HEAP[r97]=r163;HEAP[r98]=r158;HEAP[r99]=9;HEAP[r100]=HEAP[HEAP[r97]+4|0]+(HEAP[HEAP[r97]|0]*24&-1)-24|0;HEAP[(HEAP[r99]<<2)+HEAP[HEAP[r100]+8|0]|0]=HEAP[r98];r158=_grid_get_dot(r163,r153,-r2+r156+ -r160|0,-r2+r151+ -r160|0);HEAP[r89]=r163;HEAP[r90]=r158;HEAP[r91]=10;HEAP[r92]=HEAP[HEAP[r89]+4|0]+(HEAP[HEAP[r89]|0]*24&-1)-24|0;HEAP[(HEAP[r91]<<2)+HEAP[HEAP[r92]+8|0]|0]=HEAP[r90];r158=_grid_get_dot(r163,r153,r156-r2|0,-r160+r151+ -(r2<<1)|0);HEAP[r85]=r163;HEAP[r86]=r158;HEAP[r87]=11;HEAP[r88]=HEAP[HEAP[r85]+4|0]+(HEAP[HEAP[r85]|0]*24&-1)-24|0;HEAP[(HEAP[r87]<<2)+HEAP[HEAP[r88]+8|0]|0]=HEAP[r86];r155=r154;do{if((r155|0)<(r1-1|0)){r164=r152;if((r164|0)<(r159-1|0)){r165=r164}else{r164=r154;if(((r164|0)%2|0)!=0){r166=r164;break}r165=r152}if((r165|0)<=0){r164=r154;if(((r164|0)%2|0)==0){r166=r164;break}}_grid_face_add_new(r163,6);r158=_grid_get_dot(r163,r153,r2+r156|0,(r2<<1)+r160+r151|0);HEAP[r77]=r163;HEAP[r78]=r158;HEAP[r79]=0;HEAP[r80]=HEAP[HEAP[r77]+4|0]+(HEAP[HEAP[r77]|0]*24&-1)-24|0;HEAP[(HEAP[r79]<<2)+HEAP[HEAP[r80]+8|0]|0]=HEAP[r78];r158=_grid_get_dot(r163,r153,(r2<<1)+r156|0,(r160+r2<<1)+r151|0);HEAP[r69]=r163;HEAP[r70]=r158;HEAP[r71]=1;HEAP[r72]=HEAP[HEAP[r69]+4|0]+(HEAP[HEAP[r69]|0]*24&-1)-24|0;HEAP[(HEAP[r71]<<2)+HEAP[HEAP[r72]+8|0]|0]=HEAP[r70];r158=_grid_get_dot(r163,r153,r2+r156|0,(r2<<1)+r151+(r160*3&-1)|0);HEAP[r61]=r163;HEAP[r62]=r158;HEAP[r63]=2;HEAP[r64]=HEAP[HEAP[r61]+4|0]+(HEAP[HEAP[r61]|0]*24&-1)-24|0;HEAP[(HEAP[r63]<<2)+HEAP[HEAP[r64]+8|0]|0]=HEAP[r62];r158=_grid_get_dot(r163,r153,r156-r2|0,(r2<<1)+r151+(r160*3&-1)|0);HEAP[r53]=r163;HEAP[r54]=r158;HEAP[r55]=3;HEAP[r56]=HEAP[HEAP[r53]+4|0]+(HEAP[HEAP[r53]|0]*24&-1)-24|0;HEAP[(HEAP[r55]<<2)+HEAP[HEAP[r56]+8|0]|0]=HEAP[r54];r158=_grid_get_dot(r163,r153,r156-(r2<<1)|0,(r160+r2<<1)+r151|0);HEAP[r49]=r163;HEAP[r50]=r158;HEAP[r51]=4;HEAP[r52]=HEAP[HEAP[r49]+4|0]+(HEAP[HEAP[r49]|0]*24&-1)-24|0;HEAP[(HEAP[r51]<<2)+HEAP[HEAP[r52]+8|0]|0]=HEAP[r50];r158=_grid_get_dot(r163,r153,r156-r2|0,(r2<<1)+r160+r151|0);HEAP[r41]=r163;HEAP[r42]=r158;HEAP[r43]=5;HEAP[r44]=HEAP[HEAP[r41]+4|0]+(HEAP[HEAP[r41]|0]*24&-1)-24|0;HEAP[(HEAP[r43]<<2)+HEAP[HEAP[r44]+8|0]|0]=HEAP[r42];r166=r154}else{r166=r155}}while(0);do{if((r166|0)!=0){r155=r152;if((r155|0)<(r159-1|0)){r167=r155}else{if(((r154|0)%2|0)!=0){break}r167=r152}if((r167|0)<=0){if(((r154|0)%2|0)==0){break}}_grid_face_add_new(r163,6);r158=_grid_get_dot(r163,r153,r156-r2|0,-r160+r151+ -(r2<<1)|0);HEAP[r33]=r163;HEAP[r34]=r158;HEAP[r35]=0;HEAP[r36]=HEAP[HEAP[r33]+4|0]+(HEAP[HEAP[r33]|0]*24&-1)-24|0;HEAP[(HEAP[r35]<<2)+HEAP[HEAP[r36]+8|0]|0]=HEAP[r34];r158=_grid_get_dot(r163,r153,r156-(r2<<1)|0,-(r2<<1)+r151+ -(r160<<1)|0);HEAP[r25]=r163;HEAP[r26]=r158;HEAP[r27]=1;HEAP[r28]=HEAP[HEAP[r25]+4|0]+(HEAP[HEAP[r25]|0]*24&-1)-24|0;HEAP[(HEAP[r27]<<2)+HEAP[HEAP[r28]+8|0]|0]=HEAP[r26];r158=_grid_get_dot(r163,r153,r156-r2|0,-(r2<<1)+r151+ -(r160*3&-1)|0);HEAP[r17]=r163;HEAP[r18]=r158;HEAP[r19]=2;HEAP[r20]=HEAP[HEAP[r17]+4|0]+(HEAP[HEAP[r17]|0]*24&-1)-24|0;HEAP[(HEAP[r19]<<2)+HEAP[HEAP[r20]+8|0]|0]=HEAP[r18];r158=_grid_get_dot(r163,r153,r2+r156|0,-(r2<<1)+r151+ -(r160*3&-1)|0);HEAP[r13]=r163;HEAP[r14]=r158;HEAP[r15]=3;HEAP[r16]=HEAP[HEAP[r13]+4|0]+(HEAP[HEAP[r13]|0]*24&-1)-24|0;HEAP[(HEAP[r15]<<2)+HEAP[HEAP[r16]+8|0]|0]=HEAP[r14];r158=_grid_get_dot(r163,r153,(r2<<1)+r156|0,-(r2<<1)+r151+ -(r160<<1)|0);HEAP[r5]=r163;HEAP[r6]=r158;HEAP[r7]=4;HEAP[r8]=HEAP[HEAP[r5]+4|0]+(HEAP[HEAP[r5]|0]*24&-1)-24|0;HEAP[(HEAP[r7]<<2)+HEAP[HEAP[r8]+8|0]|0]=HEAP[r6];r158=_grid_get_dot(r163,r153,r2+r156|0,-r160+r151+ -(r2<<1)|0);HEAP[r9]=r163;HEAP[r10]=r158;HEAP[r11]=5;HEAP[r12]=HEAP[HEAP[r9]+4|0]+(HEAP[HEAP[r9]|0]*24&-1)-24|0;HEAP[(HEAP[r11]<<2)+HEAP[HEAP[r12]+8|0]|0]=HEAP[r10]}}while(0);if((r152|0)<(r159-1|0)){_grid_face_add_new(r163,4);r158=_grid_get_dot(r163,r153,(r2<<1)+r156+r160|0,r151-r2|0);HEAP[r21]=r163;HEAP[r22]=r158;HEAP[r23]=0;HEAP[r24]=HEAP[HEAP[r21]+4|0]+(HEAP[HEAP[r21]|0]*24&-1)-24|0;HEAP[(HEAP[r23]<<2)+HEAP[HEAP[r24]+8|0]|0]=HEAP[r22];r158=_grid_get_dot(r163,r153,(r2<<2)+r156+r160|0,r151-r2|0);HEAP[r29]=r163;HEAP[r30]=r158;HEAP[r31]=1;HEAP[r32]=HEAP[HEAP[r29]+4|0]+(HEAP[HEAP[r29]|0]*24&-1)-24|0;HEAP[(HEAP[r31]<<2)+HEAP[HEAP[r32]+8|0]|0]=HEAP[r30];r158=_grid_get_dot(r163,r153,(r2<<2)+r156+r160|0,r2+r151|0);HEAP[r37]=r163;HEAP[r38]=r158;HEAP[r39]=2;HEAP[r40]=HEAP[HEAP[r37]+4|0]+(HEAP[HEAP[r37]|0]*24&-1)-24|0;HEAP[(HEAP[r39]<<2)+HEAP[HEAP[r40]+8|0]|0]=HEAP[r38];r158=_grid_get_dot(r163,r153,(r2<<1)+r156+r160|0,r2+r151|0);HEAP[r45]=r163;HEAP[r46]=r158;HEAP[r47]=3;HEAP[r48]=HEAP[HEAP[r45]+4|0]+(HEAP[HEAP[r45]|0]*24&-1)-24|0;HEAP[(HEAP[r47]<<2)+HEAP[HEAP[r48]+8|0]|0]=HEAP[r46]}do{if((r154|0)!=0){do{if((r152|0)<(r159-1|0)){r3=205}else{r155=r154;if(((r155|0)%2|0)!=0){r168=r155;break}else{r3=205;break}}}while(0);if(r3==205){r3=0;_grid_face_add_new(r163,4);r158=_grid_get_dot(r163,r153,r2+r156|0,-r160+r151+ -(r2<<1)|0);HEAP[r57]=r163;HEAP[r58]=r158;HEAP[r59]=0;HEAP[r60]=HEAP[HEAP[r57]+4|0]+(HEAP[HEAP[r57]|0]*24&-1)-24|0;HEAP[(HEAP[r59]<<2)+HEAP[HEAP[r60]+8|0]|0]=HEAP[r58];r158=_grid_get_dot(r163,r153,(r2<<1)+r156|0,-(r2<<1)+r151+ -(r160<<1)|0);HEAP[r65]=r163;HEAP[r66]=r158;HEAP[r67]=1;HEAP[r68]=HEAP[HEAP[r65]+4|0]+(HEAP[HEAP[r65]|0]*24&-1)-24|0;HEAP[(HEAP[r67]<<2)+HEAP[HEAP[r68]+8|0]|0]=HEAP[r66];r158=_grid_get_dot(r163,r153,(r2<<1)+r160+r156|0,-r2+r151+ -(r160<<1)|0);HEAP[r73]=r163;HEAP[r74]=r158;HEAP[r75]=2;HEAP[r76]=HEAP[HEAP[r73]+4|0]+(HEAP[HEAP[r73]|0]*24&-1)-24|0;HEAP[(HEAP[r75]<<2)+HEAP[HEAP[r76]+8|0]|0]=HEAP[r74];r158=_grid_get_dot(r163,r153,r2+r156+r160|0,-r2+r151+ -r160|0);HEAP[r81]=r163;HEAP[r82]=r158;HEAP[r83]=3;HEAP[r84]=HEAP[HEAP[r81]+4|0]+(HEAP[HEAP[r81]|0]*24&-1)-24|0;HEAP[(HEAP[r83]<<2)+HEAP[HEAP[r84]+8|0]|0]=HEAP[r82];r168=r154}if((r168|0)==0){break}if((r152|0)==0){if(((r154|0)%2|0)==0){break}}_grid_face_add_new(r163,4);r158=_grid_get_dot(r163,r153,-r2+r156+ -r160|0,-r2+r151+ -r160|0);HEAP[r93]=r163;HEAP[r94]=r158;HEAP[r95]=0;HEAP[r96]=HEAP[HEAP[r93]+4|0]+(HEAP[HEAP[r93]|0]*24&-1)-24|0;HEAP[(HEAP[r95]<<2)+HEAP[HEAP[r96]+8|0]|0]=HEAP[r94];r158=_grid_get_dot(r163,r153,-r160+r156+ -(r2<<1)|0,-r2+r151+ -(r160<<1)|0);HEAP[r101]=r163;HEAP[r102]=r158;HEAP[r103]=1;HEAP[r104]=HEAP[HEAP[r101]+4|0]+(HEAP[HEAP[r101]|0]*24&-1)-24|0;HEAP[(HEAP[r103]<<2)+HEAP[HEAP[r104]+8|0]|0]=HEAP[r102];r158=_grid_get_dot(r163,r153,r156-(r2<<1)|0,-(r2<<1)+r151+ -(r160<<1)|0);HEAP[r109]=r163;HEAP[r110]=r158;HEAP[r111]=2;HEAP[r112]=HEAP[HEAP[r109]+4|0]+(HEAP[HEAP[r109]|0]*24&-1)-24|0;HEAP[(HEAP[r111]<<2)+HEAP[HEAP[r112]+8|0]|0]=HEAP[r110];r158=_grid_get_dot(r163,r153,r156-r2|0,-r160+r151+ -(r2<<1)|0);HEAP[r117]=r163;HEAP[r118]=r158;HEAP[r119]=3;HEAP[r120]=HEAP[HEAP[r117]+4|0]+(HEAP[HEAP[r117]|0]*24&-1)-24|0;HEAP[(HEAP[r119]<<2)+HEAP[HEAP[r120]+8|0]|0]=HEAP[r118]}}while(0);r152=r152+1|0;if((r152|0)>=(r159|0)){break L267}}}}while(0);r154=r154+1|0;if((r154|0)>=(r1|0)){break L263}}}}while(0);HEAP[r130]=r153;_freenode234(HEAP[HEAP[r130]|0]);r153=HEAP[r130];HEAP[r129]=r153;if((r153|0)!=0){_free(HEAP[r129])}if(!((HEAP[r163|0]|0)<=(r161|0))){___assert_func(36728,2465,37776,34328)}if((HEAP[r163+16|0]|0)<=(r162|0)){r169=r163;_grid_make_consistent(r169);r170=r163;STACKTOP=r4;return r170}___assert_func(36728,2466,37776,34068);r169=r163;_grid_make_consistent(r169);r170=r163;STACKTOP=r4;return r170}function _grid_new_penrose_p2_kite(r1,r2,r3){return _grid_new_penrose(r1,r2,0,r3)}function _grid_new_penrose_p3_thick(r1,r2,r3){return _grid_new_penrose(r1,r2,1,r3)}function _grid_new_penrose(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187,r188,r189,r190,r191,r192;r5=STACKTOP;STACKTOP=STACKTOP+508|0;r6=r5;r7=r5+4;r8=r5+8;r9=r5+12;r10=r5+16;r11=r5+20;r12=r5+24;r13=r5+28;r14=r5+32;r15=r5+36;r16=r5+40;r17=r5+44;r18=r5+48;r19=r5+52;r20=r5+56;r21=r5+60;r22=r5+64;r23=r5+68;r24=r5+72;r25=r5+76;r26=r5+80;r27=r5+84;r28=r5+88;r29=r5+92;r30=r5+96;r31=r5+100;r32=r5+104;r33=r5+108;r34=r5+112;r35=r5+116;r36=r5+120;r37=r5+124;r38=r5+128;r39=r5+132;r40=r5+136;r41=r5+140;r42=r5+144;r43=r5+148;r44=r5+152;r45=r5+156;r46=r5+160;r47=r5+164;r48=r5+168;r49=r5+172;r50=r5+176;r51=r5+180;r52=r5+184;r53=r5+188;r54=r5+192;r55=r5+196;r56=r5+200;r57=r5+204;r58=r5+208;r59=r5+224;r60=r5+240;r61=r5+256;r62=r5+272;r63=r5+288;r64=r5+304;r65=r5+308;r66=r5+312;r67=r5+316;r68=r5+320;r69=r5+336;r70=r5+352;r71=r5+368;r72=r5+384;r73=r5+400;r74=r5+416;r75=r5+420;r76=r5+424;r77=r5+428;r78=r5+432;r79=r5+436;r80=r5+440;r81=r5+444;r82=r5+448;r83=r5+452;r84=r5+456;r85=r5+468;r86=r5+484;r87=r1;r1=r2;r2=r3;r3=r4;r4=100;_penrose_calculate_size(r2,r4,r87,r1,r5+460,r85|0,r85+4|0);HEAP[r85+8|0]=50;HEAP[r85+12|0]=r86;r88=Math.imul(r87*9&-1,r1);r89=r88<<2;r90=_grid_empty();HEAP[r90+40|0]=r4;HEAP[r80]=r88*24&-1;r91=_malloc(HEAP[r80]);HEAP[r81]=r91;if((HEAP[r81]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r90+4|0]=HEAP[r81];HEAP[r78]=r89*20&-1;r81=_malloc(HEAP[r78]);HEAP[r79]=r81;if((HEAP[r79]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r90+20|0]=HEAP[r79];HEAP[r76]=12;HEAP[r74]=8;r79=_malloc(HEAP[r74]);HEAP[r75]=r79;if((HEAP[r75]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r77]=HEAP[r75];HEAP[HEAP[r77]|0]=0;HEAP[HEAP[r77]+4|0]=HEAP[r76];r76=HEAP[r77];r77=r86;for(r92=r77,r93=r92+24;r92<r93;r92++){HEAP[r92]=0}HEAP[r86+16|0]=r90;HEAP[r86+20|0]=r76;do{if((r3|0)!=0){if((_sscanf(r3,34520,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP[tempInt]=r82,HEAP[tempInt+4]=r83,HEAP[tempInt+8]=r84,tempInt))|0)==3){break}___assert_func(36728,2636,37676,34916)}else{HEAP[r84]=0;HEAP[r83]=0;HEAP[r82]=0}}while(0);r3=Math.imul(r4,r87);r87=Math.imul(r4,r1);HEAP[r86|0]=HEAP[r82]-((r3|0)/2&-1)|0;HEAP[r86+4|0]=((r3|0)/2&-1)+HEAP[r82]|0;HEAP[r86+8|0]=HEAP[r83]-((r87|0)/2&-1)|0;HEAP[r86+12|0]=((r87|0)/2&-1)+HEAP[r83]|0;r83=HEAP[r84];HEAP[r65]=r85;HEAP[r66]=r2;HEAP[r67]=r83;r83=r68;r2=r63;r85=r63|0;for(r92=r85,r93=r92+16;r92<r93;r92++){HEAP[r92]=0}for(r94=r2,r92=r83,r93=r94+16;r94<r93;r94++,r92++){HEAP[r92]=HEAP[r94]}r83=r69;r2=r62;r85=r62|0;for(r92=r85,r93=r92+16;r92<r93;r92++){HEAP[r92]=0}for(r94=r2,r92=r83,r93=r94+16;r94<r93;r94++,r92++){HEAP[r92]=HEAP[r94]}r83=-HEAP[HEAP[r65]|0]|0;HEAP[r68+8|0]=r83;HEAP[r68+4|0]=r83;r83=HEAP[r68+4|0];r2=HEAP[r68+8|0];r85=HEAP[r68+12|0];HEAP[r60|0]=HEAP[r68|0];HEAP[r60+4|0]=r83;HEAP[r60+8|0]=r2;HEAP[r60+12|0]=r85;HEAP[r61|0]=HEAP[r60+4|0]-HEAP[r60+12|0]|0;HEAP[r61+4|0]=HEAP[r60+12|0]+HEAP[r60+8|0]+ -HEAP[r60+4|0]|0;HEAP[r61+8|0]=HEAP[r60+4|0]+HEAP[r60|0]+ -HEAP[r60+8|0]|0;HEAP[r61+12|0]=HEAP[r60+8|0]-HEAP[r60|0]|0;r60=r70;r85=r61;for(r94=r85,r92=r60,r93=r94+16;r94<r93;r94++,r92++){HEAP[r92]=HEAP[r94]}r60=HEAP[r70+4|0];r85=HEAP[r70+8|0];r61=HEAP[r70+12|0];HEAP[r58|0]=HEAP[r70|0];HEAP[r58+4|0]=r60;HEAP[r58+8|0]=r85;HEAP[r58+12|0]=r61;HEAP[r59|0]=HEAP[r58+4|0]-HEAP[r58+12|0]|0;HEAP[r59+4|0]=HEAP[r58+12|0]+HEAP[r58+8|0]+ -HEAP[r58+4|0]|0;HEAP[r59+8|0]=HEAP[r58+4|0]+HEAP[r58|0]+ -HEAP[r58+8|0]|0;HEAP[r59+12|0]=HEAP[r58+8|0]-HEAP[r58|0]|0;r58=r71;r61=r59;for(r94=r61,r92=r58,r93=r94+16;r94<r93;r94++,r92++){HEAP[r92]=HEAP[r94]}r58=r68;r61=r71;for(r94=r61,r92=r58,r93=r94+16;r94<r93;r94++,r92++){HEAP[r92]=HEAP[r94]}HEAP[r69+4|0]=HEAP[HEAP[r65]|0];_v_rotate(r72,HEAP[r68|0],HEAP[r68+4|0],HEAP[r68+8|0],HEAP[r68+12|0],HEAP[r67]);r58=r68;r61=r72;for(r94=r61,r92=r58,r93=r94+16;r94<r93;r94++,r92++){HEAP[r92]=HEAP[r94]}_v_rotate(r73,HEAP[r69|0],HEAP[r69+4|0],HEAP[r69+8|0],HEAP[r69+12|0],HEAP[r67]);r67=r69;r58=r73;for(r94=r58,r92=r67,r93=r94+16;r94<r93;r94++,r92++){HEAP[r92]=HEAP[r94]}r67=HEAP[r65];r65=HEAP[r68|0];r58=HEAP[r68+4|0];r73=HEAP[r68+8|0];r61=HEAP[r68+12|0];r68=HEAP[r69|0];r72=HEAP[r69+4|0];r71=HEAP[r69+8|0];r59=HEAP[r69+12|0];if((HEAP[r66]|0)==0){r66=_penrose_p2_large(r67,0,1,r65,r58,r73,r61,r68,r72,r71,r59);HEAP[r64]=r66}else{r66=_penrose_p3_small(r67,0,1,r65,r58,r73,r61,r68,r72,r71,r59);HEAP[r64]=r66}HEAP[r57]=r76;_freenode234(HEAP[HEAP[r57]|0]);r76=HEAP[r57];HEAP[r56]=r76;if((r76|0)!=0){_free(HEAP[r56])}if(!((HEAP[r90|0]|0)<=(r88|0))){___assert_func(36728,2657,37676,34328)}if(!((HEAP[r90+16|0]|0)<=(r89|0))){___assert_func(36728,2658,37676,34068)}HEAP[r35]=r90;r89=Math.imul(HEAP[HEAP[r35]+16|0]<<2,HEAP[HEAP[r35]+16|0]);HEAP[r33]=r89;r89=_malloc(HEAP[r33]);HEAP[r34]=r89;if((r89|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r36]=HEAP[r34];HEAP[r40]=0;L353:do{if((HEAP[r40]|0)<(HEAP[HEAP[r35]+16|0]|0)){while(1){HEAP[r41]=0;r34=HEAP[r40];L356:do{if((HEAP[r41]|0)<(HEAP[HEAP[r35]+16|0]|0)){r89=r34;while(1){r33=Math.imul(HEAP[HEAP[r35]+16|0],r89);HEAP[(r33+HEAP[r41]<<2)+HEAP[r36]|0]=-1;HEAP[r41]=HEAP[r41]+1|0;r33=HEAP[r40];if((HEAP[r41]|0)<(HEAP[HEAP[r35]+16|0]|0)){r89=r33}else{r95=r33;break L356}}}else{r95=r34}}while(0);HEAP[r40]=r95+1|0;if((HEAP[r40]|0)>=(HEAP[HEAP[r35]+16|0]|0)){break L353}}}}while(0);HEAP[r40]=0;r95=HEAP[r35];L361:do{if((HEAP[r40]|0)<(HEAP[HEAP[r35]|0]|0)){r34=r95;while(1){HEAP[r46]=HEAP[r34+4|0]+(HEAP[r40]*24&-1)|0;HEAP[r47]=(HEAP[(HEAP[HEAP[r46]|0]-1<<2)+HEAP[HEAP[r46]+8|0]|0]-HEAP[HEAP[r35]+20|0]|0)/20&-1;HEAP[r41]=0;L364:do{if((HEAP[r41]|0)<(HEAP[HEAP[r46]|0]|0)){while(1){HEAP[r48]=(HEAP[(HEAP[r41]<<2)+HEAP[HEAP[r46]+8|0]|0]-HEAP[HEAP[r35]+20|0]|0)/20&-1;r89=HEAP[r40];r33=Math.imul(HEAP[HEAP[r35]+16|0],HEAP[r47]);HEAP[(r33+HEAP[r48]<<2)+HEAP[r36]|0]=r89;HEAP[r47]=HEAP[r48];HEAP[r41]=HEAP[r41]+1|0;if((HEAP[r41]|0)>=(HEAP[HEAP[r46]|0]|0)){break L364}}}}while(0);HEAP[r40]=HEAP[r40]+1|0;r89=HEAP[r35];if((HEAP[r40]|0)<(HEAP[HEAP[r35]|0]|0)){r34=r89}else{r96=r89;break L361}}}else{r96=r95}}while(0);HEAP[r31]=HEAP[r96+16|0]<<2;r96=_malloc(HEAP[r31]);HEAP[r32]=r96;if((r96|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r38]=HEAP[r32];HEAP[r40]=0;L372:do{if((HEAP[r40]|0)<(HEAP[HEAP[r35]+16|0]|0)){while(1){HEAP[(HEAP[r40]<<2)+HEAP[r38]|0]=1;HEAP[r41]=0;r32=HEAP[r40];L375:do{if((HEAP[r41]|0)<(HEAP[HEAP[r35]+16|0]|0)){r96=r32;while(1){r31=Math.imul(HEAP[HEAP[r35]+16|0],r96);r95=(HEAP[(r31+HEAP[r41]<<2)+HEAP[r36]|0]|0)>=0&1;r31=Math.imul(HEAP[HEAP[r35]+16|0],HEAP[r41]);if(((HEAP[(r31+HEAP[r40]<<2)+HEAP[r36]|0]|0)>=0&1^r95|0)!=0){HEAP[(HEAP[r40]<<2)+HEAP[r38]|0]=0}HEAP[r41]=HEAP[r41]+1|0;r95=HEAP[r40];if((HEAP[r41]|0)<(HEAP[HEAP[r35]+16|0]|0)){r96=r95}else{r97=r95;break L375}}}else{r97=r32}}while(0);HEAP[r40]=r97+1|0;if((HEAP[r40]|0)>=(HEAP[HEAP[r35]+16|0]|0)){break L372}}}}while(0);HEAP[r29]=HEAP[HEAP[r35]+16|0];HEAP[r27]=HEAP[r29]<<2;r97=_malloc(HEAP[r27]);HEAP[r28]=r97;if((r97|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r30]=HEAP[r28];r28=HEAP[r29];HEAP[r6]=HEAP[r30];HEAP[r7]=r28;HEAP[r8]=0;L386:do{if((HEAP[r8]|0)<(HEAP[r7]|0)){while(1){HEAP[(HEAP[r8]<<2)+HEAP[r6]|0]=6;HEAP[r8]=HEAP[r8]+1|0;if((HEAP[r8]|0)>=(HEAP[r7]|0)){break L386}}}}while(0);HEAP[r39]=HEAP[r30];HEAP[r40]=0;L390:do{if((HEAP[r40]|0)<(HEAP[HEAP[r35]+16|0]|0)){while(1){HEAP[r41]=0;r30=HEAP[r40];L394:do{if((HEAP[r41]|0)<(HEAP[r40]|0)){r7=r30;while(1){do{if((HEAP[(r7<<2)+HEAP[r38]|0]|0)!=0){if((HEAP[(HEAP[r41]<<2)+HEAP[r38]|0]|0)==0){break}r8=Math.imul(HEAP[HEAP[r35]+16|0],HEAP[r40]);if(!((HEAP[(r8+HEAP[r41]<<2)+HEAP[r36]|0]|0)>=0)){break}r8=Math.imul(HEAP[HEAP[r35]+16|0],HEAP[r41]);if(!((HEAP[(r8+HEAP[r40]<<2)+HEAP[r36]|0]|0)>=0)){break}r8=HEAP[r40];r6=HEAP[r41];HEAP[r24]=HEAP[r39];HEAP[r25]=r8;HEAP[r26]=r6;_edsf_merge(HEAP[r24],HEAP[r25],HEAP[r26],0)}}while(0);HEAP[r41]=HEAP[r41]+1|0;r6=HEAP[r40];if((HEAP[r41]|0)<(HEAP[r40]|0)){r7=r6}else{r98=r6;break L394}}}else{r98=r30}}while(0);HEAP[r40]=r98+1|0;if((HEAP[r40]|0)>=(HEAP[HEAP[r35]+16|0]|0)){break L390}}}}while(0);HEAP[r43]=0;HEAP[r41]=-1;HEAP[r40]=0;L405:do{if((HEAP[r40]|0)<(HEAP[HEAP[r35]+16|0]|0)){while(1){do{if((HEAP[(HEAP[r40]<<2)+HEAP[r38]|0]|0)!=0){r98=HEAP[r40];HEAP[r22]=HEAP[r39];HEAP[r23]=r98;if((_edsf_canonify(HEAP[r22],HEAP[r23],0)|0)!=(HEAP[r40]|0)){break}r98=HEAP[r40];HEAP[r20]=HEAP[r39];HEAP[r21]=r98;r98=HEAP[r21];HEAP[r18]=HEAP[r20];HEAP[r19]=r98;r98=_edsf_canonify(HEAP[r18],HEAP[r19],0);r26=HEAP[(r98<<2)+HEAP[r20]|0]>>2;HEAP[r49]=r26;if((r26|0)<=(HEAP[r43]|0)){break}HEAP[r41]=HEAP[r40];HEAP[r43]=HEAP[r49]}}while(0);HEAP[r40]=HEAP[r40]+1|0;if((HEAP[r40]|0)>=(HEAP[HEAP[r35]+16|0]|0)){break L405}}}}while(0);HEAP[r16]=HEAP[HEAP[r35]|0]<<2;r20=_malloc(HEAP[r16]);HEAP[r17]=r20;if((r20|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r37]=HEAP[r17];HEAP[r40]=0;L418:do{if((HEAP[r40]|0)<(HEAP[HEAP[r35]|0]|0)){while(1){HEAP[(HEAP[r40]<<2)+HEAP[r37]|0]=0;HEAP[r40]=HEAP[r40]+1|0;if((HEAP[r40]|0)>=(HEAP[HEAP[r35]|0]|0)){break L418}}}}while(0);HEAP[r40]=0;L422:do{if((HEAP[r40]|0)<(HEAP[HEAP[r35]+16|0]|0)){while(1){HEAP[(HEAP[r40]<<2)+HEAP[r38]|0]=0;HEAP[r40]=HEAP[r40]+1|0;if((HEAP[r40]|0)>=(HEAP[HEAP[r35]+16|0]|0)){break L422}}}}while(0);HEAP[r40]=0;L426:do{if((HEAP[r40]|0)<(HEAP[HEAP[r35]|0]|0)){while(1){HEAP[r50]=HEAP[HEAP[r35]+4|0]+(HEAP[r40]*24&-1)|0;HEAP[r51]=0;HEAP[r42]=0;L430:do{if((HEAP[r42]|0)<(HEAP[HEAP[r50]|0]|0)){while(1){r17=(HEAP[(HEAP[r42]<<2)+HEAP[HEAP[r50]+8|0]|0]-HEAP[HEAP[r35]+20|0]|0)/20&-1;HEAP[r14]=HEAP[r39];HEAP[r15]=r17;if((_edsf_canonify(HEAP[r14],HEAP[r15],0)|0)==(HEAP[r41]|0)){HEAP[r51]=1}HEAP[r42]=HEAP[r42]+1|0;if((HEAP[r42]|0)>=(HEAP[HEAP[r50]|0]|0)){break L430}}}}while(0);L437:do{if((HEAP[r51]|0)!=0){HEAP[(HEAP[r40]<<2)+HEAP[r37]|0]=1;HEAP[r42]=0;if((HEAP[r42]|0)>=(HEAP[HEAP[r50]|0]|0)){break}while(1){HEAP[(((HEAP[(HEAP[r42]<<2)+HEAP[HEAP[r50]+8|0]|0]-HEAP[HEAP[r35]+20|0]|0)/20&-1)<<2)+HEAP[r38]|0]=1;HEAP[r42]=HEAP[r42]+1|0;if((HEAP[r42]|0)>=(HEAP[HEAP[r50]|0]|0)){break L437}}}}while(0);HEAP[r40]=HEAP[r40]+1|0;if((HEAP[r40]|0)>=(HEAP[HEAP[r35]|0]|0)){break L426}}}}while(0);HEAP[r44]=0;HEAP[r40]=0;L443:do{if((HEAP[r40]|0)<(HEAP[HEAP[r35]|0]|0)){while(1){if((HEAP[(HEAP[r40]<<2)+HEAP[r37]|0]|0)!=0){r15=HEAP[r44];HEAP[r44]=r15+1|0;r99=r15}else{r99=-1}HEAP[(HEAP[r40]<<2)+HEAP[r37]|0]=r99;HEAP[r40]=HEAP[r40]+1|0;if((HEAP[r40]|0)>=(HEAP[HEAP[r35]|0]|0)){break L443}}}}while(0);HEAP[r45]=0;HEAP[r40]=0;L450:do{if((HEAP[r40]|0)<(HEAP[HEAP[r35]+16|0]|0)){while(1){if((HEAP[(HEAP[r40]<<2)+HEAP[r38]|0]|0)!=0){r99=HEAP[r45];HEAP[r45]=r99+1|0;r100=r99}else{r100=-1}HEAP[(HEAP[r40]<<2)+HEAP[r38]|0]=r100;HEAP[r40]=HEAP[r40]+1|0;if((HEAP[r40]|0)>=(HEAP[HEAP[r35]+16|0]|0)){break L450}}}}while(0);HEAP[r40]=0;L457:do{if((HEAP[r40]|0)<(HEAP[HEAP[r35]|0]|0)){while(1){do{if((HEAP[(HEAP[r40]<<2)+HEAP[r37]|0]|0)<0){HEAP[r13]=HEAP[HEAP[HEAP[r35]+4|0]+(HEAP[r40]*24&-1)+8|0];if((HEAP[r13]|0)==0){break}_free(HEAP[r13])}}while(0);HEAP[r40]=HEAP[r40]+1|0;if((HEAP[r40]|0)>=(HEAP[HEAP[r35]|0]|0)){break L457}}}}while(0);HEAP[r40]=0;L466:do{if((HEAP[r40]|0)<(HEAP[HEAP[r35]+16|0]|0)){while(1){if((HEAP[(HEAP[r40]<<2)+HEAP[r38]|0]|0)>=0){HEAP[r52]=HEAP[HEAP[r35]+20|0]+(HEAP[(HEAP[r40]<<2)+HEAP[r38]|0]*20&-1)|0;HEAP[r53]=HEAP[HEAP[r35]+20|0]+(HEAP[r40]*20&-1)|0;r13=HEAP[r52];r100=HEAP[r53];for(r94=r100,r92=r13,r93=r94+20;r94<r93;r94++,r92++){HEAP[r92]=HEAP[r94]}}HEAP[r40]=HEAP[r40]+1|0;if((HEAP[r40]|0)>=(HEAP[HEAP[r35]+16|0]|0)){break L466}}}}while(0);HEAP[r40]=0;L473:do{if((HEAP[r40]|0)<(HEAP[HEAP[r35]|0]|0)){while(1){L476:do{if((HEAP[(HEAP[r40]<<2)+HEAP[r37]|0]|0)>=0){HEAP[r54]=HEAP[HEAP[r35]+4|0]+(HEAP[(HEAP[r40]<<2)+HEAP[r37]|0]*24&-1)|0;HEAP[r55]=HEAP[HEAP[r35]+4|0]+(HEAP[r40]*24&-1)|0;r13=HEAP[r54];r100=HEAP[r55];for(r94=r100,r92=r13,r93=r94+24;r94<r93;r94++,r92++){HEAP[r92]=HEAP[r94]}HEAP[r41]=0;if((HEAP[r41]|0)>=(HEAP[HEAP[r54]|0]|0)){break}while(1){HEAP[r42]=(HEAP[(HEAP[r41]<<2)+HEAP[HEAP[r54]+8|0]|0]-HEAP[HEAP[r35]+20|0]|0)/20&-1;HEAP[(HEAP[r41]<<2)+HEAP[HEAP[r54]+8|0]|0]=HEAP[HEAP[r35]+20|0]+(HEAP[(HEAP[r42]<<2)+HEAP[r38]|0]*20&-1)|0;HEAP[r41]=HEAP[r41]+1|0;if((HEAP[r41]|0)>=(HEAP[HEAP[r54]|0]|0)){break L476}}}}while(0);HEAP[r40]=HEAP[r40]+1|0;if((HEAP[r40]|0)>=(HEAP[HEAP[r35]|0]|0)){break L473}}}}while(0);HEAP[HEAP[r35]|0]=HEAP[r44];HEAP[HEAP[r35]+16|0]=HEAP[r45];r94=HEAP[r36];HEAP[r12]=r94;if((r94|0)!=0){_free(HEAP[r12])}r12=HEAP[r39];HEAP[r11]=r12;if((r12|0)!=0){_free(HEAP[r11])}r11=HEAP[r38];HEAP[r10]=r11;if((r11|0)!=0){_free(HEAP[r10])}r10=HEAP[r37];HEAP[r9]=r10;if((r10|0)==0){r101=r9;r102=r35;r103=r36;r104=r37;r105=r38;r106=r39;r107=r40;r108=r41;r109=r42;r110=r43;r111=r44;r112=r45;r113=r46;r114=r47;r115=r48;r116=r49;r117=r50;r118=r51;r119=r52;r120=r53;r121=r54;r122=r55;r123=r90;_grid_make_consistent(r123);r124=r86+4|0;r125=HEAP[r124];r126=r86|0;r127=HEAP[r126];r128=-r127|0;r129=r90;r130=r129+32|0;r131=HEAP[r130];r132=r90;r133=r132+24|0;r134=HEAP[r133];r135=-r134|0;r136=-r131|0;r137=-r135|0;r138=r128+r125|0;r139=r138+r136|0;r140=r139+r137|0;r141=(r140|0)/2&-1;r142=r90;r143=r142+24|0;r144=HEAP[r143];r145=r144-r141|0;HEAP[r143]=r145;r146=r90;r147=r146+24|0;r148=HEAP[r147];r149=r86+4|0;r150=HEAP[r149];r151=r86|0;r152=HEAP[r151];r153=-r152|0;r154=r150+r148|0;r155=r154+r153|0;r156=r90;r157=r156+32|0;HEAP[r157]=r155;r158=r86+12|0;r159=HEAP[r158];r160=r86+8|0;r161=HEAP[r160];r162=-r161|0;r163=r90;r164=r163+36|0;r165=HEAP[r164];r166=r90;r167=r166+28|0;r168=HEAP[r167];r169=-r168|0;r170=-r165|0;r171=-r169|0;r172=r162+r159|0;r173=r172+r170|0;r174=r173+r171|0;r175=(r174|0)/2&-1;r176=r90;r177=r176+28|0;r178=HEAP[r177];r179=r178-r175|0;HEAP[r177]=r179;r180=r90;r181=r180+28|0;r182=HEAP[r181];r183=r86+12|0;r184=HEAP[r183];r185=r86+8|0;r186=HEAP[r185];r187=-r186|0;r188=r184+r182|0;r189=r188+r187|0;r190=r90;r191=r190+36|0;HEAP[r191]=r189;r192=r90;STACKTOP=r5;return r192}_free(HEAP[r9]);r101=r9;r102=r35;r103=r36;r104=r37;r105=r38;r106=r39;r107=r40;r108=r41;r109=r42;r110=r43;r111=r44;r112=r45;r113=r46;r114=r47;r115=r48;r116=r49;r117=r50;r118=r51;r119=r52;r120=r53;r121=r54;r122=r55;r123=r90;_grid_make_consistent(r123);r124=r86+4|0;r125=HEAP[r124];r126=r86|0;r127=HEAP[r126];r128=-r127|0;r129=r90;r130=r129+32|0;r131=HEAP[r130];r132=r90;r133=r132+24|0;r134=HEAP[r133];r135=-r134|0;r136=-r131|0;r137=-r135|0;r138=r128+r125|0;r139=r138+r136|0;r140=r139+r137|0;r141=(r140|0)/2&-1;r142=r90;r143=r142+24|0;r144=HEAP[r143];r145=r144-r141|0;HEAP[r143]=r145;r146=r90;r147=r146+24|0;r148=HEAP[r147];r149=r86+4|0;r150=HEAP[r149];r151=r86|0;r152=HEAP[r151];r153=-r152|0;r154=r150+r148|0;r155=r154+r153|0;r156=r90;r157=r156+32|0;HEAP[r157]=r155;r158=r86+12|0;r159=HEAP[r158];r160=r86+8|0;r161=HEAP[r160];r162=-r161|0;r163=r90;r164=r163+36|0;r165=HEAP[r164];r166=r90;r167=r166+28|0;r168=HEAP[r167];r169=-r168|0;r170=-r165|0;r171=-r169|0;r172=r162+r159|0;r173=r172+r170|0;r174=r173+r171|0;r175=(r174|0)/2&-1;r176=r90;r177=r176+28|0;r178=HEAP[r177];r179=r178-r175|0;HEAP[r177]=r179;r180=r90;r181=r180+28|0;r182=HEAP[r181];r183=r86+12|0;r184=HEAP[r183];r185=r86+8|0;r186=HEAP[r185];r187=-r186|0;r188=r184+r182|0;r189=r188+r187|0;r190=r90;r191=r190+36|0;HEAP[r191]=r189;r192=r90;STACKTOP=r5;return r192}function _grid_point_cmp_fn(r1,r2){var r3,r4;r3=r1;r1=r2;r2=r1;if((HEAP[r3+16|0]|0)!=(HEAP[r1+16|0]|0)){r1=HEAP[r2+16|0]-HEAP[r3+16|0]|0;r4=r1;return r4}else{r1=HEAP[r2+12|0]-HEAP[r3+12|0]|0;r4=r1;return r4}}function _set_faces(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+80|0;r7=r6;r8=r6+8;r9=r6+16;r10=r6+20;r11=r6+24;r12=r6+28;r13=r6+32;r14=r6+36;r15=r6+40;r16=r6+44;r17=r6+48;r18=r6+64;r19=r1;r1=r2;r2=r3;r3=HEAP[r19+12|0];if((r4|0)<(HEAP[r19+4|0]|0)){r20=0;r21=r20;STACKTOP=r6;return r21}r19=0;L506:do{if((r19|0)<(r2|0)){while(1){HEAP[r15]=r1;HEAP[r16]=r19;r4=(HEAP[(HEAP[r16]<<4)+HEAP[r15]+12|0]+HEAP[(HEAP[r16]<<4)+HEAP[r15]|0]|0)*.5877852+(HEAP[(HEAP[r16]<<4)+HEAP[r15]+8|0]+HEAP[(HEAP[r16]<<4)+HEAP[r15]+4|0]|0)*.9510565;HEAP[r9]=r1;HEAP[r10]=r19;r22=(HEAP[(HEAP[r10]<<4)+HEAP[r9]|0]-HEAP[(HEAP[r10]<<4)+HEAP[r9]+12|0]|0)*.8090169+(HEAP[(HEAP[r10]<<4)+HEAP[r9]+4|0]-HEAP[(HEAP[r10]<<4)+HEAP[r9]+8|0]|0)*.3090169;r23=r4;HEAP[r8]=r23;r4=HEAP[r8];if(r23>0){r24=Math.floor(r4+.5)}else{r24=Math.ceil(r4-.5)}HEAP[(r19<<2)+r17|0]=r24&-1;r4=r22;HEAP[r7]=r4;r22=HEAP[r7];if(r4>0){r25=Math.floor(r22+.5)}else{r25=Math.ceil(r22-.5)}HEAP[(r19<<2)+r18|0]=r25&-1;if((HEAP[(r19<<2)+r17|0]|0)<(HEAP[r3|0]|0)){r5=349;break}if((HEAP[(r19<<2)+r17|0]|0)>(HEAP[r3+4|0]|0)){r5=349;break}if((HEAP[(r19<<2)+r18|0]|0)<(HEAP[r3+8|0]|0)){r5=352;break}if((HEAP[(r19<<2)+r18|0]|0)>(HEAP[r3+12|0]|0)){r5=352;break}r19=r19+1|0;if((r19|0)>=(r2|0)){break L506}}if(r5==352){r20=0;r21=r20;STACKTOP=r6;return r21}else if(r5==349){r20=0;r21=r20;STACKTOP=r6;return r21}}}while(0);_grid_face_add_new(HEAP[r3+16|0],r2);r19=0;L528:do{if((r19|0)<(r2|0)){while(1){r5=_grid_get_dot(HEAP[r3+16|0],HEAP[r3+20|0],HEAP[(r19<<2)+r17|0],HEAP[(r19<<2)+r18|0]);HEAP[r11]=HEAP[r3+16|0];HEAP[r12]=r5;HEAP[r13]=r19;HEAP[r14]=HEAP[HEAP[r11]+4|0]+(HEAP[HEAP[r11]|0]*24&-1)-24|0;HEAP[(HEAP[r13]<<2)+HEAP[HEAP[r14]+8|0]|0]=HEAP[r12];r19=r19+1|0;if((r19|0)>=(r2|0)){break L528}}}}while(0);r20=0;r21=r20;STACKTOP=r6;return r21}function _grid_empty(){var r1,r2,r3,r4;r1=STACKTOP;STACKTOP=STACKTOP+8|0;r2=r1;r3=r1+4;HEAP[r2]=48;r4=_malloc(HEAP[r2]);HEAP[r3]=r4;if((HEAP[r3]|0)!=0){r4=HEAP[r3];HEAP[r4+4|0]=0;HEAP[r4+12|0]=0;HEAP[r4+20|0]=0;HEAP[r4+16|0]=0;HEAP[r4+8|0]=0;HEAP[r4|0]=0;HEAP[r4+44|0]=1;HEAP[r4+36|0]=0;HEAP[r4+32|0]=0;HEAP[r4+28|0]=0;HEAP[r4+24|0]=0;STACKTOP=r1;return r4}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}
function _grid_make_consistent(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+72|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r1;HEAP[r19+8|0]=HEAP[r19|0]-1+HEAP[r19+16|0]|0;HEAP[r14]=HEAP[r19+8|0]<<4;r1=_malloc(HEAP[r14]);HEAP[r15]=r1;if((HEAP[r15]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r19+12|0]=HEAP[r15];r15=HEAP[r19+12|0];HEAP[r12]=48;HEAP[r10]=8;r1=_malloc(HEAP[r10]);HEAP[r11]=r1;if((HEAP[r11]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r13]=HEAP[r11];HEAP[HEAP[r13]|0]=0;HEAP[HEAP[r13]+4|0]=HEAP[r12];r12=HEAP[r13];r13=0;L545:do{if((r13|0)<(HEAP[r19|0]|0)){r11=r18|0;r1=r18+4|0;r10=r18;r14=r18|0;r20=r18+4|0;while(1){r21=HEAP[r19+4|0]+(r13*24&-1)|0;r22=0;L549:do{if((r22|0)<(HEAP[r21|0]|0)){while(1){r23=r22+1|0;if((r23|0)==(HEAP[r21|0]|0)){r23=0}HEAP[r11]=HEAP[(r22<<2)+HEAP[r21+8|0]|0];HEAP[r1]=HEAP[(r23<<2)+HEAP[r21+8|0]|0];r23=_del234(r12,r10);if((r23|0)!=0){HEAP[r23+12|0]=r21}else{if(((r15-HEAP[r19+12|0]|0)/16&-1|0)>=(HEAP[r19+8|0]|0)){___assert_func(36728,551,37872,33940)}HEAP[r15|0]=HEAP[r14];HEAP[r15+4|0]=HEAP[r20];HEAP[r15+8|0]=r21;HEAP[r15+12|0]=0;_add234(r12,r15);r15=r15+16|0}r22=r22+1|0;if((r22|0)>=(HEAP[r21|0]|0)){break L549}}}}while(0);r13=r13+1|0;if((r13|0)>=(HEAP[r19|0]|0)){break L545}}}}while(0);HEAP[r9]=r12;_freenode234(HEAP[HEAP[r9]|0]);r12=HEAP[r9];HEAP[r8]=r12;if((r12|0)!=0){_free(HEAP[r8])}r13=0;L567:do{if((r13|0)<(HEAP[r19|0]|0)){while(1){r8=HEAP[r19+4|0]+(r13*24&-1)|0;HEAP[r6]=HEAP[r8|0]<<2;r12=_malloc(HEAP[r6]);HEAP[r7]=r12;if((r12|0)==0){break}HEAP[r8+4|0]=HEAP[r7];r12=0;L572:do{if((r12|0)<(HEAP[r8|0]|0)){while(1){HEAP[(r12<<2)+HEAP[r8+4|0]|0]=0;r12=r12+1|0;if((r12|0)>=(HEAP[r8|0]|0)){break L572}}}}while(0);r13=r13+1|0;if((r13|0)>=(HEAP[r19|0]|0)){break L567}}_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}while(0);r13=0;L578:do{if((r13|0)<(HEAP[r19+8|0]|0)){while(1){r7=(r13<<4)+HEAP[r19+12|0]|0;r6=0;r8=0;while(1){r12=r7;if((r8|0)!=0){r24=HEAP[r12+12|0]}else{r24=HEAP[r12+8|0]}r12=r24;do{if((r24|0)!=0){r9=0;L589:do{if((r9|0)<(HEAP[r12|0]|0)){while(1){if((HEAP[(r9<<2)+HEAP[r12+8|0]|0]|0)==(HEAP[r7|0]|0)){break L589}r9=r9+1|0;if((r9|0)>=(HEAP[r12|0]|0)){break L589}}}}while(0);if((r9|0)==(HEAP[r12|0]|0)){___assert_func(36728,593,37872,33864)}r15=r9+1|0;if((r15|0)==(HEAP[r12|0]|0)){r15=0}r18=r9;if((HEAP[(r15<<2)+HEAP[r12+8|0]|0]|0)==(HEAP[r7+4|0]|0)){if((HEAP[(r18<<2)+HEAP[r12+4|0]|0]|0)!=0){___assert_func(36728,618,37872,36820)}HEAP[(r9<<2)+HEAP[r12+4|0]|0]=r7;break}r15=r18-1|0;if((r15|0)==-1){r15=HEAP[r12|0]-1|0}if((HEAP[(r15<<2)+HEAP[r12+8|0]|0]|0)!=(HEAP[r7+4|0]|0)){___assert_func(36728,632,37872,36632);break}if((HEAP[(r15<<2)+HEAP[r12+4|0]|0]|0)!=0){___assert_func(36728,628,37872,36764)}HEAP[(r15<<2)+HEAP[r12+4|0]|0]=r7}}while(0);r12=r6+1|0;r6=r12;if((r12|0)<2){r8=r12}else{break}}r13=r13+1|0;if((r13|0)>=(HEAP[r19+8|0]|0)){break L578}}}}while(0);r13=0;L618:do{if((r13|0)<(HEAP[r19+16|0]|0)){while(1){HEAP[HEAP[r19+20|0]+(r13*20&-1)|0]=0;r13=r13+1|0;if((r13|0)>=(HEAP[r19+16|0]|0)){break L618}}}}while(0);r13=0;L622:do{if((r13|0)<(HEAP[r19+8|0]|0)){while(1){r24=(r13<<4)+HEAP[r19+12|0]|0;r8=HEAP[r24|0]|0;HEAP[r8]=HEAP[r8]+1|0;r8=HEAP[r24+4|0]|0;HEAP[r8]=HEAP[r8]+1|0;r13=r13+1|0;if((r13|0)>=(HEAP[r19+8|0]|0)){break L622}}}}while(0);r13=0;L626:do{if((r13|0)<(HEAP[r19+16|0]|0)){while(1){r8=HEAP[r19+20|0]+(r13*20&-1)|0;if(!((HEAP[r8|0]|0)>=2)){___assert_func(36728,655,37872,36592)}HEAP[r4]=HEAP[r8|0]<<2;r24=_malloc(HEAP[r4]);HEAP[r5]=r24;if((r24|0)==0){r2=426;break}HEAP[r8+4|0]=HEAP[r5];HEAP[r16]=HEAP[r8|0]<<2;r24=_malloc(HEAP[r16]);HEAP[r17]=r24;if((HEAP[r17]|0)==0){r2=428;break}HEAP[r8+8|0]=HEAP[r17];r24=0;L635:do{if((r24|0)<(HEAP[r8|0]|0)){while(1){HEAP[(r24<<2)+HEAP[r8+4|0]|0]=0;HEAP[(r24<<2)+HEAP[r8+8|0]|0]=0;r24=r24+1|0;if((r24|0)>=(HEAP[r8|0]|0)){break L635}}}}while(0);r13=r13+1|0;if((r13|0)>=(HEAP[r19+16|0]|0)){break L626}}if(r2==426){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r2==428){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}}while(0);r13=0;L643:do{if((r13|0)<(HEAP[r19|0]|0)){while(1){r2=HEAP[r19+4|0]+(r13*24&-1)|0;r17=0;L646:do{if((r17|0)<(HEAP[r2|0]|0)){while(1){HEAP[HEAP[HEAP[(r17<<2)+HEAP[r2+8|0]|0]+8|0]|0]=r2;r17=r17+1|0;if((r17|0)>=(HEAP[r2|0]|0)){break L646}}}}while(0);r13=r13+1|0;if((r13|0)>=(HEAP[r19|0]|0)){break L643}}}}while(0);r13=0;L651:do{if((r13|0)<(HEAP[r19+16|0]|0)){while(1){r2=HEAP[r19+20|0]+(r13*20&-1)|0;r17=0;r16=0;while(1){r5=HEAP[(r17<<2)+HEAP[r2+8|0]|0];r4=r5;if((r5|0)==0){___assert_func(36728,707,37872,36476)}r5=0;L659:do{if((r5|0)<(HEAP[r4|0]|0)){while(1){if((HEAP[(r5<<2)+HEAP[r4+8|0]|0]|0)==(r2|0)){break L659}r5=r5+1|0;if((r5|0)>=(HEAP[r4|0]|0)){break L659}}}}while(0);if((r5|0)==(HEAP[r4|0]|0)){___assert_func(36728,713,37872,36376)}r9=r5-1|0;r5=r9;if((r9|0)==-1){r5=HEAP[r4|0]-1|0}r9=HEAP[(r5<<2)+HEAP[r4+4|0]|0];HEAP[(r17<<2)+HEAP[r2+4|0]|0]=r9;r17=r17+1|0;if((r17|0)==(HEAP[r2|0]|0)){break}r8=r9;if((HEAP[r9+8|0]|0)==(r4|0)){r25=HEAP[r8+12|0]}else{r25=HEAP[r8+8|0]}HEAP[(r17<<2)+HEAP[r2+8|0]|0]=r25;if((HEAP[(r17<<2)+HEAP[r2+8|0]|0]|0)==0){break}}L676:do{if((r17|0)!=(HEAP[r2|0]|0)){while(1){r8=HEAP[(r16<<2)+HEAP[r2+8|0]|0];r9=r8;if((r8|0)==0){___assert_func(36728,744,37872,36476)}r8=0;L682:do{if((r8|0)<(HEAP[r9|0]|0)){while(1){if((HEAP[(r8<<2)+HEAP[r9+8|0]|0]|0)==(r2|0)){break L682}r8=r8+1|0;if((r8|0)>=(HEAP[r9|0]|0)){break L682}}}}while(0);if((r8|0)==(HEAP[r9|0]|0)){___assert_func(36728,750,37872,36376)}r24=HEAP[(r8<<2)+HEAP[r9+4|0]|0];r6=r16-1|0;r16=r6;if((r6|0)==-1){r16=HEAP[r2|0]-1|0}HEAP[(r16<<2)+HEAP[r2+4|0]|0]=r24;if((r16|0)==(r17|0)){break L676}r6=r24;if((HEAP[r24+8|0]|0)==(r9|0)){r26=HEAP[r6+12|0]}else{r26=HEAP[r6+8|0]}HEAP[(r16<<2)+HEAP[r2+8|0]|0]=r26;if((HEAP[(r16<<2)+HEAP[r2+8|0]|0]|0)!=0){continue}___assert_func(36728,767,37872,36304)}}}while(0);r13=r13+1|0;if((r13|0)>=(HEAP[r19+16|0]|0)){break L651}}}}while(0);r13=0;if((r13|0)<(HEAP[r19+16|0]|0)){r27=r19}else{STACKTOP=r3;return}while(1){r26=r13;r25=HEAP[r27+20|0]+(r26*20&-1)|0;if((r26|0)==0){r26=HEAP[r25+12|0];HEAP[r19+32|0]=r26;HEAP[r19+24|0]=r26;r26=HEAP[r25+16|0];HEAP[r19+36|0]=r26;HEAP[r19+28|0]=r26}else{if((HEAP[r19+24|0]|0)<(HEAP[r25+12|0]|0)){r28=HEAP[r19+24|0]}else{r28=HEAP[r25+12|0]}HEAP[r19+24|0]=r28;if((HEAP[r19+32|0]|0)>(HEAP[r25+12|0]|0)){r29=HEAP[r19+32|0]}else{r29=HEAP[r25+12|0]}HEAP[r19+32|0]=r29;if((HEAP[r19+28|0]|0)<(HEAP[r25+16|0]|0)){r30=HEAP[r19+28|0]}else{r30=HEAP[r25+16|0]}HEAP[r19+28|0]=r30;if((HEAP[r19+36|0]|0)>(HEAP[r25+16|0]|0)){r31=HEAP[r19+36|0]}else{r31=HEAP[r25+16|0]}HEAP[r19+36|0]=r31}r13=r13+1|0;if((r13|0)<(HEAP[r19+16|0]|0)){r27=r19}else{break}}STACKTOP=r3;return}function _grid_edge_bydots_cmpfn(r1,r2){var r3,r4,r5,r6,r7,r8,r9;r3=r1;r1=r2;r2=r3;if(HEAP[r3|0]>>>0<HEAP[r3+4|0]>>>0){r4=HEAP[r2|0]}else{r4=HEAP[r2+4|0]}r2=r4;r4=r1;if(HEAP[r1|0]>>>0<HEAP[r1+4|0]>>>0){r5=HEAP[r4|0]}else{r5=HEAP[r4+4|0]}r4=r5;if((r2|0)!=(r4|0)){r6=(r4-r2|0)/20&-1;r7=r6;return r7}r5=r3;if(HEAP[r3|0]>>>0<HEAP[r3+4|0]>>>0){r8=HEAP[r5+4|0]}else{r8=HEAP[r5|0]}r2=r8;r8=r1;if(HEAP[r1|0]>>>0<HEAP[r1+4|0]>>>0){r9=HEAP[r8+4|0]}else{r9=HEAP[r8|0]}r4=r9;if((r2|0)!=(r4|0)){r6=(r4-r2|0)/20&-1;r7=r6;return r7}else{r6=0;r7=r6;return r7}}function _grid_get_dot(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r5=STACKTOP;STACKTOP=STACKTOP+48|0;r6=r5;r7=r5+4;r8=r5+8;r9=r5+12;r10=r5+16;r11=r5+20;r12=r5+24;r13=r5+28;r14=r2;r2=r3;r3=r4;HEAP[r13|0]=0;HEAP[r13+4|0]=0;HEAP[r13+8|0]=0;HEAP[r13+12|0]=r2;HEAP[r13+16|0]=r3;HEAP[r10]=r14;HEAP[r11]=r13;HEAP[r12]=0;r13=_findrelpos234(HEAP[r10],HEAP[r11],HEAP[r12],0);if((r13|0)!=0){r12=r13;r11=r12;STACKTOP=r5;return r11}else{HEAP[r6]=r1;HEAP[r7]=r2;HEAP[r8]=r3;HEAP[r9]=HEAP[HEAP[r6]+20|0]+(HEAP[HEAP[r6]+16|0]*20&-1)|0;HEAP[HEAP[r9]|0]=0;HEAP[HEAP[r9]+4|0]=0;HEAP[HEAP[r9]+8|0]=0;HEAP[HEAP[r9]+12|0]=HEAP[r7];HEAP[HEAP[r9]+16|0]=HEAP[r8];r8=HEAP[r6]+16|0;HEAP[r8]=HEAP[r8]+1|0;r13=HEAP[r9];_add234(r14,r13);r12=r13;r11=r12;STACKTOP=r5;return r11}}function _canvas_text_fallback(r1,r2,r3){return _dupstr(HEAP[r2|0])}function _grid_face_add_new(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r3+4;r6=r1;r1=r2;r2=HEAP[r6+4|0]+(HEAP[r6|0]*24&-1)|0;HEAP[r2|0]=r1;HEAP[r4]=r1<<2;r7=_malloc(HEAP[r4]);HEAP[r5]=r7;if((HEAP[r5]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r2+8|0]=HEAP[r5];r5=0;if((r5|0)>=(r1|0)){r8=r2;r9=r8+4|0;HEAP[r9]=0;r10=r2;r11=r10+12|0;HEAP[r11]=0;r12=r6;r13=r12|0;r14=HEAP[r13];r15=r14+1|0;HEAP[r13]=r15;STACKTOP=r3;return}while(1){HEAP[(r5<<2)+HEAP[r2+8|0]|0]=0;r5=r5+1|0;if((r5|0)>=(r1|0)){break}}r8=r2;r9=r8+4|0;HEAP[r9]=0;r10=r2;r11=r10+12|0;HEAP[r11]=0;r12=r6;r13=r12|0;r14=HEAP[r13];r15=r14+1|0;HEAP[r13]=r15;STACKTOP=r3;return}function _fatal(r1){var r2,r3;r2=STACKTOP;STACKTOP=STACKTOP+4|0;r3=r2;_fwrite(36448,13,1,HEAP[_stderr]);HEAP[r3]=r1;_fprintf(HEAP[_stderr],36328,HEAP[r3]);_fputc(10,HEAP[_stderr]);_exit(1)}function _init_game(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+384|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r4+24;r12=r4+28;r13=r4+32;r14=r4+36;r15=r4+40;r16=r4+44;r17=r4+48;r18=r4+52;r19=r4+56;r20=r4+60;r21=r4+64;r22=r4+68;r23=r4+72;r24=r4+76;r25=r4+80;r26=r4+84;r27=r4+88;r28=r4+92;r29=r4+96;r30=r4+100;r31=r4+104;r32=r4+108;r33=r4+112;r34=r4+116;r35=r4+120;r36=r4+124;r37=r4+128;r38=r4+132;r39=r4+136;r40=r4+140;r41=r4+144;r42=r4+148;r43=r4+152;r44=r4+156;r45=r4+160;r46=r4+164;r47=r4+168;r48=r4+172;r49=r4+176;r50=r4+180;r51=r4+184;r52=r4+264;r53=r4+268;r54=r4+272;r55=r4+276;r56=r4+356;r57=r4+360;r58=r4+364;r59=r4+368;r60=r4+372;r61=r4+376;r62=r4+380;r63=r1;r1=r2;HEAP[r44]=r63;HEAP[r45]=32768;HEAP[r46]=33724;HEAP[r47]=r1;HEAP[r42]=144;r2=_malloc(HEAP[r42]);HEAP[r43]=r2;if((HEAP[r43]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r48]=HEAP[r43];HEAP[r39]=r49;HEAP[r40]=r50;HEAP[r37]=8;r43=_malloc(HEAP[r37]);HEAP[r38]=r43;if((HEAP[r38]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r41]=HEAP[r38];_gettimeofday(HEAP[r41],0);HEAP[HEAP[r39]]=HEAP[r41];HEAP[HEAP[r40]]=8;HEAP[HEAP[r48]|0]=HEAP[r44];HEAP[HEAP[r48]+8|0]=HEAP[r45];r44=_random_new(HEAP[r49],HEAP[r50]);HEAP[HEAP[r48]+4|0]=r44;HEAP[HEAP[r48]+60|0]=0;HEAP[HEAP[r48]+56|0]=0;HEAP[HEAP[r48]+52|0]=0;HEAP[HEAP[r48]+64|0]=0;r44=FUNCTION_TABLE[HEAP[HEAP[r45]+12|0]]();HEAP[HEAP[r48]+68|0]=r44;_sprintf(r51|0,36264,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[HEAP[HEAP[r48]+8|0]|0],tempInt));HEAP[r54]=0;HEAP[r53]=0;L776:do{if(HEAP[r51+HEAP[r53]|0]<<24>>24!=0){while(1){if((_isspace(HEAP[r51+HEAP[r53]|0]&255)|0)==0){r44=_toupper(HEAP[r51+HEAP[r53]|0]&255)&255;r50=HEAP[r54];HEAP[r54]=r50+1|0;HEAP[r51+r50|0]=r44}HEAP[r53]=HEAP[r53]+1|0;if(HEAP[r51+HEAP[r53]|0]<<24>>24==0){break L776}}}}while(0);HEAP[r51+HEAP[r54]|0]=0;r54=_getenv(r51|0);HEAP[r52]=r54;if((r54|0)!=0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r48]+8|0]+20|0]](HEAP[HEAP[r48]+68|0],HEAP[r52])}HEAP[HEAP[r48]+72|0]=0;HEAP[HEAP[r48]+36|0]=0;HEAP[HEAP[r48]+32|0]=0;HEAP[HEAP[r48]+40|0]=0;HEAP[HEAP[r48]+44|0]=0;HEAP[HEAP[r48]+48|0]=2;HEAP[HEAP[r48]+76|0]=0;HEAP[HEAP[r48]+84|0]=0;HEAP[HEAP[r48]+12|0]=0;HEAP[HEAP[r48]+16|0]=0;HEAP[HEAP[r48]+20|0]=0;HEAP[HEAP[r48]+28|0]=0;HEAP[HEAP[r48]+24|0]=0;HEAP[HEAP[r48]+92|0]=0;HEAP[HEAP[r48]+88|0]=0;HEAP[HEAP[r48]+100|0]=0;HEAP[HEAP[r48]+96|0]=0;HEAP[HEAP[r48]+104|0]=0;HEAP[HEAP[r48]+80|0]=0;HEAP[HEAP[r48]+124|0]=0;HEAP[HEAP[r48]+116|0]=0;HEAP[HEAP[r48]+108|0]=0;HEAP[HEAP[r48]+112|0]=0;HEAP[HEAP[r48]+140|0]=0;HEAP[HEAP[r48]+136|0]=0;HEAP[HEAP[r48]+132|0]=0;do{if((HEAP[r46]|0)!=0){r52=HEAP[r48];r54=HEAP[r47];HEAP[r33]=HEAP[r46];HEAP[r34]=r52;HEAP[r35]=r54;HEAP[r31]=32;r54=_malloc(HEAP[r31]);HEAP[r32]=r54;if((HEAP[r32]|0)!=0){HEAP[r36]=HEAP[r32];HEAP[HEAP[r36]|0]=HEAP[r33];HEAP[HEAP[r36]+4|0]=HEAP[r35];HEAP[HEAP[r36]+8|0]=0;HEAP[HEAP[r36]+16|0]=0;HEAP[HEAP[r36]+12|0]=0;HEAP[HEAP[r36]+20|0]=1;HEAP[HEAP[r36]+24|0]=HEAP[r34];HEAP[HEAP[r36]+28|0]=0;HEAP[HEAP[r48]+120|0]=HEAP[r36];break}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}else{HEAP[HEAP[r48]+120|0]=0}}while(0);HEAP[HEAP[r48]+128|0]=HEAP[HEAP[r45]+120|0];_sprintf(r55|0,36680,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[HEAP[HEAP[r48]+8|0]|0],tempInt));HEAP[r58]=0;HEAP[r57]=0;L793:do{if(HEAP[r55+HEAP[r57]|0]<<24>>24!=0){while(1){if((_isspace(HEAP[r55+HEAP[r57]|0]&255)|0)==0){r45=_toupper(HEAP[r55+HEAP[r57]|0]&255)&255;r36=HEAP[r58];HEAP[r58]=r36+1|0;HEAP[r55+r36|0]=r45}HEAP[r57]=HEAP[r57]+1|0;if(HEAP[r55+HEAP[r57]|0]<<24>>24==0){break L793}}}}while(0);HEAP[r55+HEAP[r58]|0]=0;r58=_getenv(r55|0);HEAP[r56]=r58;do{if((r58|0)!=0){if(!((_sscanf(HEAP[r56],35876,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=r59,tempInt))|0)==1&(HEAP[r59]|0)>0)){break}HEAP[HEAP[r48]+128|0]=HEAP[r59]}}while(0);r59=HEAP[r49];HEAP[r30]=r59;if((r59|0)!=0){_free(HEAP[r30])}r30=HEAP[r48];_frontend_set_game_info(r63,r30,36876,1,1,1,0,0,0,0);HEAP[r20]=r30;L807:do{if((HEAP[HEAP[r20]+24|0]|0)==0){if((FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+16|0]](HEAP[HEAP[r20]+24|0],r21,r22)|0)==0){break}while(1){if((HEAP[HEAP[r20]+28|0]|0)<=(HEAP[HEAP[r20]+24|0]|0)){HEAP[HEAP[r20]+28|0]=HEAP[HEAP[r20]+24|0]+10|0;r48=_srealloc(HEAP[HEAP[r20]+12|0],HEAP[HEAP[r20]+28|0]<<2);HEAP[HEAP[r20]+12|0]=r48;r48=_srealloc(HEAP[HEAP[r20]+16|0],HEAP[HEAP[r20]+28|0]<<2);HEAP[HEAP[r20]+16|0]=r48;r48=_srealloc(HEAP[HEAP[r20]+20|0],HEAP[HEAP[r20]+28|0]<<2);HEAP[HEAP[r20]+20|0]=r48}HEAP[(HEAP[HEAP[r20]+24|0]<<2)+HEAP[HEAP[r20]+12|0]|0]=HEAP[r22];HEAP[(HEAP[HEAP[r20]+24|0]<<2)+HEAP[HEAP[r20]+16|0]|0]=HEAP[r21];r48=FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+24|0]](HEAP[r22],1);HEAP[(HEAP[HEAP[r20]+24|0]<<2)+HEAP[HEAP[r20]+20|0]|0]=r48;r48=HEAP[r20]+24|0;HEAP[r48]=HEAP[r48]+1|0;if((FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+16|0]](HEAP[HEAP[r20]+24|0],r21,r22)|0)==0){break L807}}}}while(0);_sprintf(r51|0,36364,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[HEAP[HEAP[r20]+8|0]|0],tempInt));HEAP[r26]=0;HEAP[r25]=0;L815:do{if(HEAP[r51+HEAP[r25]|0]<<24>>24!=0){while(1){if((_isspace(HEAP[r51+HEAP[r25]|0]&255)|0)==0){r22=_toupper(HEAP[r51+HEAP[r25]|0]&255)&255;r21=HEAP[r26];HEAP[r26]=r21+1|0;HEAP[r51+r21|0]=r22}HEAP[r25]=HEAP[r25]+1|0;if(HEAP[r51+HEAP[r25]|0]<<24>>24==0){break L815}}}}while(0);HEAP[r51+HEAP[r26]|0]=0;r26=_getenv(r51|0);HEAP[r23]=r26;if((r26|0)!=0){r26=_dupstr(HEAP[r23]);HEAP[r23]=r26;HEAP[r24]=r26;if(HEAP[HEAP[r24]]<<24>>24!=0){while(1){HEAP[r27]=HEAP[r24];r25=HEAP[r24];L827:do{if((HEAP[HEAP[r24]]<<24>>24|0)!=0){r22=r25;while(1){r21=HEAP[r24];if((HEAP[r22]<<24>>24|0)==58){r64=r21;break L827}HEAP[r24]=r21+1|0;r21=HEAP[r24];if((HEAP[HEAP[r24]]<<24>>24|0)!=0){r22=r21}else{r64=r21;break L827}}}else{r64=r25}}while(0);if(HEAP[r64]<<24>>24!=0){r25=HEAP[r24];HEAP[r24]=r25+1|0;HEAP[r25]=0}HEAP[r28]=HEAP[r24];r25=HEAP[r24];L835:do{if((HEAP[HEAP[r24]]<<24>>24|0)!=0){r22=r25;while(1){r21=HEAP[r24];if((HEAP[r22]<<24>>24|0)==58){r65=r21;break L835}HEAP[r24]=r21+1|0;r21=HEAP[r24];if((HEAP[HEAP[r24]]<<24>>24|0)!=0){r22=r21}else{r65=r21;break L835}}}else{r65=r25}}while(0);if(HEAP[r65]<<24>>24!=0){r25=HEAP[r24];HEAP[r24]=r25+1|0;HEAP[r25]=0}r25=FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+12|0]]();HEAP[r29]=r25;FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+20|0]](HEAP[r29],HEAP[r28]);r25=(FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+48|0]](HEAP[r29],1)|0)!=0;r22=HEAP[r20];if(r25){FUNCTION_TABLE[HEAP[HEAP[r22+8|0]+28|0]](HEAP[r29])}else{if((HEAP[r22+28|0]|0)<=(HEAP[HEAP[r20]+24|0]|0)){HEAP[HEAP[r20]+28|0]=HEAP[HEAP[r20]+24|0]+10|0;r22=_srealloc(HEAP[HEAP[r20]+12|0],HEAP[HEAP[r20]+28|0]<<2);HEAP[HEAP[r20]+12|0]=r22;r22=_srealloc(HEAP[HEAP[r20]+16|0],HEAP[HEAP[r20]+28|0]<<2);HEAP[HEAP[r20]+16|0]=r22;r22=_srealloc(HEAP[HEAP[r20]+20|0],HEAP[HEAP[r20]+28|0]<<2);HEAP[HEAP[r20]+20|0]=r22}HEAP[(HEAP[HEAP[r20]+24|0]<<2)+HEAP[HEAP[r20]+12|0]|0]=HEAP[r29];r22=_dupstr(HEAP[r27]);HEAP[(HEAP[HEAP[r20]+24|0]<<2)+HEAP[HEAP[r20]+16|0]|0]=r22;r22=FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+24|0]](HEAP[r29],1);HEAP[(HEAP[HEAP[r20]+24|0]<<2)+HEAP[HEAP[r20]+20|0]|0]=r22;r22=HEAP[r20]+24|0;HEAP[r22]=HEAP[r22]+1|0}if(HEAP[HEAP[r24]]<<24>>24==0){break}}r66=HEAP[r23]}else{r66=r26}HEAP[r19]=r66;if((r66|0)!=0){_free(HEAP[r19])}}r19=HEAP[HEAP[r20]+24|0];HEAP[r60]=r19;L856:do{if((r19|0)>0){r67=0;if((r67|0)>=(HEAP[r60]|0)){break}r20=r67;while(1){HEAP[r15]=r30;HEAP[r16]=r20;HEAP[r17]=r61;HEAP[r18]=r62;do{if((r20|0)>=0){if((HEAP[r16]|0)<(HEAP[HEAP[r15]+24|0]|0)){break}else{r3=585;break}}else{r3=585}}while(0);if(r3==585){r3=0;___assert_func(35472,1056,37592,36276)}HEAP[HEAP[r17]]=HEAP[(HEAP[r16]<<2)+HEAP[HEAP[r15]+16|0]|0];HEAP[HEAP[r18]]=HEAP[(HEAP[r16]<<2)+HEAP[HEAP[r15]+12|0]|0];_frontend_add_preset(r63,HEAP[r61],HEAP[r62]);r67=r67+1|0;r66=r67;if((r66|0)<(HEAP[r60]|0)){r20=r66}else{break L856}}}}while(0);HEAP[r5]=r30;HEAP[r6]=r60;r30=FUNCTION_TABLE[HEAP[HEAP[HEAP[r5]+8|0]+132|0]](HEAP[HEAP[r5]|0],HEAP[r6]);HEAP[r7]=r30;HEAP[r8]=0;L867:do{if((HEAP[r8]|0)<(HEAP[HEAP[r6]]|0)){r30=r51|0;r62=r51|0;while(1){r61=HEAP[r8];_sprintf(r30,36576,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=HEAP[HEAP[HEAP[r5]+8|0]|0],HEAP[tempInt+4]=r61,tempInt));HEAP[r14]=0;HEAP[r13]=0;L871:do{if(HEAP[r51+HEAP[r13]|0]<<24>>24!=0){while(1){if((_isspace(HEAP[r51+HEAP[r13]|0]&255)|0)==0){r61=_toupper(HEAP[r51+HEAP[r13]|0]&255)&255;r63=HEAP[r14];HEAP[r14]=r63+1|0;HEAP[r51+r63|0]=r61}HEAP[r13]=HEAP[r13]+1|0;if(HEAP[r51+HEAP[r13]|0]<<24>>24==0){break L871}}}}while(0);HEAP[r51+HEAP[r14]|0]=0;r61=_getenv(r62);HEAP[r9]=r61;do{if((r61|0)!=0){if((_sscanf(HEAP[r9],36464,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP[tempInt]=r10,HEAP[tempInt+4]=r11,HEAP[tempInt+8]=r12,tempInt))|0)!=3){break}HEAP[((HEAP[r8]*3&-1)<<2)+HEAP[r7]|0]=(HEAP[r10]>>>0)/255;HEAP[((HEAP[r8]*3&-1)+1<<2)+HEAP[r7]|0]=(HEAP[r11]>>>0)/255;HEAP[((HEAP[r8]*3&-1)+2<<2)+HEAP[r7]|0]=(HEAP[r12]>>>0)/255}}while(0);HEAP[r8]=HEAP[r8]+1|0;if((HEAP[r8]|0)>=(HEAP[HEAP[r6]]|0)){break L867}}}}while(0);r6=HEAP[r7];r67=0;if((r67|0)>=(HEAP[r60]|0)){STACKTOP=r4;return}while(1){_canvas_set_palette_entry(r1,r67,HEAP[((r67*3&-1)<<2)+r6|0]*255&-1,HEAP[((r67*3&-1)+1<<2)+r6|0]*255&-1,HEAP[((r67*3&-1)+2<<2)+r6|0]*255&-1);r67=r67+1|0;if((r67|0)>=(HEAP[r60]|0)){break}}STACKTOP=r4;return}function _face_num_neighbours(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11;r5=r1;r1=r2;r2=r3;r3=r4;r4=0;r6=0;if((r6|0)>=(HEAP[r2|0]|0)){r7=r4;return r7}while(1){r8=HEAP[(r6<<2)+HEAP[r2+4|0]|0];r9=r8;if((HEAP[r8+8|0]|0)==(r2|0)){r10=HEAP[r9+12|0]}else{r10=HEAP[r9+8|0]}if((r10|0)==0){r11=2}else{r11=HEAP[r1+((r10-HEAP[r5+4|0]|0)/24&-1)|0]<<24>>24}if((r11|0)==(r3|0)){r4=r4+1|0}r6=r6+1|0;if((r6|0)>=(HEAP[r2|0]|0)){break}}r7=r4;return r7}function _generic_sort_cmpfn(r1,r2,r3){var r4,r5,r6;r4=r3;r3=r1;r1=r2;r2=HEAP[r1+r4|0]-HEAP[r3+r4|0]|0;if((r2|0)!=0){r5=r2;r6=r5;return r6}if(HEAP[r3+8|0]>>>0<HEAP[r1+8|0]>>>0){r5=-1;r6=r5;return r6}if(HEAP[r3+8|0]>>>0>HEAP[r1+8|0]>>>0){r5=1;r6=r5;return r6}else{r5=(r3-r1|0)/12&-1;r6=r5;return r6}}function _white_sort_cmpfn(r1,r2){return _generic_sort_cmpfn(r1,r2,0)}function _black_sort_cmpfn(r1,r2){return _generic_sort_cmpfn(r1,r2,4)}function _can_colour_face(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r5=0;r6=r1;r1=r2;r2=r3;r3=r4;r4=HEAP[r6+4|0]+(r2*24&-1)|0;r7=0;if((HEAP[r1+r2|0]<<24>>24|0)==(r3|0)){___assert_func(36392,88,38116,34492)}r2=0;L924:do{if((r2|0)<(HEAP[r4|0]|0)){while(1){r8=HEAP[(r2<<2)+HEAP[r4+4|0]|0];r9=r8;if((HEAP[r8+8|0]|0)==(r4|0)){r10=HEAP[r9+12|0]}else{r10=HEAP[r9+8|0]}if((r10|0)==0){r11=2}else{r11=HEAP[r1+((r10-HEAP[r6+4|0]|0)/24&-1)|0]<<24>>24}if((r11|0)==(r3|0)){break}r2=r2+1|0;if((r2|0)>=(HEAP[r4|0]|0)){r5=639;break L924}}r7=1;break}else{r5=639}}while(0);do{if(r5==639){if((r7|0)!=0){break}r12=0;r13=r12;return r13}}while(0);r7=0;r2=0;r5=HEAP[HEAP[HEAP[HEAP[r4+8|0]|0]+8|0]|0];r11=r5;if((r11|0)==(r4|0)){r7=1;r10=HEAP[HEAP[HEAP[HEAP[r4+8|0]|0]+8|0]+4|0];r5=r10;r14=r10}else{r14=r11}r11=0;if((r14|0)==0){r15=2}else{r15=HEAP[r1+((r5-HEAP[r6+4|0]|0)/24&-1)|0]<<24>>24}r14=(r15|0)==(r3|0)&1;r15=0;r10=0;while(1){r7=r7+1|0;if((r7|0)==(HEAP[HEAP[(r2<<2)+HEAP[r4+8|0]|0]|0]|0)){r7=0}if((HEAP[(r7<<2)+HEAP[HEAP[(r2<<2)+HEAP[r4+8|0]|0]+8|0]|0]|0)==(r4|0)){r2=r2+1|0;if((r2|0)==(HEAP[r4|0]|0)){r2=0}r7=0;L957:do{if((r7|0)<(HEAP[HEAP[(r2<<2)+HEAP[r4+8|0]|0]|0]|0)){while(1){if((HEAP[(r7<<2)+HEAP[HEAP[(r2<<2)+HEAP[r4+8|0]|0]+8|0]|0]|0)==(r5|0)){break L957}r7=r7+1|0;if((r7|0)>=(HEAP[HEAP[(r2<<2)+HEAP[r4+8|0]|0]|0]|0)){break L957}}}}while(0);if((r7|0)!=(HEAP[HEAP[(r2<<2)+HEAP[r4+8|0]|0]|0]|0)){continue}___assert_func(36392,183,38116,34296);continue}r5=HEAP[(r7<<2)+HEAP[HEAP[(r2<<2)+HEAP[r4+8|0]|0]+8|0]|0];if((r5|0)==0){r16=2}else{r16=HEAP[r1+((r5-HEAP[r6+4|0]|0)/24&-1)|0]<<24>>24}r9=(r16|0)==(r3|0)&1;if((r15|0)==0){r15=HEAP[(r2<<2)+HEAP[r4+8|0]|0];r10=r5;r14=r9;continue}if((r9|0)!=(r14|0)){r11=r11+1|0;r14=r9;if((r11|0)>2){break}}if((HEAP[(r2<<2)+HEAP[r4+8|0]|0]|0)!=(r15|0)){continue}if((r5|0)==(r10|0)){break}}r12=(r11|0)==2?1:0;r13=r12;return r13}function _sfree(r1){var r2;r2=r1;if((r2|0)==0){return}_free(r2);return}function _srealloc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68;r3=STACKTOP;STACKTOP=STACKTOP+204|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r3+100;r30=r3+104;r31=r3+108;r32=r3+112;r33=r3+116;r34=r3+120;r35=r3+124;r36=r3+128;r37=r3+132;r38=r3+136;r39=r3+140;r40=r3+144;r41=r3+148;r42=r3+152;r43=r3+156;r44=r3+160;r45=r3+164;r46=r3+168;r47=r3+172;r48=r3+176;r49=r3+180;r50=r3+184;r51=r3+188;r52=r3+192;r53=r3+196;r54=r3+200;r55=r1;r1=r2;if((r55|0)!=0){HEAP[r47]=r55;HEAP[r48]=r1;HEAP[r49]=0;r55=HEAP[r48];do{if((HEAP[r47]|0)==0){r2=_malloc(r55);HEAP[r49]=r2}else{if(r55>>>0>=4294967232){r2=___errno_location();HEAP[r2]=12;break}if(HEAP[r48]>>>0<11){r56=16}else{r56=HEAP[r48]+11&-8}HEAP[r50]=r56;HEAP[r51]=HEAP[r47]-8|0;HEAP[r52]=36884;r2=HEAP[r51];r57=HEAP[r50];HEAP[r14]=HEAP[r52];HEAP[r15]=r2;HEAP[r16]=r57;HEAP[r17]=1;HEAP[r18]=0;HEAP[r19]=HEAP[HEAP[r15]+4|0]&-8;HEAP[r20]=HEAP[r15]+HEAP[r19]|0;do{if(HEAP[r15]>>>0>=HEAP[HEAP[r14]+16|0]>>>0){if((HEAP[HEAP[r15]+4|0]&3|0)==1){r58=0;break}if(HEAP[r15]>>>0>=HEAP[r20]>>>0){r58=0;break}r58=(HEAP[HEAP[r20]+4|0]&1|0)!=0}else{r58=0}}while(0);if((r58&1|0)==0){_abort()}L1001:do{if((HEAP[HEAP[r15]+4|0]&3|0)==0){r57=HEAP[r15];r2=HEAP[r16];r59=HEAP[r17];HEAP[r5]=HEAP[r14];HEAP[r6]=r57;HEAP[r7]=r2;HEAP[r8]=r59;HEAP[r9]=HEAP[HEAP[r6]+4|0]&-8;L1003:do{if(HEAP[r7]>>>3>>>0<32){HEAP[r4]=0}else{do{if(HEAP[r9]>>>0>=(HEAP[r7]+4|0)>>>0){if(!((HEAP[r9]-HEAP[r7]|0)>>>0<=HEAP[33240]<<1>>>0)){break}HEAP[r4]=HEAP[r6];break L1003}}while(0);HEAP[r10]=HEAP[HEAP[r6]|0];HEAP[r11]=HEAP[r9]+HEAP[r10]+16|0;HEAP[r12]=(HEAP[33236]-1^-1)&HEAP[r7]+HEAP[33236]+30;HEAP[r13]=-1;HEAP[r4]=0}}while(0);r59=HEAP[r4];HEAP[r18]=r59;r60=r59}else{if(HEAP[r19]>>>0>=HEAP[r16]>>>0){HEAP[r21]=HEAP[r19]-HEAP[r16]|0;if(HEAP[r21]>>>0>=16){HEAP[r22]=HEAP[r15]+HEAP[r16]|0;HEAP[HEAP[r15]+4|0]=HEAP[r16]|2|HEAP[HEAP[r15]+4|0]&1;r59=HEAP[r15]+HEAP[r16]+4|0;HEAP[r59]=HEAP[r59]|1;HEAP[HEAP[r22]+4|0]=HEAP[r21]|2|HEAP[HEAP[r22]+4|0]&1;r59=HEAP[r22]+HEAP[r21]+4|0;HEAP[r59]=HEAP[r59]|1;_dispose_chunk(HEAP[r14],HEAP[r22],HEAP[r21])}r59=HEAP[r15];HEAP[r18]=r59;r60=r59;break}do{if((HEAP[r20]|0)==(HEAP[HEAP[r14]+24|0]|0)){if((HEAP[HEAP[r14]+12|0]+HEAP[r19]|0)>>>0<=HEAP[r16]>>>0){break}HEAP[r23]=HEAP[HEAP[r14]+12|0]+HEAP[r19]|0;HEAP[r24]=HEAP[r23]-HEAP[r16]|0;HEAP[r25]=HEAP[r15]+HEAP[r16]|0;HEAP[HEAP[r15]+4|0]=HEAP[r16]|2|HEAP[HEAP[r15]+4|0]&1;r59=HEAP[r15]+HEAP[r16]+4|0;HEAP[r59]=HEAP[r59]|1;HEAP[HEAP[r25]+4|0]=HEAP[r24]|1;HEAP[HEAP[r14]+24|0]=HEAP[r25];HEAP[HEAP[r14]+12|0]=HEAP[r24];r59=HEAP[r15];HEAP[r18]=r59;r60=r59;break L1001}else{if((HEAP[r20]|0)==(HEAP[HEAP[r14]+20|0]|0)){HEAP[r26]=HEAP[HEAP[r14]+8|0];if(!((HEAP[r26]+HEAP[r19]|0)>>>0>=HEAP[r16]>>>0)){break}HEAP[r27]=HEAP[r26]+HEAP[r19]+ -HEAP[r16]|0;if(HEAP[r27]>>>0>=16){HEAP[r28]=HEAP[r15]+HEAP[r16]|0;HEAP[r29]=HEAP[r28]+HEAP[r27]|0;HEAP[HEAP[r15]+4|0]=HEAP[r16]|2|HEAP[HEAP[r15]+4|0]&1;r59=HEAP[r15]+HEAP[r16]+4|0;HEAP[r59]=HEAP[r59]|1;HEAP[HEAP[r28]+4|0]=HEAP[r27]|1;HEAP[HEAP[r28]+HEAP[r27]|0]=HEAP[r27];r59=HEAP[r29]+4|0;HEAP[r59]=HEAP[r59]&-2;HEAP[HEAP[r14]+8|0]=HEAP[r27];HEAP[HEAP[r14]+20|0]=HEAP[r28]}else{HEAP[r30]=HEAP[r26]+HEAP[r19]|0;HEAP[HEAP[r15]+4|0]=HEAP[r30]|2|HEAP[HEAP[r15]+4|0]&1;r59=HEAP[r15]+HEAP[r30]+4|0;HEAP[r59]=HEAP[r59]|1;HEAP[HEAP[r14]+8|0]=0;HEAP[HEAP[r14]+20|0]=0}r59=HEAP[r15];HEAP[r18]=r59;r60=r59;break L1001}if((HEAP[HEAP[r20]+4|0]&2|0)!=0){break}HEAP[r31]=HEAP[HEAP[r20]+4|0]&-8;if(!((HEAP[r31]+HEAP[r19]|0)>>>0>=HEAP[r16]>>>0)){break}HEAP[r32]=HEAP[r31]+HEAP[r19]+ -HEAP[r16]|0;r59=HEAP[r20];do{if(HEAP[r31]>>>3>>>0<32){HEAP[r33]=HEAP[r59+8|0];HEAP[r34]=HEAP[HEAP[r20]+12|0];HEAP[r35]=HEAP[r31]>>>3;do{if((HEAP[r33]|0)==((HEAP[r35]<<3)+HEAP[r14]+40|0)){r61=1}else{if(!(HEAP[r33]>>>0>=HEAP[HEAP[r14]+16|0]>>>0)){r61=0;break}r61=(HEAP[HEAP[r33]+12|0]|0)==(HEAP[r20]|0)}}while(0);if((r61&1|0)==0){_abort()}if((HEAP[r34]|0)==(HEAP[r33]|0)){r2=HEAP[r14]|0;HEAP[r2]=HEAP[r2]&(1<<HEAP[r35]^-1);break}do{if((HEAP[r34]|0)==((HEAP[r35]<<3)+HEAP[r14]+40|0)){r62=1}else{if(!(HEAP[r34]>>>0>=HEAP[HEAP[r14]+16|0]>>>0)){r62=0;break}r62=(HEAP[HEAP[r34]+8|0]|0)==(HEAP[r20]|0)}}while(0);if((r62&1|0)!=0){HEAP[HEAP[r33]+12|0]=HEAP[r34];HEAP[HEAP[r34]+8|0]=HEAP[r33];break}else{_abort()}}else{HEAP[r36]=r59;HEAP[r37]=HEAP[HEAP[r36]+24|0];r2=HEAP[r36];L1032:do{if((HEAP[HEAP[r36]+12|0]|0)!=(HEAP[r36]|0)){HEAP[r39]=HEAP[r2+8|0];HEAP[r38]=HEAP[HEAP[r36]+12|0];do{if(HEAP[r39]>>>0>=HEAP[HEAP[r14]+16|0]>>>0){if((HEAP[HEAP[r39]+12|0]|0)!=(HEAP[r36]|0)){r63=0;break}r63=(HEAP[HEAP[r38]+8|0]|0)==(HEAP[r36]|0)}else{r63=0}}while(0);if((r63&1|0)!=0){HEAP[HEAP[r39]+12|0]=HEAP[r38];HEAP[HEAP[r38]+8|0]=HEAP[r39];break}else{_abort()}}else{r57=r2+20|0;HEAP[r40]=r57;r64=HEAP[r57];HEAP[r38]=r64;do{if((r64|0)==0){r57=HEAP[r36]+16|0;HEAP[r40]=r57;r65=HEAP[r57];HEAP[r38]=r65;if((r65|0)!=0){break}else{break L1032}}}while(0);while(1){r64=HEAP[r38]+20|0;HEAP[r41]=r64;if((HEAP[r64]|0)==0){r64=HEAP[r38]+16|0;HEAP[r41]=r64;if((HEAP[r64]|0)==0){break}}r64=HEAP[r41];HEAP[r40]=r64;HEAP[r38]=HEAP[r64]}if((HEAP[r40]>>>0>=HEAP[HEAP[r14]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r40]]=0;break}else{_abort()}}}while(0);if((HEAP[r37]|0)==0){break}HEAP[r42]=(HEAP[HEAP[r36]+28|0]<<2)+HEAP[r14]+304|0;do{if((HEAP[r36]|0)==(HEAP[HEAP[r42]]|0)){r2=HEAP[r38];HEAP[HEAP[r42]]=r2;if((r2|0)!=0){break}r2=HEAP[r14]+4|0;HEAP[r2]=HEAP[r2]&(1<<HEAP[HEAP[r36]+28|0]^-1)}else{if((HEAP[r37]>>>0>=HEAP[HEAP[r14]+16|0]>>>0&1|0)==0){_abort()}r2=HEAP[r38];r64=HEAP[r37]+16|0;if((HEAP[HEAP[r37]+16|0]|0)==(HEAP[r36]|0)){HEAP[r64|0]=r2;break}else{HEAP[r64+4|0]=r2;break}}}while(0);if((HEAP[r38]|0)==0){break}if((HEAP[r38]>>>0>=HEAP[HEAP[r14]+16|0]>>>0&1|0)==0){_abort()}HEAP[HEAP[r38]+24|0]=HEAP[r37];r2=HEAP[HEAP[r36]+16|0];HEAP[r43]=r2;do{if((r2|0)!=0){if((HEAP[r43]>>>0>=HEAP[HEAP[r14]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r38]+16|0]=HEAP[r43];HEAP[HEAP[r43]+24|0]=HEAP[r38];break}else{_abort()}}}while(0);r2=HEAP[HEAP[r36]+20|0];HEAP[r44]=r2;if((r2|0)==0){break}if((HEAP[r44]>>>0>=HEAP[HEAP[r14]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r38]+20|0]=HEAP[r44];HEAP[HEAP[r44]+24|0]=HEAP[r38];break}else{_abort()}}}while(0);if(HEAP[r32]>>>0<16){HEAP[r45]=HEAP[r31]+HEAP[r19]|0;HEAP[HEAP[r15]+4|0]=HEAP[r45]|2|HEAP[HEAP[r15]+4|0]&1;r59=HEAP[r15]+HEAP[r45]+4|0;HEAP[r59]=HEAP[r59]|1}else{HEAP[r46]=HEAP[r15]+HEAP[r16]|0;HEAP[HEAP[r15]+4|0]=HEAP[r16]|2|HEAP[HEAP[r15]+4|0]&1;r59=HEAP[r15]+HEAP[r16]+4|0;HEAP[r59]=HEAP[r59]|1;HEAP[HEAP[r46]+4|0]=HEAP[r32]|2|HEAP[HEAP[r46]+4|0]&1;r59=HEAP[r46]+HEAP[r32]+4|0;HEAP[r59]=HEAP[r59]|1;_dispose_chunk(HEAP[r14],HEAP[r46],HEAP[r32])}r59=HEAP[r15];HEAP[r18]=r59;r60=r59;break L1001}}while(0);r60=HEAP[r18]}}while(0);HEAP[r53]=r60;if((r60|0)!=0){HEAP[r49]=HEAP[r53]+8|0;break}r59=_malloc(HEAP[r48]);HEAP[r49]=r59;if((HEAP[r49]|0)==0){break}HEAP[r54]=(HEAP[HEAP[r51]+4|0]&-8)-((HEAP[HEAP[r51]+4|0]&3|0)==0?8:4)|0;r59=HEAP[r49];r2=HEAP[r47];r64=HEAP[r54]>>>0<HEAP[r48]>>>0?HEAP[r54]:HEAP[r48];for(r65=r2,r57=r59,r66=r65+r64;r65<r66;r65++,r57++){HEAP[r57]=HEAP[r65]}_free(HEAP[r47])}}while(0);r47=HEAP[r49];r67=r47;r68=r47}else{r47=_malloc(r1);r67=r47;r68=r47}if((r68|0)!=0){STACKTOP=r3;return r67}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _midend_size(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+12|0;r7=r6;r8=r6+4;r9=r6+8;r10=r1;r1=r2;r2=r3;r3=r4;if((HEAP[r10+76|0]|0)!=0){if((HEAP[r10+132|0]|0)>0){FUNCTION_TABLE[HEAP[HEAP[r10+8|0]+140|0]](HEAP[r10+120|0],HEAP[r10+76|0]);r11=FUNCTION_TABLE[HEAP[HEAP[r10+8|0]+136|0]](HEAP[r10+120|0],HEAP[HEAP[r10+64|0]|0]);HEAP[r10+76|0]=r11}r12=r3}else{r12=r4}L1124:do{if((r12|0)!=0){r13=1;while(1){r13=r13<<1;FUNCTION_TABLE[HEAP[HEAP[r10+8|0]+124|0]](HEAP[r10+68|0],r13,r8,r9);if(!((HEAP[r8]|0)<=(HEAP[r1]|0))){break L1124}if(!((HEAP[r9]|0)<=(HEAP[r2]|0))){break L1124}}}else{r13=HEAP[r10+128|0]+1|0}}while(0);r12=1;L1131:do{if((r13-r12|0)>1){while(1){r4=(r12+r13|0)/2&-1;FUNCTION_TABLE[HEAP[HEAP[r10+8|0]+124|0]](HEAP[r10+68|0],r4,r8,r9);do{if((HEAP[r8]|0)<=(HEAP[r1]|0)){if(!((HEAP[r9]|0)<=(HEAP[r2]|0))){r5=785;break}r12=r4;break}else{r5=785}}while(0);if(r5==785){r5=0;r13=r4}if((r13-r12|0)<=1){break L1131}}}}while(0);HEAP[r10+132|0]=r12;if((r3|0)!=0){HEAP[r10+128|0]=HEAP[r10+132|0]}HEAP[r7]=r10;if((HEAP[HEAP[r7]+132|0]|0)<=0){r14=r7;r15=r10;r16=r15+136|0;r17=HEAP[r16];r18=r1;HEAP[r18]=r17;r19=r10;r20=r19+140|0;r21=HEAP[r20];r22=r2;HEAP[r22]=r21;STACKTOP=r6;return}FUNCTION_TABLE[HEAP[HEAP[HEAP[r7]+8|0]+124|0]](HEAP[HEAP[r7]+68|0],HEAP[HEAP[r7]+132|0],HEAP[r7]+136|0,HEAP[r7]+140|0);FUNCTION_TABLE[HEAP[HEAP[HEAP[r7]+8|0]+128|0]](HEAP[HEAP[r7]+120|0],HEAP[HEAP[r7]+76|0],HEAP[HEAP[r7]+68|0],HEAP[HEAP[r7]+132|0]);r14=r7;r15=r10;r16=r15+136|0;r17=HEAP[r16];r18=r1;HEAP[r18]=r17;r19=r10;r20=r19+140|0;r21=HEAP[r20];r22=r2;HEAP[r22]=r21;STACKTOP=r6;return}function _midend_set_params(r1,r2){var r3;r3=r1;FUNCTION_TABLE[HEAP[HEAP[r3+8|0]+28|0]](HEAP[r3+68|0]);r1=FUNCTION_TABLE[HEAP[HEAP[r3+8|0]+32|0]](r2);HEAP[r3+68|0]=r1;return}function _midend_get_params(r1){var r2;r2=r1;return FUNCTION_TABLE[HEAP[HEAP[r2+8|0]+32|0]](HEAP[r2+68|0])}function _midend_force_redraw(r1){var r2,r3,r4,r5,r6;r2=STACKTOP;STACKTOP=STACKTOP+4|0;r3=r2;r4=r1;if((HEAP[r4+76|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[r4+8|0]+140|0]](HEAP[r4+120|0],HEAP[r4+76|0])}r1=FUNCTION_TABLE[HEAP[HEAP[r4+8|0]+136|0]](HEAP[r4+120|0],HEAP[HEAP[r4+64|0]|0]);HEAP[r4+76|0]=r1;HEAP[r3]=r4;if((HEAP[HEAP[r3]+132|0]|0)<=0){r5=r3;r6=r4;_midend_redraw(r6);STACKTOP=r2;return}FUNCTION_TABLE[HEAP[HEAP[HEAP[r3]+8|0]+124|0]](HEAP[HEAP[r3]+68|0],HEAP[HEAP[r3]+132|0],HEAP[r3]+136|0,HEAP[r3]+140|0);FUNCTION_TABLE[HEAP[HEAP[HEAP[r3]+8|0]+128|0]](HEAP[HEAP[r3]+120|0],HEAP[HEAP[r3]+76|0],HEAP[HEAP[r3]+68|0],HEAP[HEAP[r3]+132|0]);r5=r3;r6=r4;_midend_redraw(r6);STACKTOP=r2;return}function _midend_redraw(r1){var r2,r3,r4,r5,r6;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r3+4;r6=r1;if((HEAP[r6+120|0]|0)==0){___assert_func(35472,869,37532,36808)}if((HEAP[r6+60|0]|0)<=0){STACKTOP=r3;return}if((HEAP[r6+76|0]|0)==0){STACKTOP=r3;return}HEAP[r5]=HEAP[r6+120|0];FUNCTION_TABLE[HEAP[HEAP[HEAP[r5]|0]+32|0]](HEAP[HEAP[r5]+4|0]);do{if((HEAP[r6+84|0]|0)!=0){if(HEAP[r6+88|0]<=0){r2=813;break}if(HEAP[r6+92|0]>=HEAP[r6+88|0]){r2=813;break}if((HEAP[r6+104|0]|0)==0){___assert_func(35472,875,37532,36736)}FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+144|0]](HEAP[r6+120|0],HEAP[r6+76|0],HEAP[r6+84|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0],HEAP[r6+104|0],HEAP[r6+80|0],HEAP[r6+92|0],HEAP[r6+100|0]);break}else{r2=813}}while(0);if(r2==813){FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+144|0]](HEAP[r6+120|0],HEAP[r6+76|0],0,HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0],1,HEAP[r6+80|0],0,HEAP[r6+100|0])}HEAP[r4]=HEAP[r6+120|0];FUNCTION_TABLE[HEAP[HEAP[HEAP[r4]|0]+36|0]](HEAP[HEAP[r4]+4|0]);STACKTOP=r3;return}function _dupstr(r1){var r2,r3,r4,r5;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=r2+4;r5=r1;r1=_strlen(r5)+1|0;HEAP[r3]=r1;r1=_malloc(HEAP[r3]);HEAP[r4]=r1;if((HEAP[r4]|0)!=0){r1=HEAP[r4];_strcpy(r1,r5);STACKTOP=r2;return r1}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _midend_can_undo(r1){return(HEAP[r1+60|0]|0)>1&1}function _midend_can_redo(r1){var r2;r2=r1;return(HEAP[r2+60|0]|0)<(HEAP[r2+52|0]|0)&1}function _midend_new_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+148|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+60;r17=r3+64;r18=r3+144;r19=r1;HEAP[r14]=r19;r1=HEAP[r14];L1186:do{if((HEAP[HEAP[r14]+52|0]|0)>0){r20=r1;while(1){r21=r20+52|0;HEAP[r21]=HEAP[r21]-1|0;FUNCTION_TABLE[HEAP[HEAP[HEAP[r14]+8|0]+68|0]](HEAP[HEAP[HEAP[r14]+64|0]+(HEAP[HEAP[r14]+52|0]*12&-1)|0]);r21=HEAP[HEAP[HEAP[r14]+64|0]+(HEAP[HEAP[r14]+52|0]*12&-1)+4|0];HEAP[r13]=r21;if((r21|0)!=0){_free(HEAP[r13])}r21=HEAP[r14];if((HEAP[HEAP[r14]+52|0]|0)>0){r20=r21}else{r22=r21;break L1186}}}else{r22=r1}}while(0);if((HEAP[r22+76|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r14]+8|0]+140|0]](HEAP[HEAP[r14]+120|0],HEAP[HEAP[r14]+76|0])}if((HEAP[r19+52|0]|0)!=0){___assert_func(35472,349,37576,34872)}r14=r19+48|0;if((HEAP[r19+48|0]|0)==1){HEAP[r14]=2}else{if((HEAP[r14]|0)==0){HEAP[r19+48|0]=2}else{HEAP[r15+15|0]=0;r14=((_random_upto(HEAP[r19+4|0],9)&255)<<24>>24)+49&255;HEAP[r15|0]=r14;r14=1;r22=r19;while(1){r1=((_random_upto(HEAP[r22+4|0],10)&255)<<24>>24)+48&255;HEAP[r15+r14|0]=r1;r1=r14+1|0;r14=r1;r23=r19;if((r1|0)<15){r22=r23}else{break}}HEAP[r12]=HEAP[r23+40|0];if((HEAP[r12]|0)!=0){_free(HEAP[r12])}r12=_dupstr(r15|0);HEAP[r19+40|0]=r12;if((HEAP[r19+72|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+28|0]](HEAP[r19+72|0])}r12=FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+32|0]](HEAP[r19+68|0]);HEAP[r19+72|0]=r12}r12=HEAP[r19+32|0];HEAP[r11]=r12;if((r12|0)!=0){_free(HEAP[r11])}r11=HEAP[r19+36|0];HEAP[r10]=r11;if((r11|0)!=0){_free(HEAP[r10])}r10=HEAP[r19+44|0];HEAP[r9]=r10;if((r10|0)!=0){_free(HEAP[r9])}HEAP[r19+44|0]=0;r9=_random_new(HEAP[r19+40|0],_strlen(HEAP[r19+40|0]));r10=FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+52|0]](HEAP[r19+72|0],r9,r19+44|0,(HEAP[r19+120|0]|0)!=0&1);HEAP[r19+32|0]=r10;HEAP[r19+36|0]=0;HEAP[r8]=r9;r9=HEAP[r8];HEAP[r7]=r9;if((r9|0)!=0){_free(HEAP[r7])}}if((HEAP[r19+52|0]|0)>=(HEAP[r19+56|0]|0)){HEAP[r19+56|0]=HEAP[r19+52|0]+128|0;r7=_srealloc(HEAP[r19+64|0],HEAP[r19+56|0]*12&-1);HEAP[r19+64|0]=r7}r7=FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+60|0]](r19,HEAP[r19+68|0],HEAP[r19+32|0]);HEAP[HEAP[r19+64|0]+(HEAP[r19+52|0]*12&-1)|0]=r7;do{if((HEAP[HEAP[r19+8|0]+72|0]|0)!=0){if((HEAP[r19+44|0]|0)==0){break}HEAP[r16]=0;r7=FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+76|0]](HEAP[HEAP[r19+64|0]|0],HEAP[HEAP[r19+64|0]|0],HEAP[r19+44|0],r16);do{if((r7|0)!=0){if((HEAP[r16]|0)!=0){r2=859;break}else{break}}else{r2=859}}while(0);if(r2==859){___assert_func(35472,430,37576,34476)}r9=FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+116|0]](HEAP[HEAP[r19+64|0]|0],r7);if((r9|0)==0){___assert_func(35472,432,37576,34292)}FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+68|0]](r9);r9=r7;HEAP[r6]=r9;if((r9|0)!=0){_free(HEAP[r6])}}}while(0);r6=HEAP[33256];do{if((r6|0)<0){_sprintf(r17|0,34052,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[HEAP[r19+8|0]|0],tempInt));r16=0;r9=0;L1250:do{if(HEAP[r17+r9|0]<<24>>24!=0){while(1){if((_isspace(HEAP[r17+r9|0]&255)|0)==0){r8=_toupper(HEAP[r17+r9|0]&255)&255;r10=r16;r16=r10+1|0;HEAP[r17+r10|0]=r8}r9=r9+1|0;if(HEAP[r17+r9|0]<<24>>24==0){break L1250}}}}while(0);HEAP[r17+r16|0]=0;if((_getenv(r17|0)|0)!=0){_fwrite(33912,26,1,HEAP[_stderr]);HEAP[33256]=1;r2=874;break}else{HEAP[33256]=0;break}}else{if((r6|0)!=0){r2=874;break}else{break}}}while(0);if(r2==874){HEAP[r18]=0;r2=FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+76|0]](HEAP[HEAP[r19+64|0]|0],HEAP[HEAP[r19+64|0]|0],0,r18);r6=r2;if((r2|0)==0|(HEAP[r18]|0)!=0){___assert_func(35472,478,37576,34476)}r18=FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+116|0]](HEAP[HEAP[r19+64|0]|0],r6);if((r18|0)==0){___assert_func(35472,480,37576,34292)}FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+68|0]](r18);r18=r6;HEAP[r5]=r18;if((r18|0)!=0){_free(HEAP[r5])}}HEAP[HEAP[r19+64|0]+(HEAP[r19+52|0]*12&-1)+4|0]=0;HEAP[HEAP[r19+64|0]+(HEAP[r19+52|0]*12&-1)+8|0]=0;r5=r19+52|0;HEAP[r5]=HEAP[r5]+1|0;HEAP[r19+60|0]=1;r5=FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+136|0]](HEAP[r19+120|0],HEAP[HEAP[r19+64|0]|0]);HEAP[r19+76|0]=r5;HEAP[r4]=r19;if((HEAP[HEAP[r4]+132|0]|0)>0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r4]+8|0]+124|0]](HEAP[HEAP[r4]+68|0],HEAP[HEAP[r4]+132|0],HEAP[r4]+136|0,HEAP[r4]+140|0);FUNCTION_TABLE[HEAP[HEAP[HEAP[r4]+8|0]+128|0]](HEAP[HEAP[r4]+120|0],HEAP[HEAP[r4]+76|0],HEAP[HEAP[r4]+68|0],HEAP[HEAP[r4]+132|0])}HEAP[r19+112|0]=0;if((HEAP[r19+80|0]|0)==0){r24=r19;r25=r24+8|0;r26=HEAP[r25];r27=r26+92|0;r28=HEAP[r27];r29=r19;r30=r29+64|0;r31=HEAP[r30];r32=r31|0;r33=r32|0;r34=HEAP[r33];r35=FUNCTION_TABLE[r28](r34);r36=r19;r37=r36+80|0;HEAP[r37]=r35;r38=r19;_midend_set_timer(r38);r39=r19;r40=r39+124|0;HEAP[r40]=0;STACKTOP=r3;return}FUNCTION_TABLE[HEAP[HEAP[r19+8|0]+96|0]](HEAP[r19+80|0]);r24=r19;r25=r24+8|0;r26=HEAP[r25];r27=r26+92|0;r28=HEAP[r27];r29=r19;r30=r29+64|0;r31=HEAP[r30];r32=r31|0;r33=r32|0;r34=HEAP[r33];r35=FUNCTION_TABLE[r28](r34);r36=r19;r37=r36+80|0;HEAP[r37]=r35;r38=r19;_midend_set_timer(r38);r39=r19;r40=r39+124|0;HEAP[r40]=0;STACKTOP=r3;return}function _midend_set_timer(r1){var r2,r3;r2=r1;if((HEAP[HEAP[r2+8|0]+180|0]|0)!=0){r3=(FUNCTION_TABLE[HEAP[HEAP[r2+8|0]+184|0]](HEAP[HEAP[r2+64|0]+((HEAP[r2+60|0]-1)*12&-1)|0],HEAP[r2+80|0])|0)!=0}else{r3=0}HEAP[r2+108|0]=r3&1;do{if((HEAP[r2+108|0]|0)==0){if(HEAP[r2+96|0]!=0){break}if(HEAP[r2+88|0]!=0){break}_deactivate_timer(HEAP[r2|0]);return}}while(0);_activate_timer(HEAP[r2|0]);return}function _midend_finish_move(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r2=0;r3=r1;do{if((HEAP[r3+84|0]|0)!=0){r2=900}else{if((HEAP[r3+60|0]|0)>1){r2=900;break}else{break}}}while(0);do{if(r2==900){do{if((HEAP[r3+104|0]|0)>0){if((HEAP[HEAP[r3+64|0]+((HEAP[r3+60|0]-1)*12&-1)+8|0]|0)!=1){r2=902;break}else{break}}else{r2=902}}while(0);if(r2==902){if((HEAP[r3+104|0]|0)>=0){break}if((HEAP[r3+60|0]|0)>=(HEAP[r3+52|0]|0)){break}if((HEAP[HEAP[r3+64|0]+(HEAP[r3+60|0]*12&-1)+8|0]|0)!=1){break}}r1=r3;if((HEAP[r3+84|0]|0)!=0){r4=HEAP[r1+84|0]}else{r4=HEAP[HEAP[r3+64|0]+((HEAP[r1+60|0]-2)*12&-1)|0]}if((HEAP[r3+84|0]|0)!=0){r5=HEAP[r3+104|0]}else{r5=1}r1=FUNCTION_TABLE[HEAP[HEAP[r3+8|0]+152|0]](r4,HEAP[HEAP[r3+64|0]+((HEAP[r3+60|0]-1)*12&-1)|0],r5,HEAP[r3+80|0]);if(r1<=0){break}HEAP[r3+100|0]=0;HEAP[r3+96|0]=r1}}while(0);if((HEAP[r3+84|0]|0)==0){r6=r3;r7=r6+84|0;HEAP[r7]=0;r8=r3;r9=r8+88|0;HEAP[r9]=0;r10=r3;r11=r10+92|0;HEAP[r11]=0;r12=r3;r13=r12+104|0;HEAP[r13]=0;r14=r3;_midend_set_timer(r14);return}FUNCTION_TABLE[HEAP[HEAP[r3+8|0]+68|0]](HEAP[r3+84|0]);r6=r3;r7=r6+84|0;HEAP[r7]=0;r8=r3;r9=r8+88|0;HEAP[r9]=0;r10=r3;r11=r10+92|0;HEAP[r11]=0;r12=r3;r13=r12+104|0;HEAP[r13]=0;r14=r3;_midend_set_timer(r14);return}function _midend_restart_game(r1){var r2,r3,r4,r5,r6;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r3+4;r6=r1;HEAP[r5]=r6;do{if((HEAP[HEAP[r5]+84|0]|0)!=0){r2=919}else{if(HEAP[HEAP[r5]+88|0]!=0){r2=919;break}else{break}}}while(0);if(r2==919){_midend_finish_move(HEAP[r5]);_midend_redraw(HEAP[r5])}if(!((HEAP[r6+60|0]|0)>=1)){___assert_func(35472,586,37512,33844)}if((HEAP[r6+60|0]|0)==1){STACKTOP=r3;return}r5=FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+60|0]](r6,HEAP[r6+68|0],HEAP[r6+32|0]);HEAP[r4]=r6;do{if((HEAP[HEAP[r4]+84|0]|0)!=0){r2=925}else{if(HEAP[HEAP[r4]+88|0]!=0){r2=925;break}else{break}}}while(0);if(r2==925){_midend_finish_move(HEAP[r4]);_midend_redraw(HEAP[r4])}_midend_purge_states(r6);if((HEAP[r6+52|0]|0)>=(HEAP[r6+56|0]|0)){HEAP[r6+56|0]=HEAP[r6+52|0]+128|0;r4=_srealloc(HEAP[r6+64|0],HEAP[r6+56|0]*12&-1);HEAP[r6+64|0]=r4}HEAP[HEAP[r6+64|0]+(HEAP[r6+52|0]*12&-1)|0]=r5;r5=_dupstr(HEAP[r6+32|0]);HEAP[HEAP[r6+64|0]+(HEAP[r6+52|0]*12&-1)+4|0]=r5;HEAP[HEAP[r6+64|0]+(HEAP[r6+52|0]*12&-1)+8|0]=3;r5=r6+52|0;r4=HEAP[r5]+1|0;HEAP[r5]=r4;HEAP[r6+60|0]=r4;if((HEAP[r6+80|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+108|0]](HEAP[r6+80|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-2)*12&-1)|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0])}HEAP[r6+88|0]=0;_midend_finish_move(r6);_midend_redraw(r6);_midend_set_timer(r6);STACKTOP=r3;return}function _midend_purge_states(r1){var r2,r3,r4;r2=r1;if((HEAP[r2+52|0]|0)<=(HEAP[r2+60|0]|0)){return}while(1){r1=HEAP[HEAP[r2+8|0]+68|0];r3=r2+52|0;r4=HEAP[r3]-1|0;HEAP[r3]=r4;FUNCTION_TABLE[r1](HEAP[HEAP[r2+64|0]+(r4*12&-1)|0]);if((HEAP[HEAP[r2+64|0]+(HEAP[r2+52|0]*12&-1)+4|0]|0)!=0){_sfree(HEAP[HEAP[r2+64|0]+(HEAP[r2+52|0]*12&-1)+4|0])}if((HEAP[r2+52|0]|0)<=(HEAP[r2+60|0]|0)){break}}return}function _midend_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11;r5=0;r6=r1;r1=r2;r2=r3;r3=r4;r4=1;do{if((r3-515|0)>>>0<=2){r5=943}else{if((r3-518|0)>>>0<=2){r5=943;break}if(!((r3-512|0)>>>0<=2)){break}if((HEAP[r6+124|0]|0)==0){break}r7=r4;if((1<<r3-512+((HEAP[r6+124|0]-512)*3&-1)&HEAP[HEAP[r6+8|0]+188|0]|0)!=0){r8=r7;r9=r8;return r9}if((r7|0)!=0){r10=(_midend_really_process_key(r6,r1,r2,HEAP[r6+124|0]+6|0)|0)!=0}else{r10=0}r4=r10&1;break}}while(0);do{if(r5==943){if((HEAP[r6+124|0]|0)==0){r8=r4;r9=r8;return r9}r10=HEAP[r6+124|0];if((r3-515|0)>>>0<=2){r3=r10+3|0;break}else{r3=r10+6|0;break}}}while(0);r5=r3;do{if((r3|0)==10|(r5|0)==13){r3=525}else{if((r5|0)==32){r3=526;break}if((r3|0)!=127){break}r3=8}}while(0);if((r4|0)!=0){r11=(_midend_really_process_key(r6,r1,r2,r3)|0)!=0}else{r11=0}r4=r11&1;do{if((r3-518|0)>>>0<=2){HEAP[r6+124|0]=0}else{if(!((r3-512|0)>>>0<=2)){break}HEAP[r6+124|0]=r3}}while(0);r8=r4;r9=r8;return r9}function _midend_really_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+32|0;r7=r6;r8=r6+4;r9=r6+8;r10=r6+12;r11=r6+16;r12=r6+20;r13=r6+24;r14=r6+28;r15=r1;r1=r4;r4=FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+64|0]](HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)|0]);r16=1;r17=0;r18=1;r19=FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+112|0]](HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)|0],HEAP[r15+80|0],HEAP[r15+76|0],r2,r3,r1);L1389:do{if((r19|0)!=0){r3=r15;do{if(HEAP[r19]<<24>>24!=0){r20=FUNCTION_TABLE[HEAP[HEAP[r3+8|0]+116|0]](HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)|0],r19);if((r20|0)!=0){break}___assert_func(35472,664,37548,34036)}else{r20=HEAP[HEAP[r15+64|0]+((HEAP[r3+60|0]-1)*12&-1)|0]}}while(0);if((r20|0)==(HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)|0]|0)){_midend_redraw(r15);_midend_set_timer(r15);break}if((r20|0)==0){break}HEAP[r7]=r15;do{if((HEAP[HEAP[r7]+84|0]|0)!=0){r5=1010}else{if(HEAP[HEAP[r7]+88|0]!=0){r5=1010;break}else{break}}}while(0);if(r5==1010){_midend_finish_move(HEAP[r7]);_midend_redraw(HEAP[r7])}_midend_purge_states(r15);if((HEAP[r15+52|0]|0)>=(HEAP[r15+56|0]|0)){HEAP[r15+56|0]=HEAP[r15+52|0]+128|0;r3=_srealloc(HEAP[r15+64|0],HEAP[r15+56|0]*12&-1);HEAP[r15+64|0]=r3}if((r19|0)==0){___assert_func(35472,680,37548,34020)}HEAP[HEAP[r15+64|0]+(HEAP[r15+52|0]*12&-1)|0]=r20;HEAP[HEAP[r15+64|0]+(HEAP[r15+52|0]*12&-1)+4|0]=r19;HEAP[HEAP[r15+64|0]+(HEAP[r15+52|0]*12&-1)+8|0]=1;r3=r15+52|0;r2=HEAP[r3]+1|0;HEAP[r3]=r2;HEAP[r15+60|0]=r2;HEAP[r15+104|0]=1;if((HEAP[r15+80|0]|0)==0){r5=1017;break}FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+108|0]](HEAP[r15+80|0],HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-2)*12&-1)|0],HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)|0]);r5=1017;break}else{if((r1|0)==110|(r1|0)==78|(r1|0)==14){HEAP[r14]=r15;do{if((HEAP[HEAP[r14]+84|0]|0)!=0){r5=976}else{if(HEAP[HEAP[r14]+88|0]!=0){r5=976;break}else{break}}}while(0);if(r5==976){_midend_finish_move(HEAP[r14]);_midend_redraw(HEAP[r14])}_midend_new_game(r15);_midend_redraw(r15);break}if((r1|0)==117|(r1|0)==85|(r1|0)==26|(r1|0)==31){HEAP[r13]=r15;do{if((HEAP[HEAP[r13]+84|0]|0)!=0){r5=981}else{if(HEAP[HEAP[r13]+88|0]!=0){r5=981;break}else{break}}}while(0);if(r5==981){_midend_finish_move(HEAP[r13]);_midend_redraw(HEAP[r13])}r16=HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)+8|0];r17=1;HEAP[r12]=r15;if((HEAP[HEAP[r12]+60|0]|0)<=1){HEAP[r11]=0;break}if((HEAP[HEAP[r12]+80|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r12]+8|0]+108|0]](HEAP[HEAP[r12]+80|0],HEAP[HEAP[HEAP[r12]+64|0]+((HEAP[HEAP[r12]+60|0]-1)*12&-1)|0],HEAP[HEAP[HEAP[r12]+64|0]+((HEAP[HEAP[r12]+60|0]-2)*12&-1)|0])}r2=HEAP[r12]+60|0;HEAP[r2]=HEAP[r2]-1|0;HEAP[HEAP[r12]+104|0]=-1;HEAP[r11]=1;r5=1017;break}if(!((r1|0)==114|(r1|0)==82|(r1|0)==18|(r1|0)==25)){do{if((r1|0)==19){if((HEAP[HEAP[r15+8|0]+72|0]|0)==0){break}if((_midend_solve(r15)|0)!=0){break L1389}else{r5=1017;break L1389}}}while(0);if(!((r1|0)==113|(r1|0)==81|(r1|0)==17)){break}r18=0;break}HEAP[r10]=r15;do{if((HEAP[HEAP[r10]+84|0]|0)!=0){r5=990}else{if(HEAP[HEAP[r10]+88|0]!=0){r5=990;break}else{break}}}while(0);if(r5==990){_midend_finish_move(HEAP[r10]);_midend_redraw(HEAP[r10])}HEAP[r9]=r15;if((HEAP[HEAP[r9]+60|0]|0)>=(HEAP[HEAP[r9]+52|0]|0)){HEAP[r8]=0;break}if((HEAP[HEAP[r9]+80|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r9]+8|0]+108|0]](HEAP[HEAP[r9]+80|0],HEAP[HEAP[HEAP[r9]+64|0]+((HEAP[HEAP[r9]+60|0]-1)*12&-1)|0],HEAP[HEAP[HEAP[r9]+64|0]+(HEAP[HEAP[r9]+60|0]*12&-1)|0])}r2=HEAP[r9]+60|0;HEAP[r2]=HEAP[r2]+1|0;HEAP[HEAP[r9]+104|0]=1;HEAP[r8]=1;r5=1017;break}}while(0);if(r5==1017){if((r17|0)!=0){r21=r16}else{r17=HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)+8|0];r16=r17;r21=r17}do{if((r21|0)!=1){if((r16|0)==2){if((HEAP[HEAP[r15+8|0]+188|0]&512|0)!=0){r5=1024;break}}r22=0;break}else{r5=1024}}while(0);if(r5==1024){r22=FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+148|0]](r4,HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)|0],HEAP[r15+104|0],HEAP[r15+80|0])}HEAP[r15+84|0]=r4;r4=0;if(r22>0){HEAP[r15+88|0]=r22}else{HEAP[r15+88|0]=0;_midend_finish_move(r15)}HEAP[r15+92|0]=0;_midend_redraw(r15);_midend_set_timer(r15)}if((r4|0)==0){r23=r18;STACKTOP=r6;return r23}FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+68|0]](r4);r23=r18;STACKTOP=r6;return r23}function _midend_wants_statusbar(r1){return HEAP[HEAP[r1+8|0]+176|0]}function _midend_which_preset(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=STACKTOP;STACKTOP=STACKTOP+4|0;r3=r2;r4=r1;r1=FUNCTION_TABLE[HEAP[HEAP[r4+8|0]+24|0]](HEAP[r4+68|0],1);r5=-1;r6=0;L1479:do{if((r6|0)<(HEAP[r4+24|0]|0)){while(1){r7=r6;if((_strcmp(r1,HEAP[(r6<<2)+HEAP[r4+20|0]|0])|0)==0){break}r6=r7+1|0;if((r6|0)>=(HEAP[r4+24|0]|0)){break L1479}}r5=r7}}while(0);r7=r1;HEAP[r3]=r7;if((r7|0)==0){r8=r3;r9=r5;STACKTOP=r2;return r9}_free(HEAP[r3]);r8=r3;r9=r5;STACKTOP=r2;return r9}function _midend_solve(r1){var r2,r3,r4,r5,r6,r7,r8;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r3+4;r6=r1;if((HEAP[HEAP[r6+8|0]+72|0]|0)==0){r7=35660;r8=r7;STACKTOP=r3;return r8}if((HEAP[r6+60|0]|0)<1){r7=35588;r8=r7;STACKTOP=r3;return r8}HEAP[r5]=0;r1=FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+76|0]](HEAP[HEAP[r6+64|0]|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0],HEAP[r6+44|0],r5);if((r1|0)==0){if((HEAP[r5]|0)==0){HEAP[r5]=35508}r7=HEAP[r5];r8=r7;STACKTOP=r3;return r8}r5=FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+116|0]](HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0],r1);if((r5|0)==0){___assert_func(35472,1376,37496,34292)}HEAP[r4]=r6;do{if((HEAP[HEAP[r4]+84|0]|0)!=0){r2=1056}else{if(HEAP[HEAP[r4]+88|0]!=0){r2=1056;break}else{break}}}while(0);if(r2==1056){_midend_finish_move(HEAP[r4]);_midend_redraw(HEAP[r4])}_midend_purge_states(r6);if((HEAP[r6+52|0]|0)>=(HEAP[r6+56|0]|0)){HEAP[r6+56|0]=HEAP[r6+52|0]+128|0;r4=_srealloc(HEAP[r6+64|0],HEAP[r6+56|0]*12&-1);HEAP[r6+64|0]=r4}HEAP[HEAP[r6+64|0]+(HEAP[r6+52|0]*12&-1)|0]=r5;HEAP[HEAP[r6+64|0]+(HEAP[r6+52|0]*12&-1)+4|0]=r1;HEAP[HEAP[r6+64|0]+(HEAP[r6+52|0]*12&-1)+8|0]=2;r1=r6+52|0;r5=HEAP[r1]+1|0;HEAP[r1]=r5;HEAP[r6+60|0]=r5;if((HEAP[r6+80|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+108|0]](HEAP[r6+80|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-2)*12&-1)|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0])}HEAP[r6+104|0]=1;r5=r6;if((HEAP[HEAP[r6+8|0]+188|0]&512|0)!=0){r1=FUNCTION_TABLE[HEAP[HEAP[r5+8|0]+64|0]](HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-2)*12&-1)|0]);HEAP[r6+84|0]=r1;r1=FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+148|0]](HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-2)*12&-1)|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0],1,HEAP[r6+80|0]);HEAP[r6+88|0]=r1;HEAP[r6+92|0]=0}else{HEAP[r5+88|0]=0;_midend_finish_move(r6)}if((HEAP[r6+120|0]|0)!=0){_midend_redraw(r6)}_midend_set_timer(r6);r7=0;r8=r7;STACKTOP=r3;return r8}function _midend_status(r1){var r2,r3;r2=r1;if((HEAP[r2+60|0]|0)==0){r1=1;r3=r1;return r3}else{r1=FUNCTION_TABLE[HEAP[HEAP[r2+8|0]+156|0]](HEAP[HEAP[r2+64|0]+((HEAP[r2+60|0]-1)*12&-1)|0]);r3=r1;return r3}}function _midend_timer(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+156|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r4+24;r12=r4+28;r13=r4+32;r14=r4+132;r15=r4+136;r16=r4+140;r17=r4+144;r18=r4+148;r19=r4+152;r20=r1;r1=r2;if(HEAP[r20+88|0]>0){r21=1}else{r21=HEAP[r20+96|0]>0}r2=r21&1;r21=r20+92|0;HEAP[r21]=r1+HEAP[r21];do{if(HEAP[r20+92|0]>=HEAP[r20+88|0]){r3=1083}else{if(HEAP[r20+88|0]==0){r3=1083;break}if((HEAP[r20+84|0]|0)!=0){break}else{r3=1083;break}}}while(0);do{if(r3==1083){if(HEAP[r20+88|0]<=0){break}_midend_finish_move(r20)}}while(0);r21=r20+100|0;HEAP[r21]=r1+HEAP[r21];do{if(HEAP[r20+100|0]>=HEAP[r20+96|0]){r3=1087}else{if(HEAP[r20+96|0]==0){r3=1087;break}else{break}}}while(0);if(r3==1087){HEAP[r20+96|0]=0;HEAP[r20+100|0]=0}if((r2|0)!=0){_midend_redraw(r20)}if((HEAP[r20+108|0]|0)==0){r22=r20;_midend_set_timer(r22);STACKTOP=r4;return}r2=HEAP[r20+112|0];r3=r20+112|0;HEAP[r3]=r1+HEAP[r3];if((r2&-1|0)==(HEAP[r20+112|0]&-1|0)){r22=r20;_midend_set_timer(r22);STACKTOP=r4;return}if((HEAP[r20+116|0]|0)!=0){r23=HEAP[r20+116|0]}else{r23=36628}HEAP[r17]=HEAP[r20+120|0];HEAP[r18]=r23;L1561:do{if((HEAP[HEAP[HEAP[r17]|0]+40|0]|0)!=0){if((HEAP[HEAP[r17]+24|0]|0)==0){___assert_func(34144,198,37428,35752)}r23=HEAP[r18];HEAP[r11]=HEAP[HEAP[r17]+24|0];HEAP[r12]=r23;if((HEAP[HEAP[r11]+116|0]|0)!=(HEAP[r12]|0)){HEAP[r9]=HEAP[HEAP[r11]+116|0];if((HEAP[r9]|0)!=0){_free(HEAP[r9])}r23=_dupstr(HEAP[r12]);HEAP[HEAP[r11]+116|0]=r23}do{if((HEAP[HEAP[HEAP[r11]+8|0]+180|0]|0)!=0){HEAP[r16]=HEAP[HEAP[r11]+112|0]&-1;HEAP[r15]=(HEAP[r16]|0)/60&-1;HEAP[r16]=(HEAP[r16]|0)%60;r23=HEAP[r16];_sprintf(r13|0,35416,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=HEAP[r15],HEAP[tempInt+4]=r23,tempInt));r23=_strlen(r13|0)+_strlen(HEAP[r12])+1|0;HEAP[r7]=r23;r23=_malloc(HEAP[r7]);HEAP[r8]=r23;if((HEAP[r8]|0)!=0){HEAP[r14]=HEAP[r8];_strcpy(HEAP[r14],r13|0);_strcat(HEAP[r14],HEAP[r12]);HEAP[r10]=HEAP[r14];break}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}else{r23=_dupstr(HEAP[r12]);HEAP[r10]=r23}}while(0);HEAP[r19]=HEAP[r10];do{if((HEAP[HEAP[r17]+28|0]|0)!=0){if((_strcmp(HEAP[r19],HEAP[HEAP[r17]+28|0])|0)!=0){break}HEAP[r5]=HEAP[r19];if((HEAP[r5]|0)!=0){_free(HEAP[r5])}break L1561}}while(0);FUNCTION_TABLE[HEAP[HEAP[HEAP[r17]|0]+40|0]](HEAP[HEAP[r17]+4|0],HEAP[r19]);r23=HEAP[HEAP[r17]+28|0];HEAP[r6]=r23;if((r23|0)!=0){_free(HEAP[r6])}HEAP[HEAP[r17]+28|0]=HEAP[r19]}}while(0);r22=r20;_midend_set_timer(r22);STACKTOP=r4;return}function _shuffle(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r4=STACKTOP;STACKTOP=STACKTOP+536|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+524;r10=r4+528;r11=r4+532;r12=4;r13=r3;r3=r1;r1=r2;r2=r1-1|0;if((r1|0)<=1){STACKTOP=r4;return}r1=r8;r14=r8;while(1){r8=_random_upto(r13,r2+1|0);r15=r2;if((r8|0)!=(r15|0)){r16=r3+Math.imul(r2,r12)|0;r17=r3+Math.imul(r8,r12)|0;r8=r12;HEAP[r5]=r16;HEAP[r6]=r17;HEAP[r7]=r8;HEAP[r9]=HEAP[r5];HEAP[r10]=HEAP[r6];L1599:do{if((r8|0)>0){while(1){HEAP[r11]=HEAP[r7]>>>0<512?HEAP[r7]:512;r17=HEAP[r9];r16=HEAP[r11];for(r18=r17,r19=r1,r20=r18+r16;r18<r20;r18++,r19++){HEAP[r19]=HEAP[r18]}r16=HEAP[r9];r17=HEAP[r10];r21=HEAP[r11];for(r18=r17,r19=r16,r20=r18+r21;r18<r20;r18++,r19++){HEAP[r19]=HEAP[r18]}r21=HEAP[r10];r16=HEAP[r11];for(r18=r14,r19=r21,r20=r18+r16;r18<r20;r18++,r19++){HEAP[r19]=HEAP[r18]}HEAP[r9]=HEAP[r9]+HEAP[r11]|0;HEAP[r10]=HEAP[r10]+HEAP[r11]|0;r16=HEAP[r7]-HEAP[r11]|0;HEAP[r7]=r16;if((r16|0)<=0){break L1599}}}}while(0);r22=r2}else{r22=r15}r2=r22-1|0;if((r22|0)<=1){break}}STACKTOP=r4;return}function _v_rotate(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36;r7=STACKTOP;STACKTOP=STACKTOP+64|0;r8=r7;r9=r7+16;r10=r7+32;r11=r7+48;HEAP[r10|0]=r2;HEAP[r10+4|0]=r3;HEAP[r10+8|0]=r4;HEAP[r10+12|0]=r5;r5=r6;r6=r5;if(((r6|0)%36|0)==0){r12=r6}else{___assert_func(35800,164,37372,36612);r12=r5}r6=r5;if((r12|0)<0){r12=r6+360|0;r4=r6+(Math.floor(((((r12|0)>0?r12:0)-1-r6|0)>>>0)/360)*360&-1)+360|0;r5=r4;r13=r4}else{r13=r6}r5=360-r13|0;r13=0;if((r13|0)>=((r5|0)/36&-1|0)){r14=r1;r15=r10;for(r16=r15,r17=r14,r18=r16+16;r16<r18;r16++,r17++){HEAP[r17]=HEAP[r16]}STACKTOP=r7;return}r6=r10|0;r4=r10+4|0;r12=r10+8|0;r3=r10+12|0;r2=r8|0;r19=r8+4|0;r20=r8+8|0;r21=r8+12|0;r22=r8+12|0;r23=r9|0;r24=r8+12|0;r25=r8|0;r26=r9+4|0;r27=r8+12|0;r28=r8+4|0;r29=r9+8|0;r30=r8+12|0;r31=r8+8|0;r8=r9+12|0;r32=r11;r33=r9;r9=r10;r34=r11;while(1){r11=HEAP[r4];r35=HEAP[r12];r36=HEAP[r3];HEAP[r2]=HEAP[r6];HEAP[r19]=r11;HEAP[r20]=r35;HEAP[r21]=r36;HEAP[r23]=-HEAP[r22]|0;HEAP[r26]=HEAP[r25]+HEAP[r24]|0;HEAP[r29]=HEAP[r28]+ -HEAP[r27]|0;HEAP[r8]=HEAP[r31]+HEAP[r30]|0;for(r16=r33,r17=r32,r18=r16+16;r16<r18;r16++,r17++){HEAP[r17]=HEAP[r16]}for(r16=r34,r17=r9,r18=r16+16;r16<r18;r16++,r17++){HEAP[r17]=HEAP[r16]}r13=r13+1|0;if((r13|0)>=((r5|0)/36&-1|0)){break}}r14=r1;r15=r10;for(r16=r15,r17=r14,r18=r16+16;r16<r18;r16++,r17++){HEAP[r17]=HEAP[r16]}STACKTOP=r7;return}function _penrose_p2_large(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11){var r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r12=STACKTOP;STACKTOP=STACKTOP+400|0;r13=r12;r14=r12+16;r15=r12+32;r16=r12+48;r17=r12+64;r18=r12+80;r19=r12+96;r20=r12+112;r21=r12+128;r22=r12+144;r23=r12+160;r24=r12+176;r25=r12+192;r26=r12+256;r27=r12+272;r28=r12+288;r29=r12+304;r30=r12+320;r31=r12+336;r32=r12+352;r33=r12+368;r34=r12+384;r35=r1;r1=r2;r2=r3;HEAP[r21|0]=r4;HEAP[r21+4|0]=r5;HEAP[r21+8|0]=r6;HEAP[r21+12|0]=r7;HEAP[r22|0]=r8;HEAP[r22+4|0]=r9;HEAP[r22+8|0]=r10;HEAP[r22+12|0]=r11;if((r2|0)>0){r11=r25|0;r10=r21;for(r36=r10,r37=r11,r38=r36+16;r36<r38;r36++,r37++){HEAP[r37]=HEAP[r36]}r11=r25|0;_xform_coord(r26,HEAP[r22|0],HEAP[r22+4|0],HEAP[r22+8|0],HEAP[r22+12|0],0,HEAP[r11|0],HEAP[r11+4|0],HEAP[r11+8|0],HEAP[r11+12|0],-36);r11=r25+16|0;r10=r26;for(r36=r10,r37=r11,r38=r36+16;r36<r38;r36++,r37++){HEAP[r37]=HEAP[r36]}r11=r25|0;_xform_coord(r27,HEAP[r22|0],HEAP[r22+4|0],HEAP[r22+8|0],HEAP[r22+12|0],0,HEAP[r11|0],HEAP[r11+4|0],HEAP[r11+8|0],HEAP[r11+12|0],0);r11=r25+32|0;r10=r27;for(r36=r10,r37=r11,r38=r36+16;r36<r38;r36++,r37++){HEAP[r37]=HEAP[r36]}r11=r25|0;_xform_coord(r28,HEAP[r22|0],HEAP[r22+4|0],HEAP[r22+8|0],HEAP[r22+12|0],0,HEAP[r11|0],HEAP[r11+4|0],HEAP[r11+8|0],HEAP[r11+12|0],36);r11=r25+48|0;r10=r28;for(r36=r10,r37=r11,r38=r36+16;r36<r38;r36++,r37++){HEAP[r37]=HEAP[r36]}FUNCTION_TABLE[HEAP[r35+8|0]](r35,r25|0,4,r1)}if((r1|0)>=(HEAP[r35+4|0]|0)){r25=0;r11=r25;STACKTOP=r12;return r11}else{_v_rotate(r29,HEAP[r22|0],HEAP[r22+4|0],HEAP[r22+8|0],HEAP[r22+12|0],r2*-36&-1);r10=HEAP[r21+4|0];r28=HEAP[r21+8|0];r27=HEAP[r21+12|0];r26=HEAP[r29|0];r9=HEAP[r29+4|0];r8=HEAP[r29+8|0];r7=HEAP[r29+12|0];HEAP[r15|0]=HEAP[r21|0];HEAP[r15+4|0]=r10;HEAP[r15+8|0]=r28;HEAP[r15+12|0]=r27;HEAP[r16|0]=r26;HEAP[r16+4|0]=r9;HEAP[r16+8|0]=r8;HEAP[r16+12|0]=r7;r7=r15|0;HEAP[r7]=HEAP[r7]+HEAP[r16|0]|0;r7=r15+4|0;HEAP[r7]=HEAP[r7]+HEAP[r16+4|0]|0;r7=r15+8|0;HEAP[r7]=HEAP[r7]+HEAP[r16+8|0]|0;r7=r15+12|0;HEAP[r7]=HEAP[r7]+HEAP[r16+12|0]|0;r16=r30;r7=r15;for(r36=r7,r37=r16,r38=r36+16;r36<r38;r36++,r37++){HEAP[r37]=HEAP[r36]}r16=r23;r7=r30;for(r36=r7,r37=r16,r38=r36+16;r36<r38;r36++,r37++){HEAP[r37]=HEAP[r36]}_v_rotate(r31,HEAP[r22|0],HEAP[r22+4|0],HEAP[r22+8|0],HEAP[r22+12|0],r2*108&-1);r16=r24;r7=r31;for(r36=r7,r37=r16,r38=r36+16;r36<r38;r36++,r37++){HEAP[r37]=HEAP[r36]}r16=r35;r7=r1+1|0;r31=r2;r30=HEAP[r22+4|0];r15=HEAP[r22+8|0];r8=HEAP[r22+12|0];HEAP[r13|0]=HEAP[r22|0];HEAP[r13+4|0]=r30;HEAP[r13+8|0]=r15;HEAP[r13+12|0]=r8;HEAP[r14|0]=HEAP[r13+4|0]-HEAP[r13+12|0]|0;HEAP[r14+4|0]=HEAP[r13+12|0]+HEAP[r13+8|0]+ -HEAP[r13+4|0]|0;HEAP[r14+8|0]=HEAP[r13+4|0]+HEAP[r13|0]+ -HEAP[r13+8|0]|0;HEAP[r14+12|0]=HEAP[r13+8|0]-HEAP[r13|0]|0;r13=r32;r8=r14;for(r36=r8,r37=r13,r38=r36+16;r36<r38;r36++,r37++){HEAP[r37]=HEAP[r36]}_penrose_p2_small(r16,r7,r31,HEAP[r21|0],HEAP[r21+4|0],HEAP[r21+8|0],HEAP[r21+12|0],HEAP[r32|0],HEAP[r32+4|0],HEAP[r32+8|0],HEAP[r32+12|0]);r32=r35;r21=r1+1|0;r31=r2;r7=HEAP[r24+4|0];r16=HEAP[r24+8|0];r13=HEAP[r24+12|0];HEAP[r17|0]=HEAP[r24|0];HEAP[r17+4|0]=r7;HEAP[r17+8|0]=r16;HEAP[r17+12|0]=r13;HEAP[r18|0]=HEAP[r17+4|0]-HEAP[r17+12|0]|0;HEAP[r18+4|0]=HEAP[r17+12|0]+HEAP[r17+8|0]+ -HEAP[r17+4|0]|0;HEAP[r18+8|0]=HEAP[r17+4|0]+HEAP[r17|0]+ -HEAP[r17+8|0]|0;HEAP[r18+12|0]=HEAP[r17+8|0]-HEAP[r17|0]|0;r17=r33;r13=r18;for(r36=r13,r37=r17,r38=r36+16;r36<r38;r36++,r37++){HEAP[r37]=HEAP[r36]}_penrose_p2_large(r32,r21,r31,HEAP[r23|0],HEAP[r23+4|0],HEAP[r23+8|0],HEAP[r23+12|0],HEAP[r33|0],HEAP[r33+4|0],HEAP[r33+8|0],HEAP[r33+12|0]);r33=r35;r35=r1+1|0;r1=-r2|0;r2=HEAP[r24+4|0];r31=HEAP[r24+8|0];r21=HEAP[r24+12|0];HEAP[r19|0]=HEAP[r24|0];HEAP[r19+4|0]=r2;HEAP[r19+8|0]=r31;HEAP[r19+12|0]=r21;HEAP[r20|0]=HEAP[r19+4|0]-HEAP[r19+12|0]|0;HEAP[r20+4|0]=HEAP[r19+12|0]+HEAP[r19+8|0]+ -HEAP[r19+4|0]|0;HEAP[r20+8|0]=HEAP[r19+4|0]+HEAP[r19|0]+ -HEAP[r19+8|0]|0;HEAP[r20+12|0]=HEAP[r19+8|0]-HEAP[r19|0]|0;r19=r34;r21=r20;for(r36=r21,r37=r19,r38=r36+16;r36<r38;r36++,r37++){HEAP[r37]=HEAP[r36]}_penrose_p2_large(r33,r35,r1,HEAP[r23|0],HEAP[r23+4|0],HEAP[r23+8|0],HEAP[r23+12|0],HEAP[r34|0],HEAP[r34+4|0],HEAP[r34+8|0],HEAP[r34+12|0]);r25=0;r11=r25;STACKTOP=r12;return r11}}function _penrose_p3_small(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11){var r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r12=STACKTOP;STACKTOP=STACKTOP+336|0;r13=r12;r14=r12+16;r15=r12+32;r16=r12+48;r17=r12+64;r18=r12+80;r19=r12+96;r20=r12+112;r21=r12+128;r22=r12+144;r23=r12+208;r24=r12+224;r25=r12+240;r26=r12+256;r27=r12+272;r28=r12+288;r29=r12+304;r30=r12+320;r31=r1;r1=r2;r2=r3;HEAP[r19|0]=r4;HEAP[r19+4|0]=r5;HEAP[r19+8|0]=r6;HEAP[r19+12|0]=r7;HEAP[r20|0]=r8;HEAP[r20+4|0]=r9;HEAP[r20+8|0]=r10;HEAP[r20+12|0]=r11;if((r2|0)>0){r11=r22|0;r10=r19;for(r32=r10,r33=r11,r34=r32+16;r32<r34;r32++,r33++){HEAP[r33]=HEAP[r32]}r11=r22|0;_xform_coord(r23,HEAP[r20|0],HEAP[r20+4|0],HEAP[r20+8|0],HEAP[r20+12|0],0,HEAP[r11|0],HEAP[r11+4|0],HEAP[r11+8|0],HEAP[r11+12|0],-36);r11=r22+16|0;r10=r23;for(r32=r10,r33=r11,r34=r32+16;r32<r34;r32++,r33++){HEAP[r33]=HEAP[r32]}r11=r22|0;_xform_coord(r24,HEAP[r20|0],HEAP[r20+4|0],HEAP[r20+8|0],HEAP[r20+12|0],0,HEAP[r11|0],HEAP[r11+4|0],HEAP[r11+8|0],HEAP[r11+12|0],0);r11=r22+48|0;r10=r24;for(r32=r10,r33=r11,r34=r32+16;r32<r34;r32++,r33++){HEAP[r33]=HEAP[r32]}r11=r22+48|0;_xform_coord(r25,HEAP[r20|0],HEAP[r20+4|0],HEAP[r20+8|0],HEAP[r20+12|0],0,HEAP[r11|0],HEAP[r11+4|0],HEAP[r11+8|0],HEAP[r11+12|0],-36);r11=r22+32|0;r10=r25;for(r32=r10,r33=r11,r34=r32+16;r32<r34;r32++,r33++){HEAP[r33]=HEAP[r32]}FUNCTION_TABLE[HEAP[r31+8|0]](r31,r22|0,4,r1)}if((r1|0)>=(HEAP[r31+4|0]|0)){r22=0;r11=r22;STACKTOP=r12;return r11}else{r10=HEAP[r19+4|0];r25=HEAP[r19+8|0];r24=HEAP[r19+12|0];r23=HEAP[r20|0];r9=HEAP[r20+4|0];r8=HEAP[r20+8|0];r7=HEAP[r20+12|0];HEAP[r13|0]=HEAP[r19|0];HEAP[r13+4|0]=r10;HEAP[r13+8|0]=r25;HEAP[r13+12|0]=r24;HEAP[r14|0]=r23;HEAP[r14+4|0]=r9;HEAP[r14+8|0]=r8;HEAP[r14+12|0]=r7;r7=r13|0;HEAP[r7]=HEAP[r7]+HEAP[r14|0]|0;r7=r13+4|0;HEAP[r7]=HEAP[r7]+HEAP[r14+4|0]|0;r7=r13+8|0;HEAP[r7]=HEAP[r7]+HEAP[r14+8|0]|0;r7=r13+12|0;HEAP[r7]=HEAP[r7]+HEAP[r14+12|0]|0;r14=r26;r7=r13;for(r32=r7,r33=r14,r34=r32+16;r32<r34;r32++,r33++){HEAP[r33]=HEAP[r32]}r14=r21;r7=r26;for(r32=r7,r33=r14,r34=r32+16;r32<r34;r32++,r33++){HEAP[r33]=HEAP[r32]}r14=r31;r7=r1+1|0;r26=-r2|0;_v_rotate(r28,HEAP[r20|0],HEAP[r20+4|0],HEAP[r20+8|0],HEAP[r20+12|0],180);r13=HEAP[r28+4|0];r8=HEAP[r28+8|0];r9=HEAP[r28+12|0];HEAP[r15|0]=HEAP[r28|0];HEAP[r15+4|0]=r13;HEAP[r15+8|0]=r8;HEAP[r15+12|0]=r9;HEAP[r16|0]=HEAP[r15+4|0]-HEAP[r15+12|0]|0;HEAP[r16+4|0]=HEAP[r15+12|0]+HEAP[r15+8|0]+ -HEAP[r15+4|0]|0;HEAP[r16+8|0]=HEAP[r15+4|0]+HEAP[r15|0]+ -HEAP[r15+8|0]|0;HEAP[r16+12|0]=HEAP[r15+8|0]-HEAP[r15|0]|0;r15=r27;r9=r16;for(r32=r9,r33=r15,r34=r32+16;r32<r34;r32++,r33++){HEAP[r33]=HEAP[r32]}_penrose_p3_large(r14,r7,r26,HEAP[r21|0],HEAP[r21+4|0],HEAP[r21+8|0],HEAP[r21+12|0],HEAP[r27|0],HEAP[r27+4|0],HEAP[r27+8|0],HEAP[r27+12|0]);r27=r31;r31=r1+1|0;r1=r2;_v_rotate(r30,HEAP[r20|0],HEAP[r20+4|0],HEAP[r20+8|0],HEAP[r20+12|0],r2*-108&-1);r2=HEAP[r30+4|0];r20=HEAP[r30+8|0];r26=HEAP[r30+12|0];HEAP[r17|0]=HEAP[r30|0];HEAP[r17+4|0]=r2;HEAP[r17+8|0]=r20;HEAP[r17+12|0]=r26;HEAP[r18|0]=HEAP[r17+4|0]-HEAP[r17+12|0]|0;HEAP[r18+4|0]=HEAP[r17+12|0]+HEAP[r17+8|0]+ -HEAP[r17+4|0]|0;HEAP[r18+8|0]=HEAP[r17+4|0]+HEAP[r17|0]+ -HEAP[r17+8|0]|0;HEAP[r18+12|0]=HEAP[r17+8|0]-HEAP[r17|0]|0;r17=r29;r26=r18;for(r32=r26,r33=r17,r34=r32+16;r32<r34;r32++,r33++){HEAP[r33]=HEAP[r32]}_penrose_p3_small(r27,r31,r1,HEAP[r21|0],HEAP[r21+4|0],HEAP[r21+8|0],HEAP[r21+12|0],HEAP[r29|0],HEAP[r29+4|0],HEAP[r29+8|0],HEAP[r29+12|0]);r22=0;r11=r22;STACKTOP=r12;return r11}}function _penrose_calculate_size(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16;r8=r2;r2=r3;r3=r4;r4=r5;r5=r6;r6=r7;r7=0;r9=r8;if((r1|0)==0){r8=(r9*3&-1|0)/2&-1}else{r8=(r9*5&-1|0)/4&-1}r9=(r8|0)*3.11*Math.sqrt(Math.imul(r2,r2)+Math.imul(r3,r3)|0);r3=r8|0;if(r3*.22426>=r9){r10=r3;r11=r10&-1;r12=r5;HEAP[r12]=r11;r13=r7;r14=r6;HEAP[r14]=r13;r15=r9;r16=r4;HEAP[r16]=r15;return}while(1){r7=r7+1|0;r3=r3*1.6180339887;if(r3*.22426>=r9){break}}r10=r3;r11=r10&-1;r12=r5;HEAP[r12]=r11;r13=r7;r14=r6;HEAP[r14]=r13;r15=r9;r16=r4;HEAP[r16]=r15;return}function _xform_coord(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11){var r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27;r12=STACKTOP;STACKTOP=STACKTOP+192|0;r13=r12;r14=r12+16;r15=r12+32;r16=r12+48;r17=r12+64;r18=r12+80;r19=r12+96;r20=r12+112;r21=r12+128;r22=r12+144;r23=r12+160;r24=r12+176;HEAP[r19|0]=r2;HEAP[r19+4|0]=r3;HEAP[r19+8|0]=r4;HEAP[r19+12|0]=r5;r5=r6;HEAP[r20|0]=r7;HEAP[r20+4|0]=r8;HEAP[r20+8|0]=r9;HEAP[r20+12|0]=r10;r10=r11;do{if((r5|0)<0){r11=HEAP[r19+4|0];r9=HEAP[r19+8|0];r8=HEAP[r19+12|0];HEAP[r17|0]=HEAP[r19|0];HEAP[r17+4|0]=r11;HEAP[r17+8|0]=r9;HEAP[r17+12|0]=r8;HEAP[r18|0]=HEAP[r17+4|0]-HEAP[r17+12|0]|0;HEAP[r18+4|0]=HEAP[r17+12|0]+HEAP[r17+8|0]+ -HEAP[r17+4|0]|0;HEAP[r18+8|0]=HEAP[r17+4|0]+HEAP[r17|0]+ -HEAP[r17+8|0]|0;HEAP[r18+12|0]=HEAP[r17+8|0]-HEAP[r17|0]|0;r8=r21;r9=r18;for(r25=r9,r26=r8,r27=r25+16;r25<r27;r25++,r26++){HEAP[r26]=HEAP[r25]}r8=r19;r9=r21;for(r25=r9,r26=r8,r27=r25+16;r25<r27;r25++,r26++){HEAP[r26]=HEAP[r25]}}else{if((r5|0)<=0){break}r8=HEAP[r19+4|0];r9=HEAP[r19+8|0];r11=HEAP[r19+12|0];HEAP[r13|0]=HEAP[r19|0];HEAP[r13+4|0]=r8;HEAP[r13+8|0]=r9;HEAP[r13+12|0]=r11;HEAP[r14|0]=HEAP[r13+4|0]+HEAP[r13|0]+ -HEAP[r13+12|0]|0;HEAP[r14+4|0]=HEAP[r13+12|0]+HEAP[r13+8|0]|0;HEAP[r14+8|0]=HEAP[r13+4|0]+HEAP[r13|0]|0;HEAP[r14+12|0]=HEAP[r13+12|0]+HEAP[r13+8|0]+ -HEAP[r13|0]|0;r11=r22;r9=r14;for(r25=r9,r26=r11,r27=r25+16;r25<r27;r25++,r26++){HEAP[r26]=HEAP[r25]}r11=r19;r9=r22;for(r25=r9,r26=r11,r27=r25+16;r25<r27;r25++,r26++){HEAP[r26]=HEAP[r25]}}}while(0);_v_rotate(r23,HEAP[r19|0],HEAP[r19+4|0],HEAP[r19+8|0],HEAP[r19+12|0],r10);r10=r19;r22=r23;for(r25=r22,r26=r10,r27=r25+16;r25<r27;r25++,r26++){HEAP[r26]=HEAP[r25]}r10=HEAP[r19+4|0];r22=HEAP[r19+8|0];r23=HEAP[r19+12|0];r14=HEAP[r20|0];r13=HEAP[r20+4|0];r5=HEAP[r20+8|0];r21=HEAP[r20+12|0];HEAP[r15|0]=HEAP[r19|0];HEAP[r15+4|0]=r10;HEAP[r15+8|0]=r22;HEAP[r15+12|0]=r23;HEAP[r16|0]=r14;HEAP[r16+4|0]=r13;HEAP[r16+8|0]=r5;HEAP[r16+12|0]=r21;r21=r15|0;HEAP[r21]=HEAP[r21]+HEAP[r16|0]|0;r21=r15+4|0;HEAP[r21]=HEAP[r21]+HEAP[r16+4|0]|0;r21=r15+8|0;HEAP[r21]=HEAP[r21]+HEAP[r16+8|0]|0;r21=r15+12|0;HEAP[r21]=HEAP[r21]+HEAP[r16+12|0]|0;r16=r24;r21=r15;for(r25=r21,r26=r16,r27=r25+16;r25<r27;r25++,r26++){HEAP[r26]=HEAP[r25]}r16=r19;r19=r24;for(r25=r19,r26=r16,r27=r25+16;r25<r27;r25++,r26++){HEAP[r26]=HEAP[r25]}_memmove(r1,r19,16,4,0);STACKTOP=r12;return}function _penrose_p3_large(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11){var r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44;r12=STACKTOP;STACKTOP=STACKTOP+496|0;r13=r12;r14=r12+16;r15=r12+32;r16=r12+48;r17=r12+64;r18=r12+80;r19=r12+96;r20=r12+112;r21=r12+128;r22=r12+144;r23=r12+160;r24=r12+176;r25=r12+192;r26=r12+208;r27=r12+224;r28=r12+240;r29=r12+304;r30=r12+320;r31=r12+336;r32=r12+352;r33=r12+368;r34=r12+384;r35=r12+400;r36=r12+416;r37=r12+432;r38=r12+448;r39=r12+464;r40=r12+480;r41=r1;r1=r2;r2=r3;HEAP[r25|0]=r4;HEAP[r25+4|0]=r5;HEAP[r25+8|0]=r6;HEAP[r25+12|0]=r7;HEAP[r26|0]=r8;HEAP[r26+4|0]=r9;HEAP[r26+8|0]=r10;HEAP[r26+12|0]=r11;if((r2|0)>0){r11=r28|0;r10=r25;for(r42=r10,r43=r11,r44=r42+16;r42<r44;r42++,r43++){HEAP[r43]=HEAP[r42]}r11=r28|0;_xform_coord(r29,HEAP[r26|0],HEAP[r26+4|0],HEAP[r26+8|0],HEAP[r26+12|0],0,HEAP[r11|0],HEAP[r11+4|0],HEAP[r11+8|0],HEAP[r11+12|0],-36);r11=r28+16|0;r10=r29;for(r42=r10,r43=r11,r44=r42+16;r42<r44;r42++,r43++){HEAP[r43]=HEAP[r42]}r11=r28|0;_xform_coord(r30,HEAP[r26|0],HEAP[r26+4|0],HEAP[r26+8|0],HEAP[r26+12|0],1,HEAP[r11|0],HEAP[r11+4|0],HEAP[r11+8|0],HEAP[r11+12|0],0);r11=r28+32|0;r10=r30;for(r42=r10,r43=r11,r44=r42+16;r42<r44;r42++,r43++){HEAP[r43]=HEAP[r42]}r11=r28|0;_xform_coord(r31,HEAP[r26|0],HEAP[r26+4|0],HEAP[r26+8|0],HEAP[r26+12|0],0,HEAP[r11|0],HEAP[r11+4|0],HEAP[r11+8|0],HEAP[r11+12|0],36);r11=r28+48|0;r10=r31;for(r42=r10,r43=r11,r44=r42+16;r42<r44;r42++,r43++){HEAP[r43]=HEAP[r42]}FUNCTION_TABLE[HEAP[r41+8|0]](r41,r28|0,4,r1)}if((r1|0)>=(HEAP[r41+4|0]|0)){r28=0;STACKTOP=r12;return}else{r11=HEAP[r25+4|0];r10=HEAP[r25+8|0];r31=HEAP[r25+12|0];r30=HEAP[r26|0];r29=HEAP[r26+4|0];r9=HEAP[r26+8|0];r8=HEAP[r26+12|0];HEAP[r23|0]=HEAP[r25|0];HEAP[r23+4|0]=r11;HEAP[r23+8|0]=r10;HEAP[r23+12|0]=r31;HEAP[r24|0]=r30;HEAP[r24+4|0]=r29;HEAP[r24+8|0]=r9;HEAP[r24+12|0]=r8;r8=r23|0;HEAP[r8]=HEAP[r8]+HEAP[r24|0]|0;r8=r23+4|0;HEAP[r8]=HEAP[r8]+HEAP[r24+4|0]|0;r8=r23+8|0;HEAP[r8]=HEAP[r8]+HEAP[r24+8|0]|0;r8=r23+12|0;HEAP[r8]=HEAP[r8]+HEAP[r24+12|0]|0;r24=r32;r8=r23;for(r42=r8,r43=r24,r44=r42+16;r42<r44;r42++,r43++){HEAP[r43]=HEAP[r42]}r24=r27;r8=r32;for(r42=r8,r43=r24,r44=r42+16;r42<r44;r42++,r43++){HEAP[r43]=HEAP[r42]}r24=r41;r8=r1+1|0;r32=-r2|0;_v_rotate(r34,HEAP[r26|0],HEAP[r26+4|0],HEAP[r26+8|0],HEAP[r26+12|0],180);r23=HEAP[r34+4|0];r9=HEAP[r34+8|0];r29=HEAP[r34+12|0];HEAP[r21|0]=HEAP[r34|0];HEAP[r21+4|0]=r23;HEAP[r21+8|0]=r9;HEAP[r21+12|0]=r29;HEAP[r22|0]=HEAP[r21+4|0]-HEAP[r21+12|0]|0;HEAP[r22+4|0]=HEAP[r21+12|0]+HEAP[r21+8|0]+ -HEAP[r21+4|0]|0;HEAP[r22+8|0]=HEAP[r21+4|0]+HEAP[r21|0]+ -HEAP[r21+8|0]|0;HEAP[r22+12|0]=HEAP[r21+8|0]-HEAP[r21|0]|0;r21=r33;r29=r22;for(r42=r29,r43=r21,r44=r42+16;r42<r44;r42++,r43++){HEAP[r43]=HEAP[r42]}_penrose_p3_large(r24,r8,r32,HEAP[r27|0],HEAP[r27+4|0],HEAP[r27+8|0],HEAP[r27+12|0],HEAP[r33|0],HEAP[r33+4|0],HEAP[r33+8|0],HEAP[r33+12|0]);r33=r41;r32=r1+1|0;r8=r2;_v_rotate(r36,HEAP[r26|0],HEAP[r26+4|0],HEAP[r26+8|0],HEAP[r26+12|0],r2*-108&-1);r24=HEAP[r36+4|0];r21=HEAP[r36+8|0];r29=HEAP[r36+12|0];HEAP[r19|0]=HEAP[r36|0];HEAP[r19+4|0]=r24;HEAP[r19+8|0]=r21;HEAP[r19+12|0]=r29;HEAP[r20|0]=HEAP[r19+4|0]-HEAP[r19+12|0]|0;HEAP[r20+4|0]=HEAP[r19+12|0]+HEAP[r19+8|0]+ -HEAP[r19+4|0]|0;HEAP[r20+8|0]=HEAP[r19+4|0]+HEAP[r19|0]+ -HEAP[r19+8|0]|0;HEAP[r20+12|0]=HEAP[r19+8|0]-HEAP[r19|0]|0;r19=r35;r29=r20;for(r42=r29,r43=r19,r44=r42+16;r42<r44;r42++,r43++){HEAP[r43]=HEAP[r42]}_penrose_p3_small(r33,r32,r8,HEAP[r27|0],HEAP[r27+4|0],HEAP[r27+8|0],HEAP[r27+12|0],HEAP[r35|0],HEAP[r35+4|0],HEAP[r35+8|0],HEAP[r35+12|0]);r35=HEAP[r26+4|0];r8=HEAP[r26+8|0];r32=HEAP[r26+12|0];HEAP[r17|0]=HEAP[r26|0];HEAP[r17+4|0]=r35;HEAP[r17+8|0]=r8;HEAP[r17+12|0]=r32;HEAP[r18|0]=HEAP[r17+4|0]+HEAP[r17|0]+ -HEAP[r17+12|0]|0;HEAP[r18+4|0]=HEAP[r17+12|0]+HEAP[r17+8|0]|0;HEAP[r18+8|0]=HEAP[r17+4|0]+HEAP[r17|0]|0;HEAP[r18+12|0]=HEAP[r17+12|0]+HEAP[r17+8|0]+ -HEAP[r17|0]|0;r17=r37;r32=r18;for(r42=r32,r43=r17,r44=r42+16;r42<r44;r42++,r43++){HEAP[r43]=HEAP[r42]}r17=HEAP[r25+4|0];r32=HEAP[r25+8|0];r18=HEAP[r25+12|0];r8=HEAP[r37|0];r35=HEAP[r37+4|0];r33=HEAP[r37+8|0];r19=HEAP[r37+12|0];HEAP[r15|0]=HEAP[r25|0];HEAP[r15+4|0]=r17;HEAP[r15+8|0]=r32;HEAP[r15+12|0]=r18;HEAP[r16|0]=r8;HEAP[r16+4|0]=r35;HEAP[r16+8|0]=r33;HEAP[r16+12|0]=r19;r19=r15|0;HEAP[r19]=HEAP[r19]+HEAP[r16|0]|0;r19=r15+4|0;HEAP[r19]=HEAP[r19]+HEAP[r16+4|0]|0;r19=r15+8|0;HEAP[r19]=HEAP[r19]+HEAP[r16+8|0]|0;r19=r15+12|0;HEAP[r19]=HEAP[r19]+HEAP[r16+12|0]|0;r16=r38;r19=r15;for(r42=r19,r43=r16,r44=r42+16;r42<r44;r42++,r43++){HEAP[r43]=HEAP[r42]}r16=r27;r19=r38;for(r42=r19,r43=r16,r44=r42+16;r42<r44;r42++,r43++){HEAP[r43]=HEAP[r42]}r16=r41;r41=r1+1|0;r1=r2;_v_rotate(r40,HEAP[r26|0],HEAP[r26+4|0],HEAP[r26+8|0],HEAP[r26+12|0],r2*-144&-1);r2=HEAP[r40+4|0];r26=HEAP[r40+8|0];r19=HEAP[r40+12|0];HEAP[r13|0]=HEAP[r40|0];HEAP[r13+4|0]=r2;HEAP[r13+8|0]=r26;HEAP[r13+12|0]=r19;HEAP[r14|0]=HEAP[r13+4|0]-HEAP[r13+12|0]|0;HEAP[r14+4|0]=HEAP[r13+12|0]+HEAP[r13+8|0]+ -HEAP[r13+4|0]|0;HEAP[r14+8|0]=HEAP[r13+4|0]+HEAP[r13|0]+ -HEAP[r13+8|0]|0;HEAP[r14+12|0]=HEAP[r13+8|0]-HEAP[r13|0]|0;r13=r39;r19=r14;for(r42=r19,r43=r13,r44=r42+16;r42<r44;r42++,r43++){HEAP[r43]=HEAP[r42]}_penrose_p3_large(r16,r41,r1,HEAP[r27|0],HEAP[r27+4|0],HEAP[r27+8|0],HEAP[r27+12|0],HEAP[r39|0],HEAP[r39+4|0],HEAP[r39+8|0],HEAP[r39+12|0]);r28=0;STACKTOP=r12;return}}function _penrose_p2_small(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11){var r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r12=STACKTOP;STACKTOP=STACKTOP+336|0;r13=r12;r14=r12+16;r15=r12+32;r16=r12+48;r17=r12+64;r18=r12+80;r19=r12+96;r20=r12+112;r21=r12+128;r22=r12+144;r23=r12+208;r24=r12+224;r25=r12+240;r26=r12+256;r27=r12+272;r28=r12+288;r29=r12+304;r30=r12+320;r31=r1;r1=r2;r2=r3;HEAP[r19|0]=r4;HEAP[r19+4|0]=r5;HEAP[r19+8|0]=r6;HEAP[r19+12|0]=r7;HEAP[r20|0]=r8;HEAP[r20+4|0]=r9;HEAP[r20+8|0]=r10;HEAP[r20+12|0]=r11;if((r2|0)>0){r11=r22|0;r10=r19;for(r32=r10,r33=r11,r34=r32+16;r32<r34;r32++,r33++){HEAP[r33]=HEAP[r32]}r11=r22|0;_xform_coord(r23,HEAP[r20|0],HEAP[r20+4|0],HEAP[r20+8|0],HEAP[r20+12|0],0,HEAP[r11|0],HEAP[r11+4|0],HEAP[r11+8|0],HEAP[r11+12|0],-72);r11=r22+16|0;r10=r23;for(r32=r10,r33=r11,r34=r32+16;r32<r34;r32++,r33++){HEAP[r33]=HEAP[r32]}r11=r22|0;_xform_coord(r24,HEAP[r20|0],HEAP[r20+4|0],HEAP[r20+8|0],HEAP[r20+12|0],-1,HEAP[r11|0],HEAP[r11+4|0],HEAP[r11+8|0],HEAP[r11+12|0],-36);r11=r22+32|0;r10=r24;for(r32=r10,r33=r11,r34=r32+16;r32<r34;r32++,r33++){HEAP[r33]=HEAP[r32]}r11=r22|0;_xform_coord(r25,HEAP[r20|0],HEAP[r20+4|0],HEAP[r20+8|0],HEAP[r20+12|0],0,HEAP[r11|0],HEAP[r11+4|0],HEAP[r11+8|0],HEAP[r11+12|0],0);r11=r22+48|0;r10=r25;for(r32=r10,r33=r11,r34=r32+16;r32<r34;r32++,r33++){HEAP[r33]=HEAP[r32]}FUNCTION_TABLE[HEAP[r31+8|0]](r31,r22|0,4,r1)}if((r1|0)>=(HEAP[r31+4|0]|0)){r22=0;STACKTOP=r12;return}else{r11=HEAP[r19+4|0];r10=HEAP[r19+8|0];r25=HEAP[r19+12|0];r24=HEAP[r20|0];r23=HEAP[r20+4|0];r9=HEAP[r20+8|0];r8=HEAP[r20+12|0];HEAP[r17|0]=HEAP[r19|0];HEAP[r17+4|0]=r11;HEAP[r17+8|0]=r10;HEAP[r17+12|0]=r25;HEAP[r18|0]=r24;HEAP[r18+4|0]=r23;HEAP[r18+8|0]=r9;HEAP[r18+12|0]=r8;r8=r17|0;HEAP[r8]=HEAP[r8]+HEAP[r18|0]|0;r8=r17+4|0;HEAP[r8]=HEAP[r8]+HEAP[r18+4|0]|0;r8=r17+8|0;HEAP[r8]=HEAP[r8]+HEAP[r18+8|0]|0;r8=r17+12|0;HEAP[r8]=HEAP[r8]+HEAP[r18+12|0]|0;r18=r26;r8=r17;for(r32=r8,r33=r18,r34=r32+16;r32<r34;r32++,r33++){HEAP[r33]=HEAP[r32]}r18=r21;r8=r26;for(r32=r8,r33=r18,r34=r32+16;r32<r34;r32++,r33++){HEAP[r33]=HEAP[r32]}r18=r31;r8=r1+1|0;r26=-r2|0;_v_rotate(r28,HEAP[r20|0],HEAP[r20+4|0],HEAP[r20+8|0],HEAP[r20+12|0],r2*-36&-1);r17=HEAP[r28+4|0];r9=HEAP[r28+8|0];r23=HEAP[r28+12|0];HEAP[r15|0]=HEAP[r28|0];HEAP[r15+4|0]=r17;HEAP[r15+8|0]=r9;HEAP[r15+12|0]=r23;HEAP[r16|0]=HEAP[r15+4|0]-HEAP[r15+12|0]|0;HEAP[r16+4|0]=HEAP[r15+12|0]+HEAP[r15+8|0]+ -HEAP[r15+4|0]|0;HEAP[r16+8|0]=HEAP[r15+4|0]+HEAP[r15|0]+ -HEAP[r15+8|0]|0;HEAP[r16+12|0]=HEAP[r15+8|0]-HEAP[r15|0]|0;r15=r27;r23=r16;for(r32=r23,r33=r15,r34=r32+16;r32<r34;r32++,r33++){HEAP[r33]=HEAP[r32]}_penrose_p2_large(r18,r8,r26,HEAP[r19|0],HEAP[r19+4|0],HEAP[r19+8|0],HEAP[r19+12|0],HEAP[r27|0],HEAP[r27+4|0],HEAP[r27+8|0],HEAP[r27+12|0]);r27=r31;r31=r1+1|0;r1=r2;_v_rotate(r30,HEAP[r20|0],HEAP[r20+4|0],HEAP[r20+8|0],HEAP[r20+12|0],r2*-144&-1);r2=HEAP[r30+4|0];r20=HEAP[r30+8|0];r19=HEAP[r30+12|0];HEAP[r13|0]=HEAP[r30|0];HEAP[r13+4|0]=r2;HEAP[r13+8|0]=r20;HEAP[r13+12|0]=r19;HEAP[r14|0]=HEAP[r13+4|0]-HEAP[r13+12|0]|0;HEAP[r14+4|0]=HEAP[r13+12|0]+HEAP[r13+8|0]+ -HEAP[r13+4|0]|0;HEAP[r14+8|0]=HEAP[r13+4|0]+HEAP[r13|0]+ -HEAP[r13+8|0]|0;HEAP[r14+12|0]=HEAP[r13+8|0]-HEAP[r13|0]|0;r13=r29;r19=r14;for(r32=r19,r33=r13,r34=r32+16;r32<r34;r32++,r33++){HEAP[r33]=HEAP[r32]}_penrose_p2_small(r27,r31,r1,HEAP[r21|0],HEAP[r21+4|0],HEAP[r21+8|0],HEAP[r21+12|0],HEAP[r29|0],HEAP[r29+4|0],HEAP[r29+8|0],HEAP[r29+12|0]);r22=0;STACKTOP=r12;return}}function _SHA_Bytes(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r4=STACKTOP;STACKTOP=STACKTOP+436|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+328;r9=r4+332;r10=r4+336;r11=r4+340;r12=r4+344;r13=r4+348;r14=r4+352;r15=r4+356;r16=r4+360;r17=r4+364;r18=r4+368;r19=r4+372;r20=r1;r1=r3;r3=r2;r2=r1;r21=r20+92|0;HEAP[r21]=HEAP[r21]+r2|0;r21=r20+88|0;HEAP[r21]=HEAP[r21]+(HEAP[r20+92|0]>>>0<r2>>>0&1)|0;do{if((HEAP[r20+84|0]|0)!=0){if((r1+HEAP[r20+84|0]|0)>=64){break}r2=r20+HEAP[r20+84|0]+20|0;r21=r3;r22=r1;for(r23=r21,r24=r2,r25=r23+r22;r23<r25;r23++,r24++){HEAP[r24]=HEAP[r23]}r22=r20+84|0;HEAP[r22]=HEAP[r22]+r1|0;STACKTOP=r4;return}}while(0);r22=r20+20|0;L40:do{if((r1+HEAP[r20+84|0]|0)>=64){r2=r19|0;r21=r22;while(1){r26=r21+HEAP[r20+84|0]|0;r27=r3;r28=64-HEAP[r20+84|0]|0;for(r23=r27,r24=r26,r25=r23+r28;r23<r25;r23++,r24++){HEAP[r24]=HEAP[r23]}r3=r3+(64-HEAP[r20+84|0])|0;r1=-(-HEAP[r20+84|0]|0)-64+r1|0;r28=0;while(1){HEAP[(r28<<2)+r19|0]=(HEAP[(r28<<2)+r20+21|0]&255)<<16|(HEAP[(r28<<2)+r20+20|0]&255)<<24|(HEAP[(r28<<2)+r20+22|0]&255)<<8|(HEAP[(r28<<2)+r20+23|0]&255)<<0;r26=r28+1|0;r28=r26;if((r26|0)>=16){break}}HEAP[r5]=r20|0;HEAP[r6]=r2;HEAP[r13]=0;while(1){HEAP[(HEAP[r13]<<2)+r7|0]=HEAP[(HEAP[r13]<<2)+HEAP[r6]|0];r28=HEAP[r13]+1|0;HEAP[r13]=r28;if((r28|0)>=16){break}}HEAP[r13]=16;while(1){HEAP[r14]=HEAP[(HEAP[r13]-8<<2)+r7|0]^HEAP[(HEAP[r13]-3<<2)+r7|0]^HEAP[(HEAP[r13]-14<<2)+r7|0]^HEAP[(HEAP[r13]-16<<2)+r7|0];HEAP[(HEAP[r13]<<2)+r7|0]=HEAP[r14]>>>31|HEAP[r14]<<1;r28=HEAP[r13]+1|0;HEAP[r13]=r28;if((r28|0)>=80){break}}HEAP[r8]=HEAP[HEAP[r5]];HEAP[r9]=HEAP[HEAP[r5]+4|0];HEAP[r10]=HEAP[HEAP[r5]+8|0];HEAP[r11]=HEAP[HEAP[r5]+12|0];HEAP[r12]=HEAP[HEAP[r5]+16|0];HEAP[r13]=0;while(1){HEAP[r15]=(HEAP[r8]>>>27|HEAP[r8]<<5)+HEAP[r12]+((HEAP[r9]^-1)&HEAP[r11]|HEAP[r10]&HEAP[r9])+HEAP[(HEAP[r13]<<2)+r7|0]+1518500249|0;HEAP[r12]=HEAP[r11];HEAP[r11]=HEAP[r10];HEAP[r10]=HEAP[r9]>>>2|HEAP[r9]<<30;HEAP[r9]=HEAP[r8];HEAP[r8]=HEAP[r15];r28=HEAP[r13]+1|0;HEAP[r13]=r28;if((r28|0)>=20){break}}HEAP[r13]=20;while(1){HEAP[r16]=(HEAP[r8]>>>27|HEAP[r8]<<5)+(HEAP[r10]^HEAP[r9]^HEAP[r11])+HEAP[r12]+HEAP[(HEAP[r13]<<2)+r7|0]+1859775393|0;HEAP[r12]=HEAP[r11];HEAP[r11]=HEAP[r10];HEAP[r10]=HEAP[r9]>>>2|HEAP[r9]<<30;HEAP[r9]=HEAP[r8];HEAP[r8]=HEAP[r16];r28=HEAP[r13]+1|0;HEAP[r13]=r28;if((r28|0)>=40){break}}HEAP[r13]=40;while(1){HEAP[r17]=(HEAP[r8]>>>27|HEAP[r8]<<5)-1894007588+HEAP[r12]+(HEAP[r11]&HEAP[r9]|HEAP[r10]&HEAP[r9]|HEAP[r11]&HEAP[r10])+HEAP[(HEAP[r13]<<2)+r7|0]|0;HEAP[r12]=HEAP[r11];HEAP[r11]=HEAP[r10];HEAP[r10]=HEAP[r9]>>>2|HEAP[r9]<<30;HEAP[r9]=HEAP[r8];HEAP[r8]=HEAP[r17];r28=HEAP[r13]+1|0;HEAP[r13]=r28;if((r28|0)>=60){break}}HEAP[r13]=60;r28=HEAP[r8];while(1){HEAP[r18]=(HEAP[r8]>>>27|r28<<5)-899497514+(HEAP[r10]^HEAP[r9]^HEAP[r11])+HEAP[r12]+HEAP[(HEAP[r13]<<2)+r7|0]|0;HEAP[r12]=HEAP[r11];HEAP[r11]=HEAP[r10];HEAP[r10]=HEAP[r9]>>>2|HEAP[r9]<<30;HEAP[r9]=HEAP[r8];HEAP[r8]=HEAP[r18];r26=HEAP[r13]+1|0;HEAP[r13]=r26;r29=HEAP[r8];if((r26|0)<80){r28=r29}else{break}}r28=HEAP[r5];HEAP[r28]=HEAP[r28]+r29|0;r28=HEAP[r5]+4|0;HEAP[r28]=HEAP[r28]+HEAP[r9]|0;r28=HEAP[r5]+8|0;HEAP[r28]=HEAP[r28]+HEAP[r10]|0;r28=HEAP[r5]+12|0;HEAP[r28]=HEAP[r28]+HEAP[r11]|0;r28=HEAP[r5]+16|0;HEAP[r28]=HEAP[r28]+HEAP[r12]|0;HEAP[r20+84|0]=0;r28=r20+20|0;if((r1+HEAP[r20+84|0]|0)>=64){r21=r28}else{r30=r28;break L40}}}else{r30=r22}}while(0);r22=r30;r30=r3;r3=r1;for(r23=r30,r24=r22,r25=r23+r3;r23<r25;r23++,r24++){HEAP[r24]=HEAP[r23]}HEAP[r20+84|0]=r1;STACKTOP=r4;return}function _countnode234(r1){var r2,r3,r4,r5,r6;r2=r1;r1=0;if((r2|0)==0){r3=0;r4=r3;return r4}r5=0;while(1){r1=r1+HEAP[(r5<<2)+r2+20|0]|0;r6=r5+1|0;r5=r6;if((r6|0)>=4){break}}r5=0;while(1){if((HEAP[(r5<<2)+r2+36|0]|0)!=0){r1=r1+1|0}r6=r5+1|0;r5=r6;if((r6|0)>=3){break}}r3=r1;r4=r3;return r4}function _SHA_Simple(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r4=STACKTOP;STACKTOP=STACKTOP+192|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+80;r11=r4+84;r12=r4+88;r13=r4+92;r14=r4+96;HEAP[r13]=r14;HEAP[r12]=HEAP[r13]|0;HEAP[HEAP[r12]]=1732584193;HEAP[HEAP[r12]+4|0]=-271733879;HEAP[HEAP[r12]+8|0]=-1732584194;HEAP[HEAP[r12]+12|0]=271733878;HEAP[HEAP[r12]+16|0]=-1009589776;HEAP[HEAP[r13]+84|0]=0;HEAP[HEAP[r13]+92|0]=0;HEAP[HEAP[r13]+88|0]=0;_SHA_Bytes(r14,r1,r2);HEAP[r5]=r14;HEAP[r6]=r3;r3=HEAP[HEAP[r5]+84|0];if((HEAP[HEAP[r5]+84|0]|0)>=56){HEAP[r8]=120-r3|0}else{HEAP[r8]=56-r3|0}HEAP[r10]=HEAP[HEAP[r5]+92|0]>>>29|HEAP[HEAP[r5]+88|0]<<3;HEAP[r11]=HEAP[HEAP[r5]+92|0]<<3;r3=r9;r14=HEAP[r8];for(r2=r3,r1=r2+r14;r2<r1;r2++){HEAP[r2]=0}HEAP[r9|0]=-128;_SHA_Bytes(HEAP[r5],r9,HEAP[r8]);HEAP[r9|0]=HEAP[r10]>>>24&255;HEAP[r9+1|0]=HEAP[r10]>>>16&255;HEAP[r9+2|0]=HEAP[r10]>>>8&255;HEAP[r9+3|0]=HEAP[r10]&255;HEAP[r9+4|0]=HEAP[r11]>>>24&255;HEAP[r9+5|0]=HEAP[r11]>>>16&255;HEAP[r9+6|0]=HEAP[r11]>>>8&255;HEAP[r9+7|0]=HEAP[r11]&255;_SHA_Bytes(HEAP[r5],r9,8);HEAP[r7]=0;while(1){HEAP[(HEAP[r7]<<2)+HEAP[r6]|0]=HEAP[(HEAP[r7]<<2)+HEAP[r5]|0]>>>24&255;HEAP[(HEAP[r7]<<2)+HEAP[r6]+1|0]=HEAP[(HEAP[r7]<<2)+HEAP[r5]|0]>>>16&255;HEAP[(HEAP[r7]<<2)+HEAP[r6]+2|0]=HEAP[(HEAP[r7]<<2)+HEAP[r5]|0]>>>8&255;HEAP[(HEAP[r7]<<2)+HEAP[r6]+3|0]=HEAP[(HEAP[r7]<<2)+HEAP[r5]|0]&255;r9=HEAP[r7]+1|0;HEAP[r7]=r9;if((r9|0)>=5){break}}STACKTOP=r4;return}function _random_bits(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r3=0;r4=r1;r1=r2;r2=0;r5=0;if((r5|0)>=(r1|0)){r6=r1;r7=r6-1|0;r8=1<<r7;r9=r8<<1;r10=r9-1|0;r11=r2;r12=r10&r11;r2=r12;r13=r2;return r13}while(1){if((HEAP[r4+60|0]|0)>=20){r14=0;while(1){r15=r4+r14|0;if((HEAP[r4+r14|0]&255|0)!=255){r3=76;break}HEAP[r15]=0;r16=r14+1|0;r14=r16;if((r16|0)>=20){break}}if(r3==76){r3=0;HEAP[r15]=HEAP[r15]+1&255}_SHA_Simple(r4|0,40,r4+40|0);HEAP[r4+60|0]=0}r14=r4+60|0;r16=HEAP[r14];HEAP[r14]=r16+1|0;r2=HEAP[r16+(r4+40)|0]&255|r2<<8;r5=r5+8|0;if((r5|0)>=(r1|0)){break}}r6=r1;r7=r6-1|0;r8=1<<r7;r9=r8<<1;r10=r9-1|0;r11=r2;r12=r10&r11;r2=r12;r13=r2;return r13}function _random_upto(r1,r2){var r3,r4,r5,r6,r7,r8;r3=r1;r1=r2;r2=0;r4=r2;L106:do{if((r1>>>(r2>>>0)|0)!=0){r5=r4;while(1){r2=r5+1|0;r6=r2;if((r1>>>(r2>>>0)|0)!=0){r5=r6}else{r7=r6;break L106}}}else{r7=r4}}while(0);r4=r7+3|0;r2=r4;if((r4|0)>=32){___assert_func(35388,275,37456,36564)}r4=1<<r2;r7=Math.floor((r4>>>0)/(r1>>>0));r4=Math.imul(r7,r1);while(1){r8=_random_bits(r3,r2);if(!(r8>>>0>=r4>>>0)){break}}return Math.floor((r8>>>0)/(r7>>>0))}function _freenode234(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+4|0;r3=r2;r4=r1;if((r4|0)==0){STACKTOP=r2;return}_freenode234(HEAP[r4+4|0]);_freenode234(HEAP[r4+8|0]);_freenode234(HEAP[r4+12|0]);_freenode234(HEAP[r4+16|0]);HEAP[r3]=r4;if((HEAP[r3]|0)!=0){_free(HEAP[r3])}STACKTOP=r2;return}function _random_new(r1,r2){var r3,r4,r5,r6;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r3+4;HEAP[r4]=64;r6=_malloc(HEAP[r4]);HEAP[r5]=r6;if((HEAP[r5]|0)!=0){r6=HEAP[r5];_SHA_Simple(r1,r2,r6|0);_SHA_Simple(r6|0,20,r6+20|0);_SHA_Simple(r6|0,40,r6+40|0);HEAP[r6+60|0]=0;STACKTOP=r3;return r6}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _add234(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+104|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r4+24;r12=r4+28;r13=r4+32;r14=r4+36;r15=r4+40;r16=r4+44;r17=r4+48;r18=r4+52;r19=r4+56;r20=r4+60;r21=r4+64;r22=r4+68;r23=r4+72;r24=r4+76;r25=r4+80;r26=r4+84;r27=r4+88;r28=r4+92;r29=r4+96;r30=r4+100;r31=r1;if((HEAP[r31+4|0]|0)==0){r32=0;STACKTOP=r4;return}HEAP[r24]=r31;HEAP[r25]=r2;HEAP[r26]=-1;HEAP[r29]=HEAP[r25];L133:do{if((HEAP[HEAP[r24]|0]|0)==0){HEAP[r21]=48;r2=_malloc(HEAP[r21]);HEAP[r22]=r2;if((HEAP[r22]|0)!=0){HEAP[HEAP[r24]|0]=HEAP[r22];HEAP[HEAP[HEAP[r24]|0]+44|0]=0;HEAP[HEAP[HEAP[r24]|0]+40|0]=0;HEAP[HEAP[HEAP[r24]|0]+8|0]=0;HEAP[HEAP[HEAP[r24]|0]+4|0]=0;HEAP[HEAP[HEAP[r24]|0]+16|0]=0;HEAP[HEAP[HEAP[r24]|0]+12|0]=0;HEAP[HEAP[HEAP[r24]|0]+24|0]=0;HEAP[HEAP[HEAP[r24]|0]+20|0]=0;HEAP[HEAP[HEAP[r24]|0]+32|0]=0;HEAP[HEAP[HEAP[r24]|0]+28|0]=0;HEAP[HEAP[HEAP[r24]|0]|0]=0;HEAP[HEAP[HEAP[r24]|0]+36|0]=HEAP[r25];HEAP[r23]=HEAP[r29];break}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}else{r2=HEAP[HEAP[r24]|0];HEAP[r27]=r2;L139:do{if((r2|0)!=0){L140:while(1){L142:do{if((HEAP[r26]|0)>=0){r31=HEAP[r26];if((HEAP[HEAP[r27]+4|0]|0)==0){HEAP[r28]=r31;break}if((r31|0)<=(HEAP[HEAP[r27]+20|0]|0)){HEAP[r28]=0;break}HEAP[r26]=-HEAP[HEAP[r27]+20|0]-1+HEAP[r26]|0;if((HEAP[r26]|0)<=(HEAP[HEAP[r27]+24|0]|0)){HEAP[r28]=1;break}HEAP[r26]=-HEAP[HEAP[r27]+24|0]-1+HEAP[r26]|0;if((HEAP[r26]|0)<=(HEAP[HEAP[r27]+28|0]|0)){HEAP[r28]=2;break}HEAP[r26]=-HEAP[HEAP[r27]+28|0]-1+HEAP[r26]|0;if(!((HEAP[r26]|0)<=(HEAP[HEAP[r27]+32|0]|0))){r3=118;break L140}HEAP[r28]=3}else{r31=FUNCTION_TABLE[HEAP[HEAP[r24]+4|0]](HEAP[r25],HEAP[HEAP[r27]+36|0]);HEAP[r30]=r31;if((r31|0)<0){HEAP[r28]=0;break}r33=HEAP[r27]+36|0;if((HEAP[r30]|0)==0){r3=122;break L140}do{if((HEAP[r33+4|0]|0)!=0){r31=FUNCTION_TABLE[HEAP[HEAP[r24]+4|0]](HEAP[r25],HEAP[HEAP[r27]+40|0]);HEAP[r30]=r31;if((r31|0)<0){break}r34=HEAP[r27]+36|0;if((HEAP[r30]|0)==0){r3=127;break L140}do{if((HEAP[r34+8|0]|0)!=0){r31=FUNCTION_TABLE[HEAP[HEAP[r24]+4|0]](HEAP[r25],HEAP[HEAP[r27]+44|0]);HEAP[r30]=r31;if((r31|0)<0){break}if((HEAP[r30]|0)==0){r3=132;break L140}HEAP[r28]=3;break L142}}while(0);HEAP[r28]=2;break L142}}while(0);HEAP[r28]=1}}while(0);if((HEAP[(HEAP[r28]<<2)+HEAP[r27]+4|0]|0)==0){break L139}r31=HEAP[(HEAP[r28]<<2)+HEAP[r27]+4|0];HEAP[r27]=r31;if((r31|0)==0){break L139}}if(r3==122){HEAP[r23]=HEAP[r33|0];break L133}else if(r3==118){HEAP[r23]=0;break L133}else if(r3==127){HEAP[r23]=HEAP[r34+4|0];break L133}else if(r3==132){HEAP[r23]=HEAP[HEAP[r27]+44|0];break L133}}}while(0);r2=HEAP[r25];r31=HEAP[r24]|0;r1=HEAP[r27];r35=HEAP[r28];HEAP[r10]=0;HEAP[r11]=r2;HEAP[r12]=0;HEAP[r13]=r31;HEAP[r14]=r1;HEAP[r15]=r35;r35=_countnode234(HEAP[r10]);HEAP[r16]=r35;r35=_countnode234(HEAP[r12]);HEAP[r17]=r35;L180:do{if((HEAP[r14]|0)!=0){while(1){if((HEAP[HEAP[r14]+40|0]|0)==0){r3=139;break}if((HEAP[HEAP[r14]+44|0]|0)==0){r3=149;break}HEAP[r7]=48;r35=_malloc(HEAP[r7]);HEAP[r8]=r35;if((HEAP[r8]|0)==0){r3=163;break}HEAP[r18]=HEAP[r8];HEAP[HEAP[r18]|0]=HEAP[HEAP[r14]|0];do{if((HEAP[r15]|0)==0){HEAP[HEAP[r18]+4|0]=HEAP[r10];HEAP[HEAP[r18]+20|0]=HEAP[r16];HEAP[HEAP[r18]+36|0]=HEAP[r11];HEAP[HEAP[r18]+8|0]=HEAP[r12];HEAP[HEAP[r18]+24|0]=HEAP[r17];HEAP[HEAP[r18]+40|0]=HEAP[HEAP[r14]+36|0];HEAP[HEAP[r18]+12|0]=HEAP[HEAP[r14]+8|0];HEAP[HEAP[r18]+28|0]=HEAP[HEAP[r14]+24|0];HEAP[r11]=HEAP[HEAP[r14]+40|0];HEAP[HEAP[r14]+4|0]=HEAP[HEAP[r14]+12|0];HEAP[HEAP[r14]+20|0]=HEAP[HEAP[r14]+28|0];HEAP[HEAP[r14]+36|0]=HEAP[HEAP[r14]+44|0];HEAP[HEAP[r14]+8|0]=HEAP[HEAP[r14]+16|0];HEAP[HEAP[r14]+24|0]=HEAP[HEAP[r14]+32|0]}else{if((HEAP[r15]|0)==1){HEAP[HEAP[r18]+4|0]=HEAP[HEAP[r14]+4|0];HEAP[HEAP[r18]+20|0]=HEAP[HEAP[r14]+20|0];HEAP[HEAP[r18]+36|0]=HEAP[HEAP[r14]+36|0];HEAP[HEAP[r18]+8|0]=HEAP[r10];HEAP[HEAP[r18]+24|0]=HEAP[r16];HEAP[HEAP[r18]+40|0]=HEAP[r11];HEAP[HEAP[r18]+12|0]=HEAP[r12];HEAP[HEAP[r18]+28|0]=HEAP[r17];HEAP[r11]=HEAP[HEAP[r14]+40|0];HEAP[HEAP[r14]+4|0]=HEAP[HEAP[r14]+12|0];HEAP[HEAP[r14]+20|0]=HEAP[HEAP[r14]+28|0];HEAP[HEAP[r14]+36|0]=HEAP[HEAP[r14]+44|0];HEAP[HEAP[r14]+8|0]=HEAP[HEAP[r14]+16|0];HEAP[HEAP[r14]+24|0]=HEAP[HEAP[r14]+32|0];break}r35=(HEAP[r15]|0)==2;HEAP[HEAP[r18]+4|0]=HEAP[HEAP[r14]+4|0];HEAP[HEAP[r18]+20|0]=HEAP[HEAP[r14]+20|0];HEAP[HEAP[r18]+36|0]=HEAP[HEAP[r14]+36|0];HEAP[HEAP[r18]+8|0]=HEAP[HEAP[r14]+8|0];HEAP[HEAP[r18]+24|0]=HEAP[HEAP[r14]+24|0];HEAP[HEAP[r18]+40|0]=HEAP[HEAP[r14]+40|0];if(r35){HEAP[HEAP[r18]+12|0]=HEAP[r10];HEAP[HEAP[r18]+28|0]=HEAP[r16];HEAP[HEAP[r14]+4|0]=HEAP[r12];HEAP[HEAP[r14]+20|0]=HEAP[r17];HEAP[HEAP[r14]+36|0]=HEAP[HEAP[r14]+44|0];HEAP[HEAP[r14]+8|0]=HEAP[HEAP[r14]+16|0];HEAP[HEAP[r14]+24|0]=HEAP[HEAP[r14]+32|0];break}else{HEAP[HEAP[r18]+12|0]=HEAP[HEAP[r14]+12|0];HEAP[HEAP[r18]+28|0]=HEAP[HEAP[r14]+28|0];HEAP[HEAP[r14]+4|0]=HEAP[r10];HEAP[HEAP[r14]+20|0]=HEAP[r16];HEAP[HEAP[r14]+36|0]=HEAP[r11];HEAP[HEAP[r14]+8|0]=HEAP[r12];HEAP[HEAP[r14]+24|0]=HEAP[r17];HEAP[r11]=HEAP[HEAP[r14]+44|0];break}}}while(0);HEAP[HEAP[r14]+12|0]=0;HEAP[HEAP[r14]+16|0]=0;HEAP[HEAP[r18]+16|0]=0;HEAP[HEAP[r14]+28|0]=0;HEAP[HEAP[r14]+32|0]=0;HEAP[HEAP[r18]+32|0]=0;HEAP[HEAP[r14]+40|0]=0;HEAP[HEAP[r14]+44|0]=0;HEAP[HEAP[r18]+44|0]=0;if((HEAP[HEAP[r18]+4|0]|0)!=0){HEAP[HEAP[HEAP[r18]+4|0]|0]=HEAP[r18]}if((HEAP[HEAP[r18]+8|0]|0)!=0){HEAP[HEAP[HEAP[r18]+8|0]|0]=HEAP[r18]}if((HEAP[HEAP[r18]+12|0]|0)!=0){HEAP[HEAP[HEAP[r18]+12|0]|0]=HEAP[r18]}if((HEAP[HEAP[r14]+4|0]|0)!=0){HEAP[HEAP[HEAP[r14]+4|0]|0]=HEAP[r14]}if((HEAP[HEAP[r14]+8|0]|0)!=0){HEAP[HEAP[HEAP[r14]+8|0]|0]=HEAP[r14]}HEAP[r10]=HEAP[r18];r35=_countnode234(HEAP[r10]);HEAP[r16]=r35;HEAP[r12]=HEAP[r14];r35=_countnode234(HEAP[r12]);HEAP[r17]=r35;if((HEAP[HEAP[r14]|0]|0)!=0){do{if((HEAP[HEAP[HEAP[r14]|0]+4|0]|0)==(HEAP[r14]|0)){r36=0}else{if((HEAP[HEAP[HEAP[r14]|0]+8|0]|0)==(HEAP[r14]|0)){r36=1;break}r36=(HEAP[HEAP[HEAP[r14]|0]+12|0]|0)==(HEAP[r14]|0)?2:3}}while(0);HEAP[r15]=r36}r35=HEAP[HEAP[r14]|0];HEAP[r14]=r35;if((r35|0)==0){r3=187;break L180}}if(r3==149){do{if((HEAP[r15]|0)==0){HEAP[HEAP[r14]+16|0]=HEAP[HEAP[r14]+12|0];HEAP[HEAP[r14]+32|0]=HEAP[HEAP[r14]+28|0];HEAP[HEAP[r14]+44|0]=HEAP[HEAP[r14]+40|0];HEAP[HEAP[r14]+12|0]=HEAP[HEAP[r14]+8|0];HEAP[HEAP[r14]+28|0]=HEAP[HEAP[r14]+24|0];HEAP[HEAP[r14]+40|0]=HEAP[HEAP[r14]+36|0];HEAP[HEAP[r14]+8|0]=HEAP[r12];HEAP[HEAP[r14]+24|0]=HEAP[r17];HEAP[HEAP[r14]+36|0]=HEAP[r11];HEAP[HEAP[r14]+4|0]=HEAP[r10];HEAP[HEAP[r14]+20|0]=HEAP[r16]}else{if((HEAP[r15]|0)==1){HEAP[HEAP[r14]+16|0]=HEAP[HEAP[r14]+12|0];HEAP[HEAP[r14]+32|0]=HEAP[HEAP[r14]+28|0];HEAP[HEAP[r14]+44|0]=HEAP[HEAP[r14]+40|0];HEAP[HEAP[r14]+12|0]=HEAP[r12];HEAP[HEAP[r14]+28|0]=HEAP[r17];HEAP[HEAP[r14]+40|0]=HEAP[r11];HEAP[HEAP[r14]+8|0]=HEAP[r10];HEAP[HEAP[r14]+24|0]=HEAP[r16];break}else{HEAP[HEAP[r14]+16|0]=HEAP[r12];HEAP[HEAP[r14]+32|0]=HEAP[r17];HEAP[HEAP[r14]+44|0]=HEAP[r11];HEAP[HEAP[r14]+12|0]=HEAP[r10];HEAP[HEAP[r14]+28|0]=HEAP[r16];break}}}while(0);if((HEAP[HEAP[r14]+4|0]|0)!=0){HEAP[HEAP[HEAP[r14]+4|0]|0]=HEAP[r14]}if((HEAP[HEAP[r14]+8|0]|0)!=0){HEAP[HEAP[HEAP[r14]+8|0]|0]=HEAP[r14]}if((HEAP[HEAP[r14]+12|0]|0)!=0){HEAP[HEAP[HEAP[r14]+12|0]|0]=HEAP[r14]}r35=HEAP[r14];if((HEAP[r35+16|0]|0)==0){r37=r35;break}HEAP[HEAP[HEAP[r14]+16|0]|0]=HEAP[r14];r3=187;break}else if(r3==139){if((HEAP[r15]|0)==0){HEAP[HEAP[r14]+12|0]=HEAP[HEAP[r14]+8|0];HEAP[HEAP[r14]+28|0]=HEAP[HEAP[r14]+24|0];HEAP[HEAP[r14]+40|0]=HEAP[HEAP[r14]+36|0];HEAP[HEAP[r14]+8|0]=HEAP[r12];HEAP[HEAP[r14]+24|0]=HEAP[r17];HEAP[HEAP[r14]+36|0]=HEAP[r11];HEAP[HEAP[r14]+4|0]=HEAP[r10];HEAP[HEAP[r14]+20|0]=HEAP[r16]}else{HEAP[HEAP[r14]+12|0]=HEAP[r12];HEAP[HEAP[r14]+28|0]=HEAP[r17];HEAP[HEAP[r14]+40|0]=HEAP[r11];HEAP[HEAP[r14]+8|0]=HEAP[r10];HEAP[HEAP[r14]+24|0]=HEAP[r16]}if((HEAP[HEAP[r14]+4|0]|0)!=0){HEAP[HEAP[HEAP[r14]+4|0]|0]=HEAP[r14]}if((HEAP[HEAP[r14]+8|0]|0)!=0){HEAP[HEAP[HEAP[r14]+8|0]|0]=HEAP[r14]}r35=HEAP[r14];if((HEAP[r35+12|0]|0)==0){r37=r35;break}HEAP[HEAP[HEAP[r14]+12|0]|0]=HEAP[r14];r3=187;break}else if(r3==163){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}else{r3=187}}while(0);if(r3==187){r37=HEAP[r14]}if((r37|0)!=0){L256:do{if((HEAP[HEAP[r14]|0]|0)!=0){while(1){r35=_countnode234(HEAP[r14]);HEAP[r19]=r35;do{if((HEAP[HEAP[HEAP[r14]|0]+4|0]|0)==(HEAP[r14]|0)){r38=0}else{if((HEAP[HEAP[HEAP[r14]|0]+8|0]|0)==(HEAP[r14]|0)){r38=1;break}r38=(HEAP[HEAP[HEAP[r14]|0]+12|0]|0)==(HEAP[r14]|0)?2:3}}while(0);HEAP[r20]=r38;HEAP[(HEAP[r20]<<2)+HEAP[HEAP[r14]|0]+20|0]=HEAP[r19];HEAP[r14]=HEAP[HEAP[r14]|0];if((HEAP[HEAP[r14]|0]|0)==0){break L256}}}}while(0);HEAP[r9]=0}else{HEAP[r5]=48;r35=_malloc(HEAP[r5]);HEAP[r6]=r35;if((HEAP[r6]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[HEAP[r13]]=HEAP[r6];HEAP[HEAP[HEAP[r13]]+4|0]=HEAP[r10];HEAP[HEAP[HEAP[r13]]+20|0]=HEAP[r16];HEAP[HEAP[HEAP[r13]]+36|0]=HEAP[r11];HEAP[HEAP[HEAP[r13]]+8|0]=HEAP[r12];HEAP[HEAP[HEAP[r13]]+24|0]=HEAP[r17];HEAP[HEAP[HEAP[r13]]+40|0]=0;HEAP[HEAP[HEAP[r13]]+12|0]=0;HEAP[HEAP[HEAP[r13]]+28|0]=0;HEAP[HEAP[HEAP[r13]]+44|0]=0;HEAP[HEAP[HEAP[r13]]+16|0]=0;HEAP[HEAP[HEAP[r13]]+32|0]=0;HEAP[HEAP[HEAP[r13]]|0]=0;if((HEAP[HEAP[HEAP[r13]]+4|0]|0)!=0){HEAP[HEAP[HEAP[HEAP[r13]]+4|0]|0]=HEAP[HEAP[r13]]}if((HEAP[HEAP[HEAP[r13]]+8|0]|0)!=0){HEAP[HEAP[HEAP[HEAP[r13]]+8|0]|0]=HEAP[HEAP[r13]]}HEAP[r9]=1}HEAP[r23]=HEAP[r29]}}while(0);r32=HEAP[r23];STACKTOP=r4;return}function _index234(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r3=0;r4=r1;r1=r2;if((HEAP[r4|0]|0)==0){r5=0;r6=r5;return r6}do{if((r1|0)>=0){if((r1|0)>=(_countnode234(HEAP[r4|0])|0)){break}r2=HEAP[r4|0];r7=r2;L285:do{if((r2|0)!=0){L286:while(1){r8=r7;do{if((r1|0)<(HEAP[r7+20|0]|0)){r9=HEAP[r8+4|0];r7=r9;r10=r9}else{r1=-HEAP[r8+20|0]-1+r1|0;if((r1|0)<0){r3=216;break L286}r9=r7;if((r1|0)<(HEAP[r7+24|0]|0)){r11=HEAP[r9+8|0];r7=r11;r10=r11;break}r1=-HEAP[r9+24|0]-1+r1|0;if((r1|0)<0){r3=220;break L286}r9=r7;if((r1|0)<(HEAP[r7+28|0]|0)){r11=HEAP[r9+12|0];r7=r11;r10=r11;break}r1=-HEAP[r9+28|0]-1+r1|0;r12=r7;if((r1|0)<0){r3=224;break L286}r9=HEAP[r12+16|0];r7=r9;r10=r9}}while(0);if((r10|0)==0){break L285}}if(r3==220){r5=HEAP[r7+40|0];r6=r5;return r6}else if(r3==216){r5=HEAP[r7+36|0];r6=r5;return r6}else if(r3==224){r5=HEAP[r12+44|0];r6=r5;return r6}}}while(0);r5=0;r6=r5;return r6}}while(0);r5=0;r6=r5;return r6}function _findrelpos234(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r5=0;r6=r1;r1=r2;r2=r3;r3=0;r7=r4;if((HEAP[r6|0]|0)==0){r8=0;r9=r8;return r9}if((r2|0)==0){r2=HEAP[r6+4|0]}r4=HEAP[r6|0];r10=0;r11=-1;r12=0;do{if((r1|0)==0){r13=r3;if((r3|0)==1|(r13|0)==3){r14=r13}else{___assert_func(35340,471,37988,36516);r14=r3}if((r14|0)==1){r12=1;break}if((r3|0)!=3){break}r12=-1;break}}while(0);while(1){r14=0;L331:do{if((r14|0)>=4|(r14|0)>=3){r5=257}else{while(1){if((HEAP[(r14<<2)+r4+36|0]|0)==0){r5=257;break L331}if((r12|0)!=0){r15=r12}else{r15=FUNCTION_TABLE[r2](r1,HEAP[(r14<<2)+r4+36|0])}if((r15|0)<0){r5=257;break L331}if((HEAP[(r14<<2)+r4+4|0]|0)!=0){r10=r10+HEAP[(r14<<2)+r4+20|0]|0}if((r15|0)==0){break}r10=r10+1|0;r14=r14+1|0;if((r14|0)>=4|(r14|0)>=3){r5=257;break L331}}r13=r14;r11=r13;r16=r13;break}}while(0);if(r5==257){r5=0;r16=r11}if((r16|0)>=0){break}if((HEAP[(r14<<2)+r4+4|0]|0)==0){break}r4=HEAP[(r14<<2)+r4+4|0]}r16=r3;do{if((r11|0)>=0){if(!((r16|0)!=1&(r3|0)!=3)){r5=r10;if((r3|0)==1){r10=r5-1|0;break}else{r10=r5+1|0;break}}if((r7|0)!=0){HEAP[r7]=r10}r8=HEAP[(r11<<2)+r4+36|0];r9=r8;return r9}else{if((r16|0)==0){r8=0;r9=r8;return r9}else{if(!((r3|0)==1|(r3|0)==2)){break}r10=r10-1|0;break}}}while(0);r3=_index234(r6,r10);r6=r3;do{if((r3|0)!=0){if((r7|0)==0){break}HEAP[r7]=r10}}while(0);r8=r6;r9=r8;return r9}function _del234(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+160|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r4+24;r12=r4+28;r13=r4+32;r14=r4+36;r15=r4+40;r16=r4+44;r17=r4+48;r18=r4+52;r19=r4+56;r20=r4+60;r21=r4+64;r22=r4+68;r23=r4+72;r24=r4+76;r25=r4+80;r26=r4+84;r27=r4+88;r28=r4+92;r29=r4+96;r30=r4+100;r31=r4+104;r32=r4+108;r33=r4+112;r34=r4+116;r35=r4+120;r36=r4+124;r37=r4+128;r38=r4+132;r39=r4+136;r40=r4+140;r41=r4+144;r42=r4+148;r43=r4+152;r44=r4+156;r45=r1;if((_findrelpos234(r45,r2,0,r44)|0)==0){r46=0;r47=r46;STACKTOP=r4;return r47}r2=HEAP[r44];HEAP[r36]=r45;HEAP[r37]=r2;HEAP[r39]=0;HEAP[r38]=HEAP[HEAP[r36]|0];while(1){do{if((HEAP[r37]|0)<=(HEAP[HEAP[r38]+20|0]|0)){HEAP[r40]=0}else{HEAP[r37]=-HEAP[HEAP[r38]+20|0]-1+HEAP[r37]|0;if((HEAP[r37]|0)<=(HEAP[HEAP[r38]+24|0]|0)){HEAP[r40]=1;break}HEAP[r37]=-HEAP[HEAP[r38]+24|0]-1+HEAP[r37]|0;if((HEAP[r37]|0)<=(HEAP[HEAP[r38]+28|0]|0)){HEAP[r40]=2;break}HEAP[r37]=-HEAP[HEAP[r38]+28|0]-1+HEAP[r37]|0;if((HEAP[r37]|0)<=(HEAP[HEAP[r38]+32|0]|0)){HEAP[r40]=3;break}else{___assert_func(35340,900,38096,34048);break}}}while(0);if((HEAP[HEAP[r38]+4|0]|0)==0){break}if((HEAP[r37]|0)==(HEAP[(HEAP[r40]<<2)+HEAP[r38]+20|0]|0)){if((HEAP[(HEAP[r40]<<2)+HEAP[r38]+36|0]|0)==0){___assert_func(35340,916,38096,33896)}HEAP[r40]=HEAP[r40]+1|0;HEAP[r37]=0;HEAP[r43]=HEAP[(HEAP[r40]<<2)+HEAP[r38]+4|0];L401:do{if((HEAP[HEAP[r43]+4|0]|0)!=0){while(1){HEAP[r43]=HEAP[HEAP[r43]+4|0];if((HEAP[HEAP[r43]+4|0]|0)==0){break L401}}}}while(0);HEAP[r39]=HEAP[(HEAP[r40]-1<<2)+HEAP[r38]+36|0];HEAP[(HEAP[r40]-1<<2)+HEAP[r38]+36|0]=HEAP[HEAP[r43]+36|0]}HEAP[r42]=HEAP[(HEAP[r40]<<2)+HEAP[r38]+4|0];L406:do{if((HEAP[HEAP[r42]+40|0]|0)!=0){r3=354}else{do{if((HEAP[r40]|0)>0){if((HEAP[HEAP[(HEAP[r40]-1<<2)+HEAP[r38]+4|0]+40|0]|0)==0){if((HEAP[r40]|0)<3){r3=315;break}else{break}}r2=HEAP[r40]-1|0;HEAP[r27]=HEAP[r38];HEAP[r28]=r2;HEAP[r29]=r40;HEAP[r30]=r37;HEAP[r31]=HEAP[(HEAP[r28]<<2)+HEAP[r27]+4|0];HEAP[r32]=HEAP[(HEAP[r28]+1<<2)+HEAP[r27]+4|0];HEAP[HEAP[r32]+16|0]=HEAP[HEAP[r32]+12|0];HEAP[HEAP[r32]+32|0]=HEAP[HEAP[r32]+28|0];HEAP[HEAP[r32]+44|0]=HEAP[HEAP[r32]+40|0];HEAP[HEAP[r32]+12|0]=HEAP[HEAP[r32]+8|0];HEAP[HEAP[r32]+28|0]=HEAP[HEAP[r32]+24|0];HEAP[HEAP[r32]+40|0]=HEAP[HEAP[r32]+36|0];HEAP[HEAP[r32]+8|0]=HEAP[HEAP[r32]+4|0];HEAP[HEAP[r32]+24|0]=HEAP[HEAP[r32]+20|0];if((HEAP[HEAP[r31]+44|0]|0)!=0){r48=2}else{r48=(HEAP[HEAP[r31]+40|0]|0)!=0?1:0}HEAP[r33]=r48;HEAP[HEAP[r32]+36|0]=HEAP[(HEAP[r28]<<2)+HEAP[r27]+36|0];HEAP[(HEAP[r28]<<2)+HEAP[r27]+36|0]=HEAP[(HEAP[r33]<<2)+HEAP[r31]+36|0];HEAP[(HEAP[r33]<<2)+HEAP[r31]+36|0]=0;HEAP[HEAP[r32]+4|0]=HEAP[(HEAP[r33]+1<<2)+HEAP[r31]+4|0];HEAP[HEAP[r32]+20|0]=HEAP[(HEAP[r33]+1<<2)+HEAP[r31]+20|0];HEAP[(HEAP[r33]+1<<2)+HEAP[r31]+4|0]=0;HEAP[(HEAP[r33]+1<<2)+HEAP[r31]+20|0]=0;if((HEAP[HEAP[r32]+4|0]|0)!=0){HEAP[HEAP[HEAP[r32]+4|0]|0]=HEAP[r32]}HEAP[r35]=HEAP[HEAP[r32]+20|0]+1|0;r2=(HEAP[r28]<<2)+HEAP[r27]+20|0;HEAP[r2]=HEAP[r2]-HEAP[r35]|0;r2=(HEAP[r28]+1<<2)+HEAP[r27]+20|0;HEAP[r2]=HEAP[r2]+HEAP[r35]|0;HEAP[r34]=HEAP[(HEAP[r28]<<2)+HEAP[r27]+20|0];if((HEAP[r29]|0)==0){r3=354;break L406}do{if((HEAP[HEAP[r29]]|0)==(HEAP[r28]|0)){if((HEAP[HEAP[r30]]|0)<=(HEAP[r34]|0)){break}r2=HEAP[r30];HEAP[r2]=-HEAP[r34]-1+HEAP[r2]|0;r2=HEAP[r29];HEAP[r2]=HEAP[r2]+1|0;r3=354;break L406}}while(0);if((HEAP[HEAP[r29]]|0)!=(HEAP[r28]+1|0)){r3=354;break L406}r2=HEAP[r30];HEAP[r2]=HEAP[r2]+HEAP[r35]|0;r3=354;break L406}else{r3=315}}while(0);do{if(r3==315){r3=0;if((HEAP[(HEAP[r40]+1<<2)+HEAP[r38]+4|0]|0)==0){break}if((HEAP[HEAP[(HEAP[r40]+1<<2)+HEAP[r38]+4|0]+40|0]|0)==0){break}r2=HEAP[r40]+1|0;HEAP[r18]=HEAP[r38];HEAP[r19]=r2;HEAP[r20]=r40;HEAP[r21]=r37;HEAP[r22]=HEAP[(HEAP[r19]<<2)+HEAP[r18]+4|0];HEAP[r23]=HEAP[(HEAP[r19]-1<<2)+HEAP[r18]+4|0];if((HEAP[HEAP[r23]+40|0]|0)!=0){r49=2}else{r49=(HEAP[HEAP[r23]+36|0]|0)!=0?1:0}HEAP[r24]=r49;HEAP[(HEAP[r24]<<2)+HEAP[r23]+36|0]=HEAP[(HEAP[r19]-1<<2)+HEAP[r18]+36|0];HEAP[(HEAP[r19]-1<<2)+HEAP[r18]+36|0]=HEAP[HEAP[r22]+36|0];HEAP[(HEAP[r24]+1<<2)+HEAP[r23]+4|0]=HEAP[HEAP[r22]+4|0];HEAP[(HEAP[r24]+1<<2)+HEAP[r23]+20|0]=HEAP[HEAP[r22]+20|0];if((HEAP[(HEAP[r24]+1<<2)+HEAP[r23]+4|0]|0)!=0){HEAP[HEAP[(HEAP[r24]+1<<2)+HEAP[r23]+4|0]|0]=HEAP[r23]}HEAP[HEAP[r22]+4|0]=HEAP[HEAP[r22]+8|0];HEAP[HEAP[r22]+20|0]=HEAP[HEAP[r22]+24|0];HEAP[HEAP[r22]+36|0]=HEAP[HEAP[r22]+40|0];HEAP[HEAP[r22]+8|0]=HEAP[HEAP[r22]+12|0];HEAP[HEAP[r22]+24|0]=HEAP[HEAP[r22]+28|0];HEAP[HEAP[r22]+40|0]=HEAP[HEAP[r22]+44|0];HEAP[HEAP[r22]+12|0]=HEAP[HEAP[r22]+16|0];HEAP[HEAP[r22]+28|0]=HEAP[HEAP[r22]+32|0];HEAP[HEAP[r22]+44|0]=0;HEAP[HEAP[r22]+16|0]=0;HEAP[HEAP[r22]+32|0]=0;HEAP[r25]=HEAP[(HEAP[r24]+1<<2)+HEAP[r23]+20|0]+1|0;r2=(HEAP[r19]<<2)+HEAP[r18]+20|0;HEAP[r2]=HEAP[r2]-HEAP[r25]|0;r2=(HEAP[r19]-1<<2)+HEAP[r18]+20|0;HEAP[r2]=HEAP[r2]+HEAP[r25]|0;if((HEAP[r20]|0)==0){r3=354;break L406}if((HEAP[HEAP[r20]]|0)!=(HEAP[r19]|0)){r3=354;break L406}r2=HEAP[r21];HEAP[r2]=HEAP[r2]-HEAP[r25]|0;if((HEAP[HEAP[r21]]|0)>=0){r3=354;break L406}r2=HEAP[r21];HEAP[r2]=HEAP[(HEAP[r19]-1<<2)+HEAP[r18]+20|0]+HEAP[r2]+1|0;r2=HEAP[r20];HEAP[r2]=HEAP[r2]-1|0;r3=354;break L406}}while(0);r2=HEAP[r40];r45=(HEAP[r40]|0)>0?r2-1|0:r2;HEAP[r6]=HEAP[r38];HEAP[r7]=r45;HEAP[r8]=r40;HEAP[r9]=r37;HEAP[r10]=HEAP[(HEAP[r7]<<2)+HEAP[r6]+4|0];HEAP[r13]=HEAP[(HEAP[r7]<<2)+HEAP[r6]+20|0];HEAP[r11]=HEAP[(HEAP[r7]+1<<2)+HEAP[r6]+4|0];HEAP[r14]=HEAP[(HEAP[r7]+1<<2)+HEAP[r6]+20|0];do{if((HEAP[HEAP[r10]+44|0]|0)!=0){r3=327}else{if((HEAP[HEAP[r11]+44|0]|0)!=0){r3=327;break}else{break}}}while(0);if(r3==327){r3=0;___assert_func(35340,809,37404,34236)}if((HEAP[HEAP[r10]+40|0]|0)!=0){r50=2}else{r50=(HEAP[HEAP[r10]+36|0]|0)!=0?1:0}HEAP[r15]=r50;if((HEAP[HEAP[r11]+40|0]|0)!=0){r51=2}else{r51=(HEAP[HEAP[r11]+36|0]|0)!=0?1:0}HEAP[r16]=r51;HEAP[(HEAP[r15]<<2)+HEAP[r10]+36|0]=HEAP[(HEAP[r7]<<2)+HEAP[r6]+36|0];HEAP[r12]=0;L450:do{if((HEAP[r12]|0)<(HEAP[r16]+1|0)){while(1){HEAP[(HEAP[r15]+HEAP[r12]+1<<2)+HEAP[r10]+4|0]=HEAP[(HEAP[r12]<<2)+HEAP[r11]+4|0];HEAP[(HEAP[r15]+HEAP[r12]+1<<2)+HEAP[r10]+20|0]=HEAP[(HEAP[r12]<<2)+HEAP[r11]+20|0];if((HEAP[(HEAP[r15]+HEAP[r12]+1<<2)+HEAP[r10]+4|0]|0)!=0){HEAP[HEAP[(HEAP[r15]+HEAP[r12]+1<<2)+HEAP[r10]+4|0]|0]=HEAP[r10]}if((HEAP[r12]|0)<(HEAP[r16]|0)){HEAP[(HEAP[r15]+HEAP[r12]+1<<2)+HEAP[r10]+36|0]=HEAP[(HEAP[r12]<<2)+HEAP[r11]+36|0]}HEAP[r12]=HEAP[r12]+1|0;if((HEAP[r12]|0)>=(HEAP[r16]+1|0)){break L450}}}}while(0);r45=(HEAP[r7]<<2)+HEAP[r6]+20|0;HEAP[r45]=HEAP[r14]+HEAP[r45]+1|0;r45=HEAP[r11];HEAP[r5]=r45;if((r45|0)!=0){_free(HEAP[r5])}r45=HEAP[r7];r2=r45+1|0;HEAP[r12]=r2;if((r2|0)<3){while(1){HEAP[(HEAP[r12]<<2)+HEAP[r6]+4|0]=HEAP[(HEAP[r12]+1<<2)+HEAP[r6]+4|0];HEAP[(HEAP[r12]<<2)+HEAP[r6]+20|0]=HEAP[(HEAP[r12]+1<<2)+HEAP[r6]+20|0];r2=HEAP[r12]+1|0;HEAP[r12]=r2;if((r2|0)>=3){break}}r52=HEAP[r7]}else{r52=r45}HEAP[r12]=r52;L468:do{if((r52|0)<2){while(1){HEAP[(HEAP[r12]<<2)+HEAP[r6]+36|0]=HEAP[(HEAP[r12]+1<<2)+HEAP[r6]+36|0];r2=HEAP[r12]+1|0;HEAP[r12]=r2;if((r2|0)>=2){break L468}}}}while(0);HEAP[HEAP[r6]+16|0]=0;HEAP[HEAP[r6]+32|0]=0;HEAP[HEAP[r6]+44|0]=0;do{if((HEAP[r8]|0)!=0){r45=HEAP[r8];r2=HEAP[r45];if((HEAP[HEAP[r8]]|0)==(HEAP[r7]+1|0)){HEAP[r45]=r2-1|0;r45=HEAP[r9];HEAP[r45]=HEAP[r13]+HEAP[r45]+1|0;break}if((r2|0)<=(HEAP[r7]+1|0)){break}r2=HEAP[r8];HEAP[r2]=HEAP[r2]-1|0}}while(0);HEAP[r42]=HEAP[(HEAP[r40]<<2)+HEAP[r38]+4|0];r2=HEAP[r38];if((HEAP[r2+36|0]|0)!=0){r53=r2;r3=355;break}HEAP[HEAP[r36]|0]=HEAP[r42];HEAP[HEAP[r42]|0]=0;HEAP[r17]=HEAP[r38];if((HEAP[r17]|0)!=0){_free(HEAP[r17])}HEAP[r38]=0;break}}while(0);do{if(r3==354){r3=0;r53=HEAP[r38];r3=355;break}}while(0);do{if(r3==355){r3=0;if((r53|0)==0){break}r2=(HEAP[r40]<<2)+HEAP[r38]+20|0;HEAP[r2]=HEAP[r2]-1|0}}while(0);HEAP[r38]=HEAP[r42]}if((HEAP[HEAP[r38]+4|0]|0)!=0){___assert_func(35340,980,38096,33824)}if((HEAP[r39]|0)==0){HEAP[r39]=HEAP[(HEAP[r40]<<2)+HEAP[r38]+36|0]}r42=HEAP[r40];HEAP[r41]=r42;r40=HEAP[r41];L496:do{if((r42|0)<2){r53=r40;while(1){r3=HEAP[r41];if((HEAP[(r53+1<<2)+HEAP[r38]+36|0]|0)==0){r54=r3;break L496}HEAP[(HEAP[r41]<<2)+HEAP[r38]+36|0]=HEAP[(r3+1<<2)+HEAP[r38]+36|0];r3=HEAP[r41]+1|0;HEAP[r41]=r3;r17=HEAP[r41];if((r3|0)<2){r53=r17}else{r54=r17;break L496}}}else{r54=r40}}while(0);HEAP[(r54<<2)+HEAP[r38]+36|0]=0;if((HEAP[HEAP[r38]+36|0]|0)==0){if((HEAP[r38]|0)!=(HEAP[HEAP[r36]|0]|0)){___assert_func(35340,995,38096,36792)}r54=HEAP[r38];HEAP[r26]=r54;if((r54|0)!=0){_free(HEAP[r26])}HEAP[HEAP[r36]|0]=0}r46=HEAP[r39];r47=r46;STACKTOP=r4;return r47}function _malloc(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187,r188,r189,r190,r191,r192,r193,r194,r195,r196,r197,r198,r199,r200,r201,r202,r203,r204,r205,r206,r207,r208,r209,r210,r211,r212,r213,r214,r215,r216,r217,r218,r219,r220,r221,r222,r223,r224,r225,r226,r227,r228,r229,r230,r231,r232,r233,r234,r235,r236,r237,r238,r239,r240,r241,r242,r243,r244,r245,r246;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+776|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r3+100;r30=r3+104;r31=r3+108;r32=r3+112;r33=r3+116;r34=r3+120;r35=r3+124;r36=r3+128;r37=r3+132;r38=r3+136;r39=r3+140;r40=r3+144;r41=r3+148;r42=r3+152;r43=r3+156;r44=r3+160;r45=r3+164;r46=r3+168;r47=r3+172;r48=r3+176;r49=r3+180;r50=r3+184;r51=r3+188;r52=r3+192;r53=r3+196;r54=r3+200;r55=r3+204;r56=r3+208;r57=r3+212;r58=r3+216;r59=r3+220;r60=r3+224;r61=r3+228;r62=r3+232;r63=r3+236;r64=r3+240;r65=r3+244;r66=r3+248;r67=r3+252;r68=r3+256;r69=r3+260;r70=r3+264;r71=r3+268;r72=r3+272;r73=r3+276;r74=r3+280;r75=r3+284;r76=r3+288;r77=r3+292;r78=r3+296;r79=r3+300;r80=r3+304;r81=r3+308;r82=r3+312;r83=r3+316;r84=r3+320;r85=r3+324;r86=r3+328;r87=r3+332;r88=r3+336;r89=r3+340;r90=r3+344;r91=r3+348;r92=r3+352;r93=r3+356;r94=r3+360;r95=r3+364;r96=r3+368;r97=r3+372;r98=r3+376;r99=r3+380;r100=r3+384;r101=r3+388;r102=r3+392;r103=r3+396;r104=r3+400;r105=r3+404;r106=r3+408;r107=r3+412;r108=r3+416;r109=r3+420;r110=r3+424;r111=r3+428;r112=r3+432;r113=r3+436;r114=r3+440;r115=r3+444;r116=r3+448;r117=r3+452;r118=r3+456;r119=r3+460;r120=r3+464;r121=r3+468;r122=r3+472;r123=r3+476;r124=r3+480;r125=r3+484;r126=r3+488;r127=r3+492;r128=r3+496;r129=r3+500;r130=r3+504;r131=r3+508;r132=r3+512;r133=r3+516;r134=r3+520;r135=r3+524;r136=r3+528;r137=r3+532;r138=r3+536;r139=r3+540;r140=r3+544;r141=r3+548;r142=r3+552;r143=r3+556;r144=r3+560;r145=r3+564;r146=r3+568;r147=r3+572;r148=r3+576;r149=r3+580;r150=r3+584;r151=r3+588;r152=r3+592;r153=r3+596;r154=r3+600;r155=r3+604;r156=r3+608;r157=r3+612;r158=r3+616;r159=r3+620;r160=r3+624;r161=r3+628;r162=r3+632;r163=r3+636;r164=r3+640;r165=r3+644;r166=r3+648;r167=r3+652;r168=r3+656;r169=r3+660;r170=r3+664;r171=r3+668;r172=r3+672;r173=r3+676;r174=r3+680;r175=r3+684;r176=r3+688;r177=r3+692;r178=r3+696;r179=r3+700;r180=r3+704;r181=r3+708;r182=r3+712;r183=r3+716;r184=r3+720;r185=r3+724;r186=r3+728;r187=r3+732;r188=r3+736;r189=r3+740;r190=r3+744;r191=r3+748;r192=r3+752;r193=r3+756;r194=r3+760;r195=r3+764;r196=r3+768;r197=r3+772;r198=r1;r1=r198;do{if(r198>>>0<=244){if(r1>>>0<11){r199=16}else{r199=r198+11&-8}r200=r199;r201=r200>>>3;r202=HEAP[36884]>>>(r201>>>0);if((r202&3|0)!=0){r201=r201+((r202^-1)&1)|0;r203=(r201<<3)+36924|0;r204=HEAP[r203+8|0];r205=HEAP[r204+8|0];do{if((r203|0)==(r205|0)){HEAP[36884]=HEAP[36884]&(1<<r201^-1)}else{if(r205>>>0>=HEAP[36900]>>>0){r206=(HEAP[r205+12|0]|0)==(r204|0)}else{r206=0}if((r206&1|0)!=0){HEAP[r205+12|0]=r203;HEAP[r203+8|0]=r205;break}else{_abort()}}}while(0);HEAP[r204+4|0]=r201<<3|3;r205=(r201<<3)+r204+4|0;HEAP[r205]=HEAP[r205]|1;r207=r204+8|0;r208=r207;STACKTOP=r3;return r208}if(r200>>>0<=HEAP[36892]>>>0){break}if((r202|0)!=0){r205=(-(1<<r201<<1)|1<<r201<<1)&r202<<r201;r203=(-r205&r205)-1|0;r205=r203>>>12&16;r209=r205;r203=r203>>>(r205>>>0);r210=r203>>>5&8;r205=r210;r209=r210+r209|0;r203=r203>>>(r205>>>0);r210=r203>>>2&4;r205=r210;r209=r210+r209|0;r203=r203>>>(r205>>>0);r210=r203>>>1&2;r205=r210;r209=r210+r209|0;r203=r203>>>(r205>>>0);r210=r203>>>1&1;r205=r210;r209=r210+r209|0;r203=r203>>>(r205>>>0);r205=r203+r209|0;r209=(r205<<3)+36924|0;r203=HEAP[r209+8|0];r210=HEAP[r203+8|0];do{if((r209|0)==(r210|0)){HEAP[36884]=HEAP[36884]&(1<<r205^-1)}else{if(r210>>>0>=HEAP[36900]>>>0){r211=(HEAP[r210+12|0]|0)==(r203|0)}else{r211=0}if((r211&1|0)!=0){HEAP[r210+12|0]=r209;HEAP[r209+8|0]=r210;break}else{_abort()}}}while(0);r210=(r205<<3)-r200|0;HEAP[r203+4|0]=r200|3;r209=r203+r200|0;HEAP[r209+4|0]=r210|1;HEAP[r209+r210|0]=r210;r201=HEAP[36892];if((r201|0)!=0){r202=HEAP[36904];r204=r201>>>3;r201=(r204<<3)+36924|0;r212=r201;do{if((1<<r204&HEAP[36884]|0)!=0){if((HEAP[r201+8|0]>>>0>=HEAP[36900]>>>0&1|0)!=0){r212=HEAP[r201+8|0];break}else{_abort()}}else{HEAP[36884]=HEAP[36884]|1<<r204}}while(0);HEAP[r201+8|0]=r202;HEAP[r212+12|0]=r202;HEAP[r202+8|0]=r212;HEAP[r202+12|0]=r201}HEAP[36892]=r210;HEAP[36904]=r209;r207=r203+8|0;r208=r207;STACKTOP=r3;return r208}if((HEAP[36888]|0)==0){break}HEAP[r173]=36884;HEAP[r174]=r200;HEAP[r179]=-HEAP[HEAP[r173]+4|0]&HEAP[HEAP[r173]+4|0];HEAP[r180]=HEAP[r179]-1|0;HEAP[r181]=HEAP[r180]>>>12&16;HEAP[r182]=HEAP[r181];HEAP[r180]=HEAP[r180]>>>(HEAP[r181]>>>0);r204=HEAP[r180]>>>5&8;HEAP[r181]=r204;HEAP[r182]=r204+HEAP[r182]|0;HEAP[r180]=HEAP[r180]>>>(HEAP[r181]>>>0);r204=HEAP[r180]>>>2&4;HEAP[r181]=r204;HEAP[r182]=r204+HEAP[r182]|0;HEAP[r180]=HEAP[r180]>>>(HEAP[r181]>>>0);r204=HEAP[r180]>>>1&2;HEAP[r181]=r204;HEAP[r182]=r204+HEAP[r182]|0;HEAP[r180]=HEAP[r180]>>>(HEAP[r181]>>>0);r204=HEAP[r180]>>>1&1;HEAP[r181]=r204;HEAP[r182]=r204+HEAP[r182]|0;HEAP[r180]=HEAP[r180]>>>(HEAP[r181]>>>0);HEAP[r178]=HEAP[r180]+HEAP[r182]|0;r204=HEAP[(HEAP[r178]<<2)+HEAP[r173]+304|0];HEAP[r175]=r204;HEAP[r176]=r204;HEAP[r177]=(HEAP[HEAP[r175]+4|0]&-8)-HEAP[r174]|0;while(1){r204=HEAP[r175]+16|0;if((HEAP[HEAP[r175]+16|0]|0)!=0){r213=HEAP[r204|0]}else{r213=HEAP[r204+4|0]}HEAP[r175]=r213;if((r213|0)==0){break}HEAP[r183]=(HEAP[HEAP[r175]+4|0]&-8)-HEAP[r174]|0;if(HEAP[r183]>>>0>=HEAP[r177]>>>0){continue}HEAP[r177]=HEAP[r183];HEAP[r176]=HEAP[r175]}if((HEAP[r176]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)==0){_abort()}HEAP[r184]=HEAP[r176]+HEAP[r174]|0;if((HEAP[r176]>>>0<HEAP[r184]>>>0&1|0)==0){_abort()}HEAP[r185]=HEAP[HEAP[r176]+24|0];r203=HEAP[r176];L725:do{if((HEAP[HEAP[r176]+12|0]|0)!=(HEAP[r176]|0)){HEAP[r187]=HEAP[r203+8|0];HEAP[r186]=HEAP[HEAP[r176]+12|0];do{if(HEAP[r187]>>>0>=HEAP[HEAP[r173]+16|0]>>>0){if((HEAP[HEAP[r187]+12|0]|0)!=(HEAP[r176]|0)){r214=0;break}r214=(HEAP[HEAP[r186]+8|0]|0)==(HEAP[r176]|0)}else{r214=0}}while(0);if((r214&1|0)!=0){HEAP[HEAP[r187]+12|0]=HEAP[r186];HEAP[HEAP[r186]+8|0]=HEAP[r187];break}else{_abort()}}else{r209=r203+20|0;HEAP[r188]=r209;r210=HEAP[r209];HEAP[r186]=r210;do{if((r210|0)==0){r209=HEAP[r176]+16|0;HEAP[r188]=r209;r201=HEAP[r209];HEAP[r186]=r201;if((r201|0)!=0){break}else{break L725}}}while(0);while(1){r210=HEAP[r186]+20|0;HEAP[r189]=r210;if((HEAP[r210]|0)==0){r210=HEAP[r186]+16|0;HEAP[r189]=r210;if((HEAP[r210]|0)==0){break}}r210=HEAP[r189];HEAP[r188]=r210;HEAP[r186]=HEAP[r210]}if((HEAP[r188]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r188]]=0;break}else{_abort()}}}while(0);do{if((HEAP[r185]|0)!=0){HEAP[r190]=(HEAP[HEAP[r176]+28|0]<<2)+HEAP[r173]+304|0;do{if((HEAP[r176]|0)==(HEAP[HEAP[r190]]|0)){r203=HEAP[r186];HEAP[HEAP[r190]]=r203;if((r203|0)!=0){break}r203=HEAP[r173]+4|0;HEAP[r203]=HEAP[r203]&(1<<HEAP[HEAP[r176]+28|0]^-1)}else{if((HEAP[r185]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)==0){_abort()}r203=HEAP[r186];r210=HEAP[r185]+16|0;if((HEAP[HEAP[r185]+16|0]|0)==(HEAP[r176]|0)){HEAP[r210|0]=r203;break}else{HEAP[r210+4|0]=r203;break}}}while(0);if((HEAP[r186]|0)==0){break}if((HEAP[r186]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)==0){_abort()}HEAP[HEAP[r186]+24|0]=HEAP[r185];r203=HEAP[HEAP[r176]+16|0];HEAP[r191]=r203;do{if((r203|0)!=0){if((HEAP[r191]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r186]+16|0]=HEAP[r191];HEAP[HEAP[r191]+24|0]=HEAP[r186];break}else{_abort()}}}while(0);r203=HEAP[HEAP[r176]+20|0];HEAP[r192]=r203;if((r203|0)==0){break}if((HEAP[r192]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r186]+20|0]=HEAP[r192];HEAP[HEAP[r192]+24|0]=HEAP[r186];break}else{_abort()}}}while(0);if(HEAP[r177]>>>0<16){HEAP[HEAP[r176]+4|0]=HEAP[r174]+HEAP[r177]|3;r203=HEAP[r176]+HEAP[r174]+HEAP[r177]+4|0;HEAP[r203]=HEAP[r203]|1}else{HEAP[HEAP[r176]+4|0]=HEAP[r174]|3;HEAP[HEAP[r184]+4|0]=HEAP[r177]|1;HEAP[HEAP[r184]+HEAP[r177]|0]=HEAP[r177];HEAP[r193]=HEAP[HEAP[r173]+8|0];if((HEAP[r193]|0)!=0){HEAP[r194]=HEAP[HEAP[r173]+20|0];HEAP[r195]=HEAP[r193]>>>3;HEAP[r196]=(HEAP[r195]<<3)+HEAP[r173]+40|0;HEAP[r197]=HEAP[r196];do{if((1<<HEAP[r195]&HEAP[HEAP[r173]|0]|0)!=0){if((HEAP[HEAP[r196]+8|0]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)!=0){HEAP[r197]=HEAP[HEAP[r196]+8|0];break}else{_abort()}}else{r203=HEAP[r173]|0;HEAP[r203]=HEAP[r203]|1<<HEAP[r195]}}while(0);HEAP[HEAP[r196]+8|0]=HEAP[r194];HEAP[HEAP[r197]+12|0]=HEAP[r194];HEAP[HEAP[r194]+8|0]=HEAP[r197];HEAP[HEAP[r194]+12|0]=HEAP[r196]}HEAP[HEAP[r173]+8|0]=HEAP[r177];HEAP[HEAP[r173]+20|0]=HEAP[r184]}r203=HEAP[r176]+8|0;r207=r203;if((r203|0)==0){break}r208=r207;STACKTOP=r3;return r208}else{if(r1>>>0>=4294967232){r200=-1;break}r200=r198+11&-8;if((HEAP[36888]|0)==0){break}HEAP[r129]=36884;HEAP[r130]=r200;HEAP[r131]=0;HEAP[r132]=-HEAP[r130]|0;HEAP[r135]=HEAP[r130]>>>8;do{if((HEAP[r135]|0)==0){HEAP[r134]=0}else{if(HEAP[r135]>>>0>65535){HEAP[r134]=31;break}else{HEAP[r136]=HEAP[r135];HEAP[r137]=(HEAP[r136]-256|0)>>>16&8;r203=HEAP[r136]<<HEAP[r137];HEAP[r136]=r203;HEAP[r138]=(r203-4096|0)>>>16&4;HEAP[r137]=HEAP[r137]+HEAP[r138]|0;r203=HEAP[r136]<<HEAP[r138];HEAP[r136]=r203;r210=(r203-16384|0)>>>16&2;HEAP[r138]=r210;HEAP[r137]=r210+HEAP[r137]|0;r210=-HEAP[r137]+14|0;r203=HEAP[r136]<<HEAP[r138];HEAP[r136]=r203;HEAP[r138]=r210+(r203>>>15)|0;HEAP[r134]=(HEAP[r138]<<1)+(HEAP[r130]>>>((HEAP[r138]+7|0)>>>0)&1)|0;break}}}while(0);r203=HEAP[(HEAP[r134]<<2)+HEAP[r129]+304|0];HEAP[r133]=r203;do{if((r203|0)!=0){if((HEAP[r134]|0)==31){r215=0}else{r215=-(HEAP[r134]>>>1)+25|0}HEAP[r139]=HEAP[r130]<<r215;HEAP[r140]=0;while(1){HEAP[r142]=(HEAP[HEAP[r133]+4|0]&-8)-HEAP[r130]|0;if(HEAP[r142]>>>0<HEAP[r132]>>>0){r210=HEAP[r133];HEAP[r131]=r210;r201=HEAP[r142];HEAP[r132]=r201;if((r201|0)==0){r216=r210;break}}HEAP[r141]=HEAP[HEAP[r133]+20|0];r210=HEAP[((HEAP[r139]>>>31&1)<<2)+HEAP[r133]+16|0];HEAP[r133]=r210;do{if((HEAP[r141]|0)!=0){r201=HEAP[r133];if((HEAP[r141]|0)==(r201|0)){r217=r201;break}HEAP[r140]=HEAP[r141];r217=HEAP[r133]}else{r217=r210}}while(0);if((r217|0)==0){r2=479;break}HEAP[r139]=HEAP[r139]<<1}if(r2==479){r210=HEAP[r140];HEAP[r133]=r210;r216=r210}if((r216|0)==0){r2=482;break}else{r2=485;break}}else{r2=482}}while(0);do{if(r2==482){if((HEAP[r131]|0)!=0){r2=485;break}HEAP[r143]=(-(1<<HEAP[r134]<<1)|1<<HEAP[r134]<<1)&HEAP[HEAP[r129]+4|0];if((HEAP[r143]|0)==0){r2=485;break}HEAP[r145]=-HEAP[r143]&HEAP[r143];HEAP[r146]=HEAP[r145]-1|0;HEAP[r147]=HEAP[r146]>>>12&16;HEAP[r148]=HEAP[r147];HEAP[r146]=HEAP[r146]>>>(HEAP[r147]>>>0);r203=HEAP[r146]>>>5&8;HEAP[r147]=r203;HEAP[r148]=r203+HEAP[r148]|0;HEAP[r146]=HEAP[r146]>>>(HEAP[r147]>>>0);r203=HEAP[r146]>>>2&4;HEAP[r147]=r203;HEAP[r148]=r203+HEAP[r148]|0;HEAP[r146]=HEAP[r146]>>>(HEAP[r147]>>>0);r203=HEAP[r146]>>>1&2;HEAP[r147]=r203;HEAP[r148]=r203+HEAP[r148]|0;HEAP[r146]=HEAP[r146]>>>(HEAP[r147]>>>0);r203=HEAP[r146]>>>1&1;HEAP[r147]=r203;HEAP[r148]=r203+HEAP[r148]|0;HEAP[r146]=HEAP[r146]>>>(HEAP[r147]>>>0);HEAP[r144]=HEAP[r146]+HEAP[r148]|0;r203=HEAP[(HEAP[r144]<<2)+HEAP[r129]+304|0];HEAP[r133]=r203;r218=r203;break}}while(0);if(r2==485){r218=HEAP[r133]}L550:do{if((r218|0)!=0){while(1){HEAP[r149]=(HEAP[HEAP[r133]+4|0]&-8)-HEAP[r130]|0;if(HEAP[r149]>>>0<HEAP[r132]>>>0){HEAP[r132]=HEAP[r149];HEAP[r131]=HEAP[r133]}r203=HEAP[r133]+16|0;if((HEAP[HEAP[r133]+16|0]|0)!=0){r219=HEAP[r203|0]}else{r219=HEAP[r203+4|0]}HEAP[r133]=r219;if((r219|0)==0){break L550}}}}while(0);do{if((HEAP[r131]|0)!=0){if(HEAP[r132]>>>0>=(HEAP[HEAP[r129]+8|0]-HEAP[r130]|0)>>>0){r2=563;break}if((HEAP[r131]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)==0){_abort()}HEAP[r150]=HEAP[r131]+HEAP[r130]|0;if((HEAP[r131]>>>0<HEAP[r150]>>>0&1|0)==0){_abort()}HEAP[r151]=HEAP[HEAP[r131]+24|0];r203=HEAP[r131];L570:do{if((HEAP[HEAP[r131]+12|0]|0)!=(HEAP[r131]|0)){HEAP[r153]=HEAP[r203+8|0];HEAP[r152]=HEAP[HEAP[r131]+12|0];do{if(HEAP[r153]>>>0>=HEAP[HEAP[r129]+16|0]>>>0){if((HEAP[HEAP[r153]+12|0]|0)!=(HEAP[r131]|0)){r220=0;break}r220=(HEAP[HEAP[r152]+8|0]|0)==(HEAP[r131]|0)}else{r220=0}}while(0);if((r220&1|0)!=0){HEAP[HEAP[r153]+12|0]=HEAP[r152];HEAP[HEAP[r152]+8|0]=HEAP[r153];break}else{_abort()}}else{r210=r203+20|0;HEAP[r154]=r210;r201=HEAP[r210];HEAP[r152]=r201;do{if((r201|0)==0){r210=HEAP[r131]+16|0;HEAP[r154]=r210;r209=HEAP[r210];HEAP[r152]=r209;if((r209|0)!=0){break}else{break L570}}}while(0);while(1){r201=HEAP[r152]+20|0;HEAP[r155]=r201;if((HEAP[r201]|0)==0){r201=HEAP[r152]+16|0;HEAP[r155]=r201;if((HEAP[r201]|0)==0){break}}r201=HEAP[r155];HEAP[r154]=r201;HEAP[r152]=HEAP[r201]}if((HEAP[r154]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r154]]=0;break}else{_abort()}}}while(0);do{if((HEAP[r151]|0)!=0){HEAP[r156]=(HEAP[HEAP[r131]+28|0]<<2)+HEAP[r129]+304|0;do{if((HEAP[r131]|0)==(HEAP[HEAP[r156]]|0)){r203=HEAP[r152];HEAP[HEAP[r156]]=r203;if((r203|0)!=0){break}r203=HEAP[r129]+4|0;HEAP[r203]=HEAP[r203]&(1<<HEAP[HEAP[r131]+28|0]^-1)}else{if((HEAP[r151]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)==0){_abort()}r203=HEAP[r152];r201=HEAP[r151]+16|0;if((HEAP[HEAP[r151]+16|0]|0)==(HEAP[r131]|0)){HEAP[r201|0]=r203;break}else{HEAP[r201+4|0]=r203;break}}}while(0);if((HEAP[r152]|0)==0){break}if((HEAP[r152]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)==0){_abort()}HEAP[HEAP[r152]+24|0]=HEAP[r151];r203=HEAP[HEAP[r131]+16|0];HEAP[r157]=r203;do{if((r203|0)!=0){if((HEAP[r157]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r152]+16|0]=HEAP[r157];HEAP[HEAP[r157]+24|0]=HEAP[r152];break}else{_abort()}}}while(0);r203=HEAP[HEAP[r131]+20|0];HEAP[r158]=r203;if((r203|0)==0){break}if((HEAP[r158]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r152]+20|0]=HEAP[r158];HEAP[HEAP[r158]+24|0]=HEAP[r152];break}else{_abort()}}}while(0);L620:do{if(HEAP[r132]>>>0<16){HEAP[HEAP[r131]+4|0]=HEAP[r130]+HEAP[r132]|3;r203=HEAP[r131]+HEAP[r130]+HEAP[r132]+4|0;HEAP[r203]=HEAP[r203]|1}else{HEAP[HEAP[r131]+4|0]=HEAP[r130]|3;HEAP[HEAP[r150]+4|0]=HEAP[r132]|1;HEAP[HEAP[r150]+HEAP[r132]|0]=HEAP[r132];if(HEAP[r132]>>>3>>>0<32){HEAP[r159]=HEAP[r132]>>>3;HEAP[r160]=(HEAP[r159]<<3)+HEAP[r129]+40|0;HEAP[r161]=HEAP[r160];do{if((1<<HEAP[r159]&HEAP[HEAP[r129]|0]|0)!=0){if((HEAP[HEAP[r160]+8|0]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)!=0){HEAP[r161]=HEAP[HEAP[r160]+8|0];break}else{_abort()}}else{r203=HEAP[r129]|0;HEAP[r203]=HEAP[r203]|1<<HEAP[r159]}}while(0);HEAP[HEAP[r160]+8|0]=HEAP[r150];HEAP[HEAP[r161]+12|0]=HEAP[r150];HEAP[HEAP[r150]+8|0]=HEAP[r161];HEAP[HEAP[r150]+12|0]=HEAP[r160];break}HEAP[r162]=HEAP[r150];HEAP[r165]=HEAP[r132]>>>8;do{if((HEAP[r165]|0)==0){HEAP[r164]=0}else{if(HEAP[r165]>>>0>65535){HEAP[r164]=31;break}else{HEAP[r166]=HEAP[r165];HEAP[r167]=(HEAP[r166]-256|0)>>>16&8;r203=HEAP[r166]<<HEAP[r167];HEAP[r166]=r203;HEAP[r168]=(r203-4096|0)>>>16&4;HEAP[r167]=HEAP[r167]+HEAP[r168]|0;r203=HEAP[r166]<<HEAP[r168];HEAP[r166]=r203;r201=(r203-16384|0)>>>16&2;HEAP[r168]=r201;HEAP[r167]=r201+HEAP[r167]|0;r201=-HEAP[r167]+14|0;r203=HEAP[r166]<<HEAP[r168];HEAP[r166]=r203;HEAP[r168]=r201+(r203>>>15)|0;HEAP[r164]=(HEAP[r168]<<1)+(HEAP[r132]>>>((HEAP[r168]+7|0)>>>0)&1)|0;break}}}while(0);HEAP[r163]=(HEAP[r164]<<2)+HEAP[r129]+304|0;HEAP[HEAP[r162]+28|0]=HEAP[r164];HEAP[HEAP[r162]+20|0]=0;HEAP[HEAP[r162]+16|0]=0;if((1<<HEAP[r164]&HEAP[HEAP[r129]+4|0]|0)==0){r203=HEAP[r129]+4|0;HEAP[r203]=HEAP[r203]|1<<HEAP[r164];HEAP[HEAP[r163]]=HEAP[r162];HEAP[HEAP[r162]+24|0]=HEAP[r163];r203=HEAP[r162];HEAP[HEAP[r162]+12|0]=r203;HEAP[HEAP[r162]+8|0]=r203;break}HEAP[r169]=HEAP[HEAP[r163]];if((HEAP[r164]|0)==31){r221=0}else{r221=-(HEAP[r164]>>>1)+25|0}HEAP[r170]=HEAP[r132]<<r221;L646:do{if((HEAP[HEAP[r169]+4|0]&-8|0)!=(HEAP[r132]|0)){while(1){HEAP[r171]=((HEAP[r170]>>>31&1)<<2)+HEAP[r169]+16|0;HEAP[r170]=HEAP[r170]<<1;r222=HEAP[r171];if((HEAP[HEAP[r171]]|0)==0){break}HEAP[r169]=HEAP[r222];if((HEAP[HEAP[r169]+4|0]&-8|0)==(HEAP[r132]|0)){break L646}}if((r222>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r171]]=HEAP[r162];HEAP[HEAP[r162]+24|0]=HEAP[r169];r203=HEAP[r162];HEAP[HEAP[r162]+12|0]=r203;HEAP[HEAP[r162]+8|0]=r203;break L620}else{_abort()}}}while(0);HEAP[r172]=HEAP[HEAP[r169]+8|0];if(HEAP[r169]>>>0>=HEAP[HEAP[r129]+16|0]>>>0){r223=HEAP[r172]>>>0>=HEAP[HEAP[r129]+16|0]>>>0}else{r223=0}if((r223&1|0)!=0){r203=HEAP[r162];HEAP[HEAP[r172]+12|0]=r203;HEAP[HEAP[r169]+8|0]=r203;HEAP[HEAP[r162]+8|0]=HEAP[r172];HEAP[HEAP[r162]+12|0]=HEAP[r169];HEAP[HEAP[r162]+24|0]=0;break}else{_abort()}}}while(0);r203=HEAP[r131]+8|0;HEAP[r128]=r203;r224=r203;break}else{r2=563}}while(0);if(r2==563){HEAP[r128]=0;r224=0}r207=r224;if((r224|0)==0){break}r208=r207;STACKTOP=r3;return r208}}while(0);if(r200>>>0<=HEAP[36892]>>>0){r224=HEAP[36892]-r200|0;r128=HEAP[36904];if(r224>>>0>=16){r131=r128+r200|0;HEAP[36904]=r131;r162=r131;HEAP[36892]=r224;HEAP[r162+4|0]=r224|1;HEAP[r162+r224|0]=r224;HEAP[r128+4|0]=r200|3}else{r224=HEAP[36892];HEAP[36892]=0;HEAP[36904]=0;HEAP[r128+4|0]=r224|3;r162=r224+(r128+4)|0;HEAP[r162]=HEAP[r162]|1}r207=r128+8|0;r208=r207;STACKTOP=r3;return r208}r128=r200;if(r200>>>0<HEAP[36896]>>>0){r162=HEAP[36896]-r128|0;HEAP[36896]=r162;r224=HEAP[36908];r131=r224+r200|0;HEAP[36908]=r131;HEAP[r131+4|0]=r162|1;HEAP[r224+4|0]=r200|3;r207=r224+8|0;r208=r207;STACKTOP=r3;return r208}HEAP[r105]=36884;HEAP[r106]=r128;HEAP[r107]=-1;HEAP[r108]=0;HEAP[r109]=0;if((HEAP[33232]|0)==0){_init_mparams()}HEAP[r110]=(HEAP[33240]-1^-1)&HEAP[r106]+HEAP[33240]+47;L806:do{if(HEAP[r110]>>>0<=HEAP[r106]>>>0){HEAP[r104]=0}else{do{if((HEAP[HEAP[r105]+440|0]|0)!=0){HEAP[r111]=HEAP[r110]+HEAP[HEAP[r105]+432|0]|0;if(!(HEAP[r111]>>>0<=HEAP[HEAP[r105]+432|0]>>>0)){if(HEAP[r111]>>>0<=HEAP[HEAP[r105]+440|0]>>>0){break}}HEAP[r104]=0;break L806}}while(0);L815:do{if((HEAP[HEAP[r105]+444|0]&4|0)!=0){r2=614}else{HEAP[r112]=-1;HEAP[r113]=HEAP[r110];do{if((HEAP[HEAP[r105]+24|0]|0)==0){HEAP[r114]=0;r2=590;break}else{r128=HEAP[HEAP[r105]+24|0];HEAP[r101]=HEAP[r105];HEAP[r102]=r128;HEAP[r103]=HEAP[r101]+448|0;while(1){if(HEAP[r102]>>>0>=HEAP[HEAP[r103]|0]>>>0){if(HEAP[r102]>>>0<(HEAP[HEAP[r103]|0]+HEAP[HEAP[r103]+4|0]|0)>>>0){r2=586;break}}r128=HEAP[HEAP[r103]+8|0];HEAP[r103]=r128;if((r128|0)==0){r2=588;break}}if(r2==586){r128=HEAP[r103];HEAP[r100]=r128;r225=r128}else if(r2==588){HEAP[r100]=0;r225=0}HEAP[r114]=r225;if((r225|0)==0){r2=590;break}HEAP[r113]=(HEAP[33240]-1^-1)&HEAP[r106]+ -HEAP[HEAP[r105]+12|0]+HEAP[33240]+47;if(HEAP[r113]>>>0>=2147483647){r2=602;break}r128=_sbrk(HEAP[r113]);HEAP[r112]=r128;if((r128|0)!=(HEAP[HEAP[r114]|0]+HEAP[HEAP[r114]+4|0]|0)){r2=602;break}r128=HEAP[r112];HEAP[r107]=r128;HEAP[r108]=HEAP[r113];r226=r128;break}}while(0);do{if(r2==590){r128=_sbrk(0);HEAP[r115]=r128;if((r128|0)==-1){r2=602;break}if((HEAP[33236]-1&HEAP[r115]|0)!=0){HEAP[r113]=(HEAP[33236]-1+HEAP[r115]&(HEAP[33236]-1^-1))+ -HEAP[r115]+HEAP[r113]|0}HEAP[r116]=HEAP[r113]+HEAP[HEAP[r105]+432|0]|0;if(!(HEAP[r113]>>>0>HEAP[r106]>>>0&HEAP[r113]>>>0<2147483647)){r2=602;break}if((HEAP[HEAP[r105]+440|0]|0)!=0){if(HEAP[r116]>>>0<=HEAP[HEAP[r105]+432|0]>>>0){r2=602;break}if(!(HEAP[r116]>>>0<=HEAP[HEAP[r105]+440|0]>>>0)){r2=602;break}}r128=_sbrk(HEAP[r113]);HEAP[r112]=r128;if((r128|0)!=(HEAP[r115]|0)){r2=602;break}r128=HEAP[r115];HEAP[r107]=r128;HEAP[r108]=HEAP[r113];r226=r128;break}}while(0);if(r2==602){r226=HEAP[r107]}if((r226|0)!=-1){r2=614;break}L848:do{if((HEAP[r112]|0)!=-1){do{if(HEAP[r113]>>>0<2147483647){if(HEAP[r113]>>>0>=(HEAP[r106]+48|0)>>>0){break}HEAP[r117]=(HEAP[33240]-1^-1)&HEAP[r106]+ -HEAP[r113]+HEAP[33240]+47;if(HEAP[r117]>>>0>=2147483647){break}r128=_sbrk(HEAP[r117]);HEAP[r118]=r128;if((HEAP[r118]|0)!=-1){HEAP[r113]=HEAP[r113]+HEAP[r117]|0;break}else{_sbrk(-HEAP[r113]|0);HEAP[r112]=-1;break L848}}}while(0);if((HEAP[r112]|0)==-1){break}r128=HEAP[r112];HEAP[r107]=r128;HEAP[r108]=HEAP[r113];r227=r128;break L815}}while(0);r128=HEAP[r105]+444|0;HEAP[r128]=HEAP[r128]|4;r2=614;break}}while(0);if(r2==614){r227=HEAP[r107]}do{if((r227|0)==-1){if(HEAP[r110]>>>0>=2147483647){r2=622;break}HEAP[r119]=-1;HEAP[r120]=-1;r128=_sbrk(HEAP[r110]);HEAP[r119]=r128;r128=_sbrk(0);HEAP[r120]=r128;if((HEAP[r119]|0)==-1){r2=622;break}if((HEAP[r120]|0)==-1){r2=622;break}if(HEAP[r119]>>>0>=HEAP[r120]>>>0){r2=622;break}HEAP[r121]=HEAP[r120]-HEAP[r119]|0;if(HEAP[r121]>>>0<=(HEAP[r106]+40|0)>>>0){r2=622;break}r128=HEAP[r119];HEAP[r107]=r128;HEAP[r108]=HEAP[r121];r228=r128;break}else{r2=622}}while(0);if(r2==622){r228=HEAP[r107]}do{if((r228|0)!=-1){r128=HEAP[r105]+432|0;r224=HEAP[r128]+HEAP[r108]|0;HEAP[r128]=r224;if(r224>>>0>HEAP[HEAP[r105]+436|0]>>>0){HEAP[HEAP[r105]+436|0]=HEAP[HEAP[r105]+432|0]}r224=HEAP[r105];L878:do{if((HEAP[HEAP[r105]+24|0]|0)!=0){r128=r224+448|0;HEAP[r123]=r128;L898:do{if((r128|0)!=0){while(1){r200=HEAP[r123];if((HEAP[r107]|0)==(HEAP[HEAP[r123]|0]+HEAP[HEAP[r123]+4|0]|0)){r229=r200;break L898}r162=HEAP[r200+8|0];HEAP[r123]=r162;if((r162|0)==0){r2=640;break L898}}}else{r2=640}}while(0);if(r2==640){r229=HEAP[r123]}do{if((r229|0)!=0){if((HEAP[HEAP[r123]+12|0]&8|0)!=0){break}if(0!=(HEAP[r109]|0)){break}if(!(HEAP[HEAP[r105]+24|0]>>>0>=HEAP[HEAP[r123]|0]>>>0)){break}if(HEAP[HEAP[r105]+24|0]>>>0>=(HEAP[HEAP[r123]|0]+HEAP[HEAP[r123]+4|0]|0)>>>0){break}r128=HEAP[r123]+4|0;HEAP[r128]=HEAP[r128]+HEAP[r108]|0;r128=HEAP[HEAP[r105]+24|0];r162=HEAP[r108]+HEAP[HEAP[r105]+12|0]|0;HEAP[r4]=HEAP[r105];HEAP[r5]=r128;HEAP[r6]=r162;if((HEAP[r5]+8&7|0)==0){r230=0}else{r230=8-(HEAP[r5]+8&7)&7}HEAP[r7]=r230;HEAP[r5]=HEAP[r5]+HEAP[r7]|0;HEAP[r6]=HEAP[r6]-HEAP[r7]|0;HEAP[HEAP[r4]+24|0]=HEAP[r5];HEAP[HEAP[r4]+12|0]=HEAP[r6];HEAP[HEAP[r5]+4|0]=HEAP[r6]|1;HEAP[HEAP[r5]+HEAP[r6]+4|0]=40;HEAP[HEAP[r4]+28|0]=HEAP[33248];break L878}}while(0);if(HEAP[r107]>>>0<HEAP[HEAP[r105]+16|0]>>>0){HEAP[HEAP[r105]+16|0]=HEAP[r107]}r162=HEAP[r105]+448|0;HEAP[r123]=r162;r128=HEAP[r123];L918:do{if((r162|0)!=0){r200=r128;while(1){r131=HEAP[r123];if((HEAP[r200|0]|0)==(HEAP[r107]+HEAP[r108]|0)){r231=r131;break L918}r169=HEAP[r131+8|0];HEAP[r123]=r169;r131=HEAP[r123];if((r169|0)!=0){r200=r131}else{r231=r131;break L918}}}else{r231=r128}}while(0);do{if((r231|0)!=0){if((HEAP[HEAP[r123]+12|0]&8|0)!=0){break}if(0!=(HEAP[r109]|0)){break}HEAP[r124]=HEAP[HEAP[r123]|0];HEAP[HEAP[r123]|0]=HEAP[r107];r128=HEAP[r123]+4|0;HEAP[r128]=HEAP[r128]+HEAP[r108]|0;r128=HEAP[r107];r162=HEAP[r124];r200=HEAP[r106];HEAP[r8]=HEAP[r105];HEAP[r9]=r128;HEAP[r10]=r162;HEAP[r11]=r200;if((HEAP[r9]+8&7|0)==0){r232=0}else{r232=8-(HEAP[r9]+8&7)&7}HEAP[r12]=HEAP[r9]+r232|0;if((HEAP[r10]+8&7|0)==0){r233=0}else{r233=8-(HEAP[r10]+8&7)&7}HEAP[r13]=HEAP[r10]+r233|0;HEAP[r14]=HEAP[r13]-HEAP[r12]|0;HEAP[r15]=HEAP[r12]+HEAP[r11]|0;HEAP[r16]=HEAP[r14]-HEAP[r11]|0;HEAP[HEAP[r12]+4|0]=HEAP[r11]|3;L933:do{if((HEAP[r13]|0)==(HEAP[HEAP[r8]+24|0]|0)){r200=HEAP[r8]+12|0;r162=HEAP[r200]+HEAP[r16]|0;HEAP[r200]=r162;HEAP[r17]=r162;HEAP[HEAP[r8]+24|0]=HEAP[r15];HEAP[HEAP[r15]+4|0]=HEAP[r17]|1}else{if((HEAP[r13]|0)==(HEAP[HEAP[r8]+20|0]|0)){r162=HEAP[r8]+8|0;r200=HEAP[r162]+HEAP[r16]|0;HEAP[r162]=r200;HEAP[r18]=r200;HEAP[HEAP[r8]+20|0]=HEAP[r15];HEAP[HEAP[r15]+4|0]=HEAP[r18]|1;HEAP[HEAP[r15]+HEAP[r18]|0]=HEAP[r18];break}if((HEAP[HEAP[r13]+4|0]&3|0)==1){HEAP[r19]=HEAP[HEAP[r13]+4|0]&-8;r200=HEAP[r13];do{if(HEAP[r19]>>>3>>>0<32){HEAP[r20]=HEAP[r200+8|0];HEAP[r21]=HEAP[HEAP[r13]+12|0];HEAP[r22]=HEAP[r19]>>>3;do{if((HEAP[r20]|0)==((HEAP[r22]<<3)+HEAP[r8]+40|0)){r234=1}else{if(!(HEAP[r20]>>>0>=HEAP[HEAP[r8]+16|0]>>>0)){r234=0;break}r234=(HEAP[HEAP[r20]+12|0]|0)==(HEAP[r13]|0)}}while(0);if((r234&1|0)==0){_abort()}if((HEAP[r21]|0)==(HEAP[r20]|0)){r162=HEAP[r8]|0;HEAP[r162]=HEAP[r162]&(1<<HEAP[r22]^-1);break}do{if((HEAP[r21]|0)==((HEAP[r22]<<3)+HEAP[r8]+40|0)){r235=1}else{if(!(HEAP[r21]>>>0>=HEAP[HEAP[r8]+16|0]>>>0)){r235=0;break}r235=(HEAP[HEAP[r21]+8|0]|0)==(HEAP[r13]|0)}}while(0);if((r235&1|0)!=0){HEAP[HEAP[r20]+12|0]=HEAP[r21];HEAP[HEAP[r21]+8|0]=HEAP[r20];break}else{_abort()}}else{HEAP[r23]=r200;HEAP[r24]=HEAP[HEAP[r23]+24|0];r162=HEAP[r23];L961:do{if((HEAP[HEAP[r23]+12|0]|0)!=(HEAP[r23]|0)){HEAP[r26]=HEAP[r162+8|0];HEAP[r25]=HEAP[HEAP[r23]+12|0];do{if(HEAP[r26]>>>0>=HEAP[HEAP[r8]+16|0]>>>0){if((HEAP[HEAP[r26]+12|0]|0)!=(HEAP[r23]|0)){r236=0;break}r236=(HEAP[HEAP[r25]+8|0]|0)==(HEAP[r23]|0)}else{r236=0}}while(0);if((r236&1|0)!=0){HEAP[HEAP[r26]+12|0]=HEAP[r25];HEAP[HEAP[r25]+8|0]=HEAP[r26];break}else{_abort()}}else{r128=r162+20|0;HEAP[r27]=r128;r131=HEAP[r128];HEAP[r25]=r131;do{if((r131|0)==0){r128=HEAP[r23]+16|0;HEAP[r27]=r128;r169=HEAP[r128];HEAP[r25]=r169;if((r169|0)!=0){break}else{break L961}}}while(0);while(1){r131=HEAP[r25]+20|0;HEAP[r28]=r131;if((HEAP[r131]|0)==0){r131=HEAP[r25]+16|0;HEAP[r28]=r131;if((HEAP[r131]|0)==0){break}}r131=HEAP[r28];HEAP[r27]=r131;HEAP[r25]=HEAP[r131]}if((HEAP[r27]>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r27]]=0;break}else{_abort()}}}while(0);if((HEAP[r24]|0)==0){break}HEAP[r29]=(HEAP[HEAP[r23]+28|0]<<2)+HEAP[r8]+304|0;do{if((HEAP[r23]|0)==(HEAP[HEAP[r29]]|0)){r162=HEAP[r25];HEAP[HEAP[r29]]=r162;if((r162|0)!=0){break}r162=HEAP[r8]+4|0;HEAP[r162]=HEAP[r162]&(1<<HEAP[HEAP[r23]+28|0]^-1)}else{if((HEAP[r24]>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)==0){_abort()}r162=HEAP[r25];r131=HEAP[r24]+16|0;if((HEAP[HEAP[r24]+16|0]|0)==(HEAP[r23]|0)){HEAP[r131|0]=r162;break}else{HEAP[r131+4|0]=r162;break}}}while(0);if((HEAP[r25]|0)==0){break}if((HEAP[r25]>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)==0){_abort()}HEAP[HEAP[r25]+24|0]=HEAP[r24];r162=HEAP[HEAP[r23]+16|0];HEAP[r30]=r162;do{if((r162|0)!=0){if((HEAP[r30]>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r25]+16|0]=HEAP[r30];HEAP[HEAP[r30]+24|0]=HEAP[r25];break}else{_abort()}}}while(0);r162=HEAP[HEAP[r23]+20|0];HEAP[r31]=r162;if((r162|0)==0){break}if((HEAP[r31]>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r25]+20|0]=HEAP[r31];HEAP[HEAP[r31]+24|0]=HEAP[r25];break}else{_abort()}}}while(0);HEAP[r13]=HEAP[r13]+HEAP[r19]|0;HEAP[r16]=HEAP[r16]+HEAP[r19]|0}r200=HEAP[r13]+4|0;HEAP[r200]=HEAP[r200]&-2;HEAP[HEAP[r15]+4|0]=HEAP[r16]|1;HEAP[HEAP[r15]+HEAP[r16]|0]=HEAP[r16];if(HEAP[r16]>>>3>>>0<32){HEAP[r32]=HEAP[r16]>>>3;HEAP[r33]=(HEAP[r32]<<3)+HEAP[r8]+40|0;HEAP[r34]=HEAP[r33];do{if((1<<HEAP[r32]&HEAP[HEAP[r8]|0]|0)!=0){if((HEAP[HEAP[r33]+8|0]>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)!=0){HEAP[r34]=HEAP[HEAP[r33]+8|0];break}else{_abort()}}else{r200=HEAP[r8]|0;HEAP[r200]=HEAP[r200]|1<<HEAP[r32]}}while(0);HEAP[HEAP[r33]+8|0]=HEAP[r15];HEAP[HEAP[r34]+12|0]=HEAP[r15];HEAP[HEAP[r15]+8|0]=HEAP[r34];HEAP[HEAP[r15]+12|0]=HEAP[r33];break}HEAP[r35]=HEAP[r15];HEAP[r38]=HEAP[r16]>>>8;do{if((HEAP[r38]|0)==0){HEAP[r37]=0}else{if(HEAP[r38]>>>0>65535){HEAP[r37]=31;break}else{HEAP[r39]=HEAP[r38];HEAP[r40]=(HEAP[r39]-256|0)>>>16&8;r200=HEAP[r39]<<HEAP[r40];HEAP[r39]=r200;HEAP[r41]=(r200-4096|0)>>>16&4;HEAP[r40]=HEAP[r40]+HEAP[r41]|0;r200=HEAP[r39]<<HEAP[r41];HEAP[r39]=r200;r162=(r200-16384|0)>>>16&2;HEAP[r41]=r162;HEAP[r40]=r162+HEAP[r40]|0;r162=-HEAP[r40]+14|0;r200=HEAP[r39]<<HEAP[r41];HEAP[r39]=r200;HEAP[r41]=r162+(r200>>>15)|0;HEAP[r37]=(HEAP[r41]<<1)+(HEAP[r16]>>>((HEAP[r41]+7|0)>>>0)&1)|0;break}}}while(0);HEAP[r36]=(HEAP[r37]<<2)+HEAP[r8]+304|0;HEAP[HEAP[r35]+28|0]=HEAP[r37];HEAP[HEAP[r35]+20|0]=0;HEAP[HEAP[r35]+16|0]=0;if((1<<HEAP[r37]&HEAP[HEAP[r8]+4|0]|0)==0){r200=HEAP[r8]+4|0;HEAP[r200]=HEAP[r200]|1<<HEAP[r37];HEAP[HEAP[r36]]=HEAP[r35];HEAP[HEAP[r35]+24|0]=HEAP[r36];r200=HEAP[r35];HEAP[HEAP[r35]+12|0]=r200;HEAP[HEAP[r35]+8|0]=r200;break}HEAP[r42]=HEAP[HEAP[r36]];if((HEAP[r37]|0)==31){r237=0}else{r237=-(HEAP[r37]>>>1)+25|0}HEAP[r43]=HEAP[r16]<<r237;L1034:do{if((HEAP[HEAP[r42]+4|0]&-8|0)!=(HEAP[r16]|0)){while(1){HEAP[r44]=((HEAP[r43]>>>31&1)<<2)+HEAP[r42]+16|0;HEAP[r43]=HEAP[r43]<<1;r238=HEAP[r44];if((HEAP[HEAP[r44]]|0)==0){break}HEAP[r42]=HEAP[r238];if((HEAP[HEAP[r42]+4|0]&-8|0)==(HEAP[r16]|0)){break L1034}}if((r238>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r44]]=HEAP[r35];HEAP[HEAP[r35]+24|0]=HEAP[r42];r200=HEAP[r35];HEAP[HEAP[r35]+12|0]=r200;HEAP[HEAP[r35]+8|0]=r200;break L933}else{_abort()}}}while(0);HEAP[r45]=HEAP[HEAP[r42]+8|0];if(HEAP[r42]>>>0>=HEAP[HEAP[r8]+16|0]>>>0){r239=HEAP[r45]>>>0>=HEAP[HEAP[r8]+16|0]>>>0}else{r239=0}if((r239&1|0)!=0){r200=HEAP[r35];HEAP[HEAP[r45]+12|0]=r200;HEAP[HEAP[r42]+8|0]=r200;HEAP[HEAP[r35]+8|0]=HEAP[r45];HEAP[HEAP[r35]+12|0]=HEAP[r42];HEAP[HEAP[r35]+24|0]=0;break}else{_abort()}}}while(0);HEAP[r104]=HEAP[r12]+8|0;break L806}}while(0);r200=HEAP[r107];r162=HEAP[r108];r131=HEAP[r109];HEAP[r65]=HEAP[r105];HEAP[r66]=r200;HEAP[r67]=r162;HEAP[r68]=r131;HEAP[r69]=HEAP[HEAP[r65]+24|0];r131=HEAP[r69];HEAP[r62]=HEAP[r65];HEAP[r63]=r131;HEAP[r64]=HEAP[r62]+448|0;while(1){if(HEAP[r63]>>>0>=HEAP[HEAP[r64]|0]>>>0){if(HEAP[r63]>>>0<(HEAP[HEAP[r64]|0]+HEAP[HEAP[r64]+4|0]|0)>>>0){r2=749;break}}r131=HEAP[HEAP[r64]+8|0];HEAP[r64]=r131;if((r131|0)==0){r2=751;break}}if(r2==749){HEAP[r61]=HEAP[r64]}else if(r2==751){HEAP[r61]=0}HEAP[r70]=HEAP[r61];HEAP[r71]=HEAP[HEAP[r70]|0]+HEAP[HEAP[r70]+4|0]|0;HEAP[r72]=24;HEAP[r73]=HEAP[r71]+ -(HEAP[r72]+23|0)|0;if((HEAP[r73]+8&7|0)==0){r240=0}else{r240=8-(HEAP[r73]+8&7)&7}HEAP[r74]=r240;HEAP[r75]=HEAP[r73]+HEAP[r74]|0;HEAP[r76]=HEAP[r75]>>>0<(HEAP[r69]+16|0)>>>0?HEAP[r69]:HEAP[r75];HEAP[r77]=HEAP[r76];HEAP[r78]=HEAP[r77]+8|0;HEAP[r79]=HEAP[r77]+HEAP[r72]|0;HEAP[r80]=HEAP[r79];HEAP[r81]=0;r131=HEAP[r66];r162=HEAP[r67]-40|0;HEAP[r57]=HEAP[r65];HEAP[r58]=r131;HEAP[r59]=r162;if((HEAP[r58]+8&7|0)==0){r241=0}else{r241=8-(HEAP[r58]+8&7)&7}HEAP[r60]=r241;HEAP[r58]=HEAP[r58]+HEAP[r60]|0;HEAP[r59]=HEAP[r59]-HEAP[r60]|0;HEAP[HEAP[r57]+24|0]=HEAP[r58];HEAP[HEAP[r57]+12|0]=HEAP[r59];HEAP[HEAP[r58]+4|0]=HEAP[r59]|1;HEAP[HEAP[r58]+HEAP[r59]+4|0]=40;HEAP[HEAP[r57]+28|0]=HEAP[33248];HEAP[HEAP[r77]+4|0]=HEAP[r72]|3;r162=HEAP[r78];r131=HEAP[r65]+448|0;for(r200=r131,r169=r162,r128=r200+16;r200<r128;r200++,r169++){HEAP[r169]=HEAP[r200]}HEAP[HEAP[r65]+448|0]=HEAP[r66];HEAP[HEAP[r65]+452|0]=HEAP[r67];HEAP[HEAP[r65]+460|0]=HEAP[r68];HEAP[HEAP[r65]+456|0]=HEAP[r78];HEAP[r82]=HEAP[r80]+4|0;HEAP[HEAP[r80]+4|0]=7;HEAP[r81]=HEAP[r81]+1|0;L1066:do{if((HEAP[r82]+4|0)>>>0<HEAP[r71]>>>0){while(1){HEAP[r80]=HEAP[r82];HEAP[r82]=HEAP[r80]+4|0;HEAP[HEAP[r80]+4|0]=7;HEAP[r81]=HEAP[r81]+1|0;if((HEAP[r82]+4|0)>>>0>=HEAP[r71]>>>0){break L1066}}}}while(0);L1070:do{if((HEAP[r76]|0)!=(HEAP[r69]|0)){HEAP[r83]=HEAP[r69];HEAP[r84]=HEAP[r76]-HEAP[r69]|0;HEAP[r85]=HEAP[r83]+HEAP[r84]|0;r162=HEAP[r85]+4|0;HEAP[r162]=HEAP[r162]&-2;HEAP[HEAP[r83]+4|0]=HEAP[r84]|1;HEAP[HEAP[r83]+HEAP[r84]|0]=HEAP[r84];if(HEAP[r84]>>>3>>>0<32){HEAP[r86]=HEAP[r84]>>>3;HEAP[r87]=(HEAP[r86]<<3)+HEAP[r65]+40|0;HEAP[r88]=HEAP[r87];do{if((1<<HEAP[r86]&HEAP[HEAP[r65]|0]|0)!=0){if((HEAP[HEAP[r87]+8|0]>>>0>=HEAP[HEAP[r65]+16|0]>>>0&1|0)!=0){HEAP[r88]=HEAP[HEAP[r87]+8|0];break}else{_abort()}}else{r162=HEAP[r65]|0;HEAP[r162]=HEAP[r162]|1<<HEAP[r86]}}while(0);HEAP[HEAP[r87]+8|0]=HEAP[r83];HEAP[HEAP[r88]+12|0]=HEAP[r83];HEAP[HEAP[r83]+8|0]=HEAP[r88];HEAP[HEAP[r83]+12|0]=HEAP[r87];break}HEAP[r89]=HEAP[r83];HEAP[r92]=HEAP[r84]>>>8;do{if((HEAP[r92]|0)==0){HEAP[r91]=0}else{if(HEAP[r92]>>>0>65535){HEAP[r91]=31;break}else{HEAP[r93]=HEAP[r92];HEAP[r94]=(HEAP[r93]-256|0)>>>16&8;r162=HEAP[r93]<<HEAP[r94];HEAP[r93]=r162;HEAP[r95]=(r162-4096|0)>>>16&4;HEAP[r94]=HEAP[r94]+HEAP[r95]|0;r162=HEAP[r93]<<HEAP[r95];HEAP[r93]=r162;r131=(r162-16384|0)>>>16&2;HEAP[r95]=r131;HEAP[r94]=r131+HEAP[r94]|0;r131=-HEAP[r94]+14|0;r162=HEAP[r93]<<HEAP[r95];HEAP[r93]=r162;HEAP[r95]=r131+(r162>>>15)|0;HEAP[r91]=(HEAP[r95]<<1)+(HEAP[r84]>>>((HEAP[r95]+7|0)>>>0)&1)|0;break}}}while(0);HEAP[r90]=(HEAP[r91]<<2)+HEAP[r65]+304|0;HEAP[HEAP[r89]+28|0]=HEAP[r91];HEAP[HEAP[r89]+20|0]=0;HEAP[HEAP[r89]+16|0]=0;if((1<<HEAP[r91]&HEAP[HEAP[r65]+4|0]|0)==0){r162=HEAP[r65]+4|0;HEAP[r162]=HEAP[r162]|1<<HEAP[r91];HEAP[HEAP[r90]]=HEAP[r89];HEAP[HEAP[r89]+24|0]=HEAP[r90];r162=HEAP[r89];HEAP[HEAP[r89]+12|0]=r162;HEAP[HEAP[r89]+8|0]=r162;break}HEAP[r96]=HEAP[HEAP[r90]];if((HEAP[r91]|0)==31){r242=0}else{r242=-(HEAP[r91]>>>1)+25|0}HEAP[r97]=HEAP[r84]<<r242;L1095:do{if((HEAP[HEAP[r96]+4|0]&-8|0)!=(HEAP[r84]|0)){while(1){HEAP[r98]=((HEAP[r97]>>>31&1)<<2)+HEAP[r96]+16|0;HEAP[r97]=HEAP[r97]<<1;r243=HEAP[r98];if((HEAP[HEAP[r98]]|0)==0){break}HEAP[r96]=HEAP[r243];if((HEAP[HEAP[r96]+4|0]&-8|0)==(HEAP[r84]|0)){break L1095}}if((r243>>>0>=HEAP[HEAP[r65]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r98]]=HEAP[r89];HEAP[HEAP[r89]+24|0]=HEAP[r96];r162=HEAP[r89];HEAP[HEAP[r89]+12|0]=r162;HEAP[HEAP[r89]+8|0]=r162;break L1070}else{_abort()}}}while(0);HEAP[r99]=HEAP[HEAP[r96]+8|0];if(HEAP[r96]>>>0>=HEAP[HEAP[r65]+16|0]>>>0){r244=HEAP[r99]>>>0>=HEAP[HEAP[r65]+16|0]>>>0}else{r244=0}if((r244&1|0)!=0){r162=HEAP[r89];HEAP[HEAP[r99]+12|0]=r162;HEAP[HEAP[r96]+8|0]=r162;HEAP[HEAP[r89]+8|0]=HEAP[r99];HEAP[HEAP[r89]+12|0]=HEAP[r96];HEAP[HEAP[r89]+24|0]=0;break}else{_abort()}}}while(0)}else{do{if((HEAP[r224+16|0]|0)==0){r2=629}else{if(HEAP[r107]>>>0<HEAP[HEAP[r105]+16|0]>>>0){r2=629;break}else{break}}}while(0);if(r2==629){HEAP[HEAP[r105]+16|0]=HEAP[r107]}HEAP[HEAP[r105]+448|0]=HEAP[r107];HEAP[HEAP[r105]+452|0]=HEAP[r108];HEAP[HEAP[r105]+460|0]=HEAP[r109];HEAP[HEAP[r105]+36|0]=HEAP[33232];HEAP[HEAP[r105]+32|0]=-1;HEAP[r54]=HEAP[r105];HEAP[r55]=0;while(1){HEAP[r56]=(HEAP[r55]<<3)+HEAP[r54]+40|0;r162=HEAP[r56];HEAP[HEAP[r56]+12|0]=r162;HEAP[HEAP[r56]+8|0]=r162;r162=HEAP[r55]+1|0;HEAP[r55]=r162;if(r162>>>0>=32){break}}r162=HEAP[r105];if((HEAP[r105]|0)==36884){r131=HEAP[r107];r200=HEAP[r108]-40|0;HEAP[r50]=r162;HEAP[r51]=r131;HEAP[r52]=r200;if((HEAP[r51]+8&7|0)==0){r245=0}else{r245=8-(HEAP[r51]+8&7)&7}HEAP[r53]=r245;HEAP[r51]=HEAP[r51]+HEAP[r53]|0;HEAP[r52]=HEAP[r52]-HEAP[r53]|0;HEAP[HEAP[r50]+24|0]=HEAP[r51];HEAP[HEAP[r50]+12|0]=HEAP[r52];HEAP[HEAP[r51]+4|0]=HEAP[r52]|1;HEAP[HEAP[r51]+HEAP[r52]+4|0]=40;HEAP[HEAP[r50]+28|0]=HEAP[33248];break}else{HEAP[r122]=r162-8+(HEAP[HEAP[r105]-8+4|0]&-8)|0;r162=HEAP[r122];r200=HEAP[r107]+HEAP[r108]-40+ -HEAP[r122]|0;HEAP[r46]=HEAP[r105];HEAP[r47]=r162;HEAP[r48]=r200;if((HEAP[r47]+8&7|0)==0){r246=0}else{r246=8-(HEAP[r47]+8&7)&7}HEAP[r49]=r246;HEAP[r47]=HEAP[r47]+HEAP[r49]|0;HEAP[r48]=HEAP[r48]-HEAP[r49]|0;HEAP[HEAP[r46]+24|0]=HEAP[r47];HEAP[HEAP[r46]+12|0]=HEAP[r48];HEAP[HEAP[r47]+4|0]=HEAP[r48]|1;HEAP[HEAP[r47]+HEAP[r48]+4|0]=40;HEAP[HEAP[r46]+28|0]=HEAP[33248];break}}}while(0);if(HEAP[r106]>>>0>=HEAP[HEAP[r105]+12|0]>>>0){break}r224=HEAP[r105]+12|0;r200=HEAP[r224]-HEAP[r106]|0;HEAP[r224]=r200;HEAP[r125]=r200;HEAP[r126]=HEAP[HEAP[r105]+24|0];r200=HEAP[r126]+HEAP[r106]|0;HEAP[HEAP[r105]+24|0]=r200;HEAP[r127]=r200;HEAP[HEAP[r127]+4|0]=HEAP[r125]|1;HEAP[HEAP[r126]+4|0]=HEAP[r106]|3;HEAP[r104]=HEAP[r126]+8|0;break L806}}while(0);r200=___errno_location();HEAP[r200]=12;HEAP[r104]=0}}while(0);r207=HEAP[r104];r208=r207;STACKTOP=r3;return r208}function _free(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+100|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r1;if((r29|0)==0){STACKTOP=r3;return}r1=r29-8|0;if(r1>>>0>=HEAP[36900]>>>0){r30=(HEAP[r1+4|0]&3|0)!=1}else{r30=0}if((r30&1|0)==0){_abort()}r30=HEAP[r1+4|0]&-8;r29=r1+r30|0;do{if((HEAP[r1+4|0]&1|0)==0){r31=HEAP[r1|0];if((HEAP[r1+4|0]&3|0)==0){r30=r30+(r31+16)|0;STACKTOP=r3;return}r32=r1+ -r31|0;r30=r30+r31|0;r1=r32;if((r32>>>0>=HEAP[36900]>>>0&1|0)==0){_abort()}if((r1|0)==(HEAP[36904]|0)){if((HEAP[r29+4|0]&3|0)!=3){break}HEAP[36892]=r30;r32=r29+4|0;HEAP[r32]=HEAP[r32]&-2;HEAP[r1+4|0]=r30|1;HEAP[r1+r30|0]=r30;STACKTOP=r3;return}r32=r1;if(r31>>>3>>>0<32){r33=HEAP[r32+8|0];r34=HEAP[r1+12|0];r35=r31>>>3;do{if((r33|0)==((r35<<3)+36924|0)){r36=1}else{if(!(r33>>>0>=HEAP[36900]>>>0)){r36=0;break}r36=(HEAP[r33+12|0]|0)==(r1|0)}}while(0);if((r36&1|0)==0){_abort()}if((r34|0)==(r33|0)){HEAP[36884]=HEAP[36884]&(1<<r35^-1);break}do{if((r34|0)==((r35<<3)+36924|0)){r37=1}else{if(!(r34>>>0>=HEAP[36900]>>>0)){r37=0;break}r37=(HEAP[r34+8|0]|0)==(r1|0)}}while(0);if((r37&1|0)!=0){HEAP[r33+12|0]=r34;HEAP[r34+8|0]=r33;break}else{_abort()}}r35=r32;r31=HEAP[r35+24|0];r38=r35;L1160:do{if((HEAP[r35+12|0]|0)!=(r35|0)){r39=HEAP[r38+8|0];r40=HEAP[r35+12|0];do{if(r39>>>0>=HEAP[36900]>>>0){if((HEAP[r39+12|0]|0)!=(r35|0)){r41=0;break}r41=(HEAP[r40+8|0]|0)==(r35|0)}else{r41=0}}while(0);if((r41&1|0)!=0){HEAP[r39+12|0]=r40;HEAP[r40+8|0]=r39;break}else{_abort()}}else{r42=r38+20|0;r43=r42;r44=HEAP[r42];r40=r44;do{if((r44|0)==0){r42=r35+16|0;r43=r42;r45=HEAP[r42];r40=r45;if((r45|0)!=0){break}else{break L1160}}}while(0);while(1){r44=r40+20|0;r39=r44;if((HEAP[r44]|0)==0){r44=r40+16|0;r39=r44;if((HEAP[r44]|0)==0){break}}r44=r39;r43=r44;r40=HEAP[r44]}if((r43>>>0>=HEAP[36900]>>>0&1|0)!=0){HEAP[r43]=0;break}else{_abort()}}}while(0);if((r31|0)==0){break}r38=(HEAP[r35+28|0]<<2)+37188|0;do{if((r35|0)==(HEAP[r38]|0)){r32=r40;HEAP[r38]=r32;if((r32|0)!=0){break}HEAP[36888]=HEAP[36888]&(1<<HEAP[r35+28|0]^-1)}else{if((r31>>>0>=HEAP[36900]>>>0&1|0)==0){_abort()}r32=r40;r33=r31+16|0;if((HEAP[r31+16|0]|0)==(r35|0)){HEAP[r33|0]=r32;break}else{HEAP[r33+4|0]=r32;break}}}while(0);if((r40|0)==0){break}if((r40>>>0>=HEAP[36900]>>>0&1|0)==0){_abort()}HEAP[r40+24|0]=r31;r38=HEAP[r35+16|0];r32=r38;do{if((r38|0)!=0){if((r32>>>0>=HEAP[36900]>>>0&1|0)!=0){HEAP[r40+16|0]=r32;HEAP[r32+24|0]=r40;break}else{_abort()}}}while(0);r32=HEAP[r35+20|0];r38=r32;if((r32|0)==0){break}if((r38>>>0>=HEAP[36900]>>>0&1|0)!=0){HEAP[r40+20|0]=r38;HEAP[r38+24|0]=r40;break}else{_abort()}}}while(0);if(r1>>>0<r29>>>0){r46=(HEAP[r29+4|0]&1|0)!=0}else{r46=0}if((r46&1|0)==0){_abort()}r46=r29;do{if((HEAP[r29+4|0]&2|0)!=0){r40=r46+4|0;HEAP[r40]=HEAP[r40]&-2;HEAP[r1+4|0]=r30|1;HEAP[r1+r30|0]=r30}else{if((r46|0)==(HEAP[36908]|0)){r40=HEAP[36896]+r30|0;HEAP[36896]=r40;r41=r40;HEAP[36908]=r1;HEAP[r1+4|0]=r41|1;if((r1|0)==(HEAP[36904]|0)){HEAP[36904]=0;HEAP[36892]=0}if(r41>>>0<=HEAP[36912]>>>0){STACKTOP=r3;return}HEAP[r20]=36884;HEAP[r21]=0;HEAP[r22]=0;do{if((HEAP[33232]|0)!=0){r2=873}else{_init_mparams();if(HEAP[r21]>>>0<4294967232){r2=873;break}else{break}}}while(0);do{if(r2==873){if((HEAP[HEAP[r20]+24|0]|0)==0){break}HEAP[r21]=HEAP[r21]+40|0;do{if(HEAP[HEAP[r20]+12|0]>>>0>HEAP[r21]>>>0){HEAP[r23]=HEAP[33240];r35=Math.imul(Math.floor(((HEAP[HEAP[r20]+12|0]-1+ -HEAP[r21]+HEAP[r23]|0)>>>0)/(HEAP[r23]>>>0))-1|0,HEAP[r23]);HEAP[r24]=r35;r35=HEAP[HEAP[r20]+24|0];HEAP[r17]=HEAP[r20];HEAP[r18]=r35;HEAP[r19]=HEAP[r17]+448|0;while(1){if(HEAP[r18]>>>0>=HEAP[HEAP[r19]|0]>>>0){if(HEAP[r18]>>>0<(HEAP[HEAP[r19]|0]+HEAP[HEAP[r19]+4|0]|0)>>>0){r2=878;break}}r35=HEAP[HEAP[r19]+8|0];HEAP[r19]=r35;if((r35|0)==0){r2=880;break}}if(r2==880){HEAP[r16]=0}else if(r2==878){HEAP[r16]=HEAP[r19]}HEAP[r25]=HEAP[r16];do{if((HEAP[HEAP[r25]+12|0]&8|0)!=0){r2=888}else{if(HEAP[r24]>>>0>=2147483647){HEAP[r24]=-2147483648-HEAP[r23]|0}r35=_sbrk(0);HEAP[r26]=r35;if((HEAP[r26]|0)!=(HEAP[HEAP[r25]|0]+HEAP[HEAP[r25]+4|0]|0)){r2=888;break}r35=_sbrk(-HEAP[r24]|0);HEAP[r27]=r35;r35=_sbrk(0);HEAP[r28]=r35;if((HEAP[r27]|0)==-1){r2=888;break}if(HEAP[r28]>>>0>=HEAP[r26]>>>0){r2=888;break}r35=HEAP[r26]-HEAP[r28]|0;HEAP[r22]=r35;r47=r35;break}}while(0);if(r2==888){r47=HEAP[r22]}if((r47|0)==0){break}r35=HEAP[r25]+4|0;HEAP[r35]=HEAP[r35]-HEAP[r22]|0;r35=HEAP[r20]+432|0;HEAP[r35]=HEAP[r35]-HEAP[r22]|0;r35=HEAP[HEAP[r20]+24|0];r41=HEAP[HEAP[r20]+12|0]-HEAP[r22]|0;HEAP[r12]=HEAP[r20];HEAP[r13]=r35;HEAP[r14]=r41;if((HEAP[r13]+8&7|0)==0){r48=0}else{r48=8-(HEAP[r13]+8&7)&7}HEAP[r15]=r48;HEAP[r13]=HEAP[r13]+HEAP[r15]|0;HEAP[r14]=HEAP[r14]-HEAP[r15]|0;HEAP[HEAP[r12]+24|0]=HEAP[r13];HEAP[HEAP[r12]+12|0]=HEAP[r14];HEAP[HEAP[r13]+4|0]=HEAP[r14]|1;HEAP[HEAP[r13]+HEAP[r14]+4|0]=40;HEAP[HEAP[r12]+28|0]=HEAP[33248]}}while(0);if((HEAP[r22]|0)!=0){break}if(HEAP[HEAP[r20]+12|0]>>>0<=HEAP[HEAP[r20]+28|0]>>>0){break}HEAP[HEAP[r20]+28|0]=-1}}while(0);STACKTOP=r3;return}if((r29|0)==(HEAP[36904]|0)){r43=HEAP[36892]+r30|0;HEAP[36892]=r43;r41=r43;HEAP[36904]=r1;HEAP[r1+4|0]=r41|1;HEAP[r1+r41|0]=r41;STACKTOP=r3;return}r41=HEAP[r29+4|0]&-8;r30=r30+r41|0;r43=r29;do{if(r41>>>3>>>0<32){r35=HEAP[r43+8|0];r40=HEAP[r29+12|0];r37=r41>>>3;do{if((r35|0)==((r37<<3)+36924|0)){r49=1}else{if(!(r35>>>0>=HEAP[36900]>>>0)){r49=0;break}r49=(HEAP[r35+12|0]|0)==(r29|0)}}while(0);if((r49&1|0)==0){_abort()}if((r40|0)==(r35|0)){HEAP[36884]=HEAP[36884]&(1<<r37^-1);break}do{if((r40|0)==((r37<<3)+36924|0)){r50=1}else{if(!(r40>>>0>=HEAP[36900]>>>0)){r50=0;break}r50=(HEAP[r40+8|0]|0)==(r29|0)}}while(0);if((r50&1|0)!=0){HEAP[r35+12|0]=r40;HEAP[r40+8|0]=r35;break}else{_abort()}}else{r37=r43;r36=HEAP[r37+24|0];r38=r37;L1269:do{if((HEAP[r37+12|0]|0)!=(r37|0)){r32=HEAP[r38+8|0];r51=HEAP[r37+12|0];do{if(r32>>>0>=HEAP[36900]>>>0){if((HEAP[r32+12|0]|0)!=(r37|0)){r52=0;break}r52=(HEAP[r51+8|0]|0)==(r37|0)}else{r52=0}}while(0);if((r52&1|0)!=0){HEAP[r32+12|0]=r51;HEAP[r51+8|0]=r32;break}else{_abort()}}else{r31=r38+20|0;r33=r31;r34=HEAP[r31];r51=r34;do{if((r34|0)==0){r31=r37+16|0;r33=r31;r44=HEAP[r31];r51=r44;if((r44|0)!=0){break}else{break L1269}}}while(0);while(1){r34=r51+20|0;r32=r34;if((HEAP[r34]|0)==0){r34=r51+16|0;r32=r34;if((HEAP[r34]|0)==0){break}}r34=r32;r33=r34;r51=HEAP[r34]}if((r33>>>0>=HEAP[36900]>>>0&1|0)!=0){HEAP[r33]=0;break}else{_abort()}}}while(0);if((r36|0)==0){break}r38=(HEAP[r37+28|0]<<2)+37188|0;do{if((r37|0)==(HEAP[r38]|0)){r35=r51;HEAP[r38]=r35;if((r35|0)!=0){break}HEAP[36888]=HEAP[36888]&(1<<HEAP[r37+28|0]^-1)}else{if((r36>>>0>=HEAP[36900]>>>0&1|0)==0){_abort()}r35=r51;r40=r36+16|0;if((HEAP[r36+16|0]|0)==(r37|0)){HEAP[r40|0]=r35;break}else{HEAP[r40+4|0]=r35;break}}}while(0);if((r51|0)==0){break}if((r51>>>0>=HEAP[36900]>>>0&1|0)==0){_abort()}HEAP[r51+24|0]=r36;r38=HEAP[r37+16|0];r35=r38;do{if((r38|0)!=0){if((r35>>>0>=HEAP[36900]>>>0&1|0)!=0){HEAP[r51+16|0]=r35;HEAP[r35+24|0]=r51;break}else{_abort()}}}while(0);r35=HEAP[r37+20|0];r38=r35;if((r35|0)==0){break}if((r38>>>0>=HEAP[36900]>>>0&1|0)!=0){HEAP[r51+20|0]=r38;HEAP[r38+24|0]=r51;break}else{_abort()}}}while(0);HEAP[r1+4|0]=r30|1;HEAP[r1+r30|0]=r30;if((r1|0)!=(HEAP[36904]|0)){break}HEAP[36892]=r30;STACKTOP=r3;return}}while(0);if(r30>>>3>>>0<32){r51=r30>>>3;r52=(r51<<3)+36924|0;r50=r52;do{if((1<<r51&HEAP[36884]|0)!=0){if((HEAP[r52+8|0]>>>0>=HEAP[36900]>>>0&1|0)!=0){r50=HEAP[r52+8|0];break}else{_abort()}}else{HEAP[36884]=HEAP[36884]|1<<r51}}while(0);HEAP[r52+8|0]=r1;HEAP[r50+12|0]=r1;HEAP[r1+8|0]=r50;HEAP[r1+12|0]=r52;STACKTOP=r3;return}r52=r1;r1=r30>>>8;do{if((r1|0)==0){r53=0}else{if(r1>>>0>65535){r53=31;break}else{r50=r1;r51=(r50-256|0)>>>16&8;r29=r50<<r51;r50=r29;r49=(r29-4096|0)>>>16&4;r51=r51+r49|0;r29=r50<<r49;r50=r29;r20=(r29-16384|0)>>>16&2;r49=r20;r51=r20+r51|0;r20=r50<<r49;r50=r20;r49=-r51+(r20>>>15)+14|0;r53=(r49<<1)+(r30>>>((r49+7|0)>>>0)&1)|0;break}}}while(0);r1=(r53<<2)+37188|0;HEAP[r52+28|0]=r53;HEAP[r52+20|0]=0;HEAP[r52+16|0]=0;L1357:do{if((1<<r53&HEAP[36888]|0)!=0){r49=HEAP[r1];if((r53|0)==31){r54=0}else{r54=-(r53>>>1)+25|0}r20=r30<<r54;L1362:do{if((HEAP[r49+4|0]&-8|0)!=(r30|0)){while(1){r55=((r20>>>31&1)<<2)+r49+16|0;r20=r20<<1;r56=r55;if((HEAP[r55]|0)==0){break}r49=HEAP[r56];if((HEAP[r49+4|0]&-8|0)==(r30|0)){break L1362}}if((r56>>>0>=HEAP[36900]>>>0&1|0)!=0){HEAP[r55]=r52;HEAP[r52+24|0]=r49;r37=r52;HEAP[r52+12|0]=r37;HEAP[r52+8|0]=r37;break L1357}else{_abort()}}}while(0);r20=HEAP[r49+8|0];if(r49>>>0>=HEAP[36900]>>>0){r57=r20>>>0>=HEAP[36900]>>>0}else{r57=0}if((r57&1|0)!=0){r37=r52;HEAP[r20+12|0]=r37;HEAP[r49+8|0]=r37;HEAP[r52+8|0]=r20;HEAP[r52+12|0]=r49;HEAP[r52+24|0]=0;break}else{_abort()}}else{HEAP[36888]=HEAP[36888]|1<<r53;HEAP[r1]=r52;HEAP[r52+24|0]=r1;r20=r52;HEAP[r52+12|0]=r20;HEAP[r52+8|0]=r20}}while(0);r52=HEAP[36916]-1|0;HEAP[36916]=r52;if((r52|0)!=0){STACKTOP=r3;return}HEAP[r4]=36884;HEAP[r5]=0;HEAP[r6]=0;HEAP[r7]=HEAP[r4]+448|0;r5=HEAP[HEAP[r7]+8|0];HEAP[r8]=r5;L1382:do{if((r5|0)!=0){while(1){HEAP[r9]=HEAP[HEAP[r8]|0];HEAP[r10]=HEAP[HEAP[r8]+4|0];r52=HEAP[HEAP[r8]+8|0];HEAP[r11]=r52;HEAP[r6]=HEAP[r6]+1|0;HEAP[r7]=HEAP[r8];HEAP[r8]=r52;if((r52|0)==0){break L1382}}}}while(0);HEAP[HEAP[r4]+32|0]=-1;STACKTOP=r3;return}function _init_mparams(){var r1,r2;if((HEAP[33232]|0)!=0){return}r1=_sysconf(8);r2=r1;if((r2-1&r2|0)!=0){_abort()}if((r1-1&r1|0)!=0){_abort()}HEAP[33240]=r2;HEAP[33236]=r1;HEAP[33244]=-1;HEAP[33248]=2097152;HEAP[33252]=0;HEAP[37328]=HEAP[33252];r1=_time(0)^1431655765;r1=r1|8;r1=r1&-8;HEAP[33232]=r1;return}function _dispose_chunk(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28;r4=r1;r1=r2;r2=r3;r3=r1+r2|0;do{if((HEAP[r1+4|0]&1|0)==0){r5=HEAP[r1|0];if((HEAP[r1+4|0]&3|0)==0){r2=r2+(r5+16)|0;return}r6=r1+ -r5|0;r2=r2+r5|0;r1=r6;if((r6>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}if((r1|0)==(HEAP[r4+20|0]|0)){if((HEAP[r3+4|0]&3|0)!=3){break}HEAP[r4+8|0]=r2;r6=r3+4|0;HEAP[r6]=HEAP[r6]&-2;HEAP[r1+4|0]=r2|1;HEAP[r1+r2|0]=r2;return}r6=r1;if(r5>>>3>>>0<32){r7=HEAP[r6+8|0];r8=HEAP[r1+12|0];r9=r5>>>3;do{if((r7|0)==((r9<<3)+r4+40|0)){r10=1}else{if(!(r7>>>0>=HEAP[r4+16|0]>>>0)){r10=0;break}r10=(HEAP[r7+12|0]|0)==(r1|0)}}while(0);if((r10&1|0)==0){_abort()}if((r8|0)==(r7|0)){r5=r4|0;HEAP[r5]=HEAP[r5]&(1<<r9^-1);break}do{if((r8|0)==((r9<<3)+r4+40|0)){r11=1}else{if(!(r8>>>0>=HEAP[r4+16|0]>>>0)){r11=0;break}r11=(HEAP[r8+8|0]|0)==(r1|0)}}while(0);if((r11&1|0)!=0){HEAP[r7+12|0]=r8;HEAP[r8+8|0]=r7;break}else{_abort()}}r9=r6;r5=HEAP[r9+24|0];r12=r9;L1433:do{if((HEAP[r9+12|0]|0)!=(r9|0)){r13=HEAP[r12+8|0];r14=HEAP[r9+12|0];do{if(r13>>>0>=HEAP[r4+16|0]>>>0){if((HEAP[r13+12|0]|0)!=(r9|0)){r15=0;break}r15=(HEAP[r14+8|0]|0)==(r9|0)}else{r15=0}}while(0);if((r15&1|0)!=0){HEAP[r13+12|0]=r14;HEAP[r14+8|0]=r13;break}else{_abort()}}else{r16=r12+20|0;r17=r16;r18=HEAP[r16];r14=r18;do{if((r18|0)==0){r16=r9+16|0;r17=r16;r19=HEAP[r16];r14=r19;if((r19|0)!=0){break}else{break L1433}}}while(0);while(1){r18=r14+20|0;r13=r18;if((HEAP[r18]|0)==0){r18=r14+16|0;r13=r18;if((HEAP[r18]|0)==0){break}}r18=r13;r17=r18;r14=HEAP[r18]}if((r17>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){HEAP[r17]=0;break}else{_abort()}}}while(0);if((r5|0)==0){break}r12=(HEAP[r9+28|0]<<2)+r4+304|0;do{if((r9|0)==(HEAP[r12]|0)){r6=r14;HEAP[r12]=r6;if((r6|0)!=0){break}r6=r4+4|0;HEAP[r6]=HEAP[r6]&(1<<HEAP[r9+28|0]^-1)}else{if((r5>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}r6=r14;r7=r5+16|0;if((HEAP[r5+16|0]|0)==(r9|0)){HEAP[r7|0]=r6;break}else{HEAP[r7+4|0]=r6;break}}}while(0);if((r14|0)==0){break}if((r14>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}HEAP[r14+24|0]=r5;r12=HEAP[r9+16|0];r6=r12;do{if((r12|0)!=0){if((r6>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){HEAP[r14+16|0]=r6;HEAP[r6+24|0]=r14;break}else{_abort()}}}while(0);r6=HEAP[r9+20|0];r12=r6;if((r6|0)==0){break}if((r12>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){HEAP[r14+20|0]=r12;HEAP[r12+24|0]=r14;break}else{_abort()}}}while(0);if((r3>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}r14=r3;do{if((HEAP[r3+4|0]&2|0)!=0){r15=r14+4|0;HEAP[r15]=HEAP[r15]&-2;HEAP[r1+4|0]=r2|1;HEAP[r1+r2|0]=r2}else{if((r14|0)==(HEAP[r4+24|0]|0)){r15=r4+12|0;r11=HEAP[r15]+r2|0;HEAP[r15]=r11;HEAP[r4+24|0]=r1;HEAP[r1+4|0]=r11|1;if((r1|0)!=(HEAP[r4+20|0]|0)){return}HEAP[r4+20|0]=0;HEAP[r4+8|0]=0;return}if((r3|0)==(HEAP[r4+20|0]|0)){r11=r4+8|0;r15=HEAP[r11]+r2|0;HEAP[r11]=r15;r11=r15;HEAP[r4+20|0]=r1;HEAP[r1+4|0]=r11|1;HEAP[r1+r11|0]=r11;return}r11=HEAP[r3+4|0]&-8;r2=r2+r11|0;r15=r3;do{if(r11>>>3>>>0<32){r10=HEAP[r15+8|0];r12=HEAP[r3+12|0];r6=r11>>>3;do{if((r10|0)==((r6<<3)+r4+40|0)){r20=1}else{if(!(r10>>>0>=HEAP[r4+16|0]>>>0)){r20=0;break}r20=(HEAP[r10+12|0]|0)==(r3|0)}}while(0);if((r20&1|0)==0){_abort()}if((r12|0)==(r10|0)){r17=r4|0;HEAP[r17]=HEAP[r17]&(1<<r6^-1);break}do{if((r12|0)==((r6<<3)+r4+40|0)){r21=1}else{if(!(r12>>>0>=HEAP[r4+16|0]>>>0)){r21=0;break}r21=(HEAP[r12+8|0]|0)==(r3|0)}}while(0);if((r21&1|0)!=0){HEAP[r10+12|0]=r12;HEAP[r12+8|0]=r10;break}else{_abort()}}else{r6=r15;r17=HEAP[r6+24|0];r5=r6;L1518:do{if((HEAP[r6+12|0]|0)!=(r6|0)){r7=HEAP[r5+8|0];r22=HEAP[r6+12|0];do{if(r7>>>0>=HEAP[r4+16|0]>>>0){if((HEAP[r7+12|0]|0)!=(r6|0)){r23=0;break}r23=(HEAP[r22+8|0]|0)==(r6|0)}else{r23=0}}while(0);if((r23&1|0)!=0){HEAP[r7+12|0]=r22;HEAP[r22+8|0]=r7;break}else{_abort()}}else{r8=r5+20|0;r18=r8;r13=HEAP[r8];r22=r13;do{if((r13|0)==0){r8=r6+16|0;r18=r8;r19=HEAP[r8];r22=r19;if((r19|0)!=0){break}else{break L1518}}}while(0);while(1){r13=r22+20|0;r7=r13;if((HEAP[r13]|0)==0){r13=r22+16|0;r7=r13;if((HEAP[r13]|0)==0){break}}r13=r7;r18=r13;r22=HEAP[r13]}if((r18>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){HEAP[r18]=0;break}else{_abort()}}}while(0);if((r17|0)==0){break}r5=(HEAP[r6+28|0]<<2)+r4+304|0;do{if((r6|0)==(HEAP[r5]|0)){r10=r22;HEAP[r5]=r10;if((r10|0)!=0){break}r10=r4+4|0;HEAP[r10]=HEAP[r10]&(1<<HEAP[r6+28|0]^-1)}else{if((r17>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}r10=r22;r12=r17+16|0;if((HEAP[r17+16|0]|0)==(r6|0)){HEAP[r12|0]=r10;break}else{HEAP[r12+4|0]=r10;break}}}while(0);if((r22|0)==0){break}if((r22>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}HEAP[r22+24|0]=r17;r5=HEAP[r6+16|0];r10=r5;do{if((r5|0)!=0){if((r10>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){HEAP[r22+16|0]=r10;HEAP[r10+24|0]=r22;break}else{_abort()}}}while(0);r10=HEAP[r6+20|0];r5=r10;if((r10|0)==0){break}if((r5>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){HEAP[r22+20|0]=r5;HEAP[r5+24|0]=r22;break}else{_abort()}}}while(0);HEAP[r1+4|0]=r2|1;HEAP[r1+r2|0]=r2;if((r1|0)!=(HEAP[r4+20|0]|0)){break}HEAP[r4+8|0]=r2;return}}while(0);if(r2>>>3>>>0<32){r22=r2>>>3;r23=(r22<<3)+r4+40|0;r21=r23;do{if((1<<r22&HEAP[r4|0]|0)!=0){if((HEAP[r23+8|0]>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){r21=HEAP[r23+8|0];break}else{_abort()}}else{r3=r4|0;HEAP[r3]=HEAP[r3]|1<<r22}}while(0);HEAP[r23+8|0]=r1;HEAP[r21+12|0]=r1;HEAP[r1+8|0]=r21;HEAP[r1+12|0]=r23;return}r23=r1;r1=r2>>>8;do{if((r1|0)==0){r24=0}else{if(r1>>>0>65535){r24=31;break}else{r21=r1;r22=(r21-256|0)>>>16&8;r3=r21<<r22;r21=r3;r20=(r3-4096|0)>>>16&4;r22=r22+r20|0;r3=r21<<r20;r21=r3;r14=(r3-16384|0)>>>16&2;r20=r14;r22=r14+r22|0;r14=r21<<r20;r21=r14;r20=-r22+(r14>>>15)+14|0;r24=(r20<<1)+(r2>>>((r20+7|0)>>>0)&1)|0;break}}}while(0);r1=(r24<<2)+r4+304|0;HEAP[r23+28|0]=r24;HEAP[r23+20|0]=0;HEAP[r23+16|0]=0;if((1<<r24&HEAP[r4+4|0]|0)==0){r20=r4+4|0;HEAP[r20]=HEAP[r20]|1<<r24;HEAP[r1]=r23;HEAP[r23+24|0]=r1;r20=r23;HEAP[r23+12|0]=r20;HEAP[r23+8|0]=r20;return}r20=HEAP[r1];if((r24|0)==31){r25=0}else{r25=-(r24>>>1)+25|0}r24=r2<<r25;L1596:do{if((HEAP[r20+4|0]&-8|0)!=(r2|0)){while(1){r26=((r24>>>31&1)<<2)+r20+16|0;r24=r24<<1;r27=r26;if((HEAP[r26]|0)==0){break}r20=HEAP[r27];if((HEAP[r20+4|0]&-8|0)==(r2|0)){break L1596}}if((r27>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}HEAP[r26]=r23;HEAP[r23+24|0]=r20;r25=r23;HEAP[r23+12|0]=r25;HEAP[r23+8|0]=r25;return}}while(0);r26=HEAP[r20+8|0];if(r20>>>0>=HEAP[r4+16|0]>>>0){r28=r26>>>0>=HEAP[r4+16|0]>>>0}else{r28=0}if((r28&1|0)==0){_abort()}r28=r23;HEAP[r26+12|0]=r28;HEAP[r20+8|0]=r28;HEAP[r23+8|0]=r26;HEAP[r23+12|0]=r20;HEAP[r23+24|0]=0;return}
// EMSCRIPTEN_END_FUNCS
Module["_init_game"] = _init_game;
Module["_midend_size"] = _midend_size;
Module["_midend_set_params"] = _midend_set_params;
Module["_midend_get_params"] = _midend_get_params;
Module["_midend_force_redraw"] = _midend_force_redraw;
Module["_midend_redraw"] = _midend_redraw;
Module["_midend_can_undo"] = _midend_can_undo;
Module["_midend_can_redo"] = _midend_can_redo;
Module["_midend_new_game"] = _midend_new_game;
Module["_midend_restart_game"] = _midend_restart_game;
Module["_midend_process_key"] = _midend_process_key;
Module["_midend_wants_statusbar"] = _midend_wants_statusbar;
Module["_midend_which_preset"] = _midend_which_preset;
Module["_midend_solve"] = _midend_solve;
Module["_midend_status"] = _midend_status;
Module["_midend_timer"] = _midend_timer;
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
Module.callMain = function callMain(args) {
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_STATIC) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_STATIC));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_STATIC);
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    var ret = 0;
    calledRun = true;
    if (Module['_main']) {
      preMain();
      ret = Module.callMain(args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
initRuntime();
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
if (shouldRunNow) {
  run();
}
// {{POST_RUN_ADDITIONS}}
  // {{MODULE_ADDITIONS}}
// --post-js code for compiled games
game_script_loaded();
