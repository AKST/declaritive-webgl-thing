// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/renderer/core.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Primative = exports.UiNode = exports.createElement = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var createElement = function createElement(kind, props) {
  var _kind$split = kind.split(':'),
      _kind$split2 = _slicedToArray(_kind$split, 2),
      prefix = _kind$split2[0],
      subKind = _kind$split2[1];

  switch (prefix) {
    case 'p':
      return UiNode.primative(Primative.createPrimative(subKind, props));

    case 'component':
      return UiNode.component(props);

    default:
      throw new Error("element kind not supported, ".concat(kind));
  }
};

exports.createElement = createElement;
var UiNode = {
  component: function component(_component) {
    return {
      type: 'component',
      component: _component
    };
  },
  primative: function primative(_primative) {
    return {
      type: 'primative',
      primative: _primative
    };
  }
};
exports.UiNode = UiNode;
var Primative = {
  setBufferData: function setBufferData(attribute, bufferKind, data, drawKind) {
    return {
      type: 'set-buffer-data',
      attribute: attribute,
      bufferKind: bufferKind,
      data: data,
      drawKind: drawKind
    };
  },
  setUniform: function setUniform(key, value, children) {
    return {
      type: 'set-uniform',
      key: key,
      value: value,
      children: children
    };
  },
  setProgram: function setProgram(program, children) {
    return {
      type: 'set-program',
      program: program,
      children: children
    };
  },
  createPrimative: function createPrimative(kind, props) {
    switch (kind) {
      case 'set-buffer-data':
        return Primative.setBufferData(props.attribute, props.bufferKind, props.data, props.drawKind);

      case 'set-program':
        return Primative.setProgram(props.program, props.children);

      case 'set-uniform':
        return Primative.setUniform(props.key, props.value, props.children);

      default:
        throw new Error('unknown primative');
    }
  }
};
exports.Primative = Primative;
},{}],"src/ui/main.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Main = void 0;

var _core = require("/src/renderer/core");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function squarePoints(x, y, w, h) {
  return [x, y, x + w, y, x, y + h, x, y + h, x + w, y, x + w, y + h];
}

var Main =
/*#__PURE__*/
function () {
  function Main(program) {
    _classCallCheck(this, Main);

    this.program = program;
    this.data = new Float32Array(squarePoints(-0.5, -0.5, 1, 1));
  }

  _createClass(Main, [{
    key: "render",
    value: function render(env) {
      return (0, _core.createElement)('p:set-program', {
        program: this.program,
        children: [(0, _core.createElement)('p:set-buffer-data', {
          attribute: this.bufferAttribute,
          data: this.data,
          drawKind: WebGLRenderingContext.TRIANGLES,
          bufferKind: WebGLRenderingContext.STATIC_DRAW
        })]
      });
    }
  }, {
    key: "bufferAttribute",
    get: function get() {
      return {
        name: 'position',
        size: 2,
        program: this.program
      };
    }
  }]);

  return Main;
}();

exports.Main = Main;
},{"/src/renderer/core":"src/renderer/core.js"}],"src/renderer/runtime.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderRoot = renderRoot;

function renderPrimative(primative, context) {
  switch (primative.type) {
    case 'set-program':
      context.useProgram(primative.program);
      primative.children.forEach(function (uiNode) {
        return renderUiNode(uiNode, context);
      });
      break;

    case 'set-buffer-data':
      console.log(primative);
      var buffer = context.createBuffer();
      context.bindBuffer(WebGLRenderingContext.ARRAY_BUFFER, buffer);
      context.bufferData(WebGLRenderingContext.ARRAY_BUFFER, primative.data, primative.bufferKind);
      var _primative$attribute = primative.attribute,
          program = _primative$attribute.program,
          name = _primative$attribute.name,
          size = _primative$attribute.size;
      var attributeLocation = context.getAttribLocation(program, name);
      context.vertexAttribPointer(attributeLocation, size, context.FLOAT, false, 0, 0);
      context.enableVertexAttribArray(attributeLocation);
      context.drawArrays(primative.drawKind, 0, primative.data.length / size);
      break;

    default:
      throw new Error("unsuppported primative: ".concat(primative.type));
  }
}

function renderUiNode(uiNode, context) {
  switch (uiNode.type) {
    case 'primative':
      renderPrimative(uiNode.primative, context);
      break;

    case 'component':
      var uiNodeOutput = uiNode.component.render(undefined);
      renderUiNode(uiNodeOutput, context);
      break;

    default:
      throw new Error("unsuppported ui node: ".concat(uiNode.type));
  }
}

function applyPatch(uiNode, state, context) {
  if (state === undefined) {
    renderUiNode(uiNode, context);
    return uiNode;
  } else {
    return state;
  }
}

function renderRoot(patch, context) {
  var renderedElements = patch.map(function (subPatch) {
    return applyPatch(subPatch, undefined, context);
  });
}
},{}],"src/util/webgl/create.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createShader = createShader;
exports.createProgram = createProgram;

function createShader(context, shaderSource, type) {
  var shader = context.createShader(type);
  context.shaderSource(shader, shaderSource);
  context.compileShader(shader);

  if (context.getShaderParameter(shader, WebGLRenderingContext.COMPILE_STATUS)) {
    return shader;
  }

  var reason = context.getShaderInfoLog(shader);
  throw new Error("failed to create shader: ".concat(reason));
}

function createProgram(context, vertexSource, fragmentSource) {
  var program = context.createProgram();
  context.attachShader(program, createShader(context, vertexSource, context.VERTEX_SHADER));
  context.attachShader(program, createShader(context, fragmentSource, context.FRAGMENT_SHADER));
  context.linkProgram(program);

  if (context.getProgramParameter(program, WebGLRenderingContext.LINK_STATUS)) {
    return program;
  }

  throw new Error('failed to create program');
}
},{}],"src/main.js":[function(require,module,exports) {
"use strict";

var _main = require("/src/ui/main.js");

var _runtime = require("/src/renderer/runtime.js");

var _core = require("/src/renderer/core.js");

var _create = require("/src/util/webgl/create.js");

var fragmentSource = "\n  void main() {\n    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n  }\n";
var vertexSource = "\n  attribute vec2 position;\n\n  void main() {\n    gl_Position = vec4(position, 0.0, 1.0);\n  }\n";
document.addEventListener('DOMContentLoaded', function () {
  var canva = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var context = canvas.getContext('webgl');
  var program = (0, _create.createProgram)(context, vertexSource, fragmentSource);
  (0, _runtime.renderRoot)([(0, _core.createElement)('component', new _main.Main(program))], context);
});
},{"/src/ui/main.js":"src/ui/main.js","/src/renderer/runtime.js":"src/renderer/runtime.js","/src/renderer/core.js":"src/renderer/core.js","/src/util/webgl/create.js":"src/util/webgl/create.js"}],"../../../.config/yarn/global/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "59266" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../.config/yarn/global/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/main.js"], null)
//# sourceMappingURL=/main.1e43358e.js.map