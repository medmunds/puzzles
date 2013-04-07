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
var TOTAL_STACK = Module['TOTAL_STACK'] || 65536;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 786432;
var FAST_MEMORY = Module['FAST_MEMORY'] || 786432;
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
STATICTOP += 3196;
assert(STATICTOP < TOTAL_MEMORY);
var _stderr;
allocate(8, "i8", ALLOC_NONE, 65536);
allocate([0,0,0,0,0,0,0,0,0,0,0,0,56,0,0,0,70,0,0,0,38,0,0,0,76,0,0,0,44,0,0,0,66,0,0,0,1,0,0,0,68,0,0,0,40,0,0,0,6,0,0,0,104,0,0,0,32,0,0,0,110,0,0,0,10,0,0,0,2,0,0,0,1,0,0,0,26,0,0,0,0,0,0,0,80,0,0,0,8,0,0,0,62,0,0,0,64,0,0,0,18,0,0,0,42,0,0,0,12,0,0,0,102,0,0,0,106,0,0,0,48,0,0,0,46,0,0,0,24,0,0,0,92,0,0,0,50,0,0,0,4,0,0,0,54,0,0,0,20,0,0,0,88,0,0,0,72,0,0,0,1,0,0,0,0,0,0,0,98,0,0,0,28,0,0,0,0,0,0,0,0,0,0,0,82,0,0,0,3072,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0], ALLOC_NONE, 65544);
allocate(24, "i8", ALLOC_NONE, 65736);
allocate(8, "i8", ALLOC_NONE, 65760);
allocate([255,255,255,255], "i8", ALLOC_NONE, 65768);
allocate([74,0,0,0,14,0,0,0,94,0,0,0,0,0,0,0,0,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NONE, 65772);
allocate([4,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,6,0,0,0,1,0,0,0,6,0,0,0,2,0,0,0,6,0,0,0,3,0,0,0,6,0,0,0,4,0,0,0,9,0,0,0,1,0,0,0], "i8", ALLOC_NONE, 65792);
allocate(20, "i8", ALLOC_NONE, 65856);
allocate([101,110,104,120,117,0] /* enhxu\00 */, "i8", ALLOC_NONE, 65876);
allocate(8, "i8", ALLOC_NONE, 65884);
allocate([78,0,0,0,30,0,0,0,22,0,0,0,108,0,0,0,112,0,0,0,16,0,0,0,52,0,0,0,34,0,0,0,48,0,0,0,60,0,0,0,100,0,0,0,86,0,0,0,90,0,0,0,96,0,0,0,84,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,58,0,0,0,36,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NONE, 65892);
allocate([108,97,116,105,110,46,99,0] /* latin.c\00 */, "i8", ALLOC_NONE, 65992);
allocate([102,97,116,97,108,32,101,114,114,111,114,58,32,0] /* fatal error: \00 */, "i8", ALLOC_NONE, 66000);
allocate([109,101,45,62,115,116,97,116,101,112,111,115,32,62,61,32,49,0] /* me-_statepos _= 1\00 */, "i8", ALLOC_NONE, 66016);
allocate([109,97,120,100,105,102,102,32,60,61,32,100,105,102,102,95,114,101,99,117,114,115,105,118,101,0] /* maxdiff _= diff_recu */, "i8", ALLOC_NONE, 66036);
allocate([110,32,60,32,50,42,119,43,50,0] /* n _ 2_w+2\00 */, "i8", ALLOC_NONE, 66064);
allocate([105,50,32,61,61,32,105,110,118,101,114,115,101,0] /* i2 == inverse\00 */, "i8", ALLOC_NONE, 66076);
allocate([82,117,110,110,105,110,103,32,115,111,108,118,101,114,32,115,111,97,107,32,116,101,115,116,115,10,0] /* Running solver soak  */, "i8", ALLOC_NONE, 66092);
allocate([120,43,100,120,32,60,32,48,32,124,124,32,120,43,100,120,32,62,61,32,119,32,124,124,32,121,43,100,121,32,60,32,48,32,124,124,32,121,43,100,121,32,62,61,32,119,32,124,124,32,100,115,102,95,99,97,110,111,110,105,102,121,40,100,115,102,44,32,40,121,43,100,121,41,42,119,43,40,120,43,100,120,41,41,32,33,61,32,105,0] /* x+dx _ 0 || x+dx _=  */, "i8", ALLOC_NONE, 66120);
allocate([118,50,32,61,61,32,118,49,0] /* v2 == v1\00 */, "i8", ALLOC_NONE, 66212);
allocate([115,32,33,61,32,78,85,76,76,0] /* s != NULL\00 */, "i8", ALLOC_NONE, 66224);
allocate([100,115,102,46,99,0] /* dsf.c\00 */, "i8", ALLOC_NONE, 66236);
allocate([37,115,95,84,69,83,84,83,79,76,86,69,0] /* %s_TESTSOLVE\00 */, "i8", ALLOC_NONE, 66244);
allocate([107,32,60,32,111,0] /* k _ o\00 */, "i8", ALLOC_NONE, 66260);
allocate([120,32,62,61,32,48,32,38,38,32,120,32,60,32,119,32,38,38,32,121,32,62,61,32,48,32,38,38,32,121,32,60,32,119,32,38,38,32,100,115,102,95,99,97,110,111,110,105,102,121,40,100,115,102,44,32,121,42,119,43,120,41,32,61,61,32,105,0] /* x _= 0 && x _ w && y */, "i8", ALLOC_NONE, 66268);
allocate([105,110,118,101,114,115,101,32,61,61,32,48,32,124,124,32,105,110,118,101,114,115,101,32,61,61,32,49,0] /* inverse == 0 || inve */, "i8", ALLOC_NONE, 66336);
allocate([115,0] /* s\00 */, "i8", ALLOC_NONE, 66368);
allocate([106,32,61,61,32,111,0] /* j == o\00 */, "i8", ALLOC_NONE, 66372);
allocate([107,101,101,110,46,99,0] /* keen.c\00 */, "i8", ALLOC_NONE, 66380);
allocate([33,105,110,118,101,114,115,101,0] /* !inverse\00 */, "i8", ALLOC_NONE, 66388);
allocate([109,111,118,101,115,116,114,32,38,38,32,33,109,115,103,0] /* movestr && !msg\00 */, "i8", ALLOC_NONE, 66400);
allocate([110,101,32,61,61,32,111,42,111,32,43,32,50,42,111,0] /* ne == o_o + 2_o\00 */, "i8", ALLOC_NONE, 66416);
allocate([100,114,97,119,105,110,103,46,99,0] /* drawing.c\00 */, "i8", ALLOC_NONE, 66432);
allocate([85,110,114,101,97,115,111,110,97,98,108,101,0] /* Unreasonable\00 */, "i8", ALLOC_NONE, 66444);
allocate([43,0] /* +\00 */, "i8", ALLOC_NONE, 66460);
allocate([69,120,116,114,101,109,101,0] /* Extreme\00 */, "i8", ALLOC_NONE, 66464);
allocate([72,97,114,100,0] /* Hard\00 */, "i8", ALLOC_NONE, 66472);
allocate([100,115,102,91,118,50,93,32,38,32,50,0] /* dsf[v2] & 2\00 */, "i8", ALLOC_NONE, 66480);
allocate([78,111,114,109,97,108,0] /* Normal\00 */, "i8", ALLOC_NONE, 66492);
allocate([69,97,115,121,0] /* Easy\00 */, "i8", ALLOC_NONE, 66500);
allocate([37,100,120,37,100,32,37,115,0] /* %dx%d %s\00 */, "i8", ALLOC_NONE, 66508);
allocate([100,37,99,0] /* d%c\00 */, "i8", ALLOC_NONE, 66520);
allocate([58,69,97,115,121,58,78,111,114,109,97,108,58,72,97,114,100,58,69,120,116,114,101,109,101,58,85,110,114,101,97,115,111,110,97,98,108,101,0] /* :Easy:Normal:Hard:Ex */, "i8", ALLOC_NONE, 66524);
allocate([68,105,102,102,105,99,117,108,116,121,0] /* Difficulty\00 */, "i8", ALLOC_NONE, 66564);
allocate([109,101,45,62,110,115,116,97,116,101,115,32,61,61,32,48,0] /* me-_nstates == 0\00 */, "i8", ALLOC_NONE, 66576);
allocate([109,97,120,32,62,32,48,0] /* max _ 0\00 */, "i8", ALLOC_NONE, 66596);
allocate([110,32,61,61,32,106,0] /* n == j\00 */, "i8", ALLOC_NONE, 66604);
allocate([71,114,105,100,32,115,105,122,101,0] /* Grid size\00 */, "i8", ALLOC_NONE, 66612);
allocate([85,110,107,110,111,119,110,32,100,105,102,102,105,99,117,108,116,121,32,114,97,116,105,110,103,0] /* Unknown difficulty r */, "i8", ALLOC_NONE, 66624);
allocate([102,112,111,115,32,62,61,32,48,0] /* fpos _= 0\00 */, "i8", ALLOC_NONE, 66652);
allocate([71,114,105,100,32,115,105,122,101,32,109,117,115,116,32,98,101,32,98,101,116,119,101,101,110,32,51,32,97,110,100,32,57,0] /* Grid size must be be */, "i8", ALLOC_NONE, 66664);
allocate([100,115,102,91,118,49,93,32,38,32,50,0] /* dsf[v1] & 2\00 */, "i8", ALLOC_NONE, 66700);
allocate([109,101,109,99,109,112,40,115,111,108,110,44,32,103,114,105,100,44,32,97,41,32,61,61,32,48,0] /* memcmp(soln, grid, a */, "i8", ALLOC_NONE, 66712);
allocate([37,108,100,0] /* %ld\00 */, "i8", ALLOC_NONE, 66740);
allocate([84,111,111,32,109,97,110,121,32,99,108,117,101,115,32,102,111,114,32,98,108,111,99,107,32,115,116,114,117,99,116,117,114,101,0] /* Too many clues for b */, "i8", ALLOC_NONE, 66744);
allocate([85,110,114,101,99,111,103,110,105,115,101,100,32,99,108,117,101,32,116,121,112,101,0] /* Unrecognised clue ty */, "i8", ALLOC_NONE, 66780);
allocate([84,111,111,32,102,101,119,32,99,108,117,101,115,32,102,111,114,32,98,108,111,99,107,32,115,116,114,117,99,116,117,114,101,0] /* Too few clues for bl */, "i8", ALLOC_NONE, 66804);
allocate([91,37,100,58,37,48,50,100,93,32,0] /* [%d:%02d] \00 */, "i8", ALLOC_NONE, 66840);
allocate([83,117,98,116,114,97,99,116,105,111,110,32,97,110,100,32,100,105,118,105,115,105,111,110,32,98,108,111,99,107,115,32,109,117,115,116,32,104,97,118,101,32,97,114,101,97,32,50,0] /* Subtraction and divi */, "i8", ALLOC_NONE, 66852);
allocate([109,105,100,101,110,100,46,99,0] /* midend.c\00 */, "i8", ALLOC_NONE, 66904);
allocate([115,112,97,114,101,32,33,61,32,48,0] /* spare != 0\00 */, "i8", ALLOC_NONE, 66916);
allocate([83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,32,102,97,105,108,101,100,0] /* Solve operation fail */, "i8", ALLOC_NONE, 66928);
allocate([69,120,112,101,99,116,101,100,32,39,44,39,32,97,102,116,101,114,32,98,108,111,99,107,32,115,116,114,117,99,116,117,114,101,32,100,101,115,99,114,105,112,116,105,111,110,0] /* Expected ',' after b */, "i8", ALLOC_NONE, 66952);
allocate([78,111,32,103,97,109,101,32,115,101,116,32,117,112,32,116,111,32,115,111,108,118,101,0] /* No game set up to so */, "i8", ALLOC_NONE, 67000);
allocate([78,111,116,32,101,110,111,117,103,104,32,100,97,116,97,32,105,110,32,98,108,111,99,107,32,115,116,114,117,99,116,117,114,101,32,115,112,101,99,105,102,105,99,97,116,105,111,110,0] /* Not enough data in b */, "i8", ALLOC_NONE, 67024);
allocate([37,108,100,37,115,0] /* %ld%s\00 */, "i8", ALLOC_NONE, 67076);
allocate([99,117,98,101,40,120,44,121,44,110,41,0] /* cube(x,y,n)\00 */, "i8", ALLOC_NONE, 67084);
allocate([84,104,105,115,32,103,97,109,101,32,100,111,101,115,32,110,111,116,32,115,117,112,112,111,114,116,32,116,104,101,32,83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,0] /* This game does not s */, "i8", ALLOC_NONE, 67096);
allocate([84,111,111,32,109,117,99,104,32,100,97,116,97,32,105,110,32,98,108,111,99,107,32,115,116,114,117,99,116,117,114,101,32,115,112,101,99,105,102,105,99,97,116,105,111,110,0] /* Too much data in blo */, "i8", ALLOC_NONE, 67144);
allocate([73,110,118,97,108,105,100,32,99,104,97,114,97,99,116,101,114,32,105,110,32,103,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,0] /* Invalid character in */, "i8", ALLOC_NONE, 67192);
allocate([114,97,110,100,111,109,46,99,0] /* random.c\00 */, "i8", ALLOC_NONE, 67232);
allocate([105,110,118,101,114,115,101,32,61,61,32,48,0] /* inverse == 0\00 */, "i8", ALLOC_NONE, 67244);
allocate([33,34,66,97,100,32,100,101,115,99,114,105,112,116,105,111,110,32,105,110,32,110,101,119,95,103,97,109,101,34,0] /* !\22Bad description  */, "i8", ALLOC_NONE, 67260);
allocate([100,115,102,95,115,105,122,101,40,115,116,97,116,101,45,62,99,108,117,101,115,45,62,100,115,102,44,32,105,41,32,61,61,32,50,0] /* dsf_size(state-_clue */, "i8", ALLOC_NONE, 67292);
allocate([100,114,45,62,109,101,0] /* dr-_me\00 */, "i8", ALLOC_NONE, 67328);
allocate([42,112,32,61,61,32,39,44,39,0] /* _p == ','\00 */, "i8", ALLOC_NONE, 67336);
allocate([110,32,61,61,32,50,0] /* n == 2\00 */, "i8", ALLOC_NONE, 67348);
allocate([109,32,61,61,32,97,0] /* m == a\00 */, "i8", ALLOC_NONE, 67356);
allocate([110,32,61,61,32,99,116,120,46,110,98,111,120,101,115,0] /* n == ctx.nboxes\00 */, "i8", ALLOC_NONE, 67364);
allocate([102,114,111,109,32,33,61,32,116,111,0] /* from != to\00 */, "i8", ALLOC_NONE, 67380);
allocate([77,117,108,116,105,112,108,101,32,115,111,108,117,116,105,111,110,115,32,101,120,105,115,116,32,102,111,114,32,116,104,105,115,32,112,117,122,122,108,101,0] /* Multiple solutions e */, "i8", ALLOC_NONE, 67392);
allocate([78,111,32,115,111,108,117,116,105,111,110,32,101,120,105,115,116,115,32,102,111,114,32,116,104,105,115,32,112,117,122,122,108,101,0] /* No solution exists f */, "i8", ALLOC_NONE, 67436);
allocate([107,101,101,110,0] /* keen\00 */, "i8", ALLOC_NONE, 67472);
allocate([110,32,60,61,32,111,0] /* n _= o\00 */, "i8", ALLOC_NONE, 67480);
allocate([37,100,0] /* %d\00 */, "i8", ALLOC_NONE, 67488);
allocate([37,99,37,100,44,37,100,44,37,100,0] /* %c%d,%d,%d\00 */, "i8", ALLOC_NONE, 67492);
allocate([105,110,100,101,120,32,62,61,32,48,0] /* index _= 0\00 */, "i8", ALLOC_NONE, 67504);
allocate([37,100,44,37,100,44,37,100,0] /* %d,%d,%d\00 */, "i8", ALLOC_NONE, 67516);
allocate(1, "i8", ALLOC_NONE, 67528);
allocate([110,32,62,61,32,48,32,38,38,32,110,32,60,32,109,101,45,62,110,112,114,101,115,101,116,115,0] /* n _= 0 && n _ me-_np */, "i8", ALLOC_NONE, 67532);
allocate([112,98,101,115,116,32,62,32,48,0] /* pbest _ 0\00 */, "i8", ALLOC_NONE, 67560);
allocate([33,34,83,104,111,117,108,100,32,110,101,118,101,114,32,103,101,116,32,104,101,114,101,34,0] /* !\22Should never get */, "i8", ALLOC_NONE, 67572);
allocate([37,115,95,80,82,69,83,69,84,83,0] /* %s_PRESETS\00 */, "i8", ALLOC_NONE, 67600);
allocate([45,0] /* -\00 */, "i8", ALLOC_NONE, 67612);
allocate([37,50,120,37,50,120,37,50,120,0] /* %2x%2x%2x\00 */, "i8", ALLOC_NONE, 67616);
allocate([226,136,146,0] /* \E2\88\92\00 */, "i8", ALLOC_NONE, 67628);
allocate([37,115,95,68,69,70,65,85,76,84,0] /* %s_DEFAULT\00 */, "i8", ALLOC_NONE, 67632);
allocate([37,115,95,67,79,76,79,85,82,95,37,100,0] /* %s_COLOUR_%d\00 */, "i8", ALLOC_NONE, 67644);
allocate([42,0] /* _\00 */, "i8", ALLOC_NONE, 67660);
allocate([98,105,116,115,32,60,32,51,50,0] /* bits _ 32\00 */, "i8", ALLOC_NONE, 67664);
allocate([109,97,120,102,108,111,119,46,99,0] /* maxflow.c\00 */, "i8", ALLOC_NONE, 67676);
allocate([100,105,102,102,32,61,61,32,100,105,102,102,95,114,101,99,117,114,115,105,118,101,0] /* diff == diff_recursi */, "i8", ALLOC_NONE, 67688);
allocate([195,151,0] /* \C3\97\00 */, "i8", ALLOC_NONE, 67712);
allocate([37,115,95,84,73,76,69,83,73,90,69,0] /* %s_TILESIZE\00 */, "i8", ALLOC_NONE, 67716);
allocate([111,117,116,32,111,102,32,109,101,109,111,114,121,0] /* out of memory\00 */, "i8", ALLOC_NONE, 67728);
allocate([106,32,61,61,32,110,118,0] /* j == nv\00 */, "i8", ALLOC_NONE, 67744);
allocate([109,101,45,62,100,105,114,32,33,61,32,48,0] /* me-_dir != 0\00 */, "i8", ALLOC_NONE, 67752);
allocate([114,101,116,32,33,61,32,100,105,102,102,95,117,110,102,105,110,105,115,104,101,100,0] /* ret != diff_unfinish */, "i8", ALLOC_NONE, 67768);
allocate([47,0] /* /\00 */, "i8", ALLOC_NONE, 67792);
allocate([109,101,45,62,100,114,97,119,105,110,103,0] /* me-_drawing\00 */, "i8", ALLOC_NONE, 67796);
allocate([99,111,117,110,116,32,62,32,49,0] /* count _ 1\00 */, "i8", ALLOC_NONE, 67808);
allocate([195,183,0] /* \C3\B7\00 */, "i8", ALLOC_NONE, 67820);
allocate([103,97,109,101,115,46,107,101,101,110,0] /* games.keen\00 */, "i8", ALLOC_NONE, 67824);
allocate([75,101,101,110,0] /* Keen\00 */, "i8", ALLOC_NONE, 67836);
allocate(472, "i8", ALLOC_NONE, 67844);
allocate([116,101,120,116,95,102,97,108,108,98,97,99,107,0] /* text_fallback\00 */, "i8", ALLOC_NONE, 68316);
allocate([115,116,97,116,117,115,95,98,97,114,0] /* status_bar\00 */, "i8", ALLOC_NONE, 68332);
allocate([115,111,108,118,101,114,95,99,111,109,109,111,110,0] /* solver_common\00 */, "i8", ALLOC_NONE, 68344);
allocate([115,111,108,118,101,114,0] /* solver\00 */, "i8", ALLOC_NONE, 68360);
allocate([114,97,110,100,111,109,95,117,112,116,111,0] /* random_upto\00 */, "i8", ALLOC_NONE, 68368);
allocate([111,117,116,108,105,110,101,95,98,108,111,99,107,95,115,116,114,117,99,116,117,114,101,0] /* outline_block_struct */, "i8", ALLOC_NONE, 68380);
allocate([110,101,119,95,103,97,109,101,95,100,101,115,99,0] /* new_game_desc\00 */, "i8", ALLOC_NONE, 68404);
allocate([110,101,119,95,103,97,109,101,0] /* new_game\00 */, "i8", ALLOC_NONE, 68420);
allocate([109,105,100,101,110,100,95,115,111,108,118,101,0] /* midend_solve\00 */, "i8", ALLOC_NONE, 68432);
allocate([109,105,100,101,110,100,95,114,101,115,116,97,114,116,95,103,97,109,101,0] /* midend_restart_game\ */, "i8", ALLOC_NONE, 68448);
allocate([109,105,100,101,110,100,95,114,101,100,114,97,119,0] /* midend_redraw\00 */, "i8", ALLOC_NONE, 68468);
allocate([109,105,100,101,110,100,95,114,101,97,108,108,121,95,112,114,111,99,101,115,115,95,107,101,121,0] /* midend_really_proces */, "i8", ALLOC_NONE, 68484);
allocate([109,105,100,101,110,100,95,110,101,119,95,103,97,109,101,0] /* midend_new_game\00 */, "i8", ALLOC_NONE, 68512);
allocate([109,105,100,101,110,100,95,102,101,116,99,104,95,112,114,101,115,101,116,0] /* midend_fetch_preset\ */, "i8", ALLOC_NONE, 68528);
allocate([109,97,120,102,108,111,119,95,119,105,116,104,95,115,99,114,97,116,99,104,0] /* maxflow_with_scratch */, "i8", ALLOC_NONE, 68548);
allocate([108,97,116,105,110,95,115,111,108,118,101,114,95,116,111,112,0] /* latin_solver_top\00 */, "i8", ALLOC_NONE, 68572);
allocate([108,97,116,105,110,95,115,111,108,118,101,114,95,115,101,116,0] /* latin_solver_set\00 */, "i8", ALLOC_NONE, 68592);
allocate([108,97,116,105,110,95,115,111,108,118,101,114,95,114,101,99,117,114,115,101,0] /* latin_solver_recurse */, "i8", ALLOC_NONE, 68612);
allocate([108,97,116,105,110,95,115,111,108,118,101,114,95,112,108,97,99,101,0] /* latin_solver_place\0 */, "i8", ALLOC_NONE, 68636);
allocate([108,97,116,105,110,95,115,111,108,118,101,114,95,101,108,105,109,0] /* latin_solver_elim\00 */, "i8", ALLOC_NONE, 68656);
allocate([108,97,116,105,110,95,103,101,110,101,114,97,116,101,0] /* latin_generate\00 */, "i8", ALLOC_NONE, 68676);
allocate([101,100,115,102,95,109,101,114,103,101,0] /* edsf_merge\00 */, "i8", ALLOC_NONE, 68692);
allocate([101,100,115,102,95,99,97,110,111,110,105,102,121,0] /* edsf_canonify\00 */, "i8", ALLOC_NONE, 68704);
allocate([100,114,97,119,95,116,105,108,101,0] /* draw_tile\00 */, "i8", ALLOC_NONE, 68720);
HEAP32[((65536)>>2)]=((67712)|0);
HEAP32[((65540)>>2)]=((67660)|0);
HEAP32[((65544)>>2)]=((67836)|0);
HEAP32[((65548)>>2)]=((67824)|0);
HEAP32[((65552)>>2)]=((67472)|0);
HEAP32[((65760)>>2)]=((67628)|0);
HEAP32[((65764)>>2)]=((67612)|0);
HEAP32[((65856)>>2)]=((66500)|0);
HEAP32[((65860)>>2)]=((66492)|0);
HEAP32[((65864)>>2)]=((66472)|0);
HEAP32[((65868)>>2)]=((66464)|0);
HEAP32[((65872)>>2)]=((66444)|0);
HEAP32[((65884)>>2)]=((67820)|0);
HEAP32[((65888)>>2)]=((67792)|0);
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
    }var _atol=_atoi;
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
,0,_game_changed_state,0,_solver_normal,0,_canvas_draw_update,0,_encode_ui,0,_game_anim_length
,0,_canvas_draw_line,0,_game_set_size,0,_solve_game,0,_game_print,0,_canvas_draw_rect
,0,_validate_desc,0,_canvas_unclip,0,_canvas_draw_thick_line,0,_decode_params,0,_custom_params
,0,_decode_ui,0,_free_params,0,_game_compute_size,0,_canvas_start_draw,0,_game_new_drawstate
,0,_canvas_clip,0,_game_redraw,0,_default_params,0,_canvas_text_fallback,0,_canvas_end_draw
,0,_new_ui,0,_free_ui,0,_dup_params,0,_game_configure,0,_game_fetch_preset
,0,_game_status,0,_solver_easy,0,_encode_params,0,_canvas_draw_text,0,_game_can_format_as_text_now
,0,_game_timing_state,0,_canvas_blitter_load,0,_canvas_blitter_new,0,_game_flash_length,0,_canvas_blitter_free
,0,_game_colours,0,_solver_hard,0,_canvas_blitter_save,0,_game_print_size,0,_canvas_status_bar
,0,_interpret_move,0,_new_game_desc,0,_execute_move,0,_canvas_draw_poly,0,_new_game,0,_canvas_draw_circle,0];
// EMSCRIPTEN_START_FUNCS
function _validate_params(r1,r2){var r3;if((HEAP32[r1>>2]-3|0)>>>0>6){r3=66664;return r3}r3=(HEAP32[r1+4>>2]|0)>4?66624:0;return r3}function _decode_params(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=0;r4=_atoi(r2);HEAP32[r1>>2]=r4;r4=r2;while(1){r5=HEAP8[r4];if(r5<<24>>24==0){r3=21;break}r6=r4+1|0;if(((r5&255)-48|0)>>>0<10){r4=r6}else{break}}if(r3==21){return}if(r5<<24>>24!=100){return}r5=(r1+4|0)>>2;HEAP32[r5]=6;r1=HEAP8[r6];if(r1<<24>>24==101){HEAP32[r5]=0;r7=HEAP8[r6]}else if(r1<<24>>24==0){return}else{r7=r1}if(r7<<24>>24==110){HEAP32[r5]=1;r8=HEAP8[r6]}else{r8=r7}if(r8<<24>>24==104){HEAP32[r5]=2;r9=HEAP8[r6]}else{r9=r8}if(r9<<24>>24==120){HEAP32[r5]=3;r10=HEAP8[r6]}else{r10=r9}if(r10<<24>>24!=117){return}HEAP32[r5]=4;return}function _free_params(r1){if((r1|0)==0){return}_free(r1);return}function _default_params(){var r1,r2;r1=STACKTOP;r2=_malloc(8);if((r2|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r2>>2]=6;HEAP32[r2+4>>2]=1;STACKTOP=r1;return r2}}function _game_fetch_preset(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=STACKTOP;STACKTOP=STACKTOP+80|0;if((r1|0)<0|r1>>>0>7){r5=0;STACKTOP=r4;return r5}r6=_malloc(8);if((r6|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r7=(r1<<3)+65792|0;r1=r6;r8=HEAP32[r7>>2];r9=HEAP32[r7+4>>2];HEAP32[r1>>2]=r8;HEAP32[r1+4>>2]=r9;r1=r4|0;r7=r8;r8=HEAP32[(r9<<2)+65856>>2];_sprintf(r1,66508,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r7,HEAP32[tempInt+4>>2]=r7,HEAP32[tempInt+8>>2]=r8,tempInt));r8=_malloc(_strlen(r1)+1|0);if((r8|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r8,r1);HEAP32[r2>>2]=r8;HEAP32[r3>>2]=r6;r5=1;STACKTOP=r4;return r5}function _encode_params(r1,r2){var r3,r4,r5;r3=STACKTOP;STACKTOP=STACKTOP+80|0;r4=r3;r5=r4|0;_sprintf(r5,67488,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r1>>2],tempInt));if((r2|0)!=0){_sprintf(r4+_strlen(r5)|0,66520,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[HEAP32[r1+4>>2]+65876|0]<<24>>24,tempInt))}r1=_malloc(_strlen(r5)+1|0);if((r1|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r1,r5);STACKTOP=r3;return r1}}function _dup_params(r1){var r2,r3,r4,r5;r2=STACKTOP;r3=_malloc(8);if((r3|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r4=r1;r1=r3;r5=HEAP32[r4+4>>2];HEAP32[r1>>2]=HEAP32[r4>>2];HEAP32[r1+4>>2]=r5;STACKTOP=r2;return r3}}function _game_configure(r1){var r2,r3,r4,r5,r6;r2=STACKTOP;STACKTOP=STACKTOP+80|0;r3=_malloc(48),r4=r3>>2;if((r3|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4]=66612;HEAP32[r4+1]=0;r5=r2|0;_sprintf(r5,67488,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r1>>2],tempInt));r6=_malloc(_strlen(r5)+1|0);if((r6|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r6,r5);HEAP32[r4+2]=r6;HEAP32[r4+3]=0;HEAP32[r4+4]=66564;HEAP32[r4+5]=1;HEAP32[r4+6]=66524;HEAP32[r4+7]=HEAP32[r1+4>>2];HEAP32[r4+8]=0;HEAP32[r4+9]=3;HEAP32[r4+10]=0;HEAP32[r4+11]=0;STACKTOP=r2;return r3}}function _custom_params(r1){var r2,r3,r4;r2=STACKTOP;r3=_malloc(8);if((r3|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r4=_atoi(HEAP32[r1+8>>2]);HEAP32[r3>>2]=r4;HEAP32[r3+4>>2]=HEAP32[r1+28>>2];STACKTOP=r2;return r3}}function _new_game_desc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126;r4=0;r5=STACKTOP;r6=HEAP32[r1>>2];r7=Math.imul(r6,r6);r8=HEAP32[r1+4>>2];r1=(r6|0)==3&(r8|0)>1?1:r8;r8=r7<<2;r9=_malloc(r8);if((r9|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=r9>>2;r11=_malloc(r8);if((r11|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r12=r11>>2;r13=_malloc(r8);if((r13|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r14=r13,r15=r14>>2;r16=_malloc(r8);if((r16|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r17=r16,r18=r17>>2;r19=(r7|0)!=0;L87:do{if(r19){r20=0;while(1){HEAP32[(r20<<2>>2)+r18]=6;r21=r20+1|0;if((r21|0)==(r7|0)){break L87}else{r20=r21}}}}while(0);r20=_malloc(r8);if((r20|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r21=r20,r22=r21>>2;r23=_malloc(r8);if((r23|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r8=r23;r24=_malloc(r7);if((r24|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r25=(r7|0)==0;r26=(r1|0)>0;r27=r1-1|0;r28=r6<<1;r29=r28-2|0;r30=(r6|0)<1;r31=(r1|0)>1;r32=r6-1|0;r33=r6+1|0;r34=(r7|0)>1?r7<<2:4;r35=0;while(1){if((r35|0)!=0){_free(r35)}r36=_latin_generate(r6,r2);L105:do{if(r25){_shuffle(r9,r7,4,r2)}else{r37=0;while(1){HEAP32[(r37<<2>>2)+r10]=r37;r38=r37+1|0;if((r38|0)<(r7|0)){r37=r38}else{break}}_shuffle(r9,r7,4,r2);if(r25){break}else{r39=0}while(1){HEAP32[(HEAP32[(r39<<2>>2)+r10]<<2>>2)+r12]=r39;r37=r39+1|0;if((r37|0)<(r7|0)){r39=r37}else{break}}if(r25){break}else{r40=0}while(1){HEAP32[(r40<<2>>2)+r15]=1;r37=r40+1|0;if((r37|0)<(r7|0)){r40=r37}else{break L105}}}}while(0);L116:do{if(r19){r37=0;while(1){HEAP32[(r37<<2>>2)+r18]=6;r38=r37+1|0;if((r38|0)==(r7|0)){break L116}else{r37=r38}}}}while(0);do{if(r25){r4=151}else{r37=0;while(1){r38=(r37<<2)+r14|0;do{if((HEAP32[r38>>2]|0)!=0){r41=(r37|0)%(r6|0);r42=(r37|0)/(r6|0)&-1;if((r41|0)>0){r43=r37-1|0;r44=(HEAP32[(r43<<2>>2)+r15]|0)==0?-1:r43}else{r44=-1}do{if((r41+1|0)<(r6|0)){r43=r37+1|0;if((HEAP32[(r43<<2>>2)+r15]|0)==0){r45=r44;break}if((r44|0)!=-1){if((HEAP32[(r43<<2>>2)+r12]|0)>=(HEAP32[(r44<<2>>2)+r12]|0)){r45=r44;break}}r45=r43}else{r45=r44}}while(0);do{if((r42|0)>0){r41=r37-r6|0;if((HEAP32[(r41<<2>>2)+r15]|0)==0){r46=r45;break}if((r45|0)!=-1){if((HEAP32[(r41<<2>>2)+r12]|0)>=(HEAP32[(r45<<2>>2)+r12]|0)){r46=r45;break}}r46=r41}else{r46=r45}}while(0);do{if((r42+1|0)<(r6|0)){r41=r37+r6|0;if((HEAP32[(r41<<2>>2)+r15]|0)==0){r47=r46;break}if((r46|0)!=-1){if((HEAP32[(r41<<2>>2)+r12]|0)>=(HEAP32[(r46<<2>>2)+r12]|0)){r47=r46;break}}r47=r41}else{r47=r46}}while(0);if((r47|0)<=-1){break}while(1){r48=_random_bits(r2,6);if(r48>>>0<64){break}}if(r48>>>0<16){break}HEAP32[(r47<<2>>2)+r15]=0;HEAP32[r38>>2]=0;_edsf_merge(r17,r37,r47,0)}}while(0);r38=r37+1|0;if((r38|0)<(r7|0)){r37=r38}else{break}}if(r25){r4=151;break}else{r49=0}while(1){r37=(r49<<2)+r14|0;do{if((HEAP32[r37>>2]|0)!=0){r38=(r49|0)%(r6|0);r42=(r49|0)/(r6|0)&-1;r41=(r38|0)>0?r49-1|0:-1;do{if((r38+1|0)<(r6|0)){r43=r49+1|0;if((r41|0)!=-1){if((HEAP32[(r43<<2>>2)+r12]|0)>=(HEAP32[(r41<<2>>2)+r12]|0)){r50=r41;break}}r50=r43}else{r50=r41}}while(0);do{if((r42|0)>0){r41=r49-r6|0;if((r50|0)!=-1){if((HEAP32[(r41<<2>>2)+r12]|0)>=(HEAP32[(r50<<2>>2)+r12]|0)){r51=r50;break}}r51=r41}else{r51=r50}}while(0);do{if((r42+1|0)<(r6|0)){r41=r49+r6|0;if((r51|0)!=-1){if((HEAP32[(r41<<2>>2)+r12]|0)>=(HEAP32[(r51<<2>>2)+r12]|0)){r52=r51;break}}r52=r41}else{r52=r51}}while(0);if((r52|0)<=-1){break}HEAP32[r37>>2]=0;_edsf_merge(r17,r49,r52,0)}}while(0);r37=r49+1|0;if((r37|0)<(r7|0)){r49=r37}else{break}}if(r25){_shuffle(r9,r7,4,r2);r53=0;r54=0;break}else{r55=0}while(1){r37=((r55<<2)+r14|0)>>2;HEAP32[r37]=0;r42=(r55<<2)+r17|0;r41=HEAP32[r42>>2];do{if((r41&2|0)==0){r38=0;r43=r41;while(1){r56=r43&1^r38;r57=r43>>2;r58=HEAP32[(r57<<2>>2)+r18];if((r58&2|0)==0){r38=r56;r43=r58}else{break}}L188:do{if((r57|0)==(r55|0)){r59=r56;r60=r55}else{r43=r57<<2;r38=r41>>2;r58=r56^r41&1;HEAP32[r42>>2]=r56|r43;if((r38|0)==(r57|0)){r59=r58;r60=r57;break}else{r61=r38;r62=r58}while(1){r58=(r61<<2)+r17|0;r38=HEAP32[r58>>2];r63=r38>>2;r64=r62^r38&1;HEAP32[r58>>2]=r62|r43;if((r63|0)==(r57|0)){r59=r64;r60=r57;break L188}else{r61=r63;r62=r64}}}}while(0);if((r59|0)==0){r65=r60;break}___assert_func(66236,137,68704,67244);r65=r60}else{r65=r55}}while(0);r42=_dsf_size(r17,r65);do{if((r65|0)==(r55|0)&(r42|0)>2){HEAP32[r37]=HEAP32[r37]|5}else{if(!((r65|0)!=(r55|0)&(r42|0)==2)){break}r41=HEAP8[r36+r65|0];r43=r41&255;r64=HEAP8[r36+r55|0];r63=r64&255;r58=(r41&255)<(r64&255);r64=r58?r63:r43;r41=r58?r43:r63;r63=r64+r41|0;r43=(r65<<2)+r14|0;r58=HEAP32[r43>>2];if((r63|0)>4&(r63|0)<(r29|0)){r63=r58|1;r66=r63;r67=r63}else{r63=r58|16;r66=r63;r67=r63}HEAP32[r43>>2]=r67;r43=Math.imul(r64,r41);L203:do{if(r30){r68=0}else{r63=0;r58=1;while(1){if(((r43|0)%(r58|0)|0)==0){r38=(r43|0)/(r58|0)&-1;r69=(((r38|0)>(r6|0)|(r38|0)==(r58|0))&1^1)+r63|0}else{r69=r63}r38=r58+1|0;if((r38|0)==(r33|0)){r68=r69;break L203}else{r63=r69;r58=r38}}}}while(0);r43=(r65<<2)+r14|0;r58=r66|((r68|0)<3&r31?64:4);r63=(r64-r41|0)<(r32|0)?r58|2:r58;HEAP32[r43>>2]=r63;if(((r64>>>0)%(r41>>>0)|0)!=0){break}if((Math.floor((r64>>>0)/(r41>>>0))<<1|0)>(r6|0)){break}HEAP32[r43>>2]=r63|8}}while(0);r42=r55+1|0;if((r42|0)<(r7|0)){r55=r42}else{break}}_shuffle(r9,r7,4,r2);if(r25){r53=0;r54=0;break}_memset(r20,0,r34);r53=0;r54=0;break}}while(0);do{if(r4==151){r4=0;_shuffle(r9,r7,4,r2);r53=0;r54=0;break}}while(0);while(1){if((r54|0)>=4){if((r53|0)==0){break}else{r53=0;r54=0;continue}}if((r54|0)==1){r70=2;r71=1073741824}else if((r54|0)==2){r70=4;r71=536870912}else if((r54|0)==0){r70=8;r71=1610612736}else{r70=1;r71=0}r42=0;while(1){if((r42|0)>=(r7|0)){break}r72=HEAP32[(r42<<2>>2)+r10];r73=(r72<<2)+r14|0;if((HEAP32[r73>>2]&r70|0)==0){r42=r42+1|0}else{r4=162;break}}if(r4==162){r4=0;HEAP32[(r72<<2>>2)+r22]=r71;HEAP32[r73>>2]=0}L233:do{if((r42|0)==(r7|0)){r37=r70<<4;r63=0;while(1){if((r63|0)>=(r7|0)){r74=r63;break L233}r75=HEAP32[(r63<<2>>2)+r10];r76=(r75<<2)+r14|0;if((HEAP32[r76>>2]&r37|0)==0){r63=r63+1|0}else{break}}HEAP32[(r75<<2>>2)+r22]=r71;HEAP32[r76>>2]=0;r74=r63}else{r74=r42}}while(0);r53=(r74|0)<(r7|0)?1:r53;r54=r54+1|0}L241:do{if(!r25){r42=0;while(1){r37=(r42<<2)+r17|0;r43=HEAP32[r37>>2];do{if((r43&2|0)==0){r58=0;r38=r43;while(1){r77=r38&1^r58;r78=r38>>2;r79=HEAP32[(r78<<2>>2)+r18];if((r79&2|0)==0){r58=r77;r38=r79}else{break}}L248:do{if((r78|0)==(r42|0)){r80=r77;r81=r42}else{r38=r78<<2;r58=r43>>2;r41=r77^r43&1;HEAP32[r37>>2]=r77|r38;if((r58|0)==(r78|0)){r80=r41;r81=r78;break}else{r82=r58;r83=r41}while(1){r41=(r82<<2)+r17|0;r58=HEAP32[r41>>2];r64=r58>>2;r79=r83^r58&1;HEAP32[r41>>2]=r83|r38;if((r64|0)==(r78|0)){r80=r79;r81=r78;break L248}else{r82=r64;r83=r79}}}}while(0);if((r80|0)!=0){___assert_func(66236,137,68704,67244)}if((r81|0)==(r42|0)){r4=179;break}r38=HEAP32[(r81<<2>>2)+r22];if((r38|0)==0){r79=(r81<<2)+r8|0;HEAP32[r79>>2]=HEAP32[r79>>2]+HEAPU8[r36+r42|0]|0;break}else if((r38|0)==536870912){r79=(r81<<2)+r8|0;r64=Math.imul(HEAP32[r79>>2],HEAPU8[r36+r42|0]);HEAP32[r79>>2]=r64;break}else if((r38|0)==1073741824){r64=(r81<<2)+r8|0;r79=HEAP32[r64>>2]-HEAPU8[r36+r42|0]|0;HEAP32[r64>>2]=(r79|0)>-1?r79:-r79|0;break}else if((r38|0)==1610612736){r38=((r81<<2)+r8|0)>>2;r79=HEAP32[r38];r64=HEAP8[r36+r42|0];r41=r64&255;if((r79|0)==0|r64<<24>>24==0){HEAP32[r38]=0;break}else{HEAP32[r38]=((r79|0)/(r41|0)&-1)+((r41|0)/(r79|0)&-1)|0;break}}else{break}}else{r4=179}}while(0);if(r4==179){r4=0;HEAP32[r8+(r42<<2)>>2]=HEAPU8[r36+r42|0]}r37=r42+1|0;if((r37|0)<(r7|0)){r42=r37}else{break}}if(r25){break}else{r84=0}while(1){r42=(r84<<2)+r17|0;r37=HEAP32[r42>>2];do{if((r37&2|0)==0){r43=0;r63=r37;while(1){r85=r63&1^r43;r86=r63>>2;r79=HEAP32[(r86<<2>>2)+r18];if((r79&2|0)==0){r43=r85;r63=r79}else{break}}L275:do{if((r86|0)==(r84|0)){r87=r85;r88=r84}else{r63=r86<<2;r43=r37>>2;r79=r85^r37&1;HEAP32[r42>>2]=r85|r63;if((r43|0)==(r86|0)){r87=r79;r88=r86;break}else{r89=r43;r90=r79}while(1){r79=(r89<<2)+r17|0;r43=HEAP32[r79>>2];r41=r43>>2;r38=r90^r43&1;HEAP32[r79>>2]=r90|r63;if((r41|0)==(r86|0)){r87=r38;r88=r86;break L275}else{r89=r41;r90=r38}}}}while(0);if((r87|0)!=0){___assert_func(66236,137,68704,67244)}if((r88|0)==(r84|0)){r4=197;break}else{break}}else{r4=197}}while(0);if(r4==197){r4=0;r42=(r84<<2)+r21|0;HEAP32[r42>>2]=HEAP32[r42>>2]|HEAP32[r8+(r84<<2)>>2]}r42=r84+1|0;if((r42|0)<(r7|0)){r84=r42}else{break L241}}}}while(0);if(r26){_memset(r24,0,r7);if((_solver(r6,r17,r21,r24,r27)|0)<=(r27|0)){r35=r36;continue}}_memset(r24,0,r7);if((_solver(r6,r17,r21,r24,r1)|0)==(r1|0)){break}else{r35=r36}}r35=_malloc(r7*40&-1);if((r35|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r1=Math.imul(r28,r32);L294:do{if((r1|0)<0){r91=r35}else{r28=Math.imul(r32,r6);r27=0;r26=0;r84=r35;while(1){do{if((r26|0)==(r1|0)){r4=230}else{r8=(r26|0)/(r32|0)&-1;if((r26|0)<(r28|0)){r88=(r26|0)%(r32|0)+Math.imul(r8,r6)|0;r92=r88+1|0;r93=r88}else{r88=r8-r6|0;r8=(r26|0)%(r32|0);r87=Math.imul(r8,r6)+r88|0;r92=Math.imul(r8+1|0,r6)+r88|0;r93=r87}if((r93|0)<=-1){___assert_func(66236,110,68704,67504)}r87=(r93<<2)+r17|0;r88=HEAP32[r87>>2];do{if((r88&2|0)==0){r8=0;r90=r88;while(1){r94=r90&1^r8;r95=r90>>2;r89=HEAP32[(r95<<2>>2)+r18];if((r89&2|0)==0){r8=r94;r90=r89}else{break}}L311:do{if((r95|0)==(r93|0)){r96=r94;r97=r93}else{r90=r95<<2;r8=r88>>2;r89=r94^r88&1;HEAP32[r87>>2]=r94|r90;if((r8|0)==(r95|0)){r96=r89;r97=r95;break}else{r98=r8;r99=r89}while(1){r89=(r98<<2)+r17|0;r8=HEAP32[r89>>2];r86=r8>>2;r85=r8&1^r99;HEAP32[r89>>2]=r99|r90;if((r86|0)==(r95|0)){r96=r85;r97=r95;break L311}else{r98=r86;r99=r85}}}}while(0);if((r96|0)==0){r100=r97;break}___assert_func(66236,137,68704,67244);r100=r97}else{r100=r93}}while(0);if((r92|0)<=-1){___assert_func(66236,110,68704,67504)}r87=(r92<<2)+r17|0;r88=HEAP32[r87>>2];do{if((r88&2|0)==0){r90=0;r85=r88;while(1){r101=r85&1^r90;r102=r85>>2;r86=HEAP32[(r102<<2>>2)+r18];if((r86&2|0)==0){r90=r101;r85=r86}else{break}}L325:do{if((r102|0)==(r92|0)){r103=r101;r104=r92}else{r85=r102<<2;r90=r88>>2;r86=r101^r88&1;HEAP32[r87>>2]=r101|r85;if((r90|0)==(r102|0)){r103=r86;r104=r102;break}else{r105=r90;r106=r86}while(1){r86=(r105<<2)+r17|0;r90=HEAP32[r86>>2];r89=r90>>2;r8=r90&1^r106;HEAP32[r86>>2]=r106|r85;if((r89|0)==(r102|0)){r103=r8;r104=r102;break L325}else{r105=r89;r106=r8}}}}while(0);if((r103|0)==0){r107=r104;break}___assert_func(66236,137,68704,67244);r107=r104}else{r107=r92}}while(0);if((r100|0)!=(r107|0)){r4=230;break}r108=r84;r109=r27+1|0;break}}while(0);if(r4==230){r4=0;if((r27|0)>25){r87=Math.floor(((r27-26|0)>>>0)/25);r88=r87+1|0;_memset(r84,122,r88);r110=r27-25+(r87*-25&-1)|0;r111=r84+r88|0}else{r110=r27;r111=r84}if((r110|0)==0){r112=95}else{r112=r110+96&255}HEAP8[r111]=r112;r108=r111+1|0;r109=0}r88=r26+1|0;if((r88|0)>(r1|0)){break}else{r27=r109;r26=r88;r84=r108}}if(r108>>>0>r35>>>0){r113=r35;r114=r35}else{r91=r35;break}while(1){r84=HEAP8[r114];r26=r113+1|0;HEAP8[r113]=r84;r27=0;while(1){r115=r114+r27|0;if(r115>>>0>=r108>>>0){r116=0;break}if(HEAP8[r115]<<24>>24==r84<<24>>24){r27=r27+1|0}else{r116=1;break}}do{if((r27|0)==2){HEAP8[r26]=r84;r117=r113+2|0}else{if((r27|0)<=2){r117=r26;break}r117=r113+_sprintf(r26,67488,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r27,tempInt))+1|0}}while(0);if(r116){r113=r117;r114=r115}else{r91=r117;break L294}}}}while(0);r117=r91+1|0;HEAP8[r91]=44;L355:do{if(r25){r118=r117}else{r91=r117;r115=0;while(1){r114=(r115<<2)+r17|0;r113=HEAP32[r114>>2];do{if((r113&2|0)==0){r116=0;r108=r113;while(1){r119=r108&1^r116;r120=r108>>2;r109=HEAP32[(r120<<2>>2)+r18];if((r109&2|0)==0){r116=r119;r108=r109}else{break}}L362:do{if((r120|0)==(r115|0)){r121=r119;r122=r115}else{r108=r120<<2;r116=r113>>2;r109=r119^r113&1;HEAP32[r114>>2]=r119|r108;if((r116|0)==(r120|0)){r121=r109;r122=r120;break}else{r123=r116;r124=r109}while(1){r109=(r123<<2)+r17|0;r116=HEAP32[r109>>2];r1=r116>>2;r111=r124^r116&1;HEAP32[r109>>2]=r124|r108;if((r1|0)==(r120|0)){r121=r111;r122=r120;break L362}else{r123=r1;r124=r111}}}}while(0);if((r121|0)!=0){___assert_func(66236,137,68704,67244)}if((r122|0)==(r115|0)){r4=254;break}else{r125=r91;break}}else{r4=254}}while(0);if(r4==254){r4=0;r114=(r115<<2)+r21|0;r113=HEAP32[r114>>2]&1610612736;if((r113|0)==0){HEAP8[r91]=97;r126=r91+1|0}else if((r113|0)==1073741824){HEAP8[r91]=115;r126=r91+1|0}else if((r113|0)==536870912){HEAP8[r91]=109;r126=r91+1|0}else if((r113|0)==1610612736){HEAP8[r91]=100;r126=r91+1|0}else{r126=r91}r125=r126+_sprintf(r126,66740,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r114>>2]&-1610612737,tempInt))|0}r114=r115+1|0;if((r114|0)<(r7|0)){r91=r125;r115=r114}else{r118=r125;break L355}}}}while(0);HEAP8[r118]=0;r125=_realloc(r35,r118+1-r35|0);if((r125|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}if((_memcmp(r24,r36,r7)|0)!=0){___assert_func(66380,1109,68404,66712)}r35=_malloc(r7+2|0);if((r35|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r3>>2]=r35;HEAP8[r35]=83;L389:do{if(!r25){r35=0;while(1){r118=r35+1|0;HEAP8[HEAP32[r3>>2]+r118|0]=HEAP8[r24+r35|0]+48&255;if((r118|0)<(r7|0)){r35=r118}else{break L389}}}}while(0);HEAP8[HEAP32[r3>>2]+r7+1|0]=0;if((r36|0)==0){_free(r9);_free(r11);_free(r13);_free(r16);_free(r20);_free(r23);_free(r24);STACKTOP=r5;return r125}_free(r36);_free(r9);_free(r11);_free(r13);_free(r16);_free(r20);_free(r23);_free(r24);STACKTOP=r5;return r125}function _game_can_format_as_text_now(r1){return 1}function _game_text_format(r1){return 0}function _encode_ui(r1){return 0}function _decode_ui(r1,r2){return}function _game_changed_state(r1,r2,r3){var r4;r2=r1+12|0;if((HEAP32[r2>>2]|0)==0){return}if((HEAP32[r1+8>>2]|0)==0){return}if((HEAP32[r1+16>>2]|0)!=0){return}r4=Math.imul(HEAP32[r1+4>>2],HEAP32[r3>>2]);if(HEAP8[HEAP32[r3+12>>2]+r4+HEAP32[r1>>2]|0]<<24>>24==0){return}HEAP32[r2>>2]=0;return}function _free_game(r1){var r2,r3,r4,r5,r6,r7;r2=HEAP32[r1+12>>2];if((r2|0)!=0){_free(r2)}r2=HEAP32[r1+16>>2];if((r2|0)!=0){_free(r2)}r2=(r1+8|0)>>2;r3=HEAP32[r2]|0;r4=HEAP32[r3>>2]-1|0;HEAP32[r3>>2]=r4;do{if((r4|0)<1){r3=HEAP32[r2];r5=HEAP32[r3+8>>2];if((r5|0)==0){r6=r3}else{_free(r5);r6=HEAP32[r2]}r5=HEAP32[r6+12>>2];if((r5|0)==0){r7=r6}else{_free(r5);r7=HEAP32[r2]}if((r7|0)==0){break}_free(r7)}}while(0);if((r1|0)==0){return}_free(r1);return}function _free_ui(r1){if((r1|0)==0){return}_free(r1);return}function _validate_desc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+4|0;r5=r4,r6=r5>>2;r7=HEAP32[r1>>2];r1=Math.imul(r7,r7);HEAP32[r6]=r2;r2=_malloc(r1<<2);if((r2|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r8=r2;r9=(r1|0)==0;L445:do{if(!r9){r10=0;while(1){HEAP32[r8+(r10<<2)>>2]=6;r11=r10+1|0;if((r11|0)==(r1|0)){break L445}else{r10=r11}}}}while(0);r10=_parse_block_structure(r5,r7,r8);if((r10|0)!=0){_free(r2);r12=r10;STACKTOP=r4;return r12}r10=HEAP32[r6];if(HEAP8[r10]<<24>>24!=44){r12=66952;STACKTOP=r4;return r12}r2=r10+1|0;HEAP32[r6]=r2;L456:do{if(r9){r13=r2}else{r10=0;r7=r2;L457:while(1){r5=(r10<<2)+r8|0;r11=HEAP32[r5>>2];do{if((r11&2|0)==0){r14=0;r15=r11;while(1){r16=r15&1^r14;r17=r15>>2;r18=HEAP32[r8+(r17<<2)>>2];if((r18&2|0)==0){r14=r16;r15=r18}else{break}}L463:do{if((r17|0)==(r10|0)){r19=r16;r20=r10}else{r15=r17<<2;r14=r11>>2;r18=r16^r11&1;HEAP32[r5>>2]=r16|r15;if((r14|0)==(r17|0)){r19=r18;r20=r17;break}else{r21=r14;r22=r18}while(1){r18=(r21<<2)+r8|0;r14=HEAP32[r18>>2];r23=r14>>2;r24=r22^r14&1;HEAP32[r18>>2]=r22|r15;if((r23|0)==(r17|0)){r19=r24;r20=r17;break L463}else{r21=r23;r22=r24}}}}while(0);if((r19|0)!=0){___assert_func(66236,137,68704,67244)}if((r20|0)==(r10|0)){r3=326;break}else{r25=r7;break}}else{r3=326}}while(0);if(r3==326){r3=0;r5=HEAP8[r7];do{if(r5<<24>>24==100|r5<<24>>24==115){if((_dsf_size(r8,r10)|0)==2){r26=r7;break}else{r27=66852;break L457}}else if(r5<<24>>24==97|r5<<24>>24==109){r26=r7}else if(r5<<24>>24==0){r27=66804;break L457}else{r12=66780;r3=337;break L457}}while(0);while(1){r28=r26+1|0;r5=HEAP8[r28];if(r5<<24>>24==0){break}if(((r5&255)-48|0)>>>0<10){r26=r28}else{break}}HEAP32[r6]=r28;r25=r28}r5=r10+1|0;if((r5|0)<(r1|0)){r10=r5;r7=r25}else{r13=r25;break L456}}if(r3==337){STACKTOP=r4;return r12}r12=r27;STACKTOP=r4;return r12}}while(0);r12=HEAP8[r13]<<24>>24==0?0:66744;STACKTOP=r4;return r12}function _new_game(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r1=0;r4=STACKTOP;STACKTOP=STACKTOP+4|0;r5=r4,r6=r5>>2;r7=HEAP32[r2>>2];r8=Math.imul(r7,r7);r9=_malloc(28);if((r9|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=r9;HEAP32[r6]=r3;r3=r2;r2=r9;r11=HEAP32[r3+4>>2];HEAP32[r2>>2]=HEAP32[r3>>2];HEAP32[r2+4>>2]=r11;r11=_malloc(16);if((r11|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r2=(r9+8|0)>>2;HEAP32[r2]=r11;HEAP32[r11>>2]=1;HEAP32[HEAP32[r2]+4>>2]=r7;r11=r8<<2;r3=_malloc(r11);if((r3|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r12=r3;r3=(r8|0)==0;L496:do{if(!r3){r13=0;while(1){HEAP32[r12+(r13<<2)>>2]=6;r14=r13+1|0;if((r14|0)==(r8|0)){break L496}else{r13=r14}}}}while(0);HEAP32[HEAP32[r2]+8>>2]=r12;_parse_block_structure(r5,r7,HEAP32[HEAP32[r2]+8>>2]);r7=HEAP32[r6];if(HEAP8[r7]<<24>>24!=44){___assert_func(66380,1194,68420,67336)}r5=r7+1|0;HEAP32[r6]=r5;r7=_malloc(r11);if((r7|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[HEAP32[r2]+12>>2]=r7;L506:do{if(!r3){r7=0;r12=r5;while(1){r13=HEAP32[HEAP32[r2]+8>>2];r14=(r7<<2)+r13|0;r15=HEAP32[r14>>2];do{if((r15&2|0)==0){r16=0;r17=r15;while(1){r18=r17&1^r16;r19=r17>>2;r20=HEAP32[r13+(r19<<2)>>2];if((r20&2|0)==0){r16=r18;r17=r20}else{break}}L513:do{if((r19|0)==(r7|0)){r21=r18;r22=r7}else{r17=r19<<2;r16=r15>>2;r20=r18^r15&1;HEAP32[r14>>2]=r18|r17;if((r16|0)==(r19|0)){r21=r20;r22=r19;break}else{r23=r16;r24=r20}while(1){r20=(r23<<2)+r13|0;r16=HEAP32[r20>>2];r25=r16>>2;r26=r24^r16&1;HEAP32[r20>>2]=r24|r17;if((r25|0)==(r19|0)){r21=r26;r22=r19;break L513}else{r23=r25;r24=r26}}}}while(0);if((r21|0)!=0){___assert_func(66236,137,68704,67244)}if((r22|0)==(r7|0)){r1=361;break}HEAP32[HEAP32[HEAP32[r2]+12>>2]+(r7<<2)>>2]=0;r27=r12;break}else{r1=361}}while(0);if(r1==361){r1=0;r13=HEAP8[r12]<<24>>24;do{if((r13|0)==109){r28=536870912}else if((r13|0)==115){if((_dsf_size(HEAP32[HEAP32[r2]+8>>2],r7)|0)==2){r28=1073741824;break}___assert_func(66380,1210,68420,67292);r28=1073741824}else if((r13|0)==100){if((_dsf_size(HEAP32[HEAP32[r2]+8>>2],r7)|0)==2){r28=1610612736;break}___assert_func(66380,1214,68420,67292);r28=1610612736}else if((r13|0)==97){r28=0}else{___assert_func(66380,1217,68420,67260);r28=0}}while(0);r13=r12+1|0;HEAP32[r6]=r13;r14=_atoi(r13)|r28;r15=HEAP8[r13];L532:do{if(r15<<24>>24==0){r29=r13}else{r17=r15;r26=r13;while(1){if(((r17&255)-48|0)>>>0>=10){r29=r26;break L532}r25=r26+1|0;HEAP32[r6]=r25;r20=HEAP8[r25];if(r20<<24>>24==0){r29=r25;break L532}else{r17=r20;r26=r25}}}}while(0);HEAP32[HEAP32[HEAP32[r2]+12>>2]+(r7<<2)>>2]=r14;r27=r29}r13=r7+1|0;if((r13|0)<(r8|0)){r7=r13;r12=r27}else{break L506}}}}while(0);r27=_malloc(r8);if((r27|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r29=r9+12|0;HEAP32[r29>>2]=r27;r27=_malloc(r11);if((r27|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r11=r9+16|0;HEAP32[r11>>2]=r27;if(r3){r30=r9+24|0;r31=r30;HEAP32[r31>>2]=0;r32=r9+20|0;r33=r32;HEAP32[r33>>2]=0;STACKTOP=r4;return r10}else{r34=0}while(1){HEAP8[HEAP32[r29>>2]+r34|0]=0;HEAP32[HEAP32[r11>>2]+(r34<<2)>>2]=0;r3=r34+1|0;if((r3|0)<(r8|0)){r34=r3}else{break}}r30=r9+24|0;r31=r30;HEAP32[r31>>2]=0;r32=r9+20|0;r33=r32;HEAP32[r33>>2]=0;STACKTOP=r4;return r10}function _dup_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=r1>>2;r3=STACKTOP;r4=HEAP32[r2];r5=Math.imul(r4,r4);r4=_malloc(28),r6=r4>>2;if((r4|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r7=r1;r1=r4;r8=HEAP32[r7+4>>2];HEAP32[r1>>2]=HEAP32[r7>>2];HEAP32[r1+4>>2]=r8;r8=HEAP32[r2+2];HEAP32[r6+2]=r8;r1=r8|0;HEAP32[r1>>2]=HEAP32[r1>>2]+1|0;r1=_malloc(r5);if((r1|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r8=r4+12|0;HEAP32[r8>>2]=r1;r1=r5<<2;r7=_malloc(r1);if((r7|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r9=r4+16|0;HEAP32[r9>>2]=r7;_memcpy(HEAP32[r8>>2],HEAP32[r2+3],r5);_memcpy(HEAP32[r9>>2],HEAP32[r2+4],r1);HEAP32[r6+5]=HEAP32[r2+5];HEAP32[r6+6]=HEAP32[r2+6];STACKTOP=r3;return r4}}function _solve_game(r1,r2,r3,r4){var r5,r6,r7,r8,r9;r2=STACKTOP;r5=HEAP32[r1>>2];r6=Math.imul(r5,r5);if((r3|0)!=0){r7=_malloc(_strlen(r3)+1|0);if((r7|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r7,r3);r8=r7;STACKTOP=r2;return r8}r7=_malloc(r6);if((r7|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_memset(r7,0,r6);r3=HEAP32[r1+8>>2];r1=_solver(r5,HEAP32[r3+8>>2],HEAP32[r3+12>>2],r7,4);if((r1|0)==10){HEAP32[r4>>2]=67436;r9=0}else if((r1|0)==11){HEAP32[r4>>2]=67392;r9=0}else{r4=_malloc(r6+2|0);if((r4|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP8[r4]=83;L576:do{if((r6|0)!=0){r1=0;while(1){r3=r1+1|0;HEAP8[r4+r3|0]=HEAP8[r7+r1|0]+48&255;if((r3|0)<(r6|0)){r1=r3}else{break L576}}}}while(0);HEAP8[r6+(r4+1)|0]=0;r9=r4}_free(r7);r8=r9;STACKTOP=r2;return r8}function _new_ui(r1){var r2,r3;r1=STACKTOP;r2=_malloc(20),r3=r2>>2;if((r2|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r3]=0;HEAP32[r3+1]=0;HEAP32[r3+2]=0;HEAP32[r3+3]=0;HEAP32[r3+4]=0;STACKTOP=r1;return r2}}function _game_compute_size(r1,r2,r3,r4){var r5;r5=(((r2|0)/2&-1)<<1)+Math.imul(HEAP32[r1>>2],r2)|0;HEAP32[r4>>2]=r5;HEAP32[r3>>2]=r5;return}function _game_set_size(r1,r2,r3,r4){HEAP32[r2>>2]=r4;return}function _execute_move(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+12|0;r5=r4,r6=r5>>2;r7=r4+4,r8=r7>>2;r9=r4+8;r10=HEAP32[r1>>2];r11=Math.imul(r10,r10);r12=HEAP8[r2];if(r12<<24>>24==83){r13=_dup_game(r1);HEAP32[r13+24>>2]=1;HEAP32[r13+20>>2]=1;L593:do{if((r11|0)!=0){r14=r10+48|0;r15=r13+12|0;r16=r13+16|0;r17=0;while(1){r18=r17+1|0;r19=HEAP8[r2+r18|0];if(r19<<24>>24<49|(r19<<24>>24|0)>(r14|0)){break}HEAP8[HEAP32[r15>>2]+r17|0]=r19-48&255;HEAP32[HEAP32[r16>>2]+(r17<<2)>>2]=0;if((r18|0)<(r11|0)){r17=r18}else{break L593}}_free_game(r13);r20=0;STACKTOP=r4;return r20}}while(0);if(HEAP8[r11+(r2+1)|0]<<24>>24==0){r20=r13;STACKTOP=r4;return r20}_free_game(r13);r20=0;STACKTOP=r4;return r20}else if(r12<<24>>24==80|r12<<24>>24==82){r3=421}else{r21=r12}if(r3==421){r3=(_sscanf(r2+1|0,67516,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r7,HEAP32[tempInt+8>>2]=r9,tempInt))|0)==3;r7=HEAP32[r6];do{if(r3&(r7|0)>-1&(r7|0)<(r10|0)){r5=HEAP32[r8];if(!((r5|0)>-1&(r5|0)<(r10|0))){break}r5=HEAP32[r9>>2];if((r5|0)<0|(r5|0)>(r10|0)){break}r5=_dup_game(r1),r12=r5>>2;r13=HEAP32[r9>>2];if(HEAP8[r2]<<24>>24==80&(r13|0)>0){r17=(Math.imul(HEAP32[r8],r10)+HEAP32[r6]<<2)+HEAP32[r12+4]|0;HEAP32[r17>>2]=HEAP32[r17>>2]^1<<r13;r20=r5;STACKTOP=r4;return r20}r17=Math.imul(HEAP32[r8],r10);HEAP8[HEAP32[r12+3]+r17+HEAP32[r6]|0]=r13&255;r13=Math.imul(HEAP32[r8],r10);HEAP32[HEAP32[r12+4]+(r13+HEAP32[r6]<<2)>>2]=0;r13=r5+20|0;if((HEAP32[r13>>2]|0)!=0){r20=r5;STACKTOP=r4;return r20}if((_check_errors(r5,0)|0)!=0){r20=r5;STACKTOP=r4;return r20}HEAP32[r13>>2]=1;r20=r5;STACKTOP=r4;return r20}}while(0);r21=HEAP8[r2]}if(r21<<24>>24!=77){r20=0;STACKTOP=r4;return r20}r21=_dup_game(r1);if((r11|0)==0){r20=r21;STACKTOP=r4;return r20}r1=r21+12|0;r2=(1<<r10+1)-2|0;r10=r21+16|0;r6=0;while(1){if(HEAP8[HEAP32[r1>>2]+r6|0]<<24>>24==0){HEAP32[HEAP32[r10>>2]+(r6<<2)>>2]=r2}r8=r6+1|0;if((r8|0)<(r11|0)){r6=r8}else{r20=r21;break}}STACKTOP=r4;return r20}function _game_free_drawstate(r1,r2){var r3;r1=r2>>2;r3=HEAP32[r1+2];if((r3|0)!=0){_free(r3)}r3=HEAP32[r1+3];if((r3|0)!=0){_free(r3)}r3=HEAP32[r1+4];if((r3|0)!=0){_free(r3)}r3=HEAP32[r1+5];if((r3|0)!=0){_free(r3)}r3=HEAP32[r1+6];if((r3|0)!=0){_free(r3)}if((r2|0)==0){return}_free(r2);return}function _interpret_move(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r7=r2>>2;r8=0;r9=STACKTOP;STACKTOP=STACKTOP+80|0;r10=r9;r11=HEAP32[r1>>2];r12=r6&-28673;r6=HEAP32[r3>>2];r3=r6-((r6|0)/2&-1)|0;r13=(r3+r4|0)/(r6|0)&-1;r4=r13-1|0;r14=(r3+r5|0)/(r6|0)&-1;r6=r14-1|0;do{if((r13|0)>0&(r4|0)<(r11|0)&(r14|0)>0&(r6|0)<(r11|0)){if((r12|0)==512){r5=r2|0;r3=r2+4|0;do{if((r4|0)==(HEAP32[r5>>2]|0)){if((r6|0)!=(HEAP32[r3>>2]|0)){r8=469;break}r15=r2+12|0;if((HEAP32[r15>>2]|0)==0){r8=469;break}if((HEAP32[r7+2]|0)!=0){r8=469;break}HEAP32[r15>>2]=0;break}else{r8=469}}while(0);if(r8==469){HEAP32[r5>>2]=r4;HEAP32[r3>>2]=r6;HEAP32[r7+3]=1;HEAP32[r7+2]=0}HEAP32[r7+4]=0;r16=67528;STACKTOP=r9;return r16}else if((r12|0)!=514){break}r15=Math.imul(r6,r11)+r4|0;L671:do{if(HEAP8[HEAP32[r1+12>>2]+r15|0]<<24>>24==0){r17=r2|0;r18=r2+4|0;do{if((r4|0)==(HEAP32[r17>>2]|0)){if((r6|0)!=(HEAP32[r18>>2]|0)){break}r19=r2+12|0;if((HEAP32[r19>>2]|0)==0){break}if((HEAP32[r7+2]|0)==0){break}HEAP32[r19>>2]=0;break L671}}while(0);HEAP32[r7+2]=1;HEAP32[r17>>2]=r4;HEAP32[r18>>2]=r6;HEAP32[r7+3]=1}else{HEAP32[r7+3]=0}}while(0);HEAP32[r7+4]=0;r16=67528;STACKTOP=r9;return r16}}while(0);if((r12-521|0)>>>0<2|(r12|0)==524|(r12|0)==523){r6=r2|0;r4=r2+4|0;do{if((r12|0)==522){r20=1;r21=0;r8=485;break}else if((r12|0)==524){r20=0;r21=1;r8=485;break}else if((r12|0)==523){r20=0;r21=-1;r8=485;break}else if((r12|0)==521){r20=-1;r21=0;r8=485}}while(0);if(r8==485){r14=HEAP32[r6>>2]+r21|0;r21=(r14|0)>0?r14:0;r14=r11-1|0;HEAP32[r6>>2]=(r21|0)<(r14|0)?r21:r14;r21=HEAP32[r4>>2]+r20|0;r20=(r21|0)>0?r21:0;HEAP32[r4>>2]=(r20|0)<(r14|0)?r20:r14}HEAP32[r7+4]=1;HEAP32[r7+3]=1;r16=67528;STACKTOP=r9;return r16}r14=r2+12|0;r20=HEAP32[r14>>2];if((r20|0)!=0&(r12|0)==525){r4=r2+8|0;HEAP32[r4>>2]=1-HEAP32[r4>>2]|0;HEAP32[r7+4]=1;r16=67528;STACKTOP=r9;return r16}L698:do{if((r20|0)==0){if((r12|0)==109|(r12|0)==77){break}else{r16=0}STACKTOP=r9;return r16}else{r4=r12-48|0;do{if(r4>>>0<10){if((r4|0)<=(r11|0)){if((r12|0)==526|(r12|0)==8){r8=495;break}else{r22=r4;break}}if((r12|0)==526|(r12|0)==8){r8=495;break}else if((r12|0)==77|(r12|0)==109){break L698}else{r16=0}STACKTOP=r9;return r16}else{if((r12|0)==526|(r12|0)==8){r8=495;break}else if((r12|0)==77|(r12|0)==109){break L698}else{r16=0}STACKTOP=r9;return r16}}while(0);if(r8==495){r22=0}do{if((HEAP32[r7+2]|0)==0){r23=82;r24=r10|0;r25=HEAP32[r7];r26=HEAP32[r7+1]}else{r4=HEAP32[r7+1];r2=Math.imul(r4,r11);r21=HEAP32[r7];if(HEAP8[HEAP32[r1+12>>2]+r2+r21|0]<<24>>24==0){r23=(r22|0)>0?80:82;r24=r10|0;r25=r21;r26=r4;break}else{r16=0;STACKTOP=r9;return r16}}}while(0);_sprintf(r24,67492,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r23,HEAP32[tempInt+4>>2]=r25,HEAP32[tempInt+8>>2]=r26,HEAP32[tempInt+12>>2]=r22,tempInt));if((HEAP32[r7+4]|0)==0){HEAP32[r14>>2]=0}r4=_malloc(_strlen(r24)+1|0);if((r4|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r4,r24);r16=r4;STACKTOP=r9;return r16}}while(0);r24=_malloc(2);if((r24|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r14=r24;tempBigInt=77;HEAP8[r14]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r14+1|0]=tempBigInt&255;r16=r24;STACKTOP=r9;return r16}function _game_colours(r1,r2){var r3,r4,r5,r6,r7;r3=STACKTOP;r4=_malloc(72),r5=r4>>2;if((r4|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r6=r4;_frontend_default_colour(r1,r6);r1=(r4+12|0)>>2;HEAP32[r1]=0;HEAP32[r1+1]=0;HEAP32[r1+2]=0;HEAP32[r1+3]=0;r1=HEAPF32[r5+1];HEAPF32[r5+7]=r1*.6000000238418579;HEAPF32[r5+8]=0;r4=HEAPF32[r6>>2];HEAPF32[r5+9]=r4*.7799999713897705;HEAPF32[r5+10]=r1*.7799999713897705;r7=HEAPF32[r5+2];HEAPF32[r5+11]=r7*.7799999713897705;HEAPF32[r5+12]=1;HEAPF32[r5+13]=0;HEAPF32[r5+14]=0;HEAPF32[r5+15]=r4*.5;HEAPF32[r5+16]=r1*.5;HEAPF32[r5+17]=r7;HEAP32[r2>>2]=6;STACKTOP=r3;return r6}}function _game_new_drawstate(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11;r3=STACKTOP;r4=HEAP32[r2>>2];r2=Math.imul(r4,r4);r4=_malloc(28),r5=r4>>2;if((r4|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r6=r4;HEAP32[r5]=0;HEAP32[r5+1]=0;r7=r2<<2;r8=_malloc(r7);if((r8|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r9=r8;r8=r4+8|0;HEAP32[r8>>2]=r9;L743:do{if((r2|0)!=0){r4=0;r10=r9;while(1){HEAP32[r10+(r4<<2)>>2]=-1;r11=r4+1|0;if((r11|0)>=(r2|0)){break L743}r4=r11;r10=HEAP32[r8>>2]}}}while(0);r8=_malloc(r7);if((r8|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r5+3]=r8;r8=_text_fallback(r1,65760,2);HEAP32[r5+4]=r8;r8=_text_fallback(r1,65536,2);HEAP32[r5+5]=r8;r8=_text_fallback(r1,65884,2);HEAP32[r5+6]=r8;STACKTOP=r3;return r6}}function _game_redraw(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187,r188,r189,r190,r191,r192,r193,r194,r195,r196,r197,r198,r199,r200,r201,r202,r203,r204,r205,r206,r207,r208,r209,r210,r211,r212,r213,r214,r215,r216,r217,r218,r219,r220,r221,r222,r223,r224,r225,r226,r227,r228,r229,r230,r231,r232,r233,r234,r235,r236,r237,r238,r239,r240,r241,r242,r243;r7=0;r5=STACKTOP;STACKTOP=STACKTOP+88|0;r3=r5;r9=r5+64;r10=HEAP32[r4>>2];r11=r2+4|0;if((HEAP32[r11>>2]|0)==0){r12=(r2|0)>>2;r13=HEAP32[r12];r14=(((r13|0)/2&-1)<<1)+Math.imul(r13,r10)|0;r13=(r1|0)>>2;r15=(r1+4|0)>>2;FUNCTION_TABLE[HEAP32[HEAP32[r13]+4>>2]](HEAP32[r15],0,0,r14,r14,0);r14=HEAP32[r12];r16=(r14|0)/2&-1;if((r14|0)>63){r17=(r14|0)/32&-1;r18=((r14|0)/32&-1)<<1;r19=r16-r17|0;r20=r16-r17|0;r21=(((r14|0)/32&-1)<<1)+Math.imul(r14,r10)+1|0;r22=Math.imul(r14,r10)}else{r17=Math.imul(r14,r10);r18=2;r19=r16-1|0;r20=r16-1|0;r21=r17+3|0;r22=r17}FUNCTION_TABLE[HEAP32[HEAP32[r13]+4>>2]](HEAP32[r15],r20,r19,r21,r22+(r18+1)|0,1);r18=HEAP32[r12];r12=(((r18|0)/2&-1)<<1)+Math.imul(r18,r10)|0;r18=HEAP32[HEAP32[r13]+20>>2];if((r18|0)!=0){FUNCTION_TABLE[r18](HEAP32[r15],0,0,r12,r12)}HEAP32[r11>>2]=1}r11=r2+12|0;_check_errors(r4,HEAP32[r11>>2]);if((r10|0)<=0){STACKTOP=r5;return}r12=r4+12|0;r15=r4+16|0;r18=r6+12|0;r13=r8>0;r22=r8<=.13333334028720856|r8>=.2666666805744171;r8=r2+8|0;r21=r4+8|0;r4=r3|0;r19=(r2|0)>>2;r20=(r1|0)>>2;r17=(r1+4|0)>>2;r1=r2+24|0;r16=r2+16|0;r14=r2+20|0;r2=r3+1|0;r3=r9|0;r23=r9+4|0;r24=r9+8|0;r25=r9+12|0;r26=r9+16|0;r27=r9+20|0;r9=r6|0;r28=r6+4|0;r29=r6+8|0;r6=0;while(1){r30=Math.imul(r6,r10);r31=(r6|0)>0;r32=r6-1|0;r33=r6+1|0;r34=r31^1;r35=0;while(1){r36=r35+r30|0;r37=HEAP8[HEAP32[r12>>2]+r36|0];if(r37<<24>>24==0){r38=HEAP32[HEAP32[r15>>2]+(r36<<2)>>2]<<16}else{r38=r37&255}do{if((HEAP32[r18>>2]|0)==0){r39=r38}else{if((HEAP32[r9>>2]|0)!=(r35|0)){r39=r38;break}if((HEAP32[r28>>2]|0)!=(r6|0)){r39=r38;break}r39=((HEAP32[r29>>2]|0)!=0?4096:8192)|r38}}while(0);if(r13){r40=r22?r39|8192:r39}else{r40=r39}r37=HEAP32[HEAP32[r11>>2]+(r36<<2)>>2]|r40;r41=(r36<<2)+HEAP32[r8>>2]|0;do{if((HEAP32[r41>>2]|0)==(r37|0)){r42=r35+1|0}else{HEAP32[r41>>2]=r37;r43=HEAP32[r21>>2];r44=HEAP32[r43+4>>2];r45=HEAP32[r19];r46=(r45|0)/2&-1;r47=r46+Math.imul(r45,r35)|0;if((r45|0)>63){r48=(r45|0)/32&-1;r49=r46+Math.imul(r45,r6)|0;r50=r45-1|0;r51=r48<<1;r52=r51;r53=r50-r51|0;r54=r50;r55=r49;r56=r48+(r47+1)|0;r57=r48;r58=r48+(r49+1)|0}else{r49=r46+Math.imul(r45,r6)|0;r52=2;r53=r45-3|0;r54=r45-1|0;r55=r49;r56=r47+2|0;r57=1;r58=r49+2|0}r49=r54-r52|0;r45=(r35|0)>0;do{if(r45){r46=r43+8|0;r48=HEAP32[r46>>2];r50=Math.imul(r44,r6)+r35|0;if((r50|0)<=-1){___assert_func(66236,110,68704,67504)}r51=(r50<<2)+r48|0;r59=HEAP32[r51>>2];do{if((r59&2|0)==0){r60=0;r61=r59;while(1){r62=r61&1^r60;r63=r61>>2;r64=HEAP32[r48+(r63<<2)>>2];if((r64&2|0)==0){r60=r62;r61=r64}else{break}}L796:do{if((r63|0)==(r50|0)){r65=r62;r66=r50}else{r61=r63<<2;r60=r59>>2;r64=r62^r59&1;HEAP32[r51>>2]=r62|r61;if((r60|0)==(r63|0)){r65=r64;r66=r63;break}else{r67=r60;r68=r64}while(1){r64=(r67<<2)+r48|0;r60=HEAP32[r64>>2];r69=r60>>2;r70=r60&1^r68;HEAP32[r64>>2]=r68|r61;if((r69|0)==(r63|0)){r65=r70;r66=r63;break L796}else{r67=r69;r68=r70}}}}while(0);if((r65|0)==0){r71=r66;break}___assert_func(66236,137,68704,67244);r71=r66}else{r71=r50}}while(0);r48=HEAP32[r46>>2];r51=r50-1|0;if((r50|0)<=0){___assert_func(66236,110,68704,67504)}r59=(r51<<2)+r48|0;r61=HEAP32[r59>>2];do{if((r61&2|0)==0){r70=0;r69=r61;while(1){r72=r69&1^r70;r73=r69>>2;r64=HEAP32[r48+(r73<<2)>>2];if((r64&2|0)==0){r70=r72;r69=r64}else{break}}L810:do{if((r73|0)==(r51|0)){r74=r72;r75=r51}else{r69=r73<<2;r70=r61>>2;r64=r72^r61&1;HEAP32[r59>>2]=r72|r69;if((r70|0)==(r73|0)){r74=r64;r75=r73;break}else{r76=r70;r77=r64}while(1){r64=(r76<<2)+r48|0;r70=HEAP32[r64>>2];r60=r70>>2;r78=r70&1^r77;HEAP32[r64>>2]=r77|r69;if((r60|0)==(r73|0)){r74=r78;r75=r73;break L810}else{r76=r60;r77=r78}}}}while(0);if((r74|0)==0){r79=r75;break}___assert_func(66236,137,68704,67244);r79=r75}else{r79=r51}}while(0);if((r71|0)!=(r79|0)){r80=r56;r81=r53;break}r51=HEAP32[r19];if((r51|0)>63){r48=(r51|0)/32&-1;r82=r48;r83=r56-r48|0}else{r82=1;r83=r57+r47|0}r80=r83;r81=r82+r53|0}else{r80=r56;r81=r53}}while(0);r48=r35+1|0;r51=(r48|0)<(r44|0);do{if(r51){r59=r43+8|0;r61=HEAP32[r59>>2];r50=Math.imul(r44,r6)+r35|0;if((r50|0)<=-1){___assert_func(66236,110,68704,67504)}r46=(r50<<2)+r61|0;r69=HEAP32[r46>>2];do{if((r69&2|0)==0){r78=0;r60=r69;while(1){r84=r60&1^r78;r85=r60>>2;r64=HEAP32[r61+(r85<<2)>>2];if((r64&2|0)==0){r78=r84;r60=r64}else{break}}L832:do{if((r85|0)==(r50|0)){r86=r84;r87=r50}else{r60=r85<<2;r78=r69>>2;r64=r84^r69&1;HEAP32[r46>>2]=r84|r60;if((r78|0)==(r85|0)){r86=r64;r87=r85;break}else{r88=r78;r89=r64}while(1){r64=(r88<<2)+r61|0;r78=HEAP32[r64>>2];r70=r78>>2;r90=r78&1^r89;HEAP32[r64>>2]=r89|r60;if((r70|0)==(r85|0)){r86=r90;r87=r85;break L832}else{r88=r70;r89=r90}}}}while(0);if((r86|0)==0){r91=r87;break}___assert_func(66236,137,68704,67244);r91=r87}else{r91=r50}}while(0);r61=HEAP32[r59>>2];r46=r50+1|0;if((r46|0)<=-1){___assert_func(66236,110,68704,67504)}r69=(r46<<2)+r61|0;r60=HEAP32[r69>>2];do{if((r60&2|0)==0){r90=0;r70=r60;while(1){r92=r70&1^r90;r93=r70>>2;r64=HEAP32[r61+(r93<<2)>>2];if((r64&2|0)==0){r90=r92;r70=r64}else{break}}L846:do{if((r93|0)==(r46|0)){r94=r92;r95=r46}else{r70=r93<<2;r90=r60>>2;r64=r92^r60&1;HEAP32[r69>>2]=r92|r70;if((r90|0)==(r93|0)){r94=r64;r95=r93;break}else{r96=r90;r97=r64}while(1){r64=(r96<<2)+r61|0;r90=HEAP32[r64>>2];r78=r90>>2;r98=r90&1^r97;HEAP32[r64>>2]=r97|r70;if((r78|0)==(r93|0)){r94=r98;r95=r93;break L846}else{r96=r78;r97=r98}}}}while(0);if((r94|0)==0){r99=r95;break}___assert_func(66236,137,68704,67244);r99=r95}else{r99=r46}}while(0);if((r91|0)!=(r99|0)){r100=r81;break}r46=HEAP32[r19];if((r46|0)>63){r101=(r46|0)/32&-1}else{r101=1}r100=r101+r81|0}else{r100=r81}}while(0);do{if(r31){r46=r43+8|0;r61=HEAP32[r46>>2];r69=Math.imul(r44,r6)+r35|0;if((r69|0)<=-1){___assert_func(66236,110,68704,67504)}r60=(r69<<2)+r61|0;r50=HEAP32[r60>>2];do{if((r50&2|0)==0){r59=0;r70=r50;while(1){r102=r70&1^r59;r103=r70>>2;r98=HEAP32[r61+(r103<<2)>>2];if((r98&2|0)==0){r59=r102;r70=r98}else{break}}L867:do{if((r103|0)==(r69|0)){r104=r102;r105=r69}else{r70=r103<<2;r59=r50>>2;r98=r102^r50&1;HEAP32[r60>>2]=r102|r70;if((r59|0)==(r103|0)){r104=r98;r105=r103;break}else{r106=r59;r107=r98}while(1){r98=(r106<<2)+r61|0;r59=HEAP32[r98>>2];r78=r59>>2;r64=r59&1^r107;HEAP32[r98>>2]=r107|r70;if((r78|0)==(r103|0)){r104=r64;r105=r103;break L867}else{r106=r78;r107=r64}}}}while(0);if((r104|0)==0){r108=r105;break}___assert_func(66236,137,68704,67244);r108=r105}else{r108=r69}}while(0);r69=HEAP32[r46>>2];r61=Math.imul(r44,r32)+r35|0;if((r61|0)<=-1){___assert_func(66236,110,68704,67504)}r60=(r61<<2)+r69|0;r50=HEAP32[r60>>2];do{if((r50&2|0)==0){r70=0;r64=r50;while(1){r109=r64&1^r70;r110=r64>>2;r78=HEAP32[r69+(r110<<2)>>2];if((r78&2|0)==0){r70=r109;r64=r78}else{break}}L881:do{if((r110|0)==(r61|0)){r111=r109;r112=r61}else{r64=r110<<2;r70=r50>>2;r78=r109^r50&1;HEAP32[r60>>2]=r109|r64;if((r70|0)==(r110|0)){r111=r78;r112=r110;break}else{r113=r70;r114=r78}while(1){r78=(r113<<2)+r69|0;r70=HEAP32[r78>>2];r98=r70>>2;r59=r70&1^r114;HEAP32[r78>>2]=r114|r64;if((r98|0)==(r110|0)){r111=r59;r112=r110;break L881}else{r113=r98;r114=r59}}}}while(0);if((r111|0)==0){r115=r112;break}___assert_func(66236,137,68704,67244);r115=r112}else{r115=r61}}while(0);if((r108|0)!=(r115|0)){r116=r58;r117=r49;break}r61=HEAP32[r19];if((r61|0)>63){r69=(r61|0)/32&-1;r118=r69;r119=r58-r69|0}else{r118=1;r119=r55+r57|0}r116=r119;r117=r118+r49|0}else{r116=r58;r117=r49}}while(0);r49=(r33|0)<(r44|0);do{if(r49){r69=r43+8|0;r61=HEAP32[r69>>2];r60=Math.imul(r44,r6)+r35|0;if((r60|0)<=-1){___assert_func(66236,110,68704,67504)}r50=(r60<<2)+r61|0;r46=HEAP32[r50>>2];do{if((r46&2|0)==0){r64=0;r59=r46;while(1){r120=r59&1^r64;r121=r59>>2;r98=HEAP32[r61+(r121<<2)>>2];if((r98&2|0)==0){r64=r120;r59=r98}else{break}}L903:do{if((r121|0)==(r60|0)){r122=r120;r123=r60}else{r59=r121<<2;r64=r46>>2;r98=r120^r46&1;HEAP32[r50>>2]=r120|r59;if((r64|0)==(r121|0)){r122=r98;r123=r121;break}else{r124=r64;r125=r98}while(1){r98=(r124<<2)+r61|0;r64=HEAP32[r98>>2];r78=r64>>2;r70=r64&1^r125;HEAP32[r98>>2]=r125|r59;if((r78|0)==(r121|0)){r122=r70;r123=r121;break L903}else{r124=r78;r125=r70}}}}while(0);if((r122|0)==0){r126=r123;break}___assert_func(66236,137,68704,67244);r126=r123}else{r126=r60}}while(0);r60=HEAP32[r69>>2];r61=Math.imul(r44,r33)+r35|0;if((r61|0)<=-1){___assert_func(66236,110,68704,67504)}r50=(r61<<2)+r60|0;r46=HEAP32[r50>>2];do{if((r46&2|0)==0){r59=0;r70=r46;while(1){r127=r70&1^r59;r128=r70>>2;r78=HEAP32[r60+(r128<<2)>>2];if((r78&2|0)==0){r59=r127;r70=r78}else{break}}L917:do{if((r128|0)==(r61|0)){r129=r127;r130=r61}else{r70=r128<<2;r59=r46>>2;r78=r127^r46&1;HEAP32[r50>>2]=r127|r70;if((r59|0)==(r128|0)){r129=r78;r130=r128;break}else{r131=r59;r132=r78}while(1){r78=(r131<<2)+r60|0;r59=HEAP32[r78>>2];r98=r59>>2;r64=r59&1^r132;HEAP32[r78>>2]=r132|r70;if((r98|0)==(r128|0)){r129=r64;r130=r128;break L917}else{r131=r98;r132=r64}}}}while(0);if((r129|0)==0){r133=r130;break}___assert_func(66236,137,68704,67244);r133=r130}else{r133=r61}}while(0);if((r126|0)!=(r133|0)){r134=r117;break}r61=HEAP32[r19];if((r61|0)>63){r135=(r61|0)/32&-1}else{r135=1}r134=r135+r117|0}else{r134=r117}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r20]+24>>2]](HEAP32[r17],r80,r116,r100,r134);FUNCTION_TABLE[HEAP32[HEAP32[r20]+4>>2]](HEAP32[r17],r80,r116,r100,r134,(r37&8192|0)!=0?3:0);r61=r45^1;do{if(!(r61|r34)){r60=r43+8|0;r50=HEAP32[r60>>2];r46=Math.imul(r44,r6)+r35|0;if((r46|0)<=-1){___assert_func(66236,110,68704,67504)}r69=(r46<<2)+r50|0;r70=HEAP32[r69>>2];do{if((r70&2|0)==0){r64=0;r98=r70;while(1){r136=r98&1^r64;r137=r98>>2;r78=HEAP32[r50+(r137<<2)>>2];if((r78&2|0)==0){r64=r136;r98=r78}else{break}}L938:do{if((r137|0)==(r46|0)){r138=r136;r139=r46}else{r98=r137<<2;r64=r70>>2;r78=r136^r70&1;HEAP32[r69>>2]=r136|r98;if((r64|0)==(r137|0)){r138=r78;r139=r137;break}else{r140=r64;r141=r78}while(1){r78=(r140<<2)+r50|0;r64=HEAP32[r78>>2];r59=r64>>2;r90=r64&1^r141;HEAP32[r78>>2]=r141|r98;if((r59|0)==(r137|0)){r138=r90;r139=r137;break L938}else{r140=r59;r141=r90}}}}while(0);if((r138|0)==0){r142=r139;break}___assert_func(66236,137,68704,67244);r142=r139}else{r142=r46}}while(0);r46=HEAP32[r60>>2];r50=Math.imul(r44,r32)+r35|0;r69=r50-1|0;if((r50|0)<=0){___assert_func(66236,110,68704,67504)}r50=(r69<<2)+r46|0;r70=HEAP32[r50>>2];do{if((r70&2|0)==0){r98=0;r90=r70;while(1){r143=r90&1^r98;r144=r90>>2;r59=HEAP32[r46+(r144<<2)>>2];if((r59&2|0)==0){r98=r143;r90=r59}else{break}}L952:do{if((r144|0)==(r69|0)){r145=r143;r146=r69}else{r90=r144<<2;r98=r70>>2;r59=r143^r70&1;HEAP32[r50>>2]=r143|r90;if((r98|0)==(r144|0)){r145=r59;r146=r144;break}else{r147=r98;r148=r59}while(1){r59=(r147<<2)+r46|0;r98=HEAP32[r59>>2];r78=r98>>2;r64=r98&1^r148;HEAP32[r59>>2]=r148|r90;if((r78|0)==(r144|0)){r145=r64;r146=r144;break L952}else{r147=r78;r148=r64}}}}while(0);if((r145|0)==0){r149=r146;break}___assert_func(66236,137,68704,67244);r149=r146}else{r149=r69}}while(0);if((r142|0)==(r149|0)){break}r69=HEAP32[r19];if((r69|0)>63){r46=(r69|0)/32&-1;r150=r58-r46|0;r151=r56-r46|0;r152=r46}else{r150=r58-1|0;r151=r57+r47|0;r152=1}FUNCTION_TABLE[HEAP32[HEAP32[r20]+4>>2]](HEAP32[r17],r151,r150,r152,r152,1)}}while(0);r45=r51^1;do{if(!(r45|r34)){r46=r43+8|0;r69=HEAP32[r46>>2];r50=Math.imul(r44,r6)+r35|0;if((r50|0)<=-1){___assert_func(66236,110,68704,67504)}r70=(r50<<2)+r69|0;r60=HEAP32[r70>>2];do{if((r60&2|0)==0){r90=0;r64=r60;while(1){r153=r64&1^r90;r154=r64>>2;r78=HEAP32[r69+(r154<<2)>>2];if((r78&2|0)==0){r90=r153;r64=r78}else{break}}L974:do{if((r154|0)==(r50|0)){r155=r153;r156=r50}else{r64=r154<<2;r90=r60>>2;r78=r153^r60&1;HEAP32[r70>>2]=r153|r64;if((r90|0)==(r154|0)){r155=r78;r156=r154;break}else{r157=r90;r158=r78}while(1){r78=(r157<<2)+r69|0;r90=HEAP32[r78>>2];r59=r90>>2;r98=r90&1^r158;HEAP32[r78>>2]=r158|r64;if((r59|0)==(r154|0)){r155=r98;r156=r154;break L974}else{r157=r59;r158=r98}}}}while(0);if((r155|0)==0){r159=r156;break}___assert_func(66236,137,68704,67244);r159=r156}else{r159=r50}}while(0);r50=HEAP32[r46>>2];r69=Math.imul(r44,r32)+r48|0;if((r69|0)<=-1){___assert_func(66236,110,68704,67504)}r70=(r69<<2)+r50|0;r60=HEAP32[r70>>2];do{if((r60&2|0)==0){r64=0;r98=r60;while(1){r160=r98&1^r64;r161=r98>>2;r59=HEAP32[r50+(r161<<2)>>2];if((r59&2|0)==0){r64=r160;r98=r59}else{break}}L988:do{if((r161|0)==(r69|0)){r162=r160;r163=r69}else{r98=r161<<2;r64=r60>>2;r59=r160^r60&1;HEAP32[r70>>2]=r160|r98;if((r64|0)==(r161|0)){r162=r59;r163=r161;break}else{r164=r64;r165=r59}while(1){r59=(r164<<2)+r50|0;r64=HEAP32[r59>>2];r78=r64>>2;r90=r64&1^r165;HEAP32[r59>>2]=r165|r98;if((r78|0)==(r161|0)){r162=r90;r163=r161;break L988}else{r164=r78;r165=r90}}}}while(0);if((r162|0)==0){r166=r163;break}___assert_func(66236,137,68704,67244);r166=r163}else{r166=r69}}while(0);if((r159|0)==(r166|0)){break}r69=HEAP32[r19];r50=r69+r56|0;if((r69|0)>63){r70=(r69|0)/32&-1;r167=r58-r70|0;r168=r50-1-(r70<<1)|0;r169=r70}else{r167=r58-1|0;r168=r50-3|0;r169=1}FUNCTION_TABLE[HEAP32[HEAP32[r20]+4>>2]](HEAP32[r17],r168,r167,r169,r169,1)}}while(0);r51=r49^1;do{if(!(r61|r51)){r50=r43+8|0;r70=HEAP32[r50>>2];r69=Math.imul(r44,r6)+r35|0;if((r69|0)<=-1){___assert_func(66236,110,68704,67504)}r60=(r69<<2)+r70|0;r46=HEAP32[r60>>2];do{if((r46&2|0)==0){r98=0;r90=r46;while(1){r170=r90&1^r98;r171=r90>>2;r78=HEAP32[r70+(r171<<2)>>2];if((r78&2|0)==0){r98=r170;r90=r78}else{break}}L1010:do{if((r171|0)==(r69|0)){r172=r170;r173=r69}else{r90=r171<<2;r98=r46>>2;r78=r170^r46&1;HEAP32[r60>>2]=r170|r90;if((r98|0)==(r171|0)){r172=r78;r173=r171;break}else{r174=r98;r175=r78}while(1){r78=(r174<<2)+r70|0;r98=HEAP32[r78>>2];r59=r98>>2;r64=r98&1^r175;HEAP32[r78>>2]=r175|r90;if((r59|0)==(r171|0)){r172=r64;r173=r171;break L1010}else{r174=r59;r175=r64}}}}while(0);if((r172|0)==0){r176=r173;break}___assert_func(66236,137,68704,67244);r176=r173}else{r176=r69}}while(0);r69=HEAP32[r50>>2];r70=Math.imul(r44,r33)+r35|0;r60=r70-1|0;if((r70|0)<=0){___assert_func(66236,110,68704,67504)}r70=(r60<<2)+r69|0;r46=HEAP32[r70>>2];do{if((r46&2|0)==0){r90=0;r64=r46;while(1){r177=r64&1^r90;r178=r64>>2;r59=HEAP32[r69+(r178<<2)>>2];if((r59&2|0)==0){r90=r177;r64=r59}else{break}}L1024:do{if((r178|0)==(r60|0)){r179=r177;r180=r60}else{r64=r178<<2;r90=r46>>2;r59=r177^r46&1;HEAP32[r70>>2]=r177|r64;if((r90|0)==(r178|0)){r179=r59;r180=r178;break}else{r181=r90;r182=r59}while(1){r59=(r181<<2)+r69|0;r90=HEAP32[r59>>2];r78=r90>>2;r98=r90&1^r182;HEAP32[r59>>2]=r182|r64;if((r78|0)==(r178|0)){r179=r98;r180=r178;break L1024}else{r181=r78;r182=r98}}}}while(0);if((r179|0)==0){r183=r180;break}___assert_func(66236,137,68704,67244);r183=r180}else{r183=r60}}while(0);if((r176|0)==(r183|0)){break}r60=HEAP32[r19];if((r60|0)>63){r69=(r60|0)/32&-1;r184=r58-1+r60-(r69<<1)|0;r185=r56-r69|0;r186=r69}else{r184=r58-3+r60|0;r185=r57+r47|0;r186=1}FUNCTION_TABLE[HEAP32[HEAP32[r20]+4>>2]](HEAP32[r17],r185,r184,r186,r186,1)}}while(0);do{if(!(r45|r51)){r47=r43+8|0;r61=HEAP32[r47>>2];r49=Math.imul(r44,r6)+r35|0;if((r49|0)<=-1){___assert_func(66236,110,68704,67504)}r60=(r49<<2)+r61|0;r69=HEAP32[r60>>2];do{if((r69&2|0)==0){r70=0;r46=r69;while(1){r187=r46&1^r70;r188=r46>>2;r50=HEAP32[r61+(r188<<2)>>2];if((r50&2|0)==0){r70=r187;r46=r50}else{break}}L1046:do{if((r188|0)==(r49|0)){r189=r187;r190=r49}else{r46=r188<<2;r70=r69>>2;r50=r187^r69&1;HEAP32[r60>>2]=r187|r46;if((r70|0)==(r188|0)){r189=r50;r190=r188;break}else{r191=r70;r192=r50}while(1){r50=(r191<<2)+r61|0;r70=HEAP32[r50>>2];r64=r70>>2;r98=r70&1^r192;HEAP32[r50>>2]=r192|r46;if((r64|0)==(r188|0)){r189=r98;r190=r188;break L1046}else{r191=r64;r192=r98}}}}while(0);if((r189|0)==0){r193=r190;break}___assert_func(66236,137,68704,67244);r193=r190}else{r193=r49}}while(0);r49=HEAP32[r47>>2];r61=Math.imul(r44,r33)+r48|0;if((r61|0)<=-1){___assert_func(66236,110,68704,67504)}r60=(r61<<2)+r49|0;r69=HEAP32[r60>>2];do{if((r69&2|0)==0){r46=0;r98=r69;while(1){r194=r98&1^r46;r195=r98>>2;r64=HEAP32[r49+(r195<<2)>>2];if((r64&2|0)==0){r46=r194;r98=r64}else{break}}L1060:do{if((r195|0)==(r61|0)){r196=r194;r197=r61}else{r98=r195<<2;r46=r69>>2;r64=r194^r69&1;HEAP32[r60>>2]=r194|r98;if((r46|0)==(r195|0)){r196=r64;r197=r195;break}else{r198=r46;r199=r64}while(1){r64=(r198<<2)+r49|0;r46=HEAP32[r64>>2];r50=r46>>2;r70=r46&1^r199;HEAP32[r64>>2]=r199|r98;if((r50|0)==(r195|0)){r196=r70;r197=r195;break L1060}else{r198=r50;r199=r70}}}}while(0);if((r196|0)==0){r200=r197;break}___assert_func(66236,137,68704,67244);r200=r197}else{r200=r61}}while(0);if((r193|0)==(r200|0)){break}r61=HEAP32[r19];r49=r61+r56|0;if((r61|0)>63){r60=(r61|0)/32&-1;r69=r60<<1;r201=r58-1+r61-r69|0;r202=r49-1-r69|0;r203=r60}else{r201=r58-3+r61|0;r202=r49-3|0;r203=1}FUNCTION_TABLE[HEAP32[HEAP32[r20]+4>>2]](HEAP32[r17],r202,r201,r203,r203,1)}}while(0);if((r37&4096|0)!=0){HEAP32[r3>>2]=r80;HEAP32[r23>>2]=r116;HEAP32[r24>>2]=((r100|0)/2&-1)+r80|0;HEAP32[r25>>2]=r116;HEAP32[r26>>2]=r80;HEAP32[r27>>2]=((r134|0)/2&-1)+r116|0;FUNCTION_TABLE[HEAP32[HEAP32[r20]+12>>2]](HEAP32[r17],r3,3,3,3)}r51=(r43+8|0)>>2;r45=HEAP32[r51];r49=Math.imul(r44,r6)+r35|0;r61=(r49|0)>-1;if(!r61){___assert_func(66236,110,68704,67504)}r60=(r49<<2)+r45|0;r69=HEAP32[r60>>2];do{if((r69&2|0)==0){r47=0;r98=r69;while(1){r204=r98&1^r47;r205=r98>>2;r70=HEAP32[r45+(r205<<2)>>2];if((r70&2|0)==0){r47=r204;r98=r70}else{break}}L1083:do{if((r205|0)==(r49|0)){r206=r204;r207=r49}else{r98=r205<<2;r47=r69>>2;r70=r204^r69&1;HEAP32[r60>>2]=r204|r98;if((r47|0)==(r205|0)){r206=r70;r207=r205;break}else{r208=r47;r209=r70}while(1){r70=(r208<<2)+r45|0;r47=HEAP32[r70>>2];r50=r47>>2;r64=r47&1^r209;HEAP32[r70>>2]=r209|r98;if((r50|0)==(r205|0)){r206=r64;r207=r205;break L1083}else{r208=r50;r209=r64}}}}while(0);if((r206|0)!=0){___assert_func(66236,137,68704,67244)}if((r207|0)==(r49|0)){r7=759;break}else{break}}else{r7=759}}while(0);if(r7==759){r7=0;r45=HEAP32[HEAP32[r43+12>>2]+(r49<<2)>>2];r60=r45&-1610612737;do{if((_dsf_size(HEAP32[r51],r49)|0)==1){r210=67528}else{r69=r45&1610612736;if((r69|0)==1073741824){r210=HEAP32[r16>>2];break}else if((r69|0)==536870912){r210=HEAP32[r14>>2];break}else if((r69|0)==0){r210=66460;break}else{r210=HEAP32[r1>>2];break}}}while(0);_sprintf(r4,67076,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r60,HEAP32[tempInt+4>>2]=r210,tempInt));r45=HEAP32[r19];if((r45|0)>63){r43=((r45|0)/32&-1)<<1;r211=r43;r212=r43+r56|0}else{r211=2;r212=r56+2|0}r43=(r45|0)/4&-1;FUNCTION_TABLE[HEAP32[HEAP32[r20]>>2]](HEAP32[r17],r212,r211+r58+r43|0,1,r43,0,(r37&16384|0)!=0?4:1,r4)}r43=r37&15;L1105:do{if((r43|0)==0){if((r44|0)<1){break}r45=r44+1|0;r69=0;r98=1;while(1){r213=((1<<r98+16&r37|0)!=0&1)+r69|0;r64=r98+1|0;if((r64|0)==(r45|0)){break}else{r69=r213;r98=r64}}if((r213|0)==0){break}r98=HEAP32[r19];if((r98|0)>63){r69=(r98|0)/32&-1;r64=r69+r58|0;r214=r69;r215=r69+r56|0;r216=r64;r217=r64+r98|0}else{r64=r58+1|0;r214=1;r215=r56+1|0;r216=r64;r217=r98+r64|0}r64=r98+r56|0;r98=r217-r214|0;r69=HEAP32[r51];if(!r61){___assert_func(66236,110,68704,67504)}r50=(r49<<2)+r69|0;r70=HEAP32[r50>>2];do{if((r70&2|0)==0){r47=0;r46=r70;while(1){r218=r46&1^r47;r219=r46>>2;r78=HEAP32[r69+(r219<<2)>>2];if((r78&2|0)==0){r47=r218;r46=r78}else{break}}L1123:do{if((r219|0)==(r49|0)){r220=r218;r221=r49}else{r46=r219<<2;r47=r70>>2;r78=r218^r70&1;HEAP32[r50>>2]=r218|r46;if((r47|0)==(r219|0)){r220=r78;r221=r219;break}else{r222=r47;r223=r78}while(1){r78=(r222<<2)+r69|0;r47=HEAP32[r78>>2];r59=r47>>2;r90=r47&1^r223;HEAP32[r78>>2]=r223|r46;if((r59|0)==(r219|0)){r220=r90;r221=r219;break L1123}else{r222=r59;r223=r90}}}}while(0);if((r220|0)!=0){___assert_func(66236,137,68704,67244)}if((r221|0)==(r49|0)){r7=787;break}else{r224=r216;break}}else{r7=787}}while(0);if(r7==787){r7=0;r224=((HEAP32[r19]|0)/4&-1)+r216|0}r69=(r213|0)>4?r213:4;r50=r213-1|0;r70=r64-r215|0;do{if((r69|0)>3){r46=r70|0;r90=r98-r224|0;r59=r90|0;r78=0;r47=3;r225=0;while(1){r226=(r50+r47|0)/(r47|0)&-1;r227=r46/(r47|0);r228=r59/((r226|0)>2?r226|0:2);r226=r227<r228?r227:r228;r228=r226>r78;r229=r228?r47:r225;r227=r47+1|0;if((r227|0)<(r69|0)){r78=r228?r226:r78;r47=r227;r225=r229}else{break}}if((r229|0)>0){r230=r229;r231=r90;break}else{r232=r229;r233=r90;r7=793;break}}else{r232=0;r233=r98-r224|0;r7=793;break}}while(0);if(r7==793){r7=0;___assert_func(66380,1886,68720,67560);r230=r232;r231=r233}r98=(r50+r230|0)/(r230|0)&-1;r69=(r98|0)>2?r98:2;r98=(r70|0)/(r230|0)&-1;r64=(r231|0)/(r69|0)&-1;r225=(r98|0)<(r64|0)?r98:r64;r64=HEAP32[r19];r98=((r64-Math.imul(r225,r230)|0)/2&-1)+r56|0;r47=((r64-Math.imul(r225,r69)|0)/2&-1)+r58|0;r69=HEAP32[r51];if(!r61){___assert_func(66236,110,68704,67504)}r64=(r49<<2)+r69|0;r78=HEAP32[r64>>2];do{if((r78&2|0)==0){r59=0;r46=r78;while(1){r234=r46&1^r59;r235=r46>>2;r227=HEAP32[r69+(r235<<2)>>2];if((r227&2|0)==0){r59=r234;r46=r227}else{break}}L1150:do{if((r235|0)==(r49|0)){r236=r234;r237=r49}else{r46=r235<<2;r59=r78>>2;r90=r234^r78&1;HEAP32[r64>>2]=r234|r46;if((r59|0)==(r235|0)){r236=r90;r237=r235;break}else{r238=r59;r239=r90}while(1){r90=(r238<<2)+r69|0;r59=HEAP32[r90>>2];r227=r59>>2;r226=r59&1^r239;HEAP32[r90>>2]=r239|r46;if((r227|0)==(r235|0)){r236=r226;r237=r235;break L1150}else{r238=r227;r239=r226}}}}while(0);if((r236|0)!=0){___assert_func(66236,137,68704,67244)}if((r237|0)==(r49|0)){r7=804;break}else{r240=r47;break}}else{r7=804}}while(0);do{if(r7==804){r7=0;r69=HEAP32[r19];r64=(r69|0)>63;if(r64){r241=((r69|0)/32&-1)*3&-1}else{r241=3}r78=(r69|0)/4&-1;if((r47|0)>(r241+r58+r78|0)){r240=r47;break}if(r64){r242=((r69|0)/32&-1)*3&-1}else{r242=3}r240=r78+r58+r242|0}}while(0);r47=0;r78=1;while(1){if((1<<r78+16&r37|0)==0){r243=r47}else{HEAP8[r2]=0;HEAP8[r4]=r78+48&255;r69=r98+((Math.imul((r47|0)%(r230|0)<<1|1,r225)|0)/2&-1)|0;r64=((Math.imul(((r47|0)/(r230|0)&-1)<<1|1,r225)|0)/2&-1)+r240|0;FUNCTION_TABLE[HEAP32[HEAP32[r20]>>2]](HEAP32[r17],r69,r64,1,r225,257,5,r4);r243=r47+1|0}r64=r78+1|0;if((r64|0)==(r45|0)){break L1105}else{r47=r243;r78=r64}}}else{HEAP8[r2]=0;HEAP8[r4]=(r43|48)&255;r78=(HEAP32[r19]|0)/2&-1;FUNCTION_TABLE[HEAP32[HEAP32[r20]>>2]](HEAP32[r17],r78+r56|0,r78+r58|0,1,r78,257,(r37>>>14&2)+2|0,r4)}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r20]+28>>2]](HEAP32[r17]);r43=HEAP32[HEAP32[r20]+20>>2];if((r43|0)==0){r42=r48;break}FUNCTION_TABLE[r43](HEAP32[r17],r80,r116,r100,r134);r42=r48}}while(0);if((r42|0)==(r10|0)){break}else{r35=r42}}if((r33|0)==(r10|0)){break}else{r6=r33}}STACKTOP=r5;return}function _game_anim_length(r1,r2,r3,r4){return 0}function _game_flash_length(r1,r2,r3,r4){var r5;do{if((HEAP32[r1+20>>2]|0)==0){if((HEAP32[r2+20>>2]|0)==0){break}if((HEAP32[r1+24>>2]|0)!=0){break}if((HEAP32[r2+24>>2]|0)==0){r5=.4000000059604645}else{break}return r5}}while(0);r5=0;return r5}function _game_status(r1){return(HEAP32[r1+20>>2]|0)!=0&1}function _game_print_size(r1,r2,r3){var r4;r4=((HEAP32[r1>>2]*900&-1)+900|0)/100;HEAPF32[r2>>2]=r4;HEAPF32[r3>>2]=r4;return}function _game_timing_state(r1,r2){return(HEAP32[r1+20>>2]|0)==0&1}function _game_print(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+100|0;r6=r5,r7=r6>>2;r8=r5+32;r9=r5+96;r10=HEAP32[r2>>2];r11=_print_mono_colour(r1,0);r12=_text_fallback(r1,65760,2);r13=_text_fallback(r1,65536,2);r14=_text_fallback(r1,65884,2);r15=(r1|0)>>2;r16=HEAP32[HEAP32[r15]+84>>2];r17=(r1+4|0)>>2;r18=HEAP32[r17];r19=(r1+20|0)>>2;r1=(r3*3&-1|0)/40&-1|0;r20=r1*Math.sqrt(HEAPF32[r19]);FUNCTION_TABLE[r16](r18,r20);r20=(r3|0)/2&-1;r18=Math.imul(r10,r3);r16=r18-1+r20|0;r21=r6|0;HEAP32[r21>>2]=r20;HEAP32[r7+1]=r20;HEAP32[r7+2]=r20;HEAP32[r7+3]=r16;HEAP32[r7+4]=r16;HEAP32[r7+5]=r16;HEAP32[r7+6]=r16;HEAP32[r7+7]=r20;FUNCTION_TABLE[HEAP32[HEAP32[r15]+12>>2]](HEAP32[r17],r21,4,-1,r11);r21=(r10|0)>1;L1193:do{if(r21){r7=(r3|0)/40&-1|0;r16=r20+r18|0;r6=1;while(1){r22=HEAP32[HEAP32[r15]+84>>2];r23=HEAP32[r17];r24=r7*Math.sqrt(HEAPF32[r19]);FUNCTION_TABLE[r22](r23,r24);r24=Math.imul(r6,r3)+r20|0;FUNCTION_TABLE[HEAP32[HEAP32[r15]+8>>2]](HEAP32[r17],r24,r20,r24,r16,r11);r24=r6+1|0;if((r24|0)==(r10|0)){break}else{r6=r24}}if(!r21){break}r6=(r3|0)/40&-1|0;r16=r20+r18|0;r7=1;while(1){r24=HEAP32[HEAP32[r15]+84>>2];r23=HEAP32[r17];r22=r6*Math.sqrt(HEAPF32[r19]);FUNCTION_TABLE[r24](r23,r22);r22=Math.imul(r7,r3)+r20|0;FUNCTION_TABLE[HEAP32[HEAP32[r15]+8>>2]](HEAP32[r17],r20,r22,r16,r22,r11);r22=r7+1|0;if((r22|0)==(r10|0)){break L1193}else{r7=r22}}}}while(0);r18=HEAP32[HEAP32[r15]+84>>2];r21=HEAP32[r17];r7=r1*Math.sqrt(HEAPF32[r19]);FUNCTION_TABLE[r18](r21,r7);r7=(r2+8|0)>>2;r21=HEAP32[HEAP32[r7]+8>>2],r18=r21>>2;r19=Math.imul(r10,r10);r1=_malloc(r19<<4);if((r1|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r16=r1;L1205:do{if((r19|0)!=0){r6=(r10<<1)+2|0;r22=0;while(1){r23=(r22<<2)+r21|0;r24=HEAP32[r23>>2];do{if((r24&2|0)==0){r25=0;r26=r24;while(1){r27=r26&1^r25;r28=r26>>2;r29=HEAP32[(r28<<2>>2)+r18];if((r29&2|0)==0){r25=r27;r26=r29}else{break}}L1213:do{if((r28|0)==(r22|0)){r30=r27;r31=r22}else{r26=r28<<2;r25=r24>>2;r29=r27^r24&1;HEAP32[r23>>2]=r27|r26;if((r25|0)==(r28|0)){r30=r29;r31=r28;break}else{r32=r25;r33=r29}while(1){r29=(r32<<2)+r21|0;r25=HEAP32[r29>>2];r34=r25>>2;r35=r25&1^r33;HEAP32[r29>>2]=r33|r26;if((r34|0)==(r28|0)){r30=r35;r31=r28;break L1213}else{r32=r34;r33=r35}}}}while(0);if((r30|0)!=0){___assert_func(66236,137,68704,67244)}if((r31|0)==(r22|0)){r4=851;break}else{break}}else{r4=851}}while(0);if(r4==851){r4=0;r23=(r22|0)%(r10|0);r24=(r22|0)/(r10|0)&-1;r26=0;r35=r23;r34=r24;r29=-1;r25=0;while(1){r36=-r25|0;r37=r35-r25|0;r38=r37+r29|0;r39=r34+r29|0;r40=r39+r25|0;if((r38|0)>-1&(r38|0)<(r10|0)&(r40|0)>-1&(r40|0)<(r10|0)){r41=Math.imul(r40,r10)+r38|0;if((r41|0)<=-1){___assert_func(66236,110,68704,67504)}r38=(r41<<2)+r21|0;r40=HEAP32[r38>>2];do{if((r40&2|0)==0){r42=0;r43=r40;while(1){r44=r43&1^r42;r45=r43>>2;r46=HEAP32[(r45<<2>>2)+r18];if((r46&2|0)==0){r42=r44;r43=r46}else{break}}L1234:do{if((r45|0)==(r41|0)){r47=r44;r48=r41}else{r43=r45<<2;r42=r40>>2;r46=r44^r40&1;HEAP32[r38>>2]=r44|r43;if((r42|0)==(r45|0)){r47=r46;r48=r45;break}else{r49=r42;r50=r46}while(1){r46=(r49<<2)+r21|0;r42=HEAP32[r46>>2];r51=r42>>2;r52=r42&1^r50;HEAP32[r46>>2]=r50|r43;if((r51|0)==(r45|0)){r47=r52;r48=r45;break L1234}else{r49=r51;r50=r52}}}}while(0);if((r47|0)==0){r53=r48;break}___assert_func(66236,137,68704,67244);r53=r48}else{r53=r41}}while(0);r54=(r53|0)==(r22|0)}else{r54=0}r41=r54&1;if((r37|0)>-1&(r37|0)<(r10|0)&(r39|0)>-1&(r39|0)<(r10|0)){r38=Math.imul(r39,r10)+r37|0;if((r38|0)<=-1){___assert_func(66236,110,68704,67504)}r40=(r38<<2)+r21|0;r43=HEAP32[r40>>2];do{if((r43&2|0)==0){r52=0;r51=r43;while(1){r55=r51&1^r52;r56=r51>>2;r46=HEAP32[(r56<<2>>2)+r18];if((r46&2|0)==0){r52=r55;r51=r46}else{break}}L1251:do{if((r56|0)==(r38|0)){r57=r55;r58=r38}else{r51=r56<<2;r52=r43>>2;r46=r55^r43&1;HEAP32[r40>>2]=r55|r51;if((r52|0)==(r56|0)){r57=r46;r58=r56;break}else{r59=r52;r60=r46}while(1){r46=(r59<<2)+r21|0;r52=HEAP32[r46>>2];r42=r52>>2;r61=r52&1^r60;HEAP32[r46>>2]=r60|r51;if((r42|0)==(r56|0)){r57=r61;r58=r56;break L1251}else{r59=r42;r60=r61}}}}while(0);if((r57|0)==0){r62=r58;break}___assert_func(66236,137,68704,67244);r62=r58}else{r62=r38}}while(0);r63=(r62|0)==(r22|0)}else{r63=0}r38=(r63&1)+r41|0;if((r38|0)==0){r64=r35;r65=r34;r66=r36;r67=r29}else if((r38|0)==2){r64=r29-r25+r35|0;r65=r29+r25+r34|0;r66=r25;r67=-r29|0}else{r64=r37;r65=r39;r66=r29;r67=r25}do{if((r64|0)>-1&(r64|0)<(r10|0)&(r65|0)>-1&(r65|0)<(r10|0)){r38=Math.imul(r65,r10)+r64|0;if((r38|0)<=-1){___assert_func(66236,110,68704,67504)}r40=(r38<<2)+r21|0;r43=HEAP32[r40>>2];do{if((r43&2|0)==0){r51=0;r61=r43;while(1){r68=r61&1^r51;r69=r61>>2;r42=HEAP32[(r69<<2>>2)+r18];if((r42&2|0)==0){r51=r68;r61=r42}else{break}}L1272:do{if((r69|0)==(r38|0)){r70=r68;r71=r38}else{r61=r69<<2;r51=r43>>2;r42=r68^r43&1;HEAP32[r40>>2]=r68|r61;if((r51|0)==(r69|0)){r70=r42;r71=r69;break}else{r72=r51;r73=r42}while(1){r42=(r72<<2)+r21|0;r51=HEAP32[r42>>2];r46=r51>>2;r52=r51&1^r73;HEAP32[r42>>2]=r73|r61;if((r46|0)==(r69|0)){r70=r52;r71=r69;break L1272}else{r72=r46;r73=r52}}}}while(0);if((r70|0)==0){r74=r71;break}___assert_func(66236,137,68704,67244);r74=r71}else{r74=r38}}while(0);if((r74|0)==(r22|0)){break}else{r4=888;break}}else{r4=888}}while(0);if(r4==888){r4=0;___assert_func(66380,2134,68380,66268)}r39=r64+r66|0;do{if((r39|0)>-1&(r39|0)<(r10|0)){r37=r65+r67|0;if(!((r37|0)>-1&(r37|0)<(r10|0))){break}r36=Math.imul(r37,r10)+r39|0;if((r36|0)<=-1){___assert_func(66236,110,68704,67504)}r37=(r36<<2)+r21|0;r41=HEAP32[r37>>2];do{if((r41&2|0)==0){r38=0;r40=r41;while(1){r75=r40&1^r38;r76=r40>>2;r43=HEAP32[(r76<<2>>2)+r18];if((r43&2|0)==0){r38=r75;r40=r43}else{break}}L1292:do{if((r76|0)==(r36|0)){r77=r75;r78=r36}else{r40=r76<<2;r38=r41>>2;r43=r75^r41&1;HEAP32[r37>>2]=r75|r40;if((r38|0)==(r76|0)){r77=r43;r78=r76;break}else{r79=r38;r80=r43}while(1){r43=(r79<<2)+r21|0;r38=HEAP32[r43>>2];r61=r38>>2;r52=r38&1^r80;HEAP32[r43>>2]=r80|r40;if((r61|0)==(r76|0)){r77=r52;r78=r76;break L1292}else{r79=r61;r80=r52}}}}while(0);if((r77|0)==0){r81=r78;break}___assert_func(66236,137,68704,67244);r81=r78}else{r81=r36}}while(0);if((r81|0)!=(r22|0)){break}___assert_func(66380,2136,68380,66120)}}while(0);if((r26|0)>=(r6|0)){___assert_func(66380,2145,68380,66064)}r39=Math.imul((r66+r67+(r64<<1|1)|0)/2&-1,r3)+r20|0;r36=r26<<1;HEAP32[r16+(r36<<2)>>2]=r39;r39=Math.imul((r67-r66+(r65<<1|1)|0)/2&-1,r3)+r20|0;HEAP32[r16+((r36|1)<<2)>>2]=r39;r82=r26+1|0;if((r64|0)==(r23|0)&(r65|0)==(r24|0)&(r66|0)==-1&(r67|0)==0){break}else{r26=r82;r35=r64;r34=r65;r29=r66;r25=r67}}FUNCTION_TABLE[HEAP32[HEAP32[r15]+12>>2]](HEAP32[r17],r16,r82,-1,r11)}r25=r22+1|0;if((r25|0)<(r19|0)){r22=r25}else{break L1205}}}}while(0);_free(r1);r1=(r10|0)>0;L1307:do{if(r1){r19=r8|0;r82=(r3*5&-1|0)/80&-1;r16=(r3*20&-1|0)/80&-1;r67=(r3|0)/4&-1;r66=0;while(1){r65=Math.imul(r66,r10);r64=Math.imul(r66,r3)+r20+r16|0;r81=0;while(1){r78=HEAP32[HEAP32[r7]+8>>2];r77=r81+r65|0;if((r77|0)<=-1){___assert_func(66236,110,68704,67504)}r80=(r77<<2)+r78|0;r79=HEAP32[r80>>2];do{if((r79&2|0)==0){r76=0;r21=r79;while(1){r83=r21&1^r76;r84=r21>>2;r75=HEAP32[r78+(r84<<2)>>2];if((r75&2|0)==0){r76=r83;r21=r75}else{break}}L1320:do{if((r84|0)==(r77|0)){r85=r83;r86=r77}else{r21=r84<<2;r76=r79>>2;r75=r83^r79&1;HEAP32[r80>>2]=r83|r21;if((r76|0)==(r84|0)){r85=r75;r86=r84;break}else{r87=r76;r88=r75}while(1){r75=(r87<<2)+r78|0;r76=HEAP32[r75>>2];r18=r76>>2;r74=r88^r76&1;HEAP32[r75>>2]=r88|r21;if((r18|0)==(r84|0)){r85=r74;r86=r84;break L1320}else{r87=r18;r88=r74}}}}while(0);if((r85|0)!=0){___assert_func(66236,137,68704,67244)}if((r86|0)==(r77|0)){r4=922;break}else{break}}else{r4=922}}while(0);if(r4==922){r4=0;r78=HEAP32[r7];r80=HEAP32[HEAP32[r78+12>>2]+(r77<<2)>>2];r79=r80&1610612736;r21=r80&-1610612737;do{if((_dsf_size(HEAP32[r78+8>>2],r77)|0)==1){r89=67528}else{if((r79|0)==1073741824){r89=r12;break}else if((r79|0)==0){r89=66460;break}else{r89=(r79|0)==536870912?r13:r14;break}}}while(0);_sprintf(r19,67076,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r21,HEAP32[tempInt+4>>2]=r89,tempInt));r79=Math.imul(r81,r3)+r20+r82|0;FUNCTION_TABLE[HEAP32[HEAP32[r15]>>2]](HEAP32[r17],r79,r64,1,r67,0,r11,r19)}r79=r81+1|0;if((r79|0)==(r10|0)){break}else{r81=r79}}r81=r66+1|0;if((r81|0)==(r10|0)){break}else{r66=r81}}if(!r1){break}r66=r2+12|0;r19=r9+1|0;r67=r9|0;r82=r20<<1;r16=0;while(1){r81=Math.imul(r16,r10);r64=r82+Math.imul(r16,r3)|0;r65=0;while(1){r79=HEAP32[r66>>2]+r65+r81|0;if(HEAP8[r79]<<24>>24!=0){HEAP8[r19]=0;HEAP8[r67]=HEAP8[r79]+48&255;r79=r82+Math.imul(r65,r3)|0;FUNCTION_TABLE[HEAP32[HEAP32[r15]>>2]](HEAP32[r17],r79,r64,1,r20,257,r11,r67)}r79=r65+1|0;if((r79|0)==(r10|0)){break}else{r65=r79}}r65=r16+1|0;if((r65|0)==(r10|0)){break L1307}else{r16=r65}}}}while(0);if((r12|0)!=0){_free(r12)}if((r13|0)!=0){_free(r13)}if((r14|0)==0){STACKTOP=r5;return}_free(r14);STACKTOP=r5;return}function _solver_easy(r1,r2){var r3;if((HEAP32[r2+4>>2]|0)>0){r3=0;return r3}r3=_solver_common(r1,r2,0);return r3}function _solver_normal(r1,r2){return _solver_common(r1,r2,1)}function _solver_hard(r1,r2){return _solver_common(r1,r2,2)}function _check_errors(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r3=0;r4=STACKTOP;r5=HEAP32[r1>>2];r6=Math.imul(r5,r5);r7=r6<<2;r8=_malloc(r7);if((r8|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r9=r8;r10=_malloc(r7);if((r10|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r7=r10>>2;r11=(r2|0)!=0;L1373:do{if(r11){if((r6|0)==0){r12=0;break}else{r13=0}while(1){HEAP32[r2+(r13<<2)>>2]=0;HEAP32[(r13<<2>>2)+r7]=1;r14=r13+1|0;if((r14|0)<(r6|0)){r13=r14}else{r3=956;break L1373}}}else{r3=956}}while(0);L1377:do{if(r3==956){r13=(r6|0)==0;if(r13){r12=0;break}r14=r1+8|0;r15=(r1+12|0)>>2;r16=0;while(1){r17=HEAP32[HEAP32[r14>>2]+8>>2];r18=(r16<<2)+r17|0;r19=HEAP32[r18>>2];L1382:do{if((r19&2|0)==0){r20=0;r21=r19;while(1){r22=r21&1^r20;r23=r21>>2;r24=HEAP32[r17+(r23<<2)>>2];if((r24&2|0)==0){r20=r22;r21=r24}else{break}}L1386:do{if((r23|0)==(r16|0)){r25=r22;r26=r16}else{r21=r23<<2;r20=r19>>2;r24=r22^r19&1;HEAP32[r18>>2]=r22|r21;if((r20|0)==(r23|0)){r25=r24;r26=r23;break}else{r27=r20;r28=r24}while(1){r24=(r27<<2)+r17|0;r20=HEAP32[r24>>2];r29=r20>>2;r30=r28^r20&1;HEAP32[r24>>2]=r28|r21;if((r29|0)==(r23|0)){r25=r30;r26=r23;break L1386}else{r27=r29;r28=r30}}}}while(0);if((r25|0)!=0){___assert_func(66236,137,68704,67244)}if((r26|0)==(r16|0)){r3=969;break}r21=HEAP32[HEAP32[HEAP32[r14>>2]+12>>2]+(r26<<2)>>2]&1610612736;if((r21|0)==0){r30=(r26<<2)+r9|0;HEAP32[r30>>2]=HEAP32[r30>>2]+HEAPU8[HEAP32[r15]+r16|0]|0;r31=r26;break}else if((r21|0)==536870912){r30=(r26<<2)+r9|0;r29=Math.imul(HEAP32[r30>>2],HEAPU8[HEAP32[r15]+r16|0]);HEAP32[r30>>2]=r29;r31=r26;break}else if((r21|0)==1073741824){r29=(r26<<2)+r9|0;r30=HEAP32[r29>>2]-HEAPU8[HEAP32[r15]+r16|0]|0;HEAP32[r29>>2]=(r30|0)>-1?r30:-r30|0;r31=r26;break}else if((r21|0)==1610612736){r21=((r26<<2)+r9|0)>>2;r30=HEAP32[r21];r29=HEAPU8[HEAP32[r15]+r16|0];r24=(r30|0)<(r29|0)?r30:r29;r20=(r30|0)>(r29|0)?r30:r29;do{if((r24|0)!=0){if(((r20|0)%(r24|0)|0)!=0){break}HEAP32[r21]=(r20|0)/(r24|0)&-1;r31=r26;break L1382}}while(0);HEAP32[r21]=0;r31=r26;break}else{r31=r26;break}}else{r3=969}}while(0);if(r3==969){r3=0;HEAP32[r9+(r16<<2)>>2]=HEAPU8[HEAP32[r15]+r16|0];r31=r16}if(HEAP8[HEAP32[r15]+r16|0]<<24>>24==0){HEAP32[(r31<<2>>2)+r7]=0}r17=r16+1|0;if((r17|0)<(r6|0)){r16=r17}else{break}}if(r13){r12=0;break}r16=r1+8|0;r15=r11^1;r14=0;r17=0;while(1){r18=HEAP32[HEAP32[r16>>2]+8>>2];r19=(r17<<2)+r18|0;r24=HEAP32[r19>>2];do{if((r24&2|0)==0){r20=0;r29=r24;while(1){r32=r29&1^r20;r33=r29>>2;r30=HEAP32[r18+(r33<<2)>>2];if((r30&2|0)==0){r20=r32;r29=r30}else{break}}L1418:do{if((r33|0)==(r17|0)){r34=r32;r35=r17}else{r29=r33<<2;r20=r24>>2;r21=r32^r24&1;HEAP32[r19>>2]=r32|r29;if((r20|0)==(r33|0)){r34=r21;r35=r33;break}else{r36=r20;r37=r21}while(1){r21=(r36<<2)+r18|0;r20=HEAP32[r21>>2];r30=r20>>2;r38=r37^r20&1;HEAP32[r21>>2]=r37|r29;if((r30|0)==(r33|0)){r34=r38;r35=r33;break L1418}else{r36=r30;r37=r38}}}}while(0);if((r34|0)!=0){___assert_func(66236,137,68704,67244)}if((r35|0)==(r17|0)){r3=989;break}else{r39=r14;break}}else{r3=989}}while(0);do{if(r3==989){r3=0;r18=(HEAP32[HEAP32[HEAP32[r16>>2]+12>>2]+(r17<<2)>>2]&-1610612737|0)==(HEAP32[r9+(r17<<2)>>2]|0);if(r18|r15){r39=r18?r14:1;break}if((HEAP32[(r17<<2>>2)+r7]|0)==0){r39=1;break}r18=(r17<<2)+r2|0;HEAP32[r18>>2]=HEAP32[r18>>2]|16384;r39=1}}while(0);r18=r17+1|0;if((r18|0)<(r6|0)){r14=r39;r17=r18}else{r12=r39;break L1377}}}}while(0);_free(r8);_free(r10);r10=(r5|0)>0;if(!r10){r40=r12;STACKTOP=r4;return r40}r8=(1<<r5+1)-2|0;r39=r1+12|0;r6=r12;r12=0;while(1){r7=Math.imul(r12,r5);r9=HEAP32[r39>>2];r3=0;r35=0;r34=0;while(1){r37=1<<HEAPU8[r9+r3+r7|0];r41=r37&r35|r34;r42=r37|r35;r37=r3+1|0;if((r37|0)==(r5|0)){break}else{r3=r37;r35=r42;r34=r41}}r34=r41&-2;r35=(r42|0)==(r8|0);L1440:do{if(r35|r11^1){r43=r35?r6:1}else{r3=Math.imul(r12,r5);r7=0;while(1){r9=r7+r3|0;if((r34&1<<HEAPU8[HEAP32[r39>>2]+r9|0]|0)!=0){r37=(r9<<2)+r2|0;HEAP32[r37>>2]=HEAP32[r37>>2]|32768}r37=r7+1|0;if((r37|0)==(r5|0)){r43=1;break L1440}else{r7=r37}}}}while(0);r34=r12+1|0;if((r34|0)==(r5|0)){break}else{r6=r43;r12=r34}}if(!r10){r40=r43;STACKTOP=r4;return r40}r10=(1<<r5+1)-2|0;r12=r1+12|0;r1=r43;r43=0;while(1){r6=HEAP32[r12>>2];r39=0;r8=0;r42=0;while(1){r41=r6+Math.imul(r39,r5)+r43|0;r34=1<<HEAPU8[r41];r44=r34&r8|r42;r45=r34|r8;r34=r39+1|0;if((r34|0)==(r5|0)){break}else{r39=r34;r8=r45;r42=r44}}r42=r44&-2;r8=(r45|0)==(r10|0);L1457:do{if(r8|r11^1){r46=r8?r1:1}else{r39=0;while(1){r6=Math.imul(r39,r5)+r43|0;if((r42&1<<HEAPU8[HEAP32[r12>>2]+r6|0]|0)!=0){r34=(r6<<2)+r2|0;HEAP32[r34>>2]=HEAP32[r34>>2]|32768}r34=r39+1|0;if((r34|0)==(r5|0)){r46=1;break L1457}else{r39=r34}}}}while(0);r42=r43+1|0;if((r42|0)==(r5|0)){r40=r46;break}else{r1=r46;r43=r42}}STACKTOP=r4;return r40}function _solver(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47;r6=0;r7=STACKTOP;STACKTOP=STACKTOP+60|0;r8=r7,r9=r8>>2;r10=r7+20,r11=r10>>2;r12=Math.imul(r1,r1);HEAP32[r11]=r1;HEAP32[r11+7]=r4;HEAP32[r11+1]=r5;r11=(r10+8|0)>>2;HEAP32[r11]=0;r13=(r12|0)==0;L1466:do{if(!r13){r14=0;while(1){r15=(r14<<2)+r2|0;r16=HEAP32[r15>>2];do{if((r16&2|0)==0){r17=0;r18=r16;while(1){r19=r18&1^r17;r20=r18>>2;r21=HEAP32[r2+(r20<<2)>>2];if((r21&2|0)==0){r17=r19;r18=r21}else{break}}L1473:do{if((r20|0)==(r14|0)){r22=r19;r23=r14}else{r18=r20<<2;r17=r16>>2;r21=r19^r16&1;HEAP32[r15>>2]=r19|r18;if((r17|0)==(r20|0)){r22=r21;r23=r20;break}else{r24=r17;r25=r21}while(1){r21=(r24<<2)+r2|0;r17=HEAP32[r21>>2];r26=r17>>2;r27=r25^r17&1;HEAP32[r21>>2]=r25|r18;if((r26|0)==(r20|0)){r22=r27;r23=r20;break L1473}else{r24=r26;r25=r27}}}}while(0);if((r22|0)!=0){___assert_func(66236,137,68704,67244)}if((r23|0)==(r14|0)){r6=1025;break}else{break}}else{r6=1025}}while(0);if(r6==1025){r6=0;HEAP32[r11]=HEAP32[r11]+1|0}r15=r14+1|0;if((r15|0)<(r12|0)){r14=r15}else{break L1466}}}}while(0);r23=r12<<2;r22=_malloc(r23);if((r22|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r25=(r10+16|0)>>2;HEAP32[r25]=r22;r22=HEAP32[r11];r24=r22<<2;r20=_malloc(r24+4|0);if((r20|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r19=(r10+12|0)>>2;HEAP32[r19]=r20;r20=_malloc(r24);if((r20|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r24=(r10+24|0)>>2;HEAP32[r24]=r20;r20=_malloc(r23);if((r20|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r23=(r10+20|0)>>2;HEAP32[r23]=r20;if(r13){r28=0;r29=0;r30=r22}else{r22=0;r13=0;r20=0;while(1){r14=(r22<<2)+r2|0;r15=HEAP32[r14>>2];do{if((r15&2|0)==0){r16=0;r18=r15;while(1){r31=r18&1^r16;r32=r18>>2;r27=HEAP32[r2+(r32<<2)>>2];if((r27&2|0)==0){r16=r31;r18=r27}else{break}}L1504:do{if((r32|0)==(r22|0)){r33=r31;r34=r22}else{r18=r32<<2;r16=r15>>2;r27=r31^r15&1;HEAP32[r14>>2]=r31|r18;if((r16|0)==(r32|0)){r33=r27;r34=r32;break}else{r35=r16;r36=r27}while(1){r27=(r35<<2)+r2|0;r16=HEAP32[r27>>2];r26=r16>>2;r21=r36^r16&1;HEAP32[r27>>2]=r36|r18;if((r26|0)==(r32|0)){r33=r21;r34=r32;break L1504}else{r35=r26;r36=r21}}}}while(0);if((r33|0)!=0){___assert_func(66236,137,68704,67244)}if((r34|0)==(r22|0)){r6=1044;break}else{r37=r20;r38=r13;break}}else{r6=1044}}while(0);if(r6==1044){r6=0;HEAP32[HEAP32[r24]+(r13<<2)>>2]=HEAP32[r3+(r22<<2)>>2];HEAP32[HEAP32[r19]+(r13<<2)>>2]=r20;r14=0;r15=r20;while(1){r18=(r14<<2)+r2|0;r21=HEAP32[r18>>2];do{if((r21&2|0)==0){r26=0;r27=r21;while(1){r39=r27&1^r26;r40=r27>>2;r16=HEAP32[r2+(r40<<2)>>2];if((r16&2|0)==0){r26=r39;r27=r16}else{break}}L1520:do{if((r40|0)==(r14|0)){r41=r39;r42=r14}else{r27=r40<<2;r26=r21>>2;r16=r39^r21&1;HEAP32[r18>>2]=r39|r27;if((r26|0)==(r40|0)){r41=r16;r42=r40;break}else{r43=r26;r44=r16}while(1){r16=(r43<<2)+r2|0;r26=HEAP32[r16>>2];r17=r26>>2;r45=r44^r26&1;HEAP32[r16>>2]=r44|r27;if((r17|0)==(r40|0)){r41=r45;r42=r40;break L1520}else{r43=r17;r44=r45}}}}while(0);if((r41|0)==0){r46=r42;break}___assert_func(66236,137,68704,67244);r46=r42}else{r46=r14}}while(0);if((r46|0)==(r22|0)){r18=Math.imul((r14|0)%(r1|0),r1)+((r14|0)/(r1|0)&-1)|0;HEAP32[HEAP32[r25]+(r15<<2)>>2]=r18;HEAP32[HEAP32[r23]+(HEAP32[HEAP32[r25]+(r15<<2)>>2]<<2)>>2]=r13;r47=r15+1|0}else{r47=r15}r18=r14+1|0;if((r18|0)<(r12|0)){r14=r18;r15=r47}else{break}}r37=r47;r38=r13+1|0}r15=r22+1|0;if((r15|0)<(r12|0)){r22=r15;r13=r38;r20=r37}else{break}}r28=r38;r29=r37;r30=HEAP32[r11]}if((r28|0)!=(r30|0)){___assert_func(66380,566,68360,67364)}if((r29|0)!=(r12|0)){___assert_func(66380,567,68360,67356)}HEAP32[HEAP32[r19]+(r28<<2)>>2]=r29;r29=r12+1|0;r12=_malloc(r29);if((r12|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r28=r10+32|0;HEAP32[r28>>2]=r12;r12=r1<<2;r30=_malloc(((r29|0)>(r12|0)?r29:r12)<<2);if((r30|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r12=r10+36|0;HEAP32[r12>>2]=r30;_latin_solver_alloc(r8,r4,r1);r1=_latin_solver_top(r8,r5,0,2,3,3,4,65772,r10,0,0);r10=HEAP32[r9+1];if((r10|0)!=0){_free(r10)}r10=HEAP32[r9+3];if((r10|0)!=0){_free(r10)}r10=HEAP32[r9+4];if((r10|0)!=0){_free(r10)}r10=HEAP32[r28>>2];if((r10|0)!=0){_free(r10)}r10=HEAP32[r12>>2];if((r10|0)!=0){_free(r10)}r10=HEAP32[r23];if((r10|0)!=0){_free(r10)}r10=HEAP32[r25];if((r10|0)!=0){_free(r10)}r10=HEAP32[r19];if((r10|0)!=0){_free(r10)}r10=HEAP32[r24];if((r10|0)==0){STACKTOP=r7;return r1}_free(r10);STACKTOP=r7;return r1}function _solver_clue_candidate(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r4=HEAP32[r1>>2];r5=HEAP32[r1+12>>2];r6=HEAP32[r5+(r3<<2)>>2];r7=HEAP32[r5+(r3+1<<2)>>2]-r6|0;if((r2|0)==0){r3=(r7|0)>0;if(!r3){return}r5=HEAP32[r1+32>>2];r8=0;r9=0;while(1){r10=1<<HEAPU8[r5+r9|0]|r8;r11=r9+1|0;if((r11|0)==(r7|0)){break}else{r8=r10;r9=r11}}if(!r3){return}r3=r1+36|0;r9=0;while(1){r8=(r9<<2)+HEAP32[r3>>2]|0;HEAP32[r8>>2]=HEAP32[r8>>2]|r10;r8=r9+1|0;if((r8|0)==(r7|0)){break}else{r9=r8}}return}else if((r2|0)==1){if((r7|0)<=0){return}r9=r1+32|0;r10=r1+36|0;r3=0;while(1){r8=(r3<<2)+HEAP32[r10>>2]|0;HEAP32[r8>>2]=HEAP32[r8>>2]|1<<HEAPU8[HEAP32[r9>>2]+r3|0];r8=r3+1|0;if((r8|0)==(r7|0)){break}else{r3=r8}}return}else if((r2|0)==2){r2=HEAP32[r1+16>>2];r3=r4<<1;r9=(r3|0)>0;L1598:do{if(r9){r10=r1+36|0;r8=r4<<1;r5=0;while(1){HEAP32[HEAP32[r10>>2]+(r5+r3<<2)>>2]=0;r11=r5+1|0;if((r11|0)==(r8|0)){break L1598}else{r5=r11}}}}while(0);L1603:do{if((r7|0)>0){r5=r1+32|0;r8=r1+36|0;r10=r4*3&-1;r11=0;while(1){r12=HEAP32[r2+(r11+r6<<2)>>2];r13=(((r12|0)/(r4|0)&-1)+r3<<2)+HEAP32[r8>>2]|0;HEAP32[r13>>2]=HEAP32[r13>>2]|1<<HEAPU8[HEAP32[r5>>2]+r11|0];r13=((r12|0)%(r4|0)+r10<<2)+HEAP32[r8>>2]|0;HEAP32[r13>>2]=HEAP32[r13>>2]|1<<HEAPU8[HEAP32[r5>>2]+r11|0];r13=r11+1|0;if((r13|0)==(r7|0)){break L1603}else{r11=r13}}}}while(0);if(!r9){return}r9=r1+36|0;r1=r4<<1;r4=0;while(1){r7=HEAP32[r9>>2];r6=(r4<<2)+r7|0;HEAP32[r6>>2]=HEAP32[r6>>2]&HEAP32[r7+(r4+r3<<2)>>2];r7=r4+1|0;if((r7|0)==(r1|0)){break}else{r4=r7}}return}else{return}}function _solver_common(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61;r4=0;r5=r2;r6=HEAP32[r2>>2];r7=r2+8|0;if((HEAP32[r7>>2]|0)<=0){r8=0;return r8}r9=r2+16|0;r10=r2+12|0;r11=r2+24|0;r12=(r3|0)==2;r13=(r3|0)<2;r14=(r6<<1|0)>0;r15=(r6|0)<1;r16=(r2+36|0)>>2;r17=r2+20|0;r18=(r1+4|0)>>2;r1=(r2+32|0)>>2;r2=r6+1|0;r19=(1<<r2)-2|0;r20=r6<<1;r21=0;r22=0;L1618:while(1){r23=HEAP32[r9>>2];r24=HEAP32[r10>>2];r25=HEAP32[r24+(r22<<2)>>2];r26=(r25<<2)+r23|0;r27=r22+1|0;r28=HEAP32[r24+(r27<<2)>>2]-r25|0;r24=HEAP32[HEAP32[r11>>2]+(r22<<2)>>2];r29=r24&-1610612737;r30=r24&1610612736;r24=(r28|0)>0;L1620:do{if(r12){if(r24){r31=0}else{break}while(1){HEAP32[HEAP32[r16]+(r31<<2)>>2]=r19;r32=r31+1|0;if((r32|0)==(r28|0)){break L1620}else{r31=r32}}}else{if(r24){r33=0}else{break}while(1){HEAP32[HEAP32[r16]+(r33<<2)>>2]=0;r32=r33+1|0;if((r32|0)==(r28|0)){break L1620}else{r33=r32}}}}while(0);L1628:do{if((r30|0)==0|(r30|0)==536870912){HEAP8[HEAP32[r1]]=0;r24=(r30|0)==0;r32=r24&1^1;r34=0;r35=r29;L1630:while(1){if((r34|0)>=(r28|0)){if((r35|0)==(r32|0)){_solver_clue_candidate(r5,r3,r22)}r36=r34-1|0;r37=HEAPU8[HEAP32[r1]+r36|0];if(r24){r34=r36;r35=r37+r35|0;continue}else{r34=r36;r35=Math.imul(r37,r35);continue}}r37=HEAP32[r1];r36=r37+r34|0;r38=HEAPU8[r36];r39=r38+1|0;L1641:do{if((r39|0)<=(r6|0)){r40=(r34+r25<<2)+r23|0;r41=(r34|0)>0;r42=r38;r43=r39;L1643:while(1){do{if(r24){if((r35|0)<(r43|0)){break}else{r4=1146;break}}else{if(((r35|0)%(r43|0)|0)==0){r4=1146;break}else{break}}}while(0);L1648:do{if(r4==1146){r4=0;r44=HEAP32[r40>>2];r45=Math.imul(r44,r6)+r42|0;if(HEAP8[HEAP32[r18]+r45|0]<<24>>24==0){break}if(r41){r46=0}else{break L1643}while(1){if((HEAPU8[r37+r46|0]|0)==(r43|0)){r45=HEAP32[r23+(r46+r25<<2)>>2];if(((r45|0)%(r6|0)|0)==((r44|0)%(r6|0)|0)){break L1648}if(((r45|0)/(r6|0)&-1|0)==((r44|0)/(r6|0)&-1|0)){break L1648}}r45=r46+1|0;if((r45|0)<(r34|0)){r46=r45}else{break L1643}}}}while(0);r44=r43+1|0;if((r44|0)>(r6|0)){break L1641}else{r42=r43;r43=r44}}r42=r34+1|0;HEAP8[r36]=r43&255;if(r24){r47=r35-r43|0}else{r47=(r35|0)/(r43|0)&-1}HEAP8[HEAP32[r1]+r42|0]=0;r34=r42;r35=r47;continue L1630}}while(0);r36=r34-1|0;if((r36|0)<0){break L1628}r39=HEAPU8[r37+r36|0];if(r24){r34=r36;r35=r39+r35|0;continue}else{r34=r36;r35=Math.imul(r39,r35);continue}}}else if((r30|0)==1073741824|(r30|0)==1610612736){if((r28|0)!=2){___assert_func(66380,309,68344,67348)}if(r15){break}r35=(r30|0)==1073741824;r34=(r25+1<<2)+r23|0;r24=1;while(1){if(r35){r48=r24+r29|0}else{r48=Math.imul(r24,r29)}if((r48|0)>(r6|0)){break L1628}r32=HEAP32[r26>>2];r39=r24-1|0;r36=r39+Math.imul(r32,r6)|0;r38=HEAP32[r18];do{if(HEAP8[r38+r36|0]<<24>>24==0){r49=r32;r50=r38;r51=r48-1|0}else{r42=r48-1|0;r41=r38+r42+Math.imul(HEAP32[r34>>2],r6)|0;if(HEAP8[r41]<<24>>24==0){r49=r32;r50=r38;r51=r42;break}HEAP8[HEAP32[r1]]=r24&255;HEAP8[HEAP32[r1]+1|0]=r48&255;_solver_clue_candidate(r5,r3,r22);r49=HEAP32[r26>>2];r50=HEAP32[r18];r51=r42}}while(0);r38=r50+r51+Math.imul(r49,r6)|0;do{if(HEAP8[r38]<<24>>24!=0){r32=r50+r39+Math.imul(HEAP32[r34>>2],r6)|0;if(HEAP8[r32]<<24>>24==0){break}HEAP8[HEAP32[r1]]=r48&255;HEAP8[HEAP32[r1]+1|0]=r24&255;_solver_clue_candidate(r5,r3,r22)}}while(0);r39=r24+1|0;if((r39|0)>(r6|0)){break L1628}else{r24=r39}}}}while(0);L1690:do{if(r13){if((r28|0)>0){r52=r21;r53=0}else{r54=r21;break}while(1){L1694:do{if(r15){r55=r52}else{r26=(r53+r25<<2)+r23|0;r29=r52;r30=1;while(1){r24=(r30-1+Math.imul(HEAP32[r26>>2],r6)|0)+HEAP32[r18]|0;do{if(HEAP8[r24]<<24>>24==0){r56=r29}else{if((HEAP32[HEAP32[r16]+(r53<<2)>>2]&1<<r30|0)!=0){r56=r29;break}HEAP8[r24]=0;r56=1}}while(0);r24=r30+1|0;if((r24|0)==(r2|0)){r55=r56;break L1694}else{r29=r56;r30=r24}}}}while(0);r30=r53+1|0;if((r30|0)==(r28|0)){r54=r55;break L1690}else{r52=r55;r53=r30}}}else{L1704:do{if(r14){r30=r21;r29=0;while(1){r26=(r29|0)<(r6|0);if(r26){r57=Math.imul(r29,r6)}else{r57=r29-r6|0}r43=r26?1:r6;L1711:do{if(r15){r58=r30}else{r26=r30;r24=1;while(1){L1714:do{if((HEAP32[HEAP32[r16]+(r29<<2)>>2]&1<<r24|0)==0|(r6|0)<1){r59=r26}else{r34=r24-1|0;r35=r26;r39=0;while(1){r38=Math.imul(r39,r43)+r57|0;do{if((HEAP32[HEAP32[r17>>2]+(r38<<2)>>2]|0)==(r22|0)){r60=r35}else{r32=(r34+Math.imul(r38,r6)|0)+HEAP32[r18]|0;if(HEAP8[r32]<<24>>24==0){r60=r35;break}HEAP8[r32]=0;r60=1}}while(0);r38=r39+1|0;if((r38|0)==(r6|0)){r59=r60;break L1714}else{r35=r60;r39=r38}}}}while(0);r39=r24+1|0;if((r39|0)==(r2|0)){r58=r59;break L1711}else{r26=r59;r24=r39}}}}while(0);r43=r29+1|0;if((r43|0)==(r20|0)){r61=r58;break L1704}else{r30=r58;r29=r43}}}else{r61=r21}}while(0);if((r61|0)==0){r54=0}else{r8=r61;r4=1192;break L1618}}}while(0);if((r27|0)<(HEAP32[r7>>2]|0)){r21=r54;r22=r27}else{r8=r54;r4=1193;break}}if(r4==1192){return r8}else if(r4==1193){return r8}}function _parse_block_structure(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r4=0;r5=Math.imul(r2,r2);L1730:do{if((r5|0)!=0){r6=0;while(1){HEAP32[r3+(r6<<2)>>2]=6;r7=r6+1|0;if((r7|0)==(r5|0)){break L1730}else{r6=r7}}}}while(0);r5=HEAP32[r1>>2];r6=HEAP8[r5];r7=r2-1|0;r8=Math.imul(r2<<1,r7);r9=r8|1;L1734:do{if(r6<<24>>24==0){r10=0}else{r11=Math.imul(r7,r2);r12=0;r13=0;r14=0;r15=r6;r16=r5;L1736:while(1){r17=(r12|0)>0;if(r15<<24>>24==44&(r17^1)){r10=r14;break L1734}L1739:do{if(r17){r18=r13;r19=r12-1|0;r20=r13}else{r21=r15<<24>>24==95;if(!(r21|(r15-97&255)<26)){r22=67192;r4=1220;break L1736}if(r21){r23=0}else{r23=(r15<<24>>24)-96|0}r21=r16+1|0;HEAP32[r1>>2]=r21;r24=HEAP8[r21];if(r24<<24>>24==0){r18=r13;r19=r12;r20=r23;break}if(((r24&255)-48|0)>>>0>=10){r18=r13;r19=r12;r20=r23;break}r25=_atoi(r21)-1|0;r26=r24;r24=r21;while(1){if(((r26&255)-48|0)>>>0>=10){r18=r23;r19=r25;r20=r23;break L1739}r21=r24+1|0;HEAP32[r1>>2]=r21;r27=HEAP8[r21];if(r27<<24>>24==0){r18=r23;r19=r25;r20=r23;break L1739}else{r26=r27;r24=r21}}}}while(0);r17=(r20|0)==25;L1752:do{if((r20|0)>0){r24=r14;r26=r20;while(1){r25=r26-1|0;if((r24|0)>=(r8|0)){r22=67144;r4=1221;break L1736}r21=(r24|0)/(r7|0)&-1;if((r24|0)<(r11|0)){r27=(r24|0)%(r7|0)+Math.imul(r21,r2)|0;r28=r27+1|0;r29=r27}else{r27=r21-r2|0;r21=(r24|0)%(r7|0);r30=Math.imul(r21,r2)+r27|0;r28=Math.imul(r21+1|0,r2)+r27|0;r29=r30}_edsf_merge(r3,r29,r28,0);r30=r24+1|0;if((r25|0)>0){r24=r30;r26=r25}else{r31=r30;break L1752}}}else{r31=r14}}while(0);if(r17){r32=r31}else{r26=r31+1|0;if((r26|0)>(r9|0)){r22=67144;r4=1222;break}else{r32=r26}}r26=HEAP32[r1>>2];r24=HEAP8[r26];if(r24<<24>>24==0){r10=r32;break L1734}else{r12=r19;r13=r18;r14=r32;r15=r24;r16=r26}}if(r4==1221){return r22}else if(r4==1222){return r22}else if(r4==1220){return r22}}}while(0);r22=(r10|0)==(r9|0)?0:67024;return r22}function _status_bar(r1,r2){var r3,r4,r5,r6;r3=r1|0;if((HEAP32[HEAP32[r3>>2]+40>>2]|0)==0){return}r4=r1+24|0;r5=HEAP32[r4>>2];if((r5|0)==0){___assert_func(66432,198,68332,67328);r6=HEAP32[r4>>2]}else{r6=r5}r5=_midend_rewrite_statusbar(r6,r2);r2=(r1+28|0)>>2;r6=HEAP32[r2];do{if((r6|0)!=0){if((_strcmp(r5,r6)|0)!=0){break}if((r5|0)==0){return}_free(r5);return}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+40>>2]](HEAP32[r1+4>>2],r5);r1=HEAP32[r2];if((r1|0)!=0){_free(r1)}HEAP32[r2]=r5;return}function _text_fallback(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10;r4=0;r5=STACKTOP;do{if((r1|0)==0){r6=0}else{r7=HEAP32[HEAP32[r1>>2]+92>>2];if((r7|0)==0){r6=0;break}r8=FUNCTION_TABLE[r7](HEAP32[r1+4>>2],r2,r3);STACKTOP=r5;return r8}}while(0);while(1){if((r6|0)>=(r3|0)){r4=1249;break}r9=HEAP32[r2+(r6<<2)>>2];r1=r9;while(1){r10=HEAP8[r1];if(r10<<24>>24<1){break}else{r1=r1+1|0}}if(r10<<24>>24==0){break}else{r6=r6+1|0}}if(r4==1249){___assert_func(66432,187,68316,67572);r8=0;STACKTOP=r5;return r8}r4=_malloc(_strlen(r9)+1|0);if((r4|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r4,r9);r8=r4;STACKTOP=r5;return r8}function _edsf_merge(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r5=r1>>2;if((r2|0)<=-1){___assert_func(66236,110,68704,67504)}r6=HEAP32[(r2<<2>>2)+r5];do{if((r6&2|0)==0){r7=0;r8=r6;while(1){r9=r8&1^r7;r10=r8>>2;r11=HEAP32[(r10<<2>>2)+r5];if((r11&2|0)==0){r7=r9;r8=r11}else{break}}L1816:do{if((r10|0)==(r2|0)){r12=r9;r13=r2}else{r8=r10<<2;r7=r9;r11=r2;r14=r6;while(1){r15=r14>>2;r16=r14&1^r7;HEAP32[(r11<<2>>2)+r5]=r7|r8;if((r15|0)==(r10|0)){r12=r16;r13=r10;break L1816}r7=r16;r11=r15;r14=HEAP32[(r15<<2>>2)+r5]}}}while(0);if((r12|0)==0){r17=r9;r18=r13;break}___assert_func(66236,137,68704,67244);r17=r9;r18=r13}else{r17=0;r18=r2}}while(0);if((HEAP32[(r18<<2>>2)+r5]&2|0)==0){___assert_func(66236,152,68692,66700)}r2=r17^r4;if((r3|0)<=-1){___assert_func(66236,110,68704,67504)}r4=HEAP32[(r3<<2>>2)+r5];do{if((r4&2|0)==0){r17=0;r13=r4;while(1){r19=r13&1^r17;r20=r13>>2;r9=HEAP32[(r20<<2>>2)+r5];if((r9&2|0)==0){r17=r19;r13=r9}else{break}}L1834:do{if((r20|0)==(r3|0)){r21=r19;r22=r3}else{r13=r20<<2;r17=r19;r9=r3;r12=r4;while(1){r10=r12>>2;r6=r12&1^r17;HEAP32[(r9<<2>>2)+r5]=r17|r13;if((r10|0)==(r20|0)){r21=r6;r22=r20;break L1834}r17=r6;r9=r10;r12=HEAP32[(r10<<2>>2)+r5]}}}while(0);if((r21|0)==0){r23=r19;r24=r22;break}___assert_func(66236,137,68704,67244);r23=r19;r24=r22}else{r23=0;r24=r3}}while(0);if((HEAP32[(r24<<2>>2)+r5]&2|0)==0){___assert_func(66236,155,68692,66480)}r3=r23^r2;r22=(r2|0)==(r23|0);do{if((r18|0)==(r24|0)){if(r22){r25=r18;r26=r18;break}___assert_func(66236,161,68692,66388);r25=r18;r26=r18}else{if(!(r22|(r3|0)==1)){___assert_func(66236,163,68692,66336)}r19=(r18|0)>(r24|0);r21=r19?r18:r24;r20=r19?r24:r18;r19=(r21<<2)+r1|0;r4=(r20<<2)+r1|0;HEAP32[r4>>2]=HEAP32[r4>>2]+(HEAP32[r19>>2]&-4)|0;HEAP32[r19>>2]=r20<<2|(r2|0)!=(r23|0)&1;r25=r20;r26=r21}}while(0);if((r26|0)<=-1){___assert_func(66236,110,68704,67504)}r23=HEAP32[(r26<<2>>2)+r5];do{if((r23&2|0)==0){r2=0;r1=r23;while(1){r27=r1&1^r2;r28=r1>>2;r18=HEAP32[(r28<<2>>2)+r5];if((r18&2|0)==0){r2=r27;r1=r18}else{break}}L1860:do{if((r28|0)==(r26|0)){r29=r27;r30=r26}else{r1=r28<<2;r2=r27;r18=r26;r24=r23;while(1){r22=r24>>2;r21=r24&1^r2;HEAP32[(r18<<2>>2)+r5]=r2|r1;if((r22|0)==(r28|0)){r29=r21;r30=r28;break L1860}r2=r21;r18=r22;r24=HEAP32[(r22<<2>>2)+r5]}}}while(0);if((r29|0)==0){r31=r27;r32=r30;break}___assert_func(66236,137,68704,67244);r31=r27;r32=r30}else{r31=0;r32=r26}}while(0);if((r32|0)!=(r25|0)){___assert_func(66236,188,68692,66212)}if((r31|0)==(r3|0)){return}___assert_func(66236,189,68692,66076);return}function _dsf_size(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;if((r2|0)<=-1){___assert_func(66236,110,68704,67504)}r3=(r2<<2)+r1|0;r4=HEAP32[r3>>2];do{if((r4&2|0)==0){r5=0;r6=r4;while(1){r7=r6&1^r5;r8=r6>>2;r9=HEAP32[r1+(r8<<2)>>2];if((r9&2|0)==0){r5=r7;r6=r9}else{break}}L1883:do{if((r8|0)==(r2|0)){r10=r7;r11=r2}else{r6=r8<<2;r5=r4>>2;r9=r7^r4&1;HEAP32[r3>>2]=r7|r6;if((r5|0)==(r8|0)){r10=r9;r11=r8;break}else{r12=r5;r13=r9}while(1){r9=(r12<<2)+r1|0;r5=HEAP32[r9>>2];r14=r5>>2;r15=r13^r5&1;HEAP32[r9>>2]=r13|r6;if((r14|0)==(r8|0)){r10=r15;r11=r8;break L1883}else{r12=r14;r13=r15}}}}while(0);if((r10|0)==0){r16=r11;break}___assert_func(66236,137,68704,67244);r16=r11}else{r16=r2}}while(0);return HEAP32[r1+(r16<<2)>>2]>>2}function _init_game(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3,r5=r4>>2;r6=_midend_new(r1,65544,65892,r2);_frontend_set_game_info(r1,r6,67836,1,1,0,0,0,1,1);r7=_midend_num_presets(r6);HEAP32[r5]=r7;L1891:do{if((r7|0)>0){r8=r6+24|0;r9=r6+16|0;r10=r6+12|0;r11=0;while(1){if((HEAP32[r8>>2]|0)<=(r11|0)){___assert_func(66904,1056,68528,67532)}_frontend_add_preset(r1,HEAP32[HEAP32[r9>>2]+(r11<<2)>>2],HEAP32[HEAP32[r10>>2]+(r11<<2)>>2]);r12=r11+1|0;if((r12|0)<(HEAP32[r5]|0)){r11=r12}else{break L1891}}}}while(0);r1=_midend_colours(r6,r4)>>2;if((HEAP32[r5]|0)>0){r13=0}else{STACKTOP=r3;return}while(1){r4=r13*3&-1;_canvas_set_palette_entry(r2,r13,HEAPF32[(r4<<2>>2)+r1]*255&-1,HEAPF32[(r4+1<<2>>2)+r1]*255&-1,HEAPF32[(r4+2<<2>>2)+r1]*255&-1);r4=r13+1|0;if((r4|0)<(HEAP32[r5]|0)){r13=r4}else{break}}STACKTOP=r3;return}function _latin_solver_place(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r5=(r1|0)>>2;r6=HEAP32[r5];if((r6|0)<(r4|0)){___assert_func(65992,38,68636,67480);r7=HEAP32[r5]}else{r7=r6}r8=r4-1|0;r9=r8+Math.imul(Math.imul(r7,r2)+r3|0,r7)|0;r7=(r1+4|0)>>2;if(HEAP8[HEAP32[r7]+r9|0]<<24>>24==0){___assert_func(65992,39,68636,67084)}L1911:do{if((r6|0)>=1){r9=r6+1|0;r10=1;while(1){if((r10|0)!=(r4|0)){r11=HEAP32[r5];r12=r10-1+Math.imul(Math.imul(r11,r2)+r3|0,r11)|0;HEAP8[HEAP32[r7]+r12|0]=0}r12=r10+1|0;if((r12|0)==(r9|0)){break}else{r10=r12}}r10=(r6|0)>0;if(r10){r13=0}else{break}while(1){if((r13|0)!=(r3|0)){r9=HEAP32[r5];r12=r8+Math.imul(Math.imul(r9,r2)+r13|0,r9)|0;HEAP8[HEAP32[r7]+r12|0]=0}r12=r13+1|0;if((r12|0)==(r6|0)){break}else{r13=r12}}if(r10){r14=0}else{break}while(1){if((r14|0)!=(r2|0)){r12=HEAP32[r5];r9=r8+Math.imul(Math.imul(r12,r14)+r3|0,r12)|0;HEAP8[HEAP32[r7]+r9|0]=0}r9=r14+1|0;if((r9|0)==(r6|0)){break L1911}else{r14=r9}}}}while(0);r14=Math.imul(r6,r3);HEAP8[HEAP32[r1+8>>2]+r14+r2|0]=r4&255;r4=r8+Math.imul(r6,r2)|0;HEAP8[HEAP32[r1+16>>2]+r4|0]=1;HEAP8[HEAP32[r1+12>>2]+r8+r14|0]=1;return}function _latin_solver_set(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41;r6=0;r7=HEAP32[r1>>2];r8=HEAP32[r2>>2];r9=HEAP32[r2+4>>2];r10=HEAP32[r2+8>>2];r11=HEAP32[r2+12>>2];_memset(r9,1,r7);_memset(r10,1,r7);r2=(r7|0)>0;L1932:do{if(r2){r12=r1+4|0;r13=0;while(1){r14=Math.imul(r13,r4)+r3|0;r15=HEAP32[r12>>2];r16=0;r17=0;r18=-1;while(1){r19=r15+r14+Math.imul(r16,r5)|0;r20=HEAP8[r19]<<24>>24==0;r21=(r20&1^1)+r17|0;r22=r20?r18:r16;r20=r16+1|0;if((r20|0)==(r7|0)){break}else{r16=r20;r17=r21;r18=r22}}if((r21|0)==1){HEAP8[r10+r22|0]=0;HEAP8[r9+r13|0]=0}else if((r21|0)==0){r23=-1;r6=1389;break}r18=r13+1|0;if((r18|0)<(r7|0)){r13=r18}else{break}}if(r6==1389){return r23}if(r2){r24=0;r25=0}else{r26=0;r6=1357;break}while(1){if(HEAP8[r9+r25|0]<<24>>24==0){r27=r24}else{HEAP8[r9+r24|0]=r25&255;r27=r24+1|0}r13=r25+1|0;if((r13|0)==(r7|0)){break}else{r24=r27;r25=r13}}L1951:do{if(r2){r13=0;r12=0;while(1){if(HEAP8[r10+r12|0]<<24>>24==0){r28=r13}else{HEAP8[r10+r13|0]=r12&255;r28=r13+1|0}r18=r12+1|0;if((r18|0)==(r7|0)){r29=r28;break L1951}else{r13=r28;r12=r18}}}else{r29=0}}while(0);if((r27|0)!=(r29|0)){___assert_func(65992,197,68592,66604)}r12=(r27|0)>0;if(!r12){r26=r27;r6=1357;break}r13=r1+4|0;r18=0;while(1){r17=r9+r18|0;r16=Math.imul(r18,r7);r14=0;while(1){r15=(Math.imul(HEAPU8[r17],r4)+r3|0)+Math.imul(HEAPU8[r10+r14|0],r5)|0;HEAP8[r8+r14+r16|0]=HEAP8[HEAP32[r13>>2]+r15|0];r15=r14+1|0;if((r15|0)==(r27|0)){break}else{r14=r15}}r14=r18+1|0;if((r14|0)==(r27|0)){r30=r13;r31=r27;r32=r12;break L1932}else{r18=r14}}}else{r26=0;r6=1357}}while(0);if(r6==1357){r30=r1+4|0;r31=r26;r32=0}_memset(r11,0,r31);r26=r31-1|0;r1=0;L1970:while(1){do{if((r1|0)>1&(r1|0)<(r26|0)){L1974:do{if(r32){r27=0;r29=0;while(1){r28=Math.imul(r27,r7);r2=0;while(1){if(HEAP8[r11+r2|0]<<24>>24!=0){if(HEAP8[r8+r2+r28|0]<<24>>24!=0){r33=0;break}}r25=r2+1|0;if((r25|0)<(r31|0)){r2=r25}else{r33=1;break}}r2=r33+r29|0;r28=r27+1|0;if((r28|0)==(r31|0)){r34=r2;break L1974}else{r27=r28;r29=r2}}}else{r34=0}}while(0);r29=r31-r1|0;if((r34|0)>(r29|0)){r23=-1;r6=1391;break L1970}if((r34|0)<(r29|0)){r6=1384;break}if(r32){r35=0;r36=0}else{r23=0;r6=1392;break L1970}while(1){r29=Math.imul(r35,r7);r27=0;while(1){if(HEAP8[r11+r27|0]<<24>>24!=0){if(HEAP8[r8+r27+r29|0]<<24>>24!=0){r6=1377;break}}r2=r27+1|0;if((r2|0)<(r31|0)){r27=r2}else{r37=r36;break}}L1993:do{if(r6==1377){r6=0;r27=r9+r35|0;r2=0;r28=r36;while(1){do{if(HEAP8[r11+r2|0]<<24>>24==0){if(HEAP8[r8+r2+r29|0]<<24>>24==0){r38=r28;break}r25=(Math.imul(HEAPU8[r27],r4)+r3|0)+Math.imul(HEAPU8[r10+r2|0],r5)|0;HEAP8[HEAP32[r30>>2]+r25|0]=0;r38=1}else{r38=r28}}while(0);r25=r2+1|0;if((r25|0)==(r31|0)){r37=r38;break L1993}else{r2=r25;r28=r38}}}}while(0);r29=r35+1|0;if((r29|0)==(r31|0)){break}else{r35=r29;r36=r37}}r29=(r37|0)!=0;if(r29|r32^1){r23=r29&1;r6=1393;break L1970}else{r39=r1;r40=r31;break}}else{r6=1384}}while(0);do{if(r6==1384){r6=0;if(r32){r39=r1;r40=r31;break}else{r23=0;r6=1394;break L1970}}}while(0);while(1){r29=r40-1|0;r41=r11+r29|0;if(HEAP8[r41]<<24>>24==0){break}HEAP8[r41]=0;if((r29|0)>0){r39=r39-1|0;r40=r29}else{r23=0;r6=1390;break L1970}}HEAP8[r41]=1;r1=r39+1|0}if(r6==1392){return r23}else if(r6==1393){return r23}else if(r6==1394){return r23}else if(r6==1390){return r23}else if(r6==1391){return r23}}function _print_mono_colour(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=STACKTOP;r4=r2|0;r2=(r1+12|0)>>2;r5=HEAP32[r2];r6=r1+16|0;do{if((r5|0)<(HEAP32[r6>>2]|0)){r7=r5;r8=HEAP32[r1+8>>2]}else{r9=r5+16|0;HEAP32[r6>>2]=r9;r10=r1+8|0;r11=HEAP32[r10>>2];r12=r9*24&-1;if((r11|0)==0){r13=_malloc(r12)}else{r13=_realloc(r11,r12)}if((r13|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r12=r13;HEAP32[r10>>2]=r12;r7=HEAP32[r2];r8=r12;break}}}while(0);r13=(r1+8|0)>>2;HEAP32[r8+(r7*24&-1)>>2]=-1;HEAP32[HEAP32[r13]+(HEAP32[r2]*24&-1)+4>>2]=0;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+8>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+12>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+16>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+20>>2]=r4;r4=HEAP32[r2];HEAP32[r2]=r4+1|0;STACKTOP=r3;return r4}function _fatal(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3;_fwrite(66e3,13,1,HEAP32[_stderr>>2]);HEAP32[r4>>2]=r2;_fprintf(HEAP32[_stderr>>2],r1,HEAP32[r4>>2]);_fputc(10,HEAP32[_stderr>>2]);_exit(1)}function _canvas_text_fallback(r1,r2,r3){r3=STACKTOP;r1=HEAP32[r2>>2];r2=_malloc(_strlen(r1)+1|0);if((r2|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r2,r1);STACKTOP=r3;return r2}}function _latin_solver_forcing(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49;r3=0;r4=(r1|0)>>2;r5=HEAP32[r4];r6=HEAP32[r2+20>>2]>>2;r7=HEAP32[r2>>2];r8=HEAP32[r2+16>>2]>>2;if((r5|0)<=0){r9=0;return r9}r2=(r1+4|0)>>2;r1=r5+1|0;r10=r1&255;r11=Math.imul(r5,r5);r12=0;L2036:while(1){r13=Math.imul(r12,r5);r14=0;while(1){r15=HEAP32[r4];r16=Math.imul(Math.imul(r15,r14)+r12|0,r15);r15=HEAP32[r2];r17=0;r18=0;r19=1;while(1){if(HEAP8[r15+(r19-1)+r16|0]<<24>>24==0){r20=r18;r21=r17}else{r20=r19+r18|0;r21=r17+1|0}r22=r19+1|0;if((r22|0)==(r1|0)){break}else{r17=r21;r18=r20;r19=r22}}L2046:do{if((r21|0)==2){r19=r14+r13|0;r18=r7+r19|0;r17=1;while(1){r16=HEAP32[r4];r23=r17-1|0;r15=r23+Math.imul(Math.imul(r16,r14)+r12|0,r16)|0;L2050:do{if(HEAP8[HEAP32[r2]+r15|0]<<24>>24!=0){_memset(r7,r10,r11);HEAP32[r6]=r19;HEAP8[r18]=r20-r17&255;r16=0;r22=1;while(1){r24=r16+1|0;r25=HEAP32[(r16<<2>>2)+r6];r26=(r25|0)/(r5|0)&-1;r27=(r25|0)%(r5|0);r25=Math.imul(r26,r5);r28=HEAPU8[r7+r25+r27|0];r29=0;while(1){r30=Math.imul(r29,r5)+r27|0;r31=r29+1|0;HEAP32[(r29<<2>>2)+r8]=r30;if((r31|0)==(r5|0)){r32=r5;r33=0;break}else{r29=r31}}while(1){HEAP32[(r32<<2>>2)+r8]=r33+r25|0;r29=r33+1|0;if((r29|0)==(r5|0)){break}else{r32=r32+1|0;r33=r29}}r25=r5<<1;L2059:do{if((r25|0)>0){r29=r28-1|0;r31=(r28|0)==(r17|0);r30=r22;r34=0;while(1){r35=HEAP32[(r34<<2>>2)+r8];r36=(r35|0)%(r5|0);r37=(r35|0)/(r5|0)&-1;r35=Math.imul(r37,r5)+r36|0;r38=r7+r35|0;do{if((HEAPU8[r38]|0)>(r5|0)){r39=HEAP32[r4];r40=Math.imul(Math.imul(r39,r36)+r37|0,r39);r39=HEAP32[r2];if(HEAP8[r39+r29+r40|0]<<24>>24==0){r41=r30;break}if((r36|0)==(r27|0)&(r37|0)==(r26|0)){r41=r30;break}else{r42=0;r43=0;r44=1}while(1){if(HEAP8[r39+(r44-1)+r40|0]<<24>>24==0){r45=r43;r46=r42}else{r45=r44+r43|0;r46=r42+1|0}r47=r44+1|0;if((r47|0)==(r1|0)){break}else{r42=r46;r43=r45;r44=r47}}if((r46|0)==2){HEAP32[(r30<<2>>2)+r6]=r35;HEAP8[r38]=r45-r28&255;r48=r30+1|0}else{r48=r30}if(!r31){r41=r48;break}if((r36|0)==(r14|0)|(r37|0)==(r12|0)){break L2036}else{r41=r48}}else{r41=r30}}while(0);r38=r34+1|0;if((r38|0)<(r25|0)){r30=r41;r34=r38}else{r49=r41;break L2059}}}else{r49=r22}}while(0);if((r24|0)<(r49|0)){r16=r24;r22=r49}else{break L2050}}}}while(0);r15=r17+1|0;if((r15|0)>(r5|0)){break L2046}else{r17=r15}}}}while(0);r17=r14+1|0;if((r17|0)<(r5|0)){r14=r17}else{break}}r14=r12+1|0;if((r14|0)<(r5|0)){r12=r14}else{r9=0;r3=1442;break}}if(r3==1442){return r9}r3=HEAP32[r4];r4=r23+Math.imul(Math.imul(r3,r36)+r37|0,r3)|0;HEAP8[HEAP32[r2]+r4|0]=0;r9=1;return r9}function _latin_solver_free_scratch(r1){var r2,r3;r2=r1>>2;r3=HEAP32[r2+5];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+4];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+3];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+2];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+1];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2];if((r3|0)!=0){_free(r3)}if((r1|0)==0){return}_free(r1);return}function _latin_solver_diff_simple(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37;r2=0;r3=(r1|0)>>2;r4=HEAP32[r3];r5=(r4|0)>0;if(!r5){r6=0;return r6}r7=r1+12|0;r8=Math.imul(r4,r4);r9=r1+4|0;r10=r1+8|0;r11=0;L2112:while(1){r12=Math.imul(r11,r4)-1|0;r13=1;while(1){do{if(HEAP8[HEAP32[r7>>2]+r12+r13|0]<<24>>24==0){r14=HEAP32[r3];if((r14|0)<=0){r6=-1;r2=1515;break L2112}r15=Math.imul(r14,r11);r16=HEAP32[r9>>2];r17=r13-1+r15|0;r15=0;r18=0;r19=-1;while(1){r20=r17+Math.imul(r8,r18)|0;r21=HEAP8[r16+r20|0]<<24>>24==0;r22=(r21&1^1)+r15|0;r23=r21?r19:r20;r20=r18+1|0;if((r20|0)==(r14|0)){break}else{r15=r22;r18=r20;r19=r23}}if((r22|0)==0){r6=-1;r2=1512;break L2112}else if((r22|0)!=1){break}if((r23|0)<=-1){___assert_func(65992,100,68656,66652)}r19=(r23|0)/(r14|0)&-1;r24=(r19|0)/(r14|0)&-1;r25=(r19|0)%(r14|0);r19=Math.imul(r25,r14)+r24|0;if(HEAP8[HEAP32[r10>>2]+r19|0]<<24>>24==0){r2=1474;break L2112}}}while(0);r19=r13+1|0;if((r19|0)>(r4|0)){break}else{r13=r19}}r13=r11+1|0;if((r13|0)<(r4|0)){r11=r13}else{r2=1464;break}}if(r2==1464){if(!r5){r6=0;return r6}r11=r1+16|0;r10=r1+4|0;r22=r1+8|0;r8=0;L2133:while(1){r9=Math.imul(r8,r4)-1|0;r7=1;while(1){do{if(HEAP8[HEAP32[r11>>2]+r9+r7|0]<<24>>24==0){r26=HEAP32[r3];if((r26|0)<=0){r6=-1;r2=1510;break L2133}r13=Math.imul(Math.imul(r26,r8),r26);r12=HEAP32[r10>>2];r19=r7-1+r13|0;r13=0;r18=0;r15=-1;while(1){r16=r19+Math.imul(r18,r4)|0;r17=HEAP8[r12+r16|0]<<24>>24==0;r27=(r17&1^1)+r13|0;r28=r17?r15:r16;r16=r18+1|0;if((r16|0)==(r26|0)){break}else{r13=r27;r18=r16;r15=r28}}if((r27|0)==0){r6=-1;r2=1506;break L2133}else if((r27|0)!=1){break}if((r28|0)<=-1){___assert_func(65992,100,68656,66652)}r15=(r28|0)/(r26|0)&-1;r29=(r15|0)/(r26|0)&-1;r30=(r15|0)%(r26|0);r15=Math.imul(r30,r26)+r29|0;if(HEAP8[HEAP32[r22>>2]+r15|0]<<24>>24==0){r2=1488;break L2133}}}while(0);r15=r7+1|0;if((r15|0)>(r4|0)){break}else{r7=r15}}r7=r8+1|0;if((r7|0)<(r4|0)){r8=r7}else{r2=1478;break}}if(r2==1488){_latin_solver_place(r1,r29,r30,(r28|0)%(r26|0)+1|0);r6=1;return r6}else if(r2==1478){if(!r5){r6=0;return r6}r5=r1+8|0;r26=r1+4|0;r28=0;L2156:while(1){r30=0;r29=HEAP32[r5>>2];while(1){r8=r29+Math.imul(r30,r4)+r28|0;do{if(HEAP8[r8]<<24>>24==0){r31=HEAP32[r3];r22=Math.imul(Math.imul(r31,r28)+r30|0,r31);if((r31|0)<=0){r6=-1;r2=1513;break L2156}r27=HEAP32[r26>>2];r10=0;r11=0;r7=-1;while(1){r9=r11+r22|0;r15=HEAP8[r27+r9|0]<<24>>24==0;r32=(r15&1^1)+r10|0;r33=r15?r7:r9;r9=r11+1|0;if((r9|0)==(r31|0)){break}else{r10=r32;r11=r9;r7=r33}}if((r32|0)==0){r6=-1;r2=1509;break L2156}else if((r32|0)!=1){r34=r29;break}if((r33|0)>-1){r35=r29}else{___assert_func(65992,100,68656,66652);r35=HEAP32[r5>>2]}r7=(r33|0)/(r31|0)&-1;r36=(r7|0)/(r31|0)&-1;r37=(r7|0)%(r31|0);r7=r35+Math.imul(r37,r31)+r36|0;if(HEAP8[r7]<<24>>24==0){r2=1500;break L2156}else{r34=r35}}else{r34=r29}}while(0);r8=r30+1|0;if((r8|0)<(r4|0)){r30=r8;r29=r34}else{break}}r29=r28+1|0;if((r29|0)<(r4|0)){r28=r29}else{r6=0;r2=1516;break}}if(r2==1509){return r6}else if(r2==1500){_latin_solver_place(r1,r36,r37,(r33|0)%(r31|0)+1|0);r6=1;return r6}else if(r2==1513){return r6}else if(r2==1516){return r6}}else if(r2==1510){return r6}else if(r2==1506){return r6}}else if(r2==1474){_latin_solver_place(r1,r24,r25,(r23|0)%(r14|0)+1|0);r6=1;return r6}else if(r2==1512){return r6}else if(r2==1515){return r6}}function _latin_solver_new_scratch(r1){var r2,r3,r4,r5,r6;r2=STACKTOP;r3=_malloc(24),r4=r3>>2;if((r3|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r5=HEAP32[r1>>2];r1=Math.imul(r5,r5);r6=_malloc(r1);if((r6|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4]=r6;r6=_malloc(r5);if((r6|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4+1]=r6;r6=_malloc(r5);if((r6|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4+2]=r6;r6=_malloc(r5);if((r6|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4+3]=r6;r6=_malloc(r5*12&-1);if((r6|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4+4]=r6;r6=_malloc(r1<<2);if((r6|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r4+5]=r6;STACKTOP=r2;return r3}}function _latin_solver_alloc(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=STACKTOP;HEAP32[r1>>2]=r3;r5=Math.imul(r3,r3);r6=Math.imul(r5,r3);r7=_malloc(r6);if((r7|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r1+4>>2]=r7;HEAP32[r1+8>>2]=r2;_memset(r7,1,r6);r6=_malloc(r5);if((r6|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r7=r1+12|0;HEAP32[r7>>2]=r6;r6=_malloc(r5);if((r6|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r8=r1+16|0;HEAP32[r8>>2]=r6;_memset(HEAP32[r7>>2],0,r5);_memset(HEAP32[r8>>2],0,r5);if((r3|0)>0){r9=0}else{STACKTOP=r4;return}while(1){r5=0;while(1){r8=r2+Math.imul(r5,r3)+r9|0;r7=HEAP8[r8];if(r7<<24>>24!=0){_latin_solver_place(r1,r9,r5,r7&255)}r7=r5+1|0;if((r7|0)==(r3|0)){break}else{r5=r7}}r5=r9+1|0;if((r5|0)==(r3|0)){break}else{r9=r5}}STACKTOP=r4;return}function _latin_solver_top(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11){var r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44;r12=0;r13=STACKTOP;STACKTOP=STACKTOP+20|0;r14=r13;r15=_latin_solver_new_scratch(r1);if((r2|0)>(r7|0)){___assert_func(65992,888,68572,66036)}r16=(r1|0)>>2;r17=r3;L2231:while(1){r18=0;while(1){if((r18|0)>(r2|0)){break L2231}r19=HEAP32[r8+(r18<<2)>>2];if((r19|0)==0){r20=0}else{r20=FUNCTION_TABLE[r19](r1,r9)}if((r20|0)==0&(r18|0)==(r3|0)){r21=_latin_solver_diff_simple(r1)}else{r21=r20}L2242:do{if((r21|0)==0&(r18|0)==(r4|0)){r19=HEAP32[r16];r22=Math.imul(r19,r19);r23=0;while(1){if((r23|0)>=(r19|0)){r24=0;break}r25=_latin_solver_set(r1,r15,Math.imul(HEAP32[r16],r23),r22,1);if((r25|0)==0){r23=r23+1|0}else{r26=r25;break L2242}}while(1){if((r24|0)>=(r19|0)){r27=0;r12=1562;break L2242}r23=HEAP32[r16];r22=_latin_solver_set(r1,r15,Math.imul(Math.imul(r23,r24),r23),r19,1);if((r22|0)==0){r24=r24+1|0}else{r26=r22;break L2242}}}else{r27=r21;r12=1562}}while(0);L2250:do{if(r12==1562){r12=0;L2252:do{if((r27|0)==0&(r18|0)==(r5|0)){r19=HEAP32[r16];r22=Math.imul(r19,r19);r23=1;while(1){if((r23|0)>(r19|0)){r28=0;break L2252}r25=_latin_solver_set(r1,r15,r23-1|0,r22,r19);if((r25|0)==0){r23=r23+1|0}else{r26=r25;break L2250}}}else{r28=r27}}while(0);if(!((r28|0)==0&(r18|0)==(r6|0))){r26=r28;break}r26=_latin_solver_forcing(r1,r15)}}while(0);if((r26|0)<0){r29=10;r12=1629;break L2231}if((r26|0)>0){break}else{r18=r18+1|0}}r17=(r17|0)>(r18|0)?r17:r18}if(r12==1629){_latin_solver_free_scratch(r15);STACKTOP=r13;return r29}if((r2|0)!=(r7|0)){r7=HEAP32[r16];if((r7|0)<=0){r29=r17;_latin_solver_free_scratch(r15);STACKTOP=r13;return r29}r26=r1+8|0;r28=r17;r27=0;while(1){r21=Math.imul(r27,r7);r24=HEAP32[r26>>2];r20=r28;r23=0;while(1){r30=HEAP8[r24+r23+r21|0]<<24>>24==0?12:r20;r19=r23+1|0;if((r19|0)==(r7|0)){break}else{r20=r30;r23=r19}}r23=r27+1|0;if((r23|0)==(r7|0)){r29=r30;break}else{r28=r30;r27=r23}}_latin_solver_free_scratch(r15);STACKTOP=r13;return r29}r27=HEAP32[r16];do{if((r27|0)>0){r30=r27+1|0;r28=r1+8|0;r7=r1+4|0;r26=0;r23=r30;r20=-1;while(1){r21=Math.imul(r26,r27);r24=0;r18=r23;r19=r20;while(1){r22=r24+r21|0;if(HEAP8[HEAP32[r28>>2]+r22|0]<<24>>24==0){r25=HEAP32[r16];r31=Math.imul(Math.imul(r25,r24)+r26|0,r25);r25=HEAP32[r7>>2];r32=1;r33=0;while(1){r34=(HEAP8[r25+(r32-1)+r31|0]<<24>>24!=0&1)+r33|0;r35=r32+1|0;if((r35|0)==(r30|0)){break}else{r32=r35;r33=r34}}if((r34|0)<=1){___assert_func(65992,744,68612,67808)}r33=(r34|0)<(r18|0);r36=r33?r22:r19;r37=r33?r34:r18}else{r36=r19;r37=r18}r33=r24+1|0;if((r33|0)==(r27|0)){break}else{r24=r33;r18=r37;r19=r36}}r19=r26+1|0;if((r19|0)==(r27|0)){break}else{r26=r19;r23=r37;r20=r36}}if((r36|0)==-1){r38=r17;break}r20=(r36|0)/(r27|0)&-1;r23=(r36|0)%(r27|0);r26=_malloc(r27);if((r26|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r30=Math.imul(r27,r27);r7=_malloc(r30);if((r7|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r28=_malloc(r30);if((r28|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r19=r1+8|0;_memcpy(r7,HEAP32[r19>>2],r30);L2304:do{if((r27|0)<1){r39=0}else{r18=r1+4|0;r24=r27+1|0;r21=1;r33=0;while(1){r32=HEAP32[r16];r31=r21-1+Math.imul(Math.imul(r32,r23)+r20|0,r32)|0;if(HEAP8[HEAP32[r18>>2]+r31|0]<<24>>24==0){r40=r33}else{HEAP8[r26+r33|0]=r21&255;r40=r33+1|0}r31=r21+1|0;if((r31|0)==(r24|0)){r39=r40;break L2304}else{r21=r31;r33=r40}}}}while(0);r33=r28+Math.imul(r20,r27)+r23|0;r21=(r10|0)!=0;r24=r14+4|0;r18=r14+12|0;r31=r14+16|0;r32=10;r25=0;while(1){if((r25|0)>=(r39|0)){break}_memcpy(r28,r7,r30);HEAP8[r33]=HEAP8[r26+r25|0];if(r21){r41=FUNCTION_TABLE[r10](r9)}else{r41=r9}_latin_solver_alloc(r14,r28,r27);r35=_latin_solver_top(r14,r2,r3,r4,r5,r6,r2,r8,r41,r10,r11);r42=HEAP32[r24>>2];if((r42|0)!=0){_free(r42)}r42=HEAP32[r18>>2];if((r42|0)!=0){_free(r42)}r42=HEAP32[r31>>2];if((r42|0)!=0){_free(r42)}if(r21){FUNCTION_TABLE[r11](r41)}if((r35|0)==12){___assert_func(65992,835,68612,67768)}r42=(r32|0)==10;r43=(r35|0)==10;if(!(r43|r42^1)){_memcpy(HEAP32[r19>>2],r28,r30)}if((r35|0)==11){r12=1615;break}if(r43){r44=r32}else{r44=r42?r2:11}if((r44|0)==11){r12=1615;break}else{r32=r44;r25=r25+1|0}}if(r12==1615){_free(r28);_free(r7);_free(r26);r38=11;break}_free(r28);_free(r7);_free(r26);if((r32|0)==10){r29=10;_latin_solver_free_scratch(r15);STACKTOP=r13;return r29}else if((r32|0)==11){r38=11;break}if((r32|0)==(r2|0)){r29=r2;_latin_solver_free_scratch(r15);STACKTOP=r13;return r29}___assert_func(65992,873,68612,67688);r29=r2;_latin_solver_free_scratch(r15);STACKTOP=r13;return r29}else{r38=r17}}while(0);r29=r38;_latin_solver_free_scratch(r15);STACKTOP=r13;return r29}function _latin_generate(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r3=0;r4=STACKTOP;r5=Math.imul(r1,r1);r6=_malloc(r5);if((r6|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r7=_malloc(r1);if((r7|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r8=_malloc(r1);if((r8|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r9=_malloc(r1);if((r9|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=_malloc(r1);if((r10|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r11=(r1|0)>0;L2368:do{if(r11){r12=0;while(1){HEAP8[r7+r12|0]=r12&255;r13=r12+1|0;if((r13|0)==(r1|0)){r14=r1;break L2368}else{r12=r13}}}else{r14=0}}while(0);_shuffle(r7,r14,1,r2);r14=r1<<1;r12=r14+2|0;r13=_malloc(r12<<4);if((r13|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r15=r5+r14|0;r16=r15<<2;r17=_malloc(r16);if((r17|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r18=r17;r19=_malloc(r15<<3);if((r19|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r20=r19,r21=r20>>2;r22=_malloc(r16);if((r22|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r23=r22,r24=r23>>2;r25=_malloc(r16);if((r25|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r16=r25;do{if(r11){r26=0;r27=0;while(1){r28=0;r29=r27;while(1){r30=r29<<1;HEAP32[(r30<<2>>2)+r21]=r26;HEAP32[((r30|1)<<2>>2)+r21]=r28+r1|0;r30=r28+1|0;if((r30|0)==(r1|0)){break}else{r28=r30;r29=r29+1|0}}r31=r27+r1|0;r29=r26+1|0;if((r29|0)==(r1|0)){break}else{r26=r29;r27=r31}}if(!r11){r32=r31;break}r27=r14|1;r26=0;r29=r31;while(1){r28=r29<<1;HEAP32[(r28<<2>>2)+r21]=r26+r1|0;HEAP32[((r28|1)<<2>>2)+r21]=r27;HEAP32[(r29<<2>>2)+r24]=1;r28=r26+1|0;if((r28|0)==(r1|0)){break}else{r26=r28;r29=r29+1|0}}r29=r31+r1|0;if(r11){r33=0;r34=r29}else{r32=r29;break}while(1){r26=r34<<1;HEAP32[(r26<<2>>2)+r21]=r14;HEAP32[((r26|1)<<2>>2)+r21]=r33;HEAP32[(r34<<2>>2)+r24]=1;r26=r33+1|0;if((r26|0)==(r1|0)){break}else{r33=r26;r34=r34+1|0}}r32=r29+r1|0}else{r32=0}}while(0);if((r32|0)!=(r15|0)){___assert_func(65992,1166,68676,66416)}_maxflow_setup_backedges(r32,r20,r18);if(!r11){_free(r25);_free(r22);_free(r19);_free(r17);_free(r13);_free(r9);_free(r10);_free(r8);_free(r7);STACKTOP=r4;return r6}r11=(r5|0)==0;r15=r14|1;r34=0;while(1){r33=0;while(1){r21=r33&255;HEAP8[r10+r33|0]=r21;HEAP8[r8+r33|0]=r21;r21=r33+1|0;if((r21|0)==(r1|0)){break}else{r33=r21}}_shuffle(r8,r1,1,r2);_shuffle(r10,r1,1,r2);r33=0;while(1){HEAP8[r9+HEAPU8[r10+r33|0]|0]=r33&255;r29=r33+1|0;if((r29|0)==(r1|0)){break}else{r33=r29}}L2416:do{if(!r11){r33=0;while(1){HEAP32[(r33<<2>>2)+r24]=1;r29=r33+1|0;if((r29|0)<(r5|0)){r33=r29}else{break L2416}}}}while(0);L2420:do{if((r34|0)>0){r33=0;while(1){r29=r7+r33|0;r21=0;while(1){r31=Math.imul(HEAPU8[r29],r1);r26=(HEAPU8[r10+(HEAPU8[r6+r31+HEAPU8[r8+r21|0]|0]-1)|0]+Math.imul(r21,r1)<<2)+r23|0;HEAP32[r26>>2]=0;r26=r21+1|0;if((r26|0)==(r1|0)){break}else{r21=r26}}r21=r33+1|0;if((r21|0)==(r34|0)){break L2420}else{r33=r21}}}}while(0);if((_maxflow_with_scratch(r13,r12,r14,r15,r32,r20,r18,r23,r16,0)|0)!=(r1|0)){___assert_func(65992,1204,68676,66372)}r33=r7+r34|0;r21=0;while(1){r29=Math.imul(r21,r1);r26=0;while(1){if((r26|0)>=(r1|0)){r3=1685;break}if((HEAP32[r16+(r26+r29<<2)>>2]|0)==0){r26=r26+1|0}else{break}}if(r3==1685){r3=0;___assert_func(65992,1215,68676,66260)}r29=HEAP8[r9+r26|0]+1&255;r31=Math.imul(HEAPU8[r33],r1);HEAP8[r6+r31+HEAPU8[r8+r21|0]|0]=r29;r29=r21+1|0;if((r29|0)==(r1|0)){break}else{r21=r29}}r21=r34+1|0;if((r21|0)==(r1|0)){break}else{r34=r21}}_free(r25);_free(r22);_free(r19);_free(r17);_free(r13);_free(r9);_free(r10);_free(r8);_free(r7);STACKTOP=r4;return r6}function _maxflow_setup_backedges(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28;r4=r2>>2;r2=0;r5=(r1|0)>0;if(r5){r6=0}else{return}while(1){HEAP32[r3+(r6<<2)>>2]=r6;r7=r6+1|0;if((r7|0)==(r1|0)){break}else{r6=r7}}if(r5){r8=0}else{return}while(1){r5=r8+1|0;L2450:do{if((r8|0)>0){r6=r8;while(1){r7=r6-1|0;r9=(r7|0)/2&-1;r10=(r9<<2)+r3|0;r11=HEAP32[r10>>2];r12=r11<<1;r13=HEAP32[((r12|1)<<2>>2)+r4];r14=(r6<<2)+r3|0;r15=HEAP32[r14>>2];r16=r15<<1;r17=HEAP32[((r16|1)<<2>>2)+r4];if((r13|0)>=(r17|0)){if((r13|0)!=(r17|0)){break L2450}if((HEAP32[(r12<<2>>2)+r4]|0)>=(HEAP32[(r16<<2>>2)+r4]|0)){break L2450}}HEAP32[r10>>2]=r15;HEAP32[r14>>2]=r11;if((r7|0)>1){r6=r9}else{break L2450}}}}while(0);if((r5|0)==(r1|0)){break}else{r8=r5}}if((r1|0)>0){r18=r1}else{return}while(1){r1=r18-1|0;r8=HEAP32[r3>>2];r6=(r1<<2)+r3|0;HEAP32[r3>>2]=HEAP32[r6>>2];HEAP32[r6>>2]=r8;L2463:do{if((r1|0)>1){r8=0;r6=1;r9=2;while(1){r19=((r8<<2)+r3|0)>>2;r20=HEAP32[r19];r21=r20<<1;r22=HEAP32[((r21|1)<<2>>2)+r4];r23=((r6<<2)+r3|0)>>2;r24=HEAP32[r23];r25=r24<<1;r26=HEAP32[((r25|1)<<2>>2)+r4];r27=(r22|0)<(r26|0);if((r9|0)>=(r1|0)){break}do{if(!r27){if((r22|0)==(r26|0)){if((HEAP32[(r21<<2>>2)+r4]|0)<(HEAP32[(r25<<2>>2)+r4]|0)){break}}r7=HEAP32[r3+(r9<<2)>>2]<<1;r11=HEAP32[((r7|1)<<2>>2)+r4];if((r22|0)<(r11|0)){break}if((r22|0)!=(r11|0)){break L2463}if((HEAP32[(r21<<2>>2)+r4]|0)>=(HEAP32[(r7<<2>>2)+r4]|0)){break L2463}}}while(0);r7=(r9<<2)+r3|0;r11=HEAP32[r7>>2];r14=r11<<1;r15=HEAP32[((r14|1)<<2>>2)+r4];do{if((r26|0)<(r15|0)){r2=1717}else{if((r26|0)==(r15|0)){if((HEAP32[(r25<<2>>2)+r4]|0)<(HEAP32[(r14<<2>>2)+r4]|0)){r2=1717;break}}HEAP32[r19]=r24;HEAP32[r23]=r20;r28=r6;break}}while(0);if(r2==1717){r2=0;HEAP32[r19]=r11;HEAP32[r7>>2]=r20;r28=r9}r14=r28<<1;r15=r14|1;if((r15|0)<(r1|0)){r8=r28;r6=r15;r9=r14+2|0}else{break L2463}}if(!r27){if((r22|0)!=(r26|0)){break}if((HEAP32[(r21<<2>>2)+r4]|0)>=(HEAP32[(r25<<2>>2)+r4]|0)){break}}HEAP32[r19]=r24;HEAP32[r23]=r20}}while(0);if((r1|0)>0){r18=r1}else{break}}return}function _maxflow_with_scratch(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43;r11=r9>>2;r12=r6>>2;r13=0;r14=r1,r15=r14>>2;r16=r9;r17=r2<<1;r18=r2*3&-1;r19=(r5|0)>0;L2491:do{if(r19){r20=0;r21=0;while(1){r22=(r20<<3)+r6|0;L2494:do{if((r21|0)>(HEAP32[r22>>2]|0)){r23=r21}else{r24=r21;while(1){r25=r24+1|0;HEAP32[(r24+r17<<2>>2)+r15]=r20;if((r25|0)>(HEAP32[r22>>2]|0)){r23=r25;break L2494}else{r24=r25}}}}while(0);r22=r20+1|0;if((r22|0)==(r5|0)){r26=r23;break L2491}else{r20=r22;r21=r23}}}else{r26=0}}while(0);L2499:do{if((r26|0)<(r2|0)){r23=r26;while(1){r6=r23+1|0;HEAP32[(r23+r17<<2>>2)+r15]=r5;if((r6|0)==(r2|0)){break L2499}else{r23=r6}}}else{if((r26|0)==(r2|0)){break}___assert_func(67676,42,68548,67744)}}while(0);L2505:do{if(r19){r26=0;r23=0;while(1){r6=(r26<<2)+r7|0;L2508:do{if((r23|0)>(HEAP32[((HEAP32[r6>>2]<<1|1)<<2>>2)+r12]|0)){r27=r23}else{r21=r23;while(1){r20=r21+1|0;HEAP32[(r21+r18<<2>>2)+r15]=r26;if((r20|0)>(HEAP32[((HEAP32[r6>>2]<<1|1)<<2>>2)+r12]|0)){r27=r20;break L2508}else{r21=r20}}}}while(0);r6=r26+1|0;if((r6|0)==(r5|0)){r28=r27;break L2505}else{r26=r6;r23=r27}}}else{r28=0}}while(0);L2513:do{if((r28|0)<(r2|0)){r27=r28;while(1){r23=r27+1|0;HEAP32[(r27+r18<<2>>2)+r15]=r5;if((r23|0)==(r2|0)){break L2513}else{r27=r23}}}else{if((r28|0)==(r2|0)){break}___assert_func(67676,54,68548,67744)}}while(0);if(r19){_memset(r16,0,r5<<2)}r16=(r2|0)>0;r19=(r4+r2<<2)+r14|0;r28=(r4|0)==(r3|0);r27=r2<<2;r23=r1+r27|0;r1=0;L2522:while(1){if(r16){_memset(r23,-1,r27)}HEAP32[r15]=r3;r26=0;r6=1;while(1){if((HEAP32[r19>>2]|0)>=1){r29=-1;r30=r4;break}r21=r26+1|0;r20=HEAP32[(r26<<2>>2)+r15];r22=HEAP32[(r20+r17<<2>>2)+r15];L2530:do{if((r22|0)<(r5|0)){r24=r22;r25=r6;while(1){r31=r24<<1;if((HEAP32[(r31<<2>>2)+r12]|0)!=(r20|0)){r32=r25;break L2530}r33=HEAP32[((r31|1)<<2>>2)+r12];do{if((r33|0)==(r3|0)){r34=r25}else{r35=(r33+r2<<2)+r14|0;if((HEAP32[r35>>2]|0)>-1){r34=r25;break}r36=HEAP32[r8+(r24<<2)>>2];if((r36|0)>-1){if((HEAP32[(r24<<2>>2)+r11]|0)>=(r36|0)){r34=r25;break}}HEAP32[r35>>2]=r31;HEAP32[(r25<<2>>2)+r15]=r33;r34=r25+1|0}}while(0);r33=r24+1|0;if((r33|0)<(r5|0)){r24=r33;r25=r34}else{r32=r34;break L2530}}}else{r32=r6}}while(0);r22=HEAP32[(r20+r18<<2>>2)+r15];L2542:do{if((r22|0)<(r5|0)){r25=r22;r24=r32;while(1){r33=HEAP32[r7+(r25<<2)>>2];r31=r33<<1;r35=r31|1;if((HEAP32[(r35<<2>>2)+r12]|0)!=(r20|0)){r37=r24;break L2542}r36=HEAP32[(r31<<2>>2)+r12];do{if((r36|0)==(r3|0)){r38=r24}else{r31=(r36+r2<<2)+r14|0;if((HEAP32[r31>>2]|0)>-1){r38=r24;break}if((HEAP32[(r33<<2>>2)+r11]|0)<1){r38=r24;break}HEAP32[r31>>2]=r35;HEAP32[(r24<<2>>2)+r15]=r36;r38=r24+1|0}}while(0);r36=r25+1|0;if((r36|0)<(r5|0)){r25=r36;r24=r38}else{r37=r38;break L2542}}}else{r37=r32}}while(0);if((r21|0)<(r37|0)){r26=r21;r6=r37}else{r13=1764;break}}do{if(r13==1764){r13=0;if((HEAP32[r19>>2]|0)>-1){r29=-1;r30=r4;break}else{break L2522}}}while(0);L2554:while(1){if((r29|0)<0){if((r30|0)==(r3|0)){r13=1786;break}r6=HEAP32[(r30+r2<<2>>2)+r15];r26=HEAP32[(r6<<2>>2)+r12];if((r26|0)==(r30|0)){___assert_func(67676,145,68548,67380)}r20=(r6|0)/2&-1;if((r6&1|0)==0){r6=HEAP32[r8+(r20<<2)>>2];if((r6|0)<=-1){r29=-1;r30=r26;continue}r39=r6-HEAP32[(r20<<2>>2)+r11]|0}else{r39=HEAP32[(r20<<2>>2)+r11]}if((r39|0)!=0){r29=r39;r30=r26;continue}___assert_func(67676,157,68548,66916);r29=0;r30=r26;continue}else{r40=r30}while(1){if((r40|0)==(r3|0)){r13=1785;break L2554}r26=HEAP32[(r40+r2<<2>>2)+r15];r20=HEAP32[(r26<<2>>2)+r12];if((r20|0)==(r40|0)){___assert_func(67676,145,68548,67380)}r6=(r26|0)/2&-1;if((r26&1|0)==0){r26=HEAP32[r8+(r6<<2)>>2];if((r26|0)<=-1){r40=r20;continue}r41=r26-HEAP32[(r6<<2>>2)+r11]|0}else{r41=HEAP32[(r6<<2>>2)+r11]}if((r41|0)==0){___assert_func(67676,157,68548,66916);r42=0}else{r42=r41}if((r42|0)>-1&(r42|0)<(r29|0)){r29=r42;r30=r20;continue L2554}else{r40=r20}}}do{if(r13==1785){r13=0;if((r29|0)>0){break}else{r13=1786;break}}}while(0);if(r13==1786){r13=0;___assert_func(67676,170,68548,66596)}L2587:do{if(!r28){r21=-r29|0;r20=r4;while(1){r6=HEAP32[(r20+r2<<2>>2)+r15];r26=HEAP32[(r6<<2>>2)+r12];if((r26|0)==(r20|0)){___assert_func(67676,183,68548,67380)}r22=(((r6|0)/2&-1)<<2)+r9|0;HEAP32[r22>>2]=HEAP32[r22>>2]+((r6&1|0)==0?r29:r21)|0;if((r26|0)==(r3|0)){break L2587}else{r20=r26}}}}while(0);r1=r29+r1|0}if((r10|0)==0|r16^1){return r1}else{r43=0}while(1){do{if((r43|0)==(r3|0)){r13=1796}else{if((HEAP32[(r43+r2<<2>>2)+r15]|0)>-1){r13=1796;break}HEAP32[r10+(r43<<2)>>2]=1;break}}while(0);if(r13==1796){r13=0;HEAP32[r10+(r43<<2)>>2]=0}r16=r43+1|0;if((r16|0)==(r2|0)){break}else{r43=r16}}return r1}function _midend_new(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r5=STACKTOP;STACKTOP=STACKTOP+164|0;r6=r5;r7=r5+80;r8=r5+160;r9=_malloc(144),r10=r9>>2;if((r9|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r11=r9;r12=_malloc(8);if((r12|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_gettimeofday(r12,0);HEAP32[r10]=r1;r1=(r9+8|0)>>2;HEAP32[r1]=r2;r13=_random_new(r12,8);HEAP32[r10+1]=r13;r13=(r9+52|0)>>2;HEAP32[r13]=0;HEAP32[r13+1]=0;HEAP32[r13+2]=0;HEAP32[r13+3]=0;r13=FUNCTION_TABLE[HEAP32[r2+12>>2]]();r14=r9+68|0;HEAP32[r14>>2]=r13;r13=r6|0;_sprintf(r13,67632,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r1]>>2],tempInt));r15=HEAP8[r13];L2614:do{if(r15<<24>>24==0){r16=0}else{r17=0;r18=0;r19=r13;r20=r15;while(1){if((_isspace(r20&255)|0)==0){r21=_toupper(HEAPU8[r19])&255;HEAP8[r6+r17|0]=r21;r22=r17+1|0}else{r22=r17}r21=r18+1|0;r23=r6+r21|0;r24=HEAP8[r23];if(r24<<24>>24==0){r16=r22;break L2614}else{r17=r22;r18=r21;r19=r23;r20=r24}}}}while(0);HEAP8[r6+r16|0]=0;r16=_getenv(r13);if((r16|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r1]+20>>2]](HEAP32[r14>>2],r16)}HEAP32[r10+18]=0;r16=(r9+32|0)>>2;HEAP32[r16]=0;HEAP32[r16+1]=0;HEAP32[r16+2]=0;HEAP32[r16+3]=0;HEAP32[r10+12]=2;r16=(r9+12|0)>>2;HEAP32[r10+31]=0;HEAP32[r10+35]=0;HEAP32[r10+34]=0;HEAP32[r10+33]=0;HEAP32[r16]=0;HEAP32[r16+1]=0;HEAP32[r16+2]=0;HEAP32[r16+3]=0;HEAP32[r16+4]=0;_memset(r9+76|0,0,44);do{if((r3|0)==0){HEAP32[r10+30]=0}else{r16=_malloc(32),r14=r16>>2;if((r16|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r14]=r3;HEAP32[r14+1]=r4;HEAP32[r14+2]=0;HEAP32[r14+4]=0;HEAP32[r14+3]=0;HEAPF32[r14+5]=1;HEAP32[r14+6]=r11;HEAP32[r14+7]=0;HEAP32[r10+30]=r16;break}}}while(0);r10=r9+128|0;HEAP32[r10>>2]=HEAP32[r2+120>>2];r2=r7|0;_sprintf(r2,67716,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r1]>>2],tempInt));r1=HEAP8[r2];L2631:do{if(r1<<24>>24==0){r25=0}else{r9=0;r4=0;r3=r2;r16=r1;while(1){if((_isspace(r16&255)|0)==0){r14=_toupper(HEAPU8[r3])&255;HEAP8[r7+r4|0]=r14;r26=r4+1|0}else{r26=r4}r14=r9+1|0;r13=r7+r14|0;r6=HEAP8[r13];if(r6<<24>>24==0){r25=r26;break L2631}else{r9=r14;r4=r26;r3=r13;r16=r6}}}}while(0);HEAP8[r7+r25|0]=0;r25=_getenv(r2);if((r25|0)==0){_free(r12);STACKTOP=r5;return r11}r2=(_sscanf(r25,67488,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r8,tempInt))|0)==1;r25=HEAP32[r8>>2];if(!(r2&(r25|0)>0)){_free(r12);STACKTOP=r5;return r11}HEAP32[r10>>2]=r25;_free(r12);STACKTOP=r5;return r11}function _midend_can_undo(r1){return(HEAP32[r1+60>>2]|0)>1&1}function _midend_can_redo(r1){return(HEAP32[r1+60>>2]|0)<(HEAP32[r1+52>>2]|0)&1}function _midend_size(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r5=r1>>2;r6=STACKTOP;STACKTOP=STACKTOP+8|0;r7=r6;r8=r6+4;r9=(r1+76|0)>>2;r10=HEAP32[r9];do{if((r10|0)!=0){if((HEAP32[r5+33]|0)<=0){break}r11=r1+8|0;r12=r1+120|0;FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+140>>2]](HEAP32[r12>>2],r10);r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+136>>2]](HEAP32[r12>>2],HEAP32[HEAP32[r5+16]>>2]);HEAP32[r9]=r13}}while(0);r10=(r4|0)!=0;L2652:do{if(r10){r4=r1+8|0;r13=r1+68|0;r12=1;while(1){r11=r12<<1;FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+124>>2]](HEAP32[r13>>2],r11,r7,r8);if((HEAP32[r7>>2]|0)>(HEAP32[r2>>2]|0)){r14=r11;r15=r4,r16=r15>>2;r17=r13,r18=r17>>2;break L2652}if((HEAP32[r8>>2]|0)>(HEAP32[r3>>2]|0)){r14=r11;r15=r4,r16=r15>>2;r17=r13,r18=r17>>2;break L2652}else{r12=r11}}}else{r14=HEAP32[r5+32]+1|0;r15=r1+8|0,r16=r15>>2;r17=r1+68|0,r18=r17>>2}}while(0);r17=1;r15=r14;L2659:while(1){r19=r17;while(1){if((r15-r19|0)<=1){break L2659}r14=(r19+r15|0)/2&-1;FUNCTION_TABLE[HEAP32[HEAP32[r16]+124>>2]](HEAP32[r18],r14,r7,r8);if((HEAP32[r7>>2]|0)>(HEAP32[r2>>2]|0)){r17=r19;r15=r14;continue L2659}if((HEAP32[r8>>2]|0)>(HEAP32[r3>>2]|0)){r17=r19;r15=r14;continue L2659}else{r19=r14}}}r15=r1+132|0;HEAP32[r15>>2]=r19;if(r10){HEAP32[r5+32]=r19}if((r19|0)>0){r10=r1+136|0;r17=r1+140|0;FUNCTION_TABLE[HEAP32[HEAP32[r16]+124>>2]](HEAP32[r18],r19,r10,r17);FUNCTION_TABLE[HEAP32[HEAP32[r16]+128>>2]](HEAP32[r5+30],HEAP32[r9],HEAP32[r18],HEAP32[r15>>2]);r15=r10;r10=r17;r17=HEAP32[r15>>2];HEAP32[r2>>2]=r17;r18=HEAP32[r10>>2];HEAP32[r3>>2]=r18;STACKTOP=r6;return}else{r15=r1+136|0;r10=r1+140|0;r17=HEAP32[r15>>2];HEAP32[r2>>2]=r17;r18=HEAP32[r10>>2];HEAP32[r3>>2]=r18;STACKTOP=r6;return}}function _midend_set_params(r1,r2){var r3,r4;r3=r1+8|0;r4=r1+68|0;FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+28>>2]](HEAP32[r4>>2]);r1=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+32>>2]](r2);HEAP32[r4>>2]=r1;return}function _midend_get_params(r1){return FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+32>>2]](HEAP32[r1+68>>2])}function _midend_force_redraw(r1){var r2,r3,r4,r5,r6,r7;r2=(r1+76|0)>>2;r3=HEAP32[r2];r4=(r1+8|0)>>2;if((r3|0)==0){r5=r1+120|0}else{r6=r1+120|0;FUNCTION_TABLE[HEAP32[HEAP32[r4]+140>>2]](HEAP32[r6>>2],r3);r5=r6}r6=FUNCTION_TABLE[HEAP32[HEAP32[r4]+136>>2]](HEAP32[r5>>2],HEAP32[HEAP32[r1+64>>2]>>2]);HEAP32[r2]=r6;r6=r1+132|0;r3=HEAP32[r6>>2];if((r3|0)<=0){_midend_redraw(r1);return}r7=r1+68|0;FUNCTION_TABLE[HEAP32[HEAP32[r4]+124>>2]](HEAP32[r7>>2],r3,r1+136|0,r1+140|0);FUNCTION_TABLE[HEAP32[HEAP32[r4]+128>>2]](HEAP32[r5>>2],HEAP32[r2],HEAP32[r7>>2],HEAP32[r6>>2]);_midend_redraw(r1);return}function _midend_redraw(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r2=r1>>2;r3=0;r4=(r1+120|0)>>2;if((HEAP32[r4]|0)==0){___assert_func(66904,869,68468,67796)}r5=(r1+60|0)>>2;if((HEAP32[r5]|0)<=0){return}r6=(r1+76|0)>>2;if((HEAP32[r6]|0)==0){return}r7=HEAP32[r4];FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+32>>2]](HEAP32[r7+4>>2]);r7=r1+84|0;r8=HEAP32[r7>>2];do{if((r8|0)==0){r3=1871}else{r9=HEAPF32[r2+22];if(r9<=0){r3=1871;break}r10=r1+92|0;r11=HEAPF32[r10>>2];if(r11>=r9){r3=1871;break}r9=r1+104|0;r12=HEAP32[r9>>2];if((r12|0)==0){___assert_func(66904,875,68468,67752);r13=HEAP32[r7>>2];r14=HEAP32[r9>>2];r15=HEAPF32[r10>>2]}else{r13=r8;r14=r12;r15=r11}FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+144>>2]](HEAP32[r4],HEAP32[r6],r13,HEAP32[HEAP32[r2+16]+((HEAP32[r5]-1)*12&-1)>>2],r14,HEAP32[r2+20],r15,HEAPF32[r2+25]);break}}while(0);if(r3==1871){FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+144>>2]](HEAP32[r4],HEAP32[r6],0,HEAP32[HEAP32[r2+16]+((HEAP32[r5]-1)*12&-1)>>2],1,HEAP32[r2+20],0,HEAPF32[r2+25])}r2=HEAP32[r4];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+36>>2]](HEAP32[r2+4>>2]);return}function _midend_new_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r2=r1>>2;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+104|0;r5=r4;r6=r4+16;r7=r4+20;r8=r4+100;r9=(r1+52|0)>>2;r10=HEAP32[r9];L2707:do{if((r10|0)>0){r11=r1+8|0;r12=r1+64|0;r13=r10;while(1){r14=r13-1|0;HEAP32[r9]=r14;FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+68>>2]](HEAP32[HEAP32[r12>>2]+(r14*12&-1)>>2]);r14=HEAP32[r9];r15=HEAP32[HEAP32[r12>>2]+(r14*12&-1)+4>>2];if((r15|0)==0){r16=r14}else{_free(r15);r16=HEAP32[r9]}if((r16|0)>0){r13=r16}else{r17=r16;break L2707}}}else{r17=r10}}while(0);r10=(r1+76|0)>>2;r16=HEAP32[r10];if((r16|0)==0){r18=r17}else{FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+140>>2]](HEAP32[r2+30],r16);r18=HEAP32[r9]}if((r18|0)!=0){___assert_func(66904,349,68512,66576)}r18=(r1+48|0)>>2;r16=HEAP32[r18];do{if((r16|0)==1){HEAP32[r18]=2;break}else if((r16|0)==0){HEAP32[r18]=2;r3=1902;break}else{HEAP8[r5+15|0]=0;r17=r1+4|0;r13=HEAP32[r17>>2];while(1){r19=_random_bits(r13,7);if(r19>>>0<126){break}}r13=Math.floor((r19>>>0)/14)+49&255;r12=r5|0;HEAP8[r12]=r13;r13=1;while(1){r11=HEAP32[r17>>2];while(1){r20=_random_bits(r11,7);if(r20>>>0<120){break}}r11=Math.floor((r20>>>0)/12)+48&255;HEAP8[r5+r13|0]=r11;r11=r13+1|0;if((r11|0)==15){break}else{r13=r11}}r13=r1+40|0;r17=HEAP32[r13>>2];if((r17|0)!=0){_free(r17)}r17=_malloc(_strlen(r12)+1|0);if((r17|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r17,r12);HEAP32[r13>>2]=r17;r17=r1+72|0;r13=HEAP32[r17>>2];r11=r1+8|0;if((r13|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+28>>2]](r13)}r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+32>>2]](HEAP32[r2+17]);HEAP32[r17>>2]=r13;r3=1902;break}}while(0);do{if(r3==1902){r5=r1+32|0;r20=HEAP32[r5>>2];if((r20|0)!=0){_free(r20)}r20=r1+36|0;r19=HEAP32[r20>>2];if((r19|0)!=0){_free(r19)}r19=r1+44|0;r18=HEAP32[r19>>2];if((r18|0)!=0){_free(r18)}HEAP32[r19>>2]=0;r18=HEAP32[r2+10];r16=_random_new(r18,_strlen(r18));r18=FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+52>>2]](HEAP32[r2+18],r16,r19,(HEAP32[r2+30]|0)!=0&1);HEAP32[r5>>2]=r18;HEAP32[r20>>2]=0;if((r16|0)==0){break}_free(r16|0)}}while(0);r16=HEAP32[r9];r20=r1+56|0;do{if((r16|0)<(HEAP32[r20>>2]|0)){r18=r1+64|0,r21=r18>>2}else{r5=r16+128|0;HEAP32[r20>>2]=r5;r19=r1+64|0;r13=HEAP32[r19>>2];r17=r5*12&-1;if((r13|0)==0){r22=_malloc(r17)}else{r22=_realloc(r13,r17)}if((r22|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r19>>2]=r22;r18=r19,r21=r18>>2;break}}}while(0);r22=(r1+8|0)>>2;r20=(r1+68|0)>>2;r16=FUNCTION_TABLE[HEAP32[HEAP32[r22]+60>>2]](r1,HEAP32[r20],HEAP32[r2+8]);HEAP32[HEAP32[r21]+(HEAP32[r9]*12&-1)>>2]=r16;r16=HEAP32[r22];do{if((HEAP32[r16+72>>2]|0)!=0){r18=HEAP32[r2+11];if((r18|0)==0){break}HEAP32[r6>>2]=0;r19=HEAP32[HEAP32[r21]>>2];r17=FUNCTION_TABLE[HEAP32[r16+76>>2]](r19,r19,r18,r6);if(!((r17|0)!=0&(HEAP32[r6>>2]|0)==0)){___assert_func(66904,430,68512,66400)}r18=FUNCTION_TABLE[HEAP32[HEAP32[r22]+116>>2]](HEAP32[HEAP32[r21]>>2],r17);if((r18|0)==0){___assert_func(66904,432,68512,66368)}FUNCTION_TABLE[HEAP32[HEAP32[r22]+68>>2]](r18);if((r17|0)==0){break}_free(r17)}}while(0);r6=HEAP32[16442];do{if((r6|0)<0){r16=r7|0;_sprintf(r16,66244,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r22]>>2],tempInt));r17=HEAP8[r16];L2780:do{if(r17<<24>>24==0){r23=0}else{r18=0;r19=0;r13=r16;r5=r17;while(1){if((_isspace(r5&255)|0)==0){r11=_toupper(HEAPU8[r13])&255;HEAP8[r7+r18|0]=r11;r24=r18+1|0}else{r24=r18}r11=r19+1|0;r15=r7+r11|0;r14=HEAP8[r15];if(r14<<24>>24==0){r23=r24;break L2780}else{r18=r24;r19=r11;r13=r15;r5=r14}}}}while(0);HEAP8[r7+r23|0]=0;if((_getenv(r16)|0)==0){HEAP32[16442]=0;break}else{_fwrite(66092,26,1,HEAP32[_stderr>>2]);HEAP32[16442]=1;r3=1935;break}}else{if((r6|0)==0){break}else{r3=1935;break}}}while(0);do{if(r3==1935){HEAP32[r8>>2]=0;r6=HEAP32[HEAP32[r21]>>2];r23=FUNCTION_TABLE[HEAP32[HEAP32[r22]+76>>2]](r6,r6,0,r8);if(!((r23|0)!=0&(HEAP32[r8>>2]|0)==0)){___assert_func(66904,478,68512,66400)}r6=FUNCTION_TABLE[HEAP32[HEAP32[r22]+116>>2]](HEAP32[HEAP32[r21]>>2],r23);if((r6|0)==0){___assert_func(66904,480,68512,66368)}FUNCTION_TABLE[HEAP32[HEAP32[r22]+68>>2]](r6);if((r23|0)==0){break}_free(r23)}}while(0);HEAP32[HEAP32[r21]+(HEAP32[r9]*12&-1)+4>>2]=0;HEAP32[HEAP32[r21]+(HEAP32[r9]*12&-1)+8>>2]=0;HEAP32[r9]=HEAP32[r9]+1|0;r9=r1+60|0;HEAP32[r9>>2]=1;r8=r1+120|0;r23=FUNCTION_TABLE[HEAP32[HEAP32[r22]+136>>2]](HEAP32[r8>>2],HEAP32[HEAP32[r21]>>2]);HEAP32[r10]=r23;r23=r1+132|0;r6=HEAP32[r23>>2];if((r6|0)>0){FUNCTION_TABLE[HEAP32[HEAP32[r22]+124>>2]](HEAP32[r20],r6,r1+136|0,r1+140|0);FUNCTION_TABLE[HEAP32[HEAP32[r22]+128>>2]](HEAP32[r8>>2],HEAP32[r10],HEAP32[r20],HEAP32[r23>>2])}HEAPF32[r2+28]=0;r23=r1+80|0;r20=HEAP32[r23>>2];if((r20|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r22]+96>>2]](r20)}r20=FUNCTION_TABLE[HEAP32[HEAP32[r22]+92>>2]](HEAP32[HEAP32[r21]>>2]);HEAP32[r23>>2]=r20;r23=HEAP32[r22];do{if((HEAP32[r23+180>>2]|0)==0){HEAP32[r2+27]=0;r3=1948;break}else{r22=(FUNCTION_TABLE[HEAP32[r23+184>>2]](HEAP32[HEAP32[r21]+((HEAP32[r9>>2]-1)*12&-1)>>2],r20)|0)!=0;HEAP32[r2+27]=r22&1;if(r22){break}else{r3=1948;break}}}while(0);do{if(r3==1948){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r2+22]!=0){break}_deactivate_timer(HEAP32[r2]);r25=r1+124|0;HEAP32[r25>>2]=0;STACKTOP=r4;return}}while(0);_activate_timer(HEAP32[r2]);r25=r1+124|0;HEAP32[r25>>2]=0;STACKTOP=r4;return}function _midend_finish_move(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r2=r1>>2;r3=0;r4=(r1+84|0)>>2;r5=HEAP32[r4];r6=(r5|0)==0;do{if(r6){if((HEAP32[r2+15]|0)>1){r3=1957;break}else{break}}else{r3=1957}}while(0);do{if(r3==1957){r7=HEAP32[r2+26];if((r7|0)>0){r8=HEAP32[r2+15];r9=HEAP32[r2+16];if((HEAP32[r9+((r8-1)*12&-1)+8>>2]|0)==1){r10=r8;r11=r9}else{break}}else{if((r7|0)>=0){break}r9=HEAP32[r2+15];if((r9|0)>=(HEAP32[r2+13]|0)){break}r8=HEAP32[r2+16];if((HEAP32[r8+(r9*12&-1)+8>>2]|0)==1){r10=r9;r11=r8}else{break}}if(r6){r12=1;r13=HEAP32[r11+((r10-2)*12&-1)>>2]}else{r12=r7;r13=r5}r7=FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+152>>2]](r13,HEAP32[r11+((r10-1)*12&-1)>>2],r12,HEAP32[r2+20]);if(r7<=0){break}HEAPF32[r2+25]=0;HEAPF32[r2+24]=r7}}while(0);r12=HEAP32[r4];r10=r1+8|0;if((r12|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+68>>2]](r12)}HEAP32[r4]=0;r4=r1+88|0;HEAPF32[r4>>2]=0;HEAPF32[r2+23]=0;HEAP32[r2+26]=0;r1=HEAP32[r10>>2];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=1972;break}else{r10=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r2+16]+((HEAP32[r2+15]-1)*12&-1)>>2],HEAP32[r2+20])|0)!=0;HEAP32[r2+27]=r10&1;if(r10){break}else{r3=1972;break}}}while(0);do{if(r3==1972){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r4>>2]!=0){break}_deactivate_timer(HEAP32[r2]);return}}while(0);_activate_timer(HEAP32[r2]);return}function _midend_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12;r5=r1>>2;r6=(r4-515|0)>>>0<3;do{if(r6|(r4-518|0)>>>0<3){r7=HEAP32[r5+31];if((r7|0)==0){r8=1;return r8}if(r6){r9=1;r10=r7+3|0;break}else{r9=1;r10=r7+6|0;break}}else{if((r4-512|0)>>>0>=3){r9=1;r10=r4;break}r7=HEAP32[r5+31];if((r7|0)==0){r9=1;r10=r4;break}if((HEAP32[HEAP32[r5+2]+188>>2]&1<<r4-2048+(r7*3&-1)|0)==0){r9=(_midend_really_process_key(r1,r2,r3,r7+6|0)|0)!=0&1;r10=r4;break}else{r8=1;return r8}}}while(0);if((r10|0)==13|(r10|0)==10){r11=525}else{r11=r10}r10=(r11|0)==32?526:r11;r11=(r10|0)==127?8:r10;if((r9|0)==0){r12=0}else{r12=(_midend_really_process_key(r1,r2,r3,r11)|0)!=0}r3=r12&1;if((r11-518|0)>>>0<3){HEAP32[r5+31]=0;r8=r3;return r8}if((r11-512|0)>>>0>=3){r8=r3;return r8}HEAP32[r5+31]=r11;r8=r3;return r8}function _midend_restart_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r2=r1>>2;r3=0;r4=STACKTOP;r5=r1+84|0;do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=2004;break}else{break}}else{r3=2004}}while(0);if(r3==2004){_midend_finish_move(r1);_midend_redraw(r1)}r6=(r1+60|0)>>2;r7=HEAP32[r6];if((r7|0)>0){r8=r7}else{___assert_func(66904,586,68448,66016);r8=HEAP32[r6]}if((r8|0)==1){STACKTOP=r4;return}r8=(r1+8|0)>>2;r7=r1+32|0;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8]+60>>2]](r1,HEAP32[r2+17],HEAP32[r7>>2]);do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=2010;break}else{break}}else{r3=2010}}while(0);if(r3==2010){_midend_finish_move(r1);_midend_redraw(r1)}r5=(r1+52|0)>>2;r10=HEAP32[r5];L2894:do{if((r10|0)>(HEAP32[r6]|0)){r11=r1+64|0;r12=r10;while(1){r13=HEAP32[HEAP32[r8]+68>>2];r14=r12-1|0;HEAP32[r5]=r14;FUNCTION_TABLE[r13](HEAP32[HEAP32[r11>>2]+(r14*12&-1)>>2]);r14=HEAP32[r5];r13=HEAP32[HEAP32[r11>>2]+(r14*12&-1)+4>>2];if((r13|0)==0){r15=r14}else{_free(r13);r15=HEAP32[r5]}if((r15|0)>(HEAP32[r6]|0)){r12=r15}else{r16=r15;break L2894}}}else{r16=r10}}while(0);r10=r1+56|0;do{if((r16|0)<(HEAP32[r10>>2]|0)){r17=r16;r18=HEAP32[r2+16]}else{r15=r16+128|0;HEAP32[r10>>2]=r15;r12=r1+64|0;r11=HEAP32[r12>>2];r13=r15*12&-1;if((r11|0)==0){r19=_malloc(r13)}else{r19=_realloc(r11,r13)}if((r19|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r13=r19;HEAP32[r12>>2]=r13;r17=HEAP32[r5];r18=r13;break}}}while(0);r19=(r1+64|0)>>2;HEAP32[r18+(r17*12&-1)>>2]=r9;r9=HEAP32[r7>>2];r7=_malloc(_strlen(r9)+1|0);if((r7|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r7,r9);HEAP32[HEAP32[r19]+(HEAP32[r5]*12&-1)+4>>2]=r7;HEAP32[HEAP32[r19]+(HEAP32[r5]*12&-1)+8>>2]=3;r7=HEAP32[r5];r9=r7+1|0;HEAP32[r5]=r9;HEAP32[r6]=r9;r9=r1+80|0;r5=HEAP32[r9>>2];if((r5|0)!=0){r17=HEAP32[r19];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r5,HEAP32[r17+((r7-1)*12&-1)>>2],HEAP32[r17+(r7*12&-1)>>2])}r7=r1+88|0;HEAPF32[r7>>2]=0;_midend_finish_move(r1);_midend_redraw(r1);r1=HEAP32[r8];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=2031;break}else{r8=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r19]+((HEAP32[r6]-1)*12&-1)>>2],HEAP32[r9>>2])|0)!=0;HEAP32[r2+27]=r8&1;if(r8){break}else{r3=2031;break}}}while(0);do{if(r3==2031){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r7>>2]!=0){break}_deactivate_timer(HEAP32[r2]);STACKTOP=r4;return}}while(0);_activate_timer(HEAP32[r2]);STACKTOP=r4;return}function _midend_timer(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=r1>>2;r4=0;r5=r1+88|0;r6=HEAPF32[r5>>2];r7=r6>0;if(r7){r8=1}else{r8=HEAPF32[r3+24]>0}r9=r1+92|0;r10=HEAPF32[r9>>2]+r2;HEAPF32[r9>>2]=r10;do{if(r10>=r6|r6==0){if(r7){r4=2044;break}else{break}}else{if((HEAP32[r3+21]|0)!=0|r7^1){break}else{r4=2044;break}}}while(0);if(r4==2044){_midend_finish_move(r1)}r7=(r1+100|0)>>2;r6=HEAPF32[r7]+r2;HEAPF32[r7]=r6;r10=(r1+96|0)>>2;r9=HEAPF32[r10];if(r6>=r9|r9==0){HEAPF32[r10]=0;HEAPF32[r7]=0}if(r8){_midend_redraw(r1)}r8=(r1+108|0)>>2;do{if((HEAP32[r8]|0)!=0){r7=r1+112|0;r9=HEAPF32[r7>>2];r6=r9+r2;HEAPF32[r7>>2]=r6;if((r9&-1|0)==(r6&-1|0)){break}r6=HEAP32[r3+29];_status_bar(HEAP32[r3+30],(r6|0)==0?67528:r6)}}while(0);r2=HEAP32[r3+2];do{if((HEAP32[r2+180>>2]|0)==0){HEAP32[r8]=0;r4=2055;break}else{r1=(FUNCTION_TABLE[HEAP32[r2+184>>2]](HEAP32[HEAP32[r3+16]+((HEAP32[r3+15]-1)*12&-1)>>2],HEAP32[r3+20])|0)!=0;HEAP32[r8]=r1&1;if(r1){break}else{r4=2055;break}}}while(0);do{if(r4==2055){if(HEAPF32[r10]!=0){break}if(HEAPF32[r5>>2]!=0){break}_deactivate_timer(HEAP32[r3]);return}}while(0);_activate_timer(HEAP32[r3]);return}function _midend_colours(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r3=STACKTOP;STACKTOP=STACKTOP+92|0;r4=r3;r5=r3+80;r6=r3+84;r7=r3+88;r8=r1+8|0;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+132>>2]](HEAP32[r1>>2],r2),r1=r9>>2;if((HEAP32[r2>>2]|0)<=0){STACKTOP=r3;return r9}r10=r4|0;r11=0;while(1){_sprintf(r10,67644,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r8>>2]>>2],HEAP32[tempInt+4>>2]=r11,tempInt));r12=HEAP8[r10];L2965:do{if(r12<<24>>24==0){r13=0}else{r14=0;r15=0;r16=r10;r17=r12;while(1){if((_isspace(r17&255)|0)==0){r18=_toupper(HEAPU8[r16])&255;HEAP8[r4+r15|0]=r18;r19=r15+1|0}else{r19=r15}r18=r14+1|0;r20=r4+r18|0;r21=HEAP8[r20];if(r21<<24>>24==0){r13=r19;break L2965}else{r14=r18;r15=r19;r16=r20;r17=r21}}}}while(0);HEAP8[r4+r13|0]=0;r12=_getenv(r10);do{if((r12|0)!=0){if((_sscanf(r12,67616,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r6,HEAP32[tempInt+8>>2]=r7,tempInt))|0)!=3){break}r17=r11*3&-1;HEAPF32[(r17<<2>>2)+r1]=(HEAP32[r5>>2]>>>0)/255;HEAPF32[(r17+1<<2>>2)+r1]=(HEAP32[r6>>2]>>>0)/255;HEAPF32[(r17+2<<2>>2)+r1]=(HEAP32[r7>>2]>>>0)/255}}while(0);r12=r11+1|0;if((r12|0)<(HEAP32[r2>>2]|0)){r11=r12}else{break}}STACKTOP=r3;return r9}function _midend_really_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r5=r1>>2;r6=0;r7=STACKTOP;r8=(r1+8|0)>>2;r9=(r1+60|0)>>2;r10=(r1+64|0)>>2;r11=FUNCTION_TABLE[HEAP32[HEAP32[r8]+64>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2]);r12=(r1+80|0)>>2;r13=FUNCTION_TABLE[HEAP32[HEAP32[r8]+112>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12],HEAP32[r5+19],r2,r3,r4);L2978:do{if((r13|0)==0){if((r4|0)==117|(r4|0)==85|(r4|0)==31|(r4|0)==26){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=2083;break}else{break}}else{r6=2083}}while(0);if(r6==2083){_midend_finish_move(r1);_midend_redraw(r1)}r3=HEAP32[r9];r2=r3-1|0;r14=HEAP32[r10]>>2;r15=HEAP32[((r2*12&-1)+8>>2)+r14];if((r3|0)<=1){r16=1;r6=2142;break}r17=HEAP32[r12];if((r17|0)==0){r18=r3}else{FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r17,HEAP32[((r2*12&-1)>>2)+r14],HEAP32[(((r3-2)*12&-1)>>2)+r14]);r18=HEAP32[r9]}r14=r18-1|0;HEAP32[r9]=r14;HEAP32[r5+26]=-1;r19=r15;r20=r14;break}else if((r4|0)==114|(r4|0)==82|(r4|0)==25|(r4|0)==18){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=2089;break}else{break}}else{r6=2089}}while(0);if(r6==2089){_midend_finish_move(r1);_midend_redraw(r1)}r14=HEAP32[r9];if((r14|0)>=(HEAP32[r5+13]|0)){r16=1;r6=2142;break}r15=HEAP32[r12];if((r15|0)==0){r21=r14}else{r3=HEAP32[r10];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r15,HEAP32[r3+((r14-1)*12&-1)>>2],HEAP32[r3+(r14*12&-1)>>2]);r21=HEAP32[r9]}HEAP32[r9]=r21+1|0;HEAP32[r5+26]=1;r6=2127;break}else if((r4|0)==113|(r4|0)==81|(r4|0)==17){r16=0;r6=2142;break}else if((r4|0)==19){if((HEAP32[HEAP32[r8]+72>>2]|0)==0){r16=1;r6=2142;break}if((_midend_solve(r1)|0)==0){r6=2127;break}else{r16=1;r6=2142;break}}else if((r4|0)==110|(r4|0)==78|(r4|0)==14){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=2079;break}else{break}}else{r6=2079}}while(0);if(r6==2079){_midend_finish_move(r1);_midend_redraw(r1)}_midend_new_game(r1);_midend_redraw(r1);r16=1;r6=2142;break}else{r16=1;r6=2142;break}}else{do{if(HEAP8[r13]<<24>>24==0){r22=HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2]}else{r14=FUNCTION_TABLE[HEAP32[HEAP32[r8]+116>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],r13);if((r14|0)!=0){r22=r14;break}___assert_func(66904,664,68484,66224);r22=0}}while(0);r14=HEAP32[r9];if((r22|0)==(HEAP32[HEAP32[r10]+((r14-1)*12&-1)>>2]|0)){_midend_redraw(r1);r3=HEAP32[r8];do{if((HEAP32[r3+180>>2]|0)==0){HEAP32[r5+27]=0;r6=2105;break}else{r15=(FUNCTION_TABLE[HEAP32[r3+184>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12])|0)!=0;HEAP32[r5+27]=r15&1;if(r15){break}else{r6=2105;break}}}while(0);do{if(r6==2105){if(HEAPF32[r5+24]!=0){break}if(HEAPF32[r5+22]!=0){break}_deactivate_timer(HEAP32[r5]);r16=1;r6=2142;break L2978}}while(0);_activate_timer(HEAP32[r5]);r16=1;r6=2142;break}if((r22|0)==0){r16=1;r6=2142;break}do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=2112;break}else{r23=r14;break}}else{r6=2112}}while(0);if(r6==2112){_midend_finish_move(r1);_midend_redraw(r1);r23=HEAP32[r9]}r14=(r1+52|0)>>2;r3=HEAP32[r14];L3002:do{if((r3|0)>(r23|0)){r15=r3;while(1){r2=HEAP32[HEAP32[r8]+68>>2];r17=r15-1|0;HEAP32[r14]=r17;FUNCTION_TABLE[r2](HEAP32[HEAP32[r10]+(r17*12&-1)>>2]);r17=HEAP32[r14];r2=HEAP32[HEAP32[r10]+(r17*12&-1)+4>>2];if((r2|0)==0){r24=r17}else{_free(r2);r24=HEAP32[r14]}if((r24|0)>(HEAP32[r9]|0)){r15=r24}else{r25=r24;break L3002}}}else{r25=r3}}while(0);r3=r1+56|0;do{if((r25|0)>=(HEAP32[r3>>2]|0)){r15=r25+128|0;HEAP32[r3>>2]=r15;r2=HEAP32[r10];r17=r15*12&-1;if((r2|0)==0){r26=_malloc(r17)}else{r26=_realloc(r2,r17)}if((r26|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r10]=r26;break}}}while(0);HEAP32[HEAP32[r10]+(HEAP32[r14]*12&-1)>>2]=r22;HEAP32[HEAP32[r10]+(HEAP32[r14]*12&-1)+4>>2]=r13;HEAP32[HEAP32[r10]+(HEAP32[r14]*12&-1)+8>>2]=1;r3=HEAP32[r14];r17=r3+1|0;HEAP32[r14]=r17;HEAP32[r9]=r17;HEAP32[r5+26]=1;r17=HEAP32[r12];if((r17|0)==0){r6=2127;break}r2=HEAP32[r10];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r17,HEAP32[r2+((r3-1)*12&-1)>>2],HEAP32[r2+(r3*12&-1)>>2]);r6=2127;break}}while(0);if(r6==2142){if((r11|0)==0){r27=r16;STACKTOP=r7;return r27}FUNCTION_TABLE[HEAP32[HEAP32[r8]+68>>2]](r11);r27=r16;STACKTOP=r7;return r27}else if(r6==2127){r16=HEAP32[r9];r19=HEAP32[HEAP32[r10]+((r16-1)*12&-1)+8>>2];r20=r16}do{if((r19|0)==1){r28=HEAP32[r8];r6=2132;break}else if((r19|0)==2){r16=HEAP32[r8];if((HEAP32[r16+188>>2]&512|0)==0){r6=2131;break}else{r28=r16;r6=2132;break}}else{r6=2131}}while(0);do{if(r6==2131){HEAP32[r5+21]=r11;r29=r1+88|0;r6=2134;break}else if(r6==2132){r19=FUNCTION_TABLE[HEAP32[r28+148>>2]](r11,HEAP32[HEAP32[r10]+((r20-1)*12&-1)>>2],HEAP32[r5+26],HEAP32[r12]);HEAP32[r5+21]=r11;r16=r1+88|0;if(r19<=0){r29=r16;r6=2134;break}HEAPF32[r16>>2]=r19;r30=r16;break}}while(0);if(r6==2134){HEAPF32[r29>>2]=0;_midend_finish_move(r1);r30=r29}HEAPF32[r5+23]=0;_midend_redraw(r1);r1=HEAP32[r8];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r5+27]=0;r6=2138;break}else{r8=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12])|0)!=0;HEAP32[r5+27]=r8&1;if(r8){break}else{r6=2138;break}}}while(0);do{if(r6==2138){if(HEAPF32[r5+24]!=0){break}if(HEAPF32[r30>>2]!=0){break}_deactivate_timer(HEAP32[r5]);r27=1;STACKTOP=r7;return r27}}while(0);_activate_timer(HEAP32[r5]);r27=1;STACKTOP=r7;return r27}function _midend_wants_statusbar(r1){return HEAP32[HEAP32[r1+8>>2]+176>>2]}function _midend_which_preset(r1){var r2,r3,r4,r5;r2=FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+24>>2]](HEAP32[r1+68>>2],1);r3=r1+20|0;r4=HEAP32[r1+24>>2];r1=0;while(1){if((r1|0)>=(r4|0)){r5=-1;break}if((_strcmp(r2,HEAP32[HEAP32[r3>>2]+(r1<<2)>>2])|0)==0){r5=r1;break}else{r1=r1+1|0}}if((r2|0)==0){return r5}_free(r2);return r5}function _midend_status(r1){var r2,r3;r2=HEAP32[r1+60>>2];if((r2|0)==0){r3=1;return r3}r3=FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+156>>2]](HEAP32[HEAP32[r1+64>>2]+((r2-1)*12&-1)>>2]);return r3}function _shuffle(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r5=STACKTOP;STACKTOP=STACKTOP+512|0;r6=r2-1|0;if((r2|0)<=1){STACKTOP=r5;return}r7=r5|0;if((r3|0)>0){r8=r2;r9=r6}else{r10=r2;r2=r6;while(1){r6=0;while(1){if((r10>>>(r6>>>0)|0)==0){break}else{r6=r6+1|0}}r11=r6+3|0;if((r11|0)>=32){___assert_func(67232,275,68368,67664)}r12=1<<r11;r13=r12-(r12>>>0)%(r10>>>0)|0;while(1){if(_random_bits(r4,r11)>>>0<r13>>>0){break}}if((r2|0)>1){r10=r2;r2=r2-1|0}else{break}}STACKTOP=r5;return}while(1){r2=0;while(1){if((r8>>>(r2>>>0)|0)==0){break}else{r2=r2+1|0}}r10=r2+3|0;if((r10|0)>=32){___assert_func(67232,275,68368,67664)}r13=Math.floor((1<<r10>>>0)/(r8>>>0));r11=Math.imul(r13,r8);while(1){r14=_random_bits(r4,r10);if(r14>>>0<r11>>>0){break}}r11=Math.floor((r14>>>0)/(r13>>>0));L3122:do{if((r11|0)!=(r9|0)){r10=Math.imul(r11,r3);r2=r1+Math.imul(r9,r3)|0;r6=r1+r10|0;r10=r3;while(1){r12=r10>>>0<512?r10:512;_memcpy(r7,r2,r12);_memcpy(r2,r6,r12);_memcpy(r6,r7,r12);r15=r10-r12|0;if((r15|0)>0){r2=r2+r12|0;r6=r6+r12|0;r10=r15}else{break L3122}}}}while(0);if((r9|0)>1){r8=r9;r9=r9-1|0}else{break}}STACKTOP=r5;return}function _midend_num_presets(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+88|0;r4=r3;r5=r3+4;r6=r3+8;r7=(r1+24|0)>>2;r8=(r1+8|0)>>2;L3129:do{if((HEAP32[r7]|0)==0){if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+16>>2]](0,r4,r5)|0)==0){break}r9=(r1+28|0)>>2;r10=(r1+12|0)>>2;r11=(r1+16|0)>>2;r12=(r1+20|0)>>2;while(1){r13=HEAP32[r7];if((HEAP32[r9]|0)>(r13|0)){r14=r13}else{r15=r13+10|0;HEAP32[r9]=r15;r13=HEAP32[r10];r16=r15<<2;if((r13|0)==0){r17=_malloc(r16)}else{r17=_realloc(r13,r16)}if((r17|0)==0){r2=2194;break}HEAP32[r10]=r17;r16=HEAP32[r11];r13=HEAP32[r9]<<2;if((r16|0)==0){r18=_malloc(r13)}else{r18=_realloc(r16,r13)}if((r18|0)==0){r2=2199;break}HEAP32[r11]=r18;r13=HEAP32[r12];r16=HEAP32[r9]<<2;if((r13|0)==0){r19=_malloc(r16)}else{r19=_realloc(r13,r16)}if((r19|0)==0){r2=2204;break}HEAP32[r12]=r19;r14=HEAP32[r7]}HEAP32[HEAP32[r10]+(r14<<2)>>2]=HEAP32[r5>>2];HEAP32[HEAP32[r11]+(HEAP32[r7]<<2)>>2]=HEAP32[r4>>2];r16=FUNCTION_TABLE[HEAP32[HEAP32[r8]+24>>2]](HEAP32[r5>>2],1);HEAP32[HEAP32[r12]+(HEAP32[r7]<<2)>>2]=r16;r16=HEAP32[r7]+1|0;HEAP32[r7]=r16;if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+16>>2]](r16,r4,r5)|0)==0){break L3129}}if(r2==2204){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==2199){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==2194){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}}while(0);r5=r6|0;_sprintf(r5,67600,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r8]>>2],tempInt));r4=HEAP8[r5];L3157:do{if(r4<<24>>24==0){r20=0}else{r14=0;r19=0;r18=r5;r17=r4;while(1){if((_isspace(r17&255)|0)==0){r12=_toupper(HEAPU8[r18])&255;HEAP8[r6+r14|0]=r12;r21=r14+1|0}else{r21=r14}r12=r19+1|0;r11=r6+r12|0;r10=HEAP8[r11];if(r10<<24>>24==0){r20=r21;break L3157}else{r14=r21;r19=r12;r18=r11;r17=r10}}}}while(0);HEAP8[r6+r20|0]=0;r20=_getenv(r5);if((r20|0)==0){r22=HEAP32[r7];STACKTOP=r3;return r22}r5=_malloc(_strlen(r20)+1|0);if((r5|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r20);r20=HEAP8[r5];L3170:do{if(r20<<24>>24!=0){r6=(r1+28|0)>>2;r21=(r1+12|0)>>2;r4=(r1+16|0)>>2;r17=(r1+20|0)>>2;r18=r5;r19=r20;while(1){r14=r18;r10=r19;while(1){r23=r10<<24>>24==0;r24=r14+1|0;if(!(r10<<24>>24!=58&(r23^1))){break}r14=r24;r10=HEAP8[r24]}if(r23){r25=r14}else{HEAP8[r14]=0;r25=r24}r10=r25;while(1){r11=HEAP8[r10];r26=r11<<24>>24==0;r27=r10+1|0;if(r11<<24>>24!=58&(r26^1)){r10=r27}else{break}}if(r26){r28=r10}else{HEAP8[r10]=0;r28=r27}r14=FUNCTION_TABLE[HEAP32[HEAP32[r8]+12>>2]]();FUNCTION_TABLE[HEAP32[HEAP32[r8]+20>>2]](r14,r25);if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+48>>2]](r14,1)|0)==0){r11=HEAP32[r7];if((HEAP32[r6]|0)>(r11|0)){r29=r11}else{r12=r11+10|0;HEAP32[r6]=r12;r11=HEAP32[r21];r9=r12<<2;if((r11|0)==0){r30=_malloc(r9)}else{r30=_realloc(r11,r9)}if((r30|0)==0){r2=2233;break}HEAP32[r21]=r30;r9=HEAP32[r4];r11=HEAP32[r6]<<2;if((r9|0)==0){r31=_malloc(r11)}else{r31=_realloc(r9,r11)}if((r31|0)==0){r2=2238;break}HEAP32[r4]=r31;r11=HEAP32[r17];r9=HEAP32[r6]<<2;if((r11|0)==0){r32=_malloc(r9)}else{r32=_realloc(r11,r9)}if((r32|0)==0){r2=2243;break}HEAP32[r17]=r32;r29=HEAP32[r7]}HEAP32[HEAP32[r21]+(r29<<2)>>2]=r14;r9=_malloc(_strlen(r18)+1|0);if((r9|0)==0){r2=2246;break}_strcpy(r9,r18);HEAP32[HEAP32[r4]+(HEAP32[r7]<<2)>>2]=r9;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8]+24>>2]](r14,1);HEAP32[HEAP32[r17]+(HEAP32[r7]<<2)>>2]=r9;HEAP32[r7]=HEAP32[r7]+1|0}else{FUNCTION_TABLE[HEAP32[HEAP32[r8]+28>>2]](r14)}r14=HEAP8[r28];if(r14<<24>>24==0){break L3170}else{r18=r28;r19=r14}}if(r2==2233){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==2246){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==2243){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==2238){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}}while(0);_free(r5);r22=HEAP32[r7];STACKTOP=r3;return r22}function _midend_solve(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r2=r1>>2;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+4|0;r5=r4,r6=r5>>2;r7=(r1+8|0)>>2;r8=HEAP32[r7];if((HEAP32[r8+72>>2]|0)==0){r9=67096;STACKTOP=r4;return r9}r10=(r1+60|0)>>2;r11=HEAP32[r10];if((r11|0)<1){r9=67e3;STACKTOP=r4;return r9}HEAP32[r6]=0;r12=(r1+64|0)>>2;r13=HEAP32[r12];r14=FUNCTION_TABLE[HEAP32[r8+76>>2]](HEAP32[r13>>2],HEAP32[r13+((r11-1)*12&-1)>>2],HEAP32[r2+11],r5);if((r14|0)==0){r5=HEAP32[r6];if((r5|0)!=0){r9=r5;STACKTOP=r4;return r9}HEAP32[r6]=66928;r9=66928;STACKTOP=r4;return r9}r6=FUNCTION_TABLE[HEAP32[HEAP32[r7]+116>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-1)*12&-1)>>2],r14);if((r6|0)==0){___assert_func(66904,1376,68432,66368)}r5=r1+84|0;do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=2261;break}else{break}}else{r3=2261}}while(0);if(r3==2261){_midend_finish_move(r1);_midend_redraw(r1)}r11=(r1+52|0)>>2;r13=HEAP32[r11];L3239:do{if((r13|0)>(HEAP32[r10]|0)){r8=r13;while(1){r15=HEAP32[HEAP32[r7]+68>>2];r16=r8-1|0;HEAP32[r11]=r16;FUNCTION_TABLE[r15](HEAP32[HEAP32[r12]+(r16*12&-1)>>2]);r16=HEAP32[r11];r15=HEAP32[HEAP32[r12]+(r16*12&-1)+4>>2];if((r15|0)==0){r17=r16}else{_free(r15);r17=HEAP32[r11]}if((r17|0)>(HEAP32[r10]|0)){r8=r17}else{r18=r17;break L3239}}}else{r18=r13}}while(0);r13=r1+56|0;do{if((r18|0)<(HEAP32[r13>>2]|0)){r19=r18;r20=HEAP32[r12]}else{r17=r18+128|0;HEAP32[r13>>2]=r17;r8=HEAP32[r12];r15=r17*12&-1;if((r8|0)==0){r21=_malloc(r15)}else{r21=_realloc(r8,r15)}if((r21|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r15=r21;HEAP32[r12]=r15;r19=HEAP32[r11];r20=r15;break}}}while(0);HEAP32[r20+(r19*12&-1)>>2]=r6;HEAP32[HEAP32[r12]+(HEAP32[r11]*12&-1)+4>>2]=r14;HEAP32[HEAP32[r12]+(HEAP32[r11]*12&-1)+8>>2]=2;r14=HEAP32[r11];r6=r14+1|0;HEAP32[r11]=r6;HEAP32[r10]=r6;r6=(r1+80|0)>>2;r11=HEAP32[r6];if((r11|0)!=0){r19=HEAP32[r12];FUNCTION_TABLE[HEAP32[HEAP32[r7]+108>>2]](r11,HEAP32[r19+((r14-1)*12&-1)>>2],HEAP32[r19+(r14*12&-1)>>2])}HEAP32[r2+26]=1;r14=HEAP32[r7];if((HEAP32[r14+188>>2]&512|0)==0){HEAPF32[r2+22]=0;_midend_finish_move(r1)}else{r19=FUNCTION_TABLE[HEAP32[r14+64>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-2)*12&-1)>>2]);HEAP32[r5>>2]=r19;r19=HEAP32[r10];r5=HEAP32[r12];r14=FUNCTION_TABLE[HEAP32[HEAP32[r7]+148>>2]](HEAP32[r5+((r19-2)*12&-1)>>2],HEAP32[r5+((r19-1)*12&-1)>>2],1,HEAP32[r6]);HEAPF32[r2+22]=r14;HEAPF32[r2+23]=0}if((HEAP32[r2+30]|0)!=0){_midend_redraw(r1)}r1=HEAP32[r7];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=2284;break}else{r7=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-1)*12&-1)>>2],HEAP32[r6])|0)!=0;HEAP32[r2+27]=r7&1;if(r7){break}else{r3=2284;break}}}while(0);do{if(r3==2284){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r2+22]!=0){break}_deactivate_timer(HEAP32[r2]);r9=0;STACKTOP=r4;return r9}}while(0);_activate_timer(HEAP32[r2]);r9=0;STACKTOP=r4;return r9}function _midend_rewrite_statusbar(r1,r2){var r3,r4,r5,r6,r7;r3=STACKTOP;STACKTOP=STACKTOP+100|0;r4=r3;r5=r1+116|0;r6=HEAP32[r5>>2];do{if((r6|0)!=(r2|0)){if((r6|0)!=0){_free(r6)}r7=_malloc(_strlen(r2)+1|0);if((r7|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r7,r2);HEAP32[r5>>2]=r7;break}}}while(0);if((HEAP32[HEAP32[r1+8>>2]+180>>2]|0)==0){r5=_malloc(_strlen(r2)+1|0);if((r5|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r2);r6=r5;STACKTOP=r3;return r6}else{r5=HEAPF32[r1+112>>2]&-1;r1=r4|0;_sprintf(r1,66840,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=(r5|0)/60&-1,HEAP32[tempInt+4>>2]=(r5|0)%60,tempInt));r5=_malloc(_strlen(r1)+_strlen(r2)+1|0);if((r5|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r1);_strcat(r5,r2);r6=r5;STACKTOP=r3;return r6}}function _SHA_Bytes(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+384|0;r6=r5,r7=r6>>2;r8=r5+320;r9=r1+92|0;r10=_llvm_uadd_with_overflow_i32(HEAP32[r9>>2],r3);HEAP32[r9>>2]=r10;r10=r1+88|0;HEAP32[r10>>2]=(tempRet0&1)+HEAP32[r10>>2]|0;r10=(r1+84|0)>>2;r9=HEAP32[r10];r11=r9+r3|0;do{if((r9|0)==0){if((r11|0)>63){r4=2313;break}else{r12=r2;r13=r3;break}}else{if((r11|0)>=64){r4=2313;break}_memcpy(r1+(r9+20)|0,r2,r3);r14=HEAP32[r10]+r3|0;HEAP32[r10]=r14;STACKTOP=r5;return}}while(0);L3304:do{if(r4==2313){r11=r1|0;r15=r6;r16=r8;r17=r1+4|0;r18=r1+8|0;r19=r1+12|0;r20=r1+16|0;r21=r2;r22=r3;r23=r9;while(1){_memcpy(r1+(r23+20)|0,r21,64-r23|0);r24=64-HEAP32[r10]|0;r25=r21+r24|0;r26=0;while(1){r27=r26<<2;HEAP32[r8+(r26<<2)>>2]=HEAPU8[(r27|1)+r1+20|0]<<16|HEAPU8[r1+(r27+20)|0]<<24|HEAPU8[(r27|2)+r1+20|0]<<8|HEAPU8[(r27|3)+r1+20|0];r27=r26+1|0;if((r27|0)==16){break}else{r26=r27}}_memcpy(r15,r16,64);r26=16;while(1){r27=HEAP32[(r26-8<<2>>2)+r7]^HEAP32[(r26-3<<2>>2)+r7]^HEAP32[(r26-14<<2>>2)+r7]^HEAP32[(r26-16<<2>>2)+r7];HEAP32[(r26<<2>>2)+r7]=r27<<1|r27>>>31;r27=r26+1|0;if((r27|0)==80){break}else{r26=r27}}r26=HEAP32[r11>>2];r27=HEAP32[r17>>2];r28=HEAP32[r18>>2];r29=HEAP32[r19>>2];r30=HEAP32[r20>>2];r31=0;r32=r30;r33=r29;r34=r28;r35=r27;r36=r26;while(1){r37=(r36<<5|r36>>>27)+r32+(r33&(r35^-1)|r34&r35)+HEAP32[(r31<<2>>2)+r7]+1518500249|0;r38=r35<<30|r35>>>2;r39=r31+1|0;if((r39|0)==20){r40=20;r41=r33;r42=r34;r43=r38;r44=r36;r45=r37;break}else{r31=r39;r32=r33;r33=r34;r34=r38;r35=r36;r36=r37}}while(1){r36=(r45<<5|r45>>>27)+r41+(r43^r44^r42)+HEAP32[(r40<<2>>2)+r7]+1859775393|0;r35=r44<<30|r44>>>2;r34=r40+1|0;if((r34|0)==40){r46=40;r47=r42;r48=r43;r49=r35;r50=r45;r51=r36;break}else{r40=r34;r41=r42;r42=r43;r43=r35;r44=r45;r45=r36}}while(1){r36=(r51<<5|r51>>>27)-1894007588+r47+((r48|r49)&r50|r48&r49)+HEAP32[(r46<<2>>2)+r7]|0;r35=r50<<30|r50>>>2;r34=r46+1|0;if((r34|0)==60){r52=60;r53=r48;r54=r49;r55=r35;r56=r51;r57=r36;break}else{r46=r34;r47=r48;r48=r49;r49=r35;r50=r51;r51=r36}}while(1){r58=(r57<<5|r57>>>27)-899497514+r53+(r55^r56^r54)+HEAP32[(r52<<2>>2)+r7]|0;r59=r56<<30|r56>>>2;r36=r52+1|0;if((r36|0)==80){break}else{r52=r36;r53=r54;r54=r55;r55=r59;r56=r57;r57=r58}}r36=r22-r24|0;HEAP32[r11>>2]=r58+r26|0;HEAP32[r17>>2]=r57+r27|0;HEAP32[r18>>2]=r59+r28|0;HEAP32[r19>>2]=r55+r29|0;HEAP32[r20>>2]=r54+r30|0;HEAP32[r10]=0;if((r36|0)>63){r21=r25;r22=r36;r23=0}else{r12=r25;r13=r36;break L3304}}}}while(0);_memcpy(r1+20|0,r12,r13);r14=r13;HEAP32[r10]=r14;STACKTOP=r5;return}function _SHA_Final(r1,r2){var r3,r4,r5,r6,r7,r8;r3=STACKTOP;STACKTOP=STACKTOP+64|0;r4=r3;r5=HEAP32[r1+84>>2];r6=((r5|0)>55?120:56)-r5|0;r5=HEAP32[r1+88>>2];r7=HEAP32[r1+92>>2];r8=r4|0;_memset(r8,0,r6);HEAP8[r8]=-128;_SHA_Bytes(r1,r8,r6);HEAP8[r8]=r5>>>21&255;HEAP8[r4+1|0]=r5>>>13&255;HEAP8[r4+2|0]=r5>>>5&255;HEAP8[r4+3|0]=(r7>>>29|r5<<3)&255;HEAP8[r4+4|0]=r7>>>21&255;HEAP8[r4+5|0]=r7>>>13&255;HEAP8[r4+6|0]=r7>>>5&255;HEAP8[r4+7|0]=r7<<3&255;_SHA_Bytes(r1,r8,8);r8=(r1|0)>>2;HEAP8[r2]=HEAP32[r8]>>>24&255;HEAP8[r2+1|0]=HEAP32[r8]>>>16&255;HEAP8[r2+2|0]=HEAP32[r8]>>>8&255;HEAP8[r2+3|0]=HEAP32[r8]&255;r8=(r1+4|0)>>2;HEAP8[r2+4|0]=HEAP32[r8]>>>24&255;HEAP8[r2+5|0]=HEAP32[r8]>>>16&255;HEAP8[r2+6|0]=HEAP32[r8]>>>8&255;HEAP8[r2+7|0]=HEAP32[r8]&255;r8=(r1+8|0)>>2;HEAP8[r2+8|0]=HEAP32[r8]>>>24&255;HEAP8[r2+9|0]=HEAP32[r8]>>>16&255;HEAP8[r2+10|0]=HEAP32[r8]>>>8&255;HEAP8[r2+11|0]=HEAP32[r8]&255;r8=(r1+12|0)>>2;HEAP8[r2+12|0]=HEAP32[r8]>>>24&255;HEAP8[r2+13|0]=HEAP32[r8]>>>16&255;HEAP8[r2+14|0]=HEAP32[r8]>>>8&255;HEAP8[r2+15|0]=HEAP32[r8]&255;r8=(r1+16|0)>>2;HEAP8[r2+16|0]=HEAP32[r8]>>>24&255;HEAP8[r2+17|0]=HEAP32[r8]>>>16&255;HEAP8[r2+18|0]=HEAP32[r8]>>>8&255;HEAP8[r2+19|0]=HEAP32[r8]&255;STACKTOP=r3;return}function _random_bits(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+96|0;r5=r4;if((r2|0)<=0){r6=0;r7=r2-1|0;r8=2<<r7;r9=r8-1|0;r10=r6&r9;STACKTOP=r4;return r10}r11=(r1+60|0)>>2;r12=r1|0;r13=r1+40|0;r14=r5|0;r15=r5+4|0;r16=r5+8|0;r17=r5+12|0;r18=r5+16|0;r19=r5+84|0;r20=r5+92|0;r21=r5+88|0;r22=0;r23=0;r24=HEAP32[r11];while(1){if((r24|0)>19){r25=0;while(1){r26=r1+r25|0;r27=HEAP8[r26];if(r27<<24>>24!=-1){r3=2335;break}HEAP8[r26]=0;r28=r25+1|0;if((r28|0)<20){r25=r28}else{break}}if(r3==2335){r3=0;HEAP8[r26]=r27+1&255}HEAP32[r14>>2]=1732584193;HEAP32[r15>>2]=-271733879;HEAP32[r16>>2]=-1732584194;HEAP32[r17>>2]=271733878;HEAP32[r18>>2]=-1009589776;HEAP32[r19>>2]=0;HEAP32[r20>>2]=0;HEAP32[r21>>2]=0;_SHA_Bytes(r5,r12,40);_SHA_Final(r5,r13);HEAP32[r11]=0;r29=0}else{r29=r24}r25=r29+1|0;HEAP32[r11]=r25;r28=HEAPU8[r1+(r29+40)|0]|r22<<8;r30=r23+8|0;if((r30|0)<(r2|0)){r22=r28;r23=r30;r24=r25}else{r6=r28;break}}r7=r2-1|0;r8=2<<r7;r9=r8-1|0;r10=r6&r9;STACKTOP=r4;return r10}function _random_new(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=STACKTOP;STACKTOP=STACKTOP+288|0;r4=r3,r5=r4>>2;r6=r3+96,r7=r6>>2;r8=r3+192,r9=r8>>2;r10=_malloc(64);if((r10|0)==0){_fatal(67728,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r9]=1732584193;HEAP32[r9+1]=-271733879;HEAP32[r9+2]=-1732584194;HEAP32[r9+3]=271733878;HEAP32[r9+4]=-1009589776;HEAP32[r9+21]=0;HEAP32[r9+23]=0;HEAP32[r9+22]=0;_SHA_Bytes(r8,r1,r2);_SHA_Final(r8,r10);HEAP32[r7]=1732584193;HEAP32[r7+1]=-271733879;HEAP32[r7+2]=-1732584194;HEAP32[r7+3]=271733878;HEAP32[r7+4]=-1009589776;HEAP32[r7+21]=0;HEAP32[r7+23]=0;HEAP32[r7+22]=0;_SHA_Bytes(r6,r10,20);_SHA_Final(r6,r10+20|0);HEAP32[r5]=1732584193;HEAP32[r5+1]=-271733879;HEAP32[r5+2]=-1732584194;HEAP32[r5+3]=271733878;HEAP32[r5+4]=-1009589776;HEAP32[r5+21]=0;HEAP32[r5+23]=0;HEAP32[r5+22]=0;_SHA_Bytes(r4,r10,40);_SHA_Final(r4,r10+40|0);HEAP32[r10+60>>2]=0;STACKTOP=r3;return r10}}function _malloc(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95;r2=0;do{if(r1>>>0<245){if(r1>>>0<11){r3=16}else{r3=r1+11&-8}r4=r3>>>3;r5=HEAP32[16961];r6=r5>>>(r4>>>0);if((r6&3|0)!=0){r7=(r6&1^1)+r4|0;r8=r7<<1;r9=(r8<<2)+67884|0;r10=(r8+2<<2)+67884|0;r8=HEAP32[r10>>2];r11=r8+8|0;r12=HEAP32[r11>>2];do{if((r9|0)==(r12|0)){HEAP32[16961]=r5&(1<<r7^-1)}else{if(r12>>>0<HEAP32[16965]>>>0){_abort()}r13=r12+12|0;if((HEAP32[r13>>2]|0)==(r8|0)){HEAP32[r13>>2]=r9;HEAP32[r10>>2]=r12;break}else{_abort()}}}while(0);r12=r7<<3;HEAP32[r8+4>>2]=r12|3;r10=r8+(r12|4)|0;HEAP32[r10>>2]=HEAP32[r10>>2]|1;r14=r11;return r14}if(r3>>>0<=HEAP32[16963]>>>0){r15=r3,r16=r15>>2;break}if((r6|0)!=0){r10=2<<r4;r12=r6<<r4&(r10|-r10);r10=(r12&-r12)-1|0;r12=r10>>>12&16;r9=r10>>>(r12>>>0);r10=r9>>>5&8;r13=r9>>>(r10>>>0);r9=r13>>>2&4;r17=r13>>>(r9>>>0);r13=r17>>>1&2;r18=r17>>>(r13>>>0);r17=r18>>>1&1;r19=(r10|r12|r9|r13|r17)+(r18>>>(r17>>>0))|0;r17=r19<<1;r18=(r17<<2)+67884|0;r13=(r17+2<<2)+67884|0;r17=HEAP32[r13>>2];r9=r17+8|0;r12=HEAP32[r9>>2];do{if((r18|0)==(r12|0)){HEAP32[16961]=r5&(1<<r19^-1)}else{if(r12>>>0<HEAP32[16965]>>>0){_abort()}r10=r12+12|0;if((HEAP32[r10>>2]|0)==(r17|0)){HEAP32[r10>>2]=r18;HEAP32[r13>>2]=r12;break}else{_abort()}}}while(0);r12=r19<<3;r13=r12-r3|0;HEAP32[r17+4>>2]=r3|3;r18=r17;r5=r18+r3|0;HEAP32[r18+(r3|4)>>2]=r13|1;HEAP32[r18+r12>>2]=r13;r12=HEAP32[16963];if((r12|0)!=0){r18=HEAP32[16966];r4=r12>>>3;r12=r4<<1;r6=(r12<<2)+67884|0;r11=HEAP32[16961];r8=1<<r4;do{if((r11&r8|0)==0){HEAP32[16961]=r11|r8;r20=r6;r21=(r12+2<<2)+67884|0}else{r4=(r12+2<<2)+67884|0;r7=HEAP32[r4>>2];if(r7>>>0>=HEAP32[16965]>>>0){r20=r7;r21=r4;break}_abort()}}while(0);HEAP32[r21>>2]=r18;HEAP32[r20+12>>2]=r18;HEAP32[r18+8>>2]=r20;HEAP32[r18+12>>2]=r6}HEAP32[16963]=r13;HEAP32[16966]=r5;r14=r9;return r14}r12=HEAP32[16962];if((r12|0)==0){r15=r3,r16=r15>>2;break}r8=(r12&-r12)-1|0;r12=r8>>>12&16;r11=r8>>>(r12>>>0);r8=r11>>>5&8;r17=r11>>>(r8>>>0);r11=r17>>>2&4;r19=r17>>>(r11>>>0);r17=r19>>>1&2;r4=r19>>>(r17>>>0);r19=r4>>>1&1;r7=HEAP32[((r8|r12|r11|r17|r19)+(r4>>>(r19>>>0))<<2)+68148>>2];r19=r7;r4=r7,r17=r4>>2;r11=(HEAP32[r7+4>>2]&-8)-r3|0;while(1){r7=HEAP32[r19+16>>2];if((r7|0)==0){r12=HEAP32[r19+20>>2];if((r12|0)==0){break}else{r22=r12}}else{r22=r7}r7=(HEAP32[r22+4>>2]&-8)-r3|0;r12=r7>>>0<r11>>>0;r19=r22;r4=r12?r22:r4,r17=r4>>2;r11=r12?r7:r11}r19=r4;r9=HEAP32[16965];if(r19>>>0<r9>>>0){_abort()}r5=r19+r3|0;r13=r5;if(r19>>>0>=r5>>>0){_abort()}r5=HEAP32[r17+6];r6=HEAP32[r17+3];L3524:do{if((r6|0)==(r4|0)){r18=r4+20|0;r7=HEAP32[r18>>2];do{if((r7|0)==0){r12=r4+16|0;r8=HEAP32[r12>>2];if((r8|0)==0){r23=0,r24=r23>>2;break L3524}else{r25=r8;r26=r12;break}}else{r25=r7;r26=r18}}while(0);while(1){r18=r25+20|0;r7=HEAP32[r18>>2];if((r7|0)!=0){r25=r7;r26=r18;continue}r18=r25+16|0;r7=HEAP32[r18>>2];if((r7|0)==0){break}else{r25=r7;r26=r18}}if(r26>>>0<r9>>>0){_abort()}else{HEAP32[r26>>2]=0;r23=r25,r24=r23>>2;break}}else{r18=HEAP32[r17+2];if(r18>>>0<r9>>>0){_abort()}r7=r18+12|0;if((HEAP32[r7>>2]|0)!=(r4|0)){_abort()}r12=r6+8|0;if((HEAP32[r12>>2]|0)==(r4|0)){HEAP32[r7>>2]=r6;HEAP32[r12>>2]=r18;r23=r6,r24=r23>>2;break}else{_abort()}}}while(0);L3546:do{if((r5|0)!=0){r6=r4+28|0;r9=(HEAP32[r6>>2]<<2)+68148|0;do{if((r4|0)==(HEAP32[r9>>2]|0)){HEAP32[r9>>2]=r23;if((r23|0)!=0){break}HEAP32[16962]=HEAP32[16962]&(1<<HEAP32[r6>>2]^-1);break L3546}else{if(r5>>>0<HEAP32[16965]>>>0){_abort()}r18=r5+16|0;if((HEAP32[r18>>2]|0)==(r4|0)){HEAP32[r18>>2]=r23}else{HEAP32[r5+20>>2]=r23}if((r23|0)==0){break L3546}}}while(0);if(r23>>>0<HEAP32[16965]>>>0){_abort()}HEAP32[r24+6]=r5;r6=HEAP32[r17+4];do{if((r6|0)!=0){if(r6>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r24+4]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);r6=HEAP32[r17+5];if((r6|0)==0){break}if(r6>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r24+5]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);if(r11>>>0<16){r5=r11+r3|0;HEAP32[r17+1]=r5|3;r6=r5+(r19+4)|0;HEAP32[r6>>2]=HEAP32[r6>>2]|1}else{HEAP32[r17+1]=r3|3;HEAP32[r19+(r3|4)>>2]=r11|1;HEAP32[r19+r11+r3>>2]=r11;r6=HEAP32[16963];if((r6|0)!=0){r5=HEAP32[16966];r9=r6>>>3;r6=r9<<1;r18=(r6<<2)+67884|0;r12=HEAP32[16961];r7=1<<r9;do{if((r12&r7|0)==0){HEAP32[16961]=r12|r7;r27=r18;r28=(r6+2<<2)+67884|0}else{r9=(r6+2<<2)+67884|0;r8=HEAP32[r9>>2];if(r8>>>0>=HEAP32[16965]>>>0){r27=r8;r28=r9;break}_abort()}}while(0);HEAP32[r28>>2]=r5;HEAP32[r27+12>>2]=r5;HEAP32[r5+8>>2]=r27;HEAP32[r5+12>>2]=r18}HEAP32[16963]=r11;HEAP32[16966]=r13}r6=r4+8|0;if((r6|0)==0){r15=r3,r16=r15>>2;break}else{r14=r6}return r14}else{if(r1>>>0>4294967231){r15=-1,r16=r15>>2;break}r6=r1+11|0;r7=r6&-8,r12=r7>>2;r19=HEAP32[16962];if((r19|0)==0){r15=r7,r16=r15>>2;break}r17=-r7|0;r9=r6>>>8;do{if((r9|0)==0){r29=0}else{if(r7>>>0>16777215){r29=31;break}r6=(r9+1048320|0)>>>16&8;r8=r9<<r6;r10=(r8+520192|0)>>>16&4;r30=r8<<r10;r8=(r30+245760|0)>>>16&2;r31=14-(r10|r6|r8)+(r30<<r8>>>15)|0;r29=r7>>>((r31+7|0)>>>0)&1|r31<<1}}while(0);r9=HEAP32[(r29<<2)+68148>>2];L3354:do{if((r9|0)==0){r32=0;r33=r17;r34=0}else{if((r29|0)==31){r35=0}else{r35=25-(r29>>>1)|0}r4=0;r13=r17;r11=r9,r18=r11>>2;r5=r7<<r35;r31=0;while(1){r8=HEAP32[r18+1]&-8;r30=r8-r7|0;if(r30>>>0<r13>>>0){if((r8|0)==(r7|0)){r32=r11;r33=r30;r34=r11;break L3354}else{r36=r11;r37=r30}}else{r36=r4;r37=r13}r30=HEAP32[r18+5];r8=HEAP32[((r5>>>31<<2)+16>>2)+r18];r6=(r30|0)==0|(r30|0)==(r8|0)?r31:r30;if((r8|0)==0){r32=r36;r33=r37;r34=r6;break L3354}else{r4=r36;r13=r37;r11=r8,r18=r11>>2;r5=r5<<1;r31=r6}}}}while(0);if((r34|0)==0&(r32|0)==0){r9=2<<r29;r17=r19&(r9|-r9);if((r17|0)==0){r15=r7,r16=r15>>2;break}r9=(r17&-r17)-1|0;r17=r9>>>12&16;r31=r9>>>(r17>>>0);r9=r31>>>5&8;r5=r31>>>(r9>>>0);r31=r5>>>2&4;r11=r5>>>(r31>>>0);r5=r11>>>1&2;r18=r11>>>(r5>>>0);r11=r18>>>1&1;r38=HEAP32[((r9|r17|r31|r5|r11)+(r18>>>(r11>>>0))<<2)+68148>>2]}else{r38=r34}L3369:do{if((r38|0)==0){r39=r33;r40=r32,r41=r40>>2}else{r11=r38,r18=r11>>2;r5=r33;r31=r32;while(1){r17=(HEAP32[r18+1]&-8)-r7|0;r9=r17>>>0<r5>>>0;r13=r9?r17:r5;r17=r9?r11:r31;r9=HEAP32[r18+4];if((r9|0)!=0){r11=r9,r18=r11>>2;r5=r13;r31=r17;continue}r9=HEAP32[r18+5];if((r9|0)==0){r39=r13;r40=r17,r41=r40>>2;break L3369}else{r11=r9,r18=r11>>2;r5=r13;r31=r17}}}}while(0);if((r40|0)==0){r15=r7,r16=r15>>2;break}if(r39>>>0>=(HEAP32[16963]-r7|0)>>>0){r15=r7,r16=r15>>2;break}r19=r40,r31=r19>>2;r5=HEAP32[16965];if(r19>>>0<r5>>>0){_abort()}r11=r19+r7|0;r18=r11;if(r19>>>0>=r11>>>0){_abort()}r17=HEAP32[r41+6];r13=HEAP32[r41+3];L3382:do{if((r13|0)==(r40|0)){r9=r40+20|0;r4=HEAP32[r9>>2];do{if((r4|0)==0){r6=r40+16|0;r8=HEAP32[r6>>2];if((r8|0)==0){r42=0,r43=r42>>2;break L3382}else{r44=r8;r45=r6;break}}else{r44=r4;r45=r9}}while(0);while(1){r9=r44+20|0;r4=HEAP32[r9>>2];if((r4|0)!=0){r44=r4;r45=r9;continue}r9=r44+16|0;r4=HEAP32[r9>>2];if((r4|0)==0){break}else{r44=r4;r45=r9}}if(r45>>>0<r5>>>0){_abort()}else{HEAP32[r45>>2]=0;r42=r44,r43=r42>>2;break}}else{r9=HEAP32[r41+2];if(r9>>>0<r5>>>0){_abort()}r4=r9+12|0;if((HEAP32[r4>>2]|0)!=(r40|0)){_abort()}r6=r13+8|0;if((HEAP32[r6>>2]|0)==(r40|0)){HEAP32[r4>>2]=r13;HEAP32[r6>>2]=r9;r42=r13,r43=r42>>2;break}else{_abort()}}}while(0);L3404:do{if((r17|0)!=0){r13=r40+28|0;r5=(HEAP32[r13>>2]<<2)+68148|0;do{if((r40|0)==(HEAP32[r5>>2]|0)){HEAP32[r5>>2]=r42;if((r42|0)!=0){break}HEAP32[16962]=HEAP32[16962]&(1<<HEAP32[r13>>2]^-1);break L3404}else{if(r17>>>0<HEAP32[16965]>>>0){_abort()}r9=r17+16|0;if((HEAP32[r9>>2]|0)==(r40|0)){HEAP32[r9>>2]=r42}else{HEAP32[r17+20>>2]=r42}if((r42|0)==0){break L3404}}}while(0);if(r42>>>0<HEAP32[16965]>>>0){_abort()}HEAP32[r43+6]=r17;r13=HEAP32[r41+4];do{if((r13|0)!=0){if(r13>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r43+4]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);r13=HEAP32[r41+5];if((r13|0)==0){break}if(r13>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r43+5]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);do{if(r39>>>0<16){r17=r39+r7|0;HEAP32[r41+1]=r17|3;r13=r17+(r19+4)|0;HEAP32[r13>>2]=HEAP32[r13>>2]|1}else{HEAP32[r41+1]=r7|3;HEAP32[((r7|4)>>2)+r31]=r39|1;HEAP32[(r39>>2)+r31+r12]=r39;r13=r39>>>3;if(r39>>>0<256){r17=r13<<1;r5=(r17<<2)+67884|0;r9=HEAP32[16961];r6=1<<r13;do{if((r9&r6|0)==0){HEAP32[16961]=r9|r6;r46=r5;r47=(r17+2<<2)+67884|0}else{r13=(r17+2<<2)+67884|0;r4=HEAP32[r13>>2];if(r4>>>0>=HEAP32[16965]>>>0){r46=r4;r47=r13;break}_abort()}}while(0);HEAP32[r47>>2]=r18;HEAP32[r46+12>>2]=r18;HEAP32[r12+(r31+2)]=r46;HEAP32[r12+(r31+3)]=r5;break}r17=r11;r6=r39>>>8;do{if((r6|0)==0){r48=0}else{if(r39>>>0>16777215){r48=31;break}r9=(r6+1048320|0)>>>16&8;r13=r6<<r9;r4=(r13+520192|0)>>>16&4;r8=r13<<r4;r13=(r8+245760|0)>>>16&2;r30=14-(r4|r9|r13)+(r8<<r13>>>15)|0;r48=r39>>>((r30+7|0)>>>0)&1|r30<<1}}while(0);r6=(r48<<2)+68148|0;HEAP32[r12+(r31+7)]=r48;HEAP32[r12+(r31+5)]=0;HEAP32[r12+(r31+4)]=0;r5=HEAP32[16962];r30=1<<r48;if((r5&r30|0)==0){HEAP32[16962]=r5|r30;HEAP32[r6>>2]=r17;HEAP32[r12+(r31+6)]=r6;HEAP32[r12+(r31+3)]=r17;HEAP32[r12+(r31+2)]=r17;break}if((r48|0)==31){r49=0}else{r49=25-(r48>>>1)|0}r30=r39<<r49;r5=HEAP32[r6>>2];while(1){if((HEAP32[r5+4>>2]&-8|0)==(r39|0)){break}r50=(r30>>>31<<2)+r5+16|0;r6=HEAP32[r50>>2];if((r6|0)==0){r2=2495;break}else{r30=r30<<1;r5=r6}}if(r2==2495){if(r50>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r50>>2]=r17;HEAP32[r12+(r31+6)]=r5;HEAP32[r12+(r31+3)]=r17;HEAP32[r12+(r31+2)]=r17;break}}r30=r5+8|0;r6=HEAP32[r30>>2];r13=HEAP32[16965];if(r5>>>0<r13>>>0){_abort()}if(r6>>>0<r13>>>0){_abort()}else{HEAP32[r6+12>>2]=r17;HEAP32[r30>>2]=r17;HEAP32[r12+(r31+2)]=r6;HEAP32[r12+(r31+3)]=r5;HEAP32[r12+(r31+6)]=0;break}}}while(0);r31=r40+8|0;if((r31|0)==0){r15=r7,r16=r15>>2;break}else{r14=r31}return r14}}while(0);r40=HEAP32[16963];if(r15>>>0<=r40>>>0){r50=r40-r15|0;r39=HEAP32[16966];if(r50>>>0>15){r49=r39;HEAP32[16966]=r49+r15|0;HEAP32[16963]=r50;HEAP32[(r49+4>>2)+r16]=r50|1;HEAP32[r49+r40>>2]=r50;HEAP32[r39+4>>2]=r15|3}else{HEAP32[16963]=0;HEAP32[16966]=0;HEAP32[r39+4>>2]=r40|3;r50=r40+(r39+4)|0;HEAP32[r50>>2]=HEAP32[r50>>2]|1}r14=r39+8|0;return r14}r39=HEAP32[16964];if(r15>>>0<r39>>>0){r50=r39-r15|0;HEAP32[16964]=r50;r39=HEAP32[16967];r40=r39;HEAP32[16967]=r40+r15|0;HEAP32[(r40+4>>2)+r16]=r50|1;HEAP32[r39+4>>2]=r15|3;r14=r39+8|0;return r14}do{if((HEAP32[16434]|0)==0){r39=_sysconf(8);if((r39-1&r39|0)==0){HEAP32[16436]=r39;HEAP32[16435]=r39;HEAP32[16437]=-1;HEAP32[16438]=2097152;HEAP32[16439]=0;HEAP32[17072]=0;r39=_time(0)&-16^1431655768;HEAP32[16434]=r39;break}else{_abort()}}}while(0);r39=r15+48|0;r50=HEAP32[16436];r40=r15+47|0;r49=r50+r40|0;r48=-r50|0;r50=r49&r48;if(r50>>>0<=r15>>>0){r14=0;return r14}r46=HEAP32[17071];do{if((r46|0)!=0){r47=HEAP32[17069];r41=r47+r50|0;if(r41>>>0<=r47>>>0|r41>>>0>r46>>>0){r14=0}else{break}return r14}}while(0);L3613:do{if((HEAP32[17072]&4|0)==0){r46=HEAP32[16967];L3615:do{if((r46|0)==0){r2=2525}else{r41=r46;r47=68292;while(1){r51=r47|0;r42=HEAP32[r51>>2];if(r42>>>0<=r41>>>0){r52=r47+4|0;if((r42+HEAP32[r52>>2]|0)>>>0>r41>>>0){break}}r42=HEAP32[r47+8>>2];if((r42|0)==0){r2=2525;break L3615}else{r47=r42}}if((r47|0)==0){r2=2525;break}r41=r49-HEAP32[16964]&r48;if(r41>>>0>=2147483647){r53=0;break}r5=_sbrk(r41);r17=(r5|0)==(HEAP32[r51>>2]+HEAP32[r52>>2]|0);r54=r17?r5:-1;r55=r17?r41:0;r56=r5;r57=r41;r2=2534;break}}while(0);do{if(r2==2525){r46=_sbrk(0);if((r46|0)==-1){r53=0;break}r7=r46;r41=HEAP32[16435];r5=r41-1|0;if((r5&r7|0)==0){r58=r50}else{r58=r50-r7+(r5+r7&-r41)|0}r41=HEAP32[17069];r7=r41+r58|0;if(!(r58>>>0>r15>>>0&r58>>>0<2147483647)){r53=0;break}r5=HEAP32[17071];if((r5|0)!=0){if(r7>>>0<=r41>>>0|r7>>>0>r5>>>0){r53=0;break}}r5=_sbrk(r58);r7=(r5|0)==(r46|0);r54=r7?r46:-1;r55=r7?r58:0;r56=r5;r57=r58;r2=2534;break}}while(0);L3635:do{if(r2==2534){r5=-r57|0;if((r54|0)!=-1){r59=r55,r60=r59>>2;r61=r54,r62=r61>>2;r2=2545;break L3613}do{if((r56|0)!=-1&r57>>>0<2147483647&r57>>>0<r39>>>0){r7=HEAP32[16436];r46=r40-r57+r7&-r7;if(r46>>>0>=2147483647){r63=r57;break}if((_sbrk(r46)|0)==-1){_sbrk(r5);r53=r55;break L3635}else{r63=r46+r57|0;break}}else{r63=r57}}while(0);if((r56|0)==-1){r53=r55}else{r59=r63,r60=r59>>2;r61=r56,r62=r61>>2;r2=2545;break L3613}}}while(0);HEAP32[17072]=HEAP32[17072]|4;r64=r53;r2=2542;break}else{r64=0;r2=2542}}while(0);do{if(r2==2542){if(r50>>>0>=2147483647){break}r53=_sbrk(r50);r56=_sbrk(0);if(!((r56|0)!=-1&(r53|0)!=-1&r53>>>0<r56>>>0)){break}r63=r56-r53|0;r56=r63>>>0>(r15+40|0)>>>0;r55=r56?r53:-1;if((r55|0)==-1){break}else{r59=r56?r63:r64,r60=r59>>2;r61=r55,r62=r61>>2;r2=2545;break}}}while(0);do{if(r2==2545){r64=HEAP32[17069]+r59|0;HEAP32[17069]=r64;if(r64>>>0>HEAP32[17070]>>>0){HEAP32[17070]=r64}r64=HEAP32[16967],r50=r64>>2;L3655:do{if((r64|0)==0){r55=HEAP32[16965];if((r55|0)==0|r61>>>0<r55>>>0){HEAP32[16965]=r61}HEAP32[17073]=r61;HEAP32[17074]=r59;HEAP32[17076]=0;HEAP32[16970]=HEAP32[16434];HEAP32[16969]=-1;r55=0;while(1){r63=r55<<1;r56=(r63<<2)+67884|0;HEAP32[(r63+3<<2)+67884>>2]=r56;HEAP32[(r63+2<<2)+67884>>2]=r56;r56=r55+1|0;if((r56|0)==32){break}else{r55=r56}}r55=r61+8|0;if((r55&7|0)==0){r65=0}else{r65=-r55&7}r55=r59-40-r65|0;HEAP32[16967]=r61+r65|0;HEAP32[16964]=r55;HEAP32[(r65+4>>2)+r62]=r55|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[16968]=HEAP32[16438]}else{r55=68292,r56=r55>>2;while(1){r66=HEAP32[r56];r67=r55+4|0;r68=HEAP32[r67>>2];if((r61|0)==(r66+r68|0)){r2=2557;break}r63=HEAP32[r56+2];if((r63|0)==0){break}else{r55=r63,r56=r55>>2}}do{if(r2==2557){if((HEAP32[r56+3]&8|0)!=0){break}r55=r64;if(!(r55>>>0>=r66>>>0&r55>>>0<r61>>>0)){break}HEAP32[r67>>2]=r68+r59|0;r55=HEAP32[16967];r63=HEAP32[16964]+r59|0;r53=r55;r57=r55+8|0;if((r57&7|0)==0){r69=0}else{r69=-r57&7}r57=r63-r69|0;HEAP32[16967]=r53+r69|0;HEAP32[16964]=r57;HEAP32[r69+(r53+4)>>2]=r57|1;HEAP32[r63+(r53+4)>>2]=40;HEAP32[16968]=HEAP32[16438];break L3655}}while(0);if(r61>>>0<HEAP32[16965]>>>0){HEAP32[16965]=r61}r56=r61+r59|0;r53=68292;while(1){r70=r53|0;if((HEAP32[r70>>2]|0)==(r56|0)){r2=2567;break}r63=HEAP32[r53+8>>2];if((r63|0)==0){break}else{r53=r63}}do{if(r2==2567){if((HEAP32[r53+12>>2]&8|0)!=0){break}HEAP32[r70>>2]=r61;r56=r53+4|0;HEAP32[r56>>2]=HEAP32[r56>>2]+r59|0;r56=r61+8|0;if((r56&7|0)==0){r71=0}else{r71=-r56&7}r56=r59+(r61+8)|0;if((r56&7|0)==0){r72=0,r73=r72>>2}else{r72=-r56&7,r73=r72>>2}r56=r61+r72+r59|0;r63=r56;r57=r71+r15|0,r55=r57>>2;r40=r61+r57|0;r57=r40;r39=r56-(r61+r71)-r15|0;HEAP32[(r71+4>>2)+r62]=r15|3;do{if((r63|0)==(HEAP32[16967]|0)){r54=HEAP32[16964]+r39|0;HEAP32[16964]=r54;HEAP32[16967]=r57;HEAP32[r55+(r62+1)]=r54|1}else{if((r63|0)==(HEAP32[16966]|0)){r54=HEAP32[16963]+r39|0;HEAP32[16963]=r54;HEAP32[16966]=r57;HEAP32[r55+(r62+1)]=r54|1;HEAP32[(r54>>2)+r62+r55]=r54;break}r54=r59+4|0;r58=HEAP32[(r54>>2)+r62+r73];if((r58&3|0)==1){r52=r58&-8;r51=r58>>>3;L3700:do{if(r58>>>0<256){r48=HEAP32[((r72|8)>>2)+r62+r60];r49=HEAP32[r73+(r62+(r60+3))];r5=(r51<<3)+67884|0;do{if((r48|0)!=(r5|0)){if(r48>>>0<HEAP32[16965]>>>0){_abort()}if((HEAP32[r48+12>>2]|0)==(r63|0)){break}_abort()}}while(0);if((r49|0)==(r48|0)){HEAP32[16961]=HEAP32[16961]&(1<<r51^-1);break}do{if((r49|0)==(r5|0)){r74=r49+8|0}else{if(r49>>>0<HEAP32[16965]>>>0){_abort()}r47=r49+8|0;if((HEAP32[r47>>2]|0)==(r63|0)){r74=r47;break}_abort()}}while(0);HEAP32[r48+12>>2]=r49;HEAP32[r74>>2]=r48}else{r5=r56;r47=HEAP32[((r72|24)>>2)+r62+r60];r46=HEAP32[r73+(r62+(r60+3))];L3721:do{if((r46|0)==(r5|0)){r7=r72|16;r41=r61+r54+r7|0;r17=HEAP32[r41>>2];do{if((r17|0)==0){r42=r61+r7+r59|0;r43=HEAP32[r42>>2];if((r43|0)==0){r75=0,r76=r75>>2;break L3721}else{r77=r43;r78=r42;break}}else{r77=r17;r78=r41}}while(0);while(1){r41=r77+20|0;r17=HEAP32[r41>>2];if((r17|0)!=0){r77=r17;r78=r41;continue}r41=r77+16|0;r17=HEAP32[r41>>2];if((r17|0)==0){break}else{r77=r17;r78=r41}}if(r78>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r78>>2]=0;r75=r77,r76=r75>>2;break}}else{r41=HEAP32[((r72|8)>>2)+r62+r60];if(r41>>>0<HEAP32[16965]>>>0){_abort()}r17=r41+12|0;if((HEAP32[r17>>2]|0)!=(r5|0)){_abort()}r7=r46+8|0;if((HEAP32[r7>>2]|0)==(r5|0)){HEAP32[r17>>2]=r46;HEAP32[r7>>2]=r41;r75=r46,r76=r75>>2;break}else{_abort()}}}while(0);if((r47|0)==0){break}r46=r72+(r61+(r59+28))|0;r48=(HEAP32[r46>>2]<<2)+68148|0;do{if((r5|0)==(HEAP32[r48>>2]|0)){HEAP32[r48>>2]=r75;if((r75|0)!=0){break}HEAP32[16962]=HEAP32[16962]&(1<<HEAP32[r46>>2]^-1);break L3700}else{if(r47>>>0<HEAP32[16965]>>>0){_abort()}r49=r47+16|0;if((HEAP32[r49>>2]|0)==(r5|0)){HEAP32[r49>>2]=r75}else{HEAP32[r47+20>>2]=r75}if((r75|0)==0){break L3700}}}while(0);if(r75>>>0<HEAP32[16965]>>>0){_abort()}HEAP32[r76+6]=r47;r5=r72|16;r46=HEAP32[(r5>>2)+r62+r60];do{if((r46|0)!=0){if(r46>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r76+4]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r46=HEAP32[(r54+r5>>2)+r62];if((r46|0)==0){break}if(r46>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r76+5]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r79=r61+(r52|r72)+r59|0;r80=r52+r39|0}else{r79=r63;r80=r39}r54=r79+4|0;HEAP32[r54>>2]=HEAP32[r54>>2]&-2;HEAP32[r55+(r62+1)]=r80|1;HEAP32[(r80>>2)+r62+r55]=r80;r54=r80>>>3;if(r80>>>0<256){r51=r54<<1;r58=(r51<<2)+67884|0;r46=HEAP32[16961];r47=1<<r54;do{if((r46&r47|0)==0){HEAP32[16961]=r46|r47;r81=r58;r82=(r51+2<<2)+67884|0}else{r54=(r51+2<<2)+67884|0;r48=HEAP32[r54>>2];if(r48>>>0>=HEAP32[16965]>>>0){r81=r48;r82=r54;break}_abort()}}while(0);HEAP32[r82>>2]=r57;HEAP32[r81+12>>2]=r57;HEAP32[r55+(r62+2)]=r81;HEAP32[r55+(r62+3)]=r58;break}r51=r40;r47=r80>>>8;do{if((r47|0)==0){r83=0}else{if(r80>>>0>16777215){r83=31;break}r46=(r47+1048320|0)>>>16&8;r52=r47<<r46;r54=(r52+520192|0)>>>16&4;r48=r52<<r54;r52=(r48+245760|0)>>>16&2;r49=14-(r54|r46|r52)+(r48<<r52>>>15)|0;r83=r80>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r83<<2)+68148|0;HEAP32[r55+(r62+7)]=r83;HEAP32[r55+(r62+5)]=0;HEAP32[r55+(r62+4)]=0;r58=HEAP32[16962];r49=1<<r83;if((r58&r49|0)==0){HEAP32[16962]=r58|r49;HEAP32[r47>>2]=r51;HEAP32[r55+(r62+6)]=r47;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}if((r83|0)==31){r84=0}else{r84=25-(r83>>>1)|0}r49=r80<<r84;r58=HEAP32[r47>>2];while(1){if((HEAP32[r58+4>>2]&-8|0)==(r80|0)){break}r85=(r49>>>31<<2)+r58+16|0;r47=HEAP32[r85>>2];if((r47|0)==0){r2=2640;break}else{r49=r49<<1;r58=r47}}if(r2==2640){if(r85>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r85>>2]=r51;HEAP32[r55+(r62+6)]=r58;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}}r49=r58+8|0;r47=HEAP32[r49>>2];r52=HEAP32[16965];if(r58>>>0<r52>>>0){_abort()}if(r47>>>0<r52>>>0){_abort()}else{HEAP32[r47+12>>2]=r51;HEAP32[r49>>2]=r51;HEAP32[r55+(r62+2)]=r47;HEAP32[r55+(r62+3)]=r58;HEAP32[r55+(r62+6)]=0;break}}}while(0);r14=r61+(r71|8)|0;return r14}}while(0);r53=r64;r55=68292,r40=r55>>2;while(1){r86=HEAP32[r40];if(r86>>>0<=r53>>>0){r87=HEAP32[r40+1];r88=r86+r87|0;if(r88>>>0>r53>>>0){break}}r55=HEAP32[r40+2],r40=r55>>2}r55=r86+(r87-39)|0;if((r55&7|0)==0){r89=0}else{r89=-r55&7}r55=r86+(r87-47)+r89|0;r40=r55>>>0<(r64+16|0)>>>0?r53:r55;r55=r40+8|0,r57=r55>>2;r39=r61+8|0;if((r39&7|0)==0){r90=0}else{r90=-r39&7}r39=r59-40-r90|0;HEAP32[16967]=r61+r90|0;HEAP32[16964]=r39;HEAP32[(r90+4>>2)+r62]=r39|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[16968]=HEAP32[16438];HEAP32[r40+4>>2]=27;HEAP32[r57]=HEAP32[17073];HEAP32[r57+1]=HEAP32[17074];HEAP32[r57+2]=HEAP32[17075];HEAP32[r57+3]=HEAP32[17076];HEAP32[17073]=r61;HEAP32[17074]=r59;HEAP32[17076]=0;HEAP32[17075]=r55;r55=r40+28|0;HEAP32[r55>>2]=7;L3819:do{if((r40+32|0)>>>0<r88>>>0){r57=r55;while(1){r39=r57+4|0;HEAP32[r39>>2]=7;if((r57+8|0)>>>0<r88>>>0){r57=r39}else{break L3819}}}}while(0);if((r40|0)==(r53|0)){break}r55=r40-r64|0;r57=r55+(r53+4)|0;HEAP32[r57>>2]=HEAP32[r57>>2]&-2;HEAP32[r50+1]=r55|1;HEAP32[r53+r55>>2]=r55;r57=r55>>>3;if(r55>>>0<256){r39=r57<<1;r63=(r39<<2)+67884|0;r56=HEAP32[16961];r47=1<<r57;do{if((r56&r47|0)==0){HEAP32[16961]=r56|r47;r91=r63;r92=(r39+2<<2)+67884|0}else{r57=(r39+2<<2)+67884|0;r49=HEAP32[r57>>2];if(r49>>>0>=HEAP32[16965]>>>0){r91=r49;r92=r57;break}_abort()}}while(0);HEAP32[r92>>2]=r64;HEAP32[r91+12>>2]=r64;HEAP32[r50+2]=r91;HEAP32[r50+3]=r63;break}r39=r64;r47=r55>>>8;do{if((r47|0)==0){r93=0}else{if(r55>>>0>16777215){r93=31;break}r56=(r47+1048320|0)>>>16&8;r53=r47<<r56;r40=(r53+520192|0)>>>16&4;r57=r53<<r40;r53=(r57+245760|0)>>>16&2;r49=14-(r40|r56|r53)+(r57<<r53>>>15)|0;r93=r55>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r93<<2)+68148|0;HEAP32[r50+7]=r93;HEAP32[r50+5]=0;HEAP32[r50+4]=0;r63=HEAP32[16962];r49=1<<r93;if((r63&r49|0)==0){HEAP32[16962]=r63|r49;HEAP32[r47>>2]=r39;HEAP32[r50+6]=r47;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}if((r93|0)==31){r94=0}else{r94=25-(r93>>>1)|0}r49=r55<<r94;r63=HEAP32[r47>>2];while(1){if((HEAP32[r63+4>>2]&-8|0)==(r55|0)){break}r95=(r49>>>31<<2)+r63+16|0;r47=HEAP32[r95>>2];if((r47|0)==0){r2=2675;break}else{r49=r49<<1;r63=r47}}if(r2==2675){if(r95>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r95>>2]=r39;HEAP32[r50+6]=r63;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}}r49=r63+8|0;r55=HEAP32[r49>>2];r47=HEAP32[16965];if(r63>>>0<r47>>>0){_abort()}if(r55>>>0<r47>>>0){_abort()}else{HEAP32[r55+12>>2]=r39;HEAP32[r49>>2]=r39;HEAP32[r50+2]=r55;HEAP32[r50+3]=r63;HEAP32[r50+6]=0;break}}}while(0);r50=HEAP32[16964];if(r50>>>0<=r15>>>0){break}r64=r50-r15|0;HEAP32[16964]=r64;r50=HEAP32[16967];r55=r50;HEAP32[16967]=r55+r15|0;HEAP32[(r55+4>>2)+r16]=r64|1;HEAP32[r50+4>>2]=r15|3;r14=r50+8|0;return r14}}while(0);r15=___errno_location();HEAP32[r15>>2]=12;r14=0;return r14}function _free(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r2=r1>>2;r3=0;if((r1|0)==0){return}r4=r1-8|0;r5=r4;r6=HEAP32[16965];if(r4>>>0<r6>>>0){_abort()}r7=HEAP32[r1-4>>2];r8=r7&3;if((r8|0)==1){_abort()}r9=r7&-8,r10=r9>>2;r11=r1+(r9-8)|0;r12=r11;L3872:do{if((r7&1|0)==0){r13=HEAP32[r4>>2];if((r8|0)==0){return}r14=-8-r13|0,r15=r14>>2;r16=r1+r14|0;r17=r16;r18=r13+r9|0;if(r16>>>0<r6>>>0){_abort()}if((r17|0)==(HEAP32[16966]|0)){r19=(r1+(r9-4)|0)>>2;if((HEAP32[r19]&3|0)!=3){r20=r17,r21=r20>>2;r22=r18;break}HEAP32[16963]=r18;HEAP32[r19]=HEAP32[r19]&-2;HEAP32[r15+(r2+1)]=r18|1;HEAP32[r11>>2]=r18;return}r19=r13>>>3;if(r13>>>0<256){r13=HEAP32[r15+(r2+2)];r23=HEAP32[r15+(r2+3)];r24=(r19<<3)+67884|0;do{if((r13|0)!=(r24|0)){if(r13>>>0<r6>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r17|0)){break}_abort()}}while(0);if((r23|0)==(r13|0)){HEAP32[16961]=HEAP32[16961]&(1<<r19^-1);r20=r17,r21=r20>>2;r22=r18;break}do{if((r23|0)==(r24|0)){r25=r23+8|0}else{if(r23>>>0<r6>>>0){_abort()}r26=r23+8|0;if((HEAP32[r26>>2]|0)==(r17|0)){r25=r26;break}_abort()}}while(0);HEAP32[r13+12>>2]=r23;HEAP32[r25>>2]=r13;r20=r17,r21=r20>>2;r22=r18;break}r24=r16;r19=HEAP32[r15+(r2+6)];r26=HEAP32[r15+(r2+3)];L3906:do{if((r26|0)==(r24|0)){r27=r14+(r1+20)|0;r28=HEAP32[r27>>2];do{if((r28|0)==0){r29=r14+(r1+16)|0;r30=HEAP32[r29>>2];if((r30|0)==0){r31=0,r32=r31>>2;break L3906}else{r33=r30;r34=r29;break}}else{r33=r28;r34=r27}}while(0);while(1){r27=r33+20|0;r28=HEAP32[r27>>2];if((r28|0)!=0){r33=r28;r34=r27;continue}r27=r33+16|0;r28=HEAP32[r27>>2];if((r28|0)==0){break}else{r33=r28;r34=r27}}if(r34>>>0<r6>>>0){_abort()}else{HEAP32[r34>>2]=0;r31=r33,r32=r31>>2;break}}else{r27=HEAP32[r15+(r2+2)];if(r27>>>0<r6>>>0){_abort()}r28=r27+12|0;if((HEAP32[r28>>2]|0)!=(r24|0)){_abort()}r29=r26+8|0;if((HEAP32[r29>>2]|0)==(r24|0)){HEAP32[r28>>2]=r26;HEAP32[r29>>2]=r27;r31=r26,r32=r31>>2;break}else{_abort()}}}while(0);if((r19|0)==0){r20=r17,r21=r20>>2;r22=r18;break}r26=r14+(r1+28)|0;r16=(HEAP32[r26>>2]<<2)+68148|0;do{if((r24|0)==(HEAP32[r16>>2]|0)){HEAP32[r16>>2]=r31;if((r31|0)!=0){break}HEAP32[16962]=HEAP32[16962]&(1<<HEAP32[r26>>2]^-1);r20=r17,r21=r20>>2;r22=r18;break L3872}else{if(r19>>>0<HEAP32[16965]>>>0){_abort()}r13=r19+16|0;if((HEAP32[r13>>2]|0)==(r24|0)){HEAP32[r13>>2]=r31}else{HEAP32[r19+20>>2]=r31}if((r31|0)==0){r20=r17,r21=r20>>2;r22=r18;break L3872}}}while(0);if(r31>>>0<HEAP32[16965]>>>0){_abort()}HEAP32[r32+6]=r19;r24=HEAP32[r15+(r2+4)];do{if((r24|0)!=0){if(r24>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r32+4]=r24;HEAP32[r24+24>>2]=r31;break}}}while(0);r24=HEAP32[r15+(r2+5)];if((r24|0)==0){r20=r17,r21=r20>>2;r22=r18;break}if(r24>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r32+5]=r24;HEAP32[r24+24>>2]=r31;r20=r17,r21=r20>>2;r22=r18;break}}else{r20=r5,r21=r20>>2;r22=r9}}while(0);r5=r20,r31=r5>>2;if(r5>>>0>=r11>>>0){_abort()}r5=r1+(r9-4)|0;r32=HEAP32[r5>>2];if((r32&1|0)==0){_abort()}do{if((r32&2|0)==0){if((r12|0)==(HEAP32[16967]|0)){r6=HEAP32[16964]+r22|0;HEAP32[16964]=r6;HEAP32[16967]=r20;HEAP32[r21+1]=r6|1;if((r20|0)==(HEAP32[16966]|0)){HEAP32[16966]=0;HEAP32[16963]=0}if(r6>>>0<=HEAP32[16968]>>>0){return}_sys_trim(0);return}if((r12|0)==(HEAP32[16966]|0)){r6=HEAP32[16963]+r22|0;HEAP32[16963]=r6;HEAP32[16966]=r20;HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;return}r6=(r32&-8)+r22|0;r33=r32>>>3;L3978:do{if(r32>>>0<256){r34=HEAP32[r2+r10];r25=HEAP32[((r9|4)>>2)+r2];r8=(r33<<3)+67884|0;do{if((r34|0)!=(r8|0)){if(r34>>>0<HEAP32[16965]>>>0){_abort()}if((HEAP32[r34+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r25|0)==(r34|0)){HEAP32[16961]=HEAP32[16961]&(1<<r33^-1);break}do{if((r25|0)==(r8|0)){r35=r25+8|0}else{if(r25>>>0<HEAP32[16965]>>>0){_abort()}r4=r25+8|0;if((HEAP32[r4>>2]|0)==(r12|0)){r35=r4;break}_abort()}}while(0);HEAP32[r34+12>>2]=r25;HEAP32[r35>>2]=r34}else{r8=r11;r4=HEAP32[r10+(r2+4)];r7=HEAP32[((r9|4)>>2)+r2];L3999:do{if((r7|0)==(r8|0)){r24=r9+(r1+12)|0;r19=HEAP32[r24>>2];do{if((r19|0)==0){r26=r9+(r1+8)|0;r16=HEAP32[r26>>2];if((r16|0)==0){r36=0,r37=r36>>2;break L3999}else{r38=r16;r39=r26;break}}else{r38=r19;r39=r24}}while(0);while(1){r24=r38+20|0;r19=HEAP32[r24>>2];if((r19|0)!=0){r38=r19;r39=r24;continue}r24=r38+16|0;r19=HEAP32[r24>>2];if((r19|0)==0){break}else{r38=r19;r39=r24}}if(r39>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r39>>2]=0;r36=r38,r37=r36>>2;break}}else{r24=HEAP32[r2+r10];if(r24>>>0<HEAP32[16965]>>>0){_abort()}r19=r24+12|0;if((HEAP32[r19>>2]|0)!=(r8|0)){_abort()}r26=r7+8|0;if((HEAP32[r26>>2]|0)==(r8|0)){HEAP32[r19>>2]=r7;HEAP32[r26>>2]=r24;r36=r7,r37=r36>>2;break}else{_abort()}}}while(0);if((r4|0)==0){break}r7=r9+(r1+20)|0;r34=(HEAP32[r7>>2]<<2)+68148|0;do{if((r8|0)==(HEAP32[r34>>2]|0)){HEAP32[r34>>2]=r36;if((r36|0)!=0){break}HEAP32[16962]=HEAP32[16962]&(1<<HEAP32[r7>>2]^-1);break L3978}else{if(r4>>>0<HEAP32[16965]>>>0){_abort()}r25=r4+16|0;if((HEAP32[r25>>2]|0)==(r8|0)){HEAP32[r25>>2]=r36}else{HEAP32[r4+20>>2]=r36}if((r36|0)==0){break L3978}}}while(0);if(r36>>>0<HEAP32[16965]>>>0){_abort()}HEAP32[r37+6]=r4;r8=HEAP32[r10+(r2+2)];do{if((r8|0)!=0){if(r8>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r37+4]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);r8=HEAP32[r10+(r2+3)];if((r8|0)==0){break}if(r8>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r37+5]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;if((r20|0)!=(HEAP32[16966]|0)){r40=r6;break}HEAP32[16963]=r6;return}else{HEAP32[r5>>2]=r32&-2;HEAP32[r21+1]=r22|1;HEAP32[(r22>>2)+r31]=r22;r40=r22}}while(0);r22=r40>>>3;if(r40>>>0<256){r31=r22<<1;r32=(r31<<2)+67884|0;r5=HEAP32[16961];r36=1<<r22;do{if((r5&r36|0)==0){HEAP32[16961]=r5|r36;r41=r32;r42=(r31+2<<2)+67884|0}else{r22=(r31+2<<2)+67884|0;r37=HEAP32[r22>>2];if(r37>>>0>=HEAP32[16965]>>>0){r41=r37;r42=r22;break}_abort()}}while(0);HEAP32[r42>>2]=r20;HEAP32[r41+12>>2]=r20;HEAP32[r21+2]=r41;HEAP32[r21+3]=r32;return}r32=r20;r41=r40>>>8;do{if((r41|0)==0){r43=0}else{if(r40>>>0>16777215){r43=31;break}r42=(r41+1048320|0)>>>16&8;r31=r41<<r42;r36=(r31+520192|0)>>>16&4;r5=r31<<r36;r31=(r5+245760|0)>>>16&2;r22=14-(r36|r42|r31)+(r5<<r31>>>15)|0;r43=r40>>>((r22+7|0)>>>0)&1|r22<<1}}while(0);r41=(r43<<2)+68148|0;HEAP32[r21+7]=r43;HEAP32[r21+5]=0;HEAP32[r21+4]=0;r22=HEAP32[16962];r31=1<<r43;do{if((r22&r31|0)==0){HEAP32[16962]=r22|r31;HEAP32[r41>>2]=r32;HEAP32[r21+6]=r41;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20}else{if((r43|0)==31){r44=0}else{r44=25-(r43>>>1)|0}r5=r40<<r44;r42=HEAP32[r41>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r40|0)){break}r45=(r5>>>31<<2)+r42+16|0;r36=HEAP32[r45>>2];if((r36|0)==0){r3=2854;break}else{r5=r5<<1;r42=r36}}if(r3==2854){if(r45>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r45>>2]=r32;HEAP32[r21+6]=r42;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20;break}}r5=r42+8|0;r6=HEAP32[r5>>2];r36=HEAP32[16965];if(r42>>>0<r36>>>0){_abort()}if(r6>>>0<r36>>>0){_abort()}else{HEAP32[r6+12>>2]=r32;HEAP32[r5>>2]=r32;HEAP32[r21+2]=r6;HEAP32[r21+3]=r42;HEAP32[r21+6]=0;break}}}while(0);r21=HEAP32[16969]-1|0;HEAP32[16969]=r21;if((r21|0)==0){r46=68300}else{return}while(1){r21=HEAP32[r46>>2];if((r21|0)==0){break}else{r46=r21+8|0}}HEAP32[16969]=-1;return}function _realloc(r1,r2){var r3,r4,r5,r6;if((r1|0)==0){r3=_malloc(r2);return r3}if(r2>>>0>4294967231){r4=___errno_location();HEAP32[r4>>2]=12;r3=0;return r3}if(r2>>>0<11){r5=16}else{r5=r2+11&-8}r4=_try_realloc_chunk(r1-8|0,r5);if((r4|0)!=0){r3=r4+8|0;return r3}r4=_malloc(r2);if((r4|0)==0){r3=0;return r3}r5=HEAP32[r1-4>>2];r6=(r5&-8)-((r5&3|0)==0?8:4)|0;_memcpy(r4,r1,r6>>>0<r2>>>0?r6:r2);_free(r1);r3=r4;return r3}function _sys_trim(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;do{if((HEAP32[16434]|0)==0){r2=_sysconf(8);if((r2-1&r2|0)==0){HEAP32[16436]=r2;HEAP32[16435]=r2;HEAP32[16437]=-1;HEAP32[16438]=2097152;HEAP32[16439]=0;HEAP32[17072]=0;r2=_time(0)&-16^1431655768;HEAP32[16434]=r2;break}else{_abort()}}}while(0);if(r1>>>0>=4294967232){r3=0;r4=r3&1;return r4}r2=HEAP32[16967];if((r2|0)==0){r3=0;r4=r3&1;return r4}r5=HEAP32[16964];do{if(r5>>>0>(r1+40|0)>>>0){r6=HEAP32[16436];r7=Math.imul(Math.floor(((-40-r1-1+r5+r6|0)>>>0)/(r6>>>0))-1|0,r6);r8=r2;r9=68292,r10=r9>>2;while(1){r11=HEAP32[r10];if(r11>>>0<=r8>>>0){if((r11+HEAP32[r10+1]|0)>>>0>r8>>>0){r12=r9;break}}r11=HEAP32[r10+2];if((r11|0)==0){r12=0;break}else{r9=r11,r10=r9>>2}}if((HEAP32[r12+12>>2]&8|0)!=0){break}r9=_sbrk(0);r10=(r12+4|0)>>2;if((r9|0)!=(HEAP32[r12>>2]+HEAP32[r10]|0)){break}r8=_sbrk(-(r7>>>0>2147483646?-2147483648-r6|0:r7)|0);r11=_sbrk(0);if(!((r8|0)!=-1&r11>>>0<r9>>>0)){break}r8=r9-r11|0;if((r9|0)==(r11|0)){break}HEAP32[r10]=HEAP32[r10]-r8|0;HEAP32[17069]=HEAP32[17069]-r8|0;r10=HEAP32[16967];r13=HEAP32[16964]-r8|0;r8=r10;r14=r10+8|0;if((r14&7|0)==0){r15=0}else{r15=-r14&7}r14=r13-r15|0;HEAP32[16967]=r8+r15|0;HEAP32[16964]=r14;HEAP32[r15+(r8+4)>>2]=r14|1;HEAP32[r13+(r8+4)>>2]=40;HEAP32[16968]=HEAP32[16438];r3=(r9|0)!=(r11|0);r4=r3&1;return r4}}while(0);if(HEAP32[16964]>>>0<=HEAP32[16968]>>>0){r3=0;r4=r3&1;return r4}HEAP32[16968]=-1;r3=0;r4=r3&1;return r4}function _try_realloc_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29;r3=(r1+4|0)>>2;r4=HEAP32[r3];r5=r4&-8,r6=r5>>2;r7=r1,r8=r7>>2;r9=r7+r5|0;r10=r9;r11=HEAP32[16965];if(r7>>>0<r11>>>0){_abort()}r12=r4&3;if(!((r12|0)!=1&r7>>>0<r9>>>0)){_abort()}r13=(r7+(r5|4)|0)>>2;r14=HEAP32[r13];if((r14&1|0)==0){_abort()}if((r12|0)==0){if(r2>>>0<256){r15=0;return r15}do{if(r5>>>0>=(r2+4|0)>>>0){if((r5-r2|0)>>>0>HEAP32[16436]<<1>>>0){break}else{r15=r1}return r15}}while(0);r15=0;return r15}if(r5>>>0>=r2>>>0){r12=r5-r2|0;if(r12>>>0<=15){r15=r1;return r15}HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|3;HEAP32[r13]=HEAP32[r13]|1;_dispose_chunk(r7+r2|0,r12);r15=r1;return r15}if((r10|0)==(HEAP32[16967]|0)){r12=HEAP32[16964]+r5|0;if(r12>>>0<=r2>>>0){r15=0;return r15}r13=r12-r2|0;HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r13|1;HEAP32[16967]=r7+r2|0;HEAP32[16964]=r13;r15=r1;return r15}if((r10|0)==(HEAP32[16966]|0)){r13=HEAP32[16963]+r5|0;if(r13>>>0<r2>>>0){r15=0;return r15}r12=r13-r2|0;if(r12>>>0>15){HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|1;HEAP32[(r13>>2)+r8]=r12;r16=r13+(r7+4)|0;HEAP32[r16>>2]=HEAP32[r16>>2]&-2;r17=r7+r2|0;r18=r12}else{HEAP32[r3]=r4&1|r13|2;r4=r13+(r7+4)|0;HEAP32[r4>>2]=HEAP32[r4>>2]|1;r17=0;r18=0}HEAP32[16963]=r18;HEAP32[16966]=r17;r15=r1;return r15}if((r14&2|0)!=0){r15=0;return r15}r17=(r14&-8)+r5|0;if(r17>>>0<r2>>>0){r15=0;return r15}r18=r17-r2|0;r4=r14>>>3;L4198:do{if(r14>>>0<256){r13=HEAP32[r6+(r8+2)];r12=HEAP32[r6+(r8+3)];r16=(r4<<3)+67884|0;do{if((r13|0)!=(r16|0)){if(r13>>>0<r11>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r10|0)){break}_abort()}}while(0);if((r12|0)==(r13|0)){HEAP32[16961]=HEAP32[16961]&(1<<r4^-1);break}do{if((r12|0)==(r16|0)){r19=r12+8|0}else{if(r12>>>0<r11>>>0){_abort()}r20=r12+8|0;if((HEAP32[r20>>2]|0)==(r10|0)){r19=r20;break}_abort()}}while(0);HEAP32[r13+12>>2]=r12;HEAP32[r19>>2]=r13}else{r16=r9;r20=HEAP32[r6+(r8+6)];r21=HEAP32[r6+(r8+3)];L4219:do{if((r21|0)==(r16|0)){r22=r5+(r7+20)|0;r23=HEAP32[r22>>2];do{if((r23|0)==0){r24=r5+(r7+16)|0;r25=HEAP32[r24>>2];if((r25|0)==0){r26=0,r27=r26>>2;break L4219}else{r28=r25;r29=r24;break}}else{r28=r23;r29=r22}}while(0);while(1){r22=r28+20|0;r23=HEAP32[r22>>2];if((r23|0)!=0){r28=r23;r29=r22;continue}r22=r28+16|0;r23=HEAP32[r22>>2];if((r23|0)==0){break}else{r28=r23;r29=r22}}if(r29>>>0<r11>>>0){_abort()}else{HEAP32[r29>>2]=0;r26=r28,r27=r26>>2;break}}else{r22=HEAP32[r6+(r8+2)];if(r22>>>0<r11>>>0){_abort()}r23=r22+12|0;if((HEAP32[r23>>2]|0)!=(r16|0)){_abort()}r24=r21+8|0;if((HEAP32[r24>>2]|0)==(r16|0)){HEAP32[r23>>2]=r21;HEAP32[r24>>2]=r22;r26=r21,r27=r26>>2;break}else{_abort()}}}while(0);if((r20|0)==0){break}r21=r5+(r7+28)|0;r13=(HEAP32[r21>>2]<<2)+68148|0;do{if((r16|0)==(HEAP32[r13>>2]|0)){HEAP32[r13>>2]=r26;if((r26|0)!=0){break}HEAP32[16962]=HEAP32[16962]&(1<<HEAP32[r21>>2]^-1);break L4198}else{if(r20>>>0<HEAP32[16965]>>>0){_abort()}r12=r20+16|0;if((HEAP32[r12>>2]|0)==(r16|0)){HEAP32[r12>>2]=r26}else{HEAP32[r20+20>>2]=r26}if((r26|0)==0){break L4198}}}while(0);if(r26>>>0<HEAP32[16965]>>>0){_abort()}HEAP32[r27+6]=r20;r16=HEAP32[r6+(r8+4)];do{if((r16|0)!=0){if(r16>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r27+4]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);r16=HEAP32[r6+(r8+5)];if((r16|0)==0){break}if(r16>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r27+5]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);if(r18>>>0<16){HEAP32[r3]=r17|HEAP32[r3]&1|2;r26=r7+(r17|4)|0;HEAP32[r26>>2]=HEAP32[r26>>2]|1;r15=r1;return r15}else{HEAP32[r3]=HEAP32[r3]&1|r2|2;HEAP32[(r2+4>>2)+r8]=r18|3;r8=r7+(r17|4)|0;HEAP32[r8>>2]=HEAP32[r8>>2]|1;_dispose_chunk(r7+r2|0,r18);r15=r1;return r15}}function _dispose_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43;r3=r2>>2;r4=0;r5=r1,r6=r5>>2;r7=r5+r2|0;r8=r7;r9=HEAP32[r1+4>>2];L4274:do{if((r9&1|0)==0){r10=HEAP32[r1>>2];if((r9&3|0)==0){return}r11=r5+ -r10|0;r12=r11;r13=r10+r2|0;r14=HEAP32[16965];if(r11>>>0<r14>>>0){_abort()}if((r12|0)==(HEAP32[16966]|0)){r15=(r2+(r5+4)|0)>>2;if((HEAP32[r15]&3|0)!=3){r16=r12,r17=r16>>2;r18=r13;break}HEAP32[16963]=r13;HEAP32[r15]=HEAP32[r15]&-2;HEAP32[(4-r10>>2)+r6]=r13|1;HEAP32[r7>>2]=r13;return}r15=r10>>>3;if(r10>>>0<256){r19=HEAP32[(8-r10>>2)+r6];r20=HEAP32[(12-r10>>2)+r6];r21=(r15<<3)+67884|0;do{if((r19|0)!=(r21|0)){if(r19>>>0<r14>>>0){_abort()}if((HEAP32[r19+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r20|0)==(r19|0)){HEAP32[16961]=HEAP32[16961]&(1<<r15^-1);r16=r12,r17=r16>>2;r18=r13;break}do{if((r20|0)==(r21|0)){r22=r20+8|0}else{if(r20>>>0<r14>>>0){_abort()}r23=r20+8|0;if((HEAP32[r23>>2]|0)==(r12|0)){r22=r23;break}_abort()}}while(0);HEAP32[r19+12>>2]=r20;HEAP32[r22>>2]=r19;r16=r12,r17=r16>>2;r18=r13;break}r21=r11;r15=HEAP32[(24-r10>>2)+r6];r23=HEAP32[(12-r10>>2)+r6];L4308:do{if((r23|0)==(r21|0)){r24=16-r10|0;r25=r24+(r5+4)|0;r26=HEAP32[r25>>2];do{if((r26|0)==0){r27=r5+r24|0;r28=HEAP32[r27>>2];if((r28|0)==0){r29=0,r30=r29>>2;break L4308}else{r31=r28;r32=r27;break}}else{r31=r26;r32=r25}}while(0);while(1){r25=r31+20|0;r26=HEAP32[r25>>2];if((r26|0)!=0){r31=r26;r32=r25;continue}r25=r31+16|0;r26=HEAP32[r25>>2];if((r26|0)==0){break}else{r31=r26;r32=r25}}if(r32>>>0<r14>>>0){_abort()}else{HEAP32[r32>>2]=0;r29=r31,r30=r29>>2;break}}else{r25=HEAP32[(8-r10>>2)+r6];if(r25>>>0<r14>>>0){_abort()}r26=r25+12|0;if((HEAP32[r26>>2]|0)!=(r21|0)){_abort()}r24=r23+8|0;if((HEAP32[r24>>2]|0)==(r21|0)){HEAP32[r26>>2]=r23;HEAP32[r24>>2]=r25;r29=r23,r30=r29>>2;break}else{_abort()}}}while(0);if((r15|0)==0){r16=r12,r17=r16>>2;r18=r13;break}r23=r5+(28-r10)|0;r14=(HEAP32[r23>>2]<<2)+68148|0;do{if((r21|0)==(HEAP32[r14>>2]|0)){HEAP32[r14>>2]=r29;if((r29|0)!=0){break}HEAP32[16962]=HEAP32[16962]&(1<<HEAP32[r23>>2]^-1);r16=r12,r17=r16>>2;r18=r13;break L4274}else{if(r15>>>0<HEAP32[16965]>>>0){_abort()}r11=r15+16|0;if((HEAP32[r11>>2]|0)==(r21|0)){HEAP32[r11>>2]=r29}else{HEAP32[r15+20>>2]=r29}if((r29|0)==0){r16=r12,r17=r16>>2;r18=r13;break L4274}}}while(0);if(r29>>>0<HEAP32[16965]>>>0){_abort()}HEAP32[r30+6]=r15;r21=16-r10|0;r23=HEAP32[(r21>>2)+r6];do{if((r23|0)!=0){if(r23>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r30+4]=r23;HEAP32[r23+24>>2]=r29;break}}}while(0);r23=HEAP32[(r21+4>>2)+r6];if((r23|0)==0){r16=r12,r17=r16>>2;r18=r13;break}if(r23>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r30+5]=r23;HEAP32[r23+24>>2]=r29;r16=r12,r17=r16>>2;r18=r13;break}}else{r16=r1,r17=r16>>2;r18=r2}}while(0);r1=HEAP32[16965];if(r7>>>0<r1>>>0){_abort()}r29=r2+(r5+4)|0;r30=HEAP32[r29>>2];do{if((r30&2|0)==0){if((r8|0)==(HEAP32[16967]|0)){r31=HEAP32[16964]+r18|0;HEAP32[16964]=r31;HEAP32[16967]=r16;HEAP32[r17+1]=r31|1;if((r16|0)!=(HEAP32[16966]|0)){return}HEAP32[16966]=0;HEAP32[16963]=0;return}if((r8|0)==(HEAP32[16966]|0)){r31=HEAP32[16963]+r18|0;HEAP32[16963]=r31;HEAP32[16966]=r16;HEAP32[r17+1]=r31|1;HEAP32[(r31>>2)+r17]=r31;return}r31=(r30&-8)+r18|0;r32=r30>>>3;L4373:do{if(r30>>>0<256){r22=HEAP32[r3+(r6+2)];r9=HEAP32[r3+(r6+3)];r23=(r32<<3)+67884|0;do{if((r22|0)!=(r23|0)){if(r22>>>0<r1>>>0){_abort()}if((HEAP32[r22+12>>2]|0)==(r8|0)){break}_abort()}}while(0);if((r9|0)==(r22|0)){HEAP32[16961]=HEAP32[16961]&(1<<r32^-1);break}do{if((r9|0)==(r23|0)){r33=r9+8|0}else{if(r9>>>0<r1>>>0){_abort()}r10=r9+8|0;if((HEAP32[r10>>2]|0)==(r8|0)){r33=r10;break}_abort()}}while(0);HEAP32[r22+12>>2]=r9;HEAP32[r33>>2]=r22}else{r23=r7;r10=HEAP32[r3+(r6+6)];r15=HEAP32[r3+(r6+3)];L4375:do{if((r15|0)==(r23|0)){r14=r2+(r5+20)|0;r11=HEAP32[r14>>2];do{if((r11|0)==0){r19=r2+(r5+16)|0;r20=HEAP32[r19>>2];if((r20|0)==0){r34=0,r35=r34>>2;break L4375}else{r36=r20;r37=r19;break}}else{r36=r11;r37=r14}}while(0);while(1){r14=r36+20|0;r11=HEAP32[r14>>2];if((r11|0)!=0){r36=r11;r37=r14;continue}r14=r36+16|0;r11=HEAP32[r14>>2];if((r11|0)==0){break}else{r36=r11;r37=r14}}if(r37>>>0<r1>>>0){_abort()}else{HEAP32[r37>>2]=0;r34=r36,r35=r34>>2;break}}else{r14=HEAP32[r3+(r6+2)];if(r14>>>0<r1>>>0){_abort()}r11=r14+12|0;if((HEAP32[r11>>2]|0)!=(r23|0)){_abort()}r19=r15+8|0;if((HEAP32[r19>>2]|0)==(r23|0)){HEAP32[r11>>2]=r15;HEAP32[r19>>2]=r14;r34=r15,r35=r34>>2;break}else{_abort()}}}while(0);if((r10|0)==0){break}r15=r2+(r5+28)|0;r22=(HEAP32[r15>>2]<<2)+68148|0;do{if((r23|0)==(HEAP32[r22>>2]|0)){HEAP32[r22>>2]=r34;if((r34|0)!=0){break}HEAP32[16962]=HEAP32[16962]&(1<<HEAP32[r15>>2]^-1);break L4373}else{if(r10>>>0<HEAP32[16965]>>>0){_abort()}r9=r10+16|0;if((HEAP32[r9>>2]|0)==(r23|0)){HEAP32[r9>>2]=r34}else{HEAP32[r10+20>>2]=r34}if((r34|0)==0){break L4373}}}while(0);if(r34>>>0<HEAP32[16965]>>>0){_abort()}HEAP32[r35+6]=r10;r23=HEAP32[r3+(r6+4)];do{if((r23|0)!=0){if(r23>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r35+4]=r23;HEAP32[r23+24>>2]=r34;break}}}while(0);r23=HEAP32[r3+(r6+5)];if((r23|0)==0){break}if(r23>>>0<HEAP32[16965]>>>0){_abort()}else{HEAP32[r35+5]=r23;HEAP32[r23+24>>2]=r34;break}}}while(0);HEAP32[r17+1]=r31|1;HEAP32[(r31>>2)+r17]=r31;if((r16|0)!=(HEAP32[16966]|0)){r38=r31;break}HEAP32[16963]=r31;return}else{HEAP32[r29>>2]=r30&-2;HEAP32[r17+1]=r18|1;HEAP32[(r18>>2)+r17]=r18;r38=r18}}while(0);r18=r38>>>3;if(r38>>>0<256){r30=r18<<1;r29=(r30<<2)+67884|0;r34=HEAP32[16961];r35=1<<r18;do{if((r34&r35|0)==0){HEAP32[16961]=r34|r35;r39=r29;r40=(r30+2<<2)+67884|0}else{r18=(r30+2<<2)+67884|0;r6=HEAP32[r18>>2];if(r6>>>0>=HEAP32[16965]>>>0){r39=r6;r40=r18;break}_abort()}}while(0);HEAP32[r40>>2]=r16;HEAP32[r39+12>>2]=r16;HEAP32[r17+2]=r39;HEAP32[r17+3]=r29;return}r29=r16;r39=r38>>>8;do{if((r39|0)==0){r41=0}else{if(r38>>>0>16777215){r41=31;break}r40=(r39+1048320|0)>>>16&8;r30=r39<<r40;r35=(r30+520192|0)>>>16&4;r34=r30<<r35;r30=(r34+245760|0)>>>16&2;r18=14-(r35|r40|r30)+(r34<<r30>>>15)|0;r41=r38>>>((r18+7|0)>>>0)&1|r18<<1}}while(0);r39=(r41<<2)+68148|0;HEAP32[r17+7]=r41;HEAP32[r17+5]=0;HEAP32[r17+4]=0;r18=HEAP32[16962];r30=1<<r41;if((r18&r30|0)==0){HEAP32[16962]=r18|r30;HEAP32[r39>>2]=r29;HEAP32[r17+6]=r39;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}if((r41|0)==31){r42=0}else{r42=25-(r41>>>1)|0}r41=r38<<r42;r42=HEAP32[r39>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r38|0)){break}r43=(r41>>>31<<2)+r42+16|0;r39=HEAP32[r43>>2];if((r39|0)==0){r4=3160;break}else{r41=r41<<1;r42=r39}}if(r4==3160){if(r43>>>0<HEAP32[16965]>>>0){_abort()}HEAP32[r43>>2]=r29;HEAP32[r17+6]=r42;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}r16=r42+8|0;r43=HEAP32[r16>>2];r4=HEAP32[16965];if(r42>>>0<r4>>>0){_abort()}if(r43>>>0<r4>>>0){_abort()}HEAP32[r43+12>>2]=r29;HEAP32[r16>>2]=r29;HEAP32[r17+2]=r43;HEAP32[r17+3]=r42;HEAP32[r17+6]=0;return}
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
