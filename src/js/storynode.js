export default class StoryNode {
  constructor(nodeName) {
    this.nodeName = nodeName;
  }

  enter(data, scatter) {
    console.log(`Entering ${this.nodeName}.`);
  }

  exit(data, scatter) {
    console.log(`Exiting ${this.nodeName}.`);
  }
}
