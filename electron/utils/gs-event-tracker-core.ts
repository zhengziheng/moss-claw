/*!
 * gs-event-tracker-core v1.0.4
 * (c) 2023-2023
 * Released under the MIT License.
 */
'use strict';
import axios from 'axios';
import { logger, LogLevel } from './logger';

var commonjsGlobal =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
    ? global
    : typeof self !== 'undefined'
    ? self
    : {};

/*!
 * gs-event-tracker-core v1.0.4
 * (c) 2023-2023
 * Released under the MIT License.
 */
var commonjsGlobal =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
    ? global
    : typeof self !== 'undefined'
    ? self
    : {};

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var defineProperty = Object.defineProperty;
var gOPD = Object.getOwnPropertyDescriptor;
var isArray = function isArray(arr) {
  if (typeof Array.isArray === 'function') {
    return Array.isArray(arr);
  }
  return toStr.call(arr) === '[object Array]';
};
var isPlainObject = function isPlainObject(obj) {
  if (!obj || toStr.call(obj) !== '[object Object]') {
    return false;
  }
  var hasOwnConstructor = hasOwn.call(obj, 'constructor');
  var hasIsPrototypeOf =
    obj.constructor &&
    obj.constructor.prototype &&
    hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
  // Not own constructor property must be Object
  if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    return false;
  }

  // Own properties are enumerated firstly, so to speed up,
  // if last one is own, then all properties are own.
  var key;
  for (key in obj) {
    /**/
  }
  return typeof key === 'undefined' || hasOwn.call(obj, key);
};

// If name is '__proto__', and Object.defineProperty is available, define __proto__ as an own property on target
var setProperty = function setProperty(target, options) {
  if (defineProperty && options.name === '__proto__') {
    defineProperty(target, options.name, {
      enumerable: true,
      configurable: true,
      value: options.newValue,
      writable: true,
    });
  } else {
    target[options.name] = options.newValue;
  }
};

// Return undefined instead of __proto__ if '__proto__' is not an own property
var getProperty = function getProperty(obj, name) {
  if (name === '__proto__') {
    if (!hasOwn.call(obj, name)) {
      return void 0;
    } else if (gOPD) {
      // In early versions of node, obj['__proto__'] is buggy when obj has
      // __proto__ as an own property. Object.getOwnPropertyDescriptor() works.
      return gOPD(obj, name).value;
    }
  }
  return obj[name];
};
var extend = function extend() {
  var options, name, src, copy, copyIsArray, clone;
  var target = arguments[0];
  var i = 1;
  var length = arguments.length;
  var deep = false;

  // Handle a deep copy situation
  if (typeof target === 'boolean') {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }
  if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
    target = {};
  }
  for (; i < length; ++i) {
    options = arguments[i];
    // Only deal with non-null/undefined values
    if (options != null) {
      // Extend the base object
      for (name in options) {
        src = getProperty(target, name);
        copy = getProperty(options, name);

        // Prevent never-ending loop
        if (target !== copy) {
          // Recurse if we're merging plain objects or arrays
          if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && isArray(src) ? src : [];
            } else {
              clone = src && isPlainObject(src) ? src : {};
            }

            // Never move original objects, clone them
            setProperty(target, {
              name: name,
              newValue: extend(deep, clone, copy),
            });

            // Don't bring in undefined values
          } else if (typeof copy !== 'undefined') {
            setProperty(target, {
              name: name,
              newValue: copy,
            });
          }
        }
      }
    }
  }

  // Return the modified object
  return target;
};

var platformExports = {};
var platform$1 = {
  get exports() {
    return platformExports;
  },
  set exports(v) {
    platformExports = v;
  },
};

/*!
 * Platform.js v1.3.6
 * Copyright 2014-2020 Benjamin Tan
 * Copyright 2011-2013 John-David Dalton
 * Available under MIT license
 */
