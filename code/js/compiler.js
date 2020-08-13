class Compiler {
  constructor(vm) {
    this.el = vm.$el;
    this.vm = vm;
    this.compile(this.el);
  }

  // 编译模板，处理文本节点和元素节点
  compile(el) {
    let childNodes = el.childNodes;
    Array.from(childNodes).forEach(node => {
      if (this.isTextNode(node)) {
        // 处理文本节点
        this.compileText(node);
      } else if (this.isElementNode(node)) {
        // 处理元素节点
        this.compileElement(node);
      }

      // 判断 node节点是否有子节点 如果有子节点，要递归调用compile
      if (node.childNodes && node.childNodes.length) {
        this.compile(node);
      }
    });
  }

  // 编译元素节点，处理指令
  compileElement(node) {
    // console.log(node.attributes);
    // 遍历所有属性节点
    Array.from(node.attributes).forEach(attr => {
      let attrName = attr.name;
      if (this.isDirective(attrName)) {
        // v-text --> text
        attrName = attrName.substr(2);
        let key = attr.value;
        this.update(node, key, attrName);
      }
    });
  }

  update(node, key, attrName) {
    let updateFn = this[`${attrName}Updater`];
    // 坑一： this指向 --- class 内部是严格模式
    updateFn && updateFn.call(this, node, this.vm[key], key);
  }

  // 处理 v-text
  textUpdater(node, value, key) {
    node.textContent = value;
    new Watch(this.vm, key, newValue => {
      node.textContent = newValue;
    });
  }
  // 处理 v-model
  modelUpdater(node, value, key) {
    node.value = value;
    new Watch(this.vm, key, newValue => {
      node.value = newValue;
    });

    // 双向绑定
    node.addEventListener("input", () => {
      this.vm[key] = node.value;
    });
  }

  // 编译文本节点，处理插值表达式
  compileText(node) {
    // console.dir(node);
    let reg = /\{\{(.+?)\}\}/;
    let value = node.textContent;
    if (reg.test(value)) {
      let key = RegExp.$1.trim();
      node.textContent = value.replace(reg, this.vm[key]);

      // 创建watch对象，当数据变化时更新视图
      new Watch(this.vm, key, newValue => {
        node.textContent = newValue;
      });
    }
  }

  // 判断元素属性是否是指令
  isDirective(attrName) {
    return attrName.startsWith("v-");
  }

  // 判断节点是否是文本节点
  isTextNode(node) {
    return node.nodeType === 3;
  }

  // 判断节点是否是元素节点
  isElementNode(node) {
    return node.nodeType === 1;
  }
}
