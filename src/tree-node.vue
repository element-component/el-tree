<template>
  <div class="el-tree-node"
     :class="{ expanded: childrenRendered && expanded }">
    <div class="el-tree-node__content">
      <span class="el-tree-node__expand-icon"
        :class="{ 'is-leaf': !node.isLeaf, expanded: node.isLeaf && expanded }"
        @click="handleExpandIconClick">
      </span>
      <input v-el:input type="checkbox"
        :true-value="true" :false-value="false" v-model="node.checked"
        @change="handleCheckChange($event)" />
      <span class="el-tree-node__icon {{ node.icon }}" v-if="node.icon"></span>
      <span class="el-tree-node__label">{{ node.label }} {{ node.loading ? '---- loading' : '' }}</span>
    </div>

    <div class="el-tree-node__children"
      v-if="childrenRendered"
      v-show="expanded"
      transition="collapse">
      <el-tree-node v-for="child in node.children" :data="child.data" :node="child"></el-tree-node>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import CollapseTransition from './transition';

  export default {
    name: 'el-tree-node',

    props: {
      data: {
        type: Object,
        required: true
      },
      node: {
        default() {
          return {};
        }
      }
    },

    data() {
      return {
        $tree: null,
        expanded: false,
        childrenRendered: false
      };
    },

    watch: {
      'node.indeterminate'(newVal) {
        this.$els.input.indeterminate = newVal;
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

    beforeCompile() {
      var parent = this.$parent;

      if (parent.$isTree) {
        this.$tree = parent;
      } else {
        this.$tree = parent.$tree;
      }

      const tree = this.$tree;

      if (!tree) {
        console.warn('Can not find node\'s tree.');
      }
    },

    transitions: {
      collapse: CollapseTransition
    }
  };
</script>