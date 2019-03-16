import * as d3 from "d3";
import * as util from "./util.js";
import "waypoints";
import Dimensions from "./dimensions.js";
import Scatter from "./scatter.js";
import Dataset from "./dataset.js";
import { StoryNode,
         DrawSectorsNode,
         InitialDrawSectorsNode,
         HighlightSectorNode,
         DrawIndustriesNode,
         HighlightIndustryNode,
         HighlightConcentratedNode } from "./storynode.js";
import "../scss/main.scss";

const storyNodes = {
  "initial": new StoryNode("initial"),
  "2002-sectors": new InitialDrawSectorsNode("2002-sectors", 2002),
  "most-concentrated-sector":
    new HighlightSectorNode("most-concentrated-sector", 2002, 22),
  "concentrated-sector-info":
    new HighlightSectorNode("concentrated-sector-info", 2002, 51),
  "2007-sectors": new DrawSectorsNode("2007-sectors", 2007),
  "2012-sectors": new DrawSectorsNode("2012-sectors", 2012),
  "2002-industries": new DrawIndustriesNode("2002-industries", 2002),
  "2007-industries": new DrawIndustriesNode("2007-industries", 2007),
  "2012-industries": new DrawIndustriesNode("2012-industries", 2012),
  "highlight-pensions":
    new HighlightIndustryNode("highlight-pensions", 2012, 52, 524292),
  "highlight-concentrated":
    new HighlightConcentratedNode("highlight-concentrated", 2012)
};

const width = 680;
const height = 700;

const margin = {
  top: 12,
  right: 12,
  bottom: 12,
  left: 12
};

const padding = {
  top: 20,
  right: 0,
  bottom: 180,
  left: 50
};

const app = window.app = {
  dimensions: new Dimensions(width, height, margin, padding),
  nodes: []   // story node stack
};

app.start = function() {
  this.scatter = new Scatter(this.dimensions);

  d3.json("static/data.json")
    .catch(err => console.error("Error fetching JSON data: " + err))
    .then((data) => {
      this.dataset = new Dataset(data);
      this.scatter.setUp(this.dataset);
      this.pushStoryNode(storyNodes["initial"]);
      this.registerEventListeners();

      // Register waypoint handlers
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

app.registerEventListeners = function() {
  this.scatter.onCircleMouseOver((circle, d) => {
    this.currentNode().onCircleMouseOver(this.scatter, circle, d);
  });

  this.scatter.onCircleMouseOut((circle, d) => {
    this.currentNode().onCircleMouseOut(this.scatter, circle, d);
  });

  this.scatter.onLegendBoxMouseOver((rect, d) => {
    this.currentNode().onLegendBoxMouseOver(this.scatter, rect, d);
  });

  this.scatter.onLegendBoxMouseOut((rect, d) => {
    this.currentNode().onLegendBoxMouseOut(this.scatter, rect, d);
  });
};

app.pushStoryNode = function(storyNode) {
  if (app.currentNode()) {
    app.currentNode().exit(app.dataset, app.scatter, "down");
  }

  app.nodes.push(storyNode);
  storyNode.enter(app.dataset, app.scatter, "down");
};

app.popStoryNode = function() {
  let node = app.nodes.pop();
  if (node) {
    node.exit(app.dataset, app.scatter, "up");
  }

  if (app.currentNode()) {
    app.currentNode().enter(app.dataset, app.scatter, "up");
  }
};

app.currentNode = function() {
  if (app.nodes.length > 0) {
    return app.nodes[app.nodes.length - 1];
  }

  return null;
};

app.start();

window.wrap = util.customWrap;
