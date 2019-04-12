function getType(agr) {
  return Object.prototype.toString.call(agr).split(/\s/)[1].slice(0, -1).toLowerCase();
}

function defProp() {
  return Object.defineProperty.apply(Object, arguments);
}

function NutComponent(obj) {
  if(getType(Component) !== 'function') return console.error(`no mp 'Component' function.`);

  const { behaviors = [] } = obj;
  const behavior = Behavior({
    data: {
      $slot: {
        default: true
      }
    },
    properties: {
      useSlots: {
        type: Object,
        default: {}
      }
    },
    created() {
      // 补全 $slots
      console.log(this)
      let useSlots = this.useSlots;
      if (useSlots && Object.keys(useSlots).length) {
        useSlots.default = true;
      } else {
        useSlots = { default: true };
      }
      this.$slots = useSlots;

      // 兼容 this.key = value 与 setData，后续考虑是否递归
      const datas = this.data;
      const keys = Object.keys(datas);
      const $this = this;
      if (keys.length) {
        keys.forEach(key => {
          Object.defineProperty(this, key, {
            set(v) {
              $this.setData({
                [key]: v
              });
            },
            get() {
              return $this.data[key];
            }
          });
        });
      }
    }
  });

  behaviors.push(behavior);
  obj.behaviors = behaviors;

  return Component(obj);
}

module.exports = NutComponent;