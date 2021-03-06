// Global Variables

// Initial object that stores the generated 2D map, of @type{google.maps.Maps}.
let map;
// Store all information for every run (acts as cache), of @type{Object<Run>}
const runs = {};
// Stores JSON response giving allRuns with their associated runIds.
let allRuns;

// Initial run parameters.
let id;
let type;

// Store for selection window, updated on each click.
let currentLat;
let currentLng;

/**
 * A Run object contains the given datapoints, line data, and checkbox
 * associated with a given run.
 * @typedef {Object<google.maps.Polyline, Array<PoseData>, HTMLElement, string,
 * google.maps.Marker, google.maps.Marker, Array<PoseData>,
 * google.maps.Polyline} Run
 * @property {google.maps.Polyline} map A map object that is placed on the 2D
 * map.
 * @property {Array<PoseData>} data A JSON object storing all the data for a
 * specific run.
 * @property {HTMLElement} checkBox A checkbox element for checking whether the
 * current run should be displayed without querying the DOM.
 * @property {string} color A color given in a valid HTML format.
 * @property {google.maps.Marker} markerBottom The bottom marker selected for a
 * run.
 * @property {google.maps.Marker} markerTop The top marker selected for a run.
 * @property {Array<PoseData>} subData The subset of data selected for a given
 * run.
 * @property {google.maps.Polyline} subSection The polyline for the subset of
 * data.
 */

/**
 * A Pose data object containing all properties returned from the requisite
 * proto in the JSON format. Position is given in WGS84 latitude, longitude, and
 * altitude.
 * @typedef {Object<number, number, number, number, number, number, number>}
 * PoseData
 * @property {number} gpsTimestamp The time in seconds.
 * @property {number} lat Degrees in [-90, 90]
 * @property {number} lng Degrees in [-180, 180]
 * @property {number} alt Meters above WGS84
 * @property {number} rollDeg Degrees in [0,360]
 * @property {number} pitchDeg Degrees in [-90,90]
 * @property {number} yawDeg Degrees in [0,360]
 */

/**
 * A Point object with a lat and lng.
 * @typedef {Object<number, number>} Point
 * @property {number} lat The lat of the point.
 * @property {number} lng The lng of the point.
 */

/**
 * A Types object which contains the different possible run types.
 * @typedef {Array<string>} Types
 */

// First function called, code execution starts here.
fetchData();
/**
 * Fetchs pose data from the RunInfo servlet, it is an asynchronous call
 * requiring initMap() to be called after the data is fully loaded.
 */
function fetchData() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  id = urlParams.get('id');
  type = urlParams.get('dataType');
  fetch('/getrun?id=' + id + '&dataType=' + type)
      .then((response) => response.json())
      .then((data) => {
        runs[id] = {};
        runs[id].data = data;
      })
      .then(() => {
        return fetch('\data');
      })
      .then((response) => response.json())
      .then((json) => allRuns = json)
      .then(() => {
        initMap();
      });
}

/**
 * Embeds the Google map interface within the html along with drawing the pose
 * trajectory and adding a button link.
 */
function initMap() {
  // Occurs when google map api calls all promises, which is getting this
  // function called somehow, according to stack trace.
  if (runs[id] === undefined) {
    return;
  }
  const initialPose = runs[id].data;

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: initialPose[0].lat, lng: initialPose[0].lng},
    zoom: 18,
  });


  const centerControlDiv = centerControl();
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

  // Add event listeners to record latitude and longitude globally for selection
  // box.
  map.addListener('mousemove', function(event) {
    const latLng = event.latLng;
    currentLat = latLng.lat();
    currentLng = latLng.lng();
  });

  table = createSideTable(allRuns);
  const sideControlDiv = selectionPane(table);
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(sideControlDiv);
  // Click the selected run.
  runs[id].checkBox.click();
}

/**
 * Create a selection element containing a table which allows easy modification
 * of map data displayed.
 * @param {string} innerContent
 * @return {HTMLElement}
 */
