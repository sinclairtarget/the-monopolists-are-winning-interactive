import * as d3 from "d3";
import * as d3Annotations from "d3-svg-annotation";
import Dimensions from "./dimensions.js";
import * as util from "./util.js";

export default class Scatter {
  constructor(dimensions) {
    this.dim = dimensions;
  }

  setUp(dataset) {
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
                .attr("x", this.dim.padding.left + plotWidth / 2)
                .attr("y", plotHeight + this.dim.padding.top +
                           this.dim.margin.top + 30)
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

    // create clickable legend below plot
    this.drawColorLegend(dataset, this.dim.padding.left, panelHeight - 112,
                         panelWidth - this.dim.padding.left, 112);

    // Create plot
    this.plot = d3.select(".panel")
                  .append("g")
                  .attr("transform", util.transl(this.dim.padding.left,
                                                 this.dim.padding.top))
                  .attr("class", "plot");

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
          align: "middle"
        },
        x: this.xScale(10),
        y: this.yScale(94)
      },
      {
        note: {
          label: "Became Less Concentrated",
          bgPadding: 4,
          align: "middle"
        },
        x: this.xScale(90),
        y: this.yScale(13)
      }]);

    this.plot.append("g")
             .attr("class", "annotation-group")
             .call(makeAnnotations);

    // create circle area legend
    this.drawSizeLegend(dataset, this.xScale(81.6), plotHeight - 210, 4, 36);

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

  onLegendBoxMouseOver(listener) {
    this.legend.on("mouseover", () => {
      let el = d3.event.target;
      if (el.nodeName == "rect") {
        let d = d3.select(el).datum();
        listener(el, d);
      }
    });
  }

  onLegendBoxMouseOut(listener) {
    this.legend.on("mouseout", () => {
      let el = d3.event.target;
      if (el.nodeName == "rect") {
        let d = d3.select(el).datum();
        listener(el, d);
      }
    });
  }

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

  drawSizeLegend(dataset, x, y, minR, maxR) {
    let sectorsData = dataset.sectors();
    let industriesData = dataset.industries();
    let min = d3.min(industriesData, d => d["RCPTOT_ALL_FIRMS.2002"]);
    let max = d3.max(sectorsData, d => d["RCPTOT_ALL_FIRMS.2012"]);
    this.rScale = d3.scaleSqrt()
                    .domain([min, max])
                    .range([minR, maxR]);

    let legend = this.plot
                     .append("g")
                     .attr("transform", util.transl(x, y))
                     .attr("class", "size-legend");

    let width = 100;
    let height = 130;
    legend.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", width)
          .attr("height", height)
          .attr("class", "legend-bg");

    for (let i = 0; i < 4; i++) {
      let r = maxR - (i * maxR / 4);
      legend.append("circle")
            .attr("class", "legend")
            .attr("cx", width / 2)
            .attr("cy", height - 25 - r + (3 - i) * 2)
            .attr("r", maxR - (i * maxR / 4));
    }

    legend.append("text")
          .attr("x", width - 23)
          .attr("y", height - 5)
          .attr("text-anchor", "middle")
          .attr("class", "legend-text")
          .text(util.dollars(min));

    legend.append("text")
          .attr("x", width / 2)
          .attr("y", 35)
          .attr("text-anchor", "middle")
          .attr("class", "legend-text")
          .text(util.dollars(max));

    legend.append("text")
          .attr("x", width / 2)
          .attr("y", 16)
          .attr("text-anchor", "middle")
          .attr("font-weight", "bold")
          .attr("class", "legend-text")
          .text("Total Revenue");

    legend.append("line")
          .attr("x1", width / 2)
          .attr("y1", height - 33)
          .attr("x2", width - 26)
          .attr("y2", height - 17)
          .attr("class", "legend-line");
  }

  drawColorLegend(dataset, x, y, width, height) {
    let sectorsData = util.alphabetize(dataset.sectors());
    let numRows = 4;
    let numCols = 3;
    let colPadding = 10;
    let rowPadding = 6;

    let boxWidth = (width - (numCols - 1) * colPadding)  / numCols;
    let boxHeight = (height - (numRows - 1) * rowPadding) / numRows;

    this.legend = this.panel
                      .append("g")
                      .attr("transform", util.transl(x, y))
                      .attr("class", "color-legend");

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        let x = col * (boxWidth + colPadding);
        let y = row * (boxHeight + rowPadding);
        let sector = sectorsData[row + (col * numRows)];
        let sectorId = sector["SECTOR.id"];
        let name = util.shortName(sectorId);

        let box = this.legend.append("g")
                             .attr("transform", util.transl(x, y))
                             .attr("class", "legend-box sector-" + sectorId)
                             .datum(sector);

        box.append("rect")
           .attr("width", boxWidth)
           .attr("height", boxHeight)
           .attr("rx", 5)
           .attr("ry", 5);

        box.append("circle")
           .attr("cx", boxWidth * 0.05)
           .attr("cy", boxHeight / 2)
           .attr("r", boxHeight / 4)
           .attr("class", "sector-" + sectorId);

        box.append("text")
           .attr("x", boxWidth * 0.12)
           .attr("y", boxHeight / 2 + 5)
           .attr("class", "legend-text")
           .text(name);
      }
    }
  }

  drawSectors(sectorsData, year) {
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
           .delay((d, i) => i * 20)
           .attr("cx", d => this.xScale(util.k(d, "MEAN_VAL_PCT", 2002)))
           .attr("cy", d => this.yScale(util.k(d, "MEAN_VAL_PCT", year)))
           .attr("r", d => this.rScale(util.k(d, "RCPTOT_ALL_FIRMS", year)));
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

    this.legend.selectAll("g.legend-box")
               .classed("fade", true);

    this.legend.selectAll("g.legend-box.sector-" + sectorId)
               .classed("fade", false);
  }

  focusIndustryWhere(predicate) {
    this.plot.selectAll("circle.industry")
             .classed("fade", d => !predicate(d));
  }

  unfocusAll() {
    this.plot.selectAll("circle")
             .classed("fade", false);

    this.legend.selectAll("g.legend-box")
               .classed("fade", false);
  }

  drawIndustries(sectorsData, industriesData, year) {
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
           .delay((d, i) => i / 2)
           .attr("cx", d => this.xScale(util.k(d, "VAL_PCT", 2002)))
           .attr("cy", d => this.yScale(util.k(d, "VAL_PCT", year)))
           .attr("r", d => this.rScale(util.k(d, "RCPTOT_ALL_FIRMS", year)));
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
    let name = util.customWrap(data["NAICS.label"], 20);

    // d3 annotation overrides the wrapping for some reason on this one
    if (naicsId == 524292) {
      name = "Third party\nadministration\nof insurance and\npension\nfunds";
    }

    let dx = 25;
    let dy = 25;
    if (util.k(data, "VAL_PCT", 2002) > 50) {
      dx = -25; // Draw tooltip to left for dots on right side of plot
    }

    let makeAnnotations = d3Annotations.annotation()
      .type(d3Annotations.annotationCallout)
      .annotations([{
        note: {
          title: name,
          label: this.industryLabel(data, year),
          bgPadding: 4,
          padding: 4,
          wrapSplitter: /\n/
        },
        x: this.xScale(util.k(data, "VAL_PCT", 2002)),
        y: this.yScale(util.k(data, "VAL_PCT", year)),
        dx: dx,
        dy: dy
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
    let size = util.dollars(util.k(data, "RCPTOT_ALL_FIRMS", year));
    let concentration = Math.round(util.k(data, "MEAN_VAL_PCT", year));

    return `Revenue: ${size}\nConcentration: ${concentration}%\nYear: ${year}`;
  }

  industryLabel(data, year) {
    let sector = util.shortName(data["SECTOR.id"]);
    let size = util.dollars(util.k(data, "RCPTOT_ALL_FIRMS", year));
    let concentration = Math.round(util.k(data, "VAL_PCT", year));

    return `Sector: ${sector}\nRevenue: ${size}\n` +
      `Concentration: ${concentration}%\nYear: ${year}`;
  }

  makeRScale(sectorsData, min, max) {
    return d3.scaleSqrt()
             .domain([0, d3.max(sectorsData, d => d["RCPTOT_ALL_FIRMS.2012"])])
             .range([min, max]);

  }
}
