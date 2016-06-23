<template>
  <div style="height: 400px;">
    <tree :data="data" :props="defaultProps"></tree>
    <div style="height: 100px;"></div>
    <tree :data="regions" :props="props" :load="loadNode" lazy></tree>
  </div>
</template>

<style>
  .leaf {
    width: 20px;
    background: #ddd;
  }

  .folder {
    width: 20px;
    background: #888;
  }
</style>

<script type="text/ecmascript-6">
  import Vue from 'vue';
  import Tree from './../src/index';

  Vue.use(Tree);

  var data = [{
    label: 'bb',
    children: [{
      label: 'b1'
    }]
  }, {
    label: 'cc',
    children: [{
      label: 'cc1'
    }, {
      label: 'cc2'
    }]
  }];

  var regions = [{
    'name': 'region1'
  }, {
    'name': 'region2'
  }];

  var count = 1;

  var props = {
    label: 'name',
    children: 'zones',
    icon(data, node) {
      if (node.isLeaf) {
        return 'leaf';
      }
      return 'folder';
    }
  };

  var defaultProps = {
    children: 'children',
    label: 'label'
  };

  export default {
    methods: {
      getCheckedNodes() {
        console.log(this.$refs.tree.getCheckedNodes(true));
      },

      loadNode(node, resolve) {
        var hasChild = Math.random() > 0.5;
        if (node.level > 4) return resolve([]);

        setTimeout(function() {
          var data;
          if (hasChild) {
            data = [{
              name: 'zone' + count++
            }, {
              name: 'zone' + count++
            }];
          } else {
            data = [];
          }

          resolve(data);
        }, 500);
      }
    },

    data() {
      return {
        data,
        regions,
        defaultProps,
        props
      };
    }
  };
</script>
