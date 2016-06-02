<template>
  <div class="tree-node" :class="{ expanded: childrenRendered && expanded }">
    <div class="tree-node-content">
      <span class="expand-icon" :class="{ leafnode: !hasChild, expanded: hasChild && expanded }" @click="handleExpandIconClick"></span>
      <input type="checkbox" v-model="isChecked" @change="handleCheckChange()" v-el:input />
      <span class="icon {{icon}}" v-if="icon"></span><span class="text">{{ label }}</span>
    </div>
    <div class="tree-node-children"
      v-if="!lazyRenderChildren || (lazyRenderChildren && childrenRendered)"
      v-show="expanded"
      transition="collapse">
      <d-tree-node v-for="child in children || childrenData" :data="child"></d-tree-node>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import Vue from 'vue';
  import Node from './data/node';

  export default {
    name: 'd-tree-node',

    props: {
      checked: {},
      data: {
        type: Object
      }
    },

    computed: {
      needLoadData() {
        const node = new Node();
        console.log(node);

        return this.lazy === true && !this.loaded && this.loadFn;
      },

      hasChild() {
        var children = this.children || this.childrenData;
        if (!this.lazy || (this.lazy === true && this.loaded === true)) {
          return children && children.length > 0;
        }
        return true;
      },

      label() {
        var data = this.data;
        if (!data) return '';
        var levelConfig = this.levelConfig;
        var labelProperty;
        if (levelConfig) {
          labelProperty = levelConfig.labelProperty;
        }
        if (!labelProperty) {
          return data.label || data.name;
        }
        return data[labelProperty];
      },

      isChecked: {
        get() {
          if (this.checked !== undefined) return this.checked;

          var data = this.data;
          if (!data) return false;
          var levelConfig = this.levelConfig;
          var checkedProperty;

          if (levelConfig) {
            checkedProperty = levelConfig.checkedProperty;

            if (checkedProperty) {
              this.checked = !!data[checkedProperty];
            }
          }

          return this.checked;
        },

        set(value) {
          var data = this.data;
          if (!data) return;
          var levelConfig = this.levelConfig;
          var checkedProperty;

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
      },

      icon() {
        var data = this.data;
        if (!data) return '';
        var levelConfig = this.levelConfig;
        var iconProperty;
        if (levelConfig) {
          iconProperty = levelConfig.iconProperty;

          if (!iconProperty) {
            if (this.hasChild) {
              return levelConfig.icon;
            } else {
              return levelConfig.leafIcon || levelConfig.icon;
            }
          }
        }

        return data[iconProperty];
      },

      children: {
        get() {
          var data = this.data;
          if (!data) return null;
          var levelConfig = this.levelConfig;
          var childrenProperty = 'children';
          if (levelConfig) {
            childrenProperty = levelConfig.childrenProperty || 'children';
          }
          if (data[childrenProperty] === undefined) {
            data[childrenProperty] = null;
          }

          return data[childrenProperty];
        },

        set(value) {
          var data = this.data;
          if (!data) return;
          var levelConfig = this.levelConfig;
          var childrenProperty = 'children';
          if (levelConfig) {
            childrenProperty = levelConfig.childrenProperty || 'children';
          }
          this.childrenData = data[childrenProperty] = value;
        }
      }
    },

    methods: {
      handleExpandIconClick() {
        // Only work on lazy load data.
        if (this.needLoadData) {
          this.loadIfNeeded(() => {
            this.expanded = true;
            this.childrenRendered = true;
          });
        } else {
          if (!this.expanded) {
            this.expanded = true;
            this.childrenRendered = true;
          } else {
            this.expanded = false;
            this.childrenRendered = true;
          }
        }
      },

      handleCheckChange() {
        var value = this.checked;

        this.setChecked(value);

        var children = this.$children;
        for (var i = 0, j = children.length; i < j; i++) {
          var child = children[i];
          child.setChecked(value, true);
        }
      },

      loadIfNeeded(callback) {
        if (this.lazy === true && !this.loaded && this.loadFn) {
          this.loaded = 'loading';

          var loadFn = this.loadFn;

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
          if (this.lazyRenderChildren) {
            if (!this.childrenRendered) {
              this.childrenRendered = true;
              if (callback) {
                callback.call(this);
              }
            }
          }
        }
      },

      setChecked(value, deep) {
        // Only work on lazy load data.
        this.loadIfNeeded(() => {
          var children = this.$children || [];
          Vue.nextTick(function() {
            for (var i = 0, j = children.length; i < j; i++) {
              var child = children[i];
              child.setChecked(value !== false);
            }
          });
        });

        var input = this.$els.input;
        if (value === 'half') {
          input.indeterminate = true;
          input.checked = false;
        } else {
          input.indeterminate = false;
          input.checked = !!value;
        }

        this.isChecked = value;
        var i, j;

        if (deep) {
          var children = this.$children;
          for (i = 0, j = children.length; i < j; i++) {
            var child = children[i];
            child.setChecked(value !== false, deep);
          }
        }

        var parent = this.$parent;

        if (parent.level === undefined) return;

        var siblings = parent.$children;

        var all = true;
        var none = true;

        for (i = 0, j = siblings.length; i < j; i++) {
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
    },

    created() {
      var parent = this.$parent;
      if (parent.$isTree) {
        this.level = 0;
        this.$tree = parent;
        this.levelConfig = parent.levelConfig;
        if (this.levelConfig.recursive) {
          this.levelConfig.children = this.levelConfig;
        }
      } else {
        this.level = parent.level + 1;
        this.$tree = parent.$tree;
        if (parent.levelConfig) {
          this.levelConfig = parent.levelConfig.children;
          if (this.levelConfig && this.levelConfig.recursive) {
            this.levelConfig.children = this.levelConfig;
          }
        }
      }

      var levelConfig = this.levelConfig;
      if (levelConfig) {
        var children = levelConfig.children;
        if (children && children.lazy !== undefined) {
          this.lazy = true;
          this.loadFn = children.load;
        }
      }

      if (!this.$tree) {
        console.warn('Can not find node\'s tree.');
      } else {
        this.lazyRenderChildren = this.$tree.lazyRender;
        if (this.levelConfig && this.levelConfig.lazy === false) {
          this.lazyRenderChildren = false;
        }
      }
    },

    ready() {
      if (this.levelConfig) {
        var lazy = this.levelConfig.lazy;
        if (lazy === false && this.loadFn) {
          this.loadIfNeeded();
        }
      }

      if (this.isChecked) {
        Vue.nextTick(() => {
          this.setChecked(true);
        });
      }
    },

    data() {
      return {
        $tree: null,
        level: 0,
        childrenData: [],
        loaded: false,
        expanded: false,
        levelConfig: null,
        lazyRenderChildren: true,
        childrenRendered: false
      };
    },

    transitions: {
      collapse: require('./collapse-transition').default
    }
  };
</script>