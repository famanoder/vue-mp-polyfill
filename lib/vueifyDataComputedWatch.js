const Dep = require('./dep');
const {getType, defProp} = require('../utils/index');

function watchImmediate(ctx, data, watch) {
  // watch immediate
  for(const w in watch) {
    const value = watch[w];
    if(w in data && getType(value) === 'object') {
      const {handler, immediate} = value;
      if(getType(handler) === 'function') {
        if(immediate) handler.call(ctx, data[w], data[w]);
        watch[w] = handler;
      }
    }
  }
}

function notifyComputed(dep, key) {
  return function(ctx, computed) {
    setTimeout(() => {
      dep.notify(key, ckey => {
        ctx.setData({
          [ckey]: computed[ckey].call(ctx)
        });
      });
    }, 0);
  }
}

function collectDeps(dep) {
  return function(key) {
    const k = dep.target;
    if(k) {
      dep.addDep(key, k);
    }
  }
}

function dispatchComputed(dep) {
  return function(ctx, computed) {
    for(const key in computed) {
      dep.target = key;
      const v = computed[key].call(ctx);
      setTimeout(() => {
        ctx[key] = v;// 暂不理解
      }, 0);
      
      delete dep.target;
    }
  }
}

function defDatas(dep) {
  return function(ctx, key, computed, watch) {
    // 使 setData({key: value}) 兼容 this.key = value
    defProp(ctx, key, {
      set(v) {
        const oldVal = ctx.data[key];
        // eq(v, oldVal);

        ctx.setData({[key]: v});

        // 更新依赖该值的 computed
        notifyComputed(dep, key)(ctx, computed);

        // watch
        const watchFn = watch[key];
        if(watchFn) {
          watchFn.call(ctx, v, oldVal);
        }
      },
      get() {
        collectDeps(dep)(key);
        return ctx.data[key];
      }
    });
  }
}

function vueifyDataComputedWatch(ctx, computed, watch) {
  const data = ctx.data;console.log('data,',data);
  const computedDep = new Dep();

  watchImmediate(ctx, data, watch);

  // 重新监听 data 和 computed
  for(const key in data) {
    defDatas(computedDep)(ctx, key, computed, watch);
  }

  // 将 computed 挂载到 data 并收集 computed 的依赖
  dispatchComputed(computedDep)(ctx, computed);
}

module.exports = vueifyDataComputedWatch;

// 1. data 深层遍历
// 2. 新旧值的比对
// 3. setData 优化
// 4. 数组更新