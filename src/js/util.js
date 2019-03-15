export function transl(x, y) {
  return "translate(" + x + "," + y + ")";
}

export function rot(degrees, x, y) {
  return "rotate(" + degrees + "," + x + "," + y + ")";
}

// Gets value of key for appropriate year
export function k(obj, key, year) {
  return obj[key + "." + year];
}

// expects dollar value in thousands of dollars, prints $ bn
export function dollars(val) {
    let bn = val * 1000 / 1000000000;
    return `$${Math.round(bn * 10) / 10} bn`;
}

// returns the short name of the sector
export function shortName(sectorId) {
  let sectors = {
    22: "Utilities",
    42: "Wholesale Trade",
    51: "Information",
    52: "Finance and Insurance",
    53: "Real Estate",
    54: "Professional and Scientific",
    56: "Administrative Support",
    61: "Educational Services",
    62: "Health Care",
    71: "Arts and Entertainment",
    72: "Accommodation and Food",
    81: "Other Services"
  };

  return sectors[sectorId];
}

export function alphabetize(sectors) {
  return sectors.sort((a, b) => {
    let nameA = a["SECTOR.label"];
    let nameB = b["SECTOR.label"];

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
}
