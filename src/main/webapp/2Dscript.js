// Global Variables

// Initial object that stores the generated 2D map, of @type{google.maps.Maps}.
let map;
// Store all information for every run (acts as cache), of @type{Run}
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
 * @typedef {Object<google.maps.Polyline, PoseData, HTMLElement> } Run
 * @property {google.maps.Polyline} map A map object that is placed on the 2D
 * map.
 * @property {PoseData} data A JSON object storing all the data for a specific
 * run.
 * @property {HTMLElement} checkBox A checkbox element for checking whether the
 * current run should be displayed without querying the DOM.
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
      .then((data) => runs[id].data = data)
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
  const initialPose = runs[id].data;
  const initialPoseMap = runs[id].map;
  if (initialPose === undefined) {
    return;
  }

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: initialPose[0].lat, lng: initialPose[0].lng},
    zoom: 18,
  });

  initialPoseMap = getPolyLine(formatPoseData(initialPose), '#FF0000', 1.0, 2);
  initialPoseMap.setMap(map);

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
}

/**
 * Changes the pose data to a format the Google maps javascript api can read.
 * @param {PoseData} pose Data to be converted from the PoseData format to a
 * simpler one.
 * @return { Array <Point> } Returns an array of Points.
 */
function formatPoseData(pose) {
  const poseCoordinates = [];
  for (point of pose) {
    poseCoordinates.push({lat: point.lat, lng: point.lng});
  }
  return poseCoordinates;
}


