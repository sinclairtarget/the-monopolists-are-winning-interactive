import * as d3 from "d3";

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
  constructor(name) {
    super(name);
  }

  push(dataset, scatter) {
    super.push(dataset, scatter);

    let data = dataset.sectors();

    let rScale = d3.scaleSqrt()
                   .domain([0, d3.max(data, d => d["RCPTOT_ALL_FIRMS.2012"])])
                   .range([4, 24]);

    let circles = scatter.plot.selectAll("circle")
                              .data(data);

    let newCircles = circles.enter()
           .append("circle")
           .attr("cx", d => scatter.xScale(d["MEAN_VAL_PCT.2002"]))
           .attr("cy", d => scatter.yScale(d["MEAN_VAL_PCT.2002"]));

    circles.merge(newCircles)
           .attr("r", 0)
           .transition()
           .duration(500)
           .attr("r", d => rScale(d["RCPTOT_ALL_FIRMS.2002"]));
  }

  pop(dataset, scatter) {
    super.pop(dataset, scatter);

    scatter.plot.selectAll("circle")
                .transition()
                .duration(500)
                .attr("r", 0);
  }
}
