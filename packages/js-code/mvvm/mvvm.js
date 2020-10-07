function MVVM(options) {
  this.options = options;
  this.proxy(options.data);
  this.init(options);
}
MVVM.prototype = {
  constructor: MVVM,
  init(opt) {
    observe(opt.data);
    this.initComputed();
    this.initWatch();
    this.$compiler = new Compiler(this, opt.el);
  },
  initComputed() {
    const { computed } = this.options;
    Object.keys(computed).forEach(key => {
      const valueFn = computed[key].bind(this);
      Object.defineProperty(this, key, {
        configurable: false,
        enumerable: true,
        get() {
          return valueFn();
        },
        set(newValue) {
          return newValue;
        },
      });
    });
  },
  initWatch() {
    const { watch } = this.options;
    Object.keys(watch).forEach(key => {
      new Watcher(this, key, watch[key].bind(this));
    });
  },
  proxy(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        configurable: false,
        enumerable: true,
        get() {
          return data[key];
        },
        set(newValue) {
          return (data[key] = newValue);
        },
      });
    });
  },
};