function selectionPane(innerContent) {
  // Set CSS for the selection pane border.
  const sideControlDiv = document.createElement('div');
  const selectionUI = document.createElement('div');
  selectionUI.className = 'selectionUI';
  selectionUI.title = 'Select the pose runs to view/render in 3D.';
  sideControlDiv.appendChild(selectionUI);
  sideControlDiv.index = 1;

  // Set CSS for the selection pane interior.
  const selectionText = document.createElement('div');
  selectionText.className = 'selectionText';
  // Add table to the selection pane.
  selectionText.appendChild(innerContent);
  selectionUI.appendChild(selectionText);
  return sideControlDiv;
}

/**
 * Creates the html elements inside of the button, along with adding a link to
 * the 3DVisual.html page. button.
 */
function centerControl() {
  // Set CSS for the control border.
  const controlDiv = document.createElement('div');
  const controlUI = document.createElement('div');
  controlUI.className = 'controlUI';
  controlUI.title = 'Click to switch to 3D visualization';
  controlDiv.appendChild(controlUI);
  controlDiv.index = 1;

  // Set CSS for the control interior.
  const controlText = document.createElement('div');
  controlText.className = 'controlText';
  controlText.textContent = 'Switch to 3D';
  controlUI.appendChild(controlText);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function() {
    window.location.href = '/3DVisual.html?id=' + id + '&dataType=' + type;
  });
}

/**
 * Create the table used in the sidebar, used to select and modify multiple data
 * runs.
 * @param {Object.<string, Types>} json
 * @return {HTMLElement}
 */
function createSideTable(json) {
  const table = document.createElement('table');
  const headerRowText = ['RunId', 'Select', 'Color', 'View'];
  const headerRow = generateHeaderRow(headerRowText, table);
  table.appendChild(headerRow);
  // Set the first entry class of the table to be noneven as 1 is odd.
  let even = false;
  for (const key in json) {
    if (Object.prototype.hasOwnProperty.call(json, key)) {
      runs[key] = {};
      const currentRow = document.createElement('tr');
      currentRow.className = 'visible';
      // Change the class name if an even entry to properly adjust the styling.
      if (even) {
        currentRow.className += ' even';
      }
      const keyEntry = generateKeyEntry(key);
      const checkBoxEntry = generateCheckBoxEntry(key);
      const colorPickerEntry = generateColorPickerEntry(key);
      const viewIconEntry = generateViewIcon(key);
      // Create the color picker element to add to the table. Change color of
      // the element (if it exists on its selection).


      const columnElements = [keyEntry, checkBoxEntry,
        colorPickerEntry, viewIconEntry];
      updateRow(currentRow, columnElements);
      table.appendChild(currentRow);

      // Toggle the value of even for every other row.
      even = !even;
    }
  }
  return table;
}
/**
 * Function to be called on a checkbox click events, attempts to grab data for
 * graphing from local cache. If the data can't be found it is fetched from the
 * corresponding servlet. Either way the data is then graphed on the map.
 * @param {MouseEvent} event
 */
function showPoseData(event) {
  const checkBoxElement = event.target;
  // TODO(morleyd): Understand complaints about 'this' usage. I am somewhat
  // confused about when its appropriate to use 'this' in Javascript vs in this
  // case, event. The behavior often differs from what I would expect, meaning
  // my heuristic is likely wrong.
  const checked = this.checked; // eslint-disable-line
  const id = checkBoxElement.id;
  // Leave in this print for now as checkbox behavior was somewhat inconsistent
  // good to validate.
  console.log('The checkbox is ' + checked);
  if (checked) { // eslint-disable-line
    // First check the cache for this value.
    dataEntries = runs[id].data;
    // If the value is not found in the cache then fetch it.
    if (dataEntries === undefined) {
      fetchAndGraphData(id);
    } else {
      // Still plot the line, doesn't need to be asynchronous.
      graphData(dataEntries, id);
    }
  } else {
    // In this case the box has become unchecked. We want to remove this graph.
    // We can only remove this box if it has been generated before and then can
    // be removed appropriately.
    const toRemove = runs[id].map;
    if (toRemove) {
      toRemove.setMap(null);
    }
  }
}

