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
STATICTOP += 2868;
assert(STATICTOP < TOTAL_MEMORY);
var _stderr;
allocate([255,255,255,255], "i8", ALLOC_NONE, 65536);
allocate([0,0,0,0,0,0,0,0,0,0,0,0,58,0,0,0,72,0,0,0,40,0,0,0,78,0,0,0,46,0,0,0,68,0,0,0,1,0,0,0,70,0,0,0,42,0,0,0,6,0,0,0,104,0,0,0,34,0,0,0,110,0,0,0,14,0,0,0,2,0,0,0,1,0,0,0,28,0,0,0,1,0,0,0,94,0,0,0,12,0,0,0,64,0,0,0,74,0,0,0,20,0,0,0,44,0,0,0,16,0,0,0,102,0,0,0,106,0,0,0,32,0,0,0,48,0,0,0,26,0,0,0,92,0,0,0,52,0,0,0,4,0,0,0,56,0,0,0,22,0,0,0,88,0,0,0,76,0,0,0,1,0,0,0,0,0,0,0,98,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,82,0,0,0,0,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0], ALLOC_NONE, 65540);
allocate(24, "i8", ALLOC_NONE, 65732);
allocate([255,255,255,255], "i8", ALLOC_NONE, 65756);
allocate([7,0,0,0,7,0,0,0,20,0,0,0,4,0,0,0,0,0,0,0,7,0,0,0,7,0,0,0,20,0,0,0,4,0,0,0,1,0,0,0,7,0,0,0,7,0,0,0,20,0,0,0,4,0,0,0,2,0,0,0,10,0,0,0,10,0,0,0,20,0,0,0,2,0,0,0,0,0,0,0,10,0,0,0,10,0,0,0,20,0,0,0,2,0,0,0,1,0,0,0,10,0,0,0,10,0,0,0,20,0,0,0,2,0,0,0,2,0,0,0,14,0,0,0,14,0,0,0,20,0,0,0,2,0,0,0,0,0,0,0,14,0,0,0,14,0,0,0,20,0,0,0,2,0,0,0,1,0,0,0,14,0,0,0,14,0,0,0,20,0,0,0,2,0,0,0,2,0,0,0], "i8", ALLOC_NONE, 65760);
allocate([80,0,0,0,32,0,0,0,24,0,0,0,108,0,0,0,112,0,0,0,18,0,0,0,54,0,0,0,36,0,0,0,50,0,0,0,62,0,0,0,100,0,0,0,86,0,0,0,90,0,0,0,96,0,0,0,84,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,0,0,0,38,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NONE, 65940);
allocate([109,101,45,62,115,116,97,116,101,112,111,115,32,62,61,32,49,0] /* me-_statepos _= 1\00 */, "i8", ALLOC_NONE, 66040);
allocate([33,40,71,82,73,68,40,115,116,97,116,101,44,102,108,97,103,115,44,111,120,44,111,121,41,32,38,32,70,95,66,76,65,67,75,41,0] /* !(GRID(state,flags,o */, "i8", ALLOC_NONE, 66060);
allocate([82,117,110,110,105,110,103,32,115,111,108,118,101,114,32,115,111,97,107,32,116,101,115,116,115,10,0] /* Running solver soak  */, "i8", ALLOC_NONE, 66100);
allocate([37,115,95,68,69,70,65,85,76,84,0] /* %s_DEFAULT\00 */, "i8", ALLOC_NONE, 66128);
allocate([37,100,44,37,100,37,110,0] /* %d,%d%n\00 */, "i8", ALLOC_NONE, 66140);
allocate([37,115,95,84,69,83,84,83,79,76,86,69,0] /* %s_TESTSOLVE\00 */, "i8", ALLOC_NONE, 66148);
allocate([111,117,116,32,111,102,32,109,101,109,111,114,121,0] /* out of memory\00 */, "i8", ALLOC_NONE, 66164);
allocate([102,97,116,97,108,32,101,114,114,111,114,58,32,0] /* fatal error: \00 */, "i8", ALLOC_NONE, 66180);
allocate([115,32,33,61,32,78,85,76,76,0] /* s != NULL\00 */, "i8", ALLOC_NONE, 66196);
allocate([76,73,71,72,84,85,80,95,76,73,84,95,66,76,79,66,83,0] /* LIGHTUP_LIT_BLOBS\00 */, "i8", ALLOC_NONE, 66208);
allocate([115,0] /* s\00 */, "i8", ALLOC_NONE, 66228);
allocate([111,120,32,62,61,32,48,32,38,38,32,111,120,32,60,32,115,116,97,116,101,45,62,119,32,38,38,32,111,121,32,62,61,32,48,32,38,38,32,111,121,32,60,32,115,116,97,116,101,45,62,104,0] /* ox _= 0 && ox _ stat */, "i8", ALLOC_NONE, 66232);
allocate([109,111,118,101,115,116,114,32,38,38,32,33,109,115,103,0] /* movestr && !msg\00 */, "i8", ALLOC_NONE, 66288);
allocate([100,114,97,119,105,110,103,46,99,0] /* drawing.c\00 */, "i8", ALLOC_NONE, 66304);
allocate([109,101,45,62,110,115,116,97,116,101,115,32,61,61,32,48,0] /* me-_nstates == 0\00 */, "i8", ALLOC_NONE, 66316);
allocate([99,111,109,98,105,46,99,0] /* combi.c\00 */, "i8", ALLOC_NONE, 66336);
allocate([101,97,115,121,0] /* easy\00 */, "i8", ALLOC_NONE, 66344);
allocate([116,114,105,99,107,121,0] /* tricky\00 */, "i8", ALLOC_NONE, 66352);
allocate([104,97,114,100,0] /* hard\00 */, "i8", ALLOC_NONE, 66360);
allocate([37,100,120,37,100,32,37,115,0] /* %dx%d %s\00 */, "i8", ALLOC_NONE, 66368);
allocate([37,100,120,37,100,0] /* %dx%d\00 */, "i8", ALLOC_NONE, 66380);
allocate([37,100,120,37,100,98,37,100,115,37,100,100,37,100,0] /* %dx%db%ds%dd%d\00 */, "i8", ALLOC_NONE, 66388);
allocate([58,69,97,115,121,58,84,114,105,99,107,121,58,72,97,114,100,0] /* :Easy:Tricky:Hard\00 */, "i8", ALLOC_NONE, 66404);
allocate([68,105,102,102,105,99,117,108,116,121,0] /* Difficulty\00 */, "i8", ALLOC_NONE, 66424);
allocate([58,78,111,110,101,58,50,45,119,97,121,32,109,105,114,114,111,114,58,50,45,119,97,121,32,114,111,116,97,116,105,111,110,97,108,58,52,45,119,97,121,32,109,105,114,114,111,114,58,52,45,119,97,121,32,114,111,116,97,116,105,111,110,97,108,0] /* :None:2-way mirror:2 */, "i8", ALLOC_NONE, 66436);
allocate([108,105,103,104,116,117,112,46,99,0] /* lightup.c\00 */, "i8", ALLOC_NONE, 66504);
allocate([109,105,100,101,110,100,46,99,0] /* midend.c\00 */, "i8", ALLOC_NONE, 66516);
allocate([83,121,109,109,101,116,114,121,0] /* Symmetry\00 */, "i8", ALLOC_NONE, 66528);
allocate([37,97,103,101,32,111,102,32,98,108,97,99,107,32,115,113,117,97,114,101,115,0] /* %age of black square */, "i8", ALLOC_NONE, 66540);
allocate([72,101,105,103,104,116,0] /* Height\00 */, "i8", ALLOC_NONE, 66564);
allocate([87,105,100,116,104,0] /* Width\00 */, "i8", ALLOC_NONE, 66572);
allocate([85,110,107,110,111,119,110,32,100,105,102,102,105,99,117,108,116,121,32,108,101,118,101,108,0] /* Unknown difficulty l */, "i8", ALLOC_NONE, 66580);
allocate([85,110,107,110,111,119,110,32,115,121,109,109,101,116,114,121,32,116,121,112,101,0] /* Unknown symmetry typ */, "i8", ALLOC_NONE, 66608);
allocate([52,45,102,111,108,100,32,115,121,109,109,101,116,114,121,32,105,115,32,111,110,108,121,32,97,118,97,105,108,97,98,108,101,32,119,105,116,104,32,115,113,117,97,114,101,32,103,114,105,100,115,0] /* 4-fold symmetry is o */, "i8", ALLOC_NONE, 66632);
allocate([91,37,100,58,37,48,50,100,93,32,0] /* [%d:%02d] \00 */, "i8", ALLOC_NONE, 66684);
allocate([80,101,114,99,101,110,116,97,103,101,32,111,102,32,98,108,97,99,107,32,115,113,117,97,114,101,115,32,109,117,115,116,32,98,101,32,98,101,116,119,101,101,110,32,53,37,32,97,110,100,32,49,48,48,37,0] /* Percentage of black  */, "i8", ALLOC_NONE, 66696);
allocate([83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,32,102,97,105,108,101,100,0] /* Solve operation fail */, "i8", ALLOC_NONE, 66752);
allocate([87,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,109,117,115,116,32,98,101,32,97,116,32,108,101,97,115,116,32,50,0] /* Width and height mus */, "i8", ALLOC_NONE, 66776);
allocate([78,111,32,103,97,109,101,32,115,101,116,32,117,112,32,116,111,32,115,111,108,118,101,0] /* No game set up to so */, "i8", ALLOC_NONE, 66812);
allocate([33,34,52,45,102,111,108,100,32,115,121,109,109,101,116,114,121,32,117,110,97,118,97,105,108,97,98,108,101,32,119,105,116,104,111,117,116,32,115,113,117,97,114,101,32,103,114,105,100,34,0] /* !\224-fold symmetry  */, "i8", ALLOC_NONE, 66836);
allocate([84,104,105,115,32,103,97,109,101,32,100,111,101,115,32,110,111,116,32,115,117,112,112,111,114,116,32,116,104,101,32,83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,0] /* This game does not s */, "i8", ALLOC_NONE, 66888);
allocate([33,34,85,110,107,110,111,119,110,32,115,121,109,109,101,116,114,121,32,116,121,112,101,34,0] /* !\22Unknown symmetry */, "i8", ALLOC_NONE, 66936);
allocate([33,34,112,108,97,99,101,95,108,105,103,104,116,115,32,102,97,105,108,101,100,32,116,111,32,114,101,115,111,108,118,101,32,111,118,101,114,108,97,112,112,105,110,103,32,108,105,103,104,116,115,33,34,0] /* !\22place_lights fai */, "i8", ALLOC_NONE, 66964);
allocate([103,114,105,100,95,108,105,116,40,115,116,97,116,101,41,0] /* grid_lit(state)\00 */, "i8", ALLOC_NONE, 67020);
allocate([100,114,45,62,109,101,0] /* dr-_me\00 */, "i8", ALLOC_NONE, 67036);
allocate([100,105,102,102,105,99,117,108,116,121,32,60,61,32,68,73,70,70,67,79,85,78,84,0] /* difficulty _= DIFFCO */, "i8", ALLOC_NONE, 67044);
allocate([110,32,62,61,32,49,0] /* n _= 1\00 */, "i8", ALLOC_NONE, 67068);
allocate([112,32,45,32,114,101,116,32,60,61,32,112,97,114,97,109,115,45,62,119,32,42,32,112,97,114,97,109,115,45,62,104,0] /* p - ret _= params-_w */, "i8", ALLOC_NONE, 67076);
allocate([71,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,32,108,111,110,103,101,114,32,116,104,97,110,32,101,120,112,101,99,116,101,100,0] /* Game description lon */, "i8", ALLOC_NONE, 67112);
allocate([114,97,110,100,111,109,46,99,0] /* random.c\00 */, "i8", ALLOC_NONE, 67152);
allocate([71,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,32,99,111,110,116,97,105,110,101,100,32,117,110,101,120,112,101,99,116,101,100,32,99,104,97,114,97,99,116,101,114,0] /* Game description con */, "i8", ALLOC_NONE, 67164);
allocate([71,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,32,115,104,111,114,116,101,114,32,116,104,97,110,32,101,120,112,101,99,116,101,100,0] /* Game description sho */, "i8", ALLOC_NONE, 67212);
allocate([33,34,79,118,101,114,45,108,111,110,103,32,100,101,115,99,46,34,0] /* !\22Over-long desc.\ */, "i8", ALLOC_NONE, 67252);
allocate([33,34,77,97,108,102,111,114,109,101,100,32,100,101,115,99,46,34,0] /* !\22Malformed desc.\ */, "i8", ALLOC_NONE, 67272);
allocate([108,105,103,104,116,117,112,0] /* lightup\00 */, "i8", ALLOC_NONE, 67292);
allocate([99,32,33,61,32,39,83,39,0] /* c != 'S'\00 */, "i8", ALLOC_NONE, 67300);
allocate([37,115,95,84,73,76,69,83,73,90,69,0] /* %s_TILESIZE\00 */, "i8", ALLOC_NONE, 67312);
allocate([98,101,115,116,120,32,62,61,32,48,32,38,38,32,98,101,115,116,121,32,62,61,32,48,0] /* bestx _= 0 && besty  */, "i8", ALLOC_NONE, 67324);
allocate([98,101,115,116,110,32,62,32,48,0] /* bestn _ 0\00 */, "i8", ALLOC_NONE, 67352);
allocate(1, "i8", ALLOC_NONE, 67364);
allocate([110,32,62,61,32,48,32,38,38,32,110,32,60,32,109,101,45,62,110,112,114,101,115,101,116,115,0] /* n _= 0 && n _ me-_np */, "i8", ALLOC_NONE, 67368);
allocate([59,73,37,100,44,37,100,0] /* ;I%d,%d\00 */, "i8", ALLOC_NONE, 67396);
allocate([37,115,95,80,82,69,83,69,84,83,0] /* %s_PRESETS\00 */, "i8", ALLOC_NONE, 67404);
allocate([114,32,60,61,32,110,0] /* r _= n\00 */, "i8", ALLOC_NONE, 67416);
allocate([59,76,37,100,44,37,100,0] /* ;L%d,%d\00 */, "i8", ALLOC_NONE, 67424);
allocate([37,100,0] /* %d\00 */, "i8", ALLOC_NONE, 67432);
allocate([37,50,120,37,50,120,37,50,120,0] /* %2x%2x%2x\00 */, "i8", ALLOC_NONE, 67436);
allocate([85,110,97,98,108,101,32,116,111,32,102,105,110,100,32,97,32,115,111,108,117,116,105,111,110,32,116,111,32,116,104,105,115,32,112,117,122,122,108,101,46,0] /* Unable to find a sol */, "i8", ALLOC_NONE, 67448);
allocate([37,115,95,67,79,76,79,85,82,95,37,100,0] /* %s_COLOUR_%d\00 */, "i8", ALLOC_NONE, 67492);
allocate([112,32,45,32,114,101,116,32,61,61,32,108,101,110,0] /* p - ret == len\00 */, "i8", ALLOC_NONE, 67508);
allocate([98,105,116,115,32,60,32,51,50,0] /* bits _ 32\00 */, "i8", ALLOC_NONE, 67524);
allocate([33,34,83,104,111,117,108,100,110,39,116,32,103,101,116,32,104,101,114,101,33,34,0] /* !\22Shouldn't get he */, "i8", ALLOC_NONE, 67536);
allocate([109,101,45,62,100,105,114,32,33,61,32,48,0] /* me-_dir != 0\00 */, "i8", ALLOC_NONE, 67560);
allocate([37,99,37,100,44,37,100,0] /* %c%d,%d\00 */, "i8", ALLOC_NONE, 67576);
allocate([109,101,45,62,100,114,97,119,105,110,103,0] /* me-_drawing\00 */, "i8", ALLOC_NONE, 67584);
allocate([103,97,109,101,115,46,108,105,103,104,116,117,112,0] /* games.lightup\00 */, "i8", ALLOC_NONE, 67596);
allocate([76,105,103,104,116,32,85,112,0] /* Light Up\00 */, "i8", ALLOC_NONE, 67612);
allocate(472, "i8", ALLOC_NONE, 67624);
allocate([115,116,97,116,117,115,95,98,97,114,0] /* status_bar\00 */, "i8", ALLOC_NONE, 68096);
allocate([115,111,108,118,101,95,115,117,98,0] /* solve_sub\00 */, "i8", ALLOC_NONE, 68108);
allocate([115,101,116,95,108,105,103,104,116,0] /* set_light\00 */, "i8", ALLOC_NONE, 68120);
allocate([115,101,116,95,98,108,97,99,107,115,0] /* set_blacks\00 */, "i8", ALLOC_NONE, 68132);
allocate([114,97,110,100,111,109,95,117,112,116,111,0] /* random_upto\00 */, "i8", ALLOC_NONE, 68144);
allocate([112,108,97,99,101,95,108,105,103,104,116,115,0] /* place_lights\00 */, "i8", ALLOC_NONE, 68156);
allocate([110,101,119,95,103,97,109,101,95,100,101,115,99,0] /* new_game_desc\00 */, "i8", ALLOC_NONE, 68172);
allocate([110,101,119,95,103,97,109,101,0] /* new_game\00 */, "i8", ALLOC_NONE, 68188);
allocate([110,101,119,95,99,111,109,98,105,0] /* new_combi\00 */, "i8", ALLOC_NONE, 68200);
allocate([109,105,100,101,110,100,95,115,111,108,118,101,0] /* midend_solve\00 */, "i8", ALLOC_NONE, 68212);
allocate([109,105,100,101,110,100,95,114,101,115,116,97,114,116,95,103,97,109,101,0] /* midend_restart_game\ */, "i8", ALLOC_NONE, 68228);
allocate([109,105,100,101,110,100,95,114,101,100,114,97,119,0] /* midend_redraw\00 */, "i8", ALLOC_NONE, 68248);
allocate([109,105,100,101,110,100,95,114,101,97,108,108,121,95,112,114,111,99,101,115,115,95,107,101,121,0] /* midend_really_proces */, "i8", ALLOC_NONE, 68264);
allocate([109,105,100,101,110,100,95,110,101,119,95,103,97,109,101,0] /* midend_new_game\00 */, "i8", ALLOC_NONE, 68292);
allocate([109,105,100,101,110,100,95,102,101,116,99,104,95,112,114,101,115,101,116,0] /* midend_fetch_preset\ */, "i8", ALLOC_NONE, 68308);
allocate([105,110,116,101,114,112,114,101,116,95,109,111,118,101,0] /* interpret_move\00 */, "i8", ALLOC_NONE, 68328);
allocate([103,101,116,95,115,117,114,114,111,117,110,100,115,0] /* get_surrounds\00 */, "i8", ALLOC_NONE, 68344);
allocate([103,97,109,101,95,116,101,120,116,95,102,111,114,109,97,116,0] /* game_text_format\00 */, "i8", ALLOC_NONE, 68360);
allocate([102,108,97,103,115,95,102,114,111,109,95,100,105,102,102,105,99,117,108,116,121,0] /* flags_from_difficult */, "i8", ALLOC_NONE, 68380);
HEAP32[((65540)>>2)]=((67612)|0);
HEAP32[((65544)>>2)]=((67596)|0);
HEAP32[((65548)>>2)]=((67292)|0);
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
___buildEnvironment(ENV);
___setErrNo(0);
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
var FUNCTION_TABLE = [0,0,_free_game,0,_game_free_drawstate,0,_validate_params,0,_trl_callback_discount,0,_trl_callback_incn
,0,_game_text_format,0,_dup_game,0,_game_changed_state,0,_canvas_draw_update,0,_encode_ui
,0,_game_anim_length,0,_canvas_draw_line,0,_game_set_size,0,_solve_game,0,_game_print
,0,_canvas_draw_rect,0,_validate_desc,0,_canvas_unclip,0,_canvas_draw_thick_line,0,_decode_params
,0,_custom_params,0,_decode_ui,0,_free_params,0,_game_compute_size,0,_canvas_start_draw
,0,_game_new_drawstate,0,_canvas_clip,0,_game_redraw,0,_default_params,0,_canvas_text_fallback
,0,_canvas_end_draw,0,_new_ui,0,_trl_callback_search,0,_dup_params,0,_game_configure
,0,_game_fetch_preset,0,_free_ui,0,_game_status,0,_encode_params,0,_canvas_draw_text
,0,_game_timing_state,0,_canvas_blitter_load,0,_canvas_blitter_new,0,_game_flash_length,0,_canvas_blitter_free
,0,_game_colours,0,_game_can_format_as_text_now,0,_canvas_blitter_save,0,_game_print_size,0,_canvas_status_bar
,0,_interpret_move,0,_new_game_desc,0,_execute_move,0,_canvas_draw_poly,0,_new_game,0,_canvas_draw_circle,0];
// EMSCRIPTEN_START_FUNCS
function _validate_params(r1,r2){var r3,r4,r5,r6;r3=r1>>2;r1=HEAP32[r3];do{if((r1|0)<2){r4=66776}else{r5=HEAP32[r3+1];if((r5|0)<2){r4=66776;break}if((r2|0)!=0){if((HEAP32[r3+2]-5|0)>>>0>95){r4=66696;break}r6=HEAP32[r3+3];if((r1|0)!=(r5|0)&(r6|0)==4){r4=66632;break}if(r6>>>0>4){r4=66608;break}if(HEAP32[r3+4]>>>0>2){r4=66580;break}}r4=0}}while(0);return r4}function _decode_params(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r3=r1>>2;r4=0;r5=_atoi(r2);HEAP32[r3]=r5;r6=r2;while(1){r7=HEAP8[r6];if(r7<<24>>24==0){r8=r6;r4=25;break}r9=r6+1|0;if(((r7&255)-48|0)>>>0<10){r6=r9}else{r4=13;break}}L15:do{if(r4==13){L17:do{if(r7<<24>>24==120){r2=_atoi(r9);HEAP32[r3+1]=r2;r2=r9;while(1){r10=HEAP8[r2];if(r10<<24>>24==0){r8=r2;r4=25;break L15}if(((r10&255)-48|0)>>>0<10){r2=r2+1|0}else{r11=r2;r12=r10;break L17}}}else{r11=r6;r12=r7}}while(0);L23:do{if(r12<<24>>24==98){r2=r11+1|0;r10=_atoi(r2);HEAP32[r3+2]=r10;r10=r2;while(1){r2=HEAP8[r10];if(r2<<24>>24==0){r8=r10;r4=25;break L15}if(((r2&255)-48|0)>>>0<10){r10=r10+1|0}else{r13=r10;r14=r2;break L23}}}else{r13=r11;r14=r12}}while(0);if(r14<<24>>24!=115){r8=r13;r4=25;break}r10=r13+1|0;r2=_atoi(r10);HEAP32[r3+3]=r2;r2=r10;while(1){r10=HEAP8[r2];if(r10<<24>>24==0){r15=r2;break L15}if(((r10&255)-48|0)>>>0<10){r2=r2+1|0}else{r15=r2;break L15}}}}while(0);do{if(r4==25){r13=r1+12|0;if((HEAP32[r13>>2]|0)!=4){r15=r8;break}if((r5|0)==(HEAP32[r3+1]|0)){r15=r8;break}HEAP32[r13>>2]=2;r15=r8}}while(0);r8=(r1+16|0)>>2;HEAP32[r8]=0;r1=HEAP8[r15];if(r1<<24>>24==114){HEAP32[r8]=2;r3=r15+1|0;r16=r3;r17=HEAP8[r3]}else{r16=r15;r17=r1}if(r17<<24>>24!=100){return}r17=r16+1|0;r16=_atoi(r17);HEAP32[r8]=r16;r16=r17;while(1){r17=HEAP8[r16];if(r17<<24>>24==0){r4=36;break}if(((r17&255)-48|0)>>>0<10){r16=r16+1|0}else{r4=37;break}}if(r4==36){return}else if(r4==37){return}}function _free_params(r1){if((r1|0)==0){return}_free(r1);return}function _default_params(){var r1,r2,r3;r1=STACKTOP;r2=_malloc(20),r3=r2>>2;if((r2|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r3]=HEAP32[16440];HEAP32[r3+1]=HEAP32[16441];HEAP32[r3+2]=HEAP32[16442];HEAP32[r3+3]=HEAP32[16443];HEAP32[r3+4]=HEAP32[16444];STACKTOP=r1;return r2}}function _game_fetch_preset(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=STACKTOP;STACKTOP=STACKTOP+80|0;if((r1|0)<0|r1>>>0>8){r5=0;STACKTOP=r4;return r5}r6=_malloc(20),r7=r6>>2;if((r6|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r7]=HEAP32[16440];HEAP32[r7+1]=HEAP32[16441];HEAP32[r7+2]=HEAP32[16442];HEAP32[r7+3]=HEAP32[16443];HEAP32[r7+4]=HEAP32[16444];r8=((r1*20&-1)+65760|0)>>2;HEAP32[r7]=HEAP32[r8];HEAP32[r7+1]=HEAP32[r8+1];HEAP32[r7+2]=HEAP32[r8+2];HEAP32[r7+3]=HEAP32[r8+3];HEAP32[r7+4]=HEAP32[r8+4];HEAP32[r3>>2]=r6;r6=r4|0;r3=HEAP32[r7+1];r8=HEAP32[r7+4];if((r8|0)==2){r9=66360}else{r9=(r8|0)==1?66352:66344}_sprintf(r6,66368,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=HEAP32[r7],HEAP32[tempInt+4>>2]=r3,HEAP32[tempInt+8>>2]=r9,tempInt));r9=_malloc(_strlen(r6)+1|0);if((r9|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r9,r6);HEAP32[r2>>2]=r9;r5=1;STACKTOP=r4;return r5}function _encode_params(r1,r2){var r3,r4,r5,r6,r7,r8;r3=r1>>2;r1=STACKTOP;STACKTOP=STACKTOP+80|0;r4=r1|0;r5=HEAP32[r3];r6=HEAP32[r3+1];if((r2|0)==0){_sprintf(r4,66380,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r6,tempInt))}else{r2=HEAP32[r3+2];r7=HEAP32[r3+3];r8=HEAP32[r3+4];_sprintf(r4,66388,(tempInt=STACKTOP,STACKTOP=STACKTOP+20|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r6,HEAP32[tempInt+8>>2]=r2,HEAP32[tempInt+12>>2]=r7,HEAP32[tempInt+16>>2]=r8,tempInt))}r8=_malloc(_strlen(r4)+1|0);if((r8|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r8,r4);STACKTOP=r1;return r8}}function _dup_params(r1){var r2,r3,r4,r5;r2=STACKTOP;r3=_malloc(20),r4=r3>>2;if((r3|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r5=r1>>2;HEAP32[r4]=HEAP32[r5];HEAP32[r4+1]=HEAP32[r5+1];HEAP32[r4+2]=HEAP32[r5+2];HEAP32[r4+3]=HEAP32[r5+3];HEAP32[r4+4]=HEAP32[r5+4];STACKTOP=r2;return r3}}function _game_configure(r1){var r2,r3,r4,r5,r6;r2=r1>>2;r1=STACKTOP;STACKTOP=STACKTOP+80|0;r3=_malloc(96),r4=r3>>2;if((r3|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4]=66572;HEAP32[r4+1]=0;r5=r1|0;_sprintf(r5,67432,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r2],tempInt));r6=_malloc(_strlen(r5)+1|0);if((r6|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r6,r5);HEAP32[r4+2]=r6;HEAP32[r4+3]=0;HEAP32[r4+4]=66564;HEAP32[r4+5]=0;_sprintf(r5,67432,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r2+1],tempInt));r6=_malloc(_strlen(r5)+1|0);if((r6|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r6,r5);HEAP32[r4+6]=r6;HEAP32[r4+7]=0;HEAP32[r4+8]=66540;HEAP32[r4+9]=0;_sprintf(r5,67432,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r2+2],tempInt));r6=_malloc(_strlen(r5)+1|0);if((r6|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r6,r5);HEAP32[r4+10]=r6;HEAP32[r4+11]=0;HEAP32[r4+12]=66528;HEAP32[r4+13]=1;HEAP32[r4+14]=66436;HEAP32[r4+15]=HEAP32[r2+3];HEAP32[r4+16]=66424;HEAP32[r4+17]=1;HEAP32[r4+18]=66404;HEAP32[r4+19]=HEAP32[r2+4];HEAP32[r4+20]=0;HEAP32[r4+21]=3;HEAP32[r4+22]=0;HEAP32[r4+23]=0;STACKTOP=r1;return r3}}function _custom_params(r1){var r2,r3,r4,r5;r2=r1>>2;r1=STACKTOP;r3=_malloc(20),r4=r3>>2;if((r3|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r5=_atoi(HEAP32[r2+2]);HEAP32[r4]=r5;r5=_atoi(HEAP32[r2+6]);HEAP32[r4+1]=r5;r5=_atoi(HEAP32[r2+10]);HEAP32[r4+2]=r5;HEAP32[r4+3]=HEAP32[r2+15];HEAP32[r4+4]=HEAP32[r2+19];STACKTOP=r1;return r3}}function _new_game_desc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152;r4=0;r3=STACKTOP;STACKTOP=STACKTOP+208|0;r5=r3;r6=r3+96;r7=r3+148;r8=r3+176;r9=r3+192;r10=_new_state(r1);r11=(r1|0)>>2;r12=(r1+4|0)>>2;r13=Math.imul(HEAP32[r12],HEAP32[r11]);r14=_malloc(r13<<2);if((r14|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r15=r14;r16=(r13|0)>0;L106:do{if(r16){r17=0;while(1){HEAP32[r15+(r17<<2)>>2]=r17;r18=r17+1|0;if((r18|0)==(r13|0)){break L106}else{r17=r18}}}}while(0);_shuffle(r14,r13,4,r2);r17=(r1+12|0)>>2;r18=(r1+8|0)>>2;r19=r7+4|0;r20=r7+8|0;r21=r7+12|0;r22=r7|0;r23=r7+16|0;r24=r7+20|0;r25=(r7+24|0)>>2;r26=r6+48|0;r27=(r1+16|0)>>2;r1=r8|0;r28=r9|0;r29=r8+4|0;r30=r9+4|0;r31=r8+8|0;r32=r9+8|0;r33=r8+12|0;r34=r9+12|0;r35=(r2+60|0)>>2;r36=r2|0;r37=r2+40|0;r38=r5|0;r39=r5+4|0;r40=r5+8|0;r41=r5+12|0;r42=r5+16|0;r43=r5+84|0;r44=r5+92|0;r45=r5+88|0;r46=r10,r10=r46>>2;r47=0;while(1){do{if((r47|0)<20){r48=r47}else{r49=HEAP32[r18];if((r49|0)>=90){r48=0;break}HEAP32[r18]=r49+5|0;r48=0}}while(0);r49=(r46|0)>>2;r50=HEAP32[r49];r51=r50&1;r52=(r51|0)==0;r53=(r46+4|0)>>2;r54=HEAP32[r53];r55=r54&1;r56=HEAP32[r17];do{if((r56|0)==3){r57=4;r58=3;r4=88;break}else if((r56|0)==1){r57=2;r58=1;r4=88}else if((r56|0)==2|(r56|0)==4){r59=r56;r60=1;r61=r56;r4=89}else if((r56|0)==0){r62=r50;r63=r54;r64=1;r65=0;r66=0;r67=r50;r68=r54}else{___assert_func(66504,585,68132,66936);r57=0;r58=HEAP32[r17];r4=88;break}}while(0);do{if(r4==88){r4=0;r59=r57;r60=0;r61=r58;r4=89;break}}while(0);do{if(r4==89){r4=0;do{if((r61|0)==4){if((HEAP32[r53]|0)==(HEAP32[r49]|0)){break}___assert_func(66504,588,68132,66836)}}while(0);if((r59|0)==4){r54=HEAP32[r49];r69=((r54|0)/2&-1)+((r60|0)==0?r51:0)|0;r70=4;r71=1;r72=HEAP32[r53];r73=r54}else{r54=HEAP32[r49];r50=HEAP32[r53];if((r59|0)==2){r69=r54;r70=2;r71=0;r72=r50;r73=r54}else{r62=r54;r63=r50;r64=r59;r65=r60;r66=0;r67=r54;r68=r50;break}}r62=r69;r63=((r72|0)/2&-1)+r55|0;r64=r70;r65=r60;r66=r71;r67=r73;r68=r72}}while(0);L132:do{if((r67|0)>0){r50=r46+16|0;r54=r46+12|0;r56=0;r74=r68;r75=r67;while(1){L136:do{if((r74|0)>0){r76=0;r77=r75;while(1){r78=Math.imul(r76,r77);HEAP32[HEAP32[r50>>2]+(r78+r56<<2)>>2]=0;r78=Math.imul(HEAP32[r49],r76)+r56|0;HEAP32[HEAP32[r54>>2]+(r78<<2)>>2]=0;r78=r76+1|0;r79=HEAP32[r53];r80=HEAP32[r49];if((r78|0)<(r79|0)){r76=r78;r77=r80}else{r81=r79;r82=r80;break L136}}}else{r81=r74;r82=r75}}while(0);r77=r56+1|0;if((r77|0)<(r82|0)){r56=r77;r74=r81;r75=r82}else{break L132}}}}while(0);HEAP32[r10+2]=0;r75=Math.imul(Math.imul(r62,r63),HEAP32[r18]);r74=(r75|0)/100&-1;L141:do{if((r75|0)>99){r56=r46+16|0;r54=0;while(1){r50=0;while(1){if((r62>>>(r50>>>0)|0)!=0){r50=r50+1|0;continue}r77=r50+3|0;if((r77|0)>=32){___assert_func(67152,275,68144,67524)}r76=Math.floor((1<<r77>>>0)/(r62>>>0));r80=Math.imul(r76,r62);while(1){r83=_random_bits(r2,r77);if(r83>>>0<r80>>>0){r84=0;break}}while(1){if((r63>>>(r84>>>0)|0)==0){break}else{r84=r84+1|0}}r80=Math.floor((r83>>>0)/(r76>>>0));r77=r84+3|0;if((r77|0)>=32){___assert_func(67152,275,68144,67524)}r79=Math.floor((1<<r77>>>0)/(r63>>>0));r78=Math.imul(r79,r63);while(1){r85=_random_bits(r2,r77);if(r85>>>0<r78>>>0){break}}r78=Math.floor((r85>>>0)/(r79>>>0));r86=((Math.imul(HEAP32[r49],r78)+r80|0)<<2)+HEAP32[r56>>2]|0;r87=HEAP32[r86>>2];if((r87&1|0)==0){break}else{r50=0}}HEAP32[r86>>2]=r87|1;r50=r54+1|0;if((r50|0)<(r74|0)){r54=r50}else{break L141}}}}while(0);do{if((HEAP32[r17]|0)!=0){L166:do{if((r62|0)>0){r74=(r63|0)>0;r75=(r65|0)!=0;r54=(r65|0)==0;r56=(r64|0)>1;r50=r46+16|0;r78=(r64|0)==2;r77=0;r76=0;while(1){L170:do{if(r74){r88=r76-1|0;r89=0;r90=0;while(1){HEAP32[r1>>2]=r77;HEAP32[r28>>2]=r89;if(r66){r91=HEAP32[r49];r92=r91+((r75?r89:r77)^-1)|0;HEAP32[r29>>2]=r92;r93=r75?r77:r89;HEAP32[r30>>2]=r93;if(r75){HEAP32[r31>>2]=r91+r88|0;r94=HEAP32[r53];HEAP32[r32>>2]=r90-1+r94|0;r95=r89;r96=r94}else{HEAP32[r31>>2]=r77;r94=HEAP32[r53];HEAP32[r32>>2]=r90-1+r94|0;r95=r91+r88|0;r96=r94}HEAP32[r33>>2]=r95;HEAP32[r34>>2]=r96+(r93^-1)|0;r97=r93;r98=r92}else{if(r54){r99=r77}else{r99=HEAP32[r49]+r88|0}HEAP32[r29>>2]=r99;r92=r90-1+HEAP32[r53]|0;HEAP32[r30>>2]=r92;r97=r92;r98=r99}L185:do{if(r56){r92=HEAP32[r49];r93=Math.imul(r92,r89)+r77|0;r94=HEAP32[r50>>2];r91=HEAP32[r94+(r93<<2)>>2];r93=(Math.imul(r92,r97)+r98<<2)+r94|0;HEAP32[r93>>2]=r91;if(r78){break}else{r100=2}while(1){r91=HEAP32[r9+(r100<<2)>>2];r93=HEAP32[r8+(r100<<2)>>2];r94=r100+1|0;r92=HEAP32[r49];r101=Math.imul(r92,r89)+r77|0;r102=HEAP32[r50>>2];r103=HEAP32[r102+(r101<<2)>>2];r101=(Math.imul(r92,r91)+r93<<2)+r102|0;HEAP32[r101>>2]=r103;if((r94|0)==(r64|0)){break L185}else{r100=r94}}}}while(0);r94=r89+1|0;r103=r89^-1;if((r94|0)==(r63|0)){break L170}else{r89=r94;r90=r103}}}}while(0);r80=r77+1|0;r79=r77^-1;if((r80|0)==(r62|0)){break L166}else{r77=r80;r76=r79}}}}while(0);if((r65|0)==0|r66^1|r52){break}r76=HEAP32[r35];while(1){do{if((r76|0)>19){r77=0;while(1){r104=r2+r77|0;r105=HEAP8[r104];if(r105<<24>>24!=-1){r4=138;break}HEAP8[r104]=0;r50=r77+1|0;if((r50|0)<20){r77=r50}else{break}}if(r4==138){r4=0;HEAP8[r104]=r105+1&255}HEAP32[r38>>2]=1732584193;HEAP32[r39>>2]=-271733879;HEAP32[r40>>2]=-1732584194;HEAP32[r41>>2]=271733878;HEAP32[r42>>2]=-1009589776;HEAP32[r43>>2]=0;HEAP32[r44>>2]=0;HEAP32[r45>>2]=0;_SHA_Bytes(r5,r36,40);_SHA_Final(r5,r37);HEAP32[r35]=1;r106=1;r107=HEAPU8[r2+40|0]}else{r77=r76+1|0;HEAP32[r35]=r77;r50=HEAPU8[r2+(r76+40)|0];if((r77|0)>19){r108=0}else{r106=r77;r107=r50;break}while(1){r109=r2+r108|0;r110=HEAP8[r109];if(r110<<24>>24!=-1){r4=285;break}HEAP8[r109]=0;r77=r108+1|0;if((r77|0)<20){r108=r77}else{break}}if(r4==285){r4=0;HEAP8[r109]=r110+1&255}HEAP32[r38>>2]=1732584193;HEAP32[r39>>2]=-271733879;HEAP32[r40>>2]=-1732584194;HEAP32[r41>>2]=271733878;HEAP32[r42>>2]=-1009589776;HEAP32[r43>>2]=0;HEAP32[r44>>2]=0;HEAP32[r45>>2]=0;_SHA_Bytes(r5,r36,40);_SHA_Final(r5,r37);HEAP32[r35]=0;r106=0;r107=r50}}while(0);r77=r106+1|0;HEAP32[r35]=r77;r111=HEAPU8[r2+(r106+40)|0]|r107<<8&768;if(r111>>>0<1e3){break}else{r76=r77}}if(Math.floor((r111>>>0)/10)>>>0>HEAP32[r18]>>>0){break}r76=HEAP32[r49];r77=((r51-1+((r76|0)/2&-1)+Math.imul(r55-1+((HEAP32[r53]|0)/2&-1)|0,r76)|0)<<2)+HEAP32[r10+4]|0;HEAP32[r77>>2]=HEAP32[r77>>2]|1}}while(0);r55=Math.imul(HEAP32[r53],HEAP32[r49]);r51=_malloc(r55<<2);if((r51|0)==0){r4=145;break}r52=r51;r77=(r55|0)>0;L214:do{if(r77){r76=0;while(1){HEAP32[r52+(r76<<2)>>2]=r76;r78=r76+1|0;if((r78|0)==(r55|0)){break L214}else{r76=r78}}}}while(0);_shuffle(r51,r55,4,r2);r76=HEAP32[r49];L218:do{if((r76|0)>0){r78=r46+16|0;r56=0;r54=HEAP32[r53];r75=r76;while(1){L222:do{if((r54|0)>0){r74=0;r79=r75;while(1){r80=((Math.imul(r74,r79)+r56|0)<<2)+HEAP32[r78>>2]|0;HEAP32[r80>>2]=HEAP32[r80>>2]&-33;r80=HEAP32[r49];r90=Math.imul(r80,r74)+r56|0;if((HEAP32[HEAP32[r78>>2]+(r90<<2)>>2]&1|0)==0){_set_light(r46,r56,r74,1);r112=HEAP32[r49]}else{r112=r80}r80=r74+1|0;r90=HEAP32[r53];if((r80|0)<(r90|0)){r74=r80;r79=r112}else{r113=r90;r114=r112;break L222}}}else{r113=r54;r114=r75}}while(0);r79=r56+1|0;if((r79|0)<(r114|0)){r56=r79;r54=r113;r75=r114}else{r115=r114;break L218}}}else{r115=r76}}while(0);L230:do{if(r77){r76=(r46+16|0)>>2;r75=r46+12|0;r54=0;r56=r115;L232:while(1){r78=HEAP32[r52+(r54<<2)>>2];r79=(r78|0)/(r56|0)&-1;r74=(r78|0)%(r56|0);r78=Math.imul(r79,r56)+r74|0;L234:do{if((HEAP32[HEAP32[r76]+(r78<<2)>>2]&48|0)==16){_list_lights(r46,r74,r79,0,r7);r50=HEAP32[r19>>2];r90=HEAP32[r20>>2];r80=HEAP32[r21>>2];r89=(r90|0)>(r80|0);r88=HEAP32[r22>>2];L236:do{if(r89){r116=0}else{r103=0;r94=r90;while(1){if((r94|0)==(r88|0)){r117=r103}else{r101=Math.imul(HEAP32[r49],r50)+r94|0;r117=(HEAP32[HEAP32[r76]+(r101<<2)>>2]>>>4&1)+r103|0}r101=r94+1|0;if((r101|0)>(r80|0)){r116=r117;break L236}else{r103=r117;r94=r101}}}}while(0);r94=HEAP32[r23>>2];r103=HEAP32[r24>>2];r101=(r94|0)>(r103|0);L243:do{if(r101){r118=r116}else{r102=(HEAP32[r25]|0)==0;r93=r116;r91=r94;while(1){if(r102&(r91|0)==(r50|0)){r119=r93}else{r92=Math.imul(HEAP32[r49],r91)+r88|0;r119=(HEAP32[HEAP32[r76]+(r92<<2)>>2]>>>4&1)+r93|0}r92=r91+1|0;if((r92|0)>(r103|0)){r118=r119;break L243}else{r93=r119;r91=r92}}}}while(0);if((r118|0)==0){break}L252:do{if(r89){r120=0}else{r91=0;r93=r90;while(1){do{if((r93|0)==(r88|0)){r121=r91}else{r102=Math.imul(HEAP32[r49],r50)+r93|0;if((HEAP32[HEAP32[r76]+(r102<<2)>>2]&16|0)==0){r121=r91;break}r121=_check_dark(r46,r93,r50)+r91|0}}while(0);r102=r93+1|0;if((r102|0)>(r80|0)){r120=r121;break L252}else{r91=r121;r93=r102}}}}while(0);L260:do{if(r101){r122=r120}else{r93=(HEAP32[r25]|0)==0;r91=r120;r102=r94;while(1){do{if(r93&(r102|0)==(r50|0)){r123=r91}else{r92=Math.imul(HEAP32[r49],r102)+r88|0;if((HEAP32[HEAP32[r76]+(r92<<2)>>2]&16|0)==0){r123=r91;break}r123=_check_dark(r46,r88,r102)+r91|0}}while(0);r92=r102+1|0;if((r92|0)>(r103|0)){r122=r123;break L260}else{r91=r123;r102=r92}}}}while(0);if((r122|0)==0){L271:do{if(!r89){r102=r90;while(1){if((r102|0)!=(r88|0)){_set_light(r46,r102,r50,0)}r91=r102+1|0;if((r91|0)>(r80|0)){break L271}else{r102=r91}}}}while(0);L278:do{if(!r101){r80=(HEAP32[r25]|0)==0;r90=r94;while(1){if(!(r80&(r90|0)==(r50|0))){_set_light(r46,r88,r90,0)}r89=r90+1|0;if((r89|0)>(r103|0)){break L278}else{r90=r89}}}}while(0);r103=((Math.imul(HEAP32[r49],r79)+r74|0)<<2)+HEAP32[r76]|0;HEAP32[r103>>2]=HEAP32[r103>>2]|32}r103=HEAP32[r49];if((r103|0)<=0){break L232}r88=HEAP32[r53];if((r88|0)<=0){break L232}r50=HEAP32[r76];r94=0;L289:while(1){r101=0;while(1){r90=Math.imul(r101,r103)+r94|0;if((HEAP32[r50+(r90<<2)>>2]&16|0)!=0){r124=HEAP32[r75>>2];if((HEAP32[r124+(r90<<2)>>2]|0)>1){r125=0;break L289}}r90=r101+1|0;if((r90|0)<(r88|0)){r101=r90}else{break}}r101=r94+1|0;if((r101|0)<(r103|0)){r94=r101}else{break L232}}L297:while(1){r94=0;while(1){r101=Math.imul(r94,r103)+r125|0;if((HEAP32[r50+(r101<<2)>>2]&1|0)==0){if((HEAP32[r124+(r101<<2)>>2]|0)==0){break L297}}r101=r94+1|0;if((r101|0)<(r88|0)){r94=r101}else{break}}r94=r125+1|0;if((r94|0)<(r103|0)){r125=r94}else{break L234}}___assert_func(66504,767,68156,67020)}}while(0);r74=r54+1|0;r79=HEAP32[r49];if((r74|0)<(r55|0)){r54=r74;r56=r79}else{r126=r79;r4=206;break L230}}_free(r51);break}else{r126=r115;r4=206}}while(0);if(r4==206){r4=0;L310:do{if((r126|0)>0){r55=HEAP32[r53];r52=r46+12|0;if((r55|0)<=0){break}r77=HEAP32[r10+4];r56=0;L313:while(1){r54=0;while(1){r75=Math.imul(r54,r126)+r56|0;if((HEAP32[r77+(r75<<2)>>2]&16|0)!=0){if((HEAP32[HEAP32[r52>>2]+(r75<<2)>>2]|0)>1){break L313}}r75=r54+1|0;if((r75|0)<(r55|0)){r54=r75}else{break}}r54=r56+1|0;if((r54|0)<(r126|0)){r56=r54}else{break L310}}___assert_func(66504,772,68156,66964)}}while(0);_free(r51)}r56=HEAP32[r49];L324:do{if((r56|0)>0){r55=r46+16|0;r52=r46+12|0;r77=0;r54=HEAP32[r53];r75=r56;r76=r56;while(1){L328:do{if((r54|0)>0){r79=0;r74=r54;r78=r75;r103=r76;while(1){r88=Math.imul(r79,r78)+r77|0;if((HEAP32[HEAP32[r55>>2]+(r88<<2)>>2]&1|0)==0){r127=r74;r128=r103}else{_get_surrounds(r46,r77,r79,r6);r88=HEAP32[r26>>2];r50=HEAP32[r49];r94=HEAP32[r55>>2];L333:do{if((r88|0)>0){r101=0;r90=0;while(1){r80=Math.imul(HEAP32[r6+(r101*12&-1)+4>>2],r50);r89=(HEAP32[r94+(r80+HEAP32[r6+(r101*12&-1)>>2]<<2)>>2]>>>4&1)+r90|0;r80=r101+1|0;if((r80|0)==(r88|0)){r129=r89;break L333}else{r101=r80;r90=r89}}}else{r129=0}}while(0);r88=(Math.imul(r50,r79)+r77<<2)+r94|0;HEAP32[r88>>2]=HEAP32[r88>>2]|2;r88=Math.imul(HEAP32[r49],r79)+r77|0;HEAP32[HEAP32[r52>>2]+(r88<<2)>>2]=r129;r127=HEAP32[r53];r128=HEAP32[r49]}r88=r79+1|0;if((r88|0)<(r127|0)){r79=r88;r74=r127;r78=r128;r103=r128}else{r130=r127;r131=r128;r132=r128;break L328}}}else{r130=r54;r131=r75;r132=r76}}while(0);r103=r77+1|0;if((r103|0)<(r131|0)){r77=r103;r54=r130;r75=r131;r76=r132}else{break L324}}}}while(0);if((_puzzle_is_good(r46,HEAP32[r27])|0)==0){r133=r46}else{r49=_dup_game(r46);r53=(r49|0)>>2;r56=HEAP32[r53];L342:do{if((r56|0)>0){r51=r49+4|0;r76=r49+16|0;r75=r49+12|0;r54=0;r77=HEAP32[r51>>2];r52=r56;r55=r56;while(1){L346:do{if((r77|0)>0){r103=0;r78=r77;r74=r52;r79=r55;while(1){r88=((Math.imul(r103,r74)+r54|0)<<2)+HEAP32[r76>>2]|0;r90=HEAP32[r88>>2];if((r90&6|0)==2){HEAP32[r88>>2]=r90&-3;r90=Math.imul(HEAP32[r53],r103)+r54|0;HEAP32[HEAP32[r75>>2]+(r90<<2)>>2]=0;r134=HEAP32[r51>>2];r135=HEAP32[r53]}else{r134=r78;r135=r79}r90=r103+1|0;if((r90|0)<(r134|0)){r103=r90;r78=r134;r74=r135;r79=r135}else{r136=r134;r137=r135;r138=r135;break L346}}}else{r136=r77;r137=r52;r138=r55}}while(0);r79=r54+1|0;if((r79|0)<(r137|0)){r54=r79;r77=r136;r52=r137;r55=r138}else{break L342}}}}while(0);do{if((_puzzle_is_good(r49,HEAP32[r27])|0)==0){r53=HEAP32[r49+12>>2];if((r53|0)!=0){_free(r53)}r53=HEAP32[r49+16>>2];if((r53|0)!=0){_free(r53)}if((r49|0)==0){r139=r46;break}_free(r49);r139=r46}else{r53=HEAP32[r10+3];if((r53|0)!=0){_free(r53)}r53=HEAP32[r10+4];if((r53|0)!=0){_free(r53)}if((r46|0)==0){r139=r49;break}_free(r46);r139=r49}}while(0);L372:do{if(r16){r49=(r139|0)>>2;r53=(r139+16|0)>>2;r56=r139+12|0;r55=0;while(1){r52=HEAP32[r15+(r55<<2)>>2];r77=HEAP32[r11];r54=(r52|0)/(r77|0)&-1;r51=(r52|0)%(r77|0);r77=Math.imul(HEAP32[r49],r54)+r51|0;do{if((HEAP32[HEAP32[r53]+(r77<<2)>>2]&2|0)!=0){r52=(r77<<2)+HEAP32[r56>>2]|0;r75=HEAP32[r52>>2];HEAP32[r52>>2]=0;r52=((Math.imul(HEAP32[r49],r54)+r51|0)<<2)+HEAP32[r53]|0;HEAP32[r52>>2]=HEAP32[r52>>2]&-3;if((_puzzle_is_good(r139,HEAP32[r27])|0)!=0){break}r52=Math.imul(HEAP32[r49],r54)+r51|0;HEAP32[HEAP32[r56>>2]+(r52<<2)>>2]=r75;r75=((Math.imul(HEAP32[r49],r54)+r51|0)<<2)+HEAP32[r53]|0;HEAP32[r75>>2]=HEAP32[r75>>2]|2}}while(0);r51=r55+1|0;if((r51|0)==(r13|0)){break L372}else{r55=r51}}}}while(0);r55=HEAP32[r27];if((r55|0)<=0){break}if((_puzzle_is_good(r139,r55-1|0)|0)==0){break}else{r133=r139}}r46=r133,r10=r46>>2;r47=r48+1|0}if(r4==145){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r4=_malloc(Math.imul(HEAP32[r12],HEAP32[r11])+1|0);if((r4|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r48=HEAP32[r12];do{if((r48|0)>0){r47=r139|0;r46=r139+16|0;r10=r139+12|0;r133=0;r27=0;r13=r4;r15=HEAP32[r11];r16=r48;while(1){if((r15|0)>0){r138=0;r137=r27;r136=r13;while(1){r135=HEAP32[r47>>2];r134=Math.imul(r135,r133)+r138|0;r132=HEAP32[r46>>2];do{if((HEAP32[r132+(r134<<2)>>2]&1|0)==0){if((r137|0)==26){HEAP8[r136]=122;r140=r136+1|0;r141=0}else{r140=r136;r141=r137}r142=r140;r143=r141+1|0}else{if((r137|0)==0){r144=r136;r145=r135;r146=r132}else{HEAP8[r136]=r137+96&255;r144=r136+1|0;r145=HEAP32[r47>>2];r146=HEAP32[r46>>2]}r131=Math.imul(r145,r133)+r138|0;if((HEAP32[r146+(r131<<2)>>2]&2|0)==0){HEAP8[r144]=66;r142=r144+1|0;r143=0;break}else{HEAP8[r144]=HEAP32[HEAP32[r10>>2]+(r131<<2)>>2]+48&255;r142=r144+1|0;r143=0;break}}}while(0);r132=r138+1|0;r147=HEAP32[r11];if((r132|0)<(r147|0)){r138=r132;r137=r143;r136=r142}else{break}}r148=r143;r149=r142;r150=r147;r151=HEAP32[r12]}else{r148=r27;r149=r13;r150=r15;r151=r16}r136=r133+1|0;if((r136|0)<(r151|0)){r133=r136;r27=r148;r13=r149;r15=r150;r16=r151}else{break}}if((r148|0)==0){r152=r149;break}HEAP8[r149]=r148+96&255;r152=r149+1|0}else{r152=r4}}while(0);HEAP8[r152]=0;if((r152-r4|0)>(Math.imul(HEAP32[r12],HEAP32[r11])|0)){___assert_func(66504,1621,68172,67076)}r11=HEAP32[r139+12>>2];if((r11|0)!=0){_free(r11)}r11=HEAP32[r139+16>>2];if((r11|0)!=0){_free(r11)}if((r139|0)==0){_free(r14);STACKTOP=r3;return r4}_free(r139);_free(r14);STACKTOP=r3;return r4}function _game_can_format_as_text_now(r1){return 1}function _encode_ui(r1){return 0}function _decode_ui(r1,r2){return}function _validate_desc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r3=Math.imul(HEAP32[r1+4>>2],HEAP32[r1>>2]);r1=HEAP8[r2];L431:do{if((r3|0)>0){r4=r2;r5=0;r6=r1;L432:while(1){do{if((r6-48&255)<5){r7=r5}else{if(r6<<24>>24==66){r7=r5;break}if((r6-97&255)>=26){break L432}r7=(r6<<24>>24)+(r5-97)|0}}while(0);r8=r4+1|0;r9=r7+1|0;r10=HEAP8[r8];if((r9|0)<(r3|0)){r4=r8;r5=r9;r6=r10}else{r11=r9;r12=r10;break L431}}return r6<<24>>24==0?67212:67164}else{r11=0;r12=r1}}while(0);return r12<<24>>24!=0|(r11|0)>(r3|0)?67112:0}function _game_changed_state(r1,r2,r3){if((HEAP32[r3+20>>2]|0)==0){return}HEAP32[r1+8>>2]=0;return}function _new_game(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r1=0;r4=_new_state(r2);r5=r2+4|0;r6=HEAP32[r5>>2];L447:do{if((r6|0)>0){r7=r2|0;r8=(r4|0)>>2;r9=r4+16|0;r10=r4+12|0;r11=r3;r12=0;r13=0;r14=HEAP32[r7>>2];r15=r6;while(1){if((r14|0)>0){r16=r11;r17=0;r18=r13;while(1){if((r18|0)==0){r19=HEAP8[r16];r20=r19<<24>>24;if(r19<<24>>24==83){___assert_func(66504,1662,68188,67300)}r21=r20;r22=(r19-97&255)<26?r20-96|0:0;r23=r16+1|0}else{r21=0;r22=r18;r23=r16}r20=(r22|0)>0;r24=(r20<<31>>31)+r22|0;r19=r20?83:r21;do{if((r19|0)==48|(r19|0)==49|(r19|0)==50|(r19|0)==51|(r19|0)==52){r20=((Math.imul(HEAP32[r8],r12)+r17|0)<<2)+HEAP32[r9>>2]|0;HEAP32[r20>>2]=HEAP32[r20>>2]|2;r20=Math.imul(HEAP32[r8],r12)+r17|0;HEAP32[HEAP32[r10>>2]+(r20<<2)>>2]=r19-48|0;r1=316;break}else if((r19|0)==66){r1=316}else if((r19|0)!=83){___assert_func(66504,1687,68188,67272);break}}while(0);if(r1==316){r1=0;r19=((Math.imul(HEAP32[r8],r12)+r17|0)<<2)+HEAP32[r9>>2]|0;HEAP32[r19>>2]=HEAP32[r19>>2]|1}r19=r17+1|0;r25=HEAP32[r7>>2];if((r19|0)<(r25|0)){r16=r23;r17=r19;r18=r24}else{break}}r26=r23;r27=r24;r28=r25;r29=HEAP32[r5>>2]}else{r26=r11;r27=r13;r28=r14;r29=r15}r18=r12+1|0;if((r18|0)<(r29|0)){r11=r26;r12=r18;r13=r27;r14=r28;r15=r29}else{r30=r26;break L447}}}else{r30=r3}}while(0);if(HEAP8[r30]<<24>>24==0){return r4}___assert_func(66504,1692,68188,67252);return r4}function _free_game(r1){var r2;r2=HEAP32[r1+12>>2];if((r2|0)!=0){_free(r2)}r2=HEAP32[r1+16>>2];if((r2|0)!=0){_free(r2)}if((r1|0)==0){return}_free(r1);return}function _free_ui(r1){if((r1|0)==0){return}_free(r1);return}function _dup_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=r1>>2;r1=STACKTOP;r3=_malloc(28),r4=r3>>2;if((r3|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r5=HEAP32[r2];r6=r3>>2;HEAP32[r6]=r5;r7=HEAP32[r2+1];r8=(r3+4|0)>>2;HEAP32[r8]=r7;r9=_malloc(Math.imul(r7<<2,r5));if((r9|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4+3]=r9;_memcpy(r9,HEAP32[r2+3],Math.imul(HEAP32[r6]<<2,HEAP32[r8]));HEAP32[r4+2]=HEAP32[r2+2];r9=_malloc(Math.imul(HEAP32[r6]<<2,HEAP32[r8]));if((r9|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r4+4]=r9;_memcpy(r9,HEAP32[r2+4],Math.imul(HEAP32[r6]<<2,HEAP32[r8]));HEAP32[r4+5]=HEAP32[r2+5];HEAP32[r4+6]=HEAP32[r2+6];STACKTOP=r1;return r3}}function _solve_game(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40;r3=0;r5=STACKTOP;STACKTOP=STACKTOP+80|0;r6=r5;r7=_dup_game(r2);r8=r7|0;r9=HEAP32[r8>>2];L500:do{if((r9|0)>0){r10=r7+4|0;r11=r7+16|0;r12=0;r13=HEAP32[r10>>2];r14=r9;while(1){L504:do{if((r13|0)>0){r15=0;r16=r14;while(1){r17=((Math.imul(r15,r16)+r12|0)<<2)+HEAP32[r11>>2]|0;HEAP32[r17>>2]=HEAP32[r17>>2]&-5;r17=r15+1|0;r18=HEAP32[r10>>2];r19=HEAP32[r8>>2];if((r17|0)<(r18|0)){r15=r17;r16=r19}else{r20=r18;r21=r19;break L504}}}else{r20=r13;r21=r14}}while(0);r16=r12+1|0;if((r16|0)<(r21|0)){r12=r16;r13=r20;r14=r21}else{break L500}}}}while(0);do{if((_solve_sub(r7,6,0,0)|0)>0){r22=r7;r3=366}else{r21=HEAP32[r7+12>>2];if((r21|0)!=0){_free(r21)}r21=HEAP32[r7+16>>2];if((r21|0)!=0){_free(r21)}if((r7|0)!=0){_free(r7)}r21=_dup_game(r1);r20=r21|0;r8=HEAP32[r20>>2];L520:do{if((r8|0)>0){r9=r21+4|0;r14=r21+16|0;r13=0;r12=HEAP32[r9>>2];r10=r8;while(1){L524:do{if((r12|0)>0){r11=0;r16=r10;while(1){r15=((Math.imul(r11,r16)+r13|0)<<2)+HEAP32[r14>>2]|0;HEAP32[r15>>2]=HEAP32[r15>>2]&-5;r15=r11+1|0;r19=HEAP32[r9>>2];r18=HEAP32[r20>>2];if((r15|0)<(r19|0)){r11=r15;r16=r18}else{r23=r19;r24=r18;break L524}}}else{r23=r12;r24=r10}}while(0);r16=r13+1|0;if((r16|0)<(r24|0)){r13=r16;r12=r23;r10=r24}else{break L520}}}}while(0);if((_solve_sub(r21,6,0,0)|0)>0){r22=r21;r3=366;break}HEAP32[r4>>2]=67448;r25=r21;r26=0;break}}while(0);L530:do{if(r3==366){r4=_malloc(256);if((r4|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP8[r4]=83;HEAP8[r4+1|0]=0;r24=r2|0;r23=HEAP32[r24>>2];if((r23|0)<=0){r25=r22;r26=r4;break}r1=r2+4|0;r7=r2+16|0;r20=r22|0;r8=r22+16|0;r10=r6|0;r12=256;r13=0;r9=1;r14=r4;r4=HEAP32[r1>>2];r16=r23;L536:while(1){L538:do{if((r4|0)>0){r23=r12;r11=0;r18=r9;r19=r14;r15=r16;while(1){r17=Math.imul(r15,r11)+r13|0;r27=HEAP32[HEAP32[r7>>2]+(r17<<2)>>2];r17=Math.imul(HEAP32[r20>>2],r11)+r13|0;r28=HEAP32[HEAP32[r8>>2]+(r17<<2)>>2]^r27;do{if((r28&16|0)==0){if((r28&8|0)==0){r29=r19;r30=r18;r31=r23;break}r32=_sprintf(r10,67396,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r13,HEAP32[tempInt+4>>2]=r11,tempInt));r3=375;break}else{r32=_sprintf(r10,67424,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r13,HEAP32[tempInt+4>>2]=r11,tempInt));r3=375;break}}while(0);do{if(r3==375){r3=0;if((r32|0)==0){r29=r19;r30=r18;r31=r23;break}r28=r32+r18|0;if((r28|0)<(r23|0)){r33=r19;r34=r23}else{r27=r28+256|0;if((r19|0)==0){r35=_malloc(r27)}else{r35=_realloc(r19,r27)}if((r35|0)==0){break L536}else{r33=r35;r34=r27}}_strcpy(r33+r18|0,r10);r29=r33;r30=r28;r31=r34}}while(0);r28=r11+1|0;r27=HEAP32[r1>>2];r17=HEAP32[r24>>2];if((r28|0)<(r27|0)){r23=r31;r11=r28;r18=r30;r19=r29;r15=r17}else{r36=r31;r37=r30;r38=r29;r39=r27;r40=r17;break L538}}}else{r36=r12;r37=r9;r38=r14;r39=r4;r40=r16}}while(0);r15=r13+1|0;if((r15|0)<(r40|0)){r12=r36;r13=r15;r9=r37;r14=r38;r4=r39;r16=r40}else{r25=r22;r26=r38;break L530}}_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}while(0);r38=HEAP32[r25+12>>2];if((r38|0)!=0){_free(r38)}r38=HEAP32[r25+16>>2];if((r38|0)!=0){_free(r38)}if((r25|0)==0){STACKTOP=r5;return r26}_free(r25);STACKTOP=r5;return r26}function _game_text_format(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29;r2=STACKTOP;r3=r1|0;r4=HEAP32[r3>>2];r5=HEAP32[r1+4>>2];r6=r4+1|0;r7=r5+1|0;r8=Math.imul(r7+r5|0,r6<<1)|1;r9=_malloc(r8);if((r9|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}L573:do{if((r7|0)>0){r10=(r6|0)>0;r11=r1+16|0;r12=r1+12|0;r13=0;r14=r9;while(1){r15=r14+1|0;L577:do{if(r10){r16=0;r17=r14;r18=r15;while(1){HEAP8[r17]=43;if((r16|0)<(r4|0)){HEAP8[r18]=45;r19=r17+2|0}else{r19=r18}r20=r16+1|0;r21=r19+1|0;if((r20|0)==(r6|0)){r22=r19;r23=r21;break L577}else{r16=r20;r17=r19;r18=r21}}}else{r22=r14;r23=r15}}while(0);HEAP8[r22]=10;if((r13|0)<(r5|0)){r15=r23+1|0;L586:do{if(r10){r18=0;r17=r23;r16=r15;while(1){HEAP8[r17]=124;do{if((r18|0)<(r4|0)){r21=Math.imul(HEAP32[r3>>2],r13)+r18|0;r20=HEAP32[HEAP32[r11>>2]+(r21<<2)>>2];r24=HEAP32[HEAP32[r12>>2]+(r21<<2)>>2];if((r20&1|0)!=0){if((r20&2|0)==0){HEAP8[r16]=35;r25=r17+2|0;break}else{HEAP8[r16]=r24+48&255;r25=r17+2|0;break}}if((r20&16|0)!=0){HEAP8[r16]=76;r25=r17+2|0;break}if((r20&8|0)!=0){HEAP8[r16]=120;r25=r17+2|0;break}r20=r17+2|0;if((r24|0)>0){HEAP8[r16]=46;r25=r20;break}else{HEAP8[r16]=32;r25=r20;break}}else{r25=r16}}while(0);r20=r18+1|0;r24=r25+1|0;if((r20|0)==(r6|0)){r26=r25;r27=r24;break L586}else{r18=r20;r17=r25;r16=r24}}}else{r26=r23;r27=r15}}while(0);HEAP8[r26]=10;r28=r27}else{r28=r23}r15=r13+1|0;if((r15|0)==(r7|0)){r29=r28;break L573}else{r13=r15;r14=r28}}}else{r29=r9}}while(0);HEAP8[r29]=0;if((r29+1-r9|0)==(r8|0)){STACKTOP=r2;return r9}___assert_func(66504,1809,68360,67508);STACKTOP=r2;return r9}function _new_ui(r1){var r2,r3;r1=STACKTOP;r2=_malloc(12),r3=r2>>2;if((r2|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r3+2]=0;HEAP32[r3+1]=0;HEAP32[r3]=0;STACKTOP=r1;return r2}}function _game_anim_length(r1,r2,r3,r4){return 0}function _game_compute_size(r1,r2,r3,r4){var r5,r6;r5=((r2|0)/2&-1)<<1;r6=r5+Math.imul(HEAP32[r1>>2],r2)|0;HEAP32[r3>>2]=r6;r6=Math.imul(HEAP32[r1+4>>2],r2)+r5|0;HEAP32[r4>>2]=r6;return}function _game_set_size(r1,r2,r3,r4){HEAP32[r2>>2]=r4;HEAP32[r2+4>>2]=((r4*3&-1)-3|0)/8&-1;return}function _game_flash_length(r1,r2,r3,r4){var r5;do{if((HEAP32[r1+20>>2]|0)==0){if((HEAP32[r2+20>>2]|0)==0){break}if((HEAP32[r1+24>>2]|0)!=0){break}if((HEAP32[r2+24>>2]|0)==0){r5=.30000001192092896}else{break}return r5}}while(0);r5=0;return r5}function _game_status(r1){return(HEAP32[r1+20>>2]|0)!=0&1}function _game_print_size(r1,r2,r3){var r4;r4=(HEAP32[r1+4>>2]*600&-1)+600|0;HEAPF32[r2>>2]=((HEAP32[r1>>2]*600&-1)+600|0)/100;HEAPF32[r3>>2]=(r4|0)/100;return}function _execute_move(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r3=STACKTOP;STACKTOP=STACKTOP+12|0;r4=r3,r5=r4>>2;r6=r3+4,r7=r6>>2;r8=r3+8;r9=_dup_game(r1),r1=r9>>2;r10=HEAP8[r2];L632:do{if(r10<<24>>24!=0){r11=r9|0;r12=r9+4|0;r13=r9+16|0;r14=r9+24|0;r15=r2;r16=r10;while(1){if(r16<<24>>24==83){HEAP32[r14>>2]=1;r17=r15+1|0}else if(r16<<24>>24==0){break}else{if(!(r16<<24>>24==76|r16<<24>>24==73)){break L632}r18=(_sscanf(r15+1|0,66140,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r4,HEAP32[tempInt+4>>2]=r6,HEAP32[tempInt+8>>2]=r8,tempInt))|0)!=2;r19=HEAP32[r5];r20=HEAP32[r7];if(r18|(r19|0)<0|(r20|0)<0){break L632}r18=HEAP32[r11>>2];if((r19|0)>=(r18|0)){break L632}if((r20|0)>=(HEAP32[r12>>2]|0)){break L632}r21=((Math.imul(r18,r20)+r19|0)<<2)+HEAP32[r13>>2]|0;r18=HEAP32[r21>>2];if((r18&1|0)!=0){break L632}if(r16<<24>>24==76){HEAP32[r21>>2]=r18&-9;_set_light(r9,HEAP32[r5],HEAP32[r7],r18>>>4&1^1)}else{_set_light(r9,r19,r20,0);r20=(Math.imul(HEAP32[r11>>2],HEAP32[r7])+HEAP32[r5]<<2)+HEAP32[r13>>2]|0;HEAP32[r20>>2]=HEAP32[r20>>2]^8}r17=r15+HEAP32[r8>>2]+1|0}r20=HEAP8[r17];if(r20<<24>>24==0){r15=r17;r16=0;continue}else if(r20<<24>>24!=59){break L632}r20=r17+1|0;r15=r20;r16=HEAP8[r20]}if((_grid_correct(r9)|0)==0){r22=r9;STACKTOP=r3;return r22}HEAP32[r1+5]=1;r22=r9;STACKTOP=r3;return r22}}while(0);r17=HEAP32[r1+3];if((r17|0)!=0){_free(r17)}r17=HEAP32[r1+4];if((r17|0)!=0){_free(r17)}if((r9|0)==0){r22=0;STACKTOP=r3;return r22}_free(r9);r22=0;STACKTOP=r3;return r22}function _game_free_drawstate(r1,r2){r1=HEAP32[r2+16>>2];if((r1|0)!=0){_free(r1)}_free(r2);return}function _game_redraw(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41;r7=STACKTOP;STACKTOP=STACKTOP+64|0;r5=r7;r3=r7+32,r9=r3>>2;if(r8!=0){r10=(r8*3/.30000001192092896&-1|0)!=1&1}else{r10=0}r8=r2+20|0;if((HEAP32[r8>>2]|0)==0){r11=(r2|0)>>2;r12=HEAP32[r11];r13=r2+8|0,r14=r13>>2;r15=((r12|0)/2&-1)<<1;r16=r15+Math.imul(HEAP32[r14],r12)|0;r17=(r2+12|0)>>2;r18=Math.imul(HEAP32[r17],r12)+r15|0;r15=(r1|0)>>2;r12=(r1+4|0)>>2;FUNCTION_TABLE[HEAP32[HEAP32[r15]+4>>2]](HEAP32[r12],0,0,r16,r18,0);r18=HEAP32[r11];r16=(r18|0)/2&-1;r19=r16-1|0;r20=Math.imul(HEAP32[r14],r18)+r16|0;r21=Math.imul(HEAP32[r17],r18)+r16|0;r16=r3|0;HEAP32[r16>>2]=r19;HEAP32[r9+1]=r19;HEAP32[r9+2]=r19;HEAP32[r9+3]=r21;HEAP32[r9+4]=r20;HEAP32[r9+5]=r21;HEAP32[r9+6]=r20;HEAP32[r9+7]=r19;FUNCTION_TABLE[HEAP32[HEAP32[r15]+12>>2]](HEAP32[r12],r16,4,-1,1);r16=HEAP32[r11];r11=((r16|0)/2&-1)<<1;r19=HEAP32[HEAP32[r15]+20>>2];if((r19|0)!=0){r15=HEAP32[r14];r14=Math.imul(HEAP32[r17],r16);r17=Math.imul(r15,r16)+r11|0;FUNCTION_TABLE[r19](HEAP32[r12],0,0,r17,r14+r11|0)}HEAP32[r8>>2]=1;r8=r13,r22=r8>>2}else{r8=r2+8|0,r22=r8>>2}r8=HEAP32[r22];if((r8|0)<=0){STACKTOP=r7;return}r13=r2+12|0;r11=r2+16|0;r14=r5|0;r5=(r2|0)>>2;r17=(r1|0)>>2;r12=(r1+4|0)>>2;r1=r3|0;r19=r3+4|0;r16=r3+8|0;r15=r3+12|0;r9=r3+16|0;r20=r3+20|0;r21=r3+24|0;r18=r3+28|0;r3=r2+4|0;r2=r4|0;r23=r4+12|0;r24=0;r25=HEAP32[r13>>2];r26=r8;while(1){if((r25|0)>0){r8=0;while(1){r27=_tile_flags(r4,r6,r24,r8,r10);r28=((Math.imul(HEAP32[r22],r8)+r24|0)<<2)+HEAP32[r11>>2]|0;do{if((r27|0)!=(HEAP32[r28>>2]|0)){HEAP32[r28>>2]=r27;r29=Math.imul(HEAP32[r22],r8)+r24|0;r30=HEAP32[HEAP32[r11>>2]+(r29<<2)>>2];r29=HEAP32[r5];r31=(r29|0)/2&-1;r32=Math.imul(r29,r24)+r31|0;r33=Math.imul(r29,r8)+r31|0;do{if((r30&1|0)==0){r31=r30&4;FUNCTION_TABLE[HEAP32[HEAP32[r17]+4>>2]](HEAP32[r12],r32,r33,r29,r29,(r31|0)!=0?(r30&128|0)!=0?1:4:0);r34=HEAP32[r5];r35=r32-1+r34|0;r36=r33-1+r34|0;HEAP32[r1>>2]=r32;HEAP32[r19>>2]=r33;HEAP32[r16>>2]=r32;HEAP32[r15>>2]=r36;HEAP32[r9>>2]=r35;HEAP32[r20>>2]=r36;HEAP32[r21>>2]=r35;HEAP32[r18>>2]=r33;FUNCTION_TABLE[HEAP32[HEAP32[r17]+12>>2]](HEAP32[r12],r1,4,-1,1);if((r30&8|0)!=0){r35=(HEAP32[r5]|0)/2&-1;FUNCTION_TABLE[HEAP32[HEAP32[r17]+16>>2]](HEAP32[r12],r35+r32|0,r35+r33|0,HEAP32[r3>>2],(r30>>>3&2)+3|0,2);break}if((r30&256|0)==0){break}r35=HEAP32[16384];if((r35|0)<0){r36=_getenv(66208);if((r36|0)==0){r37=1}else{r34=HEAP8[r36];r37=r34<<24>>24==121|r34<<24>>24==89}r34=r37&1;HEAP32[16384]=r34;r38=r34}else{r38=r35}if(!((r31|0)==0|(r38|0)!=0)){break}r31=HEAP32[r5];r35=(r31|0)/4&-1;r34=(r31|0)/2&-1;r36=(r31|0)/-8&-1;FUNCTION_TABLE[HEAP32[HEAP32[r17]+4>>2]](HEAP32[r12],r34+r32+r36|0,r34+r33+r36|0,r35,r35,2)}else{FUNCTION_TABLE[HEAP32[HEAP32[r17]+4>>2]](HEAP32[r12],r32,r33,r29,r29,2);if((r30&2|0)==0){break}r35=Math.imul(HEAP32[r2>>2],r8)+r24|0;_sprintf(r14,67432,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r23>>2]+(r35<<2)>>2],tempInt));r35=HEAP32[r5];r36=(r35|0)/2&-1;FUNCTION_TABLE[HEAP32[HEAP32[r17]>>2]](HEAP32[r12],r36+r32|0,r36+r33|0,1,(r35*3&-1|0)/5&-1,257,(r30>>>5&2)+3|0,r14)}}while(0);if((r30&32|0)!=0){r29=HEAP32[r5];r35=(r29|0)/8&-1;r36=r35+r32|0;r34=r35+r33|0;r31=r29-(r35<<1)|0;r35=r36-1+r31|0;r29=r34-1+r31|0;HEAP32[r1>>2]=r36;HEAP32[r19>>2]=r34;HEAP32[r16>>2]=r36;HEAP32[r15>>2]=r29;HEAP32[r9>>2]=r35;HEAP32[r20>>2]=r29;HEAP32[r21>>2]=r35;HEAP32[r18>>2]=r34;FUNCTION_TABLE[HEAP32[HEAP32[r17]+12>>2]](HEAP32[r12],r1,4,-1,6)}r34=HEAP32[r5];r35=HEAP32[HEAP32[r17]+20>>2];if((r35|0)==0){break}FUNCTION_TABLE[r35](HEAP32[r12],r32,r33,r34,r34)}}while(0);r27=r8+1|0;r39=HEAP32[r13>>2];if((r27|0)<(r39|0)){r8=r27}else{break}}r40=r39;r41=HEAP32[r22]}else{r40=r25;r41=r26}r8=r24+1|0;if((r8|0)<(r41|0)){r24=r8;r25=r40;r26=r41}else{break}}STACKTOP=r7;return}function _interpret_move(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27;r7=r1>>2;r1=0;r8=STACKTOP;STACKTOP=STACKTOP+80|0;r9=r8;do{if((r6|0)==514|(r6|0)==512){r10=r2+8|0;r11=(HEAP32[r10>>2]|0)==0?0:67364;HEAP32[r10>>2]=0;r10=HEAP32[r3>>2];r12=(r10|0)/-2&-1;r13=r11;r14=(r6|0)==512?1:2;r15=((r10+r5+r12|0)/(r10|0)&-1)-1|0;r16=((r10+r4+r12|0)/(r10|0)&-1)-1|0}else{r10=(r6|0)==526;if((r6-525|0)>>>0<2|(r6|0)==105|(r6|0)==73|(r6|0)==32|(r6|0)==13|(r6|0)==10){r12=r2+8|0;do{if((HEAP32[r12>>2]|0)==0){r17=0;r18=-1;r19=-1}else{r11=HEAP32[r2>>2];r20=HEAP32[r2+4>>2];if((r6|0)==105|(r6|0)==73){r17=2;r18=r20;r19=r11;break}r17=r10?2:1;r18=r20;r19=r11}}while(0);HEAP32[r12>>2]=1;r13=0;r14=r17;r15=r18;r16=r19;break}if(!((r6-521|0)>>>0<2|(r6|0)==524|(r6|0)==523)){r21=0;STACKTOP=r8;return r21}r10=r2|0;r11=r2+4|0;r20=HEAP32[r7];r22=HEAP32[r7+1];do{if((r6|0)==522){r23=1;r24=0;r1=516;break}else if((r6|0)==524){r23=0;r24=1;r1=516;break}else if((r6|0)==523){r23=0;r24=-1;r1=516;break}else if((r6|0)==521){r23=-1;r24=0;r1=516}}while(0);if(r1==516){r12=HEAP32[r10>>2]+r24|0;r25=(r12|0)>0?r12:0;r12=r20-1|0;HEAP32[r10>>2]=(r25|0)<(r12|0)?r25:r12;r12=HEAP32[r11>>2]+r23|0;r25=(r12|0)>0?r12:0;r12=r22-1|0;HEAP32[r11>>2]=(r25|0)<(r12|0)?r25:r12}HEAP32[r2+8>>2]=1;r21=67364;STACKTOP=r8;return r21}}while(0);if((r14|0)==1|(r14|0)==2){if((r15|r16|0)<0){r21=r13;STACKTOP=r8;return r21}r2=HEAP32[r7];if((r16|0)>=(r2|0)){r21=r13;STACKTOP=r8;return r21}if((r15|0)>=(HEAP32[r7+1]|0)){r21=r13;STACKTOP=r8;return r21}r23=Math.imul(r2,r15)+r16|0;r2=HEAP32[HEAP32[r7+4]+(r23<<2)>>2];if((r2&1|0)!=0){r21=r13;STACKTOP=r8;return r21}r23=(r2&24|0)==0;if((r14|0)==1){r26=r23?76:73}else{r26=r23?73:76}r23=r9|0;_sprintf(r23,67576,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r26,HEAP32[tempInt+4>>2]=r16,HEAP32[tempInt+8>>2]=r15,tempInt));r27=r23}else if((r14|0)==0){r21=r13;STACKTOP=r8;return r21}else{___assert_func(66504,1937,68328,67536);r27=r9|0}r9=_malloc(_strlen(r27)+1|0);if((r9|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r9,r27);r21=r9;STACKTOP=r8;return r21}function _game_colours(r1,r2){var r3,r4,r5,r6;r3=STACKTOP;r4=_malloc(84),r5=r4>>2;if((r4|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r6=r4;_frontend_default_colour(r1,r6);HEAPF32[r5+6]=0;HEAPF32[r5+9]=1;r1=HEAPF32[r6>>2];HEAPF32[r5+18]=r1*.5;HEAPF32[r5+3]=r1/1.5;HEAPF32[r5+7]=0;HEAPF32[r5+10]=1;r1=HEAPF32[r5+1];HEAPF32[r5+19]=r1*.5;HEAPF32[r5+4]=r1/1.5;HEAPF32[r5+8]=0;HEAPF32[r5+11]=1;r1=HEAPF32[r5+2];HEAPF32[r5+20]=r1*.5;HEAPF32[r5+5]=r1/1.5;HEAPF32[r5+15]=1;HEAPF32[r5+16]=.25;HEAPF32[r5+17]=.25;HEAPF32[r5+12]=1;HEAPF32[r5+13]=1;HEAPF32[r5+14]=0;HEAP32[r2>>2]=7;STACKTOP=r3;return r6}}function _game_new_drawstate(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r1=STACKTOP;r3=_malloc(24);if((r3|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r4=r3;HEAP32[r3+4>>2]=0;HEAP32[r3>>2]=0;r5=HEAP32[r2>>2];r6=(r3+8|0)>>2;HEAP32[r6]=r5;r7=HEAP32[r2+4>>2];r2=(r3+12|0)>>2;HEAP32[r2]=r7;r8=_malloc(Math.imul(r7<<2,r5));if((r8|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r5=r8;r8=r3+16|0;HEAP32[r8>>2]=r5;if((Math.imul(HEAP32[r2],HEAP32[r6])|0)>0){r9=0;r10=r5}else{r11=r3+20|0;r12=r11;HEAP32[r12>>2]=0;STACKTOP=r1;return r4}while(1){HEAP32[r10+(r9<<2)>>2]=-1;r5=r9+1|0;if((r5|0)>=(Math.imul(HEAP32[r2],HEAP32[r6])|0)){break}r9=r5;r10=HEAP32[r8>>2]}r11=r3+20|0;r12=r11;HEAP32[r12>>2]=0;STACKTOP=r1;return r4}function _game_timing_state(r1,r2){return 1}function _list_lights(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r6=0;r7=r5+12|0;HEAP32[r7>>2]=r2;r8=r5+8|0;HEAP32[r8>>2]=r2;HEAP32[r5>>2]=r2;r9=r5+20|0;HEAP32[r9>>2]=r3;r10=r5+16|0;HEAP32[r10>>2]=r3;HEAP32[r5+4>>2]=r3;HEAP32[r5+24>>2]=r4;r4=(r1|0)>>2;L782:do{if((r2|0)>0){r5=r1+16|0;r11=r2;r12=r2;while(1){r13=r11-1|0;r14=Math.imul(HEAP32[r4],r3)+r13|0;if((HEAP32[HEAP32[r5>>2]+(r14<<2)>>2]&1|0)!=0){break L782}if((r13|0)<(r12|0)){HEAP32[r8>>2]=r13;r15=r13}else{r15=r12}if((r13|0)>0){r11=r13;r12=r15}else{break L782}}}}while(0);r15=r2+1|0;r8=HEAP32[r4];L791:do{if((r15|0)<(r8|0)){r12=r1+16|0;r11=r15;r5=r8;r13=r2;while(1){r14=Math.imul(r5,r3)+r11|0;if((HEAP32[HEAP32[r12>>2]+(r14<<2)>>2]&1|0)!=0){r16=r5;break L791}if((r11|0)>(r13|0)){HEAP32[r7>>2]=r11;r17=r11;r18=HEAP32[r4]}else{r17=r13;r18=r5}r14=r11+1|0;if((r14|0)<(r18|0)){r11=r14;r5=r18;r13=r17}else{r16=r18;break L791}}}else{r16=r8}}while(0);L800:do{if((r3|0)>0){r8=r1+16|0;r18=r3;r17=r3;r7=r16;while(1){r15=r18-1|0;r13=Math.imul(r7,r15)+r2|0;if((HEAP32[HEAP32[r8>>2]+(r13<<2)>>2]&1|0)!=0){break L800}if((r15|0)<(r17|0)){HEAP32[r10>>2]=r15;r19=r15}else{r19=r17}if((r15|0)<=0){break L800}r18=r15;r17=r19;r7=HEAP32[r4]}}}while(0);r19=r3+1|0;r10=r1+4|0;r16=HEAP32[r10>>2];if((r19|0)>=(r16|0)){return}r7=r1+16|0;r1=r19;r19=r3;r3=r16;while(1){r16=Math.imul(HEAP32[r4],r1)+r2|0;if((HEAP32[HEAP32[r7>>2]+(r16<<2)>>2]&1|0)!=0){r6=581;break}if((r1|0)>(r19|0)){HEAP32[r9>>2]=r1;r20=r1;r21=HEAP32[r10>>2]}else{r20=r19;r21=r3}r16=r1+1|0;if((r16|0)<(r21|0)){r1=r16;r19=r20;r3=r21}else{r6=582;break}}if(r6==581){return}else if(r6==582){return}}function _game_print(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r4=STACKTOP;STACKTOP=STACKTOP+64|0;r5=r4,r6=r5>>2;r7=r4+32;r8=r2|0;r9=HEAP32[r8>>2];r10=HEAP32[r2+4>>2];r11=_print_mono_colour(r1,0);r12=_print_mono_colour(r1,1);r13=r3*3&-1;r14=(r13-3|0)/8&-1;r15=(r1|0)>>2;r16=HEAP32[HEAP32[r15]+84>>2];r17=(r1+4|0)>>2;r18=HEAP32[r17];r19=r1+20|0;r1=((r3|0)/16&-1|0)*Math.sqrt(HEAPF32[r19>>2]);FUNCTION_TABLE[r16](r18,r1);r1=(r3|0)/2&-1;r18=Math.imul(r9,r3);r16=Math.imul(r10,r3);r20=r1-1|0;r21=r20+r18|0;r22=r20+r16|0;r20=r5|0;HEAP32[r20>>2]=r1;HEAP32[r6+1]=r1;HEAP32[r6+2]=r1;HEAP32[r6+3]=r22;HEAP32[r6+4]=r21;HEAP32[r6+5]=r22;HEAP32[r6+6]=r21;HEAP32[r6+7]=r1;FUNCTION_TABLE[HEAP32[HEAP32[r15]+12>>2]](HEAP32[r17],r20,4,-1,r11);r20=HEAP32[HEAP32[r15]+84>>2];r6=HEAP32[r17];r21=((r3|0)/24&-1|0)*Math.sqrt(HEAPF32[r19>>2]);FUNCTION_TABLE[r20](r6,r21);L823:do{if((r9|0)>1){r21=r1+r16|0;r6=1;while(1){r20=Math.imul(r6,r3)+r1|0;FUNCTION_TABLE[HEAP32[HEAP32[r15]+8>>2]](HEAP32[r17],r20,r1,r20,r21,r11);r20=r6+1|0;if((r20|0)==(r9|0)){break L823}else{r6=r20}}}}while(0);L828:do{if((r10|0)>1){r16=r1+r18|0;r6=1;while(1){r21=Math.imul(r6,r3)+r1|0;FUNCTION_TABLE[HEAP32[HEAP32[r15]+8>>2]](HEAP32[r17],r1,r21,r16,r21,r11);r21=r6+1|0;if((r21|0)==(r10|0)){break L828}else{r6=r21}}}}while(0);if((r10|0)<=0){STACKTOP=r4;return}r18=(r9|0)>0;r6=r7|0;r7=r2+12|0;r16=(r13|0)/5&-1;r13=0;while(1){L838:do{if(r18){r21=Math.imul(r13,r3)+r1|0;r20=r21+r1|0;r19=0;while(1){r22=_tile_flags(r2,0,r19,r13,0);r5=Math.imul(r19,r3)+r1|0;do{if((r22&1|0)==0){if((r22&8|0)==0){break}FUNCTION_TABLE[HEAP32[HEAP32[r15]+16>>2]](HEAP32[r17],r5+r1|0,r20,r14,-1,r11)}else{FUNCTION_TABLE[HEAP32[HEAP32[r15]+4>>2]](HEAP32[r17],r5,r21,r3,r3,r11);if((r22&2|0)==0){break}r23=Math.imul(HEAP32[r8>>2],r13)+r19|0;_sprintf(r6,67432,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r7>>2]+(r23<<2)>>2],tempInt));FUNCTION_TABLE[HEAP32[HEAP32[r15]>>2]](HEAP32[r17],r5+r1|0,r20,1,r16,257,r12,r6)}}while(0);r5=r19+1|0;if((r5|0)==(r9|0)){break L838}else{r19=r5}}}}while(0);r19=r13+1|0;if((r19|0)==(r10|0)){break}else{r13=r19}}STACKTOP=r4;return}function _tile_flags(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r6=STACKTOP;STACKTOP=STACKTOP+52|0;r7=r6,r8=r7>>2;r9=r1|0;r10=Math.imul(HEAP32[r9>>2],r4)+r3|0;r11=r1+16|0;r12=HEAP32[HEAP32[r11>>2]+(r10<<2)>>2];r13=r1+12|0;r14=HEAP32[HEAP32[r13>>2]+(r10<<2)>>2];r10=(r5|0)==0?0:128;do{if((r2|0)==0){r15=r10}else{if((HEAP32[r2+8>>2]|0)==0){r15=r10;break}if((HEAP32[r2>>2]|0)!=(r3|0)){r15=r10;break}r15=(HEAP32[r2+4>>2]|0)==(r4|0)?r10|32:r10}}while(0);if((r12&1|0)==0){r10=(r14|0)>0?r15|4:r15;if((r12&16|0)==0){r16=r10}else{r16=r10|((r14|0)>1?24:8)}if((r12&8|0)==0){r17=r16;STACKTOP=r6;return r17}r17=r16|256;STACKTOP=r6;return r17}r16=r15|1;if((r12&2|0)==0){r17=r16;STACKTOP=r6;return r17}_get_surrounds(r1,r3,r4,r7);r7=HEAP32[r8+12];L869:do{if((r7|0)>0){r4=HEAP32[r9>>2];r3=HEAP32[r11>>2];r1=0;r12=0;r10=0;while(1){r2=Math.imul(HEAP32[((r10*12&-1)+4>>2)+r8],r4)+HEAP32[((r10*12&-1)>>2)+r8]|0;r5=HEAP32[r3+(r2<<2)>>2];do{if((r5&16|0)==0){if((r5&9|0)!=0){r18=r12;r19=r1;break}r18=((HEAP32[HEAP32[r13>>2]+(r2<<2)>>2]|0)==0&1)+r12|0;r19=r1}else{r18=r12;r19=r1+1|0}}while(0);r2=r10+1|0;if((r2|0)==(r7|0)){r20=r19;r21=r18;break L869}else{r1=r19;r12=r18;r10=r2}}}else{r20=0;r21=0}}while(0);if((r20|0)>(r14|0)){r22=1}else{r22=(r20+r21|0)<(r14|0)}r17=(r22?r15|65:r16)|2;STACKTOP=r6;return r17}function _get_surrounds(r1,r2,r3,r4){var r5,r6,r7,r8,r9;r5=r4>>2;r6=0;do{if((r2|0)>-1){if(!((HEAP32[r1>>2]|0)>(r2|0)&(r3|0)>-1)){r6=631;break}if((HEAP32[r1+4>>2]|0)>(r3|0)){break}else{r6=631;break}}else{r6=631}}while(0);if(r6==631){___assert_func(66504,162,68344,66232)}r6=(r4+48|0)>>2;HEAP32[r6]=0;if((r2|0)>0){HEAP32[r5]=r2-1|0;HEAP32[r5+1]=r3;HEAP32[r5+2]=0;HEAP32[r6]=1;r7=1}else{r7=0}if((HEAP32[r1>>2]-1|0)>(r2|0)){HEAP32[((r7*12&-1)>>2)+r5]=r2+1|0;HEAP32[((HEAP32[r6]*12&-1)+4>>2)+r5]=r3;HEAP32[((HEAP32[r6]*12&-1)+8>>2)+r5]=0;r4=HEAP32[r6]+1|0;HEAP32[r6]=r4;r8=r4}else{r8=r7}if((r3|0)>0){HEAP32[((r8*12&-1)>>2)+r5]=r2;HEAP32[((HEAP32[r6]*12&-1)+4>>2)+r5]=r3-1|0;HEAP32[((HEAP32[r6]*12&-1)+8>>2)+r5]=0;r7=HEAP32[r6]+1|0;HEAP32[r6]=r7;r9=r7}else{r9=r8}if((HEAP32[r1+4>>2]-1|0)<=(r3|0)){return}HEAP32[((r9*12&-1)>>2)+r5]=r2;HEAP32[((HEAP32[r6]*12&-1)+4>>2)+r5]=r3+1|0;HEAP32[((HEAP32[r6]*12&-1)+8>>2)+r5]=0;HEAP32[r6]=HEAP32[r6]+1|0;return}function _set_light(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r5=STACKTOP;STACKTOP=STACKTOP+28|0;r6=r5,r7=r6>>2;r8=(r1|0)>>2;r9=HEAP32[r8];r10=Math.imul(r9,r3)+r2|0;r11=r1+16|0;r12=HEAP32[r11>>2];if((HEAP32[r12+(r10<<2)>>2]&1|0)==0){r13=r9;r14=r12}else{___assert_func(66504,692,68120,66060);r13=HEAP32[r8];r14=HEAP32[r11>>2]}r11=((Math.imul(r13,r3)+r2<<2)+r14|0)>>2;r14=HEAP32[r11];r13=(r14&16|0)==0;do{if((r4|0)==0){if(r13){STACKTOP=r5;return}else{HEAP32[r11]=r14&-17;r12=r1+8|0;HEAP32[r12>>2]=HEAP32[r12>>2]-1|0;r15=-1;break}}else{if(r13){HEAP32[r11]=r14|16;r12=r1+8|0;HEAP32[r12>>2]=HEAP32[r12>>2]+1|0;r15=1;break}else{STACKTOP=r5;return}}}while(0);_list_lights(r1,r2,r3,1,r6);r6=HEAP32[r7+1];r3=HEAP32[r7+2];r2=HEAP32[r7+3];r14=HEAP32[r7];L917:do{if((r3|0)<=(r2|0)){r11=r1+12|0;r13=r3;while(1){if((r13|0)!=(r14|0)){r4=((Math.imul(HEAP32[r8],r6)+r13|0)<<2)+HEAP32[r11>>2]|0;HEAP32[r4>>2]=HEAP32[r4>>2]+r15|0}r4=r13+1|0;if((r4|0)>(r2|0)){break L917}else{r13=r4}}}}while(0);r2=HEAP32[r7+4];r3=HEAP32[r7+5];if((r2|0)>(r3|0)){STACKTOP=r5;return}r13=r1+12|0;if((HEAP32[r7+6]|0)==0){r16=r2}else{r7=r2;while(1){r2=((Math.imul(HEAP32[r8],r7)+r14|0)<<2)+HEAP32[r13>>2]|0;HEAP32[r2>>2]=HEAP32[r2>>2]+r15|0;r2=r7+1|0;if((r2|0)>(r3|0)){break}else{r7=r2}}STACKTOP=r5;return}while(1){if((r16|0)!=(r6|0)){r7=((Math.imul(HEAP32[r8],r16)+r14|0)<<2)+HEAP32[r13>>2]|0;HEAP32[r7>>2]=HEAP32[r7>>2]+r15|0}r7=r16+1|0;if((r7|0)>(r3|0)){break}else{r16=r7}}STACKTOP=r5;return}function _grid_correct(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+52|0;r4=r3;r5=(r1|0)>>2;r6=HEAP32[r5];if((r6|0)<=0){r7=1;STACKTOP=r3;return r7}r8=r1+4|0;r9=HEAP32[r8>>2];r10=(r9|0)>0;r11=(r1+16|0)>>2;r12=(r1+12|0)>>2;r13=0;L942:while(1){L944:do{if(r10){r14=HEAP32[r11];r15=0;while(1){r16=Math.imul(r15,r6)+r13|0;if((HEAP32[r14+(r16<<2)>>2]&1|0)==0){if((HEAP32[HEAP32[r12]+(r16<<2)>>2]|0)==0){r7=0;r2=693;break L942}}r16=r15+1|0;if((r16|0)<(r9|0)){r15=r16}else{break L944}}}}while(0);r15=r13+1|0;if((r15|0)<(r6|0)){r13=r15}else{break}}if(r2==693){STACKTOP=r3;return r7}L955:do{if(r10){r13=HEAP32[r11];r15=0;L957:while(1){r14=0;while(1){r16=Math.imul(r14,r6)+r15|0;if((HEAP32[r13+(r16<<2)>>2]&16|0)!=0){if((HEAP32[HEAP32[r12]+(r16<<2)>>2]|0)>1){r7=0;break L957}}r16=r14+1|0;if((r16|0)<(r9|0)){r14=r16}else{break}}r14=r15+1|0;if((r14|0)<(r6|0)){r15=r14}else{break L955}}STACKTOP=r3;return r7}}while(0);r10=r4+48|0;r15=0;r13=r9;r9=r6;L967:while(1){L969:do{if((r13|0)>0){r6=0;r14=r9;r16=r13;while(1){r17=Math.imul(r6,r14)+r15|0;if((HEAP32[HEAP32[r11]+(r17<<2)>>2]&2|0)==0){r18=r16;r19=r14}else{r20=HEAP32[HEAP32[r12]+(r17<<2)>>2];_get_surrounds(r1,r15,r6,r4);r17=HEAP32[r10>>2];L974:do{if((r17|0)>0){r21=HEAP32[r5];r22=HEAP32[r11];r23=0;r24=0;while(1){r25=Math.imul(HEAP32[r4+(r23*12&-1)+4>>2],r21);r26=(HEAP32[r22+(r25+HEAP32[r4+(r23*12&-1)>>2]<<2)>>2]>>>4&1)+r24|0;r25=r23+1|0;if((r25|0)==(r17|0)){r27=r26;break L974}else{r23=r25;r24=r26}}}else{r27=0}}while(0);if((r27|0)!=(r20|0)){r7=0;r2=694;break L967}r18=HEAP32[r8>>2];r19=HEAP32[r5]}r17=r6+1|0;if((r17|0)<(r18|0)){r6=r17;r14=r19;r16=r18}else{r28=r18;r29=r19;break L969}}}else{r28=r13;r29=r9}}while(0);r16=r15+1|0;if((r16|0)<(r29|0)){r15=r16;r13=r28;r9=r29}else{r7=1;r2=696;break}}if(r2==694){STACKTOP=r3;return r7}else if(r2==696){STACKTOP=r3;return r7}}function _solve_sub(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+240|0;r7=r6;r8=r6+52,r9=r8>>2;r10=r6+104;r11=r6+132,r12=r11>>2;r13=r6+184;r14=r6+212;do{if((r4|0)!=0){if((HEAP32[r4>>2]|0)>=(r3|0)){break}HEAP32[r4>>2]=r3}}while(0);r15=(r2&4|0)==0?0:5;r16=(r1|0)>>2;r17=(r1+4|0)>>2;r18=(r1+16|0)>>2;r19=(r1+12|0)>>2;r20=r11+48|0;r21=r13+4|0;r22=r13+8|0;r23=r13+12|0;r24=r13|0;r25=r13+16|0;r26=r13+20|0;r27=r13+24|0;r28=(r2&2|0)==0;r29=r10+4|0;r30=r10+8|0;r31=r10+12|0;r32=r10|0;r33=r10+16|0;r34=r10+20|0;r35=r10+24|0;r36=r8;r37=r7+48|0;r38=(r8+48|0)>>2;r8=0;L990:while(1){r39=HEAP32[r16];while(1){L994:do{if((r39|0)>0){r40=HEAP32[r17];if((r40|0)<=0){break}r41=HEAP32[r18];r42=0;while(1){r43=0;while(1){r44=Math.imul(r43,r39)+r42|0;if((HEAP32[r41+(r44<<2)>>2]&16|0)!=0){if((HEAP32[HEAP32[r19]+(r44<<2)>>2]|0)>1){r45=r8;r46=0;break L990}}r44=r43+1|0;if((r44|0)<(r40|0)){r43=r44}else{break}}r43=r42+1|0;if((r43|0)<(r39|0)){r42=r43}else{break L994}}}}while(0);if((_grid_correct(r1)|0)!=0){r45=r8;r46=1;break L990}r42=HEAP32[r16];if((r42|0)<=0){r45=r8;r46=0;break L990}r40=0;r41=0;r43=0;r44=HEAP32[r17];r47=r42;while(1){if((r44|0)>0){r42=r40;r48=r41;r49=0;while(1){r50=Math.imul(HEAP32[r16],r49)+r43|0;r51=HEAP32[HEAP32[r18]+(r50<<2)>>2];r52=HEAP32[HEAP32[r19]+(r50<<2)>>2];if((r51&9|0)==0){r53=(r52|0)<1&1}else{r53=0}r54=r53+r48|0;do{if((r52|0)>0){r55=r42}else{if((r51&1|0)!=0){r55=r42;break}_list_lights(r1,r43,r49,1,r13);r50=HEAP32[r21>>2];r56=HEAP32[r22>>2];r57=HEAP32[r23>>2];r58=HEAP32[r24>>2];L1019:do{if((r56|0)>(r57|0)){r59=0;r60=0;r61=0}else{r62=0;r63=0;r64=0;r65=r56;while(1){do{if((r65|0)==(r58|0)){r66=r64;r67=r63;r68=r62}else{r69=Math.imul(HEAP32[r16],r50)+r65|0;if((HEAP32[HEAP32[r18]+(r69<<2)>>2]&8|0)!=0){r66=r64;r67=r63;r68=r62;break}r70=(HEAP32[HEAP32[r19]+(r69<<2)>>2]|0)>0;r66=(r70&1^1)+r64|0;r67=r70?r63:r50;r68=r70?r62:r65}}while(0);r70=r65+1|0;if((r70|0)>(r57|0)){r59=r68;r60=r67;r61=r66;break L1019}else{r62=r68;r63=r67;r64=r66;r65=r70}}}}while(0);r57=HEAP32[r25>>2];r56=HEAP32[r26>>2];L1027:do{if((r57|0)>(r56|0)){r71=r59;r72=r60;r73=r61}else{r65=(HEAP32[r27>>2]|0)==0;r64=r59;r63=r60;r62=r61;r70=r57;while(1){do{if(r65&(r70|0)==(r50|0)){r74=r62;r75=r63;r76=r64}else{r69=Math.imul(HEAP32[r16],r70)+r58|0;if((HEAP32[HEAP32[r18]+(r69<<2)>>2]&8|0)!=0){r74=r62;r75=r63;r76=r64;break}r77=(HEAP32[HEAP32[r19]+(r69<<2)>>2]|0)>0;r74=(r77&1^1)+r62|0;r75=r77?r63:r70;r76=r77?r64:r58}}while(0);r77=r70+1|0;if((r77|0)>(r56|0)){r71=r76;r72=r75;r73=r74;break L1027}else{r64=r76;r63=r75;r62=r74;r70=r77}}}}while(0);if((r73|0)!=1){r55=r42;break}_set_light(r1,r71,r72,1);r55=1}}while(0);L1038:do{if((r51&2|0)==0){r78=0}else{_get_surrounds(r1,r43,r49,r11);r56=HEAP32[r20>>2];L1040:do{if((r56|0)>0){r58=HEAP32[r16];r50=HEAP32[r18];r57=r56;r70=0;r62=r52;while(1){r63=HEAP32[((r70*12&-1)>>2)+r12]+Math.imul(HEAP32[((r70*12&-1)+4>>2)+r12],r58)|0;r64=HEAP32[r50+(r63<<2)>>2];do{if((r64&16|0)==0){if((r64&9|0)==0){if((HEAP32[HEAP32[r19]+(r63<<2)>>2]|0)<1){r79=r62;r80=r57;break}}r65=r11+(r70*12&-1)+8|0;HEAP32[r65>>2]=HEAP32[r65>>2]|32;r79=r62;r80=r57-1|0}else{r65=r11+(r70*12&-1)+8|0;HEAP32[r65>>2]=HEAP32[r65>>2]|32;r79=r62-1|0;r80=r57-1|0}}while(0);r63=r70+1|0;r64=HEAP32[r20>>2];if((r63|0)<(r64|0)){r57=r80;r70=r63;r62=r79}else{r81=r80;r82=r79;r83=r64;break L1040}}}else{r81=r56;r82=r52;r83=r56}}while(0);if((r81|0)==0){r78=0;break}if((r82|0)==0){r56=((Math.imul(HEAP32[r16],r49)+r43|0)<<2)+HEAP32[r18]|0;HEAP32[r56>>2]=HEAP32[r56>>2]|4;if((r83|0)>0){r84=0;r85=0}else{r78=0;break}while(1){if((HEAP32[((r84*12&-1)+8>>2)+r12]&32|0)==0){r56=(Math.imul(HEAP32[r16],HEAP32[((r84*12&-1)+4>>2)+r12])+HEAP32[((r84*12&-1)>>2)+r12]<<2)+HEAP32[r18]|0;HEAP32[r56>>2]=HEAP32[r56>>2]|8;r86=1}else{r86=r85}r56=r84+1|0;if((r56|0)==(r83|0)){r78=r86;break L1038}else{r84=r56;r85=r86}}}if((r82|0)!=(r81|0)){r78=0;break}r56=((Math.imul(HEAP32[r16],r49)+r43|0)<<2)+HEAP32[r18]|0;HEAP32[r56>>2]=HEAP32[r56>>2]|4;if((r83|0)>0){r87=0;r88=0}else{r78=0;break}while(1){if((HEAP32[((r87*12&-1)+8>>2)+r12]&32|0)==0){_set_light(r1,HEAP32[((r87*12&-1)>>2)+r12],HEAP32[((r87*12&-1)+4>>2)+r12],1);r89=1}else{r89=r88}r56=r87+1|0;if((r56|0)==(r83|0)){r78=r89;break L1038}else{r87=r56;r88=r89}}}}while(0);r90=(r78|0)==0?r55:1;r52=r49+1|0;r91=HEAP32[r17];if((r52|0)<(r91|0)){r42=r90;r48=r54;r49=r52}else{break}}r92=r90;r93=r54;r94=r91;r95=HEAP32[r16]}else{r92=r40;r93=r41;r94=r44;r95=r47}r49=r43+1|0;if((r49|0)<(r95|0)){r40=r92;r41=r93;r43=r49;r44=r94;r47=r95}else{break}}if((r92|0)==0){break}else{r39=r95}}if((r93|0)==0){r45=r8;r46=0;break}if(r28){r96=r8;r97=r95;r5=809;break}if((r8|0)==0){r39=_malloc((HEAP32[r17]+r95)*12&-1);if((r39|0)==0){r5=760;break}r98=r39,r99=r98>>2;r100=HEAP32[r16]}else{r98=r8,r99=r98>>2;r100=r95}if((r100|0)<=0){r96=r98;r97=r100;r5=809;break}r39=r98;r47=0;r44=HEAP32[r17];r43=r100;while(1){L1081:do{if((r44|0)>0){r41=0;r40=r44;r49=r43;while(1){r48=Math.imul(r49,r41)+r47|0;r42=HEAP32[HEAP32[r18]+(r48<<2)>>2];do{if((r42&1|0)==0){if((HEAP32[HEAP32[r19]+(r48<<2)>>2]|0)!=0){r5=781;break}_memset(r39,0,(r40+r49)*12&-1);_list_lights(r1,r47,r41,1,r10);r52=HEAP32[r29>>2];r51=HEAP32[r30>>2];r56=HEAP32[r31>>2];r62=HEAP32[r32>>2];L1087:do{if((r51|0)>(r56|0)){r101=0}else{r70=0;r57=r51;while(1){do{if((r57|0)==(r62|0)){r102=r70}else{r50=HEAP32[r18];r58=Math.imul(HEAP32[r16],r52)+r57|0;if((HEAP32[r50+(r58<<2)>>2]&9|0)!=0){r102=r70;break}if((HEAP32[HEAP32[r19]+(r58<<2)>>2]|0)>=1){r102=r70;break}HEAP32[((r70*12&-1)>>2)+r99]=r57;HEAP32[((r70*12&-1)+4>>2)+r99]=r52;r102=r70+1|0}}while(0);r58=r57+1|0;if((r58|0)>(r56|0)){r101=r102;break L1087}else{r70=r102;r57=r58}}}}while(0);r56=HEAP32[r33>>2];r51=HEAP32[r34>>2];L1096:do{if((r56|0)>(r51|0)){r103=r101}else{r57=(HEAP32[r35>>2]|0)==0;r70=r101;r58=r56;while(1){do{if(r57&(r58|0)==(r52|0)){r104=r70}else{r50=HEAP32[r18];r64=Math.imul(HEAP32[r16],r58)+r62|0;if((HEAP32[r50+(r64<<2)>>2]&9|0)!=0){r104=r70;break}if((HEAP32[HEAP32[r19]+(r64<<2)>>2]|0)>=1){r104=r70;break}HEAP32[((r70*12&-1)>>2)+r99]=r62;HEAP32[((r70*12&-1)+4>>2)+r99]=r58;r104=r70+1|0}}while(0);r64=r58+1|0;if((r64|0)>(r51|0)){r103=r104;break L1096}else{r70=r104;r58=r64}}}}while(0);if((_discount_set(r1,r98,r103)|0)==0){break}else{r8=r98;continue L990}}else{r5=781}}while(0);do{if(r5==781){r5=0;if((r42&2|0)==0){break}r51=HEAP32[HEAP32[r19]+(r48<<2)>>2];if((r51|0)==0){break}_get_surrounds(r1,r47,r41,r7);_memset(r36,0,52);r62=HEAP32[r37>>2];if((r62|0)<=0){break}r52=HEAP32[r16];r56=HEAP32[r18];r58=0;r70=r51;r51=0;while(1){r57=HEAP32[r7+(r58*12&-1)>>2];r64=HEAP32[r7+(r58*12&-1)+4>>2];r50=Math.imul(r64,r52)+r57|0;r63=HEAP32[r56+(r50<<2)>>2];r105=(r63<<27>>31)+r70|0;do{if((r63&9|0)==0){if((HEAP32[HEAP32[r19]+(r50<<2)>>2]|0)>=1){r106=r51;break}HEAP32[((r51*12&-1)>>2)+r9]=r57;HEAP32[((HEAP32[r38]*12&-1)+4>>2)+r9]=r64;r65=HEAP32[r38]+1|0;HEAP32[r38]=r65;r106=r65}else{r106=r51}}while(0);r64=r58+1|0;if((r64|0)==(r62|0)){break}else{r58=r64;r70=r105;r51=r106}}if((r106|0)==0){break}if((r105|0)<0|(r105|0)>(r106|0)){break}r51=_new_combi(1-r105+r106|0,r106);r70=(r51|0)>>2;r58=(r51+8|0)>>2;r62=r51+12|0;r56=(r51|0)==0;r52=(r51+16|0)>>2;r64=r51+4|0;r57=0;while(1){r50=HEAP32[r58];if((r50|0)==(HEAP32[r62>>2]|0)){r107=r50}else{if((r50|0)<1){break}r50=HEAP32[r70];r63=HEAP32[r52];r65=HEAP32[r64>>2]-r50|0;r77=r50;while(1){r108=r77-1|0;r109=(r108<<2)+r63|0;r110=HEAP32[r109>>2];if((r110|0)==(r65+r108|0)){r77=r108}else{break}}HEAP32[r109>>2]=r110+1|0;L1128:do{if((r77|0)<(HEAP32[r70]|0)){r65=1-r77|0;r63=r77;while(1){r50=HEAP32[r52];HEAP32[r50+(r63<<2)>>2]=r65+r63+HEAP32[r50+(r108<<2)>>2]|0;r50=r63+1|0;if((r50|0)<(HEAP32[r70]|0)){r63=r50}else{break L1128}}}}while(0);r107=HEAP32[r58]}HEAP32[r58]=r107-1|0;if(r56){break}_memset(r39,0,(HEAP32[r17]+HEAP32[r16])*12&-1);L1135:do{if((HEAP32[r70]|0)>0){r77=0;while(1){HEAP32[((r77*12&-1)>>2)+r99]=HEAP32[((HEAP32[HEAP32[r52]+(r77<<2)>>2]*12&-1)>>2)+r9];HEAP32[((r77*12&-1)+4>>2)+r99]=HEAP32[((HEAP32[HEAP32[r52]+(r77<<2)>>2]*12&-1)+4>>2)+r9];r63=r77+1|0;if((r63|0)<(HEAP32[r70]|0)){r77=r63}else{r111=r63;break L1135}}}else{r111=0}}while(0);r57=(_discount_set(r1,r98,r111)|0)==0?r57:1}r70=HEAP32[r52];if((r70|0)!=0){_free(r70)}_free(r51);if((r57|0)!=0){r8=r98;continue L990}}}while(0);r48=r41+1|0;r42=HEAP32[r17];r70=HEAP32[r16];if((r48|0)<(r42|0)){r41=r48;r40=r42;r49=r70}else{r112=r42;r113=r70;break L1081}}}else{r112=r44;r113=r43}}while(0);r49=r47+1|0;if((r49|0)<(r113|0)){r47=r49;r44=r112;r43=r113}else{r96=r98;r97=r113;r5=809;break L990}}}if(r5==760){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}do{if(r5==809){if((r15|0)<=(r3|0)){r45=r96;r46=-1;break}do{if((r97|0)>0){r113=r14+4|0;r98=r14+8|0;r112=r14+12|0;r8=r14|0;r111=r14+16|0;r9=r14+20|0;r99=r14+24|0;r107=-1;r108=-1;r110=0;r109=0;r106=HEAP32[r17];r105=r97;while(1){L1154:do{if((r106|0)>0){r38=r107;r7=r108;r37=r110;r36=0;r103=r106;r104=r105;while(1){r101=Math.imul(r104,r36)+r109|0;do{if((HEAP32[HEAP32[r18]+(r101<<2)>>2]&9|0)==0){if((HEAP32[HEAP32[r19]+(r101<<2)>>2]|0)>=1){r114=r37;r115=r7;r116=r38;r117=r103;break}_list_lights(r1,r109,r36,1,r14);r35=HEAP32[r113>>2];r34=HEAP32[r98>>2];r33=HEAP32[r112>>2];r102=HEAP32[r8>>2];L1160:do{if((r34|0)>(r33|0)){r118=0}else{r32=0;r31=r34;while(1){if((r31|0)==(r102|0)){r119=r32}else{r30=Math.imul(HEAP32[r16],r35)+r31|0;r119=((HEAP32[HEAP32[r19]+(r30<<2)>>2]|0)==0&1)+r32|0}r30=r31+1|0;if((r30|0)>(r33|0)){r118=r119;break L1160}else{r32=r119;r31=r30}}}}while(0);r33=HEAP32[r111>>2];r34=HEAP32[r9>>2];L1167:do{if((r33|0)>(r34|0)){r120=r118}else{r31=(HEAP32[r99>>2]|0)==0;r32=r118;r30=r33;while(1){if(r31&(r30|0)==(r35|0)){r121=r32}else{r29=Math.imul(HEAP32[r16],r30)+r102|0;r121=((HEAP32[HEAP32[r19]+(r29<<2)>>2]|0)==0&1)+r32|0}r29=r30+1|0;if((r29|0)>(r34|0)){r120=r121;break L1167}else{r32=r121;r30=r29}}}}while(0);r34=(r120|0)>(r37|0);r114=r34?r120:r37;r115=r34?r36:r7;r116=r34?r109:r38;r117=HEAP32[r17]}else{r114=r37;r115=r7;r116=r38;r117=r103}}while(0);r101=r36+1|0;r57=HEAP32[r16];if((r101|0)<(r117|0)){r38=r116;r7=r115;r37=r114;r36=r101;r103=r117;r104=r57}else{r122=r116;r123=r115;r124=r114;r125=r117;r126=r57;break L1154}}}else{r122=r107;r123=r108;r124=r110;r125=r106;r126=r105}}while(0);r104=r109+1|0;if((r104|0)<(r126|0)){r107=r122;r108=r123;r110=r124;r109=r104;r106=r125;r105=r126}else{break}}if((r124|0)>0){r127=r123;r128=r122;break}else{r129=r123;r130=r122;r5=828;break}}else{r129=-1;r130=-1;r5=828}}while(0);if(r5==828){___assert_func(66504,1355,68108,67352);r127=r129;r128=r130}if((r127|r128|0)<=-1){___assert_func(66504,1356,68108,67324)}r105=_dup_game(r1),r106=r105>>2;r109=((Math.imul(HEAP32[r16],r127)+r128|0)<<2)+HEAP32[r18]|0;HEAP32[r109>>2]=HEAP32[r109>>2]|8;r109=r3+1|0;r110=_solve_sub(r1,r2,r109,r4);r108=(r2&1|0)!=0;if((r110|0)>0&(r108^1)){r107=HEAP32[r106+3];if((r107|0)!=0){_free(r107)}r107=HEAP32[r106+4];if((r107|0)!=0){_free(r107)}if((r105|0)==0){r45=r96;r46=r110;break}_free(r105);r45=r96;r46=r110;break}_set_light(r105,r128,r127,1);r107=_solve_sub(r105,r2,r109,r4);do{if(r108){if((r107|r110|0)<0){r131=-1;break}else{r5=840;break}}else{r5=840}}while(0);do{if(r5==840){if((r107|0)<1){r131=r110;break}if((r110|0)<1){r108=r105|0;r109=r105+4|0;_memcpy(HEAP32[r19],HEAP32[r106+3],Math.imul(HEAP32[r108>>2]<<2,HEAP32[r109>>2]));_memcpy(HEAP32[r18],HEAP32[r106+4],Math.imul(HEAP32[r108>>2]<<2,HEAP32[r109>>2]));r131=r107;break}else{r131=r107+r110|0;break}}}while(0);r110=HEAP32[r106+3];if((r110|0)!=0){_free(r110)}r110=HEAP32[r106+4];if((r110|0)!=0){_free(r110)}if((r105|0)==0){r45=r96;r46=r131;break}_free(r105);r45=r96;r46=r131}}while(0);if((r45|0)==0){STACKTOP=r6;return r46}_free(r45);STACKTOP=r6;return r46}function _trl_callback_incn(r1,r2,r3,r4,r5,r6){r5=r6+8|0;HEAP32[r5>>2]=HEAP32[r5>>2]+1|0;return}function _trl_callback_search(r1,r2,r3,r4,r5,r6){var r7;r6=0;if((r5|0)>0){r7=0}else{return}while(1){if((HEAP32[r4+(r7*12&-1)>>2]|0)==(r2|0)){if((HEAP32[r4+(r7*12&-1)+4>>2]|0)==(r3|0)){break}}r1=r7+1|0;if((r1|0)<(r5|0)){r7=r1}else{r6=862;break}}if(r6==862){return}HEAP32[r4+(r7*12&-1)+8>>2]=1;return}function _discount_set(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r4=STACKTOP;STACKTOP=STACKTOP+4|0;r5=r4;HEAP32[r5>>2]=0;if((r3|0)==0){r6=0;STACKTOP=r4;return r6}r7=(r3|0)>0;L1232:do{if(r7){r8=0;while(1){r9=r2+(r8*12&-1)|0;_try_rule_out(r1,HEAP32[r9>>2],HEAP32[r2+(r8*12&-1)+4>>2],r2,r3,10,r9);r9=r8+1|0;if((r9|0)==(r3|0)){break}else{r8=r9}}if(!r7){r10=-1;break}r8=0;r9=-1;r11=HEAP32[r1+4>>2]+HEAP32[r1>>2]|0;while(1){r12=HEAP32[r2+(r8*12&-1)+8>>2];r13=(r12|0)<(r11|0);r14=r13?r8:r9;r15=r8+1|0;if((r15|0)==(r3|0)){r10=r14;break L1232}else{r8=r15;r9=r14;r11=r13?r12:r11}}}else{r10=-1}}while(0);_try_rule_out(r1,HEAP32[r2+(r10*12&-1)>>2],HEAP32[r2+(r10*12&-1)+4>>2],r2,r3,8,r5);r6=HEAP32[r5>>2];STACKTOP=r4;return r6}function _try_rule_out(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r8=STACKTOP;STACKTOP=STACKTOP+132|0;r9=r8,r10=r9>>2;r11=r8+28,r12=r11>>2;r13=r8+80,r14=r13>>2;_list_lights(r1,r2,r3,0,r9);r9=HEAP32[r10+1];r15=HEAP32[r10+2];r16=HEAP32[r10+3];r17=HEAP32[r10];L1242:do{if((r15|0)<=(r16|0)){r18=r1|0;r19=r1+16|0;r20=r1+12|0;r21=r15;while(1){do{if((r21|0)!=(r17|0)){r22=HEAP32[r19>>2];r23=Math.imul(HEAP32[r18>>2],r9)+r21|0;if((HEAP32[r22+(r23<<2)>>2]&9|0)!=0){break}if((HEAP32[HEAP32[r20>>2]+(r23<<2)>>2]|0)>=1){break}FUNCTION_TABLE[r6](r1,r21,r9,r4,r5,r7)}}while(0);r23=r21+1|0;if((r23|0)>(r16|0)){break L1242}else{r21=r23}}}}while(0);r16=HEAP32[r10+4];r15=HEAP32[r10+5];L1252:do{if((r16|0)<=(r15|0)){r21=(HEAP32[r10+6]|0)==0;r20=r1|0;r18=r1+16|0;r19=r1+12|0;r23=r16;while(1){do{if(!(r21&(r23|0)==(r9|0))){r22=HEAP32[r18>>2];r24=Math.imul(HEAP32[r20>>2],r23)+r17|0;if((HEAP32[r22+(r24<<2)>>2]&9|0)!=0){break}if((HEAP32[HEAP32[r19>>2]+(r24<<2)>>2]|0)>=1){break}FUNCTION_TABLE[r6](r1,r17,r23,r4,r5,r7)}}while(0);r24=r23+1|0;if((r24|0)>(r15|0)){break L1252}else{r23=r24}}}}while(0);_get_surrounds(r1,r2,r3,r11);r11=HEAP32[r12+12];if((r11|0)<=0){STACKTOP=r8;return}r15=(r1|0)>>2;r17=(r1+16|0)>>2;r9=r13+48|0;r16=r1+12|0;r10=0;while(1){r23=HEAP32[((r10*12&-1)+4>>2)+r12];r19=Math.imul(HEAP32[r15],r23);r20=HEAP32[((r10*12&-1)>>2)+r12];L1267:do{if((HEAP32[HEAP32[r17]+(r19+r20<<2)>>2]&2|0)!=0){_get_surrounds(r1,r20,r23,r13);r18=HEAP32[r9>>2];r21=(r18|0)>0;r24=HEAP32[r15];if(r21){r22=HEAP32[r17];r25=0;r26=0;while(1){r27=Math.imul(r24,HEAP32[((r26*12&-1)+4>>2)+r14]);r28=(HEAP32[r22+(r27+HEAP32[((r26*12&-1)>>2)+r14]<<2)>>2]>>>4&1)+r25|0;r27=r26+1|0;if((r27|0)<(r18|0)){r25=r28;r26=r27}else{break}}r29=r28+1|0}else{r29=1}r26=Math.imul(r24,r23)+r20|0;if((r29|0)!=(HEAP32[HEAP32[r16>>2]+(r26<<2)>>2]|0)|r21^1){break}else{r30=0}while(1){r26=HEAP32[((r30*12&-1)>>2)+r14];r25=HEAP32[((r30*12&-1)+4>>2)+r14];do{if(!((r26|0)==(r2|0)&(r25|0)==(r3|0))){r22=HEAP32[r17];r27=Math.imul(HEAP32[r15],r25)+r26|0;if((HEAP32[r22+(r27<<2)>>2]&9|0)!=0){break}if((HEAP32[HEAP32[r16>>2]+(r27<<2)>>2]|0)>=1){break}FUNCTION_TABLE[r6](r1,r26,r25,r4,r5,r7)}}while(0);r25=r30+1|0;if((r25|0)<(r18|0)){r30=r25}else{break L1267}}}}while(0);r20=r10+1|0;if((r20|0)<(r11|0)){r10=r20}else{break}}STACKTOP=r8;return}function _trl_callback_discount(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11;r7=0;r8=r6;r6=r1|0;r9=Math.imul(HEAP32[r6>>2],r3)+r2|0;r10=r1+16|0;if((HEAP32[HEAP32[r10>>2]+(r9<<2)>>2]&8|0)!=0){return}L1288:do{if((r5|0)>0){r9=0;while(1){HEAP32[r4+(r9*12&-1)+8>>2]=0;r11=r9+1|0;if((r11|0)==(r5|0)){break L1288}else{r9=r11}}}}while(0);_try_rule_out(r1,r2,r3,r4,r5,66,0);r1=0;while(1){if((r1|0)>=(r5|0)){break}if((HEAP32[r4+(r1*12&-1)+8>>2]|0)==0){r7=915;break}else{r1=r1+1|0}}if(r7==915){return}r7=((Math.imul(HEAP32[r6>>2],r3)+r2|0)<<2)+HEAP32[r10>>2]|0;HEAP32[r7>>2]=HEAP32[r7>>2]|8;HEAP32[r8>>2]=1;return}function _puzzle_is_good(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3;HEAP32[r4>>2]=0;if((r2|0)>=3){___assert_func(66504,1247,68380,67044)}r5=(r2|0)>0?3:1;r6=(r2|0)>1?r5|4:r5;r5=(r1|0)>>2;r2=HEAP32[r5];L1303:do{if((r2|0)>0){r7=(r1+4|0)>>2;r8=(r1+16|0)>>2;r9=HEAP32[r7];r10=0;r11=r9;r12=r2;r13=r2;r14=r9;while(1){L1307:do{if((r11|0)>0){r9=0;r15=r12;while(1){r16=Math.imul(r9,r15)+r10|0;r17=HEAP32[r8];if((HEAP32[r17+(r16<<2)>>2]&16|0)==0){r18=r15;r19=r17}else{_set_light(r1,r10,r9,0);r18=HEAP32[r5];r19=HEAP32[r8]}r17=(Math.imul(r18,r9)+r10<<2)+r19|0;HEAP32[r17>>2]=HEAP32[r17>>2]&-9;r17=((Math.imul(HEAP32[r5],r9)+r10|0)<<2)+HEAP32[r8]|0;HEAP32[r17>>2]=HEAP32[r17>>2]&-5;r17=r9+1|0;r16=HEAP32[r7];r20=HEAP32[r5];if((r17|0)<(r16|0)){r9=r17;r15=r20}else{r21=r16;r22=r20;r23=r20;r24=r16;break L1307}}}else{r21=r11;r22=r12;r23=r13;r24=r14}}while(0);r15=r10+1|0;if((r15|0)<(r22|0)){r10=r15;r11=r21;r12=r22;r13=r23;r14=r24}else{break}}if((r23|0)>0){r25=0;r26=r24;r27=r23}else{break}while(1){L1317:do{if((r26|0)>0){r14=0;r13=r27;while(1){r12=((Math.imul(r14,r13)+r25|0)<<2)+HEAP32[r8]|0;HEAP32[r12>>2]=HEAP32[r12>>2]&-5;r12=r14+1|0;r11=HEAP32[r7];r10=HEAP32[r5];if((r12|0)<(r11|0)){r14=r12;r13=r10}else{r28=r11;r29=r10;break L1317}}}else{r28=r26;r29=r27}}while(0);r13=r25+1|0;if((r13|0)<(r29|0)){r25=r13;r26=r28;r27=r29}else{break L1303}}}}while(0);r29=_solve_sub(r1,r6,0,r4);do{if((r6&4|0)==0){if((HEAP32[r4>>2]|0)>0|(r29|0)<1){r30=0}else{break}STACKTOP=r3;return r30}else{if((r29|0)<1){r30=0}else{break}STACKTOP=r3;return r30}}while(0);r30=(r29|0)<2&1;STACKTOP=r3;return r30}function _check_dark(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+28|0;r6=r5,r7=r6>>2;_list_lights(r1,r2,r3,1,r6);r6=HEAP32[r7+1];r3=HEAP32[r7+2];r2=HEAP32[r7+3];r8=HEAP32[r7];L1330:do{if((r3|0)<=(r2|0)){r9=r1|0;r10=r1+12|0;r11=r3;while(1){if((r11|0)!=(r8|0)){r12=Math.imul(HEAP32[r9>>2],r6)+r11|0;if((HEAP32[HEAP32[r10>>2]+(r12<<2)>>2]|0)==1){r13=1;break}}r12=r11+1|0;if((r12|0)>(r2|0)){break L1330}else{r11=r12}}STACKTOP=r5;return r13}}while(0);r2=HEAP32[r7+4];r3=HEAP32[r7+5];if((r2|0)>(r3|0)){r13=0;STACKTOP=r5;return r13}r11=r1|0;r10=r1+12|0;if((HEAP32[r7+6]|0)==0){r14=r2}else{r7=r2;while(1){r2=Math.imul(HEAP32[r11>>2],r7)+r8|0;if((HEAP32[HEAP32[r10>>2]+(r2<<2)>>2]|0)==1){r13=1;r4=956;break}r2=r7+1|0;if((r2|0)>(r3|0)){r13=0;r4=953;break}else{r7=r2}}if(r4==956){STACKTOP=r5;return r13}else if(r4==953){STACKTOP=r5;return r13}}while(1){if((r14|0)!=(r6|0)){r7=Math.imul(HEAP32[r11>>2],r14)+r8|0;if((HEAP32[HEAP32[r10>>2]+(r7<<2)>>2]|0)==1){r13=1;r4=951;break}}r7=r14+1|0;if((r7|0)>(r3|0)){r13=0;r4=955;break}else{r14=r7}}if(r4==951){STACKTOP=r5;return r13}else if(r4==955){STACKTOP=r5;return r13}}function _status_bar(r1,r2){var r3,r4,r5,r6;r3=r1|0;if((HEAP32[HEAP32[r3>>2]+40>>2]|0)==0){return}r4=r1+24|0;r5=HEAP32[r4>>2];if((r5|0)==0){___assert_func(66304,198,68096,67036);r6=HEAP32[r4>>2]}else{r6=r5}r5=_midend_rewrite_statusbar(r6,r2);r2=(r1+28|0)>>2;r6=HEAP32[r2];do{if((r6|0)!=0){if((_strcmp(r5,r6)|0)!=0){break}if((r5|0)==0){return}_free(r5);return}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+40>>2]](HEAP32[r1+4>>2],r5);r1=HEAP32[r2];if((r1|0)!=0){_free(r1)}HEAP32[r2]=r5;return}function _new_state(r1){var r2,r3,r4,r5,r6,r7,r8;r2=STACKTOP;r3=_malloc(28),r4=r3>>2;if((r3|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r5=HEAP32[r1>>2];r6=r3>>2;HEAP32[r6]=r5;r7=HEAP32[r1+4>>2];r1=(r3+4|0)>>2;HEAP32[r1]=r7;r8=_malloc(Math.imul(r7<<2,r5));if((r8|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4+3]=r8;HEAP32[r4+2]=0;_memset(r8,0,Math.imul(HEAP32[r6]<<2,HEAP32[r1]));r8=_malloc(Math.imul(HEAP32[r6]<<2,HEAP32[r1]));if((r8|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r4+4]=r8;_memset(r8,0,Math.imul(HEAP32[r6]<<2,HEAP32[r1]));HEAP32[r4+6]=0;HEAP32[r4+5]=0;STACKTOP=r2;return r3}}function _new_combi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r3=STACKTOP;if((r1|0)>(r2|0)){___assert_func(66336,29,68200,67416)}if((r2|0)<=0){___assert_func(66336,30,68200,67068)}r4=_malloc(20),r5=r4>>2;if((r4|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r6=r4;HEAP32[r5]=0;HEAP32[r5+1]=0;HEAP32[r5+2]=0;HEAP32[r5+3]=0;HEAP32[r5+4]=0;r7=r4>>2;HEAP32[r7]=r1;HEAP32[r5+1]=r2;r8=r1<<2;r9=_malloc(r8);if((r9|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=r4+16|0;HEAP32[r10>>2]=r9;_memset(r9,0,r8);r8=r1+1|0;L1399:do{if((r8|0)>(r2|0)){r11=1}else{r9=1;r4=r8;while(1){r12=Math.imul(r9,r4);r13=r4+1|0;if((r13|0)>(r2|0)){r11=r12;break L1399}else{r9=r12;r4=r13}}}}while(0);L1403:do{if((r2-r1|0)<1){r14=1}else{r8=r2+1-r1|0;r4=1;r9=1;while(1){r13=Math.imul(r4,r9);r12=r9+1|0;if((r12|0)==(r8|0)){r14=r13;break L1403}else{r4=r13;r9=r12}}}}while(0);r1=(r11|0)/(r14|0)&-1;HEAP32[r5+3]=r1;HEAP32[r5+2]=r1;if((HEAP32[r7]|0)>0){r15=0}else{STACKTOP=r3;return r6}while(1){HEAP32[HEAP32[r10>>2]+(r15<<2)>>2]=r15;r1=r15+1|0;if((r1|0)<(HEAP32[r7]|0)){r15=r1}else{break}}STACKTOP=r3;return r6}function _print_mono_colour(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=STACKTOP;r4=r2|0;r2=(r1+12|0)>>2;r5=HEAP32[r2];r6=r1+16|0;do{if((r5|0)<(HEAP32[r6>>2]|0)){r7=r5;r8=HEAP32[r1+8>>2]}else{r9=r5+16|0;HEAP32[r6>>2]=r9;r10=r1+8|0;r11=HEAP32[r10>>2];r12=r9*24&-1;if((r11|0)==0){r13=_malloc(r12)}else{r13=_realloc(r11,r12)}if((r13|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r12=r13;HEAP32[r10>>2]=r12;r7=HEAP32[r2];r8=r12;break}}}while(0);r13=(r1+8|0)>>2;HEAP32[r8+(r7*24&-1)>>2]=-1;HEAP32[HEAP32[r13]+(HEAP32[r2]*24&-1)+4>>2]=0;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+8>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+12>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+16>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+20>>2]=r4;r4=HEAP32[r2];HEAP32[r2]=r4+1|0;STACKTOP=r3;return r4}function _fatal(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3;_fwrite(66180,13,1,HEAP32[_stderr>>2]);HEAP32[r4>>2]=r2;_fprintf(HEAP32[_stderr>>2],r1,HEAP32[r4>>2]);_fputc(10,HEAP32[_stderr>>2]);_exit(1)}function _canvas_text_fallback(r1,r2,r3){r3=STACKTOP;r1=HEAP32[r2>>2];r2=_malloc(_strlen(r1)+1|0);if((r2|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r2,r1);STACKTOP=r3;return r2}}function _init_game(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3,r5=r4>>2;r6=_midend_new(r1,65540,65940,r2);_frontend_set_game_info(r1,r6,67612,1,1,1,0,0,0,0);r7=_midend_num_presets(r6);HEAP32[r5]=r7;L1431:do{if((r7|0)>0){r8=r6+24|0;r9=r6+16|0;r10=r6+12|0;r11=0;while(1){if((HEAP32[r8>>2]|0)<=(r11|0)){___assert_func(66516,1056,68308,67368)}_frontend_add_preset(r1,HEAP32[HEAP32[r9>>2]+(r11<<2)>>2],HEAP32[HEAP32[r10>>2]+(r11<<2)>>2]);r12=r11+1|0;if((r12|0)<(HEAP32[r5]|0)){r11=r12}else{break L1431}}}}while(0);r1=_midend_colours(r6,r4)>>2;if((HEAP32[r5]|0)>0){r13=0}else{STACKTOP=r3;return}while(1){r4=r13*3&-1;_canvas_set_palette_entry(r2,r13,HEAPF32[(r4<<2>>2)+r1]*255&-1,HEAPF32[(r4+1<<2>>2)+r1]*255&-1,HEAPF32[(r4+2<<2>>2)+r1]*255&-1);r4=r13+1|0;if((r4|0)<(HEAP32[r5]|0)){r13=r4}else{break}}STACKTOP=r3;return}function _midend_size(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r5=r1>>2;r6=STACKTOP;STACKTOP=STACKTOP+8|0;r7=r6;r8=r6+4;r9=(r1+76|0)>>2;r10=HEAP32[r9];do{if((r10|0)!=0){if((HEAP32[r5+33]|0)<=0){break}r11=r1+8|0;r12=r1+120|0;FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+140>>2]](HEAP32[r12>>2],r10);r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+136>>2]](HEAP32[r12>>2],HEAP32[HEAP32[r5+16]>>2]);HEAP32[r9]=r13}}while(0);r10=(r4|0)!=0;L1449:do{if(r10){r4=r1+8|0;r13=r1+68|0;r12=1;while(1){r11=r12<<1;FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+124>>2]](HEAP32[r13>>2],r11,r7,r8);if((HEAP32[r7>>2]|0)>(HEAP32[r2>>2]|0)){r14=r11;r15=r4,r16=r15>>2;r17=r13,r18=r17>>2;break L1449}if((HEAP32[r8>>2]|0)>(HEAP32[r3>>2]|0)){r14=r11;r15=r4,r16=r15>>2;r17=r13,r18=r17>>2;break L1449}else{r12=r11}}}else{r14=HEAP32[r5+32]+1|0;r15=r1+8|0,r16=r15>>2;r17=r1+68|0,r18=r17>>2}}while(0);r17=1;r15=r14;L1456:while(1){r19=r17;while(1){if((r15-r19|0)<=1){break L1456}r14=(r19+r15|0)/2&-1;FUNCTION_TABLE[HEAP32[HEAP32[r16]+124>>2]](HEAP32[r18],r14,r7,r8);if((HEAP32[r7>>2]|0)>(HEAP32[r2>>2]|0)){r17=r19;r15=r14;continue L1456}if((HEAP32[r8>>2]|0)>(HEAP32[r3>>2]|0)){r17=r19;r15=r14;continue L1456}else{r19=r14}}}r15=r1+132|0;HEAP32[r15>>2]=r19;if(r10){HEAP32[r5+32]=r19}if((r19|0)>0){r10=r1+136|0;r17=r1+140|0;FUNCTION_TABLE[HEAP32[HEAP32[r16]+124>>2]](HEAP32[r18],r19,r10,r17);FUNCTION_TABLE[HEAP32[HEAP32[r16]+128>>2]](HEAP32[r5+30],HEAP32[r9],HEAP32[r18],HEAP32[r15>>2]);r15=r10;r10=r17;r17=HEAP32[r15>>2];HEAP32[r2>>2]=r17;r18=HEAP32[r10>>2];HEAP32[r3>>2]=r18;STACKTOP=r6;return}else{r15=r1+136|0;r10=r1+140|0;r17=HEAP32[r15>>2];HEAP32[r2>>2]=r17;r18=HEAP32[r10>>2];HEAP32[r3>>2]=r18;STACKTOP=r6;return}}function _midend_set_params(r1,r2){var r3,r4;r3=r1+8|0;r4=r1+68|0;FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+28>>2]](HEAP32[r4>>2]);r1=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+32>>2]](r2);HEAP32[r4>>2]=r1;return}function _midend_get_params(r1){return FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+32>>2]](HEAP32[r1+68>>2])}function _midend_force_redraw(r1){var r2,r3,r4,r5,r6,r7;r2=(r1+76|0)>>2;r3=HEAP32[r2];r4=(r1+8|0)>>2;if((r3|0)==0){r5=r1+120|0}else{r6=r1+120|0;FUNCTION_TABLE[HEAP32[HEAP32[r4]+140>>2]](HEAP32[r6>>2],r3);r5=r6}r6=FUNCTION_TABLE[HEAP32[HEAP32[r4]+136>>2]](HEAP32[r5>>2],HEAP32[HEAP32[r1+64>>2]>>2]);HEAP32[r2]=r6;r6=r1+132|0;r3=HEAP32[r6>>2];if((r3|0)<=0){_midend_redraw(r1);return}r7=r1+68|0;FUNCTION_TABLE[HEAP32[HEAP32[r4]+124>>2]](HEAP32[r7>>2],r3,r1+136|0,r1+140|0);FUNCTION_TABLE[HEAP32[HEAP32[r4]+128>>2]](HEAP32[r5>>2],HEAP32[r2],HEAP32[r7>>2],HEAP32[r6>>2]);_midend_redraw(r1);return}function _midend_redraw(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r2=r1>>2;r3=0;r4=(r1+120|0)>>2;if((HEAP32[r4]|0)==0){___assert_func(66516,869,68248,67584)}r5=(r1+60|0)>>2;if((HEAP32[r5]|0)<=0){return}r6=(r1+76|0)>>2;if((HEAP32[r6]|0)==0){return}r7=HEAP32[r4];FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+32>>2]](HEAP32[r7+4>>2]);r7=r1+84|0;r8=HEAP32[r7>>2];do{if((r8|0)==0){r3=1061}else{r9=HEAPF32[r2+22];if(r9<=0){r3=1061;break}r10=r1+92|0;r11=HEAPF32[r10>>2];if(r11>=r9){r3=1061;break}r9=r1+104|0;r12=HEAP32[r9>>2];if((r12|0)==0){___assert_func(66516,875,68248,67560);r13=HEAP32[r7>>2];r14=HEAP32[r9>>2];r15=HEAPF32[r10>>2]}else{r13=r8;r14=r12;r15=r11}FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+144>>2]](HEAP32[r4],HEAP32[r6],r13,HEAP32[HEAP32[r2+16]+((HEAP32[r5]-1)*12&-1)>>2],r14,HEAP32[r2+20],r15,HEAPF32[r2+25]);break}}while(0);if(r3==1061){FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+144>>2]](HEAP32[r4],HEAP32[r6],0,HEAP32[HEAP32[r2+16]+((HEAP32[r5]-1)*12&-1)>>2],1,HEAP32[r2+20],0,HEAPF32[r2+25])}r2=HEAP32[r4];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+36>>2]](HEAP32[r2+4>>2]);return}function _midend_new(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r5=STACKTOP;STACKTOP=STACKTOP+164|0;r6=r5;r7=r5+80;r8=r5+160;r9=_malloc(144),r10=r9>>2;if((r9|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r11=r9;r12=_malloc(8);if((r12|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_gettimeofday(r12,0);HEAP32[r10]=r1;r1=(r9+8|0)>>2;HEAP32[r1]=r2;r13=_random_new(r12,8);HEAP32[r10+1]=r13;r13=(r9+52|0)>>2;HEAP32[r13]=0;HEAP32[r13+1]=0;HEAP32[r13+2]=0;HEAP32[r13+3]=0;r13=FUNCTION_TABLE[HEAP32[r2+12>>2]]();r14=r9+68|0;HEAP32[r14>>2]=r13;r13=r6|0;_sprintf(r13,66128,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r1]>>2],tempInt));r15=HEAP8[r13];L1510:do{if(r15<<24>>24==0){r16=0}else{r17=0;r18=0;r19=r13;r20=r15;while(1){if((_isspace(r20&255)|0)==0){r21=_toupper(HEAPU8[r19])&255;HEAP8[r6+r17|0]=r21;r22=r17+1|0}else{r22=r17}r21=r18+1|0;r23=r6+r21|0;r24=HEAP8[r23];if(r24<<24>>24==0){r16=r22;break L1510}else{r17=r22;r18=r21;r19=r23;r20=r24}}}}while(0);HEAP8[r6+r16|0]=0;r16=_getenv(r13);if((r16|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r1]+20>>2]](HEAP32[r14>>2],r16)}HEAP32[r10+18]=0;r16=(r9+32|0)>>2;HEAP32[r16]=0;HEAP32[r16+1]=0;HEAP32[r16+2]=0;HEAP32[r16+3]=0;HEAP32[r10+12]=2;r16=(r9+12|0)>>2;HEAP32[r10+31]=0;HEAP32[r10+35]=0;HEAP32[r10+34]=0;HEAP32[r10+33]=0;HEAP32[r16]=0;HEAP32[r16+1]=0;HEAP32[r16+2]=0;HEAP32[r16+3]=0;HEAP32[r16+4]=0;_memset(r9+76|0,0,44);do{if((r3|0)==0){HEAP32[r10+30]=0}else{r16=_malloc(32),r14=r16>>2;if((r16|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r14]=r3;HEAP32[r14+1]=r4;HEAP32[r14+2]=0;HEAP32[r14+4]=0;HEAP32[r14+3]=0;HEAPF32[r14+5]=1;HEAP32[r14+6]=r11;HEAP32[r14+7]=0;HEAP32[r10+30]=r16;break}}}while(0);r10=r9+128|0;HEAP32[r10>>2]=HEAP32[r2+120>>2];r2=r7|0;_sprintf(r2,67312,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r1]>>2],tempInt));r1=HEAP8[r2];L1527:do{if(r1<<24>>24==0){r25=0}else{r9=0;r4=0;r3=r2;r16=r1;while(1){if((_isspace(r16&255)|0)==0){r14=_toupper(HEAPU8[r3])&255;HEAP8[r7+r4|0]=r14;r26=r4+1|0}else{r26=r4}r14=r9+1|0;r13=r7+r14|0;r6=HEAP8[r13];if(r6<<24>>24==0){r25=r26;break L1527}else{r9=r14;r4=r26;r3=r13;r16=r6}}}}while(0);HEAP8[r7+r25|0]=0;r25=_getenv(r2);if((r25|0)==0){_free(r12);STACKTOP=r5;return r11}r2=(_sscanf(r25,67432,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r8,tempInt))|0)==1;r25=HEAP32[r8>>2];if(!(r2&(r25|0)>0)){_free(r12);STACKTOP=r5;return r11}HEAP32[r10>>2]=r25;_free(r12);STACKTOP=r5;return r11}function _midend_can_undo(r1){return(HEAP32[r1+60>>2]|0)>1&1}function _midend_can_redo(r1){return(HEAP32[r1+60>>2]|0)<(HEAP32[r1+52>>2]|0)&1}function _midend_finish_move(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r2=r1>>2;r3=0;r4=(r1+84|0)>>2;r5=HEAP32[r4];r6=(r5|0)==0;do{if(r6){if((HEAP32[r2+15]|0)>1){r3=1097;break}else{break}}else{r3=1097}}while(0);do{if(r3==1097){r7=HEAP32[r2+26];if((r7|0)>0){r8=HEAP32[r2+15];r9=HEAP32[r2+16];if((HEAP32[r9+((r8-1)*12&-1)+8>>2]|0)==1){r10=r8;r11=r9}else{break}}else{if((r7|0)>=0){break}r9=HEAP32[r2+15];if((r9|0)>=(HEAP32[r2+13]|0)){break}r8=HEAP32[r2+16];if((HEAP32[r8+(r9*12&-1)+8>>2]|0)==1){r10=r9;r11=r8}else{break}}if(r6){r12=1;r13=HEAP32[r11+((r10-2)*12&-1)>>2]}else{r12=r7;r13=r5}r7=FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+152>>2]](r13,HEAP32[r11+((r10-1)*12&-1)>>2],r12,HEAP32[r2+20]);if(r7<=0){break}HEAPF32[r2+25]=0;HEAPF32[r2+24]=r7}}while(0);r12=HEAP32[r4];r10=r1+8|0;if((r12|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+68>>2]](r12)}HEAP32[r4]=0;r4=r1+88|0;HEAPF32[r4>>2]=0;HEAPF32[r2+23]=0;HEAP32[r2+26]=0;r1=HEAP32[r10>>2];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=1112;break}else{r10=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r2+16]+((HEAP32[r2+15]-1)*12&-1)>>2],HEAP32[r2+20])|0)!=0;HEAP32[r2+27]=r10&1;if(r10){break}else{r3=1112;break}}}while(0);do{if(r3==1112){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r4>>2]!=0){break}_deactivate_timer(HEAP32[r2]);return}}while(0);_activate_timer(HEAP32[r2]);return}function _midend_new_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r2=r1>>2;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+104|0;r5=r4;r6=r4+16;r7=r4+20;r8=r4+100;r9=(r1+52|0)>>2;r10=HEAP32[r9];L1574:do{if((r10|0)>0){r11=r1+8|0;r12=r1+64|0;r13=r10;while(1){r14=r13-1|0;HEAP32[r9]=r14;FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+68>>2]](HEAP32[HEAP32[r12>>2]+(r14*12&-1)>>2]);r14=HEAP32[r9];r15=HEAP32[HEAP32[r12>>2]+(r14*12&-1)+4>>2];if((r15|0)==0){r16=r14}else{_free(r15);r16=HEAP32[r9]}if((r16|0)>0){r13=r16}else{r17=r16;break L1574}}}else{r17=r10}}while(0);r10=(r1+76|0)>>2;r16=HEAP32[r10];if((r16|0)==0){r18=r17}else{FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+140>>2]](HEAP32[r2+30],r16);r18=HEAP32[r9]}if((r18|0)!=0){___assert_func(66516,349,68292,66316)}r18=(r1+48|0)>>2;r16=HEAP32[r18];do{if((r16|0)==1){HEAP32[r18]=2;break}else if((r16|0)==0){HEAP32[r18]=2;r3=1144;break}else{HEAP8[r5+15|0]=0;r17=r1+4|0;r13=HEAP32[r17>>2];while(1){r19=_random_bits(r13,7);if(r19>>>0<126){break}}r13=Math.floor((r19>>>0)/14)+49&255;r12=r5|0;HEAP8[r12]=r13;r13=1;while(1){r11=HEAP32[r17>>2];while(1){r20=_random_bits(r11,7);if(r20>>>0<120){break}}r11=Math.floor((r20>>>0)/12)+48&255;HEAP8[r5+r13|0]=r11;r11=r13+1|0;if((r11|0)==15){break}else{r13=r11}}r13=r1+40|0;r17=HEAP32[r13>>2];if((r17|0)!=0){_free(r17)}r17=_malloc(_strlen(r12)+1|0);if((r17|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r17,r12);HEAP32[r13>>2]=r17;r17=r1+72|0;r13=HEAP32[r17>>2];r11=r1+8|0;if((r13|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+28>>2]](r13)}r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+32>>2]](HEAP32[r2+17]);HEAP32[r17>>2]=r13;r3=1144;break}}while(0);do{if(r3==1144){r5=r1+32|0;r20=HEAP32[r5>>2];if((r20|0)!=0){_free(r20)}r20=r1+36|0;r19=HEAP32[r20>>2];if((r19|0)!=0){_free(r19)}r19=r1+44|0;r18=HEAP32[r19>>2];if((r18|0)!=0){_free(r18)}HEAP32[r19>>2]=0;r18=HEAP32[r2+10];r16=_random_new(r18,_strlen(r18));r18=FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+52>>2]](HEAP32[r2+18],r16,r19,(HEAP32[r2+30]|0)!=0&1);HEAP32[r5>>2]=r18;HEAP32[r20>>2]=0;if((r16|0)==0){break}_free(r16|0)}}while(0);r16=HEAP32[r9];r20=r1+56|0;do{if((r16|0)<(HEAP32[r20>>2]|0)){r18=r1+64|0,r21=r18>>2}else{r5=r16+128|0;HEAP32[r20>>2]=r5;r19=r1+64|0;r13=HEAP32[r19>>2];r17=r5*12&-1;if((r13|0)==0){r22=_malloc(r17)}else{r22=_realloc(r13,r17)}if((r22|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r19>>2]=r22;r18=r19,r21=r18>>2;break}}}while(0);r22=(r1+8|0)>>2;r20=(r1+68|0)>>2;r16=FUNCTION_TABLE[HEAP32[HEAP32[r22]+60>>2]](r1,HEAP32[r20],HEAP32[r2+8]);HEAP32[HEAP32[r21]+(HEAP32[r9]*12&-1)>>2]=r16;r16=HEAP32[r22];do{if((HEAP32[r16+72>>2]|0)!=0){r18=HEAP32[r2+11];if((r18|0)==0){break}HEAP32[r6>>2]=0;r19=HEAP32[HEAP32[r21]>>2];r17=FUNCTION_TABLE[HEAP32[r16+76>>2]](r19,r19,r18,r6);if(!((r17|0)!=0&(HEAP32[r6>>2]|0)==0)){___assert_func(66516,430,68292,66288)}r18=FUNCTION_TABLE[HEAP32[HEAP32[r22]+116>>2]](HEAP32[HEAP32[r21]>>2],r17);if((r18|0)==0){___assert_func(66516,432,68292,66228)}FUNCTION_TABLE[HEAP32[HEAP32[r22]+68>>2]](r18);if((r17|0)==0){break}_free(r17)}}while(0);r6=HEAP32[16439];do{if((r6|0)<0){r16=r7|0;_sprintf(r16,66148,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r22]>>2],tempInt));r17=HEAP8[r16];L1648:do{if(r17<<24>>24==0){r23=0}else{r18=0;r19=0;r13=r16;r5=r17;while(1){if((_isspace(r5&255)|0)==0){r11=_toupper(HEAPU8[r13])&255;HEAP8[r7+r18|0]=r11;r24=r18+1|0}else{r24=r18}r11=r19+1|0;r15=r7+r11|0;r14=HEAP8[r15];if(r14<<24>>24==0){r23=r24;break L1648}else{r18=r24;r19=r11;r13=r15;r5=r14}}}}while(0);HEAP8[r7+r23|0]=0;if((_getenv(r16)|0)==0){HEAP32[16439]=0;break}else{_fwrite(66100,26,1,HEAP32[_stderr>>2]);HEAP32[16439]=1;r3=1177;break}}else{if((r6|0)==0){break}else{r3=1177;break}}}while(0);do{if(r3==1177){HEAP32[r8>>2]=0;r6=HEAP32[HEAP32[r21]>>2];r23=FUNCTION_TABLE[HEAP32[HEAP32[r22]+76>>2]](r6,r6,0,r8);if(!((r23|0)!=0&(HEAP32[r8>>2]|0)==0)){___assert_func(66516,478,68292,66288)}r6=FUNCTION_TABLE[HEAP32[HEAP32[r22]+116>>2]](HEAP32[HEAP32[r21]>>2],r23);if((r6|0)==0){___assert_func(66516,480,68292,66228)}FUNCTION_TABLE[HEAP32[HEAP32[r22]+68>>2]](r6);if((r23|0)==0){break}_free(r23)}}while(0);HEAP32[HEAP32[r21]+(HEAP32[r9]*12&-1)+4>>2]=0;HEAP32[HEAP32[r21]+(HEAP32[r9]*12&-1)+8>>2]=0;HEAP32[r9]=HEAP32[r9]+1|0;r9=r1+60|0;HEAP32[r9>>2]=1;r8=r1+120|0;r23=FUNCTION_TABLE[HEAP32[HEAP32[r22]+136>>2]](HEAP32[r8>>2],HEAP32[HEAP32[r21]>>2]);HEAP32[r10]=r23;r23=r1+132|0;r6=HEAP32[r23>>2];if((r6|0)>0){FUNCTION_TABLE[HEAP32[HEAP32[r22]+124>>2]](HEAP32[r20],r6,r1+136|0,r1+140|0);FUNCTION_TABLE[HEAP32[HEAP32[r22]+128>>2]](HEAP32[r8>>2],HEAP32[r10],HEAP32[r20],HEAP32[r23>>2])}HEAPF32[r2+28]=0;r23=r1+80|0;r20=HEAP32[r23>>2];if((r20|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r22]+96>>2]](r20)}r20=FUNCTION_TABLE[HEAP32[HEAP32[r22]+92>>2]](HEAP32[HEAP32[r21]>>2]);HEAP32[r23>>2]=r20;r23=HEAP32[r22];do{if((HEAP32[r23+180>>2]|0)==0){HEAP32[r2+27]=0;r3=1190;break}else{r22=(FUNCTION_TABLE[HEAP32[r23+184>>2]](HEAP32[HEAP32[r21]+((HEAP32[r9>>2]-1)*12&-1)>>2],r20)|0)!=0;HEAP32[r2+27]=r22&1;if(r22){break}else{r3=1190;break}}}while(0);do{if(r3==1190){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r2+22]!=0){break}_deactivate_timer(HEAP32[r2]);r25=r1+124|0;HEAP32[r25>>2]=0;STACKTOP=r4;return}}while(0);_activate_timer(HEAP32[r2]);r25=r1+124|0;HEAP32[r25>>2]=0;STACKTOP=r4;return}function _midend_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12;r5=r1>>2;r6=(r4-515|0)>>>0<3;do{if(r6|(r4-518|0)>>>0<3){r7=HEAP32[r5+31];if((r7|0)==0){r8=1;return r8}if(r6){r9=1;r10=r7+3|0;break}else{r9=1;r10=r7+6|0;break}}else{if((r4-512|0)>>>0>=3){r9=1;r10=r4;break}r7=HEAP32[r5+31];if((r7|0)==0){r9=1;r10=r4;break}if((HEAP32[HEAP32[r5+2]+188>>2]&1<<r4-2048+(r7*3&-1)|0)==0){r9=(_midend_really_process_key(r1,r2,r3,r7+6|0)|0)!=0&1;r10=r4;break}else{r8=1;return r8}}}while(0);if((r10|0)==13|(r10|0)==10){r11=525}else{r11=r10}r10=(r11|0)==32?526:r11;r11=(r10|0)==127?8:r10;if((r9|0)==0){r12=0}else{r12=(_midend_really_process_key(r1,r2,r3,r11)|0)!=0}r3=r12&1;if((r11-518|0)>>>0<3){HEAP32[r5+31]=0;r8=r3;return r8}if((r11-512|0)>>>0>=3){r8=r3;return r8}HEAP32[r5+31]=r11;r8=r3;return r8}function _midend_restart_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r2=r1>>2;r3=0;r4=STACKTOP;r5=r1+84|0;do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=1222;break}else{break}}else{r3=1222}}while(0);if(r3==1222){_midend_finish_move(r1);_midend_redraw(r1)}r6=(r1+60|0)>>2;r7=HEAP32[r6];if((r7|0)>0){r8=r7}else{___assert_func(66516,586,68228,66040);r8=HEAP32[r6]}if((r8|0)==1){STACKTOP=r4;return}r8=(r1+8|0)>>2;r7=r1+32|0;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8]+60>>2]](r1,HEAP32[r2+17],HEAP32[r7>>2]);do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=1228;break}else{break}}else{r3=1228}}while(0);if(r3==1228){_midend_finish_move(r1);_midend_redraw(r1)}r5=(r1+52|0)>>2;r10=HEAP32[r5];L1731:do{if((r10|0)>(HEAP32[r6]|0)){r11=r1+64|0;r12=r10;while(1){r13=HEAP32[HEAP32[r8]+68>>2];r14=r12-1|0;HEAP32[r5]=r14;FUNCTION_TABLE[r13](HEAP32[HEAP32[r11>>2]+(r14*12&-1)>>2]);r14=HEAP32[r5];r13=HEAP32[HEAP32[r11>>2]+(r14*12&-1)+4>>2];if((r13|0)==0){r15=r14}else{_free(r13);r15=HEAP32[r5]}if((r15|0)>(HEAP32[r6]|0)){r12=r15}else{r16=r15;break L1731}}}else{r16=r10}}while(0);r10=r1+56|0;do{if((r16|0)<(HEAP32[r10>>2]|0)){r17=r16;r18=HEAP32[r2+16]}else{r15=r16+128|0;HEAP32[r10>>2]=r15;r12=r1+64|0;r11=HEAP32[r12>>2];r13=r15*12&-1;if((r11|0)==0){r19=_malloc(r13)}else{r19=_realloc(r11,r13)}if((r19|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r13=r19;HEAP32[r12>>2]=r13;r17=HEAP32[r5];r18=r13;break}}}while(0);r19=(r1+64|0)>>2;HEAP32[r18+(r17*12&-1)>>2]=r9;r9=HEAP32[r7>>2];r7=_malloc(_strlen(r9)+1|0);if((r7|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r7,r9);HEAP32[HEAP32[r19]+(HEAP32[r5]*12&-1)+4>>2]=r7;HEAP32[HEAP32[r19]+(HEAP32[r5]*12&-1)+8>>2]=3;r7=HEAP32[r5];r9=r7+1|0;HEAP32[r5]=r9;HEAP32[r6]=r9;r9=r1+80|0;r5=HEAP32[r9>>2];if((r5|0)!=0){r17=HEAP32[r19];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r5,HEAP32[r17+((r7-1)*12&-1)>>2],HEAP32[r17+(r7*12&-1)>>2])}r7=r1+88|0;HEAPF32[r7>>2]=0;_midend_finish_move(r1);_midend_redraw(r1);r1=HEAP32[r8];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=1249;break}else{r8=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r19]+((HEAP32[r6]-1)*12&-1)>>2],HEAP32[r9>>2])|0)!=0;HEAP32[r2+27]=r8&1;if(r8){break}else{r3=1249;break}}}while(0);do{if(r3==1249){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r7>>2]!=0){break}_deactivate_timer(HEAP32[r2]);STACKTOP=r4;return}}while(0);_activate_timer(HEAP32[r2]);STACKTOP=r4;return}function _midend_really_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r5=r1>>2;r6=0;r7=STACKTOP;r8=(r1+8|0)>>2;r9=(r1+60|0)>>2;r10=(r1+64|0)>>2;r11=FUNCTION_TABLE[HEAP32[HEAP32[r8]+64>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2]);r12=(r1+80|0)>>2;r13=FUNCTION_TABLE[HEAP32[HEAP32[r8]+112>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12],HEAP32[r5+19],r2,r3,r4);L1767:do{if((r13|0)==0){if((r4|0)==19){if((HEAP32[HEAP32[r8]+72>>2]|0)==0){r14=1;r6=1324;break}if((_midend_solve(r1)|0)==0){r6=1309;break}else{r14=1;r6=1324;break}}else if((r4|0)==113|(r4|0)==81|(r4|0)==17){r14=0;r6=1324;break}else if((r4|0)==110|(r4|0)==78|(r4|0)==14){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=1261;break}else{break}}else{r6=1261}}while(0);if(r6==1261){_midend_finish_move(r1);_midend_redraw(r1)}_midend_new_game(r1);_midend_redraw(r1);r14=1;r6=1324;break}else if((r4|0)==117|(r4|0)==85|(r4|0)==31|(r4|0)==26){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=1265;break}else{break}}else{r6=1265}}while(0);if(r6==1265){_midend_finish_move(r1);_midend_redraw(r1)}r3=HEAP32[r9];r2=r3-1|0;r15=HEAP32[r10]>>2;r16=HEAP32[((r2*12&-1)+8>>2)+r15];if((r3|0)<=1){r14=1;r6=1324;break}r17=HEAP32[r12];if((r17|0)==0){r18=r3}else{FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r17,HEAP32[((r2*12&-1)>>2)+r15],HEAP32[(((r3-2)*12&-1)>>2)+r15]);r18=HEAP32[r9]}r15=r18-1|0;HEAP32[r9]=r15;HEAP32[r5+26]=-1;r19=r16;r20=r15;break}else if((r4|0)==114|(r4|0)==82|(r4|0)==25|(r4|0)==18){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=1271;break}else{break}}else{r6=1271}}while(0);if(r6==1271){_midend_finish_move(r1);_midend_redraw(r1)}r15=HEAP32[r9];if((r15|0)>=(HEAP32[r5+13]|0)){r14=1;r6=1324;break}r16=HEAP32[r12];if((r16|0)==0){r21=r15}else{r3=HEAP32[r10];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r16,HEAP32[r3+((r15-1)*12&-1)>>2],HEAP32[r3+(r15*12&-1)>>2]);r21=HEAP32[r9]}HEAP32[r9]=r21+1|0;HEAP32[r5+26]=1;r6=1309;break}else{r14=1;r6=1324;break}}else{do{if(HEAP8[r13]<<24>>24==0){r22=HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2]}else{r15=FUNCTION_TABLE[HEAP32[HEAP32[r8]+116>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],r13);if((r15|0)!=0){r22=r15;break}___assert_func(66516,664,68264,66196);r22=0}}while(0);r15=HEAP32[r9];if((r22|0)==(HEAP32[HEAP32[r10]+((r15-1)*12&-1)>>2]|0)){_midend_redraw(r1);r3=HEAP32[r8];do{if((HEAP32[r3+180>>2]|0)==0){HEAP32[r5+27]=0;r6=1287;break}else{r16=(FUNCTION_TABLE[HEAP32[r3+184>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12])|0)!=0;HEAP32[r5+27]=r16&1;if(r16){break}else{r6=1287;break}}}while(0);do{if(r6==1287){if(HEAPF32[r5+24]!=0){break}if(HEAPF32[r5+22]!=0){break}_deactivate_timer(HEAP32[r5]);r14=1;r6=1324;break L1767}}while(0);_activate_timer(HEAP32[r5]);r14=1;r6=1324;break}if((r22|0)==0){r14=1;r6=1324;break}do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=1294;break}else{r23=r15;break}}else{r6=1294}}while(0);if(r6==1294){_midend_finish_move(r1);_midend_redraw(r1);r23=HEAP32[r9]}r15=(r1+52|0)>>2;r3=HEAP32[r15];L1791:do{if((r3|0)>(r23|0)){r16=r3;while(1){r2=HEAP32[HEAP32[r8]+68>>2];r17=r16-1|0;HEAP32[r15]=r17;FUNCTION_TABLE[r2](HEAP32[HEAP32[r10]+(r17*12&-1)>>2]);r17=HEAP32[r15];r2=HEAP32[HEAP32[r10]+(r17*12&-1)+4>>2];if((r2|0)==0){r24=r17}else{_free(r2);r24=HEAP32[r15]}if((r24|0)>(HEAP32[r9]|0)){r16=r24}else{r25=r24;break L1791}}}else{r25=r3}}while(0);r3=r1+56|0;do{if((r25|0)>=(HEAP32[r3>>2]|0)){r16=r25+128|0;HEAP32[r3>>2]=r16;r2=HEAP32[r10];r17=r16*12&-1;if((r2|0)==0){r26=_malloc(r17)}else{r26=_realloc(r2,r17)}if((r26|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r10]=r26;break}}}while(0);HEAP32[HEAP32[r10]+(HEAP32[r15]*12&-1)>>2]=r22;HEAP32[HEAP32[r10]+(HEAP32[r15]*12&-1)+4>>2]=r13;HEAP32[HEAP32[r10]+(HEAP32[r15]*12&-1)+8>>2]=1;r3=HEAP32[r15];r17=r3+1|0;HEAP32[r15]=r17;HEAP32[r9]=r17;HEAP32[r5+26]=1;r17=HEAP32[r12];if((r17|0)==0){r6=1309;break}r2=HEAP32[r10];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r17,HEAP32[r2+((r3-1)*12&-1)>>2],HEAP32[r2+(r3*12&-1)>>2]);r6=1309;break}}while(0);if(r6==1324){if((r11|0)==0){r27=r14;STACKTOP=r7;return r27}FUNCTION_TABLE[HEAP32[HEAP32[r8]+68>>2]](r11);r27=r14;STACKTOP=r7;return r27}else if(r6==1309){r14=HEAP32[r9];r19=HEAP32[HEAP32[r10]+((r14-1)*12&-1)+8>>2];r20=r14}do{if((r19|0)==2){r14=HEAP32[r8];if((HEAP32[r14+188>>2]&512|0)==0){r6=1313;break}else{r28=r14;r6=1314;break}}else if((r19|0)==1){r28=HEAP32[r8];r6=1314;break}else{r6=1313}}while(0);do{if(r6==1313){HEAP32[r5+21]=r11;r29=r1+88|0;r6=1316;break}else if(r6==1314){r19=FUNCTION_TABLE[HEAP32[r28+148>>2]](r11,HEAP32[HEAP32[r10]+((r20-1)*12&-1)>>2],HEAP32[r5+26],HEAP32[r12]);HEAP32[r5+21]=r11;r14=r1+88|0;if(r19<=0){r29=r14;r6=1316;break}HEAPF32[r14>>2]=r19;r30=r14;break}}while(0);if(r6==1316){HEAPF32[r29>>2]=0;_midend_finish_move(r1);r30=r29}HEAPF32[r5+23]=0;_midend_redraw(r1);r1=HEAP32[r8];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r5+27]=0;r6=1320;break}else{r8=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12])|0)!=0;HEAP32[r5+27]=r8&1;if(r8){break}else{r6=1320;break}}}while(0);do{if(r6==1320){if(HEAPF32[r5+24]!=0){break}if(HEAPF32[r30>>2]!=0){break}_deactivate_timer(HEAP32[r5]);r27=1;STACKTOP=r7;return r27}}while(0);_activate_timer(HEAP32[r5]);r27=1;STACKTOP=r7;return r27}function _midend_wants_statusbar(r1){return HEAP32[HEAP32[r1+8>>2]+176>>2]}function _midend_timer(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=r1>>2;r4=0;r5=r1+88|0;r6=HEAPF32[r5>>2];r7=r6>0;if(r7){r8=1}else{r8=HEAPF32[r3+24]>0}r9=r1+92|0;r10=HEAPF32[r9>>2]+r2;HEAPF32[r9>>2]=r10;do{if(r10>=r6|r6==0){if(r7){r4=1337;break}else{break}}else{if((HEAP32[r3+21]|0)!=0|r7^1){break}else{r4=1337;break}}}while(0);if(r4==1337){_midend_finish_move(r1)}r7=(r1+100|0)>>2;r6=HEAPF32[r7]+r2;HEAPF32[r7]=r6;r10=(r1+96|0)>>2;r9=HEAPF32[r10];if(r6>=r9|r9==0){HEAPF32[r10]=0;HEAPF32[r7]=0}if(r8){_midend_redraw(r1)}r8=(r1+108|0)>>2;do{if((HEAP32[r8]|0)!=0){r7=r1+112|0;r9=HEAPF32[r7>>2];r6=r9+r2;HEAPF32[r7>>2]=r6;if((r9&-1|0)==(r6&-1|0)){break}r6=HEAP32[r3+29];_status_bar(HEAP32[r3+30],(r6|0)==0?67364:r6)}}while(0);r2=HEAP32[r3+2];do{if((HEAP32[r2+180>>2]|0)==0){HEAP32[r8]=0;r4=1348;break}else{r1=(FUNCTION_TABLE[HEAP32[r2+184>>2]](HEAP32[HEAP32[r3+16]+((HEAP32[r3+15]-1)*12&-1)>>2],HEAP32[r3+20])|0)!=0;HEAP32[r8]=r1&1;if(r1){break}else{r4=1348;break}}}while(0);do{if(r4==1348){if(HEAPF32[r10]!=0){break}if(HEAPF32[r5>>2]!=0){break}_deactivate_timer(HEAP32[r3]);return}}while(0);_activate_timer(HEAP32[r3]);return}function _midend_colours(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r3=STACKTOP;STACKTOP=STACKTOP+92|0;r4=r3;r5=r3+80;r6=r3+84;r7=r3+88;r8=r1+8|0;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+132>>2]](HEAP32[r1>>2],r2),r1=r9>>2;if((HEAP32[r2>>2]|0)<=0){STACKTOP=r3;return r9}r10=r4|0;r11=0;while(1){_sprintf(r10,67492,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r8>>2]>>2],HEAP32[tempInt+4>>2]=r11,tempInt));r12=HEAP8[r10];L1905:do{if(r12<<24>>24==0){r13=0}else{r14=0;r15=0;r16=r10;r17=r12;while(1){if((_isspace(r17&255)|0)==0){r18=_toupper(HEAPU8[r16])&255;HEAP8[r4+r15|0]=r18;r19=r15+1|0}else{r19=r15}r18=r14+1|0;r20=r4+r18|0;r21=HEAP8[r20];if(r21<<24>>24==0){r13=r19;break L1905}else{r14=r18;r15=r19;r16=r20;r17=r21}}}}while(0);HEAP8[r4+r13|0]=0;r12=_getenv(r10);do{if((r12|0)!=0){if((_sscanf(r12,67436,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r6,HEAP32[tempInt+8>>2]=r7,tempInt))|0)!=3){break}r17=r11*3&-1;HEAPF32[(r17<<2>>2)+r1]=(HEAP32[r5>>2]>>>0)/255;HEAPF32[(r17+1<<2>>2)+r1]=(HEAP32[r6>>2]>>>0)/255;HEAPF32[(r17+2<<2>>2)+r1]=(HEAP32[r7>>2]>>>0)/255}}while(0);r12=r11+1|0;if((r12|0)<(HEAP32[r2>>2]|0)){r11=r12}else{break}}STACKTOP=r3;return r9}function _midend_which_preset(r1){var r2,r3,r4,r5;r2=FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+24>>2]](HEAP32[r1+68>>2],1);r3=r1+20|0;r4=HEAP32[r1+24>>2];r1=0;while(1){if((r1|0)>=(r4|0)){r5=-1;break}if((_strcmp(r2,HEAP32[HEAP32[r3>>2]+(r1<<2)>>2])|0)==0){r5=r1;break}else{r1=r1+1|0}}if((r2|0)==0){return r5}_free(r2);return r5}function _midend_num_presets(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+88|0;r4=r3;r5=r3+4;r6=r3+8;r7=(r1+24|0)>>2;r8=(r1+8|0)>>2;L1927:do{if((HEAP32[r7]|0)==0){if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+16>>2]](0,r4,r5)|0)==0){break}r9=(r1+28|0)>>2;r10=(r1+12|0)>>2;r11=(r1+16|0)>>2;r12=(r1+20|0)>>2;while(1){r13=HEAP32[r7];if((HEAP32[r9]|0)>(r13|0)){r14=r13}else{r15=r13+10|0;HEAP32[r9]=r15;r13=HEAP32[r10];r16=r15<<2;if((r13|0)==0){r17=_malloc(r16)}else{r17=_realloc(r13,r16)}if((r17|0)==0){r2=1384;break}HEAP32[r10]=r17;r16=HEAP32[r11];r13=HEAP32[r9]<<2;if((r16|0)==0){r18=_malloc(r13)}else{r18=_realloc(r16,r13)}if((r18|0)==0){r2=1389;break}HEAP32[r11]=r18;r13=HEAP32[r12];r16=HEAP32[r9]<<2;if((r13|0)==0){r19=_malloc(r16)}else{r19=_realloc(r13,r16)}if((r19|0)==0){r2=1394;break}HEAP32[r12]=r19;r14=HEAP32[r7]}HEAP32[HEAP32[r10]+(r14<<2)>>2]=HEAP32[r5>>2];HEAP32[HEAP32[r11]+(HEAP32[r7]<<2)>>2]=HEAP32[r4>>2];r16=FUNCTION_TABLE[HEAP32[HEAP32[r8]+24>>2]](HEAP32[r5>>2],1);HEAP32[HEAP32[r12]+(HEAP32[r7]<<2)>>2]=r16;r16=HEAP32[r7]+1|0;HEAP32[r7]=r16;if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+16>>2]](r16,r4,r5)|0)==0){break L1927}}if(r2==1389){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1394){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1384){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}}while(0);r5=r6|0;_sprintf(r5,67404,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r8]>>2],tempInt));r4=HEAP8[r5];L1955:do{if(r4<<24>>24==0){r20=0}else{r14=0;r19=0;r18=r5;r17=r4;while(1){if((_isspace(r17&255)|0)==0){r12=_toupper(HEAPU8[r18])&255;HEAP8[r6+r14|0]=r12;r21=r14+1|0}else{r21=r14}r12=r19+1|0;r11=r6+r12|0;r10=HEAP8[r11];if(r10<<24>>24==0){r20=r21;break L1955}else{r14=r21;r19=r12;r18=r11;r17=r10}}}}while(0);HEAP8[r6+r20|0]=0;r20=_getenv(r5);if((r20|0)==0){r22=HEAP32[r7];STACKTOP=r3;return r22}r5=_malloc(_strlen(r20)+1|0);if((r5|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r20);r20=HEAP8[r5];L1968:do{if(r20<<24>>24!=0){r6=(r1+28|0)>>2;r21=(r1+12|0)>>2;r4=(r1+16|0)>>2;r17=(r1+20|0)>>2;r18=r5;r19=r20;while(1){r14=r18;r10=r19;while(1){r23=r10<<24>>24==0;r24=r14+1|0;if(!(r10<<24>>24!=58&(r23^1))){break}r14=r24;r10=HEAP8[r24]}if(r23){r25=r14}else{HEAP8[r14]=0;r25=r24}r10=r25;while(1){r11=HEAP8[r10];r26=r11<<24>>24==0;r27=r10+1|0;if(r11<<24>>24!=58&(r26^1)){r10=r27}else{break}}if(r26){r28=r10}else{HEAP8[r10]=0;r28=r27}r14=FUNCTION_TABLE[HEAP32[HEAP32[r8]+12>>2]]();FUNCTION_TABLE[HEAP32[HEAP32[r8]+20>>2]](r14,r25);if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+48>>2]](r14,1)|0)==0){r11=HEAP32[r7];if((HEAP32[r6]|0)>(r11|0)){r29=r11}else{r12=r11+10|0;HEAP32[r6]=r12;r11=HEAP32[r21];r9=r12<<2;if((r11|0)==0){r30=_malloc(r9)}else{r30=_realloc(r11,r9)}if((r30|0)==0){r2=1423;break}HEAP32[r21]=r30;r9=HEAP32[r4];r11=HEAP32[r6]<<2;if((r9|0)==0){r31=_malloc(r11)}else{r31=_realloc(r9,r11)}if((r31|0)==0){r2=1428;break}HEAP32[r4]=r31;r11=HEAP32[r17];r9=HEAP32[r6]<<2;if((r11|0)==0){r32=_malloc(r9)}else{r32=_realloc(r11,r9)}if((r32|0)==0){r2=1433;break}HEAP32[r17]=r32;r29=HEAP32[r7]}HEAP32[HEAP32[r21]+(r29<<2)>>2]=r14;r9=_malloc(_strlen(r18)+1|0);if((r9|0)==0){r2=1436;break}_strcpy(r9,r18);HEAP32[HEAP32[r4]+(HEAP32[r7]<<2)>>2]=r9;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8]+24>>2]](r14,1);HEAP32[HEAP32[r17]+(HEAP32[r7]<<2)>>2]=r9;HEAP32[r7]=HEAP32[r7]+1|0}else{FUNCTION_TABLE[HEAP32[HEAP32[r8]+28>>2]](r14)}r14=HEAP8[r28];if(r14<<24>>24==0){break L1968}else{r18=r28;r19=r14}}if(r2==1423){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1428){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1433){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1436){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}}while(0);_free(r5);r22=HEAP32[r7];STACKTOP=r3;return r22}function _midend_status(r1){var r2,r3;r2=HEAP32[r1+60>>2];if((r2|0)==0){r3=1;return r3}r3=FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+156>>2]](HEAP32[HEAP32[r1+64>>2]+((r2-1)*12&-1)>>2]);return r3}function _shuffle(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r5=STACKTOP;STACKTOP=STACKTOP+512|0;r6=r2-1|0;if((r2|0)<=1){STACKTOP=r5;return}r7=r5|0;if((r3|0)>0){r8=r2;r9=r6}else{r10=r2;r2=r6;while(1){r6=0;while(1){if((r10>>>(r6>>>0)|0)==0){break}else{r6=r6+1|0}}r11=r6+3|0;if((r11|0)>=32){___assert_func(67152,275,68144,67524)}r12=1<<r11;r13=r12-(r12>>>0)%(r10>>>0)|0;while(1){if(_random_bits(r4,r11)>>>0<r13>>>0){break}}if((r2|0)>1){r10=r2;r2=r2-1|0}else{break}}STACKTOP=r5;return}while(1){r2=0;while(1){if((r8>>>(r2>>>0)|0)==0){break}else{r2=r2+1|0}}r10=r2+3|0;if((r10|0)>=32){___assert_func(67152,275,68144,67524)}r13=Math.floor((1<<r10>>>0)/(r8>>>0));r11=Math.imul(r13,r8);while(1){r14=_random_bits(r4,r10);if(r14>>>0<r11>>>0){break}}r11=Math.floor((r14>>>0)/(r13>>>0));L2048:do{if((r11|0)!=(r9|0)){r10=Math.imul(r11,r3);r2=r1+Math.imul(r9,r3)|0;r6=r1+r10|0;r10=r3;while(1){r12=r10>>>0<512?r10:512;_memcpy(r7,r2,r12);_memcpy(r2,r6,r12);_memcpy(r6,r7,r12);r15=r10-r12|0;if((r15|0)>0){r2=r2+r12|0;r6=r6+r12|0;r10=r15}else{break L2048}}}}while(0);if((r9|0)>1){r8=r9;r9=r9-1|0}else{break}}STACKTOP=r5;return}function _SHA_Bytes(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+384|0;r6=r5,r7=r6>>2;r8=r5+320;r9=r1+92|0;r10=_llvm_uadd_with_overflow_i32(HEAP32[r9>>2],r3);HEAP32[r9>>2]=r10;r10=r1+88|0;HEAP32[r10>>2]=(tempRet0&1)+HEAP32[r10>>2]|0;r10=(r1+84|0)>>2;r9=HEAP32[r10];r11=r9+r3|0;do{if((r9|0)==0){if((r11|0)>63){r4=1472;break}else{r12=r2;r13=r3;break}}else{if((r11|0)>=64){r4=1472;break}_memcpy(r1+(r9+20)|0,r2,r3);r14=HEAP32[r10]+r3|0;HEAP32[r10]=r14;STACKTOP=r5;return}}while(0);L2060:do{if(r4==1472){r11=r1|0;r15=r6;r16=r8;r17=r1+4|0;r18=r1+8|0;r19=r1+12|0;r20=r1+16|0;r21=r2;r22=r3;r23=r9;while(1){_memcpy(r1+(r23+20)|0,r21,64-r23|0);r24=64-HEAP32[r10]|0;r25=r21+r24|0;r26=0;while(1){r27=r26<<2;HEAP32[r8+(r26<<2)>>2]=HEAPU8[(r27|1)+r1+20|0]<<16|HEAPU8[r1+(r27+20)|0]<<24|HEAPU8[(r27|2)+r1+20|0]<<8|HEAPU8[(r27|3)+r1+20|0];r27=r26+1|0;if((r27|0)==16){break}else{r26=r27}}_memcpy(r15,r16,64);r26=16;while(1){r27=HEAP32[(r26-8<<2>>2)+r7]^HEAP32[(r26-3<<2>>2)+r7]^HEAP32[(r26-14<<2>>2)+r7]^HEAP32[(r26-16<<2>>2)+r7];HEAP32[(r26<<2>>2)+r7]=r27<<1|r27>>>31;r27=r26+1|0;if((r27|0)==80){break}else{r26=r27}}r26=HEAP32[r11>>2];r27=HEAP32[r17>>2];r28=HEAP32[r18>>2];r29=HEAP32[r19>>2];r30=HEAP32[r20>>2];r31=0;r32=r30;r33=r29;r34=r28;r35=r27;r36=r26;while(1){r37=(r36<<5|r36>>>27)+r32+(r33&(r35^-1)|r34&r35)+HEAP32[(r31<<2>>2)+r7]+1518500249|0;r38=r35<<30|r35>>>2;r39=r31+1|0;if((r39|0)==20){r40=20;r41=r33;r42=r34;r43=r38;r44=r36;r45=r37;break}else{r31=r39;r32=r33;r33=r34;r34=r38;r35=r36;r36=r37}}while(1){r36=(r45<<5|r45>>>27)+r41+(r43^r44^r42)+HEAP32[(r40<<2>>2)+r7]+1859775393|0;r35=r44<<30|r44>>>2;r34=r40+1|0;if((r34|0)==40){r46=40;r47=r42;r48=r43;r49=r35;r50=r45;r51=r36;break}else{r40=r34;r41=r42;r42=r43;r43=r35;r44=r45;r45=r36}}while(1){r36=(r51<<5|r51>>>27)-1894007588+r47+((r48|r49)&r50|r48&r49)+HEAP32[(r46<<2>>2)+r7]|0;r35=r50<<30|r50>>>2;r34=r46+1|0;if((r34|0)==60){r52=60;r53=r48;r54=r49;r55=r35;r56=r51;r57=r36;break}else{r46=r34;r47=r48;r48=r49;r49=r35;r50=r51;r51=r36}}while(1){r58=(r57<<5|r57>>>27)-899497514+r53+(r55^r56^r54)+HEAP32[(r52<<2>>2)+r7]|0;r59=r56<<30|r56>>>2;r36=r52+1|0;if((r36|0)==80){break}else{r52=r36;r53=r54;r54=r55;r55=r59;r56=r57;r57=r58}}r36=r22-r24|0;HEAP32[r11>>2]=r58+r26|0;HEAP32[r17>>2]=r57+r27|0;HEAP32[r18>>2]=r59+r28|0;HEAP32[r19>>2]=r55+r29|0;HEAP32[r20>>2]=r54+r30|0;HEAP32[r10]=0;if((r36|0)>63){r21=r25;r22=r36;r23=0}else{r12=r25;r13=r36;break L2060}}}}while(0);_memcpy(r1+20|0,r12,r13);r14=r13;HEAP32[r10]=r14;STACKTOP=r5;return}function _SHA_Final(r1,r2){var r3,r4,r5,r6,r7,r8;r3=STACKTOP;STACKTOP=STACKTOP+64|0;r4=r3;r5=HEAP32[r1+84>>2];r6=((r5|0)>55?120:56)-r5|0;r5=HEAP32[r1+88>>2];r7=HEAP32[r1+92>>2];r8=r4|0;_memset(r8,0,r6);HEAP8[r8]=-128;_SHA_Bytes(r1,r8,r6);HEAP8[r8]=r5>>>21&255;HEAP8[r4+1|0]=r5>>>13&255;HEAP8[r4+2|0]=r5>>>5&255;HEAP8[r4+3|0]=(r7>>>29|r5<<3)&255;HEAP8[r4+4|0]=r7>>>21&255;HEAP8[r4+5|0]=r7>>>13&255;HEAP8[r4+6|0]=r7>>>5&255;HEAP8[r4+7|0]=r7<<3&255;_SHA_Bytes(r1,r8,8);r8=(r1|0)>>2;HEAP8[r2]=HEAP32[r8]>>>24&255;HEAP8[r2+1|0]=HEAP32[r8]>>>16&255;HEAP8[r2+2|0]=HEAP32[r8]>>>8&255;HEAP8[r2+3|0]=HEAP32[r8]&255;r8=(r1+4|0)>>2;HEAP8[r2+4|0]=HEAP32[r8]>>>24&255;HEAP8[r2+5|0]=HEAP32[r8]>>>16&255;HEAP8[r2+6|0]=HEAP32[r8]>>>8&255;HEAP8[r2+7|0]=HEAP32[r8]&255;r8=(r1+8|0)>>2;HEAP8[r2+8|0]=HEAP32[r8]>>>24&255;HEAP8[r2+9|0]=HEAP32[r8]>>>16&255;HEAP8[r2+10|0]=HEAP32[r8]>>>8&255;HEAP8[r2+11|0]=HEAP32[r8]&255;r8=(r1+12|0)>>2;HEAP8[r2+12|0]=HEAP32[r8]>>>24&255;HEAP8[r2+13|0]=HEAP32[r8]>>>16&255;HEAP8[r2+14|0]=HEAP32[r8]>>>8&255;HEAP8[r2+15|0]=HEAP32[r8]&255;r8=(r1+16|0)>>2;HEAP8[r2+16|0]=HEAP32[r8]>>>24&255;HEAP8[r2+17|0]=HEAP32[r8]>>>16&255;HEAP8[r2+18|0]=HEAP32[r8]>>>8&255;HEAP8[r2+19|0]=HEAP32[r8]&255;STACKTOP=r3;return}function _midend_solve(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r2=r1>>2;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+4|0;r5=r4,r6=r5>>2;r7=(r1+8|0)>>2;r8=HEAP32[r7];if((HEAP32[r8+72>>2]|0)==0){r9=66888;STACKTOP=r4;return r9}r10=(r1+60|0)>>2;r11=HEAP32[r10];if((r11|0)<1){r9=66812;STACKTOP=r4;return r9}HEAP32[r6]=0;r12=(r1+64|0)>>2;r13=HEAP32[r12];r14=FUNCTION_TABLE[HEAP32[r8+76>>2]](HEAP32[r13>>2],HEAP32[r13+((r11-1)*12&-1)>>2],HEAP32[r2+11],r5);if((r14|0)==0){r5=HEAP32[r6];if((r5|0)!=0){r9=r5;STACKTOP=r4;return r9}HEAP32[r6]=66752;r9=66752;STACKTOP=r4;return r9}r6=FUNCTION_TABLE[HEAP32[HEAP32[r7]+116>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-1)*12&-1)>>2],r14);if((r6|0)==0){___assert_func(66516,1376,68212,66228)}r5=r1+84|0;do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=1499;break}else{break}}else{r3=1499}}while(0);if(r3==1499){_midend_finish_move(r1);_midend_redraw(r1)}r11=(r1+52|0)>>2;r13=HEAP32[r11];L2104:do{if((r13|0)>(HEAP32[r10]|0)){r8=r13;while(1){r15=HEAP32[HEAP32[r7]+68>>2];r16=r8-1|0;HEAP32[r11]=r16;FUNCTION_TABLE[r15](HEAP32[HEAP32[r12]+(r16*12&-1)>>2]);r16=HEAP32[r11];r15=HEAP32[HEAP32[r12]+(r16*12&-1)+4>>2];if((r15|0)==0){r17=r16}else{_free(r15);r17=HEAP32[r11]}if((r17|0)>(HEAP32[r10]|0)){r8=r17}else{r18=r17;break L2104}}}else{r18=r13}}while(0);r13=r1+56|0;do{if((r18|0)<(HEAP32[r13>>2]|0)){r19=r18;r20=HEAP32[r12]}else{r17=r18+128|0;HEAP32[r13>>2]=r17;r8=HEAP32[r12];r15=r17*12&-1;if((r8|0)==0){r21=_malloc(r15)}else{r21=_realloc(r8,r15)}if((r21|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r15=r21;HEAP32[r12]=r15;r19=HEAP32[r11];r20=r15;break}}}while(0);HEAP32[r20+(r19*12&-1)>>2]=r6;HEAP32[HEAP32[r12]+(HEAP32[r11]*12&-1)+4>>2]=r14;HEAP32[HEAP32[r12]+(HEAP32[r11]*12&-1)+8>>2]=2;r14=HEAP32[r11];r6=r14+1|0;HEAP32[r11]=r6;HEAP32[r10]=r6;r6=(r1+80|0)>>2;r11=HEAP32[r6];if((r11|0)!=0){r19=HEAP32[r12];FUNCTION_TABLE[HEAP32[HEAP32[r7]+108>>2]](r11,HEAP32[r19+((r14-1)*12&-1)>>2],HEAP32[r19+(r14*12&-1)>>2])}HEAP32[r2+26]=1;r14=HEAP32[r7];if((HEAP32[r14+188>>2]&512|0)==0){HEAPF32[r2+22]=0;_midend_finish_move(r1)}else{r19=FUNCTION_TABLE[HEAP32[r14+64>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-2)*12&-1)>>2]);HEAP32[r5>>2]=r19;r19=HEAP32[r10];r5=HEAP32[r12];r14=FUNCTION_TABLE[HEAP32[HEAP32[r7]+148>>2]](HEAP32[r5+((r19-2)*12&-1)>>2],HEAP32[r5+((r19-1)*12&-1)>>2],1,HEAP32[r6]);HEAPF32[r2+22]=r14;HEAPF32[r2+23]=0}if((HEAP32[r2+30]|0)!=0){_midend_redraw(r1)}r1=HEAP32[r7];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=1522;break}else{r7=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-1)*12&-1)>>2],HEAP32[r6])|0)!=0;HEAP32[r2+27]=r7&1;if(r7){break}else{r3=1522;break}}}while(0);do{if(r3==1522){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r2+22]!=0){break}_deactivate_timer(HEAP32[r2]);r9=0;STACKTOP=r4;return r9}}while(0);_activate_timer(HEAP32[r2]);r9=0;STACKTOP=r4;return r9}function _midend_rewrite_statusbar(r1,r2){var r3,r4,r5,r6,r7;r3=STACKTOP;STACKTOP=STACKTOP+100|0;r4=r3;r5=r1+116|0;r6=HEAP32[r5>>2];do{if((r6|0)!=(r2|0)){if((r6|0)!=0){_free(r6)}r7=_malloc(_strlen(r2)+1|0);if((r7|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r7,r2);HEAP32[r5>>2]=r7;break}}}while(0);if((HEAP32[HEAP32[r1+8>>2]+180>>2]|0)==0){r5=_malloc(_strlen(r2)+1|0);if((r5|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r2);r6=r5;STACKTOP=r3;return r6}else{r5=HEAPF32[r1+112>>2]&-1;r1=r4|0;_sprintf(r1,66684,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=(r5|0)/60&-1,HEAP32[tempInt+4>>2]=(r5|0)%60,tempInt));r5=_malloc(_strlen(r1)+_strlen(r2)+1|0);if((r5|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r1);_strcat(r5,r2);r6=r5;STACKTOP=r3;return r6}}function _random_bits(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+96|0;r5=r4;if((r2|0)<=0){r6=0;r7=r2-1|0;r8=2<<r7;r9=r8-1|0;r10=r6&r9;STACKTOP=r4;return r10}r11=(r1+60|0)>>2;r12=r1|0;r13=r1+40|0;r14=r5|0;r15=r5+4|0;r16=r5+8|0;r17=r5+12|0;r18=r5+16|0;r19=r5+84|0;r20=r5+92|0;r21=r5+88|0;r22=0;r23=0;r24=HEAP32[r11];while(1){if((r24|0)>19){r25=0;while(1){r26=r1+r25|0;r27=HEAP8[r26];if(r27<<24>>24!=-1){r3=1553;break}HEAP8[r26]=0;r28=r25+1|0;if((r28|0)<20){r25=r28}else{break}}if(r3==1553){r3=0;HEAP8[r26]=r27+1&255}HEAP32[r14>>2]=1732584193;HEAP32[r15>>2]=-271733879;HEAP32[r16>>2]=-1732584194;HEAP32[r17>>2]=271733878;HEAP32[r18>>2]=-1009589776;HEAP32[r19>>2]=0;HEAP32[r20>>2]=0;HEAP32[r21>>2]=0;_SHA_Bytes(r5,r12,40);_SHA_Final(r5,r13);HEAP32[r11]=0;r29=0}else{r29=r24}r25=r29+1|0;HEAP32[r11]=r25;r28=HEAPU8[r1+(r29+40)|0]|r22<<8;r30=r23+8|0;if((r30|0)<(r2|0)){r22=r28;r23=r30;r24=r25}else{r6=r28;break}}r7=r2-1|0;r8=2<<r7;r9=r8-1|0;r10=r6&r9;STACKTOP=r4;return r10}function _random_new(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=STACKTOP;STACKTOP=STACKTOP+288|0;r4=r3,r5=r4>>2;r6=r3+96,r7=r6>>2;r8=r3+192,r9=r8>>2;r10=_malloc(64);if((r10|0)==0){_fatal(66164,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r9]=1732584193;HEAP32[r9+1]=-271733879;HEAP32[r9+2]=-1732584194;HEAP32[r9+3]=271733878;HEAP32[r9+4]=-1009589776;HEAP32[r9+21]=0;HEAP32[r9+23]=0;HEAP32[r9+22]=0;_SHA_Bytes(r8,r1,r2);_SHA_Final(r8,r10);HEAP32[r7]=1732584193;HEAP32[r7+1]=-271733879;HEAP32[r7+2]=-1732584194;HEAP32[r7+3]=271733878;HEAP32[r7+4]=-1009589776;HEAP32[r7+21]=0;HEAP32[r7+23]=0;HEAP32[r7+22]=0;_SHA_Bytes(r6,r10,20);_SHA_Final(r6,r10+20|0);HEAP32[r5]=1732584193;HEAP32[r5+1]=-271733879;HEAP32[r5+2]=-1732584194;HEAP32[r5+3]=271733878;HEAP32[r5+4]=-1009589776;HEAP32[r5+21]=0;HEAP32[r5+23]=0;HEAP32[r5+22]=0;_SHA_Bytes(r4,r10,40);_SHA_Final(r4,r10+40|0);HEAP32[r10+60>>2]=0;STACKTOP=r3;return r10}}function _malloc(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95;r2=0;do{if(r1>>>0<245){if(r1>>>0<11){r3=16}else{r3=r1+11&-8}r4=r3>>>3;r5=HEAP32[16906];r6=r5>>>(r4>>>0);if((r6&3|0)!=0){r7=(r6&1^1)+r4|0;r8=r7<<1;r9=(r8<<2)+67664|0;r10=(r8+2<<2)+67664|0;r8=HEAP32[r10>>2];r11=r8+8|0;r12=HEAP32[r11>>2];do{if((r9|0)==(r12|0)){HEAP32[16906]=r5&(1<<r7^-1)}else{if(r12>>>0<HEAP32[16910]>>>0){_abort()}r13=r12+12|0;if((HEAP32[r13>>2]|0)==(r8|0)){HEAP32[r13>>2]=r9;HEAP32[r10>>2]=r12;break}else{_abort()}}}while(0);r12=r7<<3;HEAP32[r8+4>>2]=r12|3;r10=r8+(r12|4)|0;HEAP32[r10>>2]=HEAP32[r10>>2]|1;r14=r11;return r14}if(r3>>>0<=HEAP32[16908]>>>0){r15=r3,r16=r15>>2;break}if((r6|0)!=0){r10=2<<r4;r12=r6<<r4&(r10|-r10);r10=(r12&-r12)-1|0;r12=r10>>>12&16;r9=r10>>>(r12>>>0);r10=r9>>>5&8;r13=r9>>>(r10>>>0);r9=r13>>>2&4;r17=r13>>>(r9>>>0);r13=r17>>>1&2;r18=r17>>>(r13>>>0);r17=r18>>>1&1;r19=(r10|r12|r9|r13|r17)+(r18>>>(r17>>>0))|0;r17=r19<<1;r18=(r17<<2)+67664|0;r13=(r17+2<<2)+67664|0;r17=HEAP32[r13>>2];r9=r17+8|0;r12=HEAP32[r9>>2];do{if((r18|0)==(r12|0)){HEAP32[16906]=r5&(1<<r19^-1)}else{if(r12>>>0<HEAP32[16910]>>>0){_abort()}r10=r12+12|0;if((HEAP32[r10>>2]|0)==(r17|0)){HEAP32[r10>>2]=r18;HEAP32[r13>>2]=r12;break}else{_abort()}}}while(0);r12=r19<<3;r13=r12-r3|0;HEAP32[r17+4>>2]=r3|3;r18=r17;r5=r18+r3|0;HEAP32[r18+(r3|4)>>2]=r13|1;HEAP32[r18+r12>>2]=r13;r12=HEAP32[16908];if((r12|0)!=0){r18=HEAP32[16911];r4=r12>>>3;r12=r4<<1;r6=(r12<<2)+67664|0;r11=HEAP32[16906];r8=1<<r4;do{if((r11&r8|0)==0){HEAP32[16906]=r11|r8;r20=r6;r21=(r12+2<<2)+67664|0}else{r4=(r12+2<<2)+67664|0;r7=HEAP32[r4>>2];if(r7>>>0>=HEAP32[16910]>>>0){r20=r7;r21=r4;break}_abort()}}while(0);HEAP32[r21>>2]=r18;HEAP32[r20+12>>2]=r18;HEAP32[r18+8>>2]=r20;HEAP32[r18+12>>2]=r6}HEAP32[16908]=r13;HEAP32[16911]=r5;r14=r9;return r14}r12=HEAP32[16907];if((r12|0)==0){r15=r3,r16=r15>>2;break}r8=(r12&-r12)-1|0;r12=r8>>>12&16;r11=r8>>>(r12>>>0);r8=r11>>>5&8;r17=r11>>>(r8>>>0);r11=r17>>>2&4;r19=r17>>>(r11>>>0);r17=r19>>>1&2;r4=r19>>>(r17>>>0);r19=r4>>>1&1;r7=HEAP32[((r8|r12|r11|r17|r19)+(r4>>>(r19>>>0))<<2)+67928>>2];r19=r7;r4=r7,r17=r4>>2;r11=(HEAP32[r7+4>>2]&-8)-r3|0;while(1){r7=HEAP32[r19+16>>2];if((r7|0)==0){r12=HEAP32[r19+20>>2];if((r12|0)==0){break}else{r22=r12}}else{r22=r7}r7=(HEAP32[r22+4>>2]&-8)-r3|0;r12=r7>>>0<r11>>>0;r19=r22;r4=r12?r22:r4,r17=r4>>2;r11=r12?r7:r11}r19=r4;r9=HEAP32[16910];if(r19>>>0<r9>>>0){_abort()}r5=r19+r3|0;r13=r5;if(r19>>>0>=r5>>>0){_abort()}r5=HEAP32[r17+6];r6=HEAP32[r17+3];L2361:do{if((r6|0)==(r4|0)){r18=r4+20|0;r7=HEAP32[r18>>2];do{if((r7|0)==0){r12=r4+16|0;r8=HEAP32[r12>>2];if((r8|0)==0){r23=0,r24=r23>>2;break L2361}else{r25=r8;r26=r12;break}}else{r25=r7;r26=r18}}while(0);while(1){r18=r25+20|0;r7=HEAP32[r18>>2];if((r7|0)!=0){r25=r7;r26=r18;continue}r18=r25+16|0;r7=HEAP32[r18>>2];if((r7|0)==0){break}else{r25=r7;r26=r18}}if(r26>>>0<r9>>>0){_abort()}else{HEAP32[r26>>2]=0;r23=r25,r24=r23>>2;break}}else{r18=HEAP32[r17+2];if(r18>>>0<r9>>>0){_abort()}r7=r18+12|0;if((HEAP32[r7>>2]|0)!=(r4|0)){_abort()}r12=r6+8|0;if((HEAP32[r12>>2]|0)==(r4|0)){HEAP32[r7>>2]=r6;HEAP32[r12>>2]=r18;r23=r6,r24=r23>>2;break}else{_abort()}}}while(0);L2383:do{if((r5|0)!=0){r6=r4+28|0;r9=(HEAP32[r6>>2]<<2)+67928|0;do{if((r4|0)==(HEAP32[r9>>2]|0)){HEAP32[r9>>2]=r23;if((r23|0)!=0){break}HEAP32[16907]=HEAP32[16907]&(1<<HEAP32[r6>>2]^-1);break L2383}else{if(r5>>>0<HEAP32[16910]>>>0){_abort()}r18=r5+16|0;if((HEAP32[r18>>2]|0)==(r4|0)){HEAP32[r18>>2]=r23}else{HEAP32[r5+20>>2]=r23}if((r23|0)==0){break L2383}}}while(0);if(r23>>>0<HEAP32[16910]>>>0){_abort()}HEAP32[r24+6]=r5;r6=HEAP32[r17+4];do{if((r6|0)!=0){if(r6>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r24+4]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);r6=HEAP32[r17+5];if((r6|0)==0){break}if(r6>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r24+5]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);if(r11>>>0<16){r5=r11+r3|0;HEAP32[r17+1]=r5|3;r6=r5+(r19+4)|0;HEAP32[r6>>2]=HEAP32[r6>>2]|1}else{HEAP32[r17+1]=r3|3;HEAP32[r19+(r3|4)>>2]=r11|1;HEAP32[r19+r11+r3>>2]=r11;r6=HEAP32[16908];if((r6|0)!=0){r5=HEAP32[16911];r9=r6>>>3;r6=r9<<1;r18=(r6<<2)+67664|0;r12=HEAP32[16906];r7=1<<r9;do{if((r12&r7|0)==0){HEAP32[16906]=r12|r7;r27=r18;r28=(r6+2<<2)+67664|0}else{r9=(r6+2<<2)+67664|0;r8=HEAP32[r9>>2];if(r8>>>0>=HEAP32[16910]>>>0){r27=r8;r28=r9;break}_abort()}}while(0);HEAP32[r28>>2]=r5;HEAP32[r27+12>>2]=r5;HEAP32[r5+8>>2]=r27;HEAP32[r5+12>>2]=r18}HEAP32[16908]=r11;HEAP32[16911]=r13}r6=r4+8|0;if((r6|0)==0){r15=r3,r16=r15>>2;break}else{r14=r6}return r14}else{if(r1>>>0>4294967231){r15=-1,r16=r15>>2;break}r6=r1+11|0;r7=r6&-8,r12=r7>>2;r19=HEAP32[16907];if((r19|0)==0){r15=r7,r16=r15>>2;break}r17=-r7|0;r9=r6>>>8;do{if((r9|0)==0){r29=0}else{if(r7>>>0>16777215){r29=31;break}r6=(r9+1048320|0)>>>16&8;r8=r9<<r6;r10=(r8+520192|0)>>>16&4;r30=r8<<r10;r8=(r30+245760|0)>>>16&2;r31=14-(r10|r6|r8)+(r30<<r8>>>15)|0;r29=r7>>>((r31+7|0)>>>0)&1|r31<<1}}while(0);r9=HEAP32[(r29<<2)+67928>>2];L2191:do{if((r9|0)==0){r32=0;r33=r17;r34=0}else{if((r29|0)==31){r35=0}else{r35=25-(r29>>>1)|0}r4=0;r13=r17;r11=r9,r18=r11>>2;r5=r7<<r35;r31=0;while(1){r8=HEAP32[r18+1]&-8;r30=r8-r7|0;if(r30>>>0<r13>>>0){if((r8|0)==(r7|0)){r32=r11;r33=r30;r34=r11;break L2191}else{r36=r11;r37=r30}}else{r36=r4;r37=r13}r30=HEAP32[r18+5];r8=HEAP32[((r5>>>31<<2)+16>>2)+r18];r6=(r30|0)==0|(r30|0)==(r8|0)?r31:r30;if((r8|0)==0){r32=r36;r33=r37;r34=r6;break L2191}else{r4=r36;r13=r37;r11=r8,r18=r11>>2;r5=r5<<1;r31=r6}}}}while(0);if((r34|0)==0&(r32|0)==0){r9=2<<r29;r17=r19&(r9|-r9);if((r17|0)==0){r15=r7,r16=r15>>2;break}r9=(r17&-r17)-1|0;r17=r9>>>12&16;r31=r9>>>(r17>>>0);r9=r31>>>5&8;r5=r31>>>(r9>>>0);r31=r5>>>2&4;r11=r5>>>(r31>>>0);r5=r11>>>1&2;r18=r11>>>(r5>>>0);r11=r18>>>1&1;r38=HEAP32[((r9|r17|r31|r5|r11)+(r18>>>(r11>>>0))<<2)+67928>>2]}else{r38=r34}L2206:do{if((r38|0)==0){r39=r33;r40=r32,r41=r40>>2}else{r11=r38,r18=r11>>2;r5=r33;r31=r32;while(1){r17=(HEAP32[r18+1]&-8)-r7|0;r9=r17>>>0<r5>>>0;r13=r9?r17:r5;r17=r9?r11:r31;r9=HEAP32[r18+4];if((r9|0)!=0){r11=r9,r18=r11>>2;r5=r13;r31=r17;continue}r9=HEAP32[r18+5];if((r9|0)==0){r39=r13;r40=r17,r41=r40>>2;break L2206}else{r11=r9,r18=r11>>2;r5=r13;r31=r17}}}}while(0);if((r40|0)==0){r15=r7,r16=r15>>2;break}if(r39>>>0>=(HEAP32[16908]-r7|0)>>>0){r15=r7,r16=r15>>2;break}r19=r40,r31=r19>>2;r5=HEAP32[16910];if(r19>>>0<r5>>>0){_abort()}r11=r19+r7|0;r18=r11;if(r19>>>0>=r11>>>0){_abort()}r17=HEAP32[r41+6];r13=HEAP32[r41+3];L2219:do{if((r13|0)==(r40|0)){r9=r40+20|0;r4=HEAP32[r9>>2];do{if((r4|0)==0){r6=r40+16|0;r8=HEAP32[r6>>2];if((r8|0)==0){r42=0,r43=r42>>2;break L2219}else{r44=r8;r45=r6;break}}else{r44=r4;r45=r9}}while(0);while(1){r9=r44+20|0;r4=HEAP32[r9>>2];if((r4|0)!=0){r44=r4;r45=r9;continue}r9=r44+16|0;r4=HEAP32[r9>>2];if((r4|0)==0){break}else{r44=r4;r45=r9}}if(r45>>>0<r5>>>0){_abort()}else{HEAP32[r45>>2]=0;r42=r44,r43=r42>>2;break}}else{r9=HEAP32[r41+2];if(r9>>>0<r5>>>0){_abort()}r4=r9+12|0;if((HEAP32[r4>>2]|0)!=(r40|0)){_abort()}r6=r13+8|0;if((HEAP32[r6>>2]|0)==(r40|0)){HEAP32[r4>>2]=r13;HEAP32[r6>>2]=r9;r42=r13,r43=r42>>2;break}else{_abort()}}}while(0);L2241:do{if((r17|0)!=0){r13=r40+28|0;r5=(HEAP32[r13>>2]<<2)+67928|0;do{if((r40|0)==(HEAP32[r5>>2]|0)){HEAP32[r5>>2]=r42;if((r42|0)!=0){break}HEAP32[16907]=HEAP32[16907]&(1<<HEAP32[r13>>2]^-1);break L2241}else{if(r17>>>0<HEAP32[16910]>>>0){_abort()}r9=r17+16|0;if((HEAP32[r9>>2]|0)==(r40|0)){HEAP32[r9>>2]=r42}else{HEAP32[r17+20>>2]=r42}if((r42|0)==0){break L2241}}}while(0);if(r42>>>0<HEAP32[16910]>>>0){_abort()}HEAP32[r43+6]=r17;r13=HEAP32[r41+4];do{if((r13|0)!=0){if(r13>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r43+4]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);r13=HEAP32[r41+5];if((r13|0)==0){break}if(r13>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r43+5]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);do{if(r39>>>0<16){r17=r39+r7|0;HEAP32[r41+1]=r17|3;r13=r17+(r19+4)|0;HEAP32[r13>>2]=HEAP32[r13>>2]|1}else{HEAP32[r41+1]=r7|3;HEAP32[((r7|4)>>2)+r31]=r39|1;HEAP32[(r39>>2)+r31+r12]=r39;r13=r39>>>3;if(r39>>>0<256){r17=r13<<1;r5=(r17<<2)+67664|0;r9=HEAP32[16906];r6=1<<r13;do{if((r9&r6|0)==0){HEAP32[16906]=r9|r6;r46=r5;r47=(r17+2<<2)+67664|0}else{r13=(r17+2<<2)+67664|0;r4=HEAP32[r13>>2];if(r4>>>0>=HEAP32[16910]>>>0){r46=r4;r47=r13;break}_abort()}}while(0);HEAP32[r47>>2]=r18;HEAP32[r46+12>>2]=r18;HEAP32[r12+(r31+2)]=r46;HEAP32[r12+(r31+3)]=r5;break}r17=r11;r6=r39>>>8;do{if((r6|0)==0){r48=0}else{if(r39>>>0>16777215){r48=31;break}r9=(r6+1048320|0)>>>16&8;r13=r6<<r9;r4=(r13+520192|0)>>>16&4;r8=r13<<r4;r13=(r8+245760|0)>>>16&2;r30=14-(r4|r9|r13)+(r8<<r13>>>15)|0;r48=r39>>>((r30+7|0)>>>0)&1|r30<<1}}while(0);r6=(r48<<2)+67928|0;HEAP32[r12+(r31+7)]=r48;HEAP32[r12+(r31+5)]=0;HEAP32[r12+(r31+4)]=0;r5=HEAP32[16907];r30=1<<r48;if((r5&r30|0)==0){HEAP32[16907]=r5|r30;HEAP32[r6>>2]=r17;HEAP32[r12+(r31+6)]=r6;HEAP32[r12+(r31+3)]=r17;HEAP32[r12+(r31+2)]=r17;break}if((r48|0)==31){r49=0}else{r49=25-(r48>>>1)|0}r30=r39<<r49;r5=HEAP32[r6>>2];while(1){if((HEAP32[r5+4>>2]&-8|0)==(r39|0)){break}r50=(r30>>>31<<2)+r5+16|0;r6=HEAP32[r50>>2];if((r6|0)==0){r2=1713;break}else{r30=r30<<1;r5=r6}}if(r2==1713){if(r50>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r50>>2]=r17;HEAP32[r12+(r31+6)]=r5;HEAP32[r12+(r31+3)]=r17;HEAP32[r12+(r31+2)]=r17;break}}r30=r5+8|0;r6=HEAP32[r30>>2];r13=HEAP32[16910];if(r5>>>0<r13>>>0){_abort()}if(r6>>>0<r13>>>0){_abort()}else{HEAP32[r6+12>>2]=r17;HEAP32[r30>>2]=r17;HEAP32[r12+(r31+2)]=r6;HEAP32[r12+(r31+3)]=r5;HEAP32[r12+(r31+6)]=0;break}}}while(0);r31=r40+8|0;if((r31|0)==0){r15=r7,r16=r15>>2;break}else{r14=r31}return r14}}while(0);r40=HEAP32[16908];if(r15>>>0<=r40>>>0){r50=r40-r15|0;r39=HEAP32[16911];if(r50>>>0>15){r49=r39;HEAP32[16911]=r49+r15|0;HEAP32[16908]=r50;HEAP32[(r49+4>>2)+r16]=r50|1;HEAP32[r49+r40>>2]=r50;HEAP32[r39+4>>2]=r15|3}else{HEAP32[16908]=0;HEAP32[16911]=0;HEAP32[r39+4>>2]=r40|3;r50=r40+(r39+4)|0;HEAP32[r50>>2]=HEAP32[r50>>2]|1}r14=r39+8|0;return r14}r39=HEAP32[16909];if(r15>>>0<r39>>>0){r50=r39-r15|0;HEAP32[16909]=r50;r39=HEAP32[16912];r40=r39;HEAP32[16912]=r40+r15|0;HEAP32[(r40+4>>2)+r16]=r50|1;HEAP32[r39+4>>2]=r15|3;r14=r39+8|0;return r14}do{if((HEAP32[16433]|0)==0){r39=_sysconf(8);if((r39-1&r39|0)==0){HEAP32[16435]=r39;HEAP32[16434]=r39;HEAP32[16436]=-1;HEAP32[16437]=2097152;HEAP32[16438]=0;HEAP32[17017]=0;r39=_time(0)&-16^1431655768;HEAP32[16433]=r39;break}else{_abort()}}}while(0);r39=r15+48|0;r50=HEAP32[16435];r40=r15+47|0;r49=r50+r40|0;r48=-r50|0;r50=r49&r48;if(r50>>>0<=r15>>>0){r14=0;return r14}r46=HEAP32[17016];do{if((r46|0)!=0){r47=HEAP32[17014];r41=r47+r50|0;if(r41>>>0<=r47>>>0|r41>>>0>r46>>>0){r14=0}else{break}return r14}}while(0);L2450:do{if((HEAP32[17017]&4|0)==0){r46=HEAP32[16912];L2452:do{if((r46|0)==0){r2=1743}else{r41=r46;r47=68072;while(1){r51=r47|0;r42=HEAP32[r51>>2];if(r42>>>0<=r41>>>0){r52=r47+4|0;if((r42+HEAP32[r52>>2]|0)>>>0>r41>>>0){break}}r42=HEAP32[r47+8>>2];if((r42|0)==0){r2=1743;break L2452}else{r47=r42}}if((r47|0)==0){r2=1743;break}r41=r49-HEAP32[16909]&r48;if(r41>>>0>=2147483647){r53=0;break}r5=_sbrk(r41);r17=(r5|0)==(HEAP32[r51>>2]+HEAP32[r52>>2]|0);r54=r17?r5:-1;r55=r17?r41:0;r56=r5;r57=r41;r2=1752;break}}while(0);do{if(r2==1743){r46=_sbrk(0);if((r46|0)==-1){r53=0;break}r7=r46;r41=HEAP32[16434];r5=r41-1|0;if((r5&r7|0)==0){r58=r50}else{r58=r50-r7+(r5+r7&-r41)|0}r41=HEAP32[17014];r7=r41+r58|0;if(!(r58>>>0>r15>>>0&r58>>>0<2147483647)){r53=0;break}r5=HEAP32[17016];if((r5|0)!=0){if(r7>>>0<=r41>>>0|r7>>>0>r5>>>0){r53=0;break}}r5=_sbrk(r58);r7=(r5|0)==(r46|0);r54=r7?r46:-1;r55=r7?r58:0;r56=r5;r57=r58;r2=1752;break}}while(0);L2472:do{if(r2==1752){r5=-r57|0;if((r54|0)!=-1){r59=r55,r60=r59>>2;r61=r54,r62=r61>>2;r2=1763;break L2450}do{if((r56|0)!=-1&r57>>>0<2147483647&r57>>>0<r39>>>0){r7=HEAP32[16435];r46=r40-r57+r7&-r7;if(r46>>>0>=2147483647){r63=r57;break}if((_sbrk(r46)|0)==-1){_sbrk(r5);r53=r55;break L2472}else{r63=r46+r57|0;break}}else{r63=r57}}while(0);if((r56|0)==-1){r53=r55}else{r59=r63,r60=r59>>2;r61=r56,r62=r61>>2;r2=1763;break L2450}}}while(0);HEAP32[17017]=HEAP32[17017]|4;r64=r53;r2=1760;break}else{r64=0;r2=1760}}while(0);do{if(r2==1760){if(r50>>>0>=2147483647){break}r53=_sbrk(r50);r56=_sbrk(0);if(!((r56|0)!=-1&(r53|0)!=-1&r53>>>0<r56>>>0)){break}r63=r56-r53|0;r56=r63>>>0>(r15+40|0)>>>0;r55=r56?r53:-1;if((r55|0)==-1){break}else{r59=r56?r63:r64,r60=r59>>2;r61=r55,r62=r61>>2;r2=1763;break}}}while(0);do{if(r2==1763){r64=HEAP32[17014]+r59|0;HEAP32[17014]=r64;if(r64>>>0>HEAP32[17015]>>>0){HEAP32[17015]=r64}r64=HEAP32[16912],r50=r64>>2;L2492:do{if((r64|0)==0){r55=HEAP32[16910];if((r55|0)==0|r61>>>0<r55>>>0){HEAP32[16910]=r61}HEAP32[17018]=r61;HEAP32[17019]=r59;HEAP32[17021]=0;HEAP32[16915]=HEAP32[16433];HEAP32[16914]=-1;r55=0;while(1){r63=r55<<1;r56=(r63<<2)+67664|0;HEAP32[(r63+3<<2)+67664>>2]=r56;HEAP32[(r63+2<<2)+67664>>2]=r56;r56=r55+1|0;if((r56|0)==32){break}else{r55=r56}}r55=r61+8|0;if((r55&7|0)==0){r65=0}else{r65=-r55&7}r55=r59-40-r65|0;HEAP32[16912]=r61+r65|0;HEAP32[16909]=r55;HEAP32[(r65+4>>2)+r62]=r55|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[16913]=HEAP32[16437]}else{r55=68072,r56=r55>>2;while(1){r66=HEAP32[r56];r67=r55+4|0;r68=HEAP32[r67>>2];if((r61|0)==(r66+r68|0)){r2=1775;break}r63=HEAP32[r56+2];if((r63|0)==0){break}else{r55=r63,r56=r55>>2}}do{if(r2==1775){if((HEAP32[r56+3]&8|0)!=0){break}r55=r64;if(!(r55>>>0>=r66>>>0&r55>>>0<r61>>>0)){break}HEAP32[r67>>2]=r68+r59|0;r55=HEAP32[16912];r63=HEAP32[16909]+r59|0;r53=r55;r57=r55+8|0;if((r57&7|0)==0){r69=0}else{r69=-r57&7}r57=r63-r69|0;HEAP32[16912]=r53+r69|0;HEAP32[16909]=r57;HEAP32[r69+(r53+4)>>2]=r57|1;HEAP32[r63+(r53+4)>>2]=40;HEAP32[16913]=HEAP32[16437];break L2492}}while(0);if(r61>>>0<HEAP32[16910]>>>0){HEAP32[16910]=r61}r56=r61+r59|0;r53=68072;while(1){r70=r53|0;if((HEAP32[r70>>2]|0)==(r56|0)){r2=1785;break}r63=HEAP32[r53+8>>2];if((r63|0)==0){break}else{r53=r63}}do{if(r2==1785){if((HEAP32[r53+12>>2]&8|0)!=0){break}HEAP32[r70>>2]=r61;r56=r53+4|0;HEAP32[r56>>2]=HEAP32[r56>>2]+r59|0;r56=r61+8|0;if((r56&7|0)==0){r71=0}else{r71=-r56&7}r56=r59+(r61+8)|0;if((r56&7|0)==0){r72=0,r73=r72>>2}else{r72=-r56&7,r73=r72>>2}r56=r61+r72+r59|0;r63=r56;r57=r71+r15|0,r55=r57>>2;r40=r61+r57|0;r57=r40;r39=r56-(r61+r71)-r15|0;HEAP32[(r71+4>>2)+r62]=r15|3;do{if((r63|0)==(HEAP32[16912]|0)){r54=HEAP32[16909]+r39|0;HEAP32[16909]=r54;HEAP32[16912]=r57;HEAP32[r55+(r62+1)]=r54|1}else{if((r63|0)==(HEAP32[16911]|0)){r54=HEAP32[16908]+r39|0;HEAP32[16908]=r54;HEAP32[16911]=r57;HEAP32[r55+(r62+1)]=r54|1;HEAP32[(r54>>2)+r62+r55]=r54;break}r54=r59+4|0;r58=HEAP32[(r54>>2)+r62+r73];if((r58&3|0)==1){r52=r58&-8;r51=r58>>>3;L2537:do{if(r58>>>0<256){r48=HEAP32[((r72|8)>>2)+r62+r60];r49=HEAP32[r73+(r62+(r60+3))];r5=(r51<<3)+67664|0;do{if((r48|0)!=(r5|0)){if(r48>>>0<HEAP32[16910]>>>0){_abort()}if((HEAP32[r48+12>>2]|0)==(r63|0)){break}_abort()}}while(0);if((r49|0)==(r48|0)){HEAP32[16906]=HEAP32[16906]&(1<<r51^-1);break}do{if((r49|0)==(r5|0)){r74=r49+8|0}else{if(r49>>>0<HEAP32[16910]>>>0){_abort()}r47=r49+8|0;if((HEAP32[r47>>2]|0)==(r63|0)){r74=r47;break}_abort()}}while(0);HEAP32[r48+12>>2]=r49;HEAP32[r74>>2]=r48}else{r5=r56;r47=HEAP32[((r72|24)>>2)+r62+r60];r46=HEAP32[r73+(r62+(r60+3))];L2558:do{if((r46|0)==(r5|0)){r7=r72|16;r41=r61+r54+r7|0;r17=HEAP32[r41>>2];do{if((r17|0)==0){r42=r61+r7+r59|0;r43=HEAP32[r42>>2];if((r43|0)==0){r75=0,r76=r75>>2;break L2558}else{r77=r43;r78=r42;break}}else{r77=r17;r78=r41}}while(0);while(1){r41=r77+20|0;r17=HEAP32[r41>>2];if((r17|0)!=0){r77=r17;r78=r41;continue}r41=r77+16|0;r17=HEAP32[r41>>2];if((r17|0)==0){break}else{r77=r17;r78=r41}}if(r78>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r78>>2]=0;r75=r77,r76=r75>>2;break}}else{r41=HEAP32[((r72|8)>>2)+r62+r60];if(r41>>>0<HEAP32[16910]>>>0){_abort()}r17=r41+12|0;if((HEAP32[r17>>2]|0)!=(r5|0)){_abort()}r7=r46+8|0;if((HEAP32[r7>>2]|0)==(r5|0)){HEAP32[r17>>2]=r46;HEAP32[r7>>2]=r41;r75=r46,r76=r75>>2;break}else{_abort()}}}while(0);if((r47|0)==0){break}r46=r72+(r61+(r59+28))|0;r48=(HEAP32[r46>>2]<<2)+67928|0;do{if((r5|0)==(HEAP32[r48>>2]|0)){HEAP32[r48>>2]=r75;if((r75|0)!=0){break}HEAP32[16907]=HEAP32[16907]&(1<<HEAP32[r46>>2]^-1);break L2537}else{if(r47>>>0<HEAP32[16910]>>>0){_abort()}r49=r47+16|0;if((HEAP32[r49>>2]|0)==(r5|0)){HEAP32[r49>>2]=r75}else{HEAP32[r47+20>>2]=r75}if((r75|0)==0){break L2537}}}while(0);if(r75>>>0<HEAP32[16910]>>>0){_abort()}HEAP32[r76+6]=r47;r5=r72|16;r46=HEAP32[(r5>>2)+r62+r60];do{if((r46|0)!=0){if(r46>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r76+4]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r46=HEAP32[(r54+r5>>2)+r62];if((r46|0)==0){break}if(r46>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r76+5]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r79=r61+(r52|r72)+r59|0;r80=r52+r39|0}else{r79=r63;r80=r39}r54=r79+4|0;HEAP32[r54>>2]=HEAP32[r54>>2]&-2;HEAP32[r55+(r62+1)]=r80|1;HEAP32[(r80>>2)+r62+r55]=r80;r54=r80>>>3;if(r80>>>0<256){r51=r54<<1;r58=(r51<<2)+67664|0;r46=HEAP32[16906];r47=1<<r54;do{if((r46&r47|0)==0){HEAP32[16906]=r46|r47;r81=r58;r82=(r51+2<<2)+67664|0}else{r54=(r51+2<<2)+67664|0;r48=HEAP32[r54>>2];if(r48>>>0>=HEAP32[16910]>>>0){r81=r48;r82=r54;break}_abort()}}while(0);HEAP32[r82>>2]=r57;HEAP32[r81+12>>2]=r57;HEAP32[r55+(r62+2)]=r81;HEAP32[r55+(r62+3)]=r58;break}r51=r40;r47=r80>>>8;do{if((r47|0)==0){r83=0}else{if(r80>>>0>16777215){r83=31;break}r46=(r47+1048320|0)>>>16&8;r52=r47<<r46;r54=(r52+520192|0)>>>16&4;r48=r52<<r54;r52=(r48+245760|0)>>>16&2;r49=14-(r54|r46|r52)+(r48<<r52>>>15)|0;r83=r80>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r83<<2)+67928|0;HEAP32[r55+(r62+7)]=r83;HEAP32[r55+(r62+5)]=0;HEAP32[r55+(r62+4)]=0;r58=HEAP32[16907];r49=1<<r83;if((r58&r49|0)==0){HEAP32[16907]=r58|r49;HEAP32[r47>>2]=r51;HEAP32[r55+(r62+6)]=r47;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}if((r83|0)==31){r84=0}else{r84=25-(r83>>>1)|0}r49=r80<<r84;r58=HEAP32[r47>>2];while(1){if((HEAP32[r58+4>>2]&-8|0)==(r80|0)){break}r85=(r49>>>31<<2)+r58+16|0;r47=HEAP32[r85>>2];if((r47|0)==0){r2=1858;break}else{r49=r49<<1;r58=r47}}if(r2==1858){if(r85>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r85>>2]=r51;HEAP32[r55+(r62+6)]=r58;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}}r49=r58+8|0;r47=HEAP32[r49>>2];r52=HEAP32[16910];if(r58>>>0<r52>>>0){_abort()}if(r47>>>0<r52>>>0){_abort()}else{HEAP32[r47+12>>2]=r51;HEAP32[r49>>2]=r51;HEAP32[r55+(r62+2)]=r47;HEAP32[r55+(r62+3)]=r58;HEAP32[r55+(r62+6)]=0;break}}}while(0);r14=r61+(r71|8)|0;return r14}}while(0);r53=r64;r55=68072,r40=r55>>2;while(1){r86=HEAP32[r40];if(r86>>>0<=r53>>>0){r87=HEAP32[r40+1];r88=r86+r87|0;if(r88>>>0>r53>>>0){break}}r55=HEAP32[r40+2],r40=r55>>2}r55=r86+(r87-39)|0;if((r55&7|0)==0){r89=0}else{r89=-r55&7}r55=r86+(r87-47)+r89|0;r40=r55>>>0<(r64+16|0)>>>0?r53:r55;r55=r40+8|0,r57=r55>>2;r39=r61+8|0;if((r39&7|0)==0){r90=0}else{r90=-r39&7}r39=r59-40-r90|0;HEAP32[16912]=r61+r90|0;HEAP32[16909]=r39;HEAP32[(r90+4>>2)+r62]=r39|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[16913]=HEAP32[16437];HEAP32[r40+4>>2]=27;HEAP32[r57]=HEAP32[17018];HEAP32[r57+1]=HEAP32[17019];HEAP32[r57+2]=HEAP32[17020];HEAP32[r57+3]=HEAP32[17021];HEAP32[17018]=r61;HEAP32[17019]=r59;HEAP32[17021]=0;HEAP32[17020]=r55;r55=r40+28|0;HEAP32[r55>>2]=7;L2656:do{if((r40+32|0)>>>0<r88>>>0){r57=r55;while(1){r39=r57+4|0;HEAP32[r39>>2]=7;if((r57+8|0)>>>0<r88>>>0){r57=r39}else{break L2656}}}}while(0);if((r40|0)==(r53|0)){break}r55=r40-r64|0;r57=r55+(r53+4)|0;HEAP32[r57>>2]=HEAP32[r57>>2]&-2;HEAP32[r50+1]=r55|1;HEAP32[r53+r55>>2]=r55;r57=r55>>>3;if(r55>>>0<256){r39=r57<<1;r63=(r39<<2)+67664|0;r56=HEAP32[16906];r47=1<<r57;do{if((r56&r47|0)==0){HEAP32[16906]=r56|r47;r91=r63;r92=(r39+2<<2)+67664|0}else{r57=(r39+2<<2)+67664|0;r49=HEAP32[r57>>2];if(r49>>>0>=HEAP32[16910]>>>0){r91=r49;r92=r57;break}_abort()}}while(0);HEAP32[r92>>2]=r64;HEAP32[r91+12>>2]=r64;HEAP32[r50+2]=r91;HEAP32[r50+3]=r63;break}r39=r64;r47=r55>>>8;do{if((r47|0)==0){r93=0}else{if(r55>>>0>16777215){r93=31;break}r56=(r47+1048320|0)>>>16&8;r53=r47<<r56;r40=(r53+520192|0)>>>16&4;r57=r53<<r40;r53=(r57+245760|0)>>>16&2;r49=14-(r40|r56|r53)+(r57<<r53>>>15)|0;r93=r55>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r93<<2)+67928|0;HEAP32[r50+7]=r93;HEAP32[r50+5]=0;HEAP32[r50+4]=0;r63=HEAP32[16907];r49=1<<r93;if((r63&r49|0)==0){HEAP32[16907]=r63|r49;HEAP32[r47>>2]=r39;HEAP32[r50+6]=r47;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}if((r93|0)==31){r94=0}else{r94=25-(r93>>>1)|0}r49=r55<<r94;r63=HEAP32[r47>>2];while(1){if((HEAP32[r63+4>>2]&-8|0)==(r55|0)){break}r95=(r49>>>31<<2)+r63+16|0;r47=HEAP32[r95>>2];if((r47|0)==0){r2=1893;break}else{r49=r49<<1;r63=r47}}if(r2==1893){if(r95>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r95>>2]=r39;HEAP32[r50+6]=r63;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}}r49=r63+8|0;r55=HEAP32[r49>>2];r47=HEAP32[16910];if(r63>>>0<r47>>>0){_abort()}if(r55>>>0<r47>>>0){_abort()}else{HEAP32[r55+12>>2]=r39;HEAP32[r49>>2]=r39;HEAP32[r50+2]=r55;HEAP32[r50+3]=r63;HEAP32[r50+6]=0;break}}}while(0);r50=HEAP32[16909];if(r50>>>0<=r15>>>0){break}r64=r50-r15|0;HEAP32[16909]=r64;r50=HEAP32[16912];r55=r50;HEAP32[16912]=r55+r15|0;HEAP32[(r55+4>>2)+r16]=r64|1;HEAP32[r50+4>>2]=r15|3;r14=r50+8|0;return r14}}while(0);r15=___errno_location();HEAP32[r15>>2]=12;r14=0;return r14}function _free(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r2=r1>>2;r3=0;if((r1|0)==0){return}r4=r1-8|0;r5=r4;r6=HEAP32[16910];if(r4>>>0<r6>>>0){_abort()}r7=HEAP32[r1-4>>2];r8=r7&3;if((r8|0)==1){_abort()}r9=r7&-8,r10=r9>>2;r11=r1+(r9-8)|0;r12=r11;L2709:do{if((r7&1|0)==0){r13=HEAP32[r4>>2];if((r8|0)==0){return}r14=-8-r13|0,r15=r14>>2;r16=r1+r14|0;r17=r16;r18=r13+r9|0;if(r16>>>0<r6>>>0){_abort()}if((r17|0)==(HEAP32[16911]|0)){r19=(r1+(r9-4)|0)>>2;if((HEAP32[r19]&3|0)!=3){r20=r17,r21=r20>>2;r22=r18;break}HEAP32[16908]=r18;HEAP32[r19]=HEAP32[r19]&-2;HEAP32[r15+(r2+1)]=r18|1;HEAP32[r11>>2]=r18;return}r19=r13>>>3;if(r13>>>0<256){r13=HEAP32[r15+(r2+2)];r23=HEAP32[r15+(r2+3)];r24=(r19<<3)+67664|0;do{if((r13|0)!=(r24|0)){if(r13>>>0<r6>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r17|0)){break}_abort()}}while(0);if((r23|0)==(r13|0)){HEAP32[16906]=HEAP32[16906]&(1<<r19^-1);r20=r17,r21=r20>>2;r22=r18;break}do{if((r23|0)==(r24|0)){r25=r23+8|0}else{if(r23>>>0<r6>>>0){_abort()}r26=r23+8|0;if((HEAP32[r26>>2]|0)==(r17|0)){r25=r26;break}_abort()}}while(0);HEAP32[r13+12>>2]=r23;HEAP32[r25>>2]=r13;r20=r17,r21=r20>>2;r22=r18;break}r24=r16;r19=HEAP32[r15+(r2+6)];r26=HEAP32[r15+(r2+3)];L2743:do{if((r26|0)==(r24|0)){r27=r14+(r1+20)|0;r28=HEAP32[r27>>2];do{if((r28|0)==0){r29=r14+(r1+16)|0;r30=HEAP32[r29>>2];if((r30|0)==0){r31=0,r32=r31>>2;break L2743}else{r33=r30;r34=r29;break}}else{r33=r28;r34=r27}}while(0);while(1){r27=r33+20|0;r28=HEAP32[r27>>2];if((r28|0)!=0){r33=r28;r34=r27;continue}r27=r33+16|0;r28=HEAP32[r27>>2];if((r28|0)==0){break}else{r33=r28;r34=r27}}if(r34>>>0<r6>>>0){_abort()}else{HEAP32[r34>>2]=0;r31=r33,r32=r31>>2;break}}else{r27=HEAP32[r15+(r2+2)];if(r27>>>0<r6>>>0){_abort()}r28=r27+12|0;if((HEAP32[r28>>2]|0)!=(r24|0)){_abort()}r29=r26+8|0;if((HEAP32[r29>>2]|0)==(r24|0)){HEAP32[r28>>2]=r26;HEAP32[r29>>2]=r27;r31=r26,r32=r31>>2;break}else{_abort()}}}while(0);if((r19|0)==0){r20=r17,r21=r20>>2;r22=r18;break}r26=r14+(r1+28)|0;r16=(HEAP32[r26>>2]<<2)+67928|0;do{if((r24|0)==(HEAP32[r16>>2]|0)){HEAP32[r16>>2]=r31;if((r31|0)!=0){break}HEAP32[16907]=HEAP32[16907]&(1<<HEAP32[r26>>2]^-1);r20=r17,r21=r20>>2;r22=r18;break L2709}else{if(r19>>>0<HEAP32[16910]>>>0){_abort()}r13=r19+16|0;if((HEAP32[r13>>2]|0)==(r24|0)){HEAP32[r13>>2]=r31}else{HEAP32[r19+20>>2]=r31}if((r31|0)==0){r20=r17,r21=r20>>2;r22=r18;break L2709}}}while(0);if(r31>>>0<HEAP32[16910]>>>0){_abort()}HEAP32[r32+6]=r19;r24=HEAP32[r15+(r2+4)];do{if((r24|0)!=0){if(r24>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r32+4]=r24;HEAP32[r24+24>>2]=r31;break}}}while(0);r24=HEAP32[r15+(r2+5)];if((r24|0)==0){r20=r17,r21=r20>>2;r22=r18;break}if(r24>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r32+5]=r24;HEAP32[r24+24>>2]=r31;r20=r17,r21=r20>>2;r22=r18;break}}else{r20=r5,r21=r20>>2;r22=r9}}while(0);r5=r20,r31=r5>>2;if(r5>>>0>=r11>>>0){_abort()}r5=r1+(r9-4)|0;r32=HEAP32[r5>>2];if((r32&1|0)==0){_abort()}do{if((r32&2|0)==0){if((r12|0)==(HEAP32[16912]|0)){r6=HEAP32[16909]+r22|0;HEAP32[16909]=r6;HEAP32[16912]=r20;HEAP32[r21+1]=r6|1;if((r20|0)==(HEAP32[16911]|0)){HEAP32[16911]=0;HEAP32[16908]=0}if(r6>>>0<=HEAP32[16913]>>>0){return}_sys_trim(0);return}if((r12|0)==(HEAP32[16911]|0)){r6=HEAP32[16908]+r22|0;HEAP32[16908]=r6;HEAP32[16911]=r20;HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;return}r6=(r32&-8)+r22|0;r33=r32>>>3;L2815:do{if(r32>>>0<256){r34=HEAP32[r2+r10];r25=HEAP32[((r9|4)>>2)+r2];r8=(r33<<3)+67664|0;do{if((r34|0)!=(r8|0)){if(r34>>>0<HEAP32[16910]>>>0){_abort()}if((HEAP32[r34+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r25|0)==(r34|0)){HEAP32[16906]=HEAP32[16906]&(1<<r33^-1);break}do{if((r25|0)==(r8|0)){r35=r25+8|0}else{if(r25>>>0<HEAP32[16910]>>>0){_abort()}r4=r25+8|0;if((HEAP32[r4>>2]|0)==(r12|0)){r35=r4;break}_abort()}}while(0);HEAP32[r34+12>>2]=r25;HEAP32[r35>>2]=r34}else{r8=r11;r4=HEAP32[r10+(r2+4)];r7=HEAP32[((r9|4)>>2)+r2];L2836:do{if((r7|0)==(r8|0)){r24=r9+(r1+12)|0;r19=HEAP32[r24>>2];do{if((r19|0)==0){r26=r9+(r1+8)|0;r16=HEAP32[r26>>2];if((r16|0)==0){r36=0,r37=r36>>2;break L2836}else{r38=r16;r39=r26;break}}else{r38=r19;r39=r24}}while(0);while(1){r24=r38+20|0;r19=HEAP32[r24>>2];if((r19|0)!=0){r38=r19;r39=r24;continue}r24=r38+16|0;r19=HEAP32[r24>>2];if((r19|0)==0){break}else{r38=r19;r39=r24}}if(r39>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r39>>2]=0;r36=r38,r37=r36>>2;break}}else{r24=HEAP32[r2+r10];if(r24>>>0<HEAP32[16910]>>>0){_abort()}r19=r24+12|0;if((HEAP32[r19>>2]|0)!=(r8|0)){_abort()}r26=r7+8|0;if((HEAP32[r26>>2]|0)==(r8|0)){HEAP32[r19>>2]=r7;HEAP32[r26>>2]=r24;r36=r7,r37=r36>>2;break}else{_abort()}}}while(0);if((r4|0)==0){break}r7=r9+(r1+20)|0;r34=(HEAP32[r7>>2]<<2)+67928|0;do{if((r8|0)==(HEAP32[r34>>2]|0)){HEAP32[r34>>2]=r36;if((r36|0)!=0){break}HEAP32[16907]=HEAP32[16907]&(1<<HEAP32[r7>>2]^-1);break L2815}else{if(r4>>>0<HEAP32[16910]>>>0){_abort()}r25=r4+16|0;if((HEAP32[r25>>2]|0)==(r8|0)){HEAP32[r25>>2]=r36}else{HEAP32[r4+20>>2]=r36}if((r36|0)==0){break L2815}}}while(0);if(r36>>>0<HEAP32[16910]>>>0){_abort()}HEAP32[r37+6]=r4;r8=HEAP32[r10+(r2+2)];do{if((r8|0)!=0){if(r8>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r37+4]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);r8=HEAP32[r10+(r2+3)];if((r8|0)==0){break}if(r8>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r37+5]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;if((r20|0)!=(HEAP32[16911]|0)){r40=r6;break}HEAP32[16908]=r6;return}else{HEAP32[r5>>2]=r32&-2;HEAP32[r21+1]=r22|1;HEAP32[(r22>>2)+r31]=r22;r40=r22}}while(0);r22=r40>>>3;if(r40>>>0<256){r31=r22<<1;r32=(r31<<2)+67664|0;r5=HEAP32[16906];r36=1<<r22;do{if((r5&r36|0)==0){HEAP32[16906]=r5|r36;r41=r32;r42=(r31+2<<2)+67664|0}else{r22=(r31+2<<2)+67664|0;r37=HEAP32[r22>>2];if(r37>>>0>=HEAP32[16910]>>>0){r41=r37;r42=r22;break}_abort()}}while(0);HEAP32[r42>>2]=r20;HEAP32[r41+12>>2]=r20;HEAP32[r21+2]=r41;HEAP32[r21+3]=r32;return}r32=r20;r41=r40>>>8;do{if((r41|0)==0){r43=0}else{if(r40>>>0>16777215){r43=31;break}r42=(r41+1048320|0)>>>16&8;r31=r41<<r42;r36=(r31+520192|0)>>>16&4;r5=r31<<r36;r31=(r5+245760|0)>>>16&2;r22=14-(r36|r42|r31)+(r5<<r31>>>15)|0;r43=r40>>>((r22+7|0)>>>0)&1|r22<<1}}while(0);r41=(r43<<2)+67928|0;HEAP32[r21+7]=r43;HEAP32[r21+5]=0;HEAP32[r21+4]=0;r22=HEAP32[16907];r31=1<<r43;do{if((r22&r31|0)==0){HEAP32[16907]=r22|r31;HEAP32[r41>>2]=r32;HEAP32[r21+6]=r41;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20}else{if((r43|0)==31){r44=0}else{r44=25-(r43>>>1)|0}r5=r40<<r44;r42=HEAP32[r41>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r40|0)){break}r45=(r5>>>31<<2)+r42+16|0;r36=HEAP32[r45>>2];if((r36|0)==0){r3=2072;break}else{r5=r5<<1;r42=r36}}if(r3==2072){if(r45>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r45>>2]=r32;HEAP32[r21+6]=r42;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20;break}}r5=r42+8|0;r6=HEAP32[r5>>2];r36=HEAP32[16910];if(r42>>>0<r36>>>0){_abort()}if(r6>>>0<r36>>>0){_abort()}else{HEAP32[r6+12>>2]=r32;HEAP32[r5>>2]=r32;HEAP32[r21+2]=r6;HEAP32[r21+3]=r42;HEAP32[r21+6]=0;break}}}while(0);r21=HEAP32[16914]-1|0;HEAP32[16914]=r21;if((r21|0)==0){r46=68080}else{return}while(1){r21=HEAP32[r46>>2];if((r21|0)==0){break}else{r46=r21+8|0}}HEAP32[16914]=-1;return}function _realloc(r1,r2){var r3,r4,r5,r6;if((r1|0)==0){r3=_malloc(r2);return r3}if(r2>>>0>4294967231){r4=___errno_location();HEAP32[r4>>2]=12;r3=0;return r3}if(r2>>>0<11){r5=16}else{r5=r2+11&-8}r4=_try_realloc_chunk(r1-8|0,r5);if((r4|0)!=0){r3=r4+8|0;return r3}r4=_malloc(r2);if((r4|0)==0){r3=0;return r3}r5=HEAP32[r1-4>>2];r6=(r5&-8)-((r5&3|0)==0?8:4)|0;_memcpy(r4,r1,r6>>>0<r2>>>0?r6:r2);_free(r1);r3=r4;return r3}function _sys_trim(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;do{if((HEAP32[16433]|0)==0){r2=_sysconf(8);if((r2-1&r2|0)==0){HEAP32[16435]=r2;HEAP32[16434]=r2;HEAP32[16436]=-1;HEAP32[16437]=2097152;HEAP32[16438]=0;HEAP32[17017]=0;r2=_time(0)&-16^1431655768;HEAP32[16433]=r2;break}else{_abort()}}}while(0);if(r1>>>0>=4294967232){r3=0;r4=r3&1;return r4}r2=HEAP32[16912];if((r2|0)==0){r3=0;r4=r3&1;return r4}r5=HEAP32[16909];do{if(r5>>>0>(r1+40|0)>>>0){r6=HEAP32[16435];r7=Math.imul(Math.floor(((-40-r1-1+r5+r6|0)>>>0)/(r6>>>0))-1|0,r6);r8=r2;r9=68072,r10=r9>>2;while(1){r11=HEAP32[r10];if(r11>>>0<=r8>>>0){if((r11+HEAP32[r10+1]|0)>>>0>r8>>>0){r12=r9;break}}r11=HEAP32[r10+2];if((r11|0)==0){r12=0;break}else{r9=r11,r10=r9>>2}}if((HEAP32[r12+12>>2]&8|0)!=0){break}r9=_sbrk(0);r10=(r12+4|0)>>2;if((r9|0)!=(HEAP32[r12>>2]+HEAP32[r10]|0)){break}r8=_sbrk(-(r7>>>0>2147483646?-2147483648-r6|0:r7)|0);r11=_sbrk(0);if(!((r8|0)!=-1&r11>>>0<r9>>>0)){break}r8=r9-r11|0;if((r9|0)==(r11|0)){break}HEAP32[r10]=HEAP32[r10]-r8|0;HEAP32[17014]=HEAP32[17014]-r8|0;r10=HEAP32[16912];r13=HEAP32[16909]-r8|0;r8=r10;r14=r10+8|0;if((r14&7|0)==0){r15=0}else{r15=-r14&7}r14=r13-r15|0;HEAP32[16912]=r8+r15|0;HEAP32[16909]=r14;HEAP32[r15+(r8+4)>>2]=r14|1;HEAP32[r13+(r8+4)>>2]=40;HEAP32[16913]=HEAP32[16437];r3=(r9|0)!=(r11|0);r4=r3&1;return r4}}while(0);if(HEAP32[16909]>>>0<=HEAP32[16913]>>>0){r3=0;r4=r3&1;return r4}HEAP32[16913]=-1;r3=0;r4=r3&1;return r4}function _try_realloc_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29;r3=(r1+4|0)>>2;r4=HEAP32[r3];r5=r4&-8,r6=r5>>2;r7=r1,r8=r7>>2;r9=r7+r5|0;r10=r9;r11=HEAP32[16910];if(r7>>>0<r11>>>0){_abort()}r12=r4&3;if(!((r12|0)!=1&r7>>>0<r9>>>0)){_abort()}r13=(r7+(r5|4)|0)>>2;r14=HEAP32[r13];if((r14&1|0)==0){_abort()}if((r12|0)==0){if(r2>>>0<256){r15=0;return r15}do{if(r5>>>0>=(r2+4|0)>>>0){if((r5-r2|0)>>>0>HEAP32[16435]<<1>>>0){break}else{r15=r1}return r15}}while(0);r15=0;return r15}if(r5>>>0>=r2>>>0){r12=r5-r2|0;if(r12>>>0<=15){r15=r1;return r15}HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|3;HEAP32[r13]=HEAP32[r13]|1;_dispose_chunk(r7+r2|0,r12);r15=r1;return r15}if((r10|0)==(HEAP32[16912]|0)){r12=HEAP32[16909]+r5|0;if(r12>>>0<=r2>>>0){r15=0;return r15}r13=r12-r2|0;HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r13|1;HEAP32[16912]=r7+r2|0;HEAP32[16909]=r13;r15=r1;return r15}if((r10|0)==(HEAP32[16911]|0)){r13=HEAP32[16908]+r5|0;if(r13>>>0<r2>>>0){r15=0;return r15}r12=r13-r2|0;if(r12>>>0>15){HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|1;HEAP32[(r13>>2)+r8]=r12;r16=r13+(r7+4)|0;HEAP32[r16>>2]=HEAP32[r16>>2]&-2;r17=r7+r2|0;r18=r12}else{HEAP32[r3]=r4&1|r13|2;r4=r13+(r7+4)|0;HEAP32[r4>>2]=HEAP32[r4>>2]|1;r17=0;r18=0}HEAP32[16908]=r18;HEAP32[16911]=r17;r15=r1;return r15}if((r14&2|0)!=0){r15=0;return r15}r17=(r14&-8)+r5|0;if(r17>>>0<r2>>>0){r15=0;return r15}r18=r17-r2|0;r4=r14>>>3;L3035:do{if(r14>>>0<256){r13=HEAP32[r6+(r8+2)];r12=HEAP32[r6+(r8+3)];r16=(r4<<3)+67664|0;do{if((r13|0)!=(r16|0)){if(r13>>>0<r11>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r10|0)){break}_abort()}}while(0);if((r12|0)==(r13|0)){HEAP32[16906]=HEAP32[16906]&(1<<r4^-1);break}do{if((r12|0)==(r16|0)){r19=r12+8|0}else{if(r12>>>0<r11>>>0){_abort()}r20=r12+8|0;if((HEAP32[r20>>2]|0)==(r10|0)){r19=r20;break}_abort()}}while(0);HEAP32[r13+12>>2]=r12;HEAP32[r19>>2]=r13}else{r16=r9;r20=HEAP32[r6+(r8+6)];r21=HEAP32[r6+(r8+3)];L3037:do{if((r21|0)==(r16|0)){r22=r5+(r7+20)|0;r23=HEAP32[r22>>2];do{if((r23|0)==0){r24=r5+(r7+16)|0;r25=HEAP32[r24>>2];if((r25|0)==0){r26=0,r27=r26>>2;break L3037}else{r28=r25;r29=r24;break}}else{r28=r23;r29=r22}}while(0);while(1){r22=r28+20|0;r23=HEAP32[r22>>2];if((r23|0)!=0){r28=r23;r29=r22;continue}r22=r28+16|0;r23=HEAP32[r22>>2];if((r23|0)==0){break}else{r28=r23;r29=r22}}if(r29>>>0<r11>>>0){_abort()}else{HEAP32[r29>>2]=0;r26=r28,r27=r26>>2;break}}else{r22=HEAP32[r6+(r8+2)];if(r22>>>0<r11>>>0){_abort()}r23=r22+12|0;if((HEAP32[r23>>2]|0)!=(r16|0)){_abort()}r24=r21+8|0;if((HEAP32[r24>>2]|0)==(r16|0)){HEAP32[r23>>2]=r21;HEAP32[r24>>2]=r22;r26=r21,r27=r26>>2;break}else{_abort()}}}while(0);if((r20|0)==0){break}r21=r5+(r7+28)|0;r13=(HEAP32[r21>>2]<<2)+67928|0;do{if((r16|0)==(HEAP32[r13>>2]|0)){HEAP32[r13>>2]=r26;if((r26|0)!=0){break}HEAP32[16907]=HEAP32[16907]&(1<<HEAP32[r21>>2]^-1);break L3035}else{if(r20>>>0<HEAP32[16910]>>>0){_abort()}r12=r20+16|0;if((HEAP32[r12>>2]|0)==(r16|0)){HEAP32[r12>>2]=r26}else{HEAP32[r20+20>>2]=r26}if((r26|0)==0){break L3035}}}while(0);if(r26>>>0<HEAP32[16910]>>>0){_abort()}HEAP32[r27+6]=r20;r16=HEAP32[r6+(r8+4)];do{if((r16|0)!=0){if(r16>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r27+4]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);r16=HEAP32[r6+(r8+5)];if((r16|0)==0){break}if(r16>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r27+5]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);if(r18>>>0<16){HEAP32[r3]=r17|HEAP32[r3]&1|2;r26=r7+(r17|4)|0;HEAP32[r26>>2]=HEAP32[r26>>2]|1;r15=r1;return r15}else{HEAP32[r3]=HEAP32[r3]&1|r2|2;HEAP32[(r2+4>>2)+r8]=r18|3;r8=r7+(r17|4)|0;HEAP32[r8>>2]=HEAP32[r8>>2]|1;_dispose_chunk(r7+r2|0,r18);r15=r1;return r15}}function _dispose_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43;r3=r2>>2;r4=0;r5=r1,r6=r5>>2;r7=r5+r2|0;r8=r7;r9=HEAP32[r1+4>>2];L3111:do{if((r9&1|0)==0){r10=HEAP32[r1>>2];if((r9&3|0)==0){return}r11=r5+ -r10|0;r12=r11;r13=r10+r2|0;r14=HEAP32[16910];if(r11>>>0<r14>>>0){_abort()}if((r12|0)==(HEAP32[16911]|0)){r15=(r2+(r5+4)|0)>>2;if((HEAP32[r15]&3|0)!=3){r16=r12,r17=r16>>2;r18=r13;break}HEAP32[16908]=r13;HEAP32[r15]=HEAP32[r15]&-2;HEAP32[(4-r10>>2)+r6]=r13|1;HEAP32[r7>>2]=r13;return}r15=r10>>>3;if(r10>>>0<256){r19=HEAP32[(8-r10>>2)+r6];r20=HEAP32[(12-r10>>2)+r6];r21=(r15<<3)+67664|0;do{if((r19|0)!=(r21|0)){if(r19>>>0<r14>>>0){_abort()}if((HEAP32[r19+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r20|0)==(r19|0)){HEAP32[16906]=HEAP32[16906]&(1<<r15^-1);r16=r12,r17=r16>>2;r18=r13;break}do{if((r20|0)==(r21|0)){r22=r20+8|0}else{if(r20>>>0<r14>>>0){_abort()}r23=r20+8|0;if((HEAP32[r23>>2]|0)==(r12|0)){r22=r23;break}_abort()}}while(0);HEAP32[r19+12>>2]=r20;HEAP32[r22>>2]=r19;r16=r12,r17=r16>>2;r18=r13;break}r21=r11;r15=HEAP32[(24-r10>>2)+r6];r23=HEAP32[(12-r10>>2)+r6];L3145:do{if((r23|0)==(r21|0)){r24=16-r10|0;r25=r24+(r5+4)|0;r26=HEAP32[r25>>2];do{if((r26|0)==0){r27=r5+r24|0;r28=HEAP32[r27>>2];if((r28|0)==0){r29=0,r30=r29>>2;break L3145}else{r31=r28;r32=r27;break}}else{r31=r26;r32=r25}}while(0);while(1){r25=r31+20|0;r26=HEAP32[r25>>2];if((r26|0)!=0){r31=r26;r32=r25;continue}r25=r31+16|0;r26=HEAP32[r25>>2];if((r26|0)==0){break}else{r31=r26;r32=r25}}if(r32>>>0<r14>>>0){_abort()}else{HEAP32[r32>>2]=0;r29=r31,r30=r29>>2;break}}else{r25=HEAP32[(8-r10>>2)+r6];if(r25>>>0<r14>>>0){_abort()}r26=r25+12|0;if((HEAP32[r26>>2]|0)!=(r21|0)){_abort()}r24=r23+8|0;if((HEAP32[r24>>2]|0)==(r21|0)){HEAP32[r26>>2]=r23;HEAP32[r24>>2]=r25;r29=r23,r30=r29>>2;break}else{_abort()}}}while(0);if((r15|0)==0){r16=r12,r17=r16>>2;r18=r13;break}r23=r5+(28-r10)|0;r14=(HEAP32[r23>>2]<<2)+67928|0;do{if((r21|0)==(HEAP32[r14>>2]|0)){HEAP32[r14>>2]=r29;if((r29|0)!=0){break}HEAP32[16907]=HEAP32[16907]&(1<<HEAP32[r23>>2]^-1);r16=r12,r17=r16>>2;r18=r13;break L3111}else{if(r15>>>0<HEAP32[16910]>>>0){_abort()}r11=r15+16|0;if((HEAP32[r11>>2]|0)==(r21|0)){HEAP32[r11>>2]=r29}else{HEAP32[r15+20>>2]=r29}if((r29|0)==0){r16=r12,r17=r16>>2;r18=r13;break L3111}}}while(0);if(r29>>>0<HEAP32[16910]>>>0){_abort()}HEAP32[r30+6]=r15;r21=16-r10|0;r23=HEAP32[(r21>>2)+r6];do{if((r23|0)!=0){if(r23>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r30+4]=r23;HEAP32[r23+24>>2]=r29;break}}}while(0);r23=HEAP32[(r21+4>>2)+r6];if((r23|0)==0){r16=r12,r17=r16>>2;r18=r13;break}if(r23>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r30+5]=r23;HEAP32[r23+24>>2]=r29;r16=r12,r17=r16>>2;r18=r13;break}}else{r16=r1,r17=r16>>2;r18=r2}}while(0);r1=HEAP32[16910];if(r7>>>0<r1>>>0){_abort()}r29=r2+(r5+4)|0;r30=HEAP32[r29>>2];do{if((r30&2|0)==0){if((r8|0)==(HEAP32[16912]|0)){r31=HEAP32[16909]+r18|0;HEAP32[16909]=r31;HEAP32[16912]=r16;HEAP32[r17+1]=r31|1;if((r16|0)!=(HEAP32[16911]|0)){return}HEAP32[16911]=0;HEAP32[16908]=0;return}if((r8|0)==(HEAP32[16911]|0)){r31=HEAP32[16908]+r18|0;HEAP32[16908]=r31;HEAP32[16911]=r16;HEAP32[r17+1]=r31|1;HEAP32[(r31>>2)+r17]=r31;return}r31=(r30&-8)+r18|0;r32=r30>>>3;L3210:do{if(r30>>>0<256){r22=HEAP32[r3+(r6+2)];r9=HEAP32[r3+(r6+3)];r23=(r32<<3)+67664|0;do{if((r22|0)!=(r23|0)){if(r22>>>0<r1>>>0){_abort()}if((HEAP32[r22+12>>2]|0)==(r8|0)){break}_abort()}}while(0);if((r9|0)==(r22|0)){HEAP32[16906]=HEAP32[16906]&(1<<r32^-1);break}do{if((r9|0)==(r23|0)){r33=r9+8|0}else{if(r9>>>0<r1>>>0){_abort()}r10=r9+8|0;if((HEAP32[r10>>2]|0)==(r8|0)){r33=r10;break}_abort()}}while(0);HEAP32[r22+12>>2]=r9;HEAP32[r33>>2]=r22}else{r23=r7;r10=HEAP32[r3+(r6+6)];r15=HEAP32[r3+(r6+3)];L3212:do{if((r15|0)==(r23|0)){r14=r2+(r5+20)|0;r11=HEAP32[r14>>2];do{if((r11|0)==0){r19=r2+(r5+16)|0;r20=HEAP32[r19>>2];if((r20|0)==0){r34=0,r35=r34>>2;break L3212}else{r36=r20;r37=r19;break}}else{r36=r11;r37=r14}}while(0);while(1){r14=r36+20|0;r11=HEAP32[r14>>2];if((r11|0)!=0){r36=r11;r37=r14;continue}r14=r36+16|0;r11=HEAP32[r14>>2];if((r11|0)==0){break}else{r36=r11;r37=r14}}if(r37>>>0<r1>>>0){_abort()}else{HEAP32[r37>>2]=0;r34=r36,r35=r34>>2;break}}else{r14=HEAP32[r3+(r6+2)];if(r14>>>0<r1>>>0){_abort()}r11=r14+12|0;if((HEAP32[r11>>2]|0)!=(r23|0)){_abort()}r19=r15+8|0;if((HEAP32[r19>>2]|0)==(r23|0)){HEAP32[r11>>2]=r15;HEAP32[r19>>2]=r14;r34=r15,r35=r34>>2;break}else{_abort()}}}while(0);if((r10|0)==0){break}r15=r2+(r5+28)|0;r22=(HEAP32[r15>>2]<<2)+67928|0;do{if((r23|0)==(HEAP32[r22>>2]|0)){HEAP32[r22>>2]=r34;if((r34|0)!=0){break}HEAP32[16907]=HEAP32[16907]&(1<<HEAP32[r15>>2]^-1);break L3210}else{if(r10>>>0<HEAP32[16910]>>>0){_abort()}r9=r10+16|0;if((HEAP32[r9>>2]|0)==(r23|0)){HEAP32[r9>>2]=r34}else{HEAP32[r10+20>>2]=r34}if((r34|0)==0){break L3210}}}while(0);if(r34>>>0<HEAP32[16910]>>>0){_abort()}HEAP32[r35+6]=r10;r23=HEAP32[r3+(r6+4)];do{if((r23|0)!=0){if(r23>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r35+4]=r23;HEAP32[r23+24>>2]=r34;break}}}while(0);r23=HEAP32[r3+(r6+5)];if((r23|0)==0){break}if(r23>>>0<HEAP32[16910]>>>0){_abort()}else{HEAP32[r35+5]=r23;HEAP32[r23+24>>2]=r34;break}}}while(0);HEAP32[r17+1]=r31|1;HEAP32[(r31>>2)+r17]=r31;if((r16|0)!=(HEAP32[16911]|0)){r38=r31;break}HEAP32[16908]=r31;return}else{HEAP32[r29>>2]=r30&-2;HEAP32[r17+1]=r18|1;HEAP32[(r18>>2)+r17]=r18;r38=r18}}while(0);r18=r38>>>3;if(r38>>>0<256){r30=r18<<1;r29=(r30<<2)+67664|0;r34=HEAP32[16906];r35=1<<r18;do{if((r34&r35|0)==0){HEAP32[16906]=r34|r35;r39=r29;r40=(r30+2<<2)+67664|0}else{r18=(r30+2<<2)+67664|0;r6=HEAP32[r18>>2];if(r6>>>0>=HEAP32[16910]>>>0){r39=r6;r40=r18;break}_abort()}}while(0);HEAP32[r40>>2]=r16;HEAP32[r39+12>>2]=r16;HEAP32[r17+2]=r39;HEAP32[r17+3]=r29;return}r29=r16;r39=r38>>>8;do{if((r39|0)==0){r41=0}else{if(r38>>>0>16777215){r41=31;break}r40=(r39+1048320|0)>>>16&8;r30=r39<<r40;r35=(r30+520192|0)>>>16&4;r34=r30<<r35;r30=(r34+245760|0)>>>16&2;r18=14-(r35|r40|r30)+(r34<<r30>>>15)|0;r41=r38>>>((r18+7|0)>>>0)&1|r18<<1}}while(0);r39=(r41<<2)+67928|0;HEAP32[r17+7]=r41;HEAP32[r17+5]=0;HEAP32[r17+4]=0;r18=HEAP32[16907];r30=1<<r41;if((r18&r30|0)==0){HEAP32[16907]=r18|r30;HEAP32[r39>>2]=r29;HEAP32[r17+6]=r39;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}if((r41|0)==31){r42=0}else{r42=25-(r41>>>1)|0}r41=r38<<r42;r42=HEAP32[r39>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r38|0)){break}r43=(r41>>>31<<2)+r42+16|0;r39=HEAP32[r43>>2];if((r39|0)==0){r4=2378;break}else{r41=r41<<1;r42=r39}}if(r4==2378){if(r43>>>0<HEAP32[16910]>>>0){_abort()}HEAP32[r43>>2]=r29;HEAP32[r17+6]=r42;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}r16=r42+8|0;r43=HEAP32[r16>>2];r4=HEAP32[16910];if(r42>>>0<r4>>>0){_abort()}if(r43>>>0<r4>>>0){_abort()}HEAP32[r43+12>>2]=r29;HEAP32[r16>>2]=r29;HEAP32[r17+2]=r43;HEAP32[r17+3]=r42;HEAP32[r17+6]=0;return}
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
