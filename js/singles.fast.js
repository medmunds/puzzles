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
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+3)>>2)<<2); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+3)>>2)<<2); if (STATICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
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
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
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
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,Math.min(Math.floor((value)/4294967296), 4294967295)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': (HEAPF64[(tempDoublePtr)>>3]=value,HEAP32[((ptr)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[(((ptr)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)]); break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return (HEAP32[((tempDoublePtr)>>2)]=HEAP32[((ptr)>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((ptr)+(4))>>2)],HEAPF64[(tempDoublePtr)>>3]);
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
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    HEAPU8.set(new Uint8Array(slab), ret);
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
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
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
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
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
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STACK_ROOT, STACKTOP, STACK_MAX;
var STATICTOP;
function enlargeMemory() {
  // TOTAL_MEMORY is the current size of the actual array, and STATICTOP is the new top.
  while (TOTAL_MEMORY <= STATICTOP) { // Simple heuristic. Override enlargeMemory() if your program has something more optimal for it
    TOTAL_MEMORY = alignMemoryPage(2*TOTAL_MEMORY);
  }
  assert(TOTAL_MEMORY <= Math.pow(2, 30)); // 2^30==1GB is a practical maximum - 2^31 is already close to possible negative numbers etc.
  var oldHEAP8 = HEAP8;
  var buffer = new ArrayBuffer(TOTAL_MEMORY);
  Module['HEAP8'] = HEAP8 = new Int8Array(buffer);
  Module['HEAP16'] = HEAP16 = new Int16Array(buffer);
  Module['HEAP32'] = HEAP32 = new Int32Array(buffer);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buffer);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buffer);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buffer);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buffer);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buffer);
  HEAP8.set(oldHEAP8);
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 32768;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 524288;
var FAST_MEMORY = Module['FAST_MEMORY'] || 524288;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
STACK_ROOT = STACKTOP = Runtime.alignMemory(1);
STACK_MAX = TOTAL_STACK; // we lose a little stack here, but TOTAL_STACK is nice and round so use that as the max
var tempDoublePtr = Runtime.alignMemory(allocate(12, 'i8', ALLOC_STACK), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
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
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
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
STATICTOP += 3084;
assert(STATICTOP < TOTAL_MEMORY);
var _stderr;
allocate([0,0,0,0,0,0,0,0,0,0,0,0,54,0,0,0,68,0,0,0,36,0,0,0,72,0,0,0,42,0,0,0,64,0,0,0,1,0,0,0,66,0,0,0,38,0,0,0,6,0,0,0,98,0,0,0,30,0,0,0,104,0,0,0,10,0,0,0,2,0,0,0,1,0,0,0,24,0,0,0,1,0,0,0,88,0,0,0,8,0,0,0,60,0,0,0,62,0,0,0,16,0,0,0,40,0,0,0,12,0,0,0,96,0,0,0,100,0,0,0,32,0,0,0,44,0,0,0,22,0,0,0,86,0,0,0,48,0,0,0,4,0,0,0,52,0,0,0,18,0,0,0,82,0,0,0,70,0,0,0,1,0,0,0,0,0,0,0,92,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,76,0,0,0,1024,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0], ALLOC_NONE, 32768);
allocate([5,0,0,0,5,0,0,0,0,0,0,0,5,0,0,0,5,0,0,0,1,0,0,0,6,0,0,0,6,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,1,0,0,0,8,0,0,0,8,0,0,0,0,0,0,0,8,0,0,0,8,0,0,0,1,0,0,0,10,0,0,0,10,0,0,0,0,0,0,0,10,0,0,0,10,0,0,0,1,0,0,0,12,0,0,0,12,0,0,0,0,0,0,0,12,0,0,0,12,0,0,0,1,0,0,0], "i8", ALLOC_NONE, 32960);
allocate(8, "i8", ALLOC_NONE, 33080);
allocate([101,107,0] /* ek\00 */, "i8", ALLOC_NONE, 33088);
allocate(24, "i8", ALLOC_NONE, 33092);
allocate([255,255,255,255], "i8", ALLOC_NONE, 33116);
allocate([255,255,255,255,0,0,0,0,1,0,0,0,0,0,0,0], "i8", ALLOC_NONE, 33120);
allocate([0,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255], "i8", ALLOC_NONE, 33136);
allocate([74,0,0,0,28,0,0,0,20,0,0,0,102,0,0,0,106,0,0,0,14,0,0,0,50,0,0,0,32,0,0,0,46,0,0,0,58,0,0,0,94,0,0,0,80,0,0,0,84,0,0,0,90,0,0,0,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,0,0,0,34,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NONE, 33152);
allocate([109,101,45,62,115,116,97,116,101,112,111,115,32,62,61,32,49,0] /* me-_statepos _= 1\00 */, "i8", ALLOC_NONE, 33252);
allocate([85,110,97,98,108,101,32,116,111,32,115,111,108,118,101,32,112,117,122,122,108,101,46,0] /* Unable to solve puzz */, "i8", ALLOC_NONE, 33272);
allocate([105,50,32,61,61,32,105,110,118,101,114,115,101,0] /* i2 == inverse\00 */, "i8", ALLOC_NONE, 33296);
allocate([108,97,116,105,110,46,99,0] /* latin.c\00 */, "i8", ALLOC_NONE, 33312);
allocate([102,97,116,97,108,32,101,114,114,111,114,58,32,0] /* fatal error: \00 */, "i8", ALLOC_NONE, 33320);
allocate([82,117,110,110,105,110,103,32,115,111,108,118,101,114,32,115,111,97,107,32,116,101,115,116,115,10,0] /* Running solver soak  */, "i8", ALLOC_NONE, 33336);
allocate([112,32,45,32,114,101,116,32,61,61,32,108,101,110,0] /* p - ret == len\00 */, "i8", ALLOC_NONE, 33364);
allocate([107,32,60,32,111,0] /* k _ o\00 */, "i8", ALLOC_NONE, 33380);
allocate([118,50,32,61,61,32,118,49,0] /* v2 == v1\00 */, "i8", ALLOC_NONE, 33388);
allocate([115,32,33,61,32,78,85,76,76,0] /* s != NULL\00 */, "i8", ALLOC_NONE, 33400);
allocate([37,115,95,84,69,83,84,83,79,76,86,69,0] /* %s_TESTSOLVE\00 */, "i8", ALLOC_NONE, 33412);
allocate([115,105,110,103,108,101,115,46,99,0] /* singles.c\00 */, "i8", ALLOC_NONE, 33428);
allocate([106,32,61,61,32,111,0] /* j == o\00 */, "i8", ALLOC_NONE, 33440);
allocate([105,110,118,101,114,115,101,32,61,61,32,48,32,124,124,32,105,110,118,101,114,115,101,32,61,61,32,49,0] /* inverse == 0 || inve */, "i8", ALLOC_NONE, 33448);
allocate([100,115,102,46,99,0] /* dsf.c\00 */, "i8", ALLOC_NONE, 33480);
allocate([115,0] /* s\00 */, "i8", ALLOC_NONE, 33488);
allocate([37,99,37,100,44,37,100,0] /* %c%d,%d\00 */, "i8", ALLOC_NONE, 33492);
allocate([110,101,32,61,61,32,111,42,111,32,43,32,50,42,111,0] /* ne == o_o + 2_o\00 */, "i8", ALLOC_NONE, 33500);
allocate([33,105,110,118,101,114,115,101,0] /* !inverse\00 */, "i8", ALLOC_NONE, 33516);
allocate([109,111,118,101,115,116,114,32,38,38,32,33,109,115,103,0] /* movestr && !msg\00 */, "i8", ALLOC_NONE, 33528);
allocate([100,114,97,119,105,110,103,46,99,0] /* drawing.c\00 */, "i8", ALLOC_NONE, 33544);
allocate([84,114,105,99,107,121,0] /* Tricky\00 */, "i8", ALLOC_NONE, 33556);
allocate([69,97,115,121,0] /* Easy\00 */, "i8", ALLOC_NONE, 33564);
allocate([37,100,120,37,100,32,37,115,0] /* %dx%d %s\00 */, "i8", ALLOC_NONE, 33572);
allocate([100,115,102,91,118,50,93,32,38,32,50,0] /* dsf[v2] & 2\00 */, "i8", ALLOC_NONE, 33584);
allocate([37,100,120,37,100,0] /* %dx%d\00 */, "i8", ALLOC_NONE, 33596);
allocate([37,100,120,37,100,100,37,99,0] /* %dx%dd%c\00 */, "i8", ALLOC_NONE, 33604);
allocate([58,69,97,115,121,58,84,114,105,99,107,121,0] /* :Easy:Tricky\00 */, "i8", ALLOC_NONE, 33616);
allocate([68,105,102,102,105,99,117,108,116,121,0] /* Difficulty\00 */, "i8", ALLOC_NONE, 33632);
allocate([72,101,105,103,104,116,0] /* Height\00 */, "i8", ALLOC_NONE, 33644);
allocate([87,105,100,116,104,0] /* Width\00 */, "i8", ALLOC_NONE, 33652);
allocate([109,101,45,62,110,115,116,97,116,101,115,32,61,61,32,48,0] /* me-_nstates == 0\00 */, "i8", ALLOC_NONE, 33660);
allocate([109,97,120,32,62,32,48,0] /* max _ 0\00 */, "i8", ALLOC_NONE, 33680);
allocate([85,110,107,110,111,119,110,32,100,105,102,102,105,99,117,108,116,121,32,114,97,116,105,110,103,0] /* Unknown difficulty r */, "i8", ALLOC_NONE, 33688);
allocate([80,117,122,122,108,101,32,105,115,32,116,111,111,32,108,97,114,103,101,0] /* Puzzle is too large\ */, "i8", ALLOC_NONE, 33716);
allocate([37,100,44,37,100,37,110,0] /* %d,%d%n\00 */, "i8", ALLOC_NONE, 33736);
allocate([87,105,100,116,104,32,97,110,100,32,110,101,105,103,104,116,32,109,117,115,116,32,98,101,32,97,116,32,108,101,97,115,116,32,116,119,111,0] /* Width and neight mus */, "i8", ALLOC_NONE, 33744);
allocate([33,34,117,110,97,98,108,101,32,116,111,32,112,108,97,99,101,32,110,117,109,98,101,114,32,117,110,100,101,114,32,98,108,97,99,107,32,99,101,108,108,46,34,0] /* !\22unable to place  */, "i8", ALLOC_NONE, 33784);
allocate([100,115,102,91,118,49,93,32,38,32,50,0] /* dsf[v1] & 2\00 */, "i8", ALLOC_NONE, 33828);
allocate([112,97,114,97,109,115,45,62,100,105,102,102,32,60,32,68,73,70,70,95,77,65,88,0] /* params-_diff _ DIFF_ */, "i8", ALLOC_NONE, 33840);
allocate([71,101,110,101,114,97,116,111,114,58,32,97,100,100,105,110,103,32,114,97,110,100,111,109,32,98,108,97,99,107,32,99,101,108,108,0] /* Generator: adding ra */, "i8", ALLOC_NONE, 33864);
allocate([91,37,100,58,37,48,50,100,93,32,0] /* [%d:%02d] \00 */, "i8", ALLOC_NONE, 33900);
allocate([71,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,32,99,111,110,116,97,105,110,115,32,117,110,101,120,112,101,99,116,101,100,32,99,104,97,114,97,99,116,101,114,115,0] /* Game description con */, "i8", ALLOC_NONE, 33912);
allocate([109,105,100,101,110,100,46,99,0] /* midend.c\00 */, "i8", ALLOC_NONE, 33960);
allocate([83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,32,102,97,105,108,101,100,0] /* Solve operation fail */, "i8", ALLOC_NONE, 33972);
allocate([115,112,97,114,101,32,33,61,32,48,0] /* spare != 0\00 */, "i8", ALLOC_NONE, 33996);
allocate([71,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,32,105,115,32,119,114,111,110,103,32,108,101,110,103,116,104,0] /* Game description is  */, "i8", ALLOC_NONE, 34008);
allocate([78,111,32,103,97,109,101,32,115,101,116,32,117,112,32,116,111,32,115,111,108,118,101,0] /* No game set up to so */, "i8", ALLOC_NONE, 34044);
allocate([33,34,110,101,119,95,103,97,109,101,32,102,97,105,108,101,100,32,116,111,32,117,110,112,105,99,107,34,0] /* !\22new_game failed  */, "i8", ALLOC_NONE, 34068);
allocate([84,104,105,115,32,103,97,109,101,32,100,111,101,115,32,110,111,116,32,115,117,112,112,111,114,116,32,116,104,101,32,83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,0] /* This game does not s */, "i8", ALLOC_NONE, 34100);
allocate([83,78,69,65,75,89,58,32,111,110,108,121,32,111,110,101,32,111,102,32,105,116,115,32,110,117,109,98,101,114,32,105,110,32,114,111,119,32,97,110,100,32,99,111,108,0] /* SNEAKY: only one of  */, "i8", ALLOC_NONE, 34148);
allocate([83,80,47,83,84,32,45,32,98,101,116,119,101,101,110,32,105,100,101,110,116,105,99,97,108,32,110,117,109,115,0] /* SP/ST - between iden */, "i8", ALLOC_NONE, 34196);
allocate([114,97,110,100,111,109,46,99,0] /* random.c\00 */, "i8", ALLOC_NONE, 34228);
allocate([80,73,32,45,32,115,97,109,101,32,99,111,108,32,97,115,32,112,97,105,114,0] /* PI - same col as pai */, "i8", ALLOC_NONE, 34240);
allocate([105,110,118,101,114,115,101,32,61,61,32,48,0] /* inverse == 0\00 */, "i8", ALLOC_NONE, 34264);
allocate([80,73,32,45,32,115,97,109,101,32,114,111,119,32,97,115,32,112,97,105,114,0] /* PI - same row as pai */, "i8", ALLOC_NONE, 34280);
allocate([100,114,45,62,109,101,0] /* dr-_me\00 */, "i8", ALLOC_NONE, 34304);
allocate([68,67,58,32,99,111,114,110,101,114,32,119,105,116,104,32,50,32,109,97,116,99,104,105,110,103,0] /* DC: corner with 2 ma */, "i8", ALLOC_NONE, 34312);
allocate([84,67,58,32,105,110,115,105,100,101,32,97,112,101,120,32,102,114,111,109,32,51,32,109,97,116,99,104,105,110,103,0] /* TC: inside apex from */, "i8", ALLOC_NONE, 34340);
allocate([84,67,58,32,99,111,114,110,101,114,32,97,112,101,120,32,102,114,111,109,32,51,32,109,97,116,99,104,105,110,103,0] /* TC: corner apex from */, "i8", ALLOC_NONE, 34372);
allocate([81,67,58,32,99,111,114,110,101,114,32,119,105,116,104,32,52,32,109,97,116,99,104,105,110,103,0] /* QC: corner with 4 ma */, "i8", ALLOC_NONE, 34404);
allocate([102,114,111,109,32,33,61,32,116,111,0] /* from != to\00 */, "i8", ALLOC_NONE, 34432);
allocate([73,80,58,32,110,101,120,116,32,116,111,32,111,102,102,115,101,116,45,112,97,105,114,0] /* IP: next to offset-p */, "i8", ALLOC_NONE, 34444);
allocate([73,78,71,82,73,68,40,115,116,97,116,101,44,32,97,120,44,32,97,121,41,0] /* INGRID(state, ax, ay */, "i8", ALLOC_NONE, 34468);
allocate([115,105,110,103,108,101,115,0] /* singles\00 */, "i8", ALLOC_NONE, 34492);
allocate([121,49,32,61,61,32,121,50,0] /* y1 == y2\00 */, "i8", ALLOC_NONE, 34500);
allocate([37,100,0] /* %d\00 */, "i8", ALLOC_NONE, 34512);
allocate([83,66,32,45,32,97,100,106,97,99,101,110,116,32,116,111,32,98,108,97,99,107,32,115,113,117,97,114,101,0] /* SB - adjacent to bla */, "i8", ALLOC_NONE, 34516);
allocate([83,67,32,45,32,110,117,109,98,101,114,32,111,110,32,115,97,109,101,32,114,111,119,47,99,111,108,32,97,115,32,99,105,114,99,108,101,100,0] /* SC - number on same  */, "i8", ALLOC_NONE, 34548);
allocate([105,110,100,101,120,32,62,61,32,48,0] /* index _= 0\00 */, "i8", ALLOC_NONE, 34588);
allocate(1, "i8", ALLOC_NONE, 34600);
allocate([110,32,62,61,32,48,32,38,38,32,110,32,60,32,109,101,45,62,110,112,114,101,115,101,116,115,0] /* n _= 0 && n _ me-_np */, "i8", ALLOC_NONE, 34604);
allocate([67,67,47,67,69,47,81,77,58,32,119,104,105,116,101,32,99,101,108,108,32,119,105,116,104,32,115,105,110,103,108,101,32,110,111,110,45,98,108,97,99,107,32,97,114,111,117,110,100,32,105,116,0] /* CC/CE/QM: white cell */, "i8", ALLOC_NONE, 34632);
allocate([37,115,95,80,82,69,83,69,84,83,0] /* %s_PRESETS\00 */, "i8", ALLOC_NONE, 34688);
allocate([105,32,61,61,32,121,42,115,116,97,116,101,45,62,119,43,120,0] /* i == y_state-_w+x\00 */, "i8", ALLOC_NONE, 34700);
allocate([37,50,120,37,50,120,37,50,120,0] /* %2x%2x%2x\00 */, "i8", ALLOC_NONE, 34720);
allocate([105,32,33,61,32,45,49,0] /* i != -1\00 */, "i8", ALLOC_NONE, 34732);
allocate([37,115,95,67,79,76,79,85,82,95,37,100,0] /* %s_COLOUR_%d\00 */, "i8", ALLOC_NONE, 34740);
allocate([77,67,58,32,98,108,97,99,107,32,115,113,117,97,114,101,32,104,101,114,101,32,119,111,117,108,100,32,115,112,108,105,116,32,119,104,105,116,101,32,114,101,103,105,111,110,0] /* MC: black square her */, "i8", ALLOC_NONE, 34756);
allocate([98,105,116,115,32,60,32,51,50,0] /* bits _ 32\00 */, "i8", ALLOC_NONE, 34804);
allocate([37,115,95,68,69,70,65,85,76,84,0] /* %s_DEFAULT\00 */, "i8", ALLOC_NONE, 34816);
allocate([37,99,37,100,44,37,100,59,0] /* %c%d,%d;\00 */, "i8", ALLOC_NONE, 34828);
allocate([37,115,95,84,73,76,69,83,73,90,69,0] /* %s_TILESIZE\00 */, "i8", ALLOC_NONE, 34840);
allocate([109,101,45,62,100,105,114,32,33,61,32,48,0] /* me-_dir != 0\00 */, "i8", ALLOC_NONE, 34852);
allocate([106,32,61,61,32,110,118,0] /* j == nv\00 */, "i8", ALLOC_NONE, 34868);
allocate([109,97,120,102,108,111,119,46,99,0] /* maxflow.c\00 */, "i8", ALLOC_NONE, 34876);
allocate([40,100,115,116,45,62,102,108,97,103,115,91,105,93,32,38,32,102,109,97,115,107,41,32,33,61,32,102,109,97,115,107,0] /* (dst-_flags[i] & fma */, "i8", ALLOC_NONE, 34888);
allocate([109,101,45,62,100,114,97,119,105,110,103,0] /* me-_drawing\00 */, "i8", ALLOC_NONE, 34924);
allocate([111,117,116,32,111,102,32,109,101,109,111,114,121,0] /* out of memory\00 */, "i8", ALLOC_NONE, 34936);
allocate([115,114,99,45,62,110,32,61,61,32,100,115,116,45,62,110,0] /* src-_n == dst-_n\00 */, "i8", ALLOC_NONE, 34952);
allocate([103,97,109,101,115,46,115,105,110,103,108,101,115,0] /* games.singles\00 */, "i8", ALLOC_NONE, 34972);
allocate([83,105,110,103,108,101,115,0] /* Singles\00 */, "i8", ALLOC_NONE, 34988);
allocate(472, "i8", ALLOC_NONE, 34996);
allocate([115,116,97,116,117,115,95,98,97,114,0] /* status_bar\00 */, "i8", ALLOC_NONE, 35468);
allocate([115,111,108,118,101,95,111,102,102,115,101,116,112,97,105,114,95,112,97,105,114,0] /* solve_offsetpair_pai */, "i8", ALLOC_NONE, 35480);
allocate([115,111,108,118,101,95,104,97,115,115,105,110,103,108,101,119,104,105,116,101,114,101,103,105,111,110,0] /* solve_hassinglewhite */, "i8", ALLOC_NONE, 35504);
allocate([115,111,108,118,101,95,100,111,117,98,108,101,115,0] /* solve_doubles\00 */, "i8", ALLOC_NONE, 35532);
allocate([115,111,108,118,101,95,97,108,108,98,108,97,99,107,98,117,116,111,110,101,0] /* solve_allblackbutone */, "i8", ALLOC_NONE, 35548);
allocate([114,97,110,100,111,109,95,117,112,116,111,0] /* random_upto\00 */, "i8", ALLOC_NONE, 35572);
allocate([110,101,119,95,103,97,109,101,95,105,115,95,103,111,111,100,0] /* new_game_is_good\00 */, "i8", ALLOC_NONE, 35584);
allocate([110,101,119,95,103,97,109,101,0] /* new_game\00 */, "i8", ALLOC_NONE, 35604);
allocate([109,105,100,101,110,100,95,115,111,108,118,101,0] /* midend_solve\00 */, "i8", ALLOC_NONE, 35616);
allocate([109,105,100,101,110,100,95,114,101,115,116,97,114,116,95,103,97,109,101,0] /* midend_restart_game\ */, "i8", ALLOC_NONE, 35632);
allocate([109,105,100,101,110,100,95,114,101,100,114,97,119,0] /* midend_redraw\00 */, "i8", ALLOC_NONE, 35652);
allocate([109,105,100,101,110,100,95,114,101,97,108,108,121,95,112,114,111,99,101,115,115,95,107,101,121,0] /* midend_really_proces */, "i8", ALLOC_NONE, 35668);
allocate([109,105,100,101,110,100,95,110,101,119,95,103,97,109,101,0] /* midend_new_game\00 */, "i8", ALLOC_NONE, 35696);
allocate([109,105,100,101,110,100,95,102,101,116,99,104,95,112,114,101,115,101,116,0] /* midend_fetch_preset\ */, "i8", ALLOC_NONE, 35712);
allocate([109,97,120,102,108,111,119,95,119,105,116,104,95,115,99,114,97,116,99,104,0] /* maxflow_with_scratch */, "i8", ALLOC_NONE, 35732);
allocate([108,97,116,105,110,95,103,101,110,101,114,97,116,101,0] /* latin_generate\00 */, "i8", ALLOC_NONE, 35756);
allocate([103,97,109,101,95,116,101,120,116,95,102,111,114,109,97,116,0] /* game_text_format\00 */, "i8", ALLOC_NONE, 35772);
allocate([103,97,109,101,95,115,116,97,116,101,95,100,105,102,102,0] /* game_state_diff\00 */, "i8", ALLOC_NONE, 35792);
allocate([101,100,115,102,95,109,101,114,103,101,0] /* edsf_merge\00 */, "i8", ALLOC_NONE, 35808);
allocate([101,100,115,102,95,99,97,110,111,110,105,102,121,0] /* edsf_canonify\00 */, "i8", ALLOC_NONE, 35820);
allocate([98,101,115,116,95,98,108,97,99,107,95,99,111,108,0] /* best_black_col\00 */, "i8", ALLOC_NONE, 35836);
HEAP32[((32768)>>2)]=((34988)|0);
HEAP32[((32772)>>2)]=((34972)|0);
HEAP32[((32776)>>2)]=((34492)|0);
HEAP32[((33080)>>2)]=((33564)|0);
HEAP32[((33084)>>2)]=((33556)|0);
  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[(curr)]|0 != 0) {
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
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],HEAPF64[(tempDoublePtr)>>3]);
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
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
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
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
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
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
                ret.push(HEAPU8[((arg++)|0)]);
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
              HEAP32[((ptr)>>2)]=ret.length
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
                ret.push(HEAP8[(i)]);
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
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }
  function _memset(ptr, value, num) {
      ptr = ptr|0; value = value|0; num = num|0;
      var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
      stop = (ptr + num)|0;
      if ((num|0) >= 20) {
        // This is unaligned, but quite large, so work hard to get to aligned settings
        value = value & 0xff;
        unaligned = ptr & 3;
        value4 = value | (value << 8) | (value << 16) | (value << 24);
        stop4 = stop & ~3;
        if (unaligned) {
          unaligned = (ptr + 4 - unaligned)|0;
          while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
            HEAP8[(ptr)]=value;
            ptr = (ptr+1)|0;
          }
        }
        while ((ptr|0) < (stop4|0)) {
          HEAP32[((ptr)>>2)]=value4;
          ptr = (ptr+4)|0;
        }
      }
      while ((ptr|0) < (stop|0)) {
        HEAP8[(ptr)]=value;
        ptr = (ptr+1)|0;
      }
    }var _llvm_memset_p0i8_i32=_memset;
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
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getNativeFieldSize('void*');
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
        // TODO: Support strings like "%5c" etc.
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'c') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getNativeFieldSize('void*');
          fields++;
          next = get();
          HEAP8[(argPtr)]=next
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
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getNativeFieldSize('void*');
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if(longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,Math.min(Math.floor((parseInt(text, 10))/4294967296), 4294967295)>>>0],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16)
              break;
            case 'f':
            case 'e':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                (HEAPF64[(tempDoublePtr)>>3]=parseFloat(text),HEAP32[((argPtr)>>2)]=HEAP32[((tempDoublePtr)>>2)],HEAP32[(((argPtr)+(4))>>2)]=HEAP32[(((tempDoublePtr)+(4))>>2)])
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text)
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j]
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
      var get = function() { return HEAP8[(((s)+(index++))|0)]; };
      var unget = function() { index--; };
      return __scanString(format, get, unget, varargs);
    }
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }
  function _strcpy(pdest, psrc) {
      pdest = pdest|0; psrc = psrc|0;
      var i = 0;
      do {
        HEAP8[(((pdest+i)|0)|0)]=HEAP8[(((psrc+i)|0)|0)];
        i = (i+1)|0;
      } while ((HEAP8[(((psrc)+(i-1))|0)])|0 != 0);
      return pdest|0;
    }
  function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[(dest)]=HEAP8[(src)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[(dest)]=HEAP8[(src)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function _isspace(chr) {
      return chr in { 32: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0 };
    }
  function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      if (!___setErrNo.ret) ___setErrNo.ret = allocate([0], 'i32', ALLOC_STATIC);
      HEAP32[((___setErrNo.ret)>>2)]=value
      return value;
    }
  var ERRNO_CODES={E2BIG:7,EACCES:13,EADDRINUSE:98,EADDRNOTAVAIL:99,EAFNOSUPPORT:97,EAGAIN:11,EALREADY:114,EBADF:9,EBADMSG:74,EBUSY:16,ECANCELED:125,ECHILD:10,ECONNABORTED:103,ECONNREFUSED:111,ECONNRESET:104,EDEADLK:35,EDESTADDRREQ:89,EDOM:33,EDQUOT:122,EEXIST:17,EFAULT:14,EFBIG:27,EHOSTUNREACH:113,EIDRM:43,EILSEQ:84,EINPROGRESS:115,EINTR:4,EINVAL:22,EIO:5,EISCONN:106,EISDIR:21,ELOOP:40,EMFILE:24,EMLINK:31,EMSGSIZE:90,EMULTIHOP:72,ENAMETOOLONG:36,ENETDOWN:100,ENETRESET:102,ENETUNREACH:101,ENFILE:23,ENOBUFS:105,ENODATA:61,ENODEV:19,ENOENT:2,ENOEXEC:8,ENOLCK:37,ENOLINK:67,ENOMEM:12,ENOMSG:42,ENOPROTOOPT:92,ENOSPC:28,ENOSR:63,ENOSTR:60,ENOSYS:38,ENOTCONN:107,ENOTDIR:20,ENOTEMPTY:39,ENOTRECOVERABLE:131,ENOTSOCK:88,ENOTSUP:95,ENOTTY:25,ENXIO:6,EOVERFLOW:75,EOWNERDEAD:130,EPERM:1,EPIPE:32,EPROTO:71,EPROTONOSUPPORT:93,EPROTOTYPE:91,ERANGE:34,EROFS:30,ESPIPE:29,ESRCH:3,ESTALE:116,ETIME:62,ETIMEDOUT:110,ETXTBSY:26,EWOULDBLOCK:11,EXDEV:18};function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP8[(str)] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
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
      while ((chr = HEAP8[(str)]) != 0) {
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
        HEAP32[((endptr)>>2)]=str
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
      if (bits == 64) {
        return tempRet0 = Math.min(Math.floor((ret)/4294967296), 4294967295)>>>0,ret>>>0;
      }
      return ret;
    }function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }function _atoi(ptr) {
      return _strtol(ptr, null, 10);
    }
  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAPU8[(((px)+(i))|0)];
        var y = HEAPU8[(((py)+(i))|0)];
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
      HEAP32[((ptr)>>2)]=Math.floor(now/1000); // seconds
      HEAP32[(((ptr)+(4))>>2)]=Math.floor((now-1000*Math.floor(now/1000))*1000); // microseconds
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
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
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
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
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
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
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
        HEAP32[((envPtr)>>2)]=poolPtr
        HEAP32[((_environ)>>2)]=envPtr;
      } else {
        envPtr = HEAP32[((_environ)>>2)];
        poolPtr = HEAP32[((envPtr)>>2)];
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
          HEAP8[(((poolPtr)+(j))|0)]=line.charCodeAt(j);
        }
        HEAP8[(((poolPtr)+(j))|0)]=0;
        HEAP32[(((envPtr)+(i * ptrSize))>>2)]=poolPtr;
        poolPtr += line.length + 1;
      }
      HEAP32[(((envPtr)+(strings.length * ptrSize))>>2)]=0;
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
        HEAP8[((pdest+i)|0)]=HEAP8[((psrc+i)|0)];
        i = (i+1)|0;
      } while (HEAP8[(((psrc)+(i-1))|0)] != 0);
      return pdest|0;
    }
