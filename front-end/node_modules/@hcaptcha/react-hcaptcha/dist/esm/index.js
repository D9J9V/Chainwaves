import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/inheritsLoose";
import * as React from 'react';
import { generateQuery } from "./utils.js";
var SCRIPT_ID = 'hcaptcha-api-script-id';
var HCAPTCHA_LOAD_FN_NAME = 'hcaptchaOnLoad'; // Prevent loading API script multiple times

var resolveFn;
var rejectFn;
var mountPromise = new Promise(function (resolve, reject) {
  resolveFn = resolve;
  rejectFn = reject;
}); // Generate hCaptcha API script

var mountCaptchaScript = function mountCaptchaScript(params) {
  if (params === void 0) {
    params = {};
  }

  if (document.getElementById(SCRIPT_ID)) {
    // API was already requested
    return mountPromise;
  } // Create global onload callback


  window[HCAPTCHA_LOAD_FN_NAME] = resolveFn;
  var domain = params.apihost || "https://js.hcaptcha.com";
  delete params.apihost;
  var script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = domain + "/1/api.js?render=explicit&onload=" + HCAPTCHA_LOAD_FN_NAME;
  script.async = true;

  script.onerror = function (event) {
    return rejectFn('script-error');
  };

  var query = generateQuery(params);
  script.src += query !== "" ? "&" + query : "";
  document.head.appendChild(script);
  return mountPromise;
};

var HCaptcha = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(HCaptcha, _React$Component);

  function HCaptcha(props) {
    var _this;

    _this = _React$Component.call(this, props) || this; // API Methods

    _this.renderCaptcha = _this.renderCaptcha.bind(_assertThisInitialized(_this));
    _this.resetCaptcha = _this.resetCaptcha.bind(_assertThisInitialized(_this));
    _this.removeCaptcha = _this.removeCaptcha.bind(_assertThisInitialized(_this));
    _this.isReady = _this.isReady.bind(_assertThisInitialized(_this)); // Event Handlers

    _this.loadCaptcha = _this.loadCaptcha.bind(_assertThisInitialized(_this));
    _this.handleOnLoad = _this.handleOnLoad.bind(_assertThisInitialized(_this));
    _this.handleSubmit = _this.handleSubmit.bind(_assertThisInitialized(_this));
    _this.handleExpire = _this.handleExpire.bind(_assertThisInitialized(_this));
    _this.handleError = _this.handleError.bind(_assertThisInitialized(_this));
    _this.handleOpen = _this.handleOpen.bind(_assertThisInitialized(_this));
    _this.handleClose = _this.handleClose.bind(_assertThisInitialized(_this));
    _this.handleChallengeExpired = _this.handleChallengeExpired.bind(_assertThisInitialized(_this));
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

  var _proto = HCaptcha.prototype;

  _proto.componentDidMount = function componentDidMount() {
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
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    var captchaId = this.state.captchaId;

    if (!this.isReady()) {
      return;
    } // Reset any stored variables / timers when unmounting


    hcaptcha.reset(captchaId);
    hcaptcha.remove(captchaId);
  };

  _proto.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
    // Prevent component re-rendering when these internal state variables are updated
    if (this.state.isApiReady !== nextState.isApiReady || this.state.isRemoved !== nextState.isRemoved) {
      return false;
    }

    return true;
  };

  _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
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
  };

  _proto.loadCaptcha = function loadCaptcha() {
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
  };

  _proto.renderCaptcha = function renderCaptcha(onReady) {
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
  };

  _proto.resetCaptcha = function resetCaptcha() {
    var captchaId = this.state.captchaId;

    if (!this.isReady()) {
      return;
    } // Reset captcha state, removes stored token and unticks checkbox


    hcaptcha.reset(captchaId);
  };

  _proto.removeCaptcha = function removeCaptcha(callback) {
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
  };

  _proto.handleOnLoad = function handleOnLoad() {
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
  };

  _proto.handleSubmit = function handleSubmit(event) {
    var onVerify = this.props.onVerify;
    var _this$state = this.state,
        isRemoved = _this$state.isRemoved,
        captchaId = _this$state.captchaId;
    if (typeof hcaptcha === 'undefined' || isRemoved) return;
    var token = hcaptcha.getResponse(captchaId); //Get response token from hCaptcha widget

    var ekey = hcaptcha.getRespKey(captchaId); //Get current challenge session id from hCaptcha widget

    onVerify(token, ekey); //Dispatch event to verify user response
  };

  _proto.handleExpire = function handleExpire() {
    var onExpire = this.props.onExpire;
    var captchaId = this.state.captchaId;

    if (!this.isReady()) {
      return;
    }

    hcaptcha.reset(captchaId); // If hCaptcha runs into error, reset captcha - hCaptcha

    if (onExpire) onExpire();
  };

  _proto.handleError = function handleError(event) {
    var onError = this.props.onError;
    var captchaId = this.state.captchaId;

    if (this.isReady()) {
      // If hCaptcha runs into error, reset captcha - hCaptcha
      hcaptcha.reset(captchaId);
    }

    if (onError) onError(event);
  };

  _proto.isReady = function isReady() {
    var _this$state2 = this.state,
        isApiReady = _this$state2.isApiReady,
        isRemoved = _this$state2.isRemoved;
    return isApiReady && !isRemoved;
  };

  _proto.handleOpen = function handleOpen() {
    if (!this.isReady() || !this.props.onOpen) {
      return;
    }

    this.props.onOpen();
  };

  _proto.handleClose = function handleClose() {
    if (!this.isReady() || !this.props.onClose) {
      return;
    }

    this.props.onClose();
  };

  _proto.handleChallengeExpired = function handleChallengeExpired() {
    if (!this.isReady() || !this.props.onChalExpired) {
      return;
    }

    this.props.onChalExpired();
  };

  _proto.execute = function execute(opts) {
    if (opts === void 0) {
      opts = null;
    }

    var captchaId = this.state.captchaId;

    if (!this.isReady()) {
      return;
    }

    if (opts && typeof opts !== "object") {
      opts = null;
    }

    return hcaptcha.execute(captchaId, opts);
  };

  _proto.setData = function setData(data) {
    var captchaId = this.state.captchaId;

    if (!this.isReady()) {
      return;
    }

    if (data && typeof data !== "object") {
      data = null;
    }

    hcaptcha.setData(captchaId, data);
  };

  _proto.getResponse = function getResponse() {
    return hcaptcha.getResponse(this.state.captchaId);
  };

  _proto.getRespKey = function getRespKey() {
    return hcaptcha.getRespKey(this.state.captchaId);
  };

  _proto.render = function render() {
    var elementId = this.state.elementId;
    return /*#__PURE__*/React.createElement("div", {
      ref: this.ref,
      id: elementId
    });
  };

  return HCaptcha;
}(React.Component);

export default HCaptcha;