(function (module, exports) {
  (function () {
    /** Used to determine if values are of the language type `Object`. */
    var objectTypes = {
      function: true,
      object: true,
    };

    /** Used as a reference to the global object. */
    var root = (objectTypes[typeof window] && window) || this;

    /** Detect free variable `exports`. */
    var freeExports = exports;

    /** Detect free variable `module`. */
    var freeModule = module && !module.nodeType && module;

    /** Detect free variable `global` from Node.js or Browserified code and use it as `root`. */
    var freeGlobal =
      freeExports && freeModule && typeof commonjsGlobal == 'object' && commonjsGlobal;
    if (
      freeGlobal &&
      (freeGlobal.global === freeGlobal ||
        freeGlobal.window === freeGlobal ||
        freeGlobal.self === freeGlobal)
    ) {
      root = freeGlobal;
    }

    /**
     * Used as the maximum length of an array-like object.
     * See the [ES6 spec](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
     * for more details.
     */
    var maxSafeInteger = Math.pow(2, 53) - 1;

    /** Regular expression to detect Opera. */
    var reOpera = /\bOpera/;

    /** Used for native method references. */
    var objectProto = Object.prototype;

    /** Used to check for own properties of an object. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /** Used to resolve the internal `[[Class]]` of values. */
    var toString = objectProto.toString;

    /*--------------------------------------------------------------------------*/

    /**
     * Capitalizes a string value.
     *
     * @private
     * @param {string} string The string to capitalize.
     * @returns {string} The capitalized string.
     */
    function capitalize(string) {
      string = String(string);
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * A utility function to clean up the OS name.
     *
     * @private
     * @param {string} os The OS name to clean up.
     * @param {string} [pattern] A `RegExp` pattern matching the OS name.
     * @param {string} [label] A label for the OS.
     */
    function cleanupOS(os, pattern, label) {
      // Platform tokens are defined at:
      // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
      // http://web.archive.org/web/20081122053950/http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
      var data = {
        '10.0': '10',
        '6.4': '10 Technical Preview',
        '6.3': '8.1',
        '6.2': '8',
        '6.1': 'Server 2008 R2 / 7',
        '6.0': 'Server 2008 / Vista',
        '5.2': 'Server 2003 / XP 64-bit',
        '5.1': 'XP',
        '5.01': '2000 SP1',
        '5.0': '2000',
        '4.0': 'NT',
        '4.90': 'ME',
      };
      // Detect Windows version from platform tokens.
      if (
        pattern &&
        label &&
        /^Win/i.test(os) &&
        !/^Windows Phone /i.test(os) &&
        (data = data[/[\d.]+$/.exec(os)])
      ) {
        os = 'Windows ' + data;
      }
      // Correct character case and cleanup string.
      os = String(os);
      if (pattern && label) {
        os = os.replace(RegExp(pattern, 'i'), label);
      }
      os = format(
        os
          .replace(/ ce$/i, ' CE')
          .replace(/\bhpw/i, 'web')
          .replace(/\bMacintosh\b/, 'Mac OS')
          .replace(/_PowerPC\b/i, ' OS')
          .replace(/\b(OS X) [^ \d]+/i, '$1')
          .replace(/\bMac (OS X)\b/, '$1')
          .replace(/\/(\d)/, ' $1')
          .replace(/_/g, '.')
          .replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '')
          .replace(/\bx86\.64\b/gi, 'x86_64')
          .replace(/\b(Windows Phone) OS\b/, '$1')
          .replace(/\b(Chrome OS \w+) [\d.]+\b/, '$1')
          .split(' on ')[0]
      );
      return os;
    }

    /**
     * An iteration utility for arrays and objects.
     *
     * @private
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} callback The function called per iteration.
     */
    function each(object, callback) {
      var index = -1,
        length = object ? object.length : 0;
      if (typeof length == 'number' && length > -1 && length <= maxSafeInteger) {
        while (++index < length) {
          callback(object[index], index, object);
        }
      } else {
        forOwn(object, callback);
      }
    }

    /**
     * Trim and conditionally capitalize string values.
     *
     * @private
     * @param {string} string The string to format.
     * @returns {string} The formatted string.
     */
    function format(string) {
      string = trim(string);
      return /^(?:webOS|i(?:OS|P))/.test(string) ? string : capitalize(string);
    }

    /**
     * Iterates over an object's own properties, executing the `callback` for each.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} callback The function executed per own property.
     */
    function forOwn(object, callback) {
      for (var key in object) {
        if (hasOwnProperty.call(object, key)) {
          callback(object[key], key, object);
        }
      }
    }

    /**
     * Gets the internal `[[Class]]` of a value.
     *
     * @private
     * @param {*} value The value.
     * @returns {string} The `[[Class]]`.
     */
    function getClassOf(value) {
      return value == null ? capitalize(value) : toString.call(value).slice(8, -1);
    }

    /**
     * Host objects can return type values that are different from their actual
     * data type. The objects we are concerned with usually return non-primitive
     * types of "object", "function", or "unknown".
     *
     * @private
     * @param {*} object The owner of the property.
     * @param {string} property The property to check.
     * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
     */
    function isHostType(object, property) {
      var type = object != null ? typeof object[property] : 'number';
      return (
        !/^(?:boolean|number|string|undefined)$/.test(type) &&
        (type == 'object' ? !!object[property] : true)
      );
    }

    /**
     * Prepares a string for use in a `RegExp` by making hyphens and spaces optional.
     *
     * @private
     * @param {string} string The string to qualify.
     * @returns {string} The qualified string.
     */
    function qualify(string) {
      return String(string).replace(/([ -])(?!$)/g, '$1?');
    }

    /**
     * A bare-bones `Array#reduce` like utility function.
     *
     * @private
     * @param {Array} array The array to iterate over.
     * @param {Function} callback The function called per iteration.
     * @returns {*} The accumulated result.
     */
    function reduce(array, callback) {
      var accumulator = null;
      each(array, function (value, index) {
        accumulator = callback(accumulator, value, index, array);
      });
      return accumulator;
    }

    /**
     * Removes leading and trailing whitespace from a string.
     *
     * @private
     * @param {string} string The string to trim.
     * @returns {string} The trimmed string.
     */
    function trim(string) {
      return String(string).replace(/^ +| +$/g, '');
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a new platform object.
     *
     * @memberOf platform
     * @param {Object|string} [ua=navigator.userAgent] The user agent string or
     *  context object.
     * @returns {Object} A platform object.
     */
    function parse(ua) {
      /** The environment context object. */
      var context = root;

      /** Used to flag when a custom context is provided. */
      var isCustomContext = ua && typeof ua == 'object' && getClassOf(ua) != 'String';

      // Juggle arguments.
      if (isCustomContext) {
        context = ua;
        ua = null;
      }

      /** Browser navigator object. */
      var nav = context.navigator || {};

      /** Browser user agent string. */
      var userAgent = nav.userAgent || '';
      ua || (ua = userAgent);

      /** Used to detect if browser is like Chrome. */
      var likeChrome = isCustomContext
        ? !!nav.likeChrome
        : /\bChrome\b/.test(ua) && !/internal|\n/i.test(toString.toString());

      /** Internal `[[Class]]` value shortcuts. */
      var objectClass = 'Object',
        airRuntimeClass = isCustomContext ? objectClass : 'ScriptBridgingProxyObject',
        enviroClass = isCustomContext ? objectClass : 'Environment',
        javaClass = isCustomContext && context.java ? 'JavaPackage' : getClassOf(context.java),
        phantomClass = isCustomContext ? objectClass : 'RuntimeObject';

      /** Detect Java environments. */
      var java = /\bJava/.test(javaClass) && context.java;

      /** Detect Rhino. */
      var rhino = java && getClassOf(context.environment) == enviroClass;

      /** A character to represent alpha. */
      var alpha = java ? 'a' : '\u03b1';

      /** A character to represent beta. */
      var beta = java ? 'b' : '\u03b2';

      /** Browser document object. */
      var doc = context.document || {};

      /**
       * Detect Opera browser (Presto-based).
       * http://www.howtocreate.co.uk/operaStuff/operaObject.html
       * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
       */
      var opera = context.operamini || context.opera;

      /** Opera `[[Class]]`. */
      var operaClass = reOpera.test(
        (operaClass = isCustomContext && opera ? opera['[[Class]]'] : getClassOf(opera))
      )
        ? operaClass
        : (opera = null);

      /*------------------------------------------------------------------------*/

      /** Temporary variable used over the script's lifetime. */
      var data;

      /** The CPU architecture. */
      var arch = ua;

      /** Platform description array. */
      var description = [];

      /** Platform alpha/beta indicator. */
      var prerelease = null;

      /** A flag to indicate that environment features should be used to resolve the platform. */
      var useFeatures = ua == userAgent;

      /** The browser/environment version. */
      var version = useFeatures && opera && typeof opera.version == 'function' && opera.version();

      /** A flag to indicate if the OS ends with "/ Version" */
      var isSpecialCasedOS;

      /* Detectable layout engines (order is important). */
      var layout = getLayout([
        {
          label: 'EdgeHTML',
          pattern: 'Edge',
        },
        'Trident',
        {
          label: 'WebKit',
          pattern: 'AppleWebKit',
        },
        'iCab',
        'Presto',
        'NetFront',
        'Tasman',
        'KHTML',
        'Gecko',
      ]);

      /* Detectable browser names (order is important). */
      var name = getName([
        'Adobe AIR',
        'Arora',
        'Avant Browser',
        'Breach',
        'Camino',
        'Electron',
        'Epiphany',
        'Fennec',
        'Flock',
        'Galeon',
        'GreenBrowser',
        'iCab',
        'Iceweasel',
        'K-Meleon',
        'Konqueror',
        'Lunascape',
        'Maxthon',
        {
          label: 'Microsoft Edge',
          pattern: '(?:Edge|Edg|EdgA|EdgiOS)',
        },
        'Midori',
        'Nook Browser',
        'PaleMoon',
        'PhantomJS',
        'Raven',
        'Rekonq',
        'RockMelt',
        {
          label: 'Samsung Internet',
          pattern: 'SamsungBrowser',
        },
        'SeaMonkey',
        {
          label: 'Silk',
          pattern: '(?:Cloud9|Silk-Accelerated)',
        },
        'Sleipnir',
        'SlimBrowser',
        {
          label: 'SRWare Iron',
          pattern: 'Iron',
        },
        'Sunrise',
        'Swiftfox',
        'Vivaldi',
        'Waterfox',
        'WebPositive',
        {
          label: 'Yandex Browser',
          pattern: 'YaBrowser',
        },
        {
          label: 'UC Browser',
          pattern: 'UCBrowser',
        },
        'Opera Mini',
        {
          label: 'Opera Mini',
          pattern: 'OPiOS',
        },
        'Opera',
        {
          label: 'Opera',
          pattern: 'OPR',
        },
        'Chromium',
        'Chrome',
        {
          label: 'Chrome',
          pattern: '(?:HeadlessChrome)',
        },
        {
          label: 'Chrome Mobile',
          pattern: '(?:CriOS|CrMo)',
        },
        {
          label: 'Firefox',
          pattern: '(?:Firefox|Minefield)',
        },
        {
          label: 'Firefox for iOS',
          pattern: 'FxiOS',
        },
        {
          label: 'IE',
          pattern: 'IEMobile',
        },
        {
          label: 'IE',
          pattern: 'MSIE',
        },
        'Safari',
      ]);

      /* Detectable products (order is important). */
      var product = getProduct([
        {
          label: 'BlackBerry',
          pattern: 'BB10',
        },
        'BlackBerry',
        {
          label: 'Galaxy S',
          pattern: 'GT-I9000',
        },
        {
          label: 'Galaxy S2',
          pattern: 'GT-I9100',
        },
        {
          label: 'Galaxy S3',
          pattern: 'GT-I9300',
        },
        {
          label: 'Galaxy S4',
          pattern: 'GT-I9500',
        },
        {
          label: 'Galaxy S5',
          pattern: 'SM-G900',
        },
        {
          label: 'Galaxy S6',
          pattern: 'SM-G920',
        },
        {
          label: 'Galaxy S6 Edge',
          pattern: 'SM-G925',
        },
        {
          label: 'Galaxy S7',
          pattern: 'SM-G930',
        },
        {
          label: 'Galaxy S7 Edge',
          pattern: 'SM-G935',
        },
        'Google TV',
        'Lumia',
        'iPad',
        'iPod',
        'iPhone',
        'Kindle',
        {
          label: 'Kindle Fire',
          pattern: '(?:Cloud9|Silk-Accelerated)',
        },
        'Nexus',
        'Nook',
        'PlayBook',
        'PlayStation Vita',
        'PlayStation',
        'TouchPad',
        'Transformer',
        {
          label: 'Wii U',
          pattern: 'WiiU',
        },
        'Wii',
        'Xbox One',
        {
          label: 'Xbox 360',
          pattern: 'Xbox',
        },
        'Xoom',
      ]);

      /* Detectable manufacturers. */
      var manufacturer = getManufacturer({
        Apple: {
          iPad: 1,
          iPhone: 1,
          iPod: 1,
        },
        Alcatel: {},
        Archos: {},
        Amazon: {
          Kindle: 1,
          'Kindle Fire': 1,
        },
        Asus: {
          Transformer: 1,
        },
        'Barnes & Noble': {
          Nook: 1,
        },
        BlackBerry: {
          PlayBook: 1,
        },
        Google: {
          'Google TV': 1,
          Nexus: 1,
        },
        HP: {
          TouchPad: 1,
        },
        HTC: {},
        Huawei: {},
        Lenovo: {},
        LG: {},
        Microsoft: {
          Xbox: 1,
          'Xbox One': 1,
        },
        Motorola: {
          Xoom: 1,
        },
        Nintendo: {
          'Wii U': 1,
          Wii: 1,
        },
        Nokia: {
          Lumia: 1,
        },
        Oppo: {},
        Samsung: {
          'Galaxy S': 1,
          'Galaxy S2': 1,
          'Galaxy S3': 1,
          'Galaxy S4': 1,
        },
        Sony: {
          PlayStation: 1,
          'PlayStation Vita': 1,
        },
        Xiaomi: {
          Mi: 1,
          Redmi: 1,
        },
      });

      /* Detectable operating systems (order is important). */
      var os = getOS([
        'Windows Phone',
        'KaiOS',
        'Android',
        'CentOS',
        {
          label: 'Chrome OS',
          pattern: 'CrOS',
        },
        'Debian',
        {
          label: 'DragonFly BSD',
          pattern: 'DragonFly',
        },
        'Fedora',
        'FreeBSD',
        'Gentoo',
        'Haiku',
        'Kubuntu',
        'Linux Mint',
        'OpenBSD',
        'Red Hat',
        'SuSE',
        'Ubuntu',
        'Xubuntu',
        'Cygwin',
        'Symbian OS',
        'hpwOS',
        'webOS ',
        'webOS',
        'Tablet OS',
        'Tizen',
        'Linux',
        'Mac OS X',
        'Macintosh',
        'Mac',
        'Windows 98;',
        'Windows ',
      ]);

      /*------------------------------------------------------------------------*/

      /**
       * Picks the layout engine from an array of guesses.
       *
       * @private
       * @param {Array} guesses An array of guesses.
       * @returns {null|string} The detected layout engine.
       */
      function getLayout(guesses) {
        return reduce(guesses, function (result, guess) {
          return (
            result ||
            (RegExp('\\b' + (guess.pattern || qualify(guess)) + '\\b', 'i').exec(ua) &&
              (guess.label || guess))
          );
        });
      }

      /**
       * Picks the manufacturer from an array of guesses.
       *
       * @private
       * @param {Array} guesses An object of guesses.
       * @returns {null|string} The detected manufacturer.
       */
      function getManufacturer(guesses) {
        return reduce(guesses, function (result, value, key) {
          // Lookup the manufacturer by product or scan the UA for the manufacturer.
          return (
            result ||
            ((value[product] ||
              value[/^[a-z]+(?: +[a-z]+\b)*/i.exec(product)] ||
              RegExp('\\b' + qualify(key) + '(?:\\b|\\w*\\d)', 'i').exec(ua)) &&
              key)
          );
        });
      }

      /**
       * Picks the browser name from an array of guesses.
       *
       * @private
       * @param {Array} guesses An array of guesses.
       * @returns {null|string} The detected browser name.
       */
      function getName(guesses) {
        return reduce(guesses, function (result, guess) {
          return (
            result ||
            (RegExp('\\b' + (guess.pattern || qualify(guess)) + '\\b', 'i').exec(ua) &&
              (guess.label || guess))
          );
        });
      }

      /**
       * Picks the OS name from an array of guesses.
       *
       * @private
       * @param {Array} guesses An array of guesses.
       * @returns {null|string} The detected OS name.
       */
      function getOS(guesses) {
        return reduce(guesses, function (result, guess) {
          var pattern = guess.pattern || qualify(guess);
          if (
            !result &&
            (result = RegExp('\\b' + pattern + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua))
          ) {
            result = cleanupOS(result, pattern, guess.label || guess);
          }
          return result;
        });
      }

      /**
       * Picks the product name from an array of guesses.
       *
       * @private
       * @param {Array} guesses An array of guesses.
       * @returns {null|string} The detected product name.
       */
      function getProduct(guesses) {
        return reduce(guesses, function (result, guess) {
          var pattern = guess.pattern || qualify(guess);
          if (
            !result &&
            (result =
              RegExp('\\b' + pattern + ' *\\d+[.\\w_]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + ' *\\w+-[\\w]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + '(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua))
          ) {
            // Split by forward slash and append product version if needed.
            if (
              (result = String(
                guess.label && !RegExp(pattern, 'i').test(guess.label) ? guess.label : result
              ).split('/'))[1] &&
              !/[\d.]+/.test(result[0])
            ) {
              result[0] += ' ' + result[1];
            }
            // Correct character case and cleanup string.
            guess = guess.label || guess;
            result = format(
              result[0]
                .replace(RegExp(pattern, 'i'), guess)
                .replace(RegExp('; *(?:' + guess + '[_-])?', 'i'), ' ')
                .replace(RegExp('(' + guess + ')[-_.]?(\\w)', 'i'), '$1 $2')
            );
          }
          return result;
        });
      }

      /**
       * Resolves the version using an array of UA patterns.
       *
       * @private
       * @param {Array} patterns An array of UA patterns.
       * @returns {null|string} The detected version.
       */
      function getVersion(patterns) {
        return reduce(patterns, function (result, pattern) {
          return (
            result ||
            (RegExp(pattern + '(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)', 'i').exec(
              ua
            ) || 0)[1] ||
            null
          );
        });
      }

      /**
       * Returns `platform.description` when the platform object is coerced to a string.
       *
       * @name toString
       * @memberOf platform
       * @returns {string} Returns `platform.description` if available, else an empty string.
       */
      function toStringPlatform() {
        return this.description || '';
      }

      /*------------------------------------------------------------------------*/

      // Convert layout to an array so we can add extra details.
      layout && (layout = [layout]);

      // Detect Android products.
      // Browsers on Android devices typically provide their product IDS after "Android;"
      // up to "Build" or ") AppleWebKit".
      // Example:
      // "Mozilla/5.0 (Linux; Android 8.1.0; Moto G (5) Plus) AppleWebKit/537.36
      // (KHTML, like Gecko) Chrome/70.0.3538.80 Mobile Safari/537.36"
      if (
        /\bAndroid\b/.test(os) &&
        !product &&
        (data = /\bAndroid[^;]*;(.*?)(?:Build|\) AppleWebKit)\b/i.exec(ua))
      ) {
        product =
          trim(data[1])
            // Replace any language codes (eg. "en-US").
            .replace(/^[a-z]{2}-[a-z]{2};\s*/i, '') || null;
      }
      // Detect product names that contain their manufacturer's name.
      if (manufacturer && !product) {
        product = getProduct([manufacturer]);
      } else if (manufacturer && product) {
        product = product
          .replace(RegExp('^(' + qualify(manufacturer) + ')[-_.\\s]', 'i'), manufacturer + ' ')
          .replace(
            RegExp('^(' + qualify(manufacturer) + ')[-_.]?(\\w)', 'i'),
            manufacturer + ' $2'
          );
      }
      // Clean up Google TV.
      if ((data = /\bGoogle TV\b/.exec(product))) {
        product = data[0];
      }
      // Detect simulators.
      if (/\bSimulator\b/i.test(ua)) {
        product = (product ? product + ' ' : '') + 'Simulator';
      }
      // Detect Opera Mini 8+ running in Turbo/Uncompressed mode on iOS.
      if (name == 'Opera Mini' && /\bOPiOS\b/.test(ua)) {
        description.push('running in Turbo/Uncompressed mode');
      }
      // Detect IE Mobile 11.
      if (name == 'IE' && /\blike iPhone OS\b/.test(ua)) {
        data = parse(ua.replace(/like iPhone OS/, ''));
        manufacturer = data.manufacturer;
        product = data.product;
      }
      // Detect iOS.
      else if (/^iP/.test(product)) {
        name || (name = 'Safari');
        os = 'iOS' + ((data = / OS ([\d_]+)/i.exec(ua)) ? ' ' + data[1].replace(/_/g, '.') : '');
      }
      // Detect Kubuntu.
      else if (name == 'Konqueror' && /^Linux\b/i.test(os)) {
        os = 'Kubuntu';
      }
      // Detect Android browsers.
      else if (
        (manufacturer &&
          manufacturer != 'Google' &&
          ((/Chrome/.test(name) && !/\bMobile Safari\b/i.test(ua)) || /\bVita\b/.test(product))) ||
        (/\bAndroid\b/.test(os) && /^Chrome/.test(name) && /\bVersion\//i.test(ua))
      ) {
        name = 'Android Browser';
        os = /\bAndroid\b/.test(os) ? os : 'Android';
      }
      // Detect Silk desktop/accelerated modes.
      else if (name == 'Silk') {
        if (!/\bMobi/i.test(ua)) {
          os = 'Android';
          description.unshift('desktop mode');
        }
        if (/Accelerated *= *true/i.test(ua)) {
          description.unshift('accelerated');
        }
      }
      // Detect UC Browser speed mode.
      else if (name == 'UC Browser' && /\bUCWEB\b/.test(ua)) {
        description.push('speed mode');
      }
      // Detect PaleMoon identifying as Firefox.
      else if (name == 'PaleMoon' && (data = /\bFirefox\/([\d.]+)\b/.exec(ua))) {
        description.push('identifying as Firefox ' + data[1]);
      }
      // Detect Firefox OS and products running Firefox.
      else if (name == 'Firefox' && (data = /\b(Mobile|Tablet|TV)\b/i.exec(ua))) {
        os || (os = 'Firefox OS');
        product || (product = data[1]);
      }
      // Detect false positives for Firefox/Safari.
      else if (
        !name ||
        (data = !/\bMinefield\b/i.test(ua) && /\b(?:Firefox|Safari)\b/.exec(name))
      ) {
        // Escape the `/` for Firefox 1.
        if (name && !product && /[\/,]|^[^(]+?\)/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
          // Clear name of false positives.
          name = null;
        }
        // Reassign a generic name.
        if (
          (data = product || manufacturer || os) &&
          (product || manufacturer || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(os))
        ) {
          name = /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(os) ? os : data) + ' Browser';
        }
      }
      // Add Chrome version to description for Electron.
      else if (name == 'Electron' && (data = (/\bChrome\/([\d.]+)\b/.exec(ua) || 0)[1])) {
        description.push('Chromium ' + data);
      }
      // Detect non-Opera (Presto-based) versions (order is important).
      if (!version) {
        version = getVersion([
          '(?:Cloud9|CriOS|CrMo|Edge|Edg|EdgA|EdgiOS|FxiOS|HeadlessChrome|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|SamsungBrowser|Silk(?!/[\\d.]+$)|UCBrowser|YaBrowser)',
          'Version',
          qualify(name),
          '(?:Firefox|Minefield|NetFront)',
        ]);
      }
      // Detect stubborn layout engines.
      if (
        (data =
          (layout == 'iCab' && parseFloat(version) > 3 && 'WebKit') ||
          (/\bOpera\b/.test(name) && (/\bOPR\b/.test(ua) ? 'Blink' : 'Presto')) ||
          (/\b(?:Midori|Nook|Safari)\b/i.test(ua) &&
            !/^(?:Trident|EdgeHTML)$/.test(layout) &&
            'WebKit') ||
          (!layout && /\bMSIE\b/i.test(ua) && (os == 'Mac OS' ? 'Tasman' : 'Trident')) ||
          (layout == 'WebKit' && /\bPlayStation\b(?! Vita\b)/i.test(name) && 'NetFront'))
      ) {
        layout = [data];
      }
      // Detect Windows Phone 7 desktop mode.
      if (name == 'IE' && (data = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(ua) || 0)[1])) {
        name += ' Mobile';
        os = 'Windows Phone ' + (/\+$/.test(data) ? data : data + '.x');
        description.unshift('desktop mode');
      }
      // Detect Windows Phone 8.x desktop mode.
      else if (/\bWPDesktop\b/i.test(ua)) {
        name = 'IE Mobile';
        os = 'Windows Phone 8.x';
        description.unshift('desktop mode');
        version || (version = (/\brv:([\d.]+)/.exec(ua) || 0)[1]);
      }
      // Detect IE 11 identifying as other browsers.
      else if (name != 'IE' && layout == 'Trident' && (data = /\brv:([\d.]+)/.exec(ua))) {
        if (name) {
          description.push('identifying as ' + name + (version ? ' ' + version : ''));
        }
        name = 'IE';
        version = data[1];
      }
      // Leverage environment features.
      if (useFeatures) {
        // Detect server-side environments.
        // Rhino has a global function while others have a global object.
        if (isHostType(context, 'global')) {
          if (java) {
            data = java.lang.System;
            arch = data.getProperty('os.arch');
            os = os || data.getProperty('os.name') + ' ' + data.getProperty('os.version');
          }
          if (rhino) {
            try {
              version = context.require('ringo/engine').version.join('.');
              name = 'RingoJS';
            } catch (e) {
              if ((data = context.system) && data.global.system == context.system) {
                name = 'Narwhal';
                os || (os = data[0].os || null);
              }
            }
            if (!name) {
              name = 'Rhino';
            }
          } else if (
            typeof context.process == 'object' &&
            !context.process.browser &&
            (data = context.process)
          ) {
            if (typeof data.versions == 'object') {
              if (typeof data.versions.electron == 'string') {
                description.push('Node ' + data.versions.node);
                name = 'Electron';
                version = data.versions.electron;
              } else if (typeof data.versions.nw == 'string') {
                description.push('Chromium ' + version, 'Node ' + data.versions.node);
                name = 'NW.js';
                version = data.versions.nw;
              }
            }
            if (!name) {
              name = 'Node.js';
              arch = data.arch;
              os = data.platform;
              version = /[\d.]+/.exec(data.version);
              version = version ? version[0] : null;
            }
          }
        }
        // Detect Adobe AIR.
        else if (getClassOf((data = context.runtime)) == airRuntimeClass) {
          name = 'Adobe AIR';
          os = data.flash.system.Capabilities.os;
        }
        // Detect PhantomJS.
        else if (getClassOf((data = context.phantom)) == phantomClass) {
          name = 'PhantomJS';
          version =
            (data = data.version || null) && data.major + '.' + data.minor + '.' + data.patch;
        }
        // Detect IE compatibility modes.
        else if (typeof doc.documentMode == 'number' && (data = /\bTrident\/(\d+)/i.exec(ua))) {
          // We're in compatibility mode when the Trident version + 4 doesn't
          // equal the document mode.
          version = [version, doc.documentMode];
          if ((data = +data[1] + 4) != version[1]) {
            description.push('IE ' + version[1] + ' mode');
            layout && (layout[1] = '');
            version[1] = data;
          }
          version = name == 'IE' ? String(version[1].toFixed(1)) : version[0];
        }
        // Detect IE 11 masking as other browsers.
        else if (typeof doc.documentMode == 'number' && /^(?:Chrome|Firefox)\b/.test(name)) {
          description.push('masking as ' + name + ' ' + version);
          name = 'IE';
          version = '11.0';
          layout = ['Trident'];
          os = 'Windows';
        }
        os = os && format(os);
      }
      // Detect prerelease phases.
      if (
        version &&
        (data =
          /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) ||
          /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + (useFeatures && nav.appMinorVersion)) ||
          (/\bMinefield\b/i.test(ua) && 'a'))
      ) {
        prerelease = /b/i.test(data) ? 'beta' : 'alpha';
        version =
          version.replace(RegExp(data + '\\+?$'), '') +
          (prerelease == 'beta' ? beta : alpha) +
          (/\d+\+?/.exec(data) || '');
      }
      // Detect Firefox Mobile.
      if (name == 'Fennec' || (name == 'Firefox' && /\b(?:Android|Firefox OS|KaiOS)\b/.test(os))) {
        name = 'Firefox Mobile';
      }
      // Obscure Maxthon's unreliable version.
      else if (name == 'Maxthon' && version) {
        version = version.replace(/\.[\d.]+/, '.x');
      }
      // Detect Xbox 360 and Xbox One.
      else if (/\bXbox\b/i.test(product)) {
        if (product == 'Xbox 360') {
          os = null;
        }
        if (product == 'Xbox 360' && /\bIEMobile\b/.test(ua)) {
          description.unshift('mobile mode');
        }
      }
      // Add mobile postfix.
      else if (
        (/^(?:Chrome|IE|Opera)$/.test(name) || (name && !product && !/Browser|Mobi/.test(name))) &&
        (os == 'Windows CE' || /Mobi/i.test(ua))
      ) {
        name += ' Mobile';
      }
      // Detect IE platform preview.
      else if (name == 'IE' && useFeatures) {
        try {
          if (context.external === null) {
            description.unshift('platform preview');
          }
        } catch (e) {
          description.unshift('embedded');
        }
      }
      // Detect BlackBerry OS version.
      // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
      else if (
        (/\bBlackBerry\b/.test(product) || /\bBB10\b/.test(ua)) &&
        (data =
          (RegExp(product.replace(/ +/g, ' *') + '/([.\\d]+)', 'i').exec(ua) || 0)[1] || version)
      ) {
        data = [data, /BB10/.test(ua)];
        os =
          (data[1] ? ((product = null), (manufacturer = 'BlackBerry')) : 'Device Software') +
          ' ' +
          data[0];
        version = null;
      }
      // Detect Opera identifying/masking itself as another browser.
      // http://www.opera.com/support/kb/view/843/
      else if (
        this != forOwn &&
        product != 'Wii' &&
        ((useFeatures && opera) ||
          (/Opera/.test(name) && /\b(?:MSIE|Firefox)\b/i.test(ua)) ||
          (name == 'Firefox' && /\bOS X (?:\d+\.){2,}/.test(os)) ||
          (name == 'IE' &&
            ((os && !/^Win/.test(os) && version > 5.5) ||
              (/\bWindows XP\b/.test(os) && version > 8) ||
              (version == 8 && !/\bTrident\b/.test(ua))))) &&
        !reOpera.test((data = parse.call(forOwn, ua.replace(reOpera, '') + ';'))) &&
        data.name
      ) {
        // When "identifying", the UA contains both Opera and the other browser's name.
        data = 'ing as ' + data.name + ((data = data.version) ? ' ' + data : '');
        if (reOpera.test(name)) {
          if (/\bIE\b/.test(data) && os == 'Mac OS') {
            os = null;
          }
          data = 'identify' + data;
        }
        // When "masking", the UA contains only the other browser's name.
        else {
          data = 'mask' + data;
          if (operaClass) {
            name = format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
          } else {
            name = 'Opera';
          }
          if (/\bIE\b/.test(data)) {
            os = null;
          }
          if (!useFeatures) {
            version = null;
          }
        }
        layout = ['Presto'];
        description.push(data);
      }
      // Detect WebKit Nightly and approximate Chrome/Safari versions.
      if ((data = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
        // Correct build number for numeric comparison.
        // (e.g. "532.5" becomes "532.05")
        data = [parseFloat(data.replace(/\.(\d)$/, '.0$1')), data];
        // Nightly builds are postfixed with a "+".
        if (name == 'Safari' && data[1].slice(-1) == '+') {
          name = 'WebKit Nightly';
          prerelease = 'alpha';
          version = data[1].slice(0, -1);
        }
        // Clear incorrect browser versions.
        else if (
          version == data[1] ||
          version == (data[2] = (/\bSafari\/([\d.]+\+?)/i.exec(ua) || 0)[1])
        ) {
          version = null;
        }
        // Use the full Chrome version when available.
        data[1] = (/\b(?:Headless)?Chrome\/([\d.]+)/i.exec(ua) || 0)[1];
        // Detect Blink layout engine.
        if (
          data[0] == 537.36 &&
          data[2] == 537.36 &&
          parseFloat(data[1]) >= 28 &&
          layout == 'WebKit'
        ) {
          layout = ['Blink'];
        }
        // Detect JavaScriptCore.
        // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi
        if (!useFeatures || (!likeChrome && !data[1])) {
          layout && (layout[1] = 'like Safari');
          data =
            ((data = data[0]),
            data < 400
              ? 1
              : data < 500
              ? 2
              : data < 526
              ? 3
              : data < 533
              ? 4
              : data < 534
              ? '4+'
              : data < 535
              ? 5
              : data < 537
              ? 6
              : data < 538
              ? 7
              : data < 601
              ? 8
              : data < 602
              ? 9
              : data < 604
              ? 10
              : data < 606
              ? 11
              : data < 608
              ? 12
              : '12');
        } else {
          layout && (layout[1] = 'like Chrome');
          data =
            data[1] ||
            ((data = data[0]),
            data < 530
              ? 1
              : data < 532
              ? 2
              : data < 532.05
              ? 3
              : data < 533
              ? 4
              : data < 534.03
              ? 5
              : data < 534.07
              ? 6
              : data < 534.1
              ? 7
              : data < 534.13
              ? 8
              : data < 534.16
              ? 9
              : data < 534.24
              ? 10
              : data < 534.3
              ? 11
              : data < 535.01
              ? 12
              : data < 535.02
              ? '13+'
              : data < 535.07
              ? 15
              : data < 535.11
              ? 16
              : data < 535.19
              ? 17
              : data < 536.05
              ? 18
              : data < 536.1
              ? 19
              : data < 537.01
              ? 20
              : data < 537.11
              ? '21+'
              : data < 537.13
              ? 23
              : data < 537.18
              ? 24
              : data < 537.24
              ? 25
              : data < 537.36
              ? 26
              : layout != 'Blink'
              ? '27'
              : '28');
        }
        // Add the postfix of ".x" or "+" for approximate versions.
        layout &&
          (layout[1] +=
            ' ' + (data += typeof data == 'number' ? '.x' : /[.+]/.test(data) ? '' : '+'));
        // Obscure version for some Safari 1-2 releases.
        if (name == 'Safari' && (!version || parseInt(version) > 45)) {
          version = data;
        } else if (name == 'Chrome' && /\bHeadlessChrome/i.test(ua)) {
          description.unshift('headless');
        }
      }
      // Detect Opera desktop modes.
      if (name == 'Opera' && (data = /\bzbov|zvav$/.exec(os))) {
        name += ' ';
        description.unshift('desktop mode');
        if (data == 'zvav') {
          name += 'Mini';
          version = null;
        } else {
          name += 'Mobile';
        }
        os = os.replace(RegExp(' *' + data + '$'), '');
      }
      // Detect Chrome desktop mode.
      else if (name == 'Safari' && /\bChrome\b/.exec(layout && layout[1])) {
        description.unshift('desktop mode');
        name = 'Chrome Mobile';
        version = null;
        if (/\bOS X\b/.test(os)) {
          manufacturer = 'Apple';
          os = 'iOS 4.3+';
        } else {
          os = null;
        }
      }
      // Newer versions of SRWare Iron uses the Chrome tag to indicate its version number.
      else if (/\bSRWare Iron\b/.test(name) && !version) {
        version = getVersion('Chrome');
      }
      // Strip incorrect OS versions.
      if (
        version &&
        version.indexOf((data = /[\d.]+$/.exec(os))) == 0 &&
        ua.indexOf('/' + data + '-') > -1
      ) {
        os = trim(os.replace(data, ''));
      }
      // Ensure OS does not include the browser name.
      if (os && os.indexOf(name) != -1 && !RegExp(name + ' OS').test(os)) {
        os = os.replace(RegExp(' *' + qualify(name) + ' *'), '');
      }
      // Add layout engine.
      if (
        layout &&
        !/\b(?:Avant|Nook)\b/.test(name) &&
        (/Browser|Lunascape|Maxthon/.test(name) ||
          (name != 'Safari' && /^iOS/.test(os) && /\bSafari\b/.test(layout[1])) ||
          (/^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Samsung Internet|Sleipnir|SRWare Iron|Vivaldi|Web)/.test(
            name
          ) &&
            layout[1]))
      ) {
        // Don't add layout details to description if they are falsey.
        (data = layout[layout.length - 1]) && description.push(data);
      }
      // Combine contextual information.
      if (description.length) {
        description = ['(' + description.join('; ') + ')'];
      }
      // Append manufacturer to description.
      if (manufacturer && product && product.indexOf(manufacturer) < 0) {
        description.push('on ' + manufacturer);
      }
      // Append product to description.
      if (product) {
        description.push((/^on /.test(description[description.length - 1]) ? '' : 'on ') + product);
      }
      // Parse the OS into an object.
      if (os) {
        data = / ([\d.+]+)$/.exec(os);
        isSpecialCasedOS = data && os.charAt(os.length - data[0].length - 1) == '/';
        os = {
          architecture: 32,
          family: data && !isSpecialCasedOS ? os.replace(data[0], '') : os,
          version: data ? data[1] : null,
          toString: function () {
            var version = this.version;
            return (
              this.family +
              (version && !isSpecialCasedOS ? ' ' + version : '') +
              (this.architecture == 64 ? ' 64-bit' : '')
            );
          },
        };
      }
      // Add browser/OS architecture.
      if ((data = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(arch)) && !/\bi686\b/i.test(arch)) {
        if (os) {
          os.architecture = 64;
          os.family = os.family.replace(RegExp(' *' + data), '');
        }
        if (
          name &&
          (/\bWOW64\b/i.test(ua) ||
            (useFeatures &&
              /\w(?:86|32)$/.test(nav.cpuClass || nav.platform) &&
              !/\bWin64; x64\b/i.test(ua)))
        ) {
          description.unshift('32-bit');
        }
      }
      // Chrome 39 and above on OS X is always 64-bit.
      else if (os && /^OS X/.test(os.family) && name == 'Chrome' && parseFloat(version) >= 39) {
        os.architecture = 64;
      }
      ua || (ua = null);

      /*------------------------------------------------------------------------*/

      /**
       * The platform object.
       *
       * @name platform
       * @type Object
       */
      var platform = {};

      /**
       * The platform description.
       *
       * @memberOf platform
       * @type string|null
       */
      platform.description = ua;

      /**
       * The name of the browser's layout engine.
       *
       * The list of common layout engines include:
       * "Blink", "EdgeHTML", "Gecko", "Trident" and "WebKit"
       *
       * @memberOf platform
       * @type string|null
       */
      platform.layout = layout && layout[0];

      /**
       * The name of the product's manufacturer.
       *
       * The list of manufacturers include:
       * "Apple", "Archos", "Amazon", "Asus", "Barnes & Noble", "BlackBerry",
       * "Google", "HP", "HTC", "LG", "Microsoft", "Motorola", "Nintendo",
       * "Nokia", "Samsung" and "Sony"
       *
       * @memberOf platform
       * @type string|null
       */
      platform.manufacturer = manufacturer;

      /**
       * The name of the browser/environment.
       *
       * The list of common browser names include:
       * "Chrome", "Electron", "Firefox", "Firefox for iOS", "IE",
       * "Microsoft Edge", "PhantomJS", "Safari", "SeaMonkey", "Silk",
       * "Opera Mini" and "Opera"
       *
       * Mobile versions of some browsers have "Mobile" appended to their name:
       * eg. "Chrome Mobile", "Firefox Mobile", "IE Mobile" and "Opera Mobile"
       *
       * @memberOf platform
       * @type string|null
       */
      platform.name = name;

      /**
       * The alpha/beta release indicator.
       *
       * @memberOf platform
       * @type string|null
       */
      platform.prerelease = prerelease;

      /**
       * The name of the product hosting the browser.
       *
       * The list of common products include:
       *
       * "BlackBerry", "Galaxy S4", "Lumia", "iPad", "iPod", "iPhone", "Kindle",
       * "Kindle Fire", "Nexus", "Nook", "PlayBook", "TouchPad" and "Transformer"
       *
       * @memberOf platform
       * @type string|null
       */
      platform.product = product;

      /**
       * The browser's user agent string.
       *
       * @memberOf platform
       * @type string|null
       */
      platform.ua = ua;

      /**
       * The browser/environment version.
       *
       * @memberOf platform
       * @type string|null
       */
      platform.version = name && version;

      /**
       * The name of the operating system.
       *
       * @memberOf platform
       * @type Object
       */
      platform.os = os || {
        /**
         * The CPU architecture the OS is built for.
         *
         * @memberOf platform.os
         * @type number|null
         */
        architecture: null,
        /**
         * The family of the OS.
         *
         * Common values include:
         * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
         * "Windows XP", "OS X", "Linux", "Ubuntu", "Debian", "Fedora", "Red Hat",
         * "SuSE", "Android", "iOS" and "Windows Phone"
         *
         * @memberOf platform.os
         * @type string|null
         */
        family: null,
        /**
         * The version of the OS.
         *
         * @memberOf platform.os
         * @type string|null
         */
        version: null,
        /**
         * Returns the OS string.
         *
         * @memberOf platform.os
         * @returns {string} The OS string.
         */
        toString: function () {
          return 'null';
        },
      };
      platform.parse = parse;
      platform.toString = toStringPlatform;
      if (platform.version) {
        description.unshift(version);
      }
      if (platform.name) {
        description.unshift(name);
      }
      if (
        os &&
        name &&
        !(os == String(os).split(' ')[0] && (os == name.split(' ')[0] || product))
      ) {
        description.push(product ? '(' + os + ')' : 'on ' + os);
      }
      if (description.length) {
        platform.description = description.join(' ');
      }
      return platform;
    }

    /*--------------------------------------------------------------------------*/

    // Export platform.
    var platform = parse();

    // Some AMD build optimizers, like r.js, check for condition patterns like the following:
    if (freeExports && freeModule) {
      // Export for CommonJS support.
      forOwn(platform, function (value, key) {
        freeExports[key] = value;
      });
    } else {
      // Export to the global object.
      root.platform = platform;
    }
  }).call(commonjsGlobal);
})(platform$1, platformExports);
var platform = platformExports;

// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
    getRandomValues =
      typeof crypto !== 'undefined' &&
      crypto.getRandomValues &&
      crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error(
        'crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported'
      );
    }
  }
  return getRandomValues(rnds8);
}

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  return (
    byteToHex[arr[offset + 0]] +
    byteToHex[arr[offset + 1]] +
    byteToHex[arr[offset + 2]] +
    byteToHex[arr[offset + 3]] +
    '-' +
    byteToHex[arr[offset + 4]] +
    byteToHex[arr[offset + 5]] +
    '-' +
    byteToHex[arr[offset + 6]] +
    byteToHex[arr[offset + 7]] +
    '-' +
    byteToHex[arr[offset + 8]] +
    byteToHex[arr[offset + 9]] +
    '-' +
    byteToHex[arr[offset + 10]] +
    byteToHex[arr[offset + 11]] +
    byteToHex[arr[offset + 12]] +
    byteToHex[arr[offset + 13]] +
    byteToHex[arr[offset + 14]] +
    byteToHex[arr[offset + 15]]
  ).toLowerCase();
}

//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

let _nodeId;
let _clockseq; // Previous uuid creation time

let _lastMSecs = 0;
let _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

function v1(options, buf, offset) {
  let i = (buf && offset) || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189

  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || rng)();
    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1],
        seedBytes[2],
        seedBytes[3],
        seedBytes[4],
        seedBytes[5],
      ];
    }
    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = ((seedBytes[6] << 8) | seedBytes[7]) & 0x3fff;
    }
  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.

  let msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock

  let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

  if (dt < 0 && options.clockseq === undefined) {
    clockseq = (clockseq + 1) & 0x3fff;
  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval

  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  } // Per 4.2.1.2 Throw error if too many uuids are requested

  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }
  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

  msecs += 12219292800000; // `time_low`

  const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = (tl >>> 24) & 0xff;
  b[i++] = (tl >>> 16) & 0xff;
  b[i++] = (tl >>> 8) & 0xff;
  b[i++] = tl & 0xff; // `time_mid`

  const tmh = ((msecs / 0x100000000) * 10000) & 0xfffffff;
  b[i++] = (tmh >>> 8) & 0xff;
  b[i++] = tmh & 0xff; // `time_high_and_version`

  b[i++] = ((tmh >>> 24) & 0xf) | 0x10; // include version

  b[i++] = (tmh >>> 16) & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

  b[i++] = (clockseq >>> 8) | 0x80; // `clock_seq_low`

  b[i++] = clockseq & 0xff; // `node`

  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }
  return buf || unsafeStringify(b);
}

