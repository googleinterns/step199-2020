/* From stackoverflow post (Marcelo):
 https://stackoverflow.com/questions/12507274/how-to-get-bounds-of-a-google-static-map
 Like all stackoverflow posts this content is distributed under the
 Creative Commons Attribution-ShareAlike license:
 https://creativecommons.org/licenses/by-sa/4.0/,
 meaning that this material can be used for nany purpose, including commercial.
 */
const MERCATOR_RANGE = 256;

/**
 * Ensure value is within the indicated bounds.
 * @param {number} value
 * @param {number} optMin
 * @param {number} optMax
 * @return {number}
*/
function bound(value, optMin, optMax) {
  if (optMin != null) value = Math.max(value, optMin);
  if (optMax != null) value = Math.min(value, optMax);
  return value;
}

/**
 * Perform conversion.
 * @param {number} deg
 * @return {number}
 */
function degreesToRadians(deg) {
  return deg * (Math.PI / 180);
}
/**
 * Perform conversion.
 * @param {number} rad
 * @return {number}
 */
function radiansToDegrees(rad) {
  return rad / (Math.PI / 180);
}

/**
 * Initialize values to be used in bounds computation.
 */
function MercatorProjection() {
  this.pixelOrigin_ = new google.maps.Point(MERCATOR_RANGE / 2,
      MERCATOR_RANGE / 2);
  this.pixelsPerLonDegree_ = MERCATOR_RANGE / 360;
  this.pixelsPerLonRadian_ = MERCATOR_RANGE / (2 * Math.PI);
};

MercatorProjection.prototype.fromLatLngToPoint = function(latLng, optPoint) {
  const point = optPoint || new google.maps.Point(0, 0);

  const origin = this.pixelOrigin_;
  point.x = origin.x + latLng.lng() * this.pixelsPerLonDegree_;
  // NOTE(appleton): Truncating to 0.9999 effectively limits latitude to
  // 89.189.  This is about a third of a tile past the edge of the world tile.
  const siny = bound(Math.sin(degreesToRadians(latLng.lat())), -0.9999, 0.9999);
  point.y = origin.y + 0.5 * Math.log((1 + siny) /
    (1 - siny)) * -this.pixelsPerLonRadian_;
  return point;
};

MercatorProjection.prototype.fromPointToLatLng = function(point) {
  const me = this;

  const origin = me.pixelOrigin_;
  const lng = (point.x - origin.x) / me.pixelsPerLonDegree_;
  const latRadians = (point.y - origin.y) / -me.pixelsPerLonRadian_;
  const lat = radiansToDegrees(2 * Math.atan(
      Math.exp(latRadians)) - Math.PI / 2);
  return new google.maps.LatLng(lat, lng);
};
