<template>
  <div class="el-tree">
    <el-tree-node v-for="child in tree.root.children" :data="child.data" :node="child"></el-tree-node>
  </div>
</template>

<script type="text/ecmascript-6">
  require('./tree.css');
  import Tree from './data/tree';

  export default {
    name: 'el-tree',

    props: {
      data: {
        type: Array
      },
      props: {
        default() {
          return {
            children: 'children',
            label: 'label',
            icon: 'icon'
          };
        }
      },
      lazy: {
        type: Boolean,
        default: false
      },
      load: {
        type: Function
      }
    },

    created() {
      this.$isTree = true;

      this.tree = new Tree({
        data: this.data,
        lazy: this.lazy,
        props: this.props,
        load: this.load
      });
    },

    data() {
      return {
        tree: {}
      };
    },

    components: {
      ElTreeNode: require('./tree-node.vue')
    },

    computed: {
      children: {
        set(value) {
          this.data = value;
        },
        get() {
          return this.data;
        }
      }
    },

    methods: {
      getCheckedNodes(leafOnly) {
        return this.tree.getCheckedNodes(leafOnly);
      }
    }
  };
</script>