// tracker.js

/**
 * 埋点SDK
 * 支持feature包括：
 * 1. 手动上报
 * 2. dom自动上报点击 / 全量上报热力图
 */

const getEvent = (event) => {
  event = event;
  if (!event) {
    return event;
  }
  if (!event.target) {
    event.target = event.srcElement;
  }
  if (!event.currentTarget) {
    event.currentTarget = event.srcElement;
  }
  return event;
};
const getEventListenerMethod = () => {
  let addMethod = 'addEventListener';
  let removeMethod = 'removeEventListener';
  let prefix = '';
  // if (!window.addEventListener) {
  //   addMethod = 'attachEvent';
  //   removeMethod = 'detachEvent';
  //   prefix = 'on';
  // }
  return {
    addMethod,
    removeMethod,
    prefix,
  };
};
const getBoundingClientRect = (element) => {
  const rect = element.getBoundingClientRect();
  const width = rect.width || rect.right - rect.left;
  const heigth = rect.heigth || rect.bottom - rect.top;
  return extend({}, rect, {
    width,
    heigth,
  });
};
const stringify = (obj) => {
  const params = [];
  for (const key in obj) {
    params.push(`${key}=${obj[key]}`);
  }
  return params.join('&');
};
const getDomPath = (element, useClass = false) => {
  if (!(element instanceof HTMLElement)) {
    console.warn('input is not a HTML element!');
    return '';
  }
  const domPath = [];
  let elem = element;
  while (elem) {
    let domDesc = getDomDesc(elem, useClass);
    if (!domDesc) {
      break;
    }
    domPath.unshift(domDesc);
    if (querySelector(domPath.join('>')) === element || domDesc.indexOf('body') >= 0) {
      break;
    }
    domPath.shift();
    const children = elem.parentNode.children;
    if (children.length > 1) {
      for (let i = 0; i < children.length; i++) {
        if (children[i] === elem) {
          domDesc += `:nth-child(${i + 1})`;
          break;
        }
      }
    }
    domPath.unshift(domDesc);
    if (querySelector(domPath.join('>')) === element) {
      break;
    }
    elem = elem.parentNode;
  }
  return domPath.join('>');
};
const getDomDesc = (element, useClass = false) => {
  const domDesc = [];
  if (!element || !element.tagName) {
    return '';
  }
  if (element.id) {
    return `#${element.id}`;
  }
  domDesc.push(element.tagName.toLowerCase());
  if (useClass) {
    const className = element.className;
    if (className && typeof className === 'string') {
      const classes = className.split(/\s+/);
      domDesc.push(`.${classes.join('.')}`);
    }
  }
  if (element.name) {
    domDesc.push(`[name=${element.name}]`);
  }
  return domDesc.join('');
};
const querySelector = function (queryString) {
  return (
    document.getElementById(queryString) ||
    document.getElementsByName(queryString)[0] ||
    document.querySelector(queryString)
  );
};
const getAppInfo = function () {
  const data = {};
  // title
  data.title = document.title;
  // url
  // data.url = encodeURIComponent(window.location.href);
  // eventTime
  data.eventTime = new Date().getTime();
  // browserType
  data.browserType = platform.name;
  // browserVersion
  data.browserVersion = platform.version;
  // browserEngine
  data.browserEngine = platform.layout;
  // osType
  data.osType = platform.os.family;
  // osVersion
  data.osVersion = platform.os.version;
  // languages
  data.language = getBrowserLang();
  return data;
};
const getBrowserLang = function () {
  let currentLang = navigator.language;
  if (!currentLang) {
    currentLang = navigator.browserLanguage;
  }
  return currentLang;
};
const createUuid = function () {
  const key = 'GS_TRACKER_UUID';
  let curUuid = localStorage.getItem(key);
  if (!curUuid) {
    curUuid = v1();
    localStorage.setItem(key, curUuid);
  }
  return curUuid;
};
const reportTracker = function (url, data) {
  const reportData = stringify(data);
  const urlLength = (url + (url.indexOf('?') < 0 ? '?' : '&') + reportData).length;
  if (urlLength < 2083) {
    // imgReport(url, data);
    xmlHttpRequest(url, data);
  } else if (navigator.sendBeacon) {
    sendBeacon(url, data);
  } else {
    xmlHttpRequest(url, data);
  }
};
const imgReport = function (url, data) {
  let image = new Image(1, 1);
  image.onload = function () {
    image = null;
  };
  image.src = `${url}?${stringify(data)}`;
};
const sendBeacon = function (url, data) {
  // 判断支不支持navigator.sendBeacon
  const headers = {
    type: 'application/x-www-form-urlencoded',
  };
  const blob = new Blob([JSON.stringify(data)], headers);
  navigator.sendBeacon(url, blob);
};
const xmlHttpRequest = function (url, data) {
  // 使用 axios 发送 GET 请求（异步，不阻塞主线程）
  // 将数据转换为 URL 查询参数
  const params = new URLSearchParams(data as Record<string, string>).toString();
  const requestUrl = `${url}${url.includes('?') ? '&' : '?'}${params}`;
  // logger.info('[TrackerLogger] Request url:', requestUrl);

  axios
    .get(requestUrl, {
      timeout: 5000,
    })
    .catch((error) => {
      // 静默失败，不影响主流程
      // console.debug('[Tracker] Request failed:', error.message);
      logger.info('[TrackerLogger] Request failed:', error.message);
    });
};
const createHistoryEvent = function (type) {
  const origin = history[type];
  return function () {
    const res = origin.apply(this, arguments);
    const e = new Event(type);
    e.arguments = arguments;
    window.dispatchEvent(e);
    return res;
  };
};
const defaultOptions = {
  useClass: false,
  // 是否用当前dom元素中的类名标识当前元素
  appid: 'default',
  // 应用标识，用来区分埋点数据中的应用
  uuid: '',
  // 设备标识，自动生成并存在浏览器中,
  extra: {},
  // 用户自定义上传字段对象
  enableTrackerKey: true,
  // 是否开启约定拥有属性值为'gs-tracker-key'的dom的点击事件自动上报
  enableHeatMapTracker: false,
  // 是否开启热力图自动上报
  enableLoadTracker: false,
  // 是否开启页面加载自动上报，适合多页面应用的pv上报
  enableHistoryTracker: true,
  // 是否开启页面history变化自动上报，适合单页面应用的history路由
  enableHashTracker: false,
  // 是否开启页面hash变化自动上报，适合单页面应用的hash路由
  requestUrl: 'https://eventlog.web.guosen.com.cn/_.gif', // 埋点请求后端接口
};

