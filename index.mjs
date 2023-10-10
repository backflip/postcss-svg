import { URLSearchParams } from 'url';
import Svgo from 'svgo';
import fs from 'fs';
import path from 'path';
import { XmlDocument } from 'xmldoc';
import parser from 'postcss-values-parser';
import postcss from 'postcss';

function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}

/* Clone from element
/* ========================================================================== */

function elementClone(element) {
  // element clone
  const clone = {};

  // for each key in the element
  for (let key in element) {
    if (element[key] instanceof Array) {
      // conditionally clone the child array
      clone[key] = element[key].map(elementClone);
    } else if (typeof element[key] === 'object') {
      // otherwise, conditionally clone the child object
      clone[key] = elementClone(element[key]);
    } else {
      // otherwise, copy the child
      clone[key] = element[key];
    }
  }

  // return the element clone
  return clone;
}

/* Element by ID
/* ========================================================================== */

function elementById(element, id) {
  // conditionally return the matching element
  if (element.attr && element.attr.id === id) {
    return element;
  } else if (element.children) {
    // otherwise, return matching child elements
    let index = -1;
    let child;
    while (child = element.children[++index]) {
      child = elementById(child, id);
      if (child) {
        return child;
      }
    }
  }

  // return undefined if no matching elements are find
  return undefined;
}

/* Tooling
/* ========================================================================== */

/* Element as a data URI SVG
/* ========================================================================== */

function elementAsDataURISvg(element, document, opts) {
  // rebuild element as <svg>
  element.name = 'svg';
  delete element.attr.id;
  element.attr.viewBox = element.attr.viewBox || document.attr.viewBox;
  element.attr.xmlns = 'http://www.w3.org/2000/svg';
  const xml = element.toString({
    compressed: true
  });

  // promise data URI
  return (opts.svgo ? new Svgo(opts.svgo).optimize(xml) : Promise.resolve({
    data: xml
  })).then(result => `data:image/svg+xml;${opts.utf8 ? `charset=utf-8,${encodeUTF8(result.data)}` : `base64,${Buffer.from(result.data).toString('base64')}`}`);
}

/* Inline Tooling
/* ========================================================================== */

// return a UTF-8-encoded string
function encodeUTF8(string) {
  // encode as UTF-8
  return encodeURIComponent(string.replace(
  // collapse whitespace
  /[\n\r\s\t]+/g, ' ').replace(
  // remove comments
  /<\!--([\W\w]*(?=-->))-->/g, '').replace(
  // pre-encode ampersands
  /&/g, '%26')).replace(
  // escape commas
  /'/g, '\\\'').replace(
  // un-encode compatible characters
  /%20/g, ' ').replace(/%22/g, '\'').replace(/%2F/g, '/').replace(/%3A/g, ':').replace(/%3D/g, '=').replace(
  // encode additional incompatible characters
  /\(/g, '%28').replace(/\)/g, '%29');
}

/* Tooling
/* ========================================================================== */

/* Promise the XML tree of the closest svg
/* ========================================================================== */