/**
 * Generates the header row of a table from an array of column names.
 * @param {Array<string>} headerRowText
 * @return {HTMLElement}
 */
function generateHeaderRow(headerRowText) {
  const headerRow = document.createElement('tr');
  headerRowText.forEach((headerName) => {
    const currentColumn = document.createElement('th');
    currentColumn.innerText = headerName;
    headerRow.appendChild(currentColumn);
  });
  return headerRow;
}
/**
 * Generates a table entry for displaying a runId.
 * @param {string} runId
 * @return {HTMLElement}
 */
function generateKeyEntry(runId) {
  const keyEntry = document.createElement('td');
  keyEntry.innerText = runId;
  return keyEntry;
}

/**
 * Generate a checkbox with appropriate event listener for insertion into a
 * table.
 * @param {string} runId
 * @return {Array<HTMLElement, HTMLElement>}
 */
function generateCheckBoxEntry(runId) {
  const checkBoxEntry = document.createElement('td');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = runId;
  input.addEventListener('click', showPoseData);
  checkBoxEntry.appendChild(input);
  console.log('The checkbox input is ' + input);
  runs[runId].checkBox = input;
  return checkBoxEntry;
}

/**
 * Generate a color selector with proper event listener for changing color of
 * map elements.
 * @param {string} runId
 * @return {Array<HTMLElement, HTMLElement>}
 */
function generateColorPickerEntry(runId) {
  const colorPickerEntry = document.createElement('td');
  const colorPicker = document.createElement('input');
  colorPicker.type = 'color';
  colorPicker.id = 'color_' + runId;
  // Initialize each value to a random starting color.
  colorPicker.value = '#' + Math.floor(
      Math.random() * 0xFFFFFF).toString(16);
  // Change the map graph color whenever a different color is selected.
  colorPicker.addEventListener('input', (event) => changeRunColor(event));
  colorPickerEntry.appendChild(colorPicker);
  runs[runId].color = colorPicker;
  return colorPickerEntry;
}
/**
 * Change the color for a given run when the colorPicker changes
 * value.
 * @param {MouseEvent} event
 */
function changeRunColor(event) {
  const colorId = event.target.id;
  const runId = colorId.split('_')[1];
  console.log('Parsed run id is ' + runId);
  const checkboxValue = runs[runId].checkBox.checked;
  // Only add the run if the checkbox is checked and we have selected a new
  // color.
  if (runs[runId].map !== undefined && checkboxValue) {
    runs[runId].map.setMap(null);
    // Create plot with new color;
    runs[runId].map = plotLine(runs[runId].data, runs[runId].color.value);
    runs[runId].map.setMap(map);
  }
}
/**
 * Generate a button to recenter the map on this current run.
 * @param {string} runId
 * @return {HTMLElement}
 */
function generateViewIcon(runId) {
  const viewIconEntry = document.createElement('td');
  const viewIcon = document.createElement('div');
  viewIcon.id = 'view_' + runId;
  viewIcon.innerHTML = '<i class=\'fa fa-eye\'></i>';
  viewIcon.addEventListener('click', function() {
    const viewId = this.id;  // eslint-disable-line
    const runId = viewId.split('_')[1];
    const isChecked = runs[runId].checkBox.checked;
    console.log('The checkbox value is ' + isChecked);
    if (isChecked && runs[runId].data !== undefined &&
      runs[runId].map !== undefined) {
      // Set the new center to be the first latlng value fetched from the data.
      const mapData = runs[runId].data[0];
      map.setCenter({lat: mapData.lat, lng: mapData.lng});
    } else {
      // In this case the box has become unchecked. We want to remove this
      // graph. We can only remove this box if it has been generated before and
      // then can be removed appropriately.
      const toRemove = runs[runId].map;
      if (toRemove) {
        toRemove.setMap(null);
      }
    }
  });
  viewIconEntry.appendChild(viewIcon);
  return viewIconEntry;
}
/**
 * Fetch the data and graph it. Necessary to include the graphing in this method
 * so the asynchronous nature of the fetch operation isn't ignored.
 * @param {string} runId
 */