const MouseEventList = [
  'click',
  'dblclick',
  'contextmenu',
  'mousedown',
  'mouseup',
  'mouseenter',
  'mouseout',
  'mouseover',
];
class Tracker {
  constructor(options) {
    if (!options.appid) {
      console.error('[GS-EVNET-TRACKER] Appid cannot be empty!');
      return;
    }
    this._isInstall = false;
    this._options = {};
    this._init(options);
  }

  /**
   * 初始化
   * @param {*} options 用户参数
   */
  _init(options = {}) {
    this._setConfig(options);
    // this._setUuid();
    this._installInnerTrack();
  }

  /**
   * 用户参数合并
   * @param {*} options 用户参数
   */
  _setConfig(options) {
    options = extend(true, {}, defaultOptions, options);
    this._options = options;
  }

  /**
   * 设置当前设备uuid标识
   */
  _setUuid() {
    const uuid = createUuid();
    this._options.uuid = uuid;
  }

  /**
   * 设置当前用户标识
   * @param {*} userId 用户标识
   */
  _setUserId(userId) {
    this._options.userId = userId;
  }

  /**
   * 设置埋点上报额外数据
   * @param {*} extraObj 需要加到埋点上报中的额外数据
   */
  _setExtra(extraObj) {
    this._options.extra = {
      ...this._options.extra,
      ...extraObj,
    };
  }

