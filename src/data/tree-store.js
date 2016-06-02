import Node from './node';
import { ROOT_NODE_ID } from './constants';
let storeIdSeed = 1;

export default class TreeStore {
  constructor() {
    this._id = storeIdSeed++;
    this._isTree = true;
    this._root = new Node(ROOT_NODE_ID);
  }
};