function fetchAndGraphData(runId) {
  fetch('/getrun?id=' + runId + '&dataType=pose')
      .then((response) => response.json())
      .then((data) => dataEntries = data).then(() => {
        runs[runId].data = dataEntries;
        graphData(dataEntries, runId);
      });
}

/**
 * Create a line using the given data entries, plot it on the map and save it to
 * the cache.
 * @param {Array<PoseData>} dataEntries
 * @param {string} runId
 */
function graphData(dataEntries, runId) {
  const color = runs[runId].color.value;
  const toGraph = plotLine(dataEntries, color);
  runs[runId].map = toGraph;
  toGraph.setMap(map);
}

/**
 * Insert all the elements in the array into the current table's row.
 * @param {HTMLElement} currentRow
 * @param {Array<string>} columnElements
 */
function updateRow(currentRow, columnElements) {
  columnElements.forEach((currentElement) => currentRow.appendChild(currentElement));  // eslint-disable-line
}


/**
 * Generate a polyline from the given data points and return it.
 * @param {Array<Point>} dataEntries
 * @param {string} color
 * @return {google.maps.Polyline}
 */
function plotLine(dataEntries, color) {
  const currentLine = [];
  for (const point of dataEntries) {
    currentLine.push({lat: point.lat, lng: point.lng});
  }
  console.log(currentLine);
  currentLineGraph = getPolyLine(currentLine, color, 1.0, 2);
  return currentLineGraph;
}

// When finished drawing the box, instead of leaving the widget, create markers
// at the current lat and intersection with the line.
let widget;
// Initial x and y position from clicking.
let x;
let y;
// Final x and y position from selection rectangle.
let finX;
let finY;
// Initial lat and long from selection rectangle.
let priorLat;
let priorLng;
// Store whether or not selection has been clicked.
let isMouseDown = false;
let infoWindow;
const LEFTCLICK = 1;
$(function() {
  $(document).on({
    mousedown: function(event) {
      console.log('event occurred');
      // Inital selection to draw the box.
      if (event.ctrlKey) {
        if (!isMouseDown) {
          console.log('mousedown triggered');
          placeRectangleStart();
          isMouseDown = true;
        }
      } else {
        // Place the box.
        if (event.which === LEFTCLICK) {
          if (isMouseDown) {
            placeRectangleEnd();
            isMouseDown = false;
          }
        }
      }
    },
    mousemove: genChangingBox,
  });
});

/**
 * Locks the starting cursor when the user begins using the selection rectangle.
 */
function placeRectangleStart() {
  x = event.pageX;
  y = event.pageY;
  priorLat = currentLat;
  priorLng = currentLng;
  $('body').append('<div class="widget" style="top:' +
    y + 'px; left: ' + x + 'px;"></div>');
  widget = $('.widget').last();
}

/**
 * Finish placing the selection box, select the subsection within this region.
 */
function placeRectangleEnd() {
  $('.widget').remove();
  // Clear pop up window.
  if (infoWindow !== undefined) {
    infoWindow.setMap(null);
  }
  clearSelectedPaths(['subSection', 'markerBottom', 'markerTop']);
  // Clear other paths. line minLatPoint lat , lng minLngPoint lat, lng Iterate
  // over all data values here, need to find a way to check the checkbox value,
  // should likely store this in an object somewhere to prevent excess DOM
  // queries.
  const mapRuns = Object.entries(runs);
  const subSectionObject = {};
  for ([id, currentRun] of mapRuns) {
    if (currentRun.checkBox.checked) {
      generatedSelectedRegion(currentRun, currentLat,
          currentLng, priorLat, priorLng);

      if (currentRun.subData.length === 0) {
        continue;
      }
      generateSessionStorage(subSectionObject, currentRun, id);
    }
  }
}

