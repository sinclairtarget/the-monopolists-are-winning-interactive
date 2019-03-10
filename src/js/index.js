import * as d3 from "d3";
require('waypoints');
import Dimensions from "./dimensions.js";
import Scatter from "./scatter.js";
import Dataset from "./dataset.js";
import { StoryNode, DrawSectorsNode } from "./storynode.js";
import "../scss/main.scss";

const storyNodes = {
  "initial": new StoryNode("initial"),
  "draw-sectors": new DrawSectorsNode("draw-sectors", null, 2002),
  "most-concentrated-sector": new StoryNode("most-concentrated-sector"),
  "2002-to-2007": new DrawSectorsNode("2002-to-2007", 2002, 2007),
  "2007-to-2012": new DrawSectorsNode("2007-to-2012", 2007, 2012)
};

const width = 680;
const height = 580;

const margin = {
  top: 12,
  right: 12,
  bottom: 12,
  left: 12
};

const padding = {
  top: 0,
  right: 0,
  bottom: 40,
  left: 50
};

const app = window.app = {
  dimensions: new Dimensions(width, height, margin, padding),
  nodes: []   // story node stack
};

app.start = function() {
  this.scatter = new Scatter(this.dimensions);
  this.scatter.setUp();

  d3.json("static/data.json")
    .catch(err => console.error("Error fetching JSON data: " + err))
    .then((data) => {
      this.dataset = new Dataset(data);
      this.pushStoryNode(storyNodes["initial"]);

      // Register waypoints
      let waypointElements = Array.from(document.querySelectorAll(".waypoint"));
      this.waypoints = waypointElements.map(el => new Waypoint({
        element: el,
        offset: '75%',
        handler: function(dir) {
          app.handleWaypoint(this.element.dataset.node, dir);
        }
      }));
    });
};

app.handleWaypoint = function(nodeName, dir) {
  let node = storyNodes[nodeName];
  if (dir == "down") {
    app.pushStoryNode(node);
  }
  else {
    app.popStoryNode();
  }
};

app.pushStoryNode = function(storyNode) {
  storyNode.push(app.dataset, app.scatter);
  app.nodes.push(storyNode);
};

app.popStoryNode = function() {
  let node = app.nodes.pop();
  if (node) {
    node.pop(app.dataset, app.scatter);
  }
};

app.start();
