// import { ROOT_NODE_ID } from './constants';
let idSeed = 0;

export default class Node {
  constructor(options) {
    idSeed++;
    this.text = null;
    this.checked = false;
    this.indeterminate = false;
    this.data = null;
    this.level = -1;
    this.checkedStatus = null;
    this.expanded = false;
    this.levelConfig = null;
    this.children = [];
    this.parent = null;
    this.lazy = false;
    this.loaded = false;

    for (let name in options) {
      if (options.hasOwnProperty(name)) {
        this[name] = options[name];
      }
    }

    if (this.parent) {
      this.level = this.parent.level + 1;
      this.parent.children.push(this);
    }
  }

  get label() {
    const data = this.data;
    if (!data) return '';
    const levelConfig = this.levelConfig;

    let labelProperty;
    if (levelConfig) {
      labelProperty = levelConfig.labelProperty;
    }

    if (!labelProperty) {
      return data.label || data.name || data.text;
    }

    return data[labelProperty];
  }

  get icon() {
    const data = this.data;
    if (!data) return '';
    const levelConfig = this.levelConfig;

    let iconProperty;
    if (levelConfig) {
      iconProperty = levelConfig.iconProperty;

      if (!iconProperty) {
        if (this.hasChild()) {
          return levelConfig.icon;
        } else {
          return levelConfig.leafIcon || levelConfig.icon;
        }
      }
    }

    return data[iconProperty];
  }

  insertChild(child, index) {
    if (!child) throw new Error('insertChild error: child is required.');

    if (!child instanceof Node) {
      throw new Error('insertChild error: child should an instance of Node.');
    }

    child.parent = this;
    child.level = this.level + 1;

    if (typeof index === 'undefined') {
      this.children.push(child);
    } else {
      this.children.splice(index, 0, child);
    }
  }

  removeChild(child) {
    const index = this.children.indexOf(child);

    if (index > -1) {
      child.parent = null;
      this.children.splice(child, index);
    }
  }

  expand(callback) {
    if (this.needLoadData()) {
      this.loadIfNeeded((data) => {
        if (data instanceof Array) {
          data.forEach((item) => {
            const node = new Node({
              data: item
            });
            this.insertChild(node);
          });
          callback();
        }
      });
    } else {
      this.expanded = true;
      if (callback) {
        callback();
      }
    }
  }

  collapse() {
    this.expanded = false;
  }

  needLoadData() {
    return this.lazy === true && !this.loaded && this.load;
  }

  hasChild() {
    const children = this.children;
    if (!this.lazy || (this.lazy === true && this.loaded === true)) {
      return children && children.length > 0;
    }
    return true;
  }

  isChecked() {
    if (this.checked !== undefined) return this.checked;

    const data = this.data;
    if (!data) return false;
    const levelConfig = this.levelConfig;
    let checkedProperty;

    if (levelConfig) {
      checkedProperty = levelConfig.checkedProperty;
      if (checkedProperty) {
        this.checked = !!data[checkedProperty];
      }
    }

    return this.checked;
  }

  setChecked(value, deep) {
    // Only work on lazy load data.
    this.loadIfNeeded(() => {
      // const children = this.children || [];
      // setTimeout(() => {
      //   for (let i = 0, j = children.length; i < j; i++) {
      //     const child = children[i];
      //      child.setChecked(value !== false);
      //   }
      // }, 0);
    });

    this.indeterminate = value === 'half';
    this.checked = value === true;

    if (deep) {
      var children = this.children;
      for (let i = 0, j = children.length; i < j; i++) {
        var child = children[i];
        child.setChecked(value !== false, deep);
      }
    }

    const parent = this.parent;

    if (parent.level === -1) return;

    const siblings = parent.children;

    let all = true;
    let none = true;

    for (let i = 0, j = siblings.length; i < j; i++) {
      var sibling = siblings[i];
      if (sibling.checked !== true) {
        all = false;
      }
      if (sibling.checked !== false) {
        none = false;
      }
    }

    if (all) {
      parent.setChecked(true);
    } else if (!all && !none) {
      parent.setChecked('half');
    } else if (none) {
      parent.setChecked(false);
    }
  }

  getChildren() { // this is data
    const data = this.data;
    if (!data) return null;
    const levelConfig = this.levelConfig;
    let childrenProperty = 'children';
    if (levelConfig) {
      childrenProperty = levelConfig.childrenProperty || 'children';
    }
    if (data[childrenProperty] === undefined) {
      data[childrenProperty] = null;
    }

    return data[childrenProperty];
  }

  setChildren(value) { // this is data
    const data = this.data;
    if (!data) return;
    const levelConfig = this.levelConfig;
    let childrenProperty = 'children';
    if (levelConfig) {
      childrenProperty = levelConfig.childrenProperty || 'children';
    }

    this.children = data[childrenProperty] = value;
  }

  loadIfNeeded(callback) {
    if (this.lazy === true && !this.loaded && this.load) {
      this.loaded = 'loading';

      const loadFn = this.load;
      const resolve = (data) => {
        this.loaded = true;
        // TODO
        this.data.children = data;

        if (callback) {
          callback.call(this, data);
        }
      };

      // emit event
      loadFn(this, resolve);
    } else {
      if (callback) {
        callback.call(this);
      }
    }
  }
}
