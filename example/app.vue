<template>
  <div style="height: 400px;">
    <tree :data="data" :level-config="defaultLevelConfig" :lazy-render="false"></tree>
    <div style="height: 100px;"></div>
    <tree :data="regions" :level-config="levelConfig" :load="loadNode" lazy></tree>
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
      label: 'b1',
      checked: true
    }]
  }, {
    label: 'cc',
    children: [{
      label: 'cc1',
      checked: true
    }, {
      label: 'cc2',
      checked: false
    }]
  }];

  var regions = [{
    'name': 'region1'
  }, {
    'name': 'region2'
  }];

  var count = 1;

  var levelConfig = {
    childrenProperty: 'zones',
    leafIcon: 'leaf',
    icon: 'folder',
    children: {
      recursive: true,
      lazy: true,
      leafIcon: 'leaf',
      icon: 'folder',
      load: function(node, callback) {
        var hasChild = Math.random() > 0.5;
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

          node.children = data;
          if (callback) {
            callback();
          }
        }, 500);
      }
    }
  };

  var defaultLevelConfig = {
    childrenProperty: 'children',
    labelProperty: 'label',
    checkedProperty: 'checked',
    recursive: true
  };

  export default {
    methods: {
      getCheckedNodes() {
        console.log(this.$refs.tree.getCheckedNodes(true));
      },

      loadNode(node, resolve) {
        var hasChild = Math.random() > 0.3;
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
        defaultLevelConfig,
        levelConfig
      };
    }
  };
</script>