  /**
   * 约定拥有属性值为'gs-tracker-key'的dom点击事件上报函数
   */
  _trackerKeyReport() {
    const that = this;
    const eventMethodObj = getEventListenerMethod();
    const eventName = 'click';
    window[eventMethodObj.addMethod](
      eventMethodObj.prefix + eventName,
      function (event) {
        const eventFix = getEvent(event);
        const trackerValue = eventFix.target.getAttribute('gs-tracker-key');
        // console.log('click element====>', trackerValue, event.target)
        if (trackerValue) {
          that._sendTracker('click', trackerValue, {});
        }
      },
      false
    );
  }

  /**
   * 通用事件处理函数
   * @param {*} eventList 事件类型数组
   * @param {*} trackKey 埋点key
   */
  _captureEvents(eventList, trackKey) {
    const that = this;
    const eventMethodObj = getEventListenerMethod();
    for (let i = 0, j = eventList.length; i < j; i++) {
      const eventName = eventList[i];
      window[eventMethodObj.addMethod](
        eventMethodObj.prefix + eventName,
        function (event) {
          const eventFix = getEvent(event);
          if (!eventFix) {
            return;
          }
          if (MouseEventList.indexOf(eventName) > -1) {
            const domData = that._getDomAndOffset(eventFix);
            that._sendTracker(eventFix.type, trackKey, domData);
          } else {
            that._sendTracker(eventFix.type, trackKey, {});
          }
        },
        false
      );
    }
  }