function readClosestSVG(id, wds, cache) {
  return wds.reduce(
  // for each working directory
  (promise, wd) => promise.catch(() => {
    // set cwd as the current working directory
    let cwd = wd;

    // if id starts with root
    if (starts_with_root(id)) {
      // set cwd as the root
      cwd = '';
    }

    // resolve as a file using cwd/id as file
    return resolveAsFile(path.join(cwd, id), cache)
    // otherwise, resolve as a directory using cwd/id as dir
    .catch(() => resolve_as_directory(path.join(cwd, id), cache))
    // otherwise, if id does not start with root or relative
    .catch(() => !starts_with_root_or_relative(id)
    // resolve as a module using cwd and id
    ? resolve_as_module(cwd, id, cache) : Promise.reject())
    // otherwise, reject as id not found
    .catch(() => Promise.reject(`${id} not found`));
  }), Promise.reject()).then(
  // resolve xml contents
  result => ({
    file: result.file,
    document: new XmlDocument(result.contents)
  }));
}
function resolveAsFile(file, cache) {
  // if file is a file, resolve the contents of file
  return file_contents(file, cache)
  // otherwise, if file.svg is a file, resolve the contents of file.svg
  .catch(() => file_contents(`${file}.svg`, cache));
}
function resolve_as_directory(dir, cache) {
  // if dir/package.json is a file, set pkg as the JSON contents of dir/package.json
  return json_contents(dir, cache).then(
  // if pkg contains a media field
  pkg => 'media' in pkg
  // resolve the contents of dir/pkg.media
  ? file_contents(path.join(dir, pkg.media), cache)
  // otherwise, if pkg contains a main field
  : 'main' in pkg
  // resolve the contents of dir/pkg.main
  ? file_contents(path.join(dir, pkg.main), cache)
  // otherwise, if dir/index.svg is a file, resolve the contents of dir/index.svg
  : file_contents(path.join(dir, 'index.svg'), cache));
}
function resolve_as_module(cwd, id, cache) {
  return node_modules_dirs(cwd).reduce(
  // for each dir in module dirs using cwd:
  (promise, dir) => promise.catch(
  // resolve as a file using dir/id as file
  () => resolveAsFile(path.join(dir, id), cache)
  // otherwise, resolve as a directory using dir/id as dir
  .catch(() => resolve_as_directory(path.join(dir, id), cache))), Promise.reject());
}
function node_modules_dirs(cwd) {
  // set segments as cwd split by the separator
  const segments = cwd.split(path.sep);

  // set count as the length of segments
  let count = segments.length;

  // set dirs as an empty array
  const dirs = [];

  // while count is greater than 0:
  while (count > 0) {
    // if segments[count] is not node_modules
    if (segments[count] !== 'node_modules') {
      // push a new item to dirs as the separator-joined segments[0 - count] and node_modules
      dirs.push(path.join(segments.slice(0, count).join('/') || '/', 'node_modules'));
    }

    // set count as count minus 1
    --count;
  }
  return dirs;
}
function file_contents(file, cache) {
  // if file is a file, resolve the contents of file
  cache[file] = cache[file] || new Promise((resolvePromise, rejectPromise) => fs.readFile(file, 'utf8', (error, contents) => error ? rejectPromise(error) : resolvePromise({
    file,
    contents
  })));
  return cache[file];
}
function json_contents(dir, cache) {
  // path of dir/package.json
  const pkg = path.join(dir, 'package.json');

  // resolve the JSON contents of dir/package.json
  cache[pkg] = cache[pkg] || new Promise((resolvePromise, rejectPromise) => fs.readFile(pkg, 'utf8', (error, contents) => error ? rejectPromise(error) : resolvePromise(JSON.parse(contents))));
  return cache[pkg];
}
function starts_with_root(id) {
  return /^\//.test(id);
}
function starts_with_root_or_relative(id) {
  return /^\.{0,2}\//.test(id);
}

/* Tooling
/* ========================================================================== */

/* Transpile element styles with params
/* ========================================================================== */

function transpileStyles(element, params) {
  if (hasStyleAttr(element)) {
    // conditionally update the style attribute
    element.attr.style = updatedStyleAttr(element.attr.style, params);
  }
  if (element.children) {
    // conditionally walk the child elements
    let index = -1;
    let child;
    while (child = element.children[++index]) {
      transpileStyles(child, params);
    }
  }
}

/* Inline Tooling
/* ========================================================================== */

function hasStyleAttr(element) {
  return element.attr && element.attr.style;
}
function updatedStyleAttr(style, params) {
  // parse the style attribute
  const styleAST = postcss.parse(style);

  // walk the declarations within the style attribute
  styleAST.walkDecls(decl => {
    const declAST = parser(decl.value).parse();

    // update the declaration with all transpiled var()s
    declAST.walk(node => {
      // conditionally update the var()
      if (isVarFuntion(node)) {
        transpileVar(node, params);
      }
    });
    decl.value = declAST.toString();
  });

  // return the updated style attribute
  return styleAST.toString();
}

// whether the node is a var()
function isVarFuntion(node) {
  return node.type === 'func' && node.value === 'var' && Object(node.nodes).length && /^--/.test(node.nodes[1].value);
}

// transpile var()
function transpileVar(node, params) {
  // css variable
  const cssvar = node.nodes[1].value;

  // css variable backup value
  const backup = node.nodes[3];
  if (cssvar in params) {
    // conditionally transpile the css var() function into the matched param
    node.replaceWith(parser.word({
      value: params[cssvar]
    }));
  } else if (backup) {
    // conditionally transpile the css var() function into the backup value
    node.replaceWith(backup);
  }
}

/* Transpile declarations
/* ========================================================================== */

