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
STATICTOP += 7972;
assert(STATICTOP < TOTAL_MEMORY);
var _stderr;
allocate([0,0,0,0,0,0,0,0,0,0,0,0,54,0,0,0,68,0,0,0,36,0,0,0,72,0,0,0,42,0,0,0,64,0,0,0,1,0,0,0,66,0,0,0,38,0,0,0,6,0,0,0,98,0,0,0,30,0,0,0,104,0,0,0,10,0,0,0,2,0,0,0,1,0,0,0,24,0,0,0,1,0,0,0,88,0,0,0,8,0,0,0,60,0,0,0,62,0,0,0,16,0,0,0,40,0,0,0,12,0,0,0,96,0,0,0,100,0,0,0,48,0,0,0,44,0,0,0,22,0,0,0,86,0,0,0,48,0,0,0,4,0,0,0,52,0,0,0,18,0,0,0,82,0,0,0,70,0,0,0,1,0,0,0,0,0,0,0,92,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,76,0,0,0,3072,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0], ALLOC_NONE, 65536);
allocate(1488, "i8", ALLOC_NONE, 65728);
allocate(800, "i8", ALLOC_NONE, 67216);
allocate(360, "i8", ALLOC_NONE, 68016);
allocate(24, "i8", ALLOC_NONE, 68376);
allocate([255,255,255,255], "i8", ALLOC_NONE, 68400);
allocate([0,0,0,0,2,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,4,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,1,0,0,0,5,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,9,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,1,0,0,0,1,0,0,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,4,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,4,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, 68404);
allocate([74,0,0,0,28,0,0,0,20,0,0,0,102,0,0,0,106,0,0,0,14,0,0,0,50,0,0,0,32,0,0,0,46,0,0,0,58,0,0,0,94,0,0,0,80,0,0,0,84,0,0,0,90,0,0,0,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,0,0,0,34,0,0,0], ["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], ALLOC_NONE, 68916);
allocate([100,98,0] /* db\00 */, "i8", ALLOC_NONE, 69016);
allocate([114,52,0] /* r4\00 */, "i8", ALLOC_NONE, 69020);
allocate([109,50,0] /* m2\00 */, "i8", ALLOC_NONE, 69024);
allocate([109,52,0] /* m4\00 */, "i8", ALLOC_NONE, 69028);
allocate([109,56,0] /* m8\00 */, "i8", ALLOC_NONE, 69032);
allocate([109,101,45,62,115,116,97,116,101,112,111,115,32,62,61,32,49,0] /* me-_statepos _= 1\00 */, "i8", ALLOC_NONE, 69036);
allocate([99,108,117,101,32,61,61,32,48,0] /* clue == 0\00 */, "i8", ALLOC_NONE, 69056);
allocate([37,100,106,0] /* %dj\00 */, "i8", ALLOC_NONE, 69068);
allocate([37,100,120,37,100,0] /* %dx%d\00 */, "i8", ALLOC_NONE, 69072);
allocate([58,84,114,105,118,105,97,108,58,66,97,115,105,99,58,73,110,116,101,114,109,101,100,105,97,116,101,58,65,100,118,97,110,99,101,100,58,69,120,116,114,101,109,101,58,85,110,114,101,97,115,111,110,97,98,108,101,0] /* :Trivial:Basic:Inter */, "i8", ALLOC_NONE, 69080);
allocate([68,105,102,102,105,99,117,108,116,121,0] /* Difficulty\00 */, "i8", ALLOC_NONE, 69140);
allocate([58,78,111,110,101,58,50,45,119,97,121,32,114,111,116,97,116,105,111,110,58,52,45,119,97,121,32,114,111,116,97,116,105,111,110,58,50,45,119,97,121,32,109,105,114,114,111,114,58,50,45,119,97,121,32,100,105,97,103,111,110,97,108,32,109,105,114,114,111,114,58,52,45,119,97,121,32,109,105,114,114,111,114,58,52,45,119,97,121,32,100,105,97,103,111,110,97,108,32,109,105,114,114,111,114,58,56,45,119,97,121,32,109,105,114,114,111,114,0] /* :None:2-way rotation */, "i8", ALLOC_NONE, 69152);
allocate([83,121,109,109,101,116,114,121,0] /* Symmetry\00 */, "i8", ALLOC_NONE, 69272);
allocate([75,105,108,108,101,114,32,40,100,105,103,105,116,32,115,117,109,115,41,0] /* Killer (digit sums)\ */, "i8", ALLOC_NONE, 69284);
allocate([74,105,103,115,97,119,32,40,105,114,114,101,103,117,108,97,114,108,121,32,115,104,97,112,101,100,32,115,117,98,45,98,108,111,99,107,115,41,0] /* Jigsaw (irregularly  */, "i8", ALLOC_NONE, 69304);
allocate([82,117,110,110,105,110,103,32,115,111,108,118,101,114,32,115,111,97,107,32,116,101,115,116,115,10,0] /* Running solver soak  */, "i8", ALLOC_NONE, 69344);
allocate([105,50,32,61,61,32,105,110,118,101,114,115,101,0] /* i2 == inverse\00 */, "i8", ALLOC_NONE, 69372);
allocate([34,88,34,32,40,114,101,113,117,105,114,101,32,101,118,101,114,121,32,110,117,109,98,101,114,32,105,110,32,101,97,99,104,32,109,97,105,110,32,100,105,97,103,111,110,97,108,41,0] /* \22X\22 (require eve */, "i8", ALLOC_NONE, 69388);
allocate([82,111,119,115,32,111,102,32,115,117,98,45,98,108,111,99,107,115,0] /* Rows of sub-blocks\0 */, "i8", ALLOC_NONE, 69440);
allocate([110,32,60,32,50,42,99,114,43,50,0] /* n _ 2_cr+2\00 */, "i8", ALLOC_NONE, 69460);
allocate([67,111,108,117,109,110,115,32,111,102,32,115,117,98,45,98,108,111,99,107,115,0] /* Columns of sub-block */, "i8", ALLOC_NONE, 69472);
allocate([75,105,108,108,101,114,32,112,117,122,122,108,101,32,100,105,109,101,110,115,105,111,110,115,32,109,117,115,116,32,98,101,32,115,109,97,108,108,101,114,32,116,104,97,110,32,49,48,46,0] /* Killer puzzle dimens */, "i8", ALLOC_NONE, 69496);
allocate([85,110,97,98,108,101,32,116,111,32,115,117,112,112,111,114,116,32,109,111,114,101,32,116,104,97,110,32,51,49,32,100,105,115,116,105,110,99,116,32,115,121,109,98,111,108,115,32,105,110,32,97,32,112,117,122,122,108,101,0] /* Unable to support mo */, "i8", ALLOC_NONE, 69548);
allocate([68,105,109,101,110,115,105,111,110,115,32,103,114,101,97,116,101,114,32,116,104,97,110,32,50,53,53,32,97,114,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0] /* Dimensions greater t */, "i8", ALLOC_NONE, 69608);
allocate([115,32,33,61,32,78,85,76,76,0] /* s != NULL\00 */, "i8", ALLOC_NONE, 69656);
allocate([66,111,116,104,32,100,105,109,101,110,115,105,111,110,115,32,109,117,115,116,32,98,101,32,97,116,32,108,101,97,115,116,32,50,0] /* Both dimensions must */, "i8", ALLOC_NONE, 69668);
allocate([110,95,115,105,110,103,108,101,116,111,110,115,32,61,61,32,48,0] /* n_singletons == 0\00 */, "i8", ALLOC_NONE, 69704);
allocate([121,32,61,61,32,110,95,115,105,110,103,108,101,116,111,110,115,0] /* y == n_singletons\00 */, "i8", ALLOC_NONE, 69724);
allocate([106,32,33,61,32,97,114,101,97,0] /* j != area\00 */, "i8", ALLOC_NONE, 69744);
allocate([37,115,95,84,69,83,84,83,79,76,86,69,0] /* %s_TESTSOLVE\00 */, "i8", ALLOC_NONE, 69756);
allocate([118,50,32,61,61,32,118,49,0] /* v2 == v1\00 */, "i8", ALLOC_NONE, 69772);
allocate([112,32,45,32,100,101,115,99,32,60,32,115,112,97,99,101,0] /* p - desc _ space\00 */, "i8", ALLOC_NONE, 69784);
allocate([99,104,101,99,107,95,118,97,108,105,100,40,99,114,44,32,98,108,111,99,107,115,44,32,107,98,108,111,99,107,115,44,32,112,97,114,97,109,115,45,62,120,116,121,112,101,44,32,103,114,105,100,41,0] /* check_valid(cr, bloc */, "i8", ALLOC_NONE, 69804);
allocate([120,43,100,120,32,60,32,48,32,124,124,32,120,43,100,120,32,62,61,32,99,114,32,124,124,32,121,43,100,121,32,60,32,48,32,124,124,32,121,43,100,121,32,62,61,32,99,114,32,124,124,32,98,108,111,99,107,115,45,62,119,104,105,99,104,98,108,111,99,107,91,40,121,43,100,121,41,42,99,114,43,40,120,43,100,120,41,93,32,33,61,32,98,105,0] /* x+dx _ 0 || x+dx _=  */, "i8", ALLOC_NONE, 69860);
allocate([84,111,111,32,109,117,99,104,32,100,97,116,97,32,116,111,32,102,105,116,32,105,110,32,103,114,105,100,0] /* Too much data to fit */, "i8", ALLOC_NONE, 69956);
allocate([78,111,116,32,101,110,111,117,103,104,32,100,97,116,97,32,116,111,32,102,105,108,108,32,103,114,105,100,0] /* Not enough data to f */, "i8", ALLOC_NONE, 69988);
allocate([79,117,116,45,111,102,45,114,97,110,103,101,32,110,117,109,98,101,114,32,105,110,32,103,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,0] /* Out-of-range number  */, "i8", ALLOC_NONE, 70020);
allocate([65,32,106,105,103,115,97,119,32,98,108,111,99,107,32,105,115,32,116,111,111,32,115,109,97,108,108,0] /* A jigsaw block is to */, "i8", ALLOC_NONE, 70060);
allocate([78,111,116,32,101,110,111,117,103,104,32,100,105,115,116,105,110,99,116,32,106,105,103,115,97,119,32,98,108,111,99,107,115,0] /* Not enough distinct  */, "i8", ALLOC_NONE, 70088);
allocate([84,111,111,32,109,97,110,121,32,100,105,115,116,105,110,99,116,32,106,105,103,115,97,119,32,98,108,111,99,107,115,0] /* Too many distinct ji */, "i8", ALLOC_NONE, 70124);
allocate([65,32,106,105,103,115,97,119,32,98,108,111,99,107,32,105,115,32,116,111,111,32,98,105,103,0] /* A jigsaw block is to */, "i8", ALLOC_NONE, 70156);
allocate([109,105,110,95,110,114,95,98,108,111,99,107,115,32,42,32,109,105,110,95,110,114,95,115,113,117,97,114,101,115,32,61,61,32,97,114,101,97,0] /* min_nr_blocks _ min_ */, "i8", ALLOC_NONE, 70184);
allocate([115,0] /* s\00 */, "i8", ALLOC_NONE, 70224);
allocate([105,110,118,101,114,115,101,32,61,61,32,48,32,124,124,32,105,110,118,101,114,115,101,32,61,61,32,49,0] /* inverse == 0 || inve */, "i8", ALLOC_NONE, 70228);
allocate([100,115,102,95,99,97,110,111,110,105,102,121,40,116,109,112,44,32,106,41,32,61,61,32,100,115,102,95,99,97,110,111,110,105,102,121,40,116,109,112,44,32,105,41,0] /* dsf_canonify(tmp, j) */, "i8", ALLOC_NONE, 70260);
allocate([109,105,110,95,110,114,95,98,108,111,99,107,115,32,61,61,32,109,97,120,95,110,114,95,98,108,111,99,107,115,0] /* min_nr_blocks == max */, "i8", ALLOC_NONE, 70308);
allocate([85,110,101,120,112,101,99,116,101,100,32,100,97,116,97,32,97,116,32,101,110,100,32,111,102,32,103,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,0] /* Unexpected data at e */, "i8", ALLOC_NONE, 70340);
allocate([120,32,62,61,32,48,32,38,38,32,120,32,60,32,99,114,32,38,38,32,121,32,62,61,32,48,32,38,38,32,121,32,60,32,99,114,32,38,38,32,98,108,111,99,107,115,45,62,119,104,105,99,104,98,108,111,99,107,91,121,42,99,114,43,120,93,32,61,61,32,98,105,0] /* x _= 0 && x _ cr &&  */, "i8", ALLOC_NONE, 70384);
allocate([69,120,112,101,99,116,101,100,32,107,105,108,108,101,114,32,99,108,117,101,32,103,114,105,100,32,105,110,32,103,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,0] /* Expected killer clue */, "i8", ALLOC_NONE, 70460);
allocate([69,120,112,101,99,116,101,100,32,107,105,108,108,101,114,32,98,108,111,99,107,32,115,116,114,117,99,116,117,114,101,32,105,110,32,103,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,0] /* Expected killer bloc */, "i8", ALLOC_NONE, 70508);
allocate([69,120,112,101,99,116,101,100,32,106,105,103,115,97,119,32,98,108,111,99,107,32,115,116,114,117,99,116,117,114,101,32,105,110,32,103,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,0] /* Expected jigsaw bloc */, "i8", ALLOC_NONE, 70560);
allocate([98,105,116,109,97,115,107,95,115,111,95,102,97,114,32,33,61,32,110,101,119,95,98,105,116,109,97,115,107,0] /* bitmask_so_far != ne */, "i8", ALLOC_NONE, 70612);
allocate([97,100,100,101,110,100,115,95,108,101,102,116,32,62,61,32,50,0] /* addends_left _= 2\00 */, "i8", ALLOC_NONE, 70644);
allocate([106,32,60,61,32,77,65,88,95,52,83,85,77,83,0] /* j _= MAX_4SUMS\00 */, "i8", ALLOC_NONE, 70664);
allocate([106,32,60,61,32,77,65,88,95,51,83,85,77,83,0] /* j _= MAX_3SUMS\00 */, "i8", ALLOC_NONE, 70680);
allocate([106,32,60,61,32,77,65,88,95,50,83,85,77,83,0] /* j _= MAX_2SUMS\00 */, "i8", ALLOC_NONE, 70696);
allocate([109,111,118,101,115,116,114,32,38,38,32,33,109,115,103,0] /* movestr && !msg\00 */, "i8", ALLOC_NONE, 70712);
allocate([33,105,110,118,101,114,115,101,0] /* !inverse\00 */, "i8", ALLOC_NONE, 70728);
allocate([111,119,110,91,105,93,32,62,61,32,48,32,38,38,32,111,119,110,91,105,93,32,60,32,110,0] /* own[i] _= 0 && own[i */, "i8", ALLOC_NONE, 70740);
allocate([105,32,61,61,32,97,114,101,97,0] /* i == area\00 */, "i8", ALLOC_NONE, 70768);
allocate([33,34,87,101,32,99,97,110,39,116,32,103,101,116,32,104,101,114,101,34,0] /* !\22We can't get her */, "i8", ALLOC_NONE, 70780);
allocate([105,32,60,32,99,114,0] /* i _ cr\00 */, "i8", ALLOC_NONE, 70804);
allocate([105,32,60,32,97,114,101,97,0] /* i _ area\00 */, "i8", ALLOC_NONE, 70812);
allocate([105,32,43,32,114,117,110,32,60,61,32,97,114,101,97,0] /* i + run _= area\00 */, "i8", ALLOC_NONE, 70824);
allocate([78,111,116,32,101,110,111,117,103,104,32,100,97,116,97,32,105,110,32,98,108,111,99,107,32,115,116,114,117,99,116,117,114,101,32,115,112,101,99,105,102,105,99,97,116,105,111,110,0] /* Not enough data in b */, "i8", ALLOC_NONE, 70840);
allocate([112,111,115,32,60,32,50,42,99,114,42,40,99,114,45,49,41,0] /* pos _ 2_cr_(cr-1)\00 */, "i8", ALLOC_NONE, 70892);
allocate([73,110,118,97,108,105,100,32,99,104,97,114,97,99,116,101,114,32,105,110,32,103,97,109,101,32,100,101,115,99,114,105,112,116,105,111,110,0] /* Invalid character in */, "i8", ALLOC_NONE, 70912);
allocate([110,98,32,62,61,32,109,105,110,95,101,120,112,101,99,116,101,100,32,38,38,32,110,98,32,60,61,32,109,97,120,95,101,120,112,101,99,116,101,100,0] /* nb _= min_expected & */, "i8", ALLOC_NONE, 70952);
allocate([106,32,60,32,98,108,111,99,107,115,45,62,109,97,120,95,110,114,95,115,113,117,97,114,101,115,0] /* j _ blocks-_max_nr_s */, "i8", ALLOC_NONE, 70996);
allocate([33,42,100,101,115,99,0] /* !_desc\00 */, "i8", ALLOC_NONE, 71024);
allocate([109,101,45,62,110,115,116,97,116,101,115,32,61,61,32,48,0] /* me-_nstates == 0\00 */, "i8", ALLOC_NONE, 71032);
allocate([100,115,102,91,118,50,93,32,38,32,50,0] /* dsf[v2] & 2\00 */, "i8", ALLOC_NONE, 71052);
allocate([113,116,97,105,108,32,60,32,110,0] /* qtail _ n\00 */, "i8", ALLOC_NONE, 71064);
allocate([101,114,114,32,61,61,32,78,85,76,76,0] /* err == NULL\00 */, "i8", ALLOC_NONE, 71076);
allocate([42,100,101,115,99,32,61,61,32,39,44,39,0] /* _desc == ','\00 */, "i8", ALLOC_NONE, 71088);
allocate([115,111,108,111,46,99,0] /* solo.c\00 */, "i8", ALLOC_NONE, 71104);
allocate([99,117,98,101,40,120,44,121,44,110,41,0] /* cube(x,y,n)\00 */, "i8", ALLOC_NONE, 71112);
allocate([102,112,111,115,32,62,61,32,48,0] /* fpos _= 0\00 */, "i8", ALLOC_NONE, 71124);
allocate([106,43,49,32,61,61,32,105,0] /* j+1 == i\00 */, "i8", ALLOC_NONE, 71136);
allocate([111,102,102,32,61,61,32,110,0] /* off == n\00 */, "i8", ALLOC_NONE, 71148);
allocate([114,97,110,100,111,109,46,99,0] /* random.c\00 */, "i8", ALLOC_NONE, 71160);
allocate([98,45,62,119,104,105,99,104,98,108,111,99,107,91,115,113,117,97,114,101,115,91,105,93,93,32,61,61,32,112,114,101,118,105,111,117,115,95,98,108,111,99,107,0] /* b-_whichblock[square */, "i8", ALLOC_NONE, 71172);
allocate([98,45,62,110,114,95,115,113,117,97,114,101,115,91,112,114,101,118,105,111,117,115,95,98,108,111,99,107,93,32,62,32,110,114,95,115,113,117,97,114,101,115,0] /* b-_nr_squares[previo */, "i8", ALLOC_NONE, 71216);
allocate([98,45,62,109,97,120,95,110,114,95,115,113,117,97,114,101,115,32,62,61,32,110,114,95,115,113,117,97,114,101,115,0] /* b-_max_nr_squares _= */, "i8", ALLOC_NONE, 71260);
allocate([91,37,100,58,37,48,50,100,93,32,0] /* [%d:%02d] \00 */, "i8", ALLOC_NONE, 71292);
allocate([117,115,97,103,101,45,62,103,114,105,100,91,120,93,32,61,61,32,48,0] /* usage-_grid[x] == 0\ */, "i8", ALLOC_NONE, 71304);
allocate([109,105,100,101,110,100,46,99,0] /* midend.c\00 */, "i8", ALLOC_NONE, 71324);
allocate([100,115,102,91,118,49,93,32,38,32,50,0] /* dsf[v1] & 2\00 */, "i8", ALLOC_NONE, 71336);
allocate([111,119,110,91,116,109,112,115,113,93,32,61,61,32,106,0] /* own[tmpsq] == j\00 */, "i8", ALLOC_NONE, 71348);
allocate([83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,32,102,97,105,108,101,100,0] /* Solve operation fail */, "i8", ALLOC_NONE, 71364);
allocate([110,115,113,117,97,114,101,115,32,62,32,48,0] /* nsquares _ 0\00 */, "i8", ALLOC_NONE, 71388);
allocate([78,111,32,103,97,109,101,32,115,101,116,32,117,112,32,116,111,32,115,111,108,118,101,0] /* No game set up to so */, "i8", ALLOC_NONE, 71404);
allocate([110,115,113,117,97,114,101,115,32,61,61,32,48,0] /* nsquares == 0\00 */, "i8", ALLOC_NONE, 71428);
allocate([84,104,105,115,32,103,97,109,101,32,100,111,101,115,32,110,111,116,32,115,117,112,112,111,114,116,32,116,104,101,32,83,111,108,118,101,32,111,112,101,114,97,116,105,111,110,0] /* This game does not s */, "i8", ALLOC_NONE, 71444);
allocate([110,32,61,61,32,106,0] /* n == j\00 */, "i8", ALLOC_NONE, 71492);
allocate([99,111,117,110,116,32,62,32,48,0] /* count _ 0\00 */, "i8", ALLOC_NONE, 71500);
allocate([37,100,0] /* %d\00 */, "i8", ALLOC_NONE, 71512);
allocate([99,111,117,110,116,32,62,32,49,0] /* count _ 1\00 */, "i8", ALLOC_NONE, 71516);
allocate([117,115,97,103,101,45,62,107,98,108,111,99,107,115,45,62,110,114,95,115,113,117,97,114,101,115,91,117,115,97,103,101,45,62,107,98,108,111,99,107,115,45,62,110,114,95,98,108,111,99,107,115,32,45,32,49,93,32,61,61,32,110,115,113,117,97,114,101,115,0] /* usage-_kblocks-_nr_s */, "i8", ALLOC_NONE, 71528);
allocate([117,115,97,103,101,45,62,107,98,108,111,99,107,115,45,62,110,114,95,115,113,117,97,114,101,115,91,98,93,32,62,32,110,115,113,117,97,114,101,115,0] /* usage-_kblocks-_nr_s */, "i8", ALLOC_NONE, 71600);
allocate([115,117,109,32,62,32,48,0] /* sum _ 0\00 */, "i8", ALLOC_NONE, 71644);
allocate([117,115,97,103,101,45,62,107,99,108,117,101,115,91,105,93,32,62,32,48,0] /* usage-_kclues[i] _ 0 */, "i8", ALLOC_NONE, 71652);
allocate([107,98,108,111,99,107,115,0] /* kblocks\00 */, "i8", ALLOC_NONE, 71676);
allocate([105,110,118,101,114,115,101,32,61,61,32,48,0] /* inverse == 0\00 */, "i8", ALLOC_NONE, 71684);
allocate([100,114,45,62,109,101,0] /* dr-_me\00 */, "i8", ALLOC_NONE, 71700);
allocate([119,104,32,62,61,32,50,42,110,0] /* wh _= 2_n\00 */, "i8", ALLOC_NONE, 71708);
allocate([112,32,45,32,114,101,116,32,61,61,32,108,101,110,0] /* p - ret == len\00 */, "i8", ALLOC_NONE, 71720);
allocate([44,0] /* ,\00 */, "i8", ALLOC_NONE, 71736);
allocate([115,111,108,111,0] /* solo\00 */, "i8", ALLOC_NONE, 71740);
allocate([37,115,37,100,0] /* %s%d\00 */, "i8", ALLOC_NONE, 71748);
allocate([37,115,95,68,69,70,65,85,76,84,0] /* %s_DEFAULT\00 */, "i8", ALLOC_NONE, 71756);
allocate([77,117,108,116,105,112,108,101,32,115,111,108,117,116,105,111,110,115,32,101,120,105,115,116,32,102,111,114,32,116,104,105,115,32,112,117,122,122,108,101,0] /* Multiple solutions e */, "i8", ALLOC_NONE, 71768);
allocate([111,117,116,32,111,102,32,109,101,109,111,114,121,0] /* out of memory\00 */, "i8", ALLOC_NONE, 71812);
allocate([102,97,116,97,108,32,101,114,114,111,114,58,32,0] /* fatal error: \00 */, "i8", ALLOC_NONE, 71828);
allocate([78,111,32,115,111,108,117,116,105,111,110,32,101,120,105,115,116,115,32,102,111,114,32,116,104,105,115,32,112,117,122,122,108,101,0] /* No solution exists f */, "i8", ALLOC_NONE, 71844);
allocate(1, "i8", ALLOC_NONE, 71880);
allocate([110,32,62,61,32,48,32,38,38,32,110,32,60,32,109,101,45,62,110,112,114,101,115,101,116,115,0] /* n _= 0 && n _ me-_np */, "i8", ALLOC_NONE, 71884);
allocate([112,32,45,32,114,101,116,32,61,61,32,116,111,116,97,108,108,101,110,0] /* p - ret == totallen\ */, "i8", ALLOC_NONE, 71912);
allocate([100,115,102,46,99,0] /* dsf.c\00 */, "i8", ALLOC_NONE, 71932);
allocate([37,115,95,80,82,69,83,69,84,83,0] /* %s_PRESETS\00 */, "i8", ALLOC_NONE, 71940);
allocate([33,115,116,97,116,101,45,62,107,98,108,111,99,107,115,0] /* !state-_kblocks\00 */, "i8", ALLOC_NONE, 71952);
allocate([37,50,120,37,50,120,37,50,120,0] /* %2x%2x%2x\00 */, "i8", ALLOC_NONE, 71968);
allocate([37,99,37,100,44,37,100,44,37,100,0] /* %c%d,%d,%d\00 */, "i8", ALLOC_NONE, 71980);
allocate([98,105,116,115,32,60,32,51,50,0] /* bits _ 32\00 */, "i8", ALLOC_NONE, 71992);
allocate([37,115,95,67,79,76,79,85,82,95,37,100,0] /* %s_COLOUR_%d\00 */, "i8", ALLOC_NONE, 72004);
allocate([100,114,97,119,105,110,103,46,99,0] /* drawing.c\00 */, "i8", ALLOC_NONE, 72020);
allocate([100,105,118,118,121,46,99,0] /* divvy.c\00 */, "i8", ALLOC_NONE, 72032);
allocate([37,100,44,37,100,44,37,100,0] /* %d,%d,%d\00 */, "i8", ALLOC_NONE, 72040);
allocate([52,120,52,32,66,97,115,105,99,0] /* 4x4 Basic\00 */, "i8", ALLOC_NONE, 72052);
allocate([37,115,95,84,73,76,69,83,73,90,69,0] /* %s_TILESIZE\00 */, "i8", ALLOC_NONE, 72064);
allocate([51,120,52,32,66,97,115,105,99,0] /* 3x4 Basic\00 */, "i8", ALLOC_NONE, 72076);
allocate([57,32,74,105,103,115,97,119,32,65,100,118,97,110,99,101,100,0] /* 9 Jigsaw Advanced\00 */, "i8", ALLOC_NONE, 72088);
allocate([57,32,74,105,103,115,97,119,32,66,97,115,105,99,32,88,0] /* 9 Jigsaw Basic X\00 */, "i8", ALLOC_NONE, 72108);
allocate([105,110,100,101,120,32,62,61,32,48,0] /* index _= 0\00 */, "i8", ALLOC_NONE, 72128);
allocate([57,32,74,105,103,115,97,119,32,66,97,115,105,99,0] /* 9 Jigsaw Basic\00 */, "i8", ALLOC_NONE, 72140);
allocate([51,120,51,32,75,105,108,108,101,114,0] /* 3x3 Killer\00 */, "i8", ALLOC_NONE, 72156);
allocate([51,120,51,32,85,110,114,101,97,115,111,110,97,98,108,101,0] /* 3x3 Unreasonable\00 */, "i8", ALLOC_NONE, 72168);
allocate([119,104,32,61,61,32,107,42,110,0] /* wh == k_n\00 */, "i8", ALLOC_NONE, 72188);
allocate([51,120,51,32,69,120,116,114,101,109,101,0] /* 3x3 Extreme\00 */, "i8", ALLOC_NONE, 72200);
allocate([109,101,45,62,100,105,114,32,33,61,32,48,0] /* me-_dir != 0\00 */, "i8", ALLOC_NONE, 72212);
allocate([51,120,51,32,65,100,118,97,110,99,101,100,32,88,0] /* 3x3 Advanced X\00 */, "i8", ALLOC_NONE, 72228);
allocate([51,120,51,32,65,100,118,97,110,99,101,100,0] /* 3x3 Advanced\00 */, "i8", ALLOC_NONE, 72244);
allocate([112,98,101,115,116,32,62,32,48,0] /* pbest _ 0\00 */, "i8", ALLOC_NONE, 72260);
allocate([51,120,51,32,73,110,116,101,114,109,101,100,105,97,116,101,0] /* 3x3 Intermediate\00 */, "i8", ALLOC_NONE, 72272);
allocate([51,120,51,32,66,97,115,105,99,32,88,0] /* 3x3 Basic X\00 */, "i8", ALLOC_NONE, 72292);
allocate([51,120,51,32,66,97,115,105,99,0] /* 3x3 Basic\00 */, "i8", ALLOC_NONE, 72304);
allocate([51,120,51,32,84,114,105,118,105,97,108,0] /* 3x3 Trivial\00 */, "i8", ALLOC_NONE, 72316);
allocate([50,120,51,32,66,97,115,105,99,0] /* 2x3 Basic\00 */, "i8", ALLOC_NONE, 72328);
allocate([50,120,50,32,84,114,105,118,105,97,108,0] /* 2x2 Trivial\00 */, "i8", ALLOC_NONE, 72340);
allocate([100,117,0] /* du\00 */, "i8", ALLOC_NONE, 72352);
allocate([100,101,0] /* de\00 */, "i8", ALLOC_NONE, 72356);
allocate([109,101,45,62,100,114,97,119,105,110,103,0] /* me-_drawing\00 */, "i8", ALLOC_NONE, 72360);
allocate([100,97,0] /* da\00 */, "i8", ALLOC_NONE, 72372);
allocate([100,105,0] /* di\00 */, "i8", ALLOC_NONE, 72376);
allocate([99,108,117,101,32,33,61,32,48,0] /* clue != 0\00 */, "i8", ALLOC_NONE, 72380);
allocate([103,97,109,101,115,46,115,111,108,111,0] /* games.solo\00 */, "i8", ALLOC_NONE, 72392);
allocate([83,111,108,111,0] /* Solo\00 */, "i8", ALLOC_NONE, 72404);
allocate(472, "i8", ALLOC_NONE, 72412);
allocate([118,97,108,105,100,97,116,101,95,98,108,111,99,107,95,100,101,115,99,0] /* validate_block_desc\ */, "i8", ALLOC_NONE, 72884);
allocate([115,116,97,116,117,115,95,98,97,114,0] /* status_bar\00 */, "i8", ALLOC_NONE, 72904);
allocate([115,112,108,105,116,95,98,108,111,99,107,0] /* split_block\00 */, "i8", ALLOC_NONE, 72916);
allocate([115,112,101,99,95,116,111,95,103,114,105,100,0] /* spec_to_grid\00 */, "i8", ALLOC_NONE, 72928);
allocate([115,112,101,99,95,116,111,95,100,115,102,0] /* spec_to_dsf\00 */, "i8", ALLOC_NONE, 72944);
allocate([115,111,108,118,101,114,95,115,101,116,0] /* solver_set\00 */, "i8", ALLOC_NONE, 72956);
allocate([115,111,108,118,101,114,95,112,108,97,99,101,0] /* solver_place\00 */, "i8", ALLOC_NONE, 72968);
allocate([115,111,108,118,101,114,95,107,105,108,108,101,114,95,115,117,109,115,0] /* solver_killer_sums\0 */, "i8", ALLOC_NONE, 72984);
allocate([115,111,108,118,101,114,95,101,108,105,109,0] /* solver_elim\00 */, "i8", ALLOC_NONE, 73004);
allocate([115,111,108,118,101,114,0] /* solver\00 */, "i8", ALLOC_NONE, 73016);
allocate([114,101,109,111,118,101,95,102,114,111,109,95,98,108,111,99,107,0] /* remove_from_block\00 */, "i8", ALLOC_NONE, 73024);
allocate([114,97,110,100,111,109,95,117,112,116,111,0] /* random_upto\00 */, "i8", ALLOC_NONE, 73044);
allocate([112,114,101,99,111,109,112,117,116,101,95,115,117,109,95,98,105,116,115,0] /* precompute_sum_bits\ */, "i8", ALLOC_NONE, 73056);
allocate([111,117,116,108,105,110,101,95,98,108,111,99,107,95,115,116,114,117,99,116,117,114,101,0] /* outline_block_struct */, "i8", ALLOC_NONE, 73076);
allocate([110,101,119,95,103,97,109,101,95,100,101,115,99,0] /* new_game_desc\00 */, "i8", ALLOC_NONE, 73100);
allocate([110,101,119,95,103,97,109,101,0] /* new_game\00 */, "i8", ALLOC_NONE, 73116);
allocate([109,105,100,101,110,100,95,115,111,108,118,101,0] /* midend_solve\00 */, "i8", ALLOC_NONE, 73128);
allocate([109,105,100,101,110,100,95,114,101,115,116,97,114,116,95,103,97,109,101,0] /* midend_restart_game\ */, "i8", ALLOC_NONE, 73144);
allocate([109,105,100,101,110,100,95,114,101,100,114,97,119,0] /* midend_redraw\00 */, "i8", ALLOC_NONE, 73164);
allocate([109,105,100,101,110,100,95,114,101,97,108,108,121,95,112,114,111,99,101,115,115,95,107,101,121,0] /* midend_really_proces */, "i8", ALLOC_NONE, 73180);
allocate([109,105,100,101,110,100,95,110,101,119,95,103,97,109,101,0] /* midend_new_game\00 */, "i8", ALLOC_NONE, 73208);
allocate([109,105,100,101,110,100,95,102,101,116,99,104,95,112,114,101,115,101,116,0] /* midend_fetch_preset\ */, "i8", ALLOC_NONE, 73224);
allocate([109,97,107,101,95,98,108,111,99,107,115,95,102,114,111,109,95,119,104,105,99,104,98,108,111,99,107,0] /* make_blocks_from_whi */, "i8", ALLOC_NONE, 73244);
allocate([103,114,105,100,95,116,101,120,116,95,102,111,114,109,97,116,0] /* grid_text_format\00 */, "i8", ALLOC_NONE, 73272);
allocate([103,101,110,95,107,105,108,108,101,114,95,99,97,103,101,115,0] /* gen_killer_cages\00 */, "i8", ALLOC_NONE, 73292);
allocate([103,97,109,101,95,116,101,120,116,95,102,111,114,109,97,116,0] /* game_text_format\00 */, "i8", ALLOC_NONE, 73312);
allocate([103,97,109,101,95,114,101,100,114,97,119,0] /* game_redraw\00 */, "i8", ALLOC_NONE, 73332);
allocate([102,105,110,100,95,115,117,109,95,98,105,116,115,0] /* find_sum_bits\00 */, "i8", ALLOC_NONE, 73344);
allocate([102,105,108,116,101,114,95,119,104,111,108,101,95,99,97,103,101,115,0] /* filter_whole_cages\0 */, "i8", ALLOC_NONE, 73360);
allocate([101,110,99,111,100,101,95,115,111,108,118,101,95,109,111,118,101,0] /* encode_solve_move\00 */, "i8", ALLOC_NONE, 73380);
allocate([101,110,99,111,100,101,95,112,117,122,122,108,101,95,100,101,115,99,0] /* encode_puzzle_desc\0 */, "i8", ALLOC_NONE, 73400);
allocate([101,100,115,102,95,109,101,114,103,101,0] /* edsf_merge\00 */, "i8", ALLOC_NONE, 73420);
allocate([101,100,115,102,95,99,97,110,111,110,105,102,121,0] /* edsf_canonify\00 */, "i8", ALLOC_NONE, 73432);
allocate([100,115,102,95,116,111,95,98,108,111,99,107,115,0] /* dsf_to_blocks\00 */, "i8", ALLOC_NONE, 73448);
allocate([100,114,97,119,95,110,117,109,98,101,114,0] /* draw_number\00 */, "i8", ALLOC_NONE, 73464);
allocate([100,105,118,118,121,95,105,110,116,101,114,110,97,108,0] /* divvy_internal\00 */, "i8", ALLOC_NONE, 73476);
allocate([99,111,109,112,117,116,101,95,107,99,108,117,101,115,0] /* compute_kclues\00 */, "i8", ALLOC_NONE, 73492);
HEAP32[((65536)>>2)]=((72404)|0);
HEAP32[((65540)>>2)]=((72392)|0);
HEAP32[((65544)>>2)]=((71740)|0);
HEAP32[((68404)>>2)]=((72340)|0);
HEAP32[((68436)>>2)]=((72328)|0);
HEAP32[((68468)>>2)]=((72316)|0);
HEAP32[((68500)>>2)]=((72304)|0);
HEAP32[((68532)>>2)]=((72292)|0);
HEAP32[((68564)>>2)]=((72272)|0);
HEAP32[((68596)>>2)]=((72244)|0);
HEAP32[((68628)>>2)]=((72228)|0);
HEAP32[((68660)>>2)]=((72200)|0);
HEAP32[((68692)>>2)]=((72168)|0);
HEAP32[((68724)>>2)]=((72156)|0);
HEAP32[((68756)>>2)]=((72140)|0);
HEAP32[((68788)>>2)]=((72108)|0);
HEAP32[((68820)>>2)]=((72088)|0);
HEAP32[((68852)>>2)]=((72076)|0);
HEAP32[((68884)>>2)]=((72052)|0);
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
function _validate_params(r1,r2){var r3,r4,r5;r2=HEAP32[r1>>2];if((r2|0)<2){r3=69668;return r3}if((r2|0)>255){r3=69608;return r3}r4=HEAP32[r1+4>>2];if((r4|0)>255){r3=69608;return r3}r5=Math.imul(r4,r2);if((r5|0)>31){r3=69548;return r3}else{return(HEAP32[r1+24>>2]|0)!=0&(r5|0)>9?69496:0}}function _decode_params(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r3=0;r4=_atoi(r2);r5=(r1+4|0)>>2;HEAP32[r5]=r4;r6=r1|0;HEAP32[r6>>2]=r4;r7=(r1+20|0)>>2;HEAP32[r7]=0;r8=(r1+24|0)>>2;HEAP32[r8]=0;r9=r2;while(1){r10=HEAP8[r9];if(r10<<24>>24==0){r11=0;break}r12=r9+1|0;if(((r10&255)-48|0)>>>0<10){r9=r12}else{r3=14;break}}do{if(r3==14){if(r10<<24>>24!=120){r11=r10;break}r2=_atoi(r12);HEAP32[r5]=r2;r13=r12;while(1){r14=HEAP8[r13];if(r14<<24>>24==0){r15=0;break}if(((r14&255)-48|0)>>>0<10){r13=r13+1|0}else{r15=r14;break}}r14=(r1+12|0)>>2;r16=(r1+8|0)>>2;r17=r13;r18=r15;r19=r2;r20=r4;L24:while(1){do{if(r18<<24>>24==106){r21=Math.imul(r20,r19);HEAP32[r6>>2]=r21;HEAP32[r5]=1;r22=r17+1|0;r23=1;r24=r21}else if(r18<<24>>24==120){HEAP32[r7]=1;r22=r17+1|0;r23=r19;r24=r20}else if(r18<<24>>24==107){HEAP32[r8]=1;r22=r17+1|0;r23=r19;r24=r20}else if(r18<<24>>24==114|r18<<24>>24==109|r18<<24>>24==97){r21=r17+1|0;r25=r18<<24>>24==109;if(r25){r26=HEAP8[r21]<<24>>24==100;r27=r26&1;r28=r26?r17+2|0:r21}else{r27=0;r28=r21}r21=_atoi(r28);r26=r28;while(1){r29=HEAP8[r26];if(r29<<24>>24==0){break}if(((r29&255)-48|0)>>>0<10){r26=r26+1|0}else{break}}if(r25&(r21|0)==8){HEAP32[r16]=7}r29=(r21|0)==4;if(r25&r29){HEAP32[r16]=(r27|0)!=0?6:5}r30=(r21|0)==2;if(r25&r30){HEAP32[r16]=(r27|0)!=0?4:3}r31=r18<<24>>24==114;if(r31&r29){HEAP32[r16]=2}if(r31&r30){HEAP32[r16]=1}if(r18<<24>>24!=97){r22=r26;r23=r19;r24=r20;break}HEAP32[r16]=0;r22=r26;r23=r19;r24=r20}else if(r18<<24>>24==0){break L24}else{r30=r17+1|0;if(r18<<24>>24!=100){r22=r30;r23=r19;r24=r20;break}r31=HEAP8[r30];if(r31<<24>>24==116){HEAP32[r14]=0;r22=r17+2|0;r23=r19;r24=r20;break}else if(r31<<24>>24==98){HEAP32[r14]=1;r22=r17+2|0;r23=r19;r24=r20;break}else if(r31<<24>>24==105){HEAP32[r14]=2;r22=r17+2|0;r23=r19;r24=r20;break}else if(r31<<24>>24==97){HEAP32[r14]=3;r22=r17+2|0;r23=r19;r24=r20;break}else if(r31<<24>>24==101){HEAP32[r14]=4;r22=r17+2|0;r23=r19;r24=r20;break}else if(r31<<24>>24==117){HEAP32[r14]=5;r22=r17+2|0;r23=r19;r24=r20;break}else{r22=r30;r23=r19;r24=r20;break}}}while(0);r17=r22;r18=HEAP8[r22];r19=r23;r20=r24}return}}while(0);r24=(r1+12|0)>>2;r23=(r1+8|0)>>2;r1=r9;r9=r11;L66:while(1){do{if(r9<<24>>24==114|r9<<24>>24==109|r9<<24>>24==97){r11=r1+1|0;r22=r9<<24>>24==109;if(r22){r27=HEAP8[r11]<<24>>24==100;r32=r27&1;r33=r27?r1+2|0:r11}else{r32=0;r33=r11}r11=_atoi(r33);r27=r33;while(1){r28=HEAP8[r27];if(r28<<24>>24==0){break}if(((r28&255)-48|0)>>>0<10){r27=r27+1|0}else{break}}if(r22&(r11|0)==8){HEAP32[r23]=7}r28=(r11|0)==4;if(r22&r28){HEAP32[r23]=(r32|0)!=0?6:5}r6=(r11|0)==2;if(r22&r6){HEAP32[r23]=(r32|0)!=0?4:3}r4=r9<<24>>24==114;if(r4&r28){HEAP32[r23]=2}if(r4&r6){HEAP32[r23]=1}if(r9<<24>>24!=97){r34=r27;break}HEAP32[r23]=0;r34=r27}else if(r9<<24>>24==107){HEAP32[r8]=1;r34=r1+1|0}else if(r9<<24>>24==120){HEAP32[r7]=1;r34=r1+1|0}else if(r9<<24>>24==106){HEAP32[r5]=1;r34=r1+1|0}else if(r9<<24>>24==0){break L66}else{r6=r1+1|0;if(r9<<24>>24!=100){r34=r6;break}r4=HEAP8[r6];if(r4<<24>>24==117){HEAP32[r24]=5;r34=r1+2|0;break}else if(r4<<24>>24==101){HEAP32[r24]=4;r34=r1+2|0;break}else if(r4<<24>>24==97){HEAP32[r24]=3;r34=r1+2|0;break}else if(r4<<24>>24==105){HEAP32[r24]=2;r34=r1+2|0;break}else if(r4<<24>>24==98){HEAP32[r24]=1;r34=r1+2|0;break}else if(r4<<24>>24==116){HEAP32[r24]=0;r34=r1+2|0;break}else{r34=r6;break}}}while(0);r1=r34;r9=HEAP8[r34]}return}function _free_params(r1){if((r1|0)==0){return}_free(r1);return}function _default_params(){var r1,r2,r3;r1=STACKTOP;r2=_malloc(28),r3=r2>>2;if((r2|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r3+1]=3;HEAP32[r3]=3;HEAP32[r3+5]=0;HEAP32[r3+6]=0;HEAP32[r3+2]=1;HEAP32[r3+3]=0;HEAP32[r3+4]=3;STACKTOP=r1;return r2}}function _game_fetch_preset(r1,r2,r3){var r4,r5,r6,r7;r4=STACKTOP;if((r1|0)<0|r1>>>0>15){r5=0;STACKTOP=r4;return r5}r6=HEAP32[(r1<<5)+68404>>2];r7=_malloc(_strlen(r6)+1|0);if((r7|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r7,r6);HEAP32[r2>>2]=r7;r7=_malloc(28),r2=r7>>2;if((r7|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r6=((r1<<5)+68408|0)>>2;HEAP32[r2]=HEAP32[r6];HEAP32[r2+1]=HEAP32[r6+1];HEAP32[r2+2]=HEAP32[r6+2];HEAP32[r2+3]=HEAP32[r6+3];HEAP32[r2+4]=HEAP32[r6+4];HEAP32[r2+5]=HEAP32[r6+5];HEAP32[r2+6]=HEAP32[r6+6];HEAP32[r3>>2]=r7;r5=1;STACKTOP=r4;return r5}function _encode_params(r1,r2){var r3,r4,r5,r6,r7;r3=r1>>2;r1=STACKTOP;STACKTOP=STACKTOP+80|0;r4=r1;r5=HEAP32[r3+1];r6=r4|0;r7=HEAP32[r3];if((r5|0)>1){_sprintf(r6,69072,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r7,HEAP32[tempInt+4>>2]=r5,tempInt))}else{_sprintf(r6,69068,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r7,tempInt))}if((HEAP32[r3+5]|0)!=0){r7=r4+_strlen(r6)|0;tempBigInt=120;HEAP8[r7]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r7+1|0]=tempBigInt&255}if((HEAP32[r3+6]|0)!=0){r7=r4+_strlen(r6)|0;tempBigInt=107;HEAP8[r7]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r7+1|0]=tempBigInt&255}do{if((r2|0)!=0){r7=HEAP32[r3+2];if((r7|0)==4){r5=r4+_strlen(r6)|0;tempBigInt=3302509;HEAP8[r5]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r5+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r5+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r5+3|0]=tempBigInt&255}else if((r7|0)==2){r5=r4+_strlen(r6)|0;HEAP8[r5]=HEAP8[69020];HEAP8[r5+1|0]=HEAP8[69021|0];HEAP8[r5+2|0]=HEAP8[69022|0]}else if((r7|0)==5){r5=r4+_strlen(r6)|0;HEAP8[r5]=HEAP8[69028];HEAP8[r5+1|0]=HEAP8[69029|0];HEAP8[r5+2|0]=HEAP8[69030|0]}else if((r7|0)==6){r5=r4+_strlen(r6)|0;tempBigInt=3433581;HEAP8[r5]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r5+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r5+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r5+3|0]=tempBigInt&255}else if((r7|0)==0){r5=r4+_strlen(r6)|0;tempBigInt=97;HEAP8[r5]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r5+1|0]=tempBigInt&255}else if((r7|0)==3){r5=r4+_strlen(r6)|0;HEAP8[r5]=HEAP8[69024];HEAP8[r5+1|0]=HEAP8[69025|0];HEAP8[r5+2|0]=HEAP8[69026|0]}else if((r7|0)==7){r7=r4+_strlen(r6)|0;HEAP8[r7]=HEAP8[69032];HEAP8[r7+1|0]=HEAP8[69033|0];HEAP8[r7+2|0]=HEAP8[69034|0]}r7=HEAP32[r3+3];if((r7|0)==1){r5=r4+_strlen(r6)|0;HEAP8[r5]=HEAP8[69016];HEAP8[r5+1|0]=HEAP8[69017|0];HEAP8[r5+2|0]=HEAP8[69018|0];break}else if((r7|0)==2){r5=r4+_strlen(r6)|0;HEAP8[r5]=HEAP8[72376];HEAP8[r5+1|0]=HEAP8[72377|0];HEAP8[r5+2|0]=HEAP8[72378|0];break}else if((r7|0)==3){r5=r4+_strlen(r6)|0;HEAP8[r5]=HEAP8[72372];HEAP8[r5+1|0]=HEAP8[72373|0];HEAP8[r5+2|0]=HEAP8[72374|0];break}else if((r7|0)==4){r5=r4+_strlen(r6)|0;HEAP8[r5]=HEAP8[72356];HEAP8[r5+1|0]=HEAP8[72357|0];HEAP8[r5+2|0]=HEAP8[72358|0];break}else if((r7|0)==5){r7=r4+_strlen(r6)|0;HEAP8[r7]=HEAP8[72352];HEAP8[r7+1|0]=HEAP8[72353|0];HEAP8[r7+2|0]=HEAP8[72354|0];break}else{break}}}while(0);r4=_malloc(_strlen(r6)+1|0);if((r4|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r4,r6);STACKTOP=r1;return r4}}function _dup_params(r1){var r2,r3,r4,r5;r2=STACKTOP;r3=_malloc(28),r4=r3>>2;if((r3|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r5=r1>>2;HEAP32[r4]=HEAP32[r5];HEAP32[r4+1]=HEAP32[r5+1];HEAP32[r4+2]=HEAP32[r5+2];HEAP32[r4+3]=HEAP32[r5+3];HEAP32[r4+4]=HEAP32[r5+4];HEAP32[r4+5]=HEAP32[r5+5];HEAP32[r4+6]=HEAP32[r5+6];STACKTOP=r2;return r3}}function _game_configure(r1){var r2,r3,r4,r5,r6,r7;r2=r1>>2;r3=STACKTOP;STACKTOP=STACKTOP+80|0;r4=_malloc(128),r5=r4>>2;if((r4|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r5]=69472;HEAP32[r5+1]=0;r6=r3|0;_sprintf(r6,71512,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r2],tempInt));r7=_malloc(_strlen(r6)+1|0);if((r7|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r7,r6);HEAP32[r5+2]=r7;HEAP32[r5+3]=0;HEAP32[r5+4]=69440;HEAP32[r5+5]=0;r7=r1+4|0;_sprintf(r6,71512,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[r7>>2],tempInt));r1=_malloc(_strlen(r6)+1|0);if((r1|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r1,r6);HEAP32[r5+6]=r1;HEAP32[r5+7]=0;HEAP32[r5+8]=69388;HEAP32[r5+9]=2;HEAP32[r5+10]=0;HEAP32[r5+11]=HEAP32[r2+5];HEAP32[r5+12]=69304;HEAP32[r5+13]=2;HEAP32[r5+14]=0;HEAP32[r5+15]=(HEAP32[r7>>2]|0)==1&1;HEAP32[r5+16]=69284;HEAP32[r5+17]=2;HEAP32[r5+18]=0;HEAP32[r5+19]=HEAP32[r2+6];HEAP32[r5+20]=69272;HEAP32[r5+21]=1;HEAP32[r5+22]=69152;HEAP32[r5+23]=HEAP32[r2+2];HEAP32[r5+24]=69140;HEAP32[r5+25]=1;HEAP32[r5+26]=69080;HEAP32[r5+27]=HEAP32[r2+3];HEAP32[r5+28]=0;HEAP32[r5+29]=3;HEAP32[r5+30]=0;HEAP32[r5+31]=0;STACKTOP=r3;return r4}}function _custom_params(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=r1>>2;r1=STACKTOP;r3=_malloc(28),r4=r3>>2;if((r3|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r5=_atoi(HEAP32[r2+2]);r6=r3;HEAP32[r6>>2]=r5;r7=_atoi(HEAP32[r2+6]);r8=r3+4|0;HEAP32[r8>>2]=r7;HEAP32[r4+5]=HEAP32[r2+11];if((HEAP32[r2+15]|0)!=0){r9=Math.imul(r5,r7);HEAP32[r6>>2]=r9;HEAP32[r8>>2]=1}HEAP32[r4+6]=HEAP32[r2+19];HEAP32[r4+2]=HEAP32[r2+23];HEAP32[r4+3]=HEAP32[r2+27];HEAP32[r4+4]=3;STACKTOP=r1;return r3}function _new_game_desc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+468|0;r6=r5;r7=r5+96;r8=r5+100;r9=r5+196;r10=r5+292;r11=r5+388,r12=r11>>2;r13=r5+452;r14=(r1|0)>>2;r15=HEAP32[r14];r16=(r1+4|0)>>2;r17=HEAP32[r16];r18=Math.imul(r17,r15);r19=Math.imul(r18,r18);_precompute_sum_bits();r20=(r13|0)>>2;HEAP32[r20]=HEAP32[r1+12>>2];r21=r1+16|0;r22=(r13+4|0)>>2;HEAP32[r22]=HEAP32[r21>>2];if((r15|0)==2&(r17|0)==2){HEAP32[r20]=0}r23=_malloc(r19);if((r23|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r24=_malloc(r19<<3);if((r24|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r25=r24>>2;r26=_malloc(r19);if((r26|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r27=_alloc_block_structure(r15,r17,r19,r18,r18),r28=r27>>2;r29=(r1+24|0)>>2;do{if((HEAP32[r29]|0)==0){r30=0}else{r31=_malloc(r19);if((r31|0)!=0){r30=r31;break}_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}while(0);r31=(r17|0)==1;r32=r27+4|0;r33=r27+8|0;r34=r27+32|0;r35=(r27+16|0)>>2;r36=(r1+20|0)>>2;r37=Math.imul(r19,r19);r38=r18<<2;r39=(r18|0)>0;r40=r19*12&-1;r41=(r18|0)>1;r42=(r2+60|0)>>2;r43=r2|0;r44=r2+40|0;r45=r6|0;r46=r6+4|0;r47=r6+8|0;r48=r6+12|0;r49=r6+16|0;r50=r6+84|0;r51=r6+92|0;r52=r6+88|0;r53=(r19|0)==0;r54=(r13+8|0)>>2;r55=(r13+12|0)>>2;r56=r11|0;r11=r1+8|0;r1=r10|0;r57=r10+4|0;r58=r10+8|0;r59=r10+12|0;r60=r10+16|0;r61=r10+84|0;r62=r10+92|0;r63=r10+88|0;r64=r9|0;r65=r9+4|0;r66=r9+8|0;r67=r9+12|0;r68=r9+16|0;r69=r9+84|0;r70=r9+92|0;r71=r9+88|0;r72=r8|0;r73=r8+4|0;r74=r8+8|0;r75=r8+12|0;r76=r8+16|0;r77=r8+84|0;r78=r8+92|0;r79=r8+88|0;r80=0,r81=r80>>2;L197:while(1){L199:do{if(r31){r82=_divvy_rectangle(r18,r18,r18,r2);r83=Math.imul(HEAP32[r33>>2],HEAP32[r32>>2]);r84=Math.imul(r83,r83);L207:do{if((r84|0)==0){r85=0}else{r83=0;while(1){HEAP32[HEAP32[r35]+(r83<<2)>>2]=-1;r86=r83+1|0;if((r86|0)<(r84|0)){r83=r86}else{r87=0;r88=0;break}}while(1){r83=(r88<<2)+r82|0;r86=HEAP32[r83>>2];do{if((r86&2|0)==0){r89=0;r90=r86;while(1){r91=r90&1^r89;r92=r90>>2;r93=HEAP32[r82+(r92<<2)>>2];if((r93&2|0)==0){r89=r91;r90=r93}else{break}}L216:do{if((r92|0)==(r88|0)){r94=r91;r95=r88}else{r90=r92<<2;r89=r86>>2;r93=r91^r86&1;HEAP32[r83>>2]=r91|r90;if((r89|0)==(r92|0)){r94=r93;r95=r92;break}else{r96=r89;r97=r93}while(1){r93=(r96<<2)+r82|0;r89=HEAP32[r93>>2];r98=r89>>2;r99=r97^r89&1;HEAP32[r93>>2]=r97|r90;if((r98|0)==(r92|0)){r94=r99;r95=r92;break L216}else{r96=r98;r97=r99}}}}while(0);if((r94|0)==0){r100=r95;break}___assert_func(71932,137,73432,71684);r100=r95}else{r100=r88}}while(0);r83=HEAP32[r35];r86=(r100<<2)+r83|0;r90=HEAP32[r86>>2];if((r90|0)<0){HEAP32[r86>>2]=r87;r86=HEAP32[r35];r101=r87+1|0;r102=r86;r103=HEAP32[r86+(r100<<2)>>2]}else{r101=r87;r102=r83;r103=r90}HEAP32[r102+(r88<<2)>>2]=r103;r90=r88+1|0;if((r90|0)<(r84|0)){r87=r101;r88=r90}else{r85=r101;break L207}}}}while(0);if((r85|0)!=(r18|0)){___assert_func(71104,3175,73448,70952)}HEAP32[r34>>2]=r85;if((r82|0)==0){break}_free(r82)}else{if(r39){r104=0}else{break}while(1){r84=r104-(r104|0)%(r15|0)|0;r90=Math.imul(r104,r18);r83=0;while(1){HEAP32[HEAP32[r35]+(r83+r90<<2)>>2]=r84+((r83|0)/(r17|0)&-1)|0;r86=r83+1|0;if((r86|0)==(r18|0)){break}else{r83=r86}}r83=r104+1|0;if((r83|0)==(r18|0)){break L199}else{r104=r83}}}}while(0);_make_blocks_from_whichblock(r27);do{if((HEAP32[r29]|0)==0){r105=r80,r106=r105>>2}else{do{if((r80|0)!=0){r82=r80|0;r83=HEAP32[r82>>2]-1|0;HEAP32[r82>>2]=r83;if((r83|0)!=0){break}r83=HEAP32[r81+4];if((r83|0)!=0){_free(r83)}r83=HEAP32[r81+5];if((r83|0)!=0){_free(r83)}r83=HEAP32[r81+7];if((r83|0)!=0){_free(r83)}r83=HEAP32[r81+6];if((r83|0)!=0){_free(r83)}_free(r80)}}while(0);r83=(HEAP32[r21>>2]|0)>0;r82=_alloc_block_structure(1,r18,r19,r18,r19);L250:do{if(!r53){r84=r82+16|0;r90=0;while(1){HEAP32[HEAP32[r84>>2]+(r90<<2)>>2]=-1;r86=r90+1|0;if((r86|0)<(r19|0)){r90=r86}else{break L250}}}}while(0);L255:do{if(r39){r90=(r82+16|0)>>2;r84=r83^1;r86=0;r99=0;r98=0;while(1){r93=Math.imul(r99,r18);r89=r86;r107=0;r108=r98;while(1){r109=r107+r93|0;r110=(r109<<2)+HEAP32[r90]|0;if((HEAP32[r110>>2]|0)==-1){HEAP32[r110>>2]=r108;r110=HEAP32[r42];if((r110|0)>19){r111=0;while(1){r112=r2+r111|0;r113=HEAP8[r112];if(r113<<24>>24!=-1){r4=194;break}HEAP8[r112]=0;r114=r111+1|0;if((r114|0)<20){r111=r114}else{break}}if(r4==194){r4=0;HEAP8[r112]=r113+1&255}HEAP32[r1>>2]=1732584193;HEAP32[r57>>2]=-271733879;HEAP32[r58>>2]=-1732584194;HEAP32[r59>>2]=271733878;HEAP32[r60>>2]=-1009589776;HEAP32[r61>>2]=0;HEAP32[r62>>2]=0;HEAP32[r63>>2]=0;_SHA_Bytes(r10,r43,40);_SHA_Final(r10,r44);HEAP32[r42]=0;r115=0}else{r115=r110}r111=r115+1|0;HEAP32[r42]=r111;r114=HEAP8[r2+(r115+40)|0]&15;r116=r109+1|0;do{if((r116|0)<(r19|0)){if(!(r114>>>0>3|(r114|0)!=0&r84)){r4=212;break}do{if((r107+1|0)==(r18|0)){r4=208}else{if((HEAP32[HEAP32[r90]+(r116<<2)>>2]|0)!=-1){r4=208;break}if((r109+r18|0)>=(r19|0)){r117=r116;break}if((r111|0)>19){r118=0;while(1){r119=r2+r118|0;r120=HEAP8[r119];if(r120<<24>>24!=-1){r4=204;break}HEAP8[r119]=0;r121=r118+1|0;if((r121|0)<20){r118=r121}else{break}}if(r4==204){r4=0;HEAP8[r119]=r120+1&255}HEAP32[r64>>2]=1732584193;HEAP32[r65>>2]=-271733879;HEAP32[r66>>2]=-1732584194;HEAP32[r67>>2]=271733878;HEAP32[r68>>2]=-1009589776;HEAP32[r69>>2]=0;HEAP32[r70>>2]=0;HEAP32[r71>>2]=0;_SHA_Bytes(r9,r43,40);_SHA_Final(r9,r44);HEAP32[r42]=0;r122=0}else{r122=r111}HEAP32[r42]=r122+1|0;if((HEAP8[r2+(r122+40)|0]&1)<<24>>24==0){r4=208;break}else{r117=r116;break}}}while(0);if(r4==208){r4=0;r117=r109+r18|0}if((r117|0)<(r19|0)){HEAP32[HEAP32[r90]+(r117<<2)>>2]=r108;r123=r89;break}else{r123=r89+1|0;break}}else{r4=212}}while(0);if(r4==212){r4=0;r123=r89+1|0}r124=r108+1|0;r125=r123}else{r124=r108;r125=r89}r109=r107+1|0;if((r109|0)==(r18|0)){break}else{r89=r125;r107=r109;r108=r124}}r108=r99+1|0;if((r108|0)==(r18|0)){r126=r125;r127=r124;break L255}else{r86=r125;r99=r108;r98=r124}}}else{r126=0;r127=0}}while(0);r98=(r82+32|0)>>2;HEAP32[r98]=r127;_make_blocks_from_whichblock(r82);r99=HEAP32[r98];L298:do{if((r99|0)>0){r86=HEAP32[r82+24>>2];r90=0;r84=0;while(1){r108=((HEAP32[r86+(r84<<2)>>2]|0)==1&1)+r90|0;r107=r84+1|0;if((r107|0)==(r99|0)){r128=r108;break L298}else{r90=r108;r84=r107}}}else{r128=0}}while(0);if((r128|0)!=(r126|0)){___assert_func(71104,3518,73292,69724)}if((r126|0)<1|r83^1){r105=r82,r106=r105>>2;break}r99=(r82+24|0)>>2;r84=(r82+20|0)>>2;r90=(r82+16|0)>>2;r86=r126;r107=0;r108=HEAP32[r98];L307:while(1){r89=r107;while(1){if((r89|0)>=(r108|0)){break L307}if((HEAP32[HEAP32[r99]+(r89<<2)>>2]|0)>1){r89=r89+1|0}else{break}}r93=HEAP32[HEAP32[HEAP32[r84]+(r89<<2)>>2]>>2];r109=(r93|0)/(r18|0)&-1;r116=r93+1|0;do{if((r116|0)==(r19|0)){r129=r93-1|0}else{if(((r93|0)%(r18|0)+1|0)<(r18|0)){if((r109+1|0)==(r18|0)){r129=r116;break}r111=HEAP32[r42];if((r111|0)>19){r114=0;while(1){r130=r2+r114|0;r131=HEAP8[r130];if(r131<<24>>24!=-1){r4=232;break}HEAP8[r130]=0;r110=r114+1|0;if((r110|0)<20){r114=r110}else{break}}if(r4==232){r4=0;HEAP8[r130]=r131+1&255}HEAP32[r72>>2]=1732584193;HEAP32[r73>>2]=-271733879;HEAP32[r74>>2]=-1732584194;HEAP32[r75>>2]=271733878;HEAP32[r76>>2]=-1009589776;HEAP32[r77>>2]=0;HEAP32[r78>>2]=0;HEAP32[r79>>2]=0;_SHA_Bytes(r8,r43,40);_SHA_Final(r8,r44);HEAP32[r42]=0;r132=0}else{r132=r111}HEAP32[r42]=r132+1|0;if((HEAP8[r2+(r132+40)|0]&1)<<24>>24==0){r129=r116;break}}r129=r93+r18|0}}while(0);r93=HEAP32[r90];r116=HEAP32[r93+(r129<<2)>>2];r109=HEAP32[r99];r114=(((HEAP32[r109+(r116<<2)>>2]|0)==1)<<31>>31)+(r86-1)|0;r110=(r116|0)<(r89|0);r118=r110?r89:r116;r121=r110?r116:r89;r110=HEAP32[r109+(r118<<2)>>2];r133=HEAP32[r84];L329:do{if((r110|0)>0){HEAP32[r93+(HEAP32[HEAP32[r133+(r118<<2)>>2]>>2]<<2)>>2]=r121;r134=HEAP32[r99];r135=HEAP32[r134+(r118<<2)>>2];r136=HEAP32[r84];if((r135|0)>1){r137=1;r138=r136}else{r139=r134;r140=r135;r141=r136;break}while(1){HEAP32[HEAP32[r90]+(HEAP32[HEAP32[r138+(r118<<2)>>2]+(r137<<2)>>2]<<2)>>2]=r121;r136=r137+1|0;r135=HEAP32[r99];r134=HEAP32[r135+(r118<<2)>>2];r142=HEAP32[r84];if((r136|0)<(r134|0)){r137=r136;r138=r142}else{r139=r135;r140=r134;r141=r142;break L329}}}else{r139=r109;r140=r110;r141=r133}}while(0);_memcpy((HEAP32[r139+(r121<<2)>>2]<<2)+HEAP32[r141+(r121<<2)>>2]|0,HEAP32[r141+(r118<<2)>>2],r140<<2);r133=HEAP32[r99];r110=(r121<<2)+r133|0;HEAP32[r110>>2]=HEAP32[r110>>2]+HEAP32[r133+(r118<<2)>>2]|0;r133=HEAP32[r98]-1|0;if((r118|0)!=(r133|0)){r110=HEAP32[r84];_memcpy(HEAP32[r110+(r118<<2)>>2],HEAP32[r110+(r133<<2)>>2],HEAP32[HEAP32[r99]+(r133<<2)>>2]<<2);r110=HEAP32[r99];r109=HEAP32[r110+(r133<<2)>>2];L336:do{if((r109|0)>0){r93=0;while(1){HEAP32[HEAP32[r90]+(HEAP32[HEAP32[HEAP32[r84]+(r133<<2)>>2]+(r93<<2)>>2]<<2)>>2]=r118;r111=r93+1|0;r142=HEAP32[r99];r134=HEAP32[r142+(r133<<2)>>2];if((r111|0)<(r134|0)){r93=r111}else{r143=r142;r144=r134;break L336}}}else{r143=r110;r144=r109}}while(0);HEAP32[r143+(r118<<2)>>2]=r144}HEAP32[r98]=r133;r86=r114;r107=((r89|0)<(r116|0)&1)+r89|0;r108=r133}if((r86|0)==0){r105=r82,r106=r105>>2;break}___assert_func(71104,3546,73292,69704);r105=r82,r106=r105>>2}}while(0);r108=HEAP32[r36];HEAP32[r7>>2]=r37;_memset(r23,0,r19);r107=_malloc(48),r98=r107>>2;if((r107|0)==0){r4=248;break}r99=r107;HEAP32[r98]=r18;HEAP32[r98+1]=r27;HEAP32[r98+3]=r23;r84=_malloc(r38);if((r84|0)==0){r4=250;break}r90=(r107+16|0)>>2;HEAP32[r90]=r84;r84=_malloc(r38);if((r84|0)==0){r4=252;break}r83=(r107+20|0)>>2;HEAP32[r83]=r84;r84=_malloc(r38);if((r84|0)==0){r4=254;break}r109=(r107+24|0)>>2;HEAP32[r109]=r84;r145=(r105|0)==0;if(r145){HEAP32[r98+7]=0}else{HEAP32[r98+2]=r105;r84=r105+32|0;r110=_malloc(HEAP32[r84>>2]<<2);if((r110|0)==0){r4=257;break}HEAP32[r98+7]=r110;_memset(r110,0,HEAP32[r84>>2]<<2)}_memset(HEAP32[r90],0,r38);_memset(HEAP32[r83],0,r38);_memset(HEAP32[r109],0,r38);if((r108|0)==0){HEAP32[r98+8]=0}else{r108=_malloc(8);if((r108|0)==0){r4=262;break}HEAP32[r98+8]=r108;r84=r108;HEAP32[r84>>2]=0;HEAP32[r84+4>>2]=0}L358:do{if(r39){r84=0;while(1){r108=r84+1|0;HEAP8[r23+r84|0]=r108&255;if((r108|0)==(r18|0)){break}else{r84=r108}}_shuffle(r23,r18,1,r2);r84=0;while(1){_gridgen_place(r99,r84,0,HEAP8[r23+r84|0]);r82=r84+1|0;if((r82|0)==(r18|0)){break L358}else{r84=r82}}}else{_shuffle(r23,r18,1,r2)}}while(0);r84=_malloc(r40);if((r84|0)==0){r4=271;break}r82=(r107+36|0)>>2;HEAP32[r82]=r84;r84=(r107+40|0)>>2;HEAP32[r84]=0;HEAP32[r98+11]=r2;L367:do{if(r41){r86=1;r108=0;while(1){L370:do{if(r39){r110=0;r121=r108;while(1){HEAP32[HEAP32[r82]+(r121*12&-1)>>2]=r110;HEAP32[HEAP32[r82]+(HEAP32[r84]*12&-1)+4>>2]=r86;r93=0;r134=0;r142=HEAP32[r42];while(1){if((r142|0)>19){r111=0;while(1){r146=r2+r111|0;r147=HEAP8[r146];if(r147<<24>>24!=-1){r4=277;break}HEAP8[r146]=0;r135=r111+1|0;if((r135|0)<20){r111=r135}else{break}}if(r4==277){r4=0;HEAP8[r146]=r147+1&255}HEAP32[r45>>2]=1732584193;HEAP32[r46>>2]=-271733879;HEAP32[r47>>2]=-1732584194;HEAP32[r48>>2]=271733878;HEAP32[r49>>2]=-1009589776;HEAP32[r50>>2]=0;HEAP32[r51>>2]=0;HEAP32[r52>>2]=0;_SHA_Bytes(r6,r43,40);_SHA_Final(r6,r44);HEAP32[r42]=0;r148=0}else{r148=r142}r111=r148+1|0;HEAP32[r42]=r111;r149=HEAPU8[r2+(r148+40)|0]|r93<<8;r135=r134+8|0;if((r135|0)<31){r93=r149;r134=r135;r142=r111}else{break}}HEAP32[HEAP32[r82]+(HEAP32[r84]*12&-1)+8>>2]=r149&2147483647;r142=HEAP32[r84]+1|0;HEAP32[r84]=r142;r134=r110+1|0;if((r134|0)==(r18|0)){r150=r142;break L370}else{r110=r134;r121=r142}}}else{r150=r108}}while(0);r133=r86+1|0;if((r133|0)==(r18|0)){break L367}else{r86=r133;r108=r150}}}}while(0);r84=_gridgen_real(r99,r7);r108=HEAP32[r82];if((r108|0)!=0){_free(r108)}r108=HEAP32[r98+7];if((r108|0)!=0){_free(r108)}r108=HEAP32[r109];if((r108|0)!=0){_free(r108)}r108=HEAP32[r83];if((r108|0)!=0){_free(r108)}r108=HEAP32[r90];if((r108|0)!=0){_free(r108)}_free(r107);if((r84|0)==0){r80=r105,r81=r80>>2;continue}if((_check_valid(r18,r27,r105,HEAP32[r36],r23)|0)==0){___assert_func(71104,3621,73100,69804)}r84=HEAP32[r3>>2];if((r84|0)!=0){_free(r84)}r84=_encode_solve_move(r18,r23);HEAP32[r3>>2]=r84;if((HEAP32[r29]|0)==0){L410:do{if(r39){r84=0;r108=0;while(1){r86=Math.imul(r84,r18);r133=0;r89=r108;while(1){r116=r133+r86|0;r114=_symmetries(HEAP32[r14],HEAP32[r16],r133,r84,r56,HEAP32[r11>>2]);r118=0;while(1){if((r118|0)>=(r114|0)){break}r121=r118<<1;if((Math.imul(HEAP32[((r121|1)<<2>>2)+r12],r18)+HEAP32[(r121<<2>>2)+r12]|0)<(r116|0)){break}else{r118=r118+1|0}}if((r118|0)==(r114|0)){HEAP32[(r89<<3>>2)+r25]=r133;HEAP32[((r89<<3)+4>>2)+r25]=r84;r151=r89+1|0}else{r151=r89}r116=r133+1|0;if((r116|0)==(r18|0)){break}else{r133=r116;r89=r151}}r89=r84+1|0;if((r89|0)==(r18|0)){break}else{r84=r89;r108=r151}}_shuffle(r24,r151,8,r2);if((r151|0)>0){r152=0}else{break}while(1){r108=HEAP32[(r152<<3>>2)+r25];r84=HEAP32[((r152<<3)+4>>2)+r25];_memcpy(r26,r23,r19);r89=_symmetries(HEAP32[r14],HEAP32[r16],r108,r84,r56,HEAP32[r11>>2]);r84=(r89|0)>0;L427:do{if(r84){r108=0;while(1){r133=r108<<1;r86=Math.imul(HEAP32[((r133|1)<<2>>2)+r12],r18);HEAP8[r26+r86+HEAP32[(r133<<2>>2)+r12]|0]=0;r133=r108+1|0;if((r133|0)==(r89|0)){break L427}else{r108=r133}}}}while(0);_solver(r18,r27,r105,HEAP32[r36],r26,r30,r13);L431:do{if((HEAP32[r54]|0)<=(HEAP32[r20]|0)){do{if((HEAP32[r29]|0)==0){if(r84){r153=0;break}else{break L431}}else{if((HEAP32[r55]|0)>(HEAP32[r22]|0)|r84^1){break L431}else{r153=0;break}}}while(0);while(1){r108=r153<<1;r114=Math.imul(HEAP32[((r108|1)<<2>>2)+r12],r18);HEAP8[r23+r114+HEAP32[(r108<<2>>2)+r12]|0]=0;r108=r153+1|0;if((r108|0)==(r89|0)){break L431}else{r153=r108}}}}while(0);r89=r152+1|0;if((r89|0)==(r151|0)){break L410}else{r152=r89}}}else{_shuffle(r24,0,8,r2)}}while(0);_memcpy(r26,r23,r19);_solver(r18,r27,r105,HEAP32[r36],r26,r30,r13);if((HEAP32[r54]|0)!=(HEAP32[r20]|0)){r80=r105,r81=r80>>2;continue}if((HEAP32[r29]|0)==0){r154=r105,r155=r154>>2;break}if((HEAP32[r55]|0)==(HEAP32[r22]|0)){r154=r105,r155=r154>>2;break}else{r80=r105,r81=r80>>2;continue}}_memcpy(r26,r23,r19);_memset(r30,0,r19);r156=(r105+32|0)>>2;L443:do{if((HEAP32[r156]|0)>0){r107=r105+16|0;r90=0;while(1){L447:do{if(r53){r157=0}else{r83=HEAP32[r107>>2];r109=0;r98=0;while(1){if((HEAP32[r83+(r109<<2)>>2]|0)==(r90|0)){r158=HEAPU8[r26+r109|0]+r98|0}else{r158=r98}r82=r109+1|0;if((r82|0)==(r19|0)){r157=r158;break L447}else{r109=r82;r98=r158}}}}while(0);r98=0;while(1){if((r98|0)>=(r19|0)){break}if((HEAP32[HEAP32[r107>>2]+(r98<<2)>>2]|0)==(r90|0)){break}else{r98=r98+1|0}}if((r98|0)==(r19|0)){___assert_func(71104,3473,73492,69744)}HEAP8[r30+r98|0]=r157&255;r109=r90+1|0;if((r109|0)<(HEAP32[r156]|0)){r90=r109}else{break L443}}}}while(0);_memset(r23,0,r19);_solver(r18,r27,r105,HEAP32[r36],r23,r30,r13);r90=HEAP32[r54];r107=HEAP32[r20];do{if((r90|0)==(r107|0)){if((HEAP32[r55]|0)!=(HEAP32[r22]|0)){break}r109=r105+12|0;r83=r105+36|0;r159=_alloc_block_structure(HEAP32[r106+1],HEAP32[r106+2],HEAP32[r109>>2],HEAP32[r83>>2],HEAP32[r156]);r160=r105+24|0;_memcpy(HEAP32[r159+24>>2],HEAP32[r160>>2],HEAP32[r156]<<2);r161=(r159+16|0)>>2;r162=r105+16|0;_memcpy(HEAP32[r161],HEAP32[r162>>2],HEAP32[r109>>2]<<2);r163=r159+28|0;r164=r105+28|0;_memcpy(HEAP32[r163>>2],HEAP32[r164>>2],Math.imul(HEAP32[r156]<<2,HEAP32[r83>>2]));if((HEAP32[r156]|0)>0){r4=317;break L197}_merge_some_cages(r105,r18);if((r159|0)==0){r80=r105,r81=r80>>2;continue L197}else{r4=339;break L197}}}while(0);if((r90|0)>(r107|0)){r80=r105,r81=r80>>2;continue}if((HEAP32[r55]|0)>(HEAP32[r22]|0)){r80=r105,r81=r80>>2;continue}r83=r105+12|0;r109=r105+36|0;r82=_alloc_block_structure(HEAP32[r106+1],HEAP32[r106+2],HEAP32[r83>>2],HEAP32[r109>>2],HEAP32[r156]);r99=r82+24|0;_memcpy(HEAP32[r99>>2],HEAP32[r106+6],HEAP32[r156]<<2);r89=r82+16|0;_memcpy(HEAP32[r89>>2],HEAP32[r106+4],HEAP32[r83>>2]<<2);r83=(r82+28|0)>>2;_memcpy(HEAP32[r83],HEAP32[r106+7],Math.imul(HEAP32[r156]<<2,HEAP32[r109>>2]));if((HEAP32[r156]|0)>0){r109=r82+36|0;r84=r82+20|0;r108=0;while(1){r114=HEAP32[r83]+(Math.imul(HEAP32[r109>>2],r108)<<2)|0;HEAP32[HEAP32[r84>>2]+(r108<<2)>>2]=r114;r114=r108+1|0;if((r114|0)<(HEAP32[r156]|0)){r108=r114}else{break}}_merge_some_cages(r105,r18)}else{_merge_some_cages(r105,r18);if((r82|0)==0){r80=r105,r81=r80>>2;continue}}r108=r82|0;r84=HEAP32[r108>>2]-1|0;HEAP32[r108>>2]=r84;if((r84|0)!=0){r80=r105,r81=r80>>2;continue}r84=HEAP32[r89>>2];if((r84|0)!=0){_free(r84)}r84=HEAP32[r82+20>>2];if((r84|0)!=0){_free(r84)}r84=HEAP32[r83];if((r84|0)!=0){_free(r84)}r84=HEAP32[r99>>2];if((r84|0)!=0){_free(r84)}if((r82|0)==0){r80=r105,r81=r80>>2;continue}_free(r82);r80=r105,r81=r80>>2}do{if(r4==248){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==250){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==252){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==254){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==257){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==262){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==271){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r4==317){r80=r159+36|0;r81=r159+20|0;r22=0;while(1){r55=HEAP32[r163>>2]+(Math.imul(HEAP32[r80>>2],r22)<<2)|0;HEAP32[HEAP32[r81>>2]+(r22<<2)>>2]=r55;r55=r22+1|0;if((r55|0)<(HEAP32[r156]|0)){r22=r55}else{break}}_merge_some_cages(r105,r18);r4=339;break}}while(0);if(r4==339){r18=r105|0;r156=HEAP32[r18>>2]-1|0;HEAP32[r18>>2]=r156;do{if((r156|0)==0){r18=HEAP32[r162>>2];if((r18|0)!=0){_free(r18)}r18=HEAP32[r106+5];if((r18|0)!=0){_free(r18)}r18=HEAP32[r164>>2];if((r18|0)!=0){_free(r18)}r18=HEAP32[r160>>2];if((r18|0)!=0){_free(r18)}if(r145){break}_free(r105)}}while(0);_memset(r30,0,r19);r105=r159+32|0;L521:do{if((HEAP32[r105>>2]|0)>0){r145=0;while(1){L524:do{if(r53){r165=0}else{r160=HEAP32[r161];r164=0;r106=0;while(1){if((HEAP32[r160+(r164<<2)>>2]|0)==(r145|0)){r166=HEAPU8[r26+r164|0]+r106|0}else{r166=r106}r162=r164+1|0;if((r162|0)==(r19|0)){r165=r166;break L524}else{r164=r162;r106=r166}}}}while(0);r106=0;while(1){if((r106|0)>=(r19|0)){break}if((HEAP32[HEAP32[r161]+(r106<<2)>>2]|0)==(r145|0)){break}else{r106=r106+1|0}}if((r106|0)==(r19|0)){___assert_func(71104,3473,73492,69744)}HEAP8[r30+r106|0]=r165&255;r164=r145+1|0;if((r164|0)<(HEAP32[r105>>2]|0)){r145=r164}else{break L521}}}}while(0);_memset(r23,0,r19);r154=r159,r155=r154>>2}_free(r26);_free(r24);r24=HEAP32[r16];r16=Math.imul(r24,HEAP32[r14]);r14=Math.imul(r16,r16);r16=r14>>>0>26;if(r16){r167=Math.floor(((r14-27|0)>>>0)/26)+2|0}else{r167=1}r26=Math.imul(r167,r14);r167=(r24|0)==1;if(r167){r24=Math.imul(HEAP32[r33>>2],HEAP32[r32>>2]);r32=Math.imul(r24,r24);if(r32>>>0>26){r168=Math.floor(((r32-27|0)>>>0)/26)+2|0}else{r168=1}r169=r26+Math.imul(r168,r32)+2|0}else{r169=r26+1|0}if((HEAP32[r29]|0)==0){r170=r169}else{r26=Math.imul(HEAP32[r155+2],HEAP32[r155+1]);r32=Math.imul(r26,r26);if(r32>>>0>26){r171=Math.floor(((r32-27|0)>>>0)/26)+2|0}else{r171=1}r26=Math.imul(r171,r32);if(r16){r172=Math.floor(((r14-27|0)>>>0)/26)+2|0}else{r172=1}r170=r169+r26+Math.imul(r172,r14)+2|0}r172=_malloc(r170);if((r172|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r26=r14+1|0;r169=0;r16=r172;r32=0;while(1){do{if((r169|0)<(r14|0)){r171=HEAP8[r23+r169|0];if(r171<<24>>24!=0){r173=r171&255;r4=402;break}r174=r32+1|0;r175=r16;break}else{r173=-1;r4=402}}while(0);do{if(r4==402){r4=0;L570:do{if((r32|0)==0){if(!(r16>>>0>r172>>>0&(r173|0)>0)){r176=r16;break}HEAP8[r16]=95;r176=r16+1|0}else{if((r32|0)>0){r177=r16;r178=r32}else{r176=r16;break}while(1){r171=r178+96|0;r168=(r178|0)>26?122:r171;r24=r177+1|0;HEAP8[r177]=r168&255;r33=r171-r168|0;if((r33|0)>0){r177=r24;r178=r33}else{r176=r24;break L570}}}}while(0);if((r173|0)<=0){r174=0;r175=r176;break}r174=0;r175=r176+_sprintf(r176,71512,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r173,tempInt))|0}}while(0);r106=r169+1|0;if((r106|0)==(r26|0)){break}else{r169=r106;r16=r175;r32=r174}}if(r167){HEAP8[r175]=44;r179=_encode_block_structure_desc(r175+1|0,r27)}else{r179=r175}L583:do{if((HEAP32[r29]|0)==0){r180=r179}else{HEAP8[r179]=44;r175=_encode_block_structure_desc(r179+1|0,r154);r167=r175+1|0;HEAP8[r175]=44;r175=0;r174=r167;r32=0;while(1){do{if((r175|0)<(r14|0)){r16=HEAP8[r30+r175|0];if(r16<<24>>24!=0){r181=r16&255;r4=417;break}r182=r32+1|0;r183=r174;break}else{r181=-1;r4=417}}while(0);do{if(r4==417){r4=0;L592:do{if((r32|0)==0){if(!(r174>>>0>r167>>>0&(r181|0)>0)){r184=r174;break}HEAP8[r174]=95;r184=r174+1|0}else{if((r32|0)>0){r185=r174;r186=r32}else{r184=r174;break}while(1){r16=r186+96|0;r169=(r186|0)>26?122:r16;r173=r185+1|0;HEAP8[r185]=r169&255;r176=r16-r169|0;if((r176|0)>0){r185=r173;r186=r176}else{r184=r173;break L592}}}}while(0);if((r181|0)<=0){r182=0;r183=r184;break}r182=0;r183=r184+_sprintf(r184,71512,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r181,tempInt))|0}}while(0);r173=r175+1|0;if((r173|0)==(r26|0)){r180=r183;break L583}else{r175=r173;r174=r183;r32=r182}}}}while(0);r182=r172;if((r180-r182|0)>=(r170|0)){___assert_func(71104,3338,73400,69784)}HEAP8[r180]=0;r170=_realloc(r172,r180+1-r182|0);if((r170|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_free(r23);r23=r27|0;r182=HEAP32[r23>>2]-1|0;HEAP32[r23>>2]=r182;do{if((r182|0)==0){r23=HEAP32[r35];if((r23|0)!=0){_free(r23)}r23=HEAP32[r28+5];if((r23|0)!=0){_free(r23)}r23=HEAP32[r28+7];if((r23|0)!=0){_free(r23)}r23=HEAP32[r28+6];if((r23|0)!=0){_free(r23)}if((r27|0)==0){break}_free(r27)}}while(0);if((HEAP32[r29]|0)==0){STACKTOP=r5;return r170}r29=r154|0;r27=HEAP32[r29>>2]-1|0;HEAP32[r29>>2]=r27;do{if((r27|0)==0){r29=HEAP32[r155+4];if((r29|0)!=0){_free(r29)}r29=HEAP32[r155+5];if((r29|0)!=0){_free(r29)}r29=HEAP32[r155+7];if((r29|0)!=0){_free(r29)}r29=HEAP32[r155+6];if((r29|0)!=0){_free(r29)}if((r154|0)==0){break}_free(r154)}}while(0);if((r30|0)==0){STACKTOP=r5;return r170}_free(r30);STACKTOP=r5;return r170}function _validate_desc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+4|0;r5=r4,r6=r5>>2;HEAP32[r6]=r2;r7=HEAP32[r1+4>>2];r8=Math.imul(r7,HEAP32[r1>>2]);r9=Math.imul(r8,r8);r10=r2;r2=0;L648:while(1){r11=r10;while(1){r12=HEAP8[r11];if(r12<<24>>24==0|r12<<24>>24==44){r3=468;break L648}r13=r11+1|0;if((r12-97&255)<26){r3=463;break}if(r12<<24>>24==95){r11=r13}else{break}}if(r3==463){r3=0;r10=r13;r2=(r12<<24>>24)+(r2-96)|0;continue}if((r12-49&255)>=9){r14=70912;break}r15=_atoi(r11);if((r15|0)<1|(r15|0)>(r8|0)){r14=70020;break}else{r16=r13}while(1){if((HEAP8[r16]-48&255)<10){r16=r16+1|0}else{break}}r10=r16;r2=r2+1|0}L661:do{if(r3==468){if((r2|0)<(r9|0)){r14=69988;break}if((r2|0)>(r9|0)){r14=69956;break}HEAP32[r6]=r11;if((r7|0)==1){if(HEAP8[r11]<<24>>24!=44){r14=70560;break}HEAP32[r6]=r11+1|0;r16=_validate_block_desc(r5,r8,r9,r8,r8,r8,r8);if((r16|0)!=0){r14=r16;break}}r16=HEAP32[r6];if((HEAP32[r1+24>>2]|0)==0){r17=r16}else{if(HEAP8[r16]<<24>>24!=44){r14=70508;break}HEAP32[r6]=r16+1|0;r16=_validate_block_desc(r5,r8,r9,r8,r9,2,r8);if((r16|0)!=0){r14=r16;break}r16=HEAP32[r6];if(HEAP8[r16]<<24>>24!=44){r14=70460;break}r10=r16+1|0;HEAP32[r6]=r10;r16=Math.imul(r9,r8);r13=r10;r10=0;L674:while(1){r18=r13;while(1){r19=HEAP8[r18];if(r19<<24>>24==0|r19<<24>>24==44){break L674}r20=r18+1|0;if((r19-97&255)<26){r3=482;break}if(r19<<24>>24==95){r18=r20}else{break}}if(r3==482){r3=0;r13=r20;r10=(r19<<24>>24)+(r10-96)|0;continue}if((r19-49&255)>=9){r14=70912;break L661}r12=_atoi(r18);if((r12|0)<1|(r12|0)>(r16|0)){r14=70020;break L661}else{r21=r20}while(1){if((HEAP8[r21]-48&255)<10){r21=r21+1|0}else{break}}r13=r21;r10=r10+1|0}if((r10|0)<(r9|0)){r14=69988;break}if((r10|0)>(r9|0)){r14=69956;break}HEAP32[r6]=r18;r17=r18}r14=HEAP8[r17]<<24>>24==0?0:70340}}while(0);STACKTOP=r4;return r14}function _new_game(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55;r1=STACKTOP;STACKTOP=STACKTOP+12|0;r4=r1,r5=r4>>2;r6=r1+4;r7=r1+8;HEAP32[r5]=r3;r8=_malloc(44),r9=r8>>2;if((r8|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=r8;r11=HEAP32[r2>>2];r12=HEAP32[r2+4>>2];r13=Math.imul(r12,r11);r14=Math.imul(r13,r13);_precompute_sum_bits();HEAP32[r9]=r13;HEAP32[r9+3]=HEAP32[r2+20>>2];r15=(r2+24|0)>>2;HEAP32[r9+4]=HEAP32[r15];r2=_malloc(r14);if((r2|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r16=(r8+20|0)>>2;HEAP32[r16]=r2;r2=Math.imul(r14,r13);r17=_malloc(r2);if((r17|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r9+7]=r17;_memset(r17,0,r2);r2=_malloc(r14);if((r2|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r17=r8+32|0;HEAP32[r17>>2]=r2;_memset(r2,0,r14);r2=_alloc_block_structure(r11,r12,r14,r13,r13);r18=(r8+4|0)>>2;HEAP32[r18]=r2;do{if((HEAP32[r15]|0)==0){HEAP32[r9+2]=0;HEAP32[r9+6]=0}else{r2=_alloc_block_structure(r11,r12,r14,r13,r14);HEAP32[r9+2]=r2;r2=_malloc(r14);if((r2|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r9+6]=r2;break}}}while(0);HEAP32[r9+10]=0;HEAP32[r9+9]=0;r2=_spec_to_grid(r3,HEAP32[r16],r14);HEAP32[r5]=r2;L712:do{if((r14|0)!=0){r3=0;while(1){if(HEAP8[HEAP32[r16]+r3|0]<<24>>24!=0){HEAP8[HEAP32[r17>>2]+r3|0]=1}r19=r3+1|0;if((r19|0)<(r14|0)){r3=r19}else{break L712}}}}while(0);L719:do{if((r12|0)==1){if(HEAP8[r2]<<24>>24!=44){___assert_func(71104,4073,73116,71088)}HEAP32[r5]=r2+1|0;if((_spec_to_dsf(r4,r6,r13,r14)|0)!=0){___assert_func(71104,4076,73116,71076)}r17=HEAP32[r6>>2];r16=HEAP32[r18],r3=r16>>2;r19=Math.imul(HEAP32[r3+2],HEAP32[r3+1]);r20=Math.imul(r19,r19);L733:do{if((r20|0)==0){r21=0}else{r19=(r16+16|0)>>2;r22=0;while(1){HEAP32[HEAP32[r19]+(r22<<2)>>2]=-1;r23=r22+1|0;if((r23|0)<(r20|0)){r22=r23}else{r24=0;r25=0;break}}while(1){r22=(r25<<2)+r17|0;r23=HEAP32[r22>>2];do{if((r23&2|0)==0){r26=0;r27=r23;while(1){r28=r27&1^r26;r29=r27>>2;r30=HEAP32[r17+(r29<<2)>>2];if((r30&2|0)==0){r26=r28;r27=r30}else{break}}L743:do{if((r29|0)==(r25|0)){r31=r28;r32=r25}else{r27=r29<<2;r26=r23>>2;r30=r28^r23&1;HEAP32[r22>>2]=r28|r27;if((r26|0)==(r29|0)){r31=r30;r32=r29;break}else{r33=r26;r34=r30}while(1){r30=(r33<<2)+r17|0;r26=HEAP32[r30>>2];r35=r26>>2;r36=r34^r26&1;HEAP32[r30>>2]=r34|r27;if((r35|0)==(r29|0)){r31=r36;r32=r29;break L743}else{r33=r35;r34=r36}}}}while(0);if((r31|0)==0){r37=r32;break}___assert_func(71932,137,73432,71684);r37=r32}else{r37=r25}}while(0);r22=HEAP32[r19];r23=(r37<<2)+r22|0;r27=HEAP32[r23>>2];if((r27|0)<0){HEAP32[r23>>2]=r24;r23=HEAP32[r19];r38=r24+1|0;r39=r23;r40=HEAP32[r23+(r37<<2)>>2]}else{r38=r24;r39=r22;r40=r27}HEAP32[r39+(r25<<2)>>2]=r40;r27=r25+1|0;if((r27|0)<(r20|0)){r24=r38;r25=r27}else{r21=r38;break L733}}}}while(0);if((r21|0)!=(r13|0)){___assert_func(71104,3175,73448,70952)}HEAP32[r3+8]=r21;if((r17|0)==0){break}_free(r17)}else{if((r13|0)>0){r41=0}else{break}while(1){r20=r41-(r41|0)%(r11|0)|0;r16=Math.imul(r41,r13);r19=0;while(1){HEAP32[HEAP32[HEAP32[r18]+16>>2]+(r19+r16<<2)>>2]=r20+((r19|0)/(r12|0)&-1)|0;r27=r19+1|0;if((r27|0)==(r13|0)){break}else{r19=r27}}r19=r41+1|0;if((r19|0)==(r13|0)){break L719}else{r41=r19}}}}while(0);_make_blocks_from_whichblock(HEAP32[r18]);r18=HEAP32[r5];if((HEAP32[r15]|0)==0){r42=r18}else{if(HEAP8[r18]<<24>>24!=44){___assert_func(71104,4091,73116,71088)}HEAP32[r5]=r18+1|0;if((_spec_to_dsf(r4,r7,r13,r14)|0)!=0){___assert_func(71104,4094,73116,71076)}r4=HEAP32[r7>>2];r7=r8+8|0;r8=HEAP32[r7>>2],r18=r8>>2;r15=Math.imul(HEAP32[r18+2],HEAP32[r18+1]);r41=Math.imul(r15,r15);L767:do{if((r41|0)==0){r43=0}else{r15=(r8+16|0)>>2;r12=0;while(1){HEAP32[HEAP32[r15]+(r12<<2)>>2]=-1;r11=r12+1|0;if((r11|0)<(r41|0)){r12=r11}else{r44=0;r45=0;break}}while(1){r12=(r45<<2)+r4|0;r11=HEAP32[r12>>2];do{if((r11&2|0)==0){r21=0;r38=r11;while(1){r46=r38&1^r21;r47=r38>>2;r25=HEAP32[r4+(r47<<2)>>2];if((r25&2|0)==0){r21=r46;r38=r25}else{break}}L777:do{if((r47|0)==(r45|0)){r48=r46;r49=r45}else{r38=r47<<2;r21=r11>>2;r25=r46^r11&1;HEAP32[r12>>2]=r46|r38;if((r21|0)==(r47|0)){r48=r25;r49=r47;break}else{r50=r21;r51=r25}while(1){r25=(r50<<2)+r4|0;r21=HEAP32[r25>>2];r24=r21>>2;r40=r51^r21&1;HEAP32[r25>>2]=r51|r38;if((r24|0)==(r47|0)){r48=r40;r49=r47;break L777}else{r50=r24;r51=r40}}}}while(0);if((r48|0)==0){r52=r49;break}___assert_func(71932,137,73432,71684);r52=r49}else{r52=r45}}while(0);r12=HEAP32[r15];r11=(r52<<2)+r12|0;r38=HEAP32[r11>>2];if((r38|0)<0){HEAP32[r11>>2]=r44;r11=HEAP32[r15];r53=r44+1|0;r54=r11;r55=HEAP32[r11+(r52<<2)>>2]}else{r53=r44;r54=r12;r55=r38}HEAP32[r54+(r45<<2)>>2]=r55;r38=r45+1|0;if((r38|0)<(r41|0)){r44=r53;r45=r38}else{r43=r53;break L767}}}}while(0);if((r43|0)<(r13|0)|(r43|0)>(r14|0)){___assert_func(71104,3175,73448,70952)}HEAP32[r18+8]=r43;if((r4|0)!=0){_free(r4)}_make_blocks_from_whichblock(HEAP32[r7>>2]);r7=HEAP32[r5];if(HEAP8[r7]<<24>>24!=44){___assert_func(71104,4099,73116,71088)}r4=_spec_to_grid(r7+1|0,HEAP32[r9+6],r14);HEAP32[r5]=r4;r42=r4}if(HEAP8[r42]<<24>>24==0){STACKTOP=r1;return r10}___assert_func(71104,4103,73116,71024);STACKTOP=r1;return r10}function _dup_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=r1>>2;r3=STACKTOP;r4=_malloc(44),r5=r4>>2;if((r4|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r6=r4;r4=HEAP32[r2];r7=Math.imul(r4,r4);HEAP32[r5]=r4;HEAP32[r5+3]=HEAP32[r2+3];r8=r1+16|0;HEAP32[r5+4]=HEAP32[r8>>2];r1=HEAP32[r2+1];HEAP32[r5+1]=r1;r9=r1|0;HEAP32[r9>>2]=HEAP32[r9>>2]+1|0;r9=HEAP32[r2+2];HEAP32[r5+2]=r9;if((r9|0)!=0){r1=r9|0;HEAP32[r1>>2]=HEAP32[r1>>2]+1|0}r1=_malloc(r7);if((r1|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r5+5]=r1;_memcpy(r1,HEAP32[r2+5],r7);do{if((HEAP32[r8>>2]|0)==0){HEAP32[r5+6]=0}else{r1=_malloc(r7);if((r1|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r5+6]=r1;_memcpy(r1,HEAP32[r2+6],r7);break}}}while(0);r8=Math.imul(r7,r4);r4=_malloc(r8);if((r4|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r5+7]=r4;_memcpy(r4,HEAP32[r2+7],r8);r8=_malloc(r7);if((r8|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r5+8]=r8;_memcpy(r8,HEAP32[r2+8],r7);HEAP32[r5+9]=HEAP32[r2+9];HEAP32[r5+10]=HEAP32[r2+10];STACKTOP=r3;return r6}}function _encode_ui(r1){return 0}function _decode_ui(r1,r2){return}function _game_can_format_as_text_now(r1){return(HEAP32[r1+24>>2]|0)==0&1}function _game_changed_state(r1,r2,r3){var r4;r2=r1+12|0;if((HEAP32[r2>>2]|0)==0){return}if((HEAP32[r1+8>>2]|0)==0){return}if((HEAP32[r1+16>>2]|0)!=0){return}r4=Math.imul(HEAP32[r1+4>>2],HEAP32[r3>>2]);if(HEAP8[HEAP32[r3+20>>2]+r4+HEAP32[r1>>2]|0]<<24>>24==0){return}HEAP32[r2>>2]=0;return}function _free_game(r1){var r2,r3,r4,r5,r6;r2=r1>>2;r3=HEAP32[r2+1],r4=r3>>2;r5=r3|0;r6=HEAP32[r5>>2]-1|0;HEAP32[r5>>2]=r6;do{if((r6|0)==0){r5=HEAP32[r4+4];if((r5|0)!=0){_free(r5)}r5=HEAP32[r4+5];if((r5|0)!=0){_free(r5)}r5=HEAP32[r4+7];if((r5|0)!=0){_free(r5)}r5=HEAP32[r4+6];if((r5|0)!=0){_free(r5)}if((r3|0)==0){break}_free(r3)}}while(0);r3=HEAP32[r2+2],r4=r3>>2;do{if((r3|0)!=0){r6=r3|0;r5=HEAP32[r6>>2]-1|0;HEAP32[r6>>2]=r5;if((r5|0)!=0){break}r5=HEAP32[r4+4];if((r5|0)!=0){_free(r5)}r5=HEAP32[r4+5];if((r5|0)!=0){_free(r5)}r5=HEAP32[r4+7];if((r5|0)!=0){_free(r5)}r5=HEAP32[r4+6];if((r5|0)!=0){_free(r5)}_free(r3)}}while(0);r3=HEAP32[r2+8];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+7];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+5];if((r3|0)!=0){_free(r3)}r3=HEAP32[r2+6];if((r3|0)!=0){_free(r3)}if((r1|0)==0){return}_free(r1);return}function _free_ui(r1){if((r1|0)==0){return}_free(r1);return}function _solve_game(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10;r2=r1>>2;r1=STACKTOP;STACKTOP=STACKTOP+16|0;r5=r1,r6=r5>>2;r7=HEAP32[r2];if((r3|0)!=0){r8=_malloc(_strlen(r3)+1|0);if((r8|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r8,r3);r9=r8;STACKTOP=r1;return r9}r8=Math.imul(r7,r7);r3=_malloc(r8);if((r3|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_memcpy(r3,HEAP32[r2+5],r8);HEAP32[r6]=5;HEAP32[r6+1]=3;_solver(r7,HEAP32[r2+1],HEAP32[r2+2],HEAP32[r2+3],r3,HEAP32[r2+6],r5);HEAP32[r4>>2]=0;r5=HEAP32[r6+2];if((r5|0)==6){r10=71768}else if((r5|0)==7){r10=71844}else{r5=_encode_solve_move(r7,r3);_free(r3);r9=r5;STACKTOP=r1;return r9}HEAP32[r4>>2]=r10;_free(r3);r9=0;STACKTOP=r1;return r9}function _game_text_format(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42;r2=r1>>2;r1=0;r3=STACKTOP;if((HEAP32[r2+2]|0)!=0){___assert_func(71104,4431,73312,71952)}r4=HEAP32[r2];r5=HEAP32[r2+1];r6=HEAP32[r2+3];r7=HEAP32[r2+5];r2=HEAP32[r5+8>>2];if((r2|0)==1){r8=1;r9=1}else{r8=r2;r9=HEAP32[r5+4>>2]}r2=r4-1|0;r10=Math.imul(((r2|0)/(r8|0)&-1)+r4<<1,((r2|0)/(r9|0)&-1)+r4|0);r11=_malloc(r10|1);if((r11|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}L923:do{if((r4|0)>0){r12=(r5+16|0)>>2;r13=(r6|0)==0;r14=r4+1|0;r15=Math.imul(r4,r4)-1|0;r16=r11;r17=0;while(1){r18=Math.imul(r17,r4);r19=r16;r20=0;while(1){r21=r20+r18|0;r22=HEAP8[r7+r21|0];do{if(r22<<24>>24==0){if(!r13){if(((r21|0)%(r14|0)|0)==0){r23=95;break}if(((r21|0)%(r2|0)|0)==0&(r21|0)>0&(r21|0)<(r15|0)){r23=95;break}}r23=46}else{if((r22&255)<10){r23=r22+48&255;break}else{r23=r22+87&255;break}}}while(0);r24=r19+1|0;HEAP8[r19]=r23;r25=r19+2|0;if((r20|0)==(r2|0)){r1=667;break}HEAP8[r24]=32;r22=r20+1|0;if(((r22|0)%(r8|0)|0)==0){r26=HEAP32[r12];HEAP8[r25]=(HEAP32[r26+(r21<<2)>>2]|0)==(HEAP32[r26+(r21+1<<2)>>2]|0)?32:124;HEAP8[r19+3|0]=32;r27=r19+4|0}else{r27=r25}if((r22|0)==(r4|0)){r28=r27;break}else{r19=r27;r20=r22}}if(r1==667){r1=0;HEAP8[r24]=10;r28=r25}r20=r17+1|0;L947:do{if((r17|0)==(r2|0)){r29=r28}else{if(((r20|0)%(r9|0)|0)!=0){r29=r28;break}r19=Math.imul(r20,r4);r22=r28;r26=0;while(1){r30=(r26|0)==(r2|0);r31=r30?1:2;if((r26|0)>0){r32=(((r26|0)%(r8|0)|0)==0&1)+r31|0}else{r32=r31}r31=r26+r18|0;r33=HEAP32[r12];r34=r26+r19|0;r35=-r32|0;r36=(r35|0)>-1?r35:-1;r37=r36+r32|0;r38=r37+(r22+1)|0;_memset(r22,(HEAP32[r33+(r31<<2)>>2]|0)==(HEAP32[r33+(r34<<2)>>2]|0)?32:45,r36+(r32+1)|0);if(r30){break}r30=r26+1|0;if(((r30|0)%(r8|0)|0)==0){r36=HEAP32[r12]>>2;r33=HEAP32[(r31<<2>>2)+r36];r35=HEAP32[(r31+1<<2>>2)+r36];r31=HEAP32[(r34<<2>>2)+r36];r39=HEAP32[(r34+1<<2>>2)+r36];r36=(r33|0)==(r35|0);r34=(r31|0)==(r39|0);do{if(r36&(r35|0)==(r31|0)&r34){r40=32}else{if((r33|0)==(r31|0)&(r35|0)==(r39|0)){r40=124;break}r40=r36&r34?45:43}}while(0);HEAP8[r38]=r40;r41=r37+(r22+2)|0}else{r41=r38}if((r30|0)<(r4|0)){r22=r41;r26=r30}else{r29=r41;break L947}}HEAP8[r38]=10;r29=r37+(r22+2)|0}}while(0);if((r20|0)==(r4|0)){r42=r29;break L923}else{r16=r29;r17=r20}}}else{r42=r11}}while(0);if((r42-r11|0)==(r10|0)){HEAP8[r42]=0;STACKTOP=r3;return r11}___assert_func(71104,4411,73272,71912);HEAP8[r42]=0;STACKTOP=r3;return r11}function _new_ui(r1){var r2,r3;r1=STACKTOP;r2=_malloc(20),r3=r2>>2;if((r2|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r3]=0;HEAP32[r3+1]=0;HEAP32[r3+2]=0;HEAP32[r3+3]=0;HEAP32[r3+4]=0;STACKTOP=r1;return r2}}function _interpret_move(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r7=r2>>2;r8=r1>>2;r1=0;r9=STACKTOP;STACKTOP=STACKTOP+80|0;r10=r9;r11=HEAP32[r8];r12=r6&-28673;r6=HEAP32[r3+12>>2];r3=(r6|0)/-2&-1;r13=(r6+r4+r3|0)/(r6|0)&-1;r4=r13-1|0;r14=(r6+r5+r3|0)/(r6|0)&-1;r6=r14-1|0;do{if((r13|0)>0&(r4|0)<(r11|0)&(r14|0)>0&(r6|0)<(r11|0)){if((r12|0)==514){r3=Math.imul(r6,r11)+r4|0;L979:do{if(HEAP8[HEAP32[r8+5]+r3|0]<<24>>24==0){r5=r2|0;r15=r2+4|0;do{if((r4|0)==(HEAP32[r5>>2]|0)){if((r6|0)!=(HEAP32[r15>>2]|0)){break}r16=r2+12|0;if((HEAP32[r16>>2]|0)==0){break}if((HEAP32[r7+2]|0)==0){break}HEAP32[r16>>2]=0;break L979}}while(0);HEAP32[r7+2]=1;HEAP32[r5>>2]=r4;HEAP32[r15>>2]=r6;HEAP32[r7+3]=1}else{HEAP32[r7+3]=0}}while(0);HEAP32[r7+4]=0;r17=71880;STACKTOP=r9;return r17}else if((r12|0)==512){r3=Math.imul(r6,r11)+r4|0;L991:do{if(HEAP8[HEAP32[r8+8]+r3|0]<<24>>24==0){r16=r2|0;r18=r2+4|0;do{if((r4|0)==(HEAP32[r16>>2]|0)){if((r6|0)!=(HEAP32[r18>>2]|0)){break}r19=r2+12|0;if((HEAP32[r19>>2]|0)==0){break}if((HEAP32[r7+2]|0)!=0){break}HEAP32[r19>>2]=0;break L991}}while(0);HEAP32[r16>>2]=r4;HEAP32[r18>>2]=r6;HEAP32[r7+3]=1;HEAP32[r7+2]=0}else{HEAP32[r7+3]=0}}while(0);HEAP32[r7+4]=0;r17=71880;STACKTOP=r9;return r17}else{break}}}while(0);if((r12-521|0)>>>0<2|(r12|0)==524|(r12|0)==523){r6=r2|0;r4=r2+4|0;do{if((r12|0)==522){r20=1;r21=0;r1=718;break}else if((r12|0)==524){r20=0;r21=1;r1=718;break}else if((r12|0)==523){r20=0;r21=-1;r1=718;break}else if((r12|0)==521){r20=-1;r21=0;r1=718}}while(0);if(r1==718){r1=HEAP32[r6>>2]+r21|0;r21=(r1|0)>0?r1:0;r1=r11-1|0;HEAP32[r6>>2]=(r21|0)<(r1|0)?r21:r1;r21=HEAP32[r4>>2]+r20|0;r20=(r21|0)>0?r21:0;HEAP32[r4>>2]=(r20|0)<(r1|0)?r20:r1}HEAP32[r7+4]=1;HEAP32[r7+3]=1;r17=71880;STACKTOP=r9;return r17}r1=r2+12|0;r20=HEAP32[r1>>2];if((r20|0)!=0&(r12|0)==525){r4=r2+8|0;HEAP32[r4>>2]=1-HEAP32[r4>>2]|0;HEAP32[r7+4]=1;r17=71880;STACKTOP=r9;return r17}if((r20|0)==0){r17=0;STACKTOP=r9;return r17}r20=r12-48|0;r4=r12-97|0;do{if(r20>>>0>9|(r20|0)>(r11|0)){r2=r12-87|0;if(!(r4>>>0>25|(r2|0)>(r11|0))){r22=r2;break}if(!((r12-65|0)>>>0>25|(r12-55|0)>(r11|0))){r22=r2;break}if((r12|0)==526|(r12|0)==8){r22=r2;break}else{r17=0}STACKTOP=r9;return r17}else{r22=r12-87|0}}while(0);if((r12|0)==526|(r12|0)==8){r23=0}else{r23=r4>>>0<26?r22:(r12-65|0)>>>0<26?r12-55|0:r20}r20=HEAP32[r7+1];r12=Math.imul(r20,r11);r11=HEAP32[r7];r22=r12+r11|0;if(HEAP8[HEAP32[r8+8]+r22|0]<<24>>24!=0){r17=0;STACKTOP=r9;return r17}do{if((HEAP32[r7+2]|0)==0){r24=82;r25=r10|0}else{if(HEAP8[HEAP32[r8+5]+r22|0]<<24>>24==0){r24=(r23|0)>0?80:82;r25=r10|0;break}else{r17=0;STACKTOP=r9;return r17}}}while(0);_sprintf(r25,71980,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r24,HEAP32[tempInt+4>>2]=r11,HEAP32[tempInt+8>>2]=r20,HEAP32[tempInt+12>>2]=r23,tempInt));if((HEAP32[r7+4]|0)==0){HEAP32[r1>>2]=0}r1=_malloc(_strlen(r25)+1|0);if((r1|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r1,r25);r17=r1;STACKTOP=r9;return r17}function _game_compute_size(r1,r2,r3,r4){var r5,r6,r7,r8;r5=r1|0;r6=r1+4|0;r1=HEAP32[r6>>2];r7=((r2|0)/2&-1)<<1;r8=Math.imul(Math.imul(HEAP32[r5>>2],r2),r1)+r7+1|0;HEAP32[r3>>2]=r8;r8=HEAP32[r6>>2];r6=(r7|1)+Math.imul(Math.imul(HEAP32[r5>>2],r2),r8)|0;HEAP32[r4>>2]=r6;return}function _game_set_size(r1,r2,r3,r4){HEAP32[r2+12>>2]=r4;return}function _execute_move(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+12|0;r5=r4,r6=r5>>2;r7=r4+4,r8=r7>>2;r9=r4+8,r10=r9>>2;r11=HEAP32[r1>>2];r12=HEAP8[r2];if(r12<<24>>24==83){r13=_dup_game(r1);HEAP32[r13+40>>2]=1;HEAP32[r13+36>>2]=1;HEAP32[r10]=0;r14=Math.imul(r11,r11);if((r14|0)==0){r15=r13;STACKTOP=r4;return r15}r16=r13+20|0;r17=0;r18=r2+1|0;while(1){r19=_atoi(r18)&255;HEAP8[HEAP32[r16>>2]+r17|0]=r19;r19=HEAP8[r18];if(r19<<24>>24==0){break}r20=HEAP32[r10];r21=HEAP8[HEAP32[r16>>2]+r20|0];if(r21<<24>>24==0|(r21&255|0)>(r11|0)){break}else{r22=r18;r23=r19}while(1){if(r23<<24>>24==0){r3=759;break}r19=r22+1|0;if(((r23&255)-48|0)>>>0>=10){r24=r19;break}r22=r19;r23=HEAP8[r19]}if(r3==759){r3=0;r24=r22+1|0}r19=r20+1|0;HEAP32[r10]=r19;if((r19|0)<(r14|0)){r17=r19;r18=r23<<24>>24==44?r24:r22}else{r15=r13;r3=775;break}}if(r3==775){STACKTOP=r4;return r15}_free_game(r13);r15=0;STACKTOP=r4;return r15}else if(r12<<24>>24==80|r12<<24>>24==82){r12=(_sscanf(r2+1|0,72040,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r7,HEAP32[tempInt+8>>2]=r9,tempInt))|0)==3;r9=HEAP32[r6];if(!(r12&(r9|0)>-1&(r9|0)<(r11|0))){r15=0;STACKTOP=r4;return r15}r9=HEAP32[r8];if(!((r9|0)>-1&(r9|0)<(r11|0))){r15=0;STACKTOP=r4;return r15}r9=HEAP32[r10];if((r9|0)<0|(r9|0)>(r11|0)){r15=0;STACKTOP=r4;return r15}r9=_dup_game(r1),r1=r9>>2;r12=HEAP32[r10];if(HEAP8[r2]<<24>>24==80&(r12|0)>0){r2=(r12-1+Math.imul(Math.imul(HEAP32[r8],r11)+HEAP32[r6]|0,r11)|0)+HEAP32[r1+7]|0;HEAP8[r2]=HEAP8[r2]<<24>>24==0&1;r15=r9;STACKTOP=r4;return r15}r2=Math.imul(HEAP32[r8],r11);r10=r9+20|0;HEAP8[HEAP32[r10>>2]+r2+HEAP32[r6]|0]=r12&255;r12=HEAP32[r1+7];_memset(r12+Math.imul(Math.imul(HEAP32[r8],r11)+HEAP32[r6]|0,r11)|0,0,r11);r6=r9+36|0;if((HEAP32[r6>>2]|0)!=0){r15=r9;STACKTOP=r4;return r15}if((_check_valid(r11,HEAP32[r1+1],HEAP32[r1+2],HEAP32[r1+3],HEAP32[r10>>2])|0)==0){r15=r9;STACKTOP=r4;return r15}HEAP32[r6>>2]=1;r15=r9;STACKTOP=r4;return r15}else{r15=0;STACKTOP=r4;return r15}}function _game_free_drawstate(r1,r2){r1=HEAP32[r2+24>>2];if((r1|0)!=0){_free(r1)}r1=HEAP32[r2+20>>2];if((r1|0)!=0){_free(r1)}r1=HEAP32[r2+16>>2];if((r1|0)!=0){_free(r1)}r1=HEAP32[r2+32>>2];if((r1|0)!=0){_free(r1)}if((r2|0)==0){return}_free(r2);return}function _game_colours(r1,r2){var r3,r4,r5,r6,r7,r8,r9;r3=STACKTOP;r4=_malloc(108),r5=r4>>2;if((r4|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r6=r4;_frontend_default_colour(r1,r6);r1=HEAPF32[r6>>2];HEAPF32[r5+3]=r1*.8999999761581421;r7=HEAPF32[r5+1];HEAPF32[r5+4]=r7*.8999999761581421;r8=HEAPF32[r5+2];HEAPF32[r5+5]=r8*.8999999761581421;r9=(r4+24|0)>>2;HEAP32[r9]=0;HEAP32[r9+1]=0;HEAP32[r9+2]=0;HEAP32[r9+3]=0;HEAP32[r9+4]=0;HEAP32[r9+5]=0;HEAP32[r9+6]=0;HEAPF32[r5+13]=r7*.6000000238418579;HEAPF32[r5+14]=0;HEAPF32[r5+15]=r1*.7799999713897705;HEAPF32[r5+16]=r7*.7799999713897705;HEAPF32[r5+17]=r8*.7799999713897705;HEAPF32[r5+18]=1;HEAPF32[r5+19]=0;HEAPF32[r5+20]=0;r9=r1*.5;HEAPF32[r5+21]=r9;r1=r7*.5;HEAPF32[r5+22]=r1;HEAPF32[r5+23]=r8;HEAPF32[r5+24]=r9;HEAPF32[r5+25]=r1;HEAPF32[r5+26]=r8*.10000000149011612;HEAP32[r2>>2]=9;STACKTOP=r3;return r6}}function _game_new_drawstate(r1,r2){var r3,r4,r5,r6,r7,r8,r9;r1=STACKTOP;r3=_malloc(36),r4=r3>>2;if((r3|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r5=HEAP32[r2>>2];HEAP32[r4]=0;HEAP32[r4+1]=r5;HEAP32[r4+2]=HEAP32[r2+12>>2];r6=Math.imul(r5,r5);r7=_malloc(r6);if((r7|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4+4]=r7;_memset(r7,r5+2&255,r6);r7=Math.imul(r6,r5);r8=_malloc(r7);if((r8|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4+5]=r8;_memset(r8,0,r7);r7=_malloc(r6);if((r7|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r4+6]=r7;_memset(r7,0,r6);r6=(r5*3&-1)+2|0;r7=r3+28|0;HEAP32[r7>>2]=r6;r8=HEAP32[r2+8>>2];if((r8|0)==0){r9=r6}else{r2=HEAP32[r8+32>>2]+r6|0;HEAP32[r7>>2]=r2;r9=r2}r2=_malloc(Math.imul(r5<<2,r9));if((r2|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r4+8]=r2;HEAP32[r4+3]=0;STACKTOP=r1;return r3}}function _game_redraw(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158;r7=0;r5=STACKTOP;STACKTOP=STACKTOP+44|0;r3=r5;r9=r5+20;r10=r4|0;r11=HEAP32[r10>>2];r12=(r2|0)>>2;if((HEAP32[r12]|0)==0){r13=r2+12|0;r14=HEAP32[r13>>2];r15=(((r14|0)/2&-1)<<1)+Math.imul(r14,r11)+1|0;r14=r1|0;r16=r1+4|0;FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+4>>2]](HEAP32[r16>>2],0,0,r15,r15,0);r15=HEAP32[r13>>2];r13=(r15|0)/2&-1;if((r15|0)>63){r17=(r15|0)/32&-1;r18=((r15|0)/32&-1)<<1;r19=r13-r17|0;r20=r13-r17|0;r21=(((r15|0)/32&-1)<<1)+Math.imul(r15,r11)+1|0;r22=Math.imul(r15,r11)}else{r17=Math.imul(r15,r11);r18=2;r19=r13-1|0;r20=r13-1|0;r21=r17+3|0;r22=r17}FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+4>>2]](HEAP32[r16>>2],r20,r19,r21,r22+(r18+1)|0,2)}r18=r2+28|0;L1140:do{if((Math.imul(HEAP32[r18>>2],r11)|0)>0){r22=r2+32|0;r21=0;while(1){HEAP32[HEAP32[r22>>2]+(r21<<2)>>2]=0;r19=r21+1|0;if((r19|0)<(Math.imul(HEAP32[r18>>2],r11)|0)){r21=r19}else{break L1140}}}}while(0);r18=(r11|0)>0;L1145:do{if(r18){r21=r4+20|0;r22=(r2+32|0)>>2;r19=r4+4|0;r20=r11<<1;r16=r2+8|0;r14=r4+8|0;r17=r11*3&-1;r13=r17+2|0;r15=r11+1|0;r23=Math.imul(r17,r11)-1|0;r24=r11-1|0;r25=Math.imul(r11,r11)-1|0;r26=Math.imul(r17+1|0,r11)-1|0;r17=0;while(1){r27=Math.imul(r17,r11)-1|0;r28=0;while(1){r29=Math.imul(r28,r11)+r17|0;r30=HEAP8[HEAP32[r21>>2]+r29|0];do{if(r30<<24>>24!=0){r31=r30&255;r32=(r27+r31<<2)+HEAP32[r22]|0;HEAP32[r32>>2]=HEAP32[r32>>2]+1|0;r32=((Math.imul(r28+r11|0,r11)-1+r31|0)<<2)+HEAP32[r22]|0;HEAP32[r32>>2]=HEAP32[r32>>2]+1|0;r32=r31-1|0;r33=((r32+Math.imul(HEAP32[HEAP32[HEAP32[r19>>2]+16>>2]+(r29<<2)>>2]+r20|0,r11)|0)<<2)+HEAP32[r22]|0;HEAP32[r33>>2]=HEAP32[r33>>2]+1|0;do{if((HEAP32[r16>>2]|0)!=0){if(((r29|0)%(r15|0)|0)==0){r33=(r23+r31<<2)+HEAP32[r22]|0;HEAP32[r33>>2]=HEAP32[r33>>2]+1|0}if(!(((r29|0)%(r24|0)|0)==0&(r29|0)>0&(r29|0)<(r25|0))){break}r33=(r26+r31<<2)+HEAP32[r22]|0;HEAP32[r33>>2]=HEAP32[r33>>2]+1|0}}while(0);r31=HEAP32[r14>>2];if((r31|0)==0){break}r33=((r32+Math.imul(r13+HEAP32[HEAP32[r31+16>>2]+(r29<<2)>>2]|0,r11)|0)<<2)+HEAP32[r22]|0;HEAP32[r33>>2]=HEAP32[r33>>2]+1|0}}while(0);r29=r28+1|0;if((r29|0)==(r11|0)){break}else{r28=r29}}r28=r17+1|0;if((r28|0)==(r11|0)){break}else{r17=r28}}if(!r18){break}r17=(r4+20|0)>>2;r22=r8>0;r13=(r8<=.13333334028720856|r8>=.2666666805744171)&1;r14=r6|0;r26=r6+4|0;r25=r6+12|0;r24=r6+8|0;r23=r2+32|0;r15=(r4+8|0)>>2;r16=(r4+24|0)>>2;r20=(r4+4|0)>>2;r19=r11<<1;r21=r2+8|0;r28=r11*3&-1;r27=r28+2|0;r29=r11+1|0;r30=Math.imul(r28,r11)-1|0;r33=r11-1|0;r31=Math.imul(r11,r11)-1|0;r34=Math.imul(r28+1|0,r11)-1|0;r28=r3|0;r35=r2+16|0;r36=r2+24|0;r37=r2+20|0;r38=(r4+28|0)>>2;r39=(r2+12|0)>>2;r40=(r1|0)>>2;r41=(r1+4|0)>>2;r42=r9|0;r43=r9+4|0;r44=r9+8|0;r45=r9+12|0;r46=r9+16|0;r47=r9+20|0;r48=(r4+16|0)>>2;r49=r3+1|0;r50=r4+32|0;r51=0;while(1){r52=Math.imul(r51,r11)-1|0;r53=(r51|0)>0;r54=r51+1|0;r55=r53^1;r56=(r51|0)==0;r57=r51-1|0;r58=0;while(1){r59=Math.imul(r58,r11)+r51|0;r60=HEAP32[r17];r61=HEAP8[r60+r59|0];r62=r22?r13:0;do{if((r51|0)==(HEAP32[r14>>2]|0)){if((r58|0)!=(HEAP32[r26>>2]|0)){r63=r62;break}if((HEAP32[r25>>2]|0)==0){r63=r62;break}r63=(HEAP32[r24>>2]|0)!=0?2:1}else{r63=r62}}while(0);r62=r61&255;L1174:do{if(r61<<24>>24==0){r64=r63}else{r65=HEAP32[r23>>2],r66=r65>>2;L1176:do{if((HEAP32[(r52+r62<<2>>2)+r66]|0)>1){r7=851}else{r67=(Math.imul(r58+r11|0,r11)-1+r62<<2)+r65|0;if((HEAP32[r67>>2]|0)>1){r7=851;break}r67=r62-1|0;r68=(r67+Math.imul(HEAP32[HEAP32[HEAP32[r20]+16>>2]+(r59<<2)>>2]+r19|0,r11)<<2)+r65|0;if((HEAP32[r68>>2]|0)>1){r7=851;break}do{if((HEAP32[r21>>2]|0)!=0){if(((r59|0)%(r29|0)|0)==0){if((HEAP32[(r30+r62<<2>>2)+r66]|0)>1){r7=851;break L1176}}if(!(((r59|0)%(r33|0)|0)==0&(r59|0)>0&(r59|0)<(r31|0))){break}if((HEAP32[(r34+r62<<2>>2)+r66]|0)>1){r7=851;break L1176}}}while(0);r68=HEAP32[r15];if((r68|0)==0){r64=r63;break L1174}r69=(r67+Math.imul(r27+HEAP32[HEAP32[r68+16>>2]+(r59<<2)>>2]|0,r11)<<2)+r65|0;if((HEAP32[r69>>2]|0)>1){r7=851;break}else{r70=r63;break}}}while(0);if(r7==851){r7=0;r70=r63|16}r65=HEAP32[r15];if((r65|0)==0){r64=r70;break}r66=HEAP32[HEAP32[r65+16>>2]+(r59<<2)>>2];r32=HEAP32[HEAP32[r65+24>>2]+(r66<<2)>>2];L1192:do{if((r32|0)>0){r69=0;r68=0;r71=0;r72=r65;r73=r60;while(1){r74=HEAP32[HEAP32[HEAP32[r72+20>>2]+(r66<<2)>>2]+(r69<<2)>>2];r75=HEAP8[r73+r74|0];if(r75<<24>>24==0){r76=r69;r77=r68;r78=r71;break L1192}r79=(r75&255)+r68|0;r75=HEAP8[HEAP32[r16]+r74|0];if(r75<<24>>24==0){r80=r71}else{if((r71|0)==0){r81=r75}else{___assert_func(71104,5157,73332,69056);r81=HEAP8[HEAP32[r16]+r74|0]}r80=r81&255}r74=r69+1|0;if((r74|0)>=(r32|0)){r76=r74;r77=r79;r78=r80;break L1192}r69=r74;r68=r79;r71=r80;r72=HEAP32[r15];r73=HEAP32[r17]}}else{r76=0;r77=0;r78=0}}while(0);if((r76|0)!=(r32|0)){r64=r70;break}if((r78|0)==0){___assert_func(71104,5163,73332,72380)}r64=(r77|0)==(r78|0)?r70:r70|32}}while(0);r60=HEAP32[r10>>2];r59=(r64>>>4&2^2)+6|0;r62=Math.imul(r60,r58)+r51|0;do{if(HEAP8[HEAP32[r35>>2]+r62|0]<<24>>24==HEAP8[HEAP32[r17]+r62|0]<<24>>24){if((HEAPU8[HEAP32[r36>>2]+r62|0]|0)!=(r64|0)){r7=869;break}r61=HEAP32[r37>>2];r66=Math.imul(r62,r60);if((_memcmp(r61+r66|0,HEAP32[r38]+r66|0,r60)|0)!=0){r7=869;break}r82=r58+1|0;break}else{r7=869}}while(0);if(r7==869){r7=0;r66=HEAP32[r39];r61=(r66|0)/2&-1;r65=r61+Math.imul(r66,r51)|0;r73=(r66|0)>63;if(r73){r72=(r66|0)/32&-1;r71=r61+Math.imul(r66,r58)|0;r68=r66-1|0;r69=r72<<1;r83=r69;r84=r68-r69|0;r85=r68;r86=r71;r87=r72+(r65+1)|0;r88=r72;r89=r72+(r71+1)|0}else{r71=r61+Math.imul(r66,r58)|0;r83=2;r84=r66-3|0;r85=r66-1|0;r86=r71;r87=r65+2|0;r88=1;r89=r71+2|0}r71=r85-r83|0;do{if(r53){r61=HEAP32[HEAP32[r20]+16>>2];if((HEAP32[r61+(r62<<2)>>2]|0)!=(HEAP32[r61+(r62-1<<2)>>2]|0)){r90=r87;r91=r84;break}if(r73){r61=(r66|0)/32&-1;r92=r61;r93=r87-r61|0}else{r92=1;r93=r88+r65|0}r90=r93;r91=r92+r84|0}else{r90=r87;r91=r84}}while(0);r61=(r54|0)<(r60|0);do{if(r61){r72=HEAP32[HEAP32[r20]+16>>2];if((HEAP32[r72+(r62<<2)>>2]|0)!=(HEAP32[r72+(r62+1<<2)>>2]|0)){r94=r91;break}if(r73){r95=(r66|0)/32&-1}else{r95=1}r94=r95+r91|0}else{r94=r91}}while(0);r72=(r58|0)>0;do{if(r72){r68=HEAP32[HEAP32[r20]+16>>2];r69=HEAP32[r68+(r62<<2)>>2];r67=(Math.imul(r60,r58-1|0)+r51<<2)+r68|0;if((r69|0)!=(HEAP32[r67>>2]|0)){r96=r89;r97=r71;break}if(r73){r67=(r66|0)/32&-1;r98=r67;r99=r89-r67|0}else{r98=1;r99=r86+r88|0}r96=r99;r97=r98+r71|0}else{r96=r89;r97=r71}}while(0);r67=r58+1|0;r69=(r67|0)<(r60|0);do{if(r69){r68=HEAP32[HEAP32[r20]+16>>2];r79=HEAP32[r68+(r62<<2)>>2];r74=(Math.imul(r60,r67)+r51<<2)+r68|0;if((r79|0)!=(HEAP32[r74>>2]|0)){r100=r97;break}if(r73){r101=(r66|0)/32&-1}else{r101=1}r100=r101+r97|0}else{r100=r97}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r40]+24>>2]](HEAP32[r41],r90,r96,r94,r100);r66=r64&15;if((r66|0)==1){r102=5}else{do{if((HEAP32[r21>>2]|0)==0){r103=0}else{if(((r62|0)%(r60+1|0)|0)==0){r103=1;break}if(!(((r62|0)%(r60-1|0)|0)==0&(r62|0)>0)){r103=0;break}r103=(r62|0)<(Math.imul(r60,r60)-1|0)}}while(0);r102=r103&1}FUNCTION_TABLE[HEAP32[HEAP32[r40]+4>>2]](HEAP32[r41],r90,r96,r94,r100,r102);r73=r72^1;r74=r55|r73;do{if(!r74){r79=HEAP32[HEAP32[r20]+16>>2];r68=HEAP32[r79+(r62<<2)>>2];r75=(r57+Math.imul(r60,r58-1|0)<<2)+r79|0;if((r68|0)==(HEAP32[r75>>2]|0)){break}r75=HEAP32[r39];if((r75|0)>63){r68=(r75|0)/32&-1;r104=r89-r68|0;r105=r87-r68|0;r106=r68}else{r104=r89-1|0;r105=r88+r65|0;r106=1}FUNCTION_TABLE[HEAP32[HEAP32[r40]+4>>2]](HEAP32[r41],r105,r104,r106,r106,2)}}while(0);r72=r61^1;r68=r72|r73;do{if(!r68){r75=HEAP32[HEAP32[r20]+16>>2];r79=HEAP32[r75+(r62<<2)>>2];r107=(Math.imul(r60,r58-1|0)+r54<<2)+r75|0;if((r79|0)==(HEAP32[r107>>2]|0)){break}r107=HEAP32[r39];r79=r107+r87|0;if((r107|0)>63){r75=(r107|0)/32&-1;r108=r89-r75|0;r109=r79-1-(r75<<1)|0;r110=r75}else{r108=r89-1|0;r109=r79-3|0;r110=1}FUNCTION_TABLE[HEAP32[HEAP32[r40]+4>>2]](HEAP32[r41],r109,r108,r110,r110,2)}}while(0);r73=r69^1;r79=r55|r73;do{if(!r79){r75=HEAP32[HEAP32[r20]+16>>2];r107=HEAP32[r75+(r62<<2)>>2];r111=(r57+Math.imul(r60,r67)<<2)+r75|0;if((r107|0)==(HEAP32[r111>>2]|0)){break}r111=HEAP32[r39];if((r111|0)>63){r107=(r111|0)/32&-1;r112=r89-1+r111-(r107<<1)|0;r113=r87-r107|0;r114=r107}else{r112=r89-3+r111|0;r113=r88+r65|0;r114=1}FUNCTION_TABLE[HEAP32[HEAP32[r40]+4>>2]](HEAP32[r41],r113,r112,r114,r114,2)}}while(0);r65=r72|r73;do{if(!r65){r111=HEAP32[HEAP32[r20]+16>>2];r107=HEAP32[r111+(r62<<2)>>2];r75=(Math.imul(r60,r67)+r54<<2)+r111|0;if((r107|0)==(HEAP32[r75>>2]|0)){break}r75=HEAP32[r39];r107=r75+r87|0;if((r75|0)>63){r111=(r75|0)/32&-1;r115=r111<<1;r116=r89-1+r75-r115|0;r117=r107-1-r115|0;r118=r111}else{r116=r89-3+r75|0;r117=r107-3|0;r118=1}FUNCTION_TABLE[HEAP32[HEAP32[r40]+4>>2]](HEAP32[r41],r117,r116,r118,r118,2)}}while(0);if((r66|0)==2){HEAP32[r42>>2]=r90;HEAP32[r43>>2]=r96;HEAP32[r44>>2]=((r94|0)/2&-1)+r90|0;HEAP32[r45>>2]=r96;HEAP32[r46>>2]=r90;HEAP32[r47>>2]=((r100|0)/2&-1)+r96|0;FUNCTION_TABLE[HEAP32[HEAP32[r40]+12>>2]](HEAP32[r41],r42,3,5,5)}r73=HEAP32[r15],r72=r73>>2;do{if((r73|0)!=0){r107=HEAP32[r39];if((r107|0)>63){r119=((r107|0)/32&-1)*3&-1}else{r119=3}r107=(HEAP32[HEAP32[r20]+8>>2]|0)==1;r75=r107?r89:r96;r111=r107?r87:r90;r115=r111-1|0;r120=r75-1|0;r121=r111+(r107?r84:r94)|0;r111=r75+(r107?r71:r100)|0;do{if(r56){r7=931}else{r107=HEAP32[r72+4];if((HEAP32[r107+(r62<<2)>>2]|0)==(HEAP32[r107+(r62-1<<2)>>2]|0)){r122=0;r123=r115;break}else{r7=931;break}}}while(0);if(r7==931){r7=0;r122=1;r123=r115+r119|0}do{if(r61){r32=HEAP32[r72+4];if((HEAP32[r32+(r62<<2)>>2]|0)==(HEAP32[r32+(r62+1<<2)>>2]|0)){r124=0;r125=r121;break}else{r7=934;break}}else{r7=934}}while(0);if(r7==934){r7=0;r124=1;r125=r121-r119|0}do{if((r58|0)==0){r7=937}else{r115=HEAP32[r72+4];r32=HEAP32[r115+(r62<<2)>>2];r107=(Math.imul(r60,r58-1|0)+r51<<2)+r115|0;if((r32|0)==(HEAP32[r107>>2]|0)){r126=0;r127=r120;break}else{r7=937;break}}}while(0);if(r7==937){r7=0;r126=1;r127=r120+r119|0}do{if(r69){r107=HEAP32[r72+4];r32=HEAP32[r107+(r62<<2)>>2];r115=(Math.imul(r60,r67)+r51<<2)+r107|0;if((r32|0)==(HEAP32[r115>>2]|0)){r128=0;r129=r111;break}else{r7=940;break}}else{r7=940}}while(0);if(r7==940){r7=0;r128=1;r129=r111-r119|0}r120=(r126|0)!=0;if(r120){FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r123,r127,r125,r127,r59)}r115=(r128|0)!=0;if(r115){FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r123,r129,r125,r129,r59)}r32=(r122|0)!=0;if(r32){FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r123,r127,r123,r129,r59)}r107=(r124|0)!=0;if(r107){FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r125,r127,r125,r129,r59)}do{if(!(r74|r32|r120)){r75=HEAP32[HEAP32[r15]+16>>2];r130=HEAP32[r75+(r62<<2)>>2];r131=(r57+Math.imul(r60,r58-1|0)<<2)+r75|0;if((r130|0)==(HEAP32[r131>>2]|0)){break}r131=r127+r119|0;r130=r123+r119|0;FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r123,r131,r130,r131,r59);FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r130,r127,r130,r131,r59)}}while(0);do{if(!(r68|r107|r120)){r131=HEAP32[HEAP32[r15]+16>>2];r130=HEAP32[r131+(r62<<2)>>2];r75=(Math.imul(r60,r58-1|0)+r54<<2)+r131|0;if((r130|0)==(HEAP32[r75>>2]|0)){break}r75=r121-r119|0;r130=r127+r119|0;FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r75,r130,r121,r130,r59);FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r75,r127,r75,r130,r59)}}while(0);do{if(!(r79|r32|r115)){r120=HEAP32[HEAP32[r15]+16>>2];r130=HEAP32[r120+(r62<<2)>>2];r75=(r57+Math.imul(r60,r67)<<2)+r120|0;if((r130|0)==(HEAP32[r75>>2]|0)){break}r75=r111-r119|0;r130=r123+r119|0;FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r123,r75,r130,r75,r59);FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r130,r75,r130,r111,r59)}}while(0);if(r65|r107|r115){break}r32=HEAP32[HEAP32[r15]+16>>2];r130=HEAP32[r32+(r62<<2)>>2];r75=(Math.imul(r60,r67)+r54<<2)+r32|0;if((r130|0)==(HEAP32[r75>>2]|0)){break}r75=r121-r119|0;r130=r111-r119|0;FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r75,r130,r75,r111,r59);FUNCTION_TABLE[HEAP32[HEAP32[r40]+8>>2]](HEAP32[r41],r75,r130,r121,r130,r59)}}while(0);do{if((HEAP32[r48]|0)!=0){r65=HEAP8[HEAP32[r16]+r62|0];if(r65<<24>>24==0){break}_sprintf(r28,71512,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r65&255,tempInt));r65=HEAP32[r39];if((r65|0)>63){r79=((r65|0)/32&-1)<<2;r132=r79;r133=r79+r87|0}else{r132=4;r133=r87+4|0}r79=(r65|0)/4&-1;FUNCTION_TABLE[HEAP32[HEAP32[r40]>>2]](HEAP32[r41],r133,r132+r89+r79|0,1,r79,0,r59,r28)}}while(0);r59=HEAP32[r17]+r62|0;L1352:do{if(HEAP8[r59]<<24>>24==0){if((r60|0)<=0){break}r79=Math.imul(r62,r60);r65=HEAP32[r38];r68=0;r74=0;while(1){r134=(HEAP8[r65+r68+r79|0]<<24>>24!=0&1)+r74|0;r72=r68+1|0;if((r72|0)==(r60|0)){break}else{r68=r72;r74=r134}}if((r134|0)==0){break}r74=HEAP32[r39];r68=(r74|0)>63;if(r68){r65=(r74|0)/32&-1;r121=r65+r89|0;r135=r65;r136=r65+r87|0;r137=r121;r138=r121+r74|0}else{r121=r89+1|0;r135=1;r136=r87+1|0;r137=r121;r138=r74+r121|0}r121=r74+r87|0;r65=r138-r135|0;r111=HEAP32[r48];do{if((r111|0)==0){r139=r65;r140=r137;r141=r121;r142=r136}else{if(r68){r115=((r74|0)/32&-1)*3&-1;r143=r115;r144=r121-r115|0;r145=r115+r136|0;r146=r115+r137|0}else{r143=3;r144=r121-3|0;r145=r136+3|0;r146=r137+3|0}r115=r65-r143|0;if(HEAP8[HEAP32[r16]+r62|0]<<24>>24==0){r139=r115;r140=r146;r141=r144;r142=r145;break}r139=r115;r140=((r74|0)/4&-1)+r146|0;r141=r144;r142=r145}}while(0);r65=(r134|0)>4?r134:4;r121=r134-1|0;r68=r141-r142|0;do{if((r65|0)>3){r115=r68|0;r107=r139-r140|0;r72=r107|0;r69=0;r61=3;r71=0;while(1){r73=(r121+r61|0)/(r61|0)&-1;r66=r115/(r61|0);r130=r72/((r73|0)>2?r73|0:2);r73=r66<r130?r66:r130;r130=r73>r69;r147=r130?r61:r71;r66=r61+1|0;if((r66|0)<(r65|0)){r69=r130?r73:r69;r61=r66;r71=r147}else{break}}if((r147|0)>0){r148=r74;r149=r111;r150=r147;r151=r107;break}else{r152=r147;r153=r107;r7=989;break}}else{r152=0;r153=r139-r140|0;r7=989;break}}while(0);if(r7==989){r7=0;___assert_func(71104,4994,73464,72260);r148=HEAP32[r39];r149=HEAP32[r48];r150=r152;r151=r153}r111=(r121+r150|0)/(r150|0)&-1;r74=(r111|0)>2?r111:2;r111=(r68|0)/(r150|0)&-1;r65=(r151|0)/(r74|0)&-1;r71=(r111|0)<(r65|0)?r111:r65;r65=((r148-Math.imul(r71,r150)|0)/2&-1)+r87|0;r111=((r148-Math.imul(r71,r74)|0)/2&-1)+r89|0;do{if((r149|0)==0){r154=r111}else{if(HEAP8[HEAP32[r16]+r62|0]<<24>>24==0){r154=r111;break}r74=(r148|0)>63;if(r74){r155=((r148|0)/32&-1)*3&-1}else{r155=3}r61=(r148|0)/4&-1;if((r111|0)>(r155+r89+r61|0)){r154=r111;break}if(r74){r156=((r148|0)/32&-1)*3&-1}else{r156=3}r154=r61+r89+r156|0}}while(0);r111=0;r68=0;while(1){if(HEAP8[HEAP32[r38]+r111+r79|0]<<24>>24==0){r157=r68}else{HEAP8[r49]=0;r121=r111+49|0;HEAP8[r28]=((r121<<24|0)>956301312?r111+88|0:r121)&255;r121=r65+((Math.imul((r68|0)%(r150|0)<<1|1,r71)|0)/2&-1)|0;r61=((Math.imul(((r68|0)/(r150|0)&-1)<<1|1,r71)|0)/2&-1)+r154|0;FUNCTION_TABLE[HEAP32[HEAP32[r40]>>2]](HEAP32[r41],r121,r61,1,r71,257,7,r28);r157=r68+1|0}r61=r111+1|0;if((r61|0)==(r60|0)){break L1352}else{r111=r61;r68=r157}}}else{HEAP8[r49]=0;r68=HEAP8[r59];r111=r68+48&255;HEAP8[r28]=r111<<24>>24>57?r68+87&255:r111;r111=(HEAP32[r39]|0)/2&-1;if(HEAP8[HEAP32[r50>>2]+r62|0]<<24>>24==0){r158=r64>>>3&2|4}else{r158=3}FUNCTION_TABLE[HEAP32[HEAP32[r40]>>2]](HEAP32[r41],r111+r87|0,r111+r89|0,1,r111,257,r158,r28)}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r40]+28>>2]](HEAP32[r41]);r59=HEAP32[HEAP32[r40]+20>>2];if((r59|0)!=0){FUNCTION_TABLE[r59](HEAP32[r41],r90,r96,r94,r100)}HEAP8[HEAP32[r35>>2]+r62|0]=HEAP8[HEAP32[r17]+r62|0];r59=HEAP32[r37>>2];r111=Math.imul(r62,r60);_memcpy(r59+r111|0,HEAP32[r38]+r111|0,r60);HEAP8[HEAP32[r36>>2]+r62|0]=r64&255;r82=r67}if((r82|0)==(r11|0)){break}else{r58=r82}}if((r54|0)==(r11|0)){break L1145}else{r51=r54}}}}while(0);if((HEAP32[r12]|0)!=0){STACKTOP=r5;return}r82=HEAP32[r2+12>>2];r2=(((r82|0)/2&-1)<<1)+Math.imul(r82,r11)+1|0;r11=HEAP32[HEAP32[r1>>2]+20>>2];if((r11|0)!=0){FUNCTION_TABLE[r11](HEAP32[r1+4>>2],0,0,r2,r2)}HEAP32[r12]=1;STACKTOP=r5;return}function _game_anim_length(r1,r2,r3,r4){return 0}function _game_flash_length(r1,r2,r3,r4){var r5;do{if((HEAP32[r1+36>>2]|0)==0){if((HEAP32[r2+36>>2]|0)==0){break}if((HEAP32[r1+40>>2]|0)!=0){break}if((HEAP32[r2+40>>2]|0)==0){r5=.4000000059604645}else{break}return r5}}while(0);r5=0;return r5}function _game_status(r1){return(HEAP32[r1+36>>2]|0)!=0&1}function _game_print_size(r1,r2,r3){var r4;r4=Math.imul(HEAP32[r1>>2]*900&-1,HEAP32[r1+4>>2]);HEAPF32[r2>>2]=((r4|1)+900|0)/100;HEAPF32[r3>>2]=(r4+901|0)/100;return}function _game_timing_state(r1,r2){return(HEAP32[r1+36>>2]|0)==0&1}function _game_print(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+92|0;r6=r5,r7=r6>>2;r8=r5+32;r9=r5+68;r10=r5+88;r11=(r2|0)>>2;r12=HEAP32[r11];r13=_print_mono_colour(r1,0);r14=(r8+12|0)>>2;HEAP32[r14]=r3;r15=(r1|0)>>2;r16=HEAP32[HEAP32[r15]+84>>2];r17=(r1+4|0)>>2;r18=HEAP32[r17];r19=(r1+20|0)>>2;r20=(r3*3&-1|0)/40&-1|0;r21=r20*Math.sqrt(HEAPF32[r19]);FUNCTION_TABLE[r16](r18,r21);r21=(r3|0)/2&-1;r18=Math.imul(r12,r3);r16=r21-1+r18|0;r22=r6|0;HEAP32[r22>>2]=r21;HEAP32[r7+1]=r21;HEAP32[r7+2]=r21;HEAP32[r7+3]=r16;HEAP32[r7+4]=r16;HEAP32[r7+5]=r16;HEAP32[r7+6]=r16;HEAP32[r7+7]=r21;FUNCTION_TABLE[HEAP32[HEAP32[r15]+12>>2]](HEAP32[r17],r22,4,-1,r13);L1427:do{if((HEAP32[r2+12>>2]|0)==0){r4=1031}else{r22=_print_grey_colour(r1,.8999999761581421);r7=(r12|0)>0;if(r7){r23=0}else{break}while(1){r16=r21+Math.imul(r23,r3)|0;FUNCTION_TABLE[HEAP32[HEAP32[r15]+4>>2]](HEAP32[r17],r16,r16,r3,r3,r22);r16=r23+1|0;if((r16|0)==(r12|0)){break}else{r23=r16}}if(!r7){break}r16=r12-1|0;r6=0;while(1){if((r6<<1|0)!=(r16|0)){r24=r21+Math.imul(r6,r3)|0;r25=r21+Math.imul(r16-r6|0,r3)|0;FUNCTION_TABLE[HEAP32[HEAP32[r15]+4>>2]](HEAP32[r17],r24,r25,r3,r3,r22)}r25=r6+1|0;if((r25|0)==(r12|0)){r4=1031;break L1427}else{r6=r25}}}}while(0);L1438:do{if(r4==1031){r23=(r12|0)>1;if(!r23){break}r6=(r3|0)/40&-1|0;r22=r21+r18|0;r16=1;while(1){r7=HEAP32[HEAP32[r15]+84>>2];r25=HEAP32[r17];r24=r6*Math.sqrt(HEAPF32[r19]);FUNCTION_TABLE[r7](r25,r24);r24=r21+Math.imul(r16,r3)|0;FUNCTION_TABLE[HEAP32[HEAP32[r15]+8>>2]](HEAP32[r17],r24,r21,r24,r22,r13);r24=r16+1|0;if((r24|0)==(r12|0)){break}else{r16=r24}}if(!r23){break}r16=r21+r18|0;r22=1;while(1){r6=HEAP32[HEAP32[r15]+84>>2];r24=HEAP32[r17];r25=((r3|0)/40&-1|0)*Math.sqrt(HEAPF32[r19]);FUNCTION_TABLE[r6](r24,r25);r25=r21+Math.imul(r22,r3)|0;FUNCTION_TABLE[HEAP32[HEAP32[r15]+8>>2]](HEAP32[r17],r21,r25,r16,r25,r13);r25=r22+1|0;if((r25|0)==(r12|0)){break L1438}else{r22=r25}}}}while(0);r21=HEAP32[HEAP32[r15]+84>>2];r3=HEAP32[r17];r18=r20*Math.sqrt(HEAPF32[r19]);FUNCTION_TABLE[r21](r3,r18);_outline_block_structure(r1,r8,HEAP32[r11],HEAP32[r2+4>>2],r13,0);r18=r2+8|0;L1448:do{if((HEAP32[r18>>2]|0)!=0){r3=HEAP32[r14];r21=HEAP32[HEAP32[r15]+84>>2];r20=HEAP32[r17];r4=((r3|0)/40&-1|0)*Math.sqrt(HEAPF32[r19]);FUNCTION_TABLE[r21](r20,r4);FUNCTION_TABLE[HEAP32[HEAP32[r15]+88>>2]](HEAP32[r17],1);_outline_block_structure(r1,r8,HEAP32[r11],HEAP32[r18>>2],r13,(r3*5&-1|0)/40&-1);FUNCTION_TABLE[HEAP32[HEAP32[r15]+88>>2]](HEAP32[r17],0);if((r12|0)<=0){STACKTOP=r5;return}r3=r2+24|0;r4=r9|0;r20=HEAP32[r14];r21=(r20|0)/2&-1;r22=(r20*7&-1|0)/40&-1;r16=(r20<<4|0)/40&-1;r23=(r20|0)/4&-1;r25=0;while(1){r24=Math.imul(r25,r12);r6=r21+Math.imul(r20,r25)+r16|0;r7=0;while(1){r26=HEAP8[HEAP32[r3>>2]+r7+r24|0];if(r26<<24>>24!=0){_sprintf(r4,71512,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r26&255,tempInt));r26=r21+Math.imul(r20,r7)+r22|0;FUNCTION_TABLE[HEAP32[HEAP32[r15]>>2]](HEAP32[r17],r26,r6,1,r23,0,r13,r4)}r26=r7+1|0;if((r26|0)==(r12|0)){break}else{r7=r26}}r7=r25+1|0;if((r7|0)==(r12|0)){break L1448}else{r25=r7}}}}while(0);if((r12|0)<=0){STACKTOP=r5;return}r9=r2+20|0;r2=r10+1|0;r18=r10|0;r10=HEAP32[r14];r14=(r10|0)/2&-1;r11=r14<<1;r8=0;while(1){r1=Math.imul(r8,r12);r19=r11+Math.imul(r10,r8)|0;r25=0;while(1){r4=HEAP32[r9>>2]+r25+r1|0;if(HEAP8[r4]<<24>>24!=0){HEAP8[r2]=0;r23=HEAP8[r4];r4=r23+48&255;HEAP8[r18]=r4<<24>>24>57?r23+87&255:r4;r4=r11+Math.imul(r10,r25)|0;FUNCTION_TABLE[HEAP32[HEAP32[r15]>>2]](HEAP32[r17],r4,r19,1,r14,257,r13,r18)}r4=r25+1|0;if((r4|0)==(r12|0)){break}else{r25=r4}}r25=r8+1|0;if((r25|0)==(r12|0)){break}else{r8=r25}}STACKTOP=r5;return}function _outline_block_structure(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43;r7=0;r8=STACKTOP;r9=_malloc((r3<<4)+16|0);if((r9|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=r9;r11=r4+32|0;r12=HEAP32[r11>>2];if((r12|0)<=0){_free(r9);STACKTOP=r8;return}r13=r4+24|0;r14=r4+20|0;r15=(r4+16|0)>>2;r4=(r3<<1)+2|0;r16=r2+12|0;r2=r1|0;r17=r1+4|0;r1=0;r18=r12;while(1){if((HEAP32[HEAP32[r13>>2]+(r1<<2)>>2]|0)==0){r19=r18}else{r12=0;while(1){if((r12|0)>=(r3|0)){r7=1067;break}r20=HEAP32[HEAP32[HEAP32[r14>>2]+(r1<<2)>>2]+(r12<<2)>>2];if(((r20|0)%(r3|0)|0)==0){r21=r20;break}if((HEAP32[HEAP32[r15]+(r20-1<<2)>>2]|0)==(r1|0)){r12=r12+1|0}else{r21=r20;break}}if(r7==1067){r7=0;___assert_func(71104,5273,73076,70804);r21=HEAP32[HEAP32[HEAP32[r14>>2]+(r1<<2)>>2]+(r12<<2)>>2]}r20=(r21|0)%(r3|0);r22=(r21|0)/(r3|0)&-1;r23=0;r24=r20;r25=r22;r26=-1;r27=0;while(1){r28=r24-r27|0;r29=r28+r26|0;r30=r25+r26|0;r31=r30+r27|0;if((r29|0)>-1&(r29|0)<(r3|0)&(r31|0)>-1&(r31|0)<(r3|0)){r32=Math.imul(r31,r3)+r29|0;r33=(HEAP32[HEAP32[r15]+(r32<<2)>>2]|0)==(r1|0)}else{r33=0}if((r28|0)>-1&(r28|0)<(r3|0)&(r30|0)>-1&(r30|0)<(r3|0)){r32=Math.imul(r30,r3)+r28|0;r34=(HEAP32[HEAP32[r15]+(r32<<2)>>2]|0)==(r1|0)}else{r34=0}r32=(r34&1)+(r33&1)|0;r29=(r32|0)==0;do{if(r29){r35=r24;r36=r25;r37=-r27|0;r38=r26}else{if((r32|0)!=2){r35=r28;r36=r30;r37=r26;r38=r27;break}r35=r26-r27+r24|0;r36=r26+r27+r25|0;r37=r27;r38=-r26|0}}while(0);do{if((r35|0)>-1&(r35|0)<(r3|0)&(r36|0)>-1&(r36|0)<(r3|0)){r30=Math.imul(r36,r3)+r35|0;if((HEAP32[HEAP32[r15]+(r30<<2)>>2]|0)==(r1|0)){break}else{r7=1078;break}}else{r7=1078}}while(0);if(r7==1078){r7=0;___assert_func(71104,5346,73076,70384)}r30=r35+r37|0;do{if((r30|0)>-1&(r30|0)<(r3|0)){r28=r36+r38|0;if(!((r28|0)>-1&(r28|0)<(r3|0))){break}r31=Math.imul(r28,r3)+r30|0;if((HEAP32[HEAP32[r15]+(r31<<2)>>2]|0)!=(r1|0)){break}___assert_func(71104,5348,73076,69860)}}while(0);if((r23|0)>=(r4|0)){___assert_func(71104,5357,73076,69460)}r30=HEAP32[r16>>2];r31=((r30|0)/2&-1)+Math.imul(r30,(r37+r38+(r35<<1|1)|0)/2&-1)|0;r30=r23<<1;r28=((r30<<2)+r10|0)>>2;HEAP32[r28]=r31;r39=HEAP32[r16>>2];r40=((r39|0)/2&-1)+Math.imul(r39,(r38-r37+(r36<<1|1)|0)/2&-1)|0;r39=(((r30|1)<<2)+r10|0)>>2;r30=Math.imul(r37,r6);r41=r31-r30|0;HEAP32[r28]=r41;r31=Math.imul(r38,r6);r42=r40-r31|0;HEAP32[r39]=r42;do{if(r29){HEAP32[r28]=r41-r31|0;HEAP32[r39]=r42+r30|0}else{if((r32|0)!=2){break}HEAP32[r28]=r41+r31|0;HEAP32[r39]=r42-r30|0}}while(0);r43=r23+1|0;if((r35|0)==(r20|0)&(r36|0)==(r22|0)&(r37|0)==-1&(r38|0)==0){break}else{r23=r43;r24=r35;r25=r36;r26=r37;r27=r38}}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+12>>2]](HEAP32[r17>>2],r10,r43,-1,r5);r19=HEAP32[r11>>2]}r27=r1+1|0;if((r27|0)<(r19|0)){r1=r27;r18=r19}else{break}}_free(r9);STACKTOP=r8;return}function _check_valid(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r6=0;r7=STACKTOP;r8=_malloc(r1);if((r8|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r9=(r1|0)>0;L1528:do{if(r9){r10=0;L1529:while(1){_memset(r8,0,r1);r11=Math.imul(r10,r1);r12=0;while(1){r13=HEAP8[r5+r12+r11|0];r14=r13&255;if(!(r13<<24>>24==0|(r14|0)>(r1|0))){HEAP8[r8+(r14-1)|0]=1}r14=r12+1|0;if((r14|0)==(r1|0)){r15=0;break}else{r12=r14}}while(1){if((r15|0)>=(r1|0)){break}if(HEAP8[r8+r15|0]<<24>>24==0){r6=1105;break L1529}else{r15=r15+1|0}}r12=r10+1|0;if((r12|0)<(r1|0)){r10=r12}else{break}}if(r6==1105){_free(r8);r16=0;STACKTOP=r7;return r16}if(r9){r17=0}else{break}L1544:while(1){_memset(r8,0,r1);r10=0;while(1){r12=r5+Math.imul(r10,r1)+r17|0;r11=HEAP8[r12];r12=r11&255;if(!(r11<<24>>24==0|(r12|0)>(r1|0))){HEAP8[r8+(r12-1)|0]=1}r12=r10+1|0;if((r12|0)==(r1|0)){r18=0;break}else{r10=r12}}while(1){if((r18|0)>=(r1|0)){break}if(HEAP8[r8+r18|0]<<24>>24==0){r6=1115;break L1544}else{r18=r18+1|0}}r10=r17+1|0;if((r10|0)<(r1|0)){r17=r10}else{break}}if(r6==1115){_free(r8);r16=0;STACKTOP=r7;return r16}if(!r9){break}r10=r2+20|0;r12=0;L1560:while(1){_memset(r8,0,r1);r11=0;while(1){r14=HEAP8[r5+HEAP32[HEAP32[HEAP32[r10>>2]+(r12<<2)>>2]+(r11<<2)>>2]|0];r13=r14&255;if(!(r14<<24>>24==0|(r13|0)>(r1|0))){HEAP8[r8+(r13-1)|0]=1}r13=r11+1|0;if((r13|0)==(r1|0)){r19=0;break}else{r11=r13}}while(1){if((r19|0)>=(r1|0)){break}if(HEAP8[r8+r19|0]<<24>>24==0){break L1560}else{r19=r19+1|0}}r11=r12+1|0;if((r11|0)<(r1|0)){r12=r11}else{break L1528}}_free(r8);r16=0;STACKTOP=r7;return r16}}while(0);L1574:do{if((r3|0)!=0){r19=r3+32|0;if((HEAP32[r19>>2]|0)<=0){break}r2=r3+24|0;r17=r3+20|0;r18=0;L1577:while(1){_memset(r8,0,r1);r15=HEAP32[r2>>2];L1579:do{if((HEAP32[r15+(r18<<2)>>2]|0)>0){r12=0;r10=r15;while(1){r11=HEAP8[r5+HEAP32[HEAP32[HEAP32[r17>>2]+(r18<<2)>>2]+(r12<<2)>>2]|0];r13=r11&255;if(r11<<24>>24==0|(r13|0)>(r1|0)){r20=r10}else{r11=r8+(r13-1)|0;if(HEAP8[r11]<<24>>24!=0){break L1577}HEAP8[r11]=1;r20=HEAP32[r2>>2]}r11=r12+1|0;if((r11|0)<(HEAP32[r20+(r18<<2)>>2]|0)){r12=r11;r10=r20}else{break L1579}}}}while(0);r15=r18+1|0;if((r15|0)<(HEAP32[r19>>2]|0)){r18=r15}else{break L1574}}_free(r8);r16=0;STACKTOP=r7;return r16}}while(0);L1590:do{if((r4|0)!=0){_memset(r8,0,r1);L1592:do{if(r9){r20=r1+1|0;r3=0;while(1){r18=r5+Math.imul(r3,r20)|0;r19=HEAP8[r18];r18=r19&255;if(!(r19<<24>>24==0|(r18|0)>(r1|0))){HEAP8[r8+(r18-1)|0]=1}r18=r3+1|0;if((r18|0)==(r1|0)){r21=0;break L1592}else{r3=r18}}}else{r21=0}}while(0);while(1){if((r21|0)>=(r1|0)){break}if(HEAP8[r8+r21|0]<<24>>24==0){r6=1145;break}else{r21=r21+1|0}}if(r6==1145){_free(r8);r16=0;STACKTOP=r7;return r16}L1606:do{if(r9){r3=r1-1|0;r20=0;while(1){r18=r20+1|0;r19=r5+Math.imul(r18,r3)|0;r2=HEAP8[r19];r19=r2&255;if(!(r2<<24>>24==0|(r19|0)>(r1|0))){HEAP8[r8+(r19-1)|0]=1}if((r18|0)==(r1|0)){r22=0;break L1606}else{r20=r18}}}else{r22=0}}while(0);while(1){if((r22|0)>=(r1|0)){break L1590}if(HEAP8[r8+r22|0]<<24>>24==0){break}else{r22=r22+1|0}}_free(r8);r16=0;STACKTOP=r7;return r16}}while(0);_free(r8);r16=1;STACKTOP=r7;return r16}function _solver(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187,r188,r189,r190,r191,r192,r193,r194,r195,r196,r197,r198,r199,r200,r201,r202,r203,r204,r205,r206,r207,r208,r209,r210,r211,r212,r213,r214,r215,r216,r217,r218,r219,r220,r221,r222,r223,r224,r225,r226,r227,r228,r229,r230,r231,r232,r233,r234,r235,r236,r237,r238,r239,r240,r241,r242,r243,r244,r245,r246,r247,r248,r249,r250,r251,r252,r253,r254,r255,r256,r257,r258,r259,r260,r261,r262,r263,r264,r265,r266,r267,r268,r269,r270,r271,r272,r273,r274,r275,r276,r277,r278,r279,r280,r281,r282,r283,r284,r285,r286,r287,r288,r289;r8=0;r9=STACKTOP;r10=_malloc(60),r11=r10>>2;if((r10|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r12=r10;r13=r10>>2;HEAP32[r13]=r1;r14=(r10+4|0)>>2;HEAP32[r14]=r2;r15=(r3|0)!=0;do{if(r15){r16=r3+4|0;r17=r3+8|0;r18=r3+12|0;r19=r3+36|0;r20=(r3+32|0)>>2;r21=_alloc_block_structure(HEAP32[r16>>2],HEAP32[r17>>2],HEAP32[r18>>2],HEAP32[r19>>2],HEAP32[r20]);_memcpy(HEAP32[r21+24>>2],HEAP32[r3+24>>2],HEAP32[r20]<<2);_memcpy(HEAP32[r21+16>>2],HEAP32[r3+16>>2],HEAP32[r18>>2]<<2);r18=r21+28|0;_memcpy(HEAP32[r18>>2],HEAP32[r3+28>>2],Math.imul(HEAP32[r20]<<2,HEAP32[r19>>2]));L1626:do{if((HEAP32[r20]|0)>0){r19=r21+36|0;r22=r21+20|0;r23=0;while(1){r24=HEAP32[r18>>2]+(Math.imul(HEAP32[r19>>2],r23)<<2)|0;HEAP32[HEAP32[r22>>2]+(r23<<2)>>2]=r24;r24=r23+1|0;if((r24|0)<(HEAP32[r20]|0)){r23=r24}else{break L1626}}}}while(0);HEAP32[r11+2]=r21;r20=HEAP32[r16>>2];r18=HEAP32[r17>>2];r23=Math.imul(r1,r1);r22=_alloc_block_structure(r20,r18,r23,r1,r23);HEAP32[r11+3]=r22;r22=_malloc(r23);if((r22|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r11+7]=r22;r25=r23;break}}else{HEAP32[r11+3]=0;HEAP32[r11+2]=0;HEAP32[r11+7]=0;r25=Math.imul(r1,r1)}}while(0);r23=Math.imul(r25,r1);r22=_malloc(r23);if((r22|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r18=(r10+16|0)>>2;HEAP32[r18]=r22;r20=(r10+20|0)>>2;HEAP32[r20]=r5;if((r6|0)==0){HEAP32[r11+6]=0;r26=r22}else{if(!r15){___assert_func(71104,1719,73016,71676)}r15=HEAP32[r3+32>>2];r22=_malloc(r25);if((r22|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r19=(r10+24|0)>>2;HEAP32[r19]=r22;if((r15|0)>0){r24=r3+24|0;r27=r3+20|0;r28=0;while(1){r29=HEAP32[r24>>2];L1652:do{if((HEAP32[r29+(r28<<2)>>2]|0)>0){r30=0;r31=r29;while(1){r32=HEAP8[r6+HEAP32[HEAP32[HEAP32[r27>>2]+(r28<<2)>>2]+(r30<<2)>>2]|0];if(r32<<24>>24==0){r33=r31}else{HEAP8[HEAP32[r19]+r28|0]=r32;r33=HEAP32[r24>>2]}r32=r30+1|0;if((r32|0)<(HEAP32[r33+(r28<<2)>>2]|0)){r30=r32;r31=r33}else{break L1652}}}}while(0);if(HEAP8[HEAP32[r19]+r28|0]<<24>>24==0){___assert_func(71104,1730,73016,71652)}r29=r28+1|0;if((r29|0)==(r15|0)){break}else{r28=r29}}r34=HEAP32[r19]}else{r34=r22}_memset(r34+r15|0,0,r25-r15|0);r26=HEAP32[r18]}_memset(r26,1,r23);r23=_malloc(r25);if((r23|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r26=(r10+32|0)>>2;HEAP32[r26]=r23;r23=_malloc(r25);if((r23|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r15=(r10+36|0)>>2;HEAP32[r15]=r23;r23=_malloc(r25);if((r23|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r34=(r10+40|0)>>2;HEAP32[r34]=r23;_memset(HEAP32[r26],0,r25);_memset(HEAP32[r15],0,r25);_memset(HEAP32[r34],0,r25);r23=(r4|0)!=0;do{if(r23){r22=r1<<1;r19=_malloc(r22);if((r19|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r11+11]=r19;_memset(r19,0,r22);break}}else{HEAP32[r11+11]=0}}while(0);r22=(r23?2:0)+(r1*3&-1)|0;HEAP32[r11+13]=r22;r23=r1<<2;r19=_malloc(Math.imul(r23,r22));if((r19|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r22=(r10+48|0)>>2;HEAP32[r22]=r19;r19=_malloc(r25*12&-1);if((r19|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r28=(r10+56|0)>>2;HEAP32[r28]=r19;r19=(r1|0)>0;L1687:do{if(r19){r33=r1<<1;r24=0;while(1){r27=Math.imul(r24,r1);r29=r27*3&-1;r17=r29+r1|0;r16=r29+r33|0;r21=0;while(1){r31=r21+r27|0;r30=Math.imul(r21,r1)+r24|0;r32=HEAP32[HEAP32[HEAP32[HEAP32[r14]+20>>2]+(r24<<2)>>2]+(r21<<2)>>2];HEAP32[HEAP32[r22]+(r21+r29<<2)>>2]=r31;HEAP32[HEAP32[r22]+(r17+r21<<2)>>2]=r30;HEAP32[HEAP32[r22]+(r16+r21<<2)>>2]=r32;HEAP32[HEAP32[r28]+((r31*3&-1)<<2)>>2]=(r29<<2)+HEAP32[r22]|0;HEAP32[HEAP32[r28]+((r30*3&-1)+1<<2)>>2]=(r17<<2)+HEAP32[r22]|0;HEAP32[HEAP32[r28]+((r32*3&-1)+2<<2)>>2]=(r16<<2)+HEAP32[r22]|0;r32=r21+1|0;if((r32|0)==(r1|0)){break}else{r21=r32}}r21=r24+1|0;if((r21|0)==(r1|0)){break L1687}else{r24=r21}}}}while(0);r24=_malloc(32);if((r24|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r33=r24;r21=HEAP32[r13];r16=Math.imul(r21,r21);r17=_malloc(r16);if((r17|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r29=r24>>2;HEAP32[r29]=r17;r17=_malloc(r21);if((r17|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r27=r24+4|0;HEAP32[r27>>2]=r17;r17=_malloc(r21);if((r17|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r32=r24+8|0;HEAP32[r32>>2]=r17;r17=_malloc(r21);if((r17|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r30=r24+12|0;HEAP32[r30>>2]=r17;r17=_malloc(r21*20&-1);if((r17|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r31=(r24+16|0)>>2;HEAP32[r31]=r17;r17=r16<<2;r16=_malloc(r17);if((r16|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r35=(r24+20|0)>>2;HEAP32[r35]=r16;r16=_malloc(r17);if((r16|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r17=(r24+24|0)>>2;HEAP32[r17]=r16;r16=_malloc(r21<<2);if((r16|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r21=(r24+28|0)>>2;HEAP32[r21]=r16;L1722:do{if(r19){r16=0;while(1){r36=0;while(1){r37=r5+Math.imul(r36,r1)+r16|0;r38=HEAP8[r37];r37=r38&255;if(r38<<24>>24!=0){r38=HEAP32[r13];r39=r37-1+Math.imul(Math.imul(r38,r36)+r16|0,r38)|0;if(HEAP8[HEAP32[r18]+r39|0]<<24>>24==0){r40=7;r41=0;break L1722}_solver_place(r12,r16,r36,r37)}r37=r36+1|0;if((r37|0)<(r1|0)){r36=r37}else{break}}r36=r16+1|0;if((r36|0)<(r1|0)){r16=r36}else{r8=1230;break L1722}}}else{r8=1230}}while(0);L1732:do{if(r8==1230){r16=(r10+24|0)>>2;r36=(r7+4|0)>>2;r37=(r10+12|0)>>2;r39=r1+1|0;r38=(Math.imul(r39,r1)|0)/2&-1;r42=(r10+8|0)>>2;r43=(r7|0)>>2;r44=(r10+28|0)>>2;r45=(r10+44|0)>>2;r46=(r1|0)<1;r47=r1-1|0;r48=0;r49=0;L1734:while(1){L1736:do{if(r19){r50=0;L1737:while(1){L1739:do{if(!r46){r51=Math.imul(r50,r1)-1|0;r52=1;while(1){do{if(HEAP8[HEAP32[r34]+r51+r52|0]<<24>>24==0){r53=r52-1|0;r54=0;while(1){r55=r53+Math.imul(HEAP32[r13],HEAP32[HEAP32[HEAP32[HEAP32[r14]+20>>2]+(r50<<2)>>2]+(r54<<2)>>2])|0;HEAP32[HEAP32[r17]+(r54<<2)>>2]=r55;r55=r54+1|0;if((r55|0)==(r1|0)){break}else{r54=r55}}r54=HEAP32[r17];r56=HEAP32[r13];if((r56|0)<=0){r40=7;r41=r49;break L1732}r53=HEAP32[r18];r55=0;r57=0;r58=-1;while(1){r59=HEAP32[r54+(r57<<2)>>2];r60=HEAP8[r53+r59|0]<<24>>24==0;r61=(r60&1^1)+r55|0;r62=r60?r58:r59;r59=r57+1|0;if((r59|0)==(r56|0)){break}else{r55=r61;r57=r59;r58=r62}}if((r61|0)==0){r40=7;r41=r49;break L1732}else if((r61|0)!=1){break}if((r62|0)<=-1){___assert_func(71104,874,73004,71124)}r58=(r62|0)/(r56|0)&-1;r63=(r58|0)/(r56|0)&-1;r64=(r58|0)%(r56|0);r58=Math.imul(r63,r56)+r64|0;if(HEAP8[HEAP32[r20]+r58|0]<<24>>24==0){break L1737}}}while(0);r58=r52+1|0;if((r58|0)>(r1|0)){break L1739}else{r52=r58}}}}while(0);r52=r50+1|0;if((r52|0)<(r1|0)){r50=r52}else{break L1736}}_solver_place(r12,r64,r63,(r62|0)%(r56|0)+1|0);r48=(r48|0)>0?r48:0;r49=r49;continue L1734}}while(0);do{if((HEAP32[r16]|0)!=0){r50=HEAP32[r42];if((HEAP32[r50+32>>2]|0)>0){r65=0;r66=r50}else{break}while(1){r50=HEAP32[HEAP32[r66+24>>2]+(r65<<2)>>2];L1764:do{if((r50|0)>0){r52=r50;r51=r66;while(1){r58=r52-1|0;r57=r51+20|0;r55=HEAP32[HEAP32[HEAP32[r57>>2]+(r65<<2)>>2]+(r58<<2)>>2];r53=HEAP8[HEAP32[r20]+r55|0];r54=r53&255;L1767:do{if(r53<<24>>24==0){r67=r51}else{HEAP32[HEAP32[r51+16>>2]+(r55<<2)>>2]=-1;r59=(r51+24|0)>>2;r60=HEAP32[r59];L1769:do{if((HEAP32[r60+(r65<<2)>>2]|0)>0){r68=0;r69=0;r70=r60;while(1){r71=HEAP32[HEAP32[r57>>2]+(r65<<2)>>2];r72=HEAP32[r71+(r68<<2)>>2];if((r72|0)==(r55|0)){r73=r69;r74=r70}else{HEAP32[r71+(r69<<2)>>2]=r72;r73=r69+1|0;r74=HEAP32[r59]}r72=r68+1|0;if((r72|0)<(HEAP32[r74+(r65<<2)>>2]|0)){r68=r72;r69=r73;r70=r74}else{r75=r72;r76=r73;r77=r74;break L1769}}}else{r75=0;r76=0;r77=r60}}while(0);if((r76+1|0)==(r75|0)){r78=r77}else{___assert_func(71104,640,73024,71136);r78=HEAP32[r59]}r60=(r65<<2)+r78|0;HEAP32[r60>>2]=HEAP32[r60>>2]-1|0;r60=HEAP32[r16]+r65|0;r70=HEAP8[r60];if((r53&255)>(r70&255)){r40=7;r41=r49;break L1732}HEAP8[r60]=r70-r53&255;r70=HEAP32[r42];if((HEAP32[HEAP32[r70+24>>2]+(r65<<2)>>2]|0)<=0){r67=r70;break}r60=r54-1|0;r69=0;r68=r70;while(1){r70=r60+Math.imul(HEAP32[r13],HEAP32[HEAP32[HEAP32[r68+20>>2]+(r65<<2)>>2]+(r69<<2)>>2])|0;HEAP8[HEAP32[r18]+r70|0]=0;r70=r69+1|0;r72=HEAP32[r42];if((r70|0)<(HEAP32[HEAP32[r72+24>>2]+(r65<<2)>>2]|0)){r69=r70;r68=r72}else{r67=r72;break L1767}}}}while(0);if((r58|0)>0){r52=r58;r51=r67}else{r79=r67;break L1764}}}else{r79=r66}}while(0);r50=r65+1|0;r80=HEAP32[r79+32>>2];if((r50|0)<(r80|0)){r65=r50;r66=r79}else{break}}if((r80|0)>0){r81=0;r82=0;r83=r79}else{break}while(1){if((HEAP32[HEAP32[r83+24>>2]+(r82<<2)>>2]|0)==1){r50=HEAP8[HEAP32[r16]+r82|0];r51=r50&255;if(r50<<24>>24==0|(r51|0)>(r1|0)){r40=7;r41=r49;break L1732}r50=HEAP32[HEAP32[HEAP32[r83+20>>2]+(r82<<2)>>2]>>2];r52=(r50|0)%(r1|0);r54=(r50|0)/(r1|0)&-1;r50=HEAP32[r13];r53=r51-1+Math.imul(Math.imul(r50,r54)+r52|0,r50)|0;if(HEAP8[HEAP32[r18]+r53|0]<<24>>24==0){r40=7;r41=r49;break L1732}_solver_place(r12,r52,r54,r51);r84=1;r85=HEAP32[r42]}else{r84=r81;r85=r83}r51=r82+1|0;if((r51|0)<(HEAP32[r85+32>>2]|0)){r81=r84;r82=r51;r83=r85}else{break}}if((r84|0)==0){break}r48=r48;r49=(r49|0)>0?r49:0;continue L1734}}while(0);r51=HEAP32[r36];do{if((r51|0)>2){if((HEAP32[r16]|0)==0){r86=r49;break}HEAP32[HEAP32[r37]+32>>2]=0;r54=0;r52=0;while(1){L1801:do{if(r19){r53=r54;r50=0;while(1){r55=HEAP32[r22]+(Math.imul((r50*3&-1)+r52|0,r1)<<2)|0;r57=HEAP32[r37];r68=HEAP32[r57+32>>2];r69=HEAP32[HEAP32[r57+20>>2]+(r68<<2)>>2],r57=r69>>2;_memcpy(r69,r55,r23);r55=0;r60=0;r59=0;while(1){r72=HEAP32[(r55<<2>>2)+r57];r70=HEAP8[HEAP32[r20]+r72|0];if(r70<<24>>24==0){HEAP32[(r60<<2>>2)+r57]=r72;r87=r60+1|0;r88=r59}else{r87=r60;r88=(r70&255)+r59|0}r70=r55+1|0;if((r70|0)==(r1|0)){break}else{r55=r70;r60=r87;r59=r88}}r59=HEAP32[r42];L1811:do{if((HEAP32[r59+32>>2]|0)>0&(r87|0)>0){r60=0;r55=0;r58=r87;r70=r59;r72=r88;while(1){r71=HEAP32[HEAP32[r70+24>>2]+(r55<<2)>>2];do{if((r71|0)==0){r89=r58;r90=r60;r91=r70;r92=r72}else{if((r71|0)>0){r93=0;r94=0;while(1){r95=r60;while(1){if((r95|0)>=(r58|0)){r96=r94;break}r97=(r95<<2)+r69|0;r98=HEAP32[r97>>2];if((r98|0)==(HEAP32[HEAP32[HEAP32[HEAP32[r42]+20>>2]+(r55<<2)>>2]+(r93<<2)>>2]|0)){r8=1291;break}else{r95=r95+1|0}}if(r8==1291){r8=0;r95=(r94+r60<<2)+r69|0;r99=HEAP32[r95>>2];HEAP32[r95>>2]=r98;HEAP32[r97>>2]=r99;r96=r94+1|0}r99=r93+1|0;if((r99|0)==(r71|0)){break}else{r93=r99;r94=r96}}r94=HEAP32[r42];r100=r96;r101=r94;r102=HEAP32[HEAP32[r94+24>>2]+(r55<<2)>>2]}else{r100=0;r101=r70;r102=r71}if((r100|0)==(r102|0)){_memmove((r60<<2)+r69|0,(r102+r60<<2)+r69|0,r58-r60-r102<<2,4,0);r89=r58-r102|0;r90=r60;r91=HEAP32[r42];r92=HEAPU8[HEAP32[r16]+r55|0]+r72|0;break}else{r89=r58;r90=r100+r60|0;r91=r101;r92=r72;break}}}while(0);r71=r55+1|0;if((r71|0)<(HEAP32[r91+32>>2]|0)&(r90|0)<(r89|0)){r60=r90;r55=r71;r58=r89;r70=r91;r72=r92}else{r103=r90;r104=r89;r105=r92;break L1811}}}else{r103=0;r104=r87;r105=r88}}while(0);if((r103|0)!=(r104|0)){___assert_func(71104,1639,73360,71148)}r59=r38-r105|0;do{if((r103|0)==(r1|0)|(r103|0)==0){r106=r53}else{if((HEAP32[r43]|0)>4&(r59|0)<1){r8=1302;break L1734}if((r59|0)<=0){___assert_func(71104,1927,73016,71644)}if((r103|0)==1){if((r59|0)>(r1|0)){r40=7;r41=r49;break L1732}r72=HEAP32[r57];r70=(r72|0)%(r1|0);r58=(r72|0)/(r1|0)&-1;r72=HEAP32[r13];r55=r59-1+Math.imul(Math.imul(r72,r58)+r70|0,r72)|0;if(HEAP8[HEAP32[r18]+r55|0]<<24>>24==0){r40=7;r41=r49;break L1732}_solver_place(r12,r70,r58,r59);r107=1}else{r107=r53}r58=HEAP32[r42];r70=HEAP32[r58+16>>2];r55=HEAP32[r70+(HEAP32[r57]<<2)>>2];r72=1;while(1){if((r72|0)>=(r103|0)){break}if((HEAP32[r70+(HEAP32[(r72<<2>>2)+r57]<<2)>>2]|0)==(r55|0)){r72=r72+1|0}else{break}}if((r72|0)!=(r103|0)){HEAP32[HEAP32[HEAP32[r37]+24>>2]+(r68<<2)>>2]=r103;r70=HEAP32[r37]+32|0;HEAP32[r70>>2]=HEAP32[r70>>2]+1|0;HEAP8[HEAP32[r44]+r68|0]=r59&255;r106=r107;break}if((HEAP32[HEAP32[r58+24>>2]+(r55<<2)>>2]|0)>(r103|0)){r108=r58;r109=r55}else{___assert_func(71104,1956,73016,71600);r70=HEAP32[r42];r108=r70;r109=HEAP32[HEAP32[r70+16>>2]+(HEAP32[r57]<<2)>>2]}r70=r108+16|0;r60=(r108+32|0)>>2;r71=HEAP32[r60];r94=(r108+36|0)>>2;if((HEAP32[r94]|0)<(r103|0)){___assert_func(71104,604,72916,71260)}r93=(r108+24|0)>>2;if((HEAP32[HEAP32[r93]+(r109<<2)>>2]|0)<=(r103|0)){___assert_func(71104,605,72916,71216)}r99=HEAP32[r60]+1|0;HEAP32[r60]=r99;r95=(r108+28|0)>>2;r110=HEAP32[r95];r111=Math.imul(r99<<2,HEAP32[r94]);if((r110|0)==0){r112=_malloc(r111)}else{r112=_realloc(r110,r111)}if((r112|0)==0){r8=1323;break L1734}HEAP32[r95]=r112;r111=HEAP32[r93];r110=HEAP32[r60]<<2;if((r111|0)==0){r113=_malloc(r110)}else{r113=_realloc(r111,r110)}if((r113|0)==0){r8=1328;break L1734}HEAP32[r93]=r113;r110=(r108+20|0)>>2;r111=HEAP32[r110];if((r111|0)!=0){_free(r111)}r111=_malloc(HEAP32[r60]<<2);if((r111|0)==0){r8=1332;break L1734}r99=r111;HEAP32[r110]=r99;L1876:do{if((HEAP32[r60]|0)>0){HEAP32[r99>>2]=HEAP32[r95];if((HEAP32[r60]|0)>1){r114=1}else{break}while(1){r111=HEAP32[r110];r115=HEAP32[r95]+(Math.imul(HEAP32[r94],r114)<<2)|0;HEAP32[r111+(r114<<2)>>2]=r115;r115=r114+1|0;if((r115|0)<(HEAP32[r60]|0)){r114=r115}else{break L1876}}}}while(0);L1881:do{if((r103|0)>0){r60=0;while(1){r94=((r60<<2)+r69|0)>>2;r95=HEAP32[r94];r99=HEAP32[r70>>2];if((HEAP32[r99+(r95<<2)>>2]|0)==(r109|0)){r116=r95;r117=r99}else{___assert_func(71104,616,72916,71172);r116=HEAP32[r94];r117=HEAP32[r70>>2]}HEAP32[r117+(r116<<2)>>2]=r71;HEAP32[HEAP32[HEAP32[r110]+(r71<<2)>>2]+(r60<<2)>>2]=HEAP32[r94];r94=r60+1|0;if((r94|0)==(r103|0)){break L1881}else{r60=r94}}}}while(0);r70=HEAP32[r93];r60=(r109<<2)+r70|0;r94=HEAP32[r60>>2];L1888:do{if((r94|0)>0){r99=0;r95=0;r58=r70;while(1){r72=HEAP32[HEAP32[r110]+(r109<<2)>>2];r115=HEAP32[r72+(r95<<2)>>2];r111=0;while(1){if((r111|0)>=(r103|0)){break}if((HEAP32[(r111<<2>>2)+r57]|0)==(r115|0)){break}else{r111=r111+1|0}}if((r111|0)==(r103|0)){HEAP32[r72+(r99<<2)>>2]=r115;r118=r99+1|0;r119=HEAP32[r93]}else{r118=r99;r119=r58}r120=r95+1|0;r121=(r109<<2)+r119|0;r122=HEAP32[r121>>2];if((r120|0)<(r122|0)){r99=r118;r95=r120;r58=r119}else{r123=r121;r124=r122;break L1888}}}else{r123=r60;r124=r94}}while(0);HEAP32[r123>>2]=r124-r103|0;HEAP32[HEAP32[r93]+(r71<<2)>>2]=r103;r94=HEAP32[r42];r60=HEAP32[r94+32>>2];if((HEAP32[HEAP32[r94+24>>2]+(r60-1<<2)>>2]|0)==(r103|0)){r125=r60}else{___assert_func(71104,1958,73016,71528);r125=HEAP32[HEAP32[r42]+32>>2]}HEAP8[HEAP32[r16]+(r125-1)|0]=r59&255;r60=HEAP32[r16]+r55|0;HEAP8[r60]=HEAPU8[r60]-r59&255;r106=r107}}while(0);r59=r50+1|0;if((r59|0)<(r1|0)){r53=r106;r50=r59}else{r126=r106;break L1801}}}else{r126=r54}}while(0);r50=r52+1|0;if((r50|0)<3){r54=r126;r52=r50}else{break}}if((r126|0)==0){r127=HEAP32[r36];r8=1356;break}else{r48=r48;r49=(r49|0)>3?r49:3;continue L1734}}else{r127=r51;r8=1356}}while(0);do{if(r8==1356){r8=0;if((r127|0)<=0){r86=r49;break}r51=HEAP32[r16];do{if((r51|0)==0){r128=r127}else{r52=HEAP32[r42];L1913:do{if((HEAP32[r52+32>>2]|0)>0){r54=0;r50=0;r53=r52;r59=r51;while(1){r57=_solver_killer_minmax(r12,r53,r59,r50);if((r57|0)<0){r40=7;r41=r49;break L1732}r69=(r57|0)>0?1:r54;r57=r50+1|0;r68=HEAP32[r42];if((r57|0)>=(HEAP32[r68+32>>2]|0)){r129=r69;break L1913}r54=r69;r50=r57;r53=r68;r59=HEAP32[r16]}}else{r129=0}}while(0);r52=HEAP32[r37];L1919:do{if((HEAP32[r52+32>>2]|0)>0){r59=r129;r53=0;r50=r52;while(1){r54=_solver_killer_minmax(r12,r50,HEAP32[r44],r53);if((r54|0)<0){r40=7;r41=r49;break L1732}r68=(r54|0)>0?1:r59;r54=r53+1|0;r57=HEAP32[r37];if((r54|0)<(HEAP32[r57+32>>2]|0)){r59=r68;r53=r54;r50=r57}else{r130=r68;break L1919}}}else{r130=r129}}while(0);if((r130|0)==0){r128=HEAP32[r36];break}else{r48=r48;r49=(r49|0)>1?r49:1;continue L1734}}}while(0);if((r128|0)<=1){r86=r49;break}r51=HEAP32[r16];if((r51|0)==0){r86=r49;break}r52=HEAP32[r42];L1930:do{if((HEAP32[r52+32>>2]|0)>0){r50=r49;r53=0;r59=0;r68=r52;r57=r51;while(1){r54=_solver_killer_sums(r12,r59,r68,HEAPU8[r57+r59|0],1);if((r54|0)>0){r131=1;r132=(r50|0)>2?r50:2}else{if((r54|0)<0){r40=7;r41=r50;break L1732}else{r131=r53;r132=r50}}r54=r59+1|0;r69=HEAP32[r42];if((r54|0)>=(HEAP32[r69+32>>2]|0)){r133=r132;r134=r131;break L1930}r50=r132;r53=r131;r59=r54;r68=r69;r57=HEAP32[r16]}}else{r133=r49;r134=0}}while(0);r51=HEAP32[r37];L1939:do{if((HEAP32[r51+32>>2]|0)>0){r52=r133;r57=r134;r68=0;r59=r51;while(1){r53=_solver_killer_sums(r12,r68,r59,HEAPU8[HEAP32[r44]+r68|0],0);if((r53|0)>0){r135=1;r136=(r52|0)>2?r52:2}else{if((r53|0)<0){r40=7;r41=r52;break L1732}else{r135=r57;r136=r52}}r53=r68+1|0;r50=HEAP32[r37];if((r53|0)<(HEAP32[r50+32>>2]|0)){r52=r136;r57=r135;r68=r53;r59=r50}else{r137=r136;r138=r135;break L1939}}}else{r137=r133;r138=r134}}while(0);if((r138|0)==0){r86=r137}else{r48=r48;r49=r137;continue L1734}}}while(0);if((HEAP32[r43]|0)<1){break}L1949:do{if(r19){r51=0;L1950:while(1){L1952:do{if(!r46){r59=Math.imul(r51,r1)-1|0;r68=1;while(1){do{if(HEAP8[HEAP32[r26]+r59+r68|0]<<24>>24==0){r57=r68-1|0;r52=0;while(1){r50=HEAP32[r13];r53=r57+Math.imul(Math.imul(r50,r51)+r52|0,r50)|0;HEAP32[HEAP32[r17]+(r52<<2)>>2]=r53;r53=r52+1|0;if((r53|0)==(r1|0)){break}else{r52=r53}}r52=HEAP32[r17];r139=HEAP32[r13];if((r139|0)<=0){r40=7;r41=r86;break L1732}r57=HEAP32[r18];r55=0;r71=0;r93=-1;while(1){r53=HEAP32[r52+(r71<<2)>>2];r50=HEAP8[r57+r53|0]<<24>>24==0;r140=(r50&1^1)+r55|0;r141=r50?r93:r53;r53=r71+1|0;if((r53|0)==(r139|0)){break}else{r55=r140;r71=r53;r93=r141}}if((r140|0)==0){r40=7;r41=r86;break L1732}else if((r140|0)!=1){break}if((r141|0)<=-1){___assert_func(71104,874,73004,71124)}r93=(r141|0)/(r139|0)&-1;r142=(r93|0)/(r139|0)&-1;r143=(r93|0)%(r139|0);r93=Math.imul(r142,r139)+r143|0;if(HEAP8[HEAP32[r20]+r93|0]<<24>>24==0){r8=1397;break L1950}}}while(0);r93=r68+1|0;if((r93|0)>(r1|0)){break L1952}else{r68=r93}}}}while(0);r68=r51+1|0;if((r68|0)<(r1|0)){r51=r68}else{break}}if(r8==1397){r8=0;_solver_place(r12,r143,r142,(r141|0)%(r139|0)+1|0);r48=(r48|0)>1?r48:1;r49=r86;continue L1734}if(r19){r144=0}else{break}L1974:while(1){L1976:do{if(!r46){r51=Math.imul(r144,r1)-1|0;r68=1;while(1){do{if(HEAP8[HEAP32[r15]+r51+r68|0]<<24>>24==0){r59=r68-1|0;r93=0;while(1){r71=HEAP32[r13];r55=r59+Math.imul(Math.imul(r71,r93)+r144|0,r71)|0;HEAP32[HEAP32[r17]+(r93<<2)>>2]=r55;r55=r93+1|0;if((r55|0)==(r1|0)){break}else{r93=r55}}r93=HEAP32[r17];r145=HEAP32[r13];if((r145|0)<=0){r40=7;r41=r86;break L1732}r59=HEAP32[r18];r55=0;r71=0;r57=-1;while(1){r52=HEAP32[r93+(r71<<2)>>2];r53=HEAP8[r59+r52|0]<<24>>24==0;r146=(r53&1^1)+r55|0;r147=r53?r57:r52;r52=r71+1|0;if((r52|0)==(r145|0)){break}else{r55=r146;r71=r52;r57=r147}}if((r146|0)==0){r40=7;r41=r86;break L1732}else if((r146|0)!=1){break}if((r147|0)<=-1){___assert_func(71104,874,73004,71124)}r57=(r147|0)/(r145|0)&-1;r148=(r57|0)/(r145|0)&-1;r149=(r57|0)%(r145|0);r57=Math.imul(r148,r145)+r149|0;if(HEAP8[HEAP32[r20]+r57|0]<<24>>24==0){break L1974}}}while(0);r57=r68+1|0;if((r57|0)>(r1|0)){break L1976}else{r68=r57}}}}while(0);r68=r144+1|0;if((r68|0)<(r1|0)){r144=r68}else{break L1949}}_solver_place(r12,r149,r148,(r147|0)%(r145|0)+1|0);r48=(r48|0)>1?r48:1;r49=r86;continue L1734}}while(0);r68=HEAP32[r45];L1997:do{if(!((r68|0)==0|r46)){r51=1;r57=r68;L1998:while(1){r71=r51-1|0;do{if(HEAP8[r57+r71|0]<<24>>24==0){L2002:do{if(r19){r55=0;while(1){r59=r71+Math.imul(Math.imul(r55,r39),HEAP32[r13])|0;HEAP32[HEAP32[r17]+(r55<<2)>>2]=r59;r59=r55+1|0;if((r59|0)==(r1|0)){break L2002}else{r55=r59}}}}while(0);r55=HEAP32[r17];r150=HEAP32[r13];if((r150|0)<=0){r40=7;r41=r86;break L1732}r59=HEAP32[r18];r93=0;r52=0;r53=-1;while(1){r50=HEAP32[r55+(r52<<2)>>2];r69=HEAP8[r59+r50|0]<<24>>24==0;r151=(r69&1^1)+r93|0;r152=r69?r53:r50;r50=r52+1|0;if((r50|0)==(r150|0)){break}else{r93=r151;r52=r50;r53=r152}}if((r151|0)==0){r40=7;r41=r86;break L1732}else if((r151|0)!=1){break}if((r152|0)<=-1){___assert_func(71104,874,73004,71124)}r53=(r152|0)/(r150|0)&-1;r153=(r53|0)/(r150|0)&-1;r154=(r53|0)%(r150|0);r53=Math.imul(r153,r150)+r154|0;if(HEAP8[HEAP32[r20]+r53|0]<<24>>24==0){r8=1427;break L1998}}}while(0);r71=r51+1|0;if((r71|0)>(r1|0)){break}r51=r71;r57=HEAP32[r45]}if(r8==1427){r8=0;_solver_place(r12,r154,r153,(r152|0)%(r150|0)+1|0);r48=(r48|0)>1?r48:1;r49=r86;continue L1734}if(r46){break}else{r155=1}L2019:while(1){do{if(HEAP8[HEAP32[r45]+r47+r155|0]<<24>>24==0){L2023:do{if(r19){r57=r155-1|0;r51=0;while(1){r71=r51+1|0;r53=r57+Math.imul(Math.imul(r71,r47),HEAP32[r13])|0;HEAP32[HEAP32[r17]+(r51<<2)>>2]=r53;if((r71|0)==(r1|0)){break L2023}else{r51=r71}}}}while(0);r51=HEAP32[r17];r156=HEAP32[r13];if((r156|0)<=0){r40=7;r41=r86;break L1732}r57=HEAP32[r18];r71=0;r53=0;r52=-1;while(1){r93=HEAP32[r51+(r53<<2)>>2];r59=HEAP8[r57+r93|0]<<24>>24==0;r157=(r59&1^1)+r71|0;r158=r59?r52:r93;r93=r53+1|0;if((r93|0)==(r156|0)){break}else{r71=r157;r53=r93;r52=r158}}if((r157|0)==0){r40=7;r41=r86;break L1732}else if((r157|0)!=1){break}if((r158|0)<=-1){___assert_func(71104,874,73004,71124)}r52=(r158|0)/(r156|0)&-1;r159=(r52|0)/(r156|0)&-1;r160=(r52|0)%(r156|0);r52=Math.imul(r159,r156)+r160|0;if(HEAP8[HEAP32[r20]+r52|0]<<24>>24==0){break L2019}}}while(0);r52=r155+1|0;if((r52|0)>(r1|0)){break L1997}else{r155=r52}}_solver_place(r12,r160,r159,(r158|0)%(r156|0)+1|0);r48=(r48|0)>1?r48:1;r49=r86;continue L1734}}while(0);L2039:do{if(r19){r68=0;L2040:while(1){r52=0;while(1){r53=Math.imul(r52,r1)+r68|0;do{if(HEAP8[HEAP32[r20]+r53|0]<<24>>24==0){L2046:do{if(!r46){r71=1;while(1){r57=HEAP32[r13];r51=r71-1|0;r93=r51+Math.imul(Math.imul(r57,r52)+r68|0,r57)|0;HEAP32[HEAP32[r17]+(r51<<2)>>2]=r93;r93=r71+1|0;if((r93|0)==(r39|0)){break L2046}else{r71=r93}}}}while(0);r71=HEAP32[r17];r161=HEAP32[r13];if((r161|0)<=0){r40=7;r41=r86;break L1732}r93=HEAP32[r18];r51=0;r57=0;r59=-1;while(1){r55=HEAP32[r71+(r57<<2)>>2];r50=HEAP8[r93+r55|0]<<24>>24==0;r162=(r50&1^1)+r51|0;r163=r50?r59:r55;r55=r57+1|0;if((r55|0)==(r161|0)){break}else{r51=r162;r57=r55;r59=r163}}if((r162|0)==0){r40=7;r41=r86;break L1732}else if((r162|0)!=1){break}if((r163|0)<=-1){___assert_func(71104,874,73004,71124)}r59=(r163|0)/(r161|0)&-1;r164=(r59|0)/(r161|0)&-1;r165=(r59|0)%(r161|0);r59=Math.imul(r164,r161)+r165|0;if(HEAP8[HEAP32[r20]+r59|0]<<24>>24==0){break L2040}}}while(0);r53=r52+1|0;if((r53|0)<(r1|0)){r52=r53}else{break}}r52=r68+1|0;if((r52|0)<(r1|0)){r68=r52}else{break L2039}}_solver_place(r12,r165,r164,(r163|0)%(r161|0)+1|0);r48=(r48|0)>1?r48:1;r49=r86;continue L1734}}while(0);if((HEAP32[r43]|0)<2){break}L2063:do{if(r19){r68=0;L2064:while(1){r52=Math.imul(r68,r1)-1|0;r53=0;while(1){L2068:do{if(!r46){r59=Math.imul(r53,r1)-1|0;r57=1;while(1){L2072:do{if(HEAP8[HEAP32[r26]+r52+r57|0]<<24>>24==0){if(HEAP8[HEAP32[r34]+r59+r57|0]<<24>>24!=0){break}r51=r57-1|0;r93=0;while(1){r71=HEAP32[r13];r55=r51+Math.imul(Math.imul(r71,r68)+r93|0,r71)|0;HEAP32[HEAP32[r17]+(r93<<2)>>2]=r55;r55=r51+Math.imul(HEAP32[r13],HEAP32[HEAP32[HEAP32[HEAP32[r14]+20>>2]+(r53<<2)>>2]+(r93<<2)>>2])|0;HEAP32[HEAP32[r21]+(r93<<2)>>2]=r55;r55=r93+1|0;if((r55|0)==(r1|0)){break}else{r93=r55}}r93=HEAP32[r17],r51=r93>>2;r55=HEAP32[r21],r71=r55>>2;r50=HEAP32[r13];if((r50|0)<=0){break}r69=HEAP32[r18];r54=0;r60=0;while(1){r94=HEAP32[(r54<<2>>2)+r51];r110=r60;while(1){if((r110|0)>=(r50|0)){r166=0;break}if((HEAP32[(r110<<2>>2)+r71]|0)<(r94|0)){r110=r110+1|0}else{r166=1;break}}if(HEAP8[r69+r94|0]<<24>>24!=0){if(!r166){r167=r50;r168=r55,r169=r168>>2;r170=r93,r171=r170>>2;break}if((HEAP32[(r110<<2>>2)+r71]|0)!=(r94|0)){r167=r50;r168=r55,r169=r168>>2;r170=r93,r171=r170>>2;break}}r115=r54+1|0;if((r115|0)<(r50|0)){r54=r115;r60=r110}else{r172=0;r173=0;r174=0;r8=1477;break}}if(r8==1477){while(1){r8=0;r60=HEAP32[(r172<<2>>2)+r71];r54=r173;while(1){if((r54|0)>=(r50|0)){r175=0;break}if((HEAP32[(r54<<2>>2)+r51]|0)<(r60|0)){r54=r54+1|0}else{r175=1;break}}r110=HEAP32[r18]+r60|0;do{if(HEAP8[r110]<<24>>24==0){r176=r174}else{if(r175){if((HEAP32[(r54<<2>>2)+r51]|0)==(r60|0)){r176=r174;break}}HEAP8[r110]=0;r176=1}}while(0);r110=r172+1|0;if((r110|0)==(r50|0)){break}else{r172=r110;r173=r54;r174=r176;r8=1477}}if((r176|0)!=0){r8=1505;break L2064}r167=HEAP32[r13];r168=HEAP32[r21],r169=r168>>2;r170=HEAP32[r17],r171=r170>>2}if((r167|0)<=0){break}r50=HEAP32[r18];r51=0;r71=0;while(1){r110=HEAP32[(r51<<2>>2)+r169];r60=r71;while(1){if((r60|0)>=(r167|0)){r177=0;break}if((HEAP32[(r60<<2>>2)+r171]|0)<(r110|0)){r60=r60+1|0}else{r177=1;break}}if(HEAP8[r50+r110|0]<<24>>24!=0){if(!r177){break L2072}if((HEAP32[(r60<<2>>2)+r171]|0)!=(r110|0)){break L2072}}r54=r51+1|0;if((r54|0)<(r167|0)){r51=r54;r71=r60}else{r178=0;r179=0;r180=0;break}}while(1){r71=HEAP32[(r178<<2>>2)+r171];r51=r179;while(1){if((r51|0)>=(r167|0)){r181=0;break}if((HEAP32[(r51<<2>>2)+r169]|0)<(r71|0)){r51=r51+1|0}else{r181=1;break}}r60=HEAP32[r18]+r71|0;do{if(HEAP8[r60]<<24>>24==0){r182=r180}else{if(r181){if((HEAP32[(r51<<2>>2)+r169]|0)==(r71|0)){r182=r180;break}}HEAP8[r60]=0;r182=1}}while(0);r60=r178+1|0;if((r60|0)==(r167|0)){break}else{r178=r60;r179=r51;r180=r182}}if((r182|0)!=0){r8=1505;break L2064}}}while(0);r60=r57+1|0;if((r60|0)>(r1|0)){break L2068}else{r57=r60}}}}while(0);r57=r53+1|0;if((r57|0)<(r1|0)){r53=r57}else{break}}r53=r68+1|0;if((r53|0)<(r1|0)){r68=r53}else{break}}if(r8==1505){r8=0;r48=(r48|0)>2?r48:2;r49=r86;continue L1734}if(r19){r183=0}else{break}L2135:while(1){r68=Math.imul(r183,r1)-1|0;r53=0;while(1){L2139:do{if(!r46){r52=Math.imul(r53,r1)-1|0;r57=1;while(1){L2143:do{if(HEAP8[HEAP32[r15]+r68+r57|0]<<24>>24==0){if(HEAP8[HEAP32[r34]+r52+r57|0]<<24>>24!=0){break}r59=r57-1|0;r60=0;while(1){r71=HEAP32[r13];r110=r59+Math.imul(Math.imul(r71,r60)+r183|0,r71)|0;HEAP32[HEAP32[r17]+(r60<<2)>>2]=r110;r110=r59+Math.imul(HEAP32[r13],HEAP32[HEAP32[HEAP32[HEAP32[r14]+20>>2]+(r53<<2)>>2]+(r60<<2)>>2])|0;HEAP32[HEAP32[r21]+(r60<<2)>>2]=r110;r110=r60+1|0;if((r110|0)==(r1|0)){break}else{r60=r110}}r60=HEAP32[r17],r59=r60>>2;r110=HEAP32[r21],r71=r110>>2;r50=HEAP32[r13];if((r50|0)<=0){break}r54=HEAP32[r18];r94=0;r93=0;while(1){r55=HEAP32[(r94<<2>>2)+r59];r69=r93;while(1){if((r69|0)>=(r50|0)){r184=0;break}if((HEAP32[(r69<<2>>2)+r71]|0)<(r55|0)){r69=r69+1|0}else{r184=1;break}}if(HEAP8[r54+r55|0]<<24>>24!=0){if(!r184){r185=r50;r186=r110,r187=r186>>2;r188=r60,r189=r188>>2;break}if((HEAP32[(r69<<2>>2)+r71]|0)!=(r55|0)){r185=r50;r186=r110,r187=r186>>2;r188=r60,r189=r188>>2;break}}r51=r94+1|0;if((r51|0)<(r50|0)){r94=r51;r93=r69}else{r190=0;r191=0;r192=0;r8=1526;break}}if(r8==1526){while(1){r8=0;r93=HEAP32[(r190<<2>>2)+r71];r94=r191;while(1){if((r94|0)>=(r50|0)){r193=0;break}if((HEAP32[(r94<<2>>2)+r59]|0)<(r93|0)){r94=r94+1|0}else{r193=1;break}}r69=HEAP32[r18]+r93|0;do{if(HEAP8[r69]<<24>>24==0){r194=r192}else{if(r193){if((HEAP32[(r94<<2>>2)+r59]|0)==(r93|0)){r194=r192;break}}HEAP8[r69]=0;r194=1}}while(0);r69=r190+1|0;if((r69|0)==(r50|0)){break}else{r190=r69;r191=r94;r192=r194;r8=1526}}if((r194|0)!=0){break L2135}r185=HEAP32[r13];r186=HEAP32[r21],r187=r186>>2;r188=HEAP32[r17],r189=r188>>2}if((r185|0)<=0){break}r50=HEAP32[r18];r59=0;r71=0;while(1){r69=HEAP32[(r59<<2>>2)+r187];r93=r71;while(1){if((r93|0)>=(r185|0)){r195=0;break}if((HEAP32[(r93<<2>>2)+r189]|0)<(r69|0)){r93=r93+1|0}else{r195=1;break}}if(HEAP8[r50+r69|0]<<24>>24!=0){if(!r195){break L2143}if((HEAP32[(r93<<2>>2)+r189]|0)!=(r69|0)){break L2143}}r94=r59+1|0;if((r94|0)<(r185|0)){r59=r94;r71=r93}else{r196=0;r197=0;r198=0;break}}while(1){r71=HEAP32[(r196<<2>>2)+r189];r59=r197;while(1){if((r59|0)>=(r185|0)){r199=0;break}if((HEAP32[(r59<<2>>2)+r187]|0)<(r71|0)){r59=r59+1|0}else{r199=1;break}}r93=HEAP32[r18]+r71|0;do{if(HEAP8[r93]<<24>>24==0){r200=r198}else{if(r199){if((HEAP32[(r59<<2>>2)+r187]|0)==(r71|0)){r200=r198;break}}HEAP8[r93]=0;r200=1}}while(0);r93=r196+1|0;if((r93|0)==(r185|0)){break}else{r196=r93;r197=r59;r198=r200}}if((r200|0)!=0){break L2135}}}while(0);r93=r57+1|0;if((r93|0)>(r1|0)){break L2139}else{r57=r93}}}}while(0);r57=r53+1|0;if((r57|0)<(r1|0)){r53=r57}else{break}}r53=r183+1|0;if((r53|0)<(r1|0)){r183=r53}else{break L2063}}r48=(r48|0)>2?r48:2;r49=r86;continue L1734}}while(0);L2205:do{if(!((HEAP32[r45]|0)==0|r19^1)){r53=0;L2206:while(1){L2208:do{if(!r46){r68=Math.imul(r53,r1)-1|0;r57=1;while(1){r52=r57-1|0;L2212:do{if(HEAP8[HEAP32[r45]+r52|0]<<24>>24==0){if(HEAP8[HEAP32[r34]+r68+r57|0]<<24>>24==0){r201=0}else{break}while(1){r93=r52+Math.imul(Math.imul(r201,r39),HEAP32[r13])|0;HEAP32[HEAP32[r17]+(r201<<2)>>2]=r93;r93=r52+Math.imul(HEAP32[r13],HEAP32[HEAP32[HEAP32[HEAP32[r14]+20>>2]+(r53<<2)>>2]+(r201<<2)>>2])|0;HEAP32[HEAP32[r21]+(r201<<2)>>2]=r93;r93=r201+1|0;if((r93|0)==(r1|0)){break}else{r201=r93}}r93=HEAP32[r17],r71=r93>>2;r69=HEAP32[r21],r50=r69>>2;r94=HEAP32[r13];if((r94|0)<=0){break}r55=HEAP32[r18];r60=0;r110=0;while(1){r54=HEAP32[(r60<<2>>2)+r71];r51=r110;while(1){if((r51|0)>=(r94|0)){r202=0;break}if((HEAP32[(r51<<2>>2)+r50]|0)<(r54|0)){r51=r51+1|0}else{r202=1;break}}if(HEAP8[r55+r54|0]<<24>>24!=0){if(!r202){r203=r94;r204=r69,r205=r204>>2;r206=r93,r207=r206>>2;break}if((HEAP32[(r51<<2>>2)+r50]|0)!=(r54|0)){r203=r94;r204=r69,r205=r204>>2;r206=r93,r207=r206>>2;break}}r115=r60+1|0;if((r115|0)<(r94|0)){r60=r115;r110=r51}else{r208=0;r209=0;r210=0;r8=1573;break}}if(r8==1573){while(1){r8=0;r110=HEAP32[(r208<<2>>2)+r50];r60=r209;while(1){if((r60|0)>=(r94|0)){r211=0;break}if((HEAP32[(r60<<2>>2)+r71]|0)<(r110|0)){r60=r60+1|0}else{r211=1;break}}r51=HEAP32[r18]+r110|0;do{if(HEAP8[r51]<<24>>24==0){r212=r210}else{if(r211){if((HEAP32[(r60<<2>>2)+r71]|0)==(r110|0)){r212=r210;break}}HEAP8[r51]=0;r212=1}}while(0);r51=r208+1|0;if((r51|0)==(r94|0)){break}else{r208=r51;r209=r60;r210=r212;r8=1573}}if((r212|0)!=0){r8=1601;break L2206}r203=HEAP32[r13];r204=HEAP32[r21],r205=r204>>2;r206=HEAP32[r17],r207=r206>>2}if((r203|0)<=0){break}r94=HEAP32[r18];r71=0;r50=0;while(1){r51=HEAP32[(r71<<2>>2)+r205];r110=r50;while(1){if((r110|0)>=(r203|0)){r213=0;break}if((HEAP32[(r110<<2>>2)+r207]|0)<(r51|0)){r110=r110+1|0}else{r213=1;break}}if(HEAP8[r94+r51|0]<<24>>24!=0){if(!r213){break L2212}if((HEAP32[(r110<<2>>2)+r207]|0)!=(r51|0)){break L2212}}r60=r71+1|0;if((r60|0)<(r203|0)){r71=r60;r50=r110}else{r214=0;r215=0;r216=0;break}}while(1){r50=HEAP32[(r214<<2>>2)+r207];r71=r215;while(1){if((r71|0)>=(r203|0)){r217=0;break}if((HEAP32[(r71<<2>>2)+r205]|0)<(r50|0)){r71=r71+1|0}else{r217=1;break}}r110=HEAP32[r18]+r50|0;do{if(HEAP8[r110]<<24>>24==0){r218=r216}else{if(r217){if((HEAP32[(r71<<2>>2)+r205]|0)==(r50|0)){r218=r216;break}}HEAP8[r110]=0;r218=1}}while(0);r110=r214+1|0;if((r110|0)==(r203|0)){break}else{r214=r110;r215=r71;r216=r218}}if((r218|0)!=0){r8=1601;break L2206}}}while(0);r52=r57+1|0;if((r52|0)>(r1|0)){break L2208}else{r57=r52}}}}while(0);r57=r53+1|0;if((r57|0)<(r1|0)){r53=r57}else{break}}if(r8==1601){r8=0;r48=(r48|0)>2?r48:2;r49=r86;continue L1734}if(r19){r219=0}else{break}L2273:while(1){L2275:do{if(!r46){r53=Math.imul(r219,r1)-1|0;r57=1;while(1){L2279:do{if(HEAP8[HEAP32[r45]+r47+r57|0]<<24>>24==0){if(HEAP8[HEAP32[r34]+r53+r57|0]<<24>>24!=0){break}r68=r57-1|0;r52=0;while(1){r110=r52+1|0;r50=r68+Math.imul(Math.imul(r110,r47),HEAP32[r13])|0;HEAP32[HEAP32[r17]+(r52<<2)>>2]=r50;r50=r68+Math.imul(HEAP32[r13],HEAP32[HEAP32[HEAP32[HEAP32[r14]+20>>2]+(r219<<2)>>2]+(r52<<2)>>2])|0;HEAP32[HEAP32[r21]+(r52<<2)>>2]=r50;if((r110|0)==(r1|0)){break}else{r52=r110}}r52=HEAP32[r17],r68=r52>>2;r110=HEAP32[r21],r50=r110>>2;r51=HEAP32[r13];if((r51|0)<=0){break}r94=HEAP32[r18];r60=0;r54=0;while(1){r93=HEAP32[(r60<<2>>2)+r68];r69=r54;while(1){if((r69|0)>=(r51|0)){r220=0;break}if((HEAP32[(r69<<2>>2)+r50]|0)<(r93|0)){r69=r69+1|0}else{r220=1;break}}if(HEAP8[r94+r93|0]<<24>>24!=0){if(!r220){r221=r51;r222=r110,r223=r222>>2;r224=r52,r225=r224>>2;break}if((HEAP32[(r69<<2>>2)+r50]|0)!=(r93|0)){r221=r51;r222=r110,r223=r222>>2;r224=r52,r225=r224>>2;break}}r71=r60+1|0;if((r71|0)<(r51|0)){r60=r71;r54=r69}else{r226=0;r227=0;r228=0;r8=1620;break}}if(r8==1620){while(1){r8=0;r54=HEAP32[(r226<<2>>2)+r50];r60=r227;while(1){if((r60|0)>=(r51|0)){r229=0;break}if((HEAP32[(r60<<2>>2)+r68]|0)<(r54|0)){r60=r60+1|0}else{r229=1;break}}r69=HEAP32[r18]+r54|0;do{if(HEAP8[r69]<<24>>24==0){r230=r228}else{if(r229){if((HEAP32[(r60<<2>>2)+r68]|0)==(r54|0)){r230=r228;break}}HEAP8[r69]=0;r230=1}}while(0);r69=r226+1|0;if((r69|0)==(r51|0)){break}else{r226=r69;r227=r60;r228=r230;r8=1620}}if((r230|0)!=0){break L2273}r221=HEAP32[r13];r222=HEAP32[r21],r223=r222>>2;r224=HEAP32[r17],r225=r224>>2}if((r221|0)<=0){break}r51=HEAP32[r18];r68=0;r50=0;while(1){r69=HEAP32[(r68<<2>>2)+r223];r54=r50;while(1){if((r54|0)>=(r221|0)){r231=0;break}if((HEAP32[(r54<<2>>2)+r225]|0)<(r69|0)){r54=r54+1|0}else{r231=1;break}}if(HEAP8[r51+r69|0]<<24>>24!=0){if(!r231){break L2279}if((HEAP32[(r54<<2>>2)+r225]|0)!=(r69|0)){break L2279}}r60=r68+1|0;if((r60|0)<(r221|0)){r68=r60;r50=r54}else{r232=0;r233=0;r234=0;break}}while(1){r50=HEAP32[(r232<<2>>2)+r225];r68=r233;while(1){if((r68|0)>=(r221|0)){r235=0;break}if((HEAP32[(r68<<2>>2)+r223]|0)<(r50|0)){r68=r68+1|0}else{r235=1;break}}r54=HEAP32[r18]+r50|0;do{if(HEAP8[r54]<<24>>24==0){r236=r234}else{if(r235){if((HEAP32[(r68<<2>>2)+r223]|0)==(r50|0)){r236=r234;break}}HEAP8[r54]=0;r236=1}}while(0);r54=r232+1|0;if((r54|0)==(r221|0)){break}else{r232=r54;r233=r68;r234=r236}}if((r236|0)!=0){break L2273}}}while(0);r54=r57+1|0;if((r54|0)>(r1|0)){break L2275}else{r57=r54}}}}while(0);r57=r219+1|0;if((r57|0)<(r1|0)){r219=r57}else{break L2205}}r48=(r48|0)>2?r48:2;r49=r86;continue L1734}}while(0);if((HEAP32[r43]|0)<3){break}else{r237=0}while(1){if((r237|0)>=(r1|0)){r238=0;break}L2343:do{if(r19){r57=0;while(1){L2346:do{if(!r46){r53=Math.imul(r57,r1)-1|0;r54=1;while(1){r50=r54-1+Math.imul(HEAP32[r13],HEAP32[HEAP32[HEAP32[HEAP32[r14]+20>>2]+(r237<<2)>>2]+(r57<<2)>>2])|0;HEAP32[HEAP32[r17]+(r53+r54<<2)>>2]=r50;r50=r54+1|0;if((r50|0)==(r39|0)){break L2346}else{r54=r50}}}}while(0);r54=r57+1|0;if((r54|0)==(r1|0)){break L2343}else{r57=r54}}}}while(0);r57=_solver_set(r12,r33,HEAP32[r17]);if((r57|0)<0){r40=7;r41=r86;break L1732}if((r57|0)>0){r8=1660;break}else{r237=r237+1|0}}if(r8==1660){r8=0;r48=(r48|0)>3?r48:3;r49=r86;continue}while(1){if((r238|0)>=(r1|0)){r239=0;break}L2358:do{if(r19){r57=0;while(1){L2361:do{if(!r46){r54=Math.imul(r57,r1)-1|0;r53=1;while(1){r50=HEAP32[r13];r69=r53-1+Math.imul(Math.imul(r50,r238)+r57|0,r50)|0;HEAP32[HEAP32[r17]+(r54+r53<<2)>>2]=r69;r69=r53+1|0;if((r69|0)==(r39|0)){break L2361}else{r53=r69}}}}while(0);r53=r57+1|0;if((r53|0)==(r1|0)){break L2358}else{r57=r53}}}}while(0);r57=_solver_set(r12,r33,HEAP32[r17]);if((r57|0)<0){r40=7;r41=r86;break L1732}if((r57|0)>0){r8=1669;break}else{r238=r238+1|0}}if(r8==1669){r8=0;r48=(r48|0)>3?r48:3;r49=r86;continue}while(1){if((r239|0)>=(r1|0)){break}L2373:do{if(r19){r57=0;while(1){L2376:do{if(!r46){r53=Math.imul(r57,r1)-1|0;r54=1;while(1){r69=HEAP32[r13];r50=r54-1+Math.imul(Math.imul(r69,r57)+r239|0,r69)|0;HEAP32[HEAP32[r17]+(r53+r54<<2)>>2]=r50;r50=r54+1|0;if((r50|0)==(r39|0)){break L2376}else{r54=r50}}}}while(0);r54=r57+1|0;if((r54|0)==(r1|0)){break L2373}else{r57=r54}}}}while(0);r57=_solver_set(r12,r33,HEAP32[r17]);if((r57|0)<0){r40=7;r41=r86;break L1732}if((r57|0)>0){r8=1678;break}else{r239=r239+1|0}}if(r8==1678){r8=0;r48=(r48|0)>3?r48:3;r49=r86;continue}do{if((HEAP32[r45]|0)!=0){L2388:do{if(r19){r57=0;while(1){L2391:do{if(!r46){r54=Math.imul(r57,r39);r53=Math.imul(r57,r1)-1|0;r50=1;while(1){r69=r50-1+Math.imul(r54,HEAP32[r13])|0;HEAP32[HEAP32[r17]+(r53+r50<<2)>>2]=r69;r69=r50+1|0;if((r69|0)==(r39|0)){break L2391}else{r50=r69}}}}while(0);r50=r57+1|0;if((r50|0)==(r1|0)){break L2388}else{r57=r50}}}}while(0);r57=_solver_set(r12,r33,HEAP32[r17]);if((r57|0)<0){r40=7;r41=r86;break L1732}if((r57|0)>0){r48=(r48|0)>3?r48:3;r49=r86;continue L1734}L2401:do{if(r19){r57=0;while(1){r50=r57+1|0;L2404:do{if(!r46){r53=Math.imul(r50,r47);r54=Math.imul(r57,r1)-1|0;r69=1;while(1){r51=r69-1+Math.imul(r53,HEAP32[r13])|0;HEAP32[HEAP32[r17]+(r54+r69<<2)>>2]=r51;r51=r69+1|0;if((r51|0)==(r39|0)){break L2404}else{r69=r51}}}}while(0);if((r50|0)==(r1|0)){break L2401}else{r57=r50}}}}while(0);r57=_solver_set(r12,r33,HEAP32[r17]);if((r57|0)<0){r40=7;r41=r86;break L1732}if((r57|0)<=0){break}r48=(r48|0)>3?r48:3;r49=r86;continue L1734}}while(0);if((HEAP32[r43]|0)<4){break}else{r240=1}while(1){if((r240|0)>(r1|0)){break}L2416:do{if(r19){r57=r240-1|0;r69=0;while(1){r54=Math.imul(r69,r1);r53=0;while(1){r51=HEAP32[r13];r60=r57+Math.imul(Math.imul(r51,r69)+r53|0,r51)|0;HEAP32[HEAP32[r17]+(r53+r54<<2)>>2]=r60;r60=r53+1|0;if((r60|0)==(r1|0)){break}else{r53=r60}}r53=r69+1|0;if((r53|0)==(r1|0)){break L2416}else{r69=r53}}}}while(0);r69=_solver_set(r12,r33,HEAP32[r17]);if((r69|0)<0){r40=7;r41=r86;break L1732}if((r69|0)>0){r8=1705;break}else{r240=r240+1|0}}if(r8==1705){r8=0;r48=(r48|0)>4?r48:4;r49=r86;continue}r69=HEAP32[r29];r57=HEAP32[r31],r53=r57>>2;r54=HEAP32[r35]>>2;r50=HEAP32[r13];if((r50|0)<=0){r8=1755;break}r60=r50+1|0;r51=r60&255;r93=Math.imul(r50,r50);r52=r50-1|0;r110=r93-1|0;r94=r50<<1;r71=(r94<<2)+r57|0;r57=(r50|0)==1;r55=r94+r50|0;r115=r55+r50|0;r72=0;L2429:while(1){r111=Math.imul(r72,r50);r70=0;while(1){r58=HEAP32[r13];r95=Math.imul(Math.imul(r58,r72)+r70|0,r58);r99=HEAP32[r18];r122=r95-1|0;r95=0;r121=1;r120=0;while(1){if(HEAP8[r99+r122+r121|0]<<24>>24==0){r241=r120;r242=r95}else{r241=r120+1|0;r242=r95+r121|0}r243=r121+1|0;if((r243|0)==(r60|0)){break}else{r95=r242;r121=r243;r120=r241}}L2439:do{if((r241|0)==2){r120=r70+r111|0;r121=r69+r120|0;r95=(r120|0)>0;r122=(r120|0)<(r110|0);r243=1;r244=r58;r245=r99;while(1){r246=r243-1|0;r247=r245+Math.imul(Math.imul(r244,r72)+r70|0,r244)+r246|0;L2443:do{if(HEAP8[r247]<<24>>24!=0){_memset(r69,r51,r93);HEAP32[r54]=r120;HEAP8[r121]=r242-r243&255;r248=0;r249=1;while(1){r250=HEAP32[(r248<<2>>2)+r54];r251=(r250|0)/(r50|0)&-1;r252=(r250|0)%(r50|0);r250=Math.imul(r251,r50);r253=r250+r252|0;r254=HEAP8[r69+r253|0];r255=0;while(1){r256=Math.imul(r255,r50)+r252|0;r257=r255+1|0;HEAP32[(r255<<2>>2)+r53]=r256;if((r257|0)==(r50|0)){break}else{r255=r257}}r255=r248+1|0;r68=r50;r257=0;while(1){HEAP32[(r68<<2>>2)+r53]=r257+r250|0;r256=r257+1|0;if((r256|0)==(r50|0)){break}else{r68=r68+1|0;r257=r256}}r257=r254&255;r68=HEAP32[r14];r250=HEAP32[HEAP32[r68+16>>2]+(r253<<2)>>2];HEAP32[r71>>2]=HEAP32[HEAP32[HEAP32[r68+20>>2]+(r250<<2)>>2]>>2];L2453:do{if(!r57){r68=r94;r256=1;while(1){r258=r68+1|0;HEAP32[(r258<<2>>2)+r53]=HEAP32[HEAP32[HEAP32[HEAP32[r14]+20>>2]+(r250<<2)>>2]+(r256<<2)>>2];r259=r256+1|0;if((r259|0)==(r50|0)){break L2453}else{r68=r258;r256=r259}}}}while(0);do{if((HEAP32[r45]|0)==0){r260=r55}else{L2459:do{if(((r253|0)%(r60|0)|0)==0){r250=r55;r254=0;while(1){r256=Math.imul(r254,r60);HEAP32[(r250<<2>>2)+r53]=r256;r256=r254+1|0;if((r256|0)==(r50|0)){r261=r115;break L2459}else{r250=r250+1|0;r254=r256}}}else{r261=r55}}while(0);if(((r253|0)%(r52|0)|0)==0&(r253|0)>0&(r253|0)<(r110|0)){r262=r261;r263=0}else{r260=r261;break}while(1){r254=r263+1|0;r250=Math.imul(r254,r52);HEAP32[(r262<<2>>2)+r53]=r250;if((r254|0)==(r50|0)){break}else{r262=r262+1|0;r263=r254}}r260=r261+r50|0}}while(0);L2467:do{if((r260|0)>0){r253=r257-1|0;r254=(r257|0)==(r243|0);r250=r249;r256=0;while(1){r68=HEAP32[(r256<<2>>2)+r53];r264=(r68|0)%(r50|0);r265=(r68|0)/(r50|0)&-1;r68=Math.imul(r265,r50)+r264|0;r59=r69+r68|0;do{if((HEAPU8[r59]|0)>(r50|0)){r259=HEAP32[r13];r258=Math.imul(Math.imul(r259,r265)+r264|0,r259);r259=HEAP32[r18];if(HEAP8[r259+r253+r258|0]<<24>>24==0){r266=r250;break}if((r264|0)==(r252|0)&(r265|0)==(r251|0)){r266=r250;break}r267=r258-1|0;r258=0;r268=0;r269=1;while(1){if(HEAP8[r259+r267+r269|0]<<24>>24==0){r270=r268;r271=r258}else{r270=r268+r269|0;r271=r258+1|0}r272=r269+1|0;if((r272|0)==(r60|0)){break}else{r258=r271;r268=r270;r269=r272}}if((r271|0)==2){HEAP32[(r250<<2>>2)+r54]=r68;HEAP8[r59]=r270-r257&255;r273=r250+1|0}else{r273=r250}if(!r254){r266=r273;break}if((r264|0)==(r70|0)|(r265|0)==(r72|0)){break L2429}r269=HEAP32[HEAP32[r14]+16>>2];if((HEAP32[r269+(r68<<2)>>2]|0)==(HEAP32[r269+(r120<<2)>>2]|0)){break L2429}if((HEAP32[r45]|0)==0){r266=r273;break}if(((r68|0)%(r60|0)|0)==0){if(((r120|0)%(r60|0)|0)==0){break L2429}}if(!(((r68|0)%(r52|0)|0)==0&(r68|0)>0&(r68|0)<(r110|0))){r266=r273;break}if(((r120|0)%(r52|0)|0)==0&r95&r122){break L2429}else{r266=r273}}else{r266=r250}}while(0);r68=r256+1|0;if((r68|0)<(r260|0)){r250=r266;r256=r68}else{r274=r266;break L2467}}}else{r274=r249}}while(0);if((r255|0)<(r274|0)){r248=r255;r249=r274}else{break L2443}}}}while(0);r247=r243+1|0;if((r247|0)>(r50|0)){break L2439}r243=r247;r244=HEAP32[r13];r245=HEAP32[r18]}}}while(0);r99=r70+1|0;if((r99|0)<(r50|0)){r70=r99}else{break}}r70=r72+1|0;if((r70|0)<(r50|0)){r72=r70}else{r8=1755;break L1734}}r72=HEAP32[r13];r50=Math.imul(Math.imul(r72,r265)+r264|0,r72)+r246|0;HEAP8[HEAP32[r18]+r50|0]=0;r48=(r48|0)>4?r48:4;r49=r86}do{if(r8==1755){if((HEAP32[r43]|0)<=4){break}if(r19){r275=-1;r276=r39;r277=0}else{r40=r48;r41=r86;break L1732}while(1){r45=Math.imul(r277,r1);r47=r275;r37=r276;r44=0;while(1){r16=r44+r45|0;if(HEAP8[r5+r16|0]<<24>>24==0){do{if(r46){r278=0;r8=1763}else{r42=HEAP32[r13];r36=Math.imul(Math.imul(r42,r277)+r44|0,r42);r42=HEAP32[r18];r38=1;r50=0;while(1){r279=(HEAP8[r42+(r38-1)+r36|0]<<24>>24!=0&1)+r50|0;r72=r38+1|0;if((r72|0)==(r39|0)){break}else{r38=r72;r50=r279}}if((r279|0)>1){r280=r279;break}else{r278=r279;r8=1763;break}}}while(0);if(r8==1763){r8=0;___assert_func(71104,2494,73016,71516);r280=r278}r50=(r280|0)<(r37|0);r281=r50?r280:r37;r282=r50?r16:r47}else{r281=r37;r282=r47}r50=r44+1|0;if((r50|0)==(r1|0)){break}else{r47=r282;r37=r281;r44=r50}}r44=r277+1|0;if((r44|0)==(r1|0)){break}else{r275=r282;r276=r281;r277=r44}}if((r282|0)==-1){r40=r48;r41=r86;break L1732}r44=(r282|0)/(r1|0)&-1;r37=(r282|0)%(r1|0);r47=_malloc(r1);if((r47|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r45=_malloc(r25);if((r45|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r50=_malloc(r25);if((r50|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_memcpy(r45,r5,r25);L2529:do{if(r46){r283=0}else{r38=1;r36=0;while(1){r42=HEAP32[r13];r72=r38-1+Math.imul(Math.imul(r42,r44)+r37|0,r42)|0;if(HEAP8[HEAP32[r18]+r72|0]<<24>>24==0){r284=r36}else{HEAP8[r47+r36|0]=r38&255;r284=r36+1|0}r72=r38+1|0;if((r72|0)==(r39|0)){r283=r284;break L2529}else{r38=r72;r36=r284}}}}while(0);r36=r50+Math.imul(r44,r1)+r37|0;r38=r7+8|0;r72=0;r42=7;L2536:while(1){if((r72|0)>=(r283|0)){r285=r42;break}_memcpy(r50,r45,r25);HEAP8[r36]=HEAP8[r47+r72|0];_solver(r1,r2,r3,r4,r50,r6,r7);r52=(r42|0)==7;do{if(r52){if((HEAP32[r38>>2]|0)==7){r72=r72+1|0;r42=7;continue L2536}else{_memcpy(r5,r50,r25);break}}}while(0);r110=HEAP32[r38>>2];if((r110|0)==7){r286=r42}else if((r110|0)==6){r285=6;break}else{r286=r52?5:6}if((r286|0)==6){r285=6;break}else{r72=r72+1|0;r42=r286}}_free(r50);_free(r45);_free(r47);r40=r285;r41=r86;break L1732}else if(r8==1302){HEAP32[r7+8>>2]=7;r40=r48;r41=r49;break L1732}else if(r8==1323){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r8==1328){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r8==1332){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}while(0);if(r19){r287=r48;r288=0}else{r40=r48;r41=r86;break}while(1){r49=Math.imul(r288,r1);r39=r287;r46=0;while(1){r289=HEAP8[r5+r46+r49|0]<<24>>24==0?7:r39;r43=r46+1|0;if((r43|0)==(r1|0)){break}else{r39=r289;r46=r43}}r46=r288+1|0;if((r46|0)==(r1|0)){r40=r289;r41=r86;break L1732}else{r287=r289;r288=r46}}}}while(0);HEAP32[r7+8>>2]=r40;HEAP32[r7+12>>2]=r41;r41=HEAP32[r28];if((r41|0)!=0){_free(r41)}r41=HEAP32[r22];if((r41|0)!=0){_free(r41)}r41=HEAP32[r18];if((r41|0)!=0){_free(r41)}r41=HEAP32[r26];if((r41|0)!=0){_free(r41)}r41=HEAP32[r15];if((r41|0)!=0){_free(r41)}r41=HEAP32[r34];if((r41|0)!=0){_free(r41)}r41=HEAP32[r11+2],r34=r41>>2;do{if((r41|0)!=0){r15=r41|0;r26=HEAP32[r15>>2]-1|0;HEAP32[r15>>2]=r26;if((r26|0)==0){r26=HEAP32[r34+4];if((r26|0)!=0){_free(r26)}r26=HEAP32[r34+5];if((r26|0)!=0){_free(r26)}r26=HEAP32[r34+7];if((r26|0)!=0){_free(r26)}r26=HEAP32[r34+6];if((r26|0)!=0){_free(r26)}_free(r41)}r26=HEAP32[r11+3],r15=r26>>2;r18=r26|0;r22=HEAP32[r18>>2]-1|0;HEAP32[r18>>2]=r22;do{if((r22|0)==0){r18=HEAP32[r15+4];if((r18|0)!=0){_free(r18)}r18=HEAP32[r15+5];if((r18|0)!=0){_free(r18)}r18=HEAP32[r15+7];if((r18|0)!=0){_free(r18)}r18=HEAP32[r15+6];if((r18|0)!=0){_free(r18)}if((r26|0)==0){break}_free(r26)}}while(0);r26=HEAP32[r11+7];if((r26|0)==0){break}_free(r26)}}while(0);r41=HEAP32[r11+6];if((r41|0)!=0){_free(r41)}_free(r10);r10=HEAP32[r35];if((r10|0)!=0){_free(r10)}r10=HEAP32[r31];if((r10|0)!=0){_free(r10)}r10=HEAP32[r30>>2];if((r10|0)!=0){_free(r10)}r10=HEAP32[r32>>2];if((r10|0)!=0){_free(r10)}r10=HEAP32[r27>>2];if((r10|0)!=0){_free(r10)}r10=HEAP32[r29];if((r10|0)!=0){_free(r10)}r10=HEAP32[r17];if((r10|0)!=0){_free(r10)}r10=HEAP32[r21];if((r10|0)==0){_free(r24);STACKTOP=r9;return}_free(r10);_free(r24);STACKTOP=r9;return}function _solver_killer_minmax(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36;r5=0;r6=(r1|0)>>2;r7=HEAP32[r6];r8=HEAP32[HEAP32[r2+24>>2]+(r4<<2)>>2];r9=r3+r4|0;if(!(HEAP8[r9]<<24>>24!=0&(r8|0)>0)){r10=0;return r10}r3=r2+20|0;r2=(r7|0)<1;r11=r1+16|0;r1=r7+1|0;r12=0;r13=0;while(1){r14=HEAP32[HEAP32[HEAP32[r3>>2]+(r4<<2)>>2]+(r13<<2)>>2];L2647:do{if(r2){r15=r12}else{r16=r12;r17=1;while(1){r18=HEAP32[r6];r19=r17-1|0;r20=r19+Math.imul(r18,r14)|0;r21=HEAP32[r11>>2];do{if(HEAP8[r21+r20|0]<<24>>24==0){r22=r16}else{r23=HEAP32[HEAP32[r3>>2]+(r4<<2)>>2];r24=0;r25=0;r26=0;while(1){r27=HEAP32[r23+(r26<<2)>>2];L2654:do{if((r13|0)==(r26|0)){r28=r25;r29=r24}else{r30=1;while(1){if((r30|0)>(r7|0)){r31=r25;break}r32=r21+(r30-1)+Math.imul(r18,r27)|0;if(HEAP8[r32]<<24>>24==0){r30=r30+1|0}else{r5=1856;break}}if(r5==1856){r5=0;r31=r30+r25|0}r32=r7;while(1){if((r32|0)<=0){r28=r31;r29=r24;break L2654}r33=r32-1|0;r34=r21+r33+Math.imul(r18,r27)|0;if(HEAP8[r34]<<24>>24==0){r32=r33}else{break}}r28=r31;r29=r32+r24|0}}while(0);r27=r26+1|0;if((r27|0)==(r8|0)){break}else{r24=r29;r25=r28;r26=r27}}r26=HEAP8[r9];if((r29+r17|0)<(r26&255|0)){r25=r21+r19+Math.imul(r18,r14)|0;HEAP8[r25]=0;r35=1;r36=HEAP8[r9]}else{r35=r16;r36=r26}if((r28+r17|0)<=(r36&255|0)){r22=r35;break}r26=r19+Math.imul(HEAP32[r6],r14)|0;HEAP8[HEAP32[r11>>2]+r26|0]=0;r22=1}}while(0);r19=r17+1|0;if((r19|0)==(r1|0)){r15=r22;break L2647}else{r16=r22;r17=r19}}}}while(0);r14=r13+1|0;if((r14|0)==(r8|0)){r10=r15;break}else{r12=r15;r13=r14}}return r10}function _solver_place(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r5=r1>>2;r6=0;r7=(r1|0)>>2;r8=HEAP32[r7];r9=Math.imul(r8,r3);r10=r9+r2|0;r11=r4-1|0;r12=r11+Math.imul(r10,r8)|0;r13=(r1+16|0)>>2;if(HEAP8[HEAP32[r13]+r12|0]<<24>>24==0){___assert_func(71104,772,72968,71112)}L2678:do{if((r8|0)<1){r6=1886}else{r12=r8+1|0;r14=1;while(1){if((r14|0)!=(r4|0)){r15=HEAP32[r7];r16=r14-1+Math.imul(Math.imul(r15,r3)+r2|0,r15)|0;HEAP8[HEAP32[r13]+r16|0]=0}r16=r14+1|0;if((r16|0)==(r12|0)){break}else{r14=r16}}r14=(r8|0)>0;if(r14){r17=0}else{r6=1886;break}while(1){if((r17|0)!=(r3|0)){r12=HEAP32[r7];r16=r11+Math.imul(Math.imul(r12,r17)+r2|0,r12)|0;HEAP8[HEAP32[r13]+r16|0]=0}r16=r17+1|0;if((r16|0)==(r8|0)){break}else{r17=r16}}if(r14){r18=0}else{r6=1886;break}while(1){if((r18|0)!=(r2|0)){r16=HEAP32[r7];r12=r11+Math.imul(Math.imul(r16,r3)+r18|0,r16)|0;HEAP8[HEAP32[r13]+r12|0]=0}r12=r18+1|0;if((r12|0)==(r8|0)){break}else{r18=r12}}r14=r1+4|0;r12=HEAP32[r14>>2];r16=HEAP32[HEAP32[r12+16>>2]+(r10<<2)>>2];r15=0;r19=r12;while(1){r12=HEAP32[HEAP32[HEAP32[r19+20>>2]+(r16<<2)>>2]+(r15<<2)>>2];if((r12|0)!=(r10|0)){r20=r11+Math.imul(HEAP32[r7],r12)|0;HEAP8[HEAP32[r13]+r20|0]=0}r20=r15+1|0;if((r20|0)==(r8|0)){r21=1;r22=r16;break L2678}r15=r20;r19=HEAP32[r14>>2]}}}while(0);if(r6==1886){r21=0;r22=HEAP32[HEAP32[HEAP32[r5+1]+16>>2]+(r10<<2)>>2]}HEAP8[HEAP32[r5+5]+r10|0]=r4&255;r4=r11+Math.imul(r22,r8)|0;HEAP8[HEAP32[r5+10]+r4|0]=1;r4=r11+Math.imul(r8,r2)|0;HEAP8[HEAP32[r5+9]+r4|0]=1;HEAP8[HEAP32[r5+8]+r11+r9|0]=1;r9=(r1+44|0)>>2;r1=HEAP32[r9];if((r1|0)==0){return}r5=r8+1|0;if(((r10|0)%(r5|0)|0)==0){if(r21){r4=0;while(1){r2=Math.imul(r4,r5);if((r2|0)!=(r10|0)){r22=r11+Math.imul(HEAP32[r7],r2)|0;HEAP8[HEAP32[r13]+r22|0]=0}r22=r4+1|0;if((r22|0)==(r8|0)){break}else{r4=r22}}r23=HEAP32[r9]}else{r23=r1}HEAP8[r23+r11|0]=1}r23=r8-1|0;if(!(((r10|0)%(r23|0)|0)==0&(r10|0)>0)){return}if((r10|0)>=(Math.imul(r8,r8)-1|0)){return}L2727:do{if(r21){r1=0;while(1){r4=r1+1|0;r5=Math.imul(r4,r23);if((r5|0)!=(r10|0)){r22=r11+Math.imul(HEAP32[r7],r5)|0;HEAP8[HEAP32[r13]+r22|0]=0}if((r4|0)==(r8|0)){break L2727}else{r1=r4}}}}while(0);HEAP8[HEAP32[r9]+r11+r8|0]=1;return}function _solver_killer_sums(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35;r6=(r1|0)>>2;r7=HEAP32[r6];r8=HEAP32[HEAP32[r3+24>>2]+(r2<<2)>>2];if((r4|0)==0){if((r8|0)==0){r9=0;return r9}___assert_func(71104,1471,72984,71428);r9=0;return r9}r10=(r8|0)>0;if(!r10){___assert_func(71104,1474,72984,71388)}if((r8-2|0)>>>0>2){r9=0;return r9}do{if((r5|0)==0){L2751:do{if(r10){r11=r3+20|0;r12=r1+20|0;r13=r1+4|0;r14=-1;r15=-1;r16=-1;r17=0;while(1){r18=HEAP32[HEAP32[HEAP32[r11>>2]+(r2<<2)>>2]+(r17<<2)>>2];if(HEAP8[HEAP32[r12>>2]+r18|0]<<24>>24!=0){___assert_func(71104,1488,72984,71304)}r19=(r18|0)/(r7|0)&-1;if((r17|0)==0){r20=HEAP32[HEAP32[HEAP32[r13>>2]+16>>2]+(r18<<2)>>2];r21=(r18|0)%(r7|0);r22=r19}else{r20=(r16|0)==(HEAP32[HEAP32[HEAP32[r13>>2]+16>>2]+(r18<<2)>>2]|0)?r16:-1;r21=(r15|0)==((r18|0)%(r7|0)|0)?r15:-1;r22=(r14|0)==(r19|0)?r14:-1}r19=r17+1|0;if((r19|0)==(r8|0)){r23=r22;r24=r21;r25=r20;break L2751}else{r14=r22;r15=r21;r16=r20;r17=r19}}}else{r23=-1;r24=-1;r25=-1}}while(0);if((r25|0)==-1&(r24|0)==-1&(r23|0)==-1){r9=0}else{break}return r9}}while(0);do{if((r8|0)==2){if((r4-3|0)>>>0>14){r9=-1;return r9}else{r26=5;r27=(r4*20&-1)+68016|0;break}}else if((r8|0)==3){if((r4-6|0)>>>0>18){r9=-1;return r9}else{r26=8;r27=(r4<<5)+67216|0;break}}else{if((r4-10|0)>>>0>20){r9=-1;return r9}else{r26=12;r27=(r4*48&-1)+65728|0;break}}}while(0);r4=r3+20|0;r3=(r7|0)<1;r23=r1+16|0;r1=r7+1|0;r7=0;r24=0;while(1){r25=HEAP32[r27+(r24<<2)>>2];if((r25|0)==0){r28=r7;break}else{r29=0}while(1){if((r29|0)>=(r8|0)){break}L2784:do{if(r3){r30=r25}else{r20=Math.imul(HEAP32[r6],HEAP32[HEAP32[HEAP32[r4>>2]+(r2<<2)>>2]+(r29<<2)>>2]);r21=HEAP32[r23>>2];r22=1;r5=r25;while(1){if(HEAP8[r21+(r22-1)+r20|0]<<24>>24==0){r31=r5&(1<<r22^-1)}else{r31=r5}r17=r22+1|0;if((r17|0)==(r1|0)){r30=r31;break L2784}else{r22=r17;r5=r31}}}}while(0);if((r30|0)==0){break}else{r29=r29+1|0}}r5=((r29|0)==(r8|0)?r25:0)|r7;r22=r24+1|0;if((r22|0)<(r26|0)){r7=r5;r24=r22}else{r28=r5;break}}r24=(r28|0)==0;if(r24|r10^1){r9=r24<<31>>31;return r9}else{r32=0;r33=0}while(1){r24=HEAP32[HEAP32[HEAP32[r4>>2]+(r2<<2)>>2]+(r33<<2)>>2];L2798:do{if(r3){r34=r32}else{r10=r32;r7=1;while(1){r26=(r7-1+Math.imul(HEAP32[r6],r24)|0)+HEAP32[r23>>2]|0;do{if(HEAP8[r26]<<24>>24==0){r35=r10}else{if((1<<r7&r28|0)!=0){r35=r10;break}HEAP8[r26]=0;r35=1}}while(0);r26=r7+1|0;if((r26|0)==(r1|0)){r34=r35;break L2798}else{r10=r35;r7=r26}}}}while(0);r24=r33+1|0;if((r24|0)==(r8|0)){r9=r34;break}else{r32=r34;r33=r24}}return r9}function _encode_solve_move(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r3=STACKTOP;L2808:do{if((r1|0)<1){r4=0}else{r5=0;r6=1;while(1){r7=r1-r6+1|0;r8=((r7|0)>0?r7:0)+r5|0;r7=r6*10&-1;if((r7|0)>(r1|0)){r4=r8;break L2808}else{r5=r8;r6=r7}}}}while(0);r6=Math.imul(r4+r1|0,r1)+1|0;r4=_malloc(r6);if((r4|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r5=r4+1|0;HEAP8[r4]=83;r7=Math.imul(r1,r1);L2815:do{if((r7|0)==0){r9=r5}else{r1=0;r8=r5;r10=71880;while(1){r11=HEAPU8[r2+r1|0];r12=r8+_sprintf(r8,71748,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r10,HEAP32[tempInt+4>>2]=r11,tempInt))|0;r11=r1+1|0;if((r11|0)<(r7|0)){r1=r11;r8=r12;r10=71736}else{r9=r12;break L2815}}}}while(0);HEAP8[r9]=0;if((r9+1-r4|0)==(r6|0)){STACKTOP=r3;return r4}___assert_func(71104,3156,73380,71720);STACKTOP=r3;return r4}function _alloc_block_structure(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11;r6=STACKTOP;r7=_malloc(40),r8=r7>>2;if((r7|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r9=r7;HEAP32[r8]=1;HEAP32[r8+8]=r5;HEAP32[r8+9]=r4;HEAP32[r8+1]=r1;HEAP32[r8+2]=r2;HEAP32[r8+3]=r3;r2=_malloc(r3<<2);if((r2|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r8+4]=r2;r2=_malloc(Math.imul(r4<<2,r5));if((r2|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r3=r7+28|0;HEAP32[r3>>2]=r2;r2=r5<<2;r1=_malloc(r2);if((r1|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=r7+20|0;HEAP32[r10>>2]=r1;r1=_malloc(r2);if((r1|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}HEAP32[r8+6]=r1;if((r5|0)>0){r11=0}else{STACKTOP=r6;return r9}while(1){r1=HEAP32[r3>>2]+(Math.imul(r11,r4)<<2)|0;HEAP32[HEAP32[r10>>2]+(r11<<2)>>2]=r1;r1=r11+1|0;if((r1|0)==(r5|0)){break}else{r11=r1}}STACKTOP=r6;return r9}function _solver_set(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r4=0;r5=HEAP32[r1>>2];r6=HEAP32[r2>>2];r7=HEAP32[r2+4>>2];r8=HEAP32[r2+8>>2];r9=HEAP32[r2+12>>2];_memset(r7,1,r5);_memset(r8,1,r5);r2=(r5|0)>0;L2845:do{if(r2){r10=r1+16|0;r11=0;while(1){r12=Math.imul(r11,r5);r13=HEAP32[r10>>2];r14=0;r15=0;r16=-1;while(1){r17=HEAP8[r13+HEAP32[r3+(r14+r12<<2)>>2]|0]<<24>>24==0;r18=(r17&1^1)+r15|0;r19=r17?r16:r14;r17=r14+1|0;if((r17|0)==(r5|0)){break}else{r14=r17;r15=r18;r16=r19}}do{if((r18|0)>0){if((r18|0)!=1){break}HEAP8[r8+r19|0]=0;HEAP8[r7+r11|0]=0}else{___assert_func(71104,1027,72956,71500)}}while(0);r16=r11+1|0;if((r16|0)==(r5|0)){break}else{r11=r16}}if(r2){r20=0;r21=0}else{r22=0;r4=2008;break}while(1){if(HEAP8[r7+r21|0]<<24>>24==0){r23=r20}else{HEAP8[r7+r20|0]=r21&255;r23=r20+1|0}r11=r21+1|0;if((r11|0)==(r5|0)){break}else{r20=r23;r21=r11}}L2864:do{if(r2){r11=0;r10=0;while(1){if(HEAP8[r8+r10|0]<<24>>24==0){r24=r11}else{HEAP8[r8+r11|0]=r10&255;r24=r11+1|0}r16=r10+1|0;if((r16|0)==(r5|0)){r25=r24;break L2864}else{r11=r24;r10=r16}}}else{r25=0}}while(0);if((r23|0)!=(r25|0)){___assert_func(71104,1043,72956,71492)}r10=(r23|0)>0;if(!r10){r22=r23;r4=2008;break}r11=r1+16|0;r16=0;while(1){r15=r7+r16|0;r14=Math.imul(r16,r5);r12=0;while(1){r13=Math.imul(HEAPU8[r15],r5);HEAP8[r6+r12+r14|0]=HEAP8[HEAP32[r11>>2]+HEAP32[r3+(r13+HEAPU8[r8+r12|0]<<2)>>2]|0];r13=r12+1|0;if((r13|0)==(r23|0)){break}else{r12=r13}}r12=r16+1|0;if((r12|0)==(r23|0)){r26=r11;r27=r23;r28=r10;break L2845}else{r16=r12}}}else{r22=0;r4=2008}}while(0);if(r4==2008){r26=r1+16|0;r27=r22;r28=0}_memset(r9,0,r27);r22=r27-1|0;r1=0;L2883:while(1){do{if((r1|0)>1&(r1|0)<(r22|0)){L2887:do{if(r28){r23=0;r25=0;while(1){r24=Math.imul(r23,r5);r2=0;while(1){if(HEAP8[r9+r2|0]<<24>>24!=0){if(HEAP8[r6+r2+r24|0]<<24>>24!=0){r29=0;break}}r21=r2+1|0;if((r21|0)<(r27|0)){r2=r21}else{r29=1;break}}r2=r29+r25|0;r24=r23+1|0;if((r24|0)==(r27|0)){r30=r2;break L2887}else{r23=r24;r25=r2}}}else{r30=0}}while(0);r25=r27-r1|0;if((r30|0)>(r25|0)){r31=-1;r4=2040;break L2883}if((r30|0)<(r25|0)){r4=2035;break}if(r28){r32=0;r33=0}else{r31=0;r4=2042;break L2883}while(1){r25=Math.imul(r32,r5);r23=0;while(1){if(HEAP8[r9+r23|0]<<24>>24!=0){if(HEAP8[r6+r23+r25|0]<<24>>24!=0){r4=2028;break}}r2=r23+1|0;if((r2|0)<(r27|0)){r23=r2}else{r34=r33;break}}L2906:do{if(r4==2028){r4=0;r23=r7+r32|0;r2=0;r24=r33;while(1){do{if(HEAP8[r9+r2|0]<<24>>24==0){if(HEAP8[r6+r2+r25|0]<<24>>24==0){r35=r24;break}r21=Math.imul(HEAPU8[r23],r5);HEAP8[HEAP32[r26>>2]+HEAP32[r3+(r21+HEAPU8[r8+r2|0]<<2)>>2]|0]=0;r35=1}else{r35=r24}}while(0);r21=r2+1|0;if((r21|0)==(r27|0)){r34=r35;break L2906}else{r2=r21;r24=r35}}}}while(0);r25=r32+1|0;if((r25|0)==(r27|0)){break}else{r32=r25;r33=r34}}r25=(r34|0)!=0;if(r25|r28^1){r31=r25&1;r4=2043;break L2883}else{r36=r1;r37=r27;break}}else{r4=2035}}while(0);do{if(r4==2035){r4=0;if(r28){r36=r1;r37=r27;break}else{r31=0;r4=2044;break L2883}}}while(0);while(1){r25=r37-1|0;r38=r9+r25|0;if(HEAP8[r38]<<24>>24==0){break}HEAP8[r38]=0;if((r25|0)>0){r36=r36-1|0;r37=r25}else{r31=0;r4=2041;break L2883}}HEAP8[r38]=1;r1=r36+1|0}if(r4==2042){return r31}else if(r4==2043){return r31}else if(r4==2044){return r31}else if(r4==2040){return r31}else if(r4==2041){return r31}}function _precompute_sum_bits(){var r1,r2,r3,r4,r5,r6;r1=3;while(1){do{if((r1|0)<18){r2=1;r3=0;while(1){r4=r1-r2|0;if((r4|0)<=(r2|0)){r5=r3;break}if((r4|0)>9){r6=r3}else{HEAP32[(r1*20&-1)+(r3<<2)+68016>>2]=1<<r4|1<<r2;r6=r3+1|0}r4=r2+1|0;if((r4|0)<(r1|0)){r2=r4;r3=r6}else{r5=r6;break}}if((r5|0)>=6){___assert_func(71104,186,73056,70696);break}if((r5|0)>=5){break}HEAP32[(r1*20&-1)+(r5<<2)+68016>>2]=0}}while(0);do{if((r1|0)<25){r3=_find_sum_bits((r1<<5)+67216|0,0,r1,3,1,0);if((r3|0)>=9){___assert_func(71104,192,73056,70680);break}if((r3|0)>=8){break}HEAP32[(r1<<5)+(r3<<2)+67216>>2]=0}}while(0);r3=_find_sum_bits((r1*48&-1)+65728|0,0,r1,4,1,0);do{if((r3|0)<13){if((r3|0)>=12){break}HEAP32[(r1*48&-1)+(r3<<2)+65728>>2]=0}else{___assert_func(71104,197,73056,70664)}}while(0);r3=r1+1|0;if((r3|0)==31){break}else{r1=r3}}return}function _spec_to_grid(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10;r4=0;r5=r1;r1=0;L2958:while(1){r6=r5;while(1){r7=HEAP8[r6];if(r7<<24>>24==0|r7<<24>>24==44){break L2958}r8=r6+1|0;if((r7-97&255)<26){r4=2071;break}if(r7<<24>>24==95){r6=r8;continue}if((r7-49&255)<9){break}___assert_func(71104,3809,72928,70780);r6=r8}if(r4==2071){r4=0;r9=r7<<24>>24;r10=r9-96|0;if((r10+r1|0)>(r3|0)){___assert_func(71104,3798,72928,70824)}if((r10|0)<=0){r5=r8;r1=r1;continue}_memset(r2+r1|0,0,r10);r5=r8;r1=r1-96+r9|0;continue}if((r1|0)>=(r3|0)){___assert_func(71104,3804,72928,70812)}r9=_atoi(r6)&255;HEAP8[r2+r1|0]=r9;r9=r8;while(1){if((HEAP8[r9]-48&255)<10){r9=r9+1|0}else{break}}r5=r9;r1=r1+1|0}if((r1|0)==(r3|0)){return r6}___assert_func(71104,3812,72928,70768);return r6}function _make_blocks_from_whichblock(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=r1+32|0;L2985:do{if((HEAP32[r2>>2]|0)>0){r3=r1+36|0;r4=r1+20|0;r5=r1+24|0;r6=0;while(1){HEAP32[HEAP32[HEAP32[r4>>2]+(r6<<2)>>2]+(HEAP32[r3>>2]-1<<2)>>2]=0;HEAP32[HEAP32[r5>>2]+(r6<<2)>>2]=0;r7=r6+1|0;if((r7|0)<(HEAP32[r2>>2]|0)){r6=r7}else{break L2985}}}}while(0);r2=r1+12|0;if((HEAP32[r2>>2]|0)<=0){return}r6=r1+16|0;r5=r1+36|0;r3=r1+20|0;r4=r1+24|0;r1=0;while(1){r7=HEAP32[HEAP32[r6>>2]+(r1<<2)>>2];r8=(HEAP32[r5>>2]-1<<2)+HEAP32[HEAP32[r3>>2]+(r7<<2)>>2]|0;r9=HEAP32[r8>>2];HEAP32[r8>>2]=r9+1|0;if((r9|0)>=(HEAP32[r5>>2]|0)){___assert_func(71104,3190,73244,70996)}HEAP32[HEAP32[HEAP32[r3>>2]+(r7<<2)>>2]+(r9<<2)>>2]=r1;r9=(r7<<2)+HEAP32[r4>>2]|0;HEAP32[r9>>2]=HEAP32[r9>>2]+1|0;r9=r1+1|0;if((r9|0)<(HEAP32[r2>>2]|0)){r1=r9}else{break}}return}function _find_sum_bits(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12;r7=0;if((r4|0)<=1){___assert_func(71104,158,73344,70644)}if((r5|0)>=(r3|0)){r8=r2;return r8}r9=(r4|0)==2;r10=r4-1|0;r4=r5;r5=r2;L3006:while(1){r2=1<<r4|r6;if((r2|0)==(r6|0)){___assert_func(71104,162,73344,70612)}r11=r3-r4|0;do{if(r9){if((r11|0)<=(r4|0)){r8=r5;r7=2111;break L3006}if((r11|0)>9){r12=r5;break}HEAP32[r1+(r5<<2)>>2]=r2|1<<r11;r12=r5+1|0}else{r12=_find_sum_bits(r1,r5,r11,r10,r4+1|0,r2)}}while(0);r2=r4+1|0;if((r2|0)<(r3|0)){r4=r2;r5=r12}else{r8=r12;r7=2112;break}}if(r7==2112){return r8}else if(r7==2111){return r8}}function _spec_to_dsf(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27;r5=0;r6=STACKTOP;r7=HEAP32[r1>>2];r8=_malloc(r4<<2);if((r8|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r9=r8;L3024:do{if((r4|0)>0){r10=0;while(1){HEAP32[r9+(r10<<2)>>2]=6;r11=r10+1|0;if((r11|0)==(r4|0)){break L3024}else{r10=r11}}}}while(0);HEAP32[r2>>2]=r9;r2=r3-1|0;r4=Math.imul(r3<<1,r2);r10=Math.imul(r2,r3);r11=r7;r7=0;L3028:while(1){r12=HEAP8[r11];if(r12<<24>>24==44|r12<<24>>24==0){break}r13=r12<<24>>24;do{if(r12<<24>>24==95){r14=r7;r15=0;r16=r11+1|0}else{if((r12-97&255)>=26){r5=2123;break L3028}r17=r13-96|0;r18=r11+1|0;if((r17|0)>0){r19=r7;r20=r17}else{r14=r7;r15=r17;r16=r18;break}while(1){r21=r20-1|0;if((r19|0)>=(r4|0)){___assert_func(71104,3851,72944,70892)}r22=(r19|0)/(r2|0)&-1;if((r19|0)<(r10|0)){r23=(r19|0)%(r2|0)+Math.imul(r22,r3)|0;r24=r23+1|0;r25=r23}else{r23=r22-r3|0;r22=(r19|0)%(r2|0);r26=Math.imul(r22,r3)+r23|0;r24=Math.imul(r22+1|0,r3)+r23|0;r25=r26}_edsf_merge(r9,r25,r24,0);if((r21|0)>0){r19=r19+1|0;r20=r21}else{break}}r14=r17+r7|0;r15=r17;r16=r18}}while(0);r11=r16;r7=r14+((r15|0)!=25&1)|0}if(r5==2123){_free(r8);r27=70912;STACKTOP=r6;return r27}HEAP32[r1>>2]=r11;if((r7|0)==(r4|1|0)){r27=0;STACKTOP=r6;return r27}_free(r8);r27=70840;STACKTOP=r6;return r27}function _symmetries(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10;r7=r5>>2;r8=Math.imul(r2,r1);HEAP32[r7]=r3;r1=(r5+8|0)>>2;HEAP32[r7+1]=r4;if((r6|0)==7){r5=r8-1|0;r2=r5-r3|0;HEAP32[r1]=r2;HEAP32[r7+3]=r4;HEAP32[r7+4]=r3;r9=r5-r4|0;HEAP32[r7+5]=r9;HEAP32[r7+6]=r2;HEAP32[r7+7]=r9;HEAP32[r7+8]=r4;HEAP32[r7+9]=r3;HEAP32[r7+10]=r4;HEAP32[r7+11]=r2;HEAP32[r7+12]=r9;HEAP32[r7+13]=r3;HEAP32[r7+14]=r9;HEAP32[r7+15]=r2;r2=8;return r2}else if((r6|0)==5){r9=r8-1|0;r5=r9-r3|0;HEAP32[r1]=r5;HEAP32[r7+3]=r4;HEAP32[r7+4]=r3;r10=r9-r4|0;HEAP32[r7+5]=r10;HEAP32[r7+6]=r5;HEAP32[r7+7]=r10;r2=4;return r2}else if((r6|0)==2){r10=r8-1|0;r5=r10-r4|0;HEAP32[r1]=r5;HEAP32[r7+3]=r3;HEAP32[r7+4]=r4;r9=r10-r3|0;HEAP32[r7+5]=r9;HEAP32[r7+6]=r9;HEAP32[r7+7]=r5;r2=4;return r2}else if((r6|0)==4){HEAP32[r1]=r4;HEAP32[r7+3]=r3;r2=2;return r2}else if((r6|0)==1){r5=r8-1|0;HEAP32[r1]=r5-r3|0;HEAP32[r7+3]=r5-r4|0;r2=2;return r2}else if((r6|0)==6){HEAP32[r1]=r4;HEAP32[r7+3]=r3;r5=r8-1|0;r9=r5-r3|0;HEAP32[r7+4]=r9;r10=r5-r4|0;HEAP32[r7+5]=r10;HEAP32[r7+6]=r10;HEAP32[r7+7]=r9;r2=4;return r2}else if((r6|0)==3){HEAP32[r1]=r8-1-r3|0;HEAP32[r7+3]=r4;r2=2;return r2}else{r2=1;return r2}}function _gridgen_place(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12;r5=r1>>2;r6=1<<(r4&255);r7=HEAP32[r5];r8=(r3<<2)+HEAP32[r5+4]|0;HEAP32[r8>>2]=HEAP32[r8>>2]|r6;r8=(r2<<2)+HEAP32[r5+5]|0;HEAP32[r8>>2]=HEAP32[r8>>2]|r6;r8=Math.imul(r7,r3)+r2|0;r2=(HEAP32[HEAP32[HEAP32[r5+1]+16>>2]+(r8<<2)>>2]<<2)+HEAP32[r5+6]|0;HEAP32[r2>>2]=HEAP32[r2>>2]|r6;r2=HEAP32[r5+7];if((r2|0)!=0){r3=(HEAP32[HEAP32[HEAP32[r5+2]+16>>2]+(r8<<2)>>2]<<2)+r2|0;HEAP32[r3>>2]=HEAP32[r3>>2]|r6}r3=r1+32|0;r2=HEAP32[r3>>2];if((r2|0)==0){r9=r1+12|0,r10=r9>>2;r11=HEAP32[r10];r12=r11+r8|0;HEAP8[r12]=r4;return}if(((r8|0)%(r7+1|0)|0)==0){HEAP32[r2>>2]=HEAP32[r2>>2]|r6}if(!(((r8|0)%(r7-1|0)|0)==0&(r8|0)>0)){r9=r1+12|0,r10=r9>>2;r11=HEAP32[r10];r12=r11+r8|0;HEAP8[r12]=r4;return}if((r8|0)>=(Math.imul(r7,r7)-1|0)){r9=r1+12|0,r10=r9>>2;r11=HEAP32[r10];r12=r11+r8|0;HEAP8[r12]=r4;return}r7=HEAP32[r3>>2]+4|0;HEAP32[r7>>2]=HEAP32[r7>>2]|r6;r9=r1+12|0,r10=r9>>2;r11=HEAP32[r10];r12=r11+r8|0;HEAP8[r12]=r4;return}function _encode_block_structure_desc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r3=0;r4=Math.imul(HEAP32[r2+8>>2],HEAP32[r2+4>>2]);r5=r4-1|0;r6=Math.imul(r4<<1,r5);if((r6|0)<0){r7=r1;return r7}r8=Math.imul(r5,r4);r9=r2+16|0;r2=0;r10=0;r11=r1;while(1){do{if((r10|0)==(r6|0)){r3=2176}else{r1=(r10|0)/(r5|0)&-1;if((r10|0)<(r8|0)){r12=(r10|0)%(r5|0)+Math.imul(r1,r4)|0;r13=r12+1|0;r14=r12}else{r12=r1-r4|0;r1=(r10|0)%(r5|0);r15=Math.imul(r1,r4)+r12|0;r13=Math.imul(r1+1|0,r4)+r12|0;r14=r15}r15=HEAP32[r9>>2];if((HEAP32[r15+(r14<<2)>>2]|0)!=(HEAP32[r15+(r13<<2)>>2]|0)){r3=2176;break}r16=r11;r17=r2+1|0;break}}while(0);if(r3==2176){r3=0;if((r2|0)>25){r15=Math.floor(((r2-26|0)>>>0)/25);_memset(r11,122,r15+1|0);r18=r2-25+(r15*-25&-1)|0;r19=r15+(r11+1)|0}else{r18=r2;r19=r11}if((r18|0)==0){r20=95}else{r20=r18+96&255}HEAP8[r19]=r20;r16=r19+1|0;r17=0}r15=r10+1|0;if((r15|0)>(r6|0)){r7=r16;break}else{r2=r17;r10=r15;r11=r16}}return r7}function _validate_block_desc(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33;r8=0;r9=STACKTOP;STACKTOP=STACKTOP+4|0;r10=r9,r11=r10>>2;r12=_spec_to_dsf(r1,r10,r2,r3);if((r12|0)!=0){r13=r12;STACKTOP=r9;return r13}do{if((r6|0)==(r7|0)){if((r4|0)!=(r5|0)){___assert_func(71104,3928,72884,70308)}if((Math.imul(r6,r4)|0)==(r3|0)){break}___assert_func(71104,3929,72884,70184)}}while(0);r12=r5<<2;r2=_malloc(r12);if((r2|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r10=r2;r1=_malloc(r12);if((r1|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r12=r1;L3128:do{if((r3|0)>0){r14=HEAP32[r11];r15=0;r16=0;while(1){r17=(r15<<2)+r14|0;r18=HEAP32[r17>>2];do{if((r18&2|0)==0){r19=0;r20=r18;while(1){r21=r20&1^r19;r22=r20>>2;r23=HEAP32[r14+(r22<<2)>>2];if((r23&2|0)==0){r19=r21;r20=r23}else{break}}L3136:do{if((r22|0)==(r15|0)){r24=r21;r25=r15}else{r20=r22<<2;r19=r18>>2;r23=r21^r18&1;HEAP32[r17>>2]=r21|r20;if((r19|0)==(r22|0)){r24=r23;r25=r22;break}else{r26=r19;r27=r23}while(1){r23=(r26<<2)+r14|0;r19=HEAP32[r23>>2];r28=r19>>2;r29=r27^r19&1;HEAP32[r23>>2]=r27|r20;if((r28|0)==(r22|0)){r24=r29;r25=r22;break L3136}else{r26=r28;r27=r29}}}}while(0);if((r24|0)==0){r30=r25;break}___assert_func(71932,137,73432,71684);r30=r25}else{r30=r15}}while(0);r17=0;while(1){if((r17|0)>=(r16|0)){break}if((HEAP32[r10+(r17<<2)>>2]|0)==(r30|0)){r8=2208;break}else{r17=r17+1|0}}if(r8==2208){r8=0;r18=(r17<<2)+r12|0;r20=HEAP32[r18>>2]+1|0;HEAP32[r18>>2]=r20;if((r20|0)>(r7|0)){r8=2209;break}}if((r17|0)==(r16|0)){if((r16|0)>=(r5|0)){r8=2214;break}HEAP32[r10+(r16<<2)>>2]=r30;HEAP32[r12+(r16<<2)>>2]=1;r31=r16+1|0}else{r31=r16}r20=r15+1|0;if((r20|0)<(r3|0)){r15=r20;r16=r31}else{r32=r31;break L3128}}if(r8==2214){if((r14|0)!=0){_free(r14)}_free(r2);_free(r1);r13=70124;STACKTOP=r9;return r13}else if(r8==2209){if((r14|0)!=0){_free(r14)}_free(r2);_free(r1);r13=70156;STACKTOP=r9;return r13}}else{r32=0}}while(0);if((r32|0)<(r4|0)){r4=HEAP32[r11];if((r4|0)!=0){_free(r4)}_free(r2);_free(r1);r13=70088;STACKTOP=r9;return r13}else{r33=0}while(1){if((r33|0)>=(r32|0)){r8=2228;break}if((HEAP32[r12+(r33<<2)>>2]|0)<(r6|0)){r8=2225;break}else{r33=r33+1|0}}if(r8==2228){_free(r2);_free(r1);r33=HEAP32[r11];if((r33|0)==0){r13=0;STACKTOP=r9;return r13}_free(r33);r13=0;STACKTOP=r9;return r13}else if(r8==2225){r8=HEAP32[r11];if((r8|0)!=0){_free(r8)}_free(r2);_free(r1);r13=70060;STACKTOP=r9;return r13}}function _merge_some_cages(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r3=STACKTOP;r4=(r1+32|0)>>2;r5=HEAP32[r4];r6=_malloc(Math.imul(r5<<3,r5));if((r6|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r5=HEAP32[r4];if((r5|0)<=0){_free(r6);STACKTOP=r3;return}r7=r1+24|0;r8=r1+36|0;r9=r1+20|0;r10=(r1+16|0)>>2;r1=r6;r11=r6+4|0;r12=0;r13=r5;while(1){r5=r12+1|0;L3194:do{if((r5|0)<(r13|0)){r14=r5;r15=r13;while(1){r16=HEAP32[r7>>2];r17=HEAP32[r16+(r12<<2)>>2];L3197:do{if((HEAP32[r16+(r14<<2)>>2]+r17|0)<=(HEAP32[r8>>2]|0)&(r17|0)>0){r18=HEAP32[HEAP32[r9>>2]+(r12<<2)>>2];r19=0;while(1){r20=HEAP32[r18+(r19<<2)>>2];r21=(r20|0)/(r2|0)&-1;r22=(r20|0)%(r2|0);if((r21|0)>0){if((HEAP32[HEAP32[r10]+(r20-r2<<2)>>2]|0)==(r14|0)){break}}if((r21+1|0)<(r2|0)){if((HEAP32[HEAP32[r10]+(r20+r2<<2)>>2]|0)==(r14|0)){break}}if((r22|0)>0){if((HEAP32[HEAP32[r10]+(r20-1<<2)>>2]|0)==(r14|0)){break}}if((r22+1|0)<(r2|0)){if((HEAP32[HEAP32[r10]+(r20+1<<2)>>2]|0)==(r14|0)){break}}r20=r19+1|0;if((r20|0)<(r17|0)){r19=r20}else{r23=r15;break L3197}}HEAP32[r1>>2]=r12;HEAP32[r11>>2]=r14;r23=HEAP32[r4]}else{r23=r15}}while(0);r17=r14+1|0;if((r17|0)<(r23|0)){r14=r17;r15=r23}else{r24=r23;break L3194}}}else{r24=r13}}while(0);if((r5|0)<(r24|0)){r12=r5;r13=r24}else{break}}_free(r6);STACKTOP=r3;return}function _gridgen_real(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59;r3=r1>>2;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+12|0;r6=r5;r7=r1|0;r8=HEAP32[r7>>2];r9=(r1+40|0)>>2;if((HEAP32[r9]|0)==0){r10=1;STACKTOP=r5;return r10}r11=HEAP32[r2>>2];if((r11|0)<1){r10=0;STACKTOP=r5;return r10}HEAP32[r2>>2]=r11-1|0;r11=r8+1|0;r12=HEAP32[r9];L3224:do{if((r12|0)>0){r13=HEAP32[r3+9]>>2;r14=HEAP32[HEAP32[r3+1]+16>>2];r15=HEAP32[r3+4];r16=HEAP32[r3+5];r17=HEAP32[r3+6];r18=HEAP32[r3+7];r19=(r18|0)==0;r20=HEAP32[r3+8];r21=(r20|0)==0;r22=(r8|0)<1;r23=r8-1|0;r24=Math.imul(r8,r8)-1|0;r25=r1+8|0;r26=-1;r27=r11;r28=0;r29=-1;r30=-1;r31=0;r32=-1;r33=r18;while(1){r34=HEAP32[((r31*12&-1)>>2)+r13];r35=HEAP32[((r31*12&-1)+4>>2)+r13];r36=Math.imul(r35,r8)+r34|0;r37=HEAP32[r16+(r34<<2)>>2]|HEAP32[r15+(r35<<2)>>2]|HEAP32[r17+(HEAP32[r14+(r36<<2)>>2]<<2)>>2];do{if(r19){r38=r37;r39=r33}else{r40=HEAP32[HEAP32[HEAP32[r25>>2]+16>>2]+(r36<<2)>>2];r41=HEAP32[r18+(r40<<2)>>2]|r37;if((r33|0)==0){r38=r41;r39=0;break}r38=HEAP32[r33+(r40<<2)>>2]|r41;r39=r33}}while(0);do{if(r21){r42=r38}else{if(((r36|0)%(r11|0)|0)==0){r43=HEAP32[r20>>2]|r38}else{r43=r38}if(!(((r36|0)%(r23|0)|0)==0&(r36|0)>0&(r36|0)<(r24|0))){r42=r43;break}r42=HEAP32[r20+4>>2]|r43}}while(0);L3239:do{if(r22){r44=0}else{r36=1;r37=0;while(1){r41=((1<<r36&r42|0)==0&1)+r37|0;r40=r36+1|0;if((r40|0)==(r11|0)){r44=r41;break L3239}else{r36=r40;r37=r41}}}}while(0);do{if((r44|0)<(r27|0)){r45=HEAP32[((r31*12&-1)+8>>2)+r13];r4=2278;break}else{if((r44|0)!=(r27|0)){r46=r32;r47=r30;r48=r29;r49=r28;r50=r27;r51=r26;break}r37=HEAP32[((r31*12&-1)+8>>2)+r13];if((r37|0)<(r28|0)){r45=r37;r4=2278;break}else{r46=r32;r47=r30;r48=r29;r49=r28;r50=r27;r51=r26;break}}}while(0);if(r4==2278){r4=0;r46=r31;r47=r42;r48=r34;r49=r45;r50=r44;r51=r35}r37=r31+1|0;if((r37|0)<(r12|0)){r26=r51;r27=r50;r28=r49;r29=r48;r30=r47;r31=r37;r32=r46;r33=r39}else{r52=r51;r53=r50;r54=r48;r55=r47;r56=r46;break L3224}}}else{r52=-1;r53=r11;r54=-1;r55=-1;r56=-1}}while(0);r46=r12-1|0;if((r56|0)!=(r46|0)){r12=r1+36|0;r47=HEAP32[r12>>2];r48=r6>>2;r6=(r47+(r46*12&-1)|0)>>2;HEAP32[r48]=HEAP32[r6];HEAP32[r48+1]=HEAP32[r6+1];HEAP32[r48+2]=HEAP32[r6+2];r46=(r47+(r56*12&-1)|0)>>2;HEAP32[r6]=HEAP32[r46];HEAP32[r6+1]=HEAP32[r46+1];HEAP32[r6+2]=HEAP32[r46+2];r46=(HEAP32[r12>>2]+(r56*12&-1)|0)>>2;HEAP32[r46]=HEAP32[r48];HEAP32[r46+1]=HEAP32[r48+1];HEAP32[r46+2]=HEAP32[r48+2]}r48=_malloc(r53<<2);if((r48|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r53=r48;L3257:do{if((r8|0)<1){r57=0}else{r46=1;r56=0;while(1){if((1<<r46&r55|0)==0){HEAP32[r53+(r56<<2)>>2]=r46;r58=r56+1|0}else{r58=r56}r12=r46+1|0;if((r12|0)==(r11|0)){r57=r58;break L3257}else{r46=r12;r56=r58}}}}while(0);r58=HEAP32[r3+11];if((r58|0)!=0){_shuffle(r48,r57,4,r58)}L3267:do{if((r57|0)>0){r58=r1+16|0;r3=r1+20|0;r11=r1+4|0;r55=r1+24|0;r8=r1+28|0;r56=r1+32|0;r46=r1+12|0;r12=r1+8|0;r6=0;while(1){r47=HEAP32[r53+(r6<<2)>>2];_gridgen_place(r1,r54,r52,r47&255);HEAP32[r9]=HEAP32[r9]-1|0;if((_gridgen_real(r1,r2)|0)!=0){r59=1;break L3267}r50=1<<(r47&255)^-1;r47=HEAP32[r7>>2];r51=(r52<<2)+HEAP32[r58>>2]|0;HEAP32[r51>>2]=HEAP32[r51>>2]&r50;r51=(r54<<2)+HEAP32[r3>>2]|0;HEAP32[r51>>2]=HEAP32[r51>>2]&r50;r51=Math.imul(r47,r52)+r54|0;r39=(HEAP32[HEAP32[HEAP32[r11>>2]+16>>2]+(r51<<2)>>2]<<2)+HEAP32[r55>>2]|0;HEAP32[r39>>2]=HEAP32[r39>>2]&r50;r39=HEAP32[r8>>2];if((r39|0)!=0){r49=(HEAP32[HEAP32[HEAP32[r12>>2]+16>>2]+(r51<<2)>>2]<<2)+r39|0;HEAP32[r49>>2]=HEAP32[r49>>2]&r50}r49=HEAP32[r56>>2];do{if((r49|0)!=0){if(((r51|0)%(r47+1|0)|0)==0){HEAP32[r49>>2]=HEAP32[r49>>2]&r50}if(!(((r51|0)%(r47-1|0)|0)==0&(r51|0)>0)){break}if((r51|0)>=(Math.imul(r47,r47)-1|0)){break}r39=HEAP32[r56>>2]+4|0;HEAP32[r39>>2]=HEAP32[r39>>2]&r50}}while(0);HEAP8[HEAP32[r46>>2]+r51|0]=0;HEAP32[r9]=HEAP32[r9]+1|0;r50=r6+1|0;if((r50|0)<(r57|0)){r6=r50}else{r59=0;break L3267}}}else{r59=0}}while(0);_free(r48);r10=r59;STACKTOP=r5;return r10}function _divvy_rectangle(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97;r5=0;r6=STACKTOP;r7=Math.imul(r2,r1);r8=(r7|0)/(r3|0)&-1;r9=(r7|0)==(Math.imul(r8,r3)|0);r10=r7<<2;r11=r8<<2;r12=r7<<4;r13=(r7|0)>0;r14=(r8|0)>0;r15=(r7|0)<(r8<<1|0);r16=(r1|0)>0;r17=(r2|0)>0;r18=(r1|0)>1;r19=(r2|0)>1;L3286:while(1){if(!r9){___assert_func(72032,270,73476,72188)}r20=_malloc(r10);if((r20|0)==0){r5=2311;break}r21=r20,r22=r21>>2;r23=_malloc(r10);if((r23|0)==0){r5=2313;break}r24=r23,r25=r24>>2;r26=_malloc(r10);if((r26|0)==0){r5=2315;break}r27=r26,r28=r27>>2;r29=_malloc(r11);if((r29|0)==0){r5=2317;break}r30=r29,r31=r30>>2;r32=_malloc(r11);if((r32|0)==0){r5=2319;break}r33=r32>>2;r34=_malloc(r12);if((r34|0)==0){r5=2321;break}r35=r34,r36=r35>>2;r37=_malloc(r10);if((r37|0)==0){r5=2323;break}r38=r37>>2;if(r13){r39=0;while(1){HEAP32[(r39<<2>>2)+r22]=r39;r40=r39+1|0;if((r40|0)==(r7|0)){break}else{r39=r40}}_shuffle(r20,r7,4,r4);_memset(r26,-1,r10)}else{_shuffle(r20,r7,4,r4)}L3304:do{if(r14){r39=0;while(1){HEAP32[(HEAP32[(r39<<2>>2)+r22]<<2>>2)+r28]=r39;HEAP32[(r39<<2>>2)+r31]=1;r40=r39+1|0;if((r40|0)==(r8|0)){r41=0;break L3304}else{r39=r40}}}else{r41=0}}while(0);while(1){if((r41|0)<(r2|0)){L3311:do{if(r16){r39=Math.imul(r41,r1);r40=0;while(1){r42=r40+r39|0;r43=(r42<<2)+r27|0;r44=HEAP32[r43>>2];do{if((r44|0)<0){HEAP32[(r42<<2>>2)+r38]=0}else{if((HEAP32[(r44<<2>>2)+r31]|0)==1){HEAP32[(r42<<2>>2)+r38]=1;break}else{r45=_addremcommon(r1,r2,r40,r41,r27,r44);HEAP32[(r42<<2>>2)+r38]=r45;break}}}while(0);r44=r42<<2;r45=0;while(1){do{if((r45|0)==0){r46=-1;r5=2342}else{r47=(r45|0)==1&1;if((r45|0)==2){r48=-1;r49=r47;break}else{r46=r47;r5=2342;break}}}while(0);if(r5==2342){r5=0;r48=(r45|0)==3&1;r49=r46}r47=r49+r40|0;r50=r48+r41|0;r51=(r45+r44<<2)+r35|0;HEAP32[r51>>2]=-1;do{if((r50|0)<(r2|0)&(((r47|0)>=(r1|0)|(r47|0)<0|(r50|0)<0)^1)){r52=(Math.imul(r50,r1)+r47<<2)+r27|0;r53=HEAP32[r52>>2];if((r53|0)<0){break}if((r53|0)==(HEAP32[r43>>2]|0)){break}if((_addremcommon(r1,r2,r40,r41,r27,r53)|0)==0){break}HEAP32[r51>>2]=r53}}while(0);r51=r45+1|0;if((r51|0)==4){break}else{r45=r51}}r45=r40+1|0;if((r45|0)==(r1|0)){break L3311}else{r40=r45}}}}while(0);r41=r41+1|0;continue}if(r14){r54=0;r55=0}else{r5=2355;break}while(1){if((HEAP32[(r55<<2>>2)+r31]|0)<(r3|0)){HEAP32[(r54<<2>>2)+r25]=r55;r56=r54+1|0}else{r56=r54}r40=r55+1|0;if((r40|0)==(r8|0)){break}else{r54=r56;r55=r40}}if((r56|0)==0){r5=2355;break}else{r57=0}while(1){if((r56>>>(r57>>>0)|0)==0){break}else{r57=r57+1|0}}r40=r57+3|0;if((r40|0)>=32){___assert_func(71160,275,73044,71992)}r39=Math.floor((1<<r40>>>0)/(r56>>>0));r45=Math.imul(r39,r56);while(1){r58=_random_bits(r4,r40);if(r58>>>0<r45>>>0){break}}r45=(Math.floor((r58>>>0)/(r39>>>0))<<2)+r24|0;r40=HEAP32[r45>>2];do{if(r15){___assert_func(72032,403,73476,71708);r59=0;break}else{r59=0}}while(0);while(1){r39=r59<<1;HEAP32[((r39|1)<<2>>2)+r25]=-1;HEAP32[(r39<<2>>2)+r25]=-1;r39=r59+1|0;if((r39|0)==(r8|0)){break}else{r59=r39}}HEAP32[r33]=r40;r39=r40<<1;HEAP32[((r39|1)<<2>>2)+r25]=-2;HEAP32[(r39<<2>>2)+r25]=-2;r39=1;r45=0;L3358:while(1){r60=HEAP32[(r45<<2>>2)+r33];r61=r60<<1;r62=HEAP32[((r61|1)<<2>>2)+r25];r63=(r62|0)>-1;if(r63){r43=(r62<<2)+r27|0;if((HEAP32[r43>>2]|0)!=(r60|0)){___assert_func(72032,424,73476,71348)}HEAP32[r43>>2]=-3}L3366:do{if(r13){r43=(r60<<2)+r30|0;r44=r63^1;r42=0;while(1){r51=HEAP32[(r42<<2>>2)+r22];r64=(r51<<2)+r27|0;do{if((HEAP32[r64>>2]|0)==-1){if(!((HEAP32[r43>>2]|0)!=1|r44)){r5=2377;break L3358}r47=r51<<2;if((HEAP32[(r47<<2>>2)+r36]|0)==(r60|0)){if((_addremcommon(r1,r2,(r51|0)%(r1|0),(r51|0)/(r1|0)&-1,r27,r60)|0)!=0){r5=2377;break L3358}}if((HEAP32[((r47|1)<<2>>2)+r36]|0)==(r60|0)){if((_addremcommon(r1,r2,(r51|0)%(r1|0),(r51|0)/(r1|0)&-1,r27,r60)|0)!=0){r5=2377;break L3358}}if((HEAP32[((r47|2)<<2>>2)+r36]|0)==(r60|0)){if((_addremcommon(r1,r2,(r51|0)%(r1|0),(r51|0)/(r1|0)&-1,r27,r60)|0)!=0){r5=2377;break L3358}}if((HEAP32[((r47|3)<<2>>2)+r36]|0)!=(r60|0)){break}if((_addremcommon(r1,r2,(r51|0)%(r1|0),(r51|0)/(r1|0)&-1,r27,r60)|0)!=0){r5=2377;break L3358}}}while(0);r51=r42+1|0;if((r51|0)<(r7|0)){r42=r51}else{r65=r39;r66=0;break}}while(1){r42=(r66<<2)+r21|0;r44=HEAP32[r42>>2];r43=HEAP32[(r44<<2>>2)+r28];L3386:do{if((r43|0)<0){r67=r65}else{r51=r43<<1;r47=(r51<<2)+r24|0;if((HEAP32[r47>>2]|0)!=-1){r67=r65;break}if((HEAP32[(r44<<2>>2)+r38]|0)==0){r67=r65;break}r50=r44<<2;do{if((HEAP32[(r50<<2>>2)+r36]|0)==(r60|0)){if((_addremcommon(r1,r2,(r44|0)%(r1|0),(r44|0)/(r1|0)&-1,r27,r60)|0)==0){r5=2390;break}else{break}}else{r5=2390}}while(0);do{if(r5==2390){r5=0;if((HEAP32[((r50|1)<<2>>2)+r36]|0)==(r60|0)){if((_addremcommon(r1,r2,(r44|0)%(r1|0),(r44|0)/(r1|0)&-1,r27,r60)|0)!=0){break}}if((HEAP32[((r50|2)<<2>>2)+r36]|0)==(r60|0)){if((_addremcommon(r1,r2,(r44|0)%(r1|0),(r44|0)/(r1|0)&-1,r27,r60)|0)!=0){break}}if((HEAP32[((r50|3)<<2>>2)+r36]|0)!=(r60|0)){r67=r65;break L3386}if((_addremcommon(r1,r2,(r44|0)%(r1|0),(r44|0)/(r1|0)&-1,r27,r60)|0)==0){r67=r65;break L3386}}}while(0);if((r65|0)>=(r8|0)){___assert_func(72032,550,73476,71064)}HEAP32[(r65<<2>>2)+r33]=r43;HEAP32[r47>>2]=r60;HEAP32[((r51|1)<<2>>2)+r25]=HEAP32[r42>>2];r67=r65+1|0}}while(0);r42=r66+1|0;if((r42|0)==(r7|0)){r68=r67;break L3366}else{r65=r67;r66=r42}}}else{r68=r39}}while(0);if(r63){HEAP32[(r62<<2>>2)+r28]=r60}r42=r45+1|0;if((r42|0)<(r68|0)){r39=r68;r45=r42}else{r69=r68;r70=r42;break}}if(r5==2377){r5=0;if(r63){HEAP32[(r62<<2>>2)+r28]=r60}HEAP32[r64>>2]=r60;r40=HEAP32[(r61<<2>>2)+r25];L3415:do{if((r40|0)==-2){r71=r60}else{r42=r61;r43=r40;while(1){HEAP32[(HEAP32[((r42|1)<<2>>2)+r25]<<2>>2)+r28]=r43;r44=r43<<1;r50=HEAP32[(r44<<2>>2)+r25];if((r50|0)==-2){r71=r43;break L3415}else{r42=r44;r43=r50}}}}while(0);r40=(r71<<2)+r30|0;HEAP32[r40>>2]=HEAP32[r40>>2]+1|0;r69=r39;r70=r45}if((r70|0)==(r69|0)){r72=0;break}else{r41=0}}L3420:do{if(r5==2355){r5=0;L3422:do{if(r13){r30=0;while(1){r33=(r30<<2)+r27|0;r36=HEAP32[r33>>2];if((r36|0)>-1&(r36|0)<(r8|0)){r73=r36}else{___assert_func(72032,608,73476,70740);r73=HEAP32[r33>>2]}HEAP32[(r73<<2>>2)+r25]=r30;r33=r30+1|0;if((r33|0)==(r7|0)){break L3422}else{r30=r33}}}}while(0);r45=_malloc(r10);if((r45|0)==0){r5=2400;break L3286}r39=r45;L3430:do{if(r13){r45=0;while(1){HEAP32[r39+(r45<<2)>>2]=6;r30=r45+1|0;if((r30|0)==(r7|0)){r74=0;break}else{r45=r30}}while(1){_edsf_merge(r39,r74,HEAP32[(HEAP32[(r74<<2>>2)+r28]<<2>>2)+r25],0);r45=r74+1|0;if((r45|0)==(r7|0)){r75=0;break}else{r74=r45}}while(1){HEAP32[(r75<<2>>2)+r25]=6;r45=r75+1|0;if((r45|0)==(r7|0)){break L3430}else{r75=r45}}}}while(0);L3438:do{if(r17){r45=0;while(1){L3441:do{if(r18){r30=Math.imul(r45,r1);r33=0;r36=1;while(1){r38=r33+r30|0;r21=r36+r30|0;if((HEAP32[(r38<<2>>2)+r28]|0)==(HEAP32[(r21<<2>>2)+r28]|0)){_edsf_merge(r24,r38,r21,0)}r21=r36+1|0;if((r21|0)==(r1|0)){break L3441}else{r33=r36;r36=r21}}}}while(0);r36=r45+1|0;if((r36|0)==(r2|0)){break L3438}else{r45=r36}}}}while(0);L3450:do{if(r16){r45=0;while(1){L3453:do{if(r19){r36=0;r33=1;while(1){r30=Math.imul(r36,r1)+r45|0;r21=HEAP32[(r30<<2>>2)+r28];r38=Math.imul(r33,r1)+r45|0;if((r21|0)==(HEAP32[(r38<<2>>2)+r28]|0)){_edsf_merge(r24,r30,r38,0)}r38=r33+1|0;if((r38|0)==(r2|0)){break L3453}else{r36=r33;r33=r38}}}}while(0);r33=r45+1|0;if((r33|0)==(r1|0)){break L3450}else{r45=r33}}}}while(0);if(r13){r76=0}else{r72=r39;break}while(1){r45=(r76<<2)+r39|0;r33=HEAP32[r45>>2];do{if((r33&2|0)==0){r36=0;r38=r33;while(1){r77=r38&1^r36;r78=r38>>2;r30=HEAP32[r39+(r78<<2)>>2];if((r30&2|0)==0){r36=r77;r38=r30}else{break}}L3467:do{if((r78|0)==(r76|0)){r79=r77;r80=r76}else{r38=r78<<2;r36=r33>>2;r30=r77^r33&1;HEAP32[r45>>2]=r77|r38;if((r36|0)==(r78|0)){r79=r30;r80=r78;break}else{r81=r36;r82=r30}while(1){r30=(r81<<2)+r39|0;r36=HEAP32[r30>>2];r21=r36>>2;r22=r36&1^r82;HEAP32[r30>>2]=r82|r38;if((r21|0)==(r78|0)){r79=r22;r80=r78;break L3467}else{r81=r21;r82=r22}}}}while(0);if((r79|0)==0){r83=r80;break}___assert_func(71932,137,73432,71684);r83=r80}else{r83=r76}}while(0);if((r83|0)<=-1){___assert_func(71932,110,73432,72128)}r45=(r83<<2)+r24|0;r33=HEAP32[r45>>2];do{if((r33&2|0)==0){r38=0;r22=r33;while(1){r84=r22&1^r38;r85=r22>>2;r21=HEAP32[(r85<<2>>2)+r25];if((r21&2|0)==0){r38=r84;r22=r21}else{break}}L3481:do{if((r85|0)==(r83|0)){r86=r84;r87=r83}else{r22=r85<<2;r38=r33>>2;r21=r84^r33&1;HEAP32[r45>>2]=r84|r22;if((r38|0)==(r85|0)){r86=r21;r87=r85;break}else{r88=r38;r89=r21}while(1){r21=(r88<<2)+r24|0;r38=HEAP32[r21>>2];r30=r38>>2;r36=r38&1^r89;HEAP32[r21>>2]=r89|r22;if((r30|0)==(r85|0)){r86=r36;r87=r85;break L3481}else{r88=r30;r89=r36}}}}while(0);if((r86|0)==0){r90=r87;break}___assert_func(71932,137,73432,71684);r90=r87}else{r90=r83}}while(0);r45=(r76<<2)+r24|0;r33=HEAP32[r45>>2];do{if((r33&2|0)==0){r22=0;r36=r33;while(1){r91=r36&1^r22;r92=r36>>2;r30=HEAP32[(r92<<2>>2)+r25];if((r30&2|0)==0){r22=r91;r36=r30}else{break}}L3492:do{if((r92|0)==(r76|0)){r93=r91;r94=r76}else{r36=r92<<2;r22=r33>>2;r30=r91^r33&1;HEAP32[r45>>2]=r91|r36;if((r22|0)==(r92|0)){r93=r30;r94=r92;break}else{r95=r22;r96=r30}while(1){r30=(r95<<2)+r24|0;r22=HEAP32[r30>>2];r21=r22>>2;r38=r22&1^r96;HEAP32[r30>>2]=r96|r36;if((r21|0)==(r92|0)){r93=r38;r94=r92;break L3492}else{r95=r21;r96=r38}}}}while(0);if((r93|0)==0){r97=r94;break}___assert_func(71932,137,73432,71684);r97=r94}else{r97=r76}}while(0);if((r90|0)!=(r97|0)){___assert_func(72032,632,73476,70260)}r45=r76+1|0;if((r45|0)==(r7|0)){r72=r39;break L3420}else{r76=r45}}}}while(0);_free(r20);_free(r23);_free(r26);_free(r29);_free(r32);_free(r34);_free(r37);if((r72|0)!=0){r5=2456;break}}if(r5==2317){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r5==2315){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r5==2321){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r5==2323){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r5==2319){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r5==2456){STACKTOP=r6;return r72}else if(r5==2400){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r5==2313){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r5==2311){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}function _addremcommon(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r7=0;r8=STACKTOP;STACKTOP=STACKTOP+32|0;r9=r8>>2;r10=0;while(1){r11=r10&3;do{if((r11|0)==2){r12=0;r7=2462}else{if((r10|0)>2){r13=(r10|0)<6?1:-1}else{r13=-1}if((r11|0)==0){r14=0;r15=r13;break}else{r12=r13;r7=2462;break}}}while(0);if(r7==2462){r7=0;r14=(r10|0)<4?-1:1;r15=r12}r11=r15+r3|0;r16=r14+r4|0;if((r16|0)<(r2|0)&(((r11|0)>=(r1|0)|(r11|0)<0|(r16|0)<0)^1)){r17=(Math.imul(r16,r1)+r11<<2)+r5|0;HEAP32[(r10<<2>>2)+r9]=HEAP32[r17>>2]}else{HEAP32[(r10<<2>>2)+r9]=-1}r17=r10+1|0;if((r17|0)==8){break}else{r10=r17}}r10=(HEAP32[r9]|0)==(r6|0);r5=HEAP32[r9+2];do{if(r10){r18=r5}else{if((r5|0)==(r6|0)){r18=r6;break}if((HEAP32[r9+4]|0)==(r6|0)){r18=r5;break}if((HEAP32[r9+6]|0)==(r6|0)){r18=r5;break}else{r19=0}STACKTOP=r8;return r19}}while(0);r5=(HEAP32[r9+1]|0)==(r6|0);r1=(r18|0)==(r6|0);r18=(HEAP32[r9+3]|0)==(r6|0);r2=(HEAP32[r9+4]|0)==(r6|0);r4=(HEAP32[r9+5]|0)==(r6|0);r14=(HEAP32[r9+6]|0)==(r6|0);r3=(HEAP32[r9+7]|0)==(r6|0);r19=(((r3^r10)&1)+((r14^r3)&1)+((r4^r14)&1)+((r2^r4)&1)+((r18^r2)&1)+((r1^r18)&1)+((r5^r1)&1)+((r10^r5)&1)|0)==2&1;STACKTOP=r8;return r19}function _status_bar(r1,r2){var r3,r4,r5,r6;r3=r1|0;if((HEAP32[HEAP32[r3>>2]+40>>2]|0)==0){return}r4=r1+24|0;r5=HEAP32[r4>>2];if((r5|0)==0){___assert_func(72020,198,72904,71700);r6=HEAP32[r4>>2]}else{r6=r5}r5=_midend_rewrite_statusbar(r6,r2);r2=(r1+28|0)>>2;r6=HEAP32[r2];do{if((r6|0)!=0){if((_strcmp(r5,r6)|0)!=0){break}if((r5|0)==0){return}_free(r5);return}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+40>>2]](HEAP32[r1+4>>2],r5);r1=HEAP32[r2];if((r1|0)!=0){_free(r1)}HEAP32[r2]=r5;return}function _edsf_merge(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r5=r1>>2;if((r2|0)<=-1){___assert_func(71932,110,73432,72128)}r6=HEAP32[(r2<<2>>2)+r5];do{if((r6&2|0)==0){r7=0;r8=r6;while(1){r9=r8&1^r7;r10=r8>>2;r11=HEAP32[(r10<<2>>2)+r5];if((r11&2|0)==0){r7=r9;r8=r11}else{break}}L3563:do{if((r10|0)==(r2|0)){r12=r9;r13=r2}else{r8=r10<<2;r7=r9;r11=r2;r14=r6;while(1){r15=r14>>2;r16=r14&1^r7;HEAP32[(r11<<2>>2)+r5]=r7|r8;if((r15|0)==(r10|0)){r12=r16;r13=r10;break L3563}r7=r16;r11=r15;r14=HEAP32[(r15<<2>>2)+r5]}}}while(0);if((r12|0)==0){r17=r9;r18=r13;break}___assert_func(71932,137,73432,71684);r17=r9;r18=r13}else{r17=0;r18=r2}}while(0);if((HEAP32[(r18<<2>>2)+r5]&2|0)==0){___assert_func(71932,152,73420,71336)}r2=r17^r4;if((r3|0)<=-1){___assert_func(71932,110,73432,72128)}r4=HEAP32[(r3<<2>>2)+r5];do{if((r4&2|0)==0){r17=0;r13=r4;while(1){r19=r13&1^r17;r20=r13>>2;r9=HEAP32[(r20<<2>>2)+r5];if((r9&2|0)==0){r17=r19;r13=r9}else{break}}L3581:do{if((r20|0)==(r3|0)){r21=r19;r22=r3}else{r13=r20<<2;r17=r19;r9=r3;r12=r4;while(1){r10=r12>>2;r6=r12&1^r17;HEAP32[(r9<<2>>2)+r5]=r17|r13;if((r10|0)==(r20|0)){r21=r6;r22=r20;break L3581}r17=r6;r9=r10;r12=HEAP32[(r10<<2>>2)+r5]}}}while(0);if((r21|0)==0){r23=r19;r24=r22;break}___assert_func(71932,137,73432,71684);r23=r19;r24=r22}else{r23=0;r24=r3}}while(0);if((HEAP32[(r24<<2>>2)+r5]&2|0)==0){___assert_func(71932,155,73420,71052)}r3=r23^r2;r22=(r2|0)==(r23|0);do{if((r18|0)==(r24|0)){if(r22){r25=r18;r26=r18;break}___assert_func(71932,161,73420,70728);r25=r18;r26=r18}else{if(!(r22|(r3|0)==1)){___assert_func(71932,163,73420,70228)}r19=(r18|0)>(r24|0);r21=r19?r18:r24;r20=r19?r24:r18;r19=(r21<<2)+r1|0;r4=(r20<<2)+r1|0;HEAP32[r4>>2]=HEAP32[r4>>2]+(HEAP32[r19>>2]&-4)|0;HEAP32[r19>>2]=r20<<2|(r2|0)!=(r23|0)&1;r25=r20;r26=r21}}while(0);if((r26|0)<=-1){___assert_func(71932,110,73432,72128)}r23=HEAP32[(r26<<2>>2)+r5];do{if((r23&2|0)==0){r2=0;r1=r23;while(1){r27=r1&1^r2;r28=r1>>2;r18=HEAP32[(r28<<2>>2)+r5];if((r18&2|0)==0){r2=r27;r1=r18}else{break}}L3607:do{if((r28|0)==(r26|0)){r29=r27;r30=r26}else{r1=r28<<2;r2=r27;r18=r26;r24=r23;while(1){r22=r24>>2;r21=r24&1^r2;HEAP32[(r18<<2>>2)+r5]=r2|r1;if((r22|0)==(r28|0)){r29=r21;r30=r28;break L3607}r2=r21;r18=r22;r24=HEAP32[(r22<<2>>2)+r5]}}}while(0);if((r29|0)==0){r31=r27;r32=r30;break}___assert_func(71932,137,73432,71684);r31=r27;r32=r30}else{r31=0;r32=r26}}while(0);if((r32|0)!=(r25|0)){___assert_func(71932,188,73420,69772)}if((r31|0)==(r3|0)){return}___assert_func(71932,189,73420,69372);return}function _init_game(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3,r5=r4>>2;r6=_midend_new(r1,65536,68916,r2);_frontend_set_game_info(r1,r6,72404,1,1,1,0,0,1,1);r7=_midend_num_presets(r6);HEAP32[r5]=r7;L3623:do{if((r7|0)>0){r8=r6+24|0;r9=r6+16|0;r10=r6+12|0;r11=0;while(1){if((HEAP32[r8>>2]|0)<=(r11|0)){___assert_func(71324,1056,73224,71884)}_frontend_add_preset(r1,HEAP32[HEAP32[r9>>2]+(r11<<2)>>2],HEAP32[HEAP32[r10>>2]+(r11<<2)>>2]);r12=r11+1|0;if((r12|0)<(HEAP32[r5]|0)){r11=r12}else{break L3623}}}}while(0);r1=_midend_colours(r6,r4)>>2;if((HEAP32[r5]|0)>0){r13=0}else{STACKTOP=r3;return}while(1){r4=r13*3&-1;_canvas_set_palette_entry(r2,r13,HEAPF32[(r4<<2>>2)+r1]*255&-1,HEAPF32[(r4+1<<2>>2)+r1]*255&-1,HEAPF32[(r4+2<<2>>2)+r1]*255&-1);r4=r13+1|0;if((r4|0)<(HEAP32[r5]|0)){r13=r4}else{break}}STACKTOP=r3;return}function _print_mono_colour(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=STACKTOP;r4=r2|0;r2=(r1+12|0)>>2;r5=HEAP32[r2];r6=r1+16|0;do{if((r5|0)<(HEAP32[r6>>2]|0)){r7=r5;r8=HEAP32[r1+8>>2]}else{r9=r5+16|0;HEAP32[r6>>2]=r9;r10=r1+8|0;r11=HEAP32[r10>>2];r12=r9*24&-1;if((r11|0)==0){r13=_malloc(r12)}else{r13=_realloc(r11,r12)}if((r13|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r12=r13;HEAP32[r10>>2]=r12;r7=HEAP32[r2];r8=r12;break}}}while(0);r13=(r1+8|0)>>2;HEAP32[r8+(r7*24&-1)>>2]=-1;HEAP32[HEAP32[r13]+(HEAP32[r2]*24&-1)+4>>2]=0;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+8>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+12>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+16>>2]=r4;HEAPF32[HEAP32[r13]+(HEAP32[r2]*24&-1)+20>>2]=r4;r4=HEAP32[r2];HEAP32[r2]=r4+1|0;STACKTOP=r3;return r4}function _print_grey_colour(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=STACKTOP;r4=(r1+12|0)>>2;r5=HEAP32[r4];r6=r1+16|0;do{if((r5|0)<(HEAP32[r6>>2]|0)){r7=r5;r8=HEAP32[r1+8>>2]}else{r9=r5+16|0;HEAP32[r6>>2]=r9;r10=r1+8|0;r11=HEAP32[r10>>2];r12=r9*24&-1;if((r11|0)==0){r13=_malloc(r12)}else{r13=_realloc(r11,r12)}if((r13|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r12=r13;HEAP32[r10>>2]=r12;r7=HEAP32[r4];r8=r12;break}}}while(0);r13=(r1+8|0)>>2;HEAP32[r8+(r7*24&-1)>>2]=-1;HEAP32[HEAP32[r13]+(HEAP32[r4]*24&-1)+4>>2]=0;HEAPF32[HEAP32[r13]+(HEAP32[r4]*24&-1)+8>>2]=r2;HEAPF32[HEAP32[r13]+(HEAP32[r4]*24&-1)+12>>2]=r2;HEAPF32[HEAP32[r13]+(HEAP32[r4]*24&-1)+16>>2]=r2;HEAPF32[HEAP32[r13]+(HEAP32[r4]*24&-1)+20>>2]=r2;r2=HEAP32[r4];HEAP32[r4]=r2+1|0;STACKTOP=r3;return r2}function _fatal(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+4|0;r4=r3;_fwrite(71828,13,1,HEAP32[_stderr>>2]);HEAP32[r4>>2]=r2;_fprintf(HEAP32[_stderr>>2],r1,HEAP32[r4>>2]);_fputc(10,HEAP32[_stderr>>2]);_exit(1)}function _canvas_text_fallback(r1,r2,r3){r3=STACKTOP;r1=HEAP32[r2>>2];r2=_malloc(_strlen(r1)+1|0);if((r2|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r2,r1);STACKTOP=r3;return r2}}function _midend_new(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r5=STACKTOP;STACKTOP=STACKTOP+164|0;r6=r5;r7=r5+80;r8=r5+160;r9=_malloc(144),r10=r9>>2;if((r9|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}r11=r9;r12=_malloc(8);if((r12|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_gettimeofday(r12,0);HEAP32[r10]=r1;r1=(r9+8|0)>>2;HEAP32[r1]=r2;r13=_random_new(r12,8);HEAP32[r10+1]=r13;r13=(r9+52|0)>>2;HEAP32[r13]=0;HEAP32[r13+1]=0;HEAP32[r13+2]=0;HEAP32[r13+3]=0;r13=FUNCTION_TABLE[HEAP32[r2+12>>2]]();r14=r9+68|0;HEAP32[r14>>2]=r13;r13=r6|0;_sprintf(r13,71756,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r1]>>2],tempInt));r15=HEAP8[r13];L3672:do{if(r15<<24>>24==0){r16=0}else{r17=0;r18=0;r19=r13;r20=r15;while(1){if((_isspace(r20&255)|0)==0){r21=_toupper(HEAPU8[r19])&255;HEAP8[r6+r17|0]=r21;r22=r17+1|0}else{r22=r17}r21=r18+1|0;r23=r6+r21|0;r24=HEAP8[r23];if(r24<<24>>24==0){r16=r22;break L3672}else{r17=r22;r18=r21;r19=r23;r20=r24}}}}while(0);HEAP8[r6+r16|0]=0;r16=_getenv(r13);if((r16|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r1]+20>>2]](HEAP32[r14>>2],r16)}HEAP32[r10+18]=0;r16=(r9+32|0)>>2;HEAP32[r16]=0;HEAP32[r16+1]=0;HEAP32[r16+2]=0;HEAP32[r16+3]=0;HEAP32[r10+12]=2;r16=(r9+12|0)>>2;HEAP32[r10+31]=0;HEAP32[r10+35]=0;HEAP32[r10+34]=0;HEAP32[r10+33]=0;HEAP32[r16]=0;HEAP32[r16+1]=0;HEAP32[r16+2]=0;HEAP32[r16+3]=0;HEAP32[r16+4]=0;_memset(r9+76|0,0,44);do{if((r3|0)==0){HEAP32[r10+30]=0}else{r16=_malloc(32),r14=r16>>2;if((r16|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r14]=r3;HEAP32[r14+1]=r4;HEAP32[r14+2]=0;HEAP32[r14+4]=0;HEAP32[r14+3]=0;HEAPF32[r14+5]=1;HEAP32[r14+6]=r11;HEAP32[r14+7]=0;HEAP32[r10+30]=r16;break}}}while(0);r10=r9+128|0;HEAP32[r10>>2]=HEAP32[r2+120>>2];r2=r7|0;_sprintf(r2,72064,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r1]>>2],tempInt));r1=HEAP8[r2];L3689:do{if(r1<<24>>24==0){r25=0}else{r9=0;r4=0;r3=r2;r16=r1;while(1){if((_isspace(r16&255)|0)==0){r14=_toupper(HEAPU8[r3])&255;HEAP8[r7+r4|0]=r14;r26=r4+1|0}else{r26=r4}r14=r9+1|0;r13=r7+r14|0;r6=HEAP8[r13];if(r6<<24>>24==0){r25=r26;break L3689}else{r9=r14;r4=r26;r3=r13;r16=r6}}}}while(0);HEAP8[r7+r25|0]=0;r25=_getenv(r2);if((r25|0)==0){_free(r12);STACKTOP=r5;return r11}r2=(_sscanf(r25,71512,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=r8,tempInt))|0)==1;r25=HEAP32[r8>>2];if(!(r2&(r25|0)>0)){_free(r12);STACKTOP=r5;return r11}HEAP32[r10>>2]=r25;_free(r12);STACKTOP=r5;return r11}function _midend_can_undo(r1){return(HEAP32[r1+60>>2]|0)>1&1}function _midend_can_redo(r1){return(HEAP32[r1+60>>2]|0)<(HEAP32[r1+52>>2]|0)&1}function _midend_size(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r5=r1>>2;r6=STACKTOP;STACKTOP=STACKTOP+8|0;r7=r6;r8=r6+4;r9=(r1+76|0)>>2;r10=HEAP32[r9];do{if((r10|0)!=0){if((HEAP32[r5+33]|0)<=0){break}r11=r1+8|0;r12=r1+120|0;FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+140>>2]](HEAP32[r12>>2],r10);r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+136>>2]](HEAP32[r12>>2],HEAP32[HEAP32[r5+16]>>2]);HEAP32[r9]=r13}}while(0);r10=(r4|0)!=0;L3710:do{if(r10){r4=r1+8|0;r13=r1+68|0;r12=1;while(1){r11=r12<<1;FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+124>>2]](HEAP32[r13>>2],r11,r7,r8);if((HEAP32[r7>>2]|0)>(HEAP32[r2>>2]|0)){r14=r11;r15=r4,r16=r15>>2;r17=r13,r18=r17>>2;break L3710}if((HEAP32[r8>>2]|0)>(HEAP32[r3>>2]|0)){r14=r11;r15=r4,r16=r15>>2;r17=r13,r18=r17>>2;break L3710}else{r12=r11}}}else{r14=HEAP32[r5+32]+1|0;r15=r1+8|0,r16=r15>>2;r17=r1+68|0,r18=r17>>2}}while(0);r17=1;r15=r14;L3717:while(1){r19=r17;while(1){if((r15-r19|0)<=1){break L3717}r14=(r19+r15|0)/2&-1;FUNCTION_TABLE[HEAP32[HEAP32[r16]+124>>2]](HEAP32[r18],r14,r7,r8);if((HEAP32[r7>>2]|0)>(HEAP32[r2>>2]|0)){r17=r19;r15=r14;continue L3717}if((HEAP32[r8>>2]|0)>(HEAP32[r3>>2]|0)){r17=r19;r15=r14;continue L3717}else{r19=r14}}}r15=r1+132|0;HEAP32[r15>>2]=r19;if(r10){HEAP32[r5+32]=r19}if((r19|0)>0){r10=r1+136|0;r17=r1+140|0;FUNCTION_TABLE[HEAP32[HEAP32[r16]+124>>2]](HEAP32[r18],r19,r10,r17);FUNCTION_TABLE[HEAP32[HEAP32[r16]+128>>2]](HEAP32[r5+30],HEAP32[r9],HEAP32[r18],HEAP32[r15>>2]);r15=r10;r10=r17;r17=HEAP32[r15>>2];HEAP32[r2>>2]=r17;r18=HEAP32[r10>>2];HEAP32[r3>>2]=r18;STACKTOP=r6;return}else{r15=r1+136|0;r10=r1+140|0;r17=HEAP32[r15>>2];HEAP32[r2>>2]=r17;r18=HEAP32[r10>>2];HEAP32[r3>>2]=r18;STACKTOP=r6;return}}function _midend_set_params(r1,r2){var r3,r4;r3=r1+8|0;r4=r1+68|0;FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+28>>2]](HEAP32[r4>>2]);r1=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+32>>2]](r2);HEAP32[r4>>2]=r1;return}function _midend_get_params(r1){return FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+32>>2]](HEAP32[r1+68>>2])}function _midend_force_redraw(r1){var r2,r3,r4,r5,r6,r7;r2=(r1+76|0)>>2;r3=HEAP32[r2];r4=(r1+8|0)>>2;if((r3|0)==0){r5=r1+120|0}else{r6=r1+120|0;FUNCTION_TABLE[HEAP32[HEAP32[r4]+140>>2]](HEAP32[r6>>2],r3);r5=r6}r6=FUNCTION_TABLE[HEAP32[HEAP32[r4]+136>>2]](HEAP32[r5>>2],HEAP32[HEAP32[r1+64>>2]>>2]);HEAP32[r2]=r6;r6=r1+132|0;r3=HEAP32[r6>>2];if((r3|0)<=0){_midend_redraw(r1);return}r7=r1+68|0;FUNCTION_TABLE[HEAP32[HEAP32[r4]+124>>2]](HEAP32[r7>>2],r3,r1+136|0,r1+140|0);FUNCTION_TABLE[HEAP32[HEAP32[r4]+128>>2]](HEAP32[r5>>2],HEAP32[r2],HEAP32[r7>>2],HEAP32[r6>>2]);_midend_redraw(r1);return}function _midend_redraw(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r2=r1>>2;r3=0;r4=(r1+120|0)>>2;if((HEAP32[r4]|0)==0){___assert_func(71324,869,73164,72360)}r5=(r1+60|0)>>2;if((HEAP32[r5]|0)<=0){return}r6=(r1+76|0)>>2;if((HEAP32[r6]|0)==0){return}r7=HEAP32[r4];FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+32>>2]](HEAP32[r7+4>>2]);r7=r1+84|0;r8=HEAP32[r7>>2];do{if((r8|0)==0){r3=2638}else{r9=HEAPF32[r2+22];if(r9<=0){r3=2638;break}r10=r1+92|0;r11=HEAPF32[r10>>2];if(r11>=r9){r3=2638;break}r9=r1+104|0;r12=HEAP32[r9>>2];if((r12|0)==0){___assert_func(71324,875,73164,72212);r13=HEAP32[r7>>2];r14=HEAP32[r9>>2];r15=HEAPF32[r10>>2]}else{r13=r8;r14=r12;r15=r11}FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+144>>2]](HEAP32[r4],HEAP32[r6],r13,HEAP32[HEAP32[r2+16]+((HEAP32[r5]-1)*12&-1)>>2],r14,HEAP32[r2+20],r15,HEAPF32[r2+25]);break}}while(0);if(r3==2638){FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+144>>2]](HEAP32[r4],HEAP32[r6],0,HEAP32[HEAP32[r2+16]+((HEAP32[r5]-1)*12&-1)>>2],1,HEAP32[r2+20],0,HEAPF32[r2+25])}r2=HEAP32[r4];FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+36>>2]](HEAP32[r2+4>>2]);return}function _midend_new_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r2=r1>>2;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+104|0;r5=r4;r6=r4+16;r7=r4+20;r8=r4+100;r9=(r1+52|0)>>2;r10=HEAP32[r9];L3765:do{if((r10|0)>0){r11=r1+8|0;r12=r1+64|0;r13=r10;while(1){r14=r13-1|0;HEAP32[r9]=r14;FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+68>>2]](HEAP32[HEAP32[r12>>2]+(r14*12&-1)>>2]);r14=HEAP32[r9];r15=HEAP32[HEAP32[r12>>2]+(r14*12&-1)+4>>2];if((r15|0)==0){r16=r14}else{_free(r15);r16=HEAP32[r9]}if((r16|0)>0){r13=r16}else{r17=r16;break L3765}}}else{r17=r10}}while(0);r10=(r1+76|0)>>2;r16=HEAP32[r10];if((r16|0)==0){r18=r17}else{FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+140>>2]](HEAP32[r2+30],r16);r18=HEAP32[r9]}if((r18|0)!=0){___assert_func(71324,349,73208,71032)}r18=(r1+48|0)>>2;r16=HEAP32[r18];do{if((r16|0)==0){HEAP32[r18]=2;r3=2669;break}else if((r16|0)==1){HEAP32[r18]=2;break}else{HEAP8[r5+15|0]=0;r17=r1+4|0;r13=HEAP32[r17>>2];while(1){r19=_random_bits(r13,7);if(r19>>>0<126){break}}r13=Math.floor((r19>>>0)/14)+49&255;r12=r5|0;HEAP8[r12]=r13;r13=1;while(1){r11=HEAP32[r17>>2];while(1){r20=_random_bits(r11,7);if(r20>>>0<120){break}}r11=Math.floor((r20>>>0)/12)+48&255;HEAP8[r5+r13|0]=r11;r11=r13+1|0;if((r11|0)==15){break}else{r13=r11}}r13=r1+40|0;r17=HEAP32[r13>>2];if((r17|0)!=0){_free(r17)}r17=_malloc(_strlen(r12)+1|0);if((r17|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r17,r12);HEAP32[r13>>2]=r17;r17=r1+72|0;r13=HEAP32[r17>>2];r11=r1+8|0;if((r13|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+28>>2]](r13)}r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+32>>2]](HEAP32[r2+17]);HEAP32[r17>>2]=r13;r3=2669;break}}while(0);do{if(r3==2669){r5=r1+32|0;r20=HEAP32[r5>>2];if((r20|0)!=0){_free(r20)}r20=r1+36|0;r19=HEAP32[r20>>2];if((r19|0)!=0){_free(r19)}r19=r1+44|0;r18=HEAP32[r19>>2];if((r18|0)!=0){_free(r18)}HEAP32[r19>>2]=0;r18=HEAP32[r2+10];r16=_random_new(r18,_strlen(r18));r18=FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+52>>2]](HEAP32[r2+18],r16,r19,(HEAP32[r2+30]|0)!=0&1);HEAP32[r5>>2]=r18;HEAP32[r20>>2]=0;if((r16|0)==0){break}_free(r16|0)}}while(0);r16=HEAP32[r9];r20=r1+56|0;do{if((r16|0)<(HEAP32[r20>>2]|0)){r18=r1+64|0,r21=r18>>2}else{r5=r16+128|0;HEAP32[r20>>2]=r5;r19=r1+64|0;r13=HEAP32[r19>>2];r17=r5*12&-1;if((r13|0)==0){r22=_malloc(r17)}else{r22=_realloc(r13,r17)}if((r22|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r19>>2]=r22;r18=r19,r21=r18>>2;break}}}while(0);r22=(r1+8|0)>>2;r20=(r1+68|0)>>2;r16=FUNCTION_TABLE[HEAP32[HEAP32[r22]+60>>2]](r1,HEAP32[r20],HEAP32[r2+8]);HEAP32[HEAP32[r21]+(HEAP32[r9]*12&-1)>>2]=r16;r16=HEAP32[r22];do{if((HEAP32[r16+72>>2]|0)!=0){r18=HEAP32[r2+11];if((r18|0)==0){break}HEAP32[r6>>2]=0;r19=HEAP32[HEAP32[r21]>>2];r17=FUNCTION_TABLE[HEAP32[r16+76>>2]](r19,r19,r18,r6);if(!((r17|0)!=0&(HEAP32[r6>>2]|0)==0)){___assert_func(71324,430,73208,70712)}r18=FUNCTION_TABLE[HEAP32[HEAP32[r22]+116>>2]](HEAP32[HEAP32[r21]>>2],r17);if((r18|0)==0){___assert_func(71324,432,73208,70224)}FUNCTION_TABLE[HEAP32[HEAP32[r22]+68>>2]](r18);if((r17|0)==0){break}_free(r17)}}while(0);r6=HEAP32[17100];do{if((r6|0)<0){r16=r7|0;_sprintf(r16,69756,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r22]>>2],tempInt));r17=HEAP8[r16];L3839:do{if(r17<<24>>24==0){r23=0}else{r18=0;r19=0;r13=r16;r5=r17;while(1){if((_isspace(r5&255)|0)==0){r11=_toupper(HEAPU8[r13])&255;HEAP8[r7+r18|0]=r11;r24=r18+1|0}else{r24=r18}r11=r19+1|0;r15=r7+r11|0;r14=HEAP8[r15];if(r14<<24>>24==0){r23=r24;break L3839}else{r18=r24;r19=r11;r13=r15;r5=r14}}}}while(0);HEAP8[r7+r23|0]=0;if((_getenv(r16)|0)==0){HEAP32[17100]=0;break}else{_fwrite(69344,26,1,HEAP32[_stderr>>2]);HEAP32[17100]=1;r3=2702;break}}else{if((r6|0)==0){break}else{r3=2702;break}}}while(0);do{if(r3==2702){HEAP32[r8>>2]=0;r6=HEAP32[HEAP32[r21]>>2];r23=FUNCTION_TABLE[HEAP32[HEAP32[r22]+76>>2]](r6,r6,0,r8);if(!((r23|0)!=0&(HEAP32[r8>>2]|0)==0)){___assert_func(71324,478,73208,70712)}r6=FUNCTION_TABLE[HEAP32[HEAP32[r22]+116>>2]](HEAP32[HEAP32[r21]>>2],r23);if((r6|0)==0){___assert_func(71324,480,73208,70224)}FUNCTION_TABLE[HEAP32[HEAP32[r22]+68>>2]](r6);if((r23|0)==0){break}_free(r23)}}while(0);HEAP32[HEAP32[r21]+(HEAP32[r9]*12&-1)+4>>2]=0;HEAP32[HEAP32[r21]+(HEAP32[r9]*12&-1)+8>>2]=0;HEAP32[r9]=HEAP32[r9]+1|0;r9=r1+60|0;HEAP32[r9>>2]=1;r8=r1+120|0;r23=FUNCTION_TABLE[HEAP32[HEAP32[r22]+136>>2]](HEAP32[r8>>2],HEAP32[HEAP32[r21]>>2]);HEAP32[r10]=r23;r23=r1+132|0;r6=HEAP32[r23>>2];if((r6|0)>0){FUNCTION_TABLE[HEAP32[HEAP32[r22]+124>>2]](HEAP32[r20],r6,r1+136|0,r1+140|0);FUNCTION_TABLE[HEAP32[HEAP32[r22]+128>>2]](HEAP32[r8>>2],HEAP32[r10],HEAP32[r20],HEAP32[r23>>2])}HEAPF32[r2+28]=0;r23=r1+80|0;r20=HEAP32[r23>>2];if((r20|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r22]+96>>2]](r20)}r20=FUNCTION_TABLE[HEAP32[HEAP32[r22]+92>>2]](HEAP32[HEAP32[r21]>>2]);HEAP32[r23>>2]=r20;r23=HEAP32[r22];do{if((HEAP32[r23+180>>2]|0)==0){HEAP32[r2+27]=0;r3=2715;break}else{r22=(FUNCTION_TABLE[HEAP32[r23+184>>2]](HEAP32[HEAP32[r21]+((HEAP32[r9>>2]-1)*12&-1)>>2],r20)|0)!=0;HEAP32[r2+27]=r22&1;if(r22){break}else{r3=2715;break}}}while(0);do{if(r3==2715){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r2+22]!=0){break}_deactivate_timer(HEAP32[r2]);r25=r1+124|0;HEAP32[r25>>2]=0;STACKTOP=r4;return}}while(0);_activate_timer(HEAP32[r2]);r25=r1+124|0;HEAP32[r25>>2]=0;STACKTOP=r4;return}function _midend_finish_move(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r2=r1>>2;r3=0;r4=(r1+84|0)>>2;r5=HEAP32[r4];r6=(r5|0)==0;do{if(r6){if((HEAP32[r2+15]|0)>1){r3=2724;break}else{break}}else{r3=2724}}while(0);do{if(r3==2724){r7=HEAP32[r2+26];if((r7|0)>0){r8=HEAP32[r2+15];r9=HEAP32[r2+16];if((HEAP32[r9+((r8-1)*12&-1)+8>>2]|0)==1){r10=r8;r11=r9}else{break}}else{if((r7|0)>=0){break}r9=HEAP32[r2+15];if((r9|0)>=(HEAP32[r2+13]|0)){break}r8=HEAP32[r2+16];if((HEAP32[r8+(r9*12&-1)+8>>2]|0)==1){r10=r9;r11=r8}else{break}}if(r6){r12=1;r13=HEAP32[r11+((r10-2)*12&-1)>>2]}else{r12=r7;r13=r5}r7=FUNCTION_TABLE[HEAP32[HEAP32[r2+2]+152>>2]](r13,HEAP32[r11+((r10-1)*12&-1)>>2],r12,HEAP32[r2+20]);if(r7<=0){break}HEAPF32[r2+25]=0;HEAPF32[r2+24]=r7}}while(0);r12=HEAP32[r4];r10=r1+8|0;if((r12|0)!=0){FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+68>>2]](r12)}HEAP32[r4]=0;r4=r1+88|0;HEAPF32[r4>>2]=0;HEAPF32[r2+23]=0;HEAP32[r2+26]=0;r1=HEAP32[r10>>2];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=2739;break}else{r10=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r2+16]+((HEAP32[r2+15]-1)*12&-1)>>2],HEAP32[r2+20])|0)!=0;HEAP32[r2+27]=r10&1;if(r10){break}else{r3=2739;break}}}while(0);do{if(r3==2739){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r4>>2]!=0){break}_deactivate_timer(HEAP32[r2]);return}}while(0);_activate_timer(HEAP32[r2]);return}function _midend_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12;r5=r1>>2;r6=(r4-515|0)>>>0<3;do{if(r6|(r4-518|0)>>>0<3){r7=HEAP32[r5+31];if((r7|0)==0){r8=1;return r8}if(r6){r9=1;r10=r7+3|0;break}else{r9=1;r10=r7+6|0;break}}else{if((r4-512|0)>>>0>=3){r9=1;r10=r4;break}r7=HEAP32[r5+31];if((r7|0)==0){r9=1;r10=r4;break}if((HEAP32[HEAP32[r5+2]+188>>2]&1<<r4-2048+(r7*3&-1)|0)==0){r9=(_midend_really_process_key(r1,r2,r3,r7+6|0)|0)!=0&1;r10=r4;break}else{r8=1;return r8}}}while(0);if((r10|0)==13|(r10|0)==10){r11=525}else{r11=r10}r10=(r11|0)==32?526:r11;r11=(r10|0)==127?8:r10;if((r9|0)==0){r12=0}else{r12=(_midend_really_process_key(r1,r2,r3,r11)|0)!=0}r3=r12&1;if((r11-518|0)>>>0<3){HEAP32[r5+31]=0;r8=r3;return r8}if((r11-512|0)>>>0>=3){r8=r3;return r8}HEAP32[r5+31]=r11;r8=r3;return r8}function _midend_restart_game(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r2=r1>>2;r3=0;r4=STACKTOP;r5=r1+84|0;do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=2771;break}else{break}}else{r3=2771}}while(0);if(r3==2771){_midend_finish_move(r1);_midend_redraw(r1)}r6=(r1+60|0)>>2;r7=HEAP32[r6];if((r7|0)>0){r8=r7}else{___assert_func(71324,586,73144,69036);r8=HEAP32[r6]}if((r8|0)==1){STACKTOP=r4;return}r8=(r1+8|0)>>2;r7=r1+32|0;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8]+60>>2]](r1,HEAP32[r2+17],HEAP32[r7>>2]);do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=2777;break}else{break}}else{r3=2777}}while(0);if(r3==2777){_midend_finish_move(r1);_midend_redraw(r1)}r5=(r1+52|0)>>2;r10=HEAP32[r5];L3952:do{if((r10|0)>(HEAP32[r6]|0)){r11=r1+64|0;r12=r10;while(1){r13=HEAP32[HEAP32[r8]+68>>2];r14=r12-1|0;HEAP32[r5]=r14;FUNCTION_TABLE[r13](HEAP32[HEAP32[r11>>2]+(r14*12&-1)>>2]);r14=HEAP32[r5];r13=HEAP32[HEAP32[r11>>2]+(r14*12&-1)+4>>2];if((r13|0)==0){r15=r14}else{_free(r13);r15=HEAP32[r5]}if((r15|0)>(HEAP32[r6]|0)){r12=r15}else{r16=r15;break L3952}}}else{r16=r10}}while(0);r10=r1+56|0;do{if((r16|0)<(HEAP32[r10>>2]|0)){r17=r16;r18=HEAP32[r2+16]}else{r15=r16+128|0;HEAP32[r10>>2]=r15;r12=r1+64|0;r11=HEAP32[r12>>2];r13=r15*12&-1;if((r11|0)==0){r19=_malloc(r13)}else{r19=_realloc(r11,r13)}if((r19|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r13=r19;HEAP32[r12>>2]=r13;r17=HEAP32[r5];r18=r13;break}}}while(0);r19=(r1+64|0)>>2;HEAP32[r18+(r17*12&-1)>>2]=r9;r9=HEAP32[r7>>2];r7=_malloc(_strlen(r9)+1|0);if((r7|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r7,r9);HEAP32[HEAP32[r19]+(HEAP32[r5]*12&-1)+4>>2]=r7;HEAP32[HEAP32[r19]+(HEAP32[r5]*12&-1)+8>>2]=3;r7=HEAP32[r5];r9=r7+1|0;HEAP32[r5]=r9;HEAP32[r6]=r9;r9=r1+80|0;r5=HEAP32[r9>>2];if((r5|0)!=0){r17=HEAP32[r19];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r5,HEAP32[r17+((r7-1)*12&-1)>>2],HEAP32[r17+(r7*12&-1)>>2])}r7=r1+88|0;HEAPF32[r7>>2]=0;_midend_finish_move(r1);_midend_redraw(r1);r1=HEAP32[r8];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=2798;break}else{r8=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r19]+((HEAP32[r6]-1)*12&-1)>>2],HEAP32[r9>>2])|0)!=0;HEAP32[r2+27]=r8&1;if(r8){break}else{r3=2798;break}}}while(0);do{if(r3==2798){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r7>>2]!=0){break}_deactivate_timer(HEAP32[r2]);STACKTOP=r4;return}}while(0);_activate_timer(HEAP32[r2]);STACKTOP=r4;return}function _midend_timer(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=r1>>2;r4=0;r5=r1+88|0;r6=HEAPF32[r5>>2];r7=r6>0;if(r7){r8=1}else{r8=HEAPF32[r3+24]>0}r9=r1+92|0;r10=HEAPF32[r9>>2]+r2;HEAPF32[r9>>2]=r10;do{if(r10>=r6|r6==0){if(r7){r4=2811;break}else{break}}else{if((HEAP32[r3+21]|0)!=0|r7^1){break}else{r4=2811;break}}}while(0);if(r4==2811){_midend_finish_move(r1)}r7=(r1+100|0)>>2;r6=HEAPF32[r7]+r2;HEAPF32[r7]=r6;r10=(r1+96|0)>>2;r9=HEAPF32[r10];if(r6>=r9|r9==0){HEAPF32[r10]=0;HEAPF32[r7]=0}if(r8){_midend_redraw(r1)}r8=(r1+108|0)>>2;do{if((HEAP32[r8]|0)!=0){r7=r1+112|0;r9=HEAPF32[r7>>2];r6=r9+r2;HEAPF32[r7>>2]=r6;if((r9&-1|0)==(r6&-1|0)){break}r6=HEAP32[r3+29];_status_bar(HEAP32[r3+30],(r6|0)==0?71880:r6)}}while(0);r2=HEAP32[r3+2];do{if((HEAP32[r2+180>>2]|0)==0){HEAP32[r8]=0;r4=2822;break}else{r1=(FUNCTION_TABLE[HEAP32[r2+184>>2]](HEAP32[HEAP32[r3+16]+((HEAP32[r3+15]-1)*12&-1)>>2],HEAP32[r3+20])|0)!=0;HEAP32[r8]=r1&1;if(r1){break}else{r4=2822;break}}}while(0);do{if(r4==2822){if(HEAPF32[r10]!=0){break}if(HEAPF32[r5>>2]!=0){break}_deactivate_timer(HEAP32[r3]);return}}while(0);_activate_timer(HEAP32[r3]);return}function _midend_colours(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r3=STACKTOP;STACKTOP=STACKTOP+92|0;r4=r3;r5=r3+80;r6=r3+84;r7=r3+88;r8=r1+8|0;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+132>>2]](HEAP32[r1>>2],r2),r1=r9>>2;if((HEAP32[r2>>2]|0)<=0){STACKTOP=r3;return r9}r10=r4|0;r11=0;while(1){_sprintf(r10,72004,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r8>>2]>>2],HEAP32[tempInt+4>>2]=r11,tempInt));r12=HEAP8[r10];L4023:do{if(r12<<24>>24==0){r13=0}else{r14=0;r15=0;r16=r10;r17=r12;while(1){if((_isspace(r17&255)|0)==0){r18=_toupper(HEAPU8[r16])&255;HEAP8[r4+r15|0]=r18;r19=r15+1|0}else{r19=r15}r18=r14+1|0;r20=r4+r18|0;r21=HEAP8[r20];if(r21<<24>>24==0){r13=r19;break L4023}else{r14=r18;r15=r19;r16=r20;r17=r21}}}}while(0);HEAP8[r4+r13|0]=0;r12=_getenv(r10);do{if((r12|0)!=0){if((_sscanf(r12,71968,(tempInt=STACKTOP,STACKTOP=STACKTOP+12|0,HEAP32[tempInt>>2]=r5,HEAP32[tempInt+4>>2]=r6,HEAP32[tempInt+8>>2]=r7,tempInt))|0)!=3){break}r17=r11*3&-1;HEAPF32[(r17<<2>>2)+r1]=(HEAP32[r5>>2]>>>0)/255;HEAPF32[(r17+1<<2>>2)+r1]=(HEAP32[r6>>2]>>>0)/255;HEAPF32[(r17+2<<2>>2)+r1]=(HEAP32[r7>>2]>>>0)/255}}while(0);r12=r11+1|0;if((r12|0)<(HEAP32[r2>>2]|0)){r11=r12}else{break}}STACKTOP=r3;return r9}function _midend_really_process_key(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r5=r1>>2;r6=0;r7=STACKTOP;r8=(r1+8|0)>>2;r9=(r1+60|0)>>2;r10=(r1+64|0)>>2;r11=FUNCTION_TABLE[HEAP32[HEAP32[r8]+64>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2]);r12=(r1+80|0)>>2;r13=FUNCTION_TABLE[HEAP32[HEAP32[r8]+112>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12],HEAP32[r5+19],r2,r3,r4);L4036:do{if((r13|0)==0){if((r4|0)==113|(r4|0)==81|(r4|0)==17){r14=0;r6=2909;break}else if((r4|0)==114|(r4|0)==82|(r4|0)==25|(r4|0)==18){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=2856;break}else{break}}else{r6=2856}}while(0);if(r6==2856){_midend_finish_move(r1);_midend_redraw(r1)}r3=HEAP32[r9];if((r3|0)>=(HEAP32[r5+13]|0)){r14=1;r6=2909;break}r2=HEAP32[r12];if((r2|0)==0){r15=r3}else{r16=HEAP32[r10];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r2,HEAP32[r16+((r3-1)*12&-1)>>2],HEAP32[r16+(r3*12&-1)>>2]);r15=HEAP32[r9]}HEAP32[r9]=r15+1|0;HEAP32[r5+26]=1;r6=2894;break}else if((r4|0)==117|(r4|0)==85|(r4|0)==31|(r4|0)==26){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=2850;break}else{break}}else{r6=2850}}while(0);if(r6==2850){_midend_finish_move(r1);_midend_redraw(r1)}r3=HEAP32[r9];r16=r3-1|0;r2=HEAP32[r10]>>2;r17=HEAP32[((r16*12&-1)+8>>2)+r2];if((r3|0)<=1){r14=1;r6=2909;break}r18=HEAP32[r12];if((r18|0)==0){r19=r3}else{FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r18,HEAP32[((r16*12&-1)>>2)+r2],HEAP32[(((r3-2)*12&-1)>>2)+r2]);r19=HEAP32[r9]}r2=r19-1|0;HEAP32[r9]=r2;HEAP32[r5+26]=-1;r20=r17;r21=r2;break}else if((r4|0)==19){if((HEAP32[HEAP32[r8]+72>>2]|0)==0){r14=1;r6=2909;break}if((_midend_solve(r1)|0)==0){r6=2894;break}else{r14=1;r6=2909;break}}else if((r4|0)==110|(r4|0)==78|(r4|0)==14){do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=2846;break}else{break}}else{r6=2846}}while(0);if(r6==2846){_midend_finish_move(r1);_midend_redraw(r1)}_midend_new_game(r1);_midend_redraw(r1);r14=1;r6=2909;break}else{r14=1;r6=2909;break}}else{do{if(HEAP8[r13]<<24>>24==0){r22=HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2]}else{r2=FUNCTION_TABLE[HEAP32[HEAP32[r8]+116>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],r13);if((r2|0)!=0){r22=r2;break}___assert_func(71324,664,73180,69656);r22=0}}while(0);r2=HEAP32[r9];if((r22|0)==(HEAP32[HEAP32[r10]+((r2-1)*12&-1)>>2]|0)){_midend_redraw(r1);r17=HEAP32[r8];do{if((HEAP32[r17+180>>2]|0)==0){HEAP32[r5+27]=0;r6=2872;break}else{r3=(FUNCTION_TABLE[HEAP32[r17+184>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12])|0)!=0;HEAP32[r5+27]=r3&1;if(r3){break}else{r6=2872;break}}}while(0);do{if(r6==2872){if(HEAPF32[r5+24]!=0){break}if(HEAPF32[r5+22]!=0){break}_deactivate_timer(HEAP32[r5]);r14=1;r6=2909;break L4036}}while(0);_activate_timer(HEAP32[r5]);r14=1;r6=2909;break}if((r22|0)==0){r14=1;r6=2909;break}do{if((HEAP32[r5+21]|0)==0){if(HEAPF32[r5+22]!=0){r6=2879;break}else{r23=r2;break}}else{r6=2879}}while(0);if(r6==2879){_midend_finish_move(r1);_midend_redraw(r1);r23=HEAP32[r9]}r2=(r1+52|0)>>2;r17=HEAP32[r2];L4060:do{if((r17|0)>(r23|0)){r3=r17;while(1){r16=HEAP32[HEAP32[r8]+68>>2];r18=r3-1|0;HEAP32[r2]=r18;FUNCTION_TABLE[r16](HEAP32[HEAP32[r10]+(r18*12&-1)>>2]);r18=HEAP32[r2];r16=HEAP32[HEAP32[r10]+(r18*12&-1)+4>>2];if((r16|0)==0){r24=r18}else{_free(r16);r24=HEAP32[r2]}if((r24|0)>(HEAP32[r9]|0)){r3=r24}else{r25=r24;break L4060}}}else{r25=r17}}while(0);r17=r1+56|0;do{if((r25|0)>=(HEAP32[r17>>2]|0)){r3=r25+128|0;HEAP32[r17>>2]=r3;r16=HEAP32[r10];r18=r3*12&-1;if((r16|0)==0){r26=_malloc(r18)}else{r26=_realloc(r16,r18)}if((r26|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r10]=r26;break}}}while(0);HEAP32[HEAP32[r10]+(HEAP32[r2]*12&-1)>>2]=r22;HEAP32[HEAP32[r10]+(HEAP32[r2]*12&-1)+4>>2]=r13;HEAP32[HEAP32[r10]+(HEAP32[r2]*12&-1)+8>>2]=1;r17=HEAP32[r2];r18=r17+1|0;HEAP32[r2]=r18;HEAP32[r9]=r18;HEAP32[r5+26]=1;r18=HEAP32[r12];if((r18|0)==0){r6=2894;break}r16=HEAP32[r10];FUNCTION_TABLE[HEAP32[HEAP32[r8]+108>>2]](r18,HEAP32[r16+((r17-1)*12&-1)>>2],HEAP32[r16+(r17*12&-1)>>2]);r6=2894;break}}while(0);if(r6==2909){if((r11|0)==0){r27=r14;STACKTOP=r7;return r27}FUNCTION_TABLE[HEAP32[HEAP32[r8]+68>>2]](r11);r27=r14;STACKTOP=r7;return r27}else if(r6==2894){r14=HEAP32[r9];r20=HEAP32[HEAP32[r10]+((r14-1)*12&-1)+8>>2];r21=r14}do{if((r20|0)==1){r28=HEAP32[r8];r6=2899;break}else if((r20|0)==2){r14=HEAP32[r8];if((HEAP32[r14+188>>2]&512|0)==0){r6=2898;break}else{r28=r14;r6=2899;break}}else{r6=2898}}while(0);do{if(r6==2898){HEAP32[r5+21]=r11;r29=r1+88|0;r6=2901;break}else if(r6==2899){r20=FUNCTION_TABLE[HEAP32[r28+148>>2]](r11,HEAP32[HEAP32[r10]+((r21-1)*12&-1)>>2],HEAP32[r5+26],HEAP32[r12]);HEAP32[r5+21]=r11;r14=r1+88|0;if(r20<=0){r29=r14;r6=2901;break}HEAPF32[r14>>2]=r20;r30=r14;break}}while(0);if(r6==2901){HEAPF32[r29>>2]=0;_midend_finish_move(r1);r30=r29}HEAPF32[r5+23]=0;_midend_redraw(r1);r1=HEAP32[r8];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r5+27]=0;r6=2905;break}else{r8=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r10]+((HEAP32[r9]-1)*12&-1)>>2],HEAP32[r12])|0)!=0;HEAP32[r5+27]=r8&1;if(r8){break}else{r6=2905;break}}}while(0);do{if(r6==2905){if(HEAPF32[r5+24]!=0){break}if(HEAPF32[r30>>2]!=0){break}_deactivate_timer(HEAP32[r5]);r27=1;STACKTOP=r7;return r27}}while(0);_activate_timer(HEAP32[r5]);r27=1;STACKTOP=r7;return r27}function _midend_wants_statusbar(r1){return HEAP32[HEAP32[r1+8>>2]+176>>2]}function _midend_which_preset(r1){var r2,r3,r4,r5;r2=FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+24>>2]](HEAP32[r1+68>>2],1);r3=r1+20|0;r4=HEAP32[r1+24>>2];r1=0;while(1){if((r1|0)>=(r4|0)){r5=-1;break}if((_strcmp(r2,HEAP32[HEAP32[r3>>2]+(r1<<2)>>2])|0)==0){r5=r1;break}else{r1=r1+1|0}}if((r2|0)==0){return r5}_free(r2);return r5}function _midend_status(r1){var r2,r3;r2=HEAP32[r1+60>>2];if((r2|0)==0){r3=1;return r3}r3=FUNCTION_TABLE[HEAP32[HEAP32[r1+8>>2]+156>>2]](HEAP32[HEAP32[r1+64>>2]+((r2-1)*12&-1)>>2]);return r3}function _shuffle(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r5=STACKTOP;STACKTOP=STACKTOP+512|0;if((r2|0)<=1){STACKTOP=r5;return}r6=r5|0;r7=(r3|0)>0;r8=r2;while(1){r2=0;while(1){if((r8>>>(r2>>>0)|0)==0){break}else{r2=r2+1|0}}r9=r8-1|0;r10=r2+3|0;if((r10|0)>=32){___assert_func(71160,275,73044,71992)}r11=Math.floor((1<<r10>>>0)/(r8>>>0));r12=Math.imul(r11,r8);while(1){r13=_random_bits(r4,r10);if(r13>>>0<r12>>>0){break}}r12=Math.floor((r13>>>0)/(r11>>>0));L4167:do{if((r12|0)!=(r9|0)){if(!r7){break}r10=Math.imul(r12,r3);r2=r1+Math.imul(r9,r3)|0;r14=r1+r10|0;r10=r3;while(1){r15=r10>>>0<512?r10:512;_memcpy(r6,r2,r15);_memcpy(r2,r14,r15);_memcpy(r14,r6,r15);r16=r10-r15|0;if((r16|0)>0){r2=r2+r15|0;r14=r14+r15|0;r10=r16}else{break L4167}}}}while(0);if((r9|0)>1){r8=r9}else{break}}STACKTOP=r5;return}function _midend_num_presets(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+88|0;r4=r3;r5=r3+4;r6=r3+8;r7=(r1+24|0)>>2;r8=(r1+8|0)>>2;L4175:do{if((HEAP32[r7]|0)==0){if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+16>>2]](0,r4,r5)|0)==0){break}r9=(r1+28|0)>>2;r10=(r1+12|0)>>2;r11=(r1+16|0)>>2;r12=(r1+20|0)>>2;while(1){r13=HEAP32[r7];if((HEAP32[r9]|0)>(r13|0)){r14=r13}else{r15=r13+10|0;HEAP32[r9]=r15;r13=HEAP32[r10];r16=r15<<2;if((r13|0)==0){r17=_malloc(r16)}else{r17=_realloc(r13,r16)}if((r17|0)==0){r2=2954;break}HEAP32[r10]=r17;r16=HEAP32[r11];r13=HEAP32[r9]<<2;if((r16|0)==0){r18=_malloc(r13)}else{r18=_realloc(r16,r13)}if((r18|0)==0){r2=2959;break}HEAP32[r11]=r18;r13=HEAP32[r12];r16=HEAP32[r9]<<2;if((r13|0)==0){r19=_malloc(r16)}else{r19=_realloc(r13,r16)}if((r19|0)==0){r2=2964;break}HEAP32[r12]=r19;r14=HEAP32[r7]}HEAP32[HEAP32[r10]+(r14<<2)>>2]=HEAP32[r5>>2];HEAP32[HEAP32[r11]+(HEAP32[r7]<<2)>>2]=HEAP32[r4>>2];r16=FUNCTION_TABLE[HEAP32[HEAP32[r8]+24>>2]](HEAP32[r5>>2],1);HEAP32[HEAP32[r12]+(HEAP32[r7]<<2)>>2]=r16;r16=HEAP32[r7]+1|0;HEAP32[r7]=r16;if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+16>>2]](r16,r4,r5)|0)==0){break L4175}}if(r2==2959){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==2964){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==2954){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}}while(0);r5=r6|0;_sprintf(r5,71940,(tempInt=STACKTOP,STACKTOP=STACKTOP+4|0,HEAP32[tempInt>>2]=HEAP32[HEAP32[r8]>>2],tempInt));r4=HEAP8[r5];L4203:do{if(r4<<24>>24==0){r20=0}else{r14=0;r19=0;r18=r5;r17=r4;while(1){if((_isspace(r17&255)|0)==0){r12=_toupper(HEAPU8[r18])&255;HEAP8[r6+r14|0]=r12;r21=r14+1|0}else{r21=r14}r12=r19+1|0;r11=r6+r12|0;r10=HEAP8[r11];if(r10<<24>>24==0){r20=r21;break L4203}else{r14=r21;r19=r12;r18=r11;r17=r10}}}}while(0);HEAP8[r6+r20|0]=0;r20=_getenv(r5);if((r20|0)==0){r22=HEAP32[r7];STACKTOP=r3;return r22}r5=_malloc(_strlen(r20)+1|0);if((r5|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r20);r20=HEAP8[r5];L4216:do{if(r20<<24>>24!=0){r6=(r1+28|0)>>2;r21=(r1+12|0)>>2;r4=(r1+16|0)>>2;r17=(r1+20|0)>>2;r18=r5;r19=r20;while(1){r14=r18;r10=r19;while(1){r23=r10<<24>>24==0;r24=r14+1|0;if(!(r10<<24>>24!=58&(r23^1))){break}r14=r24;r10=HEAP8[r24]}if(r23){r25=r14}else{HEAP8[r14]=0;r25=r24}r10=r25;while(1){r11=HEAP8[r10];r26=r11<<24>>24==0;r27=r10+1|0;if(r11<<24>>24!=58&(r26^1)){r10=r27}else{break}}if(r26){r28=r10}else{HEAP8[r10]=0;r28=r27}r14=FUNCTION_TABLE[HEAP32[HEAP32[r8]+12>>2]]();FUNCTION_TABLE[HEAP32[HEAP32[r8]+20>>2]](r14,r25);if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+48>>2]](r14,1)|0)==0){r11=HEAP32[r7];if((HEAP32[r6]|0)>(r11|0)){r29=r11}else{r12=r11+10|0;HEAP32[r6]=r12;r11=HEAP32[r21];r9=r12<<2;if((r11|0)==0){r30=_malloc(r9)}else{r30=_realloc(r11,r9)}if((r30|0)==0){r2=2993;break}HEAP32[r21]=r30;r9=HEAP32[r4];r11=HEAP32[r6]<<2;if((r9|0)==0){r31=_malloc(r11)}else{r31=_realloc(r9,r11)}if((r31|0)==0){r2=2998;break}HEAP32[r4]=r31;r11=HEAP32[r17];r9=HEAP32[r6]<<2;if((r11|0)==0){r32=_malloc(r9)}else{r32=_realloc(r11,r9)}if((r32|0)==0){r2=3003;break}HEAP32[r17]=r32;r29=HEAP32[r7]}HEAP32[HEAP32[r21]+(r29<<2)>>2]=r14;r9=_malloc(_strlen(r18)+1|0);if((r9|0)==0){r2=3006;break}_strcpy(r9,r18);HEAP32[HEAP32[r4]+(HEAP32[r7]<<2)>>2]=r9;r9=FUNCTION_TABLE[HEAP32[HEAP32[r8]+24>>2]](r14,1);HEAP32[HEAP32[r17]+(HEAP32[r7]<<2)>>2]=r9;HEAP32[r7]=HEAP32[r7]+1|0}else{FUNCTION_TABLE[HEAP32[HEAP32[r8]+28>>2]](r14)}r14=HEAP8[r28];if(r14<<24>>24==0){break L4216}else{r18=r28;r19=r14}}if(r2==2993){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==3006){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==2998){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else if(r2==3003){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}}}while(0);_free(r5);r22=HEAP32[r7];STACKTOP=r3;return r22}function _midend_solve(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r2=r1>>2;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+4|0;r5=r4,r6=r5>>2;r7=(r1+8|0)>>2;r8=HEAP32[r7];if((HEAP32[r8+72>>2]|0)==0){r9=71444;STACKTOP=r4;return r9}r10=(r1+60|0)>>2;r11=HEAP32[r10];if((r11|0)<1){r9=71404;STACKTOP=r4;return r9}HEAP32[r6]=0;r12=(r1+64|0)>>2;r13=HEAP32[r12];r14=FUNCTION_TABLE[HEAP32[r8+76>>2]](HEAP32[r13>>2],HEAP32[r13+((r11-1)*12&-1)>>2],HEAP32[r2+11],r5);if((r14|0)==0){r5=HEAP32[r6];if((r5|0)!=0){r9=r5;STACKTOP=r4;return r9}HEAP32[r6]=71364;r9=71364;STACKTOP=r4;return r9}r6=FUNCTION_TABLE[HEAP32[HEAP32[r7]+116>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-1)*12&-1)>>2],r14);if((r6|0)==0){___assert_func(71324,1376,73128,70224)}r5=r1+84|0;do{if((HEAP32[r5>>2]|0)==0){if(HEAPF32[r2+22]!=0){r3=3021;break}else{break}}else{r3=3021}}while(0);if(r3==3021){_midend_finish_move(r1);_midend_redraw(r1)}r11=(r1+52|0)>>2;r13=HEAP32[r11];L4285:do{if((r13|0)>(HEAP32[r10]|0)){r8=r13;while(1){r15=HEAP32[HEAP32[r7]+68>>2];r16=r8-1|0;HEAP32[r11]=r16;FUNCTION_TABLE[r15](HEAP32[HEAP32[r12]+(r16*12&-1)>>2]);r16=HEAP32[r11];r15=HEAP32[HEAP32[r12]+(r16*12&-1)+4>>2];if((r15|0)==0){r17=r16}else{_free(r15);r17=HEAP32[r11]}if((r17|0)>(HEAP32[r10]|0)){r8=r17}else{r18=r17;break L4285}}}else{r18=r13}}while(0);r13=r1+56|0;do{if((r18|0)<(HEAP32[r13>>2]|0)){r19=r18;r20=HEAP32[r12]}else{r17=r18+128|0;HEAP32[r13>>2]=r17;r8=HEAP32[r12];r15=r17*12&-1;if((r8|0)==0){r21=_malloc(r15)}else{r21=_realloc(r8,r15)}if((r21|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{r15=r21;HEAP32[r12]=r15;r19=HEAP32[r11];r20=r15;break}}}while(0);HEAP32[r20+(r19*12&-1)>>2]=r6;HEAP32[HEAP32[r12]+(HEAP32[r11]*12&-1)+4>>2]=r14;HEAP32[HEAP32[r12]+(HEAP32[r11]*12&-1)+8>>2]=2;r14=HEAP32[r11];r6=r14+1|0;HEAP32[r11]=r6;HEAP32[r10]=r6;r6=(r1+80|0)>>2;r11=HEAP32[r6];if((r11|0)!=0){r19=HEAP32[r12];FUNCTION_TABLE[HEAP32[HEAP32[r7]+108>>2]](r11,HEAP32[r19+((r14-1)*12&-1)>>2],HEAP32[r19+(r14*12&-1)>>2])}HEAP32[r2+26]=1;r14=HEAP32[r7];if((HEAP32[r14+188>>2]&512|0)==0){HEAPF32[r2+22]=0;_midend_finish_move(r1)}else{r19=FUNCTION_TABLE[HEAP32[r14+64>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-2)*12&-1)>>2]);HEAP32[r5>>2]=r19;r19=HEAP32[r10];r5=HEAP32[r12];r14=FUNCTION_TABLE[HEAP32[HEAP32[r7]+148>>2]](HEAP32[r5+((r19-2)*12&-1)>>2],HEAP32[r5+((r19-1)*12&-1)>>2],1,HEAP32[r6]);HEAPF32[r2+22]=r14;HEAPF32[r2+23]=0}if((HEAP32[r2+30]|0)!=0){_midend_redraw(r1)}r1=HEAP32[r7];do{if((HEAP32[r1+180>>2]|0)==0){HEAP32[r2+27]=0;r3=3044;break}else{r7=(FUNCTION_TABLE[HEAP32[r1+184>>2]](HEAP32[HEAP32[r12]+((HEAP32[r10]-1)*12&-1)>>2],HEAP32[r6])|0)!=0;HEAP32[r2+27]=r7&1;if(r7){break}else{r3=3044;break}}}while(0);do{if(r3==3044){if(HEAPF32[r2+24]!=0){break}if(HEAPF32[r2+22]!=0){break}_deactivate_timer(HEAP32[r2]);r9=0;STACKTOP=r4;return r9}}while(0);_activate_timer(HEAP32[r2]);r9=0;STACKTOP=r4;return r9}function _midend_rewrite_statusbar(r1,r2){var r3,r4,r5,r6,r7;r3=STACKTOP;STACKTOP=STACKTOP+100|0;r4=r3;r5=r1+116|0;r6=HEAP32[r5>>2];do{if((r6|0)!=(r2|0)){if((r6|0)!=0){_free(r6)}r7=_malloc(_strlen(r2)+1|0);if((r7|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{_strcpy(r7,r2);HEAP32[r5>>2]=r7;break}}}while(0);if((HEAP32[HEAP32[r1+8>>2]+180>>2]|0)==0){r5=_malloc(_strlen(r2)+1|0);if((r5|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r2);r6=r5;STACKTOP=r3;return r6}else{r5=HEAPF32[r1+112>>2]&-1;r1=r4|0;_sprintf(r1,71292,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=(r5|0)/60&-1,HEAP32[tempInt+4>>2]=(r5|0)%60,tempInt));r5=_malloc(_strlen(r1)+_strlen(r2)+1|0);if((r5|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}_strcpy(r5,r1);_strcat(r5,r2);r6=r5;STACKTOP=r3;return r6}}function _SHA_Bytes(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+384|0;r6=r5,r7=r6>>2;r8=r5+320;r9=r1+92|0;r10=_llvm_uadd_with_overflow_i32(HEAP32[r9>>2],r3);HEAP32[r9>>2]=r10;r10=r1+88|0;HEAP32[r10>>2]=(tempRet0&1)+HEAP32[r10>>2]|0;r10=(r1+84|0)>>2;r9=HEAP32[r10];r11=r9+r3|0;do{if((r9|0)==0){if((r11|0)>63){r4=3073;break}else{r12=r2;r13=r3;break}}else{if((r11|0)>=64){r4=3073;break}_memcpy(r1+(r9+20)|0,r2,r3);r14=HEAP32[r10]+r3|0;HEAP32[r10]=r14;STACKTOP=r5;return}}while(0);L4350:do{if(r4==3073){r11=r1|0;r15=r6;r16=r8;r17=r1+4|0;r18=r1+8|0;r19=r1+12|0;r20=r1+16|0;r21=r2;r22=r3;r23=r9;while(1){_memcpy(r1+(r23+20)|0,r21,64-r23|0);r24=64-HEAP32[r10]|0;r25=r21+r24|0;r26=0;while(1){r27=r26<<2;HEAP32[r8+(r26<<2)>>2]=HEAPU8[(r27|1)+r1+20|0]<<16|HEAPU8[r1+(r27+20)|0]<<24|HEAPU8[(r27|2)+r1+20|0]<<8|HEAPU8[(r27|3)+r1+20|0];r27=r26+1|0;if((r27|0)==16){break}else{r26=r27}}_memcpy(r15,r16,64);r26=16;while(1){r27=HEAP32[(r26-8<<2>>2)+r7]^HEAP32[(r26-3<<2>>2)+r7]^HEAP32[(r26-14<<2>>2)+r7]^HEAP32[(r26-16<<2>>2)+r7];HEAP32[(r26<<2>>2)+r7]=r27<<1|r27>>>31;r27=r26+1|0;if((r27|0)==80){break}else{r26=r27}}r26=HEAP32[r11>>2];r27=HEAP32[r17>>2];r28=HEAP32[r18>>2];r29=HEAP32[r19>>2];r30=HEAP32[r20>>2];r31=0;r32=r30;r33=r29;r34=r28;r35=r27;r36=r26;while(1){r37=(r36<<5|r36>>>27)+r32+(r33&(r35^-1)|r34&r35)+HEAP32[(r31<<2>>2)+r7]+1518500249|0;r38=r35<<30|r35>>>2;r39=r31+1|0;if((r39|0)==20){r40=20;r41=r33;r42=r34;r43=r38;r44=r36;r45=r37;break}else{r31=r39;r32=r33;r33=r34;r34=r38;r35=r36;r36=r37}}while(1){r36=(r45<<5|r45>>>27)+r41+(r43^r44^r42)+HEAP32[(r40<<2>>2)+r7]+1859775393|0;r35=r44<<30|r44>>>2;r34=r40+1|0;if((r34|0)==40){r46=40;r47=r42;r48=r43;r49=r35;r50=r45;r51=r36;break}else{r40=r34;r41=r42;r42=r43;r43=r35;r44=r45;r45=r36}}while(1){r36=(r51<<5|r51>>>27)-1894007588+r47+((r48|r49)&r50|r48&r49)+HEAP32[(r46<<2>>2)+r7]|0;r35=r50<<30|r50>>>2;r34=r46+1|0;if((r34|0)==60){r52=60;r53=r48;r54=r49;r55=r35;r56=r51;r57=r36;break}else{r46=r34;r47=r48;r48=r49;r49=r35;r50=r51;r51=r36}}while(1){r58=(r57<<5|r57>>>27)-899497514+r53+(r55^r56^r54)+HEAP32[(r52<<2>>2)+r7]|0;r59=r56<<30|r56>>>2;r36=r52+1|0;if((r36|0)==80){break}else{r52=r36;r53=r54;r54=r55;r55=r59;r56=r57;r57=r58}}r36=r22-r24|0;HEAP32[r11>>2]=r58+r26|0;HEAP32[r17>>2]=r57+r27|0;HEAP32[r18>>2]=r59+r28|0;HEAP32[r19>>2]=r55+r29|0;HEAP32[r20>>2]=r54+r30|0;HEAP32[r10]=0;if((r36|0)>63){r21=r25;r22=r36;r23=0}else{r12=r25;r13=r36;break L4350}}}}while(0);_memcpy(r1+20|0,r12,r13);r14=r13;HEAP32[r10]=r14;STACKTOP=r5;return}function _SHA_Final(r1,r2){var r3,r4,r5,r6,r7,r8;r3=STACKTOP;STACKTOP=STACKTOP+64|0;r4=r3;r5=HEAP32[r1+84>>2];r6=((r5|0)>55?120:56)-r5|0;r5=HEAP32[r1+88>>2];r7=HEAP32[r1+92>>2];r8=r4|0;_memset(r8,0,r6);HEAP8[r8]=-128;_SHA_Bytes(r1,r8,r6);HEAP8[r8]=r5>>>21&255;HEAP8[r4+1|0]=r5>>>13&255;HEAP8[r4+2|0]=r5>>>5&255;HEAP8[r4+3|0]=(r7>>>29|r5<<3)&255;HEAP8[r4+4|0]=r7>>>21&255;HEAP8[r4+5|0]=r7>>>13&255;HEAP8[r4+6|0]=r7>>>5&255;HEAP8[r4+7|0]=r7<<3&255;_SHA_Bytes(r1,r8,8);r8=(r1|0)>>2;HEAP8[r2]=HEAP32[r8]>>>24&255;HEAP8[r2+1|0]=HEAP32[r8]>>>16&255;HEAP8[r2+2|0]=HEAP32[r8]>>>8&255;HEAP8[r2+3|0]=HEAP32[r8]&255;r8=(r1+4|0)>>2;HEAP8[r2+4|0]=HEAP32[r8]>>>24&255;HEAP8[r2+5|0]=HEAP32[r8]>>>16&255;HEAP8[r2+6|0]=HEAP32[r8]>>>8&255;HEAP8[r2+7|0]=HEAP32[r8]&255;r8=(r1+8|0)>>2;HEAP8[r2+8|0]=HEAP32[r8]>>>24&255;HEAP8[r2+9|0]=HEAP32[r8]>>>16&255;HEAP8[r2+10|0]=HEAP32[r8]>>>8&255;HEAP8[r2+11|0]=HEAP32[r8]&255;r8=(r1+12|0)>>2;HEAP8[r2+12|0]=HEAP32[r8]>>>24&255;HEAP8[r2+13|0]=HEAP32[r8]>>>16&255;HEAP8[r2+14|0]=HEAP32[r8]>>>8&255;HEAP8[r2+15|0]=HEAP32[r8]&255;r8=(r1+16|0)>>2;HEAP8[r2+16|0]=HEAP32[r8]>>>24&255;HEAP8[r2+17|0]=HEAP32[r8]>>>16&255;HEAP8[r2+18|0]=HEAP32[r8]>>>8&255;HEAP8[r2+19|0]=HEAP32[r8]&255;STACKTOP=r3;return}function _random_bits(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+96|0;r5=r4;if((r2|0)<=0){r6=0;r7=r2-1|0;r8=2<<r7;r9=r8-1|0;r10=r6&r9;STACKTOP=r4;return r10}r11=(r1+60|0)>>2;r12=r1|0;r13=r1+40|0;r14=r5|0;r15=r5+4|0;r16=r5+8|0;r17=r5+12|0;r18=r5+16|0;r19=r5+84|0;r20=r5+92|0;r21=r5+88|0;r22=0;r23=0;r24=HEAP32[r11];while(1){if((r24|0)>19){r25=0;while(1){r26=r1+r25|0;r27=HEAP8[r26];if(r27<<24>>24!=-1){r3=3095;break}HEAP8[r26]=0;r28=r25+1|0;if((r28|0)<20){r25=r28}else{break}}if(r3==3095){r3=0;HEAP8[r26]=r27+1&255}HEAP32[r14>>2]=1732584193;HEAP32[r15>>2]=-271733879;HEAP32[r16>>2]=-1732584194;HEAP32[r17>>2]=271733878;HEAP32[r18>>2]=-1009589776;HEAP32[r19>>2]=0;HEAP32[r20>>2]=0;HEAP32[r21>>2]=0;_SHA_Bytes(r5,r12,40);_SHA_Final(r5,r13);HEAP32[r11]=0;r29=0}else{r29=r24}r25=r29+1|0;HEAP32[r11]=r25;r28=HEAPU8[r1+(r29+40)|0]|r22<<8;r30=r23+8|0;if((r30|0)<(r2|0)){r22=r28;r23=r30;r24=r25}else{r6=r28;break}}r7=r2-1|0;r8=2<<r7;r9=r8-1|0;r10=r6&r9;STACKTOP=r4;return r10}function _random_new(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=STACKTOP;STACKTOP=STACKTOP+288|0;r4=r3,r5=r4>>2;r6=r3+96,r7=r6>>2;r8=r3+192,r9=r8>>2;r10=_malloc(64);if((r10|0)==0){_fatal(71812,(tempInt=STACKTOP,STACKTOP=STACKTOP+1|0,STACKTOP=STACKTOP+3>>2<<2,HEAP32[tempInt>>2]=0,tempInt))}else{HEAP32[r9]=1732584193;HEAP32[r9+1]=-271733879;HEAP32[r9+2]=-1732584194;HEAP32[r9+3]=271733878;HEAP32[r9+4]=-1009589776;HEAP32[r9+21]=0;HEAP32[r9+23]=0;HEAP32[r9+22]=0;_SHA_Bytes(r8,r1,r2);_SHA_Final(r8,r10);HEAP32[r7]=1732584193;HEAP32[r7+1]=-271733879;HEAP32[r7+2]=-1732584194;HEAP32[r7+3]=271733878;HEAP32[r7+4]=-1009589776;HEAP32[r7+21]=0;HEAP32[r7+23]=0;HEAP32[r7+22]=0;_SHA_Bytes(r6,r10,20);_SHA_Final(r6,r10+20|0);HEAP32[r5]=1732584193;HEAP32[r5+1]=-271733879;HEAP32[r5+2]=-1732584194;HEAP32[r5+3]=271733878;HEAP32[r5+4]=-1009589776;HEAP32[r5+21]=0;HEAP32[r5+23]=0;HEAP32[r5+22]=0;_SHA_Bytes(r4,r10,40);_SHA_Final(r4,r10+40|0);HEAP32[r10+60>>2]=0;STACKTOP=r3;return r10}}function _malloc(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95;r2=0;do{if(r1>>>0<245){if(r1>>>0<11){r3=16}else{r3=r1+11&-8}r4=r3>>>3;r5=HEAP32[18103];r6=r5>>>(r4>>>0);if((r6&3|0)!=0){r7=(r6&1^1)+r4|0;r8=r7<<1;r9=(r8<<2)+72452|0;r10=(r8+2<<2)+72452|0;r8=HEAP32[r10>>2];r11=r8+8|0;r12=HEAP32[r11>>2];do{if((r9|0)==(r12|0)){HEAP32[18103]=r5&(1<<r7^-1)}else{if(r12>>>0<HEAP32[18107]>>>0){_abort()}r13=r12+12|0;if((HEAP32[r13>>2]|0)==(r8|0)){HEAP32[r13>>2]=r9;HEAP32[r10>>2]=r12;break}else{_abort()}}}while(0);r12=r7<<3;HEAP32[r8+4>>2]=r12|3;r10=r8+(r12|4)|0;HEAP32[r10>>2]=HEAP32[r10>>2]|1;r14=r11;return r14}if(r3>>>0<=HEAP32[18105]>>>0){r15=r3,r16=r15>>2;break}if((r6|0)!=0){r10=2<<r4;r12=r6<<r4&(r10|-r10);r10=(r12&-r12)-1|0;r12=r10>>>12&16;r9=r10>>>(r12>>>0);r10=r9>>>5&8;r13=r9>>>(r10>>>0);r9=r13>>>2&4;r17=r13>>>(r9>>>0);r13=r17>>>1&2;r18=r17>>>(r13>>>0);r17=r18>>>1&1;r19=(r10|r12|r9|r13|r17)+(r18>>>(r17>>>0))|0;r17=r19<<1;r18=(r17<<2)+72452|0;r13=(r17+2<<2)+72452|0;r17=HEAP32[r13>>2];r9=r17+8|0;r12=HEAP32[r9>>2];do{if((r18|0)==(r12|0)){HEAP32[18103]=r5&(1<<r19^-1)}else{if(r12>>>0<HEAP32[18107]>>>0){_abort()}r10=r12+12|0;if((HEAP32[r10>>2]|0)==(r17|0)){HEAP32[r10>>2]=r18;HEAP32[r13>>2]=r12;break}else{_abort()}}}while(0);r12=r19<<3;r13=r12-r3|0;HEAP32[r17+4>>2]=r3|3;r18=r17;r5=r18+r3|0;HEAP32[r18+(r3|4)>>2]=r13|1;HEAP32[r18+r12>>2]=r13;r12=HEAP32[18105];if((r12|0)!=0){r18=HEAP32[18108];r4=r12>>>3;r12=r4<<1;r6=(r12<<2)+72452|0;r11=HEAP32[18103];r8=1<<r4;do{if((r11&r8|0)==0){HEAP32[18103]=r11|r8;r20=r6;r21=(r12+2<<2)+72452|0}else{r4=(r12+2<<2)+72452|0;r7=HEAP32[r4>>2];if(r7>>>0>=HEAP32[18107]>>>0){r20=r7;r21=r4;break}_abort()}}while(0);HEAP32[r21>>2]=r18;HEAP32[r20+12>>2]=r18;HEAP32[r18+8>>2]=r20;HEAP32[r18+12>>2]=r6}HEAP32[18105]=r13;HEAP32[18108]=r5;r14=r9;return r14}r12=HEAP32[18104];if((r12|0)==0){r15=r3,r16=r15>>2;break}r8=(r12&-r12)-1|0;r12=r8>>>12&16;r11=r8>>>(r12>>>0);r8=r11>>>5&8;r17=r11>>>(r8>>>0);r11=r17>>>2&4;r19=r17>>>(r11>>>0);r17=r19>>>1&2;r4=r19>>>(r17>>>0);r19=r4>>>1&1;r7=HEAP32[((r8|r12|r11|r17|r19)+(r4>>>(r19>>>0))<<2)+72716>>2];r19=r7;r4=r7,r17=r4>>2;r11=(HEAP32[r7+4>>2]&-8)-r3|0;while(1){r7=HEAP32[r19+16>>2];if((r7|0)==0){r12=HEAP32[r19+20>>2];if((r12|0)==0){break}else{r22=r12}}else{r22=r7}r7=(HEAP32[r22+4>>2]&-8)-r3|0;r12=r7>>>0<r11>>>0;r19=r22;r4=r12?r22:r4,r17=r4>>2;r11=r12?r7:r11}r19=r4;r9=HEAP32[18107];if(r19>>>0<r9>>>0){_abort()}r5=r19+r3|0;r13=r5;if(r19>>>0>=r5>>>0){_abort()}r5=HEAP32[r17+6];r6=HEAP32[r17+3];L4570:do{if((r6|0)==(r4|0)){r18=r4+20|0;r7=HEAP32[r18>>2];do{if((r7|0)==0){r12=r4+16|0;r8=HEAP32[r12>>2];if((r8|0)==0){r23=0,r24=r23>>2;break L4570}else{r25=r8;r26=r12;break}}else{r25=r7;r26=r18}}while(0);while(1){r18=r25+20|0;r7=HEAP32[r18>>2];if((r7|0)!=0){r25=r7;r26=r18;continue}r18=r25+16|0;r7=HEAP32[r18>>2];if((r7|0)==0){break}else{r25=r7;r26=r18}}if(r26>>>0<r9>>>0){_abort()}else{HEAP32[r26>>2]=0;r23=r25,r24=r23>>2;break}}else{r18=HEAP32[r17+2];if(r18>>>0<r9>>>0){_abort()}r7=r18+12|0;if((HEAP32[r7>>2]|0)!=(r4|0)){_abort()}r12=r6+8|0;if((HEAP32[r12>>2]|0)==(r4|0)){HEAP32[r7>>2]=r6;HEAP32[r12>>2]=r18;r23=r6,r24=r23>>2;break}else{_abort()}}}while(0);L4592:do{if((r5|0)!=0){r6=r4+28|0;r9=(HEAP32[r6>>2]<<2)+72716|0;do{if((r4|0)==(HEAP32[r9>>2]|0)){HEAP32[r9>>2]=r23;if((r23|0)!=0){break}HEAP32[18104]=HEAP32[18104]&(1<<HEAP32[r6>>2]^-1);break L4592}else{if(r5>>>0<HEAP32[18107]>>>0){_abort()}r18=r5+16|0;if((HEAP32[r18>>2]|0)==(r4|0)){HEAP32[r18>>2]=r23}else{HEAP32[r5+20>>2]=r23}if((r23|0)==0){break L4592}}}while(0);if(r23>>>0<HEAP32[18107]>>>0){_abort()}HEAP32[r24+6]=r5;r6=HEAP32[r17+4];do{if((r6|0)!=0){if(r6>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r24+4]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);r6=HEAP32[r17+5];if((r6|0)==0){break}if(r6>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r24+5]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);if(r11>>>0<16){r5=r11+r3|0;HEAP32[r17+1]=r5|3;r6=r5+(r19+4)|0;HEAP32[r6>>2]=HEAP32[r6>>2]|1}else{HEAP32[r17+1]=r3|3;HEAP32[r19+(r3|4)>>2]=r11|1;HEAP32[r19+r11+r3>>2]=r11;r6=HEAP32[18105];if((r6|0)!=0){r5=HEAP32[18108];r9=r6>>>3;r6=r9<<1;r18=(r6<<2)+72452|0;r12=HEAP32[18103];r7=1<<r9;do{if((r12&r7|0)==0){HEAP32[18103]=r12|r7;r27=r18;r28=(r6+2<<2)+72452|0}else{r9=(r6+2<<2)+72452|0;r8=HEAP32[r9>>2];if(r8>>>0>=HEAP32[18107]>>>0){r27=r8;r28=r9;break}_abort()}}while(0);HEAP32[r28>>2]=r5;HEAP32[r27+12>>2]=r5;HEAP32[r5+8>>2]=r27;HEAP32[r5+12>>2]=r18}HEAP32[18105]=r11;HEAP32[18108]=r13}r6=r4+8|0;if((r6|0)==0){r15=r3,r16=r15>>2;break}else{r14=r6}return r14}else{if(r1>>>0>4294967231){r15=-1,r16=r15>>2;break}r6=r1+11|0;r7=r6&-8,r12=r7>>2;r19=HEAP32[18104];if((r19|0)==0){r15=r7,r16=r15>>2;break}r17=-r7|0;r9=r6>>>8;do{if((r9|0)==0){r29=0}else{if(r7>>>0>16777215){r29=31;break}r6=(r9+1048320|0)>>>16&8;r8=r9<<r6;r10=(r8+520192|0)>>>16&4;r30=r8<<r10;r8=(r30+245760|0)>>>16&2;r31=14-(r10|r6|r8)+(r30<<r8>>>15)|0;r29=r7>>>((r31+7|0)>>>0)&1|r31<<1}}while(0);r9=HEAP32[(r29<<2)+72716>>2];L4400:do{if((r9|0)==0){r32=0;r33=r17;r34=0}else{if((r29|0)==31){r35=0}else{r35=25-(r29>>>1)|0}r4=0;r13=r17;r11=r9,r18=r11>>2;r5=r7<<r35;r31=0;while(1){r8=HEAP32[r18+1]&-8;r30=r8-r7|0;if(r30>>>0<r13>>>0){if((r8|0)==(r7|0)){r32=r11;r33=r30;r34=r11;break L4400}else{r36=r11;r37=r30}}else{r36=r4;r37=r13}r30=HEAP32[r18+5];r8=HEAP32[((r5>>>31<<2)+16>>2)+r18];r6=(r30|0)==0|(r30|0)==(r8|0)?r31:r30;if((r8|0)==0){r32=r36;r33=r37;r34=r6;break L4400}else{r4=r36;r13=r37;r11=r8,r18=r11>>2;r5=r5<<1;r31=r6}}}}while(0);if((r34|0)==0&(r32|0)==0){r9=2<<r29;r17=r19&(r9|-r9);if((r17|0)==0){r15=r7,r16=r15>>2;break}r9=(r17&-r17)-1|0;r17=r9>>>12&16;r31=r9>>>(r17>>>0);r9=r31>>>5&8;r5=r31>>>(r9>>>0);r31=r5>>>2&4;r11=r5>>>(r31>>>0);r5=r11>>>1&2;r18=r11>>>(r5>>>0);r11=r18>>>1&1;r38=HEAP32[((r9|r17|r31|r5|r11)+(r18>>>(r11>>>0))<<2)+72716>>2]}else{r38=r34}L4415:do{if((r38|0)==0){r39=r33;r40=r32,r41=r40>>2}else{r11=r38,r18=r11>>2;r5=r33;r31=r32;while(1){r17=(HEAP32[r18+1]&-8)-r7|0;r9=r17>>>0<r5>>>0;r13=r9?r17:r5;r17=r9?r11:r31;r9=HEAP32[r18+4];if((r9|0)!=0){r11=r9,r18=r11>>2;r5=r13;r31=r17;continue}r9=HEAP32[r18+5];if((r9|0)==0){r39=r13;r40=r17,r41=r40>>2;break L4415}else{r11=r9,r18=r11>>2;r5=r13;r31=r17}}}}while(0);if((r40|0)==0){r15=r7,r16=r15>>2;break}if(r39>>>0>=(HEAP32[18105]-r7|0)>>>0){r15=r7,r16=r15>>2;break}r19=r40,r31=r19>>2;r5=HEAP32[18107];if(r19>>>0<r5>>>0){_abort()}r11=r19+r7|0;r18=r11;if(r19>>>0>=r11>>>0){_abort()}r17=HEAP32[r41+6];r13=HEAP32[r41+3];L4428:do{if((r13|0)==(r40|0)){r9=r40+20|0;r4=HEAP32[r9>>2];do{if((r4|0)==0){r6=r40+16|0;r8=HEAP32[r6>>2];if((r8|0)==0){r42=0,r43=r42>>2;break L4428}else{r44=r8;r45=r6;break}}else{r44=r4;r45=r9}}while(0);while(1){r9=r44+20|0;r4=HEAP32[r9>>2];if((r4|0)!=0){r44=r4;r45=r9;continue}r9=r44+16|0;r4=HEAP32[r9>>2];if((r4|0)==0){break}else{r44=r4;r45=r9}}if(r45>>>0<r5>>>0){_abort()}else{HEAP32[r45>>2]=0;r42=r44,r43=r42>>2;break}}else{r9=HEAP32[r41+2];if(r9>>>0<r5>>>0){_abort()}r4=r9+12|0;if((HEAP32[r4>>2]|0)!=(r40|0)){_abort()}r6=r13+8|0;if((HEAP32[r6>>2]|0)==(r40|0)){HEAP32[r4>>2]=r13;HEAP32[r6>>2]=r9;r42=r13,r43=r42>>2;break}else{_abort()}}}while(0);L4450:do{if((r17|0)!=0){r13=r40+28|0;r5=(HEAP32[r13>>2]<<2)+72716|0;do{if((r40|0)==(HEAP32[r5>>2]|0)){HEAP32[r5>>2]=r42;if((r42|0)!=0){break}HEAP32[18104]=HEAP32[18104]&(1<<HEAP32[r13>>2]^-1);break L4450}else{if(r17>>>0<HEAP32[18107]>>>0){_abort()}r9=r17+16|0;if((HEAP32[r9>>2]|0)==(r40|0)){HEAP32[r9>>2]=r42}else{HEAP32[r17+20>>2]=r42}if((r42|0)==0){break L4450}}}while(0);if(r42>>>0<HEAP32[18107]>>>0){_abort()}HEAP32[r43+6]=r17;r13=HEAP32[r41+4];do{if((r13|0)!=0){if(r13>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r43+4]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);r13=HEAP32[r41+5];if((r13|0)==0){break}if(r13>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r43+5]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);do{if(r39>>>0<16){r17=r39+r7|0;HEAP32[r41+1]=r17|3;r13=r17+(r19+4)|0;HEAP32[r13>>2]=HEAP32[r13>>2]|1}else{HEAP32[r41+1]=r7|3;HEAP32[((r7|4)>>2)+r31]=r39|1;HEAP32[(r39>>2)+r31+r12]=r39;r13=r39>>>3;if(r39>>>0<256){r17=r13<<1;r5=(r17<<2)+72452|0;r9=HEAP32[18103];r6=1<<r13;do{if((r9&r6|0)==0){HEAP32[18103]=r9|r6;r46=r5;r47=(r17+2<<2)+72452|0}else{r13=(r17+2<<2)+72452|0;r4=HEAP32[r13>>2];if(r4>>>0>=HEAP32[18107]>>>0){r46=r4;r47=r13;break}_abort()}}while(0);HEAP32[r47>>2]=r18;HEAP32[r46+12>>2]=r18;HEAP32[r12+(r31+2)]=r46;HEAP32[r12+(r31+3)]=r5;break}r17=r11;r6=r39>>>8;do{if((r6|0)==0){r48=0}else{if(r39>>>0>16777215){r48=31;break}r9=(r6+1048320|0)>>>16&8;r13=r6<<r9;r4=(r13+520192|0)>>>16&4;r8=r13<<r4;r13=(r8+245760|0)>>>16&2;r30=14-(r4|r9|r13)+(r8<<r13>>>15)|0;r48=r39>>>((r30+7|0)>>>0)&1|r30<<1}}while(0);r6=(r48<<2)+72716|0;HEAP32[r12+(r31+7)]=r48;HEAP32[r12+(r31+5)]=0;HEAP32[r12+(r31+4)]=0;r5=HEAP32[18104];r30=1<<r48;if((r5&r30|0)==0){HEAP32[18104]=r5|r30;HEAP32[r6>>2]=r17;HEAP32[r12+(r31+6)]=r6;HEAP32[r12+(r31+3)]=r17;HEAP32[r12+(r31+2)]=r17;break}if((r48|0)==31){r49=0}else{r49=25-(r48>>>1)|0}r30=r39<<r49;r5=HEAP32[r6>>2];while(1){if((HEAP32[r5+4>>2]&-8|0)==(r39|0)){break}r50=(r30>>>31<<2)+r5+16|0;r6=HEAP32[r50>>2];if((r6|0)==0){r2=3255;break}else{r30=r30<<1;r5=r6}}if(r2==3255){if(r50>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r50>>2]=r17;HEAP32[r12+(r31+6)]=r5;HEAP32[r12+(r31+3)]=r17;HEAP32[r12+(r31+2)]=r17;break}}r30=r5+8|0;r6=HEAP32[r30>>2];r13=HEAP32[18107];if(r5>>>0<r13>>>0){_abort()}if(r6>>>0<r13>>>0){_abort()}else{HEAP32[r6+12>>2]=r17;HEAP32[r30>>2]=r17;HEAP32[r12+(r31+2)]=r6;HEAP32[r12+(r31+3)]=r5;HEAP32[r12+(r31+6)]=0;break}}}while(0);r31=r40+8|0;if((r31|0)==0){r15=r7,r16=r15>>2;break}else{r14=r31}return r14}}while(0);r40=HEAP32[18105];if(r15>>>0<=r40>>>0){r50=r40-r15|0;r39=HEAP32[18108];if(r50>>>0>15){r49=r39;HEAP32[18108]=r49+r15|0;HEAP32[18105]=r50;HEAP32[(r49+4>>2)+r16]=r50|1;HEAP32[r49+r40>>2]=r50;HEAP32[r39+4>>2]=r15|3}else{HEAP32[18105]=0;HEAP32[18108]=0;HEAP32[r39+4>>2]=r40|3;r50=r40+(r39+4)|0;HEAP32[r50>>2]=HEAP32[r50>>2]|1}r14=r39+8|0;return r14}r39=HEAP32[18106];if(r15>>>0<r39>>>0){r50=r39-r15|0;HEAP32[18106]=r50;r39=HEAP32[18109];r40=r39;HEAP32[18109]=r40+r15|0;HEAP32[(r40+4>>2)+r16]=r50|1;HEAP32[r39+4>>2]=r15|3;r14=r39+8|0;return r14}do{if((HEAP32[17094]|0)==0){r39=_sysconf(8);if((r39-1&r39|0)==0){HEAP32[17096]=r39;HEAP32[17095]=r39;HEAP32[17097]=-1;HEAP32[17098]=2097152;HEAP32[17099]=0;HEAP32[18214]=0;r39=_time(0)&-16^1431655768;HEAP32[17094]=r39;break}else{_abort()}}}while(0);r39=r15+48|0;r50=HEAP32[17096];r40=r15+47|0;r49=r50+r40|0;r48=-r50|0;r50=r49&r48;if(r50>>>0<=r15>>>0){r14=0;return r14}r46=HEAP32[18213];do{if((r46|0)!=0){r47=HEAP32[18211];r41=r47+r50|0;if(r41>>>0<=r47>>>0|r41>>>0>r46>>>0){r14=0}else{break}return r14}}while(0);L4659:do{if((HEAP32[18214]&4|0)==0){r46=HEAP32[18109];L4661:do{if((r46|0)==0){r2=3285}else{r41=r46;r47=72860;while(1){r51=r47|0;r42=HEAP32[r51>>2];if(r42>>>0<=r41>>>0){r52=r47+4|0;if((r42+HEAP32[r52>>2]|0)>>>0>r41>>>0){break}}r42=HEAP32[r47+8>>2];if((r42|0)==0){r2=3285;break L4661}else{r47=r42}}if((r47|0)==0){r2=3285;break}r41=r49-HEAP32[18106]&r48;if(r41>>>0>=2147483647){r53=0;break}r5=_sbrk(r41);r17=(r5|0)==(HEAP32[r51>>2]+HEAP32[r52>>2]|0);r54=r17?r5:-1;r55=r17?r41:0;r56=r5;r57=r41;r2=3294;break}}while(0);do{if(r2==3285){r46=_sbrk(0);if((r46|0)==-1){r53=0;break}r7=r46;r41=HEAP32[17095];r5=r41-1|0;if((r5&r7|0)==0){r58=r50}else{r58=r50-r7+(r5+r7&-r41)|0}r41=HEAP32[18211];r7=r41+r58|0;if(!(r58>>>0>r15>>>0&r58>>>0<2147483647)){r53=0;break}r5=HEAP32[18213];if((r5|0)!=0){if(r7>>>0<=r41>>>0|r7>>>0>r5>>>0){r53=0;break}}r5=_sbrk(r58);r7=(r5|0)==(r46|0);r54=r7?r46:-1;r55=r7?r58:0;r56=r5;r57=r58;r2=3294;break}}while(0);L4681:do{if(r2==3294){r5=-r57|0;if((r54|0)!=-1){r59=r55,r60=r59>>2;r61=r54,r62=r61>>2;r2=3305;break L4659}do{if((r56|0)!=-1&r57>>>0<2147483647&r57>>>0<r39>>>0){r7=HEAP32[17096];r46=r40-r57+r7&-r7;if(r46>>>0>=2147483647){r63=r57;break}if((_sbrk(r46)|0)==-1){_sbrk(r5);r53=r55;break L4681}else{r63=r46+r57|0;break}}else{r63=r57}}while(0);if((r56|0)==-1){r53=r55}else{r59=r63,r60=r59>>2;r61=r56,r62=r61>>2;r2=3305;break L4659}}}while(0);HEAP32[18214]=HEAP32[18214]|4;r64=r53;r2=3302;break}else{r64=0;r2=3302}}while(0);do{if(r2==3302){if(r50>>>0>=2147483647){break}r53=_sbrk(r50);r56=_sbrk(0);if(!((r56|0)!=-1&(r53|0)!=-1&r53>>>0<r56>>>0)){break}r63=r56-r53|0;r56=r63>>>0>(r15+40|0)>>>0;r55=r56?r53:-1;if((r55|0)==-1){break}else{r59=r56?r63:r64,r60=r59>>2;r61=r55,r62=r61>>2;r2=3305;break}}}while(0);do{if(r2==3305){r64=HEAP32[18211]+r59|0;HEAP32[18211]=r64;if(r64>>>0>HEAP32[18212]>>>0){HEAP32[18212]=r64}r64=HEAP32[18109],r50=r64>>2;L4701:do{if((r64|0)==0){r55=HEAP32[18107];if((r55|0)==0|r61>>>0<r55>>>0){HEAP32[18107]=r61}HEAP32[18215]=r61;HEAP32[18216]=r59;HEAP32[18218]=0;HEAP32[18112]=HEAP32[17094];HEAP32[18111]=-1;r55=0;while(1){r63=r55<<1;r56=(r63<<2)+72452|0;HEAP32[(r63+3<<2)+72452>>2]=r56;HEAP32[(r63+2<<2)+72452>>2]=r56;r56=r55+1|0;if((r56|0)==32){break}else{r55=r56}}r55=r61+8|0;if((r55&7|0)==0){r65=0}else{r65=-r55&7}r55=r59-40-r65|0;HEAP32[18109]=r61+r65|0;HEAP32[18106]=r55;HEAP32[(r65+4>>2)+r62]=r55|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[18110]=HEAP32[17098]}else{r55=72860,r56=r55>>2;while(1){r66=HEAP32[r56];r67=r55+4|0;r68=HEAP32[r67>>2];if((r61|0)==(r66+r68|0)){r2=3317;break}r63=HEAP32[r56+2];if((r63|0)==0){break}else{r55=r63,r56=r55>>2}}do{if(r2==3317){if((HEAP32[r56+3]&8|0)!=0){break}r55=r64;if(!(r55>>>0>=r66>>>0&r55>>>0<r61>>>0)){break}HEAP32[r67>>2]=r68+r59|0;r55=HEAP32[18109];r63=HEAP32[18106]+r59|0;r53=r55;r57=r55+8|0;if((r57&7|0)==0){r69=0}else{r69=-r57&7}r57=r63-r69|0;HEAP32[18109]=r53+r69|0;HEAP32[18106]=r57;HEAP32[r69+(r53+4)>>2]=r57|1;HEAP32[r63+(r53+4)>>2]=40;HEAP32[18110]=HEAP32[17098];break L4701}}while(0);if(r61>>>0<HEAP32[18107]>>>0){HEAP32[18107]=r61}r56=r61+r59|0;r53=72860;while(1){r70=r53|0;if((HEAP32[r70>>2]|0)==(r56|0)){r2=3327;break}r63=HEAP32[r53+8>>2];if((r63|0)==0){break}else{r53=r63}}do{if(r2==3327){if((HEAP32[r53+12>>2]&8|0)!=0){break}HEAP32[r70>>2]=r61;r56=r53+4|0;HEAP32[r56>>2]=HEAP32[r56>>2]+r59|0;r56=r61+8|0;if((r56&7|0)==0){r71=0}else{r71=-r56&7}r56=r59+(r61+8)|0;if((r56&7|0)==0){r72=0,r73=r72>>2}else{r72=-r56&7,r73=r72>>2}r56=r61+r72+r59|0;r63=r56;r57=r71+r15|0,r55=r57>>2;r40=r61+r57|0;r57=r40;r39=r56-(r61+r71)-r15|0;HEAP32[(r71+4>>2)+r62]=r15|3;do{if((r63|0)==(HEAP32[18109]|0)){r54=HEAP32[18106]+r39|0;HEAP32[18106]=r54;HEAP32[18109]=r57;HEAP32[r55+(r62+1)]=r54|1}else{if((r63|0)==(HEAP32[18108]|0)){r54=HEAP32[18105]+r39|0;HEAP32[18105]=r54;HEAP32[18108]=r57;HEAP32[r55+(r62+1)]=r54|1;HEAP32[(r54>>2)+r62+r55]=r54;break}r54=r59+4|0;r58=HEAP32[(r54>>2)+r62+r73];if((r58&3|0)==1){r52=r58&-8;r51=r58>>>3;L4746:do{if(r58>>>0<256){r48=HEAP32[((r72|8)>>2)+r62+r60];r49=HEAP32[r73+(r62+(r60+3))];r5=(r51<<3)+72452|0;do{if((r48|0)!=(r5|0)){if(r48>>>0<HEAP32[18107]>>>0){_abort()}if((HEAP32[r48+12>>2]|0)==(r63|0)){break}_abort()}}while(0);if((r49|0)==(r48|0)){HEAP32[18103]=HEAP32[18103]&(1<<r51^-1);break}do{if((r49|0)==(r5|0)){r74=r49+8|0}else{if(r49>>>0<HEAP32[18107]>>>0){_abort()}r47=r49+8|0;if((HEAP32[r47>>2]|0)==(r63|0)){r74=r47;break}_abort()}}while(0);HEAP32[r48+12>>2]=r49;HEAP32[r74>>2]=r48}else{r5=r56;r47=HEAP32[((r72|24)>>2)+r62+r60];r46=HEAP32[r73+(r62+(r60+3))];L4767:do{if((r46|0)==(r5|0)){r7=r72|16;r41=r61+r54+r7|0;r17=HEAP32[r41>>2];do{if((r17|0)==0){r42=r61+r7+r59|0;r43=HEAP32[r42>>2];if((r43|0)==0){r75=0,r76=r75>>2;break L4767}else{r77=r43;r78=r42;break}}else{r77=r17;r78=r41}}while(0);while(1){r41=r77+20|0;r17=HEAP32[r41>>2];if((r17|0)!=0){r77=r17;r78=r41;continue}r41=r77+16|0;r17=HEAP32[r41>>2];if((r17|0)==0){break}else{r77=r17;r78=r41}}if(r78>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r78>>2]=0;r75=r77,r76=r75>>2;break}}else{r41=HEAP32[((r72|8)>>2)+r62+r60];if(r41>>>0<HEAP32[18107]>>>0){_abort()}r17=r41+12|0;if((HEAP32[r17>>2]|0)!=(r5|0)){_abort()}r7=r46+8|0;if((HEAP32[r7>>2]|0)==(r5|0)){HEAP32[r17>>2]=r46;HEAP32[r7>>2]=r41;r75=r46,r76=r75>>2;break}else{_abort()}}}while(0);if((r47|0)==0){break}r46=r72+(r61+(r59+28))|0;r48=(HEAP32[r46>>2]<<2)+72716|0;do{if((r5|0)==(HEAP32[r48>>2]|0)){HEAP32[r48>>2]=r75;if((r75|0)!=0){break}HEAP32[18104]=HEAP32[18104]&(1<<HEAP32[r46>>2]^-1);break L4746}else{if(r47>>>0<HEAP32[18107]>>>0){_abort()}r49=r47+16|0;if((HEAP32[r49>>2]|0)==(r5|0)){HEAP32[r49>>2]=r75}else{HEAP32[r47+20>>2]=r75}if((r75|0)==0){break L4746}}}while(0);if(r75>>>0<HEAP32[18107]>>>0){_abort()}HEAP32[r76+6]=r47;r5=r72|16;r46=HEAP32[(r5>>2)+r62+r60];do{if((r46|0)!=0){if(r46>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r76+4]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r46=HEAP32[(r54+r5>>2)+r62];if((r46|0)==0){break}if(r46>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r76+5]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r79=r61+(r52|r72)+r59|0;r80=r52+r39|0}else{r79=r63;r80=r39}r54=r79+4|0;HEAP32[r54>>2]=HEAP32[r54>>2]&-2;HEAP32[r55+(r62+1)]=r80|1;HEAP32[(r80>>2)+r62+r55]=r80;r54=r80>>>3;if(r80>>>0<256){r51=r54<<1;r58=(r51<<2)+72452|0;r46=HEAP32[18103];r47=1<<r54;do{if((r46&r47|0)==0){HEAP32[18103]=r46|r47;r81=r58;r82=(r51+2<<2)+72452|0}else{r54=(r51+2<<2)+72452|0;r48=HEAP32[r54>>2];if(r48>>>0>=HEAP32[18107]>>>0){r81=r48;r82=r54;break}_abort()}}while(0);HEAP32[r82>>2]=r57;HEAP32[r81+12>>2]=r57;HEAP32[r55+(r62+2)]=r81;HEAP32[r55+(r62+3)]=r58;break}r51=r40;r47=r80>>>8;do{if((r47|0)==0){r83=0}else{if(r80>>>0>16777215){r83=31;break}r46=(r47+1048320|0)>>>16&8;r52=r47<<r46;r54=(r52+520192|0)>>>16&4;r48=r52<<r54;r52=(r48+245760|0)>>>16&2;r49=14-(r54|r46|r52)+(r48<<r52>>>15)|0;r83=r80>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r83<<2)+72716|0;HEAP32[r55+(r62+7)]=r83;HEAP32[r55+(r62+5)]=0;HEAP32[r55+(r62+4)]=0;r58=HEAP32[18104];r49=1<<r83;if((r58&r49|0)==0){HEAP32[18104]=r58|r49;HEAP32[r47>>2]=r51;HEAP32[r55+(r62+6)]=r47;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}if((r83|0)==31){r84=0}else{r84=25-(r83>>>1)|0}r49=r80<<r84;r58=HEAP32[r47>>2];while(1){if((HEAP32[r58+4>>2]&-8|0)==(r80|0)){break}r85=(r49>>>31<<2)+r58+16|0;r47=HEAP32[r85>>2];if((r47|0)==0){r2=3400;break}else{r49=r49<<1;r58=r47}}if(r2==3400){if(r85>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r85>>2]=r51;HEAP32[r55+(r62+6)]=r58;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}}r49=r58+8|0;r47=HEAP32[r49>>2];r52=HEAP32[18107];if(r58>>>0<r52>>>0){_abort()}if(r47>>>0<r52>>>0){_abort()}else{HEAP32[r47+12>>2]=r51;HEAP32[r49>>2]=r51;HEAP32[r55+(r62+2)]=r47;HEAP32[r55+(r62+3)]=r58;HEAP32[r55+(r62+6)]=0;break}}}while(0);r14=r61+(r71|8)|0;return r14}}while(0);r53=r64;r55=72860,r40=r55>>2;while(1){r86=HEAP32[r40];if(r86>>>0<=r53>>>0){r87=HEAP32[r40+1];r88=r86+r87|0;if(r88>>>0>r53>>>0){break}}r55=HEAP32[r40+2],r40=r55>>2}r55=r86+(r87-39)|0;if((r55&7|0)==0){r89=0}else{r89=-r55&7}r55=r86+(r87-47)+r89|0;r40=r55>>>0<(r64+16|0)>>>0?r53:r55;r55=r40+8|0,r57=r55>>2;r39=r61+8|0;if((r39&7|0)==0){r90=0}else{r90=-r39&7}r39=r59-40-r90|0;HEAP32[18109]=r61+r90|0;HEAP32[18106]=r39;HEAP32[(r90+4>>2)+r62]=r39|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[18110]=HEAP32[17098];HEAP32[r40+4>>2]=27;HEAP32[r57]=HEAP32[18215];HEAP32[r57+1]=HEAP32[18216];HEAP32[r57+2]=HEAP32[18217];HEAP32[r57+3]=HEAP32[18218];HEAP32[18215]=r61;HEAP32[18216]=r59;HEAP32[18218]=0;HEAP32[18217]=r55;r55=r40+28|0;HEAP32[r55>>2]=7;L4865:do{if((r40+32|0)>>>0<r88>>>0){r57=r55;while(1){r39=r57+4|0;HEAP32[r39>>2]=7;if((r57+8|0)>>>0<r88>>>0){r57=r39}else{break L4865}}}}while(0);if((r40|0)==(r53|0)){break}r55=r40-r64|0;r57=r55+(r53+4)|0;HEAP32[r57>>2]=HEAP32[r57>>2]&-2;HEAP32[r50+1]=r55|1;HEAP32[r53+r55>>2]=r55;r57=r55>>>3;if(r55>>>0<256){r39=r57<<1;r63=(r39<<2)+72452|0;r56=HEAP32[18103];r47=1<<r57;do{if((r56&r47|0)==0){HEAP32[18103]=r56|r47;r91=r63;r92=(r39+2<<2)+72452|0}else{r57=(r39+2<<2)+72452|0;r49=HEAP32[r57>>2];if(r49>>>0>=HEAP32[18107]>>>0){r91=r49;r92=r57;break}_abort()}}while(0);HEAP32[r92>>2]=r64;HEAP32[r91+12>>2]=r64;HEAP32[r50+2]=r91;HEAP32[r50+3]=r63;break}r39=r64;r47=r55>>>8;do{if((r47|0)==0){r93=0}else{if(r55>>>0>16777215){r93=31;break}r56=(r47+1048320|0)>>>16&8;r53=r47<<r56;r40=(r53+520192|0)>>>16&4;r57=r53<<r40;r53=(r57+245760|0)>>>16&2;r49=14-(r40|r56|r53)+(r57<<r53>>>15)|0;r93=r55>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r93<<2)+72716|0;HEAP32[r50+7]=r93;HEAP32[r50+5]=0;HEAP32[r50+4]=0;r63=HEAP32[18104];r49=1<<r93;if((r63&r49|0)==0){HEAP32[18104]=r63|r49;HEAP32[r47>>2]=r39;HEAP32[r50+6]=r47;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}if((r93|0)==31){r94=0}else{r94=25-(r93>>>1)|0}r49=r55<<r94;r63=HEAP32[r47>>2];while(1){if((HEAP32[r63+4>>2]&-8|0)==(r55|0)){break}r95=(r49>>>31<<2)+r63+16|0;r47=HEAP32[r95>>2];if((r47|0)==0){r2=3435;break}else{r49=r49<<1;r63=r47}}if(r2==3435){if(r95>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r95>>2]=r39;HEAP32[r50+6]=r63;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}}r49=r63+8|0;r55=HEAP32[r49>>2];r47=HEAP32[18107];if(r63>>>0<r47>>>0){_abort()}if(r55>>>0<r47>>>0){_abort()}else{HEAP32[r55+12>>2]=r39;HEAP32[r49>>2]=r39;HEAP32[r50+2]=r55;HEAP32[r50+3]=r63;HEAP32[r50+6]=0;break}}}while(0);r50=HEAP32[18106];if(r50>>>0<=r15>>>0){break}r64=r50-r15|0;HEAP32[18106]=r64;r50=HEAP32[18109];r55=r50;HEAP32[18109]=r55+r15|0;HEAP32[(r55+4>>2)+r16]=r64|1;HEAP32[r50+4>>2]=r15|3;r14=r50+8|0;return r14}}while(0);r15=___errno_location();HEAP32[r15>>2]=12;r14=0;return r14}function _free(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r2=r1>>2;r3=0;if((r1|0)==0){return}r4=r1-8|0;r5=r4;r6=HEAP32[18107];if(r4>>>0<r6>>>0){_abort()}r7=HEAP32[r1-4>>2];r8=r7&3;if((r8|0)==1){_abort()}r9=r7&-8,r10=r9>>2;r11=r1+(r9-8)|0;r12=r11;L10:do{if((r7&1|0)==0){r13=HEAP32[r4>>2];if((r8|0)==0){return}r14=-8-r13|0,r15=r14>>2;r16=r1+r14|0;r17=r16;r18=r13+r9|0;if(r16>>>0<r6>>>0){_abort()}if((r17|0)==(HEAP32[18108]|0)){r19=(r1+(r9-4)|0)>>2;if((HEAP32[r19]&3|0)!=3){r20=r17,r21=r20>>2;r22=r18;break}HEAP32[18105]=r18;HEAP32[r19]=HEAP32[r19]&-2;HEAP32[r15+(r2+1)]=r18|1;HEAP32[r11>>2]=r18;return}r19=r13>>>3;if(r13>>>0<256){r13=HEAP32[r15+(r2+2)];r23=HEAP32[r15+(r2+3)];r24=(r19<<3)+72452|0;do{if((r13|0)!=(r24|0)){if(r13>>>0<r6>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r17|0)){break}_abort()}}while(0);if((r23|0)==(r13|0)){HEAP32[18103]=HEAP32[18103]&(1<<r19^-1);r20=r17,r21=r20>>2;r22=r18;break}do{if((r23|0)==(r24|0)){r25=r23+8|0}else{if(r23>>>0<r6>>>0){_abort()}r26=r23+8|0;if((HEAP32[r26>>2]|0)==(r17|0)){r25=r26;break}_abort()}}while(0);HEAP32[r13+12>>2]=r23;HEAP32[r25>>2]=r13;r20=r17,r21=r20>>2;r22=r18;break}r24=r16;r19=HEAP32[r15+(r2+6)];r26=HEAP32[r15+(r2+3)];L44:do{if((r26|0)==(r24|0)){r27=r14+(r1+20)|0;r28=HEAP32[r27>>2];do{if((r28|0)==0){r29=r14+(r1+16)|0;r30=HEAP32[r29>>2];if((r30|0)==0){r31=0,r32=r31>>2;break L44}else{r33=r30;r34=r29;break}}else{r33=r28;r34=r27}}while(0);while(1){r27=r33+20|0;r28=HEAP32[r27>>2];if((r28|0)!=0){r33=r28;r34=r27;continue}r27=r33+16|0;r28=HEAP32[r27>>2];if((r28|0)==0){break}else{r33=r28;r34=r27}}if(r34>>>0<r6>>>0){_abort()}else{HEAP32[r34>>2]=0;r31=r33,r32=r31>>2;break}}else{r27=HEAP32[r15+(r2+2)];if(r27>>>0<r6>>>0){_abort()}r28=r27+12|0;if((HEAP32[r28>>2]|0)!=(r24|0)){_abort()}r29=r26+8|0;if((HEAP32[r29>>2]|0)==(r24|0)){HEAP32[r28>>2]=r26;HEAP32[r29>>2]=r27;r31=r26,r32=r31>>2;break}else{_abort()}}}while(0);if((r19|0)==0){r20=r17,r21=r20>>2;r22=r18;break}r26=r14+(r1+28)|0;r16=(HEAP32[r26>>2]<<2)+72716|0;do{if((r24|0)==(HEAP32[r16>>2]|0)){HEAP32[r16>>2]=r31;if((r31|0)!=0){break}HEAP32[18104]=HEAP32[18104]&(1<<HEAP32[r26>>2]^-1);r20=r17,r21=r20>>2;r22=r18;break L10}else{if(r19>>>0<HEAP32[18107]>>>0){_abort()}r13=r19+16|0;if((HEAP32[r13>>2]|0)==(r24|0)){HEAP32[r13>>2]=r31}else{HEAP32[r19+20>>2]=r31}if((r31|0)==0){r20=r17,r21=r20>>2;r22=r18;break L10}}}while(0);if(r31>>>0<HEAP32[18107]>>>0){_abort()}HEAP32[r32+6]=r19;r24=HEAP32[r15+(r2+4)];do{if((r24|0)!=0){if(r24>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r32+4]=r24;HEAP32[r24+24>>2]=r31;break}}}while(0);r24=HEAP32[r15+(r2+5)];if((r24|0)==0){r20=r17,r21=r20>>2;r22=r18;break}if(r24>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r32+5]=r24;HEAP32[r24+24>>2]=r31;r20=r17,r21=r20>>2;r22=r18;break}}else{r20=r5,r21=r20>>2;r22=r9}}while(0);r5=r20,r31=r5>>2;if(r5>>>0>=r11>>>0){_abort()}r5=r1+(r9-4)|0;r32=HEAP32[r5>>2];if((r32&1|0)==0){_abort()}do{if((r32&2|0)==0){if((r12|0)==(HEAP32[18109]|0)){r6=HEAP32[18106]+r22|0;HEAP32[18106]=r6;HEAP32[18109]=r20;HEAP32[r21+1]=r6|1;if((r20|0)==(HEAP32[18108]|0)){HEAP32[18108]=0;HEAP32[18105]=0}if(r6>>>0<=HEAP32[18110]>>>0){return}_sys_trim(0);return}if((r12|0)==(HEAP32[18108]|0)){r6=HEAP32[18105]+r22|0;HEAP32[18105]=r6;HEAP32[18108]=r20;HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;return}r6=(r32&-8)+r22|0;r33=r32>>>3;L115:do{if(r32>>>0<256){r34=HEAP32[r2+r10];r25=HEAP32[((r9|4)>>2)+r2];r8=(r33<<3)+72452|0;do{if((r34|0)!=(r8|0)){if(r34>>>0<HEAP32[18107]>>>0){_abort()}if((HEAP32[r34+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r25|0)==(r34|0)){HEAP32[18103]=HEAP32[18103]&(1<<r33^-1);break}do{if((r25|0)==(r8|0)){r35=r25+8|0}else{if(r25>>>0<HEAP32[18107]>>>0){_abort()}r4=r25+8|0;if((HEAP32[r4>>2]|0)==(r12|0)){r35=r4;break}_abort()}}while(0);HEAP32[r34+12>>2]=r25;HEAP32[r35>>2]=r34}else{r8=r11;r4=HEAP32[r10+(r2+4)];r7=HEAP32[((r9|4)>>2)+r2];L136:do{if((r7|0)==(r8|0)){r24=r9+(r1+12)|0;r19=HEAP32[r24>>2];do{if((r19|0)==0){r26=r9+(r1+8)|0;r16=HEAP32[r26>>2];if((r16|0)==0){r36=0,r37=r36>>2;break L136}else{r38=r16;r39=r26;break}}else{r38=r19;r39=r24}}while(0);while(1){r24=r38+20|0;r19=HEAP32[r24>>2];if((r19|0)!=0){r38=r19;r39=r24;continue}r24=r38+16|0;r19=HEAP32[r24>>2];if((r19|0)==0){break}else{r38=r19;r39=r24}}if(r39>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r39>>2]=0;r36=r38,r37=r36>>2;break}}else{r24=HEAP32[r2+r10];if(r24>>>0<HEAP32[18107]>>>0){_abort()}r19=r24+12|0;if((HEAP32[r19>>2]|0)!=(r8|0)){_abort()}r26=r7+8|0;if((HEAP32[r26>>2]|0)==(r8|0)){HEAP32[r19>>2]=r7;HEAP32[r26>>2]=r24;r36=r7,r37=r36>>2;break}else{_abort()}}}while(0);if((r4|0)==0){break}r7=r9+(r1+20)|0;r34=(HEAP32[r7>>2]<<2)+72716|0;do{if((r8|0)==(HEAP32[r34>>2]|0)){HEAP32[r34>>2]=r36;if((r36|0)!=0){break}HEAP32[18104]=HEAP32[18104]&(1<<HEAP32[r7>>2]^-1);break L115}else{if(r4>>>0<HEAP32[18107]>>>0){_abort()}r25=r4+16|0;if((HEAP32[r25>>2]|0)==(r8|0)){HEAP32[r25>>2]=r36}else{HEAP32[r4+20>>2]=r36}if((r36|0)==0){break L115}}}while(0);if(r36>>>0<HEAP32[18107]>>>0){_abort()}HEAP32[r37+6]=r4;r8=HEAP32[r10+(r2+2)];do{if((r8|0)!=0){if(r8>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r37+4]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);r8=HEAP32[r10+(r2+3)];if((r8|0)==0){break}if(r8>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r37+5]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;if((r20|0)!=(HEAP32[18108]|0)){r40=r6;break}HEAP32[18105]=r6;return}else{HEAP32[r5>>2]=r32&-2;HEAP32[r21+1]=r22|1;HEAP32[(r22>>2)+r31]=r22;r40=r22}}while(0);r22=r40>>>3;if(r40>>>0<256){r31=r22<<1;r32=(r31<<2)+72452|0;r5=HEAP32[18103];r36=1<<r22;do{if((r5&r36|0)==0){HEAP32[18103]=r5|r36;r41=r32;r42=(r31+2<<2)+72452|0}else{r22=(r31+2<<2)+72452|0;r37=HEAP32[r22>>2];if(r37>>>0>=HEAP32[18107]>>>0){r41=r37;r42=r22;break}_abort()}}while(0);HEAP32[r42>>2]=r20;HEAP32[r41+12>>2]=r20;HEAP32[r21+2]=r41;HEAP32[r21+3]=r32;return}r32=r20;r41=r40>>>8;do{if((r41|0)==0){r43=0}else{if(r40>>>0>16777215){r43=31;break}r42=(r41+1048320|0)>>>16&8;r31=r41<<r42;r36=(r31+520192|0)>>>16&4;r5=r31<<r36;r31=(r5+245760|0)>>>16&2;r22=14-(r36|r42|r31)+(r5<<r31>>>15)|0;r43=r40>>>((r22+7|0)>>>0)&1|r22<<1}}while(0);r41=(r43<<2)+72716|0;HEAP32[r21+7]=r43;HEAP32[r21+5]=0;HEAP32[r21+4]=0;r22=HEAP32[18104];r31=1<<r43;do{if((r22&r31|0)==0){HEAP32[18104]=r22|r31;HEAP32[r41>>2]=r32;HEAP32[r21+6]=r41;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20}else{if((r43|0)==31){r44=0}else{r44=25-(r43>>>1)|0}r5=r40<<r44;r42=HEAP32[r41>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r40|0)){break}r45=(r5>>>31<<2)+r42+16|0;r36=HEAP32[r45>>2];if((r36|0)==0){r3=131;break}else{r5=r5<<1;r42=r36}}if(r3==131){if(r45>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r45>>2]=r32;HEAP32[r21+6]=r42;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20;break}}r5=r42+8|0;r6=HEAP32[r5>>2];r36=HEAP32[18107];if(r42>>>0<r36>>>0){_abort()}if(r6>>>0<r36>>>0){_abort()}else{HEAP32[r6+12>>2]=r32;HEAP32[r5>>2]=r32;HEAP32[r21+2]=r6;HEAP32[r21+3]=r42;HEAP32[r21+6]=0;break}}}while(0);r21=HEAP32[18111]-1|0;HEAP32[18111]=r21;if((r21|0)==0){r46=72868}else{return}while(1){r21=HEAP32[r46>>2];if((r21|0)==0){break}else{r46=r21+8|0}}HEAP32[18111]=-1;return}function _realloc(r1,r2){var r3,r4,r5,r6;if((r1|0)==0){r3=_malloc(r2);return r3}if(r2>>>0>4294967231){r4=___errno_location();HEAP32[r4>>2]=12;r3=0;return r3}if(r2>>>0<11){r5=16}else{r5=r2+11&-8}r4=_try_realloc_chunk(r1-8|0,r5);if((r4|0)!=0){r3=r4+8|0;return r3}r4=_malloc(r2);if((r4|0)==0){r3=0;return r3}r5=HEAP32[r1-4>>2];r6=(r5&-8)-((r5&3|0)==0?8:4)|0;_memcpy(r4,r1,r6>>>0<r2>>>0?r6:r2);_free(r1);r3=r4;return r3}function _sys_trim(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;do{if((HEAP32[17094]|0)==0){r2=_sysconf(8);if((r2-1&r2|0)==0){HEAP32[17096]=r2;HEAP32[17095]=r2;HEAP32[17097]=-1;HEAP32[17098]=2097152;HEAP32[17099]=0;HEAP32[18214]=0;r2=_time(0)&-16^1431655768;HEAP32[17094]=r2;break}else{_abort()}}}while(0);if(r1>>>0>=4294967232){r3=0;r4=r3&1;return r4}r2=HEAP32[18109];if((r2|0)==0){r3=0;r4=r3&1;return r4}r5=HEAP32[18106];do{if(r5>>>0>(r1+40|0)>>>0){r6=HEAP32[17096];r7=Math.imul(Math.floor(((-40-r1-1+r5+r6|0)>>>0)/(r6>>>0))-1|0,r6);r8=r2;r9=72860,r10=r9>>2;while(1){r11=HEAP32[r10];if(r11>>>0<=r8>>>0){if((r11+HEAP32[r10+1]|0)>>>0>r8>>>0){r12=r9;break}}r11=HEAP32[r10+2];if((r11|0)==0){r12=0;break}else{r9=r11,r10=r9>>2}}if((HEAP32[r12+12>>2]&8|0)!=0){break}r9=_sbrk(0);r10=(r12+4|0)>>2;if((r9|0)!=(HEAP32[r12>>2]+HEAP32[r10]|0)){break}r8=_sbrk(-(r7>>>0>2147483646?-2147483648-r6|0:r7)|0);r11=_sbrk(0);if(!((r8|0)!=-1&r11>>>0<r9>>>0)){break}r8=r9-r11|0;if((r9|0)==(r11|0)){break}HEAP32[r10]=HEAP32[r10]-r8|0;HEAP32[18211]=HEAP32[18211]-r8|0;r10=HEAP32[18109];r13=HEAP32[18106]-r8|0;r8=r10;r14=r10+8|0;if((r14&7|0)==0){r15=0}else{r15=-r14&7}r14=r13-r15|0;HEAP32[18109]=r8+r15|0;HEAP32[18106]=r14;HEAP32[r15+(r8+4)>>2]=r14|1;HEAP32[r13+(r8+4)>>2]=40;HEAP32[18110]=HEAP32[17098];r3=(r9|0)!=(r11|0);r4=r3&1;return r4}}while(0);if(HEAP32[18106]>>>0<=HEAP32[18110]>>>0){r3=0;r4=r3&1;return r4}HEAP32[18110]=-1;r3=0;r4=r3&1;return r4}function _try_realloc_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29;r3=(r1+4|0)>>2;r4=HEAP32[r3];r5=r4&-8,r6=r5>>2;r7=r1,r8=r7>>2;r9=r7+r5|0;r10=r9;r11=HEAP32[18107];if(r7>>>0<r11>>>0){_abort()}r12=r4&3;if(!((r12|0)!=1&r7>>>0<r9>>>0)){_abort()}r13=(r7+(r5|4)|0)>>2;r14=HEAP32[r13];if((r14&1|0)==0){_abort()}if((r12|0)==0){if(r2>>>0<256){r15=0;return r15}do{if(r5>>>0>=(r2+4|0)>>>0){if((r5-r2|0)>>>0>HEAP32[17096]<<1>>>0){break}else{r15=r1}return r15}}while(0);r15=0;return r15}if(r5>>>0>=r2>>>0){r12=r5-r2|0;if(r12>>>0<=15){r15=r1;return r15}HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|3;HEAP32[r13]=HEAP32[r13]|1;_dispose_chunk(r7+r2|0,r12);r15=r1;return r15}if((r10|0)==(HEAP32[18109]|0)){r12=HEAP32[18106]+r5|0;if(r12>>>0<=r2>>>0){r15=0;return r15}r13=r12-r2|0;HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r13|1;HEAP32[18109]=r7+r2|0;HEAP32[18106]=r13;r15=r1;return r15}if((r10|0)==(HEAP32[18108]|0)){r13=HEAP32[18105]+r5|0;if(r13>>>0<r2>>>0){r15=0;return r15}r12=r13-r2|0;if(r12>>>0>15){HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|1;HEAP32[(r13>>2)+r8]=r12;r16=r13+(r7+4)|0;HEAP32[r16>>2]=HEAP32[r16>>2]&-2;r17=r7+r2|0;r18=r12}else{HEAP32[r3]=r4&1|r13|2;r4=r13+(r7+4)|0;HEAP32[r4>>2]=HEAP32[r4>>2]|1;r17=0;r18=0}HEAP32[18105]=r18;HEAP32[18108]=r17;r15=r1;return r15}if((r14&2|0)!=0){r15=0;return r15}r17=(r14&-8)+r5|0;if(r17>>>0<r2>>>0){r15=0;return r15}r18=r17-r2|0;r4=r14>>>3;L336:do{if(r14>>>0<256){r13=HEAP32[r6+(r8+2)];r12=HEAP32[r6+(r8+3)];r16=(r4<<3)+72452|0;do{if((r13|0)!=(r16|0)){if(r13>>>0<r11>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r10|0)){break}_abort()}}while(0);if((r12|0)==(r13|0)){HEAP32[18103]=HEAP32[18103]&(1<<r4^-1);break}do{if((r12|0)==(r16|0)){r19=r12+8|0}else{if(r12>>>0<r11>>>0){_abort()}r20=r12+8|0;if((HEAP32[r20>>2]|0)==(r10|0)){r19=r20;break}_abort()}}while(0);HEAP32[r13+12>>2]=r12;HEAP32[r19>>2]=r13}else{r16=r9;r20=HEAP32[r6+(r8+6)];r21=HEAP32[r6+(r8+3)];L338:do{if((r21|0)==(r16|0)){r22=r5+(r7+20)|0;r23=HEAP32[r22>>2];do{if((r23|0)==0){r24=r5+(r7+16)|0;r25=HEAP32[r24>>2];if((r25|0)==0){r26=0,r27=r26>>2;break L338}else{r28=r25;r29=r24;break}}else{r28=r23;r29=r22}}while(0);while(1){r22=r28+20|0;r23=HEAP32[r22>>2];if((r23|0)!=0){r28=r23;r29=r22;continue}r22=r28+16|0;r23=HEAP32[r22>>2];if((r23|0)==0){break}else{r28=r23;r29=r22}}if(r29>>>0<r11>>>0){_abort()}else{HEAP32[r29>>2]=0;r26=r28,r27=r26>>2;break}}else{r22=HEAP32[r6+(r8+2)];if(r22>>>0<r11>>>0){_abort()}r23=r22+12|0;if((HEAP32[r23>>2]|0)!=(r16|0)){_abort()}r24=r21+8|0;if((HEAP32[r24>>2]|0)==(r16|0)){HEAP32[r23>>2]=r21;HEAP32[r24>>2]=r22;r26=r21,r27=r26>>2;break}else{_abort()}}}while(0);if((r20|0)==0){break}r21=r5+(r7+28)|0;r13=(HEAP32[r21>>2]<<2)+72716|0;do{if((r16|0)==(HEAP32[r13>>2]|0)){HEAP32[r13>>2]=r26;if((r26|0)!=0){break}HEAP32[18104]=HEAP32[18104]&(1<<HEAP32[r21>>2]^-1);break L336}else{if(r20>>>0<HEAP32[18107]>>>0){_abort()}r12=r20+16|0;if((HEAP32[r12>>2]|0)==(r16|0)){HEAP32[r12>>2]=r26}else{HEAP32[r20+20>>2]=r26}if((r26|0)==0){break L336}}}while(0);if(r26>>>0<HEAP32[18107]>>>0){_abort()}HEAP32[r27+6]=r20;r16=HEAP32[r6+(r8+4)];do{if((r16|0)!=0){if(r16>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r27+4]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);r16=HEAP32[r6+(r8+5)];if((r16|0)==0){break}if(r16>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r27+5]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);if(r18>>>0<16){HEAP32[r3]=r17|HEAP32[r3]&1|2;r26=r7+(r17|4)|0;HEAP32[r26>>2]=HEAP32[r26>>2]|1;r15=r1;return r15}else{HEAP32[r3]=HEAP32[r3]&1|r2|2;HEAP32[(r2+4>>2)+r8]=r18|3;r8=r7+(r17|4)|0;HEAP32[r8>>2]=HEAP32[r8>>2]|1;_dispose_chunk(r7+r2|0,r18);r15=r1;return r15}}function _dispose_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43;r3=r2>>2;r4=0;r5=r1,r6=r5>>2;r7=r5+r2|0;r8=r7;r9=HEAP32[r1+4>>2];L412:do{if((r9&1|0)==0){r10=HEAP32[r1>>2];if((r9&3|0)==0){return}r11=r5+ -r10|0;r12=r11;r13=r10+r2|0;r14=HEAP32[18107];if(r11>>>0<r14>>>0){_abort()}if((r12|0)==(HEAP32[18108]|0)){r15=(r2+(r5+4)|0)>>2;if((HEAP32[r15]&3|0)!=3){r16=r12,r17=r16>>2;r18=r13;break}HEAP32[18105]=r13;HEAP32[r15]=HEAP32[r15]&-2;HEAP32[(4-r10>>2)+r6]=r13|1;HEAP32[r7>>2]=r13;return}r15=r10>>>3;if(r10>>>0<256){r19=HEAP32[(8-r10>>2)+r6];r20=HEAP32[(12-r10>>2)+r6];r21=(r15<<3)+72452|0;do{if((r19|0)!=(r21|0)){if(r19>>>0<r14>>>0){_abort()}if((HEAP32[r19+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r20|0)==(r19|0)){HEAP32[18103]=HEAP32[18103]&(1<<r15^-1);r16=r12,r17=r16>>2;r18=r13;break}do{if((r20|0)==(r21|0)){r22=r20+8|0}else{if(r20>>>0<r14>>>0){_abort()}r23=r20+8|0;if((HEAP32[r23>>2]|0)==(r12|0)){r22=r23;break}_abort()}}while(0);HEAP32[r19+12>>2]=r20;HEAP32[r22>>2]=r19;r16=r12,r17=r16>>2;r18=r13;break}r21=r11;r15=HEAP32[(24-r10>>2)+r6];r23=HEAP32[(12-r10>>2)+r6];L446:do{if((r23|0)==(r21|0)){r24=16-r10|0;r25=r24+(r5+4)|0;r26=HEAP32[r25>>2];do{if((r26|0)==0){r27=r5+r24|0;r28=HEAP32[r27>>2];if((r28|0)==0){r29=0,r30=r29>>2;break L446}else{r31=r28;r32=r27;break}}else{r31=r26;r32=r25}}while(0);while(1){r25=r31+20|0;r26=HEAP32[r25>>2];if((r26|0)!=0){r31=r26;r32=r25;continue}r25=r31+16|0;r26=HEAP32[r25>>2];if((r26|0)==0){break}else{r31=r26;r32=r25}}if(r32>>>0<r14>>>0){_abort()}else{HEAP32[r32>>2]=0;r29=r31,r30=r29>>2;break}}else{r25=HEAP32[(8-r10>>2)+r6];if(r25>>>0<r14>>>0){_abort()}r26=r25+12|0;if((HEAP32[r26>>2]|0)!=(r21|0)){_abort()}r24=r23+8|0;if((HEAP32[r24>>2]|0)==(r21|0)){HEAP32[r26>>2]=r23;HEAP32[r24>>2]=r25;r29=r23,r30=r29>>2;break}else{_abort()}}}while(0);if((r15|0)==0){r16=r12,r17=r16>>2;r18=r13;break}r23=r5+(28-r10)|0;r14=(HEAP32[r23>>2]<<2)+72716|0;do{if((r21|0)==(HEAP32[r14>>2]|0)){HEAP32[r14>>2]=r29;if((r29|0)!=0){break}HEAP32[18104]=HEAP32[18104]&(1<<HEAP32[r23>>2]^-1);r16=r12,r17=r16>>2;r18=r13;break L412}else{if(r15>>>0<HEAP32[18107]>>>0){_abort()}r11=r15+16|0;if((HEAP32[r11>>2]|0)==(r21|0)){HEAP32[r11>>2]=r29}else{HEAP32[r15+20>>2]=r29}if((r29|0)==0){r16=r12,r17=r16>>2;r18=r13;break L412}}}while(0);if(r29>>>0<HEAP32[18107]>>>0){_abort()}HEAP32[r30+6]=r15;r21=16-r10|0;r23=HEAP32[(r21>>2)+r6];do{if((r23|0)!=0){if(r23>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r30+4]=r23;HEAP32[r23+24>>2]=r29;break}}}while(0);r23=HEAP32[(r21+4>>2)+r6];if((r23|0)==0){r16=r12,r17=r16>>2;r18=r13;break}if(r23>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r30+5]=r23;HEAP32[r23+24>>2]=r29;r16=r12,r17=r16>>2;r18=r13;break}}else{r16=r1,r17=r16>>2;r18=r2}}while(0);r1=HEAP32[18107];if(r7>>>0<r1>>>0){_abort()}r29=r2+(r5+4)|0;r30=HEAP32[r29>>2];do{if((r30&2|0)==0){if((r8|0)==(HEAP32[18109]|0)){r31=HEAP32[18106]+r18|0;HEAP32[18106]=r31;HEAP32[18109]=r16;HEAP32[r17+1]=r31|1;if((r16|0)!=(HEAP32[18108]|0)){return}HEAP32[18108]=0;HEAP32[18105]=0;return}if((r8|0)==(HEAP32[18108]|0)){r31=HEAP32[18105]+r18|0;HEAP32[18105]=r31;HEAP32[18108]=r16;HEAP32[r17+1]=r31|1;HEAP32[(r31>>2)+r17]=r31;return}r31=(r30&-8)+r18|0;r32=r30>>>3;L511:do{if(r30>>>0<256){r22=HEAP32[r3+(r6+2)];r9=HEAP32[r3+(r6+3)];r23=(r32<<3)+72452|0;do{if((r22|0)!=(r23|0)){if(r22>>>0<r1>>>0){_abort()}if((HEAP32[r22+12>>2]|0)==(r8|0)){break}_abort()}}while(0);if((r9|0)==(r22|0)){HEAP32[18103]=HEAP32[18103]&(1<<r32^-1);break}do{if((r9|0)==(r23|0)){r33=r9+8|0}else{if(r9>>>0<r1>>>0){_abort()}r10=r9+8|0;if((HEAP32[r10>>2]|0)==(r8|0)){r33=r10;break}_abort()}}while(0);HEAP32[r22+12>>2]=r9;HEAP32[r33>>2]=r22}else{r23=r7;r10=HEAP32[r3+(r6+6)];r15=HEAP32[r3+(r6+3)];L532:do{if((r15|0)==(r23|0)){r14=r2+(r5+20)|0;r11=HEAP32[r14>>2];do{if((r11|0)==0){r19=r2+(r5+16)|0;r20=HEAP32[r19>>2];if((r20|0)==0){r34=0,r35=r34>>2;break L532}else{r36=r20;r37=r19;break}}else{r36=r11;r37=r14}}while(0);while(1){r14=r36+20|0;r11=HEAP32[r14>>2];if((r11|0)!=0){r36=r11;r37=r14;continue}r14=r36+16|0;r11=HEAP32[r14>>2];if((r11|0)==0){break}else{r36=r11;r37=r14}}if(r37>>>0<r1>>>0){_abort()}else{HEAP32[r37>>2]=0;r34=r36,r35=r34>>2;break}}else{r14=HEAP32[r3+(r6+2)];if(r14>>>0<r1>>>0){_abort()}r11=r14+12|0;if((HEAP32[r11>>2]|0)!=(r23|0)){_abort()}r19=r15+8|0;if((HEAP32[r19>>2]|0)==(r23|0)){HEAP32[r11>>2]=r15;HEAP32[r19>>2]=r14;r34=r15,r35=r34>>2;break}else{_abort()}}}while(0);if((r10|0)==0){break}r15=r2+(r5+28)|0;r22=(HEAP32[r15>>2]<<2)+72716|0;do{if((r23|0)==(HEAP32[r22>>2]|0)){HEAP32[r22>>2]=r34;if((r34|0)!=0){break}HEAP32[18104]=HEAP32[18104]&(1<<HEAP32[r15>>2]^-1);break L511}else{if(r10>>>0<HEAP32[18107]>>>0){_abort()}r9=r10+16|0;if((HEAP32[r9>>2]|0)==(r23|0)){HEAP32[r9>>2]=r34}else{HEAP32[r10+20>>2]=r34}if((r34|0)==0){break L511}}}while(0);if(r34>>>0<HEAP32[18107]>>>0){_abort()}HEAP32[r35+6]=r10;r23=HEAP32[r3+(r6+4)];do{if((r23|0)!=0){if(r23>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r35+4]=r23;HEAP32[r23+24>>2]=r34;break}}}while(0);r23=HEAP32[r3+(r6+5)];if((r23|0)==0){break}if(r23>>>0<HEAP32[18107]>>>0){_abort()}else{HEAP32[r35+5]=r23;HEAP32[r23+24>>2]=r34;break}}}while(0);HEAP32[r17+1]=r31|1;HEAP32[(r31>>2)+r17]=r31;if((r16|0)!=(HEAP32[18108]|0)){r38=r31;break}HEAP32[18105]=r31;return}else{HEAP32[r29>>2]=r30&-2;HEAP32[r17+1]=r18|1;HEAP32[(r18>>2)+r17]=r18;r38=r18}}while(0);r18=r38>>>3;if(r38>>>0<256){r30=r18<<1;r29=(r30<<2)+72452|0;r34=HEAP32[18103];r35=1<<r18;do{if((r34&r35|0)==0){HEAP32[18103]=r34|r35;r39=r29;r40=(r30+2<<2)+72452|0}else{r18=(r30+2<<2)+72452|0;r6=HEAP32[r18>>2];if(r6>>>0>=HEAP32[18107]>>>0){r39=r6;r40=r18;break}_abort()}}while(0);HEAP32[r40>>2]=r16;HEAP32[r39+12>>2]=r16;HEAP32[r17+2]=r39;HEAP32[r17+3]=r29;return}r29=r16;r39=r38>>>8;do{if((r39|0)==0){r41=0}else{if(r38>>>0>16777215){r41=31;break}r40=(r39+1048320|0)>>>16&8;r30=r39<<r40;r35=(r30+520192|0)>>>16&4;r34=r30<<r35;r30=(r34+245760|0)>>>16&2;r18=14-(r35|r40|r30)+(r34<<r30>>>15)|0;r41=r38>>>((r18+7|0)>>>0)&1|r18<<1}}while(0);r39=(r41<<2)+72716|0;HEAP32[r17+7]=r41;HEAP32[r17+5]=0;HEAP32[r17+4]=0;r18=HEAP32[18104];r30=1<<r41;if((r18&r30|0)==0){HEAP32[18104]=r18|r30;HEAP32[r39>>2]=r29;HEAP32[r17+6]=r39;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}if((r41|0)==31){r42=0}else{r42=25-(r41>>>1)|0}r41=r38<<r42;r42=HEAP32[r39>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r38|0)){break}r43=(r41>>>31<<2)+r42+16|0;r39=HEAP32[r43>>2];if((r39|0)==0){r4=437;break}else{r41=r41<<1;r42=r39}}if(r4==437){if(r43>>>0<HEAP32[18107]>>>0){_abort()}HEAP32[r43>>2]=r29;HEAP32[r17+6]=r42;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}r16=r42+8|0;r43=HEAP32[r16>>2];r4=HEAP32[18107];if(r42>>>0<r4>>>0){_abort()}if(r43>>>0<r4>>>0){_abort()}HEAP32[r43+12>>2]=r29;HEAP32[r16>>2]=r29;HEAP32[r17+2]=r43;HEAP32[r17+3]=r42;HEAP32[r17+6]=0;return}
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