/**
 * Grab the selected region and generate the necessary polylines and markers.
 * @param {Run} currentRun
 * @param {number} currentLat
 * @param {number} currentLng
 * @param {number} priorLat
 * @param {number} priorLng
 */
function generatedSelectedRegion(currentRun, currentLat,
    currentLng, priorLat, priorLng) {
  const subSectionData = computeSubSection(currentRun.data,
      currentLat, currentLng, priorLat, priorLng);
  currentRun.subData = subSectionData.subData;
  // Clear prior paths, only display newly selected ones.
  const subPath = getPolyLine(currentRun.subData, 'blue', 1.0, 2, 1000);
  // Setup event listener to show option for 3D window when polyline is clicked.
  currentRun.subSection = subPath;
  subPath.setMap(map);
  currentRun.markerBottom = genMarker(subSectionData.minLatPoint.lat,
      subSectionData.minLatPoint.lng);
  currentRun.markerTop = genMarker(subSectionData.maxLngPoint.lat,
      subSectionData.maxLngPoint.lng);
  showAll([currentRun.subSection, currentRun.markerBottom,
    currentRun.markerTop]);
}

/** Save the given value to sessionStorage.
 * @param {Array<Object<string, Array<PoseData>>>}  subSectionObject
 * @param {Run} currentRun
 * @param {string} id
 */
function generateSessionStorage(subSectionObject, currentRun, id) {
  subSectionObject[id] = {};
  subSectionObject[id].color = currentRun.color.value;
  subSectionObject[id].data = currentRun.subData;
  google.maps.event.addListener(currentRun.subSection,
      'click', (event) => createInfoWindow(event, subSectionObject));
}

/**
 * Create an info window with appropriate link to new page.
 * @param {MouseEvent} event
 * @param {Array<Object<string, Array<PoseData>>>} subSectionObject
 */
function createInfoWindow(event, subSectionObject) {
  console.log('subsection clicked');
  if (infoWindow !== undefined) {
    console.log('Remove the infoWindow');
    infoWindow.setMap(null);
  }

  const latLng = event.latLng;
  console.log('the latlng is' + latLng);

  const link = document.createElement('a');
  link.innerText = 'View in 3D';
  link.href = 'null';
  link.addEventListener('click', (event) => linkTo3D(event, subSectionObject));
  infoWindow = new google.maps.InfoWindow({
    content: link,
    position: {lat: latLng.lat(), lng: latLng.lng()},
  });
  infoWindow.setMap(map);
}


/**
 * Change the rectangle width to be match the current cursor position.
 * @param {MouseEvent} event
 */
function genChangingBox(event) {
  if (isMouseDown) {
    console.log('Set width triggered');
    finX = event.pageX;
    finY = event.pageY;
    widget.width(finX - x);
    widget.height(finY - y);
    widget.css({
      'width': (finX - x) + '!important',
      'height': (finY - y) + '!important',
      'display': 'block',
      'border': '2px dashed #ccc',
    });
  }
}

/**
 * Generate a Google maps marker at the given lat and long.
 * @param {number} latitude
 * @param {number} longitude
 * @return {google.maps.Marker}
 */
function genMarker(latitude, longitude) {
  const marker = new google.maps.Marker({
    position: {lat: latitude, lng: longitude},
    title: 'Lat: ' + latitude + ' Lng: ' + longitude,
  });
  return marker;
}


/**
 * Create a polyline from the given points with specified parameters.
 * @param {Point} linePoints
 * @param {string} color
 * @param {number} opacity
 * @param {number} weight
 * @param {number} index
 * @return {google.maps.Polyline}
 */
