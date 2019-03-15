export class StoryNode {
  constructor(nodeName) {
    this.nodeName = nodeName;
  }

  enter(dataset, scatter, dir) {
//    console.log(`Enter ${this.nodeName} going ${dir}.`);
  }

  exit(dataset, scatter, dir) {
//    console.log(`Exiting ${this.nodeName} going ${dir}.`);
  }

  onCircleMouseOver(scatter, circle, datum) {
    // do nothing
  }

  onCircleMouseOut(scatter, circle, datum) {
    // do nothing
  }

  onLegendBoxMouseOver(scatter, rect, datum) {
    // do nothing
  }

  onLegendBoxMouseOut(scatter, rect, datum) {
    // do nothing
  }
}

export class DrawSectorsNode extends StoryNode {
  constructor(name, year) {
    super(name);
    this.year = year;
  }

  enter(dataset, scatter, dir) {
    super.enter(dataset, scatter, dir);

    let data = dataset.sectors();

    if (dir == "down") {
      scatter.hideTooltips();
    }
    else {
      scatter.hideIndustries(); // all sector nodes before industry nodes
    }

    scatter.updatePanelTitle("Concentration of NAICS Sectors");
    scatter.drawSectors(data, this.year);
    scatter.updateYAxis(this.year);
  }

  onCircleMouseOver(scatter, circle, datum) {
    let sectorId = datum["SECTOR.id"];
    scatter.unfocusAllSectors();
    scatter.focusSector(sectorId);
    scatter.drawSectorTooltip(sectorId, this.year, 0);
  }

  onCircleMouseOut(scatter, circle, datum) {
    scatter.unfocusAllSectors();
    scatter.hideTooltips(0);
  }

  onLegendBoxMouseOver(scatter, rect, datum) {
    let sectorId = datum["SECTOR.id"];
    scatter.unfocusAllSectors();
    scatter.focusSector(sectorId);
    scatter.hideTooltips(0);
  }

  onLegendBoxMouseOut(scatter, rect, datum) {
    scatter.unfocusAllSectors();
  }
}

export class InitialDrawSectorsNode extends DrawSectorsNode {
  constructor(name, year) {
    super(name, year);
  }

  exit(dataset, scatter, dir) {
    super.exit(dataset, scatter, dir);

    if (dir == "up") {
      scatter.hideSectors();
    }
  }
}

export class HighlightSectorNode extends DrawSectorsNode {
  constructor(name, year, sectorId) {
    super(name, year);
    this.sectorId = sectorId;
  }

  enter(dataset, scatter, dir) {
    super.enter(dataset, scatter, dir);
    scatter.focusSector(this.sectorId);
    scatter.hideTooltips(0);
    scatter.drawSectorTooltip(this.sectorId, this.year);
  }

  exit(dataset, scatter, dir) {
    super.exit(dataset, scatter, dir);
    scatter.hideTooltips();
    scatter.unfocusAllSectors();
  }

  onCircleMouseOver(scatter, circle, datum) {
    // override and do nothing
  }

  onCircleMouseOut(scatter, circle, datum) {
    // override and do nothing
  }

  onLegendBoxMouseOver(scatter, rect, datum) {
    // override and do nothing
  }

  onLegendBoxMouseOut(scatter, rect, datum) {
    // override and do nothing
  }
}

export class DrawIndustriesNode extends StoryNode {
  constructor(name, year) {
    super(name);
    this.year = year;
  }

  enter(dataset, scatter, dir) {
    super.enter(dataset, scatter, dir);
    scatter.updatePanelTitle("Concentration of NAICS Industries");
    scatter.updateYAxis(this.year);
    scatter.hideSectors();

    let sectorsData = dataset.sectors();
    let industriesData = dataset.industries();
    scatter.drawIndustries(sectorsData, industriesData, this.year);
  }

  onCircleMouseOver(scatter, circle, datum) {
    let sectorId = datum["SECTOR.id"];
    let naicsId = datum["NAICS.id"];

    scatter.unfocusAllSectors();
    scatter.focusSector(sectorId);
    scatter.drawIndustryTooltip(naicsId, this.year, 0);
  }

  onCircleMouseOut(scatter, circle, datum) {
    scatter.unfocusAllSectors();
    scatter.hideTooltips(0);
  }

  onLegendBoxMouseOver(scatter, rect, datum) {
    let sectorId = datum["SECTOR.id"];
    scatter.unfocusAllSectors();
    scatter.focusSector(sectorId);
    scatter.hideTooltips(0);
  }

  onLegendBoxMouseOut(scatter, rect, datum) {
    scatter.unfocusAllSectors();
  }
}

export class HighlightIndustryNode extends DrawIndustriesNode {
  constructor(name, year, sectorId, naicsId) {
    super(name, year);
    this.sectorId = sectorId;
    this.naicsId = naicsId;
  }

  enter(dataset, scatter, dir) {
    super.enter(dataset, scatter, dir);
    scatter.focusSector(this.sectorId);
    scatter.hideTooltips(0);
    scatter.drawIndustryTooltip(this.naicsId, this.year);
  }

  exit(dataset, scatter, dir) {
    super.exit(dataset, scatter, dir);
    scatter.hideTooltips();
    scatter.unfocusAllSectors();
  }

  onCircleMouseOver(scatter, circle, datum) {
    // override and do nothing
  }

  onCircleMouseOut(scatter, circle, datum) {
    // override and do nothing
  }

  onLegendBoxMouseOver(scatter, rect, datum) {
    // override and do nothing
  }

  onLegendBoxMouseOut(scatter, rect, datum) {
    // override and do nothing
  }
}
