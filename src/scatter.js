import * as d3 from "d3";
import Dimensions from "./dimensions.js";
import * as util from "./util.js";

export default class Scatter {
  constructor(dimensions) {
    this.dim = dimensions;
  }

  setUp() {
    let panelWidth = this.dim.panelWidth();
    let panelHeight = this.dim.panelHeight();
    let plotWidth = this.dim.plotWidth();
    let plotHeight = this.dim.plotHeight();

    this.panel = d3.select(".container")
                   .insert("svg", ".instructions")
                   .attr("width", this.dim.width)
                   .attr("height", this.dim.height)
                   .append("g")
                   .attr("transform", util.transl(this.dim.margin.left,
                                                  this.dim.margin.top))
                   .attr("class", "panel");

    this.plot = d3.select(".panel")
                  .append("g")
                  .attr("transform", util.transl(this.dim.padding.left,
                                                 this.dim.padding.top))
                  .attr("class", "plot");

    this.xScale = d3.scaleLinear()
                    .domain([0, 100])
                    .range([0, plotWidth]);

    this.yScale = d3.scaleLinear()
                    .domain([0, 100])
                    .range([plotHeight, 0]);

    let xAxis = d3.axisBottom(this.xScale);
    let xGrid = d3.axisBottom(this.xScale)
                  .tickSize(-plotHeight, 0, 0)
                  .tickFormat("");

    let yAxis = d3.axisLeft(this.yScale);
    let yGrid = d3.axisLeft(this.yScale)
                  .tickSize(-plotWidth, 0, 0)
                  .tickFormat("");

    this.plot.append("g")
              .attr("transform", util.transl(0, plotHeight))
             .attr("class", "grid")
             .call(xGrid);

    this.plot.append("g")
             .attr("class", "grid")
             .call(yGrid);

    this.panel.append("g")
              .attr("transform", util.transl(this.dim.padding.left,
                                             this.dim.padding.top + plotHeight))
              .attr("class", "axis")
              .call(xAxis);

    this.panel.append("g")
              .attr("transform", util.transl(this.dim.padding.left,
                                             this.dim.padding.top))
              .attr("class", "axis")
              .call(yAxis);

    this.panel.append("text")
              .attr("x", panelWidth / 2)
              .attr("y", panelHeight)
              .attr("text-anchor", "middle")
              .attr("class", "axis-title")
              .text("Industry Revenue Captured by Top Four Firms (1997)");

    this.panel.append("text")
              .attr("x", 12)
              .attr("y", panelHeight / 2)
              .attr("text-anchor", "middle")
              .attr("class", "axis-title y-axis-title")
              .text("Industry Revenue Captured by Top Four Firms (1997)")
              .attr("transform", util.rot(-90, 12, panelHeight / 2));

//    this.panel.append("circle")
//              .attr("r", 3)
//              .attr("cy", panelHeight);
  }

  update(data, year) {
    let circles = this.plot.selectAll("circle")
                           .data(data);

    circles.enter()
           .append("circle")
           .attr("r", 4)
           .attr("cx", d => this.xScale(d.BASE_VAL_PCT))
           .attr("cy", d => this.yScale(d.VAL_PCT));

    circles.transition()
           .duration(500)
           .attr("cx", d => this.xScale(d.BASE_VAL_PCT))
           .attr("cy", d => this.yScale(d.VAL_PCT));

    this.panel
        .selectAll(".y-axis-title")
        .text(`Industry Revenue Captured by Top Four Firms (${year})`);
  }
}
