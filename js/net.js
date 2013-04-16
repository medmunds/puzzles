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
STATICTOP += 3232;
assert(STATICTOP < TOTAL_MEMORY);
var _stderr;
allocate([0,0,0,0,0,0,0,0,0,0,0,0,58,0,0,0,72,0,0,0,40,0,0,0,14,0,0,0,46,0,0,0,68,0,0,0,1,0,0,0,70,0,0,0,42,0,0,0,6,0,0,0,102,0,0,0,34,0,0,0,108,0,0,0,10,0,0,0,2,0,0,0,1,0,0,0,28,0,0,0,0,0,0,0,92,0,0,0,8,0,0,0,64,0,0,0,66,0,0,0,18,0,0,0,44,0,0,0,12,0,0,0,100,0,0,0,104,0,0,0,32,0,0,0,48,0,0,0,26,0,0,0,90,0,0,0,52,0,0,0,4,0,0,0,56,0,0,0,20,0,0,0,86,0,0,0,74,0,0,0,1,0,0,0,0,0,0,0,96,0,0,0,30,0,0,0,1,0,0,0,0,0,0,0,80,0,0,0,0,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0], ALLOC_NONE, 32768);
allocate([10,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,10000,0,0,0,0,0,0,0,100000000,0,0,0,0,0,0,0,10000000000000000,0,0,0,0,0,0,0,1e+32,0,0,0,0,0,0,0,1e+64,0,0,0,0,0,0,0,1e+128,0,0,0,0,0,0,0,1e+256,0,0,0,0,0,0,0], ["double",0,0,0,0,0,0,0,"double",0,0,0,0,0,0,0,"double",0,0,0,0,0,0,0,"double",0,0,0,0,0,0,0,"double",0,0,0,0,0,0,0,"double",0,0,0,0,0,0,0,"double",0,0,0,0,0,0,0,"double",0,0,0,0,0,0,0,"double",0,0,0,0,0,0,0], ALLOC_NONE, 32960);
allocate([5,0,0,0,5,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,7,0,0,0,7,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,9,0,0,0,9,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,11,0,0,0,11,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,13,0,0,0,11,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,5,0,0,0,5,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,7,0,0,0,7,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,9,0,0,0,9,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,11,0,0,0,11,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,13,0,0,0,11,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0], ["i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"float",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"float",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"float",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"float",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"float",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"float",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"float",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"float",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"float",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"float",0,0,0], ALLOC_NONE, 33032);
allocate(24, "i32", ALLOC_NONE, 33232);
allocate([78,0,0,0,32,0,0,0,24,0,0,0,106,0,0,0,22,0,0,0,16,0,0,0,54,0,0,0,36,0,0,0,50,0,0,0,62,0,0,0,98,0,0,0,84,0,0,0,88,0,0,0,94,0,0,0,82,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,0,0,0,38,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NONE, 33256);
allocate([111,117,116,32,111,102,32,109,101,109,111,114,121,0] /* out of memory\00 */, "i8", ALLOC_NONE, 33356);
allocate([33,110,45,62,107,105,100,115,91,48,93,0] /* !n-_kids[0]\00 */, "i8", ALLOC_NONE, 33372);
allocate([109,101,45,62,100,105,114,32,33,61,32,48,0] /* me-_dir != 0\00 */, "i8", ALLOC_NONE, 33384);
allocate([102,97,116,97,108,32,101,114,114,111,114,58,32,0] /* fatal error: \00 */, "i8", ALLOC_NONE, 33400);
allocate([37,100,44,37,100,37,110,0] /* %d,%d%n\00 */, "i8", ALLOC_NONE, 33416);
allocate([105,50,32,61,61,32,105,110,118,101,114,115,101,0] /* i2 == inverse\00 */, "i8", ALLOC_NONE, 33424);
allocate([110,45,62,101,108,101,109,115,91,107,105,93,0] /* n-_elems[ki]\00 */, "i8", ALLOC_NONE, 33440);
allocate([109,101,45,62,100,114,97,119,105,110,103,0] /* me-_drawing\00 */, "i8", ALLOC_NONE, 33456);
allocate([99,111,117,110,116,50,51,52,40,116,111,100,111,41,32,61,61,32,48,0] /* count234(todo) == 0\ */, "i8", ALLOC_NONE, 33468);
allocate([118,50,32,61,61,32,118,49,0] /* v2 == v1\00 */, "i8", ALLOC_NONE, 33488);
allocate([100,115,102,46,99,0] /* dsf.c\00 */, "i8", ALLOC_NONE, 33500);
allocate([109,111,118,101,115,116,114,32,33,61,32,78,85,76,76,0] /* movestr != NULL\00 */, "i8", ALLOC_NONE, 33508);
allocate([115,32,33,61,32,78,85,76,76,0] /* s != NULL\00 */, "i8", ALLOC_NONE, 33524);
allocate([48,0] /* 0\00 */, "i8", ALLOC_NONE, 33536);
allocate([109,101,45,62,115,116,97,116,101,112,111,115,32,62,61,32,49,0] /* me-_statepos _= 1\00 */, "i8", ALLOC_NONE, 33540);
allocate([110,101,116,46,99,0] /* net.c\00 */, "i8", ALLOC_NONE, 33560);
allocate([105,110,118,101,114,115,101,32,61,61,32,48,32,124,124,32,105,110,118,101,114,115,101,32,61,61,32,49,0] /* inverse == 0 || inve */, "i8", ALLOC_NONE, 33568);
allocate([33,108,101,102,116,45,62,101,108,101,109,115,91,50,93,32,38,38,32,33,114,105,103,104,116,45,62,101,108,101,109,115,91,50,93,0] /* !left-_elems[2] && ! */, "i8", ALLOC_NONE, 33600);
allocate([115,0] /* s\00 */, "i8", ALLOC_NONE, 33636);
allocate([33,105,110,118,101,114,115,101,0] /* !inverse\00 */, "i8", ALLOC_NONE, 33640);
allocate([100,114,97,119,105,110,103,46,99,0] /* drawing.c\00 */, "i8", ALLOC_NONE, 33652);
allocate([32,119,114,97,112,112,105,110,103,0] /*  wrapping\00 */, "i8", ALLOC_NONE, 33664);
allocate([37,100,120,37,100,37,115,0] /* %dx%d%s\00 */, "i8", ALLOC_NONE, 33676);
allocate([109,111,118,101,115,116,114,32,38,38,32,33,109,115,103,0] /* movestr && !msg\00 */, "i8", ALLOC_NONE, 33684);
allocate([108,101,110,32,60,32,108,101,110,111,102,40,114,101,116,41,0] /* len _ lenof(ret)\00 */, "i8", ALLOC_NONE, 33700);
allocate([98,37,103,0] /* b%g\00 */, "i8", ALLOC_NONE, 33720);
allocate([67,79,77,80,76,69,84,69,68,33,32,0] /* COMPLETED! \00 */, "i8", ALLOC_NONE, 33724);
allocate([37,100,120,37,100,0] /* %dx%d\00 */, "i8", ALLOC_NONE, 33736);
allocate([100,115,102,91,118,50,93,32,38,32,50,0] /* dsf[v2] & 2\00 */, "i8", ALLOC_NONE, 33744);
allocate([69,110,115,117,114,101,32,117,110,105,113,117,101,32,115,111,108,117,116,105,111,110,0] /* Ensure unique soluti */, "i8", ALLOC_NONE, 33756);
allocate([37,103,0] /* %g\00 */, "i8", ALLOC_NONE, 33780);
allocate([66,97,114,114,105,101,114,32,112,114,111,98,97,98,105,108,105,116,121,0] /* Barrier probability\ */, "i8", ALLOC_NONE, 33784);
allocate([87,97,108,108,115,32,119,114,97,112,32,97,114,111,117,110,100,0] /* Walls wrap around\00 */, "i8", ALLOC_NONE, 33804);
allocate([72,101,105,103,104,116,0] /* Height\00 */, "i8", ALLOC_NONE, 33824);
allocate([87,105,100,116,104,0] /* Width\00 */, "i8", ALLOC_NONE, 33832);
allocate([109,101,45,62,110,115,116,97,116,101,115,32,61,61,32,48,0] /* me-_nstates == 0\00 */, "i8", ALLOC_NONE, 33840);
allocate([78,111,32,119,114,97,112,112,105,110,103,32,112,117,122,122,108,101,32,119,105,116,104,32,97,32,119,105,100,116,104,32,111,114,32,104,101,105,103,104,116,32,111,102,32,50,32,99,97,110,32,104,97,118,101,32,97,32,117,110,105,113,117,101,32,115,111,108,117,116,105,111,110,0] /* No wrapping puzzle w */, "i8", ALLOC_NONE, 33860);
allocate([66,97,114,114,105,101,114,32,112,114,111,98,97,98,105,108,105,116,121,32,109,97,121,32,110,111,116,32,98,101,32,103,114,101,97,116,101,114,32,116,104,97,110,32,49,0] /* Barrier probability  */, "i8", ALLOC_NONE, 33936);
allocate([65,117,116,111,45,115,111,108,118,101,100,46,32,0] /* Auto-solved. \00 */, "i8", ALLOC_NONE, 33984);
allocate([66,97,114,114,105,101,114,32,112,114,111,98,97,98,105,108,105,116,121,32,109,97,121,32,110,111,116,32,98,101,32,110,101,103,97,116,105,118,101,0] /* Barrier probability  */, "i8", ALLOC_NONE, 34000);
allocate([65,116,32,108,101,97,115,116,32,111,110,101,32,111,102,32,119,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,109,117,115,116,32,98,101,32,103,114,101,97,116,101,114,32,116,104,97,110,32,111,110,101,0] /* At least one of widt */, "i8", ALLOC_NONE, 34040);
allocate([100,115,102,91,118,49,93,32,38,32,50,0] /* dsf[v1] & 2\00 */, "i8", ALLOC_NONE, 34100);
allocate([87,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,109,117,115,116,32,98,111,116,104,32,98,101,32,103,114,101,97,116,101,114,32,116,104,97,110,32,122,101,114,111,0] /* Width and height mus */, "i8", ALLOC_NONE, 34112);
allocate([120,32,61,61,32,112,101,114,105,109,101,116,101,114,91,105,93,46,120,32,38,38,32,121,32,60,61,32,112,101,114,105,109,101,116,101,114,91,105,93,46,121,0] /* x == perimeter[i].x  */, "i8", ALLOC_NONE, 34160);
allocate([110,108,111,111,112,91,105,93,32,62,32,48,0] /* nloop[i] _ 0\00 */, "i8", ALLOC_NONE, 34204);
allocate([106,32,60,32,52,0] /* j _ 4\00 */, "i8", ALLOC_NONE, 34220);
allocate([112,32,45,32,100,101,115,99,32,60,61,32,119,42,104,42,51,0] /* p - desc _= w_h_3\00 */, "i8", ALLOC_NONE, 34228);
allocate([120,121,100,32,33,61,32,78,85,76,76,0] /* xyd != NULL\00 */, "i8", ALLOC_NONE, 34248);
allocate([91,37,100,58,37,48,50,100,93,32,0] /* [%d:%02d] \00 */, "i8", ALLOC_NONE, 34260);
allocate([109,105,100,101,110,100,46,99,0] /* midend.c\00 */, "i8", ALLOC_NONE, 34272);
allocate([110,98,97,114,114,105,101,114,115,32,62,61,32,48,32,38,38,32,110,98,97,114,114,105,101,114,115,32,60,61,32,99,111,117,110,116,50,51,52,40,98,97,114,114,105,101,114,116,114,101,101,41,0] /* nbarriers _= 0 && nb */, "i8", ALLOC_NONE, 34284);
allocate([83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,32,102,97,105,108,101,100,0] /* Solve operation fail */, "i8", ALLOC_NONE, 34340);
allocate([48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,0] /* 0123456789abcdef\00 */, "i8", ALLOC_NONE, 34364);
allocate([37,115,65,99,116,105,118,101,58,32,37,100,47,37,100,0] /* %sActive: %d/%d\00 */, "i8", ALLOC_NONE, 34384);
allocate([78,111,32,103,97,109,101,32,115,101,116,32,117,112,32,116,111,32,115,111,108,118,101,0] /* No game set up to so */, "i8", ALLOC_NONE, 34400);
allocate([99,111,117,110,116,50,51,52,40,112,111,115,115,105,98,105,108,105,116,105,101,115,41,32,61,61,32,48,0] /* count234(possibiliti */, "i8", ALLOC_NONE, 34424);
allocate([84,104,105,115,32,103,97,109,101,32,100,111,101,115,32,110,111,116,32,115,117,112,112,111,114,116,32,116,104,101,32,83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,0] /* This game does not s */, "i8", ALLOC_NONE, 34456);
allocate([105,110,100,101,120,40,112,97,114,97,109,115,44,32,116,105,108,101,115,44,32,120,50,44,32,121,50,41,32,61,61,32,48,0] /* index(params, tiles, */, "i8", ALLOC_NONE, 34504);
allocate([105,110,118,101,114,115,101,32,61,61,32,48,0] /* inverse == 0\00 */, "i8", ALLOC_NONE, 34540);
allocate([71,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,32,108,111,110,103,101,114,32,116,104,97,110,32,101,120,112,101,99,116,101,100,0] /* Game description lon */, "i8", ALLOC_NONE, 34556);
allocate([116,114,101,101,50,51,52,46,99,0] /* tree234.c\00 */, "i8", ALLOC_NONE, 34596);
allocate([71,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,32,99,111,110,116,97,105,110,101,100,32,117,110,101,120,112,101,99,116,101,100,32,99,104,97,114,97,99,116,101,114,0] /* Game description con */, "i8", ALLOC_NONE, 34608);
allocate([100,114,45,62,109,101,0] /* dr-_me\00 */, "i8", ALLOC_NONE, 34656);
allocate([114,97,110,100,111,109,46,99,0] /* random.c\00 */, "i8", ALLOC_NONE, 34664);
allocate([71,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,32,115,104,111,114,116,101,114,32,116,104,97,110,32,101,120,112,101,99,116,101,100,0] /* Game description sho */, "i8", ALLOC_NONE, 34676);
allocate([112,97,114,97,109,115,45,62,119,105,100,116,104,32,62,32,49,32,124,124,32,112,97,114,97,109,115,45,62,104,101,105,103,104,116,32,62,32,49,0] /* params-_width _ 1 || */, "i8", ALLOC_NONE, 34716);
allocate([112,97,114,97,109,115,45,62,119,105,100,116,104,32,62,32,48,32,38,38,32,112,97,114,97,109,115,45,62,104,101,105,103,104,116,32,62,32,48,0] /* params-_width _ 0 && */, "i8", ALLOC_NONE, 34756);
allocate([116,105,108,101,115,116,97,116,101,91,105,32,42,32,52,32,43,32,48,93,32,33,61,32,50,53,53,0] /* tilestate[i _ 4 + 0] */, "i8", ALLOC_NONE, 34796);
allocate([37,115,95,68,69,70,65,85,76,84,0] /* %s_DEFAULT\00 */, "i8", ALLOC_NONE, 34824);
allocate([106,32,62,32,48,0] /* j _ 0\00 */, "i8", ALLOC_NONE, 34836);
allocate([114,101,116,108,101,110,32,60,32,114,101,116,115,105,122,101,0] /* retlen _ retsize\00 */, "i8", ALLOC_NONE, 34844);
allocate([110,101,116,0] /* net\00 */, "i8", ALLOC_NONE, 34864);
allocate([116,116,32,61,61,32,102,116,0] /* tt == ft\00 */, "i8", ALLOC_NONE, 34868);
allocate([59,76,37,100,44,37,100,0] /* ;L%d,%d\00 */, "i8", ALLOC_NONE, 34880);
allocate([105,110,100,101,120,32,62,61,32,48,0] /* index _= 0\00 */, "i8", ALLOC_NONE, 34888);
allocate([79,37,100,44,37,100,59,67,37,100,44,37,100,0] /* O%d,%d;C%d,%d\00 */, "i8", ALLOC_NONE, 34900);
allocate([100,105,114,32,33,61,32,48,0] /* dir != 0\00 */, "i8", ALLOC_NONE, 34916);
allocate([112,32,45,32,114,101,116,32,60,32,109,97,120,108,101,110,0] /* p - ret _ maxlen\00 */, "i8", ALLOC_NONE, 34928);
allocate([110,32,62,61,32,48,32,38,38,32,110,32,60,32,109,101,45,62,110,112,114,101,115,101,116,115,0] /* n _= 0 && n _ me-_np */, "i8", ALLOC_NONE, 34948);
allocate([65,70,67,0] /* AFC\00 */, "i8", ALLOC_NONE, 34976);
allocate([37,115,95,80,82,69,83,69,84,83,0] /* %s_PRESETS\00 */, "i8", ALLOC_NONE, 34980);
allocate([59,37,99,37,100,44,37,100,0] /* ;%c%d,%d\00 */, "i8", ALLOC_NONE, 34992);
allocate([114,101,108,97,116,105,111,110,32,61,61,32,82,69,76,50,51,52,95,76,84,32,124,124,32,114,101,108,97,116,105,111,110,32,61,61,32,82,69,76,50,51,52,95,71,84,0] /* relation == REL234_L */, "i8", ALLOC_NONE, 35004);
allocate([98,105,116,115,32,60,32,51,50,0] /* bits _ 32\00 */, "i8", ALLOC_NONE, 35052);
allocate([37,50,120,37,50,120,37,50,120,0] /* %2x%2x%2x\00 */, "i8", ALLOC_NONE, 35064);
allocate([37,99,37,100,44,37,100,0] /* %c%d,%d\00 */, "i8", ALLOC_NONE, 35076);
allocate([37,115,95,67,79,76,79,85,82,95,37,100,0] /* %s_COLOUR_%d\00 */, "i8", ALLOC_NONE, 35084);
allocate([37,100,0] /* %d\00 */, "i8", ALLOC_NONE, 35100);
allocate([76,37,100,44,37,100,0] /* L%d,%d\00 */, "i8", ALLOC_NONE, 35104);
allocate([37,115,95,84,73,76,69,83,73,90,69,0] /* %s_TILESIZE\00 */, "i8", ALLOC_NONE, 35112);
allocate([110,32,61,61,32,116,45,62,114,111,111,116,0] /* n == t-_root\00 */, "i8", ALLOC_NONE, 35124);
allocate(1, "i8", ALLOC_NONE, 35140);
allocate([109,111,118,101,91,48,93,32,61,61,32,39,76,39,0] /* move[0] == 'L'\00 */, "i8", ALLOC_NONE, 35144);
allocate([103,97,109,101,115,46,110,101,116,0] /* games.net\00 */, "i8", ALLOC_NONE, 35160);
allocate([78,101,116,0] /* Net\00 */, "i8", ALLOC_NONE, 35172);
allocate(472, ["i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0], ALLOC_NONE, 35176);
allocate([116,114,97,110,115,50,51,52,95,115,117,98,116,114,101,101,95,109,101,114,103,101,0] /* trans234_subtree_mer */, "i8", ALLOC_NONE, 35648);
allocate([115,116,97,116,117,115,95,98,97,114,0] /* status_bar\00 */, "i8", ALLOC_NONE, 35672);
allocate([115,111,108,118,101,95,103,97,109,101,0] /* solve_game\00 */, "i8", ALLOC_NONE, 35684);
allocate([114,97,110,100,111,109,95,117,112,116,111,0] /* random_upto\00 */, "i8", ALLOC_NONE, 35696);
allocate([112,101,114,116,117,114,98,0] /* perturb\00 */, "i8", ALLOC_NONE, 35708);
allocate([110,101,119,95,103,97,109,101,95,100,101,115,99,0] /* new_game_desc\00 */, "i8", ALLOC_NONE, 35716);
allocate([110,101,119,95,103,97,109,101,0] /* new_game\00 */, "i8", ALLOC_NONE, 35732);
allocate([110,101,116,95,115,111,108,118,101,114,0] /* net_solver\00 */, "i8", ALLOC_NONE, 35744);
allocate([109,105,100,101,110,100,95,115,111,108,118,101,0] /* midend_solve\00 */, "i8", ALLOC_NONE, 35756);
allocate([109,105,100,101,110,100,95,114,101,115,116,97,114,116,95,103,97,109,101,0] /* midend_restart_game\ */, "i8", ALLOC_NONE, 35772);
allocate([109,105,100,101,110,100,95,114,101,100,114,97,119,0] /* midend_redraw\00 */, "i8", ALLOC_NONE, 35792);
allocate([109,105,100,101,110,100,95,114,101,97,108,108,121,95,112,114,111,99,101,115,115,95,107,101,121,0] /* midend_really_proces */, "i8", ALLOC_NONE, 35808);
allocate([109,105,100,101,110,100,95,110,101,119,95,103,97,109,101,0] /* midend_new_game\00 */, "i8", ALLOC_NONE, 35836);
allocate([109,105,100,101,110,100,95,102,101,116,99,104,95,112,114,101,115,101,116,0] /* midend_fetch_preset\ */, "i8", ALLOC_NONE, 35852);
allocate([105,110,116,101,114,112,114,101,116,95,109,111,118,101,0] /* interpret_move\00 */, "i8", ALLOC_NONE, 35872);
allocate([102,105,110,100,114,101,108,112,111,115,50,51,52,0] /* findrelpos234\00 */, "i8", ALLOC_NONE, 35888);
allocate([101,120,101,99,117,116,101,95,109,111,118,101,0] /* execute_move\00 */, "i8", ALLOC_NONE, 35904);
allocate([101,110,99,111,100,101,95,112,97,114,97,109,115,0] /* encode_params\00 */, "i8", ALLOC_NONE, 35920);
allocate([101,100,115,102,95,109,101,114,103,101,0] /* edsf_merge\00 */, "i8", ALLOC_NONE, 35936);
allocate([101,100,115,102,95,99,97,110,111,110,105,102,121,0] /* edsf_canonify\00 */, "i8", ALLOC_NONE, 35948);
allocate([100,101,108,112,111,115,50,51,52,95,105,110,116,101,114,110,97,108,0] /* delpos234_internal\0 */, "i8", ALLOC_NONE, 35964);
allocate([99,111,109,112,117,116,101,95,97,99,116,105,118,101,0] /* compute_active\00 */, "i8", ALLOC_NONE, 35984);
HEAP[32768]=((35172)|0);
HEAP[32772]=((35160)|0);
HEAP[32776]=((34864)|0);
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
  var _cos=Math.cos;
  var _sin=Math.sin;
  function _memset(ptr, value, num) {
      for (var $$dest = ptr, $$stop = $$dest + num; $$dest < $$stop; $$dest++) {
  HEAP[$$dest]=value
  };
    }var _llvm_memset_p0i8_i32=_memset;
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }
var _frontend_default_colour; // stub for _frontend_default_colour
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
  function _qsort(base, num, size, cmp) {
      if (num == 0 || size == 0) return;
      // forward calls to the JavaScript sort method
      // first, sort the items logically
      var comparator = function(x, y) {
        return Runtime.dynCall('iii', cmp, [x, y]);
      }
      var keys = [];
      for (var i = 0; i < num; i++) keys.push(i);
      keys.sort(function(a, b) {
        return comparator(base+a*size, base+b*size);
      });
      // apply the sort
      var temp = _malloc(num*size);
      _memcpy(temp, base, num*size);
      for (var i = 0; i < num; i++) {
        if (keys[i] == i) continue; // already in place
        _memcpy(base+i*size, temp+keys[i]*size, size);
      }
      _free(temp);
    }
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
  var _sqrt=Math.sqrt;
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
___setErrNo(0);
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___buildEnvironment(ENV);
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
var FUNCTION_TABLE = [0,0,_free_game,0,_game_free_drawstate,0,_validate_params,0,_game_text_format,0,_dup_game
,0,_game_changed_state,0,_encode_params,0,_canvas_draw_update,0,_encode_ui,0,_game_anim_length
,0,_canvas_draw_circle,0,_canvas_draw_line,0,_game_set_size,0,_solve_game,0,_game_print
,0,_canvas_draw_rect,0,_validate_desc,0,_canvas_unclip,0,_canvas_draw_thick_line,0,_decode_params
,0,_custom_params,0,_decode_ui,0,_free_params,0,_game_compute_size,0,_canvas_start_draw
,0,_game_new_drawstate,0,_canvas_clip,0,_game_redraw,0,_default_params,0,_canvas_text_fallback
,0,_canvas_end_draw,0,_new_ui,0,_free_ui,0,_dup_params,0,_game_configure
,0,_game_fetch_preset,0,_game_status,0,_xyd_cmp_nc,0,_canvas_draw_text,0,_game_timing_state
,0,_canvas_blitter_load,0,_canvas_blitter_new,0,_game_flash_length,0,_canvas_blitter_free,0,_game_colours
,0,_game_can_format_as_text_now,0,_canvas_blitter_save,0,_game_print_size,0,_canvas_status_bar,0,_interpret_move
,0,_new_game_desc,0,_execute_move,0,_canvas_draw_poly,0,_new_game,0,_xyd_cmp,0];
// EMSCRIPTEN_START_FUNCS
function _validate_params(r1,r2){var r3,r4,r5;r3=r1;r1=r2;do{if(!((HEAP[r3|0]|0)<=0)){if((HEAP[r3+4|0]|0)<=0){break}do{if((HEAP[r3|0]|0)<=1){if(!((HEAP[r3+4|0]|0)<=1)){break}r4=34040;r5=r4;return r5}}while(0);if(HEAP[r3+16|0]<0){r4=34e3;r5=r4;return r5}if(HEAP[r3+16|0]>1){r4=33936;r5=r4;return r5}do{if((r1|0)!=0){if((HEAP[r3+12|0]|0)==0){break}if((HEAP[r3+8|0]|0)==0){break}if((HEAP[r3|0]|0)!=2){if((HEAP[r3+4|0]|0)!=2){break}}r4=33860;r5=r4;return r5}}while(0);r4=0;r5=r4;return r5}}while(0);r4=34112;r5=r4;return r5}function _decode_params(r1,r2){var r3,r4,r5,r6;r3=r1;r1=r2;r2=_atoi(r1);HEAP[r3|0]=r2;r2=r1;L30:do{if((HEAP[r1]<<24>>24|0)!=0){r4=r2;while(1){r5=r1;if((((HEAP[r4]&255)-48|0)>>>0<10&1|0)==0){r6=r5;break L30}r1=r5+1|0;r5=r1;if((HEAP[r1]<<24>>24|0)!=0){r4=r5}else{r6=r5;break L30}}}else{r6=r2}}while(0);L35:do{if((HEAP[r6]<<24>>24|0)==120){r1=r1+1|0;r2=_atoi(r1);HEAP[r3+4|0]=r2;if((HEAP[r1]<<24>>24|0)==0){break}while(1){if((((HEAP[r1]&255)-48|0)>>>0<10&1|0)==0){break L35}r1=r1+1|0;if((HEAP[r1]<<24>>24|0)==0){break L35}}}else{HEAP[r3+4|0]=HEAP[r3|0]}}while(0);if(HEAP[r1]<<24>>24==0){return}while(1){r6=r1;L46:do{if((HEAP[r1]<<24>>24|0)==119){r1=r6+1|0;HEAP[r3+8|0]=1}else{r2=r1;if((HEAP[r6]<<24>>24|0)!=98){r1=r1+1|0;if((HEAP[r2]<<24>>24|0)!=97){break}HEAP[r3+12|0]=0;break}r1=r2+1|0;r2=_atof(r1);HEAP[r3+16|0]=r2;if((HEAP[r1]<<24>>24|0)==0){break}while(1){if((HEAP[r1]<<24>>24|0)!=46){if((((HEAP[r1]&255)-48|0)>>>0<10&1|0)==0){break L46}}r1=r1+1|0;if((HEAP[r1]<<24>>24|0)==0){break L46}}}}while(0);if(HEAP[r1]<<24>>24==0){break}}return}function _free_params(r1){var r2,r3;r2=STACKTOP;STACKTOP=STACKTOP+4|0;r3=r2;HEAP[r3]=r1;if((HEAP[r3]|0)!=0){_free(HEAP[r3])}STACKTOP=r2;return}function _default_params(){var r1,r2,r3,r4;r1=STACKTOP;STACKTOP=STACKTOP+8|0;r2=r1;r3=r1+4;HEAP[r2]=20;r4=_malloc(HEAP[r2]);HEAP[r3]=r4;if((HEAP[r3]|0)!=0){r4=HEAP[r3];HEAP[r4|0]=5;HEAP[r4+4|0]=5;HEAP[r4+8|0]=0;HEAP[r4+12|0]=1;HEAP[r4+16|0]=0;STACKTOP=r1;return r4}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _game_fetch_preset(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12;r4=STACKTOP;STACKTOP=STACKTOP+88|0;r5=r4;r6=r4+4;r7=r4+8;r8=r1;r1=r2;r2=r3;if((r8|0)<0|r8>>>0>=10){r9=0;r10=r9;STACKTOP=r4;return r10}HEAP[r5]=20;r3=_malloc(HEAP[r5]);HEAP[r6]=r3;if((HEAP[r6]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r3=HEAP[r6];r6=r3;r5=(r8*20&-1)+33032|0;for(r8=r5,r11=r6,r12=r8+20;r8<r12;r8++,r11++){HEAP[r11]=HEAP[r8]}r6=HEAP[r3+4|0];r5=(HEAP[r3+8|0]|0)!=0?33664:35140;_sprintf(r7|0,33676,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP[tempInt]=HEAP[r3|0],HEAP[tempInt+4]=r6,HEAP[tempInt+8]=r5,tempInt));r5=_dupstr(r7|0);HEAP[r1]=r5;HEAP[r2]=r3;r9=1;r10=r9;STACKTOP=r4;return r10}function _encode_params(r1,r2){var r3,r4,r5,r6;r3=STACKTOP;STACKTOP=STACKTOP+400|0;r4=r3;r5=r1;r1=r2;r2=HEAP[r5+4|0];r6=_sprintf(r4|0,33736,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=HEAP[r5|0],HEAP[tempInt+4]=r2,tempInt));if((HEAP[r5+8|0]|0)!=0){r2=r6;r6=r2+1|0;HEAP[r4+r2|0]=119}do{if((r1|0)!=0){if(HEAP[r5+16|0]!=0){r6=r6+_sprintf(r4+r6|0,33720,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=HEAP[r5+16|0],tempInt))|0}if((r1|0)==0){break}if((HEAP[r5+12|0]|0)!=0){break}r2=r6;r6=r2+1|0;HEAP[r4+r2|0]=97}}while(0);if(r6>>>0<400){HEAP[r4+r6|0]=0;r6=_dupstr(r4|0);STACKTOP=r3;return r6}else{___assert_func(33560,261,35920,33700)}}function _dup_params(r1){var r2,r3,r4,r5,r6,r7;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=r2+4;HEAP[r3]=20;r5=_malloc(HEAP[r3]);HEAP[r4]=r5;if((HEAP[r4]|0)!=0){r5=HEAP[r4];r4=r5;r3=r1;for(r1=r3,r6=r4,r7=r1+20;r1<r7;r1++,r6++){HEAP[r6]=HEAP[r1]}STACKTOP=r2;return r5}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _game_configure(r1){var r2,r3,r4,r5,r6;r2=STACKTOP;STACKTOP=STACKTOP+88|0;r3=r2;r4=r2+4;r5=r2+8;r6=r1;HEAP[r3]=96;r1=_malloc(HEAP[r3]);HEAP[r4]=r1;if((HEAP[r4]|0)!=0){r1=HEAP[r4];HEAP[r1|0]=33832;HEAP[r1+4|0]=0;_sprintf(r5|0,35100,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[r6|0],tempInt));r4=_dupstr(r5|0);HEAP[r1+8|0]=r4;HEAP[r1+12|0]=0;HEAP[r1+16|0]=33824;HEAP[r1+20|0]=0;_sprintf(r5|0,35100,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[r6+4|0],tempInt));r4=_dupstr(r5|0);HEAP[r1+24|0]=r4;HEAP[r1+28|0]=0;HEAP[r1+32|0]=33804;HEAP[r1+36|0]=2;HEAP[r1+40|0]=0;HEAP[r1+44|0]=HEAP[r6+8|0];HEAP[r1+48|0]=33784;HEAP[r1+52|0]=0;_sprintf(r5|0,33780,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=HEAP[r6+16|0],tempInt));r4=_dupstr(r5|0);HEAP[r1+56|0]=r4;HEAP[r1+60|0]=0;HEAP[r1+64|0]=33756;HEAP[r1+68|0]=2;HEAP[r1+72|0]=0;HEAP[r1+76|0]=HEAP[r6+12|0];HEAP[r1+80|0]=0;HEAP[r1+84|0]=3;HEAP[r1+88|0]=0;HEAP[r1+92|0]=0;STACKTOP=r2;return r1}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _custom_params(r1){var r2,r3,r4,r5;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=r2+4;r5=r1;HEAP[r3]=20;r1=_malloc(HEAP[r3]);HEAP[r4]=r1;if((HEAP[r4]|0)!=0){r1=HEAP[r4];r4=_atoi(HEAP[r5+8|0]);HEAP[r1|0]=r4;r4=_atoi(HEAP[r5+24|0]);HEAP[r1+4|0]=r4;HEAP[r1+8|0]=HEAP[r5+44|0];r4=_atof(HEAP[r5+56|0]);HEAP[r1+16|0]=r4;HEAP[r1+12|0]=HEAP[r5+76|0];STACKTOP=r2;return r1}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _new_game_desc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+440|0;r6=r5;r7=r5+4;r8=r5+8;r9=r5+12;r10=r5+16;r11=r5+20;r12=r5+24;r13=r5+28;r14=r5+32;r15=r5+36;r16=r5+40;r17=r5+44;r18=r5+48;r19=r5+52;r20=r5+56;r21=r5+60;r22=r5+64;r23=r5+68;r24=r5+72;r25=r5+76;r26=r5+80;r27=r5+84;r28=r5+88;r29=r5+92;r30=r5+96;r31=r5+100;r32=r5+104;r33=r5+108;r34=r5+112;r35=r5+116;r36=r5+120;r37=r5+124;r38=r5+128;r39=r5+132;r40=r5+136;r41=r5+140;r42=r5+144;r43=r5+148;r44=r5+152;r45=r5+156;r46=r5+160;r47=r5+164;r48=r5+168;r49=r5+172;r50=r5+176;r51=r5+180;r52=r5+184;r53=r5+188;r54=r5+192;r55=r5+196;r56=r5+200;r57=r5+204;r58=r5+208;r59=r5+212;r60=r5+216;r61=r5+220;r62=r5+224;r63=r5+228;r64=r5+232;r65=r5+236;r66=r5+240;r67=r5+244;r68=r5+248;r69=r5+252;r70=r5+256;r71=r5+260;r72=r5+264;r73=r5+268;r74=r5+272;r75=r5+276;r76=r5+280;r77=r5+284;r78=r5+288;r79=r5+292;r80=r5+296;r81=r5+300;r82=r5+304;r83=r5+308;r84=r5+312;r85=r5+316;r86=r5+320;r87=r5+324;r88=r5+328;r89=r5+332;r90=r5+336;r91=r5+340;r92=r5+344;r93=r5+348;r94=r5+352;r95=r5+356;r96=r5+360;r97=r5+364;r98=r5+368;r99=r5+372;r100=r5+376;r101=r5+380;r102=r5+384;r103=r5+388;r104=r5+392;r105=r5+396;r106=r5+400;r107=r5+404;r108=r5+408;r109=r5+412;r110=r5+416;r111=r5+428;r112=r1;r1=r2;r2=r3;r3=HEAP[r112|0];r113=HEAP[r112+4|0];r114=(r3|0)/2&-1;r115=(r113|0)/2&-1;r116=Math.imul(r113,r3);HEAP[r108]=r116;r116=_malloc(HEAP[r108]);HEAP[r109]=r116;if((HEAP[r109]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r116=HEAP[r109];r109=Math.imul(r113,r3);HEAP[r106]=r109;r109=_malloc(HEAP[r106]);HEAP[r107]=r109;if((HEAP[r107]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r109=HEAP[r107];r107=r110|0;r106=r110+4|0;r108=r110+8|0;r117=r110;r110=r111|0;r118=r111+4|0;r119=r111+8|0;r120=r111;L111:while(1){r111=r116;r121=Math.imul(r113,r3);for(r122=r111,r123=r122+r121;r122<r123;r122++){HEAP[r122]=0}r121=r109;r111=Math.imul(r113,r3);for(r122=r121,r123=r122+r111;r122<r123;r122++){HEAP[r122]=0}HEAP[r104]=76;HEAP[r102]=8;r111=_malloc(HEAP[r102]);HEAP[r103]=r111;if((r111|0)==0){r4=87;break}HEAP[r105]=HEAP[r103];HEAP[HEAP[r105]|0]=0;HEAP[HEAP[r105]+4|0]=HEAP[r104];r111=HEAP[r105];if((r114+1|0)<(r3|0)){HEAP[r98]=r114;HEAP[r99]=r115;HEAP[r100]=1;HEAP[r96]=12;r121=_malloc(HEAP[r96]);HEAP[r97]=r121;if((HEAP[r97]|0)==0){r4=90;break}HEAP[r101]=HEAP[r97];HEAP[HEAP[r101]|0]=HEAP[r98];HEAP[HEAP[r101]+4|0]=HEAP[r99];HEAP[HEAP[r101]+8|0]=HEAP[r100];_add234(r111,HEAP[r101])}if((r115-1|0)>=0){HEAP[r92]=r114;HEAP[r93]=r115;HEAP[r94]=2;HEAP[r90]=12;r121=_malloc(HEAP[r90]);HEAP[r91]=r121;if((HEAP[r91]|0)==0){r4=94;break}HEAP[r95]=HEAP[r91];HEAP[HEAP[r95]|0]=HEAP[r92];HEAP[HEAP[r95]+4|0]=HEAP[r93];HEAP[HEAP[r95]+8|0]=HEAP[r94];_add234(r111,HEAP[r95])}if((r114-1|0)>=0){HEAP[r86]=r114;HEAP[r87]=r115;HEAP[r88]=4;HEAP[r84]=12;r121=_malloc(HEAP[r84]);HEAP[r85]=r121;if((HEAP[r85]|0)==0){r4=98;break}HEAP[r89]=HEAP[r85];HEAP[HEAP[r89]|0]=HEAP[r86];HEAP[HEAP[r89]+4|0]=HEAP[r87];HEAP[HEAP[r89]+8|0]=HEAP[r88];_add234(r111,HEAP[r89])}if((r115+1|0)<(r113|0)){HEAP[r80]=r114;HEAP[r81]=r115;HEAP[r82]=8;HEAP[r78]=12;r121=_malloc(HEAP[r78]);HEAP[r79]=r121;if((HEAP[r79]|0)==0){r4=102;break}HEAP[r83]=HEAP[r79];HEAP[HEAP[r83]|0]=HEAP[r80];HEAP[HEAP[r83]+4|0]=HEAP[r81];HEAP[HEAP[r83]+8|0]=HEAP[r82];_add234(r111,HEAP[r83])}HEAP[r77]=r111;L130:do{if((HEAP[HEAP[r77]|0]|0)!=0){while(1){r121=_countnode234(HEAP[HEAP[r77]|0]);HEAP[r76]=r121;if((r121|0)<=0){break L130}HEAP[r75]=r111;if((HEAP[HEAP[r75]|0]|0)!=0){r121=_countnode234(HEAP[HEAP[r75]|0]);HEAP[r74]=r121}else{HEAP[r74]=0}r121=_random_upto(r1,HEAP[r74]);HEAP[r72]=r111;HEAP[r73]=r121;do{if((r121|0)<0){r4=113}else{if((HEAP[r73]|0)>=(_countnode234(HEAP[HEAP[r72]|0])|0)){r4=113;break}r124=_delpos234_internal(HEAP[r72],HEAP[r73]);HEAP[r71]=r124;break}}while(0);if(r4==113){r4=0;HEAP[r71]=0}r121=HEAP[r71];r124=HEAP[r121|0];r125=HEAP[r121+4|0];r126=HEAP[r121+8|0];r127=r121;HEAP[r70]=r127;if((r127|0)!=0){_free(HEAP[r70])}if((r126|0)==1){r128=1}else{r128=(r126|0)==4?-1:0}r127=(HEAP[r112|0]+r124+r128|0)%(HEAP[r112|0]|0);if((r126|0)==8){r129=1}else{r129=(r126|0)==2?-1:0}r121=(HEAP[r112+4|0]+r125+r129|0)%(HEAP[r112+4|0]|0);r130=(r126&3)<<2|(r126&12)>>2;r131=r116+Math.imul(HEAP[r112|0],r125)+r124|0;HEAP[r131]=(HEAP[r131]&255|r126)&255;r126=r116+Math.imul(HEAP[r112|0],r121)+r127|0;if((HEAP[r126]&255|0)!=0){r4=122;break L111}r126=r116+Math.imul(HEAP[r112|0],r121)+r127|0;HEAP[r126]=(HEAP[r126]&255|r130)&255;r126=r116+Math.imul(HEAP[r112|0],r125)+r124|0;r131=(HEAP[r126]&8)>>3;r126=r116+Math.imul(HEAP[r112|0],r125)+r124|0;r132=((HEAP[r126]&4)>>2)+r131|0;r131=r116+Math.imul(HEAP[r112|0],r125)+r124|0;r126=((HEAP[r131]&2)>>1)+r132|0;r132=r116+Math.imul(HEAP[r112|0],r125)+r124|0;do{if((r126+(HEAP[r132]&1)|0)==3){HEAP[r107]=r124;HEAP[r106]=r125;r131=r116+Math.imul(HEAP[r112|0],r125)+r124|0;HEAP[r108]=HEAP[r131]&255^15;HEAP[r67]=r111;HEAP[r68]=r117;HEAP[r69]=0;r131=_findrelpos234(HEAP[r67],HEAP[r68],HEAP[r69],0);if((r131|0)==0){break}HEAP[r64]=r111;HEAP[r65]=r131;if((_findrelpos234(HEAP[r64],HEAP[r65],0,r66)|0)!=0){r133=_delpos234_internal(HEAP[r64],HEAP[r66]);HEAP[r63]=r133}else{HEAP[r63]=0}r133=r131;HEAP[r62]=r133;if((r133|0)==0){break}_free(HEAP[r62])}}while(0);r124=1;r125=1;while(1){if((r125|0)==1){r134=1}else{r134=(r124|0)==4?-1:0}if((r124|0)==8){r135=1}else{r135=(r124|0)==2?-1:0}r132=(HEAP[r112+4|0]+r121+r135|0)%(HEAP[r112+4|0]|0);HEAP[r110]=(HEAP[r112|0]+r127+r134|0)%(HEAP[r112|0]|0);HEAP[r118]=r132;HEAP[r119]=(r124&3)<<2|(r124&12)>>2;HEAP[r59]=r111;HEAP[r60]=r120;HEAP[r61]=0;r132=_findrelpos234(HEAP[r59],HEAP[r60],HEAP[r61],0);r126=r132;do{if((r132|0)!=0){HEAP[r56]=r111;HEAP[r57]=r126;if((_findrelpos234(HEAP[r56],HEAP[r57],0,r58)|0)!=0){r133=_delpos234_internal(HEAP[r56],HEAP[r58]);HEAP[r55]=r133}else{HEAP[r55]=0}r133=r126;HEAP[r54]=r133;if((r133|0)==0){break}_free(HEAP[r54])}}while(0);r126=r124<<1;r124=r126;if((r126|0)<16){r125=r126}else{break}}r124=1;while(1){L182:do{if((r124|0)!=(r130|0)){do{if((HEAP[r112+8|0]|0)==0){r125=r124;if((r125|0)==2){if((r121|0)==0){break L182}r136=r124}else{r136=r125}if((r136|0)==8){if((r121|0)==(r113-1|0)){break L182}}r125=r124;if((r125|0)==4){if((r127|0)==0){break L182}r137=r124}else{r137=r125}if((r137|0)!=1){break}if((r127|0)==(r3-1|0)){break L182}}}while(0);if((r124|0)==1){r138=1}else{r138=(r124|0)==4?-1:0}if((r124|0)==8){r139=1}else{r139=(r124|0)==2?-1:0}r125=(HEAP[r112|0]+r127+r138|0)%(HEAP[r112|0]|0)+(r116+Math.imul(HEAP[r112|0],(HEAP[r112+4|0]+r121+r139|0)%(HEAP[r112+4|0]|0)))|0;if(HEAP[r125]<<24>>24!=0){break}HEAP[r50]=r127;HEAP[r51]=r121;HEAP[r52]=r124;HEAP[r48]=12;r125=_malloc(HEAP[r48]);HEAP[r49]=r125;if((HEAP[r49]|0)==0){r4=161;break L111}HEAP[r53]=HEAP[r49];HEAP[HEAP[r53]|0]=HEAP[r50];HEAP[HEAP[r53]+4|0]=HEAP[r51];HEAP[HEAP[r53]+8|0]=HEAP[r52];_add234(r111,HEAP[r53])}}while(0);r125=r124<<1;r124=r125;if((r125|0)>=16){break}}HEAP[r77]=r111;if((HEAP[HEAP[r77]|0]|0)==0){r4=106;break L130}}}else{r4=106}}while(0);if(r4==106){r4=0;HEAP[r76]=0}HEAP[r47]=r111;if((HEAP[HEAP[r47]|0]|0)!=0){r124=_countnode234(HEAP[HEAP[r47]|0]);HEAP[r46]=r124;if((r124|0)!=0){r4=167;break}}else{HEAP[r46]=0}HEAP[r45]=r111;_freenode234(HEAP[HEAP[r45]|0]);r124=HEAP[r45];HEAP[r44]=r124;if((r124|0)!=0){_free(HEAP[r44])}if((HEAP[r112+12|0]|0)==0){break}r124=-1;if(!((_net_solver(r3,r113,r116,0,HEAP[r112+8|0])|0)!=0^1)){r4=189;break}while(1){r121=0;r140=0;L222:do{if((r140|0)<(r113|0)){while(1){r141=0;L225:do{if((r141|0)<(r3|0)){while(1){do{if((r141+1|0)<(r3|0)){r127=r116+Math.imul(r3,r140)+r141|0;r130=HEAP[r127]&255;r127=r116+r141+Math.imul(r3,r140)+1|0;if(((HEAP[r127]&255^r130)&16|0)==0){break}r121=r121+1|0;r130=r116+Math.imul(r3,r140)+r141|0;r127=r3;r125=r113;r126=r116;r132=HEAP[r112+8|0];r133=r1;r131=r141;if((HEAP[r130]&16|0)!=0){_perturb(r127,r125,r126,r132,r133,r131+1|0,r140,4);break}else{_perturb(r127,r125,r126,r132,r133,r131,r140,1);break}}}while(0);do{if((r140+1|0)<(r113|0)){r131=r116+Math.imul(r3,r140)+r141|0;r133=HEAP[r131]&255;r131=r116+Math.imul(r140+1|0,r3)+r141|0;if(((HEAP[r131]&255^r133)&16|0)==0){break}r121=r121+1|0;r133=r116+Math.imul(r3,r140)+r141|0;r131=r3;r132=r113;r126=r116;r125=HEAP[r112+8|0];r127=r1;r130=r141;r142=r140;if((HEAP[r133]&16|0)!=0){_perturb(r131,r132,r126,r125,r127,r130,r142+1|0,2);break}else{_perturb(r131,r132,r126,r125,r127,r130,r142,8);break}}}while(0);r141=r141+1|0;if((r141|0)>=(r3|0)){break L225}}}}while(0);r140=r140+1|0;if((r140|0)>=(r113|0)){break L222}}}}while(0);if((r124|0)!=-1){if((r124|0)<=(r121|0)){continue L111}}r124=r121;if(!((_net_solver(r3,r113,r116,0,HEAP[r112+8|0])|0)!=0^1)){r4=189;break L111}}}L247:do{if(r4==98){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==94){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==87){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==90){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==102){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==122){___assert_func(33560,1235,35716,34504)}else if(r4==161){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==167){___assert_func(33560,1322,35716,34424)}else if(r4==189){r141=0;if((r141|0)>=(Math.imul(r113,r3)|0)){break}while(1){r44=r116+r141|0;HEAP[r44]=HEAP[r44]&255&-17&255;r141=r141+1|0;if((r141|0)>=(Math.imul(r113,r3)|0)){break L247}}}}while(0);HEAP[r42]=76;HEAP[r40]=8;r44=_malloc(HEAP[r40]);HEAP[r41]=r44;if((r44|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r43]=HEAP[r41];HEAP[HEAP[r43]|0]=0;HEAP[HEAP[r43]+4|0]=HEAP[r42];r42=HEAP[r43];r140=0;L263:do{if((r140|0)<(r113|0)){L265:while(1){r141=0;r43=r140;L267:do{if((r141|0)<(r3|0)){r41=r43;while(1){r44=r116+Math.imul(HEAP[r112|0],r41)+r141|0;do{if((HEAP[r44]&1|0)==0){if((HEAP[r112+8|0]|0)==0){if((r141|0)>=(r3-1|0)){break}}HEAP[r36]=r141;HEAP[r37]=r140;HEAP[r38]=1;HEAP[r34]=12;r40=_malloc(HEAP[r34]);HEAP[r35]=r40;if((r40|0)==0){r4=200;break L265}HEAP[r39]=HEAP[r35];HEAP[HEAP[r39]|0]=HEAP[r36];HEAP[HEAP[r39]+4|0]=HEAP[r37];HEAP[HEAP[r39]+8|0]=HEAP[r38];_add234(r42,HEAP[r39])}}while(0);r44=r116+Math.imul(HEAP[r112|0],r140)+r141|0;do{if((HEAP[r44]&8|0)==0){if((HEAP[r112+8|0]|0)==0){if((r140|0)>=(r113-1|0)){break}}HEAP[r30]=r141;HEAP[r31]=r140;HEAP[r32]=8;HEAP[r28]=12;r40=_malloc(HEAP[r28]);HEAP[r29]=r40;if((r40|0)==0){r4=206;break L265}HEAP[r33]=HEAP[r29];HEAP[HEAP[r33]|0]=HEAP[r30];HEAP[HEAP[r33]+4|0]=HEAP[r31];HEAP[HEAP[r33]+8|0]=HEAP[r32];_add234(r42,HEAP[r33])}}while(0);r141=r141+1|0;r44=r140;if((r141|0)<(r3|0)){r41=r44}else{r143=r44;break L267}}}else{r143=r43}}while(0);r140=r143+1|0;if((r140|0)>=(r113|0)){break L263}}if(r4==200){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}else if(r4==206){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}}while(0);r143=Math.imul(r113,r3)+1|0;HEAP[r26]=r143;r143=_malloc(HEAP[r26]);HEAP[r27]=r143;if((r143|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r143=HEAP[r27];r27=0;L292:do{if((r27|0)<(Math.imul(r113,r3)|0)){while(1){HEAP[r143+r27|0]=HEAP[(HEAP[r116+r27|0]&15)+34364|0];r27=r27+1|0;if((r27|0)>=(Math.imul(r113,r3)|0)){break L292}}}}while(0);r27=r143+Math.imul(r113,r3)|0;HEAP[r27]=0;HEAP[r2]=r143;while(1){r140=0;L298:do{if((r140|0)<(r113|0)){while(1){r141=0;r143=r140;L301:do{if((r141|0)<(r3|0)){r2=r143;while(1){r27=r116+Math.imul(HEAP[r112|0],r2)+r141|0;r26=HEAP[r27]&255;r27=_random_upto(r1,4);do{if((r27&3|0)==0){r144=r26}else{if((r27&3|0)==1){r144=(r26&8)>>3|(r26&7)<<1;break}r33=r26;if((r27&3|0)==2){r144=(r26&3)<<2|(r33&12)>>2;break}else{r144=(r26&1)<<3|(r33&14)>>1;break}}}while(0);r26=r116+Math.imul(HEAP[r112|0],r140)+r141|0;HEAP[r26]=r144&255;r141=r141+1|0;r26=r140;if((r141|0)<(r3|0)){r2=r26}else{r145=r26;break L301}}}else{r145=r143}}while(0);r140=r145+1|0;if((r140|0)>=(r113|0)){break L298}}}}while(0);r143=0;r140=0;if((r140|0)>=(r113|0)){continue}while(1){r141=0;L318:do{if((r141|0)<(r3|0)){while(1){do{if((r141+1|0)<(r3|0)){r2=r116+Math.imul(HEAP[r112|0],r140)+r141|0;r26=(HEAP[r2]&12)>>2;r2=r116+Math.imul(HEAP[r112|0],r140)+r141|0;r27=(HEAP[r2]&3)<<2|r26;r26=r116+r141+Math.imul(HEAP[r112|0],r140)+1|0;if(((HEAP[r26]&255^r27)&4|0)==0){break}r143=r143+1|0}}while(0);do{if((r140+1|0)<(r113|0)){r27=r116+Math.imul(HEAP[r112|0],r140)+r141|0;r26=(HEAP[r27]&12)>>2;r27=r116+Math.imul(HEAP[r112|0],r140)+r141|0;r2=(HEAP[r27]&3)<<2|r26;r26=r116+Math.imul(HEAP[r112|0],r140+1|0)+r141|0;if(((HEAP[r26]&255^r2)&2|0)==0){break}r143=r143+1|0}}while(0);r141=r141+1|0;if((r141|0)>=(r3|0)){break L318}}}}while(0);r140=r140+1|0;if((r140|0)>=(r113|0)){break}}if((r143|0)>0){break}}r145=HEAP[r112+16|0];HEAP[r25]=r42;if((HEAP[HEAP[r25]|0]|0)!=0){r144=_countnode234(HEAP[HEAP[r25]|0]);HEAP[r24]=r144}else{HEAP[r24]=0}r144=r145*HEAP[r24]&-1;r24=r144;if(!((r144|0)>=0)){___assert_func(33560,1478,35716,34284)}HEAP[r23]=r42;if((HEAP[HEAP[r23]|0]|0)!=0){r144=_countnode234(HEAP[HEAP[r23]|0]);HEAP[r22]=r144}else{HEAP[r22]=0}if(!((r24|0)<=(HEAP[r22]|0))){___assert_func(33560,1478,35716,34284)}L346:do{if((r24|0)>0){while(1){HEAP[r21]=r42;if((HEAP[HEAP[r21]|0]|0)!=0){r22=_countnode234(HEAP[HEAP[r21]|0]);HEAP[r20]=r22}else{HEAP[r20]=0}r22=_random_upto(r1,HEAP[r20]);HEAP[r18]=r42;HEAP[r19]=r22;do{if((r22|0)<0){r4=254}else{if((HEAP[r19]|0)>=(_countnode234(HEAP[HEAP[r18]|0])|0)){r4=254;break}r144=_delpos234_internal(HEAP[r18],HEAP[r19]);HEAP[r17]=r144;break}}while(0);if(r4==254){r4=0;HEAP[r17]=0}r22=HEAP[r17];r144=r22;if((r22|0)==0){break}r22=HEAP[r144|0];r23=HEAP[r144+4|0];r145=HEAP[r144+8|0];HEAP[r16]=r144;if((HEAP[r16]|0)!=0){_free(HEAP[r16])}if((r145|0)==1){r146=1}else{r146=(r145|0)==4?-1:0}r144=(HEAP[r112|0]+r22+r146|0)%(HEAP[r112|0]|0);if((r145|0)==8){r147=1}else{r147=(r145|0)==2?-1:0}r25=(HEAP[r112+4|0]+r23+r147|0)%(HEAP[r112+4|0]|0);r2=r109+Math.imul(HEAP[r112|0],r23)+r22|0;HEAP[r2]=(HEAP[r2]&255|r145)&255;r2=r109+Math.imul(HEAP[r112|0],r25)+r144|0;HEAP[r2]=(HEAP[r2]&255|((r145&3)<<2|(r145&12)>>2))&255;r145=r24-1|0;r24=r145;if((r145|0)<=0){break L346}}___assert_func(33560,1491,35716,34248)}}while(0);while(1){HEAP[r14]=r42;HEAP[r15]=0;if((HEAP[r15]|0)>=(_countnode234(HEAP[HEAP[r14]|0])|0)){HEAP[r13]=0}else{r24=_delpos234_internal(HEAP[r14],HEAP[r15]);HEAP[r13]=r24}r24=HEAP[r13];if((r24|0)==0){break}HEAP[r12]=r24;if((HEAP[r12]|0)==0){continue}_free(HEAP[r12])}HEAP[r11]=r42;_freenode234(HEAP[HEAP[r11]|0]);HEAP[r10]=HEAP[r11];if((HEAP[r10]|0)!=0){_free(HEAP[r10])}r10=Math.imul(r3*3&-1,r113)+1|0;HEAP[r8]=r10;r10=_malloc(HEAP[r8]);HEAP[r9]=r10;if((r10|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r10=HEAP[r9];r9=r10;r140=0;L387:do{if((r140|0)<(r113|0)){while(1){r141=0;r8=r140;L390:do{if((r141|0)<(r3|0)){r11=r8;while(1){r42=r116+Math.imul(HEAP[r112|0],r11)+r141|0;r12=r9;r9=r12+1|0;HEAP[r12]=HEAP[(HEAP[r42]&255)+34364|0];do{if((HEAP[r112+8|0]|0)!=0){r4=279}else{if((r141|0)<(r3-1|0)){r4=279;break}else{break}}}while(0);do{if(r4==279){r4=0;r42=r109+Math.imul(HEAP[r112|0],r140)+r141|0;if((HEAP[r42]&1|0)==0){break}r42=r9;r9=r42+1|0;HEAP[r42]=118}}while(0);do{if((HEAP[r112+8|0]|0)!=0){r4=283}else{if((r140|0)<(r113-1|0)){r4=283;break}else{break}}}while(0);do{if(r4==283){r4=0;r42=r109+Math.imul(HEAP[r112|0],r140)+r141|0;if((HEAP[r42]&8|0)==0){break}r42=r9;r9=r42+1|0;HEAP[r42]=104}}while(0);r141=r141+1|0;r42=r140;if((r141|0)<(r3|0)){r11=r42}else{r148=r42;break L390}}}else{r148=r8}}while(0);r140=r148+1|0;if((r140|0)>=(r113|0)){break L387}}}}while(0);if(!((r9-r10|0)<=(Math.imul(r3*3&-1,r113)|0))){___assert_func(33560,1543,35716,34228)}HEAP[r9]=0;HEAP[r7]=r116;if((HEAP[r7]|0)!=0){_free(HEAP[r7])}r7=r109;HEAP[r6]=r7;if((r7|0)==0){r149=r6;r150=r10;STACKTOP=r5;return r150}_free(HEAP[r6]);r149=r6;r150=r10;STACKTOP=r5;return r150}function _validate_desc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=0;r4=r1;r1=r2;r2=HEAP[r4|0];r5=HEAP[r4+4|0];r4=0;r6=(r4|0)<(Math.imul(r5,r2)|0);r7=HEAP[r1];L418:do{if(r6){r8=r7;L419:while(1){do{if((r8<<24>>24|0)>=48){if((HEAP[r1]<<24>>24|0)<=57){break}else{r3=301;break}}else{r3=301}}while(0);do{if(r3==301){r3=0;if((HEAP[r1]<<24>>24|0)>=97){if((HEAP[r1]<<24>>24|0)<=102){break}}if(!((HEAP[r1]<<24>>24|0)>=65)){break L419}if(!((HEAP[r1]<<24>>24|0)<=70)){break L419}}}while(0);r1=r1+1|0;while(1){if((HEAP[r1]<<24>>24|0)!=104){if((HEAP[r1]<<24>>24|0)!=118){break}}r1=r1+1|0}r4=r4+1|0;r9=(r4|0)<(Math.imul(r5,r2)|0);r10=HEAP[r1];if(r9){r8=r10}else{r11=r10;break L418}}if(HEAP[r1]<<24>>24!=0){r12=34608;r13=r12;return r13}else{r12=34676;r13=r12;return r13}}else{r11=r7}}while(0);if(r11<<24>>24!=0){r12=34556;r13=r12;return r13}else{r12=0;r13=r12;return r13}}function _new_game(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r1=0;r4=STACKTOP;STACKTOP=STACKTOP+24|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r2;r2=r3;if((HEAP[r11|0]|0)<=0){___assert_func(33560,1588,35732,34756)}if((HEAP[r11+4|0]|0)<=0){___assert_func(33560,1588,35732,34756)}do{if((HEAP[r11|0]|0)<=1){if((HEAP[r11+4|0]|0)>1){break}___assert_func(33560,1589,35732,34716)}}while(0);HEAP[r9]=40;r3=_malloc(HEAP[r9]);HEAP[r10]=r3;if((r3|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r3=HEAP[r10];r10=HEAP[r11|0];HEAP[r3|0]=r10;r9=r10;r10=HEAP[r11+4|0];HEAP[r3+4|0]=r10;r12=r10;HEAP[r3+8|0]=HEAP[r11+8|0];HEAP[r3+20|0]=0;HEAP[r3+16|0]=0;HEAP[r3+24|0]=0;HEAP[r3+28|0]=0;HEAP[r3+12|0]=0;r11=Math.imul(HEAP[r3+4|0],HEAP[r3|0]);HEAP[r7]=r11;r11=_malloc(HEAP[r7]);HEAP[r8]=r11;if((HEAP[r8]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r3+32|0]=HEAP[r8];r8=HEAP[r3+32|0];r11=Math.imul(HEAP[r3+4|0],HEAP[r3|0]);for(r13=r8,r14=r13+r11;r13<r14;r13++){HEAP[r13]=0}r11=Math.imul(HEAP[r3+4|0],HEAP[r3|0]);HEAP[r5]=r11;r11=_malloc(HEAP[r5]);HEAP[r6]=r11;if((HEAP[r6]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r3+36|0]=HEAP[r6];r6=HEAP[r3+36|0];r11=Math.imul(HEAP[r3+4|0],HEAP[r3|0]);for(r13=r6,r14=r13+r11;r13<r14;r13++){HEAP[r13]=0}r13=0;L468:do{if((r13|0)<(r12|0)){while(1){r15=0;L471:do{if((r15|0)<(r9|0)){while(1){do{if((HEAP[r2]<<24>>24|0)>=48){if(!((HEAP[r2]<<24>>24|0)<=57)){r1=338;break}r14=(HEAP[r2]<<24>>24)-48&255;r11=Math.imul(HEAP[r3|0],r13)+r15|0;HEAP[HEAP[r3+32|0]+r11|0]=r14;break}else{r1=338}}while(0);L477:do{if(r1==338){r1=0;do{if((HEAP[r2]<<24>>24|0)>=97){if(!((HEAP[r2]<<24>>24|0)<=102)){break}r14=(HEAP[r2]<<24>>24)-87&255;r11=Math.imul(HEAP[r3|0],r13)+r15|0;HEAP[HEAP[r3+32|0]+r11|0]=r14;break L477}}while(0);if(!((HEAP[r2]<<24>>24|0)>=65)){break}if(!((HEAP[r2]<<24>>24|0)<=70)){break}r14=(HEAP[r2]<<24>>24)-55&255;r11=Math.imul(HEAP[r3|0],r13)+r15|0;HEAP[HEAP[r3+32|0]+r11|0]=r14}}while(0);do{if(HEAP[r2]<<24>>24!=0){r2=r2+1|0;break}}while(0);while(1){if((HEAP[r2]<<24>>24|0)!=104){if((HEAP[r2]<<24>>24|0)!=118){break}}if((HEAP[r2]<<24>>24|0)==118){r16=1;r17=1;r18=HEAP[r3|0]+r15|0}else{r16=8;r17=(r16|0)==4?-1:0;r18=HEAP[r3|0]+r15|0}r14=(r17+r18|0)%(HEAP[r3|0]|0);if((r16|0)==8){r19=1}else{r19=(r16|0)==2?-1:0}r11=(HEAP[r3+4|0]+r13+r19|0)%(HEAP[r3+4|0]|0);r6=(Math.imul(HEAP[r3|0],r13)+r15|0)+HEAP[r3+36|0]|0;HEAP[r6]=(HEAP[r6]&255|r16)&255;r6=(Math.imul(HEAP[r3|0],r11)+r14|0)+HEAP[r3+36|0]|0;HEAP[r6]=(HEAP[r6]&255|((r16&3)<<2|(r16&12)>>2))&255;r2=r2+1|0}r15=r15+1|0;if((r15|0)>=(r9|0)){break L471}}}}while(0);r13=r13+1|0;if((r13|0)>=(r12|0)){break L468}}}}while(0);if((HEAP[r3+8|0]|0)==0){r15=0;L505:do{if((r15|0)<(HEAP[r3|0]|0)){while(1){r12=HEAP[r3+36|0]+r15|0;HEAP[r12]=(HEAP[r12]&255|2)&255;r12=(Math.imul(HEAP[r3|0],HEAP[r3+4|0]-1|0)+r15|0)+HEAP[r3+36|0]|0;HEAP[r12]=(HEAP[r12]&255|8)&255;r15=r15+1|0;if((r15|0)>=(HEAP[r3|0]|0)){break L505}}}}while(0);r13=0;if((r13|0)>=(HEAP[r3+4|0]|0)){r20=r3;STACKTOP=r4;return r20}while(1){r12=Math.imul(HEAP[r3|0],r13)+HEAP[r3+36|0]|0;HEAP[r12]=(HEAP[r12]&255|4)&255;r12=Math.imul(HEAP[r3|0],r13);r9=HEAP[r3+36|0]+(r12-1)+HEAP[r3|0]|0;HEAP[r9]=(HEAP[r9]&255|1)&255;r13=r13+1|0;if((r13|0)>=(HEAP[r3+4|0]|0)){break}}r20=r3;STACKTOP=r4;return r20}HEAP[r3+8|0]=0;r15=0;L515:do{if((r15|0)<(HEAP[r3|0]|0)){while(1){do{if((HEAP[HEAP[r3+36|0]+r15|0]&2|0)!=0){r9=Math.imul(HEAP[r3|0],HEAP[r3+4|0]-1|0)+r15|0;if((HEAP[HEAP[r3+36|0]+r9|0]&8|0)!=0){break}else{r1=364;break}}else{r1=364}}while(0);if(r1==364){r1=0;HEAP[r3+8|0]=1}r15=r15+1|0;if((r15|0)>=(HEAP[r3|0]|0)){break L515}}}}while(0);r13=0;if((r13|0)>=(HEAP[r3+4|0]|0)){r20=r3;STACKTOP=r4;return r20}while(1){r15=Math.imul(HEAP[r3|0],r13);do{if((HEAP[HEAP[r3+36|0]+r15|0]&4|0)!=0){r9=Math.imul(HEAP[r3|0],r13);if((HEAP[HEAP[r3+36|0]+(r9-1)+HEAP[r3|0]|0]&1|0)!=0){break}else{r1=369;break}}else{r1=369}}while(0);if(r1==369){r1=0;HEAP[r3+8|0]=1}r13=r13+1|0;if((r13|0)>=(HEAP[r3+4|0]|0)){break}}r20=r3;STACKTOP=r4;return r20}function _game_can_format_as_text_now(r1){return 1}function _game_text_format(r1){return 0}function _game_changed_state(r1,r2,r3){return}function _free_game(r1){var r2,r3,r4,r5,r6,r7;r2=STACKTOP;STACKTOP=STACKTOP+12|0;r3=r2;r4=r2+4;r5=r2+8;r6=r1;HEAP[r5]=HEAP[r6+32|0];if((HEAP[r5]|0)!=0){_free(HEAP[r5])}r5=HEAP[r6+36|0];HEAP[r4]=r5;if((r5|0)!=0){_free(HEAP[r4])}r4=r6;HEAP[r3]=r4;if((r4|0)==0){r7=r3;STACKTOP=r2;return}_free(HEAP[r3]);r7=r3;STACKTOP=r2;return}function _free_ui(r1){var r2,r3,r4,r5,r6,r7;r2=STACKTOP;STACKTOP=STACKTOP+12|0;r3=r2;r4=r2+4;r5=r2+8;r6=r1;HEAP[r5]=HEAP[r6+28|0];HEAP[r4]=HEAP[r5];if((HEAP[r4]|0)!=0){_free(HEAP[r4])}r4=r6;HEAP[r3]=r4;if((r4|0)==0){r7=r3;STACKTOP=r2;return}_free(HEAP[r3]);r7=r3;STACKTOP=r2;return}function _encode_ui(r1){var r2,r3,r4,r5,r6;r2=STACKTOP;STACKTOP=STACKTOP+120|0;r3=r2;r4=r1;r1=HEAP[r4+4|0];r5=HEAP[r4+8|0];r6=HEAP[r4+12|0];_sprintf(r3|0,34900,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP[tempInt]=HEAP[r4|0],HEAP[tempInt+4]=r1,HEAP[tempInt+8]=r5,HEAP[tempInt+12]=r6,tempInt));r6=_dupstr(r3|0);STACKTOP=r2;return r6}function _decode_ui(r1,r2){var r3,r4;r3=STACKTOP;r4=r1;_sscanf(r2,34900,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP[tempInt]=r4|0,HEAP[tempInt+4]=r4+4|0,HEAP[tempInt+8]=r4+8|0,HEAP[tempInt+12]=r4+12|0,tempInt));STACKTOP=r3;return}function _dup_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r2=STACKTOP;STACKTOP=STACKTOP+24|0;r3=r2;r4=r2+4;r5=r2+8;r6=r2+12;r7=r2+16;r8=r2+20;r9=r1;HEAP[r7]=40;r1=_malloc(HEAP[r7]);HEAP[r8]=r1;if((HEAP[r8]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r1=HEAP[r8];HEAP[r1|0]=HEAP[r9|0];HEAP[r1+4|0]=HEAP[r9+4|0];HEAP[r1+8|0]=HEAP[r9+8|0];HEAP[r1+12|0]=HEAP[r9+12|0];HEAP[r1+28|0]=HEAP[r9+28|0];HEAP[r1+24|0]=HEAP[r9+24|0];HEAP[r1+16|0]=HEAP[r9+16|0];HEAP[r1+20|0]=HEAP[r9+20|0];r8=Math.imul(HEAP[r9+4|0],HEAP[r9|0]);HEAP[r5]=r8;r8=_malloc(HEAP[r5]);HEAP[r6]=r8;if((HEAP[r6]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r1+32|0]=HEAP[r6];r6=HEAP[r1+32|0];r8=HEAP[r9+32|0];r5=Math.imul(HEAP[r9+4|0],HEAP[r9|0]);for(r10=r8,r11=r6,r12=r10+r5;r10<r12;r10++,r11++){HEAP[r11]=HEAP[r10]}r5=Math.imul(HEAP[r9+4|0],HEAP[r9|0]);HEAP[r3]=r5;r5=_malloc(HEAP[r3]);HEAP[r4]=r5;if((HEAP[r4]|0)!=0){HEAP[r1+36|0]=HEAP[r4];r4=HEAP[r1+36|0];r5=HEAP[r9+36|0];r3=Math.imul(HEAP[r9+4|0],HEAP[r9|0]);for(r10=r5,r11=r4,r12=r10+r3;r10<r12;r10++,r11++){HEAP[r11]=HEAP[r10]}STACKTOP=r2;return r1}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _solve_game(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+100|0;r6=r5;r7=r5+4;r8=r5+8;r9=r5+12;r10=r5+16;r11=r5+20;r12=r1;r1=r2;r2=r3;r3=Math.imul(HEAP[r12+4|0],HEAP[r12|0]);HEAP[r9]=r3;r3=_malloc(HEAP[r9]);HEAP[r10]=r3;if((HEAP[r10]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r3=HEAP[r10];L572:do{if((r2|0)!=0){r13=0;if((r13|0)>=(Math.imul(HEAP[r12+4|0],HEAP[r12|0])|0)){break}while(1){r10=HEAP[r2+r13|0]<<24>>24;r9=r10;do{if((r10|0)>=48&(r10|0)<=57){HEAP[r3+r13|0]=r9-48&255}else{r14=r10;if((r9|0)>=97&(r10|0)<=102){HEAP[r3+r13|0]=r14-87&255;break}if(!((r14|0)>=65&(r10|0)<=70)){break}HEAP[r3+r13|0]=r10-55&255}}while(0);r10=r3+r13|0;HEAP[r10]=(HEAP[r10]&255|16)&255;r13=r13+1|0;if((r13|0)>=(Math.imul(HEAP[r12+4|0],HEAP[r12|0])|0)){break L572}}}else{r10=r3;r9=HEAP[r12+32|0];r14=Math.imul(HEAP[r12+4|0],HEAP[r12|0]);for(r15=r9,r16=r10,r17=r15+r14;r15<r17;r15++,r16++){HEAP[r16]=HEAP[r15]}_net_solver(HEAP[r12|0],HEAP[r12+4|0],r3,HEAP[r12+36|0],HEAP[r12+8|0])}}while(0);r2=256;HEAP[r7]=r2;r14=_malloc(HEAP[r7]);HEAP[r8]=r14;if((r14|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r14=HEAP[r8];r8=0;r7=r8;r8=r7+1|0;HEAP[r14+r7|0]=83;r13=0;L589:do{if((r13|0)<(Math.imul(HEAP[r12+4|0],HEAP[r12|0])|0)){r7=r11|0;r10=r11|0;r9=-(r11|0)|0;r18=-(r11|0)+512|0;r19=r11;r20=r11|0;r21=-(r11|0)|0;L591:while(1){r22=HEAP[HEAP[r1+32|0]+r13|0]&255;r23=HEAP[r3+r13|0]&255;r24=r22&15;r25=r23&15;r26=(r13|0)%(HEAP[r12|0]|0);r27=(r13|0)/(HEAP[r12|0]|0)&-1;r28=0;r29=r7;do{if((r22|0)!=(r23|0)){if((r22&16|0)!=0){r29=r29+_sprintf(r29,34880,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=r26,HEAP[tempInt+4]=r27,tempInt))|0}do{if((r25|0)==((r24&8)>>3|(r24&7)<<1|0)){r28=65;r4=434;break}else{if((r25|0)==((r24&1)<<3|(r24&14)>>1|0)){r28=67;r4=434;break}if((r25|0)==((r24&3)<<2|(r24&12)>>2|0)){r28=70;r4=434;break}if((r25|0)!=(r24|0)){break L591}r28=0;break}}while(0);if(r4==434){r4=0;r29=r29+_sprintf(r29,34992,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP[tempInt]=r28,HEAP[tempInt+4]=r26,HEAP[tempInt+8]=r27,tempInt))|0}if((r23&16|0)!=0){r29=r29+_sprintf(r29,34880,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=r26,HEAP[tempInt+4]=r27,tempInt))|0}if(r29>>>0<=r10>>>0){break}if((r8+r9+r29|0)>=(r2|0)){r2=r18+r8+r29|0;r14=_srealloc(r14,r2)}r30=r14+r8|0;r31=r29-r20|0;for(r15=r19,r16=r30,r17=r15+r31;r15<r17;r15++,r16++){HEAP[r16]=HEAP[r15]}r8=r29+r21+r8|0}}while(0);r13=r13+1|0;if((r13|0)>=(Math.imul(HEAP[r12+4|0],HEAP[r12|0])|0)){break L589}}___assert_func(33560,1764,35684,34868)}}while(0);if((r8|0)>=(r2|0)){___assert_func(33560,1783,35684,34844)}HEAP[r14+r8|0]=0;r14=_srealloc(r14,r8+1|0);HEAP[r6]=r3;if((HEAP[r6]|0)==0){r32=r6;r33=r14;STACKTOP=r5;return r33}_free(HEAP[r6]);r32=r6;r33=r14;STACKTOP=r5;return r33}function _new_ui(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r2=STACKTOP;STACKTOP=STACKTOP+40|0;r3=r2;r4=r2+4;r5=r2+8;r6=r2+12;r7=r2+16;r8=r2+20;r9=r2+24;r10=r2+28;r11=r2+32;r12=r2+36;r13=r1;HEAP[r9]=52;r1=_malloc(HEAP[r9]);HEAP[r10]=r1;if((HEAP[r10]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r1=HEAP[r10];HEAP[r1+4|0]=0;HEAP[r1|0]=0;r10=(HEAP[r13|0]|0)/2&-1;HEAP[r1+8|0]=r10;HEAP[r1+16|0]=r10;r10=(HEAP[r13+4|0]|0)/2&-1;HEAP[r1+12|0]=r10;HEAP[r1+20|0]=r10;HEAP[r1+24|0]=0;HEAP[r6]=r11;HEAP[r7]=r12;HEAP[r4]=8;r10=_malloc(HEAP[r4]);HEAP[r5]=r10;if((HEAP[r5]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r8]=HEAP[r5];_gettimeofday(HEAP[r8],0);HEAP[HEAP[r6]]=HEAP[r8];HEAP[HEAP[r7]]=8;r7=_random_new(HEAP[r11],HEAP[r12]);HEAP[r1+28|0]=r7;HEAP[r3]=HEAP[r11];if((HEAP[r3]|0)==0){r14=r3;r15=r1;STACKTOP=r2;return r15}_free(HEAP[r3]);r14=r3;r15=r1;STACKTOP=r2;return r15}function _interpret_move(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44;r7=0;r8=STACKTOP;STACKTOP=STACKTOP+168|0;r9=r8;r10=r8+4;r11=r8+8;r12=r8+88;r13=r1;r1=r2;r2=r3;r3=r4;r4=r5;r5=r6;r6=-1;r14=-1;r15=0;r16=r5&8192;r17=r5&4096;r5=r5&-28673;r18=0;r19=0;L640:do{if((r5|0)==512|(r5|0)==513|(r5|0)==515|(r5|0)==518|(r5|0)==517|(r5|0)==520|(r5|0)==514){if((HEAP[r1+24|0]|0)!=0){HEAP[r1+24|0]=0;r18=35140}r20=r3-2|0;r3=r20;r4=r4-2|0;do{if((r20|0)>=0){if((r4|0)<0){break}r6=(r3|0)/(HEAP[r2+20|0]|0)&-1;r14=(r4|0)/(HEAP[r2+20|0]|0)&-1;do{if(!((r6|0)>=(HEAP[r13|0]|0))){if((r14|0)>=(HEAP[r13+4|0]|0)){break}r6=(HEAP[r1|0]+r6|0)%(HEAP[r13|0]|0);r14=(HEAP[r1+4|0]+r14|0)%(HEAP[r13+4|0]|0);do{if(!(((r3|0)%(HEAP[r2+20|0]|0)|0)>=(HEAP[r2+20|0]-1|0))){if(((r4|0)%(HEAP[r2+20|0]|0)|0)>=(HEAP[r2+20|0]-1|0)){break}if((r5|0)==513|(r5|0)==514){r19=4;r7=520;break L640}if((r5|0)==512){HEAP[r1+32|0]=r6;HEAP[r1+36|0]=r14;HEAP[r1+40|0]=(r3|0)%(HEAP[r2+20|0]|0);HEAP[r1+44|0]=(r4|0)%(HEAP[r2+20|0]|0);HEAP[r1+48|0]=0;r21=r18;r22=r21;STACKTOP=r8;return r22}if((r5|0)!=515){if((r5|0)!=518){r7=519;break L640}if((HEAP[r1+48|0]|0)!=0){r21=r18;r22=r21;STACKTOP=r8;return r22}r6=HEAP[r1+32|0];r14=HEAP[r1+36|0];if((r5|0)==518){r19=1;break L640}else{r19=3;break L640}}r6=HEAP[r1+32|0];r14=HEAP[r1+36|0];r23=r3-Math.imul(HEAP[r2+20|0],HEAP[r1+32|0])|0;r24=r4-Math.imul(HEAP[r2+20|0],HEAP[r1+36|0])|0;r25=HEAP[r1+40|0];r26=HEAP[r1+44|0];r27=HEAP[r1+44|0];r28=HEAP[r2+20|0]-1+ -HEAP[r1+40|0]|0;r29=HEAP[r2+20|0]-1+ -HEAP[r1+40|0]|0;r30=HEAP[r2+20|0]-1+ -HEAP[r1+44|0]|0;r31=HEAP[r2+20|0]-1+ -HEAP[r1+44|0]|0;r32=HEAP[r1+40|0];r33=Math.imul(r23-r25|0,r23-r25|0)+Math.imul(r24-r26|0,r24-r26|0)|0;r26=Math.imul(r23-r27|0,r23-r27|0)+Math.imul(r24-r28|0,r24-r28|0)|0;r25=Math.imul(r23-r29|0,r23-r29|0)+Math.imul(r24-r30|0,r24-r30|0)|0;r34=Math.imul(r23-r31|0,r23-r31|0)+Math.imul(r24-r32|0,r24-r32|0)|0;if((((r33|0)<(r26|0)?r33:r26)|0)<(((r25|0)<(r34|0)?r25:r34)|0)){r35=(r33|0)<(r26|0)?r33:r26}else{r35=(r25|0)<(r34|0)?r25:r34}r34=r35;if((r33|0)==(r34|0)){r21=r18;r22=r21;STACKTOP=r8;return r22}if((r25|0)==(r34|0)){r19=2;HEAP[r1+40|0]=r29;HEAP[r1+44|0]=r30;HEAP[r1+48|0]=1;r7=519;break L640}if((r26|0)==(r34|0)){r19=1;HEAP[r1+40|0]=r27;HEAP[r1+44|0]=r28;HEAP[r1+48|0]=1;r7=519;break L640}else{r19=3;HEAP[r1+40|0]=r31;HEAP[r1+44|0]=r32;HEAP[r1+48|0]=1;r7=519;break L640}}}while(0);r21=r18;r22=r21;STACKTOP=r8;return r22}}while(0);r21=r18;r22=r21;STACKTOP=r8;return r22}}while(0);r21=r18;r22=r21;STACKTOP=r8;return r22}else{r20=r5;if(!((r5|0)==521|(r5|0)==522|(r5|0)==524|(r5|0)==523)){if(!((r20|0)==97|(r5|0)==115|(r5|0)==100|(r5|0)==65|(r5|0)==83|(r5|0)==68|(r5|0)==102|(r5|0)==70|(r5|0)==525|(r5|0)==526)){if((r5|0)==106|(r5|0)==74){r19=5;break}r21=r18;r22=r21;STACKTOP=r8;return r22}r6=HEAP[r1+16|0];r14=HEAP[r1+20|0];do{if((r5|0)==97|(r5|0)==65|(r5|0)==525){r19=1}else{if((r5|0)==115|(r5|0)==83|(r5|0)==526){r19=4;break}if((r5|0)==100|(r5|0)==68){r19=3;break}if(!((r5|0)==102|(r5|0)==70)){break}r19=2}}while(0);HEAP[r1+24|0]=1;r7=519;break}if((r20|0)==523){r15=4}else if((r20|0)==524){r15=1}else if((r20|0)==521){r15=2}else if((r20|0)==522){r15=8}else{r21=r18;r22=r21;STACKTOP=r8;return r22}do{if((r16|0)!=0){if((r17|0)!=0){r19=8;break L640}if((r16|0)==0){break}r19=6;break L640}}while(0);if((r17|0)!=0){r19=7;break}else{r19=9;break}}}while(0);do{if(r7==519){if((r19|0)==4){r7=520;break}else{break}}}while(0);if(r7==520){_sprintf(r11|0,35104,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=r6,HEAP[tempInt+4]=r14,tempInt));r21=_dupstr(r11|0);r22=r21;STACKTOP=r8;return r22}if((r19|0)==1|(r19|0)==3|(r19|0)==2){r11=Math.imul(HEAP[r13|0],r14)+r6|0;if((HEAP[HEAP[r13+32|0]+r11|0]&16|0)!=0){r21=r18;r22=r21;STACKTOP=r8;return r22}if((r19|0)==1){r36=65}else{r36=(r19|0)==3?67:70}_sprintf(r12|0,35076,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP[tempInt]=r36,HEAP[tempInt+4]=r6,HEAP[tempInt+8]=r14,tempInt));r21=_dupstr(r12|0);r22=r21;STACKTOP=r8;return r22}if((r19|0)==5){r12=Math.imul(HEAP[r13|0]*25&-1,HEAP[r13+4|0])+3|0;HEAP[r9]=r12;r14=_malloc(HEAP[r9]);HEAP[r10]=r14;if((HEAP[r10]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r14=HEAP[r10];r10=r14;r9=r10;r10=r9+1|0;HEAP[r9]=74;r9=0;L754:do{if((r9|0)<(HEAP[r13+4|0]|0)){while(1){r6=0;r36=r9;L757:do{if((r6|0)<(HEAP[r13|0]|0)){r11=r36;while(1){r7=Math.imul(HEAP[r13|0],r11)+r6|0;do{if((HEAP[HEAP[r13+32|0]+r7|0]&16|0)==0){r17=_random_upto(HEAP[r1+28|0],4);if((r17|0)==0){break}r10=r10+_sprintf(r10,34992,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP[tempInt]=HEAP[r17-1+34976|0]<<24>>24,HEAP[tempInt+4]=r6,HEAP[tempInt+8]=r9,tempInt))|0}}while(0);r6=r6+1|0;r7=r9;if((r6|0)<(HEAP[r13|0]|0)){r11=r7}else{r37=r7;break L757}}}else{r37=r36}}while(0);r9=r37+1|0;if((r9|0)>=(HEAP[r13+4|0]|0)){break L754}}}}while(0);r9=r10;r10=r9+1|0;HEAP[r9]=0;if((r10-r14|0)>=(r12|0)){___assert_func(33560,2178,35872,34928)}r14=_srealloc(r14,r10-r14|0);r21=r14;r22=r21;STACKTOP=r8;return r22}if(!((r19|0)==6|(r19|0)==7|(r19|0)==8|(r19|0)==9)){r21=0;r22=r21;STACKTOP=r8;return r22}if((r15|0)==0){___assert_func(33560,2184,35872,34916)}if((r19|0)==6|(r19|0)==8){if((HEAP[r13+8|0]|0)==0){r21=r18;r22=r21;STACKTOP=r8;return r22}if((r15|0)==1){r38=1}else{r38=(r15|0)==4?-1:0}HEAP[r1|0]=(HEAP[r13|0]+HEAP[r1|0]+r38|0)%(HEAP[r13|0]|0);if((r15|0)==8){r39=1}else{r39=(r15|0)==2?-1:0}HEAP[r1+4|0]=(HEAP[r13+4|0]+HEAP[r1+4|0]+r39|0)%(HEAP[r13+4|0]|0)}r39=r19;if((r19|0)==7|(r39|0)==8){if((r15|0)==1){r40=1}else{r40=(r15|0)==4?-1:0}HEAP[r1+8|0]=(HEAP[r13|0]+HEAP[r1+8|0]+r40|0)%(HEAP[r13|0]|0);if((r15|0)==8){r41=1}else{r41=(r15|0)==2?-1:0}HEAP[r1+12|0]=(HEAP[r13+4|0]+HEAP[r1+12|0]+r41|0)%(HEAP[r13+4|0]|0);r42=r19}else{r42=r39}if((r42|0)==9){if((r15|0)==1){r43=1}else{r43=(r15|0)==4?-1:0}HEAP[r1+16|0]=(HEAP[r13|0]+HEAP[r1+16|0]+r43|0)%(HEAP[r13|0]|0);if((r15|0)==8){r44=1}else{r44=(r15|0)==2?-1:0}HEAP[r1+20|0]=(HEAP[r13+4|0]+HEAP[r1+20|0]+r44|0)%(HEAP[r13+4|0]|0);HEAP[r1+24|0]=1}r21=35140;r22=r21;STACKTOP=r8;return r22}function _game_compute_size(r1,r2,r3,r4){var r5;r5=r1;r1=r2;r2=Math.imul(HEAP[r5|0],r1)+3|0;HEAP[r3]=r2;r2=Math.imul(HEAP[r5+4|0],r1)+3|0;HEAP[r4]=r2;return}function _game_set_size(r1,r2,r3,r4){HEAP[r2+20|0]=r4;return}function _game_free_drawstate(r1,r2){var r3,r4,r5,r6;r1=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r1;r4=r1+4;r5=r2;HEAP[r4]=HEAP[r5+24|0];if((HEAP[r4]|0)!=0){_free(HEAP[r4])}r4=r5;HEAP[r3]=r4;if((r4|0)==0){r6=r3;STACKTOP=r1;return}_free(HEAP[r3]);r6=r3;STACKTOP=r1;return}function _execute_move(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+16|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r1;r1=r2;HEAP[r6]=-1;HEAP[r7]=-1;r2=_dup_game(r9);do{if((HEAP[r1|0]<<24>>24|0)==74){r3=592}else{if((HEAP[r1|0]<<24>>24|0)==83){r3=592;break}r10=0;break}}while(0);if(r3==592){if((HEAP[r1|0]<<24>>24|0)==83){HEAP[r2+28|0]=1}r1=r1+1|0;if((HEAP[r1]<<24>>24|0)==59){r1=r1+1|0}r10=1}HEAP[r2+24|0]=0;HEAP[r2+20|0]=0;HEAP[r2+16|0]=0;L833:do{if(HEAP[r1]<<24>>24!=0){L834:while(1){do{if((HEAP[r1|0]<<24>>24|0)!=65){if((HEAP[r1|0]<<24>>24|0)==67){break}if((HEAP[r1|0]<<24>>24|0)==70){break}if((HEAP[r1|0]<<24>>24|0)!=76){break L834}}}while(0);if(!((_sscanf(r1+1|0,33416,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP[tempInt]=r6,HEAP[tempInt+4]=r7,HEAP[tempInt+8]=r8,tempInt))|0)>=2&(HEAP[r6]|0)>=0)){break}if((HEAP[r6]|0)>=(HEAP[r9|0]|0)){break}if(!((HEAP[r7]|0)>=0)){break}if((HEAP[r7]|0)>=(HEAP[r9+4|0]|0)){break}r11=Math.imul(HEAP[r2|0],HEAP[r7]);r12=HEAP[HEAP[r2+32|0]+r11+HEAP[r6]|0]&255;do{if((HEAP[r1|0]<<24>>24|0)==65){r11=Math.imul(HEAP[r2|0],HEAP[r7]);HEAP[HEAP[r2+32|0]+r11+HEAP[r6]|0]=((r12&8)>>3|(r12&7)<<1)&255;if((r10|0)!=0){break}HEAP[r2+24|0]=1}else{if((HEAP[r1|0]<<24>>24|0)==70){r11=Math.imul(HEAP[r2|0],HEAP[r7]);HEAP[HEAP[r2+32|0]+r11+HEAP[r6]|0]=((r12&3)<<2|(r12&12)>>2)&255;if((r10|0)!=0){break}HEAP[r2+24|0]=2;break}if((HEAP[r1|0]<<24>>24|0)==67){r11=Math.imul(HEAP[r2|0],HEAP[r7]);HEAP[HEAP[r2+32|0]+r11+HEAP[r6]|0]=((r12&1)<<3|(r12&14)>>1)&255;if((r10|0)!=0){break}HEAP[r2+24|0]=-1;break}else{if((HEAP[r1|0]<<24>>24|0)!=76){r3=617;break L834}r11=Math.imul(HEAP[r2|0],HEAP[r7])+HEAP[r2+32|0]+HEAP[r6]|0;HEAP[r11]=(HEAP[r11]&255^16)&255;break}}}while(0);r1=r1+HEAP[r8]+1|0;if((HEAP[r1]<<24>>24|0)==59){r1=r1+1|0}if(HEAP[r1]<<24>>24==0){break L833}}if(r3==617){___assert_func(33560,2243,35904,35144)}_free_game(r2);r13=0;r14=r13;STACKTOP=r4;return r14}}while(0);L867:do{if((r10|0)==0){do{if((HEAP[r6]|0)!=-1){if((HEAP[r7]|0)==-1){break}HEAP[r2+16|0]=HEAP[r6];HEAP[r2+20|0]=HEAP[r7];break L867}}while(0);_free_game(r2);r13=0;r14=r13;STACKTOP=r4;return r14}}while(0);r7=_compute_active(r2,0,0);r6=1;r10=0;L875:do{if((r10|0)<(HEAP[r2|0]|0)){L876:while(1){r3=0;L878:do{if((r3|0)<(HEAP[r2+4|0]|0)){while(1){r1=Math.imul(HEAP[r2|0],r3)+r10|0;if((HEAP[HEAP[r2+32|0]+r1|0]&15|0)!=0){r1=r7+Math.imul(HEAP[r2|0],r3)+r10|0;if(HEAP[r1]<<24>>24==0){break L876}}r3=r3+1|0;if((r3|0)>=(HEAP[r2+4|0]|0)){break L878}}}}while(0);r10=r10+1|0;if((r10|0)>=(HEAP[r2|0]|0)){break L875}}r6=0}}while(0);r10=r7;HEAP[r5]=r10;if((r10|0)!=0){_free(HEAP[r5])}if((r6|0)!=0){HEAP[r2+12|0]=1}r13=r2;r14=r13;STACKTOP=r4;return r14}function _game_colours(r1,r2){var r3,r4,r5,r6;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r3+4;HEAP[r4]=84;r6=_malloc(HEAP[r4]);HEAP[r5]=r6;if((HEAP[r5]|0)!=0){r6=HEAP[r5];HEAP[r2]=7;_frontend_default_colour(r1,r6|0);HEAP[r6+36|0]=0;HEAP[r6+40|0]=0;HEAP[r6+44|0]=0;HEAP[r6+60|0]=0;HEAP[r6+64|0]=1;HEAP[r6+68|0]=1;HEAP[r6+72|0]=1;HEAP[r6+76|0]=0;HEAP[r6+80|0]=0;HEAP[r6+48|0]=0;HEAP[r6+52|0]=0;HEAP[r6+56|0]=1;HEAP[r6+24|0]=HEAP[r6|0]*.5;HEAP[r6+28|0]=HEAP[r6+4|0]*.5;HEAP[r6+32|0]=HEAP[r6+8|0]*.5;HEAP[r6+12|0]=HEAP[r6|0]*.75;HEAP[r6+16|0]=HEAP[r6+4|0]*.75;HEAP[r6+20|0]=HEAP[r6+8|0]*.75;STACKTOP=r3;return r6}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _game_new_drawstate(r1,r2){var r3,r4,r5,r6,r7;r1=STACKTOP;STACKTOP=STACKTOP+16|0;r3=r1;r4=r1+4;r5=r1+8;r6=r1+12;r7=r2;HEAP[r5]=28;r2=_malloc(HEAP[r5]);HEAP[r6]=r2;if((HEAP[r6]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r2=HEAP[r6];HEAP[r2|0]=0;HEAP[r2+4|0]=HEAP[r7|0];HEAP[r2+8|0]=HEAP[r7+4|0];HEAP[r2+16|0]=-1;HEAP[r2+12|0]=-1;r6=Math.imul(HEAP[r7+4|0],HEAP[r7|0]);HEAP[r3]=r6;r6=_malloc(HEAP[r3]);HEAP[r4]=r6;if((HEAP[r4]|0)!=0){HEAP[r2+24|0]=HEAP[r4];HEAP[r2+20|0]=0;r4=HEAP[r2+24|0];r6=Math.imul(HEAP[r7+4|0],HEAP[r7|0]);for(r7=r4,r3=r7+r6;r7<r3;r7++){HEAP[r7]=-1}STACKTOP=r1;return r2}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _game_redraw(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187,r188,r189,r190,r191,r192,r193,r194,r195,r196,r197,r198,r199,r200,r201,r202,r203,r204,r205,r206,r207,r208,r209,r210,r211,r212,r213,r214,r215,r216,r217,r218,r219,r220,r221,r222,r223,r224,r225,r226,r227,r228,r229,r230,r231,r232,r233,r234,r235,r236,r237,r238,r239,r240,r241,r242,r243,r244,r245,r246,r247,r248,r249,r250,r251,r252,r253,r254,r255,r256,r257,r258;r9=0;r10=STACKTOP;STACKTOP=STACKTOP+1116|0;r11=r10;r12=r10+4;r13=r10+8;r14=r10+12;r15=r10+16;r16=r10+20;r17=r10+24;r18=r10+28;r19=r10+32;r20=r10+36;r21=r10+40;r22=r10+44;r23=r10+48;r24=r10+52;r25=r10+56;r26=r10+60;r27=r10+64;r28=r10+68;r29=r10+72;r30=r10+76;r31=r10+80;r32=r10+84;r33=r10+88;r34=r10+92;r35=r10+96;r36=r10+100;r37=r10+104;r38=r10+108;r39=r10+112;r40=r10+116;r41=r10+120;r42=r10+124;r43=r10+128;r44=r10+132;r45=r10+136;r46=r10+140;r47=r10+144;r48=r10+148;r49=r10+152;r50=r10+156;r51=r10+160;r52=r10+164;r53=r10+168;r54=r10+172;r55=r10+176;r56=r10+180;r57=r10+184;r58=r10+188;r59=r10+192;r60=r10+196;r61=r10+200;r62=r10+204;r63=r10+208;r64=r10+212;r65=r10+216;r66=r10+220;r67=r10+224;r68=r10+228;r69=r10+232;r70=r10+236;r71=r10+240;r72=r10+244;r73=r10+248;r74=r10+252;r75=r10+256;r76=r10+260;r77=r10+264;r78=r10+268;r79=r10+272;r80=r10+276;r81=r10+280;r82=r10+284;r83=r10+288;r84=r10+292;r85=r10+296;r86=r10+300;r87=r10+304;r88=r10+308;r89=r10+312;r90=r10+316;r91=r10+320;r92=r10+324;r93=r10+328;r94=r10+332;r95=r10+336;r96=r10+340;r97=r10+344;r98=r10+348;r99=r10+352;r100=r10+356;r101=r10+360;r102=r10+364;r103=r10+368;r104=r10+372;r105=r10+376;r106=r10+380;r107=r10+384;r108=r10+388;r109=r10+392;r110=r10+396;r111=r10+400;r112=r10+404;r113=r10+408;r114=r10+412;r115=r10+416;r116=r10+420;r117=r10+424;r118=r10+428;r119=r10+432;r120=r10+436;r121=r10+440;r122=r10+444;r123=r10+448;r124=r10+452;r125=r10+456;r126=r10+460;r127=r10+464;r128=r10+468;r129=r10+472;r130=r10+476;r131=r10+480;r132=r10+484;r133=r10+488;r134=r10+492;r135=r10+496;r136=r10+500;r137=r10+504;r138=r10+508;r139=r10+512;r140=r10+516;r141=r10+520;r142=r10+524;r143=r10+528;r144=r10+532;r145=r10+536;r146=r10+540;r147=r10+544;r148=r10+548;r149=r10+552;r150=r10+556;r151=r10+560;r152=r10+564;r153=r10+568;r154=r10+572;r155=r10+576;r156=r10+580;r157=r10+584;r158=r10+588;r159=r10+592;r160=r10+596;r161=r10+600;r162=r10+604;r163=r10+608;r164=r10+612;r165=r10+616;r166=r10+632;r167=r10+636;r168=r10+640;r169=r10+644;r170=r10+648;r171=r10+652;r172=r10+656;r173=r10+660;r174=r10+664;r175=r10+668;r176=r10+672;r177=r10+676;r178=r10+680;r179=r10+684;r180=r10+688;r181=r10+692;r182=r10+696;r183=r10+700;r184=r10+704;r185=r10+708;r186=r10+712;r187=r10+744;r188=r10+748;r189=r10+752;r190=r10+756;r191=r10+760;r192=r10+764;r193=r10+768;r194=r10+772;r195=r10+776;r196=r10+780;r197=r10+784;r198=r10+788;r199=r10+792;r200=r10+796;r201=r10+800;r202=r10+804;r203=r10+808;r204=r10+812;r205=r10+816;r206=r10+820;r207=r10+824;r208=r10+828;r209=r10+832;r210=r10+836;r211=r10+840;r212=r10+844;r213=r10+848;r214=r10+852;r215=r10+856;r216=r10+860;r217=r1;r1=r2;r2=r3;r3=r4;r4=r5;r5=r6;r6=r7;r7=r8;r8=0;r218=0;do{if((HEAP[r1|0]|0)!=0){if((HEAP[r5|0]|0)!=(HEAP[r1+12|0]|0)){r9=655;break}if((HEAP[r5+4|0]|0)!=(HEAP[r1+16|0]|0)){r9=655;break}else{break}}else{r9=655}}while(0);L909:do{if(r9==655){HEAP[r1|0]=1;r219=Math.imul(HEAP[r3|0],HEAP[r1+20|0])+3|0;r220=Math.imul(HEAP[r3+4|0],HEAP[r1+20|0])+3|0;HEAP[r210]=r217;HEAP[r211]=0;HEAP[r212]=0;HEAP[r213]=r219;HEAP[r214]=r220;HEAP[r215]=0;FUNCTION_TABLE[HEAP[HEAP[HEAP[r210]|0]+4|0]](HEAP[HEAP[r210]+4|0],HEAP[r211],HEAP[r212],HEAP[r213],HEAP[r214],HEAP[r215]);HEAP[r1+12|0]=HEAP[r5|0];HEAP[r1+16|0]=HEAP[r5+4|0];r8=1;r220=Math.imul(HEAP[r3|0],HEAP[r1+20|0])+3|0;r219=Math.imul(HEAP[r3+4|0],HEAP[r1+20|0])+3|0;HEAP[r205]=r217;HEAP[r206]=0;HEAP[r207]=0;HEAP[r208]=r220;HEAP[r209]=r219;if((HEAP[HEAP[HEAP[r205]|0]+20|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r205]|0]+20|0]](HEAP[HEAP[r205]+4|0],HEAP[r206],HEAP[r207],HEAP[r208],HEAP[r209])}r219=0;while(1){r221=0;L916:do{if((r221|0)<(HEAP[r1+4|0]|0)){while(1){do{if((r221+1|0)<(HEAP[r1+4|0]|0)){r220=Math.imul(HEAP[r3|0],(HEAP[r1+16|0]|0)%(HEAP[r1+8|0]|0));if((HEAP[HEAP[r3+36|0]+(HEAP[r1+12|0]+r221|0)%(HEAP[r1+4|0]|0)+r220|0]&1|0)!=0){_draw_barrier_corner(r217,r1,r221,-1,1,1,r219)}r220=Math.imul(HEAP[r3|0],(HEAP[r1+8|0]-1+HEAP[r1+16|0]|0)%(HEAP[r1+8|0]|0));if((HEAP[HEAP[r3+36|0]+(HEAP[r1+12|0]+r221|0)%(HEAP[r1+4|0]|0)+r220|0]&1|0)==0){break}_draw_barrier_corner(r217,r1,r221,HEAP[r1+8|0],1,-1,r219)}}while(0);r220=Math.imul(HEAP[r3|0],(HEAP[r1+16|0]|0)%(HEAP[r1+8|0]|0));if((HEAP[HEAP[r3+36|0]+(HEAP[r1+12|0]+r221|0)%(HEAP[r1+4|0]|0)+r220|0]&2|0)!=0){_draw_barrier_corner(r217,r1,r221,-1,-1,1,r219);_draw_barrier_corner(r217,r1,r221,-1,1,1,r219);_draw_barrier(r217,r1,r221,-1,8,r219)}r220=Math.imul(HEAP[r3|0],(HEAP[r1+8|0]-1+HEAP[r1+16|0]|0)%(HEAP[r1+8|0]|0));if((HEAP[HEAP[r3+36|0]+(HEAP[r1+12|0]+r221|0)%(HEAP[r1+4|0]|0)+r220|0]&8|0)!=0){_draw_barrier_corner(r217,r1,r221,HEAP[r1+8|0],-1,-1,r219);_draw_barrier_corner(r217,r1,r221,HEAP[r1+8|0],1,-1,r219);_draw_barrier(r217,r1,r221,HEAP[r1+8|0],2,r219)}r221=r221+1|0;if((r221|0)>=(HEAP[r1+4|0]|0)){break L916}}}}while(0);r222=0;L933:do{if((r222|0)<(HEAP[r1+8|0]|0)){while(1){do{if((r222+1|0)<(HEAP[r1+8|0]|0)){r220=Math.imul(HEAP[r3|0],(HEAP[r1+16|0]+r222|0)%(HEAP[r1+8|0]|0));if((HEAP[HEAP[r3+36|0]+(HEAP[r1+12|0]|0)%(HEAP[r1+4|0]|0)+r220|0]&8|0)!=0){_draw_barrier_corner(r217,r1,-1,r222,1,1,r219)}r220=Math.imul(HEAP[r3|0],(HEAP[r1+16|0]+r222|0)%(HEAP[r1+8|0]|0));if((HEAP[HEAP[r3+36|0]+(HEAP[r1+4|0]-1+HEAP[r1+12|0]|0)%(HEAP[r1+4|0]|0)+r220|0]&8|0)==0){break}_draw_barrier_corner(r217,r1,HEAP[r1+4|0],r222,-1,1,r219)}}while(0);r220=Math.imul(HEAP[r3|0],(HEAP[r1+16|0]+r222|0)%(HEAP[r1+8|0]|0));if((HEAP[HEAP[r3+36|0]+(HEAP[r1+12|0]|0)%(HEAP[r1+4|0]|0)+r220|0]&4|0)!=0){_draw_barrier_corner(r217,r1,-1,r222,1,-1,r219);_draw_barrier_corner(r217,r1,-1,r222,1,1,r219);_draw_barrier(r217,r1,-1,r222,1,r219)}r220=Math.imul(HEAP[r3|0],(HEAP[r1+16|0]+r222|0)%(HEAP[r1+8|0]|0));if((HEAP[HEAP[r3+36|0]+(HEAP[r1+4|0]-1+HEAP[r1+12|0]|0)%(HEAP[r1+4|0]|0)+r220|0]&1|0)!=0){_draw_barrier_corner(r217,r1,HEAP[r1+4|0],r222,-1,-1,r219);_draw_barrier_corner(r217,r1,HEAP[r1+4|0],r222,-1,1,r219);_draw_barrier(r217,r1,HEAP[r1+4|0],r222,4,r219)}r222=r222+1|0;if((r222|0)>=(HEAP[r1+8|0]|0)){break L933}}}}while(0);r220=r219+1|0;r219=r220;if((r220|0)>=2){break L909}}}}while(0);r209=-1;r208=-1;if((r4|0)==-1){r207=r2;r223=HEAP[r207+24|0];r224=r207}else{r223=HEAP[r3+24|0];r224=r2}r207=r223;do{if((r224|0)!=0){if(r6>=.12999999523162842){break}if((r207|0)==0){break}if((r4|0)==-1){r225=HEAP[r2+16|0]}else{r225=HEAP[r3+16|0]}r208=r225;if((r4|0)==-1){r226=HEAP[r2+20|0]}else{r226=HEAP[r3+20|0]}r209=r226;r218=r6/.12999999523162842*(Math.imul(r4,r207)|0)*90;r3=r2}}while(0);r2=-1;if(r7>0){r2=r7/.07000000029802322&-1}r7=_compute_active(r3,HEAP[r5+8|0],HEAP[r5+12|0]);r221=0;L971:do{if((r221|0)<(HEAP[r1+4|0]|0)){r207=r165|0;r4=r165+4|0;r6=r165+8|0;r226=r165+12|0;r225=r165|0;r224=r165|0;r223=r186|0;r206=r186+4|0;r205=r186+8|0;r215=r186+28|0;r214=r186+12|0;r213=r165|0;r212=r186|0;while(1){r222=0;L975:do{if((r222|0)<(HEAP[r1+8|0]|0)){while(1){r211=Math.imul(HEAP[r3|0],(HEAP[r1+16|0]+r222|0)%(HEAP[r1+8|0]|0));r210=HEAP[HEAP[r3+32|0]+(HEAP[r1+12|0]+r221|0)%(HEAP[r1+4|0]|0)+r211|0]&255;r211=Math.imul(HEAP[r3|0],(HEAP[r1+16|0]+r222|0)%(HEAP[r1+8|0]|0));r219=(HEAP[r7+(HEAP[r1+12|0]+r221|0)%(HEAP[r1+4|0]|0)+r211|0]&255|r210)&255;if(((HEAP[r1+12|0]+r221|0)%(HEAP[r1+4|0]|0)|0)==(HEAP[r5+8|0]|0)){r227=((HEAP[r1+16|0]+r222|0)%(HEAP[r1+8|0]|0)|0)==(HEAP[r5+12|0]|0)}else{r227=0}r210=r227&1;if(((HEAP[r1+12|0]+r221|0)%(HEAP[r1+4|0]|0)|0)==(r208|0)){r228=((HEAP[r1+16|0]+r222|0)%(HEAP[r1+8|0]|0)|0)==(r209|0)}else{r228=0}r211=r228&1;do{if((HEAP[r5+24|0]|0)!=0){if(((HEAP[r1+12|0]+r221|0)%(HEAP[r1+4|0]|0)|0)!=(HEAP[r5+16|0]|0)){r229=0;break}r229=((HEAP[r1+16|0]+r222|0)%(HEAP[r1+8|0]|0)|0)==(HEAP[r5+20|0]|0)}else{r229=0}}while(0);r220=r229&1;do{if((r2|0)>=0){r230=(HEAP[r1+4|0]+HEAP[r5+8|0]+ -HEAP[r1+12|0]|0)%(HEAP[r1+4|0]|0);r231=(HEAP[r1+8|0]+HEAP[r5+12|0]+ -HEAP[r1+16|0]|0)%(HEAP[r1+8|0]|0);if((r221|0)<(r230|0)){r232=r230-r221|0}else{r232=r221-r230|0}r230=r232;if((r222|0)<(r231|0)){r233=r231-r222|0}else{r233=r222-r231|0}r231=r233;r234=(r230|0)>(r231|0)?r230:r231;if(!((r2|0)>=(r234|0))){break}if((r2|0)>=(r234+4|0)){break}r231=r2-r234&1;r231=(r231|0)!=0?16:0;r219=(r219&255&-17|r231)&255}}while(0);do{if((r8|0)!=0){r9=722}else{r231=Math.imul(HEAP[r3|0],r222)+r221|0;if((HEAP[HEAP[r1+24|0]+r231|0]&255|0)!=(r219&255|0)){r9=722;break}r231=Math.imul(HEAP[r3|0],r222)+r221|0;if((HEAP[HEAP[r1+24|0]+r231|0]&255|0)==255){r9=722;break}if((r210|0)!=0){r9=722;break}if((r211|0)!=0){r9=722;break}if((r220|0)!=0){r9=722;break}else{break}}}while(0);L1007:do{if(r9==722){r9=0;HEAP[r154]=r217;HEAP[r155]=r3;HEAP[r156]=r1;HEAP[r157]=r221;HEAP[r158]=r222;HEAP[r159]=r219&255;HEAP[r160]=r210;HEAP[r161]=(r211|0)!=0?r218:0;HEAP[r162]=r220;r231=Math.imul(HEAP[r157],HEAP[HEAP[r156]+20|0])+1|0;HEAP[r163]=r231;r231=Math.imul(HEAP[r158],HEAP[HEAP[r156]+20|0])+1|0;HEAP[r164]=r231;r231=HEAP[r163];r234=HEAP[r164];r230=HEAP[HEAP[r156]+20|0]+1|0;r235=HEAP[HEAP[r156]+20|0]+1|0;HEAP[r149]=HEAP[r154];HEAP[r150]=r231;HEAP[r151]=r234;HEAP[r152]=r230;HEAP[r153]=r235;FUNCTION_TABLE[HEAP[HEAP[HEAP[r149]|0]+24|0]](HEAP[HEAP[r149]+4|0],HEAP[r150],HEAP[r151],HEAP[r152],HEAP[r153]);r235=HEAP[r163];r230=HEAP[r164];r234=HEAP[HEAP[r156]+20|0]+1|0;r231=HEAP[HEAP[r156]+20|0]+1|0;HEAP[r143]=HEAP[r154];HEAP[r144]=r235;HEAP[r145]=r230;HEAP[r146]=r234;HEAP[r147]=r231;HEAP[r148]=2;FUNCTION_TABLE[HEAP[HEAP[HEAP[r143]|0]+4|0]](HEAP[HEAP[r143]+4|0],HEAP[r144],HEAP[r145],HEAP[r146],HEAP[r147],HEAP[r148]);r231=HEAP[r163]+1|0;r234=HEAP[r164]+1|0;r230=HEAP[HEAP[r156]+20|0]-1|0;r235=HEAP[HEAP[r156]+20|0]-1|0;r236=(HEAP[r159]&16|0)!=0?1:0;HEAP[r137]=HEAP[r154];HEAP[r138]=r231;HEAP[r139]=r234;HEAP[r140]=r230;HEAP[r141]=r235;HEAP[r142]=r236;FUNCTION_TABLE[HEAP[HEAP[HEAP[r137]|0]+4|0]](HEAP[HEAP[r137]+4|0],HEAP[r138],HEAP[r139],HEAP[r140],HEAP[r141],HEAP[r142]);if((HEAP[r162]|0)!=0){r236=((HEAP[HEAP[r156]+20|0]|0)/8&-1)+HEAP[r163]|0;r235=((HEAP[HEAP[r156]+20|0]|0)/8&-1)+HEAP[r164]|0;r230=((HEAP[HEAP[r156]+20|0]|0)/8&-1)+HEAP[r163]|0;r234=HEAP[HEAP[r156]+20|0]+HEAP[r164]+ -((HEAP[HEAP[r156]+20|0]|0)/8&-1)|0;r231=(HEAP[r159]&16|0)!=0?0:1;HEAP[r131]=HEAP[r154];HEAP[r132]=r236;HEAP[r133]=r235;HEAP[r134]=r230;HEAP[r135]=r234;HEAP[r136]=r231;FUNCTION_TABLE[HEAP[HEAP[HEAP[r131]|0]+8|0]](HEAP[HEAP[r131]+4|0],HEAP[r132],HEAP[r133],HEAP[r134],HEAP[r135],HEAP[r136]);r231=((HEAP[HEAP[r156]+20|0]|0)/8&-1)+HEAP[r163]|0;r234=((HEAP[HEAP[r156]+20|0]|0)/8&-1)+HEAP[r164]|0;r230=HEAP[HEAP[r156]+20|0]+HEAP[r163]+ -((HEAP[HEAP[r156]+20|0]|0)/8&-1)|0;r235=((HEAP[HEAP[r156]+20|0]|0)/8&-1)+HEAP[r164]|0;r236=(HEAP[r159]&16|0)!=0?0:1;HEAP[r125]=HEAP[r154];HEAP[r126]=r231;HEAP[r127]=r234;HEAP[r128]=r230;HEAP[r129]=r235;HEAP[r130]=r236;FUNCTION_TABLE[HEAP[HEAP[HEAP[r125]|0]+8|0]](HEAP[HEAP[r125]+4|0],HEAP[r126],HEAP[r127],HEAP[r128],HEAP[r129],HEAP[r130]);r236=HEAP[HEAP[r156]+20|0]+HEAP[r163]+ -((HEAP[HEAP[r156]+20|0]|0)/8&-1)|0;r235=((HEAP[HEAP[r156]+20|0]|0)/8&-1)+HEAP[r164]|0;r230=HEAP[HEAP[r156]+20|0]+HEAP[r163]+ -((HEAP[HEAP[r156]+20|0]|0)/8&-1)|0;r234=HEAP[HEAP[r156]+20|0]+HEAP[r164]+ -((HEAP[HEAP[r156]+20|0]|0)/8&-1)|0;r231=(HEAP[r159]&16|0)!=0?0:1;HEAP[r119]=HEAP[r154];HEAP[r120]=r236;HEAP[r121]=r235;HEAP[r122]=r230;HEAP[r123]=r234;HEAP[r124]=r231;FUNCTION_TABLE[HEAP[HEAP[HEAP[r119]|0]+8|0]](HEAP[HEAP[r119]+4|0],HEAP[r120],HEAP[r121],HEAP[r122],HEAP[r123],HEAP[r124]);r231=((HEAP[HEAP[r156]+20|0]|0)/8&-1)+HEAP[r163]|0;r234=HEAP[HEAP[r156]+20|0]+HEAP[r164]+ -((HEAP[HEAP[r156]+20|0]|0)/8&-1)|0;r230=HEAP[HEAP[r156]+20|0]+HEAP[r163]+ -((HEAP[HEAP[r156]+20|0]|0)/8&-1)|0;r235=HEAP[HEAP[r156]+20|0]+HEAP[r164]+ -((HEAP[HEAP[r156]+20|0]|0)/8&-1)|0;r236=(HEAP[r159]&16|0)!=0?0:1;HEAP[r113]=HEAP[r154];HEAP[r114]=r231;HEAP[r115]=r234;HEAP[r116]=r230;HEAP[r117]=r235;HEAP[r118]=r236;FUNCTION_TABLE[HEAP[HEAP[HEAP[r113]|0]+8|0]](HEAP[HEAP[r113]+4|0],HEAP[r114],HEAP[r115],HEAP[r116],HEAP[r117],HEAP[r118])}r236=Math.cos(HEAP[r161]*3.141592653589793/180);HEAP[r207]=r236;r236=-Math.sin(HEAP[r161]*3.141592653589793/180);HEAP[r4]=r236;r236=Math.sin(HEAP[r161]*3.141592653589793/180);HEAP[r6]=r236;r236=Math.cos(HEAP[r161]*3.141592653589793/180);HEAP[r226]=r236;r236=(HEAP[HEAP[r156]+20|0]-1|0)/2+1-.5;HEAP[r167]=r236;HEAP[r166]=r236;HEAP[r173]=(HEAP[r159]&32|0)!=0?5:3;HEAP[r172]=1;while(1){if((HEAP[r172]&HEAP[r159]|0)!=0){if((HEAP[r172]|0)==1){r237=1}else{r237=(HEAP[r172]|0)==4?-1:0}HEAP[r168]=((HEAP[HEAP[r156]+20|0]-1|0)-1)/2*(r237|0);if((HEAP[r172]|0)==8){r238=1}else{r238=(HEAP[r172]|0)==2?-1:0}HEAP[r169]=((HEAP[HEAP[r156]+20|0]-1|0)-1)/2*(r238|0);HEAP[r177]=HEAP[r168];HEAP[r178]=HEAP[r169];HEAP[r179]=r225;HEAP[r175]=HEAP[HEAP[r179]]*HEAP[r177]+HEAP[HEAP[r179]+8|0]*HEAP[r178];HEAP[r176]=HEAP[HEAP[r179]+4|0]*HEAP[r177]+HEAP[HEAP[r179]+12|0]*HEAP[r178];HEAP[r170]=HEAP[r175];HEAP[r171]=HEAP[r176];r236=(HEAP[r166]&-1)+HEAP[r163]|0;r235=(HEAP[r167]&-1)+HEAP[r164]|0;r230=(HEAP[r166]+HEAP[r170]&-1)+HEAP[r163]|0;r234=(HEAP[r167]+HEAP[r171]&-1)+HEAP[r164]|0;HEAP[r107]=HEAP[r154];HEAP[r108]=r236;HEAP[r109]=r235;HEAP[r110]=r230;HEAP[r111]=r234;HEAP[r112]=3;r234=HEAP[r108]-1|0;r230=HEAP[r109];r235=HEAP[r110]-1|0;r236=HEAP[r111];HEAP[r101]=HEAP[r107];HEAP[r102]=r234;HEAP[r103]=r230;HEAP[r104]=r235;HEAP[r105]=r236;HEAP[r106]=3;FUNCTION_TABLE[HEAP[HEAP[HEAP[r101]|0]+8|0]](HEAP[HEAP[r101]+4|0],HEAP[r102],HEAP[r103],HEAP[r104],HEAP[r105],HEAP[r106]);r236=HEAP[r108]+1|0;r235=HEAP[r109];r230=HEAP[r110]+1|0;r234=HEAP[r111];HEAP[r95]=HEAP[r107];HEAP[r96]=r236;HEAP[r97]=r235;HEAP[r98]=r230;HEAP[r99]=r234;HEAP[r100]=3;FUNCTION_TABLE[HEAP[HEAP[HEAP[r95]|0]+8|0]](HEAP[HEAP[r95]+4|0],HEAP[r96],HEAP[r97],HEAP[r98],HEAP[r99],HEAP[r100]);r234=HEAP[r108];r230=HEAP[r109]-1|0;r235=HEAP[r110];r236=HEAP[r111]-1|0;HEAP[r89]=HEAP[r107];HEAP[r90]=r234;HEAP[r91]=r230;HEAP[r92]=r235;HEAP[r93]=r236;HEAP[r94]=3;FUNCTION_TABLE[HEAP[HEAP[HEAP[r89]|0]+8|0]](HEAP[HEAP[r89]+4|0],HEAP[r90],HEAP[r91],HEAP[r92],HEAP[r93],HEAP[r94]);r236=HEAP[r108];r235=HEAP[r109]+1|0;r230=HEAP[r110];r234=HEAP[r111]+1|0;HEAP[r83]=HEAP[r107];HEAP[r84]=r236;HEAP[r85]=r235;HEAP[r86]=r230;HEAP[r87]=r234;HEAP[r88]=3;FUNCTION_TABLE[HEAP[HEAP[HEAP[r83]|0]+8|0]](HEAP[HEAP[r83]+4|0],HEAP[r84],HEAP[r85],HEAP[r86],HEAP[r87],HEAP[r88]);r234=HEAP[r108];r230=HEAP[r109];r235=HEAP[r110];r236=HEAP[r111];r231=HEAP[r112];HEAP[r77]=HEAP[r107];HEAP[r78]=r234;HEAP[r79]=r230;HEAP[r80]=r235;HEAP[r81]=r236;HEAP[r82]=r231;FUNCTION_TABLE[HEAP[HEAP[HEAP[r77]|0]+8|0]](HEAP[HEAP[r77]+4|0],HEAP[r78],HEAP[r79],HEAP[r80],HEAP[r81],HEAP[r82])}r231=HEAP[r172]<<1;HEAP[r172]=r231;if((r231|0)>=16){break}}HEAP[r172]=1;while(1){if((HEAP[r172]&HEAP[r159]|0)!=0){if((HEAP[r172]|0)==1){r239=1}else{r239=(HEAP[r172]|0)==4?-1:0}HEAP[r168]=((HEAP[HEAP[r156]+20|0]-1|0)-1)/2*(r239|0);if((HEAP[r172]|0)==8){r240=1}else{r240=(HEAP[r172]|0)==2?-1:0}HEAP[r169]=((HEAP[HEAP[r156]+20|0]-1|0)-1)/2*(r240|0);HEAP[r182]=HEAP[r168];HEAP[r183]=HEAP[r169];HEAP[r184]=r224;HEAP[r180]=HEAP[HEAP[r184]]*HEAP[r182]+HEAP[HEAP[r184]+8|0]*HEAP[r183];HEAP[r181]=HEAP[HEAP[r184]+4|0]*HEAP[r182]+HEAP[HEAP[r184]+12|0]*HEAP[r183];HEAP[r170]=HEAP[r180];HEAP[r171]=HEAP[r181];r231=(HEAP[r166]&-1)+HEAP[r163]|0;r236=(HEAP[r167]&-1)+HEAP[r164]|0;r235=(HEAP[r166]+HEAP[r170]&-1)+HEAP[r163]|0;r230=(HEAP[r167]+HEAP[r171]&-1)+HEAP[r164]|0;r234=HEAP[r173];HEAP[r71]=HEAP[r154];HEAP[r72]=r231;HEAP[r73]=r236;HEAP[r74]=r235;HEAP[r75]=r230;HEAP[r76]=r234;FUNCTION_TABLE[HEAP[HEAP[HEAP[r71]|0]+8|0]](HEAP[HEAP[r71]+4|0],HEAP[r72],HEAP[r73],HEAP[r74],HEAP[r75],HEAP[r76])}r234=HEAP[r172]<<1;HEAP[r172]=r234;if((r234|0)>=16){break}}HEAP[r173]=-1;do{if((HEAP[r160]|0)!=0){HEAP[r173]=3;r9=745;break}else{if((((HEAP[r159]&8)>>3)+((HEAP[r159]&4)>>2)+((HEAP[r159]&2)>>1)+(HEAP[r159]&1)|0)==1){HEAP[r173]=(HEAP[r159]&32|0)!=0?5:4;r9=745;break}else{if((HEAP[r173]|0)>=0){r9=745;break}else{break}}}}while(0);if(r9==745){r9=0;HEAP[r223]=1;HEAP[r206]=1;HEAP[r205]=1;for(r234=r214,r230=r234+16;r234<r230;r234++){HEAP[r234]=-1}HEAP[r215]=1;HEAP[r185]=0;while(1){HEAP[r168]=(HEAP[HEAP[r156]+20|0]|0)*.23999999463558197*(HEAP[(HEAP[r185]<<2)+r186|0]|0);HEAP[r169]=(HEAP[HEAP[r156]+20|0]|0)*.23999999463558197*(HEAP[(HEAP[r185]+1<<2)+r186|0]|0);HEAP[r189]=HEAP[r168];HEAP[r190]=HEAP[r169];HEAP[r191]=r213;HEAP[r187]=HEAP[HEAP[r191]]*HEAP[r189]+HEAP[HEAP[r191]+8|0]*HEAP[r190];HEAP[r188]=HEAP[HEAP[r191]+4|0]*HEAP[r189]+HEAP[HEAP[r191]+12|0]*HEAP[r190];HEAP[r170]=HEAP[r187];HEAP[r171]=HEAP[r188];HEAP[(HEAP[r185]<<2)+r186|0]=(HEAP[r166]+HEAP[r170]&-1)+HEAP[r163]|0;HEAP[(HEAP[r185]+1<<2)+r186|0]=(HEAP[r167]+HEAP[r171]&-1)+HEAP[r164]|0;r234=HEAP[r185]+2|0;HEAP[r185]=r234;if((r234|0)>=8){break}}r234=HEAP[r173];HEAP[r66]=HEAP[r154];HEAP[r67]=r212;HEAP[r68]=4;HEAP[r69]=r234;HEAP[r70]=3;FUNCTION_TABLE[HEAP[HEAP[HEAP[r66]|0]+12|0]](HEAP[HEAP[r66]+4|0],HEAP[r67],HEAP[r68],HEAP[r69],HEAP[r70])}HEAP[r172]=1;r234=HEAP[r172];while(1){do{if((r234|0)==1){HEAP[r192]=1;r9=752;break}else{r230=HEAP[r172];HEAP[r192]=(r230|0)==4?-1:0;if((r230|0)==8){r241=1;break}else{r9=752;break}}}while(0);if(r9==752){r9=0;r241=(HEAP[r172]|0)==2?-1:0}HEAP[r193]=r241;r230=HEAP[r192]+HEAP[r157]|0;HEAP[r200]=r230;HEAP[r201]=HEAP[r193]+HEAP[r158]|0;L1056:do{if((r230|0)>=0){if((HEAP[r200]|0)>=(HEAP[HEAP[r155]|0]|0)){break}if((HEAP[r201]|0)<0){break}if((HEAP[r201]|0)>=(HEAP[HEAP[r155]+4|0]|0)){break}r235=Math.imul(HEAP[HEAP[r155]|0],(HEAP[HEAP[r156]+16|0]+HEAP[r201]|0)%(HEAP[HEAP[r156]+8|0]|0));if((((HEAP[r172]&3)<<2|(HEAP[r172]&12)>>2)&(HEAP[HEAP[HEAP[r155]+32|0]+(HEAP[HEAP[r156]+12|0]+HEAP[r200]|0)%(HEAP[HEAP[r156]+4|0]|0)+r235|0]&255)|0)==0){break}if((HEAP[r192]|0)>0){r242=HEAP[HEAP[r156]+20|0]|0}else{r242=(HEAP[r192]|0)<0?0:HEAP[r166]}HEAP[r194]=(r242&-1)+HEAP[r163]|0;if((HEAP[r193]|0)>0){r243=HEAP[HEAP[r156]+20|0]|0}else{r243=(HEAP[r193]|0)<0?0:HEAP[r167]}HEAP[r195]=(r243&-1)+HEAP[r164]|0;HEAP[r196]=0;HEAP[r197]=0;HEAP[r198]=(HEAP[r193]|0)!=0?1:0;HEAP[r199]=(HEAP[r192]|0)!=0?1:0;do{if(HEAP[r161]==0){if((HEAP[r172]&HEAP[r159]|0)==0){break}r235=HEAP[r194]-HEAP[r198]|0;r236=HEAP[r195]-HEAP[r199]|0;r231=HEAP[r196]+HEAP[r194]+HEAP[r198]|0;r244=HEAP[r197]+HEAP[r195]+HEAP[r199]|0;HEAP[r56]=HEAP[r154];HEAP[r57]=r235;HEAP[r58]=r236;HEAP[r59]=r231;HEAP[r60]=r244;HEAP[r61]=3;HEAP[r62]=(HEAP[r57]|0)<(HEAP[r59]|0)?HEAP[r57]:HEAP[r59];HEAP[r63]=(HEAP[r58]|0)<(HEAP[r60]|0)?HEAP[r58]:HEAP[r60];HEAP[r64]=HEAP[r59]+HEAP[r57]+(HEAP[r62]*-2&-1)+1|0;HEAP[r65]=HEAP[r60]+HEAP[r58]+(HEAP[r63]*-2&-1)+1|0;r244=HEAP[r62];r231=HEAP[r63];r236=HEAP[r64];r235=HEAP[r65];r245=HEAP[r61];HEAP[r50]=HEAP[r56];HEAP[r51]=r244;HEAP[r52]=r231;HEAP[r53]=r236;HEAP[r54]=r235;HEAP[r55]=r245;FUNCTION_TABLE[HEAP[HEAP[HEAP[r50]|0]+4|0]](HEAP[HEAP[r50]+4|0],HEAP[r51],HEAP[r52],HEAP[r53],HEAP[r54],HEAP[r55]);r245=HEAP[r194];r235=HEAP[r195];r236=HEAP[r196]+HEAP[r194]|0;r231=HEAP[r197]+HEAP[r195]|0;r244=(HEAP[r159]&32|0)!=0?5:3;HEAP[r40]=HEAP[r154];HEAP[r41]=r245;HEAP[r42]=r235;HEAP[r43]=r236;HEAP[r44]=r231;HEAP[r45]=r244;HEAP[r46]=(HEAP[r41]|0)<(HEAP[r43]|0)?HEAP[r41]:HEAP[r43];HEAP[r47]=(HEAP[r42]|0)<(HEAP[r44]|0)?HEAP[r42]:HEAP[r44];HEAP[r48]=HEAP[r43]+HEAP[r41]+(HEAP[r46]*-2&-1)+1|0;HEAP[r49]=HEAP[r44]+HEAP[r42]+(HEAP[r47]*-2&-1)+1|0;r244=HEAP[r46];r231=HEAP[r47];r236=HEAP[r48];r235=HEAP[r49];r245=HEAP[r45];HEAP[r34]=HEAP[r40];HEAP[r35]=r244;HEAP[r36]=r231;HEAP[r37]=r236;HEAP[r38]=r235;HEAP[r39]=r245;FUNCTION_TABLE[HEAP[HEAP[HEAP[r34]|0]+4|0]](HEAP[HEAP[r34]+4|0],HEAP[r35],HEAP[r36],HEAP[r37],HEAP[r38],HEAP[r39]);break L1056}}while(0);r245=HEAP[r194];r235=HEAP[r195];r236=HEAP[r194];r231=HEAP[r195];HEAP[r24]=HEAP[r154];HEAP[r25]=r245;HEAP[r26]=r235;HEAP[r27]=r236;HEAP[r28]=r231;HEAP[r29]=3;HEAP[r30]=(HEAP[r25]|0)<(HEAP[r27]|0)?HEAP[r25]:HEAP[r27];HEAP[r31]=(HEAP[r26]|0)<(HEAP[r28]|0)?HEAP[r26]:HEAP[r28];HEAP[r32]=HEAP[r27]+HEAP[r25]+(HEAP[r30]*-2&-1)+1|0;HEAP[r33]=HEAP[r28]+HEAP[r26]+(HEAP[r31]*-2&-1)+1|0;r231=HEAP[r30];r236=HEAP[r31];r235=HEAP[r32];r245=HEAP[r33];r244=HEAP[r29];HEAP[r18]=HEAP[r24];HEAP[r19]=r231;HEAP[r20]=r236;HEAP[r21]=r235;HEAP[r22]=r245;HEAP[r23]=r244;FUNCTION_TABLE[HEAP[HEAP[HEAP[r18]|0]+4|0]](HEAP[HEAP[r18]+4|0],HEAP[r19],HEAP[r20],HEAP[r21],HEAP[r22],HEAP[r23])}}while(0);r230=HEAP[r172]<<1;HEAP[r172]=r230;if((r230|0)<16){r234=r230}else{break}}HEAP[r174]=0;while(1){HEAP[r172]=1;while(1){HEAP[r204]=0;r234=Math.imul(HEAP[HEAP[r155]|0],(HEAP[HEAP[r156]+16|0]+HEAP[r158]|0)%(HEAP[HEAP[r156]+8|0]|0));L1080:do{if((((HEAP[r172]&7)<<1|HEAP[r172]|(HEAP[r172]&8)>>3)&(HEAP[HEAP[HEAP[r155]+36|0]+(HEAP[HEAP[r156]+12|0]+HEAP[r157]|0)%(HEAP[HEAP[r156]+4|0]|0)+r234|0]&255)|0)!=0){HEAP[r204]=1;r9=794;break}else{r230=HEAP[r157];do{if((HEAP[r172]|0)==1){HEAP[r202]=r230+1|0;r246=HEAP[r158];r9=776;break}else{r244=HEAP[r172];r245=((r244|0)==4?-1:0)+r230|0;HEAP[r202]=r245;r235=HEAP[r158];if((r244|0)==8){r247=1;r248=r235;r249=r245;break}else{r246=r235;r9=776;break}}}while(0);if(r9==776){r9=0;r247=(HEAP[r172]|0)==2?-1:0;r248=r246;r249=HEAP[r202]}HEAP[r203]=r247+r248|0;do{if((r249|0)>=0){if((HEAP[r202]|0)>=(HEAP[HEAP[r155]|0]|0)){break}if(!((HEAP[r203]|0)>=0)){break}if((HEAP[r203]|0)>=(HEAP[HEAP[r155]+4|0]|0)){break}r230=Math.imul(HEAP[HEAP[r155]|0],(HEAP[HEAP[r156]+16|0]+HEAP[r203]|0)%(HEAP[HEAP[r156]+8|0]|0));if((((HEAP[r172]&8)>>3|(HEAP[r172]&7)<<1)&(HEAP[HEAP[HEAP[r155]+36|0]+(HEAP[HEAP[r156]+12|0]+HEAP[r202]|0)%(HEAP[HEAP[r156]+4|0]|0)+r230|0]&255)|0)==0){break}HEAP[r204]=1;r9=794;break L1080}}while(0);if(((HEAP[r172]&8)>>3|(HEAP[r172]&7)<<1|0)==1){r250=1}else{r250=((HEAP[r172]&8)>>3|(HEAP[r172]&7)<<1|0)==4?-1:0}HEAP[r202]=r250+HEAP[r157]|0;if(((HEAP[r172]&8)>>3|(HEAP[r172]&7)<<1|0)==8){r251=1}else{r251=((HEAP[r172]&8)>>3|(HEAP[r172]&7)<<1|0)==2?-1:0}HEAP[r203]=r251+HEAP[r158]|0;do{if((HEAP[r202]|0)>=0){if((HEAP[r202]|0)>=(HEAP[HEAP[r155]|0]|0)){break}if(!((HEAP[r203]|0)>=0)){break}if((HEAP[r203]|0)>=(HEAP[HEAP[r155]+4|0]|0)){break}r230=Math.imul(HEAP[HEAP[r155]|0],(HEAP[HEAP[r156]+16|0]+HEAP[r203]|0)%(HEAP[HEAP[r156]+8|0]|0));if((HEAP[HEAP[HEAP[r155]+36|0]+(HEAP[HEAP[r156]+12|0]+HEAP[r202]|0)%(HEAP[HEAP[r156]+4|0]|0)+r230|0]&255&HEAP[r172]|0)==0){break}HEAP[r204]=1;r9=794;break L1080}}while(0);if((HEAP[r204]|0)!=0){r9=794;break}else{break}}}while(0);if(r9==794){r9=0;if((HEAP[r172]|0)==1){r252=1}else{r252=(HEAP[r172]|0)==4?-1:0}r234=HEAP[r172];if(((r234&8)>>3|(HEAP[r172]&7)<<1|0)==1){r253=1;r254=r234}else{r253=((HEAP[r172]&8)>>3|(HEAP[r172]&7)<<1|0)==4?-1:0;r254=HEAP[r172]}if((r254|0)==8){r255=1}else{r255=(HEAP[r172]|0)==2?-1:0}if(((HEAP[r172]&8)>>3|(HEAP[r172]&7)<<1|0)==8){r256=1}else{r256=((HEAP[r172]&8)>>3|(HEAP[r172]&7)<<1|0)==2?-1:0}_draw_barrier_corner(HEAP[r154],HEAP[r156],HEAP[r157],HEAP[r158],r253+r252|0,r256+r255|0,HEAP[r174])}r234=HEAP[r172]<<1;HEAP[r172]=r234;if((r234|0)>=16){break}}HEAP[r172]=1;while(1){r234=Math.imul(HEAP[HEAP[r155]|0],(HEAP[HEAP[r156]+16|0]+HEAP[r158]|0)%(HEAP[HEAP[r156]+8|0]|0));if((HEAP[HEAP[HEAP[r155]+36|0]+(HEAP[HEAP[r156]+12|0]+HEAP[r157]|0)%(HEAP[HEAP[r156]+4|0]|0)+r234|0]&255&HEAP[r172]|0)!=0){_draw_barrier(HEAP[r154],HEAP[r156],HEAP[r157],HEAP[r158],HEAP[r172],HEAP[r174])}r234=HEAP[r172]<<1;HEAP[r172]=r234;if((r234|0)>=16){break}}r234=HEAP[r174]+1|0;HEAP[r174]=r234;if((r234|0)>=2){break}}HEAP[r17]=HEAP[r154];FUNCTION_TABLE[HEAP[HEAP[HEAP[r17]|0]+28|0]](HEAP[HEAP[r17]+4|0]);r234=HEAP[r163];r230=HEAP[r164];r235=HEAP[HEAP[r156]+20|0]+1|0;r245=HEAP[HEAP[r156]+20|0]+1|0;HEAP[r12]=HEAP[r154];HEAP[r13]=r234;HEAP[r14]=r230;HEAP[r15]=r235;HEAP[r16]=r245;if((HEAP[HEAP[HEAP[r12]|0]+20|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r12]|0]+20|0]](HEAP[HEAP[r12]+4|0],HEAP[r13],HEAP[r14],HEAP[r15],HEAP[r16])}do{if((r210|0)==0){if((r211|0)!=0){break}if((r220|0)!=0){break}r245=Math.imul(HEAP[r3|0],r222)+r221|0;HEAP[HEAP[r1+24|0]+r245|0]=r219;break L1007}}while(0);r245=Math.imul(HEAP[r3|0],r222)+r221|0;HEAP[HEAP[r1+24|0]+r245|0]=-1}}while(0);r222=r222+1|0;if((r222|0)>=(HEAP[r1+8|0]|0)){break L975}}}}while(0);r221=r221+1|0;if((r221|0)>=(HEAP[r1+4|0]|0)){break L971}}}}while(0);r1=Math.imul(HEAP[r3+4|0],HEAP[r3|0]);r221=0;r222=0;r16=0;L1143:do{if((r16|0)<(r1|0)){while(1){if(HEAP[r7+r16|0]<<24>>24!=0){r222=r222+1|0}if((HEAP[HEAP[r3+32|0]+r16|0]&15|0)!=0){r221=r221+1|0}r16=r16+1|0;if((r16|0)>=(r1|0)){break L1143}}}}while(0);if((HEAP[r3+28|0]|0)!=0){r257=33984}else{r257=(HEAP[r3+12|0]|0)!=0?33724:35140}_sprintf(r216|0,34384,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP[tempInt]=r257,HEAP[tempInt+4]=r222,HEAP[tempInt+8]=r221,tempInt));_status_bar(r217,r216|0);r216=r7;HEAP[r11]=r216;if((r216|0)==0){r258=r11;STACKTOP=r10;return}_free(HEAP[r11]);r258=r11;STACKTOP=r10;return}function _game_anim_length(r1,r2,r3,r4){var r5;if((r3|0)==-1){r5=HEAP[r1+24|0]}else{r5=HEAP[r2+24|0]}if((r5|0)!=0){r5=.12999999523162842;r2=r5;return r2}else{r5=0;r2=r5;return r2}}function _game_flash_length(r1,r2,r3,r4){var r5,r6;r4=r1;r1=r2;do{if((HEAP[r4+12|0]|0)==0){if((HEAP[r1+12|0]|0)==0){break}if((HEAP[r4+28|0]|0)!=0){break}if((HEAP[r1+28|0]|0)!=0){break}r2=0;if((r2|0)<(HEAP[r1|0]|0)){r2=HEAP[r1|0]}if((r2|0)<(HEAP[r1+4|0]|0)){r2=HEAP[r1+4|0]}r5=(r2+4|0)*.07000000029802322;r6=r5;return r6}}while(0);r5=0;r6=r5;return r6}function _game_status(r1){return(HEAP[r1+12|0]|0)!=0?1:0}function _game_print_size(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10;r4=STACKTOP;STACKTOP=STACKTOP+24|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;HEAP[r5]=r1;HEAP[r6]=800;HEAP[r7]=r9;HEAP[r8]=r10;r1=Math.imul(HEAP[HEAP[r5]|0],HEAP[r6])+3|0;HEAP[HEAP[r7]]=r1;r1=Math.imul(HEAP[HEAP[r5]+4|0],HEAP[r6])+3|0;HEAP[HEAP[r8]]=r1;HEAP[r2]=(HEAP[r9]|0)/100;HEAP[r3]=(HEAP[r10]|0)/100;STACKTOP=r4;return}function _game_print(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67;r4=STACKTOP;STACKTOP=STACKTOP+284|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r4+24;r12=r4+28;r13=r4+32;r14=r4+36;r15=r4+40;r16=r4+44;r17=r4+48;r18=r4+52;r19=r4+56;r20=r4+60;r21=r4+64;r22=r4+68;r23=r4+72;r24=r4+76;r25=r4+80;r26=r4+84;r27=r4+88;r28=r4+92;r29=r4+96;r30=r4+100;r31=r4+104;r32=r4+108;r33=r4+112;r34=r4+116;r35=r4+120;r36=r4+124;r37=r4+128;r38=r4+132;r39=r4+136;r40=r4+140;r41=r4+144;r42=r4+148;r43=r4+152;r44=r4+156;r45=r4+160;r46=r4+164;r47=r4+196;r48=r4+200;r49=r4+208;r50=r4+216;r51=r4+220;r52=r4+224;r53=r4+228;r54=r4+232;r55=r4+236;r56=r4+240;r57=r4+244;r58=r4+248;r59=r4+252;r60=r1;r1=r2;r2=HEAP[r1|0];r61=HEAP[r1+4|0];HEAP[r58]=r60;HEAP[r59]=0;r62=HEAP[r59]|0;r63=HEAP[r59]|0;r64=HEAP[r59]|0;r65=HEAP[r59]|0;HEAP[r51]=HEAP[r58];HEAP[r52]=r62;HEAP[r53]=r63;HEAP[r54]=r64;HEAP[r55]=r65;HEAP[r56]=-1;HEAP[r57]=0;if((HEAP[HEAP[r51]+12|0]|0)>=(HEAP[HEAP[r51]+16|0]|0)){HEAP[HEAP[r51]+16|0]=HEAP[HEAP[r51]+12|0]+16|0;r65=_srealloc(HEAP[HEAP[r51]+8|0],HEAP[HEAP[r51]+16|0]*24&-1);HEAP[HEAP[r51]+8|0]=r65}HEAP[HEAP[HEAP[r51]+8|0]+(HEAP[HEAP[r51]+12|0]*24&-1)|0]=HEAP[r56];HEAP[HEAP[HEAP[r51]+8|0]+(HEAP[HEAP[r51]+12|0]*24&-1)+4|0]=HEAP[r57];HEAP[HEAP[HEAP[r51]+8|0]+(HEAP[HEAP[r51]+12|0]*24&-1)+8|0]=HEAP[r52];HEAP[HEAP[HEAP[r51]+8|0]+(HEAP[HEAP[r51]+12|0]*24&-1)+12|0]=HEAP[r53];HEAP[HEAP[HEAP[r51]+8|0]+(HEAP[HEAP[r51]+12|0]*24&-1)+16|0]=HEAP[r54];HEAP[HEAP[HEAP[r51]+8|0]+(HEAP[HEAP[r51]+12|0]*24&-1)+20|0]=HEAP[r55];r55=HEAP[r51]+12|0;r51=HEAP[r55];HEAP[r55]=r51+1|0;r55=r51;r51=r4+256;HEAP[r4+204]=r60;HEAP[r49]=r51;HEAP[r4+212]=0;HEAP[r50]=r3;HEAP[HEAP[r49]+20|0]=HEAP[r50];r50=(HEAP[r51+20|0]|0)/(((HEAP[r1+8|0]|0)!=0?128:12)|0)&-1;HEAP[r47]=r60;HEAP[r48]=r50;r50=HEAP[HEAP[HEAP[r47]|0]+84|0];r49=HEAP[HEAP[r47]+4|0];r3=Math.sqrt(HEAP[HEAP[r47]+20|0]);FUNCTION_TABLE[r50](r49,r3*(HEAP[r48]|0));r48=Math.imul(r2,HEAP[r51+20|0]);r3=Math.imul(r61,HEAP[r51+20|0]);HEAP[r36]=r60;HEAP[r37]=1;HEAP[r38]=1;HEAP[r39]=r48;HEAP[r40]=r3;HEAP[r41]=r55;HEAP[r42]=HEAP[r37];HEAP[r43]=HEAP[r37]-1+HEAP[r39]|0;HEAP[r44]=HEAP[r38];HEAP[r45]=HEAP[r38]-1+HEAP[r40]|0;HEAP[r46|0]=HEAP[r42];HEAP[r46+4|0]=HEAP[r44];HEAP[r46+8|0]=HEAP[r42];HEAP[r46+12|0]=HEAP[r45];HEAP[r46+16|0]=HEAP[r43];HEAP[r46+20|0]=HEAP[r45];HEAP[r46+24|0]=HEAP[r43];HEAP[r46+28|0]=HEAP[r44];r44=HEAP[r41];HEAP[r31]=HEAP[r36];HEAP[r32]=r46|0;HEAP[r33]=4;HEAP[r34]=-1;HEAP[r35]=r44;FUNCTION_TABLE[HEAP[HEAP[HEAP[r31]|0]+12|0]](HEAP[HEAP[r31]+4|0],HEAP[r32],HEAP[r33],HEAP[r34],HEAP[r35]);r35=(HEAP[r51+20|0]|0)/128&-1;HEAP[r29]=r60;HEAP[r30]=r35;r35=HEAP[HEAP[HEAP[r29]|0]+84|0];r34=HEAP[HEAP[r29]+4|0];r33=Math.sqrt(HEAP[HEAP[r29]+20|0]);FUNCTION_TABLE[r35](r34,r33*(HEAP[r30]|0));r30=1;L1191:do{if((r30|0)<(r2|0)){while(1){r33=Math.imul(r30,HEAP[r51+20|0])+1|0;r34=Math.imul(r30,HEAP[r51+20|0])+1|0;r35=Math.imul(r61,HEAP[r51+20|0])+1|0;HEAP[r23]=r60;HEAP[r24]=r33;HEAP[r25]=1;HEAP[r26]=r34;HEAP[r27]=r35;HEAP[r28]=r55;FUNCTION_TABLE[HEAP[HEAP[HEAP[r23]|0]+8|0]](HEAP[HEAP[r23]+4|0],HEAP[r24],HEAP[r25],HEAP[r26],HEAP[r27],HEAP[r28]);r30=r30+1|0;if((r30|0)>=(r2|0)){break L1191}}}}while(0);r28=1;L1196:do{if((r28|0)<(r61|0)){while(1){r27=Math.imul(r28,HEAP[r51+20|0])+1|0;r26=Math.imul(r2,HEAP[r51+20|0])+1|0;r25=Math.imul(r28,HEAP[r51+20|0])+1|0;HEAP[r17]=r60;HEAP[r18]=1;HEAP[r19]=r27;HEAP[r20]=r26;HEAP[r21]=r25;HEAP[r22]=r55;FUNCTION_TABLE[HEAP[HEAP[HEAP[r17]|0]+8|0]](HEAP[HEAP[r17]+4|0],HEAP[r18],HEAP[r19],HEAP[r20],HEAP[r21],HEAP[r22]);r28=r28+1|0;if((r28|0)>=(r61|0)){break L1196}}}}while(0);r28=0;L1201:do{if((r28|0)<=(r61|0)){while(1){r30=0;r22=r28;L1205:do{if((r30|0)<=(r2|0)){r21=r22;while(1){r20=(r30|0)%(r2|0)+Math.imul(HEAP[r1|0],(r21|0)%(r61|0))|0;r19=HEAP[HEAP[r1+36|0]+r20|0]&255;do{if((r30|0)<(r2|0)){if((r19&2|0)==0){break}r20=(Math.imul(r30,HEAP[r51+20|0])+1|0)+ -((HEAP[r51+20|0]|0)/24&-1)|0;r18=(Math.imul(r28,HEAP[r51+20|0])+1|0)+ -((HEAP[r51+20|0]|0)/24&-1)|0;r17=(((HEAP[r51+20|0]|0)/24&-1)<<1)+HEAP[r51+20|0]|0;r25=((HEAP[r51+20|0]|0)/24&-1)<<1;HEAP[r11]=r60;HEAP[r12]=r20;HEAP[r13]=r18;HEAP[r14]=r17;HEAP[r15]=r25;HEAP[r16]=r55;FUNCTION_TABLE[HEAP[HEAP[HEAP[r11]|0]+4|0]](HEAP[HEAP[r11]+4|0],HEAP[r12],HEAP[r13],HEAP[r14],HEAP[r15],HEAP[r16])}}while(0);do{if((r28|0)<(r61|0)){if((r19&4|0)==0){break}r25=(Math.imul(r30,HEAP[r51+20|0])+1|0)+ -((HEAP[r51+20|0]|0)/24&-1)|0;r17=(Math.imul(r28,HEAP[r51+20|0])+1|0)+ -((HEAP[r51+20|0]|0)/24&-1)|0;r18=((HEAP[r51+20|0]|0)/24&-1)<<1;r20=(((HEAP[r51+20|0]|0)/24&-1)<<1)+HEAP[r51+20|0]|0;HEAP[r5]=r60;HEAP[r6]=r25;HEAP[r7]=r17;HEAP[r8]=r18;HEAP[r9]=r20;HEAP[r10]=r55;FUNCTION_TABLE[HEAP[HEAP[HEAP[r5]|0]+4|0]](HEAP[HEAP[r5]+4|0],HEAP[r6],HEAP[r7],HEAP[r8],HEAP[r9],HEAP[r10])}}while(0);r30=r30+1|0;r19=r28;if((r30|0)<=(r2|0)){r21=r19}else{r66=r19;break L1205}}}else{r66=r22}}while(0);r28=r66+1|0;if(!((r28|0)<=(r61|0))){break L1201}}}}while(0);r28=0;if((r28|0)>=(r61|0)){STACKTOP=r4;return}while(1){r30=0;r66=r28;L1222:do{if((r30|0)<(r2|0)){r10=r66;while(1){r9=Math.imul(HEAP[r1|0],r10)+r30|0;r8=HEAP[HEAP[r1+32|0]+r9|0]&255;r9=r8&16;r8=r8&15;r7=r8;while(1){if(!((r7|0)!=0&(r7|0)!=15&(r7|0)!=1&(r7|0)!=9&(r7|0)!=13&(r7|0)!=5)){break}r7=(r7&8)>>3|(r7&7)<<1}_draw_diagram(r60,r51,r30,r28,1,r7,1,r55);_draw_diagram(r60,r51,r30,r28,0,r8,r9,r55);r30=r30+1|0;r6=r28;if((r30|0)<(r2|0)){r10=r6}else{r67=r6;break L1222}}}else{r67=r66}}while(0);r28=r67+1|0;if((r28|0)>=(r61|0)){break}}STACKTOP=r4;return}function _game_timing_state(r1,r2){return 1}function _draw_diagram(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40;r9=STACKTOP;STACKTOP=STACKTOP+48|0;r10=r9;r11=r9+4;r12=r9+8;r13=r9+12;r14=r9+16;r15=r9+20;r16=r9+24;r17=r9+28;r18=r9+32;r19=r9+36;r20=r9+40;r21=r9+44;r22=r1;r1=r2;r2=r6;r6=r7;r7=r8;r8=Math.imul(r3,HEAP[r1+20|0])+1|0;r3=Math.imul(r4,HEAP[r1+20|0])+1|0;r4=r8;if((r5|0)!=0){r5=HEAP[r1+20|0];if((r2&4|0)!=0){r23=(r5|0)/4&-1}else{r23=(r5|0)/6&-1}r24=r23+r4|0;r23=HEAP[r1+20|0];if((r2&2|0)!=0){r25=(r23|0)/4&-1}else{r25=(r23|0)/6&-1}r26=r25+r3|0;r27=(HEAP[r1+20|0]|0)/8&-1;r28=(HEAP[r1+20|0]|0)/32&-1}else{r24=((HEAP[r1+20|0]|0)/2&-1)+r4|0;r26=((HEAP[r1+20|0]|0)/2&-1)+r3|0;r27=(HEAP[r1+20|0]|0)/2&-1;r28=(HEAP[r1+20|0]|0)/8&-1}r1=(r27|0)/20&-1;if((r2|0)==1|(r2|0)==2|(r2|0)==4|(r2|0)==8){HEAP[r16]=r22;HEAP[r17]=r24-r28|0;HEAP[r18]=r26-r28|0;HEAP[r19]=r28<<1;HEAP[r20]=r28<<1;HEAP[r21]=r7;FUNCTION_TABLE[HEAP[HEAP[HEAP[r16]|0]+4|0]](HEAP[HEAP[r16]+4|0],HEAP[r17],HEAP[r18],HEAP[r19],HEAP[r20],HEAP[r21])}if((r6|0)==0){STACKTOP=r9;return}r6=1;while(1){if((r6&r2|0)!=0){if((r6|0)==1){r29=1}else{r29=(r6|0)==4?-1:0}r21=r24;if((r24|0)<(Math.imul(r29,r27-r1|0)+r24|0)){r30=r21}else{if((r6|0)==1){r31=1}else{r31=(r6|0)==4?-1:0}r30=Math.imul(r31,r27-r1|0)+r21|0}r21=r30;if((r6|0)==1){r32=1}else{r32=(r6|0)==4?-1:0}r20=r24;if((r24|0)>(Math.imul(r32,r27-r1|0)+r24|0)){r33=r20}else{if((r6|0)==1){r34=1}else{r34=(r6|0)==4?-1:0}r33=Math.imul(r34,r27-r1|0)+r20|0}r20=r33;if((r6|0)==8){r35=1}else{r35=(r6|0)==2?-1:0}r19=r26;if((r26|0)<(Math.imul(r35,r27-r1|0)+r26|0)){r36=r19}else{if((r6|0)==8){r37=1}else{r37=(r6|0)==2?-1:0}r36=Math.imul(r37,r27-r1|0)+r19|0}r19=r36;if((r6|0)==8){r38=1}else{r38=(r6|0)==2?-1:0}r18=r26;if((r26|0)>(Math.imul(r38,r27-r1|0)+r26|0)){r39=r18}else{if((r6|0)==8){r40=1}else{r40=(r6|0)==2?-1:0}r39=Math.imul(r40,r27-r1|0)+r18|0}HEAP[r10]=r22;HEAP[r11]=r21-r1|0;HEAP[r12]=r19-r1|0;HEAP[r13]=(r1<<1)+ -r21+r20|0;HEAP[r14]=(r1<<1)+ -r19+r39|0;HEAP[r15]=r7;FUNCTION_TABLE[HEAP[HEAP[HEAP[r10]|0]+4|0]](HEAP[HEAP[r10]+4|0],HEAP[r11],HEAP[r12],HEAP[r13],HEAP[r14],HEAP[r15])}r19=r6<<1;r6=r19;if((r19|0)>=16){break}}STACKTOP=r9;return}function _draw_barrier_corner(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59;r8=STACKTOP;STACKTOP=STACKTOP+192|0;r9=r8;r10=r8+4;r11=r8+8;r12=r8+12;r13=r8+16;r14=r8+20;r15=r8+24;r16=r8+28;r17=r8+32;r18=r8+36;r19=r8+40;r20=r8+44;r21=r8+48;r22=r8+52;r23=r8+56;r24=r8+60;r25=r8+64;r26=r8+68;r27=r8+72;r28=r8+76;r29=r8+80;r30=r8+84;r31=r8+88;r32=r8+92;r33=r8+96;r34=r8+100;r35=r8+104;r36=r8+108;r37=r8+112;r38=r8+116;r39=r8+120;r40=r8+124;r41=r8+128;r42=r8+132;r43=r8+136;r44=r8+140;r45=r8+144;r46=r8+148;r47=r8+152;r48=r8+156;r49=r8+160;r50=r8+164;r51=r8+168;r52=r8+172;r53=r8+176;r54=r8+180;r55=r8+184;r56=r8+188;r57=r1;r1=r2;r2=r5;r5=r6;r6=Math.imul(r3,HEAP[r1+20|0])+1|0;r3=Math.imul(r4,HEAP[r1+20|0])+1|0;if((r2|0)>0){r58=HEAP[r1+20|0]}else{r58=0}r4=r58;if((r5|0)>0){r59=HEAP[r1+20|0]}else{r59=0}r1=r59;r59=r57;r58=r4+r6|0;if((r7|0)==0){HEAP[r47]=r59;HEAP[r48]=r2+r58|0;HEAP[r49]=r1+r3|0;HEAP[r50]=r4+r6+ -r2|0;HEAP[r51]=r1+r3|0;HEAP[r52]=3;HEAP[r53]=(HEAP[r48]|0)<(HEAP[r50]|0)?HEAP[r48]:HEAP[r50];HEAP[r54]=(HEAP[r49]|0)<(HEAP[r51]|0)?HEAP[r49]:HEAP[r51];HEAP[r55]=HEAP[r50]+HEAP[r48]+(HEAP[r53]*-2&-1)+1|0;HEAP[r56]=HEAP[r51]+HEAP[r49]+(HEAP[r54]*-2&-1)+1|0;r49=HEAP[r53];r53=HEAP[r54];r54=HEAP[r55];r55=HEAP[r56];r56=HEAP[r52];HEAP[r41]=HEAP[r47];HEAP[r42]=r49;HEAP[r43]=r53;HEAP[r44]=r54;HEAP[r45]=r55;HEAP[r46]=r56;FUNCTION_TABLE[HEAP[HEAP[HEAP[r41]|0]+4|0]](HEAP[HEAP[r41]+4|0],HEAP[r42],HEAP[r43],HEAP[r44],HEAP[r45],HEAP[r46]);HEAP[r31]=r57;HEAP[r32]=r4+r6|0;HEAP[r33]=r1+r3+r5|0;HEAP[r34]=r4+r6|0;HEAP[r35]=r1+r3+ -r5|0;HEAP[r36]=3;HEAP[r37]=(HEAP[r32]|0)<(HEAP[r34]|0)?HEAP[r32]:HEAP[r34];HEAP[r38]=(HEAP[r33]|0)<(HEAP[r35]|0)?HEAP[r33]:HEAP[r35];HEAP[r39]=HEAP[r34]+HEAP[r32]+(HEAP[r37]*-2&-1)+1|0;HEAP[r40]=HEAP[r35]+HEAP[r33]+(HEAP[r38]*-2&-1)+1|0;r33=HEAP[r37];r37=HEAP[r38];r38=HEAP[r39];r39=HEAP[r40];r40=HEAP[r36];HEAP[r25]=HEAP[r31];HEAP[r26]=r33;HEAP[r27]=r37;HEAP[r28]=r38;HEAP[r29]=r39;HEAP[r30]=r40;FUNCTION_TABLE[HEAP[HEAP[HEAP[r25]|0]+4|0]](HEAP[HEAP[r25]+4|0],HEAP[r26],HEAP[r27],HEAP[r28],HEAP[r29],HEAP[r30]);STACKTOP=r8;return}else{HEAP[r15]=r59;HEAP[r16]=r58;HEAP[r17]=r1+r3|0;HEAP[r18]=r4+r6|0;HEAP[r19]=r1+r3|0;HEAP[r20]=6;HEAP[r21]=(HEAP[r16]|0)<(HEAP[r18]|0)?HEAP[r16]:HEAP[r18];HEAP[r22]=(HEAP[r17]|0)<(HEAP[r19]|0)?HEAP[r17]:HEAP[r19];HEAP[r23]=HEAP[r18]+HEAP[r16]+(HEAP[r21]*-2&-1)+1|0;HEAP[r24]=HEAP[r19]+HEAP[r17]+(HEAP[r22]*-2&-1)+1|0;r17=HEAP[r21];r21=HEAP[r22];r22=HEAP[r23];r23=HEAP[r24];r24=HEAP[r20];HEAP[r9]=HEAP[r15];HEAP[r10]=r17;HEAP[r11]=r21;HEAP[r12]=r22;HEAP[r13]=r23;HEAP[r14]=r24;FUNCTION_TABLE[HEAP[HEAP[HEAP[r9]|0]+4|0]](HEAP[HEAP[r9]+4|0],HEAP[r10],HEAP[r11],HEAP[r12],HEAP[r13],HEAP[r14]);STACKTOP=r8;return}}function _draw_barrier(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r7=0;r8=STACKTOP;STACKTOP=STACKTOP+48|0;r9=r8;r10=r8+4;r11=r8+8;r12=r8+12;r13=r8+16;r14=r8+20;r15=r8+24;r16=r8+28;r17=r8+32;r18=r8+36;r19=r8+40;r20=r8+44;r21=r1;r1=r2;r2=r5;r5=r6;r6=Math.imul(r3,HEAP[r1+20|0])+1|0;r3=Math.imul(r4,HEAP[r1+20|0])+1|0;do{if((r2|0)==1){r7=940}else{if((((r2|0)==4?-1:0)|0)>0){r7=940;break}if((r2|0)==1){r22=1}else{r22=(r2|0)==4?-1:0}r23=(r22|0)==0?1:0;break}}while(0);if(r7==940){r23=HEAP[r1+20|0]}r22=r23;do{if((r2|0)==8){r7=946}else{if((((r2|0)==2?-1:0)|0)>0){r7=946;break}if((r2|0)==8){r24=1}else{r24=(r2|0)==2?-1:0}r25=(r24|0)==0?1:0;break}}while(0);if(r7==946){r25=HEAP[r1+20|0]}r24=r25;if((r2|0)==1|(r2|0)==4){r26=1}else{r26=HEAP[r1+20|0]-1|0}r25=r26;if((r2|0)==8|(r2|0)==2){r27=1}else{r27=HEAP[r1+20|0]-1|0}r1=r27;r27=r21;r21=r22+r6|0;if((r5|0)!=0){HEAP[r9]=r27;HEAP[r10]=r21;HEAP[r11]=r24+r3|0;HEAP[r12]=r25;HEAP[r13]=r1;HEAP[r14]=6;FUNCTION_TABLE[HEAP[HEAP[HEAP[r9]|0]+4|0]](HEAP[HEAP[r9]+4|0],HEAP[r10],HEAP[r11],HEAP[r12],HEAP[r13],HEAP[r14]);STACKTOP=r8;return}do{if((r2|0)==1){r28=r21-1|0;r29=r24+r3|0;r7=958;break}else{r14=r2;r13=r21-((r14|0)==4?-1:0)|0;r12=r24+r3|0;if((r14|0)==8){r30=1;r31=r13;r32=r12;break}else{r28=r13;r29=r12;r7=958;break}}}while(0);if(r7==958){r30=(r2|0)==2?-1:0;r31=r28;r32=r29}HEAP[r15]=r27;HEAP[r16]=r31;HEAP[r17]=r32-r30|0;HEAP[r18]=r25;HEAP[r19]=r1;HEAP[r20]=3;FUNCTION_TABLE[HEAP[HEAP[HEAP[r15]|0]+4|0]](HEAP[HEAP[r15]+4|0],HEAP[r16],HEAP[r17],HEAP[r18],HEAP[r19],HEAP[r20]);STACKTOP=r8;return}function _xyd_cmp(r1,r2){var r3,r4,r5;r3=r1;r1=r2;if((HEAP[r3|0]|0)<(HEAP[r1|0]|0)){r4=-1;r5=r4;return r5}if((HEAP[r3|0]|0)>(HEAP[r1|0]|0)){r4=1;r5=r4;return r5}if((HEAP[r3+4|0]|0)<(HEAP[r1+4|0]|0)){r4=-1;r5=r4;return r5}if((HEAP[r3+4|0]|0)>(HEAP[r1+4|0]|0)){r4=1;r5=r4;return r5}if((HEAP[r3+8|0]|0)<(HEAP[r1+8|0]|0)){r4=-1;r5=r4;return r5}if((HEAP[r3+8|0]|0)>(HEAP[r1+8|0]|0)){r4=1;r5=r4;return r5}else{r4=0;r5=r4;return r5}}function _xyd_cmp_nc(r1,r2){return _xyd_cmp(r1,r2)}function _compute_active(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+104|0;r6=r5;r7=r5+4;r8=r5+8;r9=r5+12;r10=r5+16;r11=r5+20;r12=r5+24;r13=r5+28;r14=r5+32;r15=r5+36;r16=r5+40;r17=r5+44;r18=r5+48;r19=r5+52;r20=r5+56;r21=r5+60;r22=r5+64;r23=r5+68;r24=r5+72;r25=r5+76;r26=r5+80;r27=r5+84;r28=r5+88;r29=r5+92;r30=r5+96;r31=r5+100;r32=r1;r1=r2;r2=r3;r3=Math.imul(HEAP[r32+4|0],HEAP[r32|0]);HEAP[r30]=r3;r3=_malloc(HEAP[r30]);HEAP[r31]=r3;if((HEAP[r31]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r3=HEAP[r31];r31=r3;r30=Math.imul(HEAP[r32+4|0],HEAP[r32|0]);for(r33=r31,r34=r33+r30;r33<r34;r33++){HEAP[r33]=0}HEAP[r28]=76;HEAP[r26]=8;r30=_malloc(HEAP[r26]);HEAP[r27]=r30;if((HEAP[r27]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r29]=HEAP[r27];HEAP[HEAP[r29]|0]=0;HEAP[HEAP[r29]+4|0]=HEAP[r28];r28=HEAP[r29];r29=r3+Math.imul(HEAP[r32|0],r2)+r1|0;HEAP[r29]=32;HEAP[r22]=r1;HEAP[r23]=r2;HEAP[r24]=0;HEAP[r20]=12;r2=_malloc(HEAP[r20]);HEAP[r21]=r2;if((HEAP[r21]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r25]=HEAP[r21];HEAP[HEAP[r25]|0]=HEAP[r22];HEAP[HEAP[r25]+4|0]=HEAP[r23];HEAP[HEAP[r25]+8|0]=HEAP[r24];_add234(r28,HEAP[r25]);L1378:while(1){HEAP[r18]=r28;HEAP[r19]=0;if((HEAP[r19]|0)>=(_countnode234(HEAP[HEAP[r18]|0])|0)){HEAP[r17]=0}else{r25=_delpos234_internal(HEAP[r18],HEAP[r19]);HEAP[r17]=r25}r25=HEAP[r17];r24=r25;if((r25|0)==0){break}r25=HEAP[r24|0];r23=HEAP[r24+4|0];HEAP[r16]=r24;if((HEAP[r16]|0)!=0){_free(HEAP[r16])}r24=1;r22=1;while(1){if((r22|0)==1){r35=1}else{r35=(r24|0)==4?-1:0}r21=(HEAP[r32|0]+r25+r35|0)%(HEAP[r32|0]|0);if((r24|0)==8){r36=1}else{r36=(r24|0)==2?-1:0}r2=(HEAP[r32+4|0]+r23+r36|0)%(HEAP[r32+4|0]|0);r20=Math.imul(HEAP[r32|0],r23)+r25|0;do{if((HEAP[HEAP[r32+32|0]+r20|0]&255&r24|0)!=0){r1=Math.imul(HEAP[r32|0],r2)+r21|0;if((HEAP[HEAP[r32+32|0]+r1|0]&255&((r24&3)<<2|(r24&12)>>2)|0)==0){break}r1=Math.imul(HEAP[r32|0],r23)+r25|0;if((HEAP[HEAP[r32+36|0]+r1|0]&255&r24|0)!=0){break}r1=r3+Math.imul(HEAP[r32|0],r2)+r21|0;if(HEAP[r1]<<24>>24!=0){break}r1=r3+Math.imul(HEAP[r32|0],r2)+r21|0;HEAP[r1]=32;HEAP[r12]=r21;HEAP[r13]=r2;HEAP[r14]=0;HEAP[r10]=12;r1=_malloc(HEAP[r10]);HEAP[r11]=r1;if((HEAP[r11]|0)==0){r4=1009;break L1378}HEAP[r15]=HEAP[r11];HEAP[HEAP[r15]|0]=HEAP[r12];HEAP[HEAP[r15]+4|0]=HEAP[r13];HEAP[HEAP[r15]+8|0]=HEAP[r14];_add234(r28,HEAP[r15])}}while(0);r2=r24<<1;r24=r2;if((r2|0)<16){r22=r2}else{continue L1378}}}if(r4==1009){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r9]=r28;do{if((HEAP[HEAP[r9]|0]|0)!=0){r4=_countnode234(HEAP[HEAP[r9]|0]);HEAP[r8]=r4;if((r4|0)==0){break}___assert_func(33560,1857,35984,33468)}else{HEAP[r8]=0}}while(0);HEAP[r7]=r28;_freenode234(HEAP[HEAP[r7]|0]);r28=HEAP[r7];HEAP[r6]=r28;if((r28|0)==0){r37=r6;r38=r7;r39=r3;STACKTOP=r5;return r39}_free(HEAP[r6]);r37=r6;r38=r7;r39=r3;STACKTOP=r5;return r39}function _net_solver(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88;r6=0;r7=STACKTOP;STACKTOP=STACKTOP+300|0;r8=r7;r9=r7+4;r10=r7+8;r11=r7+12;r12=r7+16;r13=r7+20;r14=r7+24;r15=r7+28;r16=r7+32;r17=r7+36;r18=r7+40;r19=r7+44;r20=r7+48;r21=r7+52;r22=r7+56;r23=r7+60;r24=r7+64;r25=r7+68;r26=r7+72;r27=r7+76;r28=r7+80;r29=r7+84;r30=r7+88;r31=r7+92;r32=r7+96;r33=r7+100;r34=r7+104;r35=r7+108;r36=r7+112;r37=r7+116;r38=r7+120;r39=r7+124;r40=r7+128;r41=r7+132;r42=r7+136;r43=r7+140;r44=r7+144;r45=r7+148;r46=r7+152;r47=r7+156;r48=r7+160;r49=r7+164;r50=r7+168;r51=r7+172;r52=r7+176;r53=r7+180;r54=r7+184;r55=r7+188;r56=r7+192;r57=r7+196;r58=r7+200;r59=r7+204;r60=r7+208;r61=r7+212;r62=r7+216;r63=r7+220;r64=r7+224;r65=r7+228;r66=r7+264;r67=r7+280;r68=r1;r1=r2;r2=r3;r3=r4;r4=r5;r5=Math.imul(r68<<2,r1);HEAP[r63]=r5;r5=_malloc(HEAP[r63]);HEAP[r64]=r5;if((HEAP[r64]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r5=HEAP[r64];r64=0;r63=0;L1419:do{if((r63|0)<(Math.imul(r1,r68)|0)){while(1){HEAP[(r63<<2)+r5|0]=HEAP[r2+r63|0]&255&15;r69=1;r70=r63;while(1){do{if((HEAP[r5+((r70<<2)-1)+r69|0]&255|0)==255){r6=1027}else{if(((HEAP[(r63<<2)+r5+(r69-1)|0]&8)>>3|(HEAP[(r63<<2)+r5+(r69-1)|0]&7)<<1|0)==(HEAP[(r63<<2)+r5|0]&255|0)){r6=1027;break}HEAP[(r63<<2)+r5+r69|0]=((HEAP[(r63<<2)+r5+(r69-1)|0]&8)>>3|(HEAP[(r63<<2)+r5+(r69-1)|0]&7)<<1)&255;break}}while(0);if(r6==1027){r6=0;HEAP[(r63<<2)+r5+r69|0]=-1}r71=r69+1|0;r69=r71;r72=r63;if((r71|0)<4){r70=r72}else{break}}if((HEAP[r2+r72|0]&255|0)!=0){r64=r64+1|0}r63=r63+1|0;if((r63|0)>=(Math.imul(r1,r68)|0)){break L1419}}}}while(0);r72=((Math.imul(r1,r68)-1)*5&-1)+9|0;HEAP[r61]=r72;r72=_malloc(HEAP[r61]);HEAP[r62]=r72;if((r72|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r72=HEAP[r62];r62=r72;r61=((Math.imul(r1,r68)-1)*5&-1)+9|0;for(r73=r62,r74=r73+r61;r73<r74;r73++){HEAP[r73]=0}r61=((Math.imul(r1,r68)-1)*5&-1)+9<<2;HEAP[r59]=r61;r61=_malloc(HEAP[r59]);HEAP[r60]=r61;if((HEAP[r60]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r61=HEAP[r60];r63=0;L1441:do{if((r63|0)<(((Math.imul(r1,r68)-1)*5&-1)+9|0)){while(1){HEAP[(r63<<2)+r61|0]=r64+1|0;r63=r63+1|0;if((r63|0)>=(((Math.imul(r1,r68)-1)*5&-1)+9|0)){break L1441}}}}while(0);r60=Math.imul(r1,r68);HEAP[r57]=r60;HEAP[r55]=HEAP[r57]<<2;r60=_malloc(HEAP[r55]);HEAP[r56]=r60;if((r60|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r58]=HEAP[r56];r56=HEAP[r57];HEAP[r52]=HEAP[r58];HEAP[r53]=r56;HEAP[r54]=0;L1448:do{if((HEAP[r54]|0)<(HEAP[r53]|0)){while(1){HEAP[(HEAP[r54]<<2)+HEAP[r52]|0]=6;HEAP[r54]=HEAP[r54]+1|0;if((HEAP[r54]|0)>=(HEAP[r53]|0)){break L1448}}}}while(0);r53=HEAP[r58];L1452:do{if((r4|0)==0){r63=0;L1454:do{if((r63|0)<(r68|0)){while(1){r58=r72+((Math.imul(r1-1|0,r68)+r63)*5&-1)+8|0;HEAP[r58]=2;HEAP[r72+(r63*5&-1)+2|0]=2;r63=r63+1|0;if((r63|0)>=(r68|0)){break L1454}}}}while(0);r63=0;if((r63|0)>=(r1|0)){break}while(1){r58=r72+Math.imul(r63*5&-1,r68)+4|0;HEAP[r58]=2;r58=r72+((r68-1+Math.imul(r68,r63))*5&-1)+1|0;HEAP[r58]=2;r63=r63+1|0;if((r63|0)>=(r1|0)){break L1452}}}}while(0);L1461:do{if((r3|0)!=0){r75=0;if((r75|0)>=(r1|0)){break}while(1){r76=0;L1465:do{if((r76|0)<(r68|0)){while(1){r4=1;while(1){r58=r3+Math.imul(r68,r75)+r76|0;if((HEAP[r58]&255&r4|0)!=0){if((r4|0)==1){r77=1}else{r77=(r4|0)==4?-1:0}if((r4|0)==8){r78=1}else{r78=(r4|0)==2?-1:0}r58=r72+((Math.imul(r68,r75)+r76)*5&-1)+r4|0;HEAP[r58]=2;r58=r72+((r4&3)<<2|(r4&12)>>2)+((Math.imul(r68,(r1+r75+r78|0)%(r1|0))+(r68+r76+r77|0)%(r68|0))*5&-1)|0;HEAP[r58]=2}r58=r4+r4|0;r4=r58;if(!((r58|0)<=8)){break}}r76=r76+1|0;if((r76|0)>=(r68|0)){break L1465}}}}while(0);r75=r75+1|0;if((r75|0)>=(r1|0)){break L1461}}}}while(0);r77=Math.imul(r1,r68);HEAP[r50]=r77;HEAP[r48]=20;r77=_malloc(HEAP[r48]);HEAP[r49]=r77;if((r77|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r51]=HEAP[r49];HEAP[r46]=HEAP[r50];r49=_malloc(HEAP[r46]);HEAP[r47]=r49;if((HEAP[r47]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[HEAP[r51]|0]=HEAP[r47];r47=HEAP[HEAP[r51]|0];r49=HEAP[r50];for(r73=r47,r74=r73+r49;r73<r74;r73++){HEAP[r73]=0}HEAP[HEAP[r51]+8|0]=HEAP[r50]+1|0;HEAP[r44]=HEAP[HEAP[r51]+8|0]<<2;r50=_malloc(HEAP[r44]);HEAP[r45]=r50;if((HEAP[r45]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[HEAP[r51]+4|0]=HEAP[r45];HEAP[HEAP[r51]+16|0]=0;HEAP[HEAP[r51]+12|0]=0;r45=HEAP[r51];r51=1;r50=r65+32|0;r44=r65+16|0;r73=r65+8|0;r74=r65+4|0;r49=r67|0;r47=r66|0;r46=r66|0;L1491:while(1){HEAP[r42]=r45;if((HEAP[HEAP[r42]+12|0]|0)==(HEAP[HEAP[r42]+16|0]|0)){HEAP[r41]=-1;r79=-1}else{r77=HEAP[r42]+12|0;r48=HEAP[r77];HEAP[r77]=r48+1|0;HEAP[r43]=HEAP[(r48<<2)+HEAP[HEAP[r42]+4|0]|0];if((HEAP[HEAP[r42]+12|0]|0)==(HEAP[HEAP[r42]+8|0]|0)){HEAP[HEAP[r42]+12|0]=0}HEAP[HEAP[HEAP[r42]|0]+HEAP[r43]|0]=0;r48=HEAP[r43];HEAP[r41]=r48;r79=r48}r48=r79;if((r79|0)==-1){if((r51|0)==0){r6=1172;break}r63=0;L1503:do{if((r63|0)<(Math.imul(r1,r68)|0)){while(1){HEAP[r39]=r45;HEAP[r40]=r63;do{if(HEAP[HEAP[HEAP[r39]|0]+HEAP[r40]|0]<<24>>24==0){HEAP[HEAP[HEAP[r39]|0]+HEAP[r40]|0]=1;r77=HEAP[r40];r78=HEAP[r39]+16|0;r3=HEAP[r78];HEAP[r78]=r3+1|0;HEAP[(r3<<2)+HEAP[HEAP[r39]+4|0]|0]=r77;if((HEAP[HEAP[r39]+16|0]|0)!=(HEAP[HEAP[r39]+8|0]|0)){break}HEAP[HEAP[r39]+16|0]=0}}while(0);r63=r63+1|0;if((r63|0)>=(Math.imul(r1,r68)|0)){break L1503}}}}while(0);r51=0;HEAP[r37]=r45;if((HEAP[HEAP[r37]+12|0]|0)==(HEAP[HEAP[r37]+16|0]|0)){HEAP[r36]=-1}else{r77=HEAP[r37]+12|0;r3=HEAP[r77];HEAP[r77]=r3+1|0;HEAP[r38]=HEAP[(r3<<2)+HEAP[HEAP[r37]+4|0]|0];if((HEAP[HEAP[r37]+12|0]|0)==(HEAP[HEAP[r37]+8|0]|0)){HEAP[HEAP[r37]+12|0]=0}HEAP[HEAP[HEAP[r37]|0]+HEAP[r38]|0]=0;HEAP[r36]=HEAP[r38]}r48=HEAP[r36]}r75=(r48|0)/(r68|0)&-1;r76=(r48|0)%(r68|0);r3=Math.imul(r68,r75)+r76|0;HEAP[r34]=r53;HEAP[r35]=r3;r3=_edsf_canonify(HEAP[r34],HEAP[r35],0);HEAP[r50]=0;HEAP[r44]=0;HEAP[r73]=0;HEAP[r74]=0;r69=0;r63=0;while(1){r77=(Math.imul(r68,r75)+r76<<2)+r5+r63|0;if((HEAP[r77]&255|0)==255){break}r77=(Math.imul(r68,r75)+r76<<2)+r5+r63|0;r78=HEAP[r77]&255;r77=1;r4=0;r58=0;HEAP[r49]=r3;r54=1;r80=1;while(1){r52=r72+((Math.imul(r68,r75)+r76)*5&-1)+r80|0;do{if((HEAP[r52]&255|0)==1){if((r80&r78|0)!=0){r6=1091;break}else{r6=1093;break}}else{r6=1091}}while(0);do{if(r6==1091){r6=0;r52=r72+((Math.imul(r68,r75)+r76)*5&-1)+r80|0;if((HEAP[r52]&255|0)!=2){break}if((r80&r78|0)!=0){r6=1093;break}else{break}}}while(0);if(r6==1093){r6=0;r77=0}do{if((r80&r78|0)!=0){r52=(((Math.imul(r68,r75)+r76)*5&-1)+r80<<2)+r61|0;if((HEAP[r52]|0)<=(r64|0)){r52=(((Math.imul(r68,r75)+r76)*5&-1)+r80<<2)+r61|0;r4=r4+HEAP[r52]|0}else{r52=r58;r58=r52+1|0;HEAP[(r52<<2)+r66|0]=r80}r52=r72+((Math.imul(r68,r75)+r76)*5&-1)+r80|0;if((HEAP[r52]&255|0)!=0){break}if((r80|0)==1){r81=1}else{r81=(r80|0)==4?-1:0}if((r80|0)==8){r82=1}else{r82=(r80|0)==2?-1:0}r52=Math.imul(r68,(r1+r75+r82|0)%(r1|0))+(r68+r76+r81|0)%(r68|0)|0;HEAP[r32]=r53;HEAP[r33]=r52;r52=_edsf_canonify(HEAP[r32],HEAP[r33],0);r56=0;L1545:do{if((r56|0)<(r54|0)){while(1){if((r52|0)==(HEAP[(r56<<2)+r67|0]|0)){break L1545}r56=r56+1|0;if((r56|0)>=(r54|0)){break L1545}}}}while(0);if((r56|0)==(r54|0)){r57=r54;r54=r57+1|0;HEAP[(r57<<2)+r67|0]=r52;break}else{r77=0;break}}}while(0);r57=r80+r80|0;r80=r57;if(!((r57|0)<=8)){break}}L1555:do{if((r58|0)==0){if((r4|0)<=0){r6=1119;break}if((r4+1|0)>=(r64|0)){r6=1119;break}r77=0;break}else{if((r58|0)==1){r4=r4+1|0;if((HEAP[(HEAP[r47]<<2)+r65|0]|0)>=(r4|0)){r6=1119;break}HEAP[(HEAP[r46]<<2)+r65|0]=r4;r6=1119;break}else{r54=0;if((r54|0)>=(r58|0)){r6=1119;break}while(1){HEAP[(HEAP[(r54<<2)+r66|0]<<2)+r65|0]=r64+1|0;r54=r54+1|0;if((r54|0)>=(r58|0)){r6=1119;break L1555}}}}}while(0);do{if(r6==1119){r6=0;if((r77|0)==0){break}r58=r69;r69=r58+1|0;r4=(Math.imul(r68,r75)+r76<<2)+r5+r58|0;HEAP[r4]=r78&255}}while(0);r78=r63+1|0;r63=r78;if((r78|0)>=4){break}}if((r69|0)<=0){r6=1123;break}L1572:do{if((r69|0)<(r63|0)){r51=1;if((r69|0)>=4){break}while(1){r3=r69;r69=r3+1|0;r48=(Math.imul(r68,r75)+r76<<2)+r5+r3|0;HEAP[r48]=-1;if((r69|0)>=4){break L1572}}}}while(0);r48=15;r3=0;r63=0;while(1){r78=(Math.imul(r68,r75)+r76<<2)+r5+r63|0;if((HEAP[r78]&255|0)==255){break}r78=(Math.imul(r68,r75)+r76<<2)+r5+r63|0;r48=r48&(HEAP[r78]&255);r78=(Math.imul(r68,r75)+r76<<2)+r5+r63|0;r3=r3|HEAP[r78]&255;r78=r63+1|0;r63=r78;if((r78|0)>=4){break}}r80=1;while(1){r78=r72+((Math.imul(r68,r75)+r76)*5&-1)+r80|0;do{if((HEAP[r78]&255|0)==0){if((r80|0)==1){r83=1}else{r83=(r80|0)==4?-1:0}r77=(r68+r76+r83|0)%(r68|0);if((r80|0)==8){r84=1}else{r84=(r80|0)==2?-1:0}r4=(r1+r75+r84|0)%(r1|0);r58=(r80&3)<<2|(r80&12)>>2;if((r80&r48|0)==0){if((r80&r3|0)!=0){break}r54=r72+((Math.imul(r68,r75)+r76)*5&-1)+r80|0;HEAP[r54]=2;r54=r72+((Math.imul(r68,r4)+r77)*5&-1)+r58|0;HEAP[r54]=2;r51=1;r54=Math.imul(r68,r4)+r77|0;HEAP[r18]=r45;HEAP[r19]=r54;if(HEAP[HEAP[HEAP[r18]|0]+HEAP[r19]|0]<<24>>24!=0){break}HEAP[HEAP[HEAP[r18]|0]+HEAP[r19]|0]=1;r54=HEAP[r19];r57=HEAP[r18]+16|0;r60=HEAP[r57];HEAP[r57]=r60+1|0;HEAP[(r60<<2)+HEAP[HEAP[r18]+4|0]|0]=r54;if((HEAP[HEAP[r18]+16|0]|0)!=(HEAP[HEAP[r18]+8|0]|0)){break}HEAP[HEAP[r18]+16|0]=0;break}r54=r72+((Math.imul(r68,r75)+r76)*5&-1)+r80|0;HEAP[r54]=1;r54=r72+((Math.imul(r68,r4)+r77)*5&-1)+r58|0;HEAP[r54]=1;r54=Math.imul(r68,r75)+r76|0;r58=Math.imul(r68,r4)+r77|0;HEAP[r29]=r53;HEAP[r30]=r54;HEAP[r31]=r58;r58=HEAP[r30];r54=HEAP[r31];HEAP[r22]=HEAP[r29];HEAP[r23]=r58;HEAP[r24]=r54;HEAP[r25]=0;r54=_edsf_canonify(HEAP[r22],HEAP[r23],r26);HEAP[r23]=r54;if((HEAP[(HEAP[r23]<<2)+HEAP[r22]|0]&2|0)==0){r6=1138;break L1491}HEAP[r25]=HEAP[r25]^HEAP[r26];r54=_edsf_canonify(HEAP[r22],HEAP[r24],r27);HEAP[r24]=r54;if((HEAP[(HEAP[r24]<<2)+HEAP[r22]|0]&2|0)==0){r6=1140;break L1491}HEAP[r25]=HEAP[r25]^HEAP[r27];r54=HEAP[r25];if((HEAP[r23]|0)==(HEAP[r24]|0)){if((r54|0)!=0){r6=1143;break L1491}}else{if(!((r54|0)==0|(HEAP[r25]|0)==1)){r6=1145;break L1491}if((HEAP[r23]|0)>(HEAP[r24]|0)){HEAP[r28]=HEAP[r23];HEAP[r23]=HEAP[r24];HEAP[r24]=HEAP[r28]}r54=(HEAP[r23]<<2)+HEAP[r22]|0;HEAP[r54]=(HEAP[(HEAP[r24]<<2)+HEAP[r22]|0]>>2<<2)+HEAP[r54]|0;HEAP[(HEAP[r24]<<2)+HEAP[r22]|0]=(HEAP[r25]|0)!=0&1|HEAP[r23]<<2}r54=_edsf_canonify(HEAP[r22],HEAP[r24],r27);HEAP[r24]=r54;if((HEAP[r24]|0)!=(HEAP[r23]|0)){r6=1150;break L1491}if((HEAP[r27]|0)!=(HEAP[r25]|0)){r6=1152;break L1491}r51=1;r54=Math.imul(r68,r4)+r77|0;HEAP[r20]=r45;HEAP[r21]=r54;if(HEAP[HEAP[HEAP[r20]|0]+HEAP[r21]|0]<<24>>24!=0){break}HEAP[HEAP[HEAP[r20]|0]+HEAP[r21]|0]=1;r54=HEAP[r21];r77=HEAP[r20]+16|0;r4=HEAP[r77];HEAP[r77]=r4+1|0;HEAP[(r4<<2)+HEAP[HEAP[r20]+4|0]|0]=r54;if((HEAP[HEAP[r20]+16|0]|0)!=(HEAP[HEAP[r20]+8|0]|0)){break}HEAP[HEAP[r20]+16|0]=0}}while(0);r78=r80+r80|0;r80=r78;if(!((r78|0)<=8)){break}}r80=1;r3=1;while(1){if((r3|0)==1){r85=1}else{r85=(r80|0)==4?-1:0}r48=(r68+r76+r85|0)%(r68|0);if((r80|0)==8){r86=1}else{r86=(r80|0)==2?-1:0}r78=(r1+r75+r86|0)%(r1|0);r54=(r80&3)<<2|(r80&12)>>2;do{if((HEAP[(r80<<2)+r65|0]|0)>0){r4=(((Math.imul(r68,r78)+r48)*5&-1)+r54<<2)+r61|0;if((HEAP[r4]|0)<=(HEAP[(r80<<2)+r65|0]|0)){break}r4=HEAP[(r80<<2)+r65|0];r77=(((Math.imul(r68,r78)+r48)*5&-1)+r54<<2)+r61|0;HEAP[r77]=r4;r51=1;r4=Math.imul(r68,r78)+r48|0;HEAP[r16]=r45;HEAP[r17]=r4;if(HEAP[HEAP[HEAP[r16]|0]+HEAP[r17]|0]<<24>>24!=0){break}HEAP[HEAP[HEAP[r16]|0]+HEAP[r17]|0]=1;r4=HEAP[r17];r77=HEAP[r16]+16|0;r58=HEAP[r77];HEAP[r77]=r58+1|0;HEAP[(r58<<2)+HEAP[HEAP[r16]+4|0]|0]=r4;if((HEAP[HEAP[r16]+16|0]|0)!=(HEAP[HEAP[r16]+8|0]|0)){break}HEAP[HEAP[r16]+16|0]=0}}while(0);r48=r80+r80|0;r80=r48;if((r48|0)<=8){r3=r48}else{continue L1491}}}if(r6==1150){___assert_func(33500,188,35936,33488)}else if(r6==1152){___assert_func(33500,189,35936,33424)}else if(r6==1123){___assert_func(33560,734,35744,34836)}else if(r6==1172){r69=1;r63=0;L1632:do{if((r63|0)<(Math.imul(r1,r68)|0)){while(1){r80=r63;if((HEAP[(r63<<2)+r5+1|0]&255|0)==255){if((HEAP[(r80<<2)+r5|0]&255|0)==255){break}HEAP[r2+r63|0]=(HEAP[(r63<<2)+r5|0]&255|16)&255}else{r16=r2+r80|0;HEAP[r16]=HEAP[r16]&255&-17&255;r69=0}r63=r63+1|0;if((r63|0)>=(Math.imul(r1,r68)|0)){break L1632}}___assert_func(33560,817,35744,34796)}}while(0);HEAP[r15]=r45;r45=HEAP[HEAP[r15]|0];HEAP[r14]=r45;if((r45|0)!=0){_free(HEAP[r14])}r14=HEAP[HEAP[r15]+4|0];HEAP[r13]=r14;if((r14|0)!=0){_free(HEAP[r13])}r13=HEAP[r15];HEAP[r12]=r13;if((r13|0)!=0){_free(HEAP[r12])}r12=r5;HEAP[r11]=r12;if((r12|0)!=0){_free(HEAP[r11])}r11=r72;HEAP[r10]=r11;if((r11|0)!=0){_free(HEAP[r10])}r10=r61;HEAP[r9]=r10;if((r10|0)!=0){_free(HEAP[r9])}r9=r53;HEAP[r8]=r9;if((r9|0)==0){r87=r8;r88=r69;STACKTOP=r7;return r88}_free(HEAP[r8]);r87=r8;r88=r69;STACKTOP=r7;return r88}else if(r6==1138){___assert_func(33500,152,35936,34100)}else if(r6==1140){___assert_func(33500,155,35936,33744)}else if(r6==1143){___assert_func(33500,161,35936,33640)}else if(r6==1145){___assert_func(33500,163,35936,33568)}}function _perturb(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65;r9=0;r10=STACKTOP;STACKTOP=STACKTOP+640|0;r11=r10;r12=r10+4;r13=r10+8;r14=r10+12;r15=r10+16;r16=r10+20;r17=r10+24;r18=r10+28;r19=r10+32;r20=r10+544;r21=r10+548;r22=r10+552;r23=r10+556;r24=r10+560;r25=r10+564;r26=r10+568;r27=r10+572;r28=r10+576;r29=r10+580;r30=r10+584;r31=r10+588;r32=r10+592;r33=r10+600;r34=r10+624;r35=r10+632;r36=r1;r1=r2;r2=r3;r3=r4;r4=r5;r5=r6;r6=r7;r7=r8;r8=0;r37=0;r38=0;r39=r5;r40=r6;r41=r7;while(1){if((r37|0)>=(r8|0)){r8=((r8*3&-1|0)/2&-1)+32|0;r38=_srealloc(r38,r8*12&-1)}HEAP[r38+(r37*12&-1)|0]=r39;HEAP[r38+(r37*12&-1)+4|0]=r40;HEAP[r38+(r37*12&-1)+8|0]=r41;r37=r37+1|0;r42=(r41&8)>>3|(r41&7)<<1;r43=r42;if((r42|0)==1){r44=1}else{r44=(r43|0)==4?-1:0}r42=(r36+r39+r44|0)%(r36|0);if((r43|0)==8){r45=1}else{r45=(r43|0)==2?-1:0}r46=(r1+r40+r45|0)%(r1|0);do{if((r3|0)!=0){r9=1206}else{r47=r42-r39|0;if((((r47|0)>-1?r47:-r47|0)|0)>1){r9=1207;break}r47=r46-r40|0;if((((r47|0)>-1?r47:-r47|0)|0)>1){r9=1207;break}else{r9=1206;break}}}while(0);do{if(r9==1206){r9=0;r47=r2+Math.imul(r36,r46)+r42|0;if((HEAP[r47]&16|0)!=0){r9=1207;break}r39=r42;r40=r46;if((r41|0)==1){r48=1}else{r48=(r41|0)==4?-1:0}r42=(r36+r39+r48|0)%(r36|0);if((r41|0)==8){r49=1}else{r49=(r41|0)==2?-1:0}r46=(r1+r40+r49|0)%(r1|0);if((r3|0)==0){r47=r42-r39|0;if(!((((r47|0)>-1?r47:-r47|0)|0)<=1)){break}r47=r46-r40|0;if(!((((r47|0)>-1?r47:-r47|0)|0)<=1)){break}}r47=r2+Math.imul(r36,r46)+r42|0;if((HEAP[r47]&16|0)!=0){break}r39=r42;r40=r46;r41=(r41&1)<<3|(r41&14)>>1;break}}while(0);if(r9==1207){r9=0;r41=r43}if((r39|0)!=(r5|0)){continue}if((r40|0)!=(r6|0)){continue}if((r41|0)==(r7|0)){break}}HEAP[r30]=r37*12&-1;r7=_malloc(HEAP[r30]);HEAP[r31]=r7;if((HEAP[r31]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}r7=HEAP[r31];r31=r7;r30=r38;r6=r37*12&-1;for(r50=r30,r51=r31,r52=r50+r6;r50<r52;r50++,r51++){HEAP[r51]=HEAP[r50]}HEAP[r23]=r7;HEAP[r24]=r37;HEAP[r25]=12;HEAP[r26]=r4;HEAP[r27]=HEAP[r23];r23=HEAP[r24];HEAP[r28]=r23-1|0;L1706:do{if((r23|0)>1){r24=r19;r6=r19;while(1){r31=_random_upto(HEAP[r26],HEAP[r28]+1|0);HEAP[r29]=r31;r31=HEAP[r28];if((HEAP[r29]|0)!=(r31|0)){r30=HEAP[r27]+Math.imul(HEAP[r28],HEAP[r25])|0;r5=HEAP[r27]+Math.imul(HEAP[r29],HEAP[r25])|0;r49=HEAP[r25];HEAP[r16]=r30;HEAP[r17]=r5;HEAP[r18]=r49;HEAP[r20]=HEAP[r16];HEAP[r21]=HEAP[r17];L1712:do{if((r49|0)>0){while(1){HEAP[r22]=HEAP[r18]>>>0<512?HEAP[r18]:512;r5=HEAP[r20];r30=HEAP[r22];for(r50=r5,r51=r24,r52=r50+r30;r50<r52;r50++,r51++){HEAP[r51]=HEAP[r50]}r30=HEAP[r20];r5=HEAP[r21];r48=HEAP[r22];for(r50=r5,r51=r30,r52=r50+r48;r50<r52;r50++,r51++){HEAP[r51]=HEAP[r50]}r48=HEAP[r21];r30=HEAP[r22];for(r50=r6,r51=r48,r52=r50+r30;r50<r52;r50++,r51++){HEAP[r51]=HEAP[r50]}HEAP[r20]=HEAP[r20]+HEAP[r22]|0;HEAP[r21]=HEAP[r21]+HEAP[r22]|0;r30=HEAP[r18]-HEAP[r22]|0;HEAP[r18]=r30;if((r30|0)<=0){break L1712}}}}while(0);r53=HEAP[r28]}else{r53=r31}HEAP[r28]=r53-1|0;if((r53|0)<=1){break L1706}}}}while(0);r53=0;L1718:do{if((r53|0)<(r37|0)){L1719:while(1){r39=HEAP[r7+(r53*12&-1)|0];r40=HEAP[r7+(r53*12&-1)+4|0];r28=HEAP[r7+(r53*12&-1)+8|0];r41=r28;if((r28|0)==1){r54=1}else{r54=(r41|0)==4?-1:0}r55=(r36+r39+r54|0)%(r36|0);if((r41|0)==8){r56=1}else{r56=(r41|0)==2?-1:0}r57=(r1+r40+r56|0)%(r1|0);do{if((r3|0)!=0){r9=1237}else{r28=r55-r39|0;if((((r28|0)>-1?r28:-r28|0)|0)>1){break}r28=r57-r40|0;if((((r28|0)>-1?r28:-r28|0)|0)>1){break}else{r9=1237;break}}}while(0);do{if(r9==1237){r9=0;r31=r2+Math.imul(r36,r40)+r39|0;if((HEAP[r31]&255&r41|0)!=0){break}r31=r2+Math.imul(r36,r40)+r39|0;if(((HEAP[r31]&255|r41)&15|0)==15){break}r31=r2+Math.imul(r36,r57)+r55|0;if((((r41&12)>>2|HEAP[r31]&255|(r41&3)<<2)&15|0)!=15){break L1719}}}while(0);r53=r53+1|0;if((r53|0)>=(r37|0)){break L1718}}r31=r2+Math.imul(r36,r40)+r39|0;HEAP[r31]=(HEAP[r31]&255|r41)&255;r31=r2+Math.imul(r36,r57)+r55|0;HEAP[r31]=((r41&3)<<2|(r41&12)>>2|HEAP[r31]&255)&255}}while(0);r55=r7;HEAP[r15]=r55;if((r55|0)!=0){_free(HEAP[r15])}if((r53|0)==(r37|0)){HEAP[r14]=r38;if((HEAP[r14]|0)!=0){_free(HEAP[r14])}STACKTOP=r10;return}r53=0;while(1){HEAP[(r53<<2)+r34|0]=0;HEAP[(r53<<2)+r35|0]=0;HEAP[(r53<<2)+r32|0]=0;HEAP[r33+(r53*12&-1)|0]=r39;HEAP[r33+(r53*12&-1)+4|0]=r40;HEAP[r33+(r53*12&-1)+8|0]=r41;r14=r53+1|0;r53=r14;if((r14|0)>=2){break}}L1749:while(1){r53=0;L1751:while(1){r39=HEAP[r33+(r53*12&-1)|0];r40=HEAP[r33+(r53*12&-1)+4|0];r14=HEAP[r33+(r53*12&-1)+8|0];r41=r14;if((r14|0)==1){r58=1}else{r58=(r41|0)==4?-1:0}r59=(r36+r39+r58|0)%(r36|0);if((r41|0)==8){r60=1}else{r60=(r41|0)==2?-1:0}r61=(r1+r40+r60|0)%(r1|0);do{if((HEAP[(r53<<2)+r34|0]|0)>0){if((HEAP[HEAP[(r53<<2)+r32|0]+((HEAP[(r53<<2)+r34|0]-1)*12&-1)|0]|0)!=(r59|0)){r9=1260;break}if((HEAP[HEAP[(r53<<2)+r32|0]+((HEAP[(r53<<2)+r34|0]-1)*12&-1)+4|0]|0)!=(r61|0)){r9=1260;break}if((HEAP[HEAP[(r53<<2)+r32|0]+((HEAP[(r53<<2)+r34|0]-1)*12&-1)+8|0]|0)!=((r41&3)<<2|(r41&12)>>2|0)){r9=1260;break}r14=(r53<<2)+r34|0;HEAP[r14]=HEAP[r14]-1|0;break}else{r9=1260}}while(0);if(r9==1260){r9=0;if((HEAP[(r53<<2)+r34|0]|0)>=(HEAP[(r53<<2)+r35|0]|0)){HEAP[(r53<<2)+r35|0]=((HEAP[(r53<<2)+r35|0]*3&-1|0)/2&-1)+32|0;r14=_srealloc(HEAP[(r53<<2)+r32|0],HEAP[(r53<<2)+r35|0]*12&-1);HEAP[(r53<<2)+r32|0]=r14}r14=(r53<<2)+r34|0;r15=HEAP[r14];HEAP[r14]=r15+1|0;r14=HEAP[(r53<<2)+r32|0]+(r15*12&-1)|0;r15=r33+(r53*12&-1)|0;for(r50=r15,r51=r14,r52=r50+12;r50<r52;r50++,r51++){HEAP[r51]=HEAP[r50]}}r41=(r41&3)<<2|(r41&12)>>2;r62=0;while(1){r14=r41;if((r53|0)==0){r41=(r41&8)>>3|(r14&7)<<1}else{r41=(r41&1)<<3|(r14&14)>>1}r14=r2+Math.imul(r36,r61)+r59|0;if((HEAP[r14]&255&r41|0)!=0){break}r14=r62+1|0;r62=r14;if((r14|0)>=4){r9=1310;break L1749}}HEAP[r33+(r53*12&-1)|0]=r59;HEAP[r33+(r53*12&-1)+4|0]=r61;HEAP[r33+(r53*12&-1)+8|0]=r41;if((r62|0)>=4){r9=1311;break L1749}if((HEAP[(r53<<2)+r34|0]|0)<=0){r9=1272;break L1749}do{if((HEAP[r33+(r53*12&-1)|0]|0)==(HEAP[HEAP[(r53<<2)+r32|0]|0]|0)){if((HEAP[r33+(r53*12&-1)+4|0]|0)!=(HEAP[HEAP[(r53<<2)+r32|0]+4|0]|0)){break}if((HEAP[r33+(r53*12&-1)+8|0]|0)==(HEAP[HEAP[(r53<<2)+r32|0]+8|0]|0)){break L1751}}}while(0);r14=r53+1|0;r53=r14;if((r14|0)>=2){continue L1749}}r62=_random_upto(r4,HEAP[(r53<<2)+r34|0]-1|0)+1|0;r39=HEAP[HEAP[(r53<<2)+r32|0]+(r62*12&-1)|0];r40=HEAP[HEAP[(r53<<2)+r32|0]+(r62*12&-1)+4|0];r41=HEAP[HEAP[(r53<<2)+r32|0]+(r62*12&-1)+8|0];if((r41|0)==1){r63=1}else{r63=(r41|0)==4?-1:0}r59=(r36+r39+r63|0)%(r36|0);if((r41|0)==8){r64=1}else{r64=(r41|0)==2?-1:0}r61=(r1+r40+r64|0)%(r1|0);r14=r2+Math.imul(r36,r40)+r39|0;HEAP[r14]=HEAP[r14]&255&(r41^-1)&255;r14=r2+Math.imul(r36,r61)+r59|0;HEAP[r14]=HEAP[r14]&255&(((r41&3)<<2|(r41&12)>>2)^-1)&255;if((r53|0)<2){r9=1282;break}}if(r9==1310){___assert_func(33560,1040,35708,34220)}else if(r9==1311){___assert_func(33560,1040,35708,34220)}else if(r9==1272){___assert_func(33560,1041,35708,34204)}else if(r9==1282){HEAP[r13]=HEAP[r32|0];if((HEAP[r13]|0)!=0){_free(HEAP[r13])}r13=HEAP[r32+4|0];HEAP[r12]=r13;if((r13|0)!=0){_free(HEAP[r12])}_qsort(r38,r37,12,110);r40=-1;r39=-1;r53=0;L1802:do{if((r53|0)<=(r37|0)){L1803:while(1){do{if((r53|0)==(r37|0)){r65=r39;r9=1290;break}else{r12=r39;if((HEAP[r38+(r53*12&-1)|0]|0)>(r12|0)){r65=r12;r9=1290;break}else{break}}}while(0);if(r9==1290){r9=0;if((r65|0)!=-1){L1812:do{if((r40|0)<(r1|0)){while(1){r12=r2+Math.imul(r36,r40)+r39|0;HEAP[r12]=(HEAP[r12]&255|16)&255;r40=r40+1|0;if((r40|0)>=(r1|0)){break L1812}}}}while(0);r40=-1;r39=-1}if((r53|0)==(r37|0)){break L1802}r39=HEAP[r38+(r53*12&-1)|0];r40=0}r12=r38+(r53*12&-1)|0;do{if((HEAP[r38+(r53*12&-1)+8|0]|0)==2){r39=HEAP[r12|0];r40=HEAP[r38+(r53*12&-1)+4|0]}else{if((HEAP[r12+8|0]|0)!=8){break}if((r39|0)!=(HEAP[r38+(r53*12&-1)|0]|0)){r9=1312;break L1803}if(!((r40|0)<=(HEAP[r38+(r53*12&-1)+4|0]|0))){r9=1313;break L1803}L1825:do{if((r40|0)<=(HEAP[r38+(r53*12&-1)+4|0]|0)){while(1){r13=r2+Math.imul(r36,r40)+r39|0;HEAP[r13]=(HEAP[r13]&255|16)&255;r40=r40+1|0;if(!((r40|0)<=(HEAP[r38+(r53*12&-1)+4|0]|0))){break L1825}}}}while(0);r40=-1;r39=-1}}while(0);r53=r53+1|0;if(!((r53|0)<=(r37|0))){break L1802}}if(r9==1312){___assert_func(33560,1118,35708,34160)}else if(r9==1313){___assert_func(33560,1118,35708,34160)}}}while(0);r9=r38;HEAP[r11]=r9;if((r9|0)!=0){_free(HEAP[r11])}STACKTOP=r10;return}}function _canvas_text_fallback(r1,r2,r3){return _dupstr(HEAP[r2|0])}function _status_bar(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r3=STACKTOP;STACKTOP=STACKTOP+144|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+132;r14=r3+136;r15=r3+140;r16=r1;if((HEAP[HEAP[r16|0]+40|0]|0)==0){STACKTOP=r3;return}if((HEAP[r16+24|0]|0)==0){___assert_func(33652,198,35672,34656)}HEAP[r10]=HEAP[r16+24|0];HEAP[r11]=r2;if((HEAP[HEAP[r10]+116|0]|0)!=(HEAP[r11]|0)){HEAP[r8]=HEAP[HEAP[r10]+116|0];if((HEAP[r8]|0)!=0){_free(HEAP[r8])}r8=_dupstr(HEAP[r11]);HEAP[HEAP[r10]+116|0]=r8}do{if((HEAP[HEAP[HEAP[r10]+8|0]+180|0]|0)!=0){HEAP[r15]=HEAP[HEAP[r10]+112|0]&-1;HEAP[r14]=(HEAP[r15]|0)/60&-1;HEAP[r15]=(HEAP[r15]|0)%60;r8=HEAP[r15];_sprintf(r12|0,34260,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=HEAP[r14],HEAP[tempInt+4]=r8,tempInt));r8=_strlen(r12|0)+_strlen(HEAP[r11])+1|0;HEAP[r6]=r8;r8=_malloc(HEAP[r6]);HEAP[r7]=r8;if((HEAP[r7]|0)!=0){HEAP[r13]=HEAP[r7];_strcpy(HEAP[r13],r12|0);_strcat(HEAP[r13],HEAP[r11]);HEAP[r9]=HEAP[r13];break}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}else{r8=_dupstr(HEAP[r11]);HEAP[r9]=r8}}while(0);r11=HEAP[r9];do{if((HEAP[r16+28|0]|0)!=0){if((_strcmp(r11,HEAP[r16+28|0])|0)!=0){break}HEAP[r4]=r11;if((HEAP[r4]|0)!=0){_free(HEAP[r4])}STACKTOP=r3;return}}while(0);FUNCTION_TABLE[HEAP[HEAP[r16|0]+40|0]](HEAP[r16+4|0],r11);r4=HEAP[r16+28|0];HEAP[r5]=r4;if((r4|0)!=0){_free(HEAP[r5])}HEAP[r16+28|0]=r11;STACKTOP=r3;return}function _edsf_canonify(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=r1;r1=r2;r2=r3;r3=r1;r5=0;if(!((r1|0)>=0)){___assert_func(33500,110,35948,34888)}r6=r1;L1875:do{if((HEAP[(r1<<2)+r4|0]&2|0)==0){r7=r6;while(1){r5=r5^HEAP[(r7<<2)+r4|0]&1;r1=HEAP[(r1<<2)+r4|0]>>2;r8=r1;if((HEAP[(r1<<2)+r4|0]&2|0)==0){r7=r8}else{r9=r8;break L1875}}}else{r9=r6}}while(0);r6=r9;if((r2|0)!=0){HEAP[r2]=r5}r1=r3;L1882:do{if((r1|0)!=(r6|0)){while(1){r3=HEAP[(r1<<2)+r4|0]>>2;r2=HEAP[(r1<<2)+r4|0]&1^r5;HEAP[(r1<<2)+r4|0]=r6<<2|r5;r5=r2;r1=r3;if((r1|0)==(r6|0)){break L1882}}}}while(0);if((r5|0)==0){return r1}else{___assert_func(33500,137,35948,34540)}}function _fatal(r1){var r2,r3;r2=STACKTOP;STACKTOP=STACKTOP+4|0;r3=r2;_fwrite(33400,13,1,HEAP[_stderr]);HEAP[r3]=r1;_fprintf(HEAP[_stderr],33356,HEAP[r3]);_fputc(10,HEAP[_stderr]);_exit(1)}function _init_game(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+388|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r4+24;r12=r4+28;r13=r4+32;r14=r4+36;r15=r4+40;r16=r4+44;r17=r4+48;r18=r4+52;r19=r4+56;r20=r4+60;r21=r4+64;r22=r4+68;r23=r4+72;r24=r4+76;r25=r4+80;r26=r4+84;r27=r4+88;r28=r4+92;r29=r4+96;r30=r4+100;r31=r4+104;r32=r4+108;r33=r4+188;r34=r4+192;r35=r4+196;r36=r4+200;r37=r4+204;r38=r4+208;r39=r4+212;r40=r4+216;r41=r4+220;r42=r4+224;r43=r4+228;r44=r4+232;r45=r4+236;r46=r4+240;r47=r4+244;r48=r4+248;r49=r4+252;r50=r4+256;r51=r4+260;r52=r4+264;r53=r4+268;r54=r4+272;r55=r4+276;r56=r4+280;r57=r4+284;r58=r4+364;r59=r4+368;r60=r4+372;r61=r4+376;r62=r4+380;r63=r4+384;r64=r1;r1=r2;HEAP[r50]=r64;HEAP[r51]=32768;HEAP[r52]=33256;HEAP[r53]=r1;HEAP[r48]=152;r2=_malloc(HEAP[r48]);HEAP[r49]=r2;if((HEAP[r49]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r54]=HEAP[r49];HEAP[r45]=r55;HEAP[r46]=r56;HEAP[r43]=8;r49=_malloc(HEAP[r43]);HEAP[r44]=r49;if((HEAP[r44]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[r47]=HEAP[r44];_gettimeofday(HEAP[r47],0);HEAP[HEAP[r45]]=HEAP[r47];HEAP[HEAP[r46]]=8;HEAP[HEAP[r54]|0]=HEAP[r50];HEAP[HEAP[r54]+8|0]=HEAP[r51];r50=_random_new(HEAP[r55],HEAP[r56]);HEAP[HEAP[r54]+4|0]=r50;HEAP[HEAP[r54]+60|0]=0;HEAP[HEAP[r54]+56|0]=0;HEAP[HEAP[r54]+52|0]=0;HEAP[HEAP[r54]+64|0]=0;r50=FUNCTION_TABLE[HEAP[HEAP[r51]+12|0]]();HEAP[HEAP[r54]+68|0]=r50;HEAP[HEAP[r54]+144|0]=0;HEAP[HEAP[r54]+148|0]=0;_sprintf(r57|0,34824,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[HEAP[HEAP[r54]+8|0]|0],tempInt));HEAP[r60]=0;HEAP[r59]=0;L1897:do{if(HEAP[r57+HEAP[r59]|0]<<24>>24!=0){while(1){if((_isspace(HEAP[r57+HEAP[r59]|0]&255)|0)==0){r50=_toupper(HEAP[r57+HEAP[r59]|0]&255)&255;r51=HEAP[r60];HEAP[r60]=r51+1|0;HEAP[r57+r51|0]=r50}HEAP[r59]=HEAP[r59]+1|0;if(HEAP[r57+HEAP[r59]|0]<<24>>24==0){break L1897}}}}while(0);HEAP[r57+HEAP[r60]|0]=0;r60=_getenv(r57|0);HEAP[r58]=r60;if((r60|0)!=0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r54]+8|0]+20|0]](HEAP[HEAP[r54]+68|0],HEAP[r58])}HEAP[HEAP[r54]+72|0]=0;HEAP[HEAP[r54]+36|0]=0;HEAP[HEAP[r54]+32|0]=0;HEAP[HEAP[r54]+40|0]=0;HEAP[HEAP[r54]+44|0]=0;HEAP[HEAP[r54]+48|0]=2;HEAP[HEAP[r54]+76|0]=0;HEAP[HEAP[r54]+84|0]=0;HEAP[HEAP[r54]+12|0]=0;HEAP[HEAP[r54]+16|0]=0;HEAP[HEAP[r54]+20|0]=0;HEAP[HEAP[r54]+28|0]=0;HEAP[HEAP[r54]+24|0]=0;HEAP[HEAP[r54]+92|0]=0;HEAP[HEAP[r54]+88|0]=0;HEAP[HEAP[r54]+100|0]=0;HEAP[HEAP[r54]+96|0]=0;HEAP[HEAP[r54]+104|0]=0;HEAP[HEAP[r54]+80|0]=0;HEAP[HEAP[r54]+124|0]=0;HEAP[HEAP[r54]+116|0]=0;HEAP[HEAP[r54]+108|0]=0;HEAP[HEAP[r54]+112|0]=0;HEAP[HEAP[r54]+140|0]=0;HEAP[HEAP[r54]+136|0]=0;HEAP[HEAP[r54]+132|0]=0;do{if((HEAP[r52]|0)!=0){r58=HEAP[r54];r60=HEAP[r53];HEAP[r39]=HEAP[r52];HEAP[r40]=r58;HEAP[r41]=r60;HEAP[r37]=32;r60=_malloc(HEAP[r37]);HEAP[r38]=r60;if((HEAP[r38]|0)!=0){HEAP[r42]=HEAP[r38];HEAP[HEAP[r42]|0]=HEAP[r39];HEAP[HEAP[r42]+4|0]=HEAP[r41];HEAP[HEAP[r42]+8|0]=0;HEAP[HEAP[r42]+16|0]=0;HEAP[HEAP[r42]+12|0]=0;HEAP[HEAP[r42]+20|0]=1;HEAP[HEAP[r42]+24|0]=HEAP[r40];HEAP[HEAP[r42]+28|0]=0;HEAP[HEAP[r54]+120|0]=HEAP[r42];break}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}else{HEAP[HEAP[r54]+120|0]=0}}while(0);HEAP[r31]=HEAP[r54];HEAP[HEAP[r31]+128|0]=HEAP[HEAP[HEAP[r31]+8|0]+120|0];_sprintf(r32|0,35112,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[HEAP[HEAP[r31]+8|0]|0],tempInt));HEAP[r35]=0;HEAP[r34]=0;L1914:do{if(HEAP[r32+HEAP[r34]|0]<<24>>24!=0){while(1){if((_isspace(HEAP[r32+HEAP[r34]|0]&255)|0)==0){r42=_toupper(HEAP[r32+HEAP[r34]|0]&255)&255;r40=HEAP[r35];HEAP[r35]=r40+1|0;HEAP[r32+r40|0]=r42}HEAP[r34]=HEAP[r34]+1|0;if(HEAP[r32+HEAP[r34]|0]<<24>>24==0){break L1914}}}}while(0);HEAP[r32+HEAP[r35]|0]=0;r35=_getenv(r32|0);HEAP[r33]=r35;do{if((r35|0)!=0){if(!((_sscanf(HEAP[r33],35100,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=r36,tempInt))|0)==1&(HEAP[r36]|0)>0)){break}HEAP[HEAP[r31]+128|0]=HEAP[r36]}}while(0);r36=HEAP[r55];HEAP[r30]=r36;if((r36|0)!=0){_free(HEAP[r30])}r30=HEAP[r54];_frontend_set_game_info(r64,r30,35172,1,1,0,1,0,0,0);HEAP[r20]=r30;L1928:do{if((HEAP[HEAP[r20]+24|0]|0)==0){if((FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+16|0]](HEAP[HEAP[r20]+24|0],r21,r22)|0)==0){break}while(1){if((HEAP[HEAP[r20]+28|0]|0)<=(HEAP[HEAP[r20]+24|0]|0)){HEAP[HEAP[r20]+28|0]=HEAP[HEAP[r20]+24|0]+10|0;r54=_srealloc(HEAP[HEAP[r20]+12|0],HEAP[HEAP[r20]+28|0]<<2);HEAP[HEAP[r20]+12|0]=r54;r54=_srealloc(HEAP[HEAP[r20]+16|0],HEAP[HEAP[r20]+28|0]<<2);HEAP[HEAP[r20]+16|0]=r54;r54=_srealloc(HEAP[HEAP[r20]+20|0],HEAP[HEAP[r20]+28|0]<<2);HEAP[HEAP[r20]+20|0]=r54}HEAP[(HEAP[HEAP[r20]+24|0]<<2)+HEAP[HEAP[r20]+12|0]|0]=HEAP[r22];HEAP[(HEAP[HEAP[r20]+24|0]<<2)+HEAP[HEAP[r20]+16|0]|0]=HEAP[r21];r54=FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+24|0]](HEAP[r22],1);HEAP[(HEAP[HEAP[r20]+24|0]<<2)+HEAP[HEAP[r20]+20|0]|0]=r54;r54=HEAP[r20]+24|0;HEAP[r54]=HEAP[r54]+1|0;if((FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+16|0]](HEAP[HEAP[r20]+24|0],r21,r22)|0)==0){break L1928}}}}while(0);_sprintf(r32|0,34980,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP[tempInt]=HEAP[HEAP[HEAP[r20]+8|0]|0],tempInt));HEAP[r26]=0;HEAP[r25]=0;L1936:do{if(HEAP[r32+HEAP[r25]|0]<<24>>24!=0){while(1){if((_isspace(HEAP[r32+HEAP[r25]|0]&255)|0)==0){r22=_toupper(HEAP[r32+HEAP[r25]|0]&255)&255;r21=HEAP[r26];HEAP[r26]=r21+1|0;HEAP[r32+r21|0]=r22}HEAP[r25]=HEAP[r25]+1|0;if(HEAP[r32+HEAP[r25]|0]<<24>>24==0){break L1936}}}}while(0);HEAP[r32+HEAP[r26]|0]=0;r26=_getenv(r32|0);HEAP[r23]=r26;if((r26|0)!=0){r26=_dupstr(HEAP[r23]);HEAP[r23]=r26;HEAP[r24]=r26;if(HEAP[HEAP[r24]]<<24>>24!=0){while(1){HEAP[r27]=HEAP[r24];r25=HEAP[r24];L1948:do{if((HEAP[HEAP[r24]]<<24>>24|0)!=0){r22=r25;while(1){r21=HEAP[r24];if((HEAP[r22]<<24>>24|0)==58){r65=r21;break L1948}HEAP[r24]=r21+1|0;r21=HEAP[r24];if((HEAP[HEAP[r24]]<<24>>24|0)!=0){r22=r21}else{r65=r21;break L1948}}}else{r65=r25}}while(0);if(HEAP[r65]<<24>>24!=0){r25=HEAP[r24];HEAP[r24]=r25+1|0;HEAP[r25]=0}HEAP[r28]=HEAP[r24];r25=HEAP[r24];L1956:do{if((HEAP[HEAP[r24]]<<24>>24|0)!=0){r22=r25;while(1){r21=HEAP[r24];if((HEAP[r22]<<24>>24|0)==58){r66=r21;break L1956}HEAP[r24]=r21+1|0;r21=HEAP[r24];if((HEAP[HEAP[r24]]<<24>>24|0)!=0){r22=r21}else{r66=r21;break L1956}}}else{r66=r25}}while(0);if(HEAP[r66]<<24>>24!=0){r25=HEAP[r24];HEAP[r24]=r25+1|0;HEAP[r25]=0}r25=FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+12|0]]();HEAP[r29]=r25;FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+20|0]](HEAP[r29],HEAP[r28]);r25=(FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+48|0]](HEAP[r29],1)|0)!=0;r22=HEAP[r20];if(r25){FUNCTION_TABLE[HEAP[HEAP[r22+8|0]+28|0]](HEAP[r29])}else{if((HEAP[r22+28|0]|0)<=(HEAP[HEAP[r20]+24|0]|0)){HEAP[HEAP[r20]+28|0]=HEAP[HEAP[r20]+24|0]+10|0;r22=_srealloc(HEAP[HEAP[r20]+12|0],HEAP[HEAP[r20]+28|0]<<2);HEAP[HEAP[r20]+12|0]=r22;r22=_srealloc(HEAP[HEAP[r20]+16|0],HEAP[HEAP[r20]+28|0]<<2);HEAP[HEAP[r20]+16|0]=r22;r22=_srealloc(HEAP[HEAP[r20]+20|0],HEAP[HEAP[r20]+28|0]<<2);HEAP[HEAP[r20]+20|0]=r22}HEAP[(HEAP[HEAP[r20]+24|0]<<2)+HEAP[HEAP[r20]+12|0]|0]=HEAP[r29];r22=_dupstr(HEAP[r27]);HEAP[(HEAP[HEAP[r20]+24|0]<<2)+HEAP[HEAP[r20]+16|0]|0]=r22;r22=FUNCTION_TABLE[HEAP[HEAP[HEAP[r20]+8|0]+24|0]](HEAP[r29],1);HEAP[(HEAP[HEAP[r20]+24|0]<<2)+HEAP[HEAP[r20]+20|0]|0]=r22;r22=HEAP[r20]+24|0;HEAP[r22]=HEAP[r22]+1|0}if(HEAP[HEAP[r24]]<<24>>24==0){break}}r67=HEAP[r23]}else{r67=r26}HEAP[r19]=r67;if((r67|0)!=0){_free(HEAP[r19])}}r19=HEAP[HEAP[r20]+24|0];HEAP[r61]=r19;L1977:do{if((r19|0)>0){r68=0;if((r68|0)>=(HEAP[r61]|0)){break}r20=r68;while(1){HEAP[r15]=r30;HEAP[r16]=r20;HEAP[r17]=r62;HEAP[r18]=r63;if(!((r20|0)>=0)){r3=1429;break}if((HEAP[r16]|0)>=(HEAP[HEAP[r15]+24|0]|0)){r3=1428;break}HEAP[HEAP[r17]]=HEAP[(HEAP[r16]<<2)+HEAP[HEAP[r15]+16|0]|0];HEAP[HEAP[r18]]=HEAP[(HEAP[r16]<<2)+HEAP[HEAP[r15]+12|0]|0];_frontend_add_preset(r64,HEAP[r62],HEAP[r63]);r68=r68+1|0;r67=r68;if((r67|0)<(HEAP[r61]|0)){r20=r67}else{break L1977}}if(r3==1429){___assert_func(34272,1021,35852,34948)}else if(r3==1428){___assert_func(34272,1021,35852,34948)}}}while(0);HEAP[r5]=r30;HEAP[r6]=r61;r30=FUNCTION_TABLE[HEAP[HEAP[HEAP[r5]+8|0]+132|0]](HEAP[HEAP[r5]|0],HEAP[r6]);HEAP[r7]=r30;HEAP[r8]=0;L1988:do{if((HEAP[r8]|0)<(HEAP[HEAP[r6]]|0)){r30=r32|0;r3=r32|0;while(1){r63=HEAP[r8];_sprintf(r30,35084,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP[tempInt]=HEAP[HEAP[HEAP[r5]+8|0]|0],HEAP[tempInt+4]=r63,tempInt));HEAP[r14]=0;HEAP[r13]=0;L1992:do{if(HEAP[r32+HEAP[r13]|0]<<24>>24!=0){while(1){if((_isspace(HEAP[r32+HEAP[r13]|0]&255)|0)==0){r63=_toupper(HEAP[r32+HEAP[r13]|0]&255)&255;r62=HEAP[r14];HEAP[r14]=r62+1|0;HEAP[r32+r62|0]=r63}HEAP[r13]=HEAP[r13]+1|0;if(HEAP[r32+HEAP[r13]|0]<<24>>24==0){break L1992}}}}while(0);HEAP[r32+HEAP[r14]|0]=0;r63=_getenv(r3);HEAP[r9]=r63;do{if((r63|0)!=0){if((_sscanf(HEAP[r9],35064,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP[tempInt]=r10,HEAP[tempInt+4]=r11,HEAP[tempInt+8]=r12,tempInt))|0)!=3){break}HEAP[((HEAP[r8]*3&-1)<<2)+HEAP[r7]|0]=(HEAP[r10]>>>0)/255;HEAP[((HEAP[r8]*3&-1)+1<<2)+HEAP[r7]|0]=(HEAP[r11]>>>0)/255;HEAP[((HEAP[r8]*3&-1)+2<<2)+HEAP[r7]|0]=(HEAP[r12]>>>0)/255}}while(0);HEAP[r8]=HEAP[r8]+1|0;if((HEAP[r8]|0)>=(HEAP[HEAP[r6]]|0)){break L1988}}}}while(0);r6=HEAP[r7];r68=0;if((r68|0)>=(HEAP[r61]|0)){STACKTOP=r4;return}while(1){_canvas_set_palette_entry(r1,r68,HEAP[((r68*3&-1)<<2)+r6|0]*255&-1,HEAP[((r68*3&-1)+1<<2)+r6|0]*255&-1,HEAP[((r68*3&-1)+2<<2)+r6|0]*255&-1);r68=r68+1|0;if((r68|0)>=(HEAP[r61]|0)){break}}STACKTOP=r4;return}function _sfree(r1){var r2;r2=r1;if((r2|0)==0){return}_free(r2);return}function _srealloc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68;r3=STACKTOP;STACKTOP=STACKTOP+204|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r3+100;r30=r3+104;r31=r3+108;r32=r3+112;r33=r3+116;r34=r3+120;r35=r3+124;r36=r3+128;r37=r3+132;r38=r3+136;r39=r3+140;r40=r3+144;r41=r3+148;r42=r3+152;r43=r3+156;r44=r3+160;r45=r3+164;r46=r3+168;r47=r3+172;r48=r3+176;r49=r3+180;r50=r3+184;r51=r3+188;r52=r3+192;r53=r3+196;r54=r3+200;r55=r1;r1=r2;if((r55|0)!=0){HEAP[r47]=r55;HEAP[r48]=r1;HEAP[r49]=0;r55=HEAP[r48];do{if((HEAP[r47]|0)==0){r2=_malloc(r55);HEAP[r49]=r2}else{if(r55>>>0>=4294967232){r2=___errno_location();HEAP[r2]=12;break}if(HEAP[r48]>>>0<11){r56=16}else{r56=HEAP[r48]+11&-8}HEAP[r50]=r56;HEAP[r51]=HEAP[r47]-8|0;HEAP[r52]=35176;r2=HEAP[r51];r57=HEAP[r50];HEAP[r14]=HEAP[r52];HEAP[r15]=r2;HEAP[r16]=r57;HEAP[r17]=1;HEAP[r18]=0;HEAP[r19]=HEAP[HEAP[r15]+4|0]&-8;HEAP[r20]=HEAP[r15]+HEAP[r19]|0;do{if(HEAP[r15]>>>0>=HEAP[HEAP[r14]+16|0]>>>0){if((HEAP[HEAP[r15]+4|0]&3|0)==1){r58=0;break}if(HEAP[r15]>>>0>=HEAP[r20]>>>0){r58=0;break}r58=(HEAP[HEAP[r20]+4|0]&1|0)!=0}else{r58=0}}while(0);if((r58&1|0)==0){_abort()}L2034:do{if((HEAP[HEAP[r15]+4|0]&3|0)==0){r57=HEAP[r15];r2=HEAP[r16];r59=HEAP[r17];HEAP[r5]=HEAP[r14];HEAP[r6]=r57;HEAP[r7]=r2;HEAP[r8]=r59;HEAP[r9]=HEAP[HEAP[r6]+4|0]&-8;L2131:do{if(HEAP[r7]>>>3>>>0<32){HEAP[r4]=0}else{do{if(HEAP[r9]>>>0>=(HEAP[r7]+4|0)>>>0){if(!((HEAP[r9]-HEAP[r7]|0)>>>0<=HEAP[33240]<<1>>>0)){break}HEAP[r4]=HEAP[r6];break L2131}}while(0);HEAP[r10]=HEAP[HEAP[r6]|0];HEAP[r11]=HEAP[r9]+HEAP[r10]+16|0;HEAP[r12]=(HEAP[33236]-1^-1)&HEAP[r7]+HEAP[33236]+30;HEAP[r13]=-1;HEAP[r4]=0}}while(0);r59=HEAP[r4];HEAP[r18]=r59;r60=r59}else{if(HEAP[r19]>>>0>=HEAP[r16]>>>0){HEAP[r21]=HEAP[r19]-HEAP[r16]|0;if(HEAP[r21]>>>0>=16){HEAP[r22]=HEAP[r15]+HEAP[r16]|0;HEAP[HEAP[r15]+4|0]=HEAP[r16]|2|HEAP[HEAP[r15]+4|0]&1;r59=HEAP[r15]+HEAP[r16]+4|0;HEAP[r59]=HEAP[r59]|1;HEAP[HEAP[r22]+4|0]=HEAP[r21]|2|HEAP[HEAP[r22]+4|0]&1;r59=HEAP[r22]+HEAP[r21]+4|0;HEAP[r59]=HEAP[r59]|1;_dispose_chunk(HEAP[r14],HEAP[r22],HEAP[r21])}r59=HEAP[r15];HEAP[r18]=r59;r60=r59;break}do{if((HEAP[r20]|0)==(HEAP[HEAP[r14]+24|0]|0)){if((HEAP[HEAP[r14]+12|0]+HEAP[r19]|0)>>>0<=HEAP[r16]>>>0){break}HEAP[r23]=HEAP[HEAP[r14]+12|0]+HEAP[r19]|0;HEAP[r24]=HEAP[r23]-HEAP[r16]|0;HEAP[r25]=HEAP[r15]+HEAP[r16]|0;HEAP[HEAP[r15]+4|0]=HEAP[r16]|2|HEAP[HEAP[r15]+4|0]&1;r59=HEAP[r15]+HEAP[r16]+4|0;HEAP[r59]=HEAP[r59]|1;HEAP[HEAP[r25]+4|0]=HEAP[r24]|1;HEAP[HEAP[r14]+24|0]=HEAP[r25];HEAP[HEAP[r14]+12|0]=HEAP[r24];r59=HEAP[r15];HEAP[r18]=r59;r60=r59;break L2034}else{if((HEAP[r20]|0)==(HEAP[HEAP[r14]+20|0]|0)){HEAP[r26]=HEAP[HEAP[r14]+8|0];if(!((HEAP[r26]+HEAP[r19]|0)>>>0>=HEAP[r16]>>>0)){break}HEAP[r27]=HEAP[r26]+HEAP[r19]+ -HEAP[r16]|0;if(HEAP[r27]>>>0>=16){HEAP[r28]=HEAP[r15]+HEAP[r16]|0;HEAP[r29]=HEAP[r28]+HEAP[r27]|0;HEAP[HEAP[r15]+4|0]=HEAP[r16]|2|HEAP[HEAP[r15]+4|0]&1;r59=HEAP[r15]+HEAP[r16]+4|0;HEAP[r59]=HEAP[r59]|1;HEAP[HEAP[r28]+4|0]=HEAP[r27]|1;HEAP[HEAP[r28]+HEAP[r27]|0]=HEAP[r27];r59=HEAP[r29]+4|0;HEAP[r59]=HEAP[r59]&-2;HEAP[HEAP[r14]+8|0]=HEAP[r27];HEAP[HEAP[r14]+20|0]=HEAP[r28]}else{HEAP[r30]=HEAP[r26]+HEAP[r19]|0;HEAP[HEAP[r15]+4|0]=HEAP[r30]|2|HEAP[HEAP[r15]+4|0]&1;r59=HEAP[r15]+HEAP[r30]+4|0;HEAP[r59]=HEAP[r59]|1;HEAP[HEAP[r14]+8|0]=0;HEAP[HEAP[r14]+20|0]=0}r59=HEAP[r15];HEAP[r18]=r59;r60=r59;break L2034}if((HEAP[HEAP[r20]+4|0]&2|0)!=0){break}HEAP[r31]=HEAP[HEAP[r20]+4|0]&-8;if(!((HEAP[r31]+HEAP[r19]|0)>>>0>=HEAP[r16]>>>0)){break}HEAP[r32]=HEAP[r31]+HEAP[r19]+ -HEAP[r16]|0;r59=HEAP[r20];do{if(HEAP[r31]>>>3>>>0<32){HEAP[r33]=HEAP[r59+8|0];HEAP[r34]=HEAP[HEAP[r20]+12|0];HEAP[r35]=HEAP[r31]>>>3;do{if((HEAP[r33]|0)==((HEAP[r35]<<3)+HEAP[r14]+40|0)){r61=1}else{if(!(HEAP[r33]>>>0>=HEAP[HEAP[r14]+16|0]>>>0)){r61=0;break}r61=(HEAP[HEAP[r33]+12|0]|0)==(HEAP[r20]|0)}}while(0);if((r61&1|0)==0){_abort()}if((HEAP[r34]|0)==(HEAP[r33]|0)){r2=HEAP[r14]|0;HEAP[r2]=HEAP[r2]&(1<<HEAP[r35]^-1);break}do{if((HEAP[r34]|0)==((HEAP[r35]<<3)+HEAP[r14]+40|0)){r62=1}else{if(!(HEAP[r34]>>>0>=HEAP[HEAP[r14]+16|0]>>>0)){r62=0;break}r62=(HEAP[HEAP[r34]+8|0]|0)==(HEAP[r20]|0)}}while(0);if((r62&1|0)!=0){HEAP[HEAP[r33]+12|0]=HEAP[r34];HEAP[HEAP[r34]+8|0]=HEAP[r33];break}else{_abort()}}else{HEAP[r36]=r59;HEAP[r37]=HEAP[HEAP[r36]+24|0];r2=HEAP[r36];L2058:do{if((HEAP[HEAP[r36]+12|0]|0)!=(HEAP[r36]|0)){HEAP[r39]=HEAP[r2+8|0];HEAP[r38]=HEAP[HEAP[r36]+12|0];do{if(HEAP[r39]>>>0>=HEAP[HEAP[r14]+16|0]>>>0){if((HEAP[HEAP[r39]+12|0]|0)!=(HEAP[r36]|0)){r63=0;break}r63=(HEAP[HEAP[r38]+8|0]|0)==(HEAP[r36]|0)}else{r63=0}}while(0);if((r63&1|0)!=0){HEAP[HEAP[r39]+12|0]=HEAP[r38];HEAP[HEAP[r38]+8|0]=HEAP[r39];break}else{_abort()}}else{r57=r2+20|0;HEAP[r40]=r57;r64=HEAP[r57];HEAP[r38]=r64;do{if((r64|0)==0){r57=HEAP[r36]+16|0;HEAP[r40]=r57;r65=HEAP[r57];HEAP[r38]=r65;if((r65|0)!=0){break}else{break L2058}}}while(0);while(1){r64=HEAP[r38]+20|0;HEAP[r41]=r64;if((HEAP[r64]|0)==0){r64=HEAP[r38]+16|0;HEAP[r41]=r64;if((HEAP[r64]|0)==0){break}}r64=HEAP[r41];HEAP[r40]=r64;HEAP[r38]=HEAP[r64]}if((HEAP[r40]>>>0>=HEAP[HEAP[r14]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r40]]=0;break}else{_abort()}}}while(0);if((HEAP[r37]|0)==0){break}HEAP[r42]=(HEAP[HEAP[r36]+28|0]<<2)+HEAP[r14]+304|0;do{if((HEAP[r36]|0)==(HEAP[HEAP[r42]]|0)){r2=HEAP[r38];HEAP[HEAP[r42]]=r2;if((r2|0)!=0){break}r2=HEAP[r14]+4|0;HEAP[r2]=HEAP[r2]&(1<<HEAP[HEAP[r36]+28|0]^-1)}else{if((HEAP[r37]>>>0>=HEAP[HEAP[r14]+16|0]>>>0&1|0)==0){_abort()}r2=HEAP[r38];r64=HEAP[r37]+16|0;if((HEAP[HEAP[r37]+16|0]|0)==(HEAP[r36]|0)){HEAP[r64|0]=r2;break}else{HEAP[r64+4|0]=r2;break}}}while(0);if((HEAP[r38]|0)==0){break}if((HEAP[r38]>>>0>=HEAP[HEAP[r14]+16|0]>>>0&1|0)==0){_abort()}HEAP[HEAP[r38]+24|0]=HEAP[r37];r2=HEAP[HEAP[r36]+16|0];HEAP[r43]=r2;do{if((r2|0)!=0){if((HEAP[r43]>>>0>=HEAP[HEAP[r14]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r38]+16|0]=HEAP[r43];HEAP[HEAP[r43]+24|0]=HEAP[r38];break}else{_abort()}}}while(0);r2=HEAP[HEAP[r36]+20|0];HEAP[r44]=r2;if((r2|0)==0){break}if((HEAP[r44]>>>0>=HEAP[HEAP[r14]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r38]+20|0]=HEAP[r44];HEAP[HEAP[r44]+24|0]=HEAP[r38];break}else{_abort()}}}while(0);if(HEAP[r32]>>>0<16){HEAP[r45]=HEAP[r31]+HEAP[r19]|0;HEAP[HEAP[r15]+4|0]=HEAP[r45]|2|HEAP[HEAP[r15]+4|0]&1;r59=HEAP[r15]+HEAP[r45]+4|0;HEAP[r59]=HEAP[r59]|1}else{HEAP[r46]=HEAP[r15]+HEAP[r16]|0;HEAP[HEAP[r15]+4|0]=HEAP[r16]|2|HEAP[HEAP[r15]+4|0]&1;r59=HEAP[r15]+HEAP[r16]+4|0;HEAP[r59]=HEAP[r59]|1;HEAP[HEAP[r46]+4|0]=HEAP[r32]|2|HEAP[HEAP[r46]+4|0]&1;r59=HEAP[r46]+HEAP[r32]+4|0;HEAP[r59]=HEAP[r59]|1;_dispose_chunk(HEAP[r14],HEAP[r46],HEAP[r32])}r59=HEAP[r15];HEAP[r18]=r59;r60=r59;break L2034}}while(0);r60=HEAP[r18]}}while(0);HEAP[r53]=r60;if((r60|0)!=0){HEAP[r49]=HEAP[r53]+8|0;break}r59=_malloc(HEAP[r48]);HEAP[r49]=r59;if((HEAP[r49]|0)==0){break}HEAP[r54]=(HEAP[HEAP[r51]+4|0]&-8)-((HEAP[HEAP[r51]+4|0]&3|0)==0?8:4)|0;r59=HEAP[r49];r2=HEAP[r47];r64=HEAP[r54]>>>0<HEAP[r48]>>>0?HEAP[r54]:HEAP[r48];for(r65=r2,r57=r59,r66=r65+r64;r65<r66;r65++,r57++){HEAP[r57]=HEAP[r65]}_free(HEAP[r47])}}while(0);r47=HEAP[r49];r67=r47;r68=r47}else{r47=_malloc(r1);r67=r47;r68=r47}if((r68|0)!=0){STACKTOP=r3;return r67}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _midend_size(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+12|0;r7=r6;r8=r6+4;r9=r6+8;r10=r1;r1=r2;r2=r3;r3=r4;if((HEAP[r10+76|0]|0)!=0){if((HEAP[r10+132|0]|0)>0){FUNCTION_TABLE[HEAP[HEAP[r10+8|0]+140|0]](HEAP[r10+120|0],HEAP[r10+76|0]);r11=FUNCTION_TABLE[HEAP[HEAP[r10+8|0]+136|0]](HEAP[r10+120|0],HEAP[HEAP[r10+64|0]|0]);HEAP[r10+76|0]=r11}r12=r3}else{r12=r4}L2157:do{if((r12|0)!=0){r13=1;while(1){r13=r13<<1;FUNCTION_TABLE[HEAP[HEAP[r10+8|0]+124|0]](HEAP[r10+68|0],r13,r8,r9);if(!((HEAP[r8]|0)<=(HEAP[r1]|0))){break L2157}if(!((HEAP[r9]|0)<=(HEAP[r2]|0))){break L2157}}}else{r13=HEAP[r10+128|0]+1|0}}while(0);r12=1;L2164:do{if((r13-r12|0)>1){while(1){r4=(r12+r13|0)/2&-1;FUNCTION_TABLE[HEAP[HEAP[r10+8|0]+124|0]](HEAP[r10+68|0],r4,r8,r9);do{if((HEAP[r8]|0)<=(HEAP[r1]|0)){if(!((HEAP[r9]|0)<=(HEAP[r2]|0))){r5=1549;break}r12=r4;break}else{r5=1549}}while(0);if(r5==1549){r5=0;r13=r4}if((r13-r12|0)<=1){break L2164}}}}while(0);HEAP[r10+132|0]=r12;if((r3|0)!=0){HEAP[r10+128|0]=HEAP[r10+132|0]}HEAP[r7]=r10;if((HEAP[HEAP[r7]+132|0]|0)<=0){r14=r7;r15=r10;r16=r15+136|0;r17=HEAP[r16];r18=r1;HEAP[r18]=r17;r19=r10;r20=r19+140|0;r21=HEAP[r20];r22=r2;HEAP[r22]=r21;STACKTOP=r6;return}FUNCTION_TABLE[HEAP[HEAP[HEAP[r7]+8|0]+124|0]](HEAP[HEAP[r7]+68|0],HEAP[HEAP[r7]+132|0],HEAP[r7]+136|0,HEAP[r7]+140|0);FUNCTION_TABLE[HEAP[HEAP[HEAP[r7]+8|0]+128|0]](HEAP[HEAP[r7]+120|0],HEAP[HEAP[r7]+76|0],HEAP[HEAP[r7]+68|0],HEAP[HEAP[r7]+132|0]);r14=r7;r15=r10;r16=r15+136|0;r17=HEAP[r16];r18=r1;HEAP[r18]=r17;r19=r10;r20=r19+140|0;r21=HEAP[r20];r22=r2;HEAP[r22]=r21;STACKTOP=r6;return}function _midend_set_params(r1,r2){var r3;r3=r1;FUNCTION_TABLE[HEAP[HEAP[r3+8|0]+28|0]](HEAP[r3+68|0]);r1=FUNCTION_TABLE[HEAP[HEAP[r3+8|0]+32|0]](r2);HEAP[r3+68|0]=r1;return}function _midend_get_params(r1){var r2;r2=r1;return FUNCTION_TABLE[HEAP[HEAP[r2+8|0]+32|0]](HEAP[r2+68|0])}function _midend_force_redraw(r1){var r2,r3,r4,r5,r6;r2=STACKTOP;STACKTOP=STACKTOP+4|0;r3=r2;r4=r1;if((HEAP[r4+76|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[r4+8|0]+140|0]](HEAP[r4+120|0],HEAP[r4+76|0])}r1=FUNCTION_TABLE[HEAP[HEAP[r4+8|0]+136|0]](HEAP[r4+120|0],HEAP[HEAP[r4+64|0]|0]);HEAP[r4+76|0]=r1;HEAP[r3]=r4;if((HEAP[HEAP[r3]+132|0]|0)<=0){r5=r3;r6=r4;_midend_redraw(r6);STACKTOP=r2;return}FUNCTION_TABLE[HEAP[HEAP[HEAP[r3]+8|0]+124|0]](HEAP[HEAP[r3]+68|0],HEAP[HEAP[r3]+132|0],HEAP[r3]+136|0,HEAP[r3]+140|0);FUNCTION_TABLE[HEAP[HEAP[HEAP[r3]+8|0]+128|0]](HEAP[HEAP[r3]+120|0],HEAP[HEAP[r3]+76|0],HEAP[HEAP[r3]+68|0],HEAP[HEAP[r3]+132|0]);r5=r3;r6=r4;_midend_redraw(r6);STACKTOP=r2;return}function _dupstr(r1){var r2,r3,r4,r5;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=r2+4;r5=r1;r1=_strlen(r5)+1|0;HEAP[r3]=r1;r1=_malloc(HEAP[r3]);HEAP[r4]=r1;if((HEAP[r4]|0)!=0){r1=HEAP[r4];_strcpy(r1,r5);STACKTOP=r2;return r1}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _midend_redraw(r1){var r2,r3,r4,r5,r6;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r3+4;r6=r1;if((HEAP[r6+120|0]|0)==0){___assert_func(34272,834,35792,33456)}if((HEAP[r6+60|0]|0)<=0){STACKTOP=r3;return}if((HEAP[r6+76|0]|0)==0){STACKTOP=r3;return}HEAP[r5]=HEAP[r6+120|0];FUNCTION_TABLE[HEAP[HEAP[HEAP[r5]|0]+32|0]](HEAP[HEAP[r5]+4|0]);do{if((HEAP[r6+84|0]|0)!=0){if(HEAP[r6+88|0]<=0){r2=1580;break}if(HEAP[r6+92|0]>=HEAP[r6+88|0]){r2=1580;break}if((HEAP[r6+104|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+144|0]](HEAP[r6+120|0],HEAP[r6+76|0],HEAP[r6+84|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0],HEAP[r6+104|0],HEAP[r6+80|0],HEAP[r6+92|0],HEAP[r6+100|0]);break}else{___assert_func(34272,840,35792,33384)}}else{r2=1580}}while(0);if(r2==1580){FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+144|0]](HEAP[r6+120|0],HEAP[r6+76|0],0,HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0],1,HEAP[r6+80|0],0,HEAP[r6+100|0])}HEAP[r4]=HEAP[r6+120|0];FUNCTION_TABLE[HEAP[HEAP[HEAP[r4]|0]+36|0]](HEAP[HEAP[r4]+4|0]);STACKTOP=r3;return}function _midend_can_undo(r1){return(HEAP[r1+60|0]|0)>1&1}function _midend_can_redo(r1){var r2;r2=r1;return(HEAP[r2+60|0]|0)<(HEAP[r2+52|0]|0)&1}function _midend_set_timer(r1){var r2,r3;r2=r1;if((HEAP[HEAP[r2+8|0]+180|0]|0)!=0){r3=(FUNCTION_TABLE[HEAP[HEAP[r2+8|0]+184|0]](HEAP[HEAP[r2+64|0]+((HEAP[r2+60|0]-1)*12&-1)|0],HEAP[r2+80|0])|0)!=0}else{r3=0}HEAP[r2+108|0]=r3&1;do{if((HEAP[r2+108|0]|0)==0){if(HEAP[r2+96|0]!=0){break}if(HEAP[r2+88|0]!=0){break}_deactivate_timer(HEAP[r2|0]);return}}while(0);_activate_timer(HEAP[r2|0]);return}function _midend_finish_move(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r2=0;r3=r1;do{if((HEAP[r3+84|0]|0)!=0){r2=1600}else{if((HEAP[r3+60|0]|0)>1){r2=1600;break}else{break}}}while(0);do{if(r2==1600){do{if((HEAP[r3+104|0]|0)>0){if((HEAP[HEAP[r3+64|0]+((HEAP[r3+60|0]-1)*12&-1)+8|0]|0)!=1){r2=1602;break}else{break}}else{r2=1602}}while(0);if(r2==1602){if((HEAP[r3+104|0]|0)>=0){break}if((HEAP[r3+60|0]|0)>=(HEAP[r3+52|0]|0)){break}if((HEAP[HEAP[r3+64|0]+(HEAP[r3+60|0]*12&-1)+8|0]|0)!=1){break}}r1=r3;if((HEAP[r3+84|0]|0)!=0){r4=HEAP[r1+84|0]}else{r4=HEAP[HEAP[r3+64|0]+((HEAP[r1+60|0]-2)*12&-1)|0]}if((HEAP[r3+84|0]|0)!=0){r5=HEAP[r3+104|0]}else{r5=1}r1=FUNCTION_TABLE[HEAP[HEAP[r3+8|0]+152|0]](r4,HEAP[HEAP[r3+64|0]+((HEAP[r3+60|0]-1)*12&-1)|0],r5,HEAP[r3+80|0]);if(r1<=0){break}HEAP[r3+100|0]=0;HEAP[r3+96|0]=r1}}while(0);if((HEAP[r3+84|0]|0)==0){r6=r3;r7=r6+84|0;HEAP[r7]=0;r8=r3;r9=r8+88|0;HEAP[r9]=0;r10=r3;r11=r10+92|0;HEAP[r11]=0;r12=r3;r13=r12+104|0;HEAP[r13]=0;r14=r3;_midend_set_timer(r14);return}FUNCTION_TABLE[HEAP[HEAP[r3+8|0]+68|0]](HEAP[r3+84|0]);r6=r3;r7=r6+84|0;HEAP[r7]=0;r8=r3;r9=r8+88|0;HEAP[r9]=0;r10=r3;r11=r10+92|0;HEAP[r11]=0;r12=r3;r13=r12+104|0;HEAP[r13]=0;r14=r3;_midend_set_timer(r14);return}function _midend_new_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r2=STACKTOP;STACKTOP=STACKTOP+60|0;r3=r2;r4=r2+4;r5=r2+8;r6=r2+12;r7=r2+16;r8=r2+20;r9=r2+24;r10=r2+28;r11=r2+32;r12=r2+36;r13=r2+40;r14=r2+56;r15=r1;HEAP[r12]=r15;r1=HEAP[r12];L2255:do{if((HEAP[HEAP[r12]+52|0]|0)>0){r16=r1;while(1){r17=r16+52|0;HEAP[r17]=HEAP[r17]-1|0;FUNCTION_TABLE[HEAP[HEAP[HEAP[r12]+8|0]+68|0]](HEAP[HEAP[HEAP[r12]+64|0]+(HEAP[HEAP[r12]+52|0]*12&-1)|0]);r17=HEAP[HEAP[HEAP[r12]+64|0]+(HEAP[HEAP[r12]+52|0]*12&-1)+4|0];HEAP[r11]=r17;if((r17|0)!=0){_free(HEAP[r11])}r17=HEAP[r12];if((HEAP[HEAP[r12]+52|0]|0)>0){r16=r17}else{r18=r17;break L2255}}}else{r18=r1}}while(0);if((HEAP[r18+76|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r12]+8|0]+140|0]](HEAP[HEAP[r12]+120|0],HEAP[HEAP[r12]+76|0])}if((HEAP[r15+52|0]|0)!=0){___assert_func(34272,360,35836,33840)}r12=r15+48|0;if((HEAP[r15+48|0]|0)==1){HEAP[r12]=2}else{if((HEAP[r12]|0)==0){HEAP[r15+48|0]=2}else{HEAP[r13+15|0]=0;r12=((_random_upto(HEAP[r15+4|0],9)&255)<<24>>24)+49&255;HEAP[r13|0]=r12;r12=1;r18=r15;while(1){r1=((_random_upto(HEAP[r18+4|0],10)&255)<<24>>24)+48&255;HEAP[r13+r12|0]=r1;r1=r12+1|0;r12=r1;r19=r15;if((r1|0)<15){r18=r19}else{break}}HEAP[r10]=HEAP[r19+40|0];if((HEAP[r10]|0)!=0){_free(HEAP[r10])}r10=_dupstr(r13|0);HEAP[r15+40|0]=r10;if((HEAP[r15+72|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+28|0]](HEAP[r15+72|0])}r10=FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+32|0]](HEAP[r15+68|0]);HEAP[r15+72|0]=r10}r10=HEAP[r15+32|0];HEAP[r9]=r10;if((r10|0)!=0){_free(HEAP[r9])}r9=HEAP[r15+36|0];HEAP[r8]=r9;if((r9|0)!=0){_free(HEAP[r8])}r8=HEAP[r15+44|0];HEAP[r7]=r8;if((r8|0)!=0){_free(HEAP[r7])}HEAP[r15+44|0]=0;r7=_random_new(HEAP[r15+40|0],_strlen(HEAP[r15+40|0]));r8=FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+52|0]](HEAP[r15+72|0],r7,r15+44|0,(HEAP[r15+120|0]|0)!=0&1);HEAP[r15+32|0]=r8;HEAP[r15+36|0]=0;HEAP[r6]=r7;r7=HEAP[r6];HEAP[r5]=r7;if((r7|0)!=0){_free(HEAP[r5])}}if((HEAP[r15+52|0]|0)>=(HEAP[r15+56|0]|0)){HEAP[r15+56|0]=HEAP[r15+52|0]+128|0;r5=_srealloc(HEAP[r15+64|0],HEAP[r15+56|0]*12&-1);HEAP[r15+64|0]=r5}r5=FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+60|0]](r15,HEAP[r15+68|0],HEAP[r15+32|0]);HEAP[HEAP[r15+64|0]+(HEAP[r15+52|0]*12&-1)|0]=r5;do{if((HEAP[HEAP[r15+8|0]+72|0]|0)!=0){if((HEAP[r15+44|0]|0)==0){break}HEAP[r14]=0;r5=FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+76|0]](HEAP[HEAP[r15+64|0]|0],HEAP[HEAP[r15+64|0]|0],HEAP[r15+44|0],r14);if((r5|0)==0){___assert_func(34272,441,35836,33684)}if((HEAP[r14]|0)!=0){___assert_func(34272,441,35836,33684)}r7=FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+116|0]](HEAP[HEAP[r15+64|0]|0],r5);if((r7|0)==0){___assert_func(34272,443,35836,33636)}FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+68|0]](r7);HEAP[r4]=r5;if((HEAP[r4]|0)!=0){_free(HEAP[r4])}}}while(0);HEAP[HEAP[r15+64|0]+(HEAP[r15+52|0]*12&-1)+4|0]=0;HEAP[HEAP[r15+64|0]+(HEAP[r15+52|0]*12&-1)+8|0]=0;r4=r15+52|0;HEAP[r4]=HEAP[r4]+1|0;HEAP[r15+60|0]=1;r4=FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+136|0]](HEAP[r15+120|0],HEAP[HEAP[r15+64|0]|0]);HEAP[r15+76|0]=r4;HEAP[r3]=r15;if((HEAP[HEAP[r3]+132|0]|0)>0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r3]+8|0]+124|0]](HEAP[HEAP[r3]+68|0],HEAP[HEAP[r3]+132|0],HEAP[r3]+136|0,HEAP[r3]+140|0);FUNCTION_TABLE[HEAP[HEAP[HEAP[r3]+8|0]+128|0]](HEAP[HEAP[r3]+120|0],HEAP[HEAP[r3]+76|0],HEAP[HEAP[r3]+68|0],HEAP[HEAP[r3]+132|0])}HEAP[r15+112|0]=0;if((HEAP[r15+80|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+96|0]](HEAP[r15+80|0])}r3=FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+92|0]](HEAP[HEAP[r15+64|0]|0]);HEAP[r15+80|0]=r3;_midend_set_timer(r15);HEAP[r15+124|0]=0;if((HEAP[r15+144|0]|0)==0){STACKTOP=r2;return}FUNCTION_TABLE[HEAP[r15+144|0]](HEAP[r15+148|0]);STACKTOP=r2;return}function _midend_purge_states(r1){var r2,r3,r4;r2=r1;if((HEAP[r2+52|0]|0)<=(HEAP[r2+60|0]|0)){return}while(1){r1=HEAP[HEAP[r2+8|0]+68|0];r3=r2+52|0;r4=HEAP[r3]-1|0;HEAP[r3]=r4;FUNCTION_TABLE[r1](HEAP[HEAP[r2+64|0]+(r4*12&-1)|0]);if((HEAP[HEAP[r2+64|0]+(HEAP[r2+52|0]*12&-1)+4|0]|0)!=0){_sfree(HEAP[HEAP[r2+64|0]+(HEAP[r2+52|0]*12&-1)+4|0])}if((HEAP[r2+52|0]|0)<=(HEAP[r2+60|0]|0)){break}}return}function _midend_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11;r5=0;r6=r1;r1=r2;r2=r3;r3=r4;r4=1;do{if((r3-515|0)>>>0<=2){r5=1678}else{if((r3-518|0)>>>0<=2){r5=1678;break}if(!((r3-512|0)>>>0<=2)){break}if((HEAP[r6+124|0]|0)==0){break}r7=r4;if((1<<r3-512+((HEAP[r6+124|0]-512)*3&-1)&HEAP[HEAP[r6+8|0]+188|0]|0)!=0){r8=r7;r9=r8;return r9}if((r7|0)!=0){r10=(_midend_really_process_key(r6,r1,r2,HEAP[r6+124|0]+6|0)|0)!=0}else{r10=0}r4=r10&1;break}}while(0);do{if(r5==1678){if((HEAP[r6+124|0]|0)==0){r8=r4;r9=r8;return r9}r10=HEAP[r6+124|0];if((r3-515|0)>>>0<=2){r3=r10+3|0;break}else{r3=r10+6|0;break}}}while(0);r5=r3;do{if((r3|0)==10|(r5|0)==13){r3=525}else{if((r5|0)==32){r3=526;break}if((r3|0)!=127){break}r3=8}}while(0);if((r4|0)!=0){r11=(_midend_really_process_key(r6,r1,r2,r3)|0)!=0}else{r11=0}r4=r11&1;do{if((r3-518|0)>>>0<=2){HEAP[r6+124|0]=0}else{if(!((r3-512|0)>>>0<=2)){break}HEAP[r6+124|0]=r3}}while(0);r8=r4;r9=r8;return r9}function _midend_restart_game(r1){var r2,r3,r4,r5,r6;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r3+4;r6=r1;HEAP[r5]=r6;do{if((HEAP[HEAP[r5]+84|0]|0)!=0){r2=1709}else{if(HEAP[HEAP[r5]+88|0]!=0){r2=1709;break}else{break}}}while(0);if(r2==1709){_midend_finish_move(HEAP[r5]);_midend_redraw(HEAP[r5])}if(!((HEAP[r6+60|0]|0)>=1)){___assert_func(34272,551,35772,33540)}if((HEAP[r6+60|0]|0)==1){STACKTOP=r3;return}r5=FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+60|0]](r6,HEAP[r6+68|0],HEAP[r6+32|0]);HEAP[r4]=r6;do{if((HEAP[HEAP[r4]+84|0]|0)!=0){r2=1715}else{if(HEAP[HEAP[r4]+88|0]!=0){r2=1715;break}else{break}}}while(0);if(r2==1715){_midend_finish_move(HEAP[r4]);_midend_redraw(HEAP[r4])}_midend_purge_states(r6);if((HEAP[r6+52|0]|0)>=(HEAP[r6+56|0]|0)){HEAP[r6+56|0]=HEAP[r6+52|0]+128|0;r4=_srealloc(HEAP[r6+64|0],HEAP[r6+56|0]*12&-1);HEAP[r6+64|0]=r4}HEAP[HEAP[r6+64|0]+(HEAP[r6+52|0]*12&-1)|0]=r5;r5=_dupstr(HEAP[r6+32|0]);HEAP[HEAP[r6+64|0]+(HEAP[r6+52|0]*12&-1)+4|0]=r5;HEAP[HEAP[r6+64|0]+(HEAP[r6+52|0]*12&-1)+8|0]=3;r5=r6+52|0;r4=HEAP[r5]+1|0;HEAP[r5]=r4;HEAP[r6+60|0]=r4;if((HEAP[r6+80|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+108|0]](HEAP[r6+80|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-2)*12&-1)|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0])}HEAP[r6+88|0]=0;_midend_finish_move(r6);_midend_redraw(r6);_midend_set_timer(r6);STACKTOP=r3;return}function _midend_wants_statusbar(r1){return HEAP[HEAP[r1+8|0]+176|0]}function _midend_timer(r1,r2){var r3,r4,r5,r6,r7;r3=0;r4=r1;r1=r2;if(HEAP[r4+88|0]>0){r5=1}else{r5=HEAP[r4+96|0]>0}r2=r5&1;r5=r4+92|0;HEAP[r5]=r1+HEAP[r5];do{if(HEAP[r4+92|0]>=HEAP[r4+88|0]){r3=1730}else{if(HEAP[r4+88|0]==0){r3=1730;break}if((HEAP[r4+84|0]|0)!=0){break}else{r3=1730;break}}}while(0);do{if(r3==1730){if(HEAP[r4+88|0]<=0){break}_midend_finish_move(r4)}}while(0);r5=r4+100|0;HEAP[r5]=r1+HEAP[r5];do{if(HEAP[r4+100|0]>=HEAP[r4+96|0]){r3=1734}else{if(HEAP[r4+96|0]==0){r3=1734;break}else{break}}}while(0);if(r3==1734){HEAP[r4+96|0]=0;HEAP[r4+100|0]=0}if((r2|0)!=0){_midend_redraw(r4)}if((HEAP[r4+108|0]|0)==0){r6=r4;_midend_set_timer(r6);return}r2=HEAP[r4+112|0];r3=r4+112|0;HEAP[r3]=r1+HEAP[r3];if((r2&-1|0)==(HEAP[r4+112|0]&-1|0)){r6=r4;_midend_set_timer(r6);return}if((HEAP[r4+116|0]|0)!=0){r7=HEAP[r4+116|0]}else{r7=35140}_status_bar(HEAP[r4+120|0],r7);r6=r4;_midend_set_timer(r6);return}function _midend_which_preset(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=STACKTOP;STACKTOP=STACKTOP+4|0;r3=r2;r4=r1;r1=FUNCTION_TABLE[HEAP[HEAP[r4+8|0]+24|0]](HEAP[r4+68|0],1);r5=-1;r6=0;L2431:do{if((r6|0)<(HEAP[r4+24|0]|0)){while(1){r7=r6;if((_strcmp(r1,HEAP[(r6<<2)+HEAP[r4+20|0]|0])|0)==0){break}r6=r7+1|0;if((r6|0)>=(HEAP[r4+24|0]|0)){break L2431}}r5=r7}}while(0);r7=r1;HEAP[r3]=r7;if((r7|0)==0){r8=r3;r9=r5;STACKTOP=r2;return r9}_free(HEAP[r3]);r8=r3;r9=r5;STACKTOP=r2;return r9}function _midend_really_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+32|0;r7=r6;r8=r6+4;r9=r6+8;r10=r6+12;r11=r6+16;r12=r6+20;r13=r6+24;r14=r6+28;r15=r1;r1=r4;r4=FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+64|0]](HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)|0]);r16=1;r17=0;r18=1;r19=FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+112|0]](HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)|0],HEAP[r15+80|0],HEAP[r15+76|0],r2,r3,r1);L2442:do{if((r19|0)!=0){r3=r15;do{if(HEAP[r19]<<24>>24!=0){r20=FUNCTION_TABLE[HEAP[HEAP[r3+8|0]+116|0]](HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)|0],r19);if((r20|0)!=0){break}___assert_func(34272,629,35808,33524)}else{r20=HEAP[HEAP[r15+64|0]+((HEAP[r3+60|0]-1)*12&-1)|0]}}while(0);if((r20|0)==(HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)|0]|0)){_midend_redraw(r15);_midend_set_timer(r15);break}if((r20|0)==0){break}HEAP[r7]=r15;do{if((HEAP[HEAP[r7]+84|0]|0)!=0){r5=1793}else{if(HEAP[HEAP[r7]+88|0]!=0){r5=1793;break}else{break}}}while(0);if(r5==1793){_midend_finish_move(HEAP[r7]);_midend_redraw(HEAP[r7])}_midend_purge_states(r15);if((HEAP[r15+52|0]|0)>=(HEAP[r15+56|0]|0)){HEAP[r15+56|0]=HEAP[r15+52|0]+128|0;r3=_srealloc(HEAP[r15+64|0],HEAP[r15+56|0]*12&-1);HEAP[r15+64|0]=r3}if((r19|0)==0){___assert_func(34272,645,35808,33508)}HEAP[HEAP[r15+64|0]+(HEAP[r15+52|0]*12&-1)|0]=r20;HEAP[HEAP[r15+64|0]+(HEAP[r15+52|0]*12&-1)+4|0]=r19;HEAP[HEAP[r15+64|0]+(HEAP[r15+52|0]*12&-1)+8|0]=1;r3=r15+52|0;r2=HEAP[r3]+1|0;HEAP[r3]=r2;HEAP[r15+60|0]=r2;HEAP[r15+104|0]=1;if((HEAP[r15+80|0]|0)==0){r5=1800;break}FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+108|0]](HEAP[r15+80|0],HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-2)*12&-1)|0],HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)|0]);r5=1800;break}else{if((r1|0)==110|(r1|0)==78|(r1|0)==14){HEAP[r14]=r15;do{if((HEAP[HEAP[r14]+84|0]|0)!=0){r5=1759}else{if(HEAP[HEAP[r14]+88|0]!=0){r5=1759;break}else{break}}}while(0);if(r5==1759){_midend_finish_move(HEAP[r14]);_midend_redraw(HEAP[r14])}_midend_new_game(r15);_midend_redraw(r15);break}if((r1|0)==117|(r1|0)==85|(r1|0)==26|(r1|0)==31){HEAP[r13]=r15;do{if((HEAP[HEAP[r13]+84|0]|0)!=0){r5=1764}else{if(HEAP[HEAP[r13]+88|0]!=0){r5=1764;break}else{break}}}while(0);if(r5==1764){_midend_finish_move(HEAP[r13]);_midend_redraw(HEAP[r13])}r16=HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)+8|0];r17=1;HEAP[r12]=r15;if((HEAP[HEAP[r12]+60|0]|0)<=1){HEAP[r11]=0;break}if((HEAP[HEAP[r12]+80|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r12]+8|0]+108|0]](HEAP[HEAP[r12]+80|0],HEAP[HEAP[HEAP[r12]+64|0]+((HEAP[HEAP[r12]+60|0]-1)*12&-1)|0],HEAP[HEAP[HEAP[r12]+64|0]+((HEAP[HEAP[r12]+60|0]-2)*12&-1)|0])}r2=HEAP[r12]+60|0;HEAP[r2]=HEAP[r2]-1|0;HEAP[HEAP[r12]+104|0]=-1;HEAP[r11]=1;r5=1800;break}if(!((r1|0)==114|(r1|0)==82|(r1|0)==18|(r1|0)==25)){do{if((r1|0)==19){if((HEAP[HEAP[r15+8|0]+72|0]|0)==0){break}if((_midend_solve(r15)|0)!=0){break L2442}else{r5=1800;break L2442}}}while(0);if(!((r1|0)==113|(r1|0)==81|(r1|0)==17)){break}r18=0;break}HEAP[r10]=r15;do{if((HEAP[HEAP[r10]+84|0]|0)!=0){r5=1773}else{if(HEAP[HEAP[r10]+88|0]!=0){r5=1773;break}else{break}}}while(0);if(r5==1773){_midend_finish_move(HEAP[r10]);_midend_redraw(HEAP[r10])}HEAP[r9]=r15;if((HEAP[HEAP[r9]+60|0]|0)>=(HEAP[HEAP[r9]+52|0]|0)){HEAP[r8]=0;break}if((HEAP[HEAP[r9]+80|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[HEAP[r9]+8|0]+108|0]](HEAP[HEAP[r9]+80|0],HEAP[HEAP[HEAP[r9]+64|0]+((HEAP[HEAP[r9]+60|0]-1)*12&-1)|0],HEAP[HEAP[HEAP[r9]+64|0]+(HEAP[HEAP[r9]+60|0]*12&-1)|0])}r2=HEAP[r9]+60|0;HEAP[r2]=HEAP[r2]+1|0;HEAP[HEAP[r9]+104|0]=1;HEAP[r8]=1;r5=1800;break}}while(0);if(r5==1800){if((r17|0)!=0){r21=r16}else{r17=HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)+8|0];r16=r17;r21=r17}do{if((r21|0)!=1){if((r16|0)==2){if((HEAP[HEAP[r15+8|0]+188|0]&512|0)!=0){r5=1807;break}}r22=0;break}else{r5=1807}}while(0);if(r5==1807){r22=FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+148|0]](r4,HEAP[HEAP[r15+64|0]+((HEAP[r15+60|0]-1)*12&-1)|0],HEAP[r15+104|0],HEAP[r15+80|0])}HEAP[r15+84|0]=r4;r4=0;if(r22>0){HEAP[r15+88|0]=r22}else{HEAP[r15+88|0]=0;_midend_finish_move(r15)}HEAP[r15+92|0]=0;_midend_redraw(r15);_midend_set_timer(r15)}if((r4|0)==0){r23=r18;STACKTOP=r6;return r23}FUNCTION_TABLE[HEAP[HEAP[r15+8|0]+68|0]](r4);r23=r18;STACKTOP=r6;return r23}function _midend_status(r1){var r2,r3;r2=r1;if((HEAP[r2+60|0]|0)==0){r1=1;r3=r1;return r3}else{r1=FUNCTION_TABLE[HEAP[HEAP[r2+8|0]+156|0]](HEAP[HEAP[r2+64|0]+((HEAP[r2+60|0]-1)*12&-1)|0]);r3=r1;return r3}}function _SHA_Bytes(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r4=STACKTOP;STACKTOP=STACKTOP+436|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+328;r9=r4+332;r10=r4+336;r11=r4+340;r12=r4+344;r13=r4+348;r14=r4+352;r15=r4+356;r16=r4+360;r17=r4+364;r18=r4+368;r19=r4+372;r20=r1;r1=r3;r3=r2;r2=r1;r21=r20+92|0;HEAP[r21]=HEAP[r21]+r2|0;r21=r20+88|0;HEAP[r21]=HEAP[r21]+(HEAP[r20+92|0]>>>0<r2>>>0&1)|0;do{if((HEAP[r20+84|0]|0)!=0){if((r1+HEAP[r20+84|0]|0)>=64){break}r2=r20+HEAP[r20+84|0]+20|0;r21=r3;r22=r1;for(r23=r21,r24=r2,r25=r23+r22;r23<r25;r23++,r24++){HEAP[r24]=HEAP[r23]}r22=r20+84|0;HEAP[r22]=HEAP[r22]+r1|0;STACKTOP=r4;return}}while(0);r22=r20+20|0;L2542:do{if((r1+HEAP[r20+84|0]|0)>=64){r2=r19|0;r21=r22;while(1){r26=r21+HEAP[r20+84|0]|0;r27=r3;r28=64-HEAP[r20+84|0]|0;for(r23=r27,r24=r26,r25=r23+r28;r23<r25;r23++,r24++){HEAP[r24]=HEAP[r23]}r3=r3+(64-HEAP[r20+84|0])|0;r1=-(-HEAP[r20+84|0]|0)-64+r1|0;r28=0;while(1){HEAP[(r28<<2)+r19|0]=(HEAP[(r28<<2)+r20+21|0]&255)<<16|(HEAP[(r28<<2)+r20+20|0]&255)<<24|(HEAP[(r28<<2)+r20+22|0]&255)<<8|(HEAP[(r28<<2)+r20+23|0]&255)<<0;r26=r28+1|0;r28=r26;if((r26|0)>=16){break}}HEAP[r5]=r20|0;HEAP[r6]=r2;HEAP[r13]=0;while(1){HEAP[(HEAP[r13]<<2)+r7|0]=HEAP[(HEAP[r13]<<2)+HEAP[r6]|0];r28=HEAP[r13]+1|0;HEAP[r13]=r28;if((r28|0)>=16){break}}HEAP[r13]=16;while(1){HEAP[r14]=HEAP[(HEAP[r13]-8<<2)+r7|0]^HEAP[(HEAP[r13]-3<<2)+r7|0]^HEAP[(HEAP[r13]-14<<2)+r7|0]^HEAP[(HEAP[r13]-16<<2)+r7|0];HEAP[(HEAP[r13]<<2)+r7|0]=HEAP[r14]>>>31|HEAP[r14]<<1;r28=HEAP[r13]+1|0;HEAP[r13]=r28;if((r28|0)>=80){break}}HEAP[r8]=HEAP[HEAP[r5]];HEAP[r9]=HEAP[HEAP[r5]+4|0];HEAP[r10]=HEAP[HEAP[r5]+8|0];HEAP[r11]=HEAP[HEAP[r5]+12|0];HEAP[r12]=HEAP[HEAP[r5]+16|0];HEAP[r13]=0;while(1){HEAP[r15]=(HEAP[r8]>>>27|HEAP[r8]<<5)+HEAP[r12]+((HEAP[r9]^-1)&HEAP[r11]|HEAP[r10]&HEAP[r9])+HEAP[(HEAP[r13]<<2)+r7|0]+1518500249|0;HEAP[r12]=HEAP[r11];HEAP[r11]=HEAP[r10];HEAP[r10]=HEAP[r9]>>>2|HEAP[r9]<<30;HEAP[r9]=HEAP[r8];HEAP[r8]=HEAP[r15];r28=HEAP[r13]+1|0;HEAP[r13]=r28;if((r28|0)>=20){break}}HEAP[r13]=20;while(1){HEAP[r16]=(HEAP[r8]>>>27|HEAP[r8]<<5)+(HEAP[r10]^HEAP[r9]^HEAP[r11])+HEAP[r12]+HEAP[(HEAP[r13]<<2)+r7|0]+1859775393|0;HEAP[r12]=HEAP[r11];HEAP[r11]=HEAP[r10];HEAP[r10]=HEAP[r9]>>>2|HEAP[r9]<<30;HEAP[r9]=HEAP[r8];HEAP[r8]=HEAP[r16];r28=HEAP[r13]+1|0;HEAP[r13]=r28;if((r28|0)>=40){break}}HEAP[r13]=40;while(1){HEAP[r17]=(HEAP[r8]>>>27|HEAP[r8]<<5)-1894007588+HEAP[r12]+(HEAP[r11]&HEAP[r9]|HEAP[r10]&HEAP[r9]|HEAP[r11]&HEAP[r10])+HEAP[(HEAP[r13]<<2)+r7|0]|0;HEAP[r12]=HEAP[r11];HEAP[r11]=HEAP[r10];HEAP[r10]=HEAP[r9]>>>2|HEAP[r9]<<30;HEAP[r9]=HEAP[r8];HEAP[r8]=HEAP[r17];r28=HEAP[r13]+1|0;HEAP[r13]=r28;if((r28|0)>=60){break}}HEAP[r13]=60;r28=HEAP[r8];while(1){HEAP[r18]=(HEAP[r8]>>>27|r28<<5)-899497514+(HEAP[r10]^HEAP[r9]^HEAP[r11])+HEAP[r12]+HEAP[(HEAP[r13]<<2)+r7|0]|0;HEAP[r12]=HEAP[r11];HEAP[r11]=HEAP[r10];HEAP[r10]=HEAP[r9]>>>2|HEAP[r9]<<30;HEAP[r9]=HEAP[r8];HEAP[r8]=HEAP[r18];r26=HEAP[r13]+1|0;HEAP[r13]=r26;r29=HEAP[r8];if((r26|0)<80){r28=r29}else{break}}r28=HEAP[r5];HEAP[r28]=HEAP[r28]+r29|0;r28=HEAP[r5]+4|0;HEAP[r28]=HEAP[r28]+HEAP[r9]|0;r28=HEAP[r5]+8|0;HEAP[r28]=HEAP[r28]+HEAP[r10]|0;r28=HEAP[r5]+12|0;HEAP[r28]=HEAP[r28]+HEAP[r11]|0;r28=HEAP[r5]+16|0;HEAP[r28]=HEAP[r28]+HEAP[r12]|0;HEAP[r20+84|0]=0;r28=r20+20|0;if((r1+HEAP[r20+84|0]|0)>=64){r21=r28}else{r30=r28;break L2542}}}else{r30=r22}}while(0);r22=r30;r30=r3;r3=r1;for(r23=r30,r24=r22,r25=r23+r3;r23<r25;r23++,r24++){HEAP[r24]=HEAP[r23]}HEAP[r20+84|0]=r1;STACKTOP=r4;return}function _midend_solve(r1){var r2,r3,r4,r5,r6,r7,r8;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r3+4;r6=r1;if((HEAP[HEAP[r6+8|0]+72|0]|0)==0){r7=34456;r8=r7;STACKTOP=r3;return r8}if((HEAP[r6+60|0]|0)<1){r7=34400;r8=r7;STACKTOP=r3;return r8}HEAP[r5]=0;r1=FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+76|0]](HEAP[HEAP[r6+64|0]|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0],HEAP[r6+44|0],r5);if((r1|0)==0){if((HEAP[r5]|0)==0){HEAP[r5]=34340}r7=HEAP[r5];r8=r7;STACKTOP=r3;return r8}r5=FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+116|0]](HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0],r1);if((r5|0)==0){___assert_func(34272,1364,35756,33636)}HEAP[r4]=r6;do{if((HEAP[HEAP[r4]+84|0]|0)!=0){r2=1859}else{if(HEAP[HEAP[r4]+88|0]!=0){r2=1859;break}else{break}}}while(0);if(r2==1859){_midend_finish_move(HEAP[r4]);_midend_redraw(HEAP[r4])}_midend_purge_states(r6);if((HEAP[r6+52|0]|0)>=(HEAP[r6+56|0]|0)){HEAP[r6+56|0]=HEAP[r6+52|0]+128|0;r4=_srealloc(HEAP[r6+64|0],HEAP[r6+56|0]*12&-1);HEAP[r6+64|0]=r4}HEAP[HEAP[r6+64|0]+(HEAP[r6+52|0]*12&-1)|0]=r5;HEAP[HEAP[r6+64|0]+(HEAP[r6+52|0]*12&-1)+4|0]=r1;HEAP[HEAP[r6+64|0]+(HEAP[r6+52|0]*12&-1)+8|0]=2;r1=r6+52|0;r5=HEAP[r1]+1|0;HEAP[r1]=r5;HEAP[r6+60|0]=r5;if((HEAP[r6+80|0]|0)!=0){FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+108|0]](HEAP[r6+80|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-2)*12&-1)|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0])}HEAP[r6+104|0]=1;r5=r6;if((HEAP[HEAP[r6+8|0]+188|0]&512|0)!=0){r1=FUNCTION_TABLE[HEAP[HEAP[r5+8|0]+64|0]](HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-2)*12&-1)|0]);HEAP[r6+84|0]=r1;r1=FUNCTION_TABLE[HEAP[HEAP[r6+8|0]+148|0]](HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-2)*12&-1)|0],HEAP[HEAP[r6+64|0]+((HEAP[r6+60|0]-1)*12&-1)|0],1,HEAP[r6+80|0]);HEAP[r6+88|0]=r1;HEAP[r6+92|0]=0}else{HEAP[r5+88|0]=0;_midend_finish_move(r6)}if((HEAP[r6+120|0]|0)!=0){_midend_redraw(r6)}_midend_set_timer(r6);r7=0;r8=r7;STACKTOP=r3;return r8}function _countnode234(r1){var r2,r3,r4,r5,r6;r2=r1;r1=0;if((r2|0)==0){r3=0;r4=r3;return r4}r5=0;while(1){r1=r1+HEAP[(r5<<2)+r2+20|0]|0;r6=r5+1|0;r5=r6;if((r6|0)>=4){break}}r5=0;while(1){if((HEAP[(r5<<2)+r2+36|0]|0)!=0){r1=r1+1|0}r6=r5+1|0;r5=r6;if((r6|0)>=3){break}}r3=r1;r4=r3;return r4}function _SHA_Simple(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r4=STACKTOP;STACKTOP=STACKTOP+192|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+80;r11=r4+84;r12=r4+88;r13=r4+92;r14=r4+96;HEAP[r13]=r14;HEAP[r12]=HEAP[r13]|0;HEAP[HEAP[r12]]=1732584193;HEAP[HEAP[r12]+4|0]=-271733879;HEAP[HEAP[r12]+8|0]=-1732584194;HEAP[HEAP[r12]+12|0]=271733878;HEAP[HEAP[r12]+16|0]=-1009589776;HEAP[HEAP[r13]+84|0]=0;HEAP[HEAP[r13]+92|0]=0;HEAP[HEAP[r13]+88|0]=0;_SHA_Bytes(r14,r1,r2);HEAP[r5]=r14;HEAP[r6]=r3;r3=HEAP[HEAP[r5]+84|0];if((HEAP[HEAP[r5]+84|0]|0)>=56){HEAP[r8]=120-r3|0}else{HEAP[r8]=56-r3|0}HEAP[r10]=HEAP[HEAP[r5]+92|0]>>>29|HEAP[HEAP[r5]+88|0]<<3;HEAP[r11]=HEAP[HEAP[r5]+92|0]<<3;r3=r9;r14=HEAP[r8];for(r2=r3,r1=r2+r14;r2<r1;r2++){HEAP[r2]=0}HEAP[r9|0]=-128;_SHA_Bytes(HEAP[r5],r9,HEAP[r8]);HEAP[r9|0]=HEAP[r10]>>>24&255;HEAP[r9+1|0]=HEAP[r10]>>>16&255;HEAP[r9+2|0]=HEAP[r10]>>>8&255;HEAP[r9+3|0]=HEAP[r10]&255;HEAP[r9+4|0]=HEAP[r11]>>>24&255;HEAP[r9+5|0]=HEAP[r11]>>>16&255;HEAP[r9+6|0]=HEAP[r11]>>>8&255;HEAP[r9+7|0]=HEAP[r11]&255;_SHA_Bytes(HEAP[r5],r9,8);HEAP[r7]=0;while(1){HEAP[(HEAP[r7]<<2)+HEAP[r6]|0]=HEAP[(HEAP[r7]<<2)+HEAP[r5]|0]>>>24&255;HEAP[(HEAP[r7]<<2)+HEAP[r6]+1|0]=HEAP[(HEAP[r7]<<2)+HEAP[r5]|0]>>>16&255;HEAP[(HEAP[r7]<<2)+HEAP[r6]+2|0]=HEAP[(HEAP[r7]<<2)+HEAP[r5]|0]>>>8&255;HEAP[(HEAP[r7]<<2)+HEAP[r6]+3|0]=HEAP[(HEAP[r7]<<2)+HEAP[r5]|0]&255;r9=HEAP[r7]+1|0;HEAP[r7]=r9;if((r9|0)>=5){break}}STACKTOP=r4;return}function _freenode234(r1){var r2,r3,r4;r2=STACKTOP;STACKTOP=STACKTOP+4|0;r3=r2;r4=r1;if((r4|0)==0){STACKTOP=r2;return}_freenode234(HEAP[r4+4|0]);_freenode234(HEAP[r4+8|0]);_freenode234(HEAP[r4+12|0]);_freenode234(HEAP[r4+16|0]);HEAP[r3]=r4;if((HEAP[r3]|0)!=0){_free(HEAP[r3])}STACKTOP=r2;return}function _random_new(r1,r2){var r3,r4,r5,r6;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r3+4;HEAP[r4]=64;r6=_malloc(HEAP[r4]);HEAP[r5]=r6;if((HEAP[r5]|0)!=0){r6=HEAP[r5];_SHA_Simple(r1,r2,r6|0);_SHA_Simple(r6|0,20,r6+20|0);_SHA_Simple(r6|0,40,r6+40|0);HEAP[r6+60|0]=0;STACKTOP=r3;return r6}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}function _random_upto(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+20|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r1;r1=r2;r2=0;r11=r2;L36:do{if((r1>>>(r2>>>0)|0)!=0){r12=r11;while(1){r2=r12+1|0;r13=r2;if((r1>>>(r2>>>0)|0)!=0){r12=r13}else{r14=r13;break L36}}}else{r14=r11}}while(0);r11=r14+3|0;r2=r11;if((r11|0)>=32){___assert_func(34664,275,35696,35052)}r11=1<<r2;r14=Math.floor((r11>>>0)/(r1>>>0));r11=Math.imul(r14,r1);while(1){HEAP[r5]=r10;HEAP[r6]=r2;HEAP[r7]=0;HEAP[r8]=0;L45:do{if((HEAP[r8]|0)<(HEAP[r6]|0)){while(1){if((HEAP[HEAP[r5]+60|0]|0)>=20){HEAP[r9]=0;while(1){r15=HEAP[r5]+HEAP[r9]|0;if((HEAP[HEAP[r5]+HEAP[r9]|0]&255|0)!=255){r3=38;break}HEAP[r15]=0;r1=HEAP[r9]+1|0;HEAP[r9]=r1;if((r1|0)>=20){break}}if(r3==38){r3=0;HEAP[r15]=HEAP[r15]+1&255}_SHA_Simple(HEAP[r5]|0,40,HEAP[r5]+40|0);HEAP[HEAP[r5]+60|0]=0}r1=HEAP[r7]<<8;r12=HEAP[r5]+60|0;r13=HEAP[r12];HEAP[r12]=r13+1|0;HEAP[r7]=HEAP[HEAP[r5]+r13+40|0]&255|r1;HEAP[r8]=HEAP[r8]+8|0;if((HEAP[r8]|0)>=(HEAP[r6]|0)){break L45}}}}while(0);HEAP[r7]=(1<<HEAP[r6]-1<<1)-1&HEAP[r7];r16=HEAP[r7];if(!(r16>>>0>=r11>>>0)){break}}r11=Math.floor((r16>>>0)/(r14>>>0));STACKTOP=r4;return r11}function _add234(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+104|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r4+24;r12=r4+28;r13=r4+32;r14=r4+36;r15=r4+40;r16=r4+44;r17=r4+48;r18=r4+52;r19=r4+56;r20=r4+60;r21=r4+64;r22=r4+68;r23=r4+72;r24=r4+76;r25=r4+80;r26=r4+84;r27=r4+88;r28=r4+92;r29=r4+96;r30=r4+100;r31=r1;if((HEAP[r31+4|0]|0)==0){r32=0;STACKTOP=r4;return}HEAP[r24]=r31;HEAP[r25]=r2;HEAP[r26]=-1;HEAP[r29]=HEAP[r25];L64:do{if((HEAP[HEAP[r24]|0]|0)==0){HEAP[r21]=48;r2=_malloc(HEAP[r21]);HEAP[r22]=r2;if((HEAP[r22]|0)!=0){HEAP[HEAP[r24]|0]=HEAP[r22];HEAP[HEAP[HEAP[r24]|0]+44|0]=0;HEAP[HEAP[HEAP[r24]|0]+40|0]=0;HEAP[HEAP[HEAP[r24]|0]+8|0]=0;HEAP[HEAP[HEAP[r24]|0]+4|0]=0;HEAP[HEAP[HEAP[r24]|0]+16|0]=0;HEAP[HEAP[HEAP[r24]|0]+12|0]=0;HEAP[HEAP[HEAP[r24]|0]+24|0]=0;HEAP[HEAP[HEAP[r24]|0]+20|0]=0;HEAP[HEAP[HEAP[r24]|0]+32|0]=0;HEAP[HEAP[HEAP[r24]|0]+28|0]=0;HEAP[HEAP[HEAP[r24]|0]|0]=0;HEAP[HEAP[HEAP[r24]|0]+36|0]=HEAP[r25];HEAP[r23]=HEAP[r29];break}else{_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}else{r2=HEAP[HEAP[r24]|0];HEAP[r27]=r2;L70:do{if((r2|0)!=0){L71:while(1){L73:do{if((HEAP[r26]|0)>=0){r31=HEAP[r26];if((HEAP[HEAP[r27]+4|0]|0)==0){HEAP[r28]=r31;break}if((r31|0)<=(HEAP[HEAP[r27]+20|0]|0)){HEAP[r28]=0;break}HEAP[r26]=-HEAP[HEAP[r27]+20|0]-1+HEAP[r26]|0;if((HEAP[r26]|0)<=(HEAP[HEAP[r27]+24|0]|0)){HEAP[r28]=1;break}HEAP[r26]=-HEAP[HEAP[r27]+24|0]-1+HEAP[r26]|0;if((HEAP[r26]|0)<=(HEAP[HEAP[r27]+28|0]|0)){HEAP[r28]=2;break}HEAP[r26]=-HEAP[HEAP[r27]+28|0]-1+HEAP[r26]|0;if(!((HEAP[r26]|0)<=(HEAP[HEAP[r27]+32|0]|0))){r3=62;break L71}HEAP[r28]=3}else{r31=FUNCTION_TABLE[HEAP[HEAP[r24]+4|0]](HEAP[r25],HEAP[HEAP[r27]+36|0]);HEAP[r30]=r31;if((r31|0)<0){HEAP[r28]=0;break}r33=HEAP[r27]+36|0;if((HEAP[r30]|0)==0){r3=66;break L71}do{if((HEAP[r33+4|0]|0)!=0){r31=FUNCTION_TABLE[HEAP[HEAP[r24]+4|0]](HEAP[r25],HEAP[HEAP[r27]+40|0]);HEAP[r30]=r31;if((r31|0)<0){break}r34=HEAP[r27]+36|0;if((HEAP[r30]|0)==0){r3=71;break L71}do{if((HEAP[r34+8|0]|0)!=0){r31=FUNCTION_TABLE[HEAP[HEAP[r24]+4|0]](HEAP[r25],HEAP[HEAP[r27]+44|0]);HEAP[r30]=r31;if((r31|0)<0){break}if((HEAP[r30]|0)==0){r3=76;break L71}HEAP[r28]=3;break L73}}while(0);HEAP[r28]=2;break L73}}while(0);HEAP[r28]=1}}while(0);if((HEAP[(HEAP[r28]<<2)+HEAP[r27]+4|0]|0)==0){break L70}r31=HEAP[(HEAP[r28]<<2)+HEAP[r27]+4|0];HEAP[r27]=r31;if((r31|0)==0){break L70}}if(r3==62){HEAP[r23]=0;break L64}else if(r3==66){HEAP[r23]=HEAP[r33|0];break L64}else if(r3==71){HEAP[r23]=HEAP[r34+4|0];break L64}else if(r3==76){HEAP[r23]=HEAP[HEAP[r27]+44|0];break L64}}}while(0);r2=HEAP[r25];r31=HEAP[r24]|0;r1=HEAP[r27];r35=HEAP[r28];HEAP[r10]=0;HEAP[r11]=r2;HEAP[r12]=0;HEAP[r13]=r31;HEAP[r14]=r1;HEAP[r15]=r35;r35=_countnode234(HEAP[r10]);HEAP[r16]=r35;r35=_countnode234(HEAP[r12]);HEAP[r17]=r35;L111:do{if((HEAP[r14]|0)!=0){while(1){if((HEAP[HEAP[r14]+40|0]|0)==0){r3=83;break}if((HEAP[HEAP[r14]+44|0]|0)==0){r3=93;break}HEAP[r7]=48;r35=_malloc(HEAP[r7]);HEAP[r8]=r35;if((HEAP[r8]|0)==0){r3=107;break}HEAP[r18]=HEAP[r8];HEAP[HEAP[r18]|0]=HEAP[HEAP[r14]|0];do{if((HEAP[r15]|0)==0){HEAP[HEAP[r18]+4|0]=HEAP[r10];HEAP[HEAP[r18]+20|0]=HEAP[r16];HEAP[HEAP[r18]+36|0]=HEAP[r11];HEAP[HEAP[r18]+8|0]=HEAP[r12];HEAP[HEAP[r18]+24|0]=HEAP[r17];HEAP[HEAP[r18]+40|0]=HEAP[HEAP[r14]+36|0];HEAP[HEAP[r18]+12|0]=HEAP[HEAP[r14]+8|0];HEAP[HEAP[r18]+28|0]=HEAP[HEAP[r14]+24|0];HEAP[r11]=HEAP[HEAP[r14]+40|0];HEAP[HEAP[r14]+4|0]=HEAP[HEAP[r14]+12|0];HEAP[HEAP[r14]+20|0]=HEAP[HEAP[r14]+28|0];HEAP[HEAP[r14]+36|0]=HEAP[HEAP[r14]+44|0];HEAP[HEAP[r14]+8|0]=HEAP[HEAP[r14]+16|0];HEAP[HEAP[r14]+24|0]=HEAP[HEAP[r14]+32|0]}else{if((HEAP[r15]|0)==1){HEAP[HEAP[r18]+4|0]=HEAP[HEAP[r14]+4|0];HEAP[HEAP[r18]+20|0]=HEAP[HEAP[r14]+20|0];HEAP[HEAP[r18]+36|0]=HEAP[HEAP[r14]+36|0];HEAP[HEAP[r18]+8|0]=HEAP[r10];HEAP[HEAP[r18]+24|0]=HEAP[r16];HEAP[HEAP[r18]+40|0]=HEAP[r11];HEAP[HEAP[r18]+12|0]=HEAP[r12];HEAP[HEAP[r18]+28|0]=HEAP[r17];HEAP[r11]=HEAP[HEAP[r14]+40|0];HEAP[HEAP[r14]+4|0]=HEAP[HEAP[r14]+12|0];HEAP[HEAP[r14]+20|0]=HEAP[HEAP[r14]+28|0];HEAP[HEAP[r14]+36|0]=HEAP[HEAP[r14]+44|0];HEAP[HEAP[r14]+8|0]=HEAP[HEAP[r14]+16|0];HEAP[HEAP[r14]+24|0]=HEAP[HEAP[r14]+32|0];break}r35=(HEAP[r15]|0)==2;HEAP[HEAP[r18]+4|0]=HEAP[HEAP[r14]+4|0];HEAP[HEAP[r18]+20|0]=HEAP[HEAP[r14]+20|0];HEAP[HEAP[r18]+36|0]=HEAP[HEAP[r14]+36|0];HEAP[HEAP[r18]+8|0]=HEAP[HEAP[r14]+8|0];HEAP[HEAP[r18]+24|0]=HEAP[HEAP[r14]+24|0];HEAP[HEAP[r18]+40|0]=HEAP[HEAP[r14]+40|0];if(r35){HEAP[HEAP[r18]+12|0]=HEAP[r10];HEAP[HEAP[r18]+28|0]=HEAP[r16];HEAP[HEAP[r14]+4|0]=HEAP[r12];HEAP[HEAP[r14]+20|0]=HEAP[r17];HEAP[HEAP[r14]+36|0]=HEAP[HEAP[r14]+44|0];HEAP[HEAP[r14]+8|0]=HEAP[HEAP[r14]+16|0];HEAP[HEAP[r14]+24|0]=HEAP[HEAP[r14]+32|0];break}else{HEAP[HEAP[r18]+12|0]=HEAP[HEAP[r14]+12|0];HEAP[HEAP[r18]+28|0]=HEAP[HEAP[r14]+28|0];HEAP[HEAP[r14]+4|0]=HEAP[r10];HEAP[HEAP[r14]+20|0]=HEAP[r16];HEAP[HEAP[r14]+36|0]=HEAP[r11];HEAP[HEAP[r14]+8|0]=HEAP[r12];HEAP[HEAP[r14]+24|0]=HEAP[r17];HEAP[r11]=HEAP[HEAP[r14]+44|0];break}}}while(0);HEAP[HEAP[r14]+12|0]=0;HEAP[HEAP[r14]+16|0]=0;HEAP[HEAP[r18]+16|0]=0;HEAP[HEAP[r14]+28|0]=0;HEAP[HEAP[r14]+32|0]=0;HEAP[HEAP[r18]+32|0]=0;HEAP[HEAP[r14]+40|0]=0;HEAP[HEAP[r14]+44|0]=0;HEAP[HEAP[r18]+44|0]=0;if((HEAP[HEAP[r18]+4|0]|0)!=0){HEAP[HEAP[HEAP[r18]+4|0]|0]=HEAP[r18]}if((HEAP[HEAP[r18]+8|0]|0)!=0){HEAP[HEAP[HEAP[r18]+8|0]|0]=HEAP[r18]}if((HEAP[HEAP[r18]+12|0]|0)!=0){HEAP[HEAP[HEAP[r18]+12|0]|0]=HEAP[r18]}if((HEAP[HEAP[r14]+4|0]|0)!=0){HEAP[HEAP[HEAP[r14]+4|0]|0]=HEAP[r14]}if((HEAP[HEAP[r14]+8|0]|0)!=0){HEAP[HEAP[HEAP[r14]+8|0]|0]=HEAP[r14]}HEAP[r10]=HEAP[r18];r35=_countnode234(HEAP[r10]);HEAP[r16]=r35;HEAP[r12]=HEAP[r14];r35=_countnode234(HEAP[r12]);HEAP[r17]=r35;if((HEAP[HEAP[r14]|0]|0)!=0){do{if((HEAP[HEAP[HEAP[r14]|0]+4|0]|0)==(HEAP[r14]|0)){r36=0}else{if((HEAP[HEAP[HEAP[r14]|0]+8|0]|0)==(HEAP[r14]|0)){r36=1;break}r36=(HEAP[HEAP[HEAP[r14]|0]+12|0]|0)==(HEAP[r14]|0)?2:3}}while(0);HEAP[r15]=r36}r35=HEAP[HEAP[r14]|0];HEAP[r14]=r35;if((r35|0)==0){r3=131;break L111}}if(r3==83){if((HEAP[r15]|0)==0){HEAP[HEAP[r14]+12|0]=HEAP[HEAP[r14]+8|0];HEAP[HEAP[r14]+28|0]=HEAP[HEAP[r14]+24|0];HEAP[HEAP[r14]+40|0]=HEAP[HEAP[r14]+36|0];HEAP[HEAP[r14]+8|0]=HEAP[r12];HEAP[HEAP[r14]+24|0]=HEAP[r17];HEAP[HEAP[r14]+36|0]=HEAP[r11];HEAP[HEAP[r14]+4|0]=HEAP[r10];HEAP[HEAP[r14]+20|0]=HEAP[r16]}else{HEAP[HEAP[r14]+12|0]=HEAP[r12];HEAP[HEAP[r14]+28|0]=HEAP[r17];HEAP[HEAP[r14]+40|0]=HEAP[r11];HEAP[HEAP[r14]+8|0]=HEAP[r10];HEAP[HEAP[r14]+24|0]=HEAP[r16]}if((HEAP[HEAP[r14]+4|0]|0)!=0){HEAP[HEAP[HEAP[r14]+4|0]|0]=HEAP[r14]}if((HEAP[HEAP[r14]+8|0]|0)!=0){HEAP[HEAP[HEAP[r14]+8|0]|0]=HEAP[r14]}r35=HEAP[r14];if((HEAP[r35+12|0]|0)==0){r37=r35;break}HEAP[HEAP[HEAP[r14]+12|0]|0]=HEAP[r14];r3=131;break}else if(r3==93){do{if((HEAP[r15]|0)==0){HEAP[HEAP[r14]+16|0]=HEAP[HEAP[r14]+12|0];HEAP[HEAP[r14]+32|0]=HEAP[HEAP[r14]+28|0];HEAP[HEAP[r14]+44|0]=HEAP[HEAP[r14]+40|0];HEAP[HEAP[r14]+12|0]=HEAP[HEAP[r14]+8|0];HEAP[HEAP[r14]+28|0]=HEAP[HEAP[r14]+24|0];HEAP[HEAP[r14]+40|0]=HEAP[HEAP[r14]+36|0];HEAP[HEAP[r14]+8|0]=HEAP[r12];HEAP[HEAP[r14]+24|0]=HEAP[r17];HEAP[HEAP[r14]+36|0]=HEAP[r11];HEAP[HEAP[r14]+4|0]=HEAP[r10];HEAP[HEAP[r14]+20|0]=HEAP[r16]}else{if((HEAP[r15]|0)==1){HEAP[HEAP[r14]+16|0]=HEAP[HEAP[r14]+12|0];HEAP[HEAP[r14]+32|0]=HEAP[HEAP[r14]+28|0];HEAP[HEAP[r14]+44|0]=HEAP[HEAP[r14]+40|0];HEAP[HEAP[r14]+12|0]=HEAP[r12];HEAP[HEAP[r14]+28|0]=HEAP[r17];HEAP[HEAP[r14]+40|0]=HEAP[r11];HEAP[HEAP[r14]+8|0]=HEAP[r10];HEAP[HEAP[r14]+24|0]=HEAP[r16];break}else{HEAP[HEAP[r14]+16|0]=HEAP[r12];HEAP[HEAP[r14]+32|0]=HEAP[r17];HEAP[HEAP[r14]+44|0]=HEAP[r11];HEAP[HEAP[r14]+12|0]=HEAP[r10];HEAP[HEAP[r14]+28|0]=HEAP[r16];break}}}while(0);if((HEAP[HEAP[r14]+4|0]|0)!=0){HEAP[HEAP[HEAP[r14]+4|0]|0]=HEAP[r14]}if((HEAP[HEAP[r14]+8|0]|0)!=0){HEAP[HEAP[HEAP[r14]+8|0]|0]=HEAP[r14]}if((HEAP[HEAP[r14]+12|0]|0)!=0){HEAP[HEAP[HEAP[r14]+12|0]|0]=HEAP[r14]}r35=HEAP[r14];if((HEAP[r35+16|0]|0)==0){r37=r35;break}HEAP[HEAP[HEAP[r14]+16|0]|0]=HEAP[r14];r3=131;break}else if(r3==107){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}}else{r3=131}}while(0);if(r3==131){r37=HEAP[r14]}if((r37|0)!=0){L187:do{if((HEAP[HEAP[r14]|0]|0)!=0){while(1){r35=_countnode234(HEAP[r14]);HEAP[r19]=r35;do{if((HEAP[HEAP[HEAP[r14]|0]+4|0]|0)==(HEAP[r14]|0)){r38=0}else{if((HEAP[HEAP[HEAP[r14]|0]+8|0]|0)==(HEAP[r14]|0)){r38=1;break}r38=(HEAP[HEAP[HEAP[r14]|0]+12|0]|0)==(HEAP[r14]|0)?2:3}}while(0);HEAP[r20]=r38;HEAP[(HEAP[r20]<<2)+HEAP[HEAP[r14]|0]+20|0]=HEAP[r19];HEAP[r14]=HEAP[HEAP[r14]|0];if((HEAP[HEAP[r14]|0]|0)==0){break L187}}}}while(0);HEAP[r9]=0}else{HEAP[r5]=48;r35=_malloc(HEAP[r5]);HEAP[r6]=r35;if((HEAP[r6]|0)==0){_fatal((tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,HEAP[tempInt]=0,tempInt))}HEAP[HEAP[r13]]=HEAP[r6];HEAP[HEAP[HEAP[r13]]+4|0]=HEAP[r10];HEAP[HEAP[HEAP[r13]]+20|0]=HEAP[r16];HEAP[HEAP[HEAP[r13]]+36|0]=HEAP[r11];HEAP[HEAP[HEAP[r13]]+8|0]=HEAP[r12];HEAP[HEAP[HEAP[r13]]+24|0]=HEAP[r17];HEAP[HEAP[HEAP[r13]]+40|0]=0;HEAP[HEAP[HEAP[r13]]+12|0]=0;HEAP[HEAP[HEAP[r13]]+28|0]=0;HEAP[HEAP[HEAP[r13]]+44|0]=0;HEAP[HEAP[HEAP[r13]]+16|0]=0;HEAP[HEAP[HEAP[r13]]+32|0]=0;HEAP[HEAP[HEAP[r13]]|0]=0;if((HEAP[HEAP[HEAP[r13]]+4|0]|0)!=0){HEAP[HEAP[HEAP[HEAP[r13]]+4|0]|0]=HEAP[HEAP[r13]]}if((HEAP[HEAP[HEAP[r13]]+8|0]|0)!=0){HEAP[HEAP[HEAP[HEAP[r13]]+8|0]|0]=HEAP[HEAP[r13]]}HEAP[r9]=1}HEAP[r23]=HEAP[r29]}}while(0);r32=HEAP[r23];STACKTOP=r4;return}function _findrelpos234(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+16|0;r7=r6;r8=r6+4;r9=r6+8;r10=r6+12;r11=r1;r1=r2;r2=r3;r3=0;r12=r4;if((HEAP[r11|0]|0)==0){r13=0;r14=r13;STACKTOP=r6;return r14}if((r2|0)==0){r2=HEAP[r11+4|0]}r4=HEAP[r11|0];r15=0;r16=-1;r17=0;do{if((r1|0)==0){if(!((r3|0)==1|(r3|0)==3)){___assert_func(34596,471,35888,35004)}if((r3|0)==1){r17=1;break}if((r3|0)!=3){break}r17=-1;break}}while(0);while(1){r18=0;L227:do{if((r18|0)>=4|(r18|0)>=3){r5=173}else{while(1){if((HEAP[(r18<<2)+r4+36|0]|0)==0){r5=173;break L227}if((r17|0)!=0){r19=r17}else{r19=FUNCTION_TABLE[r2](r1,HEAP[(r18<<2)+r4+36|0])}if((r19|0)<0){r5=173;break L227}if((HEAP[(r18<<2)+r4+4|0]|0)!=0){r15=r15+HEAP[(r18<<2)+r4+20|0]|0}if((r19|0)==0){break}r15=r15+1|0;r18=r18+1|0;if((r18|0)>=4|(r18|0)>=3){r5=173;break L227}}r20=r18;r16=r20;r21=r20;break}}while(0);if(r5==173){r5=0;r21=r16}if((r21|0)>=0){break}if((HEAP[(r18<<2)+r4+4|0]|0)==0){break}r4=HEAP[(r18<<2)+r4+4|0]}r21=r3;do{if((r16|0)>=0){if(!((r21|0)!=1&(r3|0)!=3)){r19=r15;if((r3|0)==1){r15=r19-1|0;break}else{r15=r19+1|0;break}}if((r12|0)!=0){HEAP[r12]=r15}r13=HEAP[(r16<<2)+r4+36|0];r14=r13;STACKTOP=r6;return r14}else{if((r21|0)==0){r13=0;r14=r13;STACKTOP=r6;return r14}else{if(!((r3|0)==1|(r3|0)==2)){break}r15=r15-1|0;break}}}while(0);HEAP[r8]=r11;HEAP[r9]=r15;L266:do{if((HEAP[HEAP[r8]|0]|0)!=0){do{if((HEAP[r9]|0)>=0){if((HEAP[r9]|0)>=(_countnode234(HEAP[HEAP[r8]|0])|0)){break}r11=HEAP[HEAP[r8]|0];HEAP[r10]=r11;L272:do{if((r11|0)!=0){L273:while(1){r3=HEAP[r10];do{if((HEAP[r9]|0)<(HEAP[HEAP[r10]+20|0]|0)){r21=HEAP[r3+4|0];HEAP[r10]=r21;r22=r21}else{HEAP[r9]=-HEAP[r3+20|0]-1+HEAP[r9]|0;if((HEAP[r9]|0)<0){r5=198;break L273}r21=HEAP[r10];if((HEAP[r9]|0)<(HEAP[HEAP[r10]+24|0]|0)){r4=HEAP[r21+8|0];HEAP[r10]=r4;r22=r4;break}HEAP[r9]=-HEAP[r21+24|0]-1+HEAP[r9]|0;if((HEAP[r9]|0)<0){r5=202;break L273}r21=HEAP[r10];if((HEAP[r9]|0)<(HEAP[HEAP[r10]+28|0]|0)){r4=HEAP[r21+12|0];HEAP[r10]=r4;r22=r4;break}HEAP[r9]=-HEAP[r21+28|0]-1+HEAP[r9]|0;r23=HEAP[r10];if((HEAP[r9]|0)<0){r5=206;break L273}r21=HEAP[r23+16|0];HEAP[r10]=r21;r22=r21}}while(0);if((r22|0)==0){break L272}}if(r5==198){r3=HEAP[HEAP[r10]+36|0];HEAP[r7]=r3;r24=r3;break L266}else if(r5==202){r3=HEAP[HEAP[r10]+40|0];HEAP[r7]=r3;r24=r3;break L266}else if(r5==206){r3=HEAP[r23+44|0];HEAP[r7]=r3;r24=r3;break L266}}}while(0);HEAP[r7]=0;r24=0;break L266}}while(0);HEAP[r7]=0;r24=0}else{HEAP[r7]=0;r24=0}}while(0);r7=r24;do{if((r24|0)!=0){if((r12|0)==0){break}HEAP[r12]=r15}}while(0);r13=r7;r14=r13;STACKTOP=r6;return r14}function _delpos234_internal(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+132|0;r5=r4;r6=r4+4;r7=r4+8;r8=r4+12;r9=r4+16;r10=r4+20;r11=r4+24;r12=r4+28;r13=r4+32;r14=r4+36;r15=r4+40;r16=r4+44;r17=r4+48;r18=r4+52;r19=r4+56;r20=r4+60;r21=r4+64;r22=r4+68;r23=r4+72;r24=r4+76;r25=r4+80;r26=r4+84;r27=r4+88;r28=r4+92;r29=r4+96;r30=r4+100;r31=r4+104;r32=r4+108;r33=r4+112;r34=r4+116;r35=r4+120;r36=r4+124;r37=r4+128;r38=r1;HEAP[r36]=r2;r2=0;r1=HEAP[r38|0];L301:while(1){do{if((HEAP[r36]|0)<=(HEAP[r1+20|0]|0)){HEAP[r37]=0}else{HEAP[r36]=-HEAP[r1+20|0]-1+HEAP[r36]|0;if((HEAP[r36]|0)<=(HEAP[r1+24|0]|0)){HEAP[r37]=1;break}HEAP[r36]=-HEAP[r1+24|0]-1+HEAP[r36]|0;if((HEAP[r36]|0)<=(HEAP[r1+28|0]|0)){HEAP[r37]=2;break}HEAP[r36]=-HEAP[r1+28|0]-1+HEAP[r36]|0;if(!((HEAP[r36]|0)<=(HEAP[r1+32|0]|0))){r3=228;break L301}HEAP[r37]=3}}while(0);if((HEAP[r1+4|0]|0)==0){r3=293;break}if((HEAP[r36]|0)==(HEAP[(HEAP[r37]<<2)+r1+20|0]|0)){if((HEAP[(HEAP[r37]<<2)+r1+36|0]|0)==0){r3=232;break}HEAP[r37]=HEAP[r37]+1|0;HEAP[r36]=0;r39=HEAP[(HEAP[r37]<<2)+r1+4|0];L318:do{if((HEAP[r39+4|0]|0)!=0){while(1){r39=HEAP[r39+4|0];if((HEAP[r39+4|0]|0)==0){break L318}}}}while(0);r2=HEAP[(HEAP[r37]-1<<2)+r1+36|0];HEAP[(HEAP[r37]-1<<2)+r1+36|0]=HEAP[r39+36|0]}r40=HEAP[(HEAP[r37]<<2)+r1+4|0];L323:do{if((HEAP[r40+40|0]|0)!=0){r3=289}else{do{if((HEAP[r37]|0)>0){if((HEAP[HEAP[(HEAP[r37]-1<<2)+r1+4|0]+40|0]|0)==0){if((HEAP[r37]|0)<3){r3=250;break}else{break}}r41=HEAP[r37]-1|0;HEAP[r27]=r1;HEAP[r28]=r41;HEAP[r29]=r37;HEAP[r30]=r36;HEAP[r31]=HEAP[(HEAP[r28]<<2)+HEAP[r27]+4|0];HEAP[r32]=HEAP[(HEAP[r28]+1<<2)+HEAP[r27]+4|0];HEAP[HEAP[r32]+16|0]=HEAP[HEAP[r32]+12|0];HEAP[HEAP[r32]+32|0]=HEAP[HEAP[r32]+28|0];HEAP[HEAP[r32]+44|0]=HEAP[HEAP[r32]+40|0];HEAP[HEAP[r32]+12|0]=HEAP[HEAP[r32]+8|0];HEAP[HEAP[r32]+28|0]=HEAP[HEAP[r32]+24|0];HEAP[HEAP[r32]+40|0]=HEAP[HEAP[r32]+36|0];HEAP[HEAP[r32]+8|0]=HEAP[HEAP[r32]+4|0];HEAP[HEAP[r32]+24|0]=HEAP[HEAP[r32]+20|0];if((HEAP[HEAP[r31]+44|0]|0)!=0){r42=2}else{r42=(HEAP[HEAP[r31]+40|0]|0)!=0?1:0}HEAP[r33]=r42;HEAP[HEAP[r32]+36|0]=HEAP[(HEAP[r28]<<2)+HEAP[r27]+36|0];HEAP[(HEAP[r28]<<2)+HEAP[r27]+36|0]=HEAP[(HEAP[r33]<<2)+HEAP[r31]+36|0];HEAP[(HEAP[r33]<<2)+HEAP[r31]+36|0]=0;HEAP[HEAP[r32]+4|0]=HEAP[(HEAP[r33]+1<<2)+HEAP[r31]+4|0];HEAP[HEAP[r32]+20|0]=HEAP[(HEAP[r33]+1<<2)+HEAP[r31]+20|0];HEAP[(HEAP[r33]+1<<2)+HEAP[r31]+4|0]=0;HEAP[(HEAP[r33]+1<<2)+HEAP[r31]+20|0]=0;if((HEAP[HEAP[r32]+4|0]|0)!=0){HEAP[HEAP[HEAP[r32]+4|0]|0]=HEAP[r32]}HEAP[r35]=HEAP[HEAP[r32]+20|0]+1|0;r41=(HEAP[r28]<<2)+HEAP[r27]+20|0;HEAP[r41]=HEAP[r41]-HEAP[r35]|0;r41=(HEAP[r28]+1<<2)+HEAP[r27]+20|0;HEAP[r41]=HEAP[r41]+HEAP[r35]|0;HEAP[r34]=HEAP[(HEAP[r28]<<2)+HEAP[r27]+20|0];if((HEAP[r29]|0)==0){r3=289;break L323}do{if((HEAP[HEAP[r29]]|0)==(HEAP[r28]|0)){if((HEAP[HEAP[r30]]|0)<=(HEAP[r34]|0)){break}r41=HEAP[r30];HEAP[r41]=-HEAP[r34]-1+HEAP[r41]|0;r41=HEAP[r29];HEAP[r41]=HEAP[r41]+1|0;r3=289;break L323}}while(0);if((HEAP[HEAP[r29]]|0)!=(HEAP[r28]+1|0)){r3=289;break L323}r41=HEAP[r30];HEAP[r41]=HEAP[r41]+HEAP[r35]|0;r3=289;break L323}else{r3=250}}while(0);do{if(r3==250){r3=0;if((HEAP[(HEAP[r37]+1<<2)+r1+4|0]|0)==0){break}if((HEAP[HEAP[(HEAP[r37]+1<<2)+r1+4|0]+40|0]|0)==0){break}r41=HEAP[r37]+1|0;HEAP[r18]=r1;HEAP[r19]=r41;HEAP[r20]=r37;HEAP[r21]=r36;HEAP[r22]=HEAP[(HEAP[r19]<<2)+HEAP[r18]+4|0];HEAP[r23]=HEAP[(HEAP[r19]-1<<2)+HEAP[r18]+4|0];if((HEAP[HEAP[r23]+40|0]|0)!=0){r43=2}else{r43=(HEAP[HEAP[r23]+36|0]|0)!=0?1:0}HEAP[r24]=r43;HEAP[(HEAP[r24]<<2)+HEAP[r23]+36|0]=HEAP[(HEAP[r19]-1<<2)+HEAP[r18]+36|0];HEAP[(HEAP[r19]-1<<2)+HEAP[r18]+36|0]=HEAP[HEAP[r22]+36|0];HEAP[(HEAP[r24]+1<<2)+HEAP[r23]+4|0]=HEAP[HEAP[r22]+4|0];HEAP[(HEAP[r24]+1<<2)+HEAP[r23]+20|0]=HEAP[HEAP[r22]+20|0];if((HEAP[(HEAP[r24]+1<<2)+HEAP[r23]+4|0]|0)!=0){HEAP[HEAP[(HEAP[r24]+1<<2)+HEAP[r23]+4|0]|0]=HEAP[r23]}HEAP[HEAP[r22]+4|0]=HEAP[HEAP[r22]+8|0];HEAP[HEAP[r22]+20|0]=HEAP[HEAP[r22]+24|0];HEAP[HEAP[r22]+36|0]=HEAP[HEAP[r22]+40|0];HEAP[HEAP[r22]+8|0]=HEAP[HEAP[r22]+12|0];HEAP[HEAP[r22]+24|0]=HEAP[HEAP[r22]+28|0];HEAP[HEAP[r22]+40|0]=HEAP[HEAP[r22]+44|0];HEAP[HEAP[r22]+12|0]=HEAP[HEAP[r22]+16|0];HEAP[HEAP[r22]+28|0]=HEAP[HEAP[r22]+32|0];HEAP[HEAP[r22]+44|0]=0;HEAP[HEAP[r22]+16|0]=0;HEAP[HEAP[r22]+32|0]=0;HEAP[r25]=HEAP[(HEAP[r24]+1<<2)+HEAP[r23]+20|0]+1|0;r41=(HEAP[r19]<<2)+HEAP[r18]+20|0;HEAP[r41]=HEAP[r41]-HEAP[r25]|0;r41=(HEAP[r19]-1<<2)+HEAP[r18]+20|0;HEAP[r41]=HEAP[r41]+HEAP[r25]|0;if((HEAP[r20]|0)==0){r3=289;break L323}if((HEAP[HEAP[r20]]|0)!=(HEAP[r19]|0)){r3=289;break L323}r41=HEAP[r21];HEAP[r41]=HEAP[r41]-HEAP[r25]|0;if((HEAP[HEAP[r21]]|0)>=0){r3=289;break L323}r41=HEAP[r21];HEAP[r41]=HEAP[(HEAP[r19]-1<<2)+HEAP[r18]+20|0]+HEAP[r41]+1|0;r41=HEAP[r20];HEAP[r41]=HEAP[r41]-1|0;r3=289;break L323}}while(0);r41=HEAP[r37];r44=(HEAP[r37]|0)>0?r41-1|0:r41;HEAP[r6]=r1;HEAP[r7]=r44;HEAP[r8]=r37;HEAP[r9]=r36;HEAP[r10]=HEAP[(HEAP[r7]<<2)+HEAP[r6]+4|0];HEAP[r13]=HEAP[(HEAP[r7]<<2)+HEAP[r6]+20|0];HEAP[r11]=HEAP[(HEAP[r7]+1<<2)+HEAP[r6]+4|0];HEAP[r14]=HEAP[(HEAP[r7]+1<<2)+HEAP[r6]+20|0];if((HEAP[HEAP[r10]+44|0]|0)!=0){r3=307;break L301}if((HEAP[HEAP[r11]+44|0]|0)!=0){r3=308;break L301}if((HEAP[HEAP[r10]+40|0]|0)!=0){r45=2}else{r45=(HEAP[HEAP[r10]+36|0]|0)!=0?1:0}HEAP[r15]=r45;if((HEAP[HEAP[r11]+40|0]|0)!=0){r46=2}else{r46=(HEAP[HEAP[r11]+36|0]|0)!=0?1:0}HEAP[r16]=r46;HEAP[(HEAP[r15]<<2)+HEAP[r10]+36|0]=HEAP[(HEAP[r7]<<2)+HEAP[r6]+36|0];HEAP[r12]=0;L364:do{if((HEAP[r12]|0)<(HEAP[r16]+1|0)){while(1){HEAP[(HEAP[r15]+HEAP[r12]+1<<2)+HEAP[r10]+4|0]=HEAP[(HEAP[r12]<<2)+HEAP[r11]+4|0];HEAP[(HEAP[r15]+HEAP[r12]+1<<2)+HEAP[r10]+20|0]=HEAP[(HEAP[r12]<<2)+HEAP[r11]+20|0];if((HEAP[(HEAP[r15]+HEAP[r12]+1<<2)+HEAP[r10]+4|0]|0)!=0){HEAP[HEAP[(HEAP[r15]+HEAP[r12]+1<<2)+HEAP[r10]+4|0]|0]=HEAP[r10]}if((HEAP[r12]|0)<(HEAP[r16]|0)){HEAP[(HEAP[r15]+HEAP[r12]+1<<2)+HEAP[r10]+36|0]=HEAP[(HEAP[r12]<<2)+HEAP[r11]+36|0]}HEAP[r12]=HEAP[r12]+1|0;if((HEAP[r12]|0)>=(HEAP[r16]+1|0)){break L364}}}}while(0);r44=(HEAP[r7]<<2)+HEAP[r6]+20|0;HEAP[r44]=HEAP[r14]+HEAP[r44]+1|0;r44=HEAP[r11];HEAP[r5]=r44;if((r44|0)!=0){_free(HEAP[r5])}r44=HEAP[r7];r41=r44+1|0;HEAP[r12]=r41;if((r41|0)<3){while(1){HEAP[(HEAP[r12]<<2)+HEAP[r6]+4|0]=HEAP[(HEAP[r12]+1<<2)+HEAP[r6]+4|0];HEAP[(HEAP[r12]<<2)+HEAP[r6]+20|0]=HEAP[(HEAP[r12]+1<<2)+HEAP[r6]+20|0];r41=HEAP[r12]+1|0;HEAP[r12]=r41;if((r41|0)>=3){break}}r47=HEAP[r7]}else{r47=r44}HEAP[r12]=r47;L382:do{if((r47|0)<2){while(1){HEAP[(HEAP[r12]<<2)+HEAP[r6]+36|0]=HEAP[(HEAP[r12]+1<<2)+HEAP[r6]+36|0];r41=HEAP[r12]+1|0;HEAP[r12]=r41;if((r41|0)>=2){break L382}}}}while(0);HEAP[HEAP[r6]+16|0]=0;HEAP[HEAP[r6]+32|0]=0;HEAP[HEAP[r6]+44|0]=0;do{if((HEAP[r8]|0)!=0){r44=HEAP[r8];r41=HEAP[r44];if((HEAP[HEAP[r8]]|0)==(HEAP[r7]+1|0)){HEAP[r44]=r41-1|0;r44=HEAP[r9];HEAP[r44]=HEAP[r13]+HEAP[r44]+1|0;break}if((r41|0)<=(HEAP[r7]+1|0)){break}r41=HEAP[r8];HEAP[r41]=HEAP[r41]-1|0}}while(0);r40=HEAP[(HEAP[r37]<<2)+r1+4|0];r41=r1;if((HEAP[r41+36|0]|0)!=0){r48=r41;r3=290;break}HEAP[r38|0]=r40;HEAP[r40|0]=0;HEAP[r17]=r1;if((HEAP[r17]|0)!=0){_free(HEAP[r17])}r1=0;break}}while(0);do{if(r3==289){r3=0;r48=r1;r3=290;break}}while(0);do{if(r3==290){r3=0;if((r48|0)==0){break}r39=(HEAP[r37]<<2)+r1+20|0;HEAP[r39]=HEAP[r39]-1|0}}while(0);r1=r40}if(r3==228){___assert_func(34596,900,35964,33536)}else if(r3==232){___assert_func(34596,916,35964,33440)}else if(r3==293){if((HEAP[r1+4|0]|0)!=0){___assert_func(34596,980,35964,33372)}if((r2|0)==0){r2=HEAP[(HEAP[r37]<<2)+r1+36|0]}r48=HEAP[r37];r37=r48;r17=r37;L413:do{if((r48|0)<2){r8=r17;while(1){r7=r37;if((HEAP[(r8+1<<2)+r1+36|0]|0)==0){r49=r7;break L413}HEAP[(r37<<2)+r1+36|0]=HEAP[(r7+1<<2)+r1+36|0];r7=r37+1|0;r37=r7;r13=r37;if((r7|0)<2){r8=r13}else{r49=r13;break L413}}}else{r49=r17}}while(0);HEAP[(r49<<2)+r1+36|0]=0;if((HEAP[r1+36|0]|0)!=0){r50=r2;STACKTOP=r4;return r50}if((r1|0)!=(HEAP[r38|0]|0)){___assert_func(34596,995,35964,35124)}HEAP[r26]=r1;if((HEAP[r26]|0)!=0){_free(HEAP[r26])}HEAP[r38|0]=0;r50=r2;STACKTOP=r4;return r50}else if(r3==307){___assert_func(34596,809,35648,33600)}else if(r3==308){___assert_func(34596,809,35648,33600)}}function _malloc(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187,r188,r189,r190,r191,r192,r193,r194,r195,r196,r197,r198,r199,r200,r201,r202,r203,r204,r205,r206,r207,r208,r209,r210,r211,r212,r213,r214,r215,r216,r217,r218,r219,r220,r221,r222,r223,r224,r225,r226,r227,r228,r229,r230,r231,r232,r233,r234,r235,r236,r237,r238,r239,r240,r241,r242,r243,r244,r245,r246;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+776|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r3+100;r30=r3+104;r31=r3+108;r32=r3+112;r33=r3+116;r34=r3+120;r35=r3+124;r36=r3+128;r37=r3+132;r38=r3+136;r39=r3+140;r40=r3+144;r41=r3+148;r42=r3+152;r43=r3+156;r44=r3+160;r45=r3+164;r46=r3+168;r47=r3+172;r48=r3+176;r49=r3+180;r50=r3+184;r51=r3+188;r52=r3+192;r53=r3+196;r54=r3+200;r55=r3+204;r56=r3+208;r57=r3+212;r58=r3+216;r59=r3+220;r60=r3+224;r61=r3+228;r62=r3+232;r63=r3+236;r64=r3+240;r65=r3+244;r66=r3+248;r67=r3+252;r68=r3+256;r69=r3+260;r70=r3+264;r71=r3+268;r72=r3+272;r73=r3+276;r74=r3+280;r75=r3+284;r76=r3+288;r77=r3+292;r78=r3+296;r79=r3+300;r80=r3+304;r81=r3+308;r82=r3+312;r83=r3+316;r84=r3+320;r85=r3+324;r86=r3+328;r87=r3+332;r88=r3+336;r89=r3+340;r90=r3+344;r91=r3+348;r92=r3+352;r93=r3+356;r94=r3+360;r95=r3+364;r96=r3+368;r97=r3+372;r98=r3+376;r99=r3+380;r100=r3+384;r101=r3+388;r102=r3+392;r103=r3+396;r104=r3+400;r105=r3+404;r106=r3+408;r107=r3+412;r108=r3+416;r109=r3+420;r110=r3+424;r111=r3+428;r112=r3+432;r113=r3+436;r114=r3+440;r115=r3+444;r116=r3+448;r117=r3+452;r118=r3+456;r119=r3+460;r120=r3+464;r121=r3+468;r122=r3+472;r123=r3+476;r124=r3+480;r125=r3+484;r126=r3+488;r127=r3+492;r128=r3+496;r129=r3+500;r130=r3+504;r131=r3+508;r132=r3+512;r133=r3+516;r134=r3+520;r135=r3+524;r136=r3+528;r137=r3+532;r138=r3+536;r139=r3+540;r140=r3+544;r141=r3+548;r142=r3+552;r143=r3+556;r144=r3+560;r145=r3+564;r146=r3+568;r147=r3+572;r148=r3+576;r149=r3+580;r150=r3+584;r151=r3+588;r152=r3+592;r153=r3+596;r154=r3+600;r155=r3+604;r156=r3+608;r157=r3+612;r158=r3+616;r159=r3+620;r160=r3+624;r161=r3+628;r162=r3+632;r163=r3+636;r164=r3+640;r165=r3+644;r166=r3+648;r167=r3+652;r168=r3+656;r169=r3+660;r170=r3+664;r171=r3+668;r172=r3+672;r173=r3+676;r174=r3+680;r175=r3+684;r176=r3+688;r177=r3+692;r178=r3+696;r179=r3+700;r180=r3+704;r181=r3+708;r182=r3+712;r183=r3+716;r184=r3+720;r185=r3+724;r186=r3+728;r187=r3+732;r188=r3+736;r189=r3+740;r190=r3+744;r191=r3+748;r192=r3+752;r193=r3+756;r194=r3+760;r195=r3+764;r196=r3+768;r197=r3+772;r198=r1;r1=r198;do{if(r198>>>0<=244){if(r1>>>0<11){r199=16}else{r199=r198+11&-8}r200=r199;r201=r200>>>3;r202=HEAP[35176]>>>(r201>>>0);if((r202&3|0)!=0){r201=r201+((r202^-1)&1)|0;r203=(r201<<3)+35216|0;r204=HEAP[r203+8|0];r205=HEAP[r204+8|0];do{if((r203|0)==(r205|0)){HEAP[35176]=HEAP[35176]&(1<<r201^-1)}else{if(r205>>>0>=HEAP[35192]>>>0){r206=(HEAP[r205+12|0]|0)==(r204|0)}else{r206=0}if((r206&1|0)!=0){HEAP[r205+12|0]=r203;HEAP[r203+8|0]=r205;break}else{_abort()}}}while(0);HEAP[r204+4|0]=r201<<3|3;r205=(r201<<3)+r204+4|0;HEAP[r205]=HEAP[r205]|1;r207=r204+8|0;r208=r207;STACKTOP=r3;return r208}if(r200>>>0<=HEAP[35184]>>>0){break}if((r202|0)!=0){r205=(-(1<<r201<<1)|1<<r201<<1)&r202<<r201;r203=(-r205&r205)-1|0;r205=r203>>>12&16;r209=r205;r203=r203>>>(r205>>>0);r210=r203>>>5&8;r205=r210;r209=r210+r209|0;r203=r203>>>(r205>>>0);r210=r203>>>2&4;r205=r210;r209=r210+r209|0;r203=r203>>>(r205>>>0);r210=r203>>>1&2;r205=r210;r209=r210+r209|0;r203=r203>>>(r205>>>0);r210=r203>>>1&1;r205=r210;r209=r210+r209|0;r203=r203>>>(r205>>>0);r205=r203+r209|0;r209=(r205<<3)+35216|0;r203=HEAP[r209+8|0];r210=HEAP[r203+8|0];do{if((r209|0)==(r210|0)){HEAP[35176]=HEAP[35176]&(1<<r205^-1)}else{if(r210>>>0>=HEAP[35192]>>>0){r211=(HEAP[r210+12|0]|0)==(r203|0)}else{r211=0}if((r211&1|0)!=0){HEAP[r210+12|0]=r209;HEAP[r209+8|0]=r210;break}else{_abort()}}}while(0);r210=(r205<<3)-r200|0;HEAP[r203+4|0]=r200|3;r209=r203+r200|0;HEAP[r209+4|0]=r210|1;HEAP[r209+r210|0]=r210;r201=HEAP[35184];if((r201|0)!=0){r202=HEAP[35196];r204=r201>>>3;r201=(r204<<3)+35216|0;r212=r201;do{if((1<<r204&HEAP[35176]|0)!=0){if((HEAP[r201+8|0]>>>0>=HEAP[35192]>>>0&1|0)!=0){r212=HEAP[r201+8|0];break}else{_abort()}}else{HEAP[35176]=HEAP[35176]|1<<r204}}while(0);HEAP[r201+8|0]=r202;HEAP[r212+12|0]=r202;HEAP[r202+8|0]=r212;HEAP[r202+12|0]=r201}HEAP[35184]=r210;HEAP[35196]=r209;r207=r203+8|0;r208=r207;STACKTOP=r3;return r208}if((HEAP[35180]|0)==0){break}HEAP[r173]=35176;HEAP[r174]=r200;HEAP[r179]=-HEAP[HEAP[r173]+4|0]&HEAP[HEAP[r173]+4|0];HEAP[r180]=HEAP[r179]-1|0;HEAP[r181]=HEAP[r180]>>>12&16;HEAP[r182]=HEAP[r181];HEAP[r180]=HEAP[r180]>>>(HEAP[r181]>>>0);r204=HEAP[r180]>>>5&8;HEAP[r181]=r204;HEAP[r182]=r204+HEAP[r182]|0;HEAP[r180]=HEAP[r180]>>>(HEAP[r181]>>>0);r204=HEAP[r180]>>>2&4;HEAP[r181]=r204;HEAP[r182]=r204+HEAP[r182]|0;HEAP[r180]=HEAP[r180]>>>(HEAP[r181]>>>0);r204=HEAP[r180]>>>1&2;HEAP[r181]=r204;HEAP[r182]=r204+HEAP[r182]|0;HEAP[r180]=HEAP[r180]>>>(HEAP[r181]>>>0);r204=HEAP[r180]>>>1&1;HEAP[r181]=r204;HEAP[r182]=r204+HEAP[r182]|0;HEAP[r180]=HEAP[r180]>>>(HEAP[r181]>>>0);HEAP[r178]=HEAP[r180]+HEAP[r182]|0;r204=HEAP[(HEAP[r178]<<2)+HEAP[r173]+304|0];HEAP[r175]=r204;HEAP[r176]=r204;HEAP[r177]=(HEAP[HEAP[r175]+4|0]&-8)-HEAP[r174]|0;while(1){r204=HEAP[r175]+16|0;if((HEAP[HEAP[r175]+16|0]|0)!=0){r213=HEAP[r204|0]}else{r213=HEAP[r204+4|0]}HEAP[r175]=r213;if((r213|0)==0){break}HEAP[r183]=(HEAP[HEAP[r175]+4|0]&-8)-HEAP[r174]|0;if(HEAP[r183]>>>0>=HEAP[r177]>>>0){continue}HEAP[r177]=HEAP[r183];HEAP[r176]=HEAP[r175]}if((HEAP[r176]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)==0){_abort()}HEAP[r184]=HEAP[r176]+HEAP[r174]|0;if((HEAP[r176]>>>0<HEAP[r184]>>>0&1|0)==0){_abort()}HEAP[r185]=HEAP[HEAP[r176]+24|0];r203=HEAP[r176];L644:do{if((HEAP[HEAP[r176]+12|0]|0)!=(HEAP[r176]|0)){HEAP[r187]=HEAP[r203+8|0];HEAP[r186]=HEAP[HEAP[r176]+12|0];do{if(HEAP[r187]>>>0>=HEAP[HEAP[r173]+16|0]>>>0){if((HEAP[HEAP[r187]+12|0]|0)!=(HEAP[r176]|0)){r214=0;break}r214=(HEAP[HEAP[r186]+8|0]|0)==(HEAP[r176]|0)}else{r214=0}}while(0);if((r214&1|0)!=0){HEAP[HEAP[r187]+12|0]=HEAP[r186];HEAP[HEAP[r186]+8|0]=HEAP[r187];break}else{_abort()}}else{r209=r203+20|0;HEAP[r188]=r209;r210=HEAP[r209];HEAP[r186]=r210;do{if((r210|0)==0){r209=HEAP[r176]+16|0;HEAP[r188]=r209;r201=HEAP[r209];HEAP[r186]=r201;if((r201|0)!=0){break}else{break L644}}}while(0);while(1){r210=HEAP[r186]+20|0;HEAP[r189]=r210;if((HEAP[r210]|0)==0){r210=HEAP[r186]+16|0;HEAP[r189]=r210;if((HEAP[r210]|0)==0){break}}r210=HEAP[r189];HEAP[r188]=r210;HEAP[r186]=HEAP[r210]}if((HEAP[r188]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r188]]=0;break}else{_abort()}}}while(0);do{if((HEAP[r185]|0)!=0){HEAP[r190]=(HEAP[HEAP[r176]+28|0]<<2)+HEAP[r173]+304|0;do{if((HEAP[r176]|0)==(HEAP[HEAP[r190]]|0)){r203=HEAP[r186];HEAP[HEAP[r190]]=r203;if((r203|0)!=0){break}r203=HEAP[r173]+4|0;HEAP[r203]=HEAP[r203]&(1<<HEAP[HEAP[r176]+28|0]^-1)}else{if((HEAP[r185]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)==0){_abort()}r203=HEAP[r186];r210=HEAP[r185]+16|0;if((HEAP[HEAP[r185]+16|0]|0)==(HEAP[r176]|0)){HEAP[r210|0]=r203;break}else{HEAP[r210+4|0]=r203;break}}}while(0);if((HEAP[r186]|0)==0){break}if((HEAP[r186]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)==0){_abort()}HEAP[HEAP[r186]+24|0]=HEAP[r185];r203=HEAP[HEAP[r176]+16|0];HEAP[r191]=r203;do{if((r203|0)!=0){if((HEAP[r191]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r186]+16|0]=HEAP[r191];HEAP[HEAP[r191]+24|0]=HEAP[r186];break}else{_abort()}}}while(0);r203=HEAP[HEAP[r176]+20|0];HEAP[r192]=r203;if((r203|0)==0){break}if((HEAP[r192]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r186]+20|0]=HEAP[r192];HEAP[HEAP[r192]+24|0]=HEAP[r186];break}else{_abort()}}}while(0);if(HEAP[r177]>>>0<16){HEAP[HEAP[r176]+4|0]=HEAP[r174]+HEAP[r177]|3;r203=HEAP[r176]+HEAP[r174]+HEAP[r177]+4|0;HEAP[r203]=HEAP[r203]|1}else{HEAP[HEAP[r176]+4|0]=HEAP[r174]|3;HEAP[HEAP[r184]+4|0]=HEAP[r177]|1;HEAP[HEAP[r184]+HEAP[r177]|0]=HEAP[r177];HEAP[r193]=HEAP[HEAP[r173]+8|0];if((HEAP[r193]|0)!=0){HEAP[r194]=HEAP[HEAP[r173]+20|0];HEAP[r195]=HEAP[r193]>>>3;HEAP[r196]=(HEAP[r195]<<3)+HEAP[r173]+40|0;HEAP[r197]=HEAP[r196];do{if((1<<HEAP[r195]&HEAP[HEAP[r173]|0]|0)!=0){if((HEAP[HEAP[r196]+8|0]>>>0>=HEAP[HEAP[r173]+16|0]>>>0&1|0)!=0){HEAP[r197]=HEAP[HEAP[r196]+8|0];break}else{_abort()}}else{r203=HEAP[r173]|0;HEAP[r203]=HEAP[r203]|1<<HEAP[r195]}}while(0);HEAP[HEAP[r196]+8|0]=HEAP[r194];HEAP[HEAP[r197]+12|0]=HEAP[r194];HEAP[HEAP[r194]+8|0]=HEAP[r197];HEAP[HEAP[r194]+12|0]=HEAP[r196]}HEAP[HEAP[r173]+8|0]=HEAP[r177];HEAP[HEAP[r173]+20|0]=HEAP[r184]}r203=HEAP[r176]+8|0;r207=r203;if((r203|0)==0){break}r208=r207;STACKTOP=r3;return r208}else{if(r1>>>0>=4294967232){r200=-1;break}r200=r198+11&-8;if((HEAP[35180]|0)==0){break}HEAP[r129]=35176;HEAP[r130]=r200;HEAP[r131]=0;HEAP[r132]=-HEAP[r130]|0;HEAP[r135]=HEAP[r130]>>>8;do{if((HEAP[r135]|0)==0){HEAP[r134]=0}else{if(HEAP[r135]>>>0>65535){HEAP[r134]=31;break}else{HEAP[r136]=HEAP[r135];HEAP[r137]=(HEAP[r136]-256|0)>>>16&8;r203=HEAP[r136]<<HEAP[r137];HEAP[r136]=r203;HEAP[r138]=(r203-4096|0)>>>16&4;HEAP[r137]=HEAP[r137]+HEAP[r138]|0;r203=HEAP[r136]<<HEAP[r138];HEAP[r136]=r203;r210=(r203-16384|0)>>>16&2;HEAP[r138]=r210;HEAP[r137]=r210+HEAP[r137]|0;r210=-HEAP[r137]+14|0;r203=HEAP[r136]<<HEAP[r138];HEAP[r136]=r203;HEAP[r138]=r210+(r203>>>15)|0;HEAP[r134]=(HEAP[r138]<<1)+(HEAP[r130]>>>((HEAP[r138]+7|0)>>>0)&1)|0;break}}}while(0);r203=HEAP[(HEAP[r134]<<2)+HEAP[r129]+304|0];HEAP[r133]=r203;do{if((r203|0)!=0){if((HEAP[r134]|0)==31){r215=0}else{r215=-(HEAP[r134]>>>1)+25|0}HEAP[r139]=HEAP[r130]<<r215;HEAP[r140]=0;while(1){HEAP[r142]=(HEAP[HEAP[r133]+4|0]&-8)-HEAP[r130]|0;if(HEAP[r142]>>>0<HEAP[r132]>>>0){r210=HEAP[r133];HEAP[r131]=r210;r201=HEAP[r142];HEAP[r132]=r201;if((r201|0)==0){r216=r210;break}}HEAP[r141]=HEAP[HEAP[r133]+20|0];r210=HEAP[((HEAP[r139]>>>31&1)<<2)+HEAP[r133]+16|0];HEAP[r133]=r210;do{if((HEAP[r141]|0)!=0){r201=HEAP[r133];if((HEAP[r141]|0)==(r201|0)){r217=r201;break}HEAP[r140]=HEAP[r141];r217=HEAP[r133]}else{r217=r210}}while(0);if((r217|0)==0){r2=415;break}HEAP[r139]=HEAP[r139]<<1}if(r2==415){r210=HEAP[r140];HEAP[r133]=r210;r216=r210}if((r216|0)==0){r2=418;break}else{r2=421;break}}else{r2=418}}while(0);do{if(r2==418){if((HEAP[r131]|0)!=0){r2=421;break}HEAP[r143]=(-(1<<HEAP[r134]<<1)|1<<HEAP[r134]<<1)&HEAP[HEAP[r129]+4|0];if((HEAP[r143]|0)==0){r2=421;break}HEAP[r145]=-HEAP[r143]&HEAP[r143];HEAP[r146]=HEAP[r145]-1|0;HEAP[r147]=HEAP[r146]>>>12&16;HEAP[r148]=HEAP[r147];HEAP[r146]=HEAP[r146]>>>(HEAP[r147]>>>0);r203=HEAP[r146]>>>5&8;HEAP[r147]=r203;HEAP[r148]=r203+HEAP[r148]|0;HEAP[r146]=HEAP[r146]>>>(HEAP[r147]>>>0);r203=HEAP[r146]>>>2&4;HEAP[r147]=r203;HEAP[r148]=r203+HEAP[r148]|0;HEAP[r146]=HEAP[r146]>>>(HEAP[r147]>>>0);r203=HEAP[r146]>>>1&2;HEAP[r147]=r203;HEAP[r148]=r203+HEAP[r148]|0;HEAP[r146]=HEAP[r146]>>>(HEAP[r147]>>>0);r203=HEAP[r146]>>>1&1;HEAP[r147]=r203;HEAP[r148]=r203+HEAP[r148]|0;HEAP[r146]=HEAP[r146]>>>(HEAP[r147]>>>0);HEAP[r144]=HEAP[r146]+HEAP[r148]|0;r203=HEAP[(HEAP[r144]<<2)+HEAP[r129]+304|0];HEAP[r133]=r203;r218=r203;break}}while(0);if(r2==421){r218=HEAP[r133]}L469:do{if((r218|0)!=0){while(1){HEAP[r149]=(HEAP[HEAP[r133]+4|0]&-8)-HEAP[r130]|0;if(HEAP[r149]>>>0<HEAP[r132]>>>0){HEAP[r132]=HEAP[r149];HEAP[r131]=HEAP[r133]}r203=HEAP[r133]+16|0;if((HEAP[HEAP[r133]+16|0]|0)!=0){r219=HEAP[r203|0]}else{r219=HEAP[r203+4|0]}HEAP[r133]=r219;if((r219|0)==0){break L469}}}}while(0);do{if((HEAP[r131]|0)!=0){if(HEAP[r132]>>>0>=(HEAP[HEAP[r129]+8|0]-HEAP[r130]|0)>>>0){r2=499;break}if((HEAP[r131]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)==0){_abort()}HEAP[r150]=HEAP[r131]+HEAP[r130]|0;if((HEAP[r131]>>>0<HEAP[r150]>>>0&1|0)==0){_abort()}HEAP[r151]=HEAP[HEAP[r131]+24|0];r203=HEAP[r131];L489:do{if((HEAP[HEAP[r131]+12|0]|0)!=(HEAP[r131]|0)){HEAP[r153]=HEAP[r203+8|0];HEAP[r152]=HEAP[HEAP[r131]+12|0];do{if(HEAP[r153]>>>0>=HEAP[HEAP[r129]+16|0]>>>0){if((HEAP[HEAP[r153]+12|0]|0)!=(HEAP[r131]|0)){r220=0;break}r220=(HEAP[HEAP[r152]+8|0]|0)==(HEAP[r131]|0)}else{r220=0}}while(0);if((r220&1|0)!=0){HEAP[HEAP[r153]+12|0]=HEAP[r152];HEAP[HEAP[r152]+8|0]=HEAP[r153];break}else{_abort()}}else{r210=r203+20|0;HEAP[r154]=r210;r201=HEAP[r210];HEAP[r152]=r201;do{if((r201|0)==0){r210=HEAP[r131]+16|0;HEAP[r154]=r210;r209=HEAP[r210];HEAP[r152]=r209;if((r209|0)!=0){break}else{break L489}}}while(0);while(1){r201=HEAP[r152]+20|0;HEAP[r155]=r201;if((HEAP[r201]|0)==0){r201=HEAP[r152]+16|0;HEAP[r155]=r201;if((HEAP[r201]|0)==0){break}}r201=HEAP[r155];HEAP[r154]=r201;HEAP[r152]=HEAP[r201]}if((HEAP[r154]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r154]]=0;break}else{_abort()}}}while(0);do{if((HEAP[r151]|0)!=0){HEAP[r156]=(HEAP[HEAP[r131]+28|0]<<2)+HEAP[r129]+304|0;do{if((HEAP[r131]|0)==(HEAP[HEAP[r156]]|0)){r203=HEAP[r152];HEAP[HEAP[r156]]=r203;if((r203|0)!=0){break}r203=HEAP[r129]+4|0;HEAP[r203]=HEAP[r203]&(1<<HEAP[HEAP[r131]+28|0]^-1)}else{if((HEAP[r151]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)==0){_abort()}r203=HEAP[r152];r201=HEAP[r151]+16|0;if((HEAP[HEAP[r151]+16|0]|0)==(HEAP[r131]|0)){HEAP[r201|0]=r203;break}else{HEAP[r201+4|0]=r203;break}}}while(0);if((HEAP[r152]|0)==0){break}if((HEAP[r152]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)==0){_abort()}HEAP[HEAP[r152]+24|0]=HEAP[r151];r203=HEAP[HEAP[r131]+16|0];HEAP[r157]=r203;do{if((r203|0)!=0){if((HEAP[r157]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r152]+16|0]=HEAP[r157];HEAP[HEAP[r157]+24|0]=HEAP[r152];break}else{_abort()}}}while(0);r203=HEAP[HEAP[r131]+20|0];HEAP[r158]=r203;if((r203|0)==0){break}if((HEAP[r158]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r152]+20|0]=HEAP[r158];HEAP[HEAP[r158]+24|0]=HEAP[r152];break}else{_abort()}}}while(0);L539:do{if(HEAP[r132]>>>0<16){HEAP[HEAP[r131]+4|0]=HEAP[r130]+HEAP[r132]|3;r203=HEAP[r131]+HEAP[r130]+HEAP[r132]+4|0;HEAP[r203]=HEAP[r203]|1}else{HEAP[HEAP[r131]+4|0]=HEAP[r130]|3;HEAP[HEAP[r150]+4|0]=HEAP[r132]|1;HEAP[HEAP[r150]+HEAP[r132]|0]=HEAP[r132];if(HEAP[r132]>>>3>>>0<32){HEAP[r159]=HEAP[r132]>>>3;HEAP[r160]=(HEAP[r159]<<3)+HEAP[r129]+40|0;HEAP[r161]=HEAP[r160];do{if((1<<HEAP[r159]&HEAP[HEAP[r129]|0]|0)!=0){if((HEAP[HEAP[r160]+8|0]>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)!=0){HEAP[r161]=HEAP[HEAP[r160]+8|0];break}else{_abort()}}else{r203=HEAP[r129]|0;HEAP[r203]=HEAP[r203]|1<<HEAP[r159]}}while(0);HEAP[HEAP[r160]+8|0]=HEAP[r150];HEAP[HEAP[r161]+12|0]=HEAP[r150];HEAP[HEAP[r150]+8|0]=HEAP[r161];HEAP[HEAP[r150]+12|0]=HEAP[r160];break}HEAP[r162]=HEAP[r150];HEAP[r165]=HEAP[r132]>>>8;do{if((HEAP[r165]|0)==0){HEAP[r164]=0}else{if(HEAP[r165]>>>0>65535){HEAP[r164]=31;break}else{HEAP[r166]=HEAP[r165];HEAP[r167]=(HEAP[r166]-256|0)>>>16&8;r203=HEAP[r166]<<HEAP[r167];HEAP[r166]=r203;HEAP[r168]=(r203-4096|0)>>>16&4;HEAP[r167]=HEAP[r167]+HEAP[r168]|0;r203=HEAP[r166]<<HEAP[r168];HEAP[r166]=r203;r201=(r203-16384|0)>>>16&2;HEAP[r168]=r201;HEAP[r167]=r201+HEAP[r167]|0;r201=-HEAP[r167]+14|0;r203=HEAP[r166]<<HEAP[r168];HEAP[r166]=r203;HEAP[r168]=r201+(r203>>>15)|0;HEAP[r164]=(HEAP[r168]<<1)+(HEAP[r132]>>>((HEAP[r168]+7|0)>>>0)&1)|0;break}}}while(0);HEAP[r163]=(HEAP[r164]<<2)+HEAP[r129]+304|0;HEAP[HEAP[r162]+28|0]=HEAP[r164];HEAP[HEAP[r162]+20|0]=0;HEAP[HEAP[r162]+16|0]=0;if((1<<HEAP[r164]&HEAP[HEAP[r129]+4|0]|0)==0){r203=HEAP[r129]+4|0;HEAP[r203]=HEAP[r203]|1<<HEAP[r164];HEAP[HEAP[r163]]=HEAP[r162];HEAP[HEAP[r162]+24|0]=HEAP[r163];r203=HEAP[r162];HEAP[HEAP[r162]+12|0]=r203;HEAP[HEAP[r162]+8|0]=r203;break}HEAP[r169]=HEAP[HEAP[r163]];if((HEAP[r164]|0)==31){r221=0}else{r221=-(HEAP[r164]>>>1)+25|0}HEAP[r170]=HEAP[r132]<<r221;L565:do{if((HEAP[HEAP[r169]+4|0]&-8|0)!=(HEAP[r132]|0)){while(1){HEAP[r171]=((HEAP[r170]>>>31&1)<<2)+HEAP[r169]+16|0;HEAP[r170]=HEAP[r170]<<1;r222=HEAP[r171];if((HEAP[HEAP[r171]]|0)==0){break}HEAP[r169]=HEAP[r222];if((HEAP[HEAP[r169]+4|0]&-8|0)==(HEAP[r132]|0)){break L565}}if((r222>>>0>=HEAP[HEAP[r129]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r171]]=HEAP[r162];HEAP[HEAP[r162]+24|0]=HEAP[r169];r203=HEAP[r162];HEAP[HEAP[r162]+12|0]=r203;HEAP[HEAP[r162]+8|0]=r203;break L539}else{_abort()}}}while(0);HEAP[r172]=HEAP[HEAP[r169]+8|0];if(HEAP[r169]>>>0>=HEAP[HEAP[r129]+16|0]>>>0){r223=HEAP[r172]>>>0>=HEAP[HEAP[r129]+16|0]>>>0}else{r223=0}if((r223&1|0)!=0){r203=HEAP[r162];HEAP[HEAP[r172]+12|0]=r203;HEAP[HEAP[r169]+8|0]=r203;HEAP[HEAP[r162]+8|0]=HEAP[r172];HEAP[HEAP[r162]+12|0]=HEAP[r169];HEAP[HEAP[r162]+24|0]=0;break}else{_abort()}}}while(0);r203=HEAP[r131]+8|0;HEAP[r128]=r203;r224=r203;break}else{r2=499}}while(0);if(r2==499){HEAP[r128]=0;r224=0}r207=r224;if((r224|0)==0){break}r208=r207;STACKTOP=r3;return r208}}while(0);if(r200>>>0<=HEAP[35184]>>>0){r224=HEAP[35184]-r200|0;r128=HEAP[35196];if(r224>>>0>=16){r131=r128+r200|0;HEAP[35196]=r131;r162=r131;HEAP[35184]=r224;HEAP[r162+4|0]=r224|1;HEAP[r162+r224|0]=r224;HEAP[r128+4|0]=r200|3}else{r224=HEAP[35184];HEAP[35184]=0;HEAP[35196]=0;HEAP[r128+4|0]=r224|3;r162=r224+(r128+4)|0;HEAP[r162]=HEAP[r162]|1}r207=r128+8|0;r208=r207;STACKTOP=r3;return r208}r128=r200;if(r200>>>0<HEAP[35188]>>>0){r162=HEAP[35188]-r128|0;HEAP[35188]=r162;r224=HEAP[35200];r131=r224+r200|0;HEAP[35200]=r131;HEAP[r131+4|0]=r162|1;HEAP[r224+4|0]=r200|3;r207=r224+8|0;r208=r207;STACKTOP=r3;return r208}HEAP[r105]=35176;HEAP[r106]=r128;HEAP[r107]=-1;HEAP[r108]=0;HEAP[r109]=0;if((HEAP[33232]|0)==0){_init_mparams()}HEAP[r110]=(HEAP[33240]-1^-1)&HEAP[r106]+HEAP[33240]+47;L725:do{if(HEAP[r110]>>>0<=HEAP[r106]>>>0){HEAP[r104]=0}else{do{if((HEAP[HEAP[r105]+440|0]|0)!=0){HEAP[r111]=HEAP[r110]+HEAP[HEAP[r105]+432|0]|0;if(!(HEAP[r111]>>>0<=HEAP[HEAP[r105]+432|0]>>>0)){if(HEAP[r111]>>>0<=HEAP[HEAP[r105]+440|0]>>>0){break}}HEAP[r104]=0;break L725}}while(0);L734:do{if((HEAP[HEAP[r105]+444|0]&4|0)!=0){r2=550}else{HEAP[r112]=-1;HEAP[r113]=HEAP[r110];do{if((HEAP[HEAP[r105]+24|0]|0)==0){HEAP[r114]=0;r2=526;break}else{r128=HEAP[HEAP[r105]+24|0];HEAP[r101]=HEAP[r105];HEAP[r102]=r128;HEAP[r103]=HEAP[r101]+448|0;while(1){if(HEAP[r102]>>>0>=HEAP[HEAP[r103]|0]>>>0){if(HEAP[r102]>>>0<(HEAP[HEAP[r103]|0]+HEAP[HEAP[r103]+4|0]|0)>>>0){r2=522;break}}r128=HEAP[HEAP[r103]+8|0];HEAP[r103]=r128;if((r128|0)==0){r2=524;break}}if(r2==522){r128=HEAP[r103];HEAP[r100]=r128;r225=r128}else if(r2==524){HEAP[r100]=0;r225=0}HEAP[r114]=r225;if((r225|0)==0){r2=526;break}HEAP[r113]=(HEAP[33240]-1^-1)&HEAP[r106]+ -HEAP[HEAP[r105]+12|0]+HEAP[33240]+47;if(HEAP[r113]>>>0>=2147483647){r2=538;break}r128=_sbrk(HEAP[r113]);HEAP[r112]=r128;if((r128|0)!=(HEAP[HEAP[r114]|0]+HEAP[HEAP[r114]+4|0]|0)){r2=538;break}r128=HEAP[r112];HEAP[r107]=r128;HEAP[r108]=HEAP[r113];r226=r128;break}}while(0);do{if(r2==526){r128=_sbrk(0);HEAP[r115]=r128;if((r128|0)==-1){r2=538;break}if((HEAP[33236]-1&HEAP[r115]|0)!=0){HEAP[r113]=(HEAP[33236]-1+HEAP[r115]&(HEAP[33236]-1^-1))+ -HEAP[r115]+HEAP[r113]|0}HEAP[r116]=HEAP[r113]+HEAP[HEAP[r105]+432|0]|0;if(!(HEAP[r113]>>>0>HEAP[r106]>>>0&HEAP[r113]>>>0<2147483647)){r2=538;break}if((HEAP[HEAP[r105]+440|0]|0)!=0){if(HEAP[r116]>>>0<=HEAP[HEAP[r105]+432|0]>>>0){r2=538;break}if(!(HEAP[r116]>>>0<=HEAP[HEAP[r105]+440|0]>>>0)){r2=538;break}}r128=_sbrk(HEAP[r113]);HEAP[r112]=r128;if((r128|0)!=(HEAP[r115]|0)){r2=538;break}r128=HEAP[r115];HEAP[r107]=r128;HEAP[r108]=HEAP[r113];r226=r128;break}}while(0);if(r2==538){r226=HEAP[r107]}if((r226|0)!=-1){r2=550;break}L767:do{if((HEAP[r112]|0)!=-1){do{if(HEAP[r113]>>>0<2147483647){if(HEAP[r113]>>>0>=(HEAP[r106]+48|0)>>>0){break}HEAP[r117]=(HEAP[33240]-1^-1)&HEAP[r106]+ -HEAP[r113]+HEAP[33240]+47;if(HEAP[r117]>>>0>=2147483647){break}r128=_sbrk(HEAP[r117]);HEAP[r118]=r128;if((HEAP[r118]|0)!=-1){HEAP[r113]=HEAP[r113]+HEAP[r117]|0;break}else{_sbrk(-HEAP[r113]|0);HEAP[r112]=-1;break L767}}}while(0);if((HEAP[r112]|0)==-1){break}r128=HEAP[r112];HEAP[r107]=r128;HEAP[r108]=HEAP[r113];r227=r128;break L734}}while(0);r128=HEAP[r105]+444|0;HEAP[r128]=HEAP[r128]|4;r2=550;break}}while(0);if(r2==550){r227=HEAP[r107]}do{if((r227|0)==-1){if(HEAP[r110]>>>0>=2147483647){r2=558;break}HEAP[r119]=-1;HEAP[r120]=-1;r128=_sbrk(HEAP[r110]);HEAP[r119]=r128;r128=_sbrk(0);HEAP[r120]=r128;if((HEAP[r119]|0)==-1){r2=558;break}if((HEAP[r120]|0)==-1){r2=558;break}if(HEAP[r119]>>>0>=HEAP[r120]>>>0){r2=558;break}HEAP[r121]=HEAP[r120]-HEAP[r119]|0;if(HEAP[r121]>>>0<=(HEAP[r106]+40|0)>>>0){r2=558;break}r128=HEAP[r119];HEAP[r107]=r128;HEAP[r108]=HEAP[r121];r228=r128;break}else{r2=558}}while(0);if(r2==558){r228=HEAP[r107]}do{if((r228|0)!=-1){r128=HEAP[r105]+432|0;r224=HEAP[r128]+HEAP[r108]|0;HEAP[r128]=r224;if(r224>>>0>HEAP[HEAP[r105]+436|0]>>>0){HEAP[HEAP[r105]+436|0]=HEAP[HEAP[r105]+432|0]}r224=HEAP[r105];L797:do{if((HEAP[HEAP[r105]+24|0]|0)!=0){r128=r224+448|0;HEAP[r123]=r128;L817:do{if((r128|0)!=0){while(1){r200=HEAP[r123];if((HEAP[r107]|0)==(HEAP[HEAP[r123]|0]+HEAP[HEAP[r123]+4|0]|0)){r229=r200;break L817}r162=HEAP[r200+8|0];HEAP[r123]=r162;if((r162|0)==0){r2=576;break L817}}}else{r2=576}}while(0);if(r2==576){r229=HEAP[r123]}do{if((r229|0)!=0){if((HEAP[HEAP[r123]+12|0]&8|0)!=0){break}if(0!=(HEAP[r109]|0)){break}if(!(HEAP[HEAP[r105]+24|0]>>>0>=HEAP[HEAP[r123]|0]>>>0)){break}if(HEAP[HEAP[r105]+24|0]>>>0>=(HEAP[HEAP[r123]|0]+HEAP[HEAP[r123]+4|0]|0)>>>0){break}r128=HEAP[r123]+4|0;HEAP[r128]=HEAP[r128]+HEAP[r108]|0;r128=HEAP[HEAP[r105]+24|0];r162=HEAP[r108]+HEAP[HEAP[r105]+12|0]|0;HEAP[r4]=HEAP[r105];HEAP[r5]=r128;HEAP[r6]=r162;if((HEAP[r5]+8&7|0)==0){r230=0}else{r230=8-(HEAP[r5]+8&7)&7}HEAP[r7]=r230;HEAP[r5]=HEAP[r5]+HEAP[r7]|0;HEAP[r6]=HEAP[r6]-HEAP[r7]|0;HEAP[HEAP[r4]+24|0]=HEAP[r5];HEAP[HEAP[r4]+12|0]=HEAP[r6];HEAP[HEAP[r5]+4|0]=HEAP[r6]|1;HEAP[HEAP[r5]+HEAP[r6]+4|0]=40;HEAP[HEAP[r4]+28|0]=HEAP[33248];break L797}}while(0);if(HEAP[r107]>>>0<HEAP[HEAP[r105]+16|0]>>>0){HEAP[HEAP[r105]+16|0]=HEAP[r107]}r162=HEAP[r105]+448|0;HEAP[r123]=r162;r128=HEAP[r123];L837:do{if((r162|0)!=0){r200=r128;while(1){r131=HEAP[r123];if((HEAP[r200|0]|0)==(HEAP[r107]+HEAP[r108]|0)){r231=r131;break L837}r169=HEAP[r131+8|0];HEAP[r123]=r169;r131=HEAP[r123];if((r169|0)!=0){r200=r131}else{r231=r131;break L837}}}else{r231=r128}}while(0);do{if((r231|0)!=0){if((HEAP[HEAP[r123]+12|0]&8|0)!=0){break}if(0!=(HEAP[r109]|0)){break}HEAP[r124]=HEAP[HEAP[r123]|0];HEAP[HEAP[r123]|0]=HEAP[r107];r128=HEAP[r123]+4|0;HEAP[r128]=HEAP[r128]+HEAP[r108]|0;r128=HEAP[r107];r162=HEAP[r124];r200=HEAP[r106];HEAP[r8]=HEAP[r105];HEAP[r9]=r128;HEAP[r10]=r162;HEAP[r11]=r200;if((HEAP[r9]+8&7|0)==0){r232=0}else{r232=8-(HEAP[r9]+8&7)&7}HEAP[r12]=HEAP[r9]+r232|0;if((HEAP[r10]+8&7|0)==0){r233=0}else{r233=8-(HEAP[r10]+8&7)&7}HEAP[r13]=HEAP[r10]+r233|0;HEAP[r14]=HEAP[r13]-HEAP[r12]|0;HEAP[r15]=HEAP[r12]+HEAP[r11]|0;HEAP[r16]=HEAP[r14]-HEAP[r11]|0;HEAP[HEAP[r12]+4|0]=HEAP[r11]|3;L852:do{if((HEAP[r13]|0)==(HEAP[HEAP[r8]+24|0]|0)){r200=HEAP[r8]+12|0;r162=HEAP[r200]+HEAP[r16]|0;HEAP[r200]=r162;HEAP[r17]=r162;HEAP[HEAP[r8]+24|0]=HEAP[r15];HEAP[HEAP[r15]+4|0]=HEAP[r17]|1}else{if((HEAP[r13]|0)==(HEAP[HEAP[r8]+20|0]|0)){r162=HEAP[r8]+8|0;r200=HEAP[r162]+HEAP[r16]|0;HEAP[r162]=r200;HEAP[r18]=r200;HEAP[HEAP[r8]+20|0]=HEAP[r15];HEAP[HEAP[r15]+4|0]=HEAP[r18]|1;HEAP[HEAP[r15]+HEAP[r18]|0]=HEAP[r18];break}if((HEAP[HEAP[r13]+4|0]&3|0)==1){HEAP[r19]=HEAP[HEAP[r13]+4|0]&-8;r200=HEAP[r13];do{if(HEAP[r19]>>>3>>>0<32){HEAP[r20]=HEAP[r200+8|0];HEAP[r21]=HEAP[HEAP[r13]+12|0];HEAP[r22]=HEAP[r19]>>>3;do{if((HEAP[r20]|0)==((HEAP[r22]<<3)+HEAP[r8]+40|0)){r234=1}else{if(!(HEAP[r20]>>>0>=HEAP[HEAP[r8]+16|0]>>>0)){r234=0;break}r234=(HEAP[HEAP[r20]+12|0]|0)==(HEAP[r13]|0)}}while(0);if((r234&1|0)==0){_abort()}if((HEAP[r21]|0)==(HEAP[r20]|0)){r162=HEAP[r8]|0;HEAP[r162]=HEAP[r162]&(1<<HEAP[r22]^-1);break}do{if((HEAP[r21]|0)==((HEAP[r22]<<3)+HEAP[r8]+40|0)){r235=1}else{if(!(HEAP[r21]>>>0>=HEAP[HEAP[r8]+16|0]>>>0)){r235=0;break}r235=(HEAP[HEAP[r21]+8|0]|0)==(HEAP[r13]|0)}}while(0);if((r235&1|0)!=0){HEAP[HEAP[r20]+12|0]=HEAP[r21];HEAP[HEAP[r21]+8|0]=HEAP[r20];break}else{_abort()}}else{HEAP[r23]=r200;HEAP[r24]=HEAP[HEAP[r23]+24|0];r162=HEAP[r23];L880:do{if((HEAP[HEAP[r23]+12|0]|0)!=(HEAP[r23]|0)){HEAP[r26]=HEAP[r162+8|0];HEAP[r25]=HEAP[HEAP[r23]+12|0];do{if(HEAP[r26]>>>0>=HEAP[HEAP[r8]+16|0]>>>0){if((HEAP[HEAP[r26]+12|0]|0)!=(HEAP[r23]|0)){r236=0;break}r236=(HEAP[HEAP[r25]+8|0]|0)==(HEAP[r23]|0)}else{r236=0}}while(0);if((r236&1|0)!=0){HEAP[HEAP[r26]+12|0]=HEAP[r25];HEAP[HEAP[r25]+8|0]=HEAP[r26];break}else{_abort()}}else{r128=r162+20|0;HEAP[r27]=r128;r131=HEAP[r128];HEAP[r25]=r131;do{if((r131|0)==0){r128=HEAP[r23]+16|0;HEAP[r27]=r128;r169=HEAP[r128];HEAP[r25]=r169;if((r169|0)!=0){break}else{break L880}}}while(0);while(1){r131=HEAP[r25]+20|0;HEAP[r28]=r131;if((HEAP[r131]|0)==0){r131=HEAP[r25]+16|0;HEAP[r28]=r131;if((HEAP[r131]|0)==0){break}}r131=HEAP[r28];HEAP[r27]=r131;HEAP[r25]=HEAP[r131]}if((HEAP[r27]>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r27]]=0;break}else{_abort()}}}while(0);if((HEAP[r24]|0)==0){break}HEAP[r29]=(HEAP[HEAP[r23]+28|0]<<2)+HEAP[r8]+304|0;do{if((HEAP[r23]|0)==(HEAP[HEAP[r29]]|0)){r162=HEAP[r25];HEAP[HEAP[r29]]=r162;if((r162|0)!=0){break}r162=HEAP[r8]+4|0;HEAP[r162]=HEAP[r162]&(1<<HEAP[HEAP[r23]+28|0]^-1)}else{if((HEAP[r24]>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)==0){_abort()}r162=HEAP[r25];r131=HEAP[r24]+16|0;if((HEAP[HEAP[r24]+16|0]|0)==(HEAP[r23]|0)){HEAP[r131|0]=r162;break}else{HEAP[r131+4|0]=r162;break}}}while(0);if((HEAP[r25]|0)==0){break}if((HEAP[r25]>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)==0){_abort()}HEAP[HEAP[r25]+24|0]=HEAP[r24];r162=HEAP[HEAP[r23]+16|0];HEAP[r30]=r162;do{if((r162|0)!=0){if((HEAP[r30]>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r25]+16|0]=HEAP[r30];HEAP[HEAP[r30]+24|0]=HEAP[r25];break}else{_abort()}}}while(0);r162=HEAP[HEAP[r23]+20|0];HEAP[r31]=r162;if((r162|0)==0){break}if((HEAP[r31]>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r25]+20|0]=HEAP[r31];HEAP[HEAP[r31]+24|0]=HEAP[r25];break}else{_abort()}}}while(0);HEAP[r13]=HEAP[r13]+HEAP[r19]|0;HEAP[r16]=HEAP[r16]+HEAP[r19]|0}r200=HEAP[r13]+4|0;HEAP[r200]=HEAP[r200]&-2;HEAP[HEAP[r15]+4|0]=HEAP[r16]|1;HEAP[HEAP[r15]+HEAP[r16]|0]=HEAP[r16];if(HEAP[r16]>>>3>>>0<32){HEAP[r32]=HEAP[r16]>>>3;HEAP[r33]=(HEAP[r32]<<3)+HEAP[r8]+40|0;HEAP[r34]=HEAP[r33];do{if((1<<HEAP[r32]&HEAP[HEAP[r8]|0]|0)!=0){if((HEAP[HEAP[r33]+8|0]>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)!=0){HEAP[r34]=HEAP[HEAP[r33]+8|0];break}else{_abort()}}else{r200=HEAP[r8]|0;HEAP[r200]=HEAP[r200]|1<<HEAP[r32]}}while(0);HEAP[HEAP[r33]+8|0]=HEAP[r15];HEAP[HEAP[r34]+12|0]=HEAP[r15];HEAP[HEAP[r15]+8|0]=HEAP[r34];HEAP[HEAP[r15]+12|0]=HEAP[r33];break}HEAP[r35]=HEAP[r15];HEAP[r38]=HEAP[r16]>>>8;do{if((HEAP[r38]|0)==0){HEAP[r37]=0}else{if(HEAP[r38]>>>0>65535){HEAP[r37]=31;break}else{HEAP[r39]=HEAP[r38];HEAP[r40]=(HEAP[r39]-256|0)>>>16&8;r200=HEAP[r39]<<HEAP[r40];HEAP[r39]=r200;HEAP[r41]=(r200-4096|0)>>>16&4;HEAP[r40]=HEAP[r40]+HEAP[r41]|0;r200=HEAP[r39]<<HEAP[r41];HEAP[r39]=r200;r162=(r200-16384|0)>>>16&2;HEAP[r41]=r162;HEAP[r40]=r162+HEAP[r40]|0;r162=-HEAP[r40]+14|0;r200=HEAP[r39]<<HEAP[r41];HEAP[r39]=r200;HEAP[r41]=r162+(r200>>>15)|0;HEAP[r37]=(HEAP[r41]<<1)+(HEAP[r16]>>>((HEAP[r41]+7|0)>>>0)&1)|0;break}}}while(0);HEAP[r36]=(HEAP[r37]<<2)+HEAP[r8]+304|0;HEAP[HEAP[r35]+28|0]=HEAP[r37];HEAP[HEAP[r35]+20|0]=0;HEAP[HEAP[r35]+16|0]=0;if((1<<HEAP[r37]&HEAP[HEAP[r8]+4|0]|0)==0){r200=HEAP[r8]+4|0;HEAP[r200]=HEAP[r200]|1<<HEAP[r37];HEAP[HEAP[r36]]=HEAP[r35];HEAP[HEAP[r35]+24|0]=HEAP[r36];r200=HEAP[r35];HEAP[HEAP[r35]+12|0]=r200;HEAP[HEAP[r35]+8|0]=r200;break}HEAP[r42]=HEAP[HEAP[r36]];if((HEAP[r37]|0)==31){r237=0}else{r237=-(HEAP[r37]>>>1)+25|0}HEAP[r43]=HEAP[r16]<<r237;L953:do{if((HEAP[HEAP[r42]+4|0]&-8|0)!=(HEAP[r16]|0)){while(1){HEAP[r44]=((HEAP[r43]>>>31&1)<<2)+HEAP[r42]+16|0;HEAP[r43]=HEAP[r43]<<1;r238=HEAP[r44];if((HEAP[HEAP[r44]]|0)==0){break}HEAP[r42]=HEAP[r238];if((HEAP[HEAP[r42]+4|0]&-8|0)==(HEAP[r16]|0)){break L953}}if((r238>>>0>=HEAP[HEAP[r8]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r44]]=HEAP[r35];HEAP[HEAP[r35]+24|0]=HEAP[r42];r200=HEAP[r35];HEAP[HEAP[r35]+12|0]=r200;HEAP[HEAP[r35]+8|0]=r200;break L852}else{_abort()}}}while(0);HEAP[r45]=HEAP[HEAP[r42]+8|0];if(HEAP[r42]>>>0>=HEAP[HEAP[r8]+16|0]>>>0){r239=HEAP[r45]>>>0>=HEAP[HEAP[r8]+16|0]>>>0}else{r239=0}if((r239&1|0)!=0){r200=HEAP[r35];HEAP[HEAP[r45]+12|0]=r200;HEAP[HEAP[r42]+8|0]=r200;HEAP[HEAP[r35]+8|0]=HEAP[r45];HEAP[HEAP[r35]+12|0]=HEAP[r42];HEAP[HEAP[r35]+24|0]=0;break}else{_abort()}}}while(0);HEAP[r104]=HEAP[r12]+8|0;break L725}}while(0);r200=HEAP[r107];r162=HEAP[r108];r131=HEAP[r109];HEAP[r65]=HEAP[r105];HEAP[r66]=r200;HEAP[r67]=r162;HEAP[r68]=r131;HEAP[r69]=HEAP[HEAP[r65]+24|0];r131=HEAP[r69];HEAP[r62]=HEAP[r65];HEAP[r63]=r131;HEAP[r64]=HEAP[r62]+448|0;while(1){if(HEAP[r63]>>>0>=HEAP[HEAP[r64]|0]>>>0){if(HEAP[r63]>>>0<(HEAP[HEAP[r64]|0]+HEAP[HEAP[r64]+4|0]|0)>>>0){r2=685;break}}r131=HEAP[HEAP[r64]+8|0];HEAP[r64]=r131;if((r131|0)==0){r2=687;break}}if(r2==685){HEAP[r61]=HEAP[r64]}else if(r2==687){HEAP[r61]=0}HEAP[r70]=HEAP[r61];HEAP[r71]=HEAP[HEAP[r70]|0]+HEAP[HEAP[r70]+4|0]|0;HEAP[r72]=24;HEAP[r73]=HEAP[r71]+ -(HEAP[r72]+23|0)|0;if((HEAP[r73]+8&7|0)==0){r240=0}else{r240=8-(HEAP[r73]+8&7)&7}HEAP[r74]=r240;HEAP[r75]=HEAP[r73]+HEAP[r74]|0;HEAP[r76]=HEAP[r75]>>>0<(HEAP[r69]+16|0)>>>0?HEAP[r69]:HEAP[r75];HEAP[r77]=HEAP[r76];HEAP[r78]=HEAP[r77]+8|0;HEAP[r79]=HEAP[r77]+HEAP[r72]|0;HEAP[r80]=HEAP[r79];HEAP[r81]=0;r131=HEAP[r66];r162=HEAP[r67]-40|0;HEAP[r57]=HEAP[r65];HEAP[r58]=r131;HEAP[r59]=r162;if((HEAP[r58]+8&7|0)==0){r241=0}else{r241=8-(HEAP[r58]+8&7)&7}HEAP[r60]=r241;HEAP[r58]=HEAP[r58]+HEAP[r60]|0;HEAP[r59]=HEAP[r59]-HEAP[r60]|0;HEAP[HEAP[r57]+24|0]=HEAP[r58];HEAP[HEAP[r57]+12|0]=HEAP[r59];HEAP[HEAP[r58]+4|0]=HEAP[r59]|1;HEAP[HEAP[r58]+HEAP[r59]+4|0]=40;HEAP[HEAP[r57]+28|0]=HEAP[33248];HEAP[HEAP[r77]+4|0]=HEAP[r72]|3;r162=HEAP[r78];r131=HEAP[r65]+448|0;for(r200=r131,r169=r162,r128=r200+16;r200<r128;r200++,r169++){HEAP[r169]=HEAP[r200]}HEAP[HEAP[r65]+448|0]=HEAP[r66];HEAP[HEAP[r65]+452|0]=HEAP[r67];HEAP[HEAP[r65]+460|0]=HEAP[r68];HEAP[HEAP[r65]+456|0]=HEAP[r78];HEAP[r82]=HEAP[r80]+4|0;HEAP[HEAP[r80]+4|0]=7;HEAP[r81]=HEAP[r81]+1|0;L985:do{if((HEAP[r82]+4|0)>>>0<HEAP[r71]>>>0){while(1){HEAP[r80]=HEAP[r82];HEAP[r82]=HEAP[r80]+4|0;HEAP[HEAP[r80]+4|0]=7;HEAP[r81]=HEAP[r81]+1|0;if((HEAP[r82]+4|0)>>>0>=HEAP[r71]>>>0){break L985}}}}while(0);L989:do{if((HEAP[r76]|0)!=(HEAP[r69]|0)){HEAP[r83]=HEAP[r69];HEAP[r84]=HEAP[r76]-HEAP[r69]|0;HEAP[r85]=HEAP[r83]+HEAP[r84]|0;r162=HEAP[r85]+4|0;HEAP[r162]=HEAP[r162]&-2;HEAP[HEAP[r83]+4|0]=HEAP[r84]|1;HEAP[HEAP[r83]+HEAP[r84]|0]=HEAP[r84];if(HEAP[r84]>>>3>>>0<32){HEAP[r86]=HEAP[r84]>>>3;HEAP[r87]=(HEAP[r86]<<3)+HEAP[r65]+40|0;HEAP[r88]=HEAP[r87];do{if((1<<HEAP[r86]&HEAP[HEAP[r65]|0]|0)!=0){if((HEAP[HEAP[r87]+8|0]>>>0>=HEAP[HEAP[r65]+16|0]>>>0&1|0)!=0){HEAP[r88]=HEAP[HEAP[r87]+8|0];break}else{_abort()}}else{r162=HEAP[r65]|0;HEAP[r162]=HEAP[r162]|1<<HEAP[r86]}}while(0);HEAP[HEAP[r87]+8|0]=HEAP[r83];HEAP[HEAP[r88]+12|0]=HEAP[r83];HEAP[HEAP[r83]+8|0]=HEAP[r88];HEAP[HEAP[r83]+12|0]=HEAP[r87];break}HEAP[r89]=HEAP[r83];HEAP[r92]=HEAP[r84]>>>8;do{if((HEAP[r92]|0)==0){HEAP[r91]=0}else{if(HEAP[r92]>>>0>65535){HEAP[r91]=31;break}else{HEAP[r93]=HEAP[r92];HEAP[r94]=(HEAP[r93]-256|0)>>>16&8;r162=HEAP[r93]<<HEAP[r94];HEAP[r93]=r162;HEAP[r95]=(r162-4096|0)>>>16&4;HEAP[r94]=HEAP[r94]+HEAP[r95]|0;r162=HEAP[r93]<<HEAP[r95];HEAP[r93]=r162;r131=(r162-16384|0)>>>16&2;HEAP[r95]=r131;HEAP[r94]=r131+HEAP[r94]|0;r131=-HEAP[r94]+14|0;r162=HEAP[r93]<<HEAP[r95];HEAP[r93]=r162;HEAP[r95]=r131+(r162>>>15)|0;HEAP[r91]=(HEAP[r95]<<1)+(HEAP[r84]>>>((HEAP[r95]+7|0)>>>0)&1)|0;break}}}while(0);HEAP[r90]=(HEAP[r91]<<2)+HEAP[r65]+304|0;HEAP[HEAP[r89]+28|0]=HEAP[r91];HEAP[HEAP[r89]+20|0]=0;HEAP[HEAP[r89]+16|0]=0;if((1<<HEAP[r91]&HEAP[HEAP[r65]+4|0]|0)==0){r162=HEAP[r65]+4|0;HEAP[r162]=HEAP[r162]|1<<HEAP[r91];HEAP[HEAP[r90]]=HEAP[r89];HEAP[HEAP[r89]+24|0]=HEAP[r90];r162=HEAP[r89];HEAP[HEAP[r89]+12|0]=r162;HEAP[HEAP[r89]+8|0]=r162;break}HEAP[r96]=HEAP[HEAP[r90]];if((HEAP[r91]|0)==31){r242=0}else{r242=-(HEAP[r91]>>>1)+25|0}HEAP[r97]=HEAP[r84]<<r242;L1014:do{if((HEAP[HEAP[r96]+4|0]&-8|0)!=(HEAP[r84]|0)){while(1){HEAP[r98]=((HEAP[r97]>>>31&1)<<2)+HEAP[r96]+16|0;HEAP[r97]=HEAP[r97]<<1;r243=HEAP[r98];if((HEAP[HEAP[r98]]|0)==0){break}HEAP[r96]=HEAP[r243];if((HEAP[HEAP[r96]+4|0]&-8|0)==(HEAP[r84]|0)){break L1014}}if((r243>>>0>=HEAP[HEAP[r65]+16|0]>>>0&1|0)!=0){HEAP[HEAP[r98]]=HEAP[r89];HEAP[HEAP[r89]+24|0]=HEAP[r96];r162=HEAP[r89];HEAP[HEAP[r89]+12|0]=r162;HEAP[HEAP[r89]+8|0]=r162;break L989}else{_abort()}}}while(0);HEAP[r99]=HEAP[HEAP[r96]+8|0];if(HEAP[r96]>>>0>=HEAP[HEAP[r65]+16|0]>>>0){r244=HEAP[r99]>>>0>=HEAP[HEAP[r65]+16|0]>>>0}else{r244=0}if((r244&1|0)!=0){r162=HEAP[r89];HEAP[HEAP[r99]+12|0]=r162;HEAP[HEAP[r96]+8|0]=r162;HEAP[HEAP[r89]+8|0]=HEAP[r99];HEAP[HEAP[r89]+12|0]=HEAP[r96];HEAP[HEAP[r89]+24|0]=0;break}else{_abort()}}}while(0)}else{do{if((HEAP[r224+16|0]|0)==0){r2=565}else{if(HEAP[r107]>>>0<HEAP[HEAP[r105]+16|0]>>>0){r2=565;break}else{break}}}while(0);if(r2==565){HEAP[HEAP[r105]+16|0]=HEAP[r107]}HEAP[HEAP[r105]+448|0]=HEAP[r107];HEAP[HEAP[r105]+452|0]=HEAP[r108];HEAP[HEAP[r105]+460|0]=HEAP[r109];HEAP[HEAP[r105]+36|0]=HEAP[33232];HEAP[HEAP[r105]+32|0]=-1;HEAP[r54]=HEAP[r105];HEAP[r55]=0;while(1){HEAP[r56]=(HEAP[r55]<<3)+HEAP[r54]+40|0;r162=HEAP[r56];HEAP[HEAP[r56]+12|0]=r162;HEAP[HEAP[r56]+8|0]=r162;r162=HEAP[r55]+1|0;HEAP[r55]=r162;if(r162>>>0>=32){break}}r162=HEAP[r105];if((HEAP[r105]|0)==35176){r131=HEAP[r107];r200=HEAP[r108]-40|0;HEAP[r50]=r162;HEAP[r51]=r131;HEAP[r52]=r200;if((HEAP[r51]+8&7|0)==0){r245=0}else{r245=8-(HEAP[r51]+8&7)&7}HEAP[r53]=r245;HEAP[r51]=HEAP[r51]+HEAP[r53]|0;HEAP[r52]=HEAP[r52]-HEAP[r53]|0;HEAP[HEAP[r50]+24|0]=HEAP[r51];HEAP[HEAP[r50]+12|0]=HEAP[r52];HEAP[HEAP[r51]+4|0]=HEAP[r52]|1;HEAP[HEAP[r51]+HEAP[r52]+4|0]=40;HEAP[HEAP[r50]+28|0]=HEAP[33248];break}else{HEAP[r122]=r162-8+(HEAP[HEAP[r105]-8+4|0]&-8)|0;r162=HEAP[r122];r200=HEAP[r107]+HEAP[r108]-40+ -HEAP[r122]|0;HEAP[r46]=HEAP[r105];HEAP[r47]=r162;HEAP[r48]=r200;if((HEAP[r47]+8&7|0)==0){r246=0}else{r246=8-(HEAP[r47]+8&7)&7}HEAP[r49]=r246;HEAP[r47]=HEAP[r47]+HEAP[r49]|0;HEAP[r48]=HEAP[r48]-HEAP[r49]|0;HEAP[HEAP[r46]+24|0]=HEAP[r47];HEAP[HEAP[r46]+12|0]=HEAP[r48];HEAP[HEAP[r47]+4|0]=HEAP[r48]|1;HEAP[HEAP[r47]+HEAP[r48]+4|0]=40;HEAP[HEAP[r46]+28|0]=HEAP[33248];break}}}while(0);if(HEAP[r106]>>>0>=HEAP[HEAP[r105]+12|0]>>>0){break}r224=HEAP[r105]+12|0;r200=HEAP[r224]-HEAP[r106]|0;HEAP[r224]=r200;HEAP[r125]=r200;HEAP[r126]=HEAP[HEAP[r105]+24|0];r200=HEAP[r126]+HEAP[r106]|0;HEAP[HEAP[r105]+24|0]=r200;HEAP[r127]=r200;HEAP[HEAP[r127]+4|0]=HEAP[r125]|1;HEAP[HEAP[r126]+4|0]=HEAP[r106]|3;HEAP[r104]=HEAP[r126]+8|0;break L725}}while(0);r200=___errno_location();HEAP[r200]=12;HEAP[r104]=0}}while(0);r207=HEAP[r104];r208=r207;STACKTOP=r3;return r208}function _free(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+100|0;r4=r3;r5=r3+4;r6=r3+8;r7=r3+12;r8=r3+16;r9=r3+20;r10=r3+24;r11=r3+28;r12=r3+32;r13=r3+36;r14=r3+40;r15=r3+44;r16=r3+48;r17=r3+52;r18=r3+56;r19=r3+60;r20=r3+64;r21=r3+68;r22=r3+72;r23=r3+76;r24=r3+80;r25=r3+84;r26=r3+88;r27=r3+92;r28=r3+96;r29=r1;if((r29|0)==0){STACKTOP=r3;return}r1=r29-8|0;if(r1>>>0>=HEAP[35192]>>>0){r30=(HEAP[r1+4|0]&3|0)!=1}else{r30=0}if((r30&1|0)==0){_abort()}r30=HEAP[r1+4|0]&-8;r29=r1+r30|0;do{if((HEAP[r1+4|0]&1|0)==0){r31=HEAP[r1|0];if((HEAP[r1+4|0]&3|0)==0){r30=r30+(r31+16)|0;STACKTOP=r3;return}r32=r1+ -r31|0;r30=r30+r31|0;r1=r32;if((r32>>>0>=HEAP[35192]>>>0&1|0)==0){_abort()}if((r1|0)==(HEAP[35196]|0)){if((HEAP[r29+4|0]&3|0)!=3){break}HEAP[35184]=r30;r32=r29+4|0;HEAP[r32]=HEAP[r32]&-2;HEAP[r1+4|0]=r30|1;HEAP[r1+r30|0]=r30;STACKTOP=r3;return}r32=r1;if(r31>>>3>>>0<32){r33=HEAP[r32+8|0];r34=HEAP[r1+12|0];r35=r31>>>3;do{if((r33|0)==((r35<<3)+35216|0)){r36=1}else{if(!(r33>>>0>=HEAP[35192]>>>0)){r36=0;break}r36=(HEAP[r33+12|0]|0)==(r1|0)}}while(0);if((r36&1|0)==0){_abort()}if((r34|0)==(r33|0)){HEAP[35176]=HEAP[35176]&(1<<r35^-1);break}do{if((r34|0)==((r35<<3)+35216|0)){r37=1}else{if(!(r34>>>0>=HEAP[35192]>>>0)){r37=0;break}r37=(HEAP[r34+8|0]|0)==(r1|0)}}while(0);if((r37&1|0)!=0){HEAP[r33+12|0]=r34;HEAP[r34+8|0]=r33;break}else{_abort()}}r35=r32;r31=HEAP[r35+24|0];r38=r35;L1079:do{if((HEAP[r35+12|0]|0)!=(r35|0)){r39=HEAP[r38+8|0];r40=HEAP[r35+12|0];do{if(r39>>>0>=HEAP[35192]>>>0){if((HEAP[r39+12|0]|0)!=(r35|0)){r41=0;break}r41=(HEAP[r40+8|0]|0)==(r35|0)}else{r41=0}}while(0);if((r41&1|0)!=0){HEAP[r39+12|0]=r40;HEAP[r40+8|0]=r39;break}else{_abort()}}else{r42=r38+20|0;r43=r42;r44=HEAP[r42];r40=r44;do{if((r44|0)==0){r42=r35+16|0;r43=r42;r45=HEAP[r42];r40=r45;if((r45|0)!=0){break}else{break L1079}}}while(0);while(1){r44=r40+20|0;r39=r44;if((HEAP[r44]|0)==0){r44=r40+16|0;r39=r44;if((HEAP[r44]|0)==0){break}}r44=r39;r43=r44;r40=HEAP[r44]}if((r43>>>0>=HEAP[35192]>>>0&1|0)!=0){HEAP[r43]=0;break}else{_abort()}}}while(0);if((r31|0)==0){break}r38=(HEAP[r35+28|0]<<2)+35480|0;do{if((r35|0)==(HEAP[r38]|0)){r32=r40;HEAP[r38]=r32;if((r32|0)!=0){break}HEAP[35180]=HEAP[35180]&(1<<HEAP[r35+28|0]^-1)}else{if((r31>>>0>=HEAP[35192]>>>0&1|0)==0){_abort()}r32=r40;r33=r31+16|0;if((HEAP[r31+16|0]|0)==(r35|0)){HEAP[r33|0]=r32;break}else{HEAP[r33+4|0]=r32;break}}}while(0);if((r40|0)==0){break}if((r40>>>0>=HEAP[35192]>>>0&1|0)==0){_abort()}HEAP[r40+24|0]=r31;r38=HEAP[r35+16|0];r32=r38;do{if((r38|0)!=0){if((r32>>>0>=HEAP[35192]>>>0&1|0)!=0){HEAP[r40+16|0]=r32;HEAP[r32+24|0]=r40;break}else{_abort()}}}while(0);r32=HEAP[r35+20|0];r38=r32;if((r32|0)==0){break}if((r38>>>0>=HEAP[35192]>>>0&1|0)!=0){HEAP[r40+20|0]=r38;HEAP[r38+24|0]=r40;break}else{_abort()}}}while(0);if(r1>>>0<r29>>>0){r46=(HEAP[r29+4|0]&1|0)!=0}else{r46=0}if((r46&1|0)==0){_abort()}r46=r29;do{if((HEAP[r29+4|0]&2|0)!=0){r40=r46+4|0;HEAP[r40]=HEAP[r40]&-2;HEAP[r1+4|0]=r30|1;HEAP[r1+r30|0]=r30}else{if((r46|0)==(HEAP[35200]|0)){r40=HEAP[35188]+r30|0;HEAP[35188]=r40;r41=r40;HEAP[35200]=r1;HEAP[r1+4|0]=r41|1;if((r1|0)==(HEAP[35196]|0)){HEAP[35196]=0;HEAP[35184]=0}if(r41>>>0<=HEAP[35204]>>>0){STACKTOP=r3;return}HEAP[r20]=35176;HEAP[r21]=0;HEAP[r22]=0;do{if((HEAP[33232]|0)!=0){r2=809}else{_init_mparams();if(HEAP[r21]>>>0<4294967232){r2=809;break}else{break}}}while(0);do{if(r2==809){if((HEAP[HEAP[r20]+24|0]|0)==0){break}HEAP[r21]=HEAP[r21]+40|0;do{if(HEAP[HEAP[r20]+12|0]>>>0>HEAP[r21]>>>0){HEAP[r23]=HEAP[33240];r35=Math.imul(Math.floor(((HEAP[HEAP[r20]+12|0]-1+ -HEAP[r21]+HEAP[r23]|0)>>>0)/(HEAP[r23]>>>0))-1|0,HEAP[r23]);HEAP[r24]=r35;r35=HEAP[HEAP[r20]+24|0];HEAP[r17]=HEAP[r20];HEAP[r18]=r35;HEAP[r19]=HEAP[r17]+448|0;while(1){if(HEAP[r18]>>>0>=HEAP[HEAP[r19]|0]>>>0){if(HEAP[r18]>>>0<(HEAP[HEAP[r19]|0]+HEAP[HEAP[r19]+4|0]|0)>>>0){r2=814;break}}r35=HEAP[HEAP[r19]+8|0];HEAP[r19]=r35;if((r35|0)==0){r2=816;break}}if(r2==814){HEAP[r16]=HEAP[r19]}else if(r2==816){HEAP[r16]=0}HEAP[r25]=HEAP[r16];do{if((HEAP[HEAP[r25]+12|0]&8|0)!=0){r2=824}else{if(HEAP[r24]>>>0>=2147483647){HEAP[r24]=-2147483648-HEAP[r23]|0}r35=_sbrk(0);HEAP[r26]=r35;if((HEAP[r26]|0)!=(HEAP[HEAP[r25]|0]+HEAP[HEAP[r25]+4|0]|0)){r2=824;break}r35=_sbrk(-HEAP[r24]|0);HEAP[r27]=r35;r35=_sbrk(0);HEAP[r28]=r35;if((HEAP[r27]|0)==-1){r2=824;break}if(HEAP[r28]>>>0>=HEAP[r26]>>>0){r2=824;break}r35=HEAP[r26]-HEAP[r28]|0;HEAP[r22]=r35;r47=r35;break}}while(0);if(r2==824){r47=HEAP[r22]}if((r47|0)==0){break}r35=HEAP[r25]+4|0;HEAP[r35]=HEAP[r35]-HEAP[r22]|0;r35=HEAP[r20]+432|0;HEAP[r35]=HEAP[r35]-HEAP[r22]|0;r35=HEAP[HEAP[r20]+24|0];r41=HEAP[HEAP[r20]+12|0]-HEAP[r22]|0;HEAP[r12]=HEAP[r20];HEAP[r13]=r35;HEAP[r14]=r41;if((HEAP[r13]+8&7|0)==0){r48=0}else{r48=8-(HEAP[r13]+8&7)&7}HEAP[r15]=r48;HEAP[r13]=HEAP[r13]+HEAP[r15]|0;HEAP[r14]=HEAP[r14]-HEAP[r15]|0;HEAP[HEAP[r12]+24|0]=HEAP[r13];HEAP[HEAP[r12]+12|0]=HEAP[r14];HEAP[HEAP[r13]+4|0]=HEAP[r14]|1;HEAP[HEAP[r13]+HEAP[r14]+4|0]=40;HEAP[HEAP[r12]+28|0]=HEAP[33248]}}while(0);if((HEAP[r22]|0)!=0){break}if(HEAP[HEAP[r20]+12|0]>>>0<=HEAP[HEAP[r20]+28|0]>>>0){break}HEAP[HEAP[r20]+28|0]=-1}}while(0);STACKTOP=r3;return}if((r29|0)==(HEAP[35196]|0)){r43=HEAP[35184]+r30|0;HEAP[35184]=r43;r41=r43;HEAP[35196]=r1;HEAP[r1+4|0]=r41|1;HEAP[r1+r41|0]=r41;STACKTOP=r3;return}r41=HEAP[r29+4|0]&-8;r30=r30+r41|0;r43=r29;do{if(r41>>>3>>>0<32){r35=HEAP[r43+8|0];r40=HEAP[r29+12|0];r37=r41>>>3;do{if((r35|0)==((r37<<3)+35216|0)){r49=1}else{if(!(r35>>>0>=HEAP[35192]>>>0)){r49=0;break}r49=(HEAP[r35+12|0]|0)==(r29|0)}}while(0);if((r49&1|0)==0){_abort()}if((r40|0)==(r35|0)){HEAP[35176]=HEAP[35176]&(1<<r37^-1);break}do{if((r40|0)==((r37<<3)+35216|0)){r50=1}else{if(!(r40>>>0>=HEAP[35192]>>>0)){r50=0;break}r50=(HEAP[r40+8|0]|0)==(r29|0)}}while(0);if((r50&1|0)!=0){HEAP[r35+12|0]=r40;HEAP[r40+8|0]=r35;break}else{_abort()}}else{r37=r43;r36=HEAP[r37+24|0];r38=r37;L1206:do{if((HEAP[r37+12|0]|0)!=(r37|0)){r32=HEAP[r38+8|0];r51=HEAP[r37+12|0];do{if(r32>>>0>=HEAP[35192]>>>0){if((HEAP[r32+12|0]|0)!=(r37|0)){r52=0;break}r52=(HEAP[r51+8|0]|0)==(r37|0)}else{r52=0}}while(0);if((r52&1|0)!=0){HEAP[r32+12|0]=r51;HEAP[r51+8|0]=r32;break}else{_abort()}}else{r31=r38+20|0;r33=r31;r34=HEAP[r31];r51=r34;do{if((r34|0)==0){r31=r37+16|0;r33=r31;r44=HEAP[r31];r51=r44;if((r44|0)!=0){break}else{break L1206}}}while(0);while(1){r34=r51+20|0;r32=r34;if((HEAP[r34]|0)==0){r34=r51+16|0;r32=r34;if((HEAP[r34]|0)==0){break}}r34=r32;r33=r34;r51=HEAP[r34]}if((r33>>>0>=HEAP[35192]>>>0&1|0)!=0){HEAP[r33]=0;break}else{_abort()}}}while(0);if((r36|0)==0){break}r38=(HEAP[r37+28|0]<<2)+35480|0;do{if((r37|0)==(HEAP[r38]|0)){r35=r51;HEAP[r38]=r35;if((r35|0)!=0){break}HEAP[35180]=HEAP[35180]&(1<<HEAP[r37+28|0]^-1)}else{if((r36>>>0>=HEAP[35192]>>>0&1|0)==0){_abort()}r35=r51;r40=r36+16|0;if((HEAP[r36+16|0]|0)==(r37|0)){HEAP[r40|0]=r35;break}else{HEAP[r40+4|0]=r35;break}}}while(0);if((r51|0)==0){break}if((r51>>>0>=HEAP[35192]>>>0&1|0)==0){_abort()}HEAP[r51+24|0]=r36;r38=HEAP[r37+16|0];r35=r38;do{if((r38|0)!=0){if((r35>>>0>=HEAP[35192]>>>0&1|0)!=0){HEAP[r51+16|0]=r35;HEAP[r35+24|0]=r51;break}else{_abort()}}}while(0);r35=HEAP[r37+20|0];r38=r35;if((r35|0)==0){break}if((r38>>>0>=HEAP[35192]>>>0&1|0)!=0){HEAP[r51+20|0]=r38;HEAP[r38+24|0]=r51;break}else{_abort()}}}while(0);HEAP[r1+4|0]=r30|1;HEAP[r1+r30|0]=r30;if((r1|0)!=(HEAP[35196]|0)){break}HEAP[35184]=r30;STACKTOP=r3;return}}while(0);if(r30>>>3>>>0<32){r51=r30>>>3;r52=(r51<<3)+35216|0;r50=r52;do{if((1<<r51&HEAP[35176]|0)!=0){if((HEAP[r52+8|0]>>>0>=HEAP[35192]>>>0&1|0)!=0){r50=HEAP[r52+8|0];break}else{_abort()}}else{HEAP[35176]=HEAP[35176]|1<<r51}}while(0);HEAP[r52+8|0]=r1;HEAP[r50+12|0]=r1;HEAP[r1+8|0]=r50;HEAP[r1+12|0]=r52;STACKTOP=r3;return}r52=r1;r1=r30>>>8;do{if((r1|0)==0){r53=0}else{if(r1>>>0>65535){r53=31;break}else{r50=r1;r51=(r50-256|0)>>>16&8;r29=r50<<r51;r50=r29;r49=(r29-4096|0)>>>16&4;r51=r51+r49|0;r29=r50<<r49;r50=r29;r20=(r29-16384|0)>>>16&2;r49=r20;r51=r20+r51|0;r20=r50<<r49;r50=r20;r49=-r51+(r20>>>15)+14|0;r53=(r49<<1)+(r30>>>((r49+7|0)>>>0)&1)|0;break}}}while(0);r1=(r53<<2)+35480|0;HEAP[r52+28|0]=r53;HEAP[r52+20|0]=0;HEAP[r52+16|0]=0;L1276:do{if((1<<r53&HEAP[35180]|0)!=0){r49=HEAP[r1];if((r53|0)==31){r54=0}else{r54=-(r53>>>1)+25|0}r20=r30<<r54;L1282:do{if((HEAP[r49+4|0]&-8|0)!=(r30|0)){while(1){r55=((r20>>>31&1)<<2)+r49+16|0;r20=r20<<1;r56=r55;if((HEAP[r55]|0)==0){break}r49=HEAP[r56];if((HEAP[r49+4|0]&-8|0)==(r30|0)){break L1282}}if((r56>>>0>=HEAP[35192]>>>0&1|0)!=0){HEAP[r55]=r52;HEAP[r52+24|0]=r49;r37=r52;HEAP[r52+12|0]=r37;HEAP[r52+8|0]=r37;break L1276}else{_abort()}}}while(0);r20=HEAP[r49+8|0];if(r49>>>0>=HEAP[35192]>>>0){r57=r20>>>0>=HEAP[35192]>>>0}else{r57=0}if((r57&1|0)!=0){r37=r52;HEAP[r20+12|0]=r37;HEAP[r49+8|0]=r37;HEAP[r52+8|0]=r20;HEAP[r52+12|0]=r49;HEAP[r52+24|0]=0;break}else{_abort()}}else{HEAP[35180]=HEAP[35180]|1<<r53;HEAP[r1]=r52;HEAP[r52+24|0]=r1;r20=r52;HEAP[r52+12|0]=r20;HEAP[r52+8|0]=r20}}while(0);r52=HEAP[35208]-1|0;HEAP[35208]=r52;if((r52|0)!=0){STACKTOP=r3;return}HEAP[r4]=35176;HEAP[r5]=0;HEAP[r6]=0;HEAP[r7]=HEAP[r4]+448|0;r5=HEAP[HEAP[r7]+8|0];HEAP[r8]=r5;L1301:do{if((r5|0)!=0){while(1){HEAP[r9]=HEAP[HEAP[r8]|0];HEAP[r10]=HEAP[HEAP[r8]+4|0];r52=HEAP[HEAP[r8]+8|0];HEAP[r11]=r52;HEAP[r6]=HEAP[r6]+1|0;HEAP[r7]=HEAP[r8];HEAP[r8]=r52;if((r52|0)==0){break L1301}}}}while(0);HEAP[HEAP[r4]+32|0]=-1;STACKTOP=r3;return}function _init_mparams(){var r1,r2;if((HEAP[33232]|0)!=0){return}r1=_sysconf(8);r2=r1;if((r2-1&r2|0)!=0){_abort()}if((r1-1&r1|0)!=0){_abort()}HEAP[33240]=r2;HEAP[33236]=r1;HEAP[33244]=-1;HEAP[33248]=2097152;HEAP[33252]=0;HEAP[35620]=HEAP[33252];r1=_time(0)^1431655765;r1=r1|8;r1=r1&-8;HEAP[33232]=r1;return}function _dispose_chunk(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28;r4=r1;r1=r2;r2=r3;r3=r1+r2|0;do{if((HEAP[r1+4|0]&1|0)==0){r5=HEAP[r1|0];if((HEAP[r1+4|0]&3|0)==0){r2=r2+(r5+16)|0;return}r6=r1+ -r5|0;r2=r2+r5|0;r1=r6;if((r6>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}if((r1|0)==(HEAP[r4+20|0]|0)){if((HEAP[r3+4|0]&3|0)!=3){break}HEAP[r4+8|0]=r2;r6=r3+4|0;HEAP[r6]=HEAP[r6]&-2;HEAP[r1+4|0]=r2|1;HEAP[r1+r2|0]=r2;return}r6=r1;if(r5>>>3>>>0<32){r7=HEAP[r6+8|0];r8=HEAP[r1+12|0];r9=r5>>>3;do{if((r7|0)==((r9<<3)+r4+40|0)){r10=1}else{if(!(r7>>>0>=HEAP[r4+16|0]>>>0)){r10=0;break}r10=(HEAP[r7+12|0]|0)==(r1|0)}}while(0);if((r10&1|0)==0){_abort()}if((r8|0)==(r7|0)){r5=r4|0;HEAP[r5]=HEAP[r5]&(1<<r9^-1);break}do{if((r8|0)==((r9<<3)+r4+40|0)){r11=1}else{if(!(r8>>>0>=HEAP[r4+16|0]>>>0)){r11=0;break}r11=(HEAP[r8+8|0]|0)==(r1|0)}}while(0);if((r11&1|0)!=0){HEAP[r7+12|0]=r8;HEAP[r8+8|0]=r7;break}else{_abort()}}r9=r6;r5=HEAP[r9+24|0];r12=r9;L1352:do{if((HEAP[r9+12|0]|0)!=(r9|0)){r13=HEAP[r12+8|0];r14=HEAP[r9+12|0];do{if(r13>>>0>=HEAP[r4+16|0]>>>0){if((HEAP[r13+12|0]|0)!=(r9|0)){r15=0;break}r15=(HEAP[r14+8|0]|0)==(r9|0)}else{r15=0}}while(0);if((r15&1|0)!=0){HEAP[r13+12|0]=r14;HEAP[r14+8|0]=r13;break}else{_abort()}}else{r16=r12+20|0;r17=r16;r18=HEAP[r16];r14=r18;do{if((r18|0)==0){r16=r9+16|0;r17=r16;r19=HEAP[r16];r14=r19;if((r19|0)!=0){break}else{break L1352}}}while(0);while(1){r18=r14+20|0;r13=r18;if((HEAP[r18]|0)==0){r18=r14+16|0;r13=r18;if((HEAP[r18]|0)==0){break}}r18=r13;r17=r18;r14=HEAP[r18]}if((r17>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){HEAP[r17]=0;break}else{_abort()}}}while(0);if((r5|0)==0){break}r12=(HEAP[r9+28|0]<<2)+r4+304|0;do{if((r9|0)==(HEAP[r12]|0)){r6=r14;HEAP[r12]=r6;if((r6|0)!=0){break}r6=r4+4|0;HEAP[r6]=HEAP[r6]&(1<<HEAP[r9+28|0]^-1)}else{if((r5>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}r6=r14;r7=r5+16|0;if((HEAP[r5+16|0]|0)==(r9|0)){HEAP[r7|0]=r6;break}else{HEAP[r7+4|0]=r6;break}}}while(0);if((r14|0)==0){break}if((r14>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}HEAP[r14+24|0]=r5;r12=HEAP[r9+16|0];r6=r12;do{if((r12|0)!=0){if((r6>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){HEAP[r14+16|0]=r6;HEAP[r6+24|0]=r14;break}else{_abort()}}}while(0);r6=HEAP[r9+20|0];r12=r6;if((r6|0)==0){break}if((r12>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){HEAP[r14+20|0]=r12;HEAP[r12+24|0]=r14;break}else{_abort()}}}while(0);if((r3>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}r14=r3;do{if((HEAP[r3+4|0]&2|0)!=0){r15=r14+4|0;HEAP[r15]=HEAP[r15]&-2;HEAP[r1+4|0]=r2|1;HEAP[r1+r2|0]=r2}else{if((r14|0)==(HEAP[r4+24|0]|0)){r15=r4+12|0;r11=HEAP[r15]+r2|0;HEAP[r15]=r11;HEAP[r4+24|0]=r1;HEAP[r1+4|0]=r11|1;if((r1|0)!=(HEAP[r4+20|0]|0)){return}HEAP[r4+20|0]=0;HEAP[r4+8|0]=0;return}if((r3|0)==(HEAP[r4+20|0]|0)){r11=r4+8|0;r15=HEAP[r11]+r2|0;HEAP[r11]=r15;r11=r15;HEAP[r4+20|0]=r1;HEAP[r1+4|0]=r11|1;HEAP[r1+r11|0]=r11;return}r11=HEAP[r3+4|0]&-8;r2=r2+r11|0;r15=r3;do{if(r11>>>3>>>0<32){r10=HEAP[r15+8|0];r12=HEAP[r3+12|0];r6=r11>>>3;do{if((r10|0)==((r6<<3)+r4+40|0)){r20=1}else{if(!(r10>>>0>=HEAP[r4+16|0]>>>0)){r20=0;break}r20=(HEAP[r10+12|0]|0)==(r3|0)}}while(0);if((r20&1|0)==0){_abort()}if((r12|0)==(r10|0)){r17=r4|0;HEAP[r17]=HEAP[r17]&(1<<r6^-1);break}do{if((r12|0)==((r6<<3)+r4+40|0)){r21=1}else{if(!(r12>>>0>=HEAP[r4+16|0]>>>0)){r21=0;break}r21=(HEAP[r12+8|0]|0)==(r3|0)}}while(0);if((r21&1|0)!=0){HEAP[r10+12|0]=r12;HEAP[r12+8|0]=r10;break}else{_abort()}}else{r6=r15;r17=HEAP[r6+24|0];r5=r6;L1438:do{if((HEAP[r6+12|0]|0)!=(r6|0)){r7=HEAP[r5+8|0];r22=HEAP[r6+12|0];do{if(r7>>>0>=HEAP[r4+16|0]>>>0){if((HEAP[r7+12|0]|0)!=(r6|0)){r23=0;break}r23=(HEAP[r22+8|0]|0)==(r6|0)}else{r23=0}}while(0);if((r23&1|0)!=0){HEAP[r7+12|0]=r22;HEAP[r22+8|0]=r7;break}else{_abort()}}else{r8=r5+20|0;r18=r8;r13=HEAP[r8];r22=r13;do{if((r13|0)==0){r8=r6+16|0;r18=r8;r19=HEAP[r8];r22=r19;if((r19|0)!=0){break}else{break L1438}}}while(0);while(1){r13=r22+20|0;r7=r13;if((HEAP[r13]|0)==0){r13=r22+16|0;r7=r13;if((HEAP[r13]|0)==0){break}}r13=r7;r18=r13;r22=HEAP[r13]}if((r18>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){HEAP[r18]=0;break}else{_abort()}}}while(0);if((r17|0)==0){break}r5=(HEAP[r6+28|0]<<2)+r4+304|0;do{if((r6|0)==(HEAP[r5]|0)){r10=r22;HEAP[r5]=r10;if((r10|0)!=0){break}r10=r4+4|0;HEAP[r10]=HEAP[r10]&(1<<HEAP[r6+28|0]^-1)}else{if((r17>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}r10=r22;r12=r17+16|0;if((HEAP[r17+16|0]|0)==(r6|0)){HEAP[r12|0]=r10;break}else{HEAP[r12+4|0]=r10;break}}}while(0);if((r22|0)==0){break}if((r22>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}HEAP[r22+24|0]=r17;r5=HEAP[r6+16|0];r10=r5;do{if((r5|0)!=0){if((r10>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){HEAP[r22+16|0]=r10;HEAP[r10+24|0]=r22;break}else{_abort()}}}while(0);r10=HEAP[r6+20|0];r5=r10;if((r10|0)==0){break}if((r5>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){HEAP[r22+20|0]=r5;HEAP[r5+24|0]=r22;break}else{_abort()}}}while(0);HEAP[r1+4|0]=r2|1;HEAP[r1+r2|0]=r2;if((r1|0)!=(HEAP[r4+20|0]|0)){break}HEAP[r4+8|0]=r2;return}}while(0);if(r2>>>3>>>0<32){r22=r2>>>3;r23=(r22<<3)+r4+40|0;r21=r23;do{if((1<<r22&HEAP[r4|0]|0)!=0){if((HEAP[r23+8|0]>>>0>=HEAP[r4+16|0]>>>0&1|0)!=0){r21=HEAP[r23+8|0];break}else{_abort()}}else{r3=r4|0;HEAP[r3]=HEAP[r3]|1<<r22}}while(0);HEAP[r23+8|0]=r1;HEAP[r21+12|0]=r1;HEAP[r1+8|0]=r21;HEAP[r1+12|0]=r23;return}r23=r1;r1=r2>>>8;do{if((r1|0)==0){r24=0}else{if(r1>>>0>65535){r24=31;break}else{r21=r1;r22=(r21-256|0)>>>16&8;r3=r21<<r22;r21=r3;r20=(r3-4096|0)>>>16&4;r22=r22+r20|0;r3=r21<<r20;r21=r3;r14=(r3-16384|0)>>>16&2;r20=r14;r22=r14+r22|0;r14=r21<<r20;r21=r14;r20=-r22+(r14>>>15)+14|0;r24=(r20<<1)+(r2>>>((r20+7|0)>>>0)&1)|0;break}}}while(0);r1=(r24<<2)+r4+304|0;HEAP[r23+28|0]=r24;HEAP[r23+20|0]=0;HEAP[r23+16|0]=0;if((1<<r24&HEAP[r4+4|0]|0)==0){r20=r4+4|0;HEAP[r20]=HEAP[r20]|1<<r24;HEAP[r1]=r23;HEAP[r23+24|0]=r1;r20=r23;HEAP[r23+12|0]=r20;HEAP[r23+8|0]=r20;return}r20=HEAP[r1];if((r24|0)==31){r25=0}else{r25=-(r24>>>1)+25|0}r24=r2<<r25;L1515:do{if((HEAP[r20+4|0]&-8|0)!=(r2|0)){while(1){r26=((r24>>>31&1)<<2)+r20+16|0;r24=r24<<1;r27=r26;if((HEAP[r26]|0)==0){break}r20=HEAP[r27];if((HEAP[r20+4|0]&-8|0)==(r2|0)){break L1515}}if((r27>>>0>=HEAP[r4+16|0]>>>0&1|0)==0){_abort()}HEAP[r26]=r23;HEAP[r23+24|0]=r20;r25=r23;HEAP[r23+12|0]=r25;HEAP[r23+8|0]=r25;return}}while(0);r26=HEAP[r20+8|0];if(r20>>>0>=HEAP[r4+16|0]>>>0){r28=r26>>>0>=HEAP[r4+16|0]>>>0}else{r28=0}if((r28&1|0)==0){_abort()}r28=r23;HEAP[r26+12|0]=r28;HEAP[r20+8|0]=r28;HEAP[r23+8|0]=r26;HEAP[r23+12|0]=r20;HEAP[r23+24|0]=0;return}
function _atof(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+80|0;r4=r3;r5=r3+8;r6=r3+12;r7=r3+16;r8=r3+20;r9=r3+24;r10=r3+32;r11=r3+40;r12=r3+44;r13=r3+48;r14=r3+52;r15=r3+56;r16=r3+60;r17=r3+64;r18=r3+68;r19=r3+72;r20=r3+76;HEAP[r5]=r1;HEAP[r6]=0;HEAP[r8]=0;HEAP[r14]=0;HEAP[r15]=0;HEAP[r12]=HEAP[r5];r1=(_isspace(HEAP[HEAP[r12]]<<24>>24)|0)!=0;r21=HEAP[r12];L1533:do{if(r1){r22=r21;while(1){HEAP[r12]=r22+1|0;r23=(_isspace(HEAP[HEAP[r12]]<<24>>24)|0)!=0;r24=HEAP[r12];if(r23){r22=r24}else{r25=r24;break L1533}}}else{r25=r21}}while(0);if((HEAP[r25]<<24>>24|0)==45){HEAP[r7]=1;HEAP[r12]=HEAP[r12]+1|0}else{if((HEAP[HEAP[r12]]<<24>>24|0)==43){HEAP[r12]=HEAP[r12]+1|0}HEAP[r7]=0}HEAP[r17]=-1;HEAP[r16]=0;while(1){HEAP[r13]=HEAP[HEAP[r12]]<<24>>24;if((HEAP[r13]-48|0)>>>0>=10){if((HEAP[r13]|0)!=46){break}if((HEAP[r17]|0)>=0){break}HEAP[r17]=HEAP[r16]}HEAP[r12]=HEAP[r12]+1|0;HEAP[r16]=HEAP[r16]+1|0}HEAP[r18]=HEAP[r12];HEAP[r12]=HEAP[r12]+ -HEAP[r16]|0;r25=HEAP[r16];if((HEAP[r17]|0)<0){HEAP[r17]=r25;r26=HEAP[r16]}else{r21=r25-1|0;HEAP[r16]=r21;r26=r21}r21=HEAP[r17];do{if((r26|0)>18){HEAP[r15]=r21-18|0;HEAP[r16]=18;HEAP[r19]=0;r2=1119;break}else{r25=HEAP[r16];HEAP[r15]=r21-r25|0;if((r25|0)==0){HEAP[r9]=0;HEAP[r12]=HEAP[r5];break}HEAP[r19]=0;if((r25|0)>9){r2=1119;break}r27=HEAP[r16];r2=1123;break}}while(0);L1563:do{if(r2==1119){while(1){r2=0;r21=HEAP[HEAP[r12]]<<24>>24;HEAP[r13]=r21;HEAP[r12]=HEAP[r12]+1|0;if((r21|0)==46){HEAP[r13]=HEAP[HEAP[r12]]<<24>>24;HEAP[r12]=HEAP[r12]+1|0}HEAP[r19]=HEAP[r13]-48+(HEAP[r19]*10&-1)|0;r21=HEAP[r16]-1|0;HEAP[r16]=r21;if((r21|0)>9){r2=1119}else{r27=r21;r2=1123;break L1563}}}}while(0);do{if(r2==1123){HEAP[r20]=0;L1571:do{if((r27|0)>0){while(1){r21=HEAP[HEAP[r12]]<<24>>24;HEAP[r13]=r21;HEAP[r12]=HEAP[r12]+1|0;if((r21|0)==46){HEAP[r13]=HEAP[HEAP[r12]]<<24>>24;HEAP[r12]=HEAP[r12]+1|0}HEAP[r20]=HEAP[r13]-48+(HEAP[r20]*10&-1)|0;r21=HEAP[r16]-1|0;HEAP[r16]=r21;if((r21|0)<=0){break L1571}}}}while(0);HEAP[r9]=(HEAP[r19]|0)*1e9+(HEAP[r20]|0);HEAP[r12]=HEAP[r18];do{if((HEAP[HEAP[r12]]<<24>>24|0)==69){r2=1129}else{if((HEAP[HEAP[r12]]<<24>>24|0)==101){r2=1129;break}else{break}}}while(0);L1580:do{if(r2==1129){HEAP[r12]=HEAP[r12]+1|0;if((HEAP[HEAP[r12]]<<24>>24|0)==45){HEAP[r8]=1;HEAP[r12]=HEAP[r12]+1|0}else{if((HEAP[HEAP[r12]]<<24>>24|0)==43){HEAP[r12]=HEAP[r12]+1|0}HEAP[r8]=0}if(((HEAP[HEAP[r12]]<<24>>24)-48|0)>>>0>=10){break}while(1){HEAP[r14]=(HEAP[HEAP[r12]]<<24>>24)+((HEAP[r14]*10&-1)-48)|0;HEAP[r12]=HEAP[r12]+1|0;if(((HEAP[HEAP[r12]]<<24>>24)-48|0)>>>0>=10){break L1580}}}}while(0);r21=HEAP[r15];r26=HEAP[r14];if((HEAP[r8]|0)!=0){r25=r21-r26|0;HEAP[r14]=r25;r28=r25}else{r25=r26+r21|0;HEAP[r14]=r25;r28=r25}if((r28|0)<0){HEAP[r8]=1;r25=-HEAP[r14]|0;HEAP[r14]=r25;r29=r25}else{HEAP[r8]=0;r29=HEAP[r14]}if((r29|0)>511){HEAP[r14]=511;r25=___errno_location();HEAP[r25]=34}HEAP[r10]=1;HEAP[r11]=32960;L1603:do{if((HEAP[r14]|0)!=0){while(1){if((HEAP[r14]&1|0)!=0){HEAP[r10]=HEAP[HEAP[r11]]*HEAP[r10]}r25=HEAP[r14]>>1;HEAP[r14]=r25;HEAP[r11]=HEAP[r11]+8|0;if((r25|0)==0){break L1603}}}}while(0);r25=HEAP[r10];r21=HEAP[r9];if((HEAP[r8]|0)!=0){HEAP[r9]=r21/r25;break}else{HEAP[r9]=r25*r21;break}}}while(0);if((HEAP[r6]|0)!=0){HEAP[HEAP[r6]]=HEAP[r12]}r29=HEAP[r9];if((HEAP[r7]|0)!=0){HEAP[r4]=-r29;r28=HEAP[r4];r2=r4;r27=r5;r21=r6;r25=r7;r26=r8;r1=r9;r22=r10;r24=r11;r23=r12;r30=r13;r31=r14;r32=r15;r33=r16;r34=r17;r35=r18;r36=r19;r37=r20;STACKTOP=r3;return r28}else{HEAP[r4]=r29;r28=HEAP[r4];r2=r4;r27=r5;r21=r6;r25=r7;r26=r8;r1=r9;r22=r10;r24=r11;r23=r12;r30=r13;r31=r14;r32=r15;r33=r16;r34=r17;r35=r18;r36=r19;r37=r20;STACKTOP=r3;return r28}}
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
Module["_midend_process_key"] = _midend_process_key;
Module["_midend_restart_game"] = _midend_restart_game;
Module["_midend_wants_statusbar"] = _midend_wants_statusbar;
Module["_midend_timer"] = _midend_timer;
Module["_midend_which_preset"] = _midend_which_preset;
Module["_midend_status"] = _midend_status;
Module["_midend_solve"] = _midend_solve;
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
