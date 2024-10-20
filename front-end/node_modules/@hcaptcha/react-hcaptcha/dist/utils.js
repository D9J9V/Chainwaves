"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateQuery = generateQuery;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

function generateQuery(params) {
  return Object.entries(params).filter(function (_ref) {
    var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

    return value || value === false;
  }).map(function (_ref3) {
    var _ref4 = (0, _slicedToArray2["default"])(_ref3, 2),
        key = _ref4[0],
        value = _ref4[1];

    return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(value));
  }).join("&");
}

;