var _activate_timer; // stub for _activate_timer
var _frontend_default_colour; // stub for _frontend_default_colour
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
        HEAP32[((ptr)>>2)]=ret
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
  var _sqrtf=Math.sqrt;
  function _llvm_uadd_with_overflow_i32(x, y) {
      x = x>>>0;
      y = y>>>0;
      return tempRet0 = x+y > 4294967295,(x+y)>>>0;
    }
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return -1;
      } else {
        return chr;
      }
    }
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
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
        var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
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
,0,_game_changed_state,0,_canvas_draw_update,0,_encode_ui,0,_game_anim_length,0,_canvas_draw_line
,0,_game_set_size,0,_solve_game,0,_game_print,0,_canvas_draw_rect,0,_validate_desc
,0,_canvas_unclip,0,_canvas_draw_thick_line,0,_decode_params,0,_custom_params,0,_decode_ui
,0,_free_params,0,_game_compute_size,0,_canvas_start_draw,0,_game_new_drawstate,0,_canvas_clip
,0,_game_redraw,0,_default_params,0,_canvas_text_fallback,0,_canvas_end_draw,0,_new_ui
,0,_free_ui,0,_dup_params,0,_game_configure,0,_game_fetch_preset,0,_game_status
,0,_encode_params,0,_canvas_draw_text,0,_game_timing_state,0,_canvas_blitter_load,0,_canvas_blitter_new
,0,_game_flash_length,0,_canvas_blitter_free,0,_game_colours,0,_game_can_format_as_text_now,0,_canvas_blitter_save
,0,_game_print_size,0,_canvas_status_bar,0,_interpret_move,0,_new_game_desc,0,_execute_move,0,_canvas_draw_poly,0,_new_game,0,_canvas_draw_circle,0];
// EMSCRIPTEN_START_FUNCS
function _validate_params(r1,r2){var r3,r4,r5;r3=HEAP32[r1>>2];do{if((r3|0)<2){r4=33744}else{r5=HEAP32[r1+4>>2];if((r5|0)<2){r4=33744;break}if((r3|0)>62|(r5|0)>62){r4=33716;break}if((r2|0)!=0){if(HEAP32[r1+8>>2]>>>0>1){r4=33688;break}}r4=0}}while(0);return r4}function _decode_params(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11;r3=0;r4=_atoi(r2);r5=r1+4|0;HEAP32[r5>>2]=r4;HEAP32[r1>>2]=r4;r4=r2;while(1){r6=HEAP8[r4];if(r6<<24>>24==0){r3=23;break}r7=r4+1|0;if(((r6&255)-48|0)>>>0<10){r4=r7}else{break}}if(r3==23){return}L16:do{if(r6<<24>>24==120){r3=_atoi(r7);HEAP32[r5>>2]=r3;r3=r7;while(1){r2=HEAP8[r3];if(r2<<24>>24==0){break}if(((r2&255)-48|0)>>>0<10){r3=r3+1|0}else{r8=r3;r9=r2;break L16}}return}else{r8=r4;r9=r6}}while(0);if(r9<<24>>24!=100){return}r9=(r1+8|0)>>2;HEAP32[r9]=2;r1=r8+1|0;r8=HEAP8[r1];if(r8<<24>>24==101){HEAP32[r9]=0;r10=HEAP8[r1]}else{r10=r8}if(r10<<24>>24==107){HEAP32[r9]=1;r11=HEAP8[r1]}else{r11=r10}if(r11<<24>>24!=0){return}HEAP32[r9]=2;return}function _free_params(r1){if((r1|0)==0){return}_free(r1);return}function _default_params(){var r1,r2,r3;r1=STACKTOP;r2=_malloc(12),r3=r2>>2;if((r2|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r3+1]=5;HEAP32[r3]=5;HEAP32[r3+2]=0;STACKTOP=r1;return r2}}function _game_fetch_preset(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=STACKTOP;STACKTOP=STACKTOP+80|0;if((r1|0)<0|r1>>>0>9){r5=0;STACKTOP=r4;return r5}r6=_malloc(12),r7=r6>>2;if((r6|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r8=r6+4|0;HEAP32[r8>>2]=5;r9=r6;HEAP32[r9>>2]=5;r10=r6+8|0;HEAP32[r10>>2]=0;r11=((r1*12&-1)+32960|0)>>2;HEAP32[r7]=HEAP32[r11];HEAP32[r7+1]=HEAP32[r11+1];HEAP32[r7+2]=HEAP32[r11+2];HEAP32[r3>>2]=r6;r6=r4|0;r3=HEAP32[r8>>2];r8=HEAP32[(HEAP32[r10>>2]<<2)+33080>>2];_sprintf(r6,33572,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=HEAP32[r9>>2],HEAP32[tempInt+4>>2]=r3,HEAP32[tempInt+8>>2]=r8,tempInt));r8=_malloc(_strlen(r6)+1|0);if((r8|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r8,r6);HEAP32[r2>>2]=r8;r5=1;STACKTOP=r4;return r5}function _encode_params(r1,r2){var r3,r4,r5,r6;r3=STACKTOP;STACKTOP=STACKTOP+256|0;r4=r3|0;r5=HEAP32[r1>>2];r6=HEAP32[r1+4>>2];if((r2|0)==0){_sprintf(r4,33596,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r6,tempInt))}else{r2=HEAP8[HEAP32[r1+8>>2]+33088|0]<<24>>24;_sprintf(r4,33604,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r6,HEAP32[tempInt+8>>2]=r2,tempInt))}r2=_malloc(_strlen(r4)+1|0);if((r2|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r2,r4);STACKTOP=r3;return r2}}function _dup_params(r1){var r2,r3,r4,r5;r2=STACKTOP;r3=_malloc(12),r4=r3>>2;if((r3|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r5=r1>>2;HEAP32[r4]=HEAP32[r5];HEAP32[r4+1]=HEAP32[r5+1];HEAP32[r4+2]=HEAP32[r5+2];STACKTOP=r2;return r3}}function _game_configure(r1){var r2,r3,r4,r5,r6;r2=STACKTOP;STACKTOP=STACKTOP+80|0;r3=_malloc(64),r4=r3>>2;if((r3|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4]=33652;HEAP32[r4+1]=0;r5=r2|0;_sprintf(r5,34512,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r1>>2],tempInt));r6=_malloc(_strlen(r5)+1|0);if((r6|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r6,r5);HEAP32[r4+2]=r6;HEAP32[r4+3]=0;HEAP32[r4+4]=33644;HEAP32[r4+5]=0;_sprintf(r5,34512,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r1+4>>2],tempInt));r6=_malloc(_strlen(r5)+1|0);if((r6|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r6,r5);HEAP32[r4+6]=r6;HEAP32[r4+7]=0;HEAP32[r4+8]=33632;HEAP32[r4+9]=1;HEAP32[r4+10]=33616;HEAP32[r4+11]=HEAP32[r1+8>>2];HEAP32[r4+12]=0;HEAP32[r4+13]=3;HEAP32[r4+14]=0;HEAP32[r4+15]=0;STACKTOP=r2;return r3}}function _custom_params(r1){var r2,r3,r4,r5;r2=STACKTOP;r3=_malloc(12),r4=r3>>2;if((r3|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r5=_atoi(HEAP32[r1+8>>2]);HEAP32[r4]=r5;r5=_atoi(HEAP32[r1+24>>2]);HEAP32[r4+1]=r5;HEAP32[r4+2]=HEAP32[r1+44>>2];STACKTOP=r2;return r3}}function _validate_desc(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3;HEAP32[r4>>2]=0;_unpick_desc(HEAP32[r1>>2],HEAP32[r1+4>>2],r2,0,r4);STACKTOP=r3;return HEAP32[r4>>2]}function _new_game(r1,r2,r3){var r4,r5,r6;r1=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r1,r5=r4>>2;HEAP32[r5]=0;_unpick_desc(HEAP32[r2>>2],HEAP32[r2+4>>2],r3,r4,0);r4=HEAP32[r5];if((r4|0)!=0){r6=r4;STACKTOP=r1;return r6}___assert_func(33428,1417,35604,34068);r6=HEAP32[r5];STACKTOP=r1;return r6}function _free_game(r1){var r2;r2=HEAP32[r1+28>>2];if((r2|0)!=0){_free(r2)}r2=HEAP32[r1+32>>2];if((r2|0)!=0){_free(r2)}if((r1|0)==0){return}_free(r1);return}function _new_game_desc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70;r4=0;r3=STACKTOP;r5=r1|0;r6=HEAP32[r5>>2];r7=r1+4|0;r8=HEAP32[r7>>2];r9=_malloc(36);if((r9|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=r9;_memset(r9,0,36);r11=r9>>2;HEAP32[r11]=r6;r12=r9+4|0;HEAP32[r12>>2]=r8;r13=Math.imul(r8,r6);r14=(r9+8|0)>>2;HEAP32[r14]=r13;r15=(r9+12|0)>>2;HEAP32[r15]=(r6|0)>(r8|0)?r6:r8;r8=r9+24|0;HEAP32[r8>>2]=0;HEAP32[r9+20>>2]=0;HEAP32[r9+16>>2]=0;r6=_malloc(r13<<2);if((r6|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r13=(r9+28|0)>>2;HEAP32[r13]=r6;r6=_malloc(HEAP32[r14]<<2);if((r6|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r16=(r9+32|0)>>2;HEAP32[r16]=r6;_memset(HEAP32[r13],0,HEAP32[r14]<<2);_memset(HEAP32[r16],0,HEAP32[r14]<<2);r6=HEAP32[r5>>2];r5=HEAP32[r7>>2];r7=_malloc(36),r17=r7>>2;if((r7|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r18=r7;_memset(r7,0,36);HEAP32[r17]=r6;HEAP32[r17+1]=r5;r19=Math.imul(r5,r6);r20=(r7+8|0)>>2;HEAP32[r20]=r19;HEAP32[r17+3]=(r6|0)>(r5|0)?r6:r5;r5=(r7+24|0)>>2;HEAP32[r5]=0;HEAP32[r17+5]=0;r17=(r7+16|0)>>2;HEAP32[r17]=0;r6=_malloc(r19<<2);if((r6|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r19=(r7+28|0)>>2;HEAP32[r19]=r6;r6=_malloc(HEAP32[r20]<<2);if((r6|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r21=(r7+32|0)>>2;HEAP32[r21]=r6;_memset(HEAP32[r19],0,HEAP32[r20]<<2);_memset(HEAP32[r21],0,HEAP32[r20]<<2);r20=HEAP32[r11];r6=HEAP32[r12>>2];r12=HEAP32[r15];r22=_malloc(16);if((r22|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r23=r22>>2;HEAP32[r23]=0;r24=(r22+8|0)>>2;HEAP32[r24]=0;r25=(r22+4|0)>>2;HEAP32[r25]=0;r26=_malloc(HEAP32[r14]<<2);if((r26|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r27=r22;r28=r22+12|0;HEAP32[r28>>2]=r26;r26=_malloc(HEAP32[r14]<<2);if((r26|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r29=r26>>2;r30=Math.imul(r6<<2,r12);r31=_malloc(r30);if((r31|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r32=r31;r33=Math.imul(r20<<2,r12);r34=_malloc(r33);if((r34|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r35=r34;HEAP32[r25]=0;_memset(HEAP32[r16],0,HEAP32[r14]<<2);r36=(r20|0)>(r6|0)?r20:r6;r37=_latin_generate(r36,r2);r38=Math.imul(r6,r20);r39=_malloc(r38);if((r39|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r40=(r20|0)>0;r41=(r6|0)>0;r42=(r1+8|0)>>2;r1=r37;r37=r39;L136:while(1){L138:do{if(r40){r39=0;while(1){L141:do{if(r41){r43=0;while(1){r44=r1+Math.imul(r43,r36)+r39|0;r45=HEAP8[r44];r44=r37+Math.imul(r43,r20)+r39|0;HEAP8[r44]=r45;r45=r43+1|0;if((r45|0)==(r6|0)){break L141}else{r43=r45}}}}while(0);r43=r39+1|0;if((r43|0)==(r20|0)){break L138}else{r39=r43}}}}while(0);if((r1|0)!=0){_free(r1)}L149:do{if((HEAP32[r14]|0)>0){r39=0;while(1){HEAP32[HEAP32[r13]+(r39<<2)>>2]=HEAPU8[r37+r39|0];r43=r39+1|0;if((r43|0)<(HEAP32[r14]|0)){r39=r43}else{break L149}}}}while(0);_free(r37);r39=_game_text_format(r10);if((r39|0)!=0){_free(r39)}r39=HEAP32[r14];L156:do{if((r39|0)>0){r43=0;while(1){HEAP32[(r43<<2>>2)+r29]=r43;r45=r43+1|0;r44=HEAP32[r14];if((r45|0)<(r44|0)){r43=r45}else{r46=r44;break L156}}}else{r46=r39}}while(0);_shuffle(r26,r46,4,r2);r39=HEAP32[r14];L160:do{if((r39|0)>0){r43=0;r44=r39;while(1){r45=HEAP32[(r43<<2>>2)+r29];if((HEAP32[HEAP32[r16]+(r45<<2)>>2]&3|0)==0){r47=(r45|0)%(r20|0);r48=(r45|0)/(r20|0)&-1;r45=HEAP32[r24];r49=HEAP32[r25];if((r45|0)<(r49+1|0)){r50=(r45<<1)+2|0;HEAP32[r24]=r50;r45=HEAP32[r23];r51=r50<<4;if((r45|0)==0){r52=_malloc(r51)}else{r52=_realloc(r45,r51)}if((r52|0)==0){r4=125;break L136}r51=r52;HEAP32[r23]=r51;r53=HEAP32[r25];r45=r51,r54=r45>>2}else{r53=r49;r45=HEAP32[r23],r54=r45>>2}HEAP32[r25]=r53+1|0;HEAP32[(r53<<4>>2)+r54]=r47;HEAP32[((r53<<4)+4>>2)+r54]=r48;HEAP32[((r53<<4)+8>>2)+r54]=0;HEAP32[((r53<<4)+12>>2)+r54]=33864;_solver_ops_do(r10,r27);_solve_allblackbutone(r10,r27);_solver_ops_do(r10,r27);_solve_removesplits(r10,r27);_solver_ops_do(r10,r27);if((HEAP32[r8>>2]|0)!=0){break L160}r55=HEAP32[r14]}else{r55=r44}r48=r43+1|0;if((r48|0)<(r55|0)){r43=r48;r44=r55}else{r4=130;break L160}}}else{r4=130}}while(0);L176:do{if(r4==130){r4=0;r39=_game_text_format(r10);if((r39|0)!=0){_free(r39)}_memset(r31,0,r30);_memset(r34,0,r33);r39=HEAP32[r14];L181:do{if((r39|0)>0){r44=0;r43=r39;while(1){if((HEAP32[HEAP32[r16]+(r44<<2)>>2]&1|0)==0){r48=HEAP32[HEAP32[r13]+(r44<<2)>>2]-1|0;r47=(r48+Math.imul((r44|0)/(r20|0)&-1,r12)<<2)+r32|0;HEAP32[r47>>2]=HEAP32[r47>>2]+1|0;r47=(r48+Math.imul((r44|0)%(r20|0),r12)<<2)+r35|0;HEAP32[r47>>2]=HEAP32[r47>>2]+1|0;r56=HEAP32[r14]}else{r56=r43}r47=r44+1|0;if((r47|0)<(r56|0)){r44=r47;r43=r56}else{r57=1;r58=r56;break L181}}}else{r57=1;r58=r39}}while(0);while(1){L189:do{if((r58|0)>0){r39=0;r43=r58;while(1){if((HEAP32[HEAP32[r16]+(r39<<2)>>2]&1|0)==0){r59=r43}else{r44=HEAP32[r11];r47=HEAP32[r15];r48=(r39|0)%(r44|0);r45=(r39|0)/(r44|0)&-1;L194:do{if((r47|0)>0){r44=0;while(1){HEAP32[(r44<<2>>2)+r29]=r44;r49=r44+1|0;if((r49|0)==(r47|0)){break}else{r44=r49}}_shuffle(r26,r47,4,r2);r44=Math.imul(r45,r47);r49=Math.imul(r48,r47);r51=0;while(1){r50=HEAP32[(r51<<2>>2)+r29];if((HEAP32[r32+(r50+r44<<2)>>2]|0)==1){if((HEAP32[r35+(r50+r49<<2)>>2]|0)==1){r60=r50;r61=r44;r62=r49;r4=151;break L194}}r50=r51+1|0;if((r50|0)<(r47|0)){r51=r50}else{r63=r44;r64=r49;r4=142;break L194}}}else{_shuffle(r26,r47,4,r2);r63=Math.imul(r45,r47);r64=Math.imul(r48,r47);r4=142;break}}while(0);do{if(r4==142){r4=0;r49=0;while(1){if((r49|0)>=(r47|0)){r4=149;break}r65=HEAP32[(r49<<2>>2)+r29];if((HEAP32[r32+(r65+r63<<2)>>2]|0)!=0){r4=150;break}if((HEAP32[r35+(r65+r64<<2)>>2]|0)==0){r49=r49+1|0}else{r4=150;break}}if(r4==149){r4=0;___assert_func(33428,1282,35836,33784);r66=0;break}else if(r4==150){r4=0;r60=r65;r61=Math.imul(r45,r47);r62=Math.imul(r48,r47);r4=151;break}}}while(0);if(r4==151){r4=0;r47=(r60+r61<<2)+r32|0;HEAP32[r47>>2]=HEAP32[r47>>2]+1|0;r47=(r60+r62<<2)+r35|0;HEAP32[r47>>2]=HEAP32[r47>>2]+1|0;r66=r60+1|0}HEAP32[HEAP32[r13]+(r39<<2)>>2]=r66;r59=HEAP32[r14]}r47=r39+1|0;if((r47|0)<(r59|0)){r39=r47;r43=r59}else{break L189}}}}while(0);r43=_game_text_format(r10);if((r43|0)!=0){_free(r43)}if((HEAP32[r42]|0)==3){r4=164;break L136}_memcpy(HEAP32[r19],HEAP32[r13],HEAP32[r14]<<2);_memset(HEAP32[r21],0,HEAP32[r14]<<2);HEAP32[r5]=0;HEAP32[r17]=0;r43=HEAP32[r42];if((r43|0)<2){r67=r43}else{___assert_func(33428,1234,35584,33840);r67=HEAP32[r42]}r43=_solve_specific(r18,r67,0);if((HEAP32[r42]|0)>0){_memset(HEAP32[r21],0,HEAP32[r14]<<2);HEAP32[r5]=0;HEAP32[r17]=0;r68=(_solve_specific(r18,HEAP32[r42]-1|0,1)|0)>0}else{r68=0}if(!((r43|0)<1|r68)){r4=164;break L136}if((r57|0)>20){break L176}r57=r57+1|0;r58=HEAP32[r14]}}}while(0);HEAP32[r25]=0;_memset(HEAP32[r16],0,HEAP32[r14]<<2);r43=_latin_generate(r36,r2);r39=_malloc(r38);if((r39|0)==0){r4=187;break}else{r1=r43;r37=r39}}if(r4==125){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==164){r37=_malloc(HEAP32[r14]+1|0);if((r37|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}L237:do{if((HEAP32[r14]|0)>0){r1=0;while(1){r38=HEAP32[HEAP32[r13]+(r1<<2)>>2];do{if((r38|0)<10){r69=r38+48|0}else{if((r38|0)<36){r69=r38+87|0;break}else{r69=r38+29|0;break}}}while(0);r38=r1+1|0;HEAP8[r37+r1|0]=r69&255;if((r38|0)<(HEAP32[r14]|0)){r1=r38}else{r70=r38;break L237}}}else{r70=0}}while(0);HEAP8[r37+r70|0]=0;r70=HEAP32[r19];if((r70|0)!=0){_free(r70)}r70=HEAP32[r21];if((r70|0)!=0){_free(r70)}_free(r7);r7=HEAP32[r13];if((r7|0)!=0){_free(r7)}r7=HEAP32[r16];if((r7|0)!=0){_free(r7)}_free(r9);r9=HEAP32[r28>>2];if((r9|0)!=0){_free(r9)}r9=HEAP32[r23];if((r9|0)==0){_free(r22);_free(r26);_free(r31);_free(r34);STACKTOP=r3;return r37}_free(r9);_free(r22);_free(r26);_free(r31);_free(r34);STACKTOP=r3;return r37}else if(r4==187){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}function _dup_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11;r2=r1>>2;r3=STACKTOP;r4=HEAP32[r2];r5=HEAP32[r2+1];r6=_malloc(36),r7=r6>>2;if((r6|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_memset(r6,0,36);HEAP32[r7]=r4;HEAP32[r7+1]=r5;r8=Math.imul(r5,r4);r9=(r6+8|0)>>2;HEAP32[r9]=r8;HEAP32[r7+3]=(r4|0)>(r5|0)?r4:r5;r5=r6+24|0;HEAP32[r5>>2]=0;r4=r6+20|0;HEAP32[r4>>2]=0;r7=r6+16|0;HEAP32[r7>>2]=0;r10=_malloc(r8<<2);if((r10|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r8=(r6+28|0)>>2;HEAP32[r8]=r10;r10=_malloc(HEAP32[r9]<<2);if((r10|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r11=(r6+32|0)>>2;HEAP32[r11]=r10;_memset(HEAP32[r8],0,HEAP32[r9]<<2);_memset(HEAP32[r11],0,HEAP32[r9]<<2);HEAP32[r7>>2]=HEAP32[r2+4];HEAP32[r4>>2]=HEAP32[r2+5];HEAP32[r5>>2]=HEAP32[r2+6];r5=r1+8|0;_memcpy(HEAP32[r8],HEAP32[r2+7],HEAP32[r5>>2]<<2);_memcpy(HEAP32[r11],HEAP32[r2+8],HEAP32[r5>>2]<<2);STACKTOP=r3;return r6}}function _game_can_format_as_text_now(r1){return 1}function _encode_ui(r1){return 0}function _decode_ui(r1,r2){return}function _game_changed_state(r1,r2,r3){if((HEAP32[r2+16>>2]|0)!=0){return}if((HEAP32[r3+16>>2]|0)==0){return}HEAP32[r1+8>>2]=0;return}function _game_compute_size(r1,r2,r3,r4){var r5,r6;r5=((r2|0)/2&-1)<<1;r6=r5+Math.imul(HEAP32[r1>>2],r2)|0;HEAP32[r3>>2]=r6;r6=Math.imul(HEAP32[r1+4>>2],r2)+r5|0;HEAP32[r4>>2]=r6;return}function _game_set_size(r1,r2,r3,r4){HEAP32[r2>>2]=r4;return}function _free_ui(r1){if((r1|0)==0){return}_free(r1);return}function _execute_move(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+12|0;r5=r4;r6=r4+4;r7=r4+8;r8=_dup_game(r1);r9=r1|0;r10=r1+4|0;r1=r8|0;r11=(r8+32|0)>>2;r12=r8+20|0;r13=r2;while(1){r2=HEAP8[r13];if(r2<<24>>24==83){HEAP32[r12>>2]=1;r14=r13+1|0}else if(r2<<24>>24==0){r3=227;break}else if(r2<<24>>24==69|r2<<24>>24==67|r2<<24>>24==66){r15=(_sscanf(r13+1|0,33736,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r6,HEAP32[tempInt+8>>2]=r7,tempInt))|0)==2;r16=HEAP32[r5>>2];if(!(r15&(r16|0)>-1)){break}if((r16|0)>=(HEAP32[r9>>2]|0)){break}r15=HEAP32[r6>>2];if((r15|0)<=-1){break}if((r15|0)>=(HEAP32[r10>>2]|0)){break}r17=Math.imul(HEAP32[r1>>2],r15)+r16|0;r16=(r17<<2)+HEAP32[r11]|0;HEAP32[r16>>2]=HEAP32[r16>>2]&-4;if(r2<<24>>24==66){r16=(r17<<2)+HEAP32[r11]|0;HEAP32[r16>>2]=HEAP32[r16>>2]|1}else if(r2<<24>>24==67){r2=(r17<<2)+HEAP32[r11]|0;HEAP32[r2>>2]=HEAP32[r2>>2]|2}r14=r13+HEAP32[r7>>2]+1|0}else{break}r2=HEAP8[r14];if(r2<<24>>24==0){r13=r14;continue}else if(r2<<24>>24!=59){break}r13=r14+1|0}if(r3==227){if((_check_complete(r8,1)|0)==0){r18=r8;STACKTOP=r4;return r18}HEAP32[r8+16>>2]=1;r18=r8;STACKTOP=r4;return r18}r3=HEAP32[r8+28>>2];if((r3|0)!=0){_free(r3)}r3=HEAP32[r11];if((r3|0)!=0){_free(r3)}if((r8|0)==0){r18=0;STACKTOP=r4;return r18}_free(r8);r18=0;STACKTOP=r4;return r18}function _solve_game(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40;r3=STACKTOP;STACKTOP=STACKTOP+80|0;r5=r3;r6=_dup_game(r2);do{if((_solve_specific(r6,3,0)|0)>0){r7=r6,r8=r7>>2}else{r9=HEAP32[r6+28>>2];if((r9|0)!=0){_free(r9)}r9=HEAP32[r6+32>>2];if((r9|0)!=0){_free(r9)}if((r6|0)!=0){_free(r6)}r9=_dup_game(r1);if((_solve_specific(r9,3,0)|0)>0){r7=r9,r8=r7>>2;break}r10=HEAP32[r9+28>>2];if((r10|0)!=0){_free(r10)}r10=HEAP32[r9+32>>2];if((r10|0)!=0){_free(r10)}if((r9|0)!=0){_free(r9)}HEAP32[r4>>2]=33272;r11=0;STACKTOP=r3;return r11}}while(0);r4=r5|0;if((HEAP32[r2+8>>2]|0)!=(HEAP32[r8+2]|0)){___assert_func(33428,561,35792,34952)}r5=_malloc(3);if((r5|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP8[r5]=83;HEAP8[r5+1|0]=59;HEAP8[r5+2|0]=0;r1=r7|0;r6=HEAP32[r1>>2];L359:do{if((r6|0)>0){r9=r7+4|0;r10=r2+32|0;r12=r7+32|0;r13=0;r14=2;r15=r5;r16=HEAP32[r9>>2];r17=r6;r18=r6;L361:while(1){L363:do{if((r16|0)>0){r19=0;r20=r14;r21=r15;r22=r16;r23=r17;r24=r18;while(1){r25=Math.imul(r19,r23)+r13|0;r26=HEAP32[HEAP32[r12>>2]+(r25<<2)>>2];r27=r26&3;if((HEAP32[HEAP32[r10>>2]+(r25<<2)>>2]&3|0)==(r27|0)){r28=r21;r29=r20;r30=r22;r31=r24}else{if((r27|0)==3){___assert_func(33428,573,35792,34888);r32=HEAP32[HEAP32[r12>>2]+(r25<<2)>>2]}else{r32=r26}if((r32&1|0)==0){r33=(r32&2^2)+67|0}else{r33=66}r26=_sprintf(r4,34828,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r33,HEAP32[tempInt+4>>2]=r13,HEAP32[tempInt+8>>2]=r19,tempInt))+r20|0;r25=r26+1|0;if((r21|0)==0){r34=_malloc(r25)}else{r34=_realloc(r21,r25)}if((r34|0)==0){break L361}_strcpy(r34+r20|0,r4);r28=r34;r29=r26;r30=HEAP32[r9>>2];r31=HEAP32[r1>>2]}r26=r19+1|0;if((r26|0)<(r30|0)){r19=r26;r20=r29;r21=r28;r22=r30;r23=r31;r24=r31}else{r35=r29;r36=r28;r37=r30;r38=r31;r39=r31;break L363}}}else{r35=r14;r36=r15;r37=r16;r38=r17;r39=r18}}while(0);r24=r13+1|0;if((r24|0)<(r38|0)){r13=r24;r14=r35;r15=r36;r16=r37;r17=r38;r18=r39}else{r40=r36;break L359}}_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r40=r5}}while(0);r5=HEAP32[r8+7];if((r5|0)!=0){_free(r5)}r5=HEAP32[r8+8];if((r5|0)!=0){_free(r5)}if((r7|0)==0){r11=r40;STACKTOP=r3;return r11}_free(r7);r11=r40;STACKTOP=r3;return r11}function _game_text_format(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27;r2=STACKTOP;r3=(r1|0)>>2;r4=(r1+4|0)>>2;r5=Math.imul(HEAP32[r3]<<2,HEAP32[r4])|1;r6=_malloc(r5);if((r6|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}L397:do{if((HEAP32[r4]|0)>0){r7=r1+32|0;r8=r1+28|0;r9=0;r10=r6;while(1){r11=HEAP32[r3];L401:do{if((r11|0)>0){r12=0;r13=r10;r14=r11;while(1){r15=Math.imul(r14,r9)+r12|0;if((r12|0)>0){HEAP8[r13]=32;r16=r13+1|0}else{r16=r13}if((HEAP32[HEAP32[r7>>2]+(r15<<2)>>2]&1|0)==0){r17=HEAP32[HEAP32[r8>>2]+(r15<<2)>>2];do{if((r17|0)<10){r18=r17+48|0}else{if((r17|0)<36){r18=r17+87|0;break}else{r18=r17+29|0;break}}}while(0);r19=r18&255}else{r19=42}r17=r16+1|0;HEAP8[r16]=r19;r15=r12+1|0;r20=HEAP32[r3];if((r15|0)<(r20|0)){r12=r15;r13=r17;r14=r20}else{r21=r17;break L401}}}else{r21=r10}}while(0);HEAP8[r21]=10;r11=r21+1|0;r14=HEAP32[r3];L418:do{if((r14|0)>0){r13=0;r12=r21;r17=r11;r20=r14;while(1){r15=Math.imul(r20,r9)+r13|0;if((r13|0)>0){HEAP8[r17]=32;r22=r12+2|0}else{r22=r17}HEAP8[r22]=(HEAP32[HEAP32[r7>>2]+(r15<<2)>>2]&2|0)!=0?126:32;r15=r13+1|0;r23=r22+1|0;r24=HEAP32[r3];if((r15|0)<(r24|0)){r13=r15;r12=r22;r17=r23;r20=r24}else{r25=r22;r26=r23;break L418}}}else{r25=r21;r26=r11}}while(0);r11=r25+2|0;HEAP8[r26]=10;r14=r9+1|0;if((r14|0)<(HEAP32[r4]|0)){r9=r14;r10=r11}else{r27=r11;break L397}}}else{r27=r6}}while(0);HEAP8[r27]=0;if((r27+1-r6|0)==(r5|0)){STACKTOP=r2;return r6}___assert_func(33428,411,35772,33364);STACKTOP=r2;return r6}function _new_ui(r1){var r2,r3;r1=STACKTOP;r2=_malloc(16),r3=r2>>2;if((r2|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r3]=0;HEAP32[r3+1]=0;HEAP32[r3+2]=0;HEAP32[r3+3]=0;STACKTOP=r1;return r2}}function _interpret_move(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r7=r1>>2;r1=0;r8=STACKTOP;STACKTOP=STACKTOP+80|0;r9=r8;r10=HEAP32[r3>>2];r3=(r10|0)/-2&-1;r11=(r10+r4+r3|0)/(r10|0)&-1;r4=r11-1|0;r12=(r10+r5+r3|0)/(r10|0)&-1;r10=r12-1|0;if((r6-521|0)>>>0<2|(r6|0)==524|(r6|0)==523){r3=r2|0;r5=r2+4|0;r13=HEAP32[r7];r14=HEAP32[r7+1];do{if((r6|0)==524){r15=0;r16=1;r1=318;break}else if((r6|0)==521){r15=-1;r16=0;r1=318}else if((r6|0)==522){r15=1;r16=0;r1=318;break}else if((r6|0)==523){r15=0;r16=-1;r1=318;break}}while(0);if(r1==318){HEAP32[r3>>2]=(r16+r13+HEAP32[r3>>2]|0)%(r13|0);HEAP32[r5>>2]=(r15+r14+HEAP32[r5>>2]|0)%(r14|0)}HEAP32[r2+8>>2]=1;r17=34600;STACKTOP=r8;return r17}r14=(r6|0)==525;r5=(r6|0)==526;L446:do{if((r6-525|0)>>>0<2){r15=HEAP32[r2>>2];r13=HEAP32[r2+4>>2];r3=r2+8|0;if((HEAP32[r3>>2]|0)==0){HEAP32[r3>>2]=1;r18=3}else{r18=0}if(r14){r19=r13;r20=r15;r21=66;break}r22=r5?2:r18;r23=r13;r24=r15;r1=334;break}else{if((r6-512|0)>>>0>=3){r17=0;STACKTOP=r8;return r17}r15=r2+8|0;if((HEAP32[r15>>2]|0)==0){r25=0}else{HEAP32[r15>>2]=0;r25=3}do{if((r11|0)>0){if(!((r4|0)<(HEAP32[r7]|0)&(r12|0)>0)){break}if((r10|0)>=(HEAP32[r7+1]|0)){break}if((r6|0)==512){r19=r10;r20=r4;r21=66;break L446}r22=(r6|0)==514?2:r25;r23=r10;r24=r4;r1=334;break L446}}while(0);r15=r2+12|0;HEAP32[r15>>2]=1-HEAP32[r15>>2]|0;r17=34600;STACKTOP=r8;return r17}}while(0);do{if(r1==334){if((r22|0)==3){r17=34600;STACKTOP=r8;return r17}if((r22-1|0)>>>0<2){r19=r23;r20=r24;r21=67;break}else{r17=0}STACKTOP=r8;return r17}}while(0);r24=Math.imul(HEAP32[r7],r19)+r20|0;r23=r9|0;_sprintf(r23,33492,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=(HEAP32[HEAP32[r7+8]+(r24<<2)>>2]&3|0)==0?r21:69,HEAP32[tempInt+4>>2]=r20,HEAP32[tempInt+8>>2]=r19,tempInt));r19=_malloc(_strlen(r23)+1|0);if((r19|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r19,r23);r17=r19;STACKTOP=r8;return r17}function _game_colours(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r3=STACKTOP;r4=_malloc(108),r5=r4>>2;if((r4|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r6=r4;_frontend_default_colour(r1,r6);r1=HEAPF32[r6>>2];r7=r4+4|0;r8=HEAPF32[r7>>2];r9=r8>r1?r8:r1;r10=r4+8|0;r4=HEAPF32[r10>>2];r11=r4>r9?r4:r9;do{if(r11*1.2000000476837158>1){r9=1/r11;r12=r9<1.04?1.0399999618530273:r9;r9=r11*r12;if(r9<=1){r13=r12;r14=r1;r15=r8;r16=r4;break}r17=r1/r9;HEAPF32[r6>>2]=r17;r18=r8/r9;HEAPF32[r7>>2]=r18;r19=r4/r9;HEAPF32[r10>>2]=r19;r13=r12;r14=r17;r15=r18;r16=r19}else{r13=1.2000000476837158;r14=r1;r15=r8;r16=r4}}while(0);HEAPF32[r5+3]=r13*r14;r4=r14*.800000011920929;HEAPF32[r5+6]=r4;HEAPF32[r5+4]=r13*r15;r14=r15*.800000011920929;HEAPF32[r5+7]=r14;HEAPF32[r5+5]=r13*r16;r13=r16*.800000011920929;HEAPF32[r5+8]=r13;HEAPF32[r5+9]=0;HEAPF32[r5+15]=.4000000059604645;HEAPF32[r5+12]=1;HEAPF32[r5+18]=r4;HEAPF32[r5+10]=0;HEAPF32[r5+16]=.4000000059604645;HEAPF32[r5+13]=1;HEAPF32[r5+19]=r14;HEAPF32[r5+11]=0;HEAPF32[r5+17]=.4000000059604645;HEAPF32[r5+14]=1;HEAPF32[r5+20]=r13;HEAPF32[r5+21]=.20000000298023224;HEAPF32[r5+22]=.800000011920929;HEAPF32[r5+23]=0;HEAPF32[r5+24]=1;HEAPF32[r5+25]=0;HEAPF32[r5+26]=0;HEAP32[r2>>2]=9;STACKTOP=r3;return r6}function _game_anim_length(r1,r2,r3,r4){return 0}function _game_timing_state(r1,r2){return 1}function _game_flash_length(r1,r2,r3,r4){var r5;do{if((HEAP32[r1+16>>2]|0)==0){if((HEAP32[r2+16>>2]|0)==0){break}if((HEAP32[r2+20>>2]|0)==0){r5=.699999988079071}else{break}return r5}}while(0);r5=0;return r5}function _game_status(r1){return(HEAP32[r1+16>>2]|0)!=0&1}function _game_print_size(r1,r2,r3){var r4;r4=(HEAP32[r1+4>>2]*800&-1)+800|0;HEAPF32[r2>>2]=((HEAP32[r1>>2]*800&-1)+800|0)/100;HEAPF32[r3>>2]=(r4|0)/100;return}function _game_free_drawstate(r1,r2){r1=HEAP32[r2+24>>2];if((r1|0)!=0){_free(r1)}_free(r2);return}function _game_redraw(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53;r7=0;r5=STACKTOP;STACKTOP=STACKTOP+64|0;r3=r5;r9=r5+32,r10=r9>>2;r11=r8*5/.699999988079071&-1;r8=(r2+4|0)>>2;do{if((HEAP32[r8]|0)==0){r12=r2|0;r13=HEAP32[r12>>2];r14=r4|0;r15=((r13|0)/2&-1)<<1;r16=r15+Math.imul(HEAP32[r14>>2],r13)|0;r17=r4+4|0;r18=Math.imul(HEAP32[r17>>2],r13)+r15|0;r15=(r1|0)>>2;r13=(r1+4|0)>>2;FUNCTION_TABLE[HEAP32[HEAP32[r15]+4>>2]](HEAP32[r13],0,0,r16,r18,0);r19=HEAP32[r12>>2];r12=(r19|0)/2&-1;r20=r12-1|0;r21=Math.imul(HEAP32[r14>>2],r19)+r12|0;r22=Math.imul(HEAP32[r17>>2],r19)+r12|0;r12=r9|0;HEAP32[r12>>2]=r20;HEAP32[r10+1]=r20;HEAP32[r10+2]=r20;HEAP32[r10+3]=r22;HEAP32[r10+4]=r21;HEAP32[r10+5]=r22;HEAP32[r10+6]=r21;HEAP32[r10+7]=r20;FUNCTION_TABLE[HEAP32[HEAP32[r15]+12>>2]](HEAP32[r13],r12,4,-1,6);r12=HEAP32[HEAP32[r15]+20>>2];if((r12|0)==0){r23=r14;break}FUNCTION_TABLE[r12](HEAP32[r13],0,0,r16,r18);r23=r14}else{r23=r4|0}}while(0);r10=HEAP32[r23>>2];if((r10|0)<=0){HEAP32[r8]=1;STACKTOP=r5;return}r14=r4+4|0;r18=r11<<5&32;r11=r4+24|0;r16=r18|64;r13=r6+8|0;r12=r4+32|0;r15=(r2|0)>>2;r20=r4+28|0;r4=r3|0;r3=(r1|0)>>2;r21=(r1+4|0)>>2;r22=r9|0;r19=r9+4|0;r17=r9+8|0;r24=r9+12|0;r25=r9+16|0;r26=r9+20|0;r27=r9+24|0;r28=r9+28|0;r9=r2+24|0;r2=r6+12|0;r29=r6|0;r30=r6+4|0;r6=0;r31=HEAP32[r14>>2];r32=r10;while(1){L511:do{if((r31|0)>0){r10=0;r33=r31;r34=r32;while(1){r35=Math.imul(r34,r10)+r6|0;r36=(HEAP32[r11>>2]|0)==0?r18:r16;do{if((HEAP32[r13>>2]|0)==0){r37=r36}else{if((r6|0)!=(HEAP32[r29>>2]|0)){r37=r36;break}r37=(r10|0)==(HEAP32[r30>>2]|0)?r36|4:r36}}while(0);r36=HEAP32[HEAP32[r12>>2]+(r35<<2)>>2];if((r36&1|0)==0){r38=r37}else{r38=((HEAP32[r2>>2]|0)==0?1:9)|r37}r39=(r36&2|0)==0?r38:r38|2;r40=(r36&4|0)==0?r39:r39|16;do{if((HEAP32[r8]|0)==0){r7=380}else{if((HEAP32[HEAP32[r9>>2]+(r35<<2)>>2]|0)==(r40|0)){r41=r33;break}else{r7=380;break}}}while(0);if(r7==380){r7=0;r39=HEAP32[r15];r36=(r39|0)/2&-1;r42=Math.imul(r39,r6)+r36|0;r43=Math.imul(r39,r10)+r36|0;r44=HEAP32[HEAP32[r20>>2]+(r35<<2)>>2];if((r40&1|0)==0){r45=(r40&16|0)!=0?8:3;r46=r40>>>4&2;r47=1}else{r45=5;r46=(r40&16|0)!=0?8:3;r47=r40>>>3&1}r48=r36+r42|0;r49=r36+r43|0;FUNCTION_TABLE[HEAP32[HEAP32[r3]+4>>2]](HEAP32[r21],r42,r43,r39,r39,r46);r39=HEAP32[r15];r36=r42-1+r39|0;r50=r43-1+r39|0;HEAP32[r22>>2]=r42;HEAP32[r19>>2]=r43;HEAP32[r17>>2]=r42;HEAP32[r24>>2]=r50;HEAP32[r25>>2]=r36;HEAP32[r26>>2]=r50;HEAP32[r27>>2]=r36;HEAP32[r28>>2]=r43;FUNCTION_TABLE[HEAP32[HEAP32[r3]+12>>2]](HEAP32[r21],r22,4,-1,(r40>>>5&2)+6|0);if((r40&2|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r3]+16>>2]](HEAP32[r21],r48,r49,((HEAP32[r15]|0)/2&-1)-1|0,r45,r45);FUNCTION_TABLE[HEAP32[HEAP32[r3]+16>>2]](HEAP32[r21],r48,r49,((HEAP32[r15]|0)/2&-1)-2|0,r46,r45)}if((r47|0)!=0){_sprintf(r4,34512,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r44,tempInt));r44=_strlen(r4);r36=((HEAP32[r15]|0)/2&-1)-1|0;if((r44|0)==1){r51=((r36*14&-1|0)/10&-1)-1|0}else{r51=Math.floor((((r36<<1)-1|0)>>>0)/(r44>>>0))}FUNCTION_TABLE[HEAP32[HEAP32[r3]>>2]](HEAP32[r21],r48,r49,1,r51,257,r45,r4)}if((r40&4|0)!=0){_draw_rect_corners(r1,r48,r49,((((((HEAP32[r15]|0)/2&-1)*14&-1)-14|0)/10&-1)-1|0)/2&-1,7)}r49=HEAP32[r15];r48=HEAP32[HEAP32[r3]+20>>2];if((r48|0)!=0){FUNCTION_TABLE[r48](HEAP32[r21],r42,r43,r49,r49)}HEAP32[HEAP32[r9>>2]+(r35<<2)>>2]=r40;r41=HEAP32[r14>>2]}r49=r10+1|0;r43=HEAP32[r23>>2];if((r49|0)<(r41|0)){r10=r49;r33=r41;r34=r43}else{r52=r41;r53=r43;break L511}}}else{r52=r31;r53=r32}}while(0);r34=r6+1|0;if((r34|0)<(r53|0)){r6=r34;r31=r52;r32=r53}else{break}}HEAP32[r8]=1;STACKTOP=r5;return}function _game_print(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36;r4=STACKTOP;STACKTOP=STACKTOP+64|0;r5=r4;r6=_print_mono_colour(r1,0);r7=_print_mono_colour(r1,1);r8=(r1|0)>>2;r9=HEAP32[HEAP32[r8]+84>>2];r10=(r1+4|0)>>2;r11=HEAP32[r10];r12=((r3<<1|0)/40&-1|0)*Math.sqrt(HEAPF32[r1+20>>2]);FUNCTION_TABLE[r9](r11,r12);r12=r2|0;r11=HEAP32[r12>>2];if((r11|0)<=0){STACKTOP=r4;return}r9=r2+4|0;r1=(r3|0)/2&-1;r13=r2+32|0;r14=r3-1|0;r15=r5|0;r16=r5+4|0;r17=r5+8|0;r18=r5+12|0;r19=r5+16|0;r20=r5+20|0;r21=r5+24|0;r22=r5+28|0;r5=r4+32|0;r23=r2+28|0;r2=(((r1*14&-1)-14|0)/10&-1)-1|0;r24=r1-1|0;r25=0;r26=HEAP32[r9>>2];r27=r11;while(1){L554:do{if((r26|0)>0){r11=r1+Math.imul(r25,r3)|0;r28=r14+r11|0;r29=r11+r1|0;r30=0;r31=r27;while(1){r32=r1+Math.imul(r30,r3)|0;r33=Math.imul(r31,r30)+r25|0;if((HEAP32[HEAP32[r13>>2]+(r33<<2)>>2]&1|0)==0){r34=r14+r32|0;HEAP32[r15>>2]=r11;HEAP32[r16>>2]=r32;HEAP32[r17>>2]=r11;HEAP32[r18>>2]=r34;HEAP32[r19>>2]=r28;HEAP32[r20>>2]=r34;HEAP32[r21>>2]=r28;HEAP32[r22>>2]=r32;FUNCTION_TABLE[HEAP32[HEAP32[r8]+12>>2]](HEAP32[r10],r15,4,-1,r6);r34=r32+r1|0;if((HEAP32[HEAP32[r13>>2]+(r33<<2)>>2]&2|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r8]+16>>2]](HEAP32[r10],r29,r34,r24,r7,r6)}_sprintf(r5,34512,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r23>>2]+(r33<<2)>>2],tempInt));r33=Math.floor((r2>>>0)/(_strlen(r5)>>>0));FUNCTION_TABLE[HEAP32[HEAP32[r8]>>2]](HEAP32[r10],r29,r34,1,r33,257,r6,r5)}else{FUNCTION_TABLE[HEAP32[HEAP32[r8]+4>>2]](HEAP32[r10],r11,r32,r3,r3,r6)}r32=r30+1|0;r33=HEAP32[r9>>2];r34=HEAP32[r12>>2];if((r32|0)<(r33|0)){r30=r32;r31=r34}else{r35=r33;r36=r34;break L554}}}else{r35=r26;r36=r27}}while(0);r31=r25+1|0;if((r31|0)<(r36|0)){r25=r31;r26=r35;r27=r36}else{break}}STACKTOP=r4;return}function _game_new_drawstate(r1,r2){var r3,r4,r5;r1=STACKTOP;r3=_malloc(28),r4=r3>>2;if((r3|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4+2]=0;HEAP32[r4+1]=0;HEAP32[r4]=0;HEAP32[r4+3]=HEAP32[r2>>2];HEAP32[r4+4]=HEAP32[r2+4>>2];r5=(r2+8|0)>>2;HEAP32[r4+5]=HEAP32[r5];r2=_malloc(HEAP32[r5]<<2);if((r2|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r4+6]=r2;_memset(r2,0,HEAP32[r5]<<2);STACKTOP=r1;return r3}}function _check_complete(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82;r3=0;r4=STACKTOP;r5=(r1+8|0)>>2;r6=_malloc(HEAP32[r5]<<2);if((r6|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r7=r6,r8=r7>>2;r9=(r1|0)>>2;r10=HEAP32[r9];r11=(r1+4|0)>>2;r12=HEAP32[r11];r13=r2&1;r14=(r13|0)!=0;r15=HEAP32[r5];L578:do{if(r14){if((r15|0)<=0){break}r16=r1+32|0;r17=0;while(1){r18=(r17<<2)+HEAP32[r16>>2]|0;HEAP32[r18>>2]=HEAP32[r18>>2]&-5;r18=r17+1|0;r19=HEAP32[r5];if((r18|0)<(r19|0)){r17=r18}else{r20=r19;r3=425;break L578}}}else{r20=r15;r3=425}}while(0);L583:do{if(r3==425){if((r20|0)>0){r21=0}else{break}while(1){HEAP32[(r21<<2>>2)+r8]=6;r15=r21+1|0;if((r15|0)==(r20|0)){break L583}else{r21=r15}}}}while(0);r21=HEAP32[r9];L588:do{if((r21|0)>0){r20=r1+32|0;r15=0;r17=HEAP32[r11];r16=r21;while(1){L592:do{if((r17|0)>0){r19=0;r18=r17;r22=r16;while(1){r23=Math.imul(r19,r22)+r15|0;do{if((r15|0)<(r22-1|0)){r24=r23+1|0;r25=HEAP32[r20>>2];if(((HEAP32[r25+(r24<<2)>>2]^HEAP32[r25+(r23<<2)>>2])&1|0)!=0){r26=r18;break}if((r23|0)<=-1){___assert_func(33480,110,35820,34588)}r25=(r23<<2)+r7|0;r27=HEAP32[r25>>2];do{if((r27&2|0)==0){r28=0;r29=r27;while(1){r30=r29&1^r28;r31=r29>>2;r32=HEAP32[(r31<<2>>2)+r8];if((r32&2|0)==0){r28=r30;r29=r32}else{break}}L605:do{if((r31|0)==(r23|0)){r33=r30;r34=r23}else{r29=r31<<2;r28=r27>>2;r32=r30^r27&1;HEAP32[r25>>2]=r30|r29;if((r28|0)==(r31|0)){r33=r32;r34=r31;break}else{r35=r28;r36=r32}while(1){r32=(r35<<2)+r7|0;r28=HEAP32[r32>>2];r37=r28>>2;r38=r28&1^r36;HEAP32[r32>>2]=r36|r29;if((r37|0)==(r31|0)){r33=r38;r34=r31;break L605}else{r35=r37;r36=r38}}}}while(0);if((r33|0)==0){r39=r34;break}___assert_func(33480,137,35820,34264);r39=r34}else{r39=r23}}while(0);if((r24|0)<=-1){___assert_func(33480,110,35820,34588)}r25=(r24<<2)+r7|0;r27=HEAP32[r25>>2];do{if((r27&2|0)==0){r29=0;r38=r27;while(1){r40=r38&1^r29;r41=r38>>2;r37=HEAP32[(r41<<2>>2)+r8];if((r37&2|0)==0){r29=r40;r38=r37}else{break}}L619:do{if((r41|0)==(r24|0)){r42=r40;r43=r24}else{r38=r41<<2;r29=r27>>2;r37=r40^r27&1;HEAP32[r25>>2]=r40|r38;if((r29|0)==(r41|0)){r42=r37;r43=r41;break}else{r44=r29;r45=r37}while(1){r37=(r44<<2)+r7|0;r29=HEAP32[r37>>2];r32=r29>>2;r28=r29&1^r45;HEAP32[r37>>2]=r45|r38;if((r32|0)==(r41|0)){r42=r28;r43=r41;break L619}else{r44=r32;r45=r28}}}}while(0);if((r42|0)==0){r46=r43;break}___assert_func(33480,137,35820,34264);r46=r43}else{r46=r24}}while(0);_edsf_merge(r7,r39,r46,0);r26=HEAP32[r11]}else{r26=r18}}while(0);do{if((r19|0)<(r26-1|0)){r24=HEAP32[r9]+r23|0;r25=HEAP32[r20>>2];if(((HEAP32[r25+(r24<<2)>>2]^HEAP32[r25+(r23<<2)>>2])&1|0)!=0){r47=r26;break}if((r23|0)<=-1){___assert_func(33480,110,35820,34588)}r25=(r23<<2)+r7|0;r27=HEAP32[r25>>2];do{if((r27&2|0)==0){r38=0;r28=r27;while(1){r48=r28&1^r38;r49=r28>>2;r32=HEAP32[(r49<<2>>2)+r8];if((r32&2|0)==0){r38=r48;r28=r32}else{break}}L637:do{if((r49|0)==(r23|0)){r50=r48;r51=r23}else{r28=r49<<2;r38=r27>>2;r32=r48^r27&1;HEAP32[r25>>2]=r48|r28;if((r38|0)==(r49|0)){r50=r32;r51=r49;break}else{r52=r38;r53=r32}while(1){r32=(r52<<2)+r7|0;r38=HEAP32[r32>>2];r37=r38>>2;r29=r38&1^r53;HEAP32[r32>>2]=r53|r28;if((r37|0)==(r49|0)){r50=r29;r51=r49;break L637}else{r52=r37;r53=r29}}}}while(0);if((r50|0)==0){r54=r51;break}___assert_func(33480,137,35820,34264);r54=r51}else{r54=r23}}while(0);if((r24|0)<=-1){___assert_func(33480,110,35820,34588)}r25=(r24<<2)+r7|0;r27=HEAP32[r25>>2];do{if((r27&2|0)==0){r28=0;r29=r27;while(1){r55=r29&1^r28;r56=r29>>2;r37=HEAP32[(r56<<2>>2)+r8];if((r37&2|0)==0){r28=r55;r29=r37}else{break}}L651:do{if((r56|0)==(r24|0)){r57=r55;r58=r24}else{r29=r56<<2;r28=r27>>2;r37=r55^r27&1;HEAP32[r25>>2]=r55|r29;if((r28|0)==(r56|0)){r57=r37;r58=r56;break}else{r59=r28;r60=r37}while(1){r37=(r59<<2)+r7|0;r28=HEAP32[r37>>2];r32=r28>>2;r38=r28&1^r60;HEAP32[r37>>2]=r60|r29;if((r32|0)==(r56|0)){r57=r38;r58=r56;break L651}else{r59=r32;r60=r38}}}}while(0);if((r57|0)==0){r61=r58;break}___assert_func(33480,137,35820,34264);r61=r58}else{r61=r24}}while(0);_edsf_merge(r7,r54,r61,0);r47=HEAP32[r11]}else{r47=r26}}while(0);r23=r19+1|0;r24=HEAP32[r9];if((r23|0)<(r47|0)){r19=r23;r18=r47;r22=r24}else{r62=r47;r63=r24;break L592}}}else{r62=r17;r63=r16}}while(0);r22=r15+1|0;if((r22|0)<(r63|0)){r15=r22;r17=r62;r16=r63}else{break L588}}}}while(0);r63=HEAP32[r5];L661:do{if((r2&2|0)==0){r64=0;r3=477}else{if((r63|0)<=0){r65=0;r66=0;break}r62=HEAP32[r1+32>>2];r47=0;r9=0;while(1){r26=((HEAP32[r62+(r47<<2)>>2]&3|0)==0&1)+r9|0;r11=r47+1|0;if((r11|0)<(r63|0)){r47=r11;r9=r26}else{r64=r26;r3=477;break L661}}}}while(0);L666:do{if(r3==477){if((r63|0)<=0){r65=r64;r66=0;break}r2=r1+32|0;r9=0;r47=r64;r62=0;while(1){do{if((HEAP32[HEAP32[r2>>2]+(r9<<2)>>2]&1|0)==0){r67=r62+1|0;r68=r47}else{if((_dsf_size(r7,r9)|0)<=1){r67=r62;r68=r47;break}r26=r47+1|0;if(!r14){r67=r62;r68=r26;break}r11=(r9<<2)+HEAP32[r2>>2]|0;HEAP32[r11>>2]=HEAP32[r11>>2]|4;r67=r62;r68=r26}}while(0);r26=r9+1|0;if((r26|0)<(HEAP32[r5]|0)){r9=r26;r47=r68;r62=r67}else{r65=r68;r66=r67;break L666}}}}while(0);r67=(r10|0)>0;L678:do{if(r67){r68=(r12|0)>0;r64=(r1+32|0)>>2;r63=r1+28|0;r3=(r13|0)==0;r62=r65;r47=0;while(1){L682:do{if(r68){r9=0;r2=1;r26=r47;while(1){r11=HEAP32[r64];L685:do{if((HEAP32[r11+(r26<<2)>>2]&1|0)==0&(r2|0)<(r12|0)){r61=r9;r54=r26;r58=r2;r57=r11;while(1){r60=r54;r59=r58;while(1){r69=r60+r10|0;r70=HEAP32[r57+(r69<<2)>>2];if((r70&1|0)==0){r56=HEAP32[r63>>2];if((HEAP32[r56+(r26<<2)>>2]|0)==(HEAP32[r56+(r69<<2)>>2]|0)){break}}r56=r59+1|0;if((r56|0)<(r12|0)){r60=r69;r59=r56}else{r71=r61;break L685}}r60=r61+1|0;do{if(!r3){r56=(r26<<2)+r57|0;r55=HEAP32[r56>>2];if((r55&2|0)==0){break}if((r70&2|0)==0){break}HEAP32[r56>>2]=r55|4;r55=(r69<<2)+HEAP32[r64]|0;HEAP32[r55>>2]=HEAP32[r55>>2]|4}}while(0);r55=r59+1|0;if((r55|0)>=(r12|0)){r71=r60;break L685}r61=r60;r54=r69;r58=r55;r57=HEAP32[r64]}}else{r71=r9}}while(0);if((r2|0)==(r12|0)){r72=r71;break L682}r9=r71;r2=r2+1|0;r26=r26+r10|0}}else{r72=0}}while(0);r26=r72+r62|0;r2=r47+1|0;if((r2|0)==(r10|0)){r73=r26;break L678}else{r62=r26;r47=r2}}}else{r73=r65}}while(0);L704:do{if((r12|0)>0){r65=(r1+32|0)>>2;r72=r1+28|0;r71=(r13|0)==0;r69=r73;r70=0;while(1){L708:do{if(r67){r47=0;r62=1;r64=Math.imul(r70,r10);while(1){r3=HEAP32[r65];L712:do{if((HEAP32[r3+(r64<<2)>>2]&1|0)==0&(r62|0)<(r10|0)){r63=r47;r68=r64;r2=r62;r26=r3;while(1){r9=r68;r11=r2;while(1){r74=r9+1|0;r75=HEAP32[r26+(r74<<2)>>2];if((r75&1|0)==0){r57=HEAP32[r72>>2];if((HEAP32[r57+(r64<<2)>>2]|0)==(HEAP32[r57+(r74<<2)>>2]|0)){break}}r57=r11+1|0;if((r57|0)<(r10|0)){r9=r74;r11=r57}else{r76=r63;break L712}}r9=r63+1|0;do{if(!r71){r60=(r64<<2)+r26|0;r59=HEAP32[r60>>2];if((r59&2|0)==0){break}if((r75&2|0)==0){break}HEAP32[r60>>2]=r59|4;r59=(r74<<2)+HEAP32[r65]|0;HEAP32[r59>>2]=HEAP32[r59>>2]|4}}while(0);r59=r11+1|0;if((r59|0)>=(r10|0)){r76=r9;break L712}r63=r9;r68=r74;r2=r59;r26=HEAP32[r65]}}else{r76=r47}}while(0);if((r62|0)==(r10|0)){r77=r76;break L708}r47=r76;r62=r62+1|0;r64=r64+1|0}}else{r77=0}}while(0);r64=r77+r69|0;r62=r70+1|0;if((r62|0)==(r12|0)){r78=r64;break L704}else{r69=r64;r70=r62}}}else{r78=r73}}while(0);if((HEAP32[r5]|0)<=0){r79=r78;_free(r6);r80=(r79|0)<1;r81=r80&1;STACKTOP=r4;return r81}r73=r1+32|0;r1=0;r12=r78;while(1){do{if((HEAP32[HEAP32[r73>>2]+(r1<<2)>>2]&1|0)==0){if((_dsf_size(r7,r1)|0)>=(r66|0)){r82=r12;break}r78=r12+1|0;if(!r14){r82=r78;break}r77=(r1<<2)+HEAP32[r73>>2]|0;HEAP32[r77>>2]=HEAP32[r77>>2]|4;r82=r78}else{r82=r12}}while(0);r78=r1+1|0;if((r78|0)<(HEAP32[r5]|0)){r1=r78;r12=r82}else{r79=r82;break}}_free(r6);r80=(r79|0)<1;r81=r80&1;STACKTOP=r4;return r81}function _solve_specific(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94;r4=0;r5=STACKTOP;r6=_malloc(16);if((r6|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r7=r6>>2;HEAP32[r7]=0;r8=(r6+8|0)>>2;HEAP32[r8]=0;r9=(r6+4|0)>>2;HEAP32[r9]=0;r10=(r1+8|0)>>2;r11=_malloc(HEAP32[r10]<<2);if((r11|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r12=r6;r13=r6+12|0;HEAP32[r13>>2]=r11;L749:do{if((r3|0)==0){r11=r1|0,r14=r11>>2}else{r15=HEAP32[r10];L752:do{if((r15|0)>0){r16=r1+32|0;r17=0;while(1){r18=(r17<<2)+HEAP32[r16>>2]|0;HEAP32[r18>>2]=HEAP32[r18>>2]&-9;r18=r17+1|0;r19=HEAP32[r10];if((r18|0)<(r19|0)){r17=r18}else{r20=r19;break L752}}}else{r20=r15}}while(0);r15=r1|0,r17=r15>>2;r16=HEAP32[r17];if((r16|0)>0){r19=(r1+4|0)>>2;r18=r1+28|0;r21=(r1+32|0)>>2;r22=0;r23=HEAP32[r19];r24=r16;r25=r16;while(1){L761:do{if((r23|0)>0){r16=0;r26=r23;r27=r24;r28=r25;while(1){r29=Math.imul(r16,r27)+r22|0;if((r22|0)<(r27|0)){r30=r22;r31=r27;r32=r28;while(1){r33=Math.imul(r31,r16)+r30|0;do{if((r29|0)==(r33|0)){r34=r31;r35=r32}else{r36=HEAP32[r18>>2];if((HEAP32[r36+(r29<<2)>>2]|0)!=(HEAP32[r36+(r33<<2)>>2]|0)){r34=r31;r35=r32;break}r36=(r29<<2)+HEAP32[r21]|0;HEAP32[r36>>2]=HEAP32[r36>>2]|8;r36=(r33<<2)+HEAP32[r21]|0;HEAP32[r36>>2]=HEAP32[r36>>2]|8;r36=HEAP32[r17];r34=r36;r35=r36}}while(0);r33=r30+1|0;if((r33|0)<(r34|0)){r30=r33;r31=r34;r32=r35}else{break}}r37=HEAP32[r19];r38=r34;r39=r35}else{r37=r26;r38=r27;r39=r28}L773:do{if((r16|0)<(r37|0)){r32=r16;r31=r37;r30=r38;while(1){r33=Math.imul(r32,r30)+r22|0;do{if((r29|0)==(r33|0)){r40=r31}else{r36=HEAP32[r18>>2];if((HEAP32[r36+(r29<<2)>>2]|0)!=(HEAP32[r36+(r33<<2)>>2]|0)){r40=r31;break}r36=(r29<<2)+HEAP32[r21]|0;HEAP32[r36>>2]=HEAP32[r36>>2]|8;r36=(r33<<2)+HEAP32[r21]|0;HEAP32[r36>>2]=HEAP32[r36>>2]|8;r40=HEAP32[r19]}}while(0);r33=r32+1|0;r36=HEAP32[r17];if((r33|0)<(r40|0)){r32=r33;r31=r40;r30=r36}else{r41=r40;r42=r36;break L773}}}else{r41=r37;r42=r39}}while(0);r29=r16+1|0;if((r29|0)<(r41|0)){r16=r29;r26=r41;r27=r42;r28=r42}else{r43=r41;r44=r42;r45=r42;break L761}}}else{r43=r23;r44=r24;r45=r25}}while(0);r28=r22+1|0;if((r28|0)<(r44|0)){r22=r28;r23=r43;r24=r44;r25=r45}else{break}}r46=HEAP32[r10]}else{r46=r20}if((r46|0)<=0){r11=r15,r14=r11>>2;break}r25=r1+32|0;r24=0;while(1){r23=(r24<<2)+HEAP32[r25>>2]|0;r22=HEAP32[r23>>2];if((r22&8|0)==0){r19=HEAP32[r17];r21=(r24|0)%(r19|0);r18=(r24|0)/(r19|0)&-1;r19=HEAP32[r8];r28=HEAP32[r9];if((r19|0)<(r28+1|0)){r27=(r19<<1)+2|0;HEAP32[r8]=r27;r19=HEAP32[r7];r26=r27<<4;if((r19|0)==0){r47=_malloc(r26)}else{r47=_realloc(r19,r26)}if((r47|0)==0){break}r26=r47;HEAP32[r7]=r26;r48=HEAP32[r9];r19=r26,r49=r19>>2}else{r48=r28;r19=HEAP32[r7],r49=r19>>2}HEAP32[r9]=r48+1|0;HEAP32[(r48<<4>>2)+r49]=r21;HEAP32[((r48<<4)+4>>2)+r49]=r18;HEAP32[((r48<<4)+8>>2)+r49]=1;HEAP32[((r48<<4)+12>>2)+r49]=34148}else{HEAP32[r23>>2]=r22&-9}r22=r24+1|0;if((r22|0)<(HEAP32[r10]|0)){r24=r22}else{r11=r15,r14=r11>>2;break L749}}_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}while(0);r10=HEAP32[r14];r49=(r1+4|0)>>2;L802:do{if((r10|0)>0){r48=r1+28|0;r47=r1+32|0;r46=0;r20=HEAP32[r49];r45=r10;r44=r10;L805:while(1){r43=r46+1|0;L807:do{if((r20|0)>0){r42=0;r41=r20;r39=r45;r37=r44;while(1){r40=Math.imul(r42,r39)+r46|0;r38=r40+1|0;do{if((r46|0)<(r39-2|0)){r35=HEAP32[r48>>2];if((HEAP32[r35+(r40<<2)>>2]|0)!=(HEAP32[r35+(r40+2<<2)>>2]|0)){r50=r39;r51=r41;r52=r37;break}if((HEAP32[HEAP32[r47>>2]+(r38<<2)>>2]&2|0)!=0){r50=r39;r51=r41;r52=r37;break}r35=HEAP32[r8];r34=HEAP32[r9];if((r35|0)<(r34+1|0)){r3=(r35<<1)+2|0;HEAP32[r8]=r3;r35=HEAP32[r7];r11=r3<<4;if((r35|0)==0){r53=_malloc(r11)}else{r53=_realloc(r35,r11)}if((r53|0)==0){r4=584;break L805}r11=r53;HEAP32[r7]=r11;r54=HEAP32[r9];r35=r11,r55=r35>>2}else{r54=r34;r35=HEAP32[r7],r55=r35>>2}HEAP32[r9]=r54+1|0;HEAP32[(r54<<4>>2)+r55]=r43;HEAP32[((r54<<4)+4>>2)+r55]=r42;HEAP32[((r54<<4)+8>>2)+r55]=1;HEAP32[((r54<<4)+12>>2)+r55]=34196;r35=HEAP32[r14];r50=r35;r51=HEAP32[r49];r52=r35}else{r50=r39;r51=r41;r52=r37}}while(0);r38=r50+r40|0;do{if((r42|0)<(r51-2|0)){r35=HEAP32[r48>>2];if((HEAP32[r35+(r40<<2)>>2]|0)!=(HEAP32[r35+(r38+r50<<2)>>2]|0)){r56=r51;r57=r52;break}if((HEAP32[HEAP32[r47>>2]+(r38<<2)>>2]&2|0)!=0){r56=r51;r57=r52;break}r35=r42+1|0;r34=HEAP32[r8];r11=HEAP32[r9];if((r34|0)<(r11+1|0)){r3=(r34<<1)+2|0;HEAP32[r8]=r3;r34=HEAP32[r7];r15=r3<<4;if((r34|0)==0){r58=_malloc(r15)}else{r58=_realloc(r34,r15)}if((r58|0)==0){r4=596;break L805}r15=r58;HEAP32[r7]=r15;r59=HEAP32[r9];r34=r15,r60=r34>>2}else{r59=r11;r34=HEAP32[r7],r60=r34>>2}HEAP32[r9]=r59+1|0;HEAP32[(r59<<4>>2)+r60]=r46;HEAP32[((r59<<4)+4>>2)+r60]=r35;HEAP32[((r59<<4)+8>>2)+r60]=1;HEAP32[((r59<<4)+12>>2)+r60]=34196;r56=HEAP32[r49];r57=HEAP32[r14]}else{r56=r51;r57=r52}}while(0);r38=r42+1|0;if((r38|0)<(r56|0)){r42=r38;r41=r56;r39=r57;r37=r57}else{r61=r56;r62=r57;r63=r57;break L807}}}else{r61=r20;r62=r45;r63=r44}}while(0);if((r43|0)<(r62|0)){r46=r43;r20=r61;r45=r62;r44=r63}else{r64=r63;r65=r61;break L802}}if(r4==596){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==584){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}else{r64=r10;r65=HEAP32[r49]}}while(0);r49=(r1+4|0)>>2;L843:do{if((r65|0)>0){r10=(r1+32|0)>>2;r61=(r1+28|0)>>2;r63=0;r62=0;r57=r64;r56=r65;L845:while(1){r52=r63+1|0;if((r57|0)>0){r51=r62;r60=0;r59=r57;while(1){if((r51|0)!=(Math.imul(r59,r63)+r60|0)){___assert_func(33428,773,35532,34700)}r58=HEAP32[r10];r66=r51+1|0;L853:do{if((HEAP32[r58+(r51<<2)>>2]&1|0)==0){r50=HEAP32[r14];L855:do{if((r60|0)<(r50-1|0)){if((HEAP32[r58+(r66<<2)>>2]&1|0)!=0){r67=r50;break}r55=HEAP32[r61];if(!((HEAP32[r55+(r51<<2)>>2]|0)==(HEAP32[r55+(r66<<2)>>2]|0)&(r50|0)>0)){r67=r50;break}r55=r60+1|0;r54=0;r53=r50;while(1){do{if((r54|0)==(r60|0)|(r54|0)==(r55|0)){r68=r53}else{r44=Math.imul(r53,r63)+r54|0;r45=HEAP32[r61];if((HEAP32[r45+(r44<<2)>>2]|0)!=(HEAP32[r45+(r51<<2)>>2]|0)){r68=r53;break}if((HEAP32[HEAP32[r10]+(r44<<2)>>2]&1|0)!=0){r68=r53;break}r44=HEAP32[r8];r45=HEAP32[r9];if((r44|0)<(r45+1|0)){r20=(r44<<1)+2|0;HEAP32[r8]=r20;r44=HEAP32[r7];r46=r20<<4;if((r44|0)==0){r69=_malloc(r46)}else{r69=_realloc(r44,r46)}if((r69|0)==0){r4=620;break L845}r46=r69;HEAP32[r7]=r46;r70=HEAP32[r9];r44=r46,r71=r44>>2}else{r70=r45;r44=HEAP32[r7],r71=r44>>2}HEAP32[r9]=r70+1|0;HEAP32[(r70<<4>>2)+r71]=r54;HEAP32[((r70<<4)+4>>2)+r71]=r63;HEAP32[((r70<<4)+8>>2)+r71]=0;HEAP32[((r70<<4)+12>>2)+r71]=34280;r68=HEAP32[r14]}}while(0);r44=r54+1|0;if((r44|0)<(r68|0)){r54=r44;r53=r68}else{r67=r68;break L855}}}else{r67=r50}}while(0);r50=r67+r51|0;r53=HEAP32[r49];if((r63|0)>=(r53-1|0)){break}if((HEAP32[HEAP32[r10]+(r50<<2)>>2]&1|0)!=0){break}r54=HEAP32[r61];if((HEAP32[r54+(r51<<2)>>2]|0)==(HEAP32[r54+(r50<<2)>>2]|0)&(r53|0)>0){r72=0;r73=r53}else{break}while(1){do{if((r72|0)==(r63|0)|(r72|0)==(r52|0)){r74=r73}else{r53=Math.imul(HEAP32[r14],r72)+r60|0;r50=HEAP32[r61];if((HEAP32[r50+(r53<<2)>>2]|0)!=(HEAP32[r50+(r51<<2)>>2]|0)){r74=r73;break}if((HEAP32[HEAP32[r10]+(r53<<2)>>2]&1|0)!=0){r74=r73;break}r53=HEAP32[r8];r50=HEAP32[r9];if((r53|0)<(r50+1|0)){r54=(r53<<1)+2|0;HEAP32[r8]=r54;r53=HEAP32[r7];r55=r54<<4;if((r53|0)==0){r75=_malloc(r55)}else{r75=_realloc(r53,r55)}if((r75|0)==0){r4=636;break L845}r55=r75;HEAP32[r7]=r55;r76=HEAP32[r9];r53=r55,r77=r53>>2}else{r76=r50;r53=HEAP32[r7],r77=r53>>2}HEAP32[r9]=r76+1|0;HEAP32[(r76<<4>>2)+r77]=r60;HEAP32[((r76<<4)+4>>2)+r77]=r72;HEAP32[((r76<<4)+8>>2)+r77]=0;HEAP32[((r76<<4)+12>>2)+r77]=34240;r74=HEAP32[r49]}}while(0);r53=r72+1|0;if((r53|0)<(r74|0)){r72=r53;r73=r74}else{break L853}}}}while(0);r58=r60+1|0;r78=HEAP32[r14];if((r58|0)<(r78|0)){r51=r66;r60=r58;r59=r78}else{break}}r79=r66;r80=r78;r81=HEAP32[r49]}else{r79=r62;r80=r57;r81=r56}if((r52|0)<(r81|0)){r63=r52;r62=r79;r57=r80;r56=r81}else{break L843}}if(r4==636){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==620){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}}while(0);_solve_corner(r1,r12,0,0,1,1);_solve_corner(r1,r12,HEAP32[r14]-1|0,0,-1,1);_solve_corner(r1,r12,HEAP32[r14]-1|0,HEAP32[r49]-1|0,-1,-1);_solve_corner(r1,r12,0,HEAP32[r49]-1|0,1,-1);r4=(r2|0)>0;L901:do{if(r4){r2=HEAP32[r14];L903:do{if((r2-1|0)>0){r81=r1+28|0;r80=0;r79=HEAP32[r49];r78=r2;r66=r2;while(1){L908:do{if((r79|0)>0){r74=0;r73=r79;r72=r78;r77=r66;while(1){r76=Math.imul(r74,r72)+r80|0;r75=HEAP32[r81>>2];r8=HEAP32[r75+(r76<<2)>>2];r76=r74+1|0;L911:do{if((r76|0)<(r73|0)){r67=r76;r68=r73;r71=r72;r70=r75;while(1){r69=(Math.imul(r67,r71)+r80<<2)+r70|0;if((r8|0)==(HEAP32[r69>>2]|0)){_solve_offsetpair_pair(r1,r12,r80,r74,r80,r67);_solve_offsetpair_pair(r1,r12,r80,r67,r80,r74);r82=HEAP32[r49]}else{r82=r68}r69=r67+1|0;r65=HEAP32[r14];if((r69|0)>=(r82|0)){r83=r82;r84=r65;break L911}r67=r69;r68=r82;r71=r65;r70=HEAP32[r81>>2]}}else{r83=r73;r84=r77}}while(0);if((r76|0)<(r83|0)){r74=r76;r73=r83;r72=r84;r77=r84}else{r85=r83;r86=r84;r87=r84;break L908}}}else{r85=r79;r86=r78;r87=r66}}while(0);r77=r80+1|0;if((r77|0)<(r86-1|0)){r80=r77;r79=r85;r78=r86;r66=r87}else{r88=r86;r89=r85;break L903}}}else{r88=r2;r89=HEAP32[r49]}}while(0);if((r89-1|0)<=0){break}r2=r1+28|0;r66=0;r78=r88;r79=r89;while(1){if((r78|0)>0){r80=0;r81=r78;while(1){r52=Math.imul(r81,r66)+r80|0;r77=HEAP32[r2>>2];r72=HEAP32[r77+(r52<<2)>>2];r52=r80+1|0;L927:do{if((r52|0)<(r81|0)){r73=r52;r74=r81;r8=r77;while(1){r75=(Math.imul(r74,r66)+r73<<2)+r8|0;if((r72|0)==(HEAP32[r75>>2]|0)){_solve_offsetpair_pair(r1,r12,r80,r66,r73,r66);_solve_offsetpair_pair(r1,r12,r73,r66,r80,r66);r90=HEAP32[r14]}else{r90=r74}r75=r73+1|0;if((r75|0)>=(r90|0)){r91=r90;break L927}r73=r75;r74=r90;r8=HEAP32[r2>>2]}}else{r91=r81}}while(0);if((r52|0)<(r91|0)){r80=r52;r81=r91}else{break}}r92=r91;r93=HEAP32[r49]}else{r92=r78;r93=r79}r81=r66+1|0;if((r81|0)<(r93-1|0)){r66=r81;r78=r92;r79=r93}else{break L901}}}}while(0);r93=(r1+24|0)>>2;r92=r4^1;while(1){if((HEAP32[r9]|0)>0){_solver_ops_do(r1,r12)}if((HEAP32[r93]|0)!=0){break}if((_solve_allblackbutone(r1,r12)|0)>0){continue}if((HEAP32[r93]|0)!=0|r92){break}if((_solve_removesplits(r1,r12)|0)<=0){break}}r12=HEAP32[r13>>2];if((r12|0)!=0){_free(r12)}r12=HEAP32[r7];if((r12|0)!=0){_free(r12)}_free(r6);if((HEAP32[r93]|0)!=0){r94=-1;STACKTOP=r5;return r94}r94=_check_complete(r1,2);STACKTOP=r5;return r94}function _solver_ops_do(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52;r3=0;r4=STACKTOP;r5=(r2+4|0)>>2;L958:do{if((HEAP32[r5]|0)>0){r6=(r2|0)>>2;r7=(r1|0)>>2;r8=(r1+32|0)>>2;r9=(r1+4|0)>>2;r10=(r2+8|0)>>2;r11=(r1+24|0)>>2;r12=r1+28|0;r13=0;L960:while(1){r14=r13+1|0;r15=HEAP32[r6]>>2;r16=HEAP32[(r13<<4>>2)+r15];r17=HEAP32[((r13<<4)+4>>2)+r15];r18=HEAP32[((r13<<4)+8>>2)+r15];r15=Math.imul(HEAP32[r7],r17)+r16|0;r19=((r15<<2)+HEAP32[r8]|0)>>2;r20=HEAP32[r19];L962:do{if((r18|0)==0){if((r20&2|0)!=0){r3=686;break L960}if((r20&1|0)!=0){break}HEAP32[r19]=r20|1;r21=r16-1|0;r22=HEAP32[r7];r23=Math.imul(r22,r17)+r21|0;r24=(r17|0)>-1;do{if((r16|0)>0&(r22|0)>(r21|0)&r24){if((HEAP32[r9]|0)<=(r17|0)){r25=r22;break}r26=HEAP32[HEAP32[r8]+(r23<<2)>>2];if((r26&1|0)!=0){HEAP32[r11]=1;r25=r22;break}if((r26&2|0)!=0){r25=r22;break}r26=HEAP32[r10];r27=HEAP32[r5];if((r26|0)<(r27+1|0)){r28=(r26<<1)+2|0;HEAP32[r10]=r28;r26=HEAP32[r6];r29=r28<<4;if((r26|0)==0){r30=_malloc(r29)}else{r30=_realloc(r26,r29)}if((r30|0)==0){r3=699;break L960}r29=r30;HEAP32[r6]=r29;r31=HEAP32[r5];r26=r29,r32=r26>>2}else{r31=r27;r26=HEAP32[r6],r32=r26>>2}HEAP32[r5]=r31+1|0;HEAP32[(r31<<4>>2)+r32]=r21;HEAP32[((r31<<4)+4>>2)+r32]=r17;HEAP32[((r31<<4)+8>>2)+r32]=1;HEAP32[((r31<<4)+12>>2)+r32]=34516;r25=HEAP32[r7]}else{r25=r22}}while(0);r22=r16+1|0;r21=Math.imul(r25,r17)+r22|0;do{if((r22|0)>-1&(r25|0)>(r22|0)&r24){if((HEAP32[r9]|0)<=(r17|0)){r33=r25;break}r23=HEAP32[HEAP32[r8]+(r21<<2)>>2];if((r23&1|0)!=0){HEAP32[r11]=1;r33=r25;break}if((r23&2|0)!=0){r33=r25;break}r23=HEAP32[r10];r26=HEAP32[r5];if((r23|0)<(r26+1|0)){r27=(r23<<1)+2|0;HEAP32[r10]=r27;r23=HEAP32[r6];r29=r27<<4;if((r23|0)==0){r34=_malloc(r29)}else{r34=_realloc(r23,r29)}if((r34|0)==0){r3=713;break L960}r29=r34;HEAP32[r6]=r29;r35=HEAP32[r5];r23=r29,r36=r23>>2}else{r35=r26;r23=HEAP32[r6],r36=r23>>2}HEAP32[r5]=r35+1|0;HEAP32[(r35<<4>>2)+r36]=r22;HEAP32[((r35<<4)+4>>2)+r36]=r17;HEAP32[((r35<<4)+8>>2)+r36]=1;HEAP32[((r35<<4)+12>>2)+r36]=34516;r33=HEAP32[r7]}else{r33=r25}}while(0);r22=r17-1|0;r21=Math.imul(r33,r22)+r16|0;r24=(r16|0)>-1;do{if(r24&(r33|0)>(r16|0)&(r17|0)>0){if((HEAP32[r9]|0)<=(r22|0)){r37=r33;break}r23=HEAP32[HEAP32[r8]+(r21<<2)>>2];if((r23&1|0)!=0){HEAP32[r11]=1;r37=r33;break}if((r23&2|0)!=0){r37=r33;break}r23=HEAP32[r10];r26=HEAP32[r5];if((r23|0)<(r26+1|0)){r29=(r23<<1)+2|0;HEAP32[r10]=r29;r23=HEAP32[r6];r27=r29<<4;if((r23|0)==0){r38=_malloc(r27)}else{r38=_realloc(r23,r27)}if((r38|0)==0){r3=727;break L960}r27=r38;HEAP32[r6]=r27;r39=HEAP32[r5];r23=r27,r40=r23>>2}else{r39=r26;r23=HEAP32[r6],r40=r23>>2}HEAP32[r5]=r39+1|0;HEAP32[(r39<<4>>2)+r40]=r16;HEAP32[((r39<<4)+4>>2)+r40]=r22;HEAP32[((r39<<4)+8>>2)+r40]=1;HEAP32[((r39<<4)+12>>2)+r40]=34516;r37=HEAP32[r7]}else{r37=r33}}while(0);r22=r17+1|0;r21=Math.imul(r37,r22)+r16|0;if(!(r24&(r37|0)>(r16|0)&(r22|0)>-1)){break}if((HEAP32[r9]|0)<=(r22|0)){break}r23=HEAP32[HEAP32[r8]+(r21<<2)>>2];if((r23&1|0)!=0){HEAP32[r11]=1;break}if((r23&2|0)!=0){break}r23=HEAP32[r10];r21=HEAP32[r5];if((r23|0)<(r21+1|0)){r26=(r23<<1)+2|0;HEAP32[r10]=r26;r23=HEAP32[r6];r27=r26<<4;if((r23|0)==0){r41=_malloc(r27)}else{r41=_realloc(r23,r27)}if((r41|0)==0){r3=741;break L960}r27=r41;HEAP32[r6]=r27;r42=HEAP32[r5];r23=r27,r43=r23>>2}else{r42=r21;r23=HEAP32[r6],r43=r23>>2}HEAP32[r5]=r42+1|0;HEAP32[(r42<<4>>2)+r43]=r16;HEAP32[((r42<<4)+4>>2)+r43]=r22;HEAP32[((r42<<4)+8>>2)+r43]=1;HEAP32[((r42<<4)+12>>2)+r43]=34516}else{if((r20&1|0)!=0){r3=745;break L960}if((r20&2|0)!=0){break}HEAP32[r19]=r20|2;r22=HEAP32[r7];L966:do{if((r22|0)>0){r23=(r17|0)>-1;r21=0;r27=r22;while(1){do{if((r21|0)==(r16|0)){r44=r27}else{r26=HEAP32[r12>>2];r29=HEAP32[r26+(r15<<2)>>2];r28=Math.imul(r27,r17)+r21|0;if(!r23){r44=r27;break}if((HEAP32[r9]|0)<=(r17|0)){r44=r27;break}if((HEAP32[r26+(r28<<2)>>2]|0)!=(r29|0)){r44=r27;break}r29=HEAP32[HEAP32[r8]+(r28<<2)>>2];if((r29&2|0)!=0){HEAP32[r11]=1;r44=r27;break}if((r29&1|0)!=0){r44=r27;break}r29=HEAP32[r10];r28=HEAP32[r5];if((r29|0)<(r28+1|0)){r26=(r29<<1)+2|0;HEAP32[r10]=r26;r29=HEAP32[r6];r45=r26<<4;if((r29|0)==0){r46=_malloc(r45)}else{r46=_realloc(r29,r45)}if((r46|0)==0){r3=763;break L960}r45=r46;HEAP32[r6]=r45;r47=HEAP32[r5];r29=r45,r48=r29>>2}else{r47=r28;r29=HEAP32[r6],r48=r29>>2}HEAP32[r5]=r47+1|0;HEAP32[(r47<<4>>2)+r48]=r21;HEAP32[((r47<<4)+4>>2)+r48]=r17;HEAP32[((r47<<4)+8>>2)+r48]=0;HEAP32[((r47<<4)+12>>2)+r48]=34548;r44=HEAP32[r7]}}while(0);r29=r21+1|0;if((r29|0)<(r44|0)){r21=r29;r27=r44}else{break L966}}}}while(0);r22=HEAP32[r9];if((r22|0)<=0){break}r24=(r16|0)>-1;r27=0;r21=r22;while(1){do{if((r27|0)==(r17|0)){r49=r21}else{r22=HEAP32[r12>>2];r23=HEAP32[r7];r29=Math.imul(r23,r27)+r16|0;if(!(r24&(r23|0)>(r16|0))){r49=r21;break}if((HEAP32[r22+(r29<<2)>>2]|0)!=(HEAP32[r22+(r15<<2)>>2]|0)){r49=r21;break}r22=HEAP32[HEAP32[r8]+(r29<<2)>>2];if((r22&2|0)!=0){HEAP32[r11]=1;r49=r21;break}if((r22&1|0)!=0){r49=r21;break}r22=HEAP32[r10];r29=HEAP32[r5];if((r22|0)<(r29+1|0)){r23=(r22<<1)+2|0;HEAP32[r10]=r23;r22=HEAP32[r6];r28=r23<<4;if((r22|0)==0){r50=_malloc(r28)}else{r50=_realloc(r22,r28)}if((r50|0)==0){r3=781;break L960}r28=r50;HEAP32[r6]=r28;r51=HEAP32[r5];r22=r28,r52=r22>>2}else{r51=r29;r22=HEAP32[r6],r52=r22>>2}HEAP32[r5]=r51+1|0;HEAP32[(r51<<4>>2)+r52]=r16;HEAP32[((r51<<4)+4>>2)+r52]=r27;HEAP32[((r51<<4)+8>>2)+r52]=0;HEAP32[((r51<<4)+12>>2)+r52]=34548;r49=HEAP32[r9]}}while(0);r22=r27+1|0;if((r22|0)<(r49|0)){r27=r22;r21=r49}else{break L962}}}}while(0);if((r14|0)<(HEAP32[r5]|0)){r13=r14}else{break L958}}if(r3==686){HEAP32[r11]=1;STACKTOP=r4;return}else if(r3==727){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==741){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==699){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==713){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==781){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==745){HEAP32[r11]=1;STACKTOP=r4;return}else if(r3==763){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}}while(0);HEAP32[r5]=0;STACKTOP=r4;return}function _solve_allblackbutone(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41;r3=0;r4=STACKTOP;r5=(r2+4|0)>>2;r6=HEAP32[r5];r7=(r1|0)>>2;r8=HEAP32[r7];r9=(r1+4|0)>>2;r10=HEAP32[r9];do{if((r10|0)>0){r11=r1+32|0;r12=r2+8|0;r13=(r2|0)>>2;r14=0;r15=0;r16=r8;r17=r10;L1097:while(1){if((r16|0)>0){r18=r14;r19=0;r20=r16;while(1){if((r18|0)!=(Math.imul(r20,r15)+r19|0)){___assert_func(33428,818,35548,34700)}r21=HEAP32[r11>>2]>>2;L1105:do{if((HEAP32[(r18<<2>>2)+r21]&1|0)==0){r22=r18-r8|0;do{if((r19|0)<(HEAP32[r7]|0)&(r15|0)>0){if((r15-1|0)>=(HEAP32[r9]|0)){r23=-1;break}r24=HEAP32[(r22<<2>>2)+r21];if((r24&2|0)!=0){break L1105}r23=(r24&1|0)==0?r22:-1}else{r23=-1}}while(0);r22=r18+1|0;do{if((r19+1|0)<(HEAP32[r7]|0)){if((r15|0)>=(HEAP32[r9]|0)){r25=r23;break}r24=HEAP32[(r22<<2>>2)+r21];if((r24&2|0)!=0){break L1105}if((r24&1|0)!=0){r25=r23;break}if((r23|0)==-1){r25=r22}else{break L1105}}else{r25=r23}}while(0);r22=r8+r18|0;do{if((r19|0)<(HEAP32[r7]|0)){if((r15+1|0)>=(HEAP32[r9]|0)){r26=r25;break}r24=HEAP32[(r22<<2>>2)+r21];if((r24&2|0)!=0){break L1105}if((r24&1|0)!=0){r26=r25;break}if((r25|0)==-1){r26=r22}else{break L1105}}else{r26=r25}}while(0);r22=r18-1|0;do{if((r19|0)>0){if((r19-1|0)>=(HEAP32[r7]|0)){r27=r26;break}if((r15|0)>=(HEAP32[r9]|0)){r27=r26;break}r24=HEAP32[(r22<<2>>2)+r21];if((r24&2|0)!=0){break L1105}if((r24&1|0)!=0){r27=r26;break}if((r26|0)==-1){r27=r22}else{break L1105}}else{r27=r26}}while(0);if((r27|0)==-1){r3=809;break L1097}r22=HEAP32[r7];r24=(r27|0)%(r22|0);r28=(r27|0)/(r22|0)&-1;r22=HEAP32[r12>>2];r29=HEAP32[r5];if((r22|0)<(r29+1|0)){r30=(r22<<1)+2|0;HEAP32[r12>>2]=r30;r22=HEAP32[r13];r31=r30<<4;if((r22|0)==0){r32=_malloc(r31)}else{r32=_realloc(r22,r31)}if((r32|0)==0){r3=806;break L1097}r31=r32;HEAP32[r13]=r31;r33=HEAP32[r5];r22=r31,r34=r22>>2}else{r33=r29;r22=HEAP32[r13],r34=r22>>2}HEAP32[r5]=r33+1|0;HEAP32[(r33<<4>>2)+r34]=r24;HEAP32[((r33<<4)+4>>2)+r34]=r28;HEAP32[((r33<<4)+8>>2)+r34]=1;HEAP32[((r33<<4)+12>>2)+r34]=34632}}while(0);r21=r19+1|0;r35=r18+1|0;r36=HEAP32[r7];if((r21|0)<(r36|0)){r18=r35;r19=r21;r20=r36}else{break}}r37=r35;r38=r36;r39=HEAP32[r9]}else{r37=r14;r38=r16;r39=r17}r20=r15+1|0;if((r20|0)<(r39|0)){r14=r37;r15=r20;r16=r38;r17=r39}else{r3=813;break}}if(r3==806){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==809){HEAP32[r1+24>>2]=1;r40=0;STACKTOP=r4;return r40}else if(r3==813){r41=HEAP32[r5];break}}else{r41=r6}}while(0);r40=r41-r6|0;STACKTOP=r4;return r40}function _solve_hassinglewhiteregion(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r3=r1+8|0;do{if((HEAP32[r3>>2]|0)>0){r4=r1+32|0;r5=-1;r6=0;r7=0;while(1){r8=(r7<<2)+HEAP32[r4>>2]|0;r9=HEAP32[r8>>2];r10=r9&1;r11=(r10|0)==0?r7:r5;r12=(r10^1)+r6|0;HEAP32[r8>>2]=r9&-9;r9=r7+1|0;r13=HEAP32[r3>>2];if((r9|0)<(r13|0)){r5=r11;r6=r12;r7=r9}else{break}}if((r11|0)==-1){break}r7=(r2+12|0)>>2;_memset(HEAP32[r7],-1,r13<<2);HEAP32[HEAP32[r7]>>2]=r11;r6=(r1+32|0)>>2;r5=(r11<<2)+HEAP32[r6]|0;HEAP32[r5>>2]=HEAP32[r5>>2]|8;r5=r1|0;r4=r1+4|0;r9=0;r8=1;while(1){L1160:do{if((r9|0)<(r8|0)){r10=r8;r14=r9;while(1){r15=HEAP32[HEAP32[r7]+(r14<<2)>>2];do{if((r15|0)==-1){___assert_func(33428,1014,35504,34732);r16=r10;r17=0;break}else{r16=r10;r17=0}}while(0);while(1){r18=HEAP32[r5>>2];r19=HEAP32[(r17<<2)+33136>>2]+(r15|0)%(r18|0)|0;r20=HEAP32[(r17<<2)+33120>>2]+((r15|0)/(r18|0)&-1)|0;r21=Math.imul(r20,r18)+r19|0;do{if((r19|0)>-1&(r19|0)<(r18|0)&(r20|0)>-1){if((r20|0)>=(HEAP32[r4>>2]|0)){r22=r16;break}if((HEAP32[HEAP32[r6]+(r21<<2)>>2]&9|0)!=0){r22=r16;break}HEAP32[HEAP32[r7]+(r16<<2)>>2]=r21;r23=(r21<<2)+HEAP32[r6]|0;HEAP32[r23>>2]=HEAP32[r23>>2]|8;r22=r16+1|0}else{r22=r16}}while(0);r21=r17+1|0;if((r21|0)==4){break}else{r16=r22;r17=r21}}r15=r14+1|0;if((r15|0)==(r8|0)){r24=r22;break L1160}else{r10=r22;r14=r15}}}else{r24=r8}}while(0);if((r8|0)<(r24|0)){r9=r8;r8=r24}else{break}}r25=(r24|0)==(r12|0)&1;return r25}}while(0);HEAP32[r1+24>>2]=1;r25=0;return r25}function _solve_removesplits(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41;r3=0;r4=STACKTOP;r5=(r2+4|0)>>2;r6=HEAP32[r5];if((_solve_hassinglewhiteregion(r1,r2)|0)==0){HEAP32[r1+24>>2]=1;r7=0;STACKTOP=r4;return r7}r8=r1+8|0;L1183:do{if((HEAP32[r8>>2]|0)>0){r9=(r1+32|0)>>2;r10=(r1|0)>>2;r11=(r1+4|0)>>2;r12=(r2+8|0)>>2;r13=(r2|0)>>2;r14=0;L1185:while(1){r15=HEAP32[r9];do{if((HEAP32[r15+(r14<<2)>>2]&1|0)!=0){r16=HEAP32[r10];r17=(r14|0)%(r16|0);r18=(r14|0)/(r16|0)&-1;r19=r17-1|0;r20=r18-1|0;r21=Math.imul(r20,r16)+r19|0;r22=(r17|0)>0;r23=(r18|0)>0;do{if(r22&(r16|0)>(r19|0)&r23){if((HEAP32[r11]|0)<=(r20|0)){break}r24=(r21<<2)+r15|0;r25=HEAP32[r24>>2];if((r25&3|0)!=0){break}HEAP32[r24>>2]=r25|1;r25=_solve_hassinglewhiteregion(r1,r2);r24=(r21<<2)+HEAP32[r9]|0;HEAP32[r24>>2]=HEAP32[r24>>2]&-2;if((r25|0)!=0){break}r25=HEAP32[r12];r24=HEAP32[r5];if((r25|0)<(r24+1|0)){r26=(r25<<1)+2|0;HEAP32[r12]=r26;r25=HEAP32[r13];r27=r26<<4;if((r25|0)==0){r28=_malloc(r27)}else{r28=_realloc(r25,r27)}if((r28|0)==0){r3=870;break L1185}r27=r28;HEAP32[r13]=r27;r29=HEAP32[r5];r25=r27,r30=r25>>2}else{r29=r24;r25=HEAP32[r13],r30=r25>>2}HEAP32[r5]=r29+1|0;HEAP32[(r29<<4>>2)+r30]=r19;HEAP32[((r29<<4)+4>>2)+r30]=r20;HEAP32[((r29<<4)+8>>2)+r30]=1;HEAP32[((r29<<4)+12>>2)+r30]=34756}}while(0);r21=r17+1|0;r16=HEAP32[r10];r25=Math.imul(r16,r20)+r21|0;r24=(r21|0)>-1;do{if(r24&(r16|0)>(r21|0)&r23){if((HEAP32[r11]|0)<=(r20|0)){break}r27=(r25<<2)+HEAP32[r9]|0;r26=HEAP32[r27>>2];if((r26&3|0)!=0){break}HEAP32[r27>>2]=r26|1;r26=_solve_hassinglewhiteregion(r1,r2);r27=(r25<<2)+HEAP32[r9]|0;HEAP32[r27>>2]=HEAP32[r27>>2]&-2;if((r26|0)!=0){break}r26=HEAP32[r12];r27=HEAP32[r5];if((r26|0)<(r27+1|0)){r31=(r26<<1)+2|0;HEAP32[r12]=r31;r26=HEAP32[r13];r32=r31<<4;if((r26|0)==0){r33=_malloc(r32)}else{r33=_realloc(r26,r32)}if((r33|0)==0){r3=883;break L1185}r32=r33;HEAP32[r13]=r32;r34=HEAP32[r5];r26=r32,r35=r26>>2}else{r34=r27;r26=HEAP32[r13],r35=r26>>2}HEAP32[r5]=r34+1|0;HEAP32[(r34<<4>>2)+r35]=r21;HEAP32[((r34<<4)+4>>2)+r35]=r20;HEAP32[((r34<<4)+8>>2)+r35]=1;HEAP32[((r34<<4)+12>>2)+r35]=34756}}while(0);r20=r18+1|0;r25=HEAP32[r10];r23=Math.imul(r25,r20)+r21|0;r16=(r20|0)>-1;do{if(r24&(r25|0)>(r21|0)&r16){if((HEAP32[r11]|0)<=(r20|0)){break}r17=(r23<<2)+HEAP32[r9]|0;r26=HEAP32[r17>>2];if((r26&3|0)!=0){break}HEAP32[r17>>2]=r26|1;r26=_solve_hassinglewhiteregion(r1,r2);r17=(r23<<2)+HEAP32[r9]|0;HEAP32[r17>>2]=HEAP32[r17>>2]&-2;if((r26|0)!=0){break}r26=HEAP32[r12];r17=HEAP32[r5];if((r26|0)<(r17+1|0)){r27=(r26<<1)+2|0;HEAP32[r12]=r27;r26=HEAP32[r13];r32=r27<<4;if((r26|0)==0){r36=_malloc(r32)}else{r36=_realloc(r26,r32)}if((r36|0)==0){r3=896;break L1185}r32=r36;HEAP32[r13]=r32;r37=HEAP32[r5];r26=r32,r38=r26>>2}else{r37=r17;r26=HEAP32[r13],r38=r26>>2}HEAP32[r5]=r37+1|0;HEAP32[(r37<<4>>2)+r38]=r21;HEAP32[((r37<<4)+4>>2)+r38]=r20;HEAP32[((r37<<4)+8>>2)+r38]=1;HEAP32[((r37<<4)+12>>2)+r38]=34756}}while(0);r21=HEAP32[r10];r23=Math.imul(r21,r20)+r19|0;if(!(r22&(r21|0)>(r19|0)&r16)){break}if((HEAP32[r11]|0)<=(r20|0)){break}r21=(r23<<2)+HEAP32[r9]|0;r25=HEAP32[r21>>2];if((r25&3|0)!=0){break}HEAP32[r21>>2]=r25|1;r25=_solve_hassinglewhiteregion(r1,r2);r21=(r23<<2)+HEAP32[r9]|0;HEAP32[r21>>2]=HEAP32[r21>>2]&-2;if((r25|0)!=0){break}r25=HEAP32[r12];r21=HEAP32[r5];if((r25|0)<(r21+1|0)){r23=(r25<<1)+2|0;HEAP32[r12]=r23;r25=HEAP32[r13];r24=r23<<4;if((r25|0)==0){r39=_malloc(r24)}else{r39=_realloc(r25,r24)}if((r39|0)==0){r3=909;break L1185}r24=r39;HEAP32[r13]=r24;r40=HEAP32[r5];r25=r24,r41=r25>>2}else{r40=r21;r25=HEAP32[r13],r41=r25>>2}HEAP32[r5]=r40+1|0;HEAP32[(r40<<4>>2)+r41]=r19;HEAP32[((r40<<4)+4>>2)+r41]=r20;HEAP32[((r40<<4)+8>>2)+r41]=1;HEAP32[((r40<<4)+12>>2)+r41]=34756}}while(0);r15=r14+1|0;if((r15|0)<(HEAP32[r8>>2]|0)){r14=r15}else{break L1183}}if(r3==883){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==896){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==870){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==909){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}}while(0);r7=HEAP32[r5]-r6|0;STACKTOP=r4;return r7}function _solve_offsetpair_pair(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29;r7=0;r8=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r8>>2;r10=r8+8>>2;r11=(r1|0)>>2;r12=HEAP32[r11];do{if((r3|0)==(r5|0)){r13=1;r14=0}else{if((r4|0)==(r6|0)){r13=0;r14=1;break}___assert_func(33428,923,35480,34500);r13=0;r14=1}}while(0);r15=r13+r3|0;r3=r14+r4|0;do{if((r15|0)>-1){if(!((r15|0)<(HEAP32[r11]|0)&(r3|0)>-1)){r7=923;break}r4=r1+4|0;if((r3|0)<(HEAP32[r4>>2]|0)){r16=r4;break}else{r7=923;break}}else{r7=923}}while(0);if(r7==923){___assert_func(33428,930,35480,34468);r16=r1+4|0}r4=Math.imul(r3,r12)+r15|0;r17=r1+28|0;r1=HEAP32[HEAP32[r17>>2]+(r4<<2)>>2];r4=r13+r5|0;r18=r4+r14|0;HEAP32[r9]=r18;HEAP32[r9+1]=r4-r14|0;r4=r14+r6|0;HEAP32[r10]=r4+r13|0;HEAP32[r10+1]=r4-r13|0;r13=(r2+8|0)>>2;r4=(r2+4|0)>>2;r14=(r2|0)>>2;r2=0;r19=r18;L1266:while(1){do{if((r19|0)>-1){if((r19|0)>=(HEAP32[r11]|0)){break}r18=HEAP32[(r2<<2>>2)+r10];if((r18|0)<=-1){break}if((r18|0)>=(HEAP32[r16>>2]|0)){break}if((r19|0)==(r15|0)&(r18|0)==(r3|0)){break}r20=Math.imul(r18,r12)+r19|0;if((r1|0)!=(HEAP32[HEAP32[r17>>2]+(r20<<2)>>2]|0)){break}r20=HEAP32[r13];r21=HEAP32[r4];if((r20|0)<(r21+1|0)){r22=(r20<<1)+2|0;HEAP32[r13]=r22;r20=HEAP32[r14];r23=r22<<4;if((r20|0)==0){r24=_malloc(r23)}else{r24=_realloc(r20,r23)}if((r24|0)==0){r7=937;break L1266}r23=r24;HEAP32[r14]=r23;r25=HEAP32[r4];r20=r23,r26=r20>>2}else{r25=r21;r20=HEAP32[r14],r26=r20>>2}HEAP32[r4]=r25+1|0;HEAP32[(r25<<4>>2)+r26]=r19;HEAP32[((r25<<4)+4>>2)+r26]=r6;HEAP32[((r25<<4)+8>>2)+r26]=1;HEAP32[((r25<<4)+12>>2)+r26]=34444;r20=HEAP32[r13];r21=HEAP32[r4];if((r20|0)<(r21+1|0)){r23=(r20<<1)+2|0;HEAP32[r13]=r23;r20=HEAP32[r14];r22=r23<<4;if((r20|0)==0){r27=_malloc(r22)}else{r27=_realloc(r20,r22)}if((r27|0)==0){r7=945;break L1266}r22=r27;HEAP32[r14]=r22;r28=HEAP32[r4];r20=r22,r29=r20>>2}else{r28=r21;r20=HEAP32[r14],r29=r20>>2}HEAP32[r4]=r28+1|0;HEAP32[(r28<<4>>2)+r29]=r5;HEAP32[((r28<<4)+4>>2)+r29]=r18;HEAP32[((r28<<4)+8>>2)+r29]=1;HEAP32[((r28<<4)+12>>2)+r29]=34444}}while(0);r18=r2+1|0;if((r18|0)>=2){r7=950;break}r2=r18;r19=HEAP32[(r18<<2>>2)+r9]}if(r7==950){STACKTOP=r8;return}else if(r7==937){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r7==945){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}function _status_bar(r1,r2){var r3,r4,r5,r6;r3=r1|0;if((HEAP32[HEAP32[r3>>2]+40>>2]|0)==0){return}r4=r1+24|0;r5=HEAP32[r4>>2];if((r5|0)==0){___assert_func(33544,198,35468,34304);r6=HEAP32[r4>>2]}else{r6=r5}r5=_midend_rewrite_statusbar(r6,r2);r2=(r1+28|0)>>2;r6=HEAP32[r2];do{if((r6|0)!=0){if((_strcmp(r5,r6)|0)!=0){break}if((r5|0)==0){return}_free(r5);return}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+40>>2]](HEAP32[r1+4>>2],r5);r1=HEAP32[r2];if((r1|0)!=0){_free(r1)}HEAP32[r2]=r5;return}function _solve_corner(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50;r7=r2>>2;r8=STACKTOP;r9=HEAP32[r1>>2];r10=HEAP32[r1+28>>2]>>2;r1=Math.imul(r9,r4)+r3|0;r11=HEAP32[(r1<<2>>2)+r10];r12=r1+r5|0;r13=HEAP32[(r12<<2>>2)+r10];r14=Math.imul(r6+r4|0,r9)+r3|0;r3=HEAP32[(r14<<2>>2)+r10];r4=r14+r5|0;r5=HEAP32[(r4<<2>>2)+r10];r10=(r11|0)==(r13|0);L1319:do{if(r10){do{if((r11|0)==(r3|0)){if((r11|0)!=(r5|0)){if(r10&(r11|0)==(r3|0)){break}else{break L1319}}r6=(r1|0)%(r9|0);r15=(r1|0)/(r9|0)&-1;r16=(r2+8|0)>>2;r17=HEAP32[r16];r18=(r2+4|0)>>2;r19=HEAP32[r18];do{if((r17|0)<(r19+1|0)){r20=(r17<<1)+2|0;HEAP32[r16]=r20;r21=r2|0;r22=HEAP32[r21>>2];r23=r20<<4;if((r22|0)==0){r24=_malloc(r23)}else{r24=_realloc(r22,r23)}if((r24|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r23=r24;HEAP32[r21>>2]=r23;r25=HEAP32[r18];r26=r23,r27=r26>>2;break}}else{r25=r19;r26=HEAP32[r7],r27=r26>>2}}while(0);HEAP32[r18]=r25+1|0;HEAP32[(r25<<4>>2)+r27]=r6;HEAP32[((r25<<4)+4>>2)+r27]=r15;HEAP32[((r25<<4)+8>>2)+r27]=0;HEAP32[((r25<<4)+12>>2)+r27]=34404;r19=(r4|0)%(r9|0);r17=(r4|0)/(r9|0)&-1;r23=HEAP32[r16];r21=HEAP32[r18];do{if((r23|0)<(r21+1|0)){r22=(r23<<1)+2|0;HEAP32[r16]=r22;r20=r2|0;r28=HEAP32[r20>>2];r29=r22<<4;if((r28|0)==0){r30=_malloc(r29)}else{r30=_realloc(r28,r29)}if((r30|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r29=r30;HEAP32[r20>>2]=r29;r31=HEAP32[r18];r32=r29,r33=r32>>2;break}}else{r31=r21;r32=HEAP32[r7],r33=r32>>2}}while(0);HEAP32[r18]=r31+1|0;HEAP32[(r31<<4>>2)+r33]=r19;HEAP32[((r31<<4)+4>>2)+r33]=r17;HEAP32[((r31<<4)+8>>2)+r33]=0;HEAP32[((r31<<4)+12>>2)+r33]=34404;STACKTOP=r8;return}else{if((r11|0)!=(r3|0)){break L1319}}}while(0);r21=(r1|0)%(r9|0);r16=(r1|0)/(r9|0)&-1;r23=r2+8|0;r15=HEAP32[r23>>2];r6=(r2+4|0)>>2;r29=HEAP32[r6];do{if((r15|0)<(r29+1|0)){r20=(r15<<1)+2|0;HEAP32[r23>>2]=r20;r28=r2|0;r22=HEAP32[r28>>2];r34=r20<<4;if((r22|0)==0){r35=_malloc(r34)}else{r35=_realloc(r22,r34)}if((r35|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r34=r35;HEAP32[r28>>2]=r34;r36=HEAP32[r6];r37=r34,r38=r37>>2;break}}else{r36=r29;r37=HEAP32[r7],r38=r37>>2}}while(0);HEAP32[r6]=r36+1|0;HEAP32[(r36<<4>>2)+r38]=r21;HEAP32[((r36<<4)+4>>2)+r38]=r16;HEAP32[((r36<<4)+8>>2)+r38]=0;HEAP32[((r36<<4)+12>>2)+r38]=34372;STACKTOP=r8;return}}while(0);if((r13|0)==(r3|0)&(r13|0)==(r5|0)){r38=(r4|0)%(r9|0);r36=(r4|0)/(r9|0)&-1;r4=r2+8|0;r37=HEAP32[r4>>2];r35=(r2+4|0)>>2;r1=HEAP32[r35];do{if((r37|0)<(r1+1|0)){r33=(r37<<1)+2|0;HEAP32[r4>>2]=r33;r31=r2|0;r32=HEAP32[r31>>2];r30=r33<<4;if((r32|0)==0){r39=_malloc(r30)}else{r39=_realloc(r32,r30)}if((r39|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r30=r39;HEAP32[r31>>2]=r30;r40=HEAP32[r35];r41=r30,r42=r41>>2;break}}else{r40=r1;r41=HEAP32[r7],r42=r41>>2}}while(0);HEAP32[r35]=r40+1|0;HEAP32[(r40<<4>>2)+r42]=r38;HEAP32[((r40<<4)+4>>2)+r42]=r36;HEAP32[((r40<<4)+8>>2)+r42]=0;HEAP32[((r40<<4)+12>>2)+r42]=34340;STACKTOP=r8;return}if(r10|(r13|0)==(r5|0)){r13=(r14|0)%(r9|0);r10=(r14|0)/(r9|0)&-1;r14=r2+8|0;r42=HEAP32[r14>>2];r40=(r2+4|0)>>2;r36=HEAP32[r40];do{if((r42|0)<(r36+1|0)){r38=(r42<<1)+2|0;HEAP32[r14>>2]=r38;r35=r2|0;r41=HEAP32[r35>>2];r1=r38<<4;if((r41|0)==0){r43=_malloc(r1)}else{r43=_realloc(r41,r1)}if((r43|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r1=r43;HEAP32[r35>>2]=r1;r44=HEAP32[r40];r45=r1,r46=r45>>2;break}}else{r44=r36;r45=HEAP32[r7],r46=r45>>2}}while(0);HEAP32[r40]=r44+1|0;HEAP32[(r44<<4>>2)+r46]=r13;HEAP32[((r44<<4)+4>>2)+r46]=r10;HEAP32[((r44<<4)+8>>2)+r46]=1;HEAP32[((r44<<4)+12>>2)+r46]=34312;STACKTOP=r8;return}if(!((r11|0)==(r3|0)|(r3|0)==(r5|0))){STACKTOP=r8;return}r5=(r12|0)%(r9|0);r3=(r12|0)/(r9|0)&-1;r9=r2+8|0;r12=HEAP32[r9>>2];r11=(r2+4|0)>>2;r46=HEAP32[r11];do{if((r12|0)<(r46+1|0)){r44=(r12<<1)+2|0;HEAP32[r9>>2]=r44;r10=r2|0;r13=HEAP32[r10>>2];r40=r44<<4;if((r13|0)==0){r47=_malloc(r40)}else{r47=_realloc(r13,r40)}if((r47|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r40=r47;HEAP32[r10>>2]=r40;r48=HEAP32[r11];r49=r40,r50=r49>>2;break}}else{r48=r46;r49=HEAP32[r7],r50=r49>>2}}while(0);HEAP32[r11]=r48+1|0;HEAP32[(r48<<4>>2)+r50]=r5;HEAP32[((r48<<4)+4>>2)+r50]=r3;HEAP32[((r48<<4)+8>>2)+r50]=1;HEAP32[((r48<<4)+12>>2)+r50]=34312;STACKTOP=r8;return}function _unpick_desc(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r6=STACKTOP;r7=_malloc(36),r8=r7>>2;if((r7|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r9=r7;_memset(r7,0,36);HEAP32[r8]=r1;HEAP32[r8+1]=r2;r10=Math.imul(r2,r1);r11=(r7+8|0)>>2;HEAP32[r11]=r10;r12=r7+12|0;HEAP32[r12>>2]=(r1|0)>(r2|0)?r1:r2;HEAP32[r8+6]=0;HEAP32[r8+5]=0;HEAP32[r8+4]=0;r8=_malloc(r10<<2);if((r8|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=(r7+28|0)>>2;HEAP32[r10]=r8;r8=_malloc(HEAP32[r11]<<2);if((r8|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r2=(r7+32|0)>>2;HEAP32[r2]=r8;_memset(HEAP32[r10],0,HEAP32[r11]<<2);_memset(HEAP32[r2],0,HEAP32[r11]<<2);r8=_strlen(r3);L1419:do{if((r8|0)==(HEAP32[r11]|0)){L1421:do{if((r8|0)>0){r1=0;while(1){r13=HEAP8[r3+r1|0];r14=r13<<24>>24;do{if(((r13&255)-48|0)>>>0<10){r15=r14-48|0}else{if((r13-97&255)<26){r15=r14-87|0;break}else{r15=(r13-65&255)<26?r14-29|0:-1;break}}}while(0);if((r15|0)<1){r16=33912;break L1419}if((r15|0)>(HEAP32[r12>>2]|0)){r16=33912;break L1419}HEAP32[HEAP32[r10]+(r1<<2)>>2]=r15;r14=r1+1|0;if((r14|0)<(HEAP32[r11]|0)){r1=r14}else{break L1421}}}}while(0);if((r5|0)!=0){HEAP32[r5>>2]=0}if((r4|0)!=0){HEAP32[r4>>2]=r9;STACKTOP=r6;return}r1=HEAP32[r10];if((r1|0)!=0){_free(r1)}r1=HEAP32[r2];if((r1|0)!=0){_free(r1)}_free(r7);STACKTOP=r6;return}else{r16=34008}}while(0);if((r5|0)!=0){HEAP32[r5>>2]=r16}r16=HEAP32[r10];if((r16|0)!=0){_free(r16)}r16=HEAP32[r2];if((r16|0)!=0){_free(r16)}_free(r7);STACKTOP=r6;return}function _print_mono_colour(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=STACKTOP;r4=r2|0;r2=(r1+12|0)>>2;r5=HEAP32[r2];r6=r1+16|0;do{if((r5|0)<(HEAP32[r6>>2]|0)){r7=r5;r8=HEAP32[r1+8>>2]}else{r9=r5+16|0;HEAP32[r6>>2]=r9;r10=r1+8|0;r11=HEAP32[r10>>2];r12=r9*24&-1;if((r11|0)==0){r13=_malloc(r12)}else{r13=_realloc(r11,r12)}if((r13|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r12=r13;HEAP32[r10>>2]=r12;r7=HEAP32[r2];r8=r12;break}}}while(0);r13=(r1+8|0)>>2;HEAP32[r8+(r7*24&-1)>>2]=-1;HEAP32[HEAP32[r13]+(HEAP32[r2]*24&-1)+4>>2]=0;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+8>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+12>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+16>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+20>>2]=r4;r4=HEAP32[r2];HEAP32[r2]=r4+1|0;STACKTOP=r3;return r4}function _edsf_merge(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r5=r1>>2;if((r2|0)<=-1){___assert_func(33480,110,35820,34588)}r6=HEAP32[(r2<<2>>2)+r5];do{if((r6&2|0)==0){r7=0;r8=r6;while(1){r9=r8&1^r7;r10=r8>>2;r11=HEAP32[(r10<<2>>2)+r5];if((r11&2|0)==0){r7=r9;r8=r11}else{break}}L1479:do{if((r10|0)==(r2|0)){r12=r9;r13=r2}else{r8=r10<<2;r7=r9;r11=r2;r14=r6;while(1){r15=r14>>2;r16=r14&1^r7;HEAP32[(r11<<2>>2)+r5]=r7|r8;if((r15|0)==(r10|0)){r12=r16;r13=r10;break L1479}r7=r16;r11=r15;r14=HEAP32[(r15<<2>>2)+r5]}}}while(0);if((r12|0)==0){r17=r9;r18=r13;break}___assert_func(33480,137,35820,34264);r17=r9;r18=r13}else{r17=0;r18=r2}}while(0);if((HEAP32[(r18<<2>>2)+r5]&2|0)==0){___assert_func(33480,152,35808,33828)}r2=r17^r4;if((r3|0)<=-1){___assert_func(33480,110,35820,34588)}r4=HEAP32[(r3<<2>>2)+r5];do{if((r4&2|0)==0){r17=0;r13=r4;while(1){r19=r13&1^r17;r20=r13>>2;r9=HEAP32[(r20<<2>>2)+r5];if((r9&2|0)==0){r17=r19;r13=r9}else{break}}L1497:do{if((r20|0)==(r3|0)){r21=r19;r22=r3}else{r13=r20<<2;r17=r19;r9=r3;r12=r4;while(1){r10=r12>>2;r6=r12&1^r17;HEAP32[(r9<<2>>2)+r5]=r17|r13;if((r10|0)==(r20|0)){r21=r6;r22=r20;break L1497}r17=r6;r9=r10;r12=HEAP32[(r10<<2>>2)+r5]}}}while(0);if((r21|0)==0){r23=r19;r24=r22;break}___assert_func(33480,137,35820,34264);r23=r19;r24=r22}else{r23=0;r24=r3}}while(0);if((HEAP32[(r24<<2>>2)+r5]&2|0)==0){___assert_func(33480,155,35808,33584)}r3=r23^r2;r22=(r2|0)==(r23|0);do{if((r18|0)==(r24|0)){if(r22){r25=r18;r26=r18;break}___assert_func(33480,161,35808,33516);r25=r18;r26=r18}else{if(!(r22|(r3|0)==1)){___assert_func(33480,163,35808,33448)}r19=(r18|0)>(r24|0);r21=r19?r18:r24;r20=r19?r24:r18;r19=(r21<<2)+r1|0;r4=(r20<<2)+r1|0;HEAP32[r4>>2]=HEAP32[r4>>2]+(HEAP32[r19>>2]&-4)|0;HEAP32[r19>>2]=r20<<2|(r2|0)!=(r23|0)&1;r25=r20;r26=r21}}while(0);if((r26|0)<=-1){___assert_func(33480,110,35820,34588)}r23=HEAP32[(r26<<2>>2)+r5];do{if((r23&2|0)==0){r2=0;r1=r23;while(1){r27=r1&1^r2;r28=r1>>2;r18=HEAP32[(r28<<2>>2)+r5];if((r18&2|0)==0){r2=r27;r1=r18}else{break}}L1523:do{if((r28|0)==(r26|0)){r29=r27;r30=r26}else{r1=r28<<2;r2=r27;r18=r26;r24=r23;while(1){r22=r24>>2;r21=r24&1^r2;HEAP32[(r18<<2>>2)+r5]=r2|r1;if((r22|0)==(r28|0)){r29=r21;r30=r28;break L1523}r2=r21;r18=r22;r24=HEAP32[(r22<<2>>2)+r5]}}}while(0);if((r29|0)==0){r31=r27;r32=r30;break}___assert_func(33480,137,35820,34264);r31=r27;r32=r30}else{r31=0;r32=r26}}while(0);if((r32|0)!=(r25|0)){___assert_func(33480,188,35808,33388)}if((r31|0)==(r3|0)){return}___assert_func(33480,189,35808,33296);return}function _dsf_size(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;if((r2|0)<=-1){___assert_func(33480,110,35820,34588)}r3=(r2<<2)+r1|0;r4=HEAP32[r3>>2];do{if((r4&2|0)==0){r5=0;r6=r4;while(1){r7=r6&1^r5;r8=r6>>2;r9=HEAP32[r1+(r8<<2)>>2];if((r9&2|0)==0){r5=r7;r6=r9}else{break}}L1546:do{if((r8|0)==(r2|0)){r10=r7;r11=r2}else{r6=r8<<2;r5=r4>>2;r9=r7^r4&1;HEAP32[r3>>2]=r7|r6;if((r5|0)==(r8|0)){r10=r9;r11=r8;break}else{r12=r5;r13=r9}while(1){r9=(r12<<2)+r1|0;r5=HEAP32[r9>>2];r14=r5>>2;r15=r13^r5&1;HEAP32[r9>>2]=r13|r6;if((r14|0)==(r8|0)){r10=r15;r11=r8;break L1546}else{r12=r14;r13=r15}}}}while(0);if((r10|0)==0){r16=r11;break}___assert_func(33480,137,35820,34264);r16=r11}else{r16=r2}}while(0);return HEAP32[r1+(r16<<2)>>2]>>2}function _init_game(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3,r5=r4>>2;r6=_midend_new(r1,32768,33152,r2);_frontend_set_game_info(r1,r6,34988,1,1,1,0,0,1,0);r7=_midend_num_presets(r6);HEAP32[r5]=r7;L1554:do{if((r7|0)>0){r8=r6+24|0;r9=r6+16|0;r10=r6+12|0;r11=0;while(1){if((HEAP32[r8>>2]|0)<=(r11|0)){___assert_func(33960,1056,35712,34604)}_frontend_add_preset(r1,HEAP32[HEAP32[r9>>2]+(r11<<2)>>2],HEAP32[HEAP32[r10>>2]+(r11<<2)>>2]);r12=r11+1|0;if((r12|0)<(HEAP32[r5]|0)){r11=r12}else{break L1554}}}}while(0);r1=_midend_colours(r6,r4)>>2;if((HEAP32[r5]|0)>0){r13=0}else{STACKTOP=r3;return}while(1){r4=r13*3&-1;_canvas_set_palette_entry(r2,r13,HEAPF32[(r4<<2>>2)+r1]*255&-1,HEAPF32[(r4+1<<2>>2)+r1]*255&-1,HEAPF32[(r4+2<<2>>2)+r1]*255&-1);r4=r13+1|0;if((r4|0)<(HEAP32[r5]|0)){r13=r4}else{break}}STACKTOP=r3;return}function _fatal(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3;_fwrite(33320,13,1,HEAP32[_stderr>>2]);HEAP32[r4>>2]=r2;_fprintf(HEAP32[_stderr>>2],r1,HEAP32[r4>>2]);_fputc(10,HEAP32[_stderr>>2]);_exit(1)}function _canvas_text_fallback(r1,r2,r3){r3=STACKTOP;r1=HEAP32[r2>>2];r2=_malloc(_strlen(r1)+1|0);if((r2|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r2,r1);STACKTOP=r3;return r2}}function _latin_generate(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r3=0;r4=STACKTOP;r5=Math.imul(r1,r1);r6=_malloc(r5);if((r6|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r7=_malloc(r1);if((r7|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r8=_malloc(r1);if((r8|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r9=_malloc(r1);if((r9|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=_malloc(r1);if((r10|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r11=(r1|0)>0;L1588:do{if(r11){r12=0;while(1){HEAP8[r7+r12|0]=r12&255;r13=r12+1|0;if((r13|0)==(r1|0)){r14=r1;break L1588}else{r12=r13}}}else{r14=0}}while(0);_shuffle(r7,r14,1,r2);r14=r1<<1;r12=r14+2|0;r13=_malloc(r12<<4);if((r13|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r15=r5+r14|0;r16=r15<<2;r17=_malloc(r16);if((r17|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r18=r17;r19=_malloc(r15<<3);if((r19|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r20=r19,r21=r20>>2;r22=_malloc(r16);if((r22|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r23=r22,r24=r23>>2;r25=_malloc(r16);if((r25|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r16=r25;do{if(r11){r26=0;r27=0;while(1){r28=0;r29=r27;while(1){r30=r29<<1;HEAP32[(r30<<2>>2)+r21]=r26;HEAP32[((r30|1)<<2>>2)+r21]=r28+r1|0;r30=r28+1|0;if((r30|0)==(r1|0)){break}else{r28=r30;r29=r29+1|0}}r31=r27+r1|0;r29=r26+1|0;if((r29|0)==(r1|0)){break}else{r26=r29;r27=r31}}if(!r11){r32=r31;break}r27=r14|1;r26=0;r29=r31;while(1){r28=r29<<1;HEAP32[(r28<<2>>2)+r21]=r26+r1|0;HEAP32[((r28|1)<<2>>2)+r21]=r27;HEAP32[(r29<<2>>2)+r24]=1;r28=r26+1|0;if((r28|0)==(r1|0)){break}else{r26=r28;r29=r29+1|0}}r29=r31+r1|0;if(r11){r33=0;r34=r29}else{r32=r29;break}while(1){r26=r34<<1;HEAP32[(r26<<2>>2)+r21]=r14;HEAP32[((r26|1)<<2>>2)+r21]=r33;HEAP32[(r34<<2>>2)+r24]=1;r26=r33+1|0;if((r26|0)==(r1|0)){break}else{r33=r26;r34=r34+1|0}}r32=r29+r1|0}else{r32=0}}while(0);if((r32|0)!=(r15|0)){___assert_func(33312,1166,35756,33500)}_maxflow_setup_backedges(r32,r20,r18);if(!r11){_free(r25);_free(r22);_free(r19);_free(r17);_free(r13);_free(r9);_free(r10);_free(r8);_free(r7);STACKTOP=r4;return r6}r11=(r5|0)==0;r15=r14|1;r34=0;while(1){r33=0;while(1){r21=r33&255;HEAP8[r10+r33|0]=r21;HEAP8[r8+r33|0]=r21;r21=r33+1|0;if((r21|0)==(r1|0)){break}else{r33=r21}}_shuffle(r8,r1,1,r2);_shuffle(r10,r1,1,r2);r33=0;while(1){HEAP8[r9+HEAPU8[r10+r33|0]|0]=r33&255;r29=r33+1|0;if((r29|0)==(r1|0)){break}else{r33=r29}}L1636:do{if(!r11){r33=0;while(1){HEAP32[(r33<<2>>2)+r24]=1;r29=r33+1|0;if((r29|0)<(r5|0)){r33=r29}else{break L1636}}}}while(0);L1640:do{if((r34|0)>0){r33=0;while(1){r29=r7+r33|0;r21=0;while(1){r31=Math.imul(HEAPU8[r29],r1);r26=(HEAPU8[r10+(HEAPU8[r6+r31+HEAPU8[r8+r21|0]|0]-1)|0]+Math.imul(r21,r1)<<2)+r23|0;HEAP32[r26>>2]=0;r26=r21+1|0;if((r26|0)==(r1|0)){break}else{r21=r26}}r21=r33+1|0;if((r21|0)==(r34|0)){break L1640}else{r33=r21}}}}while(0);if((_maxflow_with_scratch(r13,r12,r14,r15,r32,r20,r18,r23,r16,0)|0)!=(r1|0)){___assert_func(33312,1204,35756,33440)}r33=r7+r34|0;r21=0;while(1){r29=Math.imul(r21,r1);r26=0;while(1){if((r26|0)>=(r1|0)){r3=1202;break}if((HEAP32[r16+(r26+r29<<2)>>2]|0)==0){r26=r26+1|0}else{break}}if(r3==1202){r3=0;___assert_func(33312,1215,35756,33380)}r29=HEAP8[r9+r26|0]+1&255;r31=Math.imul(HEAPU8[r33],r1);HEAP8[r6+r31+HEAPU8[r8+r21|0]|0]=r29;r29=r21+1|0;if((r29|0)==(r1|0)){break}else{r21=r29}}r21=r34+1|0;if((r21|0)==(r1|0)){break}else{r34=r21}}_free(r25);_free(r22);_free(r19);_free(r17);_free(r13);_free(r9);_free(r10);_free(r8);_free(r7);STACKTOP=r4;return r6}function _maxflow_setup_backedges(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28;r4=r2>>2;r2=0;r5=(r1|0)>0;if(r5){r6=0}else{return}while(1){HEAP32[r3+(r6<<2)>>2]=r6;r7=r6+1|0;if((r7|0)==(r1|0)){break}else{r6=r7}}if(r5){r8=0}else{return}while(1){r5=r8+1|0;L1670:do{if((r8|0)>0){r6=r8;while(1){r7=r6-1|0;r9=(r7|0)/2&-1;r10=(r9<<2)+r3|0;r11=HEAP32[r10>>2];r12=r11<<1;r13=HEAP32[((r12|1)<<2>>2)+r4];r14=(r6<<2)+r3|0;r15=HEAP32[r14>>2];r16=r15<<1;r17=HEAP32[((r16|1)<<2>>2)+r4];if((r13|0)>=(r17|0)){if((r13|0)!=(r17|0)){break L1670}if((HEAP32[(r12<<2>>2)+r4]|0)>=(HEAP32[(r16<<2>>2)+r4]|0)){break L1670}}HEAP32[r10>>2]=r15;HEAP32[r14>>2]=r11;if((r7|0)>1){r6=r9}else{break L1670}}}}while(0);if((r5|0)==(r1|0)){break}else{r8=r5}}if((r1|0)>0){r18=r1}else{return}while(1){r1=r18-1|0;r8=HEAP32[r3>>2];r6=(r1<<2)+r3|0;HEAP32[r3>>2]=HEAP32[r6>>2];HEAP32[r6>>2]=r8;L1683:do{if((r1|0)>1){r8=0;r6=1;r9=2;while(1){r19=((r8<<2)+r3|0)>>2;r20=HEAP32[r19];r21=r20<<1;r22=HEAP32[((r21|1)<<2>>2)+r4];r23=((r6<<2)+r3|0)>>2;r24=HEAP32[r23];r25=r24<<1;r26=HEAP32[((r25|1)<<2>>2)+r4];r27=(r22|0)<(r26|0);if((r9|0)>=(r1|0)){break}do{if(!r27){if((r22|0)==(r26|0)){if((HEAP32[(r21<<2>>2)+r4]|0)<(HEAP32[(r25<<2>>2)+r4]|0)){break}}r7=HEAP32[r3+(r9<<2)>>2]<<1;r11=HEAP32[((r7|1)<<2>>2)+r4];if((r22|0)<(r11|0)){break}if((r22|0)!=(r11|0)){break L1683}if((HEAP32[(r21<<2>>2)+r4]|0)>=(HEAP32[(r7<<2>>2)+r4]|0)){break L1683}}}while(0);r7=(r9<<2)+r3|0;r11=HEAP32[r7>>2];r14=r11<<1;r15=HEAP32[((r14|1)<<2>>2)+r4];do{if((r26|0)<(r15|0)){r2=1234}else{if((r26|0)==(r15|0)){if((HEAP32[(r25<<2>>2)+r4]|0)<(HEAP32[(r14<<2>>2)+r4]|0)){r2=1234;break}}HEAP32[r19]=r24;HEAP32[r23]=r20;r28=r6;break}}while(0);if(r2==1234){r2=0;HEAP32[r19]=r11;HEAP32[r7>>2]=r20;r28=r9}r14=r28<<1;r15=r14|1;if((r15|0)<(r1|0)){r8=r28;r6=r15;r9=r14+2|0}else{break L1683}}if(!r27){if((r22|0)!=(r26|0)){break}if((HEAP32[(r21<<2>>2)+r4]|0)>=(HEAP32[(r25<<2>>2)+r4]|0)){break}}HEAP32[r19]=r24;HEAP32[r23]=r20}}while(0);if((r1|0)>0){r18=r1}else{break}}return}function _maxflow_with_scratch(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43;r11=r9>>2;r12=r6>>2;r13=0;r14=r1,r15=r14>>2;r16=r9;r17=r2<<1;r18=r2*3&-1;r19=(r5|0)>0;L1711:do{if(r19){r20=0;r21=0;while(1){r22=(r20<<3)+r6|0;L1714:do{if((r21|0)>(HEAP32[r22>>2]|0)){r23=r21}else{r24=r21;while(1){r25=r24+1|0;HEAP32[(r24+r17<<2>>2)+r15]=r20;if((r25|0)>(HEAP32[r22>>2]|0)){r23=r25;break L1714}else{r24=r25}}}}while(0);r22=r20+1|0;if((r22|0)==(r5|0)){r26=r23;break L1711}else{r20=r22;r21=r23}}}else{r26=0}}while(0);L1719:do{if((r26|0)<(r2|0)){r23=r26;while(1){r6=r23+1|0;HEAP32[(r23+r17<<2>>2)+r15]=r5;if((r6|0)==(r2|0)){break L1719}else{r23=r6}}}else{if((r26|0)==(r2|0)){break}___assert_func(34876,42,35732,34868)}}while(0);L1725:do{if(r19){r26=0;r23=0;while(1){r6=(r26<<2)+r7|0;L1728:do{if((r23|0)>(HEAP32[((HEAP32[r6>>2]<<1|1)<<2>>2)+r12]|0)){r27=r23}else{r21=r23;while(1){r20=r21+1|0;HEAP32[(r21+r18<<2>>2)+r15]=r26;if((r20|0)>(HEAP32[((HEAP32[r6>>2]<<1|1)<<2>>2)+r12]|0)){r27=r20;break L1728}else{r21=r20}}}}while(0);r6=r26+1|0;if((r6|0)==(r5|0)){r28=r27;break L1725}else{r26=r6;r23=r27}}}else{r28=0}}while(0);L1733:do{if((r28|0)<(r2|0)){r27=r28;while(1){r23=r27+1|0;HEAP32[(r27+r18<<2>>2)+r15]=r5;if((r23|0)==(r2|0)){break L1733}else{r27=r23}}}else{if((r28|0)==(r2|0)){break}___assert_func(34876,54,35732,34868)}}while(0);if(r19){_memset(r16,0,r5<<2)}r16=(r2|0)>0;r19=(r4+r2<<2)+r14|0;r28=(r4|0)==(r3|0);r27=r2<<2;r23=r1+r27|0;r1=0;L1742:while(1){if(r16){_memset(r23,-1,r27)}HEAP32[r15]=r3;r26=0;r6=1;while(1){if((HEAP32[r19>>2]|0)>=1){r29=-1;r30=r4;break}r21=r26+1|0;r20=HEAP32[(r26<<2>>2)+r15];r22=HEAP32[(r20+r17<<2>>2)+r15];L1750:do{if((r22|0)<(r5|0)){r24=r22;r25=r6;while(1){r31=r24<<1;if((HEAP32[(r31<<2>>2)+r12]|0)!=(r20|0)){r32=r25;break L1750}r33=HEAP32[((r31|1)<<2>>2)+r12];do{if((r33|0)==(r3|0)){r34=r25}else{r35=(r33+r2<<2)+r14|0;if((HEAP32[r35>>2]|0)>-1){r34=r25;break}r36=HEAP32[r8+(r24<<2)>>2];if((r36|0)>-1){if((HEAP32[(r24<<2>>2)+r11]|0)>=(r36|0)){r34=r25;break}}HEAP32[r35>>2]=r31;HEAP32[(r25<<2>>2)+r15]=r33;r34=r25+1|0}}while(0);r33=r24+1|0;if((r33|0)<(r5|0)){r24=r33;r25=r34}else{r32=r34;break L1750}}}else{r32=r6}}while(0);r22=HEAP32[(r20+r18<<2>>2)+r15];L1762:do{if((r22|0)<(r5|0)){r25=r22;r24=r32;while(1){r33=HEAP32[r7+(r25<<2)>>2];r31=r33<<1;r35=r31|1;if((HEAP32[(r35<<2>>2)+r12]|0)!=(r20|0)){r37=r24;break L1762}r36=HEAP32[(r31<<2>>2)+r12];do{if((r36|0)==(r3|0)){r38=r24}else{r31=(r36+r2<<2)+r14|0;if((HEAP32[r31>>2]|0)>-1){r38=r24;break}if((HEAP32[(r33<<2>>2)+r11]|0)<1){r38=r24;break}HEAP32[r31>>2]=r35;HEAP32[(r24<<2>>2)+r15]=r36;r38=r24+1|0}}while(0);r36=r25+1|0;if((r36|0)<(r5|0)){r25=r36;r24=r38}else{r37=r38;break L1762}}}else{r37=r32}}while(0);if((r21|0)<(r37|0)){r26=r21;r6=r37}else{r13=1281;break}}do{if(r13==1281){r13=0;if((HEAP32[r19>>2]|0)>-1){r29=-1;r30=r4;break}else{break L1742}}}while(0);L1774:while(1){if((r29|0)<0){if((r30|0)==(r3|0)){r13=1303;break}r6=HEAP32[(r30+r2<<2>>2)+r15];r26=HEAP32[(r6<<2>>2)+r12];if((r26|0)==(r30|0)){___assert_func(34876,145,35732,34432)}r20=(r6|0)/2&-1;if((r6&1|0)==0){r6=HEAP32[r8+(r20<<2)>>2];if((r6|0)<=-1){r29=-1;r30=r26;continue}r39=r6-HEAP32[(r20<<2>>2)+r11]|0}else{r39=HEAP32[(r20<<2>>2)+r11]}if((r39|0)!=0){r29=r39;r30=r26;continue}___assert_func(34876,157,35732,33996);r29=0;r30=r26;continue}else{r40=r30}while(1){if((r40|0)==(r3|0)){r13=1302;break L1774}r26=HEAP32[(r40+r2<<2>>2)+r15];r20=HEAP32[(r26<<2>>2)+r12];if((r20|0)==(r40|0)){___assert_func(34876,145,35732,34432)}r6=(r26|0)/2&-1;if((r26&1|0)==0){r26=HEAP32[r8+(r6<<2)>>2];if((r26|0)<=-1){r40=r20;continue}r41=r26-HEAP32[(r6<<2>>2)+r11]|0}else{r41=HEAP32[(r6<<2>>2)+r11]}if((r41|0)==0){___assert_func(34876,157,35732,33996);r42=0}else{r42=r41}if((r42|0)>-1&(r42|0)<(r29|0)){r29=r42;r30=r20;continue L1774}else{r40=r20}}}do{if(r13==1302){r13=0;if((r29|0)>0){break}else{r13=1303;break}}}while(0);if(r13==1303){r13=0;___assert_func(34876,170,35732,33680)}L1807:do{if(!r28){r21=-r29|0;r20=r4;while(1){r6=HEAP32[(r20+r2<<2>>2)+r15];r26=HEAP32[(r6<<2>>2)+r12];if((r26|0)==(r20|0)){___assert_func(34876,183,35732,34432)}r22=(((r6|0)/2&-1)<<2)+r9|0;HEAP32[r22>>2]=HEAP32[r22>>2]+((r6&1|0)==0?r29:r21)|0;if((r26|0)==(r3|0)){break L1807}else{r20=r26}}}}while(0);r1=r29+r1|0}if((r10|0)==0|r16^1){return r1}else{r43=0}while(1){do{if((r43|0)==(r3|0)){r13=1313}else{if((HEAP32[(r43+r2<<2>>2)+r15]|0)>-1){r13=1313;break}HEAP32[r10+(r43<<2)>>2]=1;break}}while(0);if(r13==1313){r13=0;HEAP32[r10+(r43<<2)>>2]=0}r16=r43+1|0;if((r16|0)==(r2|0)){break}else{r43=r16}}return r1}function _midend_new(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r5=STACKTOP;STACKTOP=STACKTOP+164|0;r6=r5;r7=r5+80;r8=r5+160;r9=_malloc(144),r10=r9>>2;if((r9|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r11=r9;r12=_malloc(8);if((r12|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_gettimeofday(r12,0);HEAP32[r10]=r1;r1=(r9+8|0)>>2;HEAP32[r1]=r2;r13=_random_new(r12,8);HEAP32[r10+1]=r13;r13=(r9+52|0)>>2;HEAP32[r13]=0;HEAP32[r13+1]=0;HEAP32[r13+2]=0;HEAP32[r13+3]=0;r13=FUNCTION_TABLE[HEAP32[r2+12>>2]]();r14=r9+68|0;HEAP32[r14>>2]=r13;r13=r6|0;_sprintf(r13,34816,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r1]>>2],tempInt));r15=HEAP8[r13];L1834:do{if(r15<<24>>24==0){r16=0}else{r17=0;r18=0;r19=r13;r20=r15;while(1){if((_isspace(r20&255)|0)==0){r21=_toupper(HEAPU8[r19])&255;HEAP8[r6+r17|0]=r21;r22=r17+1|0}else{r22=r17}r21=r18+1|0;r23=r6+r21|0;r24=HEAP8[r23];if(r24<<24>>24==0){r16=r22;break L1834}else{r17=r22;r18=r21;r19=r23;r20=r24}}}}while(0);HEAP8[r6+r16|0]=0;r16=_getenv(r13);if((r16|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r1]+20>>2]](HEAP32[r14>>2],r16)}HEAP32[r10+18]=0;r16=(r9+32|0)>>2;HEAP32[r16]=0;HEAP32[r16+1]=0;HEAP32[r16+2]=0;HEAP32[r16+3]=0;HEAP32[r10+12]=2;r16=(r9+12|0)>>2;HEAP32[r10+31]=0;HEAP32[r10+35]=0;HEAP32[r10+34]=0;HEAP32[r10+33]=0;HEAP32[r16]=0;HEAP32[r16+1]=0;HEAP32[r16+2]=0;HEAP32[r16+3]=0;HEAP32[r16+4]=0;_memset(r9+76|0,0,44);do{if((r3|0)==0){HEAP32[r10+30]=0}else{r16=_malloc(32),r14=r16>>2;if((r16|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r14]=r3;HEAP32[r14+1]=r4;HEAP32[r14+2]=0;HEAP32[r14+4]=0;HEAP32[r14+3]=0;HEAPF32[r14+5]=1;HEAP32[r14+6]=r11;HEAP32[r14+7]=0;HEAP32[r10+30]=r16;break}}}while(0);r10=r9+128|0;HEAP32[r10>>2]=HEAP32[r2+120>>2];r2=r7|0;_sprintf(r2,34840,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r1]>>2],tempInt));r1=HEAP8[r2];L1851:do{if(r1<<24>>24==0){r25=0}else{r9=0;r4=0;r3=r2;r16=r1;while(1){if((_isspace(r16&255)|0)==0){r14=_toupper(HEAPU8[r3])&255;HEAP8[r7+r4|0]=r14;r26=r4+1|0}else{r26=r4}r14=r9+1|0;r13=r7+r14|0;r6=HEAP8[r13];if(r6<<24>>24==0){r25=r26;break L1851}else{r9=r14;r4=r26;r3=r13;r16=r6}}}}while(0);HEAP8[r7+r25|0]=0;r25=_getenv(r2);if((r25|0)==0){_free(r12);STACKTOP=r5;return r11}r2=(_sscanf(r25,34512,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r8,tempInt))|0)==1;r25=HEAP32[r8>>2];if(!(r2&(r25|0)>0)){_free(r12);STACKTOP=r5;return r11}HEAP32[r10>>2]=r25;_free(r12);STACKTOP=r5;return r11}function _midend_can_undo(r1){return(HEAP32[r1+60>>2]|0)>1&1}function _midend_can_redo(r1){return(HEAP32[r1+60>>2]|0)<(HEAP32[r1+52>>2]|0)&1}function _midend_size(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r5=r1>>2;r6=STACKTOP;STACKTOP=STACKTOP+8|0;r7=r6;r8=r6+4;r9=(r1+76|0)>>2;r10=HEAP32[r9];do{if((r10|0)!=0){if((HEAP32[r5+33]|0)<=0){break}r11=r1+8|0;r12=r1+120|0;FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+140>>2]](HEAP32[r12>>2],r10);r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+136>>2]](HEAP32[r12>>2],HEAP32[HEAP32[r5+16]>>2]);HEAP32[r9]=r13}}while(0);r10=(r4|0)!=0;L1872:do{if(r10){r4=r1+8|0;r13=r1+68|0;r12=1;while(1){r11=r12<<1;FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+124>>2]](HEAP32[r13>>2],r11,r7,r8);if((HEAP32[r7>>2]|0)>(HEAP32[r2>>2]|0)){r14=r11;r15=r4,r16=r15>>2;r17=r13,r18=r17>>2;break L1872}if((HEAP32[r8>>2]|0)>(HEAP32[r3>>2]|0)){r14=r11;r15=r4,r16=r15>>2;r17=r13,r18=r17>>2;break L1872}else{r12=r11}}}else{r14=HEAP32[r5+32]+1|0;r15=r1+8|0,r16=r15>>2;r17=r1+68|0,r18=r17>>2}}while(0);r17=1;r15=r14;L1879:while(1){r19=r17;while(1){if((r15-r19|0)<=1){break L1879}r14=(r19+r15|0)/2&-1;FUNCTION_TABLE[HEAP32[HEAP32[r16]+124>>2]](HEAP32[r18],r14,r7,r8);if((HEAP32[r7>>2]|0)>(HEAP32[r2>>2]|0)){r17=r19;r15=r14;continue L1879}if((HEAP32[r8>>2]|0)>(HEAP32[r3>>2]|0)){r17=r19;r15=r14;continue L1879}else{r19=r14}}}r15=r1+132|0;HEAP32[r15>>2]=r19;if(r10){HEAP32[r5+32]=r19}if((r19|0)>0){r10=r1+136|0;r17=r1+140|0;FUNCTION_TABLE[HEAP32[HEAP32[r16]+124>>2]](HEAP32[r18],r19,r10,r17);FUNCTION_TABLE[HEAP32[HEAP32[r16]+128>>2]](HEAP32[r5+30],HEAP32[r9],HEAP32[r18],HEAP32[r15>>2]);r15=r10;r10=r17;r17=HEAP32[r15>>2];HEAP32[r2>>2]=r17;r18=HEAP32[r10>>2];HEAP32[r3>>2]=r18;STACKTOP=r6;return}else{r15=r1+136|0;r10=r1+140|0;r17=HEAP32[r15>>2];HEAP32[r2>>2]=r17;r18=HEAP32[r10>>2];HEAP32[r3>>2]=r18;STACKTOP=r6;return}}function _midend_set_params(r1,r2){var r3,r4;r3=r1+8|0;r4=r1+68|0;FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+28>>2]](HEAP32[r4>>2]);r1=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+32>>2]](r2);HEAP32[r4>>2]=r1;return}function _midend_get_params(r1){return FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+32>>2]](HEAP32[r1+68>>2])}function _midend_force_redraw(r1){var r2,r3,r4,r5,r6,r7;r2=(r1+76|0)>>2;r3=HEAP32[r2];r4=(r1+8|0)>>2;if((r3|0)==0){r5=r1+120|0}else{r6=r1+120|0;FUNCTION_TABLE[HEAP32[HEAP32[r4]+140>>2]](HEAP32[r6>>2],r3);r5=r6}r6=FUNCTION_TABLE[HEAP32[HEAP32[r4]+136>>2]](HEAP32[r5>>2],HEAP32[HEAP32[r1+64>>2]>>2]);HEAP32[r2]=r6;r6=r1+132|0;r3=HEAP32[r6>>2];if((r3|0)<=0){_midend_redraw(r1);return}r7=r1+68|0;FUNCTION_TABLE[HEAP32[HEAP32[r4]+124>>2]](HEAP32[r7>>2],r3,r1+136|0,r1+140|0);FUNCTION_TABLE[HEAP32[HEAP32[r4]+128>>2]](HEAP32[r5>>2],HEAP32[r2],HEAP32[r7>>2],HEAP32[r6>>2]);_midend_redraw(r1);return}function _midend_redraw(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r2=r1>>2;r3=0;r4=(r1+120|0)>>2;if((HEAP32[r4]|0)==0){___assert_func(33960,869,35652,34924)}r5=(r1+60|0)>>2;if((HEAP32[r5]|0)<=0){return}r6=(r1+76|0)>>2;if((HEAP32[r6]|0)==0){return}r7=HEAP32[r4];FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+32>>2]](HEAP32[r7+4>>2]);r7=r1+84|0;r8=HEAP32[r7>>2];do{if((r8|0)==0){r3=1388}else{r9=HEAPF32[r2+22];if(r9<=0){r3=1388;break}r10=r1+92|0;r11=HEAPF32[r10>>2];if(r11>=r9){r3=1388;break}r9=r1+104|0;r12=HEAP32[r9>>2];if((r12|0)==0){___assert_func(33960,875,35652,34852);r13=HEAP32[r7>>2];r14=HEAP32[r9>>2];r15=HEAPF32[r10>>2]}else{r13=r8;r14=r12;r15=r11}FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+144>>2]](HEAP32[r4],HEAP32[r6],r13,HEAP32[HEAP32[r2+16]+((HEAP32[r5]-1)*12&-1)>>2],r14,HEAP32[r2+20],r15,HEAPF32[r2+25]);break}}while(0);if(r3==1388){FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+144>>2]](HEAP32[r4],HEAP32[r6],0,HEAP32[HEAP32[r2+16]+((HEAP32[r5]-1)*12&-1)>>2],1,HEAP32[r2+20],0,HEAPF32[r2+25])}r2=HEAP32[r4];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+36>>2]](HEAP32[r2+4>>2]);return}function _midend_new_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r2=r1>>2;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+104|0;r5=r4;r6=r4+16;r7=r4+20;r8=r4+100;r9=(r1+52|0)>>2;r10=HEAP32[r9];L1927:do{if((r10|0)>0){r11=r1+8|0;r12=r1+64|0;r13=r10;while(1){r14=r13-1|0;HEAP32[r9]=r14;FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+68>>2]](HEAP32[HEAP32[r12>>2]+(r14*12&-1)>>2]);r14=HEAP32[r9];r15=HEAP32[HEAP32[r12>>2]+(r14*12&-1)+4>>2];if((r15|0)==0){r16=r14}else{_free(r15);r16=HEAP32[r9]}if((r16|0)>0){r13=r16}else{r17=r16;break L1927}}}else{r17=r10}}while(0);r10=(r1+76|0)>>2;r16=HEAP32[r10];if((r16|0)==0){r18=r17}else{FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+140>>2]](HEAP32[r2+30],r16);r18=HEAP32[r9]}if((r18|0)!=0){___assert_func(33960,349,35696,33660)}r18=(r1+48|0)>>2;r16=HEAP32[r18];do{if((r16|0)==0){HEAP32[r18]=2;r3=1419;break}else if((r16|0)==1){HEAP32[r18]=2;break}else{HEAP8[r5+15|0]=0;r17=r1+4|0;r13=HEAP32[r17>>2];while(1){r19=_random_bits(r13,7);if(r19>>>0<126){break}}r13=Math.floor((r19>>>0)/14)+49&255;r12=r5|0;HEAP8[r12]=r13;r13=1;while(1){r11=HEAP32[r17>>2];while(1){r20=_random_bits(r11,7);if(r20>>>0<120){break}}r11=Math.floor((r20>>>0)/12)+48&255;HEAP8[r5+r13|0]=r11;r11=r13+1|0;if((r11|0)==15){break}else{r13=r11}}r13=r1+40|0;r17=HEAP32[r13>>2];if((r17|0)!=0){_free(r17)}r17=_malloc(_strlen(r12)+1|0);if((r17|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r17,r12);HEAP32[r13>>2]=r17;r17=r1+72|0;r13=HEAP32[r17>>2];r11=r1+8|0;if((r13|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+28>>2]](r13)}r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+32>>2]](HEAP32[r2+17]);HEAP32[r17>>2]=r13;r3=1419;break}}while(0);do{if(r3==1419){r5=r1+32|0;r20=HEAP32[r5>>2];if((r20|0)!=0){_free(r20)}r20=r1+36|0;r19=HEAP32[r20>>2];if((r19|0)!=0){_free(r19)}r19=r1+44|0;r18=HEAP32[r19>>2];if((r18|0)!=0){_free(r18)}HEAP32[r19>>2]=0;r18=HEAP32[r2+10];r16=_random_new(r18,_strlen(r18));r18=FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+52>>2]](HEAP32[r2+18],r16,r19,(HEAP32[r2+30]|0)!=0&1);HEAP32[r5>>2]=r18;HEAP32[r20>>2]=0;if((r16|0)==0){break}_free(r16|0)}}while(0);r16=HEAP32[r9];r20=r1+56|0;do{if((r16|0)<(HEAP32[r20>>2]|0)){r18=r1+64|0,r21=r18>>2}else{r5=r16+128|0;HEAP32[r20>>2]=r5;r19=r1+64|0;r13=HEAP32[r19>>2];r17=r5*12&-1;if((r13|0)==0){r22=_malloc(r17)}else{r22=_realloc(r13,r17)}if((r22|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r19>>2]=r22;r18=r19,r21=r18>>2;break}}}while(0);r22=(r1+8|0)>>2;r20=(r1+68|0)>>2;r16=FUNCTION_TABLE[HEAP32[HEAP32[r22]+60>>2]](r1,HEAP32[r20],HEAP32[r2+8]);HEAP32[HEAP32[r21]+(HEAP32[r9]*12&-1)>>2]=r16;r16=HEAP32[r22];do{if((HEAP32[r16+72>>2]|0)!=0){r18=HEAP32[r2+11];if((r18|0)==0){break}HEAP32[r6>>2]=0;r19=HEAP32[HEAP32[r21]>>2];r17=FUNCTION_TABLE[HEAP32[r16+76>>2]](r19,r19,r18,r6);if(!((r17|0)!=0&(HEAP32[r6>>2]|0)==0)){___assert_func(33960,430,35696,33528)}r18=FUNCTION_TABLE[HEAP32[HEAP32[r22]+116>>2]](HEAP32[HEAP32[r21]>>2],r17);if((r18|0)==0){___assert_func(33960,432,35696,33488)}FUNCTION_TABLE[HEAP32[HEAP32[r22]+68>>2]](r18);if((r17|0)==0){break}_free(r17)}}while(0);r6=HEAP32[8279];do{if((r6|0)<0){r16=r7|0;_sprintf(r16,33412,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r22]>>2],tempInt));r17=HEAP8[r16];L2001:do{if(r17<<24>>24==0){r23=0}else{r18=0;r19=0;r13=r16;r5=r17;while(1){if((_isspace(r5&255)|0)==0){r11=_toupper(HEAPU8[r13])&255;HEAP8[r7+r18|0]=r11;r24=r18+1|0}else{r24=r18}r11=r19+1|0;r15=r7+r11|0;r14=HEAP8[r15];if(r14<<24>>24==0){r23=r24;break L2001}else{r18=r24;r19=r11;r13=r15;r5=r14}}}}while(0);HEAP8[r7+r23|0]=0;if((_getenv(r16)|0)==0){HEAP32[8279]=0;break}else{_fwrite(33336,26,1,HEAP32[_stderr>>2]);HEAP32[8279]=1;r3=1452;break}}else{if((r6|0)==0){break}else{r3=1452;break}}}while(0);do{if(r3==1452){HEAP32[r8>>2]=0;r6=HEAP32[HEAP32[r21]>>2];r23=FUNCTION_TABLE[HEAP32[HEAP32[r22]+76>>2]](r6,r6,0,r8);if(!((r23|0)!=0&(HEAP32[r8>>2]|0)==0)){___assert_func(33960,478,35696,33528)}r6=FUNCTION_TABLE[HEAP32[HEAP32[r22]+116>>2]](HEAP32[HEAP32[r21]>>2],r23);if((r6|0)==0){___assert_func(33960,480,35696,33488)}FUNCTION_TABLE[HEAP32[HEAP32[r22]+68>>2]](r6);if((r23|0)==0){break}_free(r23)}}while(0);HEAP32[HEAP32[r21]+(HEAP32[r9]*12&-1)+4>>2]=0;HEAP32[HEAP32[r21]+(HEAP32[r9]*12&-1)+8>>2]=0;HEAP32[r9]=HEAP32[r9]+1|0;r9=r1+60|0;HEAP32[r9>>2]=1;r8=r1+120|0;r23=FUNCTION_TABLE[HEAP32[HEAP32[r22]+136>>2]](HEAP32[r8>>2],HEAP32[HEAP32[r21]>>2]);HEAP32[r10]=r23;r23=r1+132|0;r6=HEAP32[r23>>2];if((r6|0)>0){FUNCTION_TABLE[HEAP32[HEAP32[r22]+124>>2]](HEAP32[r20],r6,r1+136|0,r1+140|0);FUNCTION_TABLE[HEAP32[HEAP32[r22]+128>>2]](HEAP32[r8>>2],HEAP32[r10],HEAP32[r20],HEAP32[r23>>2])}HEAPF32[r2+28]=0;r23=r1+80|0;r20=HEAP32[r23>>2];if((r20|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r22]+96>>2]](r20)}r20=FUNCTION_TABLE[HEAP32[HEAP32[r22]+92>>2]](HEAP32[HEAP32[r21]>>2]);HEAP32[r23>>2]=r20;r23=HEAP32[r22];do{if((HEAP32[r23+180>>2]|0)==0){HEAP32[r2+27]=0;r3=1465;break}else{r22=(FUNCTION_TABLE[HEAP32[r23+184>>2]](HEAP32[HEAP32[r21]+((HEAP32[r9>>2]-1)*12&-1)>>2],r20)|0)!=0;HEAP32[r2+27]=r22&1;if(r22){break}else{r3=1465;break}}}while(0);do{if(r3==1465){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r2+22]!=0){break}_deactivate_timer(HEAP32[r2]);r25=r1+124|0;HEAP32[r25>>2]=0;STACKTOP=r4;return}}while(0);_activate_timer(HEAP32[r2]);r25=r1+124|0;HEAP32[r25>>2]=0;STACKTOP=r4;return}function _midend_finish_move(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r2=r1>>2;r3=0;r4=(r1+84|0)>>2;r5=HEAP32[r4];r6=(r5|0)==0;do{if(r6){if((HEAP32[r2+15]|0)>1){r3=1474;break}else{break}}else{r3=1474}}while(0);do{if(r3==1474){r7=HEAP32[r2+26];if((r7|0)>0){r8=HEAP32[r2+15];r9=HEAP32[r2+16];if((HEAP32[r9+((r8-1)*12&-1)+8>>2]|0)==1){r10=r8;r11=r9}else{break}}else{if((r7|0)>=0){break}r9=HEAP32[r2+15];if((r9|0)>=(HEAP32[r2+13]|0)){break}r8=HEAP32[r2+16];if((HEAP32[r8+(r9*12&-1)+8>>2]|0)==1){r10=r9;r11=r8}else{break}}if(r6){r12=1;r13=HEAP32[r11+((r10-2)*12&-1)>>2]}else{r12=r7;r13=r5}r7=FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+152>>2]](r13,HEAP32[r11+((r10-1)*12&-1)>>2],r12,HEAP32[r2+20]);if(r7<=0){break}HEAPF32[r2+25]=0;HEAPF32[r2+24]=r7}}while(0);r12=HEAP32[r4];r10=r1+8|0;if((r12|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+68>>2]](r12)}HEAP32[r4]=0;r4=r1+88|0;HEAPF32[r4>>2]=0;HEAPF32[r2+23]=0;HEAP32[r2+26]=0;r1=HEAP32[r10>>2];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=1489;break}else{r10=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r2+16]+((HEAP32[r2+15]-1)*12&-1)>>2],HEAP32[r2+20])|0)!=0;HEAP32[r2+27]=r10&1;if(r10){break}else{r3=1489;break}}}while(0);do{if(r3==1489){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r4>>2]!=0){break}_deactivate_timer(HEAP32[r2]);return}}while(0);_activate_timer(HEAP32[r2]);return}function _midend_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12;r5=r1>>2;r6=(r4-515|0)>>>0<3;do{if(r6|(r4-518|0)>>>0<3){r7=HEAP32[r5+31];if((r7|0)==0){r8=1;return r8}if(r6){r9=1;r10=r7+3|0;break}else{r9=1;r10=r7+6|0;break}}else{if((r4-512|0)>>>0>=3){r9=1;r10=r4;break}r7=HEAP32[r5+31];if((r7|0)==0){r9=1;r10=r4;break}if((HEAP32[HEAP32[r5+2]+188>>2]&1<<r4-2048+(r7*3&-1)|0)==0){r9=(_midend_really_process_key(r1,r2,r3,r7+6|0)|0)!=0&1;r10=r4;break}else{r8=1;return r8}}}while(0);if((r10|0)==13|(r10|0)==10){r11=525}else{r11=r10}r10=(r11|0)==32?526:r11;r11=(r10|0)==127?8:r10;if((r9|0)==0){r12=0}else{r12=(_midend_really_process_key(r1,r2,r3,r11)|0)!=0}r3=r12&1;if((r11-518|0)>>>0<3){HEAP32[r5+31]=0;r8=r3;return r8}if((r11-512|0)>>>0>=3){r8=r3;return r8}HEAP32[r5+31]=r11;r8=r3;return r8}function _midend_restart_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r2=r1>>2;r3=0;r4=STACKTOP;r5=r1+84|0;do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=1521;break}else{break}}else{r3=1521}}while(0);if(r3==1521){_midend_finish_move(r1);_midend_redraw(r1)}r6=(r1+60|0)>>2;r7=HEAP32[r6];if((r7|0)>0){r8=r7}else{___assert_func(33960,586,35632,33252);r8=HEAP32[r6]}if((r8|0)==1){STACKTOP=r4;return}r8=(r1+8|0)>>2;r7=r1+32|0;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8]+60>>2]](r1,HEAP32[r2+17],HEAP32[r7>>2]);do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=1527;break}else{break}}else{r3=1527}}while(0);if(r3==1527){_midend_finish_move(r1);_midend_redraw(r1)}r5=(r1+52|0)>>2;r10=HEAP32[r5];L2114:do{if((r10|0)>(HEAP32[r6]|0)){r11=r1+64|0;r12=r10;while(1){r13=HEAP32[HEAP32[r8]+68>>2];r14=r12-1|0;HEAP32[r5]=r14;FUNCTION_TABLE[r13](HEAP32[HEAP32[r11>>2]+(r14*12&-1)>>2]);r14=HEAP32[r5];r13=HEAP32[HEAP32[r11>>2]+(r14*12&-1)+4>>2];if((r13|0)==0){r15=r14}else{_free(r13);r15=HEAP32[r5]}if((r15|0)>(HEAP32[r6]|0)){r12=r15}else{r16=r15;break L2114}}}else{r16=r10}}while(0);r10=r1+56|0;do{if((r16|0)<(HEAP32[r10>>2]|0)){r17=r16;r18=HEAP32[r2+16]}else{r15=r16+128|0;HEAP32[r10>>2]=r15;r12=r1+64|0;r11=HEAP32[r12>>2];r13=r15*12&-1;if((r11|0)==0){r19=_malloc(r13)}else{r19=_realloc(r11,r13)}if((r19|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r13=r19;HEAP32[r12>>2]=r13;r17=HEAP32[r5];r18=r13;break}}}while(0);r19=(r1+64|0)>>2;HEAP32[r18+(r17*12&-1)>>2]=r9;r9=HEAP32[r7>>2];r7=_malloc(_strlen(r9)+1|0);if((r7|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r7,r9);HEAP32[HEAP32[r19]+(HEAP32[r5]*12&-1)+4>>2]=r7;HEAP32[HEAP32[r19]+(HEAP32[r5]*12&-1)+8>>2]=3;r7=HEAP32[r5];r9=r7+1|0;HEAP32[r5]=r9;HEAP32[r6]=r9;r9=r1+80|0;r5=HEAP32[r9>>2];if((r5|0)!=0){r17=HEAP32[r19];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r5,HEAP32[r17+((r7-1)*12&-1)>>2],HEAP32[r17+(r7*12&-1)>>2])}r7=r1+88|0;HEAPF32[r7>>2]=0;_midend_finish_move(r1);_midend_redraw(r1);r1=HEAP32[r8];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=1548;break}else{r8=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r19]+((HEAP32[r6]-1)*12&-1)>>2],HEAP32[r9>>2])|0)!=0;HEAP32[r2+27]=r8&1;if(r8){break}else{r3=1548;break}}}while(0);do{if(r3==1548){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r7>>2]!=0){break}_deactivate_timer(HEAP32[r2]);STACKTOP=r4;return}}while(0);_activate_timer(HEAP32[r2]);STACKTOP=r4;return}function _midend_timer(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=r1>>2;r4=0;r5=r1+88|0;r6=HEAPF32[r5>>2];r7=r6>0;if(r7){r8=1}else{r8=HEAPF32[r3+24]>0}r9=r1+92|0;r10=HEAPF32[r9>>2]+r2;HEAPF32[r9>>2]=r10;do{if(r10>=r6|r6==0){if(r7){r4=1561;break}else{break}}else{if((HEAP32[r3+21]|0)!=0|r7^1){break}else{r4=1561;break}}}while(0);if(r4==1561){_midend_finish_move(r1)}r7=(r1+100|0)>>2;r6=HEAPF32[r7]+r2;HEAPF32[r7]=r6;r10=(r1+96|0)>>2;r9=HEAPF32[r10];if(r6>=r9|r9==0){HEAPF32[r10]=0;HEAPF32[r7]=0}if(r8){_midend_redraw(r1)}r8=(r1+108|0)>>2;do{if((HEAP32[r8]|0)!=0){r7=r1+112|0;r9=HEAPF32[r7>>2];r6=r9+r2;HEAPF32[r7>>2]=r6;if((r9&-1|0)==(r6&-1|0)){break}r6=HEAP32[r3+29];_status_bar(HEAP32[r3+30],(r6|0)==0?34600:r6)}}while(0);r2=HEAP32[r3+2];do{if((HEAP32[r2+180>>2]|0)==0){HEAP32[r8]=0;r4=1572;break}else{r1=(FUNCTION_TABLE[HEAP32[r2+184>>2]](HEAP32[HEAP32[r3+16]+((HEAP32[r3+15]-1)*12&-1)>>2],HEAP32[r3+20])|0)!=0;HEAP32[r8]=r1&1;if(r1){break}else{r4=1572;break}}}while(0);do{if(r4==1572){if(HEAPF32[r10]!=0){break}if(HEAPF32[r5>>2]!=0){break}_deactivate_timer(HEAP32[r3]);return}}while(0);_activate_timer(HEAP32[r3]);return}function _midend_colours(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r3=STACKTOP;STACKTOP=STACKTOP+92|0;r4=r3;r5=r3+80;r6=r3+84;r7=r3+88;r8=r1+8|0;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+132>>2]](HEAP32[r1>>2],r2),r1=r9>>2;if((HEAP32[r2>>2]|0)<=0){STACKTOP=r3;return r9}r10=r4|0;r11=0;while(1){_sprintf(r10,34740,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r8>>2]>>2],HEAP32[tempInt+4>>2]=r11,tempInt));r12=HEAP8[r10];L2185:do{if(r12<<24>>24==0){r13=0}else{r14=0;r15=0;r16=r10;r17=r12;while(1){if((_isspace(r17&255)|0)==0){r18=_toupper(HEAPU8[r16])&255;HEAP8[r4+r15|0]=r18;r19=r15+1|0}else{r19=r15}r18=r14+1|0;r20=r4+r18|0;r21=HEAP8[r20];if(r21<<24>>24==0){r13=r19;break L2185}else{r14=r18;r15=r19;r16=r20;r17=r21}}}}while(0);HEAP8[r4+r13|0]=0;r12=_getenv(r10);do{if((r12|0)!=0){if((_sscanf(r12,34720,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r6,HEAP32[tempInt+8>>2]=r7,tempInt))|0)!=3){break}r17=r11*3&-1;HEAPF32[(r17<<2>>2)+r1]=(HEAP32[r5>>2]>>>0)/255;HEAPF32[(r17+1<<2>>2)+r1]=(HEAP32[r6>>2]>>>0)/255;HEAPF32[(r17+2<<2>>2)+r1]=(HEAP32[r7>>2]>>>0)/255}}while(0);r12=r11+1|0;if((r12|0)<(HEAP32[r2>>2]|0)){r11=r12}else{break}}STACKTOP=r3;return r9}function _midend_really_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r5=r1>>2;r6=0;r7=STACKTOP;r8=(r1+8|0)>>2;r9=(r1+60|0)>>2;r10=(r1+64|0)>>2;r11=FUNCTION_TABLE[HEAP32[HEAP32[r8]+64>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2]);r12=(r1+80|0)>>2;r13=FUNCTION_TABLE[HEAP32[HEAP32[r8]+112>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12],HEAP32[r5+19],r2,r3,r4);L2198:do{if((r13|0)==0){if((r4|0)==117|(r4|0)==85|(r4|0)==31|(r4|0)==26){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=1600;break}else{break}}else{r6=1600}}while(0);if(r6==1600){_midend_finish_move(r1);_midend_redraw(r1)}r3=HEAP32[r9];r2=r3-1|0;r14=HEAP32[r10]>>2;r15=HEAP32[((r2*12&-1)+8>>2)+r14];if((r3|0)<=1){r16=1;r6=1659;break}r17=HEAP32[r12];if((r17|0)==0){r18=r3}else{FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r17,HEAP32[((r2*12&-1)>>2)+r14],HEAP32[(((r3-2)*12&-1)>>2)+r14]);r18=HEAP32[r9]}r14=r18-1|0;HEAP32[r9]=r14;HEAP32[r5+26]=-1;r19=r15;r20=r14;break}else if((r4|0)==110|(r4|0)==78|(r4|0)==14){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=1596;break}else{break}}else{r6=1596}}while(0);if(r6==1596){_midend_finish_move(r1);_midend_redraw(r1)}_midend_new_game(r1);_midend_redraw(r1);r16=1;r6=1659;break}else if((r4|0)==113|(r4|0)==81|(r4|0)==17){r16=0;r6=1659;break}else if((r4|0)==19){if((HEAP32[HEAP32[r8]+72>>2]|0)==0){r16=1;r6=1659;break}if((_midend_solve(r1)|0)==0){r6=1644;break}else{r16=1;r6=1659;break}}else if((r4|0)==114|(r4|0)==82|(r4|0)==25|(r4|0)==18){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=1606;break}else{break}}else{r6=1606}}while(0);if(r6==1606){_midend_finish_move(r1);_midend_redraw(r1)}r14=HEAP32[r9];if((r14|0)>=(HEAP32[r5+13]|0)){r16=1;r6=1659;break}r15=HEAP32[r12];if((r15|0)==0){r21=r14}else{r3=HEAP32[r10];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r15,HEAP32[r3+((r14-1)*12&-1)>>2],HEAP32[r3+(r14*12&-1)>>2]);r21=HEAP32[r9]}HEAP32[r9]=r21+1|0;HEAP32[r5+26]=1;r6=1644;break}else{r16=1;r6=1659;break}}else{do{if(HEAP8[r13]<<24>>24==0){r22=HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2]}else{r14=FUNCTION_TABLE[HEAP32[HEAP32[r8]+116>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],r13);if((r14|0)!=0){r22=r14;break}___assert_func(33960,664,35668,33400);r22=0}}while(0);r14=HEAP32[r9];if((r22|0)==(HEAP32[HEAP32[r10]+((r14-1)*12&-1)>>2]|0)){_midend_redraw(r1);r3=HEAP32[r8];do{if((HEAP32[r3+180>>2]|0)==0){HEAP32[r5+27]=0;r6=1622;break}else{r15=(FUNCTION_TABLE[HEAP32[r3+184>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12])|0)!=0;HEAP32[r5+27]=r15&1;if(r15){break}else{r6=1622;break}}}while(0);do{if(r6==1622){if(HEAPF32[r5+24]!=0){break}if(HEAPF32[r5+22]!=0){break}_deactivate_timer(HEAP32[r5]);r16=1;r6=1659;break L2198}}while(0);_activate_timer(HEAP32[r5]);r16=1;r6=1659;break}if((r22|0)==0){r16=1;r6=1659;break}do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=1629;break}else{r23=r14;break}}else{r6=1629}}while(0);if(r6==1629){_midend_finish_move(r1);_midend_redraw(r1);r23=HEAP32[r9]}r14=(r1+52|0)>>2;r3=HEAP32[r14];L2222:do{if((r3|0)>(r23|0)){r15=r3;while(1){r2=HEAP32[HEAP32[r8]+68>>2];r17=r15-1|0;HEAP32[r14]=r17;FUNCTION_TABLE[r2](HEAP32[HEAP32[r10]+(r17*12&-1)>>2]);r17=HEAP32[r14];r2=HEAP32[HEAP32[r10]+(r17*12&-1)+4>>2];if((r2|0)==0){r24=r17}else{_free(r2);r24=HEAP32[r14]}if((r24|0)>(HEAP32[r9]|0)){r15=r24}else{r25=r24;break L2222}}}else{r25=r3}}while(0);r3=r1+56|0;do{if((r25|0)>=(HEAP32[r3>>2]|0)){r15=r25+128|0;HEAP32[r3>>2]=r15;r2=HEAP32[r10];r17=r15*12&-1;if((r2|0)==0){r26=_malloc(r17)}else{r26=_realloc(r2,r17)}if((r26|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r10]=r26;break}}}while(0);HEAP32[HEAP32[r10]+(HEAP32[r14]*12&-1)>>2]=r22;HEAP32[HEAP32[r10]+(HEAP32[r14]*12&-1)+4>>2]=r13;HEAP32[HEAP32[r10]+(HEAP32[r14]*12&-1)+8>>2]=1;r3=HEAP32[r14];r17=r3+1|0;HEAP32[r14]=r17;HEAP32[r9]=r17;HEAP32[r5+26]=1;r17=HEAP32[r12];if((r17|0)==0){r6=1644;break}r2=HEAP32[r10];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r17,HEAP32[r2+((r3-1)*12&-1)>>2],HEAP32[r2+(r3*12&-1)>>2]);r6=1644;break}}while(0);if(r6==1644){r13=HEAP32[r9];r19=HEAP32[HEAP32[r10]+((r13-1)*12&-1)+8>>2];r20=r13}else if(r6==1659){if((r11|0)==0){r27=r16;STACKTOP=r7;return r27}FUNCTION_TABLE[HEAP32[HEAP32[r8]+68>>2]](r11);r27=r16;STACKTOP=r7;return r27}do{if((r19|0)==1){r28=HEAP32[r8];r6=1649;break}else if((r19|0)==2){r16=HEAP32[r8];if((HEAP32[r16+188>>2]&512|0)==0){r6=1648;break}else{r28=r16;r6=1649;break}}else{r6=1648}}while(0);do{if(r6==1648){HEAP32[r5+21]=r11;r29=r1+88|0;r6=1651;break}else if(r6==1649){r19=FUNCTION_TABLE[HEAP32[r28+148>>2]](r11,HEAP32[HEAP32[r10]+((r20-1)*12&-1)>>2],HEAP32[r5+26],HEAP32[r12]);HEAP32[r5+21]=r11;r16=r1+88|0;if(r19<=0){r29=r16;r6=1651;break}HEAPF32[r16>>2]=r19;r30=r16;break}}while(0);if(r6==1651){HEAPF32[r29>>2]=0;_midend_finish_move(r1);r30=r29}HEAPF32[r5+23]=0;_midend_redraw(r1);r1=HEAP32[r8];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r5+27]=0;r6=1655;break}else{r8=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12])|0)!=0;HEAP32[r5+27]=r8&1;if(r8){break}else{r6=1655;break}}}while(0);do{if(r6==1655){if(HEAPF32[r5+24]!=0){break}if(HEAPF32[r30>>2]!=0){break}_deactivate_timer(HEAP32[r5]);r27=1;STACKTOP=r7;return r27}}while(0);_activate_timer(HEAP32[r5]);r27=1;STACKTOP=r7;return r27}function _midend_wants_statusbar(r1){return HEAP32[HEAP32[r1+8>>2]+176>>2]}function _midend_which_preset(r1){var r2,r3,r4,r5;r2=FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+24>>2]](HEAP32[r1+68>>2],1);r3=r1+20|0;r4=HEAP32[r1+24>>2];r1=0;while(1){if((r1|0)>=(r4|0)){r5=-1;break}if((_strcmp(r2,HEAP32[HEAP32[r3>>2]+(r1<<2)>>2])|0)==0){r5=r1;break}else{r1=r1+1|0}}if((r2|0)==0){return r5}_free(r2);return r5}function _midend_status(r1){var r2,r3;r2=HEAP32[r1+60>>2];if((r2|0)==0){r3=1;return r3}r3=FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+156>>2]](HEAP32[HEAP32[r1+64>>2]+((r2-1)*12&-1)>>2]);return r3}function _shuffle(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r5=STACKTOP;STACKTOP=STACKTOP+512|0;r6=r2-1|0;if((r2|0)<=1){STACKTOP=r5;return}r7=r5|0;if((r3|0)>0){r8=r2;r9=r6}else{r10=r2;r2=r6;while(1){r6=0;while(1){if((r10>>>(r6>>>0)|0)==0){break}else{r6=r6+1|0}}r11=r6+3|0;if((r11|0)>=32){___assert_func(34228,275,35572,34804)}r12=1<<r11;r13=r12-(r12>>>0)%(r10>>>0)|0;while(1){if(_random_bits(r4,r11)>>>0<r13>>>0){break}}if((r2|0)>1){r10=r2;r2=r2-1|0}else{break}}STACKTOP=r5;return}while(1){r2=0;while(1){if((r8>>>(r2>>>0)|0)==0){break}else{r2=r2+1|0}}r10=r2+3|0;if((r10|0)>=32){___assert_func(34228,275,35572,34804)}r13=Math.floor((1<<r10>>>0)/(r8>>>0));r11=Math.imul(r13,r8);while(1){r14=_random_bits(r4,r10);if(r14>>>0<r11>>>0){break}}r11=Math.floor((r14>>>0)/(r13>>>0));L2342:do{if((r11|0)!=(r9|0)){r10=Math.imul(r11,r3);r2=r1+Math.imul(r9,r3)|0;r6=r1+r10|0;r10=r3;while(1){r12=r10>>>0<512?r10:512;_memcpy(r7,r2,r12);_memcpy(r2,r6,r12);_memcpy(r6,r7,r12);r15=r10-r12|0;if((r15|0)>0){r2=r2+r12|0;r6=r6+r12|0;r10=r15}else{break L2342}}}}while(0);if((r9|0)>1){r8=r9;r9=r9-1|0}else{break}}STACKTOP=r5;return}function _midend_num_presets(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+88|0;r4=r3;r5=r3+4;r6=r3+8;r7=(r1+24|0)>>2;r8=(r1+8|0)>>2;L2349:do{if((HEAP32[r7]|0)==0){if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+16>>2]](0,r4,r5)|0)==0){break}r9=(r1+28|0)>>2;r10=(r1+12|0)>>2;r11=(r1+16|0)>>2;r12=(r1+20|0)>>2;while(1){r13=HEAP32[r7];if((HEAP32[r9]|0)>(r13|0)){r14=r13}else{r15=r13+10|0;HEAP32[r9]=r15;r13=HEAP32[r10];r16=r15<<2;if((r13|0)==0){r17=_malloc(r16)}else{r17=_realloc(r13,r16)}if((r17|0)==0){r2=1711;break}HEAP32[r10]=r17;r16=HEAP32[r11];r13=HEAP32[r9]<<2;if((r16|0)==0){r18=_malloc(r13)}else{r18=_realloc(r16,r13)}if((r18|0)==0){r2=1716;break}HEAP32[r11]=r18;r13=HEAP32[r12];r16=HEAP32[r9]<<2;if((r13|0)==0){r19=_malloc(r16)}else{r19=_realloc(r13,r16)}if((r19|0)==0){r2=1721;break}HEAP32[r12]=r19;r14=HEAP32[r7]}HEAP32[HEAP32[r10]+(r14<<2)>>2]=HEAP32[r5>>2];HEAP32[HEAP32[r11]+(HEAP32[r7]<<2)>>2]=HEAP32[r4>>2];r16=FUNCTION_TABLE[HEAP32[HEAP32[r8]+24>>2]](HEAP32[r5>>2],1);HEAP32[HEAP32[r12]+(HEAP32[r7]<<2)>>2]=r16;r16=HEAP32[r7]+1|0;HEAP32[r7]=r16;if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+16>>2]](r16,r4,r5)|0)==0){break L2349}}if(r2==1721){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1711){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1716){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}}while(0);r5=r6|0;_sprintf(r5,34688,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r8]>>2],tempInt));r4=HEAP8[r5];L2377:do{if(r4<<24>>24==0){r20=0}else{r14=0;r19=0;r18=r5;r17=r4;while(1){if((_isspace(r17&255)|0)==0){r12=_toupper(HEAPU8[r18])&255;HEAP8[r6+r14|0]=r12;r21=r14+1|0}else{r21=r14}r12=r19+1|0;r11=r6+r12|0;r10=HEAP8[r11];if(r10<<24>>24==0){r20=r21;break L2377}else{r14=r21;r19=r12;r18=r11;r17=r10}}}}while(0);HEAP8[r6+r20|0]=0;r20=_getenv(r5);if((r20|0)==0){r22=HEAP32[r7];STACKTOP=r3;return r22}r5=_malloc(_strlen(r20)+1|0);if((r5|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r20);r20=HEAP8[r5];L2390:do{if(r20<<24>>24!=0){r6=(r1+28|0)>>2;r21=(r1+12|0)>>2;r4=(r1+16|0)>>2;r17=(r1+20|0)>>2;r18=r5;r19=r20;while(1){r14=r18;r10=r19;while(1){r23=r10<<24>>24==0;r24=r14+1|0;if(!(r10<<24>>24!=58&(r23^1))){break}r14=r24;r10=HEAP8[r24]}if(r23){r25=r14}else{HEAP8[r14]=0;r25=r24}r10=r25;while(1){r11=HEAP8[r10];r26=r11<<24>>24==0;r27=r10+1|0;if(r11<<24>>24!=58&(r26^1)){r10=r27}else{break}}if(r26){r28=r10}else{HEAP8[r10]=0;r28=r27}r14=FUNCTION_TABLE[HEAP32[HEAP32[r8]+12>>2]]();FUNCTION_TABLE[HEAP32[HEAP32[r8]+20>>2]](r14,r25);if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+48>>2]](r14,1)|0)==0){r11=HEAP32[r7];if((HEAP32[r6]|0)>(r11|0)){r29=r11}else{r12=r11+10|0;HEAP32[r6]=r12;r11=HEAP32[r21];r9=r12<<2;if((r11|0)==0){r30=_malloc(r9)}else{r30=_realloc(r11,r9)}if((r30|0)==0){r2=1750;break}HEAP32[r21]=r30;r9=HEAP32[r4];r11=HEAP32[r6]<<2;if((r9|0)==0){r31=_malloc(r11)}else{r31=_realloc(r9,r11)}if((r31|0)==0){r2=1755;break}HEAP32[r4]=r31;r11=HEAP32[r17];r9=HEAP32[r6]<<2;if((r11|0)==0){r32=_malloc(r9)}else{r32=_realloc(r11,r9)}if((r32|0)==0){r2=1760;break}HEAP32[r17]=r32;r29=HEAP32[r7]}HEAP32[HEAP32[r21]+(r29<<2)>>2]=r14;r9=_malloc(_strlen(r18)+1|0);if((r9|0)==0){r2=1763;break}_strcpy(r9,r18);HEAP32[HEAP32[r4]+(HEAP32[r7]<<2)>>2]=r9;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8]+24>>2]](r14,1);HEAP32[HEAP32[r17]+(HEAP32[r7]<<2)>>2]=r9;HEAP32[r7]=HEAP32[r7]+1|0}else{FUNCTION_TABLE[HEAP32[HEAP32[r8]+28>>2]](r14)}r14=HEAP8[r28];if(r14<<24>>24==0){break L2390}else{r18=r28;r19=r14}}if(r2==1760){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1755){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1750){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1763){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}}while(0);_free(r5);r22=HEAP32[r7];STACKTOP=r3;return r22}function _midend_solve(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r2=r1>>2;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+4|0;r5=r4,r6=r5>>2;r7=(r1+8|0)>>2;r8=HEAP32[r7];if((HEAP32[r8+72>>2]|0)==0){r9=34100;STACKTOP=r4;return r9}r10=(r1+60|0)>>2;r11=HEAP32[r10];if((r11|0)<1){r9=34044;STACKTOP=r4;return r9}HEAP32[r6]=0;r12=(r1+64|0)>>2;r13=HEAP32[r12];r14=FUNCTION_TABLE[HEAP32[r8+76>>2]](HEAP32[r13>>2],HEAP32[r13+((r11-1)*12&-1)>>2],HEAP32[r2+11],r5);if((r14|0)==0){r5=HEAP32[r6];if((r5|0)!=0){r9=r5;STACKTOP=r4;return r9}HEAP32[r6]=33972;r9=33972;STACKTOP=r4;return r9}r6=FUNCTION_TABLE[HEAP32[HEAP32[r7]+116>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-1)*12&-1)>>2],r14);if((r6|0)==0){___assert_func(33960,1376,35616,33488)}r5=r1+84|0;do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=1778;break}else{break}}else{r3=1778}}while(0);if(r3==1778){_midend_finish_move(r1);_midend_redraw(r1)}r11=(r1+52|0)>>2;r13=HEAP32[r11];L2459:do{if((r13|0)>(HEAP32[r10]|0)){r8=r13;while(1){r15=HEAP32[HEAP32[r7]+68>>2];r16=r8-1|0;HEAP32[r11]=r16;FUNCTION_TABLE[r15](HEAP32[HEAP32[r12]+(r16*12&-1)>>2]);r16=HEAP32[r11];r15=HEAP32[HEAP32[r12]+(r16*12&-1)+4>>2];if((r15|0)==0){r17=r16}else{_free(r15);r17=HEAP32[r11]}if((r17|0)>(HEAP32[r10]|0)){r8=r17}else{r18=r17;break L2459}}}else{r18=r13}}while(0);r13=r1+56|0;do{if((r18|0)<(HEAP32[r13>>2]|0)){r19=r18;r20=HEAP32[r12]}else{r17=r18+128|0;HEAP32[r13>>2]=r17;r8=HEAP32[r12];r15=r17*12&-1;if((r8|0)==0){r21=_malloc(r15)}else{r21=_realloc(r8,r15)}if((r21|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r15=r21;HEAP32[r12]=r15;r19=HEAP32[r11];r20=r15;break}}}while(0);HEAP32[r20+(r19*12&-1)>>2]=r6;HEAP32[HEAP32[r12]+(HEAP32[r11]*12&-1)+4>>2]=r14;HEAP32[HEAP32[r12]+(HEAP32[r11]*12&-1)+8>>2]=2;r14=HEAP32[r11];r6=r14+1|0;HEAP32[r11]=r6;HEAP32[r10]=r6;r6=(r1+80|0)>>2;r11=HEAP32[r6];if((r11|0)!=0){r19=HEAP32[r12];FUNCTION_TABLE[HEAP32[HEAP32[r7]+108>>2]](r11,HEAP32[r19+((r14-1)*12&-1)>>2],HEAP32[r19+(r14*12&-1)>>2])}HEAP32[r2+26]=1;r14=HEAP32[r7];if((HEAP32[r14+188>>2]&512|0)==0){HEAPF32[r2+22]=0;_midend_finish_move(r1)}else{r19=FUNCTION_TABLE[HEAP32[r14+64>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-2)*12&-1)>>2]);HEAP32[r5>>2]=r19;r19=HEAP32[r10];r5=HEAP32[r12];r14=FUNCTION_TABLE[HEAP32[HEAP32[r7]+148>>2]](HEAP32[r5+((r19-2)*12&-1)>>2],HEAP32[r5+((r19-1)*12&-1)>>2],1,HEAP32[r6]);HEAPF32[r2+22]=r14;HEAPF32[r2+23]=0}if((HEAP32[r2+30]|0)!=0){_midend_redraw(r1)}r1=HEAP32[r7];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=1801;break}else{r7=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-1)*12&-1)>>2],HEAP32[r6])|0)!=0;HEAP32[r2+27]=r7&1;if(r7){break}else{r3=1801;break}}}while(0);do{if(r3==1801){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r2+22]!=0){break}_deactivate_timer(HEAP32[r2]);r9=0;STACKTOP=r4;return r9}}while(0);_activate_timer(HEAP32[r2]);r9=0;STACKTOP=r4;return r9}function _midend_rewrite_statusbar(r1,r2){var r3,r4,r5,r6,r7;r3=STACKTOP;STACKTOP=STACKTOP+100|0;r4=r3;r5=r1+116|0;r6=HEAP32[r5>>2];do{if((r6|0)!=(r2|0)){if((r6|0)!=0){_free(r6)}r7=_malloc(_strlen(r2)+1|0);if((r7|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r7,r2);HEAP32[r5>>2]=r7;break}}}while(0);if((HEAP32[HEAP32[r1+8>>2]+180>>2]|0)==0){r5=_malloc(_strlen(r2)+1|0);if((r5|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r2);r6=r5;STACKTOP=r3;return r6}else{r5=HEAPF32[r1+112>>2]&-1;r1=r4|0;_sprintf(r1,33900,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=(r5|0)/60&-1,HEAP32[tempInt+4>>2]=(r5|0)%60,tempInt));r5=_malloc(_strlen(r1)+_strlen(r2)+1|0);if((r5|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r1);_strcat(r5,r2);r6=r5;STACKTOP=r3;return r6}}function _draw_rect_corners(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13;r6=r2-r4|0;r7=r3-r4|0;r8=(r4|0)/2&-1;r9=r3-r8|0;r10=(r1|0)>>2;r11=(r1+4|0)>>2;FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](HEAP32[r11],r6,r7,r6,r9,r5);r1=r2-r8|0;FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](HEAP32[r11],r6,r7,r1,r7,r5);r12=r4+r3|0;r13=r8+r3|0;FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](HEAP32[r11],r6,r12,r6,r13,r5);FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](HEAP32[r11],r6,r12,r1,r12,r5);r1=r4+r2|0;FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](HEAP32[r11],r1,r7,r1,r9,r5);r9=r8+r2|0;FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](HEAP32[r11],r1,r7,r9,r7,r5);FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](HEAP32[r11],r1,r12,r1,r13,r5);FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](HEAP32[r11],r1,r12,r9,r12,r5);return}function _SHA_Bytes(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+384|0;r6=r5,r7=r6>>2;r8=r5+320;r9=r1+92|0;r10=_llvm_uadd_with_overflow_i32(HEAP32[r9>>2],r3);HEAP32[r9>>2]=r10;r10=r1+88|0;HEAP32[r10>>2]=(tempRet0&1)+HEAP32[r10>>2]|0;r10=(r1+84|0)>>2;r9=HEAP32[r10];r11=r9+r3|0;do{if((r9|0)==0){if((r11|0)>63){r4=1831;break}else{r12=r2;r13=r3;break}}else{if((r11|0)>=64){r4=1831;break}_memcpy(r1+(r9+20)|0,r2,r3);r14=HEAP32[r10]+r3|0;HEAP32[r10]=r14;STACKTOP=r5;return}}while(0);L2525:do{if(r4==1831){r11=r1|0;r15=r6;r16=r8;r17=r1+4|0;r18=r1+8|0;r19=r1+12|0;r20=r1+16|0;r21=r2;r22=r3;r23=r9;while(1){_memcpy(r1+(r23+20)|0,r21,64-r23|0);r24=64-HEAP32[r10]|0;r25=r21+r24|0;r26=0;while(1){r27=r26<<2;HEAP32[r8+(r26<<2)>>2]=HEAPU8[(r27|1)+r1+20|0]<<16|HEAPU8[r1+(r27+20)|0]<<24|HEAPU8[(r27|2)+r1+20|0]<<8|HEAPU8[(r27|3)+r1+20|0];r27=r26+1|0;if((r27|0)==16){break}else{r26=r27}}_memcpy(r15,r16,64);r26=16;while(1){r27=HEAP32[(r26-8<<2>>2)+r7]^HEAP32[(r26-3<<2>>2)+r7]^HEAP32[(r26-14<<2>>2)+r7]^HEAP32[(r26-16<<2>>2)+r7];HEAP32[(r26<<2>>2)+r7]=r27<<1|r27>>>31;r27=r26+1|0;if((r27|0)==80){break}else{r26=r27}}r26=HEAP32[r11>>2];r27=HEAP32[r17>>2];r28=HEAP32[r18>>2];r29=HEAP32[r19>>2];r30=HEAP32[r20>>2];r31=0;r32=r30;r33=r29;r34=r28;r35=r27;r36=r26;while(1){r37=(r36<<5|r36>>>27)+r32+(r33&(r35^-1)|r34&r35)+HEAP32[(r31<<2>>2)+r7]+1518500249|0;r38=r35<<30|r35>>>2;r39=r31+1|0;if((r39|0)==20){r40=20;r41=r33;r42=r34;r43=r38;r44=r36;r45=r37;break}else{r31=r39;r32=r33;r33=r34;r34=r38;r35=r36;r36=r37}}while(1){r36=(r45<<5|r45>>>27)+r41+(r43^r44^r42)+HEAP32[(r40<<2>>2)+r7]+1859775393|0;r35=r44<<30|r44>>>2;r34=r40+1|0;if((r34|0)==40){r46=40;r47=r42;r48=r43;r49=r35;r50=r45;r51=r36;break}else{r40=r34;r41=r42;r42=r43;r43=r35;r44=r45;r45=r36}}while(1){r36=(r51<<5|r51>>>27)-1894007588+r47+((r48|r49)&r50|r48&r49)+HEAP32[(r46<<2>>2)+r7]|0;r35=r50<<30|r50>>>2;r34=r46+1|0;if((r34|0)==60){r52=60;r53=r48;r54=r49;r55=r35;r56=r51;r57=r36;break}else{r46=r34;r47=r48;r48=r49;r49=r35;r50=r51;r51=r36}}while(1){r58=(r57<<5|r57>>>27)-899497514+r53+(r55^r56^r54)+HEAP32[(r52<<2>>2)+r7]|0;r59=r56<<30|r56>>>2;r36=r52+1|0;if((r36|0)==80){break}else{r52=r36;r53=r54;r54=r55;r55=r59;r56=r57;r57=r58}}r36=r22-r24|0;HEAP32[r11>>2]=r58+r26|0;HEAP32[r17>>2]=r57+r27|0;HEAP32[r18>>2]=r59+r28|0;HEAP32[r19>>2]=r55+r29|0;HEAP32[r20>>2]=r54+r30|0;HEAP32[r10]=0;if((r36|0)>63){r21=r25;r22=r36;r23=0}else{r12=r25;r13=r36;break L2525}}}}while(0);_memcpy(r1+20|0,r12,r13);r14=r13;HEAP32[r10]=r14;STACKTOP=r5;return}function _SHA_Final(r1,r2){var r3,r4,r5,r6,r7,r8;r3=STACKTOP;STACKTOP=STACKTOP+64|0;r4=r3;r5=HEAP32[r1+84>>2];r6=((r5|0)>55?120:56)-r5|0;r5=HEAP32[r1+88>>2];r7=HEAP32[r1+92>>2];r8=r4|0;_memset(r8,0,r6);HEAP8[r8]=-128;_SHA_Bytes(r1,r8,r6);HEAP8[r8]=r5>>>21&255;HEAP8[r4+1|0]=r5>>>13&255;HEAP8[r4+2|0]=r5>>>5&255;HEAP8[r4+3|0]=(r7>>>29|r5<<3)&255;HEAP8[r4+4|0]=r7>>>21&255;HEAP8[r4+5|0]=r7>>>13&255;HEAP8[r4+6|0]=r7>>>5&255;HEAP8[r4+7|0]=r7<<3&255;_SHA_Bytes(r1,r8,8);r8=(r1|0)>>2;HEAP8[r2]=HEAP32[r8]>>>24&255;HEAP8[r2+1|0]=HEAP32[r8]>>>16&255;HEAP8[r2+2|0]=HEAP32[r8]>>>8&255;HEAP8[r2+3|0]=HEAP32[r8]&255;r8=(r1+4|0)>>2;HEAP8[r2+4|0]=HEAP32[r8]>>>24&255;HEAP8[r2+5|0]=HEAP32[r8]>>>16&255;HEAP8[r2+6|0]=HEAP32[r8]>>>8&255;HEAP8[r2+7|0]=HEAP32[r8]&255;r8=(r1+8|0)>>2;HEAP8[r2+8|0]=HEAP32[r8]>>>24&255;HEAP8[r2+9|0]=HEAP32[r8]>>>16&255;HEAP8[r2+10|0]=HEAP32[r8]>>>8&255;HEAP8[r2+11|0]=HEAP32[r8]&255;r8=(r1+12|0)>>2;HEAP8[r2+12|0]=HEAP32[r8]>>>24&255;HEAP8[r2+13|0]=HEAP32[r8]>>>16&255;HEAP8[r2+14|0]=HEAP32[r8]>>>8&255;HEAP8[r2+15|0]=HEAP32[r8]&255;r8=(r1+16|0)>>2;HEAP8[r2+16|0]=HEAP32[r8]>>>24&255;HEAP8[r2+17|0]=HEAP32[r8]>>>16&255;HEAP8[r2+18|0]=HEAP32[r8]>>>8&255;HEAP8[r2+19|0]=HEAP32[r8]&255;STACKTOP=r3;return}function _random_bits(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+96|0;r5=r4;if((r2|0)<=0){r6=0;r7=r2-1|0;r8=2<<r7;r9=r8-1|0;r10=r6&r9;STACKTOP=r4;return r10}r11=(r1+60|0)>>2;r12=r1|0;r13=r1+40|0;r14=r5|0;r15=r5+4|0;r16=r5+8|0;r17=r5+12|0;r18=r5+16|0;r19=r5+84|0;r20=r5+92|0;r21=r5+88|0;r22=0;r23=0;r24=HEAP32[r11];while(1){if((r24|0)>19){r25=0;while(1){r26=r1+r25|0;r27=HEAP8[r26];if(r27<<24>>24!=-1){r3=1853;break}HEAP8[r26]=0;r28=r25+1|0;if((r28|0)<20){r25=r28}else{break}}if(r3==1853){r3=0;HEAP8[r26]=r27+1&255}HEAP32[r14>>2]=1732584193;HEAP32[r15>>2]=-271733879;HEAP32[r16>>2]=-1732584194;HEAP32[r17>>2]=271733878;HEAP32[r18>>2]=-1009589776;HEAP32[r19>>2]=0;HEAP32[r20>>2]=0;HEAP32[r21>>2]=0;_SHA_Bytes(r5,r12,40);_SHA_Final(r5,r13);HEAP32[r11]=0;r29=0}else{r29=r24}r25=r29+1|0;HEAP32[r11]=r25;r28=HEAPU8[r1+(r29+40)|0]|r22<<8;r30=r23+8|0;if((r30|0)<(r2|0)){r22=r28;r23=r30;r24=r25}else{r6=r28;break}}r7=r2-1|0;r8=2<<r7;r9=r8-1|0;r10=r6&r9;STACKTOP=r4;return r10}function _random_new(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=STACKTOP;STACKTOP=STACKTOP+288|0;r4=r3,r5=r4>>2;r6=r3+96,r7=r6>>2;r8=r3+192,r9=r8>>2;r10=_malloc(64);if((r10|0)==0){_fatal(34936,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r9]=1732584193;HEAP32[r9+1]=-271733879;HEAP32[r9+2]=-1732584194;HEAP32[r9+3]=271733878;HEAP32[r9+4]=-1009589776;HEAP32[r9+21]=0;HEAP32[r9+23]=0;HEAP32[r9+22]=0;_SHA_Bytes(r8,r1,r2);_SHA_Final(r8,r10);HEAP32[r7]=1732584193;HEAP32[r7+1]=-271733879;HEAP32[r7+2]=-1732584194;HEAP32[r7+3]=271733878;HEAP32[r7+4]=-1009589776;HEAP32[r7+21]=0;HEAP32[r7+23]=0;HEAP32[r7+22]=0;_SHA_Bytes(r6,r10,20);_SHA_Final(r6,r10+20|0);HEAP32[r5]=1732584193;HEAP32[r5+1]=-271733879;HEAP32[r5+2]=-1732584194;HEAP32[r5+3]=271733878;HEAP32[r5+4]=-1009589776;HEAP32[r5+21]=0;HEAP32[r5+23]=0;HEAP32[r5+22]=0;_SHA_Bytes(r4,r10,40);_SHA_Final(r4,r10+40|0);HEAP32[r10+60>>2]=0;STACKTOP=r3;return r10}}function _malloc(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95;r2=0;do{if(r1>>>0<245){if(r1>>>0<11){r3=16}else{r3=r1+11&-8}r4=r3>>>3;r5=HEAP32[8749];r6=r5>>>(r4>>>0);if((r6&3|0)!=0){r7=(r6&1^1)+r4|0;r8=r7<<1;r9=(r8<<2)+35036|0;r10=(r8+2<<2)+35036|0;r8=HEAP32[r10>>2];r11=r8+8|0;r12=HEAP32[r11>>2];do{if((r9|0)==(r12|0)){HEAP32[8749]=r5&(1<<r7^-1)}else{if(r12>>>0<HEAP32[8753]>>>0){_abort()}r13=r12+12|0;if((HEAP32[r13>>2]|0)==(r8|0)){HEAP32[r13>>2]=r9;HEAP32[r10>>2]=r12;break}else{_abort()}}}while(0);r12=r7<<3;HEAP32[r8+4>>2]=r12|3;r10=r8+(r12|4)|0;HEAP32[r10>>2]=HEAP32[r10>>2]|1;r14=r11;return r14}if(r3>>>0<=HEAP32[8751]>>>0){r15=r3,r16=r15>>2;break}if((r6|0)!=0){r10=2<<r4;r12=r6<<r4&(r10|-r10);r10=(r12&-r12)-1|0;r12=r10>>>12&16;r9=r10>>>(r12>>>0);r10=r9>>>5&8;r13=r9>>>(r10>>>0);r9=r13>>>2&4;r17=r13>>>(r9>>>0);r13=r17>>>1&2;r18=r17>>>(r13>>>0);r17=r18>>>1&1;r19=(r10|r12|r9|r13|r17)+(r18>>>(r17>>>0))|0;r17=r19<<1;r18=(r17<<2)+35036|0;r13=(r17+2<<2)+35036|0;r17=HEAP32[r13>>2];r9=r17+8|0;r12=HEAP32[r9>>2];do{if((r18|0)==(r12|0)){HEAP32[8749]=r5&(1<<r19^-1)}else{if(r12>>>0<HEAP32[8753]>>>0){_abort()}r10=r12+12|0;if((HEAP32[r10>>2]|0)==(r17|0)){HEAP32[r10>>2]=r18;HEAP32[r13>>2]=r12;break}else{_abort()}}}while(0);r12=r19<<3;r13=r12-r3|0;HEAP32[r17+4>>2]=r3|3;r18=r17;r5=r18+r3|0;HEAP32[r18+(r3|4)>>2]=r13|1;HEAP32[r18+r12>>2]=r13;r12=HEAP32[8751];if((r12|0)!=0){r18=HEAP32[8754];r4=r12>>>3;r12=r4<<1;r6=(r12<<2)+35036|0;r11=HEAP32[8749];r8=1<<r4;do{if((r11&r8|0)==0){HEAP32[8749]=r11|r8;r20=r6;r21=(r12+2<<2)+35036|0}else{r4=(r12+2<<2)+35036|0;r7=HEAP32[r4>>2];if(r7>>>0>=HEAP32[8753]>>>0){r20=r7;r21=r4;break}_abort()}}while(0);HEAP32[r21>>2]=r18;HEAP32[r20+12>>2]=r18;HEAP32[r18+8>>2]=r20;HEAP32[r18+12>>2]=r6}HEAP32[8751]=r13;HEAP32[8754]=r5;r14=r9;return r14}r12=HEAP32[8750];if((r12|0)==0){r15=r3,r16=r15>>2;break}r8=(r12&-r12)-1|0;r12=r8>>>12&16;r11=r8>>>(r12>>>0);r8=r11>>>5&8;r17=r11>>>(r8>>>0);r11=r17>>>2&4;r19=r17>>>(r11>>>0);r17=r19>>>1&2;r4=r19>>>(r17>>>0);r19=r4>>>1&1;r7=HEAP32[((r8|r12|r11|r17|r19)+(r4>>>(r19>>>0))<<2)+35300>>2];r19=r7;r4=r7,r17=r4>>2;r11=(HEAP32[r7+4>>2]&-8)-r3|0;while(1){r7=HEAP32[r19+16>>2];if((r7|0)==0){r12=HEAP32[r19+20>>2];if((r12|0)==0){break}else{r22=r12}}else{r22=r7}r7=(HEAP32[r22+4>>2]&-8)-r3|0;r12=r7>>>0<r11>>>0;r19=r22;r4=r12?r22:r4,r17=r4>>2;r11=r12?r7:r11}r19=r4;r9=HEAP32[8753];if(r19>>>0<r9>>>0){_abort()}r5=r19+r3|0;r13=r5;if(r19>>>0>=r5>>>0){_abort()}r5=HEAP32[r17+6];r6=HEAP32[r17+3];L2622:do{if((r6|0)==(r4|0)){r18=r4+20|0;r7=HEAP32[r18>>2];do{if((r7|0)==0){r12=r4+16|0;r8=HEAP32[r12>>2];if((r8|0)==0){r23=0,r24=r23>>2;break L2622}else{r25=r8;r26=r12;break}}else{r25=r7;r26=r18}}while(0);while(1){r18=r25+20|0;r7=HEAP32[r18>>2];if((r7|0)!=0){r25=r7;r26=r18;continue}r18=r25+16|0;r7=HEAP32[r18>>2];if((r7|0)==0){break}else{r25=r7;r26=r18}}if(r26>>>0<r9>>>0){_abort()}else{HEAP32[r26>>2]=0;r23=r25,r24=r23>>2;break}}else{r18=HEAP32[r17+2];if(r18>>>0<r9>>>0){_abort()}r7=r18+12|0;if((HEAP32[r7>>2]|0)!=(r4|0)){_abort()}r12=r6+8|0;if((HEAP32[r12>>2]|0)==(r4|0)){HEAP32[r7>>2]=r6;HEAP32[r12>>2]=r18;r23=r6,r24=r23>>2;break}else{_abort()}}}while(0);L2644:do{if((r5|0)!=0){r6=r4+28|0;r9=(HEAP32[r6>>2]<<2)+35300|0;do{if((r4|0)==(HEAP32[r9>>2]|0)){HEAP32[r9>>2]=r23;if((r23|0)!=0){break}HEAP32[8750]=HEAP32[8750]&(1<<HEAP32[r6>>2]^-1);break L2644}else{if(r5>>>0<HEAP32[8753]>>>0){_abort()}r18=r5+16|0;if((HEAP32[r18>>2]|0)==(r4|0)){HEAP32[r18>>2]=r23}else{HEAP32[r5+20>>2]=r23}if((r23|0)==0){break L2644}}}while(0);if(r23>>>0<HEAP32[8753]>>>0){_abort()}HEAP32[r24+6]=r5;r6=HEAP32[r17+4];do{if((r6|0)!=0){if(r6>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r24+4]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);r6=HEAP32[r17+5];if((r6|0)==0){break}if(r6>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r24+5]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);if(r11>>>0<16){r5=r11+r3|0;HEAP32[r17+1]=r5|3;r6=r5+(r19+4)|0;HEAP32[r6>>2]=HEAP32[r6>>2]|1}else{HEAP32[r17+1]=r3|3;HEAP32[r19+(r3|4)>>2]=r11|1;HEAP32[r19+r11+r3>>2]=r11;r6=HEAP32[8751];if((r6|0)!=0){r5=HEAP32[8754];r9=r6>>>3;r6=r9<<1;r18=(r6<<2)+35036|0;r12=HEAP32[8749];r7=1<<r9;do{if((r12&r7|0)==0){HEAP32[8749]=r12|r7;r27=r18;r28=(r6+2<<2)+35036|0}else{r9=(r6+2<<2)+35036|0;r8=HEAP32[r9>>2];if(r8>>>0>=HEAP32[8753]>>>0){r27=r8;r28=r9;break}_abort()}}while(0);HEAP32[r28>>2]=r5;HEAP32[r27+12>>2]=r5;HEAP32[r5+8>>2]=r27;HEAP32[r5+12>>2]=r18}HEAP32[8751]=r11;HEAP32[8754]=r13}r6=r4+8|0;if((r6|0)==0){r15=r3,r16=r15>>2;break}else{r14=r6}return r14}else{if(r1>>>0>4294967231){r15=-1,r16=r15>>2;break}r6=r1+11|0;r7=r6&-8,r12=r7>>2;r19=HEAP32[8750];if((r19|0)==0){r15=r7,r16=r15>>2;break}r17=-r7|0;r9=r6>>>8;do{if((r9|0)==0){r29=0}else{if(r7>>>0>16777215){r29=31;break}r6=(r9+1048320|0)>>>16&8;r8=r9<<r6;r10=(r8+520192|0)>>>16&4;r30=r8<<r10;r8=(r30+245760|0)>>>16&2;r31=14-(r10|r6|r8)+(r30<<r8>>>15)|0;r29=r7>>>((r31+7|0)>>>0)&1|r31<<1}}while(0);r9=HEAP32[(r29<<2)+35300>>2];L2692:do{if((r9|0)==0){r32=0;r33=r17;r34=0}else{if((r29|0)==31){r35=0}else{r35=25-(r29>>>1)|0}r4=0;r13=r17;r11=r9,r18=r11>>2;r5=r7<<r35;r31=0;while(1){r8=HEAP32[r18+1]&-8;r30=r8-r7|0;if(r30>>>0<r13>>>0){if((r8|0)==(r7|0)){r32=r11;r33=r30;r34=r11;break L2692}else{r36=r11;r37=r30}}else{r36=r4;r37=r13}r30=HEAP32[r18+5];r8=HEAP32[((r5>>>31<<2)+16>>2)+r18];r6=(r30|0)==0|(r30|0)==(r8|0)?r31:r30;if((r8|0)==0){r32=r36;r33=r37;r34=r6;break L2692}else{r4=r36;r13=r37;r11=r8,r18=r11>>2;r5=r5<<1;r31=r6}}}}while(0);if((r34|0)==0&(r32|0)==0){r9=2<<r29;r17=r19&(r9|-r9);if((r17|0)==0){r15=r7,r16=r15>>2;break}r9=(r17&-r17)-1|0;r17=r9>>>12&16;r31=r9>>>(r17>>>0);r9=r31>>>5&8;r5=r31>>>(r9>>>0);r31=r5>>>2&4;r11=r5>>>(r31>>>0);r5=r11>>>1&2;r18=r11>>>(r5>>>0);r11=r18>>>1&1;r38=HEAP32[((r9|r17|r31|r5|r11)+(r18>>>(r11>>>0))<<2)+35300>>2]}else{r38=r34}L2707:do{if((r38|0)==0){r39=r33;r40=r32,r41=r40>>2}else{r11=r38,r18=r11>>2;r5=r33;r31=r32;while(1){r17=(HEAP32[r18+1]&-8)-r7|0;r9=r17>>>0<r5>>>0;r13=r9?r17:r5;r17=r9?r11:r31;r9=HEAP32[r18+4];if((r9|0)!=0){r11=r9,r18=r11>>2;r5=r13;r31=r17;continue}r9=HEAP32[r18+5];if((r9|0)==0){r39=r13;r40=r17,r41=r40>>2;break L2707}else{r11=r9,r18=r11>>2;r5=r13;r31=r17}}}}while(0);if((r40|0)==0){r15=r7,r16=r15>>2;break}if(r39>>>0>=(HEAP32[8751]-r7|0)>>>0){r15=r7,r16=r15>>2;break}r19=r40,r31=r19>>2;r5=HEAP32[8753];if(r19>>>0<r5>>>0){_abort()}r11=r19+r7|0;r18=r11;if(r19>>>0>=r11>>>0){_abort()}r17=HEAP32[r41+6];r13=HEAP32[r41+3];L2720:do{if((r13|0)==(r40|0)){r9=r40+20|0;r4=HEAP32[r9>>2];do{if((r4|0)==0){r6=r40+16|0;r8=HEAP32[r6>>2];if((r8|0)==0){r42=0,r43=r42>>2;break L2720}else{r44=r8;r45=r6;break}}else{r44=r4;r45=r9}}while(0);while(1){r9=r44+20|0;r4=HEAP32[r9>>2];if((r4|0)!=0){r44=r4;r45=r9;continue}r9=r44+16|0;r4=HEAP32[r9>>2];if((r4|0)==0){break}else{r44=r4;r45=r9}}if(r45>>>0<r5>>>0){_abort()}else{HEAP32[r45>>2]=0;r42=r44,r43=r42>>2;break}}else{r9=HEAP32[r41+2];if(r9>>>0<r5>>>0){_abort()}r4=r9+12|0;if((HEAP32[r4>>2]|0)!=(r40|0)){_abort()}r6=r13+8|0;if((HEAP32[r6>>2]|0)==(r40|0)){HEAP32[r4>>2]=r13;HEAP32[r6>>2]=r9;r42=r13,r43=r42>>2;break}else{_abort()}}}while(0);L2742:do{if((r17|0)!=0){r13=r40+28|0;r5=(HEAP32[r13>>2]<<2)+35300|0;do{if((r40|0)==(HEAP32[r5>>2]|0)){HEAP32[r5>>2]=r42;if((r42|0)!=0){break}HEAP32[8750]=HEAP32[8750]&(1<<HEAP32[r13>>2]^-1);break L2742}else{if(r17>>>0<HEAP32[8753]>>>0){_abort()}r9=r17+16|0;if((HEAP32[r9>>2]|0)==(r40|0)){HEAP32[r9>>2]=r42}else{HEAP32[r17+20>>2]=r42}if((r42|0)==0){break L2742}}}while(0);if(r42>>>0<HEAP32[8753]>>>0){_abort()}HEAP32[r43+6]=r17;r13=HEAP32[r41+4];do{if((r13|0)!=0){if(r13>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r43+4]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);r13=HEAP32[r41+5];if((r13|0)==0){break}if(r13>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r43+5]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);do{if(r39>>>0<16){r17=r39+r7|0;HEAP32[r41+1]=r17|3;r13=r17+(r19+4)|0;HEAP32[r13>>2]=HEAP32[r13>>2]|1}else{HEAP32[r41+1]=r7|3;HEAP32[((r7|4)>>2)+r31]=r39|1;HEAP32[(r39>>2)+r31+r12]=r39;r13=r39>>>3;if(r39>>>0<256){r17=r13<<1;r5=(r17<<2)+35036|0;r9=HEAP32[8749];r6=1<<r13;do{if((r9&r6|0)==0){HEAP32[8749]=r9|r6;r46=r5;r47=(r17+2<<2)+35036|0}else{r13=(r17+2<<2)+35036|0;r4=HEAP32[r13>>2];if(r4>>>0>=HEAP32[8753]>>>0){r46=r4;r47=r13;break}_abort()}}while(0);HEAP32[r47>>2]=r18;HEAP32[r46+12>>2]=r18;HEAP32[r12+(r31+2)]=r46;HEAP32[r12+(r31+3)]=r5;break}r17=r11;r6=r39>>>8;do{if((r6|0)==0){r48=0}else{if(r39>>>0>16777215){r48=31;break}r9=(r6+1048320|0)>>>16&8;r13=r6<<r9;r4=(r13+520192|0)>>>16&4;r8=r13<<r4;r13=(r8+245760|0)>>>16&2;r30=14-(r4|r9|r13)+(r8<<r13>>>15)|0;r48=r39>>>((r30+7|0)>>>0)&1|r30<<1}}while(0);r6=(r48<<2)+35300|0;HEAP32[r12+(r31+7)]=r48;HEAP32[r12+(r31+5)]=0;HEAP32[r12+(r31+4)]=0;r5=HEAP32[8750];r30=1<<r48;if((r5&r30|0)==0){HEAP32[8750]=r5|r30;HEAP32[r6>>2]=r17;HEAP32[r12+(r31+6)]=r6;HEAP32[r12+(r31+3)]=r17;HEAP32[r12+(r31+2)]=r17;break}if((r48|0)==31){r49=0}else{r49=25-(r48>>>1)|0}r30=r39<<r49;r5=HEAP32[r6>>2];while(1){if((HEAP32[r5+4>>2]&-8|0)==(r39|0)){break}r50=(r30>>>31<<2)+r5+16|0;r6=HEAP32[r50>>2];if((r6|0)==0){r2=2013;break}else{r30=r30<<1;r5=r6}}if(r2==2013){if(r50>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r50>>2]=r17;HEAP32[r12+(r31+6)]=r5;HEAP32[r12+(r31+3)]=r17;HEAP32[r12+(r31+2)]=r17;break}}r30=r5+8|0;r6=HEAP32[r30>>2];r13=HEAP32[8753];if(r5>>>0<r13>>>0){_abort()}if(r6>>>0<r13>>>0){_abort()}else{HEAP32[r6+12>>2]=r17;HEAP32[r30>>2]=r17;HEAP32[r12+(r31+2)]=r6;HEAP32[r12+(r31+3)]=r5;HEAP32[r12+(r31+6)]=0;break}}}while(0);r31=r40+8|0;if((r31|0)==0){r15=r7,r16=r15>>2;break}else{r14=r31}return r14}}while(0);r40=HEAP32[8751];if(r15>>>0<=r40>>>0){r50=r40-r15|0;r39=HEAP32[8754];if(r50>>>0>15){r49=r39;HEAP32[8754]=r49+r15|0;HEAP32[8751]=r50;HEAP32[(r49+4>>2)+r16]=r50|1;HEAP32[r49+r40>>2]=r50;HEAP32[r39+4>>2]=r15|3}else{HEAP32[8751]=0;HEAP32[8754]=0;HEAP32[r39+4>>2]=r40|3;r50=r40+(r39+4)|0;HEAP32[r50>>2]=HEAP32[r50>>2]|1}r14=r39+8|0;return r14}r39=HEAP32[8752];if(r15>>>0<r39>>>0){r50=r39-r15|0;HEAP32[8752]=r50;r39=HEAP32[8755];r40=r39;HEAP32[8755]=r40+r15|0;HEAP32[(r40+4>>2)+r16]=r50|1;HEAP32[r39+4>>2]=r15|3;r14=r39+8|0;return r14}do{if((HEAP32[8273]|0)==0){r39=_sysconf(8);if((r39-1&r39|0)==0){HEAP32[8275]=r39;HEAP32[8274]=r39;HEAP32[8276]=-1;HEAP32[8277]=2097152;HEAP32[8278]=0;HEAP32[8860]=0;r39=_time(0)&-16^1431655768;HEAP32[8273]=r39;break}else{_abort()}}}while(0);r39=r15+48|0;r50=HEAP32[8275];r40=r15+47|0;r49=r50+r40|0;r48=-r50|0;r50=r49&r48;if(r50>>>0<=r15>>>0){r14=0;return r14}r46=HEAP32[8859];do{if((r46|0)!=0){r47=HEAP32[8857];r41=r47+r50|0;if(r41>>>0<=r47>>>0|r41>>>0>r46>>>0){r14=0}else{break}return r14}}while(0);L2834:do{if((HEAP32[8860]&4|0)==0){r46=HEAP32[8755];L2836:do{if((r46|0)==0){r2=2043}else{r41=r46;r47=35444;while(1){r51=r47|0;r42=HEAP32[r51>>2];if(r42>>>0<=r41>>>0){r52=r47+4|0;if((r42+HEAP32[r52>>2]|0)>>>0>r41>>>0){break}}r42=HEAP32[r47+8>>2];if((r42|0)==0){r2=2043;break L2836}else{r47=r42}}if((r47|0)==0){r2=2043;break}r41=r49-HEAP32[8752]&r48;if(r41>>>0>=2147483647){r53=0;break}r5=_sbrk(r41);r17=(r5|0)==(HEAP32[r51>>2]+HEAP32[r52>>2]|0);r54=r17?r5:-1;r55=r17?r41:0;r56=r5;r57=r41;r2=2052;break}}while(0);do{if(r2==2043){r46=_sbrk(0);if((r46|0)==-1){r53=0;break}r7=r46;r41=HEAP32[8274];r5=r41-1|0;if((r5&r7|0)==0){r58=r50}else{r58=r50-r7+(r5+r7&-r41)|0}r41=HEAP32[8857];r7=r41+r58|0;if(!(r58>>>0>r15>>>0&r58>>>0<2147483647)){r53=0;break}r5=HEAP32[8859];if((r5|0)!=0){if(r7>>>0<=r41>>>0|r7>>>0>r5>>>0){r53=0;break}}r5=_sbrk(r58);r7=(r5|0)==(r46|0);r54=r7?r46:-1;r55=r7?r58:0;r56=r5;r57=r58;r2=2052;break}}while(0);L2856:do{if(r2==2052){r5=-r57|0;if((r54|0)!=-1){r59=r55,r60=r59>>2;r61=r54,r62=r61>>2;r2=2063;break L2834}do{if((r56|0)!=-1&r57>>>0<2147483647&r57>>>0<r39>>>0){r7=HEAP32[8275];r46=r40-r57+r7&-r7;if(r46>>>0>=2147483647){r63=r57;break}if((_sbrk(r46)|0)==-1){_sbrk(r5);r53=r55;break L2856}else{r63=r46+r57|0;break}}else{r63=r57}}while(0);if((r56|0)==-1){r53=r55}else{r59=r63,r60=r59>>2;r61=r56,r62=r61>>2;r2=2063;break L2834}}}while(0);HEAP32[8860]=HEAP32[8860]|4;r64=r53;r2=2060;break}else{r64=0;r2=2060}}while(0);do{if(r2==2060){if(r50>>>0>=2147483647){break}r53=_sbrk(r50);r56=_sbrk(0);if(!((r56|0)!=-1&(r53|0)!=-1&r53>>>0<r56>>>0)){break}r63=r56-r53|0;r56=r63>>>0>(r15+40|0)>>>0;r55=r56?r53:-1;if((r55|0)==-1){break}else{r59=r56?r63:r64,r60=r59>>2;r61=r55,r62=r61>>2;r2=2063;break}}}while(0);do{if(r2==2063){r64=HEAP32[8857]+r59|0;HEAP32[8857]=r64;if(r64>>>0>HEAP32[8858]>>>0){HEAP32[8858]=r64}r64=HEAP32[8755],r50=r64>>2;L2876:do{if((r64|0)==0){r55=HEAP32[8753];if((r55|0)==0|r61>>>0<r55>>>0){HEAP32[8753]=r61}HEAP32[8861]=r61;HEAP32[8862]=r59;HEAP32[8864]=0;HEAP32[8758]=HEAP32[8273];HEAP32[8757]=-1;r55=0;while(1){r63=r55<<1;r56=(r63<<2)+35036|0;HEAP32[(r63+3<<2)+35036>>2]=r56;HEAP32[(r63+2<<2)+35036>>2]=r56;r56=r55+1|0;if((r56|0)==32){break}else{r55=r56}}r55=r61+8|0;if((r55&7|0)==0){r65=0}else{r65=-r55&7}r55=r59-40-r65|0;HEAP32[8755]=r61+r65|0;HEAP32[8752]=r55;HEAP32[(r65+4>>2)+r62]=r55|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[8756]=HEAP32[8277]}else{r55=35444,r56=r55>>2;while(1){r66=HEAP32[r56];r67=r55+4|0;r68=HEAP32[r67>>2];if((r61|0)==(r66+r68|0)){r2=2075;break}r63=HEAP32[r56+2];if((r63|0)==0){break}else{r55=r63,r56=r55>>2}}do{if(r2==2075){if((HEAP32[r56+3]&8|0)!=0){break}r55=r64;if(!(r55>>>0>=r66>>>0&r55>>>0<r61>>>0)){break}HEAP32[r67>>2]=r68+r59|0;r55=HEAP32[8755];r63=HEAP32[8752]+r59|0;r53=r55;r57=r55+8|0;if((r57&7|0)==0){r69=0}else{r69=-r57&7}r57=r63-r69|0;HEAP32[8755]=r53+r69|0;HEAP32[8752]=r57;HEAP32[r69+(r53+4)>>2]=r57|1;HEAP32[r63+(r53+4)>>2]=40;HEAP32[8756]=HEAP32[8277];break L2876}}while(0);if(r61>>>0<HEAP32[8753]>>>0){HEAP32[8753]=r61}r56=r61+r59|0;r53=35444;while(1){r70=r53|0;if((HEAP32[r70>>2]|0)==(r56|0)){r2=2085;break}r63=HEAP32[r53+8>>2];if((r63|0)==0){break}else{r53=r63}}do{if(r2==2085){if((HEAP32[r53+12>>2]&8|0)!=0){break}HEAP32[r70>>2]=r61;r56=r53+4|0;HEAP32[r56>>2]=HEAP32[r56>>2]+r59|0;r56=r61+8|0;if((r56&7|0)==0){r71=0}else{r71=-r56&7}r56=r59+(r61+8)|0;if((r56&7|0)==0){r72=0,r73=r72>>2}else{r72=-r56&7,r73=r72>>2}r56=r61+r72+r59|0;r63=r56;r57=r71+r15|0,r55=r57>>2;r40=r61+r57|0;r57=r40;r39=r56-(r61+r71)-r15|0;HEAP32[(r71+4>>2)+r62]=r15|3;do{if((r63|0)==(HEAP32[8755]|0)){r54=HEAP32[8752]+r39|0;HEAP32[8752]=r54;HEAP32[8755]=r57;HEAP32[r55+(r62+1)]=r54|1}else{if((r63|0)==(HEAP32[8754]|0)){r54=HEAP32[8751]+r39|0;HEAP32[8751]=r54;HEAP32[8754]=r57;HEAP32[r55+(r62+1)]=r54|1;HEAP32[(r54>>2)+r62+r55]=r54;break}r54=r59+4|0;r58=HEAP32[(r54>>2)+r62+r73];if((r58&3|0)==1){r52=r58&-8;r51=r58>>>3;L2921:do{if(r58>>>0<256){r48=HEAP32[((r72|8)>>2)+r62+r60];r49=HEAP32[r73+(r62+(r60+3))];r5=(r51<<3)+35036|0;do{if((r48|0)!=(r5|0)){if(r48>>>0<HEAP32[8753]>>>0){_abort()}if((HEAP32[r48+12>>2]|0)==(r63|0)){break}_abort()}}while(0);if((r49|0)==(r48|0)){HEAP32[8749]=HEAP32[8749]&(1<<r51^-1);break}do{if((r49|0)==(r5|0)){r74=r49+8|0}else{if(r49>>>0<HEAP32[8753]>>>0){_abort()}r47=r49+8|0;if((HEAP32[r47>>2]|0)==(r63|0)){r74=r47;break}_abort()}}while(0);HEAP32[r48+12>>2]=r49;HEAP32[r74>>2]=r48}else{r5=r56;r47=HEAP32[((r72|24)>>2)+r62+r60];r46=HEAP32[r73+(r62+(r60+3))];L2942:do{if((r46|0)==(r5|0)){r7=r72|16;r41=r61+r54+r7|0;r17=HEAP32[r41>>2];do{if((r17|0)==0){r42=r61+r7+r59|0;r43=HEAP32[r42>>2];if((r43|0)==0){r75=0,r76=r75>>2;break L2942}else{r77=r43;r78=r42;break}}else{r77=r17;r78=r41}}while(0);while(1){r41=r77+20|0;r17=HEAP32[r41>>2];if((r17|0)!=0){r77=r17;r78=r41;continue}r41=r77+16|0;r17=HEAP32[r41>>2];if((r17|0)==0){break}else{r77=r17;r78=r41}}if(r78>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r78>>2]=0;r75=r77,r76=r75>>2;break}}else{r41=HEAP32[((r72|8)>>2)+r62+r60];if(r41>>>0<HEAP32[8753]>>>0){_abort()}r17=r41+12|0;if((HEAP32[r17>>2]|0)!=(r5|0)){_abort()}r7=r46+8|0;if((HEAP32[r7>>2]|0)==(r5|0)){HEAP32[r17>>2]=r46;HEAP32[r7>>2]=r41;r75=r46,r76=r75>>2;break}else{_abort()}}}while(0);if((r47|0)==0){break}r46=r72+(r61+(r59+28))|0;r48=(HEAP32[r46>>2]<<2)+35300|0;do{if((r5|0)==(HEAP32[r48>>2]|0)){HEAP32[r48>>2]=r75;if((r75|0)!=0){break}HEAP32[8750]=HEAP32[8750]&(1<<HEAP32[r46>>2]^-1);break L2921}else{if(r47>>>0<HEAP32[8753]>>>0){_abort()}r49=r47+16|0;if((HEAP32[r49>>2]|0)==(r5|0)){HEAP32[r49>>2]=r75}else{HEAP32[r47+20>>2]=r75}if((r75|0)==0){break L2921}}}while(0);if(r75>>>0<HEAP32[8753]>>>0){_abort()}HEAP32[r76+6]=r47;r5=r72|16;r46=HEAP32[(r5>>2)+r62+r60];do{if((r46|0)!=0){if(r46>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r76+4]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r46=HEAP32[(r54+r5>>2)+r62];if((r46|0)==0){break}if(r46>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r76+5]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r79=r61+(r52|r72)+r59|0;r80=r52+r39|0}else{r79=r63;r80=r39}r54=r79+4|0;HEAP32[r54>>2]=HEAP32[r54>>2]&-2;HEAP32[r55+(r62+1)]=r80|1;HEAP32[(r80>>2)+r62+r55]=r80;r54=r80>>>3;if(r80>>>0<256){r51=r54<<1;r58=(r51<<2)+35036|0;r46=HEAP32[8749];r47=1<<r54;do{if((r46&r47|0)==0){HEAP32[8749]=r46|r47;r81=r58;r82=(r51+2<<2)+35036|0}else{r54=(r51+2<<2)+35036|0;r48=HEAP32[r54>>2];if(r48>>>0>=HEAP32[8753]>>>0){r81=r48;r82=r54;break}_abort()}}while(0);HEAP32[r82>>2]=r57;HEAP32[r81+12>>2]=r57;HEAP32[r55+(r62+2)]=r81;HEAP32[r55+(r62+3)]=r58;break}r51=r40;r47=r80>>>8;do{if((r47|0)==0){r83=0}else{if(r80>>>0>16777215){r83=31;break}r46=(r47+1048320|0)>>>16&8;r52=r47<<r46;r54=(r52+520192|0)>>>16&4;r48=r52<<r54;r52=(r48+245760|0)>>>16&2;r49=14-(r54|r46|r52)+(r48<<r52>>>15)|0;r83=r80>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r83<<2)+35300|0;HEAP32[r55+(r62+7)]=r83;HEAP32[r55+(r62+5)]=0;HEAP32[r55+(r62+4)]=0;r58=HEAP32[8750];r49=1<<r83;if((r58&r49|0)==0){HEAP32[8750]=r58|r49;HEAP32[r47>>2]=r51;HEAP32[r55+(r62+6)]=r47;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}if((r83|0)==31){r84=0}else{r84=25-(r83>>>1)|0}r49=r80<<r84;r58=HEAP32[r47>>2];while(1){if((HEAP32[r58+4>>2]&-8|0)==(r80|0)){break}r85=(r49>>>31<<2)+r58+16|0;r47=HEAP32[r85>>2];if((r47|0)==0){r2=2158;break}else{r49=r49<<1;r58=r47}}if(r2==2158){if(r85>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r85>>2]=r51;HEAP32[r55+(r62+6)]=r58;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}}r49=r58+8|0;r47=HEAP32[r49>>2];r52=HEAP32[8753];if(r58>>>0<r52>>>0){_abort()}if(r47>>>0<r52>>>0){_abort()}else{HEAP32[r47+12>>2]=r51;HEAP32[r49>>2]=r51;HEAP32[r55+(r62+2)]=r47;HEAP32[r55+(r62+3)]=r58;HEAP32[r55+(r62+6)]=0;break}}}while(0);r14=r61+(r71|8)|0;return r14}}while(0);r53=r64;r55=35444,r40=r55>>2;while(1){r86=HEAP32[r40];if(r86>>>0<=r53>>>0){r87=HEAP32[r40+1];r88=r86+r87|0;if(r88>>>0>r53>>>0){break}}r55=HEAP32[r40+2],r40=r55>>2}r55=r86+(r87-39)|0;if((r55&7|0)==0){r89=0}else{r89=-r55&7}r55=r86+(r87-47)+r89|0;r40=r55>>>0<(r64+16|0)>>>0?r53:r55;r55=r40+8|0,r57=r55>>2;r39=r61+8|0;if((r39&7|0)==0){r90=0}else{r90=-r39&7}r39=r59-40-r90|0;HEAP32[8755]=r61+r90|0;HEAP32[8752]=r39;HEAP32[(r90+4>>2)+r62]=r39|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[8756]=HEAP32[8277];HEAP32[r40+4>>2]=27;HEAP32[r57]=HEAP32[8861];HEAP32[r57+1]=HEAP32[8862];HEAP32[r57+2]=HEAP32[8863];HEAP32[r57+3]=HEAP32[8864];HEAP32[8861]=r61;HEAP32[8862]=r59;HEAP32[8864]=0;HEAP32[8863]=r55;r55=r40+28|0;HEAP32[r55>>2]=7;L3040:do{if((r40+32|0)>>>0<r88>>>0){r57=r55;while(1){r39=r57+4|0;HEAP32[r39>>2]=7;if((r57+8|0)>>>0<r88>>>0){r57=r39}else{break L3040}}}}while(0);if((r40|0)==(r53|0)){break}r55=r40-r64|0;r57=r55+(r53+4)|0;HEAP32[r57>>2]=HEAP32[r57>>2]&-2;HEAP32[r50+1]=r55|1;HEAP32[r53+r55>>2]=r55;r57=r55>>>3;if(r55>>>0<256){r39=r57<<1;r63=(r39<<2)+35036|0;r56=HEAP32[8749];r47=1<<r57;do{if((r56&r47|0)==0){HEAP32[8749]=r56|r47;r91=r63;r92=(r39+2<<2)+35036|0}else{r57=(r39+2<<2)+35036|0;r49=HEAP32[r57>>2];if(r49>>>0>=HEAP32[8753]>>>0){r91=r49;r92=r57;break}_abort()}}while(0);HEAP32[r92>>2]=r64;HEAP32[r91+12>>2]=r64;HEAP32[r50+2]=r91;HEAP32[r50+3]=r63;break}r39=r64;r47=r55>>>8;do{if((r47|0)==0){r93=0}else{if(r55>>>0>16777215){r93=31;break}r56=(r47+1048320|0)>>>16&8;r53=r47<<r56;r40=(r53+520192|0)>>>16&4;r57=r53<<r40;r53=(r57+245760|0)>>>16&2;r49=14-(r40|r56|r53)+(r57<<r53>>>15)|0;r93=r55>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r93<<2)+35300|0;HEAP32[r50+7]=r93;HEAP32[r50+5]=0;HEAP32[r50+4]=0;r63=HEAP32[8750];r49=1<<r93;if((r63&r49|0)==0){HEAP32[8750]=r63|r49;HEAP32[r47>>2]=r39;HEAP32[r50+6]=r47;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}if((r93|0)==31){r94=0}else{r94=25-(r93>>>1)|0}r49=r55<<r94;r63=HEAP32[r47>>2];while(1){if((HEAP32[r63+4>>2]&-8|0)==(r55|0)){break}r95=(r49>>>31<<2)+r63+16|0;r47=HEAP32[r95>>2];if((r47|0)==0){r2=2193;break}else{r49=r49<<1;r63=r47}}if(r2==2193){if(r95>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r95>>2]=r39;HEAP32[r50+6]=r63;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}}r49=r63+8|0;r55=HEAP32[r49>>2];r47=HEAP32[8753];if(r63>>>0<r47>>>0){_abort()}if(r55>>>0<r47>>>0){_abort()}else{HEAP32[r55+12>>2]=r39;HEAP32[r49>>2]=r39;HEAP32[r50+2]=r55;HEAP32[r50+3]=r63;HEAP32[r50+6]=0;break}}}while(0);r50=HEAP32[8752];if(r50>>>0<=r15>>>0){break}r64=r50-r15|0;HEAP32[8752]=r64;r50=HEAP32[8755];r55=r50;HEAP32[8755]=r55+r15|0;HEAP32[(r55+4>>2)+r16]=r64|1;HEAP32[r50+4>>2]=r15|3;r14=r50+8|0;return r14}}while(0);r15=___errno_location();HEAP32[r15>>2]=12;r14=0;return r14}function _free(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r2=r1>>2;r3=0;if((r1|0)==0){return}r4=r1-8|0;r5=r4;r6=HEAP32[8753];if(r4>>>0<r6>>>0){_abort()}r7=HEAP32[r1-4>>2];r8=r7&3;if((r8|0)==1){_abort()}r9=r7&-8,r10=r9>>2;r11=r1+(r9-8)|0;r12=r11;L3093:do{if((r7&1|0)==0){r13=HEAP32[r4>>2];if((r8|0)==0){return}r14=-8-r13|0,r15=r14>>2;r16=r1+r14|0;r17=r16;r18=r13+r9|0;if(r16>>>0<r6>>>0){_abort()}if((r17|0)==(HEAP32[8754]|0)){r19=(r1+(r9-4)|0)>>2;if((HEAP32[r19]&3|0)!=3){r20=r17,r21=r20>>2;r22=r18;break}HEAP32[8751]=r18;HEAP32[r19]=HEAP32[r19]&-2;HEAP32[r15+(r2+1)]=r18|1;HEAP32[r11>>2]=r18;return}r19=r13>>>3;if(r13>>>0<256){r13=HEAP32[r15+(r2+2)];r23=HEAP32[r15+(r2+3)];r24=(r19<<3)+35036|0;do{if((r13|0)!=(r24|0)){if(r13>>>0<r6>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r17|0)){break}_abort()}}while(0);if((r23|0)==(r13|0)){HEAP32[8749]=HEAP32[8749]&(1<<r19^-1);r20=r17,r21=r20>>2;r22=r18;break}do{if((r23|0)==(r24|0)){r25=r23+8|0}else{if(r23>>>0<r6>>>0){_abort()}r26=r23+8|0;if((HEAP32[r26>>2]|0)==(r17|0)){r25=r26;break}_abort()}}while(0);HEAP32[r13+12>>2]=r23;HEAP32[r25>>2]=r13;r20=r17,r21=r20>>2;r22=r18;break}r24=r16;r19=HEAP32[r15+(r2+6)];r26=HEAP32[r15+(r2+3)];L3127:do{if((r26|0)==(r24|0)){r27=r14+(r1+20)|0;r28=HEAP32[r27>>2];do{if((r28|0)==0){r29=r14+(r1+16)|0;r30=HEAP32[r29>>2];if((r30|0)==0){r31=0,r32=r31>>2;break L3127}else{r33=r30;r34=r29;break}}else{r33=r28;r34=r27}}while(0);while(1){r27=r33+20|0;r28=HEAP32[r27>>2];if((r28|0)!=0){r33=r28;r34=r27;continue}r27=r33+16|0;r28=HEAP32[r27>>2];if((r28|0)==0){break}else{r33=r28;r34=r27}}if(r34>>>0<r6>>>0){_abort()}else{HEAP32[r34>>2]=0;r31=r33,r32=r31>>2;break}}else{r27=HEAP32[r15+(r2+2)];if(r27>>>0<r6>>>0){_abort()}r28=r27+12|0;if((HEAP32[r28>>2]|0)!=(r24|0)){_abort()}r29=r26+8|0;if((HEAP32[r29>>2]|0)==(r24|0)){HEAP32[r28>>2]=r26;HEAP32[r29>>2]=r27;r31=r26,r32=r31>>2;break}else{_abort()}}}while(0);if((r19|0)==0){r20=r17,r21=r20>>2;r22=r18;break}r26=r14+(r1+28)|0;r16=(HEAP32[r26>>2]<<2)+35300|0;do{if((r24|0)==(HEAP32[r16>>2]|0)){HEAP32[r16>>2]=r31;if((r31|0)!=0){break}HEAP32[8750]=HEAP32[8750]&(1<<HEAP32[r26>>2]^-1);r20=r17,r21=r20>>2;r22=r18;break L3093}else{if(r19>>>0<HEAP32[8753]>>>0){_abort()}r13=r19+16|0;if((HEAP32[r13>>2]|0)==(r24|0)){HEAP32[r13>>2]=r31}else{HEAP32[r19+20>>2]=r31}if((r31|0)==0){r20=r17,r21=r20>>2;r22=r18;break L3093}}}while(0);if(r31>>>0<HEAP32[8753]>>>0){_abort()}HEAP32[r32+6]=r19;r24=HEAP32[r15+(r2+4)];do{if((r24|0)!=0){if(r24>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r32+4]=r24;HEAP32[r24+24>>2]=r31;break}}}while(0);r24=HEAP32[r15+(r2+5)];if((r24|0)==0){r20=r17,r21=r20>>2;r22=r18;break}if(r24>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r32+5]=r24;HEAP32[r24+24>>2]=r31;r20=r17,r21=r20>>2;r22=r18;break}}else{r20=r5,r21=r20>>2;r22=r9}}while(0);r5=r20,r31=r5>>2;if(r5>>>0>=r11>>>0){_abort()}r5=r1+(r9-4)|0;r32=HEAP32[r5>>2];if((r32&1|0)==0){_abort()}do{if((r32&2|0)==0){if((r12|0)==(HEAP32[8755]|0)){r6=HEAP32[8752]+r22|0;HEAP32[8752]=r6;HEAP32[8755]=r20;HEAP32[r21+1]=r6|1;if((r20|0)==(HEAP32[8754]|0)){HEAP32[8754]=0;HEAP32[8751]=0}if(r6>>>0<=HEAP32[8756]>>>0){return}_sys_trim(0);return}if((r12|0)==(HEAP32[8754]|0)){r6=HEAP32[8751]+r22|0;HEAP32[8751]=r6;HEAP32[8754]=r20;HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;return}r6=(r32&-8)+r22|0;r33=r32>>>3;L3198:do{if(r32>>>0<256){r34=HEAP32[r2+r10];r25=HEAP32[((r9|4)>>2)+r2];r8=(r33<<3)+35036|0;do{if((r34|0)!=(r8|0)){if(r34>>>0<HEAP32[8753]>>>0){_abort()}if((HEAP32[r34+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r25|0)==(r34|0)){HEAP32[8749]=HEAP32[8749]&(1<<r33^-1);break}do{if((r25|0)==(r8|0)){r35=r25+8|0}else{if(r25>>>0<HEAP32[8753]>>>0){_abort()}r4=r25+8|0;if((HEAP32[r4>>2]|0)==(r12|0)){r35=r4;break}_abort()}}while(0);HEAP32[r34+12>>2]=r25;HEAP32[r35>>2]=r34}else{r8=r11;r4=HEAP32[r10+(r2+4)];r7=HEAP32[((r9|4)>>2)+r2];L3219:do{if((r7|0)==(r8|0)){r24=r9+(r1+12)|0;r19=HEAP32[r24>>2];do{if((r19|0)==0){r26=r9+(r1+8)|0;r16=HEAP32[r26>>2];if((r16|0)==0){r36=0,r37=r36>>2;break L3219}else{r38=r16;r39=r26;break}}else{r38=r19;r39=r24}}while(0);while(1){r24=r38+20|0;r19=HEAP32[r24>>2];if((r19|0)!=0){r38=r19;r39=r24;continue}r24=r38+16|0;r19=HEAP32[r24>>2];if((r19|0)==0){break}else{r38=r19;r39=r24}}if(r39>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r39>>2]=0;r36=r38,r37=r36>>2;break}}else{r24=HEAP32[r2+r10];if(r24>>>0<HEAP32[8753]>>>0){_abort()}r19=r24+12|0;if((HEAP32[r19>>2]|0)!=(r8|0)){_abort()}r26=r7+8|0;if((HEAP32[r26>>2]|0)==(r8|0)){HEAP32[r19>>2]=r7;HEAP32[r26>>2]=r24;r36=r7,r37=r36>>2;break}else{_abort()}}}while(0);if((r4|0)==0){break}r7=r9+(r1+20)|0;r34=(HEAP32[r7>>2]<<2)+35300|0;do{if((r8|0)==(HEAP32[r34>>2]|0)){HEAP32[r34>>2]=r36;if((r36|0)!=0){break}HEAP32[8750]=HEAP32[8750]&(1<<HEAP32[r7>>2]^-1);break L3198}else{if(r4>>>0<HEAP32[8753]>>>0){_abort()}r25=r4+16|0;if((HEAP32[r25>>2]|0)==(r8|0)){HEAP32[r25>>2]=r36}else{HEAP32[r4+20>>2]=r36}if((r36|0)==0){break L3198}}}while(0);if(r36>>>0<HEAP32[8753]>>>0){_abort()}HEAP32[r37+6]=r4;r8=HEAP32[r10+(r2+2)];do{if((r8|0)!=0){if(r8>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r37+4]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);r8=HEAP32[r10+(r2+3)];if((r8|0)==0){break}if(r8>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r37+5]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;if((r20|0)!=(HEAP32[8754]|0)){r40=r6;break}HEAP32[8751]=r6;return}else{HEAP32[r5>>2]=r32&-2;HEAP32[r21+1]=r22|1;HEAP32[(r22>>2)+r31]=r22;r40=r22}}while(0);r22=r40>>>3;if(r40>>>0<256){r31=r22<<1;r32=(r31<<2)+35036|0;r5=HEAP32[8749];r36=1<<r22;do{if((r5&r36|0)==0){HEAP32[8749]=r5|r36;r41=r32;r42=(r31+2<<2)+35036|0}else{r22=(r31+2<<2)+35036|0;r37=HEAP32[r22>>2];if(r37>>>0>=HEAP32[8753]>>>0){r41=r37;r42=r22;break}_abort()}}while(0);HEAP32[r42>>2]=r20;HEAP32[r41+12>>2]=r20;HEAP32[r21+2]=r41;HEAP32[r21+3]=r32;return}r32=r20;r41=r40>>>8;do{if((r41|0)==0){r43=0}else{if(r40>>>0>16777215){r43=31;break}r42=(r41+1048320|0)>>>16&8;r31=r41<<r42;r36=(r31+520192|0)>>>16&4;r5=r31<<r36;r31=(r5+245760|0)>>>16&2;r22=14-(r36|r42|r31)+(r5<<r31>>>15)|0;r43=r40>>>((r22+7|0)>>>0)&1|r22<<1}}while(0);r41=(r43<<2)+35300|0;HEAP32[r21+7]=r43;HEAP32[r21+5]=0;HEAP32[r21+4]=0;r22=HEAP32[8750];r31=1<<r43;do{if((r22&r31|0)==0){HEAP32[8750]=r22|r31;HEAP32[r41>>2]=r32;HEAP32[r21+6]=r41;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20}else{if((r43|0)==31){r44=0}else{r44=25-(r43>>>1)|0}r5=r40<<r44;r42=HEAP32[r41>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r40|0)){break}r45=(r5>>>31<<2)+r42+16|0;r36=HEAP32[r45>>2];if((r36|0)==0){r3=2372;break}else{r5=r5<<1;r42=r36}}if(r3==2372){if(r45>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r45>>2]=r32;HEAP32[r21+6]=r42;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20;break}}r5=r42+8|0;r6=HEAP32[r5>>2];r36=HEAP32[8753];if(r42>>>0<r36>>>0){_abort()}if(r6>>>0<r36>>>0){_abort()}else{HEAP32[r6+12>>2]=r32;HEAP32[r5>>2]=r32;HEAP32[r21+2]=r6;HEAP32[r21+3]=r42;HEAP32[r21+6]=0;break}}}while(0);r21=HEAP32[8757]-1|0;HEAP32[8757]=r21;if((r21|0)==0){r46=35452}else{return}while(1){r21=HEAP32[r46>>2];if((r21|0)==0){break}else{r46=r21+8|0}}HEAP32[8757]=-1;return}function _realloc(r1,r2){var r3,r4,r5,r6;if((r1|0)==0){r3=_malloc(r2);return r3}if(r2>>>0>4294967231){r4=___errno_location();HEAP32[r4>>2]=12;r3=0;return r3}if(r2>>>0<11){r5=16}else{r5=r2+11&-8}r4=_try_realloc_chunk(r1-8|0,r5);if((r4|0)!=0){r3=r4+8|0;return r3}r4=_malloc(r2);if((r4|0)==0){r3=0;return r3}r5=HEAP32[r1-4>>2];r6=(r5&-8)-((r5&3|0)==0?8:4)|0;_memcpy(r4,r1,r6>>>0<r2>>>0?r6:r2);_free(r1);r3=r4;return r3}function _sys_trim(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;do{if((HEAP32[8273]|0)==0){r2=_sysconf(8);if((r2-1&r2|0)==0){HEAP32[8275]=r2;HEAP32[8274]=r2;HEAP32[8276]=-1;HEAP32[8277]=2097152;HEAP32[8278]=0;HEAP32[8860]=0;r2=_time(0)&-16^1431655768;HEAP32[8273]=r2;break}else{_abort()}}}while(0);if(r1>>>0>=4294967232){r3=0;r4=r3&1;return r4}r2=HEAP32[8755];if((r2|0)==0){r3=0;r4=r3&1;return r4}r5=HEAP32[8752];do{if(r5>>>0>(r1+40|0)>>>0){r6=HEAP32[8275];r7=Math.imul(Math.floor(((-40-r1-1+r5+r6|0)>>>0)/(r6>>>0))-1|0,r6);r8=r2;r9=35444,r10=r9>>2;while(1){r11=HEAP32[r10];if(r11>>>0<=r8>>>0){if((r11+HEAP32[r10+1]|0)>>>0>r8>>>0){r12=r9;break}}r11=HEAP32[r10+2];if((r11|0)==0){r12=0;break}else{r9=r11,r10=r9>>2}}if((HEAP32[r12+12>>2]&8|0)!=0){break}r9=_sbrk(0);r10=(r12+4|0)>>2;if((r9|0)!=(HEAP32[r12>>2]+HEAP32[r10]|0)){break}r8=_sbrk(-(r7>>>0>2147483646?-2147483648-r6|0:r7)|0);r11=_sbrk(0);if(!((r8|0)!=-1&r11>>>0<r9>>>0)){break}r8=r9-r11|0;if((r9|0)==(r11|0)){break}HEAP32[r10]=HEAP32[r10]-r8|0;HEAP32[8857]=HEAP32[8857]-r8|0;r10=HEAP32[8755];r13=HEAP32[8752]-r8|0;r8=r10;r14=r10+8|0;if((r14&7|0)==0){r15=0}else{r15=-r14&7}r14=r13-r15|0;HEAP32[8755]=r8+r15|0;HEAP32[8752]=r14;HEAP32[r15+(r8+4)>>2]=r14|1;HEAP32[r13+(r8+4)>>2]=40;HEAP32[8756]=HEAP32[8277];r3=(r9|0)!=(r11|0);r4=r3&1;return r4}}while(0);if(HEAP32[8752]>>>0<=HEAP32[8756]>>>0){r3=0;r4=r3&1;return r4}HEAP32[8756]=-1;r3=0;r4=r3&1;return r4}function _try_realloc_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29;r3=(r1+4|0)>>2;r4=HEAP32[r3];r5=r4&-8,r6=r5>>2;r7=r1,r8=r7>>2;r9=r7+r5|0;r10=r9;r11=HEAP32[8753];if(r7>>>0<r11>>>0){_abort()}r12=r4&3;if(!((r12|0)!=1&r7>>>0<r9>>>0)){_abort()}r13=(r7+(r5|4)|0)>>2;r14=HEAP32[r13];if((r14&1|0)==0){_abort()}if((r12|0)==0){if(r2>>>0<256){r15=0;return r15}do{if(r5>>>0>=(r2+4|0)>>>0){if((r5-r2|0)>>>0>HEAP32[8275]<<1>>>0){break}else{r15=r1}return r15}}while(0);r15=0;return r15}if(r5>>>0>=r2>>>0){r12=r5-r2|0;if(r12>>>0<=15){r15=r1;return r15}HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|3;HEAP32[r13]=HEAP32[r13]|1;_dispose_chunk(r7+r2|0,r12);r15=r1;return r15}if((r10|0)==(HEAP32[8755]|0)){r12=HEAP32[8752]+r5|0;if(r12>>>0<=r2>>>0){r15=0;return r15}r13=r12-r2|0;HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r13|1;HEAP32[8755]=r7+r2|0;HEAP32[8752]=r13;r15=r1;return r15}if((r10|0)==(HEAP32[8754]|0)){r13=HEAP32[8751]+r5|0;if(r13>>>0<r2>>>0){r15=0;return r15}r12=r13-r2|0;if(r12>>>0>15){HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|1;HEAP32[(r13>>2)+r8]=r12;r16=r13+(r7+4)|0;HEAP32[r16>>2]=HEAP32[r16>>2]&-2;r17=r7+r2|0;r18=r12}else{HEAP32[r3]=r4&1|r13|2;r4=r13+(r7+4)|0;HEAP32[r4>>2]=HEAP32[r4>>2]|1;r17=0;r18=0}HEAP32[8751]=r18;HEAP32[8754]=r17;r15=r1;return r15}if((r14&2|0)!=0){r15=0;return r15}r17=(r14&-8)+r5|0;if(r17>>>0<r2>>>0){r15=0;return r15}r18=r17-r2|0;r4=r14>>>3;L3419:do{if(r14>>>0<256){r13=HEAP32[r6+(r8+2)];r12=HEAP32[r6+(r8+3)];r16=(r4<<3)+35036|0;do{if((r13|0)!=(r16|0)){if(r13>>>0<r11>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r10|0)){break}_abort()}}while(0);if((r12|0)==(r13|0)){HEAP32[8749]=HEAP32[8749]&(1<<r4^-1);break}do{if((r12|0)==(r16|0)){r19=r12+8|0}else{if(r12>>>0<r11>>>0){_abort()}r20=r12+8|0;if((HEAP32[r20>>2]|0)==(r10|0)){r19=r20;break}_abort()}}while(0);HEAP32[r13+12>>2]=r12;HEAP32[r19>>2]=r13}else{r16=r9;r20=HEAP32[r6+(r8+6)];r21=HEAP32[r6+(r8+3)];L3421:do{if((r21|0)==(r16|0)){r22=r5+(r7+20)|0;r23=HEAP32[r22>>2];do{if((r23|0)==0){r24=r5+(r7+16)|0;r25=HEAP32[r24>>2];if((r25|0)==0){r26=0,r27=r26>>2;break L3421}else{r28=r25;r29=r24;break}}else{r28=r23;r29=r22}}while(0);while(1){r22=r28+20|0;r23=HEAP32[r22>>2];if((r23|0)!=0){r28=r23;r29=r22;continue}r22=r28+16|0;r23=HEAP32[r22>>2];if((r23|0)==0){break}else{r28=r23;r29=r22}}if(r29>>>0<r11>>>0){_abort()}else{HEAP32[r29>>2]=0;r26=r28,r27=r26>>2;break}}else{r22=HEAP32[r6+(r8+2)];if(r22>>>0<r11>>>0){_abort()}r23=r22+12|0;if((HEAP32[r23>>2]|0)!=(r16|0)){_abort()}r24=r21+8|0;if((HEAP32[r24>>2]|0)==(r16|0)){HEAP32[r23>>2]=r21;HEAP32[r24>>2]=r22;r26=r21,r27=r26>>2;break}else{_abort()}}}while(0);if((r20|0)==0){break}r21=r5+(r7+28)|0;r13=(HEAP32[r21>>2]<<2)+35300|0;do{if((r16|0)==(HEAP32[r13>>2]|0)){HEAP32[r13>>2]=r26;if((r26|0)!=0){break}HEAP32[8750]=HEAP32[8750]&(1<<HEAP32[r21>>2]^-1);break L3419}else{if(r20>>>0<HEAP32[8753]>>>0){_abort()}r12=r20+16|0;if((HEAP32[r12>>2]|0)==(r16|0)){HEAP32[r12>>2]=r26}else{HEAP32[r20+20>>2]=r26}if((r26|0)==0){break L3419}}}while(0);if(r26>>>0<HEAP32[8753]>>>0){_abort()}HEAP32[r27+6]=r20;r16=HEAP32[r6+(r8+4)];do{if((r16|0)!=0){if(r16>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r27+4]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);r16=HEAP32[r6+(r8+5)];if((r16|0)==0){break}if(r16>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r27+5]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);if(r18>>>0<16){HEAP32[r3]=r17|HEAP32[r3]&1|2;r26=r7+(r17|4)|0;HEAP32[r26>>2]=HEAP32[r26>>2]|1;r15=r1;return r15}else{HEAP32[r3]=HEAP32[r3]&1|r2|2;HEAP32[(r2+4>>2)+r8]=r18|3;r8=r7+(r17|4)|0;HEAP32[r8>>2]=HEAP32[r8>>2]|1;_dispose_chunk(r7+r2|0,r18);r15=r1;return r15}}function _dispose_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43;r3=r2>>2;r4=0;r5=r1,r6=r5>>2;r7=r5+r2|0;r8=r7;r9=HEAP32[r1+4>>2];L3495:do{if((r9&1|0)==0){r10=HEAP32[r1>>2];if((r9&3|0)==0){return}r11=r5+ -r10|0;r12=r11;r13=r10+r2|0;r14=HEAP32[8753];if(r11>>>0<r14>>>0){_abort()}if((r12|0)==(HEAP32[8754]|0)){r15=(r2+(r5+4)|0)>>2;if((HEAP32[r15]&3|0)!=3){r16=r12,r17=r16>>2;r18=r13;break}HEAP32[8751]=r13;HEAP32[r15]=HEAP32[r15]&-2;HEAP32[(4-r10>>2)+r6]=r13|1;HEAP32[r7>>2]=r13;return}r15=r10>>>3;if(r10>>>0<256){r19=HEAP32[(8-r10>>2)+r6];r20=HEAP32[(12-r10>>2)+r6];r21=(r15<<3)+35036|0;do{if((r19|0)!=(r21|0)){if(r19>>>0<r14>>>0){_abort()}if((HEAP32[r19+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r20|0)==(r19|0)){HEAP32[8749]=HEAP32[8749]&(1<<r15^-1);r16=r12,r17=r16>>2;r18=r13;break}do{if((r20|0)==(r21|0)){r22=r20+8|0}else{if(r20>>>0<r14>>>0){_abort()}r23=r20+8|0;if((HEAP32[r23>>2]|0)==(r12|0)){r22=r23;break}_abort()}}while(0);HEAP32[r19+12>>2]=r20;HEAP32[r22>>2]=r19;r16=r12,r17=r16>>2;r18=r13;break}r21=r11;r15=HEAP32[(24-r10>>2)+r6];r23=HEAP32[(12-r10>>2)+r6];L3529:do{if((r23|0)==(r21|0)){r24=16-r10|0;r25=r24+(r5+4)|0;r26=HEAP32[r25>>2];do{if((r26|0)==0){r27=r5+r24|0;r28=HEAP32[r27>>2];if((r28|0)==0){r29=0,r30=r29>>2;break L3529}else{r31=r28;r32=r27;break}}else{r31=r26;r32=r25}}while(0);while(1){r25=r31+20|0;r26=HEAP32[r25>>2];if((r26|0)!=0){r31=r26;r32=r25;continue}r25=r31+16|0;r26=HEAP32[r25>>2];if((r26|0)==0){break}else{r31=r26;r32=r25}}if(r32>>>0<r14>>>0){_abort()}else{HEAP32[r32>>2]=0;r29=r31,r30=r29>>2;break}}else{r25=HEAP32[(8-r10>>2)+r6];if(r25>>>0<r14>>>0){_abort()}r26=r25+12|0;if((HEAP32[r26>>2]|0)!=(r21|0)){_abort()}r24=r23+8|0;if((HEAP32[r24>>2]|0)==(r21|0)){HEAP32[r26>>2]=r23;HEAP32[r24>>2]=r25;r29=r23,r30=r29>>2;break}else{_abort()}}}while(0);if((r15|0)==0){r16=r12,r17=r16>>2;r18=r13;break}r23=r5+(28-r10)|0;r14=(HEAP32[r23>>2]<<2)+35300|0;do{if((r21|0)==(HEAP32[r14>>2]|0)){HEAP32[r14>>2]=r29;if((r29|0)!=0){break}HEAP32[8750]=HEAP32[8750]&(1<<HEAP32[r23>>2]^-1);r16=r12,r17=r16>>2;r18=r13;break L3495}else{if(r15>>>0<HEAP32[8753]>>>0){_abort()}r11=r15+16|0;if((HEAP32[r11>>2]|0)==(r21|0)){HEAP32[r11>>2]=r29}else{HEAP32[r15+20>>2]=r29}if((r29|0)==0){r16=r12,r17=r16>>2;r18=r13;break L3495}}}while(0);if(r29>>>0<HEAP32[8753]>>>0){_abort()}HEAP32[r30+6]=r15;r21=16-r10|0;r23=HEAP32[(r21>>2)+r6];do{if((r23|0)!=0){if(r23>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r30+4]=r23;HEAP32[r23+24>>2]=r29;break}}}while(0);r23=HEAP32[(r21+4>>2)+r6];if((r23|0)==0){r16=r12,r17=r16>>2;r18=r13;break}if(r23>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r30+5]=r23;HEAP32[r23+24>>2]=r29;r16=r12,r17=r16>>2;r18=r13;break}}else{r16=r1,r17=r16>>2;r18=r2}}while(0);r1=HEAP32[8753];if(r7>>>0<r1>>>0){_abort()}r29=r2+(r5+4)|0;r30=HEAP32[r29>>2];do{if((r30&2|0)==0){if((r8|0)==(HEAP32[8755]|0)){r31=HEAP32[8752]+r18|0;HEAP32[8752]=r31;HEAP32[8755]=r16;HEAP32[r17+1]=r31|1;if((r16|0)!=(HEAP32[8754]|0)){return}HEAP32[8754]=0;HEAP32[8751]=0;return}if((r8|0)==(HEAP32[8754]|0)){r31=HEAP32[8751]+r18|0;HEAP32[8751]=r31;HEAP32[8754]=r16;HEAP32[r17+1]=r31|1;HEAP32[(r31>>2)+r17]=r31;return}r31=(r30&-8)+r18|0;r32=r30>>>3;L3595:do{if(r30>>>0<256){r22=HEAP32[r3+(r6+2)];r9=HEAP32[r3+(r6+3)];r23=(r32<<3)+35036|0;do{if((r22|0)!=(r23|0)){if(r22>>>0<r1>>>0){_abort()}if((HEAP32[r22+12>>2]|0)==(r8|0)){break}_abort()}}while(0);if((r9|0)==(r22|0)){HEAP32[8749]=HEAP32[8749]&(1<<r32^-1);break}do{if((r9|0)==(r23|0)){r33=r9+8|0}else{if(r9>>>0<r1>>>0){_abort()}r10=r9+8|0;if((HEAP32[r10>>2]|0)==(r8|0)){r33=r10;break}_abort()}}while(0);HEAP32[r22+12>>2]=r9;HEAP32[r33>>2]=r22}else{r23=r7;r10=HEAP32[r3+(r6+6)];r15=HEAP32[r3+(r6+3)];L3616:do{if((r15|0)==(r23|0)){r14=r2+(r5+20)|0;r11=HEAP32[r14>>2];do{if((r11|0)==0){r19=r2+(r5+16)|0;r20=HEAP32[r19>>2];if((r20|0)==0){r34=0,r35=r34>>2;break L3616}else{r36=r20;r37=r19;break}}else{r36=r11;r37=r14}}while(0);while(1){r14=r36+20|0;r11=HEAP32[r14>>2];if((r11|0)!=0){r36=r11;r37=r14;continue}r14=r36+16|0;r11=HEAP32[r14>>2];if((r11|0)==0){break}else{r36=r11;r37=r14}}if(r37>>>0<r1>>>0){_abort()}else{HEAP32[r37>>2]=0;r34=r36,r35=r34>>2;break}}else{r14=HEAP32[r3+(r6+2)];if(r14>>>0<r1>>>0){_abort()}r11=r14+12|0;if((HEAP32[r11>>2]|0)!=(r23|0)){_abort()}r19=r15+8|0;if((HEAP32[r19>>2]|0)==(r23|0)){HEAP32[r11>>2]=r15;HEAP32[r19>>2]=r14;r34=r15,r35=r34>>2;break}else{_abort()}}}while(0);if((r10|0)==0){break}r15=r2+(r5+28)|0;r22=(HEAP32[r15>>2]<<2)+35300|0;do{if((r23|0)==(HEAP32[r22>>2]|0)){HEAP32[r22>>2]=r34;if((r34|0)!=0){break}HEAP32[8750]=HEAP32[8750]&(1<<HEAP32[r15>>2]^-1);break L3595}else{if(r10>>>0<HEAP32[8753]>>>0){_abort()}r9=r10+16|0;if((HEAP32[r9>>2]|0)==(r23|0)){HEAP32[r9>>2]=r34}else{HEAP32[r10+20>>2]=r34}if((r34|0)==0){break L3595}}}while(0);if(r34>>>0<HEAP32[8753]>>>0){_abort()}HEAP32[r35+6]=r10;r23=HEAP32[r3+(r6+4)];do{if((r23|0)!=0){if(r23>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r35+4]=r23;HEAP32[r23+24>>2]=r34;break}}}while(0);r23=HEAP32[r3+(r6+5)];if((r23|0)==0){break}if(r23>>>0<HEAP32[8753]>>>0){_abort()}else{HEAP32[r35+5]=r23;HEAP32[r23+24>>2]=r34;break}}}while(0);HEAP32[r17+1]=r31|1;HEAP32[(r31>>2)+r17]=r31;if((r16|0)!=(HEAP32[8754]|0)){r38=r31;break}HEAP32[8751]=r31;return}else{HEAP32[r29>>2]=r30&-2;HEAP32[r17+1]=r18|1;HEAP32[(r18>>2)+r17]=r18;r38=r18}}while(0);r18=r38>>>3;if(r38>>>0<256){r30=r18<<1;r29=(r30<<2)+35036|0;r34=HEAP32[8749];r35=1<<r18;do{if((r34&r35|0)==0){HEAP32[8749]=r34|r35;r39=r29;r40=(r30+2<<2)+35036|0}else{r18=(r30+2<<2)+35036|0;r6=HEAP32[r18>>2];if(r6>>>0>=HEAP32[8753]>>>0){r39=r6;r40=r18;break}_abort()}}while(0);HEAP32[r40>>2]=r16;HEAP32[r39+12>>2]=r16;HEAP32[r17+2]=r39;HEAP32[r17+3]=r29;return}r29=r16;r39=r38>>>8;do{if((r39|0)==0){r41=0}else{if(r38>>>0>16777215){r41=31;break}r40=(r39+1048320|0)>>>16&8;r30=r39<<r40;r35=(r30+520192|0)>>>16&4;r34=r30<<r35;r30=(r34+245760|0)>>>16&2;r18=14-(r35|r40|r30)+(r34<<r30>>>15)|0;r41=r38>>>((r18+7|0)>>>0)&1|r18<<1}}while(0);r39=(r41<<2)+35300|0;HEAP32[r17+7]=r41;HEAP32[r17+5]=0;HEAP32[r17+4]=0;r18=HEAP32[8750];r30=1<<r41;if((r18&r30|0)==0){HEAP32[8750]=r18|r30;HEAP32[r39>>2]=r29;HEAP32[r17+6]=r39;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}if((r41|0)==31){r42=0}else{r42=25-(r41>>>1)|0}r41=r38<<r42;r42=HEAP32[r39>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r38|0)){break}r43=(r41>>>31<<2)+r42+16|0;r39=HEAP32[r43>>2];if((r39|0)==0){r4=2678;break}else{r41=r41<<1;r42=r39}}if(r4==2678){if(r43>>>0<HEAP32[8753]>>>0){_abort()}HEAP32[r43>>2]=r29;HEAP32[r17+6]=r42;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}r16=r42+8|0;r43=HEAP32[r16>>2];r4=HEAP32[8753];if(r42>>>0<r4>>>0){_abort()}if(r43>>>0<r4>>>0){_abort()}HEAP32[r43+12>>2]=r29;HEAP32[r16>>2]=r29;HEAP32[r17+2]=r43;HEAP32[r17+3]=r42;HEAP32[r17+6]=0;return}
// EMSCRIPTEN_END_FUNCS
Module["_init_game"] = _init_game;
Module["_midend_can_undo"] = _midend_can_undo;
Module["_midend_can_redo"] = _midend_can_redo;
Module["_midend_size"] = _midend_size;
Module["_midend_set_params"] = _midend_set_params;
Module["_midend_get_params"] = _midend_get_params;
Module["_midend_force_redraw"] = _midend_force_redraw;
Module["_midend_redraw"] = _midend_redraw;
Module["_midend_new_game"] = _midend_new_game;
Module["_midend_process_key"] = _midend_process_key;
Module["_midend_restart_game"] = _midend_restart_game;
Module["_midend_timer"] = _midend_timer;
Module["_midend_wants_statusbar"] = _midend_wants_statusbar;
Module["_midend_which_preset"] = _midend_which_preset;
Module["_midend_status"] = _midend_status;
Module["_midend_solve"] = _midend_solve;
Module["_realloc"] = _realloc;
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