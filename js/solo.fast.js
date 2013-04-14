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
STATICTOP += 7880;
assert(STATICTOP < TOTAL_MEMORY);
var _stderr;
allocate([0,0,0,0,0,0,0,0,0,0,0,0,54,0,0,0,68,0,0,0,36,0,0,0,72,0,0,0,42,0,0,0,64,0,0,0,1,0,0,0,66,0,0,0,38,0,0,0,6,0,0,0,98,0,0,0,30,0,0,0,104,0,0,0,10,0,0,0,2,0,0,0,1,0,0,0,24,0,0,0,1,0,0,0,88,0,0,0,8,0,0,0,60,0,0,0,62,0,0,0,16,0,0,0,40,0,0,0,12,0,0,0,96,0,0,0,100,0,0,0,48,0,0,0,44,0,0,0,22,0,0,0,86,0,0,0,48,0,0,0,4,0,0,0,52,0,0,0,18,0,0,0,82,0,0,0,70,0,0,0,1,0,0,0,0,0,0,0,92,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,76,0,0,0,3072,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0], ALLOC_NONE, 32768);
allocate(1488, "i8", ALLOC_NONE, 32960);
allocate(800, "i8", ALLOC_NONE, 34448);
allocate(360, "i8", ALLOC_NONE, 35248);
allocate(24, "i8", ALLOC_NONE, 35608);
allocate([0,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,4,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,5,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,9,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,1,0,0,0,1,0,0,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,4,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, 35632);
allocate([74,0,0,0,28,0,0,0,20,0,0,0,102,0,0,0,106,0,0,0,14,0,0,0,50,0,0,0,32,0,0,0,46,0,0,0,58,0,0,0,94,0,0,0,80,0,0,0,84,0,0,0,90,0,0,0,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,0,0,0,34,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NONE, 36144);
allocate([100,98,0] /* db\00 */, "i8", ALLOC_NONE, 36244);
allocate([114,52,0] /* r4\00 */, "i8", ALLOC_NONE, 36248);
allocate([109,50,0] /* m2\00 */, "i8", ALLOC_NONE, 36252);
allocate([109,52,0] /* m4\00 */, "i8", ALLOC_NONE, 36256);
allocate([109,56,0] /* m8\00 */, "i8", ALLOC_NONE, 36260);
allocate([109,101,45,62,100,105,114,32,33,61,32,48,0] /* me-_dir != 0\00 */, "i8", ALLOC_NONE, 36264);
allocate([99,108,117,101,32,61,61,32,48,0] /* clue == 0\00 */, "i8", ALLOC_NONE, 36280);
allocate([37,100,106,0] /* %dj\00 */, "i8", ALLOC_NONE, 36292);
allocate([37,100,120,37,100,0] /* %dx%d\00 */, "i8", ALLOC_NONE, 36296);
allocate([58,84,114,105,118,105,97,108,58,66,97,115,105,99,58,73,110,116,101,114,109,101,100,105,97,116,101,58,65,100,118,97,110,99,101,100,58,69,120,116,114,101,109,101,58,85,110,114,101,97,115,111,110,97,98,108,101,0] /* :Trivial:Basic:Inter */, "i8", ALLOC_NONE, 36304);
allocate([68,105,102,102,105,99,117,108,116,121,0] /* Difficulty\00 */, "i8", ALLOC_NONE, 36364);
allocate([58,78,111,110,101,58,50,45,119,97,121,32,114,111,116,97,116,105,111,110,58,52,45,119,97,121,32,114,111,116,97,116,105,111,110,58,50,45,119,97,121,32,109,105,114,114,111,114,58,50,45,119,97,121,32,100,105,97,103,111,110,97,108,32,109,105,114,114,111,114,58,52,45,119,97,121,32,109,105,114,114,111,114,58,52,45,119,97,121,32,100,105,97,103,111,110,97,108,32,109,105,114,114,111,114,58,56,45,119,97,121,32,109,105,114,114,111,114,0] /* :None:2-way rotation */, "i8", ALLOC_NONE, 36376);
allocate([83,121,109,109,101,116,114,121,0] /* Symmetry\00 */, "i8", ALLOC_NONE, 36496);
allocate([75,105,108,108,101,114,32,40,100,105,103,105,116,32,115,117,109,115,41,0] /* Killer (digit sums)\ */, "i8", ALLOC_NONE, 36508);
allocate([74,105,103,115,97,119,32,40,105,114,114,101,103,117,108,97,114,108,121,32,115,104,97,112,101,100,32,115,117,98,45,98,108,111,99,107,115,41,0] /* Jigsaw (irregularly  */, "i8", ALLOC_NONE, 36528);
allocate([109,101,45,62,100,114,97,119,105,110,103,0] /* me-_drawing\00 */, "i8", ALLOC_NONE, 36568);
allocate([105,50,32,61,61,32,105,110,118,101,114,115,101,0] /* i2 == inverse\00 */, "i8", ALLOC_NONE, 36580);
allocate([34,88,34,32,40,114,101,113,117,105,114,101,32,101,118,101,114,121,32,110,117,109,98,101,114,32,105,110,32,101,97,99,104,32,109,97,105,110,32,100,105,97,103,111,110,97,108,41,0] /* \22X\22 (require eve */, "i8", ALLOC_NONE, 36596);
allocate([82,111,119,115,32,111,102,32,115,117,98,45,98,108,111,99,107,115,0] /* Rows of sub-blocks\0 */, "i8", ALLOC_NONE, 36648);
allocate([110,32,60,32,50,42,99,114,43,50,0] /* n _ 2_cr+2\00 */, "i8", ALLOC_NONE, 36668);
allocate([67,111,108,117,109,110,115,32,111,102,32,115,117,98,45,98,108,111,99,107,115,0] /* Columns of sub-block */, "i8", ALLOC_NONE, 36680);
allocate([75,105,108,108,101,114,32,112,117,122,122,108,101,32,100,105,109,101,110,115,105,111,110,115,32,109,117,115,116,32,98,101,32,115,109,97,108,108,101,114,32,116,104,97,110,32,49,48,46,0] /* Killer puzzle dimens */, "i8", ALLOC_NONE, 36704);
allocate([85,110,97,98,108,101,32,116,111,32,115,117,112,112,111,114,116,32,109,111,114,101,32,116,104,97,110,32,51,49,32,100,105,115,116,105,110,99,116,32,115,121,109,98,111,108,115,32,105,110,32,97,32,112,117,122,122,108,101,0] /* Unable to support mo */, "i8", ALLOC_NONE, 36756);
allocate([68,105,109,101,110,115,105,111,110,115,32,103,114,101,97,116,101,114,32,116,104,97,110,32,50,53,53,32,97,114,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0] /* Dimensions greater t */, "i8", ALLOC_NONE, 36816);
allocate([66,111,116,104,32,100,105,109,101,110,115,105,111,110,115,32,109,117,115,116,32,98,101,32,97,116,32,108,101,97,115,116,32,50,0] /* Both dimensions must */, "i8", ALLOC_NONE, 36864);
allocate([115,32,33,61,32,78,85,76,76,0] /* s != NULL\00 */, "i8", ALLOC_NONE, 36900);
allocate([110,95,115,105,110,103,108,101,116,111,110,115,32,61,61,32,48,0] /* n_singletons == 0\00 */, "i8", ALLOC_NONE, 36912);
allocate([121,32,61,61,32,110,95,115,105,110,103,108,101,116,111,110,115,0] /* y == n_singletons\00 */, "i8", ALLOC_NONE, 36932);
allocate([106,32,33,61,32,97,114,101,97,0] /* j != area\00 */, "i8", ALLOC_NONE, 36952);
allocate([109,101,45,62,115,116,97,116,101,112,111,115,32,62,61,32,49,0] /* me-_statepos _= 1\00 */, "i8", ALLOC_NONE, 36964);
allocate([118,50,32,61,61,32,118,49,0] /* v2 == v1\00 */, "i8", ALLOC_NONE, 36984);
allocate([112,32,45,32,100,101,115,99,32,60,32,115,112,97,99,101,0] /* p - desc _ space\00 */, "i8", ALLOC_NONE, 36996);
allocate([99,104,101,99,107,95,118,97,108,105,100,40,99,114,44,32,98,108,111,99,107,115,44,32,107,98,108,111,99,107,115,44,32,112,97,114,97,109,115,45,62,120,116,121,112,101,44,32,103,114,105,100,41,0] /* check_valid(cr, bloc */, "i8", ALLOC_NONE, 37016);
allocate([120,43,100,120,32,60,32,48,32,124,124,32,120,43,100,120,32,62,61,32,99,114,32,124,124,32,121,43,100,121,32,60,32,48,32,124,124,32,121,43,100,121,32,62,61,32,99,114,32,124,124,32,98,108,111,99,107,115,45,62,119,104,105,99,104,98,108,111,99,107,91,40,121,43,100,121,41,42,99,114,43,40,120,43,100,120,41,93,32,33,61,32,98,105,0] /* x+dx _ 0 || x+dx _=  */, "i8", ALLOC_NONE, 37072);
allocate([84,111,111,32,109,117,99,104,32,100,97,116,97,32,116,111,32,102,105,116,32,105,110,32,103,114,105,100,0] /* Too much data to fit */, "i8", ALLOC_NONE, 37168);
allocate([78,111,116,32,101,110,111,117,103,104,32,100,97,116,97,32,116,111,32,102,105,108,108,32,103,114,105,100,0] /* Not enough data to f */, "i8", ALLOC_NONE, 37200);
allocate([79,117,116,45,111,102,45,114,97,110,103,101,32,110,117,109,98,101,114,32,105,110,32,103,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,0] /* Out-of-range number  */, "i8", ALLOC_NONE, 37232);
allocate([65,32,106,105,103,115,97,119,32,98,108,111,99,107,32,105,115,32,116,111,111,32,115,109,97,108,108,0] /* A jigsaw block is to */, "i8", ALLOC_NONE, 37272);
allocate([78,111,116,32,101,110,111,117,103,104,32,100,105,115,116,105,110,99,116,32,106,105,103,115,97,119,32,98,108,111,99,107,115,0] /* Not enough distinct  */, "i8", ALLOC_NONE, 37300);
allocate([84,111,111,32,109,97,110,121,32,100,105,115,116,105,110,99,116,32,106,105,103,115,97,119,32,98,108,111,99,107,115,0] /* Too many distinct ji */, "i8", ALLOC_NONE, 37336);
allocate([65,32,106,105,103,115,97,119,32,98,108,111,99,107,32,105,115,32,116,111,111,32,98,105,103,0] /* A jigsaw block is to */, "i8", ALLOC_NONE, 37368);
allocate([109,105,110,95,110,114,95,98,108,111,99,107,115,32,42,32,109,105,110,95,110,114,95,115,113,117,97,114,101,115,32,61,61,32,97,114,101,97,0] /* min_nr_blocks _ min_ */, "i8", ALLOC_NONE, 37396);
allocate([115,0] /* s\00 */, "i8", ALLOC_NONE, 37436);
allocate([105,110,118,101,114,115,101,32,61,61,32,48,32,124,124,32,105,110,118,101,114,115,101,32,61,61,32,49,0] /* inverse == 0 || inve */, "i8", ALLOC_NONE, 37440);
allocate([100,115,102,95,99,97,110,111,110,105,102,121,40,116,109,112,44,32,106,41,32,61,61,32,100,115,102,95,99,97,110,111,110,105,102,121,40,116,109,112,44,32,105,41,0] /* dsf_canonify(tmp, j) */, "i8", ALLOC_NONE, 37472);
allocate([109,105,110,95,110,114,95,98,108,111,99,107,115,32,61,61,32,109,97,120,95,110,114,95,98,108,111,99,107,115,0] /* min_nr_blocks == max */, "i8", ALLOC_NONE, 37520);
allocate([85,110,101,120,112,101,99,116,101,100,32,100,97,116,97,32,97,116,32,101,110,100,32,111,102,32,103,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,0] /* Unexpected data at e */, "i8", ALLOC_NONE, 37552);
allocate([120,32,62,61,32,48,32,38,38,32,120,32,60,32,99,114,32,38,38,32,121,32,62,61,32,48,32,38,38,32,121,32,60,32,99,114,32,38,38,32,98,108,111,99,107,115,45,62,119,104,105,99,104,98,108,111,99,107,91,121,42,99,114,43,120,93,32,61,61,32,98,105,0] /* x _= 0 && x _ cr &&  */, "i8", ALLOC_NONE, 37596);
allocate([69,120,112,101,99,116,101,100,32,107,105,108,108,101,114,32,99,108,117,101,32,103,114,105,100,32,105,110,32,103,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,0] /* Expected killer clue */, "i8", ALLOC_NONE, 37672);
allocate([69,120,112,101,99,116,101,100,32,107,105,108,108,101,114,32,98,108,111,99,107,32,115,116,114,117,99,116,117,114,101,32,105,110,32,103,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,0] /* Expected killer bloc */, "i8", ALLOC_NONE, 37720);
allocate([69,120,112,101,99,116,101,100,32,106,105,103,115,97,119,32,98,108,111,99,107,32,115,116,114,117,99,116,117,114,101,32,105,110,32,103,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,0] /* Expected jigsaw bloc */, "i8", ALLOC_NONE, 37772);
allocate([98,105,116,109,97,115,107,95,115,111,95,102,97,114,32,33,61,32,110,101,119,95,98,105,116,109,97,115,107,0] /* bitmask_so_far != ne */, "i8", ALLOC_NONE, 37824);
allocate([97,100,100,101,110,100,115,95,108,101,102,116,32,62,61,32,50,0] /* addends_left _= 2\00 */, "i8", ALLOC_NONE, 37856);
allocate([106,32,60,61,32,77,65,88,95,52,83,85,77,83,0] /* j _= MAX_4SUMS\00 */, "i8", ALLOC_NONE, 37876);
allocate([106,32,60,61,32,77,65,88,95,51,83,85,77,83,0] /* j _= MAX_3SUMS\00 */, "i8", ALLOC_NONE, 37892);
allocate([106,32,60,61,32,77,65,88,95,50,83,85,77,83,0] /* j _= MAX_2SUMS\00 */, "i8", ALLOC_NONE, 37908);
allocate([109,111,118,101,115,116,114,32,38,38,32,33,109,115,103,0] /* movestr && !msg\00 */, "i8", ALLOC_NONE, 37924);
allocate([33,105,110,118,101,114,115,101,0] /* !inverse\00 */, "i8", ALLOC_NONE, 37940);
allocate([111,119,110,91,105,93,32,62,61,32,48,32,38,38,32,111,119,110,91,105,93,32,60,32,110,0] /* own[i] _= 0 && own[i */, "i8", ALLOC_NONE, 37952);
allocate([105,32,61,61,32,97,114,101,97,0] /* i == area\00 */, "i8", ALLOC_NONE, 37980);
allocate([33,34,87,101,32,99,97,110,39,116,32,103,101,116,32,104,101,114,101,34,0] /* !\22We can't get her */, "i8", ALLOC_NONE, 37992);
allocate([105,32,60,32,99,114,0] /* i _ cr\00 */, "i8", ALLOC_NONE, 38016);
allocate([105,32,60,32,97,114,101,97,0] /* i _ area\00 */, "i8", ALLOC_NONE, 38024);
allocate([105,32,43,32,114,117,110,32,60,61,32,97,114,101,97,0] /* i + run _= area\00 */, "i8", ALLOC_NONE, 38036);
allocate([78,111,116,32,101,110,111,117,103,104,32,100,97,116,97,32,105,110,32,98,108,111,99,107,32,115,116,114,117,99,116,117,114,101,32,115,112,101,99,105,102,105,99,97,116,105,111,110,0] /* Not enough data in b */, "i8", ALLOC_NONE, 38052);
allocate([112,111,115,32,60,32,50,42,99,114,42,40,99,114,45,49,41,0] /* pos _ 2_cr_(cr-1)\00 */, "i8", ALLOC_NONE, 38104);
allocate([73,110,118,97,108,105,100,32,99,104,97,114,97,99,116,101,114,32,105,110,32,103,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,0] /* Invalid character in */, "i8", ALLOC_NONE, 38124);
allocate([110,98,32,62,61,32,109,105,110,95,101,120,112,101,99,116,101,100,32,38,38,32,110,98,32,60,61,32,109,97,120,95,101,120,112,101,99,116,101,100,0] /* nb _= min_expected & */, "i8", ALLOC_NONE, 38164);
allocate([106,32,60,32,98,108,111,99,107,115,45,62,109,97,120,95,110,114,95,115,113,117,97,114,101,115,0] /* j _ blocks-_max_nr_s */, "i8", ALLOC_NONE, 38208);
allocate([33,42,100,101,115,99,0] /* !_desc\00 */, "i8", ALLOC_NONE, 38236);
allocate([109,101,45,62,110,115,116,97,116,101,115,32,61,61,32,48,0] /* me-_nstates == 0\00 */, "i8", ALLOC_NONE, 38244);
allocate([100,115,102,91,118,50,93,32,38,32,50,0] /* dsf[v2] & 2\00 */, "i8", ALLOC_NONE, 38264);
allocate([113,116,97,105,108,32,60,32,110,0] /* qtail _ n\00 */, "i8", ALLOC_NONE, 38276);
allocate([101,114,114,32,61,61,32,78,85,76,76,0] /* err == NULL\00 */, "i8", ALLOC_NONE, 38288);
allocate([42,100,101,115,99,32,61,61,32,39,44,39,0] /* _desc == ','\00 */, "i8", ALLOC_NONE, 38300);
allocate([115,111,108,111,46,99,0] /* solo.c\00 */, "i8", ALLOC_NONE, 38316);
allocate([99,117,98,101,40,120,44,121,44,110,41,0] /* cube(x,y,n)\00 */, "i8", ALLOC_NONE, 38324);
allocate([102,112,111,115,32,62,61,32,48,0] /* fpos _= 0\00 */, "i8", ALLOC_NONE, 38336);
allocate([106,43,49,32,61,61,32,105,0] /* j+1 == i\00 */, "i8", ALLOC_NONE, 38348);
allocate([111,102,102,32,61,61,32,110,0] /* off == n\00 */, "i8", ALLOC_NONE, 38360);
allocate([114,97,110,100,111,109,46,99,0] /* random.c\00 */, "i8", ALLOC_NONE, 38372);
allocate([98,45,62,119,104,105,99,104,98,108,111,99,107,91,115,113,117,97,114,101,115,91,105,93,93,32,61,61,32,112,114,101,118,105,111,117,115,95,98,108,111,99,107,0] /* b-_whichblock[square */, "i8", ALLOC_NONE, 38384);
allocate([98,45,62,109,97,120,95,110,114,95,115,113,117,97,114,101,115,32,62,61,32,110,114,95,115,113,117,97,114,101,115,0] /* b-_max_nr_squares _= */, "i8", ALLOC_NONE, 38428);
allocate([117,115,97,103,101,45,62,103,114,105,100,91,120,93,32,61,61,32,48,0] /* usage-_grid[x] == 0\ */, "i8", ALLOC_NONE, 38460);
allocate([109,105,100,101,110,100,46,99,0] /* midend.c\00 */, "i8", ALLOC_NONE, 38480);
allocate([100,115,102,91,118,49,93,32,38,32,50,0] /* dsf[v1] & 2\00 */, "i8", ALLOC_NONE, 38492);
allocate([111,119,110,91,116,109,112,115,113,93,32,61,61,32,106,0] /* own[tmpsq] == j\00 */, "i8", ALLOC_NONE, 38504);
allocate([91,37,100,58,37,48,50,100,93,32,0] /* [%d:%02d] \00 */, "i8", ALLOC_NONE, 38520);
allocate([110,115,113,117,97,114,101,115,32,62,32,48,0] /* nsquares _ 0\00 */, "i8", ALLOC_NONE, 38532);
allocate([83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,32,102,97,105,108,101,100,0] /* Solve operation fail */, "i8", ALLOC_NONE, 38548);
allocate([110,115,113,117,97,114,101,115,32,61,61,32,48,0] /* nsquares == 0\00 */, "i8", ALLOC_NONE, 38572);
allocate([78,111,32,103,97,109,101,32,115,101,116,32,117,112,32,116,111,32,115,111,108,118,101,0] /* No game set up to so */, "i8", ALLOC_NONE, 38588);
allocate([110,32,61,61,32,106,0] /* n == j\00 */, "i8", ALLOC_NONE, 38612);
allocate([84,104,105,115,32,103,97,109,101,32,100,111,101,115,32,110,111,116,32,115,117,112,112,111,114,116,32,116,104,101,32,83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,0] /* This game does not s */, "i8", ALLOC_NONE, 38620);
allocate([99,111,117,110,116,32,62,32,48,0] /* count _ 0\00 */, "i8", ALLOC_NONE, 38668);
allocate([99,111,117,110,116,32,62,32,49,0] /* count _ 1\00 */, "i8", ALLOC_NONE, 38680);
allocate([37,100,0] /* %d\00 */, "i8", ALLOC_NONE, 38692);
allocate([117,115,97,103,101,45,62,107,98,108,111,99,107,115,45,62,110,114,95,115,113,117,97,114,101,115,91,117,115,97,103,101,45,62,107,98,108,111,99,107,115,45,62,110,114,95,98,108,111,99,107,115,32,45,32,49,93,32,61,61,32,110,115,113,117,97,114,101,115,0] /* usage-_kblocks-_nr_s */, "i8", ALLOC_NONE, 38696);
allocate([117,115,97,103,101,45,62,107,98,108,111,99,107,115,45,62,110,114,95,115,113,117,97,114,101,115,91,98,93,32,62,32,110,115,113,117,97,114,101,115,0] /* usage-_kblocks-_nr_s */, "i8", ALLOC_NONE, 38768);
allocate([115,117,109,32,62,32,48,0] /* sum _ 0\00 */, "i8", ALLOC_NONE, 38812);
allocate([117,115,97,103,101,45,62,107,99,108,117,101,115,91,105,93,32,62,32,48,0] /* usage-_kclues[i] _ 0 */, "i8", ALLOC_NONE, 38820);
allocate([107,98,108,111,99,107,115,0] /* kblocks\00 */, "i8", ALLOC_NONE, 38844);
allocate([37,115,95,68,69,70,65,85,76,84,0] /* %s_DEFAULT\00 */, "i8", ALLOC_NONE, 38852);
allocate([105,110,118,101,114,115,101,32,61,61,32,48,0] /* inverse == 0\00 */, "i8", ALLOC_NONE, 38864);
allocate([100,114,45,62,109,101,0] /* dr-_me\00 */, "i8", ALLOC_NONE, 38880);
allocate([119,104,32,62,61,32,50,42,110,0] /* wh _= 2_n\00 */, "i8", ALLOC_NONE, 38888);
allocate([112,32,45,32,114,101,116,32,61,61,32,108,101,110,0] /* p - ret == len\00 */, "i8", ALLOC_NONE, 38900);
allocate([44,0] /* ,\00 */, "i8", ALLOC_NONE, 38916);
allocate([115,111,108,111,0] /* solo\00 */, "i8", ALLOC_NONE, 38920);
allocate([37,115,37,100,0] /* %s%d\00 */, "i8", ALLOC_NONE, 38928);
allocate([37,115,95,84,73,76,69,83,73,90,69,0] /* %s_TILESIZE\00 */, "i8", ALLOC_NONE, 38936);
allocate([77,117,108,116,105,112,108,101,32,115,111,108,117,116,105,111,110,115,32,101,120,105,115,116,32,102,111,114,32,116,104,105,115,32,112,117,122,122,108,101,0] /* Multiple solutions e */, "i8", ALLOC_NONE, 38948);
allocate([111,117,116,32,111,102,32,109,101,109,111,114,121,0] /* out of memory\00 */, "i8", ALLOC_NONE, 38992);
allocate([102,97,116,97,108,32,101,114,114,111,114,58,32,0] /* fatal error: \00 */, "i8", ALLOC_NONE, 39008);
allocate([78,111,32,115,111,108,117,116,105,111,110,32,101,120,105,115,116,115,32,102,111,114,32,116,104,105,115,32,112,117,122,122,108,101,0] /* No solution exists f */, "i8", ALLOC_NONE, 39024);
allocate(1, "i8", ALLOC_NONE, 39060);
allocate([112,32,45,32,114,101,116,32,61,61,32,116,111,116,97,108,108,101,110,0] /* p - ret == totallen\ */, "i8", ALLOC_NONE, 39064);
allocate([100,115,102,46,99,0] /* dsf.c\00 */, "i8", ALLOC_NONE, 39084);
allocate([33,115,116,97,116,101,45,62,107,98,108,111,99,107,115,0] /* !state-_kblocks\00 */, "i8", ALLOC_NONE, 39092);
allocate([110,32,62,61,32,48,32,38,38,32,110,32,60,32,109,101,45,62,110,112,114,101,115,101,116,115,0] /* n _= 0 && n _ me-_np */, "i8", ALLOC_NONE, 39108);
allocate([37,99,37,100,44,37,100,44,37,100,0] /* %c%d,%d,%d\00 */, "i8", ALLOC_NONE, 39136);
allocate([98,105,116,115,32,60,32,51,50,0] /* bits _ 32\00 */, "i8", ALLOC_NONE, 39148);
allocate([37,115,95,80,82,69,83,69,84,83,0] /* %s_PRESETS\00 */, "i8", ALLOC_NONE, 39160);
allocate([100,114,97,119,105,110,103,46,99,0] /* drawing.c\00 */, "i8", ALLOC_NONE, 39172);
allocate([37,50,120,37,50,120,37,50,120,0] /* %2x%2x%2x\00 */, "i8", ALLOC_NONE, 39184);
allocate([100,105,118,118,121,46,99,0] /* divvy.c\00 */, "i8", ALLOC_NONE, 39196);
allocate([37,100,44,37,100,44,37,100,0] /* %d,%d,%d\00 */, "i8", ALLOC_NONE, 39204);
allocate([52,120,52,32,66,97,115,105,99,0] /* 4x4 Basic\00 */, "i8", ALLOC_NONE, 39216);
allocate([51,120,52,32,66,97,115,105,99,0] /* 3x4 Basic\00 */, "i8", ALLOC_NONE, 39228);
allocate([57,32,74,105,103,115,97,119,32,65,100,118,97,110,99,101,100,0] /* 9 Jigsaw Advanced\00 */, "i8", ALLOC_NONE, 39240);
allocate([57,32,74,105,103,115,97,119,32,66,97,115,105,99,32,88,0] /* 9 Jigsaw Basic X\00 */, "i8", ALLOC_NONE, 39260);
allocate([105,110,100,101,120,32,62,61,32,48,0] /* index _= 0\00 */, "i8", ALLOC_NONE, 39280);
allocate([57,32,74,105,103,115,97,119,32,66,97,115,105,99,0] /* 9 Jigsaw Basic\00 */, "i8", ALLOC_NONE, 39292);
allocate([51,120,51,32,75,105,108,108,101,114,0] /* 3x3 Killer\00 */, "i8", ALLOC_NONE, 39308);
allocate([51,120,51,32,85,110,114,101,97,115,111,110,97,98,108,101,0] /* 3x3 Unreasonable\00 */, "i8", ALLOC_NONE, 39320);
allocate([119,104,32,61,61,32,107,42,110,0] /* wh == k_n\00 */, "i8", ALLOC_NONE, 39340);
allocate([51,120,51,32,69,120,116,114,101,109,101,0] /* 3x3 Extreme\00 */, "i8", ALLOC_NONE, 39352);
allocate([37,115,95,67,79,76,79,85,82,95,37,100,0] /* %s_COLOUR_%d\00 */, "i8", ALLOC_NONE, 39364);
allocate([51,120,51,32,65,100,118,97,110,99,101,100,32,88,0] /* 3x3 Advanced X\00 */, "i8", ALLOC_NONE, 39380);
allocate([51,120,51,32,65,100,118,97,110,99,101,100,0] /* 3x3 Advanced\00 */, "i8", ALLOC_NONE, 39396);
allocate([112,98,101,115,116,32,62,32,48,0] /* pbest _ 0\00 */, "i8", ALLOC_NONE, 39412);
allocate([51,120,51,32,73,110,116,101,114,109,101,100,105,97,116,101,0] /* 3x3 Intermediate\00 */, "i8", ALLOC_NONE, 39424);
allocate([51,120,51,32,66,97,115,105,99,32,88,0] /* 3x3 Basic X\00 */, "i8", ALLOC_NONE, 39444);
allocate([51,120,51,32,66,97,115,105,99,0] /* 3x3 Basic\00 */, "i8", ALLOC_NONE, 39456);
allocate([51,120,51,32,84,114,105,118,105,97,108,0] /* 3x3 Trivial\00 */, "i8", ALLOC_NONE, 39468);
allocate([50,120,51,32,66,97,115,105,99,0] /* 2x3 Basic\00 */, "i8", ALLOC_NONE, 39480);
allocate([50,120,50,32,84,114,105,118,105,97,108,0] /* 2x2 Trivial\00 */, "i8", ALLOC_NONE, 39492);
allocate([100,117,0] /* du\00 */, "i8", ALLOC_NONE, 39504);
allocate([100,101,0] /* de\00 */, "i8", ALLOC_NONE, 39508);
allocate([100,97,0] /* da\00 */, "i8", ALLOC_NONE, 39512);
allocate([100,105,0] /* di\00 */, "i8", ALLOC_NONE, 39516);
allocate([99,108,117,101,32,33,61,32,48,0] /* clue != 0\00 */, "i8", ALLOC_NONE, 39520);
allocate([103,97,109,101,115,46,115,111,108,111,0] /* games.solo\00 */, "i8", ALLOC_NONE, 39532);
allocate([83,111,108,111,0] /* Solo\00 */, "i8", ALLOC_NONE, 39544);
allocate(472, "i8", ALLOC_NONE, 39552);
allocate([118,97,108,105,100,97,116,101,95,98,108,111,99,107,95,100,101,115,99,0] /* validate_block_desc\ */, "i8", ALLOC_NONE, 40024);
allocate([115,116,97,116,117,115,95,98,97,114,0] /* status_bar\00 */, "i8", ALLOC_NONE, 40044);
allocate([115,112,108,105,116,95,98,108,111,99,107,0] /* split_block\00 */, "i8", ALLOC_NONE, 40056);
allocate([115,112,101,99,95,116,111,95,103,114,105,100,0] /* spec_to_grid\00 */, "i8", ALLOC_NONE, 40068);
allocate([115,112,101,99,95,116,111,95,100,115,102,0] /* spec_to_dsf\00 */, "i8", ALLOC_NONE, 40084);
allocate([115,111,108,118,101,114,95,115,101,116,0] /* solver_set\00 */, "i8", ALLOC_NONE, 40096);
allocate([115,111,108,118,101,114,95,112,108,97,99,101,0] /* solver_place\00 */, "i8", ALLOC_NONE, 40108);
allocate([115,111,108,118,101,114,95,107,105,108,108,101,114,95,115,117,109,115,0] /* solver_killer_sums\0 */, "i8", ALLOC_NONE, 40124);
allocate([115,111,108,118,101,114,95,101,108,105,109,0] /* solver_elim\00 */, "i8", ALLOC_NONE, 40144);
allocate([115,111,108,118,101,114,0] /* solver\00 */, "i8", ALLOC_NONE, 40156);
allocate([114,101,109,111,118,101,95,102,114,111,109,95,98,108,111,99,107,0] /* remove_from_block\00 */, "i8", ALLOC_NONE, 40164);
allocate([114,97,110,100,111,109,95,117,112,116,111,0] /* random_upto\00 */, "i8", ALLOC_NONE, 40184);
allocate([112,114,101,99,111,109,112,117,116,101,95,115,117,109,95,98,105,116,115,0] /* precompute_sum_bits\ */, "i8", ALLOC_NONE, 40196);
allocate([111,117,116,108,105,110,101,95,98,108,111,99,107,95,115,116,114,117,99,116,117,114,101,0] /* outline_block_struct */, "i8", ALLOC_NONE, 40216);
allocate([110,101,119,95,103,97,109,101,95,100,101,115,99,0] /* new_game_desc\00 */, "i8", ALLOC_NONE, 40240);
allocate([110,101,119,95,103,97,109,101,0] /* new_game\00 */, "i8", ALLOC_NONE, 40256);
allocate([109,105,100,101,110,100,95,115,111,108,118,101,0] /* midend_solve\00 */, "i8", ALLOC_NONE, 40268);
allocate([109,105,100,101,110,100,95,114,101,115,116,97,114,116,95,103,97,109,101,0] /* midend_restart_game\ */, "i8", ALLOC_NONE, 40284);
allocate([109,105,100,101,110,100,95,114,101,100,114,97,119,0] /* midend_redraw\00 */, "i8", ALLOC_NONE, 40304);
allocate([109,105,100,101,110,100,95,114,101,97,108,108,121,95,112,114,111,99,101,115,115,95,107,101,121,0] /* midend_really_proces */, "i8", ALLOC_NONE, 40320);
allocate([109,105,100,101,110,100,95,110,101,119,95,103,97,109,101,0] /* midend_new_game\00 */, "i8", ALLOC_NONE, 40348);
allocate([109,105,100,101,110,100,95,102,101,116,99,104,95,112,114,101,115,101,116,0] /* midend_fetch_preset\ */, "i8", ALLOC_NONE, 40364);
allocate([109,97,107,101,95,98,108,111,99,107,115,95,102,114,111,109,95,119,104,105,99,104,98,108,111,99,107,0] /* make_blocks_from_whi */, "i8", ALLOC_NONE, 40384);
allocate([103,114,105,100,95,116,101,120,116,95,102,111,114,109,97,116,0] /* grid_text_format\00 */, "i8", ALLOC_NONE, 40412);
allocate([103,101,110,95,107,105,108,108,101,114,95,99,97,103,101,115,0] /* gen_killer_cages\00 */, "i8", ALLOC_NONE, 40432);
allocate([103,97,109,101,95,116,101,120,116,95,102,111,114,109,97,116,0] /* game_text_format\00 */, "i8", ALLOC_NONE, 40452);
allocate([103,97,109,101,95,114,101,100,114,97,119,0] /* game_redraw\00 */, "i8", ALLOC_NONE, 40472);
allocate([102,105,110,100,95,115,117,109,95,98,105,116,115,0] /* find_sum_bits\00 */, "i8", ALLOC_NONE, 40484);
allocate([102,105,108,116,101,114,95,119,104,111,108,101,95,99,97,103,101,115,0] /* filter_whole_cages\0 */, "i8", ALLOC_NONE, 40500);
allocate([101,110,99,111,100,101,95,115,111,108,118,101,95,109,111,118,101,0] /* encode_solve_move\00 */, "i8", ALLOC_NONE, 40520);
allocate([101,110,99,111,100,101,95,112,117,122,122,108,101,95,100,101,115,99,0] /* encode_puzzle_desc\0 */, "i8", ALLOC_NONE, 40540);
allocate([101,100,115,102,95,109,101,114,103,101,0] /* edsf_merge\00 */, "i8", ALLOC_NONE, 40560);
allocate([101,100,115,102,95,99,97,110,111,110,105,102,121,0] /* edsf_canonify\00 */, "i8", ALLOC_NONE, 40572);
allocate([100,115,102,95,116,111,95,98,108,111,99,107,115,0] /* dsf_to_blocks\00 */, "i8", ALLOC_NONE, 40588);
allocate([100,114,97,119,95,110,117,109,98,101,114,0] /* draw_number\00 */, "i8", ALLOC_NONE, 40604);
allocate([100,105,118,118,121,95,105,110,116,101,114,110,97,108,0] /* divvy_internal\00 */, "i8", ALLOC_NONE, 40616);
allocate([99,111,109,112,117,116,101,95,107,99,108,117,101,115,0] /* compute_kclues\00 */, "i8", ALLOC_NONE, 40632);
HEAP32[((32768)>>2)]=((39544)|0);
HEAP32[((32772)>>2)]=((39532)|0);
HEAP32[((32776)>>2)]=((38920)|0);
HEAP32[((35632)>>2)]=((39492)|0);
HEAP32[((35664)>>2)]=((39480)|0);
HEAP32[((35696)>>2)]=((39468)|0);
HEAP32[((35728)>>2)]=((39456)|0);
HEAP32[((35760)>>2)]=((39444)|0);
HEAP32[((35792)>>2)]=((39424)|0);
HEAP32[((35824)>>2)]=((39396)|0);
HEAP32[((35856)>>2)]=((39380)|0);
HEAP32[((35888)>>2)]=((39352)|0);
HEAP32[((35920)>>2)]=((39320)|0);
HEAP32[((35952)>>2)]=((39308)|0);
HEAP32[((35984)>>2)]=((39292)|0);
HEAP32[((36016)>>2)]=((39260)|0);
HEAP32[((36048)>>2)]=((39240)|0);
HEAP32[((36080)>>2)]=((39228)|0);
HEAP32[((36112)>>2)]=((39216)|0);
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
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }
  function _memcmp(p1, p2, num) {
      p1 = p1|0; p2 = p2|0; num = num|0;
      var i = 0, v1 = 0, v2 = 0;
      while ((i|0) < (num|0)) {
        var v1 = HEAPU8[(((p1)+(i))|0)];
        var v2 = HEAPU8[(((p2)+(i))|0)];
        if ((v1|0) != (v2|0)) return ((v1|0) > (v2|0) ? 1 : -1)|0;
        i = (i+1)|0;
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
var _frontend_default_colour; // stub for _frontend_default_colour
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
          HEAP8[(dest)]=HEAP8[(src)];
        }
      } else {
        _memcpy(dest, src, num);
      }
    }var _llvm_memmove_p0i8_p0i8_i32=_memmove;
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
  function _strcpy(pdest, psrc) {
      pdest = pdest|0; psrc = psrc|0;
      var i = 0;
      do {
        HEAP8[(((pdest+i)|0)|0)]=HEAP8[(((psrc+i)|0)|0)];
        i = (i+1)|0;
      } while ((HEAP8[(((psrc)+(i-1))|0)])|0 != 0);
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
function _validate_params(r1,r2){var r3,r4,r5;r2=HEAP32[r1>>2];if((r2|0)<2){r3=36864;return r3}if((r2|0)>255){r3=36816;return r3}r4=HEAP32[r1+4>>2];if((r4|0)>255){r3=36816;return r3}r5=Math.imul(r4,r2);if((r5|0)>31){r3=36756;return r3}else{return(HEAP32[r1+24>>2]|0)!=0&(r5|0)>9?36704:0}}function _decode_params(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r3=0;r4=_atoi(r2);r5=(r1+4|0)>>2;HEAP32[r5]=r4;r6=r1|0;HEAP32[r6>>2]=r4;r7=(r1+20|0)>>2;HEAP32[r7]=0;r8=(r1+24|0)>>2;HEAP32[r8]=0;r9=r2;while(1){r10=HEAP8[r9];if(r10<<24>>24==0){r11=0;break}r12=r9+1|0;if(((r10&255)-48|0)>>>0<10){r9=r12}else{r3=14;break}}do{if(r3==14){if(r10<<24>>24!=120){r11=r10;break}r2=_atoi(r12);HEAP32[r5]=r2;r13=r12;while(1){r14=HEAP8[r13];if(r14<<24>>24==0){r15=0;break}if(((r14&255)-48|0)>>>0<10){r13=r13+1|0}else{r15=r14;break}}r14=(r1+12|0)>>2;r16=(r1+8|0)>>2;r17=r13;r18=r15;r19=r2;r20=r4;L24:while(1){do{if(r18<<24>>24==106){r21=Math.imul(r20,r19);HEAP32[r6>>2]=r21;HEAP32[r5]=1;r22=r17+1|0;r23=1;r24=r21}else if(r18<<24>>24==120){HEAP32[r7]=1;r22=r17+1|0;r23=r19;r24=r20}else if(r18<<24>>24==107){HEAP32[r8]=1;r22=r17+1|0;r23=r19;r24=r20}else if(r18<<24>>24==114|r18<<24>>24==109|r18<<24>>24==97){r21=r17+1|0;r25=r18<<24>>24==109;if(r25){r26=HEAP8[r21]<<24>>24==100;r27=r26&1;r28=r26?r17+2|0:r21}else{r27=0;r28=r21}r21=_atoi(r28);r26=r28;while(1){r29=HEAP8[r26];if(r29<<24>>24==0){break}if(((r29&255)-48|0)>>>0<10){r26=r26+1|0}else{break}}if(r25&(r21|0)==8){HEAP32[r16]=7}r29=(r21|0)==4;if(r25&r29){HEAP32[r16]=(r27|0)!=0?6:5}r30=(r21|0)==2;if(r25&r30){HEAP32[r16]=(r27|0)!=0?4:3}r31=r18<<24>>24==114;if(r31&r29){HEAP32[r16]=2}if(r31&r30){HEAP32[r16]=1}if(r18<<24>>24!=97){r22=r26;r23=r19;r24=r20;break}HEAP32[r16]=0;r22=r26;r23=r19;r24=r20}else if(r18<<24>>24==0){break L24}else{r30=r17+1|0;if(r18<<24>>24!=100){r22=r30;r23=r19;r24=r20;break}r31=HEAP8[r30];if(r31<<24>>24==116){HEAP32[r14]=0;r22=r17+2|0;r23=r19;r24=r20;break}else if(r31<<24>>24==98){HEAP32[r14]=1;r22=r17+2|0;r23=r19;r24=r20;break}else if(r31<<24>>24==105){HEAP32[r14]=2;r22=r17+2|0;r23=r19;r24=r20;break}else if(r31<<24>>24==97){HEAP32[r14]=3;r22=r17+2|0;r23=r19;r24=r20;break}else if(r31<<24>>24==101){HEAP32[r14]=4;r22=r17+2|0;r23=r19;r24=r20;break}else if(r31<<24>>24==117){HEAP32[r14]=5;r22=r17+2|0;r23=r19;r24=r20;break}else{r22=r30;r23=r19;r24=r20;break}}}while(0);r17=r22;r18=HEAP8[r22];r19=r23;r20=r24}return}}while(0);r24=(r1+12|0)>>2;r23=(r1+8|0)>>2;r1=r9;r9=r11;L66:while(1){do{if(r9<<24>>24==114|r9<<24>>24==109|r9<<24>>24==97){r11=r1+1|0;r22=r9<<24>>24==109;if(r22){r27=HEAP8[r11]<<24>>24==100;r32=r27&1;r33=r27?r1+2|0:r11}else{r32=0;r33=r11}r11=_atoi(r33);r27=r33;while(1){r28=HEAP8[r27];if(r28<<24>>24==0){break}if(((r28&255)-48|0)>>>0<10){r27=r27+1|0}else{break}}if(r22&(r11|0)==8){HEAP32[r23]=7}r28=(r11|0)==4;if(r22&r28){HEAP32[r23]=(r32|0)!=0?6:5}r6=(r11|0)==2;if(r22&r6){HEAP32[r23]=(r32|0)!=0?4:3}r4=r9<<24>>24==114;if(r4&r28){HEAP32[r23]=2}if(r4&r6){HEAP32[r23]=1}if(r9<<24>>24!=97){r34=r27;break}HEAP32[r23]=0;r34=r27}else if(r9<<24>>24==107){HEAP32[r8]=1;r34=r1+1|0}else if(r9<<24>>24==120){HEAP32[r7]=1;r34=r1+1|0}else if(r9<<24>>24==106){HEAP32[r5]=1;r34=r1+1|0}else if(r9<<24>>24==0){break L66}else{r6=r1+1|0;if(r9<<24>>24!=100){r34=r6;break}r4=HEAP8[r6];if(r4<<24>>24==117){HEAP32[r24]=5;r34=r1+2|0;break}else if(r4<<24>>24==101){HEAP32[r24]=4;r34=r1+2|0;break}else if(r4<<24>>24==97){HEAP32[r24]=3;r34=r1+2|0;break}else if(r4<<24>>24==105){HEAP32[r24]=2;r34=r1+2|0;break}else if(r4<<24>>24==98){HEAP32[r24]=1;r34=r1+2|0;break}else if(r4<<24>>24==116){HEAP32[r24]=0;r34=r1+2|0;break}else{r34=r6;break}}}while(0);r1=r34;r9=HEAP8[r34]}return}function _free_params(r1){if((r1|0)==0){return}_free(r1);return}function _default_params(){var r1,r2,r3;r1=STACKTOP;r2=_malloc(28),r3=r2>>2;if((r2|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r3+1]=3;HEAP32[r3]=3;HEAP32[r3+5]=0;HEAP32[r3+6]=0;HEAP32[r3+2]=1;HEAP32[r3+3]=0;HEAP32[r3+4]=3;STACKTOP=r1;return r2}}function _game_fetch_preset(r1,r2,r3){var r4,r5,r6,r7;r4=STACKTOP;if((r1|0)<0|r1>>>0>15){r5=0;STACKTOP=r4;return r5}r6=HEAP32[(r1<<5)+35632>>2];r7=_malloc(_strlen(r6)+1|0);if((r7|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r7,r6);HEAP32[r2>>2]=r7;r7=_malloc(28),r2=r7>>2;if((r7|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r6=((r1<<5)+35636|0)>>2;HEAP32[r2]=HEAP32[r6];HEAP32[r2+1]=HEAP32[r6+1];HEAP32[r2+2]=HEAP32[r6+2];HEAP32[r2+3]=HEAP32[r6+3];HEAP32[r2+4]=HEAP32[r6+4];HEAP32[r2+5]=HEAP32[r6+5];HEAP32[r2+6]=HEAP32[r6+6];HEAP32[r3>>2]=r7;r5=1;STACKTOP=r4;return r5}function _encode_params(r1,r2){var r3,r4,r5,r6,r7;r3=r1>>2;r1=STACKTOP;STACKTOP=STACKTOP+80|0;r4=r1;r5=HEAP32[r3+1];r6=r4|0;r7=HEAP32[r3];if((r5|0)>1){_sprintf(r6,36296,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r7,HEAP32[tempInt+4>>2]=r5,tempInt))}else{_sprintf(r6,36292,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r7,tempInt))}if((HEAP32[r3+5]|0)!=0){r7=r4+_strlen(r6)|0;tempBigInt=120;HEAP8[r7]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r7+1|0]=tempBigInt&255}if((HEAP32[r3+6]|0)!=0){r7=r4+_strlen(r6)|0;tempBigInt=107;HEAP8[r7]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r7+1|0]=tempBigInt&255}do{if((r2|0)!=0){r7=HEAP32[r3+2];if((r7|0)==4){r5=r4+_strlen(r6)|0;tempBigInt=3302509;HEAP8[r5]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r5+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r5+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r5+3|0]=tempBigInt&255}else if((r7|0)==2){r5=r4+_strlen(r6)|0;HEAP8[r5]=HEAP8[36248];HEAP8[r5+1|0]=HEAP8[36249|0];HEAP8[r5+2|0]=HEAP8[36250|0]}else if((r7|0)==5){r5=r4+_strlen(r6)|0;HEAP8[r5]=HEAP8[36256];HEAP8[r5+1|0]=HEAP8[36257|0];HEAP8[r5+2|0]=HEAP8[36258|0]}else if((r7|0)==6){r5=r4+_strlen(r6)|0;tempBigInt=3433581;HEAP8[r5]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r5+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r5+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r5+3|0]=tempBigInt&255}else if((r7|0)==0){r5=r4+_strlen(r6)|0;tempBigInt=97;HEAP8[r5]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r5+1|0]=tempBigInt&255}else if((r7|0)==3){r5=r4+_strlen(r6)|0;HEAP8[r5]=HEAP8[36252];HEAP8[r5+1|0]=HEAP8[36253|0];HEAP8[r5+2|0]=HEAP8[36254|0]}else if((r7|0)==7){r7=r4+_strlen(r6)|0;HEAP8[r7]=HEAP8[36260];HEAP8[r7+1|0]=HEAP8[36261|0];HEAP8[r7+2|0]=HEAP8[36262|0]}r7=HEAP32[r3+3];if((r7|0)==1){r5=r4+_strlen(r6)|0;HEAP8[r5]=HEAP8[36244];HEAP8[r5+1|0]=HEAP8[36245|0];HEAP8[r5+2|0]=HEAP8[36246|0];break}else if((r7|0)==2){r5=r4+_strlen(r6)|0;HEAP8[r5]=HEAP8[39516];HEAP8[r5+1|0]=HEAP8[39517|0];HEAP8[r5+2|0]=HEAP8[39518|0];break}else if((r7|0)==3){r5=r4+_strlen(r6)|0;HEAP8[r5]=HEAP8[39512];HEAP8[r5+1|0]=HEAP8[39513|0];HEAP8[r5+2|0]=HEAP8[39514|0];break}else if((r7|0)==4){r5=r4+_strlen(r6)|0;HEAP8[r5]=HEAP8[39508];HEAP8[r5+1|0]=HEAP8[39509|0];HEAP8[r5+2|0]=HEAP8[39510|0];break}else if((r7|0)==5){r7=r4+_strlen(r6)|0;HEAP8[r7]=HEAP8[39504];HEAP8[r7+1|0]=HEAP8[39505|0];HEAP8[r7+2|0]=HEAP8[39506|0];break}else{break}}}while(0);r4=_malloc(_strlen(r6)+1|0);if((r4|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r4,r6);STACKTOP=r1;return r4}}function _dup_params(r1){var r2,r3,r4,r5;r2=STACKTOP;r3=_malloc(28),r4=r3>>2;if((r3|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r5=r1>>2;HEAP32[r4]=HEAP32[r5];HEAP32[r4+1]=HEAP32[r5+1];HEAP32[r4+2]=HEAP32[r5+2];HEAP32[r4+3]=HEAP32[r5+3];HEAP32[r4+4]=HEAP32[r5+4];HEAP32[r4+5]=HEAP32[r5+5];HEAP32[r4+6]=HEAP32[r5+6];STACKTOP=r2;return r3}}function _game_configure(r1){var r2,r3,r4,r5,r6,r7;r2=r1>>2;r3=STACKTOP;STACKTOP=STACKTOP+80|0;r4=_malloc(128),r5=r4>>2;if((r4|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r5]=36680;HEAP32[r5+1]=0;r6=r3|0;_sprintf(r6,38692,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r2],tempInt));r7=_malloc(_strlen(r6)+1|0);if((r7|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r7,r6);HEAP32[r5+2]=r7;HEAP32[r5+3]=0;HEAP32[r5+4]=36648;HEAP32[r5+5]=0;r7=r1+4|0;_sprintf(r6,38692,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r7>>2],tempInt));r1=_malloc(_strlen(r6)+1|0);if((r1|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r1,r6);HEAP32[r5+6]=r1;HEAP32[r5+7]=0;HEAP32[r5+8]=36596;HEAP32[r5+9]=2;HEAP32[r5+10]=0;HEAP32[r5+11]=HEAP32[r2+5];HEAP32[r5+12]=36528;HEAP32[r5+13]=2;HEAP32[r5+14]=0;HEAP32[r5+15]=(HEAP32[r7>>2]|0)==1&1;HEAP32[r5+16]=36508;HEAP32[r5+17]=2;HEAP32[r5+18]=0;HEAP32[r5+19]=HEAP32[r2+6];HEAP32[r5+20]=36496;HEAP32[r5+21]=1;HEAP32[r5+22]=36376;HEAP32[r5+23]=HEAP32[r2+2];HEAP32[r5+24]=36364;HEAP32[r5+25]=1;HEAP32[r5+26]=36304;HEAP32[r5+27]=HEAP32[r2+3];HEAP32[r5+28]=0;HEAP32[r5+29]=3;HEAP32[r5+30]=0;HEAP32[r5+31]=0;STACKTOP=r3;return r4}}function _custom_params(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=r1>>2;r1=STACKTOP;r3=_malloc(28),r4=r3>>2;if((r3|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r5=_atoi(HEAP32[r2+2]);r6=r3;HEAP32[r6>>2]=r5;r7=_atoi(HEAP32[r2+6]);r8=r3+4|0;HEAP32[r8>>2]=r7;HEAP32[r4+5]=HEAP32[r2+11];if((HEAP32[r2+15]|0)!=0){r9=Math.imul(r5,r7);HEAP32[r6>>2]=r9;HEAP32[r8>>2]=1}HEAP32[r4+6]=HEAP32[r2+19];HEAP32[r4+2]=HEAP32[r2+23];HEAP32[r4+3]=HEAP32[r2+27];HEAP32[r4+4]=3;STACKTOP=r1;return r3}function _new_game_desc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+468|0;r6=r5;r7=r5+96;r8=r5+100;r9=r5+196;r10=r5+292;r11=r5+388,r12=r11>>2;r13=r5+452;r14=(r1|0)>>2;r15=HEAP32[r14];r16=(r1+4|0)>>2;r17=HEAP32[r16];r18=Math.imul(r17,r15);r19=Math.imul(r18,r18);_precompute_sum_bits();r20=(r13|0)>>2;HEAP32[r20]=HEAP32[r1+12>>2];r21=r1+16|0;r22=(r13+4|0)>>2;HEAP32[r22]=HEAP32[r21>>2];if((r15|0)==2&(r17|0)==2){HEAP32[r20]=0}r23=_malloc(r19);if((r23|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r24=_malloc(r19<<3);if((r24|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r25=r24>>2;r26=_malloc(r19);if((r26|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r27=_alloc_block_structure(r15,r17,r19,r18,r18),r28=r27>>2;r29=(r1+24|0)>>2;do{if((HEAP32[r29]|0)==0){r30=0}else{r31=_malloc(r19);if((r31|0)!=0){r30=r31;break}_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}while(0);r31=(r17|0)==1;r32=r27+4|0;r33=r27+8|0;r34=r27+32|0;r35=(r27+16|0)>>2;r36=(r1+20|0)>>2;r37=Math.imul(r19,r19);r38=r18<<2;r39=(r18|0)>0;r40=r19*12&-1;r41=(r18|0)>1;r42=(r2+60|0)>>2;r43=r2|0;r44=r2+40|0;r45=r6|0;r46=r6+4|0;r47=r6+8|0;r48=r6+12|0;r49=r6+16|0;r50=r6+84|0;r51=r6+92|0;r52=r6+88|0;r53=(r19|0)==0;r54=(r13+8|0)>>2;r55=(r13+12|0)>>2;r56=r11|0;r11=r1+8|0;r1=r10|0;r57=r10+4|0;r58=r10+8|0;r59=r10+12|0;r60=r10+16|0;r61=r10+84|0;r62=r10+92|0;r63=r10+88|0;r64=r9|0;r65=r9+4|0;r66=r9+8|0;r67=r9+12|0;r68=r9+16|0;r69=r9+84|0;r70=r9+92|0;r71=r9+88|0;r72=r8|0;r73=r8+4|0;r74=r8+8|0;r75=r8+12|0;r76=r8+16|0;r77=r8+84|0;r78=r8+92|0;r79=r8+88|0;r80=0,r81=r80>>2;L197:while(1){L199:do{if(r31){r82=_divvy_rectangle(r18,r18,r18,r2);r83=Math.imul(HEAP32[r33>>2],HEAP32[r32>>2]);r84=Math.imul(r83,r83);L207:do{if((r84|0)==0){r85=0}else{r83=0;while(1){HEAP32[HEAP32[r35]+(r83<<2)>>2]=-1;r86=r83+1|0;if((r86|0)<(r84|0)){r83=r86}else{r87=0;r88=0;break}}while(1){r83=(r88<<2)+r82|0;r86=HEAP32[r83>>2];if((r86&2|0)==0){r89=0;r90=r86;while(1){r91=r90&1^r89;r92=r90>>2;r93=HEAP32[r82+(r92<<2)>>2];if((r93&2|0)==0){r89=r91;r90=r93}else{break}}L216:do{if((r92|0)==(r88|0)){r94=r91;r95=r88}else{r90=r92<<2;r89=r86>>2;r93=r91^r86&1;HEAP32[r83>>2]=r91|r90;if((r89|0)==(r92|0)){r94=r93;r95=r92;break}else{r96=r89;r97=r93}while(1){r93=(r96<<2)+r82|0;r89=HEAP32[r93>>2];r98=r89>>2;r99=r97^r89&1;HEAP32[r93>>2]=r97|r90;if((r98|0)==(r92|0)){r94=r99;r95=r92;break L216}else{r96=r98;r97=r99}}}}while(0);if((r94|0)==0){r100=r95}else{r4=162;break L197}}else{r100=r88}r83=HEAP32[r35];r86=(r100<<2)+r83|0;r90=HEAP32[r86>>2];if((r90|0)<0){HEAP32[r86>>2]=r87;r86=HEAP32[r35];r101=r87+1|0;r102=r86;r103=HEAP32[r86+(r100<<2)>>2]}else{r101=r87;r102=r83;r103=r90}HEAP32[r102+(r88<<2)>>2]=r103;r90=r88+1|0;if((r90|0)<(r84|0)){r87=r101;r88=r90}else{r85=r101;break L207}}}}while(0);if((r85|0)!=(r18|0)){r4=167;break L197}HEAP32[r34>>2]=r18;if((r82|0)==0){break}_free(r82)}else{if(r39){r104=0}else{break}while(1){r84=r104-(r104|0)%(r15|0)|0;r90=Math.imul(r104,r18);r83=0;while(1){HEAP32[HEAP32[r35]+(r83+r90<<2)>>2]=r84+((r83|0)/(r17|0)&-1)|0;r86=r83+1|0;if((r86|0)==(r18|0)){break}else{r83=r86}}r83=r104+1|0;if((r83|0)==(r18|0)){break L199}else{r104=r83}}}}while(0);_make_blocks_from_whichblock(r27);do{if((HEAP32[r29]|0)==0){r105=r80,r106=r105>>2}else{do{if((r80|0)!=0){r82=r80|0;r83=HEAP32[r82>>2]-1|0;HEAP32[r82>>2]=r83;if((r83|0)!=0){break}r83=HEAP32[r81+4];if((r83|0)!=0){_free(r83)}r83=HEAP32[r81+5];if((r83|0)!=0){_free(r83)}r83=HEAP32[r81+7];if((r83|0)!=0){_free(r83)}r83=HEAP32[r81+6];if((r83|0)!=0){_free(r83)}_free(r80)}}while(0);r83=(HEAP32[r21>>2]|0)>0;r82=_alloc_block_structure(1,r18,r19,r18,r19);L247:do{if(!r53){r84=r82+16|0;r90=0;while(1){HEAP32[HEAP32[r84>>2]+(r90<<2)>>2]=-1;r86=r90+1|0;if((r86|0)<(r19|0)){r90=r86}else{break L247}}}}while(0);L252:do{if(r39){r90=(r82+16|0)>>2;r84=r83^1;r86=0;r99=0;r98=0;while(1){r93=Math.imul(r99,r18);r89=r86;r107=0;r108=r98;while(1){r109=r107+r93|0;r110=(r109<<2)+HEAP32[r90]|0;if((HEAP32[r110>>2]|0)==-1){HEAP32[r110>>2]=r108;r110=HEAP32[r42];if((r110|0)>19){r111=0;while(1){r112=r2+r111|0;r113=HEAP8[r112];if(r113<<24>>24!=-1){r4=194;break}HEAP8[r112]=0;r114=r111+1|0;if((r114|0)<20){r111=r114}else{break}}if(r4==194){r4=0;HEAP8[r112]=r113+1&255}HEAP32[r1>>2]=1732584193;HEAP32[r57>>2]=-271733879;HEAP32[r58>>2]=-1732584194;HEAP32[r59>>2]=271733878;HEAP32[r60>>2]=-1009589776;HEAP32[r61>>2]=0;HEAP32[r62>>2]=0;HEAP32[r63>>2]=0;_SHA_Bytes(r10,r43,40);_SHA_Final(r10,r44);HEAP32[r42]=0;r115=0}else{r115=r110}r111=r115+1|0;HEAP32[r42]=r111;r114=HEAP8[r2+(r115+40)|0]&15;r116=r109+1|0;do{if((r116|0)<(r19|0)){if(!(r114>>>0>3|(r114|0)!=0&r84)){r4=212;break}do{if((r107+1|0)==(r18|0)){r4=208}else{if((HEAP32[HEAP32[r90]+(r116<<2)>>2]|0)!=-1){r4=208;break}if((r109+r18|0)>=(r19|0)){r117=r116;break}if((r111|0)>19){r118=0;while(1){r119=r2+r118|0;r120=HEAP8[r119];if(r120<<24>>24!=-1){r4=204;break}HEAP8[r119]=0;r121=r118+1|0;if((r121|0)<20){r118=r121}else{break}}if(r4==204){r4=0;HEAP8[r119]=r120+1&255}HEAP32[r64>>2]=1732584193;HEAP32[r65>>2]=-271733879;HEAP32[r66>>2]=-1732584194;HEAP32[r67>>2]=271733878;HEAP32[r68>>2]=-1009589776;HEAP32[r69>>2]=0;HEAP32[r70>>2]=0;HEAP32[r71>>2]=0;_SHA_Bytes(r9,r43,40);_SHA_Final(r9,r44);HEAP32[r42]=0;r122=0}else{r122=r111}HEAP32[r42]=r122+1|0;if((HEAP8[r2+(r122+40)|0]&1)<<24>>24==0){r4=208;break}else{r117=r116;break}}}while(0);if(r4==208){r4=0;r117=r109+r18|0}if((r117|0)<(r19|0)){HEAP32[HEAP32[r90]+(r117<<2)>>2]=r108;r123=r89;break}else{r123=r89+1|0;break}}else{r4=212}}while(0);if(r4==212){r4=0;r123=r89+1|0}r124=r108+1|0;r125=r123}else{r124=r108;r125=r89}r109=r107+1|0;if((r109|0)==(r18|0)){break}else{r89=r125;r107=r109;r108=r124}}r108=r99+1|0;if((r108|0)==(r18|0)){r126=r125;r127=r124;break L252}else{r86=r125;r99=r108;r98=r124}}}else{r126=0;r127=0}}while(0);r98=(r82+32|0)>>2;HEAP32[r98]=r127;_make_blocks_from_whichblock(r82);r99=HEAP32[r98];L295:do{if((r99|0)>0){r86=HEAP32[r82+24>>2];r90=0;r84=0;while(1){r108=((HEAP32[r86+(r84<<2)>>2]|0)==1&1)+r90|0;r107=r84+1|0;if((r107|0)==(r99|0)){r128=r108;break L295}else{r90=r108;r84=r107}}}else{r128=0}}while(0);if((r128|0)!=(r126|0)){r4=220;break L197}if((r126|0)<1|r83^1){r105=r82,r106=r105>>2;break}r84=(r82+24|0)>>2;r90=(r82+20|0)>>2;r86=(r82+16|0)>>2;r107=r126;r108=0;r89=r99;L302:while(1){r93=r108;while(1){if((r93|0)>=(r89|0)){break L302}if((HEAP32[HEAP32[r84]+(r93<<2)>>2]|0)>1){r93=r93+1|0}else{break}}r109=HEAP32[HEAP32[HEAP32[r90]+(r93<<2)>>2]>>2];r116=(r109|0)/(r18|0)&-1;r111=r109+1|0;do{if((r111|0)==(r19|0)){r129=r109-1|0}else{if(((r109|0)%(r18|0)+1|0)<(r18|0)){if((r116+1|0)==(r18|0)){r129=r111;break}r114=HEAP32[r42];if((r114|0)>19){r110=0;while(1){r130=r2+r110|0;r131=HEAP8[r130];if(r131<<24>>24!=-1){r4=232;break}HEAP8[r130]=0;r118=r110+1|0;if((r118|0)<20){r110=r118}else{break}}if(r4==232){r4=0;HEAP8[r130]=r131+1&255}HEAP32[r72>>2]=1732584193;HEAP32[r73>>2]=-271733879;HEAP32[r74>>2]=-1732584194;HEAP32[r75>>2]=271733878;HEAP32[r76>>2]=-1009589776;HEAP32[r77>>2]=0;HEAP32[r78>>2]=0;HEAP32[r79>>2]=0;_SHA_Bytes(r8,r43,40);_SHA_Final(r8,r44);HEAP32[r42]=0;r132=0}else{r132=r114}HEAP32[r42]=r132+1|0;if((HEAP8[r2+(r132+40)|0]&1)<<24>>24==0){r129=r111;break}}r129=r109+r18|0}}while(0);r109=HEAP32[r86];r111=HEAP32[r109+(r129<<2)>>2];r116=HEAP32[r84];r110=(((HEAP32[r116+(r111<<2)>>2]|0)==1)<<31>>31)+(r107-1)|0;r118=(r111|0)<(r93|0);r121=r118?r93:r111;r133=r118?r111:r93;r118=HEAP32[r116+(r121<<2)>>2];r134=HEAP32[r90];L324:do{if((r118|0)>0){HEAP32[r109+(HEAP32[HEAP32[r134+(r121<<2)>>2]>>2]<<2)>>2]=r133;r135=HEAP32[r84];r136=HEAP32[r135+(r121<<2)>>2];r137=HEAP32[r90];if((r136|0)>1){r138=1;r139=r137}else{r140=r135;r141=r136;r142=r137;break}while(1){HEAP32[HEAP32[r86]+(HEAP32[HEAP32[r139+(r121<<2)>>2]+(r138<<2)>>2]<<2)>>2]=r133;r137=r138+1|0;r136=HEAP32[r84];r135=HEAP32[r136+(r121<<2)>>2];r143=HEAP32[r90];if((r137|0)<(r135|0)){r138=r137;r139=r143}else{r140=r136;r141=r135;r142=r143;break L324}}}else{r140=r116;r141=r118;r142=r134}}while(0);_memcpy((HEAP32[r140+(r133<<2)>>2]<<2)+HEAP32[r142+(r133<<2)>>2]|0,HEAP32[r142+(r121<<2)>>2],r141<<2);r134=HEAP32[r84];r118=(r133<<2)+r134|0;HEAP32[r118>>2]=HEAP32[r118>>2]+HEAP32[r134+(r121<<2)>>2]|0;r134=HEAP32[r98]-1|0;if((r121|0)!=(r134|0)){r118=HEAP32[r90];_memcpy(HEAP32[r118+(r121<<2)>>2],HEAP32[r118+(r134<<2)>>2],HEAP32[HEAP32[r84]+(r134<<2)>>2]<<2);r118=HEAP32[r84];r116=HEAP32[r118+(r134<<2)>>2];L331:do{if((r116|0)>0){r109=0;while(1){HEAP32[HEAP32[r86]+(HEAP32[HEAP32[HEAP32[r90]+(r134<<2)>>2]+(r109<<2)>>2]<<2)>>2]=r121;r114=r109+1|0;r143=HEAP32[r84];r135=HEAP32[r143+(r134<<2)>>2];if((r114|0)<(r135|0)){r109=r114}else{r144=r143;r145=r135;break L331}}}else{r144=r118;r145=r116}}while(0);HEAP32[r144+(r121<<2)>>2]=r145}HEAP32[r98]=r134;r107=r110;r108=((r93|0)<(r111|0)&1)+r93|0;r89=r134}if((r107|0)==0){r105=r82,r106=r105>>2}else{r4=246;break L197}}}while(0);r89=HEAP32[r36];HEAP32[r7>>2]=r37;_memset(r23,0,r19);r108=_malloc(48),r98=r108>>2;if((r108|0)==0){r4=248;break}r84=r108;HEAP32[r98]=r18;HEAP32[r98+1]=r27;HEAP32[r98+3]=r23;r90=_malloc(r38);if((r90|0)==0){r4=250;break}r86=(r108+16|0)>>2;HEAP32[r86]=r90;r90=_malloc(r38);if((r90|0)==0){r4=252;break}r99=(r108+20|0)>>2;HEAP32[r99]=r90;r90=_malloc(r38);if((r90|0)==0){r4=254;break}r83=(r108+24|0)>>2;HEAP32[r83]=r90;r146=(r105|0)==0;if(r146){HEAP32[r98+7]=0}else{HEAP32[r98+2]=r105;r90=r105+32|0;r116=_malloc(HEAP32[r90>>2]<<2);if((r116|0)==0){r4=257;break}HEAP32[r98+7]=r116;_memset(r116,0,HEAP32[r90>>2]<<2)}_memset(HEAP32[r86],0,r38);_memset(HEAP32[r99],0,r38);_memset(HEAP32[r83],0,r38);if((r89|0)==0){HEAP32[r98+8]=0}else{r89=_malloc(8);if((r89|0)==0){r4=262;break}HEAP32[r98+8]=r89;r90=r89;HEAP32[r90>>2]=0;HEAP32[r90+4>>2]=0}L352:do{if(r39){r90=0;while(1){r89=r90+1|0;HEAP8[r23+r90|0]=r89&255;if((r89|0)==(r18|0)){break}else{r90=r89}}_shuffle(r23,r18,1,r2);r90=0;while(1){_gridgen_place(r84,r90,0,HEAP8[r23+r90|0]);r82=r90+1|0;if((r82|0)==(r18|0)){break L352}else{r90=r82}}}else{_shuffle(r23,r18,1,r2)}}while(0);r90=_malloc(r40);if((r90|0)==0){r4=271;break}r82=(r108+36|0)>>2;HEAP32[r82]=r90;r90=(r108+40|0)>>2;HEAP32[r90]=0;HEAP32[r98+11]=r2;L361:do{if(r41){r107=1;r89=0;while(1){L364:do{if(r39){r116=0;r118=r89;while(1){HEAP32[HEAP32[r82]+(r118*12&-1)>>2]=r116;HEAP32[HEAP32[r82]+(HEAP32[r90]*12&-1)+4>>2]=r107;r133=0;r109=0;r135=HEAP32[r42];while(1){if((r135|0)>19){r143=0;while(1){r147=r2+r143|0;r148=HEAP8[r147];if(r148<<24>>24!=-1){r4=277;break}HEAP8[r147]=0;r114=r143+1|0;if((r114|0)<20){r143=r114}else{break}}if(r4==277){r4=0;HEAP8[r147]=r148+1&255}HEAP32[r45>>2]=1732584193;HEAP32[r46>>2]=-271733879;HEAP32[r47>>2]=-1732584194;HEAP32[r48>>2]=271733878;HEAP32[r49>>2]=-1009589776;HEAP32[r50>>2]=0;HEAP32[r51>>2]=0;HEAP32[r52>>2]=0;_SHA_Bytes(r6,r43,40);_SHA_Final(r6,r44);HEAP32[r42]=0;r149=0}else{r149=r135}r143=r149+1|0;HEAP32[r42]=r143;r150=HEAPU8[r2+(r149+40)|0]|r133<<8;r114=r109+8|0;if((r114|0)<31){r133=r150;r109=r114;r135=r143}else{break}}HEAP32[HEAP32[r82]+(HEAP32[r90]*12&-1)+8>>2]=r150&2147483647;r135=HEAP32[r90]+1|0;HEAP32[r90]=r135;r109=r116+1|0;if((r109|0)==(r18|0)){r151=r135;break L364}else{r116=r109;r118=r135}}}else{r151=r89}}while(0);r134=r107+1|0;if((r134|0)==(r18|0)){break L361}else{r107=r134;r89=r151}}}}while(0);r90=_gridgen_real(r84,r7);r89=HEAP32[r82];if((r89|0)!=0){_free(r89)}r89=HEAP32[r98+7];if((r89|0)!=0){_free(r89)}r89=HEAP32[r83];if((r89|0)!=0){_free(r89)}r89=HEAP32[r99];if((r89|0)!=0){_free(r89)}r89=HEAP32[r86];if((r89|0)!=0){_free(r89)}_free(r108);if((r90|0)==0){r80=r105,r81=r80>>2;continue}if((_check_valid(r18,r27,r105,HEAP32[r36],r23)|0)==0){r4=295;break}r90=HEAP32[r3>>2];if((r90|0)!=0){_free(r90)}r90=_encode_solve_move(r18,r23);HEAP32[r3>>2]=r90;if((HEAP32[r29]|0)==0){L402:do{if(r39){r90=0;r89=0;while(1){r107=Math.imul(r90,r18);r134=0;r93=r89;while(1){r111=r134+r107|0;r110=_symmetries(HEAP32[r14],HEAP32[r16],r134,r90,r56,HEAP32[r11>>2]);r121=0;while(1){if((r121|0)>=(r110|0)){break}r118=r121<<1;if((Math.imul(HEAP32[((r118|1)<<2>>2)+r12],r18)+HEAP32[(r118<<2>>2)+r12]|0)<(r111|0)){break}else{r121=r121+1|0}}if((r121|0)==(r110|0)){HEAP32[(r93<<3>>2)+r25]=r134;HEAP32[((r93<<3)+4>>2)+r25]=r90;r152=r93+1|0}else{r152=r93}r111=r134+1|0;if((r111|0)==(r18|0)){break}else{r134=r111;r93=r152}}r93=r90+1|0;if((r93|0)==(r18|0)){break}else{r90=r93;r89=r152}}_shuffle(r24,r152,8,r2);if((r152|0)>0){r153=0}else{break}while(1){r89=HEAP32[(r153<<3>>2)+r25];r90=HEAP32[((r153<<3)+4>>2)+r25];_memcpy(r26,r23,r19);r93=_symmetries(HEAP32[r14],HEAP32[r16],r89,r90,r56,HEAP32[r11>>2]);r90=(r93|0)>0;L419:do{if(r90){r89=0;while(1){r134=r89<<1;r107=Math.imul(HEAP32[((r134|1)<<2>>2)+r12],r18);HEAP8[r26+r107+HEAP32[(r134<<2>>2)+r12]|0]=0;r134=r89+1|0;if((r134|0)==(r93|0)){break L419}else{r89=r134}}}}while(0);_solver(r18,r27,r105,HEAP32[r36],r26,r30,r13);L423:do{if((HEAP32[r54]|0)<=(HEAP32[r20]|0)){do{if((HEAP32[r29]|0)==0){if(r90){r154=0;break}else{break L423}}else{if((HEAP32[r55]|0)>(HEAP32[r22]|0)|r90^1){break L423}else{r154=0;break}}}while(0);while(1){r89=r154<<1;r110=Math.imul(HEAP32[((r89|1)<<2>>2)+r12],r18);HEAP8[r23+r110+HEAP32[(r89<<2>>2)+r12]|0]=0;r89=r154+1|0;if((r89|0)==(r93|0)){break L423}else{r154=r89}}}}while(0);r93=r153+1|0;if((r93|0)==(r152|0)){break L402}else{r153=r93}}}else{_shuffle(r24,0,8,r2)}}while(0);_memcpy(r26,r23,r19);_solver(r18,r27,r105,HEAP32[r36],r26,r30,r13);if((HEAP32[r54]|0)!=(HEAP32[r20]|0)){r80=r105,r81=r80>>2;continue}if((HEAP32[r29]|0)==0){r155=r105,r156=r155>>2;break}if((HEAP32[r55]|0)==(HEAP32[r22]|0)){r155=r105,r156=r155>>2;break}else{r80=r105,r81=r80>>2;continue}}_memcpy(r26,r23,r19);_memset(r30,0,r19);r157=(r105+32|0)>>2;L435:do{if((HEAP32[r157]|0)>0){r108=r105+16|0;r86=0;while(1){L439:do{if(r53){r158=0}else{r99=HEAP32[r108>>2];r83=0;r98=0;while(1){if((HEAP32[r99+(r83<<2)>>2]|0)==(r86|0)){r159=HEAPU8[r26+r83|0]+r98|0}else{r159=r98}r82=r83+1|0;if((r82|0)==(r19|0)){r158=r159;break L439}else{r83=r82;r98=r159}}}}while(0);r98=0;while(1){if((r98|0)>=(r19|0)){break}if((HEAP32[HEAP32[r108>>2]+(r98<<2)>>2]|0)==(r86|0)){break}else{r98=r98+1|0}}if((r98|0)==(r19|0)){r4=312;break L197}HEAP8[r30+r98|0]=r158&255;r83=r86+1|0;if((r83|0)<(HEAP32[r157]|0)){r86=r83}else{break L435}}}}while(0);_memset(r23,0,r19);_solver(r18,r27,r105,HEAP32[r36],r23,r30,r13);r86=HEAP32[r54];r108=HEAP32[r20];do{if((r86|0)==(r108|0)){if((HEAP32[r55]|0)!=(HEAP32[r22]|0)){break}r83=r105+12|0;r99=r105+36|0;r160=_alloc_block_structure(HEAP32[r106+1],HEAP32[r106+2],HEAP32[r83>>2],HEAP32[r99>>2],HEAP32[r157]);r161=r105+24|0;_memcpy(HEAP32[r160+24>>2],HEAP32[r161>>2],HEAP32[r157]<<2);r162=(r160+16|0)>>2;r163=r105+16|0;_memcpy(HEAP32[r162],HEAP32[r163>>2],HEAP32[r83>>2]<<2);r164=r160+28|0;r165=r105+28|0;_memcpy(HEAP32[r164>>2],HEAP32[r165>>2],Math.imul(HEAP32[r157]<<2,HEAP32[r99>>2]));if((HEAP32[r157]|0)>0){r4=317;break L197}_merge_some_cages(r105,r18);if((r160|0)==0){r80=r105,r81=r80>>2;continue L197}else{r4=339;break L197}}}while(0);if((r86|0)>(r108|0)){r80=r105,r81=r80>>2;continue}if((HEAP32[r55]|0)>(HEAP32[r22]|0)){r80=r105,r81=r80>>2;continue}r99=r105+12|0;r83=r105+36|0;r82=_alloc_block_structure(HEAP32[r106+1],HEAP32[r106+2],HEAP32[r99>>2],HEAP32[r83>>2],HEAP32[r157]);r84=r82+24|0;_memcpy(HEAP32[r84>>2],HEAP32[r106+6],HEAP32[r157]<<2);r93=r82+16|0;_memcpy(HEAP32[r93>>2],HEAP32[r106+4],HEAP32[r99>>2]<<2);r99=(r82+28|0)>>2;_memcpy(HEAP32[r99],HEAP32[r106+7],Math.imul(HEAP32[r157]<<2,HEAP32[r83>>2]));if((HEAP32[r157]|0)>0){r83=r82+36|0;r90=r82+20|0;r89=0;while(1){r110=HEAP32[r99]+(Math.imul(HEAP32[r83>>2],r89)<<2)|0;HEAP32[HEAP32[r90>>2]+(r89<<2)>>2]=r110;r110=r89+1|0;if((r110|0)<(HEAP32[r157]|0)){r89=r110}else{break}}_merge_some_cages(r105,r18)}else{_merge_some_cages(r105,r18);if((r82|0)==0){r80=r105,r81=r80>>2;continue}}r89=r82|0;r90=HEAP32[r89>>2]-1|0;HEAP32[r89>>2]=r90;if((r90|0)!=0){r80=r105,r81=r80>>2;continue}r90=HEAP32[r93>>2];if((r90|0)!=0){_free(r90)}r90=HEAP32[r82+20>>2];if((r90|0)!=0){_free(r90)}r90=HEAP32[r99];if((r90|0)!=0){_free(r90)}r90=HEAP32[r84>>2];if((r90|0)!=0){_free(r90)}if((r82|0)==0){r80=r105,r81=r80>>2;continue}_free(r82);r80=r105,r81=r80>>2}do{if(r4==220){___assert_func(38316,3523,40432,36932)}else if(r4==246){___assert_func(38316,3551,40432,36912)}else if(r4==248){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==250){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==162){___assert_func(39084,137,40572,38864)}else if(r4==167){___assert_func(38316,3180,40588,38164)}else if(r4==252){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==254){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==257){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==262){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==271){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==295){___assert_func(38316,3626,40240,37016)}else if(r4==312){___assert_func(38316,3478,40632,36952)}else if(r4==317){r80=r160+36|0;r81=r160+20|0;r22=0;while(1){r55=HEAP32[r164>>2]+(Math.imul(HEAP32[r80>>2],r22)<<2)|0;HEAP32[HEAP32[r81>>2]+(r22<<2)>>2]=r55;r55=r22+1|0;if((r55|0)<(HEAP32[r157]|0)){r22=r55}else{break}}_merge_some_cages(r105,r18);r4=339;break}}while(0);if(r4==339){r18=r105|0;r157=HEAP32[r18>>2]-1|0;HEAP32[r18>>2]=r157;do{if((r157|0)==0){r18=HEAP32[r163>>2];if((r18|0)!=0){_free(r18)}r18=HEAP32[r106+5];if((r18|0)!=0){_free(r18)}r18=HEAP32[r165>>2];if((r18|0)!=0){_free(r18)}r18=HEAP32[r161>>2];if((r18|0)!=0){_free(r18)}if(r146){break}_free(r105)}}while(0);_memset(r30,0,r19);r105=r160+32|0;L517:do{if((HEAP32[r105>>2]|0)>0){r146=0;while(1){L520:do{if(r53){r166=0}else{r161=HEAP32[r162];r165=0;r106=0;while(1){if((HEAP32[r161+(r165<<2)>>2]|0)==(r146|0)){r167=HEAPU8[r26+r165|0]+r106|0}else{r167=r106}r163=r165+1|0;if((r163|0)==(r19|0)){r166=r167;break L520}else{r165=r163;r106=r167}}}}while(0);r106=0;while(1){if((r106|0)>=(r19|0)){break}if((HEAP32[HEAP32[r162]+(r106<<2)>>2]|0)==(r146|0)){break}else{r106=r106+1|0}}if((r106|0)==(r19|0)){break}HEAP8[r30+r106|0]=r166&255;r165=r146+1|0;if((r165|0)<(HEAP32[r105>>2]|0)){r146=r165}else{break L517}}___assert_func(38316,3478,40632,36952)}}while(0);_memset(r23,0,r19);r155=r160,r156=r155>>2}_free(r26);_free(r24);r24=HEAP32[r16];r16=Math.imul(r24,HEAP32[r14]);r14=Math.imul(r16,r16);r16=r14>>>0>26;if(r16){r168=Math.floor(((r14-27|0)>>>0)/26)+2|0}else{r168=1}r26=Math.imul(r168,r14);r168=(r24|0)==1;if(r168){r24=Math.imul(HEAP32[r33>>2],HEAP32[r32>>2]);r32=Math.imul(r24,r24);if(r32>>>0>26){r169=Math.floor(((r32-27|0)>>>0)/26)+2|0}else{r169=1}r170=r26+Math.imul(r169,r32)+2|0}else{r170=r26+1|0}if((HEAP32[r29]|0)==0){r171=r170}else{r26=Math.imul(HEAP32[r156+2],HEAP32[r156+1]);r32=Math.imul(r26,r26);if(r32>>>0>26){r172=Math.floor(((r32-27|0)>>>0)/26)+2|0}else{r172=1}r26=Math.imul(r172,r32);if(r16){r173=Math.floor(((r14-27|0)>>>0)/26)+2|0}else{r173=1}r171=r170+r26+Math.imul(r173,r14)+2|0}r173=_malloc(r171);if((r173|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r26=r14+1|0;r170=0;r16=r173;r32=0;while(1){do{if((r170|0)<(r14|0)){r172=HEAP8[r23+r170|0];if(r172<<24>>24!=0){r174=r172&255;r4=402;break}r175=r32+1|0;r176=r16;break}else{r174=-1;r4=402}}while(0);do{if(r4==402){r4=0;L565:do{if((r32|0)==0){if(!(r16>>>0>r173>>>0&(r174|0)>0)){r177=r16;break}HEAP8[r16]=95;r177=r16+1|0}else{if((r32|0)>0){r178=r16;r179=r32}else{r177=r16;break}while(1){r172=r179+96|0;r169=(r179|0)>26?122:r172;r24=r178+1|0;HEAP8[r178]=r169&255;r33=r172-r169|0;if((r33|0)>0){r178=r24;r179=r33}else{r177=r24;break L565}}}}while(0);if((r174|0)<=0){r175=0;r176=r177;break}r175=0;r176=r177+_sprintf(r177,38692,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r174,tempInt))|0}}while(0);r106=r170+1|0;if((r106|0)==(r26|0)){break}else{r170=r106;r16=r176;r32=r175}}if(r168){HEAP8[r176]=44;r180=_encode_block_structure_desc(r176+1|0,r27)}else{r180=r176}L578:do{if((HEAP32[r29]|0)==0){r181=r180}else{HEAP8[r180]=44;r176=_encode_block_structure_desc(r180+1|0,r155);r168=r176+1|0;HEAP8[r176]=44;r176=0;r175=r168;r32=0;while(1){do{if((r176|0)<(r14|0)){r16=HEAP8[r30+r176|0];if(r16<<24>>24!=0){r182=r16&255;r4=417;break}r183=r32+1|0;r184=r175;break}else{r182=-1;r4=417}}while(0);do{if(r4==417){r4=0;L587:do{if((r32|0)==0){if(!(r175>>>0>r168>>>0&(r182|0)>0)){r185=r175;break}HEAP8[r175]=95;r185=r175+1|0}else{if((r32|0)>0){r186=r175;r187=r32}else{r185=r175;break}while(1){r16=r187+96|0;r170=(r187|0)>26?122:r16;r174=r186+1|0;HEAP8[r186]=r170&255;r177=r16-r170|0;if((r177|0)>0){r186=r174;r187=r177}else{r185=r174;break L587}}}}while(0);if((r182|0)<=0){r183=0;r184=r185;break}r183=0;r184=r185+_sprintf(r185,38692,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r182,tempInt))|0}}while(0);r174=r176+1|0;if((r174|0)==(r26|0)){r181=r184;break L578}else{r176=r174;r175=r184;r32=r183}}}}while(0);r183=r173;if((r181-r183|0)>=(r171|0)){___assert_func(38316,3343,40540,36996)}HEAP8[r181]=0;r171=_realloc(r173,r181+1-r183|0);if((r171|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_free(r23);r23=r27|0;r183=HEAP32[r23>>2]-1|0;HEAP32[r23>>2]=r183;do{if((r183|0)==0){r23=HEAP32[r35];if((r23|0)!=0){_free(r23)}r23=HEAP32[r28+5];if((r23|0)!=0){_free(r23)}r23=HEAP32[r28+7];if((r23|0)!=0){_free(r23)}r23=HEAP32[r28+6];if((r23|0)!=0){_free(r23)}if((r27|0)==0){break}_free(r27)}}while(0);if((HEAP32[r29]|0)==0){STACKTOP=r5;return r171}r29=r155|0;r27=HEAP32[r29>>2]-1|0;HEAP32[r29>>2]=r27;do{if((r27|0)==0){r29=HEAP32[r156+4];if((r29|0)!=0){_free(r29)}r29=HEAP32[r156+5];if((r29|0)!=0){_free(r29)}r29=HEAP32[r156+7];if((r29|0)!=0){_free(r29)}r29=HEAP32[r156+6];if((r29|0)!=0){_free(r29)}if((r155|0)==0){break}_free(r155)}}while(0);if((r30|0)==0){STACKTOP=r5;return r171}_free(r30);STACKTOP=r5;return r171}function _validate_desc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+4|0;r5=r4,r6=r5>>2;HEAP32[r6]=r2;r7=HEAP32[r1+4>>2];r8=Math.imul(r7,HEAP32[r1>>2]);r9=Math.imul(r8,r8);r10=r2;r2=0;L643:while(1){r11=r10;while(1){r12=HEAP8[r11];if(r12<<24>>24==0|r12<<24>>24==44){r3=468;break L643}r13=r11+1|0;if((r12-97&255)<26){r3=463;break}if(r12<<24>>24==95){r11=r13}else{break}}if(r3==463){r3=0;r10=r13;r2=(r12<<24>>24)+(r2-96)|0;continue}if((r12-49&255)>=9){r14=38124;break}r15=_atoi(r11);if((r15|0)<1|(r15|0)>(r8|0)){r14=37232;break}else{r16=r13}while(1){if((HEAP8[r16]-48&255)<10){r16=r16+1|0}else{break}}r10=r16;r2=r2+1|0}L656:do{if(r3==468){if((r2|0)<(r9|0)){r14=37200;break}if((r2|0)>(r9|0)){r14=37168;break}HEAP32[r6]=r11;if((r7|0)==1){if(HEAP8[r11]<<24>>24!=44){r14=37772;break}HEAP32[r6]=r11+1|0;r16=_validate_block_desc(r5,r8,r9,r8,r8,r8,r8);if((r16|0)!=0){r14=r16;break}}r16=HEAP32[r6];if((HEAP32[r1+24>>2]|0)==0){r17=r16}else{if(HEAP8[r16]<<24>>24!=44){r14=37720;break}HEAP32[r6]=r16+1|0;r16=_validate_block_desc(r5,r8,r9,r8,r9,2,r8);if((r16|0)!=0){r14=r16;break}r16=HEAP32[r6];if(HEAP8[r16]<<24>>24!=44){r14=37672;break}r10=r16+1|0;HEAP32[r6]=r10;r16=Math.imul(r9,r8);r13=r10;r10=0;L669:while(1){r18=r13;while(1){r19=HEAP8[r18];if(r19<<24>>24==0|r19<<24>>24==44){break L669}r20=r18+1|0;if((r19-97&255)<26){r3=482;break}if(r19<<24>>24==95){r18=r20}else{break}}if(r3==482){r3=0;r13=r20;r10=(r19<<24>>24)+(r10-96)|0;continue}if((r19-49&255)>=9){r14=38124;break L656}r12=_atoi(r18);if((r12|0)<1|(r12|0)>(r16|0)){r14=37232;break L656}else{r21=r20}while(1){if((HEAP8[r21]-48&255)<10){r21=r21+1|0}else{break}}r13=r21;r10=r10+1|0}if((r10|0)<(r9|0)){r14=37200;break}if((r10|0)>(r9|0)){r14=37168;break}HEAP32[r6]=r18;r17=r18}r14=HEAP8[r17]<<24>>24==0?0:37552}}while(0);STACKTOP=r4;return r14}function _new_game(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55;r1=STACKTOP;STACKTOP=STACKTOP+12|0;r4=r1,r5=r4>>2;r6=r1+4;r7=r1+8;HEAP32[r5]=r3;r8=_malloc(44),r9=r8>>2;if((r8|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=r8;r11=HEAP32[r2>>2];r12=HEAP32[r2+4>>2];r13=Math.imul(r12,r11);r14=Math.imul(r13,r13);_precompute_sum_bits();HEAP32[r9]=r13;HEAP32[r9+3]=HEAP32[r2+20>>2];r15=(r2+24|0)>>2;HEAP32[r9+4]=HEAP32[r15];r2=_malloc(r14);if((r2|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r16=(r8+20|0)>>2;HEAP32[r16]=r2;r2=Math.imul(r14,r13);r17=_malloc(r2);if((r17|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r9+7]=r17;_memset(r17,0,r2);r2=_malloc(r14);if((r2|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r17=r8+32|0;HEAP32[r17>>2]=r2;_memset(r2,0,r14);r2=_alloc_block_structure(r11,r12,r14,r13,r13);r18=(r8+4|0)>>2;HEAP32[r18]=r2;do{if((HEAP32[r15]|0)==0){HEAP32[r9+2]=0;HEAP32[r9+6]=0}else{r2=_alloc_block_structure(r11,r12,r14,r13,r14);HEAP32[r9+2]=r2;r2=_malloc(r14);if((r2|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r9+6]=r2;break}}}while(0);HEAP32[r9+10]=0;HEAP32[r9+9]=0;r2=_spec_to_grid(r3,HEAP32[r16],r14);HEAP32[r5]=r2;L707:do{if((r14|0)!=0){r3=0;while(1){if(HEAP8[HEAP32[r16]+r3|0]<<24>>24!=0){HEAP8[HEAP32[r17>>2]+r3|0]=1}r19=r3+1|0;if((r19|0)<(r14|0)){r3=r19}else{break L707}}}}while(0);L714:do{if((r12|0)==1){if(HEAP8[r2]<<24>>24!=44){___assert_func(38316,4078,40256,38300)}HEAP32[r5]=r2+1|0;if((_spec_to_dsf(r4,r6,r13,r14)|0)!=0){___assert_func(38316,4081,40256,38288)}r17=HEAP32[r6>>2];r16=HEAP32[r18],r3=r16>>2;r19=Math.imul(HEAP32[r3+2],HEAP32[r3+1]);r20=Math.imul(r19,r19);L728:do{if((r20|0)==0){r21=0}else{r19=(r16+16|0)>>2;r22=0;while(1){HEAP32[HEAP32[r19]+(r22<<2)>>2]=-1;r23=r22+1|0;if((r23|0)<(r20|0)){r22=r23}else{r24=0;r25=0;break}}while(1){r22=(r25<<2)+r17|0;r23=HEAP32[r22>>2];if((r23&2|0)==0){r26=0;r27=r23;while(1){r28=r27&1^r26;r29=r27>>2;r30=HEAP32[r17+(r29<<2)>>2];if((r30&2|0)==0){r26=r28;r27=r30}else{break}}L738:do{if((r29|0)==(r25|0)){r31=r28;r32=r25}else{r27=r29<<2;r26=r23>>2;r30=r28^r23&1;HEAP32[r22>>2]=r28|r27;if((r26|0)==(r29|0)){r31=r30;r32=r29;break}else{r33=r26;r34=r30}while(1){r30=(r33<<2)+r17|0;r26=HEAP32[r30>>2];r35=r26>>2;r36=r34^r26&1;HEAP32[r30>>2]=r34|r27;if((r35|0)==(r29|0)){r31=r36;r32=r29;break L738}else{r33=r35;r34=r36}}}}while(0);if((r31|0)==0){r37=r32}else{break}}else{r37=r25}r22=HEAP32[r19];r23=(r37<<2)+r22|0;r27=HEAP32[r23>>2];if((r27|0)<0){HEAP32[r23>>2]=r24;r23=HEAP32[r19];r38=r24+1|0;r39=r23;r40=HEAP32[r23+(r37<<2)>>2]}else{r38=r24;r39=r22;r40=r27}HEAP32[r39+(r25<<2)>>2]=r40;r27=r25+1|0;if((r27|0)<(r20|0)){r24=r38;r25=r27}else{r21=r38;break L728}}___assert_func(39084,137,40572,38864)}}while(0);if((r21|0)!=(r13|0)){___assert_func(38316,3180,40588,38164)}HEAP32[r3+8]=r13;if((r17|0)==0){break}_free(r17)}else{if((r13|0)>0){r41=0}else{break}while(1){r20=r41-(r41|0)%(r11|0)|0;r16=Math.imul(r41,r13);r19=0;while(1){HEAP32[HEAP32[HEAP32[r18]+16>>2]+(r19+r16<<2)>>2]=r20+((r19|0)/(r12|0)&-1)|0;r27=r19+1|0;if((r27|0)==(r13|0)){break}else{r19=r27}}r19=r41+1|0;if((r19|0)==(r13|0)){break L714}else{r41=r19}}}}while(0);_make_blocks_from_whichblock(HEAP32[r18]);r18=HEAP32[r5];do{if((HEAP32[r15]|0)==0){r42=r18}else{if(HEAP8[r18]<<24>>24!=44){___assert_func(38316,4096,40256,38300)}HEAP32[r5]=r18+1|0;if((_spec_to_dsf(r4,r7,r13,r14)|0)!=0){___assert_func(38316,4099,40256,38288)}r41=HEAP32[r7>>2];r12=r8+8|0;r11=HEAP32[r12>>2],r21=r11>>2;r38=Math.imul(HEAP32[r21+2],HEAP32[r21+1]);r25=Math.imul(r38,r38);L762:do{if((r25|0)==0){r43=0}else{r38=(r11+16|0)>>2;r24=0;while(1){HEAP32[HEAP32[r38]+(r24<<2)>>2]=-1;r40=r24+1|0;if((r40|0)<(r25|0)){r24=r40}else{r44=0;r45=0;break}}while(1){r24=(r45<<2)+r41|0;r40=HEAP32[r24>>2];if((r40&2|0)==0){r39=0;r37=r40;while(1){r46=r37&1^r39;r47=r37>>2;r32=HEAP32[r41+(r47<<2)>>2];if((r32&2|0)==0){r39=r46;r37=r32}else{break}}L772:do{if((r47|0)==(r45|0)){r48=r46;r49=r45}else{r37=r47<<2;r39=r40>>2;r32=r46^r40&1;HEAP32[r24>>2]=r46|r37;if((r39|0)==(r47|0)){r48=r32;r49=r47;break}else{r50=r39;r51=r32}while(1){r32=(r50<<2)+r41|0;r39=HEAP32[r32>>2];r31=r39>>2;r34=r51^r39&1;HEAP32[r32>>2]=r51|r37;if((r31|0)==(r47|0)){r48=r34;r49=r47;break L772}else{r50=r31;r51=r34}}}}while(0);if((r48|0)==0){r52=r49}else{break}}else{r52=r45}r24=HEAP32[r38];r40=(r52<<2)+r24|0;r37=HEAP32[r40>>2];if((r37|0)<0){HEAP32[r40>>2]=r44;r40=HEAP32[r38];r53=r44+1|0;r54=r40;r55=HEAP32[r40+(r52<<2)>>2]}else{r53=r44;r54=r24;r55=r37}HEAP32[r54+(r45<<2)>>2]=r55;r37=r45+1|0;if((r37|0)<(r25|0)){r44=r53;r45=r37}else{r43=r53;break L762}}___assert_func(39084,137,40572,38864)}}while(0);if((r43|0)<(r13|0)|(r43|0)>(r14|0)){___assert_func(38316,3180,40588,38164)}HEAP32[r21+8]=r43;if((r41|0)!=0){_free(r41)}_make_blocks_from_whichblock(HEAP32[r12>>2]);r25=HEAP32[r5];if(HEAP8[r25]<<24>>24==44){r11=_spec_to_grid(r25+1|0,HEAP32[r9+6],r14);HEAP32[r5]=r11;r42=r11;break}else{___assert_func(38316,4104,40256,38300)}}}while(0);if(HEAP8[r42]<<24>>24==0){STACKTOP=r1;return r10}else{___assert_func(38316,4108,40256,38236)}}function _dup_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=r1>>2;r3=STACKTOP;r4=_malloc(44),r5=r4>>2;if((r4|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r6=r4;r4=HEAP32[r2];r7=Math.imul(r4,r4);HEAP32[r5]=r4;HEAP32[r5+3]=HEAP32[r2+3];r8=r1+16|0;HEAP32[r5+4]=HEAP32[r8>>2];r1=HEAP32[r2+1];HEAP32[r5+1]=r1;r9=r1|0;HEAP32[r9>>2]=HEAP32[r9>>2]+1|0;r9=HEAP32[r2+2];HEAP32[r5+2]=r9;if((r9|0)!=0){r1=r9|0;HEAP32[r1>>2]=HEAP32[r1>>2]+1|0}r1=_malloc(r7);if((r1|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r5+5]=r1;_memcpy(r1,HEAP32[r2+5],r7);do{if((HEAP32[r8>>2]|0)==0){HEAP32[r5+6]=0}else{r1=_malloc(r7);if((r1|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r5+6]=r1;_memcpy(r1,HEAP32[r2+6],r7);break}}}while(0);r8=Math.imul(r7,r4);r4=_malloc(r8);if((r4|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r5+7]=r4;_memcpy(r4,HEAP32[r2+7],r8);r8=_malloc(r7);if((r8|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r5+8]=r8;_memcpy(r8,HEAP32[r2+8],r7);HEAP32[r5+9]=HEAP32[r2+9];HEAP32[r5+10]=HEAP32[r2+10];STACKTOP=r3;return r6}}function _encode_ui(r1){return 0}function _decode_ui(r1,r2){return}function _game_can_format_as_text_now(r1){return(HEAP32[r1+24>>2]|0)==0&1}function _game_changed_state(r1,r2,r3){var r4;r2=r1+12|0;if((HEAP32[r2>>2]|0)==0){return}if((HEAP32[r1+8>>2]|0)==0){return}if((HEAP32[r1+16>>2]|0)!=0){return}r4=Math.imul(HEAP32[r1+4>>2],HEAP32[r3>>2]);if(HEAP8[HEAP32[r3+20>>2]+r4+HEAP32[r1>>2]|0]<<24>>24==0){return}HEAP32[r2>>2]=0;return}function _free_game(r1){var r2,r3,r4,r5,r6;r2=r1>>2;r3=HEAP32[r2+1],r4=r3>>2;r5=r3|0;r6=HEAP32[r5>>2]-1|0;HEAP32[r5>>2]=r6;do{if((r6|0)==0){r5=HEAP32[r4+4];if((r5|0)!=0){_free(r5)}r5=HEAP32[r4+5];if((r5|0)!=0){_free(r5)}r5=HEAP32[r4+7];if((r5|0)!=0){_free(r5)}r5=HEAP32[r4+6];if((r5|0)!=0){_free(r5)}if((r3|0)==0){break}_free(r3)}}while(0);r3=HEAP32[r2+2],r4=r3>>2;do{if((r3|0)!=0){r6=r3|0;r5=HEAP32[r6>>2]-1|0;HEAP32[r6>>2]=r5;if((r5|0)!=0){break}r5=HEAP32[r4+4];if((r5|0)!=0){_free(r5)}r5=HEAP32[r4+5];if((r5|0)!=0){_free(r5)}r5=HEAP32[r4+7];if((r5|0)!=0){_free(r5)}r5=HEAP32[r4+6];if((r5|0)!=0){_free(r5)}_free(r3)}}while(0);r3=HEAP32[r2+8];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+7];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+5];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+6];if((r3|0)!=0){_free(r3)}if((r1|0)==0){return}_free(r1);return}function _free_ui(r1){if((r1|0)==0){return}_free(r1);return}function _solve_game(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10;r2=r1>>2;r1=STACKTOP;STACKTOP=STACKTOP+16|0;r5=r1,r6=r5>>2;r7=HEAP32[r2];if((r3|0)!=0){r8=_malloc(_strlen(r3)+1|0);if((r8|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r8,r3);r9=r8;STACKTOP=r1;return r9}r8=Math.imul(r7,r7);r3=_malloc(r8);if((r3|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_memcpy(r3,HEAP32[r2+5],r8);HEAP32[r6]=5;HEAP32[r6+1]=3;_solver(r7,HEAP32[r2+1],HEAP32[r2+2],HEAP32[r2+3],r3,HEAP32[r2+6],r5);HEAP32[r4>>2]=0;r5=HEAP32[r6+2];if((r5|0)==6){r10=38948}else if((r5|0)==7){r10=39024}else{r5=_encode_solve_move(r7,r3);_free(r3);r9=r5;STACKTOP=r1;return r9}HEAP32[r4>>2]=r10;_free(r3);r9=0;STACKTOP=r1;return r9}function _game_text_format(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42;r2=r1>>2;r1=0;r3=STACKTOP;if((HEAP32[r2+2]|0)!=0){___assert_func(38316,4436,40452,39092)}r4=HEAP32[r2];r5=HEAP32[r2+1];r6=HEAP32[r2+3];r7=HEAP32[r2+5];r2=HEAP32[r5+8>>2];if((r2|0)==1){r8=1;r9=1}else{r8=r2;r9=HEAP32[r5+4>>2]}r2=r4-1|0;r10=Math.imul(((r2|0)/(r8|0)&-1)+r4<<1,((r2|0)/(r9|0)&-1)+r4|0);r11=_malloc(r10|1);if((r11|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}L917:do{if((r4|0)>0){r12=(r5+16|0)>>2;r13=(r6|0)==0;r14=r4+1|0;r15=Math.imul(r4,r4)-1|0;r16=r11;r17=0;while(1){r18=Math.imul(r17,r4);r19=r16;r20=0;while(1){r21=r20+r18|0;r22=HEAP8[r7+r21|0];do{if(r22<<24>>24==0){if(!r13){if(((r21|0)%(r14|0)|0)==0){r23=95;break}if(((r21|0)%(r2|0)|0)==0&(r21|0)>0&(r21|0)<(r15|0)){r23=95;break}}r23=46}else{if((r22&255)<10){r23=r22+48&255;break}else{r23=r22+87&255;break}}}while(0);r24=r19+1|0;HEAP8[r19]=r23;r25=r19+2|0;if((r20|0)==(r2|0)){r1=665;break}HEAP8[r24]=32;r22=r20+1|0;if(((r22|0)%(r8|0)|0)==0){r26=HEAP32[r12];HEAP8[r25]=(HEAP32[r26+(r21<<2)>>2]|0)==(HEAP32[r26+(r21+1<<2)>>2]|0)?32:124;HEAP8[r19+3|0]=32;r27=r19+4|0}else{r27=r25}if((r22|0)==(r4|0)){r28=r27;break}else{r19=r27;r20=r22}}if(r1==665){r1=0;HEAP8[r24]=10;r28=r25}r20=r17+1|0;L941:do{if((r17|0)==(r2|0)){r29=r28}else{if(((r20|0)%(r9|0)|0)!=0){r29=r28;break}r19=Math.imul(r20,r4);r22=r28;r26=0;while(1){r30=(r26|0)==(r2|0);r31=r30?1:2;if((r26|0)>0){r32=(((r26|0)%(r8|0)|0)==0&1)+r31|0}else{r32=r31}r31=r26+r18|0;r33=HEAP32[r12];r34=r26+r19|0;r35=-r32|0;r36=(r35|0)>-1?r35:-1;r37=r36+r32|0;r38=r37+(r22+1)|0;_memset(r22,(HEAP32[r33+(r31<<2)>>2]|0)==(HEAP32[r33+(r34<<2)>>2]|0)?32:45,r36+(r32+1)|0);if(r30){break}r30=r26+1|0;if(((r30|0)%(r8|0)|0)==0){r36=HEAP32[r12]>>2;r33=HEAP32[(r31<<2>>2)+r36];r35=HEAP32[(r31+1<<2>>2)+r36];r31=HEAP32[(r34<<2>>2)+r36];r39=HEAP32[(r34+1<<2>>2)+r36];r36=(r33|0)==(r35|0);r34=(r31|0)==(r39|0);do{if(r36&(r35|0)==(r31|0)&r34){r40=32}else{if((r33|0)==(r31|0)&(r35|0)==(r39|0)){r40=124;break}r40=r36&r34?45:43}}while(0);HEAP8[r38]=r40;r41=r37+(r22+2)|0}else{r41=r38}if((r30|0)<(r4|0)){r22=r41;r26=r30}else{r29=r41;break L941}}HEAP8[r38]=10;r29=r37+(r22+2)|0}}while(0);if((r20|0)==(r4|0)){r42=r29;break L917}else{r16=r29;r17=r20}}}else{r42=r11}}while(0);if((r42-r11|0)==(r10|0)){HEAP8[r42]=0;STACKTOP=r3;return r11}else{___assert_func(38316,4416,40412,39064)}}function _new_ui(r1){var r2,r3;r1=STACKTOP;r2=_malloc(20),r3=r2>>2;if((r2|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r3]=0;HEAP32[r3+1]=0;HEAP32[r3+2]=0;HEAP32[r3+3]=0;HEAP32[r3+4]=0;STACKTOP=r1;return r2}}function _interpret_move(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r7=r2>>2;r8=r1>>2;r1=0;r9=STACKTOP;STACKTOP=STACKTOP+80|0;r10=r9;r11=HEAP32[r8];r12=r6&-28673;r6=HEAP32[r3+12>>2];r3=r6+r4|0;if((r6|0)>63){r4=(r6|0)/32&-1;r13=(r3-r4|0)/(r6|0)&-1;r14=r4;r15=r13;r16=r13}else{r13=(r3-1|0)/(r6|0)&-1;r14=1;r15=r13;r16=r13}r13=r16-1|0;r16=(r6+r5-r14|0)/(r6|0)&-1;r6=r16-1|0;do{if((r15|0)>0&(r13|0)<(r11|0)&(r16|0)>0&(r6|0)<(r11|0)){if((r12|0)==514){r14=Math.imul(r6,r11)+r13|0;L976:do{if(HEAP8[HEAP32[r8+5]+r14|0]<<24>>24==0){r5=r2|0;r3=r2+4|0;do{if((r13|0)==(HEAP32[r5>>2]|0)){if((r6|0)!=(HEAP32[r3>>2]|0)){break}r4=r2+12|0;if((HEAP32[r4>>2]|0)==0){break}if((HEAP32[r7+2]|0)==0){break}HEAP32[r4>>2]=0;break L976}}while(0);HEAP32[r7+2]=1;HEAP32[r5>>2]=r13;HEAP32[r3>>2]=r6;HEAP32[r7+3]=1}else{HEAP32[r7+3]=0}}while(0);HEAP32[r7+4]=0;r17=39060;STACKTOP=r9;return r17}else if((r12|0)==512){r14=Math.imul(r6,r11)+r13|0;L988:do{if(HEAP8[HEAP32[r8+8]+r14|0]<<24>>24==0){r4=r2|0;r18=r2+4|0;do{if((r13|0)==(HEAP32[r4>>2]|0)){if((r6|0)!=(HEAP32[r18>>2]|0)){break}r19=r2+12|0;if((HEAP32[r19>>2]|0)==0){break}if((HEAP32[r7+2]|0)!=0){break}HEAP32[r19>>2]=0;break L988}}while(0);HEAP32[r4>>2]=r13;HEAP32[r18>>2]=r6;HEAP32[r7+3]=1;HEAP32[r7+2]=0}else{HEAP32[r7+3]=0}}while(0);HEAP32[r7+4]=0;r17=39060;STACKTOP=r9;return r17}else{break}}}while(0);if((r12-521|0)>>>0<2|(r12|0)==524|(r12|0)==523){r6=r2|0;r13=r2+4|0;do{if((r12|0)==522){r20=1;r21=0;r1=717;break}else if((r12|0)==524){r20=0;r21=1;r1=717;break}else if((r12|0)==523){r20=0;r21=-1;r1=717;break}else if((r12|0)==521){r20=-1;r21=0;r1=717}}while(0);if(r1==717){r1=HEAP32[r6>>2]+r21|0;r21=(r1|0)>0?r1:0;r1=r11-1|0;HEAP32[r6>>2]=(r21|0)<(r1|0)?r21:r1;r21=HEAP32[r13>>2]+r20|0;r20=(r21|0)>0?r21:0;HEAP32[r13>>2]=(r20|0)<(r1|0)?r20:r1}HEAP32[r7+4]=1;HEAP32[r7+3]=1;r17=39060;STACKTOP=r9;return r17}r1=r2+12|0;r20=HEAP32[r1>>2];if((r20|0)!=0&(r12|0)==525){r13=r2+8|0;HEAP32[r13>>2]=1-HEAP32[r13>>2]|0;HEAP32[r7+4]=1;r17=39060;STACKTOP=r9;return r17}if((r20|0)==0){r17=0;STACKTOP=r9;return r17}r20=r12-48|0;r13=r12-97|0;do{if(r20>>>0>9|(r20|0)>(r11|0)){r2=r12-87|0;if(!(r13>>>0>25|(r2|0)>(r11|0))){r22=r2;break}if(!((r12-65|0)>>>0>25|(r12-55|0)>(r11|0))){r22=r2;break}if((r12|0)==526|(r12|0)==8){r22=r2;break}else{r17=0}STACKTOP=r9;return r17}else{r22=r12-87|0}}while(0);if((r12|0)==526|(r12|0)==8){r23=0}else{r23=r13>>>0<26?r22:(r12-65|0)>>>0<26?r12-55|0:r20}r20=HEAP32[r7+1];r12=Math.imul(r20,r11);r11=HEAP32[r7];r22=r12+r11|0;if(HEAP8[HEAP32[r8+8]+r22|0]<<24>>24!=0){r17=0;STACKTOP=r9;return r17}do{if((HEAP32[r7+2]|0)==0){r24=82;r25=r10|0}else{if(HEAP8[HEAP32[r8+5]+r22|0]<<24>>24==0){r24=(r23|0)>0?80:82;r25=r10|0;break}else{r17=0;STACKTOP=r9;return r17}}}while(0);_sprintf(r25,39136,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r24,HEAP32[tempInt+4>>2]=r11,HEAP32[tempInt+8>>2]=r20,HEAP32[tempInt+12>>2]=r23,tempInt));if((HEAP32[r7+4]|0)==0){HEAP32[r1>>2]=0}r1=_malloc(_strlen(r25)+1|0);if((r1|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r1,r25);r17=r1;STACKTOP=r9;return r17}function _game_compute_size(r1,r2,r3,r4){var r5,r6,r7,r8;r5=r1|0;r6=r1+4|0;r1=HEAP32[r6>>2];r7=(r2|0)>63?((r2|0)/32&-1)<<1:2;r8=Math.imul(Math.imul(HEAP32[r5>>2],r2),r1)+r7+1|0;HEAP32[r3>>2]=r8;r8=HEAP32[r6>>2];r6=(r7|1)+Math.imul(Math.imul(HEAP32[r5>>2],r2),r8)|0;HEAP32[r4>>2]=r6;return}function _game_set_size(r1,r2,r3,r4){HEAP32[r2+12>>2]=r4;return}function _execute_move(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+12|0;r5=r4,r6=r5>>2;r7=r4+4,r8=r7>>2;r9=r4+8,r10=r9>>2;r11=HEAP32[r1>>2];r12=HEAP8[r2];if(r12<<24>>24==83){r13=_dup_game(r1);HEAP32[r13+40>>2]=1;HEAP32[r13+36>>2]=1;HEAP32[r10]=0;r14=Math.imul(r11,r11);if((r14|0)==0){r15=r13;STACKTOP=r4;return r15}r16=r13+20|0;r17=0;r18=r2+1|0;while(1){r19=_atoi(r18)&255;HEAP8[HEAP32[r16>>2]+r17|0]=r19;r19=HEAP8[r18];if(r19<<24>>24==0){break}r20=HEAP32[r10];r21=HEAP8[HEAP32[r16>>2]+r20|0];if(r21<<24>>24==0|(r21&255|0)>(r11|0)){break}else{r22=r18;r23=r19}while(1){if(r23<<24>>24==0){r3=758;break}r19=r22+1|0;if(((r23&255)-48|0)>>>0>=10){r24=r19;break}r22=r19;r23=HEAP8[r19]}if(r3==758){r3=0;r24=r22+1|0}r19=r20+1|0;HEAP32[r10]=r19;if((r19|0)<(r14|0)){r17=r19;r18=r23<<24>>24==44?r24:r22}else{r15=r13;r3=774;break}}if(r3==774){STACKTOP=r4;return r15}_free_game(r13);r15=0;STACKTOP=r4;return r15}else if(r12<<24>>24==80|r12<<24>>24==82){r12=(_sscanf(r2+1|0,39204,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r7,HEAP32[tempInt+8>>2]=r9,tempInt))|0)==3;r9=HEAP32[r6];if(!(r12&(r9|0)>-1&(r9|0)<(r11|0))){r15=0;STACKTOP=r4;return r15}r9=HEAP32[r8];if(!((r9|0)>-1&(r9|0)<(r11|0))){r15=0;STACKTOP=r4;return r15}r9=HEAP32[r10];if((r9|0)<0|(r9|0)>(r11|0)){r15=0;STACKTOP=r4;return r15}r9=_dup_game(r1),r1=r9>>2;r12=HEAP32[r10];if(HEAP8[r2]<<24>>24==80&(r12|0)>0){r2=(r12-1+Math.imul(Math.imul(HEAP32[r8],r11)+HEAP32[r6]|0,r11)|0)+HEAP32[r1+7]|0;HEAP8[r2]=HEAP8[r2]<<24>>24==0&1;r15=r9;STACKTOP=r4;return r15}r2=Math.imul(HEAP32[r8],r11);r10=r9+20|0;HEAP8[HEAP32[r10>>2]+r2+HEAP32[r6]|0]=r12&255;r12=HEAP32[r1+7];_memset(r12+Math.imul(Math.imul(HEAP32[r8],r11)+HEAP32[r6]|0,r11)|0,0,r11);r6=r9+36|0;if((HEAP32[r6>>2]|0)!=0){r15=r9;STACKTOP=r4;return r15}if((_check_valid(r11,HEAP32[r1+1],HEAP32[r1+2],HEAP32[r1+3],HEAP32[r10>>2])|0)==0){r15=r9;STACKTOP=r4;return r15}HEAP32[r6>>2]=1;r15=r9;STACKTOP=r4;return r15}else{r15=0;STACKTOP=r4;return r15}}function _game_free_drawstate(r1,r2){r1=HEAP32[r2+24>>2];if((r1|0)!=0){_free(r1)}r1=HEAP32[r2+20>>2];if((r1|0)!=0){_free(r1)}r1=HEAP32[r2+16>>2];if((r1|0)!=0){_free(r1)}r1=HEAP32[r2+32>>2];if((r1|0)!=0){_free(r1)}if((r2|0)==0){return}_free(r2);return}function _game_colours(r1,r2){var r3,r4,r5,r6,r7,r8,r9;r3=STACKTOP;r4=_malloc(108),r5=r4>>2;if((r4|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r6=r4;_frontend_default_colour(r1,r6);r1=HEAPF32[r6>>2];HEAPF32[r5+3]=r1*.8999999761581421;r7=HEAPF32[r5+1];HEAPF32[r5+4]=r7*.8999999761581421;r8=HEAPF32[r5+2];HEAPF32[r5+5]=r8*.8999999761581421;r9=(r4+24|0)>>2;HEAP32[r9]=0;HEAP32[r9+1]=0;HEAP32[r9+2]=0;HEAP32[r9+3]=0;HEAP32[r9+4]=0;HEAP32[r9+5]=0;HEAP32[r9+6]=0;HEAPF32[r5+13]=r7*.6000000238418579;HEAPF32[r5+14]=0;HEAPF32[r5+15]=r1*.7799999713897705;HEAPF32[r5+16]=r7*.7799999713897705;HEAPF32[r5+17]=r8*.7799999713897705;HEAPF32[r5+18]=1;HEAPF32[r5+19]=0;HEAPF32[r5+20]=0;r9=r1*.5;HEAPF32[r5+21]=r9;r1=r7*.5;HEAPF32[r5+22]=r1;HEAPF32[r5+23]=r8;HEAPF32[r5+24]=r9;HEAPF32[r5+25]=r1;HEAPF32[r5+26]=r8*.10000000149011612;HEAP32[r2>>2]=9;STACKTOP=r3;return r6}}function _game_new_drawstate(r1,r2){var r3,r4,r5,r6,r7,r8,r9;r1=STACKTOP;r3=_malloc(36),r4=r3>>2;if((r3|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r5=HEAP32[r2>>2];HEAP32[r4]=0;HEAP32[r4+1]=r5;HEAP32[r4+2]=HEAP32[r2+12>>2];r6=Math.imul(r5,r5);r7=_malloc(r6);if((r7|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4+4]=r7;_memset(r7,r5+2&255,r6);r7=Math.imul(r6,r5);r8=_malloc(r7);if((r8|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4+5]=r8;_memset(r8,0,r7);r7=_malloc(r6);if((r7|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4+6]=r7;_memset(r7,0,r6);r6=(r5*3&-1)+2|0;r7=r3+28|0;HEAP32[r7>>2]=r6;r8=HEAP32[r2+8>>2];if((r8|0)==0){r9=r6}else{r2=HEAP32[r8+32>>2]+r6|0;HEAP32[r7>>2]=r2;r9=r2}r2=_malloc(Math.imul(r5<<2,r9));if((r2|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r4+8]=r2;HEAP32[r4+3]=0;STACKTOP=r1;return r3}}function _game_redraw(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151;r7=0;r5=STACKTOP;STACKTOP=STACKTOP+44|0;r3=r5;r9=r5+20;r10=r4|0;r11=HEAP32[r10>>2];r12=(r2|0)>>2;if((HEAP32[r12]|0)==0){r13=r2+12|0;r14=HEAP32[r13>>2];r15=Math.imul(r14,r11);if((r14|0)>63){r16=((r14|0)/32&-1)<<1;r14=r15+1|0;r17=r16;r18=r14+r16|0;r19=r14}else{r17=2;r18=r15+3|0;r19=r15+1|0}r15=r1|0;r14=r1+4|0;FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+4>>2]](HEAP32[r14>>2],0,0,r18,r19+r17|0,0);r17=HEAP32[r13>>2];if((r17|0)>63){r13=(r17|0)/32&-1;r20=r13<<1;r21=(r13<<1)+Math.imul(r17,r11)+1|0}else{r20=2;r21=Math.imul(r17,r11)+3|0}r13=r20+Math.imul(r17,r11)+1|0;FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+4>>2]](HEAP32[r14>>2],0,0,r21,r13,2)}r13=r2+28|0;L1141:do{if((Math.imul(HEAP32[r13>>2],r11)|0)>0){r21=r2+32|0;r14=0;while(1){HEAP32[HEAP32[r21>>2]+(r14<<2)>>2]=0;r15=r14+1|0;if((r15|0)<(Math.imul(HEAP32[r13>>2],r11)|0)){r14=r15}else{break L1141}}}}while(0);r13=(r11|0)>0;L1146:do{if(r13){r14=r4+20|0;r21=(r2+32|0)>>2;r15=r4+4|0;r17=r11<<1;r20=r2+8|0;r19=r4+8|0;r18=r11*3&-1;r16=r18+2|0;r22=r11+1|0;r23=Math.imul(r18,r11)-1|0;r24=r11-1|0;r25=Math.imul(r11,r11)-1|0;r26=Math.imul(r18+1|0,r11)-1|0;r18=0;while(1){r27=Math.imul(r18,r11)-1|0;r28=0;while(1){r29=Math.imul(r28,r11)+r18|0;r30=HEAP8[HEAP32[r14>>2]+r29|0];do{if(r30<<24>>24!=0){r31=r30&255;r32=(r27+r31<<2)+HEAP32[r21]|0;HEAP32[r32>>2]=HEAP32[r32>>2]+1|0;r32=((Math.imul(r28+r11|0,r11)-1+r31|0)<<2)+HEAP32[r21]|0;HEAP32[r32>>2]=HEAP32[r32>>2]+1|0;r32=r31-1|0;r33=((r32+Math.imul(HEAP32[HEAP32[HEAP32[r15>>2]+16>>2]+(r29<<2)>>2]+r17|0,r11)|0)<<2)+HEAP32[r21]|0;HEAP32[r33>>2]=HEAP32[r33>>2]+1|0;do{if((HEAP32[r20>>2]|0)!=0){if(((r29|0)%(r22|0)|0)==0){r33=(r23+r31<<2)+HEAP32[r21]|0;HEAP32[r33>>2]=HEAP32[r33>>2]+1|0}if(!(((r29|0)%(r24|0)|0)==0&(r29|0)>0&(r29|0)<(r25|0))){break}r33=(r26+r31<<2)+HEAP32[r21]|0;HEAP32[r33>>2]=HEAP32[r33>>2]+1|0}}while(0);r31=HEAP32[r19>>2];if((r31|0)==0){break}r33=((r32+Math.imul(r16+HEAP32[HEAP32[r31+16>>2]+(r29<<2)>>2]|0,r11)|0)<<2)+HEAP32[r21]|0;HEAP32[r33>>2]=HEAP32[r33>>2]+1|0}}while(0);r29=r28+1|0;if((r29|0)==(r11|0)){break}else{r28=r29}}r28=r18+1|0;if((r28|0)==(r11|0)){break}else{r18=r28}}if(!r13){break}r18=(r4+20|0)>>2;r21=r8>0;r16=(r8<=.13333334028720856|r8>=.2666666805744171)&1;r19=r6|0;r26=r6+4|0;r25=r6+12|0;r24=r6+8|0;r23=r2+32|0;r22=(r4+8|0)>>2;r20=(r4+24|0)>>2;r17=(r4+4|0)>>2;r15=r11<<1;r14=r2+8|0;r28=r11*3&-1;r27=r28+2|0;r29=r11+1|0;r30=Math.imul(r28,r11)-1|0;r33=r11-1|0;r31=Math.imul(r11,r11)-1|0;r34=Math.imul(r28+1|0,r11)-1|0;r28=r3|0;r35=r2+16|0;r36=r2+24|0;r37=r2+20|0;r38=(r4+28|0)>>2;r39=(r2+12|0)>>2;r40=(r1|0)>>2;r41=(r1+4|0)>>2;r42=r9|0;r43=r9+4|0;r44=r9+8|0;r45=r9+12|0;r46=r9+16|0;r47=r9+20|0;r48=r4+16|0;r49=r3+1|0;r50=r4+32|0;r51=0;L1166:while(1){r52=Math.imul(r51,r11)-1|0;r53=(r51|0)>0;r54=r51+1|0;r55=r53^1;r56=(r51|0)==0;r57=r51-1|0;r58=0;while(1){r59=Math.imul(r58,r11)+r51|0;r60=HEAP32[r18];r61=HEAP8[r60+r59|0];r62=r21?r16:0;do{if((r51|0)==(HEAP32[r19>>2]|0)){if((r58|0)!=(HEAP32[r26>>2]|0)){r63=r62;break}if((HEAP32[r25>>2]|0)==0){r63=r62;break}r63=(HEAP32[r24>>2]|0)!=0?2:1}else{r63=r62}}while(0);r62=r61&255;L1175:do{if(r61<<24>>24==0){r64=r63}else{r65=HEAP32[r23>>2],r66=r65>>2;L1177:do{if((HEAP32[(r52+r62<<2>>2)+r66]|0)>1){r7=853}else{r67=(Math.imul(r58+r11|0,r11)-1+r62<<2)+r65|0;if((HEAP32[r67>>2]|0)>1){r7=853;break}r67=r62-1|0;r68=(r67+Math.imul(HEAP32[HEAP32[HEAP32[r17]+16>>2]+(r59<<2)>>2]+r15|0,r11)<<2)+r65|0;if((HEAP32[r68>>2]|0)>1){r7=853;break}do{if((HEAP32[r14>>2]|0)!=0){if(((r59|0)%(r29|0)|0)==0){if((HEAP32[(r30+r62<<2>>2)+r66]|0)>1){r7=853;break L1177}}if(!(((r59|0)%(r33|0)|0)==0&(r59|0)>0&(r59|0)<(r31|0))){break}if((HEAP32[(r34+r62<<2>>2)+r66]|0)>1){r7=853;break L1177}}}while(0);r68=HEAP32[r22];if((r68|0)==0){r64=r63;break L1175}r69=(r67+Math.imul(r27+HEAP32[HEAP32[r68+16>>2]+(r59<<2)>>2]|0,r11)<<2)+r65|0;if((HEAP32[r69>>2]|0)>1){r7=853;break}else{r70=r63;break}}}while(0);if(r7==853){r7=0;r70=r63|16}r65=HEAP32[r22],r66=r65>>2;if((r65|0)==0){r64=r70;break}r65=HEAP32[HEAP32[r66+4]+(r59<<2)>>2];r32=HEAP32[HEAP32[r66+6]+(r65<<2)>>2];L1193:do{if((r32|0)>0){r69=HEAP32[HEAP32[r66+5]+(r65<<2)>>2];r68=0;r71=0;r72=0;while(1){r73=HEAP32[r69+(r68<<2)>>2];r74=HEAP8[r60+r73|0];if(r74<<24>>24==0){r75=r68;r76=r71;r77=r72;break L1193}r78=(r74&255)+r71|0;r74=HEAP8[HEAP32[r20]+r73|0];if(r74<<24>>24==0){r79=r72}else{if((r72|0)!=0){r7=860;break L1166}r79=r74&255}r74=r68+1|0;if((r74|0)<(r32|0)){r68=r74;r71=r78;r72=r79}else{r75=r74;r76=r78;r77=r79;break L1193}}}else{r75=0;r76=0;r77=0}}while(0);if((r75|0)!=(r32|0)){r64=r70;break}if((r77|0)==0){r7=865;break L1166}r64=(r76|0)==(r77|0)?r70:r70|32}}while(0);r59=HEAP32[r10>>2];r62=(r64>>>4&2^2)+6|0;r61=Math.imul(r59,r58)+r51|0;do{if(HEAP8[HEAP32[r35>>2]+r61|0]<<24>>24==HEAP8[r60+r61|0]<<24>>24){if((HEAPU8[HEAP32[r36>>2]+r61|0]|0)!=(r64|0)){r7=871;break}r65=HEAP32[r37>>2];r66=Math.imul(r61,r59);if((_memcmp(r65+r66|0,HEAP32[r38]+r66|0,r59)|0)!=0){r7=871;break}r80=r58+1|0;break}else{r7=871}}while(0);if(r7==871){r7=0;r60=HEAP32[r39];r66=(r60|0)>63;if(r66){r65=((r60|0)/32&-1)<<1;r72=Math.imul(r60,r51)+r65+1|0;r71=r60-1|0;r81=r65;r82=Math.imul(r60,r58)+r65+1|0;r83=r72;r84=r71-r65|0;r85=r71}else{r71=Math.imul(r60,r51)+3|0;r81=2;r82=Math.imul(r60,r58)+3|0;r83=r71;r84=r60-3|0;r85=r60-1|0}r71=r85-r81|0;do{if(r53){r65=HEAP32[HEAP32[r17]+16>>2];if((HEAP32[r65+(r61<<2)>>2]|0)!=(HEAP32[r65+(r61-1<<2)>>2]|0)){r86=r83;r87=r84;break}if(r66){r65=(r60|0)/32&-1;r88=r65;r89=r83-r65|0}else{r88=1;r89=r83-1|0}r86=r89;r87=r88+r84|0}else{r86=r83;r87=r84}}while(0);r65=(r54|0)<(r59|0);do{if(r65){r72=HEAP32[HEAP32[r17]+16>>2];if((HEAP32[r72+(r61<<2)>>2]|0)!=(HEAP32[r72+(r61+1<<2)>>2]|0)){r90=r87;break}if(r66){r91=(r60|0)/32&-1}else{r91=1}r90=r91+r87|0}else{r90=r87}}while(0);r72=(r58|0)>0;do{if(r72){r68=HEAP32[HEAP32[r17]+16>>2];r69=HEAP32[r68+(r61<<2)>>2];r67=(Math.imul(r59,r58-1|0)+r51<<2)+r68|0;if((r69|0)!=(HEAP32[r67>>2]|0)){r92=r82;r93=r71;break}if(r66){r67=(r60|0)/32&-1;r94=r67;r95=r82-r67|0}else{r94=1;r95=r82-1|0}r92=r95;r93=r94+r71|0}else{r92=r82;r93=r71}}while(0);r67=r58+1|0;r69=(r67|0)<(r59|0);do{if(r69){r68=HEAP32[HEAP32[r17]+16>>2];r78=HEAP32[r68+(r61<<2)>>2];r74=(Math.imul(r59,r67)+r51<<2)+r68|0;if((r78|0)!=(HEAP32[r74>>2]|0)){r96=r93;break}if(r66){r97=(r60|0)/32&-1}else{r97=1}r96=r97+r93|0}else{r96=r93}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r40]+24>>2]](HEAP32[r41],r86,r92,r90,r96);r60=r64&15;if((r60|0)==1){r98=5}else{do{if((HEAP32[r14>>2]|0)==0){r99=0}else{if(((r61|0)%(r59+1|0)|0)==0){r99=1;break}if(!(((r61|0)%(r59-1|0)|0)==0&(r61|0)>0)){r99=0;break}r99=(r61|0)<(Math.imul(r59,r59)-1|0)}}while(0);r98=r99&1}FUNCTION_TABLE[HEAP32[HEAP32[r40]+4>>2]](HEAP32[r41],r86,r92,r90,r96,r98);r66=r72^1;r74=r55|r66;do{if(!r74){r78=HEAP32[HEAP32[r17]+16>>2];r68=HEAP32[r78+(r61<<2)>>2];r73=(r57+Math.imul(r59,r58-1|0)<<2)+r78|0;if((r68|0)==(HEAP32[r73>>2]|0)){break}r73=HEAP32[r39];if((r73|0)>63){r68=(r73|0)/32&-1;r100=r82-r68|0;r101=r83-r68|0;r102=r68}else{r100=r82-1|0;r101=r83-1|0;r102=1}FUNCTION_TABLE[HEAP32[HEAP32[r40]+4>>2]](HEAP32[r41],r101,r100,r102,r102,2)}}while(0);r72=r65^1;r68=r72|r66;do{if(!r68){r73=HEAP32[HEAP32[r17]+16>>2];r78=HEAP32[r73+(r61<<2)>>2];r103=(Math.imul(r59,r58-1|0)+r54<<2)+r73|0;if((r78|0)==(HEAP32[r103>>2]|0)){break}r103=HEAP32[r39];r78=r103+r83|0;if((r103|0)>63){r73=(r103|0)/32&-1;r104=r82-r73|0;r105=r78-1-(r73<<1)|0;r106=r73}else{r104=r82-1|0;r105=r78-3|0;r106=1}FUNCTION_TABLE[HEAP32[HEAP32[r40]+4>>2]](HEAP32[r41],r105,r104,r106,r106,2)}}while(0);r66=r69^1;r78=r55|r66;do{if(!r78){r73=HEAP32[HEAP32[r17]+16>>2];r103=HEAP32[r73+(r61<<2)>>2];r107=(r57+Math.imul(r59,r67)<<2)+r73|0;if((r103|0)==(HEAP32[r107>>2]|0)){break}r107=HEAP32[r39];if((r107|0)>63){r103=(r107|0)/32&-1;r108=r82-1+r107-(r103<<1)|0;r109=r83-r103|0;r110=r103}else{r108=r82-3+r107|0;r109=r83-1|0;r110=1}FUNCTION_TABLE[HEAP32[HEAP32[r40]+4>>2]](HEAP32[r41],r109,r108,r110,r110,2)}}while(0);r107=r72|r66;do{if(!r107){r103=HEAP32[HEAP32[r17]+16>>2];r73=HEAP32[r103+(r61<<2)>>2];r111=(Math.imul(r59,r67)+r54<<2)+r103|0;if((r73|0)==(HEAP32[r111>>2]|0)){break}r111=HEAP32[r39];r73=r111+r83|0;if((r111|0)>63){r103=(r111|0)/32&-1;r112=r103<<1;r113=r82-1+r111-r112|0;r114=r73-1-r112|0;r115=r103}else{r113=r82-3+r111|0;r114=r73-3|0;r115=1}FUNCTION_TABLE[HEAP32[HEAP32[r40]+4>>2]](HEAP32[r41],r114,r113,r115,r115,2)}}while(0);if((r60|0)==2){HEAP32[r42>>2]=r86;HEAP32[r43>>2]=r92;HEAP32[r44>>2]=((r90|0)/2&-1)+r86|0;HEAP32[r45>>2]=r92;HEAP32[r46>>2]=r86;HEAP32[r47>>2]=((r96|0)/2&-1)+r92|0;FUNCTION_TABLE[HEAP32[HEAP32[r40]+12>>2]](HEAP32[r41],r42,3,5,5)}r66=HEAP32[r22],r72=r66>>2;do{if((r66|0)!=0){r73=HEAP32[r39];if((r73|0)>63){r116=((r73|0)/32&-1)*3&-1}else{r116=3}r73=(HEAP32[HEAP32[r17]+8>>2]|0)==1;r111=r73?r82:r92;r103=r73?r83:r86;r112=r103-1|0;r117=r111-1|0;r118=r103+(r73?r84:r90)|0;r103=r111+(r73?r71:r96)|0;do{if(r56){r7=933}else{r73=HEAP32[r72+4];if((HEAP32[r73+(r61<<2)>>2]|0)==(HEAP32[r73+(r61-1<<2)>>2]|0)){r119=0;r120=r112;break}else{r7=933;break}}}while(0);if(r7==933){r7=0;r119=1;r120=r112+r116|0}do{if(r65){r32=HEAP32[r72+4];if((HEAP32[r32+(r61<<2)>>2]|0)==(HEAP32[r32+(r61+1<<2)>>2]|0)){r121=0;r122=r118;break}else{r7=936;break}}else{r7=936}}while(0);if(r7==936){r7=0;r121=1;r122=r118-r116|0}do{if((r58|0)==0){r7=939}else{r112=HEAP32[r72+4];r32=HEAP32[r112+(r61<<2)>>2];r73=(Math.imul(r59,r58-1|0)+r51<<2)+r112|0;if((r32|0)==(HEAP32[r73>>2]|0)){r123=0;r124=r117;break}else{r7=939;break}}}while(0);if(r7==939){r7=0;r123=1;r124=r117+r116|0}do{if(r69){r73=HEAP32[r72+4];r32=HEAP32[r73+(r61<<2)>>2];r112=(Math.imul(r59,r67)+r51<<2)+r73|0;if((r32|0)==(HEAP32[r112>>2]|0)){r125=0;r126=r103;break}else{r7=942;break}}else{r7=942}}while(0);if(r7==942){r7=0;r125=1;r126=r103-r116|0}r117=(r123|0)!=0;if(r117){FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r120,r124,r122,r124,r62)}r112=(r125|0)!=0;if(r112){FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r120,r126,r122,r126,r62)}r32=(r119|0)!=0;if(r32){FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r120,r124,r120,r126,r62)}r73=(r121|0)!=0;if(r73){FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r122,r124,r122,r126,r62)}do{if(!(r74|r32|r117)){r111=HEAP32[HEAP32[r22]+16>>2];r127=HEAP32[r111+(r61<<2)>>2];r128=(r57+Math.imul(r59,r58-1|0)<<2)+r111|0;if((r127|0)==(HEAP32[r128>>2]|0)){break}r128=r124+r116|0;r127=r120+r116|0;FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r120,r128,r127,r128,r62);FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r127,r124,r127,r128,r62)}}while(0);do{if(!(r68|r73|r117)){r128=HEAP32[HEAP32[r22]+16>>2];r127=HEAP32[r128+(r61<<2)>>2];r111=(Math.imul(r59,r58-1|0)+r54<<2)+r128|0;if((r127|0)==(HEAP32[r111>>2]|0)){break}r111=r118-r116|0;r127=r124+r116|0;FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r111,r127,r118,r127,r62);FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r111,r124,r111,r127,r62)}}while(0);do{if(!(r78|r32|r112)){r117=HEAP32[HEAP32[r22]+16>>2];r127=HEAP32[r117+(r61<<2)>>2];r111=(r57+Math.imul(r59,r67)<<2)+r117|0;if((r127|0)==(HEAP32[r111>>2]|0)){break}r111=r103-r116|0;r127=r120+r116|0;FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r120,r111,r127,r111,r62);FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r127,r111,r127,r103,r62)}}while(0);if(r107|r73|r112){break}r32=HEAP32[HEAP32[r22]+16>>2];r127=HEAP32[r32+(r61<<2)>>2];r111=(Math.imul(r59,r67)+r54<<2)+r32|0;if((r127|0)==(HEAP32[r111>>2]|0)){break}r111=r118-r116|0;r127=r103-r116|0;FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r111,r127,r111,r103,r62);FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r111,r127,r118,r127,r62)}}while(0);do{if((HEAP32[r48>>2]|0)!=0){r107=HEAP8[HEAP32[r20]+r61|0];if(r107<<24>>24==0){break}_sprintf(r28,38692,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r107&255,tempInt));r107=HEAP32[r39];if((r107|0)>63){r78=((r107|0)/32&-1)<<2;r129=r78;r130=r78+r83|0}else{r129=4;r130=r83+4|0}r78=(r107|0)/4&-1;FUNCTION_TABLE[HEAP32[HEAP32[r40]>>2]](HEAP32[r41],r130,r129+r82+r78|0,1,r78,0,r62,r28)}}while(0);r62=HEAP32[r18]+r61|0;L1349:do{if(HEAP8[r62]<<24>>24==0){if((r59|0)<=0){break}r78=Math.imul(r61,r59);r107=HEAP32[r38];r68=0;r74=0;while(1){r131=(HEAP8[r107+r68+r78|0]<<24>>24!=0&1)+r74|0;r72=r68+1|0;if((r72|0)==(r59|0)){break}else{r68=r72;r74=r131}}if((r131|0)==0){break}r74=HEAP32[r39];r68=(r74|0)>63;if(r68){r118=(r74|0)/32&-1;r103=r118+r82|0;r132=r118;r133=r118+r83|0;r134=r103;r135=r103+r74|0}else{r103=r82+1|0;r132=1;r133=r83+1|0;r134=r103;r135=r74+r103|0}r103=r74+r83|0;r118=r135-r132|0;r112=(HEAP32[r48>>2]|0)==0;do{if(r112){r136=r118;r137=r134;r138=r103;r139=r133}else{if(r68){r73=((r74|0)/32&-1)*3&-1;r140=r73;r141=r103-r73|0;r142=r73+r133|0;r143=r73+r134|0}else{r140=3;r141=r103-3|0;r142=r133+3|0;r143=r134+3|0}r73=r118-r140|0;if(HEAP8[HEAP32[r20]+r61|0]<<24>>24==0){r136=r73;r137=r143;r138=r141;r139=r142;break}r136=r73;r137=((r74|0)/4&-1)+r143|0;r138=r141;r139=r142}}while(0);r118=(r131|0)>4?r131:4;if((r118|0)<=3){r7=1017;break L1166}r103=r131-1|0;r73=r138-r139|0;r72=r73|0;r69=r136-r137|0;r65=r69|0;r71=0;r66=3;r60=0;while(1){r127=(r66+r103|0)/(r66|0)&-1;r111=r72/(r66|0);r32=r65/((r127|0)>2?r127|0:2);r127=r111<r32?r111:r32;r32=r127>r71;r144=r32?r66:r60;r111=r66+1|0;if((r111|0)<(r118|0)){r71=r32?r127:r71;r66=r111;r60=r144}else{break}}if((r144|0)<=0){r7=1018;break L1166}r60=(r144+r103|0)/(r144|0)&-1;r66=(r60|0)>2?r60:2;r60=(r73|0)/(r144|0)&-1;r71=(r69|0)/(r66|0)&-1;r118=(r60|0)<(r71|0)?r60:r71;r71=((r74-Math.imul(r118,r144)|0)/2&-1)+r83|0;r60=((r74-Math.imul(r118,r66)|0)/2&-1)+r82|0;do{if(r112){r145=r60}else{if(HEAP8[HEAP32[r20]+r61|0]<<24>>24==0){r145=r60;break}if(r68){r146=((r74|0)/32&-1)*3&-1}else{r146=3}r66=(r74|0)/4&-1;if((r60|0)>(r146+r82+r66|0)){r145=r60;break}if(r68){r147=((r74|0)/32&-1)*3&-1}else{r147=3}r145=r66+r82+r147|0}}while(0);r74=0;r68=0;r60=r107;while(1){if(HEAP8[r60+r74+r78|0]<<24>>24==0){r148=r68}else{HEAP8[r49]=0;r112=r74+49|0;HEAP8[r28]=((r112<<24|0)>956301312?r74+88|0:r112)&255;r112=r71+((Math.imul((r68|0)%(r144|0)<<1|1,r118)|0)/2&-1)|0;r69=((Math.imul(((r68|0)/(r144|0)&-1)<<1|1,r118)|0)/2&-1)+r145|0;FUNCTION_TABLE[HEAP32[HEAP32[r40]>>2]](HEAP32[r41],r112,r69,1,r118,257,7,r28);r148=r68+1|0}r69=r74+1|0;if((r69|0)==(r59|0)){break L1349}r74=r69;r68=r148;r60=HEAP32[r38]}}else{HEAP8[r49]=0;r60=HEAP8[r62];r68=r60+48&255;HEAP8[r28]=r68<<24>>24>57?r60+87&255:r68;r68=(HEAP32[r39]|0)/2&-1;if(HEAP8[HEAP32[r50>>2]+r61|0]<<24>>24==0){r149=r64>>>3&2|4}else{r149=3}FUNCTION_TABLE[HEAP32[HEAP32[r40]>>2]](HEAP32[r41],r68+r83|0,r68+r82|0,1,r68,257,r149,r28)}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r40]+28>>2]](HEAP32[r41]);r62=HEAP32[HEAP32[r40]+20>>2];if((r62|0)!=0){FUNCTION_TABLE[r62](HEAP32[r41],r86,r92,r90,r96)}HEAP8[HEAP32[r35>>2]+r61|0]=HEAP8[HEAP32[r18]+r61|0];r62=HEAP32[r37>>2];r68=Math.imul(r61,r59);_memcpy(r62+r68|0,HEAP32[r38]+r68|0,r59);HEAP8[HEAP32[r36>>2]+r61|0]=r64&255;r80=r67}if((r80|0)<(r11|0)){r58=r80}else{break}}if((r54|0)<(r11|0)){r51=r54}else{break L1146}}if(r7==865){___assert_func(38316,5168,40472,39520)}else if(r7==1017){___assert_func(38316,4999,40604,39412)}else if(r7==1018){___assert_func(38316,4999,40604,39412)}else if(r7==860){___assert_func(38316,5162,40472,36280)}}}while(0);if((HEAP32[r12]|0)!=0){STACKTOP=r5;return}r7=HEAP32[r2+12>>2];r2=Math.imul(r7,r11);if((r7|0)>63){r11=((r7|0)/32&-1)<<1;r150=r11;r151=r11+(r2+1)|0}else{r150=2;r151=r2+3|0}r11=HEAP32[HEAP32[r1>>2]+20>>2];if((r11|0)!=0){FUNCTION_TABLE[r11](HEAP32[r1+4>>2],0,0,r151,r150+(r2+1)|0)}HEAP32[r12]=1;STACKTOP=r5;return}function _game_anim_length(r1,r2,r3,r4){return 0}function _game_flash_length(r1,r2,r3,r4){var r5;do{if((HEAP32[r1+36>>2]|0)==0){if((HEAP32[r2+36>>2]|0)==0){break}if((HEAP32[r1+40>>2]|0)!=0){break}if((HEAP32[r2+40>>2]|0)==0){r5=.4000000059604645}else{break}return r5}}while(0);r5=0;return r5}function _game_status(r1){return(HEAP32[r1+36>>2]|0)!=0&1}function _game_print_size(r1,r2,r3){var r4;r4=Math.imul(HEAP32[r1>>2]*900&-1,HEAP32[r1+4>>2]);HEAPF32[r2>>2]=((r4|1)+56|0)/100;HEAPF32[r3>>2]=(r4+57|0)/100;return}function _game_timing_state(r1,r2){return(HEAP32[r1+36>>2]|0)==0&1}function _game_print(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+92|0;r6=r5,r7=r6>>2;r8=r5+32;r9=r5+68;r10=r5+88;r11=(r2|0)>>2;r12=HEAP32[r11];r13=_print_mono_colour(r1,0);r14=(r8+12|0)>>2;HEAP32[r14]=r3;r15=(r1|0)>>2;r16=HEAP32[HEAP32[r15]+84>>2];r17=(r1+4|0)>>2;r18=HEAP32[r17];r19=(r1+20|0)>>2;r20=(r3*3&-1|0)/40&-1|0;r21=r20*Math.sqrt(HEAPF32[r19]);FUNCTION_TABLE[r16](r18,r21);r21=(r3|0)>63;if(r21){r22=(r3|0)/32&-1}else{r22=1}r18=Math.imul(r12,r3);r16=r22-1+r18|0;r23=r22-1+r18|0;r24=r6|0;HEAP32[r24>>2]=r22;HEAP32[r7+1]=r22;HEAP32[r7+2]=r22;HEAP32[r7+3]=r23;HEAP32[r7+4]=r16;HEAP32[r7+5]=r23;HEAP32[r7+6]=r16;HEAP32[r7+7]=r22;FUNCTION_TABLE[HEAP32[HEAP32[r15]+12>>2]](HEAP32[r17],r24,4,-1,r13);L1433:do{if((HEAP32[r2+12>>2]|0)==0){r4=1041}else{r24=_print_grey_colour(r1,.8999999761581421);r22=(r12|0)>0;if(!r22){break}r7=(r3|0)/32&-1;r16=0;while(1){r23=Math.imul(r16,r3)+(r21?r7:1)|0;r6=Math.imul(r16,r3)+(r21?r7:1)|0;FUNCTION_TABLE[HEAP32[HEAP32[r15]+4>>2]](HEAP32[r17],r23,r6,r3,r3,r24);r6=r16+1|0;if((r6|0)==(r12|0)){break}else{r16=r6}}if(!r22){break}r16=r12-1|0;r7=(r3|0)/32&-1;r6=0;while(1){if((r6<<1|0)!=(r16|0)){r23=Math.imul(r6,r3)+(r21?r7:1)|0;r25=Math.imul(r16-r6|0,r3)+(r21?r7:1)|0;FUNCTION_TABLE[HEAP32[HEAP32[r15]+4>>2]](HEAP32[r17],r23,r25,r3,r3,r24)}r25=r6+1|0;if((r25|0)==(r12|0)){r4=1041;break L1433}else{r6=r25}}}}while(0);L1445:do{if(r4==1041){r6=(r12|0)>1;if(!r6){break}r24=(r3|0)/40&-1|0;r7=(r3|0)/32&-1;r16=1;while(1){r22=HEAP32[HEAP32[r15]+84>>2];r25=HEAP32[r17];r23=r24*Math.sqrt(HEAPF32[r19]);FUNCTION_TABLE[r22](r25,r23);r23=Math.imul(r16,r3);if(r21){r26=Math.imul(r16,r3)+r7|0;r27=r7;r28=r7}else{r26=Math.imul(r16,r3)+1|0;r27=1;r28=1}FUNCTION_TABLE[HEAP32[HEAP32[r15]+8>>2]](HEAP32[r17],r23+r27|0,r28,r26,r18+r28|0,r13);r23=r16+1|0;if((r23|0)==(r12|0)){break}else{r16=r23}}if(!r6){break}r16=(r3|0)/32&-1;r7=1;while(1){r24=HEAP32[HEAP32[r15]+84>>2];r23=HEAP32[r17];r25=((r3|0)/40&-1|0)*Math.sqrt(HEAPF32[r19]);FUNCTION_TABLE[r24](r23,r25);r25=Math.imul(r7,r3);if(r21){r29=r16;r30=r16;r31=r16}else{r29=1;r30=1;r31=1}r23=Math.imul(r7,r3)+r30|0;FUNCTION_TABLE[HEAP32[HEAP32[r15]+8>>2]](HEAP32[r17],r30,r25+r29|0,r18+r31|0,r23,r13);r23=r7+1|0;if((r23|0)==(r12|0)){break L1445}else{r7=r23}}}}while(0);r31=HEAP32[HEAP32[r15]+84>>2];r18=HEAP32[r17];r29=r20*Math.sqrt(HEAPF32[r19]);FUNCTION_TABLE[r31](r18,r29);_outline_block_structure(r1,r8,HEAP32[r11],HEAP32[r2+4>>2],r13,0);r29=r2+8|0;L1463:do{if((HEAP32[r29>>2]|0)!=0){r18=HEAP32[r14];r31=HEAP32[HEAP32[r15]+84>>2];r20=HEAP32[r17];r30=((r18|0)/40&-1|0)*Math.sqrt(HEAPF32[r19]);FUNCTION_TABLE[r31](r20,r30);FUNCTION_TABLE[HEAP32[HEAP32[r15]+88>>2]](HEAP32[r17],1);_outline_block_structure(r1,r8,HEAP32[r11],HEAP32[r29>>2],r13,(r18*5&-1|0)/40&-1);FUNCTION_TABLE[HEAP32[HEAP32[r15]+88>>2]](HEAP32[r17],0);if((r12|0)<=0){STACKTOP=r5;return}r18=r2+24|0;r30=r9|0;r20=HEAP32[r14];r31=(r20|0)>63;r3=(r20|0)/32&-1;r21=(r20*7&-1|0)/40&-1;r28=(r20<<4|0)/40&-1;r26=(r20|0)/4&-1;r27=0;while(1){r4=Math.imul(r27,r12);r7=Math.imul(r20,r27);r16=0;while(1){r6=HEAP8[HEAP32[r18>>2]+r16+r4|0];if(r6<<24>>24!=0){_sprintf(r30,38692,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r6&255,tempInt));r6=Math.imul(r20,r16)+(r31?r3:1)+r21|0;FUNCTION_TABLE[HEAP32[HEAP32[r15]>>2]](HEAP32[r17],r6,r7+(r31?r3:1)+r28|0,1,r26,0,r13,r30)}r6=r16+1|0;if((r6|0)==(r12|0)){break}else{r16=r6}}r16=r27+1|0;if((r16|0)==(r12|0)){break L1463}else{r27=r16}}}}while(0);if((r12|0)<=0){STACKTOP=r5;return}r9=r2+20|0;r2=r10+1|0;r29=r10|0;r10=HEAP32[r14];r14=(r10|0)>63;r11=(r10|0)/32&-1;r8=(r10|0)/2&-1;r1=0;while(1){r19=Math.imul(r1,r12);r27=Math.imul(r10,r1);r30=0;while(1){r26=HEAP32[r9>>2]+r30+r19|0;if(HEAP8[r26]<<24>>24!=0){HEAP8[r2]=0;r28=HEAP8[r26];r26=r28+48&255;HEAP8[r29]=r26<<24>>24>57?r28+87&255:r26;r26=Math.imul(r10,r30)+(r14?r11:1)+r8|0;FUNCTION_TABLE[HEAP32[HEAP32[r15]>>2]](HEAP32[r17],r26,r27+(r14?r11:1)+r8|0,1,r8,257,r13,r29)}r26=r30+1|0;if((r26|0)==(r12|0)){break}else{r30=r26}}r30=r1+1|0;if((r30|0)==(r12|0)){break}else{r1=r30}}STACKTOP=r5;return}function _outline_block_structure(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44;r7=0;r8=STACKTOP;r9=_malloc((r3<<4)+16|0);if((r9|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=r9;r11=r4+32|0;r12=HEAP32[r11>>2];if((r12|0)<=0){_free(r9);STACKTOP=r8;return}r13=r4+24|0;r14=r4+20|0;r15=(r4+16|0)>>2;r4=(r3<<1)+2|0;r16=r2+12|0;r2=r1|0;r17=r1+4|0;r1=0;r18=r12;L1496:while(1){if((HEAP32[HEAP32[r13>>2]+(r1<<2)>>2]|0)==0){r19=r18}else{r12=0;while(1){if((r12|0)>=(r3|0)){r7=1083;break L1496}r20=HEAP32[HEAP32[HEAP32[r14>>2]+(r1<<2)>>2]+(r12<<2)>>2];r21=(r20|0)%(r3|0);if((r21|0)==0){break}if((HEAP32[HEAP32[r15]+(r20-1<<2)>>2]|0)==(r1|0)){r12=r12+1|0}else{break}}r12=(r20|0)/(r3|0)&-1;r22=0;r23=r21;r24=r12;r25=-1;r26=0;while(1){r27=r23-r26|0;r28=r27+r25|0;r29=r24+r25|0;r30=r29+r26|0;if((r28|0)>-1&(r28|0)<(r3|0)&(r30|0)>-1&(r30|0)<(r3|0)){r31=Math.imul(r30,r3)+r28|0;r32=(HEAP32[HEAP32[r15]+(r31<<2)>>2]|0)==(r1|0)}else{r32=0}if((r27|0)>-1&(r27|0)<(r3|0)&(r29|0)>-1&(r29|0)<(r3|0)){r31=Math.imul(r29,r3)+r27|0;r33=(HEAP32[HEAP32[r15]+(r31<<2)>>2]|0)==(r1|0)}else{r33=0}r31=(r33&1)+(r32&1)|0;r28=(r31|0)==0;do{if(r28){r34=r23;r35=r24;r36=-r26|0;r37=r25}else{if((r31|0)!=2){r34=r27;r35=r29;r36=r25;r37=r26;break}r34=r25-r26+r23|0;r35=r25+r26+r24|0;r36=r26;r37=-r25|0}}while(0);if(!((r34|0)>-1&(r34|0)<(r3|0)&(r35|0)>-1&(r35|0)<(r3|0))){r7=1113;break L1496}r29=Math.imul(r35,r3)+r34|0;r27=HEAP32[r15];if((HEAP32[r27+(r29<<2)>>2]|0)!=(r1|0)){r7=1114;break L1496}r29=r34+r36|0;do{if((r29|0)>-1&(r29|0)<(r3|0)){r30=r35+r37|0;if(!((r30|0)>-1&(r30|0)<(r3|0))){break}r38=(Math.imul(r30,r3)+r29<<2)+r27|0;if((HEAP32[r38>>2]|0)==(r1|0)){r7=1098;break L1496}}}while(0);if((r22|0)>=(r4|0)){r7=1100;break L1496}r27=HEAP32[r16>>2];if((r27|0)>63){r39=(r27|0)/32&-1}else{r39=1}r29=Math.imul(r27,(r36+r37+(r34<<1|1)|0)/2&-1)+r39|0;r27=r22<<1;r38=((r27<<2)+r10|0)>>2;HEAP32[r38]=r29;r30=HEAP32[r16>>2];if((r30|0)>63){r40=(r30|0)/32&-1}else{r40=1}r41=Math.imul(r30,(r37-r36+(r35<<1|1)|0)/2&-1)+r40|0;r30=(((r27|1)<<2)+r10|0)>>2;r27=Math.imul(r36,r6);r42=r29-r27|0;HEAP32[r38]=r42;r29=Math.imul(r37,r6);r43=r41-r29|0;HEAP32[r30]=r43;do{if(r28){HEAP32[r38]=r42-r29|0;HEAP32[r30]=r43+r27|0}else{if((r31|0)!=2){break}HEAP32[r38]=r42+r29|0;HEAP32[r30]=r43-r27|0}}while(0);r44=r22+1|0;if((r34|0)==(r21|0)&(r35|0)==(r12|0)&(r36|0)==-1&(r37|0)==0){break}else{r22=r44;r23=r34;r24=r35;r25=r36;r26=r37}}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+12>>2]](HEAP32[r17>>2],r10,r44,-1,r5);r19=HEAP32[r11>>2]}r26=r1+1|0;if((r26|0)<(r19|0)){r1=r26;r18=r19}else{r7=1116;break}}if(r7==1083){___assert_func(38316,5278,40216,38016)}else if(r7==1098){___assert_func(38316,5353,40216,37072)}else if(r7==1100){___assert_func(38316,5362,40216,36668)}else if(r7==1113){___assert_func(38316,5351,40216,37596)}else if(r7==1114){___assert_func(38316,5351,40216,37596)}else if(r7==1116){_free(r9);STACKTOP=r8;return}}function _check_valid(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r6=0;r7=STACKTOP;r8=_malloc(r1);if((r8|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r9=(r1|0)>0;L1547:do{if(r9){r10=0;L1548:while(1){_memset(r8,0,r1);r11=Math.imul(r10,r1);r12=0;while(1){r13=HEAP8[r5+r12+r11|0];r14=r13&255;if(!(r13<<24>>24==0|(r14|0)>(r1|0))){HEAP8[r8+(r14-1)|0]=1}r14=r12+1|0;if((r14|0)==(r1|0)){r15=0;break}else{r12=r14}}while(1){if((r15|0)>=(r1|0)){break}if(HEAP8[r8+r15|0]<<24>>24==0){r6=1127;break L1548}else{r15=r15+1|0}}r12=r10+1|0;if((r12|0)<(r1|0)){r10=r12}else{break}}if(r6==1127){_free(r8);r16=0;STACKTOP=r7;return r16}if(r9){r17=0}else{break}L1563:while(1){_memset(r8,0,r1);r10=0;while(1){r12=r5+Math.imul(r10,r1)+r17|0;r11=HEAP8[r12];r12=r11&255;if(!(r11<<24>>24==0|(r12|0)>(r1|0))){HEAP8[r8+(r12-1)|0]=1}r12=r10+1|0;if((r12|0)==(r1|0)){r18=0;break}else{r10=r12}}while(1){if((r18|0)>=(r1|0)){break}if(HEAP8[r8+r18|0]<<24>>24==0){r6=1137;break L1563}else{r18=r18+1|0}}r10=r17+1|0;if((r10|0)<(r1|0)){r17=r10}else{break}}if(r6==1137){_free(r8);r16=0;STACKTOP=r7;return r16}if(!r9){break}r10=r2+20|0;r12=0;L1579:while(1){_memset(r8,0,r1);r11=0;while(1){r14=HEAP8[r5+HEAP32[HEAP32[HEAP32[r10>>2]+(r12<<2)>>2]+(r11<<2)>>2]|0];r13=r14&255;if(!(r14<<24>>24==0|(r13|0)>(r1|0))){HEAP8[r8+(r13-1)|0]=1}r13=r11+1|0;if((r13|0)==(r1|0)){r19=0;break}else{r11=r13}}while(1){if((r19|0)>=(r1|0)){break}if(HEAP8[r8+r19|0]<<24>>24==0){break L1579}else{r19=r19+1|0}}r11=r12+1|0;if((r11|0)<(r1|0)){r12=r11}else{break L1547}}_free(r8);r16=0;STACKTOP=r7;return r16}}while(0);L1593:do{if((r3|0)!=0){r19=r3+32|0;if((HEAP32[r19>>2]|0)<=0){break}r2=r3+24|0;r17=r3+20|0;r18=0;L1596:while(1){_memset(r8,0,r1);r15=HEAP32[r2>>2];L1598:do{if((HEAP32[r15+(r18<<2)>>2]|0)>0){r12=0;r10=r15;while(1){r11=HEAP8[r5+HEAP32[HEAP32[HEAP32[r17>>2]+(r18<<2)>>2]+(r12<<2)>>2]|0];r13=r11&255;if(r11<<24>>24==0|(r13|0)>(r1|0)){r20=r10}else{r11=r8+(r13-1)|0;if(HEAP8[r11]<<24>>24!=0){break L1596}HEAP8[r11]=1;r20=HEAP32[r2>>2]}r11=r12+1|0;if((r11|0)<(HEAP32[r20+(r18<<2)>>2]|0)){r12=r11;r10=r20}else{break L1598}}}}while(0);r15=r18+1|0;if((r15|0)<(HEAP32[r19>>2]|0)){r18=r15}else{break L1593}}_free(r8);r16=0;STACKTOP=r7;return r16}}while(0);L1609:do{if((r4|0)!=0){_memset(r8,0,r1);L1611:do{if(r9){r20=r1+1|0;r3=0;while(1){r18=r5+Math.imul(r3,r20)|0;r19=HEAP8[r18];r18=r19&255;if(!(r19<<24>>24==0|(r18|0)>(r1|0))){HEAP8[r8+(r18-1)|0]=1}r18=r3+1|0;if((r18|0)==(r1|0)){r21=0;break L1611}else{r3=r18}}}else{r21=0}}while(0);while(1){if((r21|0)>=(r1|0)){break}if(HEAP8[r8+r21|0]<<24>>24==0){r6=1167;break}else{r21=r21+1|0}}if(r6==1167){_free(r8);r16=0;STACKTOP=r7;return r16}L1625:do{if(r9){r3=r1-1|0;r20=0;while(1){r18=r20+1|0;r19=r5+Math.imul(r18,r3)|0;r2=HEAP8[r19];r19=r2&255;if(!(r2<<24>>24==0|(r19|0)>(r1|0))){HEAP8[r8+(r19-1)|0]=1}if((r18|0)==(r1|0)){r22=0;break L1625}else{r20=r18}}}else{r22=0}}while(0);while(1){if((r22|0)>=(r1|0)){break L1609}if(HEAP8[r8+r22|0]<<24>>24==0){break}else{r22=r22+1|0}}_free(r8);r16=0;STACKTOP=r7;return r16}}while(0);_free(r8);r16=1;STACKTOP=r7;return r16}function _solver(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187,r188,r189,r190,r191,r192,r193,r194,r195,r196,r197,r198,r199,r200,r201,r202,r203,r204,r205,r206,r207,r208,r209,r210,r211,r212,r213,r214,r215,r216,r217,r218,r219,r220,r221,r222,r223,r224,r225,r226,r227,r228,r229,r230,r231,r232,r233,r234,r235,r236,r237,r238,r239,r240,r241,r242,r243,r244,r245,r246,r247,r248,r249,r250,r251,r252,r253,r254,r255,r256,r257,r258,r259,r260,r261,r262,r263,r264,r265,r266,r267,r268,r269,r270,r271,r272,r273,r274,r275,r276,r277,r278,r279,r280,r281,r282,r283,r284;r8=0;r9=STACKTOP;r10=_malloc(60),r11=r10>>2;if((r10|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r12=r10;r13=r10>>2;HEAP32[r13]=r1;r14=(r10+4|0)>>2;HEAP32[r14]=r2;r15=(r3|0)!=0;do{if(r15){r16=r3+4|0;r17=r3+8|0;r18=r3+12|0;r19=r3+36|0;r20=(r3+32|0)>>2;r21=_alloc_block_structure(HEAP32[r16>>2],HEAP32[r17>>2],HEAP32[r18>>2],HEAP32[r19>>2],HEAP32[r20]);_memcpy(HEAP32[r21+24>>2],HEAP32[r3+24>>2],HEAP32[r20]<<2);_memcpy(HEAP32[r21+16>>2],HEAP32[r3+16>>2],HEAP32[r18>>2]<<2);r18=r21+28|0;_memcpy(HEAP32[r18>>2],HEAP32[r3+28>>2],Math.imul(HEAP32[r20]<<2,HEAP32[r19>>2]));L1645:do{if((HEAP32[r20]|0)>0){r19=r21+36|0;r22=r21+20|0;r23=0;while(1){r24=HEAP32[r18>>2]+(Math.imul(HEAP32[r19>>2],r23)<<2)|0;HEAP32[HEAP32[r22>>2]+(r23<<2)>>2]=r24;r24=r23+1|0;if((r24|0)<(HEAP32[r20]|0)){r23=r24}else{break L1645}}}}while(0);HEAP32[r11+2]=r21;r20=HEAP32[r16>>2];r18=HEAP32[r17>>2];r23=Math.imul(r1,r1);r22=_alloc_block_structure(r20,r18,r23,r1,r23);HEAP32[r11+3]=r22;r22=_malloc(r23);if((r22|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r11+7]=r22;r25=r23;break}}else{HEAP32[r11+3]=0;HEAP32[r11+2]=0;HEAP32[r11+7]=0;r25=Math.imul(r1,r1)}}while(0);r23=Math.imul(r25,r1);r22=_malloc(r23);if((r22|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r18=(r10+16|0)>>2;HEAP32[r18]=r22;r20=(r10+20|0)>>2;HEAP32[r20]=r5;do{if((r6|0)==0){HEAP32[r11+6]=0;r26=r22}else{if(!r15){___assert_func(38316,1723,40156,38844)}r19=HEAP32[r3+32>>2];r24=_malloc(r25);if((r24|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r27=(r10+24|0)>>2;HEAP32[r27]=r24;r28=r3+24|0;r29=r3+20|0;r30=0;r31=r24;while(1){if((r30|0)>=(r19|0)){r8=1209;break}r24=HEAP32[r28>>2];if((HEAP32[r24+(r30<<2)>>2]|0)>0){r32=0;r33=r24;while(1){r24=HEAP8[r6+HEAP32[HEAP32[HEAP32[r29>>2]+(r30<<2)>>2]+(r32<<2)>>2]|0];if(r24<<24>>24==0){r34=r33}else{HEAP8[HEAP32[r27]+r30|0]=r24;r34=HEAP32[r28>>2]}r24=r32+1|0;if((r24|0)<(HEAP32[r34+(r30<<2)>>2]|0)){r32=r24;r33=r34}else{break}}r35=HEAP32[r27]}else{r35=r31}if(HEAP8[r35+r30|0]<<24>>24==0){r8=1208;break}else{r30=r30+1|0;r31=r35}}if(r8==1208){___assert_func(38316,1734,40156,38820)}else if(r8==1209){_memset(r31+r19|0,0,r25-r19|0);r26=HEAP32[r18];break}}}while(0);_memset(r26,1,r23);r23=_malloc(r25);if((r23|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r26=(r10+32|0)>>2;HEAP32[r26]=r23;r23=_malloc(r25);if((r23|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r35=(r10+36|0)>>2;HEAP32[r35]=r23;r23=_malloc(r25);if((r23|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r34=(r10+40|0)>>2;HEAP32[r34]=r23;_memset(HEAP32[r26],0,r25);_memset(HEAP32[r35],0,r25);_memset(HEAP32[r34],0,r25);r23=(r4|0)!=0;do{if(r23){r15=r1<<1;r22=_malloc(r15);if((r22|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r11+11]=r22;_memset(r22,0,r15);break}}else{HEAP32[r11+11]=0}}while(0);r15=(r23?2:0)+(r1*3&-1)|0;HEAP32[r11+13]=r15;r23=r1<<2;r22=_malloc(Math.imul(r23,r15));if((r22|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r15=(r10+48|0)>>2;HEAP32[r15]=r22;r22=_malloc(r25*12&-1);if((r22|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r30=(r10+56|0)>>2;HEAP32[r30]=r22;r22=(r1|0)>0;L1704:do{if(r22){r27=r1<<1;r28=0;while(1){r29=Math.imul(r28,r1);r17=r29*3&-1;r16=r17+r1|0;r21=r17+r27|0;r33=0;while(1){r32=r33+r29|0;r24=Math.imul(r33,r1)+r28|0;r36=HEAP32[HEAP32[HEAP32[HEAP32[r14]+20>>2]+(r28<<2)>>2]+(r33<<2)>>2];HEAP32[HEAP32[r15]+(r33+r17<<2)>>2]=r32;HEAP32[HEAP32[r15]+(r16+r33<<2)>>2]=r24;HEAP32[HEAP32[r15]+(r21+r33<<2)>>2]=r36;HEAP32[HEAP32[r30]+((r32*3&-1)<<2)>>2]=(r17<<2)+HEAP32[r15]|0;HEAP32[HEAP32[r30]+((r24*3&-1)+1<<2)>>2]=(r16<<2)+HEAP32[r15]|0;HEAP32[HEAP32[r30]+((r36*3&-1)+2<<2)>>2]=(r21<<2)+HEAP32[r15]|0;r36=r33+1|0;if((r36|0)==(r1|0)){break}else{r33=r36}}r33=r28+1|0;if((r33|0)==(r1|0)){break L1704}else{r28=r33}}}}while(0);r28=_malloc(32);if((r28|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r27=r28;r19=HEAP32[r13];r31=Math.imul(r19,r19);r33=_malloc(r31);if((r33|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r21=r28>>2;HEAP32[r21]=r33;r33=_malloc(r19);if((r33|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r16=r28+4|0;HEAP32[r16>>2]=r33;r33=_malloc(r19);if((r33|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r17=r28+8|0;HEAP32[r17>>2]=r33;r33=_malloc(r19);if((r33|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r29=r28+12|0;HEAP32[r29>>2]=r33;r33=_malloc(r19*20&-1);if((r33|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r36=(r28+16|0)>>2;HEAP32[r36]=r33;r33=r31<<2;r31=_malloc(r33);if((r31|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r24=(r28+20|0)>>2;HEAP32[r24]=r31;r31=_malloc(r33);if((r31|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r33=(r28+24|0)>>2;HEAP32[r33]=r31;r31=_malloc(r19<<2);if((r31|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r19=(r28+28|0)>>2;HEAP32[r19]=r31;L1739:do{if(r22){r31=0;while(1){r32=0;while(1){r37=r5+Math.imul(r32,r1)+r31|0;r38=HEAP8[r37];r37=r38&255;if(r38<<24>>24!=0){r38=HEAP32[r13];r39=r37-1+Math.imul(Math.imul(r38,r32)+r31|0,r38)|0;if(HEAP8[HEAP32[r18]+r39|0]<<24>>24==0){r40=7;r41=0;break L1739}_solver_place(r12,r31,r32,r37)}r37=r32+1|0;if((r37|0)<(r1|0)){r32=r37}else{break}}r32=r31+1|0;if((r32|0)<(r1|0)){r31=r32}else{r8=1251;break L1739}}}else{r8=1251}}while(0);L1749:do{if(r8==1251){r31=(r10+24|0)>>2;r32=(r7+4|0)>>2;r37=(r10+12|0)>>2;r39=r1+1|0;r38=(Math.imul(r39,r1)|0)/2&-1;r42=(r10+8|0)>>2;r43=(r7|0)>>2;r44=(r10+28|0)>>2;r45=(r10+44|0)>>2;r46=(r1|0)<1;r47=r1-1|0;r48=0;r49=0;L1751:while(1){L1753:do{if(r22){r50=0;L1754:while(1){L1756:do{if(!r46){r51=Math.imul(r50,r1)-1|0;r52=1;while(1){do{if(HEAP8[HEAP32[r34]+r51+r52|0]<<24>>24==0){r53=r52-1|0;r54=0;while(1){r55=r53+Math.imul(HEAP32[r13],HEAP32[HEAP32[HEAP32[HEAP32[r14]+20>>2]+(r50<<2)>>2]+(r54<<2)>>2])|0;HEAP32[HEAP32[r33]+(r54<<2)>>2]=r55;r55=r54+1|0;if((r55|0)==(r1|0)){break}else{r54=r55}}r54=HEAP32[r33];r56=HEAP32[r13];if((r56|0)<=0){r40=7;r41=r49;break L1749}r53=HEAP32[r18];r55=0;r57=0;r58=-1;while(1){r59=HEAP32[r54+(r57<<2)>>2];r60=HEAP8[r53+r59|0]<<24>>24==0;r61=(r60&1^1)+r55|0;r62=r60?r58:r59;r59=r57+1|0;if((r59|0)==(r56|0)){break}else{r55=r61;r57=r59;r58=r62}}if((r61|0)==0){r40=7;r41=r49;break L1749}else if((r61|0)!=1){break}if((r62|0)<=-1){r8=1268;break L1751}r58=(r62|0)/(r56|0)&-1;r63=(r58|0)/(r56|0)&-1;r64=(r58|0)%(r56|0);r58=Math.imul(r63,r56)+r64|0;if(HEAP8[HEAP32[r20]+r58|0]<<24>>24==0){break L1754}}}while(0);r58=r52+1|0;if((r58|0)>(r1|0)){break L1756}else{r52=r58}}}}while(0);r52=r50+1|0;if((r52|0)<(r1|0)){r50=r52}else{break L1753}}_solver_place(r12,r64,r63,(r62|0)%(r56|0)+1|0);r48=(r48|0)>0?r48:0;r49=r49;continue L1751}}while(0);do{if((HEAP32[r31]|0)!=0){r50=HEAP32[r42];if((HEAP32[r50+32>>2]|0)>0){r65=0;r66=r50}else{break}while(1){r50=HEAP32[HEAP32[r66+24>>2]+(r65<<2)>>2];L1779:do{if((r50|0)>0){r52=r50;r51=r66;while(1){r58=r52-1|0;r57=r51+20|0;r55=HEAP32[HEAP32[HEAP32[r57>>2]+(r65<<2)>>2]+(r58<<2)>>2];r53=HEAP8[HEAP32[r20]+r55|0];r54=r53&255;L1782:do{if(r53<<24>>24==0){r67=r51}else{HEAP32[HEAP32[r51+16>>2]+(r55<<2)>>2]=-1;r59=r51+24|0;r60=HEAP32[r59>>2];r68=(r65<<2)+r60|0;r69=HEAP32[r68>>2];L1784:do{if((r69|0)>0){r70=0;r71=0;r72=r60;while(1){r73=HEAP32[HEAP32[r57>>2]+(r65<<2)>>2];r74=HEAP32[r73+(r70<<2)>>2];if((r74|0)==(r55|0)){r75=r71;r76=r72}else{HEAP32[r73+(r71<<2)>>2]=r74;r75=r71+1|0;r76=HEAP32[r59>>2]}r74=r70+1|0;r73=(r65<<2)+r76|0;r77=HEAP32[r73>>2];if((r74|0)<(r77|0)){r70=r74;r71=r75;r72=r76}else{r78=r74;r79=r75;r80=r73;r81=r77;break L1784}}}else{r78=0;r79=0;r80=r68;r81=r69}}while(0);if((r79+1|0)!=(r78|0)){r8=1283;break L1751}HEAP32[r80>>2]=r81-1|0;r69=HEAP32[r31]+r65|0;r68=HEAP8[r69];if((r53&255)>(r68&255)){r40=7;r41=r49;break L1749}HEAP8[r69]=r68-r53&255;r68=HEAP32[r42];if((HEAP32[HEAP32[r68+24>>2]+(r65<<2)>>2]|0)<=0){r67=r68;break}r69=r54-1|0;r59=0;r60=r68;while(1){r68=r69+Math.imul(HEAP32[r13],HEAP32[HEAP32[HEAP32[r60+20>>2]+(r65<<2)>>2]+(r59<<2)>>2])|0;HEAP8[HEAP32[r18]+r68|0]=0;r68=r59+1|0;r72=HEAP32[r42];if((r68|0)<(HEAP32[HEAP32[r72+24>>2]+(r65<<2)>>2]|0)){r59=r68;r60=r72}else{r67=r72;break L1782}}}}while(0);if((r58|0)>0){r52=r58;r51=r67}else{r82=r67;break L1779}}}else{r82=r66}}while(0);r50=r65+1|0;r83=HEAP32[r82+32>>2];if((r50|0)<(r83|0)){r65=r50;r66=r82}else{break}}if((r83|0)>0){r84=0;r85=0;r86=r82}else{break}while(1){if((HEAP32[HEAP32[r86+24>>2]+(r85<<2)>>2]|0)==1){r50=HEAP8[HEAP32[r31]+r85|0];r51=r50&255;if(r50<<24>>24==0|(r51|0)>(r1|0)){r40=7;r41=r49;break L1749}r50=HEAP32[HEAP32[HEAP32[r86+20>>2]+(r85<<2)>>2]>>2];r52=(r50|0)%(r1|0);r54=(r50|0)/(r1|0)&-1;r50=HEAP32[r13];r53=r51-1+Math.imul(Math.imul(r50,r54)+r52|0,r50)|0;if(HEAP8[HEAP32[r18]+r53|0]<<24>>24==0){r40=7;r41=r49;break L1749}_solver_place(r12,r52,r54,r51);r87=1;r88=HEAP32[r42]}else{r87=r84;r88=r86}r51=r85+1|0;if((r51|0)<(HEAP32[r88+32>>2]|0)){r84=r87;r85=r51;r86=r88}else{break}}if((r87|0)==0){break}r48=r48;r49=(r49|0)>0?r49:0;continue L1751}}while(0);r51=HEAP32[r32];do{if((r51|0)>2){if((HEAP32[r31]|0)==0){r89=r49;break}HEAP32[HEAP32[r37]+32>>2]=0;r54=0;r52=0;while(1){L1814:do{if(r22){r53=r54;r50=0;while(1){r55=HEAP32[r15]+(Math.imul((r50*3&-1)+r52|0,r1)<<2)|0;r57=HEAP32[r37];r60=HEAP32[r57+32>>2];r59=HEAP32[HEAP32[r57+20>>2]+(r60<<2)>>2],r57=r59>>2;_memcpy(r59,r55,r23);r55=0;r69=0;r72=0;while(1){r68=HEAP32[(r55<<2>>2)+r57];r71=HEAP8[HEAP32[r20]+r68|0];if(r71<<24>>24==0){HEAP32[(r69<<2>>2)+r57]=r68;r90=r69+1|0;r91=r72}else{r90=r69;r91=(r71&255)+r72|0}r71=r55+1|0;if((r71|0)==(r1|0)){break}else{r55=r71;r69=r90;r72=r91}}r72=HEAP32[r42];L1824:do{if((HEAP32[r72+32>>2]|0)>0&(r90|0)>0){r69=0;r55=0;r58=r90;r71=r72;r68=r91;while(1){r70=HEAP32[HEAP32[r71+24>>2]+(r55<<2)>>2];do{if((r70|0)==0){r92=r58;r93=r69;r94=r71;r95=r68}else{if((r70|0)>0){r77=0;r73=0;while(1){r74=r69;while(1){if((r74|0)>=(r58|0)){r96=r73;break}r97=(r74<<2)+r59|0;r98=HEAP32[r97>>2];if((r98|0)==(HEAP32[HEAP32[HEAP32[HEAP32[r42]+20>>2]+(r55<<2)>>2]+(r77<<2)>>2]|0)){r8=1312;break}else{r74=r74+1|0}}if(r8==1312){r8=0;r74=(r73+r69<<2)+r59|0;r99=HEAP32[r74>>2];HEAP32[r74>>2]=r98;HEAP32[r97>>2]=r99;r96=r73+1|0}r99=r77+1|0;if((r99|0)==(r70|0)){break}else{r77=r99;r73=r96}}r73=HEAP32[r42];r100=r96;r101=r73;r102=HEAP32[HEAP32[r73+24>>2]+(r55<<2)>>2]}else{r100=0;r101=r71;r102=r70}if((r100|0)==(r102|0)){_memmove((r69<<2)+r59|0,(r102+r69<<2)+r59|0,r58-r69-r102<<2,4,0);r92=r58-r102|0;r93=r69;r94=HEAP32[r42];r95=HEAPU8[HEAP32[r31]+r55|0]+r68|0;break}else{r92=r58;r93=r100+r69|0;r94=r101;r95=r68;break}}}while(0);r70=r55+1|0;if((r70|0)<(HEAP32[r94+32>>2]|0)&(r93|0)<(r92|0)){r69=r93;r55=r70;r58=r92;r71=r94;r68=r95}else{r103=r93;r104=r92;r105=r95;r106=r94;break L1824}}}else{r103=0;r104=r90;r105=r91;r106=r72}}while(0);if((r103|0)!=(r104|0)){r8=1320;break L1751}r72=r38-r105|0;do{if((r104|0)==(r1|0)|(r104|0)==0){r107=r53}else{if((HEAP32[r43]|0)>4&(r72|0)<1){r8=1323;break L1751}if((r72|0)<=0){r8=1325;break L1751}if((r104|0)==1){if((r72|0)>(r1|0)){r40=7;r41=r49;break L1749}r68=HEAP32[r57];r71=(r68|0)%(r1|0);r58=(r68|0)/(r1|0)&-1;r68=HEAP32[r13];r55=r72-1+Math.imul(Math.imul(r68,r58)+r71|0,r68)|0;if(HEAP8[HEAP32[r18]+r55|0]<<24>>24==0){r40=7;r41=r49;break L1749}_solver_place(r12,r71,r58,r72);r108=1;r109=HEAP32[r42]}else{r108=r53;r109=r106}r58=r109+16|0;r71=HEAP32[r58>>2];r55=HEAP32[r71+(HEAP32[r57]<<2)>>2];r68=1;while(1){if((r68|0)>=(r104|0)){break}if((HEAP32[r71+(HEAP32[(r68<<2>>2)+r57]<<2)>>2]|0)==(r55|0)){r68=r68+1|0}else{break}}if((r68|0)!=(r104|0)){HEAP32[HEAP32[HEAP32[r37]+24>>2]+(r60<<2)>>2]=r104;r71=HEAP32[r37]+32|0;HEAP32[r71>>2]=HEAP32[r71>>2]+1|0;HEAP8[HEAP32[r44]+r60|0]=r72&255;r107=r108;break}r71=(r109+24|0)>>2;if((HEAP32[HEAP32[r71]+(r55<<2)>>2]|0)<=(r104|0)){r8=1335;break L1751}r69=(r109+32|0)>>2;r70=HEAP32[r69];r73=r109+36|0;r77=HEAP32[r73>>2];if((r77|0)<(r104|0)){r8=1337;break L1751}r99=r70+1|0;HEAP32[r69]=r99;r74=(r109+28|0)>>2;r110=HEAP32[r74];r111=Math.imul(r99<<2,r77);if((r110|0)==0){r112=_malloc(r111)}else{r112=_realloc(r110,r111)}if((r112|0)==0){r8=1342;break L1751}HEAP32[r74]=r112;r111=HEAP32[r71];r110=HEAP32[r69]<<2;if((r111|0)==0){r113=_malloc(r110)}else{r113=_realloc(r111,r110)}if((r113|0)==0){r8=1347;break L1751}HEAP32[r71]=r113;r110=(r109+20|0)>>2;r111=HEAP32[r110];if((r111|0)!=0){_free(r111)}r111=_malloc(HEAP32[r69]<<2);if((r111|0)==0){r8=1351;break L1751}r77=r111;HEAP32[r110]=r77;L1878:do{if((HEAP32[r69]|0)>0){HEAP32[r77>>2]=HEAP32[r74];if((HEAP32[r69]|0)>1){r114=1}else{break}while(1){r111=HEAP32[r110];r99=HEAP32[r74]+(Math.imul(HEAP32[r73>>2],r114)<<2)|0;HEAP32[r111+(r114<<2)>>2]=r99;r99=r114+1|0;if((r99|0)<(HEAP32[r69]|0)){r114=r99}else{break L1878}}}}while(0);L1883:do{if((r104|0)>0){r69=0;while(1){r73=(r69<<2)+r59|0;r74=(HEAP32[r73>>2]<<2)+HEAP32[r58>>2]|0;if((HEAP32[r74>>2]|0)!=(r55|0)){r8=1358;break L1751}HEAP32[r74>>2]=r70;HEAP32[HEAP32[HEAP32[r110]+(r70<<2)>>2]+(r69<<2)>>2]=HEAP32[r73>>2];r73=r69+1|0;if((r73|0)<(r104|0)){r69=r73}else{break L1883}}}}while(0);r58=HEAP32[r71];r69=(r55<<2)+r58|0;r73=HEAP32[r69>>2];L1888:do{if((r73|0)>0){r74=0;r77=0;r68=r58;while(1){r99=HEAP32[HEAP32[r110]+(r55<<2)>>2];r111=HEAP32[r99+(r77<<2)>>2];r115=0;while(1){if((r115|0)>=(r104|0)){break}if((HEAP32[(r115<<2>>2)+r57]|0)==(r111|0)){break}else{r115=r115+1|0}}if((r115|0)==(r104|0)){HEAP32[r99+(r74<<2)>>2]=r111;r116=r74+1|0;r117=HEAP32[r71]}else{r116=r74;r117=r68}r118=r77+1|0;r119=(r55<<2)+r117|0;r120=HEAP32[r119>>2];if((r118|0)<(r120|0)){r74=r116;r77=r118;r68=r117}else{r121=r119;r122=r120;break L1888}}}else{r121=r69;r122=r73}}while(0);HEAP32[r121>>2]=r122-r104|0;HEAP32[HEAP32[r71]+(r70<<2)>>2]=r104;r73=HEAP32[r42];r69=HEAP32[r73+32>>2]-1|0;if((HEAP32[HEAP32[r73+24>>2]+(r69<<2)>>2]|0)!=(r104|0)){r8=1367;break L1751}HEAP8[HEAP32[r31]+r69|0]=r72&255;r69=HEAP32[r31]+r55|0;HEAP8[r69]=HEAPU8[r69]-r72&255;r107=r108}}while(0);r72=r50+1|0;if((r72|0)<(r1|0)){r53=r107;r50=r72}else{r123=r107;break L1814}}}else{r123=r54}}while(0);r50=r52+1|0;if((r50|0)<3){r54=r123;r52=r50}else{break}}if((r123|0)==0){r124=HEAP32[r32];r8=1375;break}else{r48=r48;r49=(r49|0)>3?r49:3;continue L1751}}else{r124=r51;r8=1375}}while(0);do{if(r8==1375){r8=0;if((r124|0)<=0){r89=r49;break}r51=HEAP32[r31];do{if((r51|0)==0){r125=r124}else{r52=HEAP32[r42];L1911:do{if((HEAP32[r52+32>>2]|0)>0){r54=0;r50=0;r53=r52;r72=r51;while(1){r57=_solver_killer_minmax(r12,r53,r72,r50);if((r57|0)<0){r40=7;r41=r49;break L1749}r59=(r57|0)>0?1:r54;r57=r50+1|0;r60=HEAP32[r42];if((r57|0)>=(HEAP32[r60+32>>2]|0)){r126=r59;break L1911}r54=r59;r50=r57;r53=r60;r72=HEAP32[r31]}}else{r126=0}}while(0);r52=HEAP32[r37];L1917:do{if((HEAP32[r52+32>>2]|0)>0){r72=r126;r53=0;r50=r52;while(1){r54=_solver_killer_minmax(r12,r50,HEAP32[r44],r53);if((r54|0)<0){r40=7;r41=r49;break L1749}r60=(r54|0)>0?1:r72;r54=r53+1|0;r57=HEAP32[r37];if((r54|0)<(HEAP32[r57+32>>2]|0)){r72=r60;r53=r54;r50=r57}else{r127=r60;break L1917}}}else{r127=r126}}while(0);if((r127|0)==0){r125=HEAP32[r32];break}else{r48=r48;r49=(r49|0)>1?r49:1;continue L1751}}}while(0);if((r125|0)<=1){r89=r49;break}r51=HEAP32[r31];if((r51|0)==0){r89=r49;break}r52=HEAP32[r42];L1928:do{if((HEAP32[r52+32>>2]|0)>0){r50=r49;r53=0;r72=0;r60=r52;r57=r51;while(1){r54=_solver_killer_sums(r12,r72,r60,HEAPU8[r57+r72|0],1);if((r54|0)>0){r128=1;r129=(r50|0)>2?r50:2}else{if((r54|0)<0){r40=7;r41=r50;break L1749}else{r128=r53;r129=r50}}r54=r72+1|0;r59=HEAP32[r42];if((r54|0)>=(HEAP32[r59+32>>2]|0)){r130=r129;r131=r128;break L1928}r50=r129;r53=r128;r72=r54;r60=r59;r57=HEAP32[r31]}}else{r130=r49;r131=0}}while(0);r51=HEAP32[r37];L1937:do{if((HEAP32[r51+32>>2]|0)>0){r52=r130;r57=r131;r60=0;r72=r51;while(1){r53=_solver_killer_sums(r12,r60,r72,HEAPU8[HEAP32[r44]+r60|0],0);if((r53|0)>0){r132=1;r133=(r52|0)>2?r52:2}else{if((r53|0)<0){r40=7;r41=r52;break L1749}else{r132=r57;r133=r52}}r53=r60+1|0;r50=HEAP32[r37];if((r53|0)<(HEAP32[r50+32>>2]|0)){r52=r133;r57=r132;r60=r53;r72=r50}else{r134=r133;r135=r132;break L1937}}}else{r134=r130;r135=r131}}while(0);if((r135|0)==0){r89=r134}else{r48=r48;r49=r134;continue L1751}}}while(0);if((HEAP32[r43]|0)<1){break}L1947:do{if(r22){r51=0;L1948:while(1){L1950:do{if(!r46){r72=Math.imul(r51,r1)-1|0;r60=1;while(1){do{if(HEAP8[HEAP32[r26]+r72+r60|0]<<24>>24==0){r57=r60-1|0;r52=0;while(1){r50=HEAP32[r13];r53=r57+Math.imul(Math.imul(r50,r51)+r52|0,r50)|0;HEAP32[HEAP32[r33]+(r52<<2)>>2]=r53;r53=r52+1|0;if((r53|0)==(r1|0)){break}else{r52=r53}}r52=HEAP32[r33];r136=HEAP32[r13];if((r136|0)<=0){r40=7;r41=r89;break L1749}r57=HEAP32[r18];r55=0;r70=0;r71=-1;while(1){r53=HEAP32[r52+(r70<<2)>>2];r50=HEAP8[r57+r53|0]<<24>>24==0;r137=(r50&1^1)+r55|0;r138=r50?r71:r53;r53=r70+1|0;if((r53|0)==(r136|0)){break}else{r55=r137;r70=r53;r71=r138}}if((r137|0)==0){r40=7;r41=r89;break L1749}else if((r137|0)!=1){break}if((r138|0)<=-1){r8=1414;break L1751}r71=(r138|0)/(r136|0)&-1;r139=(r71|0)/(r136|0)&-1;r140=(r71|0)%(r136|0);r71=Math.imul(r139,r136)+r140|0;if(HEAP8[HEAP32[r20]+r71|0]<<24>>24==0){r8=1416;break L1948}}}while(0);r71=r60+1|0;if((r71|0)>(r1|0)){break L1950}else{r60=r71}}}}while(0);r60=r51+1|0;if((r60|0)<(r1|0)){r51=r60}else{break}}if(r8==1416){r8=0;_solver_place(r12,r140,r139,(r138|0)%(r136|0)+1|0);r48=(r48|0)>1?r48:1;r49=r89;continue L1751}if(r22){r141=0}else{break}L1970:while(1){L1972:do{if(!r46){r51=Math.imul(r141,r1)-1|0;r60=1;while(1){do{if(HEAP8[HEAP32[r35]+r51+r60|0]<<24>>24==0){r72=r60-1|0;r71=0;while(1){r70=HEAP32[r13];r55=r72+Math.imul(Math.imul(r70,r71)+r141|0,r70)|0;HEAP32[HEAP32[r33]+(r71<<2)>>2]=r55;r55=r71+1|0;if((r55|0)==(r1|0)){break}else{r71=r55}}r71=HEAP32[r33];r142=HEAP32[r13];if((r142|0)<=0){r40=7;r41=r89;break L1749}r72=HEAP32[r18];r55=0;r70=0;r57=-1;while(1){r52=HEAP32[r71+(r70<<2)>>2];r53=HEAP8[r72+r52|0]<<24>>24==0;r143=(r53&1^1)+r55|0;r144=r53?r57:r52;r52=r70+1|0;if((r52|0)==(r142|0)){break}else{r55=r143;r70=r52;r57=r144}}if((r143|0)==0){r40=7;r41=r89;break L1749}else if((r143|0)!=1){break}if((r144|0)<=-1){r8=1430;break L1751}r57=(r144|0)/(r142|0)&-1;r145=(r57|0)/(r142|0)&-1;r146=(r57|0)%(r142|0);r57=Math.imul(r145,r142)+r146|0;if(HEAP8[HEAP32[r20]+r57|0]<<24>>24==0){break L1970}}}while(0);r57=r60+1|0;if((r57|0)>(r1|0)){break L1972}else{r60=r57}}}}while(0);r60=r141+1|0;if((r60|0)<(r1|0)){r141=r60}else{break L1947}}_solver_place(r12,r146,r145,(r144|0)%(r142|0)+1|0);r48=(r48|0)>1?r48:1;r49=r89;continue L1751}}while(0);r60=HEAP32[r45];L1991:do{if(!((r60|0)==0|r46)){r51=1;r57=r60;L1992:while(1){r70=r51-1|0;do{if(HEAP8[r57+r70|0]<<24>>24==0){L1996:do{if(r22){r55=0;while(1){r72=r70+Math.imul(Math.imul(r55,r39),HEAP32[r13])|0;HEAP32[HEAP32[r33]+(r55<<2)>>2]=r72;r72=r55+1|0;if((r72|0)==(r1|0)){break L1996}else{r55=r72}}}}while(0);r55=HEAP32[r33];r147=HEAP32[r13];if((r147|0)<=0){r40=7;r41=r89;break L1749}r72=HEAP32[r18];r71=0;r52=0;r53=-1;while(1){r50=HEAP32[r55+(r52<<2)>>2];r59=HEAP8[r72+r50|0]<<24>>24==0;r148=(r59&1^1)+r71|0;r149=r59?r53:r50;r50=r52+1|0;if((r50|0)==(r147|0)){break}else{r71=r148;r52=r50;r53=r149}}if((r148|0)==0){r40=7;r41=r89;break L1749}else if((r148|0)!=1){break}if((r149|0)<=-1){r8=1444;break L1751}r53=(r149|0)/(r147|0)&-1;r150=(r53|0)/(r147|0)&-1;r151=(r53|0)%(r147|0);r53=Math.imul(r150,r147)+r151|0;if(HEAP8[HEAP32[r20]+r53|0]<<24>>24==0){r8=1446;break L1992}}}while(0);r70=r51+1|0;if((r70|0)>(r1|0)){break}r51=r70;r57=HEAP32[r45]}if(r8==1446){r8=0;_solver_place(r12,r151,r150,(r149|0)%(r147|0)+1|0);r48=(r48|0)>1?r48:1;r49=r89;continue L1751}if(r46){break}else{r152=1}L2011:while(1){do{if(HEAP8[HEAP32[r45]+r47+r152|0]<<24>>24==0){L2015:do{if(r22){r57=r152-1|0;r51=0;while(1){r70=r51+1|0;r53=r57+Math.imul(Math.imul(r70,r47),HEAP32[r13])|0;HEAP32[HEAP32[r33]+(r51<<2)>>2]=r53;if((r70|0)==(r1|0)){break L2015}else{r51=r70}}}}while(0);r51=HEAP32[r33];r153=HEAP32[r13];if((r153|0)<=0){r40=7;r41=r89;break L1749}r57=HEAP32[r18];r70=0;r53=0;r52=-1;while(1){r71=HEAP32[r51+(r53<<2)>>2];r72=HEAP8[r57+r71|0]<<24>>24==0;r154=(r72&1^1)+r70|0;r155=r72?r52:r71;r71=r53+1|0;if((r71|0)==(r153|0)){break}else{r70=r154;r53=r71;r52=r155}}if((r154|0)==0){r40=7;r41=r89;break L1749}else if((r154|0)!=1){break}if((r155|0)<=-1){r8=1459;break L1751}r52=(r155|0)/(r153|0)&-1;r156=(r52|0)/(r153|0)&-1;r157=(r52|0)%(r153|0);r52=Math.imul(r156,r153)+r157|0;if(HEAP8[HEAP32[r20]+r52|0]<<24>>24==0){break L2011}}}while(0);r52=r152+1|0;if((r52|0)>(r1|0)){break L1991}else{r152=r52}}_solver_place(r12,r157,r156,(r155|0)%(r153|0)+1|0);r48=(r48|0)>1?r48:1;r49=r89;continue L1751}}while(0);L2029:do{if(r22){r60=0;L2030:while(1){r52=0;while(1){r53=Math.imul(r52,r1)+r60|0;do{if(HEAP8[HEAP32[r20]+r53|0]<<24>>24==0){L2036:do{if(!r46){r70=1;while(1){r57=HEAP32[r13];r51=r70-1|0;r71=r51+Math.imul(Math.imul(r57,r52)+r60|0,r57)|0;HEAP32[HEAP32[r33]+(r51<<2)>>2]=r71;r71=r70+1|0;if((r71|0)==(r39|0)){break L2036}else{r70=r71}}}}while(0);r70=HEAP32[r33];r158=HEAP32[r13];if((r158|0)<=0){r40=7;r41=r89;break L1749}r71=HEAP32[r18];r51=0;r57=0;r72=-1;while(1){r55=HEAP32[r70+(r57<<2)>>2];r50=HEAP8[r71+r55|0]<<24>>24==0;r159=(r50&1^1)+r51|0;r160=r50?r72:r55;r55=r57+1|0;if((r55|0)==(r158|0)){break}else{r51=r159;r57=r55;r72=r160}}if((r159|0)==0){r40=7;r41=r89;break L1749}else if((r159|0)!=1){break}if((r160|0)<=-1){r8=1473;break L1751}r72=(r160|0)/(r158|0)&-1;r161=(r72|0)/(r158|0)&-1;r162=(r72|0)%(r158|0);r72=Math.imul(r161,r158)+r162|0;if(HEAP8[HEAP32[r20]+r72|0]<<24>>24==0){break L2030}}}while(0);r53=r52+1|0;if((r53|0)<(r1|0)){r52=r53}else{break}}r52=r60+1|0;if((r52|0)<(r1|0)){r60=r52}else{break L2029}}_solver_place(r12,r162,r161,(r160|0)%(r158|0)+1|0);r48=(r48|0)>1?r48:1;r49=r89;continue L1751}}while(0);if((HEAP32[r43]|0)<2){break}L2051:do{if(r22){r60=0;L2052:while(1){r52=Math.imul(r60,r1)-1|0;r53=0;while(1){L2056:do{if(!r46){r72=Math.imul(r53,r1)-1|0;r57=1;while(1){L2060:do{if(HEAP8[HEAP32[r26]+r52+r57|0]<<24>>24==0){if(HEAP8[HEAP32[r34]+r72+r57|0]<<24>>24!=0){break}r51=r57-1|0;r71=0;while(1){r70=HEAP32[r13];r55=r51+Math.imul(Math.imul(r70,r60)+r71|0,r70)|0;HEAP32[HEAP32[r33]+(r71<<2)>>2]=r55;r55=r51+Math.imul(HEAP32[r13],HEAP32[HEAP32[HEAP32[HEAP32[r14]+20>>2]+(r53<<2)>>2]+(r71<<2)>>2])|0;HEAP32[HEAP32[r19]+(r71<<2)>>2]=r55;r55=r71+1|0;if((r55|0)==(r1|0)){break}else{r71=r55}}r71=HEAP32[r33],r51=r71>>2;r55=HEAP32[r19],r70=r55>>2;r50=HEAP32[r13];if((r50|0)<=0){break}r59=HEAP32[r18];r54=0;r69=0;while(1){r73=HEAP32[(r54<<2>>2)+r51];r110=r69;while(1){if((r110|0)>=(r50|0)){r163=0;break}if((HEAP32[(r110<<2>>2)+r70]|0)<(r73|0)){r110=r110+1|0}else{r163=1;break}}if(HEAP8[r59+r73|0]<<24>>24!=0){if(!r163){r164=r50;r165=r55,r166=r165>>2;r167=r71,r168=r167>>2;break}if((HEAP32[(r110<<2>>2)+r70]|0)!=(r73|0)){r164=r50;r165=r55,r166=r165>>2;r167=r71,r168=r167>>2;break}}r111=r54+1|0;if((r111|0)<(r50|0)){r54=r111;r69=r110}else{r169=0;r170=0;r171=0;r8=1496;break}}if(r8==1496){while(1){r8=0;r69=HEAP32[(r169<<2>>2)+r70];r54=r170;while(1){if((r54|0)>=(r50|0)){r172=0;break}if((HEAP32[(r54<<2>>2)+r51]|0)<(r69|0)){r54=r54+1|0}else{r172=1;break}}r110=HEAP32[r18]+r69|0;do{if(HEAP8[r110]<<24>>24==0){r173=r171}else{if(r172){if((HEAP32[(r54<<2>>2)+r51]|0)==(r69|0)){r173=r171;break}}HEAP8[r110]=0;r173=1}}while(0);r110=r169+1|0;if((r110|0)==(r50|0)){break}else{r169=r110;r170=r54;r171=r173;r8=1496}}if((r173|0)!=0){r8=1524;break L2052}r164=HEAP32[r13];r165=HEAP32[r19],r166=r165>>2;r167=HEAP32[r33],r168=r167>>2}if((r164|0)<=0){break}r50=HEAP32[r18];r51=0;r70=0;while(1){r110=HEAP32[(r51<<2>>2)+r166];r69=r70;while(1){if((r69|0)>=(r164|0)){r174=0;break}if((HEAP32[(r69<<2>>2)+r168]|0)<(r110|0)){r69=r69+1|0}else{r174=1;break}}if(HEAP8[r50+r110|0]<<24>>24!=0){if(!r174){break L2060}if((HEAP32[(r69<<2>>2)+r168]|0)!=(r110|0)){break L2060}}r54=r51+1|0;if((r54|0)<(r164|0)){r51=r54;r70=r69}else{r175=0;r176=0;r177=0;break}}while(1){r70=HEAP32[(r175<<2>>2)+r168];r51=r176;while(1){if((r51|0)>=(r164|0)){r178=0;break}if((HEAP32[(r51<<2>>2)+r166]|0)<(r70|0)){r51=r51+1|0}else{r178=1;break}}r69=HEAP32[r18]+r70|0;do{if(HEAP8[r69]<<24>>24==0){r179=r177}else{if(r178){if((HEAP32[(r51<<2>>2)+r166]|0)==(r70|0)){r179=r177;break}}HEAP8[r69]=0;r179=1}}while(0);r69=r175+1|0;if((r69|0)==(r164|0)){break}else{r175=r69;r176=r51;r177=r179}}if((r179|0)!=0){r8=1524;break L2052}}}while(0);r69=r57+1|0;if((r69|0)>(r1|0)){break L2056}else{r57=r69}}}}while(0);r57=r53+1|0;if((r57|0)<(r1|0)){r53=r57}else{break}}r53=r60+1|0;if((r53|0)<(r1|0)){r60=r53}else{break}}if(r8==1524){r8=0;r48=(r48|0)>2?r48:2;r49=r89;continue L1751}if(r22){r180=0}else{break}L2123:while(1){r60=Math.imul(r180,r1)-1|0;r53=0;while(1){L2127:do{if(!r46){r52=Math.imul(r53,r1)-1|0;r57=1;while(1){L2131:do{if(HEAP8[HEAP32[r35]+r60+r57|0]<<24>>24==0){if(HEAP8[HEAP32[r34]+r52+r57|0]<<24>>24!=0){break}r72=r57-1|0;r69=0;while(1){r70=HEAP32[r13];r110=r72+Math.imul(Math.imul(r70,r69)+r180|0,r70)|0;HEAP32[HEAP32[r33]+(r69<<2)>>2]=r110;r110=r72+Math.imul(HEAP32[r13],HEAP32[HEAP32[HEAP32[HEAP32[r14]+20>>2]+(r53<<2)>>2]+(r69<<2)>>2])|0;HEAP32[HEAP32[r19]+(r69<<2)>>2]=r110;r110=r69+1|0;if((r110|0)==(r1|0)){break}else{r69=r110}}r69=HEAP32[r33],r72=r69>>2;r110=HEAP32[r19],r70=r110>>2;r50=HEAP32[r13];if((r50|0)<=0){break}r54=HEAP32[r18];r73=0;r71=0;while(1){r55=HEAP32[(r73<<2>>2)+r72];r59=r71;while(1){if((r59|0)>=(r50|0)){r181=0;break}if((HEAP32[(r59<<2>>2)+r70]|0)<(r55|0)){r59=r59+1|0}else{r181=1;break}}if(HEAP8[r54+r55|0]<<24>>24!=0){if(!r181){r182=r50;r183=r110,r184=r183>>2;r185=r69,r186=r185>>2;break}if((HEAP32[(r59<<2>>2)+r70]|0)!=(r55|0)){r182=r50;r183=r110,r184=r183>>2;r185=r69,r186=r185>>2;break}}r51=r73+1|0;if((r51|0)<(r50|0)){r73=r51;r71=r59}else{r187=0;r188=0;r189=0;r8=1545;break}}if(r8==1545){while(1){r8=0;r71=HEAP32[(r187<<2>>2)+r70];r73=r188;while(1){if((r73|0)>=(r50|0)){r190=0;break}if((HEAP32[(r73<<2>>2)+r72]|0)<(r71|0)){r73=r73+1|0}else{r190=1;break}}r59=HEAP32[r18]+r71|0;do{if(HEAP8[r59]<<24>>24==0){r191=r189}else{if(r190){if((HEAP32[(r73<<2>>2)+r72]|0)==(r71|0)){r191=r189;break}}HEAP8[r59]=0;r191=1}}while(0);r59=r187+1|0;if((r59|0)==(r50|0)){break}else{r187=r59;r188=r73;r189=r191;r8=1545}}if((r191|0)!=0){break L2123}r182=HEAP32[r13];r183=HEAP32[r19],r184=r183>>2;r185=HEAP32[r33],r186=r185>>2}if((r182|0)<=0){break}r50=HEAP32[r18];r72=0;r70=0;while(1){r59=HEAP32[(r72<<2>>2)+r184];r71=r70;while(1){if((r71|0)>=(r182|0)){r192=0;break}if((HEAP32[(r71<<2>>2)+r186]|0)<(r59|0)){r71=r71+1|0}else{r192=1;break}}if(HEAP8[r50+r59|0]<<24>>24!=0){if(!r192){break L2131}if((HEAP32[(r71<<2>>2)+r186]|0)!=(r59|0)){break L2131}}r73=r72+1|0;if((r73|0)<(r182|0)){r72=r73;r70=r71}else{r193=0;r194=0;r195=0;break}}while(1){r70=HEAP32[(r193<<2>>2)+r186];r72=r194;while(1){if((r72|0)>=(r182|0)){r196=0;break}if((HEAP32[(r72<<2>>2)+r184]|0)<(r70|0)){r72=r72+1|0}else{r196=1;break}}r71=HEAP32[r18]+r70|0;do{if(HEAP8[r71]<<24>>24==0){r197=r195}else{if(r196){if((HEAP32[(r72<<2>>2)+r184]|0)==(r70|0)){r197=r195;break}}HEAP8[r71]=0;r197=1}}while(0);r71=r193+1|0;if((r71|0)==(r182|0)){break}else{r193=r71;r194=r72;r195=r197}}if((r197|0)!=0){break L2123}}}while(0);r71=r57+1|0;if((r71|0)>(r1|0)){break L2127}else{r57=r71}}}}while(0);r57=r53+1|0;if((r57|0)<(r1|0)){r53=r57}else{break}}r53=r180+1|0;if((r53|0)<(r1|0)){r180=r53}else{break L2051}}r48=(r48|0)>2?r48:2;r49=r89;continue L1751}}while(0);L2193:do{if(!((HEAP32[r45]|0)==0|r22^1)){r53=0;L2194:while(1){L2196:do{if(!r46){r60=Math.imul(r53,r1)-1|0;r57=1;while(1){r52=r57-1|0;L2200:do{if(HEAP8[HEAP32[r45]+r52|0]<<24>>24==0){if(HEAP8[HEAP32[r34]+r60+r57|0]<<24>>24==0){r198=0}else{break}while(1){r71=r52+Math.imul(Math.imul(r198,r39),HEAP32[r13])|0;HEAP32[HEAP32[r33]+(r198<<2)>>2]=r71;r71=r52+Math.imul(HEAP32[r13],HEAP32[HEAP32[HEAP32[HEAP32[r14]+20>>2]+(r53<<2)>>2]+(r198<<2)>>2])|0;HEAP32[HEAP32[r19]+(r198<<2)>>2]=r71;r71=r198+1|0;if((r71|0)==(r1|0)){break}else{r198=r71}}r71=HEAP32[r33],r70=r71>>2;r59=HEAP32[r19],r50=r59>>2;r73=HEAP32[r13];if((r73|0)<=0){break}r55=HEAP32[r18];r69=0;r110=0;while(1){r54=HEAP32[(r69<<2>>2)+r70];r51=r110;while(1){if((r51|0)>=(r73|0)){r199=0;break}if((HEAP32[(r51<<2>>2)+r50]|0)<(r54|0)){r51=r51+1|0}else{r199=1;break}}if(HEAP8[r55+r54|0]<<24>>24!=0){if(!r199){r200=r73;r201=r59,r202=r201>>2;r203=r71,r204=r203>>2;break}if((HEAP32[(r51<<2>>2)+r50]|0)!=(r54|0)){r200=r73;r201=r59,r202=r201>>2;r203=r71,r204=r203>>2;break}}r111=r69+1|0;if((r111|0)<(r73|0)){r69=r111;r110=r51}else{r205=0;r206=0;r207=0;r8=1592;break}}if(r8==1592){while(1){r8=0;r110=HEAP32[(r205<<2>>2)+r50];r69=r206;while(1){if((r69|0)>=(r73|0)){r208=0;break}if((HEAP32[(r69<<2>>2)+r70]|0)<(r110|0)){r69=r69+1|0}else{r208=1;break}}r51=HEAP32[r18]+r110|0;do{if(HEAP8[r51]<<24>>24==0){r209=r207}else{if(r208){if((HEAP32[(r69<<2>>2)+r70]|0)==(r110|0)){r209=r207;break}}HEAP8[r51]=0;r209=1}}while(0);r51=r205+1|0;if((r51|0)==(r73|0)){break}else{r205=r51;r206=r69;r207=r209;r8=1592}}if((r209|0)!=0){r8=1620;break L2194}r200=HEAP32[r13];r201=HEAP32[r19],r202=r201>>2;r203=HEAP32[r33],r204=r203>>2}if((r200|0)<=0){break}r73=HEAP32[r18];r70=0;r50=0;while(1){r51=HEAP32[(r70<<2>>2)+r202];r110=r50;while(1){if((r110|0)>=(r200|0)){r210=0;break}if((HEAP32[(r110<<2>>2)+r204]|0)<(r51|0)){r110=r110+1|0}else{r210=1;break}}if(HEAP8[r73+r51|0]<<24>>24!=0){if(!r210){break L2200}if((HEAP32[(r110<<2>>2)+r204]|0)!=(r51|0)){break L2200}}r69=r70+1|0;if((r69|0)<(r200|0)){r70=r69;r50=r110}else{r211=0;r212=0;r213=0;break}}while(1){r50=HEAP32[(r211<<2>>2)+r204];r70=r212;while(1){if((r70|0)>=(r200|0)){r214=0;break}if((HEAP32[(r70<<2>>2)+r202]|0)<(r50|0)){r70=r70+1|0}else{r214=1;break}}r110=HEAP32[r18]+r50|0;do{if(HEAP8[r110]<<24>>24==0){r215=r213}else{if(r214){if((HEAP32[(r70<<2>>2)+r202]|0)==(r50|0)){r215=r213;break}}HEAP8[r110]=0;r215=1}}while(0);r110=r211+1|0;if((r110|0)==(r200|0)){break}else{r211=r110;r212=r70;r213=r215}}if((r215|0)!=0){r8=1620;break L2194}}}while(0);r52=r57+1|0;if((r52|0)>(r1|0)){break L2196}else{r57=r52}}}}while(0);r57=r53+1|0;if((r57|0)<(r1|0)){r53=r57}else{break}}if(r8==1620){r8=0;r48=(r48|0)>2?r48:2;r49=r89;continue L1751}if(r22){r216=0}else{break}L2261:while(1){L2263:do{if(!r46){r53=Math.imul(r216,r1)-1|0;r57=1;while(1){L2267:do{if(HEAP8[HEAP32[r45]+r47+r57|0]<<24>>24==0){if(HEAP8[HEAP32[r34]+r53+r57|0]<<24>>24!=0){break}r60=r57-1|0;r52=0;while(1){r110=r52+1|0;r50=r60+Math.imul(Math.imul(r110,r47),HEAP32[r13])|0;HEAP32[HEAP32[r33]+(r52<<2)>>2]=r50;r50=r60+Math.imul(HEAP32[r13],HEAP32[HEAP32[HEAP32[HEAP32[r14]+20>>2]+(r216<<2)>>2]+(r52<<2)>>2])|0;HEAP32[HEAP32[r19]+(r52<<2)>>2]=r50;if((r110|0)==(r1|0)){break}else{r52=r110}}r52=HEAP32[r33],r60=r52>>2;r110=HEAP32[r19],r50=r110>>2;r51=HEAP32[r13];if((r51|0)<=0){break}r73=HEAP32[r18];r69=0;r54=0;while(1){r71=HEAP32[(r69<<2>>2)+r60];r59=r54;while(1){if((r59|0)>=(r51|0)){r217=0;break}if((HEAP32[(r59<<2>>2)+r50]|0)<(r71|0)){r59=r59+1|0}else{r217=1;break}}if(HEAP8[r73+r71|0]<<24>>24!=0){if(!r217){r218=r51;r219=r110,r220=r219>>2;r221=r52,r222=r221>>2;break}if((HEAP32[(r59<<2>>2)+r50]|0)!=(r71|0)){r218=r51;r219=r110,r220=r219>>2;r221=r52,r222=r221>>2;break}}r70=r69+1|0;if((r70|0)<(r51|0)){r69=r70;r54=r59}else{r223=0;r224=0;r225=0;r8=1639;break}}if(r8==1639){while(1){r8=0;r54=HEAP32[(r223<<2>>2)+r50];r69=r224;while(1){if((r69|0)>=(r51|0)){r226=0;break}if((HEAP32[(r69<<2>>2)+r60]|0)<(r54|0)){r69=r69+1|0}else{r226=1;break}}r59=HEAP32[r18]+r54|0;do{if(HEAP8[r59]<<24>>24==0){r227=r225}else{if(r226){if((HEAP32[(r69<<2>>2)+r60]|0)==(r54|0)){r227=r225;break}}HEAP8[r59]=0;r227=1}}while(0);r59=r223+1|0;if((r59|0)==(r51|0)){break}else{r223=r59;r224=r69;r225=r227;r8=1639}}if((r227|0)!=0){break L2261}r218=HEAP32[r13];r219=HEAP32[r19],r220=r219>>2;r221=HEAP32[r33],r222=r221>>2}if((r218|0)<=0){break}r51=HEAP32[r18];r60=0;r50=0;while(1){r59=HEAP32[(r60<<2>>2)+r220];r54=r50;while(1){if((r54|0)>=(r218|0)){r228=0;break}if((HEAP32[(r54<<2>>2)+r222]|0)<(r59|0)){r54=r54+1|0}else{r228=1;break}}if(HEAP8[r51+r59|0]<<24>>24!=0){if(!r228){break L2267}if((HEAP32[(r54<<2>>2)+r222]|0)!=(r59|0)){break L2267}}r69=r60+1|0;if((r69|0)<(r218|0)){r60=r69;r50=r54}else{r229=0;r230=0;r231=0;break}}while(1){r50=HEAP32[(r229<<2>>2)+r222];r60=r230;while(1){if((r60|0)>=(r218|0)){r232=0;break}if((HEAP32[(r60<<2>>2)+r220]|0)<(r50|0)){r60=r60+1|0}else{r232=1;break}}r54=HEAP32[r18]+r50|0;do{if(HEAP8[r54]<<24>>24==0){r233=r231}else{if(r232){if((HEAP32[(r60<<2>>2)+r220]|0)==(r50|0)){r233=r231;break}}HEAP8[r54]=0;r233=1}}while(0);r54=r229+1|0;if((r54|0)==(r218|0)){break}else{r229=r54;r230=r60;r231=r233}}if((r233|0)!=0){break L2261}}}while(0);r54=r57+1|0;if((r54|0)>(r1|0)){break L2263}else{r57=r54}}}}while(0);r57=r216+1|0;if((r57|0)<(r1|0)){r216=r57}else{break L2193}}r48=(r48|0)>2?r48:2;r49=r89;continue L1751}}while(0);if((HEAP32[r43]|0)<3){break}else{r234=0}while(1){if((r234|0)>=(r1|0)){r235=0;break}L2331:do{if(r22){r57=0;while(1){L2334:do{if(!r46){r53=Math.imul(r57,r1)-1|0;r54=1;while(1){r50=r54-1+Math.imul(HEAP32[r13],HEAP32[HEAP32[HEAP32[HEAP32[r14]+20>>2]+(r234<<2)>>2]+(r57<<2)>>2])|0;HEAP32[HEAP32[r33]+(r53+r54<<2)>>2]=r50;r50=r54+1|0;if((r50|0)==(r39|0)){break L2334}else{r54=r50}}}}while(0);r54=r57+1|0;if((r54|0)==(r1|0)){break L2331}else{r57=r54}}}}while(0);r57=_solver_set(r12,r27,HEAP32[r33]);if((r57|0)<0){r40=7;r41=r89;break L1749}if((r57|0)>0){r8=1679;break}else{r234=r234+1|0}}if(r8==1679){r8=0;r48=(r48|0)>3?r48:3;r49=r89;continue}while(1){if((r235|0)>=(r1|0)){r236=0;break}L2346:do{if(r22){r57=0;while(1){L2349:do{if(!r46){r54=Math.imul(r57,r1)-1|0;r53=1;while(1){r50=HEAP32[r13];r59=r53-1+Math.imul(Math.imul(r50,r235)+r57|0,r50)|0;HEAP32[HEAP32[r33]+(r54+r53<<2)>>2]=r59;r59=r53+1|0;if((r59|0)==(r39|0)){break L2349}else{r53=r59}}}}while(0);r53=r57+1|0;if((r53|0)==(r1|0)){break L2346}else{r57=r53}}}}while(0);r57=_solver_set(r12,r27,HEAP32[r33]);if((r57|0)<0){r40=7;r41=r89;break L1749}if((r57|0)>0){r8=1688;break}else{r235=r235+1|0}}if(r8==1688){r8=0;r48=(r48|0)>3?r48:3;r49=r89;continue}while(1){if((r236|0)>=(r1|0)){break}L2361:do{if(r22){r57=0;while(1){L2364:do{if(!r46){r53=Math.imul(r57,r1)-1|0;r54=1;while(1){r59=HEAP32[r13];r50=r54-1+Math.imul(Math.imul(r59,r57)+r236|0,r59)|0;HEAP32[HEAP32[r33]+(r53+r54<<2)>>2]=r50;r50=r54+1|0;if((r50|0)==(r39|0)){break L2364}else{r54=r50}}}}while(0);r54=r57+1|0;if((r54|0)==(r1|0)){break L2361}else{r57=r54}}}}while(0);r57=_solver_set(r12,r27,HEAP32[r33]);if((r57|0)<0){r40=7;r41=r89;break L1749}if((r57|0)>0){r8=1697;break}else{r236=r236+1|0}}if(r8==1697){r8=0;r48=(r48|0)>3?r48:3;r49=r89;continue}do{if((HEAP32[r45]|0)!=0){L2376:do{if(r22){r57=0;while(1){L2379:do{if(!r46){r54=Math.imul(r57,r39);r53=Math.imul(r57,r1)-1|0;r50=1;while(1){r59=r50-1+Math.imul(r54,HEAP32[r13])|0;HEAP32[HEAP32[r33]+(r53+r50<<2)>>2]=r59;r59=r50+1|0;if((r59|0)==(r39|0)){break L2379}else{r50=r59}}}}while(0);r50=r57+1|0;if((r50|0)==(r1|0)){break L2376}else{r57=r50}}}}while(0);r57=_solver_set(r12,r27,HEAP32[r33]);if((r57|0)<0){r40=7;r41=r89;break L1749}if((r57|0)>0){r48=(r48|0)>3?r48:3;r49=r89;continue L1751}L2389:do{if(r22){r57=0;while(1){r50=r57+1|0;L2392:do{if(!r46){r53=Math.imul(r50,r47);r54=Math.imul(r57,r1)-1|0;r59=1;while(1){r51=r59-1+Math.imul(r53,HEAP32[r13])|0;HEAP32[HEAP32[r33]+(r54+r59<<2)>>2]=r51;r51=r59+1|0;if((r51|0)==(r39|0)){break L2392}else{r59=r51}}}}while(0);if((r50|0)==(r1|0)){break L2389}else{r57=r50}}}}while(0);r57=_solver_set(r12,r27,HEAP32[r33]);if((r57|0)<0){r40=7;r41=r89;break L1749}if((r57|0)<=0){break}r48=(r48|0)>3?r48:3;r49=r89;continue L1751}}while(0);if((HEAP32[r43]|0)<4){break}else{r237=1}while(1){if((r237|0)>(r1|0)){break}L2404:do{if(r22){r57=r237-1|0;r59=0;while(1){r54=Math.imul(r59,r1);r53=0;while(1){r51=HEAP32[r13];r69=r57+Math.imul(Math.imul(r51,r59)+r53|0,r51)|0;HEAP32[HEAP32[r33]+(r53+r54<<2)>>2]=r69;r69=r53+1|0;if((r69|0)==(r1|0)){break}else{r53=r69}}r53=r59+1|0;if((r53|0)==(r1|0)){break L2404}else{r59=r53}}}}while(0);r59=_solver_set(r12,r27,HEAP32[r33]);if((r59|0)<0){r40=7;r41=r89;break L1749}if((r59|0)>0){r8=1724;break}else{r237=r237+1|0}}if(r8==1724){r8=0;r48=(r48|0)>4?r48:4;r49=r89;continue}r59=HEAP32[r21];r57=HEAP32[r36],r53=r57>>2;r54=HEAP32[r24]>>2;r50=HEAP32[r13];if((r50|0)<=0){r8=1774;break}r69=r50+1|0;r51=r69&255;r71=Math.imul(r50,r50);r52=r50-1|0;r110=r71-1|0;r73=r50<<1;r70=(r73<<2)+r57|0;r57=(r50|0)==1;r55=r73+r50|0;r111=r55+r50|0;r99=0;L2417:while(1){r115=Math.imul(r99,r50);r58=0;while(1){r68=HEAP32[r13];r77=Math.imul(Math.imul(r68,r99)+r58|0,r68);r74=HEAP32[r18];r120=r77-1|0;r77=0;r119=1;r118=0;while(1){if(HEAP8[r74+r120+r119|0]<<24>>24==0){r238=r118;r239=r77}else{r238=r118+1|0;r239=r77+r119|0}r240=r119+1|0;if((r240|0)==(r69|0)){break}else{r77=r239;r119=r240;r118=r238}}L2427:do{if((r238|0)==2){r118=r58+r115|0;r119=r59+r118|0;r77=(r118|0)>0;r120=(r118|0)<(r110|0);r240=1;r241=r68;r242=r74;while(1){r243=r240-1|0;r244=r242+Math.imul(Math.imul(r241,r99)+r58|0,r241)+r243|0;L2431:do{if(HEAP8[r244]<<24>>24!=0){_memset(r59,r51,r71);HEAP32[r54]=r118;HEAP8[r119]=r239-r240&255;r245=0;r246=1;while(1){r247=HEAP32[(r245<<2>>2)+r54];r248=(r247|0)/(r50|0)&-1;r249=(r247|0)%(r50|0);r247=Math.imul(r248,r50);r250=r247+r249|0;r251=HEAP8[r59+r250|0];r252=0;while(1){r253=Math.imul(r252,r50)+r249|0;r254=r252+1|0;HEAP32[(r252<<2>>2)+r53]=r253;if((r254|0)==(r50|0)){break}else{r252=r254}}r252=r245+1|0;r60=r50;r254=0;while(1){HEAP32[(r60<<2>>2)+r53]=r254+r247|0;r253=r254+1|0;if((r253|0)==(r50|0)){break}else{r60=r60+1|0;r254=r253}}r254=r251&255;r60=HEAP32[r14];r247=HEAP32[HEAP32[r60+16>>2]+(r250<<2)>>2];HEAP32[r70>>2]=HEAP32[HEAP32[HEAP32[r60+20>>2]+(r247<<2)>>2]>>2];L2441:do{if(!r57){r60=r73;r253=1;while(1){r255=r60+1|0;HEAP32[(r255<<2>>2)+r53]=HEAP32[HEAP32[HEAP32[HEAP32[r14]+20>>2]+(r247<<2)>>2]+(r253<<2)>>2];r256=r253+1|0;if((r256|0)==(r50|0)){break L2441}else{r60=r255;r253=r256}}}}while(0);do{if((HEAP32[r45]|0)==0){r257=r55}else{L2447:do{if(((r250|0)%(r69|0)|0)==0){r247=r55;r251=0;while(1){r253=Math.imul(r251,r69);HEAP32[(r247<<2>>2)+r53]=r253;r253=r251+1|0;if((r253|0)==(r50|0)){r258=r111;break L2447}else{r247=r247+1|0;r251=r253}}}else{r258=r55}}while(0);if(((r250|0)%(r52|0)|0)==0&(r250|0)>0&(r250|0)<(r110|0)){r259=r258;r260=0}else{r257=r258;break}while(1){r251=r260+1|0;r247=Math.imul(r251,r52);HEAP32[(r259<<2>>2)+r53]=r247;if((r251|0)==(r50|0)){break}else{r259=r259+1|0;r260=r251}}r257=r258+r50|0}}while(0);L2455:do{if((r257|0)>0){r250=r254-1|0;r251=(r254|0)==(r240|0);r247=r246;r253=0;while(1){r60=HEAP32[(r253<<2>>2)+r53];r261=(r60|0)%(r50|0);r262=(r60|0)/(r50|0)&-1;r60=Math.imul(r262,r50)+r261|0;r72=r59+r60|0;do{if((HEAPU8[r72]|0)>(r50|0)){r256=HEAP32[r13];r255=Math.imul(Math.imul(r256,r262)+r261|0,r256);r256=HEAP32[r18];if(HEAP8[r256+r250+r255|0]<<24>>24==0){r263=r247;break}if((r261|0)==(r249|0)&(r262|0)==(r248|0)){r263=r247;break}r264=r255-1|0;r255=0;r265=0;r266=1;while(1){if(HEAP8[r256+r264+r266|0]<<24>>24==0){r267=r265;r268=r255}else{r267=r265+r266|0;r268=r255+1|0}r269=r266+1|0;if((r269|0)==(r69|0)){break}else{r255=r268;r265=r267;r266=r269}}if((r268|0)==2){HEAP32[(r247<<2>>2)+r54]=r60;HEAP8[r72]=r267-r254&255;r270=r247+1|0}else{r270=r247}if(!r251){r263=r270;break}if((r261|0)==(r58|0)|(r262|0)==(r99|0)){break L2417}r266=HEAP32[HEAP32[r14]+16>>2];if((HEAP32[r266+(r60<<2)>>2]|0)==(HEAP32[r266+(r118<<2)>>2]|0)){break L2417}if((HEAP32[r45]|0)==0){r263=r270;break}if(((r60|0)%(r69|0)|0)==0){if(((r118|0)%(r69|0)|0)==0){break L2417}}if(!(((r60|0)%(r52|0)|0)==0&(r60|0)>0&(r60|0)<(r110|0))){r263=r270;break}if(((r118|0)%(r52|0)|0)==0&r77&r120){break L2417}else{r263=r270}}else{r263=r247}}while(0);r60=r253+1|0;if((r60|0)<(r257|0)){r247=r263;r253=r60}else{r271=r263;break L2455}}}else{r271=r246}}while(0);if((r252|0)<(r271|0)){r245=r252;r246=r271}else{break L2431}}}}while(0);r244=r240+1|0;if((r244|0)>(r50|0)){break L2427}r240=r244;r241=HEAP32[r13];r242=HEAP32[r18]}}}while(0);r74=r58+1|0;if((r74|0)<(r50|0)){r58=r74}else{break}}r58=r99+1|0;if((r58|0)<(r50|0)){r99=r58}else{r8=1774;break L1751}}r99=HEAP32[r13];r50=Math.imul(Math.imul(r99,r262)+r261|0,r99)+r243|0;HEAP8[HEAP32[r18]+r50|0]=0;r48=(r48|0)>4?r48:4;r49=r89}do{if(r8==1358){___assert_func(38316,620,40056,38384)}else if(r8==1347){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r8==1351){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r8==1367){___assert_func(38316,1962,40156,38696)}else if(r8==1774){if((HEAP32[r43]|0)<=4){break}if(r22){r272=-1;r273=r39;r274=0}else{r40=r48;r41=r89;break L1749}L2494:while(1){r45=Math.imul(r274,r1);r47=r272;r37=r273;r44=0;while(1){r31=r44+r45|0;if(HEAP8[r5+r31|0]<<24>>24==0){if(r46){r8=1865;break L2494}r42=HEAP32[r13];r32=Math.imul(Math.imul(r42,r274)+r44|0,r42);r42=HEAP32[r18];r38=1;r50=0;while(1){r275=(HEAP8[r42+(r38-1)+r32|0]<<24>>24!=0&1)+r50|0;r99=r38+1|0;if((r99|0)==(r39|0)){break}else{r38=r99;r50=r275}}if((r275|0)<=1){r8=1866;break L2494}r50=(r275|0)<(r37|0);r276=r50?r275:r37;r277=r50?r31:r47}else{r276=r37;r277=r47}r50=r44+1|0;if((r50|0)<(r1|0)){r47=r277;r37=r276;r44=r50}else{break}}r44=r274+1|0;if((r44|0)<(r1|0)){r272=r277;r273=r276;r274=r44}else{r8=1786;break}}if(r8==1786){if((r277|0)==-1){r40=r48;r41=r89;break L1749}r44=(r277|0)/(r1|0)&-1;r37=(r277|0)%(r1|0);r47=_malloc(r1);if((r47|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r45=_malloc(r25);if((r45|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r50=_malloc(r25);if((r50|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_memcpy(r45,r5,r25);L2519:do{if(r46){r278=0}else{r38=1;r32=0;while(1){r42=HEAP32[r13];r99=r38-1+Math.imul(Math.imul(r42,r44)+r37|0,r42)|0;if(HEAP8[HEAP32[r18]+r99|0]<<24>>24==0){r279=r32}else{HEAP8[r47+r32|0]=r38&255;r279=r32+1|0}r99=r38+1|0;if((r99|0)==(r39|0)){r278=r279;break L2519}else{r38=r99;r32=r279}}}}while(0);r32=r50+Math.imul(r44,r1)+r37|0;r38=r7+8|0;r99=0;r42=7;L2526:while(1){if((r99|0)>=(r278|0)){r280=r42;break}_memcpy(r50,r45,r25);HEAP8[r32]=HEAP8[r47+r99|0];_solver(r1,r2,r3,r4,r50,r6,r7);r52=(r42|0)==7;do{if(r52){if((HEAP32[r38>>2]|0)==7){r99=r99+1|0;r42=7;continue L2526}else{_memcpy(r5,r50,r25);break}}}while(0);r110=HEAP32[r38>>2];if((r110|0)==7){r281=r42}else if((r110|0)==6){r280=6;break}else{r281=r52?5:6}if((r281|0)==6){r280=6;break}else{r99=r99+1|0;r42=r281}}_free(r50);_free(r45);_free(r47);r40=r280;r41=r89;break L1749}else if(r8==1865){___assert_func(38316,2498,40156,38680)}else if(r8==1866){___assert_func(38316,2498,40156,38680)}}else if(r8==1335){___assert_func(38316,1960,40156,38768)}else if(r8==1337){___assert_func(38316,608,40056,38428)}else if(r8==1342){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r8==1444){___assert_func(38316,878,40144,38336)}else if(r8==1459){___assert_func(38316,878,40144,38336)}else if(r8==1430){___assert_func(38316,878,40144,38336)}else if(r8==1473){___assert_func(38316,878,40144,38336)}else if(r8==1325){___assert_func(38316,1931,40156,38812)}else if(r8==1283){___assert_func(38316,644,40164,38348)}else if(r8==1320){___assert_func(38316,1643,40500,38360)}else if(r8==1323){HEAP32[r7+8>>2]=7;r40=r48;r41=r49;break L1749}else if(r8==1414){___assert_func(38316,878,40144,38336)}else if(r8==1268){___assert_func(38316,878,40144,38336)}}while(0);if(r22){r282=r48;r283=0}else{r40=r48;r41=r89;break}while(1){r49=Math.imul(r283,r1);r39=r282;r46=0;while(1){r284=HEAP8[r5+r46+r49|0]<<24>>24==0?7:r39;r43=r46+1|0;if((r43|0)==(r1|0)){break}else{r39=r284;r46=r43}}r46=r283+1|0;if((r46|0)==(r1|0)){r40=r284;r41=r89;break L1749}else{r282=r284;r283=r46}}}}while(0);HEAP32[r7+8>>2]=r40;HEAP32[r7+12>>2]=r41;r41=HEAP32[r30];if((r41|0)!=0){_free(r41)}r41=HEAP32[r15];if((r41|0)!=0){_free(r41)}r41=HEAP32[r18];if((r41|0)!=0){_free(r41)}r41=HEAP32[r26];if((r41|0)!=0){_free(r41)}r41=HEAP32[r35];if((r41|0)!=0){_free(r41)}r41=HEAP32[r34];if((r41|0)!=0){_free(r41)}r41=HEAP32[r11+2],r34=r41>>2;do{if((r41|0)!=0){r35=r41|0;r26=HEAP32[r35>>2]-1|0;HEAP32[r35>>2]=r26;if((r26|0)==0){r26=HEAP32[r34+4];if((r26|0)!=0){_free(r26)}r26=HEAP32[r34+5];if((r26|0)!=0){_free(r26)}r26=HEAP32[r34+7];if((r26|0)!=0){_free(r26)}r26=HEAP32[r34+6];if((r26|0)!=0){_free(r26)}_free(r41)}r26=HEAP32[r11+3],r35=r26>>2;r18=r26|0;r15=HEAP32[r18>>2]-1|0;HEAP32[r18>>2]=r15;do{if((r15|0)==0){r18=HEAP32[r35+4];if((r18|0)!=0){_free(r18)}r18=HEAP32[r35+5];if((r18|0)!=0){_free(r18)}r18=HEAP32[r35+7];if((r18|0)!=0){_free(r18)}r18=HEAP32[r35+6];if((r18|0)!=0){_free(r18)}if((r26|0)==0){break}_free(r26)}}while(0);r26=HEAP32[r11+7];if((r26|0)==0){break}_free(r26)}}while(0);r41=HEAP32[r11+6];if((r41|0)!=0){_free(r41)}_free(r10);r10=HEAP32[r24];if((r10|0)!=0){_free(r10)}r10=HEAP32[r36];if((r10|0)!=0){_free(r10)}r10=HEAP32[r29>>2];if((r10|0)!=0){_free(r10)}r10=HEAP32[r17>>2];if((r10|0)!=0){_free(r10)}r10=HEAP32[r16>>2];if((r10|0)!=0){_free(r10)}r10=HEAP32[r21];if((r10|0)!=0){_free(r10)}r10=HEAP32[r33];if((r10|0)!=0){_free(r10)}r10=HEAP32[r19];if((r10|0)==0){_free(r28);STACKTOP=r9;return}_free(r10);_free(r28);STACKTOP=r9;return}function _solver_killer_minmax(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36;r5=0;r6=(r1|0)>>2;r7=HEAP32[r6];r8=HEAP32[HEAP32[r2+24>>2]+(r4<<2)>>2];r9=r3+r4|0;if(!(HEAP8[r9]<<24>>24!=0&(r8|0)>0)){r10=0;return r10}r3=r2+20|0;r2=(r7|0)<1;r11=r1+16|0;r1=r7+1|0;r12=0;r13=0;while(1){r14=HEAP32[HEAP32[HEAP32[r3>>2]+(r4<<2)>>2]+(r13<<2)>>2];L2648:do{if(r2){r15=r12}else{r16=r12;r17=1;while(1){r18=HEAP32[r6];r19=r17-1|0;r20=r19+Math.imul(r18,r14)|0;r21=HEAP32[r11>>2];do{if(HEAP8[r21+r20|0]<<24>>24==0){r22=r16}else{r23=HEAP32[HEAP32[r3>>2]+(r4<<2)>>2];r24=0;r25=0;r26=0;while(1){r27=HEAP32[r23+(r26<<2)>>2];L2655:do{if((r13|0)==(r26|0)){r28=r25;r29=r24}else{r30=1;while(1){if((r30|0)>(r7|0)){r31=r25;break}r32=r21+(r30-1)+Math.imul(r18,r27)|0;if(HEAP8[r32]<<24>>24==0){r30=r30+1|0}else{r5=1877;break}}if(r5==1877){r5=0;r31=r30+r25|0}r32=r7;while(1){if((r32|0)<=0){r28=r31;r29=r24;break L2655}r33=r32-1|0;r34=r21+r33+Math.imul(r18,r27)|0;if(HEAP8[r34]<<24>>24==0){r32=r33}else{break}}r28=r31;r29=r32+r24|0}}while(0);r27=r26+1|0;if((r27|0)==(r8|0)){break}else{r24=r29;r25=r28;r26=r27}}r26=HEAP8[r9];if((r29+r17|0)<(r26&255|0)){r25=r21+r19+Math.imul(r18,r14)|0;HEAP8[r25]=0;r35=1;r36=HEAP8[r9]}else{r35=r16;r36=r26}if((r28+r17|0)<=(r36&255|0)){r22=r35;break}r26=r19+Math.imul(HEAP32[r6],r14)|0;HEAP8[HEAP32[r11>>2]+r26|0]=0;r22=1}}while(0);r19=r17+1|0;if((r19|0)==(r1|0)){r15=r22;break L2648}else{r16=r22;r17=r19}}}}while(0);r14=r13+1|0;if((r14|0)==(r8|0)){r10=r15;break}else{r12=r15;r13=r14}}return r10}function _encode_solve_move(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r3=STACKTOP;L2676:do{if((r1|0)<1){r4=0}else{r5=0;r6=1;while(1){r7=r1-r6+1|0;r8=((r7|0)>0?r7:0)+r5|0;r7=r6*10&-1;if((r7|0)>(r1|0)){r4=r8;break L2676}else{r5=r8;r6=r7}}}}while(0);r6=Math.imul(r4+r1|0,r1)+1|0;r4=_malloc(r6);if((r4|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r5=r4+1|0;HEAP8[r4]=83;r7=Math.imul(r1,r1);L2683:do{if((r7|0)==0){r9=r5}else{r1=0;r8=r5;r10=39060;while(1){r11=HEAPU8[r2+r1|0];r12=r8+_sprintf(r8,38928,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r10,HEAP32[tempInt+4>>2]=r11,tempInt))|0;r11=r1+1|0;if((r11|0)<(r7|0)){r1=r11;r8=r12;r10=38916}else{r9=r12;break L2683}}}}while(0);HEAP8[r9]=0;if((r9+1-r4|0)==(r6|0)){STACKTOP=r3;return r4}else{___assert_func(38316,3161,40520,38900)}}function _alloc_block_structure(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11;r6=STACKTOP;r7=_malloc(40),r8=r7>>2;if((r7|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r9=r7;HEAP32[r8]=1;HEAP32[r8+8]=r5;HEAP32[r8+9]=r4;HEAP32[r8+1]=r1;HEAP32[r8+2]=r2;HEAP32[r8+3]=r3;r2=_malloc(r3<<2);if((r2|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r8+4]=r2;r2=_malloc(Math.imul(r4<<2,r5));if((r2|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r3=r7+28|0;HEAP32[r3>>2]=r2;r2=r5<<2;r1=_malloc(r2);if((r1|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=r7+20|0;HEAP32[r10>>2]=r1;r1=_malloc(r2);if((r1|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r8+6]=r1;if((r5|0)>0){r11=0}else{STACKTOP=r6;return r9}while(1){r1=HEAP32[r3>>2]+(Math.imul(r11,r4)<<2)|0;HEAP32[HEAP32[r10>>2]+(r11<<2)>>2]=r1;r1=r11+1|0;if((r1|0)==(r5|0)){break}else{r11=r1}}STACKTOP=r6;return r9}function _solver_place(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r5=r1>>2;r6=0;r7=(r1|0)>>2;r8=HEAP32[r7];r9=Math.imul(r8,r3);r10=r9+r2|0;r11=r4-1|0;r12=r11+Math.imul(r10,r8)|0;r13=(r1+16|0)>>2;if(HEAP8[HEAP32[r13]+r12|0]<<24>>24==0){___assert_func(38316,776,40108,38324)}L2715:do{if((r8|0)<1){r6=1931}else{r12=r8+1|0;r14=1;while(1){if((r14|0)!=(r4|0)){r15=HEAP32[r7];r16=r14-1+Math.imul(Math.imul(r15,r3)+r2|0,r15)|0;HEAP8[HEAP32[r13]+r16|0]=0}r16=r14+1|0;if((r16|0)==(r12|0)){break}else{r14=r16}}r14=(r8|0)>0;if(r14){r17=0}else{r6=1931;break}while(1){if((r17|0)!=(r3|0)){r12=HEAP32[r7];r16=r11+Math.imul(Math.imul(r12,r17)+r2|0,r12)|0;HEAP8[HEAP32[r13]+r16|0]=0}r16=r17+1|0;if((r16|0)==(r8|0)){break}else{r17=r16}}if(r14){r18=0}else{r6=1931;break}while(1){if((r18|0)!=(r2|0)){r16=HEAP32[r7];r12=r11+Math.imul(Math.imul(r16,r3)+r18|0,r16)|0;HEAP8[HEAP32[r13]+r12|0]=0}r12=r18+1|0;if((r12|0)==(r8|0)){break}else{r18=r12}}r14=r1+4|0;r12=HEAP32[r14>>2];r16=HEAP32[HEAP32[r12+16>>2]+(r10<<2)>>2];r15=0;r19=r12;while(1){r12=HEAP32[HEAP32[HEAP32[r19+20>>2]+(r16<<2)>>2]+(r15<<2)>>2];if((r12|0)!=(r10|0)){r20=r11+Math.imul(HEAP32[r7],r12)|0;HEAP8[HEAP32[r13]+r20|0]=0}r20=r15+1|0;if((r20|0)==(r8|0)){r21=1;r22=r16;break L2715}r15=r20;r19=HEAP32[r14>>2]}}}while(0);if(r6==1931){r21=0;r22=HEAP32[HEAP32[HEAP32[r5+1]+16>>2]+(r10<<2)>>2]}HEAP8[HEAP32[r5+5]+r10|0]=r4&255;r4=r11+Math.imul(r22,r8)|0;HEAP8[HEAP32[r5+10]+r4|0]=1;r4=r11+Math.imul(r8,r2)|0;HEAP8[HEAP32[r5+9]+r4|0]=1;HEAP8[HEAP32[r5+8]+r11+r9|0]=1;r9=(r1+44|0)>>2;r1=HEAP32[r9];if((r1|0)==0){return}r5=r8+1|0;if(((r10|0)%(r5|0)|0)==0){if(r21){r4=0;while(1){r2=Math.imul(r4,r5);if((r2|0)!=(r10|0)){r22=r11+Math.imul(HEAP32[r7],r2)|0;HEAP8[HEAP32[r13]+r22|0]=0}r22=r4+1|0;if((r22|0)==(r8|0)){break}else{r4=r22}}r23=HEAP32[r9]}else{r23=r1}HEAP8[r23+r11|0]=1}r23=r8-1|0;if(!(((r10|0)%(r23|0)|0)==0&(r10|0)>0)){return}if((r10|0)>=(Math.imul(r8,r8)-1|0)){return}L2764:do{if(r21){r1=0;while(1){r4=r1+1|0;r5=Math.imul(r4,r23);if((r5|0)!=(r10|0)){r22=r11+Math.imul(HEAP32[r7],r5)|0;HEAP8[HEAP32[r13]+r22|0]=0}if((r4|0)==(r8|0)){break L2764}else{r1=r4}}}}while(0);HEAP8[HEAP32[r9]+r11+r8|0]=1;return}function _solver_killer_sums(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r6=0;r7=r1|0;r8=HEAP32[r7>>2];r9=HEAP32[HEAP32[r3+24>>2]+(r2<<2)>>2];if((r4|0)==0){if((r9|0)==0){r10=0;return r10}else{___assert_func(38316,1475,40124,38572)}}if((r9|0)<=0){___assert_func(38316,1478,40124,38532)}if((r9-2|0)>>>0>2){r10=0;return r10}do{if((r5|0)==0){r11=HEAP32[HEAP32[r3+20>>2]+(r2<<2)>>2];r12=HEAP32[r1+20>>2];r13=r1+4|0;r14=-1;r15=-1;r16=-1;r17=0;while(1){r18=HEAP32[r11+(r17<<2)>>2];if(HEAP8[r12+r18|0]<<24>>24!=0){r6=1966;break}r19=(r18|0)/(r8|0)&-1;if((r17|0)==0){r20=HEAP32[HEAP32[HEAP32[r13>>2]+16>>2]+(r18<<2)>>2];r21=(r18|0)%(r8|0);r22=r19}else{r20=(r16|0)==(HEAP32[HEAP32[HEAP32[r13>>2]+16>>2]+(r18<<2)>>2]|0)?r16:-1;r21=(r15|0)==((r18|0)%(r8|0)|0)?r15:-1;r22=(r14|0)==(r19|0)?r14:-1}r19=r17+1|0;if((r19|0)<(r9|0)){r14=r22;r15=r21;r16=r20;r17=r19}else{break}}if(r6==1966){___assert_func(38316,1492,40124,38460)}if((r20|0)==-1&(r21|0)==-1&(r22|0)==-1){r10=0}else{break}return r10}}while(0);do{if((r9|0)==2){if((r4-3|0)>>>0>14){r10=-1;return r10}else{r23=5;r24=(r4*20&-1)+35248|0;break}}else if((r9|0)==3){if((r4-6|0)>>>0>18){r10=-1;return r10}else{r23=8;r24=(r4<<5)+34448|0;break}}else{if((r4-10|0)>>>0>20){r10=-1;return r10}else{r23=12;r24=(r4*48&-1)+32960|0;break}}}while(0);r4=r3+20|0;r3=(r8|0)<1;r22=r1+16|0;r1=r8+1|0;r21=0;r20=0;while(1){r6=HEAP32[r24+(r20<<2)>>2];if((r6|0)==0){r25=r21;break}else{r26=0}while(1){if((r26|0)>=(r9|0)){break}L2818:do{if(r3){r27=r6}else{r5=Math.imul(r8,HEAP32[HEAP32[HEAP32[r4>>2]+(r2<<2)>>2]+(r26<<2)>>2]);r17=HEAP32[r22>>2];r16=1;r15=r6;while(1){if(HEAP8[r17+(r16-1)+r5|0]<<24>>24==0){r28=r15&(1<<r16^-1)}else{r28=r15}r14=r16+1|0;if((r14|0)==(r1|0)){r27=r28;break L2818}else{r16=r14;r15=r28}}}}while(0);if((r27|0)==0){break}else{r26=r26+1|0}}r15=((r26|0)==(r9|0)?r6:0)|r21;r16=r20+1|0;if((r16|0)<(r23|0)){r21=r15;r20=r16}else{r25=r15;break}}if((r25|0)==0){r10=-1;return r10}else{r29=0;r30=0}while(1){r20=HEAP32[HEAP32[HEAP32[r4>>2]+(r2<<2)>>2]+(r30<<2)>>2];L2832:do{if(r3){r31=r29}else{r21=r29;r23=1;while(1){r26=(r23-1+Math.imul(HEAP32[r7>>2],r20)|0)+HEAP32[r22>>2]|0;do{if(HEAP8[r26]<<24>>24==0){r32=r21}else{if((1<<r23&r25|0)!=0){r32=r21;break}HEAP8[r26]=0;r32=1}}while(0);r26=r23+1|0;if((r26|0)==(r1|0)){r31=r32;break L2832}else{r21=r32;r23=r26}}}}while(0);r20=r30+1|0;if((r20|0)==(r9|0)){r10=r31;break}else{r29=r31;r30=r20}}return r10}function _solver_set(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r4=0;r5=HEAP32[r1>>2];r6=HEAP32[r2>>2];r7=HEAP32[r2+4>>2];r8=HEAP32[r2+8>>2];r9=HEAP32[r2+12>>2];_memset(r7,1,r5);_memset(r8,1,r5);r2=(r5|0)>0;L2842:do{if(r2){r10=r1+16|0;r11=0;while(1){r12=Math.imul(r11,r5);r13=HEAP32[r10>>2];r14=0;r15=0;r16=-1;while(1){r17=HEAP8[r13+HEAP32[r3+(r14+r12<<2)>>2]|0]<<24>>24==0;r18=(r17&1^1)+r15|0;r19=r17?r16:r14;r17=r14+1|0;if((r17|0)==(r5|0)){break}else{r14=r17;r15=r18;r16=r19}}if((r18|0)<=0){r4=2011;break}if((r18|0)==1){HEAP8[r8+r19|0]=0;HEAP8[r7+r11|0]=0}r16=r11+1|0;if((r16|0)<(r5|0)){r11=r16}else{break}}if(r4==2011){___assert_func(38316,1031,40096,38668)}if(r2){r20=0;r21=0}else{r22=0;r4=2024;break}while(1){if(HEAP8[r7+r21|0]<<24>>24==0){r23=r20}else{HEAP8[r7+r20|0]=r21&255;r23=r20+1|0}r11=r21+1|0;if((r11|0)==(r5|0)){break}else{r20=r23;r21=r11}}L2862:do{if(r2){r11=0;r10=0;while(1){if(HEAP8[r8+r10|0]<<24>>24==0){r24=r11}else{HEAP8[r8+r11|0]=r10&255;r24=r11+1|0}r16=r10+1|0;if((r16|0)==(r5|0)){r25=r24;break L2862}else{r11=r24;r10=r16}}}else{r25=0}}while(0);if((r23|0)!=(r25|0)){___assert_func(38316,1047,40096,38612)}r10=(r23|0)>0;if(!r10){r22=r23;r4=2024;break}r11=r1+16|0;r16=0;while(1){r15=r7+r16|0;r14=Math.imul(r16,r5);r12=0;while(1){r13=Math.imul(HEAPU8[r15],r5);HEAP8[r6+r12+r14|0]=HEAP8[HEAP32[r11>>2]+HEAP32[r3+(r13+HEAPU8[r8+r12|0]<<2)>>2]|0];r13=r12+1|0;if((r13|0)==(r23|0)){break}else{r12=r13}}r12=r16+1|0;if((r12|0)==(r23|0)){r26=r11;r27=r23;r28=r10;break L2842}else{r16=r12}}}else{r22=0;r4=2024}}while(0);if(r4==2024){r26=r1+16|0;r27=r22;r28=0}_memset(r9,0,r27);r22=r27-1|0;r1=0;L2881:while(1){do{if((r1|0)>1&(r1|0)<(r22|0)){L2885:do{if(r28){r23=0;r25=0;while(1){r24=Math.imul(r23,r5);r2=0;while(1){if(HEAP8[r9+r2|0]<<24>>24!=0){if(HEAP8[r6+r2+r24|0]<<24>>24!=0){r29=0;break}}r21=r2+1|0;if((r21|0)<(r27|0)){r2=r21}else{r29=1;break}}r2=r29+r25|0;r24=r23+1|0;if((r24|0)==(r27|0)){r30=r2;break L2885}else{r23=r24;r25=r2}}}else{r30=0}}while(0);r25=r27-r1|0;if((r30|0)>(r25|0)){r31=-1;r4=2061;break L2881}if((r30|0)<(r25|0)){r4=2052;break}if(r28){r32=0;r33=0}else{r31=0;r4=2060;break L2881}while(1){r25=Math.imul(r32,r5);r23=0;while(1){if(HEAP8[r9+r23|0]<<24>>24!=0){if(HEAP8[r6+r23+r25|0]<<24>>24!=0){r4=2045;break}}r2=r23+1|0;if((r2|0)<(r27|0)){r23=r2}else{r34=r33;break}}L2904:do{if(r4==2045){r4=0;r23=r7+r32|0;r2=0;r24=r33;while(1){do{if(HEAP8[r9+r2|0]<<24>>24==0){if(HEAP8[r6+r2+r25|0]<<24>>24==0){r35=r24;break}r21=Math.imul(HEAPU8[r23],r5);HEAP8[HEAP32[r26>>2]+HEAP32[r3+(r21+HEAPU8[r8+r2|0]<<2)>>2]|0]=0;r35=1}else{r35=r24}}while(0);r21=r2+1|0;if((r21|0)==(r27|0)){r34=r35;break L2904}else{r2=r21;r24=r35}}}}while(0);r25=r32+1|0;if((r25|0)==(r27|0)){break}else{r32=r25;r33=r34}}r25=(r34|0)!=0;if(r25|r28^1){r31=r25&1;r4=2059;break L2881}else{r36=r1;r37=r27;break}}else{r4=2052}}while(0);do{if(r4==2052){r4=0;if(r28){r36=r1;r37=r27;break}else{r31=0;r4=2058;break L2881}}}while(0);while(1){r25=r37-1|0;r38=r9+r25|0;if(HEAP8[r38]<<24>>24==0){break}HEAP8[r38]=0;if((r25|0)>0){r36=r36-1|0;r37=r25}else{r31=0;r4=2057;break L2881}}HEAP8[r38]=1;r1=r36+1|0}if(r4==2057){return r31}else if(r4==2058){return r31}else if(r4==2059){return r31}else if(r4==2060){return r31}else if(r4==2061){return r31}}function _precompute_sum_bits(){var r1,r2,r3,r4,r5,r6,r7;r1=0;r2=3;L2927:while(1){do{if((r2|0)<18){r3=1;r4=0;while(1){r5=r2-r3|0;if((r5|0)<=(r3|0)){r6=r4;break}if((r5|0)>9){r7=r4}else{HEAP32[(r2*20&-1)+(r4<<2)+35248>>2]=1<<r5|1<<r3;r7=r4+1|0}r5=r3+1|0;if((r5|0)<(r2|0)){r3=r5;r4=r7}else{r6=r7;break}}if((r6|0)>=6){r1=2069;break L2927}if((r6|0)>=5){break}HEAP32[(r2*20&-1)+(r6<<2)+35248>>2]=0}}while(0);do{if((r2|0)<25){r4=_find_sum_bits((r2<<5)+34448|0,0,r2,3,1,0);if((r4|0)>=9){r1=2074;break L2927}if((r4|0)>=8){break}HEAP32[(r2<<5)+(r4<<2)+34448>>2]=0}}while(0);r4=_find_sum_bits((r2*48&-1)+32960|0,0,r2,4,1,0);if((r4|0)>=13){r1=2078;break}if((r4|0)<12){HEAP32[(r2*48&-1)+(r4<<2)+32960>>2]=0}r4=r2+1|0;if((r4|0)<31){r2=r4}else{r1=2082;break}}if(r1==2078){___assert_func(38316,201,40196,37876)}else if(r1==2082){return}else if(r1==2069){___assert_func(38316,190,40196,37908)}else if(r1==2074){___assert_func(38316,196,40196,37892)}}function _spec_to_grid(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10;r4=0;r5=r1;r1=0;L2955:while(1){r6=r5;while(1){r7=HEAP8[r6];if(r7<<24>>24==0|r7<<24>>24==44){r4=2099;break L2955}r8=r6+1|0;if((r7-97&255)<26){r4=2088;break}if(r7<<24>>24==95){r6=r8}else{break}}if(r4==2088){r4=0;r9=r7<<24>>24;r10=r9-96|0;if((r10+r1|0)>(r3|0)){r4=2091;break}if((r10|0)<=0){r5=r8;r1=r1;continue}_memset(r2+r1|0,0,r10);r5=r8;r1=r1-96+r9|0;continue}if((r7-49&255)>=9){r4=2098;break}if((r1|0)>=(r3|0)){r4=2095;break}r9=_atoi(r6)&255;HEAP8[r2+r1|0]=r9;r9=r8;while(1){if((HEAP8[r9]-48&255)<10){r9=r9+1|0}else{break}}r5=r9;r1=r1+1|0}if(r4==2098){___assert_func(38316,3814,40068,37992)}else if(r4==2099){if((r1|0)==(r3|0)){return r6}else{___assert_func(38316,3817,40068,37980)}}else if(r4==2095){___assert_func(38316,3809,40068,38024)}else if(r4==2091){___assert_func(38316,3803,40068,38036)}}function _spec_to_dsf(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r5=0;r6=STACKTOP;r7=HEAP32[r1>>2];r8=_malloc(r4<<2);if((r8|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r9=r8;L2983:do{if((r4|0)>0){r10=0;while(1){HEAP32[r9+(r10<<2)>>2]=6;r11=r10+1|0;if((r11|0)==(r4|0)){break L2983}else{r10=r11}}}}while(0);HEAP32[r2>>2]=r9;r2=r3-1|0;r4=Math.imul(r3<<1,r2);r10=Math.imul(r2,r3);r11=r7;r7=0;L2987:while(1){r12=HEAP8[r11];if(r12<<24>>24==44|r12<<24>>24==0){r5=2120;break}r13=r12<<24>>24;L2990:do{if(r12<<24>>24==95){r14=r7;r15=0;r16=r11+1|0}else{if((r12-97&255)>=26){r5=2111;break L2987}r17=r13-96|0;r18=r11+1|0;if((r17|0)>0){r19=r7;r20=r17}else{r14=r7;r15=r17;r16=r18;break}while(1){r21=r20-1|0;if((r19|0)>=(r4|0)){r5=2114;break L2987}r22=(r19|0)/(r2|0)&-1;if((r19|0)<(r10|0)){r23=(r19|0)%(r2|0)+Math.imul(r22,r3)|0;r24=r23+1|0;r25=r23}else{r23=r22-r3|0;r22=(r19|0)%(r2|0);r26=Math.imul(r22,r3)+r23|0;r24=Math.imul(r22+1|0,r3)+r23|0;r25=r26}_edsf_merge(r9,r25,r24,0);r26=r19+1|0;if((r21|0)>0){r19=r26;r20=r21}else{r14=r26;r15=r17;r16=r18;break L2990}}}}while(0);r11=r16;r7=r14+((r15|0)!=25&1)|0}if(r5==2111){_free(r8);r15=38124;STACKTOP=r6;return r15}else if(r5==2114){___assert_func(38316,3856,40084,38104)}else if(r5==2120){HEAP32[r1>>2]=r11;if((r7|0)==(r4|1|0)){r15=0;STACKTOP=r6;return r15}_free(r8);r15=38052;STACKTOP=r6;return r15}}function _make_blocks_from_whichblock(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10;r2=0;r3=r1+32|0;L3012:do{if((HEAP32[r3>>2]|0)>0){r4=r1+36|0;r5=r1+20|0;r6=r1+24|0;r7=0;while(1){HEAP32[HEAP32[HEAP32[r5>>2]+(r7<<2)>>2]+(HEAP32[r4>>2]-1<<2)>>2]=0;HEAP32[HEAP32[r6>>2]+(r7<<2)>>2]=0;r8=r7+1|0;if((r8|0)<(HEAP32[r3>>2]|0)){r7=r8}else{break L3012}}}}while(0);r3=r1+12|0;if((HEAP32[r3>>2]|0)<=0){return}r7=r1+16|0;r6=r1+36|0;r4=r1+20|0;r5=r1+24|0;r1=0;while(1){r8=HEAP32[HEAP32[r7>>2]+(r1<<2)>>2];r9=(HEAP32[r6>>2]-1<<2)+HEAP32[HEAP32[r4>>2]+(r8<<2)>>2]|0;r10=HEAP32[r9>>2];HEAP32[r9>>2]=r10+1|0;if((r10|0)>=(HEAP32[r6>>2]|0)){r2=2132;break}HEAP32[HEAP32[HEAP32[r4>>2]+(r8<<2)>>2]+(r10<<2)>>2]=r1;r10=(r8<<2)+HEAP32[r5>>2]|0;HEAP32[r10>>2]=HEAP32[r10>>2]+1|0;r10=r1+1|0;if((r10|0)<(HEAP32[r3>>2]|0)){r1=r10}else{r2=2135;break}}if(r2==2135){return}else if(r2==2132){___assert_func(38316,3195,40384,38208)}}function _find_sum_bits(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12;r7=0;if((r4|0)<=1){___assert_func(38316,162,40484,37856)}if((r5|0)>=(r3|0)){r8=r2;return r8}r9=(r4|0)==2;r10=r4-1|0;r4=r5;r5=r2;L3033:while(1){r2=1<<r4|r6;if((r2|0)==(r6|0)){r7=2142;break}r11=r3-r4|0;do{if(r9){if((r11|0)<=(r4|0)){r8=r5;r7=2151;break L3033}if((r11|0)>9){r12=r5;break}HEAP32[r1+(r5<<2)>>2]=r2|1<<r11;r12=r5+1|0}else{r12=_find_sum_bits(r1,r5,r11,r10,r4+1|0,r2)}}while(0);r2=r4+1|0;if((r2|0)<(r3|0)){r4=r2;r5=r12}else{r8=r12;r7=2150;break}}if(r7==2151){return r8}else if(r7==2142){___assert_func(38316,166,40484,37824)}else if(r7==2150){return r8}}function _symmetries(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10;r7=r5>>2;r8=Math.imul(r2,r1);HEAP32[r7]=r3;r1=(r5+8|0)>>2;HEAP32[r7+1]=r4;if((r6|0)==5){r5=r8-1|0;r2=r5-r3|0;HEAP32[r1]=r2;HEAP32[r7+3]=r4;HEAP32[r7+4]=r3;r9=r5-r4|0;HEAP32[r7+5]=r9;HEAP32[r7+6]=r2;HEAP32[r7+7]=r9;r9=4;return r9}else if((r6|0)==2){r2=r8-1|0;r5=r2-r4|0;HEAP32[r1]=r5;HEAP32[r7+3]=r3;HEAP32[r7+4]=r4;r10=r2-r3|0;HEAP32[r7+5]=r10;HEAP32[r7+6]=r10;HEAP32[r7+7]=r5;r9=4;return r9}else if((r6|0)==1){r5=r8-1|0;HEAP32[r1]=r5-r3|0;HEAP32[r7+3]=r5-r4|0;r9=2;return r9}else if((r6|0)==6){HEAP32[r1]=r4;HEAP32[r7+3]=r3;r5=r8-1|0;r10=r5-r3|0;HEAP32[r7+4]=r10;r2=r5-r4|0;HEAP32[r7+5]=r2;HEAP32[r7+6]=r2;HEAP32[r7+7]=r10;r9=4;return r9}else if((r6|0)==4){HEAP32[r1]=r4;HEAP32[r7+3]=r3;r9=2;return r9}else if((r6|0)==3){HEAP32[r1]=r8-1-r3|0;HEAP32[r7+3]=r4;r9=2;return r9}else if((r6|0)==7){r6=r8-1|0;r8=r6-r3|0;HEAP32[r1]=r8;HEAP32[r7+3]=r4;HEAP32[r7+4]=r3;r1=r6-r4|0;HEAP32[r7+5]=r1;HEAP32[r7+6]=r8;HEAP32[r7+7]=r1;HEAP32[r7+8]=r4;HEAP32[r7+9]=r3;HEAP32[r7+10]=r4;HEAP32[r7+11]=r8;HEAP32[r7+12]=r1;HEAP32[r7+13]=r3;HEAP32[r7+14]=r1;HEAP32[r7+15]=r8;r9=8;return r9}else{r9=1;return r9}}function _gridgen_place(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12;r5=r1>>2;r6=1<<(r4&255);r7=HEAP32[r5];r8=(r3<<2)+HEAP32[r5+4]|0;HEAP32[r8>>2]=HEAP32[r8>>2]|r6;r8=(r2<<2)+HEAP32[r5+5]|0;HEAP32[r8>>2]=HEAP32[r8>>2]|r6;r8=Math.imul(r7,r3)+r2|0;r2=(HEAP32[HEAP32[HEAP32[r5+1]+16>>2]+(r8<<2)>>2]<<2)+HEAP32[r5+6]|0;HEAP32[r2>>2]=HEAP32[r2>>2]|r6;r2=HEAP32[r5+7];if((r2|0)!=0){r3=(HEAP32[HEAP32[HEAP32[r5+2]+16>>2]+(r8<<2)>>2]<<2)+r2|0;HEAP32[r3>>2]=HEAP32[r3>>2]|r6}r3=r1+32|0;r2=HEAP32[r3>>2];if((r2|0)==0){r9=r1+12|0,r10=r9>>2;r11=HEAP32[r10];r12=r11+r8|0;HEAP8[r12]=r4;return}if(((r8|0)%(r7+1|0)|0)==0){HEAP32[r2>>2]=HEAP32[r2>>2]|r6}if(!(((r8|0)%(r7-1|0)|0)==0&(r8|0)>0)){r9=r1+12|0,r10=r9>>2;r11=HEAP32[r10];r12=r11+r8|0;HEAP8[r12]=r4;return}if((r8|0)>=(Math.imul(r7,r7)-1|0)){r9=r1+12|0,r10=r9>>2;r11=HEAP32[r10];r12=r11+r8|0;HEAP8[r12]=r4;return}r7=HEAP32[r3>>2]+4|0;HEAP32[r7>>2]=HEAP32[r7>>2]|r6;r9=r1+12|0,r10=r9>>2;r11=HEAP32[r10];r12=r11+r8|0;HEAP8[r12]=r4;return}function _encode_block_structure_desc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r3=0;r4=Math.imul(HEAP32[r2+8>>2],HEAP32[r2+4>>2]);r5=r4-1|0;r6=Math.imul(r4<<1,r5);if((r6|0)<0){r7=r1;return r7}r8=Math.imul(r5,r4);r9=r2+16|0;r2=0;r10=0;r11=r1;while(1){do{if((r10|0)==(r6|0)){r3=2190}else{r1=(r10|0)/(r5|0)&-1;if((r10|0)<(r8|0)){r12=(r10|0)%(r5|0)+Math.imul(r1,r4)|0;r13=r12+1|0;r14=r12}else{r12=r1-r4|0;r1=(r10|0)%(r5|0);r15=Math.imul(r1,r4)+r12|0;r13=Math.imul(r1+1|0,r4)+r12|0;r14=r15}r15=HEAP32[r9>>2];if((HEAP32[r15+(r14<<2)>>2]|0)!=(HEAP32[r15+(r13<<2)>>2]|0)){r3=2190;break}r16=r11;r17=r2+1|0;break}}while(0);if(r3==2190){r3=0;if((r2|0)>25){r15=Math.floor(((r2-26|0)>>>0)/25);_memset(r11,122,r15+1|0);r18=r2-25+(r15*-25&-1)|0;r19=r15+(r11+1)|0}else{r18=r2;r19=r11}if((r18|0)==0){r20=95}else{r20=r18+96&255}HEAP8[r19]=r20;r16=r19+1|0;r17=0}r15=r10+1|0;if((r15|0)>(r6|0)){r7=r16;break}else{r2=r17;r10=r15;r11=r16}}return r7}function _validate_block_desc(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33;r8=0;r9=STACKTOP;STACKTOP=STACKTOP+4|0;r10=r9,r11=r10>>2;r12=_spec_to_dsf(r1,r10,r2,r3);if((r12|0)!=0){r13=r12;STACKTOP=r9;return r13}do{if((r6|0)==(r7|0)){if((r4|0)!=(r5|0)){___assert_func(38316,3933,40024,37520)}if((Math.imul(r6,r4)|0)==(r3|0)){break}___assert_func(38316,3934,40024,37396)}}while(0);r12=r5<<2;r2=_malloc(r12);if((r2|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=r2;r1=_malloc(r12);if((r1|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r12=r1;L3120:do{if((r3|0)>0){r14=HEAP32[r11];r15=0;r16=0;while(1){r17=(r15<<2)+r14|0;r18=HEAP32[r17>>2];if((r18&2|0)==0){r19=0;r20=r18;while(1){r21=r20&1^r19;r22=r20>>2;r23=HEAP32[r14+(r22<<2)>>2];if((r23&2|0)==0){r19=r21;r20=r23}else{break}}L3128:do{if((r22|0)==(r15|0)){r24=r21;r25=r15}else{r20=r22<<2;r19=r18>>2;r23=r21^r18&1;HEAP32[r17>>2]=r21|r20;if((r19|0)==(r22|0)){r24=r23;r25=r22;break}else{r26=r19;r27=r23}while(1){r23=(r26<<2)+r14|0;r19=HEAP32[r23>>2];r28=r19>>2;r29=r27^r19&1;HEAP32[r23>>2]=r27|r20;if((r28|0)==(r22|0)){r24=r29;r25=r22;break L3128}else{r26=r28;r27=r29}}}}while(0);if((r24|0)==0){r30=r25}else{r8=2218;break}}else{r30=r15}r17=0;while(1){if((r17|0)>=(r16|0)){break}if((HEAP32[r10+(r17<<2)>>2]|0)==(r30|0)){r8=2222;break}else{r17=r17+1|0}}if(r8==2222){r8=0;r18=(r17<<2)+r12|0;r20=HEAP32[r18>>2]+1|0;HEAP32[r18>>2]=r20;if((r20|0)>(r7|0)){r8=2223;break}}if((r17|0)==(r16|0)){if((r16|0)>=(r5|0)){r8=2228;break}HEAP32[r10+(r16<<2)>>2]=r30;HEAP32[r12+(r16<<2)>>2]=1;r31=r16+1|0}else{r31=r16}r20=r15+1|0;if((r20|0)<(r3|0)){r15=r20;r16=r31}else{r32=r31;break L3120}}if(r8==2223){if((r14|0)!=0){_free(r14)}_free(r2);_free(r1);r13=37368;STACKTOP=r9;return r13}else if(r8==2228){if((r14|0)!=0){_free(r14)}_free(r2);_free(r1);r13=37336;STACKTOP=r9;return r13}else if(r8==2218){___assert_func(39084,137,40572,38864)}}else{r32=0}}while(0);if((r32|0)<(r4|0)){r4=HEAP32[r11];if((r4|0)!=0){_free(r4)}_free(r2);_free(r1);r13=37300;STACKTOP=r9;return r13}else{r33=0}while(1){if((r33|0)>=(r32|0)){r8=2242;break}if((HEAP32[r12+(r33<<2)>>2]|0)<(r6|0)){r8=2239;break}else{r33=r33+1|0}}if(r8==2242){_free(r2);_free(r1);r33=HEAP32[r11];if((r33|0)==0){r13=0;STACKTOP=r9;return r13}_free(r33);r13=0;STACKTOP=r9;return r13}else if(r8==2239){r8=HEAP32[r11];if((r8|0)!=0){_free(r8)}_free(r2);_free(r1);r13=37272;STACKTOP=r9;return r13}}function _merge_some_cages(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r3=STACKTOP;r4=(r1+32|0)>>2;r5=HEAP32[r4];r6=_malloc(Math.imul(r5<<3,r5));if((r6|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r5=HEAP32[r4];if((r5|0)<=0){_free(r6);STACKTOP=r3;return}r7=r1+24|0;r8=r1+36|0;r9=r1+20|0;r10=(r1+16|0)>>2;r1=r6;r11=r6+4|0;r12=0;r13=r5;while(1){r5=r12+1|0;L3186:do{if((r5|0)<(r13|0)){r14=r5;r15=r13;while(1){r16=HEAP32[r7>>2];r17=HEAP32[r16+(r12<<2)>>2];L3189:do{if((HEAP32[r16+(r14<<2)>>2]+r17|0)<=(HEAP32[r8>>2]|0)&(r17|0)>0){r18=HEAP32[HEAP32[r9>>2]+(r12<<2)>>2];r19=0;while(1){r20=HEAP32[r18+(r19<<2)>>2];r21=(r20|0)/(r2|0)&-1;r22=(r20|0)%(r2|0);if((r21|0)>0){if((HEAP32[HEAP32[r10]+(r20-r2<<2)>>2]|0)==(r14|0)){break}}if((r21+1|0)<(r2|0)){if((HEAP32[HEAP32[r10]+(r20+r2<<2)>>2]|0)==(r14|0)){break}}if((r22|0)>0){if((HEAP32[HEAP32[r10]+(r20-1<<2)>>2]|0)==(r14|0)){break}}if((r22+1|0)<(r2|0)){if((HEAP32[HEAP32[r10]+(r20+1<<2)>>2]|0)==(r14|0)){break}}r20=r19+1|0;if((r20|0)<(r17|0)){r19=r20}else{r23=r15;break L3189}}HEAP32[r1>>2]=r12;HEAP32[r11>>2]=r14;r23=HEAP32[r4]}else{r23=r15}}while(0);r17=r14+1|0;if((r17|0)<(r23|0)){r14=r17;r15=r23}else{r24=r23;break L3186}}}else{r24=r13}}while(0);if((r5|0)<(r24|0)){r12=r5;r13=r24}else{break}}_free(r6);STACKTOP=r3;return}function _gridgen_real(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59;r3=r1>>2;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+12|0;r6=r5;r7=r1|0;r8=HEAP32[r7>>2];r9=(r1+40|0)>>2;if((HEAP32[r9]|0)==0){r10=1;STACKTOP=r5;return r10}r11=HEAP32[r2>>2];if((r11|0)<1){r10=0;STACKTOP=r5;return r10}HEAP32[r2>>2]=r11-1|0;r11=r8+1|0;r12=HEAP32[r9];L3216:do{if((r12|0)>0){r13=HEAP32[r3+9]>>2;r14=HEAP32[HEAP32[r3+1]+16>>2];r15=HEAP32[r3+4];r16=HEAP32[r3+5];r17=HEAP32[r3+6];r18=HEAP32[r3+7];r19=(r18|0)==0;r20=HEAP32[r3+8];r21=(r20|0)==0;r22=(r8|0)<1;r23=r8-1|0;r24=Math.imul(r8,r8)-1|0;r25=r1+8|0;r26=-1;r27=r11;r28=0;r29=-1;r30=-1;r31=0;r32=-1;r33=r18;while(1){r34=HEAP32[((r31*12&-1)>>2)+r13];r35=HEAP32[((r31*12&-1)+4>>2)+r13];r36=Math.imul(r35,r8)+r34|0;r37=HEAP32[r16+(r34<<2)>>2]|HEAP32[r15+(r35<<2)>>2]|HEAP32[r17+(HEAP32[r14+(r36<<2)>>2]<<2)>>2];do{if(r19){r38=r37;r39=r33}else{r40=HEAP32[HEAP32[HEAP32[r25>>2]+16>>2]+(r36<<2)>>2];r41=HEAP32[r18+(r40<<2)>>2]|r37;if((r33|0)==0){r38=r41;r39=0;break}r38=HEAP32[r33+(r40<<2)>>2]|r41;r39=r33}}while(0);do{if(r21){r42=r38}else{if(((r36|0)%(r11|0)|0)==0){r43=HEAP32[r20>>2]|r38}else{r43=r38}if(!(((r36|0)%(r23|0)|0)==0&(r36|0)>0&(r36|0)<(r24|0))){r42=r43;break}r42=HEAP32[r20+4>>2]|r43}}while(0);L3231:do{if(r22){r44=0}else{r36=1;r37=0;while(1){r41=((1<<r36&r42|0)==0&1)+r37|0;r40=r36+1|0;if((r40|0)==(r11|0)){r44=r41;break L3231}else{r36=r40;r37=r41}}}}while(0);do{if((r44|0)<(r27|0)){r45=HEAP32[((r31*12&-1)+8>>2)+r13];r4=2292;break}else{if((r44|0)!=(r27|0)){r46=r32;r47=r30;r48=r29;r49=r28;r50=r27;r51=r26;break}r37=HEAP32[((r31*12&-1)+8>>2)+r13];if((r37|0)<(r28|0)){r45=r37;r4=2292;break}else{r46=r32;r47=r30;r48=r29;r49=r28;r50=r27;r51=r26;break}}}while(0);if(r4==2292){r4=0;r46=r31;r47=r42;r48=r34;r49=r45;r50=r44;r51=r35}r37=r31+1|0;if((r37|0)<(r12|0)){r26=r51;r27=r50;r28=r49;r29=r48;r30=r47;r31=r37;r32=r46;r33=r39}else{r52=r51;r53=r50;r54=r48;r55=r47;r56=r46;break L3216}}}else{r52=-1;r53=r11;r54=-1;r55=-1;r56=-1}}while(0);r46=r12-1|0;if((r56|0)!=(r46|0)){r12=r1+36|0;r47=HEAP32[r12>>2];r48=r6>>2;r6=(r47+(r46*12&-1)|0)>>2;HEAP32[r48]=HEAP32[r6];HEAP32[r48+1]=HEAP32[r6+1];HEAP32[r48+2]=HEAP32[r6+2];r46=(r47+(r56*12&-1)|0)>>2;HEAP32[r6]=HEAP32[r46];HEAP32[r6+1]=HEAP32[r46+1];HEAP32[r6+2]=HEAP32[r46+2];r46=(HEAP32[r12>>2]+(r56*12&-1)|0)>>2;HEAP32[r46]=HEAP32[r48];HEAP32[r46+1]=HEAP32[r48+1];HEAP32[r46+2]=HEAP32[r48+2]}r48=_malloc(r53<<2);if((r48|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r53=r48;L3249:do{if((r8|0)<1){r57=0}else{r46=1;r56=0;while(1){if((1<<r46&r55|0)==0){HEAP32[r53+(r56<<2)>>2]=r46;r58=r56+1|0}else{r58=r56}r12=r46+1|0;if((r12|0)==(r11|0)){r57=r58;break L3249}else{r46=r12;r56=r58}}}}while(0);r58=HEAP32[r3+11];if((r58|0)!=0){_shuffle(r48,r57,4,r58)}L3259:do{if((r57|0)>0){r58=r1+16|0;r3=r1+20|0;r11=r1+4|0;r55=r1+24|0;r8=r1+28|0;r56=r1+32|0;r46=r1+12|0;r12=r1+8|0;r6=0;while(1){r47=HEAP32[r53+(r6<<2)>>2];_gridgen_place(r1,r54,r52,r47&255);HEAP32[r9]=HEAP32[r9]-1|0;if((_gridgen_real(r1,r2)|0)!=0){r59=1;break L3259}r50=1<<(r47&255)^-1;r47=HEAP32[r7>>2];r51=(r52<<2)+HEAP32[r58>>2]|0;HEAP32[r51>>2]=HEAP32[r51>>2]&r50;r51=(r54<<2)+HEAP32[r3>>2]|0;HEAP32[r51>>2]=HEAP32[r51>>2]&r50;r51=Math.imul(r47,r52)+r54|0;r39=(HEAP32[HEAP32[HEAP32[r11>>2]+16>>2]+(r51<<2)>>2]<<2)+HEAP32[r55>>2]|0;HEAP32[r39>>2]=HEAP32[r39>>2]&r50;r39=HEAP32[r8>>2];if((r39|0)!=0){r49=(HEAP32[HEAP32[HEAP32[r12>>2]+16>>2]+(r51<<2)>>2]<<2)+r39|0;HEAP32[r49>>2]=HEAP32[r49>>2]&r50}r49=HEAP32[r56>>2];do{if((r49|0)!=0){if(((r51|0)%(r47+1|0)|0)==0){HEAP32[r49>>2]=HEAP32[r49>>2]&r50}if(!(((r51|0)%(r47-1|0)|0)==0&(r51|0)>0)){break}if((r51|0)>=(Math.imul(r47,r47)-1|0)){break}r39=HEAP32[r56>>2]+4|0;HEAP32[r39>>2]=HEAP32[r39>>2]&r50}}while(0);HEAP8[HEAP32[r46>>2]+r51|0]=0;HEAP32[r9]=HEAP32[r9]+1|0;r50=r6+1|0;if((r50|0)<(r57|0)){r6=r50}else{r59=0;break L3259}}}else{r59=0}}while(0);_free(r48);r10=r59;STACKTOP=r5;return r10}function _divvy_rectangle(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96;r5=0;r6=STACKTOP;r7=Math.imul(r2,r1);r8=(r7|0)/(r3|0)&-1;r9=(r7|0)==(Math.imul(r8,r3)|0);r10=r7<<2;r11=r8<<2;r12=r7<<4;r13=(r7|0)>0;r14=(r8|0)>0;r15=(r7|0)<(r8<<1|0);r16=(r1|0)>0;r17=(r2|0)>0;r18=(r1|0)>1;r19=(r2|0)>1;L3278:while(1){if(!r9){r5=2323;break}r20=_malloc(r10);if((r20|0)==0){r5=2325;break}r21=r20,r22=r21>>2;r23=_malloc(r10);if((r23|0)==0){r5=2327;break}r24=r23,r25=r24>>2;r26=_malloc(r10);if((r26|0)==0){r5=2329;break}r27=r26,r28=r27>>2;r29=_malloc(r11);if((r29|0)==0){r5=2331;break}r30=r29,r31=r30>>2;r32=_malloc(r11);if((r32|0)==0){r5=2333;break}r33=r32>>2;r34=_malloc(r12);if((r34|0)==0){r5=2335;break}r35=r34,r36=r35>>2;r37=_malloc(r10);if((r37|0)==0){r5=2337;break}r38=r37>>2;if(r13){r39=0;while(1){HEAP32[(r39<<2>>2)+r22]=r39;r40=r39+1|0;if((r40|0)==(r7|0)){break}else{r39=r40}}_shuffle(r20,r7,4,r4);_memset(r26,-1,r10)}else{_shuffle(r20,r7,4,r4)}L3294:do{if(r14){r39=0;while(1){HEAP32[(HEAP32[(r39<<2>>2)+r22]<<2>>2)+r28]=r39;HEAP32[(r39<<2>>2)+r31]=1;r40=r39+1|0;if((r40|0)==(r8|0)){r41=0;break L3294}else{r39=r40}}}else{r41=0}}while(0);while(1){if((r41|0)<(r2|0)){L3301:do{if(r16){r39=Math.imul(r41,r1);r40=0;while(1){r42=r40+r39|0;r43=(r42<<2)+r27|0;r44=HEAP32[r43>>2];do{if((r44|0)<0){HEAP32[(r42<<2>>2)+r38]=0}else{if((HEAP32[(r44<<2>>2)+r31]|0)==1){HEAP32[(r42<<2>>2)+r38]=1;break}else{r45=_addremcommon(r1,r2,r40,r41,r27,r44);HEAP32[(r42<<2>>2)+r38]=r45;break}}}while(0);r44=r42<<2;r45=0;while(1){do{if((r45|0)==0){r46=-1;r5=2356}else{r47=(r45|0)==1&1;if((r45|0)==2){r48=-1;r49=r47;break}else{r46=r47;r5=2356;break}}}while(0);if(r5==2356){r5=0;r48=(r45|0)==3&1;r49=r46}r47=r49+r40|0;r50=r48+r41|0;r51=(r45+r44<<2)+r35|0;HEAP32[r51>>2]=-1;do{if((r50|0)<(r2|0)&(((r47|0)>=(r1|0)|(r47|0)<0|(r50|0)<0)^1)){r52=(Math.imul(r50,r1)+r47<<2)+r27|0;r53=HEAP32[r52>>2];if((r53|0)<0){break}if((r53|0)==(HEAP32[r43>>2]|0)){break}if((_addremcommon(r1,r2,r40,r41,r27,r53)|0)==0){break}HEAP32[r51>>2]=r53}}while(0);r51=r45+1|0;if((r51|0)==4){break}else{r45=r51}}r45=r40+1|0;if((r45|0)==(r1|0)){break L3301}else{r40=r45}}}}while(0);r41=r41+1|0;continue}if(r14){r54=0;r55=0}else{r5=2369;break}while(1){if((HEAP32[(r55<<2>>2)+r31]|0)<(r3|0)){HEAP32[(r54<<2>>2)+r25]=r55;r56=r54+1|0}else{r56=r54}r40=r55+1|0;if((r40|0)==(r8|0)){break}else{r54=r56;r55=r40}}if((r56|0)==0){r5=2369;break}else{r57=0}while(1){if((r56>>>(r57>>>0)|0)==0){break}else{r57=r57+1|0}}r40=r57+3|0;if((r40|0)>=32){r5=2372;break L3278}r39=Math.floor((1<<r40>>>0)/(r56>>>0));r45=Math.imul(r39,r56);while(1){r58=_random_bits(r4,r40);if(r58>>>0<r45>>>0){break}}r45=(Math.floor((r58>>>0)/(r39>>>0))<<2)+r24|0;r40=HEAP32[r45>>2];if(r15){r5=2376;break L3278}else{r59=0}while(1){r45=r59<<1;HEAP32[((r45|1)<<2>>2)+r25]=-1;HEAP32[(r45<<2>>2)+r25]=-1;r45=r59+1|0;if((r45|0)==(r8|0)){break}else{r59=r45}}HEAP32[r33]=r40;r39=r40<<1;HEAP32[((r39|1)<<2>>2)+r25]=-2;HEAP32[(r39<<2>>2)+r25]=-2;r39=1;r45=0;L3344:while(1){r60=HEAP32[(r45<<2>>2)+r33];r61=r60<<1;r62=HEAP32[((r61|1)<<2>>2)+r25];r63=(r62|0)>-1;if(r63){r43=(r62<<2)+r27|0;if((HEAP32[r43>>2]|0)!=(r60|0)){r5=2381;break L3278}HEAP32[r43>>2]=-3}L3350:do{if(r13){r43=(r60<<2)+r30|0;r44=r63^1;r42=0;while(1){r51=HEAP32[(r42<<2>>2)+r22];r64=(r51<<2)+r27|0;do{if((HEAP32[r64>>2]|0)==-1){if(!((HEAP32[r43>>2]|0)!=1|r44)){r5=2391;break L3344}r47=r51<<2;if((HEAP32[(r47<<2>>2)+r36]|0)==(r60|0)){if((_addremcommon(r1,r2,(r51|0)%(r1|0),(r51|0)/(r1|0)&-1,r27,r60)|0)!=0){r5=2391;break L3344}}if((HEAP32[((r47|1)<<2>>2)+r36]|0)==(r60|0)){if((_addremcommon(r1,r2,(r51|0)%(r1|0),(r51|0)/(r1|0)&-1,r27,r60)|0)!=0){r5=2391;break L3344}}if((HEAP32[((r47|2)<<2>>2)+r36]|0)==(r60|0)){if((_addremcommon(r1,r2,(r51|0)%(r1|0),(r51|0)/(r1|0)&-1,r27,r60)|0)!=0){r5=2391;break L3344}}if((HEAP32[((r47|3)<<2>>2)+r36]|0)!=(r60|0)){break}if((_addremcommon(r1,r2,(r51|0)%(r1|0),(r51|0)/(r1|0)&-1,r27,r60)|0)!=0){r5=2391;break L3344}}}while(0);r51=r42+1|0;if((r51|0)<(r7|0)){r42=r51}else{r65=r39;r66=0;break}}while(1){r42=(r66<<2)+r21|0;r44=HEAP32[r42>>2];r43=HEAP32[(r44<<2>>2)+r28];L3370:do{if((r43|0)<0){r67=r65}else{r51=r43<<1;r47=(r51<<2)+r24|0;if((HEAP32[r47>>2]|0)!=-1){r67=r65;break}if((HEAP32[(r44<<2>>2)+r38]|0)==0){r67=r65;break}r50=r44<<2;do{if((HEAP32[(r50<<2>>2)+r36]|0)==(r60|0)){if((_addremcommon(r1,r2,(r44|0)%(r1|0),(r44|0)/(r1|0)&-1,r27,r60)|0)==0){r5=2404;break}else{break}}else{r5=2404}}while(0);do{if(r5==2404){r5=0;if((HEAP32[((r50|1)<<2>>2)+r36]|0)==(r60|0)){if((_addremcommon(r1,r2,(r44|0)%(r1|0),(r44|0)/(r1|0)&-1,r27,r60)|0)!=0){break}}if((HEAP32[((r50|2)<<2>>2)+r36]|0)==(r60|0)){if((_addremcommon(r1,r2,(r44|0)%(r1|0),(r44|0)/(r1|0)&-1,r27,r60)|0)!=0){break}}if((HEAP32[((r50|3)<<2>>2)+r36]|0)!=(r60|0)){r67=r65;break L3370}if((_addremcommon(r1,r2,(r44|0)%(r1|0),(r44|0)/(r1|0)&-1,r27,r60)|0)==0){r67=r65;break L3370}}}while(0);if((r65|0)>=(r8|0)){r5=2402;break L3278}HEAP32[(r65<<2>>2)+r33]=r43;HEAP32[r47>>2]=r60;HEAP32[((r51|1)<<2>>2)+r25]=HEAP32[r42>>2];r67=r65+1|0}}while(0);r42=r66+1|0;if((r42|0)<(r7|0)){r65=r67;r66=r42}else{r68=r67;break L3350}}}else{r68=r39}}while(0);if(r63){HEAP32[(r62<<2>>2)+r28]=r60}r42=r45+1|0;if((r42|0)<(r68|0)){r39=r68;r45=r42}else{r69=r68;r70=r42;break}}if(r5==2391){r5=0;if(r63){HEAP32[(r62<<2>>2)+r28]=r60}HEAP32[r64>>2]=r60;r40=HEAP32[(r61<<2>>2)+r25];L3397:do{if((r40|0)==-2){r71=r60}else{r42=r61;r43=r40;while(1){HEAP32[(HEAP32[((r42|1)<<2>>2)+r25]<<2>>2)+r28]=r43;r44=r43<<1;r50=HEAP32[(r44<<2>>2)+r25];if((r50|0)==-2){r71=r43;break L3397}else{r42=r44;r43=r50}}}}while(0);r40=(r71<<2)+r30|0;HEAP32[r40>>2]=HEAP32[r40>>2]+1|0;r69=r39;r70=r45}if((r70|0)==(r69|0)){r72=0;break}else{r41=0}}L3402:do{if(r5==2369){r5=0;L3404:do{if(r13){r30=0;while(1){r33=HEAP32[(r30<<2>>2)+r28];if(!((r33|0)>-1&(r33|0)<(r8|0))){r5=2411;break L3278}HEAP32[(r33<<2>>2)+r25]=r30;r33=r30+1|0;if((r33|0)<(r7|0)){r30=r33}else{break L3404}}}}while(0);r45=_malloc(r10);if((r45|0)==0){r5=2414;break L3278}r39=r45;L3410:do{if(r13){r45=0;while(1){HEAP32[r39+(r45<<2)>>2]=6;r30=r45+1|0;if((r30|0)==(r7|0)){r73=0;break}else{r45=r30}}while(1){_edsf_merge(r39,r73,HEAP32[(HEAP32[(r73<<2>>2)+r28]<<2>>2)+r25],0);r45=r73+1|0;if((r45|0)==(r7|0)){r74=0;break}else{r73=r45}}while(1){HEAP32[(r74<<2>>2)+r25]=6;r45=r74+1|0;if((r45|0)==(r7|0)){break L3410}else{r74=r45}}}}while(0);L3418:do{if(r17){r45=0;while(1){L3421:do{if(r18){r30=Math.imul(r45,r1);r33=0;r27=1;while(1){r36=r33+r30|0;r38=r27+r30|0;if((HEAP32[(r36<<2>>2)+r28]|0)==(HEAP32[(r38<<2>>2)+r28]|0)){_edsf_merge(r24,r36,r38,0)}r38=r27+1|0;if((r38|0)==(r1|0)){break L3421}else{r33=r27;r27=r38}}}}while(0);r27=r45+1|0;if((r27|0)==(r2|0)){break L3418}else{r45=r27}}}}while(0);L3430:do{if(r16){r45=0;while(1){L3433:do{if(r19){r27=0;r33=1;while(1){r30=Math.imul(r27,r1)+r45|0;r38=HEAP32[(r30<<2>>2)+r28];r36=Math.imul(r33,r1)+r45|0;if((r38|0)==(HEAP32[(r36<<2>>2)+r28]|0)){_edsf_merge(r24,r30,r36,0)}r36=r33+1|0;if((r36|0)==(r2|0)){break L3433}else{r27=r33;r33=r36}}}}while(0);r33=r45+1|0;if((r33|0)==(r1|0)){r75=0;break L3430}else{r45=r33}}}else{r75=0}}while(0);while(1){if((r75|0)>=(r7|0)){r72=r39;break L3402}r45=(r75<<2)+r39|0;r33=HEAP32[r45>>2];if((r33&2|0)==0){r27=0;r36=r33;while(1){r76=r36&1^r27;r77=r36>>2;r30=HEAP32[r39+(r77<<2)>>2];if((r30&2|0)==0){r27=r76;r36=r30}else{break}}L3447:do{if((r77|0)==(r75|0)){r78=r76;r79=r75}else{r36=r77<<2;r27=r33>>2;r30=r76^r33&1;HEAP32[r45>>2]=r76|r36;if((r27|0)==(r77|0)){r78=r30;r79=r77;break}else{r80=r27;r81=r30}while(1){r30=(r80<<2)+r39|0;r27=HEAP32[r30>>2];r38=r27>>2;r21=r27&1^r81;HEAP32[r30>>2]=r81|r36;if((r38|0)==(r77|0)){r78=r21;r79=r77;break L3447}else{r80=r38;r81=r21}}}}while(0);if((r78|0)==0){r82=r79}else{r5=2439;break L3278}}else{r82=r75}if((r82|0)<=-1){r5=2442;break L3278}r45=(r82<<2)+r24|0;r33=HEAP32[r45>>2];if((r33&2|0)==0){r36=0;r21=r33;while(1){r83=r21&1^r36;r84=r21>>2;r38=HEAP32[(r84<<2>>2)+r25];if((r38&2|0)==0){r36=r83;r21=r38}else{break}}L3458:do{if((r84|0)==(r82|0)){r85=r83;r86=r82}else{r21=r84<<2;r36=r33>>2;r38=r83^r33&1;HEAP32[r45>>2]=r83|r21;if((r36|0)==(r84|0)){r85=r38;r86=r84;break}else{r87=r36;r88=r38}while(1){r38=(r87<<2)+r24|0;r36=HEAP32[r38>>2];r30=r36>>2;r27=r36&1^r88;HEAP32[r38>>2]=r88|r21;if((r30|0)==(r84|0)){r85=r27;r86=r84;break L3458}else{r87=r30;r88=r27}}}}while(0);if((r85|0)==0){r89=r86}else{r5=2448;break L3278}}else{r89=r82}r45=(r75<<2)+r24|0;r33=HEAP32[r45>>2];if((r33&2|0)==0){r21=0;r27=r33;while(1){r90=r27&1^r21;r91=r27>>2;r30=HEAP32[(r91<<2>>2)+r25];if((r30&2|0)==0){r21=r90;r27=r30}else{break}}L3468:do{if((r91|0)==(r75|0)){r92=r90;r93=r75}else{r27=r91<<2;r21=r33>>2;r30=r90^r33&1;HEAP32[r45>>2]=r90|r27;if((r21|0)==(r91|0)){r92=r30;r93=r91;break}else{r94=r21;r95=r30}while(1){r30=(r94<<2)+r24|0;r21=HEAP32[r30>>2];r38=r21>>2;r36=r21&1^r95;HEAP32[r30>>2]=r95|r27;if((r38|0)==(r91|0)){r92=r36;r93=r91;break L3468}else{r94=r38;r95=r36}}}}while(0);if((r92|0)==0){r96=r93}else{r5=2455;break L3278}}else{r96=r75}if((r89|0)==(r96|0)){r75=r75+1|0}else{r5=2457;break L3278}}}}while(0);_free(r20);_free(r23);_free(r26);_free(r29);_free(r32);_free(r34);_free(r37);if((r72|0)!=0){r5=2469;break}}if(r5==2331){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r5==2402){___assert_func(39196,550,40616,38276)}else if(r5==2381){___assert_func(39196,424,40616,38504)}else if(r5==2329){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r5==2327){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r5==2376){___assert_func(39196,403,40616,38888)}else if(r5==2335){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r5==2372){___assert_func(38372,275,40184,39148)}else if(r5==2411){___assert_func(39196,608,40616,37952)}else if(r5==2414){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r5==2455){___assert_func(39084,137,40572,38864)}else if(r5==2457){___assert_func(39196,632,40616,37472)}else if(r5==2337){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r5==2333){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r5==2469){STACKTOP=r6;return r72}else if(r5==2442){___assert_func(39084,110,40572,39280)}else if(r5==2448){___assert_func(39084,137,40572,38864)}else if(r5==2325){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r5==2439){___assert_func(39084,137,40572,38864)}else if(r5==2323){___assert_func(39196,270,40616,39340)}}function _addremcommon(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r7=0;r8=STACKTOP;STACKTOP=STACKTOP+32|0;r9=r8>>2;r10=0;while(1){r11=r10&3;do{if((r11|0)==2){r12=0;r7=2475}else{if((r10|0)>2){r13=(r10|0)<6?1:-1}else{r13=-1}if((r11|0)==0){r14=0;r15=r13;break}else{r12=r13;r7=2475;break}}}while(0);if(r7==2475){r7=0;r14=(r10|0)<4?-1:1;r15=r12}r11=r15+r3|0;r16=r14+r4|0;if((r16|0)<(r2|0)&(((r11|0)>=(r1|0)|(r11|0)<0|(r16|0)<0)^1)){r17=(Math.imul(r16,r1)+r11<<2)+r5|0;HEAP32[(r10<<2>>2)+r9]=HEAP32[r17>>2]}else{HEAP32[(r10<<2>>2)+r9]=-1}r17=r10+1|0;if((r17|0)==8){break}else{r10=r17}}r10=(HEAP32[r9]|0)==(r6|0);r5=HEAP32[r9+2];do{if(r10){r18=r5}else{if((r5|0)==(r6|0)){r18=r6;break}if((HEAP32[r9+4]|0)==(r6|0)){r18=r5;break}if((HEAP32[r9+6]|0)==(r6|0)){r18=r5;break}else{r19=0}STACKTOP=r8;return r19}}while(0);r5=(HEAP32[r9+1]|0)==(r6|0);r1=(r18|0)==(r6|0);r18=(HEAP32[r9+3]|0)==(r6|0);r2=(HEAP32[r9+4]|0)==(r6|0);r4=(HEAP32[r9+5]|0)==(r6|0);r14=(HEAP32[r9+6]|0)==(r6|0);r3=(HEAP32[r9+7]|0)==(r6|0);r19=(((r3^r10)&1)+((r14^r3)&1)+((r4^r14)&1)+((r2^r4)&1)+((r18^r2)&1)+((r1^r18)&1)+((r5^r1)&1)+((r10^r5)&1)|0)==2&1;STACKTOP=r8;return r19}function _midend_reset_tilesize(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r2=STACKTOP;STACKTOP=STACKTOP+84|0;r3=r2;r4=r2+80;r5=HEAP32[r1+8>>2];r6=r1+128|0;HEAP32[r6>>2]=HEAP32[r5+120>>2];r1=r3|0;_sprintf(r1,38936,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r5>>2],tempInt));r5=HEAP8[r1];L3520:do{if(r5<<24>>24==0){r7=0}else{r8=0;r9=0;r10=r1;r11=r5;while(1){if((_isspace(r11&255)|0)==0){r12=_toupper(HEAPU8[r10])&255;HEAP8[r3+r9|0]=r12;r13=r9+1|0}else{r13=r9}r12=r8+1|0;r14=r3+r12|0;r15=HEAP8[r14];if(r15<<24>>24==0){r7=r13;break L3520}else{r8=r12;r9=r13;r10=r14;r11=r15}}}}while(0);HEAP8[r3+r7|0]=0;r7=_getenv(r1);if((r7|0)==0){STACKTOP=r2;return}r1=(_sscanf(r7,38692,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r4,tempInt))|0)==1;r7=HEAP32[r4>>2];if(!(r1&(r7|0)>0)){STACKTOP=r2;return}HEAP32[r6>>2]=r7;STACKTOP=r2;return}function _status_bar(r1,r2){var r3,r4,r5;r3=r1|0;if((HEAP32[HEAP32[r3>>2]+40>>2]|0)==0){return}r4=HEAP32[r1+24>>2];if((r4|0)==0){___assert_func(39172,198,40044,38880)}r5=_midend_rewrite_statusbar(r4,r2);r2=(r1+28|0)>>2;r4=HEAP32[r2];do{if((r4|0)!=0){if((_strcmp(r5,r4)|0)!=0){break}if((r5|0)==0){return}_free(r5);return}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+40>>2]](HEAP32[r1+4>>2],r5);r1=HEAP32[r2];if((r1|0)!=0){_free(r1)}HEAP32[r2]=r5;return}function _print_mono_colour(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=STACKTOP;r4=r2|0;r2=(r1+12|0)>>2;r5=HEAP32[r2];r6=r1+16|0;do{if((r5|0)<(HEAP32[r6>>2]|0)){r7=r5;r8=HEAP32[r1+8>>2]}else{r9=r5+16|0;HEAP32[r6>>2]=r9;r10=r1+8|0;r11=HEAP32[r10>>2];r12=r9*24&-1;if((r11|0)==0){r13=_malloc(r12)}else{r13=_realloc(r11,r12)}if((r13|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r12=r13;HEAP32[r10>>2]=r12;r7=HEAP32[r2];r8=r12;break}}}while(0);r13=(r1+8|0)>>2;HEAP32[r8+(r7*24&-1)>>2]=-1;HEAP32[HEAP32[r13]+(HEAP32[r2]*24&-1)+4>>2]=0;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+8>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+12>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+16>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+20>>2]=r4;r4=HEAP32[r2];HEAP32[r2]=r4+1|0;STACKTOP=r3;return r4}function _print_grey_colour(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=STACKTOP;r4=(r1+12|0)>>2;r5=HEAP32[r4];r6=r1+16|0;do{if((r5|0)<(HEAP32[r6>>2]|0)){r7=r5;r8=HEAP32[r1+8>>2]}else{r9=r5+16|0;HEAP32[r6>>2]=r9;r10=r1+8|0;r11=HEAP32[r10>>2];r12=r9*24&-1;if((r11|0)==0){r13=_malloc(r12)}else{r13=_realloc(r11,r12)}if((r13|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r12=r13;HEAP32[r10>>2]=r12;r7=HEAP32[r4];r8=r12;break}}}while(0);r13=(r1+8|0)>>2;HEAP32[r8+(r7*24&-1)>>2]=-1;HEAP32[HEAP32[r13]+(HEAP32[r4]*24&-1)+4>>2]=0;HEAPF32[HEAP32[r13]+(HEAP32[r4]*24&-1)+8>>2]=r2;HEAPF32[HEAP32[r13]+(HEAP32[r4]*24&-1)+12>>2]=r2;HEAPF32[HEAP32[r13]+(HEAP32[r4]*24&-1)+16>>2]=r2;HEAPF32[HEAP32[r13]+(HEAP32[r4]*24&-1)+20>>2]=r2;r2=HEAP32[r4];HEAP32[r4]=r2+1|0;STACKTOP=r3;return r2}function _edsf_merge(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r5=r1>>2;if((r2|0)<=-1){___assert_func(39084,110,40572,39280)}r6=HEAP32[(r2<<2>>2)+r5];do{if((r6&2|0)==0){r7=0;r8=r6;while(1){r9=r8&1^r7;r10=r8>>2;r11=HEAP32[(r10<<2>>2)+r5];if((r11&2|0)==0){r7=r9;r8=r11}else{break}}L3585:do{if((r10|0)==(r2|0)){r12=r9;r13=r2}else{r8=r10<<2;r7=r9;r11=r2;r14=r6;while(1){r15=r14>>2;r16=r14&1^r7;HEAP32[(r11<<2>>2)+r5]=r7|r8;if((r15|0)==(r10|0)){r12=r16;r13=r10;break L3585}r7=r16;r11=r15;r14=HEAP32[(r15<<2>>2)+r5]}}}while(0);if((r12|0)==0){r17=r9;r18=r13;r19=HEAP32[(r13<<2>>2)+r5];break}else{___assert_func(39084,137,40572,38864)}}else{r17=0;r18=r2;r19=r6}}while(0);if((r19&2|0)==0){___assert_func(39084,152,40560,38492)}if((r3|0)<=-1){___assert_func(39084,110,40572,39280)}r19=HEAP32[(r3<<2>>2)+r5];do{if((r19&2|0)==0){r6=0;r2=r19;while(1){r20=r2&1^r6;r21=r2>>2;r13=HEAP32[(r21<<2>>2)+r5];if((r13&2|0)==0){r6=r20;r2=r13}else{break}}L3605:do{if((r21|0)==(r3|0)){r22=r20;r23=r3}else{r2=r21<<2;r6=r20;r13=r3;r9=r19;while(1){r12=r9>>2;r10=r9&1^r6;HEAP32[(r13<<2>>2)+r5]=r6|r2;if((r12|0)==(r21|0)){r22=r10;r23=r21;break L3605}r6=r10;r13=r12;r9=HEAP32[(r12<<2>>2)+r5]}}}while(0);if((r22|0)==0){r24=r20;r25=r23;r26=HEAP32[(r23<<2>>2)+r5];break}else{___assert_func(39084,137,40572,38864)}}else{r24=0;r25=r3;r26=r19}}while(0);if((r26&2|0)==0){___assert_func(39084,155,40560,38264)}r26=r17^r4;r4=r24^r26;r17=(r26|0)==(r24|0);do{if((r18|0)==(r25|0)){if(r17){r27=r18;r28=r18;break}___assert_func(39084,161,40560,37940)}else{if(r17|(r4|0)==1){r19=(r18|0)>(r25|0);r3=r19?r18:r25;r23=r19?r25:r18;r19=(r3<<2)+r1|0;r20=(r23<<2)+r1|0;HEAP32[r20>>2]=HEAP32[r20>>2]+(HEAP32[r19>>2]&-4)|0;HEAP32[r19>>2]=r23<<2|(r26|0)!=(r24|0)&1;r27=r23;r28=r3;break}else{___assert_func(39084,163,40560,37440)}}}while(0);if((r28|0)<=-1){___assert_func(39084,110,40572,39280)}r24=HEAP32[(r28<<2>>2)+r5];do{if((r24&2|0)==0){r26=0;r1=r24;while(1){r29=r1&1^r26;r30=r1>>2;r18=HEAP32[(r30<<2>>2)+r5];if((r18&2|0)==0){r26=r29;r1=r18}else{break}}L3633:do{if((r30|0)==(r28|0)){r31=r29;r32=r28}else{r1=r30<<2;r26=r29;r18=r28;r25=r24;while(1){r17=r25>>2;r3=r25&1^r26;HEAP32[(r18<<2>>2)+r5]=r26|r1;if((r17|0)==(r30|0)){r31=r3;r32=r30;break L3633}r26=r3;r18=r17;r25=HEAP32[(r17<<2>>2)+r5]}}}while(0);if((r31|0)==0){r33=r29;r34=r32;break}___assert_func(39084,137,40572,38864)}else{r33=0;r34=r28}}while(0);if((r34|0)!=(r27|0)){___assert_func(39084,188,40560,36984)}if((r33|0)==(r4|0)){return}else{___assert_func(39084,189,40560,36580)}}function _fatal(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3;_fwrite(39008,13,1,HEAP32[_stderr>>2]);HEAP32[r4>>2]=r2;_fprintf(HEAP32[_stderr>>2],r1,HEAP32[r4>>2]);_fputc(10,HEAP32[_stderr>>2]);_exit(1)}function _canvas_text_fallback(r1,r2,r3){r3=STACKTOP;r1=HEAP32[r2>>2];r2=_malloc(_strlen(r1)+1|0);if((r2|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r2,r1);STACKTOP=r3;return r2}}function _init_game(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3,r5=r4>>2;r6=_midend_new(r1,32768,36144,r2);_frontend_set_game_info(r1,r6,39544,1,1,1,0,0,1,1);r7=_midend_num_presets(r6);HEAP32[r5]=r7;L3653:do{if((r7|0)>0){r8=r6+24|0;r9=r6+16|0;r10=r6+12|0;r11=0;while(1){if((HEAP32[r8>>2]|0)<=(r11|0)){break}_frontend_add_preset(r1,HEAP32[HEAP32[r9>>2]+(r11<<2)>>2],HEAP32[HEAP32[r10>>2]+(r11<<2)>>2]);r12=r11+1|0;if((r12|0)<(HEAP32[r5]|0)){r11=r12}else{break L3653}}___assert_func(38480,1021,40364,39108)}}while(0);r1=_midend_colours(r6,r4)>>2;if((HEAP32[r5]|0)>0){r13=0}else{STACKTOP=r3;return}while(1){r4=r13*3&-1;_canvas_set_palette_entry(r2,r13,HEAPF32[(r4<<2>>2)+r1]*255&-1,HEAPF32[(r4+1<<2>>2)+r1]*255&-1,HEAPF32[(r4+2<<2>>2)+r1]*255&-1);r4=r13+1|0;if((r4|0)<(HEAP32[r5]|0)){r13=r4}else{break}}STACKTOP=r3;return}function _midend_new(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r5=STACKTOP;STACKTOP=STACKTOP+80|0;r6=r5;r7=_malloc(152),r8=r7>>2;if((r7|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r9=r7;r10=_malloc(8);if((r10|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_gettimeofday(r10,0);HEAP32[r8]=r1;r1=(r7+8|0)>>2;HEAP32[r1]=r2;r11=_random_new(r10,8);HEAP32[r8+1]=r11;r11=(r7+52|0)>>2;HEAP32[r11]=0;HEAP32[r11+1]=0;HEAP32[r11+2]=0;HEAP32[r11+3]=0;r11=FUNCTION_TABLE[HEAP32[r2+12>>2]]();r2=r7+68|0;HEAP32[r2>>2]=r11;HEAP32[r8+36]=0;HEAP32[r8+37]=0;r11=r6|0;_sprintf(r11,38852,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r1]>>2],tempInt));r12=HEAP8[r11];L3672:do{if(r12<<24>>24==0){r13=0}else{r14=0;r15=0;r16=r11;r17=r12;while(1){if((_isspace(r17&255)|0)==0){r18=_toupper(HEAPU8[r16])&255;HEAP8[r6+r15|0]=r18;r19=r15+1|0}else{r19=r15}r18=r14+1|0;r20=r6+r18|0;r21=HEAP8[r20];if(r21<<24>>24==0){r13=r19;break L3672}else{r14=r18;r15=r19;r16=r20;r17=r21}}}}while(0);HEAP8[r6+r13|0]=0;r13=_getenv(r11);if((r13|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r1]+20>>2]](HEAP32[r2>>2],r13)}HEAP32[r8+18]=0;r13=(r7+32|0)>>2;HEAP32[r13]=0;HEAP32[r13+1]=0;HEAP32[r13+2]=0;HEAP32[r13+3]=0;HEAP32[r8+12]=2;r13=(r7+12|0)>>2;HEAP32[r8+31]=0;HEAP32[r8+35]=0;HEAP32[r8+34]=0;HEAP32[r8+33]=0;HEAP32[r13]=0;HEAP32[r13+1]=0;HEAP32[r13+2]=0;HEAP32[r13+3]=0;HEAP32[r13+4]=0;_memset(r7+76|0,0,44);if((r3|0)==0){HEAP32[r8+30]=0;_midend_reset_tilesize(r9);_free(r10);STACKTOP=r5;return r9}r7=_malloc(32),r13=r7>>2;if((r7|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r13]=r3;HEAP32[r13+1]=r4;HEAP32[r13+2]=0;HEAP32[r13+4]=0;HEAP32[r13+3]=0;HEAPF32[r13+5]=1;HEAP32[r13+6]=r9;HEAP32[r13+7]=0;HEAP32[r8+30]=r7;_midend_reset_tilesize(r9);_free(r10);STACKTOP=r5;return r9}function _midend_can_undo(r1){return(HEAP32[r1+60>>2]|0)>1&1}function _midend_can_redo(r1){return(HEAP32[r1+60>>2]|0)<(HEAP32[r1+52>>2]|0)&1}function _midend_size(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r5=r1>>2;r6=STACKTOP;STACKTOP=STACKTOP+8|0;r7=r6;r8=r6+4;r9=(r1+76|0)>>2;r10=HEAP32[r9];do{if((r10|0)!=0){if((HEAP32[r5+33]|0)<=0){break}r11=r1+8|0;r12=r1+120|0;FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+140>>2]](HEAP32[r12>>2],r10);r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+136>>2]](HEAP32[r12>>2],HEAP32[HEAP32[r5+16]>>2]);HEAP32[r9]=r13}}while(0);r10=(r4|0)!=0;L3697:do{if(r10){r4=r1+8|0;r13=r1+68|0;r12=1;while(1){r11=r12<<1;FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+124>>2]](HEAP32[r13>>2],r11,r7,r8);if((HEAP32[r7>>2]|0)>(HEAP32[r2>>2]|0)){r14=r11;r15=r4,r16=r15>>2;r17=r13,r18=r17>>2;break L3697}if((HEAP32[r8>>2]|0)>(HEAP32[r3>>2]|0)){r14=r11;r15=r4,r16=r15>>2;r17=r13,r18=r17>>2;break L3697}else{r12=r11}}}else{r14=HEAP32[r5+32]+1|0;r15=r1+8|0,r16=r15>>2;r17=r1+68|0,r18=r17>>2}}while(0);r17=1;r15=r14;L3704:while(1){r19=r17;while(1){if((r15-r19|0)<=1){break L3704}r14=(r19+r15|0)/2&-1;FUNCTION_TABLE[HEAP32[HEAP32[r16]+124>>2]](HEAP32[r18],r14,r7,r8);if((HEAP32[r7>>2]|0)>(HEAP32[r2>>2]|0)){r17=r19;r15=r14;continue L3704}if((HEAP32[r8>>2]|0)>(HEAP32[r3>>2]|0)){r17=r19;r15=r14;continue L3704}else{r19=r14}}}r15=r1+132|0;HEAP32[r15>>2]=r19;if(r10){HEAP32[r5+32]=r19}if((r19|0)>0){r10=r1+136|0;r17=r1+140|0;FUNCTION_TABLE[HEAP32[HEAP32[r16]+124>>2]](HEAP32[r18],r19,r10,r17);FUNCTION_TABLE[HEAP32[HEAP32[r16]+128>>2]](HEAP32[r5+30],HEAP32[r9],HEAP32[r18],HEAP32[r15>>2]);r15=r10;r10=r17;r17=HEAP32[r15>>2];HEAP32[r2>>2]=r17;r18=HEAP32[r10>>2];HEAP32[r3>>2]=r18;STACKTOP=r6;return}else{r15=r1+136|0;r10=r1+140|0;r17=HEAP32[r15>>2];HEAP32[r2>>2]=r17;r18=HEAP32[r10>>2];HEAP32[r3>>2]=r18;STACKTOP=r6;return}}function _midend_set_params(r1,r2){var r3,r4;r3=r1+8|0;r4=r1+68|0;FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+28>>2]](HEAP32[r4>>2]);r1=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+32>>2]](r2);HEAP32[r4>>2]=r1;return}function _midend_get_params(r1){return FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+32>>2]](HEAP32[r1+68>>2])}function _midend_force_redraw(r1){var r2,r3,r4,r5,r6,r7;r2=(r1+76|0)>>2;r3=HEAP32[r2];r4=(r1+8|0)>>2;if((r3|0)==0){r5=r1+120|0}else{r6=r1+120|0;FUNCTION_TABLE[HEAP32[HEAP32[r4]+140>>2]](HEAP32[r6>>2],r3);r5=r6}r6=FUNCTION_TABLE[HEAP32[HEAP32[r4]+136>>2]](HEAP32[r5>>2],HEAP32[HEAP32[r1+64>>2]>>2]);HEAP32[r2]=r6;r6=r1+132|0;r3=HEAP32[r6>>2];if((r3|0)<=0){_midend_redraw(r1);return}r7=r1+68|0;FUNCTION_TABLE[HEAP32[HEAP32[r4]+124>>2]](HEAP32[r7>>2],r3,r1+136|0,r1+140|0);FUNCTION_TABLE[HEAP32[HEAP32[r4]+128>>2]](HEAP32[r5>>2],HEAP32[r2],HEAP32[r7>>2],HEAP32[r6>>2]);_midend_redraw(r1);return}function _midend_redraw(r1){var r2,r3,r4,r5,r6,r7,r8;r2=r1>>2;r3=0;r4=(r1+120|0)>>2;r5=HEAP32[r4];if((r5|0)==0){___assert_func(38480,834,40304,36568)}r6=(r1+60|0)>>2;if((HEAP32[r6]|0)<=0){return}r7=(r1+76|0)>>2;if((HEAP32[r7]|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+32>>2]](HEAP32[r5+4>>2]);r5=HEAP32[r2+21];do{if((r5|0)==0){r3=2654}else{r1=HEAPF32[r2+22];if(r1<=0){r3=2654;break}r8=HEAPF32[r2+23];if(r8>=r1){r3=2654;break}r1=HEAP32[r2+26];if((r1|0)==0){___assert_func(38480,840,40304,36264)}else{FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+144>>2]](HEAP32[r4],HEAP32[r7],r5,HEAP32[HEAP32[r2+16]+((HEAP32[r6]-1)*12&-1)>>2],r1,HEAP32[r2+20],r8,HEAPF32[r2+25]);break}}}while(0);if(r3==2654){FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+144>>2]](HEAP32[r4],HEAP32[r7],0,HEAP32[HEAP32[r2+16]+((HEAP32[r6]-1)*12&-1)>>2],1,HEAP32[r2+20],0,HEAPF32[r2+25])}r2=HEAP32[r4];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+36>>2]](HEAP32[r2+4>>2]);return}function _midend_new_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r2=r1>>2;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+20|0;r5=r4;r6=r4+16;r7=(r1+52|0)>>2;r8=HEAP32[r7];L3752:do{if((r8|0)>0){r9=r1+8|0;r10=r1+64|0;r11=r8;while(1){r12=r11-1|0;HEAP32[r7]=r12;FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+68>>2]](HEAP32[HEAP32[r10>>2]+(r12*12&-1)>>2]);r12=HEAP32[r7];r13=HEAP32[HEAP32[r10>>2]+(r12*12&-1)+4>>2];if((r13|0)==0){r14=r12}else{_free(r13);r14=HEAP32[r7]}if((r14|0)>0){r11=r14}else{r15=r14;break L3752}}}else{r15=r8}}while(0);r8=(r1+76|0)>>2;r14=HEAP32[r8];if((r14|0)==0){r16=r15}else{FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+140>>2]](HEAP32[r2+30],r14);r16=HEAP32[r7]}if((r16|0)!=0){___assert_func(38480,360,40348,38244)}r16=(r1+48|0)>>2;r14=HEAP32[r16];do{if((r14|0)==1){HEAP32[r16]=2;break}else if((r14|0)==0){HEAP32[r16]=2;r3=2685;break}else{HEAP8[r5+15|0]=0;r15=r1+4|0;r11=HEAP32[r15>>2];while(1){r17=_random_bits(r11,7);if(r17>>>0<126){break}}r11=Math.floor((r17>>>0)/14)+49&255;r10=r5|0;HEAP8[r10]=r11;r11=1;while(1){r9=HEAP32[r15>>2];while(1){r18=_random_bits(r9,7);if(r18>>>0<120){break}}r9=Math.floor((r18>>>0)/12)+48&255;HEAP8[r5+r11|0]=r9;r9=r11+1|0;if((r9|0)<15){r11=r9}else{break}}r11=r1+40|0;r15=HEAP32[r11>>2];if((r15|0)!=0){_free(r15)}r15=_malloc(_strlen(r10)+1|0);if((r15|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r15,r10);HEAP32[r11>>2]=r15;r15=r1+72|0;r11=HEAP32[r15>>2];r9=r1+8|0;if((r11|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+28>>2]](r11)}r11=FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+32>>2]](HEAP32[r2+17]);HEAP32[r15>>2]=r11;r3=2685;break}}while(0);do{if(r3==2685){r5=r1+32|0;r18=HEAP32[r5>>2];if((r18|0)!=0){_free(r18)}r18=r1+36|0;r17=HEAP32[r18>>2];if((r17|0)!=0){_free(r17)}r17=r1+44|0;r16=HEAP32[r17>>2];if((r16|0)!=0){_free(r16)}HEAP32[r17>>2]=0;r16=HEAP32[r2+10];r14=_random_new(r16,_strlen(r16));r16=FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+52>>2]](HEAP32[r2+18],r14,r17,(HEAP32[r2+30]|0)!=0&1);HEAP32[r5>>2]=r16;HEAP32[r18>>2]=0;if((r14|0)==0){break}_free(r14|0)}}while(0);r14=HEAP32[r7];r18=r1+56|0;do{if((r14|0)<(HEAP32[r18>>2]|0)){r16=r1+64|0,r19=r16>>2}else{r5=r14+128|0;HEAP32[r18>>2]=r5;r17=r1+64|0;r11=HEAP32[r17>>2];r15=r5*12&-1;if((r11|0)==0){r20=_malloc(r15)}else{r20=_realloc(r11,r15)}if((r20|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r17>>2]=r20;r16=r17,r19=r16>>2;break}}}while(0);r20=(r1+8|0)>>2;r18=(r1+68|0)>>2;r14=FUNCTION_TABLE[HEAP32[HEAP32[r20]+60>>2]](r1,HEAP32[r18],HEAP32[r2+8]);HEAP32[HEAP32[r19]+(HEAP32[r7]*12&-1)>>2]=r14;r14=HEAP32[r20];do{if((HEAP32[r14+72>>2]|0)!=0){r16=HEAP32[r2+11];if((r16|0)==0){break}HEAP32[r6>>2]=0;r17=HEAP32[HEAP32[r19]>>2];r15=FUNCTION_TABLE[HEAP32[r14+76>>2]](r17,r17,r16,r6);if(!((r15|0)!=0&(HEAP32[r6>>2]|0)==0)){___assert_func(38480,441,40348,37924)}r16=FUNCTION_TABLE[HEAP32[HEAP32[r20]+116>>2]](HEAP32[HEAP32[r19]>>2],r15);if((r16|0)==0){___assert_func(38480,443,40348,37436)}else{FUNCTION_TABLE[HEAP32[HEAP32[r20]+68>>2]](r16);_free(r15);break}}}while(0);HEAP32[HEAP32[r19]+(HEAP32[r7]*12&-1)+4>>2]=0;HEAP32[HEAP32[r19]+(HEAP32[r7]*12&-1)+8>>2]=0;HEAP32[r7]=HEAP32[r7]+1|0;r7=r1+60|0;HEAP32[r7>>2]=1;r6=r1+120|0;r14=FUNCTION_TABLE[HEAP32[HEAP32[r20]+136>>2]](HEAP32[r6>>2],HEAP32[HEAP32[r19]>>2]);HEAP32[r8]=r14;r14=r1+132|0;r15=HEAP32[r14>>2];if((r15|0)>0){FUNCTION_TABLE[HEAP32[HEAP32[r20]+124>>2]](HEAP32[r18],r15,r1+136|0,r1+140|0);FUNCTION_TABLE[HEAP32[HEAP32[r20]+128>>2]](HEAP32[r6>>2],HEAP32[r8],HEAP32[r18],HEAP32[r14>>2])}HEAPF32[r2+28]=0;r14=r1+80|0;r1=HEAP32[r14>>2];if((r1|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r20]+96>>2]](r1)}r1=FUNCTION_TABLE[HEAP32[HEAP32[r20]+92>>2]](HEAP32[HEAP32[r19]>>2]);HEAP32[r14>>2]=r1;r14=HEAP32[r20];do{if((HEAP32[r14+180>>2]|0)==0){HEAP32[r2+27]=0;r3=2715;break}else{r20=(FUNCTION_TABLE[HEAP32[r14+184>>2]](HEAP32[HEAP32[r19]+((HEAP32[r7>>2]-1)*12&-1)>>2],r1)|0)!=0;HEAP32[r2+27]=r20&1;if(r20){r3=2717;break}else{r3=2715;break}}}while(0);do{if(r3==2715){if(HEAPF32[r2+24]!=0){r3=2717;break}if(HEAPF32[r2+22]!=0){r3=2717;break}_deactivate_timer(HEAP32[r2]);break}}while(0);if(r3==2717){_activate_timer(HEAP32[r2])}HEAP32[r2+31]=0;r3=HEAP32[r2+36];if((r3|0)==0){STACKTOP=r4;return}FUNCTION_TABLE[r3](HEAP32[r2+37]);STACKTOP=r4;return}function _midend_finish_move(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r2=r1>>2;r3=0;r4=(r1+84|0)>>2;r5=HEAP32[r4];r6=(r5|0)==0;do{if(r6){if((HEAP32[r2+15]|0)>1){r3=2726;break}else{break}}else{r3=2726}}while(0);do{if(r3==2726){r7=HEAP32[r2+26];if((r7|0)>0){r8=HEAP32[r2+15];r9=HEAP32[r2+16];if((HEAP32[r9+((r8-1)*12&-1)+8>>2]|0)==1){r10=r8;r11=r9}else{break}}else{if((r7|0)>=0){break}r9=HEAP32[r2+15];if((r9|0)>=(HEAP32[r2+13]|0)){break}r8=HEAP32[r2+16];if((HEAP32[r8+(r9*12&-1)+8>>2]|0)==1){r10=r9;r11=r8}else{break}}if(r6){r12=1;r13=HEAP32[r11+((r10-2)*12&-1)>>2]}else{r12=r7;r13=r5}r7=FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+152>>2]](r13,HEAP32[r11+((r10-1)*12&-1)>>2],r12,HEAP32[r2+20]);if(r7<=0){break}HEAPF32[r2+25]=0;HEAPF32[r2+24]=r7}}while(0);r12=HEAP32[r4];r10=r1+8|0;if((r12|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+68>>2]](r12)}HEAP32[r4]=0;r4=r1+88|0;HEAPF32[r4>>2]=0;HEAPF32[r2+23]=0;HEAP32[r2+26]=0;r1=HEAP32[r10>>2];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=2741;break}else{r10=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r2+16]+((HEAP32[r2+15]-1)*12&-1)>>2],HEAP32[r2+20])|0)!=0;HEAP32[r2+27]=r10&1;if(r10){break}else{r3=2741;break}}}while(0);do{if(r3==2741){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r4>>2]!=0){break}_deactivate_timer(HEAP32[r2]);return}}while(0);_activate_timer(HEAP32[r2]);return}function _midend_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12;r5=r1>>2;r6=(r4-515|0)>>>0<3;do{if(r6|(r4-518|0)>>>0<3){r7=HEAP32[r5+31];if((r7|0)==0){r8=1;return r8}if(r6){r9=1;r10=r7+3|0;break}else{r9=1;r10=r7+6|0;break}}else{if((r4-512|0)>>>0>=3){r9=1;r10=r4;break}r7=HEAP32[r5+31];if((r7|0)==0){r9=1;r10=r4;break}if((HEAP32[HEAP32[r5+2]+188>>2]&1<<r4-2048+(r7*3&-1)|0)==0){r9=(_midend_really_process_key(r1,r2,r3,r7+6|0)|0)!=0&1;r10=r4;break}else{r8=1;return r8}}}while(0);if((r10|0)==13|(r10|0)==10){r11=525}else{r11=r10}r10=(r11|0)==32?526:r11;r11=(r10|0)==127?8:r10;if((r9|0)==0){r12=0}else{r12=(_midend_really_process_key(r1,r2,r3,r11)|0)!=0}r3=r12&1;if((r11-518|0)>>>0<3){HEAP32[r5+31]=0;r8=r3;return r8}if((r11-512|0)>>>0>=3){r8=r3;return r8}HEAP32[r5+31]=r11;r8=r3;return r8}function _midend_restart_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r2=r1>>2;r3=0;r4=STACKTOP;r5=r1+84|0;do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=2773;break}else{break}}else{r3=2773}}while(0);if(r3==2773){_midend_finish_move(r1);_midend_redraw(r1)}r6=(r1+60|0)>>2;r7=HEAP32[r6];if((r7|0)<=0){___assert_func(38480,551,40284,36964)}if((r7|0)==1){STACKTOP=r4;return}r7=(r1+8|0)>>2;r8=r1+32|0;r9=FUNCTION_TABLE[HEAP32[HEAP32[r7]+60>>2]](r1,HEAP32[r2+17],HEAP32[r8>>2]);do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=2779;break}else{break}}else{r3=2779}}while(0);if(r3==2779){_midend_finish_move(r1);_midend_redraw(r1)}r5=(r1+52|0)>>2;r10=HEAP32[r5];L3919:do{if((r10|0)>(HEAP32[r6]|0)){r11=r1+64|0;r12=r10;while(1){r13=HEAP32[HEAP32[r7]+68>>2];r14=r12-1|0;HEAP32[r5]=r14;FUNCTION_TABLE[r13](HEAP32[HEAP32[r11>>2]+(r14*12&-1)>>2]);r14=HEAP32[r5];r13=HEAP32[HEAP32[r11>>2]+(r14*12&-1)+4>>2];if((r13|0)==0){r15=r14}else{_free(r13);r15=HEAP32[r5]}if((r15|0)>(HEAP32[r6]|0)){r12=r15}else{r16=r15;break L3919}}}else{r16=r10}}while(0);r10=r1+56|0;do{if((r16|0)<(HEAP32[r10>>2]|0)){r17=r16;r18=HEAP32[r2+16]}else{r15=r16+128|0;HEAP32[r10>>2]=r15;r12=r1+64|0;r11=HEAP32[r12>>2];r13=r15*12&-1;if((r11|0)==0){r19=_malloc(r13)}else{r19=_realloc(r11,r13)}if((r19|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r13=r19;HEAP32[r12>>2]=r13;r17=HEAP32[r5];r18=r13;break}}}while(0);r19=(r1+64|0)>>2;HEAP32[r18+(r17*12&-1)>>2]=r9;r9=HEAP32[r8>>2];r8=_malloc(_strlen(r9)+1|0);if((r8|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r8,r9);HEAP32[HEAP32[r19]+(HEAP32[r5]*12&-1)+4>>2]=r8;HEAP32[HEAP32[r19]+(HEAP32[r5]*12&-1)+8>>2]=3;r8=HEAP32[r5];r9=r8+1|0;HEAP32[r5]=r9;HEAP32[r6]=r9;r9=r1+80|0;r5=HEAP32[r9>>2];if((r5|0)!=0){r17=HEAP32[r19];FUNCTION_TABLE[HEAP32[HEAP32[r7]+108>>2]](r5,HEAP32[r17+((r8-1)*12&-1)>>2],HEAP32[r17+(r8*12&-1)>>2])}r8=r1+88|0;HEAPF32[r8>>2]=0;_midend_finish_move(r1);_midend_redraw(r1);r1=HEAP32[r7];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=2800;break}else{r7=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r19]+((HEAP32[r6]-1)*12&-1)>>2],HEAP32[r9>>2])|0)!=0;HEAP32[r2+27]=r7&1;if(r7){break}else{r3=2800;break}}}while(0);do{if(r3==2800){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r8>>2]!=0){break}_deactivate_timer(HEAP32[r2]);STACKTOP=r4;return}}while(0);_activate_timer(HEAP32[r2]);STACKTOP=r4;return}function _midend_timer(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=r1>>2;r4=0;r5=r1+88|0;r6=HEAPF32[r5>>2];r7=r6>0;if(r7){r8=1}else{r8=HEAPF32[r3+24]>0}r9=r1+92|0;r10=HEAPF32[r9>>2]+r2;HEAPF32[r9>>2]=r10;do{if(r10>=r6|r6==0){if(r7){r4=2813;break}else{break}}else{if((HEAP32[r3+21]|0)!=0|r7^1){break}else{r4=2813;break}}}while(0);if(r4==2813){_midend_finish_move(r1)}r7=(r1+100|0)>>2;r6=HEAPF32[r7]+r2;HEAPF32[r7]=r6;r10=(r1+96|0)>>2;r9=HEAPF32[r10];if(r6>=r9|r9==0){HEAPF32[r10]=0;HEAPF32[r7]=0}if(r8){_midend_redraw(r1)}r8=(r1+108|0)>>2;do{if((HEAP32[r8]|0)!=0){r7=r1+112|0;r9=HEAPF32[r7>>2];r6=r9+r2;HEAPF32[r7>>2]=r6;if((r9&-1|0)==(r6&-1|0)){break}r6=HEAP32[r3+29];_status_bar(HEAP32[r3+30],(r6|0)==0?39060:r6)}}while(0);r2=HEAP32[r3+2];do{if((HEAP32[r2+180>>2]|0)==0){HEAP32[r8]=0;r4=2824;break}else{r1=(FUNCTION_TABLE[HEAP32[r2+184>>2]](HEAP32[HEAP32[r3+16]+((HEAP32[r3+15]-1)*12&-1)>>2],HEAP32[r3+20])|0)!=0;HEAP32[r8]=r1&1;if(r1){break}else{r4=2824;break}}}while(0);do{if(r4==2824){if(HEAPF32[r10]!=0){break}if(HEAPF32[r5>>2]!=0){break}_deactivate_timer(HEAP32[r3]);return}}while(0);_activate_timer(HEAP32[r3]);return}function _midend_colours(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r3=STACKTOP;STACKTOP=STACKTOP+92|0;r4=r3;r5=r3+80;r6=r3+84;r7=r3+88;r8=r1+8|0;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+132>>2]](HEAP32[r1>>2],r2),r1=r9>>2;if((HEAP32[r2>>2]|0)<=0){STACKTOP=r3;return r9}r10=r4|0;r11=0;while(1){_sprintf(r10,39364,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r8>>2]>>2],HEAP32[tempInt+4>>2]=r11,tempInt));r12=HEAP8[r10];L3990:do{if(r12<<24>>24==0){r13=0}else{r14=0;r15=0;r16=r10;r17=r12;while(1){if((_isspace(r17&255)|0)==0){r18=_toupper(HEAPU8[r16])&255;HEAP8[r4+r15|0]=r18;r19=r15+1|0}else{r19=r15}r18=r14+1|0;r20=r4+r18|0;r21=HEAP8[r20];if(r21<<24>>24==0){r13=r19;break L3990}else{r14=r18;r15=r19;r16=r20;r17=r21}}}}while(0);HEAP8[r4+r13|0]=0;r12=_getenv(r10);do{if((r12|0)!=0){if((_sscanf(r12,39184,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r6,HEAP32[tempInt+8>>2]=r7,tempInt))|0)!=3){break}r17=r11*3&-1;HEAPF32[(r17<<2>>2)+r1]=(HEAP32[r5>>2]>>>0)/255;HEAPF32[(r17+1<<2>>2)+r1]=(HEAP32[r6>>2]>>>0)/255;HEAPF32[(r17+2<<2>>2)+r1]=(HEAP32[r7>>2]>>>0)/255}}while(0);r12=r11+1|0;if((r12|0)<(HEAP32[r2>>2]|0)){r11=r12}else{break}}STACKTOP=r3;return r9}function _midend_really_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r5=r1>>2;r6=0;r7=STACKTOP;r8=(r1+8|0)>>2;r9=(r1+60|0)>>2;r10=(r1+64|0)>>2;r11=FUNCTION_TABLE[HEAP32[HEAP32[r8]+64>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2]);r12=(r1+80|0)>>2;r13=FUNCTION_TABLE[HEAP32[HEAP32[r8]+112>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12],HEAP32[r5+19],r2,r3,r4);L4003:do{if((r13|0)==0){if((r4|0)==110|(r4|0)==78|(r4|0)==14){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=2848;break}else{break}}else{r6=2848}}while(0);if(r6==2848){_midend_finish_move(r1);_midend_redraw(r1)}_midend_new_game(r1);_midend_redraw(r1);r14=1;r6=2912;break}else if((r4|0)==114|(r4|0)==82|(r4|0)==25|(r4|0)==18){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=2858;break}else{break}}else{r6=2858}}while(0);if(r6==2858){_midend_finish_move(r1);_midend_redraw(r1)}r3=HEAP32[r9];if((r3|0)>=(HEAP32[r5+13]|0)){r14=1;r6=2912;break}r2=HEAP32[r12];if((r2|0)==0){r15=r3}else{r16=HEAP32[r10];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r2,HEAP32[r16+((r3-1)*12&-1)>>2],HEAP32[r16+(r3*12&-1)>>2]);r15=HEAP32[r9]}HEAP32[r9]=r15+1|0;HEAP32[r5+26]=1;r6=2897;break}else if((r4|0)==113|(r4|0)==81|(r4|0)==17){r14=0;r6=2912;break}else if((r4|0)==19){if((HEAP32[HEAP32[r8]+72>>2]|0)==0){r14=1;r6=2912;break}if((_midend_solve(r1)|0)==0){r6=2897;break}else{r14=1;r6=2912;break}}else if((r4|0)==117|(r4|0)==85|(r4|0)==31|(r4|0)==26){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=2852;break}else{break}}else{r6=2852}}while(0);if(r6==2852){_midend_finish_move(r1);_midend_redraw(r1)}r3=HEAP32[r9];r16=r3-1|0;r2=HEAP32[r10]>>2;r17=HEAP32[((r16*12&-1)+8>>2)+r2];if((r3|0)<=1){r14=1;r6=2912;break}r18=HEAP32[r12];if((r18|0)==0){r19=r3}else{FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r18,HEAP32[((r16*12&-1)>>2)+r2],HEAP32[(((r3-2)*12&-1)>>2)+r2]);r19=HEAP32[r9]}r2=r19-1|0;HEAP32[r9]=r2;HEAP32[r5+26]=-1;r20=r17;r21=r2;break}else{r14=1;r6=2912;break}}else{do{if(HEAP8[r13]<<24>>24==0){r2=HEAP32[r9];r17=HEAP32[r10];r22=HEAP32[r17+((r2-1)*12&-1)>>2];r23=r2;r24=r17}else{r17=FUNCTION_TABLE[HEAP32[HEAP32[r8]+116>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],r13);if((r17|0)==0){___assert_func(38480,629,40320,36900)}else{r22=r17;r23=HEAP32[r9];r24=HEAP32[r10];break}}}while(0);if((r22|0)==(HEAP32[r24+((r23-1)*12&-1)>>2]|0)){_midend_redraw(r1);r17=HEAP32[r8];do{if((HEAP32[r17+180>>2]|0)==0){HEAP32[r5+27]=0;r6=2875;break}else{r2=(FUNCTION_TABLE[HEAP32[r17+184>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12])|0)!=0;HEAP32[r5+27]=r2&1;if(r2){break}else{r6=2875;break}}}while(0);do{if(r6==2875){if(HEAPF32[r5+24]!=0){break}if(HEAPF32[r5+22]!=0){break}_deactivate_timer(HEAP32[r5]);r14=1;r6=2912;break L4003}}while(0);_activate_timer(HEAP32[r5]);r14=1;r6=2912;break}if((r22|0)==0){r14=1;r6=2912;break}do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=2882;break}else{r25=r23;break}}else{r6=2882}}while(0);if(r6==2882){_midend_finish_move(r1);_midend_redraw(r1);r25=HEAP32[r9]}r17=(r1+52|0)>>2;r2=HEAP32[r17];L4060:do{if((r2|0)>(r25|0)){r3=r2;while(1){r16=HEAP32[HEAP32[r8]+68>>2];r18=r3-1|0;HEAP32[r17]=r18;FUNCTION_TABLE[r16](HEAP32[HEAP32[r10]+(r18*12&-1)>>2]);r18=HEAP32[r17];r16=HEAP32[HEAP32[r10]+(r18*12&-1)+4>>2];if((r16|0)==0){r26=r18}else{_free(r16);r26=HEAP32[r17]}if((r26|0)>(HEAP32[r9]|0)){r3=r26}else{r27=r26;break L4060}}}else{r27=r2}}while(0);r2=r1+56|0;do{if((r27|0)>=(HEAP32[r2>>2]|0)){r3=r27+128|0;HEAP32[r2>>2]=r3;r16=HEAP32[r10];r18=r3*12&-1;if((r16|0)==0){r28=_malloc(r18)}else{r28=_realloc(r16,r18)}if((r28|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r10]=r28;break}}}while(0);HEAP32[HEAP32[r10]+(HEAP32[r17]*12&-1)>>2]=r22;HEAP32[HEAP32[r10]+(HEAP32[r17]*12&-1)+4>>2]=r13;HEAP32[HEAP32[r10]+(HEAP32[r17]*12&-1)+8>>2]=1;r2=HEAP32[r17];r18=r2+1|0;HEAP32[r17]=r18;HEAP32[r9]=r18;HEAP32[r5+26]=1;r18=HEAP32[r12];if((r18|0)==0){r6=2897;break}r16=HEAP32[r10];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r18,HEAP32[r16+((r2-1)*12&-1)>>2],HEAP32[r16+(r2*12&-1)>>2]);r6=2897;break}}while(0);if(r6==2912){if((r11|0)==0){r29=r14;STACKTOP=r7;return r29}FUNCTION_TABLE[HEAP32[HEAP32[r8]+68>>2]](r11);r29=r14;STACKTOP=r7;return r29}else if(r6==2897){r14=HEAP32[r9];r20=HEAP32[HEAP32[r10]+((r14-1)*12&-1)+8>>2];r21=r14}do{if((r20|0)==1){r30=HEAP32[r8];r6=2902;break}else if((r20|0)==2){r14=HEAP32[r8];if((HEAP32[r14+188>>2]&512|0)==0){r6=2901;break}else{r30=r14;r6=2902;break}}else{r6=2901}}while(0);do{if(r6==2901){HEAP32[r5+21]=r11;r31=r1+88|0;r6=2904;break}else if(r6==2902){r20=FUNCTION_TABLE[HEAP32[r30+148>>2]](r11,HEAP32[HEAP32[r10]+((r21-1)*12&-1)>>2],HEAP32[r5+26],HEAP32[r12]);HEAP32[r5+21]=r11;r14=r1+88|0;if(r20<=0){r31=r14;r6=2904;break}HEAPF32[r14>>2]=r20;r32=r14;break}}while(0);if(r6==2904){HEAPF32[r31>>2]=0;_midend_finish_move(r1);r32=r31}HEAPF32[r5+23]=0;_midend_redraw(r1);r1=HEAP32[r8];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r5+27]=0;r6=2908;break}else{r8=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12])|0)!=0;HEAP32[r5+27]=r8&1;if(r8){break}else{r6=2908;break}}}while(0);do{if(r6==2908){if(HEAPF32[r5+24]!=0){break}if(HEAPF32[r32>>2]!=0){break}_deactivate_timer(HEAP32[r5]);r29=1;STACKTOP=r7;return r29}}while(0);_activate_timer(HEAP32[r5]);r29=1;STACKTOP=r7;return r29}function _midend_wants_statusbar(r1){return HEAP32[HEAP32[r1+8>>2]+176>>2]}function _midend_which_preset(r1){var r2,r3,r4,r5;r2=FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+24>>2]](HEAP32[r1+68>>2],1);r3=r1+20|0;r4=HEAP32[r1+24>>2];r1=0;while(1){if((r1|0)>=(r4|0)){r5=-1;break}if((_strcmp(r2,HEAP32[HEAP32[r3>>2]+(r1<<2)>>2])|0)==0){r5=r1;break}else{r1=r1+1|0}}if((r2|0)==0){return r5}_free(r2);return r5}function _midend_status(r1){var r2,r3;r2=HEAP32[r1+60>>2];if((r2|0)==0){r3=1;return r3}r3=FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+156>>2]](HEAP32[HEAP32[r1+64>>2]+((r2-1)*12&-1)>>2]);return r3}function _midend_num_presets(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+88|0;r4=r3;r5=r3+4;r6=r3+8;r7=(r1+24|0)>>2;r8=(r1+8|0)>>2;L4122:do{if((HEAP32[r7]|0)==0){if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+16>>2]](0,r4,r5)|0)==0){break}r9=(r1+28|0)>>2;r10=(r1+12|0)>>2;r11=(r1+16|0)>>2;r12=(r1+20|0)>>2;while(1){r13=HEAP32[r7];if((HEAP32[r9]|0)>(r13|0)){r14=r13}else{r15=r13+10|0;HEAP32[r9]=r15;r13=HEAP32[r10];r16=r15<<2;if((r13|0)==0){r17=_malloc(r16)}else{r17=_realloc(r13,r16)}if((r17|0)==0){r2=2941;break}HEAP32[r10]=r17;r16=HEAP32[r11];r13=HEAP32[r9]<<2;if((r16|0)==0){r18=_malloc(r13)}else{r18=_realloc(r16,r13)}if((r18|0)==0){r2=2946;break}HEAP32[r11]=r18;r13=HEAP32[r12];r16=HEAP32[r9]<<2;if((r13|0)==0){r19=_malloc(r16)}else{r19=_realloc(r13,r16)}if((r19|0)==0){r2=2951;break}HEAP32[r12]=r19;r14=HEAP32[r7]}HEAP32[HEAP32[r10]+(r14<<2)>>2]=HEAP32[r5>>2];HEAP32[HEAP32[r11]+(HEAP32[r7]<<2)>>2]=HEAP32[r4>>2];r16=FUNCTION_TABLE[HEAP32[HEAP32[r8]+24>>2]](HEAP32[r5>>2],1);HEAP32[HEAP32[r12]+(HEAP32[r7]<<2)>>2]=r16;r16=HEAP32[r7]+1|0;HEAP32[r7]=r16;if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+16>>2]](r16,r4,r5)|0)==0){break L4122}}if(r2==2951){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==2946){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==2941){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}}while(0);r5=r6|0;_sprintf(r5,39160,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r8]>>2],tempInt));r4=HEAP8[r5];L4150:do{if(r4<<24>>24==0){r20=0}else{r14=0;r19=0;r18=r5;r17=r4;while(1){if((_isspace(r17&255)|0)==0){r12=_toupper(HEAPU8[r18])&255;HEAP8[r6+r14|0]=r12;r21=r14+1|0}else{r21=r14}r12=r19+1|0;r11=r6+r12|0;r10=HEAP8[r11];if(r10<<24>>24==0){r20=r21;break L4150}else{r14=r21;r19=r12;r18=r11;r17=r10}}}}while(0);HEAP8[r6+r20|0]=0;r20=_getenv(r5);if((r20|0)==0){r22=HEAP32[r7];STACKTOP=r3;return r22}r5=_malloc(_strlen(r20)+1|0);if((r5|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r20);r20=HEAP8[r5];L4163:do{if(r20<<24>>24!=0){r6=(r1+28|0)>>2;r21=(r1+12|0)>>2;r4=(r1+16|0)>>2;r17=(r1+20|0)>>2;r18=r5;r19=r20;while(1){r14=r18;r10=r19;while(1){r23=r10<<24>>24==0;r24=r14+1|0;if(!(r10<<24>>24!=58&(r23^1))){break}r14=r24;r10=HEAP8[r24]}if(r23){r25=r14}else{HEAP8[r14]=0;r25=r24}r10=r25;while(1){r11=HEAP8[r10];r26=r11<<24>>24==0;r27=r10+1|0;if(r11<<24>>24!=58&(r26^1)){r10=r27}else{break}}if(r26){r28=r10}else{HEAP8[r10]=0;r28=r27}r14=FUNCTION_TABLE[HEAP32[HEAP32[r8]+12>>2]]();FUNCTION_TABLE[HEAP32[HEAP32[r8]+20>>2]](r14,r25);if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+48>>2]](r14,1)|0)==0){r11=HEAP32[r7];if((HEAP32[r6]|0)>(r11|0)){r29=r11}else{r12=r11+10|0;HEAP32[r6]=r12;r11=HEAP32[r21];r9=r12<<2;if((r11|0)==0){r30=_malloc(r9)}else{r30=_realloc(r11,r9)}if((r30|0)==0){r2=2980;break}HEAP32[r21]=r30;r9=HEAP32[r4];r11=HEAP32[r6]<<2;if((r9|0)==0){r31=_malloc(r11)}else{r31=_realloc(r9,r11)}if((r31|0)==0){r2=2985;break}HEAP32[r4]=r31;r11=HEAP32[r17];r9=HEAP32[r6]<<2;if((r11|0)==0){r32=_malloc(r9)}else{r32=_realloc(r11,r9)}if((r32|0)==0){r2=2990;break}HEAP32[r17]=r32;r29=HEAP32[r7]}HEAP32[HEAP32[r21]+(r29<<2)>>2]=r14;r9=_malloc(_strlen(r18)+1|0);if((r9|0)==0){r2=2993;break}_strcpy(r9,r18);HEAP32[HEAP32[r4]+(HEAP32[r7]<<2)>>2]=r9;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8]+24>>2]](r14,1);HEAP32[HEAP32[r17]+(HEAP32[r7]<<2)>>2]=r9;HEAP32[r7]=HEAP32[r7]+1|0}else{FUNCTION_TABLE[HEAP32[HEAP32[r8]+28>>2]](r14)}r14=HEAP8[r28];if(r14<<24>>24==0){break L4163}else{r18=r28;r19=r14}}if(r2==2993){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==2985){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==2980){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==2990){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}}while(0);_free(r5);r22=HEAP32[r7];STACKTOP=r3;return r22}function _midend_solve(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r2=r1>>2;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+4|0;r5=r4,r6=r5>>2;r7=(r1+8|0)>>2;r8=HEAP32[r7];if((HEAP32[r8+72>>2]|0)==0){r9=38620;STACKTOP=r4;return r9}r10=(r1+60|0)>>2;r11=HEAP32[r10];if((r11|0)<1){r9=38588;STACKTOP=r4;return r9}HEAP32[r6]=0;r12=(r1+64|0)>>2;r13=HEAP32[r12];r14=FUNCTION_TABLE[HEAP32[r8+76>>2]](HEAP32[r13>>2],HEAP32[r13+((r11-1)*12&-1)>>2],HEAP32[r2+11],r5);if((r14|0)==0){r5=HEAP32[r6];if((r5|0)!=0){r9=r5;STACKTOP=r4;return r9}HEAP32[r6]=38548;r9=38548;STACKTOP=r4;return r9}r6=FUNCTION_TABLE[HEAP32[HEAP32[r7]+116>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-1)*12&-1)>>2],r14);if((r6|0)==0){___assert_func(38480,1364,40268,37436)}r5=r1+84|0;do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=3008;break}else{break}}else{r3=3008}}while(0);if(r3==3008){_midend_finish_move(r1);_midend_redraw(r1)}r11=(r1+52|0)>>2;r13=HEAP32[r11];L4232:do{if((r13|0)>(HEAP32[r10]|0)){r8=r13;while(1){r15=HEAP32[HEAP32[r7]+68>>2];r16=r8-1|0;HEAP32[r11]=r16;FUNCTION_TABLE[r15](HEAP32[HEAP32[r12]+(r16*12&-1)>>2]);r16=HEAP32[r11];r15=HEAP32[HEAP32[r12]+(r16*12&-1)+4>>2];if((r15|0)==0){r17=r16}else{_free(r15);r17=HEAP32[r11]}if((r17|0)>(HEAP32[r10]|0)){r8=r17}else{r18=r17;break L4232}}}else{r18=r13}}while(0);r13=r1+56|0;do{if((r18|0)<(HEAP32[r13>>2]|0)){r19=r18;r20=HEAP32[r12]}else{r17=r18+128|0;HEAP32[r13>>2]=r17;r8=HEAP32[r12];r15=r17*12&-1;if((r8|0)==0){r21=_malloc(r15)}else{r21=_realloc(r8,r15)}if((r21|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r15=r21;HEAP32[r12]=r15;r19=HEAP32[r11];r20=r15;break}}}while(0);HEAP32[r20+(r19*12&-1)>>2]=r6;HEAP32[HEAP32[r12]+(HEAP32[r11]*12&-1)+4>>2]=r14;HEAP32[HEAP32[r12]+(HEAP32[r11]*12&-1)+8>>2]=2;r14=HEAP32[r11];r6=r14+1|0;HEAP32[r11]=r6;HEAP32[r10]=r6;r6=(r1+80|0)>>2;r11=HEAP32[r6];if((r11|0)!=0){r19=HEAP32[r12];FUNCTION_TABLE[HEAP32[HEAP32[r7]+108>>2]](r11,HEAP32[r19+((r14-1)*12&-1)>>2],HEAP32[r19+(r14*12&-1)>>2])}HEAP32[r2+26]=1;r14=HEAP32[r7];if((HEAP32[r14+188>>2]&512|0)==0){HEAPF32[r2+22]=0;_midend_finish_move(r1)}else{r19=FUNCTION_TABLE[HEAP32[r14+64>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-2)*12&-1)>>2]);HEAP32[r5>>2]=r19;r19=HEAP32[r10];r5=HEAP32[r12];r14=FUNCTION_TABLE[HEAP32[HEAP32[r7]+148>>2]](HEAP32[r5+((r19-2)*12&-1)>>2],HEAP32[r5+((r19-1)*12&-1)>>2],1,HEAP32[r6]);HEAPF32[r2+22]=r14;HEAPF32[r2+23]=0}if((HEAP32[r2+30]|0)!=0){_midend_redraw(r1)}r1=HEAP32[r7];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=3031;break}else{r7=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-1)*12&-1)>>2],HEAP32[r6])|0)!=0;HEAP32[r2+27]=r7&1;if(r7){break}else{r3=3031;break}}}while(0);do{if(r3==3031){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r2+22]!=0){break}_deactivate_timer(HEAP32[r2]);r9=0;STACKTOP=r4;return r9}}while(0);_activate_timer(HEAP32[r2]);r9=0;STACKTOP=r4;return r9}function _midend_rewrite_statusbar(r1,r2){var r3,r4,r5,r6,r7;r3=STACKTOP;STACKTOP=STACKTOP+100|0;r4=r3;r5=r1+116|0;r6=HEAP32[r5>>2];do{if((r6|0)!=(r2|0)){if((r6|0)!=0){_free(r6)}r7=_malloc(_strlen(r2)+1|0);if((r7|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r7,r2);HEAP32[r5>>2]=r7;break}}}while(0);if((HEAP32[HEAP32[r1+8>>2]+180>>2]|0)==0){r5=_malloc(_strlen(r2)+1|0);if((r5|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r2);r6=r5;STACKTOP=r3;return r6}else{r5=HEAPF32[r1+112>>2]&-1;r1=r4|0;_sprintf(r1,38520,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=(r5|0)/60&-1,HEAP32[tempInt+4>>2]=(r5|0)%60,tempInt));r5=_malloc(_strlen(r1)+_strlen(r2)+1|0);if((r5|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r1);_strcat(r5,r2);r6=r5;STACKTOP=r3;return r6}}function _shuffle(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+512|0;if((r2|0)<=1){STACKTOP=r6;return}r7=r6|0;r8=(r3|0)>0;r9=r2;while(1){r2=0;while(1){if((r9>>>(r2>>>0)|0)==0){break}else{r2=r2+1|0}}r10=r9-1|0;r11=r2+3|0;if((r11|0)>=32){r5=3063;break}r12=Math.floor((1<<r11>>>0)/(r9>>>0));r13=Math.imul(r12,r9);while(1){r14=_random_bits(r4,r11);if(r14>>>0<r13>>>0){break}}r13=Math.floor((r14>>>0)/(r12>>>0));L4304:do{if((r13|0)!=(r10|0)){if(!r8){break}r11=Math.imul(r13,r3);r2=r1+Math.imul(r10,r3)|0;r15=r1+r11|0;r11=r3;while(1){r16=r11>>>0<512?r11:512;_memcpy(r7,r2,r16);_memcpy(r2,r15,r16);_memcpy(r15,r7,r16);r17=r11-r16|0;if((r17|0)>0){r2=r2+r16|0;r15=r15+r16|0;r11=r17}else{break L4304}}}}while(0);if((r10|0)>1){r9=r10}else{r5=3072;break}}if(r5==3063){___assert_func(38372,275,40184,39148)}else if(r5==3072){STACKTOP=r6;return}}function _SHA_Bytes(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+384|0;r6=r5,r7=r6>>2;r8=r5+320;r9=r1+92|0;r10=_llvm_uadd_with_overflow_i32(HEAP32[r9>>2],r3);HEAP32[r9>>2]=r10;r10=r1+88|0;HEAP32[r10>>2]=(tempRet0&1)+HEAP32[r10>>2]|0;r10=(r1+84|0)>>2;r9=HEAP32[r10];r11=r9+r3|0;do{if((r9|0)==0){if((r11|0)>63){r4=3076;break}else{r12=r2;r13=r3;break}}else{if((r11|0)>=64){r4=3076;break}_memcpy(r1+(r9+20)|0,r2,r3);r14=HEAP32[r10]+r3|0;HEAP32[r10]=r14;STACKTOP=r5;return}}while(0);L4319:do{if(r4==3076){r11=r1|0;r15=r6;r16=r8;r17=r1+4|0;r18=r1+8|0;r19=r1+12|0;r20=r1+16|0;r21=r2;r22=r3;r23=r9;while(1){_memcpy(r1+(r23+20)|0,r21,64-r23|0);r24=64-HEAP32[r10]|0;r25=r21+r24|0;r26=0;while(1){r27=r26<<2;HEAP32[r8+(r26<<2)>>2]=HEAPU8[(r27|1)+r1+20|0]<<16|HEAPU8[r1+(r27+20)|0]<<24|HEAPU8[(r27|2)+r1+20|0]<<8|HEAPU8[(r27|3)+r1+20|0];r27=r26+1|0;if((r27|0)==16){break}else{r26=r27}}_memcpy(r15,r16,64);r26=16;while(1){r27=HEAP32[(r26-8<<2>>2)+r7]^HEAP32[(r26-3<<2>>2)+r7]^HEAP32[(r26-14<<2>>2)+r7]^HEAP32[(r26-16<<2>>2)+r7];HEAP32[(r26<<2>>2)+r7]=r27<<1|r27>>>31;r27=r26+1|0;if((r27|0)==80){break}else{r26=r27}}r26=HEAP32[r11>>2];r27=HEAP32[r17>>2];r28=HEAP32[r18>>2];r29=HEAP32[r19>>2];r30=HEAP32[r20>>2];r31=0;r32=r30;r33=r29;r34=r28;r35=r27;r36=r26;while(1){r37=(r36<<5|r36>>>27)+r32+(r33&(r35^-1)|r34&r35)+HEAP32[(r31<<2>>2)+r7]+1518500249|0;r38=r35<<30|r35>>>2;r39=r31+1|0;if((r39|0)==20){r40=20;r41=r33;r42=r34;r43=r38;r44=r36;r45=r37;break}else{r31=r39;r32=r33;r33=r34;r34=r38;r35=r36;r36=r37}}while(1){r36=(r45<<5|r45>>>27)+r41+(r43^r44^r42)+HEAP32[(r40<<2>>2)+r7]+1859775393|0;r35=r44<<30|r44>>>2;r34=r40+1|0;if((r34|0)==40){r46=40;r47=r42;r48=r43;r49=r35;r50=r45;r51=r36;break}else{r40=r34;r41=r42;r42=r43;r43=r35;r44=r45;r45=r36}}while(1){r36=(r51<<5|r51>>>27)-1894007588+r47+((r48|r49)&r50|r48&r49)+HEAP32[(r46<<2>>2)+r7]|0;r35=r50<<30|r50>>>2;r34=r46+1|0;if((r34|0)==60){r52=60;r53=r48;r54=r49;r55=r35;r56=r51;r57=r36;break}else{r46=r34;r47=r48;r48=r49;r49=r35;r50=r51;r51=r36}}while(1){r58=(r57<<5|r57>>>27)-899497514+r53+(r55^r56^r54)+HEAP32[(r52<<2>>2)+r7]|0;r59=r56<<30|r56>>>2;r36=r52+1|0;if((r36|0)==80){break}else{r52=r36;r53=r54;r54=r55;r55=r59;r56=r57;r57=r58}}r36=r22-r24|0;HEAP32[r11>>2]=r58+r26|0;HEAP32[r17>>2]=r57+r27|0;HEAP32[r18>>2]=r59+r28|0;HEAP32[r19>>2]=r55+r29|0;HEAP32[r20>>2]=r54+r30|0;HEAP32[r10]=0;if((r36|0)>63){r21=r25;r22=r36;r23=0}else{r12=r25;r13=r36;break L4319}}}}while(0);_memcpy(r1+20|0,r12,r13);r14=r13;HEAP32[r10]=r14;STACKTOP=r5;return}function _SHA_Final(r1,r2){var r3,r4,r5,r6,r7,r8;r3=STACKTOP;STACKTOP=STACKTOP+64|0;r4=r3;r5=HEAP32[r1+84>>2];r6=((r5|0)>55?120:56)-r5|0;r5=HEAP32[r1+88>>2];r7=HEAP32[r1+92>>2];r8=r4|0;_memset(r8,0,r6);HEAP8[r8]=-128;_SHA_Bytes(r1,r8,r6);HEAP8[r8]=r5>>>21&255;HEAP8[r4+1|0]=r5>>>13&255;HEAP8[r4+2|0]=r5>>>5&255;HEAP8[r4+3|0]=(r7>>>29|r5<<3)&255;HEAP8[r4+4|0]=r7>>>21&255;HEAP8[r4+5|0]=r7>>>13&255;HEAP8[r4+6|0]=r7>>>5&255;HEAP8[r4+7|0]=r7<<3&255;_SHA_Bytes(r1,r8,8);r8=(r1|0)>>2;HEAP8[r2]=HEAP32[r8]>>>24&255;HEAP8[r2+1|0]=HEAP32[r8]>>>16&255;HEAP8[r2+2|0]=HEAP32[r8]>>>8&255;HEAP8[r2+3|0]=HEAP32[r8]&255;r8=(r1+4|0)>>2;HEAP8[r2+4|0]=HEAP32[r8]>>>24&255;HEAP8[r2+5|0]=HEAP32[r8]>>>16&255;HEAP8[r2+6|0]=HEAP32[r8]>>>8&255;HEAP8[r2+7|0]=HEAP32[r8]&255;r8=(r1+8|0)>>2;HEAP8[r2+8|0]=HEAP32[r8]>>>24&255;HEAP8[r2+9|0]=HEAP32[r8]>>>16&255;HEAP8[r2+10|0]=HEAP32[r8]>>>8&255;HEAP8[r2+11|0]=HEAP32[r8]&255;r8=(r1+12|0)>>2;HEAP8[r2+12|0]=HEAP32[r8]>>>24&255;HEAP8[r2+13|0]=HEAP32[r8]>>>16&255;HEAP8[r2+14|0]=HEAP32[r8]>>>8&255;HEAP8[r2+15|0]=HEAP32[r8]&255;r8=(r1+16|0)>>2;HEAP8[r2+16|0]=HEAP32[r8]>>>24&255;HEAP8[r2+17|0]=HEAP32[r8]>>>16&255;HEAP8[r2+18|0]=HEAP32[r8]>>>8&255;HEAP8[r2+19|0]=HEAP32[r8]&255;STACKTOP=r3;return}function _random_bits(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+96|0;r5=r4;if((r2|0)<=0){r6=0;r7=r2-1|0;r8=2<<r7;r9=r8-1|0;r10=r6&r9;STACKTOP=r4;return r10}r11=(r1+60|0)>>2;r12=r1|0;r13=r1+40|0;r14=r5|0;r15=r5+4|0;r16=r5+8|0;r17=r5+12|0;r18=r5+16|0;r19=r5+84|0;r20=r5+92|0;r21=r5+88|0;r22=0;r23=0;r24=HEAP32[r11];while(1){if((r24|0)>19){r25=0;while(1){r26=r1+r25|0;r27=HEAP8[r26];if(r27<<24>>24!=-1){r3=3098;break}HEAP8[r26]=0;r28=r25+1|0;if((r28|0)<20){r25=r28}else{break}}if(r3==3098){r3=0;HEAP8[r26]=r27+1&255}HEAP32[r14>>2]=1732584193;HEAP32[r15>>2]=-271733879;HEAP32[r16>>2]=-1732584194;HEAP32[r17>>2]=271733878;HEAP32[r18>>2]=-1009589776;HEAP32[r19>>2]=0;HEAP32[r20>>2]=0;HEAP32[r21>>2]=0;_SHA_Bytes(r5,r12,40);_SHA_Final(r5,r13);HEAP32[r11]=0;r29=0}else{r29=r24}r25=r29+1|0;HEAP32[r11]=r25;r28=HEAPU8[r1+(r29+40)|0]|r22<<8;r30=r23+8|0;if((r30|0)<(r2|0)){r22=r28;r23=r30;r24=r25}else{r6=r28;break}}r7=r2-1|0;r8=2<<r7;r9=r8-1|0;r10=r6&r9;STACKTOP=r4;return r10}function _random_new(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=STACKTOP;STACKTOP=STACKTOP+288|0;r4=r3,r5=r4>>2;r6=r3+96,r7=r6>>2;r8=r3+192,r9=r8>>2;r10=_malloc(64);if((r10|0)==0){_fatal(38992,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r9]=1732584193;HEAP32[r9+1]=-271733879;HEAP32[r9+2]=-1732584194;HEAP32[r9+3]=271733878;HEAP32[r9+4]=-1009589776;HEAP32[r9+21]=0;HEAP32[r9+23]=0;HEAP32[r9+22]=0;_SHA_Bytes(r8,r1,r2);_SHA_Final(r8,r10);HEAP32[r7]=1732584193;HEAP32[r7+1]=-271733879;HEAP32[r7+2]=-1732584194;HEAP32[r7+3]=271733878;HEAP32[r7+4]=-1009589776;HEAP32[r7+21]=0;HEAP32[r7+23]=0;HEAP32[r7+22]=0;_SHA_Bytes(r6,r10,20);_SHA_Final(r6,r10+20|0);HEAP32[r5]=1732584193;HEAP32[r5+1]=-271733879;HEAP32[r5+2]=-1732584194;HEAP32[r5+3]=271733878;HEAP32[r5+4]=-1009589776;HEAP32[r5+21]=0;HEAP32[r5+23]=0;HEAP32[r5+22]=0;_SHA_Bytes(r4,r10,40);_SHA_Final(r4,r10+40|0);HEAP32[r10+60>>2]=0;STACKTOP=r3;return r10}}function _malloc(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95;r2=0;do{if(r1>>>0<245){if(r1>>>0<11){r3=16}else{r3=r1+11&-8}r4=r3>>>3;r5=HEAP32[9888];r6=r5>>>(r4>>>0);if((r6&3|0)!=0){r7=(r6&1^1)+r4|0;r8=r7<<1;r9=(r8<<2)+39592|0;r10=(r8+2<<2)+39592|0;r8=HEAP32[r10>>2];r11=r8+8|0;r12=HEAP32[r11>>2];do{if((r9|0)==(r12|0)){HEAP32[9888]=r5&(1<<r7^-1)}else{if(r12>>>0<HEAP32[9892]>>>0){_abort()}r13=r12+12|0;if((HEAP32[r13>>2]|0)==(r8|0)){HEAP32[r13>>2]=r9;HEAP32[r10>>2]=r12;break}else{_abort()}}}while(0);r12=r7<<3;HEAP32[r8+4>>2]=r12|3;r10=r8+(r12|4)|0;HEAP32[r10>>2]=HEAP32[r10>>2]|1;r14=r11;return r14}if(r3>>>0<=HEAP32[9890]>>>0){r15=r3,r16=r15>>2;break}if((r6|0)!=0){r10=2<<r4;r12=r6<<r4&(r10|-r10);r10=(r12&-r12)-1|0;r12=r10>>>12&16;r9=r10>>>(r12>>>0);r10=r9>>>5&8;r13=r9>>>(r10>>>0);r9=r13>>>2&4;r17=r13>>>(r9>>>0);r13=r17>>>1&2;r18=r17>>>(r13>>>0);r17=r18>>>1&1;r19=(r10|r12|r9|r13|r17)+(r18>>>(r17>>>0))|0;r17=r19<<1;r18=(r17<<2)+39592|0;r13=(r17+2<<2)+39592|0;r17=HEAP32[r13>>2];r9=r17+8|0;r12=HEAP32[r9>>2];do{if((r18|0)==(r12|0)){HEAP32[9888]=r5&(1<<r19^-1)}else{if(r12>>>0<HEAP32[9892]>>>0){_abort()}r10=r12+12|0;if((HEAP32[r10>>2]|0)==(r17|0)){HEAP32[r10>>2]=r18;HEAP32[r13>>2]=r12;break}else{_abort()}}}while(0);r12=r19<<3;r13=r12-r3|0;HEAP32[r17+4>>2]=r3|3;r18=r17;r5=r18+r3|0;HEAP32[r18+(r3|4)>>2]=r13|1;HEAP32[r18+r12>>2]=r13;r12=HEAP32[9890];if((r12|0)!=0){r18=HEAP32[9893];r4=r12>>>3;r12=r4<<1;r6=(r12<<2)+39592|0;r11=HEAP32[9888];r8=1<<r4;do{if((r11&r8|0)==0){HEAP32[9888]=r11|r8;r20=r6;r21=(r12+2<<2)+39592|0}else{r4=(r12+2<<2)+39592|0;r7=HEAP32[r4>>2];if(r7>>>0>=HEAP32[9892]>>>0){r20=r7;r21=r4;break}_abort()}}while(0);HEAP32[r21>>2]=r18;HEAP32[r20+12>>2]=r18;HEAP32[r18+8>>2]=r20;HEAP32[r18+12>>2]=r6}HEAP32[9890]=r13;HEAP32[9893]=r5;r14=r9;return r14}r12=HEAP32[9889];if((r12|0)==0){r15=r3,r16=r15>>2;break}r8=(r12&-r12)-1|0;r12=r8>>>12&16;r11=r8>>>(r12>>>0);r8=r11>>>5&8;r17=r11>>>(r8>>>0);r11=r17>>>2&4;r19=r17>>>(r11>>>0);r17=r19>>>1&2;r4=r19>>>(r17>>>0);r19=r4>>>1&1;r7=HEAP32[((r8|r12|r11|r17|r19)+(r4>>>(r19>>>0))<<2)+39856>>2];r19=r7;r4=r7,r17=r4>>2;r11=(HEAP32[r7+4>>2]&-8)-r3|0;while(1){r7=HEAP32[r19+16>>2];if((r7|0)==0){r12=HEAP32[r19+20>>2];if((r12|0)==0){break}else{r22=r12}}else{r22=r7}r7=(HEAP32[r22+4>>2]&-8)-r3|0;r12=r7>>>0<r11>>>0;r19=r22;r4=r12?r22:r4,r17=r4>>2;r11=r12?r7:r11}r19=r4;r9=HEAP32[9892];if(r19>>>0<r9>>>0){_abort()}r5=r19+r3|0;r13=r5;if(r19>>>0>=r5>>>0){_abort()}r5=HEAP32[r17+6];r6=HEAP32[r17+3];L4416:do{if((r6|0)==(r4|0)){r18=r4+20|0;r7=HEAP32[r18>>2];do{if((r7|0)==0){r12=r4+16|0;r8=HEAP32[r12>>2];if((r8|0)==0){r23=0,r24=r23>>2;break L4416}else{r25=r8;r26=r12;break}}else{r25=r7;r26=r18}}while(0);while(1){r18=r25+20|0;r7=HEAP32[r18>>2];if((r7|0)!=0){r25=r7;r26=r18;continue}r18=r25+16|0;r7=HEAP32[r18>>2];if((r7|0)==0){break}else{r25=r7;r26=r18}}if(r26>>>0<r9>>>0){_abort()}else{HEAP32[r26>>2]=0;r23=r25,r24=r23>>2;break}}else{r18=HEAP32[r17+2];if(r18>>>0<r9>>>0){_abort()}r7=r18+12|0;if((HEAP32[r7>>2]|0)!=(r4|0)){_abort()}r12=r6+8|0;if((HEAP32[r12>>2]|0)==(r4|0)){HEAP32[r7>>2]=r6;HEAP32[r12>>2]=r18;r23=r6,r24=r23>>2;break}else{_abort()}}}while(0);L4438:do{if((r5|0)!=0){r6=r4+28|0;r9=(HEAP32[r6>>2]<<2)+39856|0;do{if((r4|0)==(HEAP32[r9>>2]|0)){HEAP32[r9>>2]=r23;if((r23|0)!=0){break}HEAP32[9889]=HEAP32[9889]&(1<<HEAP32[r6>>2]^-1);break L4438}else{if(r5>>>0<HEAP32[9892]>>>0){_abort()}r18=r5+16|0;if((HEAP32[r18>>2]|0)==(r4|0)){HEAP32[r18>>2]=r23}else{HEAP32[r5+20>>2]=r23}if((r23|0)==0){break L4438}}}while(0);if(r23>>>0<HEAP32[9892]>>>0){_abort()}HEAP32[r24+6]=r5;r6=HEAP32[r17+4];do{if((r6|0)!=0){if(r6>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r24+4]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);r6=HEAP32[r17+5];if((r6|0)==0){break}if(r6>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r24+5]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);if(r11>>>0<16){r5=r11+r3|0;HEAP32[r17+1]=r5|3;r6=r5+(r19+4)|0;HEAP32[r6>>2]=HEAP32[r6>>2]|1}else{HEAP32[r17+1]=r3|3;HEAP32[r19+(r3|4)>>2]=r11|1;HEAP32[r19+r11+r3>>2]=r11;r6=HEAP32[9890];if((r6|0)!=0){r5=HEAP32[9893];r9=r6>>>3;r6=r9<<1;r18=(r6<<2)+39592|0;r12=HEAP32[9888];r7=1<<r9;do{if((r12&r7|0)==0){HEAP32[9888]=r12|r7;r27=r18;r28=(r6+2<<2)+39592|0}else{r9=(r6+2<<2)+39592|0;r8=HEAP32[r9>>2];if(r8>>>0>=HEAP32[9892]>>>0){r27=r8;r28=r9;break}_abort()}}while(0);HEAP32[r28>>2]=r5;HEAP32[r27+12>>2]=r5;HEAP32[r5+8>>2]=r27;HEAP32[r5+12>>2]=r18}HEAP32[9890]=r11;HEAP32[9893]=r13}r6=r4+8|0;if((r6|0)==0){r15=r3,r16=r15>>2;break}else{r14=r6}return r14}else{if(r1>>>0>4294967231){r15=-1,r16=r15>>2;break}r6=r1+11|0;r7=r6&-8,r12=r7>>2;r19=HEAP32[9889];if((r19|0)==0){r15=r7,r16=r15>>2;break}r17=-r7|0;r9=r6>>>8;do{if((r9|0)==0){r29=0}else{if(r7>>>0>16777215){r29=31;break}r6=(r9+1048320|0)>>>16&8;r8=r9<<r6;r10=(r8+520192|0)>>>16&4;r30=r8<<r10;r8=(r30+245760|0)>>>16&2;r31=14-(r10|r6|r8)+(r30<<r8>>>15)|0;r29=r7>>>((r31+7|0)>>>0)&1|r31<<1}}while(0);r9=HEAP32[(r29<<2)+39856>>2];L4486:do{if((r9|0)==0){r32=0;r33=r17;r34=0}else{if((r29|0)==31){r35=0}else{r35=25-(r29>>>1)|0}r4=0;r13=r17;r11=r9,r18=r11>>2;r5=r7<<r35;r31=0;while(1){r8=HEAP32[r18+1]&-8;r30=r8-r7|0;if(r30>>>0<r13>>>0){if((r8|0)==(r7|0)){r32=r11;r33=r30;r34=r11;break L4486}else{r36=r11;r37=r30}}else{r36=r4;r37=r13}r30=HEAP32[r18+5];r8=HEAP32[((r5>>>31<<2)+16>>2)+r18];r6=(r30|0)==0|(r30|0)==(r8|0)?r31:r30;if((r8|0)==0){r32=r36;r33=r37;r34=r6;break L4486}else{r4=r36;r13=r37;r11=r8,r18=r11>>2;r5=r5<<1;r31=r6}}}}while(0);if((r34|0)==0&(r32|0)==0){r9=2<<r29;r17=r19&(r9|-r9);if((r17|0)==0){r15=r7,r16=r15>>2;break}r9=(r17&-r17)-1|0;r17=r9>>>12&16;r31=r9>>>(r17>>>0);r9=r31>>>5&8;r5=r31>>>(r9>>>0);r31=r5>>>2&4;r11=r5>>>(r31>>>0);r5=r11>>>1&2;r18=r11>>>(r5>>>0);r11=r18>>>1&1;r38=HEAP32[((r9|r17|r31|r5|r11)+(r18>>>(r11>>>0))<<2)+39856>>2]}else{r38=r34}L4501:do{if((r38|0)==0){r39=r33;r40=r32,r41=r40>>2}else{r11=r38,r18=r11>>2;r5=r33;r31=r32;while(1){r17=(HEAP32[r18+1]&-8)-r7|0;r9=r17>>>0<r5>>>0;r13=r9?r17:r5;r17=r9?r11:r31;r9=HEAP32[r18+4];if((r9|0)!=0){r11=r9,r18=r11>>2;r5=r13;r31=r17;continue}r9=HEAP32[r18+5];if((r9|0)==0){r39=r13;r40=r17,r41=r40>>2;break L4501}else{r11=r9,r18=r11>>2;r5=r13;r31=r17}}}}while(0);if((r40|0)==0){r15=r7,r16=r15>>2;break}if(r39>>>0>=(HEAP32[9890]-r7|0)>>>0){r15=r7,r16=r15>>2;break}r19=r40,r31=r19>>2;r5=HEAP32[9892];if(r19>>>0<r5>>>0){_abort()}r11=r19+r7|0;r18=r11;if(r19>>>0>=r11>>>0){_abort()}r17=HEAP32[r41+6];r13=HEAP32[r41+3];L4514:do{if((r13|0)==(r40|0)){r9=r40+20|0;r4=HEAP32[r9>>2];do{if((r4|0)==0){r6=r40+16|0;r8=HEAP32[r6>>2];if((r8|0)==0){r42=0,r43=r42>>2;break L4514}else{r44=r8;r45=r6;break}}else{r44=r4;r45=r9}}while(0);while(1){r9=r44+20|0;r4=HEAP32[r9>>2];if((r4|0)!=0){r44=r4;r45=r9;continue}r9=r44+16|0;r4=HEAP32[r9>>2];if((r4|0)==0){break}else{r44=r4;r45=r9}}if(r45>>>0<r5>>>0){_abort()}else{HEAP32[r45>>2]=0;r42=r44,r43=r42>>2;break}}else{r9=HEAP32[r41+2];if(r9>>>0<r5>>>0){_abort()}r4=r9+12|0;if((HEAP32[r4>>2]|0)!=(r40|0)){_abort()}r6=r13+8|0;if((HEAP32[r6>>2]|0)==(r40|0)){HEAP32[r4>>2]=r13;HEAP32[r6>>2]=r9;r42=r13,r43=r42>>2;break}else{_abort()}}}while(0);L4536:do{if((r17|0)!=0){r13=r40+28|0;r5=(HEAP32[r13>>2]<<2)+39856|0;do{if((r40|0)==(HEAP32[r5>>2]|0)){HEAP32[r5>>2]=r42;if((r42|0)!=0){break}HEAP32[9889]=HEAP32[9889]&(1<<HEAP32[r13>>2]^-1);break L4536}else{if(r17>>>0<HEAP32[9892]>>>0){_abort()}r9=r17+16|0;if((HEAP32[r9>>2]|0)==(r40|0)){HEAP32[r9>>2]=r42}else{HEAP32[r17+20>>2]=r42}if((r42|0)==0){break L4536}}}while(0);if(r42>>>0<HEAP32[9892]>>>0){_abort()}HEAP32[r43+6]=r17;r13=HEAP32[r41+4];do{if((r13|0)!=0){if(r13>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r43+4]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);r13=HEAP32[r41+5];if((r13|0)==0){break}if(r13>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r43+5]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);do{if(r39>>>0<16){r17=r39+r7|0;HEAP32[r41+1]=r17|3;r13=r17+(r19+4)|0;HEAP32[r13>>2]=HEAP32[r13>>2]|1}else{HEAP32[r41+1]=r7|3;HEAP32[((r7|4)>>2)+r31]=r39|1;HEAP32[(r39>>2)+r31+r12]=r39;r13=r39>>>3;if(r39>>>0<256){r17=r13<<1;r5=(r17<<2)+39592|0;r9=HEAP32[9888];r6=1<<r13;do{if((r9&r6|0)==0){HEAP32[9888]=r9|r6;r46=r5;r47=(r17+2<<2)+39592|0}else{r13=(r17+2<<2)+39592|0;r4=HEAP32[r13>>2];if(r4>>>0>=HEAP32[9892]>>>0){r46=r4;r47=r13;break}_abort()}}while(0);HEAP32[r47>>2]=r18;HEAP32[r46+12>>2]=r18;HEAP32[r12+(r31+2)]=r46;HEAP32[r12+(r31+3)]=r5;break}r17=r11;r6=r39>>>8;do{if((r6|0)==0){r48=0}else{if(r39>>>0>16777215){r48=31;break}r9=(r6+1048320|0)>>>16&8;r13=r6<<r9;r4=(r13+520192|0)>>>16&4;r8=r13<<r4;r13=(r8+245760|0)>>>16&2;r30=14-(r4|r9|r13)+(r8<<r13>>>15)|0;r48=r39>>>((r30+7|0)>>>0)&1|r30<<1}}while(0);r6=(r48<<2)+39856|0;HEAP32[r12+(r31+7)]=r48;HEAP32[r12+(r31+5)]=0;HEAP32[r12+(r31+4)]=0;r5=HEAP32[9889];r30=1<<r48;if((r5&r30|0)==0){HEAP32[9889]=r5|r30;HEAP32[r6>>2]=r17;HEAP32[r12+(r31+6)]=r6;HEAP32[r12+(r31+3)]=r17;HEAP32[r12+(r31+2)]=r17;break}if((r48|0)==31){r49=0}else{r49=25-(r48>>>1)|0}r30=r39<<r49;r5=HEAP32[r6>>2];while(1){if((HEAP32[r5+4>>2]&-8|0)==(r39|0)){break}r50=(r30>>>31<<2)+r5+16|0;r6=HEAP32[r50>>2];if((r6|0)==0){r2=3258;break}else{r30=r30<<1;r5=r6}}if(r2==3258){if(r50>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r50>>2]=r17;HEAP32[r12+(r31+6)]=r5;HEAP32[r12+(r31+3)]=r17;HEAP32[r12+(r31+2)]=r17;break}}r30=r5+8|0;r6=HEAP32[r30>>2];r13=HEAP32[9892];if(r5>>>0<r13>>>0){_abort()}if(r6>>>0<r13>>>0){_abort()}else{HEAP32[r6+12>>2]=r17;HEAP32[r30>>2]=r17;HEAP32[r12+(r31+2)]=r6;HEAP32[r12+(r31+3)]=r5;HEAP32[r12+(r31+6)]=0;break}}}while(0);r31=r40+8|0;if((r31|0)==0){r15=r7,r16=r15>>2;break}else{r14=r31}return r14}}while(0);r40=HEAP32[9890];if(r15>>>0<=r40>>>0){r50=r40-r15|0;r39=HEAP32[9893];if(r50>>>0>15){r49=r39;HEAP32[9893]=r49+r15|0;HEAP32[9890]=r50;HEAP32[(r49+4>>2)+r16]=r50|1;HEAP32[r49+r40>>2]=r50;HEAP32[r39+4>>2]=r15|3}else{HEAP32[9890]=0;HEAP32[9893]=0;HEAP32[r39+4>>2]=r40|3;r50=r40+(r39+4)|0;HEAP32[r50>>2]=HEAP32[r50>>2]|1}r14=r39+8|0;return r14}r39=HEAP32[9891];if(r15>>>0<r39>>>0){r50=r39-r15|0;HEAP32[9891]=r50;r39=HEAP32[9894];r40=r39;HEAP32[9894]=r40+r15|0;HEAP32[(r40+4>>2)+r16]=r50|1;HEAP32[r39+4>>2]=r15|3;r14=r39+8|0;return r14}do{if((HEAP32[8902]|0)==0){r39=_sysconf(8);if((r39-1&r39|0)==0){HEAP32[8904]=r39;HEAP32[8903]=r39;HEAP32[8905]=-1;HEAP32[8906]=2097152;HEAP32[8907]=0;HEAP32[9999]=0;r39=_time(0)&-16^1431655768;HEAP32[8902]=r39;break}else{_abort()}}}while(0);r39=r15+48|0;r50=HEAP32[8904];r40=r15+47|0;r49=r50+r40|0;r48=-r50|0;r50=r49&r48;if(r50>>>0<=r15>>>0){r14=0;return r14}r46=HEAP32[9998];do{if((r46|0)!=0){r47=HEAP32[9996];r41=r47+r50|0;if(r41>>>0<=r47>>>0|r41>>>0>r46>>>0){r14=0}else{break}return r14}}while(0);L4628:do{if((HEAP32[9999]&4|0)==0){r46=HEAP32[9894];L4630:do{if((r46|0)==0){r2=3288}else{r41=r46;r47=4e4;while(1){r51=r47|0;r42=HEAP32[r51>>2];if(r42>>>0<=r41>>>0){r52=r47+4|0;if((r42+HEAP32[r52>>2]|0)>>>0>r41>>>0){break}}r42=HEAP32[r47+8>>2];if((r42|0)==0){r2=3288;break L4630}else{r47=r42}}if((r47|0)==0){r2=3288;break}r41=r49-HEAP32[9891]&r48;if(r41>>>0>=2147483647){r53=0;break}r5=_sbrk(r41);r17=(r5|0)==(HEAP32[r51>>2]+HEAP32[r52>>2]|0);r54=r17?r5:-1;r55=r17?r41:0;r56=r5;r57=r41;r2=3297;break}}while(0);do{if(r2==3288){r46=_sbrk(0);if((r46|0)==-1){r53=0;break}r7=r46;r41=HEAP32[8903];r5=r41-1|0;if((r5&r7|0)==0){r58=r50}else{r58=r50-r7+(r5+r7&-r41)|0}r41=HEAP32[9996];r7=r41+r58|0;if(!(r58>>>0>r15>>>0&r58>>>0<2147483647)){r53=0;break}r5=HEAP32[9998];if((r5|0)!=0){if(r7>>>0<=r41>>>0|r7>>>0>r5>>>0){r53=0;break}}r5=_sbrk(r58);r7=(r5|0)==(r46|0);r54=r7?r46:-1;r55=r7?r58:0;r56=r5;r57=r58;r2=3297;break}}while(0);L4650:do{if(r2==3297){r5=-r57|0;if((r54|0)!=-1){r59=r55,r60=r59>>2;r61=r54,r62=r61>>2;r2=3308;break L4628}do{if((r56|0)!=-1&r57>>>0<2147483647&r57>>>0<r39>>>0){r7=HEAP32[8904];r46=r40-r57+r7&-r7;if(r46>>>0>=2147483647){r63=r57;break}if((_sbrk(r46)|0)==-1){_sbrk(r5);r53=r55;break L4650}else{r63=r46+r57|0;break}}else{r63=r57}}while(0);if((r56|0)==-1){r53=r55}else{r59=r63,r60=r59>>2;r61=r56,r62=r61>>2;r2=3308;break L4628}}}while(0);HEAP32[9999]=HEAP32[9999]|4;r64=r53;r2=3305;break}else{r64=0;r2=3305}}while(0);do{if(r2==3305){if(r50>>>0>=2147483647){break}r53=_sbrk(r50);r56=_sbrk(0);if(!((r56|0)!=-1&(r53|0)!=-1&r53>>>0<r56>>>0)){break}r63=r56-r53|0;r56=r63>>>0>(r15+40|0)>>>0;r55=r56?r53:-1;if((r55|0)==-1){break}else{r59=r56?r63:r64,r60=r59>>2;r61=r55,r62=r61>>2;r2=3308;break}}}while(0);do{if(r2==3308){r64=HEAP32[9996]+r59|0;HEAP32[9996]=r64;if(r64>>>0>HEAP32[9997]>>>0){HEAP32[9997]=r64}r64=HEAP32[9894],r50=r64>>2;L4670:do{if((r64|0)==0){r55=HEAP32[9892];if((r55|0)==0|r61>>>0<r55>>>0){HEAP32[9892]=r61}HEAP32[1e4]=r61;HEAP32[10001]=r59;HEAP32[10003]=0;HEAP32[9897]=HEAP32[8902];HEAP32[9896]=-1;r55=0;while(1){r63=r55<<1;r56=(r63<<2)+39592|0;HEAP32[(r63+3<<2)+39592>>2]=r56;HEAP32[(r63+2<<2)+39592>>2]=r56;r56=r55+1|0;if((r56|0)==32){break}else{r55=r56}}r55=r61+8|0;if((r55&7|0)==0){r65=0}else{r65=-r55&7}r55=r59-40-r65|0;HEAP32[9894]=r61+r65|0;HEAP32[9891]=r55;HEAP32[(r65+4>>2)+r62]=r55|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[9895]=HEAP32[8906]}else{r55=4e4,r56=r55>>2;while(1){r66=HEAP32[r56];r67=r55+4|0;r68=HEAP32[r67>>2];if((r61|0)==(r66+r68|0)){r2=3320;break}r63=HEAP32[r56+2];if((r63|0)==0){break}else{r55=r63,r56=r55>>2}}do{if(r2==3320){if((HEAP32[r56+3]&8|0)!=0){break}r55=r64;if(!(r55>>>0>=r66>>>0&r55>>>0<r61>>>0)){break}HEAP32[r67>>2]=r68+r59|0;r55=HEAP32[9894];r63=HEAP32[9891]+r59|0;r53=r55;r57=r55+8|0;if((r57&7|0)==0){r69=0}else{r69=-r57&7}r57=r63-r69|0;HEAP32[9894]=r53+r69|0;HEAP32[9891]=r57;HEAP32[r69+(r53+4)>>2]=r57|1;HEAP32[r63+(r53+4)>>2]=40;HEAP32[9895]=HEAP32[8906];break L4670}}while(0);if(r61>>>0<HEAP32[9892]>>>0){HEAP32[9892]=r61}r56=r61+r59|0;r53=4e4;while(1){r70=r53|0;if((HEAP32[r70>>2]|0)==(r56|0)){r2=3330;break}r63=HEAP32[r53+8>>2];if((r63|0)==0){break}else{r53=r63}}do{if(r2==3330){if((HEAP32[r53+12>>2]&8|0)!=0){break}HEAP32[r70>>2]=r61;r56=r53+4|0;HEAP32[r56>>2]=HEAP32[r56>>2]+r59|0;r56=r61+8|0;if((r56&7|0)==0){r71=0}else{r71=-r56&7}r56=r59+(r61+8)|0;if((r56&7|0)==0){r72=0,r73=r72>>2}else{r72=-r56&7,r73=r72>>2}r56=r61+r72+r59|0;r63=r56;r57=r71+r15|0,r55=r57>>2;r40=r61+r57|0;r57=r40;r39=r56-(r61+r71)-r15|0;HEAP32[(r71+4>>2)+r62]=r15|3;do{if((r63|0)==(HEAP32[9894]|0)){r54=HEAP32[9891]+r39|0;HEAP32[9891]=r54;HEAP32[9894]=r57;HEAP32[r55+(r62+1)]=r54|1}else{if((r63|0)==(HEAP32[9893]|0)){r54=HEAP32[9890]+r39|0;HEAP32[9890]=r54;HEAP32[9893]=r57;HEAP32[r55+(r62+1)]=r54|1;HEAP32[(r54>>2)+r62+r55]=r54;break}r54=r59+4|0;r58=HEAP32[(r54>>2)+r62+r73];if((r58&3|0)==1){r52=r58&-8;r51=r58>>>3;L4715:do{if(r58>>>0<256){r48=HEAP32[((r72|8)>>2)+r62+r60];r49=HEAP32[r73+(r62+(r60+3))];r5=(r51<<3)+39592|0;do{if((r48|0)!=(r5|0)){if(r48>>>0<HEAP32[9892]>>>0){_abort()}if((HEAP32[r48+12>>2]|0)==(r63|0)){break}_abort()}}while(0);if((r49|0)==(r48|0)){HEAP32[9888]=HEAP32[9888]&(1<<r51^-1);break}do{if((r49|0)==(r5|0)){r74=r49+8|0}else{if(r49>>>0<HEAP32[9892]>>>0){_abort()}r47=r49+8|0;if((HEAP32[r47>>2]|0)==(r63|0)){r74=r47;break}_abort()}}while(0);HEAP32[r48+12>>2]=r49;HEAP32[r74>>2]=r48}else{r5=r56;r47=HEAP32[((r72|24)>>2)+r62+r60];r46=HEAP32[r73+(r62+(r60+3))];L4736:do{if((r46|0)==(r5|0)){r7=r72|16;r41=r61+r54+r7|0;r17=HEAP32[r41>>2];do{if((r17|0)==0){r42=r61+r7+r59|0;r43=HEAP32[r42>>2];if((r43|0)==0){r75=0,r76=r75>>2;break L4736}else{r77=r43;r78=r42;break}}else{r77=r17;r78=r41}}while(0);while(1){r41=r77+20|0;r17=HEAP32[r41>>2];if((r17|0)!=0){r77=r17;r78=r41;continue}r41=r77+16|0;r17=HEAP32[r41>>2];if((r17|0)==0){break}else{r77=r17;r78=r41}}if(r78>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r78>>2]=0;r75=r77,r76=r75>>2;break}}else{r41=HEAP32[((r72|8)>>2)+r62+r60];if(r41>>>0<HEAP32[9892]>>>0){_abort()}r17=r41+12|0;if((HEAP32[r17>>2]|0)!=(r5|0)){_abort()}r7=r46+8|0;if((HEAP32[r7>>2]|0)==(r5|0)){HEAP32[r17>>2]=r46;HEAP32[r7>>2]=r41;r75=r46,r76=r75>>2;break}else{_abort()}}}while(0);if((r47|0)==0){break}r46=r72+(r61+(r59+28))|0;r48=(HEAP32[r46>>2]<<2)+39856|0;do{if((r5|0)==(HEAP32[r48>>2]|0)){HEAP32[r48>>2]=r75;if((r75|0)!=0){break}HEAP32[9889]=HEAP32[9889]&(1<<HEAP32[r46>>2]^-1);break L4715}else{if(r47>>>0<HEAP32[9892]>>>0){_abort()}r49=r47+16|0;if((HEAP32[r49>>2]|0)==(r5|0)){HEAP32[r49>>2]=r75}else{HEAP32[r47+20>>2]=r75}if((r75|0)==0){break L4715}}}while(0);if(r75>>>0<HEAP32[9892]>>>0){_abort()}HEAP32[r76+6]=r47;r5=r72|16;r46=HEAP32[(r5>>2)+r62+r60];do{if((r46|0)!=0){if(r46>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r76+4]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r46=HEAP32[(r54+r5>>2)+r62];if((r46|0)==0){break}if(r46>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r76+5]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r79=r61+(r52|r72)+r59|0;r80=r52+r39|0}else{r79=r63;r80=r39}r54=r79+4|0;HEAP32[r54>>2]=HEAP32[r54>>2]&-2;HEAP32[r55+(r62+1)]=r80|1;HEAP32[(r80>>2)+r62+r55]=r80;r54=r80>>>3;if(r80>>>0<256){r51=r54<<1;r58=(r51<<2)+39592|0;r46=HEAP32[9888];r47=1<<r54;do{if((r46&r47|0)==0){HEAP32[9888]=r46|r47;r81=r58;r82=(r51+2<<2)+39592|0}else{r54=(r51+2<<2)+39592|0;r48=HEAP32[r54>>2];if(r48>>>0>=HEAP32[9892]>>>0){r81=r48;r82=r54;break}_abort()}}while(0);HEAP32[r82>>2]=r57;HEAP32[r81+12>>2]=r57;HEAP32[r55+(r62+2)]=r81;HEAP32[r55+(r62+3)]=r58;break}r51=r40;r47=r80>>>8;do{if((r47|0)==0){r83=0}else{if(r80>>>0>16777215){r83=31;break}r46=(r47+1048320|0)>>>16&8;r52=r47<<r46;r54=(r52+520192|0)>>>16&4;r48=r52<<r54;r52=(r48+245760|0)>>>16&2;r49=14-(r54|r46|r52)+(r48<<r52>>>15)|0;r83=r80>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r83<<2)+39856|0;HEAP32[r55+(r62+7)]=r83;HEAP32[r55+(r62+5)]=0;HEAP32[r55+(r62+4)]=0;r58=HEAP32[9889];r49=1<<r83;if((r58&r49|0)==0){HEAP32[9889]=r58|r49;HEAP32[r47>>2]=r51;HEAP32[r55+(r62+6)]=r47;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}if((r83|0)==31){r84=0}else{r84=25-(r83>>>1)|0}r49=r80<<r84;r58=HEAP32[r47>>2];while(1){if((HEAP32[r58+4>>2]&-8|0)==(r80|0)){break}r85=(r49>>>31<<2)+r58+16|0;r47=HEAP32[r85>>2];if((r47|0)==0){r2=3403;break}else{r49=r49<<1;r58=r47}}if(r2==3403){if(r85>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r85>>2]=r51;HEAP32[r55+(r62+6)]=r58;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}}r49=r58+8|0;r47=HEAP32[r49>>2];r52=HEAP32[9892];if(r58>>>0<r52>>>0){_abort()}if(r47>>>0<r52>>>0){_abort()}else{HEAP32[r47+12>>2]=r51;HEAP32[r49>>2]=r51;HEAP32[r55+(r62+2)]=r47;HEAP32[r55+(r62+3)]=r58;HEAP32[r55+(r62+6)]=0;break}}}while(0);r14=r61+(r71|8)|0;return r14}}while(0);r53=r64;r55=4e4,r40=r55>>2;while(1){r86=HEAP32[r40];if(r86>>>0<=r53>>>0){r87=HEAP32[r40+1];r88=r86+r87|0;if(r88>>>0>r53>>>0){break}}r55=HEAP32[r40+2],r40=r55>>2}r55=r86+(r87-39)|0;if((r55&7|0)==0){r89=0}else{r89=-r55&7}r55=r86+(r87-47)+r89|0;r40=r55>>>0<(r64+16|0)>>>0?r53:r55;r55=r40+8|0,r57=r55>>2;r39=r61+8|0;if((r39&7|0)==0){r90=0}else{r90=-r39&7}r39=r59-40-r90|0;HEAP32[9894]=r61+r90|0;HEAP32[9891]=r39;HEAP32[(r90+4>>2)+r62]=r39|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[9895]=HEAP32[8906];HEAP32[r40+4>>2]=27;HEAP32[r57]=HEAP32[1e4];HEAP32[r57+1]=HEAP32[10001];HEAP32[r57+2]=HEAP32[10002];HEAP32[r57+3]=HEAP32[10003];HEAP32[1e4]=r61;HEAP32[10001]=r59;HEAP32[10003]=0;HEAP32[10002]=r55;r55=r40+28|0;HEAP32[r55>>2]=7;L4834:do{if((r40+32|0)>>>0<r88>>>0){r57=r55;while(1){r39=r57+4|0;HEAP32[r39>>2]=7;if((r57+8|0)>>>0<r88>>>0){r57=r39}else{break L4834}}}}while(0);if((r40|0)==(r53|0)){break}r55=r40-r64|0;r57=r55+(r53+4)|0;HEAP32[r57>>2]=HEAP32[r57>>2]&-2;HEAP32[r50+1]=r55|1;HEAP32[r53+r55>>2]=r55;r57=r55>>>3;if(r55>>>0<256){r39=r57<<1;r63=(r39<<2)+39592|0;r56=HEAP32[9888];r47=1<<r57;do{if((r56&r47|0)==0){HEAP32[9888]=r56|r47;r91=r63;r92=(r39+2<<2)+39592|0}else{r57=(r39+2<<2)+39592|0;r49=HEAP32[r57>>2];if(r49>>>0>=HEAP32[9892]>>>0){r91=r49;r92=r57;break}_abort()}}while(0);HEAP32[r92>>2]=r64;HEAP32[r91+12>>2]=r64;HEAP32[r50+2]=r91;HEAP32[r50+3]=r63;break}r39=r64;r47=r55>>>8;do{if((r47|0)==0){r93=0}else{if(r55>>>0>16777215){r93=31;break}r56=(r47+1048320|0)>>>16&8;r53=r47<<r56;r40=(r53+520192|0)>>>16&4;r57=r53<<r40;r53=(r57+245760|0)>>>16&2;r49=14-(r40|r56|r53)+(r57<<r53>>>15)|0;r93=r55>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r93<<2)+39856|0;HEAP32[r50+7]=r93;HEAP32[r50+5]=0;HEAP32[r50+4]=0;r63=HEAP32[9889];r49=1<<r93;if((r63&r49|0)==0){HEAP32[9889]=r63|r49;HEAP32[r47>>2]=r39;HEAP32[r50+6]=r47;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}if((r93|0)==31){r94=0}else{r94=25-(r93>>>1)|0}r49=r55<<r94;r63=HEAP32[r47>>2];while(1){if((HEAP32[r63+4>>2]&-8|0)==(r55|0)){break}r95=(r49>>>31<<2)+r63+16|0;r47=HEAP32[r95>>2];if((r47|0)==0){r2=3438;break}else{r49=r49<<1;r63=r47}}if(r2==3438){if(r95>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r95>>2]=r39;HEAP32[r50+6]=r63;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}}r49=r63+8|0;r55=HEAP32[r49>>2];r47=HEAP32[9892];if(r63>>>0<r47>>>0){_abort()}if(r55>>>0<r47>>>0){_abort()}else{HEAP32[r55+12>>2]=r39;HEAP32[r49>>2]=r39;HEAP32[r50+2]=r55;HEAP32[r50+3]=r63;HEAP32[r50+6]=0;break}}}while(0);r50=HEAP32[9891];if(r50>>>0<=r15>>>0){break}r64=r50-r15|0;HEAP32[9891]=r64;r50=HEAP32[9894];r55=r50;HEAP32[9894]=r55+r15|0;HEAP32[(r55+4>>2)+r16]=r64|1;HEAP32[r50+4>>2]=r15|3;r14=r50+8|0;return r14}}while(0);r15=___errno_location();HEAP32[r15>>2]=12;r14=0;return r14}function _free(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r2=r1>>2;r3=0;if((r1|0)==0){return}r4=r1-8|0;r5=r4;r6=HEAP32[9892];if(r4>>>0<r6>>>0){_abort()}r7=HEAP32[r1-4>>2];r8=r7&3;if((r8|0)==1){_abort()}r9=r7&-8,r10=r9>>2;r11=r1+(r9-8)|0;r12=r11;L10:do{if((r7&1|0)==0){r13=HEAP32[r4>>2];if((r8|0)==0){return}r14=-8-r13|0,r15=r14>>2;r16=r1+r14|0;r17=r16;r18=r13+r9|0;if(r16>>>0<r6>>>0){_abort()}if((r17|0)==(HEAP32[9893]|0)){r19=(r1+(r9-4)|0)>>2;if((HEAP32[r19]&3|0)!=3){r20=r17,r21=r20>>2;r22=r18;break}HEAP32[9890]=r18;HEAP32[r19]=HEAP32[r19]&-2;HEAP32[r15+(r2+1)]=r18|1;HEAP32[r11>>2]=r18;return}r19=r13>>>3;if(r13>>>0<256){r13=HEAP32[r15+(r2+2)];r23=HEAP32[r15+(r2+3)];r24=(r19<<3)+39592|0;do{if((r13|0)!=(r24|0)){if(r13>>>0<r6>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r17|0)){break}_abort()}}while(0);if((r23|0)==(r13|0)){HEAP32[9888]=HEAP32[9888]&(1<<r19^-1);r20=r17,r21=r20>>2;r22=r18;break}do{if((r23|0)==(r24|0)){r25=r23+8|0}else{if(r23>>>0<r6>>>0){_abort()}r26=r23+8|0;if((HEAP32[r26>>2]|0)==(r17|0)){r25=r26;break}_abort()}}while(0);HEAP32[r13+12>>2]=r23;HEAP32[r25>>2]=r13;r20=r17,r21=r20>>2;r22=r18;break}r24=r16;r19=HEAP32[r15+(r2+6)];r26=HEAP32[r15+(r2+3)];L44:do{if((r26|0)==(r24|0)){r27=r14+(r1+20)|0;r28=HEAP32[r27>>2];do{if((r28|0)==0){r29=r14+(r1+16)|0;r30=HEAP32[r29>>2];if((r30|0)==0){r31=0,r32=r31>>2;break L44}else{r33=r30;r34=r29;break}}else{r33=r28;r34=r27}}while(0);while(1){r27=r33+20|0;r28=HEAP32[r27>>2];if((r28|0)!=0){r33=r28;r34=r27;continue}r27=r33+16|0;r28=HEAP32[r27>>2];if((r28|0)==0){break}else{r33=r28;r34=r27}}if(r34>>>0<r6>>>0){_abort()}else{HEAP32[r34>>2]=0;r31=r33,r32=r31>>2;break}}else{r27=HEAP32[r15+(r2+2)];if(r27>>>0<r6>>>0){_abort()}r28=r27+12|0;if((HEAP32[r28>>2]|0)!=(r24|0)){_abort()}r29=r26+8|0;if((HEAP32[r29>>2]|0)==(r24|0)){HEAP32[r28>>2]=r26;HEAP32[r29>>2]=r27;r31=r26,r32=r31>>2;break}else{_abort()}}}while(0);if((r19|0)==0){r20=r17,r21=r20>>2;r22=r18;break}r26=r14+(r1+28)|0;r16=(HEAP32[r26>>2]<<2)+39856|0;do{if((r24|0)==(HEAP32[r16>>2]|0)){HEAP32[r16>>2]=r31;if((r31|0)!=0){break}HEAP32[9889]=HEAP32[9889]&(1<<HEAP32[r26>>2]^-1);r20=r17,r21=r20>>2;r22=r18;break L10}else{if(r19>>>0<HEAP32[9892]>>>0){_abort()}r13=r19+16|0;if((HEAP32[r13>>2]|0)==(r24|0)){HEAP32[r13>>2]=r31}else{HEAP32[r19+20>>2]=r31}if((r31|0)==0){r20=r17,r21=r20>>2;r22=r18;break L10}}}while(0);if(r31>>>0<HEAP32[9892]>>>0){_abort()}HEAP32[r32+6]=r19;r24=HEAP32[r15+(r2+4)];do{if((r24|0)!=0){if(r24>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r32+4]=r24;HEAP32[r24+24>>2]=r31;break}}}while(0);r24=HEAP32[r15+(r2+5)];if((r24|0)==0){r20=r17,r21=r20>>2;r22=r18;break}if(r24>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r32+5]=r24;HEAP32[r24+24>>2]=r31;r20=r17,r21=r20>>2;r22=r18;break}}else{r20=r5,r21=r20>>2;r22=r9}}while(0);r5=r20,r31=r5>>2;if(r5>>>0>=r11>>>0){_abort()}r5=r1+(r9-4)|0;r32=HEAP32[r5>>2];if((r32&1|0)==0){_abort()}do{if((r32&2|0)==0){if((r12|0)==(HEAP32[9894]|0)){r6=HEAP32[9891]+r22|0;HEAP32[9891]=r6;HEAP32[9894]=r20;HEAP32[r21+1]=r6|1;if((r20|0)==(HEAP32[9893]|0)){HEAP32[9893]=0;HEAP32[9890]=0}if(r6>>>0<=HEAP32[9895]>>>0){return}_sys_trim(0);return}if((r12|0)==(HEAP32[9893]|0)){r6=HEAP32[9890]+r22|0;HEAP32[9890]=r6;HEAP32[9893]=r20;HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;return}r6=(r32&-8)+r22|0;r33=r32>>>3;L115:do{if(r32>>>0<256){r34=HEAP32[r2+r10];r25=HEAP32[((r9|4)>>2)+r2];r8=(r33<<3)+39592|0;do{if((r34|0)!=(r8|0)){if(r34>>>0<HEAP32[9892]>>>0){_abort()}if((HEAP32[r34+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r25|0)==(r34|0)){HEAP32[9888]=HEAP32[9888]&(1<<r33^-1);break}do{if((r25|0)==(r8|0)){r35=r25+8|0}else{if(r25>>>0<HEAP32[9892]>>>0){_abort()}r4=r25+8|0;if((HEAP32[r4>>2]|0)==(r12|0)){r35=r4;break}_abort()}}while(0);HEAP32[r34+12>>2]=r25;HEAP32[r35>>2]=r34}else{r8=r11;r4=HEAP32[r10+(r2+4)];r7=HEAP32[((r9|4)>>2)+r2];L136:do{if((r7|0)==(r8|0)){r24=r9+(r1+12)|0;r19=HEAP32[r24>>2];do{if((r19|0)==0){r26=r9+(r1+8)|0;r16=HEAP32[r26>>2];if((r16|0)==0){r36=0,r37=r36>>2;break L136}else{r38=r16;r39=r26;break}}else{r38=r19;r39=r24}}while(0);while(1){r24=r38+20|0;r19=HEAP32[r24>>2];if((r19|0)!=0){r38=r19;r39=r24;continue}r24=r38+16|0;r19=HEAP32[r24>>2];if((r19|0)==0){break}else{r38=r19;r39=r24}}if(r39>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r39>>2]=0;r36=r38,r37=r36>>2;break}}else{r24=HEAP32[r2+r10];if(r24>>>0<HEAP32[9892]>>>0){_abort()}r19=r24+12|0;if((HEAP32[r19>>2]|0)!=(r8|0)){_abort()}r26=r7+8|0;if((HEAP32[r26>>2]|0)==(r8|0)){HEAP32[r19>>2]=r7;HEAP32[r26>>2]=r24;r36=r7,r37=r36>>2;break}else{_abort()}}}while(0);if((r4|0)==0){break}r7=r9+(r1+20)|0;r34=(HEAP32[r7>>2]<<2)+39856|0;do{if((r8|0)==(HEAP32[r34>>2]|0)){HEAP32[r34>>2]=r36;if((r36|0)!=0){break}HEAP32[9889]=HEAP32[9889]&(1<<HEAP32[r7>>2]^-1);break L115}else{if(r4>>>0<HEAP32[9892]>>>0){_abort()}r25=r4+16|0;if((HEAP32[r25>>2]|0)==(r8|0)){HEAP32[r25>>2]=r36}else{HEAP32[r4+20>>2]=r36}if((r36|0)==0){break L115}}}while(0);if(r36>>>0<HEAP32[9892]>>>0){_abort()}HEAP32[r37+6]=r4;r8=HEAP32[r10+(r2+2)];do{if((r8|0)!=0){if(r8>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r37+4]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);r8=HEAP32[r10+(r2+3)];if((r8|0)==0){break}if(r8>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r37+5]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;if((r20|0)!=(HEAP32[9893]|0)){r40=r6;break}HEAP32[9890]=r6;return}else{HEAP32[r5>>2]=r32&-2;HEAP32[r21+1]=r22|1;HEAP32[(r22>>2)+r31]=r22;r40=r22}}while(0);r22=r40>>>3;if(r40>>>0<256){r31=r22<<1;r32=(r31<<2)+39592|0;r5=HEAP32[9888];r36=1<<r22;do{if((r5&r36|0)==0){HEAP32[9888]=r5|r36;r41=r32;r42=(r31+2<<2)+39592|0}else{r22=(r31+2<<2)+39592|0;r37=HEAP32[r22>>2];if(r37>>>0>=HEAP32[9892]>>>0){r41=r37;r42=r22;break}_abort()}}while(0);HEAP32[r42>>2]=r20;HEAP32[r41+12>>2]=r20;HEAP32[r21+2]=r41;HEAP32[r21+3]=r32;return}r32=r20;r41=r40>>>8;do{if((r41|0)==0){r43=0}else{if(r40>>>0>16777215){r43=31;break}r42=(r41+1048320|0)>>>16&8;r31=r41<<r42;r36=(r31+520192|0)>>>16&4;r5=r31<<r36;r31=(r5+245760|0)>>>16&2;r22=14-(r36|r42|r31)+(r5<<r31>>>15)|0;r43=r40>>>((r22+7|0)>>>0)&1|r22<<1}}while(0);r41=(r43<<2)+39856|0;HEAP32[r21+7]=r43;HEAP32[r21+5]=0;HEAP32[r21+4]=0;r22=HEAP32[9889];r31=1<<r43;do{if((r22&r31|0)==0){HEAP32[9889]=r22|r31;HEAP32[r41>>2]=r32;HEAP32[r21+6]=r41;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20}else{if((r43|0)==31){r44=0}else{r44=25-(r43>>>1)|0}r5=r40<<r44;r42=HEAP32[r41>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r40|0)){break}r45=(r5>>>31<<2)+r42+16|0;r36=HEAP32[r45>>2];if((r36|0)==0){r3=131;break}else{r5=r5<<1;r42=r36}}if(r3==131){if(r45>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r45>>2]=r32;HEAP32[r21+6]=r42;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20;break}}r5=r42+8|0;r6=HEAP32[r5>>2];r36=HEAP32[9892];if(r42>>>0<r36>>>0){_abort()}if(r6>>>0<r36>>>0){_abort()}else{HEAP32[r6+12>>2]=r32;HEAP32[r5>>2]=r32;HEAP32[r21+2]=r6;HEAP32[r21+3]=r42;HEAP32[r21+6]=0;break}}}while(0);r21=HEAP32[9896]-1|0;HEAP32[9896]=r21;if((r21|0)==0){r46=40008}else{return}while(1){r21=HEAP32[r46>>2];if((r21|0)==0){break}else{r46=r21+8|0}}HEAP32[9896]=-1;return}function _realloc(r1,r2){var r3,r4,r5,r6;if((r1|0)==0){r3=_malloc(r2);return r3}if(r2>>>0>4294967231){r4=___errno_location();HEAP32[r4>>2]=12;r3=0;return r3}if(r2>>>0<11){r5=16}else{r5=r2+11&-8}r4=_try_realloc_chunk(r1-8|0,r5);if((r4|0)!=0){r3=r4+8|0;return r3}r4=_malloc(r2);if((r4|0)==0){r3=0;return r3}r5=HEAP32[r1-4>>2];r6=(r5&-8)-((r5&3|0)==0?8:4)|0;_memcpy(r4,r1,r6>>>0<r2>>>0?r6:r2);_free(r1);r3=r4;return r3}function _sys_trim(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;do{if((HEAP32[8902]|0)==0){r2=_sysconf(8);if((r2-1&r2|0)==0){HEAP32[8904]=r2;HEAP32[8903]=r2;HEAP32[8905]=-1;HEAP32[8906]=2097152;HEAP32[8907]=0;HEAP32[9999]=0;r2=_time(0)&-16^1431655768;HEAP32[8902]=r2;break}else{_abort()}}}while(0);if(r1>>>0>=4294967232){r3=0;r4=r3&1;return r4}r2=HEAP32[9894];if((r2|0)==0){r3=0;r4=r3&1;return r4}r5=HEAP32[9891];do{if(r5>>>0>(r1+40|0)>>>0){r6=HEAP32[8904];r7=Math.imul(Math.floor(((-40-r1-1+r5+r6|0)>>>0)/(r6>>>0))-1|0,r6);r8=r2;r9=4e4,r10=r9>>2;while(1){r11=HEAP32[r10];if(r11>>>0<=r8>>>0){if((r11+HEAP32[r10+1]|0)>>>0>r8>>>0){r12=r9;break}}r11=HEAP32[r10+2];if((r11|0)==0){r12=0;break}else{r9=r11,r10=r9>>2}}if((HEAP32[r12+12>>2]&8|0)!=0){break}r9=_sbrk(0);r10=(r12+4|0)>>2;if((r9|0)!=(HEAP32[r12>>2]+HEAP32[r10]|0)){break}r8=_sbrk(-(r7>>>0>2147483646?-2147483648-r6|0:r7)|0);r11=_sbrk(0);if(!((r8|0)!=-1&r11>>>0<r9>>>0)){break}r8=r9-r11|0;if((r9|0)==(r11|0)){break}HEAP32[r10]=HEAP32[r10]-r8|0;HEAP32[9996]=HEAP32[9996]-r8|0;r10=HEAP32[9894];r13=HEAP32[9891]-r8|0;r8=r10;r14=r10+8|0;if((r14&7|0)==0){r15=0}else{r15=-r14&7}r14=r13-r15|0;HEAP32[9894]=r8+r15|0;HEAP32[9891]=r14;HEAP32[r15+(r8+4)>>2]=r14|1;HEAP32[r13+(r8+4)>>2]=40;HEAP32[9895]=HEAP32[8906];r3=(r9|0)!=(r11|0);r4=r3&1;return r4}}while(0);if(HEAP32[9891]>>>0<=HEAP32[9895]>>>0){r3=0;r4=r3&1;return r4}HEAP32[9895]=-1;r3=0;r4=r3&1;return r4}function _try_realloc_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29;r3=(r1+4|0)>>2;r4=HEAP32[r3];r5=r4&-8,r6=r5>>2;r7=r1,r8=r7>>2;r9=r7+r5|0;r10=r9;r11=HEAP32[9892];if(r7>>>0<r11>>>0){_abort()}r12=r4&3;if(!((r12|0)!=1&r7>>>0<r9>>>0)){_abort()}r13=(r7+(r5|4)|0)>>2;r14=HEAP32[r13];if((r14&1|0)==0){_abort()}if((r12|0)==0){if(r2>>>0<256){r15=0;return r15}do{if(r5>>>0>=(r2+4|0)>>>0){if((r5-r2|0)>>>0>HEAP32[8904]<<1>>>0){break}else{r15=r1}return r15}}while(0);r15=0;return r15}if(r5>>>0>=r2>>>0){r12=r5-r2|0;if(r12>>>0<=15){r15=r1;return r15}HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|3;HEAP32[r13]=HEAP32[r13]|1;_dispose_chunk(r7+r2|0,r12);r15=r1;return r15}if((r10|0)==(HEAP32[9894]|0)){r12=HEAP32[9891]+r5|0;if(r12>>>0<=r2>>>0){r15=0;return r15}r13=r12-r2|0;HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r13|1;HEAP32[9894]=r7+r2|0;HEAP32[9891]=r13;r15=r1;return r15}if((r10|0)==(HEAP32[9893]|0)){r13=HEAP32[9890]+r5|0;if(r13>>>0<r2>>>0){r15=0;return r15}r12=r13-r2|0;if(r12>>>0>15){HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|1;HEAP32[(r13>>2)+r8]=r12;r16=r13+(r7+4)|0;HEAP32[r16>>2]=HEAP32[r16>>2]&-2;r17=r7+r2|0;r18=r12}else{HEAP32[r3]=r4&1|r13|2;r4=r13+(r7+4)|0;HEAP32[r4>>2]=HEAP32[r4>>2]|1;r17=0;r18=0}HEAP32[9890]=r18;HEAP32[9893]=r17;r15=r1;return r15}if((r14&2|0)!=0){r15=0;return r15}r17=(r14&-8)+r5|0;if(r17>>>0<r2>>>0){r15=0;return r15}r18=r17-r2|0;r4=r14>>>3;L336:do{if(r14>>>0<256){r13=HEAP32[r6+(r8+2)];r12=HEAP32[r6+(r8+3)];r16=(r4<<3)+39592|0;do{if((r13|0)!=(r16|0)){if(r13>>>0<r11>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r10|0)){break}_abort()}}while(0);if((r12|0)==(r13|0)){HEAP32[9888]=HEAP32[9888]&(1<<r4^-1);break}do{if((r12|0)==(r16|0)){r19=r12+8|0}else{if(r12>>>0<r11>>>0){_abort()}r20=r12+8|0;if((HEAP32[r20>>2]|0)==(r10|0)){r19=r20;break}_abort()}}while(0);HEAP32[r13+12>>2]=r12;HEAP32[r19>>2]=r13}else{r16=r9;r20=HEAP32[r6+(r8+6)];r21=HEAP32[r6+(r8+3)];L338:do{if((r21|0)==(r16|0)){r22=r5+(r7+20)|0;r23=HEAP32[r22>>2];do{if((r23|0)==0){r24=r5+(r7+16)|0;r25=HEAP32[r24>>2];if((r25|0)==0){r26=0,r27=r26>>2;break L338}else{r28=r25;r29=r24;break}}else{r28=r23;r29=r22}}while(0);while(1){r22=r28+20|0;r23=HEAP32[r22>>2];if((r23|0)!=0){r28=r23;r29=r22;continue}r22=r28+16|0;r23=HEAP32[r22>>2];if((r23|0)==0){break}else{r28=r23;r29=r22}}if(r29>>>0<r11>>>0){_abort()}else{HEAP32[r29>>2]=0;r26=r28,r27=r26>>2;break}}else{r22=HEAP32[r6+(r8+2)];if(r22>>>0<r11>>>0){_abort()}r23=r22+12|0;if((HEAP32[r23>>2]|0)!=(r16|0)){_abort()}r24=r21+8|0;if((HEAP32[r24>>2]|0)==(r16|0)){HEAP32[r23>>2]=r21;HEAP32[r24>>2]=r22;r26=r21,r27=r26>>2;break}else{_abort()}}}while(0);if((r20|0)==0){break}r21=r5+(r7+28)|0;r13=(HEAP32[r21>>2]<<2)+39856|0;do{if((r16|0)==(HEAP32[r13>>2]|0)){HEAP32[r13>>2]=r26;if((r26|0)!=0){break}HEAP32[9889]=HEAP32[9889]&(1<<HEAP32[r21>>2]^-1);break L336}else{if(r20>>>0<HEAP32[9892]>>>0){_abort()}r12=r20+16|0;if((HEAP32[r12>>2]|0)==(r16|0)){HEAP32[r12>>2]=r26}else{HEAP32[r20+20>>2]=r26}if((r26|0)==0){break L336}}}while(0);if(r26>>>0<HEAP32[9892]>>>0){_abort()}HEAP32[r27+6]=r20;r16=HEAP32[r6+(r8+4)];do{if((r16|0)!=0){if(r16>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r27+4]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);r16=HEAP32[r6+(r8+5)];if((r16|0)==0){break}if(r16>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r27+5]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);if(r18>>>0<16){HEAP32[r3]=r17|HEAP32[r3]&1|2;r26=r7+(r17|4)|0;HEAP32[r26>>2]=HEAP32[r26>>2]|1;r15=r1;return r15}else{HEAP32[r3]=HEAP32[r3]&1|r2|2;HEAP32[(r2+4>>2)+r8]=r18|3;r8=r7+(r17|4)|0;HEAP32[r8>>2]=HEAP32[r8>>2]|1;_dispose_chunk(r7+r2|0,r18);r15=r1;return r15}}function _dispose_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43;r3=r2>>2;r4=0;r5=r1,r6=r5>>2;r7=r5+r2|0;r8=r7;r9=HEAP32[r1+4>>2];L412:do{if((r9&1|0)==0){r10=HEAP32[r1>>2];if((r9&3|0)==0){return}r11=r5+ -r10|0;r12=r11;r13=r10+r2|0;r14=HEAP32[9892];if(r11>>>0<r14>>>0){_abort()}if((r12|0)==(HEAP32[9893]|0)){r15=(r2+(r5+4)|0)>>2;if((HEAP32[r15]&3|0)!=3){r16=r12,r17=r16>>2;r18=r13;break}HEAP32[9890]=r13;HEAP32[r15]=HEAP32[r15]&-2;HEAP32[(4-r10>>2)+r6]=r13|1;HEAP32[r7>>2]=r13;return}r15=r10>>>3;if(r10>>>0<256){r19=HEAP32[(8-r10>>2)+r6];r20=HEAP32[(12-r10>>2)+r6];r21=(r15<<3)+39592|0;do{if((r19|0)!=(r21|0)){if(r19>>>0<r14>>>0){_abort()}if((HEAP32[r19+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r20|0)==(r19|0)){HEAP32[9888]=HEAP32[9888]&(1<<r15^-1);r16=r12,r17=r16>>2;r18=r13;break}do{if((r20|0)==(r21|0)){r22=r20+8|0}else{if(r20>>>0<r14>>>0){_abort()}r23=r20+8|0;if((HEAP32[r23>>2]|0)==(r12|0)){r22=r23;break}_abort()}}while(0);HEAP32[r19+12>>2]=r20;HEAP32[r22>>2]=r19;r16=r12,r17=r16>>2;r18=r13;break}r21=r11;r15=HEAP32[(24-r10>>2)+r6];r23=HEAP32[(12-r10>>2)+r6];L446:do{if((r23|0)==(r21|0)){r24=16-r10|0;r25=r24+(r5+4)|0;r26=HEAP32[r25>>2];do{if((r26|0)==0){r27=r5+r24|0;r28=HEAP32[r27>>2];if((r28|0)==0){r29=0,r30=r29>>2;break L446}else{r31=r28;r32=r27;break}}else{r31=r26;r32=r25}}while(0);while(1){r25=r31+20|0;r26=HEAP32[r25>>2];if((r26|0)!=0){r31=r26;r32=r25;continue}r25=r31+16|0;r26=HEAP32[r25>>2];if((r26|0)==0){break}else{r31=r26;r32=r25}}if(r32>>>0<r14>>>0){_abort()}else{HEAP32[r32>>2]=0;r29=r31,r30=r29>>2;break}}else{r25=HEAP32[(8-r10>>2)+r6];if(r25>>>0<r14>>>0){_abort()}r26=r25+12|0;if((HEAP32[r26>>2]|0)!=(r21|0)){_abort()}r24=r23+8|0;if((HEAP32[r24>>2]|0)==(r21|0)){HEAP32[r26>>2]=r23;HEAP32[r24>>2]=r25;r29=r23,r30=r29>>2;break}else{_abort()}}}while(0);if((r15|0)==0){r16=r12,r17=r16>>2;r18=r13;break}r23=r5+(28-r10)|0;r14=(HEAP32[r23>>2]<<2)+39856|0;do{if((r21|0)==(HEAP32[r14>>2]|0)){HEAP32[r14>>2]=r29;if((r29|0)!=0){break}HEAP32[9889]=HEAP32[9889]&(1<<HEAP32[r23>>2]^-1);r16=r12,r17=r16>>2;r18=r13;break L412}else{if(r15>>>0<HEAP32[9892]>>>0){_abort()}r11=r15+16|0;if((HEAP32[r11>>2]|0)==(r21|0)){HEAP32[r11>>2]=r29}else{HEAP32[r15+20>>2]=r29}if((r29|0)==0){r16=r12,r17=r16>>2;r18=r13;break L412}}}while(0);if(r29>>>0<HEAP32[9892]>>>0){_abort()}HEAP32[r30+6]=r15;r21=16-r10|0;r23=HEAP32[(r21>>2)+r6];do{if((r23|0)!=0){if(r23>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r30+4]=r23;HEAP32[r23+24>>2]=r29;break}}}while(0);r23=HEAP32[(r21+4>>2)+r6];if((r23|0)==0){r16=r12,r17=r16>>2;r18=r13;break}if(r23>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r30+5]=r23;HEAP32[r23+24>>2]=r29;r16=r12,r17=r16>>2;r18=r13;break}}else{r16=r1,r17=r16>>2;r18=r2}}while(0);r1=HEAP32[9892];if(r7>>>0<r1>>>0){_abort()}r29=r2+(r5+4)|0;r30=HEAP32[r29>>2];do{if((r30&2|0)==0){if((r8|0)==(HEAP32[9894]|0)){r31=HEAP32[9891]+r18|0;HEAP32[9891]=r31;HEAP32[9894]=r16;HEAP32[r17+1]=r31|1;if((r16|0)!=(HEAP32[9893]|0)){return}HEAP32[9893]=0;HEAP32[9890]=0;return}if((r8|0)==(HEAP32[9893]|0)){r31=HEAP32[9890]+r18|0;HEAP32[9890]=r31;HEAP32[9893]=r16;HEAP32[r17+1]=r31|1;HEAP32[(r31>>2)+r17]=r31;return}r31=(r30&-8)+r18|0;r32=r30>>>3;L511:do{if(r30>>>0<256){r22=HEAP32[r3+(r6+2)];r9=HEAP32[r3+(r6+3)];r23=(r32<<3)+39592|0;do{if((r22|0)!=(r23|0)){if(r22>>>0<r1>>>0){_abort()}if((HEAP32[r22+12>>2]|0)==(r8|0)){break}_abort()}}while(0);if((r9|0)==(r22|0)){HEAP32[9888]=HEAP32[9888]&(1<<r32^-1);break}do{if((r9|0)==(r23|0)){r33=r9+8|0}else{if(r9>>>0<r1>>>0){_abort()}r10=r9+8|0;if((HEAP32[r10>>2]|0)==(r8|0)){r33=r10;break}_abort()}}while(0);HEAP32[r22+12>>2]=r9;HEAP32[r33>>2]=r22}else{r23=r7;r10=HEAP32[r3+(r6+6)];r15=HEAP32[r3+(r6+3)];L532:do{if((r15|0)==(r23|0)){r14=r2+(r5+20)|0;r11=HEAP32[r14>>2];do{if((r11|0)==0){r19=r2+(r5+16)|0;r20=HEAP32[r19>>2];if((r20|0)==0){r34=0,r35=r34>>2;break L532}else{r36=r20;r37=r19;break}}else{r36=r11;r37=r14}}while(0);while(1){r14=r36+20|0;r11=HEAP32[r14>>2];if((r11|0)!=0){r36=r11;r37=r14;continue}r14=r36+16|0;r11=HEAP32[r14>>2];if((r11|0)==0){break}else{r36=r11;r37=r14}}if(r37>>>0<r1>>>0){_abort()}else{HEAP32[r37>>2]=0;r34=r36,r35=r34>>2;break}}else{r14=HEAP32[r3+(r6+2)];if(r14>>>0<r1>>>0){_abort()}r11=r14+12|0;if((HEAP32[r11>>2]|0)!=(r23|0)){_abort()}r19=r15+8|0;if((HEAP32[r19>>2]|0)==(r23|0)){HEAP32[r11>>2]=r15;HEAP32[r19>>2]=r14;r34=r15,r35=r34>>2;break}else{_abort()}}}while(0);if((r10|0)==0){break}r15=r2+(r5+28)|0;r22=(HEAP32[r15>>2]<<2)+39856|0;do{if((r23|0)==(HEAP32[r22>>2]|0)){HEAP32[r22>>2]=r34;if((r34|0)!=0){break}HEAP32[9889]=HEAP32[9889]&(1<<HEAP32[r15>>2]^-1);break L511}else{if(r10>>>0<HEAP32[9892]>>>0){_abort()}r9=r10+16|0;if((HEAP32[r9>>2]|0)==(r23|0)){HEAP32[r9>>2]=r34}else{HEAP32[r10+20>>2]=r34}if((r34|0)==0){break L511}}}while(0);if(r34>>>0<HEAP32[9892]>>>0){_abort()}HEAP32[r35+6]=r10;r23=HEAP32[r3+(r6+4)];do{if((r23|0)!=0){if(r23>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r35+4]=r23;HEAP32[r23+24>>2]=r34;break}}}while(0);r23=HEAP32[r3+(r6+5)];if((r23|0)==0){break}if(r23>>>0<HEAP32[9892]>>>0){_abort()}else{HEAP32[r35+5]=r23;HEAP32[r23+24>>2]=r34;break}}}while(0);HEAP32[r17+1]=r31|1;HEAP32[(r31>>2)+r17]=r31;if((r16|0)!=(HEAP32[9893]|0)){r38=r31;break}HEAP32[9890]=r31;return}else{HEAP32[r29>>2]=r30&-2;HEAP32[r17+1]=r18|1;HEAP32[(r18>>2)+r17]=r18;r38=r18}}while(0);r18=r38>>>3;if(r38>>>0<256){r30=r18<<1;r29=(r30<<2)+39592|0;r34=HEAP32[9888];r35=1<<r18;do{if((r34&r35|0)==0){HEAP32[9888]=r34|r35;r39=r29;r40=(r30+2<<2)+39592|0}else{r18=(r30+2<<2)+39592|0;r6=HEAP32[r18>>2];if(r6>>>0>=HEAP32[9892]>>>0){r39=r6;r40=r18;break}_abort()}}while(0);HEAP32[r40>>2]=r16;HEAP32[r39+12>>2]=r16;HEAP32[r17+2]=r39;HEAP32[r17+3]=r29;return}r29=r16;r39=r38>>>8;do{if((r39|0)==0){r41=0}else{if(r38>>>0>16777215){r41=31;break}r40=(r39+1048320|0)>>>16&8;r30=r39<<r40;r35=(r30+520192|0)>>>16&4;r34=r30<<r35;r30=(r34+245760|0)>>>16&2;r18=14-(r35|r40|r30)+(r34<<r30>>>15)|0;r41=r38>>>((r18+7|0)>>>0)&1|r18<<1}}while(0);r39=(r41<<2)+39856|0;HEAP32[r17+7]=r41;HEAP32[r17+5]=0;HEAP32[r17+4]=0;r18=HEAP32[9889];r30=1<<r41;if((r18&r30|0)==0){HEAP32[9889]=r18|r30;HEAP32[r39>>2]=r29;HEAP32[r17+6]=r39;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}if((r41|0)==31){r42=0}else{r42=25-(r41>>>1)|0}r41=r38<<r42;r42=HEAP32[r39>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r38|0)){break}r43=(r41>>>31<<2)+r42+16|0;r39=HEAP32[r43>>2];if((r39|0)==0){r4=437;break}else{r41=r41<<1;r42=r39}}if(r4==437){if(r43>>>0<HEAP32[9892]>>>0){_abort()}HEAP32[r43>>2]=r29;HEAP32[r17+6]=r42;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}r16=r42+8|0;r43=HEAP32[r16>>2];r4=HEAP32[9892];if(r42>>>0<r4>>>0){_abort()}if(r43>>>0<r4>>>0){_abort()}HEAP32[r43+12>>2]=r29;HEAP32[r16>>2]=r29;HEAP32[r17+2]=r43;HEAP32[r17+3]=r42;HEAP32[r17+6]=0;return}
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