  /**
   * 获取触发事件的dom元素和位置信息
   * @param {*} event 事件类型
   * @returns
   */
  _getDomAndOffset(event) {
    const domPath = getDomPath(event.target, this._options.useClass);
    const rect = getBoundingClientRect(event.target);
    if (rect.width === 0 || rect.height === 0) {
      return;
    }
    const t = document.documentElement || document.body.parentNode;
    const scrollX = (t && typeof t.scrollLeft === 'number' ? t : document.body).scrollLeft;
    const scrollY = (t && typeof t.scrollTop === 'number' ? t : document.body).scrollTop;
    const pageX = event.pageX || event.clientX + scrollX;
    const pageY = event.pageY || event.clientY + scrollY;
    const data = {
      domPath: encodeURIComponent(domPath),
      offsetX: ((pageX - rect.left - scrollX) / rect.width).toFixed(6),
      offsetY: ((pageY - rect.top - scrollY) / rect.height).toFixed(6),
    };
    return data;
  }

  /**
   * 埋点上报
   * @param {*} eventType 事件类型
   * @param {*} eventId  事件key
   * @param {*} data 埋点数据
   */
  _sendTracker(eventType, eventId, data = {}) {
    const defaultData = {
      userId: this._options.userId,
      appid: this._options.appid,
      uuid: this._options.uuid,
      eventType,
      eventId,
      ...getAppInfo(),
      ...this._options.extra,
    };
    const { allowList = [], blockList = [] } = this._options;
    if (blockList.length) {
      // 禁止的名单不发请求
      if (this._isUrlBlocked(blockList, defaultData.url)) {
        return;
      }
    }
    if (allowList.length) {
      // 不在允许名单的不发请求
      if (!this._isUrlBlocked(allowList, defaultData.url)) {
        return;
      }
    }
    const sendData = extend(true, {}, defaultData, data);
    const requestUrl = this._options.requestUrl;
    // console.log('sendData', sendData)
    reportTracker(requestUrl, sendData);
  }

