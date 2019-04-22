const Dep = require('./dep');

function Computed(ctx, computed) {
  const dataWithComputedDeps = new Dep();
  
  const data = ctx.data;
  function defDatas(key) {
    Object.defineProperty(ctx, key, {
      set(v) {
        ctx.setData({[key]: v});
        // 更新依赖该值的 computed
        setTimeout(() => {
          dataWithComputedDeps.notify(key, ckey => {
            ctx.setData({
              [ckey]: computed[ckey].bind(ctx)()
            });
          });
        }, 0);
      },
      get() {
        const k = dataWithComputedDeps.target;
        if(k) {
          dataWithComputedDeps.addDep(key, k);
        }
        return ctx.data[key];
      }
    });
  }

  // 重新监听 data 和 computed
  for(const key in data) {
    defDatas(key);
  }

  // 将 computed 挂载到 data 并收集 computed 的依赖
  for(const key in computed) {
    dataWithComputedDeps.target = key;
    const v = computed[key].bind(ctx)();
    setTimeout(() => {
      ctx[key] = v;// 暂不理解
    }, 0);
    
    delete dataWithComputedDeps.target;
  }
}

module.exports = Computed;