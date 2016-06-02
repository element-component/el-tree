// import { ROOT_NODE_ID } from './constants';
import Vue from 'vue';

export default class Node {
  constructor(id, options) {
    this._id = id;
    this.icon = null;
    this.text = null;
    this.checked = false;
    this.checkedStatus = null;
    this.expanded = false;
    this.levelConfig = null;
    this.level = null;
    this.children = null;
    this.lazy = false;
    this.loaded = false;
    this.data = null;

    for (let name in options) {
      if (options.hasOwnProperty(name)) {
        this[name] = options[name];
      }
    }
  }

  getLabel() {
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

  needLoadData() {
    return this.lazy === true && !this.loaded && this.loadFn;
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

  setChecked1(value) {
    const data = this.data;
    if (!data) return;
    const levelConfig = this.levelConfig;
    let checkedProperty;

    if (levelConfig) {
      checkedProperty = levelConfig.checkedProperty;

      if (checkedProperty) {
        this.checked = value;
        data[checkedProperty] = value !== false;
        return;
      }
    }

    this.checked = value;
  }

  setChecked(value, deep) {
    // Only work on lazy load data.
    this.loadIfNeeded(() => {
      const children = this.$children || [];
      Vue.nextTick(function() {
        for (let i = 0, j = children.length; i < j; i++) {
          const child = children[i];
          child.setChecked(value !== false);
        }
      });
    });

    const input = this.$els.input;
    if (value === 'half') {
      input.indeterminate = true;
      input.checked = false;
    } else {
      input.indeterminate = false;
      input.checked = !!value;
    }

    this.isChecked = value;

    if (deep) {
      var children = this.$children;
      for (let i = 0, j = children.length; i < j; i++) {
        var child = children[i];
        child.setChecked(value !== false, deep);
      }
    }

    const parent = this.$parent;

    if (parent.level === undefined) return;

    const siblings = parent.$children;

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

  getIcon() {
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

  getChildren() {
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

  setChildren(value) {
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
    if (this.lazy === true && !this.loaded && this.loadFn) {
      this.loaded = 'loading';

      const loadFn = this.loadFn;

      // emit event
      loadFn(this, () => {
        this.loaded = true;
        if (this.lazyRenderChildren) {
          if (!this.childrenRendered) {
            this.childrenRendered = true;
          }
          if (callback) {
            callback.call(this);
          }
        }
      });
    } else {
      // emit event
      if (this.lazyRenderChildren && !this.childrenRendered) {
        this.childrenRendered = true;
        if (callback) {
          callback.call(this);
        }
      }
    }
  }
}
