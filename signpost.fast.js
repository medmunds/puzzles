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
STATICTOP += 3220;
assert(STATICTOP < TOTAL_MEMORY);
var _stderr;
allocate([0,0,0,0,0,0,0,0,0,0,0,0,54,0,0,0,68,0,0,0,36,0,0,0,72,0,0,0,42,0,0,0,64,0,0,0,1,0,0,0,66,0,0,0,38,0,0,0,6,0,0,0,100,0,0,0,30,0,0,0,106,0,0,0,10,0,0,0,2,0,0,0,1,0,0,0,24,0,0,0,1,0,0,0,90,0,0,0,8,0,0,0,60,0,0,0,62,0,0,0,16,0,0,0,40,0,0,0,12,0,0,0,98,0,0,0,102,0,0,0,48,0,0,0,44,0,0,0,22,0,0,0,88,0,0,0,48,0,0,0,4,0,0,0,52,0,0,0,18,0,0,0,84,0,0,0,70,0,0,0,1,0,0,0,0,0,0,0,94,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,78,0,0,0,1024,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0], ALLOC_NONE, 65536);
allocate([4,0,0,0,4,0,0,0,1,0,0,0,4,0,0,0,4,0,0,0,0,0,0,0,5,0,0,0,5,0,0,0,1,0,0,0,5,0,0,0,5,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,1,0,0,0,7,0,0,0,7,0,0,0,1,0,0,0], "i8", ALLOC_NONE, 65728);
allocate(24, "i8", ALLOC_NONE, 65800);
allocate([255,255,255,255], "i8", ALLOC_NONE, 65824);
allocate([255,255,255,255], "i8", ALLOC_NONE, 65828);
allocate([255,255,255,255,255,255,255,255,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255], "i8", ALLOC_NONE, 65832);
allocate([0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,255,255,255,255], "i8", ALLOC_NONE, 65864);
allocate(32, "i8", ALLOC_NONE, 65896);
allocate([76,0,0,0,28,0,0,0,20,0,0,0,104,0,0,0,108,0,0,0,14,0,0,0,50,0,0,0,32,0,0,0,46,0,0,0,58,0,0,0,96,0,0,0,82,0,0,0,86,0,0,0,92,0,0,0,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,0,0,0,34,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NONE, 65928);
allocate([255,255,255,0,122,160,255,0,152,251,152,0,212,255,127,0,219,112,147,0,0,165,255,0,250,206,135,0,0,255,255,0], "i8", ALLOC_NONE, 66028);
allocate([109,101,45,62,115,116,97,116,101,112,111,115,32,62,61,32,49,0] /* me-_statepos _= 1\00 */, "i8", ALLOC_NONE, 66060);
allocate([83,73,71,78,80,79,83,84,95,71,69,65,82,83,0] /* SIGNPOST_GEARS\00 */, "i8", ALLOC_NONE, 66080);
allocate([82,117,110,110,105,110,103,32,115,111,108,118,101,114,32,115,111,97,107,32,116,101,115,116,115,10,0] /* Running solver soak  */, "i8", ALLOC_NONE, 66096);
allocate([105,50,32,61,61,32,105,110,118,101,114,115,101,0] /* i2 == inverse\00 */, "i8", ALLOC_NONE, 66124);
allocate([115,32,33,61,32,78,85,76,76,0] /* s != NULL\00 */, "i8", ALLOC_NONE, 66140);
allocate([100,114,97,119,105,110,103,46,99,0] /* drawing.c\00 */, "i8", ALLOC_NONE, 66152);
allocate([44,32,102,114,101,101,32,101,110,100,115,0] /* , free ends\00 */, "i8", ALLOC_NONE, 66164);
allocate([37,100,120,37,100,0] /* %dx%d\00 */, "i8", ALLOC_NONE, 66176);
allocate([37,115,95,84,69,83,84,83,79,76,86,69,0] /* %s_TESTSOLVE\00 */, "i8", ALLOC_NONE, 66184);
allocate([118,50,32,61,61,32,118,49,0] /* v2 == v1\00 */, "i8", ALLOC_NONE, 66200);
allocate([99,0] /* c\00 */, "i8", ALLOC_NONE, 66212);
allocate([37,100,120,37,100,37,115,0] /* %dx%d%s\00 */, "i8", ALLOC_NONE, 66216);
allocate([100,115,45,62,100,114,97,103,98,0] /* ds-_dragb\00 */, "i8", ALLOC_NONE, 66224);
allocate([83,116,97,114,116,32,97,110,100,32,101,110,100,32,105,110,32,99,111,114,110,101,114,115,0] /* Start and end in cor */, "i8", ALLOC_NONE, 66236);
allocate([72,101,105,103,104,116,0] /* Height\00 */, "i8", ALLOC_NONE, 66264);
allocate([87,105,100,116,104,0] /* Width\00 */, "i8", ALLOC_NONE, 66272);
allocate([87,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,99,97,110,110,111,116,32,98,111,116,104,32,98,101,32,116,119,111,0] /* Width and height can */, "i8", ALLOC_NONE, 66280);
allocate([87,105,100,116,104,32,97,110,100,32,104,101,105,103,104,116,32,109,117,115,116,32,98,111,116,104,32,98,101,32,97,116,32,108,101,97,115,116,32,116,119,111,0] /* Width and height mus */, "i8", ALLOC_NONE, 66316);
allocate([99,111,112,121,45,62,110,117,109,115,91,105,93,32,60,61,32,99,111,112,121,45,62,110,0] /* copy-_nums[i] _= cop */, "i8", ALLOC_NONE, 66360);
allocate([99,111,112,121,45,62,110,117,109,115,91,105,93,32,62,61,32,48,0] /* copy-_nums[i] _= 0\0 */, "i8", ALLOC_NONE, 66388);
allocate([99,111,112,121,45,62,110,32,61,61,32,111,114,105,103,45,62,110,0] /* copy-_n == orig-_n\0 */, "i8", ALLOC_NONE, 66408);
allocate([115,0] /* s\00 */, "i8", ALLOC_NONE, 66428);
allocate([105,110,118,101,114,115,101,32,61,61,32,48,32,124,124,32,105,110,118,101,114,115,101,32,61,61,32,49,0] /* inverse == 0 || inve */, "i8", ALLOC_NONE, 66432);
allocate([99,104,101,99,107,95,110,117,109,115,40,115,116,97,116,101,44,32,99,111,112,121,44,32,48,41,0] /* check_nums(state, co */, "i8", ALLOC_NONE, 66464);
allocate([99,104,101,99,107,95,110,117,109,115,40,115,116,97,116,101,44,32,99,111,112,121,44,32,49,41,0] /* check_nums(state, co */, "i8", ALLOC_NONE, 66492);
allocate([115,116,97,116,101,45,62,110,117,109,115,91,106,93,32,60,61,32,115,116,97,116,101,45,62,110,0] /* state-_nums[j] _= st */, "i8", ALLOC_NONE, 66520);
allocate([115,111,108,118,101,95,115,116,97,116,101,40,116,111,115,111,108,118,101,41,32,62,32,48,0] /* solve_state(tosolve) */, "i8", ALLOC_NONE, 66548);
allocate([115,116,97,116,101,45,62,110,117,109,115,91,116,97,105,108,105,93,32,60,61,32,115,116,97,116,101,45,62,110,0] /* state-_nums[taili] _ */, "i8", ALLOC_NONE, 66576);
allocate([115,116,97,116,101,45,62,110,117,109,115,91,104,101,97,100,105,93,32,60,61,32,115,116,97,116,101,45,62,110,0] /* state-_nums[headi] _ */, "i8", ALLOC_NONE, 66608);
allocate([71,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,32,99,111,110,116,97,105,110,115,32,117,110,101,120,112,101,99,116,101,100,32,99,104,97,114,97,99,116,101,114,115,0] /* Game description con */, "i8", ALLOC_NONE, 66640);
allocate([109,111,118,101,115,116,114,32,38,38,32,33,109,115,103,0] /* movestr && !msg\00 */, "i8", ALLOC_NONE, 66688);
allocate([33,105,110,118,101,114,115,101,0] /* !inverse\00 */, "i8", ALLOC_NONE, 66704);
allocate([71,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,32,115,104,111,114,116,101,114,32,116,104,97,110,32,101,120,112,101,99,116,101,100,0] /* Game description sho */, "i8", ALLOC_NONE, 66716);
allocate([78,117,109,98,101,114,32,116,111,111,32,108,97,114,103,101,0] /* Number too large\00 */, "i8", ALLOC_NONE, 66756);
allocate([115,105,103,110,112,111,115,116,46,99,0] /* signpost.c\00 */, "i8", ALLOC_NONE, 66776);
allocate([71,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,32,108,111,110,103,101,114,32,116,104,97,110,32,101,120,112,101,99,116,101,100,0] /* Game description lon */, "i8", ALLOC_NONE, 66788);
allocate([33,34,110,101,119,95,103,97,109,101,32,102,97,105,108,101,100,32,116,111,32,117,110,112,105,99,107,34,0] /* !\22new_game failed  */, "i8", ALLOC_NONE, 66828);
allocate([37,100,37,99,0] /* %d%c\00 */, "i8", ALLOC_NONE, 66860);
allocate([85,110,97,98,108,101,32,116,111,32,115,111,108,118,101,32,112,117,122,122,108,101,46,0] /* Unable to solve puzz */, "i8", ALLOC_NONE, 66868);
allocate([80,117,122,122,108,101,32,105,115,32,105,109,112,111,115,115,105,98,108,101,46,0] /* Puzzle is impossible */, "i8", ALLOC_NONE, 66892);
allocate([78,87,0] /* NW\00 */, "i8", ALLOC_NONE, 66916);
allocate([87,32,0] /* W \00 */, "i8", ALLOC_NONE, 66920);
allocate([109,101,45,62,110,115,116,97,116,101,115,32,61,61,32,48,0] /* me-_nstates == 0\00 */, "i8", ALLOC_NONE, 66924);
allocate([100,115,102,91,118,50,93,32,38,32,50,0] /* dsf[v2] & 2\00 */, "i8", ALLOC_NONE, 66944);
allocate([83,87,0] /* SW\00 */, "i8", ALLOC_NONE, 66956);
allocate([83,32,0] /* S \00 */, "i8", ALLOC_NONE, 66960);
allocate([43,37,100,0] /* +%d\00 */, "i8", ALLOC_NONE, 66964);
allocate([83,69,0] /* SE\00 */, "i8", ALLOC_NONE, 66968);
allocate([69,32,0] /* E \00 */, "i8", ALLOC_NONE, 66972);
allocate([78,69,0] /* NE\00 */, "i8", ALLOC_NONE, 66976);
allocate([78,32,0] /* N \00 */, "i8", ALLOC_NONE, 66980);
allocate([110,32,60,61,32,57,57,0] /* n _= 99\00 */, "i8", ALLOC_NONE, 66984);
allocate([33,117,105,45,62,100,114,97,103,103,105,110,103,0] /* !ui-_dragging\00 */, "i8", ALLOC_NONE, 66992);
allocate([91,37,100,58,37,48,50,100,93,32,0] /* [%d:%02d] \00 */, "i8", ALLOC_NONE, 67008);
allocate([109,105,100,101,110,100,46,99,0] /* midend.c\00 */, "i8", ALLOC_NONE, 67020);
allocate([83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,32,102,97,105,108,101,100,0] /* Solve operation fail */, "i8", ALLOC_NONE, 67032);
allocate([100,115,102,91,118,49,93,32,38,32,50,0] /* dsf[v1] & 2\00 */, "i8", ALLOC_NONE, 67056);
allocate([114,97,110,100,111,109,46,99,0] /* random.c\00 */, "i8", ALLOC_NONE, 67068);
allocate([78,111,32,103,97,109,101,32,115,101,116,32,117,112,32,116,111,32,115,111,108,118,101,0] /* No game set up to so */, "i8", ALLOC_NONE, 67080);
allocate([115,116,97,116,101,45,62,112,114,101,118,91,115,116,97,116,101,45,62,110,101,120,116,91,105,93,93,32,61,61,32,105,0] /* state-_prev[state-_n */, "i8", ALLOC_NONE, 67104);
allocate([84,104,105,115,32,103,97,109,101,32,100,111,101,115,32,110,111,116,32,115,117,112,112,111,114,116,32,116,104,101,32,83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,0] /* This game does not s */, "i8", ALLOC_NONE, 67140);
allocate([104,101,97,100,45,62,119,104,121,32,33,61,32,78,85,76,76,0] /* head-_why != NULL\00 */, "i8", ALLOC_NONE, 67188);
allocate([103,111,116,32,116,111,32,101,110,100,32,111,102,32,99,111,108,111,117,114,101,100,32,114,101,103,105,111,110,0] /* got to end of colour */, "i8", ALLOC_NONE, 67208);
allocate([100,114,45,62,109,101,0] /* dr-_me\00 */, "i8", ALLOC_NONE, 67240);
allocate([106,111,105,110,105,110,103,32,116,119,111,32,99,111,108,111,117,114,101,100,32,114,101,103,105,111,110,115,44,32,116,97,107,105,110,103,32,108,97,114,103,101,115,116,0] /* joining two coloured */, "i8", ALLOC_NONE, 67248);
allocate([106,111,105,110,105,110,103,32,116,119,111,32,99,111,108,111,117,114,101,100,32,114,101,103,105,111,110,115,44,32,115,119,97,112,112,105,110,103,32,116,111,32,108,97,114,103,101,114,32,99,111,108,111,117,114,0] /* joining two coloured */, "i8", ALLOC_NONE, 67296);
allocate([97,100,100,105,110,103,32,98,108,97,110,107,32,99,101,108,108,32,116,111,32,101,110,100,32,111,102,32,110,117,109,98,101,114,101,100,32,114,101,103,105,111,110,0] /* adding blank cell to */, "i8", ALLOC_NONE, 67352);
allocate([108,111,119,101,115,116,32,97,118,97,105,108,97,98,108,101,32,99,111,108,111,117,114,32,103,114,111,117,112,0] /* lowest available col */, "i8", ALLOC_NONE, 67396);
allocate([97,100,100,105,110,103,32,98,108,97,110,107,32,99,101,108,108,32,116,111,32,104,101,97,100,32,111,102,32,110,117,109,98,101,114,101,100,32,114,101,103,105,111,110,0] /* adding blank cell to */, "i8", ALLOC_NONE, 67428);
allocate([106,32,33,61,32,105,0] /* j != i\00 */, "i8", ALLOC_NONE, 67476);
allocate([37,100,0] /* %d\00 */, "i8", ALLOC_NONE, 67484);
allocate([105,110,118,101,114,115,101,32,61,61,32,48,0] /* inverse == 0\00 */, "i8", ALLOC_NONE, 67488);
allocate([99,111,110,116,97,105,110,115,32,99,101,108,108,32,119,105,116,104,32,105,109,109,117,116,97,98,108,101,32,110,117,109,98,101,114,0] /* contains cell with i */, "i8", ALLOC_NONE, 67504);
allocate([115,105,103,110,112,111,115,116,0] /* signpost\00 */, "i8", ALLOC_NONE, 67540);
allocate([33,34,78,111,32,97,118,97,105,108,97,98,108,101,32,99,111,108,111,117,114,115,33,34,0] /* !\22No available col */, "i8", ALLOC_NONE, 67552);
allocate([106,32,33,61,32,104,101,97,100,115,91,110,93,46,105,0] /* j != heads[n].i\00 */, "i8", ALLOC_NONE, 67580);
allocate([104,101,97,100,115,91,110,93,46,115,116,97,114,116,32,61,61,32,48,0] /* heads[n].start == 0\ */, "i8", ALLOC_NONE, 67596);
allocate(1, "i8", ALLOC_NONE, 67616);
allocate([110,32,62,61,32,48,32,38,38,32,110,32,60,32,109,101,45,62,110,112,114,101,115,101,116,115,0] /* n _= 0 && n _ me-_np */, "i8", ALLOC_NONE, 67620);
allocate([115,116,97,116,101,45,62,110,117,109,115,91,105,93,32,60,61,32,115,116,97,116,101,45,62,110,0] /* state-_nums[i] _= st */, "i8", ALLOC_NONE, 67648);
allocate([37,115,95,80,82,69,83,69,84,83,0] /* %s_PRESETS\00 */, "i8", ALLOC_NONE, 67676);
allocate([115,116,97,116,101,45,62,110,117,109,115,91,105,93,32,62,32,48,0] /* state-_nums[i] _ 0\0 */, "i8", ALLOC_NONE, 67688);
allocate([37,50,120,37,50,120,37,50,120,0] /* %2x%2x%2x\00 */, "i8", ALLOC_NONE, 67708);
allocate([72,0] /* H\00 */, "i8", ALLOC_NONE, 67720);
allocate([37,115,95,68,69,70,65,85,76,84,0] /* %s_DEFAULT\00 */, "i8", ALLOC_NONE, 67724);
allocate([37,115,95,67,79,76,79,85,82,95,37,100,0] /* %s_COLOUR_%d\00 */, "i8", ALLOC_NONE, 67736);
allocate([98,105,116,115,32,60,32,51,50,0] /* bits _ 32\00 */, "i8", ALLOC_NONE, 67752);
allocate([37,99,37,100,44,37,100,0] /* %c%d,%d\00 */, "i8", ALLOC_NONE, 67764);
allocate([111,117,116,32,111,102,32,109,101,109,111,114,121,0] /* out of memory\00 */, "i8", ALLOC_NONE, 67772);
allocate([102,97,116,97,108,32,101,114,114,111,114,58,32,0] /* fatal error: \00 */, "i8", ALLOC_NONE, 67788);
allocate([76,37,100,44,37,100,45,37,100,44,37,100,0] /* L%d,%d-%d,%d\00 */, "i8", ALLOC_NONE, 67804);
allocate([37,115,95,84,73,76,69,83,73,90,69,0] /* %s_TILESIZE\00 */, "i8", ALLOC_NONE, 67820);
allocate([109,101,45,62,100,105,114,32,33,61,32,48,0] /* me-_dir != 0\00 */, "i8", ALLOC_NONE, 67832);
allocate([105,110,100,101,120,32,62,61,32,48,0] /* index _= 0\00 */, "i8", ALLOC_NONE, 67848);
allocate([33,100,115,45,62,100,114,97,103,98,0] /* !ds-_dragb\00 */, "i8", ALLOC_NONE, 67860);
allocate([100,115,102,46,99,0] /* dsf.c\00 */, "i8", ALLOC_NONE, 67872);
allocate([109,101,45,62,100,114,97,119,105,110,103,0] /* me-_drawing\00 */, "i8", ALLOC_NONE, 67880);
allocate([84,73,76,69,95,83,73,90,69,32,62,32,48,0] /* TILE_SIZE _ 0\00 */, "i8", ALLOC_NONE, 67892);
allocate([103,97,109,101,115,46,115,105,103,110,112,111,115,116,0] /* games.signpost\00 */, "i8", ALLOC_NONE, 67908);
allocate([83,105,103,110,112,111,115,116,0] /* Signpost\00 */, "i8", ALLOC_NONE, 67924);
allocate(472, "i8", ALLOC_NONE, 67936);
allocate([117,112,100,97,116,101,95,110,117,109,98,101,114,115,0] /* update_numbers\00 */, "i8", ALLOC_NONE, 68408);
allocate([115,116,97,116,117,115,95,98,97,114,0] /* status_bar\00 */, "i8", ALLOC_NONE, 68424);
allocate([114,97,110,100,111,109,95,117,112,116,111,0] /* random_upto\00 */, "i8", ALLOC_NONE, 68436);
allocate([110,101,119,95,103,97,109,101,95,115,116,114,105,112,0] /* new_game_strip\00 */, "i8", ALLOC_NONE, 68448);
allocate([110,101,119,95,103,97,109,101,95,100,101,115,99,0] /* new_game_desc\00 */, "i8", ALLOC_NONE, 68464);
allocate([110,101,119,95,103,97,109,101,0] /* new_game\00 */, "i8", ALLOC_NONE, 68480);
allocate([109,105,100,101,110,100,95,115,111,108,118,101,0] /* midend_solve\00 */, "i8", ALLOC_NONE, 68492);
allocate([109,105,100,101,110,100,95,114,101,115,116,97,114,116,95,103,97,109,101,0] /* midend_restart_game\ */, "i8", ALLOC_NONE, 68508);
allocate([109,105,100,101,110,100,95,114,101,100,114,97,119,0] /* midend_redraw\00 */, "i8", ALLOC_NONE, 68528);
allocate([109,105,100,101,110,100,95,114,101,97,108,108,121,95,112,114,111,99,101,115,115,95,107,101,121,0] /* midend_really_proces */, "i8", ALLOC_NONE, 68544);
allocate([109,105,100,101,110,100,95,110,101,119,95,103,97,109,101,0] /* midend_new_game\00 */, "i8", ALLOC_NONE, 68572);
allocate([109,105,100,101,110,100,95,102,101,116,99,104,95,112,114,101,115,101,116,0] /* midend_fetch_preset\ */, "i8", ALLOC_NONE, 68588);
allocate([108,111,119,101,115,116,95,115,116,97,114,116,0] /* lowest_start\00 */, "i8", ALLOC_NONE, 68608);
allocate([105,110,116,101,114,112,114,101,116,95,109,111,118,101,0] /* interpret_move\00 */, "i8", ALLOC_NONE, 68624);
allocate([104,101,97,100,95,110,117,109,98,101,114,0] /* head_number\00 */, "i8", ALLOC_NONE, 68640);
allocate([103,97,109,101,95,116,101,120,116,95,102,111,114,109,97,116,0] /* game_text_format\00 */, "i8", ALLOC_NONE, 68652);
allocate([103,97,109,101,95,115,101,116,95,115,105,122,101,0] /* game_set_size\00 */, "i8", ALLOC_NONE, 68672);
allocate([103,97,109,101,95,114,101,100,114,97,119,0] /* game_redraw\00 */, "i8", ALLOC_NONE, 68688);
allocate([101,100,115,102,95,109,101,114,103,101,0] /* edsf_merge\00 */, "i8", ALLOC_NONE, 68700);
allocate([101,100,115,102,95,99,97,110,111,110,105,102,121,0] /* edsf_canonify\00 */, "i8", ALLOC_NONE, 68712);
allocate([99,111,110,110,101,99,116,95,110,117,109,98,101,114,115,0] /* connect_numbers\00 */, "i8", ALLOC_NONE, 68728);
allocate([99,104,101,99,107,95,110,117,109,115,0] /* check_nums\00 */, "i8", ALLOC_NONE, 68744);
HEAP32[((65536)>>2)]=((67924)|0);
HEAP32[((65540)>>2)]=((67908)|0);
HEAP32[((65544)>>2)]=((67540)|0);
HEAP32[((65896)>>2)]=((66980)|0);
HEAP32[((65900)>>2)]=((66976)|0);
HEAP32[((65904)>>2)]=((66972)|0);
HEAP32[((65908)>>2)]=((66968)|0);
HEAP32[((65912)>>2)]=((66960)|0);
HEAP32[((65916)>>2)]=((66956)|0);
HEAP32[((65920)>>2)]=((66920)|0);
HEAP32[((65924)>>2)]=((66916)|0);
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
  var _sin=Math.sin;
  var _cos=Math.cos;
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
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
  var _fabs=Math.abs;
  var _atan=Math.atan;
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
  function _strcpy(pdest, psrc) {
      pdest = pdest|0; psrc = psrc|0;
      var i = 0;
      do {
        HEAP8[(((pdest+i)|0)|0)]=HEAP8[(((psrc+i)|0)|0)];
        i = (i+1)|0;
      } while ((HEAP8[(((psrc)+(i-1))|0)])|0 != 0);
      return pdest|0;
    }
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
___buildEnvironment(ENV);
___setErrNo(0);
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
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
,0,_encode_params,0,_compare_heads,0,_canvas_draw_text,0,_game_timing_state,0,_canvas_blitter_load
,0,_canvas_blitter_new,0,_game_flash_length,0,_canvas_blitter_free,0,_game_colours,0,_game_can_format_as_text_now
,0,_canvas_blitter_save,0,_game_print_size,0,_canvas_status_bar,0,_interpret_move,0,_new_game_desc,0,_execute_move,0,_canvas_draw_poly,0,_new_game,0,_canvas_draw_circle,0];
// EMSCRIPTEN_START_FUNCS
function _validate_params(r1,r2){var r3;r2=HEAP32[r1>>2];if((r2|0)<2){return 66316}r3=HEAP32[r1+4>>2];if((r3|0)<2){return 66316}else{return(r2|0)==2&(r3|0)==2?66280:0}}function _decode_params(r1,r2){var r3,r4,r5,r6,r7,r8,r9;r3=0;r4=_atoi(r2);r5=r1+4|0;HEAP32[r5>>2]=r4;HEAP32[r1>>2]=r4;r4=r2;while(1){r6=HEAP8[r4];if(r6<<24>>24==0){r7=r4;break}r8=r4+1|0;if(((r6&255)-48|0)>>>0<10){r4=r8}else{r3=10;break}}L11:do{if(r3==10){if(r6<<24>>24!=120){r7=r4;break}r2=_atoi(r8);HEAP32[r5>>2]=r2;r2=r8;while(1){r9=HEAP8[r2];if(r9<<24>>24==0){r7=r2;break L11}if(((r9&255)-48|0)>>>0<10){r2=r2+1|0}else{r7=r2;break L11}}}}while(0);r8=r1+8|0;HEAP32[r8>>2]=0;if(HEAP8[r7]<<24>>24!=99){return}HEAP32[r8>>2]=1;return}function _free_params(r1){if((r1|0)==0){return}_free(r1);return}function _default_params(){var r1,r2,r3;r1=STACKTOP;r2=_malloc(12),r3=r2>>2;if((r2|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r3+1]=4;HEAP32[r3]=4;HEAP32[r3+2]=1;STACKTOP=r1;return r2}}function _game_fetch_preset(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=STACKTOP;STACKTOP=STACKTOP+80|0;if((r1|0)<0|r1>>>0>5){r5=0;STACKTOP=r4;return r5}r6=_malloc(12),r7=r6>>2;if((r6|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r8=r6+4|0;HEAP32[r8>>2]=4;r9=r6;HEAP32[r9>>2]=4;r10=r6+8|0;HEAP32[r10>>2]=1;r11=((r1*12&-1)+65728|0)>>2;HEAP32[r7]=HEAP32[r11];HEAP32[r7+1]=HEAP32[r11+1];HEAP32[r7+2]=HEAP32[r11+2];HEAP32[r3>>2]=r6;r6=r4|0;r3=HEAP32[r8>>2];r8=(HEAP32[r10>>2]|0)!=0?67616:66164;_sprintf(r6,66216,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=HEAP32[r9>>2],HEAP32[tempInt+4>>2]=r3,HEAP32[tempInt+8>>2]=r8,tempInt));r8=_malloc(_strlen(r6)+1|0);if((r8|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r8,r6);HEAP32[r2>>2]=r8;r5=1;STACKTOP=r4;return r5}function _encode_params(r1,r2){var r3,r4,r5,r6;r3=STACKTOP;STACKTOP=STACKTOP+256|0;r4=r3|0;r5=HEAP32[r1>>2];r6=HEAP32[r1+4>>2];if((r2|0)==0){_sprintf(r4,66176,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r6,tempInt))}else{r2=(HEAP32[r1+8>>2]|0)!=0?66212:67616;_sprintf(r4,66216,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r6,HEAP32[tempInt+8>>2]=r2,tempInt))}r2=_malloc(_strlen(r4)+1|0);if((r2|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r2,r4);STACKTOP=r3;return r2}}function _dup_params(r1){var r2,r3,r4,r5;r2=STACKTOP;r3=_malloc(12),r4=r3>>2;if((r3|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r5=r1>>2;HEAP32[r4]=HEAP32[r5];HEAP32[r4+1]=HEAP32[r5+1];HEAP32[r4+2]=HEAP32[r5+2];STACKTOP=r2;return r3}}function _game_configure(r1){var r2,r3,r4,r5,r6;r2=STACKTOP;STACKTOP=STACKTOP+80|0;r3=_malloc(64),r4=r3>>2;if((r3|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4]=66272;HEAP32[r4+1]=0;r5=r2|0;_sprintf(r5,67484,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r1>>2],tempInt));r6=_malloc(_strlen(r5)+1|0);if((r6|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r6,r5);HEAP32[r4+2]=r6;HEAP32[r4+3]=0;HEAP32[r4+4]=66264;HEAP32[r4+5]=0;_sprintf(r5,67484,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r1+4>>2],tempInt));r6=_malloc(_strlen(r5)+1|0);if((r6|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r6,r5);HEAP32[r4+6]=r6;HEAP32[r4+7]=0;HEAP32[r4+8]=66236;HEAP32[r4+9]=2;HEAP32[r4+10]=0;HEAP32[r4+11]=HEAP32[r1+8>>2];HEAP32[r4+12]=0;HEAP32[r4+13]=3;HEAP32[r4+14]=0;HEAP32[r4+15]=0;STACKTOP=r2;return r3}}function _custom_params(r1){var r2,r3,r4,r5;r2=STACKTOP;r3=_malloc(12),r4=r3>>2;if((r3|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r5=_atoi(HEAP32[r1+8>>2]);HEAP32[r4]=r5;r5=_atoi(HEAP32[r1+24>>2]);HEAP32[r4+1]=r5;HEAP32[r4+2]=HEAP32[r1+44>>2];STACKTOP=r2;return r3}}function _new_game_desc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114;r4=0;r3=STACKTOP;r5=_blank_game(HEAP32[r1>>2],HEAP32[r1+4>>2]);r6=(r5+24|0)>>2;r7=(r5+8|0)>>2;r8=(r5+28|0)>>2;r9=(r5+32|0)>>2;r10=(r5+36|0)>>2;r11=(r5+40|0)>>2;r12=(r5+48|0)>>2;r13=r1+8|0;r1=(r5|0)>>2;r14=(r5+4|0)>>2;r15=(r5+12|0)>>2;r16=(r5+16|0)>>2;r17=(r5+20|0)>>2;r18=(r5+44|0)>>2;L69:while(1){_memset(HEAP32[r6],0,HEAP32[r7]<<2);_memset(HEAP32[r8],0,HEAP32[r7]<<2);_memset(HEAP32[r9],0,HEAP32[r7]<<2);_memset(HEAP32[r10],-1,HEAP32[r7]<<2);_memset(HEAP32[r11],-1,HEAP32[r7]<<2);_memset(HEAP32[r12],-1,(HEAP32[r7]<<2)+4|0);L71:while(1){if((HEAP32[r13>>2]|0)==0){while(1){r19=HEAP32[r7];r20=0;while(1){if((r19>>>(r20>>>0)|0)==0){break}else{r20=r20+1|0}}r21=r20+3|0;if((r21|0)>=32){___assert_func(67068,275,68436,67752)}r22=Math.floor((1<<r21>>>0)/(r19>>>0));r23=Math.imul(r22,r19);while(1){r24=_random_bits(r2,r21);if(r24>>>0<r23>>>0){break}}r23=HEAP32[r7];r21=0;while(1){if((r23>>>(r21>>>0)|0)==0){break}else{r21=r21+1|0}}r25=Math.floor((r24>>>0)/(r22>>>0));r19=r21+3|0;if((r19|0)>=32){___assert_func(67068,275,68436,67752)}r20=Math.floor((1<<r19>>>0)/(r23>>>0));r26=Math.imul(r20,r23);while(1){r27=_random_bits(r2,r19);if(r27>>>0<r26>>>0){break}}r28=Math.floor((r27>>>0)/(r20>>>0));if((r25|0)!=(r28|0)){break}}r29=r25;r30=r28;r31=HEAP32[r7]}else{r26=HEAP32[r7];r29=0;r30=r26-1|0;r31=r26}r26=_malloc(r31<<2);if((r26|0)==0){r4=76;break L69}r19=r26,r23=r19>>2;r21=_malloc(HEAP32[r7]<<2);if((r21|0)==0){r4=78;break L69}r22=r21>>2;_memset(HEAP32[r8],0,HEAP32[r7]<<2);HEAP32[HEAP32[r8]+(r29<<2)>>2]=1;HEAP32[HEAP32[r8]+(r30<<2)>>2]=HEAP32[r7];HEAP32[HEAP32[r6]+(r30<<2)>>2]=0;r32=HEAP32[r1];L99:do{if((HEAP32[r7]|0)>2){r33=2;r34=r30;r35=r29;r36=r32;L100:while(1){r37=HEAP32[r14];r38=(r35|0)%(r36|0);r39=(r35|0)/(r36|0)&-1;r40=0;r41=0;while(1){r42=HEAP32[(r40<<2)+65864>>2];r43=HEAP32[(r40<<2)+65832>>2];r44=r41;r45=r38;r46=r39;L104:while(1){r47=r45;r48=r46;while(1){r49=r47+r42|0;r50=r48+r43|0;if(!((r49|r50|0)>-1&(r49|0)<(r36|0)&(r50|0)<(r37|0))){break L104}r51=Math.imul(r50,r36)+r49|0;if((HEAP32[HEAP32[r8]+(r51<<2)>>2]|0)==0){break}else{r47=r49;r48=r50}}HEAP32[(r44<<2>>2)+r23]=r51;HEAP32[(r44<<2>>2)+r22]=r40;r44=r44+1|0;r45=r49;r46=r50}r46=r40+1|0;if((r46|0)==8){r52=r35;r53=r44;r54=r33;break}else{r40=r46;r41=r44}}while(1){if((r53|0)==0){r4=57;break L100}else{r55=0}while(1){if((r53>>>(r55>>>0)|0)==0){break}else{r55=r55+1|0}}r44=r55+3|0;if((r44|0)>=32){___assert_func(67068,275,68436,67752)}r41=Math.floor((1<<r44>>>0)/(r53>>>0));r40=Math.imul(r41,r53);while(1){r56=_random_bits(r2,r44);if(r56>>>0<r40>>>0){break}}r40=Math.floor((r56>>>0)/(r41>>>0));HEAP32[HEAP32[r6]+(r52<<2)>>2]=HEAP32[(r40<<2>>2)+r22];r44=HEAP32[r8];r37=(r40<<2)+r19|0;HEAP32[r44+(HEAP32[r37>>2]<<2)>>2]=HEAP32[r44+(r52<<2)>>2]+1|0;r57=HEAP32[r37>>2];r37=HEAP32[r1];r44=HEAP32[r14];r40=(r57|0)%(r37|0);r39=(r57|0)/(r37|0)&-1;r38=0;r46=0;while(1){r45=HEAP32[(r38<<2)+65864>>2];r43=HEAP32[(r38<<2)+65832>>2];r58=r46;r42=r40;r48=r39;L124:while(1){r47=r42;r59=r48;while(1){r60=r47+r45|0;r61=r59+r43|0;if(!((r60|r61|0)>-1&(r60|0)<(r37|0)&(r61|0)<(r44|0))){break L124}r62=Math.imul(r61,r37)+r60|0;if((HEAP32[HEAP32[r8]+(r62<<2)>>2]|0)==0){break}else{r47=r60;r59=r61}}HEAP32[(r58<<2>>2)+r23]=r62;HEAP32[(r58<<2>>2)+r22]=r38;r58=r58+1|0;r42=r60;r48=r61}r48=r38+1|0;if((r48|0)==8){break}else{r38=r48;r46=r58}}r63=r54+1|0;if((r58|0)==1){r52=r57;r53=1;r54=r63}else{break}}r46=HEAP32[r1];r38=HEAP32[r14];r37=(r34|0)%(r46|0);r44=(r34|0)/(r46|0)&-1;r39=0;r40=0;while(1){r41=HEAP32[(r39<<2)+65864>>2];r48=HEAP32[(r39<<2)+65832>>2];r42=r40;r43=r37;r45=r44;L135:while(1){r59=r43;r47=r45;while(1){r64=r59+r41|0;r65=r47+r48|0;if(!((r64|r65|0)>-1&(r64|0)<(r46|0)&(r65|0)<(r38|0))){break L135}r66=Math.imul(r65,r46)+r64|0;if((HEAP32[HEAP32[r8]+(r66<<2)>>2]|0)==0){break}else{r59=r64;r47=r65}}HEAP32[(r42<<2>>2)+r23]=r66;HEAP32[(r42<<2>>2)+r22]=r39;r42=r42+1|0;r43=r64;r45=r65}r45=r39+1|0;if((r45|0)==8){r67=r34;r68=r42;r69=r63;break}else{r39=r45;r40=r42}}while(1){if((r68|0)==0){r4=58;break L100}else{r70=0}while(1){if((r68>>>(r70>>>0)|0)==0){break}else{r70=r70+1|0}}r42=r70+3|0;if((r42|0)>=32){___assert_func(67068,275,68436,67752)}r40=Math.floor((1<<r42>>>0)/(r68>>>0));r39=Math.imul(r40,r68);while(1){r71=_random_bits(r2,r42);if(r71>>>0<r39>>>0){break}}r39=Math.floor((r71>>>0)/(r40>>>0));r42=((r39<<2)+r19|0)>>2;HEAP32[HEAP32[r6]+(HEAP32[r42]<<2)>>2]=(HEAP32[(r39<<2>>2)+r22]+4|0)%8;r39=HEAP32[r8];HEAP32[r39+(HEAP32[r42]<<2)>>2]=HEAP32[r39+(r67<<2)>>2]-1|0;r72=HEAP32[r42];r42=HEAP32[r1];r39=HEAP32[r14];r46=(r72|0)%(r42|0);r38=(r72|0)/(r42|0)&-1;r44=0;r37=0;while(1){r45=HEAP32[(r44<<2)+65864>>2];r43=HEAP32[(r44<<2)+65832>>2];r73=r37;r48=r46;r41=r38;L155:while(1){r47=r48;r59=r41;while(1){r74=r47+r45|0;r75=r59+r43|0;if(!((r74|r75|0)>-1&(r74|0)<(r42|0)&(r75|0)<(r39|0))){break L155}r76=Math.imul(r75,r42)+r74|0;if((HEAP32[HEAP32[r8]+(r76<<2)>>2]|0)==0){break}else{r47=r74;r59=r75}}HEAP32[(r73<<2>>2)+r23]=r76;HEAP32[(r73<<2>>2)+r22]=r44;r73=r73+1|0;r48=r74;r41=r75}r41=r44+1|0;if((r41|0)==8){break}else{r44=r41;r37=r73}}r77=r69+1|0;if((r73|0)==1){r67=r72;r68=1;r69=r77}else{break}}r37=HEAP32[r1];if((r77|0)<(HEAP32[r7]|0)){r33=r77;r34=r72;r35=r57;r36=r37}else{r78=r72;r79=r57;r80=r37;break L99}}if(r4==57){r4=0;_free(r26);_free(r21);continue L71}else if(r4==58){r4=0;_free(r26);_free(r21);continue L71}}else{r78=r30;r79=r29;r80=r32}}while(0);r32=(r79|0)%(r80|0);r22=(r79|0)/(r80|0)&-1;r23=(r78|0)%(r80|0);r19=(r78|0)/(r80|0)&-1;r36=r23-r32|0;r35=r19-r22|0;r34=(r23|0)!=(r32|0);r32=(r19|0)==(r22|0);do{if(r32|r34^1){r4=125}else{if((((r36|0)>-1?r36:-r36|0)|0)==(((r35|0)>-1?r35:-r35|0)|0)){r4=125;break}else{r81=-1;break}}}while(0);do{if(r4==125){r4=0;if(r34){r82=(r36|0)/(((r36|0)>-1?r36:-r36|0)|0)&-1}else{r82=r36}if(r32){r83=r35}else{r83=(r35|0)/(((r35|0)>-1?r35:-r35|0)|0)&-1}if((r82|0)==0){if((r83|0)==-1){r81=0;break}if((r83|0)==1){r81=4;break}}else if((r82|0)==1){if((r83|0)==-1){r81=1;break}if((r83|0)==0){r81=2;break}if((r83|0)==1){r81=3;break}}else if((r82|0)==-1){if((r83|0)==1){r81=5;break}if((r83|0)==0){r81=6;break}if((r83|0)==-1){r81=7;break}}r81=-1}}while(0);HEAP32[HEAP32[r6]+(r79<<2)>>2]=r81;r35=(HEAP32[HEAP32[r6]+(r79<<2)>>2]|0)==-1;_free(r26);_free(r21);if(!r35){break}}r35=HEAP32[r8];r32=HEAP32[r7];if((HEAP32[r35+(r29<<2)>>2]|0)>(r32|0)){___assert_func(66776,821,68464,66608);r84=HEAP32[r8];r85=HEAP32[r7]}else{r84=r35;r85=r32}if((HEAP32[r84+(r30<<2)>>2]|0)>(r85|0)){___assert_func(66776,822,68464,66576)}r32=(r29<<2)+HEAP32[r9]|0;HEAP32[r32>>2]=HEAP32[r32>>2]|1;r32=(r30<<2)+HEAP32[r9]|0;HEAP32[r32>>2]=HEAP32[r32>>2]|1;r86=_blank_game(HEAP32[r1],HEAP32[r14]);r87=r86+12|0;HEAP32[r87>>2]=HEAP32[r15];r88=r86+16|0;HEAP32[r88>>2]=HEAP32[r16];r89=r86+20|0;HEAP32[r89>>2]=HEAP32[r17];r90=r86+24|0;r91=(r86+8|0)>>2;_memcpy(HEAP32[r90>>2],HEAP32[r6],HEAP32[r91]<<2);r92=(r86+32|0)>>2;_memcpy(HEAP32[r92],HEAP32[r9],HEAP32[r91]<<2);r93=(r86+28|0)>>2;_memcpy(HEAP32[r93],HEAP32[r8],HEAP32[r91]<<2);r94=(r86+36|0)>>2;_memcpy(HEAP32[r94],HEAP32[r10],HEAP32[r91]<<2);r95=(r86+40|0)>>2;_memcpy(HEAP32[r95],HEAP32[r11],HEAP32[r91]<<2);r96=(r86+44|0)>>2;_memcpy(HEAP32[r96],HEAP32[r18],HEAP32[r91]<<2);r97=(r86+48|0)>>2;_memcpy(HEAP32[r97],HEAP32[r12],(HEAP32[r91]<<2)+4|0);r32=HEAP32[r91];L196:do{if((r32|0)>0){r35=0;r36=r32;while(1){if((HEAP32[HEAP32[r92]+(r35<<2)>>2]&1|0)==0){HEAP32[HEAP32[r93]+(r35<<2)>>2]=0;r98=HEAP32[r91]}else{r98=r36}r34=r35+1|0;if((r34|0)<(r98|0)){r35=r34;r36=r98}else{r99=r98;break L196}}}else{r99=r32}}while(0);_memset(HEAP32[r94],-1,r99<<2);_memset(HEAP32[r95],-1,HEAP32[r91]<<2);_memset(HEAP32[r97],-1,(HEAP32[r91]<<2)+4|0);r32=HEAP32[r96];r36=HEAP32[r91];L203:do{if((r36|0)>0){r35=0;while(1){HEAP32[r32+(r35<<2)>>2]=6;r21=r35+1|0;if((r21|0)==(r36|0)){break L203}else{r35=r21}}}}while(0);if((_solve_state(r86)|0)>0){r4=151;break}r100=_malloc(HEAP32[r7]<<2);if((r100|0)==0){r4=153;break}r101=r100>>2;r36=HEAP32[r7];L209:do{if((r36|0)>0){r32=0;while(1){HEAP32[(r32<<2>>2)+r101]=r32;r35=r32+1|0;r21=HEAP32[r7];if((r35|0)<(r21|0)){r32=r35}else{r102=r21;break L209}}}else{r102=r36}}while(0);_shuffle(r100,r102,4,r2);r36=HEAP32[r7];L213:do{if((r36|0)>0){r32=0;r21=r36;while(1){r35=HEAP32[(r32<<2>>2)+r101];r26=HEAP32[r93];r34=HEAP32[r26+(r35<<2)>>2];do{if((r34|0)<1|(r34|0)>(r21|0)){r22=HEAP32[HEAP32[r8]+(r35<<2)>>2];if((r22|0)>(r21|0)){___assert_func(66776,748,68448,66520);r103=HEAP32[HEAP32[r8]+(r35<<2)>>2];r104=HEAP32[r93]}else{r103=r22;r104=r26}HEAP32[r104+(r35<<2)>>2]=r103;r22=(r35<<2)+HEAP32[r92]|0;HEAP32[r22>>2]=HEAP32[r22>>2]|1;r22=(r35<<2)+HEAP32[r9]|0;HEAP32[r22>>2]=HEAP32[r22>>2]|1;r22=HEAP32[r91];L221:do{if((r22|0)>0){r19=0;r23=r22;while(1){if((HEAP32[HEAP32[r92]+(r19<<2)>>2]&1|0)==0){HEAP32[HEAP32[r93]+(r19<<2)>>2]=0;r105=HEAP32[r91]}else{r105=r23}r33=r19+1|0;if((r33|0)<(r105|0)){r19=r33;r23=r105}else{r106=r105;break L221}}}else{r106=r22}}while(0);_memset(HEAP32[r94],-1,r106<<2);_memset(HEAP32[r95],-1,HEAP32[r91]<<2);_memset(HEAP32[r97],-1,(HEAP32[r91]<<2)+4|0);r22=HEAP32[r96];r23=HEAP32[r91];L228:do{if((r23|0)>0){r19=0;while(1){HEAP32[r22+(r19<<2)>>2]=6;r33=r19+1|0;if((r33|0)==(r23|0)){break L228}else{r19=r33}}}}while(0);if((_solve_state(r86)|0)>0){r4=167;break L69}if((_check_nums(r5,r86,1)|0)!=0){break}___assert_func(66776,757,68448,66492)}}while(0);r35=r32+1|0;r26=HEAP32[r7];if((r35|0)<(r26|0)){r32=r35;r21=r26}else{break L213}}}}while(0);_free(r100);_free_game(r86)}do{if(r4==76){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==78){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==151){_free_game(r86)}else if(r4==153){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==167){r106=HEAP32[r7];if((r106|0)>0){r107=0;r108=r106}else{_free(r100);_free_game(r86);break}while(1){r106=HEAP32[(r107<<2>>2)+r101];r105=(r106<<2)+HEAP32[r9]|0;r103=HEAP32[r105>>2];do{if((r103&1|0)!=0){r104=HEAP32[HEAP32[r8]+(r106<<2)>>2];if((r104|0)==1|(r104|0)==(r108|0)){break}HEAP32[r105>>2]=r103&-2;HEAP32[r87>>2]=HEAP32[r15];HEAP32[r88>>2]=HEAP32[r16];HEAP32[r89>>2]=HEAP32[r17];_memcpy(HEAP32[r90>>2],HEAP32[r6],HEAP32[r91]<<2);_memcpy(HEAP32[r92],HEAP32[r9],HEAP32[r91]<<2);_memcpy(HEAP32[r93],HEAP32[r8],HEAP32[r91]<<2);_memcpy(HEAP32[r94],HEAP32[r10],HEAP32[r91]<<2);_memcpy(HEAP32[r95],HEAP32[r11],HEAP32[r91]<<2);_memcpy(HEAP32[r96],HEAP32[r18],HEAP32[r91]<<2);_memcpy(HEAP32[r97],HEAP32[r12],(HEAP32[r91]<<2)+4|0);r104=HEAP32[r91];L249:do{if((r104|0)>0){r2=0;r102=r104;while(1){if((HEAP32[HEAP32[r92]+(r2<<2)>>2]&1|0)==0){HEAP32[HEAP32[r93]+(r2<<2)>>2]=0;r109=HEAP32[r91]}else{r109=r102}r99=r2+1|0;if((r99|0)<(r109|0)){r2=r99;r102=r109}else{r110=r109;break L249}}}else{r110=r104}}while(0);_memset(HEAP32[r94],-1,r110<<2);_memset(HEAP32[r95],-1,HEAP32[r91]<<2);_memset(HEAP32[r97],-1,(HEAP32[r91]<<2)+4|0);r104=HEAP32[r96];r102=HEAP32[r91];L256:do{if((r102|0)>0){r2=0;while(1){HEAP32[r104+(r2<<2)>>2]=6;r99=r2+1|0;if((r99|0)==(r102|0)){break L256}else{r2=r99}}}}while(0);if((_solve_state(r86)|0)>0){if((_check_nums(r5,r86,0)|0)!=0){break}___assert_func(66776,778,68448,66464);break}r102=HEAP32[HEAP32[r8]+(r106<<2)>>2];if((r102|0)>(HEAP32[r7]|0)){___assert_func(66776,781,68448,66520);r111=HEAP32[HEAP32[r8]+(r106<<2)>>2]}else{r111=r102}HEAP32[HEAP32[r93]+(r106<<2)>>2]=r111;r102=(r106<<2)+HEAP32[r9]|0;HEAP32[r102>>2]=HEAP32[r102>>2]|1}}while(0);r106=r107+1|0;r103=HEAP32[r7];if((r106|0)<(r103|0)){r107=r106;r108=r103}else{break}}_free(r100);_free_game(r86)}}while(0);r86=HEAP32[r7];L270:do{if((r86|0)>0){r100=0;r108=r86;while(1){if((HEAP32[HEAP32[r9]+(r100<<2)>>2]&1|0)==0){HEAP32[HEAP32[r8]+(r100<<2)>>2]=0;r112=HEAP32[r7]}else{r112=r108}r107=r100+1|0;if((r107|0)<(r112|0)){r100=r107;r108=r112}else{r113=r112;break L270}}}else{r113=r86}}while(0);_memset(HEAP32[r10],-1,r113<<2);_memset(HEAP32[r11],-1,HEAP32[r7]<<2);_memset(HEAP32[r12],-1,(HEAP32[r7]<<2)+4|0);r113=HEAP32[r18];r86=HEAP32[r7];L277:do{if((r86|0)>0){r7=0;while(1){HEAP32[r113+(r7<<2)>>2]=6;r112=r7+1|0;if((r112|0)==(r86|0)){break L277}else{r7=r112}}}}while(0);r86=_blank_game(HEAP32[r1],HEAP32[r14]),r14=r86>>2;HEAP32[r14+3]=HEAP32[r15];HEAP32[r14+4]=HEAP32[r16];HEAP32[r14+5]=HEAP32[r17];r17=(r86+8|0)>>2;_memcpy(HEAP32[r14+6],HEAP32[r6],HEAP32[r17]<<2);_memcpy(HEAP32[r14+8],HEAP32[r9],HEAP32[r17]<<2);_memcpy(HEAP32[r14+7],HEAP32[r8],HEAP32[r17]<<2);_memcpy(HEAP32[r14+9],HEAP32[r10],HEAP32[r17]<<2);_memcpy(HEAP32[r14+10],HEAP32[r11],HEAP32[r17]<<2);_memcpy(HEAP32[r14+11],HEAP32[r18],HEAP32[r17]<<2);_memcpy(HEAP32[r14+12],HEAP32[r12],(HEAP32[r17]<<2)+4|0);if((_solve_state(r86)|0)>0){_free_game(r86);r114=_generate_desc(r5,0);_free_game(r5);STACKTOP=r3;return r114}___assert_func(66776,835,68464,66548);_free_game(r86);r114=_generate_desc(r5,0);_free_game(r5);STACKTOP=r3;return r114}function _encode_ui(r1){return 0}function _decode_ui(r1,r2){return}function _game_can_format_as_text_now(r1){return(Math.imul(HEAP32[r1+4>>2],HEAP32[r1>>2])|0)<100&1}function _game_changed_state(r1,r2,r3){if((HEAP32[r2+12>>2]|0)!=0){return}if((HEAP32[r3+12>>2]|0)==0){return}HEAP32[r1+12>>2]=0;HEAP32[r1+8>>2]=0;return}function _validate_desc(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3;HEAP32[r4>>2]=0;_unpick_desc(HEAP32[r1>>2],HEAP32[r1+4>>2],r2,0,r4);STACKTOP=r3;return HEAP32[r4>>2]}function _new_game(r1,r2,r3){var r4,r5,r6;r1=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r1,r5=r4>>2;HEAP32[r5]=0;_unpick_desc(HEAP32[r2>>2],HEAP32[r2+4>>2],r3,r4,0);r4=HEAP32[r5];if((r4|0)==0){___assert_func(66776,1210,68480,66828);r6=HEAP32[r5]}else{r6=r4}_update_numbers(r6);_check_completion(HEAP32[r5],1);STACKTOP=r1;return HEAP32[r5]}function _dup_game(r1){var r2,r3,r4;r2=r1>>2;r1=_blank_game(HEAP32[r2],HEAP32[r2+1]),r3=r1>>2;HEAP32[r3+3]=HEAP32[r2+3];HEAP32[r3+4]=HEAP32[r2+4];HEAP32[r3+5]=HEAP32[r2+5];r4=(r1+8|0)>>2;_memcpy(HEAP32[r3+6],HEAP32[r2+6],HEAP32[r4]<<2);_memcpy(HEAP32[r3+8],HEAP32[r2+8],HEAP32[r4]<<2);_memcpy(HEAP32[r3+7],HEAP32[r2+7],HEAP32[r4]<<2);_memcpy(HEAP32[r3+9],HEAP32[r2+9],HEAP32[r4]<<2);_memcpy(HEAP32[r3+10],HEAP32[r2+10],HEAP32[r4]<<2);_memcpy(HEAP32[r3+11],HEAP32[r2+11],HEAP32[r4]<<2);_memcpy(HEAP32[r3+12],HEAP32[r2+12],(HEAP32[r4]<<2)+4|0);return r1}function _free_game(r1){var r2,r3;r2=r1>>2;r3=HEAP32[r2+6];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+7];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+8];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+9];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+10];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+11];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+12];if((r3|0)!=0){_free(r3)}if((r1|0)==0){return}_free(r1);return}function _solve_game(r1,r2,r3,r4){var r5,r6,r7,r8;r3=r2>>2;r2=r1>>2;r1=_blank_game(HEAP32[r3],HEAP32[r3+1]),r5=r1>>2;HEAP32[r5+3]=HEAP32[r3+3];HEAP32[r5+4]=HEAP32[r3+4];HEAP32[r5+5]=HEAP32[r3+5];r6=(r1+8|0)>>2;_memcpy(HEAP32[r5+6],HEAP32[r3+6],HEAP32[r6]<<2);_memcpy(HEAP32[r5+8],HEAP32[r3+8],HEAP32[r6]<<2);_memcpy(HEAP32[r5+7],HEAP32[r3+7],HEAP32[r6]<<2);_memcpy(HEAP32[r5+9],HEAP32[r3+9],HEAP32[r6]<<2);_memcpy(HEAP32[r5+10],HEAP32[r3+10],HEAP32[r6]<<2);_memcpy(HEAP32[r5+11],HEAP32[r3+11],HEAP32[r6]<<2);_memcpy(HEAP32[r5+12],HEAP32[r3+12],(HEAP32[r6]<<2)+4|0);do{if((_solve_state(r1)|0)>0){r6=_generate_desc(r1,1);_free_game(r1);if((r6|0)==0){break}else{r7=r6}return r7}else{_free_game(r1)}}while(0);r1=_blank_game(HEAP32[r2],HEAP32[r2+1]),r6=r1>>2;HEAP32[r6+3]=HEAP32[r2+3];HEAP32[r6+4]=HEAP32[r2+4];HEAP32[r6+5]=HEAP32[r2+5];r3=(r1+8|0)>>2;_memcpy(HEAP32[r6+6],HEAP32[r2+6],HEAP32[r3]<<2);_memcpy(HEAP32[r6+8],HEAP32[r2+8],HEAP32[r3]<<2);_memcpy(HEAP32[r6+7],HEAP32[r2+7],HEAP32[r3]<<2);_memcpy(HEAP32[r6+9],HEAP32[r2+9],HEAP32[r3]<<2);_memcpy(HEAP32[r6+10],HEAP32[r2+10],HEAP32[r3]<<2);_memcpy(HEAP32[r6+11],HEAP32[r2+11],HEAP32[r3]<<2);_memcpy(HEAP32[r6+12],HEAP32[r2+12],(HEAP32[r3]<<2)+4|0);r3=_solve_state(r1);do{if((r3|0)<0){HEAP32[r4>>2]=66892;r8=0}else{if((r3|0)==0){HEAP32[r4>>2]=66868;r8=0;break}else{r8=_generate_desc(r1,1);break}}}while(0);_free_game(r1);r7=r8;return r7}function _free_ui(r1){if((r1|0)==0){return}_free(r1);return}function _game_text_format(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r2=STACKTOP;r3=(r1+4|0)>>2;r4=HEAP32[r3];r5=(r1|0)>>2;r6=_malloc(r4+Math.imul(r4<<1,HEAP32[r5]<<2|1)+2|0);if((r6|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r4=HEAP32[r3];if((r4|0)<=0){r7=r6;HEAP8[r7]=0;STACKTOP=r2;return r6}r8=r1+28|0;r9=r1+8|0;r10=r1+24|0;r11=r1+32|0;r1=0;r12=r6;r13=r4;while(1){L356:do{if((r13|0)>0){r4=0;r14=r12;while(1){r15=Math.imul(HEAP32[r5],r1)+r4|0;HEAP8[r14]=HEAP8[HEAP32[(HEAP32[HEAP32[r10>>2]+(r15<<2)>>2]<<2)+65896>>2]];HEAP8[r14+1|0]=HEAP8[HEAP32[(HEAP32[HEAP32[r10>>2]+(r15<<2)>>2]<<2)+65896>>2]+1|0];HEAP8[r14+2|0]=(HEAP32[HEAP32[r11>>2]+(r15<<2)>>2]&1|0)!=0?73:32;r15=r14+4|0;HEAP8[r14+3|0]=32;r16=r4+1|0;if((r16|0)<(HEAP32[r3]|0)){r4=r16;r14=r15}else{r17=r15;break L356}}}else{r17=r12}}while(0);HEAP8[r17]=10;r14=r17+1|0;L360:do{if((HEAP32[r3]|0)>0){r4=0;r15=r17;r16=r14;while(1){r18=Math.imul(HEAP32[r5],r1)+r4|0;r19=HEAP32[HEAP32[r8>>2]+(r18<<2)>>2];do{if((r19|0)==0){HEAP8[r16]=32;HEAP8[r15+2|0]=32;HEAP8[r15+3|0]=32;r20=r15+4|0}else{r18=HEAP32[r9>>2]+1|0;r21=(r19|0)%(r18|0);r22=(r19|0)/(r18|0)&-1;if((r21|0)>=100){___assert_func(66776,233,68652,66984)}r18=(r22|0)==0;if(r18){r23=r16}else{HEAP8[r16]=r22+96&255;r23=r15+2|0}if((r21|0)>9){r24=((r21|0)/10&-1)+48&255}else{r24=32}HEAP8[r23]=r24;r22=r23+2|0;HEAP8[r23+1|0]=(r21|0)%10+48&255;if(!r18){r20=r22;break}HEAP8[r22]=32;r20=r23+3|0}}while(0);HEAP8[r20]=32;r19=r4+1|0;r22=r20+1|0;if((r19|0)<(HEAP32[r3]|0)){r4=r19;r15=r20;r16=r22}else{r25=r20;r26=r22;break L360}}}else{r25=r17;r26=r14}}while(0);HEAP8[r26]=10;r14=r25+3|0;HEAP8[r25+2|0]=10;r16=r1+1|0;r15=HEAP32[r3];if((r16|0)<(r15|0)){r1=r16;r12=r14;r13=r15}else{r7=r14;break}}HEAP8[r7]=0;STACKTOP=r2;return r6}function _new_ui(r1){var r2,r3,r4;r1=STACKTOP;r2=_malloc(36),r3=r2>>2;if((r2|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r4=(r2+20|0)>>2;HEAP32[r3]=0;HEAP32[r3+1]=0;HEAP32[r3+2]=0;HEAP32[r3+3]=0;HEAP32[r4]=0;HEAP32[r4+1]=0;HEAP32[r4+2]=0;HEAP32[r4+3]=0;STACKTOP=r1;return r2}}function _interpret_move(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r7=r2>>2;r8=r1>>2;r9=0;r10=STACKTOP;STACKTOP=STACKTOP+80|0;r11=r10;r12=(r3|0)>>2;r3=HEAP32[r12];r13=(r3|0)/-2&-1;r14=(r3+r4+r13|0)/(r3|0)&-1;r15=r14-1|0;r16=(r3+r5+r13|0)/(r3|0)&-1;r3=r16-1|0;r13=(r1|0)>>2;r17=HEAP32[r13];if((r6-521|0)>>>0<2|(r6|0)==524|(r6|0)==523){r18=(r2|0)>>2;r19=(r2+4|0)>>2;r20=HEAP32[r8+1];do{if((r6|0)==524){r21=0;r22=1;r9=281;break}else if((r6|0)==523){r21=0;r22=-1;r9=281;break}else if((r6|0)==521){r21=-1;r22=0;r9=281}else if((r6|0)==522){r21=1;r22=0;r9=281;break}}while(0);if(r9==281){r9=HEAP32[r18]+r22|0;r22=(r9|0)>0?r9:0;r9=r17-1|0;HEAP32[r18]=(r22|0)<(r9|0)?r22:r9;r9=HEAP32[r19]+r21|0;r21=(r9|0)>0?r9:0;r9=r20-1|0;HEAP32[r19]=(r21|0)<(r9|0)?r21:r9}HEAP32[r7+2]=1;if((HEAP32[r7+3]|0)==0){r23=67616;STACKTOP=r10;return r23}r9=HEAP32[r12];r21=(((r9|0)/2&-1)<<1)+Math.imul(r9,HEAP32[r18])|0;HEAP32[r7+7]=r21;r21=HEAP32[r12];r18=(((r21|0)/2&-1)<<1)+Math.imul(r21,HEAP32[r19])|0;HEAP32[r7+8]=r18;r23=67616;STACKTOP=r10;return r23}r18=(r6|0)==525;if((r6-525|0)>>>0<2){r19=r2+8|0;if((HEAP32[r19>>2]|0)==0){HEAP32[r19>>2]=1;r23=67616;STACKTOP=r10;return r23}r19=(r2+12|0)>>2;if((HEAP32[r19]|0)==0){HEAP32[r19]=1;r21=HEAP32[r7];HEAP32[r7+5]=r21;r9=HEAP32[r7+1];HEAP32[r7+6]=r9;r20=HEAP32[r12];r22=(((r20|0)/2&-1)<<1)+Math.imul(r20,r21)|0;HEAP32[r7+7]=r22;r22=HEAP32[r12];r12=(((r22|0)/2&-1)<<1)+Math.imul(r22,r9)|0;HEAP32[r7+8]=r12;HEAP32[r7+4]=r18&1;r23=67616;STACKTOP=r10;return r23}HEAP32[r19]=0;r19=(r2+20|0)>>2;r18=HEAP32[r19];r12=(r2|0)>>2;r9=HEAP32[r12];do{if((r18|0)==(r9|0)){if((HEAP32[r7+6]|0)==(HEAP32[r7+1]|0)){r23=67616}else{break}STACKTOP=r10;return r23}}while(0);do{if((HEAP32[r7+4]|0)==0){r22=r2+4|0;r21=r2+24|0;if((_isvalidmove(r1,0,r9,HEAP32[r22>>2],r18,HEAP32[r21>>2])|0)==0){r23=67616;STACKTOP=r10;return r23}else{r20=HEAP32[r22>>2];r22=HEAP32[r19];r24=HEAP32[r21>>2];_sprintf(r11|0,67804,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r12],HEAP32[tempInt+4>>2]=r20,HEAP32[tempInt+8>>2]=r22,HEAP32[tempInt+12>>2]=r24,tempInt));break}}else{r24=r2+24|0;r22=r2+4|0;if((_isvalidmove(r1,0,r18,HEAP32[r24>>2],r9,HEAP32[r22>>2])|0)==0){r23=67616;STACKTOP=r10;return r23}else{r20=HEAP32[r24>>2];r24=HEAP32[r12];r21=HEAP32[r22>>2];_sprintf(r11|0,67804,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r19],HEAP32[tempInt+4>>2]=r20,HEAP32[tempInt+8>>2]=r24,HEAP32[tempInt+12>>2]=r21,tempInt));break}}}while(0);r19=r11|0;r12=_malloc(_strlen(r19)+1|0);if((r12|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r12,r19);r23=r12;STACKTOP=r10;return r23}if((r6-512|0)>>>0<3){r12=(r2+8|0)>>2;r19=r2+12|0;do{if((HEAP32[r12]|0)==0){r9=r2+12|0;if((HEAP32[r19>>2]|0)==0){r25=r9;break}___assert_func(66776,1463,68624,66992);r25=r9}else{HEAP32[r19>>2]=0;HEAP32[r12]=0;r25=r2+12|0}}while(0);if((r14|0)<=0){r23=0;STACKTOP=r10;return r23}if(!((r15|0)<(HEAP32[r13]|0)&(r16|0)>0)){r23=0;STACKTOP=r10;return r23}if((r3|0)>=(HEAP32[r8+1]|0)){r23=0;STACKTOP=r10;return r23}r19=(r6|0)==512;do{if(r19){r9=Math.imul(r3,r17)+r15|0;if((HEAP32[HEAP32[r8+7]+(r9<<2)>>2]|0)!=(HEAP32[r8+2]|0)){break}if((HEAP32[HEAP32[r8+8]+(r9<<2)>>2]&1|0)==0){break}else{r23=0}STACKTOP=r10;return r23}else{if((r6|0)!=514){break}r9=Math.imul(r3,r17)+r15|0;if((HEAP32[HEAP32[r8+7]+(r9<<2)>>2]|0)!=1){break}if((HEAP32[HEAP32[r8+8]+(r9<<2)>>2]&1|0)==0){break}else{r23=0}STACKTOP=r10;return r23}}while(0);HEAP32[r25>>2]=1;HEAP32[r7+4]=r19&1;HEAP32[r7+5]=r15;HEAP32[r7+6]=r3;HEAP32[r7+7]=r4;HEAP32[r7+8]=r5;HEAP32[r12]=0;r23=67616;STACKTOP=r10;return r23}do{if((r6-515|0)>>>0<3){if((HEAP32[r7+3]|0)==0){break}HEAP32[r7+7]=r4;HEAP32[r7+8]=r5;r23=67616;STACKTOP=r10;return r23}}while(0);do{if((r6-518|0)>>>0<3){r5=r2+12|0;if((HEAP32[r5>>2]|0)==0){break}HEAP32[r5>>2]=0;r5=(r2+20|0)>>2;r4=HEAP32[r5];do{if((r4|0)==(r15|0)){if((HEAP32[r7+6]|0)==(r3|0)){r23=67616}else{break}STACKTOP=r10;return r23}}while(0);do{if((r14|0)>0){if(!((r15|0)<(HEAP32[r13]|0)&(r16|0)>0)){break}if((r3|0)>=(HEAP32[r8+1]|0)){break}r12=(r2+24|0)>>2;r19=HEAP32[r12];do{if((HEAP32[r7+4]|0)==0){if((_isvalidmove(r1,0,r15,r3,r4,r19)|0)==0){r23=67616;STACKTOP=r10;return r23}else{r25=HEAP32[r5];r9=HEAP32[r12];_sprintf(r11|0,67804,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r15,HEAP32[tempInt+4>>2]=r3,HEAP32[tempInt+8>>2]=r25,HEAP32[tempInt+12>>2]=r9,tempInt));break}}else{if((_isvalidmove(r1,0,r4,r19,r15,r3)|0)==0){r23=67616;STACKTOP=r10;return r23}else{r9=HEAP32[r12];_sprintf(r11|0,67804,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r5],HEAP32[tempInt+4>>2]=r9,HEAP32[tempInt+8>>2]=r15,HEAP32[tempInt+12>>2]=r3,tempInt));break}}}while(0);r12=r11|0;r19=_malloc(_strlen(r12)+1|0);if((r19|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r19,r12);r23=r19;STACKTOP=r10;return r23}}while(0);r5=HEAP32[r7+6];r19=Math.imul(r5,r17)+r4|0;do{if((HEAP32[HEAP32[r8+10]+(r19<<2)>>2]|0)==-1){if((HEAP32[HEAP32[r8+9]+(r19<<2)>>2]|0)==-1){r23=67616}else{break}STACKTOP=r10;return r23}}while(0);r19=r11|0;_sprintf(r19,67764,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=(HEAP32[r7+4]|0)!=0?67:88,HEAP32[tempInt+4>>2]=r4,HEAP32[tempInt+8>>2]=r5,tempInt));r12=_malloc(_strlen(r19)+1|0);if((r12|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r12,r19);r23=r12;STACKTOP=r10;return r23}}while(0);r3=(r6|0)==120;if(!((r6|0)==120|(r6|0)==88)){r23=0;STACKTOP=r10;return r23}if((HEAP32[r7+2]|0)==0){r23=0;STACKTOP=r10;return r23}r6=HEAP32[r7+1];r15=Math.imul(r6,r17);r17=HEAP32[r7];r7=r15+r17|0;do{if((HEAP32[HEAP32[r8+10]+(r7<<2)>>2]|0)==-1){if((HEAP32[HEAP32[r8+9]+(r7<<2)>>2]|0)==-1){r23=67616}else{break}STACKTOP=r10;return r23}}while(0);r7=r11|0;_sprintf(r7,67764,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r3?67:88,HEAP32[tempInt+4>>2]=r17,HEAP32[tempInt+8>>2]=r6,tempInt));r6=_malloc(_strlen(r7)+1|0);if((r6|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r6,r7);r23=r6;STACKTOP=r10;return r23}function _game_compute_size(r1,r2,r3,r4){var r5,r6;r5=((r2|0)/2&-1)<<1;r6=r5+Math.imul(HEAP32[r1>>2],r2)|0;HEAP32[r3>>2]=r6;r6=Math.imul(HEAP32[r1+4>>2],r2)+r5|0;HEAP32[r4>>2]=r6;return}function _execute_move(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39;r3=r1>>2;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+28|0;r6=r5,r7=r6>>2;r8=r5+4;r9=r5+8,r10=r9>>2;r11=r5+12,r12=r11>>2;r13=r5+16;r14=r5+20;r15=r5+24;r16=(r1|0)>>2;r17=HEAP32[r16];L510:do{if(HEAP8[r2]<<24>>24==83){r18=r1+4|0;r19=HEAP32[r18>>2];r20=r2+1|0;HEAP32[r8>>2]=0;_unpick_desc(r17,r19,r20,0,r8);if((HEAP32[r8>>2]|0)!=0){r21=0;STACKTOP=r5;return r21}r22=_blank_game(HEAP32[r16],HEAP32[r18>>2]),r18=r22>>2;HEAP32[r18+3]=HEAP32[r3+3];r23=r22+16|0;HEAP32[r23>>2]=HEAP32[r3+4];HEAP32[r18+5]=HEAP32[r3+5];r24=(r22+8|0)>>2;_memcpy(HEAP32[r18+6],HEAP32[r3+6],HEAP32[r24]<<2);_memcpy(HEAP32[r18+8],HEAP32[r3+8],HEAP32[r24]<<2);_memcpy(HEAP32[r18+7],HEAP32[r3+7],HEAP32[r24]<<2);r25=r22+36|0;_memcpy(HEAP32[r25>>2],HEAP32[r3+9],HEAP32[r24]<<2);r26=r22+40|0;_memcpy(HEAP32[r26>>2],HEAP32[r3+10],HEAP32[r24]<<2);_memcpy(HEAP32[r18+11],HEAP32[r3+11],HEAP32[r24]<<2);_memcpy(HEAP32[r18+12],HEAP32[r3+12],(HEAP32[r24]<<2)+4|0);HEAP32[r7]=0;_unpick_desc(r17,r19,r20,r6,0);r20=HEAP32[r7];if((r20|0)==0){___assert_func(66776,1210,68480,66828);r27=HEAP32[r7]}else{r27=r20}_update_numbers(r27);_check_completion(HEAP32[r7],1);r20=HEAP32[r7];r19=r1+8|0;L518:do{if((HEAP32[r19>>2]|0)>0){r24=r20+40|0;r18=r20+36|0;r28=0;while(1){HEAP32[HEAP32[r26>>2]+(r28<<2)>>2]=HEAP32[HEAP32[r24>>2]+(r28<<2)>>2];HEAP32[HEAP32[r25>>2]+(r28<<2)>>2]=HEAP32[HEAP32[r18>>2]+(r28<<2)>>2];r29=r28+1|0;if((r29|0)<(HEAP32[r19>>2]|0)){r28=r29}else{break L518}}}}while(0);_free_game(r20);HEAP32[r23>>2]=1;r30=r22;r4=410;break}else{if((_sscanf(r2,67804,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r9,HEAP32[tempInt+4>>2]=r11,HEAP32[tempInt+8>>2]=r13,HEAP32[tempInt+12>>2]=r14,tempInt))|0)==4){if((_isvalidmove(r1,0,HEAP32[r10],HEAP32[r12],HEAP32[r13>>2],HEAP32[r14>>2])|0)==0){r21=0;STACKTOP=r5;return r21}r19=_blank_game(HEAP32[r16],HEAP32[r3+1]),r25=r19>>2;HEAP32[r25+3]=HEAP32[r3+3];HEAP32[r25+4]=HEAP32[r3+4];HEAP32[r25+5]=HEAP32[r3+5];r26=(r19+8|0)>>2;_memcpy(HEAP32[r25+6],HEAP32[r3+6],HEAP32[r26]<<2);_memcpy(HEAP32[r25+8],HEAP32[r3+8],HEAP32[r26]<<2);_memcpy(HEAP32[r25+7],HEAP32[r3+7],HEAP32[r26]<<2);r28=(r19+36|0)>>2;_memcpy(HEAP32[r28],HEAP32[r3+9],HEAP32[r26]<<2);r18=(r19+40|0)>>2;_memcpy(HEAP32[r18],HEAP32[r3+10],HEAP32[r26]<<2);_memcpy(HEAP32[r25+11],HEAP32[r3+11],HEAP32[r26]<<2);_memcpy(HEAP32[r25+12],HEAP32[r3+12],(HEAP32[r26]<<2)+4|0);r26=Math.imul(HEAP32[r12],r17)+HEAP32[r10]|0;r25=Math.imul(HEAP32[r14>>2],r17)+HEAP32[r13>>2]|0;r24=HEAP32[r28];r29=HEAP32[r24+(r26<<2)>>2];if((r29|0)==-1){r31=r24}else{HEAP32[HEAP32[r18]+(r29<<2)>>2]=-1;r31=HEAP32[r28]}HEAP32[r31+(r26<<2)>>2]=r25;r29=HEAP32[r18];r24=HEAP32[r29+(r25<<2)>>2];if((r24|0)==-1){r32=r29}else{HEAP32[HEAP32[r28]+(r24<<2)>>2]=-1;r32=HEAP32[r18]}HEAP32[r32+(r25<<2)>>2]=r26;r30=r19;r4=410;break}if((_sscanf(r2,67764,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r15,HEAP32[tempInt+4>>2]=r9,HEAP32[tempInt+8>>2]=r11,tempInt))|0)!=3){if((_strcmp(r2,67720)|0)==0){r19=_blank_game(HEAP32[r16],HEAP32[r3+1]),r26=r19>>2;HEAP32[r26+3]=HEAP32[r3+3];HEAP32[r26+4]=HEAP32[r3+4];HEAP32[r26+5]=HEAP32[r3+5];r25=(r19+8|0)>>2;_memcpy(HEAP32[r26+6],HEAP32[r3+6],HEAP32[r25]<<2);_memcpy(HEAP32[r26+8],HEAP32[r3+8],HEAP32[r25]<<2);_memcpy(HEAP32[r26+7],HEAP32[r3+7],HEAP32[r25]<<2);_memcpy(HEAP32[r26+9],HEAP32[r3+9],HEAP32[r25]<<2);_memcpy(HEAP32[r26+10],HEAP32[r3+10],HEAP32[r25]<<2);_memcpy(HEAP32[r26+11],HEAP32[r3+11],HEAP32[r25]<<2);_memcpy(HEAP32[r26+12],HEAP32[r3+12],(HEAP32[r25]<<2)+4|0);_solve_state(r19);r30=r19;r4=410;break}else{r21=0;STACKTOP=r5;return r21}}r19=HEAP8[r15];if(!(r19<<24>>24==67|r19<<24>>24==88)){r21=0;STACKTOP=r5;return r21}r19=HEAP32[r10];if((r19|0)<=-1){r21=0;STACKTOP=r5;return r21}r25=HEAP32[r16];if((r19|0)>=(r25|0)){r21=0;STACKTOP=r5;return r21}r26=HEAP32[r12];if((r26|0)<=-1){r21=0;STACKTOP=r5;return r21}r18=HEAP32[r3+1];if((r26|0)>=(r18|0)){r21=0;STACKTOP=r5;return r21}r24=Math.imul(r26,r17)+r19|0;r19=r1+40|0;r26=r1+36|0;do{if((HEAP32[HEAP32[r19>>2]+(r24<<2)>>2]|0)==-1){if((HEAP32[HEAP32[r26>>2]+(r24<<2)>>2]|0)==-1){r21=0}else{break}STACKTOP=r5;return r21}}while(0);r22=_blank_game(r25,r18),r23=r22>>2;HEAP32[r23+3]=HEAP32[r3+3];HEAP32[r23+4]=HEAP32[r3+4];HEAP32[r23+5]=HEAP32[r3+5];r20=(r22+8|0)>>2;_memcpy(HEAP32[r23+6],HEAP32[r3+6],HEAP32[r20]<<2);_memcpy(HEAP32[r23+8],HEAP32[r3+8],HEAP32[r20]<<2);r28=(r1+28|0)>>2;_memcpy(HEAP32[r23+7],HEAP32[r28],HEAP32[r20]<<2);r29=(r22+36|0)>>2;_memcpy(HEAP32[r29],HEAP32[r26>>2],HEAP32[r20]<<2);r33=(r22+40|0)>>2;_memcpy(HEAP32[r33],HEAP32[r19>>2],HEAP32[r20]<<2);_memcpy(HEAP32[r23+11],HEAP32[r3+11],HEAP32[r20]<<2);_memcpy(HEAP32[r23+12],HEAP32[r3+12],(HEAP32[r20]<<2)+4|0);if(HEAP8[r15]<<24>>24==67){r20=HEAP32[HEAP32[r33]+(r24<<2)>>2];if((r20|0)!=-1){HEAP32[HEAP32[r29]+(r20<<2)>>2]=-1;HEAP32[HEAP32[r33]+(r24<<2)>>2]=-1}r20=HEAP32[HEAP32[r29]+(r24<<2)>>2];if((r20|0)==-1){r30=r22;r4=410;break}HEAP32[HEAP32[r33]+(r20<<2)>>2]=-1;HEAP32[HEAP32[r29]+(r24<<2)>>2]=-1;r34=r22;break}r20=HEAP32[r28];r23=r1+8|0;r35=HEAP32[r23>>2];r36=(HEAP32[r20+(r24<<2)>>2]|0)/(r35+1|0)&-1;if((r35|0)>0){r37=0;r38=r35;r39=r20}else{r30=r22;r4=410;break}while(1){r20=HEAP32[r39+(r37<<2)>>2];do{if((r20|0)!=0){if(((r20|0)/(r38+1|0)&-1|0)!=(r36|0)){break}r35=HEAP32[HEAP32[r33]+(r37<<2)>>2];if((r35|0)!=-1){HEAP32[HEAP32[r29]+(r35<<2)>>2]=-1;HEAP32[HEAP32[r33]+(r37<<2)>>2]=-1}r35=HEAP32[HEAP32[r29]+(r37<<2)>>2];if((r35|0)==-1){break}HEAP32[HEAP32[r33]+(r35<<2)>>2]=-1;HEAP32[HEAP32[r29]+(r37<<2)>>2]=-1}}while(0);r20=r37+1|0;r35=HEAP32[r23>>2];if((r20|0)>=(r35|0)){r30=r22;r4=410;break L510}r37=r20;r38=r35;r39=HEAP32[r28]}}}while(0);do{if(r4==410){if((r30|0)==0){r21=0}else{r34=r30;break}STACKTOP=r5;return r21}}while(0);_update_numbers(r34);if((_check_completion(r34,1)|0)==0){r21=r34;STACKTOP=r5;return r21}HEAP32[r34+12>>2]=1;r21=r34;STACKTOP=r5;return r21}function _game_set_size(r1,r2,r3,r4){r3=r2|0;HEAP32[r3>>2]=r4;if((r4|0)<=0){___assert_func(66776,1633,68672,67892)}r4=r2+56|0;if((HEAP32[r4>>2]|0)!=0){___assert_func(66776,1635,68672,67860)}r2=HEAP32[r3>>2];r3=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+44>>2]](HEAP32[r1+4>>2],r2,r2);HEAP32[r4>>2]=r3;return}function _game_free_drawstate(r1,r2){var r3;r3=HEAP32[r2+24>>2];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+28>>2];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+32>>2];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+56>>2];if((r3|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+48>>2]](HEAP32[r1+4>>2],r3)}if((r2|0)==0){return}_free(r2);return}function _game_colours(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r3=STACKTOP;r4=_malloc(912),r5=r4>>2;if((r4|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r6=r4,r7=r6>>2;_frontend_default_colour(r1,r6);r1=HEAPF32[r7];r8=r4+4|0;r9=HEAPF32[r8>>2];r10=r9>r1?r9:r1;r11=r4+8|0;r12=HEAPF32[r11>>2];r13=r12>r10?r12:r10;do{if(r13*1.2000000476837158>1){r10=1/r13;r14=r10<1.04?1.0399999618530273:r10;r10=r13*r14;if(r10<=1){r15=r14;r16=r1;r17=r9;r18=r12;break}r19=r1/r10;HEAPF32[r7]=r19;r20=r9/r10;HEAPF32[r8>>2]=r20;r21=r12/r10;HEAPF32[r11>>2]=r21;r15=r14;r16=r19;r17=r20;r18=r21}else{r15=1.2000000476837158;r16=r1;r17=r9;r18=r12}}while(0);HEAPF32[r5+3]=r15*r16;HEAPF32[r5+6]=r16*.800000011920929;HEAPF32[r5+4]=r15*r17;HEAPF32[r5+7]=r17*.800000011920929;HEAPF32[r5+5]=r15*r18;HEAPF32[r5+8]=r18*.800000011920929;r15=(r4+108|0)>>2;HEAPF32[r15]=0;r12=r4+84|0;HEAPF32[r12>>2]=0;HEAPF32[r5+12]=r16*.5;HEAPF32[r5+9]=r16/1.2999999523162842;r16=(r4+112|0)>>2;HEAPF32[r16]=0;r9=r4+88|0;HEAPF32[r9>>2]=0;r1=r4+4|0;HEAPF32[r5+13]=r17*.5;HEAPF32[r5+10]=r17/1.2999999523162842;r17=(r4+116|0)>>2;HEAPF32[r17]=0;r11=r4+92|0;HEAPF32[r11>>2]=0;r8=r4+8|0;HEAPF32[r5+14]=r18*.5;HEAPF32[r5+11]=r18/1.2999999523162842;HEAPF32[r5+30]=0;HEAPF32[r5+31]=0;HEAPF32[r5+32]=.8999999761581421;HEAPF32[r5+15]=1;HEAPF32[r5+16]=0;HEAPF32[r5+17]=0;HEAPF32[r5+18]=.20000000298023224;HEAPF32[r5+19]=1;HEAPF32[r5+20]=.20000000298023224;r18=0;while(1){r4=HEAP32[(r18<<2)+66028>>2];r13=r18*3&-1;HEAPF32[(r13+36<<2>>2)+r7]=((r4>>>16&255)>>>0)*.00390625;HEAPF32[(r13+37<<2>>2)+r7]=((r4>>>8&255)>>>0)*.00390625;HEAPF32[(r13+38<<2>>2)+r7]=((r4&255)>>>0)*.00390625;r4=r18+1|0;if((r4|0)==8){r22=0;break}else{r18=r4}}while(1){r18=r22*3&-1;HEAPF32[(r18+60<<2>>2)+r7]=(HEAPF32[(r18+36<<2>>2)+r7]+HEAPF32[(r18+39<<2>>2)+r7])*.5;HEAPF32[(r18+61<<2>>2)+r7]=(HEAPF32[(r18+37<<2>>2)+r7]+HEAPF32[(r18+40<<2>>2)+r7])*.5;HEAPF32[(r18+62<<2>>2)+r7]=(HEAPF32[(r18+38<<2>>2)+r7]+HEAPF32[(r18+41<<2>>2)+r7])*.5;r18=r22+1|0;if((r18|0)==8){break}else{r22=r18}}r22=HEAPF32[r7];HEAPF32[r5+24]=r22+(HEAPF32[r12>>2]-r22)*.10000000149011612;r22=HEAPF32[r1>>2];HEAPF32[r5+25]=r22+(HEAPF32[r9>>2]-r22)*.10000000149011612;r22=HEAPF32[r8>>2];HEAPF32[r5+26]=r22+(HEAPF32[r11>>2]-r22)*.10000000149011612;r22=HEAPF32[r5+36];HEAPF32[r5+33]=r22+(HEAPF32[r5+30]-r22)*.30000001192092896;r22=HEAPF32[r5+37];HEAPF32[r5+34]=r22+(HEAPF32[r5+31]-r22)*.30000001192092896;r22=HEAPF32[r5+38];HEAPF32[r5+35]=r22+(HEAPF32[r5+32]-r22)*.30000001192092896;r22=0;while(1){r5=r22*3&-1;r11=HEAPF32[(r5+36<<2>>2)+r7];HEAPF32[(r5+84<<2>>2)+r7]=r11+(HEAPF32[r15]-r11)*.30000001192092896;r9=HEAPF32[(r5+37<<2>>2)+r7];HEAPF32[(r5+85<<2>>2)+r7]=r9+(HEAPF32[r16]-r9)*.30000001192092896;r12=HEAPF32[(r5+38<<2>>2)+r7];HEAPF32[(r5+86<<2>>2)+r7]=r12+(HEAPF32[r17]-r12)*.30000001192092896;HEAPF32[(r5+132<<2>>2)+r7]=r11+(HEAPF32[r15]-r11)*.10000000149011612;HEAPF32[(r5+133<<2>>2)+r7]=r9+(HEAPF32[r16]-r9)*.10000000149011612;HEAPF32[(r5+134<<2>>2)+r7]=r12+(HEAPF32[r17]-r12)*.10000000149011612;r18=HEAPF32[r7];HEAPF32[(r5+180<<2>>2)+r7]=r18+(r11-r18)*.5;r18=HEAPF32[r1>>2];HEAPF32[(r5+181<<2>>2)+r7]=r18+(r9-r18)*.5;r18=HEAPF32[r8>>2];HEAPF32[(r5+182<<2>>2)+r7]=r18+(r12-r18)*.5;r18=r22+1|0;if((r18|0)==16){break}else{r22=r18}}HEAP32[r2>>2]=76;STACKTOP=r3;return r6}function _game_new_drawstate(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11;r1=STACKTOP;r3=_malloc(60),r4=r3>>2;if((r3|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r5=r3;HEAP32[r4+2]=0;HEAP32[r4+1]=0;HEAP32[r4]=0;HEAP32[r4+3]=HEAP32[r2>>2];HEAP32[r4+4]=HEAP32[r2+4>>2];r6=(r2+8|0)>>2;HEAP32[r4+5]=HEAP32[r6];r4=_malloc(HEAP32[r6]<<2);if((r4|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r2=r3+24|0;HEAP32[r2>>2]=r4;r4=_malloc(HEAP32[r6]<<2);if((r4|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r7=r3+28|0;HEAP32[r7>>2]=r4;r4=_malloc(HEAP32[r6]<<2);if((r4|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r8=r3+32|0;HEAP32[r8>>2]=r4;if((HEAP32[r6]|0)>0){r9=0}else{r10=r3+36|0,r11=r10>>2;HEAP32[r11]=0;HEAP32[r11+1]=0;HEAP32[r11+2]=0;HEAP32[r11+3]=0;HEAP32[r11+4]=0;HEAP32[r11+5]=0;STACKTOP=r1;return r5}while(1){HEAP32[HEAP32[r2>>2]+(r9<<2)>>2]=0;HEAP32[HEAP32[r7>>2]+(r9<<2)>>2]=-1;HEAP32[HEAP32[r8>>2]+(r9<<2)>>2]=0;r4=r9+1|0;if((r4|0)<(HEAP32[r6]|0)){r9=r4}else{break}}r10=r3+36|0,r11=r10>>2;HEAP32[r11]=0;HEAP32[r11+1]=0;HEAP32[r11+2]=0;HEAP32[r11+3]=0;HEAP32[r11+4]=0;HEAP32[r11+5]=0;STACKTOP=r1;return r5}function _game_anim_length(r1,r2,r3,r4){return 0}function _game_flash_length(r1,r2,r3,r4){var r5;do{if((HEAP32[r1+12>>2]|0)==0){if((HEAP32[r2+12>>2]|0)==0){break}if((HEAP32[r2+16>>2]|0)==0){r5=.699999988079071}else{break}return r5}}while(0);r5=0;return r5}function _game_status(r1){return(HEAP32[r1+12>>2]|0)!=0&1}function _game_print_size(r1,r2,r3){var r4;r4=(HEAP32[r1+4>>2]*1300&-1)+1300|0;HEAPF32[r2>>2]=((HEAP32[r1>>2]*1300&-1)+1300|0)/100;HEAPF32[r3>>2]=(r4|0)/100;return}function _game_redraw(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84;r7=r6>>2;r5=0;r3=STACKTOP;STACKTOP=STACKTOP+124|0;r9=r3,r10=r9>>2;r11=r3+56,r12=r11>>2;r13=r3+88;r14=r2+12|0;r15=HEAP32[r14>>2];if(r8>0){r16=r8/.699999988079071*6.283185307179586}else{r16=0}r8=(r2+36|0)>>2;if(r16!=(HEAP32[tempDoublePtr>>2]=HEAP32[r8],HEAP32[tempDoublePtr+4>>2]=HEAP32[r8+1],HEAPF64[tempDoublePtr>>3])){HEAPF64[tempDoublePtr>>3]=r16,HEAP32[r8]=HEAP32[tempDoublePtr>>2],HEAP32[r8+1]=HEAP32[tempDoublePtr+4>>2];r17=1}else{r17=0}r8=(r2+44|0)>>2;if((HEAP32[r8]|0)!=0){r18=r2+56|0;r19=HEAP32[r18>>2];if((r19|0)==0){___assert_func(66776,2027,68688,66224);r20=HEAP32[r18>>2]}else{r20=r19}r19=r2+48|0;r18=r2+52|0;r21=r1|0;r22=r1+4|0;FUNCTION_TABLE[HEAP32[HEAP32[r21>>2]+56>>2]](HEAP32[r22>>2],r20,HEAP32[r19>>2],HEAP32[r18>>2]);r20=HEAP32[r2>>2];r23=HEAP32[HEAP32[r21>>2]+20>>2];if((r23|0)!=0){FUNCTION_TABLE[r23](HEAP32[r22>>2],HEAP32[r19>>2],HEAP32[r18>>2],r20,r20)}HEAP32[r8]=0}r20=(r6+12|0)>>2;do{if((HEAP32[r20]|0)==0){r24=r4,r25=r24>>2;r26=0}else{_memcpy(r13,r6,36);r18=_interpret_move(r4,r13,r2,HEAP32[r7+7],HEAP32[r7+8],518);if((r18|0)==0){r24=r4,r25=r24>>2;r26=0;break}if(HEAP8[r18]<<24>>24==0){r24=r4,r25=r24>>2;r26=0;break}r19=_execute_move(r4,r18);_free(r18);r24=r19,r25=r24>>2;r26=r19}}while(0);r4=(r2+4|0)>>2;do{if((HEAP32[r4]|0)==0){r13=(r2|0)>>2;r19=HEAP32[r13];r18=r24|0;r22=Math.imul(HEAP32[r18>>2],r19);r23=Math.imul(HEAP32[r25+1],r19);r21=((r19|0)/2&-1)<<1;r19=(r1|0)>>2;r27=(r1+4|0)>>2;FUNCTION_TABLE[HEAP32[HEAP32[r19]+4>>2]](HEAP32[r27],0,0,r21+r22|0,r21+r23|0,0);r21=(HEAP32[r13]|0)/2&-1;r28=r21-1|0;r29=r21+r22|0;r30=r21+r23|0;r21=r11|0;HEAP32[r21>>2]=r28;HEAP32[r12+1]=r28;HEAP32[r12+2]=r28;HEAP32[r12+3]=r30;HEAP32[r12+4]=r29;HEAP32[r12+5]=r30;HEAP32[r12+6]=r29;HEAP32[r12+7]=r28;FUNCTION_TABLE[HEAP32[HEAP32[r19]+12>>2]](HEAP32[r27],r21,4,-1,3);r21=((HEAP32[r13]|0)/2&-1)<<1;r13=HEAP32[HEAP32[r19]+20>>2];if((r13|0)==0){r31=r18,r32=r31>>2;break}FUNCTION_TABLE[r13](HEAP32[r27],0,0,r21+r22|0,r21+r23|0);r31=r18,r32=r31>>2}else{r31=r24|0,r32=r31>>2}}while(0);r31=HEAP32[r32];L681:do{if((r31|0)>0){r12=r24+4|0;r11=r6+8|0;r18=r24+20|0;r23=(r24+28|0)>>2;r21=r24+32|0;r22=r24+36|0;r27=r24+40|0;r13=r2+24|0;r19=r2+32|0;r28=r2+28|0;r29=(r17|0)==0;r30=r2|0;r33=(r24+24|0)>>2;r34=r6+20|0;r35=r6+24|0;r36=r6+16|0;r37=r24+8|0;r38=r6|0;r39=r6+4|0;r40=HEAP32[r12>>2];r41=0;r42=r40;r43=r40;r40=r31;while(1){if((r42|0)>0){r44=0;r45=r42;r46=r43;while(1){r47=Math.imul(r44,r15)+r41|0;do{if((HEAP32[r11>>2]|0)==0){r48=0}else{if((r41|0)!=(HEAP32[r38>>2]|0)){r48=0;break}r48=(r44|0)==(HEAP32[r39>>2]|0)&1}}while(0);L692:do{if((HEAP32[r20]|0)==0){r49=r48;r50=r45}else{r51=HEAP32[r34>>2];r52=(r41|0)==(r51|0);do{if(r52){if((r44|0)!=(HEAP32[r35>>2]|0)){break}r49=r48|2;r50=r45;break L692}}while(0);r53=HEAP32[r35>>2];r54=HEAP32[r32];if((HEAP32[r36>>2]|0)==0){r55=Math.imul(r54,r44)+r41|0;r56=HEAP32[HEAP32[r33]+(r55<<2)>>2];L700:do{if(r52&(r44|0)==(r53|0)){r57=1}else{if((HEAP32[HEAP32[r23]+(r55<<2)>>2]|0)==(HEAP32[r37>>2]|0)){r57=1;break}r58=(r56<<2)+65864|0;r59=(r56<<2)+65832|0;r60=r44;r61=r41;while(1){if(!((r61|0)<(r54|0)&(r60|0)>-1&(r60|0)<(r45|0))){r57=1;break L700}if((r61|0)==(r51|0)&(r60|0)==(r53|0)){r57=0;break L700}r62=HEAP32[r58>>2]+r61|0;if((r62|0)>-1){r60=HEAP32[r59>>2]+r60|0;r61=r62}else{r57=1;break L700}}}}while(0);r49=r57?r48|64:r48;r50=r45;break}r56=Math.imul(r54,r53)+r51|0;r55=HEAP32[HEAP32[r33]+(r56<<2)>>2];L709:do{if(r52&(r53|0)==(r44|0)){r63=1;r64=r45}else{if(!((HEAP32[HEAP32[r23]+(r56<<2)>>2]|0)!=(HEAP32[r37>>2]|0)&(r51|0)>-1)){r63=1;r64=r45;break}r61=(r55<<2)+65864|0;r60=(r55<<2)+65832|0;r59=r53;r58=r51;r62=r45;while(1){if(!((r58|0)<(r54|0)&(r59|0)>-1)){r63=1;r64=r62;break L709}if((r59|0)>=(r46|0)){r63=1;r64=r46;break L709}if((r58|0)==(r41|0)&(r59|0)==(r44|0)){r63=0;r64=r46;break L709}r65=HEAP32[r61>>2]+r58|0;if((r65|0)>-1){r59=HEAP32[r60>>2]+r59|0;r58=r65;r62=r46}else{r63=1;r64=r46;break L709}}}}while(0);r49=r63?r48|64:r48;r50=r64}}while(0);do{if((HEAP32[r18>>2]|0)==0){if((HEAP32[HEAP32[r23]+(r47<<2)>>2]|0)<0){r5=525;break}r54=HEAP32[HEAP32[r21>>2]+(r47<<2)>>2];if((r54&2|0)==0){r66=r49;r67=r54;break}else{r5=525;break}}else{r5=525}}while(0);if(r5==525){r5=0;r66=r49|4;r67=HEAP32[HEAP32[r21>>2]+(r47<<2)>>2]}r54=(r67&1|0)==0?r66:r66|8;r51=(HEAP32[HEAP32[r22>>2]+(r47<<2)>>2]|0)==-1?r54:r54|16;r54=HEAP32[HEAP32[r27>>2]+(r47<<2)>>2];do{if((r54|0)==-1){r68=-1;r69=r51}else{r53=r51|32;r55=(r54|0)%(r15|0);r56=(r54|0)/(r15|0)&-1;r52=r55-r41|0;r62=r56-r44|0;r58=(r55|0)!=(r41|0);r55=(r56|0)==(r44|0);if(!(r55|r58^1)){if((((r52|0)>-1?r52:-r52|0)|0)!=(((r62|0)>-1?r62:-r62|0)|0)){r68=-1;r69=r53;break}}if(r58){r70=(r52|0)/(((r52|0)>-1?r52:-r52|0)|0)&-1}else{r70=r52}if(r55){r71=r62}else{r71=(r62|0)/(((r62|0)>-1?r62:-r62|0)|0)&-1}if((r70|0)==0){if((r71|0)==-1){r68=0;r69=r53;break}if((r71|0)==1){r68=4;r69=r53;break}}else if((r70|0)==1){if((r71|0)==-1){r68=1;r69=r53;break}if((r71|0)==0){r68=2;r69=r53;break}if((r71|0)==1){r68=3;r69=r53;break}}else if((r70|0)==-1){if((r71|0)==1){r68=5;r69=r53;break}if((r71|0)==0){r68=6;r69=r53;break}if((r71|0)==-1){r68=7;r69=r53;break}}r68=-1;r69=r53}}while(0);do{if((HEAP32[HEAP32[r23]+(r47<<2)>>2]|0)==(HEAP32[HEAP32[r13>>2]+(r47<<2)>>2]|0)){if((r69|0)!=(HEAP32[HEAP32[r19>>2]+(r47<<2)>>2]|0)){r5=547;break}if(!((r68|0)==(HEAP32[HEAP32[r28>>2]+(r47<<2)>>2]|0)&r29)){r5=547;break}if((HEAP32[r4]|0)==0){r5=547;break}else{r72=r50;r73=r46;break}}else{r5=547}}while(0);if(r5==547){r5=0;r54=HEAP32[16457];if((r54|0)<0){r51=_getenv(66080);if((r51|0)==0){r74=0}else{r53=HEAP8[r51];r74=r53<<24>>24==121|r53<<24>>24==89}r53=r74&1;HEAP32[16457]=r53;r75=r53}else{r75=r54}if((r75|0)==0){r76=1}else{r76=1-((r44^r41)<<1&2)|0}r54=HEAP32[r30>>2];r53=(r54|0)/2&-1;r51=r53+Math.imul(r54,r41)|0;_tile_redraw(r1,r2,r51,r53+Math.imul(r54,r44)|0,HEAP32[HEAP32[r33]+(r47<<2)>>2],HEAP32[HEAP32[r23]+(r47<<2)>>2],r69,r16*r76,-1);HEAP32[HEAP32[r13>>2]+(r47<<2)>>2]=HEAP32[HEAP32[r23]+(r47<<2)>>2];HEAP32[HEAP32[r19>>2]+(r47<<2)>>2]=r69;HEAP32[HEAP32[r28>>2]+(r47<<2)>>2]=r68;r54=HEAP32[r12>>2];r72=r54;r73=r54}r54=r44+1|0;if((r54|0)<(r72|0)){r44=r54;r45=r72;r46=r73}else{break}}r77=r72;r78=r73;r79=HEAP32[r32]}else{r77=r42;r78=r43;r79=r40}r46=r41+1|0;if((r46|0)<(r79|0)){r41=r46;r42=r77;r43=r78;r40=r79}else{break L681}}}}while(0);if((HEAP32[r20]|0)!=0){HEAP32[r8]=1;r8=r6+28|0;r20=r2|0;r79=(HEAP32[r20>>2]|0)/2&-1;r78=HEAP32[r8>>2]-r79|0;HEAP32[r2+48>>2]=r78;r77=r6+32|0;r6=HEAP32[r77>>2]-r79|0;HEAP32[r2+52>>2]=r6;r79=r1|0;r32=r1+4|0;FUNCTION_TABLE[HEAP32[HEAP32[r79>>2]+52>>2]](HEAP32[r32>>2],HEAP32[r2+56>>2],r78,r6);r6=HEAP32[r20>>2];r20=HEAP32[r14>>2];r14=HEAP32[r8>>2];r8=(r6|0)/2&-1;r78=((r14+r6-r8|0)/(r6|0)&-1)-1|0;r2=HEAP32[r77>>2];r77=((r6-r8+r2|0)/(r6|0)&-1)-1|0;do{if((r26|0)==0){r1=r8<<1;r73=Math.imul(HEAP32[r7+5],r6)+r1|0;r72=Math.imul(HEAP32[r7+6],r6)+r1|0;r1=Math.abs(r73-r14|0);r68=Math.abs(r72-r2|0);do{if((r73|0)==(r14|0)){r80=(r72|0)>(r2|0)?0:3.141592653589793}else{if((r72|0)==(r2|0)){r80=(r73|0)>(r14|0)?4.71238898038469:1.5707963267948966;break}r69=(r14|0)>(r73|0);do{if(r69&(r2|0)<(r72|0)){r81=r1/r68;r82=0}else{r76=(r2|0)>(r72|0);if(r69&r76){r81=r68/r1;r82=1.5707963267948966;break}if((r14|0)>=(r73|0)|r76^1){r81=r68/r1;r82=4.71238898038469;break}else{r81=r1/r68;r82=3.141592653589793;break}}}while(0);r80=r82+Math.atan(r81)}}while(0);if((HEAP32[r7+4]|0)!=0){r83=r80;break}r83=r80+3.141592653589793}else{if((HEAP32[r7+4]|0)==0){r84=((r78+Math.imul(r77,r20)|0)<<2)+HEAP32[r25+6]|0}else{r84=(Math.imul(HEAP32[r7+6],r20)+HEAP32[r7+5]<<2)+HEAP32[r25+6]|0}r83=(HEAP32[r84>>2]|0)*6.283185307179586*.125}}while(0);r84=(r6*7&-1|0)/32&-1;r6=HEAP32[r32>>2];r32=HEAP32[HEAP32[r79>>2]+12>>2];r79=Math.sin(r83);r25=Math.cos(r83);r83=r84|0;r7=(r83*(r25/3+1)+.5&-1)-r84|0;r20=(r83*(r79/3+1)+.5&-1)-r84|0;r77=(r83*(r25+1)+.5&-1)-r84|0;r25=(r83*(r79+1)+.5&-1)-r84|0;r84=r9|0;HEAP32[r84>>2]=r25+r14|0;HEAP32[r10+1]=r2-r77|0;HEAP32[r10+2]=r77+r14|0;HEAP32[r10+3]=r25+r2|0;r9=r7+r14|0;HEAP32[r10+4]=r9;r79=r20+r2|0;HEAP32[r10+5]=r79;HEAP32[r10+6]=r9-r25|0;HEAP32[r10+7]=r79+r77|0;r79=r14-r7|0;HEAP32[r10+8]=r79-r25|0;r7=r2-r20|0;HEAP32[r10+9]=r7+r77|0;HEAP32[r10+10]=r79;HEAP32[r10+11]=r7;HEAP32[r10+12]=r14-r77|0;HEAP32[r10+13]=r2-r25|0;FUNCTION_TABLE[r32](r6,r84,7,7,7)}if((r26|0)!=0){_free_game(r26)}if((HEAP32[r4]|0)!=0){STACKTOP=r3;return}HEAP32[r4]=1;STACKTOP=r3;return}function _game_timing_state(r1,r2){return 1}function _game_print(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r4=STACKTOP;STACKTOP=STACKTOP+92|0;r5=r4,r6=r5>>2;r7=r4+32;r8=_print_mono_colour(r1,0);r9=r7|0;HEAP32[r9>>2]=r3;HEAP32[r7+20>>2]=HEAP32[r2+8>>2];r10=(r1|0)>>2;r11=HEAP32[HEAP32[r10]+84>>2];r12=(r1+4|0)>>2;r13=HEAP32[r12];r14=(r1+20|0)>>2;r15=((r3|0)/40&-1|0)*Math.sqrt(HEAPF32[r14]);FUNCTION_TABLE[r11](r13,r15);r15=(r2|0)>>2;r13=HEAP32[r15];L804:do{if((r13|0)>1){r11=(r3|0)/2&-1;r16=r2+4|0;r17=1;while(1){r18=Math.imul(r17,r3)+r11|0;r19=Math.imul(HEAP32[r16>>2],r3)+r11|0;FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](HEAP32[r12],r18,r11,r18,r19,r8);r19=r17+1|0;r18=HEAP32[r15];if((r19|0)<(r18|0)){r17=r19}else{r20=r18;r21=r16,r22=r21>>2;break L804}}}else{r20=r13;r21=r2+4|0,r22=r21>>2}}while(0);L810:do{if((HEAP32[r22]|0)>1){r21=1;r13=r20;while(1){r16=(r3|0)/2&-1;r17=r16+Math.imul(r21,r3)|0;r11=Math.imul(r13,r3)+r16|0;FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](HEAP32[r12],r16,r17,r11,r17,r8);r17=r21+1|0;if((r17|0)>=(HEAP32[r22]|0)){r23=r16;break L810}r21=r17;r13=HEAP32[r15]}}else{r23=(r3|0)/2&-1}}while(0);r20=HEAP32[HEAP32[r10]+84>>2];r13=HEAP32[r12];r21=((r3<<1|0)/40&-1|0)*Math.sqrt(HEAPF32[r14]);FUNCTION_TABLE[r20](r13,r21);r21=r23-1|0;r13=Math.imul(HEAP32[r15],r3)+r21|0;r20=Math.imul(HEAP32[r22],r3)+r21|0;r21=r5|0;HEAP32[r21>>2]=r23;HEAP32[r6+1]=r23;HEAP32[r6+2]=r23;HEAP32[r6+3]=r20;HEAP32[r6+4]=r13;HEAP32[r6+5]=r20;HEAP32[r6+6]=r13;HEAP32[r6+7]=r23;FUNCTION_TABLE[HEAP32[HEAP32[r10]+12>>2]](HEAP32[r12],r21,4,-1,r8);r21=HEAP32[HEAP32[r10]+84>>2];r10=HEAP32[r12];Math.sqrt(HEAPF32[r14]);FUNCTION_TABLE[r21](r10,0);r10=HEAP32[r22];if((r10|0)<=0){STACKTOP=r4;return}r21=r2+24|0;r14=r2+28|0;r2=0;r12=HEAP32[r15];r23=r10;while(1){if((r12|0)>0){r10=0;r6=r12;while(1){r13=HEAP32[r9>>2];r20=(r13|0)/2&-1;r5=Math.imul(r13,r10)+r20|0;r3=Math.imul(r13,r2)+r20|0;r20=Math.imul(r6,r2)+r10|0;_tile_redraw(r1,r7,r5,r3,HEAP32[HEAP32[r21>>2]+(r20<<2)>>2],HEAP32[HEAP32[r14>>2]+(r20<<2)>>2],0,0,r8);r20=r10+1|0;r24=HEAP32[r15];if((r20|0)<(r24|0)){r10=r20;r6=r24}else{break}}r25=r24;r26=HEAP32[r22]}else{r25=r12;r26=r23}r6=r2+1|0;if((r6|0)<(r26|0)){r2=r6;r12=r25;r23=r26}else{break}}STACKTOP=r4;return}function _tile_redraw(r1,r2,r3,r4,r5,r6,r7,r8,r9){var r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42;r10=r1>>2;r11=0;r12=STACKTOP;STACKTOP=STACKTOP+108|0;r13=r12,r14=r13>>2;r15=r12+32,r16=r15>>2;r17=r12+88;r18=(r2|0)>>2;r19=HEAP32[r18];r20=(r19|0)/16&-1;if((r6|0)==0){r21=(r7&48|0)==0&1}else{r21=0}do{if((r9|0)>-1){r22=r9;r23=-1;r24=r9;r25=0;r26=r19}else{do{if((r21|0)==0){r27=(r6|0)/(HEAP32[r2+20>>2]+1|0)&-1;if((r6|0)<1|(r27|0)==0){r28=12;break}r28=(r27-1|0)%15+13|0}else{r28=0}}while(0);do{if((r7&2|0)==0){if((r7&64|0)==0){r29=(r7&16|0)==0?7:r28+16|0;break}else{r29=(r28|0)==0?8:r28+32|0;break}}else{r29=6}}while(0);do{if((r7&12|0)==4){r30=5;r31=r7&64;r11=621;break}else{r27=(r7>>>3&1)+9|0;r32=r7&64;if((r32|0)!=0){r30=(r28|0)==0?8:r28+32|0;r31=r32;r11=621;break}if((r7&16|0)==0){if((HEAP32[r2+20>>2]|0)!=(r6|0)){r33=7;r34=r27;r35=1;break}}if(!((r7&32|0)!=0|(r6|0)==1)){r33=7;r34=r27;r35=1;break}r33=7;r34=(r27|0)==10?11:r28+16|0;r35=1;break}}while(0);do{if(r11==621){if((r31|0)==0){r33=7;r34=r30;r35=1;break}r33=(r28|0)==0?8:r28+32|0;r34=r30;r35=0}}while(0);if((r9|0)>=0){r22=r34;r23=r33;r24=r29;r25=0;r26=r19;break}if(r35){r36=r28}else{r36=(r28|0)==0?0:r28+48|0}FUNCTION_TABLE[HEAP32[HEAP32[r10]+4>>2]](HEAP32[r10+1],r3,r4,r19,r19,r36);r22=r34;r23=r33;r24=r29;r25=1;r26=HEAP32[r18]}}while(0);r29=r26*7&-1;r33=(r29|0)/32&-1;r34=(r26|0)/2&-1;r26=r34+r3|0;r36=r26+r33|0;r19=r34+r4|0;r34=r19+r33|0;r28=r2+20|0;do{if((HEAP32[r28>>2]|0)==(r6|0)){if((r7&8|0)==0){r11=634;break}r2=_malloc(80);if((r2|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r35=r2;r9=r33|0;r30=r9*.5;r31=0;while(1){r27=(r31|0)/10*6.283185307179586+r8;r32=(r31&1|0)==0?r9:r30;r37=(Math.sin(r27)*r32&-1)+r36|0;r38=r31<<1;HEAP32[r35+(r38<<2)>>2]=r37;r37=(Math.cos(r27)*-r32&-1)+r34|0;HEAP32[r35+((r38|1)<<2)>>2]=r37;r37=r31+1|0;if((r37|0)==10){break}else{r31=r37}}FUNCTION_TABLE[HEAP32[HEAP32[r10]+12>>2]](HEAP32[r10+1],r35,10,r24,r24);_free(r2);break}else{r11=634}}while(0);if(r11==634){r31=HEAP32[r10+1];r30=HEAP32[HEAP32[r10]+12>>2];r9=(r5|0)*6.283185307179586*.125+r8;r8=Math.sin(r9);r5=Math.cos(r9);r9=r33|0;r37=r9*(r5/3+1)+.5&-1;r38=r9*(r8/3+1)+.5&-1;r32=r9*(r5+1)+.5&-1;r5=r32-r33|0;r27=r9*(r8+1)+.5&-1;r8=r27-r33|0;r9=r15|0;HEAP32[r9>>2]=r27+r26|0;HEAP32[r16+1]=r34-r5|0;HEAP32[r16+2]=r32+r26|0;HEAP32[r16+3]=r27+r19|0;r27=r37+r26|0;HEAP32[r16+4]=r27;r26=r38+r19|0;HEAP32[r16+5]=r26;HEAP32[r16+6]=r27-r8|0;HEAP32[r16+7]=r26+r5|0;r26=r33-r37+r36|0;HEAP32[r16+8]=r26-r8|0;r37=r33-r38+r34|0;HEAP32[r16+9]=r37+r5|0;HEAP32[r16+10]=r26;HEAP32[r16+11]=r37;HEAP32[r16+12]=r36-r5|0;HEAP32[r16+13]=r34-r8|0;FUNCTION_TABLE[r30](r31,r9,7,r24,r24)}do{if(r25){if((r7&1|0)!=0){_draw_rect_corners(r1,r36,r34,r33+1|0,4)}r24=(HEAP32[r18]|0)/2&-1;if((r7&32|0)!=0|(r6|0)==1){break}FUNCTION_TABLE[HEAP32[HEAP32[r10]+16>>2]](HEAP32[r10+1],r3-r33+r24|0,r33+r4+r24|0,(r29|0)/128&-1,r23,r23)}}while(0);if((r21|0)==0){L883:do{if((r6|0)<1){r39=r17|0;r11=644;break}else{r21=HEAP32[r28>>2]+1|0;r23=(r6|0)/(r21|0)&-1;r29=r17|0;if((r23|0)==0){r39=r29;r11=644;break}r7=(r6|0)%(r21|0);r21=r17+19|0;do{if((r7|0)==0){HEAP8[r21]=0;r40=r21;r41=r23;break}else{_sprintf(r29,66964,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r7,tempInt));r34=r17+(19-_strlen(r29))|0;_sprintf(r34,66964,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r7,tempInt));r40=r34;r41=r23;break}}while(0);while(1){r23=r41-1|0;r7=r40-1|0;HEAP8[r7]=(r23|0)%26+97&255;if((r41+24|0)>>>0>50){r40=r7;r41=(r23|0)/26&-1}else{r42=r7;break L883}}}}while(0);if(r11==644){_sprintf(r39,67484,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r6,tempInt));r42=r39}r39=r33<<1;r33=HEAP32[r18];r6=(r33-(r20<<1)|0)/(_strlen(r42)|0)&-1;FUNCTION_TABLE[HEAP32[HEAP32[r10]>>2]](HEAP32[r10+1],r20+r3|0,((r33|0)/4&-1)+r4|0,1,(r39|0)<(r6|0)?r39:r6,256,r22,r42)}if(!r25){STACKTOP=r12;return}r25=HEAP32[r18];r42=r3-1+r25|0;r22=r4-1+r25|0;r25=r13|0;HEAP32[r25>>2]=r3;HEAP32[r14+1]=r4;HEAP32[r14+2]=r3;HEAP32[r14+3]=r22;HEAP32[r14+4]=r42;HEAP32[r14+5]=r22;HEAP32[r14+6]=r42;HEAP32[r14+7]=r4;r14=r1|0;r42=r1+4|0;FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+12>>2]](HEAP32[r42>>2],r25,4,-1,3);r25=HEAP32[r18];r18=HEAP32[HEAP32[r14>>2]+20>>2];if((r18|0)==0){STACKTOP=r12;return}FUNCTION_TABLE[r18](HEAP32[r42>>2],r3,r4,r25,r25);STACKTOP=r12;return}function _isvalidmove(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42;r7=r1>>2;r8=0;r9=(r1|0)>>2;r10=HEAP32[r9];r11=Math.imul(r10,r4)+r3|0;r12=Math.imul(r10,r6)+r5|0;if(!((r3|0)>-1&(r10|0)>(r3|0)&(r4|0)>-1)){r13=0;return r13}r14=HEAP32[r7+1];if(!((r14|0)>(r4|0)&(r5|0)>-1&(r10|0)>(r5|0)&(r6|0)>-1&(r14|0)>(r6|0))){r13=0;return r13}r15=HEAP32[HEAP32[r7+6]+(r11<<2)>>2];if((r3|0)==(r5|0)&(r4|0)==(r6|0)){r13=0;return r13}r16=(r1+28|0)>>2;r17=HEAP32[r16];r18=HEAP32[r17+(r11<<2)>>2];r19=(r1+8|0)>>2;if((r18|0)==(HEAP32[r19]|0)){r13=0;return r13}r20=(r15<<2)+65864|0;r21=(r15<<2)+65832|0;r15=r4;r22=r3;while(1){if(!((r22|0)<(r10|0)&(r15|0)>-1&(r15|0)<(r14|0))){r13=0;r8=725;break}if((r22|0)==(r5|0)&(r15|0)==(r6|0)){r8=665;break}r23=HEAP32[r20>>2]+r22|0;if((r23|0)>-1){r15=HEAP32[r21>>2]+r15|0;r22=r23}else{r13=0;r8=726;break}}if(r8==665){r22=HEAP32[r17+(r12<<2)>>2];do{if((r22|0)==1){if((HEAP32[HEAP32[r7+8]+(r12<<2)>>2]&1|0)==0){break}else{r13=0}return r13}}while(0);r17=(r1+44|0)>>2;r15=HEAP32[r17];if((r11|0)<=-1){___assert_func(67872,110,68712,67848)}r21=(r11<<2)+r15|0;r20=HEAP32[r21>>2];do{if((r20&2|0)==0){r14=0;r10=r20;while(1){r24=r10&1^r14;r25=r10>>2;r23=HEAP32[r15+(r25<<2)>>2];if((r23&2|0)==0){r14=r24;r10=r23}else{break}}L933:do{if((r25|0)==(r11|0)){r26=r24;r27=r11}else{r10=r25<<2;r14=r20>>2;r23=r24^r20&1;HEAP32[r21>>2]=r24|r10;if((r14|0)==(r25|0)){r26=r23;r27=r25;break}else{r28=r14;r29=r23}while(1){r23=(r28<<2)+r15|0;r14=HEAP32[r23>>2];r30=r14>>2;r31=r29^r14&1;HEAP32[r23>>2]=r29|r10;if((r30|0)==(r25|0)){r26=r31;r27=r25;break L933}else{r28=r30;r29=r31}}}}while(0);if((r26|0)==0){r32=r27;break}___assert_func(67872,137,68712,67488);r32=r27}else{r32=r11}}while(0);r11=HEAP32[r17];if((r12|0)<=-1){___assert_func(67872,110,68712,67848)}r27=(r12<<2)+r11|0;r26=HEAP32[r27>>2];do{if((r26&2|0)==0){r29=0;r28=r26;while(1){r33=r28&1^r29;r34=r28>>2;r25=HEAP32[r11+(r34<<2)>>2];if((r25&2|0)==0){r29=r33;r28=r25}else{break}}L947:do{if((r34|0)==(r12|0)){r35=r33;r36=r12}else{r28=r34<<2;r29=r26>>2;r25=r33^r26&1;HEAP32[r27>>2]=r33|r28;if((r29|0)==(r34|0)){r35=r25;r36=r34;break}else{r37=r29;r38=r25}while(1){r25=(r37<<2)+r11|0;r29=HEAP32[r25>>2];r15=r29>>2;r24=r38^r29&1;HEAP32[r25>>2]=r38|r28;if((r15|0)==(r34|0)){r35=r24;r36=r34;break L947}else{r37=r15;r38=r24}}}}while(0);if((r35|0)==0){r39=r36;break}___assert_func(67872,137,68712,67488);r39=r36}else{r39=r12}}while(0);if((r32|0)==(r39|0)){r13=0;return r13}L957:do{if((r18|0)>0){r39=HEAP32[r19];r32=(r18|0)>(r39|0);if(!((r22|0)<1|r32|(r22|0)>(r39|0))){if((r18|0)==(r22-1|0)){break}else{r13=0}return r13}if((r2|0)==0){break}if(r32){r40=1;r8=701;break}r32=Math.imul(HEAP32[r9],r6)+r5|0;r12=r18+1|0;r36=r1+48|0;do{if((r12|0)>0){r35=0;r38=r12;while(1){if((r38|0)>(r39|0)){r41=r35;break}if((HEAP32[HEAP32[r36>>2]+(r38<<2)>>2]|0)!=-1){r41=r35;break}r37=r38+1|0;r34=r35+1|0;if((r37|0)>0){r35=r34;r38=r37}else{r41=r34;break}}if((r41|0)==0){break}if((HEAP32[HEAP32[r7+10]+(r32<<2)>>2]|0)==-1){if((HEAP32[HEAP32[r7+9]+(r32<<2)>>2]|0)==-1){break L957}}if((_dsf_size(HEAP32[r17],r32)|0)>(r41|0)){r13=0}else{break L957}return r13}}while(0);if((HEAP32[HEAP32[r16]+(r32<<2)>>2]|0)==(r12|0)){r13=0}else{break}return r13}else{r40=(r2|0)!=0;r8=701;break}}while(0);L979:do{if(r8==701){if(!(r40&(r22|0)>0)){break}r2=HEAP32[r19];if((r22|0)>(r2|0)){break}r41=Math.imul(HEAP32[r9],r4)+r3|0;r18=r22-1|0;r5=r1+48|0;do{if((r18|0)>0){r6=0;r36=r18;while(1){if((r36|0)>(r2|0)){r42=r6;break}if((HEAP32[HEAP32[r5>>2]+(r36<<2)>>2]|0)!=-1){r42=r6;break}r39=r36-1|0;r38=r6+1|0;if((r39|0)>0){r6=r38;r36=r39}else{r42=r38;break}}if((r42|0)==0){break}if((HEAP32[HEAP32[r7+10]+(r41<<2)>>2]|0)==-1){if((HEAP32[HEAP32[r7+9]+(r41<<2)>>2]|0)==-1){break L979}}if((_dsf_size(HEAP32[r17],r41)|0)>(r42|0)){r13=0}else{break L979}return r13}}while(0);if((HEAP32[HEAP32[r16]+(r41<<2)>>2]|0)==(r18|0)){r13=0}else{break}return r13}}while(0);r13=1;return r13}else if(r8==725){return r13}else if(r8==726){return r13}}function _solve_state(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58;r2=0;r3=STACKTOP;r4=(r1|0)>>2;r5=r1+4|0;r6=_blank_game(HEAP32[r4],HEAP32[r5>>2]);r7=r1+12|0;r8=r6+12|0;HEAP32[r8>>2]=HEAP32[r7>>2];r9=r1+16|0;r10=r6+16|0;HEAP32[r10>>2]=HEAP32[r9>>2];r11=(r1+20|0)>>2;r12=(r6+20|0)>>2;HEAP32[r12]=HEAP32[r11];r13=r6+24|0;r14=(r1+24|0)>>2;r15=(r6+8|0)>>2;_memcpy(HEAP32[r13>>2],HEAP32[r14],HEAP32[r15]<<2);r16=r6+32|0;r17=r1+32|0;_memcpy(HEAP32[r16>>2],HEAP32[r17>>2],HEAP32[r15]<<2);r18=r6+28|0;r19=(r1+28|0)>>2;_memcpy(HEAP32[r18>>2],HEAP32[r19],HEAP32[r15]<<2);r20=(r6+36|0)>>2;r21=(r1+36|0)>>2;_memcpy(HEAP32[r20],HEAP32[r21],HEAP32[r15]<<2);r22=(r6+40|0)>>2;r23=(r1+40|0)>>2;_memcpy(HEAP32[r22],HEAP32[r23],HEAP32[r15]<<2);r24=r6+44|0;r25=r1+44|0;_memcpy(HEAP32[r24>>2],HEAP32[r25>>2],HEAP32[r15]<<2);r26=r6+48|0;r27=r1+48|0;_memcpy(HEAP32[r26>>2],HEAP32[r27>>2],(HEAP32[r15]<<2)+4|0);r15=(r1+8|0)>>2;r28=_malloc(HEAP32[r15]<<2);if((r28|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r29=r28;L1004:while(1){_update_numbers(r1);r30=HEAP32[r4];_memset(r28,-1,HEAP32[r15]<<2);r31=HEAP32[r15];if((r31|0)>0){r32=0;r33=0;r34=r31}else{break}L1006:while(1){do{if((HEAP32[HEAP32[r21]+(r32<<2)>>2]|0)==-1){if((HEAP32[HEAP32[r19]+(r32<<2)>>2]|0)==(r34|0)){r35=r33;break}r31=HEAP32[HEAP32[r14]+(r32<<2)>>2];r36=(r32|0)%(r30|0);r37=(r32|0)/(r30|0)&-1;r38=HEAP32[(r31<<2)+65864>>2];r39=r38+r36|0;if((r39|0)<=-1){r2=749;break L1006}r40=HEAP32[(r31<<2)+65832>>2];r31=-1;r41=r39;r39=r37;L1012:while(1){r42=r41;r43=r39;while(1){r44=r43+r40|0;if(!((r42|0)<(HEAP32[r4]|0)&(r44|0)>-1)){r45=r31;break L1012}if((r44|0)>=(HEAP32[r5>>2]|0)){r45=r31;break L1012}if((_isvalidmove(r1,1,r36,r37,r42,r44)|0)!=0){r46=Math.imul(r44,r30)+r42|0;if((HEAP32[HEAP32[r23]+(r46<<2)>>2]|0)==-1){break}}r47=r42+r38|0;if((r47|0)>-1){r42=r47;r43=r44}else{r45=r31;break L1012}}r43=HEAP32[r19];r47=HEAP32[r43+(r32<<2)>>2];do{if((r47|0)>0){r48=HEAP32[r43+(r46<<2)>>2];if((r48|0)<=0){break}r49=HEAP32[r15];if((r48|0)<=(r49|0)&(r47|0)<=(r49|0)&(r48|0)==(r47+1|0)){r2=746;break L1012}}}while(0);r47=(r31|0)==-1?r46:-2;r43=(r46<<2)+r29|0;HEAP32[r43>>2]=(HEAP32[r43>>2]|0)==-1?r32:-2;r43=r42+r38|0;if((r43|0)>-1){r31=r47;r41=r43;r39=r44}else{r45=r47;break}}if(r2==746){r2=0;HEAP32[r29+(r46<<2)>>2]=r32;r45=r46}if((r45|0)==-1){r2=749;break L1006}else if((r45|0)==-2){r35=r33;break}r39=HEAP32[r20];r41=HEAP32[r39+(r32<<2)>>2];if((r41|0)==-1){r50=r39}else{HEAP32[HEAP32[r22]+(r41<<2)>>2]=-1;r50=HEAP32[r20]}HEAP32[r50+(r32<<2)>>2]=r45;r41=HEAP32[r22];r39=HEAP32[r41+(r45<<2)>>2];if((r39|0)==-1){r51=r41}else{HEAP32[HEAP32[r20]+(r39<<2)>>2]=-1;r51=HEAP32[r22]}HEAP32[r51+(r45<<2)>>2]=r32;r35=r33+1|0}else{r35=r33}}while(0);r39=r32+1|0;r52=HEAP32[r15];if((r39|0)<(r52|0)){r32=r39;r33=r35;r34=r52}else{r2=732;break}}L1037:do{if(r2==732){r2=0;L1039:do{if((r52|0)>0){r30=0;r39=r35;r41=r52;L1040:while(1){do{if((HEAP32[HEAP32[r23]+(r30<<2)>>2]|0)==-1){if((HEAP32[HEAP32[r19]+(r30<<2)>>2]|0)==1){r53=r39;r54=r41;break}r31=HEAP32[r29+(r30<<2)>>2];if((r31|0)==-1){break L1040}else if((r31|0)==-2){r53=r39;r54=r41;break}r38=HEAP32[r20];r37=HEAP32[r38+(r31<<2)>>2];if((r37|0)==-1){r55=r38}else{HEAP32[HEAP32[r22]+(r37<<2)>>2]=-1;r55=HEAP32[r20]}HEAP32[r55+(r31<<2)>>2]=r30;r37=HEAP32[r22];r38=HEAP32[r37+(r30<<2)>>2];if((r38|0)==-1){r56=r37}else{HEAP32[HEAP32[r20]+(r38<<2)>>2]=-1;r56=HEAP32[r22]}HEAP32[r56+(r30<<2)>>2]=r31;r53=r39+1|0;r54=HEAP32[r15]}else{r53=r39;r54=r41}}while(0);r42=r30+1|0;if((r42|0)<(r54|0)){r30=r42;r39=r53;r41=r54}else{r57=r53;break L1039}}HEAP32[r12]=1;break L1037}else{r57=r35}}while(0);if((r57|0)==0){break L1004}}else if(r2==749){r2=0;HEAP32[r12]=1}}while(0);HEAP32[r7>>2]=HEAP32[r8>>2];HEAP32[r9>>2]=HEAP32[r10>>2];HEAP32[r11]=HEAP32[r12];_memcpy(HEAP32[r14],HEAP32[r13>>2],HEAP32[r15]<<2);_memcpy(HEAP32[r17>>2],HEAP32[r16>>2],HEAP32[r15]<<2);_memcpy(HEAP32[r19],HEAP32[r18>>2],HEAP32[r15]<<2);_memcpy(HEAP32[r21],HEAP32[r20],HEAP32[r15]<<2);_memcpy(HEAP32[r23],HEAP32[r22],HEAP32[r15]<<2);_memcpy(HEAP32[r25>>2],HEAP32[r24>>2],HEAP32[r15]<<2);_memcpy(HEAP32[r27>>2],HEAP32[r26>>2],(HEAP32[r15]<<2)+4|0);if((HEAP32[r11]|0)!=0){break}}_free_game(r6);_free(r28);_update_numbers(r1);if((HEAP32[r11]|0)!=0){r58=-1;STACKTOP=r3;return r58}r58=_check_completion(r1,0);STACKTOP=r3;return r58}function _update_numbers(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58;r2=0;r3=STACKTOP;r4=(r1+8|0)>>2;r5=_malloc(HEAP32[r4]*20&-1);if((r5|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r6=r5,r7=r6>>2;r8=HEAP32[r4];L1066:do{if((r8|0)>0){r9=r1+48|0;r10=0;while(1){HEAP32[HEAP32[r9>>2]+(r10<<2)>>2]=-1;r11=r10+1|0;r12=HEAP32[r4];if((r11|0)<(r12|0)){r10=r11}else{break}}if((r12|0)<=0){r13=r12;r2=790;break}r10=r1+32|0;r9=r1+40|0;r11=r1+36|0;r14=(r1+28|0)>>2;r15=r1+48|0;r16=0;r17=r12;while(1){do{if((HEAP32[HEAP32[r10>>2]+(r16<<2)>>2]&1|0)==0){if((HEAP32[HEAP32[r9>>2]+(r16<<2)>>2]|0)!=-1){break}if((HEAP32[HEAP32[r11>>2]+(r16<<2)>>2]|0)!=-1){break}HEAP32[HEAP32[r14]+(r16<<2)>>2]=0}else{r18=HEAP32[HEAP32[r14]+(r16<<2)>>2];if((r18|0)>0){r19=r18;r20=r17}else{___assert_func(66776,1073,68408,67688);r19=HEAP32[HEAP32[r14]+(r16<<2)>>2];r20=HEAP32[r4]}if((r19|0)>(r20|0)){___assert_func(66776,1074,68408,67648);r21=HEAP32[HEAP32[r14]+(r16<<2)>>2]}else{r21=r19}HEAP32[HEAP32[r15>>2]+(r21<<2)>>2]=r16}}while(0);r18=r16+1|0;r22=HEAP32[r4];if((r18|0)<(r22|0)){r16=r18;r17=r22}else{break}}r17=r1+44|0,r16=r17>>2;r15=HEAP32[r16];if((r22|0)>0){r23=0}else{r24=r22;r25=r17;r2=818;break}while(1){HEAP32[r15+(r23<<2)>>2]=6;r14=r23+1|0;if((r14|0)==(r22|0)){break}else{r23=r14}}r15=HEAP32[r4];if((r15|0)<=0){break}r14=r1+36|0;r11=r1+40|0;r9=r1+20|0;r10=0;r18=r15;while(1){r15=HEAP32[HEAP32[r14>>2]+(r10<<2)>>2];if((r15|0)==-1){r26=r18}else{if((HEAP32[HEAP32[r11>>2]+(r15<<2)>>2]|0)!=(r10|0)){___assert_func(66776,1009,68728,67104)}r15=HEAP32[r16];r27=(r10<<2)+r15|0;r28=HEAP32[r27>>2];do{if((r28&2|0)==0){r29=0;r30=r28;while(1){r31=r30&1^r29;r32=r30>>2;r33=HEAP32[r15+(r32<<2)>>2];if((r33&2|0)==0){r29=r31;r30=r33}else{break}}L1102:do{if((r32|0)==(r10|0)){r34=r31;r35=r10}else{r30=r32<<2;r29=r28>>2;r33=r31^r28&1;HEAP32[r27>>2]=r31|r30;if((r29|0)==(r32|0)){r34=r33;r35=r32;break}else{r36=r29;r37=r33}while(1){r33=(r36<<2)+r15|0;r29=HEAP32[r33>>2];r38=r29>>2;r39=r29&1^r37;HEAP32[r33>>2]=r37|r30;if((r38|0)==(r32|0)){r34=r39;r35=r32;break L1102}else{r36=r38;r37=r39}}}}while(0);if((r34|0)==0){r40=r35;break}___assert_func(67872,137,68712,67488);r40=r35}else{r40=r10}}while(0);r15=HEAP32[r16];r27=HEAP32[HEAP32[r14>>2]+(r10<<2)>>2];if((r27|0)<=-1){___assert_func(67872,110,68712,67848)}r28=(r27<<2)+r15|0;r30=HEAP32[r28>>2];do{if((r30&2|0)==0){r39=0;r38=r30;while(1){r41=r38&1^r39;r42=r38>>2;r33=HEAP32[r15+(r42<<2)>>2];if((r33&2|0)==0){r39=r41;r38=r33}else{break}}L1116:do{if((r42|0)==(r27|0)){r43=r41;r44=r27}else{r38=r42<<2;r39=r30>>2;r33=r41^r30&1;HEAP32[r28>>2]=r41|r38;if((r39|0)==(r42|0)){r43=r33;r44=r42;break}else{r45=r39;r46=r33}while(1){r33=(r45<<2)+r15|0;r39=HEAP32[r33>>2];r29=r39>>2;r47=r39&1^r46;HEAP32[r33>>2]=r46|r38;if((r29|0)==(r42|0)){r43=r47;r44=r42;break L1116}else{r45=r29;r46=r47}}}}while(0);if((r43|0)==0){r48=r44;break}___assert_func(67872,137,68712,67488);r48=r44}else{r48=r27}}while(0);if((r40|0)==(r48|0)){HEAP32[r9>>2]=1}_edsf_merge(HEAP32[r16],r40,r48,0);r26=HEAP32[r4]}r27=r10+1|0;if((r27|0)<(r26|0)){r10=r27;r18=r26}else{r24=r26;r25=r17;r2=818;break L1066}}}else{r13=r8;r2=790}}while(0);do{if(r2==790){r24=r13;r25=r1+44|0;r2=818;break}}while(0);do{if(r2==818){if((r24|0)<=0){break}r13=r1+40|0;r8=(r1+36|0)>>2;r26=(r1+28|0)>>2;r48=r1+32|0;r40=r1+20|0;r44=0;r43=0;while(1){L1134:do{if((HEAP32[HEAP32[r13>>2]+(r43<<2)>>2]|0)==-1){if((HEAP32[HEAP32[r8]+(r43<<2)>>2]|0)==-1){r49=r44;break}r46=r44+1|0;HEAP32[((r44*20&-1)>>2)+r7]=r43;r45=_dsf_size(HEAP32[r25>>2],r43);HEAP32[((r44*20&-1)+4>>2)+r7]=r45;r45=(r6+(r44*20&-1)+16|0)>>2;HEAP32[r45]=0;r42=(r6+(r44*20&-1)+12|0)>>2;HEAP32[r42]=0;r41=r6+(r44*20&-1)+8|0;r35=r43;r34=0;while(1){do{if((HEAP32[HEAP32[r48>>2]+(r35<<2)>>2]&1|0)!=0){r37=HEAP32[HEAP32[r26]+(r35<<2)>>2]-r34|0;if((HEAP32[r42]|0)==0){HEAP32[r41>>2]=r37;HEAP32[r42]=1;HEAP32[r45]=67504;break}if((HEAP32[r41>>2]|0)==(r37|0)){break}HEAP32[r40>>2]=1}}while(0);r37=HEAP32[HEAP32[r8]+(r35<<2)>>2];if((r37|0)==(r43|0)){___assert_func(66776,913,68640,67476)}if((r37|0)==-1){break}else{r35=r37;r34=r34+1|0}}if((HEAP32[r42]|0)!=0){if((HEAP32[r45]|0)!=0){r49=r46;break}___assert_func(66776,974,68640,67188);r49=r46;break}r34=HEAP32[r26];r35=HEAP32[r34+(r43<<2)>>2];do{if((r35|0)==0){r41=HEAP32[r34+(HEAP32[HEAP32[r8]+(r43<<2)>>2]<<2)>>2];r37=HEAP32[r4];if((r41|0)<=(r37|0)){r50=r37;break}HEAP32[((r44*20&-1)+8>>2)+r7]=r41-(r41|0)%(r37+1|0)|0;HEAP32[r42]=1;HEAP32[r45]=67428;r49=r46;break L1134}else{r50=HEAP32[r4]}}while(0);if((r35|0)<=(r50|0)){HEAP32[((r44*20&-1)+8>>2)+r7]=0;HEAP32[r42]=0;HEAP32[r45]=67396;r49=r46;break}r34=(r35|0)/(r50+1|0)&-1;r37=_dsf_size(HEAP32[r25>>2],r43);r41=HEAP32[r8];r36=r43;r32=1;while(1){r31=HEAP32[r41+(r36<<2)>>2];if((r31|0)==-1){r2=848;break}r23=HEAP32[HEAP32[r26]+(r31<<2)>>2];if((r23|0)==0){if((HEAP32[r41+(r31<<2)>>2]|0)==-1){r2=842;break}}r51=HEAP32[r4]+1|0;r52=(r23|0)/(r51|0)&-1;if((r52|0)!=(r34|0)){r2=845;break}r36=r31;r32=r32+1|0}if(r2==842){r2=0;r36=Math.imul(HEAP32[r4]+1|0,r34);HEAP32[((r44*20&-1)+8>>2)+r7]=r36;HEAP32[r42]=1;HEAP32[r45]=67352;r49=r46;break}else if(r2==845){r2=0;if((r32|0)<(r37-r32|0)){r36=Math.imul(r52,r51);HEAP32[((r44*20&-1)+8>>2)+r7]=r36;HEAP32[r42]=1;HEAP32[r45]=67296;r49=r46;break}else{r36=Math.imul(r51,r34);HEAP32[((r44*20&-1)+8>>2)+r7]=r36;HEAP32[r42]=1;HEAP32[r45]=67248;r49=r46;break}}else if(r2==848){r2=0;if((r34|0)==0){HEAP32[((r44*20&-1)+8>>2)+r7]=0;r53=0}else{r36=Math.imul(HEAP32[r4]+1|0,r34);HEAP32[((r44*20&-1)+8>>2)+r7]=r36;r53=1}HEAP32[r42]=r53;HEAP32[r45]=67208;r49=r46;break}}else{r49=r44}}while(0);r36=r43+1|0;if((r36|0)<(HEAP32[r4]|0)){r44=r49;r43=r36}else{break}}_qsort(r5,r49,20,74);r43=(r49|0)>0;if(r43){r54=r49}else{_free(r5);STACKTOP=r3;return}while(1){r44=r54-1|0;do{if((r44|0)==0){r2=869}else{r26=r6+(r44*20&-1)+8|0;if((HEAP32[r26>>2]|0)!=(HEAP32[(((r54-2)*20&-1)+8>>2)+r7]|0)){r2=869;break}r8=HEAP32[r4];L1189:do{if((r8|0)>1){r40=r8+1|0;r48=1;while(1){r13=0;while(1){if((r13|0)>=(r49|0)){r55=r48;r56=r8;break L1189}if(((HEAP32[((r13*20&-1)+8>>2)+r7]|0)/(r40|0)&-1|0)==(r48|0)){break}else{r13=r13+1|0}}r13=r48+1|0;if((r13|0)<(r8|0)){r48=r13}else{r2=867;break L1189}}}else{r2=867}}while(0);if(r2==867){r2=0;___assert_func(66776,1059,68608,67552);r55=0;r56=HEAP32[r4]}r8=Math.imul(r56+1|0,r55);HEAP32[r26>>2]=r8;HEAP32[((r44*20&-1)+12>>2)+r7]=-1;break}}while(0);do{if(r2==869){r2=0;if((HEAP32[((r44*20&-1)+12>>2)+r7]|0)!=0){break}r8=r6+(r44*20&-1)+8|0;if((HEAP32[r8>>2]|0)!=0){___assert_func(66776,1110,68408,67596)}r46=HEAP32[r4];L1206:do{if((r46|0)>1){r45=r46+1|0;r42=1;while(1){r34=0;while(1){if((r34|0)>=(r49|0)){r57=r42;r58=r46;break L1206}if(((HEAP32[((r34*20&-1)+8>>2)+r7]|0)/(r45|0)&-1|0)==(r42|0)){break}else{r34=r34+1|0}}r34=r42+1|0;if((r34|0)<(r46|0)){r42=r34}else{r2=879;break L1206}}}else{r2=879}}while(0);if(r2==879){r2=0;___assert_func(66776,1059,68608,67552);r57=0;r58=HEAP32[r4]}r46=Math.imul(r58+1|0,r57);HEAP32[r8>>2]=r46}}while(0);if((r44|0)>0){r54=r44}else{break}}if(!r43){_free(r5);STACKTOP=r3;return}r46=r1+32|0;r26=r1+48|0;r42=r1+28|0;r45=r1+36|0;r34=0;while(1){r32=r6+(r34*20&-1)|0;r37=HEAP32[r32>>2];L1224:do{if((r37|0)!=-1){r48=r37;r40=HEAP32[((r34*20&-1)+8>>2)+r7];while(1){if((HEAP32[HEAP32[r46>>2]+(r48<<2)>>2]&1|0)==0){do{if((r40|0)>0){if((r40|0)>(HEAP32[r4]|0)){break}HEAP32[HEAP32[r26>>2]+(r40<<2)>>2]=r48}}while(0);HEAP32[HEAP32[r42>>2]+(r48<<2)>>2]=r40}r13=HEAP32[HEAP32[r45>>2]+(r48<<2)>>2];if((r13|0)==(HEAP32[r32>>2]|0)){___assert_func(66776,1134,68408,67580)}if((r13|0)==-1){break L1224}else{r48=r13;r40=r40+1|0}}}}while(0);r32=r34+1|0;if((r32|0)==(r49|0)){break}else{r34=r32}}_free(r5);STACKTOP=r3;return}}while(0);_qsort(r5,0,20,74);_free(r5);STACKTOP=r3;return}function _check_completion(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45;r3=0;r4=(r2|0)!=0;r2=r1+8|0;r5=HEAP32[r2>>2];L1243:do{if(r4){if((r5|0)<=0){r6=0;r7=1;r8=(r6|0)==0;r9=r8?r7:0;return r9}r10=r1+32|0;r11=0;while(1){r12=(r11<<2)+HEAP32[r10>>2]|0;HEAP32[r12>>2]=HEAP32[r12>>2]&-3;r12=r11+1|0;r13=HEAP32[r2>>2];if((r12|0)<(r13|0)){r11=r12}else{r14=r13;break L1243}}}else{r14=r5}}while(0);r5=(r1+8|0)>>2;if((r14|0)<=0){r6=0;r7=1;r8=(r6|0)==0;r9=r8?r7:0;return r9}r2=r1+28|0;r11=r4^1;r10=r1+32|0;r13=0;r12=0;r15=r14;while(1){r14=HEAP32[r2>>2];r16=HEAP32[r14+(r13<<2)>>2];r17=r13+1|0;L1256:do{if((r16|0)<=(r15|0)&(r16|0)>0&(r17|0)<(r15|0)){r18=r12;r19=r17;r20=r15;r21=r14;r22=r16;while(1){r23=(HEAP32[r21+(r19<<2)>>2]|0)!=(r22|0);if(r23|r11){r24=r23?r18:1;r25=r20}else{r23=(r13<<2)+HEAP32[r10>>2]|0;HEAP32[r23>>2]=HEAP32[r23>>2]|2;r23=(r19<<2)+HEAP32[r10>>2]|0;HEAP32[r23>>2]=HEAP32[r23>>2]|2;r24=1;r25=HEAP32[r5]}r23=r19+1|0;if((r23|0)>=(r25|0)){r26=r24;r27=r25;break L1256}r28=HEAP32[r2>>2];r18=r24;r19=r23;r20=r25;r21=r28;r22=HEAP32[r28+(r13<<2)>>2]}}else{r26=r12;r27=r15}}while(0);if((r17|0)<(r27|0)){r13=r17;r12=r26;r15=r27}else{break}}if((r27|0)<=1){r6=r26;r7=1;r8=(r6|0)==0;r9=r8?r7:0;return r9}r15=r1+48|0;r12=r1|0;r13=r1+24|0;r25=r1+32|0;r24=r1+28|0;r2=r1+4|0;r10=(r1+36|0)>>2;r11=(r1+40|0)>>2;r16=1;r14=r26;r26=1;r22=r27;while(1){r27=HEAP32[r15>>2];r21=HEAP32[r27+(r16<<2)>>2];r20=r16+1|0;L1270:do{if((r21|0)==-1){r29=0;r30=r14}else{r19=HEAP32[r27+(r20<<2)>>2];if((r19|0)==-1){r29=0;r30=r14;break}r18=HEAP32[r12>>2];r28=(r21|0)%(r18|0);r23=(r21|0)/(r18|0)&-1;r31=(r19|0)%(r18|0);r32=(r19|0)/(r18|0)&-1;r33=Math.imul(r23,r18)+r28|0;r34=HEAP32[HEAP32[r13>>2]+(r33<<2)>>2];L1273:do{if(!((r28|0)==(r31|0)&(r23|0)==(r32|0))){if(!((HEAP32[HEAP32[r24>>2]+(r33<<2)>>2]|0)!=(r22|0)&(r28|0)>-1)){break}r35=(r34<<2)+65864|0;r36=(r34<<2)+65832|0;r37=r23;r38=r28;while(1){if(!((r38|0)<(r18|0)&(r37|0)>-1)){break L1273}if((r37|0)>=(HEAP32[r2>>2]|0)){break L1273}if((r38|0)==(r31|0)&(r37|0)==(r32|0)){break}r39=HEAP32[r35>>2]+r38|0;if((r39|0)>-1){r37=HEAP32[r36>>2]+r37|0;r38=r39}else{break L1273}}if(!r4){r29=r26;r30=r14;break L1270}r38=HEAP32[r10];r37=HEAP32[r38+(r21<<2)>>2];if((r37|0)==-1){r40=r38}else{HEAP32[HEAP32[r11]+(r37<<2)>>2]=-1;r40=HEAP32[r10]}HEAP32[r40+(r21<<2)>>2]=r19;r37=HEAP32[r11];r38=HEAP32[r37+(r19<<2)>>2];if((r38|0)==-1){r41=r37}else{HEAP32[HEAP32[r10]+(r38<<2)>>2]=-1;r41=HEAP32[r11]}HEAP32[r41+(r19<<2)>>2]=r21;r29=r26;r30=r14;break L1270}}while(0);if(!r4){r29=r26;r30=1;break}r19=(r21<<2)+HEAP32[r25>>2]|0;HEAP32[r19>>2]=HEAP32[r19>>2]|2;r19=(HEAP32[HEAP32[r15>>2]+(r20<<2)>>2]<<2)+HEAP32[r25>>2]|0;HEAP32[r19>>2]=HEAP32[r19>>2]|2;r29=r26;r30=1}}while(0);r42=HEAP32[r5];if((r20|0)<(r42|0)){r16=r20;r14=r30;r26=r29;r22=r42}else{break}}if((r42|0)<=1){r6=r30;r7=r29;r8=(r6|0)==0;r9=r8?r7:0;return r9}r22=r1+28|0;r26=r1+32|0;r14=r1+36|0;r16=r1+40|0;if(r4){r4=1;r1=r30;r25=r42;while(1){r15=HEAP32[HEAP32[r22>>2]+(r4<<2)>>2];do{if((r15|0)<0){r3=923}else{if((r15|0)!=0){r43=r1;r44=r25;break}if((HEAP32[HEAP32[r14>>2]+(r4<<2)>>2]|0)!=-1){r3=923;break}r41=(HEAP32[HEAP32[r16>>2]+(r4<<2)>>2]|0)==-1;if(r41){r43=r41?r1:1;r44=r25;break}else{r3=923;break}}}while(0);if(r3==923){r3=0;r15=(r4<<2)+HEAP32[r26>>2]|0;HEAP32[r15>>2]=HEAP32[r15>>2]|2;r43=1;r44=HEAP32[r5]}r15=r4+1|0;if((r15|0)<(r44|0)){r4=r15;r1=r43;r25=r44}else{r6=r43;r7=r29;break}}r8=(r6|0)==0;r9=r8?r7:0;return r9}else{r43=HEAP32[r22>>2];r22=1;r44=r30;while(1){r30=HEAP32[r43+(r22<<2)>>2];do{if((r30|0)<0){r45=1}else{if((r30|0)!=0){r45=r44;break}if((HEAP32[HEAP32[r14>>2]+(r22<<2)>>2]|0)!=-1){r45=1;break}r45=(HEAP32[HEAP32[r16>>2]+(r22<<2)>>2]|0)==-1?r44:1}}while(0);r30=r22+1|0;if((r30|0)<(r42|0)){r22=r30;r44=r45}else{r6=r45;r7=r29;break}}r8=(r6|0)==0;r9=r8?r7:0;return r9}}function _compare_heads(r1,r2){var r3,r4,r5;r3=(HEAP32[r2+12>>2]|0)==0;do{if((HEAP32[r1+12>>2]|0)==0){if(r3){break}else{r4=1}return r4}else{if(r3){r4=-1}else{break}return r4}}while(0);r3=HEAP32[r1+8>>2];r5=HEAP32[r2+8>>2];if((r3|0)<(r5|0)){r4=-1;return r4}if((r3|0)>(r5|0)){r4=1;return r4}r5=HEAP32[r1+4>>2];r3=HEAP32[r2+4>>2];if((r5|0)>(r3|0)){r4=-1;return r4}if((r5|0)<(r3|0)){r4=1;return r4}r3=HEAP32[r1>>2];r1=HEAP32[r2>>2];if((r3|0)>(r1|0)){r4=-1;return r4}r4=(r3|0)<(r1|0)&1;return r4}function _unpick_desc(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27;r6=0;r7=_blank_game(r1,r2);r2=HEAP8[r3];r1=r7+8|0;r8=HEAP32[r1>>2];r9=(r8|0)>0;L1340:do{if(r2<<24>>24==0){r10=r9;r6=978}else{r11=r7+28|0;r12=r7+32|0;r13=r7+24|0;r14=r3;r15=0;r16=0;r17=r2;r18=r9;r19=r8;while(1){if(!r18){r20=66788;break}if(((r17&255)-48|0)>>>0<10){r21=(r17<<24>>24)+((r15*10&-1)-48)|0;if((r21|0)>(r19|0)){r20=66756;break}else{r22=r16;r23=r21;r24=r19}}else{r21=(r17<<24>>24)-97|0;if(r21>>>0>=8){r6=975;break}HEAP32[HEAP32[r11>>2]+(r16<<2)>>2]=r15;HEAP32[HEAP32[r12>>2]+(r16<<2)>>2]=(r15|0)!=0&1;HEAP32[HEAP32[r13>>2]+(r16<<2)>>2]=r21;r22=r16+1|0;r23=0;r24=HEAP32[r1>>2]}r21=r14+1|0;r25=HEAP8[r21];r26=(r22|0)<(r24|0);if(r25<<24>>24==0){r10=r26;r6=978;break L1340}else{r14=r21;r15=r23;r16=r22;r17=r25;r18=r26;r19=r24}}if(r6==975){r20=r17<<24>>24==0?66716:66640}if((r5|0)==0){break}else{r27=r20;r6=980;break}}}while(0);do{if(r6==978){r20=(r5|0)!=0;if(r10){if(r20){r27=66716;r6=980;break}else{break}}if(r20){HEAP32[r5>>2]=0}if((r4|0)==0){_free_game(r7);return}else{HEAP32[r4>>2]=r7;return}}}while(0);if(r6==980){HEAP32[r5>>2]=r27}_free_game(r7);return}function _check_nums(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r4=0;r5=(r2+8|0)>>2;r6=HEAP32[r5];if((r6|0)==(HEAP32[r1+8>>2]|0)){r7=r6}else{___assert_func(66776,284,68744,66408);r7=HEAP32[r5]}if((r7|0)<=0){r8=1;return r8}r6=(r3|0)==0;r3=(r2+28|0)>>2;r9=r1+28|0;r1=r2+32|0;r2=0;r10=1;r11=r7;while(1){do{if(r6){r4=997}else{if((HEAP32[HEAP32[r1>>2]+(r2<<2)>>2]|0)==0){r12=r10;r13=r11;break}else{r4=997;break}}}while(0);if(r4==997){r4=0;r7=HEAP32[HEAP32[r3]+(r2<<2)>>2];if((r7|0)>-1){r14=r7;r15=r11}else{___assert_func(66776,287,68744,66388);r14=HEAP32[HEAP32[r3]+(r2<<2)>>2];r15=HEAP32[r5]}if((r14|0)>(r15|0)){___assert_func(66776,288,68744,66360);r16=HEAP32[HEAP32[r3]+(r2<<2)>>2];r17=HEAP32[r5]}else{r16=r14;r17=r15}r12=(r16|0)==(HEAP32[HEAP32[r9>>2]+(r2<<2)>>2]|0)?r10:0;r13=r17}r7=r2+1|0;if((r7|0)<(r13|0)){r2=r7;r10=r12;r11=r13}else{r8=r12;break}}return r8}function _status_bar(r1,r2){var r3,r4,r5,r6;r3=r1|0;if((HEAP32[HEAP32[r3>>2]+40>>2]|0)==0){return}r4=r1+24|0;r5=HEAP32[r4>>2];if((r5|0)==0){___assert_func(66152,198,68424,67240);r6=HEAP32[r4>>2]}else{r6=r5}r5=_midend_rewrite_statusbar(r6,r2);r2=(r1+28|0)>>2;r6=HEAP32[r2];do{if((r6|0)!=0){if((_strcmp(r5,r6)|0)!=0){break}if((r5|0)==0){return}_free(r5);return}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+40>>2]](HEAP32[r1+4>>2],r5);r1=HEAP32[r2];if((r1|0)!=0){_free(r1)}HEAP32[r2]=r5;return}function _generate_desc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+80|0;r5=r4;do{if((r2|0)==0){r6=0;r7=0}else{r8=_malloc(2);if((r8|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP8[r8]=83;HEAP8[r8+1|0]=0;r6=1;r7=r8;break}}}while(0);r2=r1+8|0;if((HEAP32[r2>>2]|0)<=0){r9=r7;STACKTOP=r4;return r9}r8=r1+28|0;r10=r5|0;r11=r1+24|0;r1=r5+1|0;r5=r7;r7=r6;r6=0;while(1){r12=HEAP32[HEAP32[r8>>2]+(r6<<2)>>2];r13=HEAP32[HEAP32[r11>>2]+(r6<<2)>>2]+97|0;if((r12|0)==0){HEAP8[r10]=r13&255;HEAP8[r1]=0;r14=1}else{r14=_sprintf(r10,66860,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r12,HEAP32[tempInt+4>>2]=r13,tempInt))}r13=r14+r7|0;r12=r13+1|0;if((r5|0)==0){r15=_malloc(r12)}else{r15=_realloc(r5,r12)}if((r15|0)==0){r3=1034;break}_strcpy(r15+r7|0,r10);r12=r6+1|0;if((r12|0)<(HEAP32[r2>>2]|0)){r5=r15;r7=r13;r6=r12}else{r9=r15;r3=1037;break}}if(r3==1034){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r3==1037){STACKTOP=r4;return r9}}function _blank_game(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r3=STACKTOP;r4=_malloc(52),r5=r4>>2;if((r4|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r6=r4;_memset(r4,0,52);HEAP32[r5]=r1;HEAP32[r5+1]=r2;r7=Math.imul(r2,r1);r1=(r4+8|0)>>2;HEAP32[r1]=r7;r2=_malloc(r7<<2);if((r2|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r7=r4+24|0;HEAP32[r7>>2]=r2;r2=_malloc(HEAP32[r1]<<2);if((r2|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r8=r4+28|0;HEAP32[r8>>2]=r2;r2=_malloc(HEAP32[r1]<<2);if((r2|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r9=r4+32|0;HEAP32[r9>>2]=r2;r2=_malloc(HEAP32[r1]<<2);if((r2|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=r4+36|0;HEAP32[r10>>2]=r2;r2=_malloc(HEAP32[r1]<<2);if((r2|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r11=r4+40|0;HEAP32[r11>>2]=r2;r2=HEAP32[r1];r12=_malloc(r2<<2);if((r12|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r13=r12;L1456:do{if((r2|0)>0){r12=0;while(1){HEAP32[r13+(r12<<2)>>2]=6;r14=r12+1|0;if((r14|0)==(r2|0)){break L1456}else{r12=r14}}}}while(0);HEAP32[r5+11]=r13;r13=_malloc((HEAP32[r1]<<2)+4|0);if((r13|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r5=r4+48|0;HEAP32[r5>>2]=r13;_memset(HEAP32[r7>>2],0,HEAP32[r1]<<2);_memset(HEAP32[r8>>2],0,HEAP32[r1]<<2);_memset(HEAP32[r9>>2],0,HEAP32[r1]<<2);_memset(HEAP32[r10>>2],-1,HEAP32[r1]<<2);_memset(HEAP32[r11>>2],-1,HEAP32[r1]<<2);_memset(HEAP32[r5>>2],-1,(HEAP32[r1]<<2)+4|0);STACKTOP=r3;return r6}}function _edsf_merge(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r5=r1>>2;if((r2|0)<=-1){___assert_func(67872,110,68712,67848)}r6=HEAP32[(r2<<2>>2)+r5];do{if((r6&2|0)==0){r7=0;r8=r6;while(1){r9=r8&1^r7;r10=r8>>2;r11=HEAP32[(r10<<2>>2)+r5];if((r11&2|0)==0){r7=r9;r8=r11}else{break}}L1471:do{if((r10|0)==(r2|0)){r12=r9;r13=r2}else{r8=r10<<2;r7=r9;r11=r2;r14=r6;while(1){r15=r14>>2;r16=r14&1^r7;HEAP32[(r11<<2>>2)+r5]=r7|r8;if((r15|0)==(r10|0)){r12=r16;r13=r10;break L1471}r7=r16;r11=r15;r14=HEAP32[(r15<<2>>2)+r5]}}}while(0);if((r12|0)==0){r17=r9;r18=r13;break}___assert_func(67872,137,68712,67488);r17=r9;r18=r13}else{r17=0;r18=r2}}while(0);if((HEAP32[(r18<<2>>2)+r5]&2|0)==0){___assert_func(67872,152,68700,67056)}r2=r17^r4;if((r3|0)<=-1){___assert_func(67872,110,68712,67848)}r4=HEAP32[(r3<<2>>2)+r5];do{if((r4&2|0)==0){r17=0;r13=r4;while(1){r19=r13&1^r17;r20=r13>>2;r9=HEAP32[(r20<<2>>2)+r5];if((r9&2|0)==0){r17=r19;r13=r9}else{break}}L1489:do{if((r20|0)==(r3|0)){r21=r19;r22=r3}else{r13=r20<<2;r17=r19;r9=r3;r12=r4;while(1){r10=r12>>2;r6=r12&1^r17;HEAP32[(r9<<2>>2)+r5]=r17|r13;if((r10|0)==(r20|0)){r21=r6;r22=r20;break L1489}r17=r6;r9=r10;r12=HEAP32[(r10<<2>>2)+r5]}}}while(0);if((r21|0)==0){r23=r19;r24=r22;break}___assert_func(67872,137,68712,67488);r23=r19;r24=r22}else{r23=0;r24=r3}}while(0);if((HEAP32[(r24<<2>>2)+r5]&2|0)==0){___assert_func(67872,155,68700,66944)}r3=r23^r2;r22=(r2|0)==(r23|0);do{if((r18|0)==(r24|0)){if(r22){r25=r18;r26=r18;break}___assert_func(67872,161,68700,66704);r25=r18;r26=r18}else{if(!(r22|(r3|0)==1)){___assert_func(67872,163,68700,66432)}r19=(r18|0)>(r24|0);r21=r19?r18:r24;r20=r19?r24:r18;r19=(r21<<2)+r1|0;r4=(r20<<2)+r1|0;HEAP32[r4>>2]=HEAP32[r4>>2]+(HEAP32[r19>>2]&-4)|0;HEAP32[r19>>2]=r20<<2|(r2|0)!=(r23|0)&1;r25=r20;r26=r21}}while(0);if((r26|0)<=-1){___assert_func(67872,110,68712,67848)}r23=HEAP32[(r26<<2>>2)+r5];do{if((r23&2|0)==0){r2=0;r1=r23;while(1){r27=r1&1^r2;r28=r1>>2;r18=HEAP32[(r28<<2>>2)+r5];if((r18&2|0)==0){r2=r27;r1=r18}else{break}}L1515:do{if((r28|0)==(r26|0)){r29=r27;r30=r26}else{r1=r28<<2;r2=r27;r18=r26;r24=r23;while(1){r22=r24>>2;r21=r24&1^r2;HEAP32[(r18<<2>>2)+r5]=r2|r1;if((r22|0)==(r28|0)){r29=r21;r30=r28;break L1515}r2=r21;r18=r22;r24=HEAP32[(r22<<2>>2)+r5]}}}while(0);if((r29|0)==0){r31=r27;r32=r30;break}___assert_func(67872,137,68712,67488);r31=r27;r32=r30}else{r31=0;r32=r26}}while(0);if((r32|0)!=(r25|0)){___assert_func(67872,188,68700,66200)}if((r31|0)==(r3|0)){return}___assert_func(67872,189,68700,66124);return}function _dsf_size(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;if((r2|0)<=-1){___assert_func(67872,110,68712,67848)}r3=(r2<<2)+r1|0;r4=HEAP32[r3>>2];do{if((r4&2|0)==0){r5=0;r6=r4;while(1){r7=r6&1^r5;r8=r6>>2;r9=HEAP32[r1+(r8<<2)>>2];if((r9&2|0)==0){r5=r7;r6=r9}else{break}}L1538:do{if((r8|0)==(r2|0)){r10=r7;r11=r2}else{r6=r8<<2;r5=r4>>2;r9=r7^r4&1;HEAP32[r3>>2]=r7|r6;if((r5|0)==(r8|0)){r10=r9;r11=r8;break}else{r12=r5;r13=r9}while(1){r9=(r12<<2)+r1|0;r5=HEAP32[r9>>2];r14=r5>>2;r15=r13^r5&1;HEAP32[r9>>2]=r13|r6;if((r14|0)==(r8|0)){r10=r15;r11=r8;break L1538}else{r12=r14;r13=r15}}}}while(0);if((r10|0)==0){r16=r11;break}___assert_func(67872,137,68712,67488);r16=r11}else{r16=r2}}while(0);return HEAP32[r1+(r16<<2)>>2]>>2}function _init_game(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3,r5=r4>>2;r6=_midend_new(r1,65536,65928,r2);_frontend_set_game_info(r1,r6,67924,1,1,1,0,0,1,0);r7=_midend_num_presets(r6);HEAP32[r5]=r7;L1546:do{if((r7|0)>0){r8=r6+24|0;r9=r6+16|0;r10=r6+12|0;r11=0;while(1){if((HEAP32[r8>>2]|0)<=(r11|0)){___assert_func(67020,1056,68588,67620)}_frontend_add_preset(r1,HEAP32[HEAP32[r9>>2]+(r11<<2)>>2],HEAP32[HEAP32[r10>>2]+(r11<<2)>>2]);r12=r11+1|0;if((r12|0)<(HEAP32[r5]|0)){r11=r12}else{break L1546}}}}while(0);r1=_midend_colours(r6,r4)>>2;if((HEAP32[r5]|0)>0){r13=0}else{STACKTOP=r3;return}while(1){r4=r13*3&-1;_canvas_set_palette_entry(r2,r13,HEAPF32[(r4<<2>>2)+r1]*255&-1,HEAPF32[(r4+1<<2>>2)+r1]*255&-1,HEAPF32[(r4+2<<2>>2)+r1]*255&-1);r4=r13+1|0;if((r4|0)<(HEAP32[r5]|0)){r13=r4}else{break}}STACKTOP=r3;return}function _midend_size(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r5=r1>>2;r6=STACKTOP;STACKTOP=STACKTOP+8|0;r7=r6;r8=r6+4;r9=(r1+76|0)>>2;r10=HEAP32[r9];do{if((r10|0)!=0){if((HEAP32[r5+33]|0)<=0){break}r11=r1+8|0;r12=r1+120|0;FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+140>>2]](HEAP32[r12>>2],r10);r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+136>>2]](HEAP32[r12>>2],HEAP32[HEAP32[r5+16]>>2]);HEAP32[r9]=r13}}while(0);r10=(r4|0)!=0;L1564:do{if(r10){r4=r1+8|0;r13=r1+68|0;r12=1;while(1){r11=r12<<1;FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+124>>2]](HEAP32[r13>>2],r11,r7,r8);if((HEAP32[r7>>2]|0)>(HEAP32[r2>>2]|0)){r14=r11;r15=r4,r16=r15>>2;r17=r13,r18=r17>>2;break L1564}if((HEAP32[r8>>2]|0)>(HEAP32[r3>>2]|0)){r14=r11;r15=r4,r16=r15>>2;r17=r13,r18=r17>>2;break L1564}else{r12=r11}}}else{r14=HEAP32[r5+32]+1|0;r15=r1+8|0,r16=r15>>2;r17=r1+68|0,r18=r17>>2}}while(0);r17=1;r15=r14;L1571:while(1){r19=r17;while(1){if((r15-r19|0)<=1){break L1571}r14=(r19+r15|0)/2&-1;FUNCTION_TABLE[HEAP32[HEAP32[r16]+124>>2]](HEAP32[r18],r14,r7,r8);if((HEAP32[r7>>2]|0)>(HEAP32[r2>>2]|0)){r17=r19;r15=r14;continue L1571}if((HEAP32[r8>>2]|0)>(HEAP32[r3>>2]|0)){r17=r19;r15=r14;continue L1571}else{r19=r14}}}r15=r1+132|0;HEAP32[r15>>2]=r19;if(r10){HEAP32[r5+32]=r19}if((r19|0)>0){r10=r1+136|0;r17=r1+140|0;FUNCTION_TABLE[HEAP32[HEAP32[r16]+124>>2]](HEAP32[r18],r19,r10,r17);FUNCTION_TABLE[HEAP32[HEAP32[r16]+128>>2]](HEAP32[r5+30],HEAP32[r9],HEAP32[r18],HEAP32[r15>>2]);r15=r10;r10=r17;r17=HEAP32[r15>>2];HEAP32[r2>>2]=r17;r18=HEAP32[r10>>2];HEAP32[r3>>2]=r18;STACKTOP=r6;return}else{r15=r1+136|0;r10=r1+140|0;r17=HEAP32[r15>>2];HEAP32[r2>>2]=r17;r18=HEAP32[r10>>2];HEAP32[r3>>2]=r18;STACKTOP=r6;return}}function _midend_set_params(r1,r2){var r3,r4;r3=r1+8|0;r4=r1+68|0;FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+28>>2]](HEAP32[r4>>2]);r1=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+32>>2]](r2);HEAP32[r4>>2]=r1;return}function _midend_get_params(r1){return FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+32>>2]](HEAP32[r1+68>>2])}function _print_mono_colour(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=STACKTOP;r4=r2|0;r2=(r1+12|0)>>2;r5=HEAP32[r2];r6=r1+16|0;do{if((r5|0)<(HEAP32[r6>>2]|0)){r7=r5;r8=HEAP32[r1+8>>2]}else{r9=r5+16|0;HEAP32[r6>>2]=r9;r10=r1+8|0;r11=HEAP32[r10>>2];r12=r9*24&-1;if((r11|0)==0){r13=_malloc(r12)}else{r13=_realloc(r11,r12)}if((r13|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r12=r13;HEAP32[r10>>2]=r12;r7=HEAP32[r2];r8=r12;break}}}while(0);r13=(r1+8|0)>>2;HEAP32[r8+(r7*24&-1)>>2]=-1;HEAP32[HEAP32[r13]+(HEAP32[r2]*24&-1)+4>>2]=0;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+8>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+12>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+16>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+20>>2]=r4;r4=HEAP32[r2];HEAP32[r2]=r4+1|0;STACKTOP=r3;return r4}function _fatal(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3;_fwrite(67788,13,1,HEAP32[_stderr>>2]);HEAP32[r4>>2]=r2;_fprintf(HEAP32[_stderr>>2],r1,HEAP32[r4>>2]);_fputc(10,HEAP32[_stderr>>2]);_exit(1)}function _canvas_text_fallback(r1,r2,r3){r3=STACKTOP;r1=HEAP32[r2>>2];r2=_malloc(_strlen(r1)+1|0);if((r2|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r2,r1);STACKTOP=r3;return r2}}function _midend_new(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r5=STACKTOP;STACKTOP=STACKTOP+164|0;r6=r5;r7=r5+80;r8=r5+160;r9=_malloc(144),r10=r9>>2;if((r9|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r11=r9;r12=_malloc(8);if((r12|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_gettimeofday(r12,0);HEAP32[r10]=r1;r1=(r9+8|0)>>2;HEAP32[r1]=r2;r13=_random_new(r12,8);HEAP32[r10+1]=r13;r13=(r9+52|0)>>2;HEAP32[r13]=0;HEAP32[r13+1]=0;HEAP32[r13+2]=0;HEAP32[r13+3]=0;r13=FUNCTION_TABLE[HEAP32[r2+12>>2]]();r14=r9+68|0;HEAP32[r14>>2]=r13;r13=r6|0;_sprintf(r13,67724,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r1]>>2],tempInt));r15=HEAP8[r13];L1612:do{if(r15<<24>>24==0){r16=0}else{r17=0;r18=0;r19=r13;r20=r15;while(1){if((_isspace(r20&255)|0)==0){r21=_toupper(HEAPU8[r19])&255;HEAP8[r6+r17|0]=r21;r22=r17+1|0}else{r22=r17}r21=r18+1|0;r23=r6+r21|0;r24=HEAP8[r23];if(r24<<24>>24==0){r16=r22;break L1612}else{r17=r22;r18=r21;r19=r23;r20=r24}}}}while(0);HEAP8[r6+r16|0]=0;r16=_getenv(r13);if((r16|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r1]+20>>2]](HEAP32[r14>>2],r16)}HEAP32[r10+18]=0;r16=(r9+32|0)>>2;HEAP32[r16]=0;HEAP32[r16+1]=0;HEAP32[r16+2]=0;HEAP32[r16+3]=0;HEAP32[r10+12]=2;r16=(r9+12|0)>>2;HEAP32[r10+31]=0;HEAP32[r10+35]=0;HEAP32[r10+34]=0;HEAP32[r10+33]=0;HEAP32[r16]=0;HEAP32[r16+1]=0;HEAP32[r16+2]=0;HEAP32[r16+3]=0;HEAP32[r16+4]=0;_memset(r9+76|0,0,44);do{if((r3|0)==0){HEAP32[r10+30]=0}else{r16=_malloc(32),r14=r16>>2;if((r16|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r14]=r3;HEAP32[r14+1]=r4;HEAP32[r14+2]=0;HEAP32[r14+4]=0;HEAP32[r14+3]=0;HEAPF32[r14+5]=1;HEAP32[r14+6]=r11;HEAP32[r14+7]=0;HEAP32[r10+30]=r16;break}}}while(0);r10=r9+128|0;HEAP32[r10>>2]=HEAP32[r2+120>>2];r2=r7|0;_sprintf(r2,67820,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r1]>>2],tempInt));r1=HEAP8[r2];L1629:do{if(r1<<24>>24==0){r25=0}else{r9=0;r4=0;r3=r2;r16=r1;while(1){if((_isspace(r16&255)|0)==0){r14=_toupper(HEAPU8[r3])&255;HEAP8[r7+r4|0]=r14;r26=r4+1|0}else{r26=r4}r14=r9+1|0;r13=r7+r14|0;r6=HEAP8[r13];if(r6<<24>>24==0){r25=r26;break L1629}else{r9=r14;r4=r26;r3=r13;r16=r6}}}}while(0);HEAP8[r7+r25|0]=0;r25=_getenv(r2);if((r25|0)==0){_free(r12);STACKTOP=r5;return r11}r2=(_sscanf(r25,67484,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r8,tempInt))|0)==1;r25=HEAP32[r8>>2];if(!(r2&(r25|0)>0)){_free(r12);STACKTOP=r5;return r11}HEAP32[r10>>2]=r25;_free(r12);STACKTOP=r5;return r11}function _midend_can_undo(r1){return(HEAP32[r1+60>>2]|0)>1&1}function _midend_can_redo(r1){return(HEAP32[r1+60>>2]|0)<(HEAP32[r1+52>>2]|0)&1}function _midend_force_redraw(r1){var r2,r3,r4,r5,r6,r7;r2=(r1+76|0)>>2;r3=HEAP32[r2];r4=(r1+8|0)>>2;if((r3|0)==0){r5=r1+120|0}else{r6=r1+120|0;FUNCTION_TABLE[HEAP32[HEAP32[r4]+140>>2]](HEAP32[r6>>2],r3);r5=r6}r6=FUNCTION_TABLE[HEAP32[HEAP32[r4]+136>>2]](HEAP32[r5>>2],HEAP32[HEAP32[r1+64>>2]>>2]);HEAP32[r2]=r6;r6=r1+132|0;r3=HEAP32[r6>>2];if((r3|0)<=0){_midend_redraw(r1);return}r7=r1+68|0;FUNCTION_TABLE[HEAP32[HEAP32[r4]+124>>2]](HEAP32[r7>>2],r3,r1+136|0,r1+140|0);FUNCTION_TABLE[HEAP32[HEAP32[r4]+128>>2]](HEAP32[r5>>2],HEAP32[r2],HEAP32[r7>>2],HEAP32[r6>>2]);_midend_redraw(r1);return}function _midend_redraw(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r2=r1>>2;r3=0;r4=(r1+120|0)>>2;if((HEAP32[r4]|0)==0){___assert_func(67020,869,68528,67880)}r5=(r1+60|0)>>2;if((HEAP32[r5]|0)<=0){return}r6=(r1+76|0)>>2;if((HEAP32[r6]|0)==0){return}r7=HEAP32[r4];FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+32>>2]](HEAP32[r7+4>>2]);r7=r1+84|0;r8=HEAP32[r7>>2];do{if((r8|0)==0){r3=1207}else{r9=HEAPF32[r2+22];if(r9<=0){r3=1207;break}r10=r1+92|0;r11=HEAPF32[r10>>2];if(r11>=r9){r3=1207;break}r9=r1+104|0;r12=HEAP32[r9>>2];if((r12|0)==0){___assert_func(67020,875,68528,67832);r13=HEAP32[r7>>2];r14=HEAP32[r9>>2];r15=HEAPF32[r10>>2]}else{r13=r8;r14=r12;r15=r11}FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+144>>2]](HEAP32[r4],HEAP32[r6],r13,HEAP32[HEAP32[r2+16]+((HEAP32[r5]-1)*12&-1)>>2],r14,HEAP32[r2+20],r15,HEAPF32[r2+25]);break}}while(0);if(r3==1207){FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+144>>2]](HEAP32[r4],HEAP32[r6],0,HEAP32[HEAP32[r2+16]+((HEAP32[r5]-1)*12&-1)>>2],1,HEAP32[r2+20],0,HEAPF32[r2+25])}r2=HEAP32[r4];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+36>>2]](HEAP32[r2+4>>2]);return}function _midend_finish_move(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r2=r1>>2;r3=0;r4=(r1+84|0)>>2;r5=HEAP32[r4];r6=(r5|0)==0;do{if(r6){if((HEAP32[r2+15]|0)>1){r3=1215;break}else{break}}else{r3=1215}}while(0);do{if(r3==1215){r7=HEAP32[r2+26];if((r7|0)>0){r8=HEAP32[r2+15];r9=HEAP32[r2+16];if((HEAP32[r9+((r8-1)*12&-1)+8>>2]|0)==1){r10=r8;r11=r9}else{break}}else{if((r7|0)>=0){break}r9=HEAP32[r2+15];if((r9|0)>=(HEAP32[r2+13]|0)){break}r8=HEAP32[r2+16];if((HEAP32[r8+(r9*12&-1)+8>>2]|0)==1){r10=r9;r11=r8}else{break}}if(r6){r12=1;r13=HEAP32[r11+((r10-2)*12&-1)>>2]}else{r12=r7;r13=r5}r7=FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+152>>2]](r13,HEAP32[r11+((r10-1)*12&-1)>>2],r12,HEAP32[r2+20]);if(r7<=0){break}HEAPF32[r2+25]=0;HEAPF32[r2+24]=r7}}while(0);r12=HEAP32[r4];r10=r1+8|0;if((r12|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+68>>2]](r12)}HEAP32[r4]=0;r4=r1+88|0;HEAPF32[r4>>2]=0;HEAPF32[r2+23]=0;HEAP32[r2+26]=0;r1=HEAP32[r10>>2];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=1230;break}else{r10=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r2+16]+((HEAP32[r2+15]-1)*12&-1)>>2],HEAP32[r2+20])|0)!=0;HEAP32[r2+27]=r10&1;if(r10){break}else{r3=1230;break}}}while(0);do{if(r3==1230){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r4>>2]!=0){break}_deactivate_timer(HEAP32[r2]);return}}while(0);_activate_timer(HEAP32[r2]);return}function _midend_new_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r2=r1>>2;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+104|0;r5=r4;r6=r4+16;r7=r4+20;r8=r4+100;r9=(r1+52|0)>>2;r10=HEAP32[r9];L1706:do{if((r10|0)>0){r11=r1+8|0;r12=r1+64|0;r13=r10;while(1){r14=r13-1|0;HEAP32[r9]=r14;FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+68>>2]](HEAP32[HEAP32[r12>>2]+(r14*12&-1)>>2]);r14=HEAP32[r9];r15=HEAP32[HEAP32[r12>>2]+(r14*12&-1)+4>>2];if((r15|0)==0){r16=r14}else{_free(r15);r16=HEAP32[r9]}if((r16|0)>0){r13=r16}else{r17=r16;break L1706}}}else{r17=r10}}while(0);r10=(r1+76|0)>>2;r16=HEAP32[r10];if((r16|0)==0){r18=r17}else{FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+140>>2]](HEAP32[r2+30],r16);r18=HEAP32[r9]}if((r18|0)!=0){___assert_func(67020,349,68572,66924)}r18=(r1+48|0)>>2;r16=HEAP32[r18];do{if((r16|0)==0){HEAP32[r18]=2;r3=1262;break}else if((r16|0)==1){HEAP32[r18]=2;break}else{HEAP8[r5+15|0]=0;r17=r1+4|0;r13=HEAP32[r17>>2];while(1){r19=_random_bits(r13,7);if(r19>>>0<126){break}}r13=Math.floor((r19>>>0)/14)+49&255;r12=r5|0;HEAP8[r12]=r13;r13=1;while(1){r11=HEAP32[r17>>2];while(1){r20=_random_bits(r11,7);if(r20>>>0<120){break}}r11=Math.floor((r20>>>0)/12)+48&255;HEAP8[r5+r13|0]=r11;r11=r13+1|0;if((r11|0)==15){break}else{r13=r11}}r13=r1+40|0;r17=HEAP32[r13>>2];if((r17|0)!=0){_free(r17)}r17=_malloc(_strlen(r12)+1|0);if((r17|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r17,r12);HEAP32[r13>>2]=r17;r17=r1+72|0;r13=HEAP32[r17>>2];r11=r1+8|0;if((r13|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+28>>2]](r13)}r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+32>>2]](HEAP32[r2+17]);HEAP32[r17>>2]=r13;r3=1262;break}}while(0);do{if(r3==1262){r5=r1+32|0;r20=HEAP32[r5>>2];if((r20|0)!=0){_free(r20)}r20=r1+36|0;r19=HEAP32[r20>>2];if((r19|0)!=0){_free(r19)}r19=r1+44|0;r18=HEAP32[r19>>2];if((r18|0)!=0){_free(r18)}HEAP32[r19>>2]=0;r18=HEAP32[r2+10];r16=_random_new(r18,_strlen(r18));r18=FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+52>>2]](HEAP32[r2+18],r16,r19,(HEAP32[r2+30]|0)!=0&1);HEAP32[r5>>2]=r18;HEAP32[r20>>2]=0;if((r16|0)==0){break}_free(r16|0)}}while(0);r16=HEAP32[r9];r20=r1+56|0;do{if((r16|0)<(HEAP32[r20>>2]|0)){r18=r1+64|0,r21=r18>>2}else{r5=r16+128|0;HEAP32[r20>>2]=r5;r19=r1+64|0;r13=HEAP32[r19>>2];r17=r5*12&-1;if((r13|0)==0){r22=_malloc(r17)}else{r22=_realloc(r13,r17)}if((r22|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r19>>2]=r22;r18=r19,r21=r18>>2;break}}}while(0);r22=(r1+8|0)>>2;r20=(r1+68|0)>>2;r16=FUNCTION_TABLE[HEAP32[HEAP32[r22]+60>>2]](r1,HEAP32[r20],HEAP32[r2+8]);HEAP32[HEAP32[r21]+(HEAP32[r9]*12&-1)>>2]=r16;r16=HEAP32[r22];do{if((HEAP32[r16+72>>2]|0)!=0){r18=HEAP32[r2+11];if((r18|0)==0){break}HEAP32[r6>>2]=0;r19=HEAP32[HEAP32[r21]>>2];r17=FUNCTION_TABLE[HEAP32[r16+76>>2]](r19,r19,r18,r6);if(!((r17|0)!=0&(HEAP32[r6>>2]|0)==0)){___assert_func(67020,430,68572,66688)}r18=FUNCTION_TABLE[HEAP32[HEAP32[r22]+116>>2]](HEAP32[HEAP32[r21]>>2],r17);if((r18|0)==0){___assert_func(67020,432,68572,66428)}FUNCTION_TABLE[HEAP32[HEAP32[r22]+68>>2]](r18);if((r17|0)==0){break}_free(r17)}}while(0);r6=HEAP32[16456];do{if((r6|0)<0){r16=r7|0;_sprintf(r16,66184,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r22]>>2],tempInt));r17=HEAP8[r16];L1779:do{if(r17<<24>>24==0){r23=0}else{r18=0;r19=0;r13=r16;r5=r17;while(1){if((_isspace(r5&255)|0)==0){r11=_toupper(HEAPU8[r13])&255;HEAP8[r7+r18|0]=r11;r24=r18+1|0}else{r24=r18}r11=r19+1|0;r15=r7+r11|0;r14=HEAP8[r15];if(r14<<24>>24==0){r23=r24;break L1779}else{r18=r24;r19=r11;r13=r15;r5=r14}}}}while(0);HEAP8[r7+r23|0]=0;if((_getenv(r16)|0)==0){HEAP32[16456]=0;break}else{_fwrite(66096,26,1,HEAP32[_stderr>>2]);HEAP32[16456]=1;r3=1295;break}}else{if((r6|0)==0){break}else{r3=1295;break}}}while(0);do{if(r3==1295){HEAP32[r8>>2]=0;r6=HEAP32[HEAP32[r21]>>2];r23=FUNCTION_TABLE[HEAP32[HEAP32[r22]+76>>2]](r6,r6,0,r8);if(!((r23|0)!=0&(HEAP32[r8>>2]|0)==0)){___assert_func(67020,478,68572,66688)}r6=FUNCTION_TABLE[HEAP32[HEAP32[r22]+116>>2]](HEAP32[HEAP32[r21]>>2],r23);if((r6|0)==0){___assert_func(67020,480,68572,66428)}FUNCTION_TABLE[HEAP32[HEAP32[r22]+68>>2]](r6);if((r23|0)==0){break}_free(r23)}}while(0);HEAP32[HEAP32[r21]+(HEAP32[r9]*12&-1)+4>>2]=0;HEAP32[HEAP32[r21]+(HEAP32[r9]*12&-1)+8>>2]=0;HEAP32[r9]=HEAP32[r9]+1|0;r9=r1+60|0;HEAP32[r9>>2]=1;r8=r1+120|0;r23=FUNCTION_TABLE[HEAP32[HEAP32[r22]+136>>2]](HEAP32[r8>>2],HEAP32[HEAP32[r21]>>2]);HEAP32[r10]=r23;r23=r1+132|0;r6=HEAP32[r23>>2];if((r6|0)>0){FUNCTION_TABLE[HEAP32[HEAP32[r22]+124>>2]](HEAP32[r20],r6,r1+136|0,r1+140|0);FUNCTION_TABLE[HEAP32[HEAP32[r22]+128>>2]](HEAP32[r8>>2],HEAP32[r10],HEAP32[r20],HEAP32[r23>>2])}HEAPF32[r2+28]=0;r23=r1+80|0;r20=HEAP32[r23>>2];if((r20|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r22]+96>>2]](r20)}r20=FUNCTION_TABLE[HEAP32[HEAP32[r22]+92>>2]](HEAP32[HEAP32[r21]>>2]);HEAP32[r23>>2]=r20;r23=HEAP32[r22];do{if((HEAP32[r23+180>>2]|0)==0){HEAP32[r2+27]=0;r3=1308;break}else{r22=(FUNCTION_TABLE[HEAP32[r23+184>>2]](HEAP32[HEAP32[r21]+((HEAP32[r9>>2]-1)*12&-1)>>2],r20)|0)!=0;HEAP32[r2+27]=r22&1;if(r22){break}else{r3=1308;break}}}while(0);do{if(r3==1308){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r2+22]!=0){break}_deactivate_timer(HEAP32[r2]);r25=r1+124|0;HEAP32[r25>>2]=0;STACKTOP=r4;return}}while(0);_activate_timer(HEAP32[r2]);r25=r1+124|0;HEAP32[r25>>2]=0;STACKTOP=r4;return}function _midend_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12;r5=r1>>2;r6=(r4-515|0)>>>0<3;do{if(r6|(r4-518|0)>>>0<3){r7=HEAP32[r5+31];if((r7|0)==0){r8=1;return r8}if(r6){r9=1;r10=r7+3|0;break}else{r9=1;r10=r7+6|0;break}}else{if((r4-512|0)>>>0>=3){r9=1;r10=r4;break}r7=HEAP32[r5+31];if((r7|0)==0){r9=1;r10=r4;break}if((HEAP32[HEAP32[r5+2]+188>>2]&1<<r4-2048+(r7*3&-1)|0)==0){r9=(_midend_really_process_key(r1,r2,r3,r7+6|0)|0)!=0&1;r10=r4;break}else{r8=1;return r8}}}while(0);if((r10|0)==13|(r10|0)==10){r11=525}else{r11=r10}r10=(r11|0)==32?526:r11;r11=(r10|0)==127?8:r10;if((r9|0)==0){r12=0}else{r12=(_midend_really_process_key(r1,r2,r3,r11)|0)!=0}r3=r12&1;if((r11-518|0)>>>0<3){HEAP32[r5+31]=0;r8=r3;return r8}if((r11-512|0)>>>0>=3){r8=r3;return r8}HEAP32[r5+31]=r11;r8=r3;return r8}function _midend_restart_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r2=r1>>2;r3=0;r4=STACKTOP;r5=r1+84|0;do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=1340;break}else{break}}else{r3=1340}}while(0);if(r3==1340){_midend_finish_move(r1);_midend_redraw(r1)}r6=(r1+60|0)>>2;r7=HEAP32[r6];if((r7|0)>0){r8=r7}else{___assert_func(67020,586,68508,66060);r8=HEAP32[r6]}if((r8|0)==1){STACKTOP=r4;return}r8=(r1+8|0)>>2;r7=r1+32|0;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8]+60>>2]](r1,HEAP32[r2+17],HEAP32[r7>>2]);do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=1346;break}else{break}}else{r3=1346}}while(0);if(r3==1346){_midend_finish_move(r1);_midend_redraw(r1)}r5=(r1+52|0)>>2;r10=HEAP32[r5];L1863:do{if((r10|0)>(HEAP32[r6]|0)){r11=r1+64|0;r12=r10;while(1){r13=HEAP32[HEAP32[r8]+68>>2];r14=r12-1|0;HEAP32[r5]=r14;FUNCTION_TABLE[r13](HEAP32[HEAP32[r11>>2]+(r14*12&-1)>>2]);r14=HEAP32[r5];r13=HEAP32[HEAP32[r11>>2]+(r14*12&-1)+4>>2];if((r13|0)==0){r15=r14}else{_free(r13);r15=HEAP32[r5]}if((r15|0)>(HEAP32[r6]|0)){r12=r15}else{r16=r15;break L1863}}}else{r16=r10}}while(0);r10=r1+56|0;do{if((r16|0)<(HEAP32[r10>>2]|0)){r17=r16;r18=HEAP32[r2+16]}else{r15=r16+128|0;HEAP32[r10>>2]=r15;r12=r1+64|0;r11=HEAP32[r12>>2];r13=r15*12&-1;if((r11|0)==0){r19=_malloc(r13)}else{r19=_realloc(r11,r13)}if((r19|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r13=r19;HEAP32[r12>>2]=r13;r17=HEAP32[r5];r18=r13;break}}}while(0);r19=(r1+64|0)>>2;HEAP32[r18+(r17*12&-1)>>2]=r9;r9=HEAP32[r7>>2];r7=_malloc(_strlen(r9)+1|0);if((r7|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r7,r9);HEAP32[HEAP32[r19]+(HEAP32[r5]*12&-1)+4>>2]=r7;HEAP32[HEAP32[r19]+(HEAP32[r5]*12&-1)+8>>2]=3;r7=HEAP32[r5];r9=r7+1|0;HEAP32[r5]=r9;HEAP32[r6]=r9;r9=r1+80|0;r5=HEAP32[r9>>2];if((r5|0)!=0){r17=HEAP32[r19];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r5,HEAP32[r17+((r7-1)*12&-1)>>2],HEAP32[r17+(r7*12&-1)>>2])}r7=r1+88|0;HEAPF32[r7>>2]=0;_midend_finish_move(r1);_midend_redraw(r1);r1=HEAP32[r8];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=1367;break}else{r8=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r19]+((HEAP32[r6]-1)*12&-1)>>2],HEAP32[r9>>2])|0)!=0;HEAP32[r2+27]=r8&1;if(r8){break}else{r3=1367;break}}}while(0);do{if(r3==1367){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r7>>2]!=0){break}_deactivate_timer(HEAP32[r2]);STACKTOP=r4;return}}while(0);_activate_timer(HEAP32[r2]);STACKTOP=r4;return}function _midend_really_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r5=r1>>2;r6=0;r7=STACKTOP;r8=(r1+8|0)>>2;r9=(r1+60|0)>>2;r10=(r1+64|0)>>2;r11=FUNCTION_TABLE[HEAP32[HEAP32[r8]+64>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2]);r12=(r1+80|0)>>2;r13=FUNCTION_TABLE[HEAP32[HEAP32[r8]+112>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12],HEAP32[r5+19],r2,r3,r4);L1899:do{if((r13|0)==0){if((r4|0)==19){if((HEAP32[HEAP32[r8]+72>>2]|0)==0){r14=1;r6=1442;break}if((_midend_solve(r1)|0)==0){r6=1427;break}else{r14=1;r6=1442;break}}else if((r4|0)==114|(r4|0)==82|(r4|0)==25|(r4|0)==18){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=1389;break}else{break}}else{r6=1389}}while(0);if(r6==1389){_midend_finish_move(r1);_midend_redraw(r1)}r3=HEAP32[r9];if((r3|0)>=(HEAP32[r5+13]|0)){r14=1;r6=1442;break}r2=HEAP32[r12];if((r2|0)==0){r15=r3}else{r16=HEAP32[r10];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r2,HEAP32[r16+((r3-1)*12&-1)>>2],HEAP32[r16+(r3*12&-1)>>2]);r15=HEAP32[r9]}HEAP32[r9]=r15+1|0;HEAP32[r5+26]=1;r6=1427;break}else if((r4|0)==117|(r4|0)==85|(r4|0)==31|(r4|0)==26){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=1383;break}else{break}}else{r6=1383}}while(0);if(r6==1383){_midend_finish_move(r1);_midend_redraw(r1)}r3=HEAP32[r9];r16=r3-1|0;r2=HEAP32[r10]>>2;r17=HEAP32[((r16*12&-1)+8>>2)+r2];if((r3|0)<=1){r14=1;r6=1442;break}r18=HEAP32[r12];if((r18|0)==0){r19=r3}else{FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r18,HEAP32[((r16*12&-1)>>2)+r2],HEAP32[(((r3-2)*12&-1)>>2)+r2]);r19=HEAP32[r9]}r2=r19-1|0;HEAP32[r9]=r2;HEAP32[r5+26]=-1;r20=r17;r21=r2;break}else if((r4|0)==113|(r4|0)==81|(r4|0)==17){r14=0;r6=1442;break}else if((r4|0)==110|(r4|0)==78|(r4|0)==14){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=1379;break}else{break}}else{r6=1379}}while(0);if(r6==1379){_midend_finish_move(r1);_midend_redraw(r1)}_midend_new_game(r1);_midend_redraw(r1);r14=1;r6=1442;break}else{r14=1;r6=1442;break}}else{do{if(HEAP8[r13]<<24>>24==0){r22=HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2]}else{r2=FUNCTION_TABLE[HEAP32[HEAP32[r8]+116>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],r13);if((r2|0)!=0){r22=r2;break}___assert_func(67020,664,68544,66140);r22=0}}while(0);r2=HEAP32[r9];if((r22|0)==(HEAP32[HEAP32[r10]+((r2-1)*12&-1)>>2]|0)){_midend_redraw(r1);r17=HEAP32[r8];do{if((HEAP32[r17+180>>2]|0)==0){HEAP32[r5+27]=0;r6=1405;break}else{r3=(FUNCTION_TABLE[HEAP32[r17+184>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12])|0)!=0;HEAP32[r5+27]=r3&1;if(r3){break}else{r6=1405;break}}}while(0);do{if(r6==1405){if(HEAPF32[r5+24]!=0){break}if(HEAPF32[r5+22]!=0){break}_deactivate_timer(HEAP32[r5]);r14=1;r6=1442;break L1899}}while(0);_activate_timer(HEAP32[r5]);r14=1;r6=1442;break}if((r22|0)==0){r14=1;r6=1442;break}do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=1412;break}else{r23=r2;break}}else{r6=1412}}while(0);if(r6==1412){_midend_finish_move(r1);_midend_redraw(r1);r23=HEAP32[r9]}r2=(r1+52|0)>>2;r17=HEAP32[r2];L1954:do{if((r17|0)>(r23|0)){r3=r17;while(1){r16=HEAP32[HEAP32[r8]+68>>2];r18=r3-1|0;HEAP32[r2]=r18;FUNCTION_TABLE[r16](HEAP32[HEAP32[r10]+(r18*12&-1)>>2]);r18=HEAP32[r2];r16=HEAP32[HEAP32[r10]+(r18*12&-1)+4>>2];if((r16|0)==0){r24=r18}else{_free(r16);r24=HEAP32[r2]}if((r24|0)>(HEAP32[r9]|0)){r3=r24}else{r25=r24;break L1954}}}else{r25=r17}}while(0);r17=r1+56|0;do{if((r25|0)>=(HEAP32[r17>>2]|0)){r3=r25+128|0;HEAP32[r17>>2]=r3;r16=HEAP32[r10];r18=r3*12&-1;if((r16|0)==0){r26=_malloc(r18)}else{r26=_realloc(r16,r18)}if((r26|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r10]=r26;break}}}while(0);HEAP32[HEAP32[r10]+(HEAP32[r2]*12&-1)>>2]=r22;HEAP32[HEAP32[r10]+(HEAP32[r2]*12&-1)+4>>2]=r13;HEAP32[HEAP32[r10]+(HEAP32[r2]*12&-1)+8>>2]=1;r17=HEAP32[r2];r18=r17+1|0;HEAP32[r2]=r18;HEAP32[r9]=r18;HEAP32[r5+26]=1;r18=HEAP32[r12];if((r18|0)==0){r6=1427;break}r16=HEAP32[r10];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r18,HEAP32[r16+((r17-1)*12&-1)>>2],HEAP32[r16+(r17*12&-1)>>2]);r6=1427;break}}while(0);if(r6==1427){r13=HEAP32[r9];r20=HEAP32[HEAP32[r10]+((r13-1)*12&-1)+8>>2];r21=r13}else if(r6==1442){if((r11|0)==0){r27=r14;STACKTOP=r7;return r27}FUNCTION_TABLE[HEAP32[HEAP32[r8]+68>>2]](r11);r27=r14;STACKTOP=r7;return r27}do{if((r20|0)==1){r28=HEAP32[r8];r6=1432;break}else if((r20|0)==2){r14=HEAP32[r8];if((HEAP32[r14+188>>2]&512|0)==0){r6=1431;break}else{r28=r14;r6=1432;break}}else{r6=1431}}while(0);do{if(r6==1432){r20=FUNCTION_TABLE[HEAP32[r28+148>>2]](r11,HEAP32[HEAP32[r10]+((r21-1)*12&-1)>>2],HEAP32[r5+26],HEAP32[r12]);HEAP32[r5+21]=r11;r14=r1+88|0;if(r20<=0){r29=r14;r6=1434;break}HEAPF32[r14>>2]=r20;r30=r14;break}else if(r6==1431){HEAP32[r5+21]=r11;r29=r1+88|0;r6=1434;break}}while(0);if(r6==1434){HEAPF32[r29>>2]=0;_midend_finish_move(r1);r30=r29}HEAPF32[r5+23]=0;_midend_redraw(r1);r1=HEAP32[r8];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r5+27]=0;r6=1438;break}else{r8=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12])|0)!=0;HEAP32[r5+27]=r8&1;if(r8){break}else{r6=1438;break}}}while(0);do{if(r6==1438){if(HEAPF32[r5+24]!=0){break}if(HEAPF32[r30>>2]!=0){break}_deactivate_timer(HEAP32[r5]);r27=1;STACKTOP=r7;return r27}}while(0);_activate_timer(HEAP32[r5]);r27=1;STACKTOP=r7;return r27}function _midend_wants_statusbar(r1){return HEAP32[HEAP32[r1+8>>2]+176>>2]}function _midend_timer(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=r1>>2;r4=0;r5=r1+88|0;r6=HEAPF32[r5>>2];r7=r6>0;if(r7){r8=1}else{r8=HEAPF32[r3+24]>0}r9=r1+92|0;r10=HEAPF32[r9>>2]+r2;HEAPF32[r9>>2]=r10;do{if(r10>=r6|r6==0){if(r7){r4=1455;break}else{break}}else{if((HEAP32[r3+21]|0)!=0|r7^1){break}else{r4=1455;break}}}while(0);if(r4==1455){_midend_finish_move(r1)}r7=(r1+100|0)>>2;r6=HEAPF32[r7]+r2;HEAPF32[r7]=r6;r10=(r1+96|0)>>2;r9=HEAPF32[r10];if(r6>=r9|r9==0){HEAPF32[r10]=0;HEAPF32[r7]=0}if(r8){_midend_redraw(r1)}r8=(r1+108|0)>>2;do{if((HEAP32[r8]|0)!=0){r7=r1+112|0;r9=HEAPF32[r7>>2];r6=r9+r2;HEAPF32[r7>>2]=r6;if((r9&-1|0)==(r6&-1|0)){break}r6=HEAP32[r3+29];_status_bar(HEAP32[r3+30],(r6|0)==0?67616:r6)}}while(0);r2=HEAP32[r3+2];do{if((HEAP32[r2+180>>2]|0)==0){HEAP32[r8]=0;r4=1466;break}else{r1=(FUNCTION_TABLE[HEAP32[r2+184>>2]](HEAP32[HEAP32[r3+16]+((HEAP32[r3+15]-1)*12&-1)>>2],HEAP32[r3+20])|0)!=0;HEAP32[r8]=r1&1;if(r1){break}else{r4=1466;break}}}while(0);do{if(r4==1466){if(HEAPF32[r10]!=0){break}if(HEAPF32[r5>>2]!=0){break}_deactivate_timer(HEAP32[r3]);return}}while(0);_activate_timer(HEAP32[r3]);return}function _midend_colours(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r3=STACKTOP;STACKTOP=STACKTOP+92|0;r4=r3;r5=r3+80;r6=r3+84;r7=r3+88;r8=r1+8|0;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+132>>2]](HEAP32[r1>>2],r2),r1=r9>>2;if((HEAP32[r2>>2]|0)<=0){STACKTOP=r3;return r9}r10=r4|0;r11=0;while(1){_sprintf(r10,67736,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r8>>2]>>2],HEAP32[tempInt+4>>2]=r11,tempInt));r12=HEAP8[r10];L2037:do{if(r12<<24>>24==0){r13=0}else{r14=0;r15=0;r16=r10;r17=r12;while(1){if((_isspace(r17&255)|0)==0){r18=_toupper(HEAPU8[r16])&255;HEAP8[r4+r15|0]=r18;r19=r15+1|0}else{r19=r15}r18=r14+1|0;r20=r4+r18|0;r21=HEAP8[r20];if(r21<<24>>24==0){r13=r19;break L2037}else{r14=r18;r15=r19;r16=r20;r17=r21}}}}while(0);HEAP8[r4+r13|0]=0;r12=_getenv(r10);do{if((r12|0)!=0){if((_sscanf(r12,67708,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r6,HEAP32[tempInt+8>>2]=r7,tempInt))|0)!=3){break}r17=r11*3&-1;HEAPF32[(r17<<2>>2)+r1]=(HEAP32[r5>>2]>>>0)/255;HEAPF32[(r17+1<<2>>2)+r1]=(HEAP32[r6>>2]>>>0)/255;HEAPF32[(r17+2<<2>>2)+r1]=(HEAP32[r7>>2]>>>0)/255}}while(0);r12=r11+1|0;if((r12|0)<(HEAP32[r2>>2]|0)){r11=r12}else{break}}STACKTOP=r3;return r9}function _midend_which_preset(r1){var r2,r3,r4,r5;r2=FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+24>>2]](HEAP32[r1+68>>2],1);r3=r1+20|0;r4=HEAP32[r1+24>>2];r1=0;while(1){if((r1|0)>=(r4|0)){r5=-1;break}if((_strcmp(r2,HEAP32[HEAP32[r3>>2]+(r1<<2)>>2])|0)==0){r5=r1;break}else{r1=r1+1|0}}if((r2|0)==0){return r5}_free(r2);return r5}function _midend_num_presets(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+88|0;r4=r3;r5=r3+4;r6=r3+8;r7=(r1+24|0)>>2;r8=(r1+8|0)>>2;L2059:do{if((HEAP32[r7]|0)==0){if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+16>>2]](0,r4,r5)|0)==0){break}r9=(r1+28|0)>>2;r10=(r1+12|0)>>2;r11=(r1+16|0)>>2;r12=(r1+20|0)>>2;while(1){r13=HEAP32[r7];if((HEAP32[r9]|0)>(r13|0)){r14=r13}else{r15=r13+10|0;HEAP32[r9]=r15;r13=HEAP32[r10];r16=r15<<2;if((r13|0)==0){r17=_malloc(r16)}else{r17=_realloc(r13,r16)}if((r17|0)==0){r2=1502;break}HEAP32[r10]=r17;r16=HEAP32[r11];r13=HEAP32[r9]<<2;if((r16|0)==0){r18=_malloc(r13)}else{r18=_realloc(r16,r13)}if((r18|0)==0){r2=1507;break}HEAP32[r11]=r18;r13=HEAP32[r12];r16=HEAP32[r9]<<2;if((r13|0)==0){r19=_malloc(r16)}else{r19=_realloc(r13,r16)}if((r19|0)==0){r2=1512;break}HEAP32[r12]=r19;r14=HEAP32[r7]}HEAP32[HEAP32[r10]+(r14<<2)>>2]=HEAP32[r5>>2];HEAP32[HEAP32[r11]+(HEAP32[r7]<<2)>>2]=HEAP32[r4>>2];r16=FUNCTION_TABLE[HEAP32[HEAP32[r8]+24>>2]](HEAP32[r5>>2],1);HEAP32[HEAP32[r12]+(HEAP32[r7]<<2)>>2]=r16;r16=HEAP32[r7]+1|0;HEAP32[r7]=r16;if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+16>>2]](r16,r4,r5)|0)==0){break L2059}}if(r2==1507){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1512){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1502){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}}while(0);r5=r6|0;_sprintf(r5,67676,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r8]>>2],tempInt));r4=HEAP8[r5];L2087:do{if(r4<<24>>24==0){r20=0}else{r14=0;r19=0;r18=r5;r17=r4;while(1){if((_isspace(r17&255)|0)==0){r12=_toupper(HEAPU8[r18])&255;HEAP8[r6+r14|0]=r12;r21=r14+1|0}else{r21=r14}r12=r19+1|0;r11=r6+r12|0;r10=HEAP8[r11];if(r10<<24>>24==0){r20=r21;break L2087}else{r14=r21;r19=r12;r18=r11;r17=r10}}}}while(0);HEAP8[r6+r20|0]=0;r20=_getenv(r5);if((r20|0)==0){r22=HEAP32[r7];STACKTOP=r3;return r22}r5=_malloc(_strlen(r20)+1|0);if((r5|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r20);r20=HEAP8[r5];L2100:do{if(r20<<24>>24!=0){r6=(r1+28|0)>>2;r21=(r1+12|0)>>2;r4=(r1+16|0)>>2;r17=(r1+20|0)>>2;r18=r5;r19=r20;while(1){r14=r18;r10=r19;while(1){r23=r10<<24>>24==0;r24=r14+1|0;if(!(r10<<24>>24!=58&(r23^1))){break}r14=r24;r10=HEAP8[r24]}if(r23){r25=r14}else{HEAP8[r14]=0;r25=r24}r10=r25;while(1){r11=HEAP8[r10];r26=r11<<24>>24==0;r27=r10+1|0;if(r11<<24>>24!=58&(r26^1)){r10=r27}else{break}}if(r26){r28=r10}else{HEAP8[r10]=0;r28=r27}r14=FUNCTION_TABLE[HEAP32[HEAP32[r8]+12>>2]]();FUNCTION_TABLE[HEAP32[HEAP32[r8]+20>>2]](r14,r25);if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+48>>2]](r14,1)|0)==0){r11=HEAP32[r7];if((HEAP32[r6]|0)>(r11|0)){r29=r11}else{r12=r11+10|0;HEAP32[r6]=r12;r11=HEAP32[r21];r9=r12<<2;if((r11|0)==0){r30=_malloc(r9)}else{r30=_realloc(r11,r9)}if((r30|0)==0){r2=1541;break}HEAP32[r21]=r30;r9=HEAP32[r4];r11=HEAP32[r6]<<2;if((r9|0)==0){r31=_malloc(r11)}else{r31=_realloc(r9,r11)}if((r31|0)==0){r2=1546;break}HEAP32[r4]=r31;r11=HEAP32[r17];r9=HEAP32[r6]<<2;if((r11|0)==0){r32=_malloc(r9)}else{r32=_realloc(r11,r9)}if((r32|0)==0){r2=1551;break}HEAP32[r17]=r32;r29=HEAP32[r7]}HEAP32[HEAP32[r21]+(r29<<2)>>2]=r14;r9=_malloc(_strlen(r18)+1|0);if((r9|0)==0){r2=1554;break}_strcpy(r9,r18);HEAP32[HEAP32[r4]+(HEAP32[r7]<<2)>>2]=r9;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8]+24>>2]](r14,1);HEAP32[HEAP32[r17]+(HEAP32[r7]<<2)>>2]=r9;HEAP32[r7]=HEAP32[r7]+1|0}else{FUNCTION_TABLE[HEAP32[HEAP32[r8]+28>>2]](r14)}r14=HEAP8[r28];if(r14<<24>>24==0){break L2100}else{r18=r28;r19=r14}}if(r2==1546){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1541){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1554){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==1551){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}}while(0);_free(r5);r22=HEAP32[r7];STACKTOP=r3;return r22}function _midend_status(r1){var r2,r3;r2=HEAP32[r1+60>>2];if((r2|0)==0){r3=1;return r3}r3=FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+156>>2]](HEAP32[HEAP32[r1+64>>2]+((r2-1)*12&-1)>>2]);return r3}function _shuffle(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r5=STACKTOP;STACKTOP=STACKTOP+512|0;if((r2|0)<=1){STACKTOP=r5;return}r6=r5|0;r7=(r3|0)>0;r8=r2;while(1){r2=0;while(1){if((r8>>>(r2>>>0)|0)==0){break}else{r2=r2+1|0}}r9=r8-1|0;r10=r2+3|0;if((r10|0)>=32){___assert_func(67068,275,68436,67752)}r11=Math.floor((1<<r10>>>0)/(r8>>>0));r12=Math.imul(r11,r8);while(1){r13=_random_bits(r4,r10);if(r13>>>0<r12>>>0){break}}r12=Math.floor((r13>>>0)/(r11>>>0));L2167:do{if((r12|0)!=(r9|0)){if(!r7){break}r10=Math.imul(r12,r3);r2=r1+Math.imul(r9,r3)|0;r14=r1+r10|0;r10=r3;while(1){r15=r10>>>0<512?r10:512;_memcpy(r6,r2,r15);_memcpy(r2,r14,r15);_memcpy(r14,r6,r15);r16=r10-r15|0;if((r16|0)>0){r2=r2+r15|0;r14=r14+r15|0;r10=r16}else{break L2167}}}}while(0);if((r9|0)>1){r8=r9}else{break}}STACKTOP=r5;return}function _draw_rect_corners(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13;r6=r2-r4|0;r7=r3-r4|0;r8=(r4|0)/2&-1;r9=r3-r8|0;r10=(r1|0)>>2;r11=(r1+4|0)>>2;FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](HEAP32[r11],r6,r7,r6,r9,r5);r1=r2-r8|0;FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](HEAP32[r11],r6,r7,r1,r7,r5);r12=r4+r3|0;r13=r8+r3|0;FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](HEAP32[r11],r6,r12,r6,r13,r5);FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](HEAP32[r11],r6,r12,r1,r12,r5);r1=r4+r2|0;FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](HEAP32[r11],r1,r7,r1,r9,r5);r9=r8+r2|0;FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](HEAP32[r11],r1,r7,r9,r7,r5);FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](HEAP32[r11],r1,r12,r1,r13,r5);FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](HEAP32[r11],r1,r12,r9,r12,r5);return}function _SHA_Bytes(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+384|0;r6=r5,r7=r6>>2;r8=r5+320;r9=r1+92|0;r10=_llvm_uadd_with_overflow_i32(HEAP32[r9>>2],r3);HEAP32[r9>>2]=r10;r10=r1+88|0;HEAP32[r10>>2]=(tempRet0&1)+HEAP32[r10>>2]|0;r10=(r1+84|0)>>2;r9=HEAP32[r10];r11=r9+r3|0;do{if((r9|0)==0){if((r11|0)>63){r4=1584;break}else{r12=r2;r13=r3;break}}else{if((r11|0)>=64){r4=1584;break}_memcpy(r1+(r9+20)|0,r2,r3);r14=HEAP32[r10]+r3|0;HEAP32[r10]=r14;STACKTOP=r5;return}}while(0);L2181:do{if(r4==1584){r11=r1|0;r15=r6;r16=r8;r17=r1+4|0;r18=r1+8|0;r19=r1+12|0;r20=r1+16|0;r21=r2;r22=r3;r23=r9;while(1){_memcpy(r1+(r23+20)|0,r21,64-r23|0);r24=64-HEAP32[r10]|0;r25=r21+r24|0;r26=0;while(1){r27=r26<<2;HEAP32[r8+(r26<<2)>>2]=HEAPU8[(r27|1)+r1+20|0]<<16|HEAPU8[r1+(r27+20)|0]<<24|HEAPU8[(r27|2)+r1+20|0]<<8|HEAPU8[(r27|3)+r1+20|0];r27=r26+1|0;if((r27|0)==16){break}else{r26=r27}}_memcpy(r15,r16,64);r26=16;while(1){r27=HEAP32[(r26-8<<2>>2)+r7]^HEAP32[(r26-3<<2>>2)+r7]^HEAP32[(r26-14<<2>>2)+r7]^HEAP32[(r26-16<<2>>2)+r7];HEAP32[(r26<<2>>2)+r7]=r27<<1|r27>>>31;r27=r26+1|0;if((r27|0)==80){break}else{r26=r27}}r26=HEAP32[r11>>2];r27=HEAP32[r17>>2];r28=HEAP32[r18>>2];r29=HEAP32[r19>>2];r30=HEAP32[r20>>2];r31=0;r32=r30;r33=r29;r34=r28;r35=r27;r36=r26;while(1){r37=(r36<<5|r36>>>27)+r32+(r33&(r35^-1)|r34&r35)+HEAP32[(r31<<2>>2)+r7]+1518500249|0;r38=r35<<30|r35>>>2;r39=r31+1|0;if((r39|0)==20){r40=20;r41=r33;r42=r34;r43=r38;r44=r36;r45=r37;break}else{r31=r39;r32=r33;r33=r34;r34=r38;r35=r36;r36=r37}}while(1){r36=(r45<<5|r45>>>27)+r41+(r43^r44^r42)+HEAP32[(r40<<2>>2)+r7]+1859775393|0;r35=r44<<30|r44>>>2;r34=r40+1|0;if((r34|0)==40){r46=40;r47=r42;r48=r43;r49=r35;r50=r45;r51=r36;break}else{r40=r34;r41=r42;r42=r43;r43=r35;r44=r45;r45=r36}}while(1){r36=(r51<<5|r51>>>27)-1894007588+r47+((r48|r49)&r50|r48&r49)+HEAP32[(r46<<2>>2)+r7]|0;r35=r50<<30|r50>>>2;r34=r46+1|0;if((r34|0)==60){r52=60;r53=r48;r54=r49;r55=r35;r56=r51;r57=r36;break}else{r46=r34;r47=r48;r48=r49;r49=r35;r50=r51;r51=r36}}while(1){r58=(r57<<5|r57>>>27)-899497514+r53+(r55^r56^r54)+HEAP32[(r52<<2>>2)+r7]|0;r59=r56<<30|r56>>>2;r36=r52+1|0;if((r36|0)==80){break}else{r52=r36;r53=r54;r54=r55;r55=r59;r56=r57;r57=r58}}r36=r22-r24|0;HEAP32[r11>>2]=r58+r26|0;HEAP32[r17>>2]=r57+r27|0;HEAP32[r18>>2]=r59+r28|0;HEAP32[r19>>2]=r55+r29|0;HEAP32[r20>>2]=r54+r30|0;HEAP32[r10]=0;if((r36|0)>63){r21=r25;r22=r36;r23=0}else{r12=r25;r13=r36;break L2181}}}}while(0);_memcpy(r1+20|0,r12,r13);r14=r13;HEAP32[r10]=r14;STACKTOP=r5;return}function _SHA_Final(r1,r2){var r3,r4,r5,r6,r7,r8;r3=STACKTOP;STACKTOP=STACKTOP+64|0;r4=r3;r5=HEAP32[r1+84>>2];r6=((r5|0)>55?120:56)-r5|0;r5=HEAP32[r1+88>>2];r7=HEAP32[r1+92>>2];r8=r4|0;_memset(r8,0,r6);HEAP8[r8]=-128;_SHA_Bytes(r1,r8,r6);HEAP8[r8]=r5>>>21&255;HEAP8[r4+1|0]=r5>>>13&255;HEAP8[r4+2|0]=r5>>>5&255;HEAP8[r4+3|0]=(r7>>>29|r5<<3)&255;HEAP8[r4+4|0]=r7>>>21&255;HEAP8[r4+5|0]=r7>>>13&255;HEAP8[r4+6|0]=r7>>>5&255;HEAP8[r4+7|0]=r7<<3&255;_SHA_Bytes(r1,r8,8);r8=(r1|0)>>2;HEAP8[r2]=HEAP32[r8]>>>24&255;HEAP8[r2+1|0]=HEAP32[r8]>>>16&255;HEAP8[r2+2|0]=HEAP32[r8]>>>8&255;HEAP8[r2+3|0]=HEAP32[r8]&255;r8=(r1+4|0)>>2;HEAP8[r2+4|0]=HEAP32[r8]>>>24&255;HEAP8[r2+5|0]=HEAP32[r8]>>>16&255;HEAP8[r2+6|0]=HEAP32[r8]>>>8&255;HEAP8[r2+7|0]=HEAP32[r8]&255;r8=(r1+8|0)>>2;HEAP8[r2+8|0]=HEAP32[r8]>>>24&255;HEAP8[r2+9|0]=HEAP32[r8]>>>16&255;HEAP8[r2+10|0]=HEAP32[r8]>>>8&255;HEAP8[r2+11|0]=HEAP32[r8]&255;r8=(r1+12|0)>>2;HEAP8[r2+12|0]=HEAP32[r8]>>>24&255;HEAP8[r2+13|0]=HEAP32[r8]>>>16&255;HEAP8[r2+14|0]=HEAP32[r8]>>>8&255;HEAP8[r2+15|0]=HEAP32[r8]&255;r8=(r1+16|0)>>2;HEAP8[r2+16|0]=HEAP32[r8]>>>24&255;HEAP8[r2+17|0]=HEAP32[r8]>>>16&255;HEAP8[r2+18|0]=HEAP32[r8]>>>8&255;HEAP8[r2+19|0]=HEAP32[r8]&255;STACKTOP=r3;return}function _midend_solve(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r2=r1>>2;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+4|0;r5=r4,r6=r5>>2;r7=(r1+8|0)>>2;r8=HEAP32[r7];if((HEAP32[r8+72>>2]|0)==0){r9=67140;STACKTOP=r4;return r9}r10=(r1+60|0)>>2;r11=HEAP32[r10];if((r11|0)<1){r9=67080;STACKTOP=r4;return r9}HEAP32[r6]=0;r12=(r1+64|0)>>2;r13=HEAP32[r12];r14=FUNCTION_TABLE[HEAP32[r8+76>>2]](HEAP32[r13>>2],HEAP32[r13+((r11-1)*12&-1)>>2],HEAP32[r2+11],r5);if((r14|0)==0){r5=HEAP32[r6];if((r5|0)!=0){r9=r5;STACKTOP=r4;return r9}HEAP32[r6]=67032;r9=67032;STACKTOP=r4;return r9}r6=FUNCTION_TABLE[HEAP32[HEAP32[r7]+116>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-1)*12&-1)>>2],r14);if((r6|0)==0){___assert_func(67020,1376,68492,66428)}r5=r1+84|0;do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=1611;break}else{break}}else{r3=1611}}while(0);if(r3==1611){_midend_finish_move(r1);_midend_redraw(r1)}r11=(r1+52|0)>>2;r13=HEAP32[r11];L2225:do{if((r13|0)>(HEAP32[r10]|0)){r8=r13;while(1){r15=HEAP32[HEAP32[r7]+68>>2];r16=r8-1|0;HEAP32[r11]=r16;FUNCTION_TABLE[r15](HEAP32[HEAP32[r12]+(r16*12&-1)>>2]);r16=HEAP32[r11];r15=HEAP32[HEAP32[r12]+(r16*12&-1)+4>>2];if((r15|0)==0){r17=r16}else{_free(r15);r17=HEAP32[r11]}if((r17|0)>(HEAP32[r10]|0)){r8=r17}else{r18=r17;break L2225}}}else{r18=r13}}while(0);r13=r1+56|0;do{if((r18|0)<(HEAP32[r13>>2]|0)){r19=r18;r20=HEAP32[r12]}else{r17=r18+128|0;HEAP32[r13>>2]=r17;r8=HEAP32[r12];r15=r17*12&-1;if((r8|0)==0){r21=_malloc(r15)}else{r21=_realloc(r8,r15)}if((r21|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r15=r21;HEAP32[r12]=r15;r19=HEAP32[r11];r20=r15;break}}}while(0);HEAP32[r20+(r19*12&-1)>>2]=r6;HEAP32[HEAP32[r12]+(HEAP32[r11]*12&-1)+4>>2]=r14;HEAP32[HEAP32[r12]+(HEAP32[r11]*12&-1)+8>>2]=2;r14=HEAP32[r11];r6=r14+1|0;HEAP32[r11]=r6;HEAP32[r10]=r6;r6=(r1+80|0)>>2;r11=HEAP32[r6];if((r11|0)!=0){r19=HEAP32[r12];FUNCTION_TABLE[HEAP32[HEAP32[r7]+108>>2]](r11,HEAP32[r19+((r14-1)*12&-1)>>2],HEAP32[r19+(r14*12&-1)>>2])}HEAP32[r2+26]=1;r14=HEAP32[r7];if((HEAP32[r14+188>>2]&512|0)==0){HEAPF32[r2+22]=0;_midend_finish_move(r1)}else{r19=FUNCTION_TABLE[HEAP32[r14+64>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-2)*12&-1)>>2]);HEAP32[r5>>2]=r19;r19=HEAP32[r10];r5=HEAP32[r12];r14=FUNCTION_TABLE[HEAP32[HEAP32[r7]+148>>2]](HEAP32[r5+((r19-2)*12&-1)>>2],HEAP32[r5+((r19-1)*12&-1)>>2],1,HEAP32[r6]);HEAPF32[r2+22]=r14;HEAPF32[r2+23]=0}if((HEAP32[r2+30]|0)!=0){_midend_redraw(r1)}r1=HEAP32[r7];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=1634;break}else{r7=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-1)*12&-1)>>2],HEAP32[r6])|0)!=0;HEAP32[r2+27]=r7&1;if(r7){break}else{r3=1634;break}}}while(0);do{if(r3==1634){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r2+22]!=0){break}_deactivate_timer(HEAP32[r2]);r9=0;STACKTOP=r4;return r9}}while(0);_activate_timer(HEAP32[r2]);r9=0;STACKTOP=r4;return r9}function _midend_rewrite_statusbar(r1,r2){var r3,r4,r5,r6,r7;r3=STACKTOP;STACKTOP=STACKTOP+100|0;r4=r3;r5=r1+116|0;r6=HEAP32[r5>>2];do{if((r6|0)!=(r2|0)){if((r6|0)!=0){_free(r6)}r7=_malloc(_strlen(r2)+1|0);if((r7|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r7,r2);HEAP32[r5>>2]=r7;break}}}while(0);if((HEAP32[HEAP32[r1+8>>2]+180>>2]|0)==0){r5=_malloc(_strlen(r2)+1|0);if((r5|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r2);r6=r5;STACKTOP=r3;return r6}else{r5=HEAPF32[r1+112>>2]&-1;r1=r4|0;_sprintf(r1,67008,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=(r5|0)/60&-1,HEAP32[tempInt+4>>2]=(r5|0)%60,tempInt));r5=_malloc(_strlen(r1)+_strlen(r2)+1|0);if((r5|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r1);_strcat(r5,r2);r6=r5;STACKTOP=r3;return r6}}function _random_bits(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+96|0;r5=r4;if((r2|0)<=0){r6=0;r7=r2-1|0;r8=2<<r7;r9=r8-1|0;r10=r6&r9;STACKTOP=r4;return r10}r11=(r1+60|0)>>2;r12=r1|0;r13=r1+40|0;r14=r5|0;r15=r5+4|0;r16=r5+8|0;r17=r5+12|0;r18=r5+16|0;r19=r5+84|0;r20=r5+92|0;r21=r5+88|0;r22=0;r23=0;r24=HEAP32[r11];while(1){if((r24|0)>19){r25=0;while(1){r26=r1+r25|0;r27=HEAP8[r26];if(r27<<24>>24!=-1){r3=1665;break}HEAP8[r26]=0;r28=r25+1|0;if((r28|0)<20){r25=r28}else{break}}if(r3==1665){r3=0;HEAP8[r26]=r27+1&255}HEAP32[r14>>2]=1732584193;HEAP32[r15>>2]=-271733879;HEAP32[r16>>2]=-1732584194;HEAP32[r17>>2]=271733878;HEAP32[r18>>2]=-1009589776;HEAP32[r19>>2]=0;HEAP32[r20>>2]=0;HEAP32[r21>>2]=0;_SHA_Bytes(r5,r12,40);_SHA_Final(r5,r13);HEAP32[r11]=0;r29=0}else{r29=r24}r25=r29+1|0;HEAP32[r11]=r25;r28=HEAPU8[r1+(r29+40)|0]|r22<<8;r30=r23+8|0;if((r30|0)<(r2|0)){r22=r28;r23=r30;r24=r25}else{r6=r28;break}}r7=r2-1|0;r8=2<<r7;r9=r8-1|0;r10=r6&r9;STACKTOP=r4;return r10}function _random_new(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=STACKTOP;STACKTOP=STACKTOP+288|0;r4=r3,r5=r4>>2;r6=r3+96,r7=r6>>2;r8=r3+192,r9=r8>>2;r10=_malloc(64);if((r10|0)==0){_fatal(67772,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r9]=1732584193;HEAP32[r9+1]=-271733879;HEAP32[r9+2]=-1732584194;HEAP32[r9+3]=271733878;HEAP32[r9+4]=-1009589776;HEAP32[r9+21]=0;HEAP32[r9+23]=0;HEAP32[r9+22]=0;_SHA_Bytes(r8,r1,r2);_SHA_Final(r8,r10);HEAP32[r7]=1732584193;HEAP32[r7+1]=-271733879;HEAP32[r7+2]=-1732584194;HEAP32[r7+3]=271733878;HEAP32[r7+4]=-1009589776;HEAP32[r7+21]=0;HEAP32[r7+23]=0;HEAP32[r7+22]=0;_SHA_Bytes(r6,r10,20);_SHA_Final(r6,r10+20|0);HEAP32[r5]=1732584193;HEAP32[r5+1]=-271733879;HEAP32[r5+2]=-1732584194;HEAP32[r5+3]=271733878;HEAP32[r5+4]=-1009589776;HEAP32[r5+21]=0;HEAP32[r5+23]=0;HEAP32[r5+22]=0;_SHA_Bytes(r4,r10,40);_SHA_Final(r4,r10+40|0);HEAP32[r10+60>>2]=0;STACKTOP=r3;return r10}}function _malloc(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95;r2=0;do{if(r1>>>0<245){if(r1>>>0<11){r3=16}else{r3=r1+11&-8}r4=r3>>>3;r5=HEAP32[16984];r6=r5>>>(r4>>>0);if((r6&3|0)!=0){r7=(r6&1^1)+r4|0;r8=r7<<1;r9=(r8<<2)+67976|0;r10=(r8+2<<2)+67976|0;r8=HEAP32[r10>>2];r11=r8+8|0;r12=HEAP32[r11>>2];do{if((r9|0)==(r12|0)){HEAP32[16984]=r5&(1<<r7^-1)}else{if(r12>>>0<HEAP32[16988]>>>0){_abort()}r13=r12+12|0;if((HEAP32[r13>>2]|0)==(r8|0)){HEAP32[r13>>2]=r9;HEAP32[r10>>2]=r12;break}else{_abort()}}}while(0);r12=r7<<3;HEAP32[r8+4>>2]=r12|3;r10=r8+(r12|4)|0;HEAP32[r10>>2]=HEAP32[r10>>2]|1;r14=r11;return r14}if(r3>>>0<=HEAP32[16986]>>>0){r15=r3,r16=r15>>2;break}if((r6|0)!=0){r10=2<<r4;r12=r6<<r4&(r10|-r10);r10=(r12&-r12)-1|0;r12=r10>>>12&16;r9=r10>>>(r12>>>0);r10=r9>>>5&8;r13=r9>>>(r10>>>0);r9=r13>>>2&4;r17=r13>>>(r9>>>0);r13=r17>>>1&2;r18=r17>>>(r13>>>0);r17=r18>>>1&1;r19=(r10|r12|r9|r13|r17)+(r18>>>(r17>>>0))|0;r17=r19<<1;r18=(r17<<2)+67976|0;r13=(r17+2<<2)+67976|0;r17=HEAP32[r13>>2];r9=r17+8|0;r12=HEAP32[r9>>2];do{if((r18|0)==(r12|0)){HEAP32[16984]=r5&(1<<r19^-1)}else{if(r12>>>0<HEAP32[16988]>>>0){_abort()}r10=r12+12|0;if((HEAP32[r10>>2]|0)==(r17|0)){HEAP32[r10>>2]=r18;HEAP32[r13>>2]=r12;break}else{_abort()}}}while(0);r12=r19<<3;r13=r12-r3|0;HEAP32[r17+4>>2]=r3|3;r18=r17;r5=r18+r3|0;HEAP32[r18+(r3|4)>>2]=r13|1;HEAP32[r18+r12>>2]=r13;r12=HEAP32[16986];if((r12|0)!=0){r18=HEAP32[16989];r4=r12>>>3;r12=r4<<1;r6=(r12<<2)+67976|0;r11=HEAP32[16984];r8=1<<r4;do{if((r11&r8|0)==0){HEAP32[16984]=r11|r8;r20=r6;r21=(r12+2<<2)+67976|0}else{r4=(r12+2<<2)+67976|0;r7=HEAP32[r4>>2];if(r7>>>0>=HEAP32[16988]>>>0){r20=r7;r21=r4;break}_abort()}}while(0);HEAP32[r21>>2]=r18;HEAP32[r20+12>>2]=r18;HEAP32[r18+8>>2]=r20;HEAP32[r18+12>>2]=r6}HEAP32[16986]=r13;HEAP32[16989]=r5;r14=r9;return r14}r12=HEAP32[16985];if((r12|0)==0){r15=r3,r16=r15>>2;break}r8=(r12&-r12)-1|0;r12=r8>>>12&16;r11=r8>>>(r12>>>0);r8=r11>>>5&8;r17=r11>>>(r8>>>0);r11=r17>>>2&4;r19=r17>>>(r11>>>0);r17=r19>>>1&2;r4=r19>>>(r17>>>0);r19=r4>>>1&1;r7=HEAP32[((r8|r12|r11|r17|r19)+(r4>>>(r19>>>0))<<2)+68240>>2];r19=r7;r4=r7,r17=r4>>2;r11=(HEAP32[r7+4>>2]&-8)-r3|0;while(1){r7=HEAP32[r19+16>>2];if((r7|0)==0){r12=HEAP32[r19+20>>2];if((r12|0)==0){break}else{r22=r12}}else{r22=r7}r7=(HEAP32[r22+4>>2]&-8)-r3|0;r12=r7>>>0<r11>>>0;r19=r22;r4=r12?r22:r4,r17=r4>>2;r11=r12?r7:r11}r19=r4;r9=HEAP32[16988];if(r19>>>0<r9>>>0){_abort()}r5=r19+r3|0;r13=r5;if(r19>>>0>=r5>>>0){_abort()}r5=HEAP32[r17+6];r6=HEAP32[r17+3];L2359:do{if((r6|0)==(r4|0)){r18=r4+20|0;r7=HEAP32[r18>>2];do{if((r7|0)==0){r12=r4+16|0;r8=HEAP32[r12>>2];if((r8|0)==0){r23=0,r24=r23>>2;break L2359}else{r25=r8;r26=r12;break}}else{r25=r7;r26=r18}}while(0);while(1){r18=r25+20|0;r7=HEAP32[r18>>2];if((r7|0)!=0){r25=r7;r26=r18;continue}r18=r25+16|0;r7=HEAP32[r18>>2];if((r7|0)==0){break}else{r25=r7;r26=r18}}if(r26>>>0<r9>>>0){_abort()}else{HEAP32[r26>>2]=0;r23=r25,r24=r23>>2;break}}else{r18=HEAP32[r17+2];if(r18>>>0<r9>>>0){_abort()}r7=r18+12|0;if((HEAP32[r7>>2]|0)!=(r4|0)){_abort()}r12=r6+8|0;if((HEAP32[r12>>2]|0)==(r4|0)){HEAP32[r7>>2]=r6;HEAP32[r12>>2]=r18;r23=r6,r24=r23>>2;break}else{_abort()}}}while(0);L2381:do{if((r5|0)!=0){r6=r4+28|0;r9=(HEAP32[r6>>2]<<2)+68240|0;do{if((r4|0)==(HEAP32[r9>>2]|0)){HEAP32[r9>>2]=r23;if((r23|0)!=0){break}HEAP32[16985]=HEAP32[16985]&(1<<HEAP32[r6>>2]^-1);break L2381}else{if(r5>>>0<HEAP32[16988]>>>0){_abort()}r18=r5+16|0;if((HEAP32[r18>>2]|0)==(r4|0)){HEAP32[r18>>2]=r23}else{HEAP32[r5+20>>2]=r23}if((r23|0)==0){break L2381}}}while(0);if(r23>>>0<HEAP32[16988]>>>0){_abort()}HEAP32[r24+6]=r5;r6=HEAP32[r17+4];do{if((r6|0)!=0){if(r6>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r24+4]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);r6=HEAP32[r17+5];if((r6|0)==0){break}if(r6>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r24+5]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);if(r11>>>0<16){r5=r11+r3|0;HEAP32[r17+1]=r5|3;r6=r5+(r19+4)|0;HEAP32[r6>>2]=HEAP32[r6>>2]|1}else{HEAP32[r17+1]=r3|3;HEAP32[r19+(r3|4)>>2]=r11|1;HEAP32[r19+r11+r3>>2]=r11;r6=HEAP32[16986];if((r6|0)!=0){r5=HEAP32[16989];r9=r6>>>3;r6=r9<<1;r18=(r6<<2)+67976|0;r12=HEAP32[16984];r7=1<<r9;do{if((r12&r7|0)==0){HEAP32[16984]=r12|r7;r27=r18;r28=(r6+2<<2)+67976|0}else{r9=(r6+2<<2)+67976|0;r8=HEAP32[r9>>2];if(r8>>>0>=HEAP32[16988]>>>0){r27=r8;r28=r9;break}_abort()}}while(0);HEAP32[r28>>2]=r5;HEAP32[r27+12>>2]=r5;HEAP32[r5+8>>2]=r27;HEAP32[r5+12>>2]=r18}HEAP32[16986]=r11;HEAP32[16989]=r13}r6=r4+8|0;if((r6|0)==0){r15=r3,r16=r15>>2;break}else{r14=r6}return r14}else{if(r1>>>0>4294967231){r15=-1,r16=r15>>2;break}r6=r1+11|0;r7=r6&-8,r12=r7>>2;r19=HEAP32[16985];if((r19|0)==0){r15=r7,r16=r15>>2;break}r17=-r7|0;r9=r6>>>8;do{if((r9|0)==0){r29=0}else{if(r7>>>0>16777215){r29=31;break}r6=(r9+1048320|0)>>>16&8;r8=r9<<r6;r10=(r8+520192|0)>>>16&4;r30=r8<<r10;r8=(r30+245760|0)>>>16&2;r31=14-(r10|r6|r8)+(r30<<r8>>>15)|0;r29=r7>>>((r31+7|0)>>>0)&1|r31<<1}}while(0);r9=HEAP32[(r29<<2)+68240>>2];L2429:do{if((r9|0)==0){r32=0;r33=r17;r34=0}else{if((r29|0)==31){r35=0}else{r35=25-(r29>>>1)|0}r4=0;r13=r17;r11=r9,r18=r11>>2;r5=r7<<r35;r31=0;while(1){r8=HEAP32[r18+1]&-8;r30=r8-r7|0;if(r30>>>0<r13>>>0){if((r8|0)==(r7|0)){r32=r11;r33=r30;r34=r11;break L2429}else{r36=r11;r37=r30}}else{r36=r4;r37=r13}r30=HEAP32[r18+5];r8=HEAP32[((r5>>>31<<2)+16>>2)+r18];r6=(r30|0)==0|(r30|0)==(r8|0)?r31:r30;if((r8|0)==0){r32=r36;r33=r37;r34=r6;break L2429}else{r4=r36;r13=r37;r11=r8,r18=r11>>2;r5=r5<<1;r31=r6}}}}while(0);if((r34|0)==0&(r32|0)==0){r9=2<<r29;r17=r19&(r9|-r9);if((r17|0)==0){r15=r7,r16=r15>>2;break}r9=(r17&-r17)-1|0;r17=r9>>>12&16;r31=r9>>>(r17>>>0);r9=r31>>>5&8;r5=r31>>>(r9>>>0);r31=r5>>>2&4;r11=r5>>>(r31>>>0);r5=r11>>>1&2;r18=r11>>>(r5>>>0);r11=r18>>>1&1;r38=HEAP32[((r9|r17|r31|r5|r11)+(r18>>>(r11>>>0))<<2)+68240>>2]}else{r38=r34}L2444:do{if((r38|0)==0){r39=r33;r40=r32,r41=r40>>2}else{r11=r38,r18=r11>>2;r5=r33;r31=r32;while(1){r17=(HEAP32[r18+1]&-8)-r7|0;r9=r17>>>0<r5>>>0;r13=r9?r17:r5;r17=r9?r11:r31;r9=HEAP32[r18+4];if((r9|0)!=0){r11=r9,r18=r11>>2;r5=r13;r31=r17;continue}r9=HEAP32[r18+5];if((r9|0)==0){r39=r13;r40=r17,r41=r40>>2;break L2444}else{r11=r9,r18=r11>>2;r5=r13;r31=r17}}}}while(0);if((r40|0)==0){r15=r7,r16=r15>>2;break}if(r39>>>0>=(HEAP32[16986]-r7|0)>>>0){r15=r7,r16=r15>>2;break}r19=r40,r31=r19>>2;r5=HEAP32[16988];if(r19>>>0<r5>>>0){_abort()}r11=r19+r7|0;r18=r11;if(r19>>>0>=r11>>>0){_abort()}r17=HEAP32[r41+6];r13=HEAP32[r41+3];L2457:do{if((r13|0)==(r40|0)){r9=r40+20|0;r4=HEAP32[r9>>2];do{if((r4|0)==0){r6=r40+16|0;r8=HEAP32[r6>>2];if((r8|0)==0){r42=0,r43=r42>>2;break L2457}else{r44=r8;r45=r6;break}}else{r44=r4;r45=r9}}while(0);while(1){r9=r44+20|0;r4=HEAP32[r9>>2];if((r4|0)!=0){r44=r4;r45=r9;continue}r9=r44+16|0;r4=HEAP32[r9>>2];if((r4|0)==0){break}else{r44=r4;r45=r9}}if(r45>>>0<r5>>>0){_abort()}else{HEAP32[r45>>2]=0;r42=r44,r43=r42>>2;break}}else{r9=HEAP32[r41+2];if(r9>>>0<r5>>>0){_abort()}r4=r9+12|0;if((HEAP32[r4>>2]|0)!=(r40|0)){_abort()}r6=r13+8|0;if((HEAP32[r6>>2]|0)==(r40|0)){HEAP32[r4>>2]=r13;HEAP32[r6>>2]=r9;r42=r13,r43=r42>>2;break}else{_abort()}}}while(0);L2479:do{if((r17|0)!=0){r13=r40+28|0;r5=(HEAP32[r13>>2]<<2)+68240|0;do{if((r40|0)==(HEAP32[r5>>2]|0)){HEAP32[r5>>2]=r42;if((r42|0)!=0){break}HEAP32[16985]=HEAP32[16985]&(1<<HEAP32[r13>>2]^-1);break L2479}else{if(r17>>>0<HEAP32[16988]>>>0){_abort()}r9=r17+16|0;if((HEAP32[r9>>2]|0)==(r40|0)){HEAP32[r9>>2]=r42}else{HEAP32[r17+20>>2]=r42}if((r42|0)==0){break L2479}}}while(0);if(r42>>>0<HEAP32[16988]>>>0){_abort()}HEAP32[r43+6]=r17;r13=HEAP32[r41+4];do{if((r13|0)!=0){if(r13>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r43+4]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);r13=HEAP32[r41+5];if((r13|0)==0){break}if(r13>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r43+5]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);do{if(r39>>>0<16){r17=r39+r7|0;HEAP32[r41+1]=r17|3;r13=r17+(r19+4)|0;HEAP32[r13>>2]=HEAP32[r13>>2]|1}else{HEAP32[r41+1]=r7|3;HEAP32[((r7|4)>>2)+r31]=r39|1;HEAP32[(r39>>2)+r31+r12]=r39;r13=r39>>>3;if(r39>>>0<256){r17=r13<<1;r5=(r17<<2)+67976|0;r9=HEAP32[16984];r6=1<<r13;do{if((r9&r6|0)==0){HEAP32[16984]=r9|r6;r46=r5;r47=(r17+2<<2)+67976|0}else{r13=(r17+2<<2)+67976|0;r4=HEAP32[r13>>2];if(r4>>>0>=HEAP32[16988]>>>0){r46=r4;r47=r13;break}_abort()}}while(0);HEAP32[r47>>2]=r18;HEAP32[r46+12>>2]=r18;HEAP32[r12+(r31+2)]=r46;HEAP32[r12+(r31+3)]=r5;break}r17=r11;r6=r39>>>8;do{if((r6|0)==0){r48=0}else{if(r39>>>0>16777215){r48=31;break}r9=(r6+1048320|0)>>>16&8;r13=r6<<r9;r4=(r13+520192|0)>>>16&4;r8=r13<<r4;r13=(r8+245760|0)>>>16&2;r30=14-(r4|r9|r13)+(r8<<r13>>>15)|0;r48=r39>>>((r30+7|0)>>>0)&1|r30<<1}}while(0);r6=(r48<<2)+68240|0;HEAP32[r12+(r31+7)]=r48;HEAP32[r12+(r31+5)]=0;HEAP32[r12+(r31+4)]=0;r5=HEAP32[16985];r30=1<<r48;if((r5&r30|0)==0){HEAP32[16985]=r5|r30;HEAP32[r6>>2]=r17;HEAP32[r12+(r31+6)]=r6;HEAP32[r12+(r31+3)]=r17;HEAP32[r12+(r31+2)]=r17;break}if((r48|0)==31){r49=0}else{r49=25-(r48>>>1)|0}r30=r39<<r49;r5=HEAP32[r6>>2];while(1){if((HEAP32[r5+4>>2]&-8|0)==(r39|0)){break}r50=(r30>>>31<<2)+r5+16|0;r6=HEAP32[r50>>2];if((r6|0)==0){r2=1825;break}else{r30=r30<<1;r5=r6}}if(r2==1825){if(r50>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r50>>2]=r17;HEAP32[r12+(r31+6)]=r5;HEAP32[r12+(r31+3)]=r17;HEAP32[r12+(r31+2)]=r17;break}}r30=r5+8|0;r6=HEAP32[r30>>2];r13=HEAP32[16988];if(r5>>>0<r13>>>0){_abort()}if(r6>>>0<r13>>>0){_abort()}else{HEAP32[r6+12>>2]=r17;HEAP32[r30>>2]=r17;HEAP32[r12+(r31+2)]=r6;HEAP32[r12+(r31+3)]=r5;HEAP32[r12+(r31+6)]=0;break}}}while(0);r31=r40+8|0;if((r31|0)==0){r15=r7,r16=r15>>2;break}else{r14=r31}return r14}}while(0);r40=HEAP32[16986];if(r15>>>0<=r40>>>0){r50=r40-r15|0;r39=HEAP32[16989];if(r50>>>0>15){r49=r39;HEAP32[16989]=r49+r15|0;HEAP32[16986]=r50;HEAP32[(r49+4>>2)+r16]=r50|1;HEAP32[r49+r40>>2]=r50;HEAP32[r39+4>>2]=r15|3}else{HEAP32[16986]=0;HEAP32[16989]=0;HEAP32[r39+4>>2]=r40|3;r50=r40+(r39+4)|0;HEAP32[r50>>2]=HEAP32[r50>>2]|1}r14=r39+8|0;return r14}r39=HEAP32[16987];if(r15>>>0<r39>>>0){r50=r39-r15|0;HEAP32[16987]=r50;r39=HEAP32[16990];r40=r39;HEAP32[16990]=r40+r15|0;HEAP32[(r40+4>>2)+r16]=r50|1;HEAP32[r39+4>>2]=r15|3;r14=r39+8|0;return r14}do{if((HEAP32[16450]|0)==0){r39=_sysconf(8);if((r39-1&r39|0)==0){HEAP32[16452]=r39;HEAP32[16451]=r39;HEAP32[16453]=-1;HEAP32[16454]=2097152;HEAP32[16455]=0;HEAP32[17095]=0;r39=_time(0)&-16^1431655768;HEAP32[16450]=r39;break}else{_abort()}}}while(0);r39=r15+48|0;r50=HEAP32[16452];r40=r15+47|0;r49=r50+r40|0;r48=-r50|0;r50=r49&r48;if(r50>>>0<=r15>>>0){r14=0;return r14}r46=HEAP32[17094];do{if((r46|0)!=0){r47=HEAP32[17092];r41=r47+r50|0;if(r41>>>0<=r47>>>0|r41>>>0>r46>>>0){r14=0}else{break}return r14}}while(0);L2571:do{if((HEAP32[17095]&4|0)==0){r46=HEAP32[16990];L2573:do{if((r46|0)==0){r2=1855}else{r41=r46;r47=68384;while(1){r51=r47|0;r42=HEAP32[r51>>2];if(r42>>>0<=r41>>>0){r52=r47+4|0;if((r42+HEAP32[r52>>2]|0)>>>0>r41>>>0){break}}r42=HEAP32[r47+8>>2];if((r42|0)==0){r2=1855;break L2573}else{r47=r42}}if((r47|0)==0){r2=1855;break}r41=r49-HEAP32[16987]&r48;if(r41>>>0>=2147483647){r53=0;break}r5=_sbrk(r41);r17=(r5|0)==(HEAP32[r51>>2]+HEAP32[r52>>2]|0);r54=r17?r5:-1;r55=r17?r41:0;r56=r5;r57=r41;r2=1864;break}}while(0);do{if(r2==1855){r46=_sbrk(0);if((r46|0)==-1){r53=0;break}r7=r46;r41=HEAP32[16451];r5=r41-1|0;if((r5&r7|0)==0){r58=r50}else{r58=r50-r7+(r5+r7&-r41)|0}r41=HEAP32[17092];r7=r41+r58|0;if(!(r58>>>0>r15>>>0&r58>>>0<2147483647)){r53=0;break}r5=HEAP32[17094];if((r5|0)!=0){if(r7>>>0<=r41>>>0|r7>>>0>r5>>>0){r53=0;break}}r5=_sbrk(r58);r7=(r5|0)==(r46|0);r54=r7?r46:-1;r55=r7?r58:0;r56=r5;r57=r58;r2=1864;break}}while(0);L2593:do{if(r2==1864){r5=-r57|0;if((r54|0)!=-1){r59=r55,r60=r59>>2;r61=r54,r62=r61>>2;r2=1875;break L2571}do{if((r56|0)!=-1&r57>>>0<2147483647&r57>>>0<r39>>>0){r7=HEAP32[16452];r46=r40-r57+r7&-r7;if(r46>>>0>=2147483647){r63=r57;break}if((_sbrk(r46)|0)==-1){_sbrk(r5);r53=r55;break L2593}else{r63=r46+r57|0;break}}else{r63=r57}}while(0);if((r56|0)==-1){r53=r55}else{r59=r63,r60=r59>>2;r61=r56,r62=r61>>2;r2=1875;break L2571}}}while(0);HEAP32[17095]=HEAP32[17095]|4;r64=r53;r2=1872;break}else{r64=0;r2=1872}}while(0);do{if(r2==1872){if(r50>>>0>=2147483647){break}r53=_sbrk(r50);r56=_sbrk(0);if(!((r56|0)!=-1&(r53|0)!=-1&r53>>>0<r56>>>0)){break}r63=r56-r53|0;r56=r63>>>0>(r15+40|0)>>>0;r55=r56?r53:-1;if((r55|0)==-1){break}else{r59=r56?r63:r64,r60=r59>>2;r61=r55,r62=r61>>2;r2=1875;break}}}while(0);do{if(r2==1875){r64=HEAP32[17092]+r59|0;HEAP32[17092]=r64;if(r64>>>0>HEAP32[17093]>>>0){HEAP32[17093]=r64}r64=HEAP32[16990],r50=r64>>2;L2613:do{if((r64|0)==0){r55=HEAP32[16988];if((r55|0)==0|r61>>>0<r55>>>0){HEAP32[16988]=r61}HEAP32[17096]=r61;HEAP32[17097]=r59;HEAP32[17099]=0;HEAP32[16993]=HEAP32[16450];HEAP32[16992]=-1;r55=0;while(1){r63=r55<<1;r56=(r63<<2)+67976|0;HEAP32[(r63+3<<2)+67976>>2]=r56;HEAP32[(r63+2<<2)+67976>>2]=r56;r56=r55+1|0;if((r56|0)==32){break}else{r55=r56}}r55=r61+8|0;if((r55&7|0)==0){r65=0}else{r65=-r55&7}r55=r59-40-r65|0;HEAP32[16990]=r61+r65|0;HEAP32[16987]=r55;HEAP32[(r65+4>>2)+r62]=r55|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[16991]=HEAP32[16454]}else{r55=68384,r56=r55>>2;while(1){r66=HEAP32[r56];r67=r55+4|0;r68=HEAP32[r67>>2];if((r61|0)==(r66+r68|0)){r2=1887;break}r63=HEAP32[r56+2];if((r63|0)==0){break}else{r55=r63,r56=r55>>2}}do{if(r2==1887){if((HEAP32[r56+3]&8|0)!=0){break}r55=r64;if(!(r55>>>0>=r66>>>0&r55>>>0<r61>>>0)){break}HEAP32[r67>>2]=r68+r59|0;r55=HEAP32[16990];r63=HEAP32[16987]+r59|0;r53=r55;r57=r55+8|0;if((r57&7|0)==0){r69=0}else{r69=-r57&7}r57=r63-r69|0;HEAP32[16990]=r53+r69|0;HEAP32[16987]=r57;HEAP32[r69+(r53+4)>>2]=r57|1;HEAP32[r63+(r53+4)>>2]=40;HEAP32[16991]=HEAP32[16454];break L2613}}while(0);if(r61>>>0<HEAP32[16988]>>>0){HEAP32[16988]=r61}r56=r61+r59|0;r53=68384;while(1){r70=r53|0;if((HEAP32[r70>>2]|0)==(r56|0)){r2=1897;break}r63=HEAP32[r53+8>>2];if((r63|0)==0){break}else{r53=r63}}do{if(r2==1897){if((HEAP32[r53+12>>2]&8|0)!=0){break}HEAP32[r70>>2]=r61;r56=r53+4|0;HEAP32[r56>>2]=HEAP32[r56>>2]+r59|0;r56=r61+8|0;if((r56&7|0)==0){r71=0}else{r71=-r56&7}r56=r59+(r61+8)|0;if((r56&7|0)==0){r72=0,r73=r72>>2}else{r72=-r56&7,r73=r72>>2}r56=r61+r72+r59|0;r63=r56;r57=r71+r15|0,r55=r57>>2;r40=r61+r57|0;r57=r40;r39=r56-(r61+r71)-r15|0;HEAP32[(r71+4>>2)+r62]=r15|3;do{if((r63|0)==(HEAP32[16990]|0)){r54=HEAP32[16987]+r39|0;HEAP32[16987]=r54;HEAP32[16990]=r57;HEAP32[r55+(r62+1)]=r54|1}else{if((r63|0)==(HEAP32[16989]|0)){r54=HEAP32[16986]+r39|0;HEAP32[16986]=r54;HEAP32[16989]=r57;HEAP32[r55+(r62+1)]=r54|1;HEAP32[(r54>>2)+r62+r55]=r54;break}r54=r59+4|0;r58=HEAP32[(r54>>2)+r62+r73];if((r58&3|0)==1){r52=r58&-8;r51=r58>>>3;L2658:do{if(r58>>>0<256){r48=HEAP32[((r72|8)>>2)+r62+r60];r49=HEAP32[r73+(r62+(r60+3))];r5=(r51<<3)+67976|0;do{if((r48|0)!=(r5|0)){if(r48>>>0<HEAP32[16988]>>>0){_abort()}if((HEAP32[r48+12>>2]|0)==(r63|0)){break}_abort()}}while(0);if((r49|0)==(r48|0)){HEAP32[16984]=HEAP32[16984]&(1<<r51^-1);break}do{if((r49|0)==(r5|0)){r74=r49+8|0}else{if(r49>>>0<HEAP32[16988]>>>0){_abort()}r47=r49+8|0;if((HEAP32[r47>>2]|0)==(r63|0)){r74=r47;break}_abort()}}while(0);HEAP32[r48+12>>2]=r49;HEAP32[r74>>2]=r48}else{r5=r56;r47=HEAP32[((r72|24)>>2)+r62+r60];r46=HEAP32[r73+(r62+(r60+3))];L2679:do{if((r46|0)==(r5|0)){r7=r72|16;r41=r61+r54+r7|0;r17=HEAP32[r41>>2];do{if((r17|0)==0){r42=r61+r7+r59|0;r43=HEAP32[r42>>2];if((r43|0)==0){r75=0,r76=r75>>2;break L2679}else{r77=r43;r78=r42;break}}else{r77=r17;r78=r41}}while(0);while(1){r41=r77+20|0;r17=HEAP32[r41>>2];if((r17|0)!=0){r77=r17;r78=r41;continue}r41=r77+16|0;r17=HEAP32[r41>>2];if((r17|0)==0){break}else{r77=r17;r78=r41}}if(r78>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r78>>2]=0;r75=r77,r76=r75>>2;break}}else{r41=HEAP32[((r72|8)>>2)+r62+r60];if(r41>>>0<HEAP32[16988]>>>0){_abort()}r17=r41+12|0;if((HEAP32[r17>>2]|0)!=(r5|0)){_abort()}r7=r46+8|0;if((HEAP32[r7>>2]|0)==(r5|0)){HEAP32[r17>>2]=r46;HEAP32[r7>>2]=r41;r75=r46,r76=r75>>2;break}else{_abort()}}}while(0);if((r47|0)==0){break}r46=r72+(r61+(r59+28))|0;r48=(HEAP32[r46>>2]<<2)+68240|0;do{if((r5|0)==(HEAP32[r48>>2]|0)){HEAP32[r48>>2]=r75;if((r75|0)!=0){break}HEAP32[16985]=HEAP32[16985]&(1<<HEAP32[r46>>2]^-1);break L2658}else{if(r47>>>0<HEAP32[16988]>>>0){_abort()}r49=r47+16|0;if((HEAP32[r49>>2]|0)==(r5|0)){HEAP32[r49>>2]=r75}else{HEAP32[r47+20>>2]=r75}if((r75|0)==0){break L2658}}}while(0);if(r75>>>0<HEAP32[16988]>>>0){_abort()}HEAP32[r76+6]=r47;r5=r72|16;r46=HEAP32[(r5>>2)+r62+r60];do{if((r46|0)!=0){if(r46>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r76+4]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r46=HEAP32[(r54+r5>>2)+r62];if((r46|0)==0){break}if(r46>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r76+5]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r79=r61+(r52|r72)+r59|0;r80=r52+r39|0}else{r79=r63;r80=r39}r54=r79+4|0;HEAP32[r54>>2]=HEAP32[r54>>2]&-2;HEAP32[r55+(r62+1)]=r80|1;HEAP32[(r80>>2)+r62+r55]=r80;r54=r80>>>3;if(r80>>>0<256){r51=r54<<1;r58=(r51<<2)+67976|0;r46=HEAP32[16984];r47=1<<r54;do{if((r46&r47|0)==0){HEAP32[16984]=r46|r47;r81=r58;r82=(r51+2<<2)+67976|0}else{r54=(r51+2<<2)+67976|0;r48=HEAP32[r54>>2];if(r48>>>0>=HEAP32[16988]>>>0){r81=r48;r82=r54;break}_abort()}}while(0);HEAP32[r82>>2]=r57;HEAP32[r81+12>>2]=r57;HEAP32[r55+(r62+2)]=r81;HEAP32[r55+(r62+3)]=r58;break}r51=r40;r47=r80>>>8;do{if((r47|0)==0){r83=0}else{if(r80>>>0>16777215){r83=31;break}r46=(r47+1048320|0)>>>16&8;r52=r47<<r46;r54=(r52+520192|0)>>>16&4;r48=r52<<r54;r52=(r48+245760|0)>>>16&2;r49=14-(r54|r46|r52)+(r48<<r52>>>15)|0;r83=r80>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r83<<2)+68240|0;HEAP32[r55+(r62+7)]=r83;HEAP32[r55+(r62+5)]=0;HEAP32[r55+(r62+4)]=0;r58=HEAP32[16985];r49=1<<r83;if((r58&r49|0)==0){HEAP32[16985]=r58|r49;HEAP32[r47>>2]=r51;HEAP32[r55+(r62+6)]=r47;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}if((r83|0)==31){r84=0}else{r84=25-(r83>>>1)|0}r49=r80<<r84;r58=HEAP32[r47>>2];while(1){if((HEAP32[r58+4>>2]&-8|0)==(r80|0)){break}r85=(r49>>>31<<2)+r58+16|0;r47=HEAP32[r85>>2];if((r47|0)==0){r2=1970;break}else{r49=r49<<1;r58=r47}}if(r2==1970){if(r85>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r85>>2]=r51;HEAP32[r55+(r62+6)]=r58;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}}r49=r58+8|0;r47=HEAP32[r49>>2];r52=HEAP32[16988];if(r58>>>0<r52>>>0){_abort()}if(r47>>>0<r52>>>0){_abort()}else{HEAP32[r47+12>>2]=r51;HEAP32[r49>>2]=r51;HEAP32[r55+(r62+2)]=r47;HEAP32[r55+(r62+3)]=r58;HEAP32[r55+(r62+6)]=0;break}}}while(0);r14=r61+(r71|8)|0;return r14}}while(0);r53=r64;r55=68384,r40=r55>>2;while(1){r86=HEAP32[r40];if(r86>>>0<=r53>>>0){r87=HEAP32[r40+1];r88=r86+r87|0;if(r88>>>0>r53>>>0){break}}r55=HEAP32[r40+2],r40=r55>>2}r55=r86+(r87-39)|0;if((r55&7|0)==0){r89=0}else{r89=-r55&7}r55=r86+(r87-47)+r89|0;r40=r55>>>0<(r64+16|0)>>>0?r53:r55;r55=r40+8|0,r57=r55>>2;r39=r61+8|0;if((r39&7|0)==0){r90=0}else{r90=-r39&7}r39=r59-40-r90|0;HEAP32[16990]=r61+r90|0;HEAP32[16987]=r39;HEAP32[(r90+4>>2)+r62]=r39|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[16991]=HEAP32[16454];HEAP32[r40+4>>2]=27;HEAP32[r57]=HEAP32[17096];HEAP32[r57+1]=HEAP32[17097];HEAP32[r57+2]=HEAP32[17098];HEAP32[r57+3]=HEAP32[17099];HEAP32[17096]=r61;HEAP32[17097]=r59;HEAP32[17099]=0;HEAP32[17098]=r55;r55=r40+28|0;HEAP32[r55>>2]=7;L2777:do{if((r40+32|0)>>>0<r88>>>0){r57=r55;while(1){r39=r57+4|0;HEAP32[r39>>2]=7;if((r57+8|0)>>>0<r88>>>0){r57=r39}else{break L2777}}}}while(0);if((r40|0)==(r53|0)){break}r55=r40-r64|0;r57=r55+(r53+4)|0;HEAP32[r57>>2]=HEAP32[r57>>2]&-2;HEAP32[r50+1]=r55|1;HEAP32[r53+r55>>2]=r55;r57=r55>>>3;if(r55>>>0<256){r39=r57<<1;r63=(r39<<2)+67976|0;r56=HEAP32[16984];r47=1<<r57;do{if((r56&r47|0)==0){HEAP32[16984]=r56|r47;r91=r63;r92=(r39+2<<2)+67976|0}else{r57=(r39+2<<2)+67976|0;r49=HEAP32[r57>>2];if(r49>>>0>=HEAP32[16988]>>>0){r91=r49;r92=r57;break}_abort()}}while(0);HEAP32[r92>>2]=r64;HEAP32[r91+12>>2]=r64;HEAP32[r50+2]=r91;HEAP32[r50+3]=r63;break}r39=r64;r47=r55>>>8;do{if((r47|0)==0){r93=0}else{if(r55>>>0>16777215){r93=31;break}r56=(r47+1048320|0)>>>16&8;r53=r47<<r56;r40=(r53+520192|0)>>>16&4;r57=r53<<r40;r53=(r57+245760|0)>>>16&2;r49=14-(r40|r56|r53)+(r57<<r53>>>15)|0;r93=r55>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r93<<2)+68240|0;HEAP32[r50+7]=r93;HEAP32[r50+5]=0;HEAP32[r50+4]=0;r63=HEAP32[16985];r49=1<<r93;if((r63&r49|0)==0){HEAP32[16985]=r63|r49;HEAP32[r47>>2]=r39;HEAP32[r50+6]=r47;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}if((r93|0)==31){r94=0}else{r94=25-(r93>>>1)|0}r49=r55<<r94;r63=HEAP32[r47>>2];while(1){if((HEAP32[r63+4>>2]&-8|0)==(r55|0)){break}r95=(r49>>>31<<2)+r63+16|0;r47=HEAP32[r95>>2];if((r47|0)==0){r2=2005;break}else{r49=r49<<1;r63=r47}}if(r2==2005){if(r95>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r95>>2]=r39;HEAP32[r50+6]=r63;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}}r49=r63+8|0;r55=HEAP32[r49>>2];r47=HEAP32[16988];if(r63>>>0<r47>>>0){_abort()}if(r55>>>0<r47>>>0){_abort()}else{HEAP32[r55+12>>2]=r39;HEAP32[r49>>2]=r39;HEAP32[r50+2]=r55;HEAP32[r50+3]=r63;HEAP32[r50+6]=0;break}}}while(0);r50=HEAP32[16987];if(r50>>>0<=r15>>>0){break}r64=r50-r15|0;HEAP32[16987]=r64;r50=HEAP32[16990];r55=r50;HEAP32[16990]=r55+r15|0;HEAP32[(r55+4>>2)+r16]=r64|1;HEAP32[r50+4>>2]=r15|3;r14=r50+8|0;return r14}}while(0);r15=___errno_location();HEAP32[r15>>2]=12;r14=0;return r14}function _free(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r2=r1>>2;r3=0;if((r1|0)==0){return}r4=r1-8|0;r5=r4;r6=HEAP32[16988];if(r4>>>0<r6>>>0){_abort()}r7=HEAP32[r1-4>>2];r8=r7&3;if((r8|0)==1){_abort()}r9=r7&-8,r10=r9>>2;r11=r1+(r9-8)|0;r12=r11;L2830:do{if((r7&1|0)==0){r13=HEAP32[r4>>2];if((r8|0)==0){return}r14=-8-r13|0,r15=r14>>2;r16=r1+r14|0;r17=r16;r18=r13+r9|0;if(r16>>>0<r6>>>0){_abort()}if((r17|0)==(HEAP32[16989]|0)){r19=(r1+(r9-4)|0)>>2;if((HEAP32[r19]&3|0)!=3){r20=r17,r21=r20>>2;r22=r18;break}HEAP32[16986]=r18;HEAP32[r19]=HEAP32[r19]&-2;HEAP32[r15+(r2+1)]=r18|1;HEAP32[r11>>2]=r18;return}r19=r13>>>3;if(r13>>>0<256){r13=HEAP32[r15+(r2+2)];r23=HEAP32[r15+(r2+3)];r24=(r19<<3)+67976|0;do{if((r13|0)!=(r24|0)){if(r13>>>0<r6>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r17|0)){break}_abort()}}while(0);if((r23|0)==(r13|0)){HEAP32[16984]=HEAP32[16984]&(1<<r19^-1);r20=r17,r21=r20>>2;r22=r18;break}do{if((r23|0)==(r24|0)){r25=r23+8|0}else{if(r23>>>0<r6>>>0){_abort()}r26=r23+8|0;if((HEAP32[r26>>2]|0)==(r17|0)){r25=r26;break}_abort()}}while(0);HEAP32[r13+12>>2]=r23;HEAP32[r25>>2]=r13;r20=r17,r21=r20>>2;r22=r18;break}r24=r16;r19=HEAP32[r15+(r2+6)];r26=HEAP32[r15+(r2+3)];L2864:do{if((r26|0)==(r24|0)){r27=r14+(r1+20)|0;r28=HEAP32[r27>>2];do{if((r28|0)==0){r29=r14+(r1+16)|0;r30=HEAP32[r29>>2];if((r30|0)==0){r31=0,r32=r31>>2;break L2864}else{r33=r30;r34=r29;break}}else{r33=r28;r34=r27}}while(0);while(1){r27=r33+20|0;r28=HEAP32[r27>>2];if((r28|0)!=0){r33=r28;r34=r27;continue}r27=r33+16|0;r28=HEAP32[r27>>2];if((r28|0)==0){break}else{r33=r28;r34=r27}}if(r34>>>0<r6>>>0){_abort()}else{HEAP32[r34>>2]=0;r31=r33,r32=r31>>2;break}}else{r27=HEAP32[r15+(r2+2)];if(r27>>>0<r6>>>0){_abort()}r28=r27+12|0;if((HEAP32[r28>>2]|0)!=(r24|0)){_abort()}r29=r26+8|0;if((HEAP32[r29>>2]|0)==(r24|0)){HEAP32[r28>>2]=r26;HEAP32[r29>>2]=r27;r31=r26,r32=r31>>2;break}else{_abort()}}}while(0);if((r19|0)==0){r20=r17,r21=r20>>2;r22=r18;break}r26=r14+(r1+28)|0;r16=(HEAP32[r26>>2]<<2)+68240|0;do{if((r24|0)==(HEAP32[r16>>2]|0)){HEAP32[r16>>2]=r31;if((r31|0)!=0){break}HEAP32[16985]=HEAP32[16985]&(1<<HEAP32[r26>>2]^-1);r20=r17,r21=r20>>2;r22=r18;break L2830}else{if(r19>>>0<HEAP32[16988]>>>0){_abort()}r13=r19+16|0;if((HEAP32[r13>>2]|0)==(r24|0)){HEAP32[r13>>2]=r31}else{HEAP32[r19+20>>2]=r31}if((r31|0)==0){r20=r17,r21=r20>>2;r22=r18;break L2830}}}while(0);if(r31>>>0<HEAP32[16988]>>>0){_abort()}HEAP32[r32+6]=r19;r24=HEAP32[r15+(r2+4)];do{if((r24|0)!=0){if(r24>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r32+4]=r24;HEAP32[r24+24>>2]=r31;break}}}while(0);r24=HEAP32[r15+(r2+5)];if((r24|0)==0){r20=r17,r21=r20>>2;r22=r18;break}if(r24>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r32+5]=r24;HEAP32[r24+24>>2]=r31;r20=r17,r21=r20>>2;r22=r18;break}}else{r20=r5,r21=r20>>2;r22=r9}}while(0);r5=r20,r31=r5>>2;if(r5>>>0>=r11>>>0){_abort()}r5=r1+(r9-4)|0;r32=HEAP32[r5>>2];if((r32&1|0)==0){_abort()}do{if((r32&2|0)==0){if((r12|0)==(HEAP32[16990]|0)){r6=HEAP32[16987]+r22|0;HEAP32[16987]=r6;HEAP32[16990]=r20;HEAP32[r21+1]=r6|1;if((r20|0)==(HEAP32[16989]|0)){HEAP32[16989]=0;HEAP32[16986]=0}if(r6>>>0<=HEAP32[16991]>>>0){return}_sys_trim(0);return}if((r12|0)==(HEAP32[16989]|0)){r6=HEAP32[16986]+r22|0;HEAP32[16986]=r6;HEAP32[16989]=r20;HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;return}r6=(r32&-8)+r22|0;r33=r32>>>3;L2936:do{if(r32>>>0<256){r34=HEAP32[r2+r10];r25=HEAP32[((r9|4)>>2)+r2];r8=(r33<<3)+67976|0;do{if((r34|0)!=(r8|0)){if(r34>>>0<HEAP32[16988]>>>0){_abort()}if((HEAP32[r34+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r25|0)==(r34|0)){HEAP32[16984]=HEAP32[16984]&(1<<r33^-1);break}do{if((r25|0)==(r8|0)){r35=r25+8|0}else{if(r25>>>0<HEAP32[16988]>>>0){_abort()}r4=r25+8|0;if((HEAP32[r4>>2]|0)==(r12|0)){r35=r4;break}_abort()}}while(0);HEAP32[r34+12>>2]=r25;HEAP32[r35>>2]=r34}else{r8=r11;r4=HEAP32[r10+(r2+4)];r7=HEAP32[((r9|4)>>2)+r2];L2938:do{if((r7|0)==(r8|0)){r24=r9+(r1+12)|0;r19=HEAP32[r24>>2];do{if((r19|0)==0){r26=r9+(r1+8)|0;r16=HEAP32[r26>>2];if((r16|0)==0){r36=0,r37=r36>>2;break L2938}else{r38=r16;r39=r26;break}}else{r38=r19;r39=r24}}while(0);while(1){r24=r38+20|0;r19=HEAP32[r24>>2];if((r19|0)!=0){r38=r19;r39=r24;continue}r24=r38+16|0;r19=HEAP32[r24>>2];if((r19|0)==0){break}else{r38=r19;r39=r24}}if(r39>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r39>>2]=0;r36=r38,r37=r36>>2;break}}else{r24=HEAP32[r2+r10];if(r24>>>0<HEAP32[16988]>>>0){_abort()}r19=r24+12|0;if((HEAP32[r19>>2]|0)!=(r8|0)){_abort()}r26=r7+8|0;if((HEAP32[r26>>2]|0)==(r8|0)){HEAP32[r19>>2]=r7;HEAP32[r26>>2]=r24;r36=r7,r37=r36>>2;break}else{_abort()}}}while(0);if((r4|0)==0){break}r7=r9+(r1+20)|0;r34=(HEAP32[r7>>2]<<2)+68240|0;do{if((r8|0)==(HEAP32[r34>>2]|0)){HEAP32[r34>>2]=r36;if((r36|0)!=0){break}HEAP32[16985]=HEAP32[16985]&(1<<HEAP32[r7>>2]^-1);break L2936}else{if(r4>>>0<HEAP32[16988]>>>0){_abort()}r25=r4+16|0;if((HEAP32[r25>>2]|0)==(r8|0)){HEAP32[r25>>2]=r36}else{HEAP32[r4+20>>2]=r36}if((r36|0)==0){break L2936}}}while(0);if(r36>>>0<HEAP32[16988]>>>0){_abort()}HEAP32[r37+6]=r4;r8=HEAP32[r10+(r2+2)];do{if((r8|0)!=0){if(r8>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r37+4]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);r8=HEAP32[r10+(r2+3)];if((r8|0)==0){break}if(r8>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r37+5]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;if((r20|0)!=(HEAP32[16989]|0)){r40=r6;break}HEAP32[16986]=r6;return}else{HEAP32[r5>>2]=r32&-2;HEAP32[r21+1]=r22|1;HEAP32[(r22>>2)+r31]=r22;r40=r22}}while(0);r22=r40>>>3;if(r40>>>0<256){r31=r22<<1;r32=(r31<<2)+67976|0;r5=HEAP32[16984];r36=1<<r22;do{if((r5&r36|0)==0){HEAP32[16984]=r5|r36;r41=r32;r42=(r31+2<<2)+67976|0}else{r22=(r31+2<<2)+67976|0;r37=HEAP32[r22>>2];if(r37>>>0>=HEAP32[16988]>>>0){r41=r37;r42=r22;break}_abort()}}while(0);HEAP32[r42>>2]=r20;HEAP32[r41+12>>2]=r20;HEAP32[r21+2]=r41;HEAP32[r21+3]=r32;return}r32=r20;r41=r40>>>8;do{if((r41|0)==0){r43=0}else{if(r40>>>0>16777215){r43=31;break}r42=(r41+1048320|0)>>>16&8;r31=r41<<r42;r36=(r31+520192|0)>>>16&4;r5=r31<<r36;r31=(r5+245760|0)>>>16&2;r22=14-(r36|r42|r31)+(r5<<r31>>>15)|0;r43=r40>>>((r22+7|0)>>>0)&1|r22<<1}}while(0);r41=(r43<<2)+68240|0;HEAP32[r21+7]=r43;HEAP32[r21+5]=0;HEAP32[r21+4]=0;r22=HEAP32[16985];r31=1<<r43;do{if((r22&r31|0)==0){HEAP32[16985]=r22|r31;HEAP32[r41>>2]=r32;HEAP32[r21+6]=r41;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20}else{if((r43|0)==31){r44=0}else{r44=25-(r43>>>1)|0}r5=r40<<r44;r42=HEAP32[r41>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r40|0)){break}r45=(r5>>>31<<2)+r42+16|0;r36=HEAP32[r45>>2];if((r36|0)==0){r3=2184;break}else{r5=r5<<1;r42=r36}}if(r3==2184){if(r45>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r45>>2]=r32;HEAP32[r21+6]=r42;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20;break}}r5=r42+8|0;r6=HEAP32[r5>>2];r36=HEAP32[16988];if(r42>>>0<r36>>>0){_abort()}if(r6>>>0<r36>>>0){_abort()}else{HEAP32[r6+12>>2]=r32;HEAP32[r5>>2]=r32;HEAP32[r21+2]=r6;HEAP32[r21+3]=r42;HEAP32[r21+6]=0;break}}}while(0);r21=HEAP32[16992]-1|0;HEAP32[16992]=r21;if((r21|0)==0){r46=68392}else{return}while(1){r21=HEAP32[r46>>2];if((r21|0)==0){break}else{r46=r21+8|0}}HEAP32[16992]=-1;return}function _realloc(r1,r2){var r3,r4,r5,r6;if((r1|0)==0){r3=_malloc(r2);return r3}if(r2>>>0>4294967231){r4=___errno_location();HEAP32[r4>>2]=12;r3=0;return r3}if(r2>>>0<11){r5=16}else{r5=r2+11&-8}r4=_try_realloc_chunk(r1-8|0,r5);if((r4|0)!=0){r3=r4+8|0;return r3}r4=_malloc(r2);if((r4|0)==0){r3=0;return r3}r5=HEAP32[r1-4>>2];r6=(r5&-8)-((r5&3|0)==0?8:4)|0;_memcpy(r4,r1,r6>>>0<r2>>>0?r6:r2);_free(r1);r3=r4;return r3}function _sys_trim(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;do{if((HEAP32[16450]|0)==0){r2=_sysconf(8);if((r2-1&r2|0)==0){HEAP32[16452]=r2;HEAP32[16451]=r2;HEAP32[16453]=-1;HEAP32[16454]=2097152;HEAP32[16455]=0;HEAP32[17095]=0;r2=_time(0)&-16^1431655768;HEAP32[16450]=r2;break}else{_abort()}}}while(0);if(r1>>>0>=4294967232){r3=0;r4=r3&1;return r4}r2=HEAP32[16990];if((r2|0)==0){r3=0;r4=r3&1;return r4}r5=HEAP32[16987];do{if(r5>>>0>(r1+40|0)>>>0){r6=HEAP32[16452];r7=Math.imul(Math.floor(((-40-r1-1+r5+r6|0)>>>0)/(r6>>>0))-1|0,r6);r8=r2;r9=68384,r10=r9>>2;while(1){r11=HEAP32[r10];if(r11>>>0<=r8>>>0){if((r11+HEAP32[r10+1]|0)>>>0>r8>>>0){r12=r9;break}}r11=HEAP32[r10+2];if((r11|0)==0){r12=0;break}else{r9=r11,r10=r9>>2}}if((HEAP32[r12+12>>2]&8|0)!=0){break}r9=_sbrk(0);r10=(r12+4|0)>>2;if((r9|0)!=(HEAP32[r12>>2]+HEAP32[r10]|0)){break}r8=_sbrk(-(r7>>>0>2147483646?-2147483648-r6|0:r7)|0);r11=_sbrk(0);if(!((r8|0)!=-1&r11>>>0<r9>>>0)){break}r8=r9-r11|0;if((r9|0)==(r11|0)){break}HEAP32[r10]=HEAP32[r10]-r8|0;HEAP32[17092]=HEAP32[17092]-r8|0;r10=HEAP32[16990];r13=HEAP32[16987]-r8|0;r8=r10;r14=r10+8|0;if((r14&7|0)==0){r15=0}else{r15=-r14&7}r14=r13-r15|0;HEAP32[16990]=r8+r15|0;HEAP32[16987]=r14;HEAP32[r15+(r8+4)>>2]=r14|1;HEAP32[r13+(r8+4)>>2]=40;HEAP32[16991]=HEAP32[16454];r3=(r9|0)!=(r11|0);r4=r3&1;return r4}}while(0);if(HEAP32[16987]>>>0<=HEAP32[16991]>>>0){r3=0;r4=r3&1;return r4}HEAP32[16991]=-1;r3=0;r4=r3&1;return r4}function _try_realloc_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29;r3=(r1+4|0)>>2;r4=HEAP32[r3];r5=r4&-8,r6=r5>>2;r7=r1,r8=r7>>2;r9=r7+r5|0;r10=r9;r11=HEAP32[16988];if(r7>>>0<r11>>>0){_abort()}r12=r4&3;if(!((r12|0)!=1&r7>>>0<r9>>>0)){_abort()}r13=(r7+(r5|4)|0)>>2;r14=HEAP32[r13];if((r14&1|0)==0){_abort()}if((r12|0)==0){if(r2>>>0<256){r15=0;return r15}do{if(r5>>>0>=(r2+4|0)>>>0){if((r5-r2|0)>>>0>HEAP32[16452]<<1>>>0){break}else{r15=r1}return r15}}while(0);r15=0;return r15}if(r5>>>0>=r2>>>0){r12=r5-r2|0;if(r12>>>0<=15){r15=r1;return r15}HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|3;HEAP32[r13]=HEAP32[r13]|1;_dispose_chunk(r7+r2|0,r12);r15=r1;return r15}if((r10|0)==(HEAP32[16990]|0)){r12=HEAP32[16987]+r5|0;if(r12>>>0<=r2>>>0){r15=0;return r15}r13=r12-r2|0;HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r13|1;HEAP32[16990]=r7+r2|0;HEAP32[16987]=r13;r15=r1;return r15}if((r10|0)==(HEAP32[16989]|0)){r13=HEAP32[16986]+r5|0;if(r13>>>0<r2>>>0){r15=0;return r15}r12=r13-r2|0;if(r12>>>0>15){HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|1;HEAP32[(r13>>2)+r8]=r12;r16=r13+(r7+4)|0;HEAP32[r16>>2]=HEAP32[r16>>2]&-2;r17=r7+r2|0;r18=r12}else{HEAP32[r3]=r4&1|r13|2;r4=r13+(r7+4)|0;HEAP32[r4>>2]=HEAP32[r4>>2]|1;r17=0;r18=0}HEAP32[16986]=r18;HEAP32[16989]=r17;r15=r1;return r15}if((r14&2|0)!=0){r15=0;return r15}r17=(r14&-8)+r5|0;if(r17>>>0<r2>>>0){r15=0;return r15}r18=r17-r2|0;r4=r14>>>3;L3156:do{if(r14>>>0<256){r13=HEAP32[r6+(r8+2)];r12=HEAP32[r6+(r8+3)];r16=(r4<<3)+67976|0;do{if((r13|0)!=(r16|0)){if(r13>>>0<r11>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r10|0)){break}_abort()}}while(0);if((r12|0)==(r13|0)){HEAP32[16984]=HEAP32[16984]&(1<<r4^-1);break}do{if((r12|0)==(r16|0)){r19=r12+8|0}else{if(r12>>>0<r11>>>0){_abort()}r20=r12+8|0;if((HEAP32[r20>>2]|0)==(r10|0)){r19=r20;break}_abort()}}while(0);HEAP32[r13+12>>2]=r12;HEAP32[r19>>2]=r13}else{r16=r9;r20=HEAP32[r6+(r8+6)];r21=HEAP32[r6+(r8+3)];L3158:do{if((r21|0)==(r16|0)){r22=r5+(r7+20)|0;r23=HEAP32[r22>>2];do{if((r23|0)==0){r24=r5+(r7+16)|0;r25=HEAP32[r24>>2];if((r25|0)==0){r26=0,r27=r26>>2;break L3158}else{r28=r25;r29=r24;break}}else{r28=r23;r29=r22}}while(0);while(1){r22=r28+20|0;r23=HEAP32[r22>>2];if((r23|0)!=0){r28=r23;r29=r22;continue}r22=r28+16|0;r23=HEAP32[r22>>2];if((r23|0)==0){break}else{r28=r23;r29=r22}}if(r29>>>0<r11>>>0){_abort()}else{HEAP32[r29>>2]=0;r26=r28,r27=r26>>2;break}}else{r22=HEAP32[r6+(r8+2)];if(r22>>>0<r11>>>0){_abort()}r23=r22+12|0;if((HEAP32[r23>>2]|0)!=(r16|0)){_abort()}r24=r21+8|0;if((HEAP32[r24>>2]|0)==(r16|0)){HEAP32[r23>>2]=r21;HEAP32[r24>>2]=r22;r26=r21,r27=r26>>2;break}else{_abort()}}}while(0);if((r20|0)==0){break}r21=r5+(r7+28)|0;r13=(HEAP32[r21>>2]<<2)+68240|0;do{if((r16|0)==(HEAP32[r13>>2]|0)){HEAP32[r13>>2]=r26;if((r26|0)!=0){break}HEAP32[16985]=HEAP32[16985]&(1<<HEAP32[r21>>2]^-1);break L3156}else{if(r20>>>0<HEAP32[16988]>>>0){_abort()}r12=r20+16|0;if((HEAP32[r12>>2]|0)==(r16|0)){HEAP32[r12>>2]=r26}else{HEAP32[r20+20>>2]=r26}if((r26|0)==0){break L3156}}}while(0);if(r26>>>0<HEAP32[16988]>>>0){_abort()}HEAP32[r27+6]=r20;r16=HEAP32[r6+(r8+4)];do{if((r16|0)!=0){if(r16>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r27+4]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);r16=HEAP32[r6+(r8+5)];if((r16|0)==0){break}if(r16>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r27+5]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);if(r18>>>0<16){HEAP32[r3]=r17|HEAP32[r3]&1|2;r26=r7+(r17|4)|0;HEAP32[r26>>2]=HEAP32[r26>>2]|1;r15=r1;return r15}else{HEAP32[r3]=HEAP32[r3]&1|r2|2;HEAP32[(r2+4>>2)+r8]=r18|3;r8=r7+(r17|4)|0;HEAP32[r8>>2]=HEAP32[r8>>2]|1;_dispose_chunk(r7+r2|0,r18);r15=r1;return r15}}function _dispose_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43;r3=r2>>2;r4=0;r5=r1,r6=r5>>2;r7=r5+r2|0;r8=r7;r9=HEAP32[r1+4>>2];L3232:do{if((r9&1|0)==0){r10=HEAP32[r1>>2];if((r9&3|0)==0){return}r11=r5+ -r10|0;r12=r11;r13=r10+r2|0;r14=HEAP32[16988];if(r11>>>0<r14>>>0){_abort()}if((r12|0)==(HEAP32[16989]|0)){r15=(r2+(r5+4)|0)>>2;if((HEAP32[r15]&3|0)!=3){r16=r12,r17=r16>>2;r18=r13;break}HEAP32[16986]=r13;HEAP32[r15]=HEAP32[r15]&-2;HEAP32[(4-r10>>2)+r6]=r13|1;HEAP32[r7>>2]=r13;return}r15=r10>>>3;if(r10>>>0<256){r19=HEAP32[(8-r10>>2)+r6];r20=HEAP32[(12-r10>>2)+r6];r21=(r15<<3)+67976|0;do{if((r19|0)!=(r21|0)){if(r19>>>0<r14>>>0){_abort()}if((HEAP32[r19+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r20|0)==(r19|0)){HEAP32[16984]=HEAP32[16984]&(1<<r15^-1);r16=r12,r17=r16>>2;r18=r13;break}do{if((r20|0)==(r21|0)){r22=r20+8|0}else{if(r20>>>0<r14>>>0){_abort()}r23=r20+8|0;if((HEAP32[r23>>2]|0)==(r12|0)){r22=r23;break}_abort()}}while(0);HEAP32[r19+12>>2]=r20;HEAP32[r22>>2]=r19;r16=r12,r17=r16>>2;r18=r13;break}r21=r11;r15=HEAP32[(24-r10>>2)+r6];r23=HEAP32[(12-r10>>2)+r6];L3266:do{if((r23|0)==(r21|0)){r24=16-r10|0;r25=r24+(r5+4)|0;r26=HEAP32[r25>>2];do{if((r26|0)==0){r27=r5+r24|0;r28=HEAP32[r27>>2];if((r28|0)==0){r29=0,r30=r29>>2;break L3266}else{r31=r28;r32=r27;break}}else{r31=r26;r32=r25}}while(0);while(1){r25=r31+20|0;r26=HEAP32[r25>>2];if((r26|0)!=0){r31=r26;r32=r25;continue}r25=r31+16|0;r26=HEAP32[r25>>2];if((r26|0)==0){break}else{r31=r26;r32=r25}}if(r32>>>0<r14>>>0){_abort()}else{HEAP32[r32>>2]=0;r29=r31,r30=r29>>2;break}}else{r25=HEAP32[(8-r10>>2)+r6];if(r25>>>0<r14>>>0){_abort()}r26=r25+12|0;if((HEAP32[r26>>2]|0)!=(r21|0)){_abort()}r24=r23+8|0;if((HEAP32[r24>>2]|0)==(r21|0)){HEAP32[r26>>2]=r23;HEAP32[r24>>2]=r25;r29=r23,r30=r29>>2;break}else{_abort()}}}while(0);if((r15|0)==0){r16=r12,r17=r16>>2;r18=r13;break}r23=r5+(28-r10)|0;r14=(HEAP32[r23>>2]<<2)+68240|0;do{if((r21|0)==(HEAP32[r14>>2]|0)){HEAP32[r14>>2]=r29;if((r29|0)!=0){break}HEAP32[16985]=HEAP32[16985]&(1<<HEAP32[r23>>2]^-1);r16=r12,r17=r16>>2;r18=r13;break L3232}else{if(r15>>>0<HEAP32[16988]>>>0){_abort()}r11=r15+16|0;if((HEAP32[r11>>2]|0)==(r21|0)){HEAP32[r11>>2]=r29}else{HEAP32[r15+20>>2]=r29}if((r29|0)==0){r16=r12,r17=r16>>2;r18=r13;break L3232}}}while(0);if(r29>>>0<HEAP32[16988]>>>0){_abort()}HEAP32[r30+6]=r15;r21=16-r10|0;r23=HEAP32[(r21>>2)+r6];do{if((r23|0)!=0){if(r23>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r30+4]=r23;HEAP32[r23+24>>2]=r29;break}}}while(0);r23=HEAP32[(r21+4>>2)+r6];if((r23|0)==0){r16=r12,r17=r16>>2;r18=r13;break}if(r23>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r30+5]=r23;HEAP32[r23+24>>2]=r29;r16=r12,r17=r16>>2;r18=r13;break}}else{r16=r1,r17=r16>>2;r18=r2}}while(0);r1=HEAP32[16988];if(r7>>>0<r1>>>0){_abort()}r29=r2+(r5+4)|0;r30=HEAP32[r29>>2];do{if((r30&2|0)==0){if((r8|0)==(HEAP32[16990]|0)){r31=HEAP32[16987]+r18|0;HEAP32[16987]=r31;HEAP32[16990]=r16;HEAP32[r17+1]=r31|1;if((r16|0)!=(HEAP32[16989]|0)){return}HEAP32[16989]=0;HEAP32[16986]=0;return}if((r8|0)==(HEAP32[16989]|0)){r31=HEAP32[16986]+r18|0;HEAP32[16986]=r31;HEAP32[16989]=r16;HEAP32[r17+1]=r31|1;HEAP32[(r31>>2)+r17]=r31;return}r31=(r30&-8)+r18|0;r32=r30>>>3;L3331:do{if(r30>>>0<256){r22=HEAP32[r3+(r6+2)];r9=HEAP32[r3+(r6+3)];r23=(r32<<3)+67976|0;do{if((r22|0)!=(r23|0)){if(r22>>>0<r1>>>0){_abort()}if((HEAP32[r22+12>>2]|0)==(r8|0)){break}_abort()}}while(0);if((r9|0)==(r22|0)){HEAP32[16984]=HEAP32[16984]&(1<<r32^-1);break}do{if((r9|0)==(r23|0)){r33=r9+8|0}else{if(r9>>>0<r1>>>0){_abort()}r10=r9+8|0;if((HEAP32[r10>>2]|0)==(r8|0)){r33=r10;break}_abort()}}while(0);HEAP32[r22+12>>2]=r9;HEAP32[r33>>2]=r22}else{r23=r7;r10=HEAP32[r3+(r6+6)];r15=HEAP32[r3+(r6+3)];L3333:do{if((r15|0)==(r23|0)){r14=r2+(r5+20)|0;r11=HEAP32[r14>>2];do{if((r11|0)==0){r19=r2+(r5+16)|0;r20=HEAP32[r19>>2];if((r20|0)==0){r34=0,r35=r34>>2;break L3333}else{r36=r20;r37=r19;break}}else{r36=r11;r37=r14}}while(0);while(1){r14=r36+20|0;r11=HEAP32[r14>>2];if((r11|0)!=0){r36=r11;r37=r14;continue}r14=r36+16|0;r11=HEAP32[r14>>2];if((r11|0)==0){break}else{r36=r11;r37=r14}}if(r37>>>0<r1>>>0){_abort()}else{HEAP32[r37>>2]=0;r34=r36,r35=r34>>2;break}}else{r14=HEAP32[r3+(r6+2)];if(r14>>>0<r1>>>0){_abort()}r11=r14+12|0;if((HEAP32[r11>>2]|0)!=(r23|0)){_abort()}r19=r15+8|0;if((HEAP32[r19>>2]|0)==(r23|0)){HEAP32[r11>>2]=r15;HEAP32[r19>>2]=r14;r34=r15,r35=r34>>2;break}else{_abort()}}}while(0);if((r10|0)==0){break}r15=r2+(r5+28)|0;r22=(HEAP32[r15>>2]<<2)+68240|0;do{if((r23|0)==(HEAP32[r22>>2]|0)){HEAP32[r22>>2]=r34;if((r34|0)!=0){break}HEAP32[16985]=HEAP32[16985]&(1<<HEAP32[r15>>2]^-1);break L3331}else{if(r10>>>0<HEAP32[16988]>>>0){_abort()}r9=r10+16|0;if((HEAP32[r9>>2]|0)==(r23|0)){HEAP32[r9>>2]=r34}else{HEAP32[r10+20>>2]=r34}if((r34|0)==0){break L3331}}}while(0);if(r34>>>0<HEAP32[16988]>>>0){_abort()}HEAP32[r35+6]=r10;r23=HEAP32[r3+(r6+4)];do{if((r23|0)!=0){if(r23>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r35+4]=r23;HEAP32[r23+24>>2]=r34;break}}}while(0);r23=HEAP32[r3+(r6+5)];if((r23|0)==0){break}if(r23>>>0<HEAP32[16988]>>>0){_abort()}else{HEAP32[r35+5]=r23;HEAP32[r23+24>>2]=r34;break}}}while(0);HEAP32[r17+1]=r31|1;HEAP32[(r31>>2)+r17]=r31;if((r16|0)!=(HEAP32[16989]|0)){r38=r31;break}HEAP32[16986]=r31;return}else{HEAP32[r29>>2]=r30&-2;HEAP32[r17+1]=r18|1;HEAP32[(r18>>2)+r17]=r18;r38=r18}}while(0);r18=r38>>>3;if(r38>>>0<256){r30=r18<<1;r29=(r30<<2)+67976|0;r34=HEAP32[16984];r35=1<<r18;do{if((r34&r35|0)==0){HEAP32[16984]=r34|r35;r39=r29;r40=(r30+2<<2)+67976|0}else{r18=(r30+2<<2)+67976|0;r6=HEAP32[r18>>2];if(r6>>>0>=HEAP32[16988]>>>0){r39=r6;r40=r18;break}_abort()}}while(0);HEAP32[r40>>2]=r16;HEAP32[r39+12>>2]=r16;HEAP32[r17+2]=r39;HEAP32[r17+3]=r29;return}r29=r16;r39=r38>>>8;do{if((r39|0)==0){r41=0}else{if(r38>>>0>16777215){r41=31;break}r40=(r39+1048320|0)>>>16&8;r30=r39<<r40;r35=(r30+520192|0)>>>16&4;r34=r30<<r35;r30=(r34+245760|0)>>>16&2;r18=14-(r35|r40|r30)+(r34<<r30>>>15)|0;r41=r38>>>((r18+7|0)>>>0)&1|r18<<1}}while(0);r39=(r41<<2)+68240|0;HEAP32[r17+7]=r41;HEAP32[r17+5]=0;HEAP32[r17+4]=0;r18=HEAP32[16985];r30=1<<r41;if((r18&r30|0)==0){HEAP32[16985]=r18|r30;HEAP32[r39>>2]=r29;HEAP32[r17+6]=r39;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}if((r41|0)==31){r42=0}else{r42=25-(r41>>>1)|0}r41=r38<<r42;r42=HEAP32[r39>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r38|0)){break}r43=(r41>>>31<<2)+r42+16|0;r39=HEAP32[r43>>2];if((r39|0)==0){r4=2490;break}else{r41=r41<<1;r42=r39}}if(r4==2490){if(r43>>>0<HEAP32[16988]>>>0){_abort()}HEAP32[r43>>2]=r29;HEAP32[r17+6]=r42;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}r16=r42+8|0;r43=HEAP32[r16>>2];r4=HEAP32[16988];if(r42>>>0<r4>>>0){_abort()}if(r43>>>0<r4>>>0){_abort()}HEAP32[r43+12>>2]=r29;HEAP32[r16>>2]=r29;HEAP32[r17+2]=r43;HEAP32[r17+3]=r42;HEAP32[r17+6]=0;return}
// EMSCRIPTEN_END_FUNCS
Module["_init_game"] = _init_game;
Module["_midend_size"] = _midend_size;
Module["_midend_set_params"] = _midend_set_params;
Module["_midend_get_params"] = _midend_get_params;
Module["_midend_can_undo"] = _midend_can_undo;
Module["_midend_can_redo"] = _midend_can_redo;
Module["_midend_force_redraw"] = _midend_force_redraw;
Module["_midend_redraw"] = _midend_redraw;
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