  /**
   * 处理allowList、blockList是否匹配
   * @returns
   */
  _isUrlBlocked(urlsList, url) {
    let bool = false;
    bool = urlsList.some((pattern) => {
      if (typeof pattern === 'string') {
        return decodeURIComponent(url).indexOf(pattern) !== -1;
      } else if (pattern instanceof RegExp) {
        return pattern.test(url);
      } else {
        return false;
      }
    });
    return bool;
  }

  /**
   * 装载sdk内部自动埋点
   * @returns
   */
  _installInnerTrack() {
    if (this._isInstall) {
      return this;
    }
    if (this._options.enableTrackerKey) {
      this._trackerKeyReport();
    }
    // 热力图埋点
    if (this._options.enableHeatMapTracker) {
      this._openInnerTrack(['click'], 'innerHeatMap');
    }
    // 页面load埋点
    if (this._options.enableLoadTracker) {
      this._openInnerTrack(['load'], 'innerPageLoad');
    }
    // 页面history变化埋点
    if (this._options.enableHistoryTracker) {
      // 首先监听页面第一次加载的load事件
      this._openInnerTrack(['load'], 'innerPageLoad');
      // 对浏览器history对象对方法进行改写，实现对单页面应用history路由变化的监听
      // history.pushState = createHistoryEvent('pushState');
      // history.replaceState = createHistoryEvent('replaceState');
      this._openInnerTrack(['pushState'], 'innerHistoryChange');
      this._openInnerTrack(['replaceState'], 'innerHistoryChange');
    }
    // 页面hash变化埋点
    if (this._options.enableHashTracker) {
      // 首先监听页面第一次加载的load事件
      this._openInnerTrack(['load'], 'innerPageLoad');
      // 同时监听hashchange事件
      this._openInnerTrack(['hashchange'], 'innerHashChange');
    }
    this._isInstall = true;
    return this;
  }

  /**
   * 开启内部埋点
   * @param {*} event 监听事件类型
   * @param {*} trackKey 埋点key
   * @returns
   */
  _openInnerTrack(event, trackKey) {
    return this._captureEvents(event, trackKey);
  }

  /** 下面三个是暴露给用户的实际接口 */
  eventLog(name = '', data = {}) {
    this._sendTracker('customEvent', name, data);
  }
  setLogUserId(userId) {
    this._setUserId(userId);
  }
  setLogExtra(obj = {}) {
    this._setExtra(obj);
  }
}

export { Tracker as default };

// https://eventlog.web.guosen.com.cn/_.gif?userId=&appid=moss-claw&uuid=c18e9c60-2d92-11f1-a5c3-4706627469ec&eventType=customEvent&eventId=page-view&title=%E5%9B%BD%E4%BF%A1%E6%95%B0%E5%AD%97%E5%8C%96%E4%BA%A7%E5%93%81%E7%9F%A5%E8%AF%86%E4%B8%AD%E5%BF%83&url=https%3A%2F%2Fdocdev.web.guosen.com.cn%2Fhome%2FproductList&eventTime=1775197067714&browserType=Chrome&browserVersion=101.0.4951.54&browserEngine=Blink&osType=Windows&osVersion=10&language=zh-CN&env=prod
