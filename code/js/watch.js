class Watch {
  constructor(vm, key, cb) {
    this.vm = vm;
    // data中的属性名
    this.key = key;
    // 回调函数负责更新视图
    this.cb = cb;

    // 把watch对象记录到Dep类的静态属性target中
    Dep.target = this;
    // 触发get方法，在get方法中会调用addSub
    this.oldValue = vm[key];
    // 防止重复添加
    Dep.target = null;
  }

  // 当数据变化时更新视图
  update() {
    let newValue = this.vm[this.key];
    if (this.oldValue === newValue) return;
    this.cb(newValue);
    this.oldValue = newValue;
  }
}
