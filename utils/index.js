function getType(agr) {
  return Object.prototype.toString.call(agr).split(/\s/)[1].slice(0, -1).toLowerCase();
}

function defProp() {
  return Object.defineProperty.apply(Object, arguments);
}

module.exports = {
  getType,
  defProp
}