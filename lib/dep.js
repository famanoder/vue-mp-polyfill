function Dep() {
  this.deps = {};
}

Dep.prototype = {
  addDep(key, depKey) {
    if(!depKey) return;
    const deps = this.deps[key];
    if(!deps) {
      this.deps[key] = [depKey];
    }else{
      if(!~deps.indexOf(depKey)) {
        deps.push(depKey)
      };
    }
  },
  notify(key, cb) {
    const deps = this.deps[key] || [];
    if(deps.length) {
      deps.forEach(cKey => cb.call(this, cKey));
    }
  }
}

module.exports = Dep;