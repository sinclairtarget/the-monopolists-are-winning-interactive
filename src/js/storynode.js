export class StoryNode {
  constructor(nodeName) {
    this.nodeName = nodeName;
  }

  enter(dataset, scatter, dir) {
    console.log(`Enter ${this.nodeName} going ${dir}.`);
  }

  exit(dataset, scatter, dir) {
    console.log(`Exiting ${this.nodeName} going ${dir}.`);
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
    scatter.drawSectorTooltip(this.sectorId, this.year);
  }

  exit(dataset, scatter, dir) {
    super.exit(dataset, scatter, dir);
    scatter.hideTooltips();
  }
}
