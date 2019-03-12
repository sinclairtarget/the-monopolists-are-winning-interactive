export default class Dataset {
  constructor(data) {
    this.data = data;
  }

  sectors() {
    return this.data.sectors;
  }

  industries() {
    return this.data.industries;
  }
}
