import * as d3 from "d3";
import * as d3Annotations from "d3-svg-annotation";
import Dimensions from "./dimensions.js";
import * as util from "./util.js";

export default class Scatter {
  constructor(dimensions) {
    this.dim = dimensions;
  }

  setUp() {
    // Create plot and grid lines
    let panelWidth = this.dim.panelWidth();
    let panelHeight = this.dim.panelHeight();
    let plotWidth = this.dim.plotWidth();
    let plotHeight = this.dim.plotHeight();

    this.panel = d3.select(".graph-container")
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

    this.plot.append("line")
             .attr("x1", 0)
             .attr("y1", plotHeight)
             .attr("x2", plotWidth)
             .attr("y2", 0)
             .attr("class", "dashed-line");

    // Create annotations
    let makeAnnotations = d3Annotations.annotation()
      .type(d3Annotations.annotationLabel)
      .annotations([{
        note: {
          label: "Became More Concentrated",
          bgPadding: 4,
          align: "left"
        },
        x: this.xScale(3),
        y: this.yScale(94)
      },
      {
        note: {
          label: "Became Less Concentrated",
          bgPadding: 4,
          align: "right"
        },
        x: this.xScale(97),
        y: this.yScale(13)
      }]);

    this.plot.append("g")
             .attr("class", "annotation-group")
             .call(makeAnnotations);

    // Create axes
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

    this.xTitle =
      this.panel.append("text")
                .attr("x", panelWidth / 2)
                .attr("y", panelHeight)
                .attr("text-anchor", "middle")
                .attr("class", "axis-title")
                .text("Revenue Captured by Top Four Firms (2002)");

    this.yTitle =
      this.panel.append("text")
                .attr("x", 12)
                .attr("y", plotHeight / 2)
                .attr("text-anchor", "middle")
                .attr("class", "axis-title y-axis-title")
                .text("Revenue Captured by Top Four Firms (2002)")
                .attr("transform", util.rot(-90, 12, plotHeight / 2));

    this.year = 2002;

    this.title = "Concentration of NAICS Sectors";
    this.panelTitle =
      this.panel.append("text")
                .attr("x", panelWidth / 2)
                .attr("y", 6)
                .attr("text-anchor", "middle")
                .attr("class", "panel-title")
                .text(this.title);

//    this.panel.append("circle")
//              .attr("r", 3)
//              .attr("cy", panelHeight);
  }

  onCircleMouseOver(listener) {
    this.plot.on("mouseover", () => {
      let el = d3.event.target;
      if (el.nodeName == "circle") {
        let d = d3.select(el).datum();
        listener(el, d);
      }
    });
  }

  onCircleMouseOut(listener) {
    this.plot.on("mouseout", () => {
      let el = d3.event.target;
      if (el.nodeName == "circle") {
        let d = d3.select(el).datum();
        listener(el, d);
      }
    });
  };

  updateYAxis(year) {
    if (year != this.year) {
      this.year = year;
      let newText = `Revenue Captured by Top Four Firms (${year})`;
      this.fadeReplaceText(this.yTitle, newText);
    }
  }

  updatePanelTitle(title) {
    if (title != this.title) {
      this.title = title;
      this.fadeReplaceText(this.panelTitle, this.title);
    }
  }

  drawSectors(sectorsData, year) {
    let rScale = this.makeRScale(sectorsData);

    let circles = this.plot.selectAll("circle.sector")
                           .data(sectorsData);

    let newCircles = circles.enter()
           .append("circle")
           .attr("class", d => "sector sector-" + d["SECTOR.id"])
           .attr("r", 0)
           .attr("cx", d => this.xScale(util.k(d, "MEAN_VAL_PCT", 2002)))
           .attr("cy", d => this.yScale(util.k(d, "MEAN_VAL_PCT", year)));

    circles.merge(newCircles)
           .transition()
           .duration(500)
           .attr("cx", d => this.xScale(util.k(d, "MEAN_VAL_PCT", 2002)))
           .attr("cy", d => this.yScale(util.k(d, "MEAN_VAL_PCT", year)))
           .attr("r", d => rScale(util.k(d, "RCPTOT_ALL_FIRMS", year)));
  }

  hideSectors() {
    this.plot.selectAll("circle.sector")
             .transition()
             .duration(500)
             .attr("r", 0);
  }

