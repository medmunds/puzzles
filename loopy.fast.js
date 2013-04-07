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
STATICTOP += 5316;
assert(STATICTOP < TOTAL_MEMORY);
var _stderr;
allocate([0,0,0,0,0,0,0,0,0,0,0,0,98,0,0,0,114,0,0,0,78,0,0,0,120,0,0,0,84,0,0,0,122,0,0,0,1,0,0,0,112,0,0,0,80,0,0,0,56,0,0,0,158,0,0,0,160,0,0,0,164,0,0,0,24,0,0,0,2,0,0,0,1,0,0,0,10,0,0,0,1,0,0,0,142,0,0,0,130,0,0,0,106,0,0,0,108,0,0,0,64,0,0,0,82,0,0,0,28,0,0,0,156,0,0,0,168,0,0,0,32,0,0,0,86,0,0,0,50,0,0,0,136,0,0,0,92,0,0,0,6,0,0,0,96,0,0,0,44,0,0,0,138,0,0,0,118,0,0,0,1,0,0,0,0,0,0,0,152,0,0,0,58,0,0,0,0,0,0,0,0,0,0,0,126,0,0,0,0,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0], ALLOC_NONE, 65536);
allocate([7,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,7,0,0,0,1,0,0,0,0,0,0,0,7,0,0,0,7,0,0,0,3,0,0,0,0,0,0,0,7,0,0,0,7,0,0,0,3,0,0,0,1,0,0,0,7,0,0,0,7,0,0,0,3,0,0,0,2,0,0,0,5,0,0,0,5,0,0,0,3,0,0,0,3,0,0,0,7,0,0,0,7,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,4,0,0,0,3,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,3,0,0,0,6,0,0,0,5,0,0,0,5,0,0,0,3,0,0,0,7,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,8,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,9,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,10,0,0,0,6,0,0,0,6,0,0,0,3,0,0,0,11,0,0,0,6,0,0,0,6,0,0,0,3,0,0,0,12,0,0,0], "i8", ALLOC_NONE, 65728);
allocate(24, "i8", ALLOC_NONE, 65968);
allocate([255,255,255,255], "i8", ALLOC_NONE, 65992);
allocate([6,0,0,0,2,0,0,0,1,0,0,0,3,0,0,0,4,0,0,0], "i8", ALLOC_NONE, 65996);
allocate(52, "i8", ALLOC_NONE, 66016);
allocate([0,0,0,0,2,0,0,0,1,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,12,0,0,0], "i8", ALLOC_NONE, 66068);
allocate([34,0,0,0,90,0,0,0,30,0,0,0,18,0,0,0,4,0,0,0,166,0,0,0,66,0,0,0,14,0,0,0,144,0,0,0,32,0,0,0,52,0,0,0,60,0,0,0,12,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NONE, 66120);
allocate([3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, 66172);
allocate([70,0,0,0,54,0,0,0,104,0,0,0,154,0,0,0,36,0,0,0,132,0,0,0,22,0,0,0,102,0,0,0,48,0,0,0,124,0,0,0,110,0,0,0,88,0,0,0,20,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NONE, 66380);
allocate([255,255,255,255], "i8", ALLOC_NONE, 66432);
allocate(16, "i8", ALLOC_NONE, 66436);
allocate([101,110,116,104,0] /* enth\00 */, "i8", ALLOC_NONE, 66452);
allocate([150,0,0,0,62,0,0,0,8,0,0,0,162,0,0,0,40,0,0,0,38,0,0,0,94,0,0,0,68,0,0,0,148,0,0,0,140,0,0,0,46,0,0,0,116,0,0,0,134,0,0,0,146,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100,0,0,0,74,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NONE, 66460);
allocate([100,115,102,46,99,0] /* dsf.c\00 */, "i8", ALLOC_NONE, 66560);
allocate([109,101,45,62,115,116,97,116,101,112,111,115,32,62,61,32,49,0] /* me-_statepos _= 1\00 */, "i8", ALLOC_NONE, 66568);
allocate([107,32,33,61,32,102,45,62,111,114,100,101,114,0] /* k != f-_order\00 */, "i8", ALLOC_NONE, 66588);
allocate([102,45,62,111,114,100,101,114,32,61,61,32,52,0] /* f-_order == 4\00 */, "i8", ALLOC_NONE, 66604);
allocate([110,45,62,101,108,101,109,115,91,107,105,93,0] /* n-_elems[ki]\00 */, "i8", ALLOC_NONE, 66620);
allocate([82,117,110,110,105,110,103,32,115,111,108,118,101,114,32,115,111,97,107,32,116,101,115,116,115,10,0] /* Running solver soak  */, "i8", ALLOC_NONE, 66636);
allocate([110,101,120,116,95,110,101,119,95,101,100,103,101,32,45,32,103,45,62,101,100,103,101,115,32,60,32,103,45,62,110,117,109,95,101,100,103,101,115,0] /* next_new_edge - g-_e */, "i8", ALLOC_NONE, 66664);
allocate([105,50,32,61,61,32,105,110,118,101,114,115,101,0] /* i2 == inverse\00 */, "i8", ALLOC_NONE, 66704);
allocate([115,116,97,116,101,45,62,103,114,105,100,95,116,121,112,101,32,61,61,32,48,0] /* state-_grid_type ==  */, "i8", ALLOC_NONE, 66720);
allocate([115,32,33,61,32,78,85,76,76,0] /* s != NULL\00 */, "i8", ALLOC_NONE, 66744);
allocate([48,0] /* 0\00 */, "i8", ALLOC_NONE, 66756);
allocate([37,115,95,84,69,83,84,83,79,76,86,69,0] /* %s_TESTSOLVE\00 */, "i8", ALLOC_NONE, 66760);
allocate([103,45,62,110,117,109,95,100,111,116,115,32,60,61,32,109,97,120,95,100,111,116,115,0] /* g-_num_dots _= max_d */, "i8", ALLOC_NONE, 66776);
allocate([118,50,32,61,61,32,118,49,0] /* v2 == v1\00 */, "i8", ALLOC_NONE, 66800);
allocate([108,111,111,112,121,46,99,0] /* loopy.c\00 */, "i8", ALLOC_NONE, 66812);
allocate([105,110,118,101,114,115,101,32,61,61,32,48,32,124,124,32,105,110,118,101,114,115,101,32,61,61,32,49,0] /* inverse == 0 || inve */, "i8", ALLOC_NONE, 66820);
allocate([100,114,97,119,105,110,103,46,99,0] /* drawing.c\00 */, "i8", ALLOC_NONE, 66852);
allocate([80,101,110,114,111,115,101,32,40,114,104,111,109,98,115,41,0] /* Penrose (rhombs)\00 */, "i8", ALLOC_NONE, 66864);
allocate([80,101,110,114,111,115,101,32,40,107,105,116,101,47,100,97,114,116,41,0] /* Penrose (kite/dart)\ */, "i8", ALLOC_NONE, 66884);
allocate([71,114,101,97,116,45,68,111,100,101,99,97,103,111,110,97,108,0] /* Great-Dodecagonal\00 */, "i8", ALLOC_NONE, 66904);
allocate([68,111,100,101,99,97,103,111,110,97,108,0] /* Dodecagonal\00 */, "i8", ALLOC_NONE, 66924);
allocate([70,108,111,114,101,116,0] /* Floret\00 */, "i8", ALLOC_NONE, 66936);
allocate([33,108,101,102,116,45,62,101,108,101,109,115,91,50,93,32,38,38,32,33,114,105,103,104,116,45,62,101,108,101,109,115,91,50,93,0] /* !left-_elems[2] && ! */, "i8", ALLOC_NONE, 66944);
allocate([75,105,116,101,115,0] /* Kites\00 */, "i8", ALLOC_NONE, 66980);
allocate([79,99,116,97,103,111,110,97,108,0] /* Octagonal\00 */, "i8", ALLOC_NONE, 66988);
allocate([115,0] /* s\00 */, "i8", ALLOC_NONE, 67000);
allocate([106,32,33,61,32,116,101,115,116,95,102,97,99,101,45,62,100,111,116,115,91,105,93,45,62,111,114,100,101,114,0] /* j != test_face-_dots */, "i8", ALLOC_NONE, 67004);
allocate([103,45,62,110,117,109,95,102,97,99,101,115,32,60,61,32,109,97,120,95,102,97,99,101,115,0] /* g-_num_faces _= max_ */, "i8", ALLOC_NONE, 67036);
allocate([71,114,101,97,116,45,72,101,120,97,103,111,110,97,108,0] /* Great-Hexagonal\00 */, "i8", ALLOC_NONE, 67064);
allocate([67,97,105,114,111,0] /* Cairo\00 */, "i8", ALLOC_NONE, 67080);
allocate([37,100,37,99,0] /* %d%c\00 */, "i8", ALLOC_NONE, 67088);
allocate([33,105,110,118,101,114,115,101,0] /* !inverse\00 */, "i8", ALLOC_NONE, 67096);
allocate([83,110,117,98,45,83,113,117,97,114,101,0] /* Snub-Square\00 */, "i8", ALLOC_NONE, 67108);
allocate([72,111,110,101,121,99,111,109,98,0] /* Honeycomb\00 */, "i8", ALLOC_NONE, 67120);
allocate([84,114,105,97,110,103,117,108,97,114,0] /* Triangular\00 */, "i8", ALLOC_NONE, 67132);
allocate([83,113,117,97,114,101,115,0] /* Squares\00 */, "i8", ALLOC_NONE, 67144);
allocate([72,97,114,100,0] /* Hard\00 */, "i8", ALLOC_NONE, 67152);
allocate([84,114,105,99,107,121,0] /* Tricky\00 */, "i8", ALLOC_NONE, 67160);
allocate([78,111,114,109,97,108,0] /* Normal\00 */, "i8", ALLOC_NONE, 67168);
allocate([69,97,115,121,0] /* Easy\00 */, "i8", ALLOC_NONE, 67176);
allocate([109,111,118,101,115,116,114,32,38,38,32,33,109,115,103,0] /* movestr && !msg\00 */, "i8", ALLOC_NONE, 67184);
allocate([98,111,97,114,100,91,102,97,99,101,95,105,110,100,101,120,93,32,33,61,32,99,111,108,111,117,114,0] /* board[face_index] != */, "i8", ALLOC_NONE, 67200);
allocate([71,37,100,44,37,100,44,37,100,0] /* G%d,%d,%d\00 */, "i8", ALLOC_NONE, 67228);
allocate([37,100,120,37,100,32,37,115,32,45,32,37,115,0] /* %dx%d %s - %s\00 */, "i8", ALLOC_NONE, 67240);
allocate([100,37,99,0] /* d%c\00 */, "i8", ALLOC_NONE, 67256);
allocate([49,50,51,52,53,54,55,56,57,48,0] /* 1234567890\00 */, "i8", ALLOC_NONE, 67260);
allocate([100,115,102,91,118,50,93,32,38,32,50,0] /* dsf[v2] & 2\00 */, "i8", ALLOC_NONE, 67272);
allocate([37,100,120,37,100,116,37,100,0] /* %dx%dt%d\00 */, "i8", ALLOC_NONE, 67284);
allocate([58,69,97,115,121,58,78,111,114,109,97,108,58,84,114,105,99,107,121,58,72,97,114,100,0] /* :Easy:Normal:Tricky: */, "i8", ALLOC_NONE, 67296);
allocate([68,105,102,102,105,99,117,108,116,121,0] /* Difficulty\00 */, "i8", ALLOC_NONE, 67324);
allocate([58,83,113,117,97,114,101,115,58,84,114,105,97,110,103,117,108,97,114,58,72,111,110,101,121,99,111,109,98,58,83,110,117,98,45,83,113,117,97,114,101,58,67,97,105,114,111,58,71,114,101,97,116,45,72,101,120,97,103,111,110,97,108,58,79,99,116,97,103,111,110,97,108,58,75,105,116,101,115,58,70,108,111,114,101,116,58,68,111,100,101,99,97,103,111,110,97,108,58,71,114,101,97,116,45,68,111,100,101,99,97,103,111,110,97,108,58,80,101,110,114,111,115,101,32,40,107,105,116,101,47,100,97,114,116,41,58,80,101,110,114,111,115,101,32,40,114,104,111,109,98,115,41,0] /* :Squares:Triangular: */, "i8", ALLOC_NONE, 67336);
allocate([71,114,105,100,32,116,121,112,101,0] /* Grid type\00 */, "i8", ALLOC_NONE, 67492);
allocate([72,101,105,103,104,116,0] /* Height\00 */, "i8", ALLOC_NONE, 67504);
allocate([87,105,100,116,104,0] /* Width\00 */, "i8", ALLOC_NONE, 67512);
allocate([87,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,102,111,114,32,116,104,105,115,32,103,114,105,100,32,116,121,112,101,32,109,117,115,116,32,98,111,116,104,32,98,101,32,97,116,32,108,101,97,115,116,32,50,0] /* Width and height for */, "i8", ALLOC_NONE, 67520);
allocate([109,101,45,62,110,115,116,97,116,101,115,32,61,61,32,48,0] /* me-_nstates == 0\00 */, "i8", ALLOC_NONE, 67580);
allocate([98,111,97,114,100,91,105,93,32,61,61,32,70,65,67,69,95,71,82,69,89,0] /* board[i] == FACE_GRE */, "i8", ALLOC_NONE, 67600);
allocate([33,34,73,110,118,97,108,105,100,32,103,114,105,100,32,100,101,115,99,114,105,112,116,105,111,110,46,34,0] /* !\22Invalid grid des */, "i8", ALLOC_NONE, 67624);
allocate([65,116,32,108,101,97,115,116,32,111,110,101,32,111,102,32,119,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,102,111,114,32,116,104,105,115,32,103,114,105,100,32,116,121,112,101,32,109,117,115,116,32,98,101,32,97,116,32,108,101,97,115,116,32,50,0] /* At least one of widt */, "i8", ALLOC_NONE, 67656);
allocate([87,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,102,111,114,32,116,104,105,115,32,103,114,105,100,32,116,121,112,101,32,109,117,115,116,32,98,111,116,104,32,98,101,32,97,116,32,108,101,97,115,116,32,49,0] /* Width and height for */, "i8", ALLOC_NONE, 67728);
allocate([76,79,79,80,89,95,70,65,73,78,84,95,76,73,78,69,83,0] /* LOOPY_FAINT_LINES\00 */, "i8", ALLOC_NONE, 67788);
allocate([100,115,102,91,118,49,93,32,38,32,50,0] /* dsf[v1] & 2\00 */, "i8", ALLOC_NONE, 67808);
allocate([65,116,32,108,101,97,115,116,32,111,110,101,32,111,102,32,119,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,102,111,114,32,116,104,105,115,32,103,114,105,100,32,116,121,112,101,32,109,117,115,116,32,98,101,32,97,116,32,108,101,97,115,116,32,52,0] /* At least one of widt */, "i8", ALLOC_NONE, 67820);
allocate([65,116,32,108,101,97,115,116,32,111,110,101,32,111,102,32,119,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,102,111,114,32,116,104,105,115,32,103,114,105,100,32,116,121,112,101,32,109,117,115,116,32,98,101,32,97,116,32,108,101,97,115,116,32,51,0] /* At least one of widt */, "i8", ALLOC_NONE, 67892);
allocate([87,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,102,111,114,32,116,104,105,115,32,103,114,105,100,32,116,121,112,101,32,109,117,115,116,32,98,111,116,104,32,98,101,32,97,116,32,108,101,97,115,116,32,51,0] /* Width and height for */, "i8", ALLOC_NONE, 67964);
allocate([112,97,114,97,109,115,45,62,100,105,102,102,32,60,32,68,73,70,70,95,77,65,88,0] /* params-_diff _ DIFF_ */, "i8", ALLOC_NONE, 68024);
allocate([116,114,101,101,50,51,52,46,99,0] /* tree234.c\00 */, "i8", ALLOC_NONE, 68048);
allocate([73,108,108,101,103,97,108,32,103,114,105,100,32,116,121,112,101,0] /* Illegal grid type\00 */, "i8", ALLOC_NONE, 68060);
allocate([99,50,32,33,61,32,70,65,67,69,95,71,82,69,89,0] /* c2 != FACE_GREY\00 */, "i8", ALLOC_NONE, 68080);
allocate([114,97,110,100,111,109,46,99,0] /* random.c\00 */, "i8", ALLOC_NONE, 68096);
allocate([99,49,32,33,61,32,70,65,67,69,95,71,82,69,89,0] /* c1 != FACE_GREY\00 */, "i8", ALLOC_NONE, 68108);
allocate([91,37,100,58,37,48,50,100,93,32,0] /* [%d:%02d] \00 */, "i8", ALLOC_NONE, 68124);
allocate([115,115,116,97,116,101,95,110,101,119,45,62,115,111,108,118,101,114,95,115,116,97,116,117,115,32,33,61,32,83,79,76,86,69,82,95,77,73,83,84,65,75,69,0] /* sstate_new-_solver_s */, "i8", ALLOC_NONE, 68136);
allocate([109,105,100,101,110,100,46,99,0] /* midend.c\00 */, "i8", ALLOC_NONE, 68180);
allocate([98,111,97,114,100,91,107,93,32,61,61,32,70,65,67,69,95,71,82,69,89,0] /* board[k] == FACE_GRE */, "i8", ALLOC_NONE, 68192);
allocate([83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,32,102,97,105,108,101,100,0] /* Solve operation fail */, "i8", ALLOC_NONE, 68216);
allocate([71,114,105,100,32,100,101,115,99,114,105,112,116,105,111,110,32,115,116,114,105,110,103,115,32,110,111,116,32,117,115,101,100,32,119,105,116,104,32,116,104,105,115,32,103,114,105,100,32,116,121,112,101,0] /* Grid description str */, "i8", ALLOC_NONE, 68240);
allocate([78,111,32,103,97,109,101,32,115,101,116,32,117,112,32,116,111,32,115,111,108,118,101,0] /* No game set up to so */, "i8", ALLOC_NONE, 68296);
allocate([33,118,97,108,105,100,97,116,101,95,100,101,115,99,40,112,97,114,97,109,115,44,32,114,101,116,118,97,108,41,0] /* !validate_desc(param */, "i8", ALLOC_NONE, 68320);
allocate([105,110,118,101,114,115,101,32,61,61,32,48,0] /* inverse == 0\00 */, "i8", ALLOC_NONE, 68352);
allocate([84,104,105,115,32,103,97,109,101,32,100,111,101,115,32,110,111,116,32,115,117,112,112,111,114,116,32,116,104,101,32,83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,0] /* This game does not s */, "i8", ALLOC_NONE, 68368);
allocate([68,101,115,99,114,105,112,116,105,111,110,32,116,111,111,32,108,111,110,103,32,102,111,114,32,98,111,97,114,100,32,115,105,122,101,0] /* Description too long */, "i8", ALLOC_NONE, 68416);
allocate([100,114,45,62,109,101,0] /* dr-_me\00 */, "i8", ALLOC_NONE, 68452);
allocate([68,101,115,99,114,105,112,116,105,111,110,32,116,111,111,32,115,104,111,114,116,32,102,111,114,32,98,111,97,114,100,32,115,105,122,101,0] /* Description too shor */, "i8", ALLOC_NONE, 68460);
allocate([112,101,110,114,111,115,101,46,99,0] /* penrose.c\00 */, "i8", ALLOC_NONE, 68500);
allocate([85,110,107,110,111,119,110,32,99,104,97,114,97,99,116,101,114,32,105,110,32,100,101,115,99,114,105,112,116,105,111,110,0] /* Unknown character in */, "i8", ALLOC_NONE, 68512);
allocate([37,115,37,99,37,115,0] /* %s%c%s\00 */, "i8", ALLOC_NONE, 68548);
allocate([110,32,62,32,48,0] /* n _ 0\00 */, "i8", ALLOC_NONE, 68556);
allocate([37,100,0] /* %d\00 */, "i8", ALLOC_NONE, 68564);
allocate([42,100,112,0] /* _dp\00 */, "i8", ALLOC_NONE, 68568);
allocate([114,32,61,61,32,84,82,85,69,0] /* r == TRUE\00 */, "i8", ALLOC_NONE, 68572);
allocate([114,0] /* r\00 */, "i8", ALLOC_NONE, 68584);
allocate([102,115,0] /* fs\00 */, "i8", ALLOC_NONE, 68588);
allocate([98,101,115,116,100,105,115,116,32,62,32,48,0] /* bestdist _ 0\00 */, "i8", ALLOC_NONE, 68592);
allocate([103,45,62,101,100,103,101,115,91,101,49,93,46,100,111,116,50,32,61,61,32,103,45,62,101,100,103,101,115,91,101,50,93,46,100,111,116,49,32,124,124,32,103,45,62,101,100,103,101,115,91,101,49,93,46,100,111,116,50,32,61,61,32,103,45,62,101,100,103,101,115,91,101,50,93,46,100,111,116,50,0] /* g-_edges[e1].dot2 == */, "i8", ALLOC_NONE, 68608);
allocate([65,110,103,108,101,32,111,102,102,115,101,116,32,111,117,116,32,111,102,32,98,111,117,110,100,115,46,0] /* Angle offset out of  */, "i8", ALLOC_NONE, 68692);
allocate([78,32,60,61,32,77,65,88,95,70,65,67,69,95,83,73,90,69,0] /* N _= MAX_FACE_SIZE\0 */, "i8", ALLOC_NONE, 68720);
allocate([108,111,111,112,121,0] /* loopy\00 */, "i8", ALLOC_NONE, 68740);
allocate([105,110,100,101,120,32,62,61,32,48,0] /* index _= 0\00 */, "i8", ALLOC_NONE, 68748);
allocate([80,97,116,99,104,32,111,102,102,115,101,116,32,111,117,116,32,111,102,32,98,111,117,110,100,115,46,0] /* Patch offset out of  */, "i8", ALLOC_NONE, 68760);
allocate([106,32,60,32,115,115,116,97,116,101,45,62,115,116,97,116,101,45,62,103,97,109,101,95,103,114,105,100,45,62,110,117,109,95,101,100,103,101,115,0] /* j _ sstate-_state-_g */, "i8", ALLOC_NONE, 68788);
allocate([73,110,118,97,108,105,100,32,102,111,114,109,97,116,32,103,114,105,100,32,100,101,115,99,114,105,112,116,105,111,110,32,115,116,114,105,110,103,46,0] /* Invalid format grid  */, "i8", ALLOC_NONE, 68828);
allocate([105,32,60,32,115,115,116,97,116,101,45,62,115,116,97,116,101,45,62,103,97,109,101,95,103,114,105,100,45,62,110,117,109,95,101,100,103,101,115,0] /* i _ sstate-_state-_g */, "i8", ALLOC_NONE, 68868);
allocate([77,105,115,115,105,110,103,32,103,114,105,100,32,100,101,115,99,114,105,112,116,105,111,110,32,115,116,114,105,110,103,46,0] /* Missing grid descrip */, "i8", ALLOC_NONE, 68908);
allocate([108,105,110,101,95,110,101,119,32,33,61,32,76,73,78,69,95,85,78,75,78,79,87,78,0] /* line_new != LINE_UNK */, "i8", ALLOC_NONE, 68944);
allocate([37,115,95,68,69,70,65,85,76,84,0] /* %s_DEFAULT\00 */, "i8", ALLOC_NONE, 68972);
allocate(1, "i8", ALLOC_NONE, 68984);
allocate([110,32,62,61,32,48,32,38,38,32,110,32,60,32,109,101,45,62,110,112,114,101,115,101,116,115,0] /* n _= 0 && n _ me-_np */, "i8", ALLOC_NONE, 68988);
allocate([100,45,62,102,97,99,101,115,91,99,117,114,114,101,110,116,95,102,97,99,101,50,93,0] /* d-_faces[current_fac */, "i8", ALLOC_NONE, 69016);
allocate([111,117,116,32,111,102,32,109,101,109,111,114,121,0] /* out of memory\00 */, "i8", ALLOC_NONE, 69040);
allocate([112,114,111,103,114,101,115,115,32,61,61,32,84,82,85,69,0] /* progress == TRUE\00 */, "i8", ALLOC_NONE, 69056);
allocate([37,115,95,80,82,69,83,69,84,83,0] /* %s_PRESETS\00 */, "i8", ALLOC_NONE, 69076);
allocate([106,32,33,61,32,102,45,62,111,114,100,101,114,0] /* j != f-_order\00 */, "i8", ALLOC_NONE, 69088);
allocate([108,111,111,112,103,101,110,46,99,0] /* loopgen.c\00 */, "i8", ALLOC_NONE, 69104);
allocate([115,115,116,97,116,101,45,62,115,111,108,118,101,114,95,115,116,97,116,117,115,32,61,61,32,83,79,76,86,69,82,95,73,78,67,79,77,80,76,69,84,69,0] /* sstate-_solver_statu */, "i8", ALLOC_NONE, 69116);
allocate([102,97,116,97,108,32,101,114,114,111,114,58,32,0] /* fatal error: \00 */, "i8", ALLOC_NONE, 69160);
allocate([37,50,120,37,50,120,37,50,120,0] /* %2x%2x%2x\00 */, "i8", ALLOC_NONE, 69176);
allocate([102,32,33,61,32,78,85,76,76,0] /* f != NULL\00 */, "i8", ALLOC_NONE, 69188);
allocate([115,116,114,108,101,110,40,114,101,116,41,32,60,61,32,40,115,105,122,101,95,116,41,108,101,110,0] /* strlen(ret) _= (size */, "i8", ALLOC_NONE, 69200);
allocate([114,101,108,97,116,105,111,110,32,61,61,32,82,69,76,50,51,52,95,76,84,32,124,124,32,114,101,108,97,116,105,111,110,32,61,61,32,82,69,76,50,51,52,95,71,84,0] /* relation == REL234_L */, "i8", ALLOC_NONE, 69228);
allocate([98,105,116,115,32,60,32,51,50,0] /* bits _ 32\00 */, "i8", ALLOC_NONE, 69276);
allocate([37,115,95,67,79,76,79,85,82,95,37,100,0] /* %s_COLOUR_%d\00 */, "i8", ALLOC_NONE, 69288);
allocate([100,45,62,111,114,100,101,114,32,62,61,32,50,0] /* d-_order _= 2\00 */, "i8", ALLOC_NONE, 69304);
allocate([37,100,110,0] /* %dn\00 */, "i8", ALLOC_NONE, 69320);
allocate([40,97,110,103,32,37,32,51,54,41,32,61,61,32,48,0] /* (ang % 36) == 0\00 */, "i8", ALLOC_NONE, 69324);
allocate([33,34,71,114,105,100,32,98,114,111,107,101,110,58,32,98,97,100,32,101,100,103,101,45,102,97,99,101,32,114,101,108,97,116,105,111,110,115,104,105,112,34,0] /* !\22Grid broken: bad */, "i8", ALLOC_NONE, 69340);
allocate([37,100,121,0] /* %dy\00 */, "i8", ALLOC_NONE, 69384);
allocate([37,115,95,84,73,76,69,83,73,90,69,0] /* %s_TILESIZE\00 */, "i8", ALLOC_NONE, 69388);
allocate([99,95,108,105,103,104,116,97,98,108,101,32,33,61,32,48,32,38,38,32,99,95,100,97,114,107,97,98,108,101,32,33,61,32,48,0] /* c_lightable != 0 &&  */, "i8", ALLOC_NONE, 69400);
allocate([103,114,105,100,46,99,0] /* grid.c\00 */, "i8", ALLOC_NONE, 69436);
allocate([109,101,45,62,100,105,114,32,33,61,32,48,0] /* me-_dir != 0\00 */, "i8", ALLOC_NONE, 69444);
allocate([103,45,62,114,101,102,99,111,117,110,116,0] /* g-_refcount\00 */, "i8", ALLOC_NONE, 69460);
allocate([102,45,62,101,100,103,101,115,91,107,50,93,32,61,61,32,78,85,76,76,0] /* f-_edges[k2] == NULL */, "i8", ALLOC_NONE, 69472);
allocate([110,32,61,61,32,116,45,62,114,111,111,116,0] /* n == t-_root\00 */, "i8", ALLOC_NONE, 69496);
allocate([109,101,45,62,100,114,97,119,105,110,103,0] /* me-_drawing\00 */, "i8", ALLOC_NONE, 69512);
allocate([102,45,62,101,100,103,101,115,91,107,93,32,61,61,32,78,85,76,76,0] /* f-_edges[k] == NULL\ */, "i8", ALLOC_NONE, 69524);
allocate([33,34,73,108,108,101,103,97,108,32,108,105,110,101,32,115,116,97,116,101,34,0] /* !\22Illegal line sta */, "i8", ALLOC_NONE, 69544);
allocate([103,97,109,101,115,46,108,111,111,112,121,0] /* games.loopy\00 */, "i8", ALLOC_NONE, 69568);
allocate([76,111,111,112,121,0] /* Loopy\00 */, "i8", ALLOC_NONE, 69580);
allocate(472, "i8", ALLOC_NONE, 69588);
allocate([118,97,108,105,100,97,116,101,95,112,97,114,97,109,115,0] /* validate_params\00 */, "i8", ALLOC_NONE, 70060);
allocate([118,95,114,111,116,97,116,101,0] /* v_rotate\00 */, "i8", ALLOC_NONE, 70076);
allocate([116,114,105,118,105,97,108,95,100,101,100,117,99,116,105,111,110,115,0] /* trivial_deductions\0 */, "i8", ALLOC_NONE, 70088);
allocate([116,114,97,110,115,50,51,52,95,115,117,98,116,114,101,101,95,109,101,114,103,101,0] /* trans234_subtree_mer */, "i8", ALLOC_NONE, 70108);
allocate([115,116,97,116,117,115,95,98,97,114,0] /* status_bar\00 */, "i8", ALLOC_NONE, 70132);
allocate([115,111,108,118,101,114,95,115,101,116,95,108,105,110,101,0] /* solver_set_line\00 */, "i8", ALLOC_NONE, 70144);
allocate([114,97,110,100,111,109,95,117,112,116,111,0] /* random_upto\00 */, "i8", ALLOC_NONE, 70160);
allocate([110,101,119,95,103,97,109,101,95,100,101,115,99,0] /* new_game_desc\00 */, "i8", ALLOC_NONE, 70172);
allocate([110,101,119,95,103,97,109,101,0] /* new_game\00 */, "i8", ALLOC_NONE, 70188);
allocate([109,105,100,101,110,100,95,115,111,108,118,101,0] /* midend_solve\00 */, "i8", ALLOC_NONE, 70200);
allocate([109,105,100,101,110,100,95,114,101,115,116,97,114,116,95,103,97,109,101,0] /* midend_restart_game\ */, "i8", ALLOC_NONE, 70216);
allocate([109,105,100,101,110,100,95,114,101,100,114,97,119,0] /* midend_redraw\00 */, "i8", ALLOC_NONE, 70236);
allocate([109,105,100,101,110,100,95,114,101,97,108,108,121,95,112,114,111,99,101,115,115,95,107,101,121,0] /* midend_really_proces */, "i8", ALLOC_NONE, 70252);
allocate([109,105,100,101,110,100,95,110,101,119,95,103,97,109,101,0] /* midend_new_game\00 */, "i8", ALLOC_NONE, 70280);
allocate([109,105,100,101,110,100,95,102,101,116,99,104,95,112,114,101,115,101,116,0] /* midend_fetch_preset\ */, "i8", ALLOC_NONE, 70296);
allocate([109,101,114,103,101,95,108,105,110,101,115,0] /* merge_lines\00 */, "i8", ALLOC_NONE, 70316);
allocate([108,111,111,112,95,100,101,100,117,99,116,105,111,110,115,0] /* loop_deductions\00 */, "i8", ALLOC_NONE, 70328);
allocate([103,114,105,100,95,110,101,119,95,115,113,117,97,114,101,0] /* grid_new_square\00 */, "i8", ALLOC_NONE, 70344);
allocate([103,114,105,100,95,110,101,119,95,115,110,117,98,115,113,117,97,114,101,0] /* grid_new_snubsquare\ */, "i8", ALLOC_NONE, 70360);
allocate([103,114,105,100,95,110,101,119,95,112,101,110,114,111,115,101,0] /* grid_new_penrose\00 */, "i8", ALLOC_NONE, 70380);
allocate([103,114,105,100,95,110,101,119,95,111,99,116,97,103,111,110,97,108,0] /* grid_new_octagonal\0 */, "i8", ALLOC_NONE, 70400);
allocate([103,114,105,100,95,110,101,119,95,107,105,116,101,115,0] /* grid_new_kites\00 */, "i8", ALLOC_NONE, 70420);
allocate([103,114,105,100,95,110,101,119,95,104,111,110,101,121,99,111,109,98,0] /* grid_new_honeycomb\0 */, "i8", ALLOC_NONE, 70436);
allocate([103,114,105,100,95,110,101,119,95,103,114,101,97,116,104,101,120,97,103,111,110,97,108,0] /* grid_new_greathexago */, "i8", ALLOC_NONE, 70456);
allocate([103,114,105,100,95,110,101,119,95,103,114,101,97,116,100,111,100,101,99,97,103,111,110,97,108,0] /* grid_new_greatdodeca */, "i8", ALLOC_NONE, 70480);
allocate([103,114,105,100,95,110,101,119,95,102,108,111,114,101,116,0] /* grid_new_floret\00 */, "i8", ALLOC_NONE, 70508);
allocate([103,114,105,100,95,110,101,119,95,100,111,100,101,99,97,103,111,110,97,108,0] /* grid_new_dodecagonal */, "i8", ALLOC_NONE, 70524);
allocate([103,114,105,100,95,110,101,119,95,99,97,105,114,111,0] /* grid_new_cairo\00 */, "i8", ALLOC_NONE, 70548);
allocate([103,114,105,100,95,110,101,119,0] /* grid_new\00 */, "i8", ALLOC_NONE, 70564);
allocate([103,114,105,100,95,109,97,107,101,95,99,111,110,115,105,115,116,101,110,116,0] /* grid_make_consistent */, "i8", ALLOC_NONE, 70576);
allocate([103,114,105,100,95,102,114,101,101,0] /* grid_free\00 */, "i8", ALLOC_NONE, 70600);
allocate([103,114,105,100,95,102,105,110,100,95,105,110,99,101,110,116,114,101,0] /* grid_find_incentre\0 */, "i8", ALLOC_NONE, 70612);
allocate([103,101,110,101,114,97,116,101,95,108,111,111,112,0] /* generate_loop\00 */, "i8", ALLOC_NONE, 70632);
allocate([103,97,109,101,95,116,101,120,116,95,102,111,114,109,97,116,0] /* game_text_format\00 */, "i8", ALLOC_NONE, 70648);
allocate([103,97,109,101,95,104,97,115,95,117,110,105,113,117,101,95,115,111,108,110,0] /* game_has_unique_soln */, "i8", ALLOC_NONE, 70668);
allocate([102,105,110,100,114,101,108,112,111,115,50,51,52,0] /* findrelpos234\00 */, "i8", ALLOC_NONE, 70692);
allocate([102,97,99,101,95,115,101,116,97,108,108,0] /* face_setall\00 */, "i8", ALLOC_NONE, 70708);
allocate([101,110,99,111,100,101,95,115,111,108,118,101,95,109,111,118,101,0] /* encode_solve_move\00 */, "i8", ALLOC_NONE, 70720);
allocate([101,100,115,102,95,109,101,114,103,101,0] /* edsf_merge\00 */, "i8", ALLOC_NONE, 70740);
allocate([101,100,115,102,95,99,97,110,111,110,105,102,121,0] /* edsf_canonify\00 */, "i8", ALLOC_NONE, 70752);
allocate([100,111,116,95,115,101,116,97,108,108,0] /* dot_setall\00 */, "i8", ALLOC_NONE, 70768);
allocate([100,108,105,110,101,95,100,101,100,117,99,116,105,111,110,115,0] /* dline_deductions\00 */, "i8", ALLOC_NONE, 70780);
allocate([100,101,108,112,111,115,50,51,52,95,105,110,116,101,114,110,97,108,0] /* delpos234_internal\0 */, "i8", ALLOC_NONE, 70800);
allocate([99,97,110,95,99,111,108,111,117,114,95,102,97,99,101,0] /* can_colour_face\00 */, "i8", ALLOC_NONE, 70820);
allocate([97,100,100,95,102,117,108,108,95,99,108,117,101,115,0] /* add_full_clues\00 */, "i8", ALLOC_NONE, 70836);
HEAP32[((65536)>>2)]=((69580)|0);
HEAP32[((65540)>>2)]=((69568)|0);
HEAP32[((65544)>>2)]=((68740)|0);
HEAP32[((66016)>>2)]=((67144)|0);
HEAP32[((66020)>>2)]=((67132)|0);
HEAP32[((66024)>>2)]=((67120)|0);
HEAP32[((66028)>>2)]=((67108)|0);
HEAP32[((66032)>>2)]=((67080)|0);
HEAP32[((66036)>>2)]=((67064)|0);
HEAP32[((66040)>>2)]=((66988)|0);
HEAP32[((66044)>>2)]=((66980)|0);
HEAP32[((66048)>>2)]=((66936)|0);
HEAP32[((66052)>>2)]=((66924)|0);
HEAP32[((66056)>>2)]=((66904)|0);
HEAP32[((66060)>>2)]=((66884)|0);
HEAP32[((66064)>>2)]=((66864)|0);
HEAP32[((66180)>>2)]=((67964)|0);
HEAP32[((66184)>>2)]=((67892)|0);
HEAP32[((66196)>>2)]=((67964)|0);
HEAP32[((66200)>>2)]=((67892)|0);
HEAP32[((66212)>>2)]=((67964)|0);
HEAP32[((66216)>>2)]=((67892)|0);
HEAP32[((66228)>>2)]=((67964)|0);
HEAP32[((66232)>>2)]=((67892)|0);
HEAP32[((66244)>>2)]=((67964)|0);
HEAP32[((66248)>>2)]=((67820)|0);
HEAP32[((66260)>>2)]=((67964)|0);
HEAP32[((66264)>>2)]=((67892)|0);
HEAP32[((66276)>>2)]=((67964)|0);
HEAP32[((66280)>>2)]=((67892)|0);
HEAP32[((66292)>>2)]=((67964)|0);
HEAP32[((66296)>>2)]=((67892)|0);
HEAP32[((66308)>>2)]=((67728)|0);
HEAP32[((66312)>>2)]=((67656)|0);
HEAP32[((66324)>>2)]=((67520)|0);
HEAP32[((66328)>>2)]=((67656)|0);
HEAP32[((66340)>>2)]=((67520)|0);
HEAP32[((66344)>>2)]=((67656)|0);
HEAP32[((66356)>>2)]=((67964)|0);
HEAP32[((66360)>>2)]=((67892)|0);
HEAP32[((66372)>>2)]=((67964)|0);
HEAP32[((66376)>>2)]=((67892)|0);
HEAP32[((66436)>>2)]=((67176)|0);
HEAP32[((66440)>>2)]=((67168)|0);
HEAP32[((66444)>>2)]=((67160)|0);
HEAP32[((66448)>>2)]=((67152)|0);
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
  function _strspn(pstr, pset) {
      var str = pstr, set, strcurr, setcurr;
      while (1) {
        strcurr = HEAP8[(str)];
        if (!strcurr) return str - pstr;
        set = pset;
        while (1) {
          setcurr = HEAP8[(set)];
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
        if (HEAP8[(ptr)] == chr) return ptr;
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
  function _strchr(ptr, chr) {
      ptr--;
      do {
        ptr++;
        var val = HEAP8[(ptr)];
        if (val == chr) return ptr;
      } while (val);
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
  var _floor=Math.floor;
  var _ceil=Math.ceil;
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
var FUNCTION_TABLE = [0,0,_free_game,0,_grid_size_cairo,0,_game_free_drawstate,0,_canvas_draw_line,0,_solve_game
,0,_grid_size_penrose_p3_thick,0,_grid_size_kites,0,_grid_edge_bydots_cmpfn,0,_grid_size_snubsquare,0,_grid_new_penrose_p3_thick
,0,_grid_new_octagonal,0,_dup_game,0,_set_faces,0,_game_changed_state,0,_grid_size_triangular
,0,_grid_size_dodecagonal,0,_grid_size_square,0,_grid_new_cairo,0,_canvas_draw_update,0,_canvas_draw_circle
,0,_grid_point_cmp_fn,0,_game_anim_length,0,_canvas_status_bar,0,_grid_new_floret,0,_game_set_size
,0,_grid_size_greatdodecagonal,0,_grid_new_honeycomb,0,_validate_params,0,_game_print,0,_grid_size_penrose_p2_kite
,0,_canvas_draw_rect,0,_encode_ui,0,_grid_size_octagonal,0,_canvas_unclip,0,_grid_new_square
,0,_white_sort_cmpfn,0,_canvas_draw_thick_line,0,_black_sort_cmpfn,0,_decode_params,0,_custom_params
,0,_decode_ui,0,_free_params,0,_game_compute_size,0,_grid_new_penrose_p2_kite,0,_grid_size_honeycomb
,0,_game_new_drawstate,0,_canvas_clip,0,_game_redraw,0,_default_params,0,_canvas_text_fallback
,0,_grid_new_kites,0,_grid_new_triangular,0,_new_ui,0,_free_ui,0,_grid_new_greatdodecagonal
,0,_game_configure,0,_game_fetch_preset,0,_canvas_blitter_new,0,_game_status,0,_encode_params
,0,_dup_params,0,_grid_new_dodecagonal,0,_game_timing_state,0,_canvas_blitter_load,0,_game_text_format
,0,_grid_new_greathexagonal,0,_canvas_blitter_free,0,_game_colours,0,_game_flash_length,0,_canvas_end_draw
,0,_game_can_format_as_text_now,0,_grid_size_floret,0,_canvas_blitter_save,0,_canvas_start_draw,0,_canvas_draw_text
,0,_game_print_size,0,_grid_new_snubsquare,0,_interpret_move,0,_new_game_desc,0,_validate_desc,0,_canvas_draw_poly,0,_new_game,0,_grid_size_greathexagonal,0,_execute_move,0];
// EMSCRIPTEN_START_FUNCS
function _decode_params(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r3=0;r4=_atoi(r2);HEAP32[r1>>2]=r4;r5=r1+4|0;HEAP32[r5>>2]=r4;r4=(r1+8|0)>>2;HEAP32[r4]=0;r6=r2;while(1){r7=HEAP8[r6];if(r7<<24>>24==0){r3=22;break}r8=r6+1|0;if(((r7&255)-48|0)>>>0<10){r6=r8}else{break}}if(r3==22){return}L7:do{if(r7<<24>>24==120){r3=_atoi(r8);HEAP32[r5>>2]=r3;r3=r8;while(1){r2=HEAP8[r3];if(r2<<24>>24==0){break}if(((r2&255)-48|0)>>>0<10){r3=r3+1|0}else{r9=r3;r10=r2;break L7}}return}else{r9=r6;r10=r7}}while(0);L14:do{if(r10<<24>>24==116){r7=r9+1|0;r6=_atoi(r7);HEAP32[r1+12>>2]=r6;r6=r7;while(1){r7=HEAP8[r6];if(r7<<24>>24==0){break}if(((r7&255)-48|0)>>>0<10){r6=r6+1|0}else{r11=r6;r12=r7;break L14}}return}else{r11=r9;r12=r10}}while(0);if(r12<<24>>24!=100){return}r12=r11+1|0;r11=HEAP8[r12];if(r11<<24>>24==101){HEAP32[r4]=0;r13=HEAP8[r12]}else{r13=r11}if(r13<<24>>24==110){HEAP32[r4]=1;r14=HEAP8[r12]}else{r14=r13}if(r14<<24>>24==116){HEAP32[r4]=2;r15=HEAP8[r12]}else{r15=r14}if(r15<<24>>24!=104){return}HEAP32[r4]=3;return}function _free_params(r1){if((r1|0)==0){return}_free(r1);return}function _validate_params(r1,r2){var r3,r4,r5,r6,r7;r2=HEAP32[r1+12>>2];if((r2|0)<0|r2>>>0>12){r3=68060;return r3}r4=HEAP32[r1>>2];r5=HEAP32[(r2<<4)+66172>>2];do{if((r4|0)>=(r5|0)){r6=HEAP32[r1+4>>2];if((r6|0)<(r5|0)){break}r7=HEAP32[(r2<<4)+66176>>2];if((r4|0)<(r7|0)&(r6|0)<(r7|0)){r3=HEAP32[(r2<<4)+66184>>2];return r3}if((HEAP32[r1+8>>2]|0)<4){r3=0;return r3}___assert_func(66812,651,70060,68024);r3=0;return r3}}while(0);r3=HEAP32[(r2<<4)+66180>>2];return r3}function _default_params(){var r1,r2,r3;r1=STACKTOP;r2=_malloc(16),r3=r2>>2;if((r2|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r3+1]=10;HEAP32[r3]=10;HEAP32[r3+2]=0;HEAP32[r3+3]=0;STACKTOP=r1;return r2}}function _game_fetch_preset(r1,r2,r3){var r4,r5,r6,r7,r8;r4=STACKTOP;STACKTOP=STACKTOP+80|0;if((r1|0)<0|r1>>>0>14){r5=0;STACKTOP=r4;return r5}r6=_malloc(16),r7=r6>>2;if((r6|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r8=((r1<<4)+65728|0)>>2;HEAP32[r7]=HEAP32[r8];HEAP32[r7+1]=HEAP32[r8+1];HEAP32[r7+2]=HEAP32[r8+2];HEAP32[r7+3]=HEAP32[r8+3];HEAP32[r3>>2]=r6;r6=r4|0;r3=HEAP32[r7];r8=HEAP32[(HEAP32[r7+3]<<2)+66016>>2];r1=HEAP32[(HEAP32[r7+2]<<2)+66436>>2];_sprintf(r6,67240,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r7+1],HEAP32[tempInt+4>>2]=r3,HEAP32[tempInt+8>>2]=r8,HEAP32[tempInt+12>>2]=r1,tempInt));r1=_malloc(_strlen(r6)+1|0);if((r1|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r1,r6);HEAP32[r2>>2]=r1;r5=1;STACKTOP=r4;return r5}function _encode_params(r1,r2){var r3,r4,r5,r6,r7;r3=STACKTOP;STACKTOP=STACKTOP+80|0;r4=r3;r5=r4|0;r6=HEAP32[r1+4>>2];r7=HEAP32[r1+12>>2];_sprintf(r5,67284,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=HEAP32[r1>>2],HEAP32[tempInt+4>>2]=r6,HEAP32[tempInt+8>>2]=r7,tempInt));if((r2|0)!=0){_sprintf(r4+_strlen(r5)|0,67256,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[HEAP32[r1+8>>2]+66452|0]<<24>>24,tempInt))}r1=_malloc(_strlen(r5)+1|0);if((r1|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r1,r5);STACKTOP=r3;return r1}}function _dup_params(r1){var r2,r3,r4,r5;r2=STACKTOP;r3=_malloc(16),r4=r3>>2;if((r3|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r5=r1>>2;HEAP32[r4]=HEAP32[r5];HEAP32[r4+1]=HEAP32[r5+1];HEAP32[r4+2]=HEAP32[r5+2];HEAP32[r4+3]=HEAP32[r5+3];STACKTOP=r2;return r3}}function _game_configure(r1){var r2,r3,r4,r5,r6;r2=STACKTOP;STACKTOP=STACKTOP+80|0;r3=_malloc(80),r4=r3>>2;if((r3|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4]=67512;HEAP32[r4+1]=0;r5=r2|0;_sprintf(r5,68564,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r1>>2],tempInt));r6=_malloc(_strlen(r5)+1|0);if((r6|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r6,r5);HEAP32[r4+2]=r6;HEAP32[r4+3]=0;HEAP32[r4+4]=67504;HEAP32[r4+5]=0;_sprintf(r5,68564,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r1+4>>2],tempInt));r6=_malloc(_strlen(r5)+1|0);if((r6|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r6,r5);HEAP32[r4+6]=r6;HEAP32[r4+7]=0;HEAP32[r4+8]=67492;HEAP32[r4+9]=1;HEAP32[r4+10]=67336;HEAP32[r4+11]=HEAP32[r1+12>>2];HEAP32[r4+12]=67324;HEAP32[r4+13]=1;HEAP32[r4+14]=67296;HEAP32[r4+15]=HEAP32[r1+8>>2];HEAP32[r4+16]=0;HEAP32[r4+17]=3;HEAP32[r4+18]=0;HEAP32[r4+19]=0;STACKTOP=r2;return r3}}function _custom_params(r1){var r2,r3,r4,r5;r2=STACKTOP;r3=_malloc(16),r4=r3>>2;if((r3|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r5=_atoi(HEAP32[r1+8>>2]);HEAP32[r4]=r5;r5=_atoi(HEAP32[r1+24>>2]);HEAP32[r4+1]=r5;HEAP32[r4+3]=HEAP32[r1+44>>2];HEAP32[r4+2]=HEAP32[r1+60>>2];STACKTOP=r2;return r3}}function _new_game_desc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43;r4=0;r3=STACKTOP;r5=_malloc(28),r6=r5>>2;if((r5|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r7=(r1+12|0)>>2;r8=r1|0;r9=r1+4|0;r10=_grid_new_desc(HEAP32[(HEAP32[r7]<<2)+66068>>2],HEAP32[r8>>2],HEAP32[r9>>2],r2);r11=HEAP32[r8>>2];r8=HEAP32[r9>>2];r9=HEAP32[(HEAP32[r7]<<2)+66068>>2];if((_grid_validate_desc(r9,r11,r8,r10)|0)!=0){___assert_func(69436,2731,70564,67624)}r12=FUNCTION_TABLE[HEAP32[(r9<<2)+66380>>2]](r11,r8,r10);HEAP32[r6]=r12;r8=_malloc(HEAP32[r12>>2]);if((r8|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r6+1]=r8;r8=(r12+8|0)>>2;r12=_malloc(HEAP32[r8]);if((r12|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r6+2]=r12;r12=_malloc(HEAP32[r8]);if((r12|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r6+3]=r12;HEAP32[r6+6]=HEAP32[r7];r7=(r1+8|0)>>2;r6=r5;L115:while(1){r5=r6+8|0;_memset(HEAP32[r5>>2],1,HEAP32[r8]);r12=r6+12|0;_memset(HEAP32[r12>>2],0,HEAP32[r8]);HEAP32[r6+20>>2]=0;HEAP32[r6+16>>2]=0;r11=(r6|0)>>2;r9=r6+4|0;while(1){r13=HEAP32[r11];r14=HEAP32[r9>>2];r15=r13|0;r16=_malloc(HEAP32[r15>>2]);if((r16|0)==0){r4=90;break L115}_generate_loop(r13,r16,r2,0,0);_memset(r14,0,HEAP32[r15>>2]);r15=r13+8|0;L120:do{if((HEAP32[r15>>2]|0)>0){r17=r13+12|0;r18=(r13+4|0)>>2;r19=0;while(1){r20=HEAP32[r17>>2];r21=HEAP32[r20+(r19<<4)+8>>2];r22=HEAP32[r20+(r19<<4)+12>>2];r20=(r21|0)==0;if(r20){r23=2}else{r23=HEAP8[r16+((r21-HEAP32[r18]|0)/24&-1)|0]<<24>>24}r24=(r22|0)==0;if(r24){r25=2}else{r25=HEAP8[r16+((r22-HEAP32[r18]|0)/24&-1)|0]<<24>>24}if((r23|0)==1){___assert_func(66812,1301,70836,68108)}if((r25|0)==1){___assert_func(66812,1302,70836,68080)}do{if((r23|0)!=(r25|0)){if(!r20){r26=r14+((r21-HEAP32[r18]|0)/24&-1)|0;HEAP8[r26]=HEAP8[r26]+1&255}if(r24){break}r26=r14+((r22-HEAP32[r18]|0)/24&-1)|0;HEAP8[r26]=HEAP8[r26]+1&255}}while(0);r22=r19+1|0;if((r22|0)<(HEAP32[r15>>2]|0)){r19=r22}else{break L120}}}}while(0);_free(r16);r15=_new_solver_state(r6,HEAP32[r7]);r14=_solve_game_rec(r15);r13=r14+4|0;r19=HEAP32[r13>>2];if((r19|0)==1){___assert_func(66812,1320,70668,68136);r27=HEAP32[r13>>2]}else{r27=r19}_free_solver_state(r14);_free_solver_state(r15);if((r27|0)==0){break}}r15=HEAP32[r7];r14=HEAP32[HEAP32[r11]>>2];r19=_dup_game(r6);r13=_malloc(r14<<2);if((r13|0)==0){r4=111;break}r18=r13;L149:do{if((r14|0)>0){r17=0;while(1){HEAP32[r18+(r17<<2)>>2]=r17;r22=r17+1|0;if((r22|0)==(r14|0)){break}else{r17=r22}}_shuffle(r13,r14,4,r2);r17=r19,r16=r17>>2;r22=0;while(1){r24=_dup_game(r17),r21=r24>>2;r20=r17+4|0;HEAP8[HEAP32[r20>>2]+HEAP32[r18+(r22<<2)>>2]|0]=-1;r26=_new_solver_state(r17,r15);r28=_solve_game_rec(r26);r29=r28+4|0;r30=HEAP32[r29>>2];if((r30|0)==1){___assert_func(66812,1320,70668,68136);r31=HEAP32[r29>>2]}else{r31=r30}_free_solver_state(r28);_free_solver_state(r26);do{if((r31|0)==0){if((r24|0)==0){r32=r17;break}_grid_free(HEAP32[r21]);r26=HEAP32[r21+1];if((r26|0)!=0){_free(r26)}r26=HEAP32[r21+2];if((r26|0)!=0){_free(r26)}r26=HEAP32[r21+3];if((r26|0)!=0){_free(r26)}_free(r24);r32=r17}else{if((r17|0)==0){r32=r24;break}_grid_free(HEAP32[r16]);r26=HEAP32[r20>>2];if((r26|0)!=0){_free(r26)}r26=HEAP32[r16+2];if((r26|0)!=0){_free(r26)}r26=HEAP32[r16+3];if((r26|0)!=0){_free(r26)}_free(r17);r32=r24}}while(0);r24=r22+1|0;if((r24|0)==(r14|0)){r33=r32,r34=r33>>2;break L149}else{r17=r32,r16=r17>>2;r22=r24}}}else{_shuffle(r13,r14,4,r2);r33=r19,r34=r33>>2}}while(0);_free(r13);if((r6|0)!=0){_grid_free(HEAP32[r11]);r19=HEAP32[r9>>2];if((r19|0)!=0){_free(r19)}r19=HEAP32[r5>>2];if((r19|0)!=0){_free(r19)}r19=HEAP32[r12>>2];if((r19|0)!=0){_free(r19)}_free(r6)}r19=HEAP32[r7];if((r19|0)<=0){r4=148;break}r14=_new_solver_state(r33,r19-1|0);r19=_solve_game_rec(r14);r15=r19+4|0;r18=HEAP32[r15>>2];if((r18|0)==1){___assert_func(66812,1320,70668,68136);r35=HEAP32[r15>>2]}else{r35=r18}_free_solver_state(r19);_free_solver_state(r14);if((r35|0)==0){r6=r33}else{r4=148;break}}if(r4==90){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==111){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==148){r4=r33|0;r6=HEAP32[HEAP32[r4>>2]>>2];r35=_malloc(r6+1|0);if((r35|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}do{if((r6|0)>0){r7=r33+4|0;r2=r35;r32=0;r31=0;while(1){r27=HEAP8[HEAP32[r7>>2]+r31|0];if(r27<<24>>24<0){if((r32|0)>25){HEAP8[r2]=r32+96&255;r25=r2+1|0;HEAP8[r25]=0;r36=0;r37=r25}else{r36=r32;r37=r2}r38=r36+1|0;r39=r37}else{if((r32|0)==0){r40=r2;r41=r27}else{HEAP8[r2]=r32+96&255;r27=r2+1|0;HEAP8[r27]=0;r40=r27;r41=HEAP8[HEAP32[r7>>2]+r31|0]}do{if(r41<<24>>24<0){r42=32}else{if(r41<<24>>24<10){r42=r41+48&255;break}else{r42=r41+55&255;break}}}while(0);HEAP8[r40]=r42;r27=r40+1|0;HEAP8[r27]=0;r38=0;r39=r27}r27=r31+1|0;if((r27|0)==(r6|0)){break}else{r2=r39;r32=r38;r31=r27}}if((r38|0)==0){break}HEAP8[r39]=r38+96&255;HEAP8[r39+1|0]=0}}while(0);r39=_malloc(_strlen(r35)+1|0);if((r39|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r39,r35);_free(r35);if((r33|0)!=0){_grid_free(HEAP32[r4>>2]);r4=HEAP32[r34+1];if((r4|0)!=0){_free(r4)}r4=HEAP32[r34+2];if((r4|0)!=0){_free(r4)}r4=HEAP32[r34+3];if((r4|0)!=0){_free(r4)}_free(r33)}do{if((r10|0)==0){r43=r39}else{r33=_malloc(_strlen(r10)+_strlen(r39)+2|0);if((r33|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_sprintf(r33,68548,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r10,HEAP32[tempInt+4>>2]=95,HEAP32[tempInt+8>>2]=r39,tempInt));_free(r10);_free(r39);r43=r33;break}}}while(0);if((_validate_desc(r1,r43)|0)==0){STACKTOP=r3;return r43}___assert_func(66812,1424,70172,68320);STACKTOP=r3;return r43}}function _validate_desc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r3=STACKTOP;r4=_strchr(r2,95);do{if((r4|0)==0){r5=0;r6=r2}else{r7=r4-r2|0;r8=_malloc(r7+1|0);if((r8|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_memcpy(r8,r2,r7);HEAP8[r8+r7|0]=0;r5=r8;r6=r4+1|0;break}}}while(0);r4=r1+12|0;r2=r1|0;r8=r1+4|0;r1=_grid_validate_desc(HEAP32[(HEAP32[r4>>2]<<2)+66068>>2],HEAP32[r2>>2],HEAP32[r8>>2],r5);if((r1|0)!=0){r9=r1;STACKTOP=r3;return r9}r1=HEAP32[r2>>2];r2=HEAP32[r8>>2];r8=HEAP32[(HEAP32[r4>>2]<<2)+66068>>2];if((_grid_validate_desc(r8,r1,r2,r5)|0)!=0){___assert_func(69436,2731,70564,67624)}r4=FUNCTION_TABLE[HEAP32[(r8<<2)+66380>>2]](r1,r2,r5);if((r5|0)!=0){_free(r5)}r5=HEAP8[r6];L271:do{if(r5<<24>>24==0){r10=0}else{r2=r6;r1=0;r8=r5;while(1){if((r8-48&255)<10|(r8-65&255)<26){r11=r1+1|0}else{if(r8<<24>>24<=96){r9=68512;break}r11=(r8<<24>>24)+(r1-96)|0}r7=r2+1|0;r12=HEAP8[r7];if(r12<<24>>24==0){r10=r11;break L271}else{r2=r7;r1=r11;r8=r12}}STACKTOP=r3;return r9}}while(0);r11=HEAP32[r4>>2];if((r10|0)<(r11|0)){r9=68460;STACKTOP=r3;return r9}if((r10|0)>(r11|0)){r9=68416;STACKTOP=r3;return r9}_grid_free(r4);r9=0;STACKTOP=r3;return r9}function _new_game(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r1=STACKTOP;r4=_malloc(28),r5=r4>>2;if((r4|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r6=r4;r7=_strchr(r3,95);do{if((r7|0)==0){r8=0;r9=r3}else{r10=r7-r3|0;r11=_malloc(r10+1|0);if((r11|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_memcpy(r11,r3,r10);HEAP8[r11+r10|0]=0;r8=r11;r9=r7+1|0;break}}}while(0);r7=HEAP32[r2>>2];r3=HEAP32[r2+4>>2];r11=r2+12|0;r2=HEAP32[(HEAP32[r11>>2]<<2)+66068>>2];if((_grid_validate_desc(r2,r7,r3,r8)|0)!=0){___assert_func(69436,2731,70564,67624)}r10=FUNCTION_TABLE[HEAP32[(r2<<2)+66380>>2]](r7,r3,r8);HEAP32[r5]=r10;if((r8|0)!=0){_free(r8)}r8=HEAP32[r10>>2];r3=HEAP32[r10+8>>2];r10=_malloc(r8);if((r10|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r7=(r4+4|0)>>2;HEAP32[r7]=r10;r10=_malloc(r3);if((r10|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r2=(r4+8|0)>>2;HEAP32[r2]=r10;r10=_malloc(r3);if((r10|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r12=(r4+12|0)>>2;HEAP32[r12]=r10;HEAP32[r5+5]=0;HEAP32[r5+4]=0;HEAP32[r5+6]=HEAP32[r11>>2];if((r8|0)>0){r13=r9;r14=0;r15=0}else{r16=HEAP32[r2];_memset(r16,1,r3);r17=HEAP32[r12];_memset(r17,0,r3);STACKTOP=r1;return r6}while(1){if((r14|0)==0){r9=HEAP8[r13];if(r9<<24>>24==0){___assert_func(66812,1464,70188,68568);r18=HEAP8[r13]}else{r18=r9}r9=r18<<24>>24;r11=r9-48|0;r5=r18-55&255;do{if(r11>>>0<10){HEAP8[HEAP32[r7]+r15|0]=r11&255;r19=0}else{if((r9-65|0)>>>0<26){HEAP8[HEAP32[r7]+r15|0]=r5;r19=0;break}if((r9-96|0)<=0){___assert_func(66812,1473,70188,68556)}HEAP8[HEAP32[r7]+r15|0]=-1;r19=r9-97|0}}while(0);r20=r19;r21=r13+1|0}else{HEAP8[HEAP32[r7]+r15|0]=-1;r20=r14-1|0;r21=r13}r9=r15+1|0;if((r9|0)==(r8|0)){break}else{r13=r21;r14=r20;r15=r9}}r16=HEAP32[r2];_memset(r16,1,r3);r17=HEAP32[r12];_memset(r17,0,r3);STACKTOP=r1;return r6}function _new_ui(r1){return 0}function _free_ui(r1){return}function _encode_ui(r1){return 0}function _decode_ui(r1,r2){return}function _game_changed_state(r1,r2,r3){return}function _game_can_format_as_text_now(r1){return(HEAP32[r1+12>>2]|0)==0&1}function _free_game(r1){var r2;if((r1|0)==0){return}_grid_free(HEAP32[r1>>2]);r2=HEAP32[r1+4>>2];if((r2|0)!=0){_free(r2)}r2=HEAP32[r1+8>>2];if((r2|0)!=0){_free(r2)}r2=HEAP32[r1+12>>2];if((r2|0)!=0){_free(r2)}_free(r1);return}function _dup_game(r1){var r2,r3,r4,r5,r6,r7;r2=r1>>2;r3=STACKTOP;r4=_malloc(28),r5=r4>>2;if((r4|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r6=(r1|0)>>2;r1=HEAP32[r6];HEAP32[r5]=r1;r7=r1+44|0;HEAP32[r7>>2]=HEAP32[r7>>2]+1|0;HEAP32[r5+4]=HEAP32[r2+4];HEAP32[r5+5]=HEAP32[r2+5];r7=_malloc(HEAP32[HEAP32[r6]>>2]);if((r7|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r5+1]=r7;_memcpy(r7,HEAP32[r2+1],HEAP32[HEAP32[r6]>>2]);r7=_malloc(HEAP32[HEAP32[r6]+8>>2]);if((r7|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r5+2]=r7;_memcpy(r7,HEAP32[r2+2],HEAP32[HEAP32[r6]+8>>2]);r7=_malloc(HEAP32[HEAP32[r6]+8>>2]);if((r7|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r5+3]=r7;_memcpy(r7,HEAP32[r2+3],HEAP32[HEAP32[r6]+8>>2]);HEAP32[r5+6]=HEAP32[r2+6];STACKTOP=r3;return r4}}function _solve_game(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12;r4=STACKTOP;r3=_new_solver_state(r1,4);r1=_solve_game_rec(r3);r2=HEAP32[r1>>2];r5=HEAP32[HEAP32[r2>>2]+8>>2];L369:do{if((r5|0)>1){r6=1;r7=1;while(1){r8=r5-r7|0;r9=((r8|0)>0?r8:0)+r6|0;r8=r7*10&-1;if((r8|0)<(r5|0)){r6=r9;r7=r8}else{r10=r9;break L369}}}else{r10=1}}while(0);r7=r10+(r5+1)|0;r10=_malloc(r7+1|0);if((r10|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r6=r10;tempBigInt=83;HEAP8[r6]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r6+1|0]=tempBigInt&255;L376:do{if((r5|0)>0){r6=r2+8|0;r9=r10+1|0;r8=0;while(1){r11=HEAP8[HEAP32[r6>>2]+r8|0]<<24>>24;if((r11|0)==0){r12=r9+_sprintf(r9,69384,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r8,tempInt))|0}else if((r11|0)==2){r12=r9+_sprintf(r9,69320,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r8,tempInt))|0}else{r12=r9}r11=r8+1|0;if((r11|0)==(r5|0)){break L376}else{r9=r12;r8=r11}}}}while(0);if(_strlen(r10)>>>0<=r7>>>0){_free_solver_state(r1);_free_solver_state(r3);STACKTOP=r4;return r10}___assert_func(66812,801,70720,69200);_free_solver_state(r1);_free_solver_state(r3);STACKTOP=r4;return r10}function _game_text_format(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r2=STACKTOP;r3=HEAP32[r1>>2];if((HEAP32[r1+24>>2]|0)!=0){___assert_func(66812,956,70648,66720)}r4=r3+4|0;r5=HEAP32[r4>>2];if((HEAP32[r5>>2]|0)!=4){___assert_func(66812,960,70648,66604)}r6=HEAP32[r5+8>>2];r5=HEAP32[HEAP32[r6>>2]+12>>2]-HEAP32[HEAP32[r6+8>>2]+12>>2]|0;r6=(r5|0)>-1?r5:-r5|0;r5=(r3+24|0)>>2;r7=(HEAP32[r3+32>>2]-HEAP32[r5]|0)/(r6|0)&-1;r8=(r3+28|0)>>2;r9=(HEAP32[r3+36>>2]-HEAP32[r8]|0)/(r6|0)&-1;r10=r7<<1;r11=r10+2|0;r12=r9<<1|1;r13=Math.imul(r12,r11);r14=_malloc(r13|1);if((r14|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}L399:do{if((r12|0)>0){r15=r10|1;r16=(r15|0)>0;r17=r7<<1;r18=r17|1;r19=r17+2|0;r17=r9<<1|1;r20=0;while(1){r21=Math.imul(r20,r11);if(r16){_memset(r14+Math.imul(r19,r20)|0,32,r18)}HEAP8[r14+r15+r21|0]=10;r21=r20+1|0;if((r21|0)==(r17|0)){break L399}else{r20=r21}}}}while(0);HEAP8[r14+r13|0]=0;r13=r3+8|0;L407:do{if((HEAP32[r13>>2]|0)>0){r9=r3+12|0;r7=r1+8|0;r10=0;while(1){r12=HEAP32[r9>>2];r20=HEAP32[r12+(r10<<4)>>2];r17=HEAP32[r5];r15=HEAP32[r12+(r10<<4)+4>>2];r12=HEAP32[r8];r18=(HEAP32[r20+16>>2]-r12|0)/(r6|0)&-1;r19=(HEAP32[r15+16>>2]-r12|0)/(r6|0)&-1;r12=((HEAP32[r15+12>>2]-r17|0)/(r6|0)&-1)+((HEAP32[r20+12>>2]-r17|0)/(r6|0)&-1)|0;r17=r19+r18|0;r20=HEAP8[HEAP32[r7>>2]+r10|0]<<24>>24;if((r20|0)==0){r15=r14+Math.imul(r17,r11)+r12|0;HEAP8[r15]=(r18|0)==(r19|0)?45:124}else if((r20|0)==2){r19=r14+Math.imul(r17,r11)+r12|0;HEAP8[r19]=120}else if((r20|0)!=1){___assert_func(66812,1002,70648,69544)}r20=r10+1|0;if((r20|0)<(HEAP32[r13>>2]|0)){r10=r20}else{break L407}}}}while(0);r13=r3|0;if((HEAP32[r13>>2]|0)<=0){STACKTOP=r2;return r14}r3=r1+4|0;r1=0;while(1){r10=HEAP32[r4>>2];if((HEAP32[r10+(r1*24&-1)>>2]|0)!=4){___assert_func(66812,1011,70648,66604)}r7=HEAP32[r10+(r1*24&-1)+8>>2];r10=HEAP32[r7>>2];r9=HEAP32[r5];r20=HEAP32[r7+8>>2];r7=HEAP32[r8];r19=((HEAP32[r20+12>>2]-r9|0)/(r6|0)&-1)+((HEAP32[r10+12>>2]-r9|0)/(r6|0)&-1)|0;r9=((HEAP32[r20+16>>2]-r7|0)/(r6|0)&-1)+((HEAP32[r10+16>>2]-r7|0)/(r6|0)&-1)|0;r7=HEAP8[HEAP32[r3>>2]+r1|0];do{if(r7<<24>>24<0){r22=32}else{if(r7<<24>>24<10){r22=r7+48&255;break}else{r22=r7+55&255;break}}}while(0);r7=r14+r19+Math.imul(r9,r11)|0;HEAP8[r7]=r22;r7=r1+1|0;if((r7|0)<(HEAP32[r13>>2]|0)){r1=r7}else{break}}STACKTOP=r2;return r14}function _interpret_move(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14;r2=STACKTOP;STACKTOP=STACKTOP+80|0;r7=r2;r8=HEAP32[r1>>2],r9=r8>>2;r10=HEAP32[r3+4>>2];r3=(r10|0)/2&-1;r11=HEAP32[r9+10];r12=(Math.imul(r4-r3|0,r11)|0)/(r10|0)&-1;r4=(Math.imul(r5-r3|0,r11)|0)/(r10|0)&-1;r10=_grid_nearest_edge(r8,HEAP32[r9+6]+r12|0,HEAP32[r9+7]+r4|0);if((r10|0)==0){r13=0;STACKTOP=r2;return r13}r4=r6&-28673;r6=r10-HEAP32[r9+3]>>4;r9=HEAP8[HEAP32[r1+8>>2]+r6|0]<<24>>24;do{if((r4|0)==512){if((r9|0)==1){r14=121;break}else if((r9|0)==0){r14=110;break}else if((r9|0)==2){r14=117;break}else{r14=32;break}}else if((r4|0)==514){if((r9|0)==1){r14=110;break}else if((r9|0)==2){r14=121;break}else if((r9|0)==0){r14=117;break}else{r14=32;break}}else if((r4|0)==513){r14=117}else{r13=0;STACKTOP=r2;return r13}}while(0);r4=r7|0;_sprintf(r4,67088,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r6,HEAP32[tempInt+4>>2]=r14,tempInt));r14=_malloc(_strlen(r4)+1|0);if((r14|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r14,r4);r13=r14;STACKTOP=r2;return r13}function _game_set_size(r1,r2,r3,r4){HEAP32[r2+4>>2]=r4;return}function _game_compute_size(r1,r2,r3,r4){var r5,r6,r7,r8;r5=STACKTOP;STACKTOP=STACKTOP+12|0;r6=r5;r7=r5+4;r8=r5+8;FUNCTION_TABLE[HEAP32[(HEAP32[(HEAP32[r1+12>>2]<<2)+66068>>2]<<2)+66120>>2]](HEAP32[r1>>2],HEAP32[r1+4>>2],r8,r6,r7);r1=Math.imul(HEAP32[r6>>2],r2);r6=HEAP32[r8>>2];r8=(Math.imul(HEAP32[r7>>2],r2)|0)/(r6|0)&-1;r7=((r2|0)/2&-1)<<1;HEAP32[r3>>2]=((r1|0)/(r6|0)&-1)+r7+1|0;HEAP32[r4>>2]=r7+(r8+1)|0;STACKTOP=r5;return}function _game_free_drawstate(r1,r2){var r3;r1=r2>>2;r3=HEAP32[r1+3];if((r3|0)!=0){_free(r3)}r3=HEAP32[r1+4];if((r3|0)!=0){_free(r3)}r3=HEAP32[r1+6];if((r3|0)!=0){_free(r3)}r3=HEAP32[r1+7];if((r3|0)!=0){_free(r3)}r3=HEAP32[r1+5];if((r3|0)!=0){_free(r3)}if((r2|0)==0){return}_free(r2);return}function _execute_move(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61;r3=STACKTOP;r4=_dup_game(r1),r1=r4>>2;r5=HEAP8[r2];if(r5<<24>>24==83){r6=r2+1|0;HEAP32[r1+5]=1;r7=r6;r8=HEAP8[r6]}else{r7=r2;r8=r5}r5=(r4|0)>>2;L479:do{if(r8<<24>>24!=0){r2=(r4+8|0)>>2;r6=r7;while(1){r9=_atoi(r6);if((r9|0)<0){break}if((r9|0)>=(HEAP32[HEAP32[r5]+8>>2]|0)){break}r10=_strspn(r6,67260);r11=r10+(r6+1)|0;r12=HEAP8[r6+r10|0]<<24>>24;if((r12|0)==121){HEAP8[HEAP32[r2]+r9|0]=0}else if((r12|0)==110){HEAP8[HEAP32[r2]+r9|0]=2}else if((r12|0)==117){HEAP8[HEAP32[r2]+r9|0]=1}else{break}if(HEAP8[r11]<<24>>24==0){break L479}else{r6=r11}}if((r4|0)==0){r13=0;STACKTOP=r3;return r13}_grid_free(HEAP32[r5]);r6=HEAP32[r1+1];if((r6|0)!=0){_free(r6)}r6=HEAP32[r2];if((r6|0)!=0){_free(r6)}r6=HEAP32[r1+3];if((r6|0)!=0){_free(r6)}_free(r4);r13=0;STACKTOP=r3;return r13}}while(0);r7=HEAP32[r5];r8=HEAP32[r7>>2];r6=(r4+12|0)>>2;r11=(r7+8|0)>>2;_memset(HEAP32[r6],0,HEAP32[r11]);r9=r8+1|0;r12=_malloc(r9<<2);if((r12|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=r12,r14=r10>>2;L508:do{if((r9|0)>0){r15=0;while(1){HEAP32[(r15<<2>>2)+r14]=6;r16=r15+1|0;if((r16|0)==(r9|0)){break L508}else{r15=r16}}}}while(0);r9=HEAP32[r11];L512:do{if((r9|0)>0){r15=r7+12|0;r2=r4+8|0;r16=r7+4|0;r17=0;r18=r9;while(1){r19=HEAP32[r15>>2];r20=HEAP32[r19+(r17<<4)+8>>2];if((r20|0)==0){r21=r8}else{r21=(r20-HEAP32[r16>>2]|0)/24&-1}r20=HEAP32[r19+(r17<<4)+12>>2];if((r20|0)==0){r22=r8}else{r22=(r20-HEAP32[r16>>2]|0)/24&-1}if(HEAP8[HEAP32[r2>>2]+r17|0]<<24>>24==0){r23=r18}else{_edsf_merge(r10,r21,r22,0);r23=HEAP32[r11]}r20=r17+1|0;if((r20|0)<(r23|0)){r17=r20;r18=r23}else{break L512}}}}while(0);if((r8|0)<=-1){___assert_func(66560,110,70752,68748)}r23=(r8<<2)+r10|0;r22=HEAP32[r23>>2];do{if((r22&2|0)==0){r21=0;r9=r22;while(1){r24=r9&1^r21;r25=r9>>2;r18=HEAP32[(r25<<2>>2)+r14];if((r18&2|0)==0){r21=r24;r9=r18}else{break}}L533:do{if((r25|0)==(r8|0)){r26=r24;r27=r8}else{r9=r25<<2;r21=r22>>2;r18=r24^r22&1;HEAP32[r23>>2]=r24|r9;if((r21|0)==(r25|0)){r26=r18;r27=r25;break}else{r28=r21;r29=r18}while(1){r18=(r28<<2)+r10|0;r21=HEAP32[r18>>2];r17=r21>>2;r2=r21&1^r29;HEAP32[r18>>2]=r29|r9;if((r17|0)==(r25|0)){r26=r2;r27=r25;break L533}else{r28=r17;r29=r2}}}}while(0);if((r26|0)==0){r30=r27;break}___assert_func(66560,137,70752,68352);r30=r27}else{r30=r8}}while(0);L540:do{if((HEAP32[r11]|0)>0){r27=r7+12|0;r26=r4+8|0;r29=r7+4|0;r28=0;r25=0;r24=-1;r23=0;while(1){r22=HEAP32[r27>>2];r9=HEAP32[r22+(r23<<4)+8>>2];if((r9|0)==0){r31=r8}else{r31=(r9-HEAP32[r29>>2]|0)/24&-1}if((r31|0)<=-1){___assert_func(66560,110,70752,68748)}r9=(r31<<2)+r10|0;r2=HEAP32[r9>>2];do{if((r2&2|0)==0){r17=0;r18=r2;while(1){r32=r18&1^r17;r33=r18>>2;r21=HEAP32[(r33<<2>>2)+r14];if((r21&2|0)==0){r17=r32;r18=r21}else{break}}L554:do{if((r33|0)==(r31|0)){r34=r32;r35=r31}else{r18=r33<<2;r17=r2>>2;r21=r32^r2&1;HEAP32[r9>>2]=r32|r18;if((r17|0)==(r33|0)){r34=r21;r35=r33;break}else{r36=r17;r37=r21}while(1){r21=(r36<<2)+r10|0;r17=HEAP32[r21>>2];r16=r17>>2;r15=r17&1^r37;HEAP32[r21>>2]=r37|r18;if((r16|0)==(r33|0)){r34=r15;r35=r33;break L554}else{r36=r16;r37=r15}}}}while(0);if((r34|0)==0){r38=r35;break}___assert_func(66560,137,70752,68352);r38=r35}else{r38=r31}}while(0);r9=HEAP32[r22+(r23<<4)+12>>2];if((r9|0)==0){r39=r8}else{r39=(r9-HEAP32[r29>>2]|0)/24&-1}if((r39|0)<=-1){___assert_func(66560,110,70752,68748)}r9=(r39<<2)+r10|0;r2=HEAP32[r9>>2];do{if((r2&2|0)==0){r18=0;r15=r2;while(1){r40=r15&1^r18;r41=r15>>2;r16=HEAP32[(r41<<2>>2)+r14];if((r16&2|0)==0){r18=r40;r15=r16}else{break}}L571:do{if((r41|0)==(r39|0)){r42=r40;r43=r39}else{r15=r41<<2;r18=r2>>2;r16=r40^r2&1;HEAP32[r9>>2]=r40|r15;if((r18|0)==(r41|0)){r42=r16;r43=r41;break}else{r44=r18;r45=r16}while(1){r16=(r44<<2)+r10|0;r18=HEAP32[r16>>2];r21=r18>>2;r17=r18&1^r45;HEAP32[r16>>2]=r45|r15;if((r21|0)==(r41|0)){r42=r17;r43=r41;break L571}else{r44=r21;r45=r17}}}}while(0);if((r42|0)==0){r46=r43;break}___assert_func(66560,137,70752,68352);r46=r43}else{r46=r39}}while(0);do{if(HEAP8[HEAP32[r26>>2]+r23|0]<<24>>24==0){if((r38|0)==(r46|0)){r47=r24;r48=r25;r49=1;break}HEAP8[HEAP32[r6]+r23|0]=1;r9=(r25|0)==0?1:r25;if((r9|0)==2){r47=r24;r48=2;r49=r28;break}if((r24|0)==-1){r2=(r38|0)==(r30|0)?r46:r38;if((r2|0)==-1){r47=-1;r48=r9;r49=r28;break}else{r50=r2}}else{r50=r24}if(!((r38|0)==(r30|0)|(r38|0)==(r50|0))){r47=r50;r48=2;r49=r28;break}r47=r50;r48=(r46|0)==(r30|0)|(r46|0)==(r50|0)?r9:2;r49=r28}else{r47=r24;r48=r25;r49=r28}}while(0);r9=r23+1|0;if((r9|0)<(HEAP32[r11]|0)){r28=r49;r25=r48;r24=r47;r23=r9}else{r51=r49;r52=r48;break L540}}}else{r51=0;r52=0}}while(0);_free(r12);L588:do{if((r52|0)==1&(r51|0)==0){L590:do{if((r8|0)>0){r12=HEAP32[r1+1];r48=r4+8|0;r49=0;while(1){r47=HEAP8[r12+r49|0];if(r47<<24>>24>-1){r50=r47<<24>>24;r47=HEAP32[r5];r46=HEAP32[r47+4>>2];r30=HEAP32[r46+(r49*24&-1)>>2];L596:do{if((r30|0)>0){r38=HEAP32[r46+(r49*24&-1)+4>>2];r39=HEAP32[r47+12>>2];r43=HEAP32[r48>>2];r42=0;r45=0;while(1){r44=(HEAP8[(HEAP32[r38+(r42<<2)>>2]-r39>>4)+r43|0]<<24>>24==0&1)+r45|0;r41=r42+1|0;if((r41|0)==(r30|0)){r53=r44;break L596}else{r42=r41;r45=r44}}}else{r53=0}}while(0);if((r53|0)!=(r50|0)){break L588}}r30=r49+1|0;if((r30|0)<(r8|0)){r49=r30}else{break L590}}}}while(0);_memset(HEAP32[r6],0,HEAP32[r11]);HEAP32[r1+4]=1;r13=r4;STACKTOP=r3;return r13}}while(0);r1=r7+16|0;r11=HEAP32[r1>>2];if((r11|0)<=0){r13=r4;STACKTOP=r3;return r13}r8=r4+8|0;r53=r7+20|0;r51=r7+12|0;r7=0;r52=r11;while(1){r11=HEAP32[r5];r49=HEAP32[r11+20>>2];r48=HEAP32[r49+(r7*20&-1)>>2];if((r48|0)>0){r12=HEAP32[r49+(r7*20&-1)+4>>2];r49=HEAP32[r11+12>>2];r11=HEAP32[r8>>2];r30=0;r47=0;while(1){r54=(HEAP8[(HEAP32[r12+(r30<<2)>>2]-r49>>4)+r11|0]<<24>>24==0&1)+r47|0;r46=r30+1|0;if((r46|0)==(r48|0)){r55=0;r56=0;break}else{r30=r46;r47=r54}}while(1){r57=(HEAP8[(HEAP32[r12+(r55<<2)>>2]-r49>>4)+r11|0]<<24>>24==1&1)+r56|0;r47=r55+1|0;if((r47|0)==(r48|0)){break}else{r55=r47;r56=r57}}r58=(r57|0)==0;r59=r54}else{r58=1;r59=0}do{if((r59|0)==1&r58|(r59|0)>2){r48=HEAP32[r53>>2];r11=r48+(r7*20&-1)|0;r49=HEAP32[r11>>2];if((r49|0)<=0){r60=r52;break}r12=r48+(r7*20&-1)+4|0;r48=0;r47=r49;while(1){r49=HEAP32[HEAP32[r12>>2]+(r48<<2)>>2]-HEAP32[r51>>2]>>4;if(HEAP8[HEAP32[r8>>2]+r49|0]<<24>>24==0){HEAP8[HEAP32[r6]+r49|0]=1;r61=HEAP32[r11>>2]}else{r61=r47}r49=r48+1|0;if((r49|0)<(r61|0)){r48=r49;r47=r61}else{break}}r60=HEAP32[r1>>2]}else{r60=r52}}while(0);r47=r7+1|0;if((r47|0)<(r60|0)){r7=r47;r52=r60}else{r13=r4;break}}STACKTOP=r3;return r13}function _game_colours(r1,r2){var r3,r4,r5,r6,r7,r8;r3=STACKTOP;r4=_malloc(112),r5=r4>>2;if((r4|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r6=r4;_frontend_default_colour(r1,r6);HEAPF32[r5+3]=0;HEAPF32[r5+4]=0;HEAPF32[r5+5]=0;r1=HEAPF32[r6>>2]*.8999999761581421;HEAPF32[r5+6]=r1;r7=HEAPF32[r5+1]*.8999999761581421;HEAPF32[r5+7]=r7;HEAPF32[r5+8]=0;HEAPF32[r5+9]=1;HEAPF32[r5+10]=1;HEAPF32[r5+11]=1;HEAPF32[r5+12]=1;r8=(r4+52|0)>>2;HEAP32[r8]=0;HEAP32[r8+1]=0;HEAP32[r8+2]=0;HEAP32[r8+3]=0;HEAP32[r8+4]=0;HEAPF32[r5+18]=r1;HEAPF32[r5+19]=r7;HEAPF32[r5+20]=HEAPF32[r5+2]*.8999999761581421;HEAP32[r2>>2]=7;STACKTOP=r3;return r6}}function _game_new_drawstate(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r1=STACKTOP;r3=_malloc(32),r4=r3>>2;if((r3|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r5=r3;r6=HEAP32[r2>>2];r2=HEAP32[r6>>2];r7=HEAP32[r6+8>>2];HEAP32[r4+1]=0;HEAP32[r4]=0;r6=_malloc(r7);if((r6|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r8=r3+20|0;HEAP32[r8>>2]=r6;r6=_malloc(r2);if((r6|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r9=r3+24|0;HEAP32[r9>>2]=r6;r6=_malloc(r2);if((r6|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=r3+28|0;HEAP32[r10>>2]=r6;r6=r2<<2;r11=_malloc(r6);if((r11|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r12=r3+12|0;HEAP32[r12>>2]=r11;r11=_malloc(r6);if((r11|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r6=r3+16|0;HEAP32[r6>>2]=r11;HEAP32[r4+2]=0;_memset(HEAP32[r8>>2],1,r7);_memset(HEAP32[r9>>2],0,r2);_memset(HEAP32[r10>>2],0,r2);if((r2|0)>0){r13=0}else{STACKTOP=r1;return r5}while(1){HEAP32[HEAP32[r6>>2]+(r13<<2)>>2]=-1;HEAP32[HEAP32[r12>>2]+(r13<<2)>>2]=-1;r10=r13+1|0;if((r10|0)==(r2|0)){break}else{r13=r10}}STACKTOP=r1;return r5}function _game_anim_length(r1,r2,r3,r4){return 0}function _game_timing_state(r1,r2){return 1}function _game_flash_length(r1,r2,r3,r4){var r5;do{if((HEAP32[r1+16>>2]|0)==0){if((HEAP32[r2+16>>2]|0)==0){break}if((HEAP32[r1+20>>2]|0)!=0){break}if((HEAP32[r2+20>>2]|0)==0){r5=.5}else{break}return r5}}while(0);r5=0;return r5}function _game_status(r1){return(HEAP32[r1+16>>2]|0)!=0&1}function _game_redraw(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59;r7=0;r6=STACKTOP;STACKTOP=STACKTOP+144|0;r5=r6;r3=r6+64;r9=r6+128;r10=r6+132;r11=r6+136;r12=r6+140;r13=r4|0;r14=HEAP32[r13>>2],r15=r14>>2;r16=(r2+4|0)>>2;r17=(HEAP32[r16]|0)/2&-1;r18=(r2|0)>>2;r19=(HEAP32[r18]|0)==0&1;r20=r14|0;L669:do{if((HEAP32[r20>>2]|0)>0){r21=r14+4|0;r22=r4+4|0;r23=(r4+8|0)>>2;r24=r2+24|0;r25=r2+28|0;r26=0;r27=r19;r28=0;while(1){r29=HEAP32[HEAP32[r21>>2]+(r28*24&-1)>>2];r30=HEAP8[HEAP32[r22>>2]+r28|0];r31=r30<<24>>24;do{if(r30<<24>>24<0){r32=r27;r33=r26}else{r34=HEAP32[r13>>2]>>2;r35=HEAP32[r34+1]>>2;r36=HEAP32[((r28*24&-1)>>2)+r35];r37=(r36|0)>0;L675:do{if(r37){r38=HEAP32[((r28*24&-1)+4>>2)+r35];r39=HEAP32[r34+3];r40=HEAP32[r23];r41=0;r42=0;while(1){r43=(HEAP8[(HEAP32[r38+(r41<<2)>>2]-r39>>4)+r40|0]<<24>>24==0&1)+r42|0;r44=r41+1|0;if((r44|0)==(r36|0)){r45=r43;break L675}else{r41=r44;r42=r43}}}else{r45=0}}while(0);if((r45|0)>(r31|0)){r46=1}else{L682:do{if(r37){r42=HEAP32[((r28*24&-1)+4>>2)+r35];r41=HEAP32[r34+3];r40=HEAP32[r23];r39=0;r38=0;while(1){r43=(HEAP8[(HEAP32[r42+(r39<<2)>>2]-r41>>4)+r40|0]<<24>>24==2&1)+r38|0;r44=r39+1|0;if((r44|0)==(r36|0)){r47=r43;break L682}else{r39=r44;r38=r43}}}else{r47=0}}while(0);r46=(r47|0)>(r29-r31|0)}r38=r46&1;L688:do{if(r37){r39=HEAP32[((r28*24&-1)+4>>2)+r35];r40=HEAP32[r34+3];r41=HEAP32[r23];r42=0;r43=0;while(1){r44=(HEAP8[(HEAP32[r39+(r42<<2)>>2]-r40>>4)+r41|0]<<24>>24==0&1)+r43|0;r48=r42+1|0;if((r48|0)==(r36|0)){r49=r44;break L688}else{r42=r48;r43=r44}}}else{r49=0}}while(0);if((r49|0)==(r31|0)){L695:do{if(r37){r43=HEAP32[((r28*24&-1)+4>>2)+r35];r42=HEAP32[r34+3];r41=HEAP32[r23];r40=0;r39=0;while(1){r44=(HEAP8[(HEAP32[r43+(r40<<2)>>2]-r42>>4)+r41|0]<<24>>24==2&1)+r39|0;r48=r40+1|0;if((r48|0)==(r36|0)){r50=r44;break L695}else{r40=r48;r39=r44}}}else{r50=0}}while(0);r51=(r50|0)==(r29-r31|0)}else{r51=0}r36=HEAP32[r24>>2]+r28|0;if((r38|0)==(HEAP8[r36]<<24>>24|0)){if((r51&1|0)==(HEAP8[HEAP32[r25>>2]+r28|0]<<24>>24|0)){r32=r27;r33=r26;break}}HEAP8[r36]=r46&1;HEAP8[HEAP32[r25>>2]+r28|0]=r51&1;if((r26|0)==16){r32=1;r33=16;break}HEAP32[r3+(r26<<2)>>2]=r28;r32=r27;r33=r26+1|0}}while(0);r31=r28+1|0;if((r31|0)<(HEAP32[r20>>2]|0)){r26=r33;r27=r32;r28=r31}else{r52=r33;r53=r32;break L669}}}else{r52=0;r53=r19}}while(0);do{if(r8>0){if(!(r8<=.1666666716337204|r8>=.3333333432674408)){r7=509;break}r19=r2+8|0;r32=(HEAP32[r19>>2]|0)==0&1;HEAP32[r19>>2]=1;r54=r32;break}else{r7=509}}while(0);if(r7==509){r8=r2+8|0;r32=HEAP32[r8>>2];HEAP32[r8>>2]=0;r54=r32}r32=r14+8|0;L713:do{if((HEAP32[r32>>2]|0)>0){r8=r4+12|0;r19=r4+8|0;r33=r2+20|0;r20=(r54|0)==0;r51=0;r46=r53;r50=0;while(1){if(HEAP8[HEAP32[r8>>2]+r50|0]<<24>>24==0){r55=HEAP8[HEAP32[r19>>2]+r50|0]}else{r55=3}r49=HEAP32[r33>>2]+r50|0;do{if(r55<<24>>24==HEAP8[r49]<<24>>24){if(r20){r56=r46;r57=r51;break}if(HEAP8[HEAP32[r19>>2]+r50|0]<<24>>24==0){r7=517;break}else{r56=r46;r57=r51;break}}else{r7=517}}while(0);do{if(r7==517){r7=0;HEAP8[r49]=r55;if((r51|0)==16){r56=1;r57=16;break}HEAP32[r5+(r51<<2)>>2]=r50;r56=r46;r57=r51+1|0}}while(0);r49=r50+1|0;if((r49|0)<(HEAP32[r32>>2]|0)){r51=r57;r46=r56;r50=r49}else{r58=r57;r59=r56;break L713}}}else{r58=0;r59=r53}}while(0);if((r59|0)!=0){r59=HEAP32[r15+9]-HEAP32[r15+7]|0;r53=HEAP32[r16];r56=Math.imul(r53,HEAP32[r15+8]-HEAP32[r15+6]|0);r57=HEAP32[r15+10];r15=r17<<1|1;_game_redraw_in_rect(r1,r2,r4,0,0,r15+((r56|0)/(r57|0)&-1)|0,r15+((Math.imul(r59,r53)|0)/(r57|0)&-1)|0);HEAP32[r18]=1;STACKTOP=r6;return}L732:do{if((r52|0)>0){r57=r14+4|0;r53=0;while(1){_face_text_bbox(r2,r14,HEAP32[r57>>2]+(HEAP32[r3+(r53<<2)>>2]*24&-1)|0,r9,r10,r11,r12);_game_redraw_in_rect(r1,r2,r4,HEAP32[r9>>2],HEAP32[r10>>2],HEAP32[r11>>2],HEAP32[r12>>2]);r59=r53+1|0;if((r59|0)==(r52|0)){break L732}else{r53=r59}}}}while(0);if((r58|0)<=0){HEAP32[r18]=1;STACKTOP=r6;return}r52=r14+12|0;r12=r14+24|0;r11=r14+28|0;r10=r14+40|0;r14=0;while(1){r9=HEAP32[r52>>2];r3=HEAP32[r5+(r14<<2)>>2];r53=HEAP32[r9+(r3<<4)>>2];r57=HEAP32[r9+(r3<<4)+4>>2];r3=HEAP32[r57+12>>2];r9=HEAP32[r57+16>>2];r57=HEAP32[r12>>2];r59=HEAP32[r11>>2];r15=HEAP32[r53+16>>2]-r59|0;r56=HEAP32[r16];r17=Math.imul(r56,HEAP32[r53+12>>2]-r57|0);r53=HEAP32[r10>>2];r32=(r56|0)/2&-1;r55=r32+((r17|0)/(r53|0)&-1)|0;r17=r32+((Math.imul(r56,r15)|0)/(r53|0)&-1)|0;r15=((Math.imul(r56,r3-r57|0)|0)/(r53|0)&-1)+r32|0;r57=((Math.imul(r56,r9-r59|0)|0)/(r53|0)&-1)+r32|0;r32=(r55|0)<(r15|0)?r55:r15;r53=(r17|0)<(r57|0)?r17:r57;_game_redraw_in_rect(r1,r2,r4,r32-2|0,r53-2|0,((r55|0)>(r15|0)?r55:r15)+5-r32|0,((r17|0)>(r57|0)?r17:r57)+5-r53|0);r53=r14+1|0;if((r53|0)==(r58|0)){break}else{r14=r53}}HEAP32[r18]=1;STACKTOP=r6;return}function _game_print_size(r1,r2,r3){var r4,r5,r6,r7;r4=STACKTOP;STACKTOP=STACKTOP+12|0;r5=r4;r6=r4+4;r7=r4+8;FUNCTION_TABLE[HEAP32[(HEAP32[(HEAP32[r1+12>>2]<<2)+66068>>2]<<2)+66120>>2]](HEAP32[r1>>2],HEAP32[r1+4>>2],r7,r5,r6);r1=HEAP32[r7>>2];r7=((HEAP32[r6>>2]*700&-1|0)/(r1|0)&-1)+701|0;HEAPF32[r2>>2]=(((HEAP32[r5>>2]*700&-1|0)/(r1|0)&-1)+701|0)/100;HEAPF32[r3>>2]=(r7|0)/100;STACKTOP=r4;return}function _game_print(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33;r4=STACKTOP;STACKTOP=STACKTOP+52|0;r5=r4;r6=r4+20;r7=_print_mono_colour(r1,0);r8=HEAP32[r2>>2];r9=(r8|0)>>2;r10=_malloc(HEAP32[r9]<<2);if((r10|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r11=r10;r12=_malloc(HEAP32[r9]<<2);if((r12|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r13=r12;r14=HEAP32[r9];L751:do{if((r14|0)>0){r15=0;while(1){HEAP32[r13+(r15<<2)>>2]=-1;HEAP32[r11+(r15<<2)>>2]=-1;r16=r15+1|0;r17=HEAP32[r9];if((r16|0)<(r17|0)){r15=r16}else{r18=r17;break L751}}}else{r18=r14}}while(0);r14=r8+16|0;if((HEAP32[r14>>2]|0)>0){r15=r8+20|0;r17=r8+24|0;r16=r8+28|0;r19=r8+40|0;r20=(r3|0)/2&-1;r21=(r3|0)/15&-1;r22=r1|0;r23=r1+4|0;r24=0;while(1){r25=HEAP32[r15>>2];r26=HEAP32[r25+(r24*20&-1)+16>>2]-HEAP32[r16>>2]|0;r27=Math.imul(HEAP32[r25+(r24*20&-1)+12>>2]-HEAP32[r17>>2]|0,r3);r25=HEAP32[r19>>2];r28=r20+((Math.imul(r26,r3)|0)/(r25|0)&-1)|0;FUNCTION_TABLE[HEAP32[HEAP32[r22>>2]+16>>2]](HEAP32[r23>>2],r20+((r27|0)/(r25|0)&-1)|0,r28,r21,r7,r7);r28=r24+1|0;if((r28|0)<(HEAP32[r14>>2]|0)){r24=r28}else{break}}r29=HEAP32[r9]}else{r29=r18}L761:do{if((r29|0)>0){r18=r2+4|0;r24=r8+4|0;r14=r5|0;r21=(r3|0)/2&-1;r20=r1|0;r23=r1+4|0;r22=r8+24|0;r19=r8+28|0;r17=r8+40|0;r16=0;r15=r29;while(1){r28=HEAP8[HEAP32[r18>>2]+r16|0];if(r28<<24>>24>-1){r25=HEAP32[r24>>2];r27=r25+(r16*24&-1)|0;_sprintf(r14,68564,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r28<<24>>24,tempInt));r28=(r27-HEAP32[r24>>2]|0)/24&-1;r26=((r28<<2)+r11|0)>>2;r30=HEAP32[r26];if((r30|0)>-1){r31=r30;r32=HEAP32[r13+(r28<<2)>>2]}else{_grid_find_incentre(r27);r27=HEAP32[r25+(r16*24&-1)+20>>2];r30=((r28<<2)+r13|0)>>2;HEAP32[r26]=HEAP32[r25+(r16*24&-1)+16>>2]-HEAP32[r22>>2]|0;HEAP32[r30]=r27-HEAP32[r19>>2]|0;r27=Math.imul(HEAP32[r26],r3);HEAP32[r26]=(r27|0)/(HEAP32[r17>>2]|0)&-1;r27=Math.imul(HEAP32[r30],r3);HEAP32[r30]=(r27|0)/(HEAP32[r17>>2]|0)&-1;HEAP32[r26]=HEAP32[r26]+r21|0;r27=HEAP32[r30]+r21|0;HEAP32[r30]=r27;r31=HEAP32[r26];r32=r27}FUNCTION_TABLE[HEAP32[HEAP32[r20>>2]>>2]](HEAP32[r23>>2],r31,r32,1,r21,257,r7,r14);r33=HEAP32[r9]}else{r33=r15}r27=r16+1|0;if((r27|0)<(r33|0)){r16=r27;r15=r33}else{break L761}}}}while(0);r33=r8+8|0;if((HEAP32[r33>>2]|0)<=0){_free(r10);_free(r12);STACKTOP=r4;return}r9=r2+8|0;r2=r8+12|0;r32=r8+24|0;r31=r8+28|0;r13=r8+40|0;r8=(r3|0)/2&-1;r11=r3|0;r29=r6|0;r5=r6+4|0;r15=r6+8|0;r16=r6+12|0;r14=r6+16|0;r21=r6+20|0;r23=r6+24|0;r20=r6+28|0;r6=(r1|0)>>2;r17=(r1+4|0)>>2;r1=0;while(1){r19=HEAP8[HEAP32[r9>>2]+r1|0]<<24>>24==0;r22=r19?30:150;r24=HEAP32[r2>>2];r18=HEAP32[r24+(r1<<4)>>2];r27=HEAP32[r32>>2];r26=HEAP32[r31>>2];r30=HEAP32[r18+16>>2]-r26|0;r25=Math.imul(HEAP32[r18+12>>2]-r27|0,r3);r18=HEAP32[r13>>2];r28=r8+((r25|0)/(r18|0)&-1)|0;r25=r8+((Math.imul(r30,r3)|0)/(r18|0)&-1)|0;r30=HEAP32[r24+(r1<<4)+4>>2];r24=HEAP32[r30+16>>2]-r26|0;r26=((Math.imul(HEAP32[r30+12>>2]-r27|0,r3)|0)/(r18|0)&-1)+r8|0;r27=((Math.imul(r24,r3)|0)/(r18|0)&-1)+r8|0;if(r19){r19=(r28|0)-(r26|0);r18=(r25|0)-(r27|0);r24=Math.sqrt(r19*r19+r18*r18);r18=r22|0;r19=r11*((r27-r25|0)/r24)/r18&-1;HEAP32[r29>>2]=r19+r28|0;r30=r11*((r26-r28|0)/r24)/r18&-1;HEAP32[r5>>2]=r25-r30|0;HEAP32[r15>>2]=r28-r19|0;HEAP32[r16>>2]=r30+r25|0;HEAP32[r14>>2]=r26-r19|0;HEAP32[r21>>2]=r30+r27|0;HEAP32[r23>>2]=r19+r26|0;HEAP32[r20>>2]=r27-r30|0;FUNCTION_TABLE[HEAP32[HEAP32[r6]+12>>2]](HEAP32[r17],r29,4,r7,r7)}else{r30=(r3|0)/(r22|0)&-1;FUNCTION_TABLE[HEAP32[HEAP32[r6]+16>>2]](HEAP32[r17],((r28*5&-1)+r26|0)/6&-1,((r25*5&-1)+r27|0)/6&-1,r30,r7,r7);FUNCTION_TABLE[HEAP32[HEAP32[r6]+16>>2]](HEAP32[r17],((r28<<2)+(r26<<1)|0)/6&-1,((r25<<2)+(r27<<1)|0)/6&-1,r30,r7,r7);FUNCTION_TABLE[HEAP32[HEAP32[r6]+16>>2]](HEAP32[r17],((r28+r26)*3&-1|0)/6&-1,((r25+r27)*3&-1|0)/6&-1,r30,r7,r7);FUNCTION_TABLE[HEAP32[HEAP32[r6]+16>>2]](HEAP32[r17],((r26<<2)+(r28<<1)|0)/6&-1,((r27<<2)+(r25<<1)|0)/6&-1,r30,r7,r7);FUNCTION_TABLE[HEAP32[HEAP32[r6]+16>>2]](HEAP32[r17],(r28+(r26*5&-1)|0)/6&-1,(r25+(r27*5&-1)|0)/6&-1,r30,r7,r7)}r30=r1+1|0;if((r30|0)<(HEAP32[r33>>2]|0)){r1=r30}else{break}}_free(r10);_free(r12);STACKTOP=r4;return}function _game_redraw_in_rect(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56;r8=STACKTOP;STACKTOP=STACKTOP+36|0;r9=r8+20,r10=r9>>2;r11=r8+24,r12=r11>>2;r13=r8+28,r14=r13>>2;r15=r8+32,r16=r15>>2;r17=(r3|0)>>2;r18=HEAP32[r17];r19=(r1|0)>>2;r20=(r1+4|0)>>2;FUNCTION_TABLE[HEAP32[HEAP32[r19]+24>>2]](HEAP32[r20],r4,r5,r6,r7);FUNCTION_TABLE[HEAP32[HEAP32[r19]+4>>2]](HEAP32[r20],r4,r5,r6,r7,0);r21=r18|0;L784:do{if((HEAP32[r21>>2]|0)>0){r22=r3+4|0;r23=r18+4|0;r24=r6+r4|0;r25=r7+r5|0;r26=r8|0;r27=(r2+12|0)>>2;r28=r2+16|0;r29=r2+4|0,r30=r29>>2;r31=r2+24|0;r32=r2+28|0;r33=0;while(1){do{if(HEAP8[HEAP32[r22>>2]+r33|0]<<24>>24>-1){_face_text_bbox(r2,r18,HEAP32[r23>>2]+(r33*24&-1)|0,r9,r11,r13,r15);r34=HEAP32[r10];r35=HEAP32[r12];if(!((HEAP32[r14]+r34|0)>(r4|0)&(r24|0)>(r34|0))){break}if(!((HEAP32[r16]+r35|0)>(r5|0)&(r25|0)>(r35|0))){break}r35=HEAP32[r17];r34=r35+4|0;r36=HEAP32[r34>>2];r37=r36+(r33*24&-1)|0;_sprintf(r26,68564,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP8[HEAP32[r22>>2]+r33|0]<<24>>24,tempInt));r38=(r37-HEAP32[r34>>2]|0)/24&-1;r34=HEAP32[HEAP32[r27]+(r38<<2)>>2];if((r34|0)>-1){r39=r34}else{_grid_find_incentre(r37);r37=HEAP32[r36+(r33*24&-1)+20>>2];r34=((r38<<2)+HEAP32[r27]|0)>>2;r40=((r38<<2)+HEAP32[r28>>2]|0)>>2;HEAP32[r34]=HEAP32[r36+(r33*24&-1)+16>>2]-HEAP32[r35+24>>2]|0;HEAP32[r40]=r37-HEAP32[r35+28>>2]|0;r37=Math.imul(HEAP32[r30],HEAP32[r34]);r36=r35+40|0;HEAP32[r34]=(r37|0)/(HEAP32[r36>>2]|0)&-1;r37=Math.imul(HEAP32[r30],HEAP32[r40]);HEAP32[r40]=(r37|0)/(HEAP32[r36>>2]|0)&-1;HEAP32[r34]=HEAP32[r34]+((HEAP32[r30]|0)/2&-1)|0;HEAP32[r40]=HEAP32[r40]+((HEAP32[r30]|0)/2&-1)|0;r39=HEAP32[HEAP32[r27]+(r38<<2)>>2]}if(HEAP8[HEAP32[r31>>2]+r33|0]<<24>>24==0){r41=HEAP8[HEAP32[r32>>2]+r33|0]<<24>>24!=0?5:1}else{r41=4}FUNCTION_TABLE[HEAP32[HEAP32[r19]>>2]](HEAP32[r20],r39,HEAP32[HEAP32[r28>>2]+(r38<<2)>>2],1,(HEAP32[r30]|0)/2&-1,257,r41,r26)}}while(0);r38=r33+1|0;if((r38|0)<(HEAP32[r21>>2]|0)){r33=r38}else{r42=r29;r43=r24;r44=r25;break L784}}}else{r42=r2+4|0;r43=r6+r4|0;r44=r7+r5|0}}while(0);r21=r18+8|0;r41=r18+12|0;r39=r18+24|0;r15=r18+28|0;r13=r18+40|0;r11=r3+12|0;r9=r3+8|0;r3=r2+8|0;r2=0;r25=HEAP32[r21>>2];while(1){if((r25|0)>0){r24=(r2<<2)+65996|0;r29=0;while(1){r33=HEAP32[r41>>2];r26=HEAP32[r33+(r29<<4)>>2];r30=HEAP32[r33+(r29<<4)+4>>2];r33=HEAP32[r30+12>>2];r28=HEAP32[r30+16>>2];r30=HEAP32[r39>>2];r32=HEAP32[r15>>2];r31=HEAP32[r26+16>>2]-r32|0;r27=HEAP32[r42>>2];r22=Math.imul(r27,HEAP32[r26+12>>2]-r30|0);r26=HEAP32[r13>>2];r23=(r27|0)/2&-1;r38=r23+((r22|0)/(r26|0)&-1)|0;r22=r23+((Math.imul(r27,r31)|0)/(r26|0)&-1)|0;r31=((Math.imul(r27,r33-r30|0)|0)/(r26|0)&-1)+r23|0;r30=((Math.imul(r27,r28-r32|0)|0)/(r26|0)&-1)+r23|0;r26=(r38|0)<(r31|0)?r38:r31;r45=r26-2|0;r32=(r38|0)>(r31|0)?r38:r31;r31=(r22|0)<(r30|0)?r22:r30;r46=r31-2|0;r47=r32+5-r26|0;r26=((r22|0)>(r30|0)?r22:r30)+3|0;r48=r26+(2-r31)|0;do{if((r32+3|0)>(r4|0)&(r43|0)>(r45|0)&(r26|0)>(r5|0)&(r44|0)>(r46|0)){r31=HEAP32[r17]>>2;r30=HEAP32[r31+3];do{if(HEAP8[HEAP32[r11>>2]+r29|0]<<24>>24==0){r22=HEAP8[HEAP32[r9>>2]+r29|0];if(r22<<24>>24==2){r49=6;break}else if(r22<<24>>24==1){r49=2;break}else{r49=(HEAP32[r3>>2]|0)==0?1:3;break}}else{r49=4}}while(0);if((r49|0)!=(HEAP32[r24>>2]|0)){break}r22=HEAP32[r30+(r29<<4)>>2];r38=HEAP32[r31+6];r28=HEAP32[r31+7];r33=HEAP32[r22+16>>2]-r28|0;r40=Math.imul(r27,HEAP32[r22+12>>2]-r38|0);r22=HEAP32[r31+10];r34=r23+((r40|0)/(r22|0)&-1)|0;r40=r23+((Math.imul(r27,r33)|0)/(r22|0)&-1)|0;r33=HEAP32[r30+(r29<<4)+4>>2];r36=HEAP32[r33+16>>2]-r28|0;r28=((Math.imul(HEAP32[r33+12>>2]-r38|0,r27)|0)/(r22|0)&-1)+r23|0;r38=((Math.imul(r36,r27)|0)/(r22|0)&-1)+r23|0;if((r49|0)!=6){_draw_thick_line(r1,3,(r34|0)+.5,(r40|0)+.5,(r28|0)+.5,(r38|0)+.5,r49);break}r22=HEAP32[16608];if((r22|0)<0){r36=_getenv(67788);if((r36|0)==0){r50=1}else{r33=HEAP8[r36];r50=r33<<24>>24==121|r33<<24>>24==89}r33=r50&1;HEAP32[16608]=r33;r51=r33}else{r51=r22}if((r51|0)==0){break}FUNCTION_TABLE[HEAP32[HEAP32[r19]+8>>2]](HEAP32[r20],r34,r40,r28,r38,6)}}while(0);r23=r29+1|0;r52=HEAP32[r21>>2];if((r23|0)<(r52|0)){r29=r23}else{break}}HEAP32[r10]=r45;HEAP32[r12]=r46;HEAP32[r14]=r47;HEAP32[r16]=r48;r53=r52}else{r53=r25}r29=r2+1|0;if((r29|0)==5){break}else{r2=r29;r25=r53}}r53=r18+16|0;r25=HEAP32[r53>>2];if((r25|0)>0){r2=r18+20|0;r18=0;r52=r25;while(1){r25=HEAP32[r2>>2];r48=HEAP32[r42>>2];r47=HEAP32[r13>>2];r46=HEAP32[r25+(r18*20&-1)+16>>2]-HEAP32[r15>>2]|0;r45=(r48|0)/2&-1;r54=((Math.imul(HEAP32[r25+(r18*20&-1)+12>>2]-HEAP32[r39>>2]|0,r48)|0)/(r47|0)&-1)-2+r45|0;r55=((Math.imul(r46,r48)|0)/(r47|0)&-1)-2+r45|0;do{if((r54+5|0)>(r4|0)&(r43|0)>(r54|0)){if(!((r55+5|0)>(r5|0)&(r44|0)>(r55|0))){r56=r52;break}r47=HEAP32[r20];r46=HEAP32[r17]>>2;r25=HEAP32[HEAP32[r19]+16>>2];r21=HEAP32[r46+5];r51=HEAP32[r21+(r18*20&-1)+16>>2]-HEAP32[r46+7]|0;r50=Math.imul(HEAP32[r21+(r18*20&-1)+12>>2]-HEAP32[r46+6]|0,r48);r21=HEAP32[r46+10];r46=r45+((Math.imul(r51,r48)|0)/(r21|0)&-1)|0;FUNCTION_TABLE[r25](r47,r45+((r50|0)/(r21|0)&-1)|0,r46,2,1,1);r56=HEAP32[r53>>2]}else{r56=r52}}while(0);r45=r18+1|0;if((r45|0)<(r56|0)){r18=r45;r52=r56}else{break}}HEAP32[r10]=r54;HEAP32[r12]=r55;HEAP32[r14]=5;HEAP32[r16]=5}FUNCTION_TABLE[HEAP32[HEAP32[r19]+28>>2]](HEAP32[r20]);r16=HEAP32[HEAP32[r19]+20>>2];if((r16|0)==0){STACKTOP=r8;return}FUNCTION_TABLE[r16](HEAP32[r20],r4,r5,r6,r7);STACKTOP=r8;return}function _face_text_bbox(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r8=(r3-HEAP32[r2+4>>2]|0)/24&-1;r9=(r1+12|0)>>2;r10=HEAP32[HEAP32[r9]+(r8<<2)>>2];if((r10|0)>-1){r11=r1+16|0;r12=r10;r10=r1+4|0,r13=r10>>2}else{_grid_find_incentre(r3);r14=HEAP32[r3+20>>2];r15=((r8<<2)+HEAP32[r9]|0)>>2;r16=r1+16|0;r17=((r8<<2)+HEAP32[r16>>2]|0)>>2;HEAP32[r15]=HEAP32[r3+16>>2]-HEAP32[r2+24>>2]|0;HEAP32[r17]=r14-HEAP32[r2+28>>2]|0;r14=r1+4|0,r1=r14>>2;r3=Math.imul(HEAP32[r1],HEAP32[r15]);r18=r2+40|0;HEAP32[r15]=(r3|0)/(HEAP32[r18>>2]|0)&-1;r3=Math.imul(HEAP32[r1],HEAP32[r17]);HEAP32[r17]=(r3|0)/(HEAP32[r18>>2]|0)&-1;HEAP32[r15]=HEAP32[r15]+((HEAP32[r1]|0)/2&-1)|0;HEAP32[r17]=HEAP32[r17]+((HEAP32[r1]|0)/2&-1)|0;r11=r16;r12=HEAP32[HEAP32[r9]+(r8<<2)>>2];r10=r14,r13=r10>>2}r10=HEAP32[HEAP32[r11>>2]+(r8<<2)>>2];HEAP32[r4>>2]=r12-1+((HEAP32[r13]|0)/-4&-1)|0;HEAP32[r5>>2]=r10-3+((HEAP32[r13]|0)/-4&-1)|0;HEAP32[r6>>2]=((HEAP32[r13]|0)/2&-1)+2|0;HEAP32[r7>>2]=((HEAP32[r13]|0)/2&-1)+5|0;return}function _new_solver_state(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r3=STACKTOP;r4=r1|0;r5=HEAP32[r4>>2]>>2;r6=HEAP32[r5+4];r7=HEAP32[r5];r8=HEAP32[r5+2];r5=_malloc(52),r9=r5>>2;if((r5|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=r5;r11=_dup_game(r1);HEAP32[r9]=r11;HEAP32[r9+1]=3;HEAP32[r9+3]=r2;r11=r6<<2;r1=_malloc(r11);if((r1|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r12=r1;r1=(r6|0)>0;L856:do{if(r1){r13=0;while(1){HEAP32[r12+(r13<<2)>>2]=6;r14=r13+1|0;if((r14|0)==(r6|0)){break L856}else{r13=r14}}}}while(0);HEAP32[r9+10]=r12;r12=_malloc(r11);if((r12|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r11=r12;r12=r5+8|0;HEAP32[r12>>2]=r11;L863:do{if(r1){r13=0;r14=r11;while(1){HEAP32[r14+(r13<<2)>>2]=1;r15=r13+1|0;if((r15|0)==(r6|0)){break L863}r13=r15;r14=HEAP32[r12>>2]}}}while(0);r12=_malloc(r6);if((r12|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r11=r5+32|0;HEAP32[r11>>2]=r12;r12=_malloc(r7);if((r12|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r1=r5+36|0;HEAP32[r1>>2]=r12;_memset(HEAP32[r11>>2],0,r6);_memset(HEAP32[r1>>2],0,r7);r1=_malloc(r6);if((r1|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r9+4]=r1;_memset(r1,0,r6);r1=_malloc(r6);if((r1|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r9+5]=r1;_memset(r1,0,r6);r6=_malloc(r7);if((r6|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r9+6]=r6;_memset(r6,0,r7);r6=_malloc(r7);if((r6|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r9+7]=r6;_memset(r6,0,r7);do{if((r2|0)<1){HEAP32[r9+11]=0}else{r7=r8<<1;r6=_malloc(r7);if((r6|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r9+11]=r6;_memset(r6,0,r7);if((r2|0)<3){break}r7=HEAP32[HEAP32[r4>>2]+8>>2];r6=_malloc(r7<<2);if((r6|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r1=r6;L896:do{if((r7|0)>0){r6=0;while(1){HEAP32[r1+(r6<<2)>>2]=6;r11=r6+1|0;if((r11|0)==(r7|0)){break L896}else{r6=r11}}}}while(0);HEAP32[r9+12]=r1;STACKTOP=r3;return r10}}while(0);HEAP32[r9+12]=0;STACKTOP=r3;return r10}function _free_solver_state(r1){var r2,r3,r4,r5;r2=r1>>2;if((r1|0)==0){return}r3=HEAP32[r2],r4=r3>>2;if((r3|0)!=0){_grid_free(HEAP32[r4]);r5=HEAP32[r4+1];if((r5|0)!=0){_free(r5)}r5=HEAP32[r4+2];if((r5|0)!=0){_free(r5)}r5=HEAP32[r4+3];if((r5|0)!=0){_free(r5)}_free(r3)}r3=HEAP32[r2+10];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+2];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+8];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+9];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+4];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+5];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+6];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+7];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+11];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+12];if((r3|0)!=0){_free(r3)}_free(r1);return}function _solve_game_rec(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r2=r1>>2;r3=0;r4=STACKTOP;r5=r1|0;r6=HEAP32[HEAP32[r5>>2]>>2]>>2;r7=HEAP32[r6+4];r8=HEAP32[r6];r9=HEAP32[r6+2];r6=_malloc(52),r10=r6>>2;if((r6|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r11=r6;r12=_dup_game(HEAP32[r5>>2]);r5=r6;HEAP32[r5>>2]=r12;r12=(r6+4|0)>>2;HEAP32[r12]=HEAP32[r2+1];r13=(r6+12|0)>>2;HEAP32[r13]=HEAP32[r2+3];r14=r7<<2;r15=_malloc(r14);if((r15|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r16=r6+40|0;HEAP32[r16>>2]=r15;r15=_malloc(r14);if((r15|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r17=r6+8|0;HEAP32[r17>>2]=r15;_memcpy(HEAP32[r16>>2],HEAP32[r2+10],r14);_memcpy(HEAP32[r17>>2],HEAP32[r2+2],r14);r14=_malloc(r7);if((r14|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r17=r6+32|0;HEAP32[r17>>2]=r14;r14=_malloc(r8);if((r14|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r16=r6+36|0;HEAP32[r16>>2]=r14;_memcpy(HEAP32[r17>>2],HEAP32[r2+8],r7);_memcpy(HEAP32[r16>>2],HEAP32[r2+9],r8);r16=_malloc(r7);if((r16|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r10+4]=r16;_memcpy(r16,HEAP32[r2+4],r7);r16=_malloc(r7);if((r16|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r10+5]=r16;_memcpy(r16,HEAP32[r2+5],r7);r7=_malloc(r8);if((r7|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r10+6]=r7;_memcpy(r7,HEAP32[r2+6],r8);r7=_malloc(r8);if((r7|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r10+7]=r7;_memcpy(r7,HEAP32[r2+7],r8);r8=r1+44|0;do{if((HEAP32[r8>>2]|0)==0){HEAP32[r10+11]=0}else{r2=r9<<1;r7=_malloc(r2);if((r7|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r10+11]=r7;_memcpy(r7,HEAP32[r8>>2],r2);break}}}while(0);r8=r1+48|0;do{if((HEAP32[r8>>2]|0)==0){HEAP32[r10+12]=0;r18=0;r19=0;break}else{r1=r9<<2;r2=_malloc(r1);if((r2|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r10+12]=r2;_memcpy(r2,HEAP32[r8>>2],r1);r18=0;r19=0;break}}}while(0);L991:while(1){r8=HEAP32[r12];if((r8|0)==0|(r8|0)==2){r20=r8;break}else if((r8|0)==1){r3=735;break}do{if((r19|0)>0&(r18|0)!=0){r21=r8}else{if((HEAP32[r13]|0)<0){r21=r8;break}r10=_trivial_deductions(r11);if((r10|0)!=4){r18=0;r19=r10;continue L991}r21=HEAP32[r12]}}while(0);if((r21|0)==0|(r21|0)==2){r20=r21;break}else if((r21|0)==1){r3=731;break}do{if((r19|0)>1&r18>>>0>1){r22=r21}else{if((HEAP32[r13]|0)<1){r22=r21;break}r8=_dline_deductions(r11);if((r8|0)!=4){r18=1;r19=r8;continue L991}r22=HEAP32[r12]}}while(0);if((r22|0)==0|(r22|0)==2){r20=r22;break}else if((r22|0)==1){r3=730;break}do{if((r19|0)>3&(r18|0)==3){r23=r22}else{if((HEAP32[r13]|0)<3){r23=r22;break}r8=_linedsf_deductions(r11);if((r8|0)!=4){r18=2;r19=r8;continue L991}r23=HEAP32[r12]}}while(0);if((r23|0)==0|(r23|0)==2){r20=r23;break}else if((r23|0)==1){r3=734;break}if((HEAP32[r13]|0)<0){r20=r23;break}r8=_loop_deductions(r11);if((r8|0)==4){r3=728;break}else{r18=3;r19=r8}}if(r3==728){r20=HEAP32[r12]}else if(r3==730){STACKTOP=r4;return r11}else if(r3==731){STACKTOP=r4;return r11}else if(r3==734){STACKTOP=r4;return r11}else if(r3==735){STACKTOP=r4;return r11}if(!((r20|0)==0|(r20|0)==2)){STACKTOP=r4;return r11}r20=HEAP32[r5>>2];r5=HEAP32[r20+8>>2];r3=HEAP32[HEAP32[r20>>2]+8>>2];r20=_memchr(r5,1,r3);if((r20|0)==0){STACKTOP=r4;return r11}else{r24=r5;r25=r3;r26=r20}while(1){HEAP8[r26]=2;r20=r24+(r25-r26)|0;r3=_memchr(r26,1,r20);if((r3|0)==0){break}else{r24=r26;r25=r20;r26=r3}}STACKTOP=r4;return r11}function _trivial_deductions(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62;r2=0;r3=(r1|0)>>2;r4=HEAP32[r3];r5=HEAP32[r4>>2];r6=r5|0;L1029:do{if((HEAP32[r6>>2]|0)>0){r7=r5+4|0;r8=(r1+36|0)>>2;r9=r1+24|0;r10=r1+28|0;r11=r4+4|0;r12=(r5+12|0)>>2;r13=r5+20|0;r14=r4+8|0;r15=4;r16=0;L1031:while(1){r17=HEAP32[r7>>2];r18=HEAP32[r8]+r16|0;L1033:do{if(HEAP8[r18]<<24>>24==0){r19=HEAP8[HEAP32[r9>>2]+r16|0];r20=r19<<24>>24;r21=HEAP8[HEAP32[r10>>2]+r16|0]<<24>>24;r22=(r17+(r16*24&-1)|0)>>2;r23=HEAP32[r22];if((r21+r20|0)==(r23|0)){HEAP8[r18]=1;r24=r15;break}r25=HEAP8[HEAP32[r11>>2]+r16|0];r26=r25<<24>>24;if(r25<<24>>24<0){r24=r15;break}if(r25<<24>>24<r19<<24>>24){r2=745;break L1031}if(r25<<24>>24==r19<<24>>24){r19=HEAP32[r3];r25=HEAP32[r19>>2];r27=HEAP32[r25+4>>2];r28=r27+(r16*24&-1)|0;do{if((HEAP32[r28>>2]|0)>0){r29=r27+(r16*24&-1)+4|0;r30=r25+12|0;r31=r19+8|0;r32=0;r33=0;while(1){r34=HEAP32[HEAP32[r29>>2]+(r33<<2)>>2]-HEAP32[r30>>2]>>4;do{if(HEAP8[HEAP32[r31>>2]+r34|0]<<24>>24==1){if((_solver_set_line(r1,r34,2)|0)==1){r35=1;break}___assert_func(66812,1270,70708,68572);r35=1}else{r35=r32}}while(0);r34=r33+1|0;if((r34|0)<(HEAP32[r28>>2]|0)){r32=r35;r33=r34}else{break}}if((r35|0)==0){r36=r15;break}r36=(r15|0)<0?r15:0}else{r36=r15}}while(0);HEAP8[HEAP32[r8]+r16|0]=1;r24=r36;break}r28=r23-r26|0;if((r28|0)<(r21|0)){r2=757;break L1031}if((r28|0)==(r21|0)){r19=HEAP32[r3];r25=HEAP32[r19>>2];r27=HEAP32[r25+4>>2];r33=r27+(r16*24&-1)|0;do{if((HEAP32[r33>>2]|0)>0){r32=r27+(r16*24&-1)+4|0;r31=r25+12|0;r30=r19+8|0;r29=0;r34=0;while(1){r37=HEAP32[HEAP32[r32>>2]+(r34<<2)>>2]-HEAP32[r31>>2]>>4;do{if(HEAP8[HEAP32[r30>>2]+r37|0]<<24>>24==1){if((_solver_set_line(r1,r37,0)|0)==1){r38=1;break}___assert_func(66812,1270,70708,68572);r38=1}else{r38=r29}}while(0);r37=r34+1|0;if((r37|0)<(HEAP32[r33>>2]|0)){r29=r38;r34=r37}else{break}}if((r38|0)==0){r39=r15;break}r39=(r15|0)<0?r15:0}else{r39=r15}}while(0);HEAP8[HEAP32[r8]+r16|0]=1;r24=r39;break}if((r28|0)!=(r21+1|0)){r24=r15;break}if(!((r23-r20-r21|0)>2&(r23|0)>0)){r24=r15;break}r33=r17+(r16*24&-1)+4|0;r19=HEAP32[r12];r25=0;r27=r23;r26=r19,r34=r26>>2;r29=r19;L1071:while(1){r19=HEAP32[r33>>2];r30=r26;r40=HEAP32[r19+(r25<<2)>>2]-r30>>4;r31=r25+1|0;r41=HEAP32[r19+(((r31|0)<(r27|0)?r31:0)<<2)>>2]-r30>>4;r30=HEAP32[(r40<<4>>2)+r34];r19=HEAP32[(r41<<4>>2)+r34];do{if((r30|0)==(r19|0)){r2=773}else{r32=HEAP32[((r41<<4)+4>>2)+r34];if((r30|0)==(r32|0)){r2=773;break}r37=HEAP32[((r40<<4)+4>>2)+r34];if((r37|0)==(r19|0)|(r37|0)==(r32|0)){r42=r29}else{___assert_func(66812,2035,70088,68608);r42=HEAP32[r12]}r32=HEAP32[r13>>2];r43=HEAP32[r42+(r40<<4)+4>>2]-r32|0;r44=r42;r45=r32;r46=r42;break}}while(0);if(r2==773){r2=0;r19=HEAP32[r13>>2];r43=r30-r19|0;r44=r26;r45=r19;r46=r29}r19=(r43|0)/20&-1;r47=HEAP32[r14>>2];L1082:do{if(HEAP8[r47+r40|0]<<24>>24==1){if(HEAP8[r47+r41|0]<<24>>24!=1){break}r32=HEAP32[r45+(r19*20&-1)>>2];r37=r45+(r19*20&-1)+4|0;r48=0;while(1){if((r48|0)>=(r32|0)){break L1082}if(HEAP8[(HEAP32[HEAP32[r37>>2]+(r48<<2)>>2]-r44>>4)+r47|0]<<24>>24==0){break L1071}else{r48=r48+1|0}}}}while(0);r19=HEAP32[r22];if((r31|0)<(r19|0)){r25=r31;r27=r19;r26=r44,r34=r26>>2;r29=r46}else{r24=r15;break L1033}}r29=HEAP32[r22];if((r29|0)>0){r49=0;r50=r15;r51=r29;r52=r46;r53=r47}else{r24=r15;break}while(1){r29=HEAP32[HEAP32[r33>>2]+(r49<<2)>>2]-r52>>4;if(HEAP8[r53+r29|0]<<24>>24!=1|(r29|0)==(r40|0)|(r29|0)==(r41|0)){r54=r50;r55=r51}else{if((_solver_set_line(r1,r29,0)|0)==0){___assert_func(66812,2059,70088,68584)}r54=(r50|0)<0?r50:0;r55=HEAP32[r22]}r29=r49+1|0;if((r29|0)>=(r55|0)){r24=r54;break L1033}r49=r29;r50=r54;r51=r55;r52=HEAP32[r12];r53=HEAP32[r14>>2]}}else{r24=r15}}while(0);r17=r16+1|0;if((r17|0)<(HEAP32[r6>>2]|0)){r15=r24;r16=r17}else{r56=r24;break L1029}}if(r2==745){HEAP32[r1+4>>2]=1;r57=0;return r57}else if(r2==757){HEAP32[r1+4>>2]=1;r57=0;return r57}}else{r56=4}}while(0);r24=r5+16|0;if((HEAP32[r24>>2]|0)<=0){r57=r56;return r57}r6=(r1+32|0)>>2;r53=r5+20|0;r5=r1+16|0;r52=r1+20|0;r55=r56;r56=0;L1109:while(1){r51=HEAP32[r6];r54=r51+r56|0;do{if(HEAP8[r54]<<24>>24==0){r50=HEAP8[HEAP32[r5>>2]+r56|0];r49=HEAP8[HEAP32[r52>>2]+r56|0]<<24>>24;r41=HEAP32[HEAP32[r53>>2]+(r56*20&-1)>>2]-(r50<<24>>24)|0;r40=r41-r49|0;if(r50<<24>>24==2){if((r40|0)>0){r47=HEAP32[r3];r46=HEAP32[r47>>2];r44=HEAP32[r46+20>>2];r45=r44+(r56*20&-1)|0;if((HEAP32[r45>>2]|0)>0){r43=r44+(r56*20&-1)+4|0;r44=r46+12|0;r46=r47+8|0;r47=0;while(1){r42=HEAP32[HEAP32[r43>>2]+(r47<<2)>>2]-HEAP32[r44>>2]>>4;do{if(HEAP8[HEAP32[r46>>2]+r42|0]<<24>>24==1){if((_solver_set_line(r1,r42,2)|0)==1){break}___assert_func(66812,1243,70768,68572)}}while(0);r42=r47+1|0;if((r42|0)<(HEAP32[r45>>2]|0)){r47=r42}else{break}}r58=HEAP32[r6]}else{r58=r51}r59=(r55|0)<0?r55:0;r60=r58}else{r59=r55;r60=r51}HEAP8[r60+r56|0]=1;r61=r59;break}else if(r50<<24>>24==1){if((r41|0)==(r49|0)){r2=805;break L1109}if((r40|0)!=1){r61=r55;break}r47=HEAP32[r3];r45=HEAP32[r47>>2];r46=HEAP32[r45+20>>2];r44=r46+(r56*20&-1)|0;L1131:do{if((HEAP32[r44>>2]|0)>0){r43=r46+(r56*20&-1)+4|0;r42=r45+12|0;r39=r47+8|0;r38=0;while(1){r36=HEAP32[HEAP32[r43>>2]+(r38<<2)>>2]-HEAP32[r42>>2]>>4;do{if(HEAP8[HEAP32[r39>>2]+r36|0]<<24>>24==1){if((_solver_set_line(r1,r36,0)|0)==1){break}___assert_func(66812,1243,70768,68572)}}while(0);r36=r38+1|0;if((r36|0)<(HEAP32[r44>>2]|0)){r38=r36}else{break L1131}}}}while(0);r61=(r55|0)<0?r55:0;break}else if(r50<<24>>24==0){if((r41|0)==(r49|0)){HEAP8[r54]=1;r61=r55;break}if((r40|0)!=1){r61=r55;break}r44=HEAP32[r3];r47=HEAP32[r44>>2];r45=HEAP32[r47+20>>2];r46=r45+(r56*20&-1)|0;if((HEAP32[r46>>2]|0)>0){r38=r45+(r56*20&-1)+4|0;r45=r47+12|0;r47=r44+8|0;r44=0;while(1){r39=HEAP32[HEAP32[r38>>2]+(r44<<2)>>2]-HEAP32[r45>>2]>>4;do{if(HEAP8[HEAP32[r47>>2]+r39|0]<<24>>24==1){if((_solver_set_line(r1,r39,2)|0)==1){break}___assert_func(66812,1243,70768,68572)}}while(0);r39=r44+1|0;if((r39|0)<(HEAP32[r46>>2]|0)){r44=r39}else{break}}r62=HEAP32[r6]}else{r62=r51}HEAP8[r62+r56|0]=1;r61=(r55|0)<0?r55:0;break}else{r2=824;break L1109}}else{r61=r55}}while(0);r51=r56+1|0;if((r51|0)<(HEAP32[r24>>2]|0)){r55=r61;r56=r51}else{r57=r61;r2=828;break}}if(r2==824){HEAP32[r1+4>>2]=1;r57=0;return r57}else if(r2==828){return r57}else if(r2==805){HEAP32[r1+4>>2]=1;r57=0;return r57}}function _dline_deductions(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+1152|0;r4=r3,r5=r4>>2;r6=r3+576,r7=r6>>2;r8=r1|0;r9=HEAP32[r8>>2];r10=HEAP32[r9>>2];r11=r1+44|0;r12=HEAP32[r11>>2];r13=r10|0;do{if((HEAP32[r13>>2]|0)>0){r14=r10+4|0;r15=r9+4|0;r16=r1+36|0;r17=(r10+12|0)>>2;r18=(r9+8|0)>>2;r19=r1+12|0;r20=4;r21=0;L1165:while(1){r22=HEAP32[r14>>2],r23=r22>>2;r24=HEAP32[((r21*24&-1)>>2)+r23];r25=HEAP8[HEAP32[r15>>2]+r21|0];r26=r25<<24>>24;if((r24|0)>=13){___assert_func(66812,2171,70780,68720)}L1170:do{if(HEAP8[HEAP32[r16>>2]+r21|0]<<24>>24!=0|r25<<24>>24<0){r27=r20}else{r28=(r24|0)>0;if(!r28){r27=r20;break}r29=HEAP32[((r21*24&-1)+4>>2)+r23];r30=HEAP32[r17];r31=HEAP32[r18];r32=HEAP32[((r21*24&-1)+8>>2)+r23];r33=0;while(1){r34=HEAP8[(HEAP32[r29+(r33<<2)>>2]-r30>>4)+r31|0];r35=r33+1|0;r36=(r35|0)<(r24|0)?r35:0;r37=r34<<24>>24==2;HEAP32[((r36<<2)+(r33*48&-1)>>2)+r5]=r37&1^1;r38=r34<<24>>24==0;r34=r38&1;HEAP32[((r36<<2)+(r33*48&-1)>>2)+r7]=r34;r39=HEAP32[r29+(r36<<2)>>2];r40=r39-r30|0;r41=(r40>>3)+((HEAP32[r39>>2]|0)==(HEAP32[r32+(r36<<2)>>2]|0)&1)|0;r39=HEAP8[(r40>>4)+r31|0];r40=r36+1|0;r36=(r40|0)<(r24|0)?r40:0;r40=((r39<<24>>24==2)<<31>>31)+(r37?1:2)|0;if((r40|0)==2){r42=(HEAP8[r12+r41|0]&2)<<24>>24==0?2:1}else{r42=r40}HEAP32[((r36<<2)+(r33*48&-1)>>2)+r5]=r42;r40=r39<<24>>24==0?r38?2:1:r34;if((r40|0)==0){r43=HEAP8[r12+r41|0]&1}else{r43=r40}HEAP32[((r36<<2)+(r33*48&-1)>>2)+r7]=r43;if((r35|0)==(r24|0)){break}else{r33=r35}}L1182:do{if((r24|0)>3){r33=3;while(1){L1185:do{if(r28){r31=0;while(1){r32=r31+r33|0;r30=r31+1|0;r29=r31+2|0;r35=r32-((r32|0)<(r24|0)?0:r24)|0;r32=r30-((r30|0)<(r24|0)?0:r24)|0;r36=r29-((r29|0)<(r24|0)?0:r24)|0;r29=HEAP32[((r35<<2)+(r32*48&-1)>>2)+r5]+HEAP32[((r32<<2)+(r31*48&-1)>>2)+r5]|0;r40=(r35<<2)+r4+(r31*48&-1)|0;HEAP32[r40>>2]=r29;r41=HEAP32[((r35<<2)+(r32*48&-1)>>2)+r7]+HEAP32[((r32<<2)+(r31*48&-1)>>2)+r7]|0;r32=(r35<<2)+r6+(r31*48&-1)|0;HEAP32[r32>>2]=r41;r34=HEAP32[((r35<<2)+(r36*48&-1)>>2)+r5]+HEAP32[((r36<<2)+(r31*48&-1)>>2)+r5]|0;HEAP32[r40>>2]=(r29|0)<(r34|0)?r29:r34;r34=HEAP32[((r35<<2)+(r36*48&-1)>>2)+r7]+HEAP32[((r36<<2)+(r31*48&-1)>>2)+r7]|0;HEAP32[r32>>2]=(r41|0)>(r34|0)?r41:r34;if((r30|0)==(r24|0)){break L1185}else{r31=r30}}}}while(0);r31=r33+1|0;if((r31|0)==(r24|0)){break L1182}else{r33=r31}}}}while(0);if(!r28){r27=r20;break}r33=r22+(r21*24&-1)+4|0;r31=r26-1|0;r30=r22+(r21*24&-1)+8|0;r34=r26-2|0;r41=0;r32=r20;while(1){r36=HEAP32[HEAP32[r33>>2]+(r41<<2)>>2]-HEAP32[r17]>>4;r35=r41+1|0;do{if(HEAP8[HEAP32[r18]+r36|0]<<24>>24==1){r29=(r35|0)<(r24|0)?r35:0;r40=HEAP32[((r41<<2)+(r29*48&-1)>>2)+r7];if((r40|0)>(r26|0)){r2=853;break L1165}if((r40|0)==(r26|0)){_solver_set_line(r1,r36,2);r44=(r32|0)<0?r32:0}else{r44=r32}r40=HEAP32[((r41<<2)+(r29*48&-1)>>2)+r5];if((r40|0)<(r31|0)){r2=857;break L1165}if((r40|0)==(r31|0)){_solver_set_line(r1,r36,0);r45=(r44|0)<0?r44:0}else{r45=r44}if((HEAP32[r19>>2]|0)<=1){r46=r45;break}r40=HEAP32[HEAP32[r33>>2]+(r29<<2)>>2];r38=r40-HEAP32[r17]|0;if(HEAP8[(r38>>4)+HEAP32[r18]|0]<<24>>24!=1){r46=r45;break}r39=(r38>>3)+((HEAP32[r40>>2]|0)==(HEAP32[HEAP32[r30>>2]+(r29<<2)>>2]|0)&1)|0;r40=r29+1|0;r29=(r40|0)<(r24|0)?r40:0;do{if((HEAP32[((r41<<2)+(r29*48&-1)>>2)+r7]|0)>(r34|0)){r40=r12+r39|0;r38=HEAP8[r40];if((r38&2)<<24>>24!=0){r47=r45;break}HEAP8[r40]=r38|2;r47=(r45|0)<1?r45:1}else{r47=r45}}while(0);if((HEAP32[((r41<<2)+(r29*48&-1)>>2)+r5]|0)>=(r26|0)){r46=r47;break}r38=r12+r39|0;r40=HEAP8[r38];if((r40&1)<<24>>24!=0){r46=r47;break}HEAP8[r38]=r40|1;r46=(r47|0)<1?r47:1}else{r46=r32}}while(0);if((r35|0)<(r24|0)){r41=r35;r32=r46}else{r27=r46;break L1170}}}}while(0);r24=r21+1|0;if((r24|0)<(HEAP32[r13>>2]|0)){r20=r27;r21=r24}else{r2=870;break}}if(r2==857){HEAP32[r1+4>>2]=1;r48=0;STACKTOP=r3;return r48}else if(r2==870){if((r27|0)<1){r48=r27}else{r49=r27;break}STACKTOP=r3;return r48}else if(r2==853){HEAP32[r1+4>>2]=1;r48=0;STACKTOP=r3;return r48}}else{r49=4}}while(0);r2=r10+16|0;r27=HEAP32[r2>>2];if((r27|0)<=0){r48=r49;STACKTOP=r3;return r48}r13=r10+20|0;r46=r1+32|0;r47=r1+16|0;r5=r1+20|0;r45=(r10+12|0)>>2;r10=r9+8|0;r9=r1+12|0;r7=r49;r49=0;r44=r27;while(1){r27=HEAP32[r13>>2];r6=r27+(r49*20&-1)|0;r4=r6|0;r43=HEAP32[r4>>2];do{if(HEAP8[HEAP32[r46>>2]+r49|0]<<24>>24==0){r42=HEAP8[HEAP32[r47>>2]+r49|0];r21=r43-(r42<<24>>24)-(HEAP8[HEAP32[r5>>2]+r49|0]<<24>>24)|0;if((r43|0)<=0){r50=r7;r51=r44;break}r20=(r27+(r49*20&-1)+4|0)>>2;r18=r42<<24>>24==0;r17=(r21|0)==2;r19=r18&r17;r16=r42<<24>>24==1;r42=r43-1|0;r15=0;r14=r7;while(1){r24=r15+1|0;r26=(r24|0)<(r43|0)?r24:0;r22=HEAP32[r20];r23=HEAP32[r22+(r15<<2)>>2];r25=HEAP32[r45];r32=r23-r25|0;r41=(r32>>3)+((HEAP32[r23>>2]|0)==(r6|0)&1)|0;r23=r32>>4;r32=HEAP32[r22+(r26<<2)>>2]-r25>>4;r25=HEAP32[r10>>2];r22=HEAP8[r25+r23|0];r34=HEAP8[r25+r32|0];r25=r22<<24>>24==2;r30=r34<<24>>24==2;do{if(r25|r30){r33=r12+r41|0;r31=HEAP8[r33];if((r31&2)<<24>>24!=0){r52=r14;break}HEAP8[r33]=r31|2;r52=(r14|0)<1?r14:1}else{r52=r14}}while(0);r31=r22<<24>>24==0;r33=r34<<24>>24==0;r28=r12+r41|0;r36=HEAP8[r28];do{if(r31|r33){if((r36&1)<<24>>24!=0){r53=r52;r54=r36;break}r40=r36|1;HEAP8[r28]=r40;r53=(r52|0)<1?r52:1;r54=r40}else{r53=r52;r54=r36}}while(0);r36=r12+r41|0;do{if((r54&2)<<24>>24==0){r55=r53}else{if(r31&r34<<24>>24==1){_solver_set_line(r1,r32,2);r56=(r53|0)<0?r53:0}else{r56=r53}if(!(r33&r22<<24>>24==1)){r55=r56;break}_solver_set_line(r1,r23,2);r55=(r56|0)<0?r56:0}}while(0);do{if((HEAP8[r36]&1)<<24>>24==0){r57=r55}else{if(r25&r34<<24>>24==1){_solver_set_line(r1,r32,0);r58=(r55|0)<0?r55:0}else{r58=r55}if(!(r30&r22<<24>>24==1)){r57=r58;break}_solver_set_line(r1,r23,0);r57=(r58|0)<0?r58:0}}while(0);L1253:do{if(r22<<24>>24==1&r34<<24>>24==1){do{if(r19){r30=HEAP8[r36];if((r30&2)<<24>>24==0){r59=r57;r60=r30}else{_solver_set_line(r1,r23,2);_solver_set_line(r1,r32,2);r59=(r57|0)<0?r57:0;r60=HEAP8[r36]}if((r60&1)<<24>>24==0){r61=r59;break}_solver_set_line(r1,r23,0);_solver_set_line(r1,r32,0);r61=(r59|0)<0?r59:0}else{r61=r57}}while(0);do{if(r16){r35=HEAP8[r36];if((r35&2)<<24>>24==0){r30=r35|2;HEAP8[r36]=r30;r62=(r61|0)<1?r61:1;r63=r30}else{r62=r61;r63=r35}if(!r17){r64=r62;break}if((r63&1)<<24>>24!=0){r64=r62;break}HEAP8[r36]=r63|1;r64=(r62|0)<1?r62:1}else{r64=r61}}while(0);if((HEAP32[r9>>2]|0)<=1){r65=r64;break}if((HEAP8[r36]&1)<<24>>24==0){r65=r64;break}r35=r15-1|0;r30=(r15|0)==0;r25=(r15|0)==(r42|0);r33=r64;r31=0;while(1){do{if((r31|0)==(r15|0)|(r31|0)==(r24|0)|(r31|0)==(r35|0)){r66=r33}else{if(r30&(r31|0)==(r42|0)|r25&(r31|0)==0){r66=r33;break}r41=HEAP32[HEAP32[r20]+(r31<<2)>>2];r28=(r41-HEAP32[r45]>>3)+r12+((HEAP32[r41>>2]|0)==(r6|0)&1)|0;r41=HEAP8[r28];if((r41&2)<<24>>24!=0){r66=r33;break}HEAP8[r28]=r41|2;r66=(r33|0)<1?r33:1}}while(0);r39=r31+1|0;if((r39|0)==(r43|0)){break}else{r33=r66;r31=r39}}if(!r18){r65=r66;break}if((HEAP8[r36]&2)<<24>>24==0){r65=r66;break}if((r21|0)==3){r31=r66;r33=0;while(1){do{if((r33|0)==(r15|0)|(r33|0)==(r26|0)){r67=r31}else{r25=HEAP32[HEAP32[r20]+(r33<<2)>>2]-HEAP32[r45]>>4;if(HEAP8[HEAP32[r10>>2]+r25|0]<<24>>24!=1){r67=r31;break}_solver_set_line(r1,r25,0);r67=(r31|0)<0?r31:0}}while(0);r25=r33+1|0;if((r25|0)==(r43|0)){r65=r67;break L1253}else{r31=r67;r33=r25}}}else if((r21|0)!=4){r65=r66;break}r33=HEAP32[r8>>2];r31=HEAP32[r4>>2];if((r31|0)<=0){r65=r66;break}r25=r15-1|0;r30=r31-1|0;r35=(r15|0)==0;r39=HEAP32[r33>>2]+12|0;r29=r33+8|0;r33=(r30|0)==(r15|0);r41=0;L1291:while(1){do{if(!((r41|0)==(r15|0)|(r41|0)==(r24|0)|(r41|0)==(r25|0))){if(r33&(r41|0)==0|(r41|0)==(r30|0)&r35){break}r28=r41+1|0;r40=HEAP32[r20];r68=HEAP32[r40+(r41<<2)>>2];r38=HEAP32[r39>>2];r69=r68-r38|0;r37=HEAP32[r29>>2];if(HEAP8[(r69>>4)+r37|0]<<24>>24!=1){break}if(HEAP8[(HEAP32[r40+(((r28|0)==(r31|0)?0:r28)<<2)>>2]-r38>>4)+r37|0]<<24>>24==1){break L1291}}}while(0);r37=r41+1|0;if((r37|0)<(r31|0)){r41=r37}else{r65=r66;break L1253}}r41=(r69>>3)+HEAP32[r11>>2]+((HEAP32[r68>>2]|0)==(r6|0)&1)|0;r31=HEAP8[r41];if((r31&1)<<24>>24!=0){r65=r66;break}HEAP8[r41]=r31|1;r65=(r66|0)<1?r66:1}else{r65=r57}}while(0);if((r24|0)==(r43|0)){break}else{r15=r24;r14=r65}}r50=r65;r51=HEAP32[r2>>2]}else{r50=r7;r51=r44}}while(0);r43=r49+1|0;if((r43|0)<(r51|0)){r7=r50;r49=r43;r44=r51}else{r48=r50;break}}STACKTOP=r3;return r48}function _linedsf_deductions(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61;r2=r1|0;r3=HEAP32[r2>>2];r4=HEAP32[r3>>2];r5=HEAP32[r1+44>>2];r6=r4|0;r7=HEAP32[r6>>2];L1305:do{if((r7|0)>0){r8=r1+36|0;r9=r3+4|0;r10=r4+4|0;r11=r1+24|0;r12=r1+28|0;r13=4;r14=0;r15=r7;while(1){do{if(HEAP8[HEAP32[r8>>2]+r14|0]<<24>>24==0){r16=HEAP8[HEAP32[r9>>2]+r14|0];r17=r16<<24>>24;if(r16<<24>>24<0){r18=r13;r19=r15;break}r16=HEAP32[HEAP32[r10>>2]+(r14*24&-1)>>2];if(((HEAP8[HEAP32[r11>>2]+r14|0]<<24>>24)+1|0)==(r17|0)){_face_setall_identical(r1,r14,2)}r20=HEAP8[HEAP32[r12>>2]+r14|0]<<24>>24;if((r20+1|0)==(r16-r17|0)){_face_setall_identical(r1,r14,0)}r21=HEAP8[HEAP32[r11>>2]+r14|0]<<24>>24;r22=_parity_deductions(r1,HEAP32[HEAP32[r10>>2]+(r14*24&-1)+4>>2],(r17-r21|0)%2,r16-r20-r21|0);r18=(r13|0)<(r22|0)?r13:r22;r19=HEAP32[r6>>2]}else{r18=r13;r19=r15}}while(0);r22=r14+1|0;if((r22|0)<(r19|0)){r13=r18;r14=r22;r15=r19}else{r23=r18;break L1305}}}else{r23=4}}while(0);r18=r4+16|0;L1320:do{if((HEAP32[r18>>2]|0)>0){r19=r4+20|0;r6=r1+16|0;r7=r1+20|0;r15=r4+12|0;r14=r3+8|0;r13=r1+48|0;r10=r23;r11=0;while(1){r12=HEAP32[r19>>2];r9=r12+(r11*20&-1)|0;r8=HEAP32[r9>>2];r22=r12+(r11*20&-1)+4|0;L1324:do{if((r8|0)>0){r12=0;r21=r10;while(1){r20=HEAP32[r22>>2];r16=HEAP32[r20+(r12<<2)>>2];r17=HEAP32[r15>>2];r24=r16-r17|0;r25=(r24>>3)+((HEAP32[r16>>2]|0)==(r9|0)&1)|0;r16=r24>>4;r26=HEAP32[r14>>2];r27=r12+1|0;do{if(HEAP8[r26+r16|0]<<24>>24==1){r28=HEAP32[r20+(((r27|0)==(r8|0)?0:r27)<<2)>>2]-r17|0;r29=r28>>4;if(HEAP8[r26+r29|0]<<24>>24!=1){r30=r21;break}r31=HEAP32[r13>>2]>>2;if((r24|0)<=-16){___assert_func(66560,110,70752,68748)}r32=HEAP32[(r16<<2>>2)+r31];do{if((r32&2|0)==0){r33=0;r34=r32;while(1){r35=r34&1^r33;r36=r34>>2;r37=HEAP32[(r36<<2>>2)+r31];if((r37&2|0)==0){r33=r35;r34=r37}else{break}}L1337:do{if((r36|0)==(r16|0)){r38=r35;r39=r16}else{r34=r36<<2;r33=r35;r37=r16;r40=r32;while(1){r41=r40>>2;r42=r40&1^r33;HEAP32[(r37<<2>>2)+r31]=r33|r34;if((r41|0)==(r36|0)){r38=r42;r39=r36;break L1337}r33=r42;r37=r41;r40=HEAP32[(r41<<2>>2)+r31]}}}while(0);if((r38|0)==0){r43=r35;r44=r39;break}___assert_func(66560,137,70752,68352);r43=r35;r44=r39}else{r43=0;r44=r16}}while(0);r31=HEAP32[r13>>2]>>2;if((r28|0)<=-16){___assert_func(66560,110,70752,68748)}r32=HEAP32[(r29<<2>>2)+r31];do{if((r32&2|0)==0){r40=0;r37=r32;while(1){r45=r37&1^r40;r46=r37>>2;r33=HEAP32[(r46<<2>>2)+r31];if((r33&2|0)==0){r40=r45;r37=r33}else{break}}L1352:do{if((r46|0)==(r29|0)){r47=r45;r48=r29}else{r37=r46<<2;r40=r45;r33=r29;r34=r32;while(1){r41=r34>>2;r42=r34&1^r40;HEAP32[(r33<<2>>2)+r31]=r40|r37;if((r41|0)==(r46|0)){r47=r42;r48=r46;break L1352}r40=r42;r33=r41;r34=HEAP32[(r41<<2>>2)+r31]}}}while(0);if((r47|0)==0){r49=r45;r50=r48;break}___assert_func(66560,137,70752,68352);r49=r45;r50=r48}else{r49=0;r50=r29}}while(0);r31=r5+r25|0;r32=HEAP8[r31];if((r44|0)!=(r50|0)|(r43|0)==(r49|0)){if((r32&3)<<24>>24!=3){r30=r21;break}if((_merge_lines(r1,r16,r29,1)|0)==0){r30=r21;break}r30=(r21|0)<3?r21:3;break}if((r32&2)<<24>>24==0){r28=r32|2;HEAP8[r31]=r28;r51=(r21|0)<1?r21:1;r52=r28}else{r51=r21;r52=r32}if((r52&1)<<24>>24!=0){r30=r51;break}HEAP8[r31]=r52|1;r30=(r51|0)<1?r51:1}else{r30=r21}}while(0);if((r27|0)==(r8|0)){r53=r30;break L1324}else{r12=r27;r21=r30}}}else{r53=r10}}while(0);r9=HEAP8[HEAP32[r6>>2]+r11|0]<<24>>24;r21=_parity_deductions(r1,HEAP32[r22>>2],(r9|0)%2,r8-r9-(HEAP8[HEAP32[r7>>2]+r11|0]<<24>>24)|0);r9=(r53|0)<(r21|0)?r53:r21;r21=r11+1|0;if((r21|0)<(HEAP32[r18>>2]|0)){r10=r9;r11=r21}else{r54=r9;break L1320}}}else{r54=r23}}while(0);r23=r4+8|0;if((HEAP32[r23>>2]|0)<=0){r55=r54;return r55}r4=r1+48|0;r18=r54;r54=0;while(1){r53=HEAP32[r4>>2]>>2;r30=HEAP32[(r54<<2>>2)+r53];do{if((r30&2|0)==0){r51=0;r52=r30;while(1){r56=r52&1;r57=r56^r51;r58=r52>>2;r49=HEAP32[(r58<<2>>2)+r53];if((r49&2|0)==0){r51=r57;r52=r49}else{break}}L1381:do{if((r58|0)==(r54|0)){r59=r57;r60=r54}else{r52=r58<<2;r8=r57;r22=r54;r49=r30;while(1){r43=r49>>2;r50=r49&1^r8;HEAP32[(r22<<2>>2)+r53]=r8|r52;if((r43|0)==(r58|0)){r59=r50;r60=r58;break L1381}r8=r50;r22=r43;r49=HEAP32[(r43<<2>>2)+r53]}}}while(0);if((r59|0)!=0){___assert_func(66560,137,70752,68352)}if((r60|0)==(r54|0)){r61=r18;break}r49=HEAP32[HEAP32[r2>>2]+8>>2];r22=HEAP8[r49+r60|0];r8=r22<<24>>24;if(r22<<24>>24!=1){if((_solver_set_line(r1,r54,(r56|0)!=(r51|0)?2-r8|0:r8)|0)==0){r61=r18;break}r61=(r18|0)<0?r18:0;break}r8=HEAP8[r49+r54|0];r49=r8<<24>>24;if(r8<<24>>24==1){r61=r18;break}if((_solver_set_line(r1,r60,(r56|0)!=(r51|0)?2-r49|0:r49)|0)==0){r61=r18;break}r61=(r18|0)<0?r18:0}else{r61=r18}}while(0);r53=r54+1|0;if((r53|0)<(HEAP32[r23>>2]|0)){r18=r61;r54=r53}else{r55=r61;break}}return r55}function _loop_deductions(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89;r2=0;r3=r1|0;r4=HEAP32[r3>>2];r5=HEAP32[r4>>2];r6=(r5+16|0)>>2;r7=HEAP32[r6];r8=(r5+8|0)>>2;r9=HEAP32[r8];L1400:do{if((r9|0)>0){r10=r4+8|0;r11=(r1+40|0)>>2;r12=r1+8|0;r13=0;r14=0;r15=r9;while(1){if(HEAP8[HEAP32[r10>>2]+r13|0]<<24>>24==0){r16=HEAP32[HEAP32[r3>>2]>>2];r17=HEAP32[r16+12>>2];r18=HEAP32[r16+20>>2];r16=HEAP32[r17+(r13<<4)>>2]-r18|0;r19=(r16|0)/20&-1;r20=HEAP32[r17+(r13<<4)+4>>2]-r18|0;r18=(r20|0)/20&-1;r17=HEAP32[r11];if((r16|0)<=-20){___assert_func(66560,110,70752,68748)}r16=(r19<<2)+r17|0;r21=HEAP32[r16>>2];do{if((r21&2|0)==0){r22=0;r23=r21;while(1){r24=r23&1^r22;r25=r23>>2;r26=HEAP32[r17+(r25<<2)>>2];if((r26&2|0)==0){r22=r24;r23=r26}else{break}}L1413:do{if((r25|0)==(r19|0)){r27=r24;r28=r19}else{r23=r25<<2;r22=r21>>2;r26=r24^r21&1;HEAP32[r16>>2]=r24|r23;if((r22|0)==(r25|0)){r27=r26;r28=r25;break}else{r29=r22;r30=r26}while(1){r26=(r29<<2)+r17|0;r22=HEAP32[r26>>2];r31=r22>>2;r32=r22&1^r30;HEAP32[r26>>2]=r30|r23;if((r31|0)==(r25|0)){r27=r32;r28=r25;break L1413}else{r29=r31;r30=r32}}}}while(0);if((r27|0)==0){r33=r28;break}___assert_func(66560,137,70752,68352);r33=r28}else{r33=r19}}while(0);r19=HEAP32[r11];if((r20|0)<=-20){___assert_func(66560,110,70752,68748)}r17=(r18<<2)+r19|0;r16=HEAP32[r17>>2];do{if((r16&2|0)==0){r21=0;r23=r16;while(1){r34=r23&1^r21;r35=r23>>2;r32=HEAP32[r19+(r35<<2)>>2];if((r32&2|0)==0){r21=r34;r23=r32}else{break}}L1427:do{if((r35|0)==(r18|0)){r36=r34;r37=r18}else{r23=r35<<2;r21=r16>>2;r32=r34^r16&1;HEAP32[r17>>2]=r34|r23;if((r21|0)==(r35|0)){r36=r32;r37=r35;break}else{r38=r21;r39=r32}while(1){r32=(r38<<2)+r19|0;r21=HEAP32[r32>>2];r31=r21>>2;r26=r21&1^r39;HEAP32[r32>>2]=r39|r23;if((r31|0)==(r35|0)){r36=r26;r37=r35;break L1427}else{r38=r31;r39=r26}}}}while(0);if((r36|0)==0){r40=r37;break}___assert_func(66560,137,70752,68352);r40=r37}else{r40=r18}}while(0);if((r33|0)!=(r40|0)){r18=HEAP32[r12>>2];r19=HEAP32[r18+(r40<<2)>>2]+HEAP32[r18+(r33<<2)>>2]|0;_edsf_merge(HEAP32[r11],r33,r40,0);r18=HEAP32[r11];if((r33|0)<=-1){___assert_func(66560,110,70752,68748)}r17=(r33<<2)+r18|0;r16=HEAP32[r17>>2];do{if((r16&2|0)==0){r20=0;r23=r16;while(1){r41=r23&1^r20;r42=r23>>2;r26=HEAP32[r18+(r42<<2)>>2];if((r26&2|0)==0){r20=r41;r23=r26}else{break}}L1443:do{if((r42|0)==(r33|0)){r43=r41;r44=r33}else{r23=r42<<2;r20=r16>>2;r26=r41^r16&1;HEAP32[r17>>2]=r41|r23;if((r20|0)==(r42|0)){r43=r26;r44=r42;break}else{r45=r20;r46=r26}while(1){r26=(r45<<2)+r18|0;r20=HEAP32[r26>>2];r31=r20>>2;r32=r20&1^r46;HEAP32[r26>>2]=r46|r23;if((r31|0)==(r42|0)){r43=r32;r44=r42;break L1443}else{r45=r31;r46=r32}}}}while(0);if((r43|0)==0){r47=r44;break}___assert_func(66560,137,70752,68352);r47=r44}else{r47=r33}}while(0);HEAP32[HEAP32[r12>>2]+(r47<<2)>>2]=r19}r48=r14+1|0;r49=HEAP32[r8]}else{r48=r14;r49=r15}r18=r13+1|0;if((r18|0)<(r49|0)){r13=r18;r14=r48;r15=r49}else{r50=r48;break L1400}}}else{r50=0}}while(0);r48=HEAP32[r5>>2];L1453:do{if((r48|0)>0){r49=HEAP32[r4+4>>2];r47=r1+24|0;r33=0;r44=0;r43=0;r46=0;while(1){r45=HEAP8[r49+r33|0];r42=r45<<24>>24;if(r45<<24>>24>-1){r41=HEAP8[HEAP32[r47>>2]+r33|0];if(r41<<24>>24==r45<<24>>24){r51=r43+1|0;r52=r44}else{r51=r43;r52=((r41<<24>>24|0)==(r42-1|0)&1)+r44|0}r53=r46+1|0;r54=r51;r55=r52}else{r53=r46;r54=r43;r55=r44}r42=r33+1|0;if((r42|0)<(r48|0)){r33=r42;r44=r55;r43=r54;r46=r53}else{r56=r55;r57=r54;r58=r53;break L1453}}}else{r56=0;r57=0;r58=0}}while(0);L1465:do{if((HEAP32[r6]|0)>0){r53=r1+40|0;r54=r1+8|0;r55=0;r48=r7;while(1){r52=HEAP32[r53>>2];r51=(r55<<2)+r52|0;r46=HEAP32[r51>>2];do{if((r46&2|0)==0){r43=0;r44=r46;while(1){r59=r44&1^r43;r60=r44>>2;r33=HEAP32[r52+(r60<<2)>>2];if((r33&2|0)==0){r43=r59;r44=r33}else{break}}L1473:do{if((r60|0)==(r55|0)){r61=r59;r62=r55}else{r44=r60<<2;r43=r46>>2;r33=r59^r46&1;HEAP32[r51>>2]=r59|r44;if((r43|0)==(r60|0)){r61=r33;r62=r60;break}else{r63=r43;r64=r33}while(1){r33=(r63<<2)+r52|0;r43=HEAP32[r33>>2];r47=r43>>2;r49=r64^r43&1;HEAP32[r33>>2]=r64|r44;if((r47|0)==(r60|0)){r61=r49;r62=r60;break L1473}else{r63=r47;r64=r49}}}}while(0);if((r61|0)==0){r65=r62;break}___assert_func(66560,137,70752,68352);r65=r62}else{r65=r55}}while(0);r52=HEAP32[HEAP32[r54>>2]+(r65<<2)>>2];if((r52|0)>1){r66=(r48|0)<(r52|0)?r48:r52}else{r66=r48}r52=r55+1|0;if((r52|0)<(HEAP32[r6]|0)){r55=r52;r48=r66}else{r67=r66;break L1465}}}else{r67=r7}}while(0);r7=(r1+4|0)>>2;if((HEAP32[r7]|0)!=3){___assert_func(66812,2615,70328,69116)}if((r57|0)==(r58|0)&(r67|0)==(r50|0)){HEAP32[r7]=0;r68=1;r69=(r68|0)!=0;r70=r69?0:4;return r70}if((HEAP32[r8]|0)<=0){r68=0;r69=(r68|0)!=0;r70=r69?0:4;return r70}r67=r5+12|0;r66=r5+20|0;r6=r4+8|0;r65=r1+40|0;r62=r1+8|0;r61=r50+1|0;r50=(r57+r56|0)==(r58|0)?0:2;r58=r5+4|0;r5=r4+4|0;r4=r1+24|0;r57=0;r64=0;L1494:while(1){r63=HEAP32[r67>>2]>>2;r60=HEAP32[r66>>2];do{if(HEAP8[HEAP32[r6>>2]+r57|0]<<24>>24==1){r59=HEAP32[((r57<<4)+4>>2)+r63]-r60|0;r48=HEAP32[(r57<<4>>2)+r63]-r60|0;r55=(r59|0)/20&-1;r54=(r48|0)/20&-1;r53=HEAP32[r65>>2];if((r48|0)<=-20){___assert_func(66560,110,70752,68748)}r48=(r54<<2)+r53|0;r52=HEAP32[r48>>2];do{if((r52&2|0)==0){r51=0;r46=r52;while(1){r71=r46&1^r51;r72=r46>>2;r19=HEAP32[r53+(r72<<2)>>2];if((r19&2|0)==0){r51=r71;r46=r19}else{break}}L1505:do{if((r72|0)==(r54|0)){r73=r71;r74=r54}else{r46=r72<<2;r51=r52>>2;r19=r71^r52&1;HEAP32[r48>>2]=r71|r46;if((r51|0)==(r72|0)){r73=r19;r74=r72;break}else{r75=r51;r76=r19}while(1){r19=(r75<<2)+r53|0;r51=HEAP32[r19>>2];r44=r51>>2;r49=r76^r51&1;HEAP32[r19>>2]=r76|r46;if((r44|0)==(r72|0)){r73=r49;r74=r72;break L1505}else{r75=r44;r76=r49}}}}while(0);if((r73|0)==0){r77=r74;break}___assert_func(66560,137,70752,68352);r77=r74}else{r77=r54}}while(0);r54=HEAP32[r65>>2];if((r59|0)<=-20){___assert_func(66560,110,70752,68748)}r53=(r55<<2)+r54|0;r48=HEAP32[r53>>2];do{if((r48&2|0)==0){r52=0;r46=r48;while(1){r78=r46&1^r52;r79=r46>>2;r49=HEAP32[r54+(r79<<2)>>2];if((r49&2|0)==0){r52=r78;r46=r49}else{break}}L1519:do{if((r79|0)==(r55|0)){r80=r78;r81=r55}else{r46=r79<<2;r52=r48>>2;r49=r78^r48&1;HEAP32[r53>>2]=r78|r46;if((r52|0)==(r79|0)){r80=r49;r81=r79;break}else{r82=r52;r83=r49}while(1){r49=(r82<<2)+r54|0;r52=HEAP32[r49>>2];r44=r52>>2;r19=r83^r52&1;HEAP32[r49>>2]=r83|r46;if((r44|0)==(r79|0)){r80=r19;r81=r79;break L1519}else{r82=r44;r83=r19}}}}while(0);if((r80|0)==0){r84=r81;break}___assert_func(66560,137,70752,68352);r84=r81}else{r84=r55}}while(0);if((r77|0)!=(r84|0)){r85=r64;break}if((HEAP32[HEAP32[r62>>2]+(r77<<2)>>2]|0)==(r61|0)){r55=HEAP32[((r57<<4)+8>>2)+r63];do{if((r55|0)==0){r86=0}else{r54=(r55-HEAP32[r58>>2]|0)/24&-1;r53=HEAP8[HEAP32[r5>>2]+r54|0];if(r53<<24>>24<=-1){r86=0;break}r86=(HEAP8[HEAP32[r4>>2]+r54|0]<<24>>24|0)==((r53<<24>>24)-1|0)&1}}while(0);r55=HEAP32[((r57<<4)+12>>2)+r63];do{if((r55|0)==0){r87=r86}else{r53=(r55-HEAP32[r58>>2]|0)/24&-1;r54=HEAP8[HEAP32[r5>>2]+r53|0];if(r54<<24>>24<=-1){r87=r86;break}r87=((HEAP8[HEAP32[r4>>2]+r53|0]<<24>>24|0)==((r54<<24>>24)-1|0)&1)+r86|0}}while(0);r88=(r56|0)==(r87|0)?r50:2}else{r88=2}r89=_solver_set_line(r1,r57,r88);if((r89|0)!=1){___assert_func(66812,2709,70328,69056)}if((r88|0)==0){break L1494}else{r85=r89}}else{r85=r64}}while(0);r63=r57+1|0;if((r63|0)<(HEAP32[r8]|0)){r57=r63;r64=r85}else{r68=r85;r2=1099;break}}if(r2==1099){r69=(r68|0)!=0;r70=r69?0:4;return r70}HEAP32[r7]=2;r68=r89;r69=(r68|0)!=0;r70=r69?0:4;return r70}function _solver_set_line(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10;r4=r1>>2;r5=HEAP32[r4];if((r3|0)==1){___assert_func(66812,1074,70144,68944)}r6=HEAP32[r5+8>>2]+r2|0;if((HEAP8[r6]<<24>>24|0)==(r3|0)){r7=0;return r7}HEAP8[r6]=r3&255;r6=HEAP32[r5>>2],r5=r6>>2;r8=HEAP32[r5+3]>>2;r9=(r6+20|0)>>2;r6=(HEAP32[(r2<<4>>2)+r8]-HEAP32[r9]|0)/20&-1;if((r3|0)==0){r3=r1+16|0;r10=HEAP32[r3>>2]+r6|0;HEAP8[r10]=HEAP8[r10]+1&255;r10=HEAP32[r3>>2]+((HEAP32[((r2<<4)+4>>2)+r8]-HEAP32[r9]|0)/20&-1)|0;HEAP8[r10]=HEAP8[r10]+1&255;r10=HEAP32[((r2<<4)+8>>2)+r8];if((r10|0)!=0){r3=HEAP32[r4+6]+((r10-HEAP32[r5+1]|0)/24&-1)|0;HEAP8[r3]=HEAP8[r3]+1&255}r3=HEAP32[((r2<<4)+12>>2)+r8];if((r3|0)==0){r7=1;return r7}r10=HEAP32[r4+6]+((r3-HEAP32[r5+1]|0)/24&-1)|0;HEAP8[r10]=HEAP8[r10]+1&255;r7=1;return r7}else{r10=r1+20|0;r1=HEAP32[r10>>2]+r6|0;HEAP8[r1]=HEAP8[r1]+1&255;r1=HEAP32[r10>>2]+((HEAP32[((r2<<4)+4>>2)+r8]-HEAP32[r9]|0)/20&-1)|0;HEAP8[r1]=HEAP8[r1]+1&255;r1=HEAP32[((r2<<4)+8>>2)+r8];if((r1|0)!=0){r9=HEAP32[r4+7]+((r1-HEAP32[r5+1]|0)/24&-1)|0;HEAP8[r9]=HEAP8[r9]+1&255}r9=HEAP32[((r2<<4)+12>>2)+r8];if((r9|0)==0){r7=1;return r7}r8=HEAP32[r4+7]+((r9-HEAP32[r5+1]|0)/24&-1)|0;HEAP8[r8]=HEAP8[r8]+1&255;r7=1;return r7}}function _face_setall_identical(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41;r4=HEAP32[r1>>2];r5=HEAP32[r4>>2];r6=HEAP32[r5+4>>2];r7=HEAP32[r6+(r2*24&-1)>>2];if((r7|0)<=0){return}r8=r6+(r2*24&-1)+4|0;r2=r5+12|0;r5=r4+8|0;r4=r1+48|0;r6=0;while(1){r9=HEAP32[r8>>2];r10=HEAP32[r2>>2];r11=HEAP32[r9+(r6<<2)>>2]-r10|0;r12=r11>>4;r13=HEAP32[r5>>2];r14=r6+1|0;L1576:do{if(HEAP8[r13+r12|0]<<24>>24==1&(r14|0)<(r7|0)){r15=(r11|0)>-16;r16=r14;r17=r9;r18=r10;r19=r13;while(1){r20=HEAP32[r17+(r16<<2)>>2]-r18|0;r21=r20>>4;do{if(HEAP8[r19+r21|0]<<24>>24==1){r22=HEAP32[r4>>2]>>2;if(!r15){___assert_func(66560,110,70752,68748)}r23=HEAP32[(r12<<2>>2)+r22];do{if((r23&2|0)==0){r24=0;r25=r23;while(1){r26=r25&1^r24;r27=r25>>2;r28=HEAP32[(r27<<2>>2)+r22];if((r28&2|0)==0){r24=r26;r25=r28}else{break}}L1589:do{if((r27|0)==(r12|0)){r29=r26;r30=r12}else{r25=r27<<2;r24=r26;r28=r12;r31=r23;while(1){r32=r31>>2;r33=r31&1^r24;HEAP32[(r28<<2>>2)+r22]=r24|r25;if((r32|0)==(r27|0)){r29=r33;r30=r27;break L1589}r24=r33;r28=r32;r31=HEAP32[(r32<<2>>2)+r22]}}}while(0);if((r29|0)==0){r34=r26;r35=r30;break}___assert_func(66560,137,70752,68352);r34=r26;r35=r30}else{r34=0;r35=r12}}while(0);r22=HEAP32[r4>>2]>>2;if((r20|0)<=-16){___assert_func(66560,110,70752,68748)}r23=HEAP32[(r21<<2>>2)+r22];do{if((r23&2|0)==0){r31=0;r28=r23;while(1){r36=r28&1^r31;r37=r28>>2;r24=HEAP32[(r37<<2>>2)+r22];if((r24&2|0)==0){r31=r36;r28=r24}else{break}}L1604:do{if((r37|0)==(r21|0)){r38=r36;r39=r21}else{r28=r37<<2;r31=r36;r24=r21;r25=r23;while(1){r32=r25>>2;r33=r25&1^r31;HEAP32[(r24<<2>>2)+r22]=r31|r28;if((r32|0)==(r37|0)){r38=r33;r39=r37;break L1604}r31=r33;r24=r32;r25=HEAP32[(r32<<2>>2)+r22]}}}while(0);if((r38|0)==0){r40=r36;r41=r39;break}___assert_func(66560,137,70752,68352);r40=r36;r41=r39}else{r40=0;r41=r21}}while(0);if(!((r35|0)==(r41|0)&(r34|0)==(r40|0))){break}_solver_set_line(r1,r12,r3);_solver_set_line(r1,r21,r3)}}while(0);r21=r16+1|0;if((r21|0)==(r7|0)){break L1576}r16=r21;r17=HEAP32[r8>>2];r18=HEAP32[r2>>2];r19=HEAP32[r5>>2]}}}while(0);if((r14|0)==(r7|0)){break}else{r6=r14}}return}function _parity_deductions(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65;r5=STACKTOP;STACKTOP=STACKTOP+36|0;r6=r5>>2;r7=r5+8>>2;r8=r5+20>>2;r9=HEAP32[r1>>2]>>2;r10=HEAP32[r1+48>>2]>>2;if((r4|0)==4){r11=HEAP32[HEAP32[r9]+12>>2];r12=HEAP32[r9+2];r13=0;r14=r2;while(1){r15=HEAP32[r14>>2]-r11>>4;if(HEAP8[r12+r15|0]<<24>>24==1){HEAP32[(r13<<2>>2)+r8]=r15;r16=r13+1|0}else{r16=r13}if((r16|0)<4){r13=r16;r14=r14+4|0}else{break}}r14=HEAP32[r8];if((r14|0)<=-1){___assert_func(66560,110,70752,68748)}r16=HEAP32[(r14<<2>>2)+r10];do{if((r16&2|0)==0){r13=0;r12=r16;while(1){r17=r12&1^r13;r18=r12>>2;r11=HEAP32[(r18<<2>>2)+r10];if((r11&2|0)==0){r13=r17;r12=r11}else{break}}L1633:do{if((r18|0)==(r14|0)){r19=r17;r20=r14}else{r12=r18<<2;r13=r17;r11=r14;r15=r16;while(1){r21=r15>>2;r22=r15&1^r13;HEAP32[(r11<<2>>2)+r10]=r13|r12;if((r21|0)==(r18|0)){r19=r22;r20=r18;break L1633}r13=r22;r11=r21;r15=HEAP32[(r21<<2>>2)+r10]}}}while(0);if((r19|0)==0){r23=r17;r24=r20;break}___assert_func(66560,137,70752,68352);r23=r17;r24=r20}else{r23=0;r24=r14}}while(0);r20=HEAP32[r8+1];if((r20|0)<=-1){___assert_func(66560,110,70752,68748)}r17=HEAP32[(r20<<2>>2)+r10];do{if((r17&2|0)==0){r19=0;r18=r17;while(1){r25=r18&1^r19;r26=r18>>2;r16=HEAP32[(r26<<2>>2)+r10];if((r16&2|0)==0){r19=r25;r18=r16}else{break}}L1648:do{if((r26|0)==(r20|0)){r27=r25;r28=r20}else{r18=r26<<2;r19=r25;r16=r20;r15=r17;while(1){r11=r15>>2;r13=r15&1^r19;HEAP32[(r16<<2>>2)+r10]=r19|r18;if((r11|0)==(r26|0)){r27=r13;r28=r26;break L1648}r19=r13;r16=r11;r15=HEAP32[(r11<<2>>2)+r10]}}}while(0);if((r27|0)==0){r29=r25;r30=r28;break}___assert_func(66560,137,70752,68352);r29=r25;r30=r28}else{r29=0;r30=r20}}while(0);r28=HEAP32[r8+2];if((r28|0)<=-1){___assert_func(66560,110,70752,68748)}r25=HEAP32[(r28<<2>>2)+r10];do{if((r25&2|0)==0){r27=0;r26=r25;while(1){r31=r26&1^r27;r32=r26>>2;r17=HEAP32[(r32<<2>>2)+r10];if((r17&2|0)==0){r27=r31;r26=r17}else{break}}L1663:do{if((r32|0)==(r28|0)){r33=r31;r34=r28}else{r26=r32<<2;r27=r31;r17=r28;r15=r25;while(1){r16=r15>>2;r19=r15&1^r27;HEAP32[(r17<<2>>2)+r10]=r27|r26;if((r16|0)==(r32|0)){r33=r19;r34=r32;break L1663}r27=r19;r17=r16;r15=HEAP32[(r16<<2>>2)+r10]}}}while(0);if((r33|0)==0){r35=r31;r36=r34;break}___assert_func(66560,137,70752,68352);r35=r31;r36=r34}else{r35=0;r36=r28}}while(0);r34=HEAP32[r8+3];if((r34|0)<=-1){___assert_func(66560,110,70752,68748)}r8=HEAP32[(r34<<2>>2)+r10];do{if((r8&2|0)==0){r31=0;r33=r8;while(1){r37=r33&1^r31;r38=r33>>2;r32=HEAP32[(r38<<2>>2)+r10];if((r32&2|0)==0){r31=r37;r33=r32}else{break}}L1678:do{if((r38|0)==(r34|0)){r39=r37;r40=r34}else{r33=r38<<2;r31=r37;r32=r34;r25=r8;while(1){r15=r25>>2;r17=r25&1^r31;HEAP32[(r32<<2>>2)+r10]=r31|r33;if((r15|0)==(r38|0)){r39=r17;r40=r38;break L1678}r31=r17;r32=r15;r25=HEAP32[(r15<<2>>2)+r10]}}}while(0);if((r39|0)==0){r41=r37;r42=r40;break}___assert_func(66560,137,70752,68352);r41=r37;r42=r40}else{r41=0;r42=r34}}while(0);if((r24|0)==(r30|0)){r43=(_merge_lines(r1,r28,r34,r23^r3^r29)|0)==0?4:3;STACKTOP=r5;return r43}if((r24|0)==(r36|0)){r43=(_merge_lines(r1,r20,r34,r23^r3^r35)|0)==0?4:3;STACKTOP=r5;return r43}if((r24|0)==(r42|0)){r43=(_merge_lines(r1,r20,r28,r23^r3^r41)|0)==0?4:3;STACKTOP=r5;return r43}if((r30|0)==(r36|0)){r43=(_merge_lines(r1,r14,r34,r29^r3^r35)|0)==0?4:3;STACKTOP=r5;return r43}if((r30|0)==(r42|0)){r43=(_merge_lines(r1,r14,r28,r29^r3^r41)|0)==0?4:3;STACKTOP=r5;return r43}if((r36|0)==(r42|0)){r42=(_merge_lines(r1,r14,r20,r35^r3^r41)|0)==0?4:3;STACKTOP=r5;return r42}else{r43=4;STACKTOP=r5;return r43}}else if((r4|0)==3){r42=HEAP32[HEAP32[r9]+12>>2];r41=HEAP32[r9+2];r35=0;r20=r2;while(1){r14=HEAP32[r20>>2]-r42>>4;if(HEAP8[r41+r14|0]<<24>>24==1){HEAP32[(r35<<2>>2)+r7]=r14;r44=r35+1|0}else{r44=r35}if((r44|0)<3){r35=r44;r20=r20+4|0}else{break}}r20=HEAP32[r7];if((r20|0)<=-1){___assert_func(66560,110,70752,68748)}r44=HEAP32[(r20<<2>>2)+r10];do{if((r44&2|0)==0){r35=0;r41=r44;while(1){r45=r41&1^r35;r46=r41>>2;r42=HEAP32[(r46<<2>>2)+r10];if((r42&2|0)==0){r35=r45;r41=r42}else{break}}L1723:do{if((r46|0)==(r20|0)){r47=r45;r48=r20}else{r41=r46<<2;r35=r45;r42=r20;r14=r44;while(1){r36=r14>>2;r29=r14&1^r35;HEAP32[(r42<<2>>2)+r10]=r35|r41;if((r36|0)==(r46|0)){r47=r29;r48=r46;break L1723}r35=r29;r42=r36;r14=HEAP32[(r36<<2>>2)+r10]}}}while(0);if((r47|0)==0){r49=r45;r50=r48;break}___assert_func(66560,137,70752,68352);r49=r45;r50=r48}else{r49=0;r50=r20}}while(0);r48=HEAP32[r7+1];if((r48|0)<=-1){___assert_func(66560,110,70752,68748)}r45=HEAP32[(r48<<2>>2)+r10];do{if((r45&2|0)==0){r47=0;r46=r45;while(1){r51=r46&1^r47;r52=r46>>2;r44=HEAP32[(r52<<2>>2)+r10];if((r44&2|0)==0){r47=r51;r46=r44}else{break}}L1738:do{if((r52|0)==(r48|0)){r53=r51;r54=r48}else{r46=r52<<2;r47=r51;r44=r48;r14=r45;while(1){r42=r14>>2;r35=r14&1^r47;HEAP32[(r44<<2>>2)+r10]=r47|r46;if((r42|0)==(r52|0)){r53=r35;r54=r52;break L1738}r47=r35;r44=r42;r14=HEAP32[(r42<<2>>2)+r10]}}}while(0);if((r53|0)==0){r55=r51;r56=r54;break}___assert_func(66560,137,70752,68352);r55=r51;r56=r54}else{r55=0;r56=r48}}while(0);r54=HEAP32[r7+2];if((r54|0)<=-1){___assert_func(66560,110,70752,68748)}r7=HEAP32[(r54<<2>>2)+r10];do{if((r7&2|0)==0){r51=0;r53=r7;while(1){r57=r53&1^r51;r58=r53>>2;r52=HEAP32[(r58<<2>>2)+r10];if((r52&2|0)==0){r51=r57;r53=r52}else{break}}L1753:do{if((r58|0)==(r54|0)){r59=r57;r60=r54}else{r53=r58<<2;r51=r57;r52=r54;r45=r7;while(1){r14=r45>>2;r44=r45&1^r51;HEAP32[(r52<<2>>2)+r10]=r51|r53;if((r14|0)==(r58|0)){r59=r44;r60=r58;break L1753}r51=r44;r52=r14;r45=HEAP32[(r14<<2>>2)+r10]}}}while(0);if((r59|0)==0){r61=r57;r62=r60;break}___assert_func(66560,137,70752,68352);r61=r57;r62=r60}else{r61=0;r62=r54}}while(0);if((r50|0)==(r56|0)){r63=(_solver_set_line(r1,r54,(r49^r3|0)!=(r55|0)?0:2)|0)==0?4:0}else{r63=4}if((r50|0)==(r62|0)){r64=(_solver_set_line(r1,r48,(r49^r3|0)!=(r61|0)?0:2)|0)==0?r63:0}else{r64=r63}if((r56|0)!=(r62|0)){r43=r64;STACKTOP=r5;return r43}r43=(_solver_set_line(r1,r20,(r55^r3|0)!=(r61|0)?0:2)|0)==0?r64:0;STACKTOP=r5;return r43}else if((r4|0)==2){r4=HEAP32[HEAP32[r9]+12>>2];r64=HEAP32[r9+2];r9=0;r61=r2;while(1){r2=HEAP32[r61>>2]-r4>>4;if(HEAP8[r64+r2|0]<<24>>24==1){HEAP32[(r9<<2>>2)+r6]=r2;r65=r9+1|0}else{r65=r9}if((r65|0)<2){r9=r65;r61=r61+4|0}else{break}}r43=(_merge_lines(r1,HEAP32[r6],HEAP32[r6+1],r3)|0)==0?4:3;STACKTOP=r5;return r43}else{r43=4;STACKTOP=r5;return r43}}function _merge_lines(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r5=r1|0;r6=HEAP32[HEAP32[HEAP32[r5>>2]>>2]+8>>2];if((r6|0)>(r2|0)){r7=r6}else{___assert_func(66812,1163,70316,68868);r7=HEAP32[HEAP32[HEAP32[r5>>2]>>2]+8>>2]}if((r7|0)<=(r3|0)){___assert_func(66812,1164,70316,68788)}r7=(r1+48|0)>>2;r1=HEAP32[r7]>>2;if((r2|0)<=-1){___assert_func(66560,110,70752,68748)}r5=HEAP32[(r2<<2>>2)+r1];do{if((r5&2|0)==0){r6=0;r8=r5;while(1){r9=r8&1^r6;r10=r8>>2;r11=HEAP32[(r10<<2>>2)+r1];if((r11&2|0)==0){r6=r9;r8=r11}else{break}}L1794:do{if((r10|0)==(r2|0)){r12=r9;r13=r2}else{r8=r10<<2;r6=r9;r11=r2;r14=r5;while(1){r15=r14>>2;r16=r14&1^r6;HEAP32[(r11<<2>>2)+r1]=r6|r8;if((r15|0)==(r10|0)){r12=r16;r13=r10;break L1794}r6=r16;r11=r15;r14=HEAP32[(r15<<2>>2)+r1]}}}while(0);if((r12|0)==0){r17=r9;r18=r13;break}___assert_func(66560,137,70752,68352);r17=r9;r18=r13}else{r17=0;r18=r2}}while(0);r2=r17^r4;r4=HEAP32[r7]>>2;if((r3|0)<=-1){___assert_func(66560,110,70752,68748)}r17=HEAP32[(r3<<2>>2)+r4];if((r17&2|0)==0){r19=0;r20=r17}else{r21=0;r22=r3;r23=r2^r21;r24=HEAP32[r7];_edsf_merge(r24,r18,r22,r23);r25=(r18|0)!=(r22|0);r26=r25&1;return r26}while(1){r27=r20&1^r19;r28=r20>>2;r13=HEAP32[(r28<<2>>2)+r4];if((r13&2|0)==0){r19=r27;r20=r13}else{break}}L1810:do{if((r28|0)==(r3|0)){r29=r27;r30=r3}else{r20=r28<<2;r19=r27;r13=r3;r9=r17;while(1){r12=r9>>2;r1=r9&1^r19;HEAP32[(r13<<2>>2)+r4]=r19|r20;if((r12|0)==(r28|0)){r29=r1;r30=r28;break L1810}r19=r1;r13=r12;r9=HEAP32[(r12<<2>>2)+r4]}}}while(0);if((r29|0)==0){r21=r27;r22=r30;r23=r2^r21;r24=HEAP32[r7];_edsf_merge(r24,r18,r22,r23);r25=(r18|0)!=(r22|0);r26=r25&1;return r26}___assert_func(66560,137,70752,68352);r21=r27;r22=r30;r23=r2^r21;r24=HEAP32[r7];_edsf_merge(r24,r18,r22,r23);r25=(r18|0)!=(r22|0);r26=r25&1;return r26}function _draw_thick_line(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r8=STACKTOP;STACKTOP=STACKTOP+32|0;r9=r8,r10=r9>>2;r11=HEAP32[r1>>2];r12=HEAP32[r11+96>>2];if((r12|0)==0){r13=r5-r3;r14=r6-r4;r15=Math.sqrt(r13*r13+r14*r14);r16=r2*.5-.2;r17=r16*(r13/r15);r13=r16*(r14/r15);r15=r9|0;HEAP32[r15>>2]=r3-r13&-1;HEAP32[r10+1]=r17+r4&-1;HEAP32[r10+2]=r5-r13&-1;HEAP32[r10+3]=r17+r6&-1;HEAP32[r10+4]=r13+r5&-1;HEAP32[r10+5]=r6-r17&-1;HEAP32[r10+6]=r13+r3&-1;HEAP32[r10+7]=r4-r17&-1;FUNCTION_TABLE[HEAP32[r11+12>>2]](HEAP32[r1+4>>2],r15,4,r7,r7);STACKTOP=r8;return}else{FUNCTION_TABLE[r12](HEAP32[r1+4>>2],r2,r3,r4,r5,r6,r7);STACKTOP=r8;return}}function _status_bar(r1,r2){var r3,r4,r5,r6;r3=r1|0;if((HEAP32[HEAP32[r3>>2]+40>>2]|0)==0){return}r4=r1+24|0;r5=HEAP32[r4>>2];if((r5|0)==0){___assert_func(66852,198,70132,68452);r6=HEAP32[r4>>2]}else{r6=r5}r5=_midend_rewrite_statusbar(r6,r2);r2=(r1+28|0)>>2;r6=HEAP32[r2];do{if((r6|0)!=0){if((_strcmp(r5,r6)|0)!=0){break}if((r5|0)==0){return}_free(r5);return}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+40>>2]](HEAP32[r1+4>>2],r5);r1=HEAP32[r2];if((r1|0)!=0){_free(r1)}HEAP32[r2]=r5;return}function _edsf_merge(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r5=r1>>2;if((r2|0)<=-1){___assert_func(66560,110,70752,68748)}r6=HEAP32[(r2<<2>>2)+r5];do{if((r6&2|0)==0){r7=0;r8=r6;while(1){r9=r8&1^r7;r10=r8>>2;r11=HEAP32[(r10<<2>>2)+r5];if((r11&2|0)==0){r7=r9;r8=r11}else{break}}L1853:do{if((r10|0)==(r2|0)){r12=r9;r13=r2}else{r8=r10<<2;r7=r9;r11=r2;r14=r6;while(1){r15=r14>>2;r16=r14&1^r7;HEAP32[(r11<<2>>2)+r5]=r7|r8;if((r15|0)==(r10|0)){r12=r16;r13=r10;break L1853}r7=r16;r11=r15;r14=HEAP32[(r15<<2>>2)+r5]}}}while(0);if((r12|0)==0){r17=r9;r18=r13;break}___assert_func(66560,137,70752,68352);r17=r9;r18=r13}else{r17=0;r18=r2}}while(0);if((HEAP32[(r18<<2>>2)+r5]&2|0)==0){___assert_func(66560,152,70740,67808)}r2=r17^r4;if((r3|0)<=-1){___assert_func(66560,110,70752,68748)}r4=HEAP32[(r3<<2>>2)+r5];do{if((r4&2|0)==0){r17=0;r13=r4;while(1){r19=r13&1^r17;r20=r13>>2;r9=HEAP32[(r20<<2>>2)+r5];if((r9&2|0)==0){r17=r19;r13=r9}else{break}}L1871:do{if((r20|0)==(r3|0)){r21=r19;r22=r3}else{r13=r20<<2;r17=r19;r9=r3;r12=r4;while(1){r10=r12>>2;r6=r12&1^r17;HEAP32[(r9<<2>>2)+r5]=r17|r13;if((r10|0)==(r20|0)){r21=r6;r22=r20;break L1871}r17=r6;r9=r10;r12=HEAP32[(r10<<2>>2)+r5]}}}while(0);if((r21|0)==0){r23=r19;r24=r22;break}___assert_func(66560,137,70752,68352);r23=r19;r24=r22}else{r23=0;r24=r3}}while(0);if((HEAP32[(r24<<2>>2)+r5]&2|0)==0){___assert_func(66560,155,70740,67272)}r3=r23^r2;r22=(r2|0)==(r23|0);do{if((r18|0)==(r24|0)){if(r22){r25=r18;r26=r18;break}___assert_func(66560,161,70740,67096);r25=r18;r26=r18}else{if(!(r22|(r3|0)==1)){___assert_func(66560,163,70740,66820)}r19=(r18|0)>(r24|0);r21=r19?r18:r24;r20=r19?r24:r18;r19=(r21<<2)+r1|0;r4=(r20<<2)+r1|0;HEAP32[r4>>2]=HEAP32[r4>>2]+(HEAP32[r19>>2]&-4)|0;HEAP32[r19>>2]=r20<<2|(r2|0)!=(r23|0)&1;r25=r20;r26=r21}}while(0);if((r26|0)<=-1){___assert_func(66560,110,70752,68748)}r23=HEAP32[(r26<<2>>2)+r5];do{if((r23&2|0)==0){r2=0;r1=r23;while(1){r27=r1&1^r2;r28=r1>>2;r18=HEAP32[(r28<<2>>2)+r5];if((r18&2|0)==0){r2=r27;r1=r18}else{break}}L1897:do{if((r28|0)==(r26|0)){r29=r27;r30=r26}else{r1=r28<<2;r2=r27;r18=r26;r24=r23;while(1){r22=r24>>2;r21=r24&1^r2;HEAP32[(r18<<2>>2)+r5]=r2|r1;if((r22|0)==(r28|0)){r29=r21;r30=r28;break L1897}r2=r21;r18=r22;r24=HEAP32[(r22<<2>>2)+r5]}}}while(0);if((r29|0)==0){r31=r27;r32=r30;break}___assert_func(66560,137,70752,68352);r31=r27;r32=r30}else{r31=0;r32=r26}}while(0);if((r32|0)!=(r25|0)){___assert_func(66560,188,70740,66800)}if((r31|0)==(r3|0)){return}___assert_func(66560,189,70740,66704);return}function _dsf_size(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;if((r2|0)<=-1){___assert_func(66560,110,70752,68748)}r3=(r2<<2)+r1|0;r4=HEAP32[r3>>2];do{if((r4&2|0)==0){r5=0;r6=r4;while(1){r7=r6&1^r5;r8=r6>>2;r9=HEAP32[r1+(r8<<2)>>2];if((r9&2|0)==0){r5=r7;r6=r9}else{break}}L1920:do{if((r8|0)==(r2|0)){r10=r7;r11=r2}else{r6=r8<<2;r5=r4>>2;r9=r7^r4&1;HEAP32[r3>>2]=r7|r6;if((r5|0)==(r8|0)){r10=r9;r11=r8;break}else{r12=r5;r13=r9}while(1){r9=(r12<<2)+r1|0;r5=HEAP32[r9>>2];r14=r5>>2;r15=r13^r5&1;HEAP32[r9>>2]=r13|r6;if((r14|0)==(r8|0)){r10=r15;r11=r8;break L1920}else{r12=r14;r13=r15}}}}while(0);if((r10|0)==0){r16=r11;break}___assert_func(66560,137,70752,68352);r16=r11}else{r16=r2}}while(0);return HEAP32[r1+(r16<<2)>>2]>>2}function _grid_free(r1){var r2,r3,r4,r5,r6,r7,r8;r2=(r1+44|0)>>2;r3=HEAP32[r2];if((r3|0)==0){___assert_func(69436,33,70600,69460);r4=HEAP32[r2]}else{r4=r3}r3=r4-1|0;HEAP32[r2]=r3;if((r3|0)!=0){return}r3=r1|0;L1934:do{if((HEAP32[r3>>2]|0)>0){r2=r1+4|0;r4=0;while(1){r5=HEAP32[r2>>2];r6=HEAP32[r5+(r4*24&-1)+8>>2];if((r6|0)==0){r7=r5}else{_free(r6);r7=HEAP32[r2>>2]}r6=HEAP32[r7+(r4*24&-1)+4>>2];if((r6|0)!=0){_free(r6)}r6=r4+1|0;if((r6|0)<(HEAP32[r3>>2]|0)){r4=r6}else{break L1934}}}}while(0);r3=r1+16|0;L1945:do{if((HEAP32[r3>>2]|0)>0){r7=r1+20|0;r4=0;while(1){r2=HEAP32[r7>>2];r6=HEAP32[r2+(r4*20&-1)+8>>2];if((r6|0)==0){r8=r2}else{_free(r6);r8=HEAP32[r7>>2]}r6=HEAP32[r8+(r4*20&-1)+4>>2];if((r6|0)!=0){_free(r6)}r6=r4+1|0;if((r6|0)<(HEAP32[r3>>2]|0)){r4=r6}else{break L1945}}}}while(0);r3=HEAP32[r1+4>>2];if((r3|0)!=0){_free(r3)}r3=HEAP32[r1+12>>2];if((r3|0)!=0){_free(r3)}r3=HEAP32[r1+20>>2];if((r3|0)!=0){_free(r3)}if((r1|0)==0){return}_free(r1);return}function _grid_nearest_edge(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r4=HEAP32[r1+8>>2];if((r4|0)<=0){r5=0;return r5}r6=HEAP32[r1+12>>2];r1=0;r7=0;r8=0;while(1){r9=(r1<<4)+r6|0;r10=HEAP32[r9>>2];r11=HEAP32[r10+12>>2];r12=HEAP32[r6+(r1<<4)+4>>2];r13=HEAP32[r12+12>>2];r14=r11-r13|0;r15=Math.imul(r14,r14);r14=HEAP32[r10+16>>2];r10=HEAP32[r12+16>>2];r12=r14-r10|0;r16=Math.imul(r12,r12)+r15|0;r15=r11-r2|0;r12=r14-r3|0;r17=Math.imul(r15,r15)+Math.imul(r12,r12)|0;r12=r13-r2|0;r15=r10-r3|0;r18=Math.imul(r12,r12)+Math.imul(r15,r15)|0;do{if((r17|0)<(r16+r18|0)&(r18|0)<(r16+r17|0)){r15=Math.imul(r10,r11);r12=Math.imul(r14,r13);r19=Math.imul(r10,r2);r20=Math.imul(r14,r2)+Math.imul(r13-r11|0,r3)-r12+r15-r19|0;r19=-r20|0;r15=r16|0;r12=(((r20|0)>(r19|0)?r20:r19)|0)/Math.sqrt(r15);if(r12*r12*4>r15){r21=r8;r22=r7;break}r15=(r8|0)==0|r12<r7;r21=r15?r9:r8;r22=r15?r12:r7}else{r21=r8;r22=r7}}while(0);r9=r1+1|0;if((r9|0)<(r4|0)){r1=r9;r7=r22;r8=r21}else{r5=r21;break}}return r5}function _print_mono_colour(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=STACKTOP;r4=r2|0;r2=(r1+12|0)>>2;r5=HEAP32[r2];r6=r1+16|0;do{if((r5|0)<(HEAP32[r6>>2]|0)){r7=r5;r8=HEAP32[r1+8>>2]}else{r9=r5+16|0;HEAP32[r6>>2]=r9;r10=r1+8|0;r11=HEAP32[r10>>2];r12=r9*24&-1;if((r11|0)==0){r13=_malloc(r12)}else{r13=_realloc(r11,r12)}if((r13|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r12=r13;HEAP32[r10>>2]=r12;r7=HEAP32[r2];r8=r12;break}}}while(0);r13=(r1+8|0)>>2;HEAP32[r8+(r7*24&-1)>>2]=-1;HEAP32[HEAP32[r13]+(HEAP32[r2]*24&-1)+4>>2]=0;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+8>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+12>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+16>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+20>>2]=r4;r4=HEAP32[r2];HEAP32[r2]=r4+1|0;STACKTOP=r3;return r4}function _grid_find_incentre(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+68|0;r4=r3,r5=r4>>2;r6=r3+12,r7=r6>>2;r8=r3+24,r9=r8>>2;r10=r3+36;r11=r3+52;r12=r1+12|0;if((HEAP32[r12>>2]|0)!=0){STACKTOP=r3;return}r13=HEAP32[r1>>2];r14=r13<<1;do{if((r14|0)>2){r15=r1+8|0;r16=r1+4|0;r17=(r8|0)>>2;r18=r8+4|0;r19=(r4|0)>>2;r20=(r6|0)>>2;r21=(r10|0)>>2;r22=(r11|0)>>2;r23=(r10+8|0)>>2;r24=(r11+8|0)>>2;r25=0;r26=0;r27=0;r28=0;r29=0;r30=0;while(1){r31=(r27|0)<(r13|0);if(r31){r32=HEAP32[r15>>2];HEAP32[(r26<<2>>2)+r5]=HEAP32[r32+(r27<<2)>>2];r33=r27+1|0;HEAP32[(r26<<2>>2)+r7]=HEAP32[r32+((r33|0)%(r13|0)<<2)>>2];r34=r26+1|0;r35=r25;r36=r32;r37=r33}else{r33=HEAP32[r15>>2];HEAP32[(r25<<2>>2)+r9]=HEAP32[r33+(r27-r13<<2)>>2];r34=r26;r35=r25+1|0;r36=r33;r37=r27+1|0}r33=r27+2|0;L2004:do{if((r33|0)<(r14|0)){r32=r35;r38=r34;r39=r37;r40=r28;r41=r29;r42=r30;r43=r33;r44=r36;r45=r36;while(1){r46=(r39|0)<(r13|0);if(r46){HEAP32[(r38<<2>>2)+r5]=HEAP32[r44+(r39<<2)>>2];HEAP32[(r38<<2>>2)+r7]=HEAP32[r44+((r43|0)%(r13|0)<<2)>>2];r47=r38+1|0;r48=r32;r49=r44;r50=r45}else{HEAP32[(r32<<2>>2)+r9]=HEAP32[r36+(r39-r13<<2)>>2];r47=r38;r48=r32+1|0;r49=r36;r50=r36}L2011:do{if((r43|0)<(r14|0)){r51=r48;r52=r47;r53=r43;r54=r40;r55=r41;r56=r42;r57=r49;while(1){r58=(r53|0)<(r13|0);if(r58){HEAP32[(r52<<2>>2)+r5]=HEAP32[r57+(r53<<2)>>2];HEAP32[(r52<<2>>2)+r7]=HEAP32[r57+((r53+1|0)%(r13|0)<<2)>>2];r59=r52+1|0;r60=r51;r61=r57}else{HEAP32[(r51<<2>>2)+r9]=HEAP32[r50+(r53-r13<<2)>>2];r59=r52;r60=r51+1|0;r61=r50}do{if((r59|0)==1){r62=HEAP32[r17];r63=HEAP32[r62+12>>2];r64=HEAP32[r18>>2];r65=HEAP32[r64+12>>2];r66=HEAP32[r62+16>>2];r62=HEAP32[r64+16>>2];r64=r62-r66|0;r67=r65-r63|0;r68=r64|0;r69=Math.sqrt(r67*r67+r68*r68);r68=(r65+r63|0)*.5;r63=(r62+r66|0)*.5;r66=(-r64|0)/r69;r64=r67/r69;r67=r69*.5;r69=HEAP32[r19];r62=HEAP32[r69+12>>2];r65=HEAP32[r20];r70=HEAP32[r69+16>>2];r69=HEAP32[r65+12>>2]-r62|0;r71=HEAP32[r65+16>>2]-r70|0;r65=Math.sqrt(r69*r69+r71*r71);r72=(r66*r71-r64*r69)/r65;r73=((r68-(r62|0))*r71-r69*(r63-(r70|0)))/r65;r65=r72*2*r73;r70=r72*r72-1;r72=r65*r65-r70*4*(r73*r73-r67*r67);if(r72<0){r74=r54;r75=r55;r76=r56;break}r67=Math.sqrt(r72);r72=-r65;r73=r70*2;r70=(r67-r65)/r73;r65=r68+r66*r70;HEAPF64[tempDoublePtr>>3]=r65,HEAP32[r21]=HEAP32[tempDoublePtr>>2],HEAP32[r21+1]=HEAP32[tempDoublePtr+4>>2];r65=r63+r64*r70;HEAPF64[tempDoublePtr>>3]=r65,HEAP32[r22]=HEAP32[tempDoublePtr>>2],HEAP32[r22+1]=HEAP32[tempDoublePtr+4>>2];r65=(r72-r67)/r73;r73=r68+r66*r65;HEAPF64[tempDoublePtr>>3]=r73,HEAP32[r23]=HEAP32[tempDoublePtr>>2],HEAP32[r23+1]=HEAP32[tempDoublePtr+4>>2];r73=r63+r64*r65;HEAPF64[tempDoublePtr>>3]=r73,HEAP32[r24]=HEAP32[tempDoublePtr>>2],HEAP32[r24+1]=HEAP32[tempDoublePtr+4>>2];r77=2;r2=1444;break}else if((r59|0)==3){r73=HEAP32[r19];r65=HEAP32[r73+12>>2];r64=HEAP32[r20];r63=HEAP32[r73+16>>2];r73=HEAP32[r64+12>>2]-r65|0;r66=HEAP32[r64+16>>2]-r63|0;r64=-r73|0;r68=r73|0;r73=-Math.sqrt(r68*r68+r66*r66);r67=(r65|0)*r66-(r63|0)*r68;r68=HEAP32[r5+1];r63=HEAP32[r68+12>>2];r65=HEAP32[r7+1];r72=HEAP32[r68+16>>2];r68=HEAP32[r65+12>>2]-r63|0;r70=HEAP32[r65+16>>2]-r72|0;r65=-r68|0;r69=r68|0;r68=-Math.sqrt(r69*r69+r70*r70);r71=(r63|0)*r70-(r72|0)*r69;r69=HEAP32[r5+2];r72=HEAP32[r69+12>>2];r63=HEAP32[r7+2];r62=HEAP32[r69+16>>2];r69=HEAP32[r63+12>>2]-r72|0;r78=HEAP32[r63+16>>2]-r62|0;r63=-r69|0;r79=r69|0;r69=-Math.sqrt(r79*r79+r78*r78);r80=(r72|0)*r78-(r62|0)*r79;r79=r64*r68;r62=r70*r73;r72=r66*r68;r81=r65*r73;r82=r66*r65*r69+r79*r78+r62*r63-r72*r63-r64*r70*r69-r78*r81;if(r82==0){r74=r54;r75=r55;r76=r56;break}r83=(r65*r69-r63*r68)/r82*r67+(r63*r73-r64*r69)/r82*r71+(r79-r81)/r82*r80;r81=(r78*r68-r70*r69)/r82*r67+(r66*r69-r78*r73)/r82*r71+(r62-r72)/r82*r80;HEAPF64[tempDoublePtr>>3]=r83,HEAP32[r21]=HEAP32[tempDoublePtr>>2],HEAP32[r21+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r81,HEAP32[r22]=HEAP32[tempDoublePtr>>2],HEAP32[r22+1]=HEAP32[tempDoublePtr+4>>2];r77=1;r2=1444;break}else if((r59|0)==0){r81=HEAP32[r17];r83=HEAP32[r81+12>>2];r80=HEAP32[r18>>2];r82=HEAP32[r80+12>>2];r72=HEAP32[r81+16>>2];r81=HEAP32[r80+16>>2];r80=r82-r83|0;r62=r81-r72|0;r71=r80<<1|0;r73=r62<<1|0;r78=r80|0;r80=r62|0;r62=(r72|0)*2*r80+(r83|0)*2*r78+r78*r78+r80*r80;r80=HEAP32[r9+2];r78=HEAP32[r80+12>>2]-r82|0;r83=HEAP32[r80+16>>2]-r81|0;r80=r78<<1|0;r72=r83<<1|0;r69=r78|0;r78=r83|0;r83=(r81|0)*2*r78+(r82|0)*2*r69+r69*r69+r78*r78;r78=r71*r72-r73*r80;if(r78==0){r74=r54;r75=r55;r76=r56;break}r69=r72/r78*r62+ -r73/r78*r83;r73=-r80/r78*r62+r71/r78*r83;HEAPF64[tempDoublePtr>>3]=r69,HEAP32[r21]=HEAP32[tempDoublePtr>>2],HEAP32[r21+1]=HEAP32[tempDoublePtr+4>>2];HEAPF64[tempDoublePtr>>3]=r73,HEAP32[r22]=HEAP32[tempDoublePtr>>2],HEAP32[r22+1]=HEAP32[tempDoublePtr+4>>2];r77=1;r2=1444;break}else if((r59|0)==2){r73=HEAP32[r19];r69=HEAP32[r73+12>>2];r83=HEAP32[r20];r78=HEAP32[r73+16>>2];r73=HEAP32[r83+12>>2]-r69|0;r71=HEAP32[r83+16>>2]-r78|0;r83=r71|0;r62=-r73|0;r80=-Math.sqrt(Math.imul(r73,r73)+Math.imul(r71,r71)|0);r72=Math.imul(r71,r69)-Math.imul(r78,r73)|0;r73=HEAP32[r5+1];r78=HEAP32[r73+12>>2];r69=HEAP32[r7+1];r71=HEAP32[r73+16>>2];r73=HEAP32[r69+12>>2]-r78|0;r82=HEAP32[r69+16>>2]-r71|0;r69=-Math.sqrt(Math.imul(r73,r73)+Math.imul(r82,r82)|0);r81=r83*r69-(r82|0)*r80;r66=r62*r69-(-r73|0)*r80;r67=r72*r69-(Math.imul(r82,r78)-Math.imul(r71,r73)|0)*r80;r73=r81&-1;r71=r66&-1;if((((r73|0)>-1?r73:-r73|0)|0)<(((r71|0)>-1?r71:-r71|0)|0)){r84=0;r85=1;r86=r67/r66;r87=-r81/r66}else{r84=r67/r81;r85=-r66/r81;r86=0;r87=1}r81=-(r85*r83+r87*r62)/r80;r66=(r72-r84*r83-r86*r62)/r80;r80=HEAP32[r17];r62=r84-(HEAP32[r80+12>>2]|0);r83=r87*r87+r85*r85+r81*-r81;r72=r86-(HEAP32[r80+16>>2]|0);r80=r81*-2*r66+r85*2*r62+r87*2*r72;r81=r80*r80-r83*4*(r66*-r66+r62*r62+r72*r72);if(r81<0){r74=r54;r75=r55;r76=r56;break}r72=Math.sqrt(r81);r81=-r80;r62=r83*2;r83=(r72-r80)/r62;r80=r84+r85*r83;HEAPF64[tempDoublePtr>>3]=r80,HEAP32[r21]=HEAP32[tempDoublePtr>>2],HEAP32[r21+1]=HEAP32[tempDoublePtr+4>>2];r80=r86+r87*r83;HEAPF64[tempDoublePtr>>3]=r80,HEAP32[r22]=HEAP32[tempDoublePtr>>2],HEAP32[r22+1]=HEAP32[tempDoublePtr+4>>2];r80=(r81-r72)/r62;r62=r84+r85*r80;HEAPF64[tempDoublePtr>>3]=r62,HEAP32[r23]=HEAP32[tempDoublePtr>>2],HEAP32[r23+1]=HEAP32[tempDoublePtr+4>>2];r62=r86+r87*r80;HEAPF64[tempDoublePtr>>3]=r62,HEAP32[r24]=HEAP32[tempDoublePtr>>2],HEAP32[r24+1]=HEAP32[tempDoublePtr+4>>2];r77=2;r2=1444;break}else{r74=r54;r75=r55;r76=r56}}while(0);L2031:do{if(r2==1444){r2=0;r62=(r13|0)>0;r80=0;r72=r54;r81=r55;r83=r56;while(1){r66=(r80<<3)+r10|0;r67=(HEAP32[tempDoublePtr>>2]=HEAP32[r66>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r66+4>>2],HEAPF64[tempDoublePtr>>3]);r66=(r80<<3)+r11|0;r71=(HEAP32[tempDoublePtr>>2]=HEAP32[r66>>2],HEAP32[tempDoublePtr+4>>2]=HEAP32[r66+4>>2],HEAPF64[tempDoublePtr>>3]);do{if(r62){r66=HEAP32[r16>>2];r73=0;r78=0;while(1){r82=HEAP32[r66+(r73<<2)>>2];r69=HEAP32[r82>>2];r70=HEAP32[r69+12>>2];r68=HEAP32[r82+4>>2];r82=HEAP32[r68+12>>2];r79=HEAP32[r69+16>>2];r69=HEAP32[r68+16>>2];r68=r79|0;r64=r69|0;do{if(r71>=r68&r71<r64){r2=1449}else{if(r71>=r64&r71<r68){r2=1449;break}else{r88=r78;break}}}while(0);do{if(r2==1449){r2=0;r64=r82-r70|0;r63=r69-r79|0;if((r63|0)<0){r89=-r63|0;r90=-r64|0}else{r89=r63;r90=r64}if((r67-(r70|0))*(r89|0)<(r71-r68)*(r90|0)){r88=r78;break}r88=r78^1}}while(0);r68=r73+1|0;if((r68|0)<(r13|0)){r73=r68;r78=r88}else{break}}if((r88|0)==0){r91=r83;r92=r81;r93=r72;break}L2050:do{if(r62){r78=Infinity;r73=0;while(1){r66=HEAP32[r61+(r73<<2)>>2];r68=r67-(HEAP32[r66+12>>2]|0);r70=r71-(HEAP32[r66+16>>2]|0);r66=r68*r68+r70*r70;r94=r78>r66?r66:r78;r66=r73+1|0;if((r66|0)<(r13|0)){r78=r94;r73=r66}else{break}}if(!r62){r95=r94;break}r73=HEAP32[r16>>2];r78=r94;r66=0;while(1){r70=HEAP32[r73+(r66<<2)>>2];r68=HEAP32[r70>>2];r79=HEAP32[r68+12>>2];r69=HEAP32[r70+4>>2];r70=HEAP32[r68+16>>2];r68=HEAP32[r69+12>>2]-r79|0;r82=HEAP32[r69+16>>2]-r70|0;r69=r67-(r79|0);r79=r71-(r70|0);r70=r68|0;r64=r82|0;r63=r69*r70+r79*r64;do{if(r63>0){r65=Math.imul(r82,r82)+Math.imul(r68,r68)|0;if(r63>=r65){r96=r78;break}r97=r69*r64-r70*r79;r98=r97*r97/r65;if(r78<=r98){r96=r78;break}r96=r98}else{r96=r78}}while(0);r79=r66+1|0;if((r79|0)<(r13|0)){r78=r96;r66=r79}else{r95=r96;break L2050}}}else{r95=Infinity}}while(0);if(r72>=r95){r91=r83;r92=r81;r93=r72;break}r91=r67;r92=r71;r93=r95}else{r91=r83;r92=r81;r93=r72}}while(0);r71=r80+1|0;if((r71|0)<(r77|0)){r80=r71;r72=r93;r81=r92;r83=r91}else{r74=r93;r75=r92;r76=r91;break L2031}}}}while(0);r83=((r58^1)<<31>>31)+r60|0;r81=(r58<<31>>31)+r59|0;r72=r53+1|0;if((r72|0)<(r14|0)){r51=r83;r52=r81;r53=r72;r54=r74;r55=r75;r56=r76;r57=r61}else{r99=r83;r100=r81;r101=r74;r102=r75;r103=r76;r104=r61;break L2011}}}else{r99=r48;r100=r47;r101=r40;r102=r41;r103=r42;r104=r49}}while(0);r57=((r46^1)<<31>>31)+r99|0;r56=(r46<<31>>31)+r100|0;r55=r43+1|0;if((r55|0)<(r14|0)){r32=r57;r38=r56;r39=r43;r40=r101;r41=r102;r42=r103;r43=r55;r44=r104;r45=r50}else{r105=r57;r106=r56;r107=r101;r108=r102;r109=r103;break L2004}}}else{r105=r35;r106=r34;r107=r28;r108=r29;r109=r30}}while(0);if((r27+3|0)<(r14|0)){r25=((r31^1)<<31>>31)+r105|0;r26=(r31<<31>>31)+r106|0;r27=r37;r28=r107;r29=r108;r30=r109}else{break}}if(r107>0){r110=r109;r111=r108;break}else{r112=r109;r113=r108;r2=1471;break}}else{r112=0;r113=0;r2=1471}}while(0);if(r2==1471){___assert_func(69436,1365,70612,68592);r110=r112;r111=r113}HEAP32[r12>>2]=1;HEAP32[r1+16>>2]=r110+.5&-1;HEAP32[r1+20>>2]=r111+.5&-1;STACKTOP=r3;return}function _grid_size_square(r1,r2,r3,r4,r5){HEAP32[r3>>2]=20;HEAP32[r4>>2]=r1*20&-1;HEAP32[r5>>2]=r2*20&-1;return}function _grid_size_honeycomb(r1,r2,r3,r4,r5){HEAP32[r3>>2]=45;HEAP32[r4>>2]=(r1*45&-1)+15|0;HEAP32[r5>>2]=(r2*52&-1)+26|0;return}function _grid_size_triangular(r1,r2,r3,r4,r5){HEAP32[r3>>2]=18;HEAP32[r4>>2]=(r1*30&-1)+15|0;HEAP32[r5>>2]=r2*26&-1;return}function _grid_size_snubsquare(r1,r2,r3,r4,r5){HEAP32[r3>>2]=18;HEAP32[r4>>2]=r1*41&-1;HEAP32[r5>>2]=r2*41&-1;return}function _grid_size_cairo(r1,r2,r3,r4,r5){HEAP32[r3>>2]=40;HEAP32[r4>>2]=r1*62&-1;HEAP32[r5>>2]=r2*62&-1;return}function _grid_size_greathexagonal(r1,r2,r3,r4,r5){HEAP32[r3>>2]=18;HEAP32[r4>>2]=(r1*71&-1)-11|0;HEAP32[r5>>2]=(r2*82&-1)+11|0;return}function _grid_size_octagonal(r1,r2,r3,r4,r5){HEAP32[r3>>2]=40;HEAP32[r4>>2]=r1*99&-1;HEAP32[r5>>2]=r2*99&-1;return}function _grid_size_kites(r1,r2,r3,r4,r5){HEAP32[r3>>2]=40;HEAP32[r4>>2]=(r1*104&-1)+52|0;HEAP32[r5>>2]=(r2*90&-1)+30|0;return}function _grid_size_floret(r1,r2,r3,r4,r5){HEAP32[r3>>2]=150;HEAP32[r4>>2]=(r1*315&-1)+75|0;HEAP32[r5>>2]=r2*364&-1;return}function _grid_size_dodecagonal(r1,r2,r3,r4,r5){HEAP32[r3>>2]=26;HEAP32[r4>>2]=(r1*112&-1)+56|0;HEAP32[r5>>2]=(r2*97&-1)+15|0;return}function _grid_size_greatdodecagonal(r1,r2,r3,r4,r5){HEAP32[r3>>2]=26;HEAP32[r4>>2]=(r1*142&-1)+41|0;HEAP32[r5>>2]=(r2*123&-1)-11|0;return}function _grid_size_penrose_p2_kite(r1,r2,r3,r4,r5){HEAP32[r3>>2]=100;HEAP32[r4>>2]=r1*100&-1;HEAP32[r5>>2]=r2*100&-1;return}function _grid_size_penrose_p3_thick(r1,r2,r3,r4,r5){HEAP32[r3>>2]=100;HEAP32[r4>>2]=r1*100&-1;HEAP32[r5>>2]=r2*100&-1;return}function _grid_validate_desc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11;r5=STACKTOP;STACKTOP=STACKTOP+12|0;r6=r5;r7=r5+4;r8=r5+8;if((r1-11|0)>>>0>1){r9=(r4|0)==0?0:68240;STACKTOP=r5;return r9}if((r4|0)==0){r9=68908;STACKTOP=r5;return r9}r10=(r1|0)!=11?125:150;r1=Math.sqrt(Math.imul(r2,r2)+Math.imul(r3,r3)|0);r3=r10*3.11*r1;L2094:do{if(r10*.22426<r3){r2=r10;while(1){r11=r2*1.6180339887;if(r11*.22426<r3){r2=r11}else{break L2094}}}}while(0);if((_sscanf(r4,67228,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r6,HEAP32[tempInt+4>>2]=r7,HEAP32[tempInt+8>>2]=r8,tempInt))|0)!=3){r9=68828;STACKTOP=r5;return r9}r4=HEAP32[r6>>2];r6=Math.imul(r4,r4);r4=HEAP32[r7>>2];if(Math.sqrt(Math.imul(r4,r4)+r6|0)>(r3-r1&-1|0)){r9=68760;STACKTOP=r5;return r9}r1=HEAP32[r8>>2];r9=((r1|0)%36|0)!=0|(r1|0)<0|(r1|0)>359?68692:0;STACKTOP=r5;return r9}function _grid_new_desc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+352|0;r7=r6;if((r1-11|0)>>>0>1){r8=0;STACKTOP=r6;return r8}r9=r6+96|0;r10=(r1|0)!=11?125:150;r1=Math.sqrt(Math.imul(r2,r2)+Math.imul(r3,r3)|0);r3=r10*3.11*r1;L2109:do{if(r10*.22426<r3){r2=r10;while(1){r11=r2*1.6180339887;if(r11*.22426<r3){r2=r11}else{break L2109}}}}while(0);r10=r3-r1&-1;r1=r10<<1;r3=r10|0;r2=0;while(1){if((r1>>>(r2>>>0)|0)!=0){r2=r2+1|0;continue}r11=r2+3|0;if((r11|0)>=32){___assert_func(68096,275,70160,69276)}r12=Math.floor((1<<r11>>>0)/(r1>>>0));r13=Math.imul(r12,r1);while(1){r14=_random_bits(r4,r11);if(r14>>>0<r13>>>0){r15=0;break}}while(1){if((r1>>>(r15>>>0)|0)==0){break}else{r15=r15+1|0}}r16=Math.floor((r14>>>0)/(r12>>>0))-r10|0;r13=r15+3|0;if((r13|0)>=32){___assert_func(68096,275,70160,69276)}r11=Math.floor((1<<r13>>>0)/(r1>>>0));r17=Math.imul(r11,r1);while(1){r18=_random_bits(r4,r13);if(r18>>>0<r17>>>0){break}}r19=Math.floor((r18>>>0)/(r11>>>0))-r10|0;if(Math.sqrt(Math.imul(r16,r16)+Math.imul(r19,r19)|0)>r3){r2=0}else{break}}r2=(r4+60|0)>>2;r3=r4|0;r10=r4+40|0;r18=r7|0;r1=r7+4|0;r15=r7+8|0;r14=r7+12|0;r17=r7+16|0;r13=r7+84|0;r12=r7+92|0;r20=r7+88|0;r21=HEAP32[r2];while(1){if((r21|0)>19){r22=0;while(1){r23=r4+r22|0;r24=HEAP8[r23];if(r24<<24>>24!=-1){r5=1521;break}HEAP8[r23]=0;r25=r22+1|0;if((r25|0)<20){r22=r25}else{break}}if(r5==1521){r5=0;HEAP8[r23]=r24+1&255}HEAP32[r18>>2]=1732584193;HEAP32[r1>>2]=-271733879;HEAP32[r15>>2]=-1732584194;HEAP32[r14>>2]=271733878;HEAP32[r17>>2]=-1009589776;HEAP32[r13>>2]=0;HEAP32[r12>>2]=0;HEAP32[r20>>2]=0;_SHA_Bytes(r7,r3,40);_SHA_Final(r7,r10);HEAP32[r2]=0;r26=0}else{r26=r21}r22=r26+1|0;HEAP32[r2]=r22;r27=HEAP8[r4+(r26+40)|0]&127;if(r27>>>0<120){break}else{r21=r22}}r21=Math.floor((r27>>>0)/12)*36&-1;_sprintf(r9,67228,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r16,HEAP32[tempInt+4>>2]=r19,HEAP32[tempInt+8>>2]=r21,tempInt));r21=_malloc(_strlen(r9)+1|0);if((r21|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r21,r9);r8=r21;STACKTOP=r6;return r8}function _grid_new_square(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+80|0;r5=r4;r6=r4+20;r7=r4+40;r8=r4+60;r9=Math.imul(r2,r1);r10=Math.imul(r2+1|0,r1+1|0);r11=_malloc(48),r12=r11>>2;if((r11|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r13=r11;HEAP32[r12]=0;HEAP32[r12+1]=0;HEAP32[r12+2]=0;HEAP32[r12+3]=0;HEAP32[r12+4]=0;HEAP32[r12+5]=0;HEAP32[r12+11]=1;r14=(r11+24|0)>>2;HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;HEAP32[r14+3]=0;HEAP32[r12+10]=20;r14=_malloc(r9*24&-1);if((r14|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r15=(r11+4|0)>>2;HEAP32[r15]=r14;r14=_malloc(r10*20&-1);if((r14|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r16=(r11+20|0)>>2;HEAP32[r16]=r14;r14=_malloc(8);if((r14|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r17=r14;r18=r14;HEAP32[r18>>2]=0;r19=(r14+4|0)>>2;HEAP32[r19]=42;do{if((r2|0)>0){r20=(r1|0)>0;r21=r11>>2;r22=r8;r23=r8|0;r24=r8+4|0;r25=r8+8|0;r26=r8+12|0;r27=r8+16|0;r28=(r11+16|0)>>2;r29=r7;r30=r7|0;r31=r7+4|0;r32=r7+8|0;r33=r7+12|0;r34=r7+16|0;r35=r6;r36=r6|0;r37=r6+4|0;r38=r6+8|0;r39=r6+12|0;r40=r6+16|0;r41=r5;r42=r5|0;r43=r5+4|0;r44=r5+8|0;r45=r5+12|0;r46=r5+16|0;r47=0;L2161:while(1){L2163:do{if(r20){r48=r47*20&-1;r49=r48+20|0;r50=0;while(1){r51=r50*20&-1;r52=HEAP32[r15],r53=r52>>2;r54=HEAP32[r21];HEAP32[((r54*24&-1)>>2)+r53]=4;r55=_malloc(16);if((r55|0)==0){r3=1544;break L2161}r56=r55;r55=(r52+(r54*24&-1)+8|0)>>2;HEAP32[r55]=r56;HEAP32[r56>>2]=0;HEAP32[HEAP32[r55]+4>>2]=0;HEAP32[HEAP32[r55]+8>>2]=0;HEAP32[HEAP32[r55]+12>>2]=0;HEAP32[((r54*24&-1)+4>>2)+r53]=0;HEAP32[((r54*24&-1)+12>>2)+r53]=0;HEAP32[r21]=HEAP32[r21]+1|0;HEAP32[r23>>2]=0;HEAP32[r24>>2]=0;HEAP32[r25>>2]=0;HEAP32[r26>>2]=r51;HEAP32[r27>>2]=r48;r53=_findrelpos234(r17,r22,0,0,0);do{if((r53|0)==0){r54=HEAP32[r16],r55=r54>>2;r56=HEAP32[r28];r52=r54+(r56*20&-1)|0;HEAP32[r52>>2]=0;HEAP32[((r56*20&-1)+4>>2)+r55]=0;HEAP32[((r56*20&-1)+8>>2)+r55]=0;HEAP32[((r56*20&-1)+12>>2)+r55]=r51;HEAP32[((r56*20&-1)+16>>2)+r55]=r48;HEAP32[r28]=HEAP32[r28]+1|0;if((HEAP32[r19]|0)==0){r57=r52;break}_add234_internal(r17,r52,-1);r57=r52}else{r57=r53}}while(0);HEAP32[HEAP32[HEAP32[r15]+((HEAP32[r21]-1)*24&-1)+8>>2]>>2]=r57;r53=r51+20|0;HEAP32[r30>>2]=0;HEAP32[r31>>2]=0;HEAP32[r32>>2]=0;HEAP32[r33>>2]=r53;HEAP32[r34>>2]=r48;r52=_findrelpos234(r17,r29,0,0,0);do{if((r52|0)==0){r55=HEAP32[r16],r56=r55>>2;r54=HEAP32[r28];r58=r55+(r54*20&-1)|0;HEAP32[r58>>2]=0;HEAP32[((r54*20&-1)+4>>2)+r56]=0;HEAP32[((r54*20&-1)+8>>2)+r56]=0;HEAP32[((r54*20&-1)+12>>2)+r56]=r53;HEAP32[((r54*20&-1)+16>>2)+r56]=r48;HEAP32[r28]=HEAP32[r28]+1|0;if((HEAP32[r19]|0)==0){r59=r58;break}_add234_internal(r17,r58,-1);r59=r58}else{r59=r52}}while(0);HEAP32[HEAP32[HEAP32[r15]+((HEAP32[r21]-1)*24&-1)+8>>2]+4>>2]=r59;HEAP32[r36>>2]=0;HEAP32[r37>>2]=0;HEAP32[r38>>2]=0;HEAP32[r39>>2]=r53;HEAP32[r40>>2]=r49;r52=_findrelpos234(r17,r35,0,0,0);do{if((r52|0)==0){r58=HEAP32[r16],r56=r58>>2;r54=HEAP32[r28];r55=r58+(r54*20&-1)|0;HEAP32[r55>>2]=0;HEAP32[((r54*20&-1)+4>>2)+r56]=0;HEAP32[((r54*20&-1)+8>>2)+r56]=0;HEAP32[((r54*20&-1)+12>>2)+r56]=r53;HEAP32[((r54*20&-1)+16>>2)+r56]=r49;HEAP32[r28]=HEAP32[r28]+1|0;if((HEAP32[r19]|0)==0){r60=r55;break}_add234_internal(r17,r55,-1);r60=r55}else{r60=r52}}while(0);HEAP32[HEAP32[HEAP32[r15]+((HEAP32[r21]-1)*24&-1)+8>>2]+8>>2]=r60;HEAP32[r42>>2]=0;HEAP32[r43>>2]=0;HEAP32[r44>>2]=0;HEAP32[r45>>2]=r51;HEAP32[r46>>2]=r49;r52=_findrelpos234(r17,r41,0,0,0);do{if((r52|0)==0){r53=HEAP32[r16],r55=r53>>2;r56=HEAP32[r28];r54=r53+(r56*20&-1)|0;HEAP32[r54>>2]=0;HEAP32[((r56*20&-1)+4>>2)+r55]=0;HEAP32[((r56*20&-1)+8>>2)+r55]=0;HEAP32[((r56*20&-1)+12>>2)+r55]=r51;HEAP32[((r56*20&-1)+16>>2)+r55]=r49;HEAP32[r28]=HEAP32[r28]+1|0;if((HEAP32[r19]|0)==0){r61=r54;break}_add234_internal(r17,r54,-1);r61=r54}else{r61=r52}}while(0);HEAP32[HEAP32[HEAP32[r15]+((HEAP32[r21]-1)*24&-1)+8>>2]+12>>2]=r61;r52=r50+1|0;if((r52|0)<(r1|0)){r50=r52}else{break L2163}}}}while(0);r50=r47+1|0;if((r50|0)<(r2|0)){r47=r50}else{r3=1563;break}}if(r3==1563){r62=HEAP32[r18>>2];break}else if(r3==1544){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}else{r62=0}}while(0);_freenode234(r62);_free(r14);if((HEAP32[r12]|0)>(r9|0)){___assert_func(69436,1440,70344,67036)}if((HEAP32[r12+4]|0)<=(r10|0)){_grid_make_consistent(r13);STACKTOP=r4;return r13}___assert_func(69436,1441,70344,66776);_grid_make_consistent(r13);STACKTOP=r4;return r13}function _grid_new_honeycomb(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+120|0;r5=r4;r6=r4+20;r7=r4+40;r8=r4+60;r9=r4+80;r10=r4+100;r11=Math.imul(r2,r1);r12=Math.imul((r1<<1)+2|0,r2+1|0);r13=_malloc(48),r14=r13>>2;if((r13|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r15=r13;HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;HEAP32[r14+3]=0;HEAP32[r14+4]=0;HEAP32[r14+5]=0;HEAP32[r14+11]=1;r16=(r13+24|0)>>2;HEAP32[r16]=0;HEAP32[r16+1]=0;HEAP32[r16+2]=0;HEAP32[r16+3]=0;HEAP32[r14+10]=45;r16=_malloc(r11*24&-1);if((r16|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r17=(r13+4|0)>>2;HEAP32[r17]=r16;r16=_malloc(r12*20&-1);if((r16|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r18=(r13+20|0)>>2;HEAP32[r18]=r16;r16=_malloc(8);if((r16|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r19=r16;r20=r16;HEAP32[r20>>2]=0;r21=(r16+4|0)>>2;HEAP32[r21]=42;do{if((r2|0)>0){r22=(r1|0)>0;r23=r13>>2;r24=r10;r25=r10|0;r26=r10+4|0;r27=r10+8|0;r28=r10+12|0;r29=r10+16|0;r30=(r13+16|0)>>2;r31=r9;r32=r9|0;r33=r9+4|0;r34=r9+8|0;r35=r9+12|0;r36=r9+16|0;r37=r8;r38=r8|0;r39=r8+4|0;r40=r8+8|0;r41=r8+12|0;r42=r8+16|0;r43=r7;r44=r7|0;r45=r7+4|0;r46=r7+8|0;r47=r7+12|0;r48=r7+16|0;r49=r6;r50=r6|0;r51=r6+4|0;r52=r6+8|0;r53=r6+12|0;r54=r6+16|0;r55=r5;r56=r5|0;r57=r5+4|0;r58=r5+8|0;r59=r5+12|0;r60=r5+16|0;r61=0;L2215:while(1){L2217:do{if(r22){r62=r61*52&-1;r63=r62+26|0;r64=0;while(1){r65=r64*45&-1;r66=(r64&1|0)==0?r62:r63;r67=HEAP32[r17],r68=r67>>2;r69=HEAP32[r23];HEAP32[((r69*24&-1)>>2)+r68]=6;r70=_malloc(24);if((r70|0)==0){r3=1584;break L2215}r71=r70;r70=(r67+(r69*24&-1)+8|0)>>2;HEAP32[r70]=r71;HEAP32[r71>>2]=0;HEAP32[HEAP32[r70]+4>>2]=0;HEAP32[HEAP32[r70]+8>>2]=0;HEAP32[HEAP32[r70]+12>>2]=0;HEAP32[HEAP32[r70]+16>>2]=0;HEAP32[HEAP32[r70]+20>>2]=0;HEAP32[((r69*24&-1)+4>>2)+r68]=0;HEAP32[((r69*24&-1)+12>>2)+r68]=0;HEAP32[r23]=HEAP32[r23]+1|0;r68=r65-15|0;r69=r66-26|0;HEAP32[r25>>2]=0;HEAP32[r26>>2]=0;HEAP32[r27>>2]=0;HEAP32[r28>>2]=r68;HEAP32[r29>>2]=r69;r70=_findrelpos234(r19,r24,0,0,0);do{if((r70|0)==0){r71=HEAP32[r18],r67=r71>>2;r72=HEAP32[r30];r73=r71+(r72*20&-1)|0;HEAP32[r73>>2]=0;HEAP32[((r72*20&-1)+4>>2)+r67]=0;HEAP32[((r72*20&-1)+8>>2)+r67]=0;HEAP32[((r72*20&-1)+12>>2)+r67]=r68;HEAP32[((r72*20&-1)+16>>2)+r67]=r69;HEAP32[r30]=HEAP32[r30]+1|0;if((HEAP32[r21]|0)==0){r74=r73;break}_add234_internal(r19,r73,-1);r74=r73}else{r74=r70}}while(0);HEAP32[HEAP32[HEAP32[r17]+((HEAP32[r23]-1)*24&-1)+8>>2]>>2]=r74;r70=r65+15|0;HEAP32[r32>>2]=0;HEAP32[r33>>2]=0;HEAP32[r34>>2]=0;HEAP32[r35>>2]=r70;HEAP32[r36>>2]=r69;r73=_findrelpos234(r19,r31,0,0,0);do{if((r73|0)==0){r67=HEAP32[r18],r72=r67>>2;r71=HEAP32[r30];r75=r67+(r71*20&-1)|0;HEAP32[r75>>2]=0;HEAP32[((r71*20&-1)+4>>2)+r72]=0;HEAP32[((r71*20&-1)+8>>2)+r72]=0;HEAP32[((r71*20&-1)+12>>2)+r72]=r70;HEAP32[((r71*20&-1)+16>>2)+r72]=r69;HEAP32[r30]=HEAP32[r30]+1|0;if((HEAP32[r21]|0)==0){r76=r75;break}_add234_internal(r19,r75,-1);r76=r75}else{r76=r73}}while(0);HEAP32[HEAP32[HEAP32[r17]+((HEAP32[r23]-1)*24&-1)+8>>2]+4>>2]=r76;r73=r65+30|0;HEAP32[r38>>2]=0;HEAP32[r39>>2]=0;HEAP32[r40>>2]=0;HEAP32[r41>>2]=r73;HEAP32[r42>>2]=r66;r69=_findrelpos234(r19,r37,0,0,0);do{if((r69|0)==0){r75=HEAP32[r18],r72=r75>>2;r71=HEAP32[r30];r67=r75+(r71*20&-1)|0;HEAP32[r67>>2]=0;HEAP32[((r71*20&-1)+4>>2)+r72]=0;HEAP32[((r71*20&-1)+8>>2)+r72]=0;HEAP32[((r71*20&-1)+12>>2)+r72]=r73;HEAP32[((r71*20&-1)+16>>2)+r72]=r66;HEAP32[r30]=HEAP32[r30]+1|0;if((HEAP32[r21]|0)==0){r77=r67;break}_add234_internal(r19,r67,-1);r77=r67}else{r77=r69}}while(0);HEAP32[HEAP32[HEAP32[r17]+((HEAP32[r23]-1)*24&-1)+8>>2]+8>>2]=r77;r69=r66+26|0;HEAP32[r44>>2]=0;HEAP32[r45>>2]=0;HEAP32[r46>>2]=0;HEAP32[r47>>2]=r70;HEAP32[r48>>2]=r69;r73=_findrelpos234(r19,r43,0,0,0);do{if((r73|0)==0){r67=HEAP32[r18],r72=r67>>2;r71=HEAP32[r30];r75=r67+(r71*20&-1)|0;HEAP32[r75>>2]=0;HEAP32[((r71*20&-1)+4>>2)+r72]=0;HEAP32[((r71*20&-1)+8>>2)+r72]=0;HEAP32[((r71*20&-1)+12>>2)+r72]=r70;HEAP32[((r71*20&-1)+16>>2)+r72]=r69;HEAP32[r30]=HEAP32[r30]+1|0;if((HEAP32[r21]|0)==0){r78=r75;break}_add234_internal(r19,r75,-1);r78=r75}else{r78=r73}}while(0);HEAP32[HEAP32[HEAP32[r17]+((HEAP32[r23]-1)*24&-1)+8>>2]+12>>2]=r78;HEAP32[r50>>2]=0;HEAP32[r51>>2]=0;HEAP32[r52>>2]=0;HEAP32[r53>>2]=r68;HEAP32[r54>>2]=r69;r73=_findrelpos234(r19,r49,0,0,0);do{if((r73|0)==0){r70=HEAP32[r18],r75=r70>>2;r72=HEAP32[r30];r71=r70+(r72*20&-1)|0;HEAP32[r71>>2]=0;HEAP32[((r72*20&-1)+4>>2)+r75]=0;HEAP32[((r72*20&-1)+8>>2)+r75]=0;HEAP32[((r72*20&-1)+12>>2)+r75]=r68;HEAP32[((r72*20&-1)+16>>2)+r75]=r69;HEAP32[r30]=HEAP32[r30]+1|0;if((HEAP32[r21]|0)==0){r79=r71;break}_add234_internal(r19,r71,-1);r79=r71}else{r79=r73}}while(0);HEAP32[HEAP32[HEAP32[r17]+((HEAP32[r23]-1)*24&-1)+8>>2]+16>>2]=r79;r73=r65-30|0;HEAP32[r56>>2]=0;HEAP32[r57>>2]=0;HEAP32[r58>>2]=0;HEAP32[r59>>2]=r73;HEAP32[r60>>2]=r66;r69=_findrelpos234(r19,r55,0,0,0);do{if((r69|0)==0){r68=HEAP32[r18],r71=r68>>2;r75=HEAP32[r30];r72=r68+(r75*20&-1)|0;HEAP32[r72>>2]=0;HEAP32[((r75*20&-1)+4>>2)+r71]=0;HEAP32[((r75*20&-1)+8>>2)+r71]=0;HEAP32[((r75*20&-1)+12>>2)+r71]=r73;HEAP32[((r75*20&-1)+16>>2)+r71]=r66;HEAP32[r30]=HEAP32[r30]+1|0;if((HEAP32[r21]|0)==0){r80=r72;break}_add234_internal(r19,r72,-1);r80=r72}else{r80=r69}}while(0);HEAP32[HEAP32[HEAP32[r17]+((HEAP32[r23]-1)*24&-1)+8>>2]+20>>2]=r80;r69=r64+1|0;if((r69|0)<(r1|0)){r64=r69}else{break L2217}}}}while(0);r64=r61+1|0;if((r64|0)<(r2|0)){r61=r64}else{r3=1611;break}}if(r3==1584){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==1611){r81=HEAP32[r20>>2];break}}else{r81=0}}while(0);_freenode234(r81);_free(r16);if((HEAP32[r14]|0)>(r11|0)){___assert_func(69436,1509,70436,67036)}if((HEAP32[r14+4]|0)<=(r12|0)){_grid_make_consistent(r15);STACKTOP=r4;return r15}___assert_func(69436,1510,70436,66776);_grid_make_consistent(r15);STACKTOP=r4;return r15}function _grid_new_triangular(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r3=0;r4=STACKTOP;r5=r1+1|0;r6=_malloc(48),r7=r6>>2;if((r6|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r8=r6;HEAP32[r7]=0;HEAP32[r7+1]=0;HEAP32[r7+2]=0;HEAP32[r7+3]=0;HEAP32[r7+4]=0;HEAP32[r7+5]=0;HEAP32[r7+11]=1;r9=(r6+24|0)>>2;HEAP32[r9]=0;HEAP32[r9+1]=0;HEAP32[r9+2]=0;HEAP32[r9+3]=0;HEAP32[r7+10]=18;r9=Math.imul(r1<<1,r2);HEAP32[r7]=r9;r7=r2+1|0;r10=Math.imul(r7,r5);r11=r6+16|0;HEAP32[r11>>2]=r10;r10=_malloc(r9*24&-1);if((r10|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r9=r6+4|0;HEAP32[r9>>2]=r10;r10=_malloc(HEAP32[r11>>2]*20&-1);if((r10|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r11=(r6+20|0)>>2;HEAP32[r11]=r10;if((r2|0)<0){_grid_make_consistent(r8);STACKTOP=r4;return r8}r10=(r1|0)<0;r6=0;r12=0;while(1){if(r10){r13=r6}else{r14=(r12&1|0)!=0?15:0;r15=r12*26&-1;r16=r6;r17=0;while(1){r18=HEAP32[r11]>>2;HEAP32[((r16*20&-1)>>2)+r18]=0;HEAP32[((r16*20&-1)+4>>2)+r18]=0;HEAP32[((r16*20&-1)+8>>2)+r18]=0;HEAP32[((r16*20&-1)+12>>2)+r18]=(r17*30&-1)+r14|0;HEAP32[((r16*20&-1)+16>>2)+r18]=r15;r18=r17+1|0;if((r18|0)==(r5|0)){break}r16=r16+1|0;r17=r18}r13=r5+r6|0}r17=r12+1|0;if((r17|0)==(r7|0)){break}else{r6=r13;r12=r17}}if((r2|0)<=0){_grid_make_consistent(r8);STACKTOP=r4;return r8}r12=(r1|0)>0;r13=0;r6=0;L2290:while(1){L2292:do{if(r12){r7=(r6&1|0)==0;r10=Math.imul(r6,r5);r17=r6+1|0;r16=Math.imul(r17,r5);r15=r13;r14=0;while(1){r18=HEAP32[r9>>2],r19=r18>>2;r20=r15+1|0;HEAP32[((r15*24&-1)+4>>2)+r19]=0;HEAP32[((r15*24&-1)>>2)+r19]=3;r21=_malloc(12);if((r21|0)==0){r3=1639;break L2290}r22=(r18+(r15*24&-1)+8|0)>>2;HEAP32[r22]=r21;HEAP32[((r15*24&-1)+12>>2)+r19]=0;HEAP32[((r20*24&-1)+4>>2)+r19]=0;HEAP32[((r20*24&-1)>>2)+r19]=3;r21=_malloc(12);if((r21|0)==0){r3=1641;break L2290}r23=(r18+(r20*24&-1)+8|0)>>2;HEAP32[r23]=r21;HEAP32[((r20*24&-1)+12>>2)+r19]=0;r19=r14+r10|0;HEAP32[HEAP32[r22]>>2]=HEAP32[r11]+(r19*20&-1)|0;r20=HEAP32[r11];if(r7){r21=r19+1|0;HEAP32[HEAP32[r22]+4>>2]=r20+(r21*20&-1)|0;r18=r14+r16|0;HEAP32[HEAP32[r22]+8>>2]=HEAP32[r11]+(r18*20&-1)|0;HEAP32[HEAP32[r23]>>2]=HEAP32[r11]+(r21*20&-1)|0;HEAP32[HEAP32[r23]+4>>2]=HEAP32[r11]+((r18+1)*20&-1)|0;HEAP32[HEAP32[r23]+8>>2]=HEAP32[r11]+(r18*20&-1)|0}else{r18=r14+r16|0;r21=r18+1|0;HEAP32[HEAP32[r22]+4>>2]=r20+(r21*20&-1)|0;HEAP32[HEAP32[r22]+8>>2]=HEAP32[r11]+(r18*20&-1)|0;HEAP32[HEAP32[r23]>>2]=HEAP32[r11]+(r19*20&-1)|0;HEAP32[HEAP32[r23]+4>>2]=HEAP32[r11]+((r19+1)*20&-1)|0;HEAP32[HEAP32[r23]+8>>2]=HEAP32[r11]+(r21*20&-1)|0}r21=r15+2|0;r23=r14+1|0;if((r23|0)<(r1|0)){r15=r21;r14=r23}else{r24=r21;r25=r17;break L2292}}}else{r24=r13;r25=r6+1|0}}while(0);if((r25|0)<(r2|0)){r13=r24;r6=r25}else{r3=1648;break}}if(r3==1648){_grid_make_consistent(r8);STACKTOP=r4;return r8}else if(r3==1639){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==1641){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}function _grid_new_snubsquare(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187,r188,r189,r190,r191,r192,r193,r194,r195,r196;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+400|0;r5=r4;r6=r4+20;r7=r4+40;r8=r4+60;r9=r4+80;r10=r4+100;r11=r4+120;r12=r4+140;r13=r4+160;r14=r4+180;r15=r4+200;r16=r4+220;r17=r4+240;r18=r4+260;r19=r4+280;r20=r4+300;r21=r4+320;r22=r4+340;r23=r4+360;r24=r4+380;r25=Math.imul(r1*3&-1,r2);r26=Math.imul((r1<<1)+2|0,r2+1|0);r27=_malloc(48),r28=r27>>2;if((r27|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r29=r27;HEAP32[r28]=0;HEAP32[r28+1]=0;HEAP32[r28+2]=0;HEAP32[r28+3]=0;HEAP32[r28+4]=0;HEAP32[r28+5]=0;HEAP32[r28+11]=1;r30=(r27+24|0)>>2;HEAP32[r30]=0;HEAP32[r30+1]=0;HEAP32[r30+2]=0;HEAP32[r30+3]=0;HEAP32[r28+10]=18;r30=_malloc(r25*24&-1);if((r30|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r31=(r27+4|0)>>2;HEAP32[r31]=r30;r30=_malloc(r26*20&-1);if((r30|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r32=(r27+20|0)>>2;HEAP32[r32]=r30;r30=_malloc(8);if((r30|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r33=r30;r34=r30;HEAP32[r34>>2]=0;r35=(r30+4|0)>>2;HEAP32[r35]=42;do{if((r2|0)>0){r36=(r1|0)>0;r37=r27>>2;r38=r24;r39=r24|0;r40=r24+4|0;r41=r24+8|0;r42=r24+12|0;r43=r24+16|0;r44=(r27+16|0)>>2;r45=r23;r46=r23|0;r47=r23+4|0;r48=r23+8|0;r49=r23+12|0;r50=r23+16|0;r51=r22;r52=r22|0;r53=r22+4|0;r54=r22+8|0;r55=r22+12|0;r56=r22+16|0;r57=r21;r58=r21|0;r59=r21+4|0;r60=r21+8|0;r61=r21+12|0;r62=r21+16|0;r63=r16;r64=r16|0;r65=r16+4|0;r66=r16+8|0;r67=r16+12|0;r68=r16+16|0;r69=r15;r70=r15|0;r71=r15+4|0;r72=r15+8|0;r73=r15+12|0;r74=r15+16|0;r75=r14;r76=r14|0;r77=r14+4|0;r78=r14+8|0;r79=r14+12|0;r80=r14+16|0;r81=r13;r82=r13|0;r83=r13+4|0;r84=r13+8|0;r85=r13+12|0;r86=r13+16|0;r87=r12;r88=r12|0;r89=r12+4|0;r90=r12+8|0;r91=r12+12|0;r92=r12+16|0;r93=r11;r94=r11|0;r95=r11+4|0;r96=r11+8|0;r97=r11+12|0;r98=r11+16|0;r99=r10;r100=r10|0;r101=r10+4|0;r102=r10+8|0;r103=r10+12|0;r104=r10+16|0;r105=r9;r106=r9|0;r107=r9+4|0;r108=r9+8|0;r109=r9+12|0;r110=r9+16|0;r111=r8;r112=r8|0;r113=r8+4|0;r114=r8+8|0;r115=r8+12|0;r116=r8+16|0;r117=r7;r118=r7|0;r119=r7+4|0;r120=r7+8|0;r121=r7+12|0;r122=r7+16|0;r123=r6;r124=r6|0;r125=r6+4|0;r126=r6+8|0;r127=r6+12|0;r128=r6+16|0;r129=r5;r130=r5|0;r131=r5+4|0;r132=r5+8|0;r133=r5+12|0;r134=r5+16|0;r135=r20;r136=r20|0;r137=r20+4|0;r138=r20+8|0;r139=r20+12|0;r140=r20+16|0;r141=r19;r142=r19|0;r143=r19+4|0;r144=r19+8|0;r145=r19+12|0;r146=r19+16|0;r147=r18;r148=r18|0;r149=r18+4|0;r150=r18+8|0;r151=r18+12|0;r152=r18+16|0;r153=r17;r154=r17|0;r155=r17+4|0;r156=r17+8|0;r157=r17+12|0;r158=r17+16|0;r159=0;L2323:while(1){L2325:do{if(r36){r160=r159*41&-1;r161=r160+15|0;r162=r160+41|0;r163=r160+26|0;r164=(r159|0)>0;r165=r160-15|0;r166=0;while(1){r167=r166*41&-1;r168=HEAP32[r31],r169=r168>>2;r170=HEAP32[r37];HEAP32[((r170*24&-1)>>2)+r169]=4;r171=_malloc(16);if((r171|0)==0){r3=1664;break L2323}r172=r171;r171=(r168+(r170*24&-1)+8|0)>>2;HEAP32[r171]=r172;HEAP32[r172>>2]=0;HEAP32[HEAP32[r171]+4>>2]=0;HEAP32[HEAP32[r171]+8>>2]=0;HEAP32[HEAP32[r171]+12>>2]=0;HEAP32[((r170*24&-1)+4>>2)+r169]=0;HEAP32[((r170*24&-1)+12>>2)+r169]=0;HEAP32[r37]=HEAP32[r37]+1|0;r169=(r166+r159&1|0)!=0;if(r169){r170=r167+15|0;HEAP32[r39>>2]=0;HEAP32[r40>>2]=0;HEAP32[r41>>2]=0;HEAP32[r42>>2]=r170;HEAP32[r43>>2]=r160;r171=_findrelpos234(r33,r38,0,0,0);do{if((r171|0)==0){r172=HEAP32[r32],r168=r172>>2;r173=HEAP32[r44];r174=r172+(r173*20&-1)|0;HEAP32[r174>>2]=0;HEAP32[((r173*20&-1)+4>>2)+r168]=0;HEAP32[((r173*20&-1)+8>>2)+r168]=0;HEAP32[((r173*20&-1)+12>>2)+r168]=r170;HEAP32[((r173*20&-1)+16>>2)+r168]=r160;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r175=r174;break}_add234_internal(r33,r174,-1);r175=r174}else{r175=r171}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]>>2]=r175;r171=r167+41|0;HEAP32[r46>>2]=0;HEAP32[r47>>2]=0;HEAP32[r48>>2]=0;HEAP32[r49>>2]=r171;HEAP32[r50>>2]=r161;r170=_findrelpos234(r33,r45,0,0,0);do{if((r170|0)==0){r174=HEAP32[r32],r168=r174>>2;r173=HEAP32[r44];r172=r174+(r173*20&-1)|0;HEAP32[r172>>2]=0;HEAP32[((r173*20&-1)+4>>2)+r168]=0;HEAP32[((r173*20&-1)+8>>2)+r168]=0;HEAP32[((r173*20&-1)+12>>2)+r168]=r171;HEAP32[((r173*20&-1)+16>>2)+r168]=r161;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r176=r172;break}_add234_internal(r33,r172,-1);r176=r172}else{r176=r170}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]+4>>2]=r176;r170=r167+26|0;HEAP32[r52>>2]=0;HEAP32[r53>>2]=0;HEAP32[r54>>2]=0;HEAP32[r55>>2]=r170;HEAP32[r56>>2]=r162;r171=_findrelpos234(r33,r51,0,0,0);do{if((r171|0)==0){r172=HEAP32[r32],r168=r172>>2;r173=HEAP32[r44];r174=r172+(r173*20&-1)|0;HEAP32[r174>>2]=0;HEAP32[((r173*20&-1)+4>>2)+r168]=0;HEAP32[((r173*20&-1)+8>>2)+r168]=0;HEAP32[((r173*20&-1)+12>>2)+r168]=r170;HEAP32[((r173*20&-1)+16>>2)+r168]=r162;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r177=r174;break}_add234_internal(r33,r174,-1);r177=r174}else{r177=r171}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]+8>>2]=r177;HEAP32[r58>>2]=0;HEAP32[r59>>2]=0;HEAP32[r60>>2]=0;HEAP32[r61>>2]=r167;HEAP32[r62>>2]=r163;r171=_findrelpos234(r33,r57,0,0,0);do{if((r171|0)==0){r170=HEAP32[r32],r174=r170>>2;r168=HEAP32[r44];r173=r170+(r168*20&-1)|0;HEAP32[r173>>2]=0;HEAP32[((r168*20&-1)+4>>2)+r174]=0;HEAP32[((r168*20&-1)+8>>2)+r174]=0;HEAP32[((r168*20&-1)+12>>2)+r174]=r167;HEAP32[((r168*20&-1)+16>>2)+r174]=r163;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r178=r173;break}_add234_internal(r33,r173,-1);r178=r173}else{r178=r171}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]+12>>2]=r178}else{r171=r167+26|0;HEAP32[r136>>2]=0;HEAP32[r137>>2]=0;HEAP32[r138>>2]=0;HEAP32[r139>>2]=r171;HEAP32[r140>>2]=r160;r173=_findrelpos234(r33,r135,0,0,0);do{if((r173|0)==0){r174=HEAP32[r32],r168=r174>>2;r170=HEAP32[r44];r172=r174+(r170*20&-1)|0;HEAP32[r172>>2]=0;HEAP32[((r170*20&-1)+4>>2)+r168]=0;HEAP32[((r170*20&-1)+8>>2)+r168]=0;HEAP32[((r170*20&-1)+12>>2)+r168]=r171;HEAP32[((r170*20&-1)+16>>2)+r168]=r160;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r179=r172;break}_add234_internal(r33,r172,-1);r179=r172}else{r179=r173}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]>>2]=r179;r173=r167+15|0;r171=r167+41|0;HEAP32[r142>>2]=0;HEAP32[r143>>2]=0;HEAP32[r144>>2]=0;HEAP32[r145>>2]=r171;HEAP32[r146>>2]=r163;r172=_findrelpos234(r33,r141,0,0,0);do{if((r172|0)==0){r168=HEAP32[r32],r170=r168>>2;r174=HEAP32[r44];r180=r168+(r174*20&-1)|0;HEAP32[r180>>2]=0;HEAP32[((r174*20&-1)+4>>2)+r170]=0;HEAP32[((r174*20&-1)+8>>2)+r170]=0;HEAP32[((r174*20&-1)+12>>2)+r170]=r171;HEAP32[((r174*20&-1)+16>>2)+r170]=r163;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r181=r180;break}_add234_internal(r33,r180,-1);r181=r180}else{r181=r172}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]+4>>2]=r181;HEAP32[r148>>2]=0;HEAP32[r149>>2]=0;HEAP32[r150>>2]=0;HEAP32[r151>>2]=r173;HEAP32[r152>>2]=r162;r172=_findrelpos234(r33,r147,0,0,0);do{if((r172|0)==0){r171=HEAP32[r32],r180=r171>>2;r170=HEAP32[r44];r174=r171+(r170*20&-1)|0;HEAP32[r174>>2]=0;HEAP32[((r170*20&-1)+4>>2)+r180]=0;HEAP32[((r170*20&-1)+8>>2)+r180]=0;HEAP32[((r170*20&-1)+12>>2)+r180]=r173;HEAP32[((r170*20&-1)+16>>2)+r180]=r162;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r182=r174;break}_add234_internal(r33,r174,-1);r182=r174}else{r182=r172}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]+8>>2]=r182;HEAP32[r154>>2]=0;HEAP32[r155>>2]=0;HEAP32[r156>>2]=0;HEAP32[r157>>2]=r167;HEAP32[r158>>2]=r161;r172=_findrelpos234(r33,r153,0,0,0);do{if((r172|0)==0){r173=HEAP32[r32],r174=r173>>2;r180=HEAP32[r44];r170=r173+(r180*20&-1)|0;HEAP32[r170>>2]=0;HEAP32[((r180*20&-1)+4>>2)+r174]=0;HEAP32[((r180*20&-1)+8>>2)+r174]=0;HEAP32[((r180*20&-1)+12>>2)+r174]=r167;HEAP32[((r180*20&-1)+16>>2)+r174]=r161;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r183=r170;break}_add234_internal(r33,r170,-1);r183=r170}else{r183=r172}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]+12>>2]=r183}do{if((r166|0)>0){r172=HEAP32[r31],r170=r172>>2;r174=HEAP32[r37];HEAP32[((r174*24&-1)>>2)+r170]=3;r180=_malloc(12);if((r180|0)==0){r3=1702;break L2323}r173=r180;r180=(r172+(r174*24&-1)+8|0)>>2;HEAP32[r180]=r173;HEAP32[r173>>2]=0;HEAP32[HEAP32[r180]+4>>2]=0;HEAP32[HEAP32[r180]+8>>2]=0;HEAP32[((r174*24&-1)+4>>2)+r170]=0;HEAP32[((r174*24&-1)+12>>2)+r170]=0;HEAP32[r37]=HEAP32[r37]+1|0;if(r169){r170=r167+15|0;HEAP32[r64>>2]=0;HEAP32[r65>>2]=0;HEAP32[r66>>2]=0;HEAP32[r67>>2]=r170;HEAP32[r68>>2]=r160;r174=_findrelpos234(r33,r63,0,0,0);do{if((r174|0)==0){r180=HEAP32[r32],r173=r180>>2;r172=HEAP32[r44];r171=r180+(r172*20&-1)|0;HEAP32[r171>>2]=0;HEAP32[((r172*20&-1)+4>>2)+r173]=0;HEAP32[((r172*20&-1)+8>>2)+r173]=0;HEAP32[((r172*20&-1)+12>>2)+r173]=r170;HEAP32[((r172*20&-1)+16>>2)+r173]=r160;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r184=r171;break}_add234_internal(r33,r171,-1);r184=r171}else{r184=r174}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]>>2]=r184;HEAP32[r70>>2]=0;HEAP32[r71>>2]=0;HEAP32[r72>>2]=0;HEAP32[r73>>2]=r167;HEAP32[r74>>2]=r163;r174=_findrelpos234(r33,r69,0,0,0);do{if((r174|0)==0){r170=HEAP32[r32],r171=r170>>2;r173=HEAP32[r44];r172=r170+(r173*20&-1)|0;HEAP32[r172>>2]=0;HEAP32[((r173*20&-1)+4>>2)+r171]=0;HEAP32[((r173*20&-1)+8>>2)+r171]=0;HEAP32[((r173*20&-1)+12>>2)+r171]=r167;HEAP32[((r173*20&-1)+16>>2)+r171]=r163;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r185=r172;break}_add234_internal(r33,r172,-1);r185=r172}else{r185=r174}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]+4>>2]=r185;r174=r167-15|0;HEAP32[r76>>2]=0;HEAP32[r77>>2]=0;HEAP32[r78>>2]=0;HEAP32[r79>>2]=r174;HEAP32[r80>>2]=r160;r172=_findrelpos234(r33,r75,0,0,0);do{if((r172|0)==0){r171=HEAP32[r32],r173=r171>>2;r170=HEAP32[r44];r180=r171+(r170*20&-1)|0;HEAP32[r180>>2]=0;HEAP32[((r170*20&-1)+4>>2)+r173]=0;HEAP32[((r170*20&-1)+8>>2)+r173]=0;HEAP32[((r170*20&-1)+12>>2)+r173]=r174;HEAP32[((r170*20&-1)+16>>2)+r173]=r160;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r186=r180;break}_add234_internal(r33,r180,-1);r186=r180}else{r186=r172}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]+8>>2]=r186;break}else{HEAP32[r82>>2]=0;HEAP32[r83>>2]=0;HEAP32[r84>>2]=0;HEAP32[r85>>2]=r167;HEAP32[r86>>2]=r161;r172=_findrelpos234(r33,r81,0,0,0);do{if((r172|0)==0){r174=HEAP32[r32],r180=r174>>2;r173=HEAP32[r44];r170=r174+(r173*20&-1)|0;HEAP32[r170>>2]=0;HEAP32[((r173*20&-1)+4>>2)+r180]=0;HEAP32[((r173*20&-1)+8>>2)+r180]=0;HEAP32[((r173*20&-1)+12>>2)+r180]=r167;HEAP32[((r173*20&-1)+16>>2)+r180]=r161;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r187=r170;break}_add234_internal(r33,r170,-1);r187=r170}else{r187=r172}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]>>2]=r187;r172=r167+15|0;HEAP32[r88>>2]=0;HEAP32[r89>>2]=0;HEAP32[r90>>2]=0;HEAP32[r91>>2]=r172;HEAP32[r92>>2]=r162;r170=_findrelpos234(r33,r87,0,0,0);do{if((r170|0)==0){r180=HEAP32[r32],r173=r180>>2;r174=HEAP32[r44];r171=r180+(r174*20&-1)|0;HEAP32[r171>>2]=0;HEAP32[((r174*20&-1)+4>>2)+r173]=0;HEAP32[((r174*20&-1)+8>>2)+r173]=0;HEAP32[((r174*20&-1)+12>>2)+r173]=r172;HEAP32[((r174*20&-1)+16>>2)+r173]=r162;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r188=r171;break}_add234_internal(r33,r171,-1);r188=r171}else{r188=r170}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]+4>>2]=r188;r170=r167-15|0;HEAP32[r94>>2]=0;HEAP32[r95>>2]=0;HEAP32[r96>>2]=0;HEAP32[r97>>2]=r170;HEAP32[r98>>2]=r162;r172=_findrelpos234(r33,r93,0,0,0);do{if((r172|0)==0){r171=HEAP32[r32],r173=r171>>2;r174=HEAP32[r44];r180=r171+(r174*20&-1)|0;HEAP32[r180>>2]=0;HEAP32[((r174*20&-1)+4>>2)+r173]=0;HEAP32[((r174*20&-1)+8>>2)+r173]=0;HEAP32[((r174*20&-1)+12>>2)+r173]=r170;HEAP32[((r174*20&-1)+16>>2)+r173]=r162;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r189=r180;break}_add234_internal(r33,r180,-1);r189=r180}else{r189=r172}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]+8>>2]=r189;break}}}while(0);do{if(r164){r172=HEAP32[r31],r170=r172>>2;r180=HEAP32[r37];HEAP32[((r180*24&-1)>>2)+r170]=3;r173=_malloc(12);if((r173|0)==0){r3=1732;break L2323}r174=r173;r173=(r172+(r180*24&-1)+8|0)>>2;HEAP32[r173]=r174;HEAP32[r174>>2]=0;HEAP32[HEAP32[r173]+4>>2]=0;HEAP32[HEAP32[r173]+8>>2]=0;HEAP32[((r180*24&-1)+4>>2)+r170]=0;HEAP32[((r180*24&-1)+12>>2)+r170]=0;HEAP32[r37]=HEAP32[r37]+1|0;if(r169){r170=r167+15|0;HEAP32[r100>>2]=0;HEAP32[r101>>2]=0;HEAP32[r102>>2]=0;HEAP32[r103>>2]=r170;HEAP32[r104>>2]=r160;r180=_findrelpos234(r33,r99,0,0,0);do{if((r180|0)==0){r173=HEAP32[r32],r174=r173>>2;r172=HEAP32[r44];r171=r173+(r172*20&-1)|0;HEAP32[r171>>2]=0;HEAP32[((r172*20&-1)+4>>2)+r174]=0;HEAP32[((r172*20&-1)+8>>2)+r174]=0;HEAP32[((r172*20&-1)+12>>2)+r174]=r170;HEAP32[((r172*20&-1)+16>>2)+r174]=r160;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r190=r171;break}_add234_internal(r33,r171,-1);r190=r171}else{r190=r180}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]>>2]=r190;r180=r167+41|0;HEAP32[r106>>2]=0;HEAP32[r107>>2]=0;HEAP32[r108>>2]=0;HEAP32[r109>>2]=r180;HEAP32[r110>>2]=r165;r170=_findrelpos234(r33,r105,0,0,0);do{if((r170|0)==0){r171=HEAP32[r32],r174=r171>>2;r172=HEAP32[r44];r173=r171+(r172*20&-1)|0;HEAP32[r173>>2]=0;HEAP32[((r172*20&-1)+4>>2)+r174]=0;HEAP32[((r172*20&-1)+8>>2)+r174]=0;HEAP32[((r172*20&-1)+12>>2)+r174]=r180;HEAP32[((r172*20&-1)+16>>2)+r174]=r165;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r191=r173;break}_add234_internal(r33,r173,-1);r191=r173}else{r191=r170}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]+4>>2]=r191;HEAP32[r112>>2]=0;HEAP32[r113>>2]=0;HEAP32[r114>>2]=0;HEAP32[r115>>2]=r180;HEAP32[r116>>2]=r161;r170=_findrelpos234(r33,r111,0,0,0);do{if((r170|0)==0){r173=HEAP32[r32],r174=r173>>2;r172=HEAP32[r44];r171=r173+(r172*20&-1)|0;HEAP32[r171>>2]=0;HEAP32[((r172*20&-1)+4>>2)+r174]=0;HEAP32[((r172*20&-1)+8>>2)+r174]=0;HEAP32[((r172*20&-1)+12>>2)+r174]=r180;HEAP32[((r172*20&-1)+16>>2)+r174]=r161;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r192=r171;break}_add234_internal(r33,r171,-1);r192=r171}else{r192=r170}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]+8>>2]=r192;break}else{HEAP32[r118>>2]=0;HEAP32[r119>>2]=0;HEAP32[r120>>2]=0;HEAP32[r121>>2]=r167;HEAP32[r122>>2]=r165;r170=_findrelpos234(r33,r117,0,0,0);do{if((r170|0)==0){r180=HEAP32[r32],r171=r180>>2;r174=HEAP32[r44];r172=r180+(r174*20&-1)|0;HEAP32[r172>>2]=0;HEAP32[((r174*20&-1)+4>>2)+r171]=0;HEAP32[((r174*20&-1)+8>>2)+r171]=0;HEAP32[((r174*20&-1)+12>>2)+r171]=r167;HEAP32[((r174*20&-1)+16>>2)+r171]=r165;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r193=r172;break}_add234_internal(r33,r172,-1);r193=r172}else{r193=r170}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]>>2]=r193;r170=r167+26|0;HEAP32[r124>>2]=0;HEAP32[r125>>2]=0;HEAP32[r126>>2]=0;HEAP32[r127>>2]=r170;HEAP32[r128>>2]=r160;r172=_findrelpos234(r33,r123,0,0,0);do{if((r172|0)==0){r171=HEAP32[r32],r174=r171>>2;r180=HEAP32[r44];r173=r171+(r180*20&-1)|0;HEAP32[r173>>2]=0;HEAP32[((r180*20&-1)+4>>2)+r174]=0;HEAP32[((r180*20&-1)+8>>2)+r174]=0;HEAP32[((r180*20&-1)+12>>2)+r174]=r170;HEAP32[((r180*20&-1)+16>>2)+r174]=r160;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r194=r173;break}_add234_internal(r33,r173,-1);r194=r173}else{r194=r172}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]+4>>2]=r194;HEAP32[r130>>2]=0;HEAP32[r131>>2]=0;HEAP32[r132>>2]=0;HEAP32[r133>>2]=r167;HEAP32[r134>>2]=r161;r172=_findrelpos234(r33,r129,0,0,0);do{if((r172|0)==0){r170=HEAP32[r32],r173=r170>>2;r174=HEAP32[r44];r180=r170+(r174*20&-1)|0;HEAP32[r180>>2]=0;HEAP32[((r174*20&-1)+4>>2)+r173]=0;HEAP32[((r174*20&-1)+8>>2)+r173]=0;HEAP32[((r174*20&-1)+12>>2)+r173]=r167;HEAP32[((r174*20&-1)+16>>2)+r173]=r161;HEAP32[r44]=HEAP32[r44]+1|0;if((HEAP32[r35]|0)==0){r195=r180;break}_add234_internal(r33,r180,-1);r195=r180}else{r195=r172}}while(0);HEAP32[HEAP32[HEAP32[r31]+((HEAP32[r37]-1)*24&-1)+8>>2]+8>>2]=r195;break}}}while(0);r167=r166+1|0;if((r167|0)<(r1|0)){r166=r167}else{break L2325}}}}while(0);r166=r159+1|0;if((r166|0)<(r2|0)){r159=r166}else{r3=1762;break}}if(r3==1702){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==1762){r196=HEAP32[r34>>2];break}else if(r3==1664){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==1732){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}else{r196=0}}while(0);_freenode234(r196);_free(r30);if((HEAP32[r28]|0)>(r25|0)){___assert_func(69436,1718,70360,67036)}if((HEAP32[r28+4]|0)<=(r26|0)){_grid_make_consistent(r29);STACKTOP=r4;return r29}___assert_func(69436,1719,70360,66776);_grid_make_consistent(r29);STACKTOP=r4;return r29}function _grid_new_cairo(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187,r188,r189;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+380|0;r5=r4;r6=r4+20;r7=r4+40;r8=r4+60;r9=r4+80;r10=r4+100;r11=r4+120;r12=r4+140;r13=r4+160;r14=r4+180;r15=r4+200;r16=r4+220;r17=r4+240;r18=r4+260;r19=r4+280;r20=r4+300;r21=r4+320;r22=r4+340;r23=r4+360;r24=Math.imul(r1<<1,r2);r25=Math.imul((r1*3&-1)+3|0,r2+1|0);r26=_malloc(48),r27=r26>>2;if((r26|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r28=r26;HEAP32[r27]=0;HEAP32[r27+1]=0;HEAP32[r27+2]=0;HEAP32[r27+3]=0;HEAP32[r27+4]=0;HEAP32[r27+5]=0;HEAP32[r27+11]=1;r29=(r26+24|0)>>2;HEAP32[r29]=0;HEAP32[r29+1]=0;HEAP32[r29+2]=0;HEAP32[r29+3]=0;HEAP32[r27+10]=40;r29=_malloc(r24*24&-1);if((r29|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r30=(r26+4|0)>>2;HEAP32[r30]=r29;r29=_malloc(r25*20&-1);if((r29|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r31=(r26+20|0)>>2;HEAP32[r31]=r29;r29=_malloc(8);if((r29|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r32=r29;r33=r29;HEAP32[r33>>2]=0;r34=(r29+4|0)>>2;HEAP32[r34]=42;do{if((r2|0)>0){r35=(r1|0)>0;r36=r26>>2;r37=r18;r38=r18|0;r39=r18+4|0;r40=r18+8|0;r41=r18+12|0;r42=r18+16|0;r43=(r26+16|0)>>2;r44=r17;r45=r17|0;r46=r17+4|0;r47=r17+8|0;r48=r17+12|0;r49=r17+16|0;r50=r16;r51=r16|0;r52=r16+4|0;r53=r16+8|0;r54=r16+12|0;r55=r16+16|0;r56=r15;r57=r15|0;r58=r15+4|0;r59=r15+8|0;r60=r15+12|0;r61=r15+16|0;r62=r14;r63=r14|0;r64=r14+4|0;r65=r14+8|0;r66=r14+12|0;r67=r14+16|0;r68=r23;r69=r23|0;r70=r23+4|0;r71=r23+8|0;r72=r23+12|0;r73=r23+16|0;r74=r22;r75=r22|0;r76=r22+4|0;r77=r22+8|0;r78=r22+12|0;r79=r22+16|0;r80=r21;r81=r21|0;r82=r21+4|0;r83=r21+8|0;r84=r21+12|0;r85=r21+16|0;r86=r20;r87=r20|0;r88=r20+4|0;r89=r20+8|0;r90=r20+12|0;r91=r20+16|0;r92=r19;r93=r19|0;r94=r19+4|0;r95=r19+8|0;r96=r19+12|0;r97=r19+16|0;r98=r13;r99=r13|0;r100=r13+4|0;r101=r13+8|0;r102=r13+12|0;r103=r13+16|0;r104=r8;r105=r8|0;r106=r8+4|0;r107=r8+8|0;r108=r8+12|0;r109=r8+16|0;r110=r7;r111=r7|0;r112=r7+4|0;r113=r7+8|0;r114=r7+12|0;r115=r7+16|0;r116=r6;r117=r6|0;r118=r6+4|0;r119=r6+8|0;r120=r6+12|0;r121=r6+16|0;r122=r5;r123=r5|0;r124=r5+4|0;r125=r5+8|0;r126=r5+12|0;r127=r5+16|0;r128=r12;r129=r12|0;r130=r12+4|0;r131=r12+8|0;r132=r12+12|0;r133=r12+16|0;r134=r11;r135=r11|0;r136=r11+4|0;r137=r11+8|0;r138=r11+12|0;r139=r11+16|0;r140=r10;r141=r10|0;r142=r10+4|0;r143=r10+8|0;r144=r10+12|0;r145=r10+16|0;r146=r9;r147=r9|0;r148=r9+4|0;r149=r9+8|0;r150=r9+12|0;r151=r9+16|0;r152=0;L2477:while(1){L2479:do{if(r35){r153=r152*62&-1;r154=(r152|0)>0;r155=r153-14|0;r156=r153+31|0;r157=r153-31|0;r158=r153+14|0;r159=r153+62|0;r160=r153+48|0;r161=0;while(1){r162=r161*62&-1;do{if(r154){r163=HEAP32[r30],r164=r163>>2;r165=HEAP32[r36];HEAP32[((r165*24&-1)>>2)+r164]=5;r166=_malloc(20);if((r166|0)==0){r3=1784;break L2477}r167=r166;r166=(r163+(r165*24&-1)+8|0)>>2;HEAP32[r166]=r167;HEAP32[r167>>2]=0;HEAP32[HEAP32[r166]+4>>2]=0;HEAP32[HEAP32[r166]+8>>2]=0;HEAP32[HEAP32[r166]+12>>2]=0;HEAP32[HEAP32[r166]+16>>2]=0;HEAP32[((r165*24&-1)+4>>2)+r164]=0;HEAP32[((r165*24&-1)+12>>2)+r164]=0;HEAP32[r36]=HEAP32[r36]+1|0;if((r161+r152&1|0)==0){HEAP32[r38>>2]=0;HEAP32[r39>>2]=0;HEAP32[r40>>2]=0;HEAP32[r41>>2]=r162;HEAP32[r42>>2]=r153;r164=_findrelpos234(r32,r37,0,0,0);do{if((r164|0)==0){r165=HEAP32[r31],r166=r165>>2;r167=HEAP32[r43];r163=r165+(r167*20&-1)|0;HEAP32[r163>>2]=0;HEAP32[((r167*20&-1)+4>>2)+r166]=0;HEAP32[((r167*20&-1)+8>>2)+r166]=0;HEAP32[((r167*20&-1)+12>>2)+r166]=r162;HEAP32[((r167*20&-1)+16>>2)+r166]=r153;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r168=r163;break}_add234_internal(r32,r163,-1);r168=r163}else{r168=r164}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]>>2]=r168;r164=r162+31|0;HEAP32[r45>>2]=0;HEAP32[r46>>2]=0;HEAP32[r47>>2]=0;HEAP32[r48>>2]=r164;HEAP32[r49>>2]=r155;r163=_findrelpos234(r32,r44,0,0,0);do{if((r163|0)==0){r166=HEAP32[r31],r167=r166>>2;r165=HEAP32[r43];r169=r166+(r165*20&-1)|0;HEAP32[r169>>2]=0;HEAP32[((r165*20&-1)+4>>2)+r167]=0;HEAP32[((r165*20&-1)+8>>2)+r167]=0;HEAP32[((r165*20&-1)+12>>2)+r167]=r164;HEAP32[((r165*20&-1)+16>>2)+r167]=r155;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r170=r169;break}_add234_internal(r32,r169,-1);r170=r169}else{r170=r163}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]+4>>2]=r170;r163=r162+62|0;HEAP32[r51>>2]=0;HEAP32[r52>>2]=0;HEAP32[r53>>2]=0;HEAP32[r54>>2]=r163;HEAP32[r55>>2]=r153;r164=_findrelpos234(r32,r50,0,0,0);do{if((r164|0)==0){r169=HEAP32[r31],r167=r169>>2;r165=HEAP32[r43];r166=r169+(r165*20&-1)|0;HEAP32[r166>>2]=0;HEAP32[((r165*20&-1)+4>>2)+r167]=0;HEAP32[((r165*20&-1)+8>>2)+r167]=0;HEAP32[((r165*20&-1)+12>>2)+r167]=r163;HEAP32[((r165*20&-1)+16>>2)+r167]=r153;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r171=r166;break}_add234_internal(r32,r166,-1);r171=r166}else{r171=r164}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]+8>>2]=r171;r164=r162+48|0;HEAP32[r57>>2]=0;HEAP32[r58>>2]=0;HEAP32[r59>>2]=0;HEAP32[r60>>2]=r164;HEAP32[r61>>2]=r156;r163=_findrelpos234(r32,r56,0,0,0);do{if((r163|0)==0){r166=HEAP32[r31],r167=r166>>2;r165=HEAP32[r43];r169=r166+(r165*20&-1)|0;HEAP32[r169>>2]=0;HEAP32[((r165*20&-1)+4>>2)+r167]=0;HEAP32[((r165*20&-1)+8>>2)+r167]=0;HEAP32[((r165*20&-1)+12>>2)+r167]=r164;HEAP32[((r165*20&-1)+16>>2)+r167]=r156;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r172=r169;break}_add234_internal(r32,r169,-1);r172=r169}else{r172=r163}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]+12>>2]=r172;r163=r162+14|0;HEAP32[r63>>2]=0;HEAP32[r64>>2]=0;HEAP32[r65>>2]=0;HEAP32[r66>>2]=r163;HEAP32[r67>>2]=r156;r164=_findrelpos234(r32,r62,0,0,0);do{if((r164|0)==0){r169=HEAP32[r31],r167=r169>>2;r165=HEAP32[r43];r166=r169+(r165*20&-1)|0;HEAP32[r166>>2]=0;HEAP32[((r165*20&-1)+4>>2)+r167]=0;HEAP32[((r165*20&-1)+8>>2)+r167]=0;HEAP32[((r165*20&-1)+12>>2)+r167]=r163;HEAP32[((r165*20&-1)+16>>2)+r167]=r156;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r173=r166;break}_add234_internal(r32,r166,-1);r173=r166}else{r173=r164}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]+16>>2]=r173;break}else{r164=r162+14|0;HEAP32[r69>>2]=0;HEAP32[r70>>2]=0;HEAP32[r71>>2]=0;HEAP32[r72>>2]=r164;HEAP32[r73>>2]=r157;r163=_findrelpos234(r32,r68,0,0,0);do{if((r163|0)==0){r166=HEAP32[r31],r167=r166>>2;r165=HEAP32[r43];r169=r166+(r165*20&-1)|0;HEAP32[r169>>2]=0;HEAP32[((r165*20&-1)+4>>2)+r167]=0;HEAP32[((r165*20&-1)+8>>2)+r167]=0;HEAP32[((r165*20&-1)+12>>2)+r167]=r164;HEAP32[((r165*20&-1)+16>>2)+r167]=r157;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r174=r169;break}_add234_internal(r32,r169,-1);r174=r169}else{r174=r163}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]>>2]=r174;r163=r162+62|0;r164=r162+48|0;HEAP32[r75>>2]=0;HEAP32[r76>>2]=0;HEAP32[r77>>2]=0;HEAP32[r78>>2]=r164;HEAP32[r79>>2]=r157;r169=_findrelpos234(r32,r74,0,0,0);do{if((r169|0)==0){r167=HEAP32[r31],r165=r167>>2;r166=HEAP32[r43];r175=r167+(r166*20&-1)|0;HEAP32[r175>>2]=0;HEAP32[((r166*20&-1)+4>>2)+r165]=0;HEAP32[((r166*20&-1)+8>>2)+r165]=0;HEAP32[((r166*20&-1)+12>>2)+r165]=r164;HEAP32[((r166*20&-1)+16>>2)+r165]=r157;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r176=r175;break}_add234_internal(r32,r175,-1);r176=r175}else{r176=r169}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]+4>>2]=r176;HEAP32[r81>>2]=0;HEAP32[r82>>2]=0;HEAP32[r83>>2]=0;HEAP32[r84>>2]=r163;HEAP32[r85>>2]=r153;r169=_findrelpos234(r32,r80,0,0,0);do{if((r169|0)==0){r164=HEAP32[r31],r175=r164>>2;r165=HEAP32[r43];r166=r164+(r165*20&-1)|0;HEAP32[r166>>2]=0;HEAP32[((r165*20&-1)+4>>2)+r175]=0;HEAP32[((r165*20&-1)+8>>2)+r175]=0;HEAP32[((r165*20&-1)+12>>2)+r175]=r163;HEAP32[((r165*20&-1)+16>>2)+r175]=r153;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r177=r166;break}_add234_internal(r32,r166,-1);r177=r166}else{r177=r169}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]+8>>2]=r177;r169=r162+31|0;HEAP32[r87>>2]=0;HEAP32[r88>>2]=0;HEAP32[r89>>2]=0;HEAP32[r90>>2]=r169;HEAP32[r91>>2]=r158;r163=_findrelpos234(r32,r86,0,0,0);do{if((r163|0)==0){r166=HEAP32[r31],r175=r166>>2;r165=HEAP32[r43];r164=r166+(r165*20&-1)|0;HEAP32[r164>>2]=0;HEAP32[((r165*20&-1)+4>>2)+r175]=0;HEAP32[((r165*20&-1)+8>>2)+r175]=0;HEAP32[((r165*20&-1)+12>>2)+r175]=r169;HEAP32[((r165*20&-1)+16>>2)+r175]=r158;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r178=r164;break}_add234_internal(r32,r164,-1);r178=r164}else{r178=r163}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]+12>>2]=r178;HEAP32[r93>>2]=0;HEAP32[r94>>2]=0;HEAP32[r95>>2]=0;HEAP32[r96>>2]=r162;HEAP32[r97>>2]=r153;r163=_findrelpos234(r32,r92,0,0,0);do{if((r163|0)==0){r169=HEAP32[r31],r164=r169>>2;r175=HEAP32[r43];r165=r169+(r175*20&-1)|0;HEAP32[r165>>2]=0;HEAP32[((r175*20&-1)+4>>2)+r164]=0;HEAP32[((r175*20&-1)+8>>2)+r164]=0;HEAP32[((r175*20&-1)+12>>2)+r164]=r162;HEAP32[((r175*20&-1)+16>>2)+r164]=r153;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r179=r165;break}_add234_internal(r32,r165,-1);r179=r165}else{r179=r163}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]+16>>2]=r179;break}}}while(0);do{if((r161|0)>0){r163=HEAP32[r30],r165=r163>>2;r164=HEAP32[r36];HEAP32[((r164*24&-1)>>2)+r165]=5;r175=_malloc(20);if((r175|0)==0){r3=1830;break L2477}r169=r175;r175=(r163+(r164*24&-1)+8|0)>>2;HEAP32[r175]=r169;HEAP32[r169>>2]=0;HEAP32[HEAP32[r175]+4>>2]=0;HEAP32[HEAP32[r175]+8>>2]=0;HEAP32[HEAP32[r175]+12>>2]=0;HEAP32[HEAP32[r175]+16>>2]=0;HEAP32[((r164*24&-1)+4>>2)+r165]=0;HEAP32[((r164*24&-1)+12>>2)+r165]=0;HEAP32[r36]=HEAP32[r36]+1|0;r165=(r161+r152&1|0)==0;HEAP32[r99>>2]=0;HEAP32[r100>>2]=0;HEAP32[r101>>2]=0;HEAP32[r102>>2]=r162;HEAP32[r103>>2]=r153;r164=_findrelpos234(r32,r98,0,0,0);do{if((r164|0)==0){r175=HEAP32[r31],r169=r175>>2;r163=HEAP32[r43];r166=r175+(r163*20&-1)|0;HEAP32[r166>>2]=0;HEAP32[((r163*20&-1)+4>>2)+r169]=0;HEAP32[((r163*20&-1)+8>>2)+r169]=0;HEAP32[((r163*20&-1)+12>>2)+r169]=r162;HEAP32[((r163*20&-1)+16>>2)+r169]=r153;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r180=r166;break}_add234_internal(r32,r166,-1);r180=r166}else{r180=r164}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]>>2]=r180;if(r165){r164=r162+14|0;HEAP32[r105>>2]=0;HEAP32[r106>>2]=0;HEAP32[r107>>2]=0;HEAP32[r108>>2]=r164;HEAP32[r109>>2]=r156;r166=_findrelpos234(r32,r104,0,0,0);do{if((r166|0)==0){r169=HEAP32[r31],r163=r169>>2;r175=HEAP32[r43];r167=r169+(r175*20&-1)|0;HEAP32[r167>>2]=0;HEAP32[((r175*20&-1)+4>>2)+r163]=0;HEAP32[((r175*20&-1)+8>>2)+r163]=0;HEAP32[((r175*20&-1)+12>>2)+r163]=r164;HEAP32[((r175*20&-1)+16>>2)+r163]=r156;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r181=r167;break}_add234_internal(r32,r167,-1);r181=r167}else{r181=r166}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]+4>>2]=r181;HEAP32[r111>>2]=0;HEAP32[r112>>2]=0;HEAP32[r113>>2]=0;HEAP32[r114>>2]=r162;HEAP32[r115>>2]=r159;r166=_findrelpos234(r32,r110,0,0,0);do{if((r166|0)==0){r164=HEAP32[r31],r165=r164>>2;r167=HEAP32[r43];r163=r164+(r167*20&-1)|0;HEAP32[r163>>2]=0;HEAP32[((r167*20&-1)+4>>2)+r165]=0;HEAP32[((r167*20&-1)+8>>2)+r165]=0;HEAP32[((r167*20&-1)+12>>2)+r165]=r162;HEAP32[((r167*20&-1)+16>>2)+r165]=r159;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r182=r163;break}_add234_internal(r32,r163,-1);r182=r163}else{r182=r166}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]+8>>2]=r182;r166=r162-31|0;HEAP32[r117>>2]=0;HEAP32[r118>>2]=0;HEAP32[r119>>2]=0;HEAP32[r120>>2]=r166;HEAP32[r121>>2]=r160;r163=_findrelpos234(r32,r116,0,0,0);do{if((r163|0)==0){r165=HEAP32[r31],r167=r165>>2;r164=HEAP32[r43];r175=r165+(r164*20&-1)|0;HEAP32[r175>>2]=0;HEAP32[((r164*20&-1)+4>>2)+r167]=0;HEAP32[((r164*20&-1)+8>>2)+r167]=0;HEAP32[((r164*20&-1)+12>>2)+r167]=r166;HEAP32[((r164*20&-1)+16>>2)+r167]=r160;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r183=r175;break}_add234_internal(r32,r175,-1);r183=r175}else{r183=r163}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]+12>>2]=r183;HEAP32[r123>>2]=0;HEAP32[r124>>2]=0;HEAP32[r125>>2]=0;HEAP32[r126>>2]=r166;HEAP32[r127>>2]=r158;r163=_findrelpos234(r32,r122,0,0,0);do{if((r163|0)==0){r175=HEAP32[r31],r167=r175>>2;r164=HEAP32[r43];r165=r175+(r164*20&-1)|0;HEAP32[r165>>2]=0;HEAP32[((r164*20&-1)+4>>2)+r167]=0;HEAP32[((r164*20&-1)+8>>2)+r167]=0;HEAP32[((r164*20&-1)+12>>2)+r167]=r166;HEAP32[((r164*20&-1)+16>>2)+r167]=r158;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r184=r165;break}_add234_internal(r32,r165,-1);r184=r165}else{r184=r163}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]+16>>2]=r184;break}else{r163=r162+31|0;HEAP32[r129>>2]=0;HEAP32[r130>>2]=0;HEAP32[r131>>2]=0;HEAP32[r132>>2]=r163;HEAP32[r133>>2]=r158;r166=_findrelpos234(r32,r128,0,0,0);do{if((r166|0)==0){r165=HEAP32[r31],r167=r165>>2;r164=HEAP32[r43];r175=r165+(r164*20&-1)|0;HEAP32[r175>>2]=0;HEAP32[((r164*20&-1)+4>>2)+r167]=0;HEAP32[((r164*20&-1)+8>>2)+r167]=0;HEAP32[((r164*20&-1)+12>>2)+r167]=r163;HEAP32[((r164*20&-1)+16>>2)+r167]=r158;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r185=r175;break}_add234_internal(r32,r175,-1);r185=r175}else{r185=r166}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]+4>>2]=r185;HEAP32[r135>>2]=0;HEAP32[r136>>2]=0;HEAP32[r137>>2]=0;HEAP32[r138>>2]=r163;HEAP32[r139>>2]=r160;r166=_findrelpos234(r32,r134,0,0,0);do{if((r166|0)==0){r175=HEAP32[r31],r167=r175>>2;r164=HEAP32[r43];r165=r175+(r164*20&-1)|0;HEAP32[r165>>2]=0;HEAP32[((r164*20&-1)+4>>2)+r167]=0;HEAP32[((r164*20&-1)+8>>2)+r167]=0;HEAP32[((r164*20&-1)+12>>2)+r167]=r163;HEAP32[((r164*20&-1)+16>>2)+r167]=r160;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r186=r165;break}_add234_internal(r32,r165,-1);r186=r165}else{r186=r166}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]+8>>2]=r186;HEAP32[r141>>2]=0;HEAP32[r142>>2]=0;HEAP32[r143>>2]=0;HEAP32[r144>>2]=r162;HEAP32[r145>>2]=r159;r166=_findrelpos234(r32,r140,0,0,0);do{if((r166|0)==0){r163=HEAP32[r31],r165=r163>>2;r167=HEAP32[r43];r164=r163+(r167*20&-1)|0;HEAP32[r164>>2]=0;HEAP32[((r167*20&-1)+4>>2)+r165]=0;HEAP32[((r167*20&-1)+8>>2)+r165]=0;HEAP32[((r167*20&-1)+12>>2)+r165]=r162;HEAP32[((r167*20&-1)+16>>2)+r165]=r159;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r187=r164;break}_add234_internal(r32,r164,-1);r187=r164}else{r187=r166}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]+12>>2]=r187;r166=r162-14|0;HEAP32[r147>>2]=0;HEAP32[r148>>2]=0;HEAP32[r149>>2]=0;HEAP32[r150>>2]=r166;HEAP32[r151>>2]=r156;r164=_findrelpos234(r32,r146,0,0,0);do{if((r164|0)==0){r165=HEAP32[r31],r167=r165>>2;r163=HEAP32[r43];r175=r165+(r163*20&-1)|0;HEAP32[r175>>2]=0;HEAP32[((r163*20&-1)+4>>2)+r167]=0;HEAP32[((r163*20&-1)+8>>2)+r167]=0;HEAP32[((r163*20&-1)+12>>2)+r167]=r166;HEAP32[((r163*20&-1)+16>>2)+r167]=r156;HEAP32[r43]=HEAP32[r43]+1|0;if((HEAP32[r34]|0)==0){r188=r175;break}_add234_internal(r32,r175,-1);r188=r175}else{r188=r164}}while(0);HEAP32[HEAP32[HEAP32[r30]+((HEAP32[r36]-1)*24&-1)+8>>2]+16>>2]=r188;break}}}while(0);r162=r161+1|0;if((r162|0)<(r1|0)){r161=r162}else{break L2479}}}}while(0);r161=r152+1|0;if((r161|0)<(r2|0)){r152=r161}else{r3=1872;break}}if(r3==1784){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==1830){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==1872){r189=HEAP32[r33>>2];break}}else{r189=0}}while(0);_freenode234(r189);_free(r29);if((HEAP32[r27]|0)>(r24|0)){___assert_func(69436,1824,70548,67036)}if((HEAP32[r27+4]|0)<=(r25|0)){_grid_make_consistent(r28);STACKTOP=r4;return r28}___assert_func(69436,1825,70548,66776);_grid_make_consistent(r28);STACKTOP=r4;return r28}function _grid_new_greathexagonal(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187,r188,r189,r190,r191,r192,r193,r194,r195,r196,r197,r198,r199,r200,r201,r202,r203,r204,r205,r206,r207,r208,r209,r210,r211,r212,r213,r214,r215,r216,r217,r218,r219,r220,r221,r222,r223,r224,r225,r226,r227,r228,r229,r230,r231,r232,r233,r234;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+480|0;r5=r4;r6=r4+20;r7=r4+40;r8=r4+60;r9=r4+80;r10=r4+100;r11=r4+120;r12=r4+140;r13=r4+160;r14=r4+180;r15=r4+200;r16=r4+220;r17=r4+240;r18=r4+260;r19=r4+280;r20=r4+300;r21=r4+320;r22=r4+340;r23=r4+360;r24=r4+380;r25=r4+400;r26=r4+420;r27=r4+440;r28=r4+460;r29=r1*6&-1;r30=Math.imul(r29+6|0,r2+1|0);r31=Math.imul(r29,r2);r29=_malloc(48),r32=r29>>2;if((r29|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r33=r29;HEAP32[r32]=0;HEAP32[r32+1]=0;HEAP32[r32+2]=0;HEAP32[r32+3]=0;HEAP32[r32+4]=0;HEAP32[r32+5]=0;HEAP32[r32+11]=1;r34=(r29+24|0)>>2;HEAP32[r34]=0;HEAP32[r34+1]=0;HEAP32[r34+2]=0;HEAP32[r34+3]=0;HEAP32[r32+10]=18;r34=_malloc(r30*24&-1);if((r34|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r35=(r29+4|0)>>2;HEAP32[r35]=r34;r34=_malloc(r31*20&-1);if((r34|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r36=(r29+20|0)>>2;HEAP32[r36]=r34;r34=_malloc(8);if((r34|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r37=r34;r38=r34;HEAP32[r38>>2]=0;r39=(r34+4|0)>>2;HEAP32[r39]=42;do{if((r2|0)>0){r40=(r1|0)>0;r41=r29>>2;r42=r28;r43=r28|0;r44=r28+4|0;r45=r28+8|0;r46=r28+12|0;r47=r28+16|0;r48=(r29+16|0)>>2;r49=r27;r50=r27|0;r51=r27+4|0;r52=r27+8|0;r53=r27+12|0;r54=r27+16|0;r55=r26;r56=r26|0;r57=r26+4|0;r58=r26+8|0;r59=r26+12|0;r60=r26+16|0;r61=r25;r62=r25|0;r63=r25+4|0;r64=r25+8|0;r65=r25+12|0;r66=r25+16|0;r67=r24;r68=r24|0;r69=r24+4|0;r70=r24+8|0;r71=r24+12|0;r72=r24+16|0;r73=r23;r74=r23|0;r75=r23+4|0;r76=r23+8|0;r77=r23+12|0;r78=r23+16|0;r79=r2-1|0;r80=r22;r81=r22|0;r82=r22+4|0;r83=r22+8|0;r84=r22+12|0;r85=r22+16|0;r86=r21;r87=r21|0;r88=r21+4|0;r89=r21+8|0;r90=r21+12|0;r91=r21+16|0;r92=r20;r93=r20|0;r94=r20+4|0;r95=r20+8|0;r96=r20+12|0;r97=r20+16|0;r98=r19;r99=r19|0;r100=r19+4|0;r101=r19+8|0;r102=r19+12|0;r103=r19+16|0;r104=r1-1|0;r105=r18;r106=r18|0;r107=r18+4|0;r108=r18+8|0;r109=r18+12|0;r110=r18+16|0;r111=r17;r112=r17|0;r113=r17+4|0;r114=r17+8|0;r115=r17+12|0;r116=r17+16|0;r117=r16;r118=r16|0;r119=r16+4|0;r120=r16+8|0;r121=r16+12|0;r122=r16+16|0;r123=r15;r124=r15|0;r125=r15+4|0;r126=r15+8|0;r127=r15+12|0;r128=r15+16|0;r129=r14;r130=r14|0;r131=r14+4|0;r132=r14+8|0;r133=r14+12|0;r134=r14+16|0;r135=r13;r136=r13|0;r137=r13+4|0;r138=r13+8|0;r139=r13+12|0;r140=r13+16|0;r141=r12;r142=r12|0;r143=r12+4|0;r144=r12+8|0;r145=r12+12|0;r146=r12+16|0;r147=r11;r148=r11|0;r149=r11+4|0;r150=r11+8|0;r151=r11+12|0;r152=r11+16|0;r153=r7;r154=r7|0;r155=r7+4|0;r156=r7+8|0;r157=r7+12|0;r158=r7+16|0;r159=r6;r160=r6|0;r161=r6+4|0;r162=r6+8|0;r163=r6+12|0;r164=r6+16|0;r165=r5;r166=r5|0;r167=r5+4|0;r168=r5+8|0;r169=r5+12|0;r170=r5+16|0;r171=r10;r172=r10|0;r173=r10+4|0;r174=r10+8|0;r175=r10+12|0;r176=r10+16|0;r177=r9;r178=r9|0;r179=r9+4|0;r180=r9+8|0;r181=r9+12|0;r182=r9+16|0;r183=r8;r184=r8|0;r185=r8+4|0;r186=r8+8|0;r187=r8+12|0;r188=r8+16|0;r189=0;L2620:while(1){L2622:do{if(r40){r190=r189*82&-1;r191=r190+41|0;r192=(r189|0)<(r79|0);r193=r192^1;r194=0;while(1){r195=r194*71&-1;r196=(r194&1|0)==0;r197=r196?r190:r191;r198=HEAP32[r35],r199=r198>>2;r200=HEAP32[r41];HEAP32[((r200*24&-1)>>2)+r199]=6;r201=_malloc(24);if((r201|0)==0){r3=1893;break L2620}r202=r201;r201=(r198+(r200*24&-1)+8|0)>>2;HEAP32[r201]=r202;HEAP32[r202>>2]=0;HEAP32[HEAP32[r201]+4>>2]=0;HEAP32[HEAP32[r201]+8>>2]=0;HEAP32[HEAP32[r201]+12>>2]=0;HEAP32[HEAP32[r201]+16>>2]=0;HEAP32[HEAP32[r201]+20>>2]=0;HEAP32[((r200*24&-1)+4>>2)+r199]=0;HEAP32[((r200*24&-1)+12>>2)+r199]=0;HEAP32[r41]=HEAP32[r41]+1|0;r199=r195-15|0;r200=r197-26|0;HEAP32[r43>>2]=0;HEAP32[r44>>2]=0;HEAP32[r45>>2]=0;HEAP32[r46>>2]=r199;HEAP32[r47>>2]=r200;r201=_findrelpos234(r37,r42,0,0,0);do{if((r201|0)==0){r202=HEAP32[r36],r198=r202>>2;r203=HEAP32[r48];r204=r202+(r203*20&-1)|0;HEAP32[r204>>2]=0;HEAP32[((r203*20&-1)+4>>2)+r198]=0;HEAP32[((r203*20&-1)+8>>2)+r198]=0;HEAP32[((r203*20&-1)+12>>2)+r198]=r199;HEAP32[((r203*20&-1)+16>>2)+r198]=r200;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r205=r204;break}_add234_internal(r37,r204,-1);r205=r204}else{r205=r201}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]>>2]=r205;r201=r195+15|0;HEAP32[r50>>2]=0;HEAP32[r51>>2]=0;HEAP32[r52>>2]=0;HEAP32[r53>>2]=r201;HEAP32[r54>>2]=r200;r204=_findrelpos234(r37,r49,0,0,0);do{if((r204|0)==0){r198=HEAP32[r36],r203=r198>>2;r202=HEAP32[r48];r206=r198+(r202*20&-1)|0;HEAP32[r206>>2]=0;HEAP32[((r202*20&-1)+4>>2)+r203]=0;HEAP32[((r202*20&-1)+8>>2)+r203]=0;HEAP32[((r202*20&-1)+12>>2)+r203]=r201;HEAP32[((r202*20&-1)+16>>2)+r203]=r200;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r207=r206;break}_add234_internal(r37,r206,-1);r207=r206}else{r207=r204}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+4>>2]=r207;r204=r195+30|0;HEAP32[r56>>2]=0;HEAP32[r57>>2]=0;HEAP32[r58>>2]=0;HEAP32[r59>>2]=r204;HEAP32[r60>>2]=r197;r200=_findrelpos234(r37,r55,0,0,0);do{if((r200|0)==0){r206=HEAP32[r36],r203=r206>>2;r202=HEAP32[r48];r198=r206+(r202*20&-1)|0;HEAP32[r198>>2]=0;HEAP32[((r202*20&-1)+4>>2)+r203]=0;HEAP32[((r202*20&-1)+8>>2)+r203]=0;HEAP32[((r202*20&-1)+12>>2)+r203]=r204;HEAP32[((r202*20&-1)+16>>2)+r203]=r197;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r208=r198;break}_add234_internal(r37,r198,-1);r208=r198}else{r208=r200}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+8>>2]=r208;r200=r197+26|0;HEAP32[r62>>2]=0;HEAP32[r63>>2]=0;HEAP32[r64>>2]=0;HEAP32[r65>>2]=r201;HEAP32[r66>>2]=r200;r198=_findrelpos234(r37,r61,0,0,0);do{if((r198|0)==0){r203=HEAP32[r36],r202=r203>>2;r206=HEAP32[r48];r209=r203+(r206*20&-1)|0;HEAP32[r209>>2]=0;HEAP32[((r206*20&-1)+4>>2)+r202]=0;HEAP32[((r206*20&-1)+8>>2)+r202]=0;HEAP32[((r206*20&-1)+12>>2)+r202]=r201;HEAP32[((r206*20&-1)+16>>2)+r202]=r200;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r210=r209;break}_add234_internal(r37,r209,-1);r210=r209}else{r210=r198}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+12>>2]=r210;HEAP32[r68>>2]=0;HEAP32[r69>>2]=0;HEAP32[r70>>2]=0;HEAP32[r71>>2]=r199;HEAP32[r72>>2]=r200;r198=_findrelpos234(r37,r67,0,0,0);do{if((r198|0)==0){r209=HEAP32[r36],r202=r209>>2;r206=HEAP32[r48];r203=r209+(r206*20&-1)|0;HEAP32[r203>>2]=0;HEAP32[((r206*20&-1)+4>>2)+r202]=0;HEAP32[((r206*20&-1)+8>>2)+r202]=0;HEAP32[((r206*20&-1)+12>>2)+r202]=r199;HEAP32[((r206*20&-1)+16>>2)+r202]=r200;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r211=r203;break}_add234_internal(r37,r203,-1);r211=r203}else{r211=r198}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+16>>2]=r211;r198=r195-30|0;HEAP32[r74>>2]=0;HEAP32[r75>>2]=0;HEAP32[r76>>2]=0;HEAP32[r77>>2]=r198;HEAP32[r78>>2]=r197;r203=_findrelpos234(r37,r73,0,0,0);do{if((r203|0)==0){r202=HEAP32[r36],r206=r202>>2;r209=HEAP32[r48];r212=r202+(r209*20&-1)|0;HEAP32[r212>>2]=0;HEAP32[((r209*20&-1)+4>>2)+r206]=0;HEAP32[((r209*20&-1)+8>>2)+r206]=0;HEAP32[((r209*20&-1)+12>>2)+r206]=r198;HEAP32[((r209*20&-1)+16>>2)+r206]=r197;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r213=r212;break}_add234_internal(r37,r212,-1);r213=r212}else{r213=r203}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+20>>2]=r213;if(r192){r203=HEAP32[r35],r212=r203>>2;r206=HEAP32[r41];HEAP32[((r206*24&-1)>>2)+r212]=4;r209=_malloc(16);if((r209|0)==0){r3=1920;break L2620}r202=r209;r209=(r203+(r206*24&-1)+8|0)>>2;HEAP32[r209]=r202;HEAP32[r202>>2]=0;HEAP32[HEAP32[r209]+4>>2]=0;HEAP32[HEAP32[r209]+8>>2]=0;HEAP32[HEAP32[r209]+12>>2]=0;HEAP32[((r206*24&-1)+4>>2)+r212]=0;HEAP32[((r206*24&-1)+12>>2)+r212]=0;HEAP32[r41]=HEAP32[r41]+1|0;HEAP32[r81>>2]=0;HEAP32[r82>>2]=0;HEAP32[r83>>2]=0;HEAP32[r84>>2]=r199;HEAP32[r85>>2]=r200;r212=_findrelpos234(r37,r80,0,0,0);do{if((r212|0)==0){r206=HEAP32[r36],r209=r206>>2;r202=HEAP32[r48];r203=r206+(r202*20&-1)|0;HEAP32[r203>>2]=0;HEAP32[((r202*20&-1)+4>>2)+r209]=0;HEAP32[((r202*20&-1)+8>>2)+r209]=0;HEAP32[((r202*20&-1)+12>>2)+r209]=r199;HEAP32[((r202*20&-1)+16>>2)+r209]=r200;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r214=r203;break}_add234_internal(r37,r203,-1);r214=r203}else{r214=r212}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]>>2]=r214;HEAP32[r87>>2]=0;HEAP32[r88>>2]=0;HEAP32[r89>>2]=0;HEAP32[r90>>2]=r201;HEAP32[r91>>2]=r200;r212=_findrelpos234(r37,r86,0,0,0);do{if((r212|0)==0){r203=HEAP32[r36],r209=r203>>2;r202=HEAP32[r48];r206=r203+(r202*20&-1)|0;HEAP32[r206>>2]=0;HEAP32[((r202*20&-1)+4>>2)+r209]=0;HEAP32[((r202*20&-1)+8>>2)+r209]=0;HEAP32[((r202*20&-1)+12>>2)+r209]=r201;HEAP32[((r202*20&-1)+16>>2)+r209]=r200;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r215=r206;break}_add234_internal(r37,r206,-1);r215=r206}else{r215=r212}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+4>>2]=r215;r212=r197+56|0;HEAP32[r93>>2]=0;HEAP32[r94>>2]=0;HEAP32[r95>>2]=0;HEAP32[r96>>2]=r201;HEAP32[r97>>2]=r212;r206=_findrelpos234(r37,r92,0,0,0);do{if((r206|0)==0){r209=HEAP32[r36],r202=r209>>2;r203=HEAP32[r48];r216=r209+(r203*20&-1)|0;HEAP32[r216>>2]=0;HEAP32[((r203*20&-1)+4>>2)+r202]=0;HEAP32[((r203*20&-1)+8>>2)+r202]=0;HEAP32[((r203*20&-1)+12>>2)+r202]=r201;HEAP32[((r203*20&-1)+16>>2)+r202]=r212;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r217=r216;break}_add234_internal(r37,r216,-1);r217=r216}else{r217=r206}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+8>>2]=r217;HEAP32[r99>>2]=0;HEAP32[r100>>2]=0;HEAP32[r101>>2]=0;HEAP32[r102>>2]=r199;HEAP32[r103>>2]=r212;r206=_findrelpos234(r37,r98,0,0,0);do{if((r206|0)==0){r216=HEAP32[r36],r202=r216>>2;r203=HEAP32[r48];r209=r216+(r203*20&-1)|0;HEAP32[r209>>2]=0;HEAP32[((r203*20&-1)+4>>2)+r202]=0;HEAP32[((r203*20&-1)+8>>2)+r202]=0;HEAP32[((r203*20&-1)+12>>2)+r202]=r199;HEAP32[((r203*20&-1)+16>>2)+r202]=r212;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r218=r209;break}_add234_internal(r37,r209,-1);r218=r209}else{r218=r206}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+12>>2]=r218}r206=(r194|0)<(r104|0);r212=r196|r192;if(r206&r212){r209=HEAP32[r35],r202=r209>>2;r203=HEAP32[r41];HEAP32[((r203*24&-1)>>2)+r202]=4;r216=_malloc(16);if((r216|0)==0){r3=1940;break L2620}r219=r216;r216=(r209+(r203*24&-1)+8|0)>>2;HEAP32[r216]=r219;HEAP32[r219>>2]=0;HEAP32[HEAP32[r216]+4>>2]=0;HEAP32[HEAP32[r216]+8>>2]=0;HEAP32[HEAP32[r216]+12>>2]=0;HEAP32[((r203*24&-1)+4>>2)+r202]=0;HEAP32[((r203*24&-1)+12>>2)+r202]=0;HEAP32[r41]=HEAP32[r41]+1|0;HEAP32[r106>>2]=0;HEAP32[r107>>2]=0;HEAP32[r108>>2]=0;HEAP32[r109>>2]=r204;HEAP32[r110>>2]=r197;r202=_findrelpos234(r37,r105,0,0,0);do{if((r202|0)==0){r203=HEAP32[r36],r216=r203>>2;r219=HEAP32[r48];r209=r203+(r219*20&-1)|0;HEAP32[r209>>2]=0;HEAP32[((r219*20&-1)+4>>2)+r216]=0;HEAP32[((r219*20&-1)+8>>2)+r216]=0;HEAP32[((r219*20&-1)+12>>2)+r216]=r204;HEAP32[((r219*20&-1)+16>>2)+r216]=r197;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r220=r209;break}_add234_internal(r37,r209,-1);r220=r209}else{r220=r202}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]>>2]=r220;r202=r195+56|0;r204=r197+15|0;HEAP32[r112>>2]=0;HEAP32[r113>>2]=0;HEAP32[r114>>2]=0;HEAP32[r115>>2]=r202;HEAP32[r116>>2]=r204;r196=_findrelpos234(r37,r111,0,0,0);do{if((r196|0)==0){r209=HEAP32[r36],r216=r209>>2;r219=HEAP32[r48];r203=r209+(r219*20&-1)|0;HEAP32[r203>>2]=0;HEAP32[((r219*20&-1)+4>>2)+r216]=0;HEAP32[((r219*20&-1)+8>>2)+r216]=0;HEAP32[((r219*20&-1)+12>>2)+r216]=r202;HEAP32[((r219*20&-1)+16>>2)+r216]=r204;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r221=r203;break}_add234_internal(r37,r203,-1);r221=r203}else{r221=r196}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+4>>2]=r221;r196=r195+41|0;r204=r197+41|0;HEAP32[r118>>2]=0;HEAP32[r119>>2]=0;HEAP32[r120>>2]=0;HEAP32[r121>>2]=r196;HEAP32[r122>>2]=r204;r202=_findrelpos234(r37,r117,0,0,0);do{if((r202|0)==0){r203=HEAP32[r36],r216=r203>>2;r219=HEAP32[r48];r209=r203+(r219*20&-1)|0;HEAP32[r209>>2]=0;HEAP32[((r219*20&-1)+4>>2)+r216]=0;HEAP32[((r219*20&-1)+8>>2)+r216]=0;HEAP32[((r219*20&-1)+12>>2)+r216]=r196;HEAP32[((r219*20&-1)+16>>2)+r216]=r204;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r222=r209;break}_add234_internal(r37,r209,-1);r222=r209}else{r222=r202}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+8>>2]=r222;HEAP32[r124>>2]=0;HEAP32[r125>>2]=0;HEAP32[r126>>2]=0;HEAP32[r127>>2]=r201;HEAP32[r128>>2]=r200;r202=_findrelpos234(r37,r123,0,0,0);do{if((r202|0)==0){r204=HEAP32[r36],r196=r204>>2;r209=HEAP32[r48];r216=r204+(r209*20&-1)|0;HEAP32[r216>>2]=0;HEAP32[((r209*20&-1)+4>>2)+r196]=0;HEAP32[((r209*20&-1)+8>>2)+r196]=0;HEAP32[((r209*20&-1)+12>>2)+r196]=r201;HEAP32[((r209*20&-1)+16>>2)+r196]=r200;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r223=r216;break}_add234_internal(r37,r216,-1);r223=r216}else{r223=r202}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+12>>2]=r223}r202=(r194|0)>0;if(r202&r212){r216=HEAP32[r35],r196=r216>>2;r209=HEAP32[r41];HEAP32[((r209*24&-1)>>2)+r196]=4;r204=_malloc(16);if((r204|0)==0){r3=1960;break L2620}r219=r204;r204=(r216+(r209*24&-1)+8|0)>>2;HEAP32[r204]=r219;HEAP32[r219>>2]=0;HEAP32[HEAP32[r204]+4>>2]=0;HEAP32[HEAP32[r204]+8>>2]=0;HEAP32[HEAP32[r204]+12>>2]=0;HEAP32[((r209*24&-1)+4>>2)+r196]=0;HEAP32[((r209*24&-1)+12>>2)+r196]=0;HEAP32[r41]=HEAP32[r41]+1|0;HEAP32[r130>>2]=0;HEAP32[r131>>2]=0;HEAP32[r132>>2]=0;HEAP32[r133>>2]=r198;HEAP32[r134>>2]=r197;r196=_findrelpos234(r37,r129,0,0,0);do{if((r196|0)==0){r209=HEAP32[r36],r204=r209>>2;r219=HEAP32[r48];r216=r209+(r219*20&-1)|0;HEAP32[r216>>2]=0;HEAP32[((r219*20&-1)+4>>2)+r204]=0;HEAP32[((r219*20&-1)+8>>2)+r204]=0;HEAP32[((r219*20&-1)+12>>2)+r204]=r198;HEAP32[((r219*20&-1)+16>>2)+r204]=r197;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r224=r216;break}_add234_internal(r37,r216,-1);r224=r216}else{r224=r196}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]>>2]=r224;HEAP32[r136>>2]=0;HEAP32[r137>>2]=0;HEAP32[r138>>2]=0;HEAP32[r139>>2]=r199;HEAP32[r140>>2]=r200;r196=_findrelpos234(r37,r135,0,0,0);do{if((r196|0)==0){r198=HEAP32[r36],r212=r198>>2;r216=HEAP32[r48];r204=r198+(r216*20&-1)|0;HEAP32[r204>>2]=0;HEAP32[((r216*20&-1)+4>>2)+r212]=0;HEAP32[((r216*20&-1)+8>>2)+r212]=0;HEAP32[((r216*20&-1)+12>>2)+r212]=r199;HEAP32[((r216*20&-1)+16>>2)+r212]=r200;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r225=r204;break}_add234_internal(r37,r204,-1);r225=r204}else{r225=r196}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+4>>2]=r225;r196=r195-41|0;r204=r197+15|0;r212=r197+41|0;HEAP32[r142>>2]=0;HEAP32[r143>>2]=0;HEAP32[r144>>2]=0;HEAP32[r145>>2]=r196;HEAP32[r146>>2]=r212;r216=_findrelpos234(r37,r141,0,0,0);do{if((r216|0)==0){r198=HEAP32[r36],r219=r198>>2;r209=HEAP32[r48];r203=r198+(r209*20&-1)|0;HEAP32[r203>>2]=0;HEAP32[((r209*20&-1)+4>>2)+r219]=0;HEAP32[((r209*20&-1)+8>>2)+r219]=0;HEAP32[((r209*20&-1)+12>>2)+r219]=r196;HEAP32[((r209*20&-1)+16>>2)+r219]=r212;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r226=r203;break}_add234_internal(r37,r203,-1);r226=r203}else{r226=r216}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+8>>2]=r226;r216=r195-56|0;HEAP32[r148>>2]=0;HEAP32[r149>>2]=0;HEAP32[r150>>2]=0;HEAP32[r151>>2]=r216;HEAP32[r152>>2]=r204;r212=_findrelpos234(r37,r147,0,0,0);do{if((r212|0)==0){r196=HEAP32[r36],r203=r196>>2;r219=HEAP32[r48];r209=r196+(r219*20&-1)|0;HEAP32[r209>>2]=0;HEAP32[((r219*20&-1)+4>>2)+r203]=0;HEAP32[((r219*20&-1)+8>>2)+r203]=0;HEAP32[((r219*20&-1)+12>>2)+r203]=r216;HEAP32[((r219*20&-1)+16>>2)+r203]=r204;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r227=r209;break}_add234_internal(r37,r209,-1);r227=r209}else{r227=r212}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+12>>2]=r227}if(!(r206^1|r193)){r212=HEAP32[r35],r204=r212>>2;r216=HEAP32[r41];HEAP32[((r216*24&-1)>>2)+r204]=3;r209=_malloc(12);if((r209|0)==0){r3=1980;break L2620}r203=r209;r209=(r212+(r216*24&-1)+8|0)>>2;HEAP32[r209]=r203;HEAP32[r203>>2]=0;HEAP32[HEAP32[r209]+4>>2]=0;HEAP32[HEAP32[r209]+8>>2]=0;HEAP32[((r216*24&-1)+4>>2)+r204]=0;HEAP32[((r216*24&-1)+12>>2)+r204]=0;HEAP32[r41]=HEAP32[r41]+1|0;HEAP32[r172>>2]=0;HEAP32[r173>>2]=0;HEAP32[r174>>2]=0;HEAP32[r175>>2]=r201;HEAP32[r176>>2]=r200;r204=_findrelpos234(r37,r171,0,0,0);do{if((r204|0)==0){r216=HEAP32[r36],r209=r216>>2;r203=HEAP32[r48];r212=r216+(r203*20&-1)|0;HEAP32[r212>>2]=0;HEAP32[((r203*20&-1)+4>>2)+r209]=0;HEAP32[((r203*20&-1)+8>>2)+r209]=0;HEAP32[((r203*20&-1)+12>>2)+r209]=r201;HEAP32[((r203*20&-1)+16>>2)+r209]=r200;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r228=r212;break}_add234_internal(r37,r212,-1);r228=r212}else{r228=r204}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]>>2]=r228;r204=r195+41|0;r206=r197+41|0;HEAP32[r178>>2]=0;HEAP32[r179>>2]=0;HEAP32[r180>>2]=0;HEAP32[r181>>2]=r204;HEAP32[r182>>2]=r206;r212=_findrelpos234(r37,r177,0,0,0);do{if((r212|0)==0){r209=HEAP32[r36],r203=r209>>2;r216=HEAP32[r48];r219=r209+(r216*20&-1)|0;HEAP32[r219>>2]=0;HEAP32[((r216*20&-1)+4>>2)+r203]=0;HEAP32[((r216*20&-1)+8>>2)+r203]=0;HEAP32[((r216*20&-1)+12>>2)+r203]=r204;HEAP32[((r216*20&-1)+16>>2)+r203]=r206;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r229=r219;break}_add234_internal(r37,r219,-1);r229=r219}else{r229=r212}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+4>>2]=r229;r212=r197+56|0;HEAP32[r184>>2]=0;HEAP32[r185>>2]=0;HEAP32[r186>>2]=0;HEAP32[r187>>2]=r201;HEAP32[r188>>2]=r212;r206=_findrelpos234(r37,r183,0,0,0);do{if((r206|0)==0){r204=HEAP32[r36],r219=r204>>2;r203=HEAP32[r48];r216=r204+(r203*20&-1)|0;HEAP32[r216>>2]=0;HEAP32[((r203*20&-1)+4>>2)+r219]=0;HEAP32[((r203*20&-1)+8>>2)+r219]=0;HEAP32[((r203*20&-1)+12>>2)+r219]=r201;HEAP32[((r203*20&-1)+16>>2)+r219]=r212;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r230=r216;break}_add234_internal(r37,r216,-1);r230=r216}else{r230=r206}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+8>>2]=r230}if(!(r202^1|r193)){r206=HEAP32[r35],r212=r206>>2;r201=HEAP32[r41];HEAP32[((r201*24&-1)>>2)+r212]=3;r216=_malloc(12);if((r216|0)==0){r3=1996;break L2620}r219=r216;r216=(r206+(r201*24&-1)+8|0)>>2;HEAP32[r216]=r219;HEAP32[r219>>2]=0;HEAP32[HEAP32[r216]+4>>2]=0;HEAP32[HEAP32[r216]+8>>2]=0;HEAP32[((r201*24&-1)+4>>2)+r212]=0;HEAP32[((r201*24&-1)+12>>2)+r212]=0;HEAP32[r41]=HEAP32[r41]+1|0;HEAP32[r154>>2]=0;HEAP32[r155>>2]=0;HEAP32[r156>>2]=0;HEAP32[r157>>2]=r199;HEAP32[r158>>2]=r200;r212=_findrelpos234(r37,r153,0,0,0);do{if((r212|0)==0){r201=HEAP32[r36],r216=r201>>2;r219=HEAP32[r48];r206=r201+(r219*20&-1)|0;HEAP32[r206>>2]=0;HEAP32[((r219*20&-1)+4>>2)+r216]=0;HEAP32[((r219*20&-1)+8>>2)+r216]=0;HEAP32[((r219*20&-1)+12>>2)+r216]=r199;HEAP32[((r219*20&-1)+16>>2)+r216]=r200;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r231=r206;break}_add234_internal(r37,r206,-1);r231=r206}else{r231=r212}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]>>2]=r231;r212=r197+56|0;HEAP32[r160>>2]=0;HEAP32[r161>>2]=0;HEAP32[r162>>2]=0;HEAP32[r163>>2]=r199;HEAP32[r164>>2]=r212;r200=_findrelpos234(r37,r159,0,0,0);do{if((r200|0)==0){r202=HEAP32[r36],r206=r202>>2;r216=HEAP32[r48];r219=r202+(r216*20&-1)|0;HEAP32[r219>>2]=0;HEAP32[((r216*20&-1)+4>>2)+r206]=0;HEAP32[((r216*20&-1)+8>>2)+r206]=0;HEAP32[((r216*20&-1)+12>>2)+r206]=r199;HEAP32[((r216*20&-1)+16>>2)+r206]=r212;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r232=r219;break}_add234_internal(r37,r219,-1);r232=r219}else{r232=r200}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+4>>2]=r232;r200=r195-41|0;r212=r197+41|0;HEAP32[r166>>2]=0;HEAP32[r167>>2]=0;HEAP32[r168>>2]=0;HEAP32[r169>>2]=r200;HEAP32[r170>>2]=r212;r199=_findrelpos234(r37,r165,0,0,0);do{if((r199|0)==0){r219=HEAP32[r36],r206=r219>>2;r216=HEAP32[r48];r202=r219+(r216*20&-1)|0;HEAP32[r202>>2]=0;HEAP32[((r216*20&-1)+4>>2)+r206]=0;HEAP32[((r216*20&-1)+8>>2)+r206]=0;HEAP32[((r216*20&-1)+12>>2)+r206]=r200;HEAP32[((r216*20&-1)+16>>2)+r206]=r212;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r233=r202;break}_add234_internal(r37,r202,-1);r233=r202}else{r233=r199}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+8>>2]=r233}r199=r194+1|0;if((r199|0)<(r1|0)){r194=r199}else{break L2622}}}}while(0);r194=r189+1|0;if((r194|0)<(r2|0)){r189=r194}else{r3=2012;break}}if(r3==1996){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==2012){r234=HEAP32[r38>>2];break}else if(r3==1893){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==1960){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==1980){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==1920){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==1940){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}else{r234=0}}while(0);_freenode234(r234);_free(r34);if((HEAP32[r32]|0)>(r30|0)){___assert_func(69436,1954,70456,67036)}if((HEAP32[r32+4]|0)<=(r31|0)){_grid_make_consistent(r33);STACKTOP=r4;return r33}___assert_func(69436,1955,70456,66776);_grid_make_consistent(r33);STACKTOP=r4;return r33}function _grid_new_octagonal(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+240|0;r5=r4;r6=r4+20;r7=r4+40;r8=r4+60;r9=r4+80;r10=r4+100;r11=r4+120;r12=r4+140;r13=r4+160;r14=r4+180;r15=r4+200;r16=r4+220;r17=Math.imul(r1<<1,r2);r18=Math.imul((r1<<2)+4|0,r2+1|0);r19=_malloc(48),r20=r19>>2;if((r19|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r21=r19;HEAP32[r20]=0;HEAP32[r20+1]=0;HEAP32[r20+2]=0;HEAP32[r20+3]=0;HEAP32[r20+4]=0;HEAP32[r20+5]=0;HEAP32[r20+11]=1;r22=(r19+24|0)>>2;HEAP32[r22]=0;HEAP32[r22+1]=0;HEAP32[r22+2]=0;HEAP32[r22+3]=0;HEAP32[r20+10]=40;r22=_malloc(r17*24&-1);if((r22|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r23=(r19+4|0)>>2;HEAP32[r23]=r22;r22=_malloc(r18*20&-1);if((r22|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r24=(r19+20|0)>>2;HEAP32[r24]=r22;r22=_malloc(8);if((r22|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r25=r22;r26=r22;HEAP32[r26>>2]=0;r27=(r22+4|0)>>2;HEAP32[r27]=42;do{if((r2|0)>0){r28=(r1|0)>0;r29=r19>>2;r30=r16;r31=r16|0;r32=r16+4|0;r33=r16+8|0;r34=r16+12|0;r35=r16+16|0;r36=(r19+16|0)>>2;r37=r15;r38=r15|0;r39=r15+4|0;r40=r15+8|0;r41=r15+12|0;r42=r15+16|0;r43=r14;r44=r14|0;r45=r14+4|0;r46=r14+8|0;r47=r14+12|0;r48=r14+16|0;r49=r13;r50=r13|0;r51=r13+4|0;r52=r13+8|0;r53=r13+12|0;r54=r13+16|0;r55=r12;r56=r12|0;r57=r12+4|0;r58=r12+8|0;r59=r12+12|0;r60=r12+16|0;r61=r11;r62=r11|0;r63=r11+4|0;r64=r11+8|0;r65=r11+12|0;r66=r11+16|0;r67=r10;r68=r10|0;r69=r10+4|0;r70=r10+8|0;r71=r10+12|0;r72=r10+16|0;r73=r9;r74=r9|0;r75=r9+4|0;r76=r9+8|0;r77=r9+12|0;r78=r9+16|0;r79=r8;r80=r8|0;r81=r8+4|0;r82=r8+8|0;r83=r8+12|0;r84=r8+16|0;r85=r7;r86=r7|0;r87=r7+4|0;r88=r7+8|0;r89=r7+12|0;r90=r7+16|0;r91=r6;r92=r6|0;r93=r6+4|0;r94=r6+8|0;r95=r6+12|0;r96=r6+16|0;r97=r5;r98=r5|0;r99=r5+4|0;r100=r5+8|0;r101=r5+12|0;r102=r5+16|0;r103=0;L2799:while(1){L2801:do{if(r28){r104=r103*99&-1;r105=r104+29|0;r106=r104+70|0;r107=r104+99|0;r108=(r103|0)>0;r109=r104-29|0;r110=0;while(1){r111=r110*99&-1;r112=HEAP32[r23],r113=r112>>2;r114=HEAP32[r29];HEAP32[((r114*24&-1)>>2)+r113]=8;r115=_malloc(32);if((r115|0)==0){r3=2033;break L2799}r116=r115;r115=(r112+(r114*24&-1)+8|0)>>2;HEAP32[r115]=r116;HEAP32[r116>>2]=0;HEAP32[HEAP32[r115]+4>>2]=0;HEAP32[HEAP32[r115]+8>>2]=0;HEAP32[HEAP32[r115]+12>>2]=0;HEAP32[HEAP32[r115]+16>>2]=0;HEAP32[HEAP32[r115]+20>>2]=0;HEAP32[HEAP32[r115]+24>>2]=0;HEAP32[HEAP32[r115]+28>>2]=0;HEAP32[((r114*24&-1)+4>>2)+r113]=0;HEAP32[((r114*24&-1)+12>>2)+r113]=0;HEAP32[r29]=HEAP32[r29]+1|0;r113=r111+29|0;HEAP32[r31>>2]=0;HEAP32[r32>>2]=0;HEAP32[r33>>2]=0;HEAP32[r34>>2]=r113;HEAP32[r35>>2]=r104;r114=_findrelpos234(r25,r30,0,0,0);do{if((r114|0)==0){r115=HEAP32[r24],r116=r115>>2;r112=HEAP32[r36];r117=r115+(r112*20&-1)|0;HEAP32[r117>>2]=0;HEAP32[((r112*20&-1)+4>>2)+r116]=0;HEAP32[((r112*20&-1)+8>>2)+r116]=0;HEAP32[((r112*20&-1)+12>>2)+r116]=r113;HEAP32[((r112*20&-1)+16>>2)+r116]=r104;HEAP32[r36]=HEAP32[r36]+1|0;if((HEAP32[r27]|0)==0){r118=r117;break}_add234_internal(r25,r117,-1);r118=r117}else{r118=r114}}while(0);HEAP32[HEAP32[HEAP32[r23]+((HEAP32[r29]-1)*24&-1)+8>>2]>>2]=r118;r114=r111+70|0;HEAP32[r38>>2]=0;HEAP32[r39>>2]=0;HEAP32[r40>>2]=0;HEAP32[r41>>2]=r114;HEAP32[r42>>2]=r104;r117=_findrelpos234(r25,r37,0,0,0);do{if((r117|0)==0){r116=HEAP32[r24],r112=r116>>2;r115=HEAP32[r36];r119=r116+(r115*20&-1)|0;HEAP32[r119>>2]=0;HEAP32[((r115*20&-1)+4>>2)+r112]=0;HEAP32[((r115*20&-1)+8>>2)+r112]=0;HEAP32[((r115*20&-1)+12>>2)+r112]=r114;HEAP32[((r115*20&-1)+16>>2)+r112]=r104;HEAP32[r36]=HEAP32[r36]+1|0;if((HEAP32[r27]|0)==0){r120=r119;break}_add234_internal(r25,r119,-1);r120=r119}else{r120=r117}}while(0);HEAP32[HEAP32[HEAP32[r23]+((HEAP32[r29]-1)*24&-1)+8>>2]+4>>2]=r120;r117=r111+99|0;HEAP32[r44>>2]=0;HEAP32[r45>>2]=0;HEAP32[r46>>2]=0;HEAP32[r47>>2]=r117;HEAP32[r48>>2]=r105;r119=_findrelpos234(r25,r43,0,0,0);do{if((r119|0)==0){r112=HEAP32[r24],r115=r112>>2;r116=HEAP32[r36];r121=r112+(r116*20&-1)|0;HEAP32[r121>>2]=0;HEAP32[((r116*20&-1)+4>>2)+r115]=0;HEAP32[((r116*20&-1)+8>>2)+r115]=0;HEAP32[((r116*20&-1)+12>>2)+r115]=r117;HEAP32[((r116*20&-1)+16>>2)+r115]=r105;HEAP32[r36]=HEAP32[r36]+1|0;if((HEAP32[r27]|0)==0){r122=r121;break}_add234_internal(r25,r121,-1);r122=r121}else{r122=r119}}while(0);HEAP32[HEAP32[HEAP32[r23]+((HEAP32[r29]-1)*24&-1)+8>>2]+8>>2]=r122;HEAP32[r50>>2]=0;HEAP32[r51>>2]=0;HEAP32[r52>>2]=0;HEAP32[r53>>2]=r117;HEAP32[r54>>2]=r106;r119=_findrelpos234(r25,r49,0,0,0);do{if((r119|0)==0){r121=HEAP32[r24],r115=r121>>2;r116=HEAP32[r36];r112=r121+(r116*20&-1)|0;HEAP32[r112>>2]=0;HEAP32[((r116*20&-1)+4>>2)+r115]=0;HEAP32[((r116*20&-1)+8>>2)+r115]=0;HEAP32[((r116*20&-1)+12>>2)+r115]=r117;HEAP32[((r116*20&-1)+16>>2)+r115]=r106;HEAP32[r36]=HEAP32[r36]+1|0;if((HEAP32[r27]|0)==0){r123=r112;break}_add234_internal(r25,r112,-1);r123=r112}else{r123=r119}}while(0);HEAP32[HEAP32[HEAP32[r23]+((HEAP32[r29]-1)*24&-1)+8>>2]+12>>2]=r123;HEAP32[r56>>2]=0;HEAP32[r57>>2]=0;HEAP32[r58>>2]=0;HEAP32[r59>>2]=r114;HEAP32[r60>>2]=r107;r119=_findrelpos234(r25,r55,0,0,0);do{if((r119|0)==0){r117=HEAP32[r24],r112=r117>>2;r115=HEAP32[r36];r116=r117+(r115*20&-1)|0;HEAP32[r116>>2]=0;HEAP32[((r115*20&-1)+4>>2)+r112]=0;HEAP32[((r115*20&-1)+8>>2)+r112]=0;HEAP32[((r115*20&-1)+12>>2)+r112]=r114;HEAP32[((r115*20&-1)+16>>2)+r112]=r107;HEAP32[r36]=HEAP32[r36]+1|0;if((HEAP32[r27]|0)==0){r124=r116;break}_add234_internal(r25,r116,-1);r124=r116}else{r124=r119}}while(0);HEAP32[HEAP32[HEAP32[r23]+((HEAP32[r29]-1)*24&-1)+8>>2]+16>>2]=r124;HEAP32[r62>>2]=0;HEAP32[r63>>2]=0;HEAP32[r64>>2]=0;HEAP32[r65>>2]=r113;HEAP32[r66>>2]=r107;r119=_findrelpos234(r25,r61,0,0,0);do{if((r119|0)==0){r114=HEAP32[r24],r116=r114>>2;r112=HEAP32[r36];r115=r114+(r112*20&-1)|0;HEAP32[r115>>2]=0;HEAP32[((r112*20&-1)+4>>2)+r116]=0;HEAP32[((r112*20&-1)+8>>2)+r116]=0;HEAP32[((r112*20&-1)+12>>2)+r116]=r113;HEAP32[((r112*20&-1)+16>>2)+r116]=r107;HEAP32[r36]=HEAP32[r36]+1|0;if((HEAP32[r27]|0)==0){r125=r115;break}_add234_internal(r25,r115,-1);r125=r115}else{r125=r119}}while(0);HEAP32[HEAP32[HEAP32[r23]+((HEAP32[r29]-1)*24&-1)+8>>2]+20>>2]=r125;HEAP32[r68>>2]=0;HEAP32[r69>>2]=0;HEAP32[r70>>2]=0;HEAP32[r71>>2]=r111;HEAP32[r72>>2]=r106;r119=_findrelpos234(r25,r67,0,0,0);do{if((r119|0)==0){r115=HEAP32[r24],r116=r115>>2;r112=HEAP32[r36];r114=r115+(r112*20&-1)|0;HEAP32[r114>>2]=0;HEAP32[((r112*20&-1)+4>>2)+r116]=0;HEAP32[((r112*20&-1)+8>>2)+r116]=0;HEAP32[((r112*20&-1)+12>>2)+r116]=r111;HEAP32[((r112*20&-1)+16>>2)+r116]=r106;HEAP32[r36]=HEAP32[r36]+1|0;if((HEAP32[r27]|0)==0){r126=r114;break}_add234_internal(r25,r114,-1);r126=r114}else{r126=r119}}while(0);HEAP32[HEAP32[HEAP32[r23]+((HEAP32[r29]-1)*24&-1)+8>>2]+24>>2]=r126;HEAP32[r74>>2]=0;HEAP32[r75>>2]=0;HEAP32[r76>>2]=0;HEAP32[r77>>2]=r111;HEAP32[r78>>2]=r105;r119=_findrelpos234(r25,r73,0,0,0);do{if((r119|0)==0){r114=HEAP32[r24],r116=r114>>2;r112=HEAP32[r36];r115=r114+(r112*20&-1)|0;HEAP32[r115>>2]=0;HEAP32[((r112*20&-1)+4>>2)+r116]=0;HEAP32[((r112*20&-1)+8>>2)+r116]=0;HEAP32[((r112*20&-1)+12>>2)+r116]=r111;HEAP32[((r112*20&-1)+16>>2)+r116]=r105;HEAP32[r36]=HEAP32[r36]+1|0;if((HEAP32[r27]|0)==0){r127=r115;break}_add234_internal(r25,r115,-1);r127=r115}else{r127=r119}}while(0);HEAP32[HEAP32[HEAP32[r23]+((HEAP32[r29]-1)*24&-1)+8>>2]+28>>2]=r127;if((r110|0)>0&r108){r119=HEAP32[r23],r115=r119>>2;r116=HEAP32[r29];HEAP32[((r116*24&-1)>>2)+r115]=4;r112=_malloc(16);if((r112|0)==0){r3=2068;break L2799}r114=r112;r112=(r119+(r116*24&-1)+8|0)>>2;HEAP32[r112]=r114;HEAP32[r114>>2]=0;HEAP32[HEAP32[r112]+4>>2]=0;HEAP32[HEAP32[r112]+8>>2]=0;HEAP32[HEAP32[r112]+12>>2]=0;HEAP32[((r116*24&-1)+4>>2)+r115]=0;HEAP32[((r116*24&-1)+12>>2)+r115]=0;HEAP32[r29]=HEAP32[r29]+1|0;HEAP32[r80>>2]=0;HEAP32[r81>>2]=0;HEAP32[r82>>2]=0;HEAP32[r83>>2]=r111;HEAP32[r84>>2]=r109;r115=_findrelpos234(r25,r79,0,0,0);do{if((r115|0)==0){r116=HEAP32[r24],r112=r116>>2;r114=HEAP32[r36];r119=r116+(r114*20&-1)|0;HEAP32[r119>>2]=0;HEAP32[((r114*20&-1)+4>>2)+r112]=0;HEAP32[((r114*20&-1)+8>>2)+r112]=0;HEAP32[((r114*20&-1)+12>>2)+r112]=r111;HEAP32[((r114*20&-1)+16>>2)+r112]=r109;HEAP32[r36]=HEAP32[r36]+1|0;if((HEAP32[r27]|0)==0){r128=r119;break}_add234_internal(r25,r119,-1);r128=r119}else{r128=r115}}while(0);HEAP32[HEAP32[HEAP32[r23]+((HEAP32[r29]-1)*24&-1)+8>>2]>>2]=r128;HEAP32[r86>>2]=0;HEAP32[r87>>2]=0;HEAP32[r88>>2]=0;HEAP32[r89>>2]=r113;HEAP32[r90>>2]=r104;r115=_findrelpos234(r25,r85,0,0,0);do{if((r115|0)==0){r119=HEAP32[r24],r112=r119>>2;r114=HEAP32[r36];r116=r119+(r114*20&-1)|0;HEAP32[r116>>2]=0;HEAP32[((r114*20&-1)+4>>2)+r112]=0;HEAP32[((r114*20&-1)+8>>2)+r112]=0;HEAP32[((r114*20&-1)+12>>2)+r112]=r113;HEAP32[((r114*20&-1)+16>>2)+r112]=r104;HEAP32[r36]=HEAP32[r36]+1|0;if((HEAP32[r27]|0)==0){r129=r116;break}_add234_internal(r25,r116,-1);r129=r116}else{r129=r115}}while(0);HEAP32[HEAP32[HEAP32[r23]+((HEAP32[r29]-1)*24&-1)+8>>2]+4>>2]=r129;HEAP32[r92>>2]=0;HEAP32[r93>>2]=0;HEAP32[r94>>2]=0;HEAP32[r95>>2]=r111;HEAP32[r96>>2]=r105;r115=_findrelpos234(r25,r91,0,0,0);do{if((r115|0)==0){r113=HEAP32[r24],r116=r113>>2;r112=HEAP32[r36];r114=r113+(r112*20&-1)|0;HEAP32[r114>>2]=0;HEAP32[((r112*20&-1)+4>>2)+r116]=0;HEAP32[((r112*20&-1)+8>>2)+r116]=0;HEAP32[((r112*20&-1)+12>>2)+r116]=r111;HEAP32[((r112*20&-1)+16>>2)+r116]=r105;HEAP32[r36]=HEAP32[r36]+1|0;if((HEAP32[r27]|0)==0){r130=r114;break}_add234_internal(r25,r114,-1);r130=r114}else{r130=r115}}while(0);HEAP32[HEAP32[HEAP32[r23]+((HEAP32[r29]-1)*24&-1)+8>>2]+8>>2]=r130;r115=r111-29|0;HEAP32[r98>>2]=0;HEAP32[r99>>2]=0;HEAP32[r100>>2]=0;HEAP32[r101>>2]=r115;HEAP32[r102>>2]=r104;r114=_findrelpos234(r25,r97,0,0,0);do{if((r114|0)==0){r116=HEAP32[r24],r112=r116>>2;r113=HEAP32[r36];r119=r116+(r113*20&-1)|0;HEAP32[r119>>2]=0;HEAP32[((r113*20&-1)+4>>2)+r112]=0;HEAP32[((r113*20&-1)+8>>2)+r112]=0;HEAP32[((r113*20&-1)+12>>2)+r112]=r115;HEAP32[((r113*20&-1)+16>>2)+r112]=r104;HEAP32[r36]=HEAP32[r36]+1|0;if((HEAP32[r27]|0)==0){r131=r119;break}_add234_internal(r25,r119,-1);r131=r119}else{r131=r114}}while(0);HEAP32[HEAP32[HEAP32[r23]+((HEAP32[r29]-1)*24&-1)+8>>2]+12>>2]=r131}r114=r110+1|0;if((r114|0)<(r1|0)){r110=r114}else{break L2801}}}}while(0);r110=r103+1|0;if((r110|0)<(r2|0)){r103=r110}else{r3=2088;break}}if(r3==2068){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==2033){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==2088){r132=HEAP32[r26>>2];break}}else{r132=0}}while(0);_freenode234(r132);_free(r22);if((HEAP32[r20]|0)>(r17|0)){___assert_func(69436,2037,70400,67036)}if((HEAP32[r20+4]|0)<=(r18|0)){_grid_make_consistent(r21);STACKTOP=r4;return r21}___assert_func(69436,2038,70400,66776);_grid_make_consistent(r21);STACKTOP=r4;return r21}function _grid_new_kites(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187,r188,r189,r190,r191,r192,r193,r194,r195,r196,r197,r198,r199,r200,r201,r202,r203,r204,r205,r206,r207,r208,r209,r210,r211,r212,r213,r214,r215,r216,r217,r218,r219,r220,r221,r222,r223,r224,r225,r226,r227,r228,r229,r230,r231;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+480|0;r5=r4;r6=r4+20;r7=r4+40;r8=r4+60;r9=r4+80;r10=r4+100;r11=r4+120;r12=r4+140;r13=r4+160;r14=r4+180;r15=r4+200;r16=r4+220;r17=r4+240;r18=r4+260;r19=r4+280;r20=r4+300;r21=r4+320;r22=r4+340;r23=r4+360;r24=r4+380;r25=r4+400;r26=r4+420;r27=r4+440;r28=r4+460;r29=r1*6&-1;r30=Math.imul(r29,r2);r31=Math.imul(r29+6|0,r2+1|0);r29=_malloc(48),r32=r29>>2;if((r29|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r33=r29;HEAP32[r32]=0;HEAP32[r32+1]=0;HEAP32[r32+2]=0;HEAP32[r32+3]=0;HEAP32[r32+4]=0;HEAP32[r32+5]=0;HEAP32[r32+11]=1;r34=(r29+24|0)>>2;HEAP32[r34]=0;HEAP32[r34+1]=0;HEAP32[r34+2]=0;HEAP32[r34+3]=0;HEAP32[r32+10]=40;r34=_malloc(r30*24&-1);if((r34|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r35=(r29+4|0)>>2;HEAP32[r35]=r34;r34=_malloc(r31*20&-1);if((r34|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r36=(r29+20|0)>>2;HEAP32[r36]=r34;r34=_malloc(8);if((r34|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r37=r34;r38=r34;HEAP32[r38>>2]=0;r39=(r34+4|0)>>2;HEAP32[r39]=42;do{if((r2|0)>0){r40=(r1|0)>0;r41=r29>>2;r42=r28;r43=r28|0;r44=r28+4|0;r45=r28+8|0;r46=r28+12|0;r47=r28+16|0;r48=(r29+16|0)>>2;r49=r27;r50=r27|0;r51=r27+4|0;r52=r27+8|0;r53=r27+12|0;r54=r27+16|0;r55=r26;r56=r26|0;r57=r26+4|0;r58=r26+8|0;r59=r26+12|0;r60=r26+16|0;r61=r25;r62=r25|0;r63=r25+4|0;r64=r25+8|0;r65=r25+12|0;r66=r25+16|0;r67=r24;r68=r24|0;r69=r24+4|0;r70=r24+8|0;r71=r24+12|0;r72=r24+16|0;r73=r23;r74=r23|0;r75=r23+4|0;r76=r23+8|0;r77=r23+12|0;r78=r23+16|0;r79=r22;r80=r22|0;r81=r22+4|0;r82=r22+8|0;r83=r22+12|0;r84=r22+16|0;r85=r21;r86=r21|0;r87=r21+4|0;r88=r21+8|0;r89=r21+12|0;r90=r21+16|0;r91=r20;r92=r20|0;r93=r20+4|0;r94=r20+8|0;r95=r20+12|0;r96=r20+16|0;r97=r19;r98=r19|0;r99=r19+4|0;r100=r19+8|0;r101=r19+12|0;r102=r19+16|0;r103=r18;r104=r18|0;r105=r18+4|0;r106=r18+8|0;r107=r18+12|0;r108=r18+16|0;r109=r17;r110=r17|0;r111=r17+4|0;r112=r17+8|0;r113=r17+12|0;r114=r17+16|0;r115=r16;r116=r16|0;r117=r16+4|0;r118=r16+8|0;r119=r16+12|0;r120=r16+16|0;r121=r15;r122=r15|0;r123=r15+4|0;r124=r15+8|0;r125=r15+12|0;r126=r15+16|0;r127=r14;r128=r14|0;r129=r14+4|0;r130=r14+8|0;r131=r14+12|0;r132=r14+16|0;r133=r13;r134=r13|0;r135=r13+4|0;r136=r13+8|0;r137=r13+12|0;r138=r13+16|0;r139=r12;r140=r12|0;r141=r12+4|0;r142=r12+8|0;r143=r12+12|0;r144=r12+16|0;r145=r11;r146=r11|0;r147=r11+4|0;r148=r11+8|0;r149=r11+12|0;r150=r11+16|0;r151=r10;r152=r10|0;r153=r10+4|0;r154=r10+8|0;r155=r10+12|0;r156=r10+16|0;r157=r9;r158=r9|0;r159=r9+4|0;r160=r9+8|0;r161=r9+12|0;r162=r9+16|0;r163=r8;r164=r8|0;r165=r8+4|0;r166=r8+8|0;r167=r8+12|0;r168=r8+16|0;r169=r7;r170=r7|0;r171=r7+4|0;r172=r7+8|0;r173=r7+12|0;r174=r7+16|0;r175=r6;r176=r6|0;r177=r6+4|0;r178=r6+8|0;r179=r6+12|0;r180=r6+16|0;r181=r5;r182=r5|0;r183=r5+4|0;r184=r5+8|0;r185=r5+12|0;r186=r5+16|0;r187=0;L2898:while(1){L2900:do{if(r40){r188=r187*90&-1;r189=(r187&1|0)==0;r190=r188+30|0;r191=r188+45|0;r192=r188+60|0;r193=r188-30|0;r194=r188-45|0;r195=r188-60|0;r196=0;while(1){r197=r196*104&-1;r198=r189?r197:r197+52|0;r197=HEAP32[r35],r199=r197>>2;r200=HEAP32[r41];HEAP32[((r200*24&-1)>>2)+r199]=4;r201=_malloc(16);if((r201|0)==0){r3=2109;break L2898}r202=r201;r201=(r197+(r200*24&-1)+8|0)>>2;HEAP32[r201]=r202;HEAP32[r202>>2]=0;HEAP32[HEAP32[r201]+4>>2]=0;HEAP32[HEAP32[r201]+8>>2]=0;HEAP32[HEAP32[r201]+12>>2]=0;HEAP32[((r200*24&-1)+4>>2)+r199]=0;HEAP32[((r200*24&-1)+12>>2)+r199]=0;HEAP32[r41]=HEAP32[r41]+1|0;HEAP32[r43>>2]=0;HEAP32[r44>>2]=0;HEAP32[r45>>2]=0;HEAP32[r46>>2]=r198;HEAP32[r47>>2]=r188;r199=_findrelpos234(r37,r42,0,0,0);do{if((r199|0)==0){r200=HEAP32[r36],r201=r200>>2;r202=HEAP32[r48];r197=r200+(r202*20&-1)|0;HEAP32[r197>>2]=0;HEAP32[((r202*20&-1)+4>>2)+r201]=0;HEAP32[((r202*20&-1)+8>>2)+r201]=0;HEAP32[((r202*20&-1)+12>>2)+r201]=r198;HEAP32[((r202*20&-1)+16>>2)+r201]=r188;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r203=r197;break}_add234_internal(r37,r197,-1);r203=r197}else{r203=r199}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]>>2]=r203;r199=r198+52|0;HEAP32[r50>>2]=0;HEAP32[r51>>2]=0;HEAP32[r52>>2]=0;HEAP32[r53>>2]=r199;HEAP32[r54>>2]=r188;r197=_findrelpos234(r37,r49,0,0,0);do{if((r197|0)==0){r201=HEAP32[r36],r202=r201>>2;r200=HEAP32[r48];r204=r201+(r200*20&-1)|0;HEAP32[r204>>2]=0;HEAP32[((r200*20&-1)+4>>2)+r202]=0;HEAP32[((r200*20&-1)+8>>2)+r202]=0;HEAP32[((r200*20&-1)+12>>2)+r202]=r199;HEAP32[((r200*20&-1)+16>>2)+r202]=r188;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r205=r204;break}_add234_internal(r37,r204,-1);r205=r204}else{r205=r197}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+4>>2]=r205;HEAP32[r56>>2]=0;HEAP32[r57>>2]=0;HEAP32[r58>>2]=0;HEAP32[r59>>2]=r199;HEAP32[r60>>2]=r190;r197=_findrelpos234(r37,r55,0,0,0);do{if((r197|0)==0){r204=HEAP32[r36],r202=r204>>2;r200=HEAP32[r48];r201=r204+(r200*20&-1)|0;HEAP32[r201>>2]=0;HEAP32[((r200*20&-1)+4>>2)+r202]=0;HEAP32[((r200*20&-1)+8>>2)+r202]=0;HEAP32[((r200*20&-1)+12>>2)+r202]=r199;HEAP32[((r200*20&-1)+16>>2)+r202]=r190;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r206=r201;break}_add234_internal(r37,r201,-1);r206=r201}else{r206=r197}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+8>>2]=r206;r197=r198+26|0;HEAP32[r62>>2]=0;HEAP32[r63>>2]=0;HEAP32[r64>>2]=0;HEAP32[r65>>2]=r197;HEAP32[r66>>2]=r191;r201=_findrelpos234(r37,r61,0,0,0);do{if((r201|0)==0){r202=HEAP32[r36],r200=r202>>2;r204=HEAP32[r48];r207=r202+(r204*20&-1)|0;HEAP32[r207>>2]=0;HEAP32[((r204*20&-1)+4>>2)+r200]=0;HEAP32[((r204*20&-1)+8>>2)+r200]=0;HEAP32[((r204*20&-1)+12>>2)+r200]=r197;HEAP32[((r204*20&-1)+16>>2)+r200]=r191;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r208=r207;break}_add234_internal(r37,r207,-1);r208=r207}else{r208=r201}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+12>>2]=r208;r201=HEAP32[r35],r207=r201>>2;r200=HEAP32[r41];HEAP32[((r200*24&-1)>>2)+r207]=4;r204=_malloc(16);if((r204|0)==0){r3=2127;break L2898}r202=r204;r204=(r201+(r200*24&-1)+8|0)>>2;HEAP32[r204]=r202;HEAP32[r202>>2]=0;HEAP32[HEAP32[r204]+4>>2]=0;HEAP32[HEAP32[r204]+8>>2]=0;HEAP32[HEAP32[r204]+12>>2]=0;HEAP32[((r200*24&-1)+4>>2)+r207]=0;HEAP32[((r200*24&-1)+12>>2)+r207]=0;HEAP32[r41]=HEAP32[r41]+1|0;HEAP32[r68>>2]=0;HEAP32[r69>>2]=0;HEAP32[r70>>2]=0;HEAP32[r71>>2]=r198;HEAP32[r72>>2]=r188;r207=_findrelpos234(r37,r67,0,0,0);do{if((r207|0)==0){r200=HEAP32[r36],r204=r200>>2;r202=HEAP32[r48];r201=r200+(r202*20&-1)|0;HEAP32[r201>>2]=0;HEAP32[((r202*20&-1)+4>>2)+r204]=0;HEAP32[((r202*20&-1)+8>>2)+r204]=0;HEAP32[((r202*20&-1)+12>>2)+r204]=r198;HEAP32[((r202*20&-1)+16>>2)+r204]=r188;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r209=r201;break}_add234_internal(r37,r201,-1);r209=r201}else{r209=r207}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]>>2]=r209;HEAP32[r74>>2]=0;HEAP32[r75>>2]=0;HEAP32[r76>>2]=0;HEAP32[r77>>2]=r197;HEAP32[r78>>2]=r191;r207=_findrelpos234(r37,r73,0,0,0);do{if((r207|0)==0){r201=HEAP32[r36],r204=r201>>2;r202=HEAP32[r48];r200=r201+(r202*20&-1)|0;HEAP32[r200>>2]=0;HEAP32[((r202*20&-1)+4>>2)+r204]=0;HEAP32[((r202*20&-1)+8>>2)+r204]=0;HEAP32[((r202*20&-1)+12>>2)+r204]=r197;HEAP32[((r202*20&-1)+16>>2)+r204]=r191;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r210=r200;break}_add234_internal(r37,r200,-1);r210=r200}else{r210=r207}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+4>>2]=r210;HEAP32[r80>>2]=0;HEAP32[r81>>2]=0;HEAP32[r82>>2]=0;HEAP32[r83>>2]=r198;HEAP32[r84>>2]=r192;r207=_findrelpos234(r37,r79,0,0,0);do{if((r207|0)==0){r200=HEAP32[r36],r204=r200>>2;r202=HEAP32[r48];r201=r200+(r202*20&-1)|0;HEAP32[r201>>2]=0;HEAP32[((r202*20&-1)+4>>2)+r204]=0;HEAP32[((r202*20&-1)+8>>2)+r204]=0;HEAP32[((r202*20&-1)+12>>2)+r204]=r198;HEAP32[((r202*20&-1)+16>>2)+r204]=r192;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r211=r201;break}_add234_internal(r37,r201,-1);r211=r201}else{r211=r207}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+8>>2]=r211;r207=r198-26|0;HEAP32[r86>>2]=0;HEAP32[r87>>2]=0;HEAP32[r88>>2]=0;HEAP32[r89>>2]=r207;HEAP32[r90>>2]=r191;r201=_findrelpos234(r37,r85,0,0,0);do{if((r201|0)==0){r204=HEAP32[r36],r202=r204>>2;r200=HEAP32[r48];r212=r204+(r200*20&-1)|0;HEAP32[r212>>2]=0;HEAP32[((r200*20&-1)+4>>2)+r202]=0;HEAP32[((r200*20&-1)+8>>2)+r202]=0;HEAP32[((r200*20&-1)+12>>2)+r202]=r207;HEAP32[((r200*20&-1)+16>>2)+r202]=r191;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r213=r212;break}_add234_internal(r37,r212,-1);r213=r212}else{r213=r201}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+12>>2]=r213;r201=HEAP32[r35],r212=r201>>2;r202=HEAP32[r41];HEAP32[((r202*24&-1)>>2)+r212]=4;r200=_malloc(16);if((r200|0)==0){r3=2145;break L2898}r204=r200;r200=(r201+(r202*24&-1)+8|0)>>2;HEAP32[r200]=r204;HEAP32[r204>>2]=0;HEAP32[HEAP32[r200]+4>>2]=0;HEAP32[HEAP32[r200]+8>>2]=0;HEAP32[HEAP32[r200]+12>>2]=0;HEAP32[((r202*24&-1)+4>>2)+r212]=0;HEAP32[((r202*24&-1)+12>>2)+r212]=0;HEAP32[r41]=HEAP32[r41]+1|0;HEAP32[r92>>2]=0;HEAP32[r93>>2]=0;HEAP32[r94>>2]=0;HEAP32[r95>>2]=r198;HEAP32[r96>>2]=r188;r212=_findrelpos234(r37,r91,0,0,0);do{if((r212|0)==0){r202=HEAP32[r36],r200=r202>>2;r204=HEAP32[r48];r201=r202+(r204*20&-1)|0;HEAP32[r201>>2]=0;HEAP32[((r204*20&-1)+4>>2)+r200]=0;HEAP32[((r204*20&-1)+8>>2)+r200]=0;HEAP32[((r204*20&-1)+12>>2)+r200]=r198;HEAP32[((r204*20&-1)+16>>2)+r200]=r188;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r214=r201;break}_add234_internal(r37,r201,-1);r214=r201}else{r214=r212}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]>>2]=r214;HEAP32[r98>>2]=0;HEAP32[r99>>2]=0;HEAP32[r100>>2]=0;HEAP32[r101>>2]=r207;HEAP32[r102>>2]=r191;r212=_findrelpos234(r37,r97,0,0,0);do{if((r212|0)==0){r201=HEAP32[r36],r200=r201>>2;r204=HEAP32[r48];r202=r201+(r204*20&-1)|0;HEAP32[r202>>2]=0;HEAP32[((r204*20&-1)+4>>2)+r200]=0;HEAP32[((r204*20&-1)+8>>2)+r200]=0;HEAP32[((r204*20&-1)+12>>2)+r200]=r207;HEAP32[((r204*20&-1)+16>>2)+r200]=r191;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r215=r202;break}_add234_internal(r37,r202,-1);r215=r202}else{r215=r212}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+4>>2]=r215;r212=r198-52|0;HEAP32[r104>>2]=0;HEAP32[r105>>2]=0;HEAP32[r106>>2]=0;HEAP32[r107>>2]=r212;HEAP32[r108>>2]=r190;r202=_findrelpos234(r37,r103,0,0,0);do{if((r202|0)==0){r200=HEAP32[r36],r204=r200>>2;r201=HEAP32[r48];r216=r200+(r201*20&-1)|0;HEAP32[r216>>2]=0;HEAP32[((r201*20&-1)+4>>2)+r204]=0;HEAP32[((r201*20&-1)+8>>2)+r204]=0;HEAP32[((r201*20&-1)+12>>2)+r204]=r212;HEAP32[((r201*20&-1)+16>>2)+r204]=r190;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r217=r216;break}_add234_internal(r37,r216,-1);r217=r216}else{r217=r202}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+8>>2]=r217;HEAP32[r110>>2]=0;HEAP32[r111>>2]=0;HEAP32[r112>>2]=0;HEAP32[r113>>2]=r212;HEAP32[r114>>2]=r188;r202=_findrelpos234(r37,r109,0,0,0);do{if((r202|0)==0){r216=HEAP32[r36],r204=r216>>2;r201=HEAP32[r48];r200=r216+(r201*20&-1)|0;HEAP32[r200>>2]=0;HEAP32[((r201*20&-1)+4>>2)+r204]=0;HEAP32[((r201*20&-1)+8>>2)+r204]=0;HEAP32[((r201*20&-1)+12>>2)+r204]=r212;HEAP32[((r201*20&-1)+16>>2)+r204]=r188;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r218=r200;break}_add234_internal(r37,r200,-1);r218=r200}else{r218=r202}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+12>>2]=r218;r202=HEAP32[r35],r200=r202>>2;r204=HEAP32[r41];HEAP32[((r204*24&-1)>>2)+r200]=4;r201=_malloc(16);if((r201|0)==0){r3=2163;break L2898}r216=r201;r201=(r202+(r204*24&-1)+8|0)>>2;HEAP32[r201]=r216;HEAP32[r216>>2]=0;HEAP32[HEAP32[r201]+4>>2]=0;HEAP32[HEAP32[r201]+8>>2]=0;HEAP32[HEAP32[r201]+12>>2]=0;HEAP32[((r204*24&-1)+4>>2)+r200]=0;HEAP32[((r204*24&-1)+12>>2)+r200]=0;HEAP32[r41]=HEAP32[r41]+1|0;HEAP32[r116>>2]=0;HEAP32[r117>>2]=0;HEAP32[r118>>2]=0;HEAP32[r119>>2]=r198;HEAP32[r120>>2]=r188;r200=_findrelpos234(r37,r115,0,0,0);do{if((r200|0)==0){r204=HEAP32[r36],r201=r204>>2;r216=HEAP32[r48];r202=r204+(r216*20&-1)|0;HEAP32[r202>>2]=0;HEAP32[((r216*20&-1)+4>>2)+r201]=0;HEAP32[((r216*20&-1)+8>>2)+r201]=0;HEAP32[((r216*20&-1)+12>>2)+r201]=r198;HEAP32[((r216*20&-1)+16>>2)+r201]=r188;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r219=r202;break}_add234_internal(r37,r202,-1);r219=r202}else{r219=r200}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]>>2]=r219;HEAP32[r122>>2]=0;HEAP32[r123>>2]=0;HEAP32[r124>>2]=0;HEAP32[r125>>2]=r212;HEAP32[r126>>2]=r188;r200=_findrelpos234(r37,r121,0,0,0);do{if((r200|0)==0){r202=HEAP32[r36],r201=r202>>2;r216=HEAP32[r48];r204=r202+(r216*20&-1)|0;HEAP32[r204>>2]=0;HEAP32[((r216*20&-1)+4>>2)+r201]=0;HEAP32[((r216*20&-1)+8>>2)+r201]=0;HEAP32[((r216*20&-1)+12>>2)+r201]=r212;HEAP32[((r216*20&-1)+16>>2)+r201]=r188;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r220=r204;break}_add234_internal(r37,r204,-1);r220=r204}else{r220=r200}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+4>>2]=r220;HEAP32[r128>>2]=0;HEAP32[r129>>2]=0;HEAP32[r130>>2]=0;HEAP32[r131>>2]=r212;HEAP32[r132>>2]=r193;r200=_findrelpos234(r37,r127,0,0,0);do{if((r200|0)==0){r204=HEAP32[r36],r201=r204>>2;r216=HEAP32[r48];r202=r204+(r216*20&-1)|0;HEAP32[r202>>2]=0;HEAP32[((r216*20&-1)+4>>2)+r201]=0;HEAP32[((r216*20&-1)+8>>2)+r201]=0;HEAP32[((r216*20&-1)+12>>2)+r201]=r212;HEAP32[((r216*20&-1)+16>>2)+r201]=r193;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r221=r202;break}_add234_internal(r37,r202,-1);r221=r202}else{r221=r200}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+8>>2]=r221;HEAP32[r134>>2]=0;HEAP32[r135>>2]=0;HEAP32[r136>>2]=0;HEAP32[r137>>2]=r207;HEAP32[r138>>2]=r194;r200=_findrelpos234(r37,r133,0,0,0);do{if((r200|0)==0){r212=HEAP32[r36],r202=r212>>2;r201=HEAP32[r48];r216=r212+(r201*20&-1)|0;HEAP32[r216>>2]=0;HEAP32[((r201*20&-1)+4>>2)+r202]=0;HEAP32[((r201*20&-1)+8>>2)+r202]=0;HEAP32[((r201*20&-1)+12>>2)+r202]=r207;HEAP32[((r201*20&-1)+16>>2)+r202]=r194;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r222=r216;break}_add234_internal(r37,r216,-1);r222=r216}else{r222=r200}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+12>>2]=r222;r200=HEAP32[r35],r216=r200>>2;r202=HEAP32[r41];HEAP32[((r202*24&-1)>>2)+r216]=4;r201=_malloc(16);if((r201|0)==0){r3=2181;break L2898}r212=r201;r201=(r200+(r202*24&-1)+8|0)>>2;HEAP32[r201]=r212;HEAP32[r212>>2]=0;HEAP32[HEAP32[r201]+4>>2]=0;HEAP32[HEAP32[r201]+8>>2]=0;HEAP32[HEAP32[r201]+12>>2]=0;HEAP32[((r202*24&-1)+4>>2)+r216]=0;HEAP32[((r202*24&-1)+12>>2)+r216]=0;HEAP32[r41]=HEAP32[r41]+1|0;HEAP32[r140>>2]=0;HEAP32[r141>>2]=0;HEAP32[r142>>2]=0;HEAP32[r143>>2]=r198;HEAP32[r144>>2]=r188;r216=_findrelpos234(r37,r139,0,0,0);do{if((r216|0)==0){r202=HEAP32[r36],r201=r202>>2;r212=HEAP32[r48];r200=r202+(r212*20&-1)|0;HEAP32[r200>>2]=0;HEAP32[((r212*20&-1)+4>>2)+r201]=0;HEAP32[((r212*20&-1)+8>>2)+r201]=0;HEAP32[((r212*20&-1)+12>>2)+r201]=r198;HEAP32[((r212*20&-1)+16>>2)+r201]=r188;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r223=r200;break}_add234_internal(r37,r200,-1);r223=r200}else{r223=r216}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]>>2]=r223;HEAP32[r146>>2]=0;HEAP32[r147>>2]=0;HEAP32[r148>>2]=0;HEAP32[r149>>2]=r207;HEAP32[r150>>2]=r194;r216=_findrelpos234(r37,r145,0,0,0);do{if((r216|0)==0){r200=HEAP32[r36],r201=r200>>2;r212=HEAP32[r48];r202=r200+(r212*20&-1)|0;HEAP32[r202>>2]=0;HEAP32[((r212*20&-1)+4>>2)+r201]=0;HEAP32[((r212*20&-1)+8>>2)+r201]=0;HEAP32[((r212*20&-1)+12>>2)+r201]=r207;HEAP32[((r212*20&-1)+16>>2)+r201]=r194;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r224=r202;break}_add234_internal(r37,r202,-1);r224=r202}else{r224=r216}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+4>>2]=r224;HEAP32[r152>>2]=0;HEAP32[r153>>2]=0;HEAP32[r154>>2]=0;HEAP32[r155>>2]=r198;HEAP32[r156>>2]=r195;r216=_findrelpos234(r37,r151,0,0,0);do{if((r216|0)==0){r207=HEAP32[r36],r202=r207>>2;r201=HEAP32[r48];r212=r207+(r201*20&-1)|0;HEAP32[r212>>2]=0;HEAP32[((r201*20&-1)+4>>2)+r202]=0;HEAP32[((r201*20&-1)+8>>2)+r202]=0;HEAP32[((r201*20&-1)+12>>2)+r202]=r198;HEAP32[((r201*20&-1)+16>>2)+r202]=r195;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r225=r212;break}_add234_internal(r37,r212,-1);r225=r212}else{r225=r216}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+8>>2]=r225;HEAP32[r158>>2]=0;HEAP32[r159>>2]=0;HEAP32[r160>>2]=0;HEAP32[r161>>2]=r197;HEAP32[r162>>2]=r194;r216=_findrelpos234(r37,r157,0,0,0);do{if((r216|0)==0){r212=HEAP32[r36],r202=r212>>2;r201=HEAP32[r48];r207=r212+(r201*20&-1)|0;HEAP32[r207>>2]=0;HEAP32[((r201*20&-1)+4>>2)+r202]=0;HEAP32[((r201*20&-1)+8>>2)+r202]=0;HEAP32[((r201*20&-1)+12>>2)+r202]=r197;HEAP32[((r201*20&-1)+16>>2)+r202]=r194;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r226=r207;break}_add234_internal(r37,r207,-1);r226=r207}else{r226=r216}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+12>>2]=r226;r216=HEAP32[r35],r207=r216>>2;r202=HEAP32[r41];HEAP32[((r202*24&-1)>>2)+r207]=4;r201=_malloc(16);if((r201|0)==0){r3=2199;break L2898}r212=r201;r201=(r216+(r202*24&-1)+8|0)>>2;HEAP32[r201]=r212;HEAP32[r212>>2]=0;HEAP32[HEAP32[r201]+4>>2]=0;HEAP32[HEAP32[r201]+8>>2]=0;HEAP32[HEAP32[r201]+12>>2]=0;HEAP32[((r202*24&-1)+4>>2)+r207]=0;HEAP32[((r202*24&-1)+12>>2)+r207]=0;HEAP32[r41]=HEAP32[r41]+1|0;HEAP32[r164>>2]=0;HEAP32[r165>>2]=0;HEAP32[r166>>2]=0;HEAP32[r167>>2]=r198;HEAP32[r168>>2]=r188;r207=_findrelpos234(r37,r163,0,0,0);do{if((r207|0)==0){r202=HEAP32[r36],r201=r202>>2;r212=HEAP32[r48];r216=r202+(r212*20&-1)|0;HEAP32[r216>>2]=0;HEAP32[((r212*20&-1)+4>>2)+r201]=0;HEAP32[((r212*20&-1)+8>>2)+r201]=0;HEAP32[((r212*20&-1)+12>>2)+r201]=r198;HEAP32[((r212*20&-1)+16>>2)+r201]=r188;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r227=r216;break}_add234_internal(r37,r216,-1);r227=r216}else{r227=r207}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]>>2]=r227;HEAP32[r170>>2]=0;HEAP32[r171>>2]=0;HEAP32[r172>>2]=0;HEAP32[r173>>2]=r197;HEAP32[r174>>2]=r194;r207=_findrelpos234(r37,r169,0,0,0);do{if((r207|0)==0){r198=HEAP32[r36],r216=r198>>2;r201=HEAP32[r48];r212=r198+(r201*20&-1)|0;HEAP32[r212>>2]=0;HEAP32[((r201*20&-1)+4>>2)+r216]=0;HEAP32[((r201*20&-1)+8>>2)+r216]=0;HEAP32[((r201*20&-1)+12>>2)+r216]=r197;HEAP32[((r201*20&-1)+16>>2)+r216]=r194;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r228=r212;break}_add234_internal(r37,r212,-1);r228=r212}else{r228=r207}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+4>>2]=r228;HEAP32[r176>>2]=0;HEAP32[r177>>2]=0;HEAP32[r178>>2]=0;HEAP32[r179>>2]=r199;HEAP32[r180>>2]=r193;r207=_findrelpos234(r37,r175,0,0,0);do{if((r207|0)==0){r197=HEAP32[r36],r212=r197>>2;r216=HEAP32[r48];r201=r197+(r216*20&-1)|0;HEAP32[r201>>2]=0;HEAP32[((r216*20&-1)+4>>2)+r212]=0;HEAP32[((r216*20&-1)+8>>2)+r212]=0;HEAP32[((r216*20&-1)+12>>2)+r212]=r199;HEAP32[((r216*20&-1)+16>>2)+r212]=r193;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r229=r201;break}_add234_internal(r37,r201,-1);r229=r201}else{r229=r207}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+8>>2]=r229;HEAP32[r182>>2]=0;HEAP32[r183>>2]=0;HEAP32[r184>>2]=0;HEAP32[r185>>2]=r199;HEAP32[r186>>2]=r188;r207=_findrelpos234(r37,r181,0,0,0);do{if((r207|0)==0){r201=HEAP32[r36],r212=r201>>2;r216=HEAP32[r48];r197=r201+(r216*20&-1)|0;HEAP32[r197>>2]=0;HEAP32[((r216*20&-1)+4>>2)+r212]=0;HEAP32[((r216*20&-1)+8>>2)+r212]=0;HEAP32[((r216*20&-1)+12>>2)+r212]=r199;HEAP32[((r216*20&-1)+16>>2)+r212]=r188;HEAP32[r48]=HEAP32[r48]+1|0;if((HEAP32[r39]|0)==0){r230=r197;break}_add234_internal(r37,r197,-1);r230=r197}else{r230=r207}}while(0);HEAP32[HEAP32[HEAP32[r35]+((HEAP32[r41]-1)*24&-1)+8>>2]+12>>2]=r230;r207=r196+1|0;if((r207|0)<(r1|0)){r196=r207}else{break L2900}}}}while(0);r196=r187+1|0;if((r196|0)<(r2|0)){r187=r196}else{r3=2218;break}}if(r3==2181){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==2218){r231=HEAP32[r38>>2];break}else if(r3==2109){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==2163){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==2127){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==2199){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==2145){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}else{r231=0}}while(0);_freenode234(r231);_free(r34);if((HEAP32[r32]|0)>(r30|0)){___assert_func(69436,2157,70420,67036)}if((HEAP32[r32+4]|0)<=(r31|0)){_grid_make_consistent(r33);STACKTOP=r4;return r33}___assert_func(69436,2158,70420,66776);_grid_make_consistent(r33);STACKTOP=r4;return r33}function _grid_new_floret(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187,r188,r189,r190,r191,r192,r193,r194,r195,r196,r197,r198,r199,r200,r201,r202,r203,r204,r205,r206,r207,r208,r209,r210,r211,r212,r213,r214,r215,r216,r217,r218,r219,r220,r221,r222,r223,r224,r225,r226,r227,r228,r229,r230,r231,r232,r233,r234,r235,r236,r237,r238,r239,r240,r241,r242,r243,r244,r245,r246,r247,r248,r249,r250,r251,r252,r253,r254,r255,r256,r257,r258,r259,r260,r261,r262,r263,r264,r265,r266,r267,r268,r269,r270,r271,r272,r273,r274,r275,r276,r277,r278,r279,r280;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+600|0;r5=r4;r6=r4+20;r7=r4+40;r8=r4+60;r9=r4+80;r10=r4+100;r11=r4+120;r12=r4+140;r13=r4+160;r14=r4+180;r15=r4+200;r16=r4+220;r17=r4+240;r18=r4+260;r19=r4+280;r20=r4+300;r21=r4+320;r22=r4+340;r23=r4+360;r24=r4+380;r25=r4+400;r26=r4+420;r27=r4+440;r28=r4+460;r29=r4+480;r30=r4+500;r31=r4+520;r32=r4+540;r33=r4+560;r34=r4+580;r35=Math.imul(r1*6&-1,r2);r36=Math.imul((r1*9&-1)+9|0,r2+1|0);r37=_malloc(48),r38=r37>>2;if((r37|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r39=r37;HEAP32[r38]=0;HEAP32[r38+1]=0;HEAP32[r38+2]=0;HEAP32[r38+3]=0;HEAP32[r38+4]=0;HEAP32[r38+5]=0;HEAP32[r38+11]=1;r40=(r37+24|0)>>2;HEAP32[r40]=0;HEAP32[r40+1]=0;HEAP32[r40+2]=0;HEAP32[r40+3]=0;HEAP32[r38+10]=150;r40=_malloc(r35*24&-1);if((r40|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r41=(r37+4|0)>>2;HEAP32[r41]=r40;r40=_malloc(r36*20&-1);if((r40|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r42=(r37+20|0)>>2;HEAP32[r42]=r40;r40=_malloc(8);if((r40|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r43=r40;r44=r40;HEAP32[r44>>2]=0;r45=(r40+4|0)>>2;HEAP32[r45]=42;do{if((r2|0)>0){r46=(r1|0)>0;r47=r2-1|0;r48=r37>>2;r49=r34;r50=r34|0;r51=r34+4|0;r52=r34+8|0;r53=r34+12|0;r54=r34+16|0;r55=(r37+16|0)>>2;r56=r33;r57=r33|0;r58=r33+4|0;r59=r33+8|0;r60=r33+12|0;r61=r33+16|0;r62=r32;r63=r32|0;r64=r32+4|0;r65=r32+8|0;r66=r32+12|0;r67=r32+16|0;r68=r31;r69=r31|0;r70=r31+4|0;r71=r31+8|0;r72=r31+12|0;r73=r31+16|0;r74=r30;r75=r30|0;r76=r30+4|0;r77=r30+8|0;r78=r30+12|0;r79=r30+16|0;r80=r29;r81=r29|0;r82=r29+4|0;r83=r29+8|0;r84=r29+12|0;r85=r29+16|0;r86=r28;r87=r28|0;r88=r28+4|0;r89=r28+8|0;r90=r28+12|0;r91=r28+16|0;r92=r27;r93=r27|0;r94=r27+4|0;r95=r27+8|0;r96=r27+12|0;r97=r27+16|0;r98=r26;r99=r26|0;r100=r26+4|0;r101=r26+8|0;r102=r26+12|0;r103=r26+16|0;r104=r25;r105=r25|0;r106=r25+4|0;r107=r25+8|0;r108=r25+12|0;r109=r25+16|0;r110=r24;r111=r24|0;r112=r24+4|0;r113=r24+8|0;r114=r24+12|0;r115=r24+16|0;r116=r23;r117=r23|0;r118=r23+4|0;r119=r23+8|0;r120=r23+12|0;r121=r23+16|0;r122=r22;r123=r22|0;r124=r22+4|0;r125=r22+8|0;r126=r22+12|0;r127=r22+16|0;r128=r21;r129=r21|0;r130=r21+4|0;r131=r21+8|0;r132=r21+12|0;r133=r21+16|0;r134=r20;r135=r20|0;r136=r20+4|0;r137=r20+8|0;r138=r20+12|0;r139=r20+16|0;r140=r19;r141=r19|0;r142=r19+4|0;r143=r19+8|0;r144=r19+12|0;r145=r19+16|0;r146=r18;r147=r18|0;r148=r18+4|0;r149=r18+8|0;r150=r18+12|0;r151=r18+16|0;r152=r17;r153=r17|0;r154=r17+4|0;r155=r17+8|0;r156=r17+12|0;r157=r17+16|0;r158=r16;r159=r16|0;r160=r16+4|0;r161=r16+8|0;r162=r16+12|0;r163=r16+16|0;r164=r15;r165=r15|0;r166=r15+4|0;r167=r15+8|0;r168=r15+12|0;r169=r15+16|0;r170=r14;r171=r14|0;r172=r14+4|0;r173=r14+8|0;r174=r14+12|0;r175=r14+16|0;r176=r13;r177=r13|0;r178=r13+4|0;r179=r13+8|0;r180=r13+12|0;r181=r13+16|0;r182=r12;r183=r12|0;r184=r12+4|0;r185=r12+8|0;r186=r12+12|0;r187=r12+16|0;r188=r11;r189=r11|0;r190=r11+4|0;r191=r11+8|0;r192=r11+12|0;r193=r11+16|0;r194=r10;r195=r10|0;r196=r10+4|0;r197=r10+8|0;r198=r10+12|0;r199=r10+16|0;r200=r9;r201=r9|0;r202=r9+4|0;r203=r9+8|0;r204=r9+12|0;r205=r9+16|0;r206=r8;r207=r8|0;r208=r8+4|0;r209=r8+8|0;r210=r8+12|0;r211=r8+16|0;r212=r7;r213=r7|0;r214=r7+4|0;r215=r7+8|0;r216=r7+12|0;r217=r7+16|0;r218=r6;r219=r6|0;r220=r6+4|0;r221=r6+8|0;r222=r6+12|0;r223=r6+16|0;r224=r5;r225=r5|0;r226=r5+4|0;r227=r5+8|0;r228=r5+12|0;r229=r5+16|0;r230=0;L3062:while(1){L3064:do{if(r46){r231=r230*-364&-1;r232=(r230|0)==0;r233=r231+182|0;r234=0;while(1){r235=r234*315&-1;r236=(r234&1|0)!=0;r237=r236|r232;r238=r237?r236?r233:r231:r231;if(r237|(r230|0)!=(r47|0)){r237=HEAP32[r41],r236=r237>>2;r239=HEAP32[r48];HEAP32[((r239*24&-1)>>2)+r236]=5;r240=_malloc(20);if((r240|0)==0){r3=2240;break L3062}r241=r240;r240=(r237+(r239*24&-1)+8|0)>>2;HEAP32[r240]=r241;HEAP32[r241>>2]=0;HEAP32[HEAP32[r240]+4>>2]=0;HEAP32[HEAP32[r240]+8>>2]=0;HEAP32[HEAP32[r240]+12>>2]=0;HEAP32[HEAP32[r240]+16>>2]=0;HEAP32[((r239*24&-1)+4>>2)+r236]=0;HEAP32[((r239*24&-1)+12>>2)+r236]=0;HEAP32[r48]=HEAP32[r48]+1|0;HEAP32[r50>>2]=0;HEAP32[r51>>2]=0;HEAP32[r52>>2]=0;HEAP32[r53>>2]=r235;HEAP32[r54>>2]=r238;r236=_findrelpos234(r43,r49,0,0,0);do{if((r236|0)==0){r239=HEAP32[r42],r240=r239>>2;r241=HEAP32[r55];r237=r239+(r241*20&-1)|0;HEAP32[r237>>2]=0;HEAP32[((r241*20&-1)+4>>2)+r240]=0;HEAP32[((r241*20&-1)+8>>2)+r240]=0;HEAP32[((r241*20&-1)+12>>2)+r240]=r235;HEAP32[((r241*20&-1)+16>>2)+r240]=r238;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r242=r237;break}_add234_internal(r43,r237,-1);r242=r237}else{r242=r236}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]>>2]=r242;r236=r235-30|0;r237=r238+156|0;HEAP32[r57>>2]=0;HEAP32[r58>>2]=0;HEAP32[r59>>2]=0;HEAP32[r60>>2]=r236;HEAP32[r61>>2]=r237;r240=_findrelpos234(r43,r56,0,0,0);do{if((r240|0)==0){r241=HEAP32[r42],r239=r241>>2;r243=HEAP32[r55];r244=r241+(r243*20&-1)|0;HEAP32[r244>>2]=0;HEAP32[((r243*20&-1)+4>>2)+r239]=0;HEAP32[((r243*20&-1)+8>>2)+r239]=0;HEAP32[((r243*20&-1)+12>>2)+r239]=r236;HEAP32[((r243*20&-1)+16>>2)+r239]=r237;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r245=r244;break}_add234_internal(r43,r244,-1);r245=r244}else{r245=r240}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+4>>2]=r245;r240=r235+30|0;r244=r238+208|0;HEAP32[r63>>2]=0;HEAP32[r64>>2]=0;HEAP32[r65>>2]=0;HEAP32[r66>>2]=r240;HEAP32[r67>>2]=r244;r239=_findrelpos234(r43,r62,0,0,0);do{if((r239|0)==0){r243=HEAP32[r42],r241=r243>>2;r246=HEAP32[r55];r247=r243+(r246*20&-1)|0;HEAP32[r247>>2]=0;HEAP32[((r246*20&-1)+4>>2)+r241]=0;HEAP32[((r246*20&-1)+8>>2)+r241]=0;HEAP32[((r246*20&-1)+12>>2)+r241]=r240;HEAP32[((r246*20&-1)+16>>2)+r241]=r244;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r248=r247;break}_add234_internal(r43,r247,-1);r248=r247}else{r248=r239}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+8>>2]=r248;r239=r235+120|0;r244=r235+105|0;r247=r238+104|0;r241=r238+182|0;HEAP32[r69>>2]=0;HEAP32[r70>>2]=0;HEAP32[r71>>2]=0;HEAP32[r72>>2]=r244;HEAP32[r73>>2]=r241;r246=_findrelpos234(r43,r68,0,0,0);do{if((r246|0)==0){r243=HEAP32[r42],r249=r243>>2;r250=HEAP32[r55];r251=r243+(r250*20&-1)|0;HEAP32[r251>>2]=0;HEAP32[((r250*20&-1)+4>>2)+r249]=0;HEAP32[((r250*20&-1)+8>>2)+r249]=0;HEAP32[((r250*20&-1)+12>>2)+r249]=r244;HEAP32[((r250*20&-1)+16>>2)+r249]=r241;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r252=r251;break}_add234_internal(r43,r251,-1);r252=r251}else{r252=r246}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+12>>2]=r252;HEAP32[r75>>2]=0;HEAP32[r76>>2]=0;HEAP32[r77>>2]=0;HEAP32[r78>>2]=r239;HEAP32[r79>>2]=r247;r246=_findrelpos234(r43,r74,0,0,0);do{if((r246|0)==0){r251=HEAP32[r42],r249=r251>>2;r250=HEAP32[r55];r243=r251+(r250*20&-1)|0;HEAP32[r243>>2]=0;HEAP32[((r250*20&-1)+4>>2)+r249]=0;HEAP32[((r250*20&-1)+8>>2)+r249]=0;HEAP32[((r250*20&-1)+12>>2)+r249]=r239;HEAP32[((r250*20&-1)+16>>2)+r249]=r247;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r253=r243;break}_add234_internal(r43,r243,-1);r253=r243}else{r253=r246}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+16>>2]=r253;r246=HEAP32[r41],r243=r246>>2;r249=HEAP32[r48];HEAP32[((r249*24&-1)>>2)+r243]=5;r250=_malloc(20);if((r250|0)==0){r3=2262;break L3062}r251=r250;r250=(r246+(r249*24&-1)+8|0)>>2;HEAP32[r250]=r251;HEAP32[r251>>2]=0;HEAP32[HEAP32[r250]+4>>2]=0;HEAP32[HEAP32[r250]+8>>2]=0;HEAP32[HEAP32[r250]+12>>2]=0;HEAP32[HEAP32[r250]+16>>2]=0;HEAP32[((r249*24&-1)+4>>2)+r243]=0;HEAP32[((r249*24&-1)+12>>2)+r243]=0;HEAP32[r48]=HEAP32[r48]+1|0;HEAP32[r81>>2]=0;HEAP32[r82>>2]=0;HEAP32[r83>>2]=0;HEAP32[r84>>2]=r235;HEAP32[r85>>2]=r238;r243=_findrelpos234(r43,r80,0,0,0);do{if((r243|0)==0){r249=HEAP32[r42],r250=r249>>2;r251=HEAP32[r55];r246=r249+(r251*20&-1)|0;HEAP32[r246>>2]=0;HEAP32[((r251*20&-1)+4>>2)+r250]=0;HEAP32[((r251*20&-1)+8>>2)+r250]=0;HEAP32[((r251*20&-1)+12>>2)+r250]=r235;HEAP32[((r251*20&-1)+16>>2)+r250]=r238;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r254=r246;break}_add234_internal(r43,r246,-1);r254=r246}else{r254=r243}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]>>2]=r254;HEAP32[r87>>2]=0;HEAP32[r88>>2]=0;HEAP32[r89>>2]=0;HEAP32[r90>>2]=r239;HEAP32[r91>>2]=r247;r243=_findrelpos234(r43,r86,0,0,0);do{if((r243|0)==0){r246=HEAP32[r42],r250=r246>>2;r251=HEAP32[r55];r249=r246+(r251*20&-1)|0;HEAP32[r249>>2]=0;HEAP32[((r251*20&-1)+4>>2)+r250]=0;HEAP32[((r251*20&-1)+8>>2)+r250]=0;HEAP32[((r251*20&-1)+12>>2)+r250]=r239;HEAP32[((r251*20&-1)+16>>2)+r250]=r247;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r255=r249;break}_add234_internal(r43,r249,-1);r255=r249}else{r255=r243}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+4>>2]=r255;r243=r235+195|0;r247=r238+78|0;HEAP32[r93>>2]=0;HEAP32[r94>>2]=0;HEAP32[r95>>2]=0;HEAP32[r96>>2]=r243;HEAP32[r97>>2]=r247;r239=_findrelpos234(r43,r92,0,0,0);do{if((r239|0)==0){r249=HEAP32[r42],r250=r249>>2;r251=HEAP32[r55];r246=r249+(r251*20&-1)|0;HEAP32[r246>>2]=0;HEAP32[((r251*20&-1)+4>>2)+r250]=0;HEAP32[((r251*20&-1)+8>>2)+r250]=0;HEAP32[((r251*20&-1)+12>>2)+r250]=r243;HEAP32[((r251*20&-1)+16>>2)+r250]=r247;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r256=r246;break}_add234_internal(r43,r246,-1);r256=r246}else{r256=r239}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+8>>2]=r256;r239=r235+150|0;r247=r235+210|0;r243=r238-52|0;HEAP32[r99>>2]=0;HEAP32[r100>>2]=0;HEAP32[r101>>2]=0;HEAP32[r102>>2]=r247;HEAP32[r103>>2]=r238;r246=_findrelpos234(r43,r98,0,0,0);do{if((r246|0)==0){r250=HEAP32[r42],r251=r250>>2;r249=HEAP32[r55];r257=r250+(r249*20&-1)|0;HEAP32[r257>>2]=0;HEAP32[((r249*20&-1)+4>>2)+r251]=0;HEAP32[((r249*20&-1)+8>>2)+r251]=0;HEAP32[((r249*20&-1)+12>>2)+r251]=r247;HEAP32[((r249*20&-1)+16>>2)+r251]=r238;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r258=r257;break}_add234_internal(r43,r257,-1);r258=r257}else{r258=r246}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+12>>2]=r258;HEAP32[r105>>2]=0;HEAP32[r106>>2]=0;HEAP32[r107>>2]=0;HEAP32[r108>>2]=r239;HEAP32[r109>>2]=r243;r246=_findrelpos234(r43,r104,0,0,0);do{if((r246|0)==0){r247=HEAP32[r42],r257=r247>>2;r251=HEAP32[r55];r249=r247+(r251*20&-1)|0;HEAP32[r249>>2]=0;HEAP32[((r251*20&-1)+4>>2)+r257]=0;HEAP32[((r251*20&-1)+8>>2)+r257]=0;HEAP32[((r251*20&-1)+12>>2)+r257]=r239;HEAP32[((r251*20&-1)+16>>2)+r257]=r243;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r259=r249;break}_add234_internal(r43,r249,-1);r259=r249}else{r259=r246}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+16>>2]=r259;r246=HEAP32[r41],r249=r246>>2;r257=HEAP32[r48];HEAP32[((r257*24&-1)>>2)+r249]=5;r251=_malloc(20);if((r251|0)==0){r3=2284;break L3062}r247=r251;r251=(r246+(r257*24&-1)+8|0)>>2;HEAP32[r251]=r247;HEAP32[r247>>2]=0;HEAP32[HEAP32[r251]+4>>2]=0;HEAP32[HEAP32[r251]+8>>2]=0;HEAP32[HEAP32[r251]+12>>2]=0;HEAP32[HEAP32[r251]+16>>2]=0;HEAP32[((r257*24&-1)+4>>2)+r249]=0;HEAP32[((r257*24&-1)+12>>2)+r249]=0;HEAP32[r48]=HEAP32[r48]+1|0;HEAP32[r111>>2]=0;HEAP32[r112>>2]=0;HEAP32[r113>>2]=0;HEAP32[r114>>2]=r235;HEAP32[r115>>2]=r238;r249=_findrelpos234(r43,r110,0,0,0);do{if((r249|0)==0){r257=HEAP32[r42],r251=r257>>2;r247=HEAP32[r55];r246=r257+(r247*20&-1)|0;HEAP32[r246>>2]=0;HEAP32[((r247*20&-1)+4>>2)+r251]=0;HEAP32[((r247*20&-1)+8>>2)+r251]=0;HEAP32[((r247*20&-1)+12>>2)+r251]=r235;HEAP32[((r247*20&-1)+16>>2)+r251]=r238;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r260=r246;break}_add234_internal(r43,r246,-1);r260=r246}else{r260=r249}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]>>2]=r260;HEAP32[r117>>2]=0;HEAP32[r118>>2]=0;HEAP32[r119>>2]=0;HEAP32[r120>>2]=r239;HEAP32[r121>>2]=r243;r249=_findrelpos234(r43,r116,0,0,0);do{if((r249|0)==0){r246=HEAP32[r42],r251=r246>>2;r247=HEAP32[r55];r257=r246+(r247*20&-1)|0;HEAP32[r257>>2]=0;HEAP32[((r247*20&-1)+4>>2)+r251]=0;HEAP32[((r247*20&-1)+8>>2)+r251]=0;HEAP32[((r247*20&-1)+12>>2)+r251]=r239;HEAP32[((r247*20&-1)+16>>2)+r251]=r243;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r261=r257;break}_add234_internal(r43,r257,-1);r261=r257}else{r261=r249}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+4>>2]=r261;r249=r235+165|0;r243=r238-130|0;HEAP32[r123>>2]=0;HEAP32[r124>>2]=0;HEAP32[r125>>2]=0;HEAP32[r126>>2]=r249;HEAP32[r127>>2]=r243;r239=_findrelpos234(r43,r122,0,0,0);do{if((r239|0)==0){r257=HEAP32[r42],r251=r257>>2;r247=HEAP32[r55];r246=r257+(r247*20&-1)|0;HEAP32[r246>>2]=0;HEAP32[((r247*20&-1)+4>>2)+r251]=0;HEAP32[((r247*20&-1)+8>>2)+r251]=0;HEAP32[((r247*20&-1)+12>>2)+r251]=r249;HEAP32[((r247*20&-1)+16>>2)+r251]=r243;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r262=r246;break}_add234_internal(r43,r246,-1);r262=r246}else{r262=r239}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+8>>2]=r262;r239=r238-156|0;r243=r238-182|0;HEAP32[r129>>2]=0;HEAP32[r130>>2]=0;HEAP32[r131>>2]=0;HEAP32[r132>>2]=r244;HEAP32[r133>>2]=r243;r249=_findrelpos234(r43,r128,0,0,0);do{if((r249|0)==0){r246=HEAP32[r42],r251=r246>>2;r247=HEAP32[r55];r257=r246+(r247*20&-1)|0;HEAP32[r257>>2]=0;HEAP32[((r247*20&-1)+4>>2)+r251]=0;HEAP32[((r247*20&-1)+8>>2)+r251]=0;HEAP32[((r247*20&-1)+12>>2)+r251]=r244;HEAP32[((r247*20&-1)+16>>2)+r251]=r243;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r263=r257;break}_add234_internal(r43,r257,-1);r263=r257}else{r263=r249}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+12>>2]=r263;HEAP32[r135>>2]=0;HEAP32[r136>>2]=0;HEAP32[r137>>2]=0;HEAP32[r138>>2]=r240;HEAP32[r139>>2]=r239;r249=_findrelpos234(r43,r134,0,0,0);do{if((r249|0)==0){r244=HEAP32[r42],r257=r244>>2;r251=HEAP32[r55];r247=r244+(r251*20&-1)|0;HEAP32[r247>>2]=0;HEAP32[((r251*20&-1)+4>>2)+r257]=0;HEAP32[((r251*20&-1)+8>>2)+r257]=0;HEAP32[((r251*20&-1)+12>>2)+r257]=r240;HEAP32[((r251*20&-1)+16>>2)+r257]=r239;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r264=r247;break}_add234_internal(r43,r247,-1);r264=r247}else{r264=r249}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+16>>2]=r264;r249=HEAP32[r41],r247=r249>>2;r257=HEAP32[r48];HEAP32[((r257*24&-1)>>2)+r247]=5;r251=_malloc(20);if((r251|0)==0){r3=2306;break L3062}r244=r251;r251=(r249+(r257*24&-1)+8|0)>>2;HEAP32[r251]=r244;HEAP32[r244>>2]=0;HEAP32[HEAP32[r251]+4>>2]=0;HEAP32[HEAP32[r251]+8>>2]=0;HEAP32[HEAP32[r251]+12>>2]=0;HEAP32[HEAP32[r251]+16>>2]=0;HEAP32[((r257*24&-1)+4>>2)+r247]=0;HEAP32[((r257*24&-1)+12>>2)+r247]=0;HEAP32[r48]=HEAP32[r48]+1|0;HEAP32[r141>>2]=0;HEAP32[r142>>2]=0;HEAP32[r143>>2]=0;HEAP32[r144>>2]=r235;HEAP32[r145>>2]=r238;r247=_findrelpos234(r43,r140,0,0,0);do{if((r247|0)==0){r257=HEAP32[r42],r251=r257>>2;r244=HEAP32[r55];r249=r257+(r244*20&-1)|0;HEAP32[r249>>2]=0;HEAP32[((r244*20&-1)+4>>2)+r251]=0;HEAP32[((r244*20&-1)+8>>2)+r251]=0;HEAP32[((r244*20&-1)+12>>2)+r251]=r235;HEAP32[((r244*20&-1)+16>>2)+r251]=r238;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r265=r249;break}_add234_internal(r43,r249,-1);r265=r249}else{r265=r247}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]>>2]=r265;HEAP32[r147>>2]=0;HEAP32[r148>>2]=0;HEAP32[r149>>2]=0;HEAP32[r150>>2]=r240;HEAP32[r151>>2]=r239;r247=_findrelpos234(r43,r146,0,0,0);do{if((r247|0)==0){r249=HEAP32[r42],r251=r249>>2;r244=HEAP32[r55];r257=r249+(r244*20&-1)|0;HEAP32[r257>>2]=0;HEAP32[((r244*20&-1)+4>>2)+r251]=0;HEAP32[((r244*20&-1)+8>>2)+r251]=0;HEAP32[((r244*20&-1)+12>>2)+r251]=r240;HEAP32[((r244*20&-1)+16>>2)+r251]=r239;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r266=r257;break}_add234_internal(r43,r257,-1);r266=r257}else{r266=r247}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+4>>2]=r266;r247=r238-208|0;HEAP32[r153>>2]=0;HEAP32[r154>>2]=0;HEAP32[r155>>2]=0;HEAP32[r156>>2]=r236;HEAP32[r157>>2]=r247;r239=_findrelpos234(r43,r152,0,0,0);do{if((r239|0)==0){r240=HEAP32[r42],r257=r240>>2;r251=HEAP32[r55];r244=r240+(r251*20&-1)|0;HEAP32[r244>>2]=0;HEAP32[((r251*20&-1)+4>>2)+r257]=0;HEAP32[((r251*20&-1)+8>>2)+r257]=0;HEAP32[((r251*20&-1)+12>>2)+r257]=r236;HEAP32[((r251*20&-1)+16>>2)+r257]=r247;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r267=r244;break}_add234_internal(r43,r244,-1);r267=r244}else{r267=r239}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+8>>2]=r267;r239=r235-120|0;r247=r235-105|0;r244=r238-104|0;HEAP32[r159>>2]=0;HEAP32[r160>>2]=0;HEAP32[r161>>2]=0;HEAP32[r162>>2]=r247;HEAP32[r163>>2]=r243;r257=_findrelpos234(r43,r158,0,0,0);do{if((r257|0)==0){r251=HEAP32[r42],r240=r251>>2;r249=HEAP32[r55];r246=r251+(r249*20&-1)|0;HEAP32[r246>>2]=0;HEAP32[((r249*20&-1)+4>>2)+r240]=0;HEAP32[((r249*20&-1)+8>>2)+r240]=0;HEAP32[((r249*20&-1)+12>>2)+r240]=r247;HEAP32[((r249*20&-1)+16>>2)+r240]=r243;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r268=r246;break}_add234_internal(r43,r246,-1);r268=r246}else{r268=r257}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+12>>2]=r268;HEAP32[r165>>2]=0;HEAP32[r166>>2]=0;HEAP32[r167>>2]=0;HEAP32[r168>>2]=r239;HEAP32[r169>>2]=r244;r257=_findrelpos234(r43,r164,0,0,0);do{if((r257|0)==0){r243=HEAP32[r42],r246=r243>>2;r240=HEAP32[r55];r249=r243+(r240*20&-1)|0;HEAP32[r249>>2]=0;HEAP32[((r240*20&-1)+4>>2)+r246]=0;HEAP32[((r240*20&-1)+8>>2)+r246]=0;HEAP32[((r240*20&-1)+12>>2)+r246]=r239;HEAP32[((r240*20&-1)+16>>2)+r246]=r244;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r269=r249;break}_add234_internal(r43,r249,-1);r269=r249}else{r269=r257}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+16>>2]=r269;r257=HEAP32[r41],r249=r257>>2;r246=HEAP32[r48];HEAP32[((r246*24&-1)>>2)+r249]=5;r240=_malloc(20);if((r240|0)==0){r3=2328;break L3062}r243=r240;r240=(r257+(r246*24&-1)+8|0)>>2;HEAP32[r240]=r243;HEAP32[r243>>2]=0;HEAP32[HEAP32[r240]+4>>2]=0;HEAP32[HEAP32[r240]+8>>2]=0;HEAP32[HEAP32[r240]+12>>2]=0;HEAP32[HEAP32[r240]+16>>2]=0;HEAP32[((r246*24&-1)+4>>2)+r249]=0;HEAP32[((r246*24&-1)+12>>2)+r249]=0;HEAP32[r48]=HEAP32[r48]+1|0;HEAP32[r171>>2]=0;HEAP32[r172>>2]=0;HEAP32[r173>>2]=0;HEAP32[r174>>2]=r235;HEAP32[r175>>2]=r238;r249=_findrelpos234(r43,r170,0,0,0);do{if((r249|0)==0){r246=HEAP32[r42],r240=r246>>2;r243=HEAP32[r55];r257=r246+(r243*20&-1)|0;HEAP32[r257>>2]=0;HEAP32[((r243*20&-1)+4>>2)+r240]=0;HEAP32[((r243*20&-1)+8>>2)+r240]=0;HEAP32[((r243*20&-1)+12>>2)+r240]=r235;HEAP32[((r243*20&-1)+16>>2)+r240]=r238;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r270=r257;break}_add234_internal(r43,r257,-1);r270=r257}else{r270=r249}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]>>2]=r270;HEAP32[r177>>2]=0;HEAP32[r178>>2]=0;HEAP32[r179>>2]=0;HEAP32[r180>>2]=r239;HEAP32[r181>>2]=r244;r249=_findrelpos234(r43,r176,0,0,0);do{if((r249|0)==0){r257=HEAP32[r42],r240=r257>>2;r243=HEAP32[r55];r246=r257+(r243*20&-1)|0;HEAP32[r246>>2]=0;HEAP32[((r243*20&-1)+4>>2)+r240]=0;HEAP32[((r243*20&-1)+8>>2)+r240]=0;HEAP32[((r243*20&-1)+12>>2)+r240]=r239;HEAP32[((r243*20&-1)+16>>2)+r240]=r244;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r271=r246;break}_add234_internal(r43,r246,-1);r271=r246}else{r271=r249}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+4>>2]=r271;r249=r235-195|0;r244=r238-78|0;HEAP32[r183>>2]=0;HEAP32[r184>>2]=0;HEAP32[r185>>2]=0;HEAP32[r186>>2]=r249;HEAP32[r187>>2]=r244;r239=_findrelpos234(r43,r182,0,0,0);do{if((r239|0)==0){r246=HEAP32[r42],r240=r246>>2;r243=HEAP32[r55];r257=r246+(r243*20&-1)|0;HEAP32[r257>>2]=0;HEAP32[((r243*20&-1)+4>>2)+r240]=0;HEAP32[((r243*20&-1)+8>>2)+r240]=0;HEAP32[((r243*20&-1)+12>>2)+r240]=r249;HEAP32[((r243*20&-1)+16>>2)+r240]=r244;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r272=r257;break}_add234_internal(r43,r257,-1);r272=r257}else{r272=r239}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+8>>2]=r272;r239=r235-150|0;r244=r235-210|0;r249=r238+52|0;HEAP32[r189>>2]=0;HEAP32[r190>>2]=0;HEAP32[r191>>2]=0;HEAP32[r192>>2]=r244;HEAP32[r193>>2]=r238;r257=_findrelpos234(r43,r188,0,0,0);do{if((r257|0)==0){r240=HEAP32[r42],r243=r240>>2;r246=HEAP32[r55];r251=r240+(r246*20&-1)|0;HEAP32[r251>>2]=0;HEAP32[((r246*20&-1)+4>>2)+r243]=0;HEAP32[((r246*20&-1)+8>>2)+r243]=0;HEAP32[((r246*20&-1)+12>>2)+r243]=r244;HEAP32[((r246*20&-1)+16>>2)+r243]=r238;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r273=r251;break}_add234_internal(r43,r251,-1);r273=r251}else{r273=r257}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+12>>2]=r273;HEAP32[r195>>2]=0;HEAP32[r196>>2]=0;HEAP32[r197>>2]=0;HEAP32[r198>>2]=r239;HEAP32[r199>>2]=r249;r257=_findrelpos234(r43,r194,0,0,0);do{if((r257|0)==0){r244=HEAP32[r42],r251=r244>>2;r243=HEAP32[r55];r246=r244+(r243*20&-1)|0;HEAP32[r246>>2]=0;HEAP32[((r243*20&-1)+4>>2)+r251]=0;HEAP32[((r243*20&-1)+8>>2)+r251]=0;HEAP32[((r243*20&-1)+12>>2)+r251]=r239;HEAP32[((r243*20&-1)+16>>2)+r251]=r249;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r274=r246;break}_add234_internal(r43,r246,-1);r274=r246}else{r274=r257}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+16>>2]=r274;r257=HEAP32[r41],r246=r257>>2;r251=HEAP32[r48];HEAP32[((r251*24&-1)>>2)+r246]=5;r243=_malloc(20);if((r243|0)==0){r3=2350;break L3062}r244=r243;r243=(r257+(r251*24&-1)+8|0)>>2;HEAP32[r243]=r244;HEAP32[r244>>2]=0;HEAP32[HEAP32[r243]+4>>2]=0;HEAP32[HEAP32[r243]+8>>2]=0;HEAP32[HEAP32[r243]+12>>2]=0;HEAP32[HEAP32[r243]+16>>2]=0;HEAP32[((r251*24&-1)+4>>2)+r246]=0;HEAP32[((r251*24&-1)+12>>2)+r246]=0;HEAP32[r48]=HEAP32[r48]+1|0;HEAP32[r201>>2]=0;HEAP32[r202>>2]=0;HEAP32[r203>>2]=0;HEAP32[r204>>2]=r235;HEAP32[r205>>2]=r238;r246=_findrelpos234(r43,r200,0,0,0);do{if((r246|0)==0){r251=HEAP32[r42],r243=r251>>2;r244=HEAP32[r55];r257=r251+(r244*20&-1)|0;HEAP32[r257>>2]=0;HEAP32[((r244*20&-1)+4>>2)+r243]=0;HEAP32[((r244*20&-1)+8>>2)+r243]=0;HEAP32[((r244*20&-1)+12>>2)+r243]=r235;HEAP32[((r244*20&-1)+16>>2)+r243]=r238;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r275=r257;break}_add234_internal(r43,r257,-1);r275=r257}else{r275=r246}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]>>2]=r275;HEAP32[r207>>2]=0;HEAP32[r208>>2]=0;HEAP32[r209>>2]=0;HEAP32[r210>>2]=r239;HEAP32[r211>>2]=r249;r246=_findrelpos234(r43,r206,0,0,0);do{if((r246|0)==0){r257=HEAP32[r42],r243=r257>>2;r244=HEAP32[r55];r251=r257+(r244*20&-1)|0;HEAP32[r251>>2]=0;HEAP32[((r244*20&-1)+4>>2)+r243]=0;HEAP32[((r244*20&-1)+8>>2)+r243]=0;HEAP32[((r244*20&-1)+12>>2)+r243]=r239;HEAP32[((r244*20&-1)+16>>2)+r243]=r249;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r276=r251;break}_add234_internal(r43,r251,-1);r276=r251}else{r276=r246}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+4>>2]=r276;r246=r235-165|0;r249=r238+130|0;HEAP32[r213>>2]=0;HEAP32[r214>>2]=0;HEAP32[r215>>2]=0;HEAP32[r216>>2]=r246;HEAP32[r217>>2]=r249;r239=_findrelpos234(r43,r212,0,0,0);do{if((r239|0)==0){r251=HEAP32[r42],r243=r251>>2;r244=HEAP32[r55];r257=r251+(r244*20&-1)|0;HEAP32[r257>>2]=0;HEAP32[((r244*20&-1)+4>>2)+r243]=0;HEAP32[((r244*20&-1)+8>>2)+r243]=0;HEAP32[((r244*20&-1)+12>>2)+r243]=r246;HEAP32[((r244*20&-1)+16>>2)+r243]=r249;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r277=r257;break}_add234_internal(r43,r257,-1);r277=r257}else{r277=r239}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+8>>2]=r277;HEAP32[r219>>2]=0;HEAP32[r220>>2]=0;HEAP32[r221>>2]=0;HEAP32[r222>>2]=r247;HEAP32[r223>>2]=r241;r239=_findrelpos234(r43,r218,0,0,0);do{if((r239|0)==0){r249=HEAP32[r42],r246=r249>>2;r238=HEAP32[r55];r235=r249+(r238*20&-1)|0;HEAP32[r235>>2]=0;HEAP32[((r238*20&-1)+4>>2)+r246]=0;HEAP32[((r238*20&-1)+8>>2)+r246]=0;HEAP32[((r238*20&-1)+12>>2)+r246]=r247;HEAP32[((r238*20&-1)+16>>2)+r246]=r241;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r278=r235;break}_add234_internal(r43,r235,-1);r278=r235}else{r278=r239}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+12>>2]=r278;HEAP32[r225>>2]=0;HEAP32[r226>>2]=0;HEAP32[r227>>2]=0;HEAP32[r228>>2]=r236;HEAP32[r229>>2]=r237;r239=_findrelpos234(r43,r224,0,0,0);do{if((r239|0)==0){r241=HEAP32[r42],r247=r241>>2;r235=HEAP32[r55];r246=r241+(r235*20&-1)|0;HEAP32[r246>>2]=0;HEAP32[((r235*20&-1)+4>>2)+r247]=0;HEAP32[((r235*20&-1)+8>>2)+r247]=0;HEAP32[((r235*20&-1)+12>>2)+r247]=r236;HEAP32[((r235*20&-1)+16>>2)+r247]=r237;HEAP32[r55]=HEAP32[r55]+1|0;if((HEAP32[r45]|0)==0){r279=r246;break}_add234_internal(r43,r246,-1);r279=r246}else{r279=r239}}while(0);HEAP32[HEAP32[HEAP32[r41]+((HEAP32[r48]-1)*24&-1)+8>>2]+16>>2]=r279}r239=r234+1|0;if((r239|0)<(r1|0)){r234=r239}else{break L3064}}}}while(0);r234=r230+1|0;if((r234|0)<(r2|0)){r230=r234}else{r3=2374;break}}if(r3==2306){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==2240){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==2284){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==2262){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==2374){r280=HEAP32[r44>>2];break}else if(r3==2350){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==2328){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}else{r280=0}}while(0);_freenode234(r280);_free(r40);if((HEAP32[r38]|0)>(r35|0)){___assert_func(69436,2265,70508,67036)}if((HEAP32[r38+4]|0)<=(r36|0)){_grid_make_consistent(r39);STACKTOP=r4;return r39}___assert_func(69436,2266,70508,66776);_grid_make_consistent(r39);STACKTOP=r4;return r39}function _grid_new_dodecagonal(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187,r188,r189;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+360|0;r5=r4;r6=r4+20;r7=r4+40;r8=r4+60;r9=r4+80;r10=r4+100;r11=r4+120;r12=r4+140;r13=r4+160;r14=r4+180;r15=r4+200;r16=r4+220;r17=r4+240;r18=r4+260;r19=r4+280;r20=r4+300;r21=r4+320;r22=r4+340;r23=Math.imul(r1*3&-1,r2);r24=Math.imul(r1*14&-1,r2);r25=_malloc(48),r26=r25>>2;if((r25|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r27=r25;HEAP32[r26]=0;HEAP32[r26+1]=0;HEAP32[r26+2]=0;HEAP32[r26+3]=0;HEAP32[r26+4]=0;HEAP32[r26+5]=0;HEAP32[r26+11]=1;r28=(r25+24|0)>>2;HEAP32[r28]=0;HEAP32[r28+1]=0;HEAP32[r28+2]=0;HEAP32[r28+3]=0;HEAP32[r26+10]=26;r28=_malloc(r23*24&-1);if((r28|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r29=(r25+4|0)>>2;HEAP32[r29]=r28;r28=_malloc(r24*20&-1);if((r28|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r30=(r25+20|0)>>2;HEAP32[r30]=r28;r28=_malloc(8);if((r28|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r31=r28;r32=r28;HEAP32[r32>>2]=0;r33=(r28+4|0)>>2;HEAP32[r33]=42;do{if((r2|0)>0){r34=(r1|0)>0;r35=r25>>2;r36=r22;r37=r22|0;r38=r22+4|0;r39=r22+8|0;r40=r22+12|0;r41=r22+16|0;r42=(r25+16|0)>>2;r43=r21;r44=r21|0;r45=r21+4|0;r46=r21+8|0;r47=r21+12|0;r48=r21+16|0;r49=r20;r50=r20|0;r51=r20+4|0;r52=r20+8|0;r53=r20+12|0;r54=r20+16|0;r55=r19;r56=r19|0;r57=r19+4|0;r58=r19+8|0;r59=r19+12|0;r60=r19+16|0;r61=r18;r62=r18|0;r63=r18+4|0;r64=r18+8|0;r65=r18+12|0;r66=r18+16|0;r67=r17;r68=r17|0;r69=r17+4|0;r70=r17+8|0;r71=r17+12|0;r72=r17+16|0;r73=r16;r74=r16|0;r75=r16+4|0;r76=r16+8|0;r77=r16+12|0;r78=r16+16|0;r79=r15;r80=r15|0;r81=r15+4|0;r82=r15+8|0;r83=r15+12|0;r84=r15+16|0;r85=r14;r86=r14|0;r87=r14+4|0;r88=r14+8|0;r89=r14+12|0;r90=r14+16|0;r91=r13;r92=r13|0;r93=r13+4|0;r94=r13+8|0;r95=r13+12|0;r96=r13+16|0;r97=r12;r98=r12|0;r99=r12+4|0;r100=r12+8|0;r101=r12+12|0;r102=r12+16|0;r103=r11;r104=r11|0;r105=r11+4|0;r106=r11+8|0;r107=r11+12|0;r108=r11+16|0;r109=r2-1|0;r110=r1-1|0;r111=r10;r112=r10|0;r113=r10+4|0;r114=r10+8|0;r115=r10+12|0;r116=r10+16|0;r117=r9;r118=r9|0;r119=r9+4|0;r120=r9+8|0;r121=r9+12|0;r122=r9+16|0;r123=r8;r124=r8|0;r125=r8+4|0;r126=r8+8|0;r127=r8+12|0;r128=r8+16|0;r129=r7;r130=r7|0;r131=r7+4|0;r132=r7+8|0;r133=r7+12|0;r134=r7+16|0;r135=r6;r136=r6|0;r137=r6+4|0;r138=r6+8|0;r139=r6+12|0;r140=r6+16|0;r141=r5;r142=r5|0;r143=r5+4|0;r144=r5+8|0;r145=r5+12|0;r146=r5+16|0;r147=0;L15:while(1){L17:do{if(r34){r148=r147*97&-1;r149=(r147&1|0)!=0;r150=r148-56|0;r151=r148-41|0;r152=r148-15|0;r153=r148+15|0;r154=r148+41|0;r155=r148+56|0;r156=(r147|0)<(r109|0);r157=r149^1;r158=r148+82|0;r159=(r147|0)==0;r160=r148-82|0;r148=0;while(1){r161=r148*112&-1;r162=r149?r161+56|0:r161;r161=HEAP32[r29],r163=r161>>2;r164=HEAP32[r35];HEAP32[((r164*24&-1)>>2)+r163]=12;r165=_malloc(48);if((r165|0)==0){r3=14;break L15}r166=r165;r165=(r161+(r164*24&-1)+8|0)>>2;HEAP32[r165]=r166;HEAP32[r166>>2]=0;HEAP32[HEAP32[r165]+4>>2]=0;HEAP32[HEAP32[r165]+8>>2]=0;HEAP32[HEAP32[r165]+12>>2]=0;HEAP32[HEAP32[r165]+16>>2]=0;HEAP32[HEAP32[r165]+20>>2]=0;HEAP32[HEAP32[r165]+24>>2]=0;HEAP32[HEAP32[r165]+28>>2]=0;HEAP32[HEAP32[r165]+32>>2]=0;HEAP32[HEAP32[r165]+36>>2]=0;HEAP32[HEAP32[r165]+40>>2]=0;HEAP32[HEAP32[r165]+44>>2]=0;HEAP32[((r164*24&-1)+4>>2)+r163]=0;HEAP32[((r164*24&-1)+12>>2)+r163]=0;HEAP32[r35]=HEAP32[r35]+1|0;r163=r162+15|0;HEAP32[r37>>2]=0;HEAP32[r38>>2]=0;HEAP32[r39>>2]=0;HEAP32[r40>>2]=r163;HEAP32[r41>>2]=r150;r164=_findrelpos234(r31,r36,0,0,0);do{if((r164|0)==0){r165=HEAP32[r30],r166=r165>>2;r161=HEAP32[r42];r167=r165+(r161*20&-1)|0;HEAP32[r167>>2]=0;HEAP32[((r161*20&-1)+4>>2)+r166]=0;HEAP32[((r161*20&-1)+8>>2)+r166]=0;HEAP32[((r161*20&-1)+12>>2)+r166]=r163;HEAP32[((r161*20&-1)+16>>2)+r166]=r150;HEAP32[r42]=HEAP32[r42]+1|0;if((HEAP32[r33]|0)==0){r168=r167;break}_add234_internal(r31,r167,-1);r168=r167}else{r168=r164}}while(0);HEAP32[HEAP32[HEAP32[r29]+((HEAP32[r35]-1)*24&-1)+8>>2]>>2]=r168;r164=r162+41|0;HEAP32[r44>>2]=0;HEAP32[r45>>2]=0;HEAP32[r46>>2]=0;HEAP32[r47>>2]=r164;HEAP32[r48>>2]=r151;r167=_findrelpos234(r31,r43,0,0,0);do{if((r167|0)==0){r166=HEAP32[r30],r161=r166>>2;r165=HEAP32[r42];r169=r166+(r165*20&-1)|0;HEAP32[r169>>2]=0;HEAP32[((r165*20&-1)+4>>2)+r161]=0;HEAP32[((r165*20&-1)+8>>2)+r161]=0;HEAP32[((r165*20&-1)+12>>2)+r161]=r164;HEAP32[((r165*20&-1)+16>>2)+r161]=r151;HEAP32[r42]=HEAP32[r42]+1|0;if((HEAP32[r33]|0)==0){r170=r169;break}_add234_internal(r31,r169,-1);r170=r169}else{r170=r167}}while(0);HEAP32[HEAP32[HEAP32[r29]+((HEAP32[r35]-1)*24&-1)+8>>2]+4>>2]=r170;r167=r162+56|0;HEAP32[r50>>2]=0;HEAP32[r51>>2]=0;HEAP32[r52>>2]=0;HEAP32[r53>>2]=r167;HEAP32[r54>>2]=r152;r169=_findrelpos234(r31,r49,0,0,0);do{if((r169|0)==0){r161=HEAP32[r30],r165=r161>>2;r166=HEAP32[r42];r171=r161+(r166*20&-1)|0;HEAP32[r171>>2]=0;HEAP32[((r166*20&-1)+4>>2)+r165]=0;HEAP32[((r166*20&-1)+8>>2)+r165]=0;HEAP32[((r166*20&-1)+12>>2)+r165]=r167;HEAP32[((r166*20&-1)+16>>2)+r165]=r152;HEAP32[r42]=HEAP32[r42]+1|0;if((HEAP32[r33]|0)==0){r172=r171;break}_add234_internal(r31,r171,-1);r172=r171}else{r172=r169}}while(0);HEAP32[HEAP32[HEAP32[r29]+((HEAP32[r35]-1)*24&-1)+8>>2]+8>>2]=r172;HEAP32[r56>>2]=0;HEAP32[r57>>2]=0;HEAP32[r58>>2]=0;HEAP32[r59>>2]=r167;HEAP32[r60>>2]=r153;r169=_findrelpos234(r31,r55,0,0,0);do{if((r169|0)==0){r171=HEAP32[r30],r165=r171>>2;r166=HEAP32[r42];r161=r171+(r166*20&-1)|0;HEAP32[r161>>2]=0;HEAP32[((r166*20&-1)+4>>2)+r165]=0;HEAP32[((r166*20&-1)+8>>2)+r165]=0;HEAP32[((r166*20&-1)+12>>2)+r165]=r167;HEAP32[((r166*20&-1)+16>>2)+r165]=r153;HEAP32[r42]=HEAP32[r42]+1|0;if((HEAP32[r33]|0)==0){r173=r161;break}_add234_internal(r31,r161,-1);r173=r161}else{r173=r169}}while(0);HEAP32[HEAP32[HEAP32[r29]+((HEAP32[r35]-1)*24&-1)+8>>2]+12>>2]=r173;HEAP32[r62>>2]=0;HEAP32[r63>>2]=0;HEAP32[r64>>2]=0;HEAP32[r65>>2]=r164;HEAP32[r66>>2]=r154;r169=_findrelpos234(r31,r61,0,0,0);do{if((r169|0)==0){r167=HEAP32[r30],r161=r167>>2;r165=HEAP32[r42];r166=r167+(r165*20&-1)|0;HEAP32[r166>>2]=0;HEAP32[((r165*20&-1)+4>>2)+r161]=0;HEAP32[((r165*20&-1)+8>>2)+r161]=0;HEAP32[((r165*20&-1)+12>>2)+r161]=r164;HEAP32[((r165*20&-1)+16>>2)+r161]=r154;HEAP32[r42]=HEAP32[r42]+1|0;if((HEAP32[r33]|0)==0){r174=r166;break}_add234_internal(r31,r166,-1);r174=r166}else{r174=r169}}while(0);HEAP32[HEAP32[HEAP32[r29]+((HEAP32[r35]-1)*24&-1)+8>>2]+16>>2]=r174;HEAP32[r68>>2]=0;HEAP32[r69>>2]=0;HEAP32[r70>>2]=0;HEAP32[r71>>2]=r163;HEAP32[r72>>2]=r155;r169=_findrelpos234(r31,r67,0,0,0);do{if((r169|0)==0){r164=HEAP32[r30],r166=r164>>2;r161=HEAP32[r42];r165=r164+(r161*20&-1)|0;HEAP32[r165>>2]=0;HEAP32[((r161*20&-1)+4>>2)+r166]=0;HEAP32[((r161*20&-1)+8>>2)+r166]=0;HEAP32[((r161*20&-1)+12>>2)+r166]=r163;HEAP32[((r161*20&-1)+16>>2)+r166]=r155;HEAP32[r42]=HEAP32[r42]+1|0;if((HEAP32[r33]|0)==0){r175=r165;break}_add234_internal(r31,r165,-1);r175=r165}else{r175=r169}}while(0);HEAP32[HEAP32[HEAP32[r29]+((HEAP32[r35]-1)*24&-1)+8>>2]+20>>2]=r175;r169=r162-15|0;HEAP32[r74>>2]=0;HEAP32[r75>>2]=0;HEAP32[r76>>2]=0;HEAP32[r77>>2]=r169;HEAP32[r78>>2]=r155;r165=_findrelpos234(r31,r73,0,0,0);do{if((r165|0)==0){r166=HEAP32[r30],r161=r166>>2;r164=HEAP32[r42];r167=r166+(r164*20&-1)|0;HEAP32[r167>>2]=0;HEAP32[((r164*20&-1)+4>>2)+r161]=0;HEAP32[((r164*20&-1)+8>>2)+r161]=0;HEAP32[((r164*20&-1)+12>>2)+r161]=r169;HEAP32[((r164*20&-1)+16>>2)+r161]=r155;HEAP32[r42]=HEAP32[r42]+1|0;if((HEAP32[r33]|0)==0){r176=r167;break}_add234_internal(r31,r167,-1);r176=r167}else{r176=r165}}while(0);HEAP32[HEAP32[HEAP32[r29]+((HEAP32[r35]-1)*24&-1)+8>>2]+24>>2]=r176;r165=r162-41|0;HEAP32[r80>>2]=0;HEAP32[r81>>2]=0;HEAP32[r82>>2]=0;HEAP32[r83>>2]=r165;HEAP32[r84>>2]=r154;r167=_findrelpos234(r31,r79,0,0,0);do{if((r167|0)==0){r161=HEAP32[r30],r164=r161>>2;r166=HEAP32[r42];r171=r161+(r166*20&-1)|0;HEAP32[r171>>2]=0;HEAP32[((r166*20&-1)+4>>2)+r164]=0;HEAP32[((r166*20&-1)+8>>2)+r164]=0;HEAP32[((r166*20&-1)+12>>2)+r164]=r165;HEAP32[((r166*20&-1)+16>>2)+r164]=r154;HEAP32[r42]=HEAP32[r42]+1|0;if((HEAP32[r33]|0)==0){r177=r171;break}_add234_internal(r31,r171,-1);r177=r171}else{r177=r167}}while(0);HEAP32[HEAP32[HEAP32[r29]+((HEAP32[r35]-1)*24&-1)+8>>2]+28>>2]=r177;r167=r162-56|0;HEAP32[r86>>2]=0;HEAP32[r87>>2]=0;HEAP32[r88>>2]=0;HEAP32[r89>>2]=r167;HEAP32[r90>>2]=r153;r171=_findrelpos234(r31,r85,0,0,0);do{if((r171|0)==0){r164=HEAP32[r30],r166=r164>>2;r161=HEAP32[r42];r178=r164+(r161*20&-1)|0;HEAP32[r178>>2]=0;HEAP32[((r161*20&-1)+4>>2)+r166]=0;HEAP32[((r161*20&-1)+8>>2)+r166]=0;HEAP32[((r161*20&-1)+12>>2)+r166]=r167;HEAP32[((r161*20&-1)+16>>2)+r166]=r153;HEAP32[r42]=HEAP32[r42]+1|0;if((HEAP32[r33]|0)==0){r179=r178;break}_add234_internal(r31,r178,-1);r179=r178}else{r179=r171}}while(0);HEAP32[HEAP32[HEAP32[r29]+((HEAP32[r35]-1)*24&-1)+8>>2]+32>>2]=r179;HEAP32[r92>>2]=0;HEAP32[r93>>2]=0;HEAP32[r94>>2]=0;HEAP32[r95>>2]=r167;HEAP32[r96>>2]=r152;r171=_findrelpos234(r31,r91,0,0,0);do{if((r171|0)==0){r178=HEAP32[r30],r166=r178>>2;r161=HEAP32[r42];r164=r178+(r161*20&-1)|0;HEAP32[r164>>2]=0;HEAP32[((r161*20&-1)+4>>2)+r166]=0;HEAP32[((r161*20&-1)+8>>2)+r166]=0;HEAP32[((r161*20&-1)+12>>2)+r166]=r167;HEAP32[((r161*20&-1)+16>>2)+r166]=r152;HEAP32[r42]=HEAP32[r42]+1|0;if((HEAP32[r33]|0)==0){r180=r164;break}_add234_internal(r31,r164,-1);r180=r164}else{r180=r171}}while(0);HEAP32[HEAP32[HEAP32[r29]+((HEAP32[r35]-1)*24&-1)+8>>2]+36>>2]=r180;HEAP32[r98>>2]=0;HEAP32[r99>>2]=0;HEAP32[r100>>2]=0;HEAP32[r101>>2]=r165;HEAP32[r102>>2]=r151;r171=_findrelpos234(r31,r97,0,0,0);do{if((r171|0)==0){r167=HEAP32[r30],r164=r167>>2;r166=HEAP32[r42];r161=r167+(r166*20&-1)|0;HEAP32[r161>>2]=0;HEAP32[((r166*20&-1)+4>>2)+r164]=0;HEAP32[((r166*20&-1)+8>>2)+r164]=0;HEAP32[((r166*20&-1)+12>>2)+r164]=r165;HEAP32[((r166*20&-1)+16>>2)+r164]=r151;HEAP32[r42]=HEAP32[r42]+1|0;if((HEAP32[r33]|0)==0){r181=r161;break}_add234_internal(r31,r161,-1);r181=r161}else{r181=r171}}while(0);HEAP32[HEAP32[HEAP32[r29]+((HEAP32[r35]-1)*24&-1)+8>>2]+40>>2]=r181;HEAP32[r104>>2]=0;HEAP32[r105>>2]=0;HEAP32[r106>>2]=0;HEAP32[r107>>2]=r169;HEAP32[r108>>2]=r150;r171=_findrelpos234(r31,r103,0,0,0);do{if((r171|0)==0){r165=HEAP32[r30],r161=r165>>2;r164=HEAP32[r42];r166=r165+(r164*20&-1)|0;HEAP32[r166>>2]=0;HEAP32[((r164*20&-1)+4>>2)+r161]=0;HEAP32[((r164*20&-1)+8>>2)+r161]=0;HEAP32[((r164*20&-1)+12>>2)+r161]=r169;HEAP32[((r164*20&-1)+16>>2)+r161]=r150;HEAP32[r42]=HEAP32[r42]+1|0;if((HEAP32[r33]|0)==0){r182=r166;break}_add234_internal(r31,r166,-1);r182=r166}else{r182=r171}}while(0);HEAP32[HEAP32[HEAP32[r29]+((HEAP32[r35]-1)*24&-1)+8>>2]+44>>2]=r182;do{if(r156){if(!(((r148|0)<(r110|0)|r157)&((r148|0)>0|r149))){break}r171=HEAP32[r29],r166=r171>>2;r161=HEAP32[r35];HEAP32[((r161*24&-1)>>2)+r166]=3;r164=_malloc(12);if((r164|0)==0){r3=66;break L15}r165=r164;r164=(r171+(r161*24&-1)+8|0)>>2;HEAP32[r164]=r165;HEAP32[r165>>2]=0;HEAP32[HEAP32[r164]+4>>2]=0;HEAP32[HEAP32[r164]+8>>2]=0;HEAP32[((r161*24&-1)+4>>2)+r166]=0;HEAP32[((r161*24&-1)+12>>2)+r166]=0;HEAP32[r35]=HEAP32[r35]+1|0;HEAP32[r112>>2]=0;HEAP32[r113>>2]=0;HEAP32[r114>>2]=0;HEAP32[r115>>2]=r163;HEAP32[r116>>2]=r155;r166=_findrelpos234(r31,r111,0,0,0);do{if((r166|0)==0){r161=HEAP32[r30],r164=r161>>2;r165=HEAP32[r42];r171=r161+(r165*20&-1)|0;HEAP32[r171>>2]=0;HEAP32[((r165*20&-1)+4>>2)+r164]=0;HEAP32[((r165*20&-1)+8>>2)+r164]=0;HEAP32[((r165*20&-1)+12>>2)+r164]=r163;HEAP32[((r165*20&-1)+16>>2)+r164]=r155;HEAP32[r42]=HEAP32[r42]+1|0;if((HEAP32[r33]|0)==0){r183=r171;break}_add234_internal(r31,r171,-1);r183=r171}else{r183=r166}}while(0);HEAP32[HEAP32[HEAP32[r29]+((HEAP32[r35]-1)*24&-1)+8>>2]>>2]=r183;HEAP32[r118>>2]=0;HEAP32[r119>>2]=0;HEAP32[r120>>2]=0;HEAP32[r121>>2]=r162;HEAP32[r122>>2]=r158;r166=_findrelpos234(r31,r117,0,0,0);do{if((r166|0)==0){r171=HEAP32[r30],r164=r171>>2;r165=HEAP32[r42];r161=r171+(r165*20&-1)|0;HEAP32[r161>>2]=0;HEAP32[((r165*20&-1)+4>>2)+r164]=0;HEAP32[((r165*20&-1)+8>>2)+r164]=0;HEAP32[((r165*20&-1)+12>>2)+r164]=r162;HEAP32[((r165*20&-1)+16>>2)+r164]=r158;HEAP32[r42]=HEAP32[r42]+1|0;if((HEAP32[r33]|0)==0){r184=r161;break}_add234_internal(r31,r161,-1);r184=r161}else{r184=r166}}while(0);HEAP32[HEAP32[HEAP32[r29]+((HEAP32[r35]-1)*24&-1)+8>>2]+4>>2]=r184;HEAP32[r124>>2]=0;HEAP32[r125>>2]=0;HEAP32[r126>>2]=0;HEAP32[r127>>2]=r169;HEAP32[r128>>2]=r155;r166=_findrelpos234(r31,r123,0,0,0);do{if((r166|0)==0){r161=HEAP32[r30],r164=r161>>2;r165=HEAP32[r42];r171=r161+(r165*20&-1)|0;HEAP32[r171>>2]=0;HEAP32[((r165*20&-1)+4>>2)+r164]=0;HEAP32[((r165*20&-1)+8>>2)+r164]=0;HEAP32[((r165*20&-1)+12>>2)+r164]=r169;HEAP32[((r165*20&-1)+16>>2)+r164]=r155;HEAP32[r42]=HEAP32[r42]+1|0;if((HEAP32[r33]|0)==0){r185=r171;break}_add234_internal(r31,r171,-1);r185=r171}else{r185=r166}}while(0);HEAP32[HEAP32[HEAP32[r29]+((HEAP32[r35]-1)*24&-1)+8>>2]+8>>2]=r185}}while(0);do{if(!r159){if(!(((r148|0)<(r110|0)|r157)&((r148|0)>0|r149))){break}r166=HEAP32[r29],r171=r166>>2;r164=HEAP32[r35];HEAP32[((r164*24&-1)>>2)+r171]=3;r165=_malloc(12);if((r165|0)==0){r3=83;break L15}r161=r165;r165=(r166+(r164*24&-1)+8|0)>>2;HEAP32[r165]=r161;HEAP32[r161>>2]=0;HEAP32[HEAP32[r165]+4>>2]=0;HEAP32[HEAP32[r165]+8>>2]=0;HEAP32[((r164*24&-1)+4>>2)+r171]=0;HEAP32[((r164*24&-1)+12>>2)+r171]=0;HEAP32[r35]=HEAP32[r35]+1|0;HEAP32[r130>>2]=0;HEAP32[r131>>2]=0;HEAP32[r132>>2]=0;HEAP32[r133>>2]=r169;HEAP32[r134>>2]=r150;r171=_findrelpos234(r31,r129,0,0,0);do{if((r171|0)==0){r164=HEAP32[r30],r165=r164>>2;r161=HEAP32[r42];r166=r164+(r161*20&-1)|0;HEAP32[r166>>2]=0;HEAP32[((r161*20&-1)+4>>2)+r165]=0;HEAP32[((r161*20&-1)+8>>2)+r165]=0;HEAP32[((r161*20&-1)+12>>2)+r165]=r169;HEAP32[((r161*20&-1)+16>>2)+r165]=r150;HEAP32[r42]=HEAP32[r42]+1|0;if((HEAP32[r33]|0)==0){r186=r166;break}_add234_internal(r31,r166,-1);r186=r166}else{r186=r171}}while(0);HEAP32[HEAP32[HEAP32[r29]+((HEAP32[r35]-1)*24&-1)+8>>2]>>2]=r186;HEAP32[r136>>2]=0;HEAP32[r137>>2]=0;HEAP32[r138>>2]=0;HEAP32[r139>>2]=r162;HEAP32[r140>>2]=r160;r171=_findrelpos234(r31,r135,0,0,0);do{if((r171|0)==0){r166=HEAP32[r30],r165=r166>>2;r161=HEAP32[r42];r164=r166+(r161*20&-1)|0;HEAP32[r164>>2]=0;HEAP32[((r161*20&-1)+4>>2)+r165]=0;HEAP32[((r161*20&-1)+8>>2)+r165]=0;HEAP32[((r161*20&-1)+12>>2)+r165]=r162;HEAP32[((r161*20&-1)+16>>2)+r165]=r160;HEAP32[r42]=HEAP32[r42]+1|0;if((HEAP32[r33]|0)==0){r187=r164;break}_add234_internal(r31,r164,-1);r187=r164}else{r187=r171}}while(0);HEAP32[HEAP32[HEAP32[r29]+((HEAP32[r35]-1)*24&-1)+8>>2]+4>>2]=r187;HEAP32[r142>>2]=0;HEAP32[r143>>2]=0;HEAP32[r144>>2]=0;HEAP32[r145>>2]=r163;HEAP32[r146>>2]=r150;r171=_findrelpos234(r31,r141,0,0,0);do{if((r171|0)==0){r164=HEAP32[r30],r165=r164>>2;r161=HEAP32[r42];r166=r164+(r161*20&-1)|0;HEAP32[r166>>2]=0;HEAP32[((r161*20&-1)+4>>2)+r165]=0;HEAP32[((r161*20&-1)+8>>2)+r165]=0;HEAP32[((r161*20&-1)+12>>2)+r165]=r163;HEAP32[((r161*20&-1)+16>>2)+r165]=r150;HEAP32[r42]=HEAP32[r42]+1|0;if((HEAP32[r33]|0)==0){r188=r166;break}_add234_internal(r31,r166,-1);r188=r166}else{r188=r171}}while(0);HEAP32[HEAP32[HEAP32[r29]+((HEAP32[r35]-1)*24&-1)+8>>2]+8>>2]=r188}}while(0);r163=r148+1|0;if((r163|0)<(r1|0)){r148=r163}else{break L17}}}}while(0);r148=r147+1|0;if((r148|0)<(r2|0)){r147=r148}else{r3=99;break}}if(r3==14){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==66){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==83){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==99){r189=HEAP32[r32>>2];break}}else{r189=0}}while(0);_freenode234(r189);_free(r28);if((HEAP32[r26]|0)>(r23|0)){___assert_func(69436,2351,70524,67036)}if((HEAP32[r26+4]|0)<=(r24|0)){_grid_make_consistent(r27);STACKTOP=r4;return r27}___assert_func(69436,2352,70524,66776);_grid_make_consistent(r27);STACKTOP=r4;return r27}function _grid_new_greatdodecagonal(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187,r188,r189,r190,r191,r192,r193,r194,r195,r196,r197,r198,r199,r200,r201,r202,r203,r204,r205,r206,r207,r208,r209,r210,r211,r212,r213,r214,r215,r216,r217,r218,r219,r220,r221,r222,r223,r224,r225,r226,r227,r228,r229,r230,r231,r232,r233,r234,r235,r236,r237,r238,r239,r240,r241,r242,r243,r244,r245,r246,r247,r248,r249,r250,r251,r252,r253,r254,r255,r256,r257,r258,r259,r260,r261,r262,r263,r264,r265,r266,r267,r268,r269,r270,r271,r272,r273,r274,r275,r276,r277,r278,r279,r280,r281,r282,r283,r284,r285,r286,r287,r288,r289,r290,r291,r292,r293,r294,r295,r296,r297,r298,r299,r300,r301,r302,r303,r304,r305,r306,r307,r308,r309,r310,r311,r312,r313,r314,r315,r316,r317,r318,r319,r320,r321,r322,r323,r324,r325,r326,r327,r328,r329,r330,r331,r332,r333,r334,r335,r336,r337,r338,r339,r340,r341;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+720|0;r5=r4;r6=r4+20;r7=r4+40;r8=r4+60;r9=r4+80;r10=r4+100;r11=r4+120;r12=r4+140;r13=r4+160;r14=r4+180;r15=r4+200;r16=r4+220;r17=r4+240;r18=r4+260;r19=r4+280;r20=r4+300;r21=r4+320;r22=r4+340;r23=r4+360;r24=r4+380;r25=r4+400;r26=r4+420;r27=r4+440;r28=r4+460;r29=r4+480;r30=r4+500;r31=r4+520;r32=r4+540;r33=r4+560;r34=r4+580;r35=r4+600;r36=r4+620;r37=r4+640;r38=r4+660;r39=r4+680;r40=r4+700;r41=Math.imul(r1*30&-1,r2);r42=Math.imul(r1*200&-1,r2);r43=_malloc(48),r44=r43>>2;if((r43|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r45=r43;HEAP32[r44]=0;HEAP32[r44+1]=0;HEAP32[r44+2]=0;HEAP32[r44+3]=0;HEAP32[r44+4]=0;HEAP32[r44+5]=0;HEAP32[r44+11]=1;r46=(r43+24|0)>>2;HEAP32[r46]=0;HEAP32[r46+1]=0;HEAP32[r46+2]=0;HEAP32[r46+3]=0;HEAP32[r44+10]=26;r46=_malloc(r41*24&-1);if((r46|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r47=(r43+4|0)>>2;HEAP32[r47]=r46;r46=_malloc(r42*20&-1);if((r46|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r48=(r43+20|0)>>2;HEAP32[r48]=r46;r46=_malloc(8);if((r46|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r49=r46;r50=r46;HEAP32[r50>>2]=0;r51=(r46+4|0)>>2;HEAP32[r51]=42;do{if((r2|0)>0){r52=(r1|0)>0;r53=r43>>2;r54=r40;r55=r40|0;r56=r40+4|0;r57=r40+8|0;r58=r40+12|0;r59=r40+16|0;r60=(r43+16|0)>>2;r61=r39;r62=r39|0;r63=r39+4|0;r64=r39+8|0;r65=r39+12|0;r66=r39+16|0;r67=r38;r68=r38|0;r69=r38+4|0;r70=r38+8|0;r71=r38+12|0;r72=r38+16|0;r73=r37;r74=r37|0;r75=r37+4|0;r76=r37+8|0;r77=r37+12|0;r78=r37+16|0;r79=r36;r80=r36|0;r81=r36+4|0;r82=r36+8|0;r83=r36+12|0;r84=r36+16|0;r85=r35;r86=r35|0;r87=r35+4|0;r88=r35+8|0;r89=r35+12|0;r90=r35+16|0;r91=r34;r92=r34|0;r93=r34+4|0;r94=r34+8|0;r95=r34+12|0;r96=r34+16|0;r97=r33;r98=r33|0;r99=r33+4|0;r100=r33+8|0;r101=r33+12|0;r102=r33+16|0;r103=r32;r104=r32|0;r105=r32+4|0;r106=r32+8|0;r107=r32+12|0;r108=r32+16|0;r109=r31;r110=r31|0;r111=r31+4|0;r112=r31+8|0;r113=r31+12|0;r114=r31+16|0;r115=r30;r116=r30|0;r117=r30+4|0;r118=r30+8|0;r119=r30+12|0;r120=r30+16|0;r121=r29;r122=r29|0;r123=r29+4|0;r124=r29+8|0;r125=r29+12|0;r126=r29+16|0;r127=r2-1|0;r128=r1-1|0;r129=r28;r130=r28|0;r131=r28+4|0;r132=r28+8|0;r133=r28+12|0;r134=r28+16|0;r135=r27;r136=r27|0;r137=r27+4|0;r138=r27+8|0;r139=r27+12|0;r140=r27+16|0;r141=r26;r142=r26|0;r143=r26+4|0;r144=r26+8|0;r145=r26+12|0;r146=r26+16|0;r147=r25;r148=r25|0;r149=r25+4|0;r150=r25+8|0;r151=r25+12|0;r152=r25+16|0;r153=r24;r154=r24|0;r155=r24+4|0;r156=r24+8|0;r157=r24+12|0;r158=r24+16|0;r159=r23;r160=r23|0;r161=r23+4|0;r162=r23+8|0;r163=r23+12|0;r164=r23+16|0;r165=r22;r166=r22|0;r167=r22+4|0;r168=r22+8|0;r169=r22+12|0;r170=r22+16|0;r171=r21;r172=r21|0;r173=r21+4|0;r174=r21+8|0;r175=r21+12|0;r176=r21+16|0;r177=r20;r178=r20|0;r179=r20+4|0;r180=r20+8|0;r181=r20+12|0;r182=r20+16|0;r183=r19;r184=r19|0;r185=r19+4|0;r186=r19+8|0;r187=r19+12|0;r188=r19+16|0;r189=r18;r190=r18|0;r191=r18+4|0;r192=r18+8|0;r193=r18+12|0;r194=r18+16|0;r195=r17;r196=r17|0;r197=r17+4|0;r198=r17+8|0;r199=r17+12|0;r200=r17+16|0;r201=r16;r202=r16|0;r203=r16+4|0;r204=r16+8|0;r205=r16+12|0;r206=r16+16|0;r207=r15;r208=r15|0;r209=r15+4|0;r210=r15+8|0;r211=r15+12|0;r212=r15+16|0;r213=r14;r214=r14|0;r215=r14+4|0;r216=r14+8|0;r217=r14+12|0;r218=r14+16|0;r219=r13;r220=r13|0;r221=r13+4|0;r222=r13+8|0;r223=r13+12|0;r224=r13+16|0;r225=r12;r226=r12|0;r227=r12+4|0;r228=r12+8|0;r229=r12+12|0;r230=r12+16|0;r231=r11;r232=r11|0;r233=r11+4|0;r234=r11+8|0;r235=r11+12|0;r236=r11+16|0;r237=r10;r238=r10|0;r239=r10+4|0;r240=r10+8|0;r241=r10+12|0;r242=r10+16|0;r243=r9;r244=r9|0;r245=r9+4|0;r246=r9+8|0;r247=r9+12|0;r248=r9+16|0;r249=r8;r250=r8|0;r251=r8+4|0;r252=r8+8|0;r253=r8+12|0;r254=r8+16|0;r255=r7;r256=r7|0;r257=r7+4|0;r258=r7+8|0;r259=r7+12|0;r260=r7+16|0;r261=r6;r262=r6|0;r263=r6+4|0;r264=r6+8|0;r265=r6+12|0;r266=r6+16|0;r267=r5;r268=r5|0;r269=r5+4|0;r270=r5+8|0;r271=r5+12|0;r272=r5+16|0;r273=0;L151:while(1){L153:do{if(r52){r274=r273*123&-1;r275=r273&1;r276=(r275|0)!=0;r277=r274-56|0;r278=r274-41|0;r279=r274-15|0;r280=r274+15|0;r281=r274+41|0;r282=r274+56|0;r283=(r273|0)<(r127|0);r284=r276^1;r285=r274+82|0;r286=r274+108|0;r287=(r273|0)!=0;r288=r274-82|0;r289=r274-108|0;r290=r274-67|0;r274=0;while(1){r291=r274*142&-1;r292=r276?r291+71|0:r291;r291=HEAP32[r47],r293=r291>>2;r294=HEAP32[r53];HEAP32[((r294*24&-1)>>2)+r293]=12;r295=_malloc(48);if((r295|0)==0){r3=120;break L151}r296=r295;r295=(r291+(r294*24&-1)+8|0)>>2;HEAP32[r295]=r296;HEAP32[r296>>2]=0;HEAP32[HEAP32[r295]+4>>2]=0;HEAP32[HEAP32[r295]+8>>2]=0;HEAP32[HEAP32[r295]+12>>2]=0;HEAP32[HEAP32[r295]+16>>2]=0;HEAP32[HEAP32[r295]+20>>2]=0;HEAP32[HEAP32[r295]+24>>2]=0;HEAP32[HEAP32[r295]+28>>2]=0;HEAP32[HEAP32[r295]+32>>2]=0;HEAP32[HEAP32[r295]+36>>2]=0;HEAP32[HEAP32[r295]+40>>2]=0;HEAP32[HEAP32[r295]+44>>2]=0;HEAP32[((r294*24&-1)+4>>2)+r293]=0;HEAP32[((r294*24&-1)+12>>2)+r293]=0;HEAP32[r53]=HEAP32[r53]+1|0;r293=r292+15|0;HEAP32[r55>>2]=0;HEAP32[r56>>2]=0;HEAP32[r57>>2]=0;HEAP32[r58>>2]=r293;HEAP32[r59>>2]=r277;r294=_findrelpos234(r49,r54,0,0,0);do{if((r294|0)==0){r295=HEAP32[r48],r296=r295>>2;r291=HEAP32[r60];r297=r295+(r291*20&-1)|0;HEAP32[r297>>2]=0;HEAP32[((r291*20&-1)+4>>2)+r296]=0;HEAP32[((r291*20&-1)+8>>2)+r296]=0;HEAP32[((r291*20&-1)+12>>2)+r296]=r293;HEAP32[((r291*20&-1)+16>>2)+r296]=r277;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r298=r297;break}_add234_internal(r49,r297,-1);r298=r297}else{r298=r294}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]>>2]=r298;r294=r292+41|0;HEAP32[r62>>2]=0;HEAP32[r63>>2]=0;HEAP32[r64>>2]=0;HEAP32[r65>>2]=r294;HEAP32[r66>>2]=r278;r297=_findrelpos234(r49,r61,0,0,0);do{if((r297|0)==0){r296=HEAP32[r48],r291=r296>>2;r295=HEAP32[r60];r299=r296+(r295*20&-1)|0;HEAP32[r299>>2]=0;HEAP32[((r295*20&-1)+4>>2)+r291]=0;HEAP32[((r295*20&-1)+8>>2)+r291]=0;HEAP32[((r295*20&-1)+12>>2)+r291]=r294;HEAP32[((r295*20&-1)+16>>2)+r291]=r278;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r300=r299;break}_add234_internal(r49,r299,-1);r300=r299}else{r300=r297}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+4>>2]=r300;r297=r292+56|0;HEAP32[r68>>2]=0;HEAP32[r69>>2]=0;HEAP32[r70>>2]=0;HEAP32[r71>>2]=r297;HEAP32[r72>>2]=r279;r299=_findrelpos234(r49,r67,0,0,0);do{if((r299|0)==0){r291=HEAP32[r48],r295=r291>>2;r296=HEAP32[r60];r301=r291+(r296*20&-1)|0;HEAP32[r301>>2]=0;HEAP32[((r296*20&-1)+4>>2)+r295]=0;HEAP32[((r296*20&-1)+8>>2)+r295]=0;HEAP32[((r296*20&-1)+12>>2)+r295]=r297;HEAP32[((r296*20&-1)+16>>2)+r295]=r279;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r302=r301;break}_add234_internal(r49,r301,-1);r302=r301}else{r302=r299}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+8>>2]=r302;HEAP32[r74>>2]=0;HEAP32[r75>>2]=0;HEAP32[r76>>2]=0;HEAP32[r77>>2]=r297;HEAP32[r78>>2]=r280;r299=_findrelpos234(r49,r73,0,0,0);do{if((r299|0)==0){r301=HEAP32[r48],r295=r301>>2;r296=HEAP32[r60];r291=r301+(r296*20&-1)|0;HEAP32[r291>>2]=0;HEAP32[((r296*20&-1)+4>>2)+r295]=0;HEAP32[((r296*20&-1)+8>>2)+r295]=0;HEAP32[((r296*20&-1)+12>>2)+r295]=r297;HEAP32[((r296*20&-1)+16>>2)+r295]=r280;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r303=r291;break}_add234_internal(r49,r291,-1);r303=r291}else{r303=r299}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+12>>2]=r303;HEAP32[r80>>2]=0;HEAP32[r81>>2]=0;HEAP32[r82>>2]=0;HEAP32[r83>>2]=r294;HEAP32[r84>>2]=r281;r299=_findrelpos234(r49,r79,0,0,0);do{if((r299|0)==0){r291=HEAP32[r48],r295=r291>>2;r296=HEAP32[r60];r301=r291+(r296*20&-1)|0;HEAP32[r301>>2]=0;HEAP32[((r296*20&-1)+4>>2)+r295]=0;HEAP32[((r296*20&-1)+8>>2)+r295]=0;HEAP32[((r296*20&-1)+12>>2)+r295]=r294;HEAP32[((r296*20&-1)+16>>2)+r295]=r281;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r304=r301;break}_add234_internal(r49,r301,-1);r304=r301}else{r304=r299}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+16>>2]=r304;HEAP32[r86>>2]=0;HEAP32[r87>>2]=0;HEAP32[r88>>2]=0;HEAP32[r89>>2]=r293;HEAP32[r90>>2]=r282;r299=_findrelpos234(r49,r85,0,0,0);do{if((r299|0)==0){r301=HEAP32[r48],r295=r301>>2;r296=HEAP32[r60];r291=r301+(r296*20&-1)|0;HEAP32[r291>>2]=0;HEAP32[((r296*20&-1)+4>>2)+r295]=0;HEAP32[((r296*20&-1)+8>>2)+r295]=0;HEAP32[((r296*20&-1)+12>>2)+r295]=r293;HEAP32[((r296*20&-1)+16>>2)+r295]=r282;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r305=r291;break}_add234_internal(r49,r291,-1);r305=r291}else{r305=r299}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+20>>2]=r305;r299=r292-15|0;HEAP32[r92>>2]=0;HEAP32[r93>>2]=0;HEAP32[r94>>2]=0;HEAP32[r95>>2]=r299;HEAP32[r96>>2]=r282;r291=_findrelpos234(r49,r91,0,0,0);do{if((r291|0)==0){r295=HEAP32[r48],r296=r295>>2;r301=HEAP32[r60];r306=r295+(r301*20&-1)|0;HEAP32[r306>>2]=0;HEAP32[((r301*20&-1)+4>>2)+r296]=0;HEAP32[((r301*20&-1)+8>>2)+r296]=0;HEAP32[((r301*20&-1)+12>>2)+r296]=r299;HEAP32[((r301*20&-1)+16>>2)+r296]=r282;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r307=r306;break}_add234_internal(r49,r306,-1);r307=r306}else{r307=r291}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+24>>2]=r307;r291=r292-41|0;HEAP32[r98>>2]=0;HEAP32[r99>>2]=0;HEAP32[r100>>2]=0;HEAP32[r101>>2]=r291;HEAP32[r102>>2]=r281;r306=_findrelpos234(r49,r97,0,0,0);do{if((r306|0)==0){r296=HEAP32[r48],r301=r296>>2;r295=HEAP32[r60];r308=r296+(r295*20&-1)|0;HEAP32[r308>>2]=0;HEAP32[((r295*20&-1)+4>>2)+r301]=0;HEAP32[((r295*20&-1)+8>>2)+r301]=0;HEAP32[((r295*20&-1)+12>>2)+r301]=r291;HEAP32[((r295*20&-1)+16>>2)+r301]=r281;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r309=r308;break}_add234_internal(r49,r308,-1);r309=r308}else{r309=r306}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+28>>2]=r309;r306=r292-56|0;HEAP32[r104>>2]=0;HEAP32[r105>>2]=0;HEAP32[r106>>2]=0;HEAP32[r107>>2]=r306;HEAP32[r108>>2]=r280;r308=_findrelpos234(r49,r103,0,0,0);do{if((r308|0)==0){r301=HEAP32[r48],r295=r301>>2;r296=HEAP32[r60];r310=r301+(r296*20&-1)|0;HEAP32[r310>>2]=0;HEAP32[((r296*20&-1)+4>>2)+r295]=0;HEAP32[((r296*20&-1)+8>>2)+r295]=0;HEAP32[((r296*20&-1)+12>>2)+r295]=r306;HEAP32[((r296*20&-1)+16>>2)+r295]=r280;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r311=r310;break}_add234_internal(r49,r310,-1);r311=r310}else{r311=r308}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+32>>2]=r311;HEAP32[r110>>2]=0;HEAP32[r111>>2]=0;HEAP32[r112>>2]=0;HEAP32[r113>>2]=r306;HEAP32[r114>>2]=r279;r308=_findrelpos234(r49,r109,0,0,0);do{if((r308|0)==0){r310=HEAP32[r48],r295=r310>>2;r296=HEAP32[r60];r301=r310+(r296*20&-1)|0;HEAP32[r301>>2]=0;HEAP32[((r296*20&-1)+4>>2)+r295]=0;HEAP32[((r296*20&-1)+8>>2)+r295]=0;HEAP32[((r296*20&-1)+12>>2)+r295]=r306;HEAP32[((r296*20&-1)+16>>2)+r295]=r279;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r312=r301;break}_add234_internal(r49,r301,-1);r312=r301}else{r312=r308}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+36>>2]=r312;HEAP32[r116>>2]=0;HEAP32[r117>>2]=0;HEAP32[r118>>2]=0;HEAP32[r119>>2]=r291;HEAP32[r120>>2]=r278;r308=_findrelpos234(r49,r115,0,0,0);do{if((r308|0)==0){r301=HEAP32[r48],r295=r301>>2;r296=HEAP32[r60];r310=r301+(r296*20&-1)|0;HEAP32[r310>>2]=0;HEAP32[((r296*20&-1)+4>>2)+r295]=0;HEAP32[((r296*20&-1)+8>>2)+r295]=0;HEAP32[((r296*20&-1)+12>>2)+r295]=r291;HEAP32[((r296*20&-1)+16>>2)+r295]=r278;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r313=r310;break}_add234_internal(r49,r310,-1);r313=r310}else{r313=r308}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+40>>2]=r313;HEAP32[r122>>2]=0;HEAP32[r123>>2]=0;HEAP32[r124>>2]=0;HEAP32[r125>>2]=r299;HEAP32[r126>>2]=r277;r308=_findrelpos234(r49,r121,0,0,0);do{if((r308|0)==0){r310=HEAP32[r48],r295=r310>>2;r296=HEAP32[r60];r301=r310+(r296*20&-1)|0;HEAP32[r301>>2]=0;HEAP32[((r296*20&-1)+4>>2)+r295]=0;HEAP32[((r296*20&-1)+8>>2)+r295]=0;HEAP32[((r296*20&-1)+12>>2)+r295]=r299;HEAP32[((r296*20&-1)+16>>2)+r295]=r277;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r314=r301;break}_add234_internal(r49,r301,-1);r314=r301}else{r314=r308}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+44>>2]=r314;do{if(r283){if(!(((r274|0)<(r128|0)|r284)&((r274|0)>0|r276))){break}r308=HEAP32[r47],r301=r308>>2;r295=HEAP32[r53];HEAP32[((r295*24&-1)>>2)+r301]=6;r296=_malloc(24);if((r296|0)==0){r3=172;break L151}r310=r296;r296=(r308+(r295*24&-1)+8|0)>>2;HEAP32[r296]=r310;HEAP32[r310>>2]=0;HEAP32[HEAP32[r296]+4>>2]=0;HEAP32[HEAP32[r296]+8>>2]=0;HEAP32[HEAP32[r296]+12>>2]=0;HEAP32[HEAP32[r296]+16>>2]=0;HEAP32[HEAP32[r296]+20>>2]=0;HEAP32[((r295*24&-1)+4>>2)+r301]=0;HEAP32[((r295*24&-1)+12>>2)+r301]=0;HEAP32[r53]=HEAP32[r53]+1|0;HEAP32[r130>>2]=0;HEAP32[r131>>2]=0;HEAP32[r132>>2]=0;HEAP32[r133>>2]=r293;HEAP32[r134>>2]=r282;r301=_findrelpos234(r49,r129,0,0,0);do{if((r301|0)==0){r295=HEAP32[r48],r296=r295>>2;r310=HEAP32[r60];r308=r295+(r310*20&-1)|0;HEAP32[r308>>2]=0;HEAP32[((r310*20&-1)+4>>2)+r296]=0;HEAP32[((r310*20&-1)+8>>2)+r296]=0;HEAP32[((r310*20&-1)+12>>2)+r296]=r293;HEAP32[((r310*20&-1)+16>>2)+r296]=r282;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r315=r308;break}_add234_internal(r49,r308,-1);r315=r308}else{r315=r301}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]>>2]=r315;r301=r292+30|0;HEAP32[r136>>2]=0;HEAP32[r137>>2]=0;HEAP32[r138>>2]=0;HEAP32[r139>>2]=r301;HEAP32[r140>>2]=r285;r308=_findrelpos234(r49,r135,0,0,0);do{if((r308|0)==0){r296=HEAP32[r48],r310=r296>>2;r295=HEAP32[r60];r316=r296+(r295*20&-1)|0;HEAP32[r316>>2]=0;HEAP32[((r295*20&-1)+4>>2)+r310]=0;HEAP32[((r295*20&-1)+8>>2)+r310]=0;HEAP32[((r295*20&-1)+12>>2)+r310]=r301;HEAP32[((r295*20&-1)+16>>2)+r310]=r285;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r317=r316;break}_add234_internal(r49,r316,-1);r317=r316}else{r317=r308}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+4>>2]=r317;HEAP32[r142>>2]=0;HEAP32[r143>>2]=0;HEAP32[r144>>2]=0;HEAP32[r145>>2]=r293;HEAP32[r146>>2]=r286;r308=_findrelpos234(r49,r141,0,0,0);do{if((r308|0)==0){r301=HEAP32[r48],r316=r301>>2;r310=HEAP32[r60];r295=r301+(r310*20&-1)|0;HEAP32[r295>>2]=0;HEAP32[((r310*20&-1)+4>>2)+r316]=0;HEAP32[((r310*20&-1)+8>>2)+r316]=0;HEAP32[((r310*20&-1)+12>>2)+r316]=r293;HEAP32[((r310*20&-1)+16>>2)+r316]=r286;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r318=r295;break}_add234_internal(r49,r295,-1);r318=r295}else{r318=r308}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+8>>2]=r318;HEAP32[r148>>2]=0;HEAP32[r149>>2]=0;HEAP32[r150>>2]=0;HEAP32[r151>>2]=r299;HEAP32[r152>>2]=r286;r308=_findrelpos234(r49,r147,0,0,0);do{if((r308|0)==0){r295=HEAP32[r48],r316=r295>>2;r310=HEAP32[r60];r301=r295+(r310*20&-1)|0;HEAP32[r301>>2]=0;HEAP32[((r310*20&-1)+4>>2)+r316]=0;HEAP32[((r310*20&-1)+8>>2)+r316]=0;HEAP32[((r310*20&-1)+12>>2)+r316]=r299;HEAP32[((r310*20&-1)+16>>2)+r316]=r286;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r319=r301;break}_add234_internal(r49,r301,-1);r319=r301}else{r319=r308}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+12>>2]=r319;r308=r292-30|0;HEAP32[r154>>2]=0;HEAP32[r155>>2]=0;HEAP32[r156>>2]=0;HEAP32[r157>>2]=r308;HEAP32[r158>>2]=r285;r301=_findrelpos234(r49,r153,0,0,0);do{if((r301|0)==0){r316=HEAP32[r48],r310=r316>>2;r295=HEAP32[r60];r296=r316+(r295*20&-1)|0;HEAP32[r296>>2]=0;HEAP32[((r295*20&-1)+4>>2)+r310]=0;HEAP32[((r295*20&-1)+8>>2)+r310]=0;HEAP32[((r295*20&-1)+12>>2)+r310]=r308;HEAP32[((r295*20&-1)+16>>2)+r310]=r285;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r320=r296;break}_add234_internal(r49,r296,-1);r320=r296}else{r320=r301}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+16>>2]=r320;HEAP32[r160>>2]=0;HEAP32[r161>>2]=0;HEAP32[r162>>2]=0;HEAP32[r163>>2]=r299;HEAP32[r164>>2]=r282;r301=_findrelpos234(r49,r159,0,0,0);do{if((r301|0)==0){r308=HEAP32[r48],r296=r308>>2;r310=HEAP32[r60];r295=r308+(r310*20&-1)|0;HEAP32[r295>>2]=0;HEAP32[((r310*20&-1)+4>>2)+r296]=0;HEAP32[((r310*20&-1)+8>>2)+r296]=0;HEAP32[((r310*20&-1)+12>>2)+r296]=r299;HEAP32[((r310*20&-1)+16>>2)+r296]=r282;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r321=r295;break}_add234_internal(r49,r295,-1);r321=r295}else{r321=r301}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+20>>2]=r321}}while(0);do{if(r287){if(!(((r274|0)<(r128|0)|r284)&((r274|0)>0|r276))){break}r301=HEAP32[r47],r295=r301>>2;r296=HEAP32[r53];HEAP32[((r296*24&-1)>>2)+r295]=6;r310=_malloc(24);if((r310|0)==0){r3=201;break L151}r308=r310;r310=(r301+(r296*24&-1)+8|0)>>2;HEAP32[r310]=r308;HEAP32[r308>>2]=0;HEAP32[HEAP32[r310]+4>>2]=0;HEAP32[HEAP32[r310]+8>>2]=0;HEAP32[HEAP32[r310]+12>>2]=0;HEAP32[HEAP32[r310]+16>>2]=0;HEAP32[HEAP32[r310]+20>>2]=0;HEAP32[((r296*24&-1)+4>>2)+r295]=0;HEAP32[((r296*24&-1)+12>>2)+r295]=0;HEAP32[r53]=HEAP32[r53]+1|0;HEAP32[r166>>2]=0;HEAP32[r167>>2]=0;HEAP32[r168>>2]=0;HEAP32[r169>>2]=r299;HEAP32[r170>>2]=r277;r295=_findrelpos234(r49,r165,0,0,0);do{if((r295|0)==0){r296=HEAP32[r48],r310=r296>>2;r308=HEAP32[r60];r301=r296+(r308*20&-1)|0;HEAP32[r301>>2]=0;HEAP32[((r308*20&-1)+4>>2)+r310]=0;HEAP32[((r308*20&-1)+8>>2)+r310]=0;HEAP32[((r308*20&-1)+12>>2)+r310]=r299;HEAP32[((r308*20&-1)+16>>2)+r310]=r277;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r322=r301;break}_add234_internal(r49,r301,-1);r322=r301}else{r322=r295}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]>>2]=r322;r295=r292-30|0;HEAP32[r172>>2]=0;HEAP32[r173>>2]=0;HEAP32[r174>>2]=0;HEAP32[r175>>2]=r295;HEAP32[r176>>2]=r288;r301=_findrelpos234(r49,r171,0,0,0);do{if((r301|0)==0){r310=HEAP32[r48],r308=r310>>2;r296=HEAP32[r60];r316=r310+(r296*20&-1)|0;HEAP32[r316>>2]=0;HEAP32[((r296*20&-1)+4>>2)+r308]=0;HEAP32[((r296*20&-1)+8>>2)+r308]=0;HEAP32[((r296*20&-1)+12>>2)+r308]=r295;HEAP32[((r296*20&-1)+16>>2)+r308]=r288;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r323=r316;break}_add234_internal(r49,r316,-1);r323=r316}else{r323=r301}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+4>>2]=r323;HEAP32[r178>>2]=0;HEAP32[r179>>2]=0;HEAP32[r180>>2]=0;HEAP32[r181>>2]=r299;HEAP32[r182>>2]=r289;r301=_findrelpos234(r49,r177,0,0,0);do{if((r301|0)==0){r295=HEAP32[r48],r316=r295>>2;r308=HEAP32[r60];r296=r295+(r308*20&-1)|0;HEAP32[r296>>2]=0;HEAP32[((r308*20&-1)+4>>2)+r316]=0;HEAP32[((r308*20&-1)+8>>2)+r316]=0;HEAP32[((r308*20&-1)+12>>2)+r316]=r299;HEAP32[((r308*20&-1)+16>>2)+r316]=r289;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r324=r296;break}_add234_internal(r49,r296,-1);r324=r296}else{r324=r301}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+8>>2]=r324;HEAP32[r184>>2]=0;HEAP32[r185>>2]=0;HEAP32[r186>>2]=0;HEAP32[r187>>2]=r293;HEAP32[r188>>2]=r289;r301=_findrelpos234(r49,r183,0,0,0);do{if((r301|0)==0){r296=HEAP32[r48],r316=r296>>2;r308=HEAP32[r60];r295=r296+(r308*20&-1)|0;HEAP32[r295>>2]=0;HEAP32[((r308*20&-1)+4>>2)+r316]=0;HEAP32[((r308*20&-1)+8>>2)+r316]=0;HEAP32[((r308*20&-1)+12>>2)+r316]=r293;HEAP32[((r308*20&-1)+16>>2)+r316]=r289;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r325=r295;break}_add234_internal(r49,r295,-1);r325=r295}else{r325=r301}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+12>>2]=r325;r301=r292+30|0;HEAP32[r190>>2]=0;HEAP32[r191>>2]=0;HEAP32[r192>>2]=0;HEAP32[r193>>2]=r301;HEAP32[r194>>2]=r288;r295=_findrelpos234(r49,r189,0,0,0);do{if((r295|0)==0){r316=HEAP32[r48],r308=r316>>2;r296=HEAP32[r60];r310=r316+(r296*20&-1)|0;HEAP32[r310>>2]=0;HEAP32[((r296*20&-1)+4>>2)+r308]=0;HEAP32[((r296*20&-1)+8>>2)+r308]=0;HEAP32[((r296*20&-1)+12>>2)+r308]=r301;HEAP32[((r296*20&-1)+16>>2)+r308]=r288;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r326=r310;break}_add234_internal(r49,r310,-1);r326=r310}else{r326=r295}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+16>>2]=r326;HEAP32[r196>>2]=0;HEAP32[r197>>2]=0;HEAP32[r198>>2]=0;HEAP32[r199>>2]=r293;HEAP32[r200>>2]=r277;r295=_findrelpos234(r49,r195,0,0,0);do{if((r295|0)==0){r301=HEAP32[r48],r310=r301>>2;r308=HEAP32[r60];r296=r301+(r308*20&-1)|0;HEAP32[r296>>2]=0;HEAP32[((r308*20&-1)+4>>2)+r310]=0;HEAP32[((r308*20&-1)+8>>2)+r310]=0;HEAP32[((r308*20&-1)+12>>2)+r310]=r293;HEAP32[((r308*20&-1)+16>>2)+r310]=r277;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r327=r296;break}_add234_internal(r49,r296,-1);r327=r296}else{r327=r295}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+20>>2]=r327}}while(0);r295=(r274|0)<(r128|0);if(r295){r296=HEAP32[r47],r310=r296>>2;r308=HEAP32[r53];HEAP32[((r308*24&-1)>>2)+r310]=4;r301=_malloc(16);if((r301|0)==0){r3=229;break L151}r316=r301;r301=(r296+(r308*24&-1)+8|0)>>2;HEAP32[r301]=r316;HEAP32[r316>>2]=0;HEAP32[HEAP32[r301]+4>>2]=0;HEAP32[HEAP32[r301]+8>>2]=0;HEAP32[HEAP32[r301]+12>>2]=0;HEAP32[((r308*24&-1)+4>>2)+r310]=0;HEAP32[((r308*24&-1)+12>>2)+r310]=0;HEAP32[r53]=HEAP32[r53]+1|0;HEAP32[r202>>2]=0;HEAP32[r203>>2]=0;HEAP32[r204>>2]=0;HEAP32[r205>>2]=r297;HEAP32[r206>>2]=r279;r310=_findrelpos234(r49,r201,0,0,0);do{if((r310|0)==0){r308=HEAP32[r48],r301=r308>>2;r316=HEAP32[r60];r296=r308+(r316*20&-1)|0;HEAP32[r296>>2]=0;HEAP32[((r316*20&-1)+4>>2)+r301]=0;HEAP32[((r316*20&-1)+8>>2)+r301]=0;HEAP32[((r316*20&-1)+12>>2)+r301]=r297;HEAP32[((r316*20&-1)+16>>2)+r301]=r279;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r328=r296;break}_add234_internal(r49,r296,-1);r328=r296}else{r328=r310}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]>>2]=r328;r310=r292+86|0;HEAP32[r208>>2]=0;HEAP32[r209>>2]=0;HEAP32[r210>>2]=0;HEAP32[r211>>2]=r310;HEAP32[r212>>2]=r279;r296=_findrelpos234(r49,r207,0,0,0);do{if((r296|0)==0){r301=HEAP32[r48],r316=r301>>2;r308=HEAP32[r60];r329=r301+(r308*20&-1)|0;HEAP32[r329>>2]=0;HEAP32[((r308*20&-1)+4>>2)+r316]=0;HEAP32[((r308*20&-1)+8>>2)+r316]=0;HEAP32[((r308*20&-1)+12>>2)+r316]=r310;HEAP32[((r308*20&-1)+16>>2)+r316]=r279;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r330=r329;break}_add234_internal(r49,r329,-1);r330=r329}else{r330=r296}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+4>>2]=r330;HEAP32[r214>>2]=0;HEAP32[r215>>2]=0;HEAP32[r216>>2]=0;HEAP32[r217>>2]=r310;HEAP32[r218>>2]=r280;r296=_findrelpos234(r49,r213,0,0,0);do{if((r296|0)==0){r329=HEAP32[r48],r316=r329>>2;r308=HEAP32[r60];r301=r329+(r308*20&-1)|0;HEAP32[r301>>2]=0;HEAP32[((r308*20&-1)+4>>2)+r316]=0;HEAP32[((r308*20&-1)+8>>2)+r316]=0;HEAP32[((r308*20&-1)+12>>2)+r316]=r310;HEAP32[((r308*20&-1)+16>>2)+r316]=r280;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r331=r301;break}_add234_internal(r49,r301,-1);r331=r301}else{r331=r296}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+8>>2]=r331;HEAP32[r220>>2]=0;HEAP32[r221>>2]=0;HEAP32[r222>>2]=0;HEAP32[r223>>2]=r297;HEAP32[r224>>2]=r280;r296=_findrelpos234(r49,r219,0,0,0);do{if((r296|0)==0){r310=HEAP32[r48],r301=r310>>2;r316=HEAP32[r60];r308=r310+(r316*20&-1)|0;HEAP32[r308>>2]=0;HEAP32[((r316*20&-1)+4>>2)+r301]=0;HEAP32[((r316*20&-1)+8>>2)+r301]=0;HEAP32[((r316*20&-1)+12>>2)+r301]=r297;HEAP32[((r316*20&-1)+16>>2)+r301]=r280;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r332=r308;break}_add234_internal(r49,r308,-1);r332=r308}else{r332=r296}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+12>>2]=r332}do{if(r287){if(r295|r284){r296=HEAP32[r47],r308=r296>>2;r301=HEAP32[r53];HEAP32[((r301*24&-1)>>2)+r308]=4;r316=_malloc(16);if((r316|0)==0){r3=250;break L151}r310=r316;r316=(r296+(r301*24&-1)+8|0)>>2;HEAP32[r316]=r310;HEAP32[r310>>2]=0;HEAP32[HEAP32[r316]+4>>2]=0;HEAP32[HEAP32[r316]+8>>2]=0;HEAP32[HEAP32[r316]+12>>2]=0;HEAP32[((r301*24&-1)+4>>2)+r308]=0;HEAP32[((r301*24&-1)+12>>2)+r308]=0;HEAP32[r53]=HEAP32[r53]+1|0;HEAP32[r226>>2]=0;HEAP32[r227>>2]=0;HEAP32[r228>>2]=0;HEAP32[r229>>2]=r293;HEAP32[r230>>2]=r277;r308=_findrelpos234(r49,r225,0,0,0);do{if((r308|0)==0){r301=HEAP32[r48],r316=r301>>2;r310=HEAP32[r60];r296=r301+(r310*20&-1)|0;HEAP32[r296>>2]=0;HEAP32[((r310*20&-1)+4>>2)+r316]=0;HEAP32[((r310*20&-1)+8>>2)+r316]=0;HEAP32[((r310*20&-1)+12>>2)+r316]=r293;HEAP32[((r310*20&-1)+16>>2)+r316]=r277;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r333=r296;break}_add234_internal(r49,r296,-1);r333=r296}else{r333=r308}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]>>2]=r333;r308=r292+30|0;HEAP32[r232>>2]=0;HEAP32[r233>>2]=0;HEAP32[r234>>2]=0;HEAP32[r235>>2]=r308;HEAP32[r236>>2]=r288;r296=_findrelpos234(r49,r231,0,0,0);do{if((r296|0)==0){r316=HEAP32[r48],r310=r316>>2;r301=HEAP32[r60];r329=r316+(r301*20&-1)|0;HEAP32[r329>>2]=0;HEAP32[((r301*20&-1)+4>>2)+r310]=0;HEAP32[((r301*20&-1)+8>>2)+r310]=0;HEAP32[((r301*20&-1)+12>>2)+r310]=r308;HEAP32[((r301*20&-1)+16>>2)+r310]=r288;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r334=r329;break}_add234_internal(r49,r329,-1);r334=r329}else{r334=r296}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+4>>2]=r334;HEAP32[r238>>2]=0;HEAP32[r239>>2]=0;HEAP32[r240>>2]=0;HEAP32[r241>>2]=r297;HEAP32[r242>>2]=r290;r296=_findrelpos234(r49,r237,0,0,0);do{if((r296|0)==0){r308=HEAP32[r48],r329=r308>>2;r310=HEAP32[r60];r301=r308+(r310*20&-1)|0;HEAP32[r301>>2]=0;HEAP32[((r310*20&-1)+4>>2)+r329]=0;HEAP32[((r310*20&-1)+8>>2)+r329]=0;HEAP32[((r310*20&-1)+12>>2)+r329]=r297;HEAP32[((r310*20&-1)+16>>2)+r329]=r290;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r335=r301;break}_add234_internal(r49,r301,-1);r335=r301}else{r335=r296}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+8>>2]=r335;HEAP32[r244>>2]=0;HEAP32[r245>>2]=0;HEAP32[r246>>2]=0;HEAP32[r247>>2]=r294;HEAP32[r248>>2]=r278;r296=_findrelpos234(r49,r243,0,0,0);do{if((r296|0)==0){r301=HEAP32[r48],r329=r301>>2;r310=HEAP32[r60];r308=r301+(r310*20&-1)|0;HEAP32[r308>>2]=0;HEAP32[((r310*20&-1)+4>>2)+r329]=0;HEAP32[((r310*20&-1)+8>>2)+r329]=0;HEAP32[((r310*20&-1)+12>>2)+r329]=r294;HEAP32[((r310*20&-1)+16>>2)+r329]=r278;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r336=r308;break}_add234_internal(r49,r308,-1);r336=r308}else{r336=r296}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+12>>2]=r336}if((r274|r275|0)==0){break}r296=HEAP32[r47],r308=r296>>2;r329=HEAP32[r53];HEAP32[((r329*24&-1)>>2)+r308]=4;r310=_malloc(16);if((r310|0)==0){r3=270;break L151}r301=r310;r310=(r296+(r329*24&-1)+8|0)>>2;HEAP32[r310]=r301;HEAP32[r301>>2]=0;HEAP32[HEAP32[r310]+4>>2]=0;HEAP32[HEAP32[r310]+8>>2]=0;HEAP32[HEAP32[r310]+12>>2]=0;HEAP32[((r329*24&-1)+4>>2)+r308]=0;HEAP32[((r329*24&-1)+12>>2)+r308]=0;HEAP32[r53]=HEAP32[r53]+1|0;HEAP32[r250>>2]=0;HEAP32[r251>>2]=0;HEAP32[r252>>2]=0;HEAP32[r253>>2]=r291;HEAP32[r254>>2]=r278;r308=_findrelpos234(r49,r249,0,0,0);do{if((r308|0)==0){r329=HEAP32[r48],r310=r329>>2;r301=HEAP32[r60];r296=r329+(r301*20&-1)|0;HEAP32[r296>>2]=0;HEAP32[((r301*20&-1)+4>>2)+r310]=0;HEAP32[((r301*20&-1)+8>>2)+r310]=0;HEAP32[((r301*20&-1)+12>>2)+r310]=r291;HEAP32[((r301*20&-1)+16>>2)+r310]=r278;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r337=r296;break}_add234_internal(r49,r296,-1);r337=r296}else{r337=r308}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]>>2]=r337;HEAP32[r256>>2]=0;HEAP32[r257>>2]=0;HEAP32[r258>>2]=0;HEAP32[r259>>2]=r306;HEAP32[r260>>2]=r290;r308=_findrelpos234(r49,r255,0,0,0);do{if((r308|0)==0){r296=HEAP32[r48],r310=r296>>2;r301=HEAP32[r60];r329=r296+(r301*20&-1)|0;HEAP32[r329>>2]=0;HEAP32[((r301*20&-1)+4>>2)+r310]=0;HEAP32[((r301*20&-1)+8>>2)+r310]=0;HEAP32[((r301*20&-1)+12>>2)+r310]=r306;HEAP32[((r301*20&-1)+16>>2)+r310]=r290;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r338=r329;break}_add234_internal(r49,r329,-1);r338=r329}else{r338=r308}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+4>>2]=r338;r308=r292-30|0;HEAP32[r262>>2]=0;HEAP32[r263>>2]=0;HEAP32[r264>>2]=0;HEAP32[r265>>2]=r308;HEAP32[r266>>2]=r288;r329=_findrelpos234(r49,r261,0,0,0);do{if((r329|0)==0){r310=HEAP32[r48],r301=r310>>2;r296=HEAP32[r60];r316=r310+(r296*20&-1)|0;HEAP32[r316>>2]=0;HEAP32[((r296*20&-1)+4>>2)+r301]=0;HEAP32[((r296*20&-1)+8>>2)+r301]=0;HEAP32[((r296*20&-1)+12>>2)+r301]=r308;HEAP32[((r296*20&-1)+16>>2)+r301]=r288;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r339=r316;break}_add234_internal(r49,r316,-1);r339=r316}else{r339=r329}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+8>>2]=r339;HEAP32[r268>>2]=0;HEAP32[r269>>2]=0;HEAP32[r270>>2]=0;HEAP32[r271>>2]=r299;HEAP32[r272>>2]=r277;r329=_findrelpos234(r49,r267,0,0,0);do{if((r329|0)==0){r308=HEAP32[r48],r316=r308>>2;r301=HEAP32[r60];r296=r308+(r301*20&-1)|0;HEAP32[r296>>2]=0;HEAP32[((r301*20&-1)+4>>2)+r316]=0;HEAP32[((r301*20&-1)+8>>2)+r316]=0;HEAP32[((r301*20&-1)+12>>2)+r316]=r299;HEAP32[((r301*20&-1)+16>>2)+r316]=r277;HEAP32[r60]=HEAP32[r60]+1|0;if((HEAP32[r51]|0)==0){r340=r296;break}_add234_internal(r49,r296,-1);r340=r296}else{r340=r329}}while(0);HEAP32[HEAP32[HEAP32[r47]+((HEAP32[r53]-1)*24&-1)+8>>2]+12>>2]=r340}}while(0);r299=r274+1|0;if((r299|0)<(r1|0)){r274=r299}else{break L153}}}}while(0);r274=r273+1|0;if((r274|0)<(r2|0)){r273=r274}else{r3=290;break}}if(r3==172){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==201){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==229){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==250){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==120){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==270){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==290){r341=HEAP32[r50>>2];break}}else{r341=0}}while(0);_freenode234(r341);_free(r46);if((HEAP32[r44]|0)>(r41|0)){___assert_func(69436,2465,70480,67036)}if((HEAP32[r44+4]|0)<=(r42|0)){_grid_make_consistent(r45);STACKTOP=r4;return r45}___assert_func(69436,2466,70480,66776);_grid_make_consistent(r45);STACKTOP=r4;return r45}function _grid_new_penrose_p2_kite(r1,r2,r3){return _grid_new_penrose(r1,r2,0,r3)}function _grid_new_penrose_p3_thick(r1,r2,r3){return _grid_new_penrose(r1,r2,1,r3)}function _grid_new_penrose(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108;r5=STACKTOP;STACKTOP=STACKTOP+52|0;r6=r5;r7=r5+4;r8=r5+8;r9=r5+12;r10=r5+28;r11=r9|0;r12=r9+4|0;r13=(r3|0)==0?150:125;r14=r13*3.11*Math.sqrt(Math.imul(r1,r1)+Math.imul(r2,r2)|0);L381:do{if(r13*.22426<r14){r15=r13;r16=0;while(1){r17=r16+1|0;r18=r15*1.6180339887;if(r18*.22426<r14){r15=r18;r16=r17}else{r19=r18;r20=r17;break L381}}}else{r19=r13;r20=0}}while(0);HEAP32[r11>>2]=r19&-1;HEAP32[r12>>2]=r20;HEAP32[r9+8>>2]=26;r20=r10,r12=r20>>2;HEAP32[r9+12>>2]=r20;r20=Math.imul(r2,r1);r19=r20*9&-1;r11=r20*36&-1;r13=_malloc(48),r14=r13>>2;if((r13|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r16=r13;HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;HEAP32[r14+3]=0;HEAP32[r14+4]=0;HEAP32[r14+5]=0;HEAP32[r14+11]=1;r15=r13+24|0,r17=r15>>2;HEAP32[r17]=0;HEAP32[r17+1]=0;HEAP32[r17+2]=0;HEAP32[r17+3]=0;HEAP32[r14+10]=100;r14=_malloc(r20*216&-1);if((r14|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r17=(r13+4|0)>>2;HEAP32[r17]=r14;r14=_malloc(r20*720&-1);if((r14|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r20=(r13+20|0)>>2;HEAP32[r20]=r14;r14=_malloc(8);if((r14|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r18=r14;HEAP32[r18>>2]=0;HEAP32[r14+4>>2]=42;HEAP32[r12]=0;HEAP32[r12+1]=0;HEAP32[r12+2]=0;HEAP32[r12+3]=0;HEAP32[r12+4]=0;HEAP32[r10+16>>2]=r16;HEAP32[r10+20>>2]=r14;do{if((r4|0)==0){HEAP32[r8>>2]=0;HEAP32[r7>>2]=0;HEAP32[r6>>2]=0}else{if((_sscanf(r4,67228,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r6,HEAP32[tempInt+4>>2]=r7,HEAP32[tempInt+8>>2]=r8,tempInt))|0)==3){break}___assert_func(69436,2636,70380,67624)}}while(0);r4=HEAP32[r6>>2];r6=(r1*100&-1|0)/2&-1;r1=(r10|0)>>2;HEAP32[r1]=r4-r6|0;r12=(r10+4|0)>>2;HEAP32[r12]=r4+r6|0;r6=HEAP32[r7>>2];r7=(r2*100&-1|0)/2&-1;r2=(r10+8|0)>>2;HEAP32[r2]=r6-r7|0;r4=(r10+12|0)>>2;HEAP32[r4]=r6+r7|0;_penrose(r9,r3,HEAP32[r8>>2]);_freenode234(HEAP32[r18>>2]);_free(r14);r14=r13>>2;if((HEAP32[r14]|0)>(r19|0)){___assert_func(69436,2657,70380,67036)}r19=(r13+16|0)>>2;r18=HEAP32[r19];if((r18|0)>(r11|0)){___assert_func(69436,2658,70380,66776);r21=HEAP32[r19]}else{r21=r18}r18=_malloc(Math.imul(r21<<2,r21));if((r18|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r21=r18;r11=HEAP32[r19];L411:do{if((r11|0)>0){r8=0;r3=r11;while(1){L414:do{if((r3|0)>0){r9=0;r7=r3;while(1){r6=(Math.imul(r7,r8)+r9<<2)+r21|0;HEAP32[r6>>2]=-1;r6=r9+1|0;r10=HEAP32[r19];if((r6|0)<(r10|0)){r9=r6;r7=r10}else{r22=r10;break L414}}}else{r22=r3}}while(0);r7=r8+1|0;if((r7|0)<(r22|0)){r8=r7;r3=r22}else{r23=r22;break L411}}}else{r23=r11}}while(0);r11=HEAP32[r14];if((r11|0)>0){r22=0;r3=r11;while(1){r11=HEAP32[r17];r8=(r11+(r22*24&-1)|0)>>2;r7=HEAP32[r8];r9=r11+(r22*24&-1)+8|0;if((r7|0)>0){r11=HEAP32[r9>>2];r10=HEAP32[r20];r6=(HEAP32[r11>>2]-r10|0)/20&-1;r24=(Math.imul(HEAP32[r19],(HEAP32[r11+(r7-1<<2)>>2]-r10|0)/20&-1)+r6<<2)+r21|0;HEAP32[r24>>2]=r22;L424:do{if((HEAP32[r8]|0)>1){r24=r6;r10=1;while(1){r7=(HEAP32[HEAP32[r9>>2]+(r10<<2)>>2]-HEAP32[r20]|0)/20&-1;r11=(Math.imul(HEAP32[r19],r24)+r7<<2)+r21|0;HEAP32[r11>>2]=r22;r11=r10+1|0;if((r11|0)<(HEAP32[r8]|0)){r24=r7;r10=r11}else{break L424}}}}while(0);r25=HEAP32[r14]}else{r25=r3}r8=r22+1|0;if((r8|0)<(r25|0)){r22=r8;r3=r25}else{break}}r26=HEAP32[r19]}else{r26=r23}r23=_malloc(r26<<2);if((r23|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r26=r23,r25=r26>>2;r3=HEAP32[r19];L434:do{if((r3|0)>0){r22=0;while(1){r8=(r22<<2)+r26|0;HEAP32[r8>>2]=1;r9=HEAP32[r19];L437:do{if((r9|0)>0){r6=0;r10=r9;while(1){r24=(Math.imul(r10,r22)+r6<<2)+r21|0;r11=HEAP32[r24>>2]>>>31;r24=(Math.imul(r6,r10)+r22<<2)+r21|0;if((r11|0)==(HEAP32[r24>>2]>>>31|0)){r27=r10}else{HEAP32[r8>>2]=0;r27=HEAP32[r19]}r24=r6+1|0;if((r24|0)<(r27|0)){r6=r24;r10=r27}else{r28=r27;break L437}}}else{r28=r9}}while(0);r9=r22+1|0;if((r9|0)<(r28|0)){r22=r9}else{r29=r28;break L434}}}else{r29=r3}}while(0);r3=_malloc(r29<<2);if((r3|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r28=r3,r27=r28>>2;L448:do{if((r29|0)>0){r22=0;while(1){HEAP32[(r22<<2>>2)+r27]=6;r9=r22+1|0;if((r9|0)==(r29|0)){break L448}else{r22=r9}}}}while(0);r29=HEAP32[r19];L452:do{if((r29|0)>0){r22=0;r9=r29;while(1){if((r22|0)>0){r8=(r22<<2)+r26|0;r10=0;while(1){do{if((HEAP32[r8>>2]|0)!=0){if((HEAP32[(r10<<2>>2)+r25]|0)==0){break}r6=HEAP32[r19];r24=(Math.imul(r6,r22)+r10<<2)+r21|0;if((HEAP32[r24>>2]|0)<=-1){break}r24=(Math.imul(r6,r10)+r22<<2)+r21|0;if((HEAP32[r24>>2]|0)<=-1){break}_edsf_merge(r28,r22,r10,0)}}while(0);r24=r10+1|0;if((r24|0)==(r22|0)){break}else{r10=r24}}r30=HEAP32[r19]}else{r30=r9}r10=r22+1|0;if((r10|0)<(r30|0)){r22=r10;r9=r30}else{break}}if((r30|0)>0){r31=0;r32=-1;r33=0}else{r34=-1;break}while(1){do{if((HEAP32[(r33<<2>>2)+r25]|0)==0){r35=r32;r36=r31}else{r9=(r33<<2)+r28|0;r22=HEAP32[r9>>2];if((r22&2|0)==0){r10=0;r8=r22;while(1){r37=r8&1^r10;r38=r8>>2;r24=HEAP32[(r38<<2>>2)+r27];if((r24&2|0)==0){r10=r37;r8=r24}else{break}}L476:do{if((r38|0)==(r33|0)){r39=r37;r40=r33}else{r8=r38<<2;r10=r22>>2;r24=r37^r22&1;HEAP32[r9>>2]=r37|r8;if((r10|0)==(r38|0)){r39=r24;r40=r38;break}else{r41=r10;r42=r24}while(1){r24=(r41<<2)+r28|0;r10=HEAP32[r24>>2];r6=r10>>2;r11=r10&1^r42;HEAP32[r24>>2]=r42|r8;if((r6|0)==(r38|0)){r39=r11;r40=r38;break L476}else{r41=r6;r42=r11}}}}while(0);if((r39|0)!=0){___assert_func(66560,137,70752,68352)}if((r40|0)!=(r33|0)){r35=r32;r36=r31;break}}r9=_dsf_size(r28,r33);r22=(r9|0)>(r31|0);r35=r22?r33:r32;r36=r22?r9:r31}}while(0);r9=r33+1|0;if((r9|0)<(HEAP32[r19]|0)){r31=r36;r32=r35;r33=r9}else{r34=r35;break L452}}}else{r34=-1}}while(0);r35=_malloc(HEAP32[r14]<<2);if((r35|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r33=r35,r32=r33>>2;r36=HEAP32[r14];L490:do{if((r36|0)>0){r31=0;while(1){HEAP32[(r31<<2>>2)+r32]=0;r40=r31+1|0;r39=HEAP32[r14];if((r40|0)<(r39|0)){r31=r40}else{r43=r39;break L490}}}else{r43=r36}}while(0);if((HEAP32[r19]|0)>0){r36=0;while(1){HEAP32[(r36<<2>>2)+r25]=0;r31=r36+1|0;if((r31|0)<(HEAP32[r19]|0)){r36=r31}else{break}}r44=HEAP32[r14]}else{r44=r43}L499:do{if((r44|0)>0){r43=0;while(1){r36=HEAP32[r17];r31=(r36+(r43*24&-1)|0)>>2;L502:do{if((HEAP32[r31]|0)>0){r39=r36+(r43*24&-1)+8|0;r40=0;r42=0;while(1){r41=HEAP32[HEAP32[r39>>2]+(r42<<2)>>2]-HEAP32[r20]|0;r38=(r41|0)/20&-1;if((r41|0)<=-20){___assert_func(66560,110,70752,68748)}r41=(r38<<2)+r28|0;r37=HEAP32[r41>>2];do{if((r37&2|0)==0){r30=0;r21=r37;while(1){r45=r21&1^r30;r46=r21>>2;r29=HEAP32[(r46<<2>>2)+r27];if((r29&2|0)==0){r30=r45;r21=r29}else{break}}L513:do{if((r46|0)==(r38|0)){r47=r45;r48=r38}else{r21=r46<<2;r30=r37>>2;r29=r45^r37&1;HEAP32[r41>>2]=r45|r21;if((r30|0)==(r46|0)){r47=r29;r48=r46;break}else{r49=r30;r50=r29}while(1){r29=(r49<<2)+r28|0;r30=HEAP32[r29>>2];r9=r30>>2;r22=r30&1^r50;HEAP32[r29>>2]=r50|r21;if((r9|0)==(r46|0)){r47=r22;r48=r46;break L513}else{r49=r9;r50=r22}}}}while(0);if((r47|0)==0){r51=r48;break}___assert_func(66560,137,70752,68352);r51=r48}else{r51=r38}}while(0);r52=(r51|0)==(r34|0)?1:r40;r38=r42+1|0;if((r38|0)<(HEAP32[r31]|0)){r40=r52;r42=r38}else{break}}if((r52|0)==0){break}HEAP32[(r43<<2>>2)+r32]=1;if((HEAP32[r31]|0)>0){r53=0}else{break}while(1){HEAP32[(((HEAP32[HEAP32[r39>>2]+(r53<<2)>>2]-HEAP32[r20]|0)/20&-1)<<2>>2)+r25]=1;r42=r53+1|0;if((r42|0)<(HEAP32[r31]|0)){r53=r42}else{break L502}}}}while(0);r31=r43+1|0;r54=HEAP32[r14];if((r31|0)<(r54|0)){r43=r31}else{break}}if((r54|0)>0){r55=0;r56=0}else{r57=0;r58=r54;break}while(1){r43=(r56<<2)+r33|0;r31=(HEAP32[r43>>2]|0)==0;r36=(r31&1^1)+r55|0;HEAP32[r43>>2]=r31?-1:r55;r31=r56+1|0;r43=HEAP32[r14];if((r31|0)<(r43|0)){r55=r36;r56=r31}else{r57=r36;r58=r43;break L499}}}else{r57=0;r58=r44}}while(0);r44=HEAP32[r19];if((r44|0)>0){r56=0;r55=0;while(1){r33=(r55<<2)+r26|0;r54=(HEAP32[r33>>2]|0)==0;r59=(r54&1^1)+r56|0;HEAP32[r33>>2]=r54?-1:r56;r54=r55+1|0;r60=HEAP32[r19];if((r54|0)<(r60|0)){r56=r59;r55=r54}else{break}}r61=r59;r62=HEAP32[r14];r63=r60}else{r61=0;r62=r58;r63=r44}if((r62|0)>0){r44=0;r58=r62;while(1){do{if((HEAP32[(r44<<2>>2)+r32]|0)<0){r60=HEAP32[HEAP32[r17]+(r44*24&-1)+8>>2];if((r60|0)==0){r64=r58;break}_free(r60);r64=HEAP32[r14]}else{r64=r58}}while(0);r60=r44+1|0;if((r60|0)<(r64|0)){r44=r60;r58=r64}else{break}}r65=HEAP32[r19];r66=r64}else{r65=r63;r66=r62}if((r65|0)>0){r62=0;r63=r65;while(1){r65=HEAP32[(r62<<2>>2)+r25];if((r65|0)>-1){r64=HEAP32[r20];r58=(r64+(r65*20&-1)|0)>>2;r65=(r64+(r62*20&-1)|0)>>2;HEAP32[r58]=HEAP32[r65];HEAP32[r58+1]=HEAP32[r65+1];HEAP32[r58+2]=HEAP32[r65+2];HEAP32[r58+3]=HEAP32[r65+3];HEAP32[r58+4]=HEAP32[r65+4];r67=HEAP32[r19]}else{r67=r63}r65=r62+1|0;if((r65|0)<(r67|0)){r62=r65;r63=r67}else{break}}r68=HEAP32[r14]}else{r68=r66}if((r68|0)>0){r69=0;r70=r68}else{HEAP32[r14]=r57;HEAP32[r19]=r61;_free(r18);_free(r3);_free(r23);_free(r35);_grid_make_consistent(r16);r71=HEAP32[r12];r72=HEAP32[r1];r73=r13+32|0;r74=r73,r75=r74>>2;r76=HEAP32[r75];r77=r15,r78=r77>>2;r79=HEAP32[r78];r80=r71-r72|0;r81=r80-r76|0;r82=r81+r79|0;r83=(r82|0)/2&-1;r84=r79-r83|0;HEAP32[r78]=r84;r85=HEAP32[r12];r86=HEAP32[r1];r87=r84+r85|0;r88=r87-r86|0;HEAP32[r75]=r88;r89=HEAP32[r4];r90=HEAP32[r2];r91=r13+36|0;r92=r91,r93=r92>>2;r94=HEAP32[r93];r95=r13+28|0;r96=r95,r97=r96>>2;r98=HEAP32[r97];r99=r89-r90|0;r100=r99-r94|0;r101=r100+r98|0;r102=(r101|0)/2&-1;r103=r98-r102|0;HEAP32[r97]=r103;r104=HEAP32[r4];r105=HEAP32[r2];r106=r103+r104|0;r107=r106-r105|0;HEAP32[r93]=r107;STACKTOP=r5;return r16}while(1){r68=HEAP32[(r69<<2>>2)+r32];if((r68|0)>-1){r66=HEAP32[r17];r67=r66+(r68*24&-1)|0;r63=r67>>2;r62=(r66+(r69*24&-1)|0)>>2;HEAP32[r63]=HEAP32[r62];HEAP32[r63+1]=HEAP32[r62+1];HEAP32[r63+2]=HEAP32[r62+2];HEAP32[r63+3]=HEAP32[r62+3];HEAP32[r63+4]=HEAP32[r62+4];HEAP32[r63+5]=HEAP32[r62+5];r62=r67|0;L557:do{if((HEAP32[r62>>2]|0)>0){r67=r66+(r68*24&-1)+8|0;r63=0;while(1){r65=(r63<<2)+HEAP32[r67>>2]|0;r58=HEAP32[r20];HEAP32[r65>>2]=r58+(HEAP32[(((HEAP32[r65>>2]-r58|0)/20&-1)<<2>>2)+r25]*20&-1)|0;r58=r63+1|0;if((r58|0)<(HEAP32[r62>>2]|0)){r63=r58}else{break L557}}}}while(0);r108=HEAP32[r14]}else{r108=r70}r62=r69+1|0;if((r62|0)<(r108|0)){r69=r62;r70=r108}else{break}}HEAP32[r14]=r57;HEAP32[r19]=r61;_free(r18);_free(r3);_free(r23);_free(r35);_grid_make_consistent(r16);r71=HEAP32[r12];r72=HEAP32[r1];r73=r13+32|0;r74=r73,r75=r74>>2;r76=HEAP32[r75];r77=r15,r78=r77>>2;r79=HEAP32[r78];r80=r71-r72|0;r81=r80-r76|0;r82=r81+r79|0;r83=(r82|0)/2&-1;r84=r79-r83|0;HEAP32[r78]=r84;r85=HEAP32[r12];r86=HEAP32[r1];r87=r84+r85|0;r88=r87-r86|0;HEAP32[r75]=r88;r89=HEAP32[r4];r90=HEAP32[r2];r91=r13+36|0;r92=r91,r93=r92>>2;r94=HEAP32[r93];r95=r13+28|0;r96=r95,r97=r96>>2;r98=HEAP32[r97];r99=r89-r90|0;r100=r99-r94|0;r101=r100+r98|0;r102=(r101|0)/2&-1;r103=r98-r102|0;HEAP32[r97]=r103;r104=HEAP32[r4];r105=HEAP32[r2];r106=r103+r104|0;r107=r106-r105|0;HEAP32[r93]=r107;STACKTOP=r5;return r16}function _grid_point_cmp_fn(r1,r2){var r3,r4,r5;r3=HEAP32[r1+16>>2];r4=HEAP32[r2+16>>2];if((r3|0)==(r4|0)){r5=HEAP32[r2+12>>2]-HEAP32[r1+12>>2]|0;return r5}else{r5=r4-r3|0;return r5}}function _set_faces(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r5=0;r6=STACKTOP;STACKTOP=STACKTOP+52|0;r7=r6;r8=r6+20;r9=r6+36;r10=HEAP32[r1+12>>2];if((HEAP32[r1+4>>2]|0)>(r4|0)){STACKTOP=r6;return 0}r4=r10;r1=r10+4|0;r11=r10+8|0;r12=r10+12|0;r13=0;while(1){if((r13|0)>=(r3|0)){r5=435;break}r14=HEAP32[r2+(r13<<4)>>2];r15=HEAP32[r2+(r13<<4)+12>>2];r16=HEAP32[r2+(r13<<4)+4>>2];r17=HEAP32[r2+(r13<<4)+8>>2];r18=(r15+r14|0)*.5877852+(r17+r16|0)*.9510565;r19=(r14-r15|0)*.8090169+(r16-r17|0)*.3090169;if(r18>0){r20=Math.floor(r18+.5)}else{r20=Math.ceil(r18-.5)}r18=r20&-1;HEAP32[r8+(r13<<2)>>2]=r18;if(r19>0){r21=Math.floor(r19+.5)}else{r21=Math.ceil(r19-.5)}r19=r21&-1;HEAP32[r9+(r13<<2)>>2]=r19;if((r18|0)<(HEAP32[r4>>2]|0)){r5=450;break}if((r18|0)>(HEAP32[r1>>2]|0)){r5=451;break}if((r19|0)<(HEAP32[r11>>2]|0)){r5=452;break}if((r19|0)>(HEAP32[r12>>2]|0)){r5=453;break}else{r13=r13+1|0}}if(r5==435){r13=(r10+16|0)>>2;r12=HEAP32[r13];r11=HEAP32[r12+4>>2],r1=r11>>2;r4=(r12|0)>>2;r12=HEAP32[r4];HEAP32[((r12*24&-1)>>2)+r1]=r3;r21=_malloc(r3<<2);if((r21|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r20=r21;r21=r11+(r12*24&-1)+8|0;HEAP32[r21>>2]=r20;r11=(r3|0)>0;if(!r11){HEAP32[((r12*24&-1)+4>>2)+r1]=0;HEAP32[((r12*24&-1)+12>>2)+r1]=0;HEAP32[r4]=HEAP32[r4]+1|0;STACKTOP=r6;return 0}HEAP32[r20>>2]=0;L597:do{if((r3|0)!=1){r20=1;while(1){HEAP32[HEAP32[r21>>2]+(r20<<2)>>2]=0;r2=r20+1|0;if((r2|0)==(r3|0)){break L597}else{r20=r2}}}}while(0);HEAP32[((r12*24&-1)+4>>2)+r1]=0;HEAP32[((r12*24&-1)+12>>2)+r1]=0;HEAP32[r4]=HEAP32[r4]+1|0;if(!r11){STACKTOP=r6;return 0}r11=r10+20|0;r10=r7;r4=r7|0;r1=r7+4|0;r12=r7+8|0;r21=r7+12|0;r20=r7+16|0;r7=0;while(1){r2=HEAP32[r13];r19=HEAP32[r11>>2];r18=HEAP32[r8+(r7<<2)>>2];r17=HEAP32[r9+(r7<<2)>>2];HEAP32[r4>>2]=0;HEAP32[r1>>2]=0;HEAP32[r12>>2]=0;HEAP32[r21>>2]=r18;HEAP32[r20>>2]=r17;r16=_findrelpos234(r19,r10,0,0,0);do{if((r16|0)==0){r15=HEAP32[r2+20>>2],r14=r15>>2;r22=(r2+16|0)>>2;r23=HEAP32[r22];r24=r15+(r23*20&-1)|0;HEAP32[r24>>2]=0;HEAP32[((r23*20&-1)+4>>2)+r14]=0;HEAP32[((r23*20&-1)+8>>2)+r14]=0;HEAP32[((r23*20&-1)+12>>2)+r14]=r18;HEAP32[((r23*20&-1)+16>>2)+r14]=r17;HEAP32[r22]=HEAP32[r22]+1|0;if((HEAP32[r19+4>>2]|0)==0){r25=r24;break}_add234_internal(r19,r24,-1);r25=r24}else{r25=r16}}while(0);r16=HEAP32[r13];HEAP32[HEAP32[HEAP32[r16+4>>2]+((HEAP32[r16>>2]-1)*24&-1)+8>>2]+(r7<<2)>>2]=r25;r16=r7+1|0;if((r16|0)==(r3|0)){break}else{r7=r16}}STACKTOP=r6;return 0}else if(r5==450){STACKTOP=r6;return 0}else if(r5==451){STACKTOP=r6;return 0}else if(r5==452){STACKTOP=r6;return 0}else if(r5==453){STACKTOP=r6;return 0}}function _grid_edge_bydots_cmpfn(r1,r2){var r3,r4,r5,r6,r7,r8,r9;r3=HEAP32[r1>>2];r4=HEAP32[r1+4>>2];r1=r3>>>0<r4>>>0;r5=r1?r3:r4;r6=HEAP32[r2>>2];r7=HEAP32[r2+4>>2];r2=r6>>>0<r7>>>0;r8=r2?r6:r7;if((r5|0)!=(r8|0)){r9=(r8-r5|0)/20&-1;return r9}r5=r1?r4:r3;r3=r2?r7:r6;if((r5|0)==(r3|0)){r9=0;return r9}r9=(r3-r5|0)/20&-1;return r9}function _init_game(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3,r5=r4>>2;r6=_midend_new(r1,65536,66460,r2);_frontend_set_game_info(r1,r6,69580,1,1,1,0,0,0,0);r7=_midend_num_presets(r6);HEAP32[r5]=r7;L626:do{if((r7|0)>0){r8=r6+24|0;r9=r6+16|0;r10=r6+12|0;r11=0;while(1){if((HEAP32[r8>>2]|0)<=(r11|0)){___assert_func(68180,1056,70296,68988)}_frontend_add_preset(r1,HEAP32[HEAP32[r9>>2]+(r11<<2)>>2],HEAP32[HEAP32[r10>>2]+(r11<<2)>>2]);r12=r11+1|0;if((r12|0)<(HEAP32[r5]|0)){r11=r12}else{break L626}}}}while(0);r1=_midend_colours(r6,r4)>>2;if((HEAP32[r5]|0)>0){r13=0}else{STACKTOP=r3;return}while(1){r4=r13*3&-1;_canvas_set_palette_entry(r2,r13,HEAPF32[(r4<<2>>2)+r1]*255&-1,HEAPF32[(r4+1<<2>>2)+r1]*255&-1,HEAPF32[(r4+2<<2>>2)+r1]*255&-1);r4=r13+1|0;if((r4|0)<(HEAP32[r5]|0)){r13=r4}else{break}}STACKTOP=r3;return}function _grid_make_consistent(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+20|0;r4=r3;r5=r3+4;r6=(r1|0)>>2;r7=(r1+16|0)>>2;r8=HEAP32[r6]-1+HEAP32[r7]|0;r9=(r1+8|0)>>2;HEAP32[r9]=r8;r10=_malloc(r8<<4);if((r10|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r8=r10;r10=(r1+12|0)>>2;HEAP32[r10]=r8;r11=_malloc(8);if((r11|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r12=r11;r13=r11;HEAP32[r13>>2]=0;r14=r11+4|0;HEAP32[r14>>2]=16;if((HEAP32[r6]|0)>0){r15=r1+4|0;r16=r5|0;r17=r5+4|0;r18=r5;r5=r8;r8=0;while(1){r19=HEAP32[r15>>2];r20=r19+(r8*24&-1)|0;r21=(r20|0)>>2;r22=HEAP32[r21];L650:do{if((r22|0)>0){r23=r19+(r8*24&-1)+8|0;r24=0;r25=r5,r26=r25>>2;r27=r22;while(1){r28=r24;r29=r27;while(1){r30=r28+1|0;HEAP32[r16>>2]=HEAP32[HEAP32[r23>>2]+(r28<<2)>>2];HEAP32[r17>>2]=HEAP32[HEAP32[r23>>2]+(((r30|0)==(r29|0)?0:r30)<<2)>>2];if((_findrelpos234(r12,r18,0,0,r4)|0)==0){break}r31=_delpos234_internal(r12,HEAP32[r4>>2]);if((r31|0)==0){break}HEAP32[r31+12>>2]=r20;r31=HEAP32[r21];if((r30|0)<(r31|0)){r28=r30;r29=r31}else{r32=r25;break L650}}if((r25-HEAP32[r10]>>4|0)>=(HEAP32[r9]|0)){___assert_func(69436,551,70576,66664)}HEAP32[r26]=HEAP32[r16>>2];HEAP32[r26+1]=HEAP32[r17>>2];HEAP32[r26+2]=r20;HEAP32[r26+3]=0;if((HEAP32[r14>>2]|0)!=0){_add234_internal(r12,r25,-1)}r29=r25+16|0;r28=HEAP32[r21];if((r30|0)<(r28|0)){r24=r30;r25=r29,r26=r25>>2;r27=r28}else{r32=r29;break L650}}}else{r32=r5}}while(0);r21=r8+1|0;if((r21|0)<(HEAP32[r6]|0)){r5=r32;r8=r21}else{break}}r33=HEAP32[r13>>2]}else{r33=0}_freenode234(r33);_free(r11);L668:do{if((HEAP32[r6]|0)>0){r11=r1+4|0;r33=0;while(1){r13=HEAP32[r11>>2];r8=(r13+(r33*24&-1)|0)>>2;r32=_malloc(HEAP32[r8]<<2);if((r32|0)==0){break}r5=r32;r32=r13+(r33*24&-1)+4|0;HEAP32[r32>>2]=r5;L673:do{if((HEAP32[r8]|0)>0){r13=0;r30=r5;while(1){HEAP32[r30+(r13<<2)>>2]=0;r12=r13+1|0;if((r12|0)>=(HEAP32[r8]|0)){break L673}r13=r12;r30=HEAP32[r32>>2]}}}while(0);r32=r33+1|0;if((r32|0)<(HEAP32[r6]|0)){r33=r32}else{break L668}}_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}while(0);r33=HEAP32[r9];L680:do{if((r33|0)>0){r11=0;while(1){r32=HEAP32[r10];r8=(r11<<4)+r32|0;r5=(r11<<4)+r32+8|0;r30=r8|0;r13=(r11<<4)+r32+4|0;r12=(r11<<4)+r32+12|0;r32=0;while(1){r14=HEAP32[((r32|0)==0?r5:r12)>>2];do{if((r14|0)!=0){r17=r14+8|0;r16=r14|0;r4=HEAP32[r16>>2];r18=0;while(1){if((r18|0)>=(r4|0)){break}if((HEAP32[HEAP32[r17>>2]+(r18<<2)>>2]|0)==(HEAP32[r30>>2]|0)){break}else{r18=r18+1|0}}if((r18|0)==(r4|0)){___assert_func(69436,593,70576,66588);r34=HEAP32[r16>>2]}else{r34=r4}r15=r18+1|0;r21=HEAP32[r17>>2];r20=HEAP32[r13>>2];if((HEAP32[r21+(((r15|0)==(r34|0)?0:r15)<<2)>>2]|0)==(r20|0)){r15=r14+4|0;r22=HEAP32[r15>>2];if((HEAP32[r22+(r18<<2)>>2]|0)==0){r35=r22}else{___assert_func(69436,618,70576,69524);r35=HEAP32[r15>>2]}HEAP32[r35+(r18<<2)>>2]=r8;break}r15=((r18|0)==0?r34:r18)-1|0;if((HEAP32[r21+(r15<<2)>>2]|0)!=(r20|0)){___assert_func(69436,632,70576,69340);break}r20=r14+4|0;r21=HEAP32[r20>>2];if((HEAP32[r21+(r15<<2)>>2]|0)==0){r36=r21}else{___assert_func(69436,628,70576,69472);r36=HEAP32[r20>>2]}HEAP32[r36+(r15<<2)>>2]=r8}}while(0);r14=r32+1|0;if((r14|0)==2){break}else{r32=r14}}r32=r11+1|0;r8=HEAP32[r9];if((r32|0)<(r8|0)){r11=r32}else{r37=r8;break L680}}}else{r37=r33}}while(0);r33=HEAP32[r7];if((r33|0)>0){r36=r1+20|0;r34=0;while(1){HEAP32[HEAP32[r36>>2]+(r34*20&-1)>>2]=0;r35=r34+1|0;r38=HEAP32[r7];if((r35|0)<(r38|0)){r34=r35}else{break}}r39=HEAP32[r9];r40=r38}else{r39=r37;r40=r33}if((r39|0)>0){r39=0;while(1){r33=HEAP32[r10];r37=HEAP32[r33+(r39<<4)>>2]|0;HEAP32[r37>>2]=HEAP32[r37>>2]+1|0;r37=HEAP32[r33+(r39<<4)+4>>2]|0;HEAP32[r37>>2]=HEAP32[r37>>2]+1|0;r37=r39+1|0;if((r37|0)<(HEAP32[r9]|0)){r39=r37}else{break}}r41=HEAP32[r7]}else{r41=r40}L720:do{if((r41|0)>0){r40=r1+20|0;r39=0;while(1){r9=HEAP32[r40>>2];r10=(r9+(r39*20&-1)|0)>>2;r37=HEAP32[r10];if((r37|0)>1){r42=r37}else{___assert_func(69436,655,70576,69304);r42=HEAP32[r10]}r37=_malloc(r42<<2);if((r37|0)==0){r2=535;break}r33=r9+(r39*20&-1)+4|0;HEAP32[r33>>2]=r37;r37=_malloc(HEAP32[r10]<<2);if((r37|0)==0){r2=537;break}r38=r9+(r39*20&-1)+8|0;HEAP32[r38>>2]=r37;L729:do{if((HEAP32[r10]|0)>0){r37=0;while(1){HEAP32[HEAP32[r33>>2]+(r37<<2)>>2]=0;HEAP32[HEAP32[r38>>2]+(r37<<2)>>2]=0;r9=r37+1|0;if((r9|0)<(HEAP32[r10]|0)){r37=r9}else{break L729}}}}while(0);r10=r39+1|0;r38=HEAP32[r7];if((r10|0)<(r38|0)){r39=r10}else{r43=r38;break L720}}if(r2==535){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==537){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}else{r43=r41}}while(0);r41=HEAP32[r6];if((r41|0)>0){r42=r1+4|0;r39=0;r40=r41;while(1){r41=HEAP32[r42>>2];r38=r41+(r39*24&-1)|0;r10=r38|0;if((HEAP32[r10>>2]|0)>0){r33=r41+(r39*24&-1)+8|0;r41=0;while(1){HEAP32[HEAP32[HEAP32[HEAP32[r33>>2]+(r41<<2)>>2]+8>>2]>>2]=r38;r37=r41+1|0;if((r37|0)<(HEAP32[r10>>2]|0)){r41=r37}else{break}}r44=HEAP32[r6]}else{r44=r40}r41=r39+1|0;if((r41|0)<(r44|0)){r39=r41;r40=r44}else{break}}r45=HEAP32[r7]}else{r45=r43}if((r45|0)<=0){STACKTOP=r3;return}r45=r1+20|0;r43=0;while(1){r44=HEAP32[r45>>2];r40=r44+(r43*20&-1)|0;r39=(r44+(r43*20&-1)+8|0)>>2;r6=r44+(r43*20&-1)+4|0;r44=(r40|0)>>2;r42=0;r41=HEAP32[HEAP32[r39]>>2];while(1){if((r41|0)==0){___assert_func(69436,707,70576,69188)}r10=r41+8|0;r38=r41|0;r33=HEAP32[r38>>2];r37=0;while(1){if((r37|0)>=(r33|0)){break}if((HEAP32[HEAP32[r10>>2]+(r37<<2)>>2]|0)==(r40|0)){break}else{r37=r37+1|0}}if((r37|0)==(r33|0)){___assert_func(69436,713,70576,69088)}if((r37|0)==0){r46=HEAP32[r38>>2]}else{r46=r37}r10=HEAP32[HEAP32[r41+4>>2]+(r46-1<<2)>>2];HEAP32[HEAP32[r6>>2]+(r42<<2)>>2]=r10;r47=r42+1|0;if((r47|0)==(HEAP32[r44]|0)){r48=r47;break}r9=HEAP32[r10+8>>2];if((r9|0)==(r41|0)){r49=HEAP32[r10+12>>2]}else{r49=r9}HEAP32[HEAP32[r39]+(r47<<2)>>2]=r49;r9=HEAP32[HEAP32[r39]+(r47<<2)>>2];if((r9|0)==0){r2=565;break}else{r42=r47;r41=r9}}if(r2==565){r2=0;r48=HEAP32[r44]}L776:do{if((r47|0)!=(r48|0)){r41=0;while(1){r42=HEAP32[HEAP32[r39]+(r41<<2)>>2];if((r42|0)==0){___assert_func(69436,744,70576,69188)}r9=r42+8|0;r10=HEAP32[r42>>2];r34=0;while(1){if((r34|0)>=(r10|0)){break}if((HEAP32[HEAP32[r9>>2]+(r34<<2)>>2]|0)==(r40|0)){break}else{r34=r34+1|0}}if((r34|0)==(r10|0)){___assert_func(69436,750,70576,69088)}r9=HEAP32[HEAP32[r42+4>>2]+(r34<<2)>>2];if((r41|0)==0){r50=HEAP32[r44]}else{r50=r41}r36=r50-1|0;HEAP32[HEAP32[r6>>2]+(r36<<2)>>2]=r9;if((r36|0)==(r47|0)){break L776}r35=HEAP32[r9+8>>2];if((r35|0)==(r42|0)){r51=HEAP32[r9+12>>2]}else{r51=r35}HEAP32[HEAP32[r39]+(r36<<2)>>2]=r51;if((HEAP32[HEAP32[r39]+(r36<<2)>>2]|0)!=0){r41=r36;continue}___assert_func(69436,767,70576,69016);r41=r36}}}while(0);r39=r43+1|0;r52=HEAP32[r7];if((r39|0)<(r52|0)){r43=r39}else{break}}if((r52|0)<=0){STACKTOP=r3;return}r43=(r1+32|0)>>2;r7=(r1+24|0)>>2;r51=(r1+36|0)>>2;r47=(r1+28|0)>>2;r50=HEAP32[r1+20>>2];r1=0;while(1){if((r1|0)==0){r48=HEAP32[r50+12>>2];HEAP32[r43]=r48;HEAP32[r7]=r48;r48=HEAP32[r50+16>>2];HEAP32[r51]=r48;HEAP32[r47]=r48}else{r48=HEAP32[r7];r2=r50+(r1*20&-1)+12|0;r49=HEAP32[r2>>2];HEAP32[r7]=(r48|0)<(r49|0)?r48:r49;r49=HEAP32[r43];r48=HEAP32[r2>>2];HEAP32[r43]=(r49|0)>(r48|0)?r49:r48;r48=HEAP32[r47];r49=r50+(r1*20&-1)+16|0;r2=HEAP32[r49>>2];HEAP32[r47]=(r48|0)<(r2|0)?r48:r2;r2=HEAP32[r51];r48=HEAP32[r49>>2];HEAP32[r51]=(r2|0)>(r48|0)?r2:r48}r48=r1+1|0;if((r48|0)<(r52|0)){r1=r48}else{break}}STACKTOP=r3;return}function _fatal(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3;_fwrite(69160,13,1,HEAP32[_stderr>>2]);HEAP32[r4>>2]=r2;_fprintf(HEAP32[_stderr>>2],r1,HEAP32[r4>>2]);_fputc(10,HEAP32[_stderr>>2]);_exit(1)}function _canvas_text_fallback(r1,r2,r3){r3=STACKTOP;r1=HEAP32[r2>>2];r2=_malloc(_strlen(r1)+1|0);if((r2|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r2,r1);STACKTOP=r3;return r2}}function _white_sort_cmpfn(r1,r2){var r3,r4,r5;r3=HEAP32[r2>>2];r4=HEAP32[r1>>2];if((r3|0)!=(r4|0)){r5=r3-r4|0;return r5}r4=HEAP32[r1+8>>2];r3=HEAP32[r2+8>>2];if(r4>>>0<r3>>>0){r5=-1;return r5}if(r4>>>0>r3>>>0){r5=1;return r5}r5=(r1-r2|0)/12&-1;return r5}function _black_sort_cmpfn(r1,r2){var r3,r4,r5;r3=HEAP32[r2+4>>2];r4=HEAP32[r1+4>>2];if((r3|0)!=(r4|0)){r5=r3-r4|0;return r5}r4=HEAP32[r1+8>>2];r3=HEAP32[r2+8>>2];if(r4>>>0<r3>>>0){r5=-1;return r5}if(r4>>>0>r3>>>0){r5=1;return r5}r5=(r1-r2|0)/12&-1;return r5}
function _generate_loop(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66;r6=0;r7=STACKTOP;STACKTOP=STACKTOP+112|0;r8=r7;r9=r7+4;r10=r7+8;r11=r7+12;r12=r7+16;r13=HEAP32[r1>>2];_memset(r2,1,r13);r14=_malloc(r13*12&-1);if((r14|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r15=r14,r16=r15>>2;r17=(r13|0)>0;L842:do{if(r17){r18=(r3+60|0)>>2;r19=r3|0;r20=r3+40|0;r21=r12|0;r22=r12+4|0;r23=r12+8|0;r24=r12+12|0;r25=r12+16|0;r26=r12+84|0;r27=r12+92|0;r28=r12+88|0;r29=0;while(1){r30=0;r31=0;r32=HEAP32[r18];while(1){if((r32|0)>19){r33=0;while(1){r34=r3+r33|0;r35=HEAP8[r34];if(r35<<24>>24!=-1){r6=621;break}HEAP8[r34]=0;r36=r33+1|0;if((r36|0)<20){r33=r36}else{break}}if(r6==621){r6=0;HEAP8[r34]=r35+1&255}HEAP32[r21>>2]=1732584193;HEAP32[r22>>2]=-271733879;HEAP32[r23>>2]=-1732584194;HEAP32[r24>>2]=271733878;HEAP32[r25>>2]=-1009589776;HEAP32[r26>>2]=0;HEAP32[r27>>2]=0;HEAP32[r28>>2]=0;_SHA_Bytes(r12,r19,40);_SHA_Final(r12,r20);HEAP32[r18]=0;r37=0}else{r37=r32}r33=r37+1|0;HEAP32[r18]=r33;r38=HEAPU8[r3+(r37+40)|0]|r30<<8;r36=r31+8|0;if((r36|0)<31){r30=r38;r31=r36;r32=r33}else{break}}HEAP32[((r29*12&-1)+8>>2)+r16]=r38&2147483647;HEAP32[((r29*12&-1)>>2)+r16]=0;HEAP32[((r29*12&-1)+4>>2)+r16]=0;r32=r29+1|0;if((r32|0)==(r13|0)){r39=0;break L842}else{r29=r32}}}else{r39=0}}while(0);while(1){if((r13>>>(r39>>>0)|0)==0){break}else{r39=r39+1|0}}r38=r39+3|0;if((r38|0)>=32){___assert_func(68096,275,70160,69276)}r39=Math.floor((1<<r38>>>0)/(r13>>>0));r37=Math.imul(r39,r13);while(1){r40=_random_bits(r3,r38);if(r40>>>0<r37>>>0){break}}r37=r2+Math.floor((r40>>>0)/(r39>>>0))|0;HEAP8[r37]=0;r37=_malloc(8);if((r37|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r39=r37;r40=r37;HEAP32[r40>>2]=0;r38=(r37+4|0)>>2;HEAP32[r38]=72;r12=_malloc(8);if((r12|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r35=r12;r34=r12>>2;HEAP32[r34]=0;r29=(r12+4|0)>>2;HEAP32[r29]=76;r18=(r1+4|0)>>2;L872:do{if(r17){r20=0;while(1){r19=HEAP32[r18];r28=r19+(r20*24&-1)|0;r27=r15+(r20*12&-1)|0;do{if(HEAP8[r2+r20|0]<<24>>24==1){do{if((_can_colour_face(r1,r2,r20,2)|0)!=0){r26=HEAP32[r28>>2];L879:do{if((r26|0)>0){r25=HEAP32[r19+(r20*24&-1)+4>>2];r24=0;r23=0;while(1){r22=HEAP32[r25+(r24<<2)>>2];r21=HEAP32[r22+8>>2];if((r21|0)==(r28|0)){r41=HEAP32[r22+12>>2]}else{r41=r21}if((r41|0)==0){r42=1}else{r42=HEAP8[r2+((r41-HEAP32[r18]|0)/24&-1)|0]<<24>>24==2}r21=(r42&1)+r23|0;r22=r24+1|0;if((r22|0)==(r26|0)){r43=r21;break L879}else{r24=r22;r23=r21}}}else{r43=0}}while(0);HEAP32[((r20*12&-1)+4>>2)+r16]=-r43|0;if((HEAP32[r29]|0)==0){break}_add234_internal(r35,r27,-1)}}while(0);if((_can_colour_face(r1,r2,r20,0)|0)==0){break}r26=HEAP32[r28>>2];L893:do{if((r26|0)>0){r23=HEAP32[r19+(r20*24&-1)+4>>2];r24=0;r25=0;while(1){r21=HEAP32[r23+(r24<<2)>>2];r22=HEAP32[r21+8>>2];if((r22|0)==(r28|0)){r44=HEAP32[r21+12>>2]}else{r44=r22}if((r44|0)==0){r45=0}else{r45=HEAP8[r2+((r44-HEAP32[r18]|0)/24&-1)|0]<<24>>24==0}r22=(r45&1)+r25|0;r21=r24+1|0;if((r21|0)==(r26|0)){r46=r22;break L893}else{r24=r21;r25=r22}}}else{r46=0}}while(0);HEAP32[r27>>2]=-r46|0;if((HEAP32[r38]|0)==0){break}_add234_internal(r39,r27,-1)}}while(0);r27=r20+1|0;if((r27|0)==(r13|0)){break L872}else{r20=r27}}}}while(0);r46=(r4|0)!=0;r45=r14;L907:while(1){r47=HEAP32[r40>>2],r44=r47>>2;if((r47|0)==0){r48=0}else{r48=HEAP32[r44+6]+HEAP32[r44+5]+HEAP32[r44+7]+HEAP32[r44+8]+((HEAP32[r44+9]|0)!=0&1)+((HEAP32[r44+10]|0)!=0&1)+((HEAP32[r44+11]|0)!=0&1)|0}r44=HEAP32[r34],r43=r44>>2;if((r44|0)==0){r49=1}else{r49=(HEAP32[r43+6]+HEAP32[r43+5]+HEAP32[r43+7]+HEAP32[r43+8]+((HEAP32[r43+9]|0)!=0&1)+((HEAP32[r43+10]|0)!=0&1)|0)==(-((HEAP32[r43+11]|0)!=0&1)|0)}r43=(r48|0)==0;if(r43&r49){break}do{if(r43|r49){___assert_func(69104,374,70632,69400);break}}while(0);while(1){r50=_random_bits(r3,5);if(r50>>>0<32){break}}r43=r50>>>0>15;r44=r43?0:2;r42=r43?r39:r35;r43=_index234(r42,0);L921:do{if(r46){if((r43|0)==0){r6=675;break}r41=r44&255;r20=0;r27=0;r28=0;r19=r43;while(1){r26=(r19-r45|0)/12&-1;r25=r2+r26|0;if(HEAP8[r25]<<24>>24!=1){___assert_func(69104,401,70632,68192)}HEAP8[r25]=r41;r24=FUNCTION_TABLE[r4](r5,r2,r26);HEAP8[r25]=1;FUNCTION_TABLE[r4](r5,r2,r26);r26=(r20|0)==0|(r24|0)>(r27|0);r25=r26?r19:r20;r23=r28+1|0;r22=_index234(r42,r23);if((r22|0)==0){r51=r25;r6=674;break L921}else{r20=r25;r27=r26?r24:r27;r28=r23;r19=r22}}}else{r51=r43;r6=674;break}}while(0);do{if(r6==674){r6=0;if((r51|0)==0){r6=675;break}else{r52=r51;break}}}while(0);if(r6==675){r6=0;___assert_func(69104,416,70632,68588);r52=0}r43=(r52-r45|0)/12&-1;r42=r2+r43|0;if(HEAP8[r42]<<24>>24!=1){___assert_func(69104,418,70632,67600)}HEAP8[r42]=r44&255;if(r46){FUNCTION_TABLE[r4](r5,r2,r43)}r42=r52;if((_findrelpos234(r39,r42,0,0,r11)|0)!=0){_delpos234_internal(r39,HEAP32[r11>>2])}if((_findrelpos234(r35,r42,0,0,r10)|0)!=0){_delpos234_internal(r35,HEAP32[r10>>2])}r42=HEAP32[r18];r19=r42+(r43*24&-1)|0;r28=r19|0;r27=HEAP32[r28>>2];if((r27|0)<=0){continue}r20=r42+(r43*24&-1)+8|0;r43=0;r42=r27;while(1){r27=HEAP32[HEAP32[r20>>2]+(r43<<2)>>2];r41=r27|0;if((HEAP32[r41>>2]|0)>0){r22=r27+8|0;r27=0;while(1){r23=HEAP32[HEAP32[r22>>2]+(r27<<2)>>2],r24=r23>>2;do{if(!((r23|0)==0|(r23|0)==(r19|0))){r26=(r23-HEAP32[r18]|0)/24&-1;if(HEAP8[r2+r26|0]<<24>>24!=1){break}r25=r15+(r26*12&-1)|0;r21=r25;if((_findrelpos234(r39,r21,0,0,r9)|0)!=0){_delpos234_internal(r39,HEAP32[r9>>2])}do{if((_can_colour_face(r1,r2,r26,0)|0)!=0){r32=HEAP32[r24];L962:do{if((r32|0)>0){r31=HEAP32[r24+1];r30=0;r33=0;while(1){r36=HEAP32[r31+(r30<<2)>>2];r53=HEAP32[r36+8>>2];if((r53|0)==(r23|0)){r54=HEAP32[r36+12>>2]}else{r54=r53}if((r54|0)==0){r55=0}else{r55=HEAP8[r2+((r54-HEAP32[r18]|0)/24&-1)|0]<<24>>24==0}r53=(r55&1)+r33|0;r36=r30+1|0;if((r36|0)==(r32|0)){r56=r53;break L962}else{r30=r36;r33=r53}}}else{r56=0}}while(0);HEAP32[r25>>2]=-r56|0;if((HEAP32[r38]|0)==0){break}_add234_internal(r39,r21,-1)}}while(0);if((_findrelpos234(r35,r21,0,0,r8)|0)!=0){_delpos234_internal(r35,HEAP32[r8>>2])}if((_can_colour_face(r1,r2,r26,2)|0)==0){break}r25=HEAP32[r24];L979:do{if((r25|0)>0){r32=HEAP32[r24+1];r33=0;r30=0;while(1){r31=HEAP32[r32+(r33<<2)>>2];r53=HEAP32[r31+8>>2];if((r53|0)==(r23|0)){r57=HEAP32[r31+12>>2]}else{r57=r53}if((r57|0)==0){r58=1}else{r58=HEAP8[r2+((r57-HEAP32[r18]|0)/24&-1)|0]<<24>>24==2}r53=(r58&1)+r30|0;r31=r33+1|0;if((r31|0)==(r25|0)){r59=r53;break L979}else{r33=r31;r30=r53}}}else{r59=0}}while(0);HEAP32[((r26*12&-1)+4>>2)+r16]=-r59|0;if((HEAP32[r29]|0)==0){break}_add234_internal(r35,r21,-1)}}while(0);r23=r27+1|0;if((r23|0)<(HEAP32[r41>>2]|0)){r27=r23}else{break}}r60=HEAP32[r28>>2]}else{r60=r42}r27=r43+1|0;if((r27|0)<(r60|0)){r43=r27;r42=r60}else{continue L907}}}_freenode234(r47);_free(r37);_freenode234(HEAP32[r34]);_free(r12);_free(r14);r14=_malloc(r13<<2);if((r14|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r12=r14;L998:do{if(r17){r34=0;while(1){HEAP32[r12+(r34<<2)>>2]=r34;r37=r34+1|0;if((r37|0)==(r13|0)){break L998}else{r34=r37}}}}while(0);_shuffle(r14,r13,4,r3);r34=0;while(1){L1004:do{if(r17){r37=(r34|0)==0;r47=0;r60=0;while(1){r35=HEAP32[r12+(r60<<2)>>2];r29=r2+r35|0;r59=HEAP8[r29]<<24>>24==0?2:0;do{if((_can_colour_face(r1,r2,r35,r59)|0)==0){r61=r47}else{if(!r37){while(1){r62=_random_bits(r3,7);if(r62>>>0<120){break}}if(r62>>>0>=12){r61=r47;break}HEAP8[r29]=r59&255;r61=r47;break}r21=HEAP32[r18];r26=r21+(r35*24&-1)|0;r16=HEAP32[r26>>2];if((r16|0)<=0){r61=r47;break}r58=HEAP32[r21+(r35*24&-1)+4>>2];r57=0;r8=0;while(1){r39=HEAP32[r58+(r57<<2)>>2];r38=HEAP32[r39+8>>2];if((r38|0)==(r26|0)){r63=HEAP32[r39+12>>2]}else{r63=r38}if((r63|0)==0){r64=2}else{r64=HEAP8[r2+((r63-r21|0)/24&-1)|0]<<24>>24}r65=((r64|0)==(r59|0)&1)+r8|0;r38=r57+1|0;if((r38|0)==(r16|0)){break}else{r57=r38;r8=r65}}if((r65|0)!=1){r61=r47;break}HEAP8[r29]=r59&255;r61=1}}while(0);r59=r60+1|0;if((r59|0)==(r13|0)){r66=r61;break L1004}else{r47=r61;r60=r59}}}else{r66=0}}while(0);if((r34|0)!=0){break}r34=(r66|0)==0&1}_free(r14);STACKTOP=r7;return}function _can_colour_face(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52;r5=0;r6=(r1+4|0)>>2;r1=HEAP32[r6];r7=r1+(r3*24&-1)|0;if((HEAP8[r2+r3|0]<<24>>24|0)==(r4|0)){___assert_func(69104,88,70820,67200)}r8=(r7|0)>>2;r9=HEAP32[r8];r10=r1+(r3*24&-1)+4|0;r11=0;while(1){if((r11|0)>=(r9|0)){r12=0;r5=781;break}r13=HEAP32[HEAP32[r10>>2]+(r11<<2)>>2];r14=HEAP32[r13+8>>2];if((r14|0)==(r7|0)){r15=HEAP32[r13+12>>2]}else{r15=r14}if((r15|0)==0){r16=2}else{r16=HEAP8[r2+((r15-HEAP32[r6]|0)/24&-1)|0]<<24>>24}if((r16|0)==(r4|0)){break}else{r11=r11+1|0}}if(r5==781){return r12}r5=(r1+(r3*24&-1)+8|0)>>2;r3=HEAP32[r5];r1=HEAP32[r3>>2];r11=HEAP32[r1+8>>2];r16=HEAP32[r11>>2];if((r16|0)==(r7|0)){r17=1;r18=HEAP32[r11+4>>2]}else{r17=0;r18=r16}if((r18|0)==0){r19=2}else{r19=HEAP8[r2+((r18-HEAP32[r6]|0)/24&-1)|0]<<24>>24}r16=0;r11=r17;r17=(r19|0)==(r4|0)&1;r19=0;r15=r18;r18=0;r10=r3;r3=r1;while(1){if((r19|0)!=0){r20=r16;r21=r11;r22=r17;r23=0;r24=r15;r25=r10;r26=r3;break}r1=r11+1|0;r9=(r1|0)==(HEAP32[r3>>2]|0)?0:r1;r1=HEAP32[HEAP32[r3+8>>2]+(r9<<2)>>2];L1056:do{if((r1|0)==(r7|0)){r14=r16;r13=r10;while(1){r27=r14+1|0;r28=(r27|0)==(HEAP32[r8]|0)?0:r27;r27=HEAP32[r13+(r28<<2)>>2];r29=HEAP32[r27>>2];r30=r27+8|0;r31=0;while(1){if((r31|0)>=(r29|0)){break}if((HEAP32[HEAP32[r30>>2]+(r31<<2)>>2]|0)==(r15|0)){break}else{r31=r31+1|0}}if((r31|0)==(r29|0)){___assert_func(69104,183,70820,67004);r30=HEAP32[r5];r32=HEAP32[r30+(r28<<2)>>2];r33=r30;r34=r32;r35=HEAP32[r32>>2]}else{r33=r13;r34=r27;r35=r29}r32=r31+1|0;r30=(r32|0)==(r35|0)?0:r32;r32=HEAP32[HEAP32[r34+8>>2]+(r30<<2)>>2];if((r32|0)==(r7|0)){r14=r28;r13=r33}else{r36=r28;r37=r30;r38=r32;r39=r33;break L1056}}}else{r36=r16;r37=r9;r38=r1;r39=r10}}while(0);if((r38|0)==0){r40=2}else{r40=HEAP8[r2+((r38-HEAP32[r6]|0)/24&-1)|0]<<24>>24}r1=HEAP32[r39+(r36<<2)>>2];r16=r36;r11=r37;r17=(r40|0)==(r4|0)&1;r19=r1;r15=r38;r18=r38;r10=r39;r3=r1}while(1){r3=r21+1|0;r39=(r3|0)==(HEAP32[r26>>2]|0)?0:r3;r3=HEAP32[HEAP32[r26+8>>2]+(r39<<2)>>2];L1072:do{if((r3|0)==(r7|0)){r10=r20;r38=r25;while(1){r15=r10+1|0;r40=(r15|0)==(HEAP32[r8]|0)?0:r15;r15=HEAP32[r38+(r40<<2)>>2];r17=HEAP32[r15>>2];r37=r15+8|0;r11=0;while(1){if((r11|0)>=(r17|0)){break}if((HEAP32[HEAP32[r37>>2]+(r11<<2)>>2]|0)==(r24|0)){break}else{r11=r11+1|0}}if((r11|0)==(r17|0)){___assert_func(69104,183,70820,67004);r37=HEAP32[r5];r28=HEAP32[r37+(r40<<2)>>2];r41=r37;r42=r28;r43=HEAP32[r28>>2]}else{r41=r38;r42=r15;r43=r17}r28=r11+1|0;r37=(r28|0)==(r43|0)?0:r28;r28=HEAP32[HEAP32[r42+8>>2]+(r37<<2)>>2];if((r28|0)==(r7|0)){r10=r40;r38=r41}else{r44=r40;r45=r37;r46=r28;r47=r41;r48=r42;break L1072}}}else{r44=r20;r45=r39;r46=r3;r47=r25;r48=r26}}while(0);if((r46|0)==0){r49=2}else{r49=HEAP8[r2+((r46-HEAP32[r6]|0)/24&-1)|0]<<24>>24}r3=(r49|0)==(r4|0)&1;if((r3|0)==(r22|0)){r50=r22;r51=r23}else{r39=r23+1|0;if((r39|0)>2){r52=r39;break}else{r50=r3;r51=r39}}if((r48|0)==(r19|0)&(r46|0)==(r18|0)){r52=r51;break}else{r20=r44;r21=r45;r22=r50;r23=r51;r24=r46;r25=r47;r26=r48}}r12=(r52|0)==2&1;return r12}function _midend_size(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r5=r1>>2;r6=STACKTOP;STACKTOP=STACKTOP+8|0;r7=r6;r8=r6+4;r9=(r1+76|0)>>2;r10=HEAP32[r9];do{if((r10|0)!=0){if((HEAP32[r5+33]|0)<=0){break}r11=r1+8|0;r12=r1+120|0;FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+140>>2]](HEAP32[r12>>2],r10);r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+136>>2]](HEAP32[r12>>2],HEAP32[HEAP32[r5+16]>>2]);HEAP32[r9]=r13}}while(0);r10=(r4|0)!=0;L1096:do{if(r10){r4=r1+8|0;r13=r1+68|0;r12=1;while(1){r11=r12<<1;FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+124>>2]](HEAP32[r13>>2],r11,r7,r8);if((HEAP32[r7>>2]|0)>(HEAP32[r2>>2]|0)){r14=r11;r15=r4,r16=r15>>2;r17=r13,r18=r17>>2;break L1096}if((HEAP32[r8>>2]|0)>(HEAP32[r3>>2]|0)){r14=r11;r15=r4,r16=r15>>2;r17=r13,r18=r17>>2;break L1096}else{r12=r11}}}else{r14=HEAP32[r5+32]+1|0;r15=r1+8|0,r16=r15>>2;r17=r1+68|0,r18=r17>>2}}while(0);r17=1;r15=r14;L1103:while(1){r19=r17;while(1){if((r15-r19|0)<=1){break L1103}r14=(r19+r15|0)/2&-1;FUNCTION_TABLE[HEAP32[HEAP32[r16]+124>>2]](HEAP32[r18],r14,r7,r8);if((HEAP32[r7>>2]|0)>(HEAP32[r2>>2]|0)){r17=r19;r15=r14;continue L1103}if((HEAP32[r8>>2]|0)>(HEAP32[r3>>2]|0)){r17=r19;r15=r14;continue L1103}else{r19=r14}}}r15=r1+132|0;HEAP32[r15>>2]=r19;if(r10){HEAP32[r5+32]=r19}if((r19|0)>0){r10=r1+136|0;r17=r1+140|0;FUNCTION_TABLE[HEAP32[HEAP32[r16]+124>>2]](HEAP32[r18],r19,r10,r17);FUNCTION_TABLE[HEAP32[HEAP32[r16]+128>>2]](HEAP32[r5+30],HEAP32[r9],HEAP32[r18],HEAP32[r15>>2]);r15=r10;r10=r17;r17=HEAP32[r15>>2];HEAP32[r2>>2]=r17;r18=HEAP32[r10>>2];HEAP32[r3>>2]=r18;STACKTOP=r6;return}else{r15=r1+136|0;r10=r1+140|0;r17=HEAP32[r15>>2];HEAP32[r2>>2]=r17;r18=HEAP32[r10>>2];HEAP32[r3>>2]=r18;STACKTOP=r6;return}}function _midend_set_params(r1,r2){var r3,r4;r3=r1+8|0;r4=r1+68|0;FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+28>>2]](HEAP32[r4>>2]);r1=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+32>>2]](r2);HEAP32[r4>>2]=r1;return}function _midend_get_params(r1){return FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+32>>2]](HEAP32[r1+68>>2])}function _midend_force_redraw(r1){var r2,r3,r4,r5,r6,r7;r2=(r1+76|0)>>2;r3=HEAP32[r2];r4=(r1+8|0)>>2;if((r3|0)==0){r5=r1+120|0}else{r6=r1+120|0;FUNCTION_TABLE[HEAP32[HEAP32[r4]+140>>2]](HEAP32[r6>>2],r3);r5=r6}r6=FUNCTION_TABLE[HEAP32[HEAP32[r4]+136>>2]](HEAP32[r5>>2],HEAP32[HEAP32[r1+64>>2]>>2]);HEAP32[r2]=r6;r6=r1+132|0;r3=HEAP32[r6>>2];if((r3|0)<=0){_midend_redraw(r1);return}r7=r1+68|0;FUNCTION_TABLE[HEAP32[HEAP32[r4]+124>>2]](HEAP32[r7>>2],r3,r1+136|0,r1+140|0);FUNCTION_TABLE[HEAP32[HEAP32[r4]+128>>2]](HEAP32[r5>>2],HEAP32[r2],HEAP32[r7>>2],HEAP32[r6>>2]);_midend_redraw(r1);return}function _midend_redraw(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r2=r1>>2;r3=0;r4=(r1+120|0)>>2;if((HEAP32[r4]|0)==0){___assert_func(68180,869,70236,69512)}r5=(r1+60|0)>>2;if((HEAP32[r5]|0)<=0){return}r6=(r1+76|0)>>2;if((HEAP32[r6]|0)==0){return}r7=HEAP32[r4];FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+32>>2]](HEAP32[r7+4>>2]);r7=r1+84|0;r8=HEAP32[r7>>2];do{if((r8|0)==0){r3=824}else{r9=HEAPF32[r2+22];if(r9<=0){r3=824;break}r10=r1+92|0;r11=HEAPF32[r10>>2];if(r11>=r9){r3=824;break}r9=r1+104|0;r12=HEAP32[r9>>2];if((r12|0)==0){___assert_func(68180,875,70236,69444);r13=HEAP32[r7>>2];r14=HEAP32[r9>>2];r15=HEAPF32[r10>>2]}else{r13=r8;r14=r12;r15=r11}FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+144>>2]](HEAP32[r4],HEAP32[r6],r13,HEAP32[HEAP32[r2+16]+((HEAP32[r5]-1)*12&-1)>>2],r14,HEAP32[r2+20],r15,HEAPF32[r2+25]);break}}while(0);if(r3==824){FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+144>>2]](HEAP32[r4],HEAP32[r6],0,HEAP32[HEAP32[r2+16]+((HEAP32[r5]-1)*12&-1)>>2],1,HEAP32[r2+20],0,HEAPF32[r2+25])}r2=HEAP32[r4];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+36>>2]](HEAP32[r2+4>>2]);return}function _midend_new(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r5=STACKTOP;STACKTOP=STACKTOP+164|0;r6=r5;r7=r5+80;r8=r5+160;r9=_malloc(144),r10=r9>>2;if((r9|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r11=r9;r12=_malloc(8);if((r12|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_gettimeofday(r12,0);HEAP32[r10]=r1;r1=(r9+8|0)>>2;HEAP32[r1]=r2;r13=_random_new(r12,8);HEAP32[r10+1]=r13;r13=(r9+52|0)>>2;HEAP32[r13]=0;HEAP32[r13+1]=0;HEAP32[r13+2]=0;HEAP32[r13+3]=0;r13=FUNCTION_TABLE[HEAP32[r2+12>>2]]();r14=r9+68|0;HEAP32[r14>>2]=r13;r13=r6|0;_sprintf(r13,68972,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r1]>>2],tempInt));r15=HEAP8[r13];L1157:do{if(r15<<24>>24==0){r16=0}else{r17=0;r18=0;r19=r13;r20=r15;while(1){if((_isspace(r20&255)|0)==0){r21=_toupper(HEAPU8[r19])&255;HEAP8[r6+r17|0]=r21;r22=r17+1|0}else{r22=r17}r21=r18+1|0;r23=r6+r21|0;r24=HEAP8[r23];if(r24<<24>>24==0){r16=r22;break L1157}else{r17=r22;r18=r21;r19=r23;r20=r24}}}}while(0);HEAP8[r6+r16|0]=0;r16=_getenv(r13);if((r16|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r1]+20>>2]](HEAP32[r14>>2],r16)}HEAP32[r10+18]=0;r16=(r9+32|0)>>2;HEAP32[r16]=0;HEAP32[r16+1]=0;HEAP32[r16+2]=0;HEAP32[r16+3]=0;HEAP32[r10+12]=2;r16=(r9+12|0)>>2;HEAP32[r10+31]=0;HEAP32[r10+35]=0;HEAP32[r10+34]=0;HEAP32[r10+33]=0;HEAP32[r16]=0;HEAP32[r16+1]=0;HEAP32[r16+2]=0;HEAP32[r16+3]=0;HEAP32[r16+4]=0;_memset(r9+76|0,0,44);do{if((r3|0)==0){HEAP32[r10+30]=0}else{r16=_malloc(32),r14=r16>>2;if((r16|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r14]=r3;HEAP32[r14+1]=r4;HEAP32[r14+2]=0;HEAP32[r14+4]=0;HEAP32[r14+3]=0;HEAPF32[r14+5]=1;HEAP32[r14+6]=r11;HEAP32[r14+7]=0;HEAP32[r10+30]=r16;break}}}while(0);r10=r9+128|0;HEAP32[r10>>2]=HEAP32[r2+120>>2];r2=r7|0;_sprintf(r2,69388,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r1]>>2],tempInt));r1=HEAP8[r2];L1174:do{if(r1<<24>>24==0){r25=0}else{r9=0;r4=0;r3=r2;r16=r1;while(1){if((_isspace(r16&255)|0)==0){r14=_toupper(HEAPU8[r3])&255;HEAP8[r7+r4|0]=r14;r26=r4+1|0}else{r26=r4}r14=r9+1|0;r13=r7+r14|0;r6=HEAP8[r13];if(r6<<24>>24==0){r25=r26;break L1174}else{r9=r14;r4=r26;r3=r13;r16=r6}}}}while(0);HEAP8[r7+r25|0]=0;r25=_getenv(r2);if((r25|0)==0){_free(r12);STACKTOP=r5;return r11}r2=(_sscanf(r25,68564,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r8,tempInt))|0)==1;r25=HEAP32[r8>>2];if(!(r2&(r25|0)>0)){_free(r12);STACKTOP=r5;return r11}HEAP32[r10>>2]=r25;_free(r12);STACKTOP=r5;return r11}function _midend_can_undo(r1){return(HEAP32[r1+60>>2]|0)>1&1}function _midend_can_redo(r1){return(HEAP32[r1+60>>2]|0)<(HEAP32[r1+52>>2]|0)&1}function _midend_finish_move(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r2=r1>>2;r3=0;r4=(r1+84|0)>>2;r5=HEAP32[r4];r6=(r5|0)==0;do{if(r6){if((HEAP32[r2+15]|0)>1){r3=860;break}else{break}}else{r3=860}}while(0);do{if(r3==860){r7=HEAP32[r2+26];if((r7|0)>0){r8=HEAP32[r2+15];r9=HEAP32[r2+16];if((HEAP32[r9+((r8-1)*12&-1)+8>>2]|0)==1){r10=r8;r11=r9}else{break}}else{if((r7|0)>=0){break}r9=HEAP32[r2+15];if((r9|0)>=(HEAP32[r2+13]|0)){break}r8=HEAP32[r2+16];if((HEAP32[r8+(r9*12&-1)+8>>2]|0)==1){r10=r9;r11=r8}else{break}}if(r6){r12=1;r13=HEAP32[r11+((r10-2)*12&-1)>>2]}else{r12=r7;r13=r5}r7=FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+152>>2]](r13,HEAP32[r11+((r10-1)*12&-1)>>2],r12,HEAP32[r2+20]);if(r7<=0){break}HEAPF32[r2+25]=0;HEAPF32[r2+24]=r7}}while(0);r12=HEAP32[r4];r10=r1+8|0;if((r12|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+68>>2]](r12)}HEAP32[r4]=0;r4=r1+88|0;HEAPF32[r4>>2]=0;HEAPF32[r2+23]=0;HEAP32[r2+26]=0;r1=HEAP32[r10>>2];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=875;break}else{r10=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r2+16]+((HEAP32[r2+15]-1)*12&-1)>>2],HEAP32[r2+20])|0)!=0;HEAP32[r2+27]=r10&1;if(r10){break}else{r3=875;break}}}while(0);do{if(r3==875){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r4>>2]!=0){break}_deactivate_timer(HEAP32[r2]);return}}while(0);_activate_timer(HEAP32[r2]);return}function _midend_new_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r2=r1>>2;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+104|0;r5=r4;r6=r4+16;r7=r4+20;r8=r4+100;r9=(r1+52|0)>>2;r10=HEAP32[r9];L1221:do{if((r10|0)>0){r11=r1+8|0;r12=r1+64|0;r13=r10;while(1){r14=r13-1|0;HEAP32[r9]=r14;FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+68>>2]](HEAP32[HEAP32[r12>>2]+(r14*12&-1)>>2]);r14=HEAP32[r9];r15=HEAP32[HEAP32[r12>>2]+(r14*12&-1)+4>>2];if((r15|0)==0){r16=r14}else{_free(r15);r16=HEAP32[r9]}if((r16|0)>0){r13=r16}else{r17=r16;break L1221}}}else{r17=r10}}while(0);r10=(r1+76|0)>>2;r16=HEAP32[r10];if((r16|0)==0){r18=r17}else{FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+140>>2]](HEAP32[r2+30],r16);r18=HEAP32[r9]}if((r18|0)!=0){___assert_func(68180,349,70280,67580)}r18=(r1+48|0)>>2;r16=HEAP32[r18];do{if((r16|0)==1){HEAP32[r18]=2;break}else if((r16|0)==0){HEAP32[r18]=2;r3=907;break}else{HEAP8[r5+15|0]=0;r17=r1+4|0;r13=HEAP32[r17>>2];while(1){r19=_random_bits(r13,7);if(r19>>>0<126){break}}r13=Math.floor((r19>>>0)/14)+49&255;r12=r5|0;HEAP8[r12]=r13;r13=1;while(1){r11=HEAP32[r17>>2];while(1){r20=_random_bits(r11,7);if(r20>>>0<120){break}}r11=Math.floor((r20>>>0)/12)+48&255;HEAP8[r5+r13|0]=r11;r11=r13+1|0;if((r11|0)==15){break}else{r13=r11}}r13=r1+40|0;r17=HEAP32[r13>>2];if((r17|0)!=0){_free(r17)}r17=_malloc(_strlen(r12)+1|0);if((r17|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r17,r12);HEAP32[r13>>2]=r17;r17=r1+72|0;r13=HEAP32[r17>>2];r11=r1+8|0;if((r13|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+28>>2]](r13)}r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+32>>2]](HEAP32[r2+17]);HEAP32[r17>>2]=r13;r3=907;break}}while(0);do{if(r3==907){r5=r1+32|0;r20=HEAP32[r5>>2];if((r20|0)!=0){_free(r20)}r20=r1+36|0;r19=HEAP32[r20>>2];if((r19|0)!=0){_free(r19)}r19=r1+44|0;r18=HEAP32[r19>>2];if((r18|0)!=0){_free(r18)}HEAP32[r19>>2]=0;r18=HEAP32[r2+10];r16=_random_new(r18,_strlen(r18));r18=FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+52>>2]](HEAP32[r2+18],r16,r19,(HEAP32[r2+30]|0)!=0&1);HEAP32[r5>>2]=r18;HEAP32[r20>>2]=0;if((r16|0)==0){break}_free(r16|0)}}while(0);r16=HEAP32[r9];r20=r1+56|0;do{if((r16|0)<(HEAP32[r20>>2]|0)){r18=r1+64|0,r21=r18>>2}else{r5=r16+128|0;HEAP32[r20>>2]=r5;r19=r1+64|0;r13=HEAP32[r19>>2];r17=r5*12&-1;if((r13|0)==0){r22=_malloc(r17)}else{r22=_realloc(r13,r17)}if((r22|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r19>>2]=r22;r18=r19,r21=r18>>2;break}}}while(0);r22=(r1+8|0)>>2;r20=(r1+68|0)>>2;r16=FUNCTION_TABLE[HEAP32[HEAP32[r22]+60>>2]](r1,HEAP32[r20],HEAP32[r2+8]);HEAP32[HEAP32[r21]+(HEAP32[r9]*12&-1)>>2]=r16;r16=HEAP32[r22];do{if((HEAP32[r16+72>>2]|0)!=0){r18=HEAP32[r2+11];if((r18|0)==0){break}HEAP32[r6>>2]=0;r19=HEAP32[HEAP32[r21]>>2];r17=FUNCTION_TABLE[HEAP32[r16+76>>2]](r19,r19,r18,r6);if(!((r17|0)!=0&(HEAP32[r6>>2]|0)==0)){___assert_func(68180,430,70280,67184)}r18=FUNCTION_TABLE[HEAP32[HEAP32[r22]+116>>2]](HEAP32[HEAP32[r21]>>2],r17);if((r18|0)==0){___assert_func(68180,432,70280,67e3)}FUNCTION_TABLE[HEAP32[HEAP32[r22]+68>>2]](r18);if((r17|0)==0){break}_free(r17)}}while(0);r6=HEAP32[16498];do{if((r6|0)<0){r16=r7|0;_sprintf(r16,66760,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r22]>>2],tempInt));r17=HEAP8[r16];L1295:do{if(r17<<24>>24==0){r23=0}else{r18=0;r19=0;r13=r16;r5=r17;while(1){if((_isspace(r5&255)|0)==0){r11=_toupper(HEAPU8[r13])&255;HEAP8[r7+r18|0]=r11;r24=r18+1|0}else{r24=r18}r11=r19+1|0;r15=r7+r11|0;r14=HEAP8[r15];if(r14<<24>>24==0){r23=r24;break L1295}else{r18=r24;r19=r11;r13=r15;r5=r14}}}}while(0);HEAP8[r7+r23|0]=0;if((_getenv(r16)|0)==0){HEAP32[16498]=0;break}else{_fwrite(66636,26,1,HEAP32[_stderr>>2]);HEAP32[16498]=1;r3=940;break}}else{if((r6|0)==0){break}else{r3=940;break}}}while(0);do{if(r3==940){HEAP32[r8>>2]=0;r6=HEAP32[HEAP32[r21]>>2];r23=FUNCTION_TABLE[HEAP32[HEAP32[r22]+76>>2]](r6,r6,0,r8);if(!((r23|0)!=0&(HEAP32[r8>>2]|0)==0)){___assert_func(68180,478,70280,67184)}r6=FUNCTION_TABLE[HEAP32[HEAP32[r22]+116>>2]](HEAP32[HEAP32[r21]>>2],r23);if((r6|0)==0){___assert_func(68180,480,70280,67e3)}FUNCTION_TABLE[HEAP32[HEAP32[r22]+68>>2]](r6);if((r23|0)==0){break}_free(r23)}}while(0);HEAP32[HEAP32[r21]+(HEAP32[r9]*12&-1)+4>>2]=0;HEAP32[HEAP32[r21]+(HEAP32[r9]*12&-1)+8>>2]=0;HEAP32[r9]=HEAP32[r9]+1|0;r9=r1+60|0;HEAP32[r9>>2]=1;r8=r1+120|0;r23=FUNCTION_TABLE[HEAP32[HEAP32[r22]+136>>2]](HEAP32[r8>>2],HEAP32[HEAP32[r21]>>2]);HEAP32[r10]=r23;r23=r1+132|0;r6=HEAP32[r23>>2];if((r6|0)>0){FUNCTION_TABLE[HEAP32[HEAP32[r22]+124>>2]](HEAP32[r20],r6,r1+136|0,r1+140|0);FUNCTION_TABLE[HEAP32[HEAP32[r22]+128>>2]](HEAP32[r8>>2],HEAP32[r10],HEAP32[r20],HEAP32[r23>>2])}HEAPF32[r2+28]=0;r23=r1+80|0;r20=HEAP32[r23>>2];if((r20|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r22]+96>>2]](r20)}r20=FUNCTION_TABLE[HEAP32[HEAP32[r22]+92>>2]](HEAP32[HEAP32[r21]>>2]);HEAP32[r23>>2]=r20;r23=HEAP32[r22];do{if((HEAP32[r23+180>>2]|0)==0){HEAP32[r2+27]=0;r3=953;break}else{r22=(FUNCTION_TABLE[HEAP32[r23+184>>2]](HEAP32[HEAP32[r21]+((HEAP32[r9>>2]-1)*12&-1)>>2],r20)|0)!=0;HEAP32[r2+27]=r22&1;if(r22){break}else{r3=953;break}}}while(0);do{if(r3==953){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r2+22]!=0){break}_deactivate_timer(HEAP32[r2]);r25=r1+124|0;HEAP32[r25>>2]=0;STACKTOP=r4;return}}while(0);_activate_timer(HEAP32[r2]);r25=r1+124|0;HEAP32[r25>>2]=0;STACKTOP=r4;return}function _midend_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12;r5=r1>>2;r6=(r4-515|0)>>>0<3;do{if(r6|(r4-518|0)>>>0<3){r7=HEAP32[r5+31];if((r7|0)==0){r8=1;return r8}if(r6){r9=1;r10=r7+3|0;break}else{r9=1;r10=r7+6|0;break}}else{if((r4-512|0)>>>0>=3){r9=1;r10=r4;break}r7=HEAP32[r5+31];if((r7|0)==0){r9=1;r10=r4;break}if((HEAP32[HEAP32[r5+2]+188>>2]&1<<r4-2048+(r7*3&-1)|0)==0){r9=(_midend_really_process_key(r1,r2,r3,r7+6|0)|0)!=0&1;r10=r4;break}else{r8=1;return r8}}}while(0);if((r10|0)==13|(r10|0)==10){r11=525}else{r11=r10}r10=(r11|0)==32?526:r11;r11=(r10|0)==127?8:r10;if((r9|0)==0){r12=0}else{r12=(_midend_really_process_key(r1,r2,r3,r11)|0)!=0}r3=r12&1;if((r11-518|0)>>>0<3){HEAP32[r5+31]=0;r8=r3;return r8}if((r11-512|0)>>>0>=3){r8=r3;return r8}HEAP32[r5+31]=r11;r8=r3;return r8}function _midend_restart_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r2=r1>>2;r3=0;r4=STACKTOP;r5=r1+84|0;do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=985;break}else{break}}else{r3=985}}while(0);if(r3==985){_midend_finish_move(r1);_midend_redraw(r1)}r6=(r1+60|0)>>2;r7=HEAP32[r6];if((r7|0)>0){r8=r7}else{___assert_func(68180,586,70216,66568);r8=HEAP32[r6]}if((r8|0)==1){STACKTOP=r4;return}r8=(r1+8|0)>>2;r7=r1+32|0;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8]+60>>2]](r1,HEAP32[r2+17],HEAP32[r7>>2]);do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=991;break}else{break}}else{r3=991}}while(0);if(r3==991){_midend_finish_move(r1);_midend_redraw(r1)}r5=(r1+52|0)>>2;r10=HEAP32[r5];L1378:do{if((r10|0)>(HEAP32[r6]|0)){r11=r1+64|0;r12=r10;while(1){r13=HEAP32[HEAP32[r8]+68>>2];r14=r12-1|0;HEAP32[r5]=r14;FUNCTION_TABLE[r13](HEAP32[HEAP32[r11>>2]+(r14*12&-1)>>2]);r14=HEAP32[r5];r13=HEAP32[HEAP32[r11>>2]+(r14*12&-1)+4>>2];if((r13|0)==0){r15=r14}else{_free(r13);r15=HEAP32[r5]}if((r15|0)>(HEAP32[r6]|0)){r12=r15}else{r16=r15;break L1378}}}else{r16=r10}}while(0);r10=r1+56|0;do{if((r16|0)<(HEAP32[r10>>2]|0)){r17=r16;r18=HEAP32[r2+16]}else{r15=r16+128|0;HEAP32[r10>>2]=r15;r12=r1+64|0;r11=HEAP32[r12>>2];r13=r15*12&-1;if((r11|0)==0){r19=_malloc(r13)}else{r19=_realloc(r11,r13)}if((r19|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r13=r19;HEAP32[r12>>2]=r13;r17=HEAP32[r5];r18=r13;break}}}while(0);r19=(r1+64|0)>>2;HEAP32[r18+(r17*12&-1)>>2]=r9;r9=HEAP32[r7>>2];r7=_malloc(_strlen(r9)+1|0);if((r7|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r7,r9);HEAP32[HEAP32[r19]+(HEAP32[r5]*12&-1)+4>>2]=r7;HEAP32[HEAP32[r19]+(HEAP32[r5]*12&-1)+8>>2]=3;r7=HEAP32[r5];r9=r7+1|0;HEAP32[r5]=r9;HEAP32[r6]=r9;r9=r1+80|0;r5=HEAP32[r9>>2];if((r5|0)!=0){r17=HEAP32[r19];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r5,HEAP32[r17+((r7-1)*12&-1)>>2],HEAP32[r17+(r7*12&-1)>>2])}r7=r1+88|0;HEAPF32[r7>>2]=0;_midend_finish_move(r1);_midend_redraw(r1);r1=HEAP32[r8];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=1012;break}else{r8=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r19]+((HEAP32[r6]-1)*12&-1)>>2],HEAP32[r9>>2])|0)!=0;HEAP32[r2+27]=r8&1;if(r8){break}else{r3=1012;break}}}while(0);do{if(r3==1012){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r7>>2]!=0){break}_deactivate_timer(HEAP32[r2]);STACKTOP=r4;return}}while(0);_activate_timer(HEAP32[r2]);STACKTOP=r4;return}function _midend_really_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r5=r1>>2;r6=0;r7=STACKTOP;r8=(r1+8|0)>>2;r9=(r1+60|0)>>2;r10=(r1+64|0)>>2;r11=FUNCTION_TABLE[HEAP32[HEAP32[r8]+64>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2]);r12=(r1+80|0)>>2;r13=FUNCTION_TABLE[HEAP32[HEAP32[r8]+112>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12],HEAP32[r5+19],r2,r3,r4);L1414:do{if((r13|0)==0){if((r4|0)==114|(r4|0)==82|(r4|0)==25|(r4|0)==18){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=1034;break}else{break}}else{r6=1034}}while(0);if(r6==1034){_midend_finish_move(r1);_midend_redraw(r1)}r3=HEAP32[r9];if((r3|0)>=(HEAP32[r5+13]|0)){r14=1;r6=1087;break}r2=HEAP32[r12];if((r2|0)==0){r15=r3}else{r16=HEAP32[r10];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r2,HEAP32[r16+((r3-1)*12&-1)>>2],HEAP32[r16+(r3*12&-1)>>2]);r15=HEAP32[r9]}HEAP32[r9]=r15+1|0;HEAP32[r5+26]=1;r6=1072;break}else if((r4|0)==117|(r4|0)==85|(r4|0)==31|(r4|0)==26){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=1028;break}else{break}}else{r6=1028}}while(0);if(r6==1028){_midend_finish_move(r1);_midend_redraw(r1)}r3=HEAP32[r9];r16=r3-1|0;r2=HEAP32[r10]>>2;r17=HEAP32[((r16*12&-1)+8>>2)+r2];if((r3|0)<=1){r14=1;r6=1087;break}r18=HEAP32[r12];if((r18|0)==0){r19=r3}else{FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r18,HEAP32[((r16*12&-1)>>2)+r2],HEAP32[(((r3-2)*12&-1)>>2)+r2]);r19=HEAP32[r9]}r2=r19-1|0;HEAP32[r9]=r2;HEAP32[r5+26]=-1;r20=r17;r21=r2;break}else if((r4|0)==110|(r4|0)==78|(r4|0)==14){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=1024;break}else{break}}else{r6=1024}}while(0);if(r6==1024){_midend_finish_move(r1);_midend_redraw(r1)}_midend_new_game(r1);_midend_redraw(r1);r14=1;r6=1087;break}else if((r4|0)==19){if((HEAP32[HEAP32[r8]+72>>2]|0)==0){r14=1;r6=1087;break}if((_midend_solve(r1)|0)==0){r6=1072;break}else{r14=1;r6=1087;break}}else if((r4|0)==113|(r4|0)==81|(r4|0)==17){r14=0;r6=1087;break}else{r14=1;r6=1087;break}}else{do{if(HEAP8[r13]<<24>>24==0){r22=HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2]}else{r2=FUNCTION_TABLE[HEAP32[HEAP32[r8]+116>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],r13);if((r2|0)!=0){r22=r2;break}___assert_func(68180,664,70252,66744);r22=0}}while(0);r2=HEAP32[r9];if((r22|0)==(HEAP32[HEAP32[r10]+((r2-1)*12&-1)>>2]|0)){_midend_redraw(r1);r17=HEAP32[r8];do{if((HEAP32[r17+180>>2]|0)==0){HEAP32[r5+27]=0;r6=1050;break}else{r3=(FUNCTION_TABLE[HEAP32[r17+184>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12])|0)!=0;HEAP32[r5+27]=r3&1;if(r3){break}else{r6=1050;break}}}while(0);do{if(r6==1050){if(HEAPF32[r5+24]!=0){break}if(HEAPF32[r5+22]!=0){break}_deactivate_timer(HEAP32[r5]);r14=1;r6=1087;break L1414}}while(0);_activate_timer(HEAP32[r5]);r14=1;r6=1087;break}if((r22|0)==0){r14=1;r6=1087;break}do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=1057;break}else{r23=r2;break}}else{r6=1057}}while(0);if(r6==1057){_midend_finish_move(r1);_midend_redraw(r1);r23=HEAP32[r9]}r2=(r1+52|0)>>2;r17=HEAP32[r2];L1438:do{if((r17|0)>(r23|0)){r3=r17;while(1){r16=HEAP32[HEAP32[r8]+68>>2];r18=r3-1|0;HEAP32[r2]=r18;FUNCTION_TABLE[r16](HEAP32[HEAP32[r10]+(r18*12&-1)>>2]);r18=HEAP32[r2];r16=HEAP32[HEAP32[r10]+(r18*12&-1)+4>>2];if((r16|0)==0){r24=r18}else{_free(r16);r24=HEAP32[r2]}if((r24|0)>(HEAP32[r9]|0)){r3=r24}else{r25=r24;break L1438}}}else{r25=r17}}while(0);r17=r1+56|0;do{if((r25|0)>=(HEAP32[r17>>2]|0)){r3=r25+128|0;HEAP32[r17>>2]=r3;r16=HEAP32[r10];r18=r3*12&-1;if((r16|0)==0){r26=_malloc(r18)}else{r26=_realloc(r16,r18)}if((r26|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r10]=r26;break}}}while(0);HEAP32[HEAP32[r10]+(HEAP32[r2]*12&-1)>>2]=r22;HEAP32[HEAP32[r10]+(HEAP32[r2]*12&-1)+4>>2]=r13;HEAP32[HEAP32[r10]+(HEAP32[r2]*12&-1)+8>>2]=1;r17=HEAP32[r2];r18=r17+1|0;HEAP32[r2]=r18;HEAP32[r9]=r18;HEAP32[r5+26]=1;r18=HEAP32[r12];if((r18|0)==0){r6=1072;break}r16=HEAP32[r10];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r18,HEAP32[r16+((r17-1)*12&-1)>>2],HEAP32[r16+(r17*12&-1)>>2]);r6=1072;break}}while(0);if(r6==1072){r13=HEAP32[r9];r20=HEAP32[HEAP32[r10]+((r13-1)*12&-1)+8>>2];r21=r13}else if(r6==1087){if((r11|0)==0){r27=r14;STACKTOP=r7;return r27}FUNCTION_TABLE[HEAP32[HEAP32[r8]+68>>2]](r11);r27=r14;STACKTOP=r7;return r27}do{if((r20|0)==1){r28=HEAP32[r8];r6=1077;break}else if((r20|0)==2){r14=HEAP32[r8];if((HEAP32[r14+188>>2]&512|0)==0){r6=1076;break}else{r28=r14;r6=1077;break}}else{r6=1076}}while(0);do{if(r6==1076){HEAP32[r5+21]=r11;r29=r1+88|0;r6=1079;break}else if(r6==1077){r20=FUNCTION_TABLE[HEAP32[r28+148>>2]](r11,HEAP32[HEAP32[r10]+((r21-1)*12&-1)>>2],HEAP32[r5+26],HEAP32[r12]);HEAP32[r5+21]=r11;r14=r1+88|0;if(r20<=0){r29=r14;r6=1079;break}HEAPF32[r14>>2]=r20;r30=r14;break}}while(0);if(r6==1079){HEAPF32[r29>>2]=0;_midend_finish_move(r1);r30=r29}HEAPF32[r5+23]=0;_midend_redraw(r1);r1=HEAP32[r8];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r5+27]=0;r6=1083;break}else{r8=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12])|0)!=0;HEAP32[r5+27]=r8&1;if(r8){break}else{r6=1083;break}}}while(0);do{if(r6==1083){if(HEAPF32[r5+24]!=0){break}if(HEAPF32[r30>>2]!=0){break}_deactivate_timer(HEAP32[r5]);r27=1;STACKTOP=r7;return r27}}while(0);_activate_timer(HEAP32[r5]);r27=1;STACKTOP=r7;return r27}function _midend_wants_statusbar(r1){return HEAP32[HEAP32[r1+8>>2]+176>>2]}function _midend_timer(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=r1>>2;r4=0;r5=r1+88|0;r6=HEAPF32[r5>>2];r7=r6>0;if(r7){r8=1}else{r8=HEAPF32[r3+24]>0}r9=r1+92|0;r10=HEAPF32[r9>>2]+r2;HEAPF32[r9>>2]=r10;do{if(r10>=r6|r6==0){if(r7){r4=1100;break}else{break}}else{if((HEAP32[r3+21]|0)!=0|r7^1){break}else{r4=1100;break}}}while(0);if(r4==1100){_midend_finish_move(r1)}r7=(r1+100|0)>>2;r6=HEAPF32[r7]+r2;HEAPF32[r7]=r6;r10=(r1+96|0)>>2;r9=HEAPF32[r10];if(r6>=r9|r9==0){HEAPF32[r10]=0;HEAPF32[r7]=0}if(r8){_midend_redraw(r1)}r8=(r1+108|0)>>2;do{if((HEAP32[r8]|0)!=0){r7=r1+112|0;r9=HEAPF32[r7>>2];r6=r9+r2;HEAPF32[r7>>2]=r6;if((r9&-1|0)==(r6&-1|0)){break}r6=HEAP32[r3+29];_status_bar(HEAP32[r3+30],(r6|0)==0?68984:r6)}}while(0);r2=HEAP32[r3+2];do{if((HEAP32[r2+180>>2]|0)==0){HEAP32[r8]=0;r4=1111;break}else{r1=(FUNCTION_TABLE[HEAP32[r2+184>>2]](HEAP32[HEAP32[r3+16]+((HEAP32[r3+15]-1)*12&-1)>>2],HEAP32[r3+20])|0)!=0;HEAP32[r8]=r1&1;if(r1){break}else{r4=1111;break}}}while(0);do{if(r4==1111){if(HEAPF32[r10]!=0){break}if(HEAPF32[r5>>2]!=0){break}_deactivate_timer(HEAP32[r3]);return}}while(0);_activate_timer(HEAP32[r3]);return}function _midend_colours(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r3=STACKTOP;STACKTOP=STACKTOP+92|0;r4=r3;r5=r3+80;r6=r3+84;r7=r3+88;r8=r1+8|0;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+132>>2]](HEAP32[r1>>2],r2),r1=r9>>2;if((HEAP32[r2>>2]|0)<=0){STACKTOP=r3;return r9}r10=r4|0;r11=0;while(1){_sprintf(r10,69288,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r8>>2]>>2],HEAP32[tempInt+4>>2]=r11,tempInt));r12=HEAP8[r10];L1552:do{if(r12<<24>>24==0){r13=0}else{r14=0;r15=0;r16=r10;r17=r12;while(1){if((_isspace(r17&255)|0)==0){r18=_toupper(HEAPU8[r16])&255;HEAP8[r4+r15|0]=r18;r19=r15+1|0}else{r19=r15}r18=r14+1|0;r20=r4+r18|0;r21=HEAP8[r20];if(r21<<24>>24==0){r13=r19;break L1552}else{r14=r18;r15=r19;r16=r20;r17=r21}}}}while(0);HEAP8[r4+r13|0]=0;r12=_getenv(r10);do{if((r12|0)!=0){if((_sscanf(r12,69176,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r6,HEAP32[tempInt+8>>2]=r7,tempInt))|0)!=3){break}r17=r11*3&-1;HEAPF32[(r17<<2>>2)+r1]=(HEAP32[r5>>2]>>>0)/255;HEAPF32[(r17+1<<2>>2)+r1]=(HEAP32[r6>>2]>>>0)/255;HEAPF32[(r17+2<<2>>2)+r1]=(HEAP32[r7>>2]>>>0)/255}}while(0);r12=r11+1|0;if((r12|0)<(HEAP32[r2>>2]|0)){r11=r12}else{break}}STACKTOP=r3;return r9}function _midend_which_preset(r1){var r2,r3,r4,r5;r2=FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+24>>2]](HEAP32[r1+68>>2],1);r3=r1+20|0;r4=HEAP32[r1+24>>2];r1=0;while(1){if((r1|0)>=(r4|0)){r5=-1;break}if((_strcmp(r2,HEAP32[HEAP32[r3>>2]+(r1<<2)>>2])|0)==0){r5=r1;break}else{r1=r1+1|0}}if((r2|0)==0){return r5}_free(r2);return r5}function _midend_num_presets(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+88|0;r4=r3;r5=r3+4;r6=r3+8;r7=(r1+24|0)>>2;r8=(r1+8|0)>>2;L1574:do{if((HEAP32[r7]|0)==0){if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+16>>2]](0,r4,r5)|0)==0){break}r9=(r1+28|0)>>2;r10=(r1+12|0)>>2;r11=(r1+16|0)>>2;r12=(r1+20|0)>>2;while(1){r13=HEAP32[r7];if((HEAP32[r9]|0)>(r13|0)){r14=r13}else{r15=r13+10|0;HEAP32[r9]=r15;r13=HEAP32[r10];r16=r15<<2;if((r13|0)==0){r17=_malloc(r16)}else{r17=_realloc(r13,r16)}if((r17|0)==0){r2=1147;break}HEAP32[r10]=r17;r16=HEAP32[r11];r13=HEAP32[r9]<<2;if((r16|0)==0){r18=_malloc(r13)}else{r18=_realloc(r16,r13)}if((r18|0)==0){r2=1152;break}HEAP32[r11]=r18;r13=HEAP32[r12];r16=HEAP32[r9]<<2;if((r13|0)==0){r19=_malloc(r16)}else{r19=_realloc(r13,r16)}if((r19|0)==0){r2=1157;break}HEAP32[r12]=r19;r14=HEAP32[r7]}HEAP32[HEAP32[r10]+(r14<<2)>>2]=HEAP32[r5>>2];HEAP32[HEAP32[r11]+(HEAP32[r7]<<2)>>2]=HEAP32[r4>>2];r16=FUNCTION_TABLE[HEAP32[HEAP32[r8]+24>>2]](HEAP32[r5>>2],1);HEAP32[HEAP32[r12]+(HEAP32[r7]<<2)>>2]=r16;r16=HEAP32[r7]+1|0;HEAP32[r7]=r16;if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+16>>2]](r16,r4,r5)|0)==0){break L1574}}if(r2==1152){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1147){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1157){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}}while(0);r5=r6|0;_sprintf(r5,69076,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r8]>>2],tempInt));r4=HEAP8[r5];L1602:do{if(r4<<24>>24==0){r20=0}else{r14=0;r19=0;r18=r5;r17=r4;while(1){if((_isspace(r17&255)|0)==0){r12=_toupper(HEAPU8[r18])&255;HEAP8[r6+r14|0]=r12;r21=r14+1|0}else{r21=r14}r12=r19+1|0;r11=r6+r12|0;r10=HEAP8[r11];if(r10<<24>>24==0){r20=r21;break L1602}else{r14=r21;r19=r12;r18=r11;r17=r10}}}}while(0);HEAP8[r6+r20|0]=0;r20=_getenv(r5);if((r20|0)==0){r22=HEAP32[r7];STACKTOP=r3;return r22}r5=_malloc(_strlen(r20)+1|0);if((r5|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r20);r20=HEAP8[r5];L1615:do{if(r20<<24>>24!=0){r6=(r1+28|0)>>2;r21=(r1+12|0)>>2;r4=(r1+16|0)>>2;r17=(r1+20|0)>>2;r18=r5;r19=r20;while(1){r14=r18;r10=r19;while(1){r23=r10<<24>>24==0;r24=r14+1|0;if(!(r10<<24>>24!=58&(r23^1))){break}r14=r24;r10=HEAP8[r24]}if(r23){r25=r14}else{HEAP8[r14]=0;r25=r24}r10=r25;while(1){r11=HEAP8[r10];r26=r11<<24>>24==0;r27=r10+1|0;if(r11<<24>>24!=58&(r26^1)){r10=r27}else{break}}if(r26){r28=r10}else{HEAP8[r10]=0;r28=r27}r14=FUNCTION_TABLE[HEAP32[HEAP32[r8]+12>>2]]();FUNCTION_TABLE[HEAP32[HEAP32[r8]+20>>2]](r14,r25);if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+48>>2]](r14,1)|0)==0){r11=HEAP32[r7];if((HEAP32[r6]|0)>(r11|0)){r29=r11}else{r12=r11+10|0;HEAP32[r6]=r12;r11=HEAP32[r21];r9=r12<<2;if((r11|0)==0){r30=_malloc(r9)}else{r30=_realloc(r11,r9)}if((r30|0)==0){r2=1186;break}HEAP32[r21]=r30;r9=HEAP32[r4];r11=HEAP32[r6]<<2;if((r9|0)==0){r31=_malloc(r11)}else{r31=_realloc(r9,r11)}if((r31|0)==0){r2=1191;break}HEAP32[r4]=r31;r11=HEAP32[r17];r9=HEAP32[r6]<<2;if((r11|0)==0){r32=_malloc(r9)}else{r32=_realloc(r11,r9)}if((r32|0)==0){r2=1196;break}HEAP32[r17]=r32;r29=HEAP32[r7]}HEAP32[HEAP32[r21]+(r29<<2)>>2]=r14;r9=_malloc(_strlen(r18)+1|0);if((r9|0)==0){r2=1199;break}_strcpy(r9,r18);HEAP32[HEAP32[r4]+(HEAP32[r7]<<2)>>2]=r9;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8]+24>>2]](r14,1);HEAP32[HEAP32[r17]+(HEAP32[r7]<<2)>>2]=r9;HEAP32[r7]=HEAP32[r7]+1|0}else{FUNCTION_TABLE[HEAP32[HEAP32[r8]+28>>2]](r14)}r14=HEAP8[r28];if(r14<<24>>24==0){break L1615}else{r18=r28;r19=r14}}if(r2==1196){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1199){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1191){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1186){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}}while(0);_free(r5);r22=HEAP32[r7];STACKTOP=r3;return r22}function _midend_status(r1){var r2,r3;r2=HEAP32[r1+60>>2];if((r2|0)==0){r3=1;return r3}r3=FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+156>>2]](HEAP32[HEAP32[r1+64>>2]+((r2-1)*12&-1)>>2]);return r3}function _shuffle(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r5=STACKTOP;STACKTOP=STACKTOP+512|0;if((r2|0)<=1){STACKTOP=r5;return}r6=r5|0;r7=(r3|0)>0;r8=r2;while(1){r2=0;while(1){if((r8>>>(r2>>>0)|0)==0){break}else{r2=r2+1|0}}r9=r8-1|0;r10=r2+3|0;if((r10|0)>=32){___assert_func(68096,275,70160,69276)}r11=Math.floor((1<<r10>>>0)/(r8>>>0));r12=Math.imul(r11,r8);while(1){r13=_random_bits(r4,r10);if(r13>>>0<r12>>>0){break}}r12=Math.floor((r13>>>0)/(r11>>>0));L1682:do{if((r12|0)!=(r9|0)){if(!r7){break}r10=Math.imul(r12,r3);r2=r1+Math.imul(r9,r3)|0;r14=r1+r10|0;r10=r3;while(1){r15=r10>>>0<512?r10:512;_memcpy(r6,r2,r15);_memcpy(r2,r14,r15);_memcpy(r14,r6,r15);r16=r10-r15|0;if((r16|0)>0){r2=r2+r15|0;r14=r14+r15|0;r10=r16}else{break L1682}}}}while(0);if((r9|0)>1){r8=r9}else{break}}STACKTOP=r5;return}function _penrose(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r4=HEAP32[r1>>2];r5=-r4|0;r6=((r3|0)%36|0)==0;if(!r6){___assert_func(68500,164,70076,69324)}r7=((r3|0)>0?r3+359|0:359)-r3|0;r8=360-r3-r7+(r7>>>0)%360|0;r7=(r8|0)/36&-1;r3=(r8|0)>35;L1693:do{if(r3){r8=r4;r9=r5;r10=r5;r11=r4;r12=0;while(1){r13=-r8|0;r14=r8+r11|0;r15=r10-r8|0;r16=r8+r9|0;r17=r12+1|0;if((r17|0)<(r7|0)){r8=r16;r9=r15;r10=r14;r11=r13;r12=r17}else{r18=r16;r19=r15;r20=r14;r21=r13;break L1693}}}else{r18=r4;r19=r5;r20=r5;r21=r4}}while(0);if(!r6){___assert_func(68500,164,70076,69324)}L1700:do{if(r3){r6=0;r5=0;r12=r4;r11=0;r10=0;while(1){r9=-r6|0;r8=r6+r11|0;r13=r12-r6|0;r14=r6+r5|0;r15=r10+1|0;if((r15|0)<(r7|0)){r6=r14;r5=r13;r12=r8;r11=r9;r10=r15}else{r22=r14;r23=r13;r24=r8;r25=r9;break L1700}}}else{r22=0;r23=0;r24=r4;r25=0}}while(0);if((r2|0)==0){_penrose_p2_large(r1,0,1,r21,r20,r19,r18,r25,r24,r23,r22);return 0}else{_penrose_p3_small(r1,0,1,r21,r20,r19,r18,r25,r24,r23,r22);return 0}}function _penrose_p2_large(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11){var r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r12=STACKTOP;STACKTOP=STACKTOP+64|0;r13=r12,r14=r13>>2;if((r3|0)>0){HEAP32[r14]=r4;HEAP32[r14+1]=r5;HEAP32[r14+2]=r6;HEAP32[r14+3]=r7;r15=r11+r8|0;r16=r9-r11|0;r17=r11+r10|0;HEAP32[r14+4]=r4-r11|0;HEAP32[r14+5]=r15+r5|0;HEAP32[r14+6]=r16+r6|0;HEAP32[r14+7]=r17+r7|0;r18=r15-r17|0;r17=r16-(r9+r10+r18)|0;r16=-r9-(r18+r10+r17)|0;r15=-r10-(r18+r17+r16)|0;r19=r17+r16|0;r20=r19+r15|0;HEAP32[r14+8]=r4-r20|0;HEAP32[r14+9]=r15+r5|0;HEAP32[r14+10]=-r18-r20+r6|0;HEAP32[r14+11]=r16+r15+r7|0;HEAP32[r14+12]=r4-r19|0;HEAP32[r14+13]=r5-r18|0;HEAP32[r14+14]=r6-r17|0;HEAP32[r14+15]=r20+r7|0;FUNCTION_TABLE[HEAP32[r1+8>>2]](r1,r13|0,4,r2)}if((HEAP32[r1+4>>2]|0)<=(r2|0)){STACKTOP=r12;return}r13=r3*-36&-1;if(((r13|0)%36|0)!=0){___assert_func(68500,164,70076,69324)}r20=((r13|0)>0?r13+359|0:359)-r13|0;r14=360-r13-r20+(r20>>>0)%360|0;r20=(r14|0)/36&-1;L1719:do{if((r14|0)>35){r13=r11;r17=r10;r18=r9;r19=r8;r15=0;while(1){r16=-r13|0;r21=r13+r19|0;r22=r18-r13|0;r23=r13+r17|0;r24=r15+1|0;if((r24|0)<(r20|0)){r13=r23;r17=r22;r18=r21;r19=r16;r15=r24}else{r25=r23;r26=r22;r27=r21;r28=r16;break L1719}}}else{r25=r11;r26=r10;r27=r9;r28=r8}}while(0);r20=r28+r4|0;r28=r27+r5|0;r27=r26+r6|0;r26=r25+r7|0;r25=r3*108&-1;if(((r25|0)%36|0)!=0){___assert_func(68500,164,70076,69324)}r14=((r25|0)>0?r25+359|0:359)-r25|0;r15=360-r25-r14+(r14>>>0)%360|0;r14=(r15|0)/36&-1;L1726:do{if((r15|0)>35){r25=r11;r19=r10;r18=r9;r17=r8;r13=0;while(1){r16=-r25|0;r21=r25+r17|0;r22=r18-r25|0;r23=r25+r19|0;r24=r13+1|0;if((r24|0)<(r14|0)){r25=r23;r19=r22;r18=r21;r17=r16;r13=r24}else{r29=r23;r30=r22;r31=r21;r32=r16;break L1726}}}else{r29=r11;r30=r10;r31=r9;r32=r8}}while(0);r14=r2+1|0;_penrose_p2_small(r1,r14,r3,r4,r5,r6,r7,r9-r11|0,r10-r9+r11|0,r9+r8-r10|0,r10-r8|0);r8=r31-r29|0;r10=r30-r31+r29|0;r29=r31+r32-r30|0;r31=r30-r32|0;_penrose_p2_large(r1,r14,r3,r20,r28,r27,r26,r8,r10,r29,r31);_penrose_p2_large(r1,r14,-r3|0,r20,r28,r27,r26,r8,r10,r29,r31);STACKTOP=r12;return}function _penrose_p3_small(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11){var r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28;r12=STACKTOP;STACKTOP=STACKTOP+64|0;r13=r12,r14=r13>>2;if((r3|0)>0){HEAP32[r14]=r4;HEAP32[r14+1]=r5;HEAP32[r14+2]=r6;HEAP32[r14+3]=r7;r15=r11+r8|0;r16=r9-r11|0;r17=r11+r10|0;HEAP32[r14+4]=r4-r11|0;HEAP32[r14+5]=r15+r5|0;HEAP32[r14+6]=r16+r6|0;HEAP32[r14+7]=r17+r7|0;r18=r15-r17|0;r19=r16-(r9+r10+r18)|0;r20=-r9-(r18+r10+r19)|0;r21=-r10-(r18+r19+r20)|0;r22=r19+r20+r21|0;r19=r4-r22|0;r23=r21+r5|0;r24=-r18-r22+r6|0;r22=r20+r21+r7|0;HEAP32[r14+12]=r19;HEAP32[r14+13]=r23;HEAP32[r14+14]=r24;HEAP32[r14+15]=r22;HEAP32[r14+8]=r19-r11|0;HEAP32[r14+9]=r15+r23|0;HEAP32[r14+10]=r16+r24|0;HEAP32[r14+11]=r17+r22|0;FUNCTION_TABLE[HEAP32[r1+8>>2]](r1,r13|0,4,r2)}if((HEAP32[r1+4>>2]|0)<=(r2|0)){STACKTOP=r12;return}r13=r8+r4|0;r4=r10+r6|0;r6=r2+1|0;r2=r11+r8-(r11+r10)|0;r22=r9+r10+r2|0;r17=r2+r10+(r9-r11-r22)|0;r14=r9+r5|0;r5=r11+r7|0;_penrose_p3_large(r1,r6,-r3|0,r13,r14,r4,r5,-r9-r17|0,r9-r10+r17|0,r10-r22|0,r2);r2=r3*-108&-1;if(((r2|0)%36|0)!=0){___assert_func(68500,164,70076,69324)}r22=((r2|0)>0?r2+359|0:359)-r2|0;r17=360-r2-r22+(r22>>>0)%360|0;r22=(r17|0)/36&-1;L1741:do{if((r17|0)>35){r2=r11;r7=r10;r24=r9;r16=r8;r23=0;while(1){r15=-r2|0;r19=r2+r16|0;r21=r24-r2|0;r20=r2+r7|0;r18=r23+1|0;if((r18|0)<(r22|0)){r2=r20;r7=r21;r24=r19;r16=r15;r23=r18}else{r25=r20;r26=r21;r27=r19;r28=r15;break L1741}}}else{r25=r11;r26=r10;r27=r9;r28=r8}}while(0);_penrose_p3_small(r1,r6,r3,r13,r14,r4,r5,r27-r25|0,r26-r27+r25|0,r27+r28-r26|0,r26-r28|0);STACKTOP=r12;return}function _midend_solve(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r2=r1>>2;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+4|0;r5=r4,r6=r5>>2;r7=(r1+8|0)>>2;r8=HEAP32[r7];if((HEAP32[r8+72>>2]|0)==0){r9=68368;STACKTOP=r4;return r9}r10=(r1+60|0)>>2;r11=HEAP32[r10];if((r11|0)<1){r9=68296;STACKTOP=r4;return r9}HEAP32[r6]=0;r12=(r1+64|0)>>2;r13=HEAP32[r12];r14=FUNCTION_TABLE[HEAP32[r8+76>>2]](HEAP32[r13>>2],HEAP32[r13+((r11-1)*12&-1)>>2],HEAP32[r2+11],r5);if((r14|0)==0){r5=HEAP32[r6];if((r5|0)!=0){r9=r5;STACKTOP=r4;return r9}HEAP32[r6]=68216;r9=68216;STACKTOP=r4;return r9}r6=FUNCTION_TABLE[HEAP32[HEAP32[r7]+116>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-1)*12&-1)>>2],r14);if((r6|0)==0){___assert_func(68180,1376,70200,67e3)}r5=r1+84|0;do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=1275;break}else{break}}else{r3=1275}}while(0);if(r3==1275){_midend_finish_move(r1);_midend_redraw(r1)}r11=(r1+52|0)>>2;r13=HEAP32[r11];L1768:do{if((r13|0)>(HEAP32[r10]|0)){r8=r13;while(1){r15=HEAP32[HEAP32[r7]+68>>2];r16=r8-1|0;HEAP32[r11]=r16;FUNCTION_TABLE[r15](HEAP32[HEAP32[r12]+(r16*12&-1)>>2]);r16=HEAP32[r11];r15=HEAP32[HEAP32[r12]+(r16*12&-1)+4>>2];if((r15|0)==0){r17=r16}else{_free(r15);r17=HEAP32[r11]}if((r17|0)>(HEAP32[r10]|0)){r8=r17}else{r18=r17;break L1768}}}else{r18=r13}}while(0);r13=r1+56|0;do{if((r18|0)<(HEAP32[r13>>2]|0)){r19=r18;r20=HEAP32[r12]}else{r17=r18+128|0;HEAP32[r13>>2]=r17;r8=HEAP32[r12];r15=r17*12&-1;if((r8|0)==0){r21=_malloc(r15)}else{r21=_realloc(r8,r15)}if((r21|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r15=r21;HEAP32[r12]=r15;r19=HEAP32[r11];r20=r15;break}}}while(0);HEAP32[r20+(r19*12&-1)>>2]=r6;HEAP32[HEAP32[r12]+(HEAP32[r11]*12&-1)+4>>2]=r14;HEAP32[HEAP32[r12]+(HEAP32[r11]*12&-1)+8>>2]=2;r14=HEAP32[r11];r6=r14+1|0;HEAP32[r11]=r6;HEAP32[r10]=r6;r6=(r1+80|0)>>2;r11=HEAP32[r6];if((r11|0)!=0){r19=HEAP32[r12];FUNCTION_TABLE[HEAP32[HEAP32[r7]+108>>2]](r11,HEAP32[r19+((r14-1)*12&-1)>>2],HEAP32[r19+(r14*12&-1)>>2])}HEAP32[r2+26]=1;r14=HEAP32[r7];if((HEAP32[r14+188>>2]&512|0)==0){HEAPF32[r2+22]=0;_midend_finish_move(r1)}else{r19=FUNCTION_TABLE[HEAP32[r14+64>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-2)*12&-1)>>2]);HEAP32[r5>>2]=r19;r19=HEAP32[r10];r5=HEAP32[r12];r14=FUNCTION_TABLE[HEAP32[HEAP32[r7]+148>>2]](HEAP32[r5+((r19-2)*12&-1)>>2],HEAP32[r5+((r19-1)*12&-1)>>2],1,HEAP32[r6]);HEAPF32[r2+22]=r14;HEAPF32[r2+23]=0}if((HEAP32[r2+30]|0)!=0){_midend_redraw(r1)}r1=HEAP32[r7];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=1298;break}else{r7=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-1)*12&-1)>>2],HEAP32[r6])|0)!=0;HEAP32[r2+27]=r7&1;if(r7){break}else{r3=1298;break}}}while(0);do{if(r3==1298){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r2+22]!=0){break}_deactivate_timer(HEAP32[r2]);r9=0;STACKTOP=r4;return r9}}while(0);_activate_timer(HEAP32[r2]);r9=0;STACKTOP=r4;return r9}function _midend_rewrite_statusbar(r1,r2){var r3,r4,r5,r6,r7;r3=STACKTOP;STACKTOP=STACKTOP+100|0;r4=r3;r5=r1+116|0;r6=HEAP32[r5>>2];do{if((r6|0)!=(r2|0)){if((r6|0)!=0){_free(r6)}r7=_malloc(_strlen(r2)+1|0);if((r7|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r7,r2);HEAP32[r5>>2]=r7;break}}}while(0);if((HEAP32[HEAP32[r1+8>>2]+180>>2]|0)==0){r5=_malloc(_strlen(r2)+1|0);if((r5|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r2);r6=r5;STACKTOP=r3;return r6}else{r5=HEAPF32[r1+112>>2]&-1;r1=r4|0;_sprintf(r1,68124,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=(r5|0)/60&-1,HEAP32[tempInt+4>>2]=(r5|0)%60,tempInt));r5=_malloc(_strlen(r1)+_strlen(r2)+1|0);if((r5|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r1);_strcat(r5,r2);r6=r5;STACKTOP=r3;return r6}}function _penrose_p3_large(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11){var r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37;r12=STACKTOP;STACKTOP=STACKTOP+64|0;r13=r12,r14=r13>>2;if((r3|0)>0){HEAP32[r14]=r4;HEAP32[r14+1]=r5;HEAP32[r14+2]=r6;HEAP32[r14+3]=r7;r15=r11+r8|0;r16=r9-r11|0;r17=r11+r10|0;HEAP32[r14+4]=r4-r11|0;HEAP32[r14+5]=r15+r5|0;HEAP32[r14+6]=r16+r6|0;HEAP32[r14+7]=r17+r7|0;r18=r9+r8|0;r19=r17+r9|0;r20=r18-(r19+r8)|0;r21=r18+r10|0;r22=r17-r8+(r18-r11)-r19-(r21+r20)|0;r19=r8-r21-(r20+r8+r22)|0;r21=r22+r19|0;HEAP32[r14+8]=r4-r21|0;HEAP32[r14+9]=r5-r20|0;HEAP32[r14+10]=r6-r22|0;HEAP32[r14+11]=r21+(-r8-(r20+r22+r19))+r7|0;r19=r15-r17|0;r17=r16-(r9+r10+r19)|0;r16=-r9-(r19+r10+r17)|0;r15=r17+r16|0;HEAP32[r14+12]=r4-r15|0;HEAP32[r14+13]=r5-r19|0;HEAP32[r14+14]=r6-r17|0;HEAP32[r14+15]=r15+(-r10-(r19+r17+r16))+r7|0;FUNCTION_TABLE[HEAP32[r1+8>>2]](r1,r13|0,4,r2)}if((HEAP32[r1+4>>2]|0)<=(r2|0)){STACKTOP=r12;return}r13=r8+r4|0;r16=r10+r6|0;r17=r2+1|0;r2=r11+r10|0;r19=r11+r8-r2|0;r15=r9+r10+r19|0;r14=r19+r10+(r9-r11-r15)|0;r22=r9+r5|0;r20=r11+r7|0;_penrose_p3_large(r1,r17,-r3|0,r13,r22,r16,r20,-r9-r14|0,r9-r10+r14|0,r10-r15|0,r19);r19=r3*-108&-1;if(((r19|0)%36|0)!=0){___assert_func(68500,164,70076,69324)}r15=((r19|0)>0?r19+359|0:359)-r19|0;r14=360-r19-r15+(r15>>>0)%360|0;r15=(r14|0)/36&-1;L1837:do{if((r14|0)>35){r19=r11;r21=r10;r18=r9;r23=r8;r24=0;while(1){r25=-r19|0;r26=r19+r23|0;r27=r18-r19|0;r28=r19+r21|0;r29=r24+1|0;if((r29|0)<(r15|0)){r19=r28;r21=r27;r18=r26;r23=r25;r24=r29}else{r30=r28;r31=r27;r32=r26;r33=r25;break L1837}}}else{r30=r11;r31=r10;r32=r9;r33=r8}}while(0);_penrose_p3_small(r1,r17,r3,r13,r22,r16,r20,r32-r30|0,r31-r32+r30|0,r32+r33-r31|0,r31-r33|0);r33=r9+r8|0;r31=r33+r4-r11|0;r4=r2+r5|0;r5=r33+r6|0;r6=r7-r8+r2|0;r2=r3*-144&-1;if(((r2|0)%36|0)!=0){___assert_func(68500,164,70076,69324)}r7=((r2|0)>0?r2+359|0:359)-r2|0;r33=360-r2-r7+(r7>>>0)%360|0;r7=(r33|0)/36&-1;L1844:do{if((r33|0)>35){r2=r11;r32=r10;r30=r9;r20=r8;r16=0;while(1){r22=-r2|0;r13=r2+r20|0;r15=r30-r2|0;r14=r2+r32|0;r24=r16+1|0;if((r24|0)<(r7|0)){r2=r14;r32=r15;r30=r13;r20=r22;r16=r24}else{r34=r14;r35=r15;r36=r13;r37=r22;break L1844}}}else{r34=r11;r35=r10;r36=r9;r37=r8}}while(0);_penrose_p3_large(r1,r17,r3,r31,r4,r5,r6,r36-r34|0,r35-r36+r34|0,r36+r37-r35|0,r35-r37|0);STACKTOP=r12;return}function _penrose_p2_small(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11){var r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37;r12=STACKTOP;STACKTOP=STACKTOP+64|0;r13=r12,r14=r13>>2;if((r3|0)>0){HEAP32[r14]=r4;HEAP32[r14+1]=r5;HEAP32[r14+2]=r6;HEAP32[r14+3]=r7;r15=r9-r11|0;r16=r11+r10|0;r17=r11+r8-r16|0;r18=r9+r10|0;HEAP32[r14+4]=r4-r16|0;HEAP32[r14+5]=r10+r5|0;HEAP32[r14+6]=r17+r6|0;HEAP32[r14+7]=r18+r7|0;r16=r10-r8|0;HEAP32[r14+8]=r4-r16|0;HEAP32[r14+9]=r16+r15+r5|0;HEAP32[r14+10]=r10-r9+r11-r16+r6|0;HEAP32[r14+11]=r16+(r9+r8-r10)+r7|0;r16=r15-(r18+r17)|0;r18=-r9-(r17+r10+r16)|0;r15=-r10-(r17+r16+r18)|0;r19=r16+r18+r15|0;HEAP32[r14+12]=r4-r19|0;HEAP32[r14+13]=r15+r5|0;HEAP32[r14+14]=-r17-r19+r6|0;HEAP32[r14+15]=r18+r15+r7|0;FUNCTION_TABLE[HEAP32[r1+8>>2]](r1,r13|0,4,r2)}if((HEAP32[r1+4>>2]|0)<=(r2|0)){STACKTOP=r12;return}r13=r8+r4|0;r15=r9+r5|0;r18=r10+r6|0;r14=r11+r7|0;r19=r2+1|0;r2=-r3|0;r17=r3*-36&-1;if(((r17|0)%36|0)!=0){___assert_func(68500,164,70076,69324)}r16=((r17|0)>0?r17+359|0:359)-r17|0;r20=360-r17-r16+(r16>>>0)%360|0;r16=(r20|0)/36&-1;L1859:do{if((r20|0)>35){r17=r11;r21=r10;r22=r9;r23=r8;r24=0;while(1){r25=-r17|0;r26=r17+r23|0;r27=r22-r17|0;r28=r17+r21|0;r29=r24+1|0;if((r29|0)<(r16|0)){r17=r28;r21=r27;r22=r26;r23=r25;r24=r29}else{r30=r28;r31=r27;r32=r26;r33=r25;break L1859}}}else{r30=r11;r31=r10;r32=r9;r33=r8}}while(0);_penrose_p2_large(r1,r19,r2,r4,r5,r6,r7,r32-r30|0,r31-r32+r30|0,r32+r33-r31|0,r31-r33|0);r33=r3*-144&-1;if(((r33|0)%36|0)!=0){___assert_func(68500,164,70076,69324)}r31=((r33|0)>0?r33+359|0:359)-r33|0;r32=360-r33-r31+(r31>>>0)%360|0;r31=(r32|0)/36&-1;L1866:do{if((r32|0)>35){r33=r11;r30=r10;r7=r9;r6=r8;r5=0;while(1){r4=-r33|0;r2=r33+r6|0;r16=r7-r33|0;r20=r33+r30|0;r24=r5+1|0;if((r24|0)<(r31|0)){r33=r20;r30=r16;r7=r2;r6=r4;r5=r24}else{r34=r20;r35=r16;r36=r2;r37=r4;break L1866}}}else{r34=r11;r35=r10;r36=r9;r37=r8}}while(0);_penrose_p2_small(r1,r19,r3,r13,r15,r18,r14,r36-r34|0,r35-r36+r34|0,r36+r37-r35|0,r35-r37|0);STACKTOP=r12;return}function _SHA_Bytes(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+384|0;r6=r5,r7=r6>>2;r8=r5+320;r9=r1+92|0;r10=_llvm_uadd_with_overflow_i32(HEAP32[r9>>2],r3);HEAP32[r9>>2]=r10;r10=r1+88|0;HEAP32[r10>>2]=(tempRet0&1)+HEAP32[r10>>2]|0;r10=(r1+84|0)>>2;r9=HEAP32[r10];r11=r9+r3|0;do{if((r9|0)==0){if((r11|0)>63){r4=1357;break}else{r12=r2;r13=r3;break}}else{if((r11|0)>=64){r4=1357;break}_memcpy(r1+(r9+20)|0,r2,r3);r14=HEAP32[r10]+r3|0;HEAP32[r10]=r14;STACKTOP=r5;return}}while(0);L1877:do{if(r4==1357){r11=r1|0;r15=r6;r16=r8;r17=r1+4|0;r18=r1+8|0;r19=r1+12|0;r20=r1+16|0;r21=r2;r22=r3;r23=r9;while(1){_memcpy(r1+(r23+20)|0,r21,64-r23|0);r24=64-HEAP32[r10]|0;r25=r21+r24|0;r26=0;while(1){r27=r26<<2;HEAP32[r8+(r26<<2)>>2]=HEAPU8[(r27|1)+r1+20|0]<<16|HEAPU8[r1+(r27+20)|0]<<24|HEAPU8[(r27|2)+r1+20|0]<<8|HEAPU8[(r27|3)+r1+20|0];r27=r26+1|0;if((r27|0)==16){break}else{r26=r27}}_memcpy(r15,r16,64);r26=16;while(1){r27=HEAP32[(r26-8<<2>>2)+r7]^HEAP32[(r26-3<<2>>2)+r7]^HEAP32[(r26-14<<2>>2)+r7]^HEAP32[(r26-16<<2>>2)+r7];HEAP32[(r26<<2>>2)+r7]=r27<<1|r27>>>31;r27=r26+1|0;if((r27|0)==80){break}else{r26=r27}}r26=HEAP32[r11>>2];r27=HEAP32[r17>>2];r28=HEAP32[r18>>2];r29=HEAP32[r19>>2];r30=HEAP32[r20>>2];r31=0;r32=r30;r33=r29;r34=r28;r35=r27;r36=r26;while(1){r37=(r36<<5|r36>>>27)+r32+(r33&(r35^-1)|r34&r35)+HEAP32[(r31<<2>>2)+r7]+1518500249|0;r38=r35<<30|r35>>>2;r39=r31+1|0;if((r39|0)==20){r40=20;r41=r33;r42=r34;r43=r38;r44=r36;r45=r37;break}else{r31=r39;r32=r33;r33=r34;r34=r38;r35=r36;r36=r37}}while(1){r36=(r45<<5|r45>>>27)+r41+(r43^r44^r42)+HEAP32[(r40<<2>>2)+r7]+1859775393|0;r35=r44<<30|r44>>>2;r34=r40+1|0;if((r34|0)==40){r46=40;r47=r42;r48=r43;r49=r35;r50=r45;r51=r36;break}else{r40=r34;r41=r42;r42=r43;r43=r35;r44=r45;r45=r36}}while(1){r36=(r51<<5|r51>>>27)-1894007588+r47+((r48|r49)&r50|r48&r49)+HEAP32[(r46<<2>>2)+r7]|0;r35=r50<<30|r50>>>2;r34=r46+1|0;if((r34|0)==60){r52=60;r53=r48;r54=r49;r55=r35;r56=r51;r57=r36;break}else{r46=r34;r47=r48;r48=r49;r49=r35;r50=r51;r51=r36}}while(1){r58=(r57<<5|r57>>>27)-899497514+r53+(r55^r56^r54)+HEAP32[(r52<<2>>2)+r7]|0;r59=r56<<30|r56>>>2;r36=r52+1|0;if((r36|0)==80){break}else{r52=r36;r53=r54;r54=r55;r55=r59;r56=r57;r57=r58}}r36=r22-r24|0;HEAP32[r11>>2]=r58+r26|0;HEAP32[r17>>2]=r57+r27|0;HEAP32[r18>>2]=r59+r28|0;HEAP32[r19>>2]=r55+r29|0;HEAP32[r20>>2]=r54+r30|0;HEAP32[r10]=0;if((r36|0)>63){r21=r25;r22=r36;r23=0}else{r12=r25;r13=r36;break L1877}}}}while(0);_memcpy(r1+20|0,r12,r13);r14=r13;HEAP32[r10]=r14;STACKTOP=r5;return}function _SHA_Final(r1,r2){var r3,r4,r5,r6,r7,r8;r3=STACKTOP;STACKTOP=STACKTOP+64|0;r4=r3;r5=HEAP32[r1+84>>2];r6=((r5|0)>55?120:56)-r5|0;r5=HEAP32[r1+88>>2];r7=HEAP32[r1+92>>2];r8=r4|0;_memset(r8,0,r6);HEAP8[r8]=-128;_SHA_Bytes(r1,r8,r6);HEAP8[r8]=r5>>>21&255;HEAP8[r4+1|0]=r5>>>13&255;HEAP8[r4+2|0]=r5>>>5&255;HEAP8[r4+3|0]=(r7>>>29|r5<<3)&255;HEAP8[r4+4|0]=r7>>>21&255;HEAP8[r4+5|0]=r7>>>13&255;HEAP8[r4+6|0]=r7>>>5&255;HEAP8[r4+7|0]=r7<<3&255;_SHA_Bytes(r1,r8,8);r8=(r1|0)>>2;HEAP8[r2]=HEAP32[r8]>>>24&255;HEAP8[r2+1|0]=HEAP32[r8]>>>16&255;HEAP8[r2+2|0]=HEAP32[r8]>>>8&255;HEAP8[r2+3|0]=HEAP32[r8]&255;r8=(r1+4|0)>>2;HEAP8[r2+4|0]=HEAP32[r8]>>>24&255;HEAP8[r2+5|0]=HEAP32[r8]>>>16&255;HEAP8[r2+6|0]=HEAP32[r8]>>>8&255;HEAP8[r2+7|0]=HEAP32[r8]&255;r8=(r1+8|0)>>2;HEAP8[r2+8|0]=HEAP32[r8]>>>24&255;HEAP8[r2+9|0]=HEAP32[r8]>>>16&255;HEAP8[r2+10|0]=HEAP32[r8]>>>8&255;HEAP8[r2+11|0]=HEAP32[r8]&255;r8=(r1+12|0)>>2;HEAP8[r2+12|0]=HEAP32[r8]>>>24&255;HEAP8[r2+13|0]=HEAP32[r8]>>>16&255;HEAP8[r2+14|0]=HEAP32[r8]>>>8&255;HEAP8[r2+15|0]=HEAP32[r8]&255;r8=(r1+16|0)>>2;HEAP8[r2+16|0]=HEAP32[r8]>>>24&255;HEAP8[r2+17|0]=HEAP32[r8]>>>16&255;HEAP8[r2+18|0]=HEAP32[r8]>>>8&255;HEAP8[r2+19|0]=HEAP32[r8]&255;STACKTOP=r3;return}function _random_new(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=STACKTOP;STACKTOP=STACKTOP+288|0;r4=r3,r5=r4>>2;r6=r3+96,r7=r6>>2;r8=r3+192,r9=r8>>2;r10=_malloc(64);if((r10|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r9]=1732584193;HEAP32[r9+1]=-271733879;HEAP32[r9+2]=-1732584194;HEAP32[r9+3]=271733878;HEAP32[r9+4]=-1009589776;HEAP32[r9+21]=0;HEAP32[r9+23]=0;HEAP32[r9+22]=0;_SHA_Bytes(r8,r1,r2);_SHA_Final(r8,r10);HEAP32[r7]=1732584193;HEAP32[r7+1]=-271733879;HEAP32[r7+2]=-1732584194;HEAP32[r7+3]=271733878;HEAP32[r7+4]=-1009589776;HEAP32[r7+21]=0;HEAP32[r7+23]=0;HEAP32[r7+22]=0;_SHA_Bytes(r6,r10,20);_SHA_Final(r6,r10+20|0);HEAP32[r5]=1732584193;HEAP32[r5+1]=-271733879;HEAP32[r5+2]=-1732584194;HEAP32[r5+3]=271733878;HEAP32[r5+4]=-1009589776;HEAP32[r5+21]=0;HEAP32[r5+23]=0;HEAP32[r5+22]=0;_SHA_Bytes(r4,r10,40);_SHA_Final(r4,r10+40|0);HEAP32[r10+60>>2]=0;STACKTOP=r3;return r10}}function _index234(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11;r3=0;r4=r1|0;r1=HEAP32[r4>>2],r5=r1>>2;if((r1|0)==0|(r2|0)<0){r6=0;return r6}if((HEAP32[r5+6]+HEAP32[r5+5]+HEAP32[r5+7]+HEAP32[r5+8]+((HEAP32[r5+9]|0)!=0&1)+((HEAP32[r5+10]|0)!=0&1)+((HEAP32[r5+11]|0)!=0&1)|0)>(r2|0)){r7=r4;r8=r2}else{r6=0;return r6}L1909:while(1){r2=r7;while(1){r9=HEAP32[r2>>2],r10=r9>>2;if((r9|0)==0){r6=0;r3=1401;break L1909}r11=HEAP32[r10+5];if((r8|0)>=(r11|0)){break}r2=r9+4|0}r2=r8-1-r11|0;if((r2|0)<0){r3=1385;break}r4=HEAP32[r10+6];if((r2|0)<(r4|0)){r7=r9+8|0;r8=r2;continue}r5=r2-1-r4|0;if((r5|0)<0){r3=1389;break}r4=HEAP32[r10+7];if((r5|0)<(r4|0)){r7=r9+12|0;r8=r5;continue}r2=r5-1-r4|0;if((r2|0)<0){r3=1393;break}r7=r9+16|0;r8=r2}if(r3==1389){r6=HEAP32[r10+10];return r6}else if(r3==1401){return r6}else if(r3==1385){r6=HEAP32[r10+9];return r6}else if(r3==1393){r6=HEAP32[r10+11];return r6}}function _random_bits(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+96|0;r5=r4;if((r2|0)<=0){r6=0;r7=r2-1|0;r8=2<<r7;r9=r8-1|0;r10=r6&r9;STACKTOP=r4;return r10}r11=(r1+60|0)>>2;r12=r1|0;r13=r1+40|0;r14=r5|0;r15=r5+4|0;r16=r5+8|0;r17=r5+12|0;r18=r5+16|0;r19=r5+84|0;r20=r5+92|0;r21=r5+88|0;r22=0;r23=0;r24=HEAP32[r11];while(1){if((r24|0)>19){r25=0;while(1){r26=r1+r25|0;r27=HEAP8[r26];if(r27<<24>>24!=-1){r3=1406;break}HEAP8[r26]=0;r28=r25+1|0;if((r28|0)<20){r25=r28}else{break}}if(r3==1406){r3=0;HEAP8[r26]=r27+1&255}HEAP32[r14>>2]=1732584193;HEAP32[r15>>2]=-271733879;HEAP32[r16>>2]=-1732584194;HEAP32[r17>>2]=271733878;HEAP32[r18>>2]=-1009589776;HEAP32[r19>>2]=0;HEAP32[r20>>2]=0;HEAP32[r21>>2]=0;_SHA_Bytes(r5,r12,40);_SHA_Final(r5,r13);HEAP32[r11]=0;r29=0}else{r29=r24}r25=r29+1|0;HEAP32[r11]=r25;r28=HEAPU8[r1+(r29+40)|0]|r22<<8;r30=r23+8|0;if((r30|0)<(r2|0)){r22=r28;r23=r30;r24=r25}else{r6=r28;break}}r7=r2-1|0;r8=2<<r7;r9=r8-1|0;r10=r6&r9;STACKTOP=r4;return r10}function _freenode234(r1){if((r1|0)==0){return}_freenode234(HEAP32[r1+4>>2]);_freenode234(HEAP32[r1+8>>2]);_freenode234(HEAP32[r1+12>>2]);_freenode234(HEAP32[r1+16>>2]);_free(r1);return}function _findrelpos234(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28;r6=0;r7=HEAP32[r1>>2];if((r7|0)==0){r8=0;return r8}if((r3|0)==0){r9=HEAP32[r1+4>>2]}else{r9=r3}do{if((r2|0)==0){r3=(r4|0)==3;if((r4|0)==1){r10=1;break}else if((r4|0)!=3){___assert_func(68048,471,70692,69228)}r10=r3<<31>>31}else{r10=0}}while(0);r3=(r10|0)==0;r11=0;r12=r7,r7=r12>>2;L1966:while(1){r13=HEAP32[r7+9];r14=(r13|0)==0;do{if(r3){if(r14){r15=r11;r16=0;break}r17=FUNCTION_TABLE[r9](r2,r13);if((r17|0)<0){r15=r11;r16=0;break}if((HEAP32[r7+1]|0)==0){r18=r11}else{r18=HEAP32[r7+5]+r11|0}if((r17|0)==0){r19=r18;r20=0;r6=1438;break L1966}r17=r18+1|0;r21=HEAP32[r7+10];if((r21|0)==0){r15=r17;r16=1;break}r22=FUNCTION_TABLE[r9](r2,r21);if((r22|0)<0){r15=r17;r16=1;break}if((HEAP32[r7+2]|0)==0){r23=r17}else{r23=HEAP32[r7+6]+r17|0}if((r22|0)==0){r19=r23;r20=1;r6=1438;break L1966}r22=r23+1|0;r17=HEAP32[r7+11];if((r17|0)==0){r15=r22;r16=2;break}r21=FUNCTION_TABLE[r9](r2,r17);if((r21|0)<0){r15=r22;r16=2;break}if((HEAP32[r7+3]|0)==0){r24=r22}else{r24=HEAP32[r7+7]+r22|0}if((r21|0)==0){r19=r24;r20=2;r6=1438;break L1966}r15=r24+1|0;r16=3}else{if(r14|(r10|0)<0){r15=r11;r16=0;break}if((HEAP32[r7+1]|0)==0){r25=r11}else{r25=HEAP32[r7+5]+r11|0}r21=r25+1|0;if((HEAP32[r7+10]|0)==0){r15=r21;r16=1;break}if((HEAP32[r7+2]|0)==0){r26=r21}else{r26=HEAP32[r7+6]+r21|0}r21=r26+1|0;if((HEAP32[r7+11]|0)==0){r15=r21;r16=2;break}if((HEAP32[r7+3]|0)==0){r27=r21}else{r27=HEAP32[r7+7]+r21|0}r15=r27+1|0;r16=3}}while(0);r14=HEAP32[((r16<<2)+4>>2)+r7];if((r14|0)==0){r6=1444;break}else{r11=r15;r12=r14,r7=r12>>2}}do{if(r6==1444){if((r4|0)==0){r8=0;return r8}else{r28=(((r4-1|0)>>>0<2)<<31>>31)+r15|0;break}}else if(r6==1438){if((r4|0)==1){r28=r19-1|0;break}else if((r4|0)==3){r28=r19+1|0;break}else{if((r5|0)!=0){HEAP32[r5>>2]=r19}r8=HEAP32[((r20<<2)+36>>2)+r7];return r8}}}while(0);r7=_index234(r1,r28);if((r7|0)==0|(r5|0)==0){r8=r7;return r8}HEAP32[r5>>2]=r28;r8=r7;return r8}function _delpos234_internal(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4,r6=r5>>2;r7=r4+4,r8=r7>>2;HEAP32[r6]=r2;r9=(r1|0)>>2;r1=0;r10=HEAP32[r9],r11=r10>>2;r12=r2;while(1){r2=HEAP32[r11+5];do{if((r12|0)>(r2|0)){r13=r12-1-r2|0;HEAP32[r6]=r13;r14=HEAP32[r11+6];if((r13|0)<=(r14|0)){HEAP32[r8]=1;r15=r13;break}r16=r13-1-r14|0;HEAP32[r6]=r16;r14=HEAP32[r11+7];if((r16|0)<=(r14|0)){HEAP32[r8]=2;r15=r16;break}r13=r16-1-r14|0;HEAP32[r6]=r13;if((r13|0)>(HEAP32[r11+8]|0)){___assert_func(68048,900,70800,66756);r15=r13;break}else{HEAP32[r8]=3;r15=r13;break}}else{HEAP32[r8]=0;r15=r12}}while(0);if((HEAP32[r11+1]|0)==0){break}r2=HEAP32[r8];if((r15|0)==(HEAP32[((r2<<2)+20>>2)+r11]|0)){if((HEAP32[((r2<<2)+36>>2)+r11]|0)==0){___assert_func(68048,916,70800,66620);r17=HEAP32[r8]}else{r17=r2}r13=r17+1|0;HEAP32[r8]=r13;HEAP32[r6]=0;r14=HEAP32[((r13<<2)+4>>2)+r11];while(1){r13=HEAP32[r14+4>>2];if((r13|0)==0){break}else{r14=r13}}r13=(r17<<2)+r10+36|0;r16=HEAP32[r13>>2];HEAP32[r13>>2]=HEAP32[r14+36>>2];r18=r16;r19=HEAP32[r8]}else{r18=r1;r19=r2}r16=HEAP32[((r19<<2)+4>>2)+r11];L2047:do{if((HEAP32[r16+40>>2]|0)==0){r13=(r19|0)>0;do{if(r13){r20=r19-1|0;if((HEAP32[HEAP32[((r20<<2)+4>>2)+r11]+40>>2]|0)==0){if((r19|0)<3){r3=1492;break}else{break}}else{_trans234_subtree_right(r10,r20,r7,r5);r3=1498;break L2047}}else{r3=1492}}while(0);do{if(r3==1492){r3=0;r20=r19+1|0;r21=HEAP32[((r20<<2)+4>>2)+r11];if((r21|0)==0){break}if((HEAP32[r21+40>>2]|0)==0){break}_trans234_subtree_left(r10,r20,r7,r5);r3=1498;break L2047}}while(0);_trans234_subtree_merge(r10,(r13<<31>>31)+r19|0,r7,r5);r20=HEAP32[r8];r21=HEAP32[((r20<<2)+4>>2)+r11];if((HEAP32[r11+9]|0)!=0){r22=r21;r23=r20;r3=1501;break}HEAP32[r9]=r21;HEAP32[r21>>2]=0;if((r10|0)==0){r24=r21;break}_free(r10);r24=r21;break}else{r3=1498}}while(0);do{if(r3==1498){r3=0;if((r10|0)==0){r24=r16;break}r22=r16;r23=HEAP32[r8];r3=1501;break}}while(0);if(r3==1501){r3=0;r16=(r23<<2)+r10+20|0;HEAP32[r16>>2]=HEAP32[r16>>2]-1|0;r24=r22}r1=r18;r10=r24,r11=r10>>2;r12=HEAP32[r6]}r6=HEAP32[r8];if((r1|0)==0){r25=HEAP32[((r6<<2)+36>>2)+r11]}else{r25=r1}L2071:do{if((r6|0)<2){r1=r6;while(1){r8=r1+1|0;r12=HEAP32[((r8<<2)+36>>2)+r11];if((r12|0)==0){r26=r1;break L2071}HEAP32[((r1<<2)+36>>2)+r11]=r12;if((r8|0)<2){r1=r8}else{r26=r8;break L2071}}}else{r26=r6}}while(0);HEAP32[((r26<<2)+36>>2)+r11]=0;if((HEAP32[r11+9]|0)!=0){STACKTOP=r4;return r25}if((r10|0)!=(HEAP32[r9]|0)){___assert_func(68048,995,70800,69496)}if((r10|0)!=0){_free(r10)}HEAP32[r9]=0;STACKTOP=r4;return r25}function _add234_internal(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r4=0;r5=STACKTOP;r6=r1|0,r7=r6>>2;r8=HEAP32[r7];if((r8|0)==0){r9=_malloc(48);if((r9|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r7]=r9;HEAP32[r9+44>>2]=0;HEAP32[HEAP32[r7]+40>>2]=0;HEAP32[HEAP32[r7]+8>>2]=0;HEAP32[HEAP32[r7]+4>>2]=0;HEAP32[HEAP32[r7]+16>>2]=0;HEAP32[HEAP32[r7]+12>>2]=0;HEAP32[HEAP32[r7]+24>>2]=0;HEAP32[HEAP32[r7]+20>>2]=0;HEAP32[HEAP32[r7]+32>>2]=0;HEAP32[HEAP32[r7]+28>>2]=0;HEAP32[HEAP32[r7]>>2]=0;HEAP32[HEAP32[r7]+36>>2]=r2;r10=r2;STACKTOP=r5;return r10}r7=(r1+4|0)>>2;r1=0;r9=r8,r8=r9>>2;r11=r3;L2094:while(1){if((r9|0)==0){r12=r1;r13=0;r4=1540;break}do{if((r11|0)>-1){if((HEAP32[r8+1]|0)==0){r14=r11;r15=r11;break}r3=HEAP32[r8+5];if((r11|0)<=(r3|0)){r14=0;r15=r11;break}r16=r11-1-r3|0;r3=HEAP32[r8+6];if((r16|0)<=(r3|0)){r14=1;r15=r16;break}r17=r16-1-r3|0;r3=HEAP32[r8+7];if((r17|0)<=(r3|0)){r14=2;r15=r17;break}r16=r17-1-r3|0;if((r16|0)>(HEAP32[r8+8]|0)){r10=0;r4=1545;break L2094}else{r14=3;r15=r16}}else{r18=r9+36|0;r16=FUNCTION_TABLE[HEAP32[r7]](r2,HEAP32[r18>>2]);if((r16|0)<0){r14=0;r15=r11;break}if((r16|0)==0){r4=1530;break L2094}r19=r9+40|0;r16=HEAP32[r19>>2];if((r16|0)==0){r14=1;r15=r11;break}r3=FUNCTION_TABLE[HEAP32[r7]](r2,r16);if((r3|0)<0){r14=1;r15=r11;break}if((r3|0)==0){r4=1534;break L2094}r20=r9+44|0;r3=HEAP32[r20>>2];if((r3|0)==0){r14=2;r15=r11;break}r16=FUNCTION_TABLE[HEAP32[r7]](r2,r3);if((r16|0)<0){r14=2;r15=r11;break}if((r16|0)==0){r4=1538;break L2094}else{r14=3;r15=r11}}}while(0);r16=HEAP32[((r14<<2)+4>>2)+r8];if((r16|0)==0){r12=r14;r13=r9;r4=1540;break}else{r1=r14;r9=r16,r8=r9>>2;r11=r15}}if(r4==1540){_add234_insert(0,r2,0,r6,r13,r12);r10=r2;STACKTOP=r5;return r10}else if(r4==1545){STACKTOP=r5;return r10}else if(r4==1534){r10=HEAP32[r19>>2];STACKTOP=r5;return r10}else if(r4==1538){r10=HEAP32[r20>>2];STACKTOP=r5;return r10}else if(r4==1530){r10=HEAP32[r18>>2];STACKTOP=r5;return r10}}function _trans234_subtree_left(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13;r5=HEAP32[r1+(r2<<2)+4>>2];r6=r2-1|0;r7=HEAP32[r1+(r6<<2)+4>>2],r8=r7>>2;if((HEAP32[r8+10]|0)==0){r9=(HEAP32[r8+9]|0)!=0&1}else{r9=2}r10=(r6<<2)+r1+36|0;HEAP32[((r9<<2)+36>>2)+r8]=HEAP32[r10>>2];r11=r5+36|0;HEAP32[r10>>2]=HEAP32[r11>>2];r10=r5+4|0;r12=HEAP32[r10>>2];r13=r9+1|0;HEAP32[((r13<<2)+4>>2)+r8]=r12;r8=r5+20|0;r9=(r13<<2)+r7+20|0;HEAP32[r9>>2]=HEAP32[r8>>2];if((r12|0)!=0){HEAP32[r12>>2]=r7}r7=r5+8|0;HEAP32[r10>>2]=HEAP32[r7>>2];r10=r5+24|0;HEAP32[r8>>2]=HEAP32[r10>>2];r8=r5+40|0;HEAP32[r11>>2]=HEAP32[r8>>2];r11=r5+12|0;HEAP32[r7>>2]=HEAP32[r11>>2];r7=r5+28|0;HEAP32[r10>>2]=HEAP32[r7>>2];r10=r5+44|0;HEAP32[r8>>2]=HEAP32[r10>>2];r8=r5+16|0;HEAP32[r11>>2]=HEAP32[r8>>2];r11=r5+32|0;HEAP32[r7>>2]=HEAP32[r11>>2];HEAP32[r10>>2]=0;HEAP32[r8>>2]=0;HEAP32[r11>>2]=0;r11=HEAP32[r9>>2]+1|0;r9=(r2<<2)+r1+20|0;HEAP32[r9>>2]=HEAP32[r9>>2]-r11|0;r9=((r6<<2)+r1+20|0)>>2;HEAP32[r9]=HEAP32[r9]+r11|0;if((r3|0)==0){return}if((HEAP32[r3>>2]|0)!=(r2|0)){return}r2=HEAP32[r4>>2]-r11|0;HEAP32[r4>>2]=r2;if((r2|0)>=0){return}HEAP32[r4>>2]=r2+HEAP32[r9]+1|0;HEAP32[r3>>2]=HEAP32[r3>>2]-1|0;return}function _trans234_subtree_right(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12;r5=HEAP32[r1+(r2<<2)+4>>2];r6=r2+1|0;r7=HEAP32[r1+(r6<<2)+4>>2],r8=r7>>2;r9=r7+12|0;HEAP32[r8+4]=HEAP32[r9>>2];r10=r7+28|0;HEAP32[r8+8]=HEAP32[r10>>2];r11=r7+40|0;HEAP32[r8+11]=HEAP32[r11>>2];r8=r7+8|0;HEAP32[r9>>2]=HEAP32[r8>>2];r9=r7+24|0;HEAP32[r10>>2]=HEAP32[r9>>2];r10=r7+36|0;HEAP32[r11>>2]=HEAP32[r10>>2];r11=(r7+4|0)>>2;HEAP32[r8>>2]=HEAP32[r11];r8=(r7+20|0)>>2;HEAP32[r9>>2]=HEAP32[r8];if((HEAP32[r5+44>>2]|0)==0){r12=(HEAP32[r5+40>>2]|0)!=0&1}else{r12=2}r9=(r2<<2)+r1+36|0;HEAP32[r10>>2]=HEAP32[r9>>2];r10=(r12<<2)+r5+36|0;HEAP32[r9>>2]=HEAP32[r10>>2];HEAP32[r10>>2]=0;r10=r12+1|0;r12=(r10<<2)+r5+4|0;HEAP32[r11]=HEAP32[r12>>2];r9=(r10<<2)+r5+20|0;HEAP32[r8]=HEAP32[r9>>2];HEAP32[r12>>2]=0;HEAP32[r9>>2]=0;r9=HEAP32[r11];if((r9|0)!=0){HEAP32[r9>>2]=r7}r7=HEAP32[r8]+1|0;r8=(r2<<2)+r1+20|0;r9=HEAP32[r8>>2]-r7|0;HEAP32[r8>>2]=r9;r8=(r6<<2)+r1+20|0;HEAP32[r8>>2]=HEAP32[r8>>2]+r7|0;if((r3|0)==0){return}r8=HEAP32[r3>>2];do{if((r8|0)==(r2|0)){r1=HEAP32[r4>>2];if((r1|0)<=(r9|0)){break}HEAP32[r4>>2]=r1+(r9^-1)|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1|0;return}}while(0);if((r8|0)!=(r6|0)){return}HEAP32[r4>>2]=HEAP32[r4>>2]+r7|0;return}function _trans234_subtree_merge(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r5=r1>>2;r6=0;r7=HEAP32[((r2<<2)+4>>2)+r5],r8=r7>>2;r9=((r2<<2)+r1+20|0)>>2;r1=HEAP32[r9];r10=r2+1|0;r11=HEAP32[((r10<<2)+4>>2)+r5],r12=r11>>2;r13=HEAP32[((r10<<2)+20>>2)+r5];do{if((HEAP32[r8+11]|0)==0){if((HEAP32[r12+11]|0)==0){break}else{r6=1578;break}}else{r6=1578}}while(0);if(r6==1578){___assert_func(68048,809,70108,66944)}if((HEAP32[r8+10]|0)==0){r14=(HEAP32[r8+9]|0)!=0&1}else{r14=2}if((HEAP32[r12+10]|0)==0){r15=(HEAP32[r12+9]|0)!=0&1}else{r15=2}HEAP32[((r14<<2)+36>>2)+r8]=HEAP32[((r2<<2)+36>>2)+r5];r6=r15+1|0;r16=r14+1|0;r14=0;while(1){r17=HEAP32[((r14<<2)+4>>2)+r12];r18=r16+r14|0;HEAP32[((r18<<2)+4>>2)+r8]=r17;HEAP32[((r18<<2)+20>>2)+r8]=HEAP32[((r14<<2)+20>>2)+r12];if((r17|0)!=0){HEAP32[r17>>2]=r7}if((r14|0)<(r15|0)){HEAP32[((r18<<2)+36>>2)+r8]=HEAP32[((r14<<2)+36>>2)+r12]}r18=r14+1|0;if((r18|0)<(r6|0)){r14=r18}else{break}}HEAP32[r9]=r13+HEAP32[r9]+1|0;if((r11|0)!=0){_free(r11)}L2182:do{if((r10|0)<3){r11=r10;while(1){r9=r11+1|0;HEAP32[((r11<<2)+4>>2)+r5]=HEAP32[((r9<<2)+4>>2)+r5];HEAP32[((r11<<2)+20>>2)+r5]=HEAP32[((r9<<2)+20>>2)+r5];if((r9|0)==3){break L2182}else{r11=r9}}}}while(0);L2186:do{if((r2|0)<2){r11=r2;while(1){r9=r11+1|0;HEAP32[((r11<<2)+36>>2)+r5]=HEAP32[((r9<<2)+36>>2)+r5];if((r9|0)==2){break L2186}else{r11=r9}}}}while(0);HEAP32[r5+4]=0;HEAP32[r5+8]=0;HEAP32[r5+11]=0;if((r3|0)==0){return}r5=HEAP32[r3>>2];if((r5|0)==(r10|0)){HEAP32[r3>>2]=r2;HEAP32[r4>>2]=r1+HEAP32[r4>>2]+1|0;return}if((r5|0)<=(r10|0)){return}HEAP32[r3>>2]=r5-1|0;return}function _add234_insert(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56;r7=r4>>2;r4=r3>>2;r8=r1>>2;r9=0;r10=STACKTOP;if((r1|0)==0){r11=0}else{r11=HEAP32[r8+6]+HEAP32[r8+5]+HEAP32[r8+7]+HEAP32[r8+8]+((HEAP32[r8+9]|0)!=0&1)+((HEAP32[r8+10]|0)!=0&1)+((HEAP32[r8+11]|0)!=0&1)|0}if((r3|0)==0){r12=0;r13=0}else{r12=HEAP32[r4+6]+HEAP32[r4+5]+HEAP32[r4+7]+HEAP32[r4+8]+((HEAP32[r4+9]|0)!=0&1)+((HEAP32[r4+10]|0)!=0&1)+((HEAP32[r4+11]|0)!=0&1)|0;r13=r3}L2208:do{if((r5|0)==0){r14=r13;r15=r11;r16=r12;r17=r2;r18=r1}else{r3=r13;r4=r5,r8=r4>>2;r19=r6;r20=r11;r21=r12;r22=r2;r23=r1;while(1){r24=r4+36|0;r25=(r4+40|0)>>2;r26=HEAP32[r25];if((r26|0)==0){r9=1611;break}r27=(r4+44|0)>>2;if((HEAP32[r27]|0)==0){r9=1621;break}r28=_malloc(48),r29=r28>>2;if((r28|0)==0){r9=1634;break}r30=r28;r31=r4|0;HEAP32[r29]=HEAP32[r31>>2];do{if((r19|0)==0){HEAP32[r29+1]=r23;HEAP32[r29+5]=r20;HEAP32[r29+9]=r22;HEAP32[r29+2]=r3;HEAP32[r29+6]=r21;r32=r24|0;HEAP32[r29+10]=HEAP32[r32>>2];r33=r4+8|0;HEAP32[r29+3]=HEAP32[r33>>2];r34=r4+24|0;HEAP32[r29+7]=HEAP32[r34>>2];r35=HEAP32[r25];r36=r4+12|0;HEAP32[r8+1]=HEAP32[r36>>2];r37=r4+28|0;HEAP32[r8+5]=HEAP32[r37>>2];HEAP32[r32>>2]=HEAP32[r27];r32=r4+16|0;HEAP32[r33>>2]=HEAP32[r32>>2];r33=r4+32|0;HEAP32[r34>>2]=HEAP32[r33>>2];r38=r35;r39=r36;r40=r32;r41=r37;r42=r33}else if((r19|0)==1){r33=r4+4|0;HEAP32[r29+1]=HEAP32[r33>>2];r37=r4+20|0;HEAP32[r29+5]=HEAP32[r37>>2];r32=r24|0;HEAP32[r29+9]=HEAP32[r32>>2];HEAP32[r29+2]=r23;HEAP32[r29+6]=r20;HEAP32[r29+10]=r22;HEAP32[r29+3]=r3;HEAP32[r29+7]=r21;r36=HEAP32[r25];r35=r4+12|0;HEAP32[r33>>2]=HEAP32[r35>>2];r33=r4+28|0;HEAP32[r37>>2]=HEAP32[r33>>2];HEAP32[r32>>2]=HEAP32[r27];r32=r4+16|0;HEAP32[r8+2]=HEAP32[r32>>2];r37=r4+32|0;HEAP32[r8+6]=HEAP32[r37>>2];r38=r36;r39=r35;r40=r32;r41=r33;r42=r37}else{r37=(r4+4|0)>>2;HEAP32[r29+1]=HEAP32[r37];r33=(r4+20|0)>>2;HEAP32[r29+5]=HEAP32[r33];r32=(r24|0)>>2;HEAP32[r29+9]=HEAP32[r32];r35=(r4+8|0)>>2;HEAP32[r29+2]=HEAP32[r35];r36=(r4+24|0)>>2;HEAP32[r29+6]=HEAP32[r36];HEAP32[r29+10]=HEAP32[r25];if((r19|0)==2){HEAP32[r29+3]=r23;HEAP32[r29+7]=r20;HEAP32[r37]=r3;HEAP32[r33]=r21;HEAP32[r32]=HEAP32[r27];r34=r4+16|0;HEAP32[r35]=HEAP32[r34>>2];r43=r4+32|0;HEAP32[r36]=HEAP32[r43>>2];r38=r22;r39=r4+12|0;r40=r34;r41=r4+28|0;r42=r43;break}else{r43=r4+12|0;HEAP32[r29+3]=HEAP32[r43>>2];r34=r4+28|0;HEAP32[r29+7]=HEAP32[r34>>2];HEAP32[r37]=r23;HEAP32[r33]=r20;HEAP32[r32]=r22;HEAP32[r35]=r3;HEAP32[r36]=r21;r38=HEAP32[r27];r39=r43;r40=r4+16|0;r41=r34;r42=r4+32|0;break}}}while(0);HEAP32[r39>>2]=0;HEAP32[r40>>2]=0;HEAP32[r29+4]=0;HEAP32[r41>>2]=0;HEAP32[r42>>2]=0;r34=r28+32|0;HEAP32[r34>>2]=0;HEAP32[r25]=0;HEAP32[r27]=0;r43=r28+44|0;HEAP32[r43>>2]=0;r36=HEAP32[r29+1];if((r36|0)!=0){HEAP32[r36>>2]=r30}r36=HEAP32[r29+2];if((r36|0)!=0){HEAP32[r36>>2]=r30}r36=HEAP32[r29+3];if((r36|0)!=0){HEAP32[r36>>2]=r30}r36=HEAP32[r8+1];if((r36|0)!=0){HEAP32[r36>>2]=r4}r36=HEAP32[r8+2];if((r36|0)!=0){HEAP32[r36>>2]=r4}r36=HEAP32[r29+6]+HEAP32[r29+5]+HEAP32[r29+7]+HEAP32[r34>>2]+((HEAP32[r29+9]|0)!=0&1)+((HEAP32[r29+10]|0)!=0&1)+((HEAP32[r43>>2]|0)!=0&1)|0;if((r4|0)==0){r44=0}else{r44=HEAP32[r8+6]+HEAP32[r8+5]+HEAP32[r41>>2]+HEAP32[r42>>2]+((HEAP32[r8+9]|0)!=0&1)+((HEAP32[r25]|0)!=0&1)+((HEAP32[r27]|0)!=0&1)|0}r43=HEAP32[r31>>2],r34=r43>>2;if((r43|0)==0){r14=r4;r15=r36;r16=r44;r17=r38;r18=r30;break L2208}if((HEAP32[r34+1]|0)==(r4|0)){r3=r4;r4=r43,r8=r4>>2;r19=0;r20=r36;r21=r44;r22=r38;r23=r30;continue}if((HEAP32[r34+2]|0)==(r4|0)){r3=r4;r4=r43,r8=r4>>2;r19=1;r20=r36;r21=r44;r22=r38;r23=r30;continue}r35=(HEAP32[r34+3]|0)==(r4|0)?2:3;r3=r4;r4=r43,r8=r4>>2;r19=r35;r20=r36;r21=r44;r22=r38;r23=r30}do{if(r9==1634){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r9==1621){if((r19|0)==1){r36=r4+12|0;HEAP32[r8+4]=HEAP32[r36>>2];r35=r4+28|0;HEAP32[r8+8]=HEAP32[r35>>2];HEAP32[r27]=r26;HEAP32[r36>>2]=r3;HEAP32[r35>>2]=r21;HEAP32[r25]=r22;HEAP32[r8+2]=r23;HEAP32[r8+6]=r20}else if((r19|0)==0){r35=r4+12|0;HEAP32[r8+4]=HEAP32[r35>>2];r36=r4+28|0;HEAP32[r8+8]=HEAP32[r36>>2];HEAP32[r27]=r26;r43=r4+8|0;HEAP32[r35>>2]=HEAP32[r43>>2];r35=r4+24|0;HEAP32[r36>>2]=HEAP32[r35>>2];r36=r24|0;HEAP32[r25]=HEAP32[r36>>2];HEAP32[r43>>2]=r3;HEAP32[r35>>2]=r21;HEAP32[r36>>2]=r22;HEAP32[r8+1]=r23;HEAP32[r8+5]=r20}else{HEAP32[r8+4]=r3;HEAP32[r8+8]=r21;HEAP32[r27]=r22;HEAP32[r8+3]=r23;HEAP32[r8+7]=r20}r36=HEAP32[r8+1];if((r36|0)!=0){HEAP32[r36>>2]=r4}r36=HEAP32[r8+2];if((r36|0)!=0){HEAP32[r36>>2]=r4}r36=HEAP32[r8+3];if((r36|0)!=0){HEAP32[r36>>2]=r4}r36=HEAP32[r8+4];if((r36|0)==0){break}HEAP32[r36>>2]=r4}else if(r9==1611){if((r19|0)==0){r36=r4+8|0;HEAP32[r8+3]=HEAP32[r36>>2];r35=r4+24|0;HEAP32[r8+7]=HEAP32[r35>>2];r43=r24|0;HEAP32[r25]=HEAP32[r43>>2];HEAP32[r36>>2]=r3;HEAP32[r35>>2]=r21;HEAP32[r43>>2]=r22;HEAP32[r8+1]=r23;HEAP32[r8+5]=r20;r45=r23;r46=r3}else{HEAP32[r8+3]=r3;HEAP32[r8+7]=r21;HEAP32[r25]=r22;HEAP32[r8+2]=r23;HEAP32[r8+6]=r20;r45=HEAP32[r8+1];r46=r23}if((r45|0)==0){r47=r46}else{HEAP32[r45>>2]=r4;r47=HEAP32[r8+2]}if((r47|0)!=0){HEAP32[r47>>2]=r4}r43=HEAP32[r8+3];if((r43|0)==0){break}HEAP32[r43>>2]=r4}}while(0);r8=r4|0;r23=HEAP32[r8>>2];if((r23|0)==0){r48=0;STACKTOP=r10;return r48}else{r49=r4,r50=r49>>2;r51=r8;r52=r23,r53=r52>>2}while(1){if((r49|0)==0){r54=0}else{r54=HEAP32[r50+6]+HEAP32[r50+5]+HEAP32[r50+7]+HEAP32[r50+8]+((HEAP32[r50+9]|0)!=0&1)+((HEAP32[r50+10]|0)!=0&1)+((HEAP32[r50+11]|0)!=0&1)|0}do{if((HEAP32[r53+1]|0)==(r49|0)){r55=0}else{if((HEAP32[r53+2]|0)==(r49|0)){r55=1;break}r55=(HEAP32[r53+3]|0)==(r49|0)?2:3}}while(0);HEAP32[((r55<<2)+20>>2)+r53]=r54;r30=HEAP32[r51>>2];r31=r30|0;r29=HEAP32[r31>>2];if((r29|0)==0){r48=0;break}else{r49=r30,r50=r49>>2;r51=r31;r52=r29,r53=r52>>2}}STACKTOP=r10;return r48}}while(0);r52=_malloc(48);if((r52|0)==0){_fatal(69040,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r7]=r52;HEAP32[r52+4>>2]=r18;HEAP32[HEAP32[r7]+20>>2]=r15;HEAP32[HEAP32[r7]+36>>2]=r17;HEAP32[HEAP32[r7]+8>>2]=r14;HEAP32[HEAP32[r7]+24>>2]=r16;HEAP32[HEAP32[r7]+40>>2]=0;HEAP32[HEAP32[r7]+12>>2]=0;HEAP32[HEAP32[r7]+28>>2]=0;HEAP32[HEAP32[r7]+44>>2]=0;HEAP32[HEAP32[r7]+16>>2]=0;HEAP32[HEAP32[r7]+32>>2]=0;HEAP32[HEAP32[r7]>>2]=0;r16=HEAP32[r7];r14=HEAP32[r16+4>>2];if((r14|0)==0){r56=r16}else{HEAP32[r14>>2]=r16;r56=HEAP32[r7]}r7=HEAP32[r56+8>>2];if((r7|0)==0){r48=1;STACKTOP=r10;return r48}HEAP32[r7>>2]=r56;r48=1;STACKTOP=r10;return r48}function _malloc(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95;r2=0;do{if(r1>>>0<245){if(r1>>>0<11){r3=16}else{r3=r1+11&-8}r4=r3>>>3;r5=HEAP32[17397];r6=r5>>>(r4>>>0);if((r6&3|0)!=0){r7=(r6&1^1)+r4|0;r8=r7<<1;r9=(r8<<2)+69628|0;r10=(r8+2<<2)+69628|0;r8=HEAP32[r10>>2];r11=r8+8|0;r12=HEAP32[r11>>2];do{if((r9|0)==(r12|0)){HEAP32[17397]=r5&(1<<r7^-1)}else{if(r12>>>0<HEAP32[17401]>>>0){_abort()}r13=r12+12|0;if((HEAP32[r13>>2]|0)==(r8|0)){HEAP32[r13>>2]=r9;HEAP32[r10>>2]=r12;break}else{_abort()}}}while(0);r12=r7<<3;HEAP32[r8+4>>2]=r12|3;r10=r8+(r12|4)|0;HEAP32[r10>>2]=HEAP32[r10>>2]|1;r14=r11;return r14}if(r3>>>0<=HEAP32[17399]>>>0){r15=r3,r16=r15>>2;break}if((r6|0)!=0){r10=2<<r4;r12=r6<<r4&(r10|-r10);r10=(r12&-r12)-1|0;r12=r10>>>12&16;r9=r10>>>(r12>>>0);r10=r9>>>5&8;r13=r9>>>(r10>>>0);r9=r13>>>2&4;r17=r13>>>(r9>>>0);r13=r17>>>1&2;r18=r17>>>(r13>>>0);r17=r18>>>1&1;r19=(r10|r12|r9|r13|r17)+(r18>>>(r17>>>0))|0;r17=r19<<1;r18=(r17<<2)+69628|0;r13=(r17+2<<2)+69628|0;r17=HEAP32[r13>>2];r9=r17+8|0;r12=HEAP32[r9>>2];do{if((r18|0)==(r12|0)){HEAP32[17397]=r5&(1<<r19^-1)}else{if(r12>>>0<HEAP32[17401]>>>0){_abort()}r10=r12+12|0;if((HEAP32[r10>>2]|0)==(r17|0)){HEAP32[r10>>2]=r18;HEAP32[r13>>2]=r12;break}else{_abort()}}}while(0);r12=r19<<3;r13=r12-r3|0;HEAP32[r17+4>>2]=r3|3;r18=r17;r5=r18+r3|0;HEAP32[r18+(r3|4)>>2]=r13|1;HEAP32[r18+r12>>2]=r13;r12=HEAP32[17399];if((r12|0)!=0){r18=HEAP32[17402];r4=r12>>>3;r12=r4<<1;r6=(r12<<2)+69628|0;r11=HEAP32[17397];r8=1<<r4;do{if((r11&r8|0)==0){HEAP32[17397]=r11|r8;r20=r6;r21=(r12+2<<2)+69628|0}else{r4=(r12+2<<2)+69628|0;r7=HEAP32[r4>>2];if(r7>>>0>=HEAP32[17401]>>>0){r20=r7;r21=r4;break}_abort()}}while(0);HEAP32[r21>>2]=r18;HEAP32[r20+12>>2]=r18;HEAP32[r18+8>>2]=r20;HEAP32[r18+12>>2]=r6}HEAP32[17399]=r13;HEAP32[17402]=r5;r14=r9;return r14}r12=HEAP32[17398];if((r12|0)==0){r15=r3,r16=r15>>2;break}r8=(r12&-r12)-1|0;r12=r8>>>12&16;r11=r8>>>(r12>>>0);r8=r11>>>5&8;r17=r11>>>(r8>>>0);r11=r17>>>2&4;r19=r17>>>(r11>>>0);r17=r19>>>1&2;r4=r19>>>(r17>>>0);r19=r4>>>1&1;r7=HEAP32[((r8|r12|r11|r17|r19)+(r4>>>(r19>>>0))<<2)+69892>>2];r19=r7;r4=r7,r17=r4>>2;r11=(HEAP32[r7+4>>2]&-8)-r3|0;while(1){r7=HEAP32[r19+16>>2];if((r7|0)==0){r12=HEAP32[r19+20>>2];if((r12|0)==0){break}else{r22=r12}}else{r22=r7}r7=(HEAP32[r22+4>>2]&-8)-r3|0;r12=r7>>>0<r11>>>0;r19=r22;r4=r12?r22:r4,r17=r4>>2;r11=r12?r7:r11}r19=r4;r9=HEAP32[17401];if(r19>>>0<r9>>>0){_abort()}r5=r19+r3|0;r13=r5;if(r19>>>0>=r5>>>0){_abort()}r5=HEAP32[r17+6];r6=HEAP32[r17+3];L2353:do{if((r6|0)==(r4|0)){r18=r4+20|0;r7=HEAP32[r18>>2];do{if((r7|0)==0){r12=r4+16|0;r8=HEAP32[r12>>2];if((r8|0)==0){r23=0,r24=r23>>2;break L2353}else{r25=r8;r26=r12;break}}else{r25=r7;r26=r18}}while(0);while(1){r18=r25+20|0;r7=HEAP32[r18>>2];if((r7|0)!=0){r25=r7;r26=r18;continue}r18=r25+16|0;r7=HEAP32[r18>>2];if((r7|0)==0){break}else{r25=r7;r26=r18}}if(r26>>>0<r9>>>0){_abort()}else{HEAP32[r26>>2]=0;r23=r25,r24=r23>>2;break}}else{r18=HEAP32[r17+2];if(r18>>>0<r9>>>0){_abort()}r7=r18+12|0;if((HEAP32[r7>>2]|0)!=(r4|0)){_abort()}r12=r6+8|0;if((HEAP32[r12>>2]|0)==(r4|0)){HEAP32[r7>>2]=r6;HEAP32[r12>>2]=r18;r23=r6,r24=r23>>2;break}else{_abort()}}}while(0);L2375:do{if((r5|0)!=0){r6=r4+28|0;r9=(HEAP32[r6>>2]<<2)+69892|0;do{if((r4|0)==(HEAP32[r9>>2]|0)){HEAP32[r9>>2]=r23;if((r23|0)!=0){break}HEAP32[17398]=HEAP32[17398]&(1<<HEAP32[r6>>2]^-1);break L2375}else{if(r5>>>0<HEAP32[17401]>>>0){_abort()}r18=r5+16|0;if((HEAP32[r18>>2]|0)==(r4|0)){HEAP32[r18>>2]=r23}else{HEAP32[r5+20>>2]=r23}if((r23|0)==0){break L2375}}}while(0);if(r23>>>0<HEAP32[17401]>>>0){_abort()}HEAP32[r24+6]=r5;r6=HEAP32[r17+4];do{if((r6|0)!=0){if(r6>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r24+4]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);r6=HEAP32[r17+5];if((r6|0)==0){break}if(r6>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r24+5]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);if(r11>>>0<16){r5=r11+r3|0;HEAP32[r17+1]=r5|3;r6=r5+(r19+4)|0;HEAP32[r6>>2]=HEAP32[r6>>2]|1}else{HEAP32[r17+1]=r3|3;HEAP32[r19+(r3|4)>>2]=r11|1;HEAP32[r19+r11+r3>>2]=r11;r6=HEAP32[17399];if((r6|0)!=0){r5=HEAP32[17402];r9=r6>>>3;r6=r9<<1;r18=(r6<<2)+69628|0;r12=HEAP32[17397];r7=1<<r9;do{if((r12&r7|0)==0){HEAP32[17397]=r12|r7;r27=r18;r28=(r6+2<<2)+69628|0}else{r9=(r6+2<<2)+69628|0;r8=HEAP32[r9>>2];if(r8>>>0>=HEAP32[17401]>>>0){r27=r8;r28=r9;break}_abort()}}while(0);HEAP32[r28>>2]=r5;HEAP32[r27+12>>2]=r5;HEAP32[r5+8>>2]=r27;HEAP32[r5+12>>2]=r18}HEAP32[17399]=r11;HEAP32[17402]=r13}r6=r4+8|0;if((r6|0)==0){r15=r3,r16=r15>>2;break}else{r14=r6}return r14}else{if(r1>>>0>4294967231){r15=-1,r16=r15>>2;break}r6=r1+11|0;r7=r6&-8,r12=r7>>2;r19=HEAP32[17398];if((r19|0)==0){r15=r7,r16=r15>>2;break}r17=-r7|0;r9=r6>>>8;do{if((r9|0)==0){r29=0}else{if(r7>>>0>16777215){r29=31;break}r6=(r9+1048320|0)>>>16&8;r8=r9<<r6;r10=(r8+520192|0)>>>16&4;r30=r8<<r10;r8=(r30+245760|0)>>>16&2;r31=14-(r10|r6|r8)+(r30<<r8>>>15)|0;r29=r7>>>((r31+7|0)>>>0)&1|r31<<1}}while(0);r9=HEAP32[(r29<<2)+69892>>2];L2423:do{if((r9|0)==0){r32=0;r33=r17;r34=0}else{if((r29|0)==31){r35=0}else{r35=25-(r29>>>1)|0}r4=0;r13=r17;r11=r9,r18=r11>>2;r5=r7<<r35;r31=0;while(1){r8=HEAP32[r18+1]&-8;r30=r8-r7|0;if(r30>>>0<r13>>>0){if((r8|0)==(r7|0)){r32=r11;r33=r30;r34=r11;break L2423}else{r36=r11;r37=r30}}else{r36=r4;r37=r13}r30=HEAP32[r18+5];r8=HEAP32[((r5>>>31<<2)+16>>2)+r18];r6=(r30|0)==0|(r30|0)==(r8|0)?r31:r30;if((r8|0)==0){r32=r36;r33=r37;r34=r6;break L2423}else{r4=r36;r13=r37;r11=r8,r18=r11>>2;r5=r5<<1;r31=r6}}}}while(0);if((r34|0)==0&(r32|0)==0){r9=2<<r29;r17=r19&(r9|-r9);if((r17|0)==0){r15=r7,r16=r15>>2;break}r9=(r17&-r17)-1|0;r17=r9>>>12&16;r31=r9>>>(r17>>>0);r9=r31>>>5&8;r5=r31>>>(r9>>>0);r31=r5>>>2&4;r11=r5>>>(r31>>>0);r5=r11>>>1&2;r18=r11>>>(r5>>>0);r11=r18>>>1&1;r38=HEAP32[((r9|r17|r31|r5|r11)+(r18>>>(r11>>>0))<<2)+69892>>2]}else{r38=r34}L2438:do{if((r38|0)==0){r39=r33;r40=r32,r41=r40>>2}else{r11=r38,r18=r11>>2;r5=r33;r31=r32;while(1){r17=(HEAP32[r18+1]&-8)-r7|0;r9=r17>>>0<r5>>>0;r13=r9?r17:r5;r17=r9?r11:r31;r9=HEAP32[r18+4];if((r9|0)!=0){r11=r9,r18=r11>>2;r5=r13;r31=r17;continue}r9=HEAP32[r18+5];if((r9|0)==0){r39=r13;r40=r17,r41=r40>>2;break L2438}else{r11=r9,r18=r11>>2;r5=r13;r31=r17}}}}while(0);if((r40|0)==0){r15=r7,r16=r15>>2;break}if(r39>>>0>=(HEAP32[17399]-r7|0)>>>0){r15=r7,r16=r15>>2;break}r19=r40,r31=r19>>2;r5=HEAP32[17401];if(r19>>>0<r5>>>0){_abort()}r11=r19+r7|0;r18=r11;if(r19>>>0>=r11>>>0){_abort()}r17=HEAP32[r41+6];r13=HEAP32[r41+3];L2451:do{if((r13|0)==(r40|0)){r9=r40+20|0;r4=HEAP32[r9>>2];do{if((r4|0)==0){r6=r40+16|0;r8=HEAP32[r6>>2];if((r8|0)==0){r42=0,r43=r42>>2;break L2451}else{r44=r8;r45=r6;break}}else{r44=r4;r45=r9}}while(0);while(1){r9=r44+20|0;r4=HEAP32[r9>>2];if((r4|0)!=0){r44=r4;r45=r9;continue}r9=r44+16|0;r4=HEAP32[r9>>2];if((r4|0)==0){break}else{r44=r4;r45=r9}}if(r45>>>0<r5>>>0){_abort()}else{HEAP32[r45>>2]=0;r42=r44,r43=r42>>2;break}}else{r9=HEAP32[r41+2];if(r9>>>0<r5>>>0){_abort()}r4=r9+12|0;if((HEAP32[r4>>2]|0)!=(r40|0)){_abort()}r6=r13+8|0;if((HEAP32[r6>>2]|0)==(r40|0)){HEAP32[r4>>2]=r13;HEAP32[r6>>2]=r9;r42=r13,r43=r42>>2;break}else{_abort()}}}while(0);L2473:do{if((r17|0)!=0){r13=r40+28|0;r5=(HEAP32[r13>>2]<<2)+69892|0;do{if((r40|0)==(HEAP32[r5>>2]|0)){HEAP32[r5>>2]=r42;if((r42|0)!=0){break}HEAP32[17398]=HEAP32[17398]&(1<<HEAP32[r13>>2]^-1);break L2473}else{if(r17>>>0<HEAP32[17401]>>>0){_abort()}r9=r17+16|0;if((HEAP32[r9>>2]|0)==(r40|0)){HEAP32[r9>>2]=r42}else{HEAP32[r17+20>>2]=r42}if((r42|0)==0){break L2473}}}while(0);if(r42>>>0<HEAP32[17401]>>>0){_abort()}HEAP32[r43+6]=r17;r13=HEAP32[r41+4];do{if((r13|0)!=0){if(r13>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r43+4]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);r13=HEAP32[r41+5];if((r13|0)==0){break}if(r13>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r43+5]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);do{if(r39>>>0<16){r17=r39+r7|0;HEAP32[r41+1]=r17|3;r13=r17+(r19+4)|0;HEAP32[r13>>2]=HEAP32[r13>>2]|1}else{HEAP32[r41+1]=r7|3;HEAP32[((r7|4)>>2)+r31]=r39|1;HEAP32[(r39>>2)+r31+r12]=r39;r13=r39>>>3;if(r39>>>0<256){r17=r13<<1;r5=(r17<<2)+69628|0;r9=HEAP32[17397];r6=1<<r13;do{if((r9&r6|0)==0){HEAP32[17397]=r9|r6;r46=r5;r47=(r17+2<<2)+69628|0}else{r13=(r17+2<<2)+69628|0;r4=HEAP32[r13>>2];if(r4>>>0>=HEAP32[17401]>>>0){r46=r4;r47=r13;break}_abort()}}while(0);HEAP32[r47>>2]=r18;HEAP32[r46+12>>2]=r18;HEAP32[r12+(r31+2)]=r46;HEAP32[r12+(r31+3)]=r5;break}r17=r11;r6=r39>>>8;do{if((r6|0)==0){r48=0}else{if(r39>>>0>16777215){r48=31;break}r9=(r6+1048320|0)>>>16&8;r13=r6<<r9;r4=(r13+520192|0)>>>16&4;r8=r13<<r4;r13=(r8+245760|0)>>>16&2;r30=14-(r4|r9|r13)+(r8<<r13>>>15)|0;r48=r39>>>((r30+7|0)>>>0)&1|r30<<1}}while(0);r6=(r48<<2)+69892|0;HEAP32[r12+(r31+7)]=r48;HEAP32[r12+(r31+5)]=0;HEAP32[r12+(r31+4)]=0;r5=HEAP32[17398];r30=1<<r48;if((r5&r30|0)==0){HEAP32[17398]=r5|r30;HEAP32[r6>>2]=r17;HEAP32[r12+(r31+6)]=r6;HEAP32[r12+(r31+3)]=r17;HEAP32[r12+(r31+2)]=r17;break}if((r48|0)==31){r49=0}else{r49=25-(r48>>>1)|0}r30=r39<<r49;r5=HEAP32[r6>>2];while(1){if((HEAP32[r5+4>>2]&-8|0)==(r39|0)){break}r50=(r30>>>31<<2)+r5+16|0;r6=HEAP32[r50>>2];if((r6|0)==0){r2=1825;break}else{r30=r30<<1;r5=r6}}if(r2==1825){if(r50>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r50>>2]=r17;HEAP32[r12+(r31+6)]=r5;HEAP32[r12+(r31+3)]=r17;HEAP32[r12+(r31+2)]=r17;break}}r30=r5+8|0;r6=HEAP32[r30>>2];r13=HEAP32[17401];if(r5>>>0<r13>>>0){_abort()}if(r6>>>0<r13>>>0){_abort()}else{HEAP32[r6+12>>2]=r17;HEAP32[r30>>2]=r17;HEAP32[r12+(r31+2)]=r6;HEAP32[r12+(r31+3)]=r5;HEAP32[r12+(r31+6)]=0;break}}}while(0);r31=r40+8|0;if((r31|0)==0){r15=r7,r16=r15>>2;break}else{r14=r31}return r14}}while(0);r40=HEAP32[17399];if(r15>>>0<=r40>>>0){r50=r40-r15|0;r39=HEAP32[17402];if(r50>>>0>15){r49=r39;HEAP32[17402]=r49+r15|0;HEAP32[17399]=r50;HEAP32[(r49+4>>2)+r16]=r50|1;HEAP32[r49+r40>>2]=r50;HEAP32[r39+4>>2]=r15|3}else{HEAP32[17399]=0;HEAP32[17402]=0;HEAP32[r39+4>>2]=r40|3;r50=r40+(r39+4)|0;HEAP32[r50>>2]=HEAP32[r50>>2]|1}r14=r39+8|0;return r14}r39=HEAP32[17400];if(r15>>>0<r39>>>0){r50=r39-r15|0;HEAP32[17400]=r50;r39=HEAP32[17403];r40=r39;HEAP32[17403]=r40+r15|0;HEAP32[(r40+4>>2)+r16]=r50|1;HEAP32[r39+4>>2]=r15|3;r14=r39+8|0;return r14}do{if((HEAP32[16492]|0)==0){r39=_sysconf(8);if((r39-1&r39|0)==0){HEAP32[16494]=r39;HEAP32[16493]=r39;HEAP32[16495]=-1;HEAP32[16496]=2097152;HEAP32[16497]=0;HEAP32[17508]=0;r39=_time(0)&-16^1431655768;HEAP32[16492]=r39;break}else{_abort()}}}while(0);r39=r15+48|0;r50=HEAP32[16494];r40=r15+47|0;r49=r50+r40|0;r48=-r50|0;r50=r49&r48;if(r50>>>0<=r15>>>0){r14=0;return r14}r46=HEAP32[17507];do{if((r46|0)!=0){r47=HEAP32[17505];r41=r47+r50|0;if(r41>>>0<=r47>>>0|r41>>>0>r46>>>0){r14=0}else{break}return r14}}while(0);L2565:do{if((HEAP32[17508]&4|0)==0){r46=HEAP32[17403];L2567:do{if((r46|0)==0){r2=1855}else{r41=r46;r47=70036;while(1){r51=r47|0;r42=HEAP32[r51>>2];if(r42>>>0<=r41>>>0){r52=r47+4|0;if((r42+HEAP32[r52>>2]|0)>>>0>r41>>>0){break}}r42=HEAP32[r47+8>>2];if((r42|0)==0){r2=1855;break L2567}else{r47=r42}}if((r47|0)==0){r2=1855;break}r41=r49-HEAP32[17400]&r48;if(r41>>>0>=2147483647){r53=0;break}r5=_sbrk(r41);r17=(r5|0)==(HEAP32[r51>>2]+HEAP32[r52>>2]|0);r54=r17?r5:-1;r55=r17?r41:0;r56=r5;r57=r41;r2=1864;break}}while(0);do{if(r2==1855){r46=_sbrk(0);if((r46|0)==-1){r53=0;break}r7=r46;r41=HEAP32[16493];r5=r41-1|0;if((r5&r7|0)==0){r58=r50}else{r58=r50-r7+(r5+r7&-r41)|0}r41=HEAP32[17505];r7=r41+r58|0;if(!(r58>>>0>r15>>>0&r58>>>0<2147483647)){r53=0;break}r5=HEAP32[17507];if((r5|0)!=0){if(r7>>>0<=r41>>>0|r7>>>0>r5>>>0){r53=0;break}}r5=_sbrk(r58);r7=(r5|0)==(r46|0);r54=r7?r46:-1;r55=r7?r58:0;r56=r5;r57=r58;r2=1864;break}}while(0);L2587:do{if(r2==1864){r5=-r57|0;if((r54|0)!=-1){r59=r55,r60=r59>>2;r61=r54,r62=r61>>2;r2=1875;break L2565}do{if((r56|0)!=-1&r57>>>0<2147483647&r57>>>0<r39>>>0){r7=HEAP32[16494];r46=r40-r57+r7&-r7;if(r46>>>0>=2147483647){r63=r57;break}if((_sbrk(r46)|0)==-1){_sbrk(r5);r53=r55;break L2587}else{r63=r46+r57|0;break}}else{r63=r57}}while(0);if((r56|0)==-1){r53=r55}else{r59=r63,r60=r59>>2;r61=r56,r62=r61>>2;r2=1875;break L2565}}}while(0);HEAP32[17508]=HEAP32[17508]|4;r64=r53;r2=1872;break}else{r64=0;r2=1872}}while(0);do{if(r2==1872){if(r50>>>0>=2147483647){break}r53=_sbrk(r50);r56=_sbrk(0);if(!((r56|0)!=-1&(r53|0)!=-1&r53>>>0<r56>>>0)){break}r63=r56-r53|0;r56=r63>>>0>(r15+40|0)>>>0;r55=r56?r53:-1;if((r55|0)==-1){break}else{r59=r56?r63:r64,r60=r59>>2;r61=r55,r62=r61>>2;r2=1875;break}}}while(0);do{if(r2==1875){r64=HEAP32[17505]+r59|0;HEAP32[17505]=r64;if(r64>>>0>HEAP32[17506]>>>0){HEAP32[17506]=r64}r64=HEAP32[17403],r50=r64>>2;L2607:do{if((r64|0)==0){r55=HEAP32[17401];if((r55|0)==0|r61>>>0<r55>>>0){HEAP32[17401]=r61}HEAP32[17509]=r61;HEAP32[17510]=r59;HEAP32[17512]=0;HEAP32[17406]=HEAP32[16492];HEAP32[17405]=-1;r55=0;while(1){r63=r55<<1;r56=(r63<<2)+69628|0;HEAP32[(r63+3<<2)+69628>>2]=r56;HEAP32[(r63+2<<2)+69628>>2]=r56;r56=r55+1|0;if((r56|0)==32){break}else{r55=r56}}r55=r61+8|0;if((r55&7|0)==0){r65=0}else{r65=-r55&7}r55=r59-40-r65|0;HEAP32[17403]=r61+r65|0;HEAP32[17400]=r55;HEAP32[(r65+4>>2)+r62]=r55|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[17404]=HEAP32[16496]}else{r55=70036,r56=r55>>2;while(1){r66=HEAP32[r56];r67=r55+4|0;r68=HEAP32[r67>>2];if((r61|0)==(r66+r68|0)){r2=1887;break}r63=HEAP32[r56+2];if((r63|0)==0){break}else{r55=r63,r56=r55>>2}}do{if(r2==1887){if((HEAP32[r56+3]&8|0)!=0){break}r55=r64;if(!(r55>>>0>=r66>>>0&r55>>>0<r61>>>0)){break}HEAP32[r67>>2]=r68+r59|0;r55=HEAP32[17403];r63=HEAP32[17400]+r59|0;r53=r55;r57=r55+8|0;if((r57&7|0)==0){r69=0}else{r69=-r57&7}r57=r63-r69|0;HEAP32[17403]=r53+r69|0;HEAP32[17400]=r57;HEAP32[r69+(r53+4)>>2]=r57|1;HEAP32[r63+(r53+4)>>2]=40;HEAP32[17404]=HEAP32[16496];break L2607}}while(0);if(r61>>>0<HEAP32[17401]>>>0){HEAP32[17401]=r61}r56=r61+r59|0;r53=70036;while(1){r70=r53|0;if((HEAP32[r70>>2]|0)==(r56|0)){r2=1897;break}r63=HEAP32[r53+8>>2];if((r63|0)==0){break}else{r53=r63}}do{if(r2==1897){if((HEAP32[r53+12>>2]&8|0)!=0){break}HEAP32[r70>>2]=r61;r56=r53+4|0;HEAP32[r56>>2]=HEAP32[r56>>2]+r59|0;r56=r61+8|0;if((r56&7|0)==0){r71=0}else{r71=-r56&7}r56=r59+(r61+8)|0;if((r56&7|0)==0){r72=0,r73=r72>>2}else{r72=-r56&7,r73=r72>>2}r56=r61+r72+r59|0;r63=r56;r57=r71+r15|0,r55=r57>>2;r40=r61+r57|0;r57=r40;r39=r56-(r61+r71)-r15|0;HEAP32[(r71+4>>2)+r62]=r15|3;do{if((r63|0)==(HEAP32[17403]|0)){r54=HEAP32[17400]+r39|0;HEAP32[17400]=r54;HEAP32[17403]=r57;HEAP32[r55+(r62+1)]=r54|1}else{if((r63|0)==(HEAP32[17402]|0)){r54=HEAP32[17399]+r39|0;HEAP32[17399]=r54;HEAP32[17402]=r57;HEAP32[r55+(r62+1)]=r54|1;HEAP32[(r54>>2)+r62+r55]=r54;break}r54=r59+4|0;r58=HEAP32[(r54>>2)+r62+r73];if((r58&3|0)==1){r52=r58&-8;r51=r58>>>3;L2652:do{if(r58>>>0<256){r48=HEAP32[((r72|8)>>2)+r62+r60];r49=HEAP32[r73+(r62+(r60+3))];r5=(r51<<3)+69628|0;do{if((r48|0)!=(r5|0)){if(r48>>>0<HEAP32[17401]>>>0){_abort()}if((HEAP32[r48+12>>2]|0)==(r63|0)){break}_abort()}}while(0);if((r49|0)==(r48|0)){HEAP32[17397]=HEAP32[17397]&(1<<r51^-1);break}do{if((r49|0)==(r5|0)){r74=r49+8|0}else{if(r49>>>0<HEAP32[17401]>>>0){_abort()}r47=r49+8|0;if((HEAP32[r47>>2]|0)==(r63|0)){r74=r47;break}_abort()}}while(0);HEAP32[r48+12>>2]=r49;HEAP32[r74>>2]=r48}else{r5=r56;r47=HEAP32[((r72|24)>>2)+r62+r60];r46=HEAP32[r73+(r62+(r60+3))];L2654:do{if((r46|0)==(r5|0)){r7=r72|16;r41=r61+r54+r7|0;r17=HEAP32[r41>>2];do{if((r17|0)==0){r42=r61+r7+r59|0;r43=HEAP32[r42>>2];if((r43|0)==0){r75=0,r76=r75>>2;break L2654}else{r77=r43;r78=r42;break}}else{r77=r17;r78=r41}}while(0);while(1){r41=r77+20|0;r17=HEAP32[r41>>2];if((r17|0)!=0){r77=r17;r78=r41;continue}r41=r77+16|0;r17=HEAP32[r41>>2];if((r17|0)==0){break}else{r77=r17;r78=r41}}if(r78>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r78>>2]=0;r75=r77,r76=r75>>2;break}}else{r41=HEAP32[((r72|8)>>2)+r62+r60];if(r41>>>0<HEAP32[17401]>>>0){_abort()}r17=r41+12|0;if((HEAP32[r17>>2]|0)!=(r5|0)){_abort()}r7=r46+8|0;if((HEAP32[r7>>2]|0)==(r5|0)){HEAP32[r17>>2]=r46;HEAP32[r7>>2]=r41;r75=r46,r76=r75>>2;break}else{_abort()}}}while(0);if((r47|0)==0){break}r46=r72+(r61+(r59+28))|0;r48=(HEAP32[r46>>2]<<2)+69892|0;do{if((r5|0)==(HEAP32[r48>>2]|0)){HEAP32[r48>>2]=r75;if((r75|0)!=0){break}HEAP32[17398]=HEAP32[17398]&(1<<HEAP32[r46>>2]^-1);break L2652}else{if(r47>>>0<HEAP32[17401]>>>0){_abort()}r49=r47+16|0;if((HEAP32[r49>>2]|0)==(r5|0)){HEAP32[r49>>2]=r75}else{HEAP32[r47+20>>2]=r75}if((r75|0)==0){break L2652}}}while(0);if(r75>>>0<HEAP32[17401]>>>0){_abort()}HEAP32[r76+6]=r47;r5=r72|16;r46=HEAP32[(r5>>2)+r62+r60];do{if((r46|0)!=0){if(r46>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r76+4]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r46=HEAP32[(r54+r5>>2)+r62];if((r46|0)==0){break}if(r46>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r76+5]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r79=r61+(r52|r72)+r59|0;r80=r52+r39|0}else{r79=r63;r80=r39}r54=r79+4|0;HEAP32[r54>>2]=HEAP32[r54>>2]&-2;HEAP32[r55+(r62+1)]=r80|1;HEAP32[(r80>>2)+r62+r55]=r80;r54=r80>>>3;if(r80>>>0<256){r51=r54<<1;r58=(r51<<2)+69628|0;r46=HEAP32[17397];r47=1<<r54;do{if((r46&r47|0)==0){HEAP32[17397]=r46|r47;r81=r58;r82=(r51+2<<2)+69628|0}else{r54=(r51+2<<2)+69628|0;r48=HEAP32[r54>>2];if(r48>>>0>=HEAP32[17401]>>>0){r81=r48;r82=r54;break}_abort()}}while(0);HEAP32[r82>>2]=r57;HEAP32[r81+12>>2]=r57;HEAP32[r55+(r62+2)]=r81;HEAP32[r55+(r62+3)]=r58;break}r51=r40;r47=r80>>>8;do{if((r47|0)==0){r83=0}else{if(r80>>>0>16777215){r83=31;break}r46=(r47+1048320|0)>>>16&8;r52=r47<<r46;r54=(r52+520192|0)>>>16&4;r48=r52<<r54;r52=(r48+245760|0)>>>16&2;r49=14-(r54|r46|r52)+(r48<<r52>>>15)|0;r83=r80>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r83<<2)+69892|0;HEAP32[r55+(r62+7)]=r83;HEAP32[r55+(r62+5)]=0;HEAP32[r55+(r62+4)]=0;r58=HEAP32[17398];r49=1<<r83;if((r58&r49|0)==0){HEAP32[17398]=r58|r49;HEAP32[r47>>2]=r51;HEAP32[r55+(r62+6)]=r47;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}if((r83|0)==31){r84=0}else{r84=25-(r83>>>1)|0}r49=r80<<r84;r58=HEAP32[r47>>2];while(1){if((HEAP32[r58+4>>2]&-8|0)==(r80|0)){break}r85=(r49>>>31<<2)+r58+16|0;r47=HEAP32[r85>>2];if((r47|0)==0){r2=1970;break}else{r49=r49<<1;r58=r47}}if(r2==1970){if(r85>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r85>>2]=r51;HEAP32[r55+(r62+6)]=r58;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}}r49=r58+8|0;r47=HEAP32[r49>>2];r52=HEAP32[17401];if(r58>>>0<r52>>>0){_abort()}if(r47>>>0<r52>>>0){_abort()}else{HEAP32[r47+12>>2]=r51;HEAP32[r49>>2]=r51;HEAP32[r55+(r62+2)]=r47;HEAP32[r55+(r62+3)]=r58;HEAP32[r55+(r62+6)]=0;break}}}while(0);r14=r61+(r71|8)|0;return r14}}while(0);r53=r64;r55=70036,r40=r55>>2;while(1){r86=HEAP32[r40];if(r86>>>0<=r53>>>0){r87=HEAP32[r40+1];r88=r86+r87|0;if(r88>>>0>r53>>>0){break}}r55=HEAP32[r40+2],r40=r55>>2}r55=r86+(r87-39)|0;if((r55&7|0)==0){r89=0}else{r89=-r55&7}r55=r86+(r87-47)+r89|0;r40=r55>>>0<(r64+16|0)>>>0?r53:r55;r55=r40+8|0,r57=r55>>2;r39=r61+8|0;if((r39&7|0)==0){r90=0}else{r90=-r39&7}r39=r59-40-r90|0;HEAP32[17403]=r61+r90|0;HEAP32[17400]=r39;HEAP32[(r90+4>>2)+r62]=r39|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[17404]=HEAP32[16496];HEAP32[r40+4>>2]=27;HEAP32[r57]=HEAP32[17509];HEAP32[r57+1]=HEAP32[17510];HEAP32[r57+2]=HEAP32[17511];HEAP32[r57+3]=HEAP32[17512];HEAP32[17509]=r61;HEAP32[17510]=r59;HEAP32[17512]=0;HEAP32[17511]=r55;r55=r40+28|0;HEAP32[r55>>2]=7;L2771:do{if((r40+32|0)>>>0<r88>>>0){r57=r55;while(1){r39=r57+4|0;HEAP32[r39>>2]=7;if((r57+8|0)>>>0<r88>>>0){r57=r39}else{break L2771}}}}while(0);if((r40|0)==(r53|0)){break}r55=r40-r64|0;r57=r55+(r53+4)|0;HEAP32[r57>>2]=HEAP32[r57>>2]&-2;HEAP32[r50+1]=r55|1;HEAP32[r53+r55>>2]=r55;r57=r55>>>3;if(r55>>>0<256){r39=r57<<1;r63=(r39<<2)+69628|0;r56=HEAP32[17397];r47=1<<r57;do{if((r56&r47|0)==0){HEAP32[17397]=r56|r47;r91=r63;r92=(r39+2<<2)+69628|0}else{r57=(r39+2<<2)+69628|0;r49=HEAP32[r57>>2];if(r49>>>0>=HEAP32[17401]>>>0){r91=r49;r92=r57;break}_abort()}}while(0);HEAP32[r92>>2]=r64;HEAP32[r91+12>>2]=r64;HEAP32[r50+2]=r91;HEAP32[r50+3]=r63;break}r39=r64;r47=r55>>>8;do{if((r47|0)==0){r93=0}else{if(r55>>>0>16777215){r93=31;break}r56=(r47+1048320|0)>>>16&8;r53=r47<<r56;r40=(r53+520192|0)>>>16&4;r57=r53<<r40;r53=(r57+245760|0)>>>16&2;r49=14-(r40|r56|r53)+(r57<<r53>>>15)|0;r93=r55>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r93<<2)+69892|0;HEAP32[r50+7]=r93;HEAP32[r50+5]=0;HEAP32[r50+4]=0;r63=HEAP32[17398];r49=1<<r93;if((r63&r49|0)==0){HEAP32[17398]=r63|r49;HEAP32[r47>>2]=r39;HEAP32[r50+6]=r47;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}if((r93|0)==31){r94=0}else{r94=25-(r93>>>1)|0}r49=r55<<r94;r63=HEAP32[r47>>2];while(1){if((HEAP32[r63+4>>2]&-8|0)==(r55|0)){break}r95=(r49>>>31<<2)+r63+16|0;r47=HEAP32[r95>>2];if((r47|0)==0){r2=2005;break}else{r49=r49<<1;r63=r47}}if(r2==2005){if(r95>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r95>>2]=r39;HEAP32[r50+6]=r63;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}}r49=r63+8|0;r55=HEAP32[r49>>2];r47=HEAP32[17401];if(r63>>>0<r47>>>0){_abort()}if(r55>>>0<r47>>>0){_abort()}else{HEAP32[r55+12>>2]=r39;HEAP32[r49>>2]=r39;HEAP32[r50+2]=r55;HEAP32[r50+3]=r63;HEAP32[r50+6]=0;break}}}while(0);r50=HEAP32[17400];if(r50>>>0<=r15>>>0){break}r64=r50-r15|0;HEAP32[17400]=r64;r50=HEAP32[17403];r55=r50;HEAP32[17403]=r55+r15|0;HEAP32[(r55+4>>2)+r16]=r64|1;HEAP32[r50+4>>2]=r15|3;r14=r50+8|0;return r14}}while(0);r15=___errno_location();HEAP32[r15>>2]=12;r14=0;return r14}function _free(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r2=r1>>2;r3=0;if((r1|0)==0){return}r4=r1-8|0;r5=r4;r6=HEAP32[17401];if(r4>>>0<r6>>>0){_abort()}r7=HEAP32[r1-4>>2];r8=r7&3;if((r8|0)==1){_abort()}r9=r7&-8,r10=r9>>2;r11=r1+(r9-8)|0;r12=r11;L2824:do{if((r7&1|0)==0){r13=HEAP32[r4>>2];if((r8|0)==0){return}r14=-8-r13|0,r15=r14>>2;r16=r1+r14|0;r17=r16;r18=r13+r9|0;if(r16>>>0<r6>>>0){_abort()}if((r17|0)==(HEAP32[17402]|0)){r19=(r1+(r9-4)|0)>>2;if((HEAP32[r19]&3|0)!=3){r20=r17,r21=r20>>2;r22=r18;break}HEAP32[17399]=r18;HEAP32[r19]=HEAP32[r19]&-2;HEAP32[r15+(r2+1)]=r18|1;HEAP32[r11>>2]=r18;return}r19=r13>>>3;if(r13>>>0<256){r13=HEAP32[r15+(r2+2)];r23=HEAP32[r15+(r2+3)];r24=(r19<<3)+69628|0;do{if((r13|0)!=(r24|0)){if(r13>>>0<r6>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r17|0)){break}_abort()}}while(0);if((r23|0)==(r13|0)){HEAP32[17397]=HEAP32[17397]&(1<<r19^-1);r20=r17,r21=r20>>2;r22=r18;break}do{if((r23|0)==(r24|0)){r25=r23+8|0}else{if(r23>>>0<r6>>>0){_abort()}r26=r23+8|0;if((HEAP32[r26>>2]|0)==(r17|0)){r25=r26;break}_abort()}}while(0);HEAP32[r13+12>>2]=r23;HEAP32[r25>>2]=r13;r20=r17,r21=r20>>2;r22=r18;break}r24=r16;r19=HEAP32[r15+(r2+6)];r26=HEAP32[r15+(r2+3)];L2858:do{if((r26|0)==(r24|0)){r27=r14+(r1+20)|0;r28=HEAP32[r27>>2];do{if((r28|0)==0){r29=r14+(r1+16)|0;r30=HEAP32[r29>>2];if((r30|0)==0){r31=0,r32=r31>>2;break L2858}else{r33=r30;r34=r29;break}}else{r33=r28;r34=r27}}while(0);while(1){r27=r33+20|0;r28=HEAP32[r27>>2];if((r28|0)!=0){r33=r28;r34=r27;continue}r27=r33+16|0;r28=HEAP32[r27>>2];if((r28|0)==0){break}else{r33=r28;r34=r27}}if(r34>>>0<r6>>>0){_abort()}else{HEAP32[r34>>2]=0;r31=r33,r32=r31>>2;break}}else{r27=HEAP32[r15+(r2+2)];if(r27>>>0<r6>>>0){_abort()}r28=r27+12|0;if((HEAP32[r28>>2]|0)!=(r24|0)){_abort()}r29=r26+8|0;if((HEAP32[r29>>2]|0)==(r24|0)){HEAP32[r28>>2]=r26;HEAP32[r29>>2]=r27;r31=r26,r32=r31>>2;break}else{_abort()}}}while(0);if((r19|0)==0){r20=r17,r21=r20>>2;r22=r18;break}r26=r14+(r1+28)|0;r16=(HEAP32[r26>>2]<<2)+69892|0;do{if((r24|0)==(HEAP32[r16>>2]|0)){HEAP32[r16>>2]=r31;if((r31|0)!=0){break}HEAP32[17398]=HEAP32[17398]&(1<<HEAP32[r26>>2]^-1);r20=r17,r21=r20>>2;r22=r18;break L2824}else{if(r19>>>0<HEAP32[17401]>>>0){_abort()}r13=r19+16|0;if((HEAP32[r13>>2]|0)==(r24|0)){HEAP32[r13>>2]=r31}else{HEAP32[r19+20>>2]=r31}if((r31|0)==0){r20=r17,r21=r20>>2;r22=r18;break L2824}}}while(0);if(r31>>>0<HEAP32[17401]>>>0){_abort()}HEAP32[r32+6]=r19;r24=HEAP32[r15+(r2+4)];do{if((r24|0)!=0){if(r24>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r32+4]=r24;HEAP32[r24+24>>2]=r31;break}}}while(0);r24=HEAP32[r15+(r2+5)];if((r24|0)==0){r20=r17,r21=r20>>2;r22=r18;break}if(r24>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r32+5]=r24;HEAP32[r24+24>>2]=r31;r20=r17,r21=r20>>2;r22=r18;break}}else{r20=r5,r21=r20>>2;r22=r9}}while(0);r5=r20,r31=r5>>2;if(r5>>>0>=r11>>>0){_abort()}r5=r1+(r9-4)|0;r32=HEAP32[r5>>2];if((r32&1|0)==0){_abort()}do{if((r32&2|0)==0){if((r12|0)==(HEAP32[17403]|0)){r6=HEAP32[17400]+r22|0;HEAP32[17400]=r6;HEAP32[17403]=r20;HEAP32[r21+1]=r6|1;if((r20|0)==(HEAP32[17402]|0)){HEAP32[17402]=0;HEAP32[17399]=0}if(r6>>>0<=HEAP32[17404]>>>0){return}_sys_trim(0);return}if((r12|0)==(HEAP32[17402]|0)){r6=HEAP32[17399]+r22|0;HEAP32[17399]=r6;HEAP32[17402]=r20;HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;return}r6=(r32&-8)+r22|0;r33=r32>>>3;L2929:do{if(r32>>>0<256){r34=HEAP32[r2+r10];r25=HEAP32[((r9|4)>>2)+r2];r8=(r33<<3)+69628|0;do{if((r34|0)!=(r8|0)){if(r34>>>0<HEAP32[17401]>>>0){_abort()}if((HEAP32[r34+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r25|0)==(r34|0)){HEAP32[17397]=HEAP32[17397]&(1<<r33^-1);break}do{if((r25|0)==(r8|0)){r35=r25+8|0}else{if(r25>>>0<HEAP32[17401]>>>0){_abort()}r4=r25+8|0;if((HEAP32[r4>>2]|0)==(r12|0)){r35=r4;break}_abort()}}while(0);HEAP32[r34+12>>2]=r25;HEAP32[r35>>2]=r34}else{r8=r11;r4=HEAP32[r10+(r2+4)];r7=HEAP32[((r9|4)>>2)+r2];L2931:do{if((r7|0)==(r8|0)){r24=r9+(r1+12)|0;r19=HEAP32[r24>>2];do{if((r19|0)==0){r26=r9+(r1+8)|0;r16=HEAP32[r26>>2];if((r16|0)==0){r36=0,r37=r36>>2;break L2931}else{r38=r16;r39=r26;break}}else{r38=r19;r39=r24}}while(0);while(1){r24=r38+20|0;r19=HEAP32[r24>>2];if((r19|0)!=0){r38=r19;r39=r24;continue}r24=r38+16|0;r19=HEAP32[r24>>2];if((r19|0)==0){break}else{r38=r19;r39=r24}}if(r39>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r39>>2]=0;r36=r38,r37=r36>>2;break}}else{r24=HEAP32[r2+r10];if(r24>>>0<HEAP32[17401]>>>0){_abort()}r19=r24+12|0;if((HEAP32[r19>>2]|0)!=(r8|0)){_abort()}r26=r7+8|0;if((HEAP32[r26>>2]|0)==(r8|0)){HEAP32[r19>>2]=r7;HEAP32[r26>>2]=r24;r36=r7,r37=r36>>2;break}else{_abort()}}}while(0);if((r4|0)==0){break}r7=r9+(r1+20)|0;r34=(HEAP32[r7>>2]<<2)+69892|0;do{if((r8|0)==(HEAP32[r34>>2]|0)){HEAP32[r34>>2]=r36;if((r36|0)!=0){break}HEAP32[17398]=HEAP32[17398]&(1<<HEAP32[r7>>2]^-1);break L2929}else{if(r4>>>0<HEAP32[17401]>>>0){_abort()}r25=r4+16|0;if((HEAP32[r25>>2]|0)==(r8|0)){HEAP32[r25>>2]=r36}else{HEAP32[r4+20>>2]=r36}if((r36|0)==0){break L2929}}}while(0);if(r36>>>0<HEAP32[17401]>>>0){_abort()}HEAP32[r37+6]=r4;r8=HEAP32[r10+(r2+2)];do{if((r8|0)!=0){if(r8>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r37+4]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);r8=HEAP32[r10+(r2+3)];if((r8|0)==0){break}if(r8>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r37+5]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;if((r20|0)!=(HEAP32[17402]|0)){r40=r6;break}HEAP32[17399]=r6;return}else{HEAP32[r5>>2]=r32&-2;HEAP32[r21+1]=r22|1;HEAP32[(r22>>2)+r31]=r22;r40=r22}}while(0);r22=r40>>>3;if(r40>>>0<256){r31=r22<<1;r32=(r31<<2)+69628|0;r5=HEAP32[17397];r36=1<<r22;do{if((r5&r36|0)==0){HEAP32[17397]=r5|r36;r41=r32;r42=(r31+2<<2)+69628|0}else{r22=(r31+2<<2)+69628|0;r37=HEAP32[r22>>2];if(r37>>>0>=HEAP32[17401]>>>0){r41=r37;r42=r22;break}_abort()}}while(0);HEAP32[r42>>2]=r20;HEAP32[r41+12>>2]=r20;HEAP32[r21+2]=r41;HEAP32[r21+3]=r32;return}r32=r20;r41=r40>>>8;do{if((r41|0)==0){r43=0}else{if(r40>>>0>16777215){r43=31;break}r42=(r41+1048320|0)>>>16&8;r31=r41<<r42;r36=(r31+520192|0)>>>16&4;r5=r31<<r36;r31=(r5+245760|0)>>>16&2;r22=14-(r36|r42|r31)+(r5<<r31>>>15)|0;r43=r40>>>((r22+7|0)>>>0)&1|r22<<1}}while(0);r41=(r43<<2)+69892|0;HEAP32[r21+7]=r43;HEAP32[r21+5]=0;HEAP32[r21+4]=0;r22=HEAP32[17398];r31=1<<r43;do{if((r22&r31|0)==0){HEAP32[17398]=r22|r31;HEAP32[r41>>2]=r32;HEAP32[r21+6]=r41;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20}else{if((r43|0)==31){r44=0}else{r44=25-(r43>>>1)|0}r5=r40<<r44;r42=HEAP32[r41>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r40|0)){break}r45=(r5>>>31<<2)+r42+16|0;r36=HEAP32[r45>>2];if((r36|0)==0){r3=2184;break}else{r5=r5<<1;r42=r36}}if(r3==2184){if(r45>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r45>>2]=r32;HEAP32[r21+6]=r42;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20;break}}r5=r42+8|0;r6=HEAP32[r5>>2];r36=HEAP32[17401];if(r42>>>0<r36>>>0){_abort()}if(r6>>>0<r36>>>0){_abort()}else{HEAP32[r6+12>>2]=r32;HEAP32[r5>>2]=r32;HEAP32[r21+2]=r6;HEAP32[r21+3]=r42;HEAP32[r21+6]=0;break}}}while(0);r21=HEAP32[17405]-1|0;HEAP32[17405]=r21;if((r21|0)==0){r46=70044}else{return}while(1){r21=HEAP32[r46>>2];if((r21|0)==0){break}else{r46=r21+8|0}}HEAP32[17405]=-1;return}function _realloc(r1,r2){var r3,r4,r5,r6;if((r1|0)==0){r3=_malloc(r2);return r3}if(r2>>>0>4294967231){r4=___errno_location();HEAP32[r4>>2]=12;r3=0;return r3}if(r2>>>0<11){r5=16}else{r5=r2+11&-8}r4=_try_realloc_chunk(r1-8|0,r5);if((r4|0)!=0){r3=r4+8|0;return r3}r4=_malloc(r2);if((r4|0)==0){r3=0;return r3}r5=HEAP32[r1-4>>2];r6=(r5&-8)-((r5&3|0)==0?8:4)|0;_memcpy(r4,r1,r6>>>0<r2>>>0?r6:r2);_free(r1);r3=r4;return r3}function _sys_trim(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;do{if((HEAP32[16492]|0)==0){r2=_sysconf(8);if((r2-1&r2|0)==0){HEAP32[16494]=r2;HEAP32[16493]=r2;HEAP32[16495]=-1;HEAP32[16496]=2097152;HEAP32[16497]=0;HEAP32[17508]=0;r2=_time(0)&-16^1431655768;HEAP32[16492]=r2;break}else{_abort()}}}while(0);if(r1>>>0>=4294967232){r3=0;r4=r3&1;return r4}r2=HEAP32[17403];if((r2|0)==0){r3=0;r4=r3&1;return r4}r5=HEAP32[17400];do{if(r5>>>0>(r1+40|0)>>>0){r6=HEAP32[16494];r7=Math.imul(Math.floor(((-40-r1-1+r5+r6|0)>>>0)/(r6>>>0))-1|0,r6);r8=r2;r9=70036,r10=r9>>2;while(1){r11=HEAP32[r10];if(r11>>>0<=r8>>>0){if((r11+HEAP32[r10+1]|0)>>>0>r8>>>0){r12=r9;break}}r11=HEAP32[r10+2];if((r11|0)==0){r12=0;break}else{r9=r11,r10=r9>>2}}if((HEAP32[r12+12>>2]&8|0)!=0){break}r9=_sbrk(0);r10=(r12+4|0)>>2;if((r9|0)!=(HEAP32[r12>>2]+HEAP32[r10]|0)){break}r8=_sbrk(-(r7>>>0>2147483646?-2147483648-r6|0:r7)|0);r11=_sbrk(0);if(!((r8|0)!=-1&r11>>>0<r9>>>0)){break}r8=r9-r11|0;if((r9|0)==(r11|0)){break}HEAP32[r10]=HEAP32[r10]-r8|0;HEAP32[17505]=HEAP32[17505]-r8|0;r10=HEAP32[17403];r13=HEAP32[17400]-r8|0;r8=r10;r14=r10+8|0;if((r14&7|0)==0){r15=0}else{r15=-r14&7}r14=r13-r15|0;HEAP32[17403]=r8+r15|0;HEAP32[17400]=r14;HEAP32[r15+(r8+4)>>2]=r14|1;HEAP32[r13+(r8+4)>>2]=40;HEAP32[17404]=HEAP32[16496];r3=(r9|0)!=(r11|0);r4=r3&1;return r4}}while(0);if(HEAP32[17400]>>>0<=HEAP32[17404]>>>0){r3=0;r4=r3&1;return r4}HEAP32[17404]=-1;r3=0;r4=r3&1;return r4}function _try_realloc_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29;r3=(r1+4|0)>>2;r4=HEAP32[r3];r5=r4&-8,r6=r5>>2;r7=r1,r8=r7>>2;r9=r7+r5|0;r10=r9;r11=HEAP32[17401];if(r7>>>0<r11>>>0){_abort()}r12=r4&3;if(!((r12|0)!=1&r7>>>0<r9>>>0)){_abort()}r13=(r7+(r5|4)|0)>>2;r14=HEAP32[r13];if((r14&1|0)==0){_abort()}if((r12|0)==0){if(r2>>>0<256){r15=0;return r15}do{if(r5>>>0>=(r2+4|0)>>>0){if((r5-r2|0)>>>0>HEAP32[16494]<<1>>>0){break}else{r15=r1}return r15}}while(0);r15=0;return r15}if(r5>>>0>=r2>>>0){r12=r5-r2|0;if(r12>>>0<=15){r15=r1;return r15}HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|3;HEAP32[r13]=HEAP32[r13]|1;_dispose_chunk(r7+r2|0,r12);r15=r1;return r15}if((r10|0)==(HEAP32[17403]|0)){r12=HEAP32[17400]+r5|0;if(r12>>>0<=r2>>>0){r15=0;return r15}r13=r12-r2|0;HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r13|1;HEAP32[17403]=r7+r2|0;HEAP32[17400]=r13;r15=r1;return r15}if((r10|0)==(HEAP32[17402]|0)){r13=HEAP32[17399]+r5|0;if(r13>>>0<r2>>>0){r15=0;return r15}r12=r13-r2|0;if(r12>>>0>15){HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|1;HEAP32[(r13>>2)+r8]=r12;r16=r13+(r7+4)|0;HEAP32[r16>>2]=HEAP32[r16>>2]&-2;r17=r7+r2|0;r18=r12}else{HEAP32[r3]=r4&1|r13|2;r4=r13+(r7+4)|0;HEAP32[r4>>2]=HEAP32[r4>>2]|1;r17=0;r18=0}HEAP32[17399]=r18;HEAP32[17402]=r17;r15=r1;return r15}if((r14&2|0)!=0){r15=0;return r15}r17=(r14&-8)+r5|0;if(r17>>>0<r2>>>0){r15=0;return r15}r18=r17-r2|0;r4=r14>>>3;L3150:do{if(r14>>>0<256){r13=HEAP32[r6+(r8+2)];r12=HEAP32[r6+(r8+3)];r16=(r4<<3)+69628|0;do{if((r13|0)!=(r16|0)){if(r13>>>0<r11>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r10|0)){break}_abort()}}while(0);if((r12|0)==(r13|0)){HEAP32[17397]=HEAP32[17397]&(1<<r4^-1);break}do{if((r12|0)==(r16|0)){r19=r12+8|0}else{if(r12>>>0<r11>>>0){_abort()}r20=r12+8|0;if((HEAP32[r20>>2]|0)==(r10|0)){r19=r20;break}_abort()}}while(0);HEAP32[r13+12>>2]=r12;HEAP32[r19>>2]=r13}else{r16=r9;r20=HEAP32[r6+(r8+6)];r21=HEAP32[r6+(r8+3)];L3171:do{if((r21|0)==(r16|0)){r22=r5+(r7+20)|0;r23=HEAP32[r22>>2];do{if((r23|0)==0){r24=r5+(r7+16)|0;r25=HEAP32[r24>>2];if((r25|0)==0){r26=0,r27=r26>>2;break L3171}else{r28=r25;r29=r24;break}}else{r28=r23;r29=r22}}while(0);while(1){r22=r28+20|0;r23=HEAP32[r22>>2];if((r23|0)!=0){r28=r23;r29=r22;continue}r22=r28+16|0;r23=HEAP32[r22>>2];if((r23|0)==0){break}else{r28=r23;r29=r22}}if(r29>>>0<r11>>>0){_abort()}else{HEAP32[r29>>2]=0;r26=r28,r27=r26>>2;break}}else{r22=HEAP32[r6+(r8+2)];if(r22>>>0<r11>>>0){_abort()}r23=r22+12|0;if((HEAP32[r23>>2]|0)!=(r16|0)){_abort()}r24=r21+8|0;if((HEAP32[r24>>2]|0)==(r16|0)){HEAP32[r23>>2]=r21;HEAP32[r24>>2]=r22;r26=r21,r27=r26>>2;break}else{_abort()}}}while(0);if((r20|0)==0){break}r21=r5+(r7+28)|0;r13=(HEAP32[r21>>2]<<2)+69892|0;do{if((r16|0)==(HEAP32[r13>>2]|0)){HEAP32[r13>>2]=r26;if((r26|0)!=0){break}HEAP32[17398]=HEAP32[17398]&(1<<HEAP32[r21>>2]^-1);break L3150}else{if(r20>>>0<HEAP32[17401]>>>0){_abort()}r12=r20+16|0;if((HEAP32[r12>>2]|0)==(r16|0)){HEAP32[r12>>2]=r26}else{HEAP32[r20+20>>2]=r26}if((r26|0)==0){break L3150}}}while(0);if(r26>>>0<HEAP32[17401]>>>0){_abort()}HEAP32[r27+6]=r20;r16=HEAP32[r6+(r8+4)];do{if((r16|0)!=0){if(r16>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r27+4]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);r16=HEAP32[r6+(r8+5)];if((r16|0)==0){break}if(r16>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r27+5]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);if(r18>>>0<16){HEAP32[r3]=r17|HEAP32[r3]&1|2;r26=r7+(r17|4)|0;HEAP32[r26>>2]=HEAP32[r26>>2]|1;r15=r1;return r15}else{HEAP32[r3]=HEAP32[r3]&1|r2|2;HEAP32[(r2+4>>2)+r8]=r18|3;r8=r7+(r17|4)|0;HEAP32[r8>>2]=HEAP32[r8>>2]|1;_dispose_chunk(r7+r2|0,r18);r15=r1;return r15}}function _dispose_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43;r3=r2>>2;r4=0;r5=r1,r6=r5>>2;r7=r5+r2|0;r8=r7;r9=HEAP32[r1+4>>2];L3226:do{if((r9&1|0)==0){r10=HEAP32[r1>>2];if((r9&3|0)==0){return}r11=r5+ -r10|0;r12=r11;r13=r10+r2|0;r14=HEAP32[17401];if(r11>>>0<r14>>>0){_abort()}if((r12|0)==(HEAP32[17402]|0)){r15=(r2+(r5+4)|0)>>2;if((HEAP32[r15]&3|0)!=3){r16=r12,r17=r16>>2;r18=r13;break}HEAP32[17399]=r13;HEAP32[r15]=HEAP32[r15]&-2;HEAP32[(4-r10>>2)+r6]=r13|1;HEAP32[r7>>2]=r13;return}r15=r10>>>3;if(r10>>>0<256){r19=HEAP32[(8-r10>>2)+r6];r20=HEAP32[(12-r10>>2)+r6];r21=(r15<<3)+69628|0;do{if((r19|0)!=(r21|0)){if(r19>>>0<r14>>>0){_abort()}if((HEAP32[r19+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r20|0)==(r19|0)){HEAP32[17397]=HEAP32[17397]&(1<<r15^-1);r16=r12,r17=r16>>2;r18=r13;break}do{if((r20|0)==(r21|0)){r22=r20+8|0}else{if(r20>>>0<r14>>>0){_abort()}r23=r20+8|0;if((HEAP32[r23>>2]|0)==(r12|0)){r22=r23;break}_abort()}}while(0);HEAP32[r19+12>>2]=r20;HEAP32[r22>>2]=r19;r16=r12,r17=r16>>2;r18=r13;break}r21=r11;r15=HEAP32[(24-r10>>2)+r6];r23=HEAP32[(12-r10>>2)+r6];L3260:do{if((r23|0)==(r21|0)){r24=16-r10|0;r25=r24+(r5+4)|0;r26=HEAP32[r25>>2];do{if((r26|0)==0){r27=r5+r24|0;r28=HEAP32[r27>>2];if((r28|0)==0){r29=0,r30=r29>>2;break L3260}else{r31=r28;r32=r27;break}}else{r31=r26;r32=r25}}while(0);while(1){r25=r31+20|0;r26=HEAP32[r25>>2];if((r26|0)!=0){r31=r26;r32=r25;continue}r25=r31+16|0;r26=HEAP32[r25>>2];if((r26|0)==0){break}else{r31=r26;r32=r25}}if(r32>>>0<r14>>>0){_abort()}else{HEAP32[r32>>2]=0;r29=r31,r30=r29>>2;break}}else{r25=HEAP32[(8-r10>>2)+r6];if(r25>>>0<r14>>>0){_abort()}r26=r25+12|0;if((HEAP32[r26>>2]|0)!=(r21|0)){_abort()}r24=r23+8|0;if((HEAP32[r24>>2]|0)==(r21|0)){HEAP32[r26>>2]=r23;HEAP32[r24>>2]=r25;r29=r23,r30=r29>>2;break}else{_abort()}}}while(0);if((r15|0)==0){r16=r12,r17=r16>>2;r18=r13;break}r23=r5+(28-r10)|0;r14=(HEAP32[r23>>2]<<2)+69892|0;do{if((r21|0)==(HEAP32[r14>>2]|0)){HEAP32[r14>>2]=r29;if((r29|0)!=0){break}HEAP32[17398]=HEAP32[17398]&(1<<HEAP32[r23>>2]^-1);r16=r12,r17=r16>>2;r18=r13;break L3226}else{if(r15>>>0<HEAP32[17401]>>>0){_abort()}r11=r15+16|0;if((HEAP32[r11>>2]|0)==(r21|0)){HEAP32[r11>>2]=r29}else{HEAP32[r15+20>>2]=r29}if((r29|0)==0){r16=r12,r17=r16>>2;r18=r13;break L3226}}}while(0);if(r29>>>0<HEAP32[17401]>>>0){_abort()}HEAP32[r30+6]=r15;r21=16-r10|0;r23=HEAP32[(r21>>2)+r6];do{if((r23|0)!=0){if(r23>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r30+4]=r23;HEAP32[r23+24>>2]=r29;break}}}while(0);r23=HEAP32[(r21+4>>2)+r6];if((r23|0)==0){r16=r12,r17=r16>>2;r18=r13;break}if(r23>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r30+5]=r23;HEAP32[r23+24>>2]=r29;r16=r12,r17=r16>>2;r18=r13;break}}else{r16=r1,r17=r16>>2;r18=r2}}while(0);r1=HEAP32[17401];if(r7>>>0<r1>>>0){_abort()}r29=r2+(r5+4)|0;r30=HEAP32[r29>>2];do{if((r30&2|0)==0){if((r8|0)==(HEAP32[17403]|0)){r31=HEAP32[17400]+r18|0;HEAP32[17400]=r31;HEAP32[17403]=r16;HEAP32[r17+1]=r31|1;if((r16|0)!=(HEAP32[17402]|0)){return}HEAP32[17402]=0;HEAP32[17399]=0;return}if((r8|0)==(HEAP32[17402]|0)){r31=HEAP32[17399]+r18|0;HEAP32[17399]=r31;HEAP32[17402]=r16;HEAP32[r17+1]=r31|1;HEAP32[(r31>>2)+r17]=r31;return}r31=(r30&-8)+r18|0;r32=r30>>>3;L3325:do{if(r30>>>0<256){r22=HEAP32[r3+(r6+2)];r9=HEAP32[r3+(r6+3)];r23=(r32<<3)+69628|0;do{if((r22|0)!=(r23|0)){if(r22>>>0<r1>>>0){_abort()}if((HEAP32[r22+12>>2]|0)==(r8|0)){break}_abort()}}while(0);if((r9|0)==(r22|0)){HEAP32[17397]=HEAP32[17397]&(1<<r32^-1);break}do{if((r9|0)==(r23|0)){r33=r9+8|0}else{if(r9>>>0<r1>>>0){_abort()}r10=r9+8|0;if((HEAP32[r10>>2]|0)==(r8|0)){r33=r10;break}_abort()}}while(0);HEAP32[r22+12>>2]=r9;HEAP32[r33>>2]=r22}else{r23=r7;r10=HEAP32[r3+(r6+6)];r15=HEAP32[r3+(r6+3)];L3327:do{if((r15|0)==(r23|0)){r14=r2+(r5+20)|0;r11=HEAP32[r14>>2];do{if((r11|0)==0){r19=r2+(r5+16)|0;r20=HEAP32[r19>>2];if((r20|0)==0){r34=0,r35=r34>>2;break L3327}else{r36=r20;r37=r19;break}}else{r36=r11;r37=r14}}while(0);while(1){r14=r36+20|0;r11=HEAP32[r14>>2];if((r11|0)!=0){r36=r11;r37=r14;continue}r14=r36+16|0;r11=HEAP32[r14>>2];if((r11|0)==0){break}else{r36=r11;r37=r14}}if(r37>>>0<r1>>>0){_abort()}else{HEAP32[r37>>2]=0;r34=r36,r35=r34>>2;break}}else{r14=HEAP32[r3+(r6+2)];if(r14>>>0<r1>>>0){_abort()}r11=r14+12|0;if((HEAP32[r11>>2]|0)!=(r23|0)){_abort()}r19=r15+8|0;if((HEAP32[r19>>2]|0)==(r23|0)){HEAP32[r11>>2]=r15;HEAP32[r19>>2]=r14;r34=r15,r35=r34>>2;break}else{_abort()}}}while(0);if((r10|0)==0){break}r15=r2+(r5+28)|0;r22=(HEAP32[r15>>2]<<2)+69892|0;do{if((r23|0)==(HEAP32[r22>>2]|0)){HEAP32[r22>>2]=r34;if((r34|0)!=0){break}HEAP32[17398]=HEAP32[17398]&(1<<HEAP32[r15>>2]^-1);break L3325}else{if(r10>>>0<HEAP32[17401]>>>0){_abort()}r9=r10+16|0;if((HEAP32[r9>>2]|0)==(r23|0)){HEAP32[r9>>2]=r34}else{HEAP32[r10+20>>2]=r34}if((r34|0)==0){break L3325}}}while(0);if(r34>>>0<HEAP32[17401]>>>0){_abort()}HEAP32[r35+6]=r10;r23=HEAP32[r3+(r6+4)];do{if((r23|0)!=0){if(r23>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r35+4]=r23;HEAP32[r23+24>>2]=r34;break}}}while(0);r23=HEAP32[r3+(r6+5)];if((r23|0)==0){break}if(r23>>>0<HEAP32[17401]>>>0){_abort()}else{HEAP32[r35+5]=r23;HEAP32[r23+24>>2]=r34;break}}}while(0);HEAP32[r17+1]=r31|1;HEAP32[(r31>>2)+r17]=r31;if((r16|0)!=(HEAP32[17402]|0)){r38=r31;break}HEAP32[17399]=r31;return}else{HEAP32[r29>>2]=r30&-2;HEAP32[r17+1]=r18|1;HEAP32[(r18>>2)+r17]=r18;r38=r18}}while(0);r18=r38>>>3;if(r38>>>0<256){r30=r18<<1;r29=(r30<<2)+69628|0;r34=HEAP32[17397];r35=1<<r18;do{if((r34&r35|0)==0){HEAP32[17397]=r34|r35;r39=r29;r40=(r30+2<<2)+69628|0}else{r18=(r30+2<<2)+69628|0;r6=HEAP32[r18>>2];if(r6>>>0>=HEAP32[17401]>>>0){r39=r6;r40=r18;break}_abort()}}while(0);HEAP32[r40>>2]=r16;HEAP32[r39+12>>2]=r16;HEAP32[r17+2]=r39;HEAP32[r17+3]=r29;return}r29=r16;r39=r38>>>8;do{if((r39|0)==0){r41=0}else{if(r38>>>0>16777215){r41=31;break}r40=(r39+1048320|0)>>>16&8;r30=r39<<r40;r35=(r30+520192|0)>>>16&4;r34=r30<<r35;r30=(r34+245760|0)>>>16&2;r18=14-(r35|r40|r30)+(r34<<r30>>>15)|0;r41=r38>>>((r18+7|0)>>>0)&1|r18<<1}}while(0);r39=(r41<<2)+69892|0;HEAP32[r17+7]=r41;HEAP32[r17+5]=0;HEAP32[r17+4]=0;r18=HEAP32[17398];r30=1<<r41;if((r18&r30|0)==0){HEAP32[17398]=r18|r30;HEAP32[r39>>2]=r29;HEAP32[r17+6]=r39;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}if((r41|0)==31){r42=0}else{r42=25-(r41>>>1)|0}r41=r38<<r42;r42=HEAP32[r39>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r38|0)){break}r43=(r41>>>31<<2)+r42+16|0;r39=HEAP32[r43>>2];if((r39|0)==0){r4=2490;break}else{r41=r41<<1;r42=r39}}if(r4==2490){if(r43>>>0<HEAP32[17401]>>>0){_abort()}HEAP32[r43>>2]=r29;HEAP32[r17+6]=r42;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}r16=r42+8|0;r43=HEAP32[r16>>2];r4=HEAP32[17401];if(r42>>>0<r4>>>0){_abort()}if(r43>>>0<r4>>>0){_abort()}HEAP32[r43+12>>2]=r29;HEAP32[r16>>2]=r29;HEAP32[r17+2]=r43;HEAP32[r17+3]=r42;HEAP32[r17+6]=0;return}
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
