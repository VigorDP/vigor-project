function Watcher(vm, exp, cb) {
  this.vm = vm;
  this.exp = exp;
  this.cb = cb;
  this.val = this.get();
}

Watcher.prototype = {
  constructor: Watcher,
  get() {
    Dep.target = this;
    const val = this.vm[this.exp];
    Dep.target = null;
    return val;
  },
  update(newValue) {
    this.cb(newValue);
  },
};
