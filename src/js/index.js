import * as d3 from "d3";
require('waypoints');
import Dimensions from "./dimensions.js";
import Scatter from "./scatter.js";
import StoryNode from "./storynode.js";
import "../scss/main.scss";

function subset(data, year) {
  let key = "VAL_PCT." + year;
  return data.map(d => ({
    "NAICS.id": d["NAICS.id"],
    "NAICS.label": d["NAICS.label"],
    "SECTOR.label": d["SECTOR.label"],
    "BASE_VAL_PCT": d["VAL_PCT.1997"],
    "VAL_PCT": d[key]
  }));
}

const storyNodes = {
  "initial": new StoryNode("initial"),
  "draw-sectors": new StoryNode("draw-sectors"),
  "most-concentrated-sector": new StoryNode("most-concentrated-sector"),
  "2002-to-2007": new StoryNode("2002-to-2007"),
  "2007-to-2012": new StoryNode("2007-to-2012")
};

const width = 680;
const height = 520;

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
  dimensions: new Dimensions(width, height, margin, padding)
};

app.start = function() {
  this.scatter = new Scatter(this.dimensions);
  this.scatter.setUp();

  d3.json("static/data.json")
    .catch(err => console.error("Error fetching JSON data: " + err))
    .then((data) => {
      this.data = data;
      this.setStoryNode(storyNodes["initial"]);

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
  app.setStoryNode(storyNodes[nodeName]);
};

app.setStoryNode = function(storyNode) {
  if (app.storyNode) {
    app.storyNode.exit(app.data, app.scatter);
  }

  app.storyNode = storyNode;
  app.storyNode.enter(app.data, app.scatter);
};

app.start();
