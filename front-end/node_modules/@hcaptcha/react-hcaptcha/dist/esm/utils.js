function generateQuery(params) {
  return Object.entries(params).filter(function (_ref) {
    var key = _ref[0],
        value = _ref[1];
    return value || value === false;
  }).map(function (_ref2) {
    var key = _ref2[0],
        value = _ref2[1];
    return encodeURIComponent(key) + "=" + encodeURIComponent(value);
  }).join("&");
}

;
export { generateQuery };