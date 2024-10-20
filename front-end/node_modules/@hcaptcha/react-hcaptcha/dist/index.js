"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var React = _interopRequireWildcard(require("react"));

var _utils = require("./utils.js");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var SCRIPT_ID = 'hcaptcha-api-script-id';
var HCAPTCHA_LOAD_FN_NAME = 'hcaptchaOnLoad'; // Prevent loading API script multiple times

var resolveFn;
var rejectFn;
var mountPromise = new Promise(function (resolve, reject) {
  resolveFn = resolve;
  rejectFn = reject;
}); // Generate hCaptcha API script

var mountCaptchaScript = function mountCaptchaScript() {
  var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (document.getElementById(SCRIPT_ID)) {
    // API was already requested
    return mountPromise;
  } // Create global onload callback


  window[HCAPTCHA_LOAD_FN_NAME] = resolveFn;
  var domain = params.apihost || "https://js.hcaptcha.com";
  delete params.apihost;
  var script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = "".concat(domain, "/1/api.js?render=explicit&onload=").concat(HCAPTCHA_LOAD_FN_NAME);
  script.async = true;

  script.onerror = function (event) {
    return rejectFn('script-error');
  };

  var query = (0, _utils.generateQuery)(params);
  script.src += query !== "" ? "&".concat(query) : "";
  document.head.appendChild(script);
  return mountPromise;
};

