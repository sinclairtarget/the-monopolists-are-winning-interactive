import * as d3 from "d3";
import { k } from "./util.js";

export class StoryNode {
  constructor(nodeName) {
    this.nodeName = nodeName;
  }

  push(dataset, scatter) {
    console.log(`Pushing ${this.nodeName}.`);
  }

  pop(dataset, scatter) {
    console.log(`Popping ${this.nodeName}.`);
  }
}

export class DrawSectorsNode extends StoryNode {
  constructor(name, fromYear, toYear) {
    super(name);
    this.fromYear = fromYear;
    this.toYear = toYear;
  }

  push(dataset, scatter) {
    super.push(dataset, scatter);

    let data = dataset.sectors();

    let circles = scatter.plot.selectAll("circle")
                              .data(data);

    let newCircles = circles.enter()
           .append("circle")
           .attr("r", 0)
           .attr("cx", d => scatter.xScale(k(d, "MEAN_VAL_PCT", 2002)))
           .attr("cy", d => scatter.yScale(k(d, "MEAN_VAL_PCT", this.toYear)));

    this.transition(data,
                    scatter,
                    this.toYear,
                    circles.merge(newCircles));
  }

  pop(dataset, scatter) {
    super.pop(dataset, scatter);

    let data = dataset.sectors();
    let circles = scatter.plot.selectAll("circle")
                              .data(data);

    if (this.fromYear) {
      this.transition(data,
                      scatter,
                      this.fromYear,
                      circles);
    }
    else {
      scatter.plot.selectAll("circle")
                  .transition()
                  .duration(500)
                  .attr("r", 0);
    }
  }

  transition(data, scatter, to, circles) {
    let rScale = d3.scaleSqrt()
                   .domain([0, d3.max(data, d => d["RCPTOT_ALL_FIRMS.2012"])])
                   .range([4, 24]);

    circles.transition()
           .duration(500)
           .attr("cx", d => scatter.xScale(k(d, "MEAN_VAL_PCT", 2002)))
           .attr("cy", d => scatter.yScale(k(d, "MEAN_VAL_PCT", to)))
           .attr("r", d => rScale(k(d, "RCPTOT_ALL_FIRMS", to)));
  }
}
