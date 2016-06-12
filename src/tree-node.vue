<template>
  <div class="tree-node" :class="{ expanded: childrenRendered && expanded }">
    <div class="tree-node-content">
      <span class="expand-icon" 
        :class="{ leafnode: !expandable, expanded: expandable && expanded }" 
        @click="handleExpandIconClick">
      </span>
      <input type="checkbox" v-model="node.checked" @change="handleCheckChange($event)" v-el:input />
      <span class="icon {{ node.icon }}" v-if="node.icon"></span><span class="text">
        {{ node.label }} [{{ '' + expandable }}] ({{ node.level }}) / {{ node.children.length }}
      </span>
    </div>

    <div class="tree-node-children"
      v-if="childrenRendered"
      v-show="expanded"
      transition="collapse">
      <d-tree-node v-for="child in data.children" :data="child"></d-tree-node>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  // import Vue from 'vue';
  import Node from './data/node';

  export default {
    name: 'd-tree-node',

    props: {
      data: {
        type: Object,
        required: true
      }
    },

    data() {
      return {
        $tree: null,
        node: {},
        loaded: false,
        expanded: false,
        levelConfig: null,
        childrenRendered: false
      };
    },

    watch: {
      'node.indeterminate'(newVal) {
        this.$els.input.indeterminate = newVal;
      }
    },

    computed: {
      expandable() {
        const tree = this.$tree;
        var children = this.data.children;

        if (!tree.lazy || (tree.lazy === true && this.node.loaded === true)) {
          return !!(children && children.length > 0);
        }
        return true;
      }
    },

    methods: {
      handleExpandIconClick() {
        if (this.expanded) {
          this.node.collapse();
          this.expanded = false;
        } else {
          this.node.expand(() => {
            this.expanded = true;
            this.childrenRendered = true;
          });
        }
      },

      handleCheckChange(event) {
        const checked = event.target.checked;
        this.node.setChecked(checked, true);
      }
    },

    created() {
      var parent = this.$parent;

      if (parent.$isTree) {
        this.$tree = parent;
      } else {
        this.$tree = parent.$tree;
      }

      const tree = this.$tree;

      const levelConfig = tree.levelConfig;
      this.levelConfig = levelConfig;

      if (!tree) {
        console.warn('Can not find node\'s tree.');
      }

      this.node = new Node({
        lazy: tree.lazy,
        load: tree.load,
        data: this.data,
        parent: parent.node,
        levelConfig
      });
    },

    transitions: {
      collapse: require('./collapse-transition').default
    }
  };
</script>