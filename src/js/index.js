import * as d3 from "d3";
import Dimensions from "./dimensions.js";
import Scatter from "./scatter.js";
import "../scss/main.scss";

const years = ["1997", "2002", "2007", "2012"];

const width = 900;
const height = 600;

const margin = {
  top: 12,
  right: 12,
  bottom: 12,
  left: 12
};

const padding = {
  top: 30,
  right: 20,
  bottom: 40,
  left: 50
};

const app = window.app = {
  dimensions: new Dimensions(width, height, margin, padding),
  yearIndex: 0
};

app.start = function() {
  this.scatter = new Scatter(this.dimensions);
  this.scatter.setUp();

  d3.json("static/data.json")
    .catch(err => console.error("Error fetching JSON data: " + err))
    .then((data) => {
      this.data = data;
      let year = years[this.yearIndex];
      this.scatter.update(subset(data, year), year);

      // Register listeners
      document.addEventListener('keyup', ev => {
        this.update(ev.key);
      });
    });
};

app.update = function(key) {
  if (key == "j" || key == "ArrowDown") {
    this.yearIndex = (this.yearIndex + 1) % years.length;
    let year = years[this.yearIndex];
    this.scatter.update(subset(this.data, year), year);
  }
  else if (key == "k" || key == "ArrowUp") {
    this.yearIndex = this.yearIndex - 1;
    if (this.yearIndex < 0) {
      this.yearIndex = years.length - 1;
    }

    let year = years[this.yearIndex];
    this.scatter.update(subset(this.data, year), year);
  }
};

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

app.start();
