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
