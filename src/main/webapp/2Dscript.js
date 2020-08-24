// Global variables.
let map;
const mapCache = {};
const dataCache = {};
let pose;
let data;
let id;
let type;
let currentLat;
let currentLong;
let initialPoseData;

/**
 * A Pose data object containing all properties returned
 * from the requisite proto in the JSON format.
 * Position is given in WGS84 latitude, longitude, and altitude.
 * @typedef {Object<number, number, number, number,
 * number, number, number>} PoseData
 * @property {number} gpsTimestamp The time in seconds.
 * @property {number} lat Degrees in [-90, 90]
 * @property {number} lng Degrees in [-180, 180]
 * @property {number} alt Meters above WGS84
 * @property {number} rollDeg Degrees in [0,360]
 * @property {number} pitchDeg Degrees in [0,360]
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
      .then((data) => pose = data)
      .then(() => {
        return fetch('\data');
      })
      .then((response) => response.json())
      .then((json) => data = json)
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
  if (pose === undefined) {
    return;
  }

  console.log('initMap called');
  const poseCoordinates = [];
  for (let i = 0; i < pose.length; i++) {
    poseCoordinates.push({lat: pose[i].lat, lng: pose[i].lng});
  }

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: pose[0].lat, lng: pose[0].lng},
    zoom: 18,
  });

  initialPoseData = new google.maps.Polyline({
    path: formatPoseData(),
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2,
  });

  initialPoseData.setMap(map);


  const centerControlDiv = document.createElement('div');
  centerControl(centerControlDiv);
  centerControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

  // Add event listeners for selection box
  map.addListener('mousemove', function(event) {
    const latLng = event.latLng;
    currentLat = latLng.lat();
    currentLong = latLng.lng();
  });
  table = createSideTable(data);
  console.log(table);
  const sideControlDiv = document.createElement('div');
  selectionPane(sideControlDiv, table);
  console.log(sideControlDiv);
  sideControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(sideControlDiv);
}

/**
 * Changes the pose data to a format the Google maps javascript api can read.
 * @return { Array <Point> } Returns an array of Points.
 */
function formatPoseData() {
  const poseCoordinates = [];
  for (point of pose) {
    poseCoordinates.push({lat: point.lat, lng: point.lng});
  }
  return poseCoordinates;
}


/**
 * Create a selection element containing a table which allows easy modification
 * of map data displayed.
 * @param {HTMLElement} sideControlDiv
 * @param {string} innerContent
 */
function selectionPane(sideControlDiv, innerContent) {
  // Set CSS for the selection pane border.
  const selectionUI = document.createElement('div');
  selectionUI.className = 'selectionUI';
  selectionUI.title = 'Select the pose runs to view/render in 3D.';
  sideControlDiv.appendChild(selectionUI);

  // Set CSS for the selection pane interior.
  const selectionText = document.createElement('div');
  selectionText.className = 'selectionText';
  // Add table to the selection pane.
  selectionText.appendChild(innerContent);
  selectionUI.appendChild(selectionText);
}

/**
 * Creates the html elements inside of the button, along with adding a link to
 * the 3DVisual.html page.
 * @param {HTMLElement} controlDiv This is the main/parent element of the
 * button.
 */