var HCaptcha = /*#__PURE__*/function (_React$Component) {
  (0, _inherits2["default"])(HCaptcha, _React$Component);

  var _super = _createSuper(HCaptcha);

  function HCaptcha(props) {
    var _this;

    (0, _classCallCheck2["default"])(this, HCaptcha);
    _this = _super.call(this, props); // API Methods

    _this.renderCaptcha = _this.renderCaptcha.bind((0, _assertThisInitialized2["default"])(_this));
    _this.resetCaptcha = _this.resetCaptcha.bind((0, _assertThisInitialized2["default"])(_this));
    _this.removeCaptcha = _this.removeCaptcha.bind((0, _assertThisInitialized2["default"])(_this));
    _this.isReady = _this.isReady.bind((0, _assertThisInitialized2["default"])(_this)); // Event Handlers

    _this.loadCaptcha = _this.loadCaptcha.bind((0, _assertThisInitialized2["default"])(_this));
    _this.handleOnLoad = _this.handleOnLoad.bind((0, _assertThisInitialized2["default"])(_this));
    _this.handleSubmit = _this.handleSubmit.bind((0, _assertThisInitialized2["default"])(_this));
    _this.handleExpire = _this.handleExpire.bind((0, _assertThisInitialized2["default"])(_this));
    _this.handleError = _this.handleError.bind((0, _assertThisInitialized2["default"])(_this));
    _this.handleOpen = _this.handleOpen.bind((0, _assertThisInitialized2["default"])(_this));
    _this.handleClose = _this.handleClose.bind((0, _assertThisInitialized2["default"])(_this));
    _this.handleChallengeExpired = _this.handleChallengeExpired.bind((0, _assertThisInitialized2["default"])(_this));
    var isApiReady = typeof hcaptcha !== 'undefined';
    _this.ref = /*#__PURE__*/React.createRef();
    _this.apiScriptRequested = false;
    _this.state = {
      isApiReady: isApiReady,
      isRemoved: false,
      elementId: props.id,
      captchaId: ''
    };
    return _this;
  }

  (0, _createClass2["default"])(HCaptcha, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      // Once captcha is mounted intialize hCaptcha - hCaptcha
      var isApiReady = this.state.isApiReady;
      /*
       * Check if hCaptcha has already been loaded,
       * If Yes, render the captcha
       * If No, create script tag and wait to render the captcha
       */

      if (isApiReady) {
        this.renderCaptcha();
        return;
      }

      this.loadCaptcha();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var captchaId = this.state.captchaId;

      if (!this.isReady()) {
        return;
      } // Reset any stored variables / timers when unmounting


      hcaptcha.reset(captchaId);
      hcaptcha.remove(captchaId);
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      // Prevent component re-rendering when these internal state variables are updated
      if (this.state.isApiReady !== nextState.isApiReady || this.state.isRemoved !== nextState.isRemoved) {
        return false;
      }

      return true;
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var _this2 = this;

      // Prop Keys that could change
      var keys = ['sitekey', 'size', 'theme', 'tabindex', 'languageOverride', 'endpoint']; // See if any props changed during component update

      var match = keys.every(function (key) {
        return prevProps[key] === _this2.props[key];
      }); // If they have changed, remove current captcha and render a new one

      if (!match) {
        this.removeCaptcha(function () {
          _this2.renderCaptcha();
        });
      }
    }
  }, {
    key: "loadCaptcha",
    value: function loadCaptcha() {
      if (this.apiScriptRequested) {
        return;
      }

      var _this$props = this.props,
          apihost = _this$props.apihost,
          assethost = _this$props.assethost,
          endpoint = _this$props.endpoint,
          host = _this$props.host,
          imghost = _this$props.imghost,
          hl = _this$props.languageOverride,
          reCaptchaCompat = _this$props.reCaptchaCompat,
          reportapi = _this$props.reportapi,
          sentry = _this$props.sentry,
          custom = _this$props.custom;
      var mountParams = {
        apihost: apihost,
        assethost: assethost,
        endpoint: endpoint,
        hl: hl,
        host: host,
        imghost: imghost,
        recaptchacompat: reCaptchaCompat === false ? "off" : null,
        reportapi: reportapi,
        sentry: sentry,
        custom: custom
      };
      mountCaptchaScript(mountParams).then(this.handleOnLoad)["catch"](this.handleError);
      this.apiScriptRequested = true;
    }
  }, {
    key: "renderCaptcha",
    value: function renderCaptcha(onReady) {
      var isApiReady = this.state.isApiReady;
      if (!isApiReady) return;
      var renderParams = Object.assign({
        "open-callback": this.handleOpen,
        "close-callback": this.handleClose,
        "error-callback": this.handleError,
        "chalexpired-callback": this.handleChallengeExpired,
        "expired-callback": this.handleExpire,
        "callback": this.handleSubmit
      }, this.props, {
        hl: this.props.hl || this.props.languageOverride,
        languageOverride: undefined
      }); //Render hCaptcha widget and provide necessary callbacks - hCaptcha

      var captchaId = hcaptcha.render(this.ref.current, renderParams);
      this.setState({
        isRemoved: false,
        captchaId: captchaId
      }, function () {
        onReady && onReady();
      });
    }
  }, {
    key: "resetCaptcha",
    value: function resetCaptcha() {
      var captchaId = this.state.captchaId;

      if (!this.isReady()) {
        return;
      } // Reset captcha state, removes stored token and unticks checkbox


      hcaptcha.reset(captchaId);
    }
  }, {
    key: "removeCaptcha",
    value: function removeCaptcha(callback) {
      var captchaId = this.state.captchaId;

      if (!this.isReady()) {
        return;
      }

      this.setState({
        isRemoved: true
      }, function () {
        hcaptcha.remove(captchaId);
        callback && callback();
      });
    }
  }, {
    key: "handleOnLoad",
    value: function handleOnLoad() {
      var _this3 = this;

      this.setState({
        isApiReady: true
      }, function () {
        // render captcha and wait for captcha id
        _this3.renderCaptcha(function () {
          // trigger onLoad if it exists
          var onLoad = _this3.props.onLoad;
          if (onLoad) onLoad();
        });
      });
    }
  }, {
    key: "handleSubmit",
    value: function handleSubmit(event) {
      var onVerify = this.props.onVerify;
      var _this$state = this.state,
          isRemoved = _this$state.isRemoved,
          captchaId = _this$state.captchaId;
      if (typeof hcaptcha === 'undefined' || isRemoved) return;
      var token = hcaptcha.getResponse(captchaId); //Get response token from hCaptcha widget

      var ekey = hcaptcha.getRespKey(captchaId); //Get current challenge session id from hCaptcha widget

      onVerify(token, ekey); //Dispatch event to verify user response
    }
  }, {
    key: "handleExpire",
    value: function handleExpire() {
      var onExpire = this.props.onExpire;
      var captchaId = this.state.captchaId;

      if (!this.isReady()) {
        return;
      }

      hcaptcha.reset(captchaId); // If hCaptcha runs into error, reset captcha - hCaptcha

      if (onExpire) onExpire();
    }
  }, {
    key: "handleError",
    value: function handleError(event) {
      var onError = this.props.onError;
      var captchaId = this.state.captchaId;

      if (this.isReady()) {
        // If hCaptcha runs into error, reset captcha - hCaptcha
        hcaptcha.reset(captchaId);
      }

      if (onError) onError(event);
    }
  }, {
    key: "isReady",
    value: function isReady() {
      var _this$state2 = this.state,
          isApiReady = _this$state2.isApiReady,
          isRemoved = _this$state2.isRemoved;
      return isApiReady && !isRemoved;
    }
  }, {
    key: "handleOpen",
    value: function handleOpen() {
      if (!this.isReady() || !this.props.onOpen) {
        return;
      }

      this.props.onOpen();
    }
  }, {
    key: "handleClose",
    value: function handleClose() {
      if (!this.isReady() || !this.props.onClose) {
        return;
      }

      this.props.onClose();
    }
  }, {
    key: "handleChallengeExpired",
    value: function handleChallengeExpired() {
      if (!this.isReady() || !this.props.onChalExpired) {
        return;
      }

      this.props.onChalExpired();
    }
  }, {
    key: "execute",
    value: function execute() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var captchaId = this.state.captchaId;

      if (!this.isReady()) {
        return;
      }

      if (opts && (0, _typeof2["default"])(opts) !== "object") {
        opts = null;
      }

      return hcaptcha.execute(captchaId, opts);
    }
  }, {
    key: "setData",
    value: function setData(data) {
      var captchaId = this.state.captchaId;

      if (!this.isReady()) {
        return;
      }

      if (data && (0, _typeof2["default"])(data) !== "object") {
        data = null;
      }

      hcaptcha.setData(captchaId, data);
    }
  }, {
    key: "getResponse",
    value: function getResponse() {
      return hcaptcha.getResponse(this.state.captchaId);
    }
  }, {
    key: "getRespKey",
    value: function getRespKey() {
      return hcaptcha.getRespKey(this.state.captchaId);
    }
  }, {
    key: "render",
    value: function render() {
      var elementId = this.state.elementId;
      return /*#__PURE__*/React.createElement("div", {
        ref: this.ref,
        id: elementId
      });
    }
  }]);
  return HCaptcha;
}(React.Component);

var _default = HCaptcha;
exports["default"] = _default;
module.exports = exports.default;