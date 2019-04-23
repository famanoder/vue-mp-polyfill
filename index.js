const {getType} = require('./utils/index');
const vueifyDataComputedWatch = require('./lib/vueifyDataComputedWatch');

function NutComponent(obj) {
  if(getType(Component) !== 'function') return console.error(`no mp 'Component' function.`);

  const { behaviors = [], computed, watch } = obj;

  const _data = {
    $slot: {
      default: true
    }
  };

  // 把 computed 的 key 加入 data
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
        console.log('this,',this);
        vueifyDataComputedWatch(this, computed, watch);
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
