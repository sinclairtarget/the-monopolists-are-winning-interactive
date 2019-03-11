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

    scatter.drawSectors(data, this.year);
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
}