function getPolyLine(linePoints, color, opacity, weight, index = 1) {
  console.log('The color is ' + color);
  const polyLine = new google.maps.Polyline({
    path: linePoints,
    geodesic: true,
    strokeColor: color,
    strokeOpacity: opacity,
    strokeWeight: weight,
    zIndex: index,
  });
  return polyLine;
}
/**
 * Clear prior markers/path if they exist.
 * @param {Array<google.maps.Polyline | google.maps.InfoWindow |
 * google.maps.Marker>} pathArray
 */
function clearSelectedPaths(pathArray) {
  const objects = Object.values(runs);
  for (val of objects) {
    pathArray.forEach(function(current) {
      const property = val[current];
      if (property !== undefined) {
        property.setMap(null);
      }
    });
  }
}
/**
 * @typedef {Object<Array<Point>, Point, Point>} subSectionData
 * @property {Array<Point>} subData
 * @property {Point} minLatPoint
 * @property {Point} maxLngPoint
 */
/**
 * Compute the subsection of a line contained in a bounding rectangle.
 * @param {Array<Point>} pose
 * @param {number} currentLat
 * @param {number} currentLng
 * @param {number} priorLat
 * @param {number} priorLng
 * @return {subSectionData}
 */
function computeSubSection(pose, currentLat, currentLng, priorLat, priorLng) {
  const minLat = Math.min(currentLat, priorLat);
  const maxLat = Math.max(currentLat, priorLat);
  const minLng = Math.min(currentLng, priorLng);
  const maxLng = Math.max(currentLng, priorLng);
  // Lat can be from [-90,90].
  let discoveredMinLat = 91;
  let discoveredMinLatPair = 181;
  // Lng can be from [-180,180].
  let discoveredMaxLng = -181;
  let discoveredMaxLngPair = -91;
  subData = [];
  for (point of pose) {
    if (withinBound(minLat, maxLat, minLng, maxLng, point.lat, point.lng)) {
      // While iterating save the max and min lat, same for the lng.
      if (discoveredMinLat > point.lat) {
        discoveredMinLatPair = point.lng;
        discoveredMinLat = point.lat;
      }
      if (discoveredMaxLng < point.lng) {
        discoveredMaxLngPair = point.lat;
        discoveredMaxLng = point.lng;
      }
      subData.push(point);
    }
  }
  const toReturn = {};
  toReturn.subData = subData;
  toReturn.minLatPoint = {lat: discoveredMinLat, lng: discoveredMinLatPair};
  toReturn.maxLngPoint = {lat: discoveredMaxLngPair, lng: discoveredMaxLng};
  return toReturn;
}

/**
 * Generate an info window to link to the 3D viewer.
 * @param {MouseEvent} event
 * @param {Array<Object<string, Array<PoseData>>>} subSectionObject
 */
function linkTo3D(event, subSectionObject) { // eslint-disable-line
  event.preventDefault();
  sessionStorage.setItem('subsection',
      JSON.stringify(subSectionObject));
  window.location.href = '3DVisual.html?subsection=true';
}


/**
 * Check whether the given lat, lng is within the bounding rectangle.
 * @param {number} minLat
 * @param {number} maxLat
 * @param {number} minLng
 * @param {number} maxLng
 * @param {number} lat
 * @param {number} lng
 * @return {boolean}
 */
function withinBound(minLat, maxLat, minLng, maxLng, lat, lng) {
  if (lat >= minLat && lat <= maxLat &&
    lng >= minLng && lng <= maxLng) {
    return true;
  }
  return false;
}
/**
 * For each parameter, set its current map to be our base map.
 * @param {Array<google.map.InfoWindow | google.map.Marker |
 * google.map.Polyline>} elems
 */

function showAll(elems) {  // eslint-disable-line
  elems.forEach(function(current) {
    current.setMap(map);
  });
}