  drawSectorTooltip(sectorId, year, duration = 500) {
    let circle = d3.select("circle.sector.sector-" + sectorId);
    let data = circle.datum();

    let makeAnnotations = d3Annotations.annotation()
      .type(d3Annotations.annotationCallout)
      .annotations([{
        note: {
          title: data["SECTOR.label"],
          label: this.sectorLabel(data, year),
          bgPadding: 4,
          padding: 4
        },
        x: this.xScale(util.k(data, "MEAN_VAL_PCT", 2002)),
        y: this.yScale(util.k(data, "MEAN_VAL_PCT", year)),
        dx: 25,
        dy: 25
      }]);

    this.plot.append("g")
             .attr("class", "annotation-group tooltip-annotation-group")
             .call(makeAnnotations)
             .style("opacity", 0)
             .transition()
             .duration(duration)
             .style("opacity", 1);
  }

  focusSector(sectorId) {
    this.plot.selectAll("circle")
             .classed("fade", true);

    this.plot.selectAll("circle.sector-" + sectorId)
             .classed("fade", false);
  }

  unfocusAllSectors() {
    this.plot.selectAll("circle")
             .classed("fade", false);
  }

  drawIndustries(sectorsData, industriesData, year) {
    let rScale = this.makeRScale(sectorsData);
    let circles = this.plot.selectAll("circle.industry")
                           .data(industriesData);

    let newCircles = circles.enter()
           .append("circle")
           .attr("class", d => {
             return `industry sector-${d["SECTOR.id"]} ` +
               `industry-${d["NAICS.id"]}`;
           })
           .attr("r", 0)
           .attr("cx", d => this.xScale(util.k(d, "VAL_PCT", 2002)))
           .attr("cy", d => this.yScale(util.k(d, "VAL_PCT", year)));

    circles.merge(newCircles)
           .transition()
           .duration(500)
           .attr("cx", d => this.xScale(util.k(d, "VAL_PCT", 2002)))
           .attr("cy", d => this.yScale(util.k(d, "VAL_PCT", year)))
           .attr("r", d => rScale(util.k(d, "RCPTOT_ALL_FIRMS", year)));
  }

  hideIndustries() {
    this.plot.selectAll("circle.industry")
             .transition()
             .duration(500)
             .attr("r", 0);
  }

  drawIndustryTooltip(naicsId, year, duration = 500) {
    let circle = d3.select("circle.industry-" + naicsId);
    let data = circle.datum();

    let makeAnnotations = d3Annotations.annotation()
      .type(d3Annotations.annotationCallout)
      .annotations([{
        note: {
          title: data["NAICS.label"],
          label: this.industryLabel(data, year),
          bgPadding: 4,
          padding: 4
        },
        x: this.xScale(util.k(data, "VAL_PCT", 2002)),
        y: this.yScale(util.k(data, "VAL_PCT", year)),
        dx: 25,
        dy: 25
      }]);

    this.plot.append("g")
             .attr("class", "annotation-group tooltip-annotation-group")
             .call(makeAnnotations)
             .style("opacity", 0)
             .transition()
             .duration(duration)
             .style("opacity", 1);
  }

  hideTooltips(duration = 250) {
    this.plot.selectAll(".tooltip-annotation-group")
             .transition()
             .duration(duration)
             .style("opacity", 0)
             .transition()
             .remove();
  }

  fadeReplaceText(sel, newText) {
    sel.transition()
       .duration(180)
       .style("opacity", 0)
       .transition()
       .text(newText)
       .transition()
       .duration(180)
       .style("opacity", 1);
  }

  sectorLabel(data, year) {
    let size = util.k(data, "RCPTOT_ALL_FIRMS", year) * 1000 / 1000000000;
    size = Math.round(size * 10) / 10;
    let concentration = Math.round(util.k(data, "MEAN_VAL_PCT", year));

    return `Revenue: $${size} bn\nConcentration: ${concentration}%\nYear: ${year}`;
  }

  industryLabel(data, year) {
    let sector = data["SECTOR.label"];
    let size = util.k(data, "RCPTOT_ALL_FIRMS", year) * 1000 / 1000000000;
    size = Math.round(size * 10) / 10;
    let concentration = Math.round(util.k(data, "VAL_PCT", year));

    return `Sector: ${sector}\nRevenue: $${size} bn\n` +
      `Concentration: ${concentration}%\nYear: ${year}`;
  }

  makeRScale(sectorsData) {
    return d3.scaleSqrt()
             .domain([0, d3.max(sectorsData, d => d["RCPTOT_ALL_FIRMS.2012"])])
             .range([4, 24]);

  }
}
