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