function centerControl(controlDiv) {
  // Set CSS for the control border.
  const controlUI = document.createElement('div');
  controlUI.className = 'controlUI';
  controlUI.title = 'Click to switch to 3D visualization';
  controlDiv.appendChild(controlUI);

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
  const headerRowText = ['RunId', 'Select'];
  const headerRow = generateHeaderRow(headerRowText, table);
  table.appendChild(headerRow);
  // Set the first entry class of the table to be noneven as 1 is odd.
  let even = false;
  for (const key in json) {
    if (Object.prototype.hasOwnProperty.call(json, key)) {
      const currentRow = document.createElement('tr');
      currentRow.className = 'visible';
      // Change the class name if an even entry to properly adjust the styling.
      if (even) {
        currentRow.className += ' even';
      }
      const keyEntry = generateKeyEntry(key);
      const checkBoxEntry = generateCheckBoxEntry(key);

      const columnElements = [keyEntry, checkBoxEntry];
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
  // TODO(morleyd): Understand complaints about 'this' usage. I
  // am somewhat confused about when its appropriate to use 'this' in
  // Javascript vs in this case, event. The behavior often differs
  // from what I would expect, meaning my heuristic is likely wrong.
  const checked = this.checked; // eslint-disable-line
  const id = checkBoxElement.id;
  // Leave in this print for now as checkbox behavior was somewhat inconsistent
  // good to validate.
  console.log('The checkbox is ' + checked);
  if (checked) { // eslint-disable-line
    // First check the cache for this value.
    dataEntries = dataCache[id];
    console.log('The value of dataentries is ' + dataEntries);
    // If the value is not found in the cache then fetch it.
    if (dataEntries === undefined) {
      fetchAndGraphData(id);
    } else {
      // Still plot the line, doesn't need to be asynchronous.
      graphData(dataEntries, id);
    }
  } else {
    // In this case the box has become unchecked. We want to remove this
    // graph. We can only remove this box if it has been generated before
    // and then can be removed appropriately.
    const toRemove = mapCache[id];
    if (toRemove) {
      toRemove.setMap(null);
    }
  }
}

/**
 * Generates the header row of a table from an array
 * of column names.
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
 * Generate a checkbox with appropriate event listener
 * for insertion into a table.
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
 * Fetch the data and graph it. Necessary to include
 * the graphing in this method so the asynchronous nature
 * of the fetch operation isn't ignored.
 * @param {string} runId
 */
function fetchAndGraphData(runId) {
  fetch('/getrun?id=' + runId + '&dataType=pose')
      .then((response) => response.json())
      .then((data) => dataEntries = data).then(() => {
        dataCache[runId] = dataEntries;
        graphData(dataEntries, runId);
      });
}

/**
 * Create a line using the given data entries, plot it on
 * the map and save it to the cache.
 * @param {Array<PoseData>} dataEntries
 * @param {string} runId
 */
function graphData(dataEntries, runId) {
  const toGraph = plotLine(dataEntries);
  mapCache[runId] = toGraph;
  toGraph.setMap(map);
}

/**
 * Insert all the elements in the array into the current
 * table's row.
 * @param {HTMLElement} currentRow
 * @param {Array<string>} columnElements
 */
function updateRow(currentRow, columnElements) {
  columnElements.foreach((currentElement)  => currentRow.appendChild(currentElement));  // eslint-disable-line
}


/**
 * Generate a polyline from the given data points and return it.
 * @param {Array<Point>} dataEntries
 * @return {google.maps.Polyline}
 */
function plotLine(dataEntries) {
  const currentLine = [];
  for (let i = 0; i < dataEntries.length; i++) {
    currentLine.push({lat: dataEntries[i].lat, lng: dataEntries[i].lng});
  }
  console.log(currentLine);
  currentLineGraph = new google.maps.Polyline({
    path: currentLine,
    geodesic: true,
    strokeColor: 'blue',
    strokeOpacity: 1.0,
    strokeWeight: 2,
  });
  initialPoseData.setMap(null);
  console.log('The value of map is ' + map);
  return currentLineGraph;
}

// When finished drawing the box, instead of leaving the widget, create markers
// at the current lat and intersection with the line.
$(function() {
  let widget;
  let x;
  let y;
  let finX;
  let finY;
  let priorLat;
  let priorLng;
  let ismousedown = false;
  let markerBottom;
  let markerTop;
  let subPath;
  let infoWindow;

  $(document).on({
    mousedown: function(event) {
      console.log('event occurred');
      if (event.ctrlKey) {
        if (!ismousedown) {
          console.log('mousedown triggered');
          x = event.pageX;
          y = event.pageY;
          priorLat = currentLat;
          priorLng = currentLong;

          console.log('Remove widget');
          $('.widget').remove();
          $('body').append('<div class="widget" style="top:' +
            y + 'px; left: ' + x + 'px;"></div>');
          widget = $('.widget').last();
          ismousedown = true;
        }
        // Toggle the mouseDown state so same click used to set final.
      } else {
        // On the left click action.
        if (event.which === 1) {
          if (ismousedown) {
            $('.widget').remove();
            if (infoWindow !== undefined) {
              infoWindow.setMap(null);
            }
            console.log('Mousedown set to false');
            ismousedown = false;
            // Here check the intersection by looping over the current different
            // bounding rectangles and determining if they intersect. Assume
            // that the selection window doesn't contain any multiple parallel
            // lines for simplicity (only chooose to display top if this is the
            // case).
            const minLat = Math.min(currentLat, priorLat);
            const maxLat = Math.max(currentLat, priorLat);
            const minLng = Math.min(currentLong, priorLng);
            const maxLng = Math.max(currentLong, priorLng);
            const poseLength = pose.length;
            // Lat can be from [-90,90].
            let discoveredMinLat = 91;
            let discoveredMinLatPair = 181;
            // Lng can be from [-180,180].

            let discoveredMaxLng = -181;
            let discoveredMaxLngPair = -91;
            subLine = [];
            for (let i = 0; i < poseLength; i++) {
              const loopLat = pose[i].lat;
              const loopLng = pose[i].lng;
              if (withinBound(minLat, maxLat, minLng,
                  maxLng, loopLat, loopLng)) {
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

            // Clear prior markers/path if they exist.
            if (markerBottom !== undefined) {
              markerBottom.setMap(null);
            }
            if (markerTop !== undefined) {
              markerTop.setMap(null);
            }
            if (subPath !== undefined) {
              subPath.setMap(null);
            }
            const subSectionNumber = 1;
            //   const subLine2D = subLine.filter((inputArray) => ();
            // console.log(subLine2D); Can leave in extra parameters and that
            // has no effect on the graphing.
            subPath = new google.maps.Polyline({
              path: subLine,
              geodesic: true,
              strokeColor: 'blue',
              strokeOpacity: 1.0,
              strokeWeight: 2,
            });
            // Setup event listener to show option for 3D window when polyline
            // is clicked.
            google.maps.event.addListener(subPath, 'click', function(event) {
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
            },
            );

            subPath.setMap(map);

            markerBottom = new google.maps.Marker({
              position: {lat: discoveredMinLat, lng: discoveredMinLatPair},
              title: 'Lat: ' + discoveredMinLat +
                ' Lng: ' + discoveredMinLatPair,
            });
            markerTop = new google.maps.Marker({
              position: {lat: discoveredMaxLngPair, lng: discoveredMaxLng},
              title: 'Lat: ' + discoveredMaxLngPair +
                ' Lng: ' + discoveredMaxLng,
            });
            // At this point iterate through all the values to contruct a new
            // line with the appropriate markers.
            markerBottom.setMap(map);
            markerTop.setMap(map);
            // Constant to account for possibility of multiple subsections.

            sessionStorage.setItem(id + '_' + type + '_' +
              subSectionNumber, JSON.stringify(subLine));
          }
        }
      }
    },
    mousemove: function(event) {
      if (ismousedown === true) {
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
    },
  });
});

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
  if ((valLat >= minLat && valLat <= maxLat) &&
    (valLng >= minLng && valLng <= maxLng)) {
    return true;
  }
  return false;
}
