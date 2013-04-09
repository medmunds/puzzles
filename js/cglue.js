(function(globalScope) {
    "use strict";

    // Glue for referencing JS objects from C as (opaque) void* handles.

    var handle_map = {},
        last_handle = 7000;

    /**
     * Wrap a JavaScript object as an (integer) C handle that can be passed
     * as an opaque pointer (void*) to C functions.
     * (Required, because the Emscripten runtime can't store JS objects in its Int32Array heap.)
     *
     * @param obj
     * @returns integer
     */
    function CHandle(obj) {
        var chandle = obj.chandle;
        if (!chandle) {
            chandle = ++last_handle;
            handle_map[chandle] = obj;
            obj.chandle = chandle;
            obj.free = function() {
                if (handle_map[chandle] === obj) {
                    handle_map[chandle] = "deadbeef";
                } else {
                    throw "calling CHandle.free on already-freed object";
                }
            };
        }
        return chandle;
    }

    var exported_functions = {};

    /**
     * Export a JavaScript function to C. (This is the reverse of Module.cwrap.)
     * Integrates with CHandle to simplify referring to JS objects as opaque "pointers"
     * (void* -- integers) on the C side.
     *
     * @param jsfunc      The JavaScript function to export
     * @param name        String extern function name as declared in C code (without leading '_')
     * @param [rettype]   Return type of the function, 'number' or 'string' or 'void' or 'object'.
     *                    Used to convert JS return value to appropriate C value.
     * @param [argtypes]  Array of parameter types, used to convert C arguments to appropriate
     *                    JS values. 'number' or 'string'; or 'object' to map C void* to JS object;
     *                    or 'thisp' to use handle as 'this' when calling jsfunc; or 'ignore' to
     *                    omit the param entirely when calling jsfunc.
     */
    function export_to_c(jsfunc, name, rettype, argtypes) {
        rettype = rettype || 'void';
        argtypes = argtypes || [];
        var _name = '_' + name;
        globalScope[_name] = exported_functions[_name] = function() {
            // Convert arguments from C to JavaScript types:
            var thisp,
                args = [];
            for (var i = 0; i < arguments.length; i++) {
                var arg = arguments[i];
                switch (argtypes[i]) {
                    case 'string':
                        args.push(Pointer_stringify(arg));
                        break;
                    case 'object':
                        args.push(handle_map[arg]);
                        break;
                    case 'thisp':
                        thisp = handle_map[arg];
                        break;
                    case 'bool':
                        args.push(!!arg);
                        break;
                    case 'number':
                        args.push(Number(arg));
                        break;
                    case 'ignore':
                        break;
                    default:
                        args.push(arg);
                        break;
                }
            }
            var retval = jsfunc.apply(thisp, args);
            // Convert return from JavaScript to C types
            switch (rettype) {
                case 'string':
                    retval = allocate(intArrayFromString(retval), 'i8', ALLOC_STACK);
                    break;
                case 'object':
                    retval = CHandle(retval);
                    break;
                case 'bool':
                    retval = !!retval;
                    break;
                case 'number':
                    retval = Number(retval);
                    break;
            }
            return retval;
        }
    }
    Module.export_to_c = export_to_c;

    function reexport_all_to_c(scope) {
        // Necessary to work around an IE8 bug that removes our functions
        // from window when the Emscripten generated code declares var statements
        // for them. Call from Emscripten pre-js.
        scope = scope || globalScope;
        Object.keys(exported_functions).map(function(_name) {
            scope[_name] = exported_functions[_name];
        });
    }
    Module.reexport_all_to_c = reexport_all_to_c;

    function c_to_js_array(ptr, len, type) {
        var ptrtype = type + '*',
            size = Runtime.getNativeTypeSize(type),
            arr = [];
        for (var i = 0; i < len; i++) {
            arr.push(getValue(ptr, ptrtype));
            ptr += size;
        }
        return arr;
    }
    Module.c_to_js_array = c_to_js_array;

    globalScope.CHandle = CHandle;
})(window);