/**
 * Create a selection element containing a table which allows easy modification
 * of map data displayed.
 * @param {string} innerContent
 * @return {HTMLElement} sideControlDiv
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
  sideControlDiv.index = 1;

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
      /* This part won't compile and should be changed to new format in later
      commmit.*/
      const colorPickerEntry = document.createElement('td');
      const colorPicker = document.createElement('input');
      colorPicker.type = 'color';
      colorPicker.id = 'color_' + key;
      // Initialize each value to a random starting color.
      colorPicker.value = '#' + Math.floor(
          Math.random() * 16777215).toString(16);
      // Change the map graph color whenever a different color is selected.
      colorPicker.addEventListener('input', function(event) {
        const colorId = event.target.id;
        const runId = colorId.split('_')[1];
        console.log('Parsed run id is ' + runId);
        const checkboxValue = document.getElementById(runId).checked;
        // Only add the run if the checkbox is checked and we have selected a
        // new color.
        if (maps[runId] !== undefined && checkboxValue) {
          maps[runId].setMap(null);
          // Create plot with new color;
          maps[runId] = plotLine(datas[runId], event.target.value);
          maps[runId].setMap(map);
        }
      });
      colorPickerEntry.appendChild(colorPicker);

      const viewIconEntry = document.createElement('td');
      const viewIcon = document.createElement('div');
      viewIcon.id = 'view_' + key;
      viewIcon.innerHTML = '<i class=\'fa fa-eye\'></i>';
      viewIcon.addEventListener('click', function() {
        const viewId = this.id;  // eslint-disable-line
        const runId = viewId.split('_')[1];
        console.log('run id is ' + runId);
        // Get latlng of the current element if there is one.
        const checkbox = document.getElementById(runId).checked;
        console.log('The checkbox value is ' + checkbox);
        if (checkbox && datas[runId] !== undefined &&
          maps[runId] !== undefined) {
          // Set the new center to be the first latlng value fetched from the
          // data.
          const mapObject = datas[runId][0];
          map.setCenter({lat: mapObject.lat, lng: mapObject.lng});
        } else {
          // In this case the box has become unchecked. We want to remove this
          // graph. We can only remove this box if it has been generated before
          // and then can be removed appropriately.
          const toRemove = maps[event.target.id];
          if (toRemove) {
            toRemove.setMap(null);
          }
        }
      });
      viewIconEntry.appendChild(viewIcon);

      // Create the color picker element to add to the table. Change color of
      // the element (if it exists on its selection).
      const columnElements = [keyEntry, checkBoxEntry, colorPickerEntry];
      updateRow(currentRow, columnElements);
      table.appendChild(currentRow);

      table.appendChild(currentRow);
      console.log(currentRow);
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
    console.log('The value of dataentries is ' + dataEntries);
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
  headerRowText.foreach((headerName) => {
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
 * @return {HTMLElement}
 */
function generateCheckBoxEntry(runId) {
  const checkBoxEntry = document.createElement('td');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = runId;
  input.addEventListener('click', showPoseData);
  checkBoxEntry.appendChild(input);
  return checkBoxEntry;
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
  const color = document.getElementById('color_' +
    event.target.id).value;
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
  columnElements.foreach((currentElement) => currentRow.appendChild(currentElement));  // eslint-disable-line
}


/**
 * Generate a polyline from the given data points and return it.
 * @param {Array<Point>} dataEntries
 * @param {string} color
 * @return {google.maps.Polyline}
 */
function plotLine(dataEntries, color) {
  const currentLine = [];
  for (point of dataEntries) {
    currentLine.push({lat: point.lat, lng: point.lng});
  }
  console.log(currentLine);
  currentLineGraph = getPolyLine(currentLine, color, 1.0, 2);
  initialPoseData.setMap(null);
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
// The markers that are generated by selection window.
let markerBottom;
let markerTop;
// The part of the main path that is selected.
let subPath;
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
        }
      } else {
        // Place the box.
        if (event.which === LEFTCLICK) {
          if (isMouseDown) {
            placeRectangleEnd();
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
  isMouseDown = true;
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
  // Clear other paths. line minLatPoint lat , lng minLngPoint lat, lng
  const subSectionData = computeSubSection(currentRun.data,
      currentLat, priorLat, currentLng, priorLng);
  // Choose a subSectionNumber, implement differently in future pr.
  const subSectionNumber = 1;
  // Clear prior paths, only display newly selected ones.
  if (markerBottom !== undefined) {
    markerBottom.setMap(null);
  }
  if (markerTop !== undefined) {
    markerTop.setMap(null);
  }
  if (subPath !== undefined) {
    subPath.setMap(null);
  }
  subPath = getPolyLine(subLine, 'blue', 1.0, 2);
  // Setup event listener to show option for 3D window when polyline is clicked.
  google.maps.event.addListener(subPath, 'click', linkTo3D);
  subPath.setMap(map);
  markerBottom = genMarker(subSectionData.minLatPoint.lat,
      subSectionData.minLatPoint.lng);
  markerTop = genMarker(subSectionData.maxLngPoint.lat,
      subSectionData.maxLngPoint.lng);
  markerBottom.setMap(map);
  markerTop.setMap(map);

  sessionStorage.setItem(id + '_' + type + '_' + subSectionNumber,
      JSON.stringify(subLine));
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
 * @typedef {Object<Array<Point>, Point, Point>} subSectionData
 * @property {Array<Point>} subLine
 * @property {Point} minLatPoint
 * @property {Point} maxLngPoint
 */
/**
 * Compute the subsection of a line contained in a bounding rectangle.
 * @param {Array<Point>} pose
 * @param {number} currentLat
 * @param {number} priorLat
 * @param {number} currentLng
 * @param {number} priorLng
 * @return {subSectionData}
 */
function computeSubSection(pose, currentLat, priorLat, currentLng, priorLng) {
  const minLat = Math.min(currentLat, priorLat);
  const maxLat = Math.max(currentLat, priorLat);
  const minLng = Math.min(currentLng, priorLng);
  const maxLng = Math.max(currentLng, priorLng);
  console.log(pose);
  // Lat can be from [-90,90].
  let discoveredMinLat = 91;
  let discoveredMinLatPair = 181;
  // Lng can be from [-180,180].
  let discoveredMaxLng = -181;
  let discoveredMaxLngPair = -91;
  subLine = [];
  for (point of pose) {
    const loopLat = point.lat;
    const loopLng = point.lng;
    if (withinBound(minLat, maxLat, minLng, maxLng, loopLat, loopLng)) {
      // While iterating save the max and min lat, same for the lng.
      if (discoveredMinLat > loopLat) {
        discoveredMinLatPair = loopLng;
        discoveredMinLat = loopLat;
      }
      if (discoveredMaxLng < loopLng) {
        discoveredMaxLngPair = loopLat;
        discoveredMaxLng = loopLng;
      }
      subLine.push(pose[i]);
    }
  }
  const toReturn = {};
  toReturn.subLine = subLine;
  toReturn.minLatPoint = {lat: discoveredMinLat, lng: discoveredMinLatPair};
  toReturn.maxLngPoint = {lat: discoveredMaxLngPair, lng: discoveredMaxLng};
  return toReturn;
}

/**
 * Generate an info window to link to the 3D viewer.
 * @param {MouseEvent} event
 */
function linkTo3D(event) {
  const latLng = event.latLng;
  console.log('Polyline clicked at lat: ' + latLng.lat() +
    ' lng: ' + latLng.lng());
  infoWindow = new google.maps.InfoWindow({
    content: '<a href=/home.html?id=' + id + '&dataType=' +
      type + '&subSection=' + subSectionNumber +
      '&stored=true' + '> View in 3D </a>',
    position: latLng,
  });
  infoWindow.setMap(map);
}

/**
 * Check whether the given lat, lng is within the bounding rectangle.
 * @param {number} minLat
 * @param {number} maxLat
 * @param {number} minLng
 * @param {number} maxLng
 * @param {number} valLat
 * @param {number} valLng
 * @return {boolean}
 */
function withinBound(minLat, maxLat, minLng, maxLng, valLat, valLng) {
  if (valLat >= minLat && valLat <= maxLat &&
    valLng >= minLng && valLng <= maxLng) {
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
