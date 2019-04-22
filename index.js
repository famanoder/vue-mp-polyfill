const {getType, defProp} = require('./utils/index');
const Computed = require('./lib/computed');

function NutComponent(obj) {
  if(getType(Component) !== 'function') return console.error(`no mp 'Component' function.`);

  const { behaviors = [], computed, watch } = obj;

  const _data = {
    $slot: {
      default: true
    }
  };

  const computedKeys = Object.keys(computed);
  if(computedKeys.length) {
    computedKeys.forEach(k => _data[k] = null);
  }

  const behavior = Behavior({
    data: _data,
    properties: {
      useSlots: {
        type: Object,
        default: {}
      }
    },
    created() {
      const $this = this;

      // 补全 $slots
      let useSlots = this.useSlots;
      if (useSlots && Object.keys(useSlots).length) {
        useSlots.default = true;
      } else {
        useSlots = { default: true };
      }
      this.$slots = useSlots;

      // 兼容 this.key = value 与 setData，后续考虑是否递归
      // computed folyfill
      // computed的key：1. 相互依赖；2. 依赖各种data；3. data与computed都有依赖
      // 所以将computed与data合并，重新修改setter，在set中触发computed
      if (computed && getType(computed) === 'object' && Object.keys(computed).length) {
        Computed(this, computed);
      } 
      if(watch && getType(watch) === 'object' && Object.keys(watch).length) {
        
      }
    }
  });

  behaviors.push(behavior);
  obj.behaviors = behaviors;

  return Component(obj);
}

module.exports = NutComponent;

// watcher
// dep
const data = {
  a: 12,
  b: 23,
  c: 'aa'
}
const computeds = {
  d() {return data.a + data.b;},
  e() {return data.a + data.c;}
}
const deps = {};

function def(obj, key, val) {
  Object.defineProperty(obj, key, {
    set(v) {
      // this.setData({[k]: v});
      obj[key] = v;
      val = v;
      const _deps = deps[key] || [];
      if(_deps.length) {

      }
    },
    get() {
      const k = deps.target;
      if(k && !deps[key]) {
        const keyDeps = deps[key] || [];
        keyDeps.push(k);
        deps[key] = keyDeps;
      }
      return val;
    }
  });
}

for(let a in data) {
  def(data, a, data[a]);
}

function initComputedDeps() {
  for(let k in computeds) {
    deps.target = k;
    deps[k] = [];
    const v = computeds[k]();
    // this.setData({
    //   [k]: v
    // });
    delete deps.target;
  }
}

initComputedDeps();