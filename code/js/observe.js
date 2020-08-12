class Observe {
  constructor(data) {
    this.walk(data);
  }
  walk(data) {
    // 1. 判断data是否是对象
    if (!data || typeof data !== "object") return;
    // 2. 遍历data对象的所有属性
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key]);
    });
  }

  defineReactive(obj, key, val) {
    let _this = this;
    // 如果val是对象，把val内部的属性转换成响应式
    this.walk(val);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        return val; // 如果使用 obj[key] 会发生死递归
      },
      set(newValue) {
        if (newValue === val) return;
        val = newValue;
        _this.walk(newValue);
      }
    });
  }
}