function transpileDecl(result, promises, decl, opts, cache) {
  // eslint-disable-line max-params
  // path to the current working file and directory by declaration
  const declWF = path.resolve(decl.source && decl.source.input && decl.source.input.file ? decl.source.input.file : result.root.source && result.root.source.input && result.root.source.input.file ? result.root.source.input.file : path.join(process.cwd(), 'index.css'));
  const declWD = path.dirname(declWF);

  // list of files to watch
  const files = {};

  // walk each node of the declaration
  const declAST = parser(decl.value).parse();
  declAST.walk(node => {
    // if the node is a url containing an svg fragment
    if (isExternalURLFunction(node)) {
      // <url> of url(<url>)
      const urlNode = node.nodes[1];

      // <url> split by fragment identifier symbol (#)
      const urlParts = urlNode.value.split('#');

      // <url> src and query string
      const _urlParts$0$split = urlParts[0].split('?'),
        _urlParts$0$split2 = _slicedToArray(_urlParts$0$split, 2),
        src = _urlParts$0$split2[0],
        queryString = _urlParts$0$split2[1];

      // <url> fragment identifier
      const id = urlParts.slice(1).join('#');

      // whether the <url> has a fragment identifier
      const hasID = urlParts.length > 1;

      // whether the <url> has search params
      const searchParams = new URLSearchParams(queryString);

      // <url> param()s
      const params = _objectSpread2(_objectSpread2({}, paramsFromSearchParams(searchParams)), paramsFromNodes(node.nodes.slice(2, -1)));
      node.nodes.slice(2, -1).forEach(childNode => {
        childNode.remove();
      });
      promises.push(readClosestSVG(src, [declWD].concat(opts.dirs), cache).then(svgResult => {
        const file = svgResult.file;
        const document = svgResult.document;

        // conditionally watch svgs for changes
        if (!files[file]) {
          files[file] = result.messages.push({
            type: 'dependency',
            file,
            parent: declWF
          });
        }

        // document cache
        const ids = document.ids = document.ids || {};

        // conditionally update the document cache
        if (hasID && !ids[id]) {
          ids[id] = elementById(document, id);
        }

        // element fragment or document
        const element = hasID ? ids[id] : document;

        // if the element exists
        if (element) {
          // clone of the element
          const clone = elementClone(element);

          // update the clone styles using the params
          transpileStyles(clone, params);

          // promise updated <url> and declaration
          return elementAsDataURISvg(clone, document, opts).then(xml => {
            // update <url>
            urlNode.value = xml;

            // conditionally quote <url>
            if (opts.utf8) {
              urlNode.replaceWith(parser.string({
                value: urlNode.value,
                quoted: true,
                raws: Object.assign(urlNode.raws, {
                  quote: '"'
                })
              }));
            }

            // update declaration
            decl.value = String(declAST);
          });
        }
      }).catch(error => {
        result.warn(error, node);
      }));
    }
  });
}

/* Inline Tooling
/* ========================================================================== */

// whether the node if a function()
function isExternalURLFunction(node) {
  return node.type === 'func' && node.value === 'url' && Object(node.nodes).length && /^(?!data:)/.test(node.nodes[1].value);
}

// params from nodes
function paramsFromNodes(nodes) {
  // valid params as an object
  const params = {};

  // for each node
  nodes.forEach(node => {
    // conditionally add the valid param
    if (isFilledParam(node)) {
      params[node.nodes[1].value] = String(node.nodes[2]).trim();
    }
  });

  // return valid params as an object
  return params;
}

// params from URL search params
function paramsFromSearchParams(searchParams) {
  // valid params as an object
  const params = {};

  // for each search param
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  // return valid params as an object
  return params;
}

// whether the node is a filled param()
function isFilledParam(node) {
  return node.type === 'func' && node.value === 'param' && node.nodes.length === 4 && node.nodes[1].type === 'word';
}

/* Inline SVGs
/* ========================================================================== */

const plugin = opts => {
  return {
    postcssPlugin: 'postcss-svg',
    prepare(result) {
      // svg promises array
      const promises = [];

      // plugin options
      const normalizedOpts = {
        // additional directories to search for SVGs
        dirs: 'dirs' in Object(opts) ? [].concat(opts.dirs) : [],
        // whether to encode as utf-8
        utf8: 'utf8' in Object(opts) ? Boolean(opts.utf8) : true,
        // whether and how to compress with svgo
        svgo: 'svgo' in Object(opts) ? Object(opts.svgo) : false
      };

      // cache of file content and json content promises
      const cache = {};
      return {
        Once(root) {
          // for each declaration in the stylesheet
          root.walkDecls(decl => {
            // if the declaration contains a url()
            if (containsUrlFunction(decl)) {
              // transpile declaration parts
              transpileDecl(result, promises, decl, normalizedOpts, cache);
            }
          });
        },
        OnceExit() {
          return _asyncToGenerator(function* () {
            // wait for chained svg promises array
            yield Promise.all(promises);
          })();
        }
      };
    }
  };
};
plugin.postcss = true;

/* Inline Tooling
/* ========================================================================== */

// whether the declaration contains a url()
function containsUrlFunction(decl) {
  return /(^|\s)url\(.+\)(\s|$)/.test(decl.value);
}

export default plugin;
//# sourceMappingURL=index.mjs.map
