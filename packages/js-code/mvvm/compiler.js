function Compiler(vm, el) {
  const dom = document.querySelector(el);
  this.vm = vm;
  this.$el = dom;
  this.init();
}

Compiler.prototype = {
  constructor: Compiler,
  init() {
    const { childNodes } = this.$el;
    [].slice.call(childNodes).forEach(child => this.compile(child));
  },
  compile(child) {
    if (child.nodeType === 3) {
      const val = child.textContent;
      const reg = /\{\{(.*)\}\}/;
      const result = val.match(reg);
      if (!result) return;
      this.bind(val.match(reg)[1], 'text', child);
    } else {
      const attrs = child.attributes;
      [].slice.call(attrs).forEach(attr => {
        const directiveReg = /v-/;
        const eventDirectiveReg = /v-on/;
        const attrName = attr.name;
        const attrValue = attr.value;
        if (attrName.match(directiveReg)) {
          if (attrName.match(eventDirectiveReg)) {
            this.event(attrName.slice(5), attrValue, child);
          } else {
            this.bind(attrValue, attrName.slice(2), child);
          }
          child.removeAttribute(attrName);
        }
      });
      [].slice.call(child.childNodes).forEach(child => this.compile(child));
    }
  },
  bind(exp, type, node) {
    const me = this;
    if (type === 'model') {
      node.addEventListener('input', e => {
        me.vm[exp] = e.target.value;
      });
    }
    const updateFn = updateUtil[type];
    console.log('me.vm[exp]', me.vm[exp]);
    updateFn && updateFn(node, me.vm[exp]);
    new Watcher(me.vm, exp, () => {
      updateFn && updateFn(node, me.vm[exp]);
    });
  },
  event(eventType, exp, node) {
    const handler = this.vm.options.methods[exp].bind(this.vm);
    node.addEventListener(eventType, handler, false);
  },
};

var updateUtil = {
  text(node, newValue) {
    node.textContent = newValue;
  },
  model(node, newValue) {
    node.value = newValue;
  },